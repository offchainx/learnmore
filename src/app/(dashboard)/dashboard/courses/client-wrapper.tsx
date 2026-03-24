'use client'

import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { getDashboardRoute } from '@/components/layout/dashboard-nav'
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
    router.push(getDashboardRoute(view))
  }

  return (
    <DashboardLayout
      currentView="courses"
      onNavigate={handleNavigate}
      userRole={user.role}
      userXp={user.xp}
      subscriptionTier={user.subscriptionTier}
      subscriptionEnd={user.subscriptionEnd}
    >
      <CoursesView t={t} />
    </DashboardLayout>
  )
}
