'use server'

import { getCurrentUser } from '@/actions/user/auth'
import {
  claimDailyTaskRewardForUser,
  completeTodayOnboardingTask,
} from '@/actions/gamification/daily-tasks'
import { revalidatePath, revalidateTag } from 'next/cache'
import { DailyTaskType } from '@prisma/client'

export async function completeOnboardingTask(type: DailyTaskType) {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    const result = await completeTodayOnboardingTask(user.id, type)
    if (!result.success) {
      return { success: false, message: result.error }
    }

    try {
      revalidatePath('/dashboard')
    } catch (error) {
      console.warn('[Achievement] Dashboard refresh skipped outside request context:', error)
    }
    return { success: true }
  } catch (error) {
    console.error('Failed to complete onboarding task:', error)
    return { success: false, error: 'Database error' }
  }
}

export async function claimTaskReward(taskId: string) {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    const result = await claimDailyTaskRewardForUser(user.id, taskId)
    if (!result.success) {
      return { success: false, error: result.error }
    }

    try {
      revalidatePath('/dashboard')
      revalidateTag(`achievement-overview:${user.id}`, 'quick')
      revalidateTag(`user-badges:${user.id}`, 'quick')
    } catch (error) {
      console.warn('[Achievement] Cache invalidation skipped outside request context:', error)
    }
    return { success: true, xpGained: result.xpGained }
  } catch (error) {
    console.error('Failed to claim reward:', error)
    return { success: false, error: 'Failed to claim reward' }
  }
}
