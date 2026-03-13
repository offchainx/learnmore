/**
 * Admin User Management Page
 * Story-046: 用户全生命周期管理后台 - Task A
 *
 * 用户列表页（带高级筛选 + 服务端分页），使用真实数据
 */

import { redirect } from 'next/navigation'
import { getProfile } from '@/actions/user/profile'
import { getAdminUserOverview, listAdminUsers } from '@/actions/admin/user-ops'
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

  const [initialUsersResult, initialOverviewResult] = await Promise.all([
    listAdminUsers(
      {
        search: '',
        status: 'All',
        tier: 'All',
      },
      {
        page: 1,
        pageSize: 20,
        sortField: 'lastActive',
        sortDirection: 'desc',
      }
    ),
    getAdminUserOverview('30D'),
  ])

  return (
    <AdminClientWrapper user={profile} userRole={profile.role}>
      <div className="px-3 py-2 sm:px-4 sm:py-3">
        <div className="mx-auto w-full max-w-[1820px] rounded-[32px] border border-[#24324D] bg-[#0B1220] p-2.5 text-[#E6EDF7] sm:p-3">
          <UserTable
            initialData={
              initialUsersResult.success ? initialUsersResult.data : undefined
            }
            initialOverview={
              initialOverviewResult.success
                ? initialOverviewResult.data
                : undefined
            }
            canOverridePermissions={profile.role === 'ADMIN'}
          />
        </div>
      </div>
    </AdminClientWrapper>
  )
}
