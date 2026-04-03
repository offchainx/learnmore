import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SubscriptionTier, UserRole } from '@prisma/client'
import { applyAdminOverride } from '../permission-override'

const { mockInvalidateAdminDashboardOverview, mockRevalidatePath, mockResolveRequestAdminIdentity, mockTx, mockPrisma } =
  vi.hoisted(() => ({
    mockInvalidateAdminDashboardOverview: vi.fn(),
    mockRevalidatePath: vi.fn(),
    mockResolveRequestAdminIdentity: vi.fn(),
    mockTx: {
      userPermissionOverride: {
        create: vi.fn(),
      },
      user: {
        update: vi.fn(),
      },
      securityLog: {
        create: vi.fn(),
      },
    },
    mockPrisma: {
      user: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
      },
      userPermissionOverride: {
        create: vi.fn(),
        findMany: vi.fn(),
      },
      securityLog: {
        create: vi.fn(),
      },
      $transaction: vi.fn(),
    },
  }))

vi.mock('@/lib/prisma', () => ({
  default: mockPrisma,
}))

vi.mock('@/lib/auth/request-user', () => ({
  resolveRequestAdminIdentity: mockResolveRequestAdminIdentity,
}))

vi.mock('@/lib/cache/sitewide', () => ({
  invalidateAdminDashboardOverview: mockInvalidateAdminDashboardOverview,
}))

vi.mock('next/cache', () => ({
  revalidatePath: mockRevalidatePath,
}))

describe('applyAdminOverride', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-03T00:00:00.000Z'))

    mockPrisma.$transaction.mockImplementation(async (callback: any) =>
      callback(mockTx)
    )
    mockResolveRequestAdminIdentity.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@example.com',
      username: 'Admin',
      role: UserRole.ADMIN,
    })
  })

  it('同状态重复提交时直接短路，不重复落库', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      username: 'user',
      subscriptionTier: SubscriptionTier.PREMIER,
      subscriptionEnd: new Date('2026-05-03T00:00:00.000Z'),
    })

    const result = await applyAdminOverride({
      userId: 'user-1',
      tier: SubscriptionTier.PREMIER,
      duration: '30_days',
      reason: '重复提交验证需要足够长的理由',
    })

    expect(result).toEqual({ success: true })
    expect(mockPrisma.$transaction).not.toHaveBeenCalled()
    expect(mockInvalidateAdminDashboardOverview).toHaveBeenCalledTimes(1)
    expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/users/user-1')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/users')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/admin')
  })

  it('写入时会同时落前后值、用户订阅态与审计日志', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      username: 'user',
      subscriptionTier: SubscriptionTier.STANDARD,
      subscriptionEnd: null,
    })

    const result = await applyAdminOverride({
      userId: 'user-1',
      tier: SubscriptionTier.PREMIER,
      duration: '30_days',
      reason: '权限校验回归验证通过',
    })

    expect(result).toEqual({ success: true })
    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1)
    expect(mockTx.userPermissionOverride.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        overriddenBy: 'admin-1',
        targetField: 'subscriptionTier',
        previousValue: SubscriptionTier.STANDARD,
        newValue: SubscriptionTier.PREMIER,
        reason: '权限校验回归验证通过',
        expiresAt: new Date('2026-05-03T00:00:00.000Z'),
      },
    })
    expect(mockTx.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: {
        subscriptionTier: SubscriptionTier.PREMIER,
        subscriptionEnd: new Date('2026-05-03T00:00:00.000Z'),
      },
    })
    expect(mockTx.securityLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'user-1',
          action: 'PERMISSION_OVERRIDE',
        }),
      })
    )
    expect(mockInvalidateAdminDashboardOverview).toHaveBeenCalledTimes(1)
    expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/users/user-1')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/users')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/admin')
  })

  it('未登录时会直接拒绝', async () => {
    mockResolveRequestAdminIdentity.mockResolvedValueOnce(null)

    await expect(
      applyAdminOverride({
        userId: 'user-1',
        tier: SubscriptionTier.PREMIER,
        duration: '30_days',
        reason: '越权验证需要足够长的理由',
      })
    ).rejects.toThrow('Unauthorized: Only admins can perform this action')

    expect(mockPrisma.$transaction).not.toHaveBeenCalled()
  })
})
