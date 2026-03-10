'use server'

import prisma from '@/lib/prisma'
import { ContentStatus, QuestionType } from '@prisma/client'
import { getCurrentUser } from '@/actions/user/auth'
import type { QuestionReviewData } from '@/types/content-pipeline'
import {
  updateQuestion as updateQuestionCore,
  updateQuestionStatus,
} from '@/actions/content-pipeline/question-service'

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
                name: true,
              },
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
      ? question.imageUrls.filter((url): url is string => typeof url === 'string' && url.length > 0)
      : []
    const stemImageUrls = Array.from(
      new Set(
        (question.content.match(/!\[[^\]]*]\((https?:\/\/[^)]+)\)/gi) || [])
          .map((item) => item.match(/\((https?:\/\/[^)]+)\)/i)?.[1])
          .filter((x): x is string => Boolean(x))
      )
    )
    const questionImageUrls = Array.from(
      new Set([
        ...storedImageUrls,
        ...(question.assetUrl ? [question.assetUrl] : []),
        ...stemImageUrls,
      ])
    )

    const difficultyInfo = toDifficultyInfo(question.difficulty)

    return {
      id: question.id,
      title: `题目 ${question.id.substring(0, 8)}`,
      stem: question.content,
      options,
      explanation: { text: question.explanation || '', steps: [] },
      metadata: {
        subject: question.subject?.name || question.chapter?.subject?.name || '未分类',
        topic: question.chapter?.title || '未分类',
        type: question.type,
        difficulty: difficultyInfo.level,
        difficultyLabel: difficultyInfo.label,
        points: 5,
        tags: question.tags ?? [],
      },
      history: [
        {
          status: '题目创建',
          date: new Date(question.createdAt).toLocaleDateString('zh-CN'),
          user: '系统',
          color: 'bg-blue-500',
        },
      ],
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
  const options = data.options.reduce<Record<string, string>>((acc, item) => {
    acc[item.id] = item.value
    return acc
  }, {})

  const correctAnswers = data.options.filter((x) => x.isCorrect).map((x) => x.id)
  const answer: string | string[] = correctAnswers.length <= 1 ? (correctAnswers[0] || '') : correctAnswers

  const result = await updateQuestionCore(questionId, {
    content: data.stem,
    type: toQuestionType(data.metadata.type),
    difficulty: parseDifficulty(data.metadata.difficulty),
    options,
    answer,
    explanation: data.explanation.text,
    tags: data.metadata.tags,
  })

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
