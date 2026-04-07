import type { UserRole } from '@prisma/client'

export type GrowthConsoleTab = 'referrals' | 'vouchers'

export const GROWTH_CONSOLE_TABS: GrowthConsoleTab[] = [
  'referrals',
  'vouchers',
]

export function canViewGrowthConsoleVouchers(role: UserRole | null | undefined) {
  return role === 'ADMIN'
}

export function resolveGrowthConsoleInitialTab(input: {
  tab?: string | null
  role: UserRole | null | undefined
}): GrowthConsoleTab {
  if (input.role !== 'ADMIN') {
    return 'referrals'
  }

  return input.tab === 'vouchers' ? 'vouchers' : 'referrals'
}

export function getGrowthConsoleAvailableTabs(
  role: UserRole | null | undefined
): GrowthConsoleTab[] {
  if (role === 'ADMIN') {
    return GROWTH_CONSOLE_TABS
  }

  return ['referrals']
}

export function resolveGrowthConsoleRoute(input: {
  role: UserRole | null | undefined
  tab?: string | null
}) {
  if (input.role === 'ADMIN' && input.tab === 'vouchers') {
    return '/admin/referrals?tab=vouchers'
  }

  return '/admin/referrals'
}
