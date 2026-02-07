'use server'

import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/actions/user/auth'
import dayjs from 'dayjs'
import { 
  ensureDailyTasks, 
  checkAndRefreshStreak, 
  calculateLevel, 
  calculateNextLevelXp 
} from '@/lib/gamification-utils'
import { DailyTask } from '@prisma/client'
import { getEffectiveTier } from '@/lib/permissions/engine'
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
  const tier = getEffectiveTier(userData as any)
  const minDate = getRetentionDate(tier)

  // 3. Fetch Daily Tasks
  const today = dayjs().startOf('day')
  const tomorrow = dayjs().endOf('day')
  
  const dailyTasks = await prisma.dailyTask.findMany({
    where: {
      userId: user.id,
      date: {
        gte: today.toDate(),
        lt: tomorrow.toDate()
      }
    },
    orderBy: { type: 'asc' }
  })

  // 4. Calculate Stats
  const dailyActivity: { date: string; activityCount: number }[] = []

  for (let i = 6; i >= 0; i--) {
      const date = today.subtract(i, 'day')
      const startOfDay = date.toDate()
      const endOfDay = date.endOf('day').toDate()

      // 仅统计在保留期内的活跃度
      const isDateInRetention = dayjs(startOfDay).isAfter(dayjs(minDate)) || dayjs(startOfDay).isSame(dayjs(minDate), 'day')

      const activityCount = isDateInRetention 
        ? await prisma.userAttempt.count({
          where: {
              userId: user.id,
              createdAt: {
                  gte: startOfDay,
                  lte: endOfDay,
                  // 不需要额外加 minDate，因为 startOfDay 已经限定了日期
              }
          }
        })
        : 0

      dailyActivity.push({
          date: date.format('YYYY-MM-DD'),
          activityCount
      })
  }

  const totalAttempts = await prisma.userAttempt.count({
      where: { 
        userId: user.id,
        createdAt: { gte: minDate } // C3: Retention filter
      }
  })

  const correctAttempts = await prisma.userAttempt.count({
      where: { 
        userId: user.id, 
        isCorrect: true,
        createdAt: { gte: minDate } // C3: Retention filter
      }
  })

  const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0

  const mistakeCount = await prisma.errorBook.count({
      where: { 
        userId: user.id,
        updatedAt: { gte: minDate } // C3: Retention filter
      }
  })

  // Convert seconds to hours
  const studyHours = (userData.totalStudyTime / 3600).toFixed(1)

  // 5. Recent Activity
  const recentProgress = await prisma.userProgress.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      take: 3,
      include: {
          lesson: {
              include: {
                  chapter: {
                      include: {
                          subject: true
                      }
                  }
              }
          }
      }
  })

  // 6. Subject Strength
  const attempts = await prisma.userAttempt.findMany({
      where: { 
        userId: user.id,
        createdAt: { gte: minDate } // C3: Retention filter
      },
      include: {
          question: {
              include: {
                  chapter: {
                      include: {
                          subject: true
                      }
                  }
              }
          }
      }
  })

  const subjectStats: Record<string, { total: number; correct: number }> = {}
  attempts.forEach(a => {
      const subjectName = a.question.chapter?.subject?.name ?? '未分类'
      if (!subjectStats[subjectName]) {
          subjectStats[subjectName] = { total: 0, correct: 0 }
      }
      subjectStats[subjectName].total++
      if (a.isCorrect) subjectStats[subjectName].correct++
  })

  const subjectStrengths = Object.entries(subjectStats).map(([name, stats]) => ({
      subject: name,
      accuracy: Math.round((stats.correct / stats.total) * 100)
  }))

  // 7. Weakness Sniper
  const errors = await prisma.errorBook.findMany({
    where: { 
      userId: user.id,
      updatedAt: { gte: minDate } // C3: Retention filter
    },
    take: 5,
    orderBy: { masteryLevel: 'asc' },
    include: {
        question: {
            include: {
                chapter: {
                    include: {
                        subject: true
                    }
                }
            }
        }
    }
  });

  const weaknesses = errors
    .filter(e => e.question.chapter !== null)
    .map(e => ({
      id: e.id,
      topic: e.question.chapter!.title,
      subject: e.question.chapter!.subject.name,
      masteryLevel: e.masteryLevel
  }));

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