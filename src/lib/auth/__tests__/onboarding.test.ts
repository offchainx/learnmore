import { describe, expect, it } from 'vitest'

import {
  LEGAL_CONSENT_VERSION,
  ONBOARDING_STEP_DONE,
  ONBOARDING_STEP_LEGAL,
  ONBOARDING_STEP_PROFILE,
  getOnboardingStatus,
  isOnboardingProfileComplete,
  resolveOnboardingRedirect,
} from '../onboarding'

const baseUser = {
  legalConsentAcceptedAt: null,
  displayName: null,
  school: null,
  grade: null,
  onboardingCompletedAt: null,
  onboardingStep: null,
}

describe('auth onboarding state', () => {
  it('exposes the frozen consent version', () => {
    expect(LEGAL_CONSENT_VERSION).toBe('2026-04-28')
  })

  it('routes new users to legal consent first', () => {
    const status = getOnboardingStatus(baseUser)

    expect(status.route).toBe('/onboarding/legal')
    expect(status.step).toBe(ONBOARDING_STEP_LEGAL)
    expect(resolveOnboardingRedirect(baseUser)).toBe('/onboarding/legal')
  })

  it('routes users with legal consent but incomplete profile to profile onboarding', () => {
    const status = getOnboardingStatus({
      ...baseUser,
      legalConsentAcceptedAt: new Date('2026-04-28T00:00:00.000Z'),
    })

    expect(status.route).toBe('/onboarding/profile')
    expect(status.step).toBe(ONBOARDING_STEP_PROFILE)
  })

  it('treats trimmed profile fields as valid and routes to dashboard', () => {
    const user = {
      ...baseUser,
      legalConsentAcceptedAt: new Date('2026-04-28T00:00:00.000Z'),
      displayName: '  Mei  ',
      school: '  St. John  ',
      grade: 8,
      onboardingCompletedAt: null,
      onboardingStep: 'profile',
    }

    expect(isOnboardingProfileComplete(user)).toBe(true)
    expect(getOnboardingStatus(user).route).toBe('/dashboard')
  })

  it('keeps completed users on dashboard even when the audit step is already done', () => {
    const status = getOnboardingStatus({
      ...baseUser,
      legalConsentAcceptedAt: new Date('2026-04-28T00:00:00.000Z'),
      displayName: 'Mei',
      school: 'St. John',
      grade: 8,
      onboardingCompletedAt: new Date('2026-04-28T10:00:00.000Z'),
      onboardingStep: ONBOARDING_STEP_DONE,
    })

    expect(status.route).toBe('/dashboard')
    expect(status.step).toBe(ONBOARDING_STEP_DONE)
    expect(status.markedComplete).toBe(true)
    expect(status.needsCompletionBackfill).toBe(false)
  })
})
