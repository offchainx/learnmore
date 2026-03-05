import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/actions/user/auth'
import { getPosts } from '@/actions/community/post'

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

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const tab = request.nextUrl.searchParams.get('tab') || 'latest'
    const page = parsePage(request.nextUrl.searchParams.get('page'))
    const limit = parseLimit(request.nextUrl.searchParams.get('limit'))

    const result = await getPosts({
      unanswered: tab === 'unanswered',
      page,
      limit,
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          tab,
          ...result,
        },
      },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } },
    )
  } catch (error) {
    console.error('Error fetching community feed:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
