import { NextRequest, NextResponse } from 'next/server'
import { getKnowledgeHiveData } from '@/actions/practice/statistics'
import { resolveRequestUserId } from '@/lib/auth/request-user'

export const preferredRegion = 'sin1'

export async function GET(request: NextRequest) {
  try {
    const userId = await resolveRequestUserId(request.headers)
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const subjectId = request.nextUrl.searchParams.get('subjectId')
    if (!subjectId) {
      return NextResponse.json({ success: false, error: 'Missing subjectId' }, { status: 400 })
    }

    const data = await getKnowledgeHiveData(userId, subjectId)
    return NextResponse.json(
      { success: true, data },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } },
    )
  } catch (error) {
    console.error('Error fetching knowledge hive:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
