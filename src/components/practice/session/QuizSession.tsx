'use client'

import { useState } from 'react'
import { PracticeMode, Question, QuestionType } from '@prisma/client'
import { submitPracticeSession } from '@/actions/practice/session'
import { QuestionCard } from '@/components/business/question'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, ArrowRight, Flag, Loader2, RotateCcw, Target } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuizSessionProps {
  questions: Question[]
  userId: string
  mode: PracticeMode
  title?: string
  subjectId?: string | null
  sessionLabel?: string
  sessionSubtitle?: string
  onExit: () => void
  onRestart?: () => void
}

export default function QuizSession({
  questions,
  userId,
  mode,
  title,
  subjectId = null,
  sessionLabel = 'Practice Session',
  sessionSubtitle = 'Focus on one question at a time.',
  onExit,
  onRestart,
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
      <Card className="mx-auto max-w-3xl rounded-[28px] border-slate-200/80 shadow-lg dark:border-slate-800">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Flag className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Smart Drill Complete</CardTitle>
          <p className="text-muted-foreground">本轮训练已结束，下面是这组题的结果摘要。</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-end justify-center gap-2">
            <span className="text-6xl font-extrabold text-primary">{score}</span>
            <span className="mb-2 text-xl text-muted-foreground">/ 100</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-800 dark:bg-slate-900/60">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Correct</div>
              <div className="mt-2 text-2xl font-black text-emerald-500">{finalCorrectCount}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-800 dark:bg-slate-900/60">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Incorrect</div>
              <div className="mt-2 text-2xl font-black text-rose-500">{incorrectCount}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-800 dark:bg-slate-900/60">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Saved</div>
              <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{savedSession ? 'Yes' : 'Local'}</div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Coach Note</div>
            <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-300">{recommendation}</p>
            {submitError ? (
              <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{submitError}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, idx) => (
              <div
                key={q.id}
                className={cn(
                  'aspect-square flex items-center justify-center rounded-md border text-sm font-bold',
                  results[q.id]
                    ? 'border-green-200 bg-green-100 text-green-700'
                    : results[q.id] === false
                      ? 'border-red-200 bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-400',
                )}
              >
                {idx + 1}
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button variant="outline" onClick={onRestart ?? onExit}>
            <RotateCcw className="mr-2 h-4 w-4" />
            再来一轮
          </Button>
          <Button onClick={onExit}>返回练习中心</Button>
        </CardFooter>
      </Card>
    )
  }

  const isChecked = results[currentQuestion.id] !== undefined
  const hasAnswered = !!userAnswers[currentQuestion.id] && (Array.isArray(userAnswers[currentQuestion.id]) ? (userAnswers[currentQuestion.id] as string[]).length > 0 : true)
  const progressLabel = checkedCount === 0
    ? '先完成当前题目，系统才会开始计算准确率。'
    : `已判定 ${checkedCount} / ${totalQuestions} 题，当前准确率 ${liveAccuracy}%。`

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card className="rounded-[28px] border-slate-200/80 bg-white/95 dark:border-slate-800 dark:bg-slate-950/80">
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-600 dark:text-cyan-300">{sessionLabel}</div>
              <div className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                Question {currentIndex + 1} / {totalQuestions}
              </div>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{sessionSubtitle}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:min-w-[260px]">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60">
                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Accuracy</div>
                <div className="mt-2 text-xl font-black text-slate-950 dark:text-white">{liveAccuracy}%</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60">
                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Correct</div>
                <div className="mt-2 text-xl font-black text-slate-950 dark:text-white">{correctCount}</div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={progress} className="h-2.5" />
            <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">{progressLabel}</div>
          </div>
        </CardContent>
      </Card>

      <QuestionCard
        question={formattedQuestion}
        userAnswer={userAnswers[currentQuestion.id]}
        onAnswerChange={handleAnswerChange}
        showResult={isChecked}
        readOnly={isChecked}
        className="min-h-[400px] shadow-md"
      />

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" className="justify-start px-0 text-slate-500 hover:text-slate-900 dark:hover:text-white" onClick={onExit}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          退出本轮训练
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
