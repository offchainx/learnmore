import { QuestionType } from '@prisma/client'
import type { JsonValue } from '@/lib/content-pipeline/types'
import type {
  NormalizedWebImportQuestion,
  NormalizedWebImportResult,
} from '../types'

function sanitizeTextBlock(input: string | null | undefined): string {
  if (!input) return ''

  const lines = input
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => {
      const trimmed = line.trim()
      if (!trimmed) return ''
      if (/^!\[[^\]]*]\((https?:\/\/[^)]+)\)$/.test(trimmed)) {
        return trimmed
      }
      return trimmed.replace(/[ \t\u00a0]{2,}/g, ' ')
    })

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim()
}

function normalizeOptions(
  options: Record<string, string> | null | undefined
): Record<string, string> | null {
  if (!options) return null

  const normalizedEntries = Object.entries(options)
    .map(([key, value], index) => {
      const normalizedKey = /^[A-Z]$/i.test(key.trim())
        ? key.trim().toUpperCase()
        : String.fromCharCode(65 + index)
      return [normalizedKey, sanitizeTextBlock(String(value ?? ''))] as const
    })
    .filter(([, value]) => value.length > 0)

  if (normalizedEntries.length === 0) {
    return null
  }

  return Object.fromEntries(normalizedEntries)
}

function normalizeImageUrls(
  imageUrls: string[] | null | undefined,
  assetUrl: string | null | undefined
): { assetUrl: string | null; imageUrls: string[] } {
  const merged = [
    ...(Array.isArray(imageUrls) ? imageUrls : []),
    ...(assetUrl ? [assetUrl] : []),
  ]
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .map((value) => value.trim())

  const unique = Array.from(new Set(merged))

  return {
    assetUrl: unique[0] ?? null,
    imageUrls: unique,
  }
}

function normalizeLetterList(value: JsonValue, validKeys: string[]): string[] {
  const parsed = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(/[,;/|]/)
      : []

  const normalized = parsed
    .map((item) => String(item).trim().toUpperCase())
    .filter((item) => item.length > 0 && (validKeys.length === 0 || validKeys.includes(item)))

  return Array.from(new Set(normalized)).sort((a, b) => validKeys.indexOf(a) - validKeys.indexOf(b))
}

function normalizeAnswer(
  type: QuestionType,
  answer: JsonValue,
  options: Record<string, string> | null
): JsonValue {
  const validKeys = options ? Object.keys(options) : []

  if (type === QuestionType.SINGLE_CHOICE || type === QuestionType.TRUE_FALSE) {
    const normalized = normalizeLetterList(answer, validKeys)
    if (normalized.length > 0) return normalized[0]
    return typeof answer === 'string' ? answer.trim() : answer
  }

  if (type === QuestionType.MULTIPLE_CHOICE) {
    const normalized = normalizeLetterList(answer, validKeys)
    return normalized.length > 0 ? normalized : answer
  }

  if (type === QuestionType.FILL_BLANK) {
    if (Array.isArray(answer)) {
      return answer.map((item) => sanitizeTextBlock(String(item ?? ''))).filter(Boolean)
    }
    if (typeof answer === 'string') {
      return answer
        .split('|||')
        .map((item) => sanitizeTextBlock(item))
        .filter(Boolean)
    }
    return answer
  }

  if (typeof answer === 'string') {
    return sanitizeTextBlock(answer)
  }

  return answer
}

function detectCleanupIssues(question: NormalizedWebImportQuestion): string[] {
  const issues: string[] = []

  if (!question.content.trim()) {
    issues.push('missing_content')
  }

  if (
    (question.type === QuestionType.SINGLE_CHOICE ||
      question.type === QuestionType.MULTIPLE_CHOICE ||
      question.type === QuestionType.TRUE_FALSE) &&
    (!question.options || Object.keys(question.options).length === 0)
  ) {
    issues.push('missing_options')
  }

  if (
    question.answer === null ||
    question.answer === undefined ||
    (typeof question.answer === 'string' && question.answer.trim().length === 0) ||
    (Array.isArray(question.answer) && question.answer.length === 0)
  ) {
    issues.push('missing_answer')
  }

  return issues
}

function normalizeQuestion(question: NormalizedWebImportQuestion): NormalizedWebImportQuestion {
  const content = sanitizeTextBlock(question.content)
  const explanation = question.explanation ? sanitizeTextBlock(question.explanation) : null
  const options = normalizeOptions(question.options)
  const normalizedAnswer = normalizeAnswer(question.type, question.answer, options)
  const normalizedImages = normalizeImageUrls(question.imageUrls, question.assetUrl)

  const normalizedQuestion: NormalizedWebImportQuestion = {
    ...question,
    content,
    explanation,
    options,
    answer: normalizedAnswer,
    assetUrl: normalizedImages.assetUrl,
    imageUrls: normalizedImages.imageUrls,
  }

  const cleanupIssues = detectCleanupIssues(normalizedQuestion)

  return {
    ...normalizedQuestion,
    sourceMeta: {
      ...(normalizedQuestion.sourceMeta ?? {}),
      cleanupIssues,
      needsAttention: cleanupIssues.length > 0,
    },
  }
}

export function normalizeWebImportResult(
  result: NormalizedWebImportResult
): NormalizedWebImportResult {
  return {
    ...result,
    questions: result.questions.map(normalizeQuestion),
  }
}
