import { NextRequest, NextResponse } from 'next/server'
import { getSubjectChapters } from '@/actions/practice/data-service'
import { resolveRequestUserId } from '@/lib/auth/request-user'
import { createRoutePerfLogger } from '@/lib/observability/perf'

export const preferredRegion = 'sin1'

export async function GET(request: NextRequest) {
  const metrics = createRoutePerfLogger('/api/practice/subject-chapters', request)
  try {
    const userId = await resolveRequestUserId(request.headers)
    if (!userId) {
      metrics.done(401, { reason: 'unauthorized' })
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const subjectId = request.nextUrl.searchParams.get('subjectId')
    if (!subjectId) {
      return NextResponse.json({ success: false, error: 'Missing subjectId' }, { status: 400 })
    }

    const data = await getSubjectChapters(subjectId, userId)
    if (!data) {
      metrics.done(404, { subjectId })
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }

    metrics.done(200, {
      subjectId,
      chapters: data.chapters?.length ?? 0,
    })

    return NextResponse.json(
      { success: true, data },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } },
    )
  } catch (error) {
    metrics.error(error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
