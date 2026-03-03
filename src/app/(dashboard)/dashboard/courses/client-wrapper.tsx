'use client'

import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { CoursesView } from '@/components/courses/CoursesView'
import { useApp } from '@/providers'
import { User } from '@prisma/client'

interface CoursesClientWrapperProps {
  user: User
}

export function CoursesClientWrapper({ user }: CoursesClientWrapperProps) {
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
      'admin': '/admin',
      'parent': '/dashboard'
    }

    const route = routes[view] || '/dashboard'
    router.push(route)
  }

  return (
    <DashboardLayout
      currentView="courses"
      onNavigate={handleNavigate}
      userRole={user.role}
      subscriptionTier={user.subscriptionTier}
      subscriptionEnd={user.subscriptionEnd}
    >
      <CoursesView t={t} />
    </DashboardLayout>
  )
}
