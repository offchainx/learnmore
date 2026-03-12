import { Metadata } from 'next'
import { getDashboardShellProfile } from '@/actions/user/profile'
import { redirect } from 'next/navigation'
import { LeaderboardClientWrapper } from './client-wrapper'
import {
  getAchievementOverview,
  listUserBadges,
} from '@/actions/gamification/achievements'

export const metadata: Metadata = {
  title: 'Leaderboard - Learn More',
  description: 'See how you stack up against other learners.',
}

export default async function LeaderboardPage() {
  const profile = await getDashboardShellProfile()

  if (!profile) {
    redirect('/login')
  }

  const [overview, badges] = await Promise.all([
    getAchievementOverview(profile.id),
    listUserBadges(profile.id),
  ])

  return (
    <LeaderboardClientWrapper
      user={profile}
      initialPeriod="WEEKLY"
      initialEntries={[]}
      initialMyRank={null}
      overview={overview}
      badges={badges}
    />
  )
}
