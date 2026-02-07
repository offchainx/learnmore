'use server'

import prisma from '@/lib/prisma'
import dayjs from 'dayjs'
import { checkStreakStatus, calculateNewStreak } from '@/lib/gamification'

/**
 * Gamification Server Actions - Streak Management
 *
 * Handles database operations for streak tracking.
 */

/**
 * Checks and updates the user's login streak.
 * Should be called when the user performs a meaningful action (completes a lesson, logs in, etc.)
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
}
