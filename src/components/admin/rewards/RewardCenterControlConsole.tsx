'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { LeaderboardPeriod } from '@prisma/client'
import { History, PencilLine, PlusCircle, RefreshCw, RotateCcw } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge as UiBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
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
  createRewardAdjustment,
  createRewardRule,
  recordRewardLeaderboardAction,
  rollbackRewardAdjustment,
  toggleAchievementRule,
  toggleRewardRule,
  updateAchievementRule,
  updateRewardRule,
} from '@/actions/admin/reward-center'
import type {
  AchievementRuleFormInput,
  RewardAdjustmentFormInput,
  RewardCenterAchievementRule,
  RewardCenterAdjustmentRecord,
  RewardCenterRewardRule,
  RewardRuleFormInput,
} from '@/actions/admin/reward-center'
import type { LeaderboardEntryWithUser } from '@/actions/leaderboard'
import type { AuditLogEntry, AuditLogType } from '@/types/content-pipeline'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

type RewardSnapshotPeriod = LeaderboardPeriod

type RewardLeaderboardSnapshot = {
  period: RewardSnapshotPeriod
  entries: LeaderboardEntryWithUser[]
  myRank: { rank: number; score: number } | null
}

type LeaderboardObservationStatus = {
  cacheState: string
  cacheTone: 'neutral' | 'success' | 'warning'
  lastRefreshedAt: string
  lastRecomputedAt: string | null
  note: string
}

type RewardRuleDraft = {
  taskType: string
  action: string
  ruleCode: string
  xp: string
  cap: string
  enabled: boolean
  note: string
}

type AchievementRuleDraft = {
  achievementType: string
  badgeCode: string
  triggerCondition: string
  limit: string
  enabled: boolean
  note: string
}

type RewardAdjustmentKind = 'XP' | 'BADGE' | 'LEADERBOARD_SCORE'

type RewardAdjustmentDraft = {
  kind: RewardAdjustmentKind
  targetUser: string
  xpDelta: string
  badgeCode: string
  leaderboardPeriod: RewardSnapshotPeriod
  leaderboardScoreDelta: string
  reason: string
  rollbackPlan: string
}

interface RewardCenterControlConsoleProps {
  initialRewardRules: RewardCenterRewardRule[]
  initialAchievementRules: RewardCenterAchievementRule[]
  initialAdjustmentRecords: RewardCenterAdjustmentRecord[]
  initialOperationLogs: AuditLogEntry[]
  leaderboardSnapshots: RewardLeaderboardSnapshot[]
}

const PERIOD_LABELS: Record<RewardSnapshotPeriod, string> = {
  WEEKLY: '周榜',
  MONTHLY: '月榜',
  ALL_TIME: '总榜',
}

const TASK_TYPE_OPTIONS = ['每日任务', '新手引导', '通用动作', '自定义动作'] as const

const DEFAULT_RULE_DRAFT: RewardRuleDraft = {
  taskType: '自定义动作',
  action: '',
  ruleCode: '',
  xp: '50',
  cap: '1 次',
  enabled: true,
  note: '',
}

const DEFAULT_ACHIEVEMENT_DRAFT: AchievementRuleDraft = {
  achievementType: '',
  badgeCode: '',
  triggerCondition: '',
  limit: '不限量',
  enabled: true,
  note: '',
}

const DEFAULT_ADJUSTMENT_DRAFT: RewardAdjustmentDraft = {
  kind: 'XP',
  targetUser: '',
  xpDelta: '100',
  badgeCode: '',
  leaderboardPeriod: 'WEEKLY',
  leaderboardScoreDelta: '50',
  reason: '',
  rollbackPlan: '',
}

function formatNumber(value: number) {
  return value.toLocaleString('zh-CN')
}

function formatAuditTimestamp(date = new Date()) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

function normalizeRuleCode(value: string) {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase()
}

function buildLeaderboardObservationStatus(
  snapshots: RewardLeaderboardSnapshot[]
): Record<RewardSnapshotPeriod, LeaderboardObservationStatus> {
  const timestamp = formatAuditTimestamp()
  return snapshots.reduce<Record<RewardSnapshotPeriod, LeaderboardObservationStatus>>(
    (accumulator, snapshot) => {
      const hasEntries = snapshot.entries.length > 0
      accumulator[snapshot.period] = {
        cacheState: hasEntries ? '快照已加载' : '空快照',
        cacheTone: hasEntries ? 'success' : 'warning',
        lastRefreshedAt: timestamp,
        lastRecomputedAt: null,
        note: hasEntries
          ? '当前展示的是服务端返回的排行榜快照，刷新会重新拉取页面数据。'
          : '当前周期没有取到榜单快照，后续请检查缓存标签与重算链路。',
      }
      return accumulator
    },
    {
      WEEKLY: {
        cacheState: '空快照',
        cacheTone: 'warning',
        lastRefreshedAt: timestamp,
        lastRecomputedAt: null,
        note: '当前周期没有取到榜单快照，后续请检查缓存标签与重算链路。',
      },
      MONTHLY: {
        cacheState: '空快照',
        cacheTone: 'warning',
        lastRefreshedAt: timestamp,
        lastRecomputedAt: null,
        note: '当前周期没有取到榜单快照，后续请检查缓存标签与重算链路。',
      },
      ALL_TIME: {
        cacheState: '空快照',
        cacheTone: 'warning',
        lastRefreshedAt: timestamp,
        lastRecomputedAt: null,
        note: '当前周期没有取到榜单快照，后续请检查缓存标签与重算链路。',
      },
    }
  )
}

function buildRewardAdjustmentIdempotencyKey(draft: RewardAdjustmentDraft) {
  const targetUser = draft.targetUser.trim().toLowerCase()
  const reason = draft.reason.trim().toLowerCase().slice(0, 24).replace(/\s+/g, '-')

  if (draft.kind === 'XP') {
    return `xp:${targetUser}:${draft.xpDelta.trim()}:${reason}`
  }

  if (draft.kind === 'BADGE') {
    return `badge:${targetUser}:${draft.badgeCode.trim().toLowerCase()}:${reason}`
  }

  return `leaderboard:${targetUser}:${draft.leaderboardPeriod}:${draft.leaderboardScoreDelta.trim()}:${reason}`
}

function buildRewardAdjustmentSummary(
  draft: RewardAdjustmentDraft,
  achievementRules: RewardCenterAchievementRule[]
) {
  if (draft.kind === 'XP') {
    return `为 ${draft.targetUser.trim()} 补发 ${draft.xpDelta.trim()} XP`
  }

  if (draft.kind === 'BADGE') {
    const achievement = achievementRules.find((rule) => rule.badgeCode === draft.badgeCode)
    return `为 ${draft.targetUser.trim()} 补发成就 ${achievement?.achievementType || draft.badgeCode}`
  }

  return `为 ${draft.targetUser.trim()} 调整 ${PERIOD_LABELS[draft.leaderboardPeriod]} ${draft.leaderboardScoreDelta.trim()} 分`
}

function RewardRuleEditorDialog({
  open,
  draft,
  mode,
  duplicateCode,
  onOpenChange,
  onDraftChange,
  onSubmit,
}: {
  open: boolean
  draft: RewardRuleDraft
  mode: 'create' | 'edit'
  duplicateCode: boolean
  onOpenChange: (open: boolean) => void
  onDraftChange: (draft: RewardRuleDraft) => void
  onSubmit: () => void
}) {
  const normalizedCode = normalizeRuleCode(draft.ruleCode)
  const xpValue = Number(draft.xp)
  const isInvalid =
    !draft.action.trim() ||
    !normalizedCode ||
    !draft.cap.trim() ||
    !draft.note.trim() ||
    Number.isNaN(xpValue) ||
    xpValue < 0 ||
    duplicateCode

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border border-borderTone bg-page p-0 text-text-primary shadow-surface-lg">
        <DialogHeader className="border-b border-borderTone px-6 py-5">
          <DialogTitle className="text-xl font-semibold text-text-primary">
            {mode === 'create' ? '新增奖励动作' : '编辑奖励规则'}
          </DialogTitle>
          <DialogDescription className="text-sm text-text-secondary">
            统一维护任务类型、动作定义、XP 数值、次数上限与启停状态。当前为前端规则模块，后续会接入真实保存接口。
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 px-6 py-5 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">任务类型</label>
            <Select
              value={draft.taskType}
              onValueChange={(value) => onDraftChange({ ...draft, taskType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择任务类型" />
              </SelectTrigger>
              <SelectContent>
                {TASK_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">动作名称</label>
            <Input
              value={draft.action}
              onChange={(event) => onDraftChange({ ...draft, action: event.target.value })}
              placeholder="例如：完成专题训练"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">规则编码</label>
            <Input
              value={draft.ruleCode}
              onChange={(event) => onDraftChange({ ...draft, ruleCode: event.target.value })}
              placeholder="例如：TOPIC_PRACTICE_COMPLETE"
            />
            <p className="text-xs text-text-tertiary">
              规范化后：{normalizedCode || '待输入'}
              {duplicateCode ? ' · 编码已存在' : ''}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">XP 奖励值</label>
            <Input
              type="number"
              min={0}
              value={draft.xp}
              onChange={(event) => onDraftChange({ ...draft, xp: event.target.value })}
              placeholder="输入整数 XP 值"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">完成次数上限</label>
            <Input
              value={draft.cap}
              onChange={(event) => onDraftChange({ ...draft, cap: event.target.value })}
              placeholder="例如：1 次 / 日、按业务规则"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">启用状态</label>
            <div className="flex min-h-10 items-center justify-between rounded-2xl border border-borderTone bg-surface px-3">
              <div>
                <div className="text-sm font-medium text-text-primary">
                  {draft.enabled ? '已启用' : '已停用'}
                </div>
                <p className="text-xs text-text-tertiary">
                  保存后会同步到奖励规则列表
                </p>
              </div>
              <Switch
                checked={draft.enabled}
                onCheckedChange={(checked) => onDraftChange({ ...draft, enabled: checked })}
              />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-text-primary">规则说明</label>
            <Textarea
              value={draft.note}
              onChange={(event) => onDraftChange({ ...draft, note: event.target.value })}
              placeholder="说明这个动作何时触发、为何发放以及后续审计口径。"
              className="min-h-[104px]"
            />
          </div>
        </div>

        <DialogFooter className="border-t border-borderTone px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={onSubmit} disabled={isInvalid}>
            {mode === 'create' ? '新增动作' : '保存规则'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AchievementRuleEditorDialog({
  open,
  draft,
  duplicateCode,
  onOpenChange,
  onDraftChange,
  onSubmit,
}: {
  open: boolean
  draft: AchievementRuleDraft
  duplicateCode: boolean
  onOpenChange: (open: boolean) => void
  onDraftChange: (draft: AchievementRuleDraft) => void
  onSubmit: () => void
}) {
  const normalizedCode = normalizeRuleCode(draft.badgeCode).toLowerCase()
  const isInvalid =
    !draft.achievementType.trim() ||
    !normalizedCode ||
    !draft.triggerCondition.trim() ||
    !draft.limit.trim() ||
    !draft.note.trim() ||
    duplicateCode

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border border-borderTone bg-page p-0 text-text-primary shadow-surface-lg">
        <DialogHeader className="border-b border-borderTone px-6 py-5">
          <DialogTitle className="text-xl font-semibold text-text-primary">
            编辑成就联动
          </DialogTitle>
          <DialogDescription className="text-sm text-text-secondary">
            维护成就类型、触发条件、上限与启停状态。当前先作为前端规则模块，后续再接入真实成就定义接口。
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 px-6 py-5 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">成就类型</label>
            <Input
              value={draft.achievementType}
              onChange={(event) =>
                onDraftChange({ ...draft, achievementType: event.target.value })
              }
              placeholder="例如：Practice Master"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">成就编码</label>
            <Input
              value={draft.badgeCode}
              onChange={(event) =>
                onDraftChange({ ...draft, badgeCode: event.target.value })
              }
              placeholder="例如：practice_master_100"
            />
            <p className="text-xs text-text-tertiary">
              规范化后：{normalizedCode || '待输入'}
              {duplicateCode ? ' · 编码已存在' : ''}
            </p>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-text-primary">触发条件</label>
            <Textarea
              value={draft.triggerCondition}
              onChange={(event) =>
                onDraftChange({ ...draft, triggerCondition: event.target.value })
              }
              placeholder="例如：累计答对 >= 100"
              className="min-h-[92px]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">成就上限</label>
            <Input
              value={draft.limit}
              onChange={(event) => onDraftChange({ ...draft, limit: event.target.value })}
              placeholder="例如：不限量、100 枚"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">启用状态</label>
            <div className="flex min-h-10 items-center justify-between rounded-2xl border border-borderTone bg-surface px-3">
              <div>
                <div className="text-sm font-medium text-text-primary">
                  {draft.enabled ? '已启用' : '已停用'}
                </div>
                <p className="text-xs text-text-tertiary">
                  保存后会同步到成就联动列表
                </p>
              </div>
              <Switch
                checked={draft.enabled}
                onCheckedChange={(checked) =>
                  onDraftChange({ ...draft, enabled: checked })
                }
              />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-text-primary">成就说明</label>
            <Textarea
              value={draft.note}
              onChange={(event) => onDraftChange({ ...draft, note: event.target.value })}
              placeholder="说明该成就由哪些用户行为触发，以及管理员如何审计。"
              className="min-h-[104px]"
            />
          </div>
        </div>

        <DialogFooter className="border-t border-borderTone px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={onSubmit} disabled={isInvalid}>
            保存成就规则
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function RewardPolicyCard({
  rules,
  onCreateRule,
  onOpenLogs,
  onToggleRule,
  onUpdateRule,
}: {
  rules: RewardCenterRewardRule[]
  onCreateRule: (draft: RewardRuleDraft) => Promise<void> | void
  onOpenLogs: () => void
  onToggleRule: (ruleId: string) => Promise<void> | void
  onUpdateRule: (ruleId: string, draft: RewardRuleDraft) => Promise<void> | void
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null)
  const [draft, setDraft] = useState<RewardRuleDraft>(DEFAULT_RULE_DRAFT)

  const duplicateCode = useMemo(() => {
    const normalizedCode = normalizeRuleCode(draft.ruleCode)
    if (!normalizedCode) return false
    return rules.some(
      (rule) => rule.ruleCode === normalizedCode && rule.id !== editingRuleId
    )
  }, [draft.ruleCode, editingRuleId, rules])

  const openCreateDialog = () => {
    setEditingRuleId(null)
    setDraft(DEFAULT_RULE_DRAFT)
    setIsDialogOpen(true)
  }

  const openEditDialog = (rule: RewardCenterRewardRule) => {
    setEditingRuleId(rule.id)
    setDraft({
      taskType: rule.taskType,
      action: rule.action,
      ruleCode: rule.ruleCode,
      xp: String(rule.xp),
      cap: rule.cap,
      enabled: rule.enabled,
      note: rule.note,
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = () => {
    if (duplicateCode) return
    if (editingRuleId) {
      void onUpdateRule(editingRuleId, draft)
    } else {
      void onCreateRule(draft)
    }
    setIsDialogOpen(false)
    setEditingRuleId(null)
    setDraft(DEFAULT_RULE_DRAFT)
  }

  return (
    <>
      <Card id="action-registry" className={cn(pagePanelStrongClass, 'h-full p-4')}>
        <SectionBlockHeader
          title="奖励规则"
          actions={
            <Button variant="outline" size="sm" className="gap-2" onClick={openCreateDialog}>
              <PlusCircle className="h-4 w-4" />
              新增动作
            </Button>
          }
        />

        <div className="mt-4 space-y-2 xl:hidden">
          {rules.length === 0 ? (
            <div className={pageEmptyStateClass}>
              <p className="text-sm font-medium text-text-primary">暂无奖励规则</p>
              <p className={cn(pageMetaTextClass, 'mt-1')}>
                当前没有可用的奖励规则，后续可通过“新增动作”补齐真实规则。
              </p>
            </div>
          ) : null}

          {rules.map((rule) => (
            <div
              key={rule.id}
              className="rounded-2xl border border-borderTone bg-surface-subtle px-4 py-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <UiBadge variant="neutral">{rule.taskType}</UiBadge>
                <div className={pageCardTitleClass}>{rule.action}</div>
              </div>
              <p className={cn(pageMetaTextClass, 'mt-1')}>{rule.ruleCode}</p>
              <p className="mt-2 text-sm text-text-primary">{rule.note}</p>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-borderTone bg-surface px-3 py-2">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">
                    XP
                  </div>
                  <div className="mt-1 text-sm font-semibold text-text-primary">
                    +{formatNumber(rule.xp)} XP
                  </div>
                </div>
                <div className="rounded-xl border border-borderTone bg-surface px-3 py-2">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">
                    上限
                  </div>
                  <div className="mt-1 text-sm font-semibold text-text-primary">{rule.cap}</div>
                </div>
                <div className="rounded-xl border border-borderTone bg-surface px-3 py-2">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">
                    启停
                  </div>
                  <div className="mt-1 text-sm font-semibold text-text-primary">
                    {rule.enabled ? '已启用' : '已停用'}
                  </div>
                </div>
                <div className="rounded-xl border border-borderTone bg-surface px-3 py-2">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">
                    审计
                  </div>
                  <div className="mt-1 text-sm font-semibold text-text-primary">
                    {rule.auditLabel}
                  </div>
                </div>
                <div className="col-span-2 rounded-xl border border-borderTone bg-surface px-3 py-2">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">
                    操作
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(rule)}>
                      编辑
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => onToggleRule(rule.id)}>
                      {rule.enabled ? '停用' : '启用'}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={onOpenLogs}>
                      查看日志
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 hidden overflow-hidden rounded-3xl border border-borderTone bg-surface xl:block">
          {rules.length === 0 ? (
            <div className={pageEmptyStateClass}>
              <p className="text-sm font-medium text-text-primary">暂无奖励规则</p>
              <p className={cn(pageMetaTextClass, 'mt-1')}>
                当前没有可用的奖励规则，后续可通过“新增动作”补齐真实规则。
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[0.9fr_1.45fr_0.55fr_0.7fr_0.55fr_0.8fr_0.95fr] gap-3 border-b border-borderTone px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-tertiary">
                <div>任务类型</div>
                <div>动作 / 规则</div>
                <div>XP</div>
                <div>上限</div>
                <div>启停</div>
                <div>审计</div>
                <div>操作</div>
              </div>
              <div className="divide-y divide-borderTone">
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="grid grid-cols-[0.9fr_1.45fr_0.55fr_0.7fr_0.55fr_0.8fr_0.95fr] gap-3 px-4 py-3.5"
                  >
                    <div className="min-w-0">
                      <UiBadge variant="neutral">{rule.taskType}</UiBadge>
                    </div>
                    <div className="min-w-0">
                      <div className={pageCardTitleClass}>{rule.action}</div>
                      <p className={cn(pageMetaTextClass, 'mt-1')}>{rule.ruleCode}</p>
                      <p className={cn(pageMetaTextClass, 'mt-1')}>{rule.note}</p>
                    </div>
                    <div className="flex items-center">
                      <UiBadge variant="success">+{formatNumber(rule.xp)} XP</UiBadge>
                    </div>
                    <div className="flex items-center text-sm font-medium text-text-primary">
                      {rule.cap}
                    </div>
                    <div className="flex items-center">
                      <UiBadge variant={rule.enabled ? 'neutral' : 'warning'}>
                        {rule.enabled ? '已启用' : '已停用'}
                      </UiBadge>
                    </div>
                    <div className="flex flex-col justify-center">
                      <span className="text-sm font-medium text-text-primary">{rule.auditLabel}</span>
                      <button
                        type="button"
                        onClick={onOpenLogs}
                        className="mt-1 w-fit text-xs font-medium text-text-secondary transition-colors hover:text-text-primary"
                      >
                        查看日志
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(rule)}>
                        编辑
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => onToggleRule(rule.id)}>
                        {rule.enabled ? '停用' : '启用'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </Card>

      <RewardRuleEditorDialog
        open={isDialogOpen}
        draft={draft}
        mode={editingRuleId ? 'edit' : 'create'}
        duplicateCode={duplicateCode}
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            setEditingRuleId(null)
            setDraft(DEFAULT_RULE_DRAFT)
          }
        }}
        onDraftChange={setDraft}
        onSubmit={handleSubmit}
      />
    </>
  )
}

function LeaderboardObservationCard({
  snapshots,
  onRecordAction,
}: {
  snapshots: RewardLeaderboardSnapshot[]
  onRecordAction: (params: {
    action: string
    target: string
    comment: string
    type?: AuditLogType
    module?: string
    result?: string
    before?: string
    after?: string
    failureReason?: string | null
  }) => Promise<void> | void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activePeriod, setActivePeriod] = useState<RewardSnapshotPeriod>('WEEKLY')
  const [activeAction, setActiveAction] = useState<'refresh' | 'recompute' | null>(null)
  const [statusByPeriod, setStatusByPeriod] = useState<Record<RewardSnapshotPeriod, LeaderboardObservationStatus>>(
    () => buildLeaderboardObservationStatus(snapshots)
  )
  const activeSnapshot =
    snapshots.find((snapshot) => snapshot.period === activePeriod) ?? snapshots[0]
  const activeStatus = statusByPeriod[activePeriod]

  useEffect(() => {
    setStatusByPeriod(buildLeaderboardObservationStatus(snapshots))
  }, [snapshots])

  const handleRefresh = () => {
    const timestamp = formatAuditTimestamp()
    setActiveAction('refresh')
    setStatusByPeriod((current) => ({
      ...current,
      [activePeriod]: {
        ...current[activePeriod],
        cacheState: activeSnapshot?.entries.length ? '快照已刷新' : '空快照',
        cacheTone: activeSnapshot?.entries.length ? 'success' : 'warning',
        lastRefreshedAt: timestamp,
        note: activeSnapshot?.entries.length
          ? '已请求重新拉取当前排行榜快照，页面会继续展示最新返回结果。'
          : '当前仍为空快照，建议继续检查重算链路或等待真实榜单生成。',
      },
    }))
    void onRecordAction({
      action: '刷新排行榜快照',
      target: PERIOD_LABELS[activePeriod],
      type: 'info',
      module: '排行榜观察',
      result: '成功',
      before: `${PERIOD_LABELS[activePeriod]} · ${activeStatus.cacheState} · 最近刷新 ${activeStatus.lastRefreshedAt}`,
      after: `${PERIOD_LABELS[activePeriod]} · ${activeSnapshot?.entries.length ? '快照已刷新' : '空快照'} · 最近刷新 ${timestamp}`,
      comment: `已请求刷新 ${PERIOD_LABELS[activePeriod]} 快照，当前缓存状态为 ${activeSnapshot?.entries.length ? '已加载' : '空快照'}。`,
    })
    startTransition(() => {
      router.refresh()
      setActiveAction(null)
    })
  }

  const handleRecompute = () => {
    const timestamp = formatAuditTimestamp()
    setActiveAction('recompute')
    setStatusByPeriod((current) => ({
      ...current,
      [activePeriod]: {
        ...current[activePeriod],
        cacheState: '等待重算接管',
        cacheTone: 'warning',
        lastRefreshedAt: timestamp,
        lastRecomputedAt: timestamp,
        note: '已记录管理员重算动作，当前继续展示最近一次可用快照，等待真实榜单重算链路接管。',
      },
    }))
    void onRecordAction({
      action: '触发排行榜重算',
      target: PERIOD_LABELS[activePeriod],
      type: 'warning',
      module: '排行榜观察',
      result: '待接入',
      before: `${PERIOD_LABELS[activePeriod]} · ${activeStatus.cacheState}`,
      after: `${PERIOD_LABELS[activePeriod]} · 等待重算接管`,
      failureReason: '真实榜单重算链路尚未接入，当前先保留管理员重算记录与缓存状态变化。',
      comment: `已触发 ${PERIOD_LABELS[activePeriod]} 的管理端重算记录，等待真实重算接口接入。`,
    })
    startTransition(() => {
      router.refresh()
      setActiveAction(null)
    })
  }

  return (
    <Card id="leaderboard-observation" className={cn(pagePanelStrongClass, 'h-full p-4')}>
      <div className="flex flex-col gap-4">
        <SectionBlockHeader
          title="排行榜观察"
          actions={
            <div className="flex w-full flex-col gap-2 xl:w-auto xl:items-end">
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
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  isLoading={isPending && activeAction === 'refresh'}
                  loadingText="刷新中"
                  onClick={handleRefresh}
                >
                  <RefreshCw className="h-4 w-4" />
                  刷新快照
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  isLoading={isPending && activeAction === 'recompute'}
                  loadingText="重算中"
                  onClick={handleRecompute}
                >
                  <RotateCcw className="h-4 w-4" />
                  重算榜单
                </Button>
              </div>
            </div>
          }
        />

        <div className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-2xl border border-borderTone bg-surface-subtle px-4 py-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">
              缓存状态
            </div>
            <div className="mt-2 flex items-center gap-2">
              <UiBadge variant={activeStatus.cacheTone}>{activeStatus.cacheState}</UiBadge>
            </div>
            <p className={cn(pageMetaTextClass, 'mt-2')}>{activeStatus.note}</p>
          </div>
          <div className="rounded-2xl border border-borderTone bg-surface-subtle px-4 py-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">
              最近刷新
            </div>
            <div className="mt-2 text-sm font-semibold text-text-primary">
              {activeStatus.lastRefreshedAt}
            </div>
            <p className={cn(pageMetaTextClass, 'mt-2')}>
              当前 {PERIOD_LABELS[activePeriod]} 快照已回收到本页视图。
            </p>
          </div>
          <div className="rounded-2xl border border-borderTone bg-surface-subtle px-4 py-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">
              最近重算
            </div>
            <div className="mt-2 text-sm font-semibold text-text-primary">
              {activeStatus.lastRecomputedAt ?? '尚未触发'}
            </div>
            <p className={cn(pageMetaTextClass, 'mt-2')}>
              当前先记录重算操作状态，后续会由真实重算链路接管。
            </p>
          </div>
        </div>

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
  rules,
  onOpenLogs,
  onToggleRule,
  onUpdateRule,
}: {
  rules: RewardCenterAchievementRule[]
  onOpenLogs: () => void
  onToggleRule: (ruleId: string) => Promise<void> | void
  onUpdateRule: (ruleId: string, draft: AchievementRuleDraft) => Promise<void> | void
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null)
  const [draft, setDraft] = useState<AchievementRuleDraft>(DEFAULT_ACHIEVEMENT_DRAFT)

  const duplicateCode = useMemo(() => {
    const normalizedCode = normalizeRuleCode(draft.badgeCode).toLowerCase()
    if (!normalizedCode) return false
    return rules.some(
      (rule) => rule.badgeCode === normalizedCode && rule.id !== editingRuleId
    )
  }, [draft.badgeCode, editingRuleId, rules])

  const openEditDialog = (rule: RewardCenterAchievementRule) => {
    setEditingRuleId(rule.id)
    setDraft({
      achievementType: rule.achievementType,
      badgeCode: rule.badgeCode,
      triggerCondition: rule.triggerCondition,
      limit: rule.limit,
      enabled: rule.enabled,
      note: rule.note,
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = () => {
    if (!editingRuleId || duplicateCode) return
    void onUpdateRule(editingRuleId, draft)
    setIsDialogOpen(false)
    setEditingRuleId(null)
    setDraft(DEFAULT_ACHIEVEMENT_DRAFT)
  }

  return (
    <>
      <Card id="achievement-linkage" className={cn(pagePanelClass, 'h-full p-4')}>
        <SectionBlockHeader title="成就联动" />

        <div className="mt-4 space-y-2 xl:hidden">
          {rules.length === 0 ? (
            <div className={pageEmptyStateClass}>
              <p className="text-sm font-medium text-text-primary">暂无成就联动规则</p>
              <p className={cn(pageMetaTextClass, 'mt-1')}>
                当前没有成就联动定义，后续需要通过真实规则源补齐。
              </p>
            </div>
          ) : null}

          {rules.map((rule) => (
            <div key={rule.id} className="rounded-2xl border border-borderTone bg-surface-subtle px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className={pageCardTitleClass}>{rule.achievementType}</div>
                <UiBadge variant={rule.enabled ? 'neutral' : 'warning'}>
                  {rule.enabled ? '已启用' : '已停用'}
                </UiBadge>
              </div>
              <p className={cn(pageMetaTextClass, 'mt-1')}>{rule.badgeCode}</p>
              <p className="mt-2 text-sm text-text-primary">{rule.triggerCondition}</p>
              <p className={cn(pageMetaTextClass, 'mt-2')}>{rule.note}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-borderTone bg-surface px-3 py-2">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">成就上限</div>
                  <div className="mt-1 text-sm font-semibold text-text-primary">{rule.limit}</div>
                </div>
                <div className="rounded-xl border border-borderTone bg-surface px-3 py-2">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">审计</div>
                  <div className="mt-1 text-sm font-semibold text-text-primary">{rule.auditLabel}</div>
                </div>
                <div className="rounded-xl border border-borderTone bg-surface px-3 py-2 col-span-2">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">操作</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(rule)}>
                      <PencilLine className="h-4 w-4" />
                      编辑
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => onToggleRule(rule.id)}>
                      {rule.enabled ? '停用' : '启用'}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={onOpenLogs}>
                      查看日志
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 hidden overflow-hidden rounded-3xl border border-borderTone bg-surface xl:block">
          {rules.length === 0 ? (
            <div className={pageEmptyStateClass}>
              <p className="text-sm font-medium text-text-primary">暂无成就联动规则</p>
              <p className={cn(pageMetaTextClass, 'mt-1')}>
                当前没有成就联动定义，后续需要通过真实规则源补齐。
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[1.15fr_1.35fr_0.8fr_0.6fr_0.8fr] gap-3 border-b border-borderTone px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-tertiary">
                <div>成就类型</div>
                <div>触发条件</div>
                <div>成就上限</div>
                <div>启停</div>
                <div>操作</div>
              </div>
              <div className="divide-y divide-borderTone">
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="grid grid-cols-[1.15fr_1.35fr_0.8fr_0.6fr_0.8fr] gap-3 px-4 py-3.5"
                  >
                    <div className="min-w-0">
                      <div className={pageCardTitleClass}>{rule.achievementType}</div>
                      <p className={cn(pageMetaTextClass, 'mt-1')}>{rule.badgeCode}</p>
                      <p className={cn(pageMetaTextClass, 'mt-1')}>{rule.note}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-text-primary">{rule.triggerCondition}</p>
                    </div>
                    <div className="flex items-center">
                      <UiBadge variant="neutral">{rule.limit}</UiBadge>
                    </div>
                    <div className="flex items-center">
                      <UiBadge variant={rule.enabled ? 'neutral' : 'warning'}>
                        {rule.enabled ? '已启用' : '已停用'}
                      </UiBadge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(rule)}>
                        编辑
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => onToggleRule(rule.id)}>
                        {rule.enabled ? '停用' : '启用'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </Card>

      <AchievementRuleEditorDialog
        open={isDialogOpen}
        draft={draft}
        duplicateCode={duplicateCode}
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            setEditingRuleId(null)
            setDraft(DEFAULT_ACHIEVEMENT_DRAFT)
          }
        }}
        onDraftChange={setDraft}
        onSubmit={handleSubmit}
      />
    </>
  )
}

function RewardAdjustmentCard({
  records,
  achievementRules,
  onApplyAdjustment,
  onRollbackAdjustment,
}: {
  records: RewardCenterAdjustmentRecord[]
  achievementRules: RewardCenterAchievementRule[]
  onApplyAdjustment: (draft: RewardAdjustmentDraft) => Promise<void>
  onRollbackAdjustment: (record: RewardCenterAdjustmentRecord) => Promise<void>
}) {
  const [draft, setDraft] = useState<RewardAdjustmentDraft>(DEFAULT_ADJUSTMENT_DRAFT)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRollbackPending, setIsRollbackPending] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [recordToRollback, setRecordToRollback] = useState<RewardCenterAdjustmentRecord | null>(null)

  const idempotencyKey = buildRewardAdjustmentIdempotencyKey(draft)
  const summary = buildRewardAdjustmentSummary(draft, achievementRules)
  const duplicateRecord = records.find(
    (record) => record.idempotencyKey === idempotencyKey && record.status === '已执行'
  )
  const isAdminAllowed = true
  const isInvalid =
    !draft.targetUser.trim() ||
    !draft.reason.trim() ||
    draft.reason.trim().length < 6 ||
    !draft.rollbackPlan.trim() ||
    (draft.kind === 'XP' && (!draft.xpDelta.trim() || Number.isNaN(Number(draft.xpDelta)))) ||
    (draft.kind === 'BADGE' && !draft.badgeCode.trim()) ||
    (draft.kind === 'LEADERBOARD_SCORE' &&
      (!draft.leaderboardScoreDelta.trim() ||
        Number.isNaN(Number(draft.leaderboardScoreDelta)))) ||
    Boolean(duplicateRecord) ||
    !isAdminAllowed

  const resetDraft = () => {
    setDraft(DEFAULT_ADJUSTMENT_DRAFT)
  }

  const handleApply = async () => {
    setIsSubmitting(true)
    try {
      await onApplyAdjustment(draft)
      setIsConfirmOpen(false)
      resetDraft()
    } catch {
      // 错误提示由父层统一处理
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRollback = async () => {
    if (!recordToRollback) return
    setIsRollbackPending(true)
    try {
      await onRollbackAdjustment(recordToRollback)
      setRecordToRollback(null)
    } catch {
      // 错误提示由父层统一处理
    } finally {
      setIsRollbackPending(false)
    }
  }

  return (
    <>
      <Card id="reward-adjustment" className={cn(pagePanelStrongClass, 'p-4')}>
        <SectionBlockHeader title="发放与校正" />

        <div className="mt-4 grid gap-3 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">操作类型</label>
                <Select
                  value={draft.kind}
                  onValueChange={(value) =>
                    setDraft((current) => ({
                      ...current,
                      kind: value as RewardAdjustmentKind,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择操作类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="XP">XP 补发</SelectItem>
                    <SelectItem value="BADGE">成就补发</SelectItem>
                    <SelectItem value="LEADERBOARD_SCORE">榜单分数校正</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">目标用户</label>
                <Input
                  value={draft.targetUser}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, targetUser: event.target.value }))
                  }
                  placeholder="输入用户 ID / 邮箱 / 用户名"
                />
              </div>
            </div>

            {draft.kind === 'XP' ? (
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">XP 补发值</label>
                <Input
                  type="number"
                  value={draft.xpDelta}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, xpDelta: event.target.value }))
                  }
                  placeholder="输入 XP 数值"
                />
              </div>
            ) : null}

            {draft.kind === 'BADGE' ? (
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">成就类型</label>
                <Select
                  value={draft.badgeCode}
                  onValueChange={(value) =>
                    setDraft((current) => ({ ...current, badgeCode: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择成就规则" />
                  </SelectTrigger>
                  <SelectContent>
                    {achievementRules.map((rule) => (
                      <SelectItem key={rule.id} value={rule.badgeCode}>
                        {rule.achievementType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            {draft.kind === 'LEADERBOARD_SCORE' ? (
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">榜单周期</label>
                  <Select
                    value={draft.leaderboardPeriod}
                    onValueChange={(value) =>
                      setDraft((current) => ({
                        ...current,
                        leaderboardPeriod: value as RewardSnapshotPeriod,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择榜单周期" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WEEKLY">周榜</SelectItem>
                      <SelectItem value="MONTHLY">月榜</SelectItem>
                      <SelectItem value="ALL_TIME">总榜</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">分数校正值</label>
                  <Input
                    type="number"
                    value={draft.leaderboardScoreDelta}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        leaderboardScoreDelta: event.target.value,
                      }))
                    }
                    placeholder="输入分数增量"
                  />
                </div>
              </div>
            ) : null}

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">操作理由</label>
              <Textarea
                value={draft.reason}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, reason: event.target.value }))
                }
                placeholder="说明为何需要补发或校正，后续会作为审计记录的一部分。"
                className="min-h-[88px]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">回滚预案</label>
              <Textarea
                value={draft.rollbackPlan}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, rollbackPlan: event.target.value }))
                }
                placeholder="说明如果误发或校正错误，后续要如何回滚。"
                className="min-h-[88px]"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setIsConfirmOpen(true)} disabled={isInvalid || isSubmitting}>
                提交补发 / 校正
              </Button>
              <Button variant="outline" onClick={resetDraft} disabled={isSubmitting}>
                重置表单
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-borderTone bg-surface-subtle px-4 py-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">
                权限校验
              </div>
              <div className="mt-2 flex items-center gap-2">
                <UiBadge variant={isAdminAllowed ? 'success' : 'warning'}>
                  {isAdminAllowed ? 'ADMIN 已通过' : '无权限'}
                </UiBadge>
              </div>
              <p className={cn(pageMetaTextClass, 'mt-2')}>
                当前页面只允许管理员访问，补发与校正动作必须带理由与回滚预案。
              </p>
            </div>

            <div className="rounded-2xl border border-borderTone bg-surface-subtle px-4 py-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">
                幂等键
              </div>
              <div className="mt-2 break-all text-sm font-semibold text-text-primary">
                {idempotencyKey}
              </div>
              <p className={cn(pageMetaTextClass, 'mt-2')}>
                {duplicateRecord
                  ? '当前草稿与一条已执行记录重复，已阻止重复提交。'
                  : '提交前会先生成幂等键，避免重复补发同一动作。'}
              </p>
            </div>

            <div className="rounded-2xl border border-borderTone bg-surface-subtle px-4 py-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">
                执行预览
              </div>
              <div className="mt-2 text-sm font-semibold text-text-primary">{summary}</div>
              <p className={cn(pageMetaTextClass, 'mt-2')}>
                回滚预案：{draft.rollbackPlan.trim() || '待填写'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-3xl border border-borderTone bg-surface">
          <div className="grid grid-cols-[1.2fr_0.95fr_0.7fr_0.9fr_0.7fr] gap-3 border-b border-borderTone px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-tertiary">
            <div>最近操作</div>
            <div>幂等键</div>
            <div>状态</div>
            <div>时间</div>
            <div>操作</div>
          </div>
          <div className="divide-y divide-borderTone">
            {records.length === 0 ? (
              <div className={pageEmptyStateClass}>
                <p className="text-sm font-medium text-text-primary">暂无补发或校正记录</p>
                <p className={cn(pageMetaTextClass, 'mt-1')}>
                  当前模块会展示真实的补发 / 校正记录，便于继续核对与回滚。
                </p>
              </div>
            ) : (
              records.map((record) => (
                <div
                  key={record.id}
                  className="grid grid-cols-[1.2fr_0.95fr_0.7fr_0.9fr_0.7fr] gap-3 px-4 py-3.5"
                >
                  <div className="min-w-0">
                    <div className={pageCardTitleClass}>{record.summary}</div>
                    <p className={cn(pageMetaTextClass, 'mt-1')}>{record.reason}</p>
                  </div>
                  <div className="min-w-0 break-all text-xs text-text-secondary">
                    {record.idempotencyKey}
                  </div>
                  <div className="flex items-center">
                    <UiBadge variant={record.status === '已执行' ? 'success' : 'warning'}>
                      {record.status}
                    </UiBadge>
                  </div>
                  <div className="flex items-center text-sm text-text-primary">
                    {record.createdAt}
                  </div>
                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={record.status === '已回滚'}
                      onClick={() => setRecordToRollback(record)}
                    >
                      回滚
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="max-w-xl border border-borderTone bg-page text-text-primary">
          <DialogHeader>
            <DialogTitle>确认补发 / 校正</DialogTitle>
            <DialogDescription className="text-text-secondary">
              提交前请再次确认目标用户、幂等键和回滚预案。本次提交会写入真实记录并同步审计日志。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="rounded-2xl border border-borderTone bg-surface-subtle px-4 py-3">
              <div className={pageCardTitleClass}>{summary}</div>
              <p className={cn(pageMetaTextClass, 'mt-2')}>幂等键：{idempotencyKey}</p>
            </div>
            <div className="rounded-2xl border border-borderTone bg-surface-subtle px-4 py-3">
              <div className="text-sm font-medium text-text-primary">操作理由</div>
              <p className={cn(pageMetaTextClass, 'mt-2')}>{draft.reason.trim()}</p>
            </div>
            <div className="rounded-2xl border border-borderTone bg-surface-subtle px-4 py-3">
              <div className="text-sm font-medium text-text-primary">回滚预案</div>
              <p className={cn(pageMetaTextClass, 'mt-2')}>{draft.rollbackPlan.trim()}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
              返回编辑
            </Button>
            <Button onClick={handleApply} disabled={isInvalid || isSubmitting} isLoading={isSubmitting} loadingText="提交中">
              确认提交
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(recordToRollback)}
        onOpenChange={(open) => {
          if (!open) {
            setRecordToRollback(null)
          }
        }}
      >
        <DialogContent className="max-w-xl border border-borderTone bg-page text-text-primary">
          <DialogHeader>
            <DialogTitle>确认回滚</DialogTitle>
            <DialogDescription className="text-text-secondary">
              回滚会执行真实状态回退，并把结果写入统一操作日志。
            </DialogDescription>
          </DialogHeader>
          {recordToRollback ? (
            <div className="rounded-2xl border border-borderTone bg-surface-subtle px-4 py-3">
              <div className={pageCardTitleClass}>{recordToRollback.summary}</div>
              <p className={cn(pageMetaTextClass, 'mt-2')}>
                幂等键：{recordToRollback.idempotencyKey}
              </p>
              <p className={cn(pageMetaTextClass, 'mt-2')}>
                回滚预案：{recordToRollback.rollbackPlan}
              </p>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRecordToRollback(null)}>
              取消
            </Button>
            <Button
              variant="secondary"
              onClick={handleRollback}
              disabled={isRollbackPending}
              isLoading={isRollbackPending}
              loadingText="回滚中"
            >
              确认回滚
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function RewardCenterStateCard({
  rewardRuleCount,
  achievementRuleCount,
  leaderboardSnapshots,
  operationLogCount,
}: {
  rewardRuleCount: number
  achievementRuleCount: number
  leaderboardSnapshots: RewardLeaderboardSnapshot[]
  operationLogCount: number
}) {
  const emptySnapshotCount = leaderboardSnapshots.filter(
    (snapshot) => snapshot.entries.length === 0
  ).length

  const stateRows = [
    {
      label: '权限态',
      status: '已收口',
      tone: 'success' as const,
      detail: '未登录会重定向到登录页，非 ADMIN 会直接回到 `/dashboard`。',
    },
    {
      label: '奖励规则',
      status: rewardRuleCount > 0 ? '已加载' : '无数据',
      tone: rewardRuleCount > 0 ? ('success' as const) : ('warning' as const),
      detail:
        rewardRuleCount > 0
          ? `当前已有 ${rewardRuleCount} 条奖励规则可供管理。`
          : '当前没有奖励规则，列表已切到统一空态展示。',
    },
    {
      label: '成就联动',
      status: achievementRuleCount > 0 ? '已加载' : '无数据',
      tone: achievementRuleCount > 0 ? ('success' as const) : ('warning' as const),
      detail:
        achievementRuleCount > 0
          ? `当前已有 ${achievementRuleCount} 条成就联动规则。`
          : '当前没有成就联动规则，列表已切到统一空态展示。',
    },
    {
      label: '排行榜缓存',
      status: emptySnapshotCount === 0 ? '快照可用' : '部分失效',
      tone: emptySnapshotCount === 0 ? ('success' as const) : ('warning' as const),
      detail:
        emptySnapshotCount === 0
          ? '周榜 / 月榜 / 总榜当前都能拿到榜单快照。'
          : `${emptySnapshotCount} 个周期当前为空快照，排行榜观察区会显示缓存失效提示。`,
    },
    {
      label: '操作日志',
      status: operationLogCount > 0 ? '已记录' : '待产生',
      tone: operationLogCount > 0 ? ('neutral' as const) : ('warning' as const),
      detail:
        operationLogCount > 0
          ? `当前已记录 ${operationLogCount} 条奖励中心操作日志。`
          : '当前还没有奖励中心日志，首次执行规则编辑、重算或补发后会出现记录。',
    },
    {
      label: '交互态',
      status: '已收口',
      tone: 'neutral' as const,
      detail: '刷新、重算、提交补发、回滚都已接入按钮 loading、确认弹窗和空态提示。',
    },
  ]

  return (
    <Card id="reward-center-status" className={cn(pagePanelClass, 'p-4')}>
      <SectionBlockHeader title="状态收口" />

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {stateRows.map((row) => (
          <div
            key={row.label}
            className="rounded-2xl border border-borderTone bg-surface-subtle px-4 py-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-text-primary">{row.label}</div>
              <UiBadge variant={row.tone}>{row.status}</UiBadge>
            </div>
            <p className={cn(pageMetaTextClass, 'mt-2')}>{row.detail}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}

export function RewardCenterControlConsole({
  initialRewardRules,
  initialAchievementRules,
  initialAdjustmentRecords,
  initialOperationLogs,
  leaderboardSnapshots,
}: RewardCenterControlConsoleProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isOperationLogOpen, setIsOperationLogOpen] = useState(false)
  const [rewardRules, setRewardRules] = useState<RewardCenterRewardRule[]>(initialRewardRules)
  const [achievementRules, setAchievementRules] = useState<RewardCenterAchievementRule[]>(
    initialAchievementRules
  )
  const [adjustmentRecords, setAdjustmentRecords] = useState<RewardCenterAdjustmentRecord[]>(
    initialAdjustmentRecords
  )
  const [operationLogs, setOperationLogs] = useState<AuditLogEntry[]>(initialOperationLogs)

  useEffect(() => {
    setRewardRules(initialRewardRules)
  }, [initialRewardRules])

  useEffect(() => {
    setAchievementRules(initialAchievementRules)
  }, [initialAchievementRules])

  useEffect(() => {
    setAdjustmentRecords(initialAdjustmentRecords)
  }, [initialAdjustmentRecords])

  useEffect(() => {
    setOperationLogs(initialOperationLogs)
  }, [initialOperationLogs])

  const appendOperationLog = (entry: AuditLogEntry) => {
    setOperationLogs((current) => [entry, ...current])
  }

  const showActionError = (error: unknown, title: string) => {
    const description =
      error instanceof Error ? error.message : '操作失败，请稍后重试。'
    toast({
      title,
      description,
      variant: 'destructive',
    })
  }

  const handleCreateRule = async (draft: RewardRuleDraft) => {
    try {
      const payload: RewardRuleFormInput = {
        taskType: draft.taskType,
        action: draft.action.trim(),
        ruleCode: draft.ruleCode,
        xp: Number(draft.xp),
        cap: draft.cap.trim(),
        enabled: draft.enabled,
        note: draft.note.trim(),
      }

      const result = await createRewardRule(payload)
      setRewardRules((current) => [result.rule, ...current])
      appendOperationLog(result.auditLog)
      toast({
        title: '奖励规则已新增',
        description: `规则 ${result.rule.ruleCode} 已写入后端。`,
      })
    } catch (error) {
      showActionError(error, '新增奖励规则失败')
    }
  }

  const handleUpdateRule = async (ruleId: string, draft: RewardRuleDraft) => {
    try {
      const payload: RewardRuleFormInput = {
        taskType: draft.taskType,
        action: draft.action.trim(),
        ruleCode: draft.ruleCode,
        xp: Number(draft.xp),
        cap: draft.cap.trim(),
        enabled: draft.enabled,
        note: draft.note.trim(),
      }

      const result = await updateRewardRule(ruleId, payload)
      setRewardRules((current) =>
        current.map((rule) => (rule.id === ruleId ? result.rule : rule))
      )
      appendOperationLog(result.auditLog)
      toast({
        title: '奖励规则已更新',
        description: `规则 ${result.rule.ruleCode} 已同步到后端。`,
      })
    } catch (error) {
      showActionError(error, '更新奖励规则失败')
    }
  }

  const handleToggleRule = async (ruleId: string) => {
    try {
      const result = await toggleRewardRule(ruleId)
      setRewardRules((current) =>
        current.map((rule) => (rule.id === ruleId ? result.rule : rule))
      )
      appendOperationLog(result.auditLog)
    } catch (error) {
      showActionError(error, '切换奖励规则失败')
    }
  }

  const handleUpdateAchievementRule = (
    ruleId: string,
    draft: AchievementRuleDraft
  ) => {
    const run = async () => {
      try {
        const payload: AchievementRuleFormInput = {
          achievementType: draft.achievementType.trim(),
          badgeCode: draft.badgeCode,
          triggerCondition: draft.triggerCondition.trim(),
          limit: draft.limit.trim(),
          enabled: draft.enabled,
          note: draft.note.trim(),
        }

        const result = await updateAchievementRule(ruleId, payload)
        setAchievementRules((current) =>
          current.map((rule) => (rule.id === ruleId ? result.rule : rule))
        )
        appendOperationLog(result.auditLog)
      } catch (error) {
        showActionError(error, '更新成就规则失败')
      }
    }

    void run()
  }

  const handleToggleAchievementRule = async (ruleId: string) => {
    try {
      const result = await toggleAchievementRule(ruleId)
      setAchievementRules((current) =>
        current.map((rule) => (rule.id === ruleId ? result.rule : rule))
      )
      appendOperationLog(result.auditLog)
    } catch (error) {
      showActionError(error, '切换成就规则失败')
    }
  }

  const handleLeaderboardAudit = async (params: {
    action: string
    target: string
    comment: string
    type?: AuditLogType
    module?: string
    result?: string
    before?: string
    after?: string
    failureReason?: string | null
  }) => {
    try {
      const period =
        params.target === '周榜'
          ? 'WEEKLY'
          : params.target === '月榜'
            ? 'MONTHLY'
            : 'ALL_TIME'

      const result = await recordRewardLeaderboardAction({
        period,
        action: params.action as '刷新排行榜快照' | '触发排行榜重算',
        comment: params.comment,
        result: params.result || '成功',
        before: params.before,
        after: params.after,
        failureReason: params.failureReason,
      })

      appendOperationLog(result.auditLog)
    } catch (error) {
      showActionError(error, '记录排行榜操作失败')
    }
  }

  const handleApplyAdjustment = async (draft: RewardAdjustmentDraft) => {
    try {
      const payload: RewardAdjustmentFormInput = {
        kind: draft.kind,
        targetUser: draft.targetUser.trim(),
        xpDelta: draft.kind === 'XP' ? Number(draft.xpDelta) : undefined,
        badgeCode: draft.kind === 'BADGE' ? draft.badgeCode : undefined,
        leaderboardPeriod:
          draft.kind === 'LEADERBOARD_SCORE' ? draft.leaderboardPeriod : undefined,
        leaderboardScoreDelta:
          draft.kind === 'LEADERBOARD_SCORE'
            ? Number(draft.leaderboardScoreDelta)
            : undefined,
        reason: draft.reason.trim(),
        rollbackPlan: draft.rollbackPlan.trim(),
      }

      const result = await createRewardAdjustment(payload)
      setAdjustmentRecords((current) => [result.record, ...current])
      appendOperationLog(result.auditLog)
      toast({
        title: '发放 / 校正已执行',
        description: `${result.record.summary} 已写入后端。`,
      })
      router.refresh()
    } catch (error) {
      showActionError(error, '提交补发 / 校正失败')
      throw error
    }
  }

  const handleRollbackAdjustment = async (record: RewardCenterAdjustmentRecord) => {
    try {
      const result = await rollbackRewardAdjustment(record.id)
      setAdjustmentRecords((current) =>
        current.map((item) => (item.id === record.id ? result.record : item))
      )
      appendOperationLog(result.auditLog)
      toast({
        title: '回滚已完成',
        description: `${result.record.summary} 已回滚。`,
      })
      router.refresh()
    } catch (error) {
      showActionError(error, '回滚补发 / 校正失败')
      throw error
    }
  }

  return (
    <div className="space-y-3">
      <PageHeroShell
        eyebrow={<span className={pageBadgeClass}>管理端 / 奖励中心</span>}
        title={<PageHeroTitle title="奖励中心" capsuleLabel="Admin Control" />}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOperationLogOpen(true)}
          >
            <History className="h-4 w-4" />
            操作日志
          </Button>
        }
      />

      <div className="space-y-3">
        <RewardPolicyCard
          rules={rewardRules}
          onCreateRule={handleCreateRule}
          onOpenLogs={() => setIsOperationLogOpen(true)}
          onToggleRule={handleToggleRule}
          onUpdateRule={handleUpdateRule}
        />

        <div className="grid gap-3 xl:grid-cols-2 xl:items-stretch">
          <AchievementLinkageCard
            rules={achievementRules}
            onOpenLogs={() => setIsOperationLogOpen(true)}
            onToggleRule={handleToggleAchievementRule}
            onUpdateRule={handleUpdateAchievementRule}
          />
          <LeaderboardObservationCard
            snapshots={leaderboardSnapshots}
            onRecordAction={handleLeaderboardAudit}
          />
        </div>

        <RewardAdjustmentCard
          records={adjustmentRecords}
          achievementRules={achievementRules}
          onApplyAdjustment={handleApplyAdjustment}
          onRollbackAdjustment={handleRollbackAdjustment}
        />

        <RewardCenterStateCard
          rewardRuleCount={rewardRules.length}
          achievementRuleCount={achievementRules.length}
          leaderboardSnapshots={leaderboardSnapshots}
          operationLogCount={operationLogs.length}
        />
      </div>

      <AuditLogDrawer
        isOpen={isOperationLogOpen}
        onClose={() => setIsOperationLogOpen(false)}
        logs={operationLogs}
        title="奖励 / 成就操作日志"
        description="记录所有与奖励规则、成就规则和榜单观察相关的变更。"
        emptyText="当前暂无奖励 / 成就操作日志。"
        searchPlaceholder="搜索奖励规则、成就规则、操作人或备注..."
        footerText={`当前显示 ${operationLogs.length} 条真实奖励中心日志`}
      />
    </div>
  )
}
