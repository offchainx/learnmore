/**
 * OCR 服务主类
 * Story-044: Task B1 - OCR服务集成
 *
 * 统一管理多个 OCR 提供商，实现自动降级、成本控制和配额管理
 */

import {
  GoogleVisionProvider,
  MathpixProvider,
  TesseractProvider,
  MockOCRProvider,
  BaseOCRProvider,
} from './providers'
import type {
  OCRProviderName,
  OCRResult,
  OCRServiceConfig,
  ImageProcessOptions,
  BatchProcessOptions,
  QuotaStatus,
  OCRUsageStats,
} from './types/ocr'
import { OCRError } from './types/ocr'
import type { PDFProcessOptions } from './types/pdf'
import { convertPDFToImages } from './pdf-utils'

/**
 * 默认配置
 *
 * ⚠️ 开发环境使用 Mock OCR（无需 API key）
 * 生产环境需要配置真实的 OCR 提供商
 */
const DEFAULT_CONFIG: OCRServiceConfig = {
  // 开发环境优先使用 Mock，生产环境使用真实提供商
  providerPriority: process.env.NODE_ENV === 'development'
    ? ['mock']
    : ['mathpix', 'google_vision', 'tesseract', 'mock'],
  minConfidence: 0.85,
  maxPagesPerRequest: 50,
  concurrency: 3,
  dailyCostLimit: 10, // $10/天
  dailyRequestLimit: 1000,
  debug: process.env.NODE_ENV === 'development',
  providers: {},
}

/**
 * 内存中的配额跟踪（生产环境应使用 Redis）
 */
interface QuotaTracker {
  date: string
  requests: number
  cost: number
  byProvider: Record<OCRProviderName, { requests: number; cost: number }>
}

/**
 * OCR 服务
 *
 * 使用示例:
 * ```typescript
 * const ocrService = new OCRService()
 *
 * // 处理单张图片
 * const result = await ocrService.processImage(imageUrl)
 *
 * // 处理 PDF
 * const results = await ocrService.processPDF(pdfUrl, { dpi: 150 })
 *
 * // 指定提供商
 * const result = await ocrService.processImage(imageUrl, { provider: 'mathpix' })
 * ```
 */
export class OCRService {
  private config: OCRServiceConfig
  private providers: Map<OCRProviderName, BaseOCRProvider>
  private quotaTracker: QuotaTracker

  constructor(config?: Partial<OCRServiceConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.providers = this.initializeProviders()
    this.quotaTracker = this.initializeQuotaTracker()
  }

  // ==================== 公开方法 ====================

  /**
   * 处理单张图片
   * 自动选择最佳提供商，置信度不足时降级
   */
  async processImage(
    imageSource: string,
    options?: ImageProcessOptions
  ): Promise<OCRResult> {
    // 检查配额
    const quotaCheck = this.checkQuota(options?.maxCost)
    if (!quotaCheck.allowed) {
      throw new OCRError('QUOTA_EXCEEDED', quotaCheck.reason!, undefined)
    }

    // 获取提供商列表
    const providersToTry = this.getProvidersToTry(options?.provider)

    if (providersToTry.length === 0) {
      throw new OCRError(
        'ALL_PROVIDERS_FAILED',
        '没有可用的 OCR 提供商，请检查 API 配置',
        undefined
      )
    }

    // 依次尝试每个提供商
    const errors: string[] = []

    for (const provider of providersToTry) {
      try {
        if (this.config.debug) {
          console.log(`[OCR] 尝试使用 ${provider.name}...`)
        }

        const result = await provider.processImage(imageSource, options)

        if (result.success) {
          // 检查置信度
          if (result.confidence >= this.config.minConfidence) {
            // 更新配额
            this.updateQuota(provider.name, result.estimatedCost)

            if (this.config.debug) {
              console.log(
                `[OCR] ${provider.name} 成功，置信度: ${(result.confidence * 100).toFixed(1)}%`
              )
            }

            return result
          }

          // 置信度不足，尝试下一个提供商
          if (this.config.debug) {
            console.log(
              `[OCR] ${provider.name} 置信度不足: ${(result.confidence * 100).toFixed(1)}% < ${(this.config.minConfidence * 100).toFixed(1)}%`
            )
          }

          errors.push(
            `${provider.name}: 置信度不足 (${(result.confidence * 100).toFixed(1)}%)`
          )
        } else {
          errors.push(`${provider.name}: ${result.error}`)
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : '未知错误'
        errors.push(`${provider.name}: ${message}`)

        if (this.config.debug) {
          console.error(`[OCR] ${provider.name} 失败:`, error)
        }
      }
    }

    // 所有提供商都失败
    throw new OCRError(
      'ALL_PROVIDERS_FAILED',
      `所有 OCR 提供商都失败:\n${errors.join('\n')}`,
      undefined
    )
  }

  /**
   * 处理 PDF 文档
   * 先将 PDF 转换为图片，再逐页 OCR
   */
  async processPDF(
    pdfSource: string | ArrayBuffer,
    options?: PDFProcessOptions
  ): Promise<OCRResult[]> {
    const startTime = Date.now()
    
    // 1. 获取 PDF 数据
    let pdfBuffer: ArrayBuffer
    if (typeof pdfSource === 'string') {
      if (pdfSource.startsWith('http')) {
        const response = await fetch(pdfSource)
        if (!response.ok) {
          throw new OCRError('DOWNLOAD_FAILED', `无法下载 PDF: ${response.statusText}`, undefined)
        }
        pdfBuffer = await response.arrayBuffer()
      } else {
        // 假设是本地路径或 base64，这里暂且只支持 URL 或 buffer
         throw new OCRError('INVALID_SOURCE', '目前仅支持 URL 或 ArrayBuffer 形式的 PDF', undefined)
      }
    } else {
      pdfBuffer = pdfSource
    }

    // 2. 转换为图片
    if (this.config.debug) {
      console.log('[OCR] 开始转换 PDF 为图片...')
    }
    
    // 如果没有 pdfjs-dist，这里会报错，但已经在 pdf-utils 中导入了
    const images = await convertPDFToImages(pdfBuffer, { 
      scale: options?.dpi ? options.dpi / 72 : 2.0 
    })

    if (this.config.debug) {
      console.log(`[OCR] PDF 转换完成，共 ${images.length} 页`)
    }

    // 3. 限制处理页数
    const maxPages = options?.maxPages ?? this.config.maxPagesPerRequest
    const imagesToProcess = images.slice(0, maxPages)

    if (images.length > maxPages && this.config.debug) {
      console.warn(`[OCR] PDF 页数 (${images.length}) 超过限制 (${maxPages})，仅处理前 ${maxPages} 页`)
    }

    // 4. 批量 OCR
    // 使用 batchProcess 来处理这些图片
    const imageUrls = imagesToProcess.map(img => img.dataUrl)
    
    return this.batchProcess(imageUrls, {
      ...options,
      onProgress: (current, total, result) => {
        if (this.config.debug) {
          console.log(`[OCR] 处理进度: ${current}/${total}`)
        }
        if (options?.onProgress) {
          options.onProgress(current, total, result)
        }
      }
    })
  }

  /**
   * 批量处理图片
   */
  async batchProcess(
    imageSources: string[],
    options?: BatchProcessOptions
  ): Promise<OCRResult[]> {
    const results: OCRResult[] = []
    let totalCost = 0
    const maxTotalCost = options?.maxTotalCost ?? this.config.dailyCostLimit

    for (let i = 0; i < imageSources.length; i++) {
      // 检查成本限制
      if (totalCost >= maxTotalCost) {
        if (this.config.debug) {
          console.log(`[OCR] 达到成本上限 $${maxTotalCost}，停止处理`)
        }
        break
      }

      try {
        const result = await this.processImage(imageSources[i], {
          ...options,
          maxCost: maxTotalCost - totalCost,
        })

        results.push(result)
        totalCost += result.estimatedCost

        // 进度回调
        if (options?.onProgress) {
          options.onProgress(i + 1, imageSources.length, result)
        }
      } catch (error) {
        if (options?.continueOnError) {
          // 创建失败结果
          const failedResult: OCRResult = {
            success: false,
            provider: 'mock' as OCRProviderName,
            text: '',
            pages: [],
            confidence: 0,
            processingTime: 0,
            estimatedCost: 0,
            error: error instanceof Error ? error.message : '处理失败',
          }
          results.push(failedResult)

          if (options?.onProgress) {
            options.onProgress(i + 1, imageSources.length, failedResult)
          }
        } else {
          throw error
        }
      }
    }

    return results
  }

  /**
   * 获取配额状态
   */
  getQuotaStatus(): QuotaStatus {
    const today = this.getTodayString()

    // 如果日期变了，重置配额
    if (this.quotaTracker.date !== today) {
      this.quotaTracker = this.initializeQuotaTracker()
    }

    const isQuotaExceeded =
      this.quotaTracker.requests >= this.config.dailyRequestLimit ||
      this.quotaTracker.cost >= this.config.dailyCostLimit

    // 计算重置时间（明天 0 点）
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    return {
      dailyRequestsUsed: this.quotaTracker.requests,
      dailyRequestLimit: this.config.dailyRequestLimit,
      dailyCostUsed: this.quotaTracker.cost,
      dailyCostLimit: this.config.dailyCostLimit,
      isQuotaExceeded,
      resetAt: tomorrow,
    }
  }

  /**
   * 获取使用统计
   */
  getUsageStats(): OCRUsageStats {
    const { date, requests, cost, byProvider } = this.quotaTracker

    const requestsByProvider: Record<OCRProviderName, number> = {
      google_vision: byProvider.google_vision?.requests ?? 0,
      mathpix: byProvider.mathpix?.requests ?? 0,
      tesseract: byProvider.tesseract?.requests ?? 0,
      mock: byProvider.mock?.requests ?? 0,
    }

    const costByProvider: Record<OCRProviderName, number> = {
      google_vision: byProvider.google_vision?.cost ?? 0,
      mathpix: byProvider.mathpix?.cost ?? 0,
      tesseract: byProvider.tesseract?.cost ?? 0,
      mock: byProvider.mock?.cost ?? 0,
    }

    return {
      date,
      requestsByProvider,
      costByProvider,
      totalRequests: requests,
      totalCost: cost,
      totalPages: requests, // 简化：1 请求 = 1 页
      averageConfidence: 0.9, // TODO: 实际跟踪
    }
  }

  /**
   * 获取可用的提供商列表
   */
  getAvailableProviders(): OCRProviderName[] {
    return Array.from(this.providers.entries())
      .filter(([, provider]) => provider.isConfigured)
      .map(([name]) => name)
  }

  /**
   * 检查特定提供商是否可用
   */
  async checkProviderAvailability(
    providerName: OCRProviderName
  ): Promise<boolean> {
    const provider = this.providers.get(providerName)
    if (!provider) return false
    return provider.checkAvailability()
  }

  // ==================== 私有方法 ====================

  /**
   * 初始化所有提供商
   */
  private initializeProviders(): Map<OCRProviderName, BaseOCRProvider> {
    const providers = new Map<OCRProviderName, BaseOCRProvider>()

    // Google Vision
    providers.set(
      'google_vision',
      new GoogleVisionProvider(this.config.providers.googleVision)
    )

    // Mathpix
    providers.set('mathpix', new MathpixProvider(this.config.providers.mathpix))

    // Tesseract (本地降级)
    providers.set(
      'tesseract',
      new TesseractProvider(this.config.providers.tesseract)
    )

    return providers
  }

  /**
   * 初始化配额跟踪器
   */
  private initializeQuotaTracker(): QuotaTracker {
    return {
      date: this.getTodayString(),
      requests: 0,
      cost: 0,
      byProvider: {
        google_vision: { requests: 0, cost: 0 },
        mathpix: { requests: 0, cost: 0 },
        tesseract: { requests: 0, cost: 0 },
        mock: { requests: 0, cost: 0 },
      },
    }
  }

  /**
   * 获取今天的日期字符串
   */
  private getTodayString(): string {
    return new Date().toISOString().split('T')[0]
  }

  /**
   * 检查配额
   */
  private checkQuota(maxCost?: number): { allowed: boolean; reason?: string } {
    const today = this.getTodayString()

    // 日期变化，重置配额
    if (this.quotaTracker.date !== today) {
      this.quotaTracker = this.initializeQuotaTracker()
    }

    // 检查请求数
    if (this.quotaTracker.requests >= this.config.dailyRequestLimit) {
      return {
        allowed: false,
        reason: `已达到每日请求上限 (${this.config.dailyRequestLimit} 次)`,
      }
    }

    // 检查成本
    if (this.quotaTracker.cost >= this.config.dailyCostLimit) {
      return {
        allowed: false,
        reason: `已达到每日成本上限 ($${this.config.dailyCostLimit})`,
      }
    }

    // 检查单次成本限制
    if (maxCost !== undefined && maxCost <= 0) {
      return {
        allowed: false,
        reason: '成本预算不足',
      }
    }

    return { allowed: true }
  }

  /**
   * 更新配额
   */
  private updateQuota(providerName: OCRProviderName, cost: number): void {
    this.quotaTracker.requests += 1
    this.quotaTracker.cost += cost

    if (!this.quotaTracker.byProvider[providerName]) {
      this.quotaTracker.byProvider[providerName] = { requests: 0, cost: 0 }
    }

    this.quotaTracker.byProvider[providerName].requests += 1
    this.quotaTracker.byProvider[providerName].cost += cost
  }

  /**
   * 获取要尝试的提供商列表
   */
  private getProvidersToTry(
    preferredProvider?: OCRProviderName
  ): BaseOCRProvider[] {
    const result: BaseOCRProvider[] = []

    // 如果指定了特定提供商
    if (preferredProvider) {
      const provider = this.providers.get(preferredProvider)
      if (provider?.isConfigured) {
        return [provider]
      }
      // 指定的提供商不可用，回退到默认优先级
    }

    // 按优先级顺序添加已配置的提供商
    for (const name of this.config.providerPriority) {
      const provider = this.providers.get(name)
      if (provider?.isConfigured) {
        result.push(provider)
      }
    }

    // 添加未在优先级列表中但已配置的提供商
    for (const [name, provider] of this.providers) {
      if (provider.isConfigured && !this.config.providerPriority.includes(name)) {
        result.push(provider)
      }
    }

    return result
  }
}

// 导出单例（可选）
let defaultOCRService: OCRService | null = null

/**
 * 获取默认 OCR 服务实例
 */
export function getOCRService(): OCRService {
  if (!defaultOCRService) {
    defaultOCRService = new OCRService()
  }
  return defaultOCRService
}

/**
 * 重置默认 OCR 服务实例（用于测试）
 */
export function resetOCRService(): void {
  defaultOCRService = null
}
