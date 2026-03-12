'use client'

import React, { useMemo, useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  FolderArchive,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  Trash2,
  ExternalLink,
  Clipboard,
  Link2,
  FileSearch,
  Sparkles,
} from 'lucide-react'
import { BatchData, BatchStatusUI } from '@/types/content-pipeline'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import {
  deleteImportTask,
  resumeFailedImport,
} from '@/actions/content-pipeline/import-service'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

interface BatchTableProps {
  batches: BatchData[]
  onDataChanged?: () => void
}

const ITEMS_PER_PAGE = 8

function getStatusBadge(status: BatchStatusUI) {
  switch (status) {
    case 'Processing':
      return (
        <Badge className="border border-[#3B82F6]/30 bg-[#1E3A8A]/30 text-[#93C5FD]">
          处理中
        </Badge>
      )
    case 'Completed':
      return (
        <Badge className="border border-[#22C55E]/30 bg-[#14532D]/30 text-[#86EFAC]">
          完成
        </Badge>
      )
    case 'Error':
      return (
        <Badge className="border border-[#EF4444]/30 bg-[#7F1D1D]/30 text-[#FCA5A5]">
          错误
        </Badge>
      )
    case 'Queued':
    case 'Pending':
      return (
        <Badge className="border border-[#334155] bg-[#1E293B] text-[#94A3B8]">
          排队中
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function getStatusIcon(status: BatchStatusUI) {
  switch (status) {
    case 'Processing':
      return (
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#1E3A8A]/30 text-[#93C5FD]">
          <FolderArchive className="h-5 w-5" />
        </div>
      )
    case 'Completed':
      return (
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#14532D]/30 text-[#86EFAC]">
          <CheckCircle2 className="h-5 w-5" />
        </div>
      )
    case 'Error':
      return (
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#7F1D1D]/30 text-[#FCA5A5]">
          <AlertCircle className="h-5 w-5" />
        </div>
      )
    default:
      return (
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#1E293B] text-[#94A3B8]">
          <Clock className="h-5 w-5" />
        </div>
      )
  }
}

function getProgressColor(status: BatchStatusUI) {
  switch (status) {
    case 'Processing':
      return 'bg-[#3B82F6]'
    case 'Completed':
      return 'bg-[#22C55E]'
    case 'Error':
      return 'bg-[#EF4444]'
    default:
      return 'bg-[#64748B]'
  }
}

export function BatchTable({ batches, onDataChanged }: BatchTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [mounted, setMounted] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const filteredBatches = useMemo(
    () =>
      batches.filter((batch) => {
        const keyword = searchQuery.trim().toLowerCase()
        const matchesSearch =
          keyword.length === 0 ||
          batch.name.toLowerCase().includes(keyword) ||
          batch.id.toLowerCase().includes(keyword) ||
          batch.subject.toLowerCase().includes(keyword) ||
          (batch.sourceRemark || '').toLowerCase().includes(keyword) ||
          (batch.curriculum || '').toLowerCase().includes(keyword)
        return matchesSearch
      }),
    [batches, searchQuery]
  )
  const statusCounts = useMemo(
    () => ({
      total: filteredBatches.length,
      processing: filteredBatches.filter(
        (batch) => batch.status === 'Processing'
      ).length,
      completed: filteredBatches.filter((batch) => batch.status === 'Completed')
        .length,
      error: filteredBatches.filter((batch) => batch.status === 'Error').length,
    }),
    [filteredBatches]
  )

  const totalPages = Math.max(
    1,
    Math.ceil(filteredBatches.length / ITEMS_PER_PAGE)
  )
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedBatches = filteredBatches.slice(startIndex, endIndex)

  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const refreshData = () => {
    onDataChanged?.()
    router.refresh()
  }

  const handleRetry = (sourceFileId: string) => {
    startTransition(async () => {
      const res = await resumeFailedImport({ sourceFileId })
      if (!res.success || !res.data) {
        toast({
          variant: 'destructive',
          title: '重试失败',
          description: res.error || '请稍后再试',
        })
        return
      }
      toast({
        title: '已触发重试',
        description: `成功 ${res.data.questionsCreated} 题，重复 ${res.data.questionsDuplicated} 题，失败 ${res.data.questionsFailed} 题。`,
      })
      refreshData()
    })
  }

  const handleDeleteTask = (sourceFileId: string, deleteQuestions: boolean) => {
    const ok = window.confirm(
      deleteQuestions
        ? '确认删除该任务及其关联题目？此操作不可撤销。'
        : '确认删除该任务记录？题目数据将保留。'
    )
    if (!ok) return

    startTransition(async () => {
      const res = await deleteImportTask(sourceFileId, { deleteQuestions })
      if (!res.success) {
        toast({
          variant: 'destructive',
          title: '删除失败',
          description: res.error || '请稍后再试',
        })
        return
      }
      toast({
        title: '删除成功',
        description: deleteQuestions
          ? `已删除任务与 ${res.data?.questionsDeleted || 0} 道题目`
          : '已删除任务记录',
      })
      refreshData()
    })
  }

  const handleCopy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value)
      toast({ title: '已复制', description: `${label}已复制到剪贴板` })
    } catch {
      toast({
        variant: 'destructive',
        title: '复制失败',
        description: '当前浏览器不支持复制操作',
      })
    }
  }

  if (!mounted) {
    return (
      <div
        className="h-[420px] rounded-xl border border-[#24324D] bg-[#111A2E]"
        aria-hidden="true"
      />
    )
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-[#24324D] bg-[#111A2E] shadow-[0_18px_40px_rgba(2,8,23,0.35)]">
      <div className="border-b border-[#24324D] bg-[linear-gradient(180deg,#151F36_0%,#111A2E_100%)] p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="group relative w-full xl:max-w-[26rem]">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-[#7D8CA6] transition-colors group-focus-within:text-[#3B82F6]" />
            </div>
            <Input
              className="h-10 border-[#24324D] bg-[#0F172A] pl-10 text-[#E6EDF7] placeholder:text-[#7D8CA6] focus-visible:ring-[#3B82F6]"
              placeholder="搜索来源备注、ID 或科目..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              {
                label: '全部',
                value: statusCounts.total,
                tone: 'border-[#304664] bg-[#10203B] text-[#D6E7FF]',
              },
              {
                label: '处理中',
                value: statusCounts.processing,
                tone: 'border-[#2A4C83] bg-[#10244A] text-[#93C5FD]',
              },
              {
                label: '完成',
                value: statusCounts.completed,
                tone: 'border-[#28533E] bg-[#102C20] text-[#86EFAC]',
              },
              {
                label: '错误',
                value: statusCounts.error,
                tone: 'border-[#6B2630] bg-[#31141B] text-[#FCA5A5]',
              },
            ].map((item) => (
              <div
                key={item.label}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium',
                  item.tone
                )}
              >
                <span>{item.label}</span>
                <span className="rounded-full bg-black/15 px-1.5 py-0.5 text-[11px]">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#8EA3C0]">
          <Sparkles className="h-3.5 w-3.5 text-[#60A5FA]" />
          <span>结果集 {statusCounts.total} 条</span>
          <span className="text-[#59708E]">•</span>
          <span>支持按来源备注、任务 ID、科目、课程搜索</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table className="table-fixed">
          <TableHeader className="bg-[#151F36]">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[39%] text-[#9FB0C9]">批次名称</TableHead>
              <TableHead className="w-[14%] px-3 text-[#9FB0C9]">
                科目
              </TableHead>
              <TableHead className="w-[29%] px-3 text-[#9FB0C9]">
                进度
              </TableHead>
              <TableHead className="w-[10%] px-3 text-[#9FB0C9]">
                状态
              </TableHead>
              <TableHead className="w-[8%] px-3 text-right text-[#9FB0C9]">
                操作
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedBatches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-40 px-6 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-[#7D8CA6]">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#24324D] bg-[#151F36]">
                      <Search className="h-5 w-5 text-[#8EA3C0]" />
                    </div>
                    <p className="text-sm font-medium text-[#B2C3DA]">
                      没有匹配到批次
                    </p>
                    <p className="text-xs text-[#7D8CA6]">
                      尝试更换关键词，或创建新的导入任务。
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedBatches.map((batch, index) => (
                <TableRow
                  key={batch.id}
                  className="group border-[#24324D] transition-colors hover:bg-[#1A2744]/60"
                >
                  <TableCell className="py-3">
                    <div className="flex items-center">
                      {getStatusIcon(batch.status)}
                      <div className="ml-3">
                        <div className="truncate text-sm font-medium text-[#E6EDF7] transition-colors group-hover:text-[#93C5FD]">
                          {batch.sourceRemark || batch.name}
                        </div>
                        <div className="text-xs text-[#7D8CA6]">
                          ID: {batch.id} • {batch.fileCount} 文件
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-3 align-top">
                    <div className="text-sm text-[#E6EDF7]">
                      {batch.subject}
                    </div>
                    <div className="text-xs text-[#7D8CA6]">
                      {batch.curriculum || 'UEC'}
                    </div>
                    <div className="text-xs text-[#7D8CA6]">
                      {format(batch.createdAt, 'yyyy-MM-dd HH:mm', {
                        locale: zhCN,
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-3">
                    <div className="w-full space-y-2">
                      <div className="flex justify-between text-xs">
                        <span
                          className={`font-medium ${
                            batch.status === 'Error'
                              ? 'text-[#FCA5A5]'
                              : batch.status === 'Processing'
                                ? 'text-[#93C5FD]'
                                : 'text-[#9FB0C9]'
                          }`}
                        >
                          {batch.statusMessage || batch.status}
                        </span>
                        <span className="text-[#7D8CA6]">
                          {batch.progress}%
                        </span>
                      </div>
                      <div className="flex h-2 overflow-hidden rounded bg-[#0F172A] text-xs">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${batch.progress}%` }}
                          transition={{
                            duration: 0.8,
                            ease: 'easeOut',
                            delay: index * 0.05,
                          }}
                          className={`flex flex-col justify-center whitespace-nowrap text-center text-white shadow-none ${getProgressColor(
                            batch.status
                          )}`}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-3">
                    {getStatusBadge(batch.status)}
                  </TableCell>
                  <TableCell className="px-3 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          disabled={isPending}
                        >
                          <MoreVertical className="h-4 w-4 text-[#9FB0C9]" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>任务操作</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            batch.sourceFileUrl &&
                            window.open(
                              batch.sourceFileUrl,
                              '_blank',
                              'noopener,noreferrer'
                            )
                          }
                          disabled={!batch.sourceFileUrl}
                        >
                          <ExternalLink className="h-4 w-4" />
                          打开来源链接
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleCopy(batch.id, '任务 ID')}
                        >
                          <Clipboard className="h-4 w-4" />
                          复制任务 ID
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            batch.sourceFileUrl &&
                            handleCopy(batch.sourceFileUrl, '来源链接')
                          }
                          disabled={!batch.sourceFileUrl}
                        >
                          <Link2 className="h-4 w-4" />
                          复制来源链接
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/admin/content/review?sourceFileId=${batch.id}`
                            )
                          }
                        >
                          <FileSearch className="h-4 w-4" />
                          跳转审核页
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleRetry(batch.id)}
                          disabled={batch.status !== 'Error'}
                        >
                          <RefreshCcw className="h-4 w-4" />
                          重试任务
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => handleDeleteTask(batch.id, false)}
                        >
                          <Trash2 className="h-4 w-4" />
                          删除任务（保留题目）
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => handleDeleteTask(batch.id, true)}
                        >
                          <Trash2 className="h-4 w-4" />
                          删除任务与题目
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="border-t border-[#24324D] bg-[#111A2E] px-4 py-4 sm:px-6">
        <div className="flex flex-1 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-[#9FB0C9]">
              显示{' '}
              <span className="font-medium text-[#E6EDF7]">
                {filteredBatches.length > 0 ? startIndex + 1 : 0}
              </span>{' '}
              到{' '}
              <span className="font-medium text-[#E6EDF7]">
                {Math.min(endIndex, filteredBatches.length)}
              </span>{' '}
              共{' '}
              <span className="font-medium text-[#E6EDF7]">
                {filteredBatches.length}
              </span>{' '}
              批次
            </p>
            <p className="mt-1 text-xs text-[#7D8CA6]">
              分页导航已增强，可快速切换处理结果与异常任务。
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-2xl border border-[#24324D] bg-[#151F36] p-1 shadow-sm">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-xl border-0 bg-transparent text-[#9FB0C9] hover:bg-[#1A2744]"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant="outline"
                    className={`h-9 rounded-xl border-0 px-4 ${
                      currentPage === page
                        ? 'bg-[linear-gradient(135deg,#163B74,#1D4ED8)] text-[#EAF3FF] shadow-[0_10px_20px_rgba(29,78,216,0.25)]'
                        : 'bg-transparent text-[#9FB0C9] hover:bg-[#1A2744]'
                    }`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                )
              )}
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-xl border-0 bg-transparent text-[#9FB0C9] hover:bg-[#1A2744]"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  )
}
