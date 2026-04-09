'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  BookOpen,
  RefreshCw,
  MessageCircle,
  Target,
  Trophy,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/providers'
import { Button } from '@/components/ui/button'
import { TierRoadmap } from './components/TierRoadmap'
import { LeaderboardList } from './components/LeaderboardList'
import { XPBreakdown } from './components/XPBreakdown'
import { FocusPanel } from './components/FocusPanel'
import { PageHeroShell } from '@/components/shared/PageHeroShell'
import { PageHeroTitle } from '@/components/shared/PageHeroTitle'
import {
  pageMetaTextClass,
  pageSectionDescriptionClass,
} from '@/components/shared/pageTypography'
import {
  pageBadgeClass,
  pageHeroShellClass,
  pageShellFrameClass,
} from '@/components/shared/pageSurfaces'
import {
  pageGridGapClass,
  pageSectionGapClass,
} from '@/components/shared/pageSpacing'
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

type LeaderboardErrorKind = 'timeout' | 'unauthorized' | 'generic'

interface LeaderboardErrorState {
  kind: LeaderboardErrorKind
  message: string
}

interface RankedUser {
  rank: number
  name: string
  xp: number
  avatar: string | null
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
    avatar: entry.user.avatar || null,
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
    heroSubtitle:
      '查看当前段位、排名、追赶目标与下一步行动，不重复展示 sidebar 的 XP 进度。',
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
    emptyLeaderboard:
      '暂无排行榜数据，先完成练习后系统会自动生成排名与追赶目标。',
    loadingLeaderboard: '正在加载排行榜与追赶目标...',
    staleError: '请求超时，已保留最近一次榜单快照。',
    genericError: '排行榜加载失败，请稍后重试。',
    loginRequiredTitle: '登录已失效',
    loginRequiredBody: '请重新登录后继续查看排行榜。',
    refreshLabel: '刷新榜单',
    retryLabel: '重试',
    loginLabel: '去登录',
    unranked: '尚未上榜',
    myRank: (rank: number) => `当前第 ${rank} 名`,
    promotionLabel: (gap: number | null) =>
      gap
        ? `还差 ${gap} XP 就能追上前一名`
        : '先做一轮练习，系统会自动锁定追赶目标',
    growthTitle: '排行榜行动概览',
    levelLabel: 'Lv',
    xpText: '当前 XP',
    streakLabel: '连胜',
    accuracyLabel: '正确率',
    unlockedLabel: '徽章',
    nextFocusLabel: '下一步行动',
    recentUnlockLabel: '最近解锁：',
    viewAllLabel: '查看全部成就',
    nextLevelText: (xp: number) => `离下一级还差 ${xp} XP`,
    challengeEmptyDescription: '完成练习或社区互动后，这里会自动生成推荐动作。',
    challengeEmptyCta: '去练习',
    challengeLabel: '推荐动作',
    challengeBadge: '优先处理最接近完成的动作',
    rivalLabel: '追赶目标',
    rivalHint: '优先做高收益练习或完成最近的徽章目标。',
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
  },
  en: {
    tierTitle: 'Current Tier',
    tiers: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Challenger'],
    title: 'Leaderboard',
    heroBadge: 'Competitive Ladder',
    heroSubtitle:
      'Review your current tier, rank, chase target, and next action without duplicating the sidebar XP card.',
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
      'No leaderboard data yet. Finish a practice set and the system will generate a rank and chase target.',
    loadingLeaderboard: 'Loading leaderboard and chase target...',
    staleError: 'Request timed out. Keeping the latest leaderboard snapshot.',
    genericError: 'Failed to load leaderboard. Please try again later.',
    loginRequiredTitle: 'Login expired',
    loginRequiredBody: 'Please sign in again to view the leaderboard.',
    refreshLabel: 'Refresh',
    retryLabel: 'Retry',
    loginLabel: 'Sign in',
    unranked: 'Not ranked yet',
    myRank: (rank: number) => `Now ranked #${rank}`,
    promotionLabel: (gap: number | null) =>
      gap
        ? `${gap} XP to catch the next player`
        : 'Finish a practice round to lock your rival target',
    growthTitle: 'Leaderboard Action Overview',
    levelLabel: 'Lv',
    xpText: 'Current XP',
    streakLabel: 'Streak',
    accuracyLabel: 'Accuracy',
    unlockedLabel: 'Badges',
    nextFocusLabel: 'Next Action',
    recentUnlockLabel: 'Recent unlock: ',
    viewAllLabel: 'View achievements',
    nextLevelText: (xp: number) => `${xp} XP to the next level`,
    challengeEmptyDescription:
      'Finish a practice or community action and the system will generate recommended actions.',
    challengeEmptyCta: 'Practice',
    challengeLabel: 'Recommended Actions',
    challengeBadge: 'Prioritize the closest win',
    rivalLabel: 'Rival Target',
    rivalHint:
      'Do a high-yield practice run or finish the closest badge goal.',
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
  },
  ms: {
    tierTitle: 'Tier Semasa',
    tiers: ['Gangsa', 'Perak', 'Emas', 'Platinum', 'Berlian', 'Juara'],
    title: 'Carta Kedudukan',
    heroBadge: 'Competitive Ladder',
    heroSubtitle:
      'Lihat tier semasa, rank, sasaran kejar dan tindakan seterusnya tanpa mengulang kad XP sidebar.',
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
      'Belum ada data carta. Selesaikan latihan dan sistem akan jana rank serta sasaran kejaran.',
    loadingLeaderboard: 'Memuatkan carta kedudukan dan sasaran kejaran...',
    staleError: 'Permintaan tamat masa. Paparan carta terkini dikekalkan.',
    genericError: 'Gagal memuatkan carta kedudukan. Sila cuba lagi nanti.',
    loginRequiredTitle: 'Sesi log masuk tamat',
    loginRequiredBody: 'Sila log masuk semula untuk melihat carta kedudukan.',
    refreshLabel: 'Muat semula',
    retryLabel: 'Cuba lagi',
    loginLabel: 'Log masuk',
    unranked: 'Belum tersenarai',
    myRank: (rank: number) => `Kini di tempat #${rank}`,
    promotionLabel: (gap: number | null) =>
      gap
        ? `${gap} XP lagi untuk kejar pemain di atas`
        : 'Lengkapkan satu latihan untuk buka sasaran kejaran',
    growthTitle: 'Ringkasan Tindakan Carta',
    levelLabel: 'Lv',
    xpText: 'XP Semasa',
    streakLabel: 'Streak',
    accuracyLabel: 'Ketepatan',
    unlockedLabel: 'Lencana',
    nextFocusLabel: 'Tindakan Seterusnya',
    recentUnlockLabel: 'Baru dibuka: ',
    viewAllLabel: 'Lihat pencapaian',
    nextLevelText: (xp: number) => `${xp} XP lagi ke tahap seterusnya`,
    challengeEmptyDescription:
      'Selesaikan latihan atau interaksi komuniti dan sistem akan jana tindakan disyorkan.',
    challengeEmptyCta: 'Latih',
    challengeLabel: 'Tindakan Disyorkan',
    challengeBadge: 'Utamakan sasaran paling hampir',
    rivalLabel: 'Sasaran Kejaran',
    rivalHint:
      'Buat latihan berimpak tinggi atau lengkapkan lencana yang paling hampir.',
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
  const router = useRouter()
  const copy = copyByLang[lang as keyof typeof copyByLang] ?? copyByLang.zh
  const [activeTab, setActiveTab] = useState<'global' | 'friends'>('global')
  const [focusTab, setFocusTab] = useState<'challenge' | 'rival'>('challenge')
  const [period, setPeriod] = useState<PeriodKey>(initialPeriod)
  const [loading, setLoading] = useState(false)
  const [refreshNonce, setRefreshNonce] = useState(0)
  const [errorState, setErrorState] = useState<LeaderboardErrorState | null>(
    null
  )
  const seedLeaderboardUsers = useMemo(
    () => mapEntriesToRankedUsers(initialEntries, currentUser.id),
    [currentUser.id, initialEntries]
  )
  const [rankedUsers, setRankedUsers] =
    useState<RankedUser[]>(seedLeaderboardUsers)
  const [myRank, setMyRank] = useState<number | null>(initialMyRank)
  const requestKey = useMemo(() => `${period}:100:${refreshNonce}`, [
    period,
    refreshNonce,
  ])
  const lastLoadedKeyRef = useRef<string>(
    initialEntries.length > 0 ? `${initialPeriod}:100:0` : ''
  )
  const leaderboardLoginHref = `/login?redirectTo=${encodeURIComponent('/dashboard/leaderboard')}`

  const handleRefresh = () => {
    setRefreshNonce((current) => current + 1)
  }

  useEffect(() => {
    let cancelled = false
    const shouldSkipFetch = requestKey === lastLoadedKeyRef.current
    if (shouldSkipFetch) return
    lastLoadedKeyRef.current = requestKey

    async function loadLeaderboard() {
      setLoading(true)
      setErrorState(null)
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
          if (response.status === 401) {
            throw new Error('UNAUTHORIZED_LEADERBOARD_REQUEST')
          }
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
            avatar: currentUser.avatar || null,
            trend: 'same',
            status: getStatusByRank(me.rank),
            isMe: true,
          })
        }

        setMyRank(me?.rank ?? null)
        setRankedUsers(mapped.sort((a, b) => a.rank - b.rank))
      } catch (cause) {
        console.error('Failed to load leaderboard:', cause)
        lastLoadedKeyRef.current = ''
        if (!cancelled) {
          if (
            cause instanceof Error &&
            cause.message === 'UNAUTHORIZED_LEADERBOARD_REQUEST'
          ) {
            setErrorState({
              kind: 'unauthorized',
              message: copy.loginRequiredBody,
            })
          } else if (isAbortLikeError(cause)) {
            setErrorState({
              kind: 'timeout',
              message: copy.staleError,
            })
          } else {
            setErrorState({
              kind: 'generic',
              message: copy.genericError,
            })
          }
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
    copy.loginRequiredBody,
    copy.staleError,
    copy.youBadge,
    currentUser.avatar,
    currentUser.id,
    currentUser.username,
    period,
    requestKey,
    seedLeaderboardUsers,
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
    <div className="animate-fade-in-up">
      <div
        className={`relative mx-auto max-w-[1500px] ${pageShellFrameClass} lg:h-[calc(100vh-7.5rem)]`}
      >
        <div className={`flex h-full min-h-0 flex-col ${pageSectionGapClass}`}>
          <PageHeroShell
            className={pageHeroShellClass}
            title={
              <PageHeroTitle title={copy.title} capsuleLabel={copy.heroBadge} />
            }
            subtitle={copy.heroSubtitle}
            titleClassName="font-semibold"
            subtitleClassName={pageSectionDescriptionClass}
            actions={
              <div className="flex flex-wrap items-center gap-2">
                <div className={`${pageBadgeClass} ${pageMetaTextClass}`}>
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  {copy.globalLabel} · {copy.periods[period]}
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleRefresh}
                  className="h-9 rounded-full px-3 text-[13px]"
                  disabled={loading}
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                  {copy.refreshLabel}
                </Button>
              </div>
            }
          />

          {errorState ? (
            <div className="rounded-2xl border border-borderTone bg-surface-subtle px-4 py-3 text-sm text-text-primary dark:border-borderTone dark:bg-surface-selected dark:text-white">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="font-semibold">
                    {errorState.kind === 'unauthorized'
                      ? copy.loginRequiredTitle
                      : errorState.message}
                  </div>
                  <div className="mt-1 text-text-secondary dark:text-text-secondary">
                    {errorState.kind === 'unauthorized'
                      ? copy.loginRequiredBody
                      : errorState.kind === 'timeout'
                        ? copy.staleError
                        : copy.genericError}
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleRefresh}
                    className="rounded-full px-3"
                    disabled={loading}
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                    {copy.retryLabel}
                  </Button>
                  {errorState.kind === 'unauthorized' ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => router.push(leaderboardLoginHref)}
                      className="rounded-full px-3"
                    >
                      {copy.loginLabel}
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          <TierRoadmap
            tiers={[...copy.tiers]}
            currentTierIndex={currentTierIndex}
            title={copy.tierTitle}
            currentTierLabel={copy.tiers[currentTierIndex] || copy.tiers[0]}
            standingLabel={myRank ? copy.myRank(myRank) : copy.unranked}
            promotionLabel={copy.promotionLabel(myGapToPrevious)}
          />

          <div
            className={`grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1.5fr)_360px] ${pageGridGapClass}`}
          >
            <div className="min-h-0">
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

            <div className={`flex min-h-0 flex-col ${pageSectionGapClass}`}>
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
                />
              ) : null}

              <FocusPanel
                activeTab={focusTab}
                onTabChange={setFocusTab}
                challengeLabel={copy.challengeLabel}
                rivalLabel={copy.rivalLabel}
                challengeBadge={copy.challengeBadge}
                challenges={growthSummary?.goals ?? []}
                rival={rivalTarget}
                rivalEmptyDescription={copy.rivalEmpty}
                rivalEmptyCta={copy.rivalEmptyCta}
                rivalLeadText={copy.rivalLeadText}
                challengeEmptyDescription={copy.challengeEmptyDescription}
                challengeEmptyCta={copy.challengeEmptyCta}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
