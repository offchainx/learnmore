import { Metadata } from 'next'
import { getDashboardShellProfile } from '@/actions/user/profile'
import { getUserRank } from '@/actions/leaderboard'
import { redirect } from 'next/navigation'
import { LeaderboardClientWrapper } from './client-wrapper'
import {
  getCachedLeaderboardEntries,
  getCachedAchievementOverview,
  getCachedUserBadges,
} from '@/lib/cache/sitewide'
import type { LeaderboardEntryWithUser } from '@/actions/leaderboard'

function mergeCurrentUserEntry(
  entries: LeaderboardEntryWithUser[],
  profile: {
    id: string
    username: string | null
    avatar: string | null
  },
  myRank: { rank: number; score: number } | null
): LeaderboardEntryWithUser[] {
  if (!myRank) return entries

  const hasCurrentUser = entries.some((entry) => entry.user.id === profile.id)
  if (hasCurrentUser) return entries

  return [
    ...entries,
    {
      rank: myRank.rank,
      score: myRank.score,
      user: {
        id: profile.id,
        username: profile.username || 'You',
        avatar: profile.avatar,
      },
    },
  ].sort((a, b) => a.rank - b.rank)
}

export const metadata: Metadata = {
  title: 'Leaderboard - Learn More',
  description: 'See how you stack up against other learners.',
}

export default async function LeaderboardPage() {
  const profile = await getDashboardShellProfile()

  if (!profile) {
    redirect('/login')
  }
  const resolvedProfile = profile

  const [overview, badges, weeklyEntries, myRank] = await Promise.all([
    getCachedAchievementOverview(resolvedProfile.id),
    getCachedUserBadges(resolvedProfile.id),
    getCachedLeaderboardEntries('WEEKLY', 100),
    getUserRank(resolvedProfile.id, 'WEEKLY'),
  ])

  const initialEntries = mergeCurrentUserEntry(weeklyEntries, {
    id: resolvedProfile.id,
    username: resolvedProfile.username,
    avatar: resolvedProfile.avatar,
  }, myRank)

  return (
    <LeaderboardClientWrapper
      user={resolvedProfile}
      initialPeriod="WEEKLY"
      initialEntries={initialEntries}
      initialMyRank={myRank?.rank ?? null}
      overview={overview}
      badges={badges}
    />
  )
}
