import { redirect } from 'next/navigation'
import { getProfile } from '@/actions/user/profile'
import { AdminClientWrapper } from '@/components/admin/common'
import { UserPermissionManager } from '@/components/admin/permissions/UserPermissionManager'

export const dynamic = 'force-dynamic'

export default async function AdminPermissionsPage() {
  const profile = await getProfile()

  if (!profile) {
    redirect('/login')
  }

  // 仅限管理员访问权限控制台
  if (profile.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  return (
    <AdminClientWrapper user={profile} userRole={profile.role}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">权限调控台</h1>
          <p className="text-muted-foreground">
            搜索用户并手动调整其订阅等级和访问权限。
          </p>
        </div>
        
        <UserPermissionManager />
      </div>
    </AdminClientWrapper>
  )
}
