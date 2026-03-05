import { NextRequest, NextResponse } from 'next/server'
import { LeaderboardPeriod } from '@prisma/client'
import { getCurrentUser } from '@/actions/user/auth'
import { getLeaderboard, getUserRank } from '@/actions/leaderboard'

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
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const period = parsePeriod(request.nextUrl.searchParams.get('period'))
    const limit = parseLimit(request.nextUrl.searchParams.get('limit'))

    const [entries, myRank] = await Promise.all([
      getLeaderboard(period, limit),
      getUserRank(user.id, period),
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
      { headers: { 'Cache-Control': 'no-store, max-age=0' } },
    )
  } catch (error) {
    console.error('Error fetching leaderboard summary:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
