import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ADMIN_DASHBOARD_OVERVIEW_TAG,
  invalidateAdminDashboardOverview,
} from '../sitewide'

const mockRevalidateTag = vi.hoisted(() => vi.fn())

vi.mock('next/cache', () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
  revalidateTag: mockRevalidateTag,
}))

vi.mock('@/actions/marketing/campaign', () => ({
  getPlatformStats: vi.fn(),
}))

vi.mock('@/actions/community/post', () => ({
  getCategories: vi.fn(),
  getPosts: vi.fn(),
}))

vi.mock('@/actions/leaderboard', () => ({
  getLeaderboard: vi.fn(),
}))

vi.mock('@/actions/gamification/achievements', () => ({
  getAchievementOverview: vi.fn(),
  listUserBadges: vi.fn(),
}))

vi.mock('@/actions/admin/dashboard-overview', () => ({
  buildAdminDashboardOverview: vi.fn(),
}))

describe('sitewide cache helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('invalidates the admin dashboard overview tag with quick revalidation', () => {
    invalidateAdminDashboardOverview()

    expect(mockRevalidateTag).toHaveBeenCalledWith(
      ADMIN_DASHBOARD_OVERVIEW_TAG,
      'quick'
    )
  })
})
