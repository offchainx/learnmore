import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { DailyTaskType } from '@prisma/client'

type MockTask = {
  id: string
  userId: string
  type: DailyTaskType
  title: string
  targetCount: number
  currentCount: number
  xpReward: number
  date: Date
  isClaimed: boolean
}

type MockBadge = {
  id: string
  code: string
  name: string
  description: string
  icon: string
  condition: string | null
  createdAt: Date
}

type MockUserBadge = {
  userId: string
  badgeId: string
  awardedAt: Date
}

type MockUserSettings = {
  studyReminderTime: string
  difficultyCalibration: number
}

type MockUser = {
  id: string
  streak: number
  xp: number
  username: string | null
  grade: number | null
  settings: MockUserSettings | null
  lastStudyDate?: Date
}

type MockNotification = {
  userId: string
  type: string
  title: string
  content: string
  metadata: Record<string, unknown>
}

const fixedNow = new Date('2026-04-09T08:00:00.000Z')

const {
  mockState,
  mockPrisma,
  mockRevalidateTag,
  mockLogPerf,
} = vi.hoisted(() => {
  const state = {
    user: {
      id: 'user-1',
      streak: 7,
      xp: 120,
      username: 'Student',
      grade: 7,
      settings: {
        studyReminderTime: '08:00',
        difficultyCalibration: 1,
      },
    } as MockUser,
    tasks: [] as MockTask[],
    badges: [] as MockBadge[],
    userBadges: [] as MockUserBadge[],
    notifications: [] as MockNotification[],
    attempts: 1,
    correctAttempts: 100,
    postCount: 5,
    commentCount: 5,
    taskSeq: 0,
  }

  const cloneTask = (task: MockTask) => ({ ...task, date: new Date(task.date) })

  const matchesDateRange = (
    taskDate: Date,
    range?: { gte?: Date; lt?: Date }
  ) => {
    if (!range) return true
    if (range.gte && taskDate < range.gte) return false
    if (range.lt && taskDate >= range.lt) return false
    return true
  }

  const matchesTaskWhere = (task: MockTask, where: Record<string, any>) => {
    if (where.userId && task.userId !== where.userId) return false
    if (where.id && task.id !== where.id) return false
    if (where.id?.in && !where.id.in.includes(task.id)) return false
    if (where.type && task.type !== where.type) return false
    if (
      where.isClaimed !== undefined &&
      task.isClaimed !== where.isClaimed
    ) {
      return false
    }
    if (!matchesDateRange(task.date, where.date)) return false
    if (where.currentCount?.lt !== undefined && !(task.currentCount < where.currentCount.lt)) {
      return false
    }
    if (where.currentCount?.gte !== undefined && !(task.currentCount >= where.currentCount.gte)) {
      return false
    }
    if (where.OR) {
      return where.OR.some((branch: Record<string, any>) =>
        matchesTaskWhere(task, { ...where, ...branch, OR: undefined })
      )
    }
    return true
  }

  const applyTaskUpdate = (task: MockTask, data: Record<string, any>) => {
    if (data.isClaimed !== undefined) {
      task.isClaimed = data.isClaimed
    }
    if (data.currentCount !== undefined) {
      task.currentCount = data.currentCount
    }
  }

  const taskTx = {
    findUnique: vi.fn(async ({ where }: { where: { id: string } }) => {
      const task = state.tasks.find((item) => item.id === where.id)
      return task ? cloneTask(task) : null
    }),
    findFirst: vi.fn(async ({ where }: { where: Record<string, any> }) => {
      const task = state.tasks.find((item) => matchesTaskWhere(item, where))
      return task ? cloneTask(task) : null
    }),
    findMany: vi.fn(async ({ where }: { where: Record<string, any> }) =>
      state.tasks.filter((task) => matchesTaskWhere(task, where)).map(cloneTask)
    ),
    createMany: vi.fn(async ({ data }: { data: Array<Omit<MockTask, 'id' | 'isClaimed'> & Partial<Pick<MockTask, 'id' | 'isClaimed'>> > }) => {
      for (const row of data) {
        const id = row.id ?? `task-${++state.taskSeq}`
        if (state.tasks.some((task) => task.id === id)) continue
        state.tasks.push({
          id,
          userId: row.userId,
          type: row.type,
          title: row.title,
          targetCount: row.targetCount,
          currentCount: row.currentCount,
          xpReward: row.xpReward,
          date: new Date(row.date),
          isClaimed: row.isClaimed ?? false,
        })
      }
      return { count: data.length }
    }),
    update: vi.fn(async ({ where, data }: { where: { id: string }; data: Record<string, any> }) => {
      const task = state.tasks.find((item) => item.id === where.id)
      if (!task) return null
      applyTaskUpdate(task, data)
      return cloneTask(task)
    }),
    updateMany: vi.fn(async ({ where, data }: { where: Record<string, any>; data: Record<string, any> }) => {
      let count = 0
      for (const task of state.tasks) {
        if (!matchesTaskWhere(task, where)) continue
        applyTaskUpdate(task, data)
        count += 1
      }
      return { count }
    }),
  }

  const userTx = {
    findUnique: vi.fn(async () => ({
      username: state.user.username,
      grade: state.user.grade,
      settings: state.user.settings,
      streak: state.user.streak,
    })),
    update: vi.fn(async ({ data }: { data: Record<string, any> }) => {
      if (data.xp?.increment) {
        state.user.xp += data.xp.increment
      }
      if (data.streak !== undefined) {
        state.user.streak = data.streak
      }
      if (data.lastStudyDate !== undefined) {
        ;(state.user as any).lastStudyDate = data.lastStudyDate
      }
      return state.user
    }),
  }

  const badgeTx = {
    createMany: vi.fn(async ({ data }: { data: Array<Record<string, any>> }) => {
      for (const row of data) {
        if (state.badges.some((badge) => badge.code === row.code)) continue
        state.badges.push({
          id: row.id ?? `badge-${row.code}`,
          code: row.code,
          name: row.name,
          description: row.description,
          icon: row.icon,
          condition: row.condition ?? null,
          createdAt: row.createdAt ?? new Date('2026-04-09T00:00:00.000Z'),
        })
      }
      return { count: data.length }
    }),
    findMany: vi.fn(async ({ where }: { where?: { code?: { in: string[] } } }) => {
      const codes = where?.code?.in
      return state.badges
        .filter((badge) => !codes || codes.includes(badge.code))
        .map((badge) => ({ id: badge.id, code: badge.code, name: badge.name }))
    }),
  }

  const userBadgeTx = {
    findMany: vi.fn(async ({ where }: { where: { userId: string; badgeId: { in: string[] } } }) =>
      state.userBadges
        .filter(
          (entry) =>
            entry.userId === where.userId &&
            where.badgeId.in.includes(entry.badgeId)
        )
        .map((entry) => ({ badgeId: entry.badgeId, awardedAt: entry.awardedAt }))
    ),
    createMany: vi.fn(async ({ data }: { data: Array<{ userId: string; badgeId: string }> }) => {
      for (const row of data) {
        if (
          state.userBadges.some(
            (entry) => entry.userId === row.userId && entry.badgeId === row.badgeId
          )
        ) {
          continue
        }
        state.userBadges.push({
          userId: row.userId,
          badgeId: row.badgeId,
          awardedAt: new Date('2026-04-09T08:00:00.000Z'),
        })
      }
      return { count: data.length }
    }),
  }

  const notificationTx = {
    createMany: vi.fn(async ({ data }: { data: MockNotification[] }) => {
      state.notifications.push(...data)
      return { count: data.length }
    }),
  }

  const prisma = {
    user: {
      ...userTx,
      findUnique: vi.fn(async ({ select }: { select?: Record<string, unknown> }) => {
        if (!state.user) return null
        if (!select) return state.user
        return {
          streak: state.user.streak,
          username: state.user.username,
          grade: state.user.grade,
          settings: state.user.settings,
          totalStudyTime: 0,
          xp: state.user.xp,
        }
      }),
    },
    dailyTask: {
      ...taskTx,
    },
    badge: {
      ...badgeTx,
    },
    userBadge: {
      ...userBadgeTx,
    },
    notification: {
      ...notificationTx,
    },
    userAttempt: {
      count: vi.fn(async ({ where }: { where: { userId: string; isCorrect?: boolean } }) =>
        where.isCorrect ? state.correctAttempts : state.attempts
      ),
    },
    post: {
      count: vi.fn(async () => state.postCount),
    },
    comment: {
      count: vi.fn(async () => state.commentCount),
    },
    $transaction: vi.fn(async (input: unknown) => {
      if (Array.isArray(input)) {
        return Promise.all(input.map((item) => Promise.resolve(item)))
      }
      if (typeof input === 'function') {
        return input({
          $executeRaw: vi.fn(async () => undefined),
          user: userTx,
          dailyTask: taskTx,
          badge: badgeTx,
          userBadge: userBadgeTx,
          notification: notificationTx,
        })
      }
      return input
    }),
  }

  return {
    mockState: state,
    mockPrisma: prisma,
    mockRevalidateTag: vi.fn(),
    mockLogPerf: vi.fn(),
  }
})

vi.mock('@/lib/prisma', () => ({
  default: mockPrisma,
}))

vi.mock('next/cache', () => ({
  revalidateTag: mockRevalidateTag,
}))

vi.mock('@/lib/perf-log', () => ({
  logPerf: mockLogPerf,
}))

import {
  awardBadgeIfEligible,
} from '../gamification/achievements'
import {
  claimDailyTaskRewardForUser,
  completeTodayOnboardingTask,
  trackDailyProgress,
} from '../gamification/daily-tasks'

describe('gamification validation replay suite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(fixedNow)

    mockState.user = {
      id: 'user-1',
      streak: 7,
      xp: 120,
      username: 'Student',
      grade: 7,
      settings: {
        studyReminderTime: '08:00',
        difficultyCalibration: 1,
      },
    }
    mockState.tasks = []
    mockState.badges = []
    mockState.userBadges = []
    mockState.notifications = []
    mockState.attempts = 1
    mockState.correctAttempts = 100
    mockState.postCount = 5
    mockState.commentCount = 5
    mockState.taskSeq = 0
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('重复领奖同一日任务时只会成功一次，第二次直接返回 already claimed', async () => {
    mockState.tasks.push({
      id: 'task-claim-1',
      userId: 'user-1',
      type: DailyTaskType.QUIZ_SCORE,
      title: '完成 1 次测验',
      targetCount: 1,
      currentCount: 1,
      xpReward: 80,
      date: fixedNow,
      isClaimed: false,
    })

    const first = await claimDailyTaskRewardForUser('user-1', 'task-claim-1')
    const second = await claimDailyTaskRewardForUser('user-1', 'task-claim-1')

    expect(first).toEqual({ success: true, xpGained: 80 })
    expect(second).toEqual({ success: false, error: 'Reward already claimed' })
    expect(mockState.user.xp).toBe(200)
    expect(mockPrisma.user.update).toHaveBeenCalledTimes(1)
  })

  it('onboarding 任务推进重复提交时只会推进一次，第二次保持完成态', async () => {
    mockState.user.username = null
    mockState.user.grade = null
    mockState.user.settings = null

    const first = await completeTodayOnboardingTask(
      'user-1',
      DailyTaskType.ONBOARDING_PROFILE
    )
    const second = await completeTodayOnboardingTask(
      'user-1',
      DailyTaskType.ONBOARDING_PROFILE
    )

    expect(first.success).toBe(true)
    expect(second.success).toBe(true)

    const profileTask = mockState.tasks.find(
      (task) => task.type === DailyTaskType.ONBOARDING_PROFILE
    )

    expect(profileTask?.currentCount).toBe(profileTask?.targetCount)
    expect(mockPrisma.dailyTask.updateMany).toHaveBeenCalledTimes(1)
  })

  it('进度回放不会把任务推进到 target 之外', async () => {
    const first = await trackDailyProgress(
      'user-1',
      DailyTaskType.QUIZ_SCORE
    )
    const second = await trackDailyProgress(
      'user-1',
      DailyTaskType.QUIZ_SCORE
    )

    expect(first).toBeUndefined()
    expect(second).toBeUndefined()

    const quizTask = mockState.tasks.find(
      (task) => task.type === DailyTaskType.QUIZ_SCORE
    )

    expect(quizTask?.currentCount).toBe(quizTask?.targetCount)
    expect(mockPrisma.dailyTask.update).toHaveBeenCalledTimes(1)
  })

  it('徽章发放回放只会创建一次 user_badges / notifications，并且第二次不再回收缓存', async () => {
    const first = await awardBadgeIfEligible('user-1', 'PRACTICE')
    const second = await awardBadgeIfEligible('user-1', 'PRACTICE')

    expect(first.awardedCodes).toEqual([
      'first_practice',
      'practice_master_100',
      'streak_7_days',
      'community_helper_10',
    ])
    expect(second.awardedCodes).toEqual([])
    expect(mockState.userBadges).toHaveLength(4)
    expect(mockState.notifications).toHaveLength(4)
    expect(mockRevalidateTag).toHaveBeenCalledTimes(2)
    expect(mockRevalidateTag).toHaveBeenNthCalledWith(
      1,
      'achievement-overview:user-1',
      'quick'
    )
    expect(mockRevalidateTag).toHaveBeenNthCalledWith(
      2,
      'user-badges:user-1',
      'quick'
    )
    expect(mockPrisma.notification.createMany).toHaveBeenCalledTimes(1)
  })
})
