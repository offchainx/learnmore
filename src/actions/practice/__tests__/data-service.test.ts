import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getChapterWithStats } from '../data-service';
import prisma from '@/lib/prisma';

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  default: {
    chapter: {
      findUnique: vi.fn(),
    },
    userAttempt: {
      count: vi.fn(),
    },
  },
}));

describe('data-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getChapterWithStats', () => {
    it('should return null if chapter not found', async () => {
      (prisma.chapter.findUnique as any).mockResolvedValue(null);

      const result = await getChapterWithStats('invalid-id', 'user-1');
      expect(result).toBeNull();
    });

    it('should return chapter stats correctly', async () => {
      // Mock chapter data
      (prisma.chapter.findUnique as any).mockResolvedValue({
        id: 'chap-1',
        title: 'Chapter 1',
        subjectId: 'sub-1',
        parentId: null,
        order: 1,
        _count: { questions: 10 },
      });

      // Mock attempts count (total)
      (prisma.userAttempt.count as any).mockResolvedValueOnce(5);
      // Mock attempts count (correct)
      (prisma.userAttempt.count as any).mockResolvedValueOnce(4);

      const result = await getChapterWithStats('chap-1', 'user-1');

      expect(result).toEqual({
        id: 'chap-1',
        title: 'Chapter 1',
        subjectId: 'sub-1',
        parentId: null,
        order: 1,
        stats: {
          totalAttempts: 5,
          correctCount: 4,
          masteryLevel: 80, // 4/5 * 100
          questionCount: 10,
        },
      });
    });

    it('should handle zero attempts', async () => {
      (prisma.chapter.findUnique as any).mockResolvedValue({
        id: 'chap-1',
        title: 'Chapter 1',
        subjectId: 'sub-1',
        parentId: null,
        order: 1,
        _count: { questions: 10 },
      });

      (prisma.userAttempt.count as any).mockResolvedValue(0);

      const result = await getChapterWithStats('chap-1', 'user-1');

      expect(result?.stats.masteryLevel).toBe(0);
    });
  });
});
