import { Metadata } from 'next'
import { getDashboardShellProfile } from '@/actions/user/profile'
import { redirect } from 'next/navigation'
import { AchievementsClientWrapper } from './client-wrapper'
import { getAchievementOverview, listUserBadges } from '@/actions/gamification/achievements'

export const metadata: Metadata = {
  title: 'Achievements - LearnMore',
  description: 'View your badges, stats, and learning achievements.',
}

export default async function AchievementsPage() {
  const profile = await getDashboardShellProfile()

  if (!profile) {
    redirect('/login')
  }

  const [overview, badges] = await Promise.all([
    getAchievementOverview(profile.id),
    listUserBadges(profile.id),
  ])

  return (
    <AchievementsClientWrapper
      user={profile}
      overview={overview}
      badges={badges}
    />
  )
}
