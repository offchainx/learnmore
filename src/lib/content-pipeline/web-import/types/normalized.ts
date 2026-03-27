import type { JsonValue, QuestionType } from '@/lib/content-pipeline/types'

export interface NormalizedWebImportQuestion {
  sourceUrl: string
  sourceSite: string
  rawQuestionId?: string | null
  paperId?: string | null
  paperTitle?: string | null
  content: string
  type: QuestionType
  options?: Record<string, string> | null
  answer: JsonValue
  explanation?: string | null
  explanationImageUrls: string[]
  assetUrl?: string | null
  imageUrls: string[]
  isPastPaper: boolean
  sourceMeta?: Record<string, JsonValue>
}

export interface NormalizedWebImportResult {
  sourceSite: string
  sourceUrl: string
  paperId?: string | null
  paperTitle?: string | null
  questions: NormalizedWebImportQuestion[]
}
