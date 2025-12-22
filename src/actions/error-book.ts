'use server';

import prisma from '@/lib/prisma';
import { getCurrentUser } from './auth';
import { Prisma, DailyTaskType } from '@prisma/client';
import { checkAndRefreshStreak, trackDailyProgress } from '@/lib/gamification-utils';

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

export async function updateErrorBookMastery(questionId: string, isCorrect: boolean) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const entry = await prisma.errorBook.findUnique({
      where: { userId_questionId: { userId: user.id, questionId } },
    });

    if (!entry) {
        return { success: false, error: 'Entry not found' };
    }

    if (isCorrect) {
        // Gamification: Track fix error task & streak
        await trackDailyProgress(user.id, DailyTaskType.FIX_ERROR);
        await checkAndRefreshStreak(user.id);

        // Increment mastery level
        const newLevel = entry.masteryLevel + 1;
        
        if (newLevel >= 3) {
            // Mastered! Remove from error book (or logically delete)
            await prisma.errorBook.delete({
                where: { id: entry.id }
            });
            return { success: true, mastered: true, message: 'Problem Mastered!' };
        } else {
            await prisma.errorBook.update({
                where: { id: entry.id },
                data: { masteryLevel: newLevel, updatedAt: new Date() }
            });
            return { success: true, mastered: false, level: newLevel };
        }
    } else {
        // Answered wrong again, reset mastery or decrement
        // For strict mode, reset to 0. For encouraging, maybe decrement 1.
        // Let's reset to 0 to ensure mastery.
        await prisma.errorBook.update({
            where: { id: entry.id },
            data: { masteryLevel: 0, updatedAt: new Date() }
        });
        return { success: true, mastered: false, level: 0 };
    }

  } catch (error) {
    console.error('Error updating error book mastery:', error);
    return { success: false, error: 'Failed to update mastery' };
  }
}
