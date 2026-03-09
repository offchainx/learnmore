import { NextRequest, NextResponse } from 'next/server'
import { getPosts } from '@/actions/community/post'
import { createClient } from '@/lib/supabase/server'

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

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

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
      { headers: { 'Cache-Control': 'private, max-age=15, stale-while-revalidate=60' } },
    )
  } catch (error) {
    console.error('Error fetching community feed:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
