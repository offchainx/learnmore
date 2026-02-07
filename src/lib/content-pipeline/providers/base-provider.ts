/**
 * OCR Provider 抽象基类
 * Story-044: Task B1 - OCR服务集成
 *
 * 所有 OCR 提供商必须继承此基类
 */

import type {
  OCRProviderName,
  OCRResult,
  PageOCRResult,
  TextBlock,
  ImageProcessOptions,
} from '../types/ocr'
import { OCRError } from '../types/ocr'

/**
 * OCR Provider 抽象基类
 */
export abstract class BaseOCRProvider {
  /** 提供商名称 */
  abstract readonly name: OCRProviderName

  /** 每页估算成本 (美元) */
  abstract readonly costPerPage: number

  /** 是否已配置 */
  abstract readonly isConfigured: boolean

  /**
   * 处理单张图片（子类必须实现）
   */
  abstract processImage(
    imageSource: string,
    options?: ImageProcessOptions
  ): Promise<OCRResult>

  /**
   * 检查提供商可用性（子类可重写）
   */
  async checkAvailability(): Promise<boolean> {
    return this.isConfigured
  }

  // ==================== 工具方法 ====================

  /**
   * 判断是否为 Base64 图片
   */
  protected isBase64Image(source: string): boolean {
    return source.startsWith('data:image/')
  }

  /**
   * 判断是否为 URL
   */
  protected isUrl(source: string): boolean {
    try {
      new URL(source)
      return true
    } catch {
      return false
    }
  }

  /**
   * 从 Base64 字符串提取纯数据部分
   */
  protected extractBase64Data(base64String: string): string {
    const match = base64String.match(/^data:image\/\w+;base64,(.+)$/)
    return match ? match[1] : base64String
  }

  /**
   * 从 URL 获取图片并转为 Base64
   */
  protected async urlToBase64(url: string): Promise<string> {
    const response = await fetch(url)
    if (!response.ok) {
      throw new OCRError(
        'NETWORK_ERROR',
        `无法获取图片: ${response.status} ${response.statusText}`,
        this.name
      )
    }

    const arrayBuffer = await response.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const contentType = response.headers.get('content-type') || 'image/png'

    return `data:${contentType};base64,${base64}`
  }

  /**
   * 计算文本块的平均置信度
   */
  protected calculateAverageConfidence(blocks: TextBlock[]): number {
    if (blocks.length === 0) return 0
    const sum = blocks.reduce((acc, block) => acc + block.confidence, 0)
    return sum / blocks.length
  }

  /**
   * 合并多个文本块为完整文本
   */
  protected mergeBlocksToText(blocks: TextBlock[]): string {
    return blocks.map((block) => block.text).join('\n')
  }

  /**
   * 创建成功的 OCR 结果
   */
  protected createSuccessResult(
    pages: PageOCRResult[],
    processingTime: number,
    rawResponse?: unknown
  ): OCRResult {
    const allBlocks = pages.flatMap((p) => p.blocks)
    const confidence = this.calculateAverageConfidence(allBlocks)
    const estimatedCost = pages.length * this.costPerPage

    return {
      success: true,
      provider: this.name,
      text: pages.map((p) => p.text).join('\n\n'),
      pages,
      confidence,
      processingTime,
      estimatedCost,
      rawResponse,
    }
  }

  /**
   * 创建失败的 OCR 结果
   */
  protected createFailureResult(
    error: string,
    processingTime: number
  ): OCRResult {
    return {
      success: false,
      provider: this.name,
      text: '',
      pages: [],
      confidence: 0,
      processingTime,
      estimatedCost: 0,
      error,
    }
  }

  /**
   * 创建单页结果
   */
  protected createPageResult(
    pageNumber: number,
    text: string,
    blocks: TextBlock[],
    processingTime: number
  ): PageOCRResult {
    return {
      pageNumber,
      text,
      blocks,
      confidence: this.calculateAverageConfidence(blocks),
      processingTime,
    }
  }

  /**
   * 带超时的 Promise
   */
  protected async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    errorMessage = '操作超时'
  ): Promise<T> {
    let timeoutId: NodeJS.Timeout

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new OCRError('TIMEOUT', errorMessage, this.name))
      }, timeoutMs)
    })

    try {
      const result = await Promise.race([promise, timeoutPromise])
      clearTimeout(timeoutId!)
      return result
    } catch (error) {
      clearTimeout(timeoutId!)
      throw error
    }
  }

  /**
   * 带重试的操作
   */
  protected async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000
  ): Promise<T> {
    let lastError: Error | undefined

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))

        // 如果是配额超限或配置错误，不重试
        if (
          error instanceof OCRError &&
          ['QUOTA_EXCEEDED', 'PROVIDER_NOT_CONFIGURED'].includes(error.code)
        ) {
          throw error
        }

        // 最后一次尝试失败，抛出错误
        if (attempt === maxRetries) {
          throw lastError
        }

        // 等待后重试（指数退避）
        await this.delay(delayMs * attempt)
      }
    }

    throw lastError
  }

  /**
   * 延迟
   */
  protected delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
