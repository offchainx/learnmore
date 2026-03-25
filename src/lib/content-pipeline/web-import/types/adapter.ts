import type { JsonValue, QuestionType, ServiceResult } from '@/lib/content-pipeline/types'
import type { NormalizedWebImportResult } from './normalized'
import type { WebImportRawResult } from './raw'

export interface WebImportContext {
  pageUrl: string
  subjectId: string
  source?: string
  chapterId?: string
  maxQuestions?: number
}

export interface ExtractedWebImportQuestion {
  rawQuestionId?: string | null
  content: string
  type: QuestionType
  options?: Record<string, string> | null
  answer: JsonValue
  explanation?: string | null
  assetUrl?: string | null
  imageUrls?: string[]
  metadata?: Record<string, JsonValue>
}

export interface ExtractedWebImportResult {
  sourceSite: string
  sourceUrl: string
  paperId?: string | null
  paperTitle?: string | null
  isPastPaper: boolean
  questions: ExtractedWebImportQuestion[]
}

export interface WebImportAdapter {
  name: string
  version: string
  detect(url: string): boolean | Promise<boolean>
  collect(context: WebImportContext): Promise<WebImportRawResult>
  extract(raw: WebImportRawResult, context: WebImportContext): Promise<ExtractedWebImportResult>
  normalize(
    extracted: ExtractedWebImportResult,
    context: WebImportContext
  ): Promise<NormalizedWebImportResult>
}

export interface WebImportRunResult {
  adapterName: string
  adapterVersion: string
  raw: WebImportRawResult
  extracted: ExtractedWebImportResult
  normalized: NormalizedWebImportResult
  diagnostics: {
    mode: WebImportRawResult['mode']
    questionCount: number
    assetCount: number
    flaggedQuestionCount: number
  }
}

export type ResolveWebImportAdapterResult = ServiceResult<WebImportAdapter>
