'use client'

import { useMemo, useState } from 'react'
import { Search, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react'

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
  PENDING: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  COMPLETED: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  DEFERRED: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30',
  EXPIRED: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  CANCELLED: 'bg-rose-500/10 text-rose-600 border-rose-500/30',
}

const TREND_CLASS_MAP = {
  up: 'text-emerald-600',
  down: 'text-rose-600',
  flat: 'text-slate-500',
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

  return true
}

export function AdminReferralsView({
  metrics,
  rows,
  filters,
  onFilterChange,
  onRowClick,
  pagination,
  lastUpdatedLabel,
}: AdminReferralsViewProps) {
  const mergedInitialFilters = { ...DEFAULT_FILTERS, ...filters }
  const [keyword, setKeyword] = useState(mergedInitialFilters.keyword)
  const [status, setStatus] = useState(mergedInitialFilters.status)
  const [role, setRole] = useState(mergedInitialFilters.role)
  const [dateRange, setDateRange] = useState(mergedInitialFilters.dateRange)
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null)
  const [page, setPage] = useState(pagination?.page || 1)

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">推荐关系管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            审核推荐绑定状态、奖励发放进度和延迟结算情况。
          </p>
        </div>
        <p className="text-xs text-muted-foreground">最后更新：{resolvedLastUpdatedLabel}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.key}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{metric.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between gap-4">
                <p className="text-2xl font-semibold tracking-tight">{metric.value}</p>
                {metric.delta ? (
                  <span className={`text-xs font-medium ${TREND_CLASS_MAP[metric.trend || 'flat']}`}>
                    {metric.delta}
                  </span>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={keyword}
                  onChange={(event) => handleKeywordChange(event.target.value)}
                  className="pl-9"
                  placeholder="搜索推荐码、用户名或邮箱"
                />
              </div>
            </div>

            <div className="lg:col-span-2">
              <Select value={status} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">全部状态</SelectItem>
                  <SelectItem value="PENDING">待完成</SelectItem>
                  <SelectItem value="COMPLETED">已完成</SelectItem>
                  <SelectItem value="DEFERRED">延迟发放</SelectItem>
                  <SelectItem value="EXPIRED">已过期</SelectItem>
                  <SelectItem value="CANCELLED">已取消</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="lg:col-span-2">
              <Select value={role} onValueChange={handleRoleChange}>
                <SelectTrigger>
                  <SelectValue placeholder="角色" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">全部角色</SelectItem>
                  <SelectItem value="ADMIN">管理员</SelectItem>
                  <SelectItem value="TEACHER">教师</SelectItem>
                  <SelectItem value="STUDENT">学员</SelectItem>
                  <SelectItem value="PARENT">家长</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="lg:col-span-2">
              <Select value={dateRange} onValueChange={handleDateRangeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="日期范围" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">全部时间</SelectItem>
                  <SelectItem value="7D">近 7 天</SelectItem>
                  <SelectItem value="30D">近 30 天</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="lg:col-span-2">
              <Button variant="outline" className="w-full" onClick={resetFilters}>
                <RotateCcw className="mr-2 h-4 w-4" />
                重置筛选
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>推荐人</TableHead>
                <TableHead>被推荐人</TableHead>
                <TableHead>推荐码</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>奖励发放</TableHead>
                <TableHead>延迟奖励</TableHead>
                <TableHead>注册时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-16 text-center text-sm text-muted-foreground">
                    暂无符合筛选条件的推荐记录
                  </TableCell>
                </TableRow>
              ) : (
                pageRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="max-w-[220px] truncate font-medium" title={row.referrer.username}>{row.referrer.username}</p>
                        <p className="max-w-[220px] truncate text-xs text-muted-foreground" title={row.referrer.email}>{row.referrer.email}</p>
                        <p className="text-xs text-blue-600">{row.referrer.role}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="max-w-[220px] truncate font-medium" title={row.referee.username}>{row.referee.username}</p>
                        <p className="max-w-[220px] truncate text-xs text-muted-foreground" title={row.referee.email}>{row.referee.email}</p>
                        <p className="text-xs text-emerald-600">{row.referee.role}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs uppercase">{row.referralCode}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={STATUS_BADGE_MAP[row.status]}>
                        {STATUS_LABEL_MAP[row.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {row.rewardGranted ? (
                        <span className="text-sm font-medium text-emerald-600">已发放</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">未发放</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {row.status === 'DEFERRED' || (row.deferredRewardWeeks || 0) > 0 ? (
                        <div className="space-y-1 text-xs">
                          <p>
                            <span className="text-muted-foreground">Tier：</span>
                            <span className="font-medium">{row.deferredRewardTier || 'STANDARD'}</span>
                          </p>
                          <p>
                            <span className="text-muted-foreground">Weeks：</span>
                            <span className="font-medium">{row.deferredRewardWeeks || 0}</span>
                          </p>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(row.createdAt).toLocaleDateString('zh-CN')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => openDetails(row)}>
                        查看
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="mt-4 flex items-center justify-between gap-3 text-sm">
            <p className="text-muted-foreground">共 {total} 条，当前第 {currentPage}/{totalPages} 页</p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />上一页
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                下一页<ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Sheet open={Boolean(selectedRow)} onOpenChange={(open) => !open && setSelectedRowId(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>推荐详情</SheetTitle>
            <SheetDescription>查看推荐链路、状态及延迟奖励结算信息。</SheetDescription>
          </SheetHeader>

          {selectedRow ? (
            <div className="mt-6 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">推荐关系</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">推荐人：</span>{selectedRow.referrer.username} ({selectedRow.referrer.email})</p>
                  <p><span className="text-muted-foreground">被推荐人：</span>{selectedRow.referee.username} ({selectedRow.referee.email})</p>
                  <p><span className="text-muted-foreground">推荐码：</span><span className="font-mono">{selectedRow.referralCode}</span></p>
                  <p>
                    <span className="text-muted-foreground">当前状态：</span>
                    <Badge variant="outline" className={STATUS_BADGE_MAP[selectedRow.status]}>
                      {STATUS_LABEL_MAP[selectedRow.status]}
                    </Badge>
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">奖励信息</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">奖励发放：</span>{selectedRow.rewardGranted ? '已发放' : '未发放'}</p>
                  <p><span className="text-muted-foreground">延迟奖励层级：</span>{selectedRow.deferredRewardTier || 'STANDARD'}</p>
                  <p><span className="text-muted-foreground">延迟周数：</span>{selectedRow.deferredRewardWeeks || 0}</p>
                  <p><span className="text-muted-foreground">延迟结算时间：</span>{formatDateTime(selectedRow.deferredSettledAt)}</p>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  )
}
