import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  mockGetCurrentUser,
  mockClaimDailyTaskRewardForUser,
  mockCompleteTodayOnboardingTask,
  mockRevalidatePath,
  mockRevalidateTag,
} = vi.hoisted(() => ({
  mockGetCurrentUser: vi.fn(),
  mockClaimDailyTaskRewardForUser: vi.fn(),
  mockCompleteTodayOnboardingTask: vi.fn(),
  mockRevalidatePath: vi.fn(),
  mockRevalidateTag: vi.fn(),
}))

vi.mock('@/actions/user/auth', () => ({
  getCurrentUser: mockGetCurrentUser,
}))

vi.mock('@/actions/gamification/daily-tasks', () => ({
  claimDailyTaskRewardForUser: mockClaimDailyTaskRewardForUser,
  completeTodayOnboardingTask: mockCompleteTodayOnboardingTask,
}))

vi.mock('next/cache', () => ({
  revalidatePath: mockRevalidatePath,
  revalidateTag: mockRevalidateTag,
}))

import { DailyTaskType } from '@prisma/client'
import { claimTaskReward, completeOnboardingTask } from '../gamification/achievement'

describe('gamification achievement actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetCurrentUser.mockResolvedValue({ id: 'user-1' })
    mockClaimDailyTaskRewardForUser.mockResolvedValue({
      success: true,
      xpGained: 30,
    })
    mockCompleteTodayOnboardingTask.mockResolvedValue({
      success: true,
      task: {
        id: 'task-1',
      },
    })
  })

  it('任务领奖成功后应刷新 dashboard 并失效成就页缓存', async () => {
    const result = await claimTaskReward('task-1')

    expect(result).toEqual({ success: true, xpGained: 30 })
    expect(mockClaimDailyTaskRewardForUser).toHaveBeenCalledWith(
      'user-1',
      'task-1'
    )
    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard')
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
  })

  it('未登录时应返回稳定的授权错误而不是抛异常', async () => {
    mockGetCurrentUser.mockResolvedValue(null)

    await expect(claimTaskReward('task-1')).resolves.toEqual({
      success: false,
      error: 'Unauthorized',
    })
  })

  it('缓存失效失败不应把已成功领奖标记成失败', async () => {
    mockRevalidatePath.mockImplementation(() => {
      throw new Error('no request context')
    })

    const result = await claimTaskReward('task-1')

    expect(result).toEqual({ success: true, xpGained: 30 })
    expect(mockClaimDailyTaskRewardForUser).toHaveBeenCalledWith(
      'user-1',
      'task-1'
    )
  })

  it('完成 onboarding 任务只需要刷新 dashboard', async () => {
    const result = await completeOnboardingTask(
      DailyTaskType.ONBOARDING_PROFILE
    )

    expect(result).toEqual({ success: true })
    expect(mockCompleteTodayOnboardingTask).toHaveBeenCalledWith(
      'user-1',
      DailyTaskType.ONBOARDING_PROFILE
    )
    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard')
    expect(mockRevalidateTag).not.toHaveBeenCalled()
  })

  it('未登录时应返回结构化错误而不是抛异常', async () => {
    mockGetCurrentUser.mockResolvedValue(null)

    await expect(
      claimTaskReward('task-1')
    ).resolves.toEqual({ success: false, error: 'Unauthorized' })
    await expect(
      completeOnboardingTask(DailyTaskType.ONBOARDING_PROFILE)
    ).resolves.toEqual({ success: false, error: 'Unauthorized' })

    expect(mockClaimDailyTaskRewardForUser).not.toHaveBeenCalled()
    expect(mockCompleteTodayOnboardingTask).not.toHaveBeenCalled()
    expect(mockRevalidatePath).not.toHaveBeenCalled()
    expect(mockRevalidateTag).not.toHaveBeenCalled()
  })
})
