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
    throw new Error('Unauthorized')
  }

  try {
    const result = await completeTodayOnboardingTask(user.id, type)
    if (!result.success) {
      return { success: false, message: result.error }
    }

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Failed to complete onboarding task:', error)
    return { success: false, error: 'Database error' }
  }
}

export async function claimTaskReward(taskId: string) {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  try {
    const result = await claimDailyTaskRewardForUser(user.id, taskId)
    if (!result.success) {
      return { success: false, error: result.error }
    }

    revalidatePath('/dashboard')
    revalidateTag(`achievement-overview:${user.id}`, 'quick')
    revalidateTag(`user-badges:${user.id}`, 'quick')
    return { success: true, xpGained: result.xpGained }
  } catch (error) {
    console.error('Failed to claim reward:', error)
    return { success: false, error: 'Failed to claim reward' }
  }
}
