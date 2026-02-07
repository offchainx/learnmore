/**
 * Permissions Module Barrel Export
 *
 * This module provides a unified permission system based on SubscriptionTier.
 *
 * Usage:
 * ```typescript
 * import { getEffectiveTier, checkPermission } from '@/lib/permissions'
 *
 * const tier = getEffectiveTier(user)
 * const result = checkPermission(user, 'ai_tutor')
 * ```
 */

// Core permission checking logic (NEW API - Tier-based)
export { getEffectiveTier, checkPermission, type UserWithOverrides } from './engine'

// Type definitions
export { type FeatureKey, type TierKey, type PermissionCheckResult, type PermissionMatrix, FEATURE_KEYS } from './types'

// Configuration
export { TIER_CONFIG, DEFAULT_TIER } from './config'

// Prisma query helpers
export { getRetentionDate } from './prisma-scope'

// ========================================
// LEGACY API (DEPRECATED - Role-based)
// ========================================
// Re-exported from legacy permissions.ts for backward compatibility
// TODO: Migrate all usage to new Tier-based API above
// These functions will be removed in a future version

import { UserRole } from '@prisma/client'

export type Permission =
  | 'access:basic_content'
  | 'access:hd_video'
  | 'access:full_question_bank'
  | 'access:knowledge_graph'
  | 'access:olympiad_questions'
  | 'access:parent_app'
  | 'limit:ai_chats_5'
  | 'limit:ai_chats_20'
  | 'limit:ai_chats_100'
  | 'limit:ai_chats_unlimited';

const ROLE_PERMISSIONS: Partial<Record<UserRole, Permission[]>> = {
  [UserRole.STUDENT]: [
    'access:basic_content',
    'limit:ai_chats_5',
  ],
  [UserRole.TEACHER]: [
    'access:basic_content',
    'access:hd_video',
    'access:full_question_bank',
    'access:knowledge_graph',
    'access:olympiad_questions',
    'limit:ai_chats_unlimited',
  ],
  [UserRole.ADMIN]: [
    'access:basic_content',
    'access:hd_video',
    'access:full_question_bank',
    'access:knowledge_graph',
    'access:olympiad_questions',
    'access:parent_app',
    'limit:ai_chats_unlimited',
  ],
  [UserRole.PARENT]: [
    'access:parent_app',
  ]
};

/**
 * @deprecated Use checkPermission() with SubscriptionTier instead
 * Legacy role-based permission check
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions ? permissions.includes(permission) : false;
}

/**
 * @deprecated Use getEffectiveTier() and checkPermission() instead
 * Legacy role-based feature access check
 */
export function canAccessFeature(role: UserRole, featureLevel: 'free' | 'pro' | 'ultimate'): boolean {
    if (featureLevel === 'free') return true;
    if (featureLevel === 'pro') return role === UserRole.TEACHER || role === UserRole.ADMIN;
    if (featureLevel === 'ultimate') return role === UserRole.ADMIN;
    return false;
}
