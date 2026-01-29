/**
 * Mathpix OCR Provider
 * Story-044: Task B1 - OCR服务集成
 *
 * 专门用于识别数学公式的 OCR 服务
 * 文档: https://docs.mathpix.com/
 */

import { BaseOCRProvider } from './base-provider'
import type {
  OCRResult,
  PageOCRResult,
  TextBlock,
  ImageProcessOptions,
  MathpixConfig,
} from '../ocr-types'
import { OCRError } from '../ocr-types'

/**
 * Mathpix API 响应类型
 */
interface MathpixResponse {
  text?: string
  latex_styled?: string
  latex?: string
  confidence?: number
  confidence_rate?: number
  error?: string
  error_info?: {
    id: string
    message: string
  }
}

/**
 * Mathpix OCR Provider
 *
 * 专门用于识别数学公式，输出 LaTeX 格式
 * 成本: $0.004 / 请求
 */
export class MathpixProvider extends BaseOCRProvider {
  readonly name = 'mathpix' as const
  readonly costPerPage = 0.004 // $4 / 1000 requests

  private appId: string | null
  private appKey: string | null
  private config: MathpixConfig

  constructor(config?: Partial<MathpixConfig>) {
    super()
    this.appId = config?.appId ?? process.env.MATHPIX_APP_ID ?? null
    this.appKey = config?.appKey ?? process.env.MATHPIX_APP_KEY ?? null
    this.config = {
      appId: this.appId ?? '',
      appKey: this.appKey ?? '',
      formats: config?.formats ?? ['text', 'latex'],
    }
  }

  get isConfigured(): boolean {
    return !!this.appId && !!this.appKey && this.appId.length > 0 && this.appKey.length > 0
  }

  /**
   * 处理单张图片
   */
  async processImage(
    imageSource: string,
    options?: ImageProcessOptions
  ): Promise<OCRResult> {
    const startTime = Date.now()

    // 检查配置
    if (!this.isConfigured) {
      return this.createFailureResult(
        'Mathpix API 未配置 (需要 MATHPIX_APP_ID 和 MATHPIX_APP_KEY)',
        Date.now() - startTime
      )
    }

    try {
      // 准备图片数据
      let imageData: string

      if (this.isBase64Image(imageSource)) {
        imageData = imageSource
      } else if (this.isUrl(imageSource)) {
        imageData = await this.urlToBase64(imageSource)
      } else {
        throw new OCRError('INVALID_IMAGE', '无效的图片源', this.name)
      }

      // 调用 API
      const timeout = options?.timeout ?? 30000
      const response = await this.withTimeout(
        this.callApi(imageData),
        timeout,
        'Mathpix API 请求超时'
      )

      // 解析响应
      const result = this.parseResponse(response, startTime)

      return result
    } catch (error) {
      if (error instanceof OCRError) {
        return this.createFailureResult(error.message, Date.now() - startTime)
      }

      const message = error instanceof Error ? error.message : '未知错误'
      return this.createFailureResult(
        `Mathpix 处理失败: ${message}`,
        Date.now() - startTime
      )
    }
  }

  /**
   * 检查可用性
   */
  async checkAvailability(): Promise<boolean> {
    if (!this.isConfigured) return false

    try {
      // 发送一个简单的请求测试 API
      const response = await fetch('https://api.mathpix.com/v3/text', {
        method: 'POST',
        headers: {
          app_id: this.appId!,
          app_key: this.appKey!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          formats: ['text'],
        }),
      })

      return response.ok || response.status === 400 // 400 可能是图片太小，但说明 API 可用
    } catch {
      return false
    }
  }

  // ==================== 私有方法 ====================

  /**
   * 调用 Mathpix API
   */
  private async callApi(imageData: string): Promise<MathpixResponse> {
    const response = await fetch('https://api.mathpix.com/v3/text', {
      method: 'POST',
      headers: {
        app_id: this.appId!,
        app_key: this.appKey!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        src: imageData,
        formats: this.config.formats,
        data_options: {
          include_asciimath: false,
          include_latex: true,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new OCRError(
        'API_ERROR',
        `Mathpix API 错误: ${response.status} - ${errorText}`,
        this.name
      )
    }

    return response.json()
  }

  /**
   * 解析 API 响应
   */
  private parseResponse(
    response: MathpixResponse,
    startTime: number
  ): OCRResult {
    const processingTime = Date.now() - startTime

    // 检查错误
    if (response.error || response.error_info) {
      const errorMsg = response.error_info?.message || response.error || '未知错误'
      return this.createFailureResult(`Mathpix API 错误: ${errorMsg}`, processingTime)
    }

    // 获取识别结果
    // 优先使用 latex_styled（带样式的 LaTeX），其次是 latex，最后是纯文本
    const text = response.latex_styled || response.latex || response.text || ''
    const confidence = response.confidence ?? response.confidence_rate ?? 0.9

    // 创建文本块
    const blocks: TextBlock[] = []

    if (text) {
      blocks.push({
        text,
        confidence,
        blockIndex: 0,
        pageNumber: 1,
      })
    }

    const pageResult: PageOCRResult = {
      pageNumber: 1,
      text,
      blocks,
      confidence,
      processingTime,
    }

    return {
      success: true,
      provider: this.name,
      text,
      pages: [pageResult],
      confidence,
      processingTime,
      estimatedCost: this.costPerPage,
      rawResponse: response,
    }
  }
}
