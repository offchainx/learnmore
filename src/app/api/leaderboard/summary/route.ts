import { NextRequest, NextResponse } from 'next/server'
import { LeaderboardPeriod } from '@prisma/client'
import { getLeaderboard, getUserRank } from '@/actions/leaderboard'
import { resolveRequestUserId } from '@/lib/auth/request-user'
import { createRoutePerfLogger } from '@/lib/observability/perf'

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
  const metrics = createRoutePerfLogger('/api/leaderboard/summary', request)
  try {
    const userId = await resolveRequestUserId(request.headers)
    if (!userId) {
      metrics.done(401, { reason: 'unauthorized' })
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const period = parsePeriod(request.nextUrl.searchParams.get('period'))
    const limit = parseLimit(request.nextUrl.searchParams.get('limit'))

    const [entries, myRank] = await Promise.all([
      getLeaderboard(period, limit),
      getUserRank(userId, period),
    ])

    metrics.done(200, {
      period,
      limit,
      entries: entries.length,
      hasRank: Boolean(myRank),
    })

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
    metrics.error(error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
