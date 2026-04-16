import { redirect } from 'next/navigation'
import { getProfile } from '@/actions/user/profile'
import { AdminClientWrapper } from '@/components/admin/common'
import { FeedbackList } from '@/components/admin/feedback/FeedbackList'
import { getFeedbackList, getFeedbackOverview } from '@/actions/support/ticket'
import { FeedbackCategory, FeedbackStatus } from '@prisma/client'

const PAGE_SIZE = 20
const PAGE_SIZE_OPTIONS = [10, 20, 50] as const

function parsePage(raw: string | string[] | undefined) {
  const value = Array.isArray(raw) ? raw[0] : raw
  const page = Number.parseInt(value || '1', 10)
  if (Number.isNaN(page)) return 1
  return Math.max(1, page)
}

function parsePageSize(raw: string | string[] | undefined) {
  const value = Array.isArray(raw) ? raw[0] : raw
  const size = Number.parseInt(value || String(PAGE_SIZE), 10)
  if (!Number.isFinite(size) || size <= 0) return PAGE_SIZE
  return PAGE_SIZE_OPTIONS.includes(size as (typeof PAGE_SIZE_OPTIONS)[number])
    ? size
    : PAGE_SIZE
}

function parseStatus(raw: string | string[] | undefined) {
  const value = Array.isArray(raw) ? raw[0] : raw
  if (!value || value === 'ALL') return undefined
  if (value in FeedbackStatus) {
    return FeedbackStatus[value as keyof typeof FeedbackStatus]
  }
  return undefined
}

function parseCategory(raw: string | string[] | undefined) {
  const value = Array.isArray(raw) ? raw[0] : raw
  if (!value || value === 'ALL') return undefined
  if (value in FeedbackCategory) {
    return FeedbackCategory[value as keyof typeof FeedbackCategory]
  }
  return undefined
}

export default async function AdminFeedbackPage({
  searchParams,
}: {
  searchParams?: Promise<{
    page?: string | string[]
    pageSize?: string | string[]
    search?: string | string[]
    status?: string | string[]
    category?: string | string[]
  }>
}) {
  const profile = await getProfile()
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const page = parsePage(resolvedSearchParams?.page)
  const pageSize = parsePageSize(resolvedSearchParams?.pageSize)
  const search = Array.isArray(resolvedSearchParams?.search)
    ? resolvedSearchParams?.search[0]
    : resolvedSearchParams?.search || ''
  const status = parseStatus(resolvedSearchParams?.status)
  const category = parseCategory(resolvedSearchParams?.category)

  if (!profile) {
    redirect('/login')
  }

  // 仅 ADMIN 可访问
  if (profile.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const [initialData, initialOverview] = await Promise.all([
    getFeedbackList({
      limit: pageSize,
      offset: (page - 1) * pageSize,
      search,
      status,
      category,
    }),
    getFeedbackOverview('30D'),
  ])

  return (
    <AdminClientWrapper user={profile} userRole={profile.role}>
      <div className="px-3 py-2 sm:px-4 sm:py-3">
        <div className="mx-auto w-full max-w-[1820px] rounded-[32px] border border-borderTone bg-page p-2.5 text-text-primary shadow-surface-lg sm:p-3">
          <FeedbackList
            initialData={
              initialData.success && initialData.data
                ? initialData.data.map((item) => ({
                    ...item,
                    createdAt: item.createdAt.toISOString(),
                    email: item.email ?? item.user?.email ?? '未提供邮箱',
                  }))
                : []
            }
            totalCount={initialData.success ? initialData.total || 0 : 0}
            initialPage={page}
            pageSize={pageSize}
            initialSearch={search}
            initialStatus={status ?? 'ALL'}
            initialCategory={category ?? 'ALL'}
            initialOverview={
              initialOverview.success ? initialOverview.data : undefined
            }
          />
        </div>
      </div>
    </AdminClientWrapper>
  )
}
