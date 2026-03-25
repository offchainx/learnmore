import type { JsonValue } from '@/lib/content-pipeline/types'

export type WebImportMode = 'json' | 'html' | 'playwright'

export interface WebImportAsset {
  url: string
  kind: 'question_image' | 'explanation_image' | 'paper_cover' | 'unknown'
  source?: string
}

export interface WebImportNetworkEntry {
  url: string
  method: string
  status?: number
  resourceType?: string
  contentType?: string | null
  body?: string | JsonValue | null
}

export interface WebImportRawResult {
  sourceUrl: string
  resolvedUrl: string
  mode: WebImportMode
  pageTitle?: string | null
  html?: string | null
  text?: string | null
  assets: WebImportAsset[]
  networkEntries: WebImportNetworkEntry[]
  metadata?: Record<string, JsonValue>
}
