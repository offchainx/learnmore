import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/actions/user/auth'
import { getSubjectChapters } from '@/actions/practice/data-service'

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

    const data = await getSubjectChapters(subjectId, user.id)
    if (!data) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(
      { success: true, data },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } },
    )
  } catch (error) {
    console.error('Error fetching subject chapters:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
