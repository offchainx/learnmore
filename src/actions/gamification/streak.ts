'use server'

import prisma from '@/lib/prisma'
import dayjs from 'dayjs'
import { checkStreakStatus, calculateNewStreak } from '@/lib/gamification'
import { awardBadgeIfEligible } from './achievements'
import { revalidateTag } from 'next/cache'

/**
 * Gamification Server Actions - Streak Management
 *
 * Handles database operations for streak tracking.
 */

/**
 * Checks and updates the user's study streak.
 * Should be called only when the user performs a meaningful study action
 * such as completing a practice session or completing a lesson.
 */
export async function checkAndRefreshStreak(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lastStudyDate: true, streak: true },
  })

  if (!user) return

  const now = dayjs().toDate()
  const status = checkStreakStatus(user.lastStudyDate, now)

  // No update needed if same day
  if (status === 'same_day') {
    return
  }

  const newStreak = calculateNewStreak(user.streak || 0, status)

  await prisma.user.update({
    where: { id: userId },
    data: {
      lastStudyDate: now,
      streak: newStreak,
    },
  })

  try {
    revalidateTag(`achievement-overview:${userId}`, 'quick')
  } catch (error) {
    console.warn('[gamification/streak] Cache invalidation failed', {
      userId,
      error,
    })
  }
  await awardBadgeIfEligible(userId, 'STREAK')
}
