import { NextRequest, NextResponse } from 'next/server'
import {
  FeedbackOverviewWindow,
  getFeedbackOverview,
} from '@/actions/support/ticket'

export const preferredRegion = 'sin1'

function parseWindow(raw: string | null): FeedbackOverviewWindow {
  if (raw === '7D' || raw === '30D' || raw === 'ALL') return raw
  return '30D'
}

export async function GET(request: NextRequest) {
  try {
    const window = parseWindow(request.nextUrl.searchParams.get('window'))
    const result = await getFeedbackOverview(window)

    if (!result.success) {
      if (result.error?.includes('Unauthorized')) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 403 }
        )
      }

      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to load feedback overview',
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: true, data: result.data },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    )
  } catch (error) {
    console.error('Error fetching admin feedback overview:', error)
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
