'use server'

import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/actions/user/auth'
import { revalidatePath } from 'next/cache'
import { resolveRequestAdminIdentity } from '@/lib/auth/request-user'
import { suggestQuestionChapters } from '@/lib/content-pipeline/chapter-tagging'
import { format } from 'date-fns'
import {
  ContentStatus,
  Prisma,
  QuestionType,
  ReportStatus,
  ReviewAction,
} from '@prisma/client'
import { createHash } from 'crypto'
import type { AuditLogEntry } from '@/types/content-pipeline'
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
import { invalidateAdminDashboardOverview } from '@/lib/cache/sitewide'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isUuid(value: string | undefined | null): value is string {
  return !!value && UUID_RE.test(value.trim())
}

async function resolveReviewerId(preferredReviewerId?: string): Promise<string> {
  if (isUuid(preferredReviewerId)) {
    return preferredReviewerId
  }

  const currentUser = await getCurrentUser()
  if (currentUser?.id && isUuid(currentUser.id)) {
    return currentUser.id
  }

  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    select: { id: true },
  })
  if (admin?.id) {
    return admin.id
  }

  const fallback = await prisma.user.findFirst({
    select: { id: true },
  })
  if (fallback?.id) {
    return fallback.id
  }

  throw new Error('没有可用的审核人')
}

function safeRevalidatePath(path: string): void {
  try {
    revalidatePath(path)
  } catch (error) {
    console.warn(`Skip revalidatePath(${path}):`, error)
  }
}

function buildReviewLogUser(user?: {
  email?: string | null
  username?: string | null
} | null): string {
  return user?.username || user?.email || '未知审核人'
}

function mapReviewActionLabel(action: ReviewAction): string {
  switch (action) {
    case ReviewAction.SUBMIT_REVIEW:
      return '提交审核'
    case ReviewAction.APPROVE:
      return '审核通过'
    case ReviewAction.REJECT:
      return '归档题目'
    case ReviewAction.PUBLISH:
      return '发布题目'
    case ReviewAction.ARCHIVE:
      return '归档题目'
    case ReviewAction.REQUEST_CHANGE:
      return '请求复审'
    default:
      return action
  }
}

function extractAggregateCount(
  count:
    | number
    | true
    | {
        _all?: number
      }
    | undefined
): number {
  if (typeof count === 'number') return count
  if (!count || count === true) return 0
  return count._all ?? 0
}

function mapReviewActionType(action: ReviewAction): AuditLogEntry['type'] {
  switch (action) {
    case ReviewAction.APPROVE:
    case ReviewAction.PUBLISH:
      return 'success'
    case ReviewAction.REJECT:
    case ReviewAction.REQUEST_CHANGE:
      return 'warning'
    case ReviewAction.ARCHIVE:
      return 'error'
    default:
      return 'info'
  }
}

function normalizeQuestionAnswer(answer: Prisma.JsonValue): string[] {
  if (typeof answer === 'string') {
    return answer ? [answer] : []
  }
  if (Array.isArray(answer)) {
    return answer
      .filter((item): item is string => typeof item === 'string' && item.length > 0)
  }
  if (answer && typeof answer === 'object') {
    return Object.values(answer).flatMap((item) =>
      typeof item === 'string' ? [item] : []
    )
  }
  return []
}

function normalizeQuestionOptions(
  options: Prisma.JsonValue | null | undefined,
  answer: Prisma.JsonValue
): Array<{ id: string; text: string; isCorrect: boolean }> {
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    return []
  }

  const answerSet = new Set(normalizeQuestionAnswer(answer))
  return Object.entries(options as Record<string, unknown>).map(([id, text]) => ({
    id,
    text: typeof text === 'string' ? text : String(text ?? ''),
    isCorrect: answerSet.has(id),
  }))
}

function getReporterDisplayName(user: {
  username?: string | null
  email?: string | null
}): string {
  return user.username || user.email || '未知用户'
}

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

const STATUS_TRANSITIONS: Record<ContentStatus, ContentStatus[]> = {
  DRAFT: ['OCR_PROCESSING', 'STRUCTURING', 'REVIEW_PENDING', 'PUBLISHED', 'ARCHIVED'],
  OCR_PROCESSING: ['OCR_COMPLETED', 'DRAFT'],
  OCR_COMPLETED: ['STRUCTURING', 'REVIEW_PENDING', 'DRAFT'],
  STRUCTURING: ['DRAFT', 'REVIEW_PENDING', 'PUBLISHED', 'ARCHIVED'],
  REVIEW_PENDING: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
  REVIEW_REJECTED: ['DRAFT', 'REVIEW_PENDING', 'ARCHIVED'],
  VERIFIED: ['PUBLISHED', 'REVIEW_PENDING', 'ARCHIVED'],
  PUBLISHED: ['REVIEW_PENDING', 'ARCHIVED'],
  ARCHIVED: ['DRAFT', 'REVIEW_PENDING'],
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

function selectQuestionRelations(): Prisma.QuestionSelect {
  return {
    id: true,
    chapterId: true,
    groupId: true,
    subjectId: true,
    sourceFileId: true,
    type: true,
    curriculum: true,
    grade: true,
    difficulty: true,
    content: true,
    options: true,
    answer: true,
    explanation: true,
    assetUrl: true,
    imageUrls: true,
    source: true,
    tags: true,
    isPastPaper: true,
    paperId: true,
    createdAt: true,
    updatedAt: true,
    status: true,
    contentHash: true,
    qualityScore: true,
    reportCount: true,
    createdBy: true,
    reviewedBy: true,
    publishedBy: true,
    deletedBy: true,
    reviewedAt: true,
    publishedAt: true,
    deletedAt: true,
    deleteReason: true,
    chapter: { include: { subject: true } },
    group: {
      select: {
        id: true,
        title: true,
        material: true,
        imageUrls: true,
      },
    },
    subject: true,
    sourceFile: true,
  }
}

export async function createQuestion(
  data: CreateQuestionInput
): Promise<ServiceResult<QuestionWithRelations>> {
  try {
    const contentHash = await generateContentHash(
      data.content,
      data.type,
      data.answer
    )
    const existing = await prisma.question.findUnique({
      where: { contentHash },
      select: { id: true },
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
        curriculum: data.curriculum ?? 'UEC',
        grade: data.grade ?? null,
        subjectId: data.subjectId ?? null,
        groupId: data.groupId ?? null,
        options: data.options ?? undefined,
        answer: data.answer as Prisma.InputJsonValue,
        explanation: data.explanation,
        chapterId: data.chapterId ?? null,
        sourceFileId: data.sourceFileId ?? null,
        source: data.source ?? null,
        tags: data.tags ?? [],
        assetUrl: data.assetUrl ?? null,
        imageUrls: data.imageUrls ?? (data.assetUrl ? [data.assetUrl] : []),
        isPastPaper: data.isPastPaper ?? false,
        paperId: data.paperId ?? null,
        contentHash,
        qualityScore: data.qualityScore,
        status: ContentStatus.DRAFT,
        createdBy: data.createdBy,
      },
      select: selectQuestionRelations(),
    })

    safeRevalidatePath('/admin/content/review')
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
      const existing = await prisma.question.findUnique({
        where: { contentHash },
        select: { id: true },
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

      const created = await prisma.question.create({
        data: {
          content: q.content,
          type: q.type,
          difficulty: q.difficulty ?? 3,
          curriculum: q.curriculum ?? 'UEC',
          grade: q.grade ?? null,
          subjectId: q.subjectId ?? null,
          groupId: q.groupId ?? null,
          options: q.options ?? undefined,
          answer: q.answer as Prisma.InputJsonValue,
          explanation: q.explanation,
          chapterId: q.chapterId ?? null,
          sourceFileId: input.sourceFileId ?? q.sourceFileId ?? null,
          source: q.source ?? null,
          tags: q.tags ?? [],
          assetUrl: q.assetUrl ?? null,
          imageUrls: q.imageUrls ?? (q.assetUrl ? [q.assetUrl] : []),
          isPastPaper: q.isPastPaper ?? false,
          paperId: q.paperId ?? null,
          contentHash,
          qualityScore: q.qualityScore,
          status: ContentStatus.DRAFT,
          createdBy: input.createdBy ?? q.createdBy,
        },
        select: selectQuestionRelations(),
      })

      results.push({
        index: i,
        success: true,
        data: created as QuestionWithRelations,
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

  safeRevalidatePath('/admin/content/review')
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
    const reviewerId = await resolveReviewerId(input.reviewerId)
    const currentQuestion = await prisma.question.findUnique({
      where: { id: input.questionId },
      select: { id: true, status: true },
    })
    if (!currentQuestion) {
      return { success: false, error: '题目不存在', code: 'NOT_FOUND' }
    }

    const transition = await validateStatusTransition(
      currentQuestion.status,
      input.newStatus
    )
    if (!transition.valid) {
      return {
        success: false,
        error: transition.error,
        code: 'INVALID_TRANSITION',
      }
    }

    let action: ReviewAction = ReviewAction.REQUEST_CHANGE
    if (input.newStatus === ContentStatus.REVIEW_PENDING)
      action = ReviewAction.SUBMIT_REVIEW
    else if (input.newStatus === ContentStatus.VERIFIED)
      action = ReviewAction.APPROVE
    else if (input.newStatus === ContentStatus.REVIEW_REJECTED)
      action = ReviewAction.REJECT
    else if (input.newStatus === ContentStatus.PUBLISHED)
      action = ReviewAction.PUBLISH
    else if (input.newStatus === ContentStatus.ARCHIVED)
      action = ReviewAction.ARCHIVE

    const [updatedQuestion] = await prisma.$transaction([
      prisma.question.update({
        where: { id: input.questionId },
        data: {
          status: input.newStatus,
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
          ...(input.newStatus === ContentStatus.PUBLISHED && {
            publishedBy: reviewerId,
            publishedAt: new Date(),
          }),
        },
        select: selectQuestionRelations(),
      }),
      prisma.contentReviewLog.create({
        data: {
          contentType: 'question',
          contentId: input.questionId,
          action,
          fromStatus: currentQuestion.status,
          toStatus: input.newStatus,
          reviewerId,
          comment: input.comment,
          changes: input.changes as object | undefined,
        },
      }),
    ])

    safeRevalidatePath('/admin/content/review')
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
  const reviewerId = await resolveReviewerId(input.reviewerId)

  for (let i = 0; i < input.questionIds.length; i++) {
    const result = await updateQuestionStatus({
      questionId: input.questionIds[i],
      newStatus: input.newStatus,
      reviewerId,
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

  return {
    success: failed === 0,
    total: input.questionIds.length,
    succeeded,
    failed,
    results,
  }
}

function toValidStatusList(
  status: QuestionFilter['status']
): ContentStatus[] | undefined {
  if (!status) return undefined
  const allStatuses = new Set(Object.values(ContentStatus))
  const list = (Array.isArray(status) ? status : [status]).filter(
    (item): item is ContentStatus => allStatuses.has(item as ContentStatus)
  )
  return list.length > 0 ? list : undefined
}

function toValidTypeList(
  type: QuestionFilter['type']
): QuestionType[] | undefined {
  if (!type) return undefined
  const allTypes = new Set(Object.values(QuestionType))
  const list = (Array.isArray(type) ? type : [type]).filter(
    (item): item is QuestionType => allTypes.has(item as QuestionType)
  )
  return list.length > 0 ? list : undefined
}

const QUESTION_ID_PREFIX_RE = /^[0-9a-f-]{4,36}$/i

function shouldSearchQuestionIdPrefix(searchText: string): boolean {
  return QUESTION_ID_PREFIX_RE.test(searchText) && !isUuid(searchText)
}

async function resolveQuestionIdPrefixMatches(
  searchText: string
): Promise<string[]> {
  if (!shouldSearchQuestionIdPrefix(searchText)) return []

  const rows = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT id::text AS id
    FROM questions
    WHERE id::text ILIKE ${`${searchText}%`}
    ORDER BY created_at DESC
    LIMIT 200
  `

  return rows.map((row) => row.id)
}

function buildQuestionWhere(
  filter: QuestionFilter,
  questionIdPrefixMatches: string[] = []
): Prisma.QuestionWhereInput {
  const where: Prisma.QuestionWhereInput = {}
  const searchText = filter.searchText?.trim()

  if (filter.deletedOnly) {
    where.deletedAt = { not: null }
  } else if (!filter.includeDeleted) {
    where.deletedAt = null
  }

  const statusList = toValidStatusList(filter.status)
  if (statusList)
    where.status = statusList.length === 1 ? statusList[0] : { in: statusList }

  const typeList = toValidTypeList(filter.type)
  if (typeList)
    where.type = typeList.length === 1 ? typeList[0] : { in: typeList }

  if (filter.difficulty) {
    if (typeof filter.difficulty === 'number')
      where.difficulty = filter.difficulty
    else if (
      filter.difficulty.min !== undefined ||
      filter.difficulty.max !== undefined
    ) {
      where.difficulty = {
        ...(filter.difficulty.min !== undefined && {
          gte: filter.difficulty.min,
        }),
        ...(filter.difficulty.max !== undefined && {
          lte: filter.difficulty.max,
        }),
      }
    }
  }
  if (filter.curriculum) {
    where.curriculum = Array.isArray(filter.curriculum)
      ? { in: filter.curriculum }
      : filter.curriculum
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
  if (searchText) {
    const searchConditions: Prisma.QuestionWhereInput[] = [
      ...(questionIdPrefixMatches.length > 0
        ? [{ id: { in: questionIdPrefixMatches } }]
        : []),
      {
        content: { contains: searchText, mode: 'insensitive' },
      },
      {
        group: {
          is: {
            title: { contains: searchText, mode: 'insensitive' },
          },
        },
      },
    ]

    if (isUuid(searchText)) {
      searchConditions.unshift({ id: searchText })
    }

    where.OR = searchConditions
  }
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

const SQL_AND = Prisma.sql`AND`
const SQL_OR = Prisma.sql`OR`

function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, '\\$&')
}

function combineSqlClauses(
  clauses: Prisma.Sql[],
  separator: Prisma.Sql
): Prisma.Sql {
  if (clauses.length === 0) return Prisma.sql`TRUE`
  return clauses.slice(1).reduce(
    (combined, clause) => Prisma.sql`${combined} ${separator} ${clause}`,
    clauses[0]
  )
}

function buildQuestionSqlWhere(
  filter: QuestionFilter,
  questionIdPrefixMatches: string[] = []
): Prisma.Sql {
  const clauses: Prisma.Sql[] = []

  if (filter.deletedOnly) {
    clauses.push(Prisma.sql`q.deleted_at IS NOT NULL`)
  } else if (!filter.includeDeleted) {
    clauses.push(Prisma.sql`q.deleted_at IS NULL`)
  }

  const statusList = toValidStatusList(filter.status)
  if (statusList) {
    const statusClause =
      statusList.length === 1
        ? Prisma.sql`q.status::text = ${statusList[0]}`
        : Prisma.sql`q.status::text IN (${Prisma.join(
            statusList.map((status) => Prisma.sql`${status}`)
          )})`
    clauses.push(statusClause)
  }

  const typeList = toValidTypeList(filter.type)
  if (typeList) {
    const typeClause =
      typeList.length === 1
        ? Prisma.sql`q.type::text = ${typeList[0]}`
        : Prisma.sql`q.type::text IN (${Prisma.join(
            typeList.map((type) => Prisma.sql`${type}`)
          )})`
    clauses.push(typeClause)
  }

  if (filter.difficulty) {
    if (typeof filter.difficulty === 'number') {
      clauses.push(Prisma.sql`q.difficulty = ${filter.difficulty}`)
    } else if (
      filter.difficulty.min !== undefined ||
      filter.difficulty.max !== undefined
    ) {
      const difficultyRange: Prisma.Sql[] = []
      if (filter.difficulty.min !== undefined) {
        difficultyRange.push(Prisma.sql`q.difficulty >= ${filter.difficulty.min}`)
      }
      if (filter.difficulty.max !== undefined) {
        difficultyRange.push(Prisma.sql`q.difficulty <= ${filter.difficulty.max}`)
      }
      clauses.push(combineSqlClauses(difficultyRange, SQL_AND))
    }
  }

  if (filter.curriculum) {
    clauses.push(
      Array.isArray(filter.curriculum)
        ? Prisma.sql`q.curriculum IN (${Prisma.join(
            filter.curriculum.map((item) => Prisma.sql`${item}`)
          )})`
        : Prisma.sql`q.curriculum = ${filter.curriculum}`
    )
  }

  if (filter.grade) {
    if (typeof filter.grade === 'number') {
      clauses.push(Prisma.sql`q.grade = ${filter.grade}`)
    } else if (filter.grade.min !== undefined || filter.grade.max !== undefined) {
      const gradeRange: Prisma.Sql[] = []
      if (filter.grade.min !== undefined) {
        gradeRange.push(Prisma.sql`q.grade >= ${filter.grade.min}`)
      }
      if (filter.grade.max !== undefined) {
        gradeRange.push(Prisma.sql`q.grade <= ${filter.grade.max}`)
      }
      clauses.push(combineSqlClauses(gradeRange, SQL_AND))
    }
  }

  if (isUuid(filter.chapterId)) clauses.push(Prisma.sql`q.chapter_id::text = ${filter.chapterId}`)
  if (isUuid(filter.subjectId)) clauses.push(Prisma.sql`q.subject_id::text = ${filter.subjectId}`)
  if (isUuid(filter.sourceFileId)) {
    clauses.push(Prisma.sql`q.source_file_id::text = ${filter.sourceFileId}`)
  }
  if (filter.source) clauses.push(Prisma.sql`q.source = ${filter.source}`)
  if (filter.isPastPaper !== undefined) {
    clauses.push(Prisma.sql`q.is_past_paper = ${filter.isPastPaper}`)
  }
  if (filter.paperId) clauses.push(Prisma.sql`q.paper_id = ${filter.paperId}`)

  if (filter.createdBy && isUuid(filter.createdBy)) {
    clauses.push(Prisma.sql`q.created_by::text = ${filter.createdBy}`)
  }
  if (filter.reviewedBy && isUuid(filter.reviewedBy)) {
    clauses.push(Prisma.sql`q.reviewed_by::text = ${filter.reviewedBy}`)
  }
  if (filter.createdAfter || filter.createdBefore) {
    const createdAtRange: Prisma.Sql[] = []
    if (filter.createdAfter) {
      createdAtRange.push(Prisma.sql`q.created_at >= ${filter.createdAfter}`)
    }
    if (filter.createdBefore) {
      createdAtRange.push(Prisma.sql`q.created_at <= ${filter.createdBefore}`)
    }
    clauses.push(combineSqlClauses(createdAtRange, SQL_AND))
  }

  const searchText = filter.searchText?.trim()
  if (searchText) {
    const searchClauses: Prisma.Sql[] = []
    if (isUuid(searchText)) {
      searchClauses.push(Prisma.sql`q.id::text = ${searchText}`)
    }
    if (questionIdPrefixMatches.length > 0) {
      searchClauses.push(
        Prisma.sql`q.id::text IN (${Prisma.join(
          questionIdPrefixMatches.map((id) => Prisma.sql`${id}`)
        )})`
      )
    }
    const searchPattern = `%${escapeLikePattern(searchText)}%`
    searchClauses.push(Prisma.sql`q.content ILIKE ${searchPattern}`)
    searchClauses.push(Prisma.sql`g.title ILIKE ${searchPattern}`)
    clauses.push(combineSqlClauses(searchClauses, SQL_OR))
  }

  return combineSqlClauses(clauses, SQL_AND)
}

export async function getDraftQuestions(
  params: PaginationParams = {},
  filter: QuestionFilter = {},
  sort: QuestionSortOptions = { field: 'createdAt', order: 'desc' }
): Promise<PaginatedResult<QuestionWithRelations>> {
  const nextFilter: QuestionFilter = {
    ...filter,
    status: ContentStatus.DRAFT,
  }
  return getQuestions(params, nextFilter, sort)
}

export async function getManualReviewQuestions(
  params: PaginationParams = {},
  filter: QuestionFilter = {},
  sort: QuestionSortOptions = { field: 'createdAt', order: 'desc' }
): Promise<PaginatedResult<QuestionWithRelations>> {
  const nextFilter: QuestionFilter = {
    ...filter,
    status: ContentStatus.REVIEW_PENDING,
  }
  return getQuestions(params, nextFilter, sort)
}

export async function getQuestionById(
  id: string
): Promise<ServiceResult<QuestionWithRelations>> {
  try {
    const question = await prisma.question.findUnique({
      where: { id },
      select: selectQuestionRelations(),
    })
    if (!question)
      return { success: false, error: '题目不存在', code: 'NOT_FOUND' }
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
): Promise<ServiceResult<{ deleted: boolean; hardDeleted: boolean }>> {
  try {
    const question = await prisma.question.findUnique({
      where: { id },
      select: { id: true, status: true, deletedAt: true },
    })
    if (!question)
      return { success: false, error: '题目不存在', code: 'NOT_FOUND' }

    if (question.deletedAt) {
      return {
        success: false,
        error: '题目已删除',
        code: 'DELETE_FAILED',
      }
    }

    const resolvedOperatorId = await resolveReviewerId(operatorId)

    if (options?.hardDelete) {
      await prisma.question.delete({ where: { id } })
      safeRevalidatePath('/admin/content/review')
      return { success: true, data: { deleted: true, hardDeleted: true } }
    }

    const deletedAt = new Date()
    await prisma.$transaction([
      prisma.question.update({
        where: { id },
        data: {
          status: ContentStatus.ARCHIVED,
          deletedAt,
          deletedBy: resolvedOperatorId,
          deleteReason: options?.comment ?? '题目已软删除',
        },
      }),
      prisma.contentReviewLog.create({
        data: {
          contentType: 'question',
          contentId: id,
          action: ReviewAction.ARCHIVE,
          fromStatus: question.status,
          toStatus: ContentStatus.ARCHIVED,
          reviewerId: resolvedOperatorId,
          comment: options?.comment ?? '题目已软删除',
        },
      }),
    ])

    safeRevalidatePath('/admin/content/review')
    return { success: true, data: { deleted: true, hardDeleted: false } }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '删除失败',
      code: 'DELETE_FAILED',
    }
  }
}

export async function bulkDeleteQuestions(
  questionIds: string[],
  operatorId?: string,
  options?: { hardDelete?: boolean; comment?: string }
): Promise<BulkOperationResult<{ deleted: boolean; hardDeleted: boolean }>> {
  const results: BulkOperationResult<{ deleted: boolean; hardDeleted: boolean }>['results'] = []
  let succeeded = 0
  let failed = 0

  for (let i = 0; i < questionIds.length; i++) {
    const result = await deleteQuestion(questionIds[i], operatorId, options)

    if (result.success && result.data) {
      results.push({ index: i, success: true, data: result.data })
      succeeded++
    } else {
      results.push({ index: i, success: false, error: result.error })
      failed++
    }
  }

  return {
    success: failed === 0,
    total: questionIds.length,
    succeeded,
    failed,
    results,
  }
}

export async function bulkAutoTagQuestionChapters(
  input: { questionIds: string[] }
): Promise<BulkOperationResult<QuestionWithRelations>> {
  const questionIds = Array.isArray(input.questionIds) ? input.questionIds : []
  const results: BulkOperationResult<QuestionWithRelations>['results'] = []
  let succeeded = 0
  let failed = 0

  try {
    const questions = await prisma.question.findMany({
      where: {
        id: { in: questionIds },
        deletedAt: null,
      },
      select: {
        id: true,
        content: true,
        explanation: true,
        tags: true,
        subjectId: true,
        chapterId: true,
        source: true,
        sourceFileId: true,
        sourceFile: {
          select: {
            id: true,
            filename: true,
            sourceNote: true,
            fileUrl: true,
          },
        },
      },
    })

    const questionMap = new Map(questions.map((question) => [question.id, question]))
    const suggestions = await suggestQuestionChapters(
      questions.map((question) => ({
        id: question.id,
        content: question.content,
        explanation: question.explanation,
        tags: question.tags,
        subjectId: question.subjectId,
        chapterId: question.chapterId,
        source: question.source,
        sourceFileId: question.sourceFileId,
        sourceFile: question.sourceFile
          ? {
              filename: question.sourceFile.filename,
              sourceNote: question.sourceFile.sourceNote,
              fileUrl: question.sourceFile.fileUrl,
            }
          : null,
      }))
    )
    const suggestionMap = new Map(
      suggestions.map((suggestion) => [suggestion.questionId, suggestion])
    )

    for (let index = 0; index < questionIds.length; index++) {
      const questionId = questionIds[index]
      const question = questionMap.get(questionId)

      if (!question) {
        results.push({ index, success: false, error: '题目不存在或已删除' })
        failed++
        continue
      }

      if (!question.subjectId) {
        results.push({ index, success: false, error: '题目缺少科目，无法补章节' })
        failed++
        continue
      }

      if (question.chapterId) {
        const existing = await prisma.question.findUnique({
          where: { id: questionId },
          select: selectQuestionRelations(),
        })

        results.push({
          index,
          success: true,
          data: existing as QuestionWithRelations,
        })
        succeeded++
        continue
      }

      const suggestion = suggestionMap.get(questionId)
      if (!suggestion?.chapterId) {
        results.push({
          index,
          success: false,
          error: suggestion?.reason || '未能匹配到合适章节',
        })
        failed++
        continue
      }

      const updated = await prisma.question.update({
        where: { id: questionId },
        data: {
          chapterId: suggestion.chapterId,
        },
        select: selectQuestionRelations(),
      })

      results.push({
        index,
        success: true,
        data: updated as QuestionWithRelations,
      })
      succeeded++
    }

    safeRevalidatePath('/admin/content/review')
    safeRevalidatePath('/admin/content/import')
    safeRevalidatePath('/dashboard/practice')

    return {
      success: failed === 0,
      total: questionIds.length,
      succeeded,
      failed,
      results,
    }
  } catch (error) {
    console.error('bulkAutoTagQuestionChapters failed:', error)
    return {
      success: false,
      total: questionIds.length,
      succeeded,
      failed: questionIds.length,
      results:
        questionIds.length > 0
          ? questionIds.map((_, index) => ({
              index,
              success: false,
              error:
                error instanceof Error ? error.message : '章节补全失败',
            }))
          : results,
    }
  }
}

export async function updateQuestion(
  id: string,
  data: UpdateQuestionInput
): Promise<ServiceResult<QuestionWithRelations>> {
  try {
    const current = await prisma.question.findUnique({
      where: { id },
      select: {
        id: true,
        content: true,
        type: true,
        answer: true,
        contentHash: true,
      },
    })
    if (!current)
      return { success: false, error: '题目不存在', code: 'NOT_FOUND' }

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
        return {
          success: false,
          error: '更新后的内容与其他题目重复',
          code: 'DUPLICATE_CONTENT',
        }
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
        ...(data.options !== undefined && {
          options: data.options ?? Prisma.JsonNull,
        }),
        ...(data.answer !== undefined && {
          answer: data.answer as Prisma.InputJsonValue,
        }),
        ...(data.explanation !== undefined && {
          explanation: data.explanation,
        }),
        ...(data.chapterId !== undefined && { chapterId: data.chapterId }),
        ...(data.sourceFileId !== undefined && {
          sourceFileId: data.sourceFileId,
        }),
        ...(data.source !== undefined && { source: data.source }),
        ...(data.tags !== undefined && { tags: data.tags }),
        ...(data.assetUrl !== undefined && { assetUrl: data.assetUrl }),
        ...(data.imageUrls !== undefined
          ? { imageUrls: data.imageUrls }
          : data.assetUrl !== undefined
            ? { imageUrls: data.assetUrl ? [data.assetUrl] : [] }
            : {}),
        ...(data.isPastPaper !== undefined && {
          isPastPaper: data.isPastPaper,
        }),
        ...(data.paperId !== undefined && { paperId: data.paperId }),
        ...(data.qualityScore !== undefined && {
          qualityScore: data.qualityScore,
        }),
        ...(contentHash !== current.contentHash && { contentHash }),
      },
      select: selectQuestionRelations(),
    })

    safeRevalidatePath('/admin/content/review')
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
  const searchText = filter.searchText?.trim()
  const questionIdPrefixMatches = searchText
    ? await resolveQuestionIdPrefixMatches(searchText)
    : []
  const where = buildQuestionWhere(filter, questionIdPrefixMatches)
  const [total, data] =
    sort.field === 'sourceFileCreatedAt'
      ? await (() => {
          const whereSql = buildQuestionSqlWhere(filter, questionIdPrefixMatches)
          const orderDirection = sort.order === 'asc' ? Prisma.sql`ASC` : Prisma.sql`DESC`

          return prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
            SELECT q.id::text AS id
            FROM questions q
            LEFT JOIN question_groups g ON g.id = q.group_id
            LEFT JOIN source_files sf ON sf.id = q.source_file_id
            WHERE ${whereSql}
            ORDER BY
              CASE WHEN q.source_file_id IS NULL THEN 1 ELSE 0 END ASC,
              sf.created_at ${orderDirection},
              q.created_at DESC,
              q.id DESC
            OFFSET ${skip}
            LIMIT ${pageSize}
          `).then(async (idRows) => {
            const ids = idRows.map((row) => row.id)
            const [count, rows] = await Promise.all([
              prisma.question.count({ where }),
              ids.length
                ? prisma.question.findMany({
                    where: { id: { in: ids } },
                    select: selectQuestionRelations(),
                  })
                : Promise.resolve([] as QuestionWithRelations[]),
            ])
            const rowMap = new Map(rows.map((row) => [row.id, row as QuestionWithRelations]))
            const orderedRows = ids
              .map((id) => rowMap.get(id))
              .filter((row): row is QuestionWithRelations => Boolean(row))
            return [count, orderedRows] as const
          })
        })()
      : await Promise.all([
          prisma.question.count({ where }),
          prisma.question.findMany({
            where,
            select: selectQuestionRelations(),
            orderBy: [
              { [sort.field]: sort.order } as Prisma.QuestionOrderByWithRelationInput,
              { createdAt: 'desc' },
            ],
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
const FINAL_REPORT_STATUSES = new Set<ReportStatus>([
  ReportStatus.RESOLVED,
  ReportStatus.REJECTED,
])

export async function reportQuestion(
  input: CreateReportInput,
  options?: { skipAutoReview?: boolean }
): Promise<ServiceResult<{ id: string; triggeredReview?: boolean }>> {
  try {
    const question = await prisma.question.findUnique({
      where: { id: input.questionId },
      select: { id: true, status: true, reportCount: true },
    })
    if (!question)
      return { success: false, error: '题目不存在', code: 'NOT_FOUND' }

    const existing = await prisma.questionReport.findFirst({
      where: {
        questionId: input.questionId,
        reportedBy: input.reportedBy,
        issueType: input.issueType,
        status: { in: ['PENDING', 'REVIEWING'] },
      },
    })

    if (existing) {
      return {
        success: false,
        error: '您已报告过该问题，请等待处理',
        code: 'DUPLICATE_REPORT',
      }
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
    reviewedAt: Date | null
    reviewedBy: string | null
    resolution: string | null
    reporter: {
      id: string
      name: string
      email: string
      avatar: string | null
      role: string
    }
    question: {
      id: string
      content: string
      type: string
      subject: string
      options: Array<{ id: string; text: string; isCorrect: boolean }>
      answer: string[]
    }
  }>
> {
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 20
  const skip = (page - 1) * pageSize
  const where: Prisma.QuestionReportWhereInput = {}

  if (filter.questionId) where.questionId = filter.questionId
  if (filter.reportedBy) where.reportedBy = filter.reportedBy
  if (filter.status)
    where.status = Array.isArray(filter.status)
      ? { in: filter.status }
      : filter.status
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

  const [total, data] = await prisma.$transaction([
    prisma.questionReport.count({ where }),
    prisma.questionReport.findMany({
      where,
      include: {
        reporter: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
        question: {
          select: {
            id: true,
            content: true,
            type: true,
            options: true,
            answer: true,
            subject: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
  ])

  const totalPages = Math.ceil(total / pageSize)
  return {
    data: data.map((r) => ({
      id: r.id,
      questionId: r.questionId,
      issueType: r.issueType,
      description: r.description,
      status: r.status,
      createdAt: r.createdAt,
      reviewedAt: r.reviewedAt,
      reviewedBy: r.reviewedBy,
      resolution: r.resolution,
      reporter: {
        id: r.reporter.id,
        name: getReporterDisplayName(r.reporter),
        email: r.reporter.email,
        avatar: r.reporter.avatar,
        role: r.reporter.role,
      },
      question: {
        id: r.question.id,
        content: r.question.content,
        type: r.question.type,
        subject: r.question.subject?.name || '未分类',
        options: normalizeQuestionOptions(r.question.options, r.question.answer),
        answer: normalizeQuestionAnswer(r.question.answer),
      },
    })),
    total,
    page,
    pageSize,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}

export async function getQuestionReportsOverview(
  timeRange: '7d' | '30d' | 'all' = '7d',
  options?: { subjectId?: string }
): Promise<
  ServiceResult<{
    openQueue: number
    resolvedCount: number
    avgResolutionTime: number
    answerWrongCount: number
  }>
> {
  try {
    const now = Date.now()
    const rangeStart =
      timeRange === 'all'
        ? undefined
        : new Date(now - (timeRange === '30d' ? 30 : 7) * 24 * 60 * 60 * 1000)
    const scopedSubjectId = isUuid(options?.subjectId) ? options?.subjectId : undefined

    const where: Prisma.QuestionReportWhereInput = {
      ...(rangeStart && { createdAt: { gte: rangeStart } }),
      ...(scopedSubjectId && {
        question: {
          deletedAt: null,
          subjectId: scopedSubjectId,
        },
      }),
    }

    const reports = await prisma.questionReport.findMany({
      where,
      select: {
        status: true,
        issueType: true,
        createdAt: true,
        reviewedAt: true,
      },
    })

    const openQueue = reports.filter(
      (report) => report.status === 'PENDING' || report.status === 'REVIEWING'
    ).length
    const resolvedReports = reports.filter((report) => report.status === 'RESOLVED')
    const answerWrongCount = reports.filter(
      (report) => report.issueType === 'ANSWER_WRONG'
    ).length
    const avgResolutionTime =
      resolvedReports.length === 0
        ? 0
        : resolvedReports.reduce((acc, report) => {
            if (!report.reviewedAt) return acc
            return (
              acc +
              (report.reviewedAt.getTime() - report.createdAt.getTime()) /
                (1000 * 60 * 60)
            )
          }, 0) / resolvedReports.length

    return {
      success: true,
      data: {
        openQueue,
        resolvedCount: resolvedReports.length,
        avgResolutionTime,
        answerWrongCount,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取报错概览失败',
      code: 'FETCH_FAILED',
    }
  }
}

export async function resolveReport(
  input: ResolveReportInput
): Promise<ServiceResult<{ resolved: boolean }>> {
  try {
    const admin = await resolveRequestAdminIdentity()
    if (!admin) {
      return {
        success: false,
        error: '权限不足',
        code: 'FORBIDDEN',
      }
    }

    const report = await prisma.questionReport.findUnique({
      where: { id: input.reportId },
      include: { question: { select: { id: true, reportCount: true } } },
    })
    if (!report)
      return { success: false, error: '报告不存在', code: 'NOT_FOUND' }
    if (
      report.status === ReportStatus.RESOLVED ||
      report.status === ReportStatus.REJECTED
    ) {
      return {
        success: false,
        error: '该报告已被处理',
        code: 'ALREADY_RESOLVED',
      }
    }

    const normalizedResolution = input.resolution?.trim() || null
    const currentResolution = report.resolution?.trim() || null
    if (
      report.status === input.status &&
      report.reviewedBy === admin.id &&
      currentResolution === normalizedResolution
    ) {
      safeRevalidatePath('/admin/content/review')
      safeRevalidatePath('/admin/content/reports')
      safeRevalidatePath('/admin')
      invalidateAdminDashboardOverview()
      return { success: true, data: { resolved: true } }
    }

    const shouldDecrementReportCount =
      !FINAL_REPORT_STATUSES.has(report.status) &&
      FINAL_REPORT_STATUSES.has(input.status) &&
      report.question.reportCount > 0

    if (shouldDecrementReportCount) {
      await prisma.$transaction([
        prisma.questionReport.update({
          where: { id: input.reportId },
          data: {
            status: input.status,
            reviewedBy: admin.id,
            reviewedAt: new Date(),
            resolution: normalizedResolution,
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
          reviewedBy: admin.id,
          reviewedAt: new Date(),
          resolution: normalizedResolution,
        },
      })
    }

    safeRevalidatePath('/admin/content/review')
    safeRevalidatePath('/admin/content/reports')
    safeRevalidatePath('/admin')
    invalidateAdminDashboardOverview()
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
  const uniqueReportIds = Array.from(
    new Set(reportIds.map((reportId) => reportId.trim()).filter(Boolean))
  )

  for (let i = 0; i < uniqueReportIds.length; i++) {
    const result = await resolveReport({
      reportId: uniqueReportIds[i],
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

export async function getContentStats(
  timeRange: '7d' | '30d' | 'all' = '7d',
  options?: { subjectId?: string }
): Promise<
  ServiceResult<{
    totalQuestions: number
    byStatus: Record<ContentStatus, number>
    byType: Record<QuestionType, number>
    pendingReports: number
    recentlyAdded: number
  }>
> {
  try {
    const now = Date.now()
    const rangeStart =
      timeRange === 'all'
        ? undefined
        : new Date(now - (timeRange === '30d' ? 30 : 7) * 24 * 60 * 60 * 1000)
    const scopedSubjectId = isUuid(options?.subjectId) ? options?.subjectId : undefined

    const questionWhere: Prisma.QuestionWhereInput = {
      deletedAt: null,
      ...(scopedSubjectId && { subjectId: scopedSubjectId }),
      ...(rangeStart && {
        createdAt: { gte: rangeStart },
      }),
    }

    const reportWhere: Prisma.QuestionReportWhereInput = {
      status: 'PENDING' as const,
      ...(rangeStart && { createdAt: { gte: rangeStart } }),
      question: {
        deletedAt: null,
        ...(scopedSubjectId && { subjectId: scopedSubjectId }),
      },
    }

    const recentlyAddedWhere: Prisma.QuestionWhereInput = {
      deletedAt: null,
      ...(scopedSubjectId && { subjectId: scopedSubjectId }),
      ...(rangeStart && {
        createdAt: { gte: rangeStart },
      }),
    }

    const [
      totalQuestions,
      statusCounts,
      typeCounts,
      pendingReports,
      recentlyAdded,
    ] = await prisma.$transaction([
      prisma.question.count({
        where: questionWhere,
      }),
      prisma.question.groupBy({
        by: ['status'],
        orderBy: { status: 'asc' },
        where: questionWhere,
        _count: true,
      }),
      prisma.question.groupBy({
        by: ['type'],
        orderBy: { type: 'asc' },
        where: questionWhere,
        _count: true,
      }),
      prisma.questionReport.count({ where: reportWhere }),
      prisma.question.count({
        where: recentlyAddedWhere,
      }),
    ])

    const byStatus = statusCounts.reduce(
      (acc, item) => {
        acc[item.status] = extractAggregateCount(item._count)
        return acc
      },
      {} as Record<ContentStatus, number>
    )

    const byType = typeCounts.reduce(
      (acc, item) => {
        acc[item.type] = extractAggregateCount(item._count)
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

export async function getContentReviewActivityLogs(options?: {
  limit?: number
  subjectId?: string
}): Promise<ServiceResult<AuditLogEntry[]>> {
  try {
    const scopedSubjectId = isUuid(options?.subjectId) ? options?.subjectId : undefined
    const logs = await prisma.contentReviewLog.findMany({
      where: {
        contentType: 'question',
      },
      select: {
        id: true,
        contentId: true,
        action: true,
        comment: true,
        createdAt: true,
        reviewer: {
          select: {
            email: true,
            username: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: Math.max(40, (options?.limit ?? 30) * 4),
    })

    const questionIds = Array.from(new Set(logs.map((log) => log.contentId)))
    const questions = await prisma.question.findMany({
      where: {
        id: { in: questionIds },
      },
      select: {
        id: true,
        subjectId: true,
        content: true,
        deletedAt: true,
      },
    })

    const questionMap = new Map(questions.map((question) => [question.id, question]))

    const entries = logs
      .filter((log) => {
        if (!scopedSubjectId) return true
        return questionMap.get(log.contentId)?.subjectId === scopedSubjectId
      })
      .map<AuditLogEntry>((log) => {
        const question = questionMap.get(log.contentId)
        const target = question?.content
          ? question.content.slice(0, 48)
          : '题目记录'
        return {
          id: log.id,
          user: buildReviewLogUser(log.reviewer),
          avatar: '',
          action: mapReviewActionLabel(log.action),
          target:
            target.length >= 48 ? `${target}...` : target,
          timestamp: format(log.createdAt, 'yyyy-MM-dd HH:mm:ss'),
          type: mapReviewActionType(log.action),
          comment:
            log.comment ||
            (question?.deletedAt ? '该题已删除，保留审核轨迹。' : '已记录审核动作'),
        }
      })
      .slice(0, options?.limit ?? 30)

    return {
      success: true,
      data: entries,
    }
  } catch (error) {
    console.error('获取内容审核日志失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取内容审核日志失败',
      code: 'FETCH_FAILED',
    }
  }
}
