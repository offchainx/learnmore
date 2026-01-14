'use client'

import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { LeaderboardView } from '@/components/dashboard/views/LeaderboardView'
import { useApp } from '@/providers/app-provider'

export function LeaderboardClientWrapper() {
  const router = useRouter()
  const { t } = useApp()

  const handleNavigate = (view: string) => {
    // Map view names to routes
    const routes: Record<string, string> = {
      'dashboard': '/dashboard',
      'courses': '/dashboard',
      'questionBank': '/dashboard',
      'leaderboard': '/dashboard/leaderboard',
      'community': '/dashboard/community',
      'settings': '/dashboard/settings',
      'achievements': '/dashboard',
      'parent': '/dashboard'
    }

    const route = routes[view] || '/dashboard'
    router.push(route)
  }

  return (
    <DashboardLayout
      currentView="leaderboard"
      onNavigate={handleNavigate}
      userRole="STUDENT"
    >
      <LeaderboardView t={t} />
    </DashboardLayout>
  )
}
