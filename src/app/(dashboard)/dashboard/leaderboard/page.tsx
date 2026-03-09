import { Metadata } from 'next'
import { getDashboardProfile } from '@/actions/user/profile'
import { redirect } from 'next/navigation'
import { LeaderboardClientWrapper } from './client-wrapper'

export const metadata: Metadata = {
  title: 'Leaderboard - Learn More',
  description: 'See how you stack up against other learners.',
}

export default async function LeaderboardPage() {
  const profile = await getDashboardProfile()

  if (!profile) {
    redirect('/login')
  }

  return (
    <LeaderboardClientWrapper
      user={profile}
      initialPeriod="WEEKLY"
      initialEntries={[]}
      initialMyRank={null}
    />
  )
}
