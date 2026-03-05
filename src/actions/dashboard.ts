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

  // 1. Gamification Maintenance
  await ensureDailyTasks(user.id)
  await checkAndRefreshStreak(user.id)

  // 2. Fetch Latest User Stats (Streak, XP, StudyTime)
  const userData = await prisma.user.findUnique({
    where: { id: user.id },
    select: { 
      streak: true, 
      xp: true, 
      totalStudyTime: true,
      role: true,
      subscriptionTier: true,
      subscriptionEnd: true,
      permissionOverrides: {
        where: {
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        }
      }
    }
  })

  if (!userData) return null

  // 2.1 Get Retention Policy (C3)
  const tier = getEffectiveTier(userData as UserWithOverrides)
  const minDate = getRetentionDate(tier)

  // 3. Fetch tasks + stats (并行，减少首屏等待)
  const today = dayjs().startOf('day')
  const endOfToday = dayjs().endOf('day')
  const weekStart = today.subtract(6, 'day').startOf('day')
  const retentionStart = dayjs(minDate)
  const weekQueryStart = retentionStart.isAfter(weekStart) ? retentionStart.startOf('day') : weekStart

  const [dailyTasks, weeklyAttempts, totalAttempts, correctAttempts, mistakeCount, recentProgress] = await Promise.all([
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
    prisma.userAttempt.findMany({
      where: {
        userId: user.id,
        createdAt: {
          gte: weekQueryStart.toDate(),
          lte: endOfToday.toDate(),
        },
      },
      select: { createdAt: true },
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

  // 4. Daily activity（单次查询聚合为 7 天数据）
  const dailyActivity: { date: string; activityCount: number }[] = []
  const attemptsByDate = new Map<string, number>()

  for (const attempt of weeklyAttempts) {
    const key = dayjs(attempt.createdAt).format('YYYY-MM-DD')
    attemptsByDate.set(key, (attemptsByDate.get(key) ?? 0) + 1)
  }

  for (let i = 6; i >= 0; i--) {
    const date = today.subtract(i, 'day')
    const key = date.format('YYYY-MM-DD')
    const dayInRetention = !date.endOf('day').isBefore(retentionStart)

    dailyActivity.push({
      date: key,
      activityCount: dayInRetention ? (attemptsByDate.get(key) ?? 0) : 0,
    })
  }

  const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0

  // Convert seconds to hours
  const studyHours = (userData.totalStudyTime / 3600).toFixed(1)

  // 5. Subject Strength（新用户无尝试时跳过重查询）
  let subjectStrengths: { subject: string; accuracy: number }[] = []

  if (totalAttempts > 0) {
    const attempts = await prisma.userAttempt.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: minDate }, // C3: Retention filter
      },
      include: {
        question: {
          include: {
            chapter: {
              include: {
                subject: true,
              },
            },
          },
        },
      },
    })

    const subjectStats: Record<string, { total: number; correct: number }> = {}
    attempts.forEach((a) => {
      const subjectName = a.question.chapter?.subject?.name ?? '未分类'
      if (!subjectStats[subjectName]) {
        subjectStats[subjectName] = { total: 0, correct: 0 }
      }
      subjectStats[subjectName].total++
      if (a.isCorrect) subjectStats[subjectName].correct++
    })

    subjectStrengths = Object.entries(subjectStats).map(([name, stats]) => ({
      subject: name,
      accuracy: Math.round((stats.correct / stats.total) * 100),
    }))
  }

  // 6. Weakness Sniper（基于 attempts 实时聚合）
  let weaknesses: {
    id: string
    topic: string
    subject: string
    masteryLevel: number
  }[] = []

  if (mistakeCount > 0) {
    const errors = await prisma.userAttempt.findMany({
      where: {
        userId: user.id,
        isCorrect: false,
        createdAt: { gte: minDate }, // C3: Retention filter
      },
      take: 200,
      orderBy: { createdAt: 'desc' },
      include: {
        question: {
          include: {
            chapter: {
              include: {
                subject: true,
              },
            },
          },
        },
      },
    })

    const chapterMistakes = new Map<string, { id: string; topic: string; subject: string; count: number }>()
    for (const e of errors) {
      const chapter = e.question.chapter
      if (!chapter) continue
      const existing = chapterMistakes.get(chapter.id) || {
        id: chapter.id,
        topic: chapter.title,
        subject: chapter.subject.name,
        count: 0,
      }
      existing.count += 1
      chapterMistakes.set(chapter.id, existing)
    }

    weaknesses = Array.from(chapterMistakes.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((item) => ({
        id: item.id,
        topic: item.topic,
        subject: item.subject,
        masteryLevel: Math.max(0, 3 - Math.min(3, item.count)),
      }))
  }

  const level = calculateLevel(userData.xp);
  const nextLevelXp = calculateNextLevelXp(level);

  return {
      stats: {
          studyTime: studyHours,
          questions: totalAttempts,
          accuracy: accuracy,
          mistakes: mistakeCount,
          streak: userData.streak,
          level,
          xp: userData.xp,
          nextLevelXp
      },
      recentActivity: recentProgress.map(p => ({
          id: p.lesson.id,
          title: p.lesson.title,
          subject: p.lesson.chapter.subject.name,
          progress: p.progress,
          lastUpdated: p.updatedAt
      })),
      subjectStrengths,
      dailyActivity,
      weaknesses,
      dailyTasks
  }
}
