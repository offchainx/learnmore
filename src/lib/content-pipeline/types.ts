/**
 * Content Pipeline 类型定义
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
  Chapter,
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

// ==================== 题目相关类型 ====================

/**
 * 带完整关联的题目类型
 */
export interface QuestionWithRelations extends Question {
  chapter?: Chapter | null
  group?: QuestionGroup | null
  tags?: Array<{
    tag: QuestionTag
  }>
  knowledgePoints?: Array<{
    kp: KnowledgePoint
  }>
  sourceFiles?: SourceFile[]
}

/**
 * JSON 值类型（Prisma 兼容）
 */
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

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

// ==================== OCR 相关类型 ====================

/**
 * OCR 处理结果
 */
export interface OCRResult {
  success: boolean
  rawText?: string
  confidence?: number
  pageCount?: number
  error?: string
  processedAt?: Date
}

/**
 * OCR 处理配置
 */
export interface OCRConfig {
  provider: 'google-vision' | 'mathpix' | 'tesseract'
  language?: string
  enableMathDetection?: boolean
  outputFormat?: 'text' | 'latex' | 'markdown'
}

// ==================== AI 结构化相关类型 ====================

/**
 * AI 结构化输入
 */
export interface AIStructureInput {
  rawText: string
  sourceFileId?: string
  subjectHint?: string
  gradeHint?: number
}

/**
 * AI 结构化输出 - 单个题目
 */
export interface AIStructuredQuestion {
  content: string
  type: QuestionType
  options?: Record<string, string> | null
  answer: unknown
  explanation?: string | null
  estimatedDifficulty?: number
  suggestedTags?: string[]
  suggestedKnowledgePoints?: string[]
}

/**
 * AI 结构化结果
 */
export interface AIStructureResult {
  success: boolean
  questions?: AIStructuredQuestion[]
  groupContent?: string // 如果是组合题，这里是公共题干
  error?: string
  tokenUsage?: number
  processedAt?: Date
}

// ==================== 质量检查相关类型 ====================

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
  type: 'latex_error' | 'missing_answer' | 'image_broken' | 'duplicate' | 'incomplete' | 'other'
  severity: 'error' | 'warning' | 'info'
  message: string
  field?: string
  suggestion?: string
}

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
 * 审核日志查询过滤
 */
export interface ReviewLogFilter {
  contentType?: 'question' | 'question_group'
  contentId?: string
  reviewerId?: string
  action?: ReviewAction
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

// ==================== 服务返回类型 ====================

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
