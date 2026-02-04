'use client'

import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { LeaderboardView } from '@/components/dashboard/views/LeaderboardView'
import { useApp } from '@/providers/app-provider'
import { User } from '@prisma/client'

interface LeaderboardClientWrapperProps {
  user: User
}

export function LeaderboardClientWrapper({ user }: LeaderboardClientWrapperProps) {
  const router = useRouter()
  const { t } = useApp()

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
      currentView="leaderboard"
      onNavigate={handleNavigate}
      userRole={user.role}
      subscriptionTier={user.subscriptionTier}
      subscriptionEnd={user.subscriptionEnd}
    >
      <LeaderboardView t={t} />
    </DashboardLayout>
  )
}