'use client'

import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { AchievementsView } from '@/components/achievements/AchievementsView'
import { User } from '@prisma/client'
import type {
  AchievementOverview,
  BadgeWithUnlockStatus,
} from '@/lib/gamification/achievements-types'

interface AchievementsClientWrapperProps {
  user: User
  overview: AchievementOverview | null
  badges: BadgeWithUnlockStatus[]
}

export function AchievementsClientWrapper({ user, overview, badges }: AchievementsClientWrapperProps) {
  const router = useRouter()

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
      'admin': '/admin',
      'parent': '/dashboard'
    }

    const route = routes[view] || '/dashboard'
    router.push(route)
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
