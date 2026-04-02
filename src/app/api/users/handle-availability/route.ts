import { NextRequest, NextResponse } from 'next/server'
import { getHandleAvailability } from '@/lib/users/handle-server'

export async function GET(request: NextRequest) {
  try {
    const handle = request.nextUrl.searchParams.get('handle') || ''

    if (!handle.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing handle',
        },
        { status: 400 },
      )
    }

    const result = await getHandleAvailability(handle)

    return NextResponse.json({
      success: true,
      normalizedHandle: result.normalizedHandle,
      available: result.available,
      reason: result.reason,
    })
  } catch (error) {
    console.error('[handle-availability] failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: '暂时无法检查账号标识',
      },
      { status: 500 },
    )
  }
}
