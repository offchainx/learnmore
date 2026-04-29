import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockGetCurrentUser, mockPrisma, mockRedirect, mockRevalidatePath } =
  vi.hoisted(() => ({
    mockGetCurrentUser: vi.fn(),
    mockPrisma: {
      user: {
        update: vi.fn(),
      },
    },
    mockRedirect: vi.fn(),
    mockRevalidatePath: vi.fn(),
  }))

vi.mock('@/actions/user/auth', () => ({
  getCurrentUser: mockGetCurrentUser,
}))

vi.mock('@/lib/prisma', () => ({
  default: mockPrisma,
}))

vi.mock('next/navigation', () => ({
  redirect: mockRedirect,
}))

vi.mock('next/cache', () => ({
  revalidatePath: mockRevalidatePath,
}))

import {
  acceptLegalConsent,
  completeOnboardingProfile,
} from '../user/onboarding'

describe('legal consent action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetCurrentUser.mockResolvedValue({
      id: 'user-1',
      legalConsentAcceptedAt: null,
      displayName: null,
      school: null,
      grade: null,
      onboardingCompletedAt: null,
      onboardingStep: null,
    })
    mockPrisma.user.update.mockResolvedValue({
      id: 'user-1',
    })
  })

  it('returns an error when the user is not authenticated', async () => {
    mockGetCurrentUser.mockResolvedValueOnce(null)

    const result = await acceptLegalConsent({}, new FormData())

    expect(result).toEqual({ error: 'Not authenticated' })
    expect(mockPrisma.user.update).not.toHaveBeenCalled()
  })

  it('returns an error when the consent checkbox is missing', async () => {
    const result = await acceptLegalConsent({}, new FormData())

    expect(result).toEqual({
      error: '请先同意 Terms of Service 和 Privacy Policy',
    })
    expect(mockPrisma.user.update).not.toHaveBeenCalled()
  })

  it('persists legal consent and redirects to profile onboarding', async () => {
    const formData = new FormData()
    formData.set('legalConsent', 'true')

    const result = await acceptLegalConsent({}, formData)

    expect(result).toBeUndefined()
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: {
        legalConsentAcceptedAt: expect.any(Date),
        legalConsentVersion: '2026-04-28',
        onboardingStep: 'profile',
      },
    })
    expect(mockRevalidatePath).toHaveBeenCalledWith('/onboarding/legal')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard')
    expect(mockRedirect).toHaveBeenCalledWith('/onboarding/profile')
  })

  it('returns an error when the profile action is missing auth', async () => {
    mockGetCurrentUser.mockResolvedValueOnce(null)

    const formData = new FormData()
    formData.set('displayName', 'Maya')
    formData.set('school', 'SMK Seri Bintang Utara')
    formData.set('grade', '8')

    const result = await completeOnboardingProfile({}, formData)

    expect(result).toEqual({ error: 'Not authenticated' })
    expect(mockPrisma.user.update).not.toHaveBeenCalled()
  })

  it('persists profile onboarding and redirects to dashboard', async () => {
    const formData = new FormData()
    formData.set('displayName', 'Maya Tan')
    formData.set('school', 'SMK Seri Bintang Utara')
    formData.set('grade', '8')
    formData.set('avatar', 'https://example.com/avatar.png')

    const result = await completeOnboardingProfile({}, formData)

    expect(result).toBeUndefined()
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: {
        displayName: 'Maya Tan',
        school: 'SMK Seri Bintang Utara',
        grade: 8,
        avatar: 'https://example.com/avatar.png',
        onboardingCompletedAt: expect.any(Date),
        onboardingStep: 'done',
      },
    })
    expect(mockRevalidatePath).toHaveBeenCalledWith('/onboarding/profile')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard')
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard')
  })
})
