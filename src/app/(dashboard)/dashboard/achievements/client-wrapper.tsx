'use client'

import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { getDashboardRoute } from '@/components/layout/dashboard-nav'
import { AchievementsView } from '@/components/achievements/AchievementsView'
import type { DashboardShellUser } from '@/actions/user/auth'
import type {
  AchievementOverview,
  BadgeWithUnlockStatus,
} from '@/lib/gamification/achievements-types'

interface AchievementsClientWrapperProps {
  user: DashboardShellUser
  overview: AchievementOverview | null
  badges: BadgeWithUnlockStatus[]
}

export function AchievementsClientWrapper({ user, overview, badges }: AchievementsClientWrapperProps) {
  const router = useRouter()

  const handleNavigate = (view: string) => {
    router.push(getDashboardRoute(view))
  }

  return (
    <DashboardLayout
      currentView="achievements"
      onNavigate={handleNavigate}
      userRole={user.role}
      userXp={user.xp}
      subscriptionTier={user.subscriptionTier}
      subscriptionEnd={user.subscriptionEnd}
    >
      <AchievementsView
        user={{
          username: user.username,
          avatar: user.avatar,
        }}
        overview={overview}
        badges={badges}
      />
    </DashboardLayout>
  )
}
