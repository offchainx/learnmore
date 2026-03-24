'use client'

import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { getDashboardRoute } from '@/components/layout/dashboard-nav'
import { LeaderboardView } from '@/components/leaderboard/LeaderboardView'
import { useApp } from '@/providers'
import { User } from '@prisma/client'
import type { LeaderboardEntryWithUser } from '@/actions/leaderboard'
import type {
  AchievementOverview,
  BadgeWithUnlockStatus,
} from '@/lib/gamification/achievements-types'

interface LeaderboardClientWrapperProps {
  user: User
  initialPeriod: 'WEEKLY' | 'MONTHLY' | 'ALL_TIME'
  initialEntries: LeaderboardEntryWithUser[]
  initialMyRank: number | null
  overview: AchievementOverview | null
  badges: BadgeWithUnlockStatus[]
}

export function LeaderboardClientWrapper({
  user,
  initialPeriod,
  initialEntries,
  initialMyRank,
  overview,
  badges,
}: LeaderboardClientWrapperProps) {
  const router = useRouter()
  const { t } = useApp()

  const handleNavigate = (view: string) => {
    router.push(getDashboardRoute(view))
  }

  return (
    <DashboardLayout
      currentView="leaderboard"
      onNavigate={handleNavigate}
      userRole={user.role}
      userXp={user.xp}
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
        overview={overview}
        badges={badges}
      />
    </DashboardLayout>
  )
}
