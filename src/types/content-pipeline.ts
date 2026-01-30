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
 * 批量任务数据（UI展示用）
 */
export interface BatchData {
  id: string
  name: string
  fileCount: number
  subject: string
  year: number
  progress: number
  status: BatchStatusUI
  statusMessage?: string
  createdAt: Date
  questionsCount: number
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
}

/**
 * 将数据库 ProcessingStatus 转换为 UI BatchStatusUI
 */
export function mapProcessingStatusToBatchStatus(status: ProcessingStatus): BatchStatusUI {
  switch (status) {
    case 'COMPLETED':
      return 'Completed'
    case 'FAILED':
      return 'Error'
    case 'PROCESSING':
      return 'Processing'
    case 'PENDING':
      return 'Queued'
    default:
      return 'Pending'
  }
}

/**
 * 将 ImportTask 转换为 BatchData（用于UI展示）
 */
export function mapImportTaskToBatchData(task: ImportTask): BatchData {
  return {
    id: task.id,
    name: task.filename,
    fileCount: 1,
    subject: task.subject?.name || '未知科目',
    year: task.sourceYear || new Date().getFullYear(),
    progress: task.status === 'COMPLETED' ? 100 : task.status === 'PROCESSING' ? 50 : 0,
    status: mapProcessingStatusToBatchStatus(task.status),
    statusMessage: getStatusMessage(task.status),
    createdAt: task.createdAt,
    questionsCount: task.questionsCount,
  }
}

function getStatusMessage(status: ProcessingStatus): string | undefined {
  switch (status) {
    case 'PROCESSING':
      return '正在处理...'
    case 'FAILED':
      return '处理失败'
    case 'PENDING':
      return '等待处理...'
    default:
      return undefined
  }
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
  activeBatches: number
  activeTrend: number
  flaggedErrors: number
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
  sourceImageUrl?: string // OCR 原始扫描图
  status?: string // 题目状态 (DRAFT, REVIEW_PENDING, VERIFIED, PUBLISHED, etc.)
}
