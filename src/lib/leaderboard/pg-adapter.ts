import { LeaderboardAdapter, LeaderboardEntry } from "./types"
import prisma from "@/lib/prisma"
import { LeaderboardPeriod } from "@prisma/client"
import { startOfWeek, startOfMonth } from "date-fns"

const ALL_TIME_START = new Date(0)

export class PgAdapter implements LeaderboardAdapter {
  async updateScore(userId: string, points: number): Promise<void> {
    const now = new Date()
    // Define the periods to update
    // Note: We update all 3 periods for every score change
    const updates = [
      { period: LeaderboardPeriod.WEEKLY, startDate: startOfWeek(now, { weekStartsOn: 1 }) },
      { period: LeaderboardPeriod.MONTHLY, startDate: startOfMonth(now) },
      { period: LeaderboardPeriod.ALL_TIME, startDate: ALL_TIME_START },
    ]

    await prisma.$transaction(
      updates.map(({ period, startDate }) =>
        prisma.leaderboardEntry.upsert({
          where: { userId_period_weekStart: { userId, period, weekStart: startDate } },
          update: { score: { increment: points } },
          create: { userId, period, weekStart: startDate, score: points },
        })
      )
    )
  }

  async getLeaderboard(period: LeaderboardPeriod, limit: number): Promise<LeaderboardEntry[]> {
    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'WEEKLY':
        startDate = startOfWeek(now, { weekStartsOn: 1 })
        break
      case 'MONTHLY':
        startDate = startOfMonth(now)
        break
      case 'ALL_TIME':
        startDate = ALL_TIME_START
        break
      default:
        startDate = startOfWeek(now, { weekStartsOn: 1 })
    }

    const entries = await prisma.leaderboardEntry.findMany({
      where: {
        period,
        weekStart: startDate,
      },
      orderBy: {
        score: 'desc',
      },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    })

    return entries.map((entry, index) => ({
      userId: entry.userId,
      score: entry.score,
      rank: index + 1,
      username: entry.user.username,
      avatar: entry.user.avatar,
    }))
  }

  async getUserRank(userId: string, period: LeaderboardPeriod): Promise<{ rank: number; score: number } | null> {
    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'WEEKLY':
        startDate = startOfWeek(now, { weekStartsOn: 1 })
        break
      case 'MONTHLY':
        startDate = startOfMonth(now)
        break
      case 'ALL_TIME':
        startDate = ALL_TIME_START
        break
      default:
        startDate = startOfWeek(now, { weekStartsOn: 1 })
    }
    
    const userEntry = await prisma.leaderboardEntry.findUnique({
      where: {
        userId_period_weekStart: {
          userId,
          period,
          weekStart: startDate
        }
      }
    })
    
    if (!userEntry) return null

    // Count how many have higher score
    const count = await prisma.leaderboardEntry.count({
      where: {
        period,
        weekStart: startDate,
        score: { gt: userEntry.score }
      }
    })
    
    return {
      rank: count + 1,
      score: userEntry.score
    }
  }
}
