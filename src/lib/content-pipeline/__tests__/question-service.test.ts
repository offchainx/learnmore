/**
 * Content Pipeline - 题目服务单元测试
 * Story-044: 题目全生命周期管理与数据结构
 */

import { describe, it, expect } from 'vitest'
import {
  generateContentHash,
  validateStatusTransition,
} from '@/actions/content-pipeline/question-service'
import { ContentStatus, QuestionType } from '@prisma/client'

describe('Content Pipeline - Question Service', () => {
  // ==================== 内容哈希生成测试 ====================
  describe('generateContentHash', () => {
    it('should generate consistent hash for same content', async () => {
      const content = '解方程：$x^2 - 5x + 6 = 0$'
      const type = QuestionType.FILL_BLANK
      const answer = ['x=2', 'x=3']

      const hash1 = await generateContentHash(content, type, answer)
      const hash2 = await generateContentHash(content, type, answer)

      expect(hash1).toBe(hash2)
      expect(hash1).toHaveLength(32) // MD5 hash length
    })

    it('should generate different hash for different content', async () => {
      const type = QuestionType.SINGLE_CHOICE
      const answer = 'A'

      const hash1 = await generateContentHash('题目内容1', type, answer)
      const hash2 = await generateContentHash('题目内容2', type, answer)

      expect(hash1).not.toBe(hash2)
    })

    it('should generate different hash for different answer', async () => {
      const content = '选择正确答案'
      const type = QuestionType.SINGLE_CHOICE

      const hash1 = await generateContentHash(content, type, 'A')
      const hash2 = await generateContentHash(content, type, 'B')

      expect(hash1).not.toBe(hash2)
    })

    it('should generate different hash for different type', async () => {
      const content = '题目内容'
      const answer = 'A'

      const hash1 = await generateContentHash(content, QuestionType.SINGLE_CHOICE, answer)
      const hash2 = await generateContentHash(content, QuestionType.TRUE_FALSE, answer)

      expect(hash1).not.toBe(hash2)
    })

    it('should normalize content before hashing (trim and lowercase)', async () => {
      const type = QuestionType.SINGLE_CHOICE
      const answer = 'A'

      const hash1 = await generateContentHash('  题目内容  ', type, answer)
      const hash2 = await generateContentHash('题目内容', type, answer)

      expect(hash1).toBe(hash2)
    })

    it('should handle complex answer structures', async () => {
      const content = '多选题'
      const type = QuestionType.MULTIPLE_CHOICE
      const answer = ['A', 'C', 'D']

      const hash = await generateContentHash(content, type, answer)

      expect(hash).toHaveLength(32)
      expect(typeof hash).toBe('string')
    })

    it('should handle JSON object answers', async () => {
      const content = '填空题'
      const type = QuestionType.FILL_BLANK
      const answer = { blank1: '答案1', blank2: '答案2' }

      const hash = await generateContentHash(content, type, answer)

      expect(hash).toHaveLength(32)
    })
  })

  // ==================== 状态转换验证测试 ====================
  describe('validateStatusTransition', () => {
    it('should allow valid transition: DRAFT -> REVIEW_PENDING', async () => {
      const result = await validateStatusTransition(
        ContentStatus.DRAFT,
        ContentStatus.REVIEW_PENDING
      )

      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should allow valid transition: REVIEW_PENDING -> VERIFIED', async () => {
      const result = await validateStatusTransition(
        ContentStatus.REVIEW_PENDING,
        ContentStatus.VERIFIED
      )

      expect(result.valid).toBe(true)
    })

    it('should allow valid transition: VERIFIED -> PUBLISHED', async () => {
      const result = await validateStatusTransition(
        ContentStatus.VERIFIED,
        ContentStatus.PUBLISHED
      )

      expect(result.valid).toBe(true)
    })

    it('should reject invalid transition: DRAFT -> PUBLISHED', async () => {
      const result = await validateStatusTransition(
        ContentStatus.DRAFT,
        ContentStatus.PUBLISHED
      )

      expect(result.valid).toBe(false)
      expect(result.error).toContain('不允许')
    })

    it('should reject invalid transition: PUBLISHED -> DRAFT', async () => {
      const result = await validateStatusTransition(
        ContentStatus.PUBLISHED,
        ContentStatus.DRAFT
      )

      expect(result.valid).toBe(false)
    })

    it('should allow rollback: REVIEW_REJECTED -> DRAFT', async () => {
      const result = await validateStatusTransition(
        ContentStatus.REVIEW_REJECTED,
        ContentStatus.DRAFT
      )

      expect(result.valid).toBe(true)
    })

    it('should allow archive from PUBLISHED', async () => {
      const result = await validateStatusTransition(
        ContentStatus.PUBLISHED,
        ContentStatus.ARCHIVED
      )

      expect(result.valid).toBe(true)
    })

    it('should allow restore from ARCHIVED', async () => {
      const result = await validateStatusTransition(
        ContentStatus.ARCHIVED,
        ContentStatus.DRAFT
      )

      expect(result.valid).toBe(true)
    })

    it('should return allowed next statuses', async () => {
      const result = await validateStatusTransition(
        ContentStatus.DRAFT,
        ContentStatus.REVIEW_PENDING
      )

      expect(result.allowedNextStatuses).toBeDefined()
      expect(result.allowedNextStatuses).toContain(ContentStatus.REVIEW_PENDING)
      expect(result.allowedNextStatuses).toContain(ContentStatus.ARCHIVED)
    })

    it('should handle OCR workflow: DRAFT -> OCR_PROCESSING', async () => {
      const result = await validateStatusTransition(
        ContentStatus.DRAFT,
        ContentStatus.OCR_PROCESSING
      )

      expect(result.valid).toBe(true)
    })

    it('should handle OCR workflow: OCR_PROCESSING -> OCR_COMPLETED', async () => {
      const result = await validateStatusTransition(
        ContentStatus.OCR_PROCESSING,
        ContentStatus.OCR_COMPLETED
      )

      expect(result.valid).toBe(true)
    })

    it('should allow OCR failure recovery: OCR_PROCESSING -> DRAFT', async () => {
      const result = await validateStatusTransition(
        ContentStatus.OCR_PROCESSING,
        ContentStatus.DRAFT
      )

      expect(result.valid).toBe(true)
    })

    it('should allow re-review: VERIFIED -> REVIEW_PENDING', async () => {
      const result = await validateStatusTransition(
        ContentStatus.VERIFIED,
        ContentStatus.REVIEW_PENDING
      )

      expect(result.valid).toBe(true)
    })

    it('should allow unpublish: PUBLISHED -> VERIFIED', async () => {
      const result = await validateStatusTransition(
        ContentStatus.PUBLISHED,
        ContentStatus.VERIFIED
      )

      expect(result.valid).toBe(true)
    })
  })

  // ==================== 状态流程完整性测试 ====================
  describe('Status Flow Completeness', () => {
    const allStatuses = Object.values(ContentStatus)

    it('should have transition rules for all statuses', async () => {
      for (const status of allStatuses) {
        const result = await validateStatusTransition(status, status)
        // 自转换应该失败，但 allowedNextStatuses 应该存在
        expect(result.allowedNextStatuses).toBeDefined()
      }
    })

    it('should allow complete workflow: DRAFT -> ... -> PUBLISHED', async () => {
      // 模拟完整的题目生命周期
      const workflow = [
        { from: ContentStatus.DRAFT, to: ContentStatus.REVIEW_PENDING },
        { from: ContentStatus.REVIEW_PENDING, to: ContentStatus.VERIFIED },
        { from: ContentStatus.VERIFIED, to: ContentStatus.PUBLISHED },
      ]

      for (const { from, to } of workflow) {
        const result = await validateStatusTransition(from, to)
        expect(result.valid).toBe(true)
      }
    })

    it('should allow OCR workflow: DRAFT -> OCR -> STRUCTURING -> REVIEW', async () => {
      const workflow = [
        { from: ContentStatus.DRAFT, to: ContentStatus.OCR_PROCESSING },
        { from: ContentStatus.OCR_PROCESSING, to: ContentStatus.OCR_COMPLETED },
        { from: ContentStatus.OCR_COMPLETED, to: ContentStatus.STRUCTURING },
        { from: ContentStatus.STRUCTURING, to: ContentStatus.REVIEW_PENDING },
      ]

      for (const { from, to } of workflow) {
        const result = await validateStatusTransition(from, to)
        expect(result.valid).toBe(true)
      }
    })

    it('should allow rejection and re-submission workflow', async () => {
      const workflow = [
        { from: ContentStatus.DRAFT, to: ContentStatus.REVIEW_PENDING },
        { from: ContentStatus.REVIEW_PENDING, to: ContentStatus.REVIEW_REJECTED },
        { from: ContentStatus.REVIEW_REJECTED, to: ContentStatus.DRAFT },
        { from: ContentStatus.DRAFT, to: ContentStatus.REVIEW_PENDING },
        { from: ContentStatus.REVIEW_PENDING, to: ContentStatus.VERIFIED },
      ]

      for (const { from, to } of workflow) {
        const result = await validateStatusTransition(from, to)
        expect(result.valid).toBe(true)
      }
    })
  })
})
