'use server';

import { createClient } from '@/lib/supabase/server'; // Import createClient
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

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

  try {
    const userProgress = await prisma.userProgress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      update: {
        progress: clampedProgressPercentage, // Store percentage
        lastPosition: progressInSeconds, // Store last played position
        updatedAt: new Date(),
        // Mark as completed if progress is >= 90%
        isCompleted: clampedProgressPercentage >= 90,
      },
      create: {
        userId,
        lessonId,
        progress: clampedProgressPercentage,
        lastPosition: progressInSeconds,
        isCompleted: clampedProgressPercentage >= 90,
      },
      select: {
        progress: true,
        isCompleted: true,
      },
    });

    // Revalidate the path to reflect changes in UI (e.g., course tree completion status)
    revalidatePath(`/course/${lessonId}`); // Adjust path as needed, consider more specific revalidation

    return { success: true, progress: userProgress.progress, isCompleted: userProgress.isCompleted };
  } catch (error) {
    console.error('Failed to update user lesson progress:', error);
    return { success: false, error: 'Failed to update progress' };
  }
}
