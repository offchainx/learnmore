'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Filter,
  Inbox,
  Loader2,
  MessageSquare,
  Search,
} from 'lucide-react'
import { FeedbackCategory, FeedbackStatus } from '@/types/feedback'
import { toast } from 'sonner'
import { PageHeroShell } from '@/components/shared/PageHeroShell'
import { PageHeroTitle } from '@/components/shared/PageHeroTitle'
import { SectionBlockHeader } from '@/components/shared/SectionBlockHeader'
import {
  pageKpiCardClass,
  pageSectionHeaderBandClass,
  pageSegmentedButtonCompactClass,
  pageSegmentedControlCompactClass,
  pageTableShellClass,
} from '@/components/shared/pageSurfaces'
import {
  pageHeroNumericValueClass,
  pageKickerClass,
  pageMetaTextClass,
} from '@/components/shared/pageTypography'

const statusStyles: Record<
  FeedbackStatus,
  { label: string; className: string; icon?: React.ReactNode }
> = {
  PENDING: {
    label: '待处理',
    className:
      'border-amber-200 dark:border-[#5C4520] bg-amber-50 dark:bg-[#3B2A10] text-amber-700 dark:text-[#FBBF24]',
    icon: <AlertCircle className="h-3 w-3" />,
  },
  IN_PROGRESS: {
    label: '处理中',
    className:
      'border-blue-200 dark:border-[#2B4470] bg-blue-50 dark:bg-[#18335E] text-blue-700 dark:text-[#60A5FA]',
  },
  RESOLVED: {
    label: '已解决',
    className:
      'border-green-200 dark:border-[#244B37] bg-green-50 dark:bg-[#123125] text-green-600 dark:text-[#4ADE80]',
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  REJECTED: {
    label: '已拒绝',
    className:
      'border-rose-200 dark:border-[#5C2B33] bg-rose-50 dark:bg-[#31151D] text-rose-600 dark:text-[#F87171]',
  },
  CLOSED: {
    label: '已关闭',
    className:
      'border-borderTone dark:border-[#24324D] bg-surface-subtle dark:bg-[#151F36] text-text-secondary dark:text-[#8FA4C2]',
  },
}

const categoryLabels: Record<FeedbackCategory, string> = {
  BUG: 'Bug',
  FEATURE: '功能请求',
  SUGGESTION: '建议',
  BILLING: '账单',
  CONTENT_ISSUE: '内容错误',
  OTHER: '其他',
}

type FeedbackOverviewWindow = '7D' | '30D' | 'ALL'

type FeedbackListItem = {
  id: string
  title: string
  content: string
  email: string
  category: FeedbackCategory
  status: FeedbackStatus
  createdAt: string
  user?: {
    username?: string | null
    email?: string | null
  } | null
}

type FeedbackOverviewMetric = {
  id: string
  title: string
  value: string
  caption: string
  meta: string
  trend: number | null
  trendLabel: string
}

type FeedbackOverview = {
  window: FeedbackOverviewWindow
  metrics: FeedbackOverviewMetric[]
  lastUpdated: string
}

interface FeedbackListProps {
  initialData: FeedbackListItem[]
  totalCount: number
  initialOverview?: FeedbackOverview
}

export function FeedbackList({
  initialData,
  totalCount,
  initialOverview,
}: FeedbackListProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | FeedbackStatus>(
    'ALL'
  )
  const [categoryFilter, setCategoryFilter] = useState<
    'ALL' | FeedbackCategory
  >('ALL')
  const [overviewWindow, setOverviewWindow] = useState<FeedbackOverviewWindow>(
    initialOverview?.window || '30D'
  )
  const [items, setItems] = useState(initialData)
  const [currentTotal, setCurrentTotal] = useState(totalCount)
  const [overview, setOverview] = useState<FeedbackOverview | null>(
    initialOverview || null
  )
  const [isListLoading, setIsListLoading] = useState(false)
  const [isOverviewLoading, setIsOverviewLoading] = useState(!initialOverview)
  const initialQueryKey = 'search=&status=ALL&category=ALL&limit=20&offset=0'
  const lastLoadedListKey = React.useRef<string>(
    initialData.length > 0 || totalCount >= 0 ? initialQueryKey : ''
  )
  const lastLoadedOverviewWindow = React.useRef<FeedbackOverviewWindow | ''>(
    initialOverview?.window || ''
  )

  const loadFeedbackList = useCallback(async () => {
    const queryParams = new URLSearchParams({
      search,
      status: statusFilter,
      category: categoryFilter,
      limit: '20',
      offset: '0',
    })
    const queryKey = queryParams.toString()

    if (lastLoadedListKey.current === queryKey) {
      return
    }

    lastLoadedListKey.current = queryKey
    setIsListLoading(true)

    try {
      const response = await fetch(`/api/admin/feedback/list?${queryKey}`, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error(`加载反馈列表失败: ${response.status}`)
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || '加载反馈列表失败')
      }

      setItems(result.data || [])
      setCurrentTotal(result.total || 0)
    } catch (error) {
      console.error('[FeedbackList] loadFeedbackList error:', error)
      lastLoadedListKey.current = ''
      toast.error(error instanceof Error ? error.message : '加载反馈列表失败')
    } finally {
      setIsListLoading(false)
    }
  }, [categoryFilter, search, statusFilter])

  const loadOverview = useCallback(async () => {
    if (lastLoadedOverviewWindow.current === overviewWindow) {
      return
    }

    lastLoadedOverviewWindow.current = overviewWindow
    setIsOverviewLoading(true)

    try {
      const response = await fetch(
        `/api/admin/feedback/overview?window=${overviewWindow}`,
        {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        }
      )

      if (!response.ok) {
        throw new Error(`加载反馈概览失败: ${response.status}`)
      }

      const result = await response.json()
      if (!result.success || !result.data) {
        throw new Error(result.error || '加载反馈概览失败')
      }

      setOverview(result.data as FeedbackOverview)
    } catch (error) {
      console.error('[FeedbackList] loadOverview error:', error)
      lastLoadedOverviewWindow.current = ''
      toast.error(error instanceof Error ? error.message : '加载反馈概览失败')
    } finally {
      setIsOverviewLoading(false)
    }
  }, [overviewWindow])

  useEffect(() => {
    void loadFeedbackList()
  }, [loadFeedbackList])

  useEffect(() => {
    void loadOverview()
  }, [loadOverview])

  const hasFilters =
    search.trim() !== '' || statusFilter !== 'ALL' || categoryFilter !== 'ALL'

  const resetFilters = () => {
    setSearch('')
    setStatusFilter('ALL')
    setCategoryFilter('ALL')
    lastLoadedListKey.current = ''
  }

  const overviewCards = (overview?.metrics || []).map((metric) => {
    if (metric.id === 'total') {
      return {
        ...metric,
        key: metric.id,
        icon: Inbox,
        iconClassName: 'text-[#60A5FA]',
        iconBgClassName: 'bg-blue-100 dark:bg-[#18335E]',
        glowClassName: 'bg-[#2563EB]/20',
        borderClassName: 'border-[#2B4470]',
      }
    }

    if (metric.id === 'pending') {
      return {
        ...metric,
        key: metric.id,
        icon: Clock3,
        iconClassName: 'text-[#FBBF24]',
        iconBgClassName: 'bg-amber-100 dark:bg-[#3B2A10]',
        glowClassName: 'bg-[#F59E0B]/20',
        borderClassName: 'border-[#5C4520]',
      }
    }

    if (metric.id === 'progress') {
      return {
        ...metric,
        key: metric.id,
        icon: Filter,
        iconClassName: 'text-[#C4B5FD]',
        iconBgClassName: 'bg-purple-100 dark:bg-[#2A1F4A]',
        glowClassName: 'bg-[#8B5CF6]/20',
        borderClassName: 'border-[#47306C]',
      }
    }

    return {
      ...metric,
      key: metric.id,
      icon: CheckCircle2,
      iconClassName: 'text-[#4ADE80]',
      iconBgClassName: 'bg-green-100 dark:bg-[#123125]',
      glowClassName: 'bg-[#22C55E]/20',
      borderClassName: 'border-[#244B37]',
    }
  })

  const windowOptions: Array<{
    key: FeedbackOverviewWindow
    label: string
  }> = [
    { key: '7D', label: '7 Days' },
    { key: '30D', label: '30 Days' },
    { key: 'ALL', label: 'All Time' },
  ]

  const getTrendDisplay = (trend: number | null) => {
    if (trend === null) {
      return {
        text: '累计',
        icon: null,
        className:
          'border-borderTone dark:border-[#24324D] bg-surface-subtle dark:bg-[#151F36] text-text-secondary dark:text-[#8FA4C2]',
      }
    }

    if (trend === 0) {
      return {
        text: '0%',
        icon: null,
        className:
          'border-borderTone dark:border-[#24324D] bg-surface-subtle dark:bg-[#151F36] text-text-secondary dark:text-[#8FA4C2]',
      }
    }

    const positive = trend > 0

    return {
      text: `${positive ? '+' : ''}${trend}%`,
      icon: positive ? ArrowUp : ArrowDown,
      className: positive
        ? 'border-green-200 dark:border-[#244B37] bg-green-50 dark:bg-[#123125] text-green-600 dark:text-[#86EFAC]'
        : 'border-rose-200 dark:border-[#5C2B33] bg-rose-50 dark:bg-[#31151D] text-rose-600 dark:text-[#FCA5A5]',
    }
  }

  return (
    <div className="space-y-3 text-foreground">
      <PageHeroShell
        className="sm:py-4.5 px-4 py-4 sm:px-5"
        title={
          <PageHeroTitle title="反馈中心" capsuleLabel="Inbox Console" />
        }
        subtitle="集中处理用户反馈、功能请求与内容问题，保持概览、筛选与工单处理在同一工作区内完成。"
        titleClassName="font-semibold"
      />

      <section className="space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <SectionBlockHeader
            title="反馈概览"
            description="以时间范围为基准查看反馈体量、待办压力与处理闭环效率。"
            className="flex-1"
          />

          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            <div className={pageSegmentedControlCompactClass}>
              {windowOptions.map((option) => {
                const isActive = option.key === overviewWindow
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setOverviewWindow(option.key)}
                    className={`${pageSegmentedButtonCompactClass} ${
                      isActive
                        ? 'dark:bg-white/12 bg-primary/10 text-primary shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] dark:text-white'
                        : 'text-text-secondary hover:text-text-primary dark:text-[#8FA4C2] dark:hover:text-white'
                    }`}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>

            {overview?.lastUpdated ? (
              <span className="font-mono text-xs text-text-secondary dark:text-[#9FB0C9]">
                更新于{' '}
                {new Date(overview.lastUpdated).toLocaleTimeString('zh-CN')}
              </span>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {overviewCards.map((card) => {
            const Icon = card.icon
            const trend = getTrendDisplay(card.trend)
            const TrendIcon = trend.icon
            return (
              <div
                key={card.key}
                className={`${pageKpiCardClass} ${card.borderClassName}`}
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
                    className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-gray-200 dark:border-white/10 ${card.iconBgClassName}`}
                  >
                    <Icon className={`h-5 w-5 ${card.iconClassName}`} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {isOverviewLoading ? (
          <p className="text-xs text-text-secondary dark:text-[#8FA4C2]">
            正在刷新反馈概览...
          </p>
        ) : null}
      </section>

      <div className={`${pageTableShellClass} flex min-h-[500px] flex-col`}>
        <div className={pageSectionHeaderBandClass}>
          <div className="flex flex-col gap-3">
            <SectionBlockHeader
              title="反馈队列"
              description="按状态、分类和关键词筛选反馈，进入详情页继续处理与回复。"
            />

            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="group relative w-full md:w-80">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#556B8A] transition-colors group-focus-within:text-[#60A5FA]"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="搜索标题、内容、邮箱或用户名..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      lastLoadedListKey.current = ''
                    }}
                    className="w-full rounded-2xl border border-borderTone bg-surface py-2.5 pl-10 pr-4 text-sm text-text-primary outline-none transition-all placeholder:text-text-tertiary focus:border-primary/50 focus:ring-2 focus:ring-primary/20 dark:border-[#24324D] dark:bg-[#151F36] dark:text-[#E6EDF7] dark:placeholder:text-[#6F86A8] dark:focus:border-[#33527B] dark:focus:ring-[#60A5FA]/20"
                  />
                </div>

                <div className="flex flex-row gap-3 overflow-x-auto pb-1 md:pb-0">
                  <div className="relative min-w-[150px]">
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(
                          e.target.value as 'ALL' | FeedbackStatus
                        )
                        lastLoadedListKey.current = ''
                      }}
                      className="w-full appearance-none rounded-2xl border border-borderTone bg-surface py-2.5 pl-3 pr-10 text-sm text-text-primary outline-none transition-all hover:bg-surface-subtle focus:border-primary/50 focus:ring-2 focus:ring-primary/20 dark:border-[#24324D] dark:bg-[#151F36] dark:text-[#E6EDF7] dark:hover:bg-[#1A2744] dark:focus:border-[#33527B] dark:focus:ring-[#60A5FA]/20"
                    >
                      <option value="ALL">状态: 全部</option>
                      {Object.entries(statusStyles).map(([value, config]) => (
                        <option key={value} value={value}>
                          {config.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6F86A8]"
                      size={16}
                    />
                  </div>

                  <div className="relative min-w-[150px]">
                    <select
                      value={categoryFilter}
                      onChange={(e) => {
                        setCategoryFilter(
                          e.target.value as 'ALL' | FeedbackCategory
                        )
                        lastLoadedListKey.current = ''
                      }}
                      className="w-full appearance-none rounded-2xl border border-borderTone bg-surface py-2.5 pl-3 pr-10 text-sm text-text-primary outline-none transition-all hover:bg-surface-subtle focus:border-primary/50 focus:ring-2 focus:ring-primary/20 dark:border-[#24324D] dark:bg-[#151F36] dark:text-[#E6EDF7] dark:hover:bg-[#1A2744] dark:focus:border-[#33527B] dark:focus:ring-[#60A5FA]/20"
                    >
                      <option value="ALL">分类: 全部</option>
                      {Object.entries(categoryLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6F86A8]"
                      size={16}
                    />
                  </div>
                </div>

                {hasFilters ? (
                  <button
                    onClick={resetFilters}
                    className="text-sm text-text-secondary transition-colors hover:text-text-primary dark:text-[#8FA4C2] dark:hover:text-white"
                  >
                    重置筛选
                  </button>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-3 xl:justify-end">
                <span className="text-sm text-text-secondary dark:text-[#8FA4C2]">
                  当前命中{' '}
                  <span className="font-semibold text-text-primary dark:text-[#F4F7FB]">
                    {currentTotal}
                  </span>{' '}
                  条反馈
                </span>
                <span className="text-xs text-text-tertiary dark:text-[#6F86A8]">
                  展示最近 20 条
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] border-collapse text-left">
            <thead>
              <tr className="border-b border-borderTone bg-surface-subtle dark:border-[#1B2840] dark:bg-[#101A2D]">
                <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-tertiary dark:text-[#6F86A8]">
                  用户信息
                </th>
                <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-tertiary dark:text-[#6F86A8]">
                  分类
                </th>
                <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-tertiary dark:text-[#6F86A8]">
                  反馈内容
                </th>
                <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-tertiary dark:text-[#6F86A8]">
                  状态
                </th>
                <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-tertiary dark:text-[#6F86A8]">
                  提交时间
                </th>
                <th className="px-6 py-4 text-right text-[11px] font-semibold uppercase tracking-[0.18em] text-text-tertiary dark:text-[#6F86A8]">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderTone dark:divide-[#1B2840]">
              {isListLoading ? (
                <tr>
                  <td colSpan={6} className="h-48">
                    <div className="flex flex-col items-center justify-center gap-3 text-text-secondary dark:text-[#8FA4C2]">
                      <Loader2 className="h-8 w-8 animate-spin text-primary dark:text-[#60A5FA]" />
                      <p className="text-sm">加载反馈列表...</p>
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="h-56">
                    <div className="flex flex-col items-center justify-center gap-3 text-text-secondary dark:text-[#8FA4C2]">
                      <MessageSquare className="h-10 w-10 opacity-30" />
                      <div className="space-y-1 text-center">
                        <p className="text-sm font-medium text-text-primary dark:text-[#D5E0F0]">
                          当前筛选下暂无反馈
                        </p>
                        <p className="text-xs text-text-tertiary dark:text-[#6F86A8]">
                          可以尝试切换状态、分类或清空关键词后重试。
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const status = statusStyles[item.status]
                  return (
                    <tr
                      key={item.id}
                      className="group transition-colors hover:bg-surface-subtle dark:hover:bg-[#131F35]"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-text-primary dark:text-[#F4F7FB]">
                            {item.user?.username || '匿名用户'}
                          </span>
                          <span className="font-mono text-xs text-text-secondary dark:text-[#8FA4C2]">
                            {item.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full border border-borderTone bg-surface-subtle px-2.5 py-1 text-xs text-text-primary dark:border-[#24324D] dark:bg-[#151F36] dark:text-[#D5E0F0]">
                          {categoryLabels[item.category]}
                        </span>
                      </td>
                      <td className="max-w-[420px] px-6 py-4">
                        <p className="truncate text-sm font-medium text-text-primary dark:text-[#F4F7FB]">
                          {item.title}
                        </p>
                        <p className="mt-1 truncate text-xs text-text-secondary dark:text-[#8FA4C2]">
                          {item.content}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${status.className}`}
                        >
                          {status.icon}
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-text-secondary dark:text-[#8FA4C2]">
                        {format(new Date(item.createdAt), 'yyyy-MM-dd HH:mm')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/admin/feedback/${item.id}`}>
                          <button className="inline-flex items-center gap-1 rounded-xl border border-borderTone bg-surface px-3 py-2 text-sm text-text-primary transition-colors hover:bg-surface-subtle dark:border-[#24324D] dark:bg-[#151F36] dark:text-[#E6EDF7] dark:hover:bg-[#1A2744]">
                            处理
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
