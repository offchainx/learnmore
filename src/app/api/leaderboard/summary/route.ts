import { NextRequest, NextResponse } from 'next/server'
import { LeaderboardPeriod } from '@prisma/client'
import { getUserRank } from '@/actions/leaderboard'
import { getCachedLeaderboardEntries } from '@/lib/cache/sitewide'
import { resolveRequestUserId } from '@/lib/auth/request-user'

export const preferredRegion = 'sin1'

const ALLOWED_PERIODS: LeaderboardPeriod[] = ['WEEKLY', 'MONTHLY', 'ALL_TIME']

function parsePeriod(raw: string | null): LeaderboardPeriod {
  if (!raw) return 'WEEKLY'
  return ALLOWED_PERIODS.includes(raw as LeaderboardPeriod)
    ? (raw as LeaderboardPeriod)
    : 'WEEKLY'
}

function parseLimit(raw: string | null): number {
  const value = Number.parseInt(raw || '100', 10)
  if (Number.isNaN(value)) return 100
  return Math.max(1, Math.min(200, value))
}

export async function GET(request: NextRequest) {
  try {
    const userId = await resolveRequestUserId(request.headers)
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const period = parsePeriod(request.nextUrl.searchParams.get('period'))
    const limit = parseLimit(request.nextUrl.searchParams.get('limit'))

    const [entries, myRank] = await Promise.all([
      getCachedLeaderboardEntries(period, limit),
      getUserRank(userId, period),
    ])

    return NextResponse.json(
      {
        success: true,
        data: {
          period,
          entries,
          myRank,
        },
      },
      { headers: { 'Cache-Control': 'private, max-age=15, stale-while-revalidate=60' } },
    )
  } catch (error) {
    console.error('Error fetching leaderboard summary:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
