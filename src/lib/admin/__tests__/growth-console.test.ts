import { describe, expect, it } from 'vitest'
import { UserRole } from '@prisma/client'
import {
  canViewGrowthConsoleVouchers,
  getGrowthConsoleAvailableTabs,
  resolveGrowthConsoleInitialTab,
  resolveGrowthConsoleRoute,
} from '../growth-console'

describe('growth console helpers', () => {
  it('only admin can view voucher tab', () => {
    expect(canViewGrowthConsoleVouchers(UserRole.ADMIN)).toBe(true)
    expect(canViewGrowthConsoleVouchers(UserRole.TEACHER)).toBe(false)
    expect(canViewGrowthConsoleVouchers(null)).toBe(false)
  })

  it('normalizes initial tab by role and query string', () => {
    expect(
      resolveGrowthConsoleInitialTab({ role: UserRole.ADMIN, tab: 'vouchers' })
    ).toBe('vouchers')
    expect(
      resolveGrowthConsoleInitialTab({ role: UserRole.ADMIN, tab: 'invalid' })
    ).toBe('referrals')
    expect(
      resolveGrowthConsoleInitialTab({
        role: UserRole.TEACHER,
        tab: 'vouchers',
      })
    ).toBe('referrals')
    expect(resolveGrowthConsoleInitialTab({ role: null, tab: 'vouchers' })).toBe(
      'referrals'
    )
  })

  it('returns available tabs by role', () => {
    expect(getGrowthConsoleAvailableTabs(UserRole.ADMIN)).toEqual([
      'referrals',
      'vouchers',
    ])
    expect(getGrowthConsoleAvailableTabs(UserRole.TEACHER)).toEqual([
      'referrals',
    ])
    expect(getGrowthConsoleAvailableTabs(null)).toEqual(['referrals'])
  })

  it('resolves growth console route with dead-link fallback', () => {
    expect(
      resolveGrowthConsoleRoute({ role: UserRole.ADMIN, tab: 'vouchers' })
    ).toBe('/admin/referrals?tab=vouchers')
    expect(
      resolveGrowthConsoleRoute({ role: UserRole.ADMIN, tab: 'referrals' })
    ).toBe('/admin/referrals')
    expect(
      resolveGrowthConsoleRoute({ role: UserRole.TEACHER, tab: 'vouchers' })
    ).toBe('/admin/referrals')
  })
})
