'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { DailyTaskType, PracticeMode } from '@prisma/client'
import type { DailyTask, User, UserSettings } from '@prisma/client'
import dayjs from 'dayjs'
import { claimTaskReward } from '@/actions/gamification/achievement'
import {
  ArrowRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Crown,
  Flame,
  Trophy,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { DashboardData } from '@/actions/dashboard'
import { SUBJECT_DEFINITIONS } from '@/lib/subjects'
import { cn } from '@/lib/utils'

type UserProfile = User & { settings?: UserSettings | null }

type ProfilePanelProps = {
  user: UserProfile
  stats: DashboardData['stats']
  overviewByWindow: DashboardData['overviewByWindow']
  subjectProgress: DashboardData['subjectProgress']
  recentPractice: DashboardData['recentPractice']
  dailyTasks: DashboardData['dailyTasks']
  leaderboard: DashboardData['leaderboard']
  lang: string
  onNavigate: (path: string) => void
}

type ActivityDay = DashboardData['overviewByWindow']['7D']['dailyActivity'][number]

type CalendarDay = {
  date: string
  weekdayLabel: string
  dayNumber: number
  active: boolean
  studySeconds: number
  inMonth: boolean
}

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const SUBJECTS_PER_PAGE = 4
const MONTH_OFFSETS = [-1, 0, 1] as const
const PROFILE_WIDE_SECTION_CLASS = 'md:relative md:left-[4%] md:w-[118%] md:max-w-none'
const PANEL_TITLE_CLASS = 'text-[11.5px] font-semibold tracking-tight text-[#1f150d]'

function copyByLang(lang: string, zh: string, en: string, ms?: string) {
  if (lang.startsWith('zh')) return zh
  if (lang.startsWith('ms')) return ms ?? en
  return en
}

function getTaskHref(task: DailyTask) {
  switch (task.type) {
    case DailyTaskType.COMPLETE_LESSON:
      return '/dashboard/courses'
    case DailyTaskType.QUIZ_SCORE:
      return '/dashboard/practice'
    case DailyTaskType.FIX_ERROR:
      return '/dashboard/practice/error-wiper'
    case DailyTaskType.ONBOARDING_PROFILE:
    case DailyTaskType.ONBOARDING_GOALS:
    case DailyTaskType.ONBOARDING_ASSESSMENT:
      return '/dashboard/settings'
    default:
      return '/dashboard/practice'
  }
}

function getTaskLabel(task: DailyTask, lang: string) {
  switch (task.type) {
    case DailyTaskType.LOGIN:
      return copyByLang(lang, '每日登录', 'Daily login')
    case DailyTaskType.COMPLETE_LESSON:
      return copyByLang(lang, '完成课程', 'Complete lesson')
    case DailyTaskType.FIX_ERROR:
      return copyByLang(lang, '错题巩固', 'Fix errors')
    case DailyTaskType.QUIZ_SCORE:
      return copyByLang(lang, '练习得分', 'Practice score')
    case DailyTaskType.ONBOARDING_PROFILE:
      return copyByLang(lang, '完善资料', 'Complete profile')
    case DailyTaskType.ONBOARDING_GOALS:
      return copyByLang(lang, '设置目标', 'Set goals')
    case DailyTaskType.ONBOARDING_ASSESSMENT:
      return copyByLang(lang, '难度校准', 'Difficulty check')
    default:
      return task.title
  }
}

function getPracticeModeLabel(mode: PracticeMode, lang: string) {
  switch (mode) {
    case 'SMART_DRILL':
      return copyByLang(lang, '智能练习', 'Smart drill')
    case 'ERROR_WIPER':
      return copyByLang(lang, '错题练习', 'Error wiper')
    case 'MOCK_EXAM':
      return copyByLang(lang, '模拟考试', 'Mock exam')
    case 'CHAPTER_DRILL':
      return copyByLang(lang, '章节训练', 'Chapter drill')
    case 'PAST_PAPER':
      return copyByLang(lang, '历年真题', 'Past paper')
    default:
      return copyByLang(lang, '练习', 'Practice')
  }
}

function getWeekdayIndex(date: dayjs.Dayjs) {
  return (date.day() + 6) % 7
}

function startOfMondayWeek(date: dayjs.Dayjs) {
  return date.startOf('day').subtract(getWeekdayIndex(date), 'day')
}

function formatDurationLabel(
  seconds: number | null,
  lang: string,
  fallback = false
) {
  if (!seconds || seconds <= 0) {
    return copyByLang(lang, fallback ? '暂无学习时长' : '未记录', fallback ? 'No study time yet' : 'Not tracked')
  }

  const totalMinutes = Math.max(1, Math.round(seconds / 60))
  if (totalMinutes < 60) {
    return copyByLang(lang, `${totalMinutes} 分钟`, `${totalMinutes} min`)
  }

  const hours = (totalMinutes / 60).toFixed(1)
  return copyByLang(lang, `${hours} 小时`, `${hours} h`)
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

function formatWeekDay(date: string, lang: string) {
  const day = dayjs(date)
  return lang.startsWith('zh') ? day.format('M/D') : day.format('M/D')
}

function buildMonthWeeks(
  monthDate: dayjs.Dayjs,
  activityMap: Map<string, ActivityDay>
) {
  const monthStart = monthDate.startOf('month').startOf('day')
  const monthEnd = monthDate.endOf('month').startOf('day')
  const gridStart = startOfMondayWeek(monthStart)
  const gridEnd = startOfMondayWeek(monthEnd).add(6, 'day')

  const weeks: CalendarDay[][] = []
  let cursor = gridStart
  let week: CalendarDay[] = []

  while (cursor.isBefore(gridEnd) || cursor.isSame(gridEnd, 'day')) {
    const key = cursor.format('YYYY-MM-DD')
    const activity = activityMap.get(key)

    week.push({
      date: key,
      weekdayLabel: WEEKDAY_LABELS[getWeekdayIndex(cursor)] ?? '',
      dayNumber: cursor.date(),
      active: Boolean(activity?.active),
      studySeconds: activity?.studySeconds ?? 0,
      inMonth: cursor.isSame(monthDate, 'month'),
    })

    if (week.length === 7) {
      weeks.push(week)
      week = []
    }

    cursor = cursor.add(1, 'day')
  }

  const todayKey = dayjs().format('YYYY-MM-DD')
  const currentWeekIndex =
    weeks.findIndex((weekDays) => weekDays.some((day) => day.date === todayKey)) ?? 0

  return {
    weeks,
    currentWeekIndex: currentWeekIndex >= 0 ? currentWeekIndex : 0,
  }
}

export function ProfilePanel({
  user,
  stats,
  overviewByWindow,
  subjectProgress,
  recentPractice,
  dailyTasks,
  leaderboard,
  lang,
  onNavigate,
}: ProfilePanelProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [claimingTaskId, setClaimingTaskId] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  const currentDate = useMemo(() => dayjs(), [])
  const currentMonthValue = currentDate.format('YYYY-MM')
  const monthOptions = useMemo(
    () =>
      MONTH_OFFSETS.map((offset) => {
        const month = currentDate.add(offset, 'month')
        return {
          value: month.format('YYYY-MM'),
          label: month.format('MMMM'),
        }
      }),
    [currentDate]
  )

  const [selectedMonthValue, setSelectedMonthValue] = useState(currentMonthValue)
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0)
  const [subjectPage, setSubjectPage] = useState(0)

  const weeklyOverview = overviewByWindow['7D']
  const monthlyOverview = overviewByWindow['30D']

  const weeklyActivity = weeklyOverview.dailyActivity.slice(-7)
  const weeklyStudySeconds = useMemo(
    () =>
      weeklyActivity.reduce((sum, day) => sum + Math.max(0, day.studySeconds), 0),
    [weeklyActivity]
  )

  const weeklyVisualMaxSeconds = Math.max(
    1,
    ...weeklyActivity.map((item) =>
      item.studySeconds > 0 ? item.studySeconds : item.active ? 60 : 0
    )
  )

  const weeklyTimeBars = useMemo(() => {
    const hasRealStudyTime = weeklyStudySeconds > 0
    const fallbackHeights = [12, 18, 10, 16, 20, 9, 14]

    return (
      weeklyActivity.map((day, index) => {
        const visualSource =
          day.studySeconds > 0
            ? day.studySeconds
            : day.active
              ? Math.max(18, Math.round(weeklyVisualMaxSeconds * 0.35))
              : 0

        return {
          ...day,
          weekdayLabel: WEEKDAY_LABELS[index] ?? '',
          displayHeight: visualSource
            ? Math.max(8, Math.round((visualSource / weeklyVisualMaxSeconds) * 54))
            : hasRealStudyTime
              ? 4
              : fallbackHeights[index % fallbackHeights.length],
          label: formatDurationLabel(day.studySeconds, lang, true),
        }
      }) as Array<
        ActivityDay & {
          weekdayLabel: string
          displayHeight: number
          label: string
        }
      >
    )
  }, [lang, weeklyActivity, weeklyStudySeconds, weeklyVisualMaxSeconds])

  const weeklyAverageSeconds = weeklyActivity.length
    ? weeklyStudySeconds / weeklyActivity.length
    : 0

  const activityByDate = useMemo(() => {
    const map = new Map<string, ActivityDay>()
      ;[...monthlyOverview.dailyActivity, ...weeklyOverview.dailyActivity].forEach((day) => {
        map.set(day.date, day)
      })
    return map
  }, [monthlyOverview.dailyActivity, weeklyOverview.dailyActivity])

  const selectedMonthDate = useMemo(
    () => dayjs(`${selectedMonthValue}-01`),
    [selectedMonthValue]
  )
  const selectedMonthCalendar = useMemo(
    () => buildMonthWeeks(selectedMonthDate, activityByDate),
    [activityByDate, selectedMonthDate]
  )

  useEffect(() => {
    if (selectedMonthValue === currentMonthValue) {
      setSelectedWeekIndex(selectedMonthCalendar.currentWeekIndex)
      return
    }

    setSelectedWeekIndex(0)
  }, [currentMonthValue, selectedMonthCalendar.currentWeekIndex, selectedMonthValue])

  useEffect(() => {
    if (selectedWeekIndex >= selectedMonthCalendar.weeks.length) {
      setSelectedWeekIndex(Math.max(0, selectedMonthCalendar.weeks.length - 1))
    }
  }, [selectedMonthCalendar.weeks.length, selectedWeekIndex])

  const currentWeekDays = selectedMonthCalendar.weeks[selectedWeekIndex] ?? []
  const activeCount = currentWeekDays.filter((day) => day.active).length
  const hasWeeklyActivityData = activeCount > 0
  const hasWeeklyStudyData = weeklyStudySeconds > 0
  const weekLabel =
    selectedMonthCalendar.weeks.length > 0
      ? `Week ${selectedWeekIndex + 1}`
      : 'Week 1'

  const sortedTasks = useMemo(
    () =>
      [...dailyTasks.items].sort((a, b) => {
        const aClaimed = Boolean(a.isClaimed)
        const bClaimed = Boolean(b.isClaimed)
        const aCompleted = a.currentCount >= a.targetCount
        const bCompleted = b.currentCount >= b.targetCount

        if (aClaimed !== bClaimed) return aClaimed ? 1 : -1
        if (aCompleted !== bCompleted) return aCompleted ? -1 : 1
        if (a.xpReward !== b.xpReward) return b.xpReward - a.xpReward
        return a.title.localeCompare(b.title, 'zh-Hans-CN')
      }),
    [dailyTasks.items]
  )

  const topTasks = sortedTasks.slice(0, 3)
  const avatarFallback = (user.displayName || user.username || 'U')
    .slice(0, 1)
    .toUpperCase()

  const topSubjects = useMemo(() => {
    if (subjectProgress.items.length === 0) {
      return SUBJECT_DEFINITIONS.filter((subject) => subject.key !== 'other').map(
        (subject) => ({
          subjectId: subject.key,
          subjectName: subject.canonicalName,
          overallMastery: 0,
          chapterCount: 0,
          totalAttempts: 0,
          chapters: [],
        })
      )
    }

    return [...subjectProgress.items]
      .sort((a, b) => {
        if (b.overallMastery !== a.overallMastery) {
          return b.overallMastery - a.overallMastery
        }
        if (b.totalAttempts !== a.totalAttempts) {
          return b.totalAttempts - a.totalAttempts
        }
        return a.subjectName.localeCompare(b.subjectName, 'zh-Hans-CN')
      })
  }, [subjectProgress.items])

  const totalSubjectPages = Math.max(1, Math.ceil(topSubjects.length / SUBJECTS_PER_PAGE))
  const visibleSubjects = useMemo(
    () =>
      topSubjects.slice(
        subjectPage * SUBJECTS_PER_PAGE,
        (subjectPage + 1) * SUBJECTS_PER_PAGE
      ),
    [subjectPage, topSubjects]
  )

  useEffect(() => {
    setSubjectPage(0)
  }, [topSubjects.length])

  const handleSubjectWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (totalSubjectPages <= 1) return
    event.preventDefault()
    const direction = event.deltaY > 0 ? 1 : -1
    setSubjectPage((prev) => Math.max(0, Math.min(totalSubjectPages - 1, prev + direction)))
  }

  const recentPracticeItems = recentPractice.items.slice(0, 5)

  const rankLabel =
    leaderboard.status === 'ready' && leaderboard.rank !== null
      ? `#${leaderboard.rank}`
      : leaderboard.percentile !== null
        ? copyByLang(lang, `前 ${leaderboard.percentile}%`, `Top ${leaderboard.percentile}%`)
        : copyByLang(lang, '未上榜', 'Not ranked')

  const handleClaimTask = async (task: DailyTask) => {
    if (claimingTaskId) return

    setClaimingTaskId(task.id)
    try {
      const result = await claimTaskReward(task.id)
      if (result.success) {
        toast({
          title: copyByLang(lang, '已领取 XP', 'XP claimed'),
          description: copyByLang(
            lang,
            `你获得了 ${task.xpReward} XP。`,
            `You earned ${task.xpReward} XP.`
          ),
        })
        router.refresh()
      } else {
        toast({
          title: copyByLang(lang, '领取失败', 'Claim failed'),
          description:
            result.error ||
            copyByLang(lang, '奖励领取失败，请稍后重试。', 'Failed to claim reward, please try again.'),
          variant: 'destructive',
        })
      }
    } finally {
      setClaimingTaskId(null)
    }
  }

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <TooltipProvider delayDuration={100}>
      <div className="space-y-1.5 text-[#21160e] md:origin-top-right md:scale-[0.9] md:w-[111.2%]">
        <div className={`rounded-[30px] border border-[#e8ddcf] bg-[#fffdfa] p-2.5 shadow-[0_20px_40px_-34px_rgba(120,72,32,0.2)] ${PROFILE_WIDE_SECTION_CLASS}`}>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
            <div className="mx-auto shrink-0 md:mx-0">
              <div className="rounded-full bg-gradient-to-br from-[#f4b981] via-[#ef8e39] to-[#ea7528] p-[4px] shadow-[0_10px_24px_-18px_rgba(234,117,40,0.65)]">
                <div className="rounded-full bg-[#fffdf8] p-[4px]">
                  <Avatar className="h-[88px] w-[88px] rounded-full border border-[#efddc8] bg-[#f8efe2] md:h-[96px] md:w-[96px]">
                    <AvatarImage
                      src={user.avatar || undefined}
                      alt={user.displayName || user.username || 'student'}
                      className="object-cover"
                    />
                    <AvatarFallback className="rounded-full bg-[#f3e4d4] text-[22px] font-semibold text-[#4c3723] md:text-[24px]">
                      {avatarFallback}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>

            <div className="min-w-0 flex-1 text-center md:text-left">
              <div className="truncate text-[17px] font-semibold tracking-tight text-[#2f2c2a] md:text-[20px]">
                {user.displayName || user.username || copyByLang(lang, '未命名学生', 'Unnamed student')}
              </div>
              <div className="mt-0.5 truncate text-[10px] font-medium text-[#7f7f7f] md:text-[11px]">
                {user.school || copyByLang(lang, '未填写学校', 'School not set')}
              </div>
              <div className="mt-0.5 truncate text-[9px] font-medium text-[#8e8e8e] md:text-[10px]">
                {user.grade
                  ? copyByLang(lang, `Grade ${user.grade}`, `Grade ${user.grade}`)
                  : copyByLang(lang, '年级未设置', 'Grade not set')}
              </div>
            </div>
          </div>

          <div className="mt-2.5 border-t border-[#e8ded2] pt-2">
            <div className="grid grid-cols-1 divide-y divide-[#e8ded2] text-[#2f2c2a] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              <div className="flex items-center justify-center gap-1.5 py-2 sm:py-1.25">
                <Trophy className="h-[18px] w-[18px] shrink-0 text-[#ea7528]" />
                <div className="text-[15px] font-semibold tracking-tight">
                  {stats.xp.toLocaleString()}
                  <span className="ml-1 text-[10px] font-medium text-[#404040]">XP</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-1.5 py-2 sm:py-1.25">
                <Flame className="h-[18px] w-[18px] shrink-0 text-[#ea7528]" />
                <div className="text-[15px] font-semibold tracking-tight">
                  {stats.streak}
                  <span className="ml-1 text-[10px] font-medium text-[#404040]">
                    {copyByLang(lang, '天连胜', 'Days Streak')}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-1.5 py-2 sm:py-1.25">
                <Crown className="h-[18px] w-[18px] shrink-0 text-[#ea7528]" />
                <div className="text-[10px] font-semibold tracking-tight text-[#2f2c2a]">
                  {copyByLang(lang, '排名', 'Rank')}: {rankLabel}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`w-full ${PROFILE_WIDE_SECTION_CLASS}`}>
          <div className="grid grid-cols-2 gap-2.5">
            <section className="rounded-[28px] border border-[#e8ddcf] bg-[#fffdfa] p-2.5 shadow-[0_20px_40px_-34px_rgba(120,72,32,0.18)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className={PANEL_TITLE_CLASS}>
                    {copyByLang(lang, '本周活动', 'Weekly activity')}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 rounded-full border-[#efe2d4] bg-[#fffdf8] text-[#8d8378] hover:bg-[#f7f1e8]"
                      onClick={() =>
                        setSelectedWeekIndex((prev) => Math.max(0, prev - 1))
                      }
                      disabled={selectedWeekIndex <= 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 rounded-full border-[#efe2d4] bg-[#fffdf8] text-[#8d8378] hover:bg-[#f7f1e8]"
                      onClick={() =>
                        setSelectedWeekIndex((prev) =>
                          Math.min(selectedMonthCalendar.weeks.length - 1, prev + 1)
                        )
                      }
                      disabled={
                        selectedWeekIndex >= selectedMonthCalendar.weeks.length - 1
                      }
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  {isMounted ? (
                    <Select value={selectedMonthValue} onValueChange={setSelectedMonthValue}>
                      <SelectTrigger className="h-8 w-fit min-w-[88px] rounded-2xl border-[#eee4d8] bg-[#f7f1e8] px-3 text-[11px] font-semibold text-[#363636] shadow-none hover:bg-[#f4ede4] [&>svg]:hidden">
                        <span>{monthOptions.find((option) => option.value === selectedMonthValue)?.label ?? 'Month'}</span>
                      </SelectTrigger>
                      <SelectContent className="border-[#e6d6c4] bg-[#ffffff] text-[#21160e]">
                        {monthOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <button
                      type="button"
                      className="h-8 w-fit min-w-[88px] rounded-2xl border border-[#eee4d8] bg-[#f7f1e8] px-3 text-[11px] font-semibold text-[#363636]"
                    >
                      {monthOptions.find((option) => option.value === selectedMonthValue)?.label ?? 'Month'}
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="text-[11px] font-medium text-[#8b8178]">{weekLabel}</div>
              </div>

              <div className="mt-3 grid grid-cols-7 gap-0.5">
                {currentWeekDays.map((day, index) => (
                  <div key={day.date} className="flex min-w-0 flex-col items-center gap-1.5">
                    <div
                      className={cn(
                        'flex h-[30px] w-[30px] items-center justify-center rounded-full text-[10px] font-semibold transition-colors md:h-[34px] md:w-[34px] md:text-[11px]',
                        hasWeeklyActivityData
                          ? day.active
                            ? 'bg-gradient-to-br from-[#f0c49b] via-[#ef8a32] to-[#ea7528] text-white shadow-[0_14px_26px_-18px_rgba(234,117,40,0.65)]'
                            : 'bg-[#e8ddd0] text-[#8e7d6d]'
                          : ['bg-[#e8ddd0] text-[#8e7d6d]', 'bg-[#ef8a32] text-white', 'bg-[#f4c29b] text-white', 'bg-[#ef8a32] text-white', 'bg-[#e8ddd0] text-[#8e7d6d]', 'bg-[#f4c29b] text-white', 'bg-[#e8ddd0] text-[#8e7d6d]'][index] ?? 'bg-[#e8ddd0] text-[#8e7d6d]'
                      )}
                    >
                      {day.dayNumber}
                    </div>
                    <div className="text-center text-[9px] font-semibold text-[#b2a396]">
                      {day.weekdayLabel}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-2 text-[10px] font-semibold tracking-tight text-[#363636]">
                {hasWeeklyActivityData ? `${activeCount}/7 active` : '3/7 active'}
              </div>
            </section>

            <section className="rounded-[28px] border border-[#e8ddcf] bg-[#fffdfa] p-2.5 shadow-[0_20px_40px_-34px_rgba(120,72,32,0.18)]">
              <div className={PANEL_TITLE_CLASS}>
                {copyByLang(lang, '本周时长', 'Weekly study time')}
              </div>
              <div className="mt-1.5 text-[10.5px] text-[#8b8178]">
                {copyByLang(lang, '周学习时长', 'Weekly Study Time')}
              </div>
              <div className="mt-0.5 text-[11px] font-semibold text-[#353535]">
                {hasWeeklyStudyData
                  ? `Daily Average: ${Math.max(1, Math.round(weeklyStudySeconds / 60 / 7))}m`
                  : 'Daily Average: 1h 45m'}
              </div>

              <div className="relative mt-2.5 h-[130px] overflow-hidden rounded-[24px] px-1.5 pt-1">
                <div
                  className="pointer-events-none absolute left-4 right-4 border-t border-dashed border-[#d8cdc0]"
                  style={{
                    bottom: `${Math.max(
                      14,
                      Math.min(
                        74,
                        Math.round(
                          hasWeeklyStudyData
                            ? (weeklyAverageSeconds / weeklyVisualMaxSeconds) * 86
                            : 42
                        )
                      )
                    )}px`,
                  }}
                />

                <div className="absolute inset-x-1.5 top-1.5 flex h-[102px] items-end justify-between gap-1 overflow-hidden">
                  {weeklyTimeBars.map((day, index) => (
                    <Tooltip key={day.date}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1.5"
                          aria-label={`${day.weekdayLabel} ${formatWeekDay(day.date, lang)} ${day.label}`}
                        >
                          <div className="flex h-[84px] items-end">
                            <div
                              className={cn(
                                'w-[14px] rounded-t-[999px] transition-transform duration-200 hover:-translate-y-[1px] md:w-[16px]',
                                hasWeeklyStudyData
                                  ? day.studySeconds > 0
                                    ? day.studySeconds >= weeklyAverageSeconds
                                      ? 'bg-[#ef8a32]'
                                      : 'bg-[#f2c39b]'
                                    : day.active
                                      ? 'bg-[#e8ddd0]'
                                      : 'bg-[#ece3d7]'
                                  : ['bg-[#e8ddd0]', 'bg-[#f2c39b]', 'bg-[#e8ddd0]', 'bg-[#ef8a32]', 'bg-[#e8ddd0]', 'bg-[#f2c39b]', 'bg-[#e8ddd0]'][index] ?? 'bg-[#e8ddd0]'
                              )}
                              style={{
                                height: hasWeeklyStudyData
                                  ? `${Math.max(18, day.displayHeight * 1.18)}px`
                                  : ['44px', '66px', '54px', '94px', '40px', '50px', '56px'][index] ?? '52px',
                              }}
                            />
                          </div>
                          <div className="text-[9.5px] font-semibold text-[#b2a396]">{day.weekdayLabel}</div>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="rounded-xl border-[#e6d6c4] bg-[#ffffff] text-[11px] leading-5 text-[#21160e] shadow-[0_16px_30px_-20px_rgba(120,72,32,0.28)]">
                        <div className="font-semibold">
                          {day.weekdayLabel} · {formatWeekDay(day.date, lang)}
                        </div>
                        <div className="text-[#7b6756]">
                          {day.studySeconds > 0
                            ? formatDurationLabel(day.studySeconds, lang)
                            : copyByLang(lang, '暂无学习记录', 'No study record')}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className={`w-full ${PROFILE_WIDE_SECTION_CLASS}`}>
          <div className="grid grid-cols-2 gap-2.5">
            <section
              className="rounded-[20px] border border-[#e7d7c4] bg-[#ffffff] p-2.5 shadow-[0_10px_24px_-24px_rgba(120,72,32,0.24)]"
              onWheel={handleSubjectWheel}
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className={PANEL_TITLE_CLASS}>
                    {copyByLang(lang, '科目进度', 'Subject progress')}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-[#e6d6c4] bg-[#fff8f0] px-2 py-0.5 text-[9px] font-semibold text-[#7b6756]">
                    {copyByLang(lang, `${subjectPage + 1}/${totalSubjectPages}`, `${subjectPage + 1}/${totalSubjectPages}`)}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 rounded-xl border-[#e6d6c4] bg-transparent px-2.5 text-[10px] font-semibold text-[#6f5a4a] hover:bg-[#fff8f0]"
                    onClick={() => onNavigate('/dashboard/practice')}
                  >
                    {copyByLang(lang, '去练习', 'Practice')}
                  </Button>
                </div>
              </div>

              <div className="rounded-[20px] bg-[#fffdfb]">
                {Array.from({ length: SUBJECTS_PER_PAGE }).map((_, index) => {
                  const subject = visibleSubjects[index]
                  if (!subject) {
                    return (
                      <div
                        key={`subject-empty-${index}`}
                        className={cn(
                          'px-3 py-2.5',
                          index !== SUBJECTS_PER_PAGE - 1 && 'border-b border-[#eadfd2]'
                        )}
                      >
                        <div className="h-[54px] rounded-[14px] border border-dashed border-[#efe2d5] bg-[#fffdfb]" />
                      </div>
                    )
                  }

                  const progress = Math.max(0, Math.min(100, subject.overallMastery))
                  const statusLabel =
                    progress >= 80
                      ? copyByLang(lang, '稳定', 'Stable')
                      : progress >= 50
                        ? copyByLang(lang, '提升中', 'Growing')
                        : copyByLang(lang, '待提升', 'Needs work')

                  return (
                    <div
                      key={subject.subjectId}
                      className={cn(
                        'px-3 py-2.5',
                        index !== SUBJECTS_PER_PAGE - 1 && 'border-b border-[#eadfd2]'
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-[11.5px] font-semibold text-[#1f150d]">
                            {subject.subjectName}
                          </div>
                          <div className="mt-0.5 truncate text-[9.5px] text-[#7b6756]">
                            {copyByLang(
                              lang,
                              `${subject.chapterCount} 个章节 · ${subject.totalAttempts} 次作答`,
                              `${subject.chapterCount} chapters · ${subject.totalAttempts} attempts`
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[14px] font-semibold tracking-tight text-[#1f150d]">
                            {Math.round(progress)}%
                          </div>
                          <div className="text-[9px] text-[#7b6756]">{statusLabel}</div>
                        </div>
                      </div>

                      <div className="mt-2 h-2 rounded-full bg-[#f2e8dd]">
                        <div
                          className={cn(
                            'h-full rounded-full bg-gradient-to-r transition-all duration-300',
                            progress > 0
                              ? 'from-[#ffbc73] via-[#f08d3a] to-[#ea7528]'
                              : 'from-[#e8ddd2] to-[#e8ddd2]'
                          )}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            <section className="rounded-[20px] border border-[#eadccf] bg-white p-2.5 shadow-[0_8px_18px_-22px_rgba(120,72,32,0.16)]">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className={PANEL_TITLE_CLASS}>
                  {copyByLang(lang, '今日任务', 'Today tasks')}
                </div>
                <span className="rounded-full border border-[#ecdfcf] bg-[#faf5ef] px-2 py-0.5 text-[9px] font-semibold text-[#7b6756]">
                  {copyByLang(lang, `${topTasks.length} 条`, `${topTasks.length} items`)}
                </span>
              </div>

              <div className="divide-y divide-[#efe4d8] rounded-[16px] border border-[#eadccf] bg-[#fffdfb]">
                {topTasks.length > 0 ? (
                  topTasks.map((task) => {
                    const completed = task.currentCount >= task.targetCount
                    const claimed = Boolean(task.isClaimed)
                    const progress = Math.min(
                      100,
                      Math.max(0, (task.currentCount / task.targetCount) * 100)
                    )
                    const taskHref = getTaskHref(task)

                    return (
                      <div
                        key={task.id}
                        className={cn(
                          'group px-2.5 py-2.5 transition-colors',
                          claimed
                            ? 'bg-[#faf7f2] opacity-80'
                            : completed
                              ? 'bg-[#fffaf3]'
                              : 'cursor-pointer bg-[#fffefd] hover:bg-[#fffaf7]'
                        )}
                        onClick={() => {
                          if (!completed && !claimed && taskHref) {
                            onNavigate(taskHref)
                          }
                        }}
                      >
                        <div className="flex items-start gap-2.5">
                          <div
                            className={cn(
                              'mt-0.5 flex h-6 w-6 items-center justify-center rounded-md border',
                              claimed
                                ? 'border-[#eadccf] bg-[#f3eee7] text-[#a08d7d]'
                                : completed
                                  ? 'border-[#eadccf] bg-[#fff3e7] text-[#ea7528]'
                                  : 'border-[#eadccf] bg-[#fffaf4] text-[#ea7528]'
                            )}
                          >
                            <div className="h-1.5 w-1.5 rounded-full bg-current" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="truncate text-[10.5px] font-semibold tracking-tight text-[#1f150d]">
                                  {getTaskLabel(task, lang)}
                                </div>
                                <div className="mt-0.5 flex items-center gap-1.5">
                                  <span
                                    className={cn(
                                      'rounded-full px-1.5 py-0.5 text-[9px] font-semibold',
                                      claimed
                                        ? 'bg-[#ebe4dc] text-[#8b7866]'
                                        : completed
                                          ? 'bg-[#ffe8d5] text-[#ea7528]'
                                          : 'bg-[#eef8ed] text-[#4e8d4d]'
                                    )}
                                  >
                                    {claimed
                                      ? copyByLang(lang, '已领取', 'Claimed')
                                      : completed
                                        ? copyByLang(lang, '可领取', 'Claim now')
                                        : copyByLang(lang, '进行中', 'In progress')}
                                  </span>
                                  <span className="text-[9px] text-[#7b6756]">
                                    {task.currentCount}/{task.targetCount}
                                  </span>
                                </div>
                              </div>

                              {!claimed && task.xpReward > 0 ? (
                                <span className="shrink-0 rounded-full bg-[#fff4e8] px-2 py-0.5 text-[9px] font-semibold text-[#ea7528]">
                                  +{task.xpReward} XP
                                </span>
                              ) : null}
                            </div>

                            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[#ece2d6]">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-[#ffb15c] via-[#f08b38] to-[#ea7528] transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>

                          <div className="shrink-0 pt-0.5">
                            {claimed ? (
                              <span className="inline-flex h-6 items-center justify-center rounded-md border border-[#eadccf] bg-[#f4efe9] px-2 text-[9px] font-semibold text-[#8b7866]">
                                {copyByLang(lang, '已领取', 'Claimed')}
                              </span>
                            ) : completed ? (
                              <Button
                                type="button"
                                size="sm"
                                isLoading={claimingTaskId === task.id}
                                loadingText={copyByLang(lang, '领取中', 'Claiming')}
                                className="h-6 rounded-md bg-[#136f49] px-2 text-[9px] font-semibold text-white hover:bg-[#0f5d3d]"
                                onClick={(event) => {
                                  event.stopPropagation()
                                  void handleClaimTask(task)
                                }}
                              >
                                {copyByLang(lang, '领取', 'Claim')}
                              </Button>
                            ) : (
                              <button
                                type="button"
                                className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-[#eadccf] bg-[#fffdfb] text-[#9a8775] transition-colors hover:border-[#d8c6af] hover:bg-[#ea7528] hover:text-white"
                                aria-label={copyByLang(lang, '去完成任务', 'Open task')}
                                onClick={(event) => {
                                  event.stopPropagation()
                                  if (taskHref) onNavigate(taskHref)
                                }}
                              >
                                <ArrowRight className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="rounded-[18px] border border-dashed border-[#ead7c2] bg-[#fff8f0] px-3 py-3 text-[12px] text-[#7b6756]">
                    {copyByLang(lang, '今天没有任务。', 'No tasks today.')}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

        <div className={`w-full ${PROFILE_WIDE_SECTION_CLASS}`}>
          <section className="rounded-[20px] border border-[#eadccf] bg-white p-2.5 shadow-[0_8px_18px_-22px_rgba(120,72,32,0.16)]">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className={PANEL_TITLE_CLASS}>
                {copyByLang(lang, '最近练习', 'Recent practice')}
              </div>
              <span className="rounded-full border border-[#ecdfcf] bg-[#faf5ef] px-2 py-0.5 text-[9px] font-semibold text-[#7b6756]">
                {copyByLang(lang, '练习中心', 'Practice')}
              </span>
            </div>

            <div className="divide-y divide-[#efe4d8] rounded-[16px] border border-[#eadfd2] bg-[#fffdfb]">
              {recentPracticeItems.length > 0 ? (
                recentPracticeItems.map((record) => (
                  <button
                    key={record.id}
                    type="button"
                    onClick={() => onNavigate(record.href)}
                    className="flex w-full items-center justify-between gap-2.5 px-2.5 py-2 text-left transition-colors hover:bg-[#fff8f1]"
                  >
                    <div className="flex min-w-0 items-start gap-2">
                      <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-md border border-[#ecdccc] bg-[#f8f1e8] text-[9px] font-semibold text-[#d76e24]">
                        {record.subject.slice(0, 1)}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-[10.5px] font-semibold text-[#1f150d]">
                          {record.title}
                        </div>
                        <div className="mt-0.5 truncate text-[9px] text-[#7b6756]">
                          {[
                            record.subject,
                            getPracticeModeLabel(record.mode, lang),
                            formatRelativeDate(record.createdAt, (zh, en) =>
                              copyByLang(lang, zh, en)
                            ),
                          ].join(' · ')}
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[9px] font-semibold text-[#ea7528] shadow-[0_4px_10px_-8px_rgba(120,72,32,0.35)]">
                      {record.score}%
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-2.5 py-2 text-[11px] text-[#7b6756]">
                  {copyByLang(lang, '还没有最近练习。', 'No recent practice yet.')}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </TooltipProvider>
  )
}
