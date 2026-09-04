'use client'

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@/components/ui/sheet'
import { useRouter, useSearchParams } from 'next/navigation'
import { format } from 'date-fns'
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Filter,
  Inbox,
  Loader2,
  MessageSquare,
  RefreshCw,
  Search,
  X,
} from 'lucide-react'
import { FeedbackCategory, FeedbackStatus } from '@prisma/client'
import { toast } from 'sonner'
import { PageEmptyState } from '@/components/shared/PageEmptyState'
import { SectionBlockHeader } from '@/components/shared/SectionBlockHeader'
import PaginationAnt from '@/components/ui/pagination-ant'
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
import { Button } from '@/components/ui/button'
import type { FeedbackDetailData } from './FeedbackDetailView'
import { FeedbackDetailView } from './FeedbackDetailView'

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

type FeedbackSheetErrorKind = 'forbidden' | 'not-found' | 'error'

type FeedbackSheetError = {
  kind: FeedbackSheetErrorKind
  title: string
  description: string
}

interface FeedbackListProps {
  initialData: FeedbackListItem[]
  totalCount: number
  initialPage: number
  pageSize: number
  initialSearch?: string
  initialStatus?: 'ALL' | FeedbackStatus
  initialCategory?: 'ALL' | FeedbackCategory
  initialOverview?: FeedbackOverview
}

export function FeedbackList({
  initialData,
  totalCount,
  initialPage,
  pageSize,
  initialSearch = '',
  initialStatus = 'ALL',
  initialCategory = 'ALL',
  initialOverview,
}: FeedbackListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [selectedFeedbackId, setSelectedFeedbackId] = useState<string | null>(
    null
  )
  const [sheetPreviewTitle, setSheetPreviewTitle] = useState<string | null>(
    null
  )
  const [isFeedbackSheetOpen, setIsFeedbackSheetOpen] = useState(false)
  const [sheetData, setSheetData] = useState<FeedbackDetailData | null>(null)
  const [isSheetLoading, setIsSheetLoading] = useState(false)
  const [sheetError, setSheetError] = useState<FeedbackSheetError | null>(null)
  const [search, setSearch] = useState(initialSearch)
  const [statusFilter, setStatusFilter] = useState<'ALL' | FeedbackStatus>(
    initialStatus
  )
  const [categoryFilter, setCategoryFilter] = useState<
    'ALL' | FeedbackCategory
  >(initialCategory)
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
  const [isRefreshing, startRefresh] = useTransition()

  const currentPage = Math.max(
    1,
    Number.parseInt(searchParams.get('page') || String(initialPage), 10) || 1
  )
  const currentPageSize = Math.max(
    1,
    Number.parseInt(searchParams.get('pageSize') || String(pageSize), 10) ||
      pageSize
  )
  const initialQueryKey = `search=${encodeURIComponent(initialSearch)}&status=${initialStatus}&category=${initialCategory}&limit=${currentPageSize}&offset=${
    (initialPage - 1) * currentPageSize
  }`
  const lastLoadedListKey = React.useRef<string>(
    initialData.length > 0 || totalCount >= 0 ? initialQueryKey : ''
  )
  const lastLoadedOverviewWindow = React.useRef<FeedbackOverviewWindow | ''>(
    initialOverview?.window || ''
  )
  const totalPages = Math.max(1, Math.ceil(currentTotal / currentPageSize))

  const updateQueryInUrl = useCallback(
    (
      nextValues: {
        search?: string
        status?: 'ALL' | FeedbackStatus
        category?: 'ALL' | FeedbackCategory
        page?: number
        pageSize?: number
      },
      mode: 'push' | 'replace' = 'push'
    ) => {
      const params = new URLSearchParams(searchParams.toString())
      const nextSearch = nextValues.search ?? search
      const nextStatus = nextValues.status ?? statusFilter
      const nextCategory = nextValues.category ?? categoryFilter
      const nextPage = nextValues.page ?? currentPage
      const nextPageSize = nextValues.pageSize ?? currentPageSize

      if (nextSearch.trim()) {
        params.set('search', nextSearch.trim())
      } else {
        params.delete('search')
      }

      if (nextStatus !== 'ALL') {
        params.set('status', nextStatus)
      } else {
        params.delete('status')
      }

      if (nextCategory !== 'ALL') {
        params.set('category', nextCategory)
      } else {
        params.delete('category')
      }

      if (nextPage <= 1) {
        params.delete('page')
      } else {
        params.set('page', nextPage.toString())
      }

      if (nextPageSize === 20) {
        params.delete('pageSize')
      } else {
        params.set('pageSize', nextPageSize.toString())
      }

      const query = params.toString()
      const target = query ? `?${query}` : '?'
      if (mode === 'replace') {
        router.replace(target, { scroll: false })
      } else {
        router.push(target, { scroll: false })
      }
    },
    [
      categoryFilter,
      currentPage,
      currentPageSize,
      router,
      search,
      searchParams,
      statusFilter,
    ]
  )

  useEffect(() => {
    const urlSearch = searchParams.get('search') || ''
    const urlStatus = searchParams.get('status')
    const urlCategory = searchParams.get('category')

    const nextStatus =
      urlStatus && urlStatus !== 'ALL' && urlStatus in FeedbackStatus
        ? FeedbackStatus[urlStatus as keyof typeof FeedbackStatus]
        : 'ALL'
    const nextCategory =
      urlCategory && urlCategory !== 'ALL' && urlCategory in FeedbackCategory
        ? FeedbackCategory[urlCategory as keyof typeof FeedbackCategory]
        : 'ALL'

    setSearch(urlSearch)
    setStatusFilter(nextStatus)
    setCategoryFilter(nextCategory)
  }, [searchParams])

  const loadFeedbackList = useCallback(async () => {
    const offset = (currentPage - 1) * currentPageSize
    const queryParams = new URLSearchParams({
      search,
      status: statusFilter,
      category: categoryFilter,
      limit: currentPageSize.toString(),
      offset: offset.toString(),
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

      const nextTotal = result.total || 0
      const nextTotalPages = Math.max(1, Math.ceil(nextTotal / currentPageSize))
      if (currentPage > nextTotalPages) {
        lastLoadedListKey.current = ''
        updateQueryInUrl({ page: nextTotalPages }, 'push')
        return
      }

      setItems(result.data || [])
      setCurrentTotal(nextTotal)
    } catch (error) {
      console.error('[FeedbackList] loadFeedbackList error:', error)
      lastLoadedListKey.current = ''
      toast.error(error instanceof Error ? error.message : '加载反馈列表失败')
    } finally {
      setIsListLoading(false)
    }
  }, [
    categoryFilter,
    currentPage,
    currentPageSize,
    search,
    statusFilter,
    updateQueryInUrl,
  ])

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

  const loadFeedbackDetailForSheet = useCallback(async (id: string) => {
    setIsSheetLoading(true)
    setSheetError(null)
    try {
      const response = await fetch(`/api/admin/feedback/detail/${id}`, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      })
      const result = await response.json().catch(() => null)

      if (!response.ok || !result?.success || !result?.data) {
        const error = new Error(
          result?.error || '加载反馈详情失败'
        ) as Error & {
          status?: number
        }
        error.status = response.status
        throw error
      }

      setSheetData(result.data)
    } catch (error) {
      console.error('[FeedbackList] loadFeedbackDetailForSheet error:', error)
      const errorStatus =
        typeof error === 'object' && error && 'status' in error
          ? Number((error as { status?: number }).status)
          : undefined
      const message =
        error instanceof Error ? error.message : '加载反馈详情失败'
      if (errorStatus === 401 || errorStatus === 403) {
        setSheetError({
          kind: 'forbidden',
          title: '没有权限查看这条反馈',
          description:
            '当前登录状态无法访问该工单。请重新登录管理员账号后再试，或返回列表查看其他反馈。',
        })
      } else if (errorStatus === 404) {
        setSheetError({
          kind: 'not-found',
          title: '反馈不存在或已被删除',
          description:
            '该工单可能已经被归档、删除，或链接已过期。你可以返回列表继续处理其他反馈。',
        })
      } else {
        setSheetError({
          kind: 'error',
          title: '反馈详情加载失败',
          description:
            message ||
            '详情数据暂时不可用，可能是网络波动或服务异常。请稍后重试。',
        })
      }
      setSheetData(null)
    } finally {
      setIsSheetLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadFeedbackList()
  }, [loadFeedbackList])

  useEffect(() => {
    void loadOverview()
  }, [loadOverview])

  useEffect(() => {
    if (!isFeedbackSheetOpen || !selectedFeedbackId) {
      return
    }

    void loadFeedbackDetailForSheet(selectedFeedbackId)
  }, [isFeedbackSheetOpen, loadFeedbackDetailForSheet, selectedFeedbackId])

  const hasFilters =
    search.trim() !== '' || statusFilter !== 'ALL' || categoryFilter !== 'ALL'

  const resetFilters = () => {
    setSearch('')
    setStatusFilter('ALL')
    setCategoryFilter('ALL')
    lastLoadedListKey.current = ''
    updateQueryInUrl(
      { search: '', status: 'ALL', category: 'ALL', page: 1 },
      'replace'
    )
  }

  const refreshAll = () => {
    lastLoadedListKey.current = ''
    lastLoadedOverviewWindow.current = ''
    startRefresh(() => {
      router.refresh()
    })
  }

  const refreshSheet = useCallback(() => {
    if (!selectedFeedbackId) return
    void loadFeedbackDetailForSheet(selectedFeedbackId)
  }, [loadFeedbackDetailForSheet, selectedFeedbackId])

  const handleAfterSheetSubmit = useCallback(() => {
    lastLoadedListKey.current = ''
    lastLoadedOverviewWindow.current = ''
    void loadFeedbackList()
    void loadOverview()
  }, [loadFeedbackList, loadOverview])

  const goToPage = (nextPage: number) => {
    const safePage = Math.min(Math.max(nextPage, 1), totalPages)
    if (safePage === currentPage) return
    lastLoadedListKey.current = ''
    updateQueryInUrl({ page: safePage }, 'push')
  }

  const handlePaginationChange = (nextPage: number, nextPageSize: number) => {
    if (nextPageSize !== currentPageSize) {
      lastLoadedListKey.current = ''
      updateQueryInUrl({ page: 1, pageSize: nextPageSize }, 'push')
      return
    }

    goToPage(nextPage)
  }

  const openFeedback = (id: string, title: string) => {
    setSelectedFeedbackId(id)
    setSheetPreviewTitle(title)
    setSheetData(null)
    setSheetError(null)
    setIsFeedbackSheetOpen(true)
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

  const sheetTitle = useMemo(() => {
    if (sheetData?.title) return sheetData.title
    if (sheetPreviewTitle) return sheetPreviewTitle
    return '反馈详情'
  }, [sheetData?.title, sheetPreviewTitle])

  const handleCloseSheet = useCallback(() => {
    setIsFeedbackSheetOpen(false)
    setSelectedFeedbackId(null)
    setSheetData(null)
    setSheetError(null)
    setSheetPreviewTitle(null)
  }, [])

  return (
    <>
      <div className="space-y-3 text-foreground">
        <section className="space-y-3">
          <div className="flex flex-col gap-3 tablet:flex-row tablet:items-center tablet:justify-between">
            <SectionBlockHeader
              title="反馈概览"
              description="以时间范围为基准查看反馈体量、待办压力与处理闭环效率。"
              className="flex-1"
            />

            <div className="flex flex-wrap items-center gap-3 tablet:justify-end">
              <button
                type="button"
                onClick={refreshAll}
                disabled={isRefreshing}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-borderTone bg-surface px-4 text-sm font-medium text-text-primary transition-colors hover:bg-surface-subtle hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#24324D] dark:bg-[#151F36] dark:text-[#E6EDF7] dark:hover:bg-[#1A2744]"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
                />
                刷新
              </button>

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

          <div className="grid gap-3 tablet:grid-cols-2 desktop:grid-cols-4">
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
                    <div className="flex min-h-[96px] flex-1 flex-col justify-between gap-3 desktop:min-h-[112px]">
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

        <div className={`${pageTableShellClass} flex min-h-[420px] flex-col desktop:min-h-[500px]`}>
          <div className={pageSectionHeaderBandClass}>
            <div className="flex flex-col gap-3">
              <SectionBlockHeader
                title="反馈队列"
                description="按状态、分类和关键词筛选反馈，在右侧工作台内继续处理与回复。"
              />

              <div className="flex flex-col gap-3 desktop:flex-row desktop:items-center desktop:justify-between">
                <div className="flex flex-col gap-3 tablet:flex-row tablet:items-center">
                  <div className="group relative w-full tablet:w-80">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#556B8A] transition-colors group-focus-within:text-[#60A5FA]"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="搜索标题、内容、邮箱或用户名..."
                      value={search}
                      onChange={(e) => {
                        lastLoadedListKey.current = ''
                        const nextSearch = e.target.value
                        setSearch(nextSearch)
                        updateQueryInUrl(
                          {
                            search: nextSearch,
                            status: statusFilter,
                            category: categoryFilter,
                            page: 1,
                          },
                          'replace'
                        )
                      }}
                      className="w-full rounded-2xl border border-borderTone bg-surface py-2.5 pl-10 pr-4 text-sm text-text-primary outline-none transition-all placeholder:text-text-tertiary focus:border-primary/50 focus:ring-2 focus:ring-primary/20 dark:border-[#24324D] dark:bg-[#151F36] dark:text-[#E6EDF7] dark:placeholder:text-[#6F86A8] dark:focus:border-[#33527B] dark:focus:ring-[#60A5FA]/20"
                    />
                  </div>

                  <div className="flex flex-row gap-3 overflow-x-auto pb-1 tablet:pb-0">
                    <div className="relative min-w-[132px] tablet:min-w-[150px]">
                      <select
                        value={statusFilter}
                        onChange={(e) => {
                          lastLoadedListKey.current = ''
                          const nextStatus = e.target.value as
                            | 'ALL'
                            | FeedbackStatus
                          setStatusFilter(nextStatus)
                          updateQueryInUrl(
                            {
                              search,
                              status: nextStatus,
                              category: categoryFilter,
                              page: 1,
                            },
                            'replace'
                          )
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

                    <div className="relative min-w-[132px] tablet:min-w-[150px]">
                      <select
                        value={categoryFilter}
                        onChange={(e) => {
                          lastLoadedListKey.current = ''
                          const nextCategory = e.target.value as
                            | 'ALL'
                            | FeedbackCategory
                          setCategoryFilter(nextCategory)
                          updateQueryInUrl(
                            {
                              search,
                              status: statusFilter,
                              category: nextCategory,
                              page: 1,
                            },
                            'replace'
                          )
                        }}
                        className="w-full appearance-none rounded-2xl border border-borderTone bg-surface py-2.5 pl-3 pr-10 text-sm text-text-primary outline-none transition-all hover:bg-surface-subtle focus:border-primary/50 focus:ring-2 focus:ring-primary/20 dark:border-[#24324D] dark:bg-[#151F36] dark:text-[#E6EDF7] dark:hover:bg-[#1A2744] dark:focus:border-[#33527B] dark:focus:ring-[#60A5FA]/20"
                      >
                        <option value="ALL">分类: 全部</option>
                        {Object.entries(categoryLabels).map(
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

                  {hasFilters ? (
                    <button
                      onClick={resetFilters}
                      className="text-sm text-text-secondary transition-colors hover:text-text-primary dark:text-[#8FA4C2] dark:hover:text-white"
                    >
                      重置筛选
                    </button>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-3 desktop:justify-end">
                  <span className="text-sm text-text-secondary dark:text-[#8FA4C2]">
                    当前命中{' '}
                    <span className="font-semibold text-text-primary dark:text-[#F4F7FB]">
                      {currentTotal}
                    </span>{' '}
                    条反馈
                  </span>
                  <span className="text-xs text-text-tertiary dark:text-[#6F86A8]">
                    第 {currentPage} 页 / 共 {totalPages} 页，每页{' '}
                    {currentPageSize} 条
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] border-collapse text-left desktop:min-w-0">
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
                </tr>
              </thead>
              <tbody className="divide-y divide-borderTone dark:divide-[#1B2840]">
                {isListLoading ? (
                  <tr>
                    <td colSpan={5} className="h-48">
                      <div className="flex flex-col items-center justify-center gap-3 text-text-secondary dark:text-[#8FA4C2]">
                        <Loader2 className="h-8 w-8 animate-spin text-primary dark:text-[#60A5FA]" />
                        <p className="text-sm">加载反馈列表...</p>
                      </div>
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="h-56">
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
                        role="button"
                        tabIndex={0}
                        aria-label={`处理反馈 ${item.title}`}
                        onClick={() => openFeedback(item.id, item.title)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            openFeedback(item.id, item.title)
                          }
                        }}
                        className="group cursor-pointer transition-colors hover:bg-surface-subtle focus-visible:bg-surface-subtle focus-visible:outline-none dark:hover:bg-[#131F35] dark:focus-visible:bg-[#131F35]"
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
                        <td className="max-w-[320px] px-6 py-4 desktop:max-w-[420px]">
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
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-borderTone bg-surface-subtle px-6 py-4 text-sm dark:border-[#1B2840] dark:bg-[#101A2D]">
            <div className="text-xs text-text-secondary dark:text-[#8FA4C2]">
              第 {currentPage} 页 / 共 {totalPages} 页
            </div>
            <PaginationAnt
              current={currentPage}
              total={Math.max(1, currentTotal)}
              pageSize={currentPageSize}
              showSizeChanger
              pageSizeOptions={['10', '20', '50']}
              disabled={isListLoading}
              onChange={(nextPage, nextPageSize) =>
                handlePaginationChange(
                  nextPage,
                  nextPageSize || currentPageSize
                )
              }
            />
          </div>
        </div>
      </div>

      <Sheet
        open={isFeedbackSheetOpen}
        onOpenChange={(open) => {
          setIsFeedbackSheetOpen(open)
          if (!open) {
            handleCloseSheet()
          }
        }}
      >
        <SheetContent
          side="right"
          className="w-full overflow-y-auto border-l border-[#24324D] bg-[#08101D] p-0 text-[#E6EDF7] sm:max-w-none desktop:max-w-[min(92vw,760px)]"
        >
          <SheetTitle className="sr-only">反馈处理抽屉</SheetTitle>
          <SheetDescription className="sr-only">
            从反馈队列打开的详情和处理工作台
          </SheetDescription>
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#16233A] bg-[#08101D]/95 px-5 py-4 backdrop-blur">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.18em] text-[#7F94B3]">
                反馈处理
              </p>
              <h2 className="truncate text-lg font-semibold text-[#E6EDF7]">
                {sheetTitle}
              </h2>
            </div>
            <button
              type="button"
              onClick={handleCloseSheet}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#24324D] bg-[#101A30] text-[#C8D4E7] transition hover:bg-[#16233A] hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-5">
            {isSheetLoading ? (
              <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 text-[#8FA4C2] desktop:min-h-[320px]">
                <Loader2 className="h-8 w-8 animate-spin text-[#60A5FA]" />
                <div className="space-y-1 text-center">
                  <p className="text-sm font-medium text-[#D6E7FF]">
                    正在加载反馈详情...
                  </p>
                  {sheetPreviewTitle ? (
                    <p className="text-xs text-[#6F86A8]">
                      {sheetPreviewTitle}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : sheetError ? (
              <PageEmptyState
                title={sheetError.title}
                description={sheetError.description}
                icon={AlertCircle}
                className="min-h-[260px] justify-center border border-[#24324D] bg-[#0B1220] desktop:min-h-[320px]"
                iconContainerClassName="border-[#24324D] bg-[#101A30] text-[#FCA5A5]"
                titleClassName="text-[#E6EDF7]"
                descriptionClassName="text-[#8FA4C2]"
                actions={
                  <>
                    {sheetError.kind === 'forbidden' ? (
                      <Button
                        onClick={() => {
                          router.push(
                            `/login?redirectTo=${encodeURIComponent('/admin/feedback')}`
                          )
                        }}
                        className="h-10 rounded-full bg-blue-600 px-4 text-white hover:bg-blue-500"
                      >
                        重新登录
                      </Button>
                    ) : (
                      <Button
                        onClick={refreshSheet}
                        className="h-10 rounded-full bg-blue-600 px-4 text-white hover:bg-blue-500"
                      >
                        重试加载
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={handleCloseSheet}
                      className="h-10 rounded-full border-[#24324D] bg-[#101A30] px-4 text-[#E6EDF7] hover:bg-[#16233A] hover:text-white"
                    >
                      关闭抽屉
                    </Button>
                  </>
                }
              />
            ) : sheetData ? (
              <FeedbackDetailView
                initialData={sheetData}
                embedded
                onRefresh={refreshSheet}
                onAfterSubmit={handleAfterSheetSubmit}
              />
            ) : (
              <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 text-[#8FA4C2] desktop:min-h-[320px]">
                <Loader2 className="h-8 w-8 animate-spin text-[#60A5FA]" />
                <p className="text-sm">正在准备反馈详情...</p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
