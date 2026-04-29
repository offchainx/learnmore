import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockFindFirst, mockCreateInAppNotification } = vi.hoisted(() => ({
  mockFindFirst: vi.fn(),
  mockCreateInAppNotification: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  default: {
    notification: {
      findFirst: mockFindFirst,
    },
    notificationPreference: {
      findUnique: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}))

vi.mock('../notification/core', () => ({
  createInAppNotification: mockCreateInAppNotification,
}))

vi.mock('@/lib/email/resend', () => ({
  sendEmail: vi.fn(),
}))

vi.mock('@/lib/server/run-after-task', () => ({
  runAfterTask: vi.fn((task: () => Promise<void>) => task()),
}))

vi.mock('@/lib/email/templates/WelcomeEmail', () => ({
  default: () => null,
}))

vi.mock('@/lib/email/templates/ReceiptEmail', () => ({
  default: () => null,
}))

vi.mock('@/lib/email/templates/TrialExpiryEmail', () => ({
  default: () => null,
}))

import { triggerOnboardingReminderNotification } from '../notification/triggers'

describe('onboarding reminder notification', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFindFirst.mockResolvedValue(null)
    mockCreateInAppNotification.mockResolvedValue({ success: true })
  })

  it('creates a legal reminder notification when none exists today', async () => {
    const result = await triggerOnboardingReminderNotification(
      'user-1',
      '/onboarding/legal'
    )

    expect(result).toEqual({ success: true })
    expect(mockFindFirst).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        type: 'SYSTEM',
        title: '先完成使用条款确认',
        link: '/onboarding/legal',
        createdAt: { gte: expect.any(Date) },
      },
    })
    expect(mockCreateInAppNotification).toHaveBeenCalledWith({
      userId: 'user-1',
      type: 'SYSTEM',
      title: '先完成使用条款确认',
      content: '确认条款后，我们会继续为你配置学习内容推荐。',
      link: '/onboarding/legal',
      metadata: {
        reminderKey: 'onboarding:legal',
        targetRoute: '/onboarding/legal',
      },
    })
  })

  it('skips duplicate reminders on the same day', async () => {
    mockFindFirst.mockResolvedValueOnce({
      id: 'notif-1',
    })

    const result = await triggerOnboardingReminderNotification(
      'user-1',
      '/onboarding/profile'
    )

    expect(result).toEqual({ success: true, skipped: true })
    expect(mockCreateInAppNotification).not.toHaveBeenCalled()
  })
})
