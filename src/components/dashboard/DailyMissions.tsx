'use client'

import React, { useEffect, useMemo, useState, useTransition } from 'react'
import { DailyTask, User, UserSettings, DailyTaskType } from '@prisma/client'
import { Target, ArrowRight, CircleCheck } from 'lucide-react'
import {
  claimTaskReward,
  completeOnboardingTask,
} from '@/actions/gamification/achievement'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useApp } from '@/providers'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'

import { ProfileDialog } from './dialogs/ProfileDialog'
import { GoalsDialog } from './dialogs/GoalsDialog'
import { AssessmentDialog } from './dialogs/AssessmentDialog'

interface DailyMissionsProps {
  tasks: DailyTask[]
  user?: User & { settings: UserSettings | null }
}

const TASKS_PER_PAGE = 3

export const DailyMissions = ({ tasks, user }: DailyMissionsProps) => {
  const { t, lang } = useApp()
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [page, setPage] = useState(0)

  const copy = (zh: string, en: string) => (lang.startsWith('zh') ? zh : en)

  const [showProfile, setShowProfile] = useState(false)
  const [showGoals, setShowGoals] = useState(false)
  const [showAssessment, setShowAssessment] = useState(false)

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
        if (task.type === 'COMPLETE_LESSON') {
          router.push('/dashboard/courses')
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
    }
  }

  const sortedTasks = useMemo(
    () =>
      [...tasks].sort((a, b) => {
        const aCompleted = a.currentCount >= a.targetCount
        const bCompleted = b.currentCount >= b.targetCount

        if (a.isClaimed && !b.isClaimed) return 1
        if (!a.isClaimed && b.isClaimed) return -1

        if (aCompleted && !bCompleted) return -1
        if (!aCompleted && bCompleted) return 1

        return 0
      }),
    [tasks]
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
    <Card className="h-full overflow-hidden rounded-[28px] border border-borderTone bg-[radial-gradient(circle_at_top_right,hsl(var(--state-info-bg))_0%,transparent_28%),linear-gradient(180deg,hsl(var(--surface-default))_0%,hsl(var(--surface-muted))_100%)] p-0 text-text-primary shadow-none dark:border-borderTone dark:bg-[radial-gradient(circle_at_top_right,hsl(var(--state-info-bg))_0%,transparent_22%),linear-gradient(180deg,hsl(var(--surface-default))_0%,hsl(var(--surface-muted))_100%)] dark:text-text-primary xl:h-[418px]">
      <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-[hsl(var(--state-info-fg))]/10 blur-[90px] dark:bg-[hsl(var(--state-info-fg))]/10" />

      <div className="relative z-10 flex h-full flex-col p-5">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center rounded-full border border-borderTone bg-[hsl(var(--state-info-bg))] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[hsl(var(--state-info-fg))] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] dark:border-borderTone dark:bg-[hsl(var(--state-info-bg))] dark:text-[hsl(var(--state-info-fg))]">
              {copy('今日任务', "Today's Mission")}
            </div>
            <h2 className="mt-2.5 flex items-center gap-2 text-[27px] font-black tracking-tight">
              <Target className="h-5 w-5 text-primary dark:text-primary" />
              {t.dashboard?.todaysMission ||
                copy('今日任务', "Today's Mission")}
            </h2>
            <p className="mt-1.5 text-sm leading-6 text-text-secondary dark:text-text-secondary">
              {copy(
                '默认展示 3 条，滚动滑鼠滚轮可一次切换下一组任务。',
                'Shows 3 rows at a time. Use the mouse wheel to switch to the next group.'
              )}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 rounded-full border border-borderTone bg-surface px-3 py-1.5 backdrop-blur-md dark:border-borderTone dark:bg-surface-subtle">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[hsl(var(--state-info-fg))] opacity-75 dark:bg-[hsl(var(--state-info-fg))]" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary dark:bg-primary" />
              </span>
              <span className="text-[11px] font-black uppercase tracking-[0.16em] text-primary dark:text-primary">
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
                task.type === 'ONBOARDING_ASSESSMENT')

            let statusColor =
              'text-[hsl(var(--state-info-fg))] bg-[hsl(var(--state-info-bg))] border-borderTone dark:text-[hsl(var(--state-info-fg))] dark:bg-[hsl(var(--state-info-bg))] dark:border-borderTone'
            if (task.isClaimed) {
              statusColor =
                'text-text-secondary bg-surface-subtle border-borderTone dark:text-text-secondary dark:bg-surface-subtle dark:border-borderTone'
            } else if (isCompleted) {
              statusColor =
                'text-[hsl(var(--state-success-fg))] bg-[hsl(var(--state-success-bg))] border-borderTone dark:text-[hsl(var(--state-success-fg))] dark:bg-[hsl(var(--state-success-bg))] dark:border-borderTone'
            }

            return (
              <div
                key={task.id}
                onClick={() => handleTaskAction(task)}
                className={`group flex items-center justify-between rounded-[22px] border px-4 py-3.5 shadow-none transition-all duration-300 animate-in fade-in slide-in-from-right-4 fill-mode-both ${
                  task.isClaimed
                    ? 'cursor-default border-borderTone bg-surface-subtle opacity-70 dark:border-borderTone dark:bg-surface-subtle'
                    : isInteractive
                      ? 'cursor-pointer border-borderTone bg-surface hover:border-[hsl(var(--border-strong))] hover:bg-surface-subtle dark:border-borderTone dark:bg-surface dark:hover:bg-surface-subtle'
                      : 'cursor-default border-borderTone bg-surface hover:border-[hsl(var(--border-strong))] hover:bg-surface-subtle dark:border-borderTone dark:bg-surface dark:hover:bg-surface-subtle'
                }`}
                style={{ animationDelay: `${index * 45}ms` }}
              >
                <div className="flex flex-1 items-center gap-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed transition-all ${
                      task.isClaimed
                        ? 'border-borderTone dark:border-borderTone'
                        : 'border-[hsl(var(--border-default))] group-hover:border-[hsl(var(--state-info-fg))] group-hover:bg-[hsl(var(--state-info-bg))] dark:border-borderTone dark:group-hover:border-[hsl(var(--state-info-fg))] dark:group-hover:bg-[hsl(var(--state-info-bg))]'
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
                    <div className="rounded-xl border border-borderTone bg-[hsl(var(--state-warning-bg))] px-2.5 py-1 text-sm font-bold text-[hsl(var(--state-warning-fg))] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] dark:border-borderTone dark:bg-[hsl(var(--state-warning-bg))] dark:text-[hsl(var(--state-warning-fg))]">
                      +{task.xpReward} XP
                    </div>
                  )}

                  {task.isClaimed ? (
                    <div className="flex h-8 w-8 items-center justify-center text-[hsl(var(--state-success-fg))] dark:text-[hsl(var(--state-success-fg))]">
                      <CircleCheck className="h-6 w-6" />
                    </div>
                  ) : isCompleted ? (
                    <Button
                      size="sm"
                      className="rounded-xl border-0 bg-[hsl(var(--state-success-fg))] text-white hover:bg-[hsl(var(--state-success-fg))]"
                      onClick={(event) => {
                        event.stopPropagation()
                        handleClaim(task.id, task.xpReward)
                      }}
                      disabled={isPending}
                    >
                      {isPending ? '...' : copy('领取', 'Claim')}
                    </Button>
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-borderTone bg-surface-subtle text-text-tertiary transition-all group-hover:border-[hsl(var(--state-info-fg))]/40 group-hover:bg-primary group-hover:text-white dark:border-borderTone dark:bg-surface-subtle dark:text-text-tertiary dark:opacity-50 dark:group-hover:bg-primary dark:group-hover:text-white">
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
                  className="flex h-[92px] items-center justify-center rounded-[22px] border border-dashed border-borderTone bg-surface-subtle dark:border-borderTone dark:bg-surface-subtle"
                >
                  <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-text-tertiary dark:text-text-tertiary">
                    {copy('已到列表底部', 'End of list')}
                  </span>
                </div>
              )
            )}
        </div>

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
  )
}
