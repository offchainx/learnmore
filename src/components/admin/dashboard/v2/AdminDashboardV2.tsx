'use client'

import {
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  type WheelEvent as ReactWheelEvent,
} from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Key,
  Loader2,
  MessageSquare,
  RefreshCw,
  ShieldAlert,
  Ticket,
  Users,
} from 'lucide-react'
import { PageHeroShell } from '@/components/shared/PageHeroShell'
import { SectionBlockHeader } from '@/components/shared/SectionBlockHeader'
import { pageBadgeClass } from '@/components/shared/pageSurfaces'
import type {
  AdminDashboardAuditItem,
  AdminDashboardLoadState,
  AdminDashboardMetric,
  AdminDashboardRiskItem,
  AdminDashboardRole,
  AdminDashboardWindow,
  AdminDashboardWorkItem,
} from '@/types/admin-dashboard'

interface AdminDashboardV2Props {
  role: AdminDashboardRole
  kpis: AdminDashboardMetric[]
  workQueue: AdminDashboardWorkItem[]
  risks: AdminDashboardRiskItem[]
  audits: AdminDashboardAuditItem[]
  lastUpdated: string
  initialWindow?: AdminDashboardWindow
  initialState?: AdminDashboardLoadState
}

const ITEMS_PER_PAGE = 5

const shellClassName =
  'mx-auto w-full max-w-[1820px] space-y-2.5 rounded-[32px] border border-[#24324D] bg-[#0B1220] p-2.5 text-[#E6EDF7] sm:p-3'

const sectionClassName =
  'overflow-hidden rounded-[28px] border border-[#24324D] bg-[#0F172A]/96 shadow-[0_18px_40px_rgba(2,8,23,0.24)]'

const levelStyles = {
  normal: 'border border-[#334155] bg-[#152033] text-[#C7D2E3]',
  info: 'border border-[#244B82] bg-[#132540] text-[#93C5FD]',
  low: 'border border-[#244B82] bg-[#132540] text-[#93C5FD]',
  medium: 'border border-[#5A451B] bg-[#2E2410] text-[#FBBF24]',
  warning: 'border border-[#5A451B] bg-[#2E2410] text-[#FBBF24]',
  high: 'border border-[#5E2B32] bg-[#32171D] text-[#FB7185]',
  critical: 'border border-[#7F1D1D] bg-[#34161A] text-[#FCA5A5]',
} as const

const windowOptions: Array<{
  key: AdminDashboardWindow
  label: string
}> = [
  { key: 'TODAY', label: '今日' },
  { key: 'WEEK', label: '本周' },
  { key: 'MONTH', label: '本月' },
]

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

function Badge({
  children,
  level = 'normal',
}: {
  children: ReactNode
  level?: keyof typeof levelStyles
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]',
        levelStyles[level]
      )}
    >
      {children}
    </span>
  )
}

function Sparkline({
  data,
  color = '#60A5FA',
}: {
  data: number[]
  color?: string
}) {
  if (data.length < 2) return null

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const height = 34
  const width = 72
  const step = width / (data.length - 1)

  const points = data
    .map((value, index) => {
      const x = index * step
      const y = height - ((value - min) / range) * height
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function formatLastUpdated(lastUpdated: string) {
  return new Date(lastUpdated).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getTrendDisplay(trend: number) {
  if (trend === 0) {
    return {
      text: '0%',
      className: 'text-[#B2C3DA]',
      icon: null,
    }
  }

  const positive = trend > 0
  return {
    text: `${positive ? '+' : '-'}${Math.abs(trend)}%`,
    className: positive ? 'text-[#4ADE80]' : 'text-[#FB7185]',
    icon: positive ? ArrowUpRight : ArrowDownRight,
  }
}

function getKpiVisual(metric: AdminDashboardMetric) {
  switch (metric.id) {
    case 'kpi-active-users':
      return {
        icon: Users,
        iconClassName: 'text-[#60A5FA]',
        iconBgClassName: 'bg-[#18335E]',
        glowClassName: 'bg-[#2563EB]/20',
        borderClassName: 'border-[#2B4470]',
        hint: '关注今日活跃与近期访问波动。',
        sparklineColor: '#60A5FA',
      }
    case 'kpi-paid-users':
      return {
        icon: Ticket,
        iconClassName: 'text-[#C4B5FD]',
        iconBgClassName: 'bg-[#2A1F4A]',
        glowClassName: 'bg-[#8B5CF6]/20',
        borderClassName: 'border-[#47306C]',
        hint: '观察新增付费与存量转化表现。',
        sparklineColor: '#C084FC',
      }
    case 'kpi-completion':
      return {
        icon: CheckCircle2,
        iconClassName: 'text-[#4ADE80]',
        iconBgClassName: 'bg-[#123125]',
        glowClassName: 'bg-[#22C55E]/20',
        borderClassName: 'border-[#244B37]',
        hint: '用课程完成率判断学习推进效率。',
        sparklineColor: '#4ADE80',
      }
    case 'kpi-tickets':
      return {
        icon: MessageSquare,
        iconClassName: 'text-[#FBBF24]',
        iconBgClassName: 'bg-[#3B2A10]',
        glowClassName: 'bg-[#F59E0B]/20',
        borderClassName: 'border-[#5C4520]',
        hint: '反馈与报错队列的即时压力。',
        sparklineColor: '#FBBF24',
      }
    default:
      return {
        icon: ShieldAlert,
        iconClassName: 'text-[#F87171]',
        iconBgClassName: 'bg-[#31151D]',
        glowClassName: 'bg-[#EF4444]/20',
        borderClassName: 'border-[#5C2B33]',
        hint: '仅在异常波动时需要重点关注。',
        sparklineColor: '#F87171',
      }
  }
}

function getWorkItemMeta(item: AdminDashboardWorkItem) {
  if (item.type === 'review') {
    return {
      sourceLabel: '内容审核',
      sourceTone: 'info' as const,
      sourceHint: '来自题目纠错与内容审核队列',
      actionLabel: '去审核',
      actionTone: 'normal' as const,
    }
  }

  return {
    sourceLabel: '反馈中心',
    sourceTone: 'warning' as const,
    sourceHint: '来自用户反馈与工单处理队列',
    actionLabel: '去处理',
    actionTone: 'normal' as const,
  }
}

function getScopeLabel(window: AdminDashboardWindow) {
  return window === 'MONTH'
    ? '月度视角'
    : window === 'WEEK'
      ? '周度视角'
      : '今日视角'
}

function getTotalPages(total: number) {
  return Math.max(1, Math.ceil(total / ITEMS_PER_PAGE))
}

function getVisibleItems<T>(items: T[], page: number) {
  return items.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE)
}

function handleListWheel<T>(
  event: ReactWheelEvent<HTMLDivElement>,
  items: T[],
  setPage: Dispatch<SetStateAction<number>>
) {
  if (items.length <= ITEMS_PER_PAGE) return

  const direction = event.deltaY > 0 ? 1 : -1
  const maxPage = Math.ceil(items.length / ITEMS_PER_PAGE) - 1

  setPage((prev) => {
    const next = prev + direction
    return Math.max(0, Math.min(next, maxPage))
  })
}

function PageMeta({
  totalPages,
  page,
  countLabel,
}: {
  totalPages: number
  page: number
  countLabel: string
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {Array.from({ length: totalPages }).map((_, index) => (
          <div
            key={index}
            className={cn(
              'h-1.5 rounded-full transition-all',
              index === page ? 'w-4 bg-white' : 'w-1.5 bg-[#31445F]'
            )}
          />
        ))}
      </div>
      <span className="rounded-full bg-[#151F36] px-3 py-1 text-[11px] font-black tracking-[0.14em] text-[#8FA4C2]">
        {countLabel}
      </span>
    </div>
  )
}

function EmptySlots({
  count,
  tone = 'neutral',
}: {
  count: number
  tone?: 'neutral' | 'danger'
}) {
  const className =
    tone === 'danger'
      ? 'border-[#352028] bg-[#140F14] text-[#55303A]'
      : 'border-[#1B2840] bg-[#0E1729] text-[#31445F]'

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <li
          key={index}
          className={cn(
            'flex h-[64px] items-center justify-center rounded-[22px] border border-dashed',
            className
          )}
        >
          <span className="text-[11px] font-medium uppercase tracking-[0.14em]">
            已到列表底部
          </span>
        </li>
      ))}
    </>
  )
}

function Header({ window }: { window: AdminDashboardWindow }) {
  return (
    <PageHeroShell
      className="px-4 py-4 sm:px-5 sm:py-4.5"
      eyebrow={
        <div className={pageBadgeClass}>
          <ShieldAlert className="h-3 w-3 text-[#60A5FA]" />
          Command Center
        </div>
      }
      title="管理总览"
      subtitle="聚合今日待处理事项、风险信号与最近审计，作为后台管理的首屏工作台。"
      actions={
        <div className={pageBadgeClass}>
          <Calendar className="h-3.5 w-3.5 text-[#60A5FA]" />
          {getScopeLabel(window)}
        </div>
      }
    />
  )
}

function KpiRow({
  items,
  window,
  lastUpdated,
  loading,
  onRefresh,
  onWindowChange,
}: {
  items: AdminDashboardMetric[]
  window: AdminDashboardWindow
  lastUpdated: string
  loading: boolean
  onRefresh: () => void
  onWindowChange: (next: AdminDashboardWindow) => void
}) {
  return (
    <section className="space-y-2.5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <SectionBlockHeader
          title="管理概览"
          description="保留后台当下最关键的业务体量、推进效率和处理压力指标。"
          className="flex-1"
        />

        <div className="flex flex-wrap items-center gap-3 md:justify-end">
          <div className="inline-flex items-center rounded-2xl border border-[#24324D] bg-[#121C32] p-1">
            {windowOptions.map((option) => {
              const isActive = option.key === window
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => onWindowChange(option.key)}
                  className={cn(
                    'rounded-xl px-5 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-white/12 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]'
                      : 'text-[#8FA4C2] hover:text-white'
                  )}
                >
                  {option.label}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-[#9FB0C9]">
              更新于 {formatLastUpdated(lastUpdated)}
            </span>
            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex items-center gap-2 rounded-xl border border-[#24324D] bg-[#151F36] px-3 py-2 text-sm text-[#E6EDF7] transition-colors hover:bg-[#1A2744]"
            >
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
              刷新
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => {
          const visual = getKpiVisual(item)
          const trend = getTrendDisplay(item.trend)
          const TrendIcon = trend.icon
          const Icon = visual.icon

          return (
            <div
              key={item.id}
              className={cn(
                'relative overflow-hidden rounded-[24px] border bg-[linear-gradient(180deg,rgba(17,26,46,0.98),rgba(11,18,32,0.96))] p-4 shadow-[0_18px_40px_rgba(2,8,23,0.38)]',
                visual.borderClassName
              )}
            >
              <div
                className={cn(
                  'absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl',
                  visual.glowClassName
                )}
              />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-70" />

              <div className="relative flex h-full items-start justify-between gap-4">
                <div className="flex min-h-[112px] flex-1 flex-col justify-between gap-3">
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8EA3C0]">
                      {item.title}
                    </p>
                    <div className="flex items-end gap-2">
                      <p className="text-[2rem] font-semibold leading-none tracking-tight text-[#F8FBFF]">
                        {item.value}
                      </p>
                      <span className="pb-1 text-[11px] text-[#8EA3C0]">
                        {item.trendLabel}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          'inline-flex items-center text-xs font-medium',
                          trend.className
                        )}
                      >
                        {TrendIcon ? (
                          <TrendIcon className="mr-1 h-3.5 w-3.5" />
                        ) : null}
                        {trend.text}
                      </span>
                      {item.exception ? (
                        <Badge level="warning">{item.exception}</Badge>
                      ) : null}
                    </div>
                    <p className="line-clamp-2 max-w-[20rem] text-sm leading-6 text-[#B2C3DA]">
                      {visual.hint}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <div
                    className={cn(
                      'relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10',
                      visual.iconBgClassName
                    )}
                  >
                    <Icon className={cn('h-5 w-5', visual.iconClassName)} />
                  </div>
                  <div className="opacity-80">
                    <Sparkline
                      data={item.sparklineData}
                      color={visual.sparklineColor}
                    />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function PriorityQueue({ items }: { items: AdminDashboardWorkItem[] }) {
  const [page, setPage] = useState(0)
  const totalPages = getTotalPages(items.length)
  const visibleItems = getVisibleItems(items, page)

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages - 1))
  }, [totalPages])

  return (
    <section className={sectionClassName}>
      <div className="border-b border-[#1B2840] bg-[#0F1A2F] px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <SectionBlockHeader
            title={
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
                <span>今日必须处理</span>
              </div>
            }
            description="按处理时限优先，先处理已超时和即将超时的事项。"
            className="flex-1"
          />
          <PageMeta
            totalPages={totalPages}
            page={page}
            countLabel={`${items.length} 条事项`}
          />
        </div>
      </div>

      <div
        className="min-h-[412px] p-4"
        onWheel={(event) => handleListWheel(event, items, setPage)}
      >
        {items.length === 0 ? (
          <div className="flex h-full min-h-[364px] flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#244B37] bg-[#123125] text-[#4ADE80]">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-[#E6EDF7]">
                当前没有积压事项
              </p>
              <p className="text-sm text-[#8FA4C2]">
                今日工作队列已清空，可转入常规巡检。
              </p>
            </div>
          </div>
        ) : (
          <ul className="space-y-3">
            {visibleItems.map((item, index) => {
              const meta = getWorkItemMeta(item)
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="group block rounded-[22px] border border-[#1B2840] bg-[#121C32] px-4 py-3.5 transition-all duration-300 animate-in hover:border-[#2A466C] hover:bg-[#15233A]"
                    style={{ animationDelay: `${index * 45}ms` }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge level={meta.sourceTone}>
                            {meta.sourceLabel}
                          </Badge>
                          <Badge level={meta.actionTone}>
                            {meta.actionLabel}
                          </Badge>
                        </div>
                        <p className="line-clamp-2 text-sm font-medium leading-6 text-[#F4F7FB] transition-colors group-hover:text-white">
                          {item.title}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-[#8FA4C2]">
                          <span>{meta.sourceHint}</span>
                          <span className="text-[#4B5D7A]">/</span>
                          <span>处理动作：{meta.actionLabel}</span>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <Badge level={item.slaLevel}>{item.sla}</Badge>
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-[#60A5FA]">
                          {meta.actionLabel}
                          <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              )
            })}
            {visibleItems.length < ITEMS_PER_PAGE ? (
              <EmptySlots count={ITEMS_PER_PAGE - visibleItems.length} />
            ) : null}
          </ul>
        )}
      </div>
    </section>
  )
}

function RiskPanel({ items }: { items: AdminDashboardRiskItem[] }) {
  const [page, setPage] = useState(0)
  const totalPages = getTotalPages(items.length)
  const visibleItems = getVisibleItems(items, page)
  const hasRisk = items.length > 0

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages - 1))
  }, [totalPages])

  return (
    <section
      className={cn(
        sectionClassName,
        hasRisk ? 'border-[#5C2B33]' : 'border-[#244B37] bg-[#0F172A]/90'
      )}
    >
      <div
        className={cn(
          'border-b px-5 py-5 sm:px-6',
          hasRisk
            ? 'border-[#5C2B33] bg-[#241318]'
            : 'border-[#1F3A2D] bg-[#101F1B]'
        )}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <SectionBlockHeader
            title={
              <div
                className={cn(
                  'flex items-center gap-2',
                  hasRisk ? 'text-[#FCA5A5]' : 'text-[#E6EDF7]'
                )}
              >
                <ShieldAlert
                  className={cn(
                    'h-4 w-4',
                    hasRisk ? 'text-[#F87171]' : 'text-[#4ADE80]'
                  )}
                />
                <span>最近告警</span>
              </div>
            }
            description="仅展示安全、权限与敏感操作相关的风险信号。"
            className="flex-1"
          />
          <PageMeta
            totalPages={totalPages}
            page={page}
            countLabel={hasRisk ? `${items.length} 条风险` : '系统安全'}
          />
        </div>
      </div>

      <div
        className="min-h-[412px] p-4"
        onWheel={(event) => handleListWheel(event, items, setPage)}
      >
        {!hasRisk ? (
          <div className="flex h-full min-h-[364px] flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#244B37] bg-[#123125] text-[#4ADE80]">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-[#E6EDF7]">
                当前没有新增告警
              </p>
              <p className="text-sm text-[#8FA4C2]">
                系统运行稳定，保持常规权限巡检即可。
              </p>
            </div>
          </div>
        ) : (
          <ul className="space-y-3">
            {visibleItems.map((item, index) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="group block rounded-[22px] border border-[#352028] bg-[#1A131A] px-4 py-3.5 transition-all duration-300 animate-in hover:border-[#5C2B33] hover:bg-[#24171D]"
                  style={{ animationDelay: `${index * 45}ms` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-2">
                      <p className="line-clamp-2 text-sm font-medium leading-6 text-[#F4F7FB]">
                        {item.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#8FA4C2]">
                        <span>{item.source}</span>
                        <span className="text-[#4B5D7A]">/</span>
                        <span>{item.time}</span>
                      </div>
                    </div>
                    <Badge level={item.level}>{item.level}</Badge>
                  </div>
                </Link>
              </li>
            ))}
            {visibleItems.length < ITEMS_PER_PAGE ? (
              <EmptySlots
                count={ITEMS_PER_PAGE - visibleItems.length}
                tone="danger"
              />
            ) : null}
          </ul>
        )}
      </div>
    </section>
  )
}

function AccessPlaceholder() {
  return (
    <section className={sectionClassName}>
      <div className="min-h-[412px] p-4">
        <div className="flex h-full min-h-[364px] flex-col items-center justify-center gap-3 px-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#24324D] bg-[#151F36] text-[#8FA4C2]">
            <Key className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-[#E6EDF7]">
              当前角色不展示风险面板
            </p>
            <p className="text-sm text-[#8FA4C2]">
              教师角色仅保留工作队列与审计信息。
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function AuditTable({ items }: { items: AdminDashboardAuditItem[] }) {
  const [page, setPage] = useState(0)
  const totalPages = getTotalPages(items.length)
  const visibleItems = getVisibleItems(items, page)

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages - 1))
  }, [totalPages])

  return (
    <section className={sectionClassName}>
      <div className="border-b border-[#1B2840] bg-[#0F1A2F] px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <SectionBlockHeader
            title="最近操作审计"
            description="默认展示最近 5 条，滚动列表切页查看更早记录。"
            className="flex-1"
          />
          <div className="flex items-center gap-3">
            <PageMeta
              totalPages={totalPages}
              page={page}
              countLabel={`${items.length} 条记录`}
            />
            <Link
              href="/admin/permissions"
              className="text-sm font-medium text-[#60A5FA] transition-colors hover:text-[#93C5FD]"
            >
              查看全部日志
            </Link>
          </div>
        </div>
      </div>

      <div
        className="min-h-[412px] p-4"
        onWheel={(event) => handleListWheel(event, items, setPage)}
      >
        {items.length === 0 ? (
          <div className="flex h-full min-h-[364px] flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#24324D] bg-[#151F36] text-[#8FA4C2]">
              <Key className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-[#E6EDF7]">
                当前时间范围内暂无审计记录
              </p>
              <p className="text-sm text-[#8FA4C2]">
                滚动切页后将展示更早日志。
              </p>
            </div>
          </div>
        ) : (
          <ul className="space-y-3">
            {visibleItems.map((log, index) => (
              <li
                key={log.id}
                className="rounded-[22px] border border-[#1B2840] bg-[#121C32] px-4 py-3.5 duration-300 animate-in"
                style={{ animationDelay: `${index * 45}ms` }}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1E293B] text-[11px] font-semibold text-[#E6EDF7]">
                        {log.actor.charAt(0).toUpperCase()}
                      </div>
                      <span className="truncate font-medium text-[#F4F7FB]">
                        {log.actor}
                      </span>
                    </div>
                    <span className="shrink-0 font-mono text-xs text-[#6F86A8]">
                      {log.time}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge level={log.level}>{log.action}</Badge>
                    <span className="font-mono text-xs text-[#B2C3DA]">
                      {log.target}
                    </span>
                  </div>
                </div>
              </li>
            ))}
            {visibleItems.length < ITEMS_PER_PAGE ? (
              <EmptySlots count={ITEMS_PER_PAGE - visibleItems.length} />
            ) : null}
          </ul>
        )}
      </div>
    </section>
  )
}

export default function AdminDashboardV2({
  role,
  kpis,
  workQueue,
  risks,
  audits,
  lastUpdated,
  initialWindow = 'TODAY',
  initialState = 'SUCCESS',
}: AdminDashboardV2Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [window, setWindow] = useState<AdminDashboardWindow>(initialWindow)
  const [state, setState] = useState<AdminDashboardLoadState>(initialState)
  const [loading, setLoading] = useState(false)

  const isVisible = (visibleTo: AdminDashboardRole[]) =>
    visibleTo.includes(role)

  const visibleKpis = useMemo(
    () => kpis.filter((item) => isVisible(item.visibleTo)),
    [kpis, role]
  )
  const visibleWorkQueue = useMemo(
    () => workQueue.filter((item) => isVisible(item.visibleTo)),
    [role, workQueue]
  )
  const visibleRisks = useMemo(
    () => risks.filter((item) => isVisible(item.visibleTo)),
    [risks, role]
  )
  const visibleAudits = useMemo(
    () => audits.filter((item) => isVisible(item.visibleTo)),
    [audits, role]
  )
  const featuredKpis = useMemo(() => {
    const primary = visibleKpis.filter(
      (item) => item.id !== 'kpi-system-errors'
    )
    return (primary.length > 0 ? primary : visibleKpis).slice(0, 4)
  }, [visibleKpis])

  useEffect(() => {
    setWindow(initialWindow)
  }, [initialWindow])

  useEffect(() => {
    setState(initialState)
    setLoading(false)
  }, [initialState, kpis, workQueue, risks, audits, lastUpdated])

  const handleRefresh = () => {
    setLoading(true)
    router.refresh()
  }

  const handleWindowChange = (nextWindow: AdminDashboardWindow) => {
    if (nextWindow === window) return

    setWindow(nextWindow)
    setLoading(true)
    const params = new URLSearchParams(searchParams.toString())
    params.set('window', nextWindow)
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname)
  }

  if (state === 'LOADING') {
    return (
      <div className="px-3 py-2 sm:px-4 sm:py-3">
        <div
          className={cn(
            shellClassName,
            'flex min-h-[480px] items-center justify-center'
          )}
        >
          <Loader2 className="h-8 w-8 animate-spin text-[#60A5FA]" />
        </div>
      </div>
    )
  }

  if (state === 'ERROR') {
    return (
      <div className="px-3 py-2 sm:px-4 sm:py-3">
        <div
          className={cn(
            shellClassName,
            'flex min-h-[480px] items-center justify-center'
          )}
        >
          <div className="space-y-4 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-[#F87171]" />
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-[#F4F7FB]">
                管理仪表盘加载失败
              </h2>
              <p className="text-sm text-[#8FA4C2]">
                请先刷新重试，再检查后台数据源与权限日志状态。
              </p>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center rounded-xl border border-[#24324D] bg-[#151F36] px-4 py-2 text-sm text-[#E6EDF7] transition-colors hover:bg-[#1A2744]"
            >
              重试
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-3 py-2 sm:px-4 sm:py-3">
      <div className={shellClassName}>
        <Header window={window} />

        <KpiRow
          items={featuredKpis}
          window={window}
          lastUpdated={lastUpdated}
          loading={loading}
          onRefresh={handleRefresh}
          onWindowChange={handleWindowChange}
        />

        <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
          <PriorityQueue items={visibleWorkQueue} />
          {role === 'ADMIN' ? (
            <RiskPanel items={visibleRisks} />
          ) : (
            <AccessPlaceholder />
          )}
          <AuditTable items={visibleAudits} />
        </div>
      </div>
    </div>
  )
}
