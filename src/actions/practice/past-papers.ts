'use server';

import { ContentStatus } from '@prisma/client';
import prisma from '@/lib/prisma';

export interface PastPaperItem {
  id: string;
  title: string;
  sourcePaper: string | null;
  sourceYear: number | null;
  questionCount: number;
  status: ContentStatus;
  updatedAt: string;
}

export async function getPastPapersBySubject(
  subjectId: string,
  limit: number = 12
): Promise<{ success: boolean; data?: PastPaperItem[]; error?: string }> {
  try {
    if (!subjectId) {
      return { success: false, error: 'Subject ID is required' };
    }

    const groups = await prisma.questionGroup.findMany({
      where: {
        subjectId,
        status: {
          not: ContentStatus.ARCHIVED,
        },
      },
      include: {
        _count: {
          select: {
            questions: true,
          },
        },
      },
      orderBy: [
        { sourceYear: 'desc' },
        { updatedAt: 'desc' },
      ],
      take: Math.max(1, limit),
    });

    const data = groups
      .filter(group => group._count.questions > 0)
      .map(group => ({
        id: group.id,
        title: group.sourcePaper || group.source || group.content.slice(0, 80),
        sourcePaper: group.sourcePaper,
        sourceYear: group.sourceYear,
        questionCount: group._count.questions,
        status: group.status,
        updatedAt: group.updatedAt.toISOString(),
      }));

    return { success: true, data };
  } catch (error) {
    console.error('Failed to fetch past papers:', error);
    return { success: false, error: 'Failed to fetch past papers' };
  }
}
