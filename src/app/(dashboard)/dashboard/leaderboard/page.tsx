import { Metadata } from 'next'
import { getLeaderboard, getUserRank } from '@/actions/leaderboard'
import { getCurrentUser } from '@/actions/auth'
import { LeaderboardClient } from './LeaderboardClient'
import { LeaderboardPeriod } from '@prisma/client'

export const metadata: Metadata = {
  title: 'Leaderboard - Learn More',
  description: 'See how you stack up against other learners.',
}

interface PageProps {
  searchParams: Promise<{
    period?: string
  }>
}

export default async function LeaderboardPage({ searchParams }: PageProps) {
  const user = await getCurrentUser()
  
  // Await searchParams for Next.js 15+ compatibility
  const resolvedSearchParams = await searchParams
  const period = (resolvedSearchParams.period as LeaderboardPeriod) || 'WEEKLY'
  
  // Validate period
  const validPeriods: LeaderboardPeriod[] = ['WEEKLY', 'MONTHLY', 'ALL_TIME']
  const safePeriod = validPeriods.includes(period) ? period : 'WEEKLY'

  const [leaderboardData, userRank] = await Promise.all([
    getLeaderboard(safePeriod, 100),
    user ? getUserRank(user.id, safePeriod) : null
  ])

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <LeaderboardClient
        initialEntries={leaderboardData}
        userRank={userRank}
        currentPeriod={safePeriod}
      />
    </div>
  )
}