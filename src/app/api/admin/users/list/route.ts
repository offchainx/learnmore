import { NextRequest, NextResponse } from 'next/server'
import { Admin } from '@/types'
import { listAdminUsers } from '@/actions/admin/user-ops'
import { createRoutePerfLogger } from '@/lib/observability/perf'

export const preferredRegion = 'sin1'

function parseSortField(raw: string | null): keyof Admin.UserSummary {
  const fallback: keyof Admin.UserSummary = 'lastActive'
  if (!raw) return fallback

  const allowed: (keyof Admin.UserSummary)[] = [
    'id',
    'name',
    'email',
    'avatarColor',
    'status',
    'tier',
    'lastActive',
    'lastActiveLabel',
    'grade',
    'school',
  ]

  return allowed.includes(raw as keyof Admin.UserSummary)
    ? (raw as keyof Admin.UserSummary)
    : fallback
}

function parseSortDirection(raw: string | null): 'asc' | 'desc' {
  return raw === 'asc' ? 'asc' : 'desc'
}

function parsePage(raw: string | null): number {
  const value = Number.parseInt(raw || '1', 10)
  if (Number.isNaN(value)) return 1
  return Math.max(1, value)
}

function parsePageSize(raw: string | null): number {
  const value = Number.parseInt(raw || '20', 10)
  if (Number.isNaN(value)) return 20
  return Math.max(1, Math.min(100, value))
}

function parseStatus(raw: string | null): Admin.UserFilterState['status'] {
  const allowed = Object.values(Admin.UserStatus)
  if (!raw || raw === 'All') return 'All'
  return allowed.includes(raw as Admin.UserStatus)
    ? (raw as Admin.UserStatus)
    : 'All'
}

function parseTier(raw: string | null): Admin.UserFilterState['tier'] {
  const allowed = Object.values(Admin.SubscriptionTier)
  if (!raw || raw === 'All') return 'All'
  return allowed.includes(raw as Admin.SubscriptionTier)
    ? (raw as Admin.SubscriptionTier)
    : 'All'
}

export async function GET(request: NextRequest) {
  const metrics = createRoutePerfLogger('/api/admin/users/list', request)
  try {
    const searchParams = request.nextUrl.searchParams

    const filters: Admin.UserFilterState = {
      search: searchParams.get('search') || '',
      status: parseStatus(searchParams.get('status')),
      tier: parseTier(searchParams.get('tier')),
    }

    const pagination: Admin.PaginationParams = {
      page: parsePage(searchParams.get('page')),
      pageSize: parsePageSize(searchParams.get('pageSize')),
      sortField: parseSortField(searchParams.get('sortField')),
      sortDirection: parseSortDirection(searchParams.get('sortDirection')),
    }

    const result = await listAdminUsers(filters, pagination)
    if (!result.success) {
      if (result.error?.includes('未登录') || result.error?.includes('权限不足')) {
        metrics.done(403, { reason: 'forbidden', page: pagination.page, pageSize: pagination.pageSize })
        return NextResponse.json({ success: false, error: result.error }, { status: 403 })
      }
      metrics.done(400, { reason: 'business_error', page: pagination.page, pageSize: pagination.pageSize })
      return NextResponse.json({ success: false, error: result.error || 'Failed to load users' }, { status: 400 })
    }

    const responseData = result.data

    metrics.done(200, {
      page: pagination.page,
      pageSize: pagination.pageSize,
      rows: responseData?.data.length ?? 0,
      total: responseData?.total ?? 0,
    })

    return NextResponse.json(
      { success: true, data: result.data },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } },
    )
  } catch (error) {
    metrics.error(error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
