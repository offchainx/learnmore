'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateQuestionStatus } from '@/actions/content-pipeline/question-service'
import type { QuestionWithRelations, QualityCheckResult } from '@/lib/content-pipeline/types'
import { ContentStatus } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, FileEdit, CheckCircle2, XCircle, ChevronLeft } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface QuestionReviewPanelProps {
  question: QuestionWithRelations
  qualityResult: QualityCheckResult
  reviewerId: string
}

export function QuestionReviewPanel({
  question,
  qualityResult,
  reviewerId
}: QuestionReviewPanelProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  // 处理审核通过
  const handleApprove = async () => {
    setLoading(true)
    try {
      const result = await updateQuestionStatus({
        questionId: question.id,
        newStatus: ContentStatus.VERIFIED,
        reviewerId,
        comment
      })

      if (result.success) {
        toast({
          title: "审核通过",
          description: "题目已标记为已验证状态",
        })
        router.push('/admin/content')
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "操作失败",
        description: error instanceof Error ? error.message : "未知错误",
      })
    } finally {
      setLoading(false)
    }
  }

  // 处理审核拒绝
  const handleReject = async () => {
    if (!comment) {
      toast({
        variant: "destructive",
        title: "需要填写理由",
        description: "拒绝审核时请填写审核意见",
      })
      return
    }

    setLoading(true)
    try {
      const result = await updateQuestionStatus({
        questionId: question.id,
        newStatus: ContentStatus.REVIEW_REJECTED,
        reviewerId,
        comment
      })

      if (result.success) {
        toast({
          title: "已拒绝",
          description: "题目已被打回草稿",
        })
        router.push('/admin/content')
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "操作失败",
        description: error instanceof Error ? error.message : "未知错误",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle>审核操作</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 质量分数 */}
        <div>
          <Label>质量分数</Label>
          <div className="flex items-center gap-2 mt-1">
            <Progress 
              value={qualityResult.score} 
              className="flex-1"
              indicatorClassName={cn(
                qualityResult.score >= 90 ? "bg-green-600" :
                qualityResult.score >= 70 ? "bg-yellow-600" : "bg-red-600"
              )}
            />
            <span className={cn(
              "text-sm font-bold w-12 text-right",
              qualityResult.score >= 90 ? "text-green-600" :
              qualityResult.score >= 70 ? "text-yellow-600" : "text-red-600"
            )}>
              {qualityResult.score}/100
            </span>
          </div>
        </div>

        {/* 元数据 */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">题型</span>
            <span className="font-medium">{question.type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">难度</span>
            <span className="font-medium">{question.difficulty} 星</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">答题次数</span>
            <span className="font-medium">{question._count?.attempts ?? 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">被报错次数</span>
            <span className="font-medium">{question.reportCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">状态</span>
            <span className="font-medium">{question.status}</span>
          </div>
        </div>

        <Separator />

        {/* 审核意见 */}
        <div>
          <Label htmlFor="comment">审核意见</Label>
          <Textarea
            id="comment"
            value={comment}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
            placeholder="选填：补充说明或拒绝理由"
            rows={4}
            className="mt-1"
            disabled={loading}
          />
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-col gap-2">
          {question.status !== ContentStatus.VERIFIED && question.status !== ContentStatus.PUBLISHED && (
             <Button
               onClick={handleApprove}
               disabled={loading} // 允许强制通过，即使质量检查未通过（由人工判断）
               className="w-full bg-green-600 hover:bg-green-700"
             >
               {loading ? "处理中..." : (
                 <>
                   <CheckCircle2 className="mr-2 h-4 w-4" />
                   通过审核
                 </>
               )}
             </Button>
          )}

          {question.status !== ContentStatus.REVIEW_REJECTED && (
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={loading}
              className="w-full"
            >
               {loading ? "处理中..." : (
                 <>
                   <XCircle className="mr-2 h-4 w-4" />
                   拒绝
                 </>
               )}
            </Button>
          )}
          
          <Button
            variant="outline"
            disabled={loading}
            className="w-full"
            asChild
          >
            <Link href={`/admin/content/${question.id}/edit`}>
              <FileEdit className="mr-2 h-4 w-4" />
              编辑题目
            </Link>
          </Button>
        </div>

        {/* 质量问题提示 */}
        {!qualityResult.passed && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>质量检查未通过</AlertTitle>
            <AlertDescription className="text-xs mt-1">
              存在 {qualityResult.issues.filter(i => i.type === 'ERROR').length} 个严重问题，建议修复后再通过。
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
