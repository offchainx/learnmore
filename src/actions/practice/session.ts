'use server'

import prisma from '@/lib/prisma'
import { Prisma, PracticeMode, QuestionType } from '@prisma/client'
import { persistPracticeSession } from './submission-core'
import { applyPracticeSubmissionEffects } from './submission-effects'
import { isRelaxedPracticeAnswerCorrect } from '@/lib/practice/answer-evaluation'

export interface SessionAnswerInput {
  questionId: string
  userAnswer: string | string[] | number | null
}

export interface SubmitPracticeSessionInput {
  userId: string
  mode: PracticeMode
  answers: SessionAnswerInput[]
  clientSessionId?: string | null
  duration?: number
  chapterId?: string | null
  subjectId?: string | null
  title?: string | null
}

export interface SubmitPracticeSessionResult {
  success: boolean
  examRecordId?: string
  score?: number
  totalQuestions?: number
  correctCount?: number
  results?: Record<string, boolean>
  error?: string
}

function gradeAnswer(
  questionType: QuestionType,
  userAnswer: string | string[] | number | null,
  correctAnswer: Prisma.JsonValue
): boolean {
  return isRelaxedPracticeAnswerCorrect(
    questionType,
    userAnswer,
    correctAnswer as string | string[] | null
  )
}

export async function submitPracticeSession(
  input: SubmitPracticeSessionInput
): Promise<SubmitPracticeSessionResult> {
  try {
    if (!input.userId) return { success: false, error: 'Missing userId' }
    if (!input.answers || input.answers.length === 0) return { success: false, error: 'No answers submitted' }

    const questionIds = input.answers.map((a) => a.questionId)
    const questions = await prisma.question.findMany({
      where: {
        id: { in: questionIds },
        status: { in: ['PUBLISHED', 'VERIFIED'] },
      },
      select: {
        id: true,
        type: true,
        answer: true,
        subjectId: true,
      },
    })

    if (questions.length === 0) return { success: false, error: 'No valid questions found' }

    const questionMap = new Map(questions.map((q) => [q.id, q]))
    const results: Record<string, boolean> = {}
    let correctCount = 0

    const averageDuration =
      input.duration && input.answers.length > 0
        ? Math.max(1, Math.round(input.duration / input.answers.length))
        : null

    const attemptsData: Array<{
      questionId: string
      userAnswer: Prisma.InputJsonValue
      isCorrect: boolean
      duration: number | null
    }> = []

    for (const submission of input.answers) {
      const question = questionMap.get(submission.questionId)
      if (!question) continue
      const isCorrect = gradeAnswer(question.type, submission.userAnswer, question.answer as Prisma.JsonValue)
      results[question.id] = isCorrect
      if (isCorrect) correctCount += 1

      attemptsData.push({
        questionId: question.id,
        userAnswer: (submission.userAnswer ?? null) as Prisma.InputJsonValue,
        isCorrect,
        duration: averageDuration,
      })
    }

    const resolvedSubjectId =
      input.subjectId ?? questions.find((q) => q.subjectId)?.subjectId ?? null

    const persisted = await persistPracticeSession({
      userId: input.userId,
      mode: input.mode,
      clientSessionId: input.clientSessionId ?? null,
      chapterId: input.chapterId ?? null,
      subjectId: resolvedSubjectId,
      title: input.title ?? null,
      duration: input.duration ?? null,
      attempts: attemptsData,
    })

    if (persisted.created) {
      await applyPracticeSubmissionEffects({
        userId: input.userId,
        mode: input.mode,
        correctCount: persisted.correctCount,
        duration: input.duration ?? null,
      })
    }

    return {
      success: true,
      examRecordId: persisted.examRecordId,
      score: persisted.score,
      totalQuestions: persisted.totalQuestions,
      correctCount: persisted.correctCount,
      results: persisted.results,
    }
  } catch (error) {
    console.error('submitPracticeSession error:', error)
    return { success: false, error: 'Failed to submit session' }
  }
}
