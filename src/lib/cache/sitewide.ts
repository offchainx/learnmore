import { cacheLife, cacheTag, revalidateTag } from 'next/cache'
import type { LeaderboardPeriod } from '@prisma/client'
import { getPlatformStats } from '@/actions/marketing/campaign'
import { getCategories, getPosts } from '@/actions/community/post'
import { getLeaderboard } from '@/actions/leaderboard'
import {
  getAchievementOverview,
  listUserBadges,
} from '@/actions/gamification/achievements'
import {
  buildAdminDashboardOverview,
  type AdminDashboardOverview,
} from '@/actions/admin/dashboard-overview'

export const ADMIN_DASHBOARD_OVERVIEW_TAG = 'admin-dashboard-overview'

type CommunityFeedParams = Parameters<typeof getPosts>[0]

export async function getCachedPlatformStats() {
  'use cache'
  cacheLife('standard')
  cacheTag('platform-stats')
  return getPlatformStats()
}

export async function getCachedCommunityCategories() {
  'use cache'
  cacheLife('standard')
  cacheTag('community-categories')
  return getCategories()
}

export async function getCachedCommunityFeed(params: CommunityFeedParams = {}) {
  'use cache'
  cacheLife('quick')
  cacheTag('community-feed')
  return getPosts(params)
}

export async function getCachedLeaderboardEntries(
  period: LeaderboardPeriod = 'WEEKLY',
  limit: number = 100,
) {
  'use cache'
  cacheLife('quick')
  cacheTag('leaderboard-entries')
  return getLeaderboard(period, limit)
}

export async function getCachedAchievementOverview(userId: string) {
  'use cache'
  cacheLife('quick')
  cacheTag(`achievement-overview:${userId}`)
  return getAchievementOverview(userId)
}

export async function getCachedUserBadges(userId: string) {
  'use cache'
  cacheLife('quick')
  cacheTag(`user-badges:${userId}`)
  return listUserBadges(userId)
}

export async function getCachedAdminDashboardOverview(
  window: AdminDashboardOverview['window'],
): Promise<AdminDashboardOverview> {
  'use cache'
  cacheLife('quick')
  cacheTag(ADMIN_DASHBOARD_OVERVIEW_TAG)
  return buildAdminDashboardOverview(window)
}

export function invalidateAdminDashboardOverview() {
  revalidateTag(ADMIN_DASHBOARD_OVERVIEW_TAG, 'quick')
}
