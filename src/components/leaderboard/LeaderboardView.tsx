'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Target, Zap, MessageCircle } from 'lucide-react'
import { TierRoadmap } from './components/TierRoadmap'
import { SeasonBanner } from './components/SeasonBanner'
import { Podium } from './components/Podium'
import { LeaderboardList } from './components/LeaderboardList'
import { XPBreakdown } from './components/XPBreakdown'
import { DailyQuests } from './components/DailyQuests'
import { RivalWatch } from './components/RivalWatch'
import type { LeaderboardEntryWithUser } from '@/actions/leaderboard'

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
const quests = [
  { title: 'Kill 3 Errors', xp: 120, progress: 1, total: 3, icon: Zap, color: 'text-orange-400 bg-orange-400/10' },
  { title: 'Upvote 3 Helpful Posts', xp: 30, progress: 0, total: 3, icon: MessageCircle, color: 'text-blue-400 bg-blue-400/10' },
  { title: 'Complete 1 Quiz', xp: 150, progress: 0, total: 1, icon: Target, color: 'text-purple-400 bg-purple-400/10' },
]

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

export const LeaderboardView = ({
  currentUser,
  initialPeriod = 'WEEKLY',
  initialEntries = [],
  initialMyRank = null,
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
      avatar: entry.user.avatar || `https://i.pravatar.cc/150?u=${entry.user.id}`,
      trend: 'same',
      status: getStatusByRank(entry.rank),
      isMe: entry.user.id === currentUser.id,
    })),
  )
  const [myRank, setMyRank] = useState<number | null>(initialMyRank)
  const requestKey = useMemo(() => `${period}:100`, [period])
  const lastLoadedKeyRef = useRef<string>(
    initialEntries.length > 0 ? `${initialPeriod}:100` : '',
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
        const response = await fetch(
          `/api/leaderboard/summary?period=${encodeURIComponent(period)}&limit=100`,
          {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
          },
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
          avatar: entry.user.avatar || `https://i.pravatar.cc/150?u=${entry.user.id}`,
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
            avatar: currentUser.avatar || `https://i.pravatar.cc/150?u=${currentUser.id}`,
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
          setError('Failed to load leaderboard')
          setRankedUsers([])
          setMyRank(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadLeaderboard()
    return () => {
      cancelled = true
    }
  }, [currentUser.avatar, currentUser.id, currentUser.username, requestKey, period])

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

  return (
    <div className="animate-fade-in-up pb-12 relative max-w-7xl mx-auto">
      {/* 1. Header: The Journey & Context */}
      <div className="mb-8 space-y-6">
        {/* Tier Roadmap */}
        <TierRoadmap tiers={tiers} currentTierIndex={currentTierIndex} />

        {/* Season Banner */}
        <SeasonBanner seasonData={seasonData} />

        <div className="flex flex-wrap items-center gap-2">
          {(['WEEKLY', 'MONTHLY', 'ALL_TIME'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
                period === p
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700'
              }`}
            >
              {p === 'WEEKLY' ? '周榜' : p === 'MONTHLY' ? '月榜' : '总榜'}
            </button>
          ))}
          {myRank ? <span className="text-xs text-slate-500">我的排名：#{myRank}</span> : null}
        </div>
      </div>

      {/* 2. Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: The Arena (Leaderboard) - 8 cols (approx 70%) */}
        <div className="lg:col-span-8 space-y-4">
          {loading ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-6 text-sm text-slate-500">
              正在加载排行榜...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30 p-6 text-sm text-red-600 dark:text-red-300">
              {error}
            </div>
          ) : rankedUsers.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-6 text-sm text-slate-500">
              暂无排行榜数据，先去完成一组练习吧。
            </div>
          ) : (
            <>
              <Podium topThree={topThree} />
              <LeaderboardList
                listData={listData}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            </>
          )}
        </div>

        {/* Right Column: The HUD - 4 cols (approx 30%) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Widget 1: My Performance (Donut) */}
          <XPBreakdown />

          {/* Widget 2: Daily Quests (Action Trigger) */}
          <DailyQuests quests={quests} />

          {/* Widget 3: Rival Watch */}
          <RivalWatch />
        </div>
      </div>
    </div>
  )
}
