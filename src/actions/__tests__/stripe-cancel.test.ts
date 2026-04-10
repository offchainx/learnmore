import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { mockStripe } = vi.hoisted(() => ({
  mockStripe: {
    subscriptions: {
      update: vi.fn(),
    },
  },
}))

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    user: {
      update: vi.fn(),
    },
  },
}))

vi.mock('@/lib/stripe', () => ({
  stripe: mockStripe,
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

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}))

import { getCurrentUser } from '@/actions/user/auth'
import { cancelSubscriptionAction } from '../billing/stripe'

describe('cancelSubscriptionAction', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it('should short-circuit when cancellation is already scheduled', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: 'user-1',
      stripeSubscriptionId: 'sub_123',
      cancelAtPeriodEnd: true,
      subscriptionEnd: new Date('2026-05-01T00:00:00.000Z'),
    } as any)

    const result = await cancelSubscriptionAction()

    expect(result).toEqual({
      ok: true,
      code: 'ALREADY_SCHEDULED',
      message: '已设置到期自动取消',
      cancelAt: '2026-05-01T00:00:00.000Z',
    })
    expect(mockStripe.subscriptions.update).not.toHaveBeenCalled()
    expect(mockPrisma.user.update).not.toHaveBeenCalled()
  })

  it('should rollback stripe cancellation when database sync fails', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: 'user-1',
      stripeSubscriptionId: 'sub_123',
      cancelAtPeriodEnd: false,
      subscriptionEnd: null,
    } as any)
    mockStripe.subscriptions.update
      .mockResolvedValueOnce({
        items: {
          data: [
            {
              current_period_end: 1770000000,
            },
          ],
        },
      })
      .mockResolvedValueOnce({})
    mockPrisma.user.update.mockRejectedValueOnce(new Error('db failed'))

    const result = await cancelSubscriptionAction()

    expect(result).toEqual({
      ok: false,
      code: 'CANCEL_SYNC_FAILED',
      message: '取消订阅状态同步失败，请稍后重试',
    })
    expect(mockStripe.subscriptions.update).toHaveBeenNthCalledWith(1, 'sub_123', {
      cancel_at_period_end: true,
    })
    expect(mockStripe.subscriptions.update).toHaveBeenNthCalledWith(2, 'sub_123', {
      cancel_at_period_end: false,
    })
  })
})
