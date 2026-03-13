'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  BookOpen,
  MessageCircle,
  Target,
  Trophy,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { useApp } from '@/providers'
import { TierRoadmap } from './components/TierRoadmap'
import { LeaderboardList } from './components/LeaderboardList'
import { XPBreakdown } from './components/XPBreakdown'
import { FocusPanel } from './components/FocusPanel'
import { PageHeroShell } from '@/components/shared/PageHeroShell'
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

type PeriodKey = 'WEEKLY' | 'MONTHLY' | 'ALL_TIME'

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

interface RankedUser {
  rank: number
  name: string
  xp: number
  avatar: string
  trend: 'up' | 'down' | 'same'
  status: 'promotion' | 'demotion' | 'safe'
  isMe?: boolean
  isRival?: boolean
}

interface FocusChallenge {
  title: string
  subtitle: string
  xp: number
  progress: number
  total: number
  href: string
  cta: string
  icon: LucideIcon
  color: string
}

function mapEntriesToRankedUsers(
  entries: LeaderboardEntryWithUser[],
  currentUserId: string
): RankedUser[] {
  return entries.map((entry) => ({
    rank: entry.rank,
    name: entry.user.username || 'Anonymous',
    xp: entry.score,
    avatar: entry.user.avatar || `https://i.pravatar.cc/150?u=${entry.user.id}`,
    trend: 'same',
    status: getStatusByRank(entry.rank),
    isMe: entry.user.id === currentUserId,
  }))
}

const copyByLang = {
  zh: {
    tierTitle: '当前段位',
    tiers: ['青铜', '白银', '黄金', '铂金', '钻石', '王者'],
    title: '排行榜',
    heroBadge: 'Competitive Ladder',
    heroSubtitle: '查看当前段位、追赶目标与成长进度，决定下一轮最值得做的动作。',
    rankLabel: '排名',
    studentLabel: '学员',
    xpLabel: '经验值',
    filterLabel: '筛选',
    globalLabel: '全站',
    friendsLabel: '同学',
    periods: {
      WEEKLY: '周榜',
      MONTHLY: '月榜',
      ALL_TIME: '总榜',
    } as Record<PeriodKey, string>,
    emptyLeaderboard: '暂无排行榜数据，先去完成一组练习吧。',
    loadingLeaderboard: '正在加载排行榜...',
    staleError: '请求超时，已保留上次排行榜数据',
    genericError: '排行榜加载失败',
    unranked: '尚未上榜',
    myRank: (rank: number) => `当前第 ${rank} 名`,
    promotionLabel: (gap: number | null) =>
      gap
        ? `还差 ${gap} XP 就能追上前一名`
        : '先做一轮练习，系统会自动锁定追赶目标',
    growthTitle: '个人成长总览',
    levelLabel: 'Lv',
    xpText: '当前 XP',
    streakLabel: '连胜',
    accuracyLabel: '正确率',
    unlockedLabel: '徽章',
    nextFocusLabel: '下一步重点',
    recentUnlockLabel: '最近解锁：',
    viewAllLabel: '查看全部成就',
    nextLevelText: (xp: number) => `离下一级还差 ${xp} XP`,
    fallbackFocusText: '继续积累 XP，向下一等级推进',
    fallbackRecentText: '完成练习、社区互动和连胜都能加速成长。',
    challengeLabel: '推荐挑战',
    challengeBadge: '先做最接近完成的目标',
    rivalLabel: '追赶目标',
    rivalHint: '优先做一组高收益练习或完成最近的徽章目标。',
    rivalLeadText: (gap: number) => `只领先你 ${gap} XP`,
    rivalCta: '去赚 XP',
    rivalEmpty:
      '先完成一轮练习并进入排行榜，系统会自动为你锁定最值得追赶的目标。',
    rivalEmptyCta: '去做练习',
    safeZone: '稳定区',
    promotionZone: '晋级区',
    demotionRisk: '降级风险',
    youBadge: '我',
    rivalBadge: '追赶目标',
    meFooter: '当前自己',
    meGapText: (gap: number, rank: number) =>
      `还差 ${gap} XP 追上第 ${rank - 1} 名`,
    meFallback: '继续完成挑战，保持当前势头',
    defaultGoals: [
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
    ],
  },
  en: {
    tierTitle: 'Current Tier',
    tiers: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Challenger'],
    title: 'Leaderboard',
    heroBadge: 'Competitive Ladder',
    heroSubtitle:
      'Review your current tier, rival target, and growth signals before the next push.',
    rankLabel: 'Rank',
    studentLabel: 'Student',
    xpLabel: 'XP',
    filterLabel: 'Filter',
    globalLabel: 'Global',
    friendsLabel: 'Friends',
    periods: {
      WEEKLY: 'Weekly',
      MONTHLY: 'Monthly',
      ALL_TIME: 'All Time',
    } as Record<PeriodKey, string>,
    emptyLeaderboard:
      'No leaderboard data yet. Finish a practice set to get ranked.',
    loadingLeaderboard: 'Loading leaderboard...',
    staleError: 'Request timed out. Keeping the latest leaderboard snapshot.',
    genericError: 'Failed to load leaderboard.',
    unranked: 'Not ranked yet',
    myRank: (rank: number) => `Now ranked #${rank}`,
    promotionLabel: (gap: number | null) =>
      gap
        ? `${gap} XP to catch the next player`
        : 'Finish a practice round to lock your rival target',
    growthTitle: 'Growth Overview',
    levelLabel: 'Lv',
    xpText: 'Current XP',
    streakLabel: 'Streak',
    accuracyLabel: 'Accuracy',
    unlockedLabel: 'Badges',
    nextFocusLabel: 'Next Focus',
    recentUnlockLabel: 'Recent unlock: ',
    viewAllLabel: 'View achievements',
    nextLevelText: (xp: number) => `${xp} XP to the next level`,
    fallbackFocusText: 'Keep stacking XP and move to the next level.',
    fallbackRecentText:
      'Practice, community actions and streaks all help you climb.',
    challengeLabel: 'Recommended Challenges',
    challengeBadge: 'Start with the closest win',
    rivalLabel: 'Rival Target',
    rivalHint:
      'Do one high-yield practice run or finish the closest badge goal.',
    rivalLeadText: (gap: number) => `Only ${gap} XP ahead of you`,
    rivalCta: 'Earn XP',
    rivalEmpty:
      'Finish one practice round and enter the leaderboard to unlock your best chase target.',
    rivalEmptyCta: 'Start practice',
    safeZone: 'Safe Zone',
    promotionZone: 'Promotion Zone',
    demotionRisk: 'Demotion Risk',
    youBadge: 'YOU',
    rivalBadge: 'RIVAL',
    meFooter: 'Current position',
    meGapText: (gap: number, rank: number) =>
      `${gap} XP to reach rank #${rank - 1}`,
    meFallback: 'Keep completing challenges and hold your pace.',
    defaultGoals: [
      {
        title: 'Finish one practice set',
        subtitle: 'Your first XP unlocks the rest of the growth guidance',
        xp: 80,
        progress: 0,
        total: 1,
        href: '/dashboard/practice',
        cta: 'Practice',
        icon: Target,
        color: 'text-purple-300 bg-purple-400/10',
      },
      {
        title: 'Join one community action',
        subtitle: 'Post or comment once to open more growth goals',
        xp: 40,
        progress: 0,
        total: 1,
        href: '/dashboard/community',
        cta: 'Community',
        icon: MessageCircle,
        color: 'text-sky-300 bg-sky-400/10',
      },
    ],
  },
  ms: {
    tierTitle: 'Tier Semasa',
    tiers: ['Gangsa', 'Perak', 'Emas', 'Platinum', 'Berlian', 'Juara'],
    title: 'Carta Kedudukan',
    heroBadge: 'Competitive Ladder',
    heroSubtitle:
      'Lihat tier semasa, sasaran kejar dan kemajuan pertumbuhan sebelum pusingan seterusnya.',
    rankLabel: 'Rank',
    studentLabel: 'Pelajar',
    xpLabel: 'XP',
    filterLabel: 'Tapis',
    globalLabel: 'Global',
    friendsLabel: 'Rakan',
    periods: {
      WEEKLY: 'Mingguan',
      MONTHLY: 'Bulanan',
      ALL_TIME: 'Semua Masa',
    } as Record<PeriodKey, string>,
    emptyLeaderboard:
      'Belum ada data carta. Selesaikan satu set latihan untuk masuk carta.',
    loadingLeaderboard: 'Memuatkan carta kedudukan...',
    staleError: 'Permintaan tamat masa. Paparan carta terkini dikekalkan.',
    genericError: 'Gagal memuatkan carta kedudukan.',
    unranked: 'Belum tersenarai',
    myRank: (rank: number) => `Kini di tempat #${rank}`,
    promotionLabel: (gap: number | null) =>
      gap
        ? `${gap} XP lagi untuk kejar pemain di atas`
        : 'Lengkapkan satu latihan untuk buka sasaran kejaran',
    growthTitle: 'Ringkasan Perkembangan',
    levelLabel: 'Lv',
    xpText: 'XP Semasa',
    streakLabel: 'Streak',
    accuracyLabel: 'Ketepatan',
    unlockedLabel: 'Lencana',
    nextFocusLabel: 'Fokus Seterusnya',
    recentUnlockLabel: 'Baru dibuka: ',
    viewAllLabel: 'Lihat pencapaian',
    nextLevelText: (xp: number) => `${xp} XP lagi ke tahap seterusnya`,
    fallbackFocusText: 'Kumpul lagi XP untuk naik ke tahap seterusnya.',
    fallbackRecentText:
      'Latihan, interaksi komuniti dan streak membantu anda naik lebih cepat.',
    challengeLabel: 'Cabaran Disyorkan',
    challengeBadge: 'Mulakan dengan sasaran paling hampir',
    rivalLabel: 'Sasaran Kejaran',
    rivalHint:
      'Buat satu latihan berimpak tinggi atau lengkapkan lencana yang paling hampir.',
    rivalLeadText: (gap: number) => `Hanya ${gap} XP di hadapan anda`,
    rivalCta: 'Dapatkan XP',
    rivalEmpty:
      'Lengkapkan satu latihan dan masuk carta untuk sistem kunci sasaran kejaran terbaik anda.',
    rivalEmptyCta: 'Pergi berlatih',
    safeZone: 'Zon Selamat',
    promotionZone: 'Zon Kenaikan',
    demotionRisk: 'Risiko Penurunan',
    youBadge: 'ANDA',
    rivalBadge: 'RIVAL',
    meFooter: 'Kedudukan semasa',
    meGapText: (gap: number, rank: number) =>
      `${gap} XP lagi untuk capai rank #${rank - 1}`,
    meFallback: 'Terus lengkapkan cabaran dan kekalkan momentum.',
    defaultGoals: [
      {
        title: 'Selesaikan satu set latihan',
        subtitle: 'XP pertama anda akan membuka panduan perkembangan penuh',
        xp: 80,
        progress: 0,
        total: 1,
        href: '/dashboard/practice',
        cta: 'Latih',
        icon: Target,
        color: 'text-purple-300 bg-purple-400/10',
      },
      {
        title: 'Sertai satu interaksi komuniti',
        subtitle: 'Tulis post atau komen sekali untuk buka sasaran baru',
        xp: 40,
        progress: 0,
        total: 1,
        href: '/dashboard/community',
        cta: 'Komuniti',
        icon: MessageCircle,
        color: 'text-sky-300 bg-sky-400/10',
      },
    ],
  },
} as const

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

export const LeaderboardView = ({
  currentUser,
  initialPeriod = 'WEEKLY',
  initialEntries = [],
  initialMyRank = null,
  overview = null,
  badges = [],
}: LeaderboardViewProps) => {
  const { lang } = useApp()
  const copy = copyByLang[lang as keyof typeof copyByLang] ?? copyByLang.zh
  const [activeTab, setActiveTab] = useState<'global' | 'friends'>('global')
  const [focusTab, setFocusTab] = useState<'challenge' | 'rival'>('challenge')
  const [period, setPeriod] = useState<PeriodKey>(initialPeriod)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mockFallbackUsers = useMemo(
    () => mapEntriesToRankedUsers(initialEntries, currentUser.id),
    [currentUser.id, initialEntries]
  )
  const [rankedUsers, setRankedUsers] =
    useState<RankedUser[]>(mockFallbackUsers)
  const [myRank, setMyRank] = useState<number | null>(initialMyRank)
  const requestKey = useMemo(() => `${period}:100`, [period])
  const lastLoadedKeyRef = useRef<string>(
    initialEntries.length > 0 ? `${initialPeriod}:100` : ''
  )

  useEffect(() => {
    let cancelled = false
    const shouldSkipFetch = requestKey === lastLoadedKeyRef.current
    if (shouldSkipFetch) return
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

        const mapped: RankedUser[] = mapEntriesToRankedUsers(
          entries,
          currentUser.id
        )

        if (me && !mapped.some((user) => user.isMe)) {
          mapped.push({
            rank: me.rank,
            name: currentUser.username || copy.youBadge,
            xp: me.score,
            avatar:
              currentUser.avatar ||
              `https://i.pravatar.cc/150?u=${currentUser.id}`,
            trend: 'same',
            status: getStatusByRank(me.rank),
            isMe: true,
          })
        }

        const fallbackMe = mockFallbackUsers.find((user) => user.isMe) ?? null
        const resolvedUsers =
          mapped.length > 0
            ? mapped
            : mockFallbackUsers.map((user) => ({
                ...user,
                rank:
                  period === 'MONTHLY'
                    ? user.rank + 2
                    : period === 'ALL_TIME'
                      ? Math.max(1, user.rank - 1)
                      : user.rank,
                xp:
                  period === 'MONTHLY'
                    ? user.xp - 420
                    : period === 'ALL_TIME'
                      ? user.xp + 960
                      : user.xp,
                status: getStatusByRank(
                  period === 'MONTHLY'
                    ? user.rank + 2
                    : period === 'ALL_TIME'
                      ? Math.max(1, user.rank - 1)
                      : user.rank
                ),
              }))

        setMyRank(me?.rank ?? fallbackMe?.rank ?? null)
        setRankedUsers(resolvedUsers.sort((a, b) => a.rank - b.rank))
      } catch (cause) {
        console.error('Failed to load leaderboard:', cause)
        lastLoadedKeyRef.current = ''
        if (!cancelled) {
          setError(
            isAbortLikeError(cause) ? copy.staleError : copy.genericError
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
    copy.genericError,
    copy.staleError,
    copy.youBadge,
    currentUser.avatar,
    currentUser.id,
    currentUser.username,
    mockFallbackUsers,
    period,
    requestKey,
  ])

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

    const getBadgeProgress = (badge: BadgeWithUnlockStatus) => {
      switch (badge.code) {
        case 'first_practice':
          return {
            current: Math.min(overview.questions, 1),
            total: 1,
            title:
              lang === 'zh'
                ? '完成首次练习'
                : lang === 'ms'
                  ? 'Selesaikan latihan pertama'
                  : 'Finish first practice',
            subtitle:
              overview.questions > 0
                ? lang === 'zh'
                  ? '已经完成，继续保持学习节奏'
                  : lang === 'ms'
                    ? 'Sudah selesai, teruskan rentak belajar'
                    : 'Completed already, keep your learning pace'
                : lang === 'zh'
                  ? '先做一组练习，点亮成长记录'
                  : lang === 'ms'
                    ? 'Buat satu latihan untuk hidupkan rekod pertumbuhan'
                    : 'Do one practice set to activate your growth path',
            href: '/dashboard/practice',
            cta:
              lang === 'zh' ? '去练习' : lang === 'ms' ? 'Latih' : 'Practice',
            icon: Target,
            color: 'text-purple-300 bg-purple-400/10',
            xp: 80,
            badgeName: badge.name,
          }
        case 'practice_master_100':
          return {
            current: Math.min(overview.correctAnswers, 100),
            total: 100,
            title: lang === 'zh' ? '冲刺 Practice Master' : badge.name,
            subtitle:
              lang === 'zh'
                ? `再答对 ${Math.max(100 - overview.correctAnswers, 0)} 题即可解锁`
                : lang === 'ms'
                  ? `${Math.max(100 - overview.correctAnswers, 0)} jawapan betul lagi untuk buka`
                  : `${Math.max(100 - overview.correctAnswers, 0)} more correct answers to unlock`,
            href: '/dashboard/practice',
            cta:
              lang === 'zh'
                ? '继续刷题'
                : lang === 'ms'
                  ? 'Teruskan latihan'
                  : 'Keep drilling',
            icon: Zap,
            color: 'text-orange-300 bg-orange-400/10',
            xp: 160,
            badgeName: badge.name,
          }
        case 'streak_7_days':
          return {
            current: Math.min(overview.streak, 7),
            total: 7,
            title:
              lang === 'zh'
                ? '保持 7 天连胜'
                : lang === 'ms'
                  ? 'Kekalkan streak 7 hari'
                  : 'Keep a 7-day streak',
            subtitle:
              lang === 'zh'
                ? `再坚持 ${Math.max(7 - overview.streak, 0)} 天就能点亮连胜徽章`
                : lang === 'ms'
                  ? `${Math.max(7 - overview.streak, 0)} hari lagi untuk buka lencana streak`
                  : `${Math.max(7 - overview.streak, 0)} more days to unlock the streak badge`,
            href: '/dashboard',
            cta:
              lang === 'zh'
                ? '继续学习'
                : lang === 'ms'
                  ? 'Terus belajar'
                  : 'Keep learning',
            icon: Trophy,
            color: 'text-emerald-300 bg-emerald-400/10',
            xp: 120,
            badgeName: badge.name,
          }
        case 'community_helper_10':
          return {
            current: Math.min(overview.posts + overview.comments, 10),
            total: 10,
            title:
              lang === 'zh'
                ? '完成社区互动'
                : lang === 'ms'
                  ? 'Lengkapkan interaksi komuniti'
                  : 'Complete community actions',
            subtitle:
              lang === 'zh'
                ? `再互动 ${Math.max(10 - (overview.posts + overview.comments), 0)} 次即可解锁`
                : lang === 'ms'
                  ? `${Math.max(10 - (overview.posts + overview.comments), 0)} interaksi lagi untuk buka`
                  : `${Math.max(10 - (overview.posts + overview.comments), 0)} more interactions to unlock`,
            href: '/dashboard/community',
            cta:
              lang === 'zh'
                ? '去社区'
                : lang === 'ms'
                  ? 'Komuniti'
                  : 'Community',
            icon: MessageCircle,
            color: 'text-sky-300 bg-sky-400/10',
            xp: 90,
            badgeName: badge.name,
          }
        default:
          return null
      }
    }

    const lockedBadgeGoals = badges
      .filter((badge) => !badge.unlocked)
      .map(getBadgeProgress)
      .filter((goal): goal is NonNullable<typeof goal> => goal !== null)
      .sort(
        (a, b) =>
          b.current / Math.max(b.total, 1) - a.current / Math.max(a.total, 1)
      )

    const levelBaseXp = (overview.level - 1) * 1000
    const xpToNextLevel = Math.max(overview.nextLevelXp - overview.xp, 0)

    const goals: FocusChallenge[] = [
      {
        title:
          lang === 'zh'
            ? `冲击 Lv ${overview.level + 1}`
            : lang === 'ms'
              ? `Kejar Lv ${overview.level + 1}`
              : `Push to Lv ${overview.level + 1}`,
        subtitle:
          lang === 'zh'
            ? `再拿 ${xpToNextLevel} XP 即可升级`
            : lang === 'ms'
              ? `${xpToNextLevel} XP lagi untuk naik tahap`
              : `${xpToNextLevel} XP more to level up`,
        xp: Math.max(120, xpToNextLevel),
        progress: Math.max(overview.xp - levelBaseXp, 0),
        total: Math.max(overview.nextLevelXp - levelBaseXp, 1),
        href: '/dashboard/practice',
        cta:
          lang === 'zh'
            ? '去刷题'
            : lang === 'ms'
              ? 'Pergi latihan'
              : 'Practice',
        icon: BookOpen,
        color: 'text-blue-300 bg-blue-400/10',
      },
      ...lockedBadgeGoals.slice(0, 1).map((goal) => ({
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
    ]

    return {
      levelProgress: calculateLevelProgress(overview.xp),
      unlockedCount: unlockedBadges.length,
      recentBadgeName: unlockedBadges[0]?.name ?? null,
      nextBadgeName: lockedBadgeGoals[0]?.badgeName ?? null,
      goals,
    }
  }, [badges, lang, overview])

  const rivalTarget = useMemo(() => {
    if (!previousRankEntry || !meEntry || !myGapToPrevious) return null
    return {
      name: previousRankEntry.name,
      rank: previousRankEntry.rank,
      xpGap: myGapToPrevious,
      avatar: previousRankEntry.avatar,
      hint: copy.rivalHint,
      href: '/dashboard/practice',
      cta: copy.rivalCta,
    }
  }, [
    copy.rivalCta,
    copy.rivalHint,
    meEntry,
    myGapToPrevious,
    previousRankEntry,
  ])

  const listData = useMemo(
    () =>
      rankedUsers.map((user) => ({
        ...user,
        isRival: rivalTarget ? user.rank === rivalTarget.rank : false,
      })),
    [rankedUsers, rivalTarget]
  )

  return (
    <div className="relative mx-auto max-w-[1500px] animate-fade-in-up lg:h-[calc(100vh-7.5rem)]">
      <div className="flex h-full min-h-0 flex-col gap-4">
        <PageHeroShell
          className="px-4 py-3 sm:px-5 sm:py-3.5"
          eyebrow={
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium text-blue-100/78">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              {copy.heroBadge}
            </div>
          }
          title={copy.title}
          subtitle={copy.heroSubtitle}
          actions={
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium text-blue-100/72">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              {myRank ? copy.myRank(myRank) : copy.unranked}
            </div>
          }
        />

        <TierRoadmap
          tiers={[...copy.tiers]}
          currentTierIndex={currentTierIndex}
          title={copy.tierTitle}
          currentTierLabel={copy.tiers[currentTierIndex] || copy.tiers[0]}
          standingLabel={myRank ? copy.myRank(myRank) : copy.unranked}
          promotionLabel={copy.promotionLabel(myGapToPrevious)}
        />

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.5fr)_360px]">
          <div className="min-h-0">
            {error ? (
              <div className="mb-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
                {error}
              </div>
            ) : null}

            <LeaderboardList
              title={copy.title}
              rankLabel={copy.rankLabel}
              studentLabel={copy.studentLabel}
              xpLabel={copy.xpLabel}
              filterLabel={copy.filterLabel}
              globalLabel={copy.globalLabel}
              friendsLabel={copy.friendsLabel}
              emptyLabel={copy.emptyLeaderboard}
              loadingLabel={copy.loadingLeaderboard}
              safeZoneLabel={copy.safeZone}
              promotionZoneLabel={copy.promotionZone}
              demotionRiskLabel={copy.demotionRisk}
              youBadge={copy.youBadge}
              rivalBadge={copy.rivalBadge}
              meFooterLabel={copy.meFooter}
              meGapText={copy.meGapText}
              meFallbackText={copy.meFallback}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              period={period}
              onPeriodChange={setPeriod}
              periodLabels={copy.periods}
              listData={listData}
              loading={loading && listData.length === 0}
              myGapToPrevious={myGapToPrevious}
            />
          </div>

          <div className="flex min-h-0 flex-col gap-4">
            {overview && growthSummary ? (
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
                title={copy.growthTitle}
                levelLabel={copy.levelLabel}
                xpLabel={copy.xpText}
                streakLabel={copy.streakLabel}
                accuracyLabel={copy.accuracyLabel}
                unlockedLabel={copy.unlockedLabel}
                nextFocusLabel={copy.nextFocusLabel}
                recentUnlockLabel={copy.recentUnlockLabel}
                viewAllLabel={copy.viewAllLabel}
                nextLevelText={copy.nextLevelText}
                fallbackFocusText={copy.fallbackFocusText}
                fallbackRecentText={copy.fallbackRecentText}
              />
            ) : null}

            <FocusPanel
              activeTab={focusTab}
              onTabChange={setFocusTab}
              challengeLabel={copy.challengeLabel}
              rivalLabel={copy.rivalLabel}
              challengeBadge={copy.challengeBadge}
              challenges={growthSummary?.goals ?? [...copy.defaultGoals]}
              rival={rivalTarget}
              rivalEmptyDescription={copy.rivalEmpty}
              rivalEmptyCta={copy.rivalEmptyCta}
              rivalLeadText={copy.rivalLeadText}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
