import { NextRequest, NextResponse } from 'next/server'
import { getPastPapersBySubject } from '@/actions/practice/past-papers'
import { resolveRequestUserId } from '@/lib/auth/request-user'

export const preferredRegion = 'sin1'

export async function GET(request: NextRequest) {
  try {
    const userId = await resolveRequestUserId(request.headers)
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const subjectId = request.nextUrl.searchParams.get('subjectId')
    const limit = Number.parseInt(request.nextUrl.searchParams.get('limit') || '12', 10)

    if (!subjectId) {
      return NextResponse.json({ success: false, error: 'Missing subjectId' }, { status: 400 })
    }

    const result = await getPastPapersBySubject(subjectId, Number.isNaN(limit) ? 12 : limit)
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to fetch past papers' },
        { status: 500 },
      )
    }

    return NextResponse.json(
      { success: true, data: result.data || [] },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } },
    )
  } catch (error) {
    console.error('Error fetching past papers:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
