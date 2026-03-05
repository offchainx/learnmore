'use server'

import { ContentStatus } from '@prisma/client'
import prisma from '@/lib/prisma'

export interface PastPaperItem {
  id: string
  title: string
  sourcePaper: string | null
  sourceYear: number | null
  questionCount: number
  status: ContentStatus
  updatedAt: string
}

export async function getPastPapersBySubject(
  subjectId: string,
  limit: number = 12
): Promise<{ success: boolean; data?: PastPaperItem[]; error?: string }> {
  try {
    if (!subjectId) return { success: false, error: 'Subject ID is required' }

    const questions = await prisma.question.findMany({
      where: {
        subjectId,
        isPastPaper: true,
        paperId: { not: null },
        status: { in: [ContentStatus.PUBLISHED, ContentStatus.VERIFIED] },
      },
      select: {
        paperId: true,
        source: true,
        status: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 500,
    })

    const grouped = new Map<string, PastPaperItem>()
    for (const q of questions) {
      if (!q.paperId) continue
      const existing = grouped.get(q.paperId)
      if (!existing) {
        grouped.set(q.paperId, {
          id: q.paperId,
          title: q.source || `Past Paper ${q.paperId}`,
          sourcePaper: q.source,
          sourceYear: null,
          questionCount: 1,
          status: q.status,
          updatedAt: q.updatedAt.toISOString(),
        })
      } else {
        existing.questionCount += 1
        if (q.updatedAt > new Date(existing.updatedAt)) {
          existing.updatedAt = q.updatedAt.toISOString()
          existing.status = q.status
        }
      }
    }

    const data = Array.from(grouped.values())
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, Math.max(1, limit))

    return { success: true, data }
  } catch (error) {
    console.error('Failed to fetch past papers:', error)
    return { success: false, error: 'Failed to fetch past papers' }
  }
}
