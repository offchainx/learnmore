'use client'

import { useMemo, useState } from 'react'
import { Question, QuestionType } from '@prisma/client'
import { submitPracticeSession } from '@/actions/practice/session'
import { QuestionCard } from '@/components/business/question'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { PracticeHeader } from '@/components/practice/modes/shared/PracticeHeader'
import { PracticeResultPanel } from '@/components/practice/modes/shared/PracticeResultPanel'
import { ArrowLeft, BrainCircuit, CheckCircle2, Flag, Loader2, Target } from 'lucide-react'

interface SmartDrillContinuousSessionProps {
  questions: Question[]
  userId: string
  subjectId: string
  title?: string
  persistSession?: boolean
  onExit: () => void
  onRestart?: () => void
  previewMode?: boolean
}

function isAnswerPresent(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value.length > 0
  return Boolean(value && value.trim().length > 0)
}

export default function SmartDrillContinuousSession({
  questions,
  userId,
  subjectId,
  title = 'Smart Drill',
  persistSession = true,
  onExit,
  onRestart,
  previewMode = false,
}: SmartDrillContinuousSessionProps) {
  const [userAnswers, setUserAnswers] = useState<Record<string, string | string[]>>({})
  const [results, setResults] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [savedScore, setSavedScore] = useState<number | null>(null)
  const [savedCorrectCount, setSavedCorrectCount] = useState<number | null>(null)
  const [savedSession, setSavedSession] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [startedAt] = useState(() => Date.now())

  const totalQuestions = questions.length
  const checkedCount = Object.keys(results).length
  const answeredCount = Object.values(userAnswers).filter((value) => isAnswerPresent(value)).length
  const correctCount = Object.values(results).filter(Boolean).length
  const incorrectCount = checkedCount - correctCount
  const liveAccuracy = checkedCount > 0 ? Math.round((correctCount / checkedCount) * 100) : 0
  const progress = totalQuestions > 0 ? Math.round((checkedCount / totalQuestions) * 100) : 0
  const allChecked = checkedCount === totalQuestions

  const recommendation = useMemo(() => {
    if (liveAccuracy >= 80) {
      return '这一轮状态稳定，可以直接进入下一轮 Smart Drill，或切去 Mock Arena 做限时演练。'
    }
    if (liveAccuracy >= 60) {
      return '整体已经过线，建议继续做一轮 Smart Drill，把中段题和易错点再压实。'
    }
    return '这轮暴露出的波动还比较明显，建议先继续 Smart Drill，必要时回到 Chapter Map 补章节。'
  }, [liveAccuracy])

  const formatQuestion = (question: Question) => ({
    ...question,
    type: question.type as QuestionType,
    options: question.options as Record<string, string> | null,
    answer: question.answer as string | string[] | null,
    explanation: question.explanation || null,
  })

  const isCorrectAnswer = (question: Question, userAnswer: string | string[] | undefined) => {
    const formattedQuestion = formatQuestion(question)
    const qAnswer = formattedQuestion.answer

    if (!userAnswer || !qAnswer) return false

    if (formattedQuestion.type === 'SINGLE_CHOICE') {
      return userAnswer === qAnswer
    }

    if (formattedQuestion.type === 'MULTIPLE_CHOICE') {
      const uArr = Array.isArray(userAnswer) ? userAnswer : [userAnswer]
      const qArr = Array.isArray(qAnswer) ? qAnswer : [qAnswer]
      if (uArr.length !== qArr.length) return false
      const sortedU = [...uArr].sort()
      const sortedQ = [...qArr].sort()
      return sortedU.every((value, index) => value === sortedQ[index])
    }

    if (formattedQuestion.type === 'FILL_BLANK') {
      return userAnswer === qAnswer
    }

    return false
  }

  const handleCheckAnswer = (questionId: string) => {
    const question = questions.find((item) => item.id === questionId)
    if (!question) return
    const userAnswer = userAnswers[questionId]
    if (!isAnswerPresent(userAnswer)) return

    setResults((prev) => ({
      ...prev,
      [questionId]: isCorrectAnswer(question, userAnswer),
    }))
  }

  const handleSubmit = async () => {
    if (!allChecked || isSubmitting) return

    if (!persistSession) {
      setSavedScore(liveAccuracy)
      setSavedCorrectCount(correctCount)
      setSavedSession(false)
      setSubmitError('当前为 Mock 预览模式，本轮结果不会写入正式训练记录。')
      setIsFinished(true)
      return
    }

    const duration = Math.max(1, Math.round((Date.now() - startedAt) / 1000))
    const answers = questions.map((question) => ({
      questionId: question.id,
      userAnswer: userAnswers[question.id] ?? null,
    }))

    setIsSubmitting(true)
    setSubmitError(null)

    const submitResult = await submitPracticeSession({
      userId,
      mode: 'SMART_DRILL',
      answers,
      duration,
      subjectId,
      title,
    })

    if (submitResult.success) {
      setSavedScore(Math.round(submitResult.score ?? liveAccuracy))
      setSavedCorrectCount(submitResult.correctCount ?? correctCount)
      setSavedSession(true)
    } else {
      setSavedScore(liveAccuracy)
      setSavedCorrectCount(correctCount)
      setSavedSession(false)
      setSubmitError(submitResult.error || '训练结果保存失败，本轮成绩仅保留在本地。')
    }

    setIsSubmitting(false)
    setIsFinished(true)
  }

  if (isFinished) {
    const finalScore = savedScore ?? liveAccuracy
    const finalCorrect = savedCorrectCount ?? correctCount

    return (
      <PracticeResultPanel
        title="Smart Drill 完成"
        subtitle={previewMode ? '当前展示的是 Mock 预览结果摘要，用来确认 Smart Drill 最终渲染效果。' : '本轮智能训练已结束，下面是这一组题的结果摘要。'}
        score={finalScore}
        theme="cyan"
        stats={[
          { label: '已判定', value: checkedCount, toneClassName: 'text-cyan-200' },
          { label: '正确', value: finalCorrect, toneClassName: 'text-emerald-300' },
          { label: '错误', value: Math.max(0, totalQuestions - finalCorrect), toneClassName: 'text-rose-300' },
          { label: '结果保存', value: savedSession ? '已保存' : '仅本地' },
        ]}
        recommendation={recommendation}
        note={submitError}
        questionStates={questions.map((question) => Boolean(results[question.id]))}
        primaryActionLabel="返回练习中心"
        primaryAction={onExit}
        secondaryActionLabel="再来一轮"
        secondaryAction={onRestart ?? onExit}
      />
    )
  }

  return (
    <div className="space-y-5">
      <div className="sticky top-3 z-20">
        <PracticeHeader
          compact
          theme="cyan"
          icon={BrainCircuit}
          badge={previewMode ? 'Smart Drill Mock' : 'Smart Drill'}
          title="整组连续作答"
          description="顺着往下完成整组题目。每题会在原地判定，不再频繁切页。"
          stats={[
            { label: '已完成', value: `${checkedCount} / ${totalQuestions}`, icon: CheckCircle2 },
            { label: '正确率', value: `${liveAccuracy}%`, icon: Target },
          ]}
        >
          <Progress value={progress} className="h-2.5" />
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-300">
              {allChecked ? '所有题目都已判定，可以直接提交本轮训练。' : `已作答 ${answeredCount} 题，已判定 ${checkedCount} 题。`}
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!allChecked || isSubmitting}
              className="rounded-2xl bg-cyan-400 text-slate-950 hover:bg-cyan-300 disabled:bg-slate-700 disabled:text-slate-300"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  保存训练结果
                </>
              ) : (
                <>
                  完成本轮训练
                  <Flag className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </PracticeHeader>
      </div>

      <div className="space-y-5">
        {questions.map((question, index) => {
          const formattedQuestion = formatQuestion(question)
          const isChecked = results[question.id] !== undefined
          const hasAnswered = isAnswerPresent(userAnswers[question.id])

          return (
            <section key={question.id} className="space-y-3 rounded-[28px] border border-slate-200/80 bg-white/95 p-4 shadow-[0_14px_30px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-950/75 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300">
                    Question {String(index + 1).padStart(2, '0')}
                  </div>
                  <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {question.chapterId ? `章节线索：${question.chapterId}` : '通用训练题'}
                  </div>
                </div>
                <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
                  难度 {question.difficulty ?? 3} / 5
                </div>
              </div>

              <QuestionCard
                question={formattedQuestion}
                userAnswer={userAnswers[question.id]}
                onAnswerChange={(value) =>
                  setUserAnswers((prev) => ({
                    ...prev,
                    [question.id]: value,
                  }))
                }
                showResult={isChecked}
                readOnly={isChecked}
                className="min-h-[320px] border-none shadow-none"
              />

              <div className="flex flex-col gap-3 border-t border-slate-200/80 pt-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  variant="ghost"
                  className="justify-start px-0 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  onClick={onExit}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  退出 Smart Drill
                </Button>

                {isChecked ? (
                  <div className={`rounded-full px-3 py-1 text-sm font-bold ${results[question.id] ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300' : 'bg-rose-500/10 text-rose-600 dark:text-rose-300'}`}>
                    {results[question.id] ? '这一题已答对' : '这一题需要再留意'}
                  </div>
                ) : (
                  <Button onClick={() => handleCheckAnswer(question.id)} disabled={!hasAnswered}>
                    检查这一题
                  </Button>
                )}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
