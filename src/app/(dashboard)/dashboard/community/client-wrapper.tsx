'use client'

import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { CommunityView } from '@/components/dashboard/views/CommunityView'

export function CommunityClientWrapper() {
  const router = useRouter()

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
      currentView="community"
      onNavigate={handleNavigate}
      userRole="STUDENT"
    >
      <CommunityView />
    </DashboardLayout>
  )
}
