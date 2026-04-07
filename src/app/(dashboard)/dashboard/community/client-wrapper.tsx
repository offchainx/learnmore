'use client'

import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { getDashboardRoute } from '@/components/layout/dashboard-nav'
import type { DashboardShellUser } from '@/actions/user/auth'

interface CommunityClientWrapperProps {
  children: React.ReactNode
  user: DashboardShellUser
}

export function CommunityClientWrapper({ children, user }: CommunityClientWrapperProps) {
  const router = useRouter()

  const handleNavigate = (view: string) => {
    router.push(getDashboardRoute(view))
  }

  return (
    <DashboardLayout
      currentView="community"
      onNavigate={handleNavigate}
      userRole={user.role}
      userXp={user.xp}
      subscriptionTier={user.subscriptionTier}
      subscriptionEnd={user.subscriptionEnd}
    >
      {children}
    </DashboardLayout>
  )
}
