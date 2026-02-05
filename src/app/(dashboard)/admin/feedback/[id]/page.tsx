import { redirect, notFound } from 'next/navigation'
import { getProfile } from '@/actions/profile'
import { AdminClientWrapper } from '@/components/admin/AdminClientWrapper'
import { getFeedbackDetail } from '@/actions/support'
import { FeedbackDetailView } from '@/components/admin/feedback/FeedbackDetailView'

export const dynamic = 'force-dynamic'

export default async function AdminFeedbackDetailPage({ params }: { params: Promise<{ id: string }> }) {
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
      <FeedbackDetailView initialData={result.data} />
    </AdminClientWrapper>
  )
}
