import type { ServiceResult } from '@/lib/content-pipeline/types'
import type { WebImportContext, WebImportRunResult } from '../types'
import { normalizeWebImportResult } from '../utils'
import { resolveWebImportAdapter } from './resolve-adapter'

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
}

export async function runWebImport(
  context: WebImportContext
): Promise<ServiceResult<WebImportRunResult>> {
  const resolved = await resolveWebImportAdapter(context.pageUrl)
  if (!resolved.success || !resolved.data) {
    return {
      success: false,
      error: resolved.error,
      code: resolved.code,
    }
  }

  const adapter = resolved.data
  const raw = await adapter.collect(context)
  const extracted = await adapter.extract(raw, context)
  const normalized = normalizeWebImportResult(await adapter.normalize(extracted, context))
  const flaggedQuestionCount = normalized.questions.filter(
    (question) => question.sourceMeta?.needsAttention === true
  ).length
  const detectedQuestionGroupIds = (normalized.questionGroups ?? [])
    .map((group) => group.rawGroupId)
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
  const normalizedRawQuestionIds = normalized.questions
    .map((question) => question.rawQuestionId)
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
  const expectedRawQuestionIds = toStringArray(raw.metadata?.examcooExpectedRawQuestionIds)
  const selectedRawQuestionIds = toStringArray(raw.metadata?.examcooSelectedRawQuestionIds)
  const collectedRawQuestionIds = toStringArray(raw.metadata?.examcooCollectedRawQuestionIds)
  const skippedByLimitRawQuestionIds = toStringArray(raw.metadata?.examcooSkippedByLimitRawQuestionIds)
  const selectedIdsForMissing = selectedRawQuestionIds.length > 0 ? selectedRawQuestionIds : collectedRawQuestionIds
  const missingRawQuestionIds = selectedIdsForMissing.filter(
    (questionId) => !normalizedRawQuestionIds.includes(questionId)
  )

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
        expectedQuestionCount:
          typeof raw.metadata?.examcooExpectedQuestionCount === 'number'
            ? raw.metadata.examcooExpectedQuestionCount
            : expectedRawQuestionIds.length || undefined,
        expectedRawQuestionIds,
        selectedQuestionCount:
          typeof raw.metadata?.examcooSelectedQuestionCount === 'number'
            ? raw.metadata.examcooSelectedQuestionCount
            : selectedRawQuestionIds.length || undefined,
        selectedRawQuestionIds,
        skippedByLimitRawQuestionIds,
        collectedQuestionCount:
          typeof raw.metadata?.examcooCollectedQuestionCount === 'number'
            ? raw.metadata.examcooCollectedQuestionCount
            : collectedRawQuestionIds.length || undefined,
        collectedRawQuestionIds,
        normalizedQuestionCount: normalized.questions.length,
        normalizedRawQuestionIds,
        missingRawQuestionIds,
        detectedQuestionGroupCount: detectedQuestionGroupIds.length,
        detectedQuestionGroupIds,
        assetCount: raw.assets.length,
        flaggedQuestionCount,
      },
    },
  }
}
