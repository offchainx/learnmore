'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ClipboardCheck, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { QuestionPanel } from '@/components/admin/review/QuestionPanel'
import { MetadataPanel } from '@/components/admin/review/MetadataPanel'
import type { QuestionReviewData } from '@/types/content-pipeline'
import {
  approveQuestion,
  getQuestionForReview,
  rejectQuestion,
  updateQuestion,
} from '@/actions/content-pipeline/review-service'

interface QuestionReviewDrawerProps {
  open: boolean
  questionId: string | null
  orderedQuestionIds: string[]
  onClose: () => void
  onOpenQuestion: (questionId: string) => void
  reviewCompletedActionFromUrl?: 'approved' | 'rejected' | null
  nextQuestionIdFromUrl?: string | null
  onMarkReviewCompleted: (
    action: 'approved' | 'rejected',
    nextQuestionId: string | null
  ) => void
}

export function QuestionReviewDrawer({
  open,
  questionId,
  orderedQuestionIds,
  onClose,
  onOpenQuestion,
  reviewCompletedActionFromUrl = null,
  nextQuestionIdFromUrl = null,
  onMarkReviewCompleted,
}: QuestionReviewDrawerProps) {
  const router = useRouter()
  const [question, setQuestion] = useState<QuestionReviewData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [reviewCompletedAction, setReviewCompletedAction] = useState<'approved' | 'rejected' | null>(null)

  const currentIndex = useMemo(
    () => (questionId ? orderedQuestionIds.indexOf(questionId) : -1),
    [orderedQuestionIds, questionId]
  )
  const nextQuestionId =
    currentIndex >= 0 && currentIndex + 1 < orderedQuestionIds.length
      ? orderedQuestionIds[currentIndex + 1]
      : null
  const resolvedReviewCompletedAction =
    reviewCompletedAction ?? reviewCompletedActionFromUrl ?? null
  const resolvedNextQuestionId =
    (reviewCompletedAction ? nextQuestionId : null) ?? nextQuestionIdFromUrl ?? nextQuestionId

  const handleClose = () => {
    onClose()
    if (resolvedReviewCompletedAction) {
      router.refresh()
    }
  }

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!open || !questionId) {
        setQuestion(null)
        setReviewCompletedAction(null)
        return
      }

      setIsLoading(true)
      setReviewCompletedAction(null)
      try {
        const result = await getQuestionForReview(questionId)
        if (cancelled) return
        if (!result) {
          toast.error('未找到题目详情')
          onClose()
          return
        }
        setQuestion(result)
      } catch (error) {
        console.error('加载题目详情失败:', error)
        if (!cancelled) {
          toast.error('加载题目详情失败')
          onClose()
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [open, questionId, onClose])

  const handleUpdate = async (newData: QuestionReviewData) => {
    if (!questionId) return
    setIsSaving(true)
    try {
      const result = await updateQuestion(questionId, newData)
      if (!result.success) {
        toast.error(result.error || '保存失败，请重试')
        return
      }
      const refreshed = await getQuestionForReview(questionId)
      if (refreshed) {
        setQuestion(refreshed)
      } else {
        setQuestion(newData)
      }
      toast.success('题目已保存')
      router.refresh()
    } catch (error) {
      console.error('保存失败:', error)
      toast.error('保存失败，请重试')
    } finally {
      setIsSaving(false)
    }
  }

  const handleApprove = async (feedback?: string) => {
    if (!questionId || !question) return
    setIsSaving(true)
    try {
      const result = await approveQuestion(questionId, feedback)
      if (!result.success) {
        toast.error(result.message || '审核操作失败')
        return
      }
      setReviewCompletedAction('approved')
      onMarkReviewCompleted('approved', nextQuestionId)
      setQuestion({
        ...question,
        status: 'PUBLISHED',
      })
      toast.success('审核通过')
    } catch (error) {
      console.error('审核失败:', error)
      toast.error('审核操作失败')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReject = async (reason: string) => {
    if (!questionId || !question) return
    setIsSaving(true)
    try {
      const result = await rejectQuestion(questionId, reason)
      if (!result.success) {
        toast.error(result.message || '驳回失败')
        return
      }
      setReviewCompletedAction('rejected')
      onMarkReviewCompleted('rejected', nextQuestionId)
      setQuestion({
        ...question,
        status: 'REVIEW_REJECTED',
      })
      toast.success('已驳回该题目')
    } catch (error) {
      console.error('驳回失败:', error)
      toast.error('驳回失败')
    } finally {
      setIsSaving(false)
    }
  }

  const handleNextQuestion = () => {
    if (resolvedNextQuestionId) {
      onOpenQuestion(resolvedNextQuestionId)
      return
    }
    handleClose()
  }

  return (
    <Sheet open={open} onOpenChange={(nextOpen) => (!nextOpen ? handleClose() : undefined)}>
      <SheetContent
        side="right"
        className="!w-[100vw] sm:!w-[96vw] sm:!max-w-none desktop:!w-[1460px] 2xl:!w-[1560px] flex h-full flex-col overflow-hidden border-l border-borderTone bg-page p-0 text-text-primary dark:border-[#24324D] dark:bg-[#0B1220] dark:text-[#E6EDF7]"
      >
        <SheetHeader className="border-b border-borderTone bg-surface/95 px-5 py-4 backdrop-blur dark:border-[#24324D] dark:bg-[#0F172A]/95 desktop:px-7">
          <div className="pr-10">
            <SheetTitle className="flex items-center gap-2 text-left text-xl font-bold text-text-primary dark:text-white">
              <ClipboardCheck className="h-5 w-5 text-blue-500" />
              {question?.title || '题目审核'}
            </SheetTitle>
            <SheetDescription className="mt-1 text-left text-xs text-text-secondary dark:text-slate-400">
              {questionId
                ? `当前题目 ${currentIndex >= 0 ? currentIndex + 1 : '-'} / ${orderedQuestionIds.length}`
                : '请选择题目'}
            </SheetDescription>
          </div>
        </SheetHeader>

        {isLoading || !question ? (
          <div className="flex flex-1 min-h-0 items-center justify-center bg-page dark:bg-slate-950">
            <div className="flex items-center gap-3 rounded-xl border border-borderTone bg-surface px-4 py-3 text-sm text-text-secondary dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              <Loader2 className="h-4 w-4 animate-spin" />
              正在加载题目详情...
            </div>
          </div>
        ) : (
          <div className="grid flex-1 min-h-0 grid-cols-1 overflow-hidden bg-page dark:bg-slate-950 desktop:grid-cols-[minmax(0,1.45fr)_380px] 2xl:grid-cols-[minmax(0,1.6fr)_420px]">
            <QuestionPanel data={question} onUpdate={handleUpdate} onOpenQuestion={onOpenQuestion} />
            <MetadataPanel
              data={question}
              onUpdate={handleUpdate}
              onApprove={handleApprove}
              onReject={handleReject}
              isProcessing={isSaving}
              reviewCompletedAction={resolvedReviewCompletedAction}
              onNextQuestion={handleNextQuestion}
              hasNextQuestion={Boolean(resolvedNextQuestionId)}
            />
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
