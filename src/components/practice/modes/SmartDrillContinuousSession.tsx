'use client'

import { useMemo, useState } from 'react'
import { QuestionType } from '@prisma/client'
import { submitPracticeSession } from '@/actions/practice/session'
import type { Question } from '@/components/business/question'
import UnifiedPracticeWorkspace, {
  type UnifiedPracticeQuestion,
} from '@/components/practice/session/UnifiedPracticeWorkspace'
import { PracticeReviewWorkspace } from '@/components/practice/modes/shared/PracticeReviewWorkspace'
import type { TierKey } from '@/lib/permissions/types'
import {
  type PracticeQuestionRecord,
  toQuestionMaterialGroup,
} from '@/lib/practice/question-groups'

interface SmartDrillContinuousSessionProps {
  questions: PracticeQuestionRecord[]
  userId: string
  subjectId: string
  title?: string
  persistSession?: boolean
  onExit: () => void
  onRestart?: () => void
  previewMode?: boolean
  userTier?: TierKey
}

function isCorrectAnswer(question: PracticeQuestionRecord, userAnswer: string | string[] | undefined) {
  const correctAnswer = question.answer as string | string[] | null

  if (!userAnswer || !correctAnswer) return false

  if (question.type === QuestionType.SINGLE_CHOICE || question.type === QuestionType.TRUE_FALSE) {
    return String(userAnswer).trim().toLowerCase() === String(correctAnswer).trim().toLowerCase()
  }

  if (question.type === QuestionType.MULTIPLE_CHOICE) {
    const actual = Array.isArray(userAnswer) ? userAnswer : [userAnswer]
    const expected = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer]
    if (actual.length !== expected.length) return false
    const sortedActual = [...actual].map(String).sort()
    const sortedExpected = [...expected].map(String).sort()
    return sortedActual.every((value, index) => value === sortedExpected[index])
  }

  if (question.type === QuestionType.FILL_BLANK) {
    if (Array.isArray(correctAnswer)) {
      return correctAnswer.map((item) => String(item).trim()).includes(String(userAnswer).trim())
    }
    return String(userAnswer).trim() === String(correctAnswer).trim()
  }

  return false
}

function formatQuestion(question: PracticeQuestionRecord): Question {
  return {
    id: question.id,
    type: question.type as QuestionType,
    content: question.content,
    options: question.options as Record<string, string> | null,
    answer: question.answer as string | string[] | null,
    explanation: question.explanation || null,
    group: toQuestionMaterialGroup(question.group),
  }
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
  userTier = 'STARTER',
}: SmartDrillContinuousSessionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [savedScore, setSavedScore] = useState<number | null>(null)
  const [savedCorrectCount, setSavedCorrectCount] = useState<number | null>(null)
  const [savedSession, setSavedSession] = useState(false)
  const [questionStates, setQuestionStates] = useState<boolean[]>([])
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<string, string | string[]>>({})
  const [isFinished, setIsFinished] = useState(false)
  const [clientSessionId] = useState(() => crypto.randomUUID())

  const workspaceQuestions = useMemo<UnifiedPracticeQuestion[]>(
    () =>
      questions.map((question) => ({
        id: question.id,
        question: formatQuestion(question),
        difficulty: question.difficulty,
        meta: question.chapterId ? `章节线索：${question.chapterId}` : '系统根据当前状态生成的推荐题',
      })),
    [questions],
  )

  const recommendation = useMemo(() => {
    const score = savedScore ?? 0

    if (score >= 80) {
      return '这一轮状态稳定，可以直接进入下一轮 Smart Drill，或切到 Mock Arena 做一次限时检验。'
    }
    if (score >= 60) {
      return '整体已经过线，建议继续做一轮 Smart Drill，把中段题和易错点再压实。'
    }
    return '这轮暴露出的波动还比较明显，建议先继续 Smart Drill，必要时回到 Chapter Map 补章节。'
  }, [savedScore])

  const handleSubmit = async ({
    answers,
    duration,
  }: {
    answers: Record<string, string | string[]>
    duration: number
  }) => {
    if (isSubmitting) return

    const orderedQuestionStates = questions.map((question) =>
      isCorrectAnswer(question, answers[question.id]),
    )
    const correctCount = orderedQuestionStates.filter(Boolean).length
    const score = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0

    setQuestionStates(orderedQuestionStates)
    setSubmittedAnswers(answers)

    if (!persistSession) {
      setSavedScore(score)
      setSavedCorrectCount(correctCount)
      setSavedSession(false)
      setSubmitError('当前为 Mock 预览模式，本轮结果不会写入正式训练记录。')
      setIsFinished(true)
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    const submitResult = await submitPracticeSession({
      userId,
      mode: 'SMART_DRILL',
      clientSessionId,
      subjectId,
      title,
      duration,
      answers: questions.map((question) => ({
        questionId: question.id,
        userAnswer: answers[question.id] ?? null,
      })),
    })

    if (submitResult.success) {
      setSavedScore(Math.round(submitResult.score ?? score))
      setSavedCorrectCount(submitResult.correctCount ?? correctCount)
      setSavedSession(true)
    } else {
      setSavedScore(score)
      setSavedCorrectCount(correctCount)
      setSavedSession(false)
      setSubmitError(submitResult.error || '训练结果保存失败，本轮成绩仅保留在本地。')
    }

    setIsSubmitting(false)
    setIsFinished(true)
  }

  if (isFinished) {
    const finalScore = savedScore ?? 0
    const finalCorrect = savedCorrectCount ?? 0

    return (
      <PracticeReviewWorkspace
        title="Smart Drill 完成"
        subtitle={
          previewMode
            ? '当前展示的是 Mock 预览逐题复盘，用来确认 Smart Drill 最终渲染效果。'
            : '本轮智能训练已结束，下面直接进入逐题复盘。'
        }
        score={finalScore}
        theme="cyan"
        stats={[
          { label: '题目总数', value: questions.length, toneClassName: 'text-cyan-200' },
          { label: '正确', value: finalCorrect, toneClassName: 'text-emerald-300' },
          { label: '错误', value: Math.max(0, questions.length - finalCorrect), toneClassName: 'text-rose-300' },
          { label: '结果保存', value: savedSession ? '已保存' : '仅本地' },
        ]}
        recommendation={recommendation}
        note={submitError}
        items={questions.map((question, index) => ({
          id: question.id,
          order: index + 1,
          userAnswer: submittedAnswers[question.id] ?? null,
          isCorrect: questionStates[index] ?? false,
          question: formatQuestion(question),
        }))}
        primaryActionLabel="返回练习中心"
        primaryAction={onExit}
        secondaryActionLabel="再来一轮"
        secondaryAction={onRestart ?? onExit}
        userTier={userTier}
      />
    )
  }

  return (
    <UnifiedPracticeWorkspace
      title="整组连续作答"
      modeLabel={previewMode ? 'Smart Drill Mock' : 'Smart Drill'}
      subtitle="题目会完整铺开，你可以顺着往下做，最后一次性交卷。"
      questions={workspaceQuestions}
      onSubmit={handleSubmit}
      onRefresh={onRestart}
      onExit={onExit}
      submitLabel="提交 Smart Drill"
      refreshLabel="重开本轮"
      exitLabel="退出 Smart Drill"
      isSubmitting={isSubmitting}
      rightPanelNote="Smart Drill 更强调一轮内的整体表现和状态校准，建议连续做完整组题后再提交。"
    />
  )
}
