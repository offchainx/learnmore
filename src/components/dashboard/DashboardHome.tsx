'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DailyInspiration } from './Widgets'
import { DailyMissions } from './DailyMissions'
import {
  Activity,
  ArrowUpRight,
  BookOpenCheck,
  CircleHelp,
  Layers3,
  Play,
  Trophy,
} from 'lucide-react'
import { useApp } from '@/providers'
import { DashboardData, DashboardOverviewWindow } from '@/actions/dashboard'
import { PracticeMode, User, UserSettings } from '@prisma/client'
import { PageEmptyState } from '@/components/shared/PageEmptyState'
import { PageHeroShell } from '@/components/shared/PageHeroShell'
import { PageHeroTitle } from '@/components/shared/PageHeroTitle'
import {
  pageCardTitleClass,
  pageHeroNumericValueClass,
  pageKickerClass,
  pageKickerMutedClass,
  pageMetaTextClass,
  pageNumericValueClass,
  pageNumericValueCompactClass,
  pageSectionTitleClass,
} from '@/components/shared/pageTypography'
import {
  pageBadgeClass,
  pageHeroShellClass,
  pageInteractiveRowClass,
  pageInsetClass,
  pagePanelClass,
  pagePillActiveClass,
  pagePillInactiveClass,
  pageSegmentedButtonCompactClass,
  pageSegmentedControlCompactClass,
  pageShellFrameClass,
  pageSoftInsetClass,
} from '@/components/shared/pageSurfaces'
import {
  pageCardPaddingClass,
  pageCardTitleGapClass,
  pageGridGapClass,
  pageListItemTallClass,
  pageListGapClass,
  pageSectionGapClass,
} from '@/components/shared/pageSpacing'

const ACTIVITY_PER_PAGE = 4
const SUBJECTS_PER_PAGE = 4

function languageCopy(lang: string, zh: string, en: string, ms?: string) {
  if (lang.startsWith('zh')) return zh
  if (lang.startsWith('ms')) return ms ?? en
  return en
}

function formatDuration(
  seconds: number | null,
  copy: (zh: string, en: string) => string
) {
  if (!seconds || seconds <= 0) return copy('未记录', 'Not tracked')
  const minutes = Math.max(1, Math.round(seconds / 60))
  return copy(`${minutes} 分钟`, `${minutes} min`)
}

function formatRelativeDate(
  date: Date,
  copy: (zh: string, en: string) => string
) {
  const diffHours = Math.floor(
    (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60)
  )
  if (diffHours < 1) return copy('刚刚', 'Just now')
  if (diffHours < 24) return copy(`${diffHours} 小时前`, `${diffHours}h ago`)
  const diffDays = Math.floor(diffHours / 24)
  return copy(`${diffDays} 天前`, `${diffDays}d ago`)
}

function practiceModeLabel(
  mode: PracticeMode,
  copy: (zh: string, en: string) => string
) {
  switch (mode) {
    case 'SMART_DRILL':
      return copy('Smart Drill', 'Smart Drill')
    case 'ERROR_WIPER':
      return copy('Error Wiper', 'Error Wiper')
    case 'MOCK_EXAM':
      return copy('Mock Arena', 'Mock Arena')
    case 'CHAPTER_DRILL':
      return copy('章节训练', 'Chapter Drill')
    case 'PAST_PAPER':
      return copy('历年真题', 'Past Paper')
    default:
      return copy('练习记录', 'Practice')
  }
}

function learningPathTypeLabel(
  type: DashboardData['learningPath']['items'][number]['recommendationType'],
  copy: (zh: string, en: string) => string
) {
  switch (type) {
    case 'weakness':
      return copy('补弱', 'Fix Weakness')
    case 'next':
      return copy('推进', 'Next Step')
    case 'review':
      return copy('巩固', 'Review')
    default:
      return copy('建议', 'Recommended')
  }
}

function recentPracticeDifficultyLabel(
  difficulty: DashboardData['recentPractice']['items'][number]['difficulty'],
  copy: (zh: string, en: string) => string
) {
  switch (difficulty) {
    case 'EASY':
      return copy('简单', 'Easy')
    case 'MEDIUM':
      return copy('标准', 'Medium')
    case 'HARD':
      return copy('困难', 'Hard')
    default:
      return null
  }
}

function modeAppearsInTitle(mode: PracticeMode, title: string) {
  const normalizedTitle = title.trim().toLowerCase()
  const modeLabelMap: Record<PracticeMode, string> = {
    SMART_DRILL: 'smart drill',
    ERROR_WIPER: 'error wiper',
    MOCK_EXAM: 'mock arena',
    CHAPTER_DRILL: 'chapter drill',
    PAST_PAPER: 'past paper',
  }

  return normalizedTitle.includes(modeLabelMap[mode] || '')
}

function PageDots({
  totalPages,
  page,
  countLabel,
}: {
  totalPages: number
  page: number
  countLabel: string
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {Array.from({ length: totalPages }).map((_, index) => (
          <span
            key={index}
            className={`h-1.5 rounded-full transition-all ${index === page ? 'w-4 bg-primary dark:bg-primary' : 'w-1.5 bg-[hsl(var(--border-default))] dark:bg-[hsl(var(--border-default))]'}`}
          />
        ))}
      </div>
      <span className={pageBadgeClass}>{countLabel}</span>
    </div>
  )
}

function OverviewCard({
  label,
  value,
  subLabel,
}: {
  label: string
  value: string
  subLabel: string
}) {
  return (
    <div className={`${pageSoftInsetClass} px-4 py-3 shadow-none`}>
      <div className={pageKickerClass}>{label}</div>
      <div className={pageNumericValueClass}>{value}</div>
      <div className={`mt-1 ${pageMetaTextClass}`}>{subLabel}</div>
    </div>
  )
}

function SectionHelpTooltip({
  content,
}: {
  content: string
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex h-5 w-5 items-center justify-center rounded-full text-text-tertiary transition-colors hover:text-primary"
          aria-label="More information"
        >
          <CircleHelp className="h-4 w-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs rounded-xl border-borderTone bg-surface text-[12px] leading-5 text-text-secondary shadow-surface dark:border-borderTone dark:bg-surface-subtle dark:text-text-secondary">
        {content}
      </TooltipContent>
    </Tooltip>
  )
}

function DashboardSectionHeader({
  icon: Icon,
  title,
  description,
  tooltip,
  meta,
  action,
}: {
  icon: React.ElementType
  title: string
  description?: string
  tooltip?: string
  meta?: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className={`flex items-start justify-between gap-4 ${pageCardTitleGapClass}`}>
      <div className="min-w-0">
        <h3 className={`flex items-center gap-2 ${pageSectionTitleClass}`}>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-borderTone bg-[hsl(var(--state-info-bg))]/70 text-primary dark:border-borderTone dark:bg-[hsl(var(--state-info-bg))]/18 dark:text-primary">
            <Icon className="h-4 w-4" />
          </span>
          <span className="truncate">{title}</span>
          {tooltip ? <SectionHelpTooltip content={tooltip} /> : null}
        </h3>
        {description ? (
          <p className={`${pageMetaTextClass} mt-2 max-w-xl`}>{description}</p>
        ) : null}
      </div>
      {(meta || action) ? (
        <div className="flex shrink-0 flex-col items-end gap-2">
          {meta}
          {action}
        </div>
      ) : null}
    </div>
  )
}

export const DashboardHome = ({
  navigate,
  initialData,
  user,
}: {
  navigate: (path: string) => void
  onViewChange?: (view: string) => void
  initialData: DashboardData | null
  user: User & { settings?: UserSettings | null }
}) => {
  const { t, lang } = useApp()
  const copy = (zh: string, en: string, ms?: string) =>
    languageCopy(lang, zh, en, ms)
  const [coreData, setCoreData] = useState<DashboardData | null>(
    initialData
  )
  const [overviewData, setOverviewData] = useState<{
    overviewByWindow: DashboardData['overviewByWindow']
  } | null>(
    initialData
      ? {
          overviewByWindow: initialData.overviewByWindow,
        }
      : null
  )
  const [activityData, setActivityData] = useState<{
    recentPractice: DashboardData['recentPractice']
    leaderboard: DashboardData['leaderboard']
  } | null>(
    initialData
      ? {
          recentPractice: initialData.recentPractice,
          leaderboard: initialData.leaderboard,
        }
      : null
  )
  const [subjectData, setSubjectData] = useState<{
    learningPath: DashboardData['learningPath']
    subjectProgress: DashboardData['subjectProgress']
  } | null>(
    initialData
      ? {
          learningPath: initialData.learningPath,
          subjectProgress: initialData.subjectProgress,
        }
      : null
  )
  const [isLoadingOverviewData, setIsLoadingOverviewData] = useState(
    !initialData
  )
  const [isLoadingActivityData, setIsLoadingActivityData] = useState(
    !initialData
  )
  const [isLoadingSubjectData, setIsLoadingSubjectData] = useState(!initialData)
  const [homeDataError, setHomeDataError] = useState<string | null>(null)
  const [overviewWindow, setOverviewWindow] =
    useState<DashboardOverviewWindow>('7D')
  const [activityPage, setActivityPage] = useState(0)
  const [subjectPage, setSubjectPage] = useState(0)

  useEffect(() => {
    if (coreData) return

    let cancelled = false

    const loadCoreData = async () => {
      setHomeDataError(null)
      try {
        const response = await fetch('/api/dashboard/home-core', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        })

        if (!response.ok) {
          throw new Error(`Failed to load dashboard core data: ${response.status}`)
        }

        const payload = (await response.json()) as { data?: DashboardData }
        if (!cancelled) {
          setCoreData(payload.data ?? null)
        }
      } catch (error) {
        if (!cancelled) {
          console.warn('[DashboardHome] Failed to lazy-load core data:', error)
          setHomeDataError(
            error instanceof Error ? error.message : 'Failed to load dashboard data'
          )
        }
      }
    }

    void loadCoreData()

    return () => {
      cancelled = true
    }
  }, [coreData])

  useEffect(() => {
    if (overviewData) return

    let cancelled = false

    const loadOverviewData = async () => {
      setIsLoadingOverviewData(true)
      try {
        const response = await fetch('/api/dashboard/home-overview', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        })

        if (!response.ok) {
          throw new Error(
            `Failed to load dashboard overview data: ${response.status}`
          )
        }

        const payload = (await response.json()) as {
          overviewByWindow?: DashboardData['overviewByWindow']
        }

        if (!cancelled) {
          setOverviewData({
            overviewByWindow: payload.overviewByWindow ?? {
              '7D': { studyTime: '0.0', questions: 0, accuracy: 0, activeDays: 0 },
              '30D': { studyTime: '0.0', questions: 0, accuracy: 0, activeDays: 0 },
            },
          })
        }
      } catch (error) {
        if (!cancelled) {
          console.warn('[DashboardHome] Failed to lazy-load overview data:', error)
        }
      } finally {
        if (!cancelled) {
          setIsLoadingOverviewData(false)
        }
      }
    }

    void loadOverviewData()

    return () => {
      cancelled = true
    }
  }, [overviewData])

  useEffect(() => {
    if (activityData) return

    let cancelled = false

    const loadActivityData = async () => {
      setIsLoadingActivityData(true)
      try {
        const response = await fetch('/api/dashboard/home-activity', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        })

        if (!response.ok) {
          throw new Error(
            `Failed to load dashboard activity data: ${response.status}`
          )
        }

        const payload = (await response.json()) as {
          recentPractice?: DashboardData['recentPractice']
          leaderboard?: DashboardData['leaderboard']
        }

        if (!cancelled) {
          setActivityData({
            recentPractice: payload.recentPractice ?? {
              status: 'empty',
              items: [],
              note: '最近练习稍后加载。',
            },
            leaderboard: payload.leaderboard ?? {
              status: 'empty',
              percentile: null,
              peerAverageAccuracy: null,
              userAccuracy: 0,
              note: '排行榜稍后加载。',
            },
          })
        }
      } catch (error) {
        if (!cancelled) {
          console.warn('[DashboardHome] Failed to lazy-load activity data:', error)
        }
      } finally {
        if (!cancelled) {
          setIsLoadingActivityData(false)
        }
      }
    }

    void loadActivityData()

    return () => {
      cancelled = true
    }
  }, [activityData])

  useEffect(() => {
    if (subjectData) return

    let cancelled = false

    const loadSubjectData = async () => {
      setIsLoadingSubjectData(true)
      try {
        const response = await fetch('/api/dashboard/home-subjects', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        })

        if (!response.ok) {
          throw new Error(
            `Failed to load dashboard subject data: ${response.status}`
          )
        }

        const payload = (await response.json()) as {
          learningPath?: DashboardData['learningPath']
          subjectProgress?: DashboardData['subjectProgress']
        }

        if (!cancelled) {
          setSubjectData({
            learningPath: payload.learningPath ?? {
              status: 'empty',
              items: [],
              note: '章节推荐稍后加载。',
            },
            subjectProgress: payload.subjectProgress ?? {
              status: 'empty',
              items: [],
              note: '学科进度稍后加载。',
            },
          })
        }
      } catch (error) {
        if (!cancelled) {
          console.warn('[DashboardHome] Failed to lazy-load subject data:', error)
        }
      } finally {
        if (!cancelled) {
          setIsLoadingSubjectData(false)
        }
      }
    }

    void loadSubjectData()

    return () => {
      cancelled = true
    }
  }, [subjectData])
  const dashboardDataSnapshot = {
    ...(coreData ?? {
      stats: {
        studyTime: '0.0',
        questions: 0,
        accuracy: 0,
        mistakes: 0,
        streak: 0,
        level: 0,
        xp: 0,
        nextLevelXp: 0,
      },
      overviewByWindow: {
        '7D': { studyTime: '0.0', questions: 0, accuracy: 0, activeDays: 0 },
        '30D': { studyTime: '0.0', questions: 0, accuracy: 0, activeDays: 0 },
      },
      learningPath: { status: 'empty', items: [], note: undefined },
      recentPractice: { status: 'empty', items: [], note: undefined },
      subjectProgress: { status: 'empty', items: [], note: undefined },
      dailyTasks: { status: 'empty', items: [], note: undefined },
      weaknesses: { status: 'empty', items: [], note: undefined },
      leaderboard: {
        status: 'empty',
        percentile: null,
        peerAverageAccuracy: null,
        userAccuracy: 0,
        note: undefined,
      },
    }),
    ...(overviewData ?? {
      overviewByWindow: {
        '7D': { studyTime: '0.0', questions: 0, accuracy: 0, activeDays: 0 },
        '30D': { studyTime: '0.0', questions: 0, accuracy: 0, activeDays: 0 },
      },
    }),
    ...(activityData ?? {
      recentPractice: { status: 'empty', items: [], note: undefined },
      leaderboard: {
        status: 'empty',
        percentile: null,
        peerAverageAccuracy: null,
        userAccuracy: 0,
        note: undefined,
      },
    }),
    ...(subjectData ?? {
      learningPath: { status: 'empty', items: [], note: undefined },
      subjectProgress: { status: 'empty', items: [], note: undefined },
    }),
  } satisfies DashboardData

  const {
    stats,
    overviewByWindow,
    learningPath,
    recentPractice: recentPracticeSection,
    subjectProgress,
    dailyTasks: dailyTasksSection,
    leaderboard,
  } = dashboardDataSnapshot
  const learningPathItems = learningPath.items
  const subjectProgressItems = subjectProgress.items
  const recentPractice = recentPracticeSection.items
  const dailyTasks = dailyTasksSection.items

  const activeOverview = overviewByWindow[overviewWindow]
  const summaryStatsCards = [
    {
      label: copy('学习时长', 'Study Time'),
      value: `${stats.studyTime}h`,
      subLabel: copy('最近投入', 'Recent effort'),
    },
    {
      label: copy('完成题数', 'Questions'),
      value: String(stats.questions),
      subLabel: copy('完成量', 'Completed'),
    },
  ]
  const overviewCards = [
    {
      label: copy('正确率', 'Accuracy'),
      value: `${activeOverview.accuracy}%`,
      subLabel: copy('命中率', 'Hit rate'),
    },
    {
      label: copy('活跃天数', 'Active Days'),
      value: String(activeOverview.activeDays),
      subLabel: copy('有学习的天数', 'Study days'),
    },
  ]

  const totalActivityPages = Math.max(
    1,
    Math.ceil(learningPathItems.length / ACTIVITY_PER_PAGE)
  )
  const visibleActivity = useMemo(
    () =>
      learningPathItems.slice(
        activityPage * ACTIVITY_PER_PAGE,
        (activityPage + 1) * ACTIVITY_PER_PAGE
      ),
    [activityPage, learningPathItems]
  )

  const totalSubjectPages = Math.max(
    1,
    Math.ceil(subjectProgressItems.length / SUBJECTS_PER_PAGE)
  )
  const visibleSubjects = useMemo(
    () =>
      subjectProgressItems.slice(
        subjectPage * SUBJECTS_PER_PAGE,
        (subjectPage + 1) * SUBJECTS_PER_PAGE
      ),
    [subjectPage, subjectProgressItems]
  )

  useEffect(() => {
    setActivityPage(0)
  }, [learningPathItems.length])

  useEffect(() => {
    setSubjectPage(0)
  }, [subjectProgressItems.length])

  const handleActivityWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (totalActivityPages <= 1) return
    event.preventDefault()
    const direction = event.deltaY > 0 ? 1 : -1
    setActivityPage((prev) =>
      Math.max(0, Math.min(totalActivityPages - 1, prev + direction))
    )
  }

  const handleSubjectWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (totalSubjectPages <= 1) return
    event.preventDefault()
    const direction = event.deltaY > 0 ? 1 : -1
    setSubjectPage((prev) =>
      Math.max(0, Math.min(totalSubjectPages - 1, prev + direction))
    )
  }

  return (
    <TooltipProvider delayDuration={120}>
      <div className="flex h-full min-w-0 min-h-0 flex-col px-3 py-2 sm:px-4 sm:py-3">
        <div
          className={`mx-auto grid h-full min-h-0 w-full max-w-[1820px] grid-rows-[auto_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-4 overflow-hidden ${pageShellFrameClass} p-0 sm:p-2.5`}
        >
          {homeDataError ? (
            <Card className="rounded-[20px] border border-amber-400/30 bg-amber-50 p-5 text-amber-950 shadow-surface dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-50">
              <div className="text-sm font-semibold">
                Dashboard data is loading slowly.
              </div>
              <div className="mt-1 text-sm opacity-80">{homeDataError}</div>
            </Card>
          ) : null}

          <PageHeroShell
            className={`${pageHeroShellClass} min-h-[240px] border border-borderTone bg-surface bg-none shadow-surface dark:border-borderTone dark:bg-surface dark:shadow-none`}
            title={
              <PageHeroTitle title={copy('首页', 'Home')} capsuleLabel="Home" />
            }
            titleClassName="font-semibold"
            actions={
              <div className={`shrink-0 ${pageSegmentedControlCompactClass}`}>
                {(['7D', '30D'] as DashboardOverviewWindow[]).map((windowKey) => (
                  <button
                    key={windowKey}
                    type="button"
                    onClick={() => setOverviewWindow(windowKey)}
                    className={`${pageSegmentedButtonCompactClass} text-[11px] font-semibold ${
                      overviewWindow === windowKey
                        ? pagePillActiveClass
                        : pagePillInactiveClass
                    }`}
                  >
                    {windowKey === '7D' ? copy('7天', '7D') : copy('30天', '30D')}
                  </button>
                ))}
              </div>
            }
          >
            <section className={`grid gap-3 sm:grid-cols-2 ${pageGridGapClass}`}>
              {summaryStatsCards.map((card) => (
                <OverviewCard
                  key={card.label}
                  label={card.label}
                  value={card.value}
                  subLabel={card.subLabel}
                />
              ))}
              {isLoadingOverviewData && !overviewData ? (
                <>
                  <div className={`${pageSoftInsetClass} px-4 py-3 shadow-none`}>
                    <Skeleton className="h-4 w-24 rounded-full" />
                    <Skeleton className="mt-4 h-9 w-20 rounded-2xl" />
                    <Skeleton className="mt-3 h-3 w-28 rounded-full" />
                  </div>
                  <div className={`${pageSoftInsetClass} px-4 py-3 shadow-none`}>
                    <Skeleton className="h-4 w-24 rounded-full" />
                    <Skeleton className="mt-4 h-9 w-20 rounded-2xl" />
                    <Skeleton className="mt-3 h-3 w-28 rounded-full" />
                  </div>
                </>
              ) : (
                overviewCards.map((card) => (
                  <OverviewCard
                    key={card.label}
                    label={card.label}
                    value={card.value}
                    subLabel={card.subLabel}
                  />
                ))
              )}
            </section>
          </PageHeroShell>

          <section className="grid min-h-0 gap-4 sm:grid-cols-2">
            <DailyMissions tasks={dailyTasks} user={user} lazyLoadTasks className="h-full min-h-0" />

            <Card className={`${pagePanelClass} h-full min-h-0 rounded-[24px] shadow-surface ${pageCardPaddingClass} dark:shadow-none`}>
              <DashboardSectionHeader
                icon={Trophy}
                title={t.dashboard?.rank || copy('年级排名', 'Rank')}
                tooltip={copy(
                  '看看你在同年级中的大致位置。',
                  'See roughly where you stand among students in your grade.'
                )}
              />

              {isLoadingActivityData && !activityData ? (
                <>
                  <div className="mt-4 text-center">
                    <Skeleton className="mx-auto h-10 w-40 rounded-full" />
                    <Skeleton className="mx-auto mt-3 h-4 w-52 rounded-full" />
                  </div>
                  <div className={`mt-3.5 grid grid-cols-2 ${pageGridGapClass}`}>
                    <Skeleton className="h-20 rounded-2xl" />
                    <Skeleton className="h-20 rounded-2xl" />
                  </div>
                  <Skeleton className="mt-3.5 h-12 rounded-2xl" />
                </>
              ) : leaderboard.status === 'ready' &&
                leaderboard.percentile !== null &&
                leaderboard.peerAverageAccuracy !== null ? (
                <>
                  <div className="mt-4 text-center">
                    <div className={`${pageHeroNumericValueClass} text-primary dark:text-primary`}>
                      {`Top ${leaderboard.percentile}%`}
                    </div>
                    <div className="mt-2 text-sm leading-6 text-text-secondary dark:text-text-secondary">
                      {copy(
                        '超过多数同年级学生',
                        'Ahead of most students in your grade'
                      )}
                    </div>
                  </div>

                  <div className={`mt-3.5 grid grid-cols-2 ${pageGridGapClass}`}>
                    <div className={`${pageInsetClass} px-4 py-3`}>
                      <div className={pageKickerClass}>{copy('平均正确率', 'Average')}</div>
                      <div className={pageNumericValueCompactClass}>
                        {leaderboard.peerAverageAccuracy !== null
                          ? `${leaderboard.peerAverageAccuracy}%`
                          : '--'}
                      </div>
                    </div>
                    <div className={`${pageInsetClass} bg-state-success-bg px-4 py-3 dark:bg-state-success-bg`}>
                      <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-state-success-fg dark:text-state-success-fg">
                        {copy('你的表现', 'You')}
                      </div>
                      <div className={`${pageNumericValueCompactClass} text-state-success-fg dark:text-state-success-fg`}>
                        {leaderboard.userAccuracy}%
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      if (leaderboard.status === 'ready') {
                        navigate('/dashboard/leaderboard')
                        return
                      }

                      if (leaderboard.status === 'excluded') {
                        navigate('/dashboard/settings')
                        return
                      }

                      if (leaderboard.status === 'empty') {
                        navigate('/dashboard/practice')
                      }
                    }}
                    className="mt-3.5 w-full rounded-xl py-3 text-sm font-bold"
                  >
                    {leaderboard.status === 'ready'
                      ? copy('查看排行榜', 'View Leaderboard')
                      : leaderboard.status === 'excluded'
                        ? copy('完善资料', 'Update Profile')
                        : copy('去赚 XP', 'Earn XP')}
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Button>
                </>
              ) : (
                <PageEmptyState
                  title={
                    leaderboard.status === 'excluded'
                      ? copy('缺少年级信息', 'Grade info required')
                      : copy('尚未进入排行榜', 'Not ranked yet')
                  }
                  description={
                    leaderboard.note ||
                    copy(
                      '完成一组练习并获得 XP 后，这里会显示你在同年级中的位置。',
                      'Complete a practice run and earn XP to see your position among students in your grade.'
                    )
                  }
                  className="min-h-[148px] rounded-[20px] border border-dashed border-borderTone bg-surface/70 px-4 py-5 dark:border-borderTone dark:bg-surface/40"
                />
              )}
            </Card>
          </section>

          <section className="grid min-h-0 gap-4 sm:grid-cols-2">
            <Card className={`${pagePanelClass} h-full min-h-0 rounded-[24px] shadow-surface ${pageCardPaddingClass} dark:shadow-none`}>
              <DashboardSectionHeader
                icon={BookOpenCheck}
                title={t.dashboard?.learningPath || copy('学习路径', 'Learning Path')}
                tooltip={copy(
                  '系统会根据最近的答题表现与掌握度，推荐下一步最值得做的章节练习，并可直接进入对应训练。',
                  'Recommendations are based on recent performance and mastery, and can deep-link straight into chapter drills.'
                )}
                meta={
                  <PageDots
                    totalPages={totalActivityPages}
                    page={activityPage}
                    countLabel={copy(
                      `${learningPathItems.length} 条`,
                      `${learningPathItems.length} items`
                    )}
                  />
                }
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={() => navigate('/dashboard/practice')}
                  >
                    {copy('去练习', 'Practice')}
                  </Button>
                }
              />

              {isLoadingSubjectData && !subjectData ? (
                <div className={pageListGapClass}>
                  {Array.from({ length: ACTIVITY_PER_PAGE }).map((_, index) => (
                    <Card
                      key={`learning-skeleton-${index}`}
                      className={`${pagePanelClass} min-h-0 rounded-[20px] shadow-none ${pageCardPaddingClass}`}
                    >
                      <Skeleton className="h-6 w-40 rounded-full" />
                      <Skeleton className="mt-3 h-4 w-full max-w-lg rounded-full" />
                      <Skeleton className="mt-5 h-24 rounded-[20px]" />
                    </Card>
                  ))}
                </div>
              ) : learningPath.status === 'ready' ? (
                <div className={pageListGapClass} onWheel={handleActivityWheel}>
                  {visibleActivity.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => navigate(item.href)}
                      className={`${pageInteractiveRowClass} ${pageListItemTallClass} rounded-[20px] justify-between shadow-none`}
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-borderTone bg-state-info-bg/70 text-primary dark:border-borderTone dark:bg-state-info-bg/18 dark:text-primary">
                        <Play className="h-4 w-4 fill-current" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className={`truncate ${pageKickerClass}`}>{item.subject}</div>
                        <div className={`mt-1 truncate ${pageCardTitleClass}`}>{item.title}</div>
                        <div className={`mt-1 truncate ${pageMetaTextClass}`}>{item.reason}</div>
                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-borderTone-subtle dark:bg-surface-subtle">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${Math.max(6, item.progress)}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={pageNumericValueCompactClass}>{item.progress}%</div>
                        <div className={`mt-1 ${pageMetaTextClass}`}>
                          {learningPathTypeLabel(item.recommendationType, copy)}
                        </div>
                      </div>
                    </button>
                  ))}
                  {visibleActivity.length < ACTIVITY_PER_PAGE &&
                    Array.from({
                      length: ACTIVITY_PER_PAGE - visibleActivity.length,
                    }).map((_, index) => (
                      <div
                        key={`activity-empty-${index}`}
                        className={`flex ${pageListItemTallClass} items-center justify-center rounded-[20px] border border-dashed border-borderTone bg-surface-subtle dark:border-borderTone dark:bg-surface-subtle`}
                      >
                        <span className={pageKickerMutedClass}>
                          {copy('已到列表底部', 'End of list')}
                        </span>
                      </div>
                    ))}
                </div>
              ) : (
                <PageEmptyState
                  title={copy('还没有最近学习记录', 'No recent learning path')}
                  description={
                    learningPath.note ||
                    copy(
                      '完成首次练习后，这里会出现章节推荐和下一步建议。',
                      'Complete your first practice run and chapter recommendations will show up here.'
                    )
                  }
                  actions={
                    <Button
                      onClick={() => navigate('/dashboard/practice')}
                      className="rounded-xl px-4 py-2 text-sm font-bold"
                    >
                      {copy('开始练习', 'Start Practicing')}
                    </Button>
                  }
                />
              )}
            </Card>

            <Card className={`${pagePanelClass} h-full min-h-0 rounded-[24px] shadow-surface ${pageCardPaddingClass} dark:shadow-none`}>
              <DashboardSectionHeader
                icon={Activity}
                title={t.dashboard?.subjectProgress || copy('学科进度', 'Subject Progress')}
                tooltip={copy(
                  '系统会按学科汇总章节练习表现，用来判断当前稳定度和优先补强方向。',
                  'This panel summarizes chapter practice by subject to show stability and where to focus next.'
                )}
                meta={
                  <PageDots
                    totalPages={totalSubjectPages}
                    page={subjectPage}
                    countLabel={copy(
                      `${subjectProgressItems.length} 科`,
                      `${subjectProgressItems.length} items`
                    )}
                  />
                }
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={() => navigate('/dashboard/practice')}
                  >
                    {copy('去练习', 'Practice')}
                  </Button>
                }
              />

              {isLoadingSubjectData && !subjectData ? (
                <div className={pageListGapClass}>
                  {Array.from({ length: SUBJECTS_PER_PAGE }).map((_, index) => (
                    <Card
                      key={`subject-skeleton-${index}`}
                      className="rounded-[20px] border border-borderTone bg-surface px-4 py-4 shadow-surface dark:border-borderTone dark:bg-surface-subtle"
                    >
                      <Skeleton className="h-5 w-36 rounded-full" />
                      <Skeleton className="mt-2 h-4 w-48 rounded-full" />
                      <Skeleton className="mt-4 h-2.5 rounded-full" />
                    </Card>
                  ))}
                </div>
              ) : subjectProgress.status === 'ready' ? (
                <div className={pageListGapClass} onWheel={handleSubjectWheel}>
                  {visibleSubjects.map((sub) => (
                    <div
                      key={sub.subjectId}
                      className="rounded-[20px] border border-borderTone bg-surface px-4 py-4 shadow-none dark:border-borderTone dark:bg-surface-subtle"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className={`truncate ${pageCardTitleClass}`}>{sub.subjectName}</div>
                          <div className={`mt-1 ${pageMetaTextClass}`}>
                            {copy(
                              `${sub.chapterCount} 个章节 · ${sub.totalAttempts} 次作答`,
                              `${sub.chapterCount} chapters · ${sub.totalAttempts} attempts`
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`${pageNumericValueCompactClass} ${sub.overallMastery >= 80 ? 'text-state-success-fg dark:text-state-success-fg' : 'text-primary dark:text-primary'}`}
                          >
                            {sub.overallMastery}%
                          </div>
                          <div className={pageMetaTextClass}>
                            {sub.overallMastery >= 80
                              ? copy('稳定', 'Stable')
                              : copy('待提升', 'Needs work')}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-borderTone-subtle dark:bg-surface-subtle">
                        <div
                          className={`h-full rounded-full ${sub.overallMastery >= 80 ? 'bg-state-success-fg' : 'bg-primary'}`}
                          style={{ width: `${Math.max(4, sub.overallMastery)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {visibleSubjects.length < SUBJECTS_PER_PAGE &&
                    Array.from({
                      length: SUBJECTS_PER_PAGE - visibleSubjects.length,
                    }).map((_, index) => (
                      <div
                        key={`subject-empty-${index}`}
                        className={`flex ${pageListItemTallClass} items-center justify-center rounded-[20px] border border-dashed border-borderTone bg-surface-subtle dark:border-borderTone dark:bg-surface-subtle`}
                      >
                        <span className={pageKickerMutedClass}>
                          {copy('已到列表底部', 'End of list')}
                        </span>
                      </div>
                    ))}
                </div>
              ) : (
                <PageEmptyState
                  title={copy('还没有学科进度数据', 'No subject progress yet')}
                  description={copy(
                    '先开始一次练习，系统才会逐步建立你的学科稳定度和进度分布。',
                    'Start practicing to build your subject progress and performance profile.'
                  )}
                  actions={
                    <Button
                      onClick={() => navigate('/dashboard/practice')}
                      className="rounded-xl px-4 py-2 text-sm font-bold"
                    >
                      {copy('开始练习', 'Start Practicing')}
                    </Button>
                  }
                />
              )}
            </Card>
          </section>

          <section className="grid min-h-0 gap-4 sm:grid-cols-2">
            <Card className={`${pagePanelClass} h-full min-h-0 rounded-[24px] shadow-surface ${pageCardPaddingClass} dark:shadow-none`}>
              <DashboardSectionHeader
                icon={Layers3}
                title={copy('最近练习回顾', 'Recent Practice')}
                tooltip={copy(
                  '这里会记录你最近几次训练的结果、难度与耗时，方便直接回到同类练习继续推进。',
                  'This section keeps your recent sessions, difficulty, and duration visible so you can continue from the same study flow.'
                )}
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={() => navigate('/dashboard/practice')}
                  >
                    {copy('练习中心', 'Practice')}
                  </Button>
                }
              />

              {isLoadingActivityData && !activityData ? (
                <div className={`space-y-3 ${pageListGapClass}`}>
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={`recent-practice-skeleton-${index}`}
                      className={`${pageInteractiveRowClass} justify-between`}
                    >
                      <div className="min-w-0 flex-1 space-y-2">
                        <Skeleton className="h-4 w-28 rounded-full" />
                        <Skeleton className="h-5 w-4/5 rounded-full" />
                        <Skeleton className="h-4 w-full rounded-full" />
                      </div>
                      <div className="shrink-0 text-right">
                        <Skeleton className="ml-auto h-6 w-16 rounded-full" />
                        <Skeleton className="ml-auto mt-2 h-4 w-20 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentPractice.length > 0 ? (
                <div className={`custom-scrollbar max-h-[266px] overflow-y-auto pr-1 ${pageListGapClass}`}>
                  {recentPractice.map((record) => (
                    <button
                      key={record.id}
                      type="button"
                      onClick={() => navigate(record.href)}
                      className={`${pageInteractiveRowClass} rounded-[20px] justify-between shadow-none`}
                    >
                      <div className="min-w-0 flex-1">
                        {!modeAppearsInTitle(record.mode, record.title) ? (
                          <div className={`${pageBadgeClass} w-fit border-transparent bg-surface-subtle px-2.5 py-0.5 text-[10px] text-text-secondary shadow-none`}>
                            {practiceModeLabel(record.mode, copy)}
                          </div>
                        ) : null}
                        <div className={`mt-1 truncate ${pageCardTitleClass}`}>{record.title}</div>
                        <div className={`mt-1 ${pageMetaTextClass}`}>
                          {[
                            record.subject,
                            recentPracticeDifficultyLabel(record.difficulty, copy),
                            formatRelativeDate(record.createdAt, copy),
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="inline-flex min-w-[68px] justify-center rounded-xl border border-borderTone bg-state-info-bg/70 px-3 py-1 text-[18px] font-semibold tracking-tight text-primary dark:border-borderTone dark:bg-state-info-bg/18 dark:text-primary">
                          {record.score}%
                        </div>
                        <div className={`mt-1 ${pageMetaTextClass}`}>
                          {record.correctCount}/{record.totalQuestions} · {formatDuration(record.duration, copy)}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <PageEmptyState
                  title={copy('还没有练习记录', 'No recent practice yet')}
                  description={copy(
                    '完成第一轮练习后，这里会告诉你最近一次训练效果和接下来最值得做的动作。',
                    'Complete your first practice round and this panel will summarize your latest performance.'
                  )}
                  actions={
                    <Button
                      onClick={() => navigate('/dashboard/practice')}
                      className="rounded-xl px-4 py-2 text-sm font-bold"
                    >
                      {copy('开始练习', 'Start Practice')}
                    </Button>
                  }
                />
              )}
            </Card>

            <DailyInspiration
              lang={lang}
              t={t}
              welcomeTitle={t.dashboard?.dailyVibe || copy('今日灵感', 'Daily Vibe')}
              welcomeSub=""
              className="h-full min-h-0"
            />
          </section>
        </div>
      </div>
    </TooltipProvider>
  )
}
