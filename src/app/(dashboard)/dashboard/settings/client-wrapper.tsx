'use client'

import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { SettingsView } from '@/components/dashboard/views/SettingsView'
import { User, UserSettings } from '@prisma/client'

type UserProfile = User & { settings: UserSettings | null }

interface SettingsWrapperProps {
  user: UserProfile
}

export function SettingsClientWrapper({ user }: SettingsWrapperProps) {
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
      currentView="settings"
      onNavigate={handleNavigate}
      userRole={user.role}
    >
      <SettingsView user={user} />
    </DashboardLayout>
  )
}
