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
import { Prisma, ProcessingStatus, ContentStatus, ReviewAction } from '@prisma/client'
import { format } from 'date-fns'
import { OCRService } from '@/lib/content-pipeline/ocr-service'
import { AIStructurer } from '@/lib/content-pipeline/ai-structurer'
import { autoAssignQuestionChapters } from '@/lib/content-pipeline/chapter-tagging'
import { resolveWebImportAdapter, runWebImport } from '@/lib/content-pipeline/web-import'
import { bulkCreateQuestions } from './question-service'
import { getCurrentUser } from '@/actions/user/auth'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { ImportDiagnostics } from '@/types/content-pipeline'
import type {
  ImportFromPDFInput,
  ImportResult,
  ImportProgress,
  ImportOptions,
  ResumeFailedImportInput,
  CreateQuestionInput,
  JsonValue,
  ServiceResult,
  ImportStage
} from '@/lib/content-pipeline/types'
import type { AuditLogEntry, ImportEventCode, StatsData } from '@/types/content-pipeline'
import type { OCRResult } from '@/lib/content-pipeline'
import {
  MAX_PAGES,
  DEFAULT_MAX_OCR_COST,
  extractFilename,
  createProgress,
  convertToCreateInput,
  calculateQualityScore
} from '@/lib/content-pipeline/import-utils'
import { createHash } from 'node:crypto'

interface ImportFromWebUrlInput {
  pageUrl: string
  subjectId: string
  source?: string
  chapterId?: string
  maxQuestions?: number
  isPastPaper?: boolean
  paperId?: string | null
  _sourceFileId?: string
  _uploadedBy?: string
  _skipAuthCheck?: boolean
}

const WEB_IMPORT_IMAGE_CONCURRENCY = 2

type QueuedWebImportPayload = {
  pageUrl: string
  subjectId: string
  source?: string
  chapterId?: string
  maxQuestions?: number
  isPastPaper?: boolean
  paperId?: string | null
}

type QueuedFileImportPayload = {
  pdfUrl: string
  subjectId: string
  source?: string
  sourceYear?: number
  sourcePaper?: string
  chapterId?: string
  isPastPaper?: boolean
  paperId?: string | null
}

declare global {
  // eslint-disable-next-line no-var
  var __importQueueRunner: Promise<void> | undefined
}

function toQueuedWebImportPayload(input: ImportFromWebUrlInput): QueuedWebImportPayload {
  return stripUndefinedDeep({
    pageUrl: input.pageUrl.trim(),
    subjectId: input.subjectId,
    source: input.source?.trim() || undefined,
    chapterId: input.chapterId,
    maxQuestions: input.maxQuestions,
    isPastPaper: input.isPastPaper ?? false,
    paperId: input.paperId ?? null,
  })
}

function buildQueuedWebImportDiagnostics(payload: QueuedWebImportPayload): ImportDiagnostics {
  return {
    mode: 'web-url-queue',
    queuePayload: payload as Record<string, unknown>,
    lastProgressAt: new Date().toISOString(),
    currentStage: 'QUEUING',
    currentStageLabel: '等待处理',
    statusSummary: '任务已入队，等待前序抓取任务完成...',
    overallProgress: 1,
    stageProgress: 0,
  }
}

function toQueuedFileImportPayload(input: ImportFromPDFInput): QueuedFileImportPayload {
  return stripUndefinedDeep({
    pdfUrl: input.pdfUrl.trim(),
    subjectId: input.subjectId,
    source: input.source?.trim() || undefined,
    sourceYear: input.sourceYear,
    sourcePaper: input.sourcePaper?.trim() || undefined,
    chapterId: input.chapterId,
    isPastPaper: input.isPastPaper ?? false,
    paperId: input.paperId ?? null,
  })
}

function buildQueuedFileImportDiagnostics(payload: QueuedFileImportPayload): ImportDiagnostics {
  return {
    mode: 'file-upload-queue',
    queuePayload: payload as Record<string, unknown>,
    lastProgressAt: new Date().toISOString(),
    currentStage: 'QUEUING',
    currentStageLabel: '等待处理',
    statusSummary: '任务已入队，等待前序导入任务完成...',
    overallProgress: 1,
    stageProgress: 0,
  }
}

function parseQueuedWebImportPayload(
  diagnostics: Prisma.JsonValue | null | undefined
): QueuedWebImportPayload | null {
  if (!diagnostics || typeof diagnostics !== 'object' || Array.isArray(diagnostics)) return null
  const queuePayload = (diagnostics as Record<string, unknown>).queuePayload
  if (!queuePayload || typeof queuePayload !== 'object' || Array.isArray(queuePayload)) return null
  const payload = queuePayload as Record<string, unknown>
  if (typeof payload.pageUrl !== 'string' || typeof payload.subjectId !== 'string') return null

  return stripUndefinedDeep({
    pageUrl: payload.pageUrl,
    subjectId: payload.subjectId,
    source: typeof payload.source === 'string' ? payload.source : undefined,
    chapterId: typeof payload.chapterId === 'string' ? payload.chapterId : undefined,
    maxQuestions: typeof payload.maxQuestions === 'number' ? payload.maxQuestions : undefined,
    isPastPaper: typeof payload.isPastPaper === 'boolean' ? payload.isPastPaper : false,
    paperId:
      typeof payload.paperId === 'string' || payload.paperId === null
        ? (payload.paperId as string | null)
        : undefined,
  })
}

function parseQueuedFileImportPayload(
  diagnostics: Prisma.JsonValue | null | undefined
): QueuedFileImportPayload | null {
  if (!diagnostics || typeof diagnostics !== 'object' || Array.isArray(diagnostics)) return null
  const queuePayload = (diagnostics as Record<string, unknown>).queuePayload
  if (!queuePayload || typeof queuePayload !== 'object' || Array.isArray(queuePayload)) return null
  const payload = queuePayload as Record<string, unknown>
  if (typeof payload.pdfUrl !== 'string' || typeof payload.subjectId !== 'string') return null

  return stripUndefinedDeep({
    pdfUrl: payload.pdfUrl,
    subjectId: payload.subjectId,
    source: typeof payload.source === 'string' ? payload.source : undefined,
    sourceYear: typeof payload.sourceYear === 'number' ? payload.sourceYear : undefined,
    sourcePaper: typeof payload.sourcePaper === 'string' ? payload.sourcePaper : undefined,
    chapterId: typeof payload.chapterId === 'string' ? payload.chapterId : undefined,
    isPastPaper: typeof payload.isPastPaper === 'boolean' ? payload.isPastPaper : false,
    paperId:
      typeof payload.paperId === 'string' || payload.paperId === null
        ? (payload.paperId as string | null)
        : undefined,
  })
}

function clampPercentage(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.min(100, Math.round(value)))
}

function buildWebImportProgressState(input: {
  stage: NonNullable<ImportDiagnostics['currentStage']>
  stageLabel: string
  statusSummary: string
  overallProgress: number
  stageProgress: number
  totalQuestionCount?: number
  processedQuestionCount?: number
  totalAssetCount?: number
  processedAssetCount?: number
}): ImportDiagnostics {
  return {
    lastProgressAt: new Date().toISOString(),
    currentStage: input.stage,
    currentStageLabel: input.stageLabel,
    statusSummary: input.statusSummary,
    overallProgress: clampPercentage(input.overallProgress),
    stageProgress: clampPercentage(input.stageProgress),
    totalQuestionCount: input.totalQuestionCount,
    processedQuestionCount: input.processedQuestionCount,
    totalAssetCount: input.totalAssetCount,
    processedAssetCount: input.processedAssetCount,
  }
}

async function updateSourceFileImportDiagnostics(
  sourceFileId: string,
  diagnostics: ImportDiagnostics
): Promise<void> {
  try {
    await prisma.sourceFile.update({
      where: { id: sourceFileId },
      data: {
        importDiagnostics: stripUndefinedDeep(diagnostics) as Prisma.InputJsonValue,
      },
    })
  } catch (error) {
    console.warn('更新网页导入进度失败（已忽略）:', error)
  }
}

async function markQueuedWebImportFailed(
  sourceFileId: string,
  message: string,
  existingDiagnostics?: Prisma.JsonValue | null
): Promise<void> {
  const payload = parseQueuedWebImportPayload(existingDiagnostics)
  await prisma.sourceFile.update({
    where: { id: sourceFileId },
    data: {
      status: ProcessingStatus.FAILED,
      processedAt: new Date(),
      importDiagnostics: stripUndefinedDeep({
        ...(payload ? buildQueuedWebImportDiagnostics(payload) : {}),
        lastProgressAt: new Date().toISOString(),
        currentStage: 'QUEUING',
        currentStageLabel: '等待处理',
        statusSummary: message,
        overallProgress: 0,
        stageProgress: 0,
        queuePayload: payload as Record<string, unknown> | undefined,
      }) as unknown as Prisma.InputJsonValue,
    },
  })
}

async function markQueuedFileImportFailed(
  sourceFileId: string,
  message: string,
  existingDiagnostics?: Prisma.JsonValue | null
): Promise<void> {
  const payload = parseQueuedFileImportPayload(existingDiagnostics)
  await prisma.sourceFile.update({
    where: { id: sourceFileId },
    data: {
      status: ProcessingStatus.FAILED,
      processedAt: new Date(),
      importDiagnostics: stripUndefinedDeep({
        ...(payload ? buildQueuedFileImportDiagnostics(payload) : {}),
        lastProgressAt: new Date().toISOString(),
        currentStage: 'QUEUING',
        currentStageLabel: '等待处理',
        statusSummary: message,
        overallProgress: 0,
        stageProgress: 0,
        queuePayload: payload as Record<string, unknown> | undefined,
      }) as unknown as Prisma.InputJsonValue,
    },
  })
}

function resolveImportProgressTimestamp(
  diagnostics: Prisma.JsonValue | null | undefined,
  fallback: Date
): Date {
  if (
    diagnostics &&
    typeof diagnostics === 'object' &&
    !Array.isArray(diagnostics) &&
    typeof (diagnostics as Record<string, unknown>).lastProgressAt === 'string'
  ) {
    const parsed = new Date((diagnostics as Record<string, string>).lastProgressAt)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed
    }
  }

  return fallback
}

async function recoverStaleQueuedImportTasks(): Promise<void> {
  const now = new Date()
  const completedCutoff = new Date(now.getTime() - 3 * 60 * 1000)
  const failedCutoff = new Date(now.getTime() - 15 * 60 * 1000)

  const candidates = await prisma.sourceFile.findMany({
    where: {
      fileType: 'html',
      status: ProcessingStatus.PROCESSING,
      processedAt: null,
    },
    select: {
      id: true,
      createdAt: true,
      uploadedBy: true,
      importDiagnostics: true,
      _count: {
        select: { questions: true },
      },
    },
  })

  for (const task of candidates) {
    const diagnostics =
      typeof task.importDiagnostics === 'object' &&
      task.importDiagnostics &&
      !Array.isArray(task.importDiagnostics)
        ? (task.importDiagnostics as Record<string, unknown>)
        : {}
    const mode = typeof diagnostics.mode === 'string' ? diagnostics.mode : undefined
    const lastProgressAt = resolveImportProgressTimestamp(
      task.importDiagnostics,
      task.createdAt
    )

    if (task._count.questions > 0 && lastProgressAt < completedCutoff) {
      await recoverImportedBatchToCompleted({
        sourceFileId: task.id,
        preferredReviewerId: task.uploadedBy,
        statusSummary: '任务已自动恢复完成状态（检测到题目已入库）',
      })
      continue
    }

    if (task._count.questions === 0 && lastProgressAt < failedCutoff) {
      if (mode === 'web-url-queue') {
        await markQueuedWebImportFailed(
          task.id,
          '任务长时间无进度更新，已自动标记失败，可手动重试',
          task.importDiagnostics
        )
      } else if (mode === 'file-upload-queue') {
        await markQueuedFileImportFailed(
          task.id,
          '任务长时间无进度更新，已自动标记失败，可手动重试',
          task.importDiagnostics
        )
      }
    }
  }
}

async function consumePendingImportQueue(): Promise<void> {
  while (true) {
    await recoverStaleQueuedImportTasks()

    const nextTask = await prisma.sourceFile.findFirst({
      where: {
        status: ProcessingStatus.PENDING,
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        fileType: true,
        uploadedBy: true,
        importDiagnostics: true,
      },
    })

    if (!nextTask) return

    const diagnostics =
      typeof nextTask.importDiagnostics === 'object' &&
      nextTask.importDiagnostics &&
      !Array.isArray(nextTask.importDiagnostics)
        ? (nextTask.importDiagnostics as Record<string, unknown>)
        : {}
    const mode = typeof diagnostics.mode === 'string' ? diagnostics.mode : undefined

    let claimed = { count: 0 }

    if (mode === 'web-url-queue') {
      const queuedPayload = parseQueuedWebImportPayload(nextTask.importDiagnostics)
      if (!queuedPayload) {
        await markQueuedWebImportFailed(
          nextTask.id,
          '队列任务缺少抓取参数，已标记失败',
          nextTask.importDiagnostics
        )
        continue
      }

      claimed = await prisma.sourceFile.updateMany({
        where: {
          id: nextTask.id,
          status: ProcessingStatus.PENDING,
        },
        data: {
          status: ProcessingStatus.PROCESSING,
          ocrStatus: ProcessingStatus.SKIPPED,
          importDiagnostics: stripUndefinedDeep({
            ...buildQueuedWebImportDiagnostics(queuedPayload),
            currentStage: 'CRAWLING',
            currentStageLabel: '网页抓取',
            statusSummary: '队列已启动，准备抓取试卷结构...',
            overallProgress: 3,
            stageProgress: 0,
          }) as unknown as Prisma.InputJsonValue,
        },
      })

      if (claimed.count === 0) {
        continue
      }

      const result = await importFromWebUrl({
        ...queuedPayload,
        _sourceFileId: nextTask.id,
        _uploadedBy: nextTask.uploadedBy,
        _skipAuthCheck: true,
      })

      if (!result.success) {
        console.error('网页导入队列任务执行失败:', nextTask.id, result.error)
      }
      continue
    }

    if (mode === 'file-upload-queue') {
      const queuedPayload = parseQueuedFileImportPayload(nextTask.importDiagnostics)
      if (!queuedPayload) {
        await markQueuedFileImportFailed(
          nextTask.id,
          '队列任务缺少导入参数，已标记失败',
          nextTask.importDiagnostics
        )
        continue
      }

      claimed = await prisma.sourceFile.updateMany({
        where: {
          id: nextTask.id,
          status: ProcessingStatus.PENDING,
        },
        data: {
          status: ProcessingStatus.PROCESSING,
          ocrStatus: ProcessingStatus.PENDING,
          importDiagnostics: stripUndefinedDeep({
            ...buildQueuedFileImportDiagnostics(queuedPayload),
            currentStage: 'OCR_PROCESSING',
            currentStageLabel: 'OCR 识别',
            statusSummary: '队列已启动，准备进行 OCR 识别...',
            overallProgress: 3,
            stageProgress: 0,
          }) as unknown as Prisma.InputJsonValue,
        },
      })

      if (claimed.count === 0) {
        continue
      }

      const result = await importFromPDF({
        ...queuedPayload,
        _sourceFileId: nextTask.id,
        _uploadedBy: nextTask.uploadedBy,
        _skipAuthCheck: true,
      })

      if (!result.success) {
        console.error('文件导入队列任务执行失败:', nextTask.id, result.error)
      }
      continue
    }

    if (nextTask.fileType === 'html') {
      await markQueuedWebImportFailed(
        nextTask.id,
        '队列任务缺少网页抓取参数，已标记失败',
        nextTask.importDiagnostics
      )
    } else {
      await markQueuedFileImportFailed(
        nextTask.id,
        '队列任务缺少文件导入参数，已标记失败',
        nextTask.importDiagnostics
      )
    }
  }
}

export function triggerPendingWebImportQueue(): void {
  if (globalThis.__importQueueRunner) return

  globalThis.__importQueueRunner = consumePendingImportQueue()
    .catch((error) => {
      console.error('导入队列消费失败:', error)
    })
    .finally(() => {
      globalThis.__importQueueRunner = undefined
    })
}

export async function ensurePendingWebImportQueueRunning(): Promise<void> {
  await recoverStaleQueuedImportTasks()
  triggerPendingWebImportQueue()
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  if (items.length === 0) return []
  const limit = Math.max(1, Math.floor(concurrency))
  const results = new Array<R>(items.length)
  let nextIndex = 0

  async function runWorker(): Promise<void> {
    while (true) {
      const currentIndex = nextIndex
      nextIndex += 1
      if (currentIndex >= items.length) return
      results[currentIndex] = await worker(items[currentIndex], currentIndex)
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => runWorker())
  )

  return results
}

function buildSourceLabel(input: ImportFromWebUrlInput, fallback: string): string {
  const base = input.source?.trim()
  return base || fallback
}

function buildWebImportQuestionSource(
  input: ImportFromWebUrlInput,
  fallbackMeta?: string | null
): string {
  return buildSourceLabel(input, fallbackMeta?.trim() || 'web-import')
}

async function moveImportedQuestionsToReviewPending(
  questionIds: string[],
  reviewerId: string
): Promise<string[]> {
  if (questionIds.length === 0) return []

  const draftQuestions = await prisma.question.findMany({
    where: {
      id: { in: questionIds },
      status: ContentStatus.DRAFT,
    },
    select: { id: true },
  })

  const draftQuestionIds = draftQuestions.map((question) => question.id)
  if (draftQuestionIds.length === 0) return []

  const now = new Date()
  await prisma.$transaction([
    prisma.question.updateMany({
      where: {
        id: { in: draftQuestionIds },
        status: ContentStatus.DRAFT,
      },
      data: { status: ContentStatus.REVIEW_PENDING },
    }),
    prisma.contentReviewLog.createMany({
      data: draftQuestionIds.map((questionId) => ({
        contentType: 'question',
        contentId: questionId,
        action: ReviewAction.SUBMIT_REVIEW,
        fromStatus: ContentStatus.DRAFT,
        toStatus: ContentStatus.REVIEW_PENDING,
        reviewerId,
        comment: '系统自动提交审核（批量导入）',
        createdAt: now,
      })),
    }),
  ])

  return draftQuestionIds
}

async function resolveImportReviewerId(preferredReviewerId?: string | null): Promise<string> {
  if (preferredReviewerId) {
    const preferred = await prisma.user.findUnique({
      where: { id: preferredReviewerId },
      select: { id: true },
    })
    if (preferred?.id) return preferred.id
  }

  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    select: { id: true },
  })
  if (admin?.id) return admin.id

  const fallback = await prisma.user.findFirst({
    select: { id: true },
  })
  if (fallback?.id) return fallback.id

  throw new Error('没有可用的导入审核人')
}

async function recoverImportedBatchToCompleted(params: {
  sourceFileId: string
  preferredReviewerId?: string | null
  diagnostics?: ImportDiagnostics | null
  statusSummary: string
}): Promise<{
  recovered: boolean
  questionIds: string[]
}> {
  const questions = await prisma.question.findMany({
    where: { sourceFileId: params.sourceFileId },
    select: { id: true },
  })

  const questionIds = questions.map((question) => question.id)
  if (questionIds.length === 0) {
    return { recovered: false, questionIds: [] }
  }

  const reviewerId = await resolveImportReviewerId(params.preferredReviewerId)
  await moveImportedQuestionsToReviewPending(questionIds, reviewerId)

  const sourceFile = await prisma.sourceFile.findUnique({
    where: { id: params.sourceFileId },
    select: {
      importDiagnostics: true,
    },
  })

  const existingDiagnostics =
    sourceFile?.importDiagnostics &&
    typeof sourceFile.importDiagnostics === 'object' &&
    !Array.isArray(sourceFile.importDiagnostics)
      ? (sourceFile.importDiagnostics as Record<string, unknown>)
      : {}

  const now = new Date()
  const mergedDiagnostics = stripUndefinedDeep({
    ...existingDiagnostics,
    ...(params.diagnostics ?? {}),
    lastProgressAt: now.toISOString(),
    currentStage: undefined,
    currentStageLabel: undefined,
    statusSummary: params.statusSummary,
    overallProgress: 100,
    stageProgress: 100,
    createdQuestionCount:
      typeof existingDiagnostics.createdQuestionCount === 'number'
        ? existingDiagnostics.createdQuestionCount
        : questionIds.length,
  })

  await prisma.sourceFile.update({
    where: { id: params.sourceFileId },
    data: {
      status: ProcessingStatus.COMPLETED,
      processedAt: now,
      importDiagnostics: mergedDiagnostics as unknown as Prisma.InputJsonValue,
    },
  })

  safeRevalidatePath('/admin/content/review')
  safeRevalidatePath('/admin/content/import')

  return { recovered: true, questionIds }
}

function getSourceFileTypeByUrl(url: string): 'pdf' | 'image' | 'docx' | 'html' {
  const lower = url.toLowerCase()
  if (lower.endsWith('.pdf')) return 'pdf'
  if (lower.endsWith('.docx') || lower.endsWith('.doc')) return 'docx'
  if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.webp')) {
    return 'image'
  }
  return 'html'
}

function deriveImportEvents(input: {
  sourceStatus: ProcessingStatus
  questionStatuses: ContentStatus[]
  hasReportedQuestion: boolean
}): ImportEventCode[] {
  const events: ImportEventCode[] = ['IMPORT_TASK_CREATED']

  if (input.sourceStatus === ProcessingStatus.COMPLETED) {
    events.push('IMPORT_PARSE_DONE')
  } else if (input.sourceStatus === ProcessingStatus.FAILED) {
    events.push('IMPORT_PARSE_FAILED')
  }

  if (input.hasReportedQuestion) {
    events.push('QUESTION_MARKED_ERROR')
  }

  if (input.questionStatuses.some((status) => status === ContentStatus.REVIEW_PENDING)) {
    events.push('REVIEW_SUBMITTED')
  }

  if (
    input.questionStatuses.some(
      (status) => status === ContentStatus.VERIFIED || status === ContentStatus.PUBLISHED
    )
  ) {
    events.push('REVIEW_APPROVED')
  }

  if (input.questionStatuses.some((status) => status === ContentStatus.REVIEW_REJECTED)) {
    events.push('REVIEW_REJECTED')
  }

  return Array.from(new Set(events))
}

function isDuplicateBulkCreateError(error?: string): boolean {
  return Boolean(error && (error.includes('重复') || error.includes('已存在')))
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
}

function stripUndefinedDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .map((item) => stripUndefinedDeep(item))
      .filter((item) => item !== undefined) as T
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, stripUndefinedDeep(item)])
    ) as T
  }

  return value
}

function safeRevalidatePath(path: string): void {
  try {
    revalidatePath(path)
  } catch (error) {
    console.warn(`Skip revalidatePath(${path}):`, error)
  }
}

function buildWebImportDiagnostics(
  diagnostics: NonNullable<Awaited<ReturnType<typeof runWebImport>>['data']>['diagnostics'],
  normalizedQuestions: Array<{ rawQuestionId?: string | null }>,
  bulkResults: Array<{ index: number; success: boolean; error?: string }>
): ImportDiagnostics {
  const normalizedRawQuestionIds = normalizedQuestions
    .map((question) => question.rawQuestionId)
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)

  const createdRawQuestionIds = bulkResults
    .filter((result) => result.success)
    .map((result) => normalizedQuestions[result.index]?.rawQuestionId)
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)

  const duplicatedRawQuestionIds = bulkResults
    .filter((result) => !result.success && isDuplicateBulkCreateError(result.error))
    .map((result) => normalizedQuestions[result.index]?.rawQuestionId)
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)

  const failedQuestions = bulkResults
    .filter((result) => !result.success && !isDuplicateBulkCreateError(result.error))
    .map((result) => ({
      rawQuestionId: normalizedQuestions[result.index]?.rawQuestionId ?? null,
      reason: result.error || '创建失败',
    }))

  return stripUndefinedDeep({
    mode: diagnostics.mode,
    expectedQuestionCount: diagnostics.expectedQuestionCount,
    expectedRawQuestionIds: toStringArray(diagnostics.expectedRawQuestionIds),
    selectedQuestionCount: diagnostics.selectedQuestionCount,
    selectedRawQuestionIds: toStringArray(diagnostics.selectedRawQuestionIds),
    skippedByLimitRawQuestionIds: toStringArray(diagnostics.skippedByLimitRawQuestionIds),
    collectedQuestionCount: diagnostics.collectedQuestionCount,
    collectedRawQuestionIds: toStringArray(diagnostics.collectedRawQuestionIds),
    normalizedQuestionCount: diagnostics.normalizedQuestionCount,
    normalizedRawQuestionIds,
    missingRawQuestionIds: toStringArray(diagnostics.missingRawQuestionIds),
    detectedQuestionGroupCount: diagnostics.detectedQuestionGroupCount,
    detectedQuestionGroupIds: toStringArray(diagnostics.detectedQuestionGroupIds),
    assetCount: diagnostics.assetCount,
    flaggedQuestionCount: diagnostics.flaggedQuestionCount,
    createdQuestionCount: createdRawQuestionIds.length,
    createdRawQuestionIds,
    duplicatedQuestionCount: duplicatedRawQuestionIds.length,
    duplicatedRawQuestionIds,
    failedQuestionCount: failedQuestions.length,
    failedQuestions,
  })
}

type StemImagePersistResult = {
  content: string
  answer: JsonValue
  explanation: string | null
  options: Record<string, string> | null
  assetUrl: string | null
  imageUrls: string[]
  uploadedCount: number
  skippedCount: number
}

type PersistedQuestionGroupDraft = {
  rawGroupId: string
  title: string | null
  material: string
  materialImageUrls: string[]
  questionIds: string[]
  selectedQuestionIds: string[]
  persistedMaterial: string
  persistedImageUrls: string[]
  assetUrl: string | null
  sourceMeta?: Record<string, unknown>
}

function replaceImageUrlInOptions(
  options: Record<string, string> | null,
  originalUrl: string,
  replacementUrl: string
): Record<string, string> | null {
  if (!options) return options
  return Object.fromEntries(
    Object.entries(options).map(([key, value]) => [
      key,
      typeof value === 'string' ? value.split(originalUrl).join(replacementUrl) : value,
    ])
  )
}

function extractMarkdownImageUrls(markdown = ''): string[] {
  const urls: string[] = []
  const imageRegex = /!\[[^\]]*]\(([^)]+)\)/g
  let match: RegExpExecArray | null = null
  while ((match = imageRegex.exec(markdown)) !== null) {
    const url = match[1]?.trim()
    if (url) urls.push(url)
  }
  return urls
}

function extractAnswerImageUrls(answer: JsonValue): string[] {
  if (typeof answer === 'string') {
    return extractMarkdownImageUrls(answer)
  }

  if (Array.isArray(answer)) {
    return Array.from(
      new Set(
        answer.flatMap((item) =>
          typeof item === 'string' ? extractMarkdownImageUrls(item) : []
        )
      )
    )
  }

  return []
}

function replaceImageUrlInAnswer(
  answer: JsonValue,
  originalUrl: string,
  replacementUrl: string
): JsonValue {
  if (typeof answer === 'string') {
    return answer.split(originalUrl).join(replacementUrl)
  }

  if (Array.isArray(answer)) {
    return answer.map((item) =>
      typeof item === 'string' ? item.split(originalUrl).join(replacementUrl) : item
    )
  }

  return answer
}

function inferImageExtension(contentType: string | null): string {
  const ct = (contentType || '').toLowerCase()
  if (ct.includes('image/png')) return 'png'
  if (ct.includes('image/webp')) return 'webp'
  if (ct.includes('image/gif')) return 'gif'
  if (ct.includes('image/svg')) return 'svg'
  if (ct.includes('image/jpeg') || ct.includes('image/jpg')) return 'jpg'
  return 'jpg'
}

async function persistQuestionImagesToSupabase(params: {
  pageUrl: string
  adapterName: string
  paperId?: string | null
  content: string
  answer: JsonValue
  explanation: string | null
  options: Record<string, string> | null
  assetUrl: string | null
  imageUrls: string[]
  answerImageUrls: string[]
  explanationImageUrls: string[]
  supabase?: SupabaseClient
  urlCache?: Map<string, Promise<string | null>>
}): Promise<StemImagePersistResult> {
  // 只对 Examcoo 这类“公共网页导入”先落地题干图转存；后续如有更多站点再扩。
  if (params.adapterName !== 'examcoo-view') {
    return {
      content: params.content,
      answer: params.answer,
      explanation: params.explanation,
      options: params.options,
      assetUrl: params.assetUrl,
      imageUrls: params.imageUrls,
      uploadedCount: 0,
      skippedCount:
        params.imageUrls.length +
        params.answerImageUrls.length +
        params.explanationImageUrls.length,
    }
  }

  const allImageUrls = Array.from(
    new Set([
      ...params.imageUrls,
      ...params.answerImageUrls,
      ...params.explanationImageUrls,
    ])
  )

  if (allImageUrls.length === 0) {
    return {
      content: params.content,
      answer: params.answer,
      explanation: params.explanation,
      options: params.options,
      assetUrl: params.assetUrl,
      imageUrls: params.imageUrls,
      uploadedCount: 0,
      skippedCount: 0,
    }
  }

  const supabase = params.supabase ?? (await createSupabaseClient())

  // bucket 优先使用更语义化的 bucket；若未创建则回退到现有 source-files bucket，保证功能可用。
  const primaryBucket = 'question-assets'
  const fallbackBucket = 'source-files'

  const urlCache = params.urlCache ?? new Map<string, Promise<string | null>>() // 同一批次内去重

  async function uploadOne(originalUrl: string): Promise<string | null> {
    const cached = urlCache.get(originalUrl)
    if (cached) return cached

    const task = (async () => {
      // 更“礼貌”的 headers：带 referer，避免部分站点防盗链
      const res = await fetch(originalUrl, {
        headers: {
          'user-agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          referer: params.pageUrl,
          accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        },
      })

      if (!res.ok) {
        console.warn(`[StemImage] 下载失败 ${res.status} url=${originalUrl}`)
        return null
      }

      const contentType = res.headers.get('content-type')
      const ext = inferImageExtension(contentType)
      const buf = Buffer.from(await res.arrayBuffer())

      // 只做基础兜底，避免单张图把导入卡死
      const MAX_BYTES = 8 * 1024 * 1024
      if (buf.byteLength > MAX_BYTES) {
        console.warn(`[StemImage] 图片过大已跳过 size=${buf.byteLength} url=${originalUrl}`)
        return null
      }

      const urlHash = createHash('sha1').update(originalUrl).digest('hex')
      const paperSeg = params.paperId ? `paper_${params.paperId}` : 'paper_unknown'
      const objectPath = `practice/questions/stem/examcoo/${paperSeg}/${urlHash}.${ext}`

      async function tryUpload(bucket: string): Promise<string | null> {
        const { error: uploadError } = await supabase.storage.from(bucket).upload(objectPath, buf, {
          cacheControl: '31536000',
          upsert: false,
          contentType: contentType || undefined,
        })

        // 已存在视为成功（可复用），避免重复写入
        if (uploadError && !/already exists/i.test(uploadError.message)) {
          // bucket 不存在或无权限时，交给上层 fallback 处理
          throw uploadError
        }

        const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath)
        return data.publicUrl || null
      }

      try {
        return await tryUpload(primaryBucket)
      } catch (primaryError) {
        try {
          return await tryUpload(fallbackBucket)
        } catch (fallbackError) {
          console.warn(
            `[StemImage] 上传失败 url=${originalUrl} primary=${String(
              (primaryError as Error)?.message ?? primaryError
            )} fallback=${String((fallbackError as Error)?.message ?? fallbackError)}`
          )
          return null
        }
      }
    })()

    urlCache.set(originalUrl, task)
    return task
  }

  let content = params.content
  let answer = params.answer
  let explanation = params.explanation
  let options = params.options
  const newUrls: string[] = []
  let uploadedCount = 0
  let skippedCount = 0

  for (const originalUrl of allImageUrls) {
    const uploadedUrl = await uploadOne(originalUrl)
    if (!uploadedUrl) {
      if (params.imageUrls.includes(originalUrl)) {
        newUrls.push(originalUrl)
      }
      skippedCount += 1
      continue
    }
    uploadedCount += 1
    if (params.imageUrls.includes(originalUrl)) {
      newUrls.push(uploadedUrl)
    }
    // content 是 markdown，直接做字符串替换即可（避免 regex 转义风险）
    content = content.split(originalUrl).join(uploadedUrl)
    answer = replaceImageUrlInAnswer(answer, originalUrl, uploadedUrl)
    explanation = explanation?.split(originalUrl).join(uploadedUrl) ?? null
    options = replaceImageUrlInOptions(options, originalUrl, uploadedUrl)
  }

  return {
    content,
    answer,
    explanation,
    options,
    assetUrl: newUrls[0] ?? params.assetUrl,
    imageUrls: newUrls,
    uploadedCount,
    skippedCount,
  }
}

function generateQuestionGroupContentHash(input: {
  material: string
  title?: string | null
  paperId?: string | null
  sourceSite?: string | null
}): string {
  return createHash('md5')
    .update(
      [
        input.sourceSite?.trim().toLowerCase() || '',
        input.paperId?.trim().toLowerCase() || '',
        input.title?.trim().toLowerCase() || '',
        input.material.trim().toLowerCase(),
      ].join('|')
    )
    .digest('hex')
}

function buildImportDiagnosticsSummaryText(diagnostics?: ImportDiagnostics | null): string | undefined {
  if (!diagnostics) return undefined
  const parts: string[] = []

  if (typeof diagnostics.expectedQuestionCount === 'number') {
    parts.push(`预期 ${diagnostics.expectedQuestionCount} 题`)
  }
  if (typeof diagnostics.normalizedQuestionCount === 'number') {
    parts.push(`解析 ${diagnostics.normalizedQuestionCount} 题`)
  }
  if (typeof diagnostics.createdQuestionCount === 'number') {
    parts.push(`入库 ${diagnostics.createdQuestionCount} 题`)
  }
  if ((diagnostics.missingRawQuestionIds?.length ?? 0) > 0) {
    parts.push(`缺失 ${diagnostics.missingRawQuestionIds!.length} 题`)
  }
  if ((diagnostics.duplicatedRawQuestionIds?.length ?? 0) > 0) {
    parts.push(`重复 ${diagnostics.duplicatedRawQuestionIds!.length} 题`)
  }
  if ((diagnostics.failedQuestions?.length ?? 0) > 0) {
    parts.push(`失败 ${diagnostics.failedQuestions!.length} 题`)
  }
  if ((diagnostics.detectedQuestionGroupCount ?? 0) > 0) {
    parts.push(`组合题 ${diagnostics.detectedQuestionGroupCount} 组`)
  }

  return parts.length > 0 ? parts.join(' / ') : undefined
}

function buildImportDiagnosticsPreviewText(diagnostics?: ImportDiagnostics | null): string | undefined {
  const missingIds = diagnostics?.missingRawQuestionIds ?? []
  if (missingIds.length > 0) {
    const preview = missingIds.slice(0, 3).join(', ')
    return missingIds.length > 3 ? `缺失题号：${preview} 等` : `缺失题号：${preview}`
  }

  const detectedGroupIds = diagnostics?.detectedQuestionGroupIds ?? []
  if (detectedGroupIds.length > 0) {
    const preview = detectedGroupIds.slice(0, 2).join(', ')
    return detectedGroupIds.length > 2
      ? `识别到组合题组：${preview} 等`
      : `识别到组合题组：${preview}`
  }

  return undefined
}

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
  const isQueuedExecution =
    Boolean(input._sourceFileId) && Boolean(input._uploadedBy) && input._skipAuthCheck === true

  // 进度回调封装
  const reportProgress = (progress: ImportProgress) => {
    if (options?.onProgress) {
      options.onProgress(progress)
    }
  }

  let sourceFileId: string | null = input._sourceFileId ?? null

  const writeQueuedFileProgress = async (
    diagnostics: ImportDiagnostics
  ): Promise<void> => {
    if (!sourceFileId) return
    await updateSourceFileImportDiagnostics(sourceFileId, diagnostics)
  }

  try {
    // ==================== 阶段 1: 初始化 ====================
    reportProgress(createProgress('INIT', '正在初始化导入任务...'))

    const currentUserId = isQueuedExecution ? input._uploadedBy! : null

    // 获取当前用户
    const currentUser = isQueuedExecution ? null : await getCurrentUser()
    if (!isQueuedExecution && !currentUser) {
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
        status: { in: [ProcessingStatus.COMPLETED, ProcessingStatus.PROCESSING, ProcessingStatus.PENDING] },
        ...(input._sourceFileId
          ? {
              NOT: {
                id: input._sourceFileId,
              },
            }
          : {}),
      },
    })

    if (existingFile) {
      return {
        success: false,
        error: '该文件已经处理过或正在处理中',
        code: 'ALREADY_PROCESSED',
      }
    }

    const sourceFileType = getSourceFileTypeByUrl(input.pdfUrl)
    let sourceFileRef: { id: string } | null = null

    if (!isQueuedExecution) {
      const queuePayload = toQueuedFileImportPayload(input)
      const sourceFile = await prisma.sourceFile.create({
        data: {
          filename,
          sourceNote: input.source?.trim() || null,
          fileUrl: input.pdfUrl,
          fileType: sourceFileType,
          fileSize: 0, // TODO: 获取实际文件大小
          subjectId: input.subjectId,
          uploadedBy: currentUser!.id,
          status: ProcessingStatus.PENDING,
          ocrStatus: ProcessingStatus.PENDING,
          importDiagnostics: buildQueuedFileImportDiagnostics(queuePayload) as Prisma.InputJsonValue,
        },
      })
      sourceFileId = sourceFile.id
      sourceFileRef = { id: sourceFile.id }
      triggerPendingWebImportQueue()

      return {
        success: true,
        data: {
          success: true,
          sourceFileId,
          questionsCreated: 0,
          questionsDuplicated: 0,
          questionsFailed: 0,
          questionIds: [],
          ocrDuration: 0,
          structureDuration: 0,
          totalDuration: Date.now() - startTime,
          estimatedCost: 0,
        },
      }
    }

    sourceFileRef = {
      id: sourceFileId!,
    }

    try {
      // ==================== 阶段 3: OCR 处理 ====================
      reportProgress(createProgress('OCR_PROCESSING', '正在进行 OCR 识别...', { stageProgress: 0 }))
      await writeQueuedFileProgress({
        ...buildQueuedFileImportDiagnostics(toQueuedFileImportPayload(input)),
        currentStage: 'OCR_PROCESSING',
        currentStageLabel: 'OCR 识别',
        statusSummary: '正在进行 OCR 识别...',
        overallProgress: 12,
        stageProgress: 0,
      })

      const ocrStartTime = Date.now()

      // 更新 OCR 状态
      await prisma.sourceFile.update({
        where: { id: sourceFileRef.id },
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
        if (sourceFileType === 'pdf') {
          reportProgress(createProgress('OCR_PROCESSING', 'PDF OCR 处理中...', { stageProgress: 30 }))
          ocrResults = await ocrService.processPDF(input.pdfUrl, {
            maxPages: options?.maxPages ?? MAX_PAGES,
            maxCost: options?.maxOcrCost ?? DEFAULT_MAX_OCR_COST,
          })
        } else {
          // 处理单图（JPG/PNG/WEBP）
          reportProgress(createProgress('OCR_PROCESSING', 'OCR 处理中...', { stageProgress: 50 }))

          const result = await ocrService.processImage(input.pdfUrl, {
            maxCost: options?.maxOcrCost ?? DEFAULT_MAX_OCR_COST,
          })

          ocrResults = [result]
        }
      } catch (ocrError) {
        // OCR 失败，更新状态
        await prisma.sourceFile.update({
          where: { id: sourceFileRef.id },
          data: {
            status: ProcessingStatus.FAILED,
            ocrStatus: ProcessingStatus.FAILED,
            importDiagnostics: stripUndefinedDeep({
              ...buildQueuedFileImportDiagnostics(toQueuedFileImportPayload(input)),
              currentStage: 'OCR_PROCESSING',
              currentStageLabel: 'OCR 识别',
            statusSummary: 'OCR 识别失败',
            overallProgress: 0,
            stageProgress: 0,
            }) as unknown as Prisma.InputJsonValue,
          },
        })

        throw ocrError
      }

      ocrDuration = Date.now() - ocrStartTime

      const usedMockProvider = ocrResults.some((r) => r.provider === 'mock')
      const allowMockImport = process.env.OCR_ENABLE_MOCK === 'true'
      if (usedMockProvider && !allowMockImport) {
        await prisma.sourceFile.update({
          where: { id: sourceFileRef.id },
          data: {
            status: ProcessingStatus.FAILED,
            ocrStatus: ProcessingStatus.FAILED,
          },
        })

        return {
          success: false,
          error: '检测到 Mock OCR 输出，已阻止入库。请配置真实 OCR（Tesseract/Mathpix/Google Vision）后重试。',
          code: 'OCR_FAILED',
        }
      }

      // 合并所有页面的文本
      const fullOcrText = ocrResults
        .filter((r) => r.success)
        .map((r) => r.text)
        .join('\n\n---PAGE BREAK---\n\n')

      // 计算平均置信度
      void (ocrResults.length > 0
        ? ocrResults.reduce((sum, r) => sum + (r.success ? r.confidence : 0), 0) / ocrResults.length
        : 0)

      // 计算 OCR 成本
      estimatedCost = ocrResults.reduce((sum, r) => sum + r.estimatedCost, 0)

      // 更新源文件 OCR 结果
      await prisma.sourceFile.update({
        where: { id: sourceFileRef.id },
        data: {
          ocrStatus: ProcessingStatus.COMPLETED,
          ocrRawText: fullOcrText.substring(0, 100000), // 限制长度
          importDiagnostics: stripUndefinedDeep({
            ...buildQueuedFileImportDiagnostics(toQueuedFileImportPayload(input)),
            currentStage: 'OCR_PROCESSING',
            currentStageLabel: 'OCR 识别',
            statusSummary: 'OCR 已完成，准备结构化题目...',
            overallProgress: 38,
            stageProgress: 100,
          }) as unknown as Prisma.InputJsonValue,
        },
      })

      // 检查 OCR 结果
      if (!fullOcrText || fullOcrText.trim().length < 10) {
        await prisma.sourceFile.update({
          where: { id: sourceFileRef.id },
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
      await writeQueuedFileProgress({
        ...buildQueuedFileImportDiagnostics(toQueuedFileImportPayload(input)),
        currentStage: 'STRUCTURING',
        currentStageLabel: 'AI 结构化',
        statusSummary: '正在使用 AI 分析题目结构...',
        overallProgress: 48,
        stageProgress: 0,
      })

      const structureStartTime = Date.now()

      const aiStructurer = new AIStructurer()
      const structureResult = await aiStructurer.structureQuestions(fullOcrText, {
        subjectId: input.subjectId,
        source: input.source,
      })

      structureDuration = Date.now() - structureStartTime

      if (!structureResult.success || !structureResult.questions || structureResult.questions.length === 0) {
        await prisma.sourceFile.update({
          where: { id: sourceFileRef.id },
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
        await writeQueuedFileProgress({
          ...buildQueuedFileImportDiagnostics(toQueuedFileImportPayload(input)),
          currentStage: 'QUALITY_CHECK',
          currentStageLabel: '质量检查',
          statusSummary: '正在进行质量检查...',
          overallProgress: 66,
          stageProgress: 0,
        })
      }

      // 转换为创建输入并计算质量分数
      const questionsToCreateDraft: CreateQuestionInput[] = structureResult.questions.map((q) => {
        const qualityScore = options?.skipQualityCheck ? undefined : calculateQualityScore(q)

        return convertToCreateInput(q, {
          chapterId: input.chapterId,
          subjectId: input.subjectId,
          sourceFileId: sourceFileRef.id,
          source: input.source,
          isPastPaper: input.isPastPaper ?? false,
          paperId: input.isPastPaper ? input.paperId ?? null : null,
          qualityScore,
        })
      })
      const questionsToCreate = await autoAssignQuestionChapters(
        questionsToCreateDraft
      )

      // ==================== 阶段 6: 保存入库 ====================
      reportProgress(createProgress('SAVING', `正在保存 ${questionsToCreate.length} 道题目...`))
      await writeQueuedFileProgress({
        ...buildQueuedFileImportDiagnostics(toQueuedFileImportPayload(input)),
        currentStage: 'SAVING',
        currentStageLabel: '保存入库',
        statusSummary: `正在保存 ${questionsToCreate.length} 道题目...`,
        overallProgress: 82,
        stageProgress: 0,
      })

      const bulkResult = await bulkCreateQuestions({
        questions: questionsToCreate,
        sourceFileId: sourceFileRef.id,
        createdBy: currentUserId ?? currentUser!.id,
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
      await moveImportedQuestionsToReviewPending(questionIds, currentUserId ?? currentUser!.id)

      // 更新源文件状态
      await prisma.sourceFile.update({
        where: { id: sourceFileRef.id },
        data: {
          status: ProcessingStatus.COMPLETED,
          processedAt: new Date(),
          importDiagnostics: stripUndefinedDeep({
            ...buildQueuedFileImportDiagnostics(toQueuedFileImportPayload(input)),
            currentStage: 'SAVING',
            currentStageLabel: '保存入库',
            statusSummary: `导入完成，共 ${questionsCreated} 道题目`,
            overallProgress: 100,
            stageProgress: 100,
            createdQuestionCount: questionsCreated,
            duplicatedQuestionCount: questionsDuplicated,
            failedQuestionCount: questionsFailed,
          }) as unknown as Prisma.InputJsonValue,
        },
      })

      // ==================== 完成 ====================
      const totalDuration = Date.now() - startTime

      reportProgress(createProgress('COMPLETED', `导入完成，共 ${questionsCreated} 道题目`))

      safeRevalidatePath('/admin/content/review')
      safeRevalidatePath('/admin/content/import')

      return {
        success: true,
        data: {
          success: true,
          sourceFileId: sourceFileRef.id,
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
        where: { id: sourceFileRef.id },
        data: {
          status: ProcessingStatus.FAILED,
          importDiagnostics: stripUndefinedDeep({
            ...buildQueuedFileImportDiagnostics(toQueuedFileImportPayload(input)),
            currentStage: 'SAVING',
            currentStageLabel: '保存入库',
            statusSummary: error instanceof Error ? `导入失败：${error.message}` : '导入失败',
            overallProgress: 0,
            stageProgress: 0,
          }) as unknown as Prisma.InputJsonValue,
        },
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

/**
 * 从网页链接批量导入（当前支持 Examcoo view 页面）
 */
export async function importFromWebUrl(
  input: ImportFromWebUrlInput
): Promise<ServiceResult<ImportResult>> {
  const startTime = Date.now()
  const pageUrl = input.pageUrl?.trim()
  const isQueuedExecution =
    Boolean(input._sourceFileId) &&
    Boolean(input._uploadedBy) &&
    input._skipAuthCheck === true

  if (!pageUrl) {
    return {
      success: false,
      error: '网页链接不能为空',
      code: 'INVALID_PDF',
    }
  }

  const resolvedAdapter = await resolveWebImportAdapter(pageUrl)
  if (!resolvedAdapter.success || !resolvedAdapter.data) {
    return {
      success: false,
      error: resolvedAdapter.error || '当前没有可处理该链接的网页导入适配器',
      code: resolvedAdapter.code || 'INVALID_PDF',
    }
  }

  let currentUserId = input._uploadedBy ?? ''
  if (!isQueuedExecution) {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return {
        success: false,
        error: '用户未登录',
        code: 'UNAUTHORIZED',
      }
    }

    if (!['ADMIN', 'TEACHER'].includes(currentUser.role)) {
      return {
        success: false,
        error: '仅管理员或教师可以执行网页导入',
        code: 'UNAUTHORIZED',
      }
    }
    currentUserId = currentUser.id
  }

  const subject = await prisma.subject.findUnique({ where: { id: input.subjectId } })
  if (!subject) {
    return {
      success: false,
      error: `科目不存在: ${input.subjectId}`,
      code: 'INVALID_PDF',
    }
  }

  const existingFile = await prisma.sourceFile.findFirst({
    where: {
      fileUrl: pageUrl,
      status: { in: [ProcessingStatus.COMPLETED, ProcessingStatus.PROCESSING, ProcessingStatus.PENDING] },
      ...(input._sourceFileId
        ? {
            NOT: {
              id: input._sourceFileId,
            },
          }
        : {}),
    },
  })
  if (existingFile) {
    return {
      success: false,
      error: '该网页已处理过或正在处理中',
      code: 'ALREADY_PROCESSED',
    }
  }

  let sourceFileId: string | null = input._sourceFileId ?? null
  let pendingImportDiagnostics: ImportDiagnostics | null = null
  const stageDurations: NonNullable<ImportDiagnostics['stageDurations']> = {}
  let lastProgressWriteAt = 0

  try {
    if (!isQueuedExecution) {
      const queuePayload = toQueuedWebImportPayload(input)
      const sourceFile = await prisma.sourceFile.create({
        data: {
          filename: extractFilename(pageUrl) || `${resolvedAdapter.data.name}.html`,
          sourceNote: input.source?.trim() || null,
          fileUrl: pageUrl,
          fileType: 'html',
          fileSize: 0,
          subjectId: input.subjectId,
          uploadedBy: currentUserId,
          status: ProcessingStatus.PENDING,
          ocrStatus: ProcessingStatus.SKIPPED,
          importDiagnostics: buildQueuedWebImportDiagnostics(queuePayload) as Prisma.InputJsonValue,
        },
        select: { id: true },
      })
      sourceFileId = sourceFile.id
      triggerPendingWebImportQueue()

      return {
        success: true,
        data: {
          success: true,
          sourceFileId,
          questionsCreated: 0,
          questionsDuplicated: 0,
          questionsFailed: 0,
          questionIds: [],
          ocrDuration: 0,
          structureDuration: 0,
          totalDuration: Date.now() - startTime,
          estimatedCost: 0,
        },
      }
    }

    const writeProgress = async (
      diagnostics: ImportDiagnostics,
      options?: { force?: boolean }
    ) => {
      if (!sourceFileId) return
      const now = Date.now()
      if (!options?.force && now - lastProgressWriteAt < 1200) return
      lastProgressWriteAt = now
      await updateSourceFileImportDiagnostics(sourceFileId, diagnostics)
    }

    await writeProgress(
      buildWebImportProgressState({
        stage: 'CRAWLING',
        stageLabel: '网页抓取',
        statusSummary: '正在解析试卷结构...',
        overallProgress: 5,
        stageProgress: 0,
      }),
      { force: true }
    )

    const crawlStartTime = Date.now()
    const webImportResult = await runWebImport({
      pageUrl,
      subjectId: input.subjectId,
      source: input.source,
      chapterId: input.chapterId,
      maxQuestions: input.maxQuestions,
      onProgress: async (progress) => {
        if (progress.stage !== 'CRAWLING') return
        const total = Math.max(progress.totalQuestionCount, 1)
        const stageProgress = (progress.processedQuestionCount / total) * 100
        await writeProgress(
          buildWebImportProgressState({
            stage: 'CRAWLING',
            stageLabel: '网页抓取',
            statusSummary:
              progress.processedQuestionCount < total
                ? `正在抓取题目 ${progress.processedQuestionCount}/${total}`
                : `网页抓取完成 ${total}/${total}`,
            overallProgress: 5 + stageProgress * 0.57,
            stageProgress,
            totalQuestionCount: total,
            processedQuestionCount: progress.processedQuestionCount,
          }),
          {
            force:
              progress.processedQuestionCount === 0 ||
              progress.processedQuestionCount === total ||
              progress.processedQuestionCount % 4 === 0,
          }
        )
      },
    })
    stageDurations.crawlMs = Date.now() - crawlStartTime
    if (!webImportResult.success || !webImportResult.data) {
      throw new Error(webImportResult.error || '网页导入失败')
    }
    const webImportData = webImportResult.data

    const questionsToCreateDraft: CreateQuestionInput[] = []
    const questionGroupsToCreateDraft: PersistedQuestionGroupDraft[] = []
    const stemImageSupabase =
      webImportData.adapterName === 'examcoo-view' ? await createSupabaseClient() : null
    const stemImageUrlCache = new Map<string, Promise<string | null>>()
    const totalQuestionCount = webImportData.normalized.questions.length
    const totalAssetCount = webImportData.diagnostics.assetCount ?? 0

    await writeProgress(
      buildWebImportProgressState({
        stage: 'PERSISTING_IMAGES',
        stageLabel: '图片转存',
        statusSummary:
          totalAssetCount > 0
            ? `正在转存图片 0/${totalAssetCount}`
            : `正在整理题目 0/${totalQuestionCount}`,
        overallProgress: 62,
        stageProgress: 0,
        totalQuestionCount,
        processedQuestionCount: 0,
        totalAssetCount,
        processedAssetCount: 0,
      }),
      { force: true }
    )

    const imagePersistStartTime = Date.now()
    let processedImageQuestions = 0
    let processedAssets = 0

    for (const group of webImportData.normalized.questionGroups ?? []) {
      const persistedGroupMaterial = await persistQuestionImagesToSupabase({
        pageUrl,
        adapterName: webImportData.adapterName,
        paperId: group.paperId ?? null,
        content: group.material,
        answer: '',
        explanation: null,
        options: null,
        assetUrl: group.materialImageUrls[0] ?? null,
        imageUrls: group.materialImageUrls ?? [],
        answerImageUrls: [],
        explanationImageUrls: [],
        supabase: stemImageSupabase ?? undefined,
        urlCache: stemImageUrlCache,
      })

      questionGroupsToCreateDraft.push({
        rawGroupId: group.rawGroupId,
        title: group.title ?? null,
        material: group.material,
        materialImageUrls: group.materialImageUrls ?? [],
        questionIds: group.questionIds,
        selectedQuestionIds: group.selectedQuestionIds,
        persistedMaterial: persistedGroupMaterial.content,
        persistedImageUrls: persistedGroupMaterial.imageUrls,
        assetUrl: persistedGroupMaterial.assetUrl,
        sourceMeta:
          group.sourceMeta && typeof group.sourceMeta === 'object'
            ? (group.sourceMeta as Record<string, unknown>)
            : undefined,
      })
    }

    const draftResults = await mapWithConcurrency(
      webImportData.normalized.questions,
      WEB_IMPORT_IMAGE_CONCURRENCY,
      async (question) => {
        const persisted = await persistQuestionImagesToSupabase({
          pageUrl,
          adapterName: webImportData.adapterName,
          paperId: question.paperId ?? null,
          content: question.content,
          answer: question.answer,
          explanation: question.explanation ?? null,
          options: question.options ?? null,
          assetUrl: question.assetUrl ?? null,
          imageUrls:
            question.imageUrls.length > 0 ? question.imageUrls : question.assetUrl ? [question.assetUrl] : [],
          answerImageUrls: extractAnswerImageUrls(question.answer),
          explanationImageUrls: question.explanationImageUrls ?? [],
          supabase: stemImageSupabase ?? undefined,
          urlCache: stemImageUrlCache,
        })

        processedImageQuestions += 1
        const questionAssetCount = Array.from(
          new Set([
            ...(question.imageUrls.length > 0
              ? question.imageUrls
              : question.assetUrl
                ? [question.assetUrl]
                : []),
            ...extractAnswerImageUrls(question.answer),
            ...(question.explanationImageUrls ?? []),
          ])
        ).length
        processedAssets += questionAssetCount
        const stageProgress =
          totalQuestionCount > 0 ? (processedImageQuestions / totalQuestionCount) * 100 : 100
        await writeProgress(
          buildWebImportProgressState({
            stage: 'PERSISTING_IMAGES',
            stageLabel: '图片转存',
            statusSummary:
              totalAssetCount > 0
                ? `正在转存图片 ${Math.min(processedAssets, totalAssetCount)}/${totalAssetCount}`
                : `正在整理题目 ${processedImageQuestions}/${totalQuestionCount}`,
            overallProgress: 62 + stageProgress * 0.3,
            stageProgress,
            totalQuestionCount,
            processedQuestionCount: processedImageQuestions,
            totalAssetCount,
            processedAssetCount: Math.min(processedAssets, totalAssetCount),
          }),
          {
            force:
              processedImageQuestions === totalQuestionCount ||
              processedImageQuestions % 3 === 0,
          }
        )

        return {
          question,
          persisted,
        }
      }
    )

    const questionGroupIdMap = new Map<string, string>()
    for (const group of questionGroupsToCreateDraft) {
      const contentHash = generateQuestionGroupContentHash({
        material: group.persistedMaterial,
        title: group.title,
        paperId: webImportData.normalized.paperId ?? null,
        sourceSite: webImportData.normalized.sourceSite,
      })

      const existingGroup = await prisma.questionGroup.findUnique({
        where: { contentHash },
        select: { id: true },
      })

      const targetGroupId =
        existingGroup?.id ??
        (
          await prisma.questionGroup.create({
            data: {
              subjectId: input.subjectId,
              chapterId: input.chapterId ?? null,
              sourceFileId,
              curriculum: 'UEC',
              grade: null,
              title: group.title,
              material: group.persistedMaterial,
              assetUrl: group.assetUrl,
              imageUrls: group.persistedImageUrls,
              source: buildWebImportQuestionSource(
                input,
                typeof group.sourceMeta?.sourceTag === 'string'
                  ? group.sourceMeta.sourceTag
                  : typeof group.sourceMeta?.sourceOverride === 'string'
                    ? group.sourceMeta.sourceOverride
                    : null
              ),
              tags: [webImportData.normalized.sourceSite, 'web-import', 'question-group'],
              isPastPaper: input.isPastPaper ?? false,
              paperId:
                input.isPastPaper
                  ? input.paperId ?? webImportData.normalized.paperId ?? null
                  : null,
              contentHash,
              status: ContentStatus.DRAFT,
              createdBy: currentUserId,
            },
            select: { id: true },
          })
        ).id

      questionGroupIdMap.set(group.rawGroupId, targetGroupId)
    }

    for (const { question, persisted } of draftResults) {
      const sourceMeta =
        question.sourceMeta && typeof question.sourceMeta === 'object'
          ? (question.sourceMeta as Record<string, unknown>)
          : undefined
      const rawGroupId =
        typeof sourceMeta?.groupId === 'string' && sourceMeta.groupId.trim().length > 0
          ? sourceMeta.groupId
          : null
        questionsToCreateDraft.push({
          content: persisted.content,
          type: question.type,
        difficulty: 3,
          curriculum: 'UEC',
          grade: null,
          subjectId: input.subjectId,
          groupId: rawGroupId ? questionGroupIdMap.get(rawGroupId) ?? null : null,
          chapterId: input.chapterId ?? null,
        options: persisted.options,
        answer: persisted.answer,
        explanation: persisted.explanation,
        sourceFileId,
        source: buildWebImportQuestionSource(
          input,
          typeof question.sourceMeta?.sourceTag === 'string' ? question.sourceMeta.sourceTag : null
        ),
        tags: [question.sourceSite, 'web-import'],
        assetUrl: persisted.assetUrl,
        imageUrls: persisted.imageUrls,
        isPastPaper: input.isPastPaper ?? false,
        paperId: input.isPastPaper ? input.paperId ?? question.paperId ?? null : null,
        qualityScore: null,
        createdBy: currentUserId,
      })
    }
    stageDurations.imagePersistMs = Date.now() - imagePersistStartTime

    const chapterTaggingStartTime = Date.now()
    await writeProgress(
      buildWebImportProgressState({
        stage: 'TAGGING_CHAPTERS',
        stageLabel: '章节打标',
        statusSummary: `正在打标章节 ${questionsToCreateDraft.length} 题`,
        overallProgress: 93,
        stageProgress: 0,
        totalQuestionCount,
        processedQuestionCount: questionsToCreateDraft.length,
        totalAssetCount,
        processedAssetCount: Math.min(processedAssets, totalAssetCount),
      }),
      { force: true }
    )
    const questionsToCreate = await autoAssignQuestionChapters(
      questionsToCreateDraft
    )
    stageDurations.chapterTaggingMs = Date.now() - chapterTaggingStartTime

    const saveStartTime = Date.now()
    await writeProgress(
      buildWebImportProgressState({
        stage: 'SAVING',
        stageLabel: '批量入库',
        statusSummary: `正在写入题库 ${questionsToCreate.length} 题`,
        overallProgress: 96,
        stageProgress: 0,
        totalQuestionCount,
        processedQuestionCount: questionsToCreate.length,
        totalAssetCount,
        processedAssetCount: Math.min(processedAssets, totalAssetCount),
      }),
      { force: true }
    )
    const bulkResult = await bulkCreateQuestions({
      questions: questionsToCreate,
      sourceFileId: sourceFileId!,
      createdBy: currentUserId,
    })
    stageDurations.saveMs = Date.now() - saveStartTime

    const reviewSubmitStartTime = Date.now()
    await writeProgress(
      buildWebImportProgressState({
        stage: 'SUBMITTING_REVIEW',
        stageLabel: '提交审核',
        statusSummary: `正在提交审核 ${bulkResult.results.filter((r) => r.success).length} 题`,
        overallProgress: 99,
        stageProgress: 0,
        totalQuestionCount,
        processedQuestionCount: questionsToCreate.length,
        totalAssetCount,
        processedAssetCount: Math.min(processedAssets, totalAssetCount),
      }),
      { force: true }
    )
    pendingImportDiagnostics = stripUndefinedDeep({
      adapterName: webImportResult.data.adapterName,
      adapterVersion: webImportResult.data.adapterVersion,
      ...buildWebImportDiagnostics(
        webImportData.diagnostics,
        webImportData.normalized.questions,
        bulkResult.results.map((result) => ({
          index: result.index,
          success: result.success,
          error: result.error,
        }))
      ),
      stageDurations,
      currentStage: undefined,
      currentStageLabel: undefined,
      statusSummary: undefined,
      overallProgress: 100,
      stageProgress: 100,
      totalQuestionCount,
      processedQuestionCount: questionsToCreate.length,
      totalAssetCount,
      processedAssetCount: Math.min(processedAssets, totalAssetCount),
    })

    const questionsCreated = bulkResult.results.filter((r) => r.success).length
    const questionsDuplicated = bulkResult.results.filter(
      (r) => !r.success && isDuplicateBulkCreateError(r.error)
    ).length
    const questionsFailed = bulkResult.failed - questionsDuplicated
    const questionIds = bulkResult.results
      .filter((r) => r.success && r.data)
      .map((r) => r.data!.id)
    await moveImportedQuestionsToReviewPending(questionIds, currentUserId)
    stageDurations.reviewSubmitMs = Date.now() - reviewSubmitStartTime
    stageDurations.totalMs = Date.now() - startTime
    if (pendingImportDiagnostics) {
      pendingImportDiagnostics.stageDurations = stageDurations
    }

    // 两段式写回：先确保批次状态落成 COMPLETED（避免 diagnostics 写入失败导致卡在 PROCESSING）
    await prisma.sourceFile.update({
      where: { id: sourceFileId! },
      data: {
        status: ProcessingStatus.COMPLETED,
        processedAt: new Date(),
      },
    })

    // diagnostics 是增强信息，写入失败不应阻塞主流程
    try {
      await prisma.sourceFile.update({
        where: { id: sourceFileId! },
        data: {
          importDiagnostics: pendingImportDiagnostics as Prisma.InputJsonValue,
        },
      })
    } catch (diagnosticsError) {
      console.warn('写入导入诊断失败（已忽略）:', diagnosticsError)
    }

    safeRevalidatePath('/admin/content/review')
    safeRevalidatePath('/admin/content/import')

    return {
      success: true,
      data: {
        success: true,
        sourceFileId: sourceFileId!,
        questionsCreated,
        questionsDuplicated,
        questionsFailed,
        questionIds,
        ocrDuration: 0,
        structureDuration: 0,
        totalDuration: Date.now() - startTime,
        estimatedCost: 0,
      },
    }
  } catch (error) {
    if (sourceFileId) {
      const recovered = await recoverImportedBatchToCompleted({
        sourceFileId,
        preferredReviewerId: currentUserId,
        diagnostics: pendingImportDiagnostics,
        statusSummary: '导入已自动恢复完成（入库成功，收尾阶段已补偿）',
      })

      if (recovered.recovered) {
        return {
          success: true,
          data: {
            success: true,
            sourceFileId,
            questionsCreated: recovered.questionIds.length,
            questionsDuplicated: 0,
            questionsFailed: 0,
            questionIds: recovered.questionIds,
            ocrDuration: 0,
            structureDuration: 0,
            totalDuration: Date.now() - startTime,
            estimatedCost: 0,
          },
        }
      }

      // 优先把状态落成 FAILED，diagnostics 写入失败不影响状态落库
      try {
        await prisma.sourceFile.update({
          where: { id: sourceFileId },
          data: {
            status: ProcessingStatus.FAILED,
          },
        })
      } catch (statusError) {
        console.warn('写入失败状态失败（可能 schema 未同步）:', statusError)
      }

      if (pendingImportDiagnostics) {
        try {
          await prisma.sourceFile.update({
            where: { id: sourceFileId },
            data: {
              importDiagnostics:
                pendingImportDiagnostics as Prisma.InputJsonValue,
            },
          })
        } catch (diagnosticsError) {
          console.warn('写入失败诊断失败（已忽略）:', diagnosticsError)
        }
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : '网页导入失败',
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
        sourceFileId: sourceFile.id,
      },
      select: {
        chapter: {
          select: { subjectId: true },
        },
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
    await moveImportedQuestionsToReviewPending(questionIds, currentUser.id)

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

    safeRevalidatePath('/admin/content/review')
    safeRevalidatePath('/admin/content/import')

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
      subject?: {
        id: string
        name: string
      }
      source?: string
      sourceYear?: number
      curriculum?: string
      events?: ImportEventCode[]
      importDiagnostics?: ImportDiagnostics | null
    }>
    total: number
  }>
> {
  try {
    const now = new Date()
    const stuckCutoff = new Date(now.getTime() - 3 * 60 * 1000)
    const where = options?.status ? { status: options.status } : {}

    const [tasks, total] = await prisma.$transaction([
      prisma.sourceFile.findMany({
        where,
        include: {
          subject: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: { questions: true },
          },
          questions: {
            take: 1,
            orderBy: { createdAt: 'asc' },
            select: {
              source: true,
              curriculum: true,
              subject: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: options?.limit ?? 20,
        skip: options?.offset ?? 0,
      }),
      prisma.sourceFile.count({ where }),
    ])

    // 自愈：极少数情况下（例如请求中断/进程重启），网页导入可能已完成入库但 source_files 仍停留在 PROCESSING。
    // 只对满足以下条件的批次做“安全补全”：
    // - 仍为 PROCESSING 且无 processedAt
    // - OCR 已跳过（html/web import）
    // - 已有入库题目（_count.questions > 0）
    // - 创建时间超过 3 分钟（避免误伤正在执行的任务）
    const stuckIds = tasks
      .filter(
        (task) =>
          task.status === ProcessingStatus.PROCESSING &&
          !task.processedAt &&
          task.ocrStatus === ProcessingStatus.SKIPPED &&
          task._count.questions > 0 &&
          task.createdAt < stuckCutoff
      )
      .map((task) => task.id)

    const stuckIdSet = new Set(stuckIds)
    if (stuckIds.length > 0) {
      await prisma.sourceFile.updateMany({
        where: {
          id: { in: stuckIds },
          status: ProcessingStatus.PROCESSING,
          processedAt: null,
        },
        data: {
          status: ProcessingStatus.COMPLETED,
          processedAt: now,
        },
      })
    }

    const sourceIds = tasks.map((task) => task.id)
    const questionRows =
      sourceIds.length > 0
        ? await prisma.question.findMany({
            where: { sourceFileId: { in: sourceIds } },
            select: {
              sourceFileId: true,
              status: true,
              reportCount: true,
            },
          })
        : []

    const bySource = questionRows.reduce<
      Record<
        string,
        {
          statuses: ContentStatus[]
          hasReported: boolean
        }
      >
    >((acc, row) => {
      const key = row.sourceFileId || ''
      if (!key) return acc
      if (!acc[key]) {
        acc[key] = { statuses: [], hasReported: false }
      }
      acc[key].statuses.push(row.status)
      if ((row.reportCount ?? 0) > 0) {
        acc[key].hasReported = true
      }
      return acc
    }, {})

    return {
      success: true,
      data: {
        tasks: tasks.map((t) => {
          const resolvedSubject = t.subject || t.questions[0]?.subject
          const resolvedStatus = stuckIdSet.has(t.id)
            ? ProcessingStatus.COMPLETED
            : t.status
          const resolvedProcessedAt = stuckIdSet.has(t.id)
            ? now
            : t.processedAt
          return {
            ...(resolvedSubject
              ? {
                  subject: {
                    id: resolvedSubject.id,
                    name: resolvedSubject.name,
                  },
                }
              : {}),
            id: t.id,
            filename: t.filename,
            fileUrl: t.fileUrl,
            status: resolvedStatus,
            ocrStatus: t.ocrStatus,
            questionsCount: t._count.questions,
            createdAt: t.createdAt,
            processedAt: resolvedProcessedAt,
            source: t.sourceNote ?? t.questions[0]?.source ?? undefined,
            curriculum: t.questions[0]?.curriculum ?? 'UEC',
            sourceYear:
              t.questions[0]?.source && /(19|20)\d{2}/.test(t.questions[0].source)
                ? Number(t.questions[0].source.match(/(19|20)\d{2}/)?.[0])
                : undefined,
            events: deriveImportEvents({
              sourceStatus: resolvedStatus,
              questionStatuses: bySource[t.id]?.statuses ?? [],
              hasReportedQuestion: bySource[t.id]?.hasReported ?? false,
            }),
            importDiagnostics: (t.importDiagnostics as ImportDiagnostics | null | undefined) ?? null,
            diagnosticsSummary: buildImportDiagnosticsSummaryText(
              (t.importDiagnostics as ImportDiagnostics | null | undefined) ?? null
            ),
            diagnosticsPreview: buildImportDiagnosticsPreviewText(
              (t.importDiagnostics as ImportDiagnostics | null | undefined) ?? null
            ),
          }
        }),
        total,
      },
    }
  } catch (error) {
    console.error('获取导入任务列表失败，尝试兼容降级查询:', error)

    // 兼容降级：当 schema / migration 暂未同步时，仍尽量返回基础任务列表
    // 注意：这里不依赖 source_files.subject 关系，改为从关联题目兜底取科目。
    try {
      const where = options?.status ? { status: options.status } : {}

      const [tasks, total] = await prisma.$transaction([
        prisma.sourceFile.findMany({
          where,
          select: {
            id: true,
            filename: true,
            sourceNote: true,
            fileUrl: true,
            status: true,
            ocrStatus: true,
            createdAt: true,
            processedAt: true,
            importDiagnostics: true,
            _count: {
              select: { questions: true },
            },
            questions: {
              take: 1,
              orderBy: { createdAt: 'asc' },
              select: {
                source: true,
                curriculum: true,
                subject: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: options?.limit ?? 20,
          skip: options?.offset ?? 0,
        }),
        prisma.sourceFile.count({ where }),
      ])

      const sourceIds = tasks.map((task) => task.id)
      const questionRows =
        sourceIds.length > 0
          ? await prisma.question.findMany({
              where: { sourceFileId: { in: sourceIds } },
              select: {
                sourceFileId: true,
                status: true,
                reportCount: true,
              },
            })
          : []

      const bySource = questionRows.reduce<
        Record<
          string,
          {
            statuses: ContentStatus[]
            hasReported: boolean
          }
        >
      >((acc, row) => {
        const key = row.sourceFileId || ''
        if (!key) return acc
        if (!acc[key]) {
          acc[key] = { statuses: [], hasReported: false }
        }
        acc[key].statuses.push(row.status)
        if ((row.reportCount ?? 0) > 0) {
          acc[key].hasReported = true
        }
        return acc
      }, {})

      return {
        success: true,
        data: {
          tasks: tasks.map((t) => ({
            ...(t.questions[0]?.subject
              ? {
                  subject: {
                    id: t.questions[0].subject.id,
                    name: t.questions[0].subject.name,
                  },
                }
              : {}),
            id: t.id,
            filename: t.filename,
            fileUrl: t.fileUrl,
            status: t.status,
            ocrStatus: t.ocrStatus,
            questionsCount: t._count.questions,
            createdAt: t.createdAt,
            processedAt: t.processedAt,
            source: t.sourceNote ?? t.questions[0]?.source ?? undefined,
            curriculum: t.questions[0]?.curriculum ?? 'UEC',
            sourceYear:
              t.questions[0]?.source && /(19|20)\d{2}/.test(t.questions[0].source)
                ? Number(t.questions[0].source.match(/(19|20)\d{2}/)?.[0])
                : undefined,
            events: deriveImportEvents({
              sourceStatus: t.status,
              questionStatuses: bySource[t.id]?.statuses ?? [],
              hasReportedQuestion: bySource[t.id]?.hasReported ?? false,
            }),
            importDiagnostics: (t.importDiagnostics as ImportDiagnostics | null | undefined) ?? null,
            diagnosticsSummary: buildImportDiagnosticsSummaryText(
              (t.importDiagnostics as ImportDiagnostics | null | undefined) ?? null
            ),
            diagnosticsPreview: buildImportDiagnosticsPreviewText(
              (t.importDiagnostics as ImportDiagnostics | null | undefined) ?? null
            ),
          })),
          total,
        },
      }
    } catch (fallbackError) {
      console.error('兼容降级查询失败:', fallbackError)
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取失败',
        code: 'FETCH_FAILED',
      }
    }
  }
}

export async function getImportDashboardStats(): Promise<ServiceResult<StatsData>> {
  try {
    const now = new Date()
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const [activeBatches, tasksToday, completedTasks, failedTasks, pendingReviewQuestions, importedQuestions7d] =
      await prisma.$transaction([
        prisma.sourceFile.count({
          where: {
            status: { in: [ProcessingStatus.PENDING, ProcessingStatus.PROCESSING] },
          },
        }),
        prisma.sourceFile.count({
          where: { createdAt: { gte: dayStart } },
        }),
        prisma.sourceFile.count({
          where: { status: ProcessingStatus.COMPLETED },
        }),
        prisma.sourceFile.count({
          where: { status: ProcessingStatus.FAILED },
        }),
        prisma.question.count({
          where: { status: ContentStatus.REVIEW_PENDING },
        }),
        prisma.question.count({
          where: {
            sourceFileId: { not: null },
            createdAt: { gte: sevenDaysAgo },
          },
        }),
      ])

    const storageRows = await prisma.$queryRawUnsafe<Array<{ bytes: string | number | null }>>(
      `select coalesce(sum(((metadata->>'size')::bigint)),0) as bytes from storage.objects where bucket_id = 'source-files'`
    )

    const bytesRaw = storageRows[0]?.bytes ?? 0
    const usedBytes = typeof bytesRaw === 'string' ? Number(bytesRaw) : Number(bytesRaw || 0)
    const usedMB = Math.round((usedBytes / 1024 / 1024) * 100) / 100
    const limitMB = Number(process.env.CONTENT_IMPORT_STORAGE_LIMIT_MB || 1024)
    const successRate = completedTasks + failedTasks > 0
      ? Math.round((completedTasks / (completedTasks + failedTasks)) * 100)
      : 0

    return {
      success: true,
      data: {
        tasksToday,
        completedTasks,
        failedTasks,
        successRate,
        pendingReviewQuestions,
        importedQuestions7d,
        activeBatches,
        storageUsed: usedMB,
        storageLimit: limitMB,
      },
    }
  } catch (error) {
    console.error('获取导入看板统计失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取统计失败',
      code: 'FETCH_FAILED',
    }
  }
}

function buildImportLogUser(user?: {
  email?: string | null
  username?: string | null
} | null): string {
  return user?.username || user?.email || '未知用户'
}

function buildImportActivityLogType(
  status: ProcessingStatus,
  phase: 'created' | 'completed'
): AuditLogEntry['type'] {
  if (phase === 'created') return 'info'
  if (status === ProcessingStatus.COMPLETED) return 'success'
  if (status === ProcessingStatus.FAILED) return 'error'
  return 'warning'
}

export async function getImportActivityLogs(options?: {
  limit?: number
  subjectId?: string
}): Promise<ServiceResult<AuditLogEntry[]>> {
  try {
    const scopedSubjectId = options?.subjectId?.trim()
    const sourceFiles = await prisma.sourceFile.findMany({
      where: {
        ...(scopedSubjectId ? { subjectId: scopedSubjectId } : {}),
      },
      select: {
        id: true,
        filename: true,
        sourceNote: true,
        status: true,
        createdAt: true,
        processedAt: true,
        uploader: {
          select: {
            email: true,
            username: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: Math.max(20, (options?.limit ?? 30) * 2),
    })

    const logs = sourceFiles
      .flatMap<AuditLogEntry>((file) => {
        const user = buildImportLogUser(file.uploader)
        const baseTarget = file.filename
        const entries: AuditLogEntry[] = [
          {
            id: `${file.id}-created`,
            user,
            avatar: '',
            action: '创建导入任务',
            target: baseTarget,
            timestamp: format(file.createdAt, 'yyyy-MM-dd HH:mm:ss'),
            type: buildImportActivityLogType(file.status, 'created'),
            comment: file.sourceNote || '已进入导入管线',
          },
        ]

        if (file.processedAt) {
          entries.push({
            id: `${file.id}-processed`,
            user,
            avatar: '',
            action:
              file.status === ProcessingStatus.COMPLETED
                ? '完成导入任务'
                : file.status === ProcessingStatus.FAILED
                  ? '导入任务失败'
                  : '更新导入任务状态',
            target: baseTarget,
            timestamp: format(file.processedAt, 'yyyy-MM-dd HH:mm:ss'),
            type: buildImportActivityLogType(file.status, 'completed'),
            comment:
              file.status === ProcessingStatus.COMPLETED
                ? '解析、结构化与入库流程已完成'
                : file.status === ProcessingStatus.FAILED
                  ? '任务处理失败，请结合批次状态排查'
                  : `当前状态：${file.status}`,
          })
        }

        return entries
      })
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, options?.limit ?? 30)

    return {
      success: true,
      data: logs,
    }
  } catch (error) {
    console.error('获取导入活动日志失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取导入活动日志失败',
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
      importDiagnostics?: ImportDiagnostics | null
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
          importDiagnostics: (sourceFile.importDiagnostics as ImportDiagnostics | null | undefined) ?? null,
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

export async function recomputeImportDiagnosticsForTask(input: {
  sourceFileId: string
}): Promise<
  ServiceResult<{
    importDiagnostics: ImportDiagnostics
    diagnosticsSummary?: string
    diagnosticsPreview?: string
  }>
> {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return {
        success: false,
        error: '用户未登录',
        code: 'UNAUTHORIZED',
      }
    }

    if (!['ADMIN', 'TEACHER'].includes(currentUser.role)) {
      return {
        success: false,
        error: '仅管理员或教师可以执行该操作',
        code: 'UNAUTHORIZED',
      }
    }

    const sourceFile = await prisma.sourceFile.findUnique({
      where: { id: input.sourceFileId },
      select: {
        id: true,
        fileUrl: true,
        fileType: true,
        subjectId: true,
        status: true,
        processedAt: true,
        importDiagnostics: true,
      },
    })

    if (!sourceFile) {
      return {
        success: false,
        error: '源文件不存在',
        code: 'NOT_FOUND',
      }
    }

    if (sourceFile.fileType !== 'html') {
      return {
        success: false,
        error: '当前仅支持网页导入任务的诊断重算',
        code: 'INVALID_PDF',
      }
    }
    if (!sourceFile.subjectId) {
      return {
        success: false,
        error: '当前任务缺少 subjectId，无法重算网页导入诊断',
        code: 'INVALID_PDF',
      }
    }

    const webImportResult = await runWebImport({
      pageUrl: sourceFile.fileUrl,
      subjectId: sourceFile.subjectId,
    })
    if (!webImportResult.success || !webImportResult.data) {
      return {
        success: false,
        error: webImportResult.error || '网页抓取失败，无法重算诊断',
        code: webImportResult.code || 'FETCH_FAILED',
      }
    }

    const createdCount = await prisma.question.count({
      where: { sourceFileId: sourceFile.id },
    })

    const diagnostics: ImportDiagnostics = stripUndefinedDeep({
      adapterName: webImportResult.data.adapterName,
      adapterVersion: webImportResult.data.adapterVersion,
      mode: webImportResult.data.diagnostics.mode,
      expectedQuestionCount: webImportResult.data.diagnostics.expectedQuestionCount,
      expectedRawQuestionIds: toStringArray(webImportResult.data.diagnostics.expectedRawQuestionIds),
      selectedQuestionCount: webImportResult.data.diagnostics.selectedQuestionCount,
      selectedRawQuestionIds: toStringArray(webImportResult.data.diagnostics.selectedRawQuestionIds),
      skippedByLimitRawQuestionIds: toStringArray(webImportResult.data.diagnostics.skippedByLimitRawQuestionIds),
      collectedQuestionCount: webImportResult.data.diagnostics.collectedQuestionCount,
      collectedRawQuestionIds: toStringArray(webImportResult.data.diagnostics.collectedRawQuestionIds),
      normalizedQuestionCount: webImportResult.data.diagnostics.normalizedQuestionCount,
      normalizedRawQuestionIds: toStringArray(webImportResult.data.diagnostics.normalizedRawQuestionIds),
      missingRawQuestionIds: toStringArray(webImportResult.data.diagnostics.missingRawQuestionIds),
      detectedQuestionGroupCount: webImportResult.data.diagnostics.detectedQuestionGroupCount,
      detectedQuestionGroupIds: toStringArray(webImportResult.data.diagnostics.detectedQuestionGroupIds),
      assetCount: webImportResult.data.diagnostics.assetCount,
      flaggedQuestionCount: webImportResult.data.diagnostics.flaggedQuestionCount,
      createdQuestionCount: createdCount,
      stageDurations:
        ((sourceFile.importDiagnostics as ImportDiagnostics | null | undefined)?.stageDurations as
          | ImportDiagnostics['stageDurations']
          | undefined) ?? undefined,
    })

    const now = new Date()
    // 先确保状态落库，再尝试写 diagnostics（避免 Json 字段导致状态写回失败）
    if (
      sourceFile.status === ProcessingStatus.PROCESSING &&
      !sourceFile.processedAt &&
      createdCount > 0
    ) {
      await prisma.sourceFile.update({
        where: { id: sourceFile.id },
        data: { status: ProcessingStatus.COMPLETED, processedAt: now },
      })
    }

    try {
      await prisma.sourceFile.update({
        where: { id: sourceFile.id },
        data: {
          importDiagnostics: diagnostics as Prisma.InputJsonValue,
        },
      })
    } catch (diagnosticsError) {
      console.warn('写入重算诊断失败（已忽略）:', diagnosticsError)
    }

    return {
      success: true,
      data: {
        importDiagnostics: diagnostics,
        diagnosticsSummary: buildImportDiagnosticsSummaryText(diagnostics),
        diagnosticsPreview: buildImportDiagnosticsPreviewText(diagnostics),
      },
    }
  } catch (error) {
    console.error('重算导入诊断失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '重算失败',
      code: 'UNKNOWN_ERROR',
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
          sourceFileId,
        },
      })
      questionsDeleted = result.count
    }

    // 删除源文件
    await prisma.sourceFile.delete({
      where: { id: sourceFileId },
    })

    safeRevalidatePath('/admin/content/review')
    safeRevalidatePath('/admin/content/import')

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
