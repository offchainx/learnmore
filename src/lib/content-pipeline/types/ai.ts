/**
 * AI 结构化相关类型定义
 * Story-044: Task B2 - AI结构化服务
 */

import type { QuestionType } from '@prisma/client'

// ==================== AI 结构化类型 ====================

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

// ==================== 导入流程相关类型 ====================

/**
 * 导入进度阶段
 */
export type ImportStage =
  | 'INIT'           // 初始化
  | 'UPLOADING'      // 上传中
  | 'OCR_PROCESSING' // OCR 处理中
  | 'STRUCTURING'    // AI 结构化中
  | 'QUALITY_CHECK'  // 质量检查中
  | 'SAVING'         // 保存入库中
  | 'COMPLETED'      // 完成
  | 'FAILED'         // 失败
