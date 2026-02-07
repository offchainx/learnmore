'use server';

import prisma from '@/lib/prisma';
import { getCurrentUser } from '../user/auth';
import { Prisma, DailyTaskType } from '@prisma/client';
import { checkAndRefreshStreak } from '@/actions/gamification/streak';
import { trackDailyProgress } from '@/actions/gamification/daily-tasks';
import { getEffectiveTier } from '@/lib/permissions/engine';
import { getRetentionDate } from '@/lib/permissions/prisma-scope';

// --- Legacy Functions (Ported) ---

export async function getErrorBookQuestions(subjectId?: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // C3: Get Retention Policy cutoff
    const tier = getEffectiveTier(user);
    const minDate = getRetentionDate(tier);

    const whereClause: Prisma.ErrorBookWhereInput = { 
      userId: user.id, 
      masteryLevel: { gt: 0 },
      updatedAt: { gte: minDate } // C3: Retention Filter
    };

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

    // Filter out entries where question might be null
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
                userId: user.id
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
        await trackDailyProgress(user.id, DailyTaskType.FIX_ERROR);
        await checkAndRefreshStreak(user.id);

        const newLevel = entry.masteryLevel + 1;
        
        if (newLevel >= 3) {
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

// --- New Functions for Error Wiper Mode ---

export async function getErrorWiperSession(subjectId?: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // C3: Get Retention Policy cutoff
    const tier = getEffectiveTier(user);
    const minDate = getRetentionDate(tier);

    // Build the where clause
    const whereClause: Prisma.ErrorBookWhereInput = {
      userId: user.id,
      masteryLevel: { lt: 3 },
      updatedAt: { gte: minDate } // C3: Retention Filter
    };

    if (subjectId) {
      whereClause.question = {
        chapter: {
          subjectId: subjectId
        }
      };
    }

    // Fetch all errors with masteryLevel < 3 (including 0)
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
    });

    const validEntries = errorBookEntries.filter(entry => entry.question);

    // Shuffle to randomize the session
    const shuffled = validEntries.sort(() => Math.random() - 0.5);

    // Limit session size to 20 to keep it manageable
    const sessionData = shuffled.slice(0, 20);

    return { success: true, data: sessionData };
  } catch (error) {
    console.error('Error fetching wiper session:', error);
    return { success: false, error: 'Failed to fetch wiper session' };
  }
}

export async function updateErrorWiperProgress(questionId: string, isCorrect: boolean) {
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
        // Gamification hooks
        await trackDailyProgress(user.id, DailyTaskType.FIX_ERROR);
        await checkAndRefreshStreak(user.id);

        const newLevel = entry.masteryLevel + 1;
        
        if (newLevel >= 3) {
             await prisma.errorBook.delete({
                 where: { id: entry.id }
             });
             return { success: true, wiped: true, level: newLevel };
        } else {
            await prisma.errorBook.update({
                where: { id: entry.id },
                data: { masteryLevel: newLevel, updatedAt: new Date() }
            });
            return { success: true, wiped: false, level: newLevel };
        }
    } else {
        // Reset to 0
        await prisma.errorBook.update({
            where: { id: entry.id },
            data: { masteryLevel: 0, updatedAt: new Date() }
        });
        return { success: true, wiped: false, level: 0 };
    }

  } catch (error) {
    console.error('Error updating wiper progress:', error);
    return { success: false, error: 'Failed to update progress' };
  }
}
