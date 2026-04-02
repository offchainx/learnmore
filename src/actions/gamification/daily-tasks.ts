'use server'

import prisma from '@/lib/prisma'
import { DailyTaskType, Prisma } from '@prisma/client'
import dayjs from 'dayjs'
import { DEFAULT_DAILY_TASKS, ONBOARDING_TASK_TEMPLATES } from '@/lib/gamification'

const ONBOARDING_TASK_TYPES = new Set<DailyTaskType>([
  DailyTaskType.ONBOARDING_PROFILE,
  DailyTaskType.ONBOARDING_GOALS,
  DailyTaskType.ONBOARDING_ASSESSMENT,
])

function getTodayRange() {
  const start = dayjs().startOf('day').toDate()
  const end = dayjs().startOf('day').add(1, 'day').toDate()

  return { start, end }
}

async function withDailyTaskLock<T>(
  userId: string,
  callback: (
    tx: Prisma.TransactionClient,
    range: ReturnType<typeof getTodayRange>
  ) => Promise<T>
) {
  const range = getTodayRange()
  const lockKey = `daily_tasks:${userId}:${dayjs(range.start).format('YYYY-MM-DD')}`

  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey}))`
    return callback(tx, range)
  })
}

function isProfileTaskNeeded(user: {
  username: string | null
  grade: number | null
}) {
  return !user.username || user.grade === null
}

function isGoalsTaskNeeded(settings: {
  studyReminderTime: string | null
} | null) {
  return !settings?.studyReminderTime
}

function isAssessmentTaskNeeded(
  settings: {
    difficultyCalibration: number | null
  } | null,
  hasCompletedAssessmentTask: boolean
) {
  return settings?.difficultyCalibration == null && !hasCompletedAssessmentTask
}

function isOnboardingTaskType(type: DailyTaskType) {
  return ONBOARDING_TASK_TYPES.has(type)
}

function buildTaskRows(
  userId: string,
  date: Date,
  existingTypes: Set<DailyTaskType>,
  onboardingNeeded: Map<DailyTaskType, boolean>
) {
  const dailyRows = DEFAULT_DAILY_TASKS.filter(
    (template) => !existingTypes.has(template.type)
  ).map((template) => ({
    userId,
    type: template.type,
    title: template.title,
    targetCount: template.targetCount,
    currentCount: template.type === DailyTaskType.LOGIN ? 1 : 0,
    xpReward: template.xpReward,
    date,
  }))

  const onboardingRows = ONBOARDING_TASK_TEMPLATES.filter(
    (template) =>
      onboardingNeeded.get(template.type) === true &&
      !existingTypes.has(template.type)
  ).map((template) => ({
    userId,
    type: template.type,
    title: template.title,
    targetCount: template.targetCount,
    currentCount: 0,
    xpReward: template.xpReward,
    date,
  }))

  return [...dailyRows, ...onboardingRows]
}

function getOnboardingRequirementState(user: {
  username: string | null
  grade: number | null
  settings: {
    studyReminderTime: string | null
    difficultyCalibration: number | null
  } | null
}, hasCompletedAssessmentTask: boolean) {
  return new Map<DailyTaskType, boolean>([
    [DailyTaskType.ONBOARDING_PROFILE, isProfileTaskNeeded(user)],
    [DailyTaskType.ONBOARDING_GOALS, isGoalsTaskNeeded(user.settings)],
    [
      DailyTaskType.ONBOARDING_ASSESSMENT,
      isAssessmentTaskNeeded(user.settings, hasCompletedAssessmentTask),
    ],
  ])
}

/**
 * Ensures dashboard task rows exist for the current day and reconciles
 * onboarding task completion with the latest user profile/settings state.
 */
export async function ensureDailyTasks(userId: string) {
  await withDailyTaskLock(userId, async (tx, { start, end }) => {
    const [user, completedAssessmentTask, existingTasks] = await Promise.all([
      tx.user.findUnique({
        where: { id: userId },
        select: {
          username: true,
          grade: true,
          settings: {
            select: {
              studyReminderTime: true,
              difficultyCalibration: true,
            },
          },
        },
      }),
      tx.dailyTask.findFirst({
        where: {
          userId,
          type: DailyTaskType.ONBOARDING_ASSESSMENT,
          OR: [{ currentCount: { gte: 1 } }, { isClaimed: true }],
        },
        select: { id: true },
      }),
      tx.dailyTask.findMany({
        where: {
          userId,
          date: {
            gte: start,
            lt: end,
          },
        },
      }),
    ])

    if (!user) return

    const onboardingNeeded = getOnboardingRequirementState(
      user,
      Boolean(completedAssessmentTask)
    )
    const existingTypes = new Set(existingTasks.map((task) => task.type))
    const rowsToCreate = buildTaskRows(
      userId,
      start,
      existingTypes,
      onboardingNeeded
    )
    const tasksToComplete = existingTasks.filter(
      (task) =>
        isOnboardingTaskType(task.type) &&
        !task.isClaimed &&
        task.currentCount < task.targetCount &&
        onboardingNeeded.get(task.type) === false
    )

    if (rowsToCreate.length > 0) {
      await tx.dailyTask.createMany({
        data: rowsToCreate,
      })
    }

    for (const task of tasksToComplete) {
      await tx.dailyTask.update({
        where: { id: task.id },
        data: { currentCount: task.targetCount },
      })
    }
  })
}

export async function completeTodayOnboardingTask(userId: string, type: DailyTaskType) {
  if (!isOnboardingTaskType(type)) {
    return { success: false, error: 'Unsupported task type' }
  }

  await ensureDailyTasks(userId)

  return withDailyTaskLock(userId, async (tx, { start, end }) => {
    const task = await tx.dailyTask.findFirst({
      where: {
        userId,
        type,
        date: {
          gte: start,
          lt: end,
        },
        isClaimed: false,
      },
    })

    if (!task) {
      return { success: false, error: 'Task not found' }
    }

    if (task.currentCount >= task.targetCount) {
      return { success: true, task }
    }

    const completionResult = await tx.dailyTask.updateMany({
      where: {
        id: task.id,
        userId,
        isClaimed: false,
        currentCount: {
          lt: task.targetCount,
        },
      },
      data: { currentCount: task.targetCount },
    })

    if (completionResult.count !== 1) {
      const latestTask = await tx.dailyTask.findUnique({
        where: { id: task.id },
      })
      if (latestTask && latestTask.currentCount >= latestTask.targetCount) {
        return { success: true, task: latestTask }
      }
      return { success: false, error: 'Task completion failed' }
    }

    const updatedTask = await tx.dailyTask.findUnique({
      where: { id: task.id },
    })

    return updatedTask
      ? { success: true, task: updatedTask }
      : { success: false, error: 'Task not found' }
  })
}

export async function claimDailyTaskRewardForUser(userId: string, taskId: string) {
  return prisma.$transaction(async (tx) => {
    const task = await tx.dailyTask.findUnique({
      where: { id: taskId },
    })

    if (!task) {
      return { success: false, error: 'Task not found' }
    }

    if (task.userId !== userId) {
      return { success: false, error: 'Unauthorized' }
    }

    if (task.currentCount < task.targetCount) {
      return { success: false, error: 'Task not completed' }
    }

    const claimResult = await tx.dailyTask.updateMany({
      where: {
        id: taskId,
        userId,
        isClaimed: false,
        currentCount: {
          gte: task.targetCount,
        },
      },
      data: { isClaimed: true },
    })

    if (claimResult.count !== 1) {
      return { success: false, error: 'Reward already claimed' }
    }

    await tx.user.update({
      where: { id: userId },
      data: { xp: { increment: task.xpReward } },
    })

    return { success: true, xpGained: task.xpReward }
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
  await ensureDailyTasks(userId)

  await withDailyTaskLock(userId, async (tx, { start, end }) => {
    const task = await tx.dailyTask.findFirst({
      where: {
        userId,
        type,
        date: {
          gte: start,
          lt: end,
        },
        isClaimed: false,
      },
    })

    if (!task) return

    const newCount = Math.min(task.currentCount + amount, task.targetCount)
    if (newCount === task.currentCount) return

    await tx.dailyTask.update({
      where: { id: task.id },
      data: { currentCount: newCount },
    })
  })
}

/**
 * Get all daily tasks for the user for today.
 */
export async function getTodayTasks(userId: string) {
  const { start, end } = getTodayRange()

  const tasks = await prisma.dailyTask.findMany({
    where: {
      userId,
      date: {
        gte: start,
        lt: end,
      },
    },
    orderBy: { type: 'asc' },
  })

  return tasks
}

/**
 * Claim rewards for completed tasks.
 */
export async function claimTaskRewards(userId: string, taskIds: string[]) {
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

  await prisma.$transaction([
    prisma.dailyTask.updateMany({
      where: { id: { in: completedTasks.map((task) => task.id) } },
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
