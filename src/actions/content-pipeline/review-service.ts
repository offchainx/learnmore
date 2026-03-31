'use server'

import prisma from '@/lib/prisma'
import { ContentStatus, Prisma, QuestionType, ReviewAction } from '@prisma/client'
import { getCurrentUser } from '@/actions/user/auth'
import type { QuestionReviewData } from '@/types/content-pipeline'
import {
  updateQuestion as updateQuestionCore,
  updateQuestionStatus,
} from '@/actions/content-pipeline/question-service'
import { normalizeExamcooImageUrl } from '@/lib/content-pipeline/examcoo-image'

function toDifficultyInfo(difficulty: number): { level: string; label: string } {
  const map: Record<number, { level: string; label: string }> = {
    1: { level: 'L1', label: '基础' },
    2: { level: 'L2', label: '简单' },
    3: { level: 'L3', label: '中等' },
    4: { level: 'L4', label: '困难' },
    5: { level: 'L5', label: '极难' },
  }
  return map[difficulty] || { level: 'L3', label: '中等' }
}

function parseDifficulty(level: string): number {
  const n = Number(level.replace('L', '').trim())
  if (Number.isNaN(n) || n < 1 || n > 5) return 3
  return n
}

function toQuestionType(type: string): QuestionType {
  if (type === 'SINGLE_CHOICE') return QuestionType.SINGLE_CHOICE
  if (type === 'MULTIPLE_CHOICE') return QuestionType.MULTIPLE_CHOICE
  if (type === 'FILL_BLANK') return QuestionType.FILL_BLANK
  if (type === 'ESSAY') return QuestionType.ESSAY
  if (type === 'TRUE_FALSE') return QuestionType.TRUE_FALSE
  return QuestionType.SINGLE_CHOICE
}

function buildHistoryStatusLabel(
  action: ReviewAction,
  changes?: unknown
): string {
  const changePayload =
    changes && typeof changes === 'object' ? (changes as Record<string, unknown>) : null

  if (action === ReviewAction.REQUEST_CHANGE && changePayload?.__kind === 'manual_edit') {
    return '编辑题目'
  }

  switch (action) {
    case ReviewAction.SUBMIT_REVIEW:
      return '提交审核'
    case ReviewAction.APPROVE:
      return '审核通过'
    case ReviewAction.REJECT:
      return '驳回题目'
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

function buildHistoryColor(
  action: ReviewAction,
  changes?: unknown
): string {
  const changePayload =
    changes && typeof changes === 'object' ? (changes as Record<string, unknown>) : null

  if (action === ReviewAction.REQUEST_CHANGE && changePayload?.__kind === 'manual_edit') {
    return 'bg-amber-500'
  }

  switch (action) {
    case ReviewAction.APPROVE:
    case ReviewAction.PUBLISH:
      return 'bg-emerald-500'
    case ReviewAction.REJECT:
      return 'bg-rose-500'
    case ReviewAction.ARCHIVE:
      return 'bg-slate-500'
    case ReviewAction.REQUEST_CHANGE:
      return 'bg-amber-500'
    case ReviewAction.SUBMIT_REVIEW:
    default:
      return 'bg-blue-500'
  }
}

function buildReviewerName(user?: { username?: string | null; email?: string | null } | null): string {
  return user?.username || user?.email || '系统'
}

function buildChapterPathLabel(
  chapterId: string,
  chapterMap: Map<
    string,
    {
      id: string
      title: string
      parentId: string | null
      subjectId: string
    }
  >
): string {
  const labels: string[] = []
  let currentId: string | null = chapterId
  const guard = new Set<string>()

  while (currentId && !guard.has(currentId)) {
    guard.add(currentId)
    const current = chapterMap.get(currentId)
    if (!current) break
    labels.unshift(current.title)
    currentId = current.parentId
  }

  return labels.join(' / ')
}

function diffQuestionForReviewEdit(
  current: {
    content: string
    type: QuestionType
    difficulty: number
    subjectId: string | null
    chapterId: string | null
    options: Record<string, string> | null
    answer: unknown
    explanation: string | null
    tags: string[]
    status: ContentStatus
  },
  next: QuestionReviewData
): Record<string, unknown> | null {
  const nextOptions = next.options.reduce<Record<string, string>>((acc, item) => {
    acc[item.id] = item.value
    return acc
  }, {})
  const nextCorrectAnswers = next.options.filter((x) => x.isCorrect).map((x) => x.id)
  let nextAnswer: string | string[] | null = null

  if (
    next.metadata.type === QuestionType.SINGLE_CHOICE ||
    next.metadata.type === QuestionType.TRUE_FALSE
  ) {
    nextAnswer = nextCorrectAnswers[0] || ''
  } else if (next.metadata.type === QuestionType.MULTIPLE_CHOICE) {
    nextAnswer = nextCorrectAnswers
  } else if (
    next.metadata.type === QuestionType.FILL_BLANK ||
    next.metadata.type === QuestionType.ESSAY
  ) {
    nextAnswer = next.answerValue ?? ''
  }

  const nextDifficulty = parseDifficulty(next.metadata.difficulty)
  const changes: Record<string, unknown> = {
    __kind: 'manual_edit',
  }

  if (current.content !== next.stem) {
    changes.content = { before: current.content, after: next.stem }
  }
  if (current.type !== toQuestionType(next.metadata.type)) {
    changes.type = { before: current.type, after: next.metadata.type }
  }
  if (current.difficulty !== nextDifficulty) {
    changes.difficulty = { before: current.difficulty, after: nextDifficulty }
  }
  if ((current.subjectId ?? null) !== (next.metadata.subjectId ?? null)) {
    changes.subjectId = {
      before: current.subjectId ?? null,
      after: next.metadata.subjectId ?? null,
    }
  }
  if ((current.chapterId ?? null) !== (next.metadata.chapterId ?? null)) {
    changes.chapterId = {
      before: current.chapterId ?? null,
      after: next.metadata.chapterId ?? null,
    }
  }
  if (JSON.stringify(current.options ?? null) !== JSON.stringify(nextOptions)) {
    changes.options = { before: current.options ?? null, after: nextOptions }
  }
  if (JSON.stringify(current.answer) !== JSON.stringify(nextAnswer)) {
    changes.answer = { before: current.answer, after: nextAnswer }
  }
  if ((current.explanation || '') !== (next.explanation.text || '')) {
    changes.explanation = {
      before: current.explanation || '',
      after: next.explanation.text || '',
    }
  }
  if (JSON.stringify(current.tags ?? []) !== JSON.stringify(next.metadata.tags ?? [])) {
    changes.tags = { before: current.tags ?? [], after: next.metadata.tags ?? [] }
  }

  return Object.keys(changes).length > 1 ? changes : null
}

async function getReviewerId(): Promise<string> {
  const user = await getCurrentUser()
  if (user?.id) return user.id
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' }, select: { id: true } })
  if (admin?.id) return admin.id
  const fallback = await prisma.user.findFirst({ select: { id: true } })
  if (!fallback?.id) throw new Error('No available reviewer')
  return fallback.id
}

export async function getQuestionForReview(questionId: string): Promise<QuestionReviewData | null> {
  try {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: {
        id: true,
        content: true,
        type: true,
        options: true,
        answer: true,
        explanation: true,
        difficulty: true,
        subjectId: true,
        chapterId: true,
        tags: true,
        status: true,
        createdAt: true,
        assetUrl: true,
        imageUrls: true,
        sourceFile: {
          select: {
            fileUrl: true,
          },
        },
        chapter: {
          select: {
            title: true,
            subject: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        group: {
          select: {
            id: true,
            title: true,
            material: true,
            imageUrls: true,
            questions: {
              select: {
                id: true,
                content: true,
                type: true,
                status: true,
              },
              where: {
                deletedAt: null,
              },
              orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
            },
          },
        },
        subject: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!question) return null

    const optionsData = question.options as Record<string, string> | null
    const answerData = question.answer
    const correctAnswers = Array.isArray(answerData)
      ? answerData.map(String)
      : typeof answerData === 'string'
      ? [answerData]
      : []

    const options: QuestionReviewData['options'] = optionsData
      ? Object.entries(optionsData).map(([key, value]) => ({
          id: key,
          value,
          isCorrect: correctAnswers.includes(key),
        }))
      : []

    const storedImageUrls = Array.isArray(question.imageUrls)
      ? question.imageUrls
          .filter((url): url is string => typeof url === 'string' && url.length > 0)
          .map((url) => normalizeExamcooImageUrl(url) || url)
      : []
    const stemImageUrls = Array.from(
      new Set(
        (question.content.match(/!\[[^\]]*]\((https?:\/\/[^)]+)\)/gi) || [])
          .map((item) => {
            const rawUrl = item.match(/\((https?:\/\/[^)]+)\)/i)?.[1]
            return normalizeExamcooImageUrl(rawUrl) || rawUrl
          })
          .filter((x): x is string => Boolean(x))
      )
    )
    const questionImageUrls = Array.from(
      new Set([
        ...storedImageUrls,
        ...(question.assetUrl ? [normalizeExamcooImageUrl(question.assetUrl) || question.assetUrl] : []),
        ...stemImageUrls,
      ])
    )

    const difficultyInfo = toDifficultyInfo(question.difficulty)
    const [subjects, chapters] = await Promise.all([
      prisma.subject.findMany({
        select: { id: true, name: true, order: true },
        orderBy: [{ order: 'asc' }, { name: 'asc' }],
      }),
      prisma.chapter.findMany({
        select: {
          id: true,
          title: true,
          subjectId: true,
          parentId: true,
          order: true,
        },
        orderBy: [{ order: 'asc' }, { title: 'asc' }],
      }),
    ])

    const chapterMap = new Map(
      chapters.map((chapter) => [
        chapter.id,
        {
          id: chapter.id,
          title: chapter.title,
          parentId: chapter.parentId ?? null,
          subjectId: chapter.subjectId,
        },
      ])
    )
    const parentChapterIds = new Set(
      chapters
        .map((chapter) => chapter.parentId)
        .filter((parentId): parentId is string => Boolean(parentId))
    )
    const currentChapterPath = question.chapterId
      ? buildChapterPathLabel(question.chapterId, chapterMap)
      : null

    const reviewLogs = await prisma.contentReviewLog.findMany({
      where: {
        contentType: 'question',
        contentId: questionId,
      },
      select: {
        action: true,
        comment: true,
        changes: true,
        createdAt: true,
        reviewer: {
          select: {
            username: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    const history: QuestionReviewData['history'] = [
      {
        status: '题目创建',
        date: new Date(question.createdAt).toLocaleString('zh-CN'),
        user: '系统',
        color: 'bg-blue-500',
      },
      ...reviewLogs.map((log) => ({
        status: buildHistoryStatusLabel(log.action, log.changes),
        date: new Date(log.createdAt).toLocaleString('zh-CN'),
        user: buildReviewerName(log.reviewer),
        color: buildHistoryColor(log.action, log.changes),
        comment: log.comment || undefined,
      })),
    ]

    return {
      id: question.id,
      title: `题目 ${question.id.substring(0, 8)}`,
      group: question.group
        ? {
            id: question.group.id,
            title: question.group.title ?? null,
            material: question.group.material,
            imageUrls: Array.isArray(question.group.imageUrls)
              ? question.group.imageUrls.filter(
                  (url): url is string => typeof url === 'string' && url.length > 0
                )
              : [],
            subQuestions: question.group.questions.map((subQuestion) => ({
              id: subQuestion.id,
              title: subQuestion.content.slice(0, 64),
              type: subQuestion.type,
              status: subQuestion.status,
              isCurrent: subQuestion.id === question.id,
            })),
          }
        : null,
      stem: question.content,
      options,
      answerValue:
        Array.isArray(question.answer)
          ? question.answer.map((item) => String(item))
          : typeof question.answer === 'string'
            ? question.answer
            : question.answer === null || question.answer === undefined
              ? null
              : String(question.answer),
      explanation: { text: question.explanation || '', steps: [] },
      metadata: {
        subject: question.subject?.name || question.chapter?.subject?.name || '未分类',
        subjectId: question.subjectId ?? question.chapter?.subject?.id ?? null,
        topic: currentChapterPath || question.chapter?.title || '未分类',
        chapterId: question.chapterId ?? null,
        type: question.type,
        difficulty: difficultyInfo.level,
        difficultyLabel: difficultyInfo.label,
        points: 5,
        tags: question.tags ?? [],
      },
      history,
      availableSubjects: subjects.map((subject) => ({
        id: subject.id,
        name: subject.name,
      })),
      availableChapters: chapters.map((chapter) => ({
        id: chapter.id,
        subjectId: chapter.subjectId,
        title: chapter.title,
        pathLabel: buildChapterPathLabel(chapter.id, chapterMap),
      })).filter((chapter) => !parentChapterIds.has(chapter.id)),
      questionImageUrls,
      sourceImageUrl: question.assetUrl || question.sourceFile?.fileUrl,
      status: question.status,
    }
  } catch (error) {
    console.error('获取题目审核数据失败:', error)
    return null
  }
}

export async function updateQuestion(questionId: string, data: QuestionReviewData) {
  const reviewerId = await getReviewerId()
  const current = await prisma.question.findUnique({
    where: { id: questionId },
    select: {
      content: true,
      type: true,
      difficulty: true,
      subjectId: true,
      chapterId: true,
      options: true,
      answer: true,
      explanation: true,
      tags: true,
      status: true,
    },
  })

  if (!current) {
    return { success: false, error: '题目不存在' }
  }

  const changes = diffQuestionForReviewEdit(
    {
      content: current.content,
      type: current.type,
      difficulty: current.difficulty,
      subjectId: current.subjectId ?? null,
      chapterId: current.chapterId ?? null,
      options: (current.options as Record<string, string> | null) ?? null,
      answer: current.answer,
      explanation: current.explanation,
      tags: current.tags ?? [],
      status: current.status,
    },
    data
  )

  const options = data.options.reduce<Record<string, string>>((acc, item) => {
    acc[item.id] = item.value
    return acc
  }, {})

  const correctAnswers = data.options.filter((x) => x.isCorrect).map((x) => x.id)
  let answer: string | string[] | null
  if (data.metadata.type === QuestionType.SINGLE_CHOICE || data.metadata.type === QuestionType.TRUE_FALSE) {
    answer = correctAnswers[0] || ''
  } else if (data.metadata.type === QuestionType.MULTIPLE_CHOICE) {
    answer = correctAnswers
  } else {
    answer = data.answerValue ?? ''
  }

  const result = await updateQuestionCore(questionId, {
    content: data.stem,
    type: toQuestionType(data.metadata.type),
    difficulty: parseDifficulty(data.metadata.difficulty),
    subjectId: data.metadata.subjectId ?? null,
    options,
    answer,
    explanation: data.explanation.text,
    chapterId: data.metadata.chapterId ?? null,
    tags: data.metadata.tags,
  })

  if (result.success && changes) {
    await prisma.contentReviewLog.create({
      data: {
        contentType: 'question',
        contentId: questionId,
        action: ReviewAction.REQUEST_CHANGE,
        fromStatus: current.status,
        toStatus: current.status,
        reviewerId,
        comment: '审核台编辑并保存题目',
        changes: changes as Prisma.InputJsonValue,
      },
    })
  }

  return { success: result.success, error: result.error }
}

export async function approveQuestion(questionId: string, feedback?: string) {
  const reviewerId = await getReviewerId()
  const verify = await updateQuestionStatus({
    questionId,
    newStatus: ContentStatus.VERIFIED,
    reviewerId,
    comment: feedback,
  })

  if (!verify.success) return { success: false, message: verify.error }

  const publish = await updateQuestionStatus({
    questionId,
    newStatus: ContentStatus.PUBLISHED,
    reviewerId,
    comment: feedback,
  })

  return { success: publish.success, message: publish.success ? '审核通过成功' : publish.error }
}

export async function rejectQuestion(questionId: string, reason: string) {
  const reviewerId = await getReviewerId()
  const result = await updateQuestionStatus({
    questionId,
    newStatus: ContentStatus.REVIEW_REJECTED,
    reviewerId,
    comment: reason,
  })

  return { success: result.success, message: result.success ? '已拒绝该题目' : result.error }
}
