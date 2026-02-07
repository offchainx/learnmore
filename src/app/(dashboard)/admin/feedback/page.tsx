import { redirect } from 'next/navigation'
import { getProfile } from '@/actions/user/profile'
import { AdminClientWrapper } from '@/components/admin/AdminClientWrapper'
import { FeedbackList } from '@/components/admin/feedback/FeedbackList'
import { getFeedbackList } from '@/actions/support/ticket'

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

  // 预取初始数据
  const initialData = await getFeedbackList({ limit: 10 })

  return (
    <AdminClientWrapper user={profile} userRole={profile.role}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">反馈收件箱</h1>
          <p className="text-slate-400 mt-1">管理并回复用户反馈和错误报告。</p>
        </div>
        
        <FeedbackList initialData={(initialData.success && initialData.data) ? initialData.data : []} totalCount={initialData.success ? (initialData.total || 0) : 0} />
      </div>
    </AdminClientWrapper>
  )
}