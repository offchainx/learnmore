import { NextRequest, NextResponse } from 'next/server'
import { FeedbackCategory, FeedbackStatus } from '@prisma/client'
import { getFeedbackList } from '@/actions/support/ticket'

export const preferredRegion = 'sin1'

function parseStatus(raw: string | null): FeedbackStatus | undefined {
  if (!raw || raw === 'ALL') return undefined
  if (raw in FeedbackStatus)
    return FeedbackStatus[raw as keyof typeof FeedbackStatus]
  return undefined
}

function parseCategory(raw: string | null): FeedbackCategory | undefined {
  if (!raw || raw === 'ALL') return undefined
  if (raw in FeedbackCategory) {
    return FeedbackCategory[raw as keyof typeof FeedbackCategory]
  }
  return undefined
}

function parseLimit(raw: string | null): number {
  const value = Number.parseInt(raw || '20', 10)
  if (Number.isNaN(value)) return 20
  return Math.max(1, Math.min(100, value))
}

function parseOffset(raw: string | null): number {
  const value = Number.parseInt(raw || '0', 10)
  if (Number.isNaN(value)) return 0
  return Math.max(0, value)
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const result = await getFeedbackList({
      status: parseStatus(searchParams.get('status')),
      category: parseCategory(searchParams.get('category')),
      search: searchParams.get('search') || '',
      limit: parseLimit(searchParams.get('limit')),
      offset: parseOffset(searchParams.get('offset')),
    })

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
          error: result.error || 'Failed to load feedback list',
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: true, data: result.data, total: result.total || 0 },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    )
  } catch (error) {
    console.error('Error fetching admin feedback list:', error)
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
