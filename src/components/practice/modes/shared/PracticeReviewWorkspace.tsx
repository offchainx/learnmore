'use client'

import type { ReactNode } from 'react'
import { useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, CircleCheck, CircleX, Lock, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { practiceThemeStyles, type PracticeModeTheme } from './theme'
import { QuestionCard } from '@/components/business/question'
import { QuestionContent } from '@/components/business/question'
import type { Question } from '@/components/business/question'
import type { TierKey } from '@/lib/permissions/types'

export interface PracticeReviewItem {
  id: string
  order: number
  question: Question
  userAnswer?: string | string[] | null
  isCorrect: boolean
  emphasisNote?: string | null
}

interface PracticeReviewWorkspaceProps {
  title: string
  subtitle: string
  score: number
  stats: Array<{ label: string; value: ReactNode; toneClassName?: string }>
  recommendation: string
  theme?: PracticeModeTheme
  items: PracticeReviewItem[]
  note?: React.ReactNode
  primaryActionLabel: string
  primaryAction: () => void
  secondaryActionLabel?: string
  secondaryAction?: () => void
  userTier?: TierKey
}

type ReviewFilter = 'all' | 'wrong' | 'correct'

type ReviewExperience = {
  label: string
  summary: string
  canViewExplanation: boolean
  canViewSupplementaryNotes: boolean
  canViewFollowUpAdvice: boolean
}

function getReviewExperience(userTier: TierKey): ReviewExperience {
  switch (userTier) {
    case 'PREMIER':
      return {
        label: 'Premier 全量复盘',
        summary: '可查看逐题解析、补充说明和更完整的后续提分建议。',
        canViewExplanation: true,
        canViewSupplementaryNotes: true,
        canViewFollowUpAdvice: true,
      }
    case 'SMART_PLUS':
      return {
        label: 'Smart Plus 深度复盘',
        summary: '可查看逐题解析、补充说明和针对本轮的提分建议。',
        canViewExplanation: true,
        canViewSupplementaryNotes: true,
        canViewFollowUpAdvice: true,
      }
    case 'STANDARD':
      return {
        label: 'Standard 解析复盘',
        summary: '可查看逐题解析和基础补充说明。',
        canViewExplanation: true,
        canViewSupplementaryNotes: true,
        canViewFollowUpAdvice: false,
      }
    default:
      return {
        label: 'Starter 基础复盘',
        summary: '可查看对错、你的答案和标准答案；逐题解析与提分建议需升级后解锁。',
        canViewExplanation: false,
        canViewSupplementaryNotes: false,
        canViewFollowUpAdvice: false,
      }
  }
}

function buildFollowUpAdvice(item: PracticeReviewItem) {
  if (item.isCorrect) {
    return '这题已经做对，复盘时重点确认方法是否稳定，下次优先压缩作答时间。'
  }

  switch (item.question.type) {
    case 'MULTIPLE_CHOICE':
      return '这题失分通常来自漏选或多选，先逐项排除，再回头核对是否有遗漏条件。'
    case 'FILL_BLANK':
      return '这题更适合先写出关键步骤或中间量，再回填答案，避免只凭感觉作答。'
    case 'TRUE_FALSE':
      return '先抓题干中的绝对化表述，再判断结论是否与核心概念冲突。'
    case 'ESSAY':
      return '先按得分点拆开作答，确保每一问都有对应步骤或结论，不要只给最终答案。'
    default:
      return '先回看你当时的判断依据，再对照标准答案找出真正错在概念、条件还是计算。'
  }
}

function buildOverallAdvice(items: PracticeReviewItem[]) {
  const wrongItems = items.filter((item) => !item.isCorrect)
  if (wrongItems.length === 0) {
    return [
      '这一轮没有出现错题，可以优先把同类型题目的作答时间再压缩一档。',
      '建议下一轮切回更高难度或更长题量，验证当前稳定性是否能持续。',
    ]
  }

  const typeCounts = new Map<string, number>()
  for (const item of wrongItems) {
    typeCounts.set(item.question.type, (typeCounts.get(item.question.type) ?? 0) + 1)
  }
  const dominantType =
    [...typeCounts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? 'SINGLE_CHOICE'
  const dominantLabel =
    dominantType === 'MULTIPLE_CHOICE'
      ? '多选题'
      : dominantType === 'FILL_BLANK'
        ? '填空题'
        : dominantType === 'TRUE_FALSE'
          ? '判断题'
          : dominantType === 'ESSAY'
            ? '主观题'
            : '单选题'

  return [
    `本轮主要失分集中在${dominantLabel}，下一轮优先复刷这类题，先收口同类错误。`,
    wrongItems.length >= 5
      ? '错题数量偏多，建议先回到 Smart Drill 或 Error Wiper 做短轮修复，再回到当前模式验收。'
      : '错题数量不多，更适合逐题复盘后立刻再来一轮巩固，避免问题再次扩散。',
  ]
}

function shouldRenderSharedMaterial(items: PracticeReviewItem[], index: number) {
  const currentGroupId = items[index]?.question.group?.id
  if (!currentGroupId) return false
  const previousGroupId = items[index - 1]?.question.group?.id
  return currentGroupId !== previousGroupId
}

export function PracticeReviewWorkspace({
  title,
  subtitle,
  score,
  stats,
  recommendation,
  theme = 'slate',
  items,
  note,
  primaryActionLabel,
  primaryAction,
  secondaryActionLabel,
  secondaryAction,
  userTier = 'STARTER',
}: PracticeReviewWorkspaceProps) {
  const router = useRouter()
  const themeStyle = practiceThemeStyles[theme]
  const [filter, setFilter] = useState<ReviewFilter>('all')
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})
  const reviewExperience = useMemo(() => getReviewExperience(userTier), [userTier])
  const overallAdvice = useMemo(
    () =>
      reviewExperience.canViewFollowUpAdvice ? buildOverallAdvice(items) : [],
    [items, reviewExperience.canViewFollowUpAdvice]
  )
  const totalWrong = useMemo(
    () => items.filter((item) => !item.isCorrect).length,
    [items]
  )

  const filteredItems = useMemo(() => {
    if (filter === 'wrong') return items.filter((item) => !item.isCorrect)
    if (filter === 'correct') return items.filter((item) => item.isCorrect)
    return items
  }, [filter, items])

  const jumpToQuestion = (id: string) => {
    const node = sectionRefs.current[id]
    if (!node) return
    node.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="mx-auto w-full max-w-[1680px] px-3 py-2 sm:px-4 sm:py-4">
      <div className="grid gap-4 desktop:grid-cols-[minmax(0,1fr)_360px]">
        <main className="space-y-4">
          <Card className={cn('overflow-hidden rounded-[32px] border-white/10 shadow-[0_24px_70px_rgba(15,23,42,0.18)]', themeStyle.shell)}>
            <CardHeader className="space-y-5 px-5 py-6 sm:px-7">
              <div className="flex flex-col gap-3 desktop:flex-row desktop:items-end desktop:justify-between">
                <div>
                  <div className={cn('inline-flex rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]', themeStyle.badge)}>
                    提交后复盘
                  </div>
                  <CardTitle className="mt-4 text-3xl font-black text-white sm:text-4xl">{title}</CardTitle>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">{subtitle}</p>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-6xl font-extrabold text-white">{score}</span>
                  <span className="pb-2 text-xl text-slate-400">/ 100</span>
                </div>
              </div>

              <div className="grid gap-3 tablet:grid-cols-2 desktop:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{stat.label}</div>
                    <div className={cn('mt-2 text-2xl font-black text-white', stat.toneClassName)}>{stat.value}</div>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className={cn('text-xs font-black uppercase tracking-[0.18em]', themeStyle.panelLabel)}>本轮建议</div>
                <p className="mt-3 text-sm leading-6 text-slate-200">{recommendation}</p>
                {note ? <div className="mt-3 text-sm text-amber-300">{note}</div> : null}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  className={cn(filter === 'all' ? themeStyle.primaryButton : 'border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white')}
                  onClick={() => setFilter('all')}
                >
                  全部 {items.length}
                </Button>
                <Button
                  variant={filter === 'wrong' ? 'default' : 'outline'}
                  className={cn(filter === 'wrong' ? 'bg-rose-400 text-slate-950 hover:bg-rose-300' : 'border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white')}
                  onClick={() => setFilter('wrong')}
                >
                  错题 {items.filter((item) => !item.isCorrect).length}
                </Button>
                <Button
                  variant={filter === 'correct' ? 'default' : 'outline'}
                  className={cn(filter === 'correct' ? 'bg-emerald-400 text-slate-950 hover:bg-emerald-300' : 'border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white')}
                  onClick={() => setFilter('correct')}
                >
                  正确 {items.filter((item) => item.isCorrect).length}
                </Button>
              </div>
            </CardHeader>
          </Card>

          <div className="space-y-4">
            {filteredItems.map((item, index) => (
              <div key={item.id} className="space-y-4">
                {shouldRenderSharedMaterial(filteredItems, index) ? (
                  <Card className="overflow-hidden rounded-[28px] border-primary/10 bg-cyan-50/60 shadow-[0_18px_48px_rgba(6,182,212,0.08)] dark:border-cyan-900/40 dark:bg-cyan-950/20">
                    <CardHeader className="border-b border-primary/10 bg-cyan-100/60 px-5 py-4 sm:px-6 dark:border-cyan-900/40 dark:bg-cyan-950/30">
                      <div className="text-[11px] font-black uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-300">
                        共享材料
                      </div>
                      <p className="mt-2 text-sm leading-6 text-cyan-900 dark:text-cyan-100">
                        {item.question.group?.title || '当前这组子题共用同一段材料，复盘时先回看材料再核对子题答案。'}
                      </p>
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
                    sectionRefs.current[item.id] = node
                  }}
                  className="scroll-mt-28"
                >
                  <Card className="overflow-hidden rounded-[28px] border-borderTone bg-surface/95 shadow-[0_18px_48px_rgba(15,23,42,0.08)] dark:bg-slate-950/70">
                    <CardHeader className="border-b border-borderTone bg-surface-subtle px-5 py-4 sm:px-6 dark:bg-slate-900/70">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">
                            第 {String(item.order).padStart(2, '0')} 题
                          </div>
                          <Badge
                          className={cn(
                            'rounded-full px-3 py-1 text-xs font-black',
                            item.isCorrect
                              ? 'border-emerald-400/20 bg-emerald-400/12 text-emerald-300'
                              : 'border-rose-400/20 bg-rose-400/12 text-rose-300',
                          )}
                          variant="outline"
                        >
                          {item.isCorrect ? (
                            <span className="inline-flex items-center gap-1">
                              <CircleCheck className="h-3.5 w-3.5" />
                              正确
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1">
                              <CircleX className="h-3.5 w-3.5" />
                              错误
                            </span>
                          )}
                        </Badge>
                      </div>
                      {item.emphasisNote ? (
                        <div className="text-sm text-text-secondary dark:text-slate-300">{item.emphasisNote}</div>
                      ) : null}
                    </div>
                  </CardHeader>

                  <CardContent className="px-5 py-5 sm:px-6">
                    <QuestionCard
                      question={item.question}
                      userAnswer={item.userAnswer}
                      showResult
                      readOnly
                      showExplanation={reviewExperience.canViewExplanation}
                      className="border-none bg-transparent shadow-none"
                    />

                    {reviewExperience.canViewSupplementaryNotes && item.emphasisNote ? (
                      <div className="mt-4 rounded-2xl border border-cyan-500/15 bg-cyan-500/5 p-4">
                        <div className="text-xs font-black uppercase tracking-[0.18em] text-cyan-600 dark:text-cyan-300">
                          补充说明
                        </div>
                        <p className="mt-2 text-sm leading-6 text-text-secondary dark:text-slate-300">
                          {item.emphasisNote}
                        </p>
                      </div>
                    ) : null}

                    {reviewExperience.canViewFollowUpAdvice ? (
                      <div className="mt-4 rounded-2xl border border-violet-500/15 bg-violet-500/5 p-4">
                        <div className="text-xs font-black uppercase tracking-[0.18em] text-violet-600 dark:text-violet-300">
                          后续提分建议
                        </div>
                        <p className="mt-2 text-sm leading-6 text-text-secondary dark:text-slate-300">
                          {buildFollowUpAdvice(item)}
                        </p>
                      </div>
                    ) : null}

                  </CardContent>
                  </Card>
                </section>
              </div>
            ))}
          </div>
        </main>

        <aside className="space-y-4 desktop:sticky desktop:top-3 desktop:self-start">
          <Card className={cn('rounded-[28px] border-white/10 shadow-[0_18px_48px_rgba(15,23,42,0.12)]', themeStyle.shell)}>
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-black text-white">题号导航</CardTitle>
              <p className="text-sm leading-6 text-slate-300">点击题号可直接跳到对应题目。绿色为正确，红色为错误。</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                  当前复盘权限
                </div>
                <div className="mt-2 text-sm font-semibold text-white">{reviewExperience.label}</div>
                <p className="mt-2 text-sm leading-6 text-slate-300">{reviewExperience.summary}</p>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => jumpToQuestion(item.id)}
                    className={cn(
                      'flex aspect-square items-center justify-center rounded-xl border text-sm font-black transition-all',
                      item.isCorrect
                        ? 'border-emerald-400/20 bg-emerald-400/12 text-emerald-200 hover:bg-emerald-400/20'
                        : 'border-rose-400/20 bg-rose-400/12 text-rose-200 hover:bg-rose-400/20',
                    )}
                  >
                    {item.order}
                  </button>
                ))}
              </div>

              {reviewExperience.canViewFollowUpAdvice ? (
                <div className="rounded-2xl border border-violet-400/15 bg-violet-400/10 p-4">
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-violet-200">
                    本轮提分建议
                  </div>
                  <div className="mt-2 text-sm font-semibold text-white">
                    当前共 {items.length} 题，错题 {totalWrong} 题
                  </div>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-200">
                    {overallAdvice.map((advice) => (
                      <li key={advice}>{advice}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {!reviewExperience.canViewExplanation ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-white/5">
                      <Lock className="h-4 w-4 text-slate-200" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-sm font-semibold text-white">
                        <Sparkles className="h-4 w-4 text-cyan-300" />
                        当前套餐未解锁逐题解析
                      </div>
                      <p className="mt-1 text-sm leading-6 text-slate-300">
                        你现在可以查看每题对错和标准答案。升级到自学版（Standard）及以上后，可查看逐题解析、补充说明和后续提分建议。
                      </p>
                      <Button
                        variant="outline"
                        className="mt-3 rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                        onClick={() => router.push('/pricing')}
                      >
                        查看套餐
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : null}

              {reviewExperience.canViewExplanation &&
              !reviewExperience.canViewFollowUpAdvice ? (
                <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/10 p-4">
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-emerald-200">
                    已解锁能力
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-200">
                    当前套餐已解锁逐题解析与补充说明。若要查看更完整的提分建议，可升级到 Smart Plus 或 Premier。
                  </p>
                </div>
              ) : null}

              <div className="grid gap-3">
                {secondaryActionLabel && secondaryAction ? (
                  <Button
                    variant="outline"
                    className="rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                    onClick={secondaryAction}
                  >
                    {secondaryActionLabel}
                  </Button>
                ) : null}
                <Button className={cn('rounded-2xl', themeStyle.primaryButton)} onClick={primaryAction}>
                  {primaryActionLabel}
                </Button>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
