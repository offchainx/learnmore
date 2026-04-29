'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { VoucherDiscountType } from '@prisma/client'
import PaginationAnt from '@/components/ui/pagination-ant'
import {
  ArrowDown,
  ArrowUp,
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Copy,
  Loader2,
  Minus,
  Search,
  Ticket,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  createVoucherCodeAction,
  toggleVoucherStatusAction,
} from '@/actions/admin/voucher'
import {
  GROWTH_CONSOLE_REFERRAL_STATUS_OPTIONS,
  getGrowthConsoleFieldMatrix,
} from '@/lib/admin/growth-console-matrix'
import {
  pageKpiCardClass,
  pageSegmentedButtonCompactClass,
  pageSegmentedControlCompactClass,
  pageTableShellClass,
} from '@/components/shared/pageSurfaces'
import {
  pageHeroNumericValueClass,
  pageKickerClass,
  pageMetaTextClass,
} from '@/components/shared/pageTypography'

type GrowthTab = 'referrals' | 'vouchers'
type TimeRange = '7D' | '30D' | 'ALL'

const DEFAULT_PAGE_SIZE = 10
const PAGE_SIZE_OPTIONS = [10, 20, 50] as const

type ReferralRow = {
  id: string
  referrer: { username: string; email: string; role: string }
  referee: { username: string; email: string; role: string }
  referralCode: string
  status: 'PENDING' | 'COMPLETED' | 'DEFERRED' | 'EXPIRED' | 'CANCELLED'
  rewardGranted: boolean
  deferredRewardTier?: string | null
  deferredRewardWeeks?: number
  deferredSettledAt?: string | null
  createdAt: string
}

type VoucherRow = {
  id: string
  code: string
  discountType: VoucherDiscountType
  discountValue: number
  isActive: boolean
  maxRedemptions: number | null
  redeemedCount: number
  validFrom: string | null
  validTo: string | null
  stripeCouponId: string | null
  createdAt: string
}

type KpiCard = {
  key: string
  title: string
  value: string
  caption: string
  meta: string
  trend: number | null
  trendLabel: string
  icon: React.ElementType
  iconClassName: string
  iconBgClassName: string
  glowClassName: string
  borderClassName: string
}

interface GrowthToolsConsoleProps {
  referrals: ReferralRow[]
  vouchers: VoucherRow[]
  isAdmin: boolean
  initialTab: GrowthTab
}

export type { GrowthTab }

const referralStatusClassMap: Record<ReferralRow['status'], string> = {
  PENDING:
    'border-amber-200 bg-amber-50 text-amber-700 dark:border-[#5C4520] dark:bg-[#3B2A10] dark:text-[#FBBF24]',
  COMPLETED:
    'border-green-200 bg-green-50 text-green-700 dark:border-[#244B37] dark:bg-[#123125] dark:text-[#86EFAC]',
  DEFERRED:
    'border-blue-200 bg-blue-50 text-blue-700 dark:border-[#2B4470] dark:bg-[#18335E] dark:text-[#93C5FD]',
  EXPIRED:
    'border-slate-200 bg-slate-100 text-slate-600 dark:border-[#24324D] dark:bg-[#151F36] dark:text-[#8FA4C2]',
  CANCELLED:
    'border-rose-200 bg-rose-50 text-rose-600 dark:border-[#5C2B33] dark:bg-[#31151D] dark:text-[#FCA5A5]',
}

function formatDateTime(input: string | null | undefined) {
  if (!input) return '—'
  const date = new Date(input)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('zh-CN', { hour12: false })
}

function isWithinRange(input: string | null | undefined, range: TimeRange) {
  if (!input || range === 'ALL') return true
  const date = new Date(input)
  if (Number.isNaN(date.getTime())) return false
  const now = Date.now()
  const ms = date.getTime()
  const days = range === '7D' ? 7 : 30
  return ms >= now - days * 24 * 60 * 60 * 1000
}

function subtractDays(base: Date, days: number) {
  return new Date(base.getTime() - days * 24 * 60 * 60 * 1000)
}

function calcTrend(current: number, previous: number) {
  if (previous === 0) {
    if (current === 0) return 0
    return 100
  }

  return Number((((current - previous) / previous) * 100).toFixed(1))
}

function formatRate(numerator: number, denominator: number) {
  if (denominator <= 0) return '0.0%'
  return `${((numerator / denominator) * 100).toFixed(1)}%`
}

function getTrendDisplay(trend: number | null) {
  if (trend === null) {
    return {
      text: '累计',
      icon: null,
      className:
        'border-borderTone bg-surface-subtle text-text-secondary dark:border-[#24324D] dark:bg-[#151F36] dark:text-[#8FA4C2]',
    }
  }

  if (trend === 0) {
    return {
      text: '0%',
      icon: null,
      className:
        'border-borderTone bg-surface-subtle text-text-secondary dark:border-[#24324D] dark:bg-[#151F36] dark:text-[#8FA4C2]',
    }
  }

  const positive = trend > 0
  return {
    text: `${positive ? '+' : ''}${trend}%`,
    icon: positive ? ArrowUp : ArrowDown,
    className: positive
      ? 'border-green-200 bg-green-50 text-green-600 dark:border-[#244B37] dark:bg-[#123125] dark:text-[#86EFAC]'
      : 'border-rose-200 bg-rose-50 text-rose-600 dark:border-[#5C2B33] dark:bg-[#31151D] dark:text-[#FCA5A5]',
  }
}

export function GrowthToolsConsole({
  referrals,
  vouchers,
  isAdmin,
  initialTab,
}: GrowthToolsConsoleProps) {
  const [activeTab, setActiveTab] = useState<GrowthTab>(initialTab)
  const [range, setRange] = useState<TimeRange>('30D')
  const [referralKeyword, setReferralKeyword] = useState('')
  const [referralStatus, setReferralStatus] = useState<
    'ALL' | ReferralRow['status']
  >('ALL')
  const [voucherKeyword, setVoucherKeyword] = useState('')
  const [voucherStatus, setVoucherStatus] = useState<
    'ALL' | 'ACTIVE' | 'INACTIVE'
  >('ALL')
  const [voucherType, setVoucherType] = useState<'ALL' | VoucherDiscountType>(
    'ALL'
  )
  const [referralPage, setReferralPage] = useState(1)
  const [voucherPage, setVoucherPage] = useState(1)
  const [referralPageSize, setReferralPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [voucherPageSize, setVoucherPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const [code, setCode] = useState('')
  const [discountType, setDiscountType] =
    useState<VoucherDiscountType>('AMOUNT')
  const [discountValue, setDiscountValue] = useState('10')
  const [maxRedemptions, setMaxRedemptions] = useState('')
  const [validFrom, setValidFrom] = useState('')
  const [validTo, setValidTo] = useState('')
  const [stripeCouponId, setStripeCouponId] = useState('')
  const fieldMatrix = useMemo(
    () => getGrowthConsoleFieldMatrix(isAdmin ? 'ADMIN' : 'TEACHER'),
    [isAdmin]
  )
  const referralStatusLabelMap = useMemo(
    () =>
      Object.fromEntries(
        GROWTH_CONSOLE_REFERRAL_STATUS_OPTIONS.filter(
          (option) => option.value !== 'ALL'
        ).map((option) => [option.value, option.label])
      ) as Record<ReferralRow['status'], string>,
    []
  )

  const referralScope = useMemo(() => {
    if (range === 'ALL') return referrals
    return referrals.filter((item) => isWithinRange(item.createdAt, range))
  }, [range, referrals])

  const voucherScope = useMemo(() => {
    if (range === 'ALL') return vouchers
    return vouchers.filter((item) => isWithinRange(item.createdAt, range))
  }, [range, vouchers])

  const previousReferralScope = useMemo(() => {
    if (range === 'ALL') return [] as ReferralRow[]
    const now = new Date()
    const currentStart = subtractDays(now, range === '7D' ? 7 : 30)
    const previousStart = subtractDays(currentStart, range === '7D' ? 7 : 30)
    return referrals.filter((item) => {
      const createdAt = new Date(item.createdAt)
      return createdAt >= previousStart && createdAt < currentStart
    })
  }, [range, referrals])

  const previousVoucherScope = useMemo(() => {
    if (range === 'ALL') return [] as VoucherRow[]
    const now = new Date()
    const currentStart = subtractDays(now, range === '7D' ? 7 : 30)
    const previousStart = subtractDays(currentStart, range === '7D' ? 7 : 30)
    return vouchers.filter((item) => {
      const createdAt = new Date(item.createdAt)
      return createdAt >= previousStart && createdAt < currentStart
    })
  }, [range, vouchers])

  const kpiCards = useMemo(() => {
    const totalReferrals = referrals.length
    const completedReferrals = referrals.filter(
      (item) => item.status === 'COMPLETED'
    ).length
    const deferredReferrals = referrals.filter(
      (item) => item.status === 'DEFERRED'
    ).length
    const activeVouchers = vouchers.filter((item) => item.isActive).length
    const redeemedVouchers = vouchers.filter(
      (item) => item.redeemedCount > 0
    ).length

    const currentLabel =
      range === '7D' ? '7 Days' : range === '30D' ? '30 Days' : 'All Time'
    const referralCurrent = referralScope.length
    const referralPrevious = previousReferralScope.length
    const conversionCurrent = referralScope.filter(
      (item) => item.status === 'COMPLETED'
    ).length
    const conversionPrevious = previousReferralScope.filter(
      (item) => item.status === 'COMPLETED'
    ).length
    const deferredCurrent = referralScope.filter(
      (item) => item.status === 'DEFERRED'
    ).length
    const deferredPrevious = previousReferralScope.filter(
      (item) => item.status === 'DEFERRED'
    ).length
    const activeVoucherCurrent = voucherScope.filter(
      (item) => item.isActive
    ).length
    const activeVoucherPrevious = previousVoucherScope.filter(
      (item) => item.isActive
    ).length
    const redeemedCurrent = voucherScope.reduce(
      (sum, item) => sum + item.redeemedCount,
      0
    )
    const redeemedPrevious = previousVoucherScope.reduce(
      (sum, item) => sum + item.redeemedCount,
      0
    )
    const referralCompletionRateCurrent = formatRate(
      conversionCurrent,
      referralCurrent
    )
    const referralCompletionRatePrevious = formatRate(
      conversionPrevious,
      referralPrevious
    )

    const cards: KpiCard[] = [
      {
        key: 'referrals',
        title: '总推荐数',
        value: String(totalReferrals),
        caption: range === 'ALL' ? '累计' : currentLabel,
        meta: '当前推荐链路累计记录总数',
        trend:
          range === 'ALL' ? null : calcTrend(referralCurrent, referralPrevious),
        trendLabel: range === 'ALL' ? '累计视角' : '较上窗口新增',
        icon: Users,
        iconClassName: 'text-[#60A5FA]',
        iconBgClassName: 'bg-blue-100 dark:bg-[#18335E]',
        glowClassName: 'bg-[#2563EB]/20',
        borderClassName: 'border-blue-200 dark:border-[#2B4470]',
      },
      {
        key: 'completed',
        title: '成功转化',
        value: String(completedReferrals),
        caption: range === 'ALL' ? '累计' : currentLabel,
        meta: `完成推荐闭环并发放奖励的记录数，完成率 ${referralCompletionRateCurrent}`,
        trend:
          range === 'ALL'
            ? null
            : calcTrend(conversionCurrent, conversionPrevious),
        trendLabel:
          range === 'ALL'
            ? '累计视角'
            : `较上窗口完成（上窗 ${referralCompletionRatePrevious}）`,
        icon: CheckCircle2,
        iconClassName: 'text-[#4ADE80]',
        iconBgClassName: 'bg-green-100 dark:bg-[#123125]',
        glowClassName: 'bg-[#22C55E]/20',
        borderClassName: 'border-green-200 dark:border-[#244B37]',
      },
      {
        key: 'deferred',
        title: '待发奖励',
        value: String(deferredReferrals),
        caption: range === 'ALL' ? '累计' : currentLabel,
        meta: '仍处于延迟发放阶段的推荐奖励数',
        trend:
          range === 'ALL' ? null : calcTrend(deferredCurrent, deferredPrevious),
        trendLabel: range === 'ALL' ? '累计视角' : '较上窗口变化',
        icon: Clock3,
        iconClassName: 'text-[#FBBF24]',
        iconBgClassName: 'bg-amber-100 dark:bg-[#3B2A10]',
        glowClassName: 'bg-[#F59E0B]/20',
        borderClassName: 'border-amber-200 dark:border-[#5C4520]',
      },
    ]

    if (isAdmin) {
      cards.push(
        {
          key: 'vouchers-active',
          title: '可用优惠券',
          value: String(activeVouchers),
          caption: range === 'ALL' ? '当前状态' : currentLabel,
          meta: '当前仍处于启用状态的 Voucher 数量',
          trend:
            range === 'ALL'
              ? null
              : calcTrend(activeVoucherCurrent, activeVoucherPrevious),
          trendLabel: range === 'ALL' ? '累计视角' : '较上窗口变化',
          icon: Ticket,
          iconClassName: 'text-[#C4B5FD]',
          iconBgClassName: 'bg-violet-100 dark:bg-[#2A1F4A]',
          glowClassName: 'bg-[#8B5CF6]/20',
          borderClassName: 'border-violet-200 dark:border-[#47306C]',
        },
        {
          key: 'vouchers-redeemed',
          title: '已核销次数',
          value: String(redeemedVouchers),
          caption: range === 'ALL' ? '累计' : currentLabel,
          meta: '至少被使用过一次的 Voucher 数量',
          trend:
            range === 'ALL'
              ? null
              : calcTrend(redeemedCurrent, redeemedPrevious),
          trendLabel: range === 'ALL' ? '累计视角' : '较上窗口核销',
          icon: BadgeCheck,
          iconClassName: 'text-[#FBBF24]',
          iconBgClassName: 'bg-amber-100 dark:bg-[#3A2A10]',
          glowClassName: 'bg-[#F59E0B]/20',
          borderClassName: 'border-amber-200 dark:border-[#5C4520]',
        }
      )
    }

    return cards
  }, [
    range,
    referralScope,
    previousReferralScope,
    referrals,
    voucherScope,
    previousVoucherScope,
    vouchers,
    isAdmin,
  ])

  const filteredReferrals = useMemo(() => {
    const keyword = referralKeyword.trim().toLowerCase()
    return referrals.filter((item) => {
      const hitKeyword =
        keyword === '' ||
        item.referralCode.toLowerCase().includes(keyword) ||
        item.referrer.username.toLowerCase().includes(keyword) ||
        item.referrer.email.toLowerCase().includes(keyword) ||
        item.referee.username.toLowerCase().includes(keyword) ||
        item.referee.email.toLowerCase().includes(keyword)
      const hitStatus =
        referralStatus === 'ALL' || item.status === referralStatus
      const hitRange = isWithinRange(item.createdAt, range)
      return hitKeyword && hitStatus && hitRange
    })
  }, [range, referralKeyword, referralStatus, referrals])

  const filteredVouchers = useMemo(() => {
    const keyword = voucherKeyword.trim().toLowerCase()
    return vouchers.filter((item) => {
      const hitKeyword =
        keyword === '' ||
        item.code.toLowerCase().includes(keyword) ||
        (item.stripeCouponId || '').toLowerCase().includes(keyword)
      const hitStatus =
        voucherStatus === 'ALL' ||
        (voucherStatus === 'ACTIVE' ? item.isActive : !item.isActive)
      const hitType = voucherType === 'ALL' || item.discountType === voucherType
      const hitRange = isWithinRange(item.createdAt, range)
      return hitKeyword && hitStatus && hitType && hitRange
    })
  }, [range, voucherKeyword, voucherStatus, voucherType, vouchers])

  const referralPageCount = Math.max(
    1,
    Math.ceil(filteredReferrals.length / referralPageSize)
  )
  const voucherPageCount = Math.max(
    1,
    Math.ceil(filteredVouchers.length / voucherPageSize)
  )

  const paginatedReferrals = useMemo(() => {
    const start =
      (Math.min(referralPage, referralPageCount) - 1) * referralPageSize
    return filteredReferrals.slice(start, start + referralPageSize)
  }, [filteredReferrals, referralPage, referralPageCount, referralPageSize])

  const paginatedVouchers = useMemo(() => {
    const start =
      (Math.min(voucherPage, voucherPageCount) - 1) * voucherPageSize
    return filteredVouchers.slice(start, start + voucherPageSize)
  }, [filteredVouchers, voucherPage, voucherPageCount, voucherPageSize])

  useEffect(() => {
    setReferralPage(1)
  }, [range, referralKeyword, referralStatus])

  useEffect(() => {
    setVoucherPage(1)
  }, [range, voucherKeyword, voucherStatus, voucherType])

  useEffect(() => {
    setReferralPage((current) => Math.min(current, referralPageCount))
  }, [referralPageCount])

  useEffect(() => {
    setVoucherPage((current) => Math.min(current, voucherPageCount))
  }, [voucherPageCount])

  const handleReferralPageChange = (nextPage: number, nextPageSize: number) => {
    if (nextPageSize !== referralPageSize) {
      setReferralPageSize(nextPageSize)
      setReferralPage(1)
      return
    }

    setReferralPage(nextPage)
  }

  const handleVoucherPageChange = (nextPage: number, nextPageSize: number) => {
    if (nextPageSize !== voucherPageSize) {
      setVoucherPageSize(nextPageSize)
      setVoucherPage(1)
      return
    }

    setVoucherPage(nextPage)
  }

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(null), 1600)
    } catch {
      setCopiedCode(null)
    }
  }

  const submitCreateVoucher = () => {
    startTransition(async () => {
      const parsedDiscount = Number(discountValue)
      if (!Number.isFinite(parsedDiscount) || parsedDiscount <= 0) {
        toast.error('折扣值必须为正整数')
        return
      }

      const result = await createVoucherCodeAction({
        code,
        discountType,
        discountValue: Math.trunc(parsedDiscount),
        maxRedemptions: maxRedemptions
          ? Math.trunc(Number(maxRedemptions))
          : null,
        validFrom: validFrom ? new Date(validFrom).toISOString() : null,
        validTo: validTo ? new Date(validTo).toISOString() : null,
        stripeCouponId: stripeCouponId || null,
      })

      if (!result.ok) {
        toast.error(result.message)
        return
      }

      toast.success(result.message)
      window.location.reload()
    })
  }

  const toggleVoucherStatus = (voucherId: string, nextActive: boolean) => {
    startTransition(async () => {
      const result = await toggleVoucherStatusAction(voucherId, nextActive)
      if (!result.ok) {
        toast.error(result.message)
        return
      }

      toast.success(result.message)
      window.location.reload()
    })
  }

  return (
    <div className="space-y-3 text-text-primary">
      <section className="space-y-3">
        <div className="flex flex-col gap-3 tablet:flex-row tablet:items-center tablet:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-text-primary">
              增长概览
            </h2>
            <p className="text-sm text-text-secondary">
              聚焦推荐转化、待发奖励与优惠券 使用情况，并补充相对上周期的变化。
            </p>
          </div>

          <div className={pageSegmentedControlCompactClass}>
            {[
              { key: '7D', label: '7 Days' },
              { key: '30D', label: '30 Days' },
              { key: 'ALL', label: 'All Time' },
            ].map((option) => {
              const isActive = option.key === range
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setRange(option.key as TimeRange)}
                  className={`${pageSegmentedButtonCompactClass} ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>

        <div
          className={`grid gap-3 tablet:grid-cols-2 ${isAdmin ? 'desktop:grid-cols-5' : 'desktop:grid-cols-3'}`}
        >
          {kpiCards.map((card) => {
            const Icon = card.icon
            const trend = getTrendDisplay(card.trend)
            const TrendIcon = trend.icon
            return (
              <div
                key={card.key}
                className={`${pageKpiCardClass} p-4 ${card.borderClassName}`}
              >
                <div
                  className={`absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl ${card.glowClassName}`}
                />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-70" />
                <div className="relative flex h-full items-start justify-between gap-4">
                  <div className="flex min-h-[112px] flex-1 flex-col justify-between gap-3">
                    <div className="space-y-1.5">
                      <p className={pageKickerClass}>{card.title}</p>
                      <div className="flex items-end gap-2">
                        <p className={pageHeroNumericValueClass}>
                          {card.value}
                        </p>
                        <span className={`pb-1 ${pageMetaTextClass}`}>
                          {card.caption}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={pageMetaTextClass}>
                        {card.trendLabel}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-medium ${trend.className}`}
                      >
                        {TrendIcon ? <TrendIcon className="h-3 w-3" /> : null}
                        {trend.text}
                      </span>
                    </div>
                    <p
                      className={`line-clamp-2 max-w-[20rem] ${pageMetaTextClass}`}
                    >
                      {card.meta}
                    </p>
                  </div>

                  <div
                    className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/60 ${card.iconBgClassName}`}
                  >
                    <Icon className={`h-5 w-5 ${card.iconClassName}`} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <div className={`${pageTableShellClass} flex min-h-[500px] flex-col`}>
        <div className="border-b border-borderTone bg-surface-subtle px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-3">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold text-text-primary">
                工作区
              </h2>
              <p className="text-sm text-text-secondary">
                在推荐关系和优惠券管理之间切换，保持同一套筛选和表格工作流。
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className={pageSegmentedControlCompactClass}>
                <button
                  type="button"
                  onClick={() => setActiveTab('referrals')}
                  className={`${pageSegmentedButtonCompactClass} ${
                    activeTab === 'referrals'
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  推荐关系
                </button>
                {isAdmin ? (
                  <button
                    type="button"
                    onClick={() => setActiveTab('vouchers')}
                    className={`${pageSegmentedButtonCompactClass} ${
                      activeTab === 'vouchers'
                        ? 'bg-primary/10 text-primary'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    优惠券管理
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {activeTab === 'referrals' ? (
          <>
            <div className="border-b border-borderTone bg-surface-subtle px-5 py-4 sm:px-6">
              <div className="flex flex-col gap-3 desktop:flex-row desktop:items-center desktop:justify-between">
                <div className="flex flex-col gap-3 tablet:flex-row tablet:items-center">
                  <div className="group relative w-full tablet:w-80">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary transition-colors group-focus-within:text-primary"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="搜索推荐码、用户或邮箱..."
                      value={referralKeyword}
                      onChange={(e) => setReferralKeyword(e.target.value)}
                      className="w-full rounded-2xl border border-borderTone bg-surface py-2.5 pl-10 pr-4 text-sm text-text-primary outline-none transition-all placeholder:text-text-tertiary focus:border-primary/40 focus:ring-2 focus:ring-primary/20 dark:border-[#24324D] dark:bg-[#151F36] dark:text-[#E6EDF7] dark:placeholder:text-[#8FA4C2] dark:focus:border-[#33527B] dark:focus:ring-[#60A5FA]/20"
                    />
                  </div>

                  <div className="relative min-w-[170px]">
                    <select
                      value={referralStatus}
                      onChange={(e) =>
                        setReferralStatus(
                          e.target.value as 'ALL' | ReferralRow['status']
                        )
                      }
                      className="w-full appearance-none rounded-2xl border border-borderTone bg-surface py-2.5 pl-3 pr-10 text-sm text-text-primary outline-none transition-all hover:bg-surface-subtle focus:border-primary/40 focus:ring-2 focus:ring-primary/20 dark:border-[#24324D] dark:bg-[#151F36] dark:text-[#E6EDF7] dark:hover:bg-[#1A2744] dark:focus:border-[#33527B] dark:focus:ring-[#60A5FA]/20"
                    >
                      <option value="ALL">状态: 全部</option>
                      {fieldMatrix.referralFilters.map((option) =>
                        option.value === 'ALL' ? null : (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        )
                      )}
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary"
                      size={16}
                    />
                  </div>
                </div>

                <span className="text-sm text-text-secondary">
                  当前命中{' '}
                  <span className="font-semibold text-text-primary">
                    {filteredReferrals.length}
                  </span>{' '}
                  条推荐关系
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1120px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-borderTone bg-surface-subtle">
                    {fieldMatrix.referralTableColumns.map((column) => (
                      <th
                        key={column.key}
                        className={`px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-tertiary ${
                          column.align === 'right' ? 'text-right' : 'text-left'
                        }`}
                      >
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderTone">
                  {paginatedReferrals.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-16 text-center text-sm text-text-secondary"
                      >
                        当前筛选下暂无推荐关系记录
                      </td>
                    </tr>
                  ) : (
                    paginatedReferrals.map((row) => (
                      <tr
                        key={row.id}
                        className="transition-colors hover:bg-surface-subtle"
                      >
                        <td className="px-6 py-4">
                          <div className="space-y-0.5">
                            <p className="max-w-[220px] truncate text-sm font-medium text-text-primary">
                              {row.referrer.username}
                            </p>
                            <p className="max-w-[220px] truncate text-xs text-text-secondary">
                              {row.referrer.email}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-0.5">
                            <p className="max-w-[220px] truncate text-sm font-medium text-text-primary">
                              {row.referee.username}
                            </p>
                            <p className="max-w-[220px] truncate text-xs text-text-secondary">
                              {row.referee.email}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <code className="rounded bg-surface-subtle px-2 py-1 font-mono text-xs text-text-primary">
                              {row.referralCode}
                            </code>
                            <button
                              type="button"
                              onClick={() => copyCode(row.referralCode)}
                              className="rounded p-1 text-text-secondary transition-colors hover:bg-surface-subtle hover:text-text-primary"
                            >
                              {copiedCode === row.referralCode ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-[#4ADE80]" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${referralStatusClassMap[row.status]}`}
                          >
                            {referralStatusLabelMap[row.status]}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-text-primary">
                          {row.rewardGranted ? '已发放' : '未触发'}
                        </td>
                        <td className="px-6 py-4">
                          {row.deferredRewardTier ? (
                            <div className="space-y-0.5">
                              <p className="text-sm font-medium text-text-primary">
                                {row.deferredRewardTier}
                              </p>
                              <p className="text-xs text-text-secondary">
                                {row.deferredRewardWeeks || 0} 周后结算
                              </p>
                            </div>
                          ) : (
                            <span className="text-sm text-text-secondary">
                              无
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs text-text-secondary">
                          {formatDateTime(row.createdAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-borderTone bg-surface-subtle px-5 py-4 text-sm text-text-secondary sm:px-6 tablet:flex-row tablet:items-center tablet:justify-between">
              <span>
                第 {Math.min(referralPage, referralPageCount)} /{' '}
                {referralPageCount} 页，当前每页 {referralPageSize} 条
              </span>
              <PaginationAnt
                current={referralPage}
                total={Math.max(1, filteredReferrals.length)}
                pageSize={referralPageSize}
                showSizeChanger
                pageSizeOptions={PAGE_SIZE_OPTIONS.map(String)}
                showLessItems
                onChange={(nextPage, nextPageSize) =>
                  handleReferralPageChange(
                    nextPage,
                    nextPageSize || referralPageSize
                  )
                }
              />
            </div>
          </>
        ) : (
          <>
            <div className="border-b border-borderTone bg-surface-subtle px-5 py-4 sm:px-6">
              <div className="grid gap-4 desktop:grid-cols-[1.2fr_1fr]">
                <div className="grid gap-3 tablet:grid-cols-2">
                  <div className="tablet:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-text-primary">
                      优惠券码
                    </label>
                    <input
                      value={code}
                      onChange={(event) =>
                        setCode(event.target.value.toUpperCase())
                      }
                      placeholder="例如: LM10OFF"
                      className="w-full rounded-2xl border border-borderTone bg-surface px-4 py-3 text-sm text-text-primary outline-none transition-all placeholder:text-text-tertiary focus:border-primary/40 focus:ring-2 focus:ring-primary/20 dark:border-[#24324D] dark:bg-[#151F36] dark:text-[#E6EDF7] dark:placeholder:text-[#8FA4C2] dark:focus:border-[#33527B] dark:focus:ring-[#60A5FA]/20"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-text-primary">
                      折扣类型
                    </label>
                    <select
                      value={discountType}
                      onChange={(event) =>
                        setDiscountType(
                          event.target.value as VoucherDiscountType
                        )
                      }
                      className="w-full appearance-none rounded-2xl border border-borderTone bg-surface px-4 py-3 text-sm text-text-primary outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-primary/20 dark:border-[#24324D] dark:bg-[#151F36] dark:text-[#E6EDF7] dark:focus:border-[#33527B] dark:focus:ring-[#60A5FA]/20"
                    >
                      <option value="AMOUNT">固定金额</option>
                      <option value="PERCENT">百分比</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-text-primary">
                      折扣值
                    </label>
                    <input
                      type="number"
                      value={discountValue}
                      onChange={(event) => setDiscountValue(event.target.value)}
                      placeholder={
                        discountType === 'PERCENT'
                          ? '例如 10（10%）'
                          : '例如 10（RM10）'
                      }
                      className="w-full rounded-2xl border border-borderTone bg-surface px-4 py-3 text-sm text-text-primary outline-none transition-all placeholder:text-text-tertiary focus:border-primary/40 focus:ring-2 focus:ring-primary/20 dark:border-[#24324D] dark:bg-[#151F36] dark:text-[#E6EDF7] dark:placeholder:text-[#8FA4C2] dark:focus:border-[#33527B] dark:focus:ring-[#60A5FA]/20"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-text-primary">
                      核销上限
                    </label>
                    <input
                      type="number"
                      value={maxRedemptions}
                      onChange={(event) =>
                        setMaxRedemptions(event.target.value)
                      }
                      placeholder="留空 = 不限"
                      className="w-full rounded-2xl border border-borderTone bg-surface px-4 py-3 text-sm text-text-primary outline-none transition-all placeholder:text-text-tertiary focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-text-primary">
                      生效时间
                    </label>
                    <input
                      type="datetime-local"
                      value={validFrom}
                      onChange={(event) => setValidFrom(event.target.value)}
                      className="w-full rounded-2xl border border-borderTone bg-surface px-4 py-3 text-sm text-text-primary outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-text-primary">
                      失效时间
                    </label>
                    <input
                      type="datetime-local"
                      value={validTo}
                      onChange={(event) => setValidTo(event.target.value)}
                      className="w-full rounded-2xl border border-borderTone bg-surface px-4 py-3 text-sm text-text-primary outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="tablet:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-text-primary">
                      Stripe 优惠券 ID
                    </label>
                    <input
                      value={stripeCouponId}
                      onChange={(event) =>
                        setStripeCouponId(event.target.value)
                      }
                      placeholder="例如: 3mQw..."
                      className="w-full rounded-2xl border border-borderTone bg-surface px-4 py-3 text-sm text-text-primary outline-none transition-all placeholder:text-text-tertiary focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="rounded-[24px] border border-borderTone bg-surface-subtle p-5 dark:border-[#24324D] dark:bg-[#151F36]">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-text-primary">
                      创建优惠券
                    </h3>
                    <p className="text-sm text-text-secondary">
                      在统一工作台内创建金额减免或百分比折扣，并立即进入启停管理。
                    </p>
                  </div>
                  <div className="mt-5 space-y-3 text-sm text-text-secondary">
                    <p>当前支持：</p>
                    <p>AMOUNT 固定金额减免</p>
                    <p>PERCENT 百分比折扣</p>
                    <p>支持有效期、核销上限和 Stripe 优惠券绑定</p>
                  </div>
                  <button
                    onClick={submitCreateVoucher}
                    disabled={isPending || !code.trim()}
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#33527B] bg-[#2563EB] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : null}
                    创建优惠券
                  </button>
                </div>
              </div>
            </div>

            <div className="border-b border-borderTone bg-surface-subtle px-5 py-4 sm:px-6">
              <div className="flex flex-col gap-3 desktop:flex-row desktop:items-center desktop:justify-between">
                <div className="flex flex-col gap-3 tablet:flex-row tablet:items-center">
                  <div className="group relative w-full tablet:w-80">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary transition-colors group-focus-within:text-primary"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="搜索优惠券码或 Stripe 优惠券..."
                      value={voucherKeyword}
                      onChange={(e) => setVoucherKeyword(e.target.value)}
                      className="w-full rounded-2xl border border-borderTone bg-surface py-2.5 pl-10 pr-4 text-sm text-text-primary outline-none transition-all placeholder:text-text-tertiary focus:border-primary/40 focus:ring-2 focus:ring-primary/20 dark:border-[#24324D] dark:bg-[#151F36] dark:text-[#E6EDF7] dark:placeholder:text-[#8FA4C2] dark:focus:border-[#33527B] dark:focus:ring-[#60A5FA]/20"
                    />
                  </div>
                  <div className="relative min-w-[160px]">
                    <select
                      value={voucherStatus}
                      onChange={(e) =>
                        setVoucherStatus(
                          e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE'
                        )
                      }
                      className="w-full appearance-none rounded-2xl border border-borderTone bg-surface py-2.5 pl-3 pr-10 text-sm text-text-primary outline-none transition-all hover:bg-surface-subtle focus:border-primary/40 focus:ring-2 focus:ring-primary/20 dark:border-[#24324D] dark:bg-[#151F36] dark:text-[#E6EDF7] dark:hover:bg-[#1A2744] dark:focus:border-[#33527B] dark:focus:ring-[#60A5FA]/20"
                    >
                      {fieldMatrix.voucherFilters?.status.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary"
                      size={16}
                    />
                  </div>
                  <div className="relative min-w-[160px]">
                    <select
                      value={voucherType}
                      onChange={(e) =>
                        setVoucherType(
                          e.target.value as 'ALL' | VoucherDiscountType
                        )
                      }
                      className="w-full appearance-none rounded-2xl border border-borderTone bg-surface py-2.5 pl-3 pr-10 text-sm text-text-primary outline-none transition-all hover:bg-surface-subtle focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                    >
                      {fieldMatrix.voucherFilters?.type.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary"
                      size={16}
                    />
                  </div>
                </div>
                <span className="text-sm text-text-secondary">
                  当前命中{' '}
                  <span className="font-semibold text-text-primary">
                    {filteredVouchers.length}
                  </span>{' '}
                  个优惠券
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1180px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-borderTone bg-surface-subtle">
                    {fieldMatrix.voucherTableColumns.map((column) => (
                      <th
                        key={column.key}
                        className={`px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-tertiary ${
                          column.align === 'right' ? 'text-right' : 'text-left'
                        }`}
                      >
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderTone">
                  {paginatedVouchers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-16 text-center text-sm text-text-secondary"
                      >
                        当前筛选下暂无优惠券
                      </td>
                    </tr>
                  ) : (
                    paginatedVouchers.map((voucher) => (
                      <tr
                        key={voucher.id}
                        className="transition-colors hover:bg-surface-subtle"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <code className="rounded bg-surface-subtle px-2 py-1 font-mono text-xs text-text-primary">
                              {voucher.code}
                            </code>
                            <button
                              type="button"
                              onClick={() => copyCode(voucher.code)}
                              className="rounded p-1 text-text-secondary transition-colors hover:bg-surface-subtle hover:text-text-primary"
                            >
                              {copiedCode === voucher.code ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-[#4ADE80]" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-text-primary">
                          {voucher.discountType === 'PERCENT'
                            ? '百分比'
                            : '固定金额'}
                        </td>
                        <td className="px-6 py-4 text-sm text-text-primary">
                          {voucher.discountType === 'PERCENT'
                            ? `${voucher.discountValue}%`
                            : `RM ${voucher.discountValue}`}
                        </td>
                        <td className="px-6 py-4 text-sm text-text-primary">
                          {voucher.redeemedCount}
                          {voucher.maxRedemptions !== null
                            ? ` / ${voucher.maxRedemptions}`
                            : ' / ∞'}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-text-secondary">
                          {voucher.stripeCouponId || '—'}
                        </td>
                        <td className="px-6 py-4 text-xs text-text-secondary">
                          <div>{formatDateTime(voucher.validFrom)}</div>
                          <div>{formatDateTime(voucher.validTo)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${
                              voucher.isActive
                                ? 'border-green-200 bg-green-50 text-green-700'
                                : 'border-slate-200 bg-slate-100 text-slate-600'
                            }`}
                          >
                            {voucher.isActive ? '启用中' : '已停用'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() =>
                              toggleVoucherStatus(voucher.id, !voucher.isActive)
                            }
                            disabled={isPending}
                            className="inline-flex items-center gap-2 rounded-xl border border-borderTone bg-surface px-3 py-2 text-sm text-text-primary transition-colors hover:bg-surface-subtle disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {voucher.isActive ? '停用' : '启用'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-borderTone bg-surface-subtle px-5 py-4 text-sm text-text-secondary sm:px-6 tablet:flex-row tablet:items-center tablet:justify-between">
              <span>
                第 {Math.min(voucherPage, voucherPageCount)} /{' '}
                {voucherPageCount} 页，当前每页 {voucherPageSize} 条
              </span>
              <PaginationAnt
                current={voucherPage}
                total={Math.max(1, filteredVouchers.length)}
                pageSize={voucherPageSize}
                showSizeChanger
                pageSizeOptions={PAGE_SIZE_OPTIONS.map(String)}
                showLessItems
                onChange={(nextPage, nextPageSize) =>
                  handleVoucherPageChange(
                    nextPage,
                    nextPageSize || voucherPageSize
                  )
                }
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
