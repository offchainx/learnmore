'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import { getCurrentUser } from '@/actions/user/auth'
import prisma from '@/lib/prisma'
import {
  LEGAL_CONSENT_VERSION,
  ONBOARDING_STEP_DONE,
  ONBOARDING_STEP_PROFILE,
} from '@/lib/auth/onboarding'

const legalConsentSchema = z.object({
  legalConsent: z.enum(['true', 'on']),
})

export type LegalConsentFormState = {
  error?: string
}

export async function acceptLegalConsent(
  _prevState: LegalConsentFormState,
  formData: FormData
): Promise<LegalConsentFormState> {
  const user = await getCurrentUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const rawConsent = formData.get('legalConsent')
  const parsed = legalConsentSchema.safeParse({
    legalConsent:
      rawConsent === 'true' || rawConsent === 'on' ? rawConsent : undefined,
  })

  if (!parsed.success) {
    return { error: '请先同意 Terms of Service 和 Privacy Policy' }
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        legalConsentAcceptedAt: new Date(),
        legalConsentVersion: LEGAL_CONSENT_VERSION,
        onboardingStep: ONBOARDING_STEP_PROFILE,
      },
    })

    revalidatePath('/onboarding/legal')
    revalidatePath('/dashboard')
    redirect('/onboarding/profile')
  } catch (error) {
    console.error('[Onboarding] Failed to accept legal consent:', error)
    return { error: 'Failed to save legal consent' }
  }
}

const onboardingProfileSchema = z.object({
  displayName: z.string().trim().min(2).max(80),
  school: z.string().trim().min(2).max(120),
  grade: z.coerce.number().int().min(7).max(9),
  avatar: z
    .union([z.string().trim().url(), z.literal('')])
    .optional()
    .transform((value) => {
      if (value === undefined || value === '') return undefined
      return value
    }),
})

export type OnboardingProfileFormState = {
  error?: string
}

export async function completeOnboardingProfile(
  _prevState: OnboardingProfileFormState,
  formData: FormData
): Promise<OnboardingProfileFormState> {
  const user = await getCurrentUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const parsed = onboardingProfileSchema.safeParse({
    displayName: formData.get('displayName'),
    school: formData.get('school'),
    grade: formData.get('grade'),
    avatar: formData.get('avatar'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || '请完整填写个人资料' }
  }

  const data = parsed.data

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        displayName: data.displayName,
        school: data.school,
        grade: data.grade,
        ...(data.avatar !== undefined ? { avatar: data.avatar || null } : {}),
        onboardingCompletedAt: new Date(),
        onboardingStep: ONBOARDING_STEP_DONE,
      },
    })

    revalidatePath('/onboarding/profile')
    revalidatePath('/dashboard')
    redirect('/dashboard')
  } catch (error) {
    console.error('[Onboarding] Failed to save profile onboarding:', error)
    return { error: 'Failed to save profile onboarding' }
  }
}
