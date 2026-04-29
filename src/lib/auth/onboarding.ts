export const LEGAL_CONSENT_VERSION = '2026-04-28'
export const ONBOARDING_STEP_LEGAL = 'legal'
export const ONBOARDING_STEP_PROFILE = 'profile'
export const ONBOARDING_STEP_DONE = 'done'

export type OnboardingRedirectTarget =
  | '/onboarding/legal'
  | '/onboarding/profile'
  | '/dashboard'

export type OnboardingStep =
  | typeof ONBOARDING_STEP_LEGAL
  | typeof ONBOARDING_STEP_PROFILE
  | typeof ONBOARDING_STEP_DONE

export type OnboardingUserState = {
  legalConsentAcceptedAt: Date | string | null
  displayName: string | null
  school: string | null
  grade: number | null
  onboardingCompletedAt: Date | string | null
  onboardingStep: string | null
}

export type OnboardingStatus = {
  route: OnboardingRedirectTarget
  step: OnboardingStep
  legalAccepted: boolean
  profileComplete: boolean
  markedComplete: boolean
  needsCompletionBackfill: boolean
}

function hasNonEmptyValue(value: string | null | undefined) {
  return typeof value === 'string' && value.trim().length > 0
}

function hasTimestamp(value: Date | string | null | undefined) {
  if (value == null) return false
  if (value instanceof Date) return !Number.isNaN(value.getTime())
  return value.trim().length > 0
}

function hasValidGrade(grade: number | null | undefined) {
  return typeof grade === 'number' && Number.isFinite(grade)
}

export function isOnboardingProfileComplete(user: OnboardingUserState) {
  return (
    hasNonEmptyValue(user.displayName) &&
    hasNonEmptyValue(user.school) &&
    hasValidGrade(user.grade)
  )
}

export function getOnboardingStatus(
  user: OnboardingUserState
): OnboardingStatus {
  const legalAccepted = hasTimestamp(user.legalConsentAcceptedAt)
  const profileComplete = isOnboardingProfileComplete(user)
  const markedComplete =
    hasTimestamp(user.onboardingCompletedAt) ||
    user.onboardingStep === ONBOARDING_STEP_DONE
  const needsCompletionBackfill =
    legalAccepted && profileComplete && !markedComplete

  if (!legalAccepted) {
    return {
      route: '/onboarding/legal',
      step: ONBOARDING_STEP_LEGAL,
      legalAccepted,
      profileComplete,
      markedComplete,
      needsCompletionBackfill,
    }
  }

  if (!profileComplete) {
    return {
      route: '/onboarding/profile',
      step: ONBOARDING_STEP_PROFILE,
      legalAccepted,
      profileComplete,
      markedComplete,
      needsCompletionBackfill,
    }
  }

  return {
    route: '/dashboard',
    step: ONBOARDING_STEP_DONE,
    legalAccepted,
    profileComplete,
    markedComplete,
    needsCompletionBackfill,
  }
}

export function resolveOnboardingRedirect(
  user: OnboardingUserState
): OnboardingRedirectTarget {
  return getOnboardingStatus(user).route
}
