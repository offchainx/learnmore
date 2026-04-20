'use client'

import React, { useEffect, useMemo, useState, useTransition } from 'react'
import { DailyTask, User, UserSettings, DailyTaskType } from '@prisma/client'
import { Target, ArrowRight, CircleCheck, CircleHelp } from 'lucide-react'
import {
  claimTaskReward,
  completeOnboardingTask,
} from '@/actions/gamification/achievement'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useApp } from '@/providers'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import { PageEmptyState } from '@/components/shared/PageEmptyState'

import { ProfileDialog } from './dialogs/ProfileDialog'
import { GoalsDialog } from './dialogs/GoalsDialog'
import { AssessmentDialog } from './dialogs/AssessmentDialog'

interface DailyMissionsProps {
  tasks?: DailyTask[]
  user?: User & { settings?: UserSettings | null }
  lazyLoadTasks?: boolean
}

const TASKS_PER_PAGE = 3

function SectionHelpTooltip({ content }: { content: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex h-5 w-5 items-center justify-center rounded-full text-text-tertiary transition-colors hover:text-primary"
          aria-label="More information"
        >
          <CircleHelp className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs rounded-xl border-borderTone bg-surface text-[12px] leading-5 text-text-secondary shadow-surface dark:border-borderTone dark:bg-surface-subtle dark:text-text-secondary">
        {content}
      </TooltipContent>
    </Tooltip>
  )
}

export const DailyMissions = ({ tasks = [], user, lazyLoadTasks = false }: DailyMissionsProps) => {
  const { t, lang } = useApp()
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [page, setPage] = useState(0)
  const [resolvedTasks, setResolvedTasks] = useState<DailyTask[]>(tasks)
  const [isLoadingTasks, setIsLoadingTasks] = useState(lazyLoadTasks && tasks.length === 0)

  const copy = (zh: string, en: string) => (lang.startsWith('zh') ? zh : en)

  const [showProfile, setShowProfile] = useState(false)
  const [showGoals, setShowGoals] = useState(false)
  const [showAssessment, setShowAssessment] = useState(false)

  useEffect(() => {
    if (!lazyLoadTasks) {
      setResolvedTasks(tasks)
      setIsLoadingTasks(false)
      return
    }

    let cancelled = false

    const loadTasks = async () => {
      setIsLoadingTasks(true)
      try {
        const response = await fetch('/api/dashboard/daily-tasks', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        })

        if (!response.ok) {
          throw new Error(`Failed to load daily tasks: ${response.status}`)
        }

        const payload = (await response.json()) as { tasks?: DailyTask[] }
        if (!cancelled) {
          setResolvedTasks(payload.tasks ?? [])
        }
      } catch (error) {
        if (!cancelled) {
          console.warn('[DailyMissions] Failed to lazy-load tasks:', error)
          setResolvedTasks(tasks)
        }
      } finally {
        if (!cancelled) {
          setIsLoadingTasks(false)
        }
      }
    }

    if (tasks.length > 0) {
      setResolvedTasks(tasks)
      setIsLoadingTasks(false)
    } else {
      void loadTasks()
    }

    return () => {
      cancelled = true
    }
  }, [lazyLoadTasks, tasks])

  const getTaskHref = (task: DailyTask) => {
    switch (task.type) {
      case 'COMPLETE_LESSON':
        return '/dashboard/courses'
      case 'QUIZ_SCORE':
        return '/dashboard/practice'
      case 'FIX_ERROR':
        return '/dashboard/practice/error-wiper'
      default:
        return null
    }
  }

  const handleClaim = (taskId: string, reward: number) => {
    startTransition(async () => {
      const result = await claimTaskReward(taskId)
      if (result.success) {
        toast({
          title: copy('已领取 XP', 'XP Claimed!'),
          description: copy(
            `你获得了 ${reward} XP。`,
            `You earned ${reward} XP.`
          ),
        })
        router.refresh()
      } else {
        toast({
          title: copy('领取失败', 'Error'),
          description:
            result.error ||
            copy('奖励领取失败，请稍后重试。', 'Failed to claim reward'),
          variant: 'destructive',
        })
      }
    })
  }

  const handleTaskAction = (task: DailyTask) => {
    if (task.isClaimed || task.currentCount >= task.targetCount) return

    switch (task.type) {
      case 'ONBOARDING_PROFILE':
        setShowProfile(true)
        break
      case 'ONBOARDING_GOALS':
        setShowGoals(true)
        break
      case 'ONBOARDING_ASSESSMENT':
        setShowAssessment(true)
        break
      default:
        {
          const href = getTaskHref(task)
          if (href) {
            router.push(href)
          }
        }
        break
    }
  }

  const handleDialogSuccess = async (type: DailyTaskType) => {
    const result = await completeOnboardingTask(type)
    if (result.success) {
      toast({
        title: copy('任务完成', 'Task Completed!'),
        description: copy(
          '别忘了领取本次 XP 奖励。',
          "Don't forget to claim your XP."
        ),
      })
      router.refresh()
      return
    }

    toast({
      title: copy('任务失败', 'Task Failed'),
      description:
        result.error ||
        copy(
          '当前会话已失效或任务无法完成，请重新登录后重试。',
          'Your session may have expired. Please sign in again and retry.'
        ),
      variant: 'destructive',
    })
  }

  const sortedTasks = useMemo(
    () =>
      [...resolvedTasks].sort((a, b) => {
        const aCompleted = a.currentCount >= a.targetCount
        const bCompleted = b.currentCount >= b.targetCount

        if (a.isClaimed && !b.isClaimed) return 1
        if (!a.isClaimed && b.isClaimed) return -1

        if (aCompleted && !bCompleted) return -1
        if (!aCompleted && bCompleted) return 1

        return 0
      }),
    [resolvedTasks]
  )

  const totalPages = Math.max(1, Math.ceil(sortedTasks.length / TASKS_PER_PAGE))
  const visibleTasks = useMemo(
    () => sortedTasks.slice(page * TASKS_PER_PAGE, (page + 1) * TASKS_PER_PAGE),
    [page, sortedTasks]
  )

  useEffect(() => {
    setPage(0)
  }, [sortedTasks.length])

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (totalPages <= 1) return
    event.preventDefault()
    const direction = event.deltaY > 0 ? 1 : -1
    setPage((prev) => Math.max(0, Math.min(totalPages - 1, prev + direction)))
  }

  return (
    <TooltipProvider delayDuration={120}>
      <Card className="h-full overflow-hidden rounded-[24px] border border-borderTone bg-surface p-0 text-text-primary shadow-surface dark:border-borderTone dark:bg-surface dark:text-text-primary dark:shadow-none xl:h-[418px]">

        <div className="relative z-10 flex h-full flex-col p-5">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-[24px] font-semibold tracking-tight">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-borderTone bg-[hsl(var(--state-info-bg))]/70 text-primary dark:border-borderTone dark:bg-[hsl(var(--state-info-bg))]/18 dark:text-primary">
                <Target className="h-4 w-4" />
              </span>
              {t.dashboard?.todaysMission ||
                copy('今日任务', "Today's Mission")}
              <SectionHelpTooltip
                content={copy(
                  '默认展示 3 条任务。若任务较多，可用滚轮切换到下一组；首次引导任务会直接带你前往对应设置或练习入口。',
                  'Shows 3 tasks at a time. If there are more, use the mouse wheel to switch groups. Onboarding tasks can take you straight to the matching setup or practice entry.'
                )}
              />
            </h2>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 rounded-full border border-borderTone bg-surface-subtle px-3 py-1.5 dark:border-borderTone dark:bg-surface-subtle">
              <span className="inline-flex h-2 w-2 rounded-full bg-primary" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary dark:text-primary">
                {copy('进行中', 'Active')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {Array.from({ length: totalPages }).map((_, index) => (
                  <span
                    key={index}
                    className={`h-1.5 rounded-full transition-all ${index === page ? 'w-4 bg-primary dark:bg-primary' : 'w-1.5 bg-[hsl(var(--border-default))] dark:bg-[hsl(var(--border-default))]'}`}
                  />
                ))}
              </div>
              <span className="rounded-full border border-borderTone bg-surface-subtle px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-text-secondary dark:border-borderTone dark:bg-surface-subtle dark:text-text-secondary">
                {copy(
                  `${sortedTasks.length} 条`,
                  `${sortedTasks.length} items`
                )}
              </span>
            </div>
          </div>
        </div>

        {isLoadingTasks ? (
          <div className="flex flex-1 items-center justify-center rounded-[20px] border border-dashed border-borderTone bg-surface/60 px-4 py-6 dark:border-borderTone dark:bg-surface/40">
            <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-text-tertiary dark:text-text-tertiary">
              {copy('正在加载今日任务', 'Loading today\'s missions')}
            </span>
          </div>
        ) : sortedTasks.length === 0 ? (
          <PageEmptyState
            title={copy('今日任务已完成', "Today's mission is clear")}
            description={copy(
              '今天没有待处理任务。完成新的练习或明天再回来，系统会生成新的任务。',
              'There are no pending tasks right now. Complete a new practice run or come back tomorrow for a new mission set.'
            )}
            actions={
              <Button
                onClick={() => router.push('/dashboard/practice')}
                className="rounded-xl px-4 py-2 text-sm font-bold"
              >
                {copy('去练习', 'Go Practice')}
              </Button>
            }
            className="flex-1 rounded-[20px] border border-dashed border-borderTone bg-surface/60 px-4 py-6 dark:border-borderTone dark:bg-surface/40"
          />
        ) : (
          <div className="space-y-3" onWheel={handleWheel}>
            {visibleTasks.map((task, index) => {
              const isCompleted = task.currentCount >= task.targetCount
              const progress = Math.min(
                (task.currentCount / task.targetCount) * 100,
                100
              )
              const isInteractive =
                !isCompleted &&
                !task.isClaimed &&
                (task.type === 'ONBOARDING_PROFILE' ||
                  task.type === 'ONBOARDING_GOALS' ||
                  task.type === 'ONBOARDING_ASSESSMENT' ||
                  getTaskHref(task) !== null)

              let statusColor =
                'border-borderTone bg-state-info-bg text-state-info-fg dark:border-borderTone dark:bg-state-info-bg dark:text-state-info-fg'
              if (task.isClaimed) {
                statusColor =
                  'text-text-secondary bg-surface-subtle border-borderTone dark:text-text-secondary dark:bg-surface-subtle dark:border-borderTone'
              } else if (isCompleted) {
                statusColor =
                  'border-borderTone bg-state-success-bg text-state-success-fg dark:border-borderTone dark:bg-state-success-bg dark:text-state-success-fg'
              }

              return (
                <div
                  key={task.id}
                  onClick={() => handleTaskAction(task)}
                  className={`group flex items-center justify-between rounded-[20px] border px-4 py-3.5 shadow-none transition-colors duration-200 ${
                    task.isClaimed
                      ? 'cursor-default border-borderTone bg-surface-subtle opacity-70 dark:border-borderTone dark:bg-surface-subtle'
                    : isInteractive
                        ? 'cursor-pointer border-borderTone bg-surface hover:border-[hsl(var(--border-strong))] hover:bg-surface-subtle dark:border-borderTone dark:bg-surface dark:hover:bg-surface-subtle'
                        : 'cursor-default border-borderTone bg-surface hover:border-[hsl(var(--border-strong))] hover:bg-surface-subtle dark:border-borderTone dark:bg-surface dark:hover:bg-surface-subtle'
                  }`}
                >
                  <div className="flex flex-1 items-center gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${
                        task.isClaimed
                          ? 'border-borderTone dark:border-borderTone'
                          : 'border-borderTone bg-surface-subtle group-hover:border-[hsl(var(--state-info-fg))]/45 group-hover:bg-[hsl(var(--state-info-bg))]/65 dark:border-borderTone dark:bg-surface-subtle dark:group-hover:border-[hsl(var(--state-info-fg))]/35 dark:group-hover:bg-[hsl(var(--state-info-bg))]/18'
                      }`}
                    >
                      <div
                        className={`h-2 w-2 rounded-full bg-current ${task.isClaimed ? 'text-text-tertiary dark:text-text-tertiary' : 'text-primary dark:text-primary'}`}
                      />
                    </div>
                    <div className="flex-1">
                      <div
                        className={`text-[15px] font-bold transition-colors ${task.isClaimed ? 'text-text-secondary dark:text-text-secondary' : 'text-text-primary group-hover:text-primary dark:text-text-primary dark:group-hover:text-primary'}`}
                      >
                        {task.title}
                      </div>
                      <div className="mt-1 flex items-center gap-3">
                        <div
                          className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${statusColor}`}
                        >
                          {task.isClaimed
                            ? copy('已领取', 'Claimed')
                            : isCompleted
                              ? copy('可领取', 'Completed')
                              : copy('进行中', 'In Progress')}
                        </div>
                        <div className="h-1.5 max-w-[100px] flex-1 overflow-hidden rounded-full bg-[hsl(var(--border-subtle))] dark:bg-surface-subtle">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-500 dark:bg-primary"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-text-secondary dark:text-text-secondary">
                          {task.currentCount}/{task.targetCount}
                        </span>
                      </div>
                    </div>
                  </div>

                    <div className="ml-4 flex items-center gap-4 text-right">
                    {!task.isClaimed && (
                      <div className="rounded-xl border border-borderTone bg-state-warning-bg px-2.5 py-1 text-sm font-bold text-state-warning-fg dark:border-borderTone dark:bg-state-warning-bg dark:text-state-warning-fg">
                        +{task.xpReward} XP
                      </div>
                    )}

                    {task.isClaimed ? (
                      <div className="flex h-8 w-8 items-center justify-center text-state-success-fg dark:text-state-success-fg">
                        <CircleCheck className="h-6 w-6" />
                      </div>
                    ) : isCompleted ? (
                      <Button
                        size="sm"
                        className="rounded-xl border-0 bg-state-success-fg text-white hover:bg-state-success-fg"
                        onClick={(event) => {
                          event.stopPropagation()
                          handleClaim(task.id, task.xpReward)
                        }}
                        disabled={isPending}
                      >
                        {isPending ? '...' : copy('领取', 'Claim')}
                      </Button>
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-borderTone bg-surface-subtle text-text-tertiary transition-colors group-hover:border-[hsl(var(--state-info-fg))]/40 group-hover:bg-primary group-hover:text-white dark:border-borderTone dark:bg-surface-subtle dark:text-text-tertiary dark:opacity-50 dark:group-hover:bg-primary dark:group-hover:text-white">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {visibleTasks.length < TASKS_PER_PAGE &&
              Array.from({ length: TASKS_PER_PAGE - visibleTasks.length }).map(
                (_, index) => (
                  <div
                    key={`task-empty-${index}`}
                    className="flex h-[92px] items-center justify-center rounded-[20px] border border-dashed border-borderTone bg-surface-subtle dark:border-borderTone dark:bg-surface-subtle"
                  >
                    <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-text-tertiary dark:text-text-tertiary">
                      {copy('已到列表底部', 'End of list')}
                    </span>
                  </div>
                )
              )}
          </div>
        )}

        {user && (
          <>
            <ProfileDialog
              open={showProfile}
              onOpenChange={setShowProfile}
              user={user}
              onSuccess={() => handleDialogSuccess('ONBOARDING_PROFILE')}
            />
            <GoalsDialog
              open={showGoals}
              onOpenChange={setShowGoals}
              initialTime={user.settings?.studyReminderTime}
              onSuccess={() => handleDialogSuccess('ONBOARDING_GOALS')}
            />
            <AssessmentDialog
              open={showAssessment}
              onOpenChange={setShowAssessment}
              onSuccess={() => handleDialogSuccess('ONBOARDING_ASSESSMENT')}
            />
          </>
        )}
        </div>
      </Card>
    </TooltipProvider>
  )
}
