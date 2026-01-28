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
    it('should generate consistent hash for same content', () => {
      const content = '解方程：$x^2 - 5x + 6 = 0$'
      const type = QuestionType.FILL_BLANK
      const answer = ['x=2', 'x=3']

      const hash1 = generateContentHash(content, type, answer)
      const hash2 = generateContentHash(content, type, answer)

      expect(hash1).toBe(hash2)
      expect(hash1).toHaveLength(32) // MD5 hash length
    })

    it('should generate different hash for different content', () => {
      const type = QuestionType.SINGLE_CHOICE
      const answer = 'A'

      const hash1 = generateContentHash('题目内容1', type, answer)
      const hash2 = generateContentHash('题目内容2', type, answer)

      expect(hash1).not.toBe(hash2)
    })

    it('should generate different hash for different answer', () => {
      const content = '选择正确答案'
      const type = QuestionType.SINGLE_CHOICE

      const hash1 = generateContentHash(content, type, 'A')
      const hash2 = generateContentHash(content, type, 'B')

      expect(hash1).not.toBe(hash2)
    })

    it('should generate different hash for different type', () => {
      const content = '题目内容'
      const answer = 'A'

      const hash1 = generateContentHash(content, QuestionType.SINGLE_CHOICE, answer)
      const hash2 = generateContentHash(content, QuestionType.TRUE_FALSE, answer)

      expect(hash1).not.toBe(hash2)
    })

    it('should normalize content before hashing (trim and lowercase)', () => {
      const type = QuestionType.SINGLE_CHOICE
      const answer = 'A'

      const hash1 = generateContentHash('  题目内容  ', type, answer)
      const hash2 = generateContentHash('题目内容', type, answer)

      expect(hash1).toBe(hash2)
    })

    it('should handle complex answer structures', () => {
      const content = '多选题'
      const type = QuestionType.MULTIPLE_CHOICE
      const answer = ['A', 'C', 'D']

      const hash = generateContentHash(content, type, answer)

      expect(hash).toHaveLength(32)
      expect(typeof hash).toBe('string')
    })

    it('should handle JSON object answers', () => {
      const content = '填空题'
      const type = QuestionType.FILL_BLANK
      const answer = { blank1: '答案1', blank2: '答案2' }

      const hash = generateContentHash(content, type, answer)

      expect(hash).toHaveLength(32)
    })
  })

  // ==================== 状态转换验证测试 ====================
  describe('validateStatusTransition', () => {
    it('should allow valid transition: DRAFT -> REVIEW_PENDING', () => {
      const result = validateStatusTransition(
        ContentStatus.DRAFT,
        ContentStatus.REVIEW_PENDING
      )

      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should allow valid transition: REVIEW_PENDING -> VERIFIED', () => {
      const result = validateStatusTransition(
        ContentStatus.REVIEW_PENDING,
        ContentStatus.VERIFIED
      )

      expect(result.valid).toBe(true)
    })

    it('should allow valid transition: VERIFIED -> PUBLISHED', () => {
      const result = validateStatusTransition(
        ContentStatus.VERIFIED,
        ContentStatus.PUBLISHED
      )

      expect(result.valid).toBe(true)
    })

    it('should reject invalid transition: DRAFT -> PUBLISHED', () => {
      const result = validateStatusTransition(
        ContentStatus.DRAFT,
        ContentStatus.PUBLISHED
      )

      expect(result.valid).toBe(false)
      expect(result.error).toContain('不允许')
    })

    it('should reject invalid transition: PUBLISHED -> DRAFT', () => {
      const result = validateStatusTransition(
        ContentStatus.PUBLISHED,
        ContentStatus.DRAFT
      )

      expect(result.valid).toBe(false)
    })

    it('should allow rollback: REVIEW_REJECTED -> DRAFT', () => {
      const result = validateStatusTransition(
        ContentStatus.REVIEW_REJECTED,
        ContentStatus.DRAFT
      )

      expect(result.valid).toBe(true)
    })

    it('should allow archive from PUBLISHED', () => {
      const result = validateStatusTransition(
        ContentStatus.PUBLISHED,
        ContentStatus.ARCHIVED
      )

      expect(result.valid).toBe(true)
    })

    it('should allow restore from ARCHIVED', () => {
      const result = validateStatusTransition(
        ContentStatus.ARCHIVED,
        ContentStatus.DRAFT
      )

      expect(result.valid).toBe(true)
    })

    it('should return allowed next statuses', () => {
      const result = validateStatusTransition(
        ContentStatus.DRAFT,
        ContentStatus.REVIEW_PENDING
      )

      expect(result.allowedNextStatuses).toBeDefined()
      expect(result.allowedNextStatuses).toContain(ContentStatus.REVIEW_PENDING)
      expect(result.allowedNextStatuses).toContain(ContentStatus.ARCHIVED)
    })

    it('should handle OCR workflow: DRAFT -> OCR_PROCESSING', () => {
      const result = validateStatusTransition(
        ContentStatus.DRAFT,
        ContentStatus.OCR_PROCESSING
      )

      expect(result.valid).toBe(true)
    })

    it('should handle OCR workflow: OCR_PROCESSING -> OCR_COMPLETED', () => {
      const result = validateStatusTransition(
        ContentStatus.OCR_PROCESSING,
        ContentStatus.OCR_COMPLETED
      )

      expect(result.valid).toBe(true)
    })

    it('should allow OCR failure recovery: OCR_PROCESSING -> DRAFT', () => {
      const result = validateStatusTransition(
        ContentStatus.OCR_PROCESSING,
        ContentStatus.DRAFT
      )

      expect(result.valid).toBe(true)
    })

    it('should allow re-review: VERIFIED -> REVIEW_PENDING', () => {
      const result = validateStatusTransition(
        ContentStatus.VERIFIED,
        ContentStatus.REVIEW_PENDING
      )

      expect(result.valid).toBe(true)
    })

    it('should allow unpublish: PUBLISHED -> VERIFIED', () => {
      const result = validateStatusTransition(
        ContentStatus.PUBLISHED,
        ContentStatus.VERIFIED
      )

      expect(result.valid).toBe(true)
    })
  })

  // ==================== 状态流程完整性测试 ====================
  describe('Status Flow Completeness', () => {
    const allStatuses = Object.values(ContentStatus)

    it('should have transition rules for all statuses', () => {
      allStatuses.forEach((status) => {
        const result = validateStatusTransition(status, status)
        // 自转换应该失败，但 allowedNextStatuses 应该存在
        expect(result.allowedNextStatuses).toBeDefined()
      })
    })

    it('should allow complete workflow: DRAFT -> ... -> PUBLISHED', () => {
      // 模拟完整的题目生命周期
      const workflow = [
        { from: ContentStatus.DRAFT, to: ContentStatus.REVIEW_PENDING },
        { from: ContentStatus.REVIEW_PENDING, to: ContentStatus.VERIFIED },
        { from: ContentStatus.VERIFIED, to: ContentStatus.PUBLISHED },
      ]

      workflow.forEach(({ from, to }) => {
        const result = validateStatusTransition(from, to)
        expect(result.valid).toBe(true)
      })
    })

    it('should allow OCR workflow: DRAFT -> OCR -> STRUCTURING -> REVIEW', () => {
      const workflow = [
        { from: ContentStatus.DRAFT, to: ContentStatus.OCR_PROCESSING },
        { from: ContentStatus.OCR_PROCESSING, to: ContentStatus.OCR_COMPLETED },
        { from: ContentStatus.OCR_COMPLETED, to: ContentStatus.STRUCTURING },
        { from: ContentStatus.STRUCTURING, to: ContentStatus.REVIEW_PENDING },
      ]

      workflow.forEach(({ from, to }) => {
        const result = validateStatusTransition(from, to)
        expect(result.valid).toBe(true)
      })
    })

    it('should allow rejection and re-submission workflow', () => {
      const workflow = [
        { from: ContentStatus.DRAFT, to: ContentStatus.REVIEW_PENDING },
        { from: ContentStatus.REVIEW_PENDING, to: ContentStatus.REVIEW_REJECTED },
        { from: ContentStatus.REVIEW_REJECTED, to: ContentStatus.DRAFT },
        { from: ContentStatus.DRAFT, to: ContentStatus.REVIEW_PENDING },
        { from: ContentStatus.REVIEW_PENDING, to: ContentStatus.VERIFIED },
      ]

      workflow.forEach(({ from, to }) => {
        const result = validateStatusTransition(from, to)
        expect(result.valid).toBe(true)
      })
    })
  })
})
