import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockPrisma } = vi.hoisted(() => {
  const mp = {
    question: { findMany: vi.fn() },
    examRecord: { create: vi.fn() },
    userAttempt: { createMany: vi.fn() },
    errorBook: { upsert: vi.fn() },
    $transaction: vi.fn(),
  };
  mp.$transaction = vi.fn((cb: (tx: typeof mp) => Promise<unknown>) => cb(mp));
  return { mockPrisma: mp };
});

vi.mock('@/lib/prisma', () => ({
  default: mockPrisma,
  prisma: mockPrisma,
}));

vi.mock('../auth', () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock('../leaderboard', () => ({
  updateLeaderboardScore: vi.fn().mockResolvedValue({ success: true }),
}));

import { submitQuiz } from '../quiz';
import { QuestionType } from '@prisma/client';
import { getCurrentUser } from '../auth';

// Define a type for the mocked user function
const mockGetCurrentUser = getCurrentUser as unknown as ReturnType<typeof vi.fn>;

describe('submitQuiz Server Action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reject unauthorized users', async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    const result = await submitQuiz({ answers: [] });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Unauthorized');
  });

  it('should correctly grade a perfect submission', async () => {
    mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });

    const questions = [
      { id: 'q1', type: QuestionType.SINGLE_CHOICE, answer: 'A' },
      { id: 'q2', type: QuestionType.MULTIPLE_CHOICE, answer: ['B', 'C'] },
    ];

    mockPrisma.question.findMany.mockResolvedValue(questions);
    mockPrisma.examRecord.create.mockResolvedValue({ id: 'exam-1' });

    const result = await submitQuiz({
      answers: [
        { questionId: 'q1', userAnswer: 'A' },
        { questionId: 'q2', userAnswer: ['B', 'C'] },
      ],
    });

    expect(result.success).toBe(true);
    expect(result.score).toBe(100);
    expect(result.correctCount).toBe(2);
    expect(mockPrisma.examRecord.create).toHaveBeenCalled();
    expect(mockPrisma.userAttempt.createMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({ isCorrect: true, questionId: 'q1' }),
        expect.objectContaining({ isCorrect: true, questionId: 'q2' }),
      ]),
    });
  });

  it('should correctly grade mixed results', async () => {
    mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });

    const questions = [
      { id: 'q1', type: QuestionType.SINGLE_CHOICE, answer: 'A' },
      { id: 'q2', type: QuestionType.FILL_BLANK, answer: 'Paris' },
    ];

    mockPrisma.question.findMany.mockResolvedValue(questions);
    mockPrisma.examRecord.create.mockResolvedValue({ id: 'exam-1' });

    const result = await submitQuiz({
      answers: [
        { questionId: 'q1', userAnswer: 'B' }, // Wrong
        { questionId: 'q2', userAnswer: 'Paris' }, // Correct
      ],
    });

    expect(result.success).toBe(true);
    expect(result.score).toBe(50);
    expect(result.correctCount).toBe(1);
    expect(result.results?.['q1']).toBe(false);
    expect(result.results?.['q2']).toBe(true);
  });
});