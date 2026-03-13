import { notFound, redirect } from 'next/navigation'
import { getProfile } from '@/actions/user/profile'

export default async function AdminPermissionsPage() {
  const profile = await getProfile()

  if (!profile) {
    redirect('/login')
  }

  // 仅限管理员访问权限控制台
  if (profile.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  notFound()
}
