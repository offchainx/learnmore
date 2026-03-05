'use client'

import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { LeaderboardView } from '@/components/leaderboard/LeaderboardView'
import { useApp } from '@/providers'
import { User } from '@prisma/client'
import type { LeaderboardEntryWithUser } from '@/actions/leaderboard'

interface LeaderboardClientWrapperProps {
  user: User
  initialPeriod: 'WEEKLY' | 'MONTHLY' | 'ALL_TIME'
  initialEntries: LeaderboardEntryWithUser[]
  initialMyRank: number | null
}

export function LeaderboardClientWrapper({
  user,
  initialPeriod,
  initialEntries,
  initialMyRank,
}: LeaderboardClientWrapperProps) {
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
      currentView="leaderboard"
      onNavigate={handleNavigate}
      userRole={user.role}
      subscriptionTier={user.subscriptionTier}
      subscriptionEnd={user.subscriptionEnd}
    >
      <LeaderboardView
        t={t}
        currentUser={{
          id: user.id,
          username: user.username,
          avatar: user.avatar,
        }}
        initialPeriod={initialPeriod}
        initialEntries={initialEntries}
        initialMyRank={initialMyRank}
      />
    </DashboardLayout>
  )
}
