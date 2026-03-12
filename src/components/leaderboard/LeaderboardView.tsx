'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { BookOpen, MessageCircle, Target, Trophy, Zap } from 'lucide-react'
import { TierRoadmap } from './components/TierRoadmap'
import { SeasonBanner } from './components/SeasonBanner'
import { Podium } from './components/Podium'
import { LeaderboardList } from './components/LeaderboardList'
import { XPBreakdown } from './components/XPBreakdown'
import { DailyQuests } from './components/DailyQuests'
import { RivalWatch } from './components/RivalWatch'
import type { LeaderboardEntryWithUser } from '@/actions/leaderboard'
import {
  fetchWithTimeout,
  isAbortLikeError,
} from '@/lib/http/fetch-with-timeout'
import type {
  AchievementOverview,
  BadgeWithUnlockStatus,
} from '@/lib/gamification/achievements-types'
import { calculateLevelProgress } from '@/lib/gamification'

interface LeaderboardViewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t?: any
  currentUser: {
    id: string
    username: string | null
    avatar: string | null
  }
  initialPeriod?: PeriodKey
  initialEntries?: LeaderboardEntryWithUser[]
  initialMyRank?: number | null
  overview?: AchievementOverview | null
  badges?: BadgeWithUnlockStatus[]
}

const tiers = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Challenger']
const currentTierIndex = 2
const seasonData = {
  name: 'Season 4: Sniper Elite',
  theme: 'Precision Matters',
  bonus: '2x XP for Error Book Kills',
  endsIn: 'Live',
  color: 'from-red-500/20 to-orange-500/20',
  border: 'border-red-500/30',
  icon: Target,
}
type PeriodKey = 'WEEKLY' | 'MONTHLY' | 'ALL_TIME'

interface RankedUser {
  rank: number
  name: string
  xp: number
  avatar: string
  trend: 'up' | 'down' | 'same'
  status: 'promotion' | 'demotion' | 'safe'
  isMe?: boolean
}

function getStatusByRank(rank: number): 'promotion' | 'demotion' | 'safe' {
  if (rank <= 5) return 'promotion'
  if (rank >= 16) return 'demotion'
  return 'safe'
}

function getTierIndexByRank(rank: number | null) {
  if (!rank) return 0
  if (rank <= 10) return 5
  if (rank <= 25) return 4
  if (rank <= 50) return 3
  if (rank <= 100) return 2
  if (rank <= 250) return 1
  return 0
}

function getBadgeProgress(
  overview: AchievementOverview,
  badge: BadgeWithUnlockStatus
) {
  switch (badge.code) {
    case 'first_practice':
      return {
        current: Math.min(overview.questions, 1),
        total: 1,
        title: '完成首次练习',
        subtitle:
          overview.questions > 0
            ? '已经完成，继续保持学习节奏'
            : '先做一组练习，点亮成长记录',
        href: '/dashboard/practice',
        cta: '去练习',
        icon: Target,
        color: 'text-purple-300 bg-purple-400/10',
        xp: 80,
      }
    case 'practice_master_100':
      return {
        current: Math.min(overview.correctAnswers, 100),
        total: 100,
        title: '冲刺 Practice Master',
        subtitle: `再答对 ${Math.max(100 - overview.correctAnswers, 0)} 题即可解锁`,
        href: '/dashboard/practice',
        cta: '继续刷题',
        icon: Zap,
        color: 'text-orange-300 bg-orange-400/10',
        xp: 160,
      }
    case 'streak_7_days':
      return {
        current: Math.min(overview.streak, 7),
        total: 7,
        title: '保持 7 天连胜',
        subtitle: `再坚持 ${Math.max(7 - overview.streak, 0)} 天就能点亮连胜徽章`,
        href: '/dashboard',
        cta: '继续学习',
        icon: Trophy,
        color: 'text-emerald-300 bg-emerald-400/10',
        xp: 120,
      }
    case 'community_helper_10':
      return {
        current: Math.min(overview.posts + overview.comments, 10),
        total: 10,
        title: '完成社区互动',
        subtitle: `再互动 ${Math.max(10 - (overview.posts + overview.comments), 0)} 次即可解锁`,
        href: '/dashboard/community',
        cta: '去社区',
        icon: MessageCircle,
        color: 'text-sky-300 bg-sky-400/10',
        xp: 90,
      }
    default:
      return null
  }
}

export const LeaderboardView = ({
  currentUser,
  initialPeriod = 'WEEKLY',
  initialEntries = [],
  initialMyRank = null,
  overview = null,
  badges = [],
}: LeaderboardViewProps) => {
  const [activeTab, setActiveTab] = useState<'global' | 'friends'>('global')
  const [period, setPeriod] = useState<PeriodKey>(initialPeriod)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rankedUsers, setRankedUsers] = useState<RankedUser[]>(
    initialEntries.map((entry) => ({
      rank: entry.rank,
      name: entry.user.username || 'Anonymous',
      xp: entry.score,
      avatar:
        entry.user.avatar || `https://i.pravatar.cc/150?u=${entry.user.id}`,
      trend: 'same',
      status: getStatusByRank(entry.rank),
      isMe: entry.user.id === currentUser.id,
    }))
  )
  const [myRank, setMyRank] = useState<number | null>(initialMyRank)
  const requestKey = useMemo(() => `${period}:100`, [period])
  const lastLoadedKeyRef = useRef<string>(
    initialEntries.length > 0 ? `${initialPeriod}:100` : ''
  )

  useEffect(() => {
    let cancelled = false
    const shouldSkipFetch = requestKey === lastLoadedKeyRef.current
    if (shouldSkipFetch) {
      return
    }
    lastLoadedKeyRef.current = requestKey

    async function loadLeaderboard() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetchWithTimeout(
          `/api/leaderboard/summary?period=${encodeURIComponent(period)}&limit=100`,
          {
            timeoutMs: 8000,
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
          }
        )
        if (!response.ok) {
          throw new Error(`Failed to load leaderboard: ${response.status}`)
        }
        const result = await response.json()
        if (!result.success || !result.data) {
          throw new Error(result.error || 'Invalid leaderboard response')
        }

        const entries = result.data.entries as LeaderboardEntryWithUser[]
        const me = result.data.myRank as { rank: number; score: number } | null

        if (cancelled) return

        const mapped: RankedUser[] = entries.map((entry) => ({
          rank: entry.rank,
          name: entry.user.username || 'Anonymous',
          xp: entry.score,
          avatar:
            entry.user.avatar || `https://i.pravatar.cc/150?u=${entry.user.id}`,
          trend: 'same',
          status: getStatusByRank(entry.rank),
          isMe: entry.user.id === currentUser.id,
        }))

        // 若当前用户不在 top100 但有排名，补一行自己的数据便于展示
        if (me && !mapped.some((u) => u.isMe)) {
          mapped.push({
            rank: me.rank,
            name: currentUser.username || 'You',
            xp: me.score,
            avatar:
              currentUser.avatar ||
              `https://i.pravatar.cc/150?u=${currentUser.id}`,
            trend: 'same',
            status: getStatusByRank(me.rank),
            isMe: true,
          })
        }

        setMyRank(me?.rank ?? null)
        setRankedUsers(mapped.sort((a, b) => a.rank - b.rank))
      } catch (e) {
        console.error('Failed to load leaderboard:', e)
        lastLoadedKeyRef.current = ''
        if (!cancelled) {
          setError(
            isAbortLikeError(e)
              ? '请求超时，已保留上次排行榜数据'
              : 'Failed to load leaderboard'
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadLeaderboard()
    return () => {
      cancelled = true
    }
  }, [
    currentUser.avatar,
    currentUser.id,
    currentUser.username,
    requestKey,
    period,
  ])

  const topThree = useMemo(() => {
    const top = rankedUsers.slice(0, 3).map((u) => ({
      rank: u.rank,
      name: u.name,
      xp: u.xp,
      avatar: u.avatar,
      trend: u.trend,
      change: 0,
      badge: 'Elite',
    }))

    while (top.length < 3) {
      top.push({
        rank: top.length + 1,
        name: 'Waiting...',
        xp: 0,
        avatar: `https://i.pravatar.cc/150?u=placeholder-${top.length + 1}`,
        trend: 'same',
        change: 0,
        badge: 'None',
      })
    }

    return top
  }, [rankedUsers])

  const listData = useMemo(() => rankedUsers.slice(3), [rankedUsers])
  const meEntry = useMemo(
    () => rankedUsers.find((user) => user.isMe) ?? null,
    [rankedUsers]
  )
  const previousRankEntry = useMemo(() => {
    if (!meEntry || meEntry.rank <= 1) return null
    return rankedUsers.find((user) => user.rank === meEntry.rank - 1) ?? null
  }, [meEntry, rankedUsers])
  const myGapToPrevious =
    previousRankEntry && meEntry
      ? Math.max(previousRankEntry.xp - meEntry.xp, 0)
      : null
  const currentTierIndex = useMemo(() => getTierIndexByRank(myRank), [myRank])

  const growthSummary = useMemo(() => {
    if (!overview) return null

    const unlockedBadges = badges
      .filter((badge) => badge.unlocked)
      .sort(
        (a, b) =>
          new Date(b.awardedAt ?? 0).getTime() -
          new Date(a.awardedAt ?? 0).getTime()
      )
    const lockedBadgeGoals = badges
      .filter((badge) => !badge.unlocked)
      .map((badge) => {
        const progress = getBadgeProgress(overview, badge)
        if (!progress) return null
        return {
          ...progress,
          badgeName: badge.name,
          progressRatio:
            progress.total > 0 ? progress.current / progress.total : 0,
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => b.progressRatio - a.progressRatio)

    const levelBaseXp = (overview.level - 1) * 1000
    const xpToNextLevel = Math.max(overview.nextLevelXp - overview.xp, 0)

    const goals = [
      {
        title: `冲击 Lv ${overview.level + 1}`,
        subtitle: `再拿 ${xpToNextLevel} XP 即可升级`,
        xp: Math.max(120, xpToNextLevel),
        progress: Math.max(overview.xp - levelBaseXp, 0),
        total: Math.max(overview.nextLevelXp - levelBaseXp, 1),
        href: '/dashboard/practice',
        cta: '去刷题',
        icon: BookOpen,
        color: 'text-blue-300 bg-blue-400/10',
      },
      ...lockedBadgeGoals.slice(0, 2).map((goal) => ({
        title: goal.title,
        subtitle: goal.subtitle,
        xp: goal.xp,
        progress: goal.current,
        total: goal.total,
        href: goal.href,
        cta: goal.cta,
        icon: goal.icon,
        color: goal.color,
      })),
    ].slice(0, 3)

    return {
      levelProgress: calculateLevelProgress(overview.xp),
      unlockedCount: unlockedBadges.length,
      recentBadgeName: unlockedBadges[0]?.name ?? null,
      nextBadgeName: lockedBadgeGoals[0]?.badgeName ?? null,
      goals,
    }
  }, [badges, overview])

  const rivalTarget = useMemo(() => {
    if (!previousRankEntry || !meEntry || !myGapToPrevious) return null
    return {
      name: previousRankEntry.name,
      rank: previousRankEntry.rank,
      xpGap: myGapToPrevious,
      avatar: previousRankEntry.avatar,
      hint: '优先做一组高收益练习或完成最近的徽章目标。',
      href: '/dashboard/practice',
      cta: '去赚 XP',
    }
  }, [meEntry, myGapToPrevious, previousRankEntry])

  return (
    <div className="relative mx-auto max-w-7xl animate-fade-in-up pb-12">
      {/* 1. Header: The Journey & Context */}
      <div className="mb-8 space-y-6">
        {/* Tier Roadmap */}
        <TierRoadmap
          tiers={tiers}
          currentTierIndex={currentTierIndex}
          standingLabel={myRank ? `#${myRank}` : '尚未上榜'}
          promotionLabel={
            myGapToPrevious
              ? `还差 ${myGapToPrevious} XP 追上前一名`
              : '完成挑战后会自动锁定追赶目标'
          }
        />

        {/* Season Banner */}
        <SeasonBanner seasonData={seasonData} />

        <div className="flex flex-wrap items-center gap-2">
          {(['WEEKLY', 'MONTHLY', 'ALL_TIME'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors ${
                period === p
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
              }`}
            >
              {p === 'WEEKLY' ? '周榜' : p === 'MONTHLY' ? '月榜' : '总榜'}
            </button>
          ))}
          {myRank ? (
            <span className="text-xs text-slate-500">我的排名：#{myRank}</span>
          ) : null}
        </div>
      </div>

      {/* 2. Main Content Area */}
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/* Left Column: The Arena (Leaderboard) - 8 cols (approx 70%) */}
        <div className="space-y-4 lg:col-span-8">
          {loading && rankedUsers.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 p-6 text-sm text-slate-500 dark:border-slate-700">
              正在加载排行榜...
            </div>
          ) : rankedUsers.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 p-6 text-sm text-slate-500 dark:border-slate-700">
              暂无排行榜数据，先去完成一组练习吧。
            </div>
          ) : (
            <>
              {error ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
                  {error}
                </div>
              ) : null}
              <Podium topThree={topThree} />
              <LeaderboardList
                listData={listData}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                myGapToPrevious={myGapToPrevious}
              />
            </>
          )}
        </div>

        {/* Right Column: The HUD - 4 cols (approx 30%) */}
        <div className="space-y-6 lg:col-span-4">
          {overview && growthSummary ? (
            <>
              <XPBreakdown
                level={overview.level}
                xp={overview.xp}
                nextLevelXp={overview.nextLevelXp}
                levelProgress={growthSummary.levelProgress}
                unlockedCount={growthSummary.unlockedCount}
                totalBadges={badges.length}
                streak={overview.streak}
                accuracy={overview.accuracy}
                recentBadgeName={growthSummary.recentBadgeName}
                nextBadgeName={growthSummary.nextBadgeName}
              />
              <DailyQuests quests={growthSummary.goals} />
            </>
          ) : (
            <DailyQuests
              quests={[
                {
                  title: '完成一组练习',
                  subtitle: '先跑出第一笔 XP，系统才会为你生成成长建议',
                  xp: 80,
                  progress: 0,
                  total: 1,
                  href: '/dashboard/practice',
                  cta: '去练习',
                  icon: Target,
                  color: 'text-purple-300 bg-purple-400/10',
                },
                {
                  title: '参与一次社区互动',
                  subtitle: '发帖或评论都能解锁更多成长任务',
                  xp: 40,
                  progress: 0,
                  total: 1,
                  href: '/dashboard/community',
                  cta: '去社区',
                  icon: MessageCircle,
                  color: 'text-sky-300 bg-sky-400/10',
                },
              ]}
            />
          )}

          <RivalWatch rival={rivalTarget} />
        </div>
      </div>
    </div>
  )
}
