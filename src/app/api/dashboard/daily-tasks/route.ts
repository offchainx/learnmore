import { NextResponse } from 'next/server'
import { getDashboardCurrentUser } from '@/actions/user/auth'
import { ensureDailyTasks, getTodayTasks } from '@/actions/gamification/daily-tasks'

export const preferredRegion = 'sin1'
export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getDashboardCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await ensureDailyTasks(user.id)
  } catch (error) {
    console.warn('[DailyTasks] ensureDailyTasks failed; serving existing tasks only:', error)
  }
  const tasks = await getTodayTasks(user.id)

  return NextResponse.json({ tasks })
}
