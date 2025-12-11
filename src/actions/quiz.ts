'use server';

import prisma from '@/lib/prisma';
import { getCurrentUser } from './auth';
import { z } from 'zod';
import { QuestionType, Prisma } from '@prisma/client';

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

    // 1. Fetch all questions to check answers
    const questionIds = answers.map((a) => a.questionId);
    const questions = await prisma.question.findMany({
      where: {
        id: { in: questionIds },
      },
    });

    const questionMap = new Map<string, typeof questions[0]>(questions.map((q) => [q.id, q]));
    const results: Record<string, boolean> = {};
    let correctCount = 0;

    // 2. Grading Logic
    const attemptsData = answers.map((submission) => {
      const question = questionMap.get(submission.questionId);
      if (!question) {
        throw new Error(`Question not found: ${submission.questionId}`);
      }

      let isCorrect = false;
      const ua = submission.userAnswer;
      const ca = question.answer;

      if (ua === null || ua === undefined) {
        isCorrect = false;
      } else if (question.type === QuestionType.SINGLE_CHOICE) {
        isCorrect = String(ua) === String(ca);
      } else if (question.type === QuestionType.MULTIPLE_CHOICE) {
        // Assume ca is string[] or Json array
        const correctArr = Array.isArray(ca) ? (ca as string[]) : [String(ca)];
        const userArr = Array.isArray(ua) ? (ua as string[]) : [String(ua)];

        if (correctArr.length === userArr.length) {
          const sortedCa = [...correctArr].sort();
          const sortedUa = [...userArr].sort();
          isCorrect = sortedCa.every((val, idx) => val === sortedUa[idx]);
        }
      } else if (question.type === QuestionType.FILL_BLANK) {
        const val = String(ua).trim();
        if (Array.isArray(ca)) {
          isCorrect = (ca as string[]).includes(val);
        } else {
          isCorrect = String(ca).trim() === val;
        }
      } else if (question.type === QuestionType.ESSAY) {
        // Essay grading not supported yet
        isCorrect = false; 
      }

      if (isCorrect) correctCount++;
      results[question.id] = isCorrect;

      return {
        userId: user.id,
        questionId: question.id,
        userAnswer: ua ?? JSON.stringify(null), // Ensure Json compatibility
        isCorrect,
      };
    });

    const totalQuestions = questions.length;
    // Calculate score (simple percentage for now)
    const score = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

    // 3. Database Transaction
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const examRecord = await tx.examRecord.create({
        data: {
          userId: user.id,
          chapterId: chapterId,
          score: score,
          totalQuestions: totalQuestions,
          correctCount: correctCount,
          duration: duration,
        },
      });

      // Create attempts linked to examRecord
      if (attemptsData.length > 0) {
        await tx.userAttempt.createMany({
          data: attemptsData.map((attempt) => ({
            ...attempt,
            examRecordId: examRecord.id,
          })),
        });
      }
    });

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
