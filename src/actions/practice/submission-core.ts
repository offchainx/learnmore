'use server'

import prisma from '@/lib/prisma'
import { Prisma, type PracticeMode } from '@prisma/client'

const MIN_ATTEMPTS_FOR_DYNAMIC_DIFFICULTY = 20

function deriveDifficultyFromAccuracy(accuracy: number): number {
  if (accuracy >= 0.85) return 1
  if (accuracy >= 0.7) return 2
  if (accuracy >= 0.45) return 3
  if (accuracy >= 0.25) return 4
  return 5
}

export async function recalibrateQuestionDifficulties(
  tx: Prisma.TransactionClient,
  questionIds: string[]
): Promise<void> {
  const uniqueQuestionIds = Array.from(new Set(questionIds.filter(Boolean)))
  if (uniqueQuestionIds.length === 0) return

  const groupedAttempts = await tx.userAttempt.groupBy({
    by: ['questionId', 'isCorrect'],
    where: {
      questionId: { in: uniqueQuestionIds },
    },
    _count: {
      _all: true,
    },
  })

  const statsMap = new Map<string, { total: number; correct: number }>()
  for (const row of groupedAttempts) {
    const current = statsMap.get(row.questionId) ?? { total: 0, correct: 0 }
    current.total += row._count._all
    if (row.isCorrect) {
      current.correct += row._count._all
    }
    statsMap.set(row.questionId, current)
  }

  for (const questionId of uniqueQuestionIds) {
    const stats = statsMap.get(questionId)
    if (!stats || stats.total < MIN_ATTEMPTS_FOR_DYNAMIC_DIFFICULTY) continue

    const accuracy = stats.correct / stats.total
    const nextDifficulty = deriveDifficultyFromAccuracy(accuracy)

    await tx.question.updateMany({
      where: {
        id: questionId,
        difficulty: { not: nextDifficulty },
      },
      data: {
        difficulty: nextDifficulty,
      },
    })
  }
}

export interface PersistedAttemptInput {
  questionId: string
  userAnswer: Prisma.InputJsonValue
  isCorrect: boolean
  duration?: number | null
}

export interface PersistPracticeSessionInput {
  userId: string
  mode: PracticeMode
  clientSessionId?: string | null
  chapterId?: string | null
  subjectId?: string | null
  title?: string | null
  duration?: number | null
  attempts: PersistedAttemptInput[]
}

export interface PersistPracticeSessionResult {
  created: boolean
  examRecordId: string
  score: number
  totalQuestions: number
  correctCount: number
  results: Record<string, boolean>
}

function toSessionResult(
  examRecord: {
    id: string
    score: number
    totalQuestions: number
    correctCount: number
    attempts: Array<{ questionId: string; isCorrect: boolean }>
  }
): PersistPracticeSessionResult {
  return {
    created: false,
    examRecordId: examRecord.id,
    score: examRecord.score,
    totalQuestions: examRecord.totalQuestions,
    correctCount: examRecord.correctCount,
    results: Object.fromEntries(examRecord.attempts.map((attempt) => [attempt.questionId, attempt.isCorrect])),
  }
}

async function findExistingSession(
  userId: string,
  clientSessionId?: string | null
): Promise<PersistPracticeSessionResult | null> {
  if (!clientSessionId) return null

  const existing = await prisma.examRecord.findFirst({
    where: {
      userId,
      clientSessionId,
    },
    include: {
      attempts: {
        select: {
          questionId: true,
          isCorrect: true,
        },
      },
    },
  })

  return existing ? toSessionResult(existing) : null
}

export async function persistPracticeSession(
  input: PersistPracticeSessionInput
): Promise<PersistPracticeSessionResult> {
  const existing = await findExistingSession(input.userId, input.clientSessionId)
  if (existing) return existing

  const totalQuestions = input.attempts.length
  const correctCount = input.attempts.filter((attempt) => attempt.isCorrect).length
  const score = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0
  const results = Object.fromEntries(input.attempts.map((attempt) => [attempt.questionId, attempt.isCorrect]))

  try {
    const created = await prisma.$transaction(async (tx) => {
      const examRecord = await tx.examRecord.create({
        data: {
          userId: input.userId,
          clientSessionId: input.clientSessionId ?? null,
          chapterId: input.chapterId ?? null,
          subjectId: input.subjectId ?? null,
          mode: input.mode,
          title: input.title ?? null,
          score,
          totalQuestions,
          correctCount,
          duration: input.duration ?? null,
        },
      })

      if (input.attempts.length > 0) {
        await tx.userAttempt.createMany({
          data: input.attempts.map((attempt) => ({
            userId: input.userId,
            questionId: attempt.questionId,
            examRecordId: examRecord.id,
            userAnswer: attempt.userAnswer,
            isCorrect: attempt.isCorrect,
            duration: attempt.duration ?? null,
          })),
        })

        await recalibrateQuestionDifficulties(
          tx,
          input.attempts.map((attempt) => attempt.questionId)
        )
      }

      return {
        created: true,
        examRecordId: examRecord.id,
        score,
        totalQuestions,
        correctCount,
        results,
      } satisfies PersistPracticeSessionResult
    })

    return created
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002' &&
      input.clientSessionId
    ) {
      const duplicate = await findExistingSession(input.userId, input.clientSessionId)
      if (duplicate) return duplicate
    }

    throw error
  }
}
