import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { resolveRequestUserId } from '@/lib/auth/request-user'
import { createRoutePerfLogger } from '@/lib/observability/perf'

export const preferredRegion = 'sin1'

const DEFAULT_LIMIT = 10
const MAX_LIMIT = 50

function parseLimit(raw: string | null): number {
  if (!raw) return DEFAULT_LIMIT
  const parsed = Number.parseInt(raw, 10)
  if (Number.isNaN(parsed)) return DEFAULT_LIMIT
  return Math.min(Math.max(parsed, 1), MAX_LIMIT)
}

function parseOffset(raw: string | null): number {
  if (!raw) return 0
  const parsed = Number.parseInt(raw, 10)
  if (Number.isNaN(parsed)) return 0
  return Math.max(parsed, 0)
}

export async function GET(request: NextRequest) {
  const metrics = createRoutePerfLogger('/api/notifications/summary', request)
  try {
    const userId = await resolveRequestUserId(request.headers)
    if (!userId) {
      metrics.done(401, { reason: 'unauthorized' })
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const limit = parseLimit(request.nextUrl.searchParams.get('limit'))
    const offset = parseOffset(request.nextUrl.searchParams.get('offset'))
    const onlyUnread = request.nextUrl.searchParams.get('onlyUnread') === 'true'

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: {
          userId,
          isArchived: false,
          ...(onlyUnread ? { isRead: false } : {}),
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.notification.count({
        where: {
          userId,
          isRead: false,
          isArchived: false,
        },
      }),
    ])

    metrics.done(200, {
      limit,
      offset,
      onlyUnread,
      rows: notifications.length,
      unreadCount,
    })

    return NextResponse.json(
      {
        success: true,
        data: notifications,
        unreadCount,
      },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      },
    )
  } catch (error) {
    metrics.error(error)
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
