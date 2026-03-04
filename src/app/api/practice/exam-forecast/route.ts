import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/actions/user/auth'
import { getExamForecastData } from '@/actions/practice/statistics'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const subjectId = request.nextUrl.searchParams.get('subjectId') || undefined
    const data = await getExamForecastData(user.id, subjectId)
    if (!data) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(
      { success: true, data },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } },
    )
  } catch (error) {
    console.error('Error fetching exam forecast:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
