'use client';

import React, { useEffect, useMemo, useState, useTransition } from 'react';
import { DailyTask, User, UserSettings, DailyTaskType } from '@prisma/client';
import { Target, ArrowRight, CircleCheck } from 'lucide-react';
import { claimTaskReward, completeOnboardingTask } from '@/actions/gamification/achievement';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useApp } from '@/providers';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

import { ProfileDialog } from './dialogs/ProfileDialog';
import { GoalsDialog } from './dialogs/GoalsDialog';
import { AssessmentDialog } from './dialogs/AssessmentDialog';

interface DailyMissionsProps {
  tasks: DailyTask[];
  user?: User & { settings: UserSettings | null };
}

const TASKS_PER_PAGE = 3;

export const DailyMissions = ({ tasks, user }: DailyMissionsProps) => {
  const { t, lang } = useApp();
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [page, setPage] = useState(0);

  const copy = (zh: string, en: string) => (lang.startsWith('zh') ? zh : en);

  const [showProfile, setShowProfile] = useState(false);
  const [showGoals, setShowGoals] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);

  const handleClaim = (taskId: string, reward: number) => {
    startTransition(async () => {
      const result = await claimTaskReward(taskId);
      if (result.success) {
        toast({
          title: copy('已领取 XP', 'XP Claimed!'),
          description: copy(`你获得了 ${reward} XP。`, `You earned ${reward} XP.`),
        });
        router.refresh();
      } else {
        toast({
          title: copy('领取失败', 'Error'),
          description: result.error || copy('奖励领取失败，请稍后重试。', 'Failed to claim reward'),
          variant: 'destructive',
        });
      }
    });
  };

  const handleTaskAction = (task: DailyTask) => {
    if (task.isClaimed || task.currentCount >= task.targetCount) return;

    switch (task.type) {
      case 'ONBOARDING_PROFILE':
        setShowProfile(true);
        break;
      case 'ONBOARDING_GOALS':
        setShowGoals(true);
        break;
      case 'ONBOARDING_ASSESSMENT':
        setShowAssessment(true);
        break;
      default:
        if (task.type === 'COMPLETE_LESSON') {
          router.push('/dashboard/courses');
        }
        break;
    }
  };

  const handleDialogSuccess = async (type: DailyTaskType) => {
    const result = await completeOnboardingTask(type);
    if (result.success) {
      toast({
        title: copy('任务完成', 'Task Completed!'),
        description: copy('别忘了领取本次 XP 奖励。', "Don't forget to claim your XP."),
      });
      router.refresh();
    }
  };

  const sortedTasks = useMemo(
    () =>
      [...tasks].sort((a, b) => {
        const aCompleted = a.currentCount >= a.targetCount;
        const bCompleted = b.currentCount >= b.targetCount;

        if (a.isClaimed && !b.isClaimed) return 1;
        if (!a.isClaimed && b.isClaimed) return -1;

        if (aCompleted && !bCompleted) return -1;
        if (!aCompleted && bCompleted) return 1;

        return 0;
      }),
    [tasks],
  );

  const totalPages = Math.max(1, Math.ceil(sortedTasks.length / TASKS_PER_PAGE));
  const visibleTasks = useMemo(
    () => sortedTasks.slice(page * TASKS_PER_PAGE, (page + 1) * TASKS_PER_PAGE),
    [page, sortedTasks],
  );

  useEffect(() => {
    setPage(0);
  }, [sortedTasks.length]);

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (totalPages <= 1) return;
    event.preventDefault();
    const direction = event.deltaY > 0 ? 1 : -1;
    setPage((prev) => Math.max(0, Math.min(totalPages - 1, prev + direction)));
  };

  return (
    <Card className="h-full overflow-hidden rounded-[28px] border border-[#24324D] bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.14),transparent_26%),linear-gradient(180deg,rgba(10,18,32,0.97),rgba(5,11,20,0.99))] p-0 text-white shadow-[0_18px_48px_rgba(2,8,23,0.28)] xl:h-[418px]">
      <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-cyan-400/10 blur-[90px]" />

      <div className="relative z-10 flex h-full flex-col p-5">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-200">
              {copy('今日任务', "Today's Mission")}
            </div>
            <h2 className="mt-2.5 flex items-center gap-2 text-[27px] font-black tracking-tight">
              <Target className="h-5 w-5 text-cyan-300" />
              {t.dashboard?.todaysMission || copy('今日任务', "Today's Mission")}
            </h2>
            <p className="mt-1.5 text-sm leading-6 text-slate-400">
              {copy('默认展示 3 条，滚动滑鼠滚轮可一次切换下一组任务。', 'Shows 3 rows at a time. Use the mouse wheel to switch to the next group.')}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-300" />
              </span>
              <span className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
                {copy('进行中', 'Active')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {Array.from({ length: totalPages }).map((_, index) => (
                  <span
                    key={index}
                    className={`h-1.5 rounded-full transition-all ${index === page ? 'w-4 bg-white' : 'w-1.5 bg-white/20'}`}
                  />
                ))}
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-300">
                {copy(`${sortedTasks.length} 条`, `${sortedTasks.length} items`)}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3" onWheel={handleWheel}>
          {visibleTasks.map((task, index) => {
            const isCompleted = task.currentCount >= task.targetCount;
            const progress = Math.min((task.currentCount / task.targetCount) * 100, 100);
            const isInteractive =
              !isCompleted &&
              !task.isClaimed &&
              (task.type === 'ONBOARDING_PROFILE' ||
                task.type === 'ONBOARDING_GOALS' ||
                task.type === 'ONBOARDING_ASSESSMENT');

            let statusColor = 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            if (task.isClaimed) {
              statusColor = 'text-slate-400 bg-slate-400/10 border-slate-400/20';
            } else if (isCompleted) {
              statusColor = 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            }

            return (
              <div
                key={task.id}
                onClick={() => handleTaskAction(task)}
                className={`group flex items-center justify-between rounded-[22px] border px-4 py-3.5 shadow-black/20 transition-all animate-in fade-in slide-in-from-right-4 duration-300 fill-mode-both ${
                  task.isClaimed
                    ? 'cursor-default border-white/5 bg-white/[0.03] opacity-60'
                    : isInteractive
                      ? 'cursor-pointer border-white/10 bg-white/[0.04] hover:border-cyan-400/35 hover:bg-white/[0.08]'
                      : 'cursor-default border-white/10 bg-white/[0.04] hover:border-cyan-400/20 hover:bg-white/[0.07]'
                }`}
                style={{ animationDelay: `${index * 45}ms` }}
              >
                <div className="flex flex-1 items-center gap-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed transition-all ${
                      task.isClaimed
                        ? 'border-slate-600'
                        : 'border-slate-600 group-hover:border-cyan-300 group-hover:bg-cyan-400/10'
                    }`}
                  >
                    <div className={`h-2 w-2 rounded-full bg-current ${task.isClaimed ? 'text-slate-500' : 'text-cyan-300'}`} />
                  </div>
                  <div className="flex-1">
                      <div className={`text-[15px] font-bold transition-colors ${task.isClaimed ? 'text-slate-400' : 'text-white group-hover:text-cyan-100'}`}>
                      {task.title}
                    </div>
                    <div className="mt-1 flex items-center gap-3">
                      <div className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${statusColor}`}>
                        {task.isClaimed
                          ? copy('已领取', 'Claimed')
                          : isCompleted
                            ? copy('可领取', 'Completed')
                            : copy('进行中', 'In Progress')}
                      </div>
                      <div className="h-1.5 max-w-[100px] flex-1 overflow-hidden rounded-full bg-slate-700">
                        <div className="h-full rounded-full bg-cyan-400 transition-all duration-500" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {task.currentCount}/{task.targetCount}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="ml-4 flex items-center gap-4 text-right">
                  {!task.isClaimed && (
                    <div className="rounded-xl border border-amber-300/15 bg-amber-300/10 px-2.5 py-1 text-sm font-bold text-amber-200">
                      +{task.xpReward} XP
                    </div>
                  )}

                  {task.isClaimed ? (
                    <div className="flex h-8 w-8 items-center justify-center text-emerald-400">
                      <CircleCheck className="h-6 w-6" />
                    </div>
                  ) : isCompleted ? (
                    <Button
                      size="sm"
                      className="rounded-xl border-0 bg-emerald-500 text-white hover:bg-emerald-600"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleClaim(task.id, task.xpReward);
                      }}
                      disabled={isPending}
                    >
                      {isPending ? '...' : copy('领取', 'Claim')}
                    </Button>
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 opacity-50 transition-all group-hover:bg-cyan-400 group-hover:text-slate-950">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {visibleTasks.length < TASKS_PER_PAGE &&
            Array.from({ length: TASKS_PER_PAGE - visibleTasks.length }).map((_, index) => (
              <div
                key={`task-empty-${index}`}
                className="flex h-[92px] items-center justify-center rounded-[22px] border border-dashed border-white/8 bg-white/[0.03]"
              >
                <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
                  {copy('已到列表底部', 'End of list')}
                </span>
              </div>
            ))}
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
  );
};
