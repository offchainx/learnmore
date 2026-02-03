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
