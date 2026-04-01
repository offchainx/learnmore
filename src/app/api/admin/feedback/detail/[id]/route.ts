import { NextResponse } from 'next/server'
import { getAdminFeedbackDetail } from '@/actions/support/ticket'

export const preferredRegion = 'sin1'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await getAdminFeedbackDetail(id)

    if (!result.success) {
      if (result.error?.includes('Unauthorized')) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 403 }
        )
      }

      if (result.error?.includes('Forbidden')) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 403 }
        )
      }

      if (result.error?.includes('not found')) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 404 }
        )
      }

      return NextResponse.json(
        { success: false, error: result.error || 'Failed to load feedback detail' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: true, data: result.data },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    )
  } catch (error) {
    console.error('Error fetching admin feedback detail:', error)
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
