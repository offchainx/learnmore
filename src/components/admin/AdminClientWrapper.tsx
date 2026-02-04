'use client'

import { useRouter, usePathname } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { User } from '@prisma/client'

interface AdminClientWrapperProps {
  children: React.ReactNode
  user?: User
  userRole: string
}

export function AdminClientWrapper({ children, user, userRole }: AdminClientWrapperProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleNavigate = (view: string) => {
    const routes: Record<string, string> = {
      'dashboard': '/dashboard',
      'courses': '/dashboard/courses',
      'questionBank': '/dashboard/practice',
      'leaderboard': '/dashboard/leaderboard',
      'community': '/dashboard/community',
      'settings': '/dashboard/settings',
      'achievements': '/dashboard/achievements',
      'knowledgeGraph': '/dashboard/knowledge-graph',
      'admin': '/admin/content/review'
    }

    const route = routes[view] || '/dashboard'
    router.push(route)
  }

  return (
    <DashboardLayout
      currentView="admin"
      onNavigate={handleNavigate}
      userRole={userRole}
      subscriptionTier={user?.subscriptionTier}
      subscriptionEnd={user?.subscriptionEnd}
    >
      {children}
    </DashboardLayout>
  )
}