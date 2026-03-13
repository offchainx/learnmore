'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { RotateCcw, LogOut, Send, Clock3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { QuestionCard } from '@/components/business/question'
import type { Question } from '@/components/business/question'
import CountdownTimer from '@/components/practice/session/CountdownTimer'
import { cn } from '@/lib/utils'

export interface UnifiedPracticeQuestion {
  id: string
  question: Question
  difficulty?: number | null
  meta?: string
}

interface UnifiedPracticeWorkspaceProps {
  title: string
  modeLabel: string
  subtitle: string
  questions: UnifiedPracticeQuestion[]
  onSubmit: (payload: {
    answers: Record<string, string | string[]>
    duration: number
  }) => Promise<void>
  onRefresh?: () => void
  onExit: () => void
  submitLabel?: string
  refreshLabel?: string
  exitLabel?: string
  isSubmitting?: boolean
  timeLimitSeconds?: number | null
  onTimeUp?: () => void
  rightPanelNote?: string
  stickyOffsetClassName?: string
}

function hasAnswer(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value.length > 0
  return Boolean(value && value.trim().length > 0)
}

export default function UnifiedPracticeWorkspace({
  title,
  modeLabel,
  subtitle,
  questions,
  onSubmit,
  onRefresh,
  onExit,
  submitLabel = '提交试卷',
  refreshLabel = '刷新',
  exitLabel = '退出练习',
  isSubmitting = false,
  timeLimitSeconds = null,
  onTimeUp,
  rightPanelNote,
  stickyOffsetClassName = 'top-3',
}: UnifiedPracticeWorkspaceProps) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [activeQuestionId, setActiveQuestionId] = useState<string>(questions[0]?.id || '')
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [startedAt] = useState(() => Date.now())
  const questionRefs = useRef<Record<string, HTMLElement | null>>({})

  const totalQuestions = questions.length
  const answeredCount = useMemo(
    () => Object.values(answers).filter((value) => hasAnswer(value)).length,
    [answers],
  )
  const progress = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0

  useEffect(() => {
    if (questions.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]

        if (visibleEntry?.target instanceof HTMLElement) {
          setActiveQuestionId(visibleEntry.target.dataset.questionId || questions[0].id)
        }
      },
      {
        rootMargin: '-20% 0px -55% 0px',
        threshold: 0.15,
      },
    )

    questions.forEach((item) => {
      const node = questionRefs.current[item.id]
      if (node) observer.observe(node)
    })

    return () => observer.disconnect()
  }, [questions])

  const goToQuestion = (questionId: string) => {
    const node = questionRefs.current[questionId]
    if (!node) return
    setActiveQuestionId(questionId)
    node.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleSubmit = async () => {
    const duration = Math.max(1, Math.round((Date.now() - startedAt) / 1000))
    await onSubmit({ answers, duration })
    setShowSubmitDialog(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        {onRefresh ? (
          <Button variant="outline" size="sm" className="rounded-xl bg-white/80 dark:bg-slate-950/80" onClick={onRefresh}>
            <RotateCcw className="mr-2 h-4 w-4" />
            {refreshLabel}
          </Button>
        ) : null}
        <Button variant="ghost" size="sm" className="rounded-xl bg-white/80 text-slate-700 hover:bg-white dark:bg-slate-950/80 dark:text-slate-200 dark:hover:bg-slate-950" onClick={onExit}>
          <LogOut className="mr-2 h-4 w-4" />
          {exitLabel}
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)_280px]">
      <aside className={cn('hidden xl:block', `xl:sticky ${stickyOffsetClassName} xl:self-start`)}>
        <Card className="rounded-[28px] border-slate-200/80 bg-white/95 shadow-[0_16px_40px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-950/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-black tracking-tight text-slate-900 dark:text-white">答题卡</CardTitle>
            <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">点击题号可快速跳转。蓝色表示当前题，亮色表示已作答。</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-4 gap-2">
              {questions.map((item, index) => {
                const answered = hasAnswer(answers[item.id])
                const active = activeQuestionId === item.id

                return (
                  <button
                    key={item.id}
                    onClick={() => goToQuestion(item.id)}
                    className={cn(
                      'flex aspect-square items-center justify-center rounded-xl border text-sm font-black transition-all',
                      active
                        ? 'border-cyan-400 bg-cyan-400/15 text-cyan-600 shadow-[0_0_0_1px_rgba(34,211,238,0.2)] dark:text-cyan-300'
                        : answered
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300'
                          : 'border-slate-200 bg-slate-100 text-slate-500 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-400',
                    )}
                  >
                    {index + 1}
                  </button>
                )
              })}
            </div>

            <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-cyan-400/70" />
                当前题
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-400/70" />
                已作答
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-slate-300 dark:bg-slate-700" />
                未作答
              </div>
            </div>
          </CardContent>
        </Card>
      </aside>

      <main className="space-y-5">
        {questions.map((item, index) => (
          <section
            key={item.id}
            ref={(node) => {
              questionRefs.current[item.id] = node
            }}
            data-question-id={item.id}
            className="scroll-mt-28"
          >
            <Card className="overflow-hidden rounded-[28px] border-slate-200/80 bg-white/95 shadow-[0_16px_36px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-950/80">
              <CardHeader className="border-b border-slate-200/70 bg-slate-50/75 px-5 py-4 dark:border-slate-800 dark:bg-slate-900/50 sm:px-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-[11px] font-black uppercase tracking-[0.18em] text-cyan-600 dark:text-cyan-300">
                      Question {String(index + 1).padStart(2, '0')}
                    </div>
                    <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {item.meta || '按顺序完成整组题目后统一交卷'}
                    </div>
                  </div>

                  <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-slate-500 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-400">
                    难度 {item.difficulty ?? 3} / 5
                  </div>
                </div>
              </CardHeader>

              <CardContent className="px-5 py-5 sm:px-6">
                <QuestionCard
                  question={item.question}
                  userAnswer={answers[item.id]}
                  onAnswerChange={(value) => {
                    setActiveQuestionId(item.id)
                    setAnswers((prev) => ({
                      ...prev,
                      [item.id]: value,
                    }))
                  }}
                  showResult={false}
                  readOnly={false}
                  className="border-none shadow-none"
                />
              </CardContent>
            </Card>
          </section>
        ))}
      </main>

      <aside className={cn(`sticky ${stickyOffsetClassName} self-start`)}>
        <Card className="rounded-[28px] border-slate-200/80 bg-white/95 shadow-[0_16px_40px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-950/80">
          <CardHeader className="space-y-4 pb-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-cyan-600 dark:text-cyan-300">
                  {modeLabel}
                </div>
                <CardTitle className="mt-2 text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  {title}
                </CardTitle>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{subtitle}</p>
              </div>
            </div>

            <div className="text-xs leading-5 text-slate-500 dark:text-slate-400">
              右上角可刷新当前练习或直接退出，交卷操作保留在下方状态栏。
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            {timeLimitSeconds !== null ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                <div className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                  <Clock3 className="h-3.5 w-3.5 text-cyan-500" />
                  剩余时间
                </div>
                <CountdownTimer
                  duration={timeLimitSeconds}
                  onTimeUp={() => {
                    void handleSubmit().then(() => {
                      onTimeUp?.()
                    })
                  }}
                  className="w-full justify-center rounded-xl bg-transparent px-0 py-0 text-2xl font-black"
                />
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">已答题数</div>
                <div className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{answeredCount}</div>
                <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">共 {totalQuestions} 题</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">完成进度</div>
                <div className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{progress}%</div>
                <Progress value={progress} className="mt-3 h-2" />
              </div>
            </div>

            {rightPanelNote ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm leading-6 text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
                {rightPanelNote}
              </div>
            ) : null}

            <Button
              className="h-12 w-full rounded-2xl bg-cyan-500 font-black text-white hover:bg-cyan-400"
              onClick={() => setShowSubmitDialog(true)}
              disabled={answeredCount === 0 || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  正在提交
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  {submitLabel}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </aside>

      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认提交？</DialogTitle>
            <DialogDescription>
              当前已作答 {answeredCount} / {totalQuestions} 题。
              {answeredCount < totalQuestions ? (
                <span className="mt-2 block text-amber-600">
                  还有 {totalQuestions - answeredCount} 题未作答，系统会按未答处理。
                </span>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
              继续作答
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {submitLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  )
}
