'use client'

import { useMemo, useState } from 'react'
import {
  Search,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Copy,
  CheckCircle2,
  Clock,
  RefreshCw,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import type {
  AdminReferralFilters,
  AdminReferralsViewProps,
  AdminReferralRow,
  ReferralStatus,
} from './admin-referrals.types'

const STATUS_LABEL_MAP: Record<ReferralStatus, string> = {
  PENDING: '待完成',
  COMPLETED: '已完成',
  DEFERRED: '延迟发放',
  EXPIRED: '已过期',
  CANCELLED: '已取消',
}

const STATUS_BADGE_MAP: Record<ReferralStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/25',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/25',
  DEFERRED: 'bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/25',
  EXPIRED: 'bg-zinc-100 text-zinc-600 border-zinc-200/70 dark:bg-zinc-500/10 dark:text-zinc-400 dark:border-zinc-500/25',
  CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/25',
}

const TREND_CLASS_MAP = {
  up: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  down: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
  flat: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
} as const

const DEFAULT_FILTERS: AdminReferralFilters = {
  keyword: '',
  status: 'ALL',
  role: 'ALL',
  dateRange: 'ALL',
}

function formatDateTime(input: string | null | undefined) {
  if (!input) {
    return '未结算'
  }

  const date = new Date(input)
  if (Number.isNaN(date.getTime())) {
    return '未结算'
  }

  return date.toLocaleString('zh-CN', { hour12: false })
}

function formatTableDateTime(input: string) {
  const date = new Date(input)
  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function matchesDateRange(createdAt: string, dateRange: string) {
  if (dateRange === 'ALL') {
    return true
  }

  const created = new Date(createdAt)
  if (Number.isNaN(created.getTime())) {
    return false
  }

  const now = Date.now()
  const dayMs = 24 * 60 * 60 * 1000

  if (dateRange === '7D') {
    return created.getTime() >= now - 7 * dayMs
  }

  if (dateRange === '30D') {
    return created.getTime() >= now - 30 * dayMs
  }

  if (dateRange === '90D') {
    return created.getTime() >= now - 90 * dayMs
  }

  return true
}

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'flat' }) {
  if (trend === 'up') {
    return <ArrowUp className="mr-1 h-3 w-3" />
  }

  if (trend === 'down') {
    return <ArrowDown className="mr-1 h-3 w-3" />
  }

  return <Minus className="mr-1 h-3 w-3" />
}

export function AdminReferralsView({
  metrics,
  rows,
  filters,
  onFilterChange,
  onRowClick,
  pagination,
  lastUpdatedLabel,
  isLoading = false,
  isError = false,
}: AdminReferralsViewProps) {
  const mergedInitialFilters = { ...DEFAULT_FILTERS, ...filters }
  const [keyword, setKeyword] = useState(mergedInitialFilters.keyword)
  const [status, setStatus] = useState(mergedInitialFilters.status)
  const [role, setRole] = useState(mergedInitialFilters.role)
  const [dateRange, setDateRange] = useState(mergedInitialFilters.dateRange)
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null)
  const [page, setPage] = useState(pagination?.page || 1)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const pageSize = pagination?.pageSize || 10

  const emitFilterChange = (next: Partial<AdminReferralFilters>) => {
    onFilterChange?.({
      keyword,
      status,
      role,
      dateRange,
      ...next,
    })
  }

  const handleKeywordChange = (nextKeyword: string) => {
    setKeyword(nextKeyword)
    setPage(1)
    emitFilterChange({ keyword: nextKeyword })
  }

  const handleStatusChange = (nextStatus: string) => {
    setStatus(nextStatus)
    setPage(1)
    emitFilterChange({ status: nextStatus })
  }

  const handleRoleChange = (nextRole: string) => {
    setRole(nextRole)
    setPage(1)
    emitFilterChange({ role: nextRole })
  }

  const handleDateRangeChange = (nextDateRange: string) => {
    setDateRange(nextDateRange)
    setPage(1)
    emitFilterChange({ dateRange: nextDateRange })
  }

  const filteredRows = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()

    return rows.filter((row) => {
      const hitKeyword = !normalizedKeyword
        || row.referralCode.toLowerCase().includes(normalizedKeyword)
        || row.referrer.username.toLowerCase().includes(normalizedKeyword)
        || row.referrer.email.toLowerCase().includes(normalizedKeyword)
        || row.referee.username.toLowerCase().includes(normalizedKeyword)
        || row.referee.email.toLowerCase().includes(normalizedKeyword)

      const hitStatus = status === 'ALL' || row.status === status
      const hitRole = role === 'ALL'
        || row.referrer.role.toUpperCase() === role
        || row.referee.role.toUpperCase() === role
      const hitDateRange = matchesDateRange(row.createdAt, dateRange)

      return hitKeyword && hitStatus && hitRole && hitDateRange
    })
  }, [dateRange, keyword, role, rows, status])

  const total = filteredRows.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const currentPage = Math.min(page, totalPages)

  const pageRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredRows.slice(start, start + pageSize)
  }, [currentPage, filteredRows, pageSize])

  const selectedRow: AdminReferralRow | undefined = useMemo(
    () => rows.find((row) => row.id === selectedRowId),
    [rows, selectedRowId],
  )

  const resolvedLastUpdatedLabel = lastUpdatedLabel
    || new Date().toLocaleString('zh-CN', { hour12: false })

  const handlePageChange = (nextPage: number) => {
    const safePage = Math.max(1, Math.min(totalPages, nextPage))
    setPage(safePage)
    pagination?.onPageChange?.(safePage)
  }

  const openDetails = (row: AdminReferralRow) => {
    setSelectedRowId(row.id)
    onRowClick?.(row.id)
  }

  const resetFilters = () => {
    setKeyword(DEFAULT_FILTERS.keyword)
    setStatus(DEFAULT_FILTERS.status)
    setRole(DEFAULT_FILTERS.role)
    setDateRange(DEFAULT_FILTERS.dateRange)
    setPage(1)
    emitFilterChange(DEFAULT_FILTERS)
  }

  const handleCopyCode = async (rowCode: string, event?: React.MouseEvent) => {
    event?.stopPropagation()

    try {
      await navigator.clipboard.writeText(rowCode)
      setCopiedCode(rowCode)
      setTimeout(() => setCopiedCode(null), 1800)
    } catch {
      setCopiedCode(null)
    }
  }

  const fromIndex = total === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const toIndex = Math.min(currentPage * pageSize, total)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">推荐关系管理</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            管理平台推荐关系记录、状态变化与奖励发放进度。
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          <Clock className="h-3.5 w-3.5" />
          <span>最后更新：{resolvedLastUpdatedLabel}</span>
          <RefreshCw className="h-3.5 w-3.5" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2 desktop:grid-cols-4">
        {metrics.map((metric) => {
          const trend = metric.trend || 'flat'

          return (
            <Card key={metric.key} className="border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{metric.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between gap-4">
                  <p className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{metric.value}</p>
                  {metric.delta ? (
                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${TREND_CLASS_MAP[trend]}`}>
                      <TrendIcon trend={trend} />
                      {metric.delta}
                    </span>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <CardContent className="pt-4">
          <div className="flex flex-col gap-3 desktop:flex-row desktop:items-center desktop:justify-between">
            <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 desktop:grid-cols-4">
              <div className="relative sm:col-span-2 desktop:col-span-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  value={keyword}
                  onChange={(event) => handleKeywordChange(event.target.value)}
                  className="h-9 border-zinc-200 bg-white pl-9 dark:border-zinc-800 dark:bg-zinc-900"
                  placeholder="搜索用户名、邮箱或推荐码"
                />
              </div>

              <Select value={status} onValueChange={handleStatusChange}>
                <SelectTrigger className="h-9 border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">所有状态</SelectItem>
                  <SelectItem value="PENDING">待完成</SelectItem>
                  <SelectItem value="COMPLETED">已完成</SelectItem>
                  <SelectItem value="DEFERRED">延迟发放</SelectItem>
                  <SelectItem value="EXPIRED">已过期</SelectItem>
                  <SelectItem value="CANCELLED">已取消</SelectItem>
                </SelectContent>
              </Select>

              <Select value={role} onValueChange={handleRoleChange}>
                <SelectTrigger className="h-9 border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                  <SelectValue placeholder="角色" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">所有角色</SelectItem>
                  <SelectItem value="ADMIN">管理员</SelectItem>
                  <SelectItem value="TEACHER">教师</SelectItem>
                  <SelectItem value="STUDENT">学员</SelectItem>
                  <SelectItem value="PARENT">家长</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateRange} onValueChange={handleDateRangeChange}>
                <SelectTrigger className="h-9 border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                  <SelectValue placeholder="时间" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">全部时间</SelectItem>
                  <SelectItem value="7D">最近 7 天</SelectItem>
                  <SelectItem value="30D">最近 30 天</SelectItem>
                  <SelectItem value="90D">最近 90 天</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="ghost"
              className="h-9 justify-center text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              onClick={resetFilters}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              重置筛选
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-zinc-50/80 dark:bg-zinc-900/60">
              <TableRow className="border-zinc-200 hover:bg-transparent dark:border-zinc-800">
                <TableHead className="px-6 py-3.5 text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">推荐人</TableHead>
                <TableHead className="px-6 py-3.5 text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">被推荐人</TableHead>
                <TableHead className="px-6 py-3.5 text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">推荐码</TableHead>
                <TableHead className="px-6 py-3.5 text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">状态</TableHead>
                <TableHead className="px-6 py-3.5 text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">奖励发放</TableHead>
                <TableHead className="px-6 py-3.5 text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">延迟奖励</TableHead>
                <TableHead className="px-6 py-3.5 text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">注册时间</TableHead>
                <TableHead className="px-6 py-3.5 text-right text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    加载数据中...
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-sm text-rose-600 dark:text-rose-400">
                    数据加载失败，请稍后重试
                  </TableCell>
                </TableRow>
              ) : pageRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    暂无符合筛选条件的推荐记录
                  </TableCell>
                </TableRow>
              ) : (
                pageRows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="group cursor-pointer border-zinc-200 transition-colors hover:bg-zinc-50/60 dark:border-zinc-800 dark:hover:bg-zinc-800/30"
                    onClick={() => openDetails(row)}
                  >
                    <TableCell className="px-6 py-3.5">
                      <div className="space-y-0.5">
                        <p className="max-w-[220px] truncate text-sm font-medium text-zinc-900 dark:text-zinc-100" title={row.referrer.username}>{row.referrer.username}</p>
                        <p className="max-w-[220px] truncate text-xs text-zinc-500 dark:text-zinc-400" title={row.referrer.email}>{row.referrer.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-3.5">
                      <div className="space-y-0.5">
                        <p className="max-w-[220px] truncate text-sm font-medium text-zinc-900 dark:text-zinc-100" title={row.referee.username}>{row.referee.username}</p>
                        <p className="max-w-[220px] truncate text-xs text-zinc-500 dark:text-zinc-400" title={row.referee.email}>{row.referee.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-3.5">
                      <div className="group/code flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
                        <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                          {row.referralCode}
                        </code>
                        <button
                          type="button"
                          title="复制推荐码"
                          onClick={(event) => handleCopyCode(row.referralCode, event)}
                          className="rounded p-1 text-zinc-400 opacity-0 transition-all hover:bg-blue-50 hover:text-blue-600 group-hover/code:opacity-100 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                        >
                          {copiedCode === row.referralCode ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-3.5">
                      <Badge variant="outline" className={`rounded-md px-2 py-0.5 text-xs ${STATUS_BADGE_MAP[row.status]}`}>
                        {STATUS_LABEL_MAP[row.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-3.5">
                      {row.rewardGranted ? (
                        <span className="inline-flex items-center text-sm font-medium text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="mr-1.5 h-4 w-4" />已发放
                        </span>
                      ) : (
                        <span className="text-sm text-zinc-400 dark:text-zinc-500">未触发</span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-3.5">
                      {row.deferredRewardTier ? (
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{row.deferredRewardTier}</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">{row.deferredRewardWeeks || 0} 周后结算</p>
                        </div>
                      ) : (
                        <span className="text-sm text-zinc-400 dark:text-zinc-500">无</span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-3.5 text-sm text-zinc-500 dark:text-zinc-400">
                      {formatTableDateTime(row.createdAt)}
                    </TableCell>
                    <TableCell className="px-6 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={(event) => event.stopPropagation()}
                        className="rounded-md p-1.5 text-zinc-400 opacity-0 transition-colors group-hover:opacity-100 hover:bg-blue-50 hover:text-blue-600 focus:opacity-100 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50/50 px-6 py-4 text-sm dark:border-zinc-800 dark:bg-zinc-900/40">
            <p className="text-zinc-500 dark:text-zinc-400">
              第 {fromIndex}-{toIndex} 条，共 <span className="font-medium text-zinc-900 dark:text-zinc-100">{total}</span> 条
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-8 px-2 text-center text-sm font-medium text-zinc-900 dark:text-zinc-100">{currentPage}</div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Sheet open={Boolean(selectedRow)} onOpenChange={(open) => !open && setSelectedRowId(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto border-zinc-200 bg-white sm:max-w-lg dark:border-zinc-800 dark:bg-zinc-950">
          <SheetHeader>
            <SheetTitle>推荐详情</SheetTitle>
            <SheetDescription>查看推荐链路、奖励发放状态和延迟奖励信息。</SheetDescription>
          </SheetHeader>

          {selectedRow ? (
            <div className="mt-6 space-y-5">
              <Card className="border-zinc-200 bg-zinc-50/70 dark:border-zinc-800 dark:bg-zinc-900/60">
                <CardHeader>
                  <CardTitle className="text-base">当前状态</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 dark:text-zinc-400">状态</span>
                    <Badge variant="outline" className={`rounded-md px-2 py-0.5 text-xs ${STATUS_BADGE_MAP[selectedRow.status]}`}>
                      {STATUS_LABEL_MAP[selectedRow.status]}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 dark:text-zinc-400">注册时间</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{formatTableDateTime(selectedRow.createdAt)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-zinc-200 bg-zinc-50/70 dark:border-zinc-800 dark:bg-zinc-900/60">
                <CardHeader>
                  <CardTitle className="text-base">关系信息</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">推荐人 ({selectedRow.referrer.role})</p>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">{selectedRow.referrer.username}</p>
                    <p className="text-zinc-500 dark:text-zinc-400">{selectedRow.referrer.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">被推荐人 ({selectedRow.referee.role})</p>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">{selectedRow.referee.username}</p>
                    <p className="text-zinc-500 dark:text-zinc-400">{selectedRow.referee.email}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-zinc-200 bg-zinc-50/70 dark:border-zinc-800 dark:bg-zinc-900/60">
                <CardHeader>
                  <CardTitle className="text-base">奖励信息</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 dark:text-zinc-400">使用推荐码</span>
                    <div className="flex items-center gap-2">
                      <code className="rounded bg-zinc-200 px-1.5 py-0.5 font-mono text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        {selectedRow.referralCode}
                      </code>
                      <button
                        type="button"
                        className="rounded p-1 text-zinc-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                        onClick={(event) => handleCopyCode(selectedRow.referralCode, event)}
                      >
                        {copiedCode === selectedRow.referralCode ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 dark:text-zinc-400">基础奖励发放</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{selectedRow.rewardGranted ? '已发放' : '未触发'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 dark:text-zinc-400">奖励层级</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{selectedRow.deferredRewardTier || 'STANDARD'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 dark:text-zinc-400">延迟周数</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{selectedRow.deferredRewardWeeks || 0} 周</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 dark:text-zinc-400">结算时间</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{formatDateTime(selectedRow.deferredSettledAt)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  )
}
