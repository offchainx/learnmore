import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getChapterWithStats } from '../data-service'
import prisma from '@/lib/prisma'

type PrismaMock = {
  user: {
    findUnique: ReturnType<typeof vi.fn>
  }
  chapter: {
    findUnique: ReturnType<typeof vi.fn>
  }
  userAttempt: {
    count: ReturnType<typeof vi.fn>
  }
}

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
    },
    chapter: {
      findUnique: vi.fn(),
    },
    userAttempt: {
      count: vi.fn(),
    },
  },
}))

describe('data-service', () => {
  const prismaMock = prisma as unknown as PrismaMock

  beforeEach(() => {
    vi.clearAllMocks()
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      role: 'STUDENT',
      subscriptionTier: 'STANDARD',
      subscriptionEnd: null,
      permissionOverrides: [],
    })
  })

  describe('getChapterWithStats', () => {
    it('should return null if chapter not found', async () => {
      prismaMock.chapter.findUnique.mockResolvedValue(null)

      const result = await getChapterWithStats('invalid-id', 'user-1')
      expect(result).toBeNull()
    })

    it('should return chapter stats correctly', async () => {
      prismaMock.chapter.findUnique.mockResolvedValue({
        id: 'chap-1',
        title: 'Chapter 1',
        subjectId: 'sub-1',
        parentId: null,
        order: 1,
        _count: { questions: 10 },
      })

      prismaMock.userAttempt.count.mockResolvedValueOnce(5)
      prismaMock.userAttempt.count.mockResolvedValueOnce(4)

      const result = await getChapterWithStats('chap-1', 'user-1')

      expect(result).toEqual({
        id: 'chap-1',
        title: 'Chapter 1',
        subjectId: 'sub-1',
        parentId: null,
        order: 1,
        stats: {
          totalAttempts: 5,
          correctCount: 4,
          masteryLevel: 80,
          questionCount: 10,
        },
      })
    })

    it('should handle zero attempts', async () => {
      prismaMock.chapter.findUnique.mockResolvedValue({
        id: 'chap-1',
        title: 'Chapter 1',
        subjectId: 'sub-1',
        parentId: null,
        order: 1,
        _count: { questions: 10 },
      })

      prismaMock.userAttempt.count.mockResolvedValue(0)

      const result = await getChapterWithStats('chap-1', 'user-1')
      expect(result?.stats.masteryLevel).toBe(0)
    })
  })
})
