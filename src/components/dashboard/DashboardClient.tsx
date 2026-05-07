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
import { SettingsView } from './views/SettingsView'
import { ParentDashboardView } from './views/ParentDashboardView'
type DashboardShellUser = {
  id: string
  username: string | null
  displayName: string | null
  avatar: string | null
  handle: string | null
  role: string
  status: string
  grade: number | null
  school: string | null
  legalConsentAcceptedAt: Date | string | null
  legalConsentVersion: string | null
  onboardingCompletedAt: Date | string | null
  onboardingStep: string | null
  streak: number | null
  xp: number | null
  subscriptionTier: string | null
  subscriptionEnd: Date | string | null
  settings?: {
    studyReminderTime?: string | null
  } | null
}

interface DashboardClientProps {
  user: DashboardShellUser
  initialData: DashboardData | null
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

    if (normalizedView === 'achievements') {
      router.push(getDashboardRoute(normalizedView))
      return
    }

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
          return <SettingsView user={user as any} />
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
            user={user as any}
          />
        )
      case 'courses':
        return <CoursesView t={appT} />
      case 'practice':
        return <PracticeCenterScreen t={appT} />
      case 'community':
        return <CommunityView />
      case 'settings':
        return <SettingsView user={user as any} />
      default:
        return (
          <DashboardHome
            navigate={router.push}
            onViewChange={handleViewChange}
            initialData={initialData}
            user={user as any}
          />
        )
    }
  }

  return (
    <DashboardLayout
      currentView={currentView}
      onNavigate={handleViewChange}
      user={user}
      userRole={user.role}
      userXp={user.xp}
      subscriptionTier={user.subscriptionTier}
      subscriptionEnd={user.subscriptionEnd}
    >
      {renderContent()}
    </DashboardLayout>
  )
}
