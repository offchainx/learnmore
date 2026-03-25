
import type {
  ImportStage,
  ImportProgress,
  CreateQuestionInput,
  AIStructuredQuestion,
} from '@/lib/content-pipeline/types'
import { calculateQuickQualityScore } from '@/lib/content-pipeline/quality-checker'

// ==================== 常量定义 ====================

/** 最大 PDF 文件大小 (50MB) - 用于客户端验证 */
export const MAX_PDF_SIZE = 50 * 1024 * 1024

/** 最大处理页数 */
export const MAX_PAGES = 50

/** 默认 OCR 成本上限 (美元) */
export const DEFAULT_MAX_OCR_COST = 1.0

/** 各阶段的进度权重 */
export const STAGE_WEIGHTS: Record<ImportStage, number> = {
  INIT: 5,
  UPLOADING: 5,
  OCR_PROCESSING: 40,
  STRUCTURING: 30,
  QUALITY_CHECK: 5,
  SAVING: 10,
  COMPLETED: 5,
  FAILED: 0,
}

// ==================== 辅助函数 ====================

/**
 * 从 URL 提取文件名
 */
export function extractFilename(url: string): string {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    const filename = pathname.split('/').pop() || 'unknown.pdf'
    return decodeURIComponent(filename)
  } catch {
    return 'unknown.pdf'
  }
}

/**
 * 计算累计进度百分比
 */
export function calculateProgress(
  currentStage: ImportStage,
  stageProgress: number = 100
): number {
  const stages: ImportStage[] = [
    'INIT',
    'UPLOADING',
    'OCR_PROCESSING',
    'STRUCTURING',
    'QUALITY_CHECK',
    'SAVING',
    'COMPLETED',
  ]

  const currentIndex = stages.indexOf(currentStage)
  if (currentIndex === -1) return 0

  // 计算之前阶段的累计权重
  let completedWeight = 0
  for (let i = 0; i < currentIndex; i++) {
    completedWeight += STAGE_WEIGHTS[stages[i]]
  }

  // 加上当前阶段的部分进度
  const currentWeight = STAGE_WEIGHTS[currentStage] * (stageProgress / 100)

  // 计算总权重
  const totalWeight = Object.values(STAGE_WEIGHTS).reduce((a, b) => a + b, 0) - STAGE_WEIGHTS.FAILED

  return Math.round((completedWeight + currentWeight) / totalWeight * 100)
}

/**
 * 创建进度信息
 */
export function createProgress(
  stage: ImportStage,
  message: string,
  options?: { current?: number; total?: number; stageProgress?: number }
): ImportProgress {
  return {
    stage,
    percent: calculateProgress(stage, options?.stageProgress),
    current: options?.current,
    total: options?.total,
    message,
    startedAt: new Date(),
  }
}

/**
 * 将 AI 结构化结果转换为创建题目输入
 */
export function convertToCreateInput(
  question: AIStructuredQuestion,
  metadata: {
    chapterId?: string | null
    subjectId?: string | null
    sourceFileId?: string | null
    source?: string | null
    qualityScore?: number
    isPastPaper?: boolean
    paperId?: string | null
  }
): CreateQuestionInput {
  const imageUrls = Array.from(
    new Set(
      (question.content.match(/!\[[^\]]*]\((https?:\/\/[^)]+)\)/gi) || [])
        .map((item) => item.match(/\((https?:\/\/[^)]+)\)/i)?.[1])
        .filter((x): x is string => Boolean(x))
    )
  )

  return {
    content: question.content,
    type: question.type,
    difficulty: question.estimatedDifficulty ?? 3,
    options: question.options ?? null,
    answer: question.answer as CreateQuestionInput['answer'],
    explanation: question.explanation ?? null,
    chapterId: metadata.chapterId ?? null,
    subjectId: metadata.subjectId ?? null,
    sourceFileId: metadata.sourceFileId ?? null,
    source: metadata.source ?? null,
    assetUrl: imageUrls[0] ?? null,
    imageUrls,
    isPastPaper: metadata.isPastPaper ?? false,
    paperId: metadata.paperId ?? null,
    qualityScore: metadata.qualityScore ?? null,
  }
}

/**
 * 计算题目质量分数
 * 使用 QuestionQualityChecker (Task B4) 进行快速评估
 */
export function calculateQualityScore(question: AIStructuredQuestion): number {
  return calculateQuickQualityScore(question)
}
