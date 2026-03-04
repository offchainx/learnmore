export type ReferralStatus = 'PENDING' | 'COMPLETED' | 'DEFERRED' | 'EXPIRED' | 'CANCELLED'

export interface ReferralUserInfo {
  username: string
  email: string
  role: string
}

export interface AdminReferralRow {
  id: string
  referrer: ReferralUserInfo
  referee: ReferralUserInfo
  referralCode: string
  status: ReferralStatus
  rewardGranted: boolean
  deferredRewardTier?: string | null
  deferredRewardWeeks?: number
  deferredSettledAt?: string | null
  createdAt: string
}

export interface AdminReferralMetric {
  key: string
  label: string
  value: string
  trend?: 'up' | 'down' | 'flat'
  delta?: string
}

export interface AdminReferralFilters {
  keyword: string
  status: string
  role: string
  dateRange: string
}

export interface AdminReferralPagination {
  page: number
  pageSize: number
  total: number
  onPageChange?: (page: number) => void
}

export interface AdminReferralsViewProps {
  metrics: AdminReferralMetric[]
  rows: AdminReferralRow[]
  filters?: AdminReferralFilters
  onFilterChange?: (filters: AdminReferralFilters) => void
  onRowClick?: (id: string) => void
  pagination?: AdminReferralPagination
  lastUpdatedLabel?: string
}
