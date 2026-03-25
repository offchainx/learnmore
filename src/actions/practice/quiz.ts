'use server';

import { getCurrentUser } from '../user/auth';
import { z } from 'zod';
import { submitPracticeSession } from './session';

const SubmitQuizSchema = z.object({
  chapterId: z.string().optional(),
  answers: z.array(
    z.object({
      questionId: z.string(),
      userAnswer: z.union([z.string(), z.array(z.string()), z.number()]).nullable(),
    })
  ),
  duration: z.number().optional(), // time in seconds
});

export type QuizSubmissionResult = {
  success: boolean;
  score?: number;
  totalQuestions?: number;
  correctCount?: number;
  results?: Record<string, boolean>; // questionId -> isCorrect
  error?: string;
};

export async function submitQuiz(
  data: z.infer<typeof SubmitQuizSchema>
): Promise<QuizSubmissionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { answers, chapterId, duration } = SubmitQuizSchema.parse(data);

    const submitResult = await submitPracticeSession({
      userId: user.id,
      mode: 'CHAPTER_DRILL',
      chapterId: chapterId ?? null,
      answers,
      duration,
    });

    if (!submitResult.success) {
      return { success: false, error: submitResult.error || 'Failed to submit quiz' };
    }

    const correctCount = submitResult.correctCount || 0;
    const totalQuestions = submitResult.totalQuestions || answers.length;
    const score = submitResult.score || 0;
    const results = submitResult.results || {};

    return {
      success: true,
      score,
      totalQuestions,
      correctCount,
      results,
    };
  } catch (error) {
    console.error('Submit quiz error:', error);
    return { success: false, error: 'Failed to submit quiz' };
  }
}
