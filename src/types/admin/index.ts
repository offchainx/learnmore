/**
 * Admin Namespace - User Management Types
 * Story-046: 用户全生命周期管理后台
 *
 * 所有Admin相关类型统一在 Admin namespace 下
 * 使用示例:
 * ```typescript
 * import { Admin } from '@/types'
 * const user: Admin.User = { ... }
 * ```
 */

// Re-export all types from submodules
export * from './user-basic'
export * from './user-security'
export * from './user-subscription'
export * from './user-audit'
export * from './user-detail'
export * from './common'

// Create namespace wrapper for organized imports
import * as UserBasic from './user-basic'
import * as UserSecurity from './user-security'
import * as UserSubscription from './user-subscription'
import * as UserAudit from './user-audit'
import * as UserDetail from './user-detail'
import * as Common from './common'

export namespace Admin {
  // ============ User Basic ============
  export import UserStatus = UserBasic.UserStatus
  export import SubscriptionTier = UserBasic.SubscriptionTier
  export type UserSummary = UserBasic.UserSummary
  export type User = UserBasic.User
  export type UserFilterState = UserBasic.UserFilterState

  // ============ User Security ============
  export import SecurityAction = UserSecurity.SecurityAction
  export type AdminNote = UserSecurity.AdminNote
  export type SecurityLogEntry = UserSecurity.SecurityLogEntry
  export type ImpersonationSessionInfo = UserSecurity.ImpersonationSessionInfo
  export type HighRiskAction = UserSecurity.HighRiskAction

  // ============ User Subscription ============
  export type PaymentRecord = UserSubscription.PaymentRecord
  export type PermissionRecord = UserSubscription.PermissionRecord

  // ============ User Audit ============
  export import AuditEventType = UserAudit.AuditEventType
  export type AuditLogItem = UserAudit.AuditLogItem
  export type ReferralNode = UserAudit.ReferralNode

  // ============ User Detail ============
  export type UserDetail = UserDetail.UserDetail

  // ============ Common ============
  export type SortConfig = Common.SortConfig
  export type PaginationParams = Common.PaginationParams
  export type PaginatedResponse<T> = Common.PaginatedResponse<T>
  export type ActionResult<T = void> = Common.ActionResult<T>
}
