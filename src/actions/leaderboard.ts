'use server'

import { PgAdapter } from '@/lib/leaderboard/pg-adapter'
import { LeaderboardPeriod } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const adapter = new PgAdapter()

// Keep this interface compatible with the frontend component
export interface LeaderboardEntryWithUser {
  score: number
  rank: number
  user: {
    id: string
    username: string | null
    avatar: string | null
  }
}

export async function updateLeaderboardScore(userId: string, points: number) {
  await adapter.updateScore(userId, points)
  // Revalidate the leaderboard page to show fresh data
  revalidatePath('/dashboard/leaderboard')
}

export async function getLeaderboard(
  period: LeaderboardPeriod = 'WEEKLY',
  limit: number = 100
): Promise<LeaderboardEntryWithUser[]> {
  const entries = await adapter.getLeaderboard(period, limit)
  
  // Transform flat structure to nested structure for frontend
  return entries.map(e => ({
    score: e.score,
    rank: e.rank,
    user: {
      id: e.userId,
      username: e.username || null,
      avatar: e.avatar || null
    }
  }))
}

export async function getUserRank(userId: string, period: LeaderboardPeriod = 'WEEKLY') {
  return adapter.getUserRank(userId, period)
}