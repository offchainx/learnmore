/**
 * Content Pipeline - 质量检查器
 * Story-044: Task B4 - 自动质量检查
 *
 * 实现题目质量自动检查功能：
 * - 必填字段检查
 * - 选项完整性检查（选择题）
 * - 答案有效性检查
 * - LaTeX 语法检查
 * - 图片链接有效性检查
 * - 知识点标注检查
 */

import type { Question, QuestionType } from '@prisma/client'
import type {
  QualityCheckResult,
  QualityIssue,
  QualityCheckConfig,
  AIStructuredQuestion,
} from './types'

// ==================== 常量定义 ====================

/** 默认最小内容长度 */
const DEFAULT_MIN_CONTENT_LENGTH = 10

/** 图片链接检查超时时间 (毫秒) */
const IMAGE_CHECK_TIMEOUT = 3000

/** 各类问题的扣分值 */
const SCORE_PENALTIES = {
  MISSING_CONTENT: 30,
  INSUFFICIENT_OPTIONS: 20,
  MISSING_ANSWER: 30,
  INVALID_LATEX: 10,
  BROKEN_IMAGE: 15,
  NO_KNOWLEDGE_POINTS: 5,
  SHORT_EXPLANATION: 3,
} as const

/** 加分项 */
const SCORE_BONUSES = {
  HAS_EXPLANATION: 5,
  HAS_TAGS: 5,
} as const

// ==================== 类型定义 ====================

/**
 * 质量检查输入 - 支持 Prisma Question 或 AI 结构化结果
 */
export type QualityCheckInput =
  | Question
  | AIStructuredQuestion
  | {
      id?: string
      content: string
      type: QuestionType | string
      options?: Record<string, string> | null
      answer?: unknown
      explanation?: string | null
    }

/**
 * 扩展的质量检查结果（包含建议）
 */
export interface ExtendedQualityCheckResult extends QualityCheckResult {
  /** 是否有致命错误 */
  isValid: boolean
  /** 改进建议列表 */
  suggestions: string[]
}

/**
 * 批量检查结果
 */
export interface BatchQualityCheckResult {
  /** 总数 */
  total: number
  /** 通过数量 */
  passed: number
  /** 失败数量 */
  failed: number
  /** 平均分数 */
  averageScore: number
  /** 各题目的检查结果 */
  results: Array<{
    index: number
    questionId?: string
    result: ExtendedQualityCheckResult
  }>
}

/**
 * 知识点检查函数类型（用于依赖注入）
 */
export type KnowledgePointChecker = (questionId: string) => Promise<number>

// ==================== 质量检查器类 ====================

/**
 * 题目质量检查器
 *
 * @example
 * ```typescript
 * const checker = new QuestionQualityChecker()
 *
 * // 检查单个题目
 * const result = await checker.check(question)
 * console.log(`质量分数: ${result.score}`)
 *
 * // 批量检查
 * const batchResult = await checker.checkBatch(questions)
 * console.log(`通过率: ${batchResult.passed / batchResult.total * 100}%`)
 * ```
 */
export class QuestionQualityChecker {
  private config: Required<QualityCheckConfig>
  private knowledgePointChecker?: KnowledgePointChecker

  constructor(config?: QualityCheckConfig, knowledgePointChecker?: KnowledgePointChecker) {
    this.config = {
      checkLatex: config?.checkLatex ?? true,
      checkImages: config?.checkImages ?? true,
      checkDuplicates: config?.checkDuplicates ?? false,
      checkCompleteness: config?.checkCompleteness ?? true,
      minContentLength: config?.minContentLength ?? DEFAULT_MIN_CONTENT_LENGTH,
      requiredFields: config?.requiredFields ?? ['content', 'type', 'answer'],
    }
    this.knowledgePointChecker = knowledgePointChecker
  }

  /**
   * 检查单个题目的质量
   */
  async check(question: QualityCheckInput): Promise<ExtendedQualityCheckResult> {
    const issues: QualityIssue[] = []
    let score = 100

    // 1. 必填字段检查 - 内容
    const contentCheck = this.checkContent(question)
    if (contentCheck) {
      issues.push(contentCheck)
      score -= SCORE_PENALTIES.MISSING_CONTENT
    }

    // 2. 选项检查（选择题）
    const optionsCheck = this.checkOptions(question)
    if (optionsCheck) {
      issues.push(optionsCheck)
      score -= SCORE_PENALTIES.INSUFFICIENT_OPTIONS
    }

    // 3. 答案检查
    const answerCheck = this.checkAnswer(question)
    if (answerCheck) {
      issues.push(answerCheck)
      score -= SCORE_PENALTIES.MISSING_ANSWER
    }

    // 4. LaTeX 语法检查
    if (this.config.checkLatex && question.content?.includes('$')) {
      const latexCheck = await this.checkLatex(question.content)
      if (latexCheck) {
        issues.push(latexCheck)
        score -= SCORE_PENALTIES.INVALID_LATEX
      }
    }

    // 5. 图片链接检查
    if (this.config.checkImages) {
      const imageUrls = this.extractImageUrls(question.content || '')
      const brokenImages = await this.checkImages(imageUrls)
      for (const issue of brokenImages) {
        issues.push(issue)
        score -= SCORE_PENALTIES.BROKEN_IMAGE
      }
    }

    // 6. 知识点标注检查（需要数据库查询，仅对已保存的题目）
    if (this.knowledgePointChecker && 'id' in question && question.id) {
      const kpCount = await this.knowledgePointChecker(question.id)
      if (kpCount === 0) {
        issues.push({
          type: 'WARNING',
          category: 'NO_KNOWLEDGE_POINTS',
          message: '未标注知识点',
          field: 'knowledgePoints',
        })
        score -= SCORE_PENALTIES.NO_KNOWLEDGE_POINTS
      }
    }

    // 加分项
    if (this.hasValidExplanation(question)) {
      score = Math.min(100, score + SCORE_BONUSES.HAS_EXPLANATION)
    }

    if (this.hasValidTags(question)) {
      score = Math.min(100, score + SCORE_BONUSES.HAS_TAGS)
    }

    // 确保分数在 0-100 范围内
    score = Math.max(0, Math.min(100, score))

    // 生成改进建议
    const suggestions = this.generateSuggestions(issues)

    // 判断是否有致命错误（ERROR 类型的问题）
    const isValid = issues.filter((i) => i.type === 'ERROR').length === 0

    return {
      score,
      passed: score >= 60 && isValid,
      issues,
      checkedAt: new Date(),
      isValid,
      suggestions,
    }
  }

  /**
   * 批量检查多个题目
   */
  async checkBatch(
    questions: QualityCheckInput[],
    options?: { concurrency?: number }
  ): Promise<BatchQualityCheckResult> {
    const concurrency = options?.concurrency ?? 5
    const results: BatchQualityCheckResult['results'] = []

    // 分批并发处理
    for (let i = 0; i < questions.length; i += concurrency) {
      const batch = questions.slice(i, i + concurrency)
      const batchResults = await Promise.all(
        batch.map(async (question, batchIndex) => {
          const index = i + batchIndex
          const result = await this.check(question)
          return {
            index,
            questionId: 'id' in question ? question.id : undefined,
            result,
          }
        })
      )
      results.push(...batchResults)
    }

    // 统计
    const passed = results.filter((r) => r.result.passed).length
    const failed = results.length - passed
    const averageScore =
      results.length > 0
        ? results.reduce((sum, r) => sum + r.result.score, 0) / results.length
        : 0

    return {
      total: results.length,
      passed,
      failed,
      averageScore: Math.round(averageScore * 100) / 100,
      results,
    }
  }

  /**
   * 快速计算质量分数（不执行网络请求）
   * 用于导入流程中的快速评估
   */
  calculateQuickScore(question: QualityCheckInput): number {
    let score = 100

    // 内容检查
    if (!question.content || question.content.length < this.config.minContentLength) {
      score -= SCORE_PENALTIES.MISSING_CONTENT
    }

    // 答案检查
    if (question.answer === undefined || question.answer === null) {
      score -= SCORE_PENALTIES.MISSING_ANSWER
    }

    // 选项检查
    const type = question.type as string
    if (type === 'SINGLE_CHOICE' || type === 'MULTIPLE_CHOICE') {
      const options = question.options as Record<string, string> | null | undefined
      if (!options || Object.keys(options).length < 2) {
        score -= SCORE_PENALTIES.INSUFFICIENT_OPTIONS
      }
    }

    // 加分项
    if (this.hasValidExplanation(question)) {
      score = Math.min(100, score + SCORE_BONUSES.HAS_EXPLANATION)
    }

    if (this.hasValidTags(question)) {
      score = Math.min(100, score + SCORE_BONUSES.HAS_TAGS)
    }

    return Math.max(0, score)
  }

  // ==================== 私有检查方法 ====================

  /**
   * 检查内容字段
   */
  private checkContent(question: QualityCheckInput): QualityIssue | null {
    if (!question.content || question.content.trim().length < this.config.minContentLength) {
      return {
        type: 'ERROR',
        category: 'MISSING_CONTENT',
        message: `题目内容过短或为空（最少需要 ${this.config.minContentLength} 个字符）`,
        field: 'content',
        metadata: {
          currentLength: question.content?.trim().length ?? 0,
          minLength: this.config.minContentLength,
        },
      }
    }
    return null
  }

  /**
   * 检查选项（选择题）
   */
  private checkOptions(question: QualityCheckInput): QualityIssue | null {
    const type = question.type as string

    if (type === 'SINGLE_CHOICE' || type === 'MULTIPLE_CHOICE') {
      const options = question.options as Record<string, string> | null | undefined

      if (!options || typeof options !== 'object') {
        return {
          type: 'ERROR',
          category: 'INSUFFICIENT_OPTIONS',
          message: '选择题缺少选项',
          field: 'options',
        }
      }

      const optionKeys = Object.keys(options)
      if (optionKeys.length < 2) {
        return {
          type: 'ERROR',
          category: 'INSUFFICIENT_OPTIONS',
          message: `选择题至少需要 2 个选项，当前只有 ${optionKeys.length} 个`,
          field: 'options',
          metadata: {
            currentCount: optionKeys.length,
            minCount: 2,
          },
        }
      }

      // 检查选项是否有空值
      const emptyOptions = optionKeys.filter((k) => !options[k] || options[k].trim() === '')
      if (emptyOptions.length > 0) {
        return {
          type: 'WARNING',
          category: 'INSUFFICIENT_OPTIONS',
          message: `选项 ${emptyOptions.join(', ')} 内容为空`,
          field: 'options',
          metadata: { emptyOptions },
        }
      }
    }

    return null
  }

  /**
   * 检查答案
   */
  private checkAnswer(question: QualityCheckInput): QualityIssue | null {
    const answer = question.answer

    if (answer === undefined || answer === null) {
      return {
        type: 'ERROR',
        category: 'MISSING_ANSWER',
        message: '缺少答案',
        field: 'answer',
      }
    }

    // 检查答案是否为空字符串或空数组
    if (typeof answer === 'string' && answer.trim() === '') {
      return {
        type: 'ERROR',
        category: 'MISSING_ANSWER',
        message: '答案不能为空字符串',
        field: 'answer',
      }
    }

    if (Array.isArray(answer) && answer.length === 0) {
      return {
        type: 'ERROR',
        category: 'MISSING_ANSWER',
        message: '答案数组不能为空',
        field: 'answer',
      }
    }

    // 选择题答案校验
    const type = question.type as string
    if (type === 'SINGLE_CHOICE' || type === 'MULTIPLE_CHOICE') {
      const options = question.options as Record<string, string> | null | undefined
      if (options) {
        const validKeys = Object.keys(options)
        const answerKeys = Array.isArray(answer) ? answer : [answer]

        for (const key of answerKeys) {
          if (typeof key === 'string' && !validKeys.includes(key)) {
            return {
              type: 'WARNING',
              category: 'MISSING_ANSWER',
              message: `答案 "${key}" 不在选项列表中`,
              field: 'answer',
              metadata: { invalidAnswer: key, validOptions: validKeys },
            }
          }
        }
      }
    }

    return null
  }

  /**
   * 检查 LaTeX 语法
   */
  private async checkLatex(content: string): Promise<QualityIssue | null> {
    try {
      // 动态导入 KaTeX（仅在需要时加载）
      const katex = await import('katex')

      // 提取所有 LaTeX 表达式
      const latexMatches = content.match(/\$\$?([^$]+)\$\$?/g)

      if (!latexMatches) {
        return null
      }

      const errors: string[] = []

      for (const match of latexMatches) {
        const latex = match.replace(/^\$+|\$+$/g, '').trim()
        if (!latex) continue

        try {
          katex.default.renderToString(latex, {
            throwOnError: true,
            strict: false,
          })
        } catch (error) {
          errors.push(`"${latex.substring(0, 30)}${latex.length > 30 ? '...' : ''}"`)
        }
      }

      if (errors.length > 0) {
        return {
          type: 'WARNING',
          category: 'INVALID_LATEX',
          message: `LaTeX 语法可能有误: ${errors.slice(0, 3).join(', ')}${errors.length > 3 ? ` 等 ${errors.length} 处` : ''}`,
          field: 'content',
          metadata: { errorCount: errors.length, samples: errors.slice(0, 3) },
        }
      }

      return null
    } catch {
      // KaTeX 加载失败，跳过检查
      return null
    }
  }

  /**
   * 提取图片 URL
   */
  private extractImageUrls(content: string): string[] {
    // Markdown 图片语法: ![alt](url)
    const markdownRegex = /!\[.*?\]\((https?:\/\/[^)]+)\)/g
    // HTML img 标签: <img src="url">
    const htmlRegex = /<img[^>]+src=["'](https?:\/\/[^"']+)["'][^>]*>/g

    const urls: string[] = []

    let match
    while ((match = markdownRegex.exec(content)) !== null) {
      urls.push(match[1])
    }
    while ((match = htmlRegex.exec(content)) !== null) {
      urls.push(match[1])
    }

    return [...new Set(urls)] // 去重
  }

  /**
   * 检查图片链接有效性
   */
  private async checkImages(urls: string[]): Promise<QualityIssue[]> {
    if (urls.length === 0) {
      return []
    }

    const issues: QualityIssue[] = []

    const results = await Promise.all(
      urls.map(async (url) => {
        const exists = await this.checkImageExists(url)
        return { url, exists }
      })
    )

    for (const { url, exists } of results) {
      if (!exists) {
        issues.push({
          type: 'ERROR',
          category: 'BROKEN_IMAGE',
          message: `图片链接失效: ${url.substring(0, 50)}${url.length > 50 ? '...' : ''}`,
          field: 'content',
          metadata: { url },
        })
      }
    }

    return issues
  }

  /**
   * 检查单个图片是否存在
   */
  private async checkImageExists(url: string): Promise<boolean> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), IMAGE_CHECK_TIMEOUT)

      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      return response.ok
    } catch {
      return false
    }
  }

  /**
   * 检查是否有有效的解析
   */
  private hasValidExplanation(question: QualityCheckInput): boolean {
    const explanation =
      'explanation' in question ? question.explanation : undefined
    return typeof explanation === 'string' && explanation.trim().length >= 10
  }

  /**
   * 检查是否有有效的标签
   */
  private hasValidTags(question: QualityCheckInput): boolean {
    if ('suggestedTags' in question) {
      const tags = question.suggestedTags
      return Array.isArray(tags) && tags.length > 0
    }
    return false
  }

  /**
   * 生成改进建议
   */
  private generateSuggestions(issues: QualityIssue[]): string[] {
    const suggestions: string[] = []
    const categories = new Set(issues.map((i) => i.category))

    if (categories.has('MISSING_CONTENT')) {
      suggestions.push('请补充完整的题目内容')
    }

    if (categories.has('INSUFFICIENT_OPTIONS')) {
      suggestions.push('请确保选择题有至少 2 个有效选项')
    }

    if (categories.has('MISSING_ANSWER')) {
      suggestions.push('请提供正确答案')
    }

    if (categories.has('INVALID_LATEX')) {
      suggestions.push('请检查并修正 LaTeX 公式语法')
    }

    if (categories.has('BROKEN_IMAGE')) {
      suggestions.push('请修复失效的图片链接或重新上传图片')
    }

    if (categories.has('NO_KNOWLEDGE_POINTS')) {
      suggestions.push('建议添加至少 1 个知识点标签')
    }

    return suggestions
  }
}

// ==================== 便捷函数导出 ====================

/**
 * 创建默认配置的质量检查器实例
 */
export function createQualityChecker(
  config?: QualityCheckConfig,
  knowledgePointChecker?: KnowledgePointChecker
): QuestionQualityChecker {
  return new QuestionQualityChecker(config, knowledgePointChecker)
}

/**
 * 快速计算单个题目的质量分数（不执行网络请求）
 * 适用于导入流程中的快速评估
 */
export function calculateQuickQualityScore(question: QualityCheckInput): number {
  const checker = new QuestionQualityChecker({
    checkLatex: false,
    checkImages: false,
  })
  return checker.calculateQuickScore(question)
}

/**
 * 完整检查单个题目的质量
 */
export async function checkQuestionQuality(
  question: QualityCheckInput,
  config?: QualityCheckConfig
): Promise<ExtendedQualityCheckResult> {
  const checker = new QuestionQualityChecker(config)
  return checker.check(question)
}
