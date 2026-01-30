'use server'

/**
 * Content Pipeline - 批量导入服务
 * Story-044: Task B3 - 批量导入工具
 *
 * 实现从 PDF 上传到生成结构化题目的全自动处理流程
 * 流程: PDF → OCR → AI结构化 → 质量检查 → 保存入库
 */

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { ProcessingStatus, ContentStatus } from '@prisma/client'
import { OCRService } from '@/lib/content-pipeline/ocr-service'
import { AIStructurer } from '@/lib/content-pipeline/ai-structurer'
import { bulkCreateQuestions } from './question-service'
import { getCurrentUser } from '@/actions/auth'
import type {
  ImportFromPDFInput,
  ImportResult,
  ImportProgress,
  ImportOptions,
  ResumeFailedImportInput,
  CreateQuestionInput,
  ServiceResult,
  ImportStage
} from '@/lib/content-pipeline/types'
import type { OCRResult } from '@/lib/content-pipeline/ocr-types'
import {
  MAX_PAGES,
  DEFAULT_MAX_OCR_COST,
  extractFilename,
  createProgress,
  convertToCreateInput,
  calculateQualityScore
} from '@/lib/content-pipeline/import-utils'

// ==================== 主要导入函数 ====================

/**
 * 从 PDF 批量导入题目
 *
 * @param input 导入参数
 * @param options 导入配置选项
 * @returns 导入结果
 *
 * @example
 * ```typescript
 * const result = await importFromPDF({
 *   pdfUrl: 'https://storage.example.com/exam.pdf',
 *   subjectId: 'math-uuid',
 *   source: '2023年中考数学真题',
 *   sourceYear: 2023,
 * }, {
 *   onProgress: (progress) => console.log(progress.message),
 *   maxPages: 30,
 * })
 *
 * if (result.success) {
 *   console.log(`成功导入 ${result.questionsCreated} 道题目`)
 * }
 * ```
 */
export async function importFromPDF(
  input: ImportFromPDFInput,
  options?: ImportOptions
): Promise<ServiceResult<ImportResult>> {
  const startTime = Date.now()
  let ocrDuration = 0
  let structureDuration = 0
  let estimatedCost = 0

  // 进度回调封装
  const reportProgress = (progress: ImportProgress) => {
    if (options?.onProgress) {
      options.onProgress(progress)
    }
  }

  try {
    // ==================== 阶段 1: 初始化 ====================
    reportProgress(createProgress('INIT', '正在初始化导入任务...'))

    // 获取当前用户
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return {
        success: false,
        error: '用户未登录',
        code: 'UNAUTHORIZED',
      }
    }

    // 验证科目是否存在
    const subject = await prisma.subject.findUnique({
      where: { id: input.subjectId },
    })

    if (!subject) {
      return {
        success: false,
        error: `科目不存在: ${input.subjectId}`,
        code: 'INVALID_PDF',
      }
    }

    // ==================== 阶段 2: 创建源文件记录 ====================
    reportProgress(createProgress('UPLOADING', '正在创建源文件记录...'))

    const filename = extractFilename(input.pdfUrl)

    // 检查是否已存在相同文件
    const existingFile = await prisma.sourceFile.findFirst({
      where: {
        fileUrl: input.pdfUrl,
        status: { in: [ProcessingStatus.COMPLETED, ProcessingStatus.PROCESSING] },
      },
    })

    if (existingFile) {
      return {
        success: false,
        error: '该文件已经处理过或正在处理中',
        code: 'ALREADY_PROCESSED',
      }
    }

    // 创建源文件记录（使用当前登录用户 ID）
    const sourceFile = await prisma.sourceFile.create({
      data: {
        filename,
        fileUrl: input.pdfUrl,
        fileType: 'pdf',
        fileSize: 0, // TODO: 获取实际文件大小
        uploadedBy: currentUser.id,
        status: ProcessingStatus.PROCESSING,
        ocrStatus: ProcessingStatus.PENDING,
      },
    })

    try {
      // ==================== 阶段 3: OCR 处理 ====================
      reportProgress(createProgress('OCR_PROCESSING', '正在进行 OCR 识别...', { stageProgress: 0 }))

      const ocrStartTime = Date.now()

      // 更新 OCR 状态
      await prisma.sourceFile.update({
        where: { id: sourceFile.id },
        data: { ocrStatus: ProcessingStatus.PROCESSING },
      })

      // 初始化 OCR 服务
      const ocrService = new OCRService({
        debug: process.env.NODE_ENV === 'development',
        dailyCostLimit: options?.maxOcrCost ?? DEFAULT_MAX_OCR_COST,
        maxPagesPerRequest: options?.maxPages ?? MAX_PAGES,
      })

      // 处理文件（图片或 PDF）
      let ocrResults: OCRResult[]
      try {
        const fileExtension = input.pdfUrl.split('.').pop()?.toLowerCase()

        if (fileExtension === 'pdf') {
          // 暂不支持 PDF
          throw new Error(
            'PDF 文件暂不支持直接导入。请先将 PDF 转换为图片（JPG/PNG）后再上传。\n' +
            '提示：您可以使用截图工具或 PDF 转图片工具进行转换。'
          )
        } else {
          // 处理图片
          reportProgress(createProgress('OCR_PROCESSING', 'OCR 处理中...', { stageProgress: 50 }))

          const result = await ocrService.processImage(input.pdfUrl, {
            maxCost: options?.maxOcrCost ?? DEFAULT_MAX_OCR_COST,
          })

          ocrResults = [result]
        }
      } catch (ocrError) {
        // OCR 失败，更新状态
        await prisma.sourceFile.update({
          where: { id: sourceFile.id },
          data: {
            status: ProcessingStatus.FAILED,
            ocrStatus: ProcessingStatus.FAILED,
          },
        })

        throw ocrError
      }

      ocrDuration = Date.now() - ocrStartTime

      // 合并所有页面的文本
      const fullOcrText = ocrResults
        .filter((r) => r.success)
        .map((r) => r.text)
        .join('\n\n---PAGE BREAK---\n\n')

      // 计算平均置信度
      const avgConfidence =
        ocrResults.length > 0
          ? ocrResults.reduce((sum, r) => sum + (r.success ? r.confidence : 0), 0) / ocrResults.length
          : 0

      // 计算 OCR 成本
      estimatedCost = ocrResults.reduce((sum, r) => sum + r.estimatedCost, 0)

      // 更新源文件 OCR 结果
      await prisma.sourceFile.update({
        where: { id: sourceFile.id },
        data: {
          ocrStatus: ProcessingStatus.COMPLETED,
          ocrRawText: fullOcrText.substring(0, 100000), // 限制长度
        },
      })

      // 检查 OCR 结果
      if (!fullOcrText || fullOcrText.trim().length < 10) {
        await prisma.sourceFile.update({
          where: { id: sourceFile.id },
          data: { status: ProcessingStatus.FAILED },
        })

        return {
          success: false,
          error: 'OCR 未能识别出有效文本内容',
          code: 'OCR_FAILED',
        }
      }

      // ==================== 阶段 4: AI 结构化 ====================
      reportProgress(createProgress('STRUCTURING', '正在使用 AI 分析题目结构...'))

      const structureStartTime = Date.now()

      const aiStructurer = new AIStructurer()
      const structureResult = await aiStructurer.structureQuestions(fullOcrText, {
        subjectId: input.subjectId,
        source: input.source,
      })

      structureDuration = Date.now() - structureStartTime

      if (!structureResult.success || !structureResult.questions || structureResult.questions.length === 0) {
        await prisma.sourceFile.update({
          where: { id: sourceFile.id },
          data: { status: ProcessingStatus.FAILED },
        })

        return {
          success: false,
          error: structureResult.error || 'AI 未能从文本中提取出有效题目',
          code: 'STRUCTURE_FAILED',
        }
      }

      // ==================== 阶段 5: 质量检查 ====================
      if (!options?.skipQualityCheck) {
        reportProgress(createProgress('QUALITY_CHECK', '正在进行质量检查...'))
      }

      // 转换为创建输入并计算质量分数
      const questionsToCreate: CreateQuestionInput[] = structureResult.questions.map((q) => {
        const qualityScore = options?.skipQualityCheck ? undefined : calculateQualityScore(q)

        return convertToCreateInput(q, {
          chapterId: input.chapterId,
          groupId: input.groupId,
          ocrRawText: undefined, // 单个题目不保存 OCR 原文，源文件中已保存
          ocrConfidence: avgConfidence,
          qualityScore,
        })
      })

      // ==================== 阶段 6: 保存入库 ====================
      reportProgress(createProgress('SAVING', `正在保存 ${questionsToCreate.length} 道题目...`))

      const bulkResult = await bulkCreateQuestions({
        questions: questionsToCreate,
        sourceFileId: sourceFile.id,
        createdBy: currentUser.id,
      })

      // 统计结果
      const questionsCreated = bulkResult.results.filter((r) => r.success).length
      const questionsDuplicated = bulkResult.results.filter(
        (r) => !r.success && r.error?.includes('重复')
      ).length
      const questionsFailed = bulkResult.failed - questionsDuplicated
      const questionIds = bulkResult.results
        .filter((r) => r.success && r.data)
        .map((r) => r.data!.id)

      // 更新源文件状态
      await prisma.sourceFile.update({
        where: { id: sourceFile.id },
        data: {
          status: ProcessingStatus.COMPLETED,
          processedAt: new Date(),
        },
      })

      // ==================== 完成 ====================
      const totalDuration = Date.now() - startTime

      reportProgress(createProgress('COMPLETED', `导入完成，共 ${questionsCreated} 道题目`))

      revalidatePath('/admin/content')

      return {
        success: true,
        data: {
          success: true,
          sourceFileId: sourceFile.id,
          questionsCreated,
          questionsDuplicated,
          questionsFailed,
          questionIds,
          ocrDuration,
          structureDuration,
          totalDuration,
          estimatedCost,
        },
      }
    } catch (error) {
      // 处理失败，更新源文件状态
      await prisma.sourceFile.update({
        where: { id: sourceFile.id },
        data: { status: ProcessingStatus.FAILED },
      })

      throw error
    }
  } catch (error) {
    console.error('PDF 导入失败:', error)

    reportProgress(createProgress('FAILED', `导入失败: ${error instanceof Error ? error.message : '未知错误'}`))

    return {
      success: false,
      error: error instanceof Error ? error.message : '导入过程中发生未知错误',
      code: 'UNKNOWN_ERROR',
    }
  }
}

// ==================== 恢复失败导入 ====================

/**
 * 恢复失败的导入任务
 *
 * @param input 恢复参数
 * @param options 导入配置选项
 * @returns 导入结果
 *
 * @example
 * ```typescript
 * const result = await resumeFailedImport({
 *   sourceFileId: 'source-file-uuid',
 * })
 * ```
 */
export async function resumeFailedImport(
  input: ResumeFailedImportInput,
  options?: ImportOptions
): Promise<ServiceResult<ImportResult>> {
  // 查找源文件
  const sourceFile = await prisma.sourceFile.findUnique({
    where: { id: input.sourceFileId },
  })

  if (!sourceFile) {
    return {
      success: false,
      error: '源文件不存在',
      code: 'SOURCE_FILE_NOT_FOUND',
    }
  }

  // 只能恢复失败的任务
  if (sourceFile.status !== ProcessingStatus.FAILED) {
    return {
      success: false,
      error: `源文件状态为 ${sourceFile.status}，不是失败状态，无法恢复`,
      code: 'ALREADY_PROCESSED',
    }
  }

  // 确定从哪个阶段开始恢复
  let fromStage: ImportStage = input.fromStage || 'OCR_PROCESSING'

  // 如果 OCR 已完成，从结构化开始
  if (sourceFile.ocrStatus === ProcessingStatus.COMPLETED && sourceFile.ocrRawText) {
    fromStage = 'STRUCTURING'
  }

  // 重置状态
  await prisma.sourceFile.update({
    where: { id: sourceFile.id },
    data: {
      status: ProcessingStatus.PROCESSING,
      ...(fromStage === 'OCR_PROCESSING' && { ocrStatus: ProcessingStatus.PENDING }),
    },
  })

  // 如果需要从 OCR 开始，调用完整导入流程
  if (fromStage === 'OCR_PROCESSING') {
    // 获取原始科目 ID（从已关联的题目或使用传入的值）
    const existingQuestion = await prisma.question.findFirst({
      where: {
        sourceFiles: {
          some: { id: sourceFile.id },
        },
      },
      include: {
        chapter: true,
      },
    })

    const subjectId =
      input.subjectId ||
      existingQuestion?.chapter?.subjectId ||
      (await prisma.subject.findFirst())?.id

    if (!subjectId) {
      return {
        success: false,
        error: '无法确定科目 ID',
        code: 'INVALID_PDF',
      }
    }

    return importFromPDF(
      {
        pdfUrl: sourceFile.fileUrl,
        subjectId,
      },
      options
    )
  }

  // 从结构化阶段恢复
  if (fromStage === 'STRUCTURING' && sourceFile.ocrRawText) {
    return resumeFromStructuring(sourceFile.id, sourceFile.ocrRawText, input.subjectId, options)
  }

  return {
    success: false,
    error: '无法确定恢复点',
    code: 'UNKNOWN_ERROR',
  }
}

/**
 * 从结构化阶段恢复导入
 */
async function resumeFromStructuring(
  sourceFileId: string,
  ocrText: string,
  subjectId?: string,
  options?: ImportOptions
): Promise<ServiceResult<ImportResult>> {
  const startTime = Date.now()

  const reportProgress = (progress: ImportProgress) => {
    if (options?.onProgress) {
      options.onProgress(progress)
    }
  }

  try {
    // 获取科目 ID
    const finalSubjectId = subjectId || (await prisma.subject.findFirst())?.id

    if (!finalSubjectId) {
      return {
        success: false,
        error: '无法确定科目 ID',
        code: 'INVALID_PDF',
      }
    }

    // AI 结构化
    reportProgress(createProgress('STRUCTURING', '正在使用 AI 分析题目结构...'))

    const structureStartTime = Date.now()
    const aiStructurer = new AIStructurer()
    const structureResult = await aiStructurer.structureQuestions(ocrText, {
      subjectId: finalSubjectId,
    })

    const structureDuration = Date.now() - structureStartTime

    if (!structureResult.success || !structureResult.questions || structureResult.questions.length === 0) {
      await prisma.sourceFile.update({
        where: { id: sourceFileId },
        data: { status: ProcessingStatus.FAILED },
      })

      return {
        success: false,
        error: structureResult.error || 'AI 未能从文本中提取出有效题目',
        code: 'STRUCTURE_FAILED',
      }
    }

    // 质量检查
    if (!options?.skipQualityCheck) {
      reportProgress(createProgress('QUALITY_CHECK', '正在进行质量检查...'))
    }

    const questionsToCreate: CreateQuestionInput[] = structureResult.questions.map((q) => {
      const qualityScore = options?.skipQualityCheck ? undefined : calculateQualityScore(q)
      return convertToCreateInput(q, { qualityScore })
    })

    // 保存入库（使用当前登录用户 ID）
    // 注意：currentUser 已在函数开头获取
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return {
        success: false,
        error: '用户未登录',
        code: 'UNAUTHORIZED',
      }
    }

    reportProgress(createProgress('SAVING', `正在保存 ${questionsToCreate.length} 道题目...`))

    const bulkResult = await bulkCreateQuestions({
      questions: questionsToCreate,
      sourceFileId,
      createdBy: currentUser.id,
    })

    // 统计结果
    const questionsCreated = bulkResult.results.filter((r) => r.success).length
    const questionsDuplicated = bulkResult.results.filter(
      (r) => !r.success && r.error?.includes('重复')
    ).length
    const questionsFailed = bulkResult.failed - questionsDuplicated
    const questionIds = bulkResult.results
      .filter((r) => r.success && r.data)
      .map((r) => r.data!.id)

    // 更新源文件状态
    await prisma.sourceFile.update({
      where: { id: sourceFileId },
      data: {
        status: ProcessingStatus.COMPLETED,
        processedAt: new Date(),
      },
    })

    const totalDuration = Date.now() - startTime

    reportProgress(createProgress('COMPLETED', `导入完成，共 ${questionsCreated} 道题目`))

    revalidatePath('/admin/content')

    return {
      success: true,
      data: {
        success: true,
        sourceFileId,
        questionsCreated,
        questionsDuplicated,
        questionsFailed,
        questionIds,
        ocrDuration: 0, // 从结构化恢复，没有 OCR 耗时
        structureDuration,
        totalDuration,
        estimatedCost: 0, // 从结构化恢复，没有 OCR 成本
      },
    }
  } catch (error) {
    console.error('从结构化阶段恢复失败:', error)

    await prisma.sourceFile.update({
      where: { id: sourceFileId },
      data: { status: ProcessingStatus.FAILED },
    })

    return {
      success: false,
      error: error instanceof Error ? error.message : '恢复过程中发生未知错误',
      code: 'UNKNOWN_ERROR',
    }
  }
}

// ==================== 查询函数 ====================

/**
 * 获取导入任务列表
 */
export async function getImportTasks(options?: {
  status?: ProcessingStatus
  limit?: number
  offset?: number
}): Promise<
  ServiceResult<{
    tasks: Array<{
      id: string
      filename: string
      fileUrl: string
      status: ProcessingStatus
      ocrStatus: ProcessingStatus
      questionsCount: number
      createdAt: Date
      processedAt: Date | null
    }>
    total: number
  }>
> {
  try {
    const where = options?.status ? { status: options.status } : {}

    const [tasks, total] = await prisma.$transaction([
      prisma.sourceFile.findMany({
        where,
        include: {
          _count: {
            select: { questions: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: options?.limit ?? 20,
        skip: options?.offset ?? 0,
      }),
      prisma.sourceFile.count({ where }),
    ])

    return {
      success: true,
      data: {
        tasks: tasks.map((t) => ({
          id: t.id,
          filename: t.filename,
          fileUrl: t.fileUrl,
          status: t.status,
          ocrStatus: t.ocrStatus,
          questionsCount: t._count.questions,
          createdAt: t.createdAt,
          processedAt: t.processedAt,
        })),
        total,
      },
    }
  } catch (error) {
    console.error('获取导入任务列表失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取失败',
      code: 'FETCH_FAILED',
    }
  }
}

/**
 * 获取单个导入任务详情
 */
export async function getImportTaskDetail(sourceFileId: string): Promise<
  ServiceResult<{
    sourceFile: {
      id: string
      filename: string
      fileUrl: string
      fileType: string
      fileSize: number
      status: ProcessingStatus
      ocrStatus: ProcessingStatus
      ocrRawText: string | null
      createdAt: Date
      processedAt: Date | null
    }
    questions: Array<{
      id: string
      content: string
      type: string
      status: ContentStatus
      qualityScore: number | null
    }>
    stats: {
      totalQuestions: number
      draftCount: number
      pendingCount: number
      publishedCount: number
    }
  }>
> {
  try {
    const sourceFile = await prisma.sourceFile.findUnique({
      where: { id: sourceFileId },
      include: {
        questions: {
          select: {
            id: true,
            content: true,
            type: true,
            status: true,
            qualityScore: true,
          },
        },
      },
    })

    if (!sourceFile) {
      return {
        success: false,
        error: '源文件不存在',
        code: 'NOT_FOUND',
      }
    }

    const stats = {
      totalQuestions: sourceFile.questions.length,
      draftCount: sourceFile.questions.filter((q) => q.status === ContentStatus.DRAFT).length,
      pendingCount: sourceFile.questions.filter((q) => q.status === ContentStatus.REVIEW_PENDING).length,
      publishedCount: sourceFile.questions.filter((q) => q.status === ContentStatus.PUBLISHED).length,
    }

    return {
      success: true,
      data: {
        sourceFile: {
          id: sourceFile.id,
          filename: sourceFile.filename,
          fileUrl: sourceFile.fileUrl,
          fileType: sourceFile.fileType,
          fileSize: sourceFile.fileSize,
          status: sourceFile.status,
          ocrStatus: sourceFile.ocrStatus,
          ocrRawText: sourceFile.ocrRawText,
          createdAt: sourceFile.createdAt,
          processedAt: sourceFile.processedAt,
        },
        questions: sourceFile.questions,
        stats,
      },
    }
  } catch (error) {
    console.error('获取导入任务详情失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取失败',
      code: 'FETCH_FAILED',
    }
  }
}

/**
 * 删除导入任务及关联的题目
 */
export async function deleteImportTask(
  sourceFileId: string,
  options?: { deleteQuestions?: boolean }
): Promise<ServiceResult<{ deleted: boolean; questionsDeleted: number }>> {
  try {
    const sourceFile = await prisma.sourceFile.findUnique({
      where: { id: sourceFileId },
      include: {
        _count: { select: { questions: true } },
      },
    })

    if (!sourceFile) {
      return {
        success: false,
        error: '源文件不存在',
        code: 'NOT_FOUND',
      }
    }

    let questionsDeleted = 0

    // 如果需要删除关联题目
    if (options?.deleteQuestions) {
      const result = await prisma.question.deleteMany({
        where: {
          sourceFiles: {
            some: { id: sourceFileId },
          },
        },
      })
      questionsDeleted = result.count
    }

    // 删除源文件
    await prisma.sourceFile.delete({
      where: { id: sourceFileId },
    })

    revalidatePath('/admin/content')

    return {
      success: true,
      data: {
        deleted: true,
        questionsDeleted,
      },
    }
  } catch (error) {
    console.error('删除导入任务失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '删除失败',
      code: 'DELETE_FAILED',
    }
  }
}
