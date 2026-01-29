'use client'

import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { SettingsView } from '@/components/dashboard/views/SettingsView'
import { User, UserSettings } from '@prisma/client'

type UserProfile = User & { settings: UserSettings | null }

interface SettingsClientWrapperProps {
  user: any
  userRole: string
}

export function SettingsClientWrapper({ user, userRole }: SettingsClientWrapperProps) {
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
      currentView="settings"
      onNavigate={handleNavigate}
      userRole={userRole}
    >
      <SettingsView user={user} />
    </DashboardLayout>
  )
}
