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
  AdminDashboardRole,
  AdminDashboardRiskItem,
  AdminDashboardWindow,
  AdminDashboardWorkItem,
} from '@/types/admin-dashboard'
import { resolveRequestAdminIdentity } from '@/lib/auth/request-user'
import {
  getSecurityActionAuditLevel,
  getSecurityActionLabel,
  getSecurityActionRiskLevel,
  isSensitiveSecurityAction,
  summarizeSecurityLogMetadata,
} from '@/lib/admin/security-log'

export type AdminDashboardOverview = {
  window: AdminDashboardWindow
  kpis: AdminDashboardMetric[]
  workQueue: AdminDashboardWorkItem[]
  risks: AdminDashboardRiskItem[]
  audits: AdminDashboardAuditItem[]
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

  const criticalRiskCount = riskLogs.filter(
    (log) => getSecurityActionRiskLevel(log.action) === 'critical'
  ).length

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
    user: {
      id: string
      email: string
    }
  }>
): AdminDashboardRiskItem[] {
  return logs.slice(0, 8).map((log) => {
    const summary = summarizeSecurityLogMetadata(log.metadata, {
      target: log.user.email || log.user.id,
    })
    const target = summary.target || log.user.email || log.user.id
    const targetUserId =
      readMetadataString(log.metadata, 'targetId') || log.user.id
    return {
      id: `risk-${log.id}`,
      title: `${getSecurityActionLabel(log.action)} (${target})`,
      level: getSecurityActionRiskLevel(log.action),
      time: formatTime(log.createdAt),
      source: log.ipAddress || 'security_logs',
      href: `/admin/users/${targetUserId}?tab=audit`,
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
    const summary = summarizeSecurityLogMetadata(log.metadata, {
      operator: log.user.email || log.user.id,
      target: log.user.email || log.user.id,
    })
    const actor = summary.operator
    const target = summary.target || log.user.email || log.user.id
    return {
      id: `audit-${log.id}`,
      actor,
      action: getSecurityActionLabel(log.action),
      target,
      time: formatTime(log.createdAt),
      level: getSecurityActionAuditLevel(log.action),
      href: '/admin/users',
      visibleTo: isSensitiveSecurityAction(log.action) ? ['ADMIN'] : ['ADMIN', 'TEACHER'],
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

function formatTime(date: Date): string {
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function readMetadataString(value: unknown, key: string): string | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }
  const record = value as Record<string, unknown>
  const entry = record[key]
  return typeof entry === 'string' && entry.trim() ? entry.trim() : null
}
