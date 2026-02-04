'use server'

import prisma from '@/lib/prisma'
import { SubscriptionTier, UserRole } from '@prisma/client'
import { getEffectiveTier } from '@/lib/permissions/engine'

export interface QuotaStatus {
  used: number
  limit: number
  remaining: number
  canProceed: boolean
}

// 每日答题限额配置 (基于 SubscriptionTier)
const DAILY_QUESTION_LIMITS: Record<SubscriptionTier, number> = {
  STARTER: 20,
  STANDARD: 50,
  SMART_PLUS: 150,
  PREMIER: Infinity,
}

// 每周模拟考试限额配置 (基于 SubscriptionTier)
const WEEKLY_EXAM_LIMITS: Record<SubscriptionTier, number> = {
  STARTER: 1,
  STANDARD: 5,
  SMART_PLUS: 15,
  PREMIER: Infinity,
}

/**
 * 检查每日答题配额
 */
export async function checkDailyQuota(userId: string): Promise<QuotaStatus> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
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

  if (!user) {
    throw new Error('User not found')
  }

  const tier = getEffectiveTier(user)
  const limit = DAILY_QUESTION_LIMITS[tier]
  
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
 * 检查每周模拟考试配额
 */
export async function checkWeeklyExamQuota(userId: string): Promise<QuotaStatus> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
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

  if (!user) {
    throw new Error('User not found')
  }

  const tier = getEffectiveTier(user)
  const limit = WEEKLY_EXAM_LIMITS[tier]

  if (limit === Infinity) {
    return { used: 0, limit, remaining: Infinity, canProceed: true }
  }

  // 获取本周一零点时间
  const now = new Date()
  const day = now.getDay() || 7
  const weekStart = new Date(now);
  weekStart.setHours(0, 0, 0, 0);
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
