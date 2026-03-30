'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { QuestionReviewData } from '@/types/content-pipeline'
import { QuestionPanel } from '@/components/admin/review/QuestionPanel'
import { MetadataPanel } from '@/components/admin/review/MetadataPanel'
import { updateQuestion, approveQuestion, rejectQuestion } from '@/actions/content-pipeline/review-service'
import { getQuestionForReview } from '@/actions/content-pipeline/review-service'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface QuestionReviewClientProps {
  question: QuestionReviewData
  returnTo?: string
}

function resolveSafeReturnTo(input?: string): string {
  if (!input) return '/admin/content/review'
  const trimmed = input.trim()
  if (!trimmed.startsWith('/admin/content/review')) {
    return '/admin/content/review'
  }
  return trimmed
}

/**
 * 题目审核客户端容器组件
 * 整合 QuestionPanel 和 MetadataPanel，提供左右分栏布局
 */
export function QuestionReviewClient({
  question: initialQuestion,
  returnTo,
}: QuestionReviewClientProps) {
  const router = useRouter()
  const [question, setQuestion] = useState<QuestionReviewData>(initialQuestion)
  const [isSaving, setIsSaving] = useState(false)
  const reviewReturnUrl = resolveSafeReturnTo(returnTo)

  // 更新题目数据
  const handleUpdate = async (newData: QuestionReviewData) => {
    setIsSaving(true)
    try {
      const result = await updateQuestion(question.id, newData)
      if (!result.success) {
        toast.error(result.error || '保存失败，请重试')
        return
      }
      const refreshed = await getQuestionForReview(question.id)
      if (refreshed) {
        setQuestion(refreshed)
      } else {
        setQuestion(newData)
      }
      toast.success('题目已保存')
    } catch (error) {
      console.error('保存失败:', error)
      toast.error('保存失败，请重试')
    } finally {
      setIsSaving(false)
    }
  }

  // 审核通过
  const handleApprove = async (feedback?: string) => {
    setIsSaving(true)
    try {
      await approveQuestion(question.id, feedback)
      toast.success('审核通过！')
      // 延迟跳转，让用户看到成功提示
      setTimeout(() => {
        router.push(reviewReturnUrl)
      }, 1000)
    } catch (error) {
      console.error('审核失败:', error)
      toast.error('审核操作失败')
      setIsSaving(false)
    }
  }

  // 审核拒绝
  const handleReject = async (reason: string) => {
    setIsSaving(true)
    try {
      await rejectQuestion(question.id, reason)
      toast.error('已拒绝该题目')
      setTimeout(() => {
        router.push(reviewReturnUrl)
      }, 1000)
    } catch (error) {
      console.error('拒绝操作失败:', error)
      toast.error('操作失败')
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] sm:h-[calc(100vh-4rem)] -m-4 sm:-m-8 bg-page dark:bg-slate-950 overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 bg-surface dark:bg-slate-900 border-b border-borderTone dark:border-slate-800 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between max-w-full">
          <div className="flex items-center gap-4">
            <Link
              href={reviewReturnUrl}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-surface-subtle dark:bg-slate-800 border border-borderTone dark:border-slate-700 hover:bg-surface-muted dark:hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-text-secondary dark:text-slate-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-extrabold text-text-primary dark:text-white flex items-center gap-2">
                {question.title}
                {isSaving && (
                  <span className="text-sm font-normal text-text-tertiary dark:text-slate-400 animate-pulse">
                    保存中...
                  </span>
                )}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-text-tertiary dark:text-slate-400">
                  题目ID: {question.id}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-transparent">
                  待审核
                </span>
              </div>
            </div>
          </div>

          {/* 快捷审核按钮 */}
          <button
            type="button"
            onClick={() => handleApprove()}
            disabled={isSaving}
            className="hidden tablet:flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-medium text-white shadow-sm transition-colors hover:bg-green-700 disabled:bg-green-400"
          >
            <CheckCircle className="h-4 w-4" />
            快速通过
          </button>
        </div>
      </header>

      {/* Main Content - 左右分栏布局 */}
      <div className="flex-1 flex overflow-hidden">
        <QuestionPanel data={question} onUpdate={handleUpdate} />
        <MetadataPanel
          data={question}
          onUpdate={handleUpdate}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </div>
    </div>
  )
}
