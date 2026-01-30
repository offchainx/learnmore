/**
 * Mock OCR Provider
 * 用于测试和演示，无需真实的 OCR API
 *
 * ⚠️ 仅供测试使用，生产环境请配置真实的 OCR 提供商
 */

import { BaseOCRProvider } from './base-provider'
import type {
  OCRResult,
  PageOCRResult,
  ImageProcessOptions,
} from '../ocr-types'

/**
 * Mock OCR Provider
 *
 * 返回模拟的 OCR 结果，用于测试
 */
export class MockOCRProvider extends BaseOCRProvider {
  readonly name = 'mock' as const
  readonly costPerPage = 0 // 免费

  get isConfigured(): boolean {
    return true // 始终可用
  }

  /**
   * 处理单张图片（返回模拟结果）
   */
  async processImage(
    imageSource: string,
    options?: ImageProcessOptions
  ): Promise<OCRResult> {
    const startTime = Date.now()

    // 模拟处理延迟（500ms）
    await new Promise(resolve => setTimeout(resolve, 500))

    // 返回模拟的OCR结果
    const mockText = `
1. 解方程：x² - 5x + 6 = 0
   答案：x = 2 或 x = 3

2. 计算：(3 + 5) × 2 = ?
   A. 10
   B. 16
   C. 18
   D. 20
   答案：B

3. 填空：地球的自转周期约为___小时。
   答案：24

[Mock OCR 结果 - 测试用途]
图片来源: ${imageSource.substring(0, 50)}...
`.trim()

    const processingTime = Date.now() - startTime

    const pageResult: PageOCRResult = {
      pageNumber: 1,
      text: mockText,
      blocks: [
        {
          text: mockText,
          confidence: 0.95,
          blockIndex: 0,
          pageNumber: 1,
        },
      ],
      confidence: 0.95,
      processingTime,
    }

    return {
      success: true,
      provider: this.name,
      text: mockText,
      pages: [pageResult],
      confidence: 0.95,
      processingTime,
      estimatedCost: 0,
      metadata: {
        note: '这是 Mock OCR 的测试结果，非真实识别',
        imageSource: imageSource.substring(0, 100),
      },
    }
  }

  /**
   * 检查可用性（始终可用）
   */
  async checkAvailability(): Promise<boolean> {
    return true
  }
}
