import { NextResponse } from 'next/server'
import { getPracticeBootstrapData } from '@/app/api/practice/_lib/subject-data'
import { resolveRequestUserId } from '@/lib/auth/request-user'

export const preferredRegion = 'sin1'

export async function GET() {
  try {
    const userId = await resolveRequestUserId()
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const data = await getPracticeBootstrapData(userId, { includeSubjectData: false })
    return NextResponse.json(
      { success: true, data },
      { headers: { 'Cache-Control': 'private, max-age=60, stale-while-revalidate=120' } },
    )
  } catch (error) {
    console.error('Error fetching practice bootstrap:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
