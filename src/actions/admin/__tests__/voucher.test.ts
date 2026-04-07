import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UserRole } from '@prisma/client'

const {
  mockRevalidatePath,
  mockResolveRequestAdminIdentity,
  mockVoucherCodeCreate,
  mockVoucherCodeFindUnique,
  mockVoucherCodeUpdate,
} = vi.hoisted(() => ({
  mockRevalidatePath: vi.fn(),
  mockResolveRequestAdminIdentity: vi.fn(),
  mockVoucherCodeCreate: vi.fn(),
  mockVoucherCodeFindUnique: vi.fn(),
  mockVoucherCodeUpdate: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: mockRevalidatePath,
}))

vi.mock('@/lib/auth/request-user', () => ({
  resolveRequestAdminIdentity: mockResolveRequestAdminIdentity,
}))

vi.mock('@/lib/prisma', () => ({
  default: {
    voucherCode: {
      create: mockVoucherCodeCreate,
      findUnique: mockVoucherCodeFindUnique,
      update: mockVoucherCodeUpdate,
    },
  },
}))

import {
  createVoucherCodeAction,
  toggleVoucherStatusAction,
} from '../voucher'

describe('voucher admin actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveRequestAdminIdentity.mockResolvedValue({
      id: 'admin-test-1',
      email: 'admin@example.com',
      username: 'Admin',
      role: UserRole.ADMIN,
    })
  })

  it('管理员可以创建、停用、启用 voucher，并触发真实的写后刷新', async () => {
    mockVoucherCodeCreate.mockResolvedValue({
      id: 'voucher-1',
    })
    mockVoucherCodeFindUnique.mockResolvedValue({
      id: 'voucher-1',
      isActive: true,
    })
    mockVoucherCodeUpdate.mockResolvedValue({
      id: 'voucher-1',
      isActive: false,
    })

    const createResult = await createVoucherCodeAction({
      code: 'T012B9_TEST_CREATE',
      discountType: 'AMOUNT',
      discountValue: 10,
      maxRedemptions: 2,
      validFrom: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      validTo: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      stripeCouponId: 'cpn_t012b9_test_create',
    })

    expect(createResult).toEqual({
      ok: true,
      code: 'CREATED',
      message: '优惠券已创建',
    })
    expect(mockVoucherCodeCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        code: 'T012B9_TEST_CREATE',
        discountType: 'AMOUNT',
        discountValue: 10,
        maxRedemptions: 2,
        isActive: true,
        stripeCouponId: 'cpn_t012b9_test_create',
      }),
    })
    expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/referrals')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/pricing')

    const disableResult = await toggleVoucherStatusAction('voucher-1', false)
    expect(disableResult).toEqual({
      ok: true,
      code: 'UPDATED',
      message: '优惠券已停用',
    })
    expect(mockVoucherCodeUpdate).toHaveBeenCalledWith({
      where: { id: 'voucher-1' },
      data: { isActive: false },
    })

    mockVoucherCodeUpdate.mockClear()
    mockVoucherCodeFindUnique.mockResolvedValue({
      id: 'voucher-1',
      isActive: false,
    })
    const enableResult = await toggleVoucherStatusAction('voucher-1', true)
    expect(enableResult).toEqual({
      ok: true,
      code: 'UPDATED',
      message: '优惠券已启用',
    })
    expect(mockVoucherCodeUpdate).toHaveBeenCalledWith({
      where: { id: 'voucher-1' },
      data: { isActive: true },
    })
  })

  it('创建重复 voucher code 会返回明确的 duplicate 错误', async () => {
    const duplicateError = Object.assign(new Error('Unique constraint failed on the fields: (`code`)'), {
      code: 'P2002',
    })
    mockVoucherCodeCreate.mockRejectedValueOnce(duplicateError)

    const result = await createVoucherCodeAction({
      code: 'T012B9_DUPLICATE',
      discountType: 'AMOUNT',
      discountValue: 10,
      maxRedemptions: 1,
      validFrom: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      validTo: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      stripeCouponId: 'cpn_t012b9_duplicate',
    })

    expect(result).toEqual({
      ok: false,
      code: 'DUPLICATE_CODE',
      message: '优惠券码已存在',
    })
  })

  it('非管理员不能创建或切换 voucher', async () => {
    mockResolveRequestAdminIdentity.mockImplementation(() => Promise.resolve(null))

    const createResult = await createVoucherCodeAction({
      code: 'T012B9_TEST_DENY',
      discountType: 'AMOUNT',
      discountValue: 10,
      maxRedemptions: 1,
      validFrom: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      validTo: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      stripeCouponId: 'cpn_t012b9_test_deny',
    })

    expect(createResult).toEqual({
      ok: false,
      code: 'UNAUTHORIZED',
      message: '仅管理员可操作优惠券',
    })
    expect(mockVoucherCodeCreate).not.toHaveBeenCalled()
    expect(mockRevalidatePath).not.toHaveBeenCalled()

    const toggleResult = await toggleVoucherStatusAction('voucher-1', false)
    expect(toggleResult).toEqual({
      ok: false,
      code: 'UNAUTHORIZED',
      message: '仅管理员可操作优惠券',
    })
    expect(mockVoucherCodeUpdate).not.toHaveBeenCalled()
  })

  it('切换不存在的 voucher 会返回明确的 not found 错误', async () => {
    mockVoucherCodeFindUnique.mockResolvedValue(null)

    const result = await toggleVoucherStatusAction('missing-voucher', true)

    expect(result).toEqual({
      ok: false,
      code: 'VOUCHER_NOT_FOUND',
      message: '优惠券不存在',
    })
    expect(mockVoucherCodeUpdate).not.toHaveBeenCalled()
  })

  it('切换到相同状态时会短路，不重复写库', async () => {
    mockVoucherCodeFindUnique.mockResolvedValue({
      id: 'voucher-1',
      isActive: true,
    })

    const result = await toggleVoucherStatusAction('voucher-1', true)

    expect(result).toEqual({
      ok: true,
      code: 'UNCHANGED',
      message: '优惠券已处于启用状态',
    })
    expect(mockVoucherCodeUpdate).not.toHaveBeenCalled()
    expect(mockRevalidatePath).not.toHaveBeenCalled()
  })
})
