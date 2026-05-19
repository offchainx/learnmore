import { NextRequest, NextResponse } from 'next/server'
import { getPracticeSubjectData } from '@/app/api/practice/_lib/subject-data'
import { resolveRequestUserId } from '@/lib/auth/request-user'
import { createRoutePerfLogger } from '@/lib/observability/perf'

export const preferredRegion = 'sin1'

export async function GET(request: NextRequest) {
  const metrics = createRoutePerfLogger('/api/practice/subject-data', request)
  try {
    const userId = await resolveRequestUserId(request.headers)
    if (!userId) {
      metrics.done(401, { reason: 'unauthorized' })
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const subjectId = request.nextUrl.searchParams.get('subjectId')
    if (!subjectId) {
      metrics.done(400, { reason: 'missing_subjectId' })
      return NextResponse.json({ success: false, error: 'Missing subjectId' }, { status: 400 })
    }

    const data = await getPracticeSubjectData(userId, subjectId)
    if (!data) {
      metrics.done(404, { subjectId })
      return NextResponse.json({ success: false, error: 'Subject not found' }, { status: 404 })
    }

    metrics.done(200, {
      subjectId,
      chapters: data.chapters?.length ?? 0,
      pastPapers: data.pastPapers?.length ?? 0,
    })

    return NextResponse.json(
      { success: true, data },
      { headers: { 'Cache-Control': 'private, max-age=15, stale-while-revalidate=60' } },
    )
  } catch (error) {
    metrics.error(error)
    console.error('Error fetching practice subject data:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
