/**
 * Admin User Management Page
 * Story-046: 用户全生命周期管理后台 - Task A
 *
 * 用户列表页（带高级筛选 + 服务端分页），使用 Mock 数据预填充
 */

import { redirect } from 'next/navigation'
import { getProfile } from '@/actions/user/profile'
import { AdminClientWrapper } from '@/components/admin/common'
import { UserTable } from '@/components/admin/users/UserTable'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const profile = await getProfile()

  if (!profile) {
    redirect('/login')
  }

  // 仅 ADMIN 和 TEACHER 可访问
  if (profile.role !== 'ADMIN' && profile.role !== 'TEACHER') {
    redirect('/dashboard')
  }

  return (
    <AdminClientWrapper user={profile} userRole={profile.role}>
      <div className="w-full space-y-6">
        <div className="w-full">
          <UserTable />
        </div>
      </div>
    </AdminClientWrapper>
  )
}
