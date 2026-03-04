import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/actions/user/auth'
import { getPracticeSubjectData } from '@/app/api/practice/_lib/subject-data'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const subjectId = request.nextUrl.searchParams.get('subjectId')
    if (!subjectId) {
      return NextResponse.json({ success: false, error: 'Missing subjectId' }, { status: 400 })
    }

    const data = await getPracticeSubjectData(user.id, subjectId)
    if (!data) {
      return NextResponse.json({ success: false, error: 'Subject not found' }, { status: 404 })
    }

    return NextResponse.json(
      { success: true, data },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } },
    )
  } catch (error) {
    console.error('Error fetching practice subject data:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
