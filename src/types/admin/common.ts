/**
 * Admin User Management - Common Types
 * 通用工具类型（分页、排序、响应）
 */

import { UserSummary } from './user-basic'

// 排序配置
export interface SortConfig {
  key: keyof UserSummary
  direction: 'asc' | 'desc'
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

export type UserOverviewWindow = '7D' | '30D' | 'ALL'

export interface UserOverviewMetric {
  id: string
  title: string
  value: string
  caption: string
  meta: string
  trend: number | null
  trendLabel: string
}

export interface UserOverview {
  window: UserOverviewWindow
  metrics: UserOverviewMetric[]
  lastUpdated: string
}

// Server Action 响应
export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}
