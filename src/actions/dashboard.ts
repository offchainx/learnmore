'use server'

import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/actions/user/auth'
import dayjs from 'dayjs'
import { ensureDailyTasks } from '@/actions/gamification/daily-tasks'
import { checkAndRefreshStreak } from '@/actions/gamification/streak'
import { calculateLevel, calculateNextLevelXp } from '@/lib/gamification'
import { DailyTask, PracticeMode } from '@prisma/client'
import { getEffectiveTier } from '@/lib/permissions/engine'
import type { UserWithOverrides } from '@/lib/permissions/engine'
import { getRetentionDate } from '@/lib/permissions/prisma-scope'

export type DashboardOverviewWindow = '7D' | '30D'

export interface DashboardData {
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
  overviewByWindow: Record<
    DashboardOverviewWindow,
    {
      studyTime: string
      questions: number
      accuracy: number
      activeDays: number
    }
  >
  recentActivity: {
    id: string
    title: string
    subject: string
    progress: number
    lastUpdated: Date
  }[]
  recentPractice: {
    id: string
    title: string
    subject: string
    mode: PracticeMode
    score: number
    totalQuestions: number
    correctCount: number
    duration: number | null
    createdAt: Date
  }[]
  subjectStrengths: {
    subject: string
    accuracy: number
  }[]
  dailyActivity: {
    date: string
    activityCount: number
  }[]
  weaknesses: {
    id: string
    topic: string
    subject: string
    masteryLevel: number
  }[]
  dailyTasks: DailyTask[]
}

function formatHours(totalSeconds: number): string {
  return (totalSeconds / 3600).toFixed(1)
}

function buildOverviewWindow(
  attempts: Array<{ createdAt: Date; isCorrect: boolean }>,
  examDurations: Array<{ createdAt: Date; duration: number | null }>,
  since: Date,
): {
  studyTime: string
  questions: number
  accuracy: number
  activeDays: number
} {
  const filteredAttempts = attempts.filter((attempt) => attempt.createdAt >= since)
  const correctAttempts = filteredAttempts.filter((attempt) => attempt.isCorrect).length
  const activeDays = new Set(filteredAttempts.map((attempt) => dayjs(attempt.createdAt).format('YYYY-MM-DD'))).size
  const totalStudySeconds = examDurations
    .filter((record) => record.createdAt >= since)
    .reduce((sum, record) => sum + (record.duration ?? 0), 0)

  return {
    studyTime: formatHours(totalStudySeconds),
    questions: filteredAttempts.length,
    accuracy: filteredAttempts.length > 0 ? Math.round((correctAttempts / filteredAttempts.length) * 100) : 0,
    activeDays,
  }
}

export async function getDashboardStats(): Promise<DashboardData | null> {
  const user = await getCurrentUser()
  if (!user) return null

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
  const thirtyDaysAgo = dayjs().subtract(30, 'day').startOf('day').toDate()
  const sevenDaysAgo = dayjs().subtract(7, 'day').startOf('day').toDate()

  const [
    dailyTasks,
    totalAttempts,
    correctAttempts,
    mistakeCount,
    recentProgress,
    attemptsInThirtyDays,
    examRecordsInThirtyDays,
    recentPractice,
  ] = await Promise.all([
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
        createdAt: { gte: minDate },
      },
    }),
    prisma.userAttempt.count({
      where: {
        userId: user.id,
        isCorrect: true,
        createdAt: { gte: minDate },
      },
    }),
    prisma.userAttempt.count({
      where: {
        userId: user.id,
        isCorrect: false,
        createdAt: { gte: minDate },
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
    prisma.userAttempt.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: thirtyDaysAgo },
      },
      select: {
        createdAt: true,
        isCorrect: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.examRecord.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: thirtyDaysAgo },
      },
      select: {
        createdAt: true,
        duration: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.examRecord.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: {
        subject: {
          select: {
            name: true,
          },
        },
      },
    }),
  ])

  const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0
  const studyHours = ((user.totalStudyTime ?? 0) / 3600).toFixed(1)
  const level = calculateLevel(user.xp ?? 0)
  const nextLevelXp = calculateNextLevelXp(level)

  return {
    stats: {
      studyTime: studyHours,
      questions: totalAttempts,
      accuracy,
      mistakes: mistakeCount,
      streak: user.streak ?? 0,
      level,
      xp: user.xp ?? 0,
      nextLevelXp,
    },
    overviewByWindow: {
      '7D': buildOverviewWindow(attemptsInThirtyDays, examRecordsInThirtyDays, sevenDaysAgo),
      '30D': buildOverviewWindow(attemptsInThirtyDays, examRecordsInThirtyDays, thirtyDaysAgo),
    },
    recentActivity: recentProgress.map((progress) => ({
      id: progress.lesson.id,
      title: progress.lesson.title,
      subject: progress.lesson.chapter.subject?.name ?? '未分类',
      progress: progress.progress,
      lastUpdated: progress.updatedAt,
    })),
    recentPractice: recentPractice.map((record) => ({
      id: record.id,
      title: record.title || '未命名练习',
      subject: record.subject?.name ?? '未分类',
      mode: record.mode,
      score: Math.round(record.score),
      totalQuestions: record.totalQuestions,
      correctCount: record.correctCount,
      duration: record.duration,
      createdAt: record.createdAt,
    })),
    subjectStrengths: [],
    dailyActivity: [],
    weaknesses: [],
    dailyTasks,
  }
}
