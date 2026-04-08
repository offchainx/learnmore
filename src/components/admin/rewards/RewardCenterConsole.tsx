'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { ElementType } from 'react'
import type { LeaderboardPeriod } from '@prisma/client'
import {
  ArrowRight,
  BadgeCheck,
  Crown,
  RefreshCcw,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react'
import {
  Badge as UiBadge,
  type BadgeProps as UiBadgeProps,
} from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
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
import {
  pageCardTitleClass,
  pageHeroNumericValueClass,
  pageKickerClass,
  pageMetaTextClass,
} from '@/components/shared/pageTypography'
import {
  calculateLevelProgress,
  DEFAULT_DAILY_TASKS,
  ONBOARDING_TASK_TEMPLATES,
  XP_PER_LEVEL,
  XP_REWARDS,
} from '@/lib/gamification'
import type {
  AchievementOverview,
  BadgeWithUnlockStatus,
} from '@/lib/gamification/achievements-types'
import type { LeaderboardEntryWithUser } from '@/actions/leaderboard'
import { cn } from '@/lib/utils'

type RewardSnapshotPeriod = LeaderboardPeriod

type RewardLeaderboardSnapshot = {
  period: RewardSnapshotPeriod
  entries: LeaderboardEntryWithUser[]
  myRank: { rank: number; score: number } | null
}

interface RewardCenterConsoleProps {
  viewerId: string
  viewerRole: string
  overview: AchievementOverview | null
  badges: BadgeWithUnlockStatus[]
  leaderboardSnapshots: RewardLeaderboardSnapshot[]
}

const PERIOD_LABELS: Record<RewardSnapshotPeriod, string> = {
  WEEKLY: '周榜',
  MONTHLY: '月榜',
  ALL_TIME: '总榜',
}

const PERIOD_DESCRIPTION: Record<RewardSnapshotPeriod, string> = {
  WEEKLY: '用于观察最近 7 天的成长波动',
  MONTHLY: '用于观察最近 30 天的稳定性',
  ALL_TIME: '用于观察长期累积效果',
}

const ACTION_LINKS = [
  {
    href: '/dashboard/leaderboard',
    label: '前台排行榜',
    description: '查看学员端的真实榜单呈现',
    icon: Trophy,
  },
  {
    href: '/dashboard/achievements',
    label: '成就页',
    description: '查看 XP、streak 与徽章表现',
    icon: Sparkles,
  },
  {
    href: '/dashboard/practice',
    label: '练习中心',
    description: '核对 XP 发放的真实来源动作',
    icon: Zap,
  },
]

const XP_REWARD_ROWS = [
  { key: 'LESSON_COMPLETE', label: '课程完成', value: XP_REWARDS.LESSON_COMPLETE },
  { key: 'QUIZ_COMPLETE', label: '测验完成', value: XP_REWARDS.QUIZ_COMPLETE },
  { key: 'PERFECT_QUIZ', label: '满分测验', value: XP_REWARDS.PERFECT_QUIZ },
  { key: 'DAILY_LOGIN', label: '每日登录', value: XP_REWARDS.DAILY_LOGIN },
  { key: 'STREAK_BONUS', label: '连胜奖励', value: XP_REWARDS.STREAK_BONUS },
  { key: 'COMMENT_POST', label: '评论发放', value: XP_REWARDS.COMMENT_POST },
  { key: 'CREATE_POST', label: '发帖发放', value: XP_REWARDS.CREATE_POST },
]

function formatNumber(value: number) {
  return value.toLocaleString('zh-CN')
}

function getBadgeTone(unlocked: boolean): UiBadgeProps['variant'] {
  return unlocked ? 'success' : 'neutral'
}

function MetricCard({
  title,
  value,
  caption,
  icon: Icon,
  toneClassName,
}: {
  title: string
  value: string
  caption: string
  icon: ElementType
  toneClassName: string
}) {
  return (
    <Card className={cn(pagePanelClass, 'p-4')}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className={pageKickerClass}>{title}</p>
          <div className="mt-2 flex items-end gap-2">
            <p className={pageHeroNumericValueClass}>{value}</p>
            <span className={cn('pb-1', pageMetaTextClass)}>{caption}</span>
          </div>
        </div>
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-borderTone',
            toneClassName
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  )
}

function RewardRuleList({
  title,
  description,
  items,
}: {
  title: string
  description: string
  items: Array<{ name: string; xp: number; note: string }>
}) {
  return (
    <Card className={cn(pagePanelClass, 'p-4')}>
      <SectionBlockHeader title={title} description={description} />
      <div className="mt-4 space-y-2">
        {items.map((item) => (
          <div
            key={item.name}
            className="flex items-start justify-between gap-4 rounded-2xl border border-borderTone bg-surface-subtle px-4 py-3 dark:bg-surface-subtle"
          >
            <div className="min-w-0">
              <div className={pageCardTitleClass}>{item.name}</div>
              <p className={cn(pageMetaTextClass, 'mt-1')}>{item.note}</p>
            </div>
            <UiBadge variant="success" className="shrink-0">
              +{item.xp} XP
            </UiBadge>
          </div>
        ))}
      </div>
    </Card>
  )
}

function RewardCenterLeaderboard({
  snapshots,
  viewerId,
}: {
  snapshots: RewardLeaderboardSnapshot[]
  viewerId: string
}) {
  const [activePeriod, setActivePeriod] = useState<RewardSnapshotPeriod>('WEEKLY')
  const activeSnapshot =
    snapshots.find((snapshot) => snapshot.period === activePeriod) ?? snapshots[0]

  return (
    <Card className={cn(pagePanelStrongClass, 'p-4')}>
      <div className="flex flex-col gap-4">
        <SectionBlockHeader
          title="排行榜控制台"
          description="支持周榜 / 月榜 / 总榜切换，先看榜单状态，再看当前名次与差距。"
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

        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className={pageKickerClass}>{PERIOD_DESCRIPTION[activePeriod]}</p>
            <div className="mt-2 flex items-end gap-3">
              <p className={pageHeroNumericValueClass}>
                {activeSnapshot?.myRank ? `#${activeSnapshot.myRank.rank}` : '—'}
              </p>
              <span className={cn('pb-1', pageMetaTextClass)}>
                {activeSnapshot?.myRank
                  ? `当前得分 ${formatNumber(activeSnapshot.myRank.score)}`
                  : '当前账号暂无榜单数据'}
              </span>
            </div>
          </div>
          <UiBadge variant="neutral" className="justify-self-start">
            只读快照
          </UiBadge>
        </div>

        <div className={cn(pageTableShellClass, 'overflow-hidden')}>
          {activeSnapshot?.entries.length ? (
            <div className="divide-y divide-borderTone">
              {activeSnapshot.entries.slice(0, 5).map((entry) => {
                const isViewer = entry.user.id === viewerId
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
                    className={cn(
                      'flex items-center gap-4 px-4 py-3.5 transition-colors',
                      isViewer && 'bg-[hsl(var(--state-info-bg))]/20'
                    )}
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
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-text-primary">
                          {entry.user.username ?? 'Anonymous'}
                        </p>
                        {isViewer ? (
                          <UiBadge variant="success" className="shrink-0">
                            当前账号
                          </UiBadge>
                        ) : null}
                      </div>
                      <p className={cn(pageMetaTextClass, 'mt-1')}>
                        {PERIOD_LABELS[activePeriod]} · 只读榜单快照
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

        <div className="grid gap-3 md:grid-cols-2">
          <Card className={cn(pagePanelClass, 'p-4')}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className={pageKickerClass}>当前账号</p>
                <h3 className={cn(pageCardTitleClass, 'mt-2')}>周期内定位</h3>
              </div>
              <UiBadge variant="neutral">myRank</UiBadge>
            </div>
            {activeSnapshot?.myRank ? (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className={pageMetaTextClass}>排名</span>
                  <span className="text-sm font-semibold text-text-primary">
                    #{activeSnapshot.myRank.rank}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={pageMetaTextClass}>得分</span>
                  <span className="text-sm font-semibold text-text-primary">
                    {formatNumber(activeSnapshot.myRank.score)} XP
                  </span>
                </div>
              </div>
            ) : (
              <div className={cn(pageEmptyStateClass, 'mt-4 py-5')}>
                <p className="text-sm font-medium text-text-primary">暂无当前账号排名</p>
                <p className={cn(pageMetaTextClass, 'mt-1')}>
                  账号尚未进入当前周期榜单，后续将由奖励中心重算与预览能力补齐。
                </p>
              </div>
            )}
          </Card>

          <Card className={cn(pagePanelClass, 'p-4')}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className={pageKickerClass}>周期切换</p>
                <h3 className={cn(pageCardTitleClass, 'mt-2')}>缓存状态说明</h3>
              </div>
              <UiBadge variant="success">quick</UiBadge>
            </div>
            <div className="mt-4 space-y-2 text-sm text-text-secondary">
              <p>周榜适合检查最近一周的 XP 变更是否稳定。</p>
              <p>月榜适合检查较长周期内的奖励口径是否一致。</p>
              <p>总榜适合检查历史累计值与发放逻辑是否偏移。</p>
            </div>
          </Card>
        </div>
      </div>
    </Card>
  )
}

export function RewardCenterConsole({
  viewerId,
  viewerRole,
  overview,
  badges,
  leaderboardSnapshots,
}: RewardCenterConsoleProps) {
  const currentXp = overview?.xp ?? 0
  const currentLevel = overview?.level ?? 1
  const nextLevelXp = overview?.nextLevelXp ?? XP_PER_LEVEL
  const levelGap = Math.max(0, nextLevelXp - currentXp)
  const levelProgress = calculateLevelProgress(currentXp)
  const unlockedBadges = badges.filter((badge) => badge.unlocked)
  const unlockedBadgeCount = unlockedBadges.length
  const totalBadgeCount = badges.length

  const dailyTaskRows = DEFAULT_DAILY_TASKS.map((task) => ({
    name: task.title,
    xp: task.xpReward,
    note: `目标完成 ${task.targetCount} 次，完成后可领取`,
  }))

  const onboardingRows = ONBOARDING_TASK_TEMPLATES.map((task) => ({
    name: task.title,
    xp: task.xpReward,
    note: '用于新账号首次成长补齐',
  }))

  return (
    <div className="space-y-3">
      <PageHeroShell
        eyebrow={<span className={pageBadgeClass}>管理端 / 奖励中心</span>}
        title={
          <PageHeroTitle
            title="奖励中心"
            capsuleLabel={viewerRole === 'ADMIN' ? 'Admin Control' : 'Teacher Control'}
          />
        }
        subtitle="统一查看排行榜、成长规则、奖励与 XP 口径。这个页面先承载展示与控制台骨架，后续写操作和审计会继续补齐。"
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard/leaderboard"
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              前台排行榜
            </Link>
            <Link
              href="/dashboard/achievements"
              className={buttonVariants({ variant: 'secondary', size: 'sm' })}
            >
              成就页
            </Link>
          </div>
        }
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="当前 XP"
            value={formatNumber(currentXp)}
            caption="全局成长基线"
            icon={Zap}
            toneClassName="bg-[hsl(var(--state-info-bg))] text-[hsl(var(--state-info-fg))]"
          />
          <MetricCard
            title="当前等级"
            value={`Lv ${currentLevel}`}
            caption="由 XP 自动计算"
            icon={Crown}
            toneClassName="bg-[hsl(var(--state-warning-bg))] text-[hsl(var(--state-warning-fg))]"
          />
          <MetricCard
            title="下一级目标"
            value={`${formatNumber(levelGap)} XP`}
            caption="到达下一等级"
            icon={RefreshCcw}
            toneClassName="bg-[hsl(var(--state-success-bg))] text-[hsl(var(--state-success-fg))]"
          />
          <MetricCard
            title="徽章解锁"
            value={`${unlockedBadgeCount}/${totalBadgeCount}`}
            caption="成长面板可见"
            icon={BadgeCheck}
            toneClassName="bg-[hsl(var(--state-info-bg))] text-[hsl(var(--state-info-fg))]"
          />
        </div>
      </PageHeroShell>

      <div className="grid gap-3 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-3">
          <Card className={cn(pagePanelStrongClass, 'p-4')}>
            <SectionBlockHeader
              title="成长总览"
              description="先把当前的 XP、等级、进度和徽章状态摆在一屏里，方便管理员快速核对现状。"
            />
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Card className={cn(pagePanelClass, 'p-4')}>
                <p className={pageKickerClass}>等级进度</p>
                <div className="mt-2 flex items-end justify-between gap-4">
                  <div>
                    <div className={cn(pageCardTitleClass, 'text-2xl')}>
                      Lv {currentLevel}
                    </div>
                    <p className={cn(pageMetaTextClass, 'mt-1')}>
                      距离下一级还差 {formatNumber(levelGap)} XP
                    </p>
                  </div>
                  <UiBadge variant="neutral">1,000 XP / Level</UiBadge>
                </div>
                <Progress
                  value={levelProgress}
                  indicatorClassName="bg-[linear-gradient(90deg,hsl(var(--primary)),hsl(var(--state-info-fg)))]"
                  className="mt-4 h-3 bg-surface-subtle"
                />
                <div className="mt-2 flex items-center justify-between text-xs text-text-secondary">
                  <span>{formatNumber(currentXp)} XP</span>
                  <span>{Math.round(levelProgress)}%</span>
                </div>
              </Card>

              <Card className={cn(pagePanelClass, 'p-4')}>
                <p className={pageKickerClass}>成长信号</p>
                <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                  <div className="rounded-2xl border border-borderTone bg-surface-subtle px-3 py-3">
                    <div className="text-[11px] uppercase tracking-[0.16em] text-text-tertiary">
                      Streak
                    </div>
                    <div className="mt-1 text-lg font-semibold text-text-primary">
                      {overview?.streak ?? 0}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-borderTone bg-surface-subtle px-3 py-3">
                    <div className="text-[11px] uppercase tracking-[0.16em] text-text-tertiary">
                      Accuracy
                    </div>
                    <div className="mt-1 text-lg font-semibold text-text-primary">
                      {overview?.accuracy ?? 0}%
                    </div>
                  </div>
                  <div className="rounded-2xl border border-borderTone bg-surface-subtle px-3 py-3">
                    <div className="text-[11px] uppercase tracking-[0.16em] text-text-tertiary">
                      Questions
                    </div>
                    <div className="mt-1 text-lg font-semibold text-text-primary">
                      {formatNumber(overview?.questions ?? 0)}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-borderTone bg-surface-subtle px-3 py-3">
                    <div className="text-[11px] uppercase tracking-[0.16em] text-text-tertiary">
                      Social
                    </div>
                    <div className="mt-1 text-lg font-semibold text-text-primary">
                      {formatNumber((overview?.posts ?? 0) + (overview?.comments ?? 0))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              <RewardRuleList
                title="每日任务"
                description="当前每日任务的 XP 口径来自配置层。"
                items={dailyTaskRows}
              />
              <RewardRuleList
                title="新手任务"
                description="新用户初始化成长用的奖励模板。"
                items={onboardingRows}
              />
            </div>

            <Card className={cn(pagePanelClass, 'mt-3 p-4')}>
              <SectionBlockHeader
                title="通用奖励常量"
                description="这些常量是后续发放与补发模块的统一参照，不在页面上二次散开。"
              />
              <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                {XP_REWARD_ROWS.map((row) => (
                  <div
                    key={row.key}
                    className="rounded-2xl border border-borderTone bg-surface-subtle px-3 py-3"
                  >
                    <div className={pageKickerClass}>{row.label}</div>
                    <div className="mt-1 text-lg font-semibold text-text-primary">
                      +{row.value} XP
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Card>
        </div>

        <div className="space-y-3">
          <RewardCenterLeaderboard
            snapshots={leaderboardSnapshots}
            viewerId={viewerId}
          />

          <Card className={cn(pagePanelClass, 'p-4')}>
            <SectionBlockHeader
              title="控制台入口"
              description="这个区域先作为前端骨架承载跨页面跳转，后续会接入补发、回滚、审计和规则编辑。"
            />
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {ACTION_LINKS.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      buttonVariants({ variant: 'outline' }),
                      'h-auto justify-start px-4 py-4'
                    )}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-borderTone bg-surface-subtle text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 text-left">
                      <span className="block text-sm font-semibold text-text-primary">
                        {item.label}
                      </span>
                      <span className="block text-xs text-text-secondary">
                        {item.description}
                      </span>
                    </span>
                    <ArrowRight className="ml-auto h-4 w-4" />
                  </Link>
                )
              })}
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <div className="rounded-2xl border border-borderTone bg-surface-subtle px-4 py-3">
                <div className={pageKickerClass}>当前状态</div>
                <div className="mt-1 text-sm font-semibold text-text-primary">
                  只读控制台骨架
                </div>
                <p className={cn(pageMetaTextClass, 'mt-1')}>
                  补发 / 回滚 / 审计将继续在后续子任务接入。
                </p>
              </div>
              <div className="rounded-2xl border border-borderTone bg-surface-subtle px-4 py-3">
                <div className={pageKickerClass}>权限范围</div>
                <div className="mt-1 text-sm font-semibold text-text-primary">
                  {viewerRole === 'ADMIN' ? '管理员' : '教师'}
                </div>
                <p className={cn(pageMetaTextClass, 'mt-1')}>
                  当前页面按管理端权限展示，不向普通学员开放。
                </p>
              </div>
            </div>
          </Card>

          <Card className={cn(pagePanelClass, 'p-4')}>
            <SectionBlockHeader
              title="徽章快照"
              description="先把已解锁与待解锁的徽章状态放出来，作为后续成长面板与奖励规则联动的基础。"
            />
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {badges.slice(0, 4).map((badge) => (
                <div
                  key={badge.id}
                  className="rounded-2xl border border-borderTone bg-surface-subtle px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-text-primary">
                        {badge.name}
                      </div>
                      <p className={cn(pageMetaTextClass, 'mt-1')}>
                        {badge.description}
                      </p>
                    </div>
                    <UiBadge variant={getBadgeTone(badge.unlocked)}>
                      {badge.unlocked ? '已解锁' : '待解锁'}
                    </UiBadge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
