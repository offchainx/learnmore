'use client'

import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { MyCoursesView } from '@/components/dashboard/views/MyCoursesView'
import { useApp } from '@/providers/app-provider'

interface CoursesClientWrapperProps {
  userRole: string
}

export function CoursesClientWrapper({ userRole }: CoursesClientWrapperProps) {
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
      currentView="courses"
      onNavigate={handleNavigate}
      userRole={userRole}
    >
      <MyCoursesView t={t} />
    </DashboardLayout>
  )
}
