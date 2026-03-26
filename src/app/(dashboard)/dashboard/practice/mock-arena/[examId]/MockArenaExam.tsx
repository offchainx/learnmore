'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Question as PrismaQuestion, QuestionType as PrismaQuestionType } from '@prisma/client'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { submitExam, type ExamResult, type UserAnswerSubmission } from '@/actions/practice/exam'
import type { Question } from '@/components/business/question'
import { PracticeResultPanel } from '@/components/practice/modes/shared/PracticeResultPanel'
import UnifiedPracticeWorkspace, {
  type UnifiedPracticeQuestion,
} from '@/components/practice/session/UnifiedPracticeWorkspace'
import { TierKey } from '@/lib/permissions/types'

interface ExamData {
  questions: PrismaQuestion[]
  timeLimit: number
  startTime: number
}

interface MockArenaExamProps {
  examId: string
  userId: string
  subjectId?: string
  userTier?: TierKey
}

function formatQuestion(question: PrismaQuestion): Question {
  return {
    id: question.id,
    type: question.type as PrismaQuestionType,
    content: question.content,
    options: question.options as Record<string, string> | null,
    answer: null,
    explanation: null,
  }
}

export default function MockArenaExam({
  examId,
  userId,
  subjectId,
}: MockArenaExamProps) {
  const router = useRouter()
  const practiceCenterHref = subjectId
    ? `/dashboard/practice?subjectId=${encodeURIComponent(subjectId)}`
    : '/dashboard/practice'
  const reloadPage = () => window.location.reload()
  const [isPending, startTransition] = useTransition()
  const [examData, setExamData] = useState<ExamData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ExamResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = sessionStorage.getItem(`exam_${examId}`)

    if (!stored) {
      setError('考试会话不存在，请返回 Mock Arena 重新开始。')
      setIsLoading(false)
      return
    }

    try {
      const parsed = JSON.parse(stored) as ExamData
      setExamData(parsed)
    } catch {
      setError('考试数据读取失败，请返回 Mock Arena 重新开始。')
    } finally {
      setIsLoading(false)
    }
  }, [examId])

  const questions = useMemo(() => examData?.questions || [], [examData])
  const remainingTime = useMemo(() => {
    if (!examData) return null
    const elapsed = Math.floor((Date.now() - examData.startTime) / 1000)
    return Math.max(0, examData.timeLimit - elapsed)
  }, [examData])
  const workspaceQuestions = useMemo<UnifiedPracticeQuestion[]>(
    () =>
      questions.map((question, index) => ({
        id: question.id,
        question: formatQuestion(question),
        difficulty: question.difficulty,
        meta: `模拟卷第 ${index + 1} 题`,
      })),
    [questions],
  )

  const handleSubmit = async ({
    answers,
    duration,
  }: {
    answers: Record<string, string | string[]>
    duration: number
  }) => {
    if (!examData) return

    startTransition(async () => {
      const payload: UserAnswerSubmission[] = questions.map((question) => ({
        questionId: question.id,
        userAnswer: answers[question.id] || '',
      }))

      const submitResult = await submitExam(examId, userId, payload, duration)

      if (submitResult.success && submitResult.result) {
        sessionStorage.removeItem(`exam_${examId}`)
        setResult(submitResult.result)
      } else {
        setError(submitResult.error || '考试提交失败，请稍后重试。')
      }
    })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="mb-4 h-12 w-12 text-destructive" />
        <h2 className="mb-2 text-xl font-bold">考试加载失败</h2>
        <p className="mb-4 text-muted-foreground">{error}</p>
        <Button onClick={() => router.push('/dashboard/practice/mock-arena')}>
          返回 Mock Arena
        </Button>
      </div>
    )
  }

  if (result) {
    return (
        <PracticeResultPanel
        title="Mock Arena 完成"
        subtitle="这一场模拟考试已经完成，下面是整卷结果摘要。"
        score={Math.round(result.score)}
        theme="indigo"
        stats={[
          { label: '题目总数', value: result.totalQuestions, toneClassName: 'text-indigo-200' },
          { label: '正确', value: result.correctCount, toneClassName: 'text-emerald-300' },
          { label: '错误', value: Math.max(0, result.totalQuestions - result.correctCount), toneClassName: 'text-rose-300' },
          { label: '用时', value: `${Math.max(1, Math.round(result.duration / 60))} 分钟` },
        ]}
        recommendation="先看整卷稳定性和时间分配，如果中段波动较大，建议回到 Smart Drill 或 Error Wiper 做针对性补强。"
        questionStates={result.questions.map((question) => question.isCorrect)}
        primaryActionLabel="返回练习中心"
        primaryAction={() => router.push(practiceCenterHref)}
        secondaryActionLabel="再开一场"
        secondaryAction={() => router.push(subjectId ? `/dashboard/practice/mock-arena?subjectId=${encodeURIComponent(subjectId)}` : '/dashboard/practice/mock-arena')}
      />
    )
  }

  return (
    <UnifiedPracticeWorkspace
      title="Mock Arena"
      modeLabel="Mock Arena"
      subtitle="保持考试节奏，整卷完成后统一交卷。作答过程中不会展示正确答案。"
      questions={workspaceQuestions}
      onSubmit={handleSubmit}
      onRefresh={reloadPage}
      onExit={() => router.push(practiceCenterHref)}
      submitLabel="提交模拟卷"
      refreshLabel="刷新页面"
      exitLabel="退出模拟考场"
      isSubmitting={isPending}
      timeLimitSeconds={remainingTime}
      rightPanelNote="Mock Arena 更强调考试氛围。建议在规定时间内整卷完成，再统一查看整卷结果和节奏表现。"
    />
  )
}
