import { NextRequest, NextResponse } from 'next/server'
import { getCachedCommunityFeed } from '@/lib/cache/sitewide'
import { createRoutePerfLogger } from '@/lib/observability/perf'
import { getDashboardShellProfile } from '@/actions/user/profile'

export const preferredRegion = 'sin1'

function parsePage(raw: string | null): number {
  const value = Number.parseInt(raw || '1', 10)
  if (Number.isNaN(value)) return 1
  return Math.max(1, value)
}

function parseLimit(raw: string | null): number {
  const value = Number.parseInt(raw || '20', 10)
  if (Number.isNaN(value)) return 20
  return Math.max(1, Math.min(50, value))
}

function parseSort(raw: string | null): 'recent-posts' | 'recent-replies' | 'most-comments' {
  if (raw === 'recent-replies' || raw === 'most-comments') return raw
  return 'recent-posts'
}

export async function GET(request: NextRequest) {
  const metrics = createRoutePerfLogger('/api/community/feed', request)
  try {
    const profile = await getDashboardShellProfile()
    if (!profile) {
      metrics.done(401, { reason: 'unauthorized' })
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const tab = request.nextUrl.searchParams.get('tab') || 'latest'
    const subjectId = request.nextUrl.searchParams.get('subjectId')
    const category = request.nextUrl.searchParams.get('category')
    const search = request.nextUrl.searchParams.get('search') || undefined
    const sort = parseSort(request.nextUrl.searchParams.get('sort'))
    const page = parsePage(request.nextUrl.searchParams.get('page'))
    const limit = parseLimit(request.nextUrl.searchParams.get('limit'))

    const result = await getCachedCommunityFeed({
      subjectId: subjectId || undefined,
      category: category || undefined,
      search,
      unanswered: tab === 'unanswered',
      page,
      limit,
      sort,
      viewerUserId: profile.id,
      viewerRole: profile.role,
    })

    metrics.done(200, {
      tab,
      subjectId,
      category,
      search,
      sort,
      page,
      limit,
      posts: result.posts?.length ?? 0,
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          tab,
          ...result,
        },
      },
      { headers: { 'Cache-Control': 'private, max-age=15, stale-while-revalidate=60' } },
    )
  } catch (error) {
    metrics.error(error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
