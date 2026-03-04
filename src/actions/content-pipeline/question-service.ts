'use server'

/**
 * Content Pipeline - 题目服务
 * Story-044: 题目全生命周期管理与数据结构
 *
 * 提供题目的 CRUD 操作和状态管理
 */

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { ContentStatus, QuestionType, ReviewAction, ReportStatus, Prisma } from '@prisma/client'
import type {
  CreateQuestionInput,
  UpdateQuestionInput,
  BulkCreateQuestionsInput,
  UpdateStatusInput,
  BulkUpdateStatusInput,
  QuestionFilter,
  QuestionSortOptions,
  PaginationParams,
  PaginatedResult,
  QuestionWithRelations,
  ServiceResult,
  BulkOperationResult,
  CreateReportInput,
  ResolveReportInput,
  ReportFilter,
  StatusTransitionResult,
  JsonValue,
} from '@/lib/content-pipeline/types'
import { createHash } from 'crypto'

// ==================== 内容哈希生成 ====================

/**
 * 生成题目内容哈希（用于去重检测）
 * @param content 题目内容
 * @param type 题目类型
 * @param answer 答案
 * @returns MD5 哈希字符串
 */
export async function generateContentHash(
  content: string,
  type: QuestionType,
  answer: Prisma.InputJsonValue | JsonValue
): Promise<string> {
  const normalized = [
    content.trim().toLowerCase(),
    type,
    JSON.stringify(answer),
  ].join('|')

  return createHash('md5').update(normalized).digest('hex')
}

// ==================== 状态转换验证 ====================

/**
 * 状态转换规则映射
 * 定义每个状态可以转换到哪些状态
 */
const STATUS_TRANSITIONS: Record<ContentStatus, ContentStatus[]> = {
  DRAFT: ['OCR_PROCESSING', 'STRUCTURING', 'REVIEW_PENDING', 'ARCHIVED'],
  OCR_PROCESSING: ['OCR_COMPLETED', 'DRAFT'],
  OCR_COMPLETED: ['STRUCTURING', 'REVIEW_PENDING', 'DRAFT'],
  STRUCTURING: ['REVIEW_PENDING', 'DRAFT'],
  REVIEW_PENDING: ['VERIFIED', 'REVIEW_REJECTED', 'DRAFT'],
  REVIEW_REJECTED: ['DRAFT', 'REVIEW_PENDING', 'ARCHIVED'],
  VERIFIED: ['PUBLISHED', 'REVIEW_PENDING', 'ARCHIVED'],
  PUBLISHED: ['ARCHIVED', 'VERIFIED'],
  ARCHIVED: ['DRAFT'],
}

/**
 * 验证状态转换是否合法
 * @param fromStatus 当前状态
 * @param toStatus 目标状态
 * @returns 验证结果
 */
export async function validateStatusTransition(
  fromStatus: ContentStatus,
  toStatus: ContentStatus
): Promise<StatusTransitionResult> {
  const allowedNextStatuses = STATUS_TRANSITIONS[fromStatus] || []

  if (allowedNextStatuses.includes(toStatus)) {
    return {
      valid: true,
      allowedNextStatuses,
    }
  }

  return {
    valid: false,
    error: `不允许从 ${fromStatus} 转换到 ${toStatus}`,
    allowedNextStatuses,
  }
}

// ==================== 题目 CRUD ====================

/**
 * 创建单个题目（草稿状态）
 * @param data 题目数据
 * @returns 创建结果
 */
export async function createQuestion(
  data: CreateQuestionInput
): Promise<ServiceResult<QuestionWithRelations>> {
  try {
    // 生成内容哈希
    const contentHash = await generateContentHash(data.content, data.type, data.answer)

    // 检查是否重复
    const existing = await prisma.question.findUnique({
      where: { contentHash },
    })

    if (existing) {
      return {
        success: false,
        error: '题目已存在（内容重复）',
        code: 'DUPLICATE_CONTENT',
      }
    }

    const question = await prisma.question.create({
      data: {
        content: data.content,
        type: data.type,
        difficulty: data.difficulty ?? 3,
        options: data.options ?? undefined,
        answer: data.answer as Prisma.InputJsonValue,
        explanation: data.explanation,
        chapterId: data.chapterId,
        groupId: data.groupId,
        ocrRawText: data.ocrRawText,
        ocrConfidence: data.ocrConfidence,
        contentHash,
        qualityScore: data.qualityScore,
        status: ContentStatus.DRAFT,
        createdBy: data.createdBy,
      },
      include: {
        chapter: true,
        group: true,
        tags: { include: { tag: true } },
        knowledgePoints: { include: { kp: true } },
      },
    })

    revalidatePath('/admin/content/review')

    return {
      success: true,
      data: question as QuestionWithRelations,
    }
  } catch (error) {
    console.error('创建题目失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '创建题目失败',
      code: 'CREATE_FAILED',
    }
  }
}

/**
 * 批量创建题目
 * @param input 批量创建输入
 * @returns 批量操作结果
 */
export async function bulkCreateQuestions(
  input: BulkCreateQuestionsInput
): Promise<BulkOperationResult<QuestionWithRelations>> {
  const results: BulkOperationResult<QuestionWithRelations>['results'] = []
  let succeeded = 0
  let failed = 0

  for (let i = 0; i < input.questions.length; i++) {
    const questionData = input.questions[i]

    try {
      const contentHash = await generateContentHash(
        questionData.content,
        questionData.type,
        questionData.answer
      )

      // 检查重复
      const existing = await prisma.question.findUnique({
        where: { contentHash },
      })

      if (existing) {
        results.push({
          index: i,
          success: false,
          error: '题目已存在（内容重复）',
        })
        failed++
        continue
      }

      const question = await prisma.question.create({
        data: {
          content: questionData.content,
          type: questionData.type,
          difficulty: questionData.difficulty ?? 3,
          options: questionData.options ?? undefined,
          answer: questionData.answer as Prisma.InputJsonValue,
          explanation: questionData.explanation,
          chapterId: questionData.chapterId,
          groupId: input.groupId ?? questionData.groupId,
          ocrRawText: questionData.ocrRawText,
          ocrConfidence: questionData.ocrConfidence,
          contentHash,
          qualityScore: questionData.qualityScore,
          status: ContentStatus.DRAFT,
          createdBy: input.createdBy ?? questionData.createdBy,
          // 如果有源文件，建立关联
          ...(input.sourceFileId && {
            sourceFiles: {
              connect: { id: input.sourceFileId },
            },
          }),
        },
        include: {
          chapter: true,
          group: true,
        },
      })

      results.push({
        index: i,
        success: true,
        data: question as QuestionWithRelations,
      })
      succeeded++
    } catch (error) {
      results.push({
        index: i,
        success: false,
        error: error instanceof Error ? error.message : '创建失败',
      })
      failed++
    }
  }

  revalidatePath('/admin/content/review')

  return {
    success: failed === 0,
    total: input.questions.length,
    succeeded,
    failed,
    results,
  }
}

/**
 * 更新题目状态（含审核日志）
 * @param input 状态更新输入
 * @returns 更新结果
 */
export async function updateQuestionStatus(
  input: UpdateStatusInput
): Promise<ServiceResult<QuestionWithRelations>> {
  try {
    // 获取当前题目
    const currentQuestion = await prisma.question.findUnique({
      where: { id: input.questionId },
    })

    if (!currentQuestion) {
      return {
        success: false,
        error: '题目不存在',
        code: 'NOT_FOUND',
      }
    }

    // 验证状态转换
    const transitionResult = await validateStatusTransition(
      currentQuestion.status,
      input.newStatus
    )

    if (!transitionResult.valid) {
      return {
        success: false,
        error: transitionResult.error,
        code: 'INVALID_TRANSITION',
      }
    }

    // 确定审核操作类型
    let action: ReviewAction = ReviewAction.SUBMIT_REVIEW
    if (input.newStatus === ContentStatus.VERIFIED) {
      action = ReviewAction.APPROVE
    } else if (input.newStatus === ContentStatus.REVIEW_REJECTED) {
      action = ReviewAction.REJECT
    } else if (input.newStatus === ContentStatus.PUBLISHED) {
      action = ReviewAction.PUBLISH
    } else if (input.newStatus === ContentStatus.ARCHIVED) {
      action = ReviewAction.ARCHIVE
    }

    // 使用事务更新状态并记录日志
    const [updatedQuestion] = await prisma.$transaction([
      prisma.question.update({
        where: { id: input.questionId },
        data: {
          status: input.newStatus,
          reviewedBy: input.reviewerId,
          reviewedAt: new Date(),
          ...(input.newStatus === ContentStatus.PUBLISHED && {
            publishedBy: input.reviewerId,
            publishedAt: new Date(),
          }),
        },
        include: {
          chapter: true,
          group: true,
          tags: { include: { tag: true } },
          knowledgePoints: { include: { kp: true } },
        },
      }),
      prisma.contentReviewLog.create({
        data: {
          contentType: 'question',
          contentId: input.questionId,
          action,
          fromStatus: currentQuestion.status,
          toStatus: input.newStatus,
          reviewerId: input.reviewerId,
          comment: input.comment,
          changes: input.changes as object | undefined,
        },
      }),
    ])

    revalidatePath('/admin/content/review')

    return {
      success: true,
      data: updatedQuestion as QuestionWithRelations,
    }
  } catch (error) {
    console.error('更新题目状态失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '更新状态失败',
      code: 'UPDATE_FAILED',
    }
  }
}

/**
 * 批量更新题目状态
 * @param input 批量状态更新输入
 * @returns 批量操作结果
 */
export async function bulkUpdateQuestionStatus(
  input: BulkUpdateStatusInput
): Promise<BulkOperationResult<QuestionWithRelations>> {
  const results: BulkOperationResult<QuestionWithRelations>['results'] = []
  let succeeded = 0
  let failed = 0

  for (let i = 0; i < input.questionIds.length; i++) {
    const questionId = input.questionIds[i]

    const result = await updateQuestionStatus({
      questionId,
      newStatus: input.newStatus,
      reviewerId: input.reviewerId,
      comment: input.comment,
    })

    if (result.success) {
      results.push({
        index: i,
        success: true,
        data: result.data,
      })
      succeeded++
    } else {
      results.push({
        index: i,
        success: false,
        error: result.error,
      })
      failed++
    }
  }

  return {
    success: failed === 0,
    total: input.questionIds.length,
    succeeded,
    failed,
    results,
  }
}

/**
 * 查询待审核题目（分页）
 * @param params 分页参数
 * @param filter 过滤条件
 * @param sort 排序选项
 * @returns 分页结果
 */
export async function getPendingReviewQuestions(
  params: PaginationParams = {},
  filter: QuestionFilter = {},
  sort: QuestionSortOptions = { field: 'createdAt', order: 'desc' }
): Promise<PaginatedResult<QuestionWithRelations>> {
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 20
  const skip = (page - 1) * pageSize

  // 构建 where 条件
  const where: Record<string, unknown> = {
    status: ContentStatus.REVIEW_PENDING,
  }

  if (filter.type) {
    where.type = Array.isArray(filter.type) ? { in: filter.type } : filter.type
  }

  if (filter.difficulty) {
    if (typeof filter.difficulty === 'number') {
      where.difficulty = filter.difficulty
    } else {
      where.difficulty = {
        ...(filter.difficulty.min !== undefined && { gte: filter.difficulty.min }),
        ...(filter.difficulty.max !== undefined && { lte: filter.difficulty.max }),
      }
    }
  }

  if (filter.chapterId) {
    where.chapterId = filter.chapterId
  }

  if (filter.subjectId) {
    where.chapter = { subjectId: filter.subjectId }
  }

  if (filter.groupId) {
    where.groupId = filter.groupId
  }

  if (filter.hasGroup !== undefined) {
    where.groupId = filter.hasGroup ? { not: null } : null
  }

  if (filter.searchText) {
    where.content = { contains: filter.searchText, mode: 'insensitive' }
  }

  if (filter.createdBy) {
    where.createdBy = filter.createdBy
  }

  if (filter.createdAfter || filter.createdBefore) {
    where.createdAt = {
      ...(filter.createdAfter && { gte: filter.createdAfter }),
      ...(filter.createdBefore && { lte: filter.createdBefore }),
    }
  }

  // 查询总数
  const total = await prisma.question.count({ where })

  // 查询数据
  const data = await prisma.question.findMany({
    where,
    include: {
      chapter: true,
      group: true,
      tags: { include: { tag: true } },
      knowledgePoints: { include: { kp: true } },
      sourceFiles: true,
    },
    orderBy: { [sort.field]: sort.order },
    skip,
    take: pageSize,
  })

  const totalPages = Math.ceil(total / pageSize)

  return {
    data: data as QuestionWithRelations[],
    total,
    page,
    pageSize,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}

/**
 * 根据 ID 获取题目详情
 * @param id 题目 ID
 * @returns 题目详情
 */
export async function getQuestionById(
  id: string
): Promise<ServiceResult<QuestionWithRelations>> {
  try {
    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        chapter: true,
        group: {
          include: {
            subject: true,
          },
        },
        tags: { include: { tag: true } },
        knowledgePoints: { include: { kp: true } },
        sourceFiles: true,
      },
    })

    if (!question) {
      return {
        success: false,
        error: '题目不存在',
        code: 'NOT_FOUND',
      }
    }

    return {
      success: true,
      data: question as QuestionWithRelations,
    }
  } catch (error) {
    console.error('获取题目详情失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取失败',
      code: 'FETCH_FAILED',
    }
  }
}

/**
 * 删除题目（软删除 - 归档）
 * @param id 题目 ID
 * @param operatorId 操作者 ID（可选，后续集成认证时传入）
 * @param options 删除选项
 * @returns 删除结果
 */
export async function deleteQuestion(
  id: string,
  operatorId?: string,
  options?: { hardDelete?: boolean; comment?: string }
): Promise<ServiceResult<{ archived: boolean }>> {
  try {
    const question = await prisma.question.findUnique({
      where: { id },
    })

    if (!question) {
      return {
        success: false,
        error: '题目不存在',
        code: 'NOT_FOUND',
      }
    }

    // 检查是否可以归档（已发布的题目不能直接删除，需要先下架）
    if (question.status === ContentStatus.PUBLISHED && !options?.hardDelete) {
      return {
        success: false,
        error: '已发布的题目不能直接删除，请先下架（设为 VERIFIED 状态）',
        code: 'CANNOT_DELETE_PUBLISHED',
      }
    }

    // 硬删除（仅限管理员，谨慎使用）
    if (options?.hardDelete) {
      await prisma.question.delete({
        where: { id },
      })

      revalidatePath('/admin/content/review')

      return {
        success: true,
        data: { archived: false },
      }
    }

    // 软删除：将状态改为 ARCHIVED
    const transitionResult = await validateStatusTransition(question.status, ContentStatus.ARCHIVED)

    if (!transitionResult.valid) {
      // 如果当前状态不允许直接归档，先尝试转为 DRAFT
      if (question.status !== ContentStatus.DRAFT) {
        await prisma.question.update({
          where: { id },
          data: { status: ContentStatus.DRAFT },
        })
      }
    }

    // 使用事务归档并记录日志
    await prisma.$transaction([
      prisma.question.update({
        where: { id },
        data: { status: ContentStatus.ARCHIVED },
      }),
      ...(operatorId
        ? [
            prisma.contentReviewLog.create({
              data: {
                contentType: 'question',
                contentId: id,
                action: ReviewAction.ARCHIVE,
                fromStatus: question.status,
                toStatus: ContentStatus.ARCHIVED,
                reviewerId: operatorId,
                comment: options?.comment ?? '题目已归档',
              },
            }),
          ]
        : []),
    ])

    revalidatePath('/admin/content/review')

    return {
      success: true,
      data: { archived: true },
    }
  } catch (error) {
    console.error('删除题目失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '删除失败',
      code: 'DELETE_FAILED',
    }
  }
}

/**
 * 更新题目内容
 * @param id 题目 ID
 * @param data 更新数据
 * @returns 更新结果
 */
export async function updateQuestion(
  id: string,
  data: UpdateQuestionInput
): Promise<ServiceResult<QuestionWithRelations>> {
  try {
    // 获取当前题目
    const currentQuestion = await prisma.question.findUnique({
      where: { id },
    })

    if (!currentQuestion) {
      return {
        success: false,
        error: '题目不存在',
        code: 'NOT_FOUND',
      }
    }

    // 如果内容或答案改变，重新计算哈希
    let contentHash = currentQuestion.contentHash
    if (data.content || data.type || data.answer) {
      contentHash = await generateContentHash(
        data.content ?? currentQuestion.content,
        data.type ?? currentQuestion.type,
        (data.answer ?? currentQuestion.answer) as JsonValue
      )

      // 检查新哈希是否与其他题目重复
      const existing = await prisma.question.findFirst({
        where: {
          contentHash,
          id: { not: id },
        },
      })

      if (existing) {
        return {
          success: false,
          error: '更新后的内容与其他题目重复',
          code: 'DUPLICATE_CONTENT',
        }
      }
    }

    const question = await prisma.question.update({
      where: { id },
      data: {
        ...(data.content !== undefined && { content: data.content }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.difficulty !== undefined && { difficulty: data.difficulty }),
        ...(data.options !== undefined && { options: data.options ?? Prisma.JsonNull }),
        ...(data.answer !== undefined && { answer: data.answer as Prisma.InputJsonValue }),
        ...(data.explanation !== undefined && { explanation: data.explanation }),
        ...(data.chapterId !== undefined && { chapterId: data.chapterId }),
        ...(data.groupId !== undefined && { groupId: data.groupId }),
        ...(data.qualityScore !== undefined && { qualityScore: data.qualityScore }),
        ...(contentHash !== currentQuestion.contentHash && { contentHash }),
        version: { increment: 1 },
      },
      include: {
        chapter: true,
        group: true,
        tags: { include: { tag: true } },
        knowledgePoints: { include: { kp: true } },
      },
    })

    revalidatePath('/admin/content/review')

    return {
      success: true,
      data: question as QuestionWithRelations,
    }
  } catch (error) {
    console.error('更新题目失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '更新失败',
      code: 'UPDATE_FAILED',
    }
  }
}

// ==================== 通用查询接口 ====================

/**
 * 最大返回条数限制（防止过大查询）
 */
const MAX_PAGE_SIZE = 100

/**
 * 通用题目查询（支持多种过滤条件）
 * @param params 分页参数
 * @param filter 过滤条件
 * @param sort 排序选项
 * @returns 分页结果
 */
export async function getQuestions(
  params: PaginationParams = {},
  filter: QuestionFilter = {},
  sort: QuestionSortOptions = { field: 'createdAt', order: 'desc' }
): Promise<PaginatedResult<QuestionWithRelations>> {
  const page = params.page ?? 1
  const pageSize = Math.min(params.pageSize ?? 20, MAX_PAGE_SIZE) // 强制限制最大条数
  const skip = (page - 1) * pageSize

  // 构建 where 条件
  const where: Record<string, unknown> = {}

  // 状态过滤
  if (filter.status) {
    where.status = Array.isArray(filter.status) ? { in: filter.status } : filter.status
  }

  // 题型过滤
  if (filter.type) {
    where.type = Array.isArray(filter.type) ? { in: filter.type } : filter.type
  }

  // 难度过滤
  if (filter.difficulty) {
    if (typeof filter.difficulty === 'number') {
      where.difficulty = filter.difficulty
    } else {
      where.difficulty = {
        ...(filter.difficulty.min !== undefined && { gte: filter.difficulty.min }),
        ...(filter.difficulty.max !== undefined && { lte: filter.difficulty.max }),
      }
    }
  }

  // 章节过滤
  if (filter.chapterId) {
    where.chapterId = filter.chapterId
  }

  // 科目过滤（通过章节关联）
  if (filter.subjectId) {
    where.chapter = { subjectId: filter.subjectId }
  }

  // 题组过滤
  if (filter.groupId) {
    where.groupId = filter.groupId
  }

  // 是否有题组
  if (filter.hasGroup !== undefined) {
    where.groupId = filter.hasGroup ? { not: null } : null
  }

  // 文本搜索
  if (filter.searchText) {
    where.content = { contains: filter.searchText, mode: 'insensitive' }
  }

  // 创建者过滤
  if (filter.createdBy) {
    where.createdBy = filter.createdBy
  }

  // 审核者过滤
  if (filter.reviewedBy) {
    where.reviewedBy = filter.reviewedBy
  }

  // 时间范围过滤
  if (filter.createdAfter || filter.createdBefore) {
    where.createdAt = {
      ...(filter.createdAfter && { gte: filter.createdAfter }),
      ...(filter.createdBefore && { lte: filter.createdBefore }),
    }
  }

  // 并行查询总数和数据
  const [total, data] = await prisma.$transaction([
    prisma.question.count({ where }),
    prisma.question.findMany({
      where,
      include: {
        chapter: {
          include: { subject: true },
        },
        group: true,
        tags: { include: { tag: true } },
        knowledgePoints: { include: { kp: true } },
        sourceFiles: true,
      },
      orderBy: { [sort.field]: sort.order },
      skip,
      take: pageSize,
    }),
  ])

  const totalPages = Math.ceil(total / pageSize)

  return {
    data: data as QuestionWithRelations[],
    total,
    page,
    pageSize,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}

/**
 * 按章节查询题目
 * @param chapterId 章节 ID
 * @param params 分页参数
 * @param options 查询选项
 * @returns 分页结果
 */
export async function getQuestionsByChapter(
  chapterId: string,
  params: PaginationParams = {},
  options?: {
    status?: ContentStatus | ContentStatus[]
    includeSubChapters?: boolean
    sort?: QuestionSortOptions
  }
): Promise<PaginatedResult<QuestionWithRelations>> {
  const page = params.page ?? 1
  const pageSize = Math.min(params.pageSize ?? 20, MAX_PAGE_SIZE)
  const skip = (page - 1) * pageSize
  const sort = options?.sort ?? { field: 'createdAt', order: 'desc' }

  // 构建章节条件
  let chapterCondition: Record<string, unknown> = { chapterId }

  // 如果需要包含子章节
  if (options?.includeSubChapters) {
    // 先查询所有子章节 ID
    const subChapters = await prisma.chapter.findMany({
      where: { parentId: chapterId },
      select: { id: true },
    })
    const allChapterIds = [chapterId, ...subChapters.map((c) => c.id)]
    chapterCondition = { chapterId: { in: allChapterIds } }
  }

  // 构建完整 where 条件
  const where: Record<string, unknown> = {
    ...chapterCondition,
  }

  // 状态过滤
  if (options?.status) {
    where.status = Array.isArray(options.status) ? { in: options.status } : options.status
  }

  // 并行查询
  const [total, data] = await prisma.$transaction([
    prisma.question.count({ where }),
    prisma.question.findMany({
      where,
      include: {
        chapter: {
          include: { subject: true },
        },
        group: true,
        tags: { include: { tag: true } },
        knowledgePoints: { include: { kp: true } },
      },
      orderBy: { [sort.field]: sort.order },
      skip,
      take: pageSize,
    }),
  ])

  const totalPages = Math.ceil(total / pageSize)

  return {
    data: data as QuestionWithRelations[],
    total,
    page,
    pageSize,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}

// ==================== 用户报错功能 ====================

/**
 * 自动触发复审的报错阈值
 */
const AUTO_REVIEW_THRESHOLD = 3

/**
 * 用户报告题目问题
 * @param input 报告输入
 * @param options 选项
 * @returns 创建结果
 */
export async function reportQuestion(
  input: CreateReportInput,
  options?: { skipAutoReview?: boolean }
): Promise<ServiceResult<{ id: string; triggeredReview?: boolean }>> {
  try {
    // 检查题目是否存在
    const question = await prisma.question.findUnique({
      where: { id: input.questionId },
    })

    if (!question) {
      return {
        success: false,
        error: '题目不存在',
        code: 'NOT_FOUND',
      }
    }

    // 检查用户是否已报告过同一题目的同一问题类型
    const existingReport = await prisma.questionReport.findFirst({
      where: {
        questionId: input.questionId,
        reportedBy: input.reportedBy,
        issueType: input.issueType,
        status: { in: ['PENDING', 'REVIEWING'] },
      },
    })

    if (existingReport) {
      return {
        success: false,
        error: '您已报告过该问题，请等待处理',
        code: 'DUPLICATE_REPORT',
      }
    }

    // 使用事务创建报告并更新题目报错计数
    const [report, updatedQuestion] = await prisma.$transaction([
      prisma.questionReport.create({
        data: {
          questionId: input.questionId,
          reportedBy: input.reportedBy,
          issueType: input.issueType,
          description: input.description,
        },
      }),
      prisma.question.update({
        where: { id: input.questionId },
        data: { reportCount: { increment: 1 } },
      }),
    ])

    // 检查是否需要触发自动复审
    // 条件：报错数达到阈值 + 题目已发布 + 未跳过自动复审
    let triggeredReview = false
    if (
      !options?.skipAutoReview &&
      updatedQuestion.reportCount >= AUTO_REVIEW_THRESHOLD &&
      updatedQuestion.status === ContentStatus.PUBLISHED
    ) {
      // 将题目状态改为待复审（直接使用 Prisma 更新，避免循环调用）
      await prisma.$transaction([
        prisma.question.update({
          where: { id: input.questionId },
          data: { status: ContentStatus.REVIEW_PENDING },
        }),
        prisma.contentReviewLog.create({
          data: {
            contentType: 'question',
            contentId: input.questionId,
            action: ReviewAction.REQUEST_CHANGE,
            fromStatus: ContentStatus.PUBLISHED,
            toStatus: ContentStatus.REVIEW_PENDING,
            reviewerId: input.reportedBy, // 系统自动触发，记录最后一个报告者
            comment: `收到 ${updatedQuestion.reportCount} 条用户报错，自动触发复审`,
          },
        }),
      ])
      triggeredReview = true
    }

    return {
      success: true,
      data: { id: report.id, triggeredReview },
    }
  } catch (error) {
    console.error('创建报告失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '创建报告失败',
      code: 'CREATE_FAILED',
    }
  }
}

/**
 * 查询用户报告列表（分页）
 * @param params 分页参数
 * @param filter 过滤条件
 * @returns 分页结果
 */
export async function getQuestionReports(
  params: PaginationParams = {},
  filter: ReportFilter = {}
): Promise<
  PaginatedResult<{
    id: string
    questionId: string
    issueType: string
    description: string
    status: string
    createdAt: Date
    question: { content: string; type: string }
  }>
> {
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 20
  const skip = (page - 1) * pageSize

  // 构建 where 条件
  const where: Record<string, unknown> = {}

  if (filter.questionId) {
    where.questionId = filter.questionId
  }

  if (filter.reportedBy) {
    where.reportedBy = filter.reportedBy
  }

  if (filter.status) {
    where.status = Array.isArray(filter.status)
      ? { in: filter.status }
      : filter.status
  }

  if (filter.issueType) {
    where.issueType = Array.isArray(filter.issueType)
      ? { in: filter.issueType }
      : filter.issueType
  }

  if (filter.createdAfter || filter.createdBefore) {
    where.createdAt = {
      ...(filter.createdAfter && { gte: filter.createdAfter }),
      ...(filter.createdBefore && { lte: filter.createdBefore }),
    }
  }

  // 查询总数
  const total = await prisma.questionReport.count({ where })

  // 查询数据
  const data = await prisma.questionReport.findMany({
    where,
    include: {
      question: {
        select: {
          content: true,
          type: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take: pageSize,
  })

  const totalPages = Math.ceil(total / pageSize)

  return {
    data: data.map((r: typeof data[0]) => ({
      id: r.id,
      questionId: r.questionId,
      issueType: r.issueType,
      description: r.description,
      status: r.status,
      createdAt: r.createdAt,
      question: r.question,
    })),
    total,
    page,
    pageSize,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}

/**
 * 处理用户报告（Admin 操作）
 * @param input 处理报告输入
 * @returns 处理结果
 */
export async function resolveReport(
  input: ResolveReportInput
): Promise<ServiceResult<{ resolved: boolean }>> {
  try {
    // 查找报告
    const report = await prisma.questionReport.findUnique({
      where: { id: input.reportId },
      include: { question: true },
    })

    if (!report) {
      return {
        success: false,
        error: '报告不存在',
        code: 'NOT_FOUND',
      }
    }

    // 检查报告是否已处理
    if (report.status === ReportStatus.RESOLVED || report.status === ReportStatus.REJECTED) {
      return {
        success: false,
        error: '该报告已被处理',
        code: 'ALREADY_RESOLVED',
      }
    }

    // 使用事务更新报告状态
    // 如果报告被确认有效（RESOLVED），可能需要更新题目状态
    if (input.status === ReportStatus.REJECTED && report.question.reportCount > 0) {
      // 如果报告被拒绝（无效报告），减少题目的报错计数
      await prisma.$transaction([
        prisma.questionReport.update({
          where: { id: input.reportId },
          data: {
            status: input.status,
            reviewedBy: input.reviewedBy,
            reviewedAt: new Date(),
            resolution: input.resolution,
          },
        }),
        prisma.question.update({
          where: { id: report.questionId },
          data: { reportCount: { decrement: 1 } },
        }),
      ])
    } else {
      // 其他情况只更新报告状态
      await prisma.questionReport.update({
        where: { id: input.reportId },
        data: {
          status: input.status,
          reviewedBy: input.reviewedBy,
          reviewedAt: new Date(),
          resolution: input.resolution,
        },
      })
    }

    revalidatePath('/admin/content/review')
    revalidatePath('/admin/reports')

    return {
      success: true,
      data: { resolved: true },
    }
  } catch (error) {
    console.error('处理报告失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '处理报告失败',
      code: 'RESOLVE_FAILED',
    }
  }
}

/**
 * 批量处理用户报告
 * @param reportIds 报告 ID 数组
 * @param status 目标状态
 * @param reviewedBy 审核者 ID
 * @param resolution 处理说明（可选）
 * @returns 批量操作结果
 */
export async function bulkResolveReports(
  reportIds: string[],
  status: ReportStatus,
  reviewedBy: string,
  resolution?: string
): Promise<BulkOperationResult<{ resolved: boolean }>> {
  const results: BulkOperationResult<{ resolved: boolean }>['results'] = []
  let succeeded = 0
  let failed = 0

  for (let i = 0; i < reportIds.length; i++) {
    const result = await resolveReport({
      reportId: reportIds[i],
      status,
      reviewedBy,
      resolution,
    })

    if (result.success) {
      results.push({ index: i, success: true, data: result.data })
      succeeded++
    } else {
      results.push({ index: i, success: false, error: result.error })
      failed++
    }
  }

  return {
    success: failed === 0,
    total: reportIds.length,
    succeeded,
    failed,
    results,
  }
}

// ==================== 统计查询 ====================

/**
 * 获取内容统计信息
 * @returns 统计数据
 */
export async function getContentStats(): Promise<
  ServiceResult<{
    totalQuestions: number
    byStatus: Record<ContentStatus, number>
    byType: Record<QuestionType, number>
    pendingReports: number
    recentlyAdded: number
  }>
> {
  try {
    const [
      totalQuestions,
      statusCounts,
      typeCounts,
      pendingReports,
      recentlyAdded,
    ] = await Promise.all([
      prisma.question.count(),
      prisma.question.groupBy({
        by: ['status'],
        _count: true,
      }),
      prisma.question.groupBy({
        by: ['type'],
        _count: true,
      }),
      prisma.questionReport.count({
        where: { status: 'PENDING' },
      }),
      prisma.question.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 最近7天
          },
        },
      }),
    ])

    const byStatus = statusCounts.reduce(
      (acc: Record<ContentStatus, number>, item: { status: ContentStatus; _count: number }) => {
        acc[item.status] = item._count
        return acc
      },
      {} as Record<ContentStatus, number>
    )

    const byType = typeCounts.reduce(
      (acc: Record<QuestionType, number>, item: { type: QuestionType; _count: number }) => {
        acc[item.type] = item._count
        return acc
      },
      {} as Record<QuestionType, number>
    )

    return {
      success: true,
      data: {
        totalQuestions,
        byStatus,
        byType,
        pendingReports,
        recentlyAdded,
      },
    }
  } catch (error) {
    console.error('获取统计信息失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取统计失败',
      code: 'FETCH_FAILED',
    }
  }
}
