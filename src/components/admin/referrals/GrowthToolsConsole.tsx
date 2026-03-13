'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { VoucherDiscountType } from '@prisma/client'
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
  Sparkles,
  Ticket,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  createVoucherCodeAction,
  toggleVoucherStatusAction,
} from '@/actions/admin/voucher'

type GrowthTab = 'referrals' | 'vouchers'
type TimeRange = '7D' | '30D' | 'ALL'

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

const referralStatusLabelMap: Record<ReferralRow['status'], string> = {
  PENDING: '待完成',
  COMPLETED: '已完成',
  DEFERRED: '延迟发放',
  EXPIRED: '已过期',
  CANCELLED: '已取消',
}

const referralStatusClassMap: Record<ReferralRow['status'], string> = {
  PENDING: 'border-[#5C4520] bg-[#3B2A10] text-[#FBBF24]',
  COMPLETED: 'border-[#244B37] bg-[#123125] text-[#4ADE80]',
  DEFERRED: 'border-[#2B4470] bg-[#18335E] text-[#60A5FA]',
  EXPIRED: 'border-[#24324D] bg-[#151F36] text-[#8FA4C2]',
  CANCELLED: 'border-[#5C2B33] bg-[#31151D] text-[#F87171]',
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

function getTrendDisplay(trend: number | null) {
  if (trend === null) {
    return {
      text: '累计',
      icon: null,
      className: 'border-[#24324D] bg-[#151F36] text-[#8FA4C2]',
    }
  }

  if (trend === 0) {
    return {
      text: '0%',
      icon: null,
      className: 'border-[#24324D] bg-[#151F36] text-[#8FA4C2]',
    }
  }

  const positive = trend > 0
  return {
    text: `${positive ? '+' : ''}${trend}%`,
    icon: positive ? ArrowUp : ArrowDown,
    className: positive
      ? 'border-[#244B37] bg-[#123125] text-[#86EFAC]'
      : 'border-[#5C2B33] bg-[#31151D] text-[#FCA5A5]',
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
        iconBgClassName: 'bg-[#18335E]',
        glowClassName: 'bg-[#2563EB]/20',
        borderClassName: 'border-[#2B4470]',
      },
      {
        key: 'completed',
        title: '成功转化',
        value: String(completedReferrals),
        caption: range === 'ALL' ? '累计' : currentLabel,
        meta: '完成推荐闭环并发放奖励的记录数',
        trend:
          range === 'ALL'
            ? null
            : calcTrend(conversionCurrent, conversionPrevious),
        trendLabel: range === 'ALL' ? '累计视角' : '较上窗口完成',
        icon: CheckCircle2,
        iconClassName: 'text-[#4ADE80]',
        iconBgClassName: 'bg-[#123125]',
        glowClassName: 'bg-[#22C55E]/20',
        borderClassName: 'border-[#244B37]',
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
        iconBgClassName: 'bg-[#3B2A10]',
        glowClassName: 'bg-[#F59E0B]/20',
        borderClassName: 'border-[#5C4520]',
      },
    ]

    if (isAdmin) {
      cards.push(
        {
          key: 'vouchers-active',
          title: '可用 Voucher',
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
          iconBgClassName: 'bg-[#2A1F4A]',
          glowClassName: 'bg-[#8B5CF6]/20',
          borderClassName: 'border-[#47306C]',
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
          iconBgClassName: 'bg-[#3A2A10]',
          glowClassName: 'bg-[#F59E0B]/20',
          borderClassName: 'border-[#5C4520]',
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
    <div className="space-y-3 text-[#E6EDF7]">
      <section className="relative overflow-hidden rounded-[28px] border border-[#24324D] bg-[linear-gradient(135deg,#111A2E_0%,#0F1A2F_55%,#0B1220_100%)] px-4 py-4 shadow-[0_22px_50px_rgba(2,8,23,0.35)] sm:px-5">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#2563EB]/10 blur-3xl" />
        <div className="absolute bottom-0 left-16 h-24 w-24 rounded-full bg-[#22C55E]/10 blur-3xl" />

        <div className="relative flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#E6EDF7] sm:text-[30px]">
              增长工具
            </h1>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#274066] bg-[#10203C] px-2.5 py-1 text-[11px] font-medium text-[#D6E7FF]">
              <Sparkles className="h-3 w-3 text-[#60A5FA]" />
              Growth Console
            </div>
          </div>
          <p className="max-w-3xl text-sm text-[#B2C3DA]">
            在同一工作台内查看推荐关系链路、奖励状态与 Voucher
            发放/核销情况，减少在多个后台工具间切换。
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-[#E6EDF7]">增长概览</h2>
            <p className="text-sm text-[#8FA4C2]">
              聚焦推荐转化、待发奖励与 Voucher
              使用情况，并补充相对上周期的变化。
            </p>
          </div>

          <div className="inline-flex items-center rounded-2xl border border-[#24324D] bg-[#121C32] p-1">
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
                  className={`rounded-xl px-5 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-white/12 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]'
                      : 'text-[#8FA4C2] hover:text-white'
                  }`}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>

        <div
          className={`grid gap-3 md:grid-cols-2 ${isAdmin ? 'xl:grid-cols-5' : 'xl:grid-cols-3'}`}
        >
          {kpiCards.map((card) => {
            const Icon = card.icon
            const trend = getTrendDisplay(card.trend)
            const TrendIcon = trend.icon
            return (
              <div
                key={card.key}
                className={`relative overflow-hidden rounded-[24px] border bg-[linear-gradient(180deg,rgba(17,26,46,0.98),rgba(11,18,32,0.96))] p-4 shadow-[0_18px_40px_rgba(2,8,23,0.38)] ${card.borderClassName}`}
              >
                <div
                  className={`absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl ${card.glowClassName}`}
                />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-70" />
                <div className="relative flex h-full items-start justify-between gap-4">
                  <div className="flex min-h-[112px] flex-1 flex-col justify-between gap-3">
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8EA3C0]">
                        {card.title}
                      </p>
                      <div className="flex items-end gap-2">
                        <p className="text-[2rem] font-semibold leading-none tracking-tight text-[#F8FBFF]">
                          {card.value}
                        </p>
                        <span className="pb-1 text-[11px] text-[#8EA3C0]">
                          {card.caption}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] text-[#8EA3C0]">
                        {card.trendLabel}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-medium ${trend.className}`}
                      >
                        {TrendIcon ? <TrendIcon className="h-3 w-3" /> : null}
                        {trend.text}
                      </span>
                    </div>
                    <p className="line-clamp-2 max-w-[20rem] text-sm leading-6 text-[#B2C3DA]">
                      {card.meta}
                    </p>
                  </div>

                  <div
                    className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 ${card.iconBgClassName}`}
                  >
                    <Icon className={`h-5 w-5 ${card.iconClassName}`} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <div className="bg-[#0F172A]/96 flex min-h-[500px] flex-col overflow-hidden rounded-[28px] border border-[#24324D] shadow-[0_18px_40px_rgba(2,8,23,0.24)]">
        <div className="border-b border-[#1B2840] bg-[#0F1A2F] px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-3">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold text-[#F4F7FB]">工作区</h2>
              <p className="text-sm text-[#8FA4C2]">
                在推荐关系和 Voucher 管理之间切换，保持同一套筛选和表格工作流。
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center rounded-2xl border border-[#24324D] bg-[#121C32] p-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('referrals')}
                  className={`rounded-xl px-5 py-2 text-sm transition-colors ${
                    activeTab === 'referrals'
                      ? 'bg-white/12 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]'
                      : 'text-[#8FA4C2] hover:text-white'
                  }`}
                >
                  推荐关系
                </button>
                {isAdmin ? (
                  <button
                    type="button"
                    onClick={() => setActiveTab('vouchers')}
                    className={`rounded-xl px-5 py-2 text-sm transition-colors ${
                      activeTab === 'vouchers'
                        ? 'bg-white/12 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]'
                        : 'text-[#8FA4C2] hover:text-white'
                    }`}
                  >
                    Voucher 管理
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {activeTab === 'referrals' ? (
          <>
            <div className="border-b border-[#1B2840] bg-[#10192D] px-5 py-4 sm:px-6">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <div className="group relative w-full md:w-80">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#556B8A] transition-colors group-focus-within:text-[#60A5FA]"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="搜索推荐码、用户或邮箱..."
                      value={referralKeyword}
                      onChange={(e) => setReferralKeyword(e.target.value)}
                      className="w-full rounded-2xl border border-[#24324D] bg-[#151F36] py-2.5 pl-10 pr-4 text-sm text-[#E6EDF7] outline-none transition-all placeholder:text-[#6F86A8] focus:border-[#33527B] focus:ring-2 focus:ring-[#60A5FA]/20"
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
                      className="w-full appearance-none rounded-2xl border border-[#24324D] bg-[#151F36] py-2.5 pl-3 pr-10 text-sm text-[#E6EDF7] outline-none transition-all hover:bg-[#1A2744] focus:border-[#33527B] focus:ring-2 focus:ring-[#60A5FA]/20"
                    >
                      <option value="ALL">状态: 全部</option>
                      {Object.entries(referralStatusLabelMap).map(
                        ([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        )
                      )}
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6F86A8]"
                      size={16}
                    />
                  </div>
                </div>

                <span className="text-sm text-[#8FA4C2]">
                  当前命中{' '}
                  <span className="font-semibold text-[#F4F7FB]">
                    {filteredReferrals.length}
                  </span>{' '}
                  条推荐关系
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1120px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#1B2840] bg-[#101A2D]">
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6F86A8]">
                      推荐人
                    </th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6F86A8]">
                      被推荐人
                    </th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6F86A8]">
                      推荐码
                    </th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6F86A8]">
                      状态
                    </th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6F86A8]">
                      奖励状态
                    </th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6F86A8]">
                      延迟奖励
                    </th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6F86A8]">
                      创建时间
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1B2840]">
                  {filteredReferrals.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-16 text-center text-sm text-[#8FA4C2]"
                      >
                        当前筛选下暂无推荐关系记录
                      </td>
                    </tr>
                  ) : (
                    filteredReferrals.map((row) => (
                      <tr
                        key={row.id}
                        className="transition-colors hover:bg-[#131F35]"
                      >
                        <td className="px-6 py-4">
                          <div className="space-y-0.5">
                            <p className="max-w-[220px] truncate text-sm font-medium text-[#F4F7FB]">
                              {row.referrer.username}
                            </p>
                            <p className="max-w-[220px] truncate text-xs text-[#8FA4C2]">
                              {row.referrer.email}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-0.5">
                            <p className="max-w-[220px] truncate text-sm font-medium text-[#F4F7FB]">
                              {row.referee.username}
                            </p>
                            <p className="max-w-[220px] truncate text-xs text-[#8FA4C2]">
                              {row.referee.email}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <code className="rounded bg-[#151F36] px-2 py-1 font-mono text-xs text-[#D5E0F0]">
                              {row.referralCode}
                            </code>
                            <button
                              type="button"
                              onClick={() => copyCode(row.referralCode)}
                              className="rounded p-1 text-[#8FA4C2] transition-colors hover:bg-[#1A2744] hover:text-white"
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
                        <td className="px-6 py-4 text-sm text-[#D5E0F0]">
                          {row.rewardGranted ? '已发放' : '未触发'}
                        </td>
                        <td className="px-6 py-4">
                          {row.deferredRewardTier ? (
                            <div className="space-y-0.5">
                              <p className="text-sm font-medium text-[#F4F7FB]">
                                {row.deferredRewardTier}
                              </p>
                              <p className="text-xs text-[#8FA4C2]">
                                {row.deferredRewardWeeks || 0} 周后结算
                              </p>
                            </div>
                          ) : (
                            <span className="text-sm text-[#8FA4C2]">无</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs text-[#8FA4C2]">
                          {formatDateTime(row.createdAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            <div className="border-b border-[#1B2840] bg-[#10192D] px-5 py-4 sm:px-6">
              <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-[#D5E0F0]">
                      Code
                    </label>
                    <input
                      value={code}
                      onChange={(event) =>
                        setCode(event.target.value.toUpperCase())
                      }
                      placeholder="例如: LM10OFF"
                      className="w-full rounded-2xl border border-[#24324D] bg-[#151F36] px-4 py-3 text-sm text-[#E6EDF7] outline-none transition-all placeholder:text-[#6F86A8] focus:border-[#33527B] focus:ring-2 focus:ring-[#60A5FA]/20"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#D5E0F0]">
                      Discount Type
                    </label>
                    <select
                      value={discountType}
                      onChange={(event) =>
                        setDiscountType(
                          event.target.value as VoucherDiscountType
                        )
                      }
                      className="w-full appearance-none rounded-2xl border border-[#24324D] bg-[#151F36] px-4 py-3 text-sm text-[#E6EDF7] outline-none transition-all focus:border-[#33527B] focus:ring-2 focus:ring-[#60A5FA]/20"
                    >
                      <option value="AMOUNT">AMOUNT</option>
                      <option value="PERCENT">PERCENT</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#D5E0F0]">
                      Discount Value
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
                      className="w-full rounded-2xl border border-[#24324D] bg-[#151F36] px-4 py-3 text-sm text-[#E6EDF7] outline-none transition-all placeholder:text-[#6F86A8] focus:border-[#33527B] focus:ring-2 focus:ring-[#60A5FA]/20"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#D5E0F0]">
                      Max Redemptions
                    </label>
                    <input
                      type="number"
                      value={maxRedemptions}
                      onChange={(event) =>
                        setMaxRedemptions(event.target.value)
                      }
                      placeholder="留空 = 不限"
                      className="w-full rounded-2xl border border-[#24324D] bg-[#151F36] px-4 py-3 text-sm text-[#E6EDF7] outline-none transition-all placeholder:text-[#6F86A8] focus:border-[#33527B] focus:ring-2 focus:ring-[#60A5FA]/20"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#D5E0F0]">
                      Valid From
                    </label>
                    <input
                      type="datetime-local"
                      value={validFrom}
                      onChange={(event) => setValidFrom(event.target.value)}
                      className="w-full rounded-2xl border border-[#24324D] bg-[#151F36] px-4 py-3 text-sm text-[#E6EDF7] outline-none transition-all focus:border-[#33527B] focus:ring-2 focus:ring-[#60A5FA]/20"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#D5E0F0]">
                      Valid To
                    </label>
                    <input
                      type="datetime-local"
                      value={validTo}
                      onChange={(event) => setValidTo(event.target.value)}
                      className="w-full rounded-2xl border border-[#24324D] bg-[#151F36] px-4 py-3 text-sm text-[#E6EDF7] outline-none transition-all focus:border-[#33527B] focus:ring-2 focus:ring-[#60A5FA]/20"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-[#D5E0F0]">
                      Stripe Coupon ID
                    </label>
                    <input
                      value={stripeCouponId}
                      onChange={(event) =>
                        setStripeCouponId(event.target.value)
                      }
                      placeholder="例如: 3mQw..."
                      className="w-full rounded-2xl border border-[#24324D] bg-[#151F36] px-4 py-3 text-sm text-[#E6EDF7] outline-none transition-all placeholder:text-[#6F86A8] focus:border-[#33527B] focus:ring-2 focus:ring-[#60A5FA]/20"
                    />
                  </div>
                </div>

                <div className="rounded-[24px] border border-[#24324D] bg-[linear-gradient(180deg,rgba(17,26,46,0.9),rgba(11,18,32,0.94))] p-5">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-[#F4F7FB]">
                      创建 Voucher
                    </h3>
                    <p className="text-sm text-[#8FA4C2]">
                      在统一工作台内创建金额减免或百分比折扣，并立即进入启停管理。
                    </p>
                  </div>
                  <div className="mt-5 space-y-3 text-sm text-[#B2C3DA]">
                    <p>当前支持：</p>
                    <p>AMOUNT 固定金额减免</p>
                    <p>PERCENT 百分比折扣</p>
                    <p>支持有效期、核销上限和 Stripe Coupon 绑定</p>
                  </div>
                  <button
                    onClick={submitCreateVoucher}
                    disabled={isPending || !code.trim()}
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#33527B] bg-[#2563EB] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : null}
                    创建 Voucher
                  </button>
                </div>
              </div>
            </div>

            <div className="border-b border-[#1B2840] bg-[#10192D] px-5 py-4 sm:px-6">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <div className="group relative w-full md:w-80">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#556B8A] transition-colors group-focus-within:text-[#60A5FA]"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="搜索 Voucher code 或 Stripe Coupon..."
                      value={voucherKeyword}
                      onChange={(e) => setVoucherKeyword(e.target.value)}
                      className="w-full rounded-2xl border border-[#24324D] bg-[#151F36] py-2.5 pl-10 pr-4 text-sm text-[#E6EDF7] outline-none transition-all placeholder:text-[#6F86A8] focus:border-[#33527B] focus:ring-2 focus:ring-[#60A5FA]/20"
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
                      className="w-full appearance-none rounded-2xl border border-[#24324D] bg-[#151F36] py-2.5 pl-3 pr-10 text-sm text-[#E6EDF7] outline-none transition-all hover:bg-[#1A2744] focus:border-[#33527B] focus:ring-2 focus:ring-[#60A5FA]/20"
                    >
                      <option value="ALL">状态: 全部</option>
                      <option value="ACTIVE">启用中</option>
                      <option value="INACTIVE">已停用</option>
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6F86A8]"
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
                      className="w-full appearance-none rounded-2xl border border-[#24324D] bg-[#151F36] py-2.5 pl-3 pr-10 text-sm text-[#E6EDF7] outline-none transition-all hover:bg-[#1A2744] focus:border-[#33527B] focus:ring-2 focus:ring-[#60A5FA]/20"
                    >
                      <option value="ALL">类型: 全部</option>
                      <option value="AMOUNT">AMOUNT</option>
                      <option value="PERCENT">PERCENT</option>
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6F86A8]"
                      size={16}
                    />
                  </div>
                </div>
                <span className="text-sm text-[#8FA4C2]">
                  当前命中{' '}
                  <span className="font-semibold text-[#F4F7FB]">
                    {filteredVouchers.length}
                  </span>{' '}
                  个 Voucher
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1180px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#1B2840] bg-[#101A2D]">
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6F86A8]">
                      Code
                    </th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6F86A8]">
                      Type
                    </th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6F86A8]">
                      Value
                    </th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6F86A8]">
                      Usage
                    </th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6F86A8]">
                      Stripe Coupon
                    </th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6F86A8]">
                      有效期
                    </th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6F86A8]">
                      状态
                    </th>
                    <th className="px-6 py-4 text-right text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6F86A8]">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1B2840]">
                  {filteredVouchers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-16 text-center text-sm text-[#8FA4C2]"
                      >
                        当前筛选下暂无 Voucher
                      </td>
                    </tr>
                  ) : (
                    filteredVouchers.map((voucher) => (
                      <tr
                        key={voucher.id}
                        className="transition-colors hover:bg-[#131F35]"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <code className="rounded bg-[#151F36] px-2 py-1 font-mono text-xs text-[#D5E0F0]">
                              {voucher.code}
                            </code>
                            <button
                              type="button"
                              onClick={() => copyCode(voucher.code)}
                              className="rounded p-1 text-[#8FA4C2] transition-colors hover:bg-[#1A2744] hover:text-white"
                            >
                              {copiedCode === voucher.code ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-[#4ADE80]" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#D5E0F0]">
                          {voucher.discountType}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#D5E0F0]">
                          {voucher.discountType === 'PERCENT'
                            ? `${voucher.discountValue}%`
                            : `RM ${voucher.discountValue}`}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#D5E0F0]">
                          {voucher.redeemedCount}
                          {voucher.maxRedemptions !== null
                            ? ` / ${voucher.maxRedemptions}`
                            : ' / ∞'}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-[#8FA4C2]">
                          {voucher.stripeCouponId || '—'}
                        </td>
                        <td className="px-6 py-4 text-xs text-[#8FA4C2]">
                          <div>{formatDateTime(voucher.validFrom)}</div>
                          <div>{formatDateTime(voucher.validTo)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${
                              voucher.isActive
                                ? 'border-[#244B37] bg-[#123125] text-[#4ADE80]'
                                : 'border-[#24324D] bg-[#151F36] text-[#8FA4C2]'
                            }`}
                          >
                            {voucher.isActive ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() =>
                              toggleVoucherStatus(voucher.id, !voucher.isActive)
                            }
                            disabled={isPending}
                            className="inline-flex items-center gap-2 rounded-xl border border-[#24324D] bg-[#151F36] px-3 py-2 text-sm text-[#E6EDF7] transition-colors hover:bg-[#1A2744] disabled:cursor-not-allowed disabled:opacity-60"
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
          </>
        )}
      </div>
    </div>
  )
}
