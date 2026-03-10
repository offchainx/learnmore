/**
 * 内容流水线相关类型定义
 * 用于批量导入、题目审核等功能
 */

import { ProcessingStatus } from '@prisma/client'

// ==================== 批量任务相关 ====================

/**
 * 批量任务状态（UI展示用）
 */
export type BatchStatusUI = 'Processing' | 'Completed' | 'Error' | 'Queued' | 'Pending'

/**
 * 导入与审核事件码（用于任务进度/日志统一口径）
 */
export type ImportEventCode =
  | 'IMPORT_TASK_CREATED'
  | 'IMPORT_TASK_DELETED'
  | 'IMPORT_RETRY'
  | 'IMPORT_PARSE_DONE'
  | 'IMPORT_PARSE_FAILED'
  | 'QUESTION_MARKED_ERROR'
  | 'REVIEW_SUBMITTED'
  | 'REVIEW_APPROVED'
  | 'REVIEW_REJECTED'

/**
 * 批量任务数据（UI展示用）
 */
export interface BatchData {
  id: string
  name: string
  fileCount: number
  subject: string
  curriculum: string
  progress: number
  status: BatchStatusUI
  statusMessage?: string
  createdAt: Date
  questionsCount: number
  sourceRemark?: string
  sourceFileUrl?: string
  events: ImportEventCode[]
}

/**
 * 导入任务数据（数据库层）
 */
export interface ImportTask {
  id: string
  filename: string
  fileUrl: string
  status: ProcessingStatus
  ocrStatus: ProcessingStatus
  questionsCount: number
  createdAt: Date
  processedAt: Date | null
  subject?: {
    id: string
    name: string
  }
  sourceYear?: number
  source?: string
  curriculum?: string
  events?: ImportEventCode[]
}

// ==================== 审核日志相关 ====================

/**
 * 审核日志类型
 */
export type AuditLogType = 'info' | 'warning' | 'error' | 'success'

/**
 * 审核日志条目
 */
export interface AuditLogEntry {
  id: string
  user: string
  avatar: string
  action: string
  target: string
  timestamp: string
  type: AuditLogType
}

// ==================== 统计数据相关 ====================

/**
 * 统计数据
 */
export interface StatsData {
  tasksToday: number
  completedTasks: number
  failedTasks: number
  successRate: number
  pendingReviewQuestions: number
  importedQuestions7d: number
  activeBatches: number
  storageUsed: number
  storageLimit: number
}

// ==================== 题目审核相关 ====================

/**
 * 选项数据（用于选择题）
 */
export interface QuestionOption {
  id: string
  value: string // 支持 LaTeX 字符串
  isCorrect?: boolean
}

/**
 * 题目解析数据
 */
export interface QuestionExplanation {
  text: string // 主要解析内容（Markdown + LaTeX）
  steps?: string[] // 解题步骤（代码格式）
  finalStep?: string
  finalEquation?: string
  note?: string // 警告或备注
}

/**
 * 题目元数据
 */
export interface QuestionMetadata {
  subject: string
  topic: string
  type: string
  difficulty: string // L1-L5
  difficultyLabel: string
  points: number
  tags: string[]
}

/**
 * 审核历史记录
 */
export interface ReviewHistoryEntry {
  status: string
  date: string
  user: string
  color: string // Tailwind 背景色类名
}

/**
 * 完整题目数据（用于审核界面）
 */
export interface QuestionReviewData {
  id: string
  variant?: string
  title: string
  stem: string // 题干（Markdown + LaTeX）
  stemEquation?: string // 独立展示的公式
  stemFooter?: string // 题干补充内容
  options: QuestionOption[]
  explanation: QuestionExplanation
  metadata: QuestionMetadata
  history: ReviewHistoryEntry[]
  questionImageUrls?: string[] // 题目中的图片资源（可多张）
  sourceImageUrl?: string // OCR 原始扫描图
  status?: string // 题目状态 (DRAFT, REVIEW_PENDING, VERIFIED, PUBLISHED, etc.)
}
