import { describe, it, expect } from 'vitest';
import { getEffectiveTier, checkPermission, UserWithOverrides } from '../engine';
import { SubscriptionTier } from '@prisma/client';

describe('Permissions Engine', () => {
  const now = new Date('2024-01-01T12:00:00Z');
  const yesterday = new Date('2023-12-31T12:00:00Z');
  const tomorrow = new Date('2024-01-02T12:00:00Z');

  const baseUser: UserWithOverrides = {
    subscriptionTier: 'STARTER',
    subscriptionEnd: null,
    permissionOverrides: []
  };

  describe('getEffectiveTier', () => {
    it('returns STARTER for basic user', () => {
      expect(getEffectiveTier(baseUser, now)).toBe('STARTER');
    });

    it('returns stored tier if active (no end date)', () => {
      const user: UserWithOverrides = { ...baseUser, subscriptionTier: 'PREMIER' };
      expect(getEffectiveTier(user, now)).toBe('PREMIER');
    });

    it('returns stored tier if active (future end date)', () => {
      const user: UserWithOverrides = { 
        ...baseUser, 
        subscriptionTier: 'STANDARD',
        subscriptionEnd: tomorrow 
      };
      expect(getEffectiveTier(user, now)).toBe('STANDARD');
    });

    it('downgrades to STARTER if expired', () => {
      const user: UserWithOverrides = { 
        ...baseUser, 
        subscriptionTier: 'SMART_PLUS',
        subscriptionEnd: yesterday 
      };
      expect(getEffectiveTier(user, now)).toBe('STARTER');
    });

    it('respects Admin Override for Tier', () => {
      const user: UserWithOverrides = { 
        ...baseUser, 
        subscriptionTier: 'STARTER',
        permissionOverrides: [
          { targetField: 'subscriptionTier', newValue: 'PREMIER', expiresAt: tomorrow }
        ]
      };
      expect(getEffectiveTier(user, now)).toBe('PREMIER');
    });

    it('ignores expired Admin Override', () => {
      const user: UserWithOverrides = { 
        ...baseUser, 
        subscriptionTier: 'STARTER',
        permissionOverrides: [
          { targetField: 'subscriptionTier', newValue: 'PREMIER', expiresAt: yesterday }
        ]
      };
      expect(getEffectiveTier(user, now)).toBe('STARTER');
    });

    it('respects Admin Override for Subscription End (Extending)', () => {
      // Original subscription expired, but override extends it
      const user: UserWithOverrides = { 
        ...baseUser, 
        subscriptionTier: 'STANDARD',
        subscriptionEnd: yesterday,
        permissionOverrides: [
          { targetField: 'subscriptionEnd', newValue: tomorrow.toISOString(), expiresAt: tomorrow }
        ]
      };
      expect(getEffectiveTier(user, now)).toBe('STANDARD');
    });
  });

  describe('checkPermission', () => {
    it('grants basic features to STARTER', () => {
      const result = checkPermission(baseUser, 'basic_quiz', now);
      expect(result.granted).toBe(true);
      expect(result.requiredTier).toBe('STARTER');
    });

    it('denies advanced features to STARTER', () => {
      const result = checkPermission(baseUser, 'mock_exam', now);
      expect(result.granted).toBe(false);
      expect(result.reason).toBe('tier_limit');
    });

    it('grants all features to PREMIER', () => {
      const user: UserWithOverrides = { ...baseUser, subscriptionTier: 'PREMIER' };
      const result = checkPermission(user, 'mock_exam', now);
      expect(result.granted).toBe(true);
    });
    
    it('denies features if expired', () => {
       const user: UserWithOverrides = { 
        ...baseUser, 
        subscriptionTier: 'PREMIER',
        subscriptionEnd: yesterday
      };
      const result = checkPermission(user, 'mock_exam', now);
      expect(result.granted).toBe(false);
    });
  });
});
