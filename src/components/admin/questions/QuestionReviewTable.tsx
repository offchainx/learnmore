'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge, BadgeProps } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  MoreHorizontal,
  CheckCircle,
  XCircle,
  ArrowUpCircle,
  ClipboardCheck,
  Trash2,
  Sparkles,
} from 'lucide-react'
import { DifficultyBadge } from '../common/DifficultyBadge'
import { QualityScoreBadge } from '../common/QualityScoreBadge'
import { QuestionWithRelations } from '@/lib/content-pipeline/types'
import { ContentStatus } from '@prisma/client'
import {
  bulkDeleteQuestions,
  bulkAutoTagQuestionChapters,
  bulkUpdateQuestionStatus,
  deleteQuestion,
} from '@/actions/content-pipeline/question-service'
import { useToast } from '@/components/ui/use-toast'
import {
  pageSectionHeaderBandClass,
  pageTableShellClass,
} from '@/components/shared/pageSurfaces'
import { cn } from '@/lib/utils'

interface QuestionReviewTableProps {
  questions: QuestionWithRelations[]
  page: number
  totalPages: number
  currentTab?: string
}

export function QuestionReviewTable({
  questions,
  page,
  totalPages,
  currentTab = 'all',
}: QuestionReviewTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isUpdating, setIsUpdating] = useState(false)
  const isDeletedView = currentTab === 'deleted'

  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle row selection
  const toggleSelectAll = () => {
    if (selectedIds.length === questions.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(questions.map((q) => q.id))
    }
  }

  const toggleSelectRow = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((itemId) => itemId !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  // Handle bulk actions
  const handleBulkStatusUpdate = async (newStatus: ContentStatus) => {
    if (selectedIds.length === 0) return

    setIsUpdating(true)
    try {
      // In a real app, we should get the current user ID
      // For now using a placeholder or assuming the action handles it safely if missing
      // The action expects reviewerId.
      // Since this is a client component, we might need to pass it or have the action handle it via session.
      // Looking at the action, it takes reviewerId.
      // We'll pass a placeholder 'ADMIN' for now, but ideally this comes from session context.

      const result = await bulkUpdateQuestionStatus({
        questionIds: selectedIds,
        newStatus,
        comment: 'Bulk update via Admin Interface',
      })

      if (result.success) {
        toast({
          title: '操作成功',
          description: `已成功更新 ${result.succeeded} 个题目的状态`,
        })
        setSelectedIds([])
        router.refresh()
      } else {
        const firstError = result.results.find((item) => !item.success)?.error
        toast({
          variant: 'destructive',
          title: '操作失败',
          description: firstError ? `更新失败: ${firstError}` : `更新失败: ${result.failed} 个错误`,
        })
      }
    } catch {
      toast({
        variant: 'destructive',
        title: '错误',
        description: '发生未知错误',
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0 || isDeletedView) return
    if (!window.confirm(`确认删除已选中的 ${selectedIds.length} 道题目？删除后会移入“已删除”列表。`)) {
      return
    }

    setIsUpdating(true)
    try {
      const result = await bulkDeleteQuestions(selectedIds, undefined, {
        comment: 'Bulk delete via Admin Interface',
      })

      if (result.success) {
        toast({
          title: '删除成功',
          description: `已删除 ${result.succeeded} 道题目`,
        })
        setSelectedIds([])
        router.refresh()
      } else {
        const firstError = result.results.find((item) => !item.success)?.error
        toast({
          variant: 'destructive',
          title: '删除失败',
          description: firstError ? `删除失败: ${firstError}` : `删除失败: ${result.failed} 个错误`,
        })
      }
    } catch {
      toast({
        variant: 'destructive',
        title: '错误',
        description: '发生未知错误',
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleBulkAutoTag = async (targetIds: string[] = selectedIds) => {
    if (targetIds.length === 0 || isDeletedView) return

    setIsUpdating(true)
    try {
      const result = await bulkAutoTagQuestionChapters({
        questionIds: targetIds,
      })
      if (result.succeeded > 0) {
        toast({
          title: '章节补全完成',
          description: `已补章节 ${result.succeeded} 题${result.failed > 0 ? `，未命中 ${result.failed} 题` : ''}`,
        })
        setSelectedIds([])
        router.refresh()
        return
      }

      const firstError = result.results.find((item) => !item.success)?.error
      toast({
        variant: 'destructive',
        title: '章节补全失败',
        description: firstError || '没有题目命中可用章节',
      })
    } catch {
      toast({
        variant: 'destructive',
        title: '错误',
        description: '发生未知错误',
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRowDelete = async (questionId: string) => {
    if (isDeletedView) return
    if (!window.confirm('确认删除这道题目？删除后会移入“已删除”列表。')) {
      return
    }

    setIsUpdating(true)
    try {
      const result = await deleteQuestion(questionId, undefined, {
        comment: 'Single delete via Admin Interface',
      })

      if (result.success) {
        toast({
          title: '删除成功',
          description: '题目已移入“已删除”列表',
        })
        setSelectedIds((current) => current.filter((id) => id !== questionId))
        router.refresh()
      } else {
        toast({
          variant: 'destructive',
          title: '删除失败',
          description: result.error || '删除失败',
        })
      }
    } catch {
      toast({
        variant: 'destructive',
        title: '错误',
        description: '发生未知错误',
      })
    } finally {
      setIsUpdating(false)
    }
  }

  // Pagination helpers
  const goToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    router.push(`?${params.toString()}`)
  }

  const getStatusBadgeVariant = (status: string): BadgeProps['variant'] => {
    switch (status) {
      case 'DRAFT':
        return 'secondary'
      case 'REVIEW_PENDING':
        return 'warning'
      case 'VERIFIED':
        return 'primary'
      case 'PUBLISHED':
        return 'success'
      case 'REVIEW_REJECTED':
        return 'destructive'
      case 'ARCHIVED':
        return 'neutral'
      default:
        return 'outline'
    }
  }

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      DRAFT: '草稿',
      OCR_PROCESSING: 'OCR处理中',
      OCR_COMPLETED: 'OCR完成',
      STRUCTURING: '结构化中',
      REVIEW_PENDING: '待审核',
      REVIEW_REJECTED: '已驳回',
      VERIFIED: '已校对',
      PUBLISHED: '已发布',
      ARCHIVED: '已归档',
    }
    return map[status] || status
  }

  const getQuestionImage = (question: QuestionWithRelations): string | null => {
    if (question.assetUrl) return question.assetUrl
    const match = question.content.match(/!\[[^\]]*]\((https?:\/\/[^)]+)\)/i)
    return match?.[1] || null
  }

  const formatDateTime = (value: Date | string | null | undefined) => {
    if (!value) return '-'

    const date = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(date.getTime())) return '-'

    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }

  if (!mounted) {
    return (
      <div className="space-y-4">
        <div
          className="h-12 rounded-md border bg-muted/20"
          aria-hidden="true"
        />
        <div
          className="h-80 rounded-md border bg-muted/20"
          aria-hidden="true"
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Batch Actions Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-borderTone bg-surface-subtle p-3 shadow-surface sm:flex-row sm:items-center sm:justify-between dark:border-borderTone dark:bg-surface-subtle">
        <div className="ml-1 text-sm text-text-secondary dark:text-text-secondary">
          {isDeletedView ? (
            <span>已删除题目仅用于追踪，不参与审核流转。</span>
          ) : selectedIds.length > 0 ? (
            <span>已选择 {selectedIds.length} 项，支持批量审核</span>
          ) : (
            <span>勾选题目后可批量通过、驳回或发布</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {!isDeletedView ? (
            <>
              <Button
                size="sm"
                variant="outline"
                disabled={selectedIds.length === 0 || isUpdating}
                onClick={() => handleBulkStatusUpdate('VERIFIED')}
                className="border-borderTone bg-[hsl(var(--state-success-bg))] text-[hsl(var(--state-success-fg))] hover:bg-[hsl(var(--state-success-bg))] hover:text-[hsl(var(--state-success-fg))] dark:border-borderTone dark:bg-[hsl(var(--state-success-bg))] dark:text-[hsl(var(--state-success-fg))] dark:hover:bg-[hsl(var(--state-success-bg))] dark:hover:text-[hsl(var(--state-success-fg))]"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                通过
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={selectedIds.length === 0 || isUpdating}
                onClick={() => handleBulkStatusUpdate('REVIEW_REJECTED')}
                className="border-borderTone bg-[hsl(var(--state-danger-bg))] text-[hsl(var(--state-danger-fg))] hover:bg-[hsl(var(--state-danger-bg))] hover:text-[hsl(var(--state-danger-fg))] dark:border-borderTone dark:bg-[hsl(var(--state-danger-bg))] dark:text-[hsl(var(--state-danger-fg))] dark:hover:bg-[hsl(var(--state-danger-bg))] dark:hover:text-[hsl(var(--state-danger-fg))]"
              >
                <XCircle className="mr-2 h-4 w-4" />
                驳回
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={selectedIds.length === 0 || isUpdating}
                onClick={() => handleBulkAutoTag()}
                className="border-borderTone bg-[hsl(var(--state-info-bg))] text-[hsl(var(--state-info-fg))] hover:bg-[hsl(var(--state-info-bg))] hover:text-[hsl(var(--state-info-fg))] dark:border-borderTone dark:bg-[hsl(var(--state-info-bg))] dark:text-[hsl(var(--state-info-fg))] dark:hover:bg-[hsl(var(--state-info-bg))] dark:hover:text-[hsl(var(--state-info-fg))]"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                AI补章节
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={selectedIds.length === 0 || isUpdating}
                onClick={() => handleBulkStatusUpdate('PUBLISHED')}
                className="border-borderTone bg-[hsl(var(--state-info-bg))] text-[hsl(var(--state-info-fg))] hover:bg-[hsl(var(--state-info-bg))] hover:text-[hsl(var(--state-info-fg))] dark:border-borderTone dark:bg-[hsl(var(--state-info-bg))] dark:text-[hsl(var(--state-info-fg))] dark:hover:bg-[hsl(var(--state-info-bg))] dark:hover:text-[hsl(var(--state-info-fg))]"
              >
                <ArrowUpCircle className="mr-2 h-4 w-4" />
                发布
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={selectedIds.length === 0 || isUpdating}
                onClick={handleBulkDelete}
                className="border-borderTone bg-[hsl(var(--state-danger-bg))] text-[hsl(var(--state-danger-fg))] hover:bg-[hsl(var(--state-danger-bg))] hover:text-[hsl(var(--state-danger-fg))] dark:border-borderTone dark:bg-[hsl(var(--state-danger-bg))] dark:text-[hsl(var(--state-danger-fg))] dark:hover:bg-[hsl(var(--state-danger-bg))] dark:hover:text-[hsl(var(--state-danger-fg))]"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                删除
              </Button>
            </>
          ) : null}
        </div>
      </div>

      {/* Table */}
      <div className={cn(pageTableShellClass, 'rounded-[24px]')}>
        <Table>
          <TableHeader>
            <TableRow className={cn(pageSectionHeaderBandClass, 'border-b border-borderTone hover:bg-surface-subtle dark:border-borderTone dark:hover:bg-surface-subtle')}>
              <TableHead className="h-12 w-[50px] text-text-secondary dark:text-text-secondary">
                <Checkbox
                  checked={
                    questions.length > 0 &&
                    selectedIds.length === questions.length
                  }
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="w-[90px] text-text-secondary dark:text-text-secondary">题图</TableHead>
              <TableHead className="w-[300px] text-text-secondary dark:text-text-secondary">
                题目内容
              </TableHead>
              <TableHead className="text-text-secondary dark:text-text-secondary">题型</TableHead>
              <TableHead className="text-text-secondary dark:text-text-secondary">科目/章节</TableHead>
              <TableHead className="text-text-secondary dark:text-text-secondary">时间</TableHead>
              <TableHead className="text-text-secondary dark:text-text-secondary">难度</TableHead>
              <TableHead className="text-text-secondary dark:text-text-secondary">质量分</TableHead>
              <TableHead className="text-text-secondary dark:text-text-secondary">状态</TableHead>
              <TableHead className="text-right text-text-secondary dark:text-text-secondary">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="[&_tr:last-child]:border-b-0">
            {questions.length === 0 ? (
              <TableRow className="border-b border-borderTone hover:bg-transparent dark:border-borderTone">
                <TableCell
                  colSpan={10}
                  className="h-24 text-center text-text-secondary dark:text-text-secondary"
                >
                  没有找到相关题目
                </TableCell>
              </TableRow>
            ) : (
              questions.map((question) => (
                <TableRow
                  key={question.id}
                  data-state={selectedIds.includes(question.id) && 'selected'}
                  className="border-b border-borderTone text-text-primary hover:bg-surface-subtle data-[state=selected]:bg-surface-selected dark:border-borderTone dark:text-text-primary dark:hover:bg-surface-subtle dark:data-[state=selected]:bg-surface-selected"
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(question.id)}
                      onCheckedChange={() => toggleSelectRow(question.id)}
                      aria-label="Select row"
                    />
                  </TableCell>
                  <TableCell>
                    {getQuestionImage(question) ? (
                      <img
                        src={getQuestionImage(question)!}
                        alt="题图缩略图"
                        className="h-12 w-16 rounded border border-borderTone object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-16 items-center justify-center rounded border border-dashed border-borderTone bg-surface-subtle text-[11px] text-text-tertiary dark:bg-surface-subtle dark:text-text-tertiary">
                        无图
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[300px]">
                    <div
                      className="truncate text-sm font-medium text-text-primary dark:text-text-primary"
                      title={question.content}
                    >
                      {question.content.substring(0, 50)}...
                    </div>
                    <div className="mt-1 text-xs text-text-secondary dark:text-text-secondary">
                      ID: {question.id.substring(0, 8)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="border-borderTone bg-surface-subtle text-text-primary dark:border-borderTone dark:bg-surface-subtle dark:text-text-primary"
                    >
                      {question.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-text-primary dark:text-text-primary">
                      {question.subject?.name || question.chapter?.subject?.name || '-'}
                    </div>
                    <div
                      className="max-w-[150px] truncate text-xs text-text-secondary dark:text-text-secondary"
                      title={question.chapter?.title}
                    >
                      {question.chapter?.title || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-xs text-text-secondary dark:text-text-secondary">
                      <div>
                        <span className="mr-1 text-text-tertiary dark:text-text-tertiary">导入:</span>
                        <span>{formatDateTime(question.createdAt)}</span>
                      </div>
                      <div>
                        <span className="mr-1 text-text-tertiary dark:text-text-tertiary">审核:</span>
                        <span>{formatDateTime(question.reviewedAt)}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DifficultyBadge difficulty={question.difficulty} />
                  </TableCell>
                  <TableCell>
                    <QualityScoreBadge score={question.qualityScore} />
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(question.status)}>
                      {getStatusLabel(question.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 rounded-full p-0 text-text-secondary hover:bg-surface-subtle hover:text-text-primary dark:text-text-secondary dark:hover:bg-surface-subtle dark:hover:text-text-primary"
                        >
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>操作</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() =>
                            navigator.clipboard.writeText(question.id)
                          }
                        >
                          复制ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/admin/content/review/${question.id}`}
                            className="flex cursor-pointer items-center"
                          >
                            <ClipboardCheck className="mr-2 h-4 w-4" />
                            查看题目/审核
                          </Link>
                        </DropdownMenuItem>
                        {!isDeletedView ? (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleBulkAutoTag([question.id])}
                            >
                              <Sparkles className="mr-2 h-4 w-4" />
                              AI补章节
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleRowDelete(question.id)}
                              className="text-[hsl(var(--state-danger-fg))]"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              删除
                            </DropdownMenuItem>
                          </>
                        ) : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          <TableFooter className="border-t border-borderTone bg-surface-subtle text-text-primary dark:border-borderTone dark:bg-surface-subtle dark:text-text-primary">
            <TableRow className="border-b-0 hover:bg-transparent">
              <TableCell colSpan={10}>
                <div className="flex w-full items-center justify-between">
                  <div className="text-xs text-text-secondary dark:text-text-secondary">
                    第 {page} 页 / 共 {totalPages} 页
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(page - 1)}
                      disabled={page <= 1}
                      className="border-borderTone bg-surface text-text-primary hover:bg-surface-subtle hover:text-text-primary dark:border-borderTone dark:bg-surface dark:text-white dark:hover:bg-surface-subtle"
                      
                    >
                      上一页
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(page + 1)}
                      disabled={page >= totalPages}
                      className="border-borderTone bg-surface text-text-primary hover:bg-surface-subtle hover:text-text-primary dark:border-borderTone dark:bg-surface dark:text-white dark:hover:bg-surface-subtle"
                    >
                      下一页
                    </Button>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  )
}
