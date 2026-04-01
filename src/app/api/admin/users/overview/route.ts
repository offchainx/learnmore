import { NextRequest, NextResponse } from 'next/server'
import { Admin } from '@/types'
import { getAdminUserOverview } from '@/actions/admin/user-ops'

export const preferredRegion = 'sin1'

function parseWindow(raw: string | null): Admin.UserOverviewWindow {
  if (raw === '7D' || raw === '30D' || raw === 'ALL') return raw
  return '30D'
}

export async function GET(request: NextRequest) {
  try {
    const window = parseWindow(request.nextUrl.searchParams.get('window'))
    const result = await getAdminUserOverview(window)

    if (!result.success) {
      if (
        result.error?.includes('未登录') ||
        result.error?.includes('权限不足')
      ) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 403 }
        )
      }

      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to load user overview',
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: true, data: result.data },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    )
  } catch (error) {
    console.error('Error fetching admin user overview:', error)
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
