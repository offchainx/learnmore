import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  mockAwardBadgeIfEligible,
  mockCheckAndRefreshStreak,
  mockEnsureDailyTasks,
  mockIncrementTotalStudyTime,
  mockRevalidateTag,
  mockTrackDailyProgress,
  mockUpdateLeaderboardScore,
} = vi.hoisted(() => ({
  mockAwardBadgeIfEligible: vi.fn(),
  mockCheckAndRefreshStreak: vi.fn(),
  mockEnsureDailyTasks: vi.fn(),
  mockIncrementTotalStudyTime: vi.fn(),
  mockRevalidateTag: vi.fn(),
  mockTrackDailyProgress: vi.fn(),
  mockUpdateLeaderboardScore: vi.fn(),
}))

vi.mock('@/actions/gamification/achievements', () => ({
  awardBadgeIfEligible: mockAwardBadgeIfEligible,
}))

vi.mock('@/actions/gamification/daily-tasks', () => ({
  ensureDailyTasks: mockEnsureDailyTasks,
  trackDailyProgress: mockTrackDailyProgress,
}))

vi.mock('@/actions/gamification/streak', () => ({
  checkAndRefreshStreak: mockCheckAndRefreshStreak,
}))

vi.mock('@/actions/leaderboard', () => ({
  updateLeaderboardScore: mockUpdateLeaderboardScore,
}))

vi.mock('@/actions/user/study-metrics', () => ({
  incrementTotalStudyTime: mockIncrementTotalStudyTime,
}))

vi.mock('next/cache', () => ({
  revalidateTag: mockRevalidateTag,
}))

import { PracticeMode } from '@prisma/client'
import { applyPracticeSubmissionEffects } from '../submission-effects'

describe('applyPracticeSubmissionEffects', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEnsureDailyTasks.mockResolvedValue(undefined)
    mockCheckAndRefreshStreak.mockResolvedValue(undefined)
    mockAwardBadgeIfEligible.mockResolvedValue({ awardedCodes: [] })
    mockIncrementTotalStudyTime.mockResolvedValue(undefined)
    mockUpdateLeaderboardScore.mockResolvedValue(undefined)
    mockTrackDailyProgress.mockResolvedValue(undefined)
  })

  it('侧边副作用失败时不应让主提交失败', async () => {
    mockCheckAndRefreshStreak.mockRejectedValueOnce(new Error('streak failed'))

    await expect(
      applyPracticeSubmissionEffects({
        userId: 'user-1',
        mode: PracticeMode.SMART_DRILL,
        correctCount: 2,
        duration: 120,
      })
    ).resolves.toBeUndefined()

    expect(mockEnsureDailyTasks).toHaveBeenCalledWith('user-1')
    expect(mockUpdateLeaderboardScore).toHaveBeenCalledWith('user-1', 20)
    expect(mockTrackDailyProgress).toHaveBeenCalledWith(
      'user-1',
      expect.any(String)
    )
    expect(mockRevalidateTag).toHaveBeenCalledWith(
      'achievement-overview:user-1',
      'quick'
    )
  })

  it('缓存失效失败时也不应让主提交失败', async () => {
    mockRevalidateTag.mockImplementationOnce(() => {
      throw new Error('cache failed')
    })

    await expect(
      applyPracticeSubmissionEffects({
        userId: 'user-2',
        mode: PracticeMode.PAST_PAPER,
        correctCount: 0,
        duration: null,
      })
    ).resolves.toBeUndefined()

    expect(mockEnsureDailyTasks).toHaveBeenCalledWith('user-2')
    expect(mockTrackDailyProgress).toHaveBeenCalledWith(
      'user-2',
      expect.any(String)
    )
  })
})
