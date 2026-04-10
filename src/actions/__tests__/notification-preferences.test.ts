import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    notificationPreference: {
      findUnique: vi.fn(),
      create: vi.fn(),
      upsert: vi.fn(),
    },
    userSettings: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

vi.mock('@/lib/prisma', () => ({
  default: mockPrisma,
}))

vi.mock('@/actions/user/auth', () => ({
  getCurrentUser: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

import { getCurrentUser } from '@/actions/user/auth'
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from '../notification/preferences'

describe('updateNotificationPreferences', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPrisma.$transaction.mockImplementation(async (callback: any) =>
      callback(mockPrisma)
    )
  })

  it('should reject invalid payload keys', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: 'user-1',
    } as any)

    const result = await updateNotificationPreferences({
      unexpected: true,
    } as any)

    expect(result).toEqual({
      success: false,
      error: 'Invalid notification preferences payload',
    })
    expect(mockPrisma.notificationPreference.upsert).not.toHaveBeenCalled()
  })

  it('should sync primary table and legacy bridge fields in one transaction', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: 'user-1',
    } as any)
    mockPrisma.notificationPreference.upsert.mockResolvedValue({
      userId: 'user-1',
      inAppStudy: false,
      emailWeekly: false,
      emailMarketing: true,
      emailSocial: false,
      emailBilling: true,
    })

    const result = await updateNotificationPreferences({
      inAppStudy: false,
      emailWeekly: false,
      emailMarketing: true,
      emailSocial: false,
    })

    expect(result.success).toBe(true)
    expect(mockPrisma.notificationPreference.upsert).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      update: {
        inAppStudy: false,
        emailWeekly: false,
        emailMarketing: true,
        emailSocial: false,
      },
      create: expect.objectContaining({
        userId: 'user-1',
        inAppStudy: false,
        emailWeekly: false,
        emailMarketing: true,
        emailSocial: false,
        emailBilling: true,
      }),
    })
    expect(mockPrisma.userSettings.upsert).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      create: {
        userId: 'user-1',
        notificationDaily: false,
        notificationWeekly: false,
        emailMarketing: true,
        emailActivity: false,
      },
      update: {
        notificationDaily: false,
        notificationWeekly: false,
        emailMarketing: true,
        emailActivity: false,
      },
    })
  })
})

describe('getNotificationPreferences', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should migrate emailActivity into emailSocial when preferences are missing', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: 'user-1',
    } as any)
    mockPrisma.notificationPreference.findUnique.mockResolvedValue(null)
    mockPrisma.userSettings.findUnique.mockResolvedValue({
      notificationDaily: false,
      notificationWeekly: true,
      emailMarketing: false,
      emailActivity: false,
    })
    mockPrisma.notificationPreference.create.mockResolvedValue({
      userId: 'user-1',
      inAppStudy: false,
      emailWeekly: true,
      emailMarketing: false,
      emailSocial: false,
      emailBilling: true,
    })

    const result = await getNotificationPreferences()

    expect(result.success).toBe(true)
    expect(mockPrisma.notificationPreference.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user-1',
        inAppStudy: false,
        emailWeekly: true,
        emailMarketing: false,
        emailSocial: false,
        emailBilling: true,
      }),
    })
  })
})
