import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockPrisma } = vi.hoisted(() => {
  const prisma = {
    user: {
      findUnique: vi.fn(),
    },
    userAttempt: {
      findMany: vi.fn(),
    },
    question: {
      findMany: vi.fn(),
    },
  }

  return { mockPrisma: prisma }
})

vi.mock('@/lib/prisma', () => ({
  default: mockPrisma,
}))

vi.mock('../../user/auth', () => ({
  getCurrentUser: vi.fn(),
}))

vi.mock('@/lib/permissions/engine', () => ({
  getEffectiveTier: vi.fn().mockReturnValue('FREE'),
}))

vi.mock('@/lib/permissions/prisma-scope', () => ({
  getRetentionDate: vi.fn().mockReturnValue(new Date(0)),
}))

vi.mock('../submission-core', () => ({
  persistPracticeSession: vi.fn(),
}))

vi.mock('../submission-effects', () => ({
  applyPracticeSubmissionEffects: vi.fn().mockResolvedValue(undefined),
}))

import { getCurrentUser } from '../../user/auth'
import { getErrorWiperSession, submitErrorWiperSession } from '../error-book'
import { persistPracticeSession } from '../submission-core'
import { applyPracticeSubmissionEffects } from '../submission-effects'

const mockGetCurrentUser = vi.mocked(getCurrentUser)
const mockPersistPracticeSession = vi.mocked(persistPracticeSession)
const mockApplyPracticeSubmissionEffects = vi.mocked(applyPracticeSubmissionEffects)

describe('error-book', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      permissionOverrides: [],
    })
  })

  it('拒绝未登录用户获取 Error Wiper 会话', async () => {
    mockGetCurrentUser.mockResolvedValue(null)

    const result = await getErrorWiperSession()

    expect(result.success).toBe(false)
    expect(result.error).toBe('Unauthorized')
  })

  it('按错题历史聚合 Error Wiper 会话', async () => {
    mockGetCurrentUser.mockResolvedValue({ id: 'user-1' } as any)
    mockPrisma.userAttempt.findMany.mockResolvedValue([
      {
        userId: 'user-1',
        questionId: 'q1',
        isCorrect: false,
        createdAt: new Date('2026-03-20T10:00:00Z'),
        question: {
          id: 'q1',
          type: 'SINGLE_CHOICE',
          content: '题目1',
          options: { A: 'A' },
          answer: 'A',
          explanation: '解析1',
          chapter: {
            id: 'c1',
            title: '章节1',
            subject: { id: 's1', name: 'Math' },
          },
        },
      },
      {
        userId: 'user-1',
        questionId: 'q1',
        isCorrect: true,
        createdAt: new Date('2026-03-19T10:00:00Z'),
        question: {
          id: 'q1',
          type: 'SINGLE_CHOICE',
          content: '题目1',
          options: { A: 'A' },
          answer: 'A',
          explanation: '解析1',
          chapter: {
            id: 'c1',
            title: '章节1',
            subject: { id: 's1', name: 'Math' },
          },
        },
      },
    ])

    const result = await getErrorWiperSession()

    expect(result.success).toBe(true)
    expect(result.data).toHaveLength(1)
    expect(result.data?.[0]?.questionId).toBe('q1')
  })

  it('按批次提交 Error Wiper 会话，并只触发一次副作用', async () => {
    mockGetCurrentUser.mockResolvedValue({ id: 'user-1' } as any)
    mockPrisma.question.findMany.mockResolvedValue([
      { id: 'q1', subjectId: 'subject-1' },
      { id: 'q2', subjectId: 'subject-1' },
    ])
    mockPersistPracticeSession.mockResolvedValue({
      created: true,
      examRecordId: 'exam-wiper-1',
      score: 50,
      totalQuestions: 2,
      correctCount: 1,
      results: { q1: true, q2: false },
    })
    mockPrisma.userAttempt.findMany.mockResolvedValue([
      {
        questionId: 'q1',
        isCorrect: true,
        createdAt: new Date('2026-03-20T10:00:00Z'),
      },
      {
        questionId: 'q2',
        isCorrect: false,
        createdAt: new Date('2026-03-20T10:00:00Z'),
      },
    ])

    const result = await submitErrorWiperSession({
      attempts: [
        { questionId: 'q1', isCorrect: true },
        { questionId: 'q2', isCorrect: false },
      ],
      duration: 60,
      clientSessionId: 'wiper-session-1',
    })

    expect(result.success).toBe(true)
    expect(result.examRecordId).toBe('exam-wiper-1')
    expect(mockPersistPracticeSession).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        mode: 'ERROR_WIPER',
        clientSessionId: 'wiper-session-1',
      })
    )
    expect(mockApplyPracticeSubmissionEffects).toHaveBeenCalledTimes(1)
    expect(result.levels?.q1).toBeDefined()
  })
})
