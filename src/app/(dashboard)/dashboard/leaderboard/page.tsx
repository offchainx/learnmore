import { Metadata } from 'next'
import { getProfile } from '@/actions/user/profile'
import { getLeaderboard, getUserRank } from '@/actions/leaderboard'
import { redirect } from 'next/navigation'
import { LeaderboardClientWrapper } from './client-wrapper'

export const metadata: Metadata = {
  title: 'Leaderboard - Learn More',
  description: 'See how you stack up against other learners.',
}

export default async function LeaderboardPage() {
  const profile = await getProfile()

  if (!profile) {
    redirect('/login')
  }

  const [entries, myRank] = await Promise.all([
    getLeaderboard('WEEKLY', 100),
    getUserRank(profile.id, 'WEEKLY'),
  ])

  return (
    <LeaderboardClientWrapper
      user={profile}
      initialPeriod="WEEKLY"
      initialEntries={entries}
      initialMyRank={myRank?.rank ?? null}
    />
  )
}
