'use client'

import { useRouter } from 'next/navigation'
import { UserDetail } from '@/components/admin/users/UserDetail'
import { Admin } from '@/types'

export function UserDetailPageClient({ user }: { user: Admin.User }) {
  const router = useRouter()

  const handleUpdateStatus = (userId: string, status: Admin.UserStatus) => {
    // TODO: Call Server Action (Task B)
    console.log(`Update user ${userId} status to ${status}`)
    // For mock demo, we refresh the page to reflect changes (if real data)
    // or just show a toast.
    alert(`[MOCK Action] User ${user.name} status updated to ${status}`)
  }

  return (
    <UserDetail 
      user={user}
      onBack={() => router.push('/admin/users')}
      onUpdateStatus={handleUpdateStatus}
    />
  )
}
