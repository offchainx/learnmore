'use server'

import prisma from '@/lib/prisma'
import { Question, Prisma } from '@prisma/client'
import { getEffectiveTier } from '@/lib/permissions/engine'
import { getRetentionDate } from '@/lib/permissions/prisma-scope'

const SUBJECT_KEY_MAP: Record<string, string> = {
  math: 'math',
  mathematics: 'math',
  chinese: 'chinese',
  mandarin: 'chinese',
  malay: 'malay',
  english: 'english',
  science: 'science',
  history: 'history',
  geography: 'geography',
  other: 'other',
}

async function resolveSubjectId(identifier: string): Promise<string | null> {
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier)) {
    const subject = await prisma.subject.findUnique({ where: { id: identifier }, select: { id: true } })
    return subject?.id || null
  }

  const normalized = identifier.toLowerCase()
  const mappedKey = SUBJECT_KEY_MAP[normalized]
  const subject = await prisma.subject.findFirst({
    where: {
      OR: [
        { id: identifier },
        ...(mappedKey ? [{ key: mappedKey }] : []),
        { name: { contains: identifier, mode: 'insensitive' } },
      ],
    },
    select: { id: true },
  })

  return subject?.id || null
}

export async function getSmartDrillQuestions(
  userId: string,
  subjectIdentifier: string,
  limit: number = 10
): Promise<Question[]> {
  try {
    const subjectId = await resolveSubjectId(subjectIdentifier)
    if (!subjectId) return []

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        permissionOverrides: {
          where: {
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
          },
        },
      },
    })
    if (!user) return []

    const tier = getEffectiveTier(user)
    const minDate = getRetentionDate(tier)

    const difficultyFilter: Prisma.IntFilter = {}
    if (tier === 'STARTER') difficultyFilter.lte = 2
    else if (tier === 'STANDARD') difficultyFilter.lte = 4

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentAttempts = await prisma.userAttempt.findMany({
      where: {
        userId,
        createdAt: { gte: sevenDaysAgo },
        question: { subjectId },
      },
      select: { questionId: true },
      distinct: ['questionId'],
    })

    const excludeIds = new Set(recentAttempts.map((a) => a.questionId))

    // 1) 基于历史 attempts 找薄弱章节（正确率最低前3）
    const attempts = await prisma.userAttempt.findMany({
      where: {
        userId,
        createdAt: { gte: minDate },
        question: { subjectId },
      },
      select: {
        isCorrect: true,
        question: { select: { chapterId: true } },
      },
    })

    const chapterMap = new Map<string, { total: number; correct: number }>()
    for (const attempt of attempts) {
      const chapterId = attempt.question.chapterId
      if (!chapterId) continue
      const item = chapterMap.get(chapterId) || { total: 0, correct: 0 }
      item.total += 1
      if (attempt.isCorrect) item.correct += 1
      chapterMap.set(chapterId, item)
    }

    const weakChapterIds = Array.from(chapterMap.entries())
      .filter(([, stat]) => stat.total >= 3)
      .sort((a, b) => a[1].correct / a[1].total - b[1].correct / b[1].total)
      .slice(0, 3)
      .map(([chapterId]) => chapterId)

    const selected: Question[] = []

    if (weakChapterIds.length > 0) {
      const weakQuestions = await prisma.question.findMany({
        where: {
          subjectId,
          chapterId: { in: weakChapterIds },
          difficulty: difficultyFilter,
          status: { in: ['PUBLISHED', 'VERIFIED'] },
          id: { notIn: Array.from(excludeIds) },
        },
        take: Math.floor(limit * 0.6),
      })
      for (const q of weakQuestions) {
        selected.push(q)
        excludeIds.add(q.id)
      }
    }

    const remaining = Math.max(0, limit - selected.length)
    if (remaining > 0) {
      const allAttempts = await prisma.userAttempt.findMany({
        where: { userId },
        select: { questionId: true },
        distinct: ['questionId'],
      })
      const attemptedIds = new Set(allAttempts.map((a) => a.questionId))

      const newQuestions = await prisma.question.findMany({
        where: {
          subjectId,
          difficulty: difficultyFilter,
          status: { in: ['PUBLISHED', 'VERIFIED'] },
          id: { notIn: [...attemptedIds, ...Array.from(excludeIds)] },
        },
        take: remaining,
      })

      for (const q of newQuestions) {
        selected.push(q)
        excludeIds.add(q.id)
      }
    }

    if (selected.length < limit) {
      const fallback = await prisma.question.findMany({
        where: {
          subjectId,
          status: { in: ['PUBLISHED', 'VERIFIED'] },
          id: { notIn: Array.from(excludeIds) },
        },
        take: limit - selected.length,
      })
      selected.push(...fallback)
    }

    return selected.sort(() => Math.random() - 0.5)
  } catch (error) {
    console.error('[Recommendation] Error fetching smart drill questions:', error)
    return []
  }
}
