/**
 * 共用基础类型定义
 * Story-044: 题目全生命周期管理与数据结构
 */

import type {
  Question,
  SourceFile,
  ContentReviewLog,
  QuestionReport,
  QuestionType,
  ContentStatus,
  ProcessingStatus,
  ReviewAction,
  ReportIssueType,
  ReportStatus,
} from '@prisma/client'

// ==================== 重导出 Prisma 类型 ====================
export type {
  Question,
  SourceFile,
  ContentReviewLog,
  QuestionReport,
  QuestionType,
  ContentStatus,
  ProcessingStatus,
  ReviewAction,
  ReportIssueType,
  ReportStatus,
}

// ==================== JSON 和基础工具类型 ====================

/**
 * JSON 值类型（Prisma 兼容）
 */
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

/**
 * 分页参数
 */
export interface PaginationParams {
  page?: number
  pageSize?: number
  cursor?: string
}

/**
 * 分页结果
 */
export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

/**
 * 通用服务返回类型
 */
export interface ServiceResult<T> {
  success: boolean
  data?: T
  error?: string
  code?: string
}

/**
 * 批量操作结果
 */
export interface BulkOperationResult<T> {
  success: boolean
  total: number
  succeeded: number
  failed: number
  results: Array<{
    index: number
    success: boolean
    data?: T
    error?: string
  }>
}

// ==================== 题目相关类型 ====================

/**
 * 带完整关联的题目类型
 */
export interface QuestionWithRelations extends Question {
  chapter?: {
    id: string
    title: string
    subject: {
      id: string
      name: string
    }
  } | null
  subject?: {
    id: string
    name: string
  } | null
  sourceFile?: SourceFile | null
  _count?: {
    attempts: number
  }
}

/**
 * 创建题目输入
 */
export interface CreateQuestionInput {
  content: string
  type: QuestionType
  difficulty?: number
  curriculum?: string
  grade?: number | null
  subjectId?: string | null
  options?: Record<string, string> | null
  answer: JsonValue
  explanation?: string | null
  chapterId?: string | null
  sourceFileId?: string | null
  source?: string | null
  tags?: string[]
  assetUrl?: string | null
  imageUrls?: string[]
  isPastPaper?: boolean
  paperId?: string | null
  contentHash?: string | null
  qualityScore?: number | null
  createdBy?: string | null
}

/**
 * 更新题目输入
 */
export interface UpdateQuestionInput {
  content?: string
  type?: QuestionType
  difficulty?: number
  curriculum?: string
  grade?: number | null
  subjectId?: string | null
  options?: Record<string, string> | null
  answer?: JsonValue
  explanation?: string | null
  chapterId?: string | null
  sourceFileId?: string | null
  source?: string | null
  tags?: string[]
  assetUrl?: string | null
  imageUrls?: string[]
  isPastPaper?: boolean
  paperId?: string | null
  qualityScore?: number | null
}

/**
 * 批量创建题目输入
 */
export interface BulkCreateQuestionsInput {
  questions: CreateQuestionInput[]
  sourceFileId?: string
  createdBy?: string
}

/**
 * 题目查询过滤条件
 */
export interface QuestionFilter {
  status?: ContentStatus | ContentStatus[]
  type?: QuestionType | QuestionType[]
  difficulty?: number | { min?: number; max?: number }
  curriculum?: string | string[]
  grade?: number | { min?: number; max?: number }
  chapterId?: string
  subjectId?: string
  sourceFileId?: string
  source?: string
  isPastPaper?: boolean
  paperId?: string
  searchText?: string
  createdBy?: string
  reviewedBy?: string
  createdAfter?: Date
  createdBefore?: Date
}

/**
 * 题目排序选项
 */
export interface QuestionSortOptions {
  field: 'createdAt' | 'updatedAt' | 'difficulty' | 'qualityScore' | 'reportCount'
  order: 'asc' | 'desc'
}

// ==================== 源文件相关类型 ====================

/**
 * 创建源文件输入
 */
export interface CreateSourceFileInput {
  filename: string
  fileUrl: string
  fileType: 'pdf' | 'image' | 'docx' | 'html'
  fileSize: number
  uploadedBy: string
}

/**
 * 带完整关联的源文件类型
 */
export interface SourceFileWithRelations extends SourceFile {
  questions?: Question[]
}

// ==================== 工具函数类型 ====================

/**
 * 内容哈希生成函数类型
 */
export type ContentHashGenerator = (content: string, type: QuestionType, answer: unknown) => string

/**
 * 状态转换验证结果
 */
export interface StatusTransitionResult {
  valid: boolean
  error?: string
  allowedNextStatuses?: ContentStatus[]
}

/**
 * 状态转换验证函数类型
 */
export type StatusTransitionValidator = (
  fromStatus: ContentStatus,
  toStatus: ContentStatus
) => StatusTransitionResult
