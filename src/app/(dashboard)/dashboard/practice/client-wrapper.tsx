'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { getDashboardRoute } from '@/components/layout/dashboard-nav'
import { PracticeCenterScreen } from '@/components/practice/PracticeView'
import { useApp } from '@/providers'
import type { DashboardShellUser } from '@/actions/user/auth'

interface PracticeClientWrapperProps {
  user: DashboardShellUser
  initialSubjectId?: string
}

export function PracticeClientWrapper({
  user,
  initialSubjectId,
}: PracticeClientWrapperProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useApp()
  const debugLayout = searchParams.get('layoutDebug') === '1'

  const handleNavigate = (view: string) => {
    router.push(getDashboardRoute(view))
  }

  return (
    <DashboardLayout
      currentView="practice"
      onNavigate={handleNavigate}
      user={user}
      userRole={user.role}
      userXp={user.xp}
      subscriptionTier={user.subscriptionTier}
      subscriptionEnd={user.subscriptionEnd}
    >
      <PracticeCenterScreen
        t={t}
        initialSubjectId={initialSubjectId}
        debugLayout={debugLayout}
      />
    </DashboardLayout>
  )
}
