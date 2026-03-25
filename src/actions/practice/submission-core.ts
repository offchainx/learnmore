'use server'

import prisma from '@/lib/prisma'
import { Prisma, type PracticeMode } from '@prisma/client'

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
