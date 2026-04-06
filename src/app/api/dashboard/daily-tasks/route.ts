import { NextResponse } from 'next/server'
import { getDashboardCurrentUser } from '@/actions/user/auth'
import { ensureDailyTasks, getTodayTasks } from '@/actions/gamification/daily-tasks'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getDashboardCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await ensureDailyTasks(user.id)
  const tasks = await getTodayTasks(user.id)

  return NextResponse.json({ tasks })
}
