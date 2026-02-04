'use client'

/**
 * User Management Table Component
 * Story-046: 用户全生命周期管理后台
 *
 * 包含：筛选、排序、分页、行操作
 */

import React, { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
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
} from 'lucide-react'
import {
  UserSummary,
  UserStatus,
  SubscriptionTier,
  SortConfig,
  UserFilterState,
  PaginatedResponse,
  HighRiskAction
} from '@/types/admin-user'
import { UserStatusBadge, UserTierBadge } from './UserBadges'
import { fetchMockUsers } from './mock/userMockData'
import { HighRiskConfirmDialog } from './HighRiskConfirmDialog'

// --- Helper Components ---

const Avatar: React.FC<{ name: string; colorClass: string }> = ({ name, colorClass }) => {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

  return (
    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md ${colorClass}`}>
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
    className={`p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors ${className}`}
  >
    {icon}
  </button>
)

// --- Main Component ---

interface UserTableProps {
  onUserSelect?: (user: UserSummary) => void
}

export const UserTable: React.FC<UserTableProps> = ({ onUserSelect }) => {
  const router = useRouter()

  // Filters
  const [filters, setFilters] = useState<UserFilterState>({
    search: '',
    status: 'All',
    tier: 'All',
  })

  // Sorting
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'lastActive',
    direction: 'desc',
  })

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)

  // UI State
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogAction, setDialogAction] = useState<HighRiskAction>('ban')
  const [selectedUser, setSelectedUser] = useState<UserSummary | null>(null)
  const [isActionLoading, setIsActionLoading] = useState(false)

  // Data
  const [data, setData] = useState<PaginatedResponse<UserSummary>>({
    data: [],
    total: 0,
    page: 1,
    pageSize: 20,
    totalPages: 0,
  })

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdownId && !(event.target as Element).closest('.action-menu')) {
        setActiveDropdownId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [activeDropdownId])

  // Fetch data when filters/sort/pagination change
  useEffect(() => {
    setIsLoading(true)
    // 模拟 API 延迟
    const timer = setTimeout(() => {
      const result = fetchMockUsers(filters, {
        page: currentPage,
        pageSize: itemsPerPage,
        sortField: sortConfig.key,
        sortDirection: sortConfig.direction,
      })
      setData(result)
      setIsLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [filters, currentPage, itemsPerPage, sortConfig])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  // --- Handlers ---

  const handleSort = (key: keyof UserSummary) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc',
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

  const handleUserClick = (user: UserSummary) => {
    if (onUserSelect) {
      onUserSelect(user)
    } else {
      router.push(`/admin/users/${user.id}`)
    }
  }
  
  const handleQuickAction = (user: UserSummary, action: HighRiskAction) => {
    setSelectedUser(user)
    setDialogAction(action)
    setDialogOpen(true)
    setActiveDropdownId(null)
  }
  
  const handleConfirmAction = async (reason: string, duration?: string) => {
    setIsActionLoading(true)
    // 模拟 API 请求
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log(`执行操作: ${dialogAction}, 用户: ${selectedUser?.email}, 原因: ${reason}${duration ? `, 时长: ${duration}` : ''}`)
    
    // TODO: 在这里调用真实的 Server Action
    
    setIsActionLoading(false)
    setDialogOpen(false)
    setSelectedUser(null)
    
    // 刷新数据 (模拟)
    const result = fetchMockUsers(filters, {
      page: currentPage,
      pageSize: itemsPerPage,
      sortField: sortConfig.key,
      sortDirection: sortConfig.direction,
    })
    setData(result)
  }
  
  const handleSendInvitation = (user: UserSummary) => {
    // 模拟发送邀请
    alert(`已向 ${user.email} 发送邀请邮件 (Mock)`)
    setActiveDropdownId(null)
  }

  const isFiltered = filters.search !== '' || filters.status !== 'All' || filters.tier !== 'All'

  // --- Render Helpers ---

  const renderSortIcon = (key: keyof UserSummary) => {
    if (sortConfig.key !== key) return <div className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-30" />
    return sortConfig.direction === 'asc'
      ? <ArrowUp className="w-4 h-4 ml-1 text-blue-400" />
      : <ArrowDown className="w-4 h-4 ml-1 text-blue-400" />
  }

  const renderPaginationButtons = () => {
    const pages: number[] = []
    const { totalPages } = data

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      let start = Math.max(1, currentPage - 2)
      let end = Math.min(totalPages, start + 4)
      if (end - start < 4) start = Math.max(1, end - 4)
      for (let i = start; i <= end; i++) pages.push(i)
    }

    return pages.map(p => (
      <button
        key={p}
        onClick={() => handlePageChange(p)}
        className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
          currentPage === p
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
        }`}
      >
        {p}
      </button>
    ))
  }

  if (isLoading && data.data.length === 0) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center text-slate-400">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p>加载用户数据...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* --- Header --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white tracking-tight">用户管理</h1>
          <span className="bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full text-xs font-medium border border-slate-700">
            共 {data.total} 位用户
          </span>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 bg-transparent border border-slate-700 rounded-lg hover:bg-slate-800 hover:text-white transition-all focus:ring-2 focus:ring-slate-700 focus:outline-none">
          <Download size={16} />
          导出
        </button>
      </div>

      {/* --- Toolbar --- */}
      <div className="flex flex-col xl:flex-row gap-4 xl:items-center justify-between bg-slate-900/50 p-1 rounded-xl">
        <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
          {/* Search */}
          <div className="relative group w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="搜索用户、邮箱或学校..."
              value={filters.search}
              onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
            />
          </div>

          {/* Filters Group */}
          <div className="flex flex-row gap-3 overflow-x-auto pb-1 md:pb-0">
            {/* Status Select */}
            <div className="relative min-w-[140px]">
              <select
                value={filters.status}
                onChange={(e) => setFilters(f => ({ ...f, status: e.target.value as UserStatus | 'All' }))}
                className="w-full appearance-none bg-slate-900 border border-slate-800 text-slate-300 text-sm rounded-lg pl-3 pr-10 py-2.5 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none cursor-pointer hover:bg-slate-800 transition-colors"
              >
                <option value="All">状态: 全部</option>
                {Object.values(UserStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
            </div>

            {/* Tier Select */}
            <div className="relative min-w-[140px]">
              <select
                value={filters.tier}
                onChange={(e) => setFilters(f => ({ ...f, tier: e.target.value as SubscriptionTier | 'All' }))}
                className="w-full appearance-none bg-slate-900 border border-slate-800 text-slate-300 text-sm rounded-lg pl-3 pr-10 py-2.5 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none cursor-pointer hover:bg-slate-800 transition-colors"
              >
                <option value="All">等级: 全部</option>
                {Object.values(SubscriptionTier).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
            </div>
          </div>

          {/* Reset Link */}
          {isFiltered && (
            <button
              onClick={resetFilters}
              className="text-sm text-slate-500 hover:text-slate-300 underline underline-offset-4 self-center whitespace-nowrap px-2"
            >
              重置筛选
            </button>
          )}
        </div>
      </div>

      {/* --- Table Card --- */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl shadow-black/20 flex flex-col min-h-[500px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/50 border-b border-slate-800">
                <th
                  className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-200 group select-none"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    用户信息
                    {renderSortIcon('name')}
                  </div>
                </th>
                <th
                  className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-200 group select-none"
                  onClick={() => handleSort('grade')}
                >
                  <div className="flex items-center">
                    年级/学校
                    {renderSortIcon('grade')}
                  </div>
                </th>
                <th
                  className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-200 group select-none"
                  onClick={() => handleSort('tier')}
                >
                  <div className="flex items-center">
                    订阅等级
                    {renderSortIcon('tier')}
                  </div>
                </th>
                <th
                  className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-200 group select-none"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">
                    状态
                    {renderSortIcon('status')}
                  </div>
                </th>
                <th
                  className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-200 group select-none"
                  onClick={() => handleSort('lastActive')}
                >
                  <div className="flex items-center">
                    最后活跃
                    {renderSortIcon('lastActive')}
                  </div>
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {data.data.length > 0 ? (
                data.data.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => handleUserClick(user)}
                    className="group hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name} colorClass={user.avatarColor} />
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
                            {user.name}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-6">
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-300">{user.grade}</span>
                        <span className="text-xs text-slate-500 truncate max-w-[120px]" title={user.school}>
                          {user.school}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-6">
                      <UserTierBadge tier={user.tier} />
                    </td>
                    <td className="py-3 px-6">
                      <UserStatusBadge status={user.status} />
                    </td>
                    <td className="py-3 px-6">
                      <span className="text-sm text-slate-400">{user.lastActiveLabel}</span>
                    </td>
                    <td className="py-3 px-6 text-right relative action-menu">
                      <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                        <IconButton
                          icon={<MoreHorizontal size={18} />}
                          onClick={() => setActiveDropdownId(activeDropdownId === user.id ? null : user.id)}
                          className={activeDropdownId === user.id ? 'bg-slate-800 text-slate-200' : ''}
                        />
                      </div>

                      {/* Dropdown Menu */}
                      {activeDropdownId === user.id && (
                        <div
                          className="absolute right-6 top-10 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="py-1">
                            <button
                              onClick={() => {
                                handleUserClick(user)
                                setActiveDropdownId(null)
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                            >
                              <Eye size={14} />
                              查看详情
                            </button>
                            <button
                              onClick={() => handleSendInvitation(user)}
                              className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                            >
                              <Mail size={14} />
                              发送邀请
                            </button>
                            <div className="h-px bg-slate-800 my-1 mx-2" />
                            <button
                              onClick={() => handleQuickAction(
                                user, 
                                user.status === UserStatus.BANNED ? 'unban' : 'ban'
                              )}
                              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 flex items-center gap-2"
                            >
                              <Ban size={14} />
                              {user.status === UserStatus.BANNED ? '解除封禁' : '快速封禁'}
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <Filter className="h-12 w-12 mb-3 opacity-20" />
                      <p className="text-lg font-medium">未找到用户</p>
                      <p className="text-sm">尝试调整搜索条件或筛选器</p>
                      <button
                        onClick={resetFilters}
                        className="mt-4 text-blue-400 hover:text-blue-300 text-sm font-medium"
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

        {/* --- Pagination Footer --- */}
        <div className="border-t border-slate-800 bg-slate-900 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 select-none mt-auto">
          <div className="text-sm text-slate-500">
            显示第 <span className="font-medium text-slate-300">{data.total === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> 到{' '}
            <span className="font-medium text-slate-300">{Math.min(currentPage * itemsPerPage, data.total)}</span> 条，共{' '}
            <span className="font-medium text-slate-300">{data.total}</span> 条
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="flex items-center gap-1">
              {renderPaginationButtons()}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === data.totalPages || data.totalPages === 0}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>每页</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value))
                setCurrentPage(1)
              }}
              className="bg-slate-800 border border-slate-700 text-slate-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500/50 outline-none cursor-pointer"
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
