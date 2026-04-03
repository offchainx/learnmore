import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ContentStatus, QuestionType, ReviewAction, UserRole } from '@prisma/client'

const {
  mockInvalidateAdminDashboardOverview,
  mockRevalidatePath,
  mockGetCurrentUser,
  mockResolveRequestAdminIdentity,
  mockPrisma,
} = vi.hoisted(() => ({
  mockInvalidateAdminDashboardOverview: vi.fn(),
  mockRevalidatePath: vi.fn(),
  mockGetCurrentUser: vi.fn(),
  mockResolveRequestAdminIdentity: vi.fn(),
  mockPrisma: {
    user: {
      findFirst: vi.fn(),
    },
    question: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      groupBy: vi.fn(),
    },
    questionReport: {
      count: vi.fn(),
    },
    contentReviewLog: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    subject: {
      findMany: vi.fn(),
    },
    chapter: {
      findMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

vi.mock('@/lib/prisma', () => ({
  default: mockPrisma,
}))

vi.mock('next/cache', () => ({
  revalidatePath: mockRevalidatePath,
}))

vi.mock('@/actions/user/auth', () => ({
  getCurrentUser: mockGetCurrentUser,
}))

vi.mock('@/lib/auth/request-user', () => ({
  resolveRequestAdminIdentity: mockResolveRequestAdminIdentity,
}))

vi.mock('@/lib/cache/sitewide', () => ({
  invalidateAdminDashboardOverview: mockInvalidateAdminDashboardOverview,
}))

import {
  approveQuestion,
  getQuestionForReview,
} from '@/actions/content-pipeline/review-service'
import {
  deleteQuestion,
  getQuestions,
  updateQuestionStatus,
} from '@/actions/content-pipeline/question-service'

const TEST_REVIEWER_ID = '11111111-1111-4111-8111-111111111111'

describe('内容审核域收口验证', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-03T00:00:00.000Z'))

    mockPrisma.$transaction.mockImplementation(async (input: any) => {
      if (Array.isArray(input)) {
        return Promise.all(input)
      }
      if (typeof input === 'function') {
        return input(mockPrisma)
      }
      return input
    })
    mockPrisma.user.findFirst.mockResolvedValue({ id: TEST_REVIEWER_ID })
    mockGetCurrentUser.mockResolvedValue({
      id: TEST_REVIEWER_ID,
      email: 'admin@example.com',
      username: 'Admin',
      role: UserRole.ADMIN,
    })
    mockResolveRequestAdminIdentity.mockResolvedValue({
      id: TEST_REVIEWER_ID,
      email: 'admin@example.com',
      username: 'Admin',
      role: UserRole.ADMIN,
    })
  })

  it('审核通过会按 VERIFIED -> PUBLISHED 两段写入，并生成真实审核日志', async () => {
    mockPrisma.question.findUnique
      .mockResolvedValueOnce({
        id: 'question-1',
        status: ContentStatus.REVIEW_PENDING,
      })
      .mockResolvedValueOnce({
        id: 'question-1',
        status: ContentStatus.VERIFIED,
      })
    mockPrisma.question.update.mockResolvedValue({
      id: 'question-1',
      status: ContentStatus.VERIFIED,
    })
    mockPrisma.contentReviewLog.create.mockResolvedValue({ id: 'log-1' })

    const result = await approveQuestion('question-1', '核账通过')

    expect(result).toEqual({
      success: true,
      message: '审核通过成功',
    })
    expect(mockPrisma.question.update).toHaveBeenCalledTimes(2)
    expect(mockPrisma.contentReviewLog.create).toHaveBeenCalledTimes(2)
    expect(mockPrisma.contentReviewLog.create).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
          data: expect.objectContaining({
            action: ReviewAction.APPROVE,
            fromStatus: ContentStatus.REVIEW_PENDING,
            toStatus: ContentStatus.VERIFIED,
            reviewerId: TEST_REVIEWER_ID,
            comment: '核账通过',
          }),
        })
    )
    expect(mockPrisma.contentReviewLog.create).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
          data: expect.objectContaining({
            action: ReviewAction.PUBLISH,
            fromStatus: ContentStatus.VERIFIED,
            toStatus: ContentStatus.PUBLISHED,
            reviewerId: TEST_REVIEWER_ID,
            comment: '核账通过',
          }),
        })
    )
    expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/content/review')
  })

  it('重复或非法状态流转会直接拒绝，不会继续写库', async () => {
    mockPrisma.question.findUnique.mockResolvedValue({
      id: 'question-2',
      status: ContentStatus.PUBLISHED,
    })

    const result = await updateQuestionStatus({
      questionId: 'question-2',
      newStatus: ContentStatus.DRAFT,
      reviewerId: TEST_REVIEWER_ID,
      comment: '重复审核校验',
    })

    expect(result.success).toBe(false)
    expect(result.code).toBe('INVALID_TRANSITION')
    expect(mockPrisma.question.update).not.toHaveBeenCalled()
    expect(mockPrisma.contentReviewLog.create).not.toHaveBeenCalled()
    expect(mockRevalidatePath).not.toHaveBeenCalled()
  })

  it('软删除只允许执行一次，重复删除会被拒绝并保留已删除视图口径', async () => {
    mockPrisma.question.findUnique
      .mockResolvedValueOnce({
        id: 'question-3',
        status: ContentStatus.REVIEW_PENDING,
        deletedAt: null,
      })
      .mockResolvedValueOnce({
        id: 'question-3',
        status: ContentStatus.ARCHIVED,
        deletedAt: new Date('2026-04-03T00:00:00.000Z'),
      })
    mockPrisma.question.update.mockResolvedValue({ id: 'question-3' })
    mockPrisma.contentReviewLog.create.mockResolvedValue({ id: 'log-3' })

    const first = await deleteQuestion('question-3', TEST_REVIEWER_ID, {
      comment: '软删除验证',
    })

    expect(first).toEqual({
      success: true,
      data: { deleted: true, hardDeleted: false },
    })
    expect(mockPrisma.question.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'question-3' },
        data: expect.objectContaining({
          status: ContentStatus.ARCHIVED,
          deletedBy: TEST_REVIEWER_ID,
          deleteReason: '软删除验证',
          deletedAt: expect.any(Date),
        }),
      })
    )
    expect(mockPrisma.contentReviewLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
          data: expect.objectContaining({
            action: ReviewAction.ARCHIVE,
            fromStatus: ContentStatus.REVIEW_PENDING,
            toStatus: ContentStatus.ARCHIVED,
            reviewerId: TEST_REVIEWER_ID,
          }),
        })
    )

    const second = await deleteQuestion('question-3', TEST_REVIEWER_ID, {
      comment: '重复删除验证',
    })

    expect(second.success).toBe(false)
    expect(second.code).toBe('DELETE_FAILED')
    expect(second.error).toBe('题目已删除')
    expect(mockPrisma.question.delete).not.toHaveBeenCalled()
    expect(mockPrisma.question.update).toHaveBeenCalledTimes(1)
    expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/content/review')
  })

  it('默认列表排除已删除题目，已删除视图能正确回收展示', async () => {
    mockPrisma.question.count.mockResolvedValue(2)
    mockPrisma.question.findMany.mockResolvedValue([
      { id: 'question-active', deletedAt: null },
      { id: 'question-deleted', deletedAt: new Date('2026-04-01T00:00:00.000Z') },
    ])

    const activeResult = await getQuestions({ page: 1, pageSize: 20 }, {})

    expect(mockPrisma.question.count).toHaveBeenCalledTimes(1)
    expect(mockPrisma.question.findMany).toHaveBeenCalledTimes(1)
    expect(mockPrisma.question.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          deletedAt: null,
        }),
      })
    )
    expect(mockPrisma.question.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          deletedAt: null,
        }),
      })
    )
    expect(activeResult.total).toBe(2)

    mockPrisma.question.count.mockResolvedValueOnce(1)
    mockPrisma.question.findMany.mockResolvedValueOnce([
      { id: 'question-deleted', deletedAt: new Date('2026-04-01T00:00:00.000Z') },
    ])

    const deletedResult = await getQuestions(
      { page: 1, pageSize: 20 },
      { deletedOnly: true }
    )

    expect(mockPrisma.question.count).toHaveBeenCalledTimes(2)
    expect(mockPrisma.question.findMany).toHaveBeenCalledTimes(2)
    expect(mockPrisma.question.count).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          deletedAt: { not: null },
        }),
      })
    )
    expect(mockPrisma.question.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          deletedAt: { not: null },
        }),
      })
    )
    expect(deletedResult.total).toBe(1)
  })

  it('审核详情会回放真实历史并保留章节与科目路径', async () => {
    mockPrisma.question.findUnique.mockResolvedValue({
      id: 'question-4',
      content: '计算 1+1',
      type: QuestionType.SINGLE_CHOICE,
      options: { A: '1', B: '2' },
      answer: 'B',
      explanation: '因为 1+1=2',
      difficulty: 3,
      subjectId: 'subject-1',
      chapterId: 'chapter-leaf',
      tags: ['math'],
      status: ContentStatus.REVIEW_PENDING,
      createdAt: new Date('2026-04-01T08:00:00.000Z'),
      assetUrl: null,
      imageUrls: [],
      sourceFile: { fileUrl: 'https://example.com/source.pdf' },
      chapter: {
        title: '加法',
        subject: {
          id: 'subject-1',
          name: '数学',
        },
      },
      group: null,
      subject: { name: '数学' },
    })
    mockPrisma.subject.findMany.mockResolvedValue([
      { id: 'subject-1', name: '数学', order: 1 },
    ])
    mockPrisma.chapter.findMany.mockResolvedValue([
      {
        id: 'chapter-parent',
        title: '整数运算',
        subjectId: 'subject-1',
        parentId: null,
        order: 1,
      },
      {
        id: 'chapter-leaf',
        title: '加法',
        subjectId: 'subject-1',
        parentId: 'chapter-parent',
        order: 2,
      },
    ])
    mockPrisma.contentReviewLog.findMany.mockResolvedValue([
      {
        action: ReviewAction.SUBMIT_REVIEW,
        comment: '提交审核',
        changes: null,
        createdAt: new Date('2026-04-02T00:00:00.000Z'),
        reviewer: {
          username: 'reviewer',
          email: 'reviewer@example.com',
        },
      },
      {
        action: ReviewAction.APPROVE,
        comment: '审核通过',
        changes: null,
        createdAt: new Date('2026-04-03T00:00:00.000Z'),
        reviewer: {
          username: 'auditor',
          email: 'auditor@example.com',
        },
      },
    ])

    const question = await getQuestionForReview('question-4')

    expect(question).not.toBeNull()
    expect(question?.metadata.subjectId).toBe('subject-1')
    expect(question?.metadata.chapterId).toBe('chapter-leaf')
    expect(question?.metadata.topic).toContain('整数运算 / 加法')
    expect(question?.history.map((item) => item.status)).toEqual([
      '题目创建',
      '提交审核',
      '审核通过',
    ])
    expect(question?.availableChapters ?? []).toHaveLength(1)
    expect(question?.availableChapters?.[0]?.id).toBe('chapter-leaf')
    expect(question?.sourceImageUrl).toBe('https://example.com/source.pdf')
  })
})
