/**
 * OCR 服务类型定义
 * Story-044: Task B1 - OCR服务集成
 */

// ==================== 基础类型 ====================

/**
 * OCR 提供商名称
 */
export type OCRProviderName = 'google_vision' | 'mathpix' | 'tesseract' | 'mock'

/**
 * OCR 处理状态
 */
export type OCRStatus = 'pending' | 'processing' | 'completed' | 'failed'

/**
 * 支持的图片格式
 */
export type SupportedImageFormat = 'jpg' | 'jpeg' | 'png' | 'gif' | 'webp' | 'bmp'

/**
 * 支持的文档格式
 */
export type SupportedDocFormat = 'pdf' | SupportedImageFormat

// ==================== OCR 结果类型 ====================

/**
 * 文本块信息（带位置）
 */
export interface TextBlock {
  /** 文本内容 */
  text: string
  /** 置信度 (0-1) */
  confidence: number
  /** 边界框坐标 [x, y, width, height] */
  boundingBox?: [number, number, number, number]
  /** 段落/块索引 */
  blockIndex?: number
  /** 页码（PDF场景） */
  pageNumber?: number
}

/**
 * 单页 OCR 结果
 */
export interface PageOCRResult {
  /** 页码 (从1开始) */
  pageNumber: number
  /** 完整文本 */
  text: string
  /** 文本块列表 */
  blocks: TextBlock[]
  /** 整体置信度 (0-1) */
  confidence: number
  /** 处理耗时 (毫秒) */
  processingTime: number
}

/**
 * 单次 OCR 处理结果
 */
export interface OCRResult {
  /** 是否成功 */
  success: boolean
  /** 使用的提供商 */
  provider: OCRProviderName
  /** 完整文本（所有页合并） */
  text: string
  /** 分页结果 */
  pages: PageOCRResult[]
  /** 整体置信度 (0-1) */
  confidence: number
  /** 总处理耗时 (毫秒) */
  processingTime: number
  /** 估算成本 (美元) */
  estimatedCost: number
  /** 错误信息（失败时） */
  error?: string
  /** 原始响应（调试用） */
  rawResponse?: unknown
}

// ==================== Provider 配置类型 ====================

/**
 * Google Vision API 配置
 */
export interface GoogleVisionConfig {
  /** API Key */
  apiKey: string
  /** 语言提示（可选，默认自动检测） */
  languageHints?: string[]
  /** 是否启用文档文本检测（更适合长文档） */
  useDocumentTextDetection?: boolean
}

/**
 * Mathpix API 配置
 */
export interface MathpixConfig {
  /** App ID */
  appId: string
  /** App Key */
  appKey: string
  /** 输出格式 */
  formats?: ('text' | 'latex' | 'mathml')[]
}

/**
 * Tesseract 配置
 */
export interface TesseractConfig {
  /** 语言代码（默认: chi_sim+eng） */
  lang?: string
  /** 识别模式 */
  oem?: number
  /** 页面分割模式 */
  psm?: number
}

/**
 * OCR 服务全局配置
 */
export interface OCRServiceConfig {
  /** 提供商优先级顺序 */
  providerPriority: OCRProviderName[]
  /** 最低可接受置信度 (0-1) */
  minConfidence: number
  /** 单次处理最大页数 */
  maxPagesPerRequest: number
  /** 并发处理数 */
  concurrency: number
  /** 每日成本上限 (美元) */
  dailyCostLimit: number
  /** 每日请求上限 */
  dailyRequestLimit: number
  /** 是否启用调试模式 */
  debug: boolean
  /** 各提供商配置 */
  providers: {
    googleVision?: GoogleVisionConfig
    mathpix?: MathpixConfig
    tesseract?: TesseractConfig
  }
}

// ==================== 处理选项类型 ====================

/**
 * 图片处理选项
 */
export interface ImageProcessOptions {
  /** 指定使用的提供商（不指定则按优先级） */
  provider?: OCRProviderName
  /** 语言提示 */
  languageHints?: string[]
  /** 是否检测数学公式 */
  detectMath?: boolean
  /** 最大成本限制 (美元) */
  maxCost?: number
  /** 超时时间 (毫秒) */
  timeout?: number
}

/**
 * PDF 处理选项
 */
export interface PDFProcessOptions extends ImageProcessOptions {
  /** 起始页码 (从1开始) */
  startPage?: number
  /** 结束页码 */
  endPage?: number
  /** DPI (默认 150) */
  dpi?: number
  /** 是否合并所有页面文本 */
  mergePages?: boolean
}

/**
 * 批量处理选项
 */
export interface BatchProcessOptions extends ImageProcessOptions {
  /** 总成本上限 (美元) */
  maxTotalCost?: number
  /** 失败时是否继续处理其他文件 */
  continueOnError?: boolean
  /** 进度回调 */
  onProgress?: (current: number, total: number, result?: OCRResult) => void
}

// ==================== 配额与统计类型 ====================

/**
 * 使用统计
 */
export interface OCRUsageStats {
  /** 统计日期 */
  date: string
  /** 各提供商请求次数 */
  requestsByProvider: Record<OCRProviderName, number>
  /** 各提供商成本 */
  costByProvider: Record<OCRProviderName, number>
  /** 总请求次数 */
  totalRequests: number
  /** 总成本 */
  totalCost: number
  /** 总处理页数 */
  totalPages: number
  /** 平均置信度 */
  averageConfidence: number
}

/**
 * 配额状态
 */
export interface QuotaStatus {
  /** 今日已用请求数 */
  dailyRequestsUsed: number
  /** 今日请求上限 */
  dailyRequestLimit: number
  /** 今日已用成本 */
  dailyCostUsed: number
  /** 今日成本上限 */
  dailyCostLimit: number
  /** 是否已达到配额上限 */
  isQuotaExceeded: boolean
  /** 配额重置时间 */
  resetAt: Date
}

// ==================== Provider 接口 ====================

/**
 * OCR Provider 抽象接口
 * 所有提供商必须实现此接口
 */
export interface IOCRProvider {
  /** 提供商名称 */
  readonly name: OCRProviderName
  /** 是否已配置（有有效凭证） */
  readonly isConfigured: boolean
  /** 每页估算成本 */
  readonly costPerPage: number

  /**
   * 处理单张图片
   * @param imageSource 图片 URL 或 Base64
   * @param options 处理选项
   */
  processImage(
    imageSource: string,
    options?: ImageProcessOptions
  ): Promise<OCRResult>

  /**
   * 检查提供商是否可用
   */
  checkAvailability(): Promise<boolean>
}

// ==================== 错误类型 ====================

/**
 * OCR 错误代码
 */
export type OCRErrorCode =
  | 'PROVIDER_NOT_CONFIGURED'
  | 'PROVIDER_UNAVAILABLE'
  | 'INVALID_IMAGE'
  | 'INVALID_PDF'
  | 'QUOTA_EXCEEDED'
  | 'COST_LIMIT_EXCEEDED'
  | 'TIMEOUT'
  | 'NETWORK_ERROR'
  | 'API_ERROR'
  | 'ALL_PROVIDERS_FAILED'
  | 'UNKNOWN_ERROR'

/**
 * OCR 错误
 */
export class OCRError extends Error {
  constructor(
    public code: OCRErrorCode,
    message: string,
    public provider?: OCRProviderName,
    public cause?: Error
  ) {
    super(message)
    this.name = 'OCRError'
  }
}
