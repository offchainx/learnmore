import { LeaderboardPeriod } from "@prisma/client"

export interface LeaderboardEntry {
  userId: string
  score: number
  rank: number
  username?: string | null
  avatar?: string | null
}

export interface LeaderboardAdapter {
  updateScore(userId: string, points: number): Promise<void>
  getLeaderboard(period: LeaderboardPeriod, limit: number): Promise<LeaderboardEntry[]>
  getUserRank(userId: string, period: LeaderboardPeriod): Promise<{ rank: number; score: number } | null>
}
