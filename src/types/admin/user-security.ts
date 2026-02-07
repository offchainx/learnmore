/**
 * Admin User Management - Security Types
 * 安全相关类型（日志、伪装登录、备注）
 */

// 安全操作类型（对齐 Prisma SecurityAction 枚举）
export enum SecurityAction {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  PASSWORD_RESET = 'PASSWORD_RESET',
  IMPERSONATE_START = 'IMPERSONATE_START',
  IMPERSONATE_END = 'IMPERSONATE_END',
  USER_BANNED = 'USER_BANNED',
  USER_UNBANNED = 'USER_UNBANNED',
  PERMISSION_OVERRIDE = 'PERMISSION_OVERRIDE',
  ADMIN_NOTE_ADDED = 'ADMIN_NOTE_ADDED',
  ADMIN_NOTE_DELETED = 'ADMIN_NOTE_DELETED',
  ADMIN_NOTE_RESTORED = 'ADMIN_NOTE_RESTORED',
}

// Admin 备注
export interface AdminNote {
  id: string
  userId: string
  authorId: string
  authorName?: string // 关联查询
  content: string
  isPinned: boolean
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

// 安全日志
export interface SecurityLogEntry {
  id: string
  userId: string
  action: SecurityAction
  ipAddress: string | null
  userAgent: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
}

// 伪装登录会话
export interface ImpersonationSessionInfo {
  id: string
  adminId: string
  targetUserId: string
  startedAt: string
  expiresAt: string
  endedAt: string | null
  endReason: 'MANUAL_LOGOUT' | 'TOKEN_EXPIRED' | 'ADMIN_REVOKED' | null
}

// 高风险操作类型
export type HighRiskAction = 'ban' | 'unban' | 'impersonate' | 'resetPassword'
