'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DailyInspiration } from './Widgets'
import { DailyMissions } from './DailyMissions'
import {
  Activity,
  ArrowUpRight,
  BookOpenCheck,
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
  pageSectionDescriptionClass,
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

export const DashboardHome = ({
  navigate,
  initialData,
  user,
}: {
  navigate: (path: string) => void
  onViewChange?: (view: string) => void
  initialData: DashboardData
  user: User & { settings: UserSettings | null }
}) => {
  const { t, lang } = useApp()
  const copy = (zh: string, en: string, ms?: string) =>
    languageCopy(lang, zh, en, ms)
  const [overviewWindow, setOverviewWindow] =
    useState<DashboardOverviewWindow>('7D')
  const [activityPage, setActivityPage] = useState(0)
  const [subjectPage, setSubjectPage] = useState(0)

  const {
    stats,
    overviewByWindow,
    learningPath,
    recentPractice: recentPracticeSection,
    subjectProgress,
    dailyTasks: dailyTasksSection,
    leaderboard,
  } = initialData
  const learningPathItems = learningPath.items
  const subjectProgressItems = subjectProgress.items
  const recentPractice = recentPracticeSection.items
  const dailyTasks = dailyTasksSection.items

  const activeOverview = overviewByWindow[overviewWindow]

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

  const overviewCards = [
    {
      label: copy('学习时长', 'Study Time'),
      value: `${activeOverview.studyTime}h`,
      subLabel: copy('本周期累计投入', 'Logged in selected window'),
    },
    {
      label: copy('完成题数', 'Questions'),
      value: String(activeOverview.questions),
      subLabel: copy('本周期作答总量', 'Answered in selected window'),
    },
    {
      label: copy('正确率', 'Accuracy'),
      value: `${activeOverview.accuracy}%`,
      subLabel: copy('本周期平均表现', 'Average in selected window'),
    },
    {
      label: copy('活跃天数', 'Active Days'),
      value: String(activeOverview.activeDays),
      subLabel: copy(
        '完成练习或课程的天数',
        'Days with completed study activity'
      ),
    },
  ]

  return (
    <div className="min-w-0 animate-fade-in-up px-3 py-1.5 sm:px-4 sm:py-2">
      <div
        className={`mx-auto flex w-full min-w-0 max-w-[1820px] flex-col ${pageShellFrameClass} ${pageSectionGapClass} pb-4 sm:p-2.5 2xl:h-[calc(100vh-1rem)] 2xl:overflow-hidden`}
      >
        <section
          className={`grid 2xl:min-h-0 2xl:flex-1 2xl:grid-cols-[minmax(0,1.78fr)_minmax(320px,0.92fr)] ${pageGridGapClass}`}
        >
          <div
            className={`min-w-0 2xl:min-h-0 2xl:overflow-hidden ${pageSectionGapClass}`}
          >
            <PageHeroShell
              className={`${pageHeroShellClass} bg-surface bg-none shadow-none`}
              title={
                <PageHeroTitle
                  title={copy('仪表盘', 'Dashboard')}
                  capsuleLabel="Dashboard"
                />
              }
              subtitle={copy(
                '集中查看最近学习节奏、今日任务、章节练习建议和整体学科稳定度。',
                'A compact view of your recent momentum, today’s tasks, chapter recommendations, and subject stability.'
              )}
              titleClassName="font-semibold"
              actions={
                <div className={`shrink-0 ${pageSegmentedControlCompactClass}`}>
                  {(['7D', '30D'] as DashboardOverviewWindow[]).map(
                    (windowKey) => (
                      <button
                        key={windowKey}
                        type="button"
                        onClick={() => setOverviewWindow(windowKey)}
                        className={`${pageSegmentedButtonCompactClass} text-[10px] font-black uppercase tracking-[0.14em] ${
                          overviewWindow === windowKey
                            ? pagePillActiveClass
                            : pagePillInactiveClass
                        }`}
                      >
                        {windowKey === '7D'
                          ? copy('7天', '7D')
                          : copy('30天', '30D')}
                      </button>
                    )
                  )}
                </div>
              }
            >
              <section
                className={`grid gap-3 sm:grid-cols-2 2xl:grid-cols-4 ${pageGridGapClass}`}
              >
                {overviewCards.map((card) => (
                  <OverviewCard
                    key={card.label}
                    label={card.label}
                    value={card.value}
                    subLabel={card.subLabel}
                  />
                ))}
              </section>
            </PageHeroShell>

            <DailyMissions tasks={dailyTasks} user={user} />

            <section
              className={`grid desktop:grid-cols-2 2xl:min-h-0 ${pageGridGapClass}`}
            >
              <Card
                className={`${pagePanelClass} min-h-0 shadow-none ${pageCardPaddingClass}`}
              >
                <div
                  className={`flex items-start justify-between gap-4 ${pageCardTitleGapClass}`}
                >
                  <div>
                    <h3
                      className={`flex items-center gap-2 ${pageSectionTitleClass}`}
                    >
                      <BookOpenCheck className="h-5 w-5 text-indigo-300" />
                      {t.dashboard?.learningPath ||
                        copy('学习路径', 'Learning Path')}
                    </h3>
                    <p className={pageSectionDescriptionClass}>
                      {copy(
                        '根据当前答题表现推荐下一步章节练习，可直接深链进入对应章节训练。',
                        'Recommendations are based on your latest performance and deep-link directly into chapter drills.'
                      )}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <PageDots
                      totalPages={totalActivityPages}
                      page={activityPage}
                      countLabel={copy(
                        `${learningPathItems.length} 条`,
                        `${learningPathItems.length} items`
                      )}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-2xl"
                      onClick={() => navigate('/dashboard/practice')}
                    >
                      {copy('练习中心', 'Practice')}
                    </Button>
                  </div>
                </div>

                {learningPath.status === 'ready' ? (
                  <div
                    className={pageListGapClass}
                    onWheel={handleActivityWheel}
                  >
                    {visibleActivity.map((item, index) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => navigate(item.href)}
                        className={`${pageInteractiveRowClass} ${pageListItemTallClass} justify-between duration-300 animate-in fade-in slide-in-from-right-4 fill-mode-both`}
                        style={{ animationDelay: `${index * 45}ms` }}
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-borderTone bg-[hsl(var(--state-info-bg))] text-[hsl(var(--state-info-fg))] dark:border-borderTone dark:bg-[hsl(var(--state-info-bg))] dark:text-[hsl(var(--state-info-fg))]">
                          <Play className="h-4 w-4 fill-current" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className={`truncate ${pageKickerClass}`}>
                            {item.subject}
                          </div>
                          <div
                            className={`mt-1 truncate ${pageCardTitleClass}`}
                          >
                            {item.title}
                          </div>
                          <div className={`mt-1 truncate ${pageMetaTextClass}`}>
                            {item.reason}
                          </div>
                          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[hsl(var(--border-subtle))] dark:bg-surface-subtle">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{
                                width: `${Math.max(6, item.progress)}%`,
                              }}
                            />
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={pageNumericValueCompactClass}>
                            {item.progress}%
                          </div>
                          <div className={`mt-1 ${pageMetaTextClass}`}>
                            {learningPathTypeLabel(
                              item.recommendationType,
                              copy
                            )}
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
                          className={`flex ${pageListItemTallClass} items-center justify-center rounded-[22px] border border-dashed border-borderTone bg-surface-subtle dark:border-borderTone dark:bg-surface-subtle`}
                        >
                          <span className={pageKickerMutedClass}>
                            {copy('已到列表底部', 'End of list')}
                          </span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <PageEmptyState
                    title={copy(
                      '还没有最近学习记录',
                      'No recent learning path'
                    )}
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
                        className="rounded-2xl px-4 py-2 text-sm font-bold"
                      >
                        {copy('开始练习', 'Start Practicing')}
                      </Button>
                    }
                  />
                )}
              </Card>

              <Card
                className={`${pagePanelClass} min-h-0 shadow-none ${pageCardPaddingClass}`}
              >
                <div
                  className={`flex items-start justify-between gap-4 ${pageCardTitleGapClass}`}
                >
                  <div>
                    <h3
                      className={`flex items-center gap-2 ${pageSectionTitleClass}`}
                    >
                      <Activity className="h-5 w-5 text-primary" />
                      {t.dashboard?.subjectProgress ||
                        copy('学科进度', 'Subject Progress')}
                    </h3>
                    <p className={pageSectionDescriptionClass}>
                      {copy(
                        '按学科汇总章节练习表现，帮助你快速判断当前最稳和最需要补强的方向。',
                        'See chapter-level progress by subject to spot what is stable and what still needs work.'
                      )}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <PageDots
                      totalPages={totalSubjectPages}
                      page={subjectPage}
                      countLabel={copy(
                        `${subjectProgressItems.length} 科`,
                        `${subjectProgressItems.length} items`
                      )}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-2xl"
                      onClick={() => navigate('/dashboard/practice')}
                    >
                      {copy('去练习', 'Go Practice')}
                    </Button>
                  </div>
                </div>

                {subjectProgress.status === 'ready' ? (
                  <div
                    className={pageListGapClass}
                    onWheel={handleSubjectWheel}
                  >
                    {visibleSubjects.map((sub, index) => (
                      <div
                        key={sub.subjectId}
                        className="rounded-[22px] border border-borderTone bg-surface px-4 py-4 shadow-surface duration-300 animate-in fade-in slide-in-from-right-4 fill-mode-both dark:border-borderTone dark:bg-surface-subtle"
                        style={{ animationDelay: `${index * 45}ms` }}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className={`truncate ${pageCardTitleClass}`}>
                              {sub.subjectName}
                            </div>
                            <div className={`mt-1 ${pageMetaTextClass}`}>
                              {copy(
                                `${sub.chapterCount} 个章节 · ${sub.totalAttempts} 次作答`,
                                `${sub.chapterCount} chapters · ${sub.totalAttempts} attempts`
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className={`${pageNumericValueCompactClass} ${sub.overallMastery >= 80 ? 'text-[hsl(var(--state-success-fg))] dark:text-[hsl(var(--state-success-fg))]' : 'text-primary dark:text-primary'}`}
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
                        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[hsl(var(--border-subtle))] dark:bg-surface-subtle">
                          <div
                            className={`h-full rounded-full ${sub.overallMastery >= 80 ? 'bg-[hsl(var(--state-success-fg))]' : 'bg-primary'}`}
                            style={{
                              width: `${Math.max(4, sub.overallMastery)}%`,
                            }}
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
                          className={`flex ${pageListItemTallClass} items-center justify-center rounded-[22px] border border-dashed border-borderTone bg-surface-subtle dark:border-borderTone dark:bg-surface-subtle`}
                        >
                          <span className={pageKickerMutedClass}>
                            {copy('已到列表底部', 'End of list')}
                          </span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <PageEmptyState
                    title={copy(
                      '还没有学科进度数据',
                      'No subject progress yet'
                    )}
                    description={copy(
                      '先开始一次练习，系统才会逐步建立你的学科稳定度和进度分布。',
                      'Start practicing to build your subject progress and performance profile.'
                    )}
                    actions={
                      <Button
                        onClick={() => navigate('/dashboard/practice')}
                        className="rounded-2xl px-4 py-2 text-sm font-bold"
                      >
                        {copy('开始练习', 'Start Practicing')}
                      </Button>
                    }
                  />
                )}
              </Card>
            </section>
          </div>

          <div
            className={`min-w-0 2xl:min-h-0 2xl:overflow-hidden ${pageSectionGapClass}`}
          >
            <Card
              className={`${pagePanelClass} overflow-hidden rounded-[30px] bg-[radial-gradient(circle_at_top_right,hsl(var(--state-info-bg))_0%,transparent_30%),linear-gradient(145deg,hsl(var(--surface-default))_0%,hsl(var(--surface-muted))_58%,hsl(var(--surface-subtle))_100%)] shadow-none dark:bg-[radial-gradient(circle_at_top_right,hsl(var(--state-info-bg))_0%,transparent_28%),linear-gradient(145deg,hsl(var(--surface-default))_0%,hsl(var(--surface-muted))_58%,hsl(var(--surface-subtle))_100%)] dark:text-text-primary ${pageCardPaddingClass}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3
                    className={`flex items-center gap-2 ${pageSectionTitleClass}`}
                  >
                    <Trophy className="h-5 w-5 text-amber-300" />
                    {t.dashboard?.rank || copy('年级排名', 'Rank')}
                  </h3>
                  <p className={`${pageKickerMutedClass} mt-1`}>
                    {copy('当前赛季表现', 'Current season standing')}
                  </p>
                </div>
              </div>

              <div className="mt-4 text-center">
                {leaderboard.status === 'ready' &&
                leaderboard.percentile !== null &&
                leaderboard.peerAverageAccuracy !== null ? (
                  <>
                    <div
                      className={`${pageHeroNumericValueClass} text-primary dark:text-primary`}
                    >
                      {`Top ${leaderboard.percentile}%`}
                    </div>
                    <div className="mt-2 text-[13px] leading-6 text-text-secondary dark:text-text-secondary">
                      {copy(
                        '超过多数同年级学生',
                        'Ahead of most students in your grade'
                      )}
                    </div>
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
                    className="min-h-[148px] rounded-[22px] border border-dashed border-borderTone bg-surface/70 px-4 py-5 dark:border-borderTone dark:bg-surface/40"
                  />
                )}
              </div>

              <div className={`mt-3.5 grid grid-cols-2 ${pageGridGapClass}`}>
                <div className={`${pageInsetClass} px-4 py-3`}>
                  <div className={pageKickerClass}>
                    {copy('平均正确率', 'Average')}
                  </div>
                  <div className={pageNumericValueCompactClass}>
                    {leaderboard.peerAverageAccuracy !== null
                      ? `${leaderboard.peerAverageAccuracy}%`
                      : '--'}
                  </div>
                </div>
                <div className="rounded-2xl border border-borderTone bg-[hsl(var(--state-success-bg))] px-4 py-3 dark:border-borderTone dark:bg-[hsl(var(--state-success-bg))]">
                  <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--state-success-fg))] dark:text-[hsl(var(--state-success-fg))]">
                    {copy('你的表现', 'You')}
                  </div>
                  <div className={pageNumericValueCompactClass}>
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
                className="mt-3.5 w-full rounded-2xl py-3 text-sm font-bold"
              >
                {leaderboard.status === 'ready'
                  ? copy('查看排行榜', 'View Leaderboard')
                  : leaderboard.status === 'excluded'
                    ? copy('完善资料', 'Update Profile')
                    : copy('去赚 XP', 'Earn XP')}
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </Card>

            <Card
              className={`${pagePanelClass} min-h-0 flex-1 shadow-none ${pageCardPaddingClass}`}
            >
              <div
                className={`flex items-start justify-between gap-4 ${pageCardTitleGapClass}`}
              >
                <div>
                  <h3
                    className={`flex items-center gap-2 ${pageSectionTitleClass}`}
                  >
                    <Layers3 className="h-5 w-5 text-primary" />
                    {copy('最近练习回顾', 'Recent Practice')}
                  </h3>
                  <p className={pageSectionDescriptionClass}>
                    {copy(
                      '回看最近几次训练结果，并按原模式与配置直接重开一轮。',
                      'Review recent training results and jump back into the same mode and setup.'
                    )}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-2xl"
                  onClick={() => navigate('/dashboard/practice')}
                >
                  {copy('练习中心', 'Practice')}
                </Button>
              </div>

              {recentPractice.length > 0 ? (
                <div
                  className={`custom-scrollbar max-h-[332px] overflow-y-auto pr-1 ${pageListGapClass}`}
                >
                  {recentPractice.map((record) => (
                    <button
                      key={record.id}
                      type="button"
                      onClick={() => navigate(record.href)}
                      className={`${pageInteractiveRowClass} justify-between`}
                    >
                      <div className="min-w-0 flex-1">
                        {!modeAppearsInTitle(record.mode, record.title) ? (
                          <div className={pageKickerClass}>
                            {practiceModeLabel(record.mode, copy)}
                          </div>
                        ) : null}
                        <div className={`mt-1 truncate ${pageCardTitleClass}`}>
                          {record.title}
                        </div>
                        <div className={`mt-1 ${pageMetaTextClass}`}>
                          {[
                            record.subject,
                            recentPracticeDifficultyLabel(
                              record.difficulty,
                              copy
                            ),
                            formatRelativeDate(record.createdAt, copy),
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-[18px] font-semibold tracking-tight text-primary dark:text-primary">
                          {record.score}%
                        </div>
                        <div className={`mt-1 ${pageMetaTextClass}`}>
                          {record.correctCount}/{record.totalQuestions} ·{' '}
                          {formatDuration(record.duration, copy)}
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
                      className="rounded-2xl px-4 py-2 text-sm font-bold"
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
              welcomeTitle={
                t.dashboard?.dailyVibe || copy('今日灵感', 'Daily Vibe')
              }
              welcomeSub={copy(
                '当你不确定下一步做什么时，先让一句话帮你回到节奏。',
                'When you are unsure what to do next, let one line pull you back into rhythm.'
              )}
              className="min-h-[212px]"
            />
          </div>
        </section>
      </div>
    </div>
  )
}
