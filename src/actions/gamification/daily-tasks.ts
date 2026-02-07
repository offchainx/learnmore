'use server'

import prisma from '@/lib/prisma'
import { DailyTaskType } from '@prisma/client'
import dayjs from 'dayjs'
import { DEFAULT_DAILY_TASKS } from '@/lib/gamification'

/**
 * Gamification Server Actions - Daily Tasks Management
 *
 * Handles database operations for daily tasks.
 */

/**
 * Ensures daily tasks exist for the user for the current day.
 */
export async function ensureDailyTasks(userId: string) {
  const today = dayjs().startOf('day').toDate()
  const tomorrow = dayjs().endOf('day').toDate()

  // Check if tasks exist for today
  const count = await prisma.dailyTask.count({
    where: {
      userId,
      date: {
        gte: today,
        lt: tomorrow,
      },
    },
  })

  if (count > 0) return

  // Create default tasks from config
  const tasks = DEFAULT_DAILY_TASKS.map((template) => ({
    userId,
    type: template.type,
    title: template.title,
    targetCount: template.targetCount,
    currentCount: template.type === DailyTaskType.LOGIN ? 1 : 0, // Auto-complete login task
    xpReward: template.xpReward,
    date: today,
  }))

  await prisma.dailyTask.createMany({
    data: tasks,
  })
}

/**
 * Updates progress for a specific task type.
 */
export async function trackDailyProgress(
  userId: string,
  type: DailyTaskType,
  amount = 1
) {
  const today = dayjs().startOf('day').toDate()
  const tomorrow = dayjs().endOf('day').toDate()

  const task = await prisma.dailyTask.findFirst({
    where: {
      userId,
      type,
      date: {
        gte: today,
        lt: tomorrow,
      },
      isClaimed: false, // Don't update claimed tasks
    },
  })

  if (task) {
    // Don't go over target
    const newCount = Math.min(task.currentCount + amount, task.targetCount)
    if (newCount !== task.currentCount) {
      await prisma.dailyTask.update({
        where: { id: task.id },
        data: { currentCount: newCount },
      })
    }
  }
}

/**
 * Get all daily tasks for the user for today
 */
export async function getTodayTasks(userId: string) {
  const today = dayjs().startOf('day').toDate()
  const tomorrow = dayjs().endOf('day').toDate()

  const tasks = await prisma.dailyTask.findMany({
    where: {
      userId,
      date: {
        gte: today,
        lt: tomorrow,
      },
    },
    orderBy: { type: 'asc' },
  })

  return tasks
}

/**
 * Claim rewards for completed tasks
 */
export async function claimTaskRewards(userId: string, taskIds: string[]) {
  // Get tasks and verify they are completable
  const tasks = await prisma.dailyTask.findMany({
    where: {
      id: { in: taskIds },
      userId,
      isClaimed: false,
    },
  })

  const completedTasks = tasks.filter((task) => task.currentCount >= task.targetCount)
  const totalXp = completedTasks.reduce((sum, task) => sum + task.xpReward, 0)

  if (completedTasks.length === 0) {
    return { success: false, message: 'No completed tasks to claim' }
  }

  // Update tasks as claimed and award XP to user
  await prisma.$transaction([
    prisma.dailyTask.updateMany({
      where: { id: { in: completedTasks.map((t) => t.id) } },
      data: { isClaimed: true },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { xp: { increment: totalXp } },
    }),
  ])

  return {
    success: true,
    xpEarned: totalXp,
    tasksClaimed: completedTasks.length,
  }
}
