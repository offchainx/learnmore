import { NextResponse } from 'next/server'
import { getDashboardCurrentUser } from '@/actions/user/auth'
import { getDashboardStats } from '@/actions/dashboard'

export const preferredRegion = 'sin1'
export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getDashboardCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const data = await getDashboardStats(user, {
    includeDailyTasks: false,
    includeRecentPractice: false,
    includeSubjectResults: false,
    includeLeaderboard: false,
    includeOverview: true,
  })

  if (!data) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({ overviewByWindow: data.overviewByWindow })
}
