/**
 * Admin User Detail Page
 * Story-046: 用户全生命周期管理后台 - Task B
 *
 * 用户详情页（360 View）
 */

import { redirect, notFound } from 'next/navigation'
import { getProfile } from '@/actions/user/profile'
import { getUserDetail } from '@/actions/admin/user-ops'
import { AdminClientWrapper } from '@/components/admin/common'
import { UserDetailClient } from './UserDetailClient'

interface Props {
  params: Promise<{ id: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function AdminUserDetailPage({ params, searchParams }: Props) {
  const { id } = await params
  const resolvedSearchParams = (await searchParams) || {}
  const rawTab = Array.isArray(resolvedSearchParams.tab)
    ? resolvedSearchParams.tab[0]
    : resolvedSearchParams.tab
  const profile = await getProfile()

  if (!profile) {
    redirect('/login')
  }

  // 仅 ADMIN 可访问
  if (profile.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  // 获取用户详情
  const result = await getUserDetail(id)

  if (!result.success || !result.data) {
    notFound()
  }

  return (
    <AdminClientWrapper userRole={profile.role}>
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="max-w-7xl mx-auto">
          <UserDetailClient user={result.data} initialTab={rawTab} />
        </div>
      </div>
    </AdminClientWrapper>
  )
}
