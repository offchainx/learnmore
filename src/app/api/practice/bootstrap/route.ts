import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/actions/user/auth'
import { getPracticeBootstrapData } from '@/app/api/practice/_lib/subject-data'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const data = await getPracticeBootstrapData(user.id)
    return NextResponse.json(
      { success: true, data },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } },
    )
  } catch (error) {
    console.error('Error fetching practice bootstrap:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
