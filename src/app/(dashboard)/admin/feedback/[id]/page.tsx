import { redirect, notFound } from 'next/navigation'
import { getProfile } from '@/actions/user/profile'
import { AdminClientWrapper } from '@/components/admin/common'
import { getFeedbackDetail } from '@/actions/support/ticket'
import { FeedbackDetailView } from '@/components/admin/feedback/FeedbackDetailView'

export default async function AdminFeedbackDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const profile = await getProfile()
  const { id } = await params

  if (!profile) {
    redirect('/login')
  }

  // 仅 ADMIN 可访问
  if (profile.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const result = await getFeedbackDetail(id)

  if (!result.success || !result.data) {
    notFound()
  }

  return (
    <AdminClientWrapper user={profile} userRole={profile.role}>
      <div className="px-3 py-2 sm:px-4 sm:py-3">
        <div className="mx-auto w-full max-w-[1820px] rounded-[32px] border border-[#24324D] bg-[#0B1220] p-2.5 text-[#E6EDF7] sm:p-3">
          <FeedbackDetailView initialData={result.data} />
        </div>
      </div>
    </AdminClientWrapper>
  )
}
