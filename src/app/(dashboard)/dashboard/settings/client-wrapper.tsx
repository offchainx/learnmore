'use client'

import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { getDashboardRoute } from '@/components/layout/dashboard-nav'
import { SettingsView } from '@/components/dashboard/views/SettingsView'
import { User, UserSettings } from '@prisma/client'

type UserProfile = User & { settings: UserSettings | null }

interface SettingsClientWrapperProps {
  user: UserProfile
  userRole: string
}

export function SettingsClientWrapper({ user, userRole }: SettingsClientWrapperProps) {
  const router = useRouter()

  const handleNavigate = (view: string) => {
    router.push(getDashboardRoute(view))
  }

  return (
    <DashboardLayout
      currentView="settings"
      onNavigate={handleNavigate}
      userRole={userRole}
      userXp={user?.xp}
      subscriptionTier={user?.subscriptionTier}
      subscriptionEnd={user?.subscriptionEnd}
    >
      <SettingsView user={user} />
    </DashboardLayout>
  )
}
