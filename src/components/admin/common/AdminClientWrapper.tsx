'use client'

import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { getDashboardRoute } from '@/components/layout/dashboard-nav'
import { User } from '@prisma/client'

interface AdminClientWrapperProps {
  children: React.ReactNode
  user?: User
  userRole: string
}

export function AdminClientWrapper({
  children,
  user,
  userRole,
}: AdminClientWrapperProps) {
  const router = useRouter()

  const handleNavigate = (view: string) => {
    router.push(getDashboardRoute(view))
  }

  return (
    <DashboardLayout
      currentView="admin"
      onNavigate={handleNavigate}
      user={user}
      userRole={userRole}
      subscriptionTier={user?.subscriptionTier}
      subscriptionEnd={user?.subscriptionEnd}
    >
      {children}
    </DashboardLayout>
  )
}
