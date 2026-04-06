import { Metadata } from 'next'
import { getDashboardShellProfile } from '@/actions/user/profile'
import { redirect } from 'next/navigation'
import { AchievementsClientWrapper } from './client-wrapper'
import {
  getCachedAchievementOverview,
  getCachedUserBadges,
} from '@/lib/cache/sitewide'

export const metadata: Metadata = {
  title: 'Achievements - LearnMore',
  description: 'View your badges, stats, and learning achievements.',
}

export default async function AchievementsPage() {
  const profile = await getDashboardShellProfile()

  if (!profile) {
    redirect('/login')
  }
  const resolvedProfile = profile

  const [overview, badges] = await Promise.all([
    getCachedAchievementOverview(resolvedProfile.id),
    getCachedUserBadges(resolvedProfile.id),
  ])

  return (
    <AchievementsClientWrapper
      user={resolvedProfile}
      overview={overview}
      badges={badges}
    />
  )
}
