'use server'

import prisma from '@/lib/prisma'
import { UserRole } from '@prisma/client'

export interface QuotaStatus {
  used: number
  limit: number
  remaining: number
  canProceed: boolean
}

// 每日答题限额配置
const DAILY_QUESTION_LIMITS: Record<UserRole, number> = {
  STUDENT: 20,
  PARENT: 20, // 假设家长同学生
  PRO: 100,
  ULTIMATE: Infinity,
  TEACHER: Infinity,
  ADMIN: Infinity,
}

// 每周模拟考试限额配置
const WEEKLY_EXAM_LIMITS: Record<UserRole, number> = {
  STUDENT: 2,
  PARENT: 2,
  PRO: 10,
  ULTIMATE: Infinity,
  TEACHER: Infinity,
  ADMIN: Infinity,
}

/**
 * 检查每日答题配额 (针对 Smart Drill / Error Wiper)
 */
export async function checkDailyQuota(userId: string): Promise<QuotaStatus> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  })

  if (!user) {
    throw new Error('User not found')
  }

  const limit = DAILY_QUESTION_LIMITS[user.role]
  
  if (limit === Infinity) {
    return { used: 0, limit, remaining: Infinity, canProceed: true }
  }

  // 获取今日零点时间
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const used = await prisma.userAttempt.count({
    where: {
      userId,
      createdAt: { gte: today }
    }
  })

  return {
    used,
    limit,
    remaining: Math.max(0, limit - used),
    canProceed: used < limit
  }
}

/**
 * 检查每周模拟考试配额 (针对 Mock Arena)
 */
export async function checkWeeklyExamQuota(userId: string): Promise<QuotaStatus> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  })

  if (!user) {
    throw new Error('User not found')
  }

  const limit = WEEKLY_EXAM_LIMITS[user.role]

  if (limit === Infinity) {
    return { used: 0, limit, remaining: Infinity, canProceed: true }
  }

  // 获取本周一零点时间
  const now = new Date()
  const day = now.getDay() || 7 // Get current day number, converting Sun (0) to 7
  if (day !== 1 || now.getHours() !== 0 || now.getMinutes() !== 0 || now.getSeconds() !== 0) {
    now.setHours(0, 0, 0, 0);
  }
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - (day - 1));

  const used = await prisma.examRecord.count({
    where: {
      userId,
      mode: 'MOCK_EXAM',
      createdAt: { gte: weekStart }
    }
  })

  return {
    used,
    limit,
    remaining: Math.max(0, limit - used),
    canProceed: used < limit
  }
}
