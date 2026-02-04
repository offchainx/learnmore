import { SubscriptionTier } from '@prisma/client';

export type TierKey = SubscriptionTier;

export const FEATURE_KEYS = [
  'basic_quiz',
  'error_book',
  'smart_drill',
  'mock_exam',
  'analytics_basic',
  'analytics_advanced',
  'ai_tutor',
  'download_resources',
] as const;

export type FeatureKey = (typeof FEATURE_KEYS)[number];

export interface PermissionCheckResult {
  granted: boolean;
  reason?: 'tier_limit' | 'expired' | 'manual_lock';
  requiredTier?: TierKey;
}

export type PermissionMatrix = Record<TierKey, FeatureKey[]>;
