/**
 * PDF 处理相关类型定义
 * Story-044: Task B3 - PDF导入服务
 */

import type { ImportStage } from './ai'
import type { OCRResult } from './ocr'

// ==================== PDF 导入类型 ====================

/**
 * PDF 导入输入参数
 */
export interface ImportFromPDFInput {
  /** PDF 文件 URL (Supabase Storage) */
  pdfUrl: string
  /** 科目 ID */
  subjectId: string
  /** 来源标识 (e.g. "2023年中考数学真题") */
  source?: string
  /** 年份 */
  sourceYear?: number
  /** 试卷名 */
  sourcePaper?: string
  /** 章节 ID (可选，用于直接分类) */
  chapterId?: string
  /** 题组 ID (可选，用于关联到已有题组) */
  groupId?: string
}

/**
 * 导入进度信息
 */
export interface ImportProgress {
  /** 当前阶段 */
  stage: ImportStage
  /** 进度百分比 (0-100) */
  percent: number
  /** 当前页/当前步骤 */
  current?: number
  /** 总页数/总步骤 */
  total?: number
  /** 阶段描述 */
  message: string
  /** 阶段开始时间 */
  startedAt: Date
  /** 预计剩余时间 (秒) */
  estimatedRemaining?: number
}

/**
 * 导入结果
 */
export interface ImportResult {
  /** 是否成功 */
  success: boolean
  /** 源文件 ID */
  sourceFileId: string
  /** 创建的题目数量 */
  questionsCreated: number
  /** 重复跳过的题目数量 */
  questionsDuplicated: number
  /** 失败的题目数量 */
  questionsFailed: number
  /** 创建的题目 ID 列表 */
  questionIds: string[]
  /** OCR 处理耗时 (毫秒) */
  ocrDuration: number
  /** AI 结构化耗时 (毫秒) */
  structureDuration: number
  /** 总耗时 (毫秒) */
  totalDuration: number
  /** 估算成本 (美元) */
  estimatedCost: number
  /** 错误信息 (失败时) */
  error?: string
  /** 错误代码 (失败时) */
  errorCode?: ImportErrorCode
}

/**
 * 导入错误代码
 */
export type ImportErrorCode =
  | 'UNAUTHORIZED'           // 未授权
  | 'INVALID_PDF'            // 无效的 PDF
  | 'PDF_TOO_LARGE'          // PDF 太大
  | 'OCR_FAILED'             // OCR 失败
  | 'STRUCTURE_FAILED'       // 结构化失败
  | 'SAVE_FAILED'            // 保存失败
  | 'QUOTA_EXCEEDED'         // 配额超限
  | 'SOURCE_FILE_NOT_FOUND'  // 源文件不存在
  | 'ALREADY_PROCESSED'      // 已处理过
  | 'NETWORK_ERROR'          // 网络错误
  | 'UNKNOWN_ERROR'          // 未知错误

/**
 * 恢复失败导入输入参数
 */
export interface ResumeFailedImportInput {
  /** 源文件 ID */
  sourceFileId: string
  /** 从哪个阶段恢复 (可选，默认自动检测) */
  fromStage?: ImportStage
  /** 科目 ID (可选，覆盖原有值) */
  subjectId?: string
}

/**
 * 导入进度回调函数
 */
export type ImportProgressCallback = (progress: ImportProgress) => void

/**
 * 导入配置选项
 */
export interface ImportOptions {
  /** 进度回调 */
  onProgress?: ImportProgressCallback
  /** 最大处理页数 (默认 50) */
  maxPages?: number
  /** OCR 最大成本 (美元, 默认 1.0) */
  maxOcrCost?: number
  /** 是否跳过质量检查 */
  skipQualityCheck?: boolean
  /** 题目默认状态 */
  defaultStatus?: 'DRAFT' | 'REVIEW_PENDING'
  /** 是否自动发布高质量题目 (qualityScore >= 90) */
  autoPublishHighQuality?: boolean
}

// ==================== PDF 处理选项 ====================

/**
 * PDF 处理选项（来自ocr-types.ts）
 */
export interface PDFProcessOptions {
  /** 起始页码 (从1开始) */
  startPage?: number
  /** 结束页码 */
  endPage?: number
  /** DPI (默认 150) */
  dpi?: number
  /** 是否合并所有页面文本 */
  mergePages?: boolean
  /** 最大处理页数 */
  maxPages?: number
  /** 指定使用的提供商（不指定则按优先级） */
  provider?: 'google_vision' | 'mathpix' | 'tesseract' | 'mock'
  /** 语言提示 */
  languageHints?: string[]
  /** 是否检测数学公式 */
  detectMath?: boolean
  /** 最大成本限制 (美元) */
  maxCost?: number
  /** 超时时间 (毫秒) */
  timeout?: number
  /** 总成本上限 (美元) */
  maxTotalCost?: number
  /** 失败时是否继续处理其他文件 */
  continueOnError?: boolean
  /** 进度回调 */
  onProgress?: (current: number, total: number, result?: OCRResult) => void
}
