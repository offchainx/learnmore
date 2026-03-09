'use server'

import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/actions/user/auth'
import dayjs from 'dayjs'
import { ensureDailyTasks } from '@/actions/gamification/daily-tasks'
import { checkAndRefreshStreak } from '@/actions/gamification/streak'
import { calculateLevel, calculateNextLevelXp } from '@/lib/gamification'
import { DailyTask } from '@prisma/client'
import { getEffectiveTier } from '@/lib/permissions/engine'
import type { UserWithOverrides } from '@/lib/permissions/engine'
import { getRetentionDate } from '@/lib/permissions/prisma-scope'

export interface DashboardData {
// ... (rest of the interface)

  stats: {
    studyTime: string
    questions: number
    accuracy: number
    mistakes: number
    streak: number
    level: number
    xp: number
    nextLevelXp: number
  }
  recentActivity: {
    id: string
    title: string
    subject: string
    progress: number
    lastUpdated: Date
  }[]
  subjectStrengths: {
    subject: string
    accuracy: number
  }[]
  dailyActivity: {
    date: string // YYYY-MM-DD
    activityCount: number
  }[]
  weaknesses: {
    id: string // errorBookEntryId
    topic: string // question content excerpt or chapter title
    subject: string
    masteryLevel: number
  }[]
  dailyTasks: DailyTask[]
}

export async function getDashboardStats(): Promise<DashboardData | null> {
  const user = await getCurrentUser()
  if (!user) return null

  // Gamification maintenance is decoupled from rendering path to avoid blocking first paint.
  void ensureDailyTasks(user.id).catch((error) => {
    console.warn('[Dashboard] ensureDailyTasks failed:', error)
  })
  void checkAndRefreshStreak(user.id).catch((error) => {
    console.warn('[Dashboard] checkAndRefreshStreak failed:', error)
  })

  const tier = getEffectiveTier(user as UserWithOverrides)
  const minDate = getRetentionDate(tier)
  const today = dayjs().startOf('day')
  const endOfToday = dayjs().endOf('day')
  const [dailyTasks, totalAttempts, correctAttempts, mistakeCount, recentProgress] = await Promise.all([
    prisma.dailyTask.findMany({
      where: {
        userId: user.id,
        date: {
          gte: today.toDate(),
          lt: endOfToday.toDate(),
        },
      },
      orderBy: { type: 'asc' },
    }),
    prisma.userAttempt.count({
      where: {
        userId: user.id,
        createdAt: { gte: minDate }, // C3: Retention filter
      },
    }),
    prisma.userAttempt.count({
      where: {
        userId: user.id,
        isCorrect: true,
        createdAt: { gte: minDate }, // C3: Retention filter
      },
    }),
    prisma.userAttempt.count({
      where: {
        userId: user.id,
        isCorrect: false,
        createdAt: { gte: minDate }, // C3: Retention filter
      },
    }),
    prisma.userProgress.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      take: 3,
      include: {
        lesson: {
          include: {
            chapter: {
              include: {
                subject: true,
              },
            },
          },
        },
      },
    }),
  ])

  const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0

  // Convert seconds to hours
  const studyHours = ((user.totalStudyTime ?? 0) / 3600).toFixed(1)
  const level = calculateLevel(user.xp ?? 0)
  const nextLevelXp = calculateNextLevelXp(level);

  return {
      stats: {
          studyTime: studyHours,
          questions: totalAttempts,
          accuracy: accuracy,
          mistakes: mistakeCount,
          streak: user.streak ?? 0,
          level,
          xp: user.xp ?? 0,
          nextLevelXp
      },
      recentActivity: recentProgress.map(p => ({
          id: p.lesson.id,
          title: p.lesson.title,
          subject: p.lesson.chapter.subject?.name ?? '未分类',
          progress: p.progress,
          lastUpdated: p.updatedAt
      })),
      subjectStrengths: [],
      dailyActivity: [],
      weaknesses: [],
      dailyTasks
  }
}
