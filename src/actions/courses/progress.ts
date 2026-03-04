'use server';

import { createClient } from '@/lib/supabase/server'; // Import createClient
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { checkAndRefreshStreak } from '@/actions/gamification/streak';
import { trackDailyProgress } from '@/actions/gamification/daily-tasks';
import { incrementTotalStudyTime } from '@/actions/user/study-metrics';
import { DailyTaskType } from '@prisma/client';

export async function updateUserLessonProgress(lessonId: string, progressInSeconds: number) {
  const supabase = await createClient(); // Create Supabase client
  const { data: { user }, error: authError } = await supabase.auth.getUser(); // Get user session

  if (authError || !user) {
    return { success: false, error: authError?.message || 'Unauthorized' };
  }

  const userId = user.id;

  // Fetch lesson duration to calculate percentage progress
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { duration: true },
  });

  if (!lesson || lesson.duration === null) {
    return { success: false, error: 'Lesson not found or duration not set' };
  }

  const progressPercentage = (progressInSeconds / lesson.duration) * 100;
  const clampedProgressPercentage = Math.min(Math.max(progressPercentage, 0), 100);
  const normalizedProgressInSeconds = Math.max(0, Math.round(progressInSeconds));
  const boundedProgressInSeconds = Math.min(normalizedProgressInSeconds, lesson.duration);

  try {
    const existingProgress = await prisma.userProgress.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      select: { isCompleted: true },
    });

    const isCompleted = clampedProgressPercentage >= 90;
    const wasCompleted = existingProgress?.isCompleted ?? false;
    
    if (isCompleted) {
       await checkAndRefreshStreak(userId);
       await trackDailyProgress(userId, DailyTaskType.COMPLETE_LESSON);
    }

    const userProgress = await prisma.userProgress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      update: {
        progress: clampedProgressPercentage, // Store percentage
        lastPosition: normalizedProgressInSeconds, // Store last played position
        updatedAt: new Date(),
        // Mark as completed if progress is >= 90%
        isCompleted: isCompleted,
      },
      create: {
        userId,
        lessonId,
        progress: clampedProgressPercentage,
        lastPosition: normalizedProgressInSeconds,
        isCompleted: isCompleted,
      },
      select: {
        progress: true,
        isCompleted: true,
      },
    });

    if (isCompleted && !wasCompleted) {
      await incrementTotalStudyTime(userId, boundedProgressInSeconds);
    }

    // Revalidate course入口页，确保进度统计与列表状态同步
    revalidatePath('/dashboard/courses');

    return { success: true, progress: userProgress.progress, isCompleted: userProgress.isCompleted };
  } catch (error) {
    console.error('Failed to update user lesson progress:', error);
    return { success: false, error: 'Failed to update progress' };
  }
}
