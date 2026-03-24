'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import {
  type DashboardView,
  getDashboardRoute,
  normalizeDashboardView,
} from '@/components/layout/dashboard-nav'
import { useApp } from '@/providers'
import { DashboardData } from '@/actions/dashboard'

// Import Views
import { DashboardHome } from './DashboardHome'
import { CommunityView } from './views/CommunityView'
import { CoursesView } from '@/components/courses/CoursesView'
import { PracticeCenterScreen } from '@/components/practice/PracticeView'
import { LeaderboardView } from '@/components/leaderboard/LeaderboardView'
import { SettingsView } from './views/SettingsView'
import { AchievementsView } from '@/components/achievements/AchievementsView'
import { ParentDashboardView } from './views/ParentDashboardView'
import { User, UserSettings } from '@prisma/client'

type UserProfile = User & { settings: UserSettings | null }

interface DashboardClientProps {
  user: UserProfile
  initialData: DashboardData
}

export function DashboardClient({ user, initialData }: DashboardClientProps) {
  const router = useRouter()
  const { t: appT } = useApp()
  // Automatically switch to parent view if user is a parent
  const [currentView, setCurrentView] = useState<DashboardView>(
    user.role === 'PARENT' ? 'parent' : 'dashboard'
  )

  const handleViewChange = (view: string) => {
    const normalizedView = normalizeDashboardView(view)

    if (normalizedView === 'dashboard' || normalizedView === 'parent') {
      setCurrentView(normalizedView)
      return
    }

    router.push(getDashboardRoute(normalizedView))
  }

  const renderContent = () => {
    // Parent should only see ParentDashboard or Settings
    if (user.role === 'PARENT') {
      switch (currentView) {
        case 'settings':
          return <SettingsView user={user} />
        default:
          return <ParentDashboardView />
      }
    }

    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardHome
            navigate={router.push}
            onViewChange={handleViewChange}
            initialData={initialData}
            user={user}
          />
        )
      case 'courses':
        return <CoursesView t={appT} />
      case 'practice':
        return <PracticeCenterScreen t={appT} />
      case 'leaderboard':
        return (
          <LeaderboardView
            t={appT}
            currentUser={{
              id: user.id,
              username: user.username,
              avatar: user.avatar,
            }}
            overview={null}
            badges={[]}
          />
        )
      case 'community':
        return <CommunityView />
      case 'settings':
        return <SettingsView user={user} />
      case 'achievements':
        return (
          <AchievementsView
            user={{
              username: user.username,
              avatar: user.avatar,
            }}
            overview={null}
            badges={[]}
          />
        )
      default:
        return (
          <DashboardHome
            navigate={router.push}
            onViewChange={handleViewChange}
            initialData={initialData}
            user={user}
          />
        )
    }
  }

  return (
    <DashboardLayout
      currentView={currentView}
      onNavigate={handleViewChange}
      userRole={user.role}
      userXp={user.xp}
      subscriptionTier={user.subscriptionTier}
      subscriptionEnd={user.subscriptionEnd}
    >
      {renderContent()}
    </DashboardLayout>
  )
}
