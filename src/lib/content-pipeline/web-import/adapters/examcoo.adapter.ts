import type { JsonValue } from '@/lib/content-pipeline/types'
import {
  crawlExamcooViewPaper,
  isExamcooViewPaperUrl,
  type ExamcooImportQuestion,
  type ExamcooImportResult,
} from '@/lib/content-pipeline/examcoo-view-import'
import type {
  ExtractedWebImportResult,
  NormalizedWebImportResult,
  WebImportAdapter,
  WebImportContext,
  WebImportRawResult,
} from '../types'

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
  }

  return assets
}

function getExamcooMetadata(raw: WebImportRawResult): ExamcooImportResult {
  const metadata = raw.metadata ?? {}
  const paperId = String(metadata.examcooPaperId ?? '')
  const paperTitle = String(metadata.examcooPaperTitle ?? '')
  const sourceTag = String(metadata.examcooSourceTag ?? '')
  const questions = (metadata.examcooQuestions as unknown as ExamcooImportQuestion[] | undefined) ?? []

  if (!paperId || !paperTitle || !sourceTag || !Array.isArray(questions)) {
    throw new Error('Examcoo raw metadata 不完整，无法继续提取题目')
  }

  return {
    paperId,
    paperTitle,
    sourceTag,
    questions,
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
    })

    return {
      sourceUrl: context.pageUrl,
      resolvedUrl: context.pageUrl,
      mode: 'json',
      pageTitle: crawled.paperTitle,
      html: null,
      text: null,
      assets: buildExamcooAssets(crawled.questions),
      networkEntries: [],
      metadata: {
        examcooPaperId: crawled.paperId,
        examcooPaperTitle: crawled.paperTitle,
        examcooSourceTag: crawled.sourceTag,
        examcooQuestions: crawled.questions as unknown as JsonValue,
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
        assetUrl: question.assetUrl,
        imageUrls: question.imageUrls,
        metadata: {
          sourceTag: crawled.sourceTag,
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
        assetUrl: question.assetUrl,
        imageUrls: question.imageUrls ?? [],
        isPastPaper: extracted.isPastPaper,
        sourceMeta: {
          ...question.metadata,
          sourceOverride: context.source ?? null,
          chapterIdHint: context.chapterId ?? null,
        },
      })),
    }
  },
}
