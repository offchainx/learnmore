/**
 * Admin User Management - Basic Types
 * 用户基础信息相关类型
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
  role: string
  status: UserStatus
  tier: SubscriptionTier
  subscriptionEnd: string | null
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

// 筛选状态
export interface UserFilterState {
  search: string
  status: UserStatus | 'All'
  tier: SubscriptionTier | 'All'
}
