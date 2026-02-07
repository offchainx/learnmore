/**
 * 共用基础类型定义
 * Story-044: 题目全生命周期管理与数据结构
 */

import type {
  Question,
  QuestionGroup,
  SourceFile,
  QuestionTag,
  KnowledgePoint,
  ContentReviewLog,
  QuestionReport,
  QuestionType,
  ContentStatus,
  ProcessingStatus,
  TagCategory,
  ReviewAction,
  ReportIssueType,
  ReportStatus,
  Subject,
} from '@prisma/client'

// ==================== 重导出 Prisma 类型 ====================
export type {
  Question,
  QuestionGroup,
  SourceFile,
  QuestionTag,
  KnowledgePoint,
  ContentReviewLog,
  QuestionReport,
  QuestionType,
  ContentStatus,
  ProcessingStatus,
  TagCategory,
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
  group?: QuestionGroup | null
  tags?: Array<{
    tag: {
      id: string
      name: string
      category: TagCategory
    }
  }>
  knowledgePoints?: Array<{
    kp: {
      id: string
      code: string
      name: string
    }
  }>
  sourceFiles?: SourceFile[]
  _count?: {
    attempts: number
    errorBook: number
  }
}

/**
 * 创建题目输入
 */
export interface CreateQuestionInput {
  content: string
  type: QuestionType
  difficulty?: number
  options?: Record<string, string> | null
  answer: JsonValue // JSON 类型，根据题型不同格式不同
  explanation?: string | null
  chapterId?: string | null
  groupId?: string | null
  ocrRawText?: string | null
  ocrConfidence?: number | null
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
  options?: Record<string, string> | null
  answer?: JsonValue
  explanation?: string | null
  chapterId?: string | null
  groupId?: string | null
  qualityScore?: number | null
}

/**
 * 批量创建题目输入
 */
export interface BulkCreateQuestionsInput {
  questions: CreateQuestionInput[]
  sourceFileId?: string
  groupId?: string
  createdBy?: string
}

/**
 * 题目查询过滤条件
 */
export interface QuestionFilter {
  status?: ContentStatus | ContentStatus[]
  type?: QuestionType | QuestionType[]
  difficulty?: number | { min?: number; max?: number }
  chapterId?: string
  subjectId?: string
  groupId?: string
  hasGroup?: boolean
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

// ==================== 题组相关类型 ====================

/**
 * 创建题组输入
 */
export interface CreateQuestionGroupInput {
  content: string
  subjectId: string
  materialUrl?: string | null
  source?: string | null
  sourceYear?: number | null
  sourcePaper?: string | null
  createdBy?: string | null
}

/**
 * 带完整关联的题组类型
 */
export interface QuestionGroupWithRelations extends QuestionGroup {
  subject?: Subject
  questions?: Question[]
  sourceFiles?: SourceFile[]
}

// ==================== 源文件相关类型 ====================

/**
 * 创建源文件输入
 */
export interface CreateSourceFileInput {
  filename: string
  fileUrl: string
  fileType: 'pdf' | 'image' | 'docx'
  fileSize: number
  uploadedBy: string
}

/**
 * 带完整关联的源文件类型
 */
export interface SourceFileWithRelations extends SourceFile {
  questionGroups?: QuestionGroup[]
  questions?: Question[]
}

// ==================== 标签相关类型 ====================

/**
 * 创建标签输入
 */
export interface CreateTagInput {
  name: string
  category: TagCategory
  color?: string | null
  parentId?: string | null
}

/**
 * 带层级的标签类型
 */
export interface TagWithHierarchy extends QuestionTag {
  parent?: QuestionTag | null
  children?: QuestionTag[]
  questionCount?: number
}

// ==================== 知识点相关类型 ====================

/**
 * 创建知识点输入
 */
export interface CreateKnowledgePointInput {
  code: string
  name: string
  description?: string | null
  subjectId: string
  parentId?: string | null
}

/**
 * 带层级的知识点类型
 */
export interface KnowledgePointWithHierarchy extends KnowledgePoint {
  parent?: KnowledgePoint | null
  children?: KnowledgePoint[]
  subject?: Subject
  questionCount?: number
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
