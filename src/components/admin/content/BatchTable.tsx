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
  getImportTaskDetail,
  recomputeImportDiagnosticsForTask,
  resumeFailedImport,
} from '@/actions/content-pipeline/import-service'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface BatchTableProps {
  batches: BatchData[]
  onDataChanged?: () => void
}

const ITEMS_PER_PAGE = 8

function getStatusBadge(status: BatchStatusUI) {
  switch (status) {
    case 'Processing':
      return (
        <Badge className="border border-borderTone bg-[hsl(var(--state-info-bg))] text-[hsl(var(--state-info-fg))] dark:border-borderTone dark:bg-[hsl(var(--state-info-bg))] dark:text-[hsl(var(--state-info-fg))]">
          处理中
        </Badge>
      )
    case 'Completed':
      return (
        <Badge className="border border-borderTone bg-[hsl(var(--state-success-bg))] text-[hsl(var(--state-success-fg))] dark:border-borderTone dark:bg-[hsl(var(--state-success-bg))] dark:text-[hsl(var(--state-success-fg))]">
          完成
        </Badge>
      )
    case 'Error':
      return (
        <Badge className="border border-borderTone bg-[hsl(var(--state-danger-bg))] text-[hsl(var(--state-danger-fg))] dark:border-borderTone dark:bg-[hsl(var(--state-danger-bg))] dark:text-[hsl(var(--state-danger-fg))]">
          错误
        </Badge>
      )
    case 'Queued':
    case 'Pending':
      return (
        <Badge className="border border-borderTone bg-surface-subtle text-text-secondary dark:border-borderTone dark:bg-surface-subtle dark:text-text-secondary">
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
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--state-info-bg))] text-[hsl(var(--state-info-fg))] dark:bg-[hsl(var(--state-info-bg))] dark:text-[hsl(var(--state-info-fg))]">
          <FolderArchive className="h-5 w-5" />
        </div>
      )
    case 'Completed':
      return (
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--state-success-bg))] text-[hsl(var(--state-success-fg))] dark:bg-[hsl(var(--state-success-bg))] dark:text-[hsl(var(--state-success-fg))]">
          <CheckCircle2 className="h-5 w-5" />
        </div>
      )
    case 'Error':
      return (
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--state-danger-bg))] text-[hsl(var(--state-danger-fg))] dark:bg-[hsl(var(--state-danger-bg))] dark:text-[hsl(var(--state-danger-fg))]">
          <AlertCircle className="h-5 w-5" />
        </div>
      )
    default:
      return (
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-surface-subtle text-text-secondary dark:bg-surface-subtle dark:text-text-secondary">
          <Clock className="h-5 w-5" />
        </div>
      )
  }
}

function getProgressColor(status: BatchStatusUI) {
  switch (status) {
    case 'Processing':
      return 'bg-primary'
    case 'Completed':
      return 'bg-[hsl(var(--state-success-fg))]'
    case 'Error':
      return 'bg-[hsl(var(--state-danger-fg))]'
    default:
      return 'bg-text-tertiary'
  }
}

function buildImportDiagnosticsSummary(batch: BatchData): string | null {
  if (batch.diagnosticsSummary) return batch.diagnosticsSummary
  const diagnostics = batch.importDiagnostics
  if (!diagnostics) return null

  const summaryParts: string[] = []
  if (typeof diagnostics.expectedQuestionCount === 'number') {
    summaryParts.push(`预期 ${diagnostics.expectedQuestionCount} 题`)
  }
  if (typeof diagnostics.normalizedQuestionCount === 'number') {
    summaryParts.push(`解析 ${diagnostics.normalizedQuestionCount} 题`)
  }
  if (typeof diagnostics.createdQuestionCount === 'number') {
    summaryParts.push(`入库 ${diagnostics.createdQuestionCount} 题`)
  }
  if ((diagnostics.missingRawQuestionIds?.length || 0) > 0) {
    summaryParts.push(`缺失 ${diagnostics.missingRawQuestionIds!.length} 题`)
  }
  if ((diagnostics.duplicatedRawQuestionIds?.length || 0) > 0) {
    summaryParts.push(`重复 ${diagnostics.duplicatedRawQuestionIds!.length} 题`)
  }
  if ((diagnostics.failedQuestions?.length || 0) > 0) {
    summaryParts.push(`失败 ${diagnostics.failedQuestions!.length} 题`)
  }

  return summaryParts.length > 0 ? summaryParts.join(' / ') : null
}

function buildMissingQuestionPreview(batch: BatchData): string | null {
  if (batch.diagnosticsPreview) return batch.diagnosticsPreview
  const missingIds = batch.importDiagnostics?.missingRawQuestionIds ?? []
  if (missingIds.length === 0) return null
  const preview = missingIds.slice(0, 3).join(', ')
  return missingIds.length > 3 ? `缺失题号：${preview} 等` : `缺失题号：${preview}`
}

function formatDurationMs(value?: number): string {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return '-'
  if (value < 1000) return `${value}ms`
  const seconds = value / 1000
  if (seconds < 60) return `${seconds.toFixed(seconds >= 10 ? 1 : 2)}s`
  const minutes = Math.floor(seconds / 60)
  const remainSeconds = seconds % 60
  return `${minutes}m ${remainSeconds.toFixed(remainSeconds >= 10 ? 0 : 1)}s`
}

export function BatchTable({ batches, onDataChanged }: BatchTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [mounted, setMounted] = useState(false)
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false)
  const [diagnosticsLoading, setDiagnosticsLoading] = useState(false)
  const [diagnosticsRecomputing, setDiagnosticsRecomputing] = useState(false)
  const [diagnosticsTaskName, setDiagnosticsTaskName] = useState<string>('')
  const [diagnosticsSourceFileId, setDiagnosticsSourceFileId] = useState<string>('')
  const [diagnosticsData, setDiagnosticsData] = useState<BatchData['importDiagnostics'] | null>(null)

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

  const handleOpenDiagnostics = (batch: BatchData) => {
    setDiagnosticsTaskName(batch.sourceRemark || batch.name)
    setDiagnosticsSourceFileId(batch.id)
    setDiagnosticsData(batch.importDiagnostics ?? null)
    setDiagnosticsOpen(true)
    setDiagnosticsLoading(true)

    startTransition(async () => {
      const detail = await getImportTaskDetail(batch.id)
      if (detail.success && detail.data) {
        setDiagnosticsData(detail.data.sourceFile.importDiagnostics ?? null)
      } else if (!batch.importDiagnostics) {
        toast({
          variant: 'destructive',
          title: '读取诊断失败',
          description: detail.error || '当前批次暂无可读诊断信息',
        })
      }
      setDiagnosticsLoading(false)
    })
  }

  const handleRecomputeDiagnostics = () => {
    if (!diagnosticsSourceFileId) return
    setDiagnosticsRecomputing(true)
    startTransition(async () => {
      const res = await recomputeImportDiagnosticsForTask({
        sourceFileId: diagnosticsSourceFileId,
      })
      if (!res.success || !res.data) {
        toast({
          variant: 'destructive',
          title: '重算失败',
          description: res.error || '请稍后重试',
        })
        setDiagnosticsRecomputing(false)
        return
      }
      setDiagnosticsData(res.data.importDiagnostics)
      toast({
        title: '诊断已更新',
        description: res.data.diagnosticsSummary || '已完成诊断重算',
      })
      setDiagnosticsRecomputing(false)
      refreshData()
    })
  }

  const diagnosticsMissingIds = diagnosticsData?.missingRawQuestionIds ?? []
  const diagnosticsDuplicateIds = diagnosticsData?.duplicatedRawQuestionIds ?? []
  const diagnosticsFailedQuestions = diagnosticsData?.failedQuestions ?? []

  if (!mounted) {
    return (
      <div
        className="h-[420px] rounded-xl border border-borderTone bg-surface dark:border-borderTone dark:bg-surface"
        aria-hidden="true"
      />
    )
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-borderTone bg-surface shadow-surface dark:border-borderTone dark:bg-surface">
      <div className="border-b border-borderTone bg-surface-subtle p-4 dark:border-borderTone dark:bg-surface-subtle">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="group relative w-full xl:max-w-[26rem]">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-text-tertiary transition-colors group-focus-within:text-primary dark:text-text-tertiary dark:group-focus-within:text-primary" />
            </div>
            <Input
              className="h-10 border-borderTone bg-surface pl-10 text-text-primary placeholder:text-text-tertiary focus-visible:ring-primary/20 dark:border-borderTone dark:bg-surface dark:text-text-primary dark:placeholder:text-text-tertiary"
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
                tone: 'border-borderTone bg-[hsl(var(--state-info-bg))] text-[hsl(var(--state-info-fg))] dark:border-borderTone dark:bg-[hsl(var(--state-info-bg))] dark:text-[hsl(var(--state-info-fg))]',
              },
              {
                label: '处理中',
                value: statusCounts.processing,
                tone: 'border-borderTone bg-[hsl(var(--state-info-bg))] text-[hsl(var(--state-info-fg))] dark:border-borderTone dark:bg-[hsl(var(--state-info-bg))] dark:text-[hsl(var(--state-info-fg))]',
              },
              {
                label: '完成',
                value: statusCounts.completed,
                tone: 'border-borderTone bg-[hsl(var(--state-success-bg))] text-[hsl(var(--state-success-fg))] dark:border-borderTone dark:bg-[hsl(var(--state-success-bg))] dark:text-[hsl(var(--state-success-fg))]',
              },
              {
                label: '错误',
                value: statusCounts.error,
                tone: 'border-borderTone bg-[hsl(var(--state-danger-bg))] text-[hsl(var(--state-danger-fg))] dark:border-borderTone dark:bg-[hsl(var(--state-danger-bg))] dark:text-[hsl(var(--state-danger-fg))]',
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
                <span className="rounded-full bg-surface/80 px-1.5 py-0.5 text-[11px] dark:bg-surface-subtle">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-text-secondary dark:text-text-secondary">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>结果集 {statusCounts.total} 条</span>
          <span className="text-text-tertiary dark:text-text-tertiary">•</span>
          <span>支持按来源备注、任务 ID、科目、课程搜索</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table className="table-fixed">
          <TableHeader className="bg-surface-subtle dark:bg-surface-subtle">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[39%] text-text-tertiary dark:text-text-tertiary">
                批次名称
              </TableHead>
              <TableHead className="w-[14%] px-3 text-text-tertiary dark:text-text-tertiary">
                科目
              </TableHead>
              <TableHead className="w-[29%] px-3 text-text-tertiary dark:text-text-tertiary">
                进度
              </TableHead>
              <TableHead className="w-[10%] px-3 text-text-tertiary dark:text-text-tertiary">
                状态
              </TableHead>
              <TableHead className="w-[8%] px-3 text-right text-text-tertiary dark:text-text-tertiary">
                操作
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedBatches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-40 px-6 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-text-secondary dark:text-text-secondary">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-borderTone bg-surface-subtle dark:border-borderTone dark:bg-surface-subtle">
                      <Search className="h-5 w-5 text-text-tertiary dark:text-text-tertiary" />
                    </div>
                    <p className="text-sm font-medium text-text-primary dark:text-text-primary">
                      没有匹配到批次
                    </p>
                    <p className="text-xs text-text-secondary dark:text-text-secondary">
                      尝试更换关键词，或创建新的导入任务。
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedBatches.map((batch, index) => (
                <TableRow
                  key={batch.id}
                  className="group border-borderTone transition-colors hover:bg-surface-subtle dark:border-borderTone dark:hover:bg-surface-subtle"
                >
                  <TableCell className="py-3">
                    <div className="flex items-center">
                      {getStatusIcon(batch.status)}
                      <div className="ml-3">
                        <div className="truncate text-sm font-medium text-text-primary transition-colors group-hover:text-primary dark:text-text-primary dark:group-hover:text-primary">
                          {batch.sourceRemark || batch.name}
                        </div>
                        <div className="text-xs text-text-secondary dark:text-text-secondary">
                          ID: {batch.id} • {batch.fileCount} 文件
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-3 align-top">
                    <div className="text-sm text-text-primary dark:text-text-primary">
                      {batch.subject}
                    </div>
                    <div className="text-xs text-text-secondary dark:text-text-secondary">
                      {batch.curriculum || 'UEC'}
                    </div>
                    <div className="text-xs text-text-secondary dark:text-text-secondary">
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
                              ? 'text-[hsl(var(--state-danger-fg))]'
                              : batch.status === 'Processing'
                                ? 'text-[hsl(var(--state-info-fg))]'
                                : 'text-text-secondary dark:text-text-secondary'
                          }`}
                        >
                          {batch.statusMessage || batch.status}
                        </span>
                        <span className="text-text-secondary dark:text-text-secondary">
                          {batch.progress}%
                        </span>
                      </div>
                      <div className="flex h-2 overflow-hidden rounded bg-surface-subtle text-xs dark:bg-surface-subtle">
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
                      {buildImportDiagnosticsSummary(batch) && (
                        <div className="text-[11px] text-text-secondary dark:text-text-secondary">
                          {buildImportDiagnosticsSummary(batch)}
                        </div>
                      )}
                      {buildMissingQuestionPreview(batch) && (
                        <div className="text-[11px] text-text-tertiary dark:text-text-tertiary">
                          {buildMissingQuestionPreview(batch)}
                        </div>
                      )}
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
                          className="h-8 w-8 text-text-secondary hover:bg-surface-subtle hover:text-text-primary dark:text-text-secondary dark:hover:bg-surface-subtle dark:hover:text-text-primary"
                          disabled={isPending}
                        >
                          <MoreVertical className="h-4 w-4" />
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
                          onClick={() => handleOpenDiagnostics(batch)}
                        >
                          <FileSearch className="h-4 w-4" />
                          查看导入诊断
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
                          className="text-[hsl(var(--state-danger-fg))] focus:text-[hsl(var(--state-danger-fg))]"
                          onClick={() => handleDeleteTask(batch.id, false)}
                        >
                          <Trash2 className="h-4 w-4" />
                          删除任务（保留题目）
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-[hsl(var(--state-danger-fg))] focus:text-[hsl(var(--state-danger-fg))]"
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

      <div className="border-t border-borderTone bg-surface-subtle px-4 py-4 dark:border-borderTone dark:bg-surface-subtle sm:px-6">
        <div className="flex flex-1 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-text-secondary dark:text-text-secondary">
              显示{' '}
              <span className="font-medium text-text-primary dark:text-text-primary">
                {filteredBatches.length > 0 ? startIndex + 1 : 0}
              </span>{' '}
              到{' '}
              <span className="font-medium text-text-primary dark:text-text-primary">
                {Math.min(endIndex, filteredBatches.length)}
              </span>{' '}
              共{' '}
              <span className="font-medium text-text-primary dark:text-text-primary">
                {filteredBatches.length}
              </span>{' '}
              批次
            </p>
            <p className="mt-1 text-xs text-text-secondary dark:text-text-secondary">
              分页导航已增强，可快速切换处理结果与异常任务。
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-2xl border border-borderTone bg-surface p-1 shadow-sm dark:border-borderTone dark:bg-surface">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-xl border-0 bg-transparent text-text-secondary hover:bg-surface-subtle hover:text-text-primary dark:text-text-secondary dark:hover:bg-surface-subtle dark:hover:text-text-primary"
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
                        ? 'bg-primary text-white shadow-[0_10px_20px_rgba(29,78,216,0.18)] dark:bg-primary dark:text-primary-foreground'
                        : 'bg-transparent text-text-secondary hover:bg-surface-subtle hover:text-text-primary dark:text-text-secondary dark:hover:bg-surface-subtle dark:hover:text-text-primary'
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
                className="h-9 w-9 rounded-xl border-0 bg-transparent text-text-secondary hover:bg-surface-subtle hover:text-text-primary dark:text-text-secondary dark:hover:bg-surface-subtle dark:hover:text-text-primary"
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

      <Dialog open={diagnosticsOpen} onOpenChange={setDiagnosticsOpen}>
        <DialogContent className="max-w-3xl border-borderTone bg-surface text-text-primary">
          <DialogHeader>
            <DialogTitle>导入诊断</DialogTitle>
            <DialogDescription className="text-text-secondary">
              {diagnosticsTaskName || '当前批次'} 的抓取与入库诊断信息
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRecomputeDiagnostics}
              disabled={isPending || diagnosticsRecomputing}
            >
              {diagnosticsRecomputing ? '重算中...' : '重新计算诊断'}
            </Button>
          </div>

          {diagnosticsLoading && !diagnosticsData ? (
            <div className="rounded-2xl border border-borderTone bg-surface-subtle p-6 text-sm text-text-secondary">
              正在加载诊断信息...
            </div>
          ) : diagnosticsData ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ['预期题数', diagnosticsData.expectedQuestionCount ?? 0],
                  ['解析题数', diagnosticsData.normalizedQuestionCount ?? 0],
                  ['入库题数', diagnosticsData.createdQuestionCount ?? 0],
                  ['缺失题数', diagnosticsMissingIds.length],
                ].map(([label, value]) => (
                  <div
                    key={String(label)}
                    className="rounded-2xl border border-borderTone bg-surface-subtle p-4"
                  >
                    <div className="text-xs text-text-secondary">{label}</div>
                    <div className="mt-2 text-2xl font-semibold text-text-primary">
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-borderTone bg-surface-subtle p-4">
                  <div className="text-sm font-medium text-text-primary">
                    缺失题号
                  </div>
                  <div className="mt-2 text-sm text-text-secondary">
                    {diagnosticsMissingIds.length > 0
                      ? diagnosticsMissingIds.join(', ')
                      : '当前没有缺失题号'}
                  </div>
                </div>

                <div className="rounded-2xl border border-borderTone bg-surface-subtle p-4">
                  <div className="text-sm font-medium text-text-primary">
                    重复题号
                  </div>
                  <div className="mt-2 text-sm text-text-secondary">
                    {diagnosticsDuplicateIds.length > 0
                      ? diagnosticsDuplicateIds.join(', ')
                      : '当前没有重复题号'}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-borderTone bg-surface-subtle p-4">
                <div className="text-sm font-medium text-text-primary">
                  失败明细
                </div>
                <div className="mt-2 space-y-2 text-sm text-text-secondary">
                  {diagnosticsFailedQuestions.length > 0 ? (
                    diagnosticsFailedQuestions.map((item, index) => (
                      <div key={`${item.rawQuestionId || 'unknown'}-${index}`}>
                        {(item.rawQuestionId || '未知题号') + '：' + item.reason}
                      </div>
                    ))
                  ) : (
                    <div>当前没有失败题。</div>
                  )}
                </div>
              </div>

              {diagnosticsData.stageDurations ? (
                <div className="rounded-2xl border border-borderTone bg-surface-subtle p-4">
                  <div className="text-sm font-medium text-text-primary">
                    阶段耗时
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      ['网页抓取', diagnosticsData.stageDurations.crawlMs],
                      ['图片转存', diagnosticsData.stageDurations.imagePersistMs],
                      ['章节打标', diagnosticsData.stageDurations.chapterTaggingMs],
                      ['批量入库', diagnosticsData.stageDurations.saveMs],
                      ['提交审核', diagnosticsData.stageDurations.reviewSubmitMs],
                      ['总耗时', diagnosticsData.stageDurations.totalMs],
                    ].map(([label, value]) => (
                      <div
                        key={String(label)}
                        className="rounded-xl border border-borderTone/70 bg-background/40 p-3"
                      >
                        <div className="text-xs text-text-secondary">{label}</div>
                        <div className="mt-1 text-sm font-medium text-text-primary">
                          {formatDurationMs(typeof value === 'number' ? value : undefined)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-2xl border border-borderTone bg-surface-subtle p-6 text-sm text-text-secondary">
              当前批次还没有可显示的导入诊断信息。
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
