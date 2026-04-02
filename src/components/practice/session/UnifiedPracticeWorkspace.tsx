'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { RotateCcw, LogOut, Send, Clock3, TimerReset } from 'lucide-react'
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { QuestionCard, QuestionReportButton, QuestionContent } from '@/components/business/question'
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
  reporterId?: string
}

function hasAnswer(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value.length > 0
  return Boolean(value && value.trim().length > 0)
}

function shouldRenderSharedMaterial(
  questions: UnifiedPracticeQuestion[],
  index: number
) {
  const currentGroupId = questions[index]?.question.group?.id
  if (!currentGroupId) return false
  const previousGroupId = questions[index - 1]?.question.group?.id
  return currentGroupId !== previousGroupId
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
  reporterId,
}: UnifiedPracticeWorkspaceProps) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [activeQuestionId, setActiveQuestionId] = useState<string>(questions[0]?.id || '')
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [showElapsedTimeSheet, setShowElapsedTimeSheet] = useState(false)
  const [startedAt] = useState(() => Date.now())
  const [now, setNow] = useState(() => Date.now())
  const questionRefs = useRef<Record<string, HTMLElement | null>>({})

  const totalQuestions = questions.length
  const answeredCount = useMemo(
    () => Object.values(answers).filter((value) => hasAnswer(value)).length,
    [answers],
  )
  const progress = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0
  const elapsedSeconds = Math.max(1, Math.round((now - startedAt) / 1000))
  const elapsedMinutes = Math.max(1, Math.ceil(elapsedSeconds / 60))

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

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now())
    }, 15000)

    return () => window.clearInterval(timer)
  }, [])

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
        <Sheet
          open={showElapsedTimeSheet}
          onOpenChange={setShowElapsedTimeSheet}
        >
          <TooltipProvider delayDuration={120}>
            <Tooltip>
              <TooltipTrigger asChild>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full bg-surface/90 text-text-secondary hover:bg-surface hover:text-text-primary dark:bg-surface-subtle/90 dark:text-text-secondary dark:hover:bg-surface-subtle"
                    aria-label="答题时间"
                  >
                    <TimerReset className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <span>答题时间</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <SheetContent
            side="right"
            className="w-full border-l border-borderTone bg-surface/95 p-0 sm:max-w-sm dark:border-borderTone dark:bg-surface-subtle/95"
          >
            <SheetHeader className="border-b border-borderTone px-5 py-5 text-left dark:border-borderTone">
              <SheetTitle className="flex items-center gap-2 text-lg font-semibold text-text-primary dark:text-text-primary">
                <TimerReset className="h-4 w-4 text-primary" />
                答题时间
              </SheetTitle>
              <SheetDescription className="text-sm leading-6 text-text-secondary dark:text-text-secondary">
                这里只显示当前这轮答题已经使用的时间，按分钟计，不会影响交卷节奏。
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-4 px-5 py-5">
              <div className="rounded-[24px] border border-borderTone bg-surface px-5 py-4 shadow-surface dark:border-borderTone dark:bg-surface">
                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-text-tertiary">
                  当前已用
                </div>
                <div className="mt-3 text-4xl font-black tracking-tight text-text-primary dark:text-text-primary">
                  {elapsedMinutes}
                  <span className="ml-1 text-base font-semibold text-text-secondary dark:text-text-secondary">
                    分钟
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-borderTone bg-surface-subtle px-4 py-4 text-sm leading-6 text-text-secondary dark:border-borderTone dark:bg-surface-subtle dark:text-text-secondary">
                当前计时从你进入这轮答题页开始，提交时会作为本轮练习时长写入记录。
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {onRefresh ? (
          <Button variant="outline" size="sm" className="rounded-xl bg-surface/90 dark:bg-surface-subtle/90" onClick={onRefresh}>
            <RotateCcw className="mr-2 h-4 w-4" />
            {refreshLabel}
          </Button>
        ) : null}
        <Button variant="ghost" size="sm" className="rounded-xl bg-surface/90 text-text-secondary hover:bg-surface hover:text-text-primary dark:bg-surface-subtle/90 dark:text-text-secondary dark:hover:bg-surface-subtle" onClick={onExit}>
          <LogOut className="mr-2 h-4 w-4" />
          {exitLabel}
        </Button>
      </div>

      <div className="grid gap-4 2xl:grid-cols-[220px_minmax(0,1fr)_280px]">
      <aside className={cn('hidden 2xl:block', `2xl:sticky ${stickyOffsetClassName} 2xl:self-start`)}>
        <Card className="rounded-[28px]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-black tracking-tight text-text-primary dark:text-text-primary">答题卡</CardTitle>
            <p className="text-xs leading-5 text-text-secondary dark:text-text-secondary">点击题号可快速跳转。高亮表示当前题，成功色表示已作答。</p>
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
                        ? 'border-primary/30 bg-[hsl(var(--state-info-bg))] text-[hsl(var(--state-info-fg))] shadow-[0_0_0_1px_rgba(37,99,235,0.12)]'
                        : answered
                          ? 'border-[hsl(var(--state-success-fg))/0.18] bg-[hsl(var(--state-success-bg))] text-[hsl(var(--state-success-fg))]'
                          : 'border-borderTone bg-surface-subtle text-text-tertiary hover:border-[hsl(var(--border-strong))] hover:bg-surface',
                    )}
                  >
                    {index + 1}
                  </button>
                )
              })}
            </div>

            <div className="space-y-2 text-xs text-text-secondary dark:text-text-secondary">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-cyan-400/70" />
                当前题
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-400/70" />
                已作答
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-borderTone" />
                未作答
              </div>
            </div>
          </CardContent>
        </Card>
      </aside>

      <main className="space-y-5">
        {questions.map((item, index) => (
          <div key={item.id} className="space-y-4">
            {shouldRenderSharedMaterial(questions, index) ? (
              <Card className="overflow-hidden rounded-[28px] border-primary/10 bg-cyan-50/60 shadow-[0_18px_48px_rgba(6,182,212,0.08)] dark:border-cyan-900/40 dark:bg-cyan-950/20">
                <CardHeader className="border-b border-primary/10 bg-cyan-100/60 px-5 py-4 sm:px-6 dark:border-cyan-900/40 dark:bg-cyan-950/30">
                  <div className="text-[11px] font-black uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-300">
                    共享材料
                  </div>
                  <div className="mt-1 text-sm text-cyan-900 dark:text-cyan-100">
                    {item.question.group?.title || '当前子题共用同一段材料，请先阅读材料再继续作答。'}
                  </div>
                </CardHeader>
                <CardContent className="px-5 py-5 sm:px-6">
                  <QuestionContent
                    content={item.question.group?.material || ''}
                    className="text-base leading-7 text-text-primary dark:text-slate-100"
                  />
                </CardContent>
              </Card>
            ) : null}

            <section
              ref={(node) => {
                questionRefs.current[item.id] = node
              }}
              data-question-id={item.id}
              className="scroll-mt-28"
            >
              <Card className="overflow-hidden rounded-[28px]">
                <CardHeader className="border-b border-borderTone bg-surface-subtle px-5 py-4 sm:px-6">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">
                        Question {String(index + 1).padStart(2, '0')}
                      </div>
                      <div className="mt-1 text-sm text-text-secondary dark:text-text-secondary">
                        {item.meta || '按顺序完成整组题目后统一交卷'}
                      </div>
                    </div>

                    <div className="rounded-full border border-borderTone bg-surface px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-text-tertiary dark:border-borderTone dark:bg-surface-subtle dark:text-text-tertiary">
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
                    headerAction={
                      reporterId ? (
                        <QuestionReportButton
                          questionId={item.id}
                          reportedBy={reporterId}
                          questionLabel={`第 ${index + 1} 题`}
                        />
                      ) : null
                    }
                  />
                </CardContent>
              </Card>
            </section>
          </div>
        ))}
      </main>

      <aside className={cn(`sticky ${stickyOffsetClassName} self-start`)}>
        <Card className="rounded-[28px]">
          <CardHeader className="space-y-4 pb-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">
                  {modeLabel}
                </div>
                <CardTitle className="mt-2 text-xl font-black tracking-tight text-text-primary dark:text-text-primary">
                  {title}
                </CardTitle>
                <p className="mt-2 text-sm leading-6 text-text-secondary dark:text-text-secondary">{subtitle}</p>
              </div>
            </div>

            <div className="text-xs leading-5 text-text-secondary dark:text-text-secondary">
              右上角可刷新当前练习或直接退出，交卷操作保留在下方状态栏。
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            {timeLimitSeconds !== null ? (
              <div className="rounded-2xl border border-borderTone bg-surface-subtle p-4 dark:border-borderTone dark:bg-surface-subtle">
                <div className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-text-tertiary">
                  <Clock3 className="h-3.5 w-3.5 text-primary" />
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

            <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-1">
              <div className="rounded-2xl border border-borderTone bg-surface-subtle p-4 dark:border-borderTone dark:bg-surface-subtle">
                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-text-tertiary">已答题数</div>
                <div className="mt-2 text-3xl font-black text-text-primary dark:text-text-primary">{answeredCount}</div>
                <div className="mt-1 text-sm text-text-secondary dark:text-text-secondary">共 {totalQuestions} 题</div>
              </div>
              <div className="rounded-2xl border border-borderTone bg-surface-subtle p-4 dark:border-borderTone dark:bg-surface-subtle">
                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-text-tertiary">完成进度</div>
                <div className="mt-2 text-3xl font-black text-text-primary dark:text-text-primary">{progress}%</div>
                <Progress value={progress} className="mt-3 h-2" />
              </div>
            </div>

            {rightPanelNote ? (
              <div className="rounded-2xl border border-borderTone bg-surface-subtle p-4 text-sm leading-6 text-text-secondary dark:border-borderTone dark:bg-surface-subtle dark:text-text-secondary">
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
