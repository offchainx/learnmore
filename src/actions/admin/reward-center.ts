'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import {
  LeaderboardPeriod,
  Prisma,
  RewardAdminAuditModule,
  RewardAdminAuditResult,
  RewardAdjustmentStatus,
  RewardAdjustmentType,
  RewardRuleSource,
  AchievementRuleSource,
} from '@prisma/client'
import { startOfMonth, startOfWeek } from 'date-fns'
import prisma from '@/lib/prisma'
import { resolveRequestAdminIdentity } from '@/lib/auth/request-user'
import {
  DEFAULT_DAILY_TASKS,
  ONBOARDING_TASK_TEMPLATES,
  XP_REWARDS,
} from '@/lib/gamification'
import { BADGE_DEFINITIONS } from '@/lib/gamification/badge-definitions'
import type { AuditLogEntry, AuditLogType } from '@/types/content-pipeline'

const ALL_TIME_START = new Date(0)
const REWARD_CENTER_SOURCE = '奖励中心 Web 控制台'

const ACTION_REWARD_DEFINITIONS = [
  {
    key: 'LESSON_COMPLETE',
    action: '课程完成',
    cap: '按业务规则',
    note: '学员完成课程后即时发放',
  },
  {
    key: 'QUIZ_COMPLETE',
    action: '测验完成',
    cap: '按业务规则',
    note: '完成一次测验后即时发放',
  },
  {
    key: 'PERFECT_QUIZ',
    action: '满分测验',
    cap: '按业务规则',
    note: '测验满分时额外发放',
  },
  {
    key: 'DAILY_LOGIN',
    action: '每日登录',
    cap: '1 次 / 日',
    note: '每日首次登录触发',
  },
  {
    key: 'STREAK_BONUS',
    action: '连续学习奖励',
    cap: '1 次 / 日',
    note: '连续学习天数增长时发放',
  },
  {
    key: 'COMMENT_POST',
    action: '评论发布',
    cap: '按触发次数',
    note: '评论成功发布后触发',
  },
  {
    key: 'CREATE_POST',
    action: '发帖发布',
    cap: '按触发次数',
    note: '社区发帖成功后触发',
  },
] as const

export type RewardCenterRewardRule = {
  id: string
  taskType: string
  action: string
  ruleCode: string
  xp: number
  cap: string
  enabled: boolean
  auditLabel: string
  note: string
  source: 'preset' | 'draft'
}

export type RewardCenterAchievementRule = {
  id: string
  achievementType: string
  badgeCode: string
  triggerCondition: string
  limit: string
  enabled: boolean
  note: string
  auditLabel: string
}

export type RewardCenterAdjustmentRecord = {
  id: string
  kind: 'XP' | 'BADGE' | 'LEADERBOARD_SCORE'
  targetUser: string
  summary: string
  idempotencyKey: string
  reason: string
  rollbackPlan: string
  status: '已执行' | '已回滚'
  createdAt: string
}

export type RewardRuleFormInput = {
  taskType: string
  action: string
  ruleCode: string
  xp: number
  cap: string
  enabled: boolean
  note: string
}

export type AchievementRuleFormInput = {
  achievementType: string
  badgeCode: string
  triggerCondition: string
  limit: string
  enabled: boolean
  note: string
}

export type RewardAdjustmentFormInput = {
  kind: 'XP' | 'BADGE' | 'LEADERBOARD_SCORE'
  targetUser: string
  xpDelta?: number
  badgeCode?: string
  leaderboardPeriod?: LeaderboardPeriod
  leaderboardScoreDelta?: number
  reason: string
  rollbackPlan: string
}

export type RewardLeaderboardAuditInput = {
  period: LeaderboardPeriod
  action: '刷新排行榜快照' | '触发排行榜重算'
  comment: string
  result: string
  before?: string
  after?: string
  failureReason?: string | null
}

export type RewardCenterConsoleData = {
  rewardRules: RewardCenterRewardRule[]
  achievementRules: RewardCenterAchievementRule[]
  adjustmentRecords: RewardCenterAdjustmentRecord[]
  operationLogs: AuditLogEntry[]
}

type AdminIdentity = NonNullable<Awaited<ReturnType<typeof resolveRequestAdminIdentity>>>

function formatAuditTimestamp(date: Date) {
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

function normalizeBadgeCode(value: string) {
  return normalizeRuleCode(value).toLowerCase()
}

function serializeSnapshot(snapshot?: Record<string, unknown> | null) {
  if (!snapshot) return null

  const parts = Object.entries(snapshot)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => {
      if (value === null) return `${key}: -`
      if (Array.isArray(value)) return `${key}: ${value.join(', ')}`
      return `${key}: ${String(value)}`
    })

  return parts.length > 0 ? parts.join(' · ') : null
}

function toAuditLogType(result: RewardAdminAuditResult): AuditLogType {
  switch (result) {
    case 'SUCCESS':
      return 'success'
    case 'WARNING':
    case 'ROLLED_BACK':
      return 'warning'
    case 'ERROR':
      return 'error'
    case 'PENDING':
    default:
      return 'info'
  }
}

function toAuditLogModule(module: RewardAdminAuditModule) {
  switch (module) {
    case 'REWARD_RULE':
      return '奖励规则'
    case 'ACHIEVEMENT_RULE':
      return '成就联动'
    case 'LEADERBOARD':
      return '排行榜观察'
    case 'ADJUSTMENT':
      return '发放与校正'
    default:
      return module
  }
}

function resolveLeaderboardStartDate(period: LeaderboardPeriod) {
  const now = new Date()
  switch (period) {
    case 'WEEKLY':
      return startOfWeek(now, { weekStartsOn: 1 })
    case 'MONTHLY':
      return startOfMonth(now)
    case 'ALL_TIME':
      return ALL_TIME_START
    default:
      return startOfWeek(now, { weekStartsOn: 1 })
  }
}

async function requireAdmin(): Promise<AdminIdentity> {
  const currentUser = await resolveRequestAdminIdentity()
  if (!currentUser || currentUser.role !== 'ADMIN') {
    throw new Error('Unauthorized: Only admins can access reward center actions')
  }
  return currentUser
}

async function resolveTargetUser(identity: string) {
  const normalized = identity.trim()
  if (!normalized) return null

  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(normalized)

  return prisma.user.findFirst({
    where: {
      OR: [
        ...(isUuid ? [{ id: normalized }] : []),
        { email: { equals: normalized, mode: 'insensitive' } },
        { username: { equals: normalized, mode: 'insensitive' } },
        { handle: { equals: normalized, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      email: true,
      username: true,
      avatar: true,
    },
  })
}

function buildDefaultRewardRuleSeeds() {
  const dailyRules = DEFAULT_DAILY_TASKS.map((task) => ({
    taskType: '每日任务',
    actionName: task.title,
    ruleCode: task.type,
    xpValue: task.xpReward,
    capValue: `${task.targetCount} 次`,
    enabled: true,
    auditLabel: '每日任务模板',
    note: `完成 ${task.targetCount} 次后发放`,
    source: RewardRuleSource.DAILY_TASK,
  }))

  const onboardingRules = ONBOARDING_TASK_TEMPLATES.map((task) => ({
    taskType: '新手引导',
    actionName: task.title,
    ruleCode: task.type,
    xpValue: task.xpReward,
    capValue: '1 次',
    enabled: true,
    auditLabel: '新手引导模板',
    note: '新用户首次成长补齐',
    source: RewardRuleSource.ONBOARDING,
  }))

  const actionRules = ACTION_REWARD_DEFINITIONS.map((definition) => ({
    taskType: '通用动作',
    actionName: definition.action,
    ruleCode: definition.key,
    xpValue: XP_REWARDS[definition.key],
    capValue: definition.cap,
    enabled: true,
    auditLabel: 'XP 奖励常量',
    note: definition.note,
    source: RewardRuleSource.XP_CONSTANT,
  }))

  return [...dailyRules, ...onboardingRules, ...actionRules]
}

function buildDefaultAchievementRuleSeeds() {
  return BADGE_DEFINITIONS.map((badge) => ({
    achievementType: badge.name,
    badgeCode: badge.code,
    triggerCondition: badge.condition,
    limitValue: '不限量',
    enabled: true,
    note: badge.description,
    auditLabel: '徽章定义',
    source: AchievementRuleSource.BADGE_DEFINITION,
  }))
}

async function ensureRewardCenterDefaults() {
  await prisma.rewardRule.createMany({
    data: buildDefaultRewardRuleSeeds(),
    skipDuplicates: true,
  })

  await prisma.achievementRule.createMany({
    data: buildDefaultAchievementRuleSeeds(),
    skipDuplicates: true,
  })
}

async function createAuditLog(
  tx: Prisma.TransactionClient,
  params: {
    admin: AdminIdentity
    module: RewardAdminAuditModule
    action: string
    targetType: string
    targetId?: string | null
    targetLabel: string
    result: RewardAdminAuditResult
    comment?: string
    before?: Record<string, unknown> | null
    after?: Record<string, unknown> | null
    failureReason?: string | null
    idempotencyKey?: string | null
    metadata?: Prisma.InputJsonValue
  }
): Promise<AuditLogEntry> {
  const created = await tx.rewardAdminAuditLog.create({
    data: {
      module: params.module,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId ?? null,
      targetLabel: params.targetLabel,
      operatorId: params.admin.id,
      operatorName: params.admin.username || params.admin.email || '当前管理员',
      operatorAvatar: null,
      result: params.result,
      comment: params.comment,
      beforeSnapshot: serializeSnapshot(params.before),
      afterSnapshot: serializeSnapshot(params.after),
      failureReason: params.failureReason ?? null,
      idempotencyKey: params.idempotencyKey ?? null,
      source: REWARD_CENTER_SOURCE,
      metadata: params.metadata,
    },
  })

  return {
    id: created.id,
    user: created.operatorName,
    avatar: created.operatorAvatar ?? '',
    action: created.action,
    target: created.targetLabel,
    timestamp: formatAuditTimestamp(created.createdAt),
    type: toAuditLogType(created.result),
    comment: created.comment ?? undefined,
    module: toAuditLogModule(created.module),
    result:
      created.result === 'ROLLED_BACK'
        ? '已回滚'
        : created.result === 'SUCCESS'
          ? '成功'
          : created.result === 'WARNING'
            ? '警告'
            : created.result === 'ERROR'
              ? '失败'
              : '待处理',
    before: created.beforeSnapshot ?? undefined,
    after: created.afterSnapshot ?? undefined,
    failureReason: created.failureReason,
    idempotencyKey: created.idempotencyKey,
    source: created.source,
  }
}

function mapRewardRule(
  rule: {
    id: string
    taskType: string
    actionName: string
    ruleCode: string
    xpValue: number
    capValue: string
    enabled: boolean
    auditLabel: string
    note: string
    source: RewardRuleSource
  }
): RewardCenterRewardRule {
  return {
    id: rule.id,
    taskType: rule.taskType,
    action: rule.actionName,
    ruleCode: rule.ruleCode,
    xp: rule.xpValue,
    cap: rule.capValue,
    enabled: rule.enabled,
    auditLabel: rule.auditLabel,
    note: rule.note,
    source: rule.source === 'ADMIN_CUSTOM' ? 'draft' : 'preset',
  }
}

function mapFallbackRewardRule(
  rule: ReturnType<typeof buildDefaultRewardRuleSeeds>[number],
  index: number
): RewardCenterRewardRule {
  return {
    id: `fallback-reward-rule-${index}`,
    taskType: rule.taskType,
    action: rule.actionName,
    ruleCode: rule.ruleCode,
    xp: rule.xpValue,
    cap: rule.capValue,
    enabled: rule.enabled,
    auditLabel: rule.auditLabel,
    note: rule.note,
    source: 'preset',
  }
}

function mapAchievementRule(
  rule: {
    id: string
    achievementType: string
    badgeCode: string
    triggerCondition: string
    limitValue: string
    enabled: boolean
    note: string
    auditLabel: string
  }
): RewardCenterAchievementRule {
  return {
    id: rule.id,
    achievementType: rule.achievementType,
    badgeCode: rule.badgeCode,
    triggerCondition: rule.triggerCondition,
    limit: rule.limitValue,
    enabled: rule.enabled,
    note: rule.note,
    auditLabel: rule.auditLabel,
  }
}

function mapFallbackAchievementRule(
  rule: ReturnType<typeof buildDefaultAchievementRuleSeeds>[number],
  index: number
): RewardCenterAchievementRule {
  return {
    id: `fallback-achievement-rule-${index}`,
    achievementType: rule.achievementType,
    badgeCode: rule.badgeCode,
    triggerCondition: rule.triggerCondition,
    limit: rule.limitValue,
    enabled: rule.enabled,
    note: rule.note,
    auditLabel: rule.auditLabel,
  }
}

function mapAdjustmentRecord(
  record: {
    id: string
    operationType: RewardAdjustmentType
    targetIdentity: string
    summary: string
    idempotencyKey: string
    reason: string
    rollbackPlan: string
    status: RewardAdjustmentStatus
    createdAt: Date
  }
): RewardCenterAdjustmentRecord {
  return {
    id: record.id,
    kind: record.operationType,
    targetUser: record.targetIdentity,
    summary: record.summary,
    idempotencyKey: record.idempotencyKey,
    reason: record.reason,
    rollbackPlan: record.rollbackPlan,
    status: record.status === 'ROLLED_BACK' ? '已回滚' : '已执行',
    createdAt: formatAuditTimestamp(record.createdAt),
  }
}

function mapAuditLog(
  log: {
    id: string
    operatorName: string
    operatorAvatar: string | null
    action: string
    targetLabel: string
    createdAt: Date
    result: RewardAdminAuditResult
    comment: string | null
    module: RewardAdminAuditModule
    beforeSnapshot: string | null
    afterSnapshot: string | null
    failureReason: string | null
    idempotencyKey: string | null
    source: string
  }
): AuditLogEntry {
  return {
    id: log.id,
    user: log.operatorName,
    avatar: log.operatorAvatar ?? '',
    action: log.action,
    target: log.targetLabel,
    timestamp: formatAuditTimestamp(log.createdAt),
    type: toAuditLogType(log.result),
    comment: log.comment ?? undefined,
    module: toAuditLogModule(log.module),
    result:
      log.result === 'ROLLED_BACK'
        ? '已回滚'
        : log.result === 'SUCCESS'
          ? '成功'
          : log.result === 'WARNING'
            ? '警告'
            : log.result === 'ERROR'
              ? '失败'
              : '待处理',
    before: log.beforeSnapshot ?? undefined,
    after: log.afterSnapshot ?? undefined,
    failureReason: log.failureReason,
    idempotencyKey: log.idempotencyKey,
    source: log.source,
  }
}

function revalidateRewardCenterPaths(targetUserId?: string | null) {
  revalidatePath('/admin/rewards')
  revalidatePath('/dashboard/leaderboard')
  revalidatePath('/dashboard')
  revalidateTag('leaderboard-entries', 'quick')

  if (targetUserId) {
    revalidateTag(`achievement-overview:${targetUserId}`, 'quick')
    revalidateTag(`user-badges:${targetUserId}`, 'quick')
  }
}

function isRewardCenterBackendUnavailable(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.code === 'P2021' || error.code === 'P2022'
  }

  if (error instanceof Error) {
    return /reward_rules|achievement_rules|reward_adjustment_records|reward_admin_audit_logs/i.test(
      error.message
    )
  }

  return false
}

export async function getRewardCenterConsoleData(): Promise<RewardCenterConsoleData> {
  await requireAdmin()
  try {
    await ensureRewardCenterDefaults()

    const [rewardRules, achievementRules, adjustmentRecords, auditLogs] = await Promise.all([
      prisma.rewardRule.findMany({
        orderBy: [{ createdAt: 'asc' }, { actionName: 'asc' }],
      }),
      prisma.achievementRule.findMany({
        orderBy: [{ createdAt: 'asc' }, { achievementType: 'asc' }],
      }),
      prisma.rewardAdjustmentRecord.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.rewardAdminAuditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
    ])

    return {
      rewardRules: rewardRules.map(mapRewardRule),
      achievementRules: achievementRules.map(mapAchievementRule),
      adjustmentRecords: adjustmentRecords.map(mapAdjustmentRecord),
      operationLogs: auditLogs.map(mapAuditLog),
    }
  } catch (error) {
    if (!isRewardCenterBackendUnavailable(error)) {
      throw error
    }

    return {
      rewardRules: buildDefaultRewardRuleSeeds().map(mapFallbackRewardRule),
      achievementRules: buildDefaultAchievementRuleSeeds().map(mapFallbackAchievementRule),
      adjustmentRecords: [],
      operationLogs: [],
    }
  }
}

export async function createRewardRule(input: RewardRuleFormInput) {
  const admin = await requireAdmin()
  const normalizedCode = normalizeRuleCode(input.ruleCode)
  if (!normalizedCode) {
    throw new Error('规则编码不能为空')
  }

  const result = await prisma.$transaction(async (tx) => {
    const createdRule = await tx.rewardRule.create({
      data: {
        taskType: input.taskType.trim(),
        actionName: input.action.trim(),
        ruleCode: normalizedCode,
        xpValue: input.xp,
        capValue: input.cap.trim(),
        enabled: input.enabled,
        note: input.note.trim(),
        auditLabel: '管理员草稿',
        source: RewardRuleSource.ADMIN_CUSTOM,
        createdBy: admin.id,
        updatedBy: admin.id,
      },
    })

    const auditLog = await createAuditLog(tx, {
      admin,
      module: 'REWARD_RULE',
      action: '新增奖励规则',
      targetType: 'reward_rule',
      targetId: createdRule.id,
      targetLabel: createdRule.actionName,
      result: 'SUCCESS',
      comment: `新增规则 ${createdRule.ruleCode}，奖励 ${createdRule.xpValue} XP，上限 ${createdRule.capValue}。`,
      after: {
        规则编码: createdRule.ruleCode,
        任务类型: createdRule.taskType,
        XP: createdRule.xpValue,
        上限: createdRule.capValue,
        启停: createdRule.enabled ? '已启用' : '已停用',
      },
    })

    return {
      rule: mapRewardRule(createdRule),
      auditLog,
    }
  })

  revalidateRewardCenterPaths()
  return result
}

export async function updateRewardRule(ruleId: string, input: RewardRuleFormInput) {
  const admin = await requireAdmin()
  const normalizedCode = normalizeRuleCode(input.ruleCode)
  const currentRule = await prisma.rewardRule.findUnique({ where: { id: ruleId } })
  if (!currentRule) {
    throw new Error('奖励规则不存在')
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedRule = await tx.rewardRule.update({
      where: { id: ruleId },
      data: {
        taskType: input.taskType.trim(),
        actionName: input.action.trim(),
        ruleCode: normalizedCode,
        xpValue: input.xp,
        capValue: input.cap.trim(),
        enabled: input.enabled,
        note: input.note.trim(),
        updatedBy: admin.id,
      },
    })

    const auditLog = await createAuditLog(tx, {
      admin,
      module: 'REWARD_RULE',
      action: '编辑奖励规则',
      targetType: 'reward_rule',
      targetId: updatedRule.id,
      targetLabel: updatedRule.actionName,
      result: 'SUCCESS',
      comment: `更新规则 ${updatedRule.ruleCode}，当前奖励 ${updatedRule.xpValue} XP，上限 ${updatedRule.capValue}。`,
      before: {
        规则编码: currentRule.ruleCode,
        任务类型: currentRule.taskType,
        XP: currentRule.xpValue,
        上限: currentRule.capValue,
        启停: currentRule.enabled ? '已启用' : '已停用',
      },
      after: {
        规则编码: updatedRule.ruleCode,
        任务类型: updatedRule.taskType,
        XP: updatedRule.xpValue,
        上限: updatedRule.capValue,
        启停: updatedRule.enabled ? '已启用' : '已停用',
      },
    })

    return {
      rule: mapRewardRule(updatedRule),
      auditLog,
    }
  })

  revalidateRewardCenterPaths()
  return result
}

export async function toggleRewardRule(ruleId: string) {
  const admin = await requireAdmin()
  const currentRule = await prisma.rewardRule.findUnique({ where: { id: ruleId } })
  if (!currentRule) {
    throw new Error('奖励规则不存在')
  }

  const result = await prisma.$transaction(async (tx) => {
    const toggledRule = await tx.rewardRule.update({
      where: { id: ruleId },
      data: {
        enabled: !currentRule.enabled,
        updatedBy: admin.id,
      },
    })

    const auditLog = await createAuditLog(tx, {
      admin,
      module: 'REWARD_RULE',
      action: toggledRule.enabled ? '启用奖励规则' : '停用奖励规则',
      targetType: 'reward_rule',
      targetId: toggledRule.id,
      targetLabel: toggledRule.actionName,
      result: toggledRule.enabled ? 'SUCCESS' : 'WARNING',
      comment: `${toggledRule.ruleCode} 已${toggledRule.enabled ? '启用' : '停用'}，当前奖励 ${toggledRule.xpValue} XP。`,
      before: {
        规则编码: currentRule.ruleCode,
        状态: currentRule.enabled ? '已启用' : '已停用',
      },
      after: {
        规则编码: toggledRule.ruleCode,
        状态: toggledRule.enabled ? '已启用' : '已停用',
      },
    })

    return {
      rule: mapRewardRule(toggledRule),
      auditLog,
    }
  })

  revalidateRewardCenterPaths()
  return result
}

export async function updateAchievementRule(ruleId: string, input: AchievementRuleFormInput) {
  const admin = await requireAdmin()
  const normalizedCode = normalizeBadgeCode(input.badgeCode)
  const currentRule = await prisma.achievementRule.findUnique({ where: { id: ruleId } })
  if (!currentRule) {
    throw new Error('成就规则不存在')
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedRule = await tx.achievementRule.update({
      where: { id: ruleId },
      data: {
        achievementType: input.achievementType.trim(),
        badgeCode: normalizedCode,
        triggerCondition: input.triggerCondition.trim(),
        limitValue: input.limit.trim(),
        enabled: input.enabled,
        note: input.note.trim(),
        updatedBy: admin.id,
      },
    })

    const auditLog = await createAuditLog(tx, {
      admin,
      module: 'ACHIEVEMENT_RULE',
      action: '编辑成就规则',
      targetType: 'achievement_rule',
      targetId: updatedRule.id,
      targetLabel: updatedRule.achievementType,
      result: 'SUCCESS',
      comment: `更新成就 ${updatedRule.badgeCode}，触发条件“${updatedRule.triggerCondition}”，上限 ${updatedRule.limitValue}。`,
      before: {
        成就编码: currentRule.badgeCode,
        触发条件: currentRule.triggerCondition,
        上限: currentRule.limitValue,
        启停: currentRule.enabled ? '已启用' : '已停用',
      },
      after: {
        成就编码: updatedRule.badgeCode,
        触发条件: updatedRule.triggerCondition,
        上限: updatedRule.limitValue,
        启停: updatedRule.enabled ? '已启用' : '已停用',
      },
    })

    return {
      rule: mapAchievementRule(updatedRule),
      auditLog,
    }
  })

  revalidateRewardCenterPaths()
  return result
}

export async function toggleAchievementRule(ruleId: string) {
  const admin = await requireAdmin()
  const currentRule = await prisma.achievementRule.findUnique({ where: { id: ruleId } })
  if (!currentRule) {
    throw new Error('成就规则不存在')
  }

  const result = await prisma.$transaction(async (tx) => {
    const toggledRule = await tx.achievementRule.update({
      where: { id: ruleId },
      data: {
        enabled: !currentRule.enabled,
        updatedBy: admin.id,
      },
    })

    const auditLog = await createAuditLog(tx, {
      admin,
      module: 'ACHIEVEMENT_RULE',
      action: toggledRule.enabled ? '启用成就规则' : '停用成就规则',
      targetType: 'achievement_rule',
      targetId: toggledRule.id,
      targetLabel: toggledRule.achievementType,
      result: toggledRule.enabled ? 'SUCCESS' : 'WARNING',
      comment: `${toggledRule.badgeCode} 已${toggledRule.enabled ? '启用' : '停用'}，触发条件为“${toggledRule.triggerCondition}”。`,
      before: {
        成就编码: currentRule.badgeCode,
        状态: currentRule.enabled ? '已启用' : '已停用',
      },
      after: {
        成就编码: toggledRule.badgeCode,
        状态: toggledRule.enabled ? '已启用' : '已停用',
      },
    })

    return {
      rule: mapAchievementRule(toggledRule),
      auditLog,
    }
  })

  revalidateRewardCenterPaths()
  return result
}

export async function recordRewardLeaderboardAction(input: RewardLeaderboardAuditInput) {
  const admin = await requireAdmin()

  const auditLog = await prisma.$transaction(async (tx) =>
    createAuditLog(tx, {
      admin,
      module: 'LEADERBOARD',
      action: input.action,
      targetType: 'leaderboard_period',
      targetId: input.period,
      targetLabel:
        input.period === 'WEEKLY' ? '周榜' : input.period === 'MONTHLY' ? '月榜' : '总榜',
      result:
        input.result === '成功'
          ? 'SUCCESS'
          : input.result === '待接入'
            ? 'PENDING'
            : 'WARNING',
      comment: input.comment,
      before: input.before ? { 状态: input.before } : null,
      after: input.after ? { 状态: input.after } : null,
      failureReason: input.failureReason ?? null,
    })
  )

  revalidateRewardCenterPaths()
  return { auditLog }
}

export async function createRewardAdjustment(input: RewardAdjustmentFormInput) {
  const admin = await requireAdmin()
  const targetUser = await resolveTargetUser(input.targetUser)
  const normalizedTarget = input.targetUser.trim()
  if (!normalizedTarget) {
    throw new Error('目标用户不能为空')
  }

  if (input.kind === 'BADGE' && !input.badgeCode?.trim()) {
    throw new Error('请选择成就规则')
  }

  if (input.kind === 'XP' && typeof input.xpDelta !== 'number') {
    throw new Error('XP 补发值无效')
  }

  if (
    input.kind === 'LEADERBOARD_SCORE' &&
    (typeof input.leaderboardScoreDelta !== 'number' || !input.leaderboardPeriod)
  ) {
    throw new Error('榜单分数校正参数无效')
  }

  const summary =
    input.kind === 'XP'
      ? `为 ${normalizedTarget} 补发 ${input.xpDelta} XP`
      : input.kind === 'BADGE'
        ? `为 ${normalizedTarget} 补发成就 ${input.badgeCode}`
        : `为 ${normalizedTarget} 调整 ${input.leaderboardPeriod === 'WEEKLY' ? '周榜' : input.leaderboardPeriod === 'MONTHLY' ? '月榜' : '总榜'} ${input.leaderboardScoreDelta} 分`

  const idempotencyKey =
    input.kind === 'XP'
      ? `xp:${normalizedTarget.toLowerCase()}:${input.xpDelta}:${input.reason.trim().toLowerCase().slice(0, 24).replace(/\s+/g, '-')}`
      : input.kind === 'BADGE'
        ? `badge:${normalizedTarget.toLowerCase()}:${input.badgeCode?.trim().toLowerCase()}:${input.reason.trim().toLowerCase().slice(0, 24).replace(/\s+/g, '-')}`
        : `leaderboard:${normalizedTarget.toLowerCase()}:${input.leaderboardPeriod}:${input.leaderboardScoreDelta}:${input.reason.trim().toLowerCase().slice(0, 24).replace(/\s+/g, '-')}`

  const result = await prisma.$transaction(async (tx) => {
    if (input.kind === 'XP') {
      if (!targetUser) {
        throw new Error('目标用户不存在，无法执行 XP 补发')
      }

      await tx.user.update({
        where: { id: targetUser.id },
        data: {
          xp: { increment: input.xpDelta! },
        },
      })
    }

    if (input.kind === 'BADGE') {
      if (!targetUser) {
        throw new Error('目标用户不存在，无法执行成就补发')
      }

      const badge = await tx.badge.findUnique({
        where: { code: input.badgeCode!.trim().toLowerCase() },
        select: { id: true, code: true, name: true },
      })

      if (!badge) {
        throw new Error('目标成就不存在，无法执行补发')
      }

      const existing = await tx.userBadge.findFirst({
        where: { userId: targetUser.id, badgeId: badge.id },
        select: { id: true },
      })

      if (existing) {
        throw new Error('该用户已拥有此成就，禁止重复补发')
      }

      await tx.userBadge.create({
        data: {
          userId: targetUser.id,
          badgeId: badge.id,
        },
      })
    }

    if (input.kind === 'LEADERBOARD_SCORE') {
      if (!targetUser) {
        throw new Error('目标用户不存在，无法执行榜单分数校正')
      }

      await tx.leaderboardEntry.upsert({
        where: {
          userId_period_weekStart: {
            userId: targetUser.id,
            period: input.leaderboardPeriod!,
            weekStart: resolveLeaderboardStartDate(input.leaderboardPeriod!),
          },
        },
        update: {
          score: { increment: input.leaderboardScoreDelta! },
        },
        create: {
          userId: targetUser.id,
          period: input.leaderboardPeriod!,
          weekStart: resolveLeaderboardStartDate(input.leaderboardPeriod!),
          score: input.leaderboardScoreDelta!,
        },
      })
    }

    const adjustment = await tx.rewardAdjustmentRecord.create({
      data: {
        operationType: input.kind,
        targetUserId: targetUser?.id ?? null,
        targetIdentity: normalizedTarget,
        summary,
        idempotencyKey,
        reason: input.reason.trim(),
        rollbackPlan: input.rollbackPlan.trim(),
        xpDelta: input.kind === 'XP' ? input.xpDelta! : null,
        badgeCode: input.kind === 'BADGE' ? input.badgeCode!.trim().toLowerCase() : null,
        leaderboardPeriod:
          input.kind === 'LEADERBOARD_SCORE' ? input.leaderboardPeriod! : null,
        leaderboardScoreDelta:
          input.kind === 'LEADERBOARD_SCORE' ? input.leaderboardScoreDelta! : null,
        createdBy: admin.id,
        metadata: {
          targetUserEmail: targetUser?.email ?? null,
          targetUsername: targetUser?.username ?? null,
        } satisfies Prisma.InputJsonValue,
      },
    })

    const auditLog = await createAuditLog(tx, {
      admin,
      module: 'ADJUSTMENT',
      action: '提交补发 / 校正',
      targetType: 'reward_adjustment',
      targetId: adjustment.id,
      targetLabel: normalizedTarget,
      result: 'SUCCESS',
      comment: `${summary}，幂等键 ${idempotencyKey}，回滚预案：${input.rollbackPlan.trim()}。`,
      after: {
        摘要: summary,
        状态: '已执行',
        幂等键: idempotencyKey,
      },
      idempotencyKey,
    })

    return {
      record: mapAdjustmentRecord(adjustment),
      auditLog,
    }
  })

  revalidateRewardCenterPaths(targetUser?.id ?? null)
  return result
}

export async function rollbackRewardAdjustment(recordId: string) {
  const admin = await requireAdmin()
  const currentRecord = await prisma.rewardAdjustmentRecord.findUnique({
    where: { id: recordId },
  })

  if (!currentRecord) {
    throw new Error('补发 / 校正记录不存在')
  }

  if (currentRecord.status === 'ROLLED_BACK') {
    throw new Error('该记录已回滚')
  }

  const result = await prisma.$transaction(async (tx) => {
    if (currentRecord.operationType === 'XP' && currentRecord.targetUserId && currentRecord.xpDelta) {
      await tx.user.update({
        where: { id: currentRecord.targetUserId },
        data: {
          xp: { decrement: currentRecord.xpDelta },
        },
      })
    }

    if (
      currentRecord.operationType === 'BADGE' &&
      currentRecord.targetUserId &&
      currentRecord.badgeCode
    ) {
      const badge = await tx.badge.findUnique({
        where: { code: currentRecord.badgeCode },
        select: { id: true },
      })

      if (badge) {
        await tx.userBadge.deleteMany({
          where: {
            userId: currentRecord.targetUserId,
            badgeId: badge.id,
          },
        })
      }
    }

    if (
      currentRecord.operationType === 'LEADERBOARD_SCORE' &&
      currentRecord.targetUserId &&
      currentRecord.leaderboardPeriod &&
      currentRecord.leaderboardScoreDelta
    ) {
      await tx.leaderboardEntry.updateMany({
        where: {
          userId: currentRecord.targetUserId,
          period: currentRecord.leaderboardPeriod,
          weekStart: resolveLeaderboardStartDate(currentRecord.leaderboardPeriod),
        },
        data: {
          score: { decrement: currentRecord.leaderboardScoreDelta },
        },
      })
    }

    const rolledBackRecord = await tx.rewardAdjustmentRecord.update({
      where: { id: recordId },
      data: {
        status: RewardAdjustmentStatus.ROLLED_BACK,
        rolledBackAt: new Date(),
      },
    })

    const auditLog = await createAuditLog(tx, {
      admin,
      module: 'ADJUSTMENT',
      action: '回滚补发 / 校正',
      targetType: 'reward_adjustment',
      targetId: rolledBackRecord.id,
      targetLabel: rolledBackRecord.targetIdentity,
      result: 'ROLLED_BACK',
      comment: `已回滚 ${rolledBackRecord.summary}，沿用幂等键 ${rolledBackRecord.idempotencyKey}。`,
      before: {
        摘要: rolledBackRecord.summary,
        状态: '已执行',
      },
      after: {
        摘要: rolledBackRecord.summary,
        状态: '已回滚',
      },
      idempotencyKey: rolledBackRecord.idempotencyKey,
    })

    return {
      record: mapAdjustmentRecord(rolledBackRecord),
      auditLog,
    }
  })

  revalidateRewardCenterPaths(currentRecord.targetUserId)
  return result
}
