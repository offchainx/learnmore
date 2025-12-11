
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getErrorBookQuestions, removeErrorBookEntry } from '../error-book';

const mockErrorBookEntry = {
  id: 'eb1',
  userId: 'user-1',
  questionId: 'q1',
  masteryLevel: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  question: {
    id: 'q1',
    type: 'SINGLE_CHOICE',
    content: 'Test Question',
    options: { A: 'A' },
    answer: 'A',
    chapter: {
      id: 'c1',
      title: 'Chapter 1',
      subject: { id: 's1', name: 'Math' },
    },
  },
};

const { mockPrisma } = vi.hoisted(() => {
  const mp = {
    errorBook: {
      findMany: vi.fn(),
      delete: vi.fn(),
    },
  };
  return { mockPrisma: mp };
});

vi.mock('@/lib/prisma', () => ({
  default: mockPrisma,
}));

vi.mock('../auth', () => ({
  getCurrentUser: vi.fn(),
}));

import { getCurrentUser } from '../auth';

const mockGetCurrentUser = getCurrentUser as unknown as ReturnType<typeof vi.fn>;

describe('Error Book Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getErrorBookQuestions', () => {
    it('should reject unauthorized users', async () => {
      mockGetCurrentUser.mockResolvedValue(null);
      const result = await getErrorBookQuestions();
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    it('should fetch error book questions for the current user', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
      mockPrisma.errorBook.findMany.mockResolvedValue([mockErrorBookEntry]);

      const result = await getErrorBookQuestions();

      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockErrorBookEntry]);
      expect(mockPrisma.errorBook.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1', masteryLevel: { gt: 0 } },
        })
      );
    });

    it('should filter questions by subjectId', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
      mockPrisma.errorBook.findMany.mockResolvedValue([mockErrorBookEntry]);

      const result = await getErrorBookQuestions('s1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockErrorBookEntry]);
      expect(mockPrisma.errorBook.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId: 'user-1',
            masteryLevel: { gt: 0 },
            question: {
              chapter: {
                subjectId: 's1',
              },
            },
          },
        })
      );
    });
  });

  describe('removeErrorBookEntry', () => {
    it('should reject unauthorized users', async () => {
      mockGetCurrentUser.mockResolvedValue(null);
      const result = await removeErrorBookEntry('eb1');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    it('should remove an error book entry', async () => {
      mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
      mockPrisma.errorBook.delete.mockResolvedValue(mockErrorBookEntry);

      const result = await removeErrorBookEntry('eb1');

      expect(result.success).toBe(true);
      expect(mockPrisma.errorBook.delete).toHaveBeenCalledWith({
        where: { id: 'eb1', userId: 'user-1' },
      });
    });
  });
});
