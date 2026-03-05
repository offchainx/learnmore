'use server'

import prisma from '@/lib/prisma'
import { Prisma, PracticeMode, QuestionType } from '@prisma/client'

export interface SessionAnswerInput {
  questionId: string
  userAnswer: string | string[] | number | null
}

export interface SubmitPracticeSessionInput {
  userId: string
  mode: PracticeMode
  answers: SessionAnswerInput[]
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
  if (userAnswer === null || userAnswer === undefined) return false

  if (questionType === 'SINGLE_CHOICE' || questionType === 'TRUE_FALSE') {
    return String(userAnswer).trim().toLowerCase() === String(correctAnswer).trim().toLowerCase()
  }

  if (questionType === 'MULTIPLE_CHOICE') {
    const u = Array.isArray(userAnswer) ? userAnswer.map(String) : [String(userAnswer)]
    const c = Array.isArray(correctAnswer) ? correctAnswer.map(String) : [String(correctAnswer)]
    if (u.length !== c.length) return false
    const su = [...u].sort()
    const sc = [...c].sort()
    return su.every((v, i) => v === sc[i])
  }

  if (questionType === 'FILL_BLANK') {
    const val = String(userAnswer).trim()
    if (Array.isArray(correctAnswer)) return correctAnswer.map(String).includes(val)
    return String(correctAnswer).trim() === val
  }

  return false
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

    const attemptsData: Prisma.UserAttemptCreateManyInput[] = []
    for (const submission of input.answers) {
      const question = questionMap.get(submission.questionId)
      if (!question) continue
      const isCorrect = gradeAnswer(question.type, submission.userAnswer, question.answer as Prisma.JsonValue)
      results[question.id] = isCorrect
      if (isCorrect) correctCount += 1

      attemptsData.push({
        userId: input.userId,
        questionId: question.id,
        userAnswer: (submission.userAnswer ?? null) as Prisma.InputJsonValue,
        isCorrect,
        duration: input.duration ? Math.max(1, Math.round(input.duration / input.answers.length)) : null,
      })
    }

    const totalQuestions = attemptsData.length
    const score = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0
    const resolvedSubjectId =
      input.subjectId ?? questions.find((q) => q.subjectId)?.subjectId ?? null

    const examRecord = await prisma.examRecord.create({
      data: {
        userId: input.userId,
        chapterId: input.chapterId ?? null,
        subjectId: resolvedSubjectId,
        mode: input.mode,
        title: input.title ?? null,
        score,
        totalQuestions,
        correctCount,
        duration: input.duration ?? null,
      },
    })

    if (attemptsData.length > 0) {
      await prisma.userAttempt.createMany({
        data: attemptsData.map((a) => ({ ...a, examRecordId: examRecord.id })),
      })
    }

    return {
      success: true,
      examRecordId: examRecord.id,
      score,
      totalQuestions,
      correctCount,
      results,
    }
  } catch (error) {
    console.error('submitPracticeSession error:', error)
    return { success: false, error: 'Failed to submit session' }
  }
}
