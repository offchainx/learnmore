'use client'

import { useState } from 'react'
import { PracticeMode, Question, QuestionType } from '@prisma/client'
import { submitPracticeSession } from '@/actions/practice/session'
import { QuestionCard } from '@/components/business/question'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, ArrowRight, Flag, Loader2, Target, type LucideIcon } from 'lucide-react'
import { PracticeHeader } from '@/components/practice/modes/shared/PracticeHeader'
import { PracticeResultPanel } from '@/components/practice/modes/shared/PracticeResultPanel'
import type { PracticeModeTheme } from '@/components/practice/modes/shared/theme'
import { QuestionReportButton } from '@/components/business/question'

interface QuizSessionProps {
  questions: Question[]
  userId: string
  mode: PracticeMode
  title?: string
  subjectId?: string | null
  sessionLabel?: string
  sessionSubtitle?: string
  theme?: PracticeModeTheme
  headerIcon?: LucideIcon
  resultTitle?: string
  resultSubtitle?: string
  exitLabel?: string
  persistSession?: boolean
  onExit: () => void
  onRestart?: () => void
  reporterId?: string
}

export default function QuizSession({
  questions,
  userId,
  mode,
  title,
  subjectId = null,
  sessionLabel = 'Practice Session',
  sessionSubtitle = 'Focus on one question at a time.',
  theme = 'slate',
  headerIcon = Target,
  resultTitle = '训练完成',
  resultSubtitle = '本轮训练已结束，下面是这组题的结果摘要。',
  exitLabel = '退出本轮训练',
  persistSession = true,
  onExit,
  onRestart,
  reporterId = userId,
}: QuizSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<string, string | string[]>>({})
  const [results, setResults] = useState<Record<string, boolean>>({})
  const [isFinished, setIsFinished] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [savedScore, setSavedScore] = useState<number | null>(null)
  const [savedCorrectCount, setSavedCorrectCount] = useState<number | null>(null)
  const [savedTotalQuestions, setSavedTotalQuestions] = useState<number | null>(null)
  const [savedSession, setSavedSession] = useState(false)
  const [startedAt] = useState(() => Date.now())
  const [clientSessionId] = useState(() => crypto.randomUUID())

  const currentQuestion = questions[currentIndex]
  const totalQuestions = questions.length
  const progress = ((currentIndex + 1) / totalQuestions) * 100
  const checkedCount = Object.keys(results).length
  const correctCount = Object.values(results).filter(Boolean).length
  const liveAccuracy = checkedCount > 0 ? Math.round((correctCount / checkedCount) * 100) : 0

  const formattedQuestion = {
    ...currentQuestion,
    type: currentQuestion.type as QuestionType,
    options: currentQuestion.options as Record<string, string>,
    answer: currentQuestion.answer as string | string[],
    explanation: currentQuestion.explanation || null,
  }

  const handleAnswerChange = (val: string | string[]) => {
    if (results[currentQuestion.id] !== undefined) return

    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: val,
    }))
  }

  const checkAnswer = () => {
    const uAnswer = userAnswers[currentQuestion.id]
    const qAnswer = formattedQuestion.answer

    let isCorrect = false

    if (formattedQuestion.type === 'SINGLE_CHOICE') {
      isCorrect = uAnswer === qAnswer
    } else if (formattedQuestion.type === 'MULTIPLE_CHOICE') {
      const uArr = Array.isArray(uAnswer) ? uAnswer : [uAnswer]
      const qArr = Array.isArray(qAnswer) ? qAnswer : [qAnswer]
      if (uArr && qArr && uArr.length === qArr.length) {
        const sortedU = [...(uArr as string[])].sort()
        const sortedQ = [...(qArr as string[])].sort()
        isCorrect = sortedU.every((val, index) => val === sortedQ[index])
      }
    } else if (formattedQuestion.type === 'FILL_BLANK') {
      isCorrect = uAnswer === qAnswer
    }

    setResults(prev => ({
      ...prev,
      [currentQuestion.id]: isCorrect,
    }))
  }

  const calculateScore = (resultMap: Record<string, boolean> = results) => {
    const currentCorrectCount = Object.values(resultMap).filter(Boolean).length
    return Math.round((currentCorrectCount / totalQuestions) * 100)
  }

  const finishSession = async () => {
    if (isSubmitting) return

    if (!persistSession) {
      const localScore = calculateScore()
      setSavedScore(localScore)
      setSavedCorrectCount(correctCount)
      setSavedTotalQuestions(totalQuestions)
      setSavedSession(false)
      setSubmitError('当前为 Mock 预览模式，本轮结果不会写入正式训练记录。')
      setIsFinished(true)
      return
    }

    const duration = Math.max(1, Math.round((Date.now() - startedAt) / 1000))
    const answers = questions.map(question => ({
      questionId: question.id,
      userAnswer: userAnswers[question.id] ?? null,
    }))

    setIsSubmitting(true)
    setSubmitError(null)

    const submitResult = await submitPracticeSession({
      userId,
      mode,
      clientSessionId,
      answers,
      duration,
      subjectId,
      title: title ?? null,
    })

    if (submitResult.success) {
      setSavedScore(Math.round(submitResult.score ?? calculateScore()))
      setSavedCorrectCount(submitResult.correctCount ?? correctCount)
      setSavedTotalQuestions(submitResult.totalQuestions ?? totalQuestions)
      setSavedSession(true)
    } else {
      setSavedScore(calculateScore())
      setSavedCorrectCount(correctCount)
      setSavedTotalQuestions(totalQuestions)
      setSavedSession(false)
      setSubmitError(submitResult.error || '训练结果保存失败，本轮成绩仅保留在本地。')
    }

    setIsSubmitting(false)
    setIsFinished(true)
  }

  const handleNext = async () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      await finishSession()
    }
  }

  if (isFinished) {
    const score = savedScore ?? calculateScore()
    const finalCorrectCount = savedCorrectCount ?? correctCount
    const finalTotalQuestions = savedTotalQuestions ?? totalQuestions
    const incorrectCount = Math.max(0, finalTotalQuestions - finalCorrectCount)
    const recommendation = score >= 80
      ? '这一轮状态稳定，可以继续刷一组，或者直接转入 Mock Arena 做限时演练。'
      : score >= 60
        ? '正确率已过及格线，建议再做一组 Smart Drill，把中段稳定性拉高。'
        : '建议继续 Smart Drill 或切回章节练习，先把薄弱题型收口。'

    return (
      <PracticeResultPanel
        title={resultTitle}
        subtitle={resultSubtitle}
        score={score}
        theme={theme}
        stats={[
          { label: '正确', value: finalCorrectCount, toneClassName: 'text-emerald-300' },
          { label: '错误', value: incorrectCount, toneClassName: 'text-rose-300' },
          { label: '结果保存', value: savedSession ? '已保存' : '仅本地' },
        ]}
        recommendation={recommendation}
        note={submitError}
        questionStates={questions.map((q) => Boolean(results[q.id]))}
        primaryActionLabel="返回练习中心"
        primaryAction={onExit}
        secondaryActionLabel="再来一轮"
        secondaryAction={onRestart ?? onExit}
      />
    )
  }

  const isChecked = results[currentQuestion.id] !== undefined
  const hasAnswered = !!userAnswers[currentQuestion.id] && (Array.isArray(userAnswers[currentQuestion.id]) ? (userAnswers[currentQuestion.id] as string[]).length > 0 : true)
  const progressLabel = checkedCount === 0
    ? '先完成当前题目，系统才会开始计算准确率。'
    : `已判定 ${checkedCount} / ${totalQuestions} 题，当前准确率 ${liveAccuracy}%。`

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PracticeHeader
        compact
        theme={theme}
        icon={headerIcon}
        badge={sessionLabel}
        title={`${sessionLabel} · 第 ${currentIndex + 1} 题`}
        description={sessionSubtitle}
        stats={[
          { label: '进度', value: `${currentIndex + 1} / ${totalQuestions}`, icon: Flag },
          { label: '正确率', value: `${liveAccuracy}%`, icon: headerIcon },
        ]}
      >
        <Progress value={progress} className="h-2.5" />
        <div className="mt-2 text-sm text-slate-300">{progressLabel}</div>
      </PracticeHeader>

      <QuestionCard
        question={formattedQuestion}
        userAnswer={userAnswers[currentQuestion.id]}
        onAnswerChange={handleAnswerChange}
        showResult={isChecked}
        readOnly={isChecked}
        className="min-h-[400px] shadow-md"
        headerAction={
          reporterId ? (
            <QuestionReportButton
              questionId={currentQuestion.id}
              reportedBy={reporterId}
              questionLabel={`第 ${currentIndex + 1} 题`}
            />
          ) : null
        }
      />

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" className="justify-start px-0 text-slate-500 hover:text-slate-900 dark:hover:text-white" onClick={onExit}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {exitLabel}
        </Button>
        {!isChecked ? (
          <Button onClick={checkAnswer} disabled={!hasAnswered} size="lg">
            <Target className="mr-2 h-4 w-4" />
            检查答案
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={isSubmitting}
            size="lg"
            className={currentIndex === totalQuestions - 1 ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                保存训练结果
              </>
            ) : currentIndex === totalQuestions - 1 ? (
              <>
                完成训练
                <Flag className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                下一题
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
