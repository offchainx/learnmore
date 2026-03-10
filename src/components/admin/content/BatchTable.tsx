'use client'

import React, { useMemo, useState, useTransition } from 'react'
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
} from 'lucide-react'
import { BatchData, BatchStatusUI } from '@/types/content-pipeline'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { deleteImportTask, resumeFailedImport } from '@/actions/content-pipeline/import-service'
import { useToast } from '@/components/ui/use-toast'

interface BatchTableProps {
  batches: BatchData[]
  onDataChanged?: () => void
}

const ITEMS_PER_PAGE = 8

function getStatusBadge(status: BatchStatusUI) {
  switch (status) {
    case 'Processing':
      return (
        <Badge className="bg-[#1E3A8A]/30 text-[#93C5FD] border border-[#3B82F6]/30">
          处理中
        </Badge>
      )
    case 'Completed':
      return (
        <Badge className="bg-[#14532D]/30 text-[#86EFAC] border border-[#22C55E]/30">
          完成
        </Badge>
      )
    case 'Error':
      return (
        <Badge className="bg-[#7F1D1D]/30 text-[#FCA5A5] border border-[#EF4444]/30">
          错误
        </Badge>
      )
    case 'Queued':
    case 'Pending':
      return (
        <Badge className="bg-[#1E293B] text-[#94A3B8] border border-[#334155]">
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
        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-[#1E3A8A]/30 rounded-lg text-[#93C5FD]">
          <FolderArchive className="h-5 w-5" />
        </div>
      )
    case 'Completed':
      return (
        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-[#14532D]/30 rounded-lg text-[#86EFAC]">
          <CheckCircle2 className="h-5 w-5" />
        </div>
      )
    case 'Error':
      return (
        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-[#7F1D1D]/30 rounded-lg text-[#FCA5A5]">
          <AlertCircle className="h-5 w-5" />
        </div>
      )
    default:
      return (
        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-[#1E293B] rounded-lg text-[#94A3B8]">
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

  const totalPages = Math.max(1, Math.ceil(filteredBatches.length / ITEMS_PER_PAGE))
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
        description: deleteQuestions ? `已删除任务与 ${res.data?.questionsDeleted || 0} 道题目` : '已删除任务记录',
      })
      refreshData()
    })
  }

  const handleCopy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value)
      toast({ title: '已复制', description: `${label}已复制到剪贴板` })
    } catch {
      toast({ variant: 'destructive', title: '复制失败', description: '当前浏览器不支持复制操作' })
    }
  }

  if (!mounted) {
    return <div className="h-[420px] rounded-xl border border-[#24324D] bg-[#111A2E]" aria-hidden="true" />
  }

  return (
    <div className="bg-[#111A2E] border border-[#24324D] rounded-xl overflow-hidden shadow-[0_6px_20px_rgba(0,0,0,0.2)]">
      <div className="p-3 border-b border-[#24324D] flex flex-col sm:flex-row gap-3 justify-between items-center bg-[#151F36]">
        <div className="relative w-full sm:w-96 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-[#7D8CA6] group-focus-within:text-[#3B82F6] transition-colors" />
          </div>
          <Input
            className="pl-10 h-10 border-[#24324D] bg-[#0F172A] text-[#E6EDF7] placeholder:text-[#7D8CA6] focus-visible:ring-[#3B82F6]"
            placeholder="搜索来源备注、ID 或科目..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-[#151F36]">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-[#9FB0C9]">批次名称</TableHead>
              <TableHead className="text-[#9FB0C9]">科目</TableHead>
              <TableHead className="text-[#9FB0C9] w-1/3">进度</TableHead>
              <TableHead className="text-[#9FB0C9]">状态</TableHead>
              <TableHead className="text-right text-[#9FB0C9]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedBatches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-[#7D8CA6]">
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              paginatedBatches.map((batch) => (
                <TableRow
                  key={batch.id}
                  className="hover:bg-[#1A2744]/60 transition-colors group border-[#24324D]"
                >
                  <TableCell>
                    <div className="flex items-center">
                      {getStatusIcon(batch.status)}
                      <div className="ml-3">
                        <div className="text-sm font-medium text-[#E6EDF7] group-hover:text-[#93C5FD] transition-colors">
                          {batch.sourceRemark || batch.name}
                        </div>
                        <div className="text-xs text-[#7D8CA6]">
                          ID: {batch.id} • {batch.fileCount} 文件
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="text-sm text-[#E6EDF7]">{batch.subject}</div>
                    <div className="text-xs text-[#7D8CA6]">{batch.curriculum || 'UEC'}</div>
                    <div className="text-xs text-[#7D8CA6]">
                      {format(batch.createdAt, 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                    </div>
                  </TableCell>
                  <TableCell>
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
                        <span className="text-[#7D8CA6]">{batch.progress}%</span>
                      </div>
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-[#0F172A]">
                        <div
                          className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-1000 ${getProgressColor(
                            batch.status
                          )}`}
                          style={{ width: `${batch.progress}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(batch.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isPending}>
                          <MoreVertical className="h-4 w-4 text-[#9FB0C9]" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>任务操作</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            batch.sourceFileUrl && window.open(batch.sourceFileUrl, '_blank', 'noopener,noreferrer')
                          }
                          disabled={!batch.sourceFileUrl}
                        >
                          <ExternalLink className="h-4 w-4" />
                          打开来源链接
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCopy(batch.id, '任务 ID')}>
                          <Clipboard className="h-4 w-4" />
                          复制任务 ID
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => batch.sourceFileUrl && handleCopy(batch.sourceFileUrl, '来源链接')}
                          disabled={!batch.sourceFileUrl}
                        >
                          <Link2 className="h-4 w-4" />
                          复制来源链接
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/admin/content/review?sourceFileId=${batch.id}`)}>
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

      <div className="bg-[#111A2E] px-4 py-3 border-t border-[#24324D] flex items-center justify-between sm:px-6">
        <div className="flex-1 flex items-center justify-between">
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
              共 <span className="font-medium text-[#E6EDF7]">{filteredBatches.length}</span> 批次
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-l-md border-[#24324D] bg-[#151F36] text-[#9FB0C9] hover:bg-[#1A2744]"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant="outline"
                  className={`h-9 px-4 border-[#24324D] ${
                    currentPage === page
                      ? 'bg-[#1E3A8A]/30 border-[#3B82F6]/40 text-[#93C5FD]'
                      : 'bg-[#151F36] text-[#9FB0C9] hover:bg-[#1A2744]'
                  }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-r-md border-[#24324D] bg-[#151F36] text-[#9FB0C9] hover:bg-[#1A2744]"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
