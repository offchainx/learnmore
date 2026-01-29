/**
 * Google Vision OCR Provider
 * Story-044: Task B1 - OCR服务集成
 *
 * 使用 Google Cloud Vision API 进行 OCR 识别
 * 文档: https://cloud.google.com/vision/docs/ocr
 */

import { BaseOCRProvider } from './base-provider'
import type {
  OCRResult,
  PageOCRResult,
  TextBlock,
  ImageProcessOptions,
  GoogleVisionConfig,
} from '../ocr-types'
import { OCRError } from '../ocr-types'

/**
 * Google Vision API 响应类型
 */
interface GoogleVisionResponse {
  responses: Array<{
    fullTextAnnotation?: {
      text: string
      pages: Array<{
        blocks: Array<{
          paragraphs: Array<{
            words: Array<{
              symbols: Array<{
                text: string
                confidence: number
              }>
              boundingBox?: {
                vertices: Array<{ x: number; y: number }>
              }
            }>
            confidence: number
          }>
          confidence: number
          boundingBox?: {
            vertices: Array<{ x: number; y: number }>
          }
        }>
      }>
    }
    textAnnotations?: Array<{
      description: string
      boundingPoly?: {
        vertices: Array<{ x: number; y: number }>
      }
    }>
    error?: {
      code: number
      message: string
    }
  }>
}

/**
 * Google Vision OCR Provider
 *
 * 主力 OCR 提供商，支持多语言（中文+英文）
 * 成本: $1.50 / 1000 次请求
 */
export class GoogleVisionProvider extends BaseOCRProvider {
  readonly name = 'google_vision' as const
  readonly costPerPage = 0.0015 // $1.50 / 1000 requests

  private apiKey: string | null
  private config: GoogleVisionConfig

  constructor(config?: Partial<GoogleVisionConfig>) {
    super()
    this.apiKey = config?.apiKey ?? process.env.GOOGLE_CLOUD_VISION_API_KEY ?? null
    this.config = {
      apiKey: this.apiKey ?? '',
      languageHints: config?.languageHints ?? ['zh-Hans', 'en'],
      useDocumentTextDetection: config?.useDocumentTextDetection ?? true,
    }
  }

  get isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.length > 0
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
        'Google Vision API Key 未配置',
        Date.now() - startTime
      )
    }

    try {
      // 准备图片数据
      let imageContent: string

      if (this.isBase64Image(imageSource)) {
        imageContent = this.extractBase64Data(imageSource)
      } else if (this.isUrl(imageSource)) {
        // 从 URL 获取图片并转为 Base64
        const base64 = await this.urlToBase64(imageSource)
        imageContent = this.extractBase64Data(base64)
      } else {
        throw new OCRError('INVALID_IMAGE', '无效的图片源', this.name)
      }

      // 构建请求
      const requestBody = this.buildRequest(imageContent, options)

      // 调用 API
      const timeout = options?.timeout ?? 30000
      const response = await this.withTimeout(
        this.callApi(requestBody),
        timeout,
        'Google Vision API 请求超时'
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
        `Google Vision 处理失败: ${message}`,
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
      // 使用一个最小的请求测试 API
      const testImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requests: [
              {
                image: { content: testImage },
                features: [{ type: 'TEXT_DETECTION', maxResults: 1 }],
              },
            ],
          }),
        }
      )

      return response.ok
    } catch {
      return false
    }
  }

  // ==================== 私有方法 ====================

  /**
   * 构建 API 请求体
   */
  private buildRequest(
    imageContent: string,
    options?: ImageProcessOptions
  ): object {
    const languageHints = options?.languageHints ?? this.config.languageHints

    // 选择检测类型
    // DOCUMENT_TEXT_DETECTION: 适合文档，保留格式
    // TEXT_DETECTION: 通用文本检测
    const featureType = this.config.useDocumentTextDetection
      ? 'DOCUMENT_TEXT_DETECTION'
      : 'TEXT_DETECTION'

    return {
      requests: [
        {
          image: {
            content: imageContent,
          },
          features: [
            {
              type: featureType,
              maxResults: 50,
            },
          ],
          imageContext: {
            languageHints,
          },
        },
      ],
    }
  }

  /**
   * 调用 Google Vision API
   */
  private async callApi(requestBody: object): Promise<GoogleVisionResponse> {
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new OCRError(
        'API_ERROR',
        `Google Vision API 错误: ${response.status} - ${errorText}`,
        this.name
      )
    }

    return response.json()
  }

  /**
   * 解析 API 响应
   */
  private parseResponse(
    response: GoogleVisionResponse,
    startTime: number
  ): OCRResult {
    const processingTime = Date.now() - startTime

    // 检查是否有错误
    const firstResponse = response.responses?.[0]
    if (firstResponse?.error) {
      return this.createFailureResult(
        `API 错误: ${firstResponse.error.message}`,
        processingTime
      )
    }

    // 优先使用 fullTextAnnotation（更准确）
    if (firstResponse?.fullTextAnnotation) {
      const fullText = firstResponse.fullTextAnnotation
      const blocks: TextBlock[] = []
      let blockIndex = 0

      // 解析所有文本块
      for (const page of fullText.pages || []) {
        for (const block of page.blocks || []) {
          let blockText = ''

          for (const paragraph of block.paragraphs || []) {
            for (const word of paragraph.words || []) {
              const wordText = word.symbols.map((s) => s.text).join('')
              blockText += wordText
            }
            blockText += '\n'
          }

          // 提取边界框
          let boundingBox: [number, number, number, number] | undefined
          if (block.boundingBox?.vertices) {
            const vertices = block.boundingBox.vertices
            const minX = Math.min(...vertices.map((v) => v.x || 0))
            const minY = Math.min(...vertices.map((v) => v.y || 0))
            const maxX = Math.max(...vertices.map((v) => v.x || 0))
            const maxY = Math.max(...vertices.map((v) => v.y || 0))
            boundingBox = [minX, minY, maxX - minX, maxY - minY]
          }

          blocks.push({
            text: blockText.trim(),
            confidence: block.confidence || 0.9,
            boundingBox,
            blockIndex: blockIndex++,
            pageNumber: 1,
          })
        }
      }

      const pageResult: PageOCRResult = {
        pageNumber: 1,
        text: fullText.text,
        blocks,
        confidence: this.calculateAverageConfidence(blocks),
        processingTime,
      }

      return this.createSuccessResult([pageResult], processingTime, response)
    }

    // 回退到 textAnnotations
    if (firstResponse?.textAnnotations?.length) {
      const annotations = firstResponse.textAnnotations
      // 第一个 annotation 是完整文本
      const fullText = annotations[0].description

      const blocks: TextBlock[] = annotations.slice(1).map((ann, index) => {
        let boundingBox: [number, number, number, number] | undefined
        if (ann.boundingPoly?.vertices) {
          const vertices = ann.boundingPoly.vertices
          const minX = Math.min(...vertices.map((v) => v.x || 0))
          const minY = Math.min(...vertices.map((v) => v.y || 0))
          const maxX = Math.max(...vertices.map((v) => v.x || 0))
          const maxY = Math.max(...vertices.map((v) => v.y || 0))
          boundingBox = [minX, minY, maxX - minX, maxY - minY]
        }

        return {
          text: ann.description,
          confidence: 0.9, // textAnnotations 不提供置信度
          boundingBox,
          blockIndex: index,
          pageNumber: 1,
        }
      })

      const pageResult: PageOCRResult = {
        pageNumber: 1,
        text: fullText,
        blocks,
        confidence: 0.9,
        processingTime,
      }

      return this.createSuccessResult([pageResult], processingTime, response)
    }

    // 没有识别到文本
    return {
      success: true,
      provider: this.name,
      text: '',
      pages: [
        {
          pageNumber: 1,
          text: '',
          blocks: [],
          confidence: 1,
          processingTime,
        },
      ],
      confidence: 1,
      processingTime,
      estimatedCost: this.costPerPage,
      rawResponse: response,
    }
  }
}
