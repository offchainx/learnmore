import { describe, expect, it } from 'vitest'
import { UserRole } from '@prisma/client'
import { getGrowthConsoleFieldMatrix } from '../growth-console-matrix'

describe('growth console matrix', () => {
  it('exposes voucher fields only for admin', () => {
    const adminMatrix = getGrowthConsoleFieldMatrix(UserRole.ADMIN)
    const teacherMatrix = getGrowthConsoleFieldMatrix(UserRole.TEACHER)

    expect(adminMatrix.overviewKpis.map((item) => item.key)).toEqual([
      'referrals-total',
      'referrals-completed',
      'referrals-deferred',
      'vouchers-active',
      'vouchers-redeemed',
    ])
    expect(adminMatrix.voucherTableColumns.map((item) => item.key)).toEqual([
      'code',
      'discountType',
      'discountValue',
      'usage',
      'stripeCouponId',
      'validity',
      'status',
      'action',
    ])
    expect(adminMatrix.actions.map((item) => item.key)).toContain(
      'voucher-create'
    )
    expect(adminMatrix.voucherFilters?.status.map((item) => item.value)).toEqual([
      'ALL',
      'ACTIVE',
      'INACTIVE',
    ])

    expect(teacherMatrix.overviewKpis.map((item) => item.key)).toEqual([
      'referrals-total',
      'referrals-completed',
      'referrals-deferred',
    ])
    expect(teacherMatrix.voucherTableColumns).toEqual([])
    expect(teacherMatrix.voucherFilters).toBeNull()
    expect(teacherMatrix.actions.map((item) => item.key)).not.toContain(
      'voucher-create'
    )
  })
})
