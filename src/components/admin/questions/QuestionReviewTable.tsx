'use client'

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow,
  TableFooter
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge, BadgeProps } from "@/components/ui/badge"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, CheckCircle, XCircle, ArrowUpCircle, FileText, Edit, ClipboardCheck } from "lucide-react"
import { DifficultyBadge } from "../common/DifficultyBadge"
import { QualityScoreBadge } from "../common/QualityScoreBadge"
import { QuestionWithRelations } from "@/lib/content-pipeline/types"
import { ContentStatus } from "@prisma/client"
import { bulkUpdateQuestionStatus } from "@/actions/content-pipeline/question-service"
import { useToast } from "@/components/ui/use-toast"

interface QuestionReviewTableProps {
  questions: QuestionWithRelations[]
  total: number
  page: number
  totalPages: number
}

export function QuestionReviewTable({ 
  questions, 
  total, 
  page, 
  totalPages 
}: QuestionReviewTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle row selection
  const toggleSelectAll = () => {
    if (selectedIds.length === questions.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(questions.map(q => q.id))
    }
  }

  const toggleSelectRow = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(itemId => itemId !== id))
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
        reviewerId: "ADMIN", // TODO: Replace with actual user ID
        comment: "Bulk update via Admin Interface"
      })

      if (result.success) {
        toast({
          title: "操作成功",
          description: `已成功更新 ${result.succeeded} 个题目的状态`,
        })
        setSelectedIds([])
        router.refresh()
      } else {
        toast({
          variant: "destructive",
          title: "操作失败",
          description: `更新失败: ${result.failed} 个错误`,
        })
      }
    } catch {
      toast({
        variant: "destructive",
        title: "错误",
        description: "发生未知错误",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  // Pagination helpers
  const goToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", newPage.toString())
    router.push(`?${params.toString()}`)
  }

  const getStatusBadgeVariant = (status: string): BadgeProps['variant'] => {
    switch (status) {
      case 'DRAFT': return 'secondary'
      case 'REVIEW_PENDING': return 'warning'
      case 'VERIFIED': return 'primary'
      case 'PUBLISHED': return 'success'
      case 'REVIEW_REJECTED': return 'destructive'
      case 'ARCHIVED': return 'neutral'
      default: return 'outline'
    }
  }

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      'DRAFT': '草稿',
      'OCR_PROCESSING': 'OCR处理中',
      'OCR_COMPLETED': 'OCR完成',
      'STRUCTURING': '结构化中',
      'REVIEW_PENDING': '待审核',
      'REVIEW_REJECTED': '已驳回',
      'VERIFIED': '已校对',
      'PUBLISHED': '已发布',
      'ARCHIVED': '已归档'
    }
    return map[status] || status
  }

  const getQuestionImage = (question: QuestionWithRelations): string | null => {
    if (question.assetUrl) return question.assetUrl
    const match = question.content.match(/!\[[^\]]*]\((https?:\/\/[^)]+)\)/i)
    return match?.[1] || null
  }

  if (!mounted) {
    return (
      <div className="space-y-4">
        <div className="h-12 rounded-md border bg-muted/20" aria-hidden="true" />
        <div className="h-80 rounded-md border bg-muted/20" aria-hidden="true" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Batch Actions Toolbar */}
      <div className="flex items-center justify-between bg-muted/30 p-2 rounded-md border">
        <div className="text-sm text-muted-foreground ml-2">
          {selectedIds.length > 0 ? (
            <span>已选择 {selectedIds.length} 项</span>
          ) : (
            <span>共 {total} 个题目</span>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline"
            disabled={selectedIds.length === 0 || isUpdating}
            onClick={() => handleBulkStatusUpdate('VERIFIED')}
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            通过
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            disabled={selectedIds.length === 0 || isUpdating}
            onClick={() => handleBulkStatusUpdate('REVIEW_REJECTED')}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <XCircle className="mr-2 h-4 w-4" />
            驳回
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            disabled={selectedIds.length === 0 || isUpdating}
            onClick={() => handleBulkStatusUpdate('PUBLISHED')}
          >
            <ArrowUpCircle className="mr-2 h-4 w-4" />
            发布
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={questions.length > 0 && selectedIds.length === questions.length}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="w-[90px]">题图</TableHead>
              <TableHead className="w-[300px]">题目内容</TableHead>
              <TableHead>题型</TableHead>
              <TableHead>科目/章节</TableHead>
              <TableHead>难度</TableHead>
              <TableHead>质量分</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  没有找到相关题目
                </TableCell>
              </TableRow>
            ) : (
              questions.map((question) => (
                <TableRow key={question.id} data-state={selectedIds.includes(question.id) && "selected"}>
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
                        className="h-12 w-16 object-cover rounded border border-slate-200 dark:border-slate-700"
                      />
                    ) : (
                      <div className="h-12 w-16 rounded border border-dashed border-slate-300 dark:border-slate-700 text-[11px] text-slate-400 flex items-center justify-center">
                        无图
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[300px]">
                    <div className="truncate font-medium text-sm" title={question.content}>
                      {question.content.substring(0, 50)}...
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      ID: {question.id.substring(0, 8)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{question.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {question.chapter?.subject?.name || '-'}
                    </div>
                    <div className="text-xs text-muted-foreground truncate max-w-[150px]" title={question.chapter?.title}>
                      {question.chapter?.title || '-'}
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
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>操作</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(question.id)}>
                          复制ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/content/review/${question.id}`} className="flex items-center cursor-pointer">
                            <ClipboardCheck className="mr-2 h-4 w-4" />
                            查看题目/审核
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          <TableFooter>
             <TableRow>
              <TableCell colSpan={9}>
                <div className="flex items-center justify-between w-full">
                  <div className="text-xs text-muted-foreground">
                    第 {page} 页 / 共 {totalPages} 页
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(page - 1)}
                      disabled={page <= 1}
                    >
                      上一页
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(page + 1)}
                      disabled={page >= totalPages}
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
