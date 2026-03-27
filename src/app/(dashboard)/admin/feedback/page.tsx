import { redirect } from 'next/navigation'
import { getProfile } from '@/actions/user/profile'
import { AdminClientWrapper } from '@/components/admin/common'
import { FeedbackList } from '@/components/admin/feedback/FeedbackList'
import { getFeedbackList, getFeedbackOverview } from '@/actions/support/ticket'

export const dynamic = 'force-dynamic'

export default async function AdminFeedbackPage() {
  const profile = await getProfile()

  if (!profile) {
    redirect('/login')
  }

  // 仅 ADMIN 可访问
  if (profile.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const [initialData, initialOverview] = await Promise.all([
    getFeedbackList({ limit: 20 }),
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
            initialOverview={
              initialOverview.success ? initialOverview.data : undefined
            }
          />
        </div>
      </div>
    </AdminClientWrapper>
  )
}
