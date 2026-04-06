import { NextResponse } from 'next/server'
import { getDashboardCurrentUser } from '@/actions/user/auth'
import { getDashboardStats } from '@/actions/dashboard'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getDashboardCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const data = await getDashboardStats(user, {
    includeDailyTasks: false,
    includeSubjectResults: false,
    includeLeaderboard: true,
  })

  if (!data) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({ data })
}
