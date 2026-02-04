import { SubscriptionTier, UserPermissionOverride } from '@prisma/client';
import { FeatureKey, PermissionCheckResult, TierKey } from './types';
import { TIER_CONFIG, DEFAULT_TIER } from './config';

export type UserWithOverrides = {
  subscriptionTier: SubscriptionTier | null;
  subscriptionEnd: Date | null;
  permissionOverrides?: Pick<UserPermissionOverride, 'targetField' | 'newValue' | 'expiresAt'>[];
};

export function getEffectiveTier(user: UserWithOverrides, now: Date = new Date()): TierKey {
  // 1. Process Overrides
  const activeOverrides = user.permissionOverrides?.filter(o => 
    !o.expiresAt || o.expiresAt > now
  ) || [];

  const tierOverride = activeOverrides.find(o => o.targetField === 'subscriptionTier');
  const endOverride = activeOverrides.find(o => o.targetField === 'subscriptionEnd');

  // If there is an explicit tier override, it takes precedence (assuming admin knows what they are doing)
  // However, usually overrides are "grant this tier for X time".
  // If the override has its own expiration (expiresAt), that's handled by the filter above.
  if (tierOverride && tierOverride.newValue) {
    // Validate that newValue is a valid TierKey
    if (Object.keys(TIER_CONFIG).includes(tierOverride.newValue)) {
      return tierOverride.newValue as TierKey;
    }
  }

  // 2. Determine Effective End Date
  let effectiveEnd = user.subscriptionEnd;
  if (endOverride && endOverride.newValue) {
    const parsedDate = new Date(endOverride.newValue);
    if (!isNaN(parsedDate.getTime())) {
      effectiveEnd = parsedDate;
    }
  }

  // 3. Check Expiration
  // If subscriptionEnd is null, it usually means lifetime or indefinite (or manual management), 
  // UNLESS subscriptionTier is null/STARTER.
  // But strictly, if end date is present and passed, we downgrade.
  if (effectiveEnd && effectiveEnd < now) {
    return DEFAULT_TIER;
  }

  // 4. Return User Tier or Default
  return user.subscriptionTier || DEFAULT_TIER;
}

export function checkPermission(
  user: UserWithOverrides, 
  feature: FeatureKey,
  now: Date = new Date()
): PermissionCheckResult {
  const effectiveTier = getEffectiveTier(user, now);
  const allowedFeatures = TIER_CONFIG[effectiveTier];

  if (allowedFeatures.includes(feature)) {
    return {
      granted: true,
      requiredTier: effectiveTier
    };
  }

  // Find which tier is required (minimum tier that has this feature)
  // This is a bit simplistic as multiple tiers might have it, we usually want the cheapest one.
  // But for now, we just deny.
  
  return {
    granted: false,
    reason: 'tier_limit',
    requiredTier: findRequiredTier(feature)
  };
}

function findRequiredTier(feature: FeatureKey): TierKey | undefined {
  // Simple search: find first tier in order STARTER -> PREMIER that has it.
  // Since our config is explicit, we can just check each.
  // Order: STARTER, STANDARD, SMART_PLUS, PREMIER
  const order: TierKey[] = ['STARTER', 'STANDARD', 'SMART_PLUS', 'PREMIER'];
  for (const tier of order) {
    if (TIER_CONFIG[tier].includes(feature)) {
      return tier;
    }
  }
  return undefined;
}
