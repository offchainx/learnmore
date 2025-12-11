'use server'

import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/actions/auth'
import dayjs from 'dayjs'

export interface DashboardData {
  stats: {
    studyTime: string
    questions: number
    accuracy: number
    mistakes: number
    streak: number
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
}

export async function getDashboardStats(): Promise<DashboardData | null> {
  const user = await getCurrentUser()
      if (!user) return null
  
      const today = dayjs().startOf('day')
      const dailyActivity: { date: string; activityCount: number }[] = []
  
      for (let i = 6; i >= 0; i--) {
          const date = today.subtract(i, 'day')
          const startOfDay = date.toDate()
          const endOfDay = date.endOf('day').toDate()
  
          const activityCount = await prisma.userAttempt.count({
              where: {
                  userId: user.id,
                  createdAt: {
                      gte: startOfDay,
                      lte: endOfDay
                  }
              }
          })
          dailyActivity.push({
              date: date.format('YYYY-MM-DD'),
              activityCount
          })
      }
      // 1. Basic Stats
      const totalAttempts = await prisma.userAttempt.count({
          where: { userId: user.id }
      })
  
      const correctAttempts = await prisma.userAttempt.count({
          where: { userId: user.id, isCorrect: true }
      })
  
      const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0
  
      const mistakeCount = await prisma.errorBook.count({
          where: { userId: user.id }
      })
  
      // Mock study time based on completed lessons (e.g. 30 mins per lesson)
      const completedLessons = await prisma.userProgress.count({
          where: { userId: user.id, isCompleted: true }
      })
      const studyHours = (completedLessons * 0.5).toFixed(1)
  
      // 2. Recent Activity (Continue Learning)
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
  
      // 3. Subject Strength (Accuracy per Subject)
      // Fetch attempts with subject info
      const attempts = await prisma.userAttempt.findMany({
          where: { userId: user.id },
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
          const subjectName = a.question.chapter.subject.name
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
  
      return {
          stats: {
              studyTime: studyHours,
              questions: totalAttempts,
              accuracy: accuracy,
              mistakes: mistakeCount,
              streak: 1 // Placeholder for now
          },
          recentActivity: recentProgress.map(p => ({
              id: p.lesson.id,
              title: p.lesson.title,
              subject: p.lesson.chapter.subject.name,
              progress: p.progress,
              lastUpdated: p.updatedAt
          })),
          subjectStrengths,
          dailyActivity // Include daily activity data
      }
  }
