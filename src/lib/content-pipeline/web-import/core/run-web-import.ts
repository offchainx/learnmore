import type { ServiceResult } from '@/lib/content-pipeline/types'
import type { WebImportContext, WebImportRunResult } from '../types'
import { normalizeWebImportResult } from '../utils'
import { resolveWebImportAdapter } from './resolve-adapter'

export async function runWebImport(
  context: WebImportContext
): Promise<ServiceResult<WebImportRunResult>> {
  const resolved = await resolveWebImportAdapter(context.pageUrl)
  if (!resolved.success || !resolved.data) {
    return resolved
  }

  const adapter = resolved.data
  const raw = await adapter.collect(context)
  const extracted = await adapter.extract(raw, context)
  const normalized = normalizeWebImportResult(await adapter.normalize(extracted, context))
  const flaggedQuestionCount = normalized.questions.filter(
    (question) => question.sourceMeta?.needsAttention === true
  ).length

  return {
    success: true,
    data: {
      adapterName: adapter.name,
      adapterVersion: adapter.version,
      raw,
      extracted,
      normalized,
      diagnostics: {
        mode: raw.mode,
        questionCount: normalized.questions.length,
        assetCount: raw.assets.length,
        flaggedQuestionCount,
      },
    },
  }
}
