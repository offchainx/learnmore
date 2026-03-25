import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'
import prisma from '@/lib/prisma'
import type { CreateQuestionInput } from './types'

type ChapterCandidate = {
  id: string
  title: string
  shortTitle: string
  keywords: string[]
}

type ChapterTaggingInput = {
  id: string
  content: string
  explanation?: string | null
  tags?: string[]
  subjectId?: string | null
  chapterId?: string | null
}

export type ChapterTaggingStrategy = 'existing' | 'rule' | 'ai' | 'none'

export interface ChapterTaggingSuggestion {
  questionId: string
  chapterId: string | null
  strategy: ChapterTaggingStrategy
  confidence: number
  reason: string
}

const RULE_ASSIGN_SCORE = 7
const RULE_ASSIGN_MARGIN = 3
const MAX_AI_CANDIDATES = 8
const MAX_AI_BATCH_SIZE = 6

function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .replace(/[\s\p{P}\p{S}]+/gu, '')
    .trim()
}

function cleanChapterTitle(title: string): string {
  const lastSegment = title.split(' - ').pop() || title
  return lastSegment.replace(/^\d+(?:\.\d+)*\s*/u, '').trim()
}

function buildChapterKeywords(title: string): string[] {
  const cleaned = cleanChapterTitle(title)
  const parts = cleaned
    .split(/[、，,；;：:（）()\s/]+/u)
    .flatMap((segment) => segment.split(/[与和及之的]/u))
    .map((segment) => segment.trim())
    .filter((segment) => segment.length >= 2)

  return Array.from(new Set([cleaned, ...parts]))
}

function buildQuestionCorpus(input: ChapterTaggingInput): string {
  return normalizeText(
    [input.content, input.explanation ?? '', ...(input.tags ?? [])].join(' ')
  )
}

function scoreCandidate(
  normalizedCorpus: string,
  candidate: ChapterCandidate
): number {
  if (!normalizedCorpus) return 0

  let score = 0
  const normalizedShortTitle = normalizeText(candidate.shortTitle)
  if (normalizedShortTitle && normalizedCorpus.includes(normalizedShortTitle)) {
    score += Math.max(6, Math.min(normalizedShortTitle.length, 10))
  }

  for (const keyword of candidate.keywords) {
    const normalizedKeyword = normalizeText(keyword)
    if (!normalizedKeyword || normalizedKeyword.length < 2) continue
    if (!normalizedCorpus.includes(normalizedKeyword)) continue

    if (normalizedKeyword.length >= 8) {
      score += 5
    } else if (normalizedKeyword.length >= 5) {
      score += 4
    } else {
      score += 3
    }
  }

  return score
}

function extractRuleSuggestion(
  input: ChapterTaggingInput,
  candidates: ChapterCandidate[]
): {
  direct: ChapterTaggingSuggestion | null
  shortlist: ChapterCandidate[]
} {
  const normalizedCorpus = buildQuestionCorpus(input)
  const ranked = candidates
    .map((candidate) => ({
      candidate,
      score: scoreCandidate(normalizedCorpus, candidate),
    }))
    .sort((left, right) => right.score - left.score)

  const top = ranked[0]
  const second = ranked[1]

  if (
    top &&
    top.score >= RULE_ASSIGN_SCORE &&
    top.score - (second?.score ?? 0) >= RULE_ASSIGN_MARGIN
  ) {
    return {
      direct: {
        questionId: input.id,
        chapterId: top.candidate.id,
        strategy: 'rule',
        confidence: Math.min(0.95, 0.55 + top.score / 20),
        reason: `规则命中章节关键词：${top.candidate.shortTitle}`,
      },
      shortlist: ranked
        .filter((item) => item.score > 0)
        .slice(0, MAX_AI_CANDIDATES)
        .map((item) => item.candidate),
    }
  }

  return {
    direct: null,
    shortlist: ranked
      .filter((item) => item.score > 0)
      .slice(0, MAX_AI_CANDIDATES)
      .map((item) => item.candidate),
  }
}

function parseJsonBlock(text: string): unknown {
  const jsonMatch =
    text.match(/```json\s*([\s\S]*?)\s*```/u) ||
    text.match(/```\s*([\s\S]*?)\s*```/u)
  const jsonText = jsonMatch ? jsonMatch[1] : text
  return JSON.parse(jsonText.trim())
}

class ChapterTaggingAI {
  private anthropicClient: Anthropic | null
  private geminiClient: GoogleGenerativeAI | null

  constructor() {
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY?.trim()
    const geminiApiKey =
      process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim()

    this.anthropicClient = anthropicApiKey
      ? new Anthropic({ apiKey: anthropicApiKey })
      : null
    this.geminiClient = geminiApiKey
      ? new GoogleGenerativeAI(geminiApiKey)
      : null
  }

  get available(): boolean {
    return Boolean(this.geminiClient || this.anthropicClient)
  }

  async tagBatch(
    batch: Array<{
      questionId: string
      content: string
      explanation?: string | null
      tags?: string[]
      candidates: ChapterCandidate[]
    }>
  ): Promise<Map<string, ChapterTaggingSuggestion>> {
    if (batch.length === 0) {
      return new Map()
    }

    const prompt = `你是题库章节打标助手。请只从给定候选叶子章节中为每道题选择一个最匹配的章节，若都不合适就返回 null。

规则：
1. 只能从候选 chapterId 中选择。
2. 如果题目与候选都不够匹配，chapterId 返回 null。
3. confidence 取 0 到 1 之间的小数。
4. reason 用简短中文，20 字以内。
5. 只返回 JSON，不要解释。

输入：
${JSON.stringify(
      batch.map((item) => ({
        questionId: item.questionId,
        content: item.content,
        explanation: item.explanation ?? '',
        tags: item.tags ?? [],
        candidates: item.candidates.map((candidate) => ({
          chapterId: candidate.id,
          title: candidate.title,
        })),
      })),
      null,
      2
    )}

输出格式：
[
  {
    "questionId": "uuid",
    "chapterId": "uuid 或 null",
    "confidence": 0.82,
    "reason": "命中辛亥革命"
  }
]`

    try {
      const parsed = this.geminiClient
        ? await this.tagBatchWithGemini(prompt)
        : this.anthropicClient
          ? await this.tagBatchWithAnthropic(prompt)
          : null

      if (!Array.isArray(parsed)) {
        return new Map()
      }

      return new Map(
        parsed
          .filter(
            (
              item
            ): item is {
              questionId: string
              chapterId: string | null
              confidence?: number
              reason?: string
            } => Boolean(item && typeof item === 'object' && 'questionId' in item)
          )
          .map((item) => [
            item.questionId,
            {
              questionId: item.questionId,
              chapterId: item.chapterId ?? null,
              strategy: item.chapterId ? 'ai' : 'none',
              confidence:
                typeof item.confidence === 'number'
                  ? Math.max(0, Math.min(1, item.confidence))
                  : 0.55,
              reason: item.reason?.trim() || 'AI 未提供原因',
            } satisfies ChapterTaggingSuggestion,
          ])
      )
    } catch (error) {
      console.error('AI chapter tagging failed:', error)
      return new Map()
    }
  }

  private async tagBatchWithGemini(prompt: string): Promise<unknown> {
    if (!this.geminiClient) return null

    const model = this.geminiClient.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 1400,
        responseMimeType: 'application/json',
      },
    })

    const response = await model.generateContent(prompt)
    const text = response.response.text()
    return parseJsonBlock(text)
  }

  private async tagBatchWithAnthropic(prompt: string): Promise<unknown> {
    if (!this.anthropicClient) return null

    const response = await this.anthropicClient.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1400,
      temperature: 0,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const firstBlock = response.content[0]
    if (firstBlock?.type !== 'text') {
      return null
    }

    return parseJsonBlock(firstBlock.text)
  }
}

async function getLeafChaptersBySubjectId(
  subjectId: string
): Promise<ChapterCandidate[]> {
  const chapters = await prisma.chapter.findMany({
    where: { subjectId },
    select: { id: true, title: true, parentId: true, order: true },
    orderBy: [{ order: 'asc' }, { title: 'asc' }],
  })

  if (chapters.length === 0) return []

  const parentIds = new Set(
    chapters
      .map((chapter) => chapter.parentId)
      .filter((value): value is string => Boolean(value))
  )

  return chapters
    .filter((chapter) => !parentIds.has(chapter.id))
    .map((chapter) => ({
      id: chapter.id,
      title: chapter.title,
      shortTitle: cleanChapterTitle(chapter.title),
      keywords: buildChapterKeywords(chapter.title),
    }))
}

export async function suggestQuestionChapters(
  questions: ChapterTaggingInput[]
): Promise<ChapterTaggingSuggestion[]> {
  if (questions.length === 0) return []

  const subjectIds = Array.from(
    new Set(
      questions
        .map((question) => question.subjectId)
        .filter((subjectId): subjectId is string => Boolean(subjectId))
    )
  )

  const chaptersBySubject = new Map<string, ChapterCandidate[]>()
  await Promise.all(
    subjectIds.map(async (subjectId) => {
      chaptersBySubject.set(
        subjectId,
        await getLeafChaptersBySubjectId(subjectId)
      )
    })
  )

  const suggestions = new Map<string, ChapterTaggingSuggestion>()
  const aiPending: Array<{
    questionId: string
    content: string
    explanation?: string | null
    tags?: string[]
    candidates: ChapterCandidate[]
  }> = []

  for (const question of questions) {
    if (question.chapterId) {
      suggestions.set(question.id, {
        questionId: question.id,
        chapterId: question.chapterId,
        strategy: 'existing',
        confidence: 1,
        reason: '题目已存在章节标记',
      })
      continue
    }

    if (!question.subjectId) {
      suggestions.set(question.id, {
        questionId: question.id,
        chapterId: null,
        strategy: 'none',
        confidence: 0,
        reason: '题目缺少科目，无法推断章节',
      })
      continue
    }

    const chapterCandidates = chaptersBySubject.get(question.subjectId) || []
    if (chapterCandidates.length === 0) {
      suggestions.set(question.id, {
        questionId: question.id,
        chapterId: null,
        strategy: 'none',
        confidence: 0,
        reason: '当前科目没有叶子章节',
      })
      continue
    }

    const ruleResult = extractRuleSuggestion(question, chapterCandidates)
    if (ruleResult.direct) {
      suggestions.set(question.id, ruleResult.direct)
      continue
    }

    aiPending.push({
      questionId: question.id,
      content: question.content,
      explanation: question.explanation ?? '',
      tags: question.tags ?? [],
      candidates:
        ruleResult.shortlist.length > 0
          ? ruleResult.shortlist
          : chapterCandidates.slice(0, MAX_AI_CANDIDATES),
    })
  }

  const aiTagger = new ChapterTaggingAI()
  if (aiTagger.available && aiPending.length > 0) {
    for (let index = 0; index < aiPending.length; index += MAX_AI_BATCH_SIZE) {
      const batch = aiPending.slice(index, index + MAX_AI_BATCH_SIZE)
      const aiResult = await aiTagger.tagBatch(batch)
      for (const item of batch) {
        const suggestion = aiResult.get(item.questionId)
        if (suggestion?.chapterId) {
          suggestions.set(item.questionId, suggestion)
        }
      }
    }
  }

  for (const question of questions) {
    if (!suggestions.has(question.id)) {
      suggestions.set(question.id, {
        questionId: question.id,
        chapterId: null,
        strategy: 'none',
        confidence: 0,
        reason: aiTagger.available
          ? 'AI 未命中可用章节'
          : '未配置 AI，规则也未命中章节',
      })
    }
  }

  return questions.map((question) => suggestions.get(question.id)!)
}

export async function autoAssignQuestionChapters(
  questions: CreateQuestionInput[]
): Promise<CreateQuestionInput[]> {
  const inputs = questions.map((question, index) => ({
    id: `draft-${index}`,
    content: question.content,
    explanation: question.explanation,
    tags: question.tags,
    subjectId: question.subjectId,
    chapterId: question.chapterId,
  }))

  const suggestions = await suggestQuestionChapters(inputs)
  const suggestionMap = new Map(
    suggestions.map((suggestion) => [suggestion.questionId, suggestion])
  )

  return questions.map((question, index) => {
    const suggestion = suggestionMap.get(`draft-${index}`)
    if (!suggestion?.chapterId || question.chapterId) {
      return question
    }

    return {
      ...question,
      chapterId: suggestion.chapterId,
    }
  })
}
