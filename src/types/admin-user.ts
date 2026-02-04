/**
 * Admin User Management Types
 * Story-046: 用户全生命周期管理后台
 */

// 用户状态枚举
export enum UserStatus {
  ACTIVE = 'Active',
  BANNED = 'Banned',
  PAUSED = 'Paused',
}

// 订阅等级枚举（对齐 Story-045 四级体系）
export enum SubscriptionTier {
  STARTER = 'Starter',
  STANDARD = 'Standard',
  SMART_PLUS = 'Smart+',
  PREMIER = 'Premier',
}

// 用户摘要信息（列表页展示）
export interface UserSummary {
  id: string
  name: string
  email: string
  avatarColor: string
  status: UserStatus
  tier: SubscriptionTier
  lastActive: string // ISO Date
  lastActiveLabel: string // 相对时间，如 "2h ago"
  grade: string
  school: string
}

// 完整用户信息（详情页使用）
export interface User extends UserSummary {
  role: string
  location: string
  phone: string
  joinDate: string
  joinSource: string
  totalSpend: number
  projectsCount: number
  apiCalls: number
  activeDeviceCount: number
  learningStats: {
    totalQuestions: number
    accuracy: number
    mistakes: number
    daysActive: number
  }
}

// 排序配置
export interface SortConfig {
  key: keyof UserSummary
  direction: 'asc' | 'desc'
}

// 筛选状态
export interface UserFilterState {
  search: string
  status: UserStatus | 'All'
  tier: SubscriptionTier | 'All'
}

// 分页参数
export interface PaginationParams {
  page: number
  pageSize: number
  sortField: keyof UserSummary
  sortDirection: 'asc' | 'desc'
}

// 分页响应
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ============ Task B: 详情页相关类型 ============

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

// 用户详情页完整数据
export interface UserDetail extends User {
  notes: AdminNote[]
  recentSecurityLogs: SecurityLogEntry[]
  activeImpersonationSession?: ImpersonationSessionInfo | null
}

// 高风险操作类型
export type HighRiskAction = 'ban' | 'unban' | 'impersonate' | 'resetPassword'

// Server Action 响应
export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}

// ============ Task C/D: 额外 Tab 相关类型 ============

export interface PaymentRecord {
  id: string
  date: string
  amount: number
  type: 'Renewal' | 'Initial' | 'Adjustment'
  status: 'Success' | 'Refunded' | 'Failed'
}

export interface PermissionRecord {
  id: string
  type: string
  duration: string
  reason: string
  admin: string
  date: string
}

export enum AuditEventType {
  ALL = 'All',
  PERMISSION = 'Permission Change',
  IMPERSONATE = 'Impersonation',
  STATUS = 'Status Change',
  LOGIN = 'Login',
  NOTE = 'Note',
  OTHER = 'Other',
}

export interface AuditLogItem {
  id: string
  type: AuditEventType
  title: string
  description: string
  timestamp: string
  meta?: {
    isSessionStart?: boolean
    isSessionEnd?: boolean
    durationLabel?: string | null
    endReason?: string | null
  }
}

export interface ReferralNode {
  id: string
  name: string
  tier: SubscriptionTier
  children?: ReferralNode[]
}
