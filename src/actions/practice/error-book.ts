'use server'

import prisma from '@/lib/prisma'
import { getCurrentUser } from '../user/auth'
import { PracticeMode, Prisma } from '@prisma/client'
import { getEffectiveTier } from '@/lib/permissions/engine'
import { getRetentionDate } from '@/lib/permissions/prisma-scope'
import { persistPracticeSession } from './submission-core'
import { applyPracticeSubmissionEffects } from './submission-effects'

function streakToMastery(streak: number): number {
  if (streak >= 3) return 3
  if (streak <= 0) return 0
  return streak
}

async function getUserRetentionDate(userId: string): Promise<Date> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      permissionOverrides: {
        where: {
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
      },
    },
  })
  if (!user) return new Date(0)
  return getRetentionDate(getEffectiveTier(user))
}

export async function getErrorBookQuestions(subjectId?: string) {
  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const minDate = await getUserRetentionDate(user.id)

    const attempts = await prisma.userAttempt.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: minDate },
        ...(subjectId && { question: { subjectId } }),
      },
      include: {
        question: {
          include: {
            chapter: { include: { subject: true } },
            subject: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 2000,
    })

    const byQuestion = new Map<string, (typeof attempts)[number][]>()
    for (const attempt of attempts) {
      const list = byQuestion.get(attempt.questionId) || []
      list.push(attempt)
      byQuestion.set(attempt.questionId, list)
    }

    const errors = Array.from(byQuestion.values())
      .map((records) => {
        const latest = records[0]
        const correctStreak = records
          .slice(0, 3)
          .reduce((acc, item) => (item.isCorrect ? acc + 1 : 0), 0)

        return {
          id: `virtual-${latest.userId}-${latest.questionId}`,
          userId: latest.userId,
          questionId: latest.questionId,
          masteryLevel: streakToMastery(correctStreak),
          updatedAt: latest.createdAt,
          question: latest.question,
          latestIsCorrect: latest.isCorrect,
        }
      })
      .filter((item) => item.latestIsCorrect === false)

    return { success: true, data: errors }
  } catch (error) {
    console.error('Error fetching error book questions:', error)
    return { success: false, error: 'Failed to fetch error book questions' }
  }
}

export async function removeErrorBookEntry(_errorBookEntryId: string) {
  return { success: true }
}

export async function updateErrorBookMastery(questionId: string, isCorrect: boolean) {
  try {
    const result = await submitErrorWiperSession({
      attempts: [{ questionId, isCorrect }],
      duration: 10,
      clientSessionId: `legacy-error-book-${questionId}-${Date.now()}`,
    })

    if (!result.success) return result

    const level = result.levels[questionId] ?? 0
    if (level >= 3) return { success: true, mastered: true, message: 'Problem Mastered!' }
    return { success: true, mastered: false, level }
  } catch (error) {
    console.error('Error updating error mastery:', error)
    return { success: false, error: 'Failed to update mastery' }
  }
}

export async function getErrorWiperSession(subjectId?: string) {
  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const minDate = await getUserRetentionDate(user.id)

    const attempts = await prisma.userAttempt.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: minDate },
        ...(subjectId && { question: { subjectId } }),
      },
      include: {
        question: {
          include: {
            chapter: { include: { subject: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5000,
    })

    const byQuestion = new Map<string, (typeof attempts)[number][]>()
    for (const attempt of attempts) {
      const list = byQuestion.get(attempt.questionId) || []
      list.push(attempt)
      byQuestion.set(attempt.questionId, list)
    }

    // Error Wiper 的读定义是“基于历史错题 attempts 聚合出的修复视图”，
    // 不是独立的选题池。因此这里按 question 维度回放用户错误历史，
    // 再筛出“最近仍错”或“整体正确率偏低”的题目作为修复会话。
    const sessionData = Array.from(byQuestion.entries())
      .map(([questionId, records]) => {
        const latest = records[0]
        const lastThree = records.slice(0, 3)
        const correctStreak = lastThree.reduce((acc, r) => (r.isCorrect ? acc + 1 : 0), 0)
        const masteryLevel = streakToMastery(correctStreak)
        const total = records.length
        const correct = records.filter((r) => r.isCorrect).length
        const accuracy = total > 0 ? correct / total : 0

        return {
          id: `virtual-${user.id}-${questionId}`,
          questionId,
          masteryLevel,
          latestIsCorrect: latest.isCorrect,
          accuracy,
          question: latest.question,
        }
      })
      .filter((item) => item.latestIsCorrect === false || item.accuracy < 0.7)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 20)

    return { success: true, data: sessionData }
  } catch (error) {
    console.error('Error fetching wiper session:', error)
    return { success: false, error: 'Failed to fetch wiper session' }
  }
}

export interface ErrorWiperAttemptInput {
  questionId: string
  isCorrect: boolean
}

export interface SubmitErrorWiperSessionInput {
  attempts: ErrorWiperAttemptInput[]
  duration?: number
  subjectId?: string
  clientSessionId?: string | null
}

async function getMasteryLevelsByQuestion(userId: string, questionIds: string[]) {
  const attempts = await prisma.userAttempt.findMany({
    where: {
      userId,
      questionId: { in: questionIds },
    },
    select: {
      questionId: true,
      isCorrect: true,
      createdAt: true,
    },
    orderBy: [{ questionId: 'asc' }, { createdAt: 'desc' }],
  })

  const grouped = new Map<string, boolean[]>()
  for (const attempt of attempts) {
    const list = grouped.get(attempt.questionId) ?? []
    if (list.length < 3) {
      list.push(attempt.isCorrect)
      grouped.set(attempt.questionId, list)
    }
  }

  const levels: Record<string, number> = {}
  for (const questionId of questionIds) {
    const recent = grouped.get(questionId) ?? []
    levels[questionId] = streakToMastery(recent.reduce((acc, isCorrect) => (isCorrect ? acc + 1 : 0), 0))
  }

  return levels
}

export async function submitErrorWiperSession(input: SubmitErrorWiperSessionInput) {
  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    if (!input.attempts || input.attempts.length === 0) {
      return { success: false, error: 'No attempts submitted' }
    }

    const questionIds = input.attempts.map((attempt) => attempt.questionId)
    const questions = await prisma.question.findMany({
      where: {
        id: { in: questionIds },
        status: { in: ['PUBLISHED', 'VERIFIED'] },
      },
      select: {
        id: true,
        subjectId: true,
      },
    })

    if (questions.length === 0) {
      return { success: false, error: 'No valid questions found' }
    }

    const questionMap = new Map(questions.map((question) => [question.id, question]))
    const averageDuration =
      input.duration && input.attempts.length > 0
        ? Math.max(1, Math.round(input.duration / input.attempts.length))
        : 10

    const persisted = await persistPracticeSession({
      userId: user.id,
      mode: PracticeMode.ERROR_WIPER,
      clientSessionId: input.clientSessionId ?? null,
      subjectId:
        input.subjectId ??
        questions.find((question) => question.subjectId)?.subjectId ??
        null,
      title: 'Error Wiper Session',
      duration: input.duration ?? input.attempts.length * 10,
      attempts: input.attempts
        .filter((attempt) => questionMap.has(attempt.questionId))
        .map((attempt) => ({
          questionId: attempt.questionId,
          userAnswer: (attempt.isCorrect ? 'CORRECTED' : 'WRONG') as Prisma.InputJsonValue,
          isCorrect: attempt.isCorrect,
          duration: averageDuration,
        })),
    })

    if (persisted.created) {
      await applyPracticeSubmissionEffects({
        userId: user.id,
        mode: PracticeMode.ERROR_WIPER,
        correctCount: persisted.correctCount,
        duration: input.duration ?? input.attempts.length * 10,
      })
    }

    const levels = await getMasteryLevelsByQuestion(
      user.id,
      input.attempts.map((attempt) => attempt.questionId)
    )

    return {
      success: true,
      examRecordId: persisted.examRecordId,
      levels,
      wipedQuestionIds: Object.entries(levels)
        .filter(([, level]) => level >= 3)
        .map(([questionId]) => questionId),
    }
  } catch (error) {
    console.error('Error updating wiper progress:', error)
    return { success: false, error: 'Failed to update progress' }
  }
}

export async function updateErrorWiperProgress(questionId: string, isCorrect: boolean) {
  const result = await submitErrorWiperSession({
    attempts: [{ questionId, isCorrect }],
    duration: 10,
    clientSessionId: `legacy-error-wiper-${questionId}-${Date.now()}`,
  })

  if (!result.success) return result

  const level = result.levels[questionId] ?? 0
  return { success: true, wiped: level >= 3, level }
}
