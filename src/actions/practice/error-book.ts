'use server'

import prisma from '@/lib/prisma'
import { getCurrentUser } from '../user/auth'
import { DailyTaskType, PracticeMode } from '@prisma/client'
import { checkAndRefreshStreak } from '@/actions/gamification/streak'
import { trackDailyProgress } from '@/actions/gamification/daily-tasks'
import { getEffectiveTier } from '@/lib/permissions/engine'
import { getRetentionDate } from '@/lib/permissions/prisma-scope'

function streakToMastery(streak: number): number {
  if (streak >= 3) return 3
  if (streak <= 0) return 0
  return streak
}

async function createWiperAttempt(userId: string, questionId: string, isCorrect: boolean): Promise<void> {
  const examRecord = await prisma.examRecord.create({
    data: {
      userId,
      mode: PracticeMode.ERROR_WIPER,
      title: 'Error Wiper Session',
      score: isCorrect ? 100 : 0,
      totalQuestions: 1,
      correctCount: isCorrect ? 1 : 0,
      duration: 10,
    },
  })

  await prisma.userAttempt.create({
    data: {
      userId,
      questionId,
      examRecordId: examRecord.id,
      userAnswer: isCorrect ? 'CORRECTED' : 'WRONG',
      isCorrect,
      duration: 10,
    },
  })
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
    const user = await getCurrentUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    await createWiperAttempt(user.id, questionId, isCorrect)

    if (isCorrect) {
      await trackDailyProgress(user.id, DailyTaskType.FIX_ERROR)
      await checkAndRefreshStreak(user.id)
    }

    const recent = await prisma.userAttempt.findMany({
      where: { userId: user.id, questionId },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: { isCorrect: true },
    })
    const level = streakToMastery(recent.reduce((acc, r) => (r.isCorrect ? acc + 1 : 0), 0))

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

export async function updateErrorWiperProgress(questionId: string, isCorrect: boolean) {
  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    await createWiperAttempt(user.id, questionId, isCorrect)

    if (isCorrect) {
      await trackDailyProgress(user.id, DailyTaskType.FIX_ERROR)
      await checkAndRefreshStreak(user.id)
    }

    const recent = await prisma.userAttempt.findMany({
      where: { userId: user.id, questionId },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: { isCorrect: true },
    })

    const level = streakToMastery(recent.reduce((acc, r) => (r.isCorrect ? acc + 1 : 0), 0))
    return { success: true, wiped: level >= 3, level }
  } catch (error) {
    console.error('Error updating wiper progress:', error)
    return { success: false, error: 'Failed to update progress' }
  }
}
