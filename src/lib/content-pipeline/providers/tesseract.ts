/**
 * Tesseract OCR Provider
 * Story-044: Task B1 - OCR服务集成
 *
 * 使用 Tesseract.js 进行本地 OCR 识别（降级方案）
 * 文档: https://tesseract.projectnaptha.com/
 *
 * 特点:
 * - 完全本地运行，无需 API 密钥
 * - 免费，无成本
 * - 支持多语言（需要下载语言包）
 * - 识别质量相对较低，作为最后的降级方案
 */

import { BaseOCRProvider } from './base-provider'
import type {
  OCRResult,
  PageOCRResult,
  TextBlock,
  ImageProcessOptions,
  TesseractConfig,
} from '../ocr-types'
import { OCRError } from '../ocr-types'

// 动态导入 Tesseract.js（避免服务端/客户端问题）
let Tesseract: typeof import('tesseract.js') | null = null

/**
 * 动态加载 Tesseract.js
 */
async function loadTesseract(): Promise<typeof import('tesseract.js')> {
  if (!Tesseract) {
    Tesseract = await import('tesseract.js')
  }
  return Tesseract
}

/**
 * Tesseract OCR Provider
 *
 * 本地 OCR 降级方案，完全免费
 * 成本: $0 (本地运行)
 */
export class TesseractProvider extends BaseOCRProvider {
  readonly name = 'tesseract' as const
  readonly costPerPage = 0 // 免费

  private config: TesseractConfig

  constructor(config?: Partial<TesseractConfig>) {
    super()
    this.config = {
      // 默认使用简体中文 + 英文
      lang: config?.lang ?? 'chi_sim+eng',
      // OEM 3: Default, based on what is available
      oem: config?.oem ?? 3,
      // PSM 3: Fully automatic page segmentation
      psm: config?.psm ?? 3,
    }
  }

  get isConfigured(): boolean {
    // Tesseract 始终可用（本地运行）
    return true
  }

  /**
   * 处理单张图片
   */
  async processImage(
    imageSource: string,
    options?: ImageProcessOptions
  ): Promise<OCRResult> {
    const startTime = Date.now()

    try {
      // 加载 Tesseract
      const tesseract = await loadTesseract()

      // 准备图片源
      let imageSrc: string

      if (this.isBase64Image(imageSource)) {
        imageSrc = imageSource
      } else if (this.isUrl(imageSource)) {
        // Tesseract.js 可以直接处理 URL
        imageSrc = imageSource
      } else {
        throw new OCRError('INVALID_IMAGE', '无效的图片源', this.name)
      }

      // 创建 Worker 并执行 OCR
      const timeout = options?.timeout ?? 60000 // Tesseract 可能较慢，默认60秒

      const result = await this.withTimeout(
        this.runOCR(tesseract, imageSrc),
        timeout,
        'Tesseract OCR 处理超时'
      )

      return result
    } catch (error) {
      if (error instanceof OCRError) {
        return this.createFailureResult(error.message, Date.now() - startTime)
      }

      const message = error instanceof Error ? error.message : '未知错误'
      return this.createFailureResult(
        `Tesseract 处理失败: ${message}`,
        Date.now() - startTime
      )
    }
  }

  /**
   * 检查可用性
   */
  async checkAvailability(): Promise<boolean> {
    try {
      await loadTesseract()
      return true
    } catch {
      return false
    }
  }

  // ==================== 私有方法 ====================

  /**
   * 执行 OCR 识别
   */
  private async runOCR(
    tesseract: typeof import('tesseract.js'),
    imageSrc: string
  ): Promise<OCRResult> {
    const startTime = Date.now()

    // 使用 recognize 方法（自动管理 worker）
    const result = await tesseract.recognize(imageSrc, this.config.lang, {
      logger: (m) => {
        // 可以在这里添加进度日志
        if (process.env.NODE_ENV === 'development' && m.status === 'recognizing text') {
          console.log(`Tesseract 进度: ${Math.round(m.progress * 100)}%`)
        }
      },
    })

    const processingTime = Date.now() - startTime

    // 解析结果
    const blocks: TextBlock[] = this.parseBlocks(result.data)
    const confidence = result.data.confidence / 100 // 转换为 0-1 范围

    const pageResult: PageOCRResult = {
      pageNumber: 1,
      text: result.data.text,
      blocks,
      confidence,
      processingTime,
    }

    return {
      success: true,
      provider: this.name,
      text: result.data.text,
      pages: [pageResult],
      confidence,
      processingTime,
      estimatedCost: 0,
      rawResponse: result.data,
    }
  }

  /**
   * 解析文本块
   */
  private parseBlocks(data: Tesseract.RecognizeResult['data']): TextBlock[] {
    const blocks: TextBlock[] = []

    // 使用段落级别的结果
    if (data.paragraphs) {
      data.paragraphs.forEach((paragraph, index) => {
        blocks.push({
          text: paragraph.text,
          confidence: paragraph.confidence / 100,
          boundingBox: [
            paragraph.bbox.x0,
            paragraph.bbox.y0,
            paragraph.bbox.x1 - paragraph.bbox.x0,
            paragraph.bbox.y1 - paragraph.bbox.y0,
          ],
          blockIndex: index,
          pageNumber: 1,
        })
      })
    } else if (data.lines) {
      // 回退到行级别
      data.lines.forEach((line, index) => {
        blocks.push({
          text: line.text,
          confidence: line.confidence / 100,
          boundingBox: [
            line.bbox.x0,
            line.bbox.y0,
            line.bbox.x1 - line.bbox.x0,
            line.bbox.y1 - line.bbox.y0,
          ],
          blockIndex: index,
          pageNumber: 1,
        })
      })
    } else {
      // 最后回退：整个文本作为一个块
      blocks.push({
        text: data.text,
        confidence: data.confidence / 100,
        blockIndex: 0,
        pageNumber: 1,
      })
    }

    return blocks
  }
}

// Tesseract 类型扩展
// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Tesseract {
  interface RecognizeResult {
    data: {
      text: string
      confidence: number
      paragraphs?: Array<{
        text: string
        confidence: number
        bbox: { x0: number; y0: number; x1: number; y1: number }
      }>
      lines?: Array<{
        text: string
        confidence: number
        bbox: { x0: number; y0: number; x1: number; y1: number }
      }>
    }
  }
}
