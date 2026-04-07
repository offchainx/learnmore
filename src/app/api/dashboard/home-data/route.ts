import { NextResponse } from 'next/server'
import { getDashboardShellProfile } from '@/actions/user/profile'
import { getDashboardStats } from '@/actions/dashboard'

export const preferredRegion = 'sin1'
export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getDashboardShellProfile()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const data = await getDashboardStats(user, { includeDailyTasks: false })
  if (!data) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({ data })
}
