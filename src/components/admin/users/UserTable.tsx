'use client'

/**
 * User Management Table Component
 * Story-046: 用户全生命周期管理后台
 *
 * 包含：筛选、排序、分页、行操作
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Activity,
  Search,
  Download,
  ChevronDown,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  Ban,
  Mail,
  ShieldAlert,
  Sparkles,
  Ticket,
  Users,
} from 'lucide-react'
import { Admin } from '@/types'
import { UserStatusBadge, UserTierBadge } from './UserBadges'
import { HighRiskConfirmDialog } from './HighRiskConfirmDialog'
import { toggleUserStatus } from '@/actions/admin/user-ops'
import { OverrideModal } from '@/components/admin/permissions/OverrideModal'
import { toast } from 'sonner'

// --- Helper Components ---

const Avatar: React.FC<{ name: string; colorClass: string }> = ({
  name,
  colorClass,
}) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

  return (
    <div
      className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white shadow-md ${colorClass}`}
    >
      {initials}
    </div>
  )
}

const IconButton: React.FC<{
  icon: React.ReactNode
  onClick?: (e: React.MouseEvent) => void
  className?: string
}> = ({ icon, onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={`rounded-xl border border-transparent p-2 text-[#8FA4C2] transition-colors hover:border-[#24324D] hover:bg-[#18243D] hover:text-[#E6EDF7] ${className}`}
  >
    {icon}
  </button>
)

// --- Main Component ---

interface UserTableProps {
  onUserSelect?: (user: Admin.UserSummary) => void
  initialData?: Admin.PaginatedResponse<Admin.UserSummary>
  initialOverview?: Admin.UserOverview
  canOverridePermissions?: boolean
}

export const UserTable: React.FC<UserTableProps> = ({
  onUserSelect,
  initialData,
  initialOverview,
  canOverridePermissions = false,
}) => {
  const router = useRouter()

  // Filters
  const [filters, setFilters] = useState<Admin.UserFilterState>({
    search: '',
    status: 'All',
    tier: 'All',
  })

  // Sorting
  const [sortConfig, setSortConfig] = useState<Admin.SortConfig>({
    key: 'lastActive',
    direction: 'desc',
  })

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [overviewWindow, setOverviewWindow] =
    useState<Admin.UserOverviewWindow>(initialOverview?.window || '30D')

  // UI State
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(!initialData)
  const [isOverviewLoading, setIsOverviewLoading] = useState(!initialOverview)

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogAction, setDialogAction] = useState<Admin.HighRiskAction>('ban')
  const [selectedUser, setSelectedUser] = useState<Admin.UserSummary | null>(
    null
  )
  const [isActionLoading, setIsActionLoading] = useState(false)

  // Data
  const [data, setData] = useState<Admin.PaginatedResponse<Admin.UserSummary>>({
    data: initialData?.data || [],
    total: initialData?.total || 0,
    page: initialData?.page || 1,
    pageSize: initialData?.pageSize || 20,
    totalPages: initialData?.totalPages || 0,
  })
  const [overview, setOverview] = useState<Admin.UserOverview | null>(
    initialOverview || null
  )
  const initialKey = `search=&status=All&tier=All&page=1&pageSize=20&sortField=lastActive&sortDirection=desc`
  const lastLoadedQueryKey = React.useRef<string>(initialData ? initialKey : '')
  const lastLoadedOverviewWindow = React.useRef<Admin.UserOverviewWindow | ''>(
    initialOverview?.window || ''
  )

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        activeDropdownId &&
        !(event.target as Element).closest('.action-menu')
      ) {
        setActiveDropdownId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [activeDropdownId])

  const loadUsers = useCallback(async () => {
    const queryParams = new URLSearchParams({
      search: filters.search,
      status: filters.status,
      tier: filters.tier,
      page: String(currentPage),
      pageSize: String(itemsPerPage),
      sortField: sortConfig.key,
      sortDirection: sortConfig.direction,
    })
    const queryKey = queryParams.toString()
    if (lastLoadedQueryKey.current === queryKey) {
      return
    }
    lastLoadedQueryKey.current = queryKey

    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/users/list?${queryKey}`, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      })
      if (!response.ok) {
        throw new Error(`加载用户数据失败: ${response.status}`)
      }
      const result = await response.json()
      if (!result.success || !result.data) {
        throw new Error(result.error || '加载用户数据失败')
      }

      setData(result.data as Admin.PaginatedResponse<Admin.UserSummary>)
    } catch (error) {
      console.error('[UserTable] loadUsers error:', error)
      lastLoadedQueryKey.current = ''
      toast.error(error instanceof Error ? error.message : '加载用户数据失败')
    } finally {
      setIsLoading(false)
    }
  }, [filters, currentPage, itemsPerPage, sortConfig])

  const loadOverview = useCallback(async () => {
    if (lastLoadedOverviewWindow.current === overviewWindow) {
      return
    }

    lastLoadedOverviewWindow.current = overviewWindow
    setIsOverviewLoading(true)

    try {
      const response = await fetch(
        `/api/admin/users/overview?window=${overviewWindow}`,
        {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        }
      )

      if (!response.ok) {
        throw new Error(`加载用户概览失败: ${response.status}`)
      }

      const result = await response.json()
      if (!result.success || !result.data) {
        throw new Error(result.error || '加载用户概览失败')
      }

      setOverview(result.data as Admin.UserOverview)
    } catch (error) {
      console.error('[UserTable] loadOverview error:', error)
      lastLoadedOverviewWindow.current = ''
      toast.error(error instanceof Error ? error.message : '加载用户概览失败')
    } finally {
      setIsOverviewLoading(false)
    }
  }, [overviewWindow])

  // Fetch data when filters/sort/pagination change
  useEffect(() => {
    void loadUsers()
  }, [loadUsers])

  useEffect(() => {
    void loadOverview()
  }, [loadOverview])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  // --- Handlers ---

  const handleSort = (key: keyof Admin.UserSummary) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === 'desc' ? 'asc' : 'desc',
    }))
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= data.totalPages) {
      setCurrentPage(newPage)
    }
  }

  const resetFilters = () => {
    setFilters({
      search: '',
      status: 'All',
      tier: 'All',
    })
    setCurrentPage(1)
  }

  const handleUserClick = (user: Admin.UserSummary) => {
    if (onUserSelect) {
      onUserSelect(user)
    } else {
      router.push(`/admin/users/${user.id}`)
    }
  }

  const handleQuickAction = (
    user: Admin.UserSummary,
    action: Admin.HighRiskAction
  ) => {
    setSelectedUser(user)
    setDialogAction(action)
    setDialogOpen(true)
    setActiveDropdownId(null)
  }

  const handleConfirmAction = async (reason: string) => {
    if (!selectedUser) return

    setIsActionLoading(true)
    try {
      if (dialogAction !== 'ban' && dialogAction !== 'unban') {
        toast.error('当前操作暂不支持')
        return
      }

      const result = await toggleUserStatus(
        selectedUser.id,
        dialogAction,
        reason
      )
      if (!result.success) {
        toast.error(result.error || '操作失败')
        return
      }

      toast.success(dialogAction === 'ban' ? '用户已封禁' : '用户已解封')
      setDialogOpen(false)
      setSelectedUser(null)
      await loadUsers()
    } finally {
      setIsActionLoading(false)
    }
  }

  const isFiltered =
    filters.search !== '' || filters.status !== 'All' || filters.tier !== 'All'
  const overviewCards = (overview?.metrics || []).map((metric) => {
    if (metric.id === 'total') {
      return {
        ...metric,
        key: metric.id,
        icon: Users,
        iconClassName: 'text-[#60A5FA]',
        iconBgClassName: 'bg-[#18335E]',
        glowClassName: 'bg-[#2563EB]/20',
        borderClassName: 'border-[#2B4470]',
      }
    }

    if (metric.id === 'standard') {
      return {
        ...metric,
        key: metric.id,
        icon: Activity,
        iconClassName: 'text-[#4ADE80]',
        iconBgClassName: 'bg-[#123125]',
        glowClassName: 'bg-[#22C55E]/20',
        borderClassName: 'border-[#244B37]',
      }
    }

    if (metric.id === 'smart-plus') {
      return {
        ...metric,
        key: metric.id,
        icon: Ticket,
        iconClassName: 'text-[#C4B5FD]',
        iconBgClassName: 'bg-[#2A1F4A]',
        glowClassName: 'bg-[#8B5CF6]/20',
        borderClassName: 'border-[#47306C]',
      }
    }

    if (metric.id === 'premier') {
      return {
        ...metric,
        key: metric.id,
        icon: Sparkles,
        iconClassName: 'text-[#FBBF24]',
        iconBgClassName: 'bg-[#3A2A10]',
        glowClassName: 'bg-[#F59E0B]/20',
        borderClassName: 'border-[#5C4520]',
      }
    }

    return {
      ...metric,
      key: metric.id,
      icon: Ban,
      iconClassName: 'text-[#F87171]',
      iconBgClassName: 'bg-[#31151D]',
      glowClassName: 'bg-[#EF4444]/20',
      borderClassName: 'border-[#5C2B33]',
    }
  })

  // --- Render Helpers ---

  const overviewWindowOptions: Array<{
    key: Admin.UserOverviewWindow
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

  const renderSortIcon = (key: keyof Admin.UserSummary) => {
    if (sortConfig.key !== key)
      return <div className="ml-1 h-4 w-4 opacity-0 group-hover:opacity-30" />
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="ml-1 h-4 w-4 text-[#60A5FA]" />
    ) : (
      <ArrowDown className="ml-1 h-4 w-4 text-[#60A5FA]" />
    )
  }

  const renderPaginationButtons = () => {
    const { totalPages } = data
    const items: React.ReactNode[] = []

    if (totalPages <= 7) {
      // Show all pages directly
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`h-8 w-8 rounded-xl border text-sm font-medium transition-all ${
              currentPage === i
                ? 'border-[#33527B] bg-[#2563EB] text-white shadow-[0_8px_20px_rgba(37,99,235,0.3)]'
                : 'border-[#24324D] bg-[#151F36] text-[#8FA4C2] hover:bg-[#1A2744] hover:text-[#E6EDF7]'
            }`}
          >
            {i}
          </button>
        )
      }
    } else {
      // Determine window around current page
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      // Always show first page
      items.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className={`h-8 w-8 rounded-xl border text-sm font-medium transition-all ${currentPage === 1 ? 'border-[#33527B] bg-[#2563EB] text-white shadow-[0_8px_20px_rgba(37,99,235,0.3)]' : 'border-[#24324D] bg-[#151F36] text-[#8FA4C2] hover:bg-[#1A2744] hover:text-[#E6EDF7]'}`}
        >
          1
        </button>
      )

      // Left ellipsis
      if (start > 2) {
        items.push(
          <span
            key="ellipsis-left"
            className="flex h-8 w-8 items-center justify-center text-sm text-[#5C708F]"
          >
            …
          </span>
        )
      }

      // Middle pages
      for (let i = start; i <= end; i++) {
        items.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`h-8 w-8 rounded-xl border text-sm font-medium transition-all ${
              currentPage === i
                ? 'border-[#33527B] bg-[#2563EB] text-white shadow-[0_8px_20px_rgba(37,99,235,0.3)]'
                : 'border-[#24324D] bg-[#151F36] text-[#8FA4C2] hover:bg-[#1A2744] hover:text-[#E6EDF7]'
            }`}
          >
            {i}
          </button>
        )
      }

      // Right ellipsis
      if (end < totalPages - 1) {
        items.push(
          <span
            key="ellipsis-right"
            className="flex h-8 w-8 items-center justify-center text-sm text-[#5C708F]"
          >
            …
          </span>
        )
      }

      // Always show last page
      items.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={`h-8 w-8 rounded-xl border text-sm font-medium transition-all ${currentPage === totalPages ? 'border-[#33527B] bg-[#2563EB] text-white shadow-[0_8px_20px_rgba(37,99,235,0.3)]' : 'border-[#24324D] bg-[#151F36] text-[#8FA4C2] hover:bg-[#1A2744] hover:text-[#E6EDF7]'}`}
        >
          {totalPages}
        </button>
      )
    }

    return items
  }

  if (isLoading && data.data.length === 0) {
    return (
      <div className="bg-[#0F172A]/96 flex min-h-[520px] items-center justify-center rounded-[28px] border border-[#24324D] text-[#8FA4C2]">
        <div className="space-y-3 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-[#24324D] border-t-[#60A5FA]" />
          <p className="text-sm">加载用户目录...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3 text-[#E6EDF7]">
      <section className="relative overflow-hidden rounded-[28px] border border-[#24324D] bg-[linear-gradient(135deg,#111A2E_0%,#0F1A2F_55%,#0B1220_100%)] px-4 py-4 shadow-[0_22px_50px_rgba(2,8,23,0.35)] sm:px-5">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#2563EB]/10 blur-3xl" />
        <div className="absolute bottom-0 left-16 h-24 w-24 rounded-full bg-[#22C55E]/10 blur-3xl" />

        <div className="relative flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#E6EDF7] sm:text-[30px]">
              用户管理
            </h1>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#274066] bg-[#10203C] px-2.5 py-1 text-[11px] font-medium text-[#D6E7FF]">
              <Sparkles className="h-3 w-3 text-[#60A5FA]" />
              User Directory
            </div>
          </div>
          <p className="max-w-3xl text-sm text-[#B2C3DA]">
            集中查看用户状态、订阅等级、最近活跃与高风险动作，保持筛选、分页与快捷操作在同一工作区内完成。
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-[#E6EDF7]">用户概览</h2>
            <p className="text-sm text-[#8FA4C2]">
              聚焦全站用户结构、付费档位分布与风险账号规模，并补充相对上周期的变化。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            <div className="inline-flex items-center rounded-2xl border border-[#24324D] bg-[#121C32] p-1">
              {overviewWindowOptions.map((option) => {
                const isActive = option.key === overviewWindow
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setOverviewWindow(option.key)}
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

            {overview?.lastUpdated ? (
              <span className="font-mono text-xs text-[#9FB0C9]">
                更新于{' '}
                {new Date(overview.lastUpdated).toLocaleTimeString('zh-CN')}
              </span>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {overviewCards.map((card) => {
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

        {isOverviewLoading ? (
          <p className="text-xs text-[#8FA4C2]">正在刷新用户概览...</p>
        ) : null}
      </section>

      <div className="bg-[#0F172A]/96 flex min-h-[500px] flex-col overflow-hidden rounded-[28px] border border-[#24324D] shadow-[0_18px_40px_rgba(2,8,23,0.24)]">
        <div className="border-b border-[#1B2840] bg-[#0F1A2F] px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-3">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold text-[#F4F7FB]">
                用户列表
              </h2>
              <p className="text-sm text-[#8FA4C2]">
                搜索、筛选并处理用户状态，保留原有详情跳转与高风险操作逻辑。
              </p>
            </div>

            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="group relative w-full md:w-80">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#556B8A] transition-colors group-focus-within:text-[#60A5FA]"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="搜索用户、邮箱或学校..."
                    value={filters.search}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, search: e.target.value }))
                    }
                    className="w-full rounded-2xl border border-[#24324D] bg-[#151F36] py-2.5 pl-10 pr-4 text-sm text-[#E6EDF7] outline-none transition-all placeholder:text-[#6F86A8] focus:border-[#33527B] focus:ring-2 focus:ring-[#60A5FA]/20"
                  />
                </div>

                <div className="flex flex-row gap-3 overflow-x-auto pb-1 md:pb-0">
                  <div className="relative min-w-[150px]">
                    <select
                      value={filters.status}
                      onChange={(e) =>
                        setFilters((f) => ({
                          ...f,
                          status: e.target.value as Admin.UserStatus | 'All',
                        }))
                      }
                      className="w-full appearance-none rounded-2xl border border-[#24324D] bg-[#151F36] py-2.5 pl-3 pr-10 text-sm text-[#E6EDF7] outline-none transition-all hover:bg-[#1A2744] focus:border-[#33527B] focus:ring-2 focus:ring-[#60A5FA]/20"
                    >
                      <option value="All">状态: 全部</option>
                      {Object.values(Admin.UserStatus).map((s) => (
                        <option key={s} value={s}>
                          {s}
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
                      value={filters.tier}
                      onChange={(e) =>
                        setFilters((f) => ({
                          ...f,
                          tier: e.target.value as
                            | Admin.SubscriptionTier
                            | 'All',
                        }))
                      }
                      className="w-full appearance-none rounded-2xl border border-[#24324D] bg-[#151F36] py-2.5 pl-3 pr-10 text-sm text-[#E6EDF7] outline-none transition-all hover:bg-[#1A2744] focus:border-[#33527B] focus:ring-2 focus:ring-[#60A5FA]/20"
                    >
                      <option value="All">等级: 全部</option>
                      {Object.values(Admin.SubscriptionTier).map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6F86A8]"
                      size={16}
                    />
                  </div>
                </div>

                {isFiltered ? (
                  <button
                    onClick={resetFilters}
                    className="text-sm text-[#8FA4C2] transition-colors hover:text-white"
                  >
                    重置筛选
                  </button>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-3 xl:justify-end">
                <span className="text-sm text-[#8FA4C2]">
                  当前命中{' '}
                  <span className="font-semibold text-[#F4F7FB]">
                    {data.total}
                  </span>{' '}
                  位用户
                </span>
                <button className="inline-flex items-center gap-2 rounded-xl border border-[#24324D] bg-[#151F36] px-4 py-2 text-sm font-medium text-[#E6EDF7] transition-colors hover:bg-[#1A2744]">
                  <Download size={16} />
                  导出
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#1B2840] bg-[#101A2D]">
                <th
                  className="group cursor-pointer select-none px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6F86A8] transition-colors hover:text-[#E6EDF7]"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    用户信息
                    {renderSortIcon('name')}
                  </div>
                </th>
                <th
                  className="group cursor-pointer select-none px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6F86A8] transition-colors hover:text-[#E6EDF7]"
                  onClick={() => handleSort('grade')}
                >
                  <div className="flex items-center">
                    年级/学校
                    {renderSortIcon('grade')}
                  </div>
                </th>
                <th
                  className="group cursor-pointer select-none px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6F86A8] transition-colors hover:text-[#E6EDF7]"
                  onClick={() => handleSort('tier')}
                >
                  <div className="flex items-center">
                    订阅等级
                    {renderSortIcon('tier')}
                  </div>
                </th>
                <th
                  className="group cursor-pointer select-none px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6F86A8] transition-colors hover:text-[#E6EDF7]"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">
                    状态
                    {renderSortIcon('status')}
                  </div>
                </th>
                <th
                  className="group cursor-pointer select-none px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6F86A8] transition-colors hover:text-[#E6EDF7]"
                  onClick={() => handleSort('lastActive')}
                >
                  <div className="flex items-center">
                    最后活跃
                    {renderSortIcon('lastActive')}
                  </div>
                </th>
                <th className="px-6 py-4 text-right text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6F86A8]">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1B2840]">
              {data.data.length > 0 ? (
                data.data.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => handleUserClick(user)}
                    className="group cursor-pointer transition-colors hover:bg-[#131F35]"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={user.name}
                          colorClass={user.avatarColor}
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-[#F4F7FB] transition-colors group-hover:text-[#93C5FD]">
                            {user.name}
                          </span>
                          <span className="font-mono text-xs text-[#8FA4C2]">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-[#D5E0F0]">
                          {user.grade}
                        </span>
                        <span
                          className="max-w-[160px] truncate text-xs text-[#8FA4C2]"
                          title={user.school}
                        >
                          {user.school}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <UserTierBadge tier={user.tier} />
                    </td>
                    <td className="px-6 py-4">
                      <UserStatusBadge status={user.status} />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-[#B2C3DA]">
                        {user.lastActiveLabel}
                      </span>
                    </td>
                    <td className="action-menu relative px-6 py-4 text-right">
                      <div
                        className="flex justify-end"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <IconButton
                          icon={<MoreHorizontal size={18} />}
                          onClick={() =>
                            setActiveDropdownId(
                              activeDropdownId === user.id ? null : user.id
                            )
                          }
                          className={
                            activeDropdownId === user.id
                              ? 'border-[#24324D] bg-[#18243D] text-[#E6EDF7]'
                              : ''
                          }
                        />
                      </div>

                      {activeDropdownId === user.id ? (
                        <div
                          className="absolute right-6 top-11 z-50 w-52 origin-top-right overflow-hidden rounded-2xl border border-[#24324D] bg-[#151F36] shadow-[0_18px_40px_rgba(2,8,23,0.42)] duration-100 animate-in fade-in zoom-in-95"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="py-1.5">
                            <button
                              onClick={() => {
                                handleUserClick(user)
                                setActiveDropdownId(null)
                              }}
                              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-[#D5E0F0] transition-colors hover:bg-[#1A2744] hover:text-white"
                            >
                              <Eye size={14} />
                              查看详情
                            </button>
                            <button
                              disabled
                              className="flex w-full cursor-not-allowed items-center gap-2 px-4 py-2.5 text-left text-sm text-[#60738F]"
                            >
                              <Mail size={14} />
                              发送邀请（待接入）
                            </button>
                            {canOverridePermissions ? (
                              <OverrideModal
                                user={{
                                  id: user.id,
                                  email: user.email,
                                  username: user.name,
                                  subscriptionTier:
                                    user.tier === Admin.SubscriptionTier.PREMIER
                                      ? 'PREMIER'
                                      : user.tier ===
                                          Admin.SubscriptionTier.SMART_PLUS
                                        ? 'SMART_PLUS'
                                        : user.tier ===
                                            Admin.SubscriptionTier.STANDARD
                                          ? 'STANDARD'
                                          : 'STARTER',
                                  subscriptionEnd: user.subscriptionEnd,
                                  role:
                                    user.role === 'ADMIN'
                                      ? 'ADMIN'
                                      : user.role === 'TEACHER'
                                        ? 'TEACHER'
                                        : user.role === 'PARENT'
                                          ? 'PARENT'
                                          : 'STUDENT',
                                }}
                                onSuccess={async () => {
                                  setActiveDropdownId(null)
                                  lastLoadedQueryKey.current = ''
                                  lastLoadedOverviewWindow.current = ''
                                  await Promise.all([
                                    loadUsers(),
                                    loadOverview(),
                                  ])
                                }}
                              >
                                <button className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-[#D5E0F0] transition-colors hover:bg-[#1A2744] hover:text-white">
                                  <ShieldAlert size={14} />
                                  提权 / 覆写
                                </button>
                              </OverrideModal>
                            ) : null}
                            <div className="mx-3 my-1 h-px bg-[#24324D]" />
                            <button
                              onClick={() =>
                                handleQuickAction(
                                  user,
                                  user.status === Admin.UserStatus.BANNED
                                    ? 'unban'
                                    : 'ban'
                                )
                              }
                              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-[#FCA5A5] transition-colors hover:bg-[#33161A] hover:text-[#FECACA]"
                            >
                              <Ban size={14} />
                              {user.status === Admin.UserStatus.BANNED
                                ? '解除封禁'
                                : '快速封禁'}
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-[#8FA4C2]">
                      <Filter className="mb-3 h-12 w-12 opacity-20" />
                      <p className="text-lg font-medium text-[#E6EDF7]">
                        未找到用户
                      </p>
                      <p className="text-sm">尝试调整搜索条件或筛选器</p>
                      <button
                        onClick={resetFilters}
                        className="mt-4 text-sm font-medium text-[#60A5FA] transition-colors hover:text-[#93C5FD]"
                      >
                        清除所有筛选
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-auto flex select-none flex-col gap-4 border-t border-[#1B2840] bg-[#10192D] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-[#8FA4C2]">
            显示第{' '}
            <span className="font-medium text-[#E6EDF7]">
              {data.total === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
            </span>{' '}
            到{' '}
            <span className="font-medium text-[#E6EDF7]">
              {Math.min(currentPage * itemsPerPage, data.total)}
            </span>{' '}
            条，共{' '}
            <span className="font-medium text-[#E6EDF7]">{data.total}</span> 条
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-xl border border-[#24324D] bg-[#151F36] p-2 text-[#8FA4C2] transition-colors hover:bg-[#1A2744] hover:text-white disabled:opacity-30 disabled:hover:bg-[#151F36] disabled:hover:text-[#8FA4C2]"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="flex items-center gap-1">
              {renderPaginationButtons()}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={
                currentPage === data.totalPages || data.totalPages === 0
              }
              className="rounded-xl border border-[#24324D] bg-[#151F36] p-2 text-[#8FA4C2] transition-colors hover:bg-[#1A2744] hover:text-white disabled:opacity-30 disabled:hover:bg-[#151F36] disabled:hover:text-[#8FA4C2]"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm text-[#8FA4C2]">
            <span>每页</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value))
                setCurrentPage(1)
              }}
              className="rounded-xl border border-[#24324D] bg-[#151F36] px-2.5 py-1.5 text-[#E6EDF7] outline-none transition-all focus:border-[#33527B] focus:ring-2 focus:ring-[#60A5FA]/20"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* --- Confirm Dialog --- */}
      {selectedUser && (
        <HighRiskConfirmDialog
          isOpen={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onConfirm={handleConfirmAction}
          action={dialogAction}
          userEmail={selectedUser.email}
          userName={selectedUser.name}
          isLoading={isActionLoading}
        />
      )}
    </div>
  )
}
