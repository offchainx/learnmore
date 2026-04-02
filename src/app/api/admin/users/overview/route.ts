import { NextRequest, NextResponse } from 'next/server'
import { Admin } from '@/types'
import { getAdminUserOverview } from '@/actions/admin/user-ops'
import { createRoutePerfLogger } from '@/lib/observability/perf'

export const preferredRegion = 'sin1'

function parseWindow(raw: string | null): Admin.UserOverviewWindow {
  if (raw === '7D' || raw === '30D' || raw === 'ALL') return raw
  return '30D'
}

export async function GET(request: NextRequest) {
  const metrics = createRoutePerfLogger('/api/admin/users/overview', request)
  try {
    const window = parseWindow(request.nextUrl.searchParams.get('window'))
    const result = await getAdminUserOverview(window)

    if (!result.success) {
      if (
        result.error?.includes('未登录') ||
        result.error?.includes('权限不足')
      ) {
        metrics.done(403, { window, reason: 'forbidden' })
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 403 }
        )
      }

      metrics.done(400, { window, reason: 'business_error' })
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to load user overview',
        },
        { status: 400 }
      )
    }

    metrics.done(200, {
      window,
      metricCount: result.data?.metrics.length ?? 0,
      lastUpdated: result.data?.lastUpdated,
    })

    return NextResponse.json(
      { success: true, data: result.data },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    )
  } catch (error) {
    metrics.error(error)
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
