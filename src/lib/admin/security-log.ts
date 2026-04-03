import type { Prisma } from '@prisma/client'

export type SecurityAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'PASSWORD_RESET'
  | 'IMPERSONATE_START'
  | 'IMPERSONATE_END'
  | 'USER_BANNED'
  | 'USER_UNBANNED'
  | 'PERMISSION_OVERRIDE'
  | 'ADMIN_NOTE_ADDED'
  | 'ADMIN_NOTE_PINNED'
  | 'ADMIN_NOTE_DELETED'
  | 'ADMIN_NOTE_RESTORED'

export type SecurityLogPerson = {
  id: string
  email?: string | null
  name?: string | null
}

export type SecurityLogChange = {
  field: string
  before?: string | number | boolean | null
  after?: string | number | boolean | null
}

export type SecurityLogMetadataInput = {
  operator?: SecurityLogPerson | null
  target?: SecurityLogPerson | null
  reason?: string | null
  changes?: SecurityLogChange[] | null
  extra?: Record<string, unknown> | null
}

export type SecurityLogSummary = {
  operator: string
  target: string
  reason: string | null
  changes: string[]
}

export function buildSecurityLogMetadata(
  input: SecurityLogMetadataInput
): Prisma.InputJsonValue {
  return {
    ...(input.operator
      ? {
          operatorId: input.operator.id,
          operatorEmail: input.operator.email ?? null,
          operatorName: input.operator.name ?? null,
        }
      : {}),
    ...(input.target
      ? {
          targetId: input.target.id,
          targetEmail: input.target.email ?? null,
          targetName: input.target.name ?? null,
        }
      : {}),
    ...(input.reason ? { reason: input.reason } : {}),
    ...(input.changes?.length
      ? {
          changes: input.changes.map((change) => ({
            field: change.field,
            before: change.before ?? null,
            after: change.after ?? null,
          })),
        }
      : {}),
    ...(input.extra ?? {}),
  } as Prisma.InputJsonValue
}

export function summarizeSecurityLogMetadata(
  metadata: unknown,
  fallback?: { operator?: string; target?: string }
): SecurityLogSummary {
  const record = toRecord(metadata)

  const operator =
    readPersonLabel(record, 'operator', fallback?.operator ?? 'system') ??
    fallback?.operator ??
    'system'
  const target =
    readPersonLabel(record, 'target', fallback?.target ?? 'target') ??
    fallback?.target ??
    'target'
  const reason = readString(record, 'reason')
  const changes = readChanges(record)

  return {
    operator,
    target,
    reason,
    changes,
  }
}

export function formatSecurityLogSummary(
  metadata: unknown,
  fallback?: { operator?: string; target?: string }
): string {
  const summary = summarizeSecurityLogMetadata(metadata, fallback)
  const parts = [summary.operator, summary.target, ...summary.changes]
  if (summary.reason) {
    parts.push(`原因: ${summary.reason}`)
  }
  return parts.filter(Boolean).join(' | ')
}

export function getSecurityActionLabel(action: SecurityAction | string): string {
  switch (action) {
    case 'LOGIN':
      return '登录'
    case 'LOGOUT':
      return '登出'
    case 'PASSWORD_RESET':
      return '重置密码'
    case 'IMPERSONATE_START':
      return '伪装登录开始'
    case 'IMPERSONATE_END':
      return '伪装登录结束'
    case 'USER_BANNED':
      return '封禁用户'
    case 'USER_UNBANNED':
      return '解除封禁'
    case 'PERMISSION_OVERRIDE':
      return '权限覆写'
    case 'ADMIN_NOTE_ADDED':
      return '新增管理员备注'
    case 'ADMIN_NOTE_PINNED':
      return '置顶管理员备注'
    case 'ADMIN_NOTE_DELETED':
      return '删除管理员备注'
    case 'ADMIN_NOTE_RESTORED':
      return '恢复管理员备注'
    default:
      return action
  }
}

export function getSecurityActionRiskLevel(
  action: SecurityAction | string
): 'low' | 'medium' | 'high' | 'critical' {
  switch (action) {
    case 'USER_BANNED':
    case 'PERMISSION_OVERRIDE':
      return 'critical'
    case 'USER_UNBANNED':
    case 'PASSWORD_RESET':
      return 'high'
    case 'IMPERSONATE_START':
    case 'IMPERSONATE_END':
      return 'medium'
    default:
      return 'low'
  }
}

export function getSecurityActionAuditLevel(
  action: SecurityAction | string
): 'info' | 'warning' | 'critical' {
  switch (action) {
    case 'USER_BANNED':
    case 'PERMISSION_OVERRIDE':
      return 'critical'
    case 'USER_UNBANNED':
    case 'PASSWORD_RESET':
    case 'IMPERSONATE_START':
    case 'IMPERSONATE_END':
      return 'warning'
    default:
      return 'info'
  }
}

export function isSensitiveSecurityAction(action: SecurityAction | string): boolean {
  return (
    action === 'PERMISSION_OVERRIDE' ||
    action === 'USER_BANNED' ||
    action === 'USER_UNBANNED' ||
    action === 'IMPERSONATE_START' ||
    action === 'IMPERSONATE_END' ||
    action === 'PASSWORD_RESET'
  )
}

function toRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
  return {}
}

function readPersonLabel(
  record: Record<string, unknown>,
  kind: 'operator' | 'target',
  fallback: string
): string | null {
  const keys =
    kind === 'operator'
      ? ['operatorName', 'operatorEmail', 'adminName', 'adminEmail', 'actorName', 'actorEmail', 'operatorId', 'adminId', 'actorId']
      : ['targetName', 'targetEmail', 'targetUserName', 'targetUserEmail', 'targetId', 'targetUserId', 'userEmail', 'userId']

  for (const key of keys) {
    const value = readString(record, key)
    if (value) {
      return value
    }
  }

  return fallback
}

function readChanges(record: Record<string, unknown>): string[] {
  const raw = record.changes
  if (!Array.isArray(raw) || raw.length === 0) {
    return []
  }

  return raw
    .map((change) => {
      if (!change || typeof change !== 'object' || Array.isArray(change)) {
        return null
      }

      const changeRecord = change as Record<string, unknown>
      const field = readString(changeRecord, 'field')
      if (!field) return null

      const before = formatValue(changeRecord.before)
      const after = formatValue(changeRecord.after)
      const label = mapChangeFieldLabel(field)
      return `${label}: ${before} → ${after}`
    })
    .filter((item): item is string => Boolean(item))
}

function mapChangeFieldLabel(field: string): string {
  switch (field) {
    case 'status':
      return '状态'
    case 'subscriptionTier':
      return '订阅等级'
    case 'subscriptionEnd':
      return '到期时间'
    case 'isPinned':
      return '置顶状态'
    case 'session':
      return '会话'
    default:
      return field
  }
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '-'
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return JSON.stringify(value)
}

function readString(record: Record<string, unknown>, key: string): string | null {
  const value = record[key]
  return typeof value === 'string' && value.trim() ? value.trim() : null
}
