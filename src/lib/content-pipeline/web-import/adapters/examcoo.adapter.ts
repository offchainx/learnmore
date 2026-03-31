import type { JsonValue } from '@/lib/content-pipeline/types'
import {
  crawlExamcooViewPaper,
  isExamcooViewPaperUrl,
  type ExamcooImportQuestion,
  type ExamcooImportQuestionGroup,
  type ExamcooImportResult,
} from '@/lib/content-pipeline/examcoo-view-import'
import type {
  ExtractedWebImportResult,
  NormalizedWebImportResult,
  WebImportAdapter,
  WebImportContext,
  WebImportRawResult,
} from '../types'

function extractAnswerImageUrls(answer: JsonValue): string[] {
  const extractFromString = (value: string): string[] => {
    const urls: string[] = []
    const imageRegex = /!\[[^\]]*]\(([^)]+)\)/g
    let match: RegExpExecArray | null = null
    while ((match = imageRegex.exec(value)) !== null) {
      const url = match[1]?.trim()
      if (url) urls.push(url)
    }
    return urls
  }

  if (typeof answer === 'string') {
    return extractFromString(answer)
  }

  if (Array.isArray(answer)) {
    return Array.from(
      new Set(
        answer.flatMap((item) =>
          typeof item === 'string' ? extractFromString(item) : []
        )
      )
    )
  }

  return []
}

function buildExamcooAssets(questions: ExamcooImportQuestion[]): WebImportRawResult['assets'] {
  const seen = new Set<string>()
  const assets: WebImportRawResult['assets'] = []

  for (const question of questions) {
    for (const imageUrl of question.imageUrls) {
      if (seen.has(imageUrl)) continue
      seen.add(imageUrl)
      assets.push({
        url: imageUrl,
        kind: 'question_image',
        source: question.questionId,
      })
    }
    for (const imageUrl of question.explanationImageUrls) {
      if (seen.has(imageUrl)) continue
      seen.add(imageUrl)
      assets.push({
        url: imageUrl,
        kind: 'explanation_image',
        source: question.questionId,
      })
    }
    for (const imageUrl of extractAnswerImageUrls(question.answer as JsonValue)) {
      if (seen.has(imageUrl)) continue
      seen.add(imageUrl)
      assets.push({
        url: imageUrl,
        kind: 'explanation_image',
        source: question.questionId,
      })
    }
  }

  return assets
}

function buildExamcooGroupAssets(questionGroups: ExamcooImportQuestionGroup[]): WebImportRawResult['assets'] {
  const seen = new Set<string>()
  const assets: WebImportRawResult['assets'] = []

  for (const group of questionGroups) {
    for (const imageUrl of group.materialImageUrls) {
      if (seen.has(imageUrl)) continue
      seen.add(imageUrl)
      assets.push({
        url: imageUrl,
        kind: 'question_image',
        source: group.groupId,
      })
    }
  }

  return assets
}

function getExamcooMetadata(raw: WebImportRawResult): ExamcooImportResult {
  const metadata = raw.metadata ?? {}
  const paperId = String(metadata.examcooPaperId ?? '')
  const paperTitle = String(metadata.examcooPaperTitle ?? '')
  const sourceTag = String(metadata.examcooSourceTag ?? '')
  const questions = (metadata.examcooQuestions as unknown as ExamcooImportQuestion[] | undefined) ?? []
  const questionGroups =
    (metadata.examcooQuestionGroups as unknown as ExamcooImportQuestionGroup[] | undefined) ?? []
  const expectedQuestionCount = Number(metadata.examcooExpectedQuestionCount ?? questions.length)
  const expectedRawQuestionIds =
    (metadata.examcooExpectedRawQuestionIds as unknown as string[] | undefined) ?? []
  const selectedQuestionCount = Number(metadata.examcooSelectedQuestionCount ?? questions.length)
  const selectedRawQuestionIds =
    (metadata.examcooSelectedRawQuestionIds as unknown as string[] | undefined) ?? []
  const skippedByLimitRawQuestionIds =
    (metadata.examcooSkippedByLimitRawQuestionIds as unknown as string[] | undefined) ?? []
  const collectedQuestionCount = Number(metadata.examcooCollectedQuestionCount ?? questions.length)
  const collectedRawQuestionIds =
    (metadata.examcooCollectedRawQuestionIds as unknown as string[] | undefined) ?? questions.map((q) => q.questionId)

  if (!paperId || !paperTitle || !sourceTag || !Array.isArray(questions)) {
    throw new Error('Examcoo raw metadata 不完整，无法继续提取题目')
  }

  return {
    paperId,
    paperTitle,
    sourceTag,
    expectedQuestionCount,
    expectedRawQuestionIds,
    selectedQuestionCount,
    selectedRawQuestionIds,
    skippedByLimitRawQuestionIds,
    collectedQuestionCount,
    collectedRawQuestionIds,
    questions,
    questionGroups,
  }
}

export const examcooViewAdapter: WebImportAdapter = {
  name: 'examcoo-view',
  version: 'v1',

  detect(url: string): boolean {
    return isExamcooViewPaperUrl(url)
  },

  async collect(context: WebImportContext): Promise<WebImportRawResult> {
    const crawled = await crawlExamcooViewPaper({
      url: context.pageUrl,
      limit: context.maxQuestions,
      onProgress: context.onProgress,
    })

    return {
      sourceUrl: context.pageUrl,
      resolvedUrl: context.pageUrl,
      mode: 'json',
      pageTitle: crawled.paperTitle,
      html: null,
      text: null,
      assets: [
        ...buildExamcooAssets(crawled.questions),
        ...buildExamcooGroupAssets(crawled.questionGroups),
      ],
      networkEntries: [],
      metadata: {
        examcooPaperId: crawled.paperId,
        examcooPaperTitle: crawled.paperTitle,
        examcooSourceTag: crawled.sourceTag,
        examcooExpectedQuestionCount: crawled.expectedQuestionCount,
        examcooExpectedRawQuestionIds: crawled.expectedRawQuestionIds as unknown as JsonValue,
        examcooSelectedQuestionCount: crawled.selectedQuestionCount,
        examcooSelectedRawQuestionIds: crawled.selectedRawQuestionIds as unknown as JsonValue,
        examcooSkippedByLimitRawQuestionIds: crawled.skippedByLimitRawQuestionIds as unknown as JsonValue,
        examcooCollectedQuestionCount: crawled.collectedQuestionCount,
        examcooCollectedRawQuestionIds: crawled.collectedRawQuestionIds as unknown as JsonValue,
        examcooQuestions: crawled.questions as unknown as JsonValue,
        examcooQuestionGroups: crawled.questionGroups as unknown as JsonValue,
      },
    }
  },

  async extract(raw: WebImportRawResult): Promise<ExtractedWebImportResult> {
    const crawled = getExamcooMetadata(raw)

    return {
      sourceSite: 'examcoo',
      sourceUrl: raw.sourceUrl,
      paperId: crawled.paperId,
      paperTitle: crawled.paperTitle,
      isPastPaper: true,
      questions: crawled.questions.map((question) => ({
        rawQuestionId: question.questionId,
        content: question.content,
        type: question.type,
        options: question.options,
        answer: question.answer,
        explanation: question.explanation,
        explanationImageUrls: question.explanationImageUrls,
        assetUrl: question.assetUrl,
        imageUrls: question.imageUrls,
        metadata: {
          sourceTag: crawled.sourceTag,
          groupId: question.groupId ?? null,
          groupTitle: question.groupTitle ?? null,
          sharedMaterial: question.sharedMaterial ?? null,
          sharedMaterialImageUrls:
            question.sharedMaterialImageUrls as unknown as JsonValue,
        },
      })),
      questionGroups: crawled.questionGroups.map((group) => ({
        rawGroupId: group.groupId,
        title: group.title,
        material: group.material,
        materialImageUrls: group.materialImageUrls,
        questionIds: group.questionIds,
        selectedQuestionIds: group.selectedQuestionIds,
        metadata: {
          sourceTag: crawled.sourceTag,
          blockIndex: group.blockIndex,
        },
      })),
    }
  },

  async normalize(extracted: ExtractedWebImportResult, context: WebImportContext): Promise<NormalizedWebImportResult> {
    return {
      sourceSite: extracted.sourceSite,
      sourceUrl: extracted.sourceUrl,
      paperId: extracted.paperId,
      paperTitle: extracted.paperTitle,
      questions: extracted.questions.map((question) => ({
        sourceUrl: extracted.sourceUrl,
        sourceSite: extracted.sourceSite,
        rawQuestionId: question.rawQuestionId,
        paperId: extracted.paperId,
        paperTitle: extracted.paperTitle,
        content: question.content,
        type: question.type,
        options: question.options,
        answer: question.answer,
        explanation: question.explanation,
        explanationImageUrls: question.explanationImageUrls ?? [],
        assetUrl: question.assetUrl,
        imageUrls: question.imageUrls ?? [],
        isPastPaper: extracted.isPastPaper,
        sourceMeta: {
          ...question.metadata,
          sourceOverride: context.source ?? null,
          chapterIdHint: context.chapterId ?? null,
        },
      })),
      questionGroups: (extracted.questionGroups ?? []).map((group) => ({
        sourceUrl: extracted.sourceUrl,
        sourceSite: extracted.sourceSite,
        rawGroupId: group.rawGroupId,
        paperId: extracted.paperId,
        paperTitle: extracted.paperTitle,
        title: group.title ?? null,
        material: group.material,
        materialImageUrls: group.materialImageUrls ?? [],
        questionIds: group.questionIds,
        selectedQuestionIds: group.selectedQuestionIds,
        sourceMeta: {
          ...group.metadata,
          sourceOverride: context.source ?? null,
          chapterIdHint: context.chapterId ?? null,
        },
      })),
    }
  },
}
