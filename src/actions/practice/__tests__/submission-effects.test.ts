import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PracticeMode, DailyTaskType } from '@prisma/client'

const {
  mockEnsureDailyTasks,
  mockCheckAndRefreshStreak,
  mockAwardBadgeIfEligible,
  mockIncrementTotalStudyTime,
  mockTrackDailyProgress,
  mockUpdateLeaderboardScore,
  mockRevalidateTag,
} = vi.hoisted(() => ({
  mockEnsureDailyTasks: vi.fn(),
  mockCheckAndRefreshStreak: vi.fn(),
  mockAwardBadgeIfEligible: vi.fn(),
  mockIncrementTotalStudyTime: vi.fn(),
  mockTrackDailyProgress: vi.fn(),
  mockUpdateLeaderboardScore: vi.fn(),
  mockRevalidateTag: vi.fn(),
}))

vi.mock('@/actions/gamification/daily-tasks', () => ({
  ensureDailyTasks: mockEnsureDailyTasks,
  trackDailyProgress: mockTrackDailyProgress,
}))

vi.mock('@/actions/gamification/streak', () => ({
  checkAndRefreshStreak: mockCheckAndRefreshStreak,
}))

vi.mock('@/actions/gamification/achievements', () => ({
  awardBadgeIfEligible: mockAwardBadgeIfEligible,
}))

vi.mock('@/actions/user/study-metrics', () => ({
  incrementTotalStudyTime: mockIncrementTotalStudyTime,
}))

vi.mock('@/actions/leaderboard', () => ({
  updateLeaderboardScore: mockUpdateLeaderboardScore,
}))

vi.mock('next/cache', () => ({
  revalidateTag: mockRevalidateTag,
}))

import { applyPracticeSubmissionEffects } from '../submission-effects'

describe('applyPracticeSubmissionEffects', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEnsureDailyTasks.mockResolvedValue(undefined)
    mockCheckAndRefreshStreak.mockResolvedValue(undefined)
    mockAwardBadgeIfEligible.mockResolvedValue({ awardedCodes: [] })
    mockIncrementTotalStudyTime.mockResolvedValue(180)
    mockTrackDailyProgress.mockResolvedValue(undefined)
    mockUpdateLeaderboardScore.mockResolvedValue({ success: true })
  })

  it('在副作用失败或非请求上下文缓存失效时仍应让提交主流程成功完成', async () => {
    mockAwardBadgeIfEligible.mockRejectedValueOnce(new Error('badge failed'))
    mockRevalidateTag.mockImplementation(() => {
      throw new Error('no request context')
    })

    await expect(
      applyPracticeSubmissionEffects({
        userId: 'user-1',
        mode: PracticeMode.PAST_PAPER,
        correctCount: 2,
        duration: 180,
      })
    ).resolves.toBeUndefined()

    expect(mockEnsureDailyTasks).toHaveBeenCalledWith('user-1')
    expect(mockTrackDailyProgress).toHaveBeenCalledWith(
      'user-1',
      DailyTaskType.QUIZ_SCORE
    )
    expect(mockCheckAndRefreshStreak).toHaveBeenCalledWith('user-1')
    expect(mockIncrementTotalStudyTime).toHaveBeenCalledWith('user-1', 180)
  })
})
