'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { ContentStatus, Prisma, QuestionType, ReportStatus, ReviewAction } from '@prisma/client'
import { createHash } from 'crypto'
import type {
  BulkCreateQuestionsInput,
  BulkOperationResult,
  BulkUpdateStatusInput,
  CreateQuestionInput,
  CreateReportInput,
  JsonValue,
  PaginationParams,
  PaginatedResult,
  QuestionFilter,
  QuestionSortOptions,
  QuestionWithRelations,
  ResolveReportInput,
  ServiceResult,
  StatusTransitionResult,
  UpdateQuestionInput,
  UpdateStatusInput,
  ReportFilter,
} from '@/lib/content-pipeline/types'

export async function generateContentHash(
  content: string,
  type: QuestionType,
  answer: Prisma.InputJsonValue | JsonValue
): Promise<string> {
  const normalized = [content.trim().toLowerCase(), type, JSON.stringify(answer)].join('|')
  return createHash('md5').update(normalized).digest('hex')
}

const STATUS_TRANSITIONS: Record<ContentStatus, ContentStatus[]> = {
  DRAFT: ['OCR_PROCESSING', 'STRUCTURING', 'REVIEW_PENDING', 'ARCHIVED'],
  OCR_PROCESSING: ['OCR_COMPLETED', 'DRAFT'],
  OCR_COMPLETED: ['STRUCTURING', 'REVIEW_PENDING', 'DRAFT'],
  STRUCTURING: ['REVIEW_PENDING', 'DRAFT'],
  REVIEW_PENDING: ['VERIFIED', 'REVIEW_REJECTED', 'DRAFT'],
  REVIEW_REJECTED: ['DRAFT', 'REVIEW_PENDING', 'ARCHIVED'],
  VERIFIED: ['PUBLISHED', 'REVIEW_PENDING', 'ARCHIVED'],
  PUBLISHED: ['ARCHIVED', 'VERIFIED', 'REVIEW_PENDING'],
  ARCHIVED: ['DRAFT'],
}

export async function validateStatusTransition(
  fromStatus: ContentStatus,
  toStatus: ContentStatus
): Promise<StatusTransitionResult> {
  const allowedNextStatuses = STATUS_TRANSITIONS[fromStatus] || []
  if (allowedNextStatuses.includes(toStatus)) {
    return { valid: true, allowedNextStatuses }
  }
  return {
    valid: false,
    error: `不允许从 ${fromStatus} 转换到 ${toStatus}`,
    allowedNextStatuses,
  }
}

function includeQuestionRelations() {
  return {
    chapter: { include: { subject: true } },
    subject: true,
    sourceFile: true,
  } as const
}

export async function createQuestion(
  data: CreateQuestionInput
): Promise<ServiceResult<QuestionWithRelations>> {
  try {
    const contentHash = await generateContentHash(data.content, data.type, data.answer)
    const existing = await prisma.question.findUnique({ where: { contentHash } })
    if (existing) {
      return { success: false, error: '题目已存在（内容重复）', code: 'DUPLICATE_CONTENT' }
    }

    const question = await prisma.question.create({
      data: {
        content: data.content,
        type: data.type,
        difficulty: data.difficulty ?? 3,
        curriculum: data.curriculum ?? 'UEC',
        grade: data.grade ?? null,
        subjectId: data.subjectId ?? null,
        options: data.options ?? undefined,
        answer: data.answer as Prisma.InputJsonValue,
        explanation: data.explanation,
        chapterId: data.chapterId ?? null,
        sourceFileId: data.sourceFileId ?? null,
        source: data.source ?? null,
        tags: data.tags ?? [],
        assetUrl: data.assetUrl ?? null,
        isPastPaper: data.isPastPaper ?? false,
        paperId: data.paperId ?? null,
        contentHash,
        qualityScore: data.qualityScore,
        status: ContentStatus.DRAFT,
        createdBy: data.createdBy,
      },
      include: includeQuestionRelations(),
    })

    revalidatePath('/admin/content/review')
    return { success: true, data: question as QuestionWithRelations }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '创建题目失败',
      code: 'CREATE_FAILED',
    }
  }
}

export async function bulkCreateQuestions(
  input: BulkCreateQuestionsInput
): Promise<BulkOperationResult<QuestionWithRelations>> {
  const results: BulkOperationResult<QuestionWithRelations>['results'] = []
  let succeeded = 0
  let failed = 0

  for (let i = 0; i < input.questions.length; i++) {
    const q = input.questions[i]
    try {
      const contentHash = await generateContentHash(q.content, q.type, q.answer)
      const existing = await prisma.question.findUnique({ where: { contentHash } })
      if (existing) {
        results.push({ index: i, success: false, error: '题目已存在（内容重复）' })
        failed++
        continue
      }

      const created = await prisma.question.create({
        data: {
          content: q.content,
          type: q.type,
          difficulty: q.difficulty ?? 3,
          curriculum: q.curriculum ?? 'UEC',
          grade: q.grade ?? null,
          subjectId: q.subjectId ?? null,
          options: q.options ?? undefined,
          answer: q.answer as Prisma.InputJsonValue,
          explanation: q.explanation,
          chapterId: q.chapterId ?? null,
          sourceFileId: input.sourceFileId ?? q.sourceFileId ?? null,
          source: q.source ?? null,
          tags: q.tags ?? [],
          assetUrl: q.assetUrl ?? null,
          isPastPaper: q.isPastPaper ?? false,
          paperId: q.paperId ?? null,
          contentHash,
          qualityScore: q.qualityScore,
          status: ContentStatus.DRAFT,
          createdBy: input.createdBy ?? q.createdBy,
        },
        include: includeQuestionRelations(),
      })

      results.push({ index: i, success: true, data: created as QuestionWithRelations })
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

export async function updateQuestionStatus(
  input: UpdateStatusInput
): Promise<ServiceResult<QuestionWithRelations>> {
  try {
    const currentQuestion = await prisma.question.findUnique({ where: { id: input.questionId } })
    if (!currentQuestion) {
      return { success: false, error: '题目不存在', code: 'NOT_FOUND' }
    }

    const transition = await validateStatusTransition(currentQuestion.status, input.newStatus)
    if (!transition.valid) {
      return { success: false, error: transition.error, code: 'INVALID_TRANSITION' }
    }

    let action: ReviewAction = ReviewAction.SUBMIT_REVIEW
    if (input.newStatus === ContentStatus.VERIFIED) action = ReviewAction.APPROVE
    else if (input.newStatus === ContentStatus.REVIEW_REJECTED) action = ReviewAction.REJECT
    else if (input.newStatus === ContentStatus.PUBLISHED) action = ReviewAction.PUBLISH
    else if (input.newStatus === ContentStatus.ARCHIVED) action = ReviewAction.ARCHIVE

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
        include: includeQuestionRelations(),
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
    return { success: true, data: updatedQuestion as QuestionWithRelations }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '更新状态失败',
      code: 'UPDATE_FAILED',
    }
  }
}

export async function bulkUpdateQuestionStatus(
  input: BulkUpdateStatusInput
): Promise<BulkOperationResult<QuestionWithRelations>> {
  const results: BulkOperationResult<QuestionWithRelations>['results'] = []
  let succeeded = 0
  let failed = 0

  for (let i = 0; i < input.questionIds.length; i++) {
    const result = await updateQuestionStatus({
      questionId: input.questionIds[i],
      newStatus: input.newStatus,
      reviewerId: input.reviewerId,
      comment: input.comment,
    })

    if (result.success) {
      results.push({ index: i, success: true, data: result.data })
      succeeded++
    } else {
      results.push({ index: i, success: false, error: result.error })
      failed++
    }
  }

  return { success: failed === 0, total: input.questionIds.length, succeeded, failed, results }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isUuid(value: string | undefined | null): value is string {
  return !!value && UUID_RE.test(value.trim())
}

function toValidStatusList(status: QuestionFilter['status']): ContentStatus[] | undefined {
  if (!status) return undefined
  const allStatuses = new Set(Object.values(ContentStatus))
  const list = (Array.isArray(status) ? status : [status]).filter(
    (item): item is ContentStatus => allStatuses.has(item as ContentStatus)
  )
  return list.length > 0 ? list : undefined
}

function toValidTypeList(type: QuestionFilter['type']): QuestionType[] | undefined {
  if (!type) return undefined
  const allTypes = new Set(Object.values(QuestionType))
  const list = (Array.isArray(type) ? type : [type]).filter(
    (item): item is QuestionType => allTypes.has(item as QuestionType)
  )
  return list.length > 0 ? list : undefined
}

function buildQuestionWhere(filter: QuestionFilter): Prisma.QuestionWhereInput {
  const where: Prisma.QuestionWhereInput = {}

  const statusList = toValidStatusList(filter.status)
  if (statusList) where.status = statusList.length === 1 ? statusList[0] : { in: statusList }

  const typeList = toValidTypeList(filter.type)
  if (typeList) where.type = typeList.length === 1 ? typeList[0] : { in: typeList }

  if (filter.difficulty) {
    if (typeof filter.difficulty === 'number') where.difficulty = filter.difficulty
    else if (filter.difficulty.min !== undefined || filter.difficulty.max !== undefined) {
      where.difficulty = {
        ...(filter.difficulty.min !== undefined && { gte: filter.difficulty.min }),
        ...(filter.difficulty.max !== undefined && { lte: filter.difficulty.max }),
      }
    }
  }
  if (filter.curriculum) {
    where.curriculum = Array.isArray(filter.curriculum) ? { in: filter.curriculum } : filter.curriculum
  }
  if (filter.grade) {
    if (typeof filter.grade === 'number') where.grade = filter.grade
    else if (filter.grade.min !== undefined || filter.grade.max !== undefined) {
      where.grade = {
        ...(filter.grade.min !== undefined && { gte: filter.grade.min }),
        ...(filter.grade.max !== undefined && { lte: filter.grade.max }),
      }
    }
  }
  if (isUuid(filter.chapterId)) where.chapterId = filter.chapterId
  if (isUuid(filter.subjectId)) where.subjectId = filter.subjectId
  if (isUuid(filter.sourceFileId)) where.sourceFileId = filter.sourceFileId
  if (filter.source) where.source = filter.source
  if (filter.isPastPaper !== undefined) where.isPastPaper = filter.isPastPaper
  if (filter.paperId) where.paperId = filter.paperId
  if (filter.searchText) where.content = { contains: filter.searchText, mode: 'insensitive' }
  if (isUuid(filter.createdBy)) where.createdBy = filter.createdBy
  if (isUuid(filter.reviewedBy)) where.reviewedBy = filter.reviewedBy
  if (filter.createdAfter || filter.createdBefore) {
    where.createdAt = {
      ...(filter.createdAfter && { gte: filter.createdAfter }),
      ...(filter.createdBefore && { lte: filter.createdBefore }),
    }
  }
  return where
}

export async function getPendingReviewQuestions(
  params: PaginationParams = {},
  filter: QuestionFilter = {},
  sort: QuestionSortOptions = { field: 'createdAt', order: 'desc' }
): Promise<PaginatedResult<QuestionWithRelations>> {
  const nextFilter: QuestionFilter = { ...filter, status: ContentStatus.REVIEW_PENDING }
  return getQuestions(params, nextFilter, sort)
}

export async function getQuestionById(
  id: string
): Promise<ServiceResult<QuestionWithRelations>> {
  try {
    const question = await prisma.question.findUnique({
      where: { id },
      include: includeQuestionRelations(),
    })
    if (!question) return { success: false, error: '题目不存在', code: 'NOT_FOUND' }
    return { success: true, data: question as QuestionWithRelations }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取失败',
      code: 'FETCH_FAILED',
    }
  }
}

export async function deleteQuestion(
  id: string,
  operatorId?: string,
  options?: { hardDelete?: boolean; comment?: string }
): Promise<ServiceResult<{ archived: boolean }>> {
  try {
    const question = await prisma.question.findUnique({ where: { id } })
    if (!question) return { success: false, error: '题目不存在', code: 'NOT_FOUND' }

    if (question.status === ContentStatus.PUBLISHED && !options?.hardDelete) {
      return {
        success: false,
        error: '已发布的题目不能直接删除，请先下架（设为 VERIFIED 状态）',
        code: 'CANNOT_DELETE_PUBLISHED',
      }
    }

    if (options?.hardDelete) {
      await prisma.question.delete({ where: { id } })
      revalidatePath('/admin/content/review')
      return { success: true, data: { archived: false } }
    }

    await prisma.$transaction([
      prisma.question.update({ where: { id }, data: { status: ContentStatus.ARCHIVED } }),
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
    return { success: true, data: { archived: true } }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '删除失败',
      code: 'DELETE_FAILED',
    }
  }
}

export async function updateQuestion(
  id: string,
  data: UpdateQuestionInput
): Promise<ServiceResult<QuestionWithRelations>> {
  try {
    const current = await prisma.question.findUnique({ where: { id } })
    if (!current) return { success: false, error: '题目不存在', code: 'NOT_FOUND' }

    let contentHash = current.contentHash
    if (data.content || data.type || data.answer) {
      contentHash = await generateContentHash(
        data.content ?? current.content,
        data.type ?? current.type,
        (data.answer ?? current.answer) as JsonValue
      )

      const duplicate = await prisma.question.findFirst({
        where: { contentHash, id: { not: id } },
      })
      if (duplicate) {
        return { success: false, error: '更新后的内容与其他题目重复', code: 'DUPLICATE_CONTENT' }
      }
    }

    const updated = await prisma.question.update({
      where: { id },
      data: {
        ...(data.content !== undefined && { content: data.content }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.difficulty !== undefined && { difficulty: data.difficulty }),
        ...(data.curriculum !== undefined && { curriculum: data.curriculum }),
        ...(data.grade !== undefined && { grade: data.grade }),
        ...(data.subjectId !== undefined && { subjectId: data.subjectId }),
        ...(data.options !== undefined && { options: data.options ?? Prisma.JsonNull }),
        ...(data.answer !== undefined && { answer: data.answer as Prisma.InputJsonValue }),
        ...(data.explanation !== undefined && { explanation: data.explanation }),
        ...(data.chapterId !== undefined && { chapterId: data.chapterId }),
        ...(data.sourceFileId !== undefined && { sourceFileId: data.sourceFileId }),
        ...(data.source !== undefined && { source: data.source }),
        ...(data.tags !== undefined && { tags: data.tags }),
        ...(data.assetUrl !== undefined && { assetUrl: data.assetUrl }),
        ...(data.isPastPaper !== undefined && { isPastPaper: data.isPastPaper }),
        ...(data.paperId !== undefined && { paperId: data.paperId }),
        ...(data.qualityScore !== undefined && { qualityScore: data.qualityScore }),
        ...(contentHash !== current.contentHash && { contentHash }),
      },
      include: includeQuestionRelations(),
    })

    revalidatePath('/admin/content/review')
    return { success: true, data: updated as QuestionWithRelations }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '更新失败',
      code: 'UPDATE_FAILED',
    }
  }
}

const MAX_PAGE_SIZE = 100

export async function getQuestions(
  params: PaginationParams = {},
  filter: QuestionFilter = {},
  sort: QuestionSortOptions = { field: 'createdAt', order: 'desc' }
): Promise<PaginatedResult<QuestionWithRelations>> {
  const page = params.page ?? 1
  const pageSize = Math.min(params.pageSize ?? 20, MAX_PAGE_SIZE)
  const skip = (page - 1) * pageSize
  const where = buildQuestionWhere(filter)

  const [total, data] = await prisma.$transaction([
    prisma.question.count({ where }),
    prisma.question.findMany({
      where,
      include: includeQuestionRelations(),
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

const AUTO_REVIEW_THRESHOLD = 3

export async function reportQuestion(
  input: CreateReportInput,
  options?: { skipAutoReview?: boolean }
): Promise<ServiceResult<{ id: string; triggeredReview?: boolean }>> {
  try {
    const question = await prisma.question.findUnique({ where: { id: input.questionId } })
    if (!question) return { success: false, error: '题目不存在', code: 'NOT_FOUND' }

    const existing = await prisma.questionReport.findFirst({
      where: {
        questionId: input.questionId,
        reportedBy: input.reportedBy,
        issueType: input.issueType,
        status: { in: ['PENDING', 'REVIEWING'] },
      },
    })

    if (existing) {
      return { success: false, error: '您已报告过该问题，请等待处理', code: 'DUPLICATE_REPORT' }
    }

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

    let triggeredReview = false
    if (
      !options?.skipAutoReview &&
      updatedQuestion.reportCount >= AUTO_REVIEW_THRESHOLD &&
      updatedQuestion.status === ContentStatus.PUBLISHED
    ) {
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
            reviewerId: input.reportedBy,
            comment: `收到 ${updatedQuestion.reportCount} 条用户报错，自动触发复审`,
          },
        }),
      ])
      triggeredReview = true
    }

    return { success: true, data: { id: report.id, triggeredReview } }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '创建报告失败',
      code: 'CREATE_FAILED',
    }
  }
}

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
  const where: Prisma.QuestionReportWhereInput = {}

  if (filter.questionId) where.questionId = filter.questionId
  if (filter.reportedBy) where.reportedBy = filter.reportedBy
  if (filter.status) where.status = Array.isArray(filter.status) ? { in: filter.status } : filter.status
  if (filter.issueType) {
    where.issueType = Array.isArray(filter.issueType) ? { in: filter.issueType } : filter.issueType
  }
  if (filter.createdAfter || filter.createdBefore) {
    where.createdAt = {
      ...(filter.createdAfter && { gte: filter.createdAfter }),
      ...(filter.createdBefore && { lte: filter.createdBefore }),
    }
  }

  const [total, data] = await prisma.$transaction([
    prisma.questionReport.count({ where }),
    prisma.questionReport.findMany({
      where,
      include: { question: { select: { content: true, type: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
  ])

  const totalPages = Math.ceil(total / pageSize)
  return {
    data: data.map(r => ({
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

export async function resolveReport(
  input: ResolveReportInput
): Promise<ServiceResult<{ resolved: boolean }>> {
  try {
    const report = await prisma.questionReport.findUnique({
      where: { id: input.reportId },
      include: { question: true },
    })
    if (!report) return { success: false, error: '报告不存在', code: 'NOT_FOUND' }
    if (report.status === ReportStatus.RESOLVED || report.status === ReportStatus.REJECTED) {
      return { success: false, error: '该报告已被处理', code: 'ALREADY_RESOLVED' }
    }

    if (input.status === ReportStatus.REJECTED && report.question.reportCount > 0) {
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
    revalidatePath('/admin/content/reports')
    return { success: true, data: { resolved: true } }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '处理报告失败',
      code: 'RESOLVE_FAILED',
    }
  }
}

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

  return { success: failed === 0, total: reportIds.length, succeeded, failed, results }
}

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
    const [totalQuestions, statusCounts, typeCounts, pendingReports, recentlyAdded] = await Promise.all([
      prisma.question.count(),
      prisma.question.groupBy({ by: ['status'], _count: true }),
      prisma.question.groupBy({ by: ['type'], _count: true }),
      prisma.questionReport.count({ where: { status: 'PENDING' } }),
      prisma.question.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
    ])

    const byStatus = statusCounts.reduce(
      (acc, item) => {
        acc[item.status] = item._count
        return acc
      },
      {} as Record<ContentStatus, number>
    )

    const byType = typeCounts.reduce(
      (acc, item) => {
        acc[item.type] = item._count
        return acc
      },
      {} as Record<QuestionType, number>
    )

    return {
      success: true,
      data: { totalQuestions, byStatus, byType, pendingReports, recentlyAdded },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取统计失败',
      code: 'FETCH_FAILED',
    }
  }
}
