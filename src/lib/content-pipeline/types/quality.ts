/**
 * 质量检查相关类型定义
 * Story-044: Task C - 质量检查系统
 */

import type { ContentStatus, ReportIssueType, ReportStatus } from '@prisma/client'
import type { JsonValue } from './common'

// ==================== 质量检查结果类型 ====================

/**
 * 质量检查结果
 */
export interface QualityCheckResult {
  score: number // 0-100
  passed: boolean
  issues: QualityIssue[]
  checkedAt: Date
}

/**
 * 质量问题
 */
export interface QualityIssue {
  type: 'ERROR' | 'WARNING' | 'INFO'
  category: string
  message: string
  field?: string
  metadata?: Record<string, unknown>
}

/**
 * 质量问题类型常量
 */
export const QualityIssueType = {
  MISSING_CONTENT: 'MISSING_CONTENT',
  INVALID_LATEX: 'INVALID_LATEX',
  BROKEN_IMAGE: 'BROKEN_IMAGE',
  INSUFFICIENT_OPTIONS: 'INSUFFICIENT_OPTIONS',
  MISSING_ANSWER: 'MISSING_ANSWER',
  NO_KNOWLEDGE_POINTS: 'NO_KNOWLEDGE_POINTS',
  DUPLICATE_CONTENT: 'DUPLICATE_CONTENT',
} as const

export type QualityIssueTypeKey = keyof typeof QualityIssueType

/**
 * 质量检查配置
 */
export interface QualityCheckConfig {
  checkLatex?: boolean
  checkImages?: boolean
  checkDuplicates?: boolean
  checkCompleteness?: boolean
  minContentLength?: number
  requiredFields?: string[]
}

// ==================== 审核相关类型 ====================

/**
 * 审核统计摘要
 */
export interface ReviewSummary {
  totalPending: number
  totalReviewed: number
  approvalRate: number
  avgReviewTime: number // 分钟
  topReviewers: Array<{
    userId: string
    username: string
    reviewCount: number
  }>
}

/**
 * 内容统计
 */
export interface ContentStatistics {
  totalQuestions: number
  publishedQuestions: number
  draftQuestions: number
  rejectedQuestions: number
  bySubject: Record<string, number>
  byDifficulty: Record<number, number>
  byStatus: Record<string, number>
}

/**
 * 状态更新输入
 */
export interface UpdateStatusInput {
  questionId: string
  newStatus: ContentStatus
  reviewerId: string
  comment?: string
  changes?: JsonValue
}

/**
 * 批量状态更新输入
 */
export interface BulkUpdateStatusInput {
  questionIds: string[]
  newStatus: ContentStatus
  reviewerId: string
  comment?: string
}

/**
 * 审核日志查询过滤（来自types.ts）
 */
export interface ReviewLogFilter {
  contentType?: 'question' | 'question_group'
  contentId?: string
  reviewerId?: string
  action?: 'APPROVED' | 'REJECTED' | 'REQUESTED_CHANGES' | 'PUBLISHED' | 'UNPUBLISHED'
  fromStatus?: ContentStatus
  toStatus?: ContentStatus
  createdAfter?: Date
  createdBefore?: Date
}

// ==================== 用户报告相关类型 ====================

/**
 * 创建用户报告输入
 */
export interface CreateReportInput {
  questionId: string
  reportedBy: string
  issueType: ReportIssueType
  description: string
}

/**
 * 处理用户报告输入
 */
export interface ResolveReportInput {
  reportId: string
  reviewedBy: string
  status: ReportStatus
  resolution?: string
}

/**
 * 用户报告查询过滤
 */
export interface ReportFilter {
  questionId?: string
  reportedBy?: string
  status?: ReportStatus | ReportStatus[]
  issueType?: ReportIssueType | ReportIssueType[]
  createdAfter?: Date
  createdBefore?: Date
}
