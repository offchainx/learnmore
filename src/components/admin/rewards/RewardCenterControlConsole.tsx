'use client'

import { useState } from 'react'
import type { LeaderboardPeriod } from '@prisma/client'
import { History, PlusCircle } from 'lucide-react'
import { Badge as UiBadge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AuditLogDrawer } from '@/components/admin/content/AuditLogDrawer'
import { PageHeroShell } from '@/components/shared/PageHeroShell'
import { PageHeroTitle } from '@/components/shared/PageHeroTitle'
import { SectionBlockHeader } from '@/components/shared/SectionBlockHeader'
import {
  pageBadgeClass,
  pageEmptyStateClass,
  pagePanelClass,
  pagePanelStrongClass,
  pageSegmentedButtonCompactClass,
  pageSegmentedControlCompactClass,
  pageTableShellClass,
} from '@/components/shared/pageSurfaces'
import { pageCardTitleClass, pageMetaTextClass } from '@/components/shared/pageTypography'
import {
  DEFAULT_DAILY_TASKS,
  ONBOARDING_TASK_TEMPLATES,
} from '@/lib/gamification'
import type { BadgeWithUnlockStatus } from '@/lib/gamification/achievements-types'
import type { LeaderboardEntryWithUser } from '@/actions/leaderboard'
import type { AuditLogEntry } from '@/types/content-pipeline'
import { cn } from '@/lib/utils'

type RewardSnapshotPeriod = LeaderboardPeriod

type RewardLeaderboardSnapshot = {
  period: RewardSnapshotPeriod
  entries: LeaderboardEntryWithUser[]
  myRank: { rank: number; score: number } | null
}

interface RewardCenterControlConsoleProps {
  badges: BadgeWithUnlockStatus[]
  leaderboardSnapshots: RewardLeaderboardSnapshot[]
}

const PERIOD_LABELS: Record<RewardSnapshotPeriod, string> = {
  WEEKLY: '周榜',
  MONTHLY: '月榜',
  ALL_TIME: '总榜',
}

function formatNumber(value: number) {
  return value.toLocaleString('zh-CN')
}

function getBadgeTone(unlocked: boolean) {
  return unlocked ? 'success' : 'neutral'
}

function RewardPolicyCard() {
  const rewardRows = [
    ...DEFAULT_DAILY_TASKS.map((task) => ({
      group: '每日任务',
      name: task.title,
      reward: task.xpReward,
      cap: `${task.targetCount} 次`,
      state: '已启用',
      note: `完成 ${task.targetCount} 次后发放`,
    })),
    ...ONBOARDING_TASK_TEMPLATES.map((task) => ({
      group: '新手引导',
      name: task.title,
      reward: task.xpReward,
      cap: '1 次',
      state: '已启用',
      note: '新用户首次成长补齐',
    })),
  ]

  return (
    <Card id="action-registry" className={cn(pagePanelStrongClass, 'h-full p-4')}>
      <SectionBlockHeader
        title="奖励规则"
        actions={
          <button
            type="button"
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-2')}
          >
            <PlusCircle className="h-4 w-4" />
            新增动作
          </button>
        }
      />

      <div className="mt-4 space-y-2 xl:hidden">
        {rewardRows.map((row) => (
          <div key={`${row.group}-${row.name}`} className="rounded-2xl border border-borderTone bg-surface-subtle px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <UiBadge variant="neutral">{row.group}</UiBadge>
              <div className={pageCardTitleClass}>{row.name}</div>
            </div>
            <p className={cn(pageMetaTextClass, 'mt-1')}>{row.note}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-borderTone bg-surface px-3 py-2">
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">XP</div>
                <div className="mt-1 text-sm font-semibold text-text-primary">+{formatNumber(row.reward)} XP</div>
              </div>
              <div className="rounded-xl border border-borderTone bg-surface px-3 py-2">
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">上限</div>
                <div className="mt-1 text-sm font-semibold text-text-primary">{row.cap}</div>
              </div>
              <div className="rounded-xl border border-borderTone bg-surface px-3 py-2">
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">启停</div>
                <div className="mt-1 text-sm font-semibold text-text-primary">{row.state}</div>
              </div>
              <div className="rounded-xl border border-borderTone bg-surface px-3 py-2">
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">操作</div>
                <div className="mt-1 flex gap-2">
                  <button type="button" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                    编辑
                  </button>
                  <button type="button" className={buttonVariants({ variant: 'secondary', size: 'sm' })}>
                    停用
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 hidden overflow-hidden rounded-3xl border border-borderTone bg-surface xl:block">
        <div className="grid grid-cols-[1fr_1.5fr_0.55fr_0.6fr_0.6fr_0.75fr] gap-3 border-b border-borderTone px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-tertiary">
          <div>任务类型</div>
          <div>动作 / 规则</div>
          <div>XP</div>
          <div>上限</div>
          <div>启停</div>
          <div>操作</div>
        </div>
        <div className="divide-y divide-borderTone">
          {rewardRows.map((row) => (
            <div
              key={`${row.group}-${row.name}`}
              className="grid grid-cols-[1fr_1.5fr_0.55fr_0.6fr_0.6fr_0.75fr] gap-3 px-4 py-3.5"
            >
              <div className="min-w-0">
                <UiBadge variant="neutral">{row.group}</UiBadge>
              </div>
              <div className="min-w-0">
                <div className={pageCardTitleClass}>{row.name}</div>
                <p className={cn(pageMetaTextClass, 'mt-1')}>{row.note}</p>
              </div>
              <div className="flex items-center">
                <UiBadge variant="success">+{formatNumber(row.reward)} XP</UiBadge>
              </div>
              <div className="flex items-center text-sm font-medium text-text-primary">
                {row.cap}
              </div>
              <div className="flex items-center">
                <UiBadge variant="neutral">{row.state}</UiBadge>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className={buttonVariants({ variant: 'outline', size: 'sm' })}
                >
                  编辑
                </button>
                <button
                  type="button"
                  className={buttonVariants({ variant: 'secondary', size: 'sm' })}
                >
                  停用
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

function LeaderboardObservationCard({
  snapshots,
}: {
  snapshots: RewardLeaderboardSnapshot[]
}) {
  const [activePeriod, setActivePeriod] = useState<RewardSnapshotPeriod>('WEEKLY')
  const activeSnapshot =
    snapshots.find((snapshot) => snapshot.period === activePeriod) ?? snapshots[0]

  return (
    <Card id="leaderboard-observation" className={cn(pagePanelStrongClass, 'h-full p-4')}>
      <div className="flex flex-col gap-4">
        <SectionBlockHeader
          title="排行榜观察"
          actions={
            <div className={cn(pageSegmentedControlCompactClass, 'w-full sm:w-auto')}>
              {snapshots.map((snapshot) => {
                const isActive = snapshot.period === activePeriod
                return (
                  <button
                    key={snapshot.period}
                    type="button"
                    onClick={() => setActivePeriod(snapshot.period)}
                    className={cn(
                      pageSegmentedButtonCompactClass,
                      'min-w-[72px]',
                      isActive
                        ? 'bg-surface text-text-primary shadow-surface'
                        : 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary'
                    )}
                  >
                    {PERIOD_LABELS[snapshot.period]}
                  </button>
                )
              })}
            </div>
          }
        />

        <div className={cn(pageTableShellClass, 'overflow-hidden')}>
          {activeSnapshot?.entries.length ? (
            <div className="divide-y divide-borderTone">
              {activeSnapshot.entries.slice(0, 8).map((entry) => {
                const rankTone =
                  entry.rank === 1
                    ? 'bg-gradient-to-br from-amber-400/20 to-amber-400/5'
                    : entry.rank === 2
                      ? 'bg-gradient-to-br from-slate-300/20 to-slate-300/5'
                      : entry.rank === 3
                        ? 'bg-gradient-to-br from-orange-300/20 to-orange-300/5'
                        : 'bg-gradient-to-br from-slate-200/10 to-transparent'

                return (
                  <div
                    key={`${activePeriod}-${entry.user.id}`}
                    className="flex items-center gap-4 px-4 py-3.5"
                  >
                    <div
                      className={cn(
                        'flex h-11 min-w-11 items-center justify-center rounded-2xl border border-borderTone px-3 text-sm font-semibold text-text-primary',
                        rankTone
                      )}
                    >
                      {entry.rank}
                    </div>
                    <Avatar className="h-11 w-11">
                      <AvatarImage src={entry.user.avatar ?? ''} alt={entry.user.username ?? '用户头像'} />
                      <AvatarFallback className="bg-surface-subtle text-sm font-semibold text-text-secondary">
                        {(entry.user.username ?? 'U').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-text-primary">
                        {entry.user.username ?? 'Anonymous'}
                      </p>
                      <p className={cn(pageMetaTextClass, 'mt-1')}>
                        {PERIOD_LABELS[activePeriod]} · 榜单快照
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-semibold text-text-primary">
                        {formatNumber(entry.score)}
                      </div>
                      <p className={pageMetaTextClass}>XP</p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className={pageEmptyStateClass}>
              <p className="text-sm font-medium text-text-primary">暂无排行榜数据</p>
              <p className={cn(pageMetaTextClass, 'mt-1')}>
                当前周期没有取到榜单快照，后续会由奖励中心的重算与缓存模块接管。
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

function AchievementLinkageCard({
  badges,
}: {
  badges: BadgeWithUnlockStatus[]
}) {
  return (
    <Card id="achievement-linkage" className={cn(pagePanelClass, 'h-full p-4')}>
      <SectionBlockHeader title="成就联动" />

      <div className="mt-4 space-y-2 xl:hidden">
        {badges.map((badge) => (
          <div key={badge.id} className="rounded-2xl border border-borderTone bg-surface-subtle px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className={pageCardTitleClass}>{badge.name}</div>
              <UiBadge variant={getBadgeTone(badge.unlocked)}>{badge.unlocked ? '已解锁' : '待解锁'}</UiBadge>
            </div>
            <p className={cn(pageMetaTextClass, 'mt-1')}>{badge.code}</p>
            <p className="mt-2 text-sm text-text-primary">{badge.condition || badge.description}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-borderTone bg-surface px-3 py-2">
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">成就上限</div>
                <div className="mt-1 text-sm font-semibold text-text-primary">不限量</div>
              </div>
              <div className="rounded-xl border border-borderTone bg-surface px-3 py-2">
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">启停</div>
                <div className="mt-1 text-sm font-semibold text-text-primary">已启用</div>
              </div>
              <div className="rounded-xl border border-borderTone bg-surface px-3 py-2 col-span-2">
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">操作</div>
                <div className="mt-1 flex gap-2">
                  <button
                    type="button"
                    className={buttonVariants({ variant: 'outline', size: 'sm' })}
                  >
                    编辑
                  </button>
                  <button
                    type="button"
                    className={buttonVariants({ variant: 'secondary', size: 'sm' })}
                  >
                    停用
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 hidden overflow-hidden rounded-3xl border border-borderTone bg-surface xl:block">
        <div className="grid grid-cols-[1.15fr_1.4fr_0.8fr_0.6fr_0.75fr] gap-3 border-b border-borderTone px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-tertiary">
          <div>成就类型</div>
          <div>触发条件</div>
          <div>成就上限</div>
          <div>启停</div>
          <div>操作</div>
        </div>
        <div className="divide-y divide-borderTone">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className="grid grid-cols-[1.15fr_1.4fr_0.8fr_0.6fr_0.75fr] gap-3 px-4 py-3.5"
            >
              <div className="min-w-0">
                <div className={pageCardTitleClass}>{badge.name}</div>
                <p className={cn(pageMetaTextClass, 'mt-1')}>{badge.code}</p>
              </div>
              <div className="min-w-0">
                <p className="text-sm text-text-primary">
                  {badge.condition || badge.description}
                </p>
              </div>
              <div className="flex items-center">
                <UiBadge variant="neutral">不限量</UiBadge>
              </div>
              <div className="flex items-center">
                <UiBadge variant="neutral">已启用</UiBadge>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className={buttonVariants({ variant: 'outline', size: 'sm' })}
                >
                  编辑
                </button>
                <button
                  type="button"
                  className={buttonVariants({ variant: 'secondary', size: 'sm' })}
                >
                  停用
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

export function RewardCenterControlConsole({
  badges,
  leaderboardSnapshots,
}: RewardCenterControlConsoleProps) {
  const [isOperationLogOpen, setIsOperationLogOpen] = useState(false)
  const operationLogs: AuditLogEntry[] = []

  return (
    <div className="space-y-3">
      <PageHeroShell
        eyebrow={<span className={pageBadgeClass}>管理端 / 奖励中心</span>}
        title={<PageHeroTitle title="奖励中心" capsuleLabel="Admin Control" />}
        actions={
          <button
            type="button"
            onClick={() => setIsOperationLogOpen(true)}
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            <History className="h-4 w-4" />
            操作日志
          </button>
        }
      />

      <div className="space-y-3">
        <RewardPolicyCard />

        <div className="grid gap-3 xl:grid-cols-2 xl:items-stretch">
          <AchievementLinkageCard badges={badges} />
          <LeaderboardObservationCard snapshots={leaderboardSnapshots} />
        </div>
      </div>

      <AuditLogDrawer
        isOpen={isOperationLogOpen}
        onClose={() => setIsOperationLogOpen(false)}
        logs={operationLogs}
        title="奖励 / 成就操作日志"
        description="记录所有与奖励规则、成就规则和榜单观察相关的变更。"
        emptyText="当前暂无奖励 / 成就操作日志，后续接入后会在这里展示。"
        searchPlaceholder="搜索奖励规则、成就规则、操作人或备注..."
        footerText="当前为操作日志占位壳，后续由真实奖励变更记录接入。"
      />
    </div>
  )
}
