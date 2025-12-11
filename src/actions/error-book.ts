'use server';

import prisma from '@/lib/prisma';
import { getCurrentUser } from './auth';
import { Prisma } from '@prisma/client';

export async function getErrorBookQuestions(subjectId?: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const whereClause: Prisma.ErrorBookWhereInput = { userId: user.id, masteryLevel: { gt: 0 } };

    if (subjectId) {
        whereClause.question = {
            chapter: {
                subjectId: subjectId
            }
        };
    }

    const errorBookEntries = await prisma.errorBook.findMany({
      where: whereClause,
      include: {
        question: {
          include: {
            chapter: {
              include: { subject: true },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Filter out entries where question might be null if a question was deleted but errorBook entry remained
    const questionsWithErrors = errorBookEntries.filter(entry => entry.question);

    return { success: true, data: questionsWithErrors };
  } catch (error) {
    console.error('Error fetching error book questions:', error);
    return { success: false, error: 'Failed to fetch error book questions' };
  }
}

export async function removeErrorBookEntry(errorBookEntryId: string) {
    try {
        const user = await getCurrentUser();
        if (!user) {
          return { success: false, error: 'Unauthorized' };
        }

        await prisma.errorBook.delete({
            where: {
                id: errorBookEntryId,
                userId: user.id // Ensure only owner can delete
            }
        });

        return { success: true };

    } catch (error) {
        console.error('Error removing error book entry:', error);
        return { success: false, error: 'Failed to remove error book entry' };
    }
}
