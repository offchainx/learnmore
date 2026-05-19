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
import {
  Activity,
  BookOpenCheck,
  CircleHelp,
  Layers3,
  Play,
} from 'lucide-react'
import { useApp } from '@/providers'
import type { DashboardData, DashboardOverviewWindow } from '@/actions/dashboard'
import { PracticeMode } from '@prisma/client'
import { PageEmptyState } from '@/components/shared/PageEmptyState'
import { PageHeroShell } from '@/components/shared/PageHeroShell'
import { DashboardHeroCard } from './DashboardHeroCard'
import { DashboardReplicaTaskCard } from './DashboardReplicaTaskSection'
import { DashboardReplicaPathCard } from './DashboardReplicaPathSection'
import { DashboardStreakCard } from './DashboardReplicaStreakSection'
import { DashboardWeeklyGoalCard } from './DashboardReplicaGoalSection'
import { DashboardReplicaProfileCard } from './DashboardReplicaProfileSection'
import { DashboardReplicaCalendarCard } from './DashboardReplicaCalendarSection'
import { DashboardReplicaTimeCard } from './DashboardReplicaTimeSection'
import { DashboardReplicaSubjectCard } from './DashboardReplicaSubjectSection'
import { DashboardReplicaReviewCard } from './DashboardReplicaReviewSection'
import type { DashboardHeroLayoutPreset } from './heroLayoutPreset'
import type { DashboardTaskLayoutPreset } from './taskLayoutPreset'
import type { DashboardPathLayoutPreset } from './pathLayoutPreset'
import type { DashboardStreakLayoutPreset } from './streakLayoutPreset'
import type { DashboardGoalLayoutPreset } from './goalLayoutPreset'
import type { DashboardProfileLayoutPreset } from './profileLayoutPreset'
import type { DashboardCalendarLayoutPreset } from './calendarLayoutPreset'
import type { DashboardTimeLayoutPreset } from './timeLayoutPreset'
import type { DashboardSubjectLayoutPreset } from './subjectLayoutPreset'
import type { DashboardReviewLayoutPreset } from './reviewLayoutPreset'
import {
  DASHBOARD_HOME_MIN_ASIDE_WIDTH,
  defaultDashboardHomeDesktopLayoutPreset,
  normalizeDashboardHomeDesktopLayoutPreset,
  type DashboardHomeDesktopLayoutPreset,
} from './dashboardHomeDesktopLayoutPreset'
import { DashboardHomeDesktopLayoutInspector } from './DashboardHomeDesktopLayoutInspector'
import {
  pageCardTitleClass,
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
  pagePanelClass,
  pagePillActiveClass,
  pagePillInactiveClass,
  pageSegmentedButtonCompactClass,
  pageSegmentedControlCompactClass,
} from '@/components/shared/pageSurfaces'
import {
  pageCardPaddingClass,
  pageCardTitleGapClass,
  pageListItemTallClass,
  pageListGapClass,
  pageSectionGapClass,
} from '@/components/shared/pageSpacing'

const ACTIVITY_PER_PAGE = 4
const SUBJECTS_PER_PAGE = 4
const showLegacyMainContent = false

type DashboardShellUser = {
  id: string
  username: string | null
  displayName: string | null
  avatar: string | null
  handle: string | null
  role: string
  status: string
  grade: number | null
  school: string | null
  legalConsentAcceptedAt: Date | string | null
  legalConsentVersion: string | null
  onboardingCompletedAt: Date | string | null
  onboardingStep: string | null
  streak: number | null
  xp: number | null
  subscriptionTier: string | null
  subscriptionEnd: Date | string | null
  settings?: {
    studyReminderTime?: string | null
  } | null
}

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

function SectionHelpTooltip({ content }: { content: string }) {
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
    <div
      className={`flex items-start justify-between gap-4 ${pageCardTitleGapClass}`}
    >
      <div className="min-w-0">
        <h3 className={`flex items-center gap-2 ${pageSectionTitleClass}`}>
          <span className="dark:bg-[hsl(var(--state-info-bg))]/18 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-borderTone bg-[hsl(var(--state-info-bg))]/70 text-primary dark:border-borderTone dark:text-primary">
            <Icon className="h-4 w-4" />
          </span>
          <span className="truncate">{title}</span>
          {tooltip ? <SectionHelpTooltip content={tooltip} /> : null}
        </h3>
        {description ? (
          <p className={`${pageMetaTextClass} mt-2 max-w-xl`}>{description}</p>
        ) : null}
      </div>
      {meta || action ? (
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
  heroLayoutPreset,
  taskLayoutPreset,
  pathLayoutPreset,
  streakLayoutPreset,
  goalLayoutPreset,
  profileLayoutPreset,
  calendarLayoutPreset,
  timeLayoutPreset,
  subjectLayoutPreset,
  reviewLayoutPreset,
  homeDesktopLayoutPreset,
  layoutEditMode = false,
}: {
  navigate: (path: string) => void
  onViewChange?: (view: string) => void
  initialData: DashboardData | null
  user: DashboardShellUser
  heroLayoutPreset: DashboardHeroLayoutPreset
  taskLayoutPreset: DashboardTaskLayoutPreset
  pathLayoutPreset: DashboardPathLayoutPreset
  streakLayoutPreset: DashboardStreakLayoutPreset
  goalLayoutPreset: DashboardGoalLayoutPreset
  profileLayoutPreset: DashboardProfileLayoutPreset
  calendarLayoutPreset: DashboardCalendarLayoutPreset
  timeLayoutPreset: DashboardTimeLayoutPreset
  subjectLayoutPreset: DashboardSubjectLayoutPreset
  reviewLayoutPreset: DashboardReviewLayoutPreset
  homeDesktopLayoutPreset: DashboardHomeDesktopLayoutPreset
  layoutEditMode?: boolean
}) => {
  const { t, lang } = useApp()
  const copy = (zh: string, en: string, ms?: string) =>
    languageCopy(lang, zh, en, ms)
  const shouldLoadLegacyMainContent = showLegacyMainContent
  const [coreData, setCoreData] = useState<DashboardData | null>(initialData)
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
  const [isLoadingOverviewData, setIsLoadingOverviewData] =
    useState(shouldLoadLegacyMainContent && !initialData)
  const [isLoadingActivityData, setIsLoadingActivityData] =
    useState(shouldLoadLegacyMainContent && !initialData)
  const [isLoadingSubjectData, setIsLoadingSubjectData] = useState(
    shouldLoadLegacyMainContent && !initialData
  )
  const [homeDataError, setHomeDataError] = useState<string | null>(null)
  const [overviewWindow, setOverviewWindow] =
    useState<DashboardOverviewWindow>('7D')
  const [activityPage, setActivityPage] = useState(0)
  const [subjectPage, setSubjectPage] = useState(0)
  const [selectedLayoutCard, setSelectedLayoutCard] = useState<
    'hero' | 'profile' | 'task' | 'path' | 'streak' | 'goal' | null
  >(null)
  const [desktopLayoutPreset, setDesktopLayoutPreset] =
    useState<DashboardHomeDesktopLayoutPreset>(() =>
      normalizeDashboardHomeDesktopLayoutPreset(homeDesktopLayoutPreset)
    )
  const [savingDesktopLayoutPreset, setSavingDesktopLayoutPreset] =
    useState(false)
  const effectiveAsideWidth = Math.max(
    desktopLayoutPreset.asideWidth,
    DASHBOARD_HOME_MIN_ASIDE_WIDTH
  )
  const effectivePageMaxWidth = Math.max(
    desktopLayoutPreset.pageMaxWidth,
    heroLayoutPreset.shell.width + effectiveAsideWidth + desktopLayoutPreset.gridGap
  )
  const mainColumnOffsetCompensationX = layoutEditMode
    ? Math.max(
        0,
        -Math.min(
          0,
          desktopLayoutPreset.heroOffsetX,
          desktopLayoutPreset.taskOffsetX,
          desktopLayoutPreset.pathOffsetX,
          desktopLayoutPreset.streakOffsetX,
          desktopLayoutPreset.goalOffsetX
        )
      )
    : 0
  const asideColumnOffsetCompensationX = layoutEditMode
    ? Math.max(0, -Math.min(0, desktopLayoutPreset.asideOffsetX))
    : 0

  useEffect(() => {
    if (coreData || !shouldLoadLegacyMainContent) return

    let cancelled = false

    const loadHomeData = async () => {
      setHomeDataError(null)
      setIsLoadingOverviewData(true)
      setIsLoadingActivityData(true)
      setIsLoadingSubjectData(true)

      try {
        const response = await fetch('/api/dashboard/home-data', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        })

        if (!response.ok) {
          throw new Error(
            `Failed to load dashboard home data: ${response.status}`
          )
        }

        const payload = (await response.json()) as { data?: DashboardData }
        const data = payload.data ?? null

        if (!cancelled) {
          if (data) {
            setCoreData(data)
            setOverviewData({ overviewByWindow: data.overviewByWindow })
            setActivityData({
              recentPractice: data.recentPractice,
              leaderboard: data.leaderboard,
            })
            setSubjectData({
              learningPath: data.learningPath,
              subjectProgress: data.subjectProgress,
            })
          }
        }
      } catch (error) {
        if (!cancelled) {
          console.warn('[DashboardHome] Failed to lazy-load home data:', error)
          setHomeDataError(
            error instanceof Error
              ? error.message
              : 'Failed to load dashboard data'
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoadingOverviewData(false)
          setIsLoadingActivityData(false)
          setIsLoadingSubjectData(false)
        }
      }
    }

    void loadHomeData()

    return () => {
      cancelled = true
    }
  }, [coreData, shouldLoadLegacyMainContent])
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
        '7D': {
          studyTime: '0.0',
          questions: 0,
          accuracy: 0,
          activeDays: 0,
          dailyActivity: [],
        },
        '30D': {
          studyTime: '0.0',
          questions: 0,
          accuracy: 0,
          activeDays: 0,
          dailyActivity: [],
        },
      },
      learningPath: { status: 'empty', items: [], note: undefined },
      recentPractice: { status: 'empty', items: [], note: undefined },
      subjectProgress: { status: 'empty', items: [], note: undefined },
      dailyTasks: { status: 'empty', items: [], note: undefined },
      weaknesses: { status: 'empty', items: [], note: undefined },
      leaderboard: {
        status: 'empty',
        percentile: null,
        rank: null,
        rivalRank: null,
        rivalXpGap: null,
        peerAverageAccuracy: null,
        userAccuracy: 0,
        note: undefined,
      },
    }),
    ...(overviewData ?? {
      overviewByWindow: {
        '7D': {
          studyTime: '0.0',
          questions: 0,
          accuracy: 0,
          activeDays: 0,
          dailyActivity: [],
        },
        '30D': {
          studyTime: '0.0',
          questions: 0,
          accuracy: 0,
          activeDays: 0,
          dailyActivity: [],
        },
      },
    }),
    ...(activityData ?? {
      recentPractice: { status: 'empty', items: [], note: undefined },
      leaderboard: {
        status: 'empty',
        percentile: null,
        rank: null,
        rivalRank: null,
        rivalXpGap: null,
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
  const overviewWindowLabel =
    overviewWindow === '7D'
      ? copy('近 7 天', 'Last 7 days')
      : copy('近 30 天', 'Last 30 days')
  const heroMetrics = [
    {
      label: copy('学习时长', 'Study Time'),
      value: `${activeOverview.studyTime}h`,
      subLabel: copy('当前时间窗投入', 'Focused effort in this window'),
    },
    {
      label: copy('完成题数', 'Questions'),
      value: String(activeOverview.questions),
      subLabel: copy('当前时间窗完成量', 'Questions finished in this window'),
    },
    {
      label: copy('正确率', 'Accuracy'),
      value: `${activeOverview.accuracy}%`,
      subLabel: copy('答题命中率', 'Answer accuracy'),
    },
    {
      label: copy('活跃天数', 'Active Days'),
      value: String(activeOverview.activeDays),
      subLabel: copy('有学习记录的天数', 'Days with study activity'),
    },
  ]
  const featuredMetric = heroMetrics[0]
  const supportingMetrics = heroMetrics.slice(1)

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

  const saveDesktopLayoutPreset = async () => {
    try {
      setSavingDesktopLayoutPreset(true)
      const response = await fetch('/api/dashboard/home-desktop-layout-preset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(desktopLayoutPreset),
      })

      if (!response.ok) {
        throw new Error(`Failed to save preset: ${response.status}`)
      }
    } finally {
      setSavingDesktopLayoutPreset(false)
    }
  }

  return (
    <TooltipProvider delayDuration={120}>
      <div className="flex min-h-0 w-full min-w-0 flex-col px-3 py-2 sm:px-4 sm:py-3">
        <div
          className="mx-auto flex w-full flex-col gap-5"
          style={{ maxWidth: `${effectivePageMaxWidth}px` }}
        >
          <div
            className="grid xl:items-start"
            style={{
              gap: `${desktopLayoutPreset.gridGap}px`,
              gridTemplateColumns: `minmax(0,1fr) minmax(${effectiveAsideWidth}px, ${effectiveAsideWidth}px)`,
            }}
          >
            <div
              className="min-w-0 space-y-5"
              style={{
                transform: `translateX(${mainColumnOffsetCompensationX}px)`,
                transformOrigin: 'top left',
              }}
            >
              <div
                className={`${layoutEditMode ? 'cursor-pointer rounded-[32px] transition-shadow' : ''} ${
                  layoutEditMode && selectedLayoutCard === 'hero'
                    ? 'ring-2 ring-[#ff7d19] ring-offset-2 ring-offset-[#fcf7f0]'
                    : ''
                }`}
                style={{
                  transform: `translate(${desktopLayoutPreset.heroOffsetX}px, ${desktopLayoutPreset.heroOffsetY}px)`,
                }}
                onClick={() => {
                  if (layoutEditMode) {
                    setSelectedLayoutCard('hero')
                  }
                }}
              >
                <DashboardHeroCard
                  copy={copy}
                  xp={stats.xp}
                  onContinue={() => navigate('/dashboard/practice')}
                  preset={heroLayoutPreset}
                />
              </div>

              <section className="min-h-0 space-y-4">
                <div
                  className={`${layoutEditMode ? 'cursor-pointer rounded-[32px] transition-shadow' : ''} ${
                    layoutEditMode && selectedLayoutCard === 'task'
                      ? 'ring-2 ring-[#ff7d19] ring-offset-2 ring-offset-[#fcf7f0]'
                      : ''
                  }`}
                  style={{
                    transform: `translate(${desktopLayoutPreset.taskOffsetX}px, ${desktopLayoutPreset.taskOffsetY}px)`,
                  }}
                  onClick={() => {
                    if (layoutEditMode) {
                      setSelectedLayoutCard('task')
                    }
                  }}
                >
                  <DashboardReplicaTaskCard preset={taskLayoutPreset} />
                </div>

                <div
                  className={`${layoutEditMode ? 'cursor-pointer rounded-[32px] transition-shadow' : ''} ${
                    layoutEditMode && selectedLayoutCard === 'path'
                      ? 'ring-2 ring-[#ff7d19] ring-offset-2 ring-offset-[#fcf7f0]'
                      : ''
                  }`}
                  style={{
                    transform: `translate(${desktopLayoutPreset.pathOffsetX}px, ${desktopLayoutPreset.pathOffsetY}px)`,
                  }}
                  onClick={() => {
                    if (layoutEditMode) {
                      setSelectedLayoutCard('path')
                    }
                  }}
                >
                  <DashboardReplicaPathCard copy={copy} preset={pathLayoutPreset} />
                </div>
              </section>

              <section className="grid min-h-0 items-start gap-4 xl:grid-cols-2">
                <div
                  className={`${layoutEditMode ? 'cursor-pointer rounded-[32px] transition-shadow' : ''} ${
                    layoutEditMode && selectedLayoutCard === 'streak'
                      ? 'ring-2 ring-[#ff7d19] ring-offset-2 ring-offset-[#fcf7f0]'
                      : ''
                  }`}
                  style={{
                    transform: `translate(${desktopLayoutPreset.streakOffsetX}px, ${desktopLayoutPreset.streakOffsetY}px)`,
                  }}
                  onClick={() => {
                    if (layoutEditMode) {
                      setSelectedLayoutCard('streak')
                    }
                  }}
                >
                  <DashboardStreakCard
                    copy={copy}
                    streak={stats.streak}
                    preset={streakLayoutPreset}
                  />
                </div>
                <div
                  className={`${layoutEditMode ? 'cursor-pointer rounded-[32px] transition-shadow' : ''} ${
                    layoutEditMode && selectedLayoutCard === 'goal'
                      ? 'ring-2 ring-[#ff7d19] ring-offset-2 ring-offset-[#fcf7f0]'
                      : ''
                  }`}
                  style={{
                    transform: `translate(${desktopLayoutPreset.goalOffsetX}px, ${desktopLayoutPreset.goalOffsetY}px)`,
                  }}
                  onClick={() => {
                    if (layoutEditMode) {
                      setSelectedLayoutCard('goal')
                    }
                  }}
                >
                  <DashboardWeeklyGoalCard
                    copy={copy}
                    activeDays={overviewByWindow['7D'].activeDays}
                    preset={goalLayoutPreset}
                  />
                </div>
              </section>
            </div>

            <aside
              className={`w-full justify-self-end xl:col-start-2 ${
                layoutEditMode ? 'cursor-pointer rounded-[32px] transition-shadow' : ''
              } ${
                layoutEditMode && selectedLayoutCard === 'profile'
                  ? 'ring-2 ring-[#ff7d19] ring-offset-2 ring-offset-[#fcf7f0]'
                  : ''
              }`}
              style={{
                width: `${effectiveAsideWidth}px`,
                maxWidth: `${effectiveAsideWidth}px`,
                transform: `translate(${desktopLayoutPreset.asideOffsetX + asideColumnOffsetCompensationX}px, ${desktopLayoutPreset.asideOffsetY}px)`,
              }}
              onClick={() => {
                if (layoutEditMode) {
                  setSelectedLayoutCard('profile')
                }
              }}
            >
              <div className="space-y-4">
                <DashboardReplicaProfileCard
                  user={user}
                  xp={stats.xp}
                  streak={stats.streak}
                  preset={profileLayoutPreset}
                />
                <DashboardReplicaCalendarCard preset={calendarLayoutPreset} />
                <div className="grid min-h-0 items-start gap-4 xl:grid-cols-2">
                  <DashboardReplicaTimeCard preset={timeLayoutPreset} />
                  <DashboardReplicaSubjectCard preset={subjectLayoutPreset} />
                </div>
                <DashboardReplicaReviewCard preset={reviewLayoutPreset} />
              </div>
            </aside>
          </div>
        </div>
      </div>
      <DashboardHomeDesktopLayoutInspector
        visible={layoutEditMode}
        selectedCard={selectedLayoutCard}
        preset={desktopLayoutPreset}
        saving={savingDesktopLayoutPreset}
        onPresetChange={setDesktopLayoutPreset}
        onSave={saveDesktopLayoutPreset}
      />
    </TooltipProvider>
  )
}
