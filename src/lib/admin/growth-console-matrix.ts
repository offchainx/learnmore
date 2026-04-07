import type { UserRole } from '@prisma/client'
import {
  canViewGrowthConsoleVouchers,
  type GrowthConsoleTab,
} from './growth-console'

export type GrowthConsoleColumn = {
  key: string
  label: string
  align?: 'left' | 'right'
}

export type GrowthConsoleOption = {
  value: string
  label: string
}

export type GrowthConsoleActionSpec = {
  key: string
  label: string
  description: string
  tab: GrowthConsoleTab
  adminOnly?: boolean
}

export type GrowthConsoleKpiSpec = {
  key: string
  label: string
  description: string
  adminOnly?: boolean
}

export const GROWTH_CONSOLE_OVERVIEW_KPI_MATRIX: GrowthConsoleKpiSpec[] = [
  {
    key: 'referrals-total',
    label: '总推荐数',
    description: '当前推荐链路累计记录总数',
  },
  {
    key: 'referrals-completed',
    label: '成功转化',
    description: '完成推荐闭环并发放奖励的记录数',
  },
  {
    key: 'referrals-deferred',
    label: '待发奖励',
    description: '仍处于延迟发放阶段的推荐奖励数',
  },
  {
    key: 'vouchers-active',
    label: '可用优惠券',
    description: '当前仍处于启用状态的优惠券数量',
    adminOnly: true,
  },
  {
    key: 'vouchers-redeemed',
    label: '已核销次数',
    description: '至少被使用过一次的优惠券数量',
    adminOnly: true,
  },
]

export const GROWTH_CONSOLE_REFERRAL_TABLE_COLUMNS: GrowthConsoleColumn[] = [
  { key: 'referrer', label: '推荐人' },
  { key: 'referee', label: '被推荐人' },
  { key: 'referralCode', label: '推荐码' },
  { key: 'status', label: '状态' },
  { key: 'rewardGranted', label: '奖励状态' },
  { key: 'deferredReward', label: '延迟奖励' },
  { key: 'createdAt', label: '创建时间' },
]

export const GROWTH_CONSOLE_VOUCHER_TABLE_COLUMNS: GrowthConsoleColumn[] = [
  { key: 'code', label: '优惠券码' },
  { key: 'discountType', label: '折扣类型' },
  { key: 'discountValue', label: '折扣值' },
  { key: 'usage', label: '使用次数' },
  { key: 'stripeCouponId', label: 'Stripe 优惠券 ID' },
  { key: 'validity', label: '有效期' },
  { key: 'status', label: '状态' },
  { key: 'action', label: '操作', align: 'right' },
]

export const GROWTH_CONSOLE_REFERRAL_STATUS_OPTIONS: GrowthConsoleOption[] = [
  { value: 'ALL', label: '状态: 全部' },
  { value: 'PENDING', label: '待完成' },
  { value: 'DEFERRED', label: '延迟发放' },
  { value: 'COMPLETED', label: '已完成' },
  { value: 'EXPIRED', label: '已过期' },
  { value: 'CANCELLED', label: '已取消' },
]

export const GROWTH_CONSOLE_VOUCHER_STATUS_OPTIONS: GrowthConsoleOption[] = [
  { value: 'ALL', label: '状态: 全部' },
  { value: 'ACTIVE', label: '启用中' },
  { value: 'INACTIVE', label: '已停用' },
]

export const GROWTH_CONSOLE_VOUCHER_TYPE_OPTIONS: GrowthConsoleOption[] = [
  { value: 'ALL', label: '类型: 全部' },
  { value: 'AMOUNT', label: '固定金额' },
  { value: 'PERCENT', label: '百分比' },
]

export const GROWTH_CONSOLE_ACTION_MATRIX: GrowthConsoleActionSpec[] = [
  {
    key: 'referral-copy-code',
    label: '复制推荐码',
    description: '复制用户个人推荐码到剪贴板',
    tab: 'referrals',
  },
  {
    key: 'referral-copy-link',
    label: '复制推荐链接',
    description: '复制带 referralCode 的分享链接',
    tab: 'referrals',
  },
  {
    key: 'voucher-create',
    label: '创建优惠券',
    description: '创建可用于支付的管理员优惠券',
    tab: 'vouchers',
    adminOnly: true,
  },
  {
    key: 'voucher-toggle',
    label: '启停优惠券',
    description: '切换优惠券的启用/停用状态',
    tab: 'vouchers',
    adminOnly: true,
  },
  {
    key: 'voucher-copy-code',
    label: '复制优惠券码',
    description: '复制优惠券码或 Stripe 优惠券信息',
    tab: 'vouchers',
    adminOnly: true,
  },
] as const

export function getGrowthConsoleFieldMatrix(role: UserRole | null | undefined) {
  const canViewVouchers = canViewGrowthConsoleVouchers(role)

  return {
    overviewKpis: GROWTH_CONSOLE_OVERVIEW_KPI_MATRIX.filter((item) => {
      return canViewVouchers || !item.adminOnly
    }),
    referralTableColumns: GROWTH_CONSOLE_REFERRAL_TABLE_COLUMNS,
    voucherTableColumns: canViewVouchers
      ? GROWTH_CONSOLE_VOUCHER_TABLE_COLUMNS
      : [],
    referralFilters: GROWTH_CONSOLE_REFERRAL_STATUS_OPTIONS,
    voucherFilters: canViewVouchers
      ? {
          status: GROWTH_CONSOLE_VOUCHER_STATUS_OPTIONS,
          type: GROWTH_CONSOLE_VOUCHER_TYPE_OPTIONS,
        }
      : null,
    actions: GROWTH_CONSOLE_ACTION_MATRIX.filter((item) => {
      return canViewVouchers || !item.adminOnly
    }),
  }
}
