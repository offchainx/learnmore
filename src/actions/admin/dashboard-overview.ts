'use server'

import prisma from '@/lib/prisma'
import {
  FeedbackStatus,
  ReportStatus,
  SecurityAction,
  SubscriptionTier,
} from '@prisma/client'
import type {
  AdminDashboardAuditItem,
  AdminDashboardMetric,
  AdminDashboardQuickAction,
  AdminDashboardRole,
  AdminDashboardRiskItem,
  AdminDashboardWindow,
  AdminDashboardWorkItem,
} from '@/types/admin-dashboard'
import { resolveRequestAdminIdentity } from '@/lib/auth/request-user'

export type AdminDashboardOverview = {
  window: AdminDashboardWindow
  kpis: AdminDashboardMetric[]
  workQueue: AdminDashboardWorkItem[]
  risks: AdminDashboardRiskItem[]
  audits: AdminDashboardAuditItem[]
  actions: AdminDashboardQuickAction[]
  lastUpdated: string
}

type TimeBucket = {
  start: Date
  end: Date
  isLast: boolean
}

const WINDOW_CONFIG: Record<AdminDashboardWindow, { periodDays: number; chartDays: number }> = {
  TODAY: { periodDays: 1, chartDays: 7 },
  WEEK: { periodDays: 7, chartDays: 30 },
  MONTH: { periodDays: 30, chartDays: 90 },
}

const RISK_ACTIONS = new Set<SecurityAction>([
  SecurityAction.USER_BANNED,
  SecurityAction.USER_UNBANNED,
  SecurityAction.PERMISSION_OVERRIDE,
  SecurityAction.IMPERSONATE_START,
  SecurityAction.IMPERSONATE_END,
  SecurityAction.PASSWORD_RESET,
])

const PAID_TIERS = new Set<SubscriptionTier>([
  SubscriptionTier.STANDARD,
  SubscriptionTier.SMART_PLUS,
  SubscriptionTier.PREMIER,
])

const QUICK_ACTIONS: AdminDashboardQuickAction[] = [
  { id: 'qa1', label: '内容审核', icon: 'review', href: '/admin/content/review', visibleTo: ['ADMIN', 'TEACHER'] },
  { id: 'qa2', label: '用户管理', icon: 'users', href: '/admin/users', visibleTo: ['ADMIN', 'TEACHER'] },
  { id: 'qa3', label: '权限配置', icon: 'permissions', href: '/admin/permissions', visibleTo: ['ADMIN'] },
  { id: 'qa4', label: '学员反馈', icon: 'feedback', href: '/admin/feedback', visibleTo: ['ADMIN', 'TEACHER'] },
  { id: 'qa5', label: '优惠券管理', icon: 'vouchers', href: '/admin/vouchers', visibleTo: ['ADMIN'] },
]

export async function getAdminDashboardOverview(window: AdminDashboardWindow): Promise<AdminDashboardOverview> {
  const currentUser = await resolveRequestAdminIdentity(undefined, true)
  if (!currentUser) {
    throw new Error('Unauthorized')
  }

  return buildAdminDashboardOverview(window)
}

export async function buildAdminDashboardOverview(
  window: AdminDashboardWindow,
): Promise<AdminDashboardOverview> {

  const now = new Date()
  const config = WINDOW_CONFIG[window]
  const currentStart = subtractDays(now, config.periodDays)
  const previousStart = subtractDays(currentStart, config.periodDays)
  const chartStart = subtractDays(now, config.chartDays)
  const minStart = previousStart < chartStart ? previousStart : chartStart

  const [
    users,
    progressRows,
    feedbackRows,
    reportRows,
    openFeedbackCount,
    openReportCount,
    pendingFeedback,
    pendingReports,
    securityLogs,
  ] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        email: true,
        createdAt: true,
        lastSignInAt: true,
        subscriptionTier: true,
      },
    }),
    prisma.userProgress.findMany({
      where: { updatedAt: { gte: minStart } },
      select: {
        updatedAt: true,
        isCompleted: true,
      },
    }),
    prisma.userFeedback.findMany({
      where: { createdAt: { gte: minStart } },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.questionReport.findMany({
      where: { createdAt: { gte: minStart } },
      select: {
        id: true,
        issueType: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.userFeedback.count({
      where: { status: { in: [FeedbackStatus.PENDING, FeedbackStatus.IN_PROGRESS] } },
    }),
    prisma.questionReport.count({
      where: { status: { in: [ReportStatus.PENDING, ReportStatus.REVIEWING] } },
    }),
    prisma.userFeedback.findMany({
      where: { status: { in: [FeedbackStatus.PENDING, FeedbackStatus.IN_PROGRESS] } },
      orderBy: { createdAt: 'asc' },
      take: 8,
      select: {
        id: true,
        title: true,
        createdAt: true,
      },
    }),
    prisma.questionReport.findMany({
      where: { status: { in: [ReportStatus.PENDING, ReportStatus.REVIEWING] } },
      orderBy: { createdAt: 'asc' },
      take: 8,
      select: {
        id: true,
        issueType: true,
        createdAt: true,
      },
    }),
    prisma.securityLog.findMany({
      where: { createdAt: { gte: minStart } },
      orderBy: { createdAt: 'desc' },
      take: 200,
      select: {
        id: true,
        action: true,
        metadata: true,
        createdAt: true,
        ipAddress: true,
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    }),
  ])

  const buckets = buildBuckets(now, config.chartDays, 7)

  const activeCurrent = users.filter((u) => inRange(u.lastSignInAt, currentStart, now)).length
  const activePrev = users.filter((u) => inRange(u.lastSignInAt, previousStart, currentStart)).length
  const activeSpark = buckets.map((bucket) => users.filter((u) => inBucket(u.lastSignInAt, bucket)).length)

  const paidUsersTotal = users.filter((u) => isPaidTier(u.subscriptionTier)).length
  const paidCurrent = users.filter((u) => isPaidTier(u.subscriptionTier) && inRange(u.createdAt, currentStart, now)).length
  const paidPrev = users.filter((u) => isPaidTier(u.subscriptionTier) && inRange(u.createdAt, previousStart, currentStart)).length
  const paidSpark = buckets.map((bucket) =>
    users.filter((u) => isPaidTier(u.subscriptionTier) && inBucket(u.createdAt, bucket)).length
  )

  const completionCurrentRate = computeCompletionRate(progressRows, currentStart, now)
  const completionPrevRate = computeCompletionRate(progressRows, previousStart, currentStart)
  const completionSpark = buckets.map((bucket) => computeCompletionRate(progressRows, bucket.start, bucket.end))

  const ticketsCurrent =
    feedbackRows.filter((item) => inRange(item.createdAt, currentStart, now)).length +
    reportRows.filter((item) => inRange(item.createdAt, currentStart, now)).length
  const ticketsPrev =
    feedbackRows.filter((item) => inRange(item.createdAt, previousStart, currentStart)).length +
    reportRows.filter((item) => inRange(item.createdAt, previousStart, currentStart)).length
  const openTickets = openFeedbackCount + openReportCount
  const ticketsSpark = buckets.map((bucket) => {
    const feedbackCount = feedbackRows.filter((item) => inBucket(item.createdAt, bucket)).length
    const reportCount = reportRows.filter((item) => inBucket(item.createdAt, bucket)).length
    return feedbackCount + reportCount
  })

  const riskLogs = securityLogs.filter((log) => RISK_ACTIONS.has(log.action))
  const alertsCurrent = riskLogs.filter((log) => inRange(log.createdAt, currentStart, now)).length
  const alertsPrev = riskLogs.filter((log) => inRange(log.createdAt, previousStart, currentStart)).length
  const alertsSpark = buckets.map((bucket) => riskLogs.filter((log) => inBucket(log.createdAt, bucket)).length)

  const criticalRiskCount = riskLogs.filter((log) => mapRiskLevel(log.action) === 'critical').length

  const kpis: AdminDashboardMetric[] = [
    {
      id: 'kpi-active-users',
      title: '活跃用户',
      value: formatNumber(activeCurrent),
      trend: calcTrend(activeCurrent, activePrev),
      trendLabel: '较上窗口',
      sparklineData: activeSpark,
      visibleTo: ['ADMIN', 'TEACHER'],
    },
    {
      id: 'kpi-paid-users',
      title: '付费用户',
      value: formatNumber(paidUsersTotal),
      trend: calcTrend(paidCurrent, paidPrev),
      trendLabel: '较上窗口新增',
      sparklineData: paidSpark,
      visibleTo: ['ADMIN', 'TEACHER'],
    },
    {
      id: 'kpi-completion',
      title: '课程完成率',
      value: `${completionCurrentRate.toFixed(1)}%`,
      trend: calcTrend(completionCurrentRate, completionPrevRate),
      trendLabel: '较上窗口',
      sparklineData: completionSpark,
      visibleTo: ['ADMIN', 'TEACHER'],
    },
    {
      id: 'kpi-tickets',
      title: '待处理工单',
      value: formatNumber(openTickets),
      trend: calcTrend(ticketsCurrent, ticketsPrev),
      trendLabel: '较上窗口新增',
      sparklineData: ticketsSpark,
      exception: criticalRiskCount > 0 ? `${criticalRiskCount} 个高风险事件` : undefined,
      visibleTo: ['ADMIN', 'TEACHER'],
    },
    {
      id: 'kpi-system-errors',
      title: '系统异常',
      value: formatNumber(alertsCurrent),
      trend: calcTrend(alertsCurrent, alertsPrev),
      trendLabel: '较上窗口',
      sparklineData: alertsSpark,
      exception: criticalRiskCount > 0 ? `${criticalRiskCount} 个 critical` : undefined,
      visibleTo: ['ADMIN', 'TEACHER'],
    },
  ]

  const workQueue = buildWorkQueue(pendingReports, pendingFeedback, now)
  const risks = buildRiskItems(riskLogs)
  const audits = buildAuditItems(securityLogs)

  return {
    window,
    kpis,
    workQueue,
    risks,
    audits,
    actions: QUICK_ACTIONS,
    lastUpdated: now.toISOString(),
  }
}

function buildWorkQueue(
  reports: Array<{ id: string; issueType: string; createdAt: Date }>,
  feedbacks: Array<{ id: string; title: string; createdAt: Date }>,
  now: Date
): AdminDashboardWorkItem[] {
  const bothRoles: AdminDashboardRole[] = ['ADMIN', 'TEACHER']

  const reportItems = reports.map((report) => {
    const sla = buildSla(report.createdAt, now, 12)
    return {
      id: `report-${report.id}`,
      title: `内容问题待审核: ${report.issueType}`,
      sla: sla.label,
      slaLevel: sla.level,
      type: 'review' as const,
      href: '/admin/content/reports',
      visibleTo: bothRoles,
      dueAt: sla.dueAt,
    }
  })

  const feedbackItems = feedbacks.map((feedback) => {
    const sla = buildSla(feedback.createdAt, now, 24)
    return {
      id: `feedback-${feedback.id}`,
      title: `用户反馈待处理: ${feedback.title}`,
      sla: sla.label,
      slaLevel: sla.level,
      type: 'feedback' as const,
      href: '/admin/feedback',
      visibleTo: bothRoles,
      dueAt: sla.dueAt,
    }
  })

  return [...reportItems, ...feedbackItems]
    .sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime())
    .slice(0, 8)
    .map(({ dueAt: _dueAt, ...item }) => item)
}

function buildRiskItems(
  logs: Array<{
    id: string
    action: SecurityAction
    metadata: unknown
    createdAt: Date
    ipAddress: string | null
  }>
): AdminDashboardRiskItem[] {
  return logs.slice(0, 8).map((log) => {
    const meta = getMetadataRecord(log.metadata)
    const target = readString(meta, 'targetEmail') || readString(meta, 'targetUserEmail') || 'user'
    return {
      id: `risk-${log.id}`,
      title: `${mapActionLabel(log.action)} (${target})`,
      level: mapRiskLevel(log.action),
      time: formatTime(log.createdAt),
      source: log.ipAddress || 'security_logs',
      href: '/admin/permissions',
      visibleTo: ['ADMIN'],
    }
  })
}

function buildAuditItems(
  logs: Array<{
    id: string
    action: SecurityAction
    metadata: unknown
    createdAt: Date
    user: { id: string; email: string }
  }>
): AdminDashboardAuditItem[] {
  return logs.slice(0, 12).map((log) => {
    const meta = getMetadataRecord(log.metadata)
    const actor =
      readString(meta, 'actorName') ||
      readString(meta, 'adminEmail') ||
      readString(meta, 'operator') ||
      'system'

    const target = readString(meta, 'targetEmail') || log.user.email || log.user.id

    return {
      id: `audit-${log.id}`,
      actor,
      action: mapActionLabel(log.action),
      target,
      time: formatTime(log.createdAt),
      level: mapAuditLevel(log.action),
      visibleTo: isSensitiveAction(log.action) ? ['ADMIN'] : ['ADMIN', 'TEACHER'],
    }
  })
}

function subtractDays(base: Date, days: number): Date {
  return new Date(base.getTime() - days * 24 * 60 * 60 * 1000)
}

function buildBuckets(end: Date, days: number, count: number): TimeBucket[] {
  const start = subtractDays(end, days)
  const intervalMs = (end.getTime() - start.getTime()) / count

  return Array.from({ length: count }).map((_, index) => {
    const bucketStart = new Date(start.getTime() + intervalMs * index)
    const bucketEnd = new Date(start.getTime() + intervalMs * (index + 1))
    return {
      start: bucketStart,
      end: bucketEnd,
      isLast: index === count - 1,
    }
  })
}

function inRange(date: Date | null | undefined, start: Date, end: Date): boolean {
  if (!date) return false
  return date >= start && date < end
}

function inBucket(date: Date | null | undefined, bucket: TimeBucket): boolean {
  if (!date) return false
  if (bucket.isLast) {
    return date >= bucket.start && date <= bucket.end
  }
  return date >= bucket.start && date < bucket.end
}

function computeCompletionRate(
  rows: Array<{ updatedAt: Date; isCompleted: boolean }>,
  start: Date,
  end: Date
): number {
  const scoped = rows.filter((row) => inRange(row.updatedAt, start, end))
  if (scoped.length === 0) return 0
  const completed = scoped.filter((row) => row.isCompleted).length
  return (completed / scoped.length) * 100
}

function isPaidTier(tier: SubscriptionTier | null): boolean {
  return tier ? PAID_TIERS.has(tier) : false
}

function calcTrend(current: number, previous: number): number {
  if (previous === 0) {
    if (current === 0) return 0
    return 100
  }
  return Number((((current - previous) / previous) * 100).toFixed(1))
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('zh-CN').format(value)
}

function buildSla(createdAt: Date, now: Date, targetHours: number): {
  label: string
  level: 'normal' | 'warning' | 'critical'
  dueAt: Date
} {
  const dueAt = new Date(createdAt.getTime() + targetHours * 60 * 60 * 1000)
  const remainingHours = Math.ceil((dueAt.getTime() - now.getTime()) / (60 * 60 * 1000))

  if (remainingHours < 0) {
    return {
      label: `${Math.abs(remainingHours)} 小时超时`,
      level: 'critical',
      dueAt,
    }
  }

  if (remainingHours <= 4) {
    return {
      label: `${remainingHours} 小时剩余`,
      level: 'warning',
      dueAt,
    }
  }

  return {
    label: `${remainingHours} 小时剩余`,
    level: 'normal',
    dueAt,
  }
}

function mapRiskLevel(action: SecurityAction): 'low' | 'medium' | 'high' | 'critical' {
  switch (action) {
    case SecurityAction.USER_BANNED:
    case SecurityAction.PERMISSION_OVERRIDE:
      return 'critical'
    case SecurityAction.USER_UNBANNED:
    case SecurityAction.PASSWORD_RESET:
      return 'high'
    case SecurityAction.IMPERSONATE_START:
    case SecurityAction.IMPERSONATE_END:
      return 'medium'
    default:
      return 'low'
  }
}

function mapAuditLevel(action: SecurityAction): 'info' | 'warning' | 'critical' {
  switch (action) {
    case SecurityAction.USER_BANNED:
    case SecurityAction.PERMISSION_OVERRIDE:
      return 'critical'
    case SecurityAction.USER_UNBANNED:
    case SecurityAction.PASSWORD_RESET:
    case SecurityAction.IMPERSONATE_START:
    case SecurityAction.IMPERSONATE_END:
      return 'warning'
    default:
      return 'info'
  }
}

function isSensitiveAction(action: SecurityAction): boolean {
  return (
    action === SecurityAction.PERMISSION_OVERRIDE ||
    action === SecurityAction.USER_BANNED ||
    action === SecurityAction.USER_UNBANNED ||
    action === SecurityAction.IMPERSONATE_START ||
    action === SecurityAction.IMPERSONATE_END
  )
}

function mapActionLabel(action: SecurityAction): string {
  switch (action) {
    case SecurityAction.LOGIN:
      return '登录'
    case SecurityAction.LOGOUT:
      return '登出'
    case SecurityAction.PASSWORD_RESET:
      return '重置密码'
    case SecurityAction.IMPERSONATE_START:
      return '伪装登录开始'
    case SecurityAction.IMPERSONATE_END:
      return '伪装登录结束'
    case SecurityAction.USER_BANNED:
      return '封禁用户'
    case SecurityAction.USER_UNBANNED:
      return '解除封禁'
    case SecurityAction.PERMISSION_OVERRIDE:
      return '权限覆写'
    case SecurityAction.ADMIN_NOTE_ADDED:
      return '新增管理员备注'
    case SecurityAction.ADMIN_NOTE_DELETED:
      return '删除管理员备注'
    case SecurityAction.ADMIN_NOTE_RESTORED:
      return '恢复管理员备注'
    default:
      return action
  }
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function getMetadataRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
  return {}
}

function readString(record: Record<string, unknown>, key: string): string | null {
  const value = record[key]
  return typeof value === 'string' && value.trim() ? value.trim() : null
}
