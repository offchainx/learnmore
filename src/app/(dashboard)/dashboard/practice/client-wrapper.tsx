'use client'

import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { getDashboardRoute } from '@/components/layout/dashboard-nav'
import { PracticeCenterScreen } from '@/components/practice/PracticeView'
import { useApp } from '@/providers'
import { User } from '@prisma/client'

interface PracticeClientWrapperProps {
  user: User
  initialSubjectId?: string
}

export function PracticeClientWrapper({
  user,
  initialSubjectId,
}: PracticeClientWrapperProps) {
  const router = useRouter()
  const { t } = useApp()

  const handleNavigate = (view: string) => {
    router.push(getDashboardRoute(view))
  }

  return (
    <DashboardLayout
      currentView="practice"
      onNavigate={handleNavigate}
      userRole={user.role}
      userXp={user.xp}
      subscriptionTier={user.subscriptionTier}
      subscriptionEnd={user.subscriptionEnd}
    >
      <PracticeCenterScreen t={t} initialSubjectId={initialSubjectId} />
    </DashboardLayout>
  )
}
