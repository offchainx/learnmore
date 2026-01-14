'use client'

import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { QuestionBankView } from '@/components/dashboard/views/QuestionBankView'
import { useApp } from '@/providers/app-provider'

export function PracticeClientWrapper() {
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
      'achievements': '/dashboard',
      'parent': '/dashboard'
    }

    const route = routes[view] || '/dashboard'
    router.push(route)
  }

  return (
    <DashboardLayout
      currentView="questionBank"
      onNavigate={handleNavigate}
      userRole="STUDENT"
    >
      <QuestionBankView t={t} />
    </DashboardLayout>
  )
}
