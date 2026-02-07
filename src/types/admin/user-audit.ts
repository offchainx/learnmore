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
