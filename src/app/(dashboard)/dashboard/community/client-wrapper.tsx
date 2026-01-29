'use client'

import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { CommunityView } from '@/components/dashboard/views/CommunityView'

interface CommunityClientWrapperProps {
  userRole: string
  children: React.ReactNode
}

export function CommunityClientWrapper({ userRole, children }: CommunityClientWrapperProps) {
  const router = useRouter()

  const handleNavigate = (view: string) => {
    // Map view names to routes
    const routes: Record<string, string> = {
      'dashboard': '/dashboard',
      'courses': '/dashboard/courses',
      'questionBank': '/dashboard/practice',
      'leaderboard': '/dashboard/leaderboard',
      'community': '/dashboard/community',
      'settings': '/dashboard/settings',
      'achievements': '/dashboard/achievements',
      'knowledgeGraph': '/dashboard/knowledge-graph',
      'admin': '/admin/content',
      'parent': '/dashboard'
    }

    const route = routes[view] || '/dashboard'
    router.push(route)
  }

  return (
    <DashboardLayout
      currentView="community"
      onNavigate={handleNavigate}
      userRole={userRole}
    >
      {children}
    </DashboardLayout>
  )
}
