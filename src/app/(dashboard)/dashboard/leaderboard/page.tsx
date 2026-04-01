import { Metadata } from 'next'
import { getDashboardShellProfile } from '@/actions/user/profile'
import { redirect } from 'next/navigation'
import { LeaderboardClientWrapper } from './client-wrapper'
import {
  getCachedAchievementOverview,
  getCachedUserBadges,
} from '@/lib/cache/sitewide'
import type { LeaderboardEntryWithUser } from '@/actions/leaderboard'

function buildMockLeaderboardEntries(profile: {
  id: string
  username: string | null
  avatar: string | null
}): LeaderboardEntryWithUser[] {
  return [
    {
      rank: 1,
      score: 15400,
      user: {
        id: 'mock-1',
        username: 'Sarah J.',
        avatar: 'https://i.pravatar.cc/160?u=leader-1',
      },
    },
    {
      rank: 2,
      score: 14980,
      user: {
        id: 'mock-2',
        username: 'Mike T.',
        avatar: 'https://i.pravatar.cc/160?u=leader-2',
      },
    },
    {
      rank: 3,
      score: 14640,
      user: {
        id: 'mock-3',
        username: 'Jessica L.',
        avatar: 'https://i.pravatar.cc/160?u=leader-3',
      },
    },
    {
      rank: 4,
      score: 14220,
      user: {
        id: 'mock-4',
        username: 'Tom R.',
        avatar: 'https://i.pravatar.cc/160?u=leader-4',
      },
    },
    {
      rank: 5,
      score: 13980,
      user: {
        id: 'mock-5',
        username: 'Emily W.',
        avatar: 'https://i.pravatar.cc/160?u=leader-5',
      },
    },
    {
      rank: 6,
      score: 13720,
      user: {
        id: 'mock-6',
        username: 'David K.',
        avatar: 'https://i.pravatar.cc/160?u=leader-6',
      },
    },
    {
      rank: 7,
      score: 13580,
      user: {
        id: 'mock-7',
        username: 'Sophie M.',
        avatar: 'https://i.pravatar.cc/160?u=leader-7',
      },
    },
    {
      rank: 8,
      score: 13360,
      user: {
        id: 'mock-8',
        username: 'Chris P.',
        avatar: 'https://i.pravatar.cc/160?u=leader-8',
      },
    },
    {
      rank: 9,
      score: 13240,
      user: {
        id: 'mock-9',
        username: 'Ryan G.',
        avatar: 'https://i.pravatar.cc/160?u=leader-9',
      },
    },
    {
      rank: 10,
      score: 13040,
      user: {
        id: profile.id,
        username: profile.username || 'You',
        avatar: profile.avatar,
      },
    },
    {
      rank: 11,
      score: 12880,
      user: {
        id: 'mock-11',
        username: 'Brian C.',
        avatar: 'https://i.pravatar.cc/160?u=leader-11',
      },
    },
    {
      rank: 12,
      score: 12620,
      user: {
        id: 'mock-12',
        username: 'Laura D.',
        avatar: 'https://i.pravatar.cc/160?u=leader-12',
      },
    },
  ]
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

  const [overview, badges] = await Promise.all([
    getCachedAchievementOverview(profile.id),
    getCachedUserBadges(profile.id),
  ])

  const mockEntries = buildMockLeaderboardEntries({
    id: profile.id,
    username: profile.username,
    avatar: profile.avatar,
  })

  return (
    <LeaderboardClientWrapper
      user={profile}
      initialPeriod="WEEKLY"
      initialEntries={mockEntries}
      initialMyRank={10}
      overview={overview}
      badges={badges}
    />
  )
}
