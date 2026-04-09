import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  mockFindUnique,
  mockUpdate,
  mockCheckStreakStatus,
  mockCalculateNewStreak,
  mockAwardBadgeIfEligible,
  mockRevalidateTag,
} = vi.hoisted(() => ({
  mockFindUnique: vi.fn(),
  mockUpdate: vi.fn(),
  mockCheckStreakStatus: vi.fn(),
  mockCalculateNewStreak: vi.fn(),
  mockAwardBadgeIfEligible: vi.fn(),
  mockRevalidateTag: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  default: {
    user: {
      findUnique: mockFindUnique,
      update: mockUpdate,
    },
  },
}))

vi.mock('@/lib/gamification', () => ({
  checkStreakStatus: mockCheckStreakStatus,
  calculateNewStreak: mockCalculateNewStreak,
}))

vi.mock('@/actions/gamification/achievements', () => ({
  awardBadgeIfEligible: mockAwardBadgeIfEligible,
}))

vi.mock('next/cache', () => ({
  revalidateTag: mockRevalidateTag,
}))

import { checkAndRefreshStreak } from '../gamification/streak'

describe('checkAndRefreshStreak', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFindUnique.mockResolvedValue({
      lastStudyDate: new Date('2026-04-07T00:00:00.000Z'),
      streak: 3,
    })
    mockCheckStreakStatus.mockReturnValue('missed_day')
    mockCalculateNewStreak.mockReturnValue(1)
    mockAwardBadgeIfEligible.mockResolvedValue({ awardedCodes: [] })
  })

  it('更新 streak 后应刷新成就概览缓存并继续走徽章发放链路', async () => {
    await checkAndRefreshStreak('user-1')

    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      select: { lastStudyDate: true, streak: true },
    })
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: {
        lastStudyDate: expect.any(Date),
        streak: 1,
      },
    })
    expect(mockRevalidateTag).toHaveBeenCalledWith(
      'achievement-overview:user-1',
      'quick'
    )
    expect(mockAwardBadgeIfEligible).toHaveBeenCalledWith('user-1', 'STREAK')
  })

  it('same_day 时不应触发写入或缓存回收', async () => {
    mockCheckStreakStatus.mockReturnValueOnce('same_day')

    await checkAndRefreshStreak('user-1')

    expect(mockUpdate).not.toHaveBeenCalled()
    expect(mockRevalidateTag).not.toHaveBeenCalled()
    expect(mockAwardBadgeIfEligible).not.toHaveBeenCalled()
  })
})
