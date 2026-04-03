/**
 * Admin User Management - Audit Types
 * 审计日志和推荐树相关类型
 */

import { SubscriptionTier } from './user-basic'

export enum AuditEventType {
  ALL = 'All',
  PERMISSION = 'Permission Change',
  IMPERSONATE = 'Impersonation',
  STATUS = 'Status Change',
  LOGIN = 'Login',
  PASSWORD_RESET = 'Password Reset',
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
    operator?: string | null
    target?: string | null
    reason?: string | null
    changes?: string[]
    sensitive?: boolean
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
