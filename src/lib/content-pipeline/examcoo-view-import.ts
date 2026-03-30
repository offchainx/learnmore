import { QuestionType } from '@prisma/client'
import { request as httpRequest } from 'node:http'
import { request as httpsRequest } from 'node:https'

const DEFAULT_DELAY_MS = 700
const DEFAULT_DELAY_JITTER_MS = 120
export const EXAMCOO_VIEW_URL_PATTERN = /^https?:\/\/www\.examcoo\.com\/editor\/do\/view\/id\/\d+/i

interface CookieJarStore {
  [name: string]: string
}

interface NodeHttpResponse {
  statusCode: number
  headers: Record<string, string | string[] | undefined>
  body: string
}

export interface ExamcooImportQuestion {
  questionId: string
  type: QuestionType
  content: string
  options: Record<string, string> | null
  answer: string | string[] | null
  explanation: string | null
  explanationImageUrls: string[]
  assetUrl: string | null
  imageUrls: string[]
  groupId?: string | null
  groupTitle?: string | null
  sharedMaterial?: string | null
  sharedMaterialImageUrls?: string[]
}

export interface ExamcooImportQuestionGroup {
  groupId: string
  title: string | null
  material: string
  materialImageUrls: string[]
  questionIds: string[]
  selectedQuestionIds: string[]
  blockIndex: number
}

export interface ExamcooImportResult {
  paperId: string
  paperTitle: string
  sourceTag: string
  expectedQuestionCount: number
  expectedRawQuestionIds: string[]
  selectedQuestionCount: number
  selectedRawQuestionIds: string[]
  skippedByLimitRawQuestionIds: string[]
  collectedQuestionCount: number
  collectedRawQuestionIds: string[]
  questions: ExamcooImportQuestion[]
  questionGroups: ExamcooImportQuestionGroup[]
}

function extractMarkdownImageUrls(markdown = ''): string[] {
  const urls: string[] = []
  const imageRegex = /!\[[^\]]*]\(([^)]+)\)/g
  let match: RegExpExecArray | null = null
  while ((match = imageRegex.exec(markdown)) !== null) {
    const url = match[1]?.trim()
    if (url) urls.push(url)
  }
  return urls
}

interface CrawlExamcooViewOptions {
  url: string
  limit?: number
  delayMs?: number
  onProgress?: (progress: {
    stage: 'CRAWLING'
    processedQuestionCount: number
    totalQuestionCount: number
    currentQuestionId?: string | null
  }) => Promise<void> | void
}

interface RawExamcooQuestion {
  id?: string
  a?: string
  b?: string
  c?: string
  d?: string | number
  e?: string | number
  f?: string | number
  g?: string | number
  h?: string | number
  i?: string | number
  l?: string | number
  m?: string | number
  n?: string | number
  o?: string
  p?: string | number
}

interface RawExamcooBlockSegment {
  c?: string
  p?: string | number
}

interface RawExamcooGroupCandidate {
  groupId: string
  title: string | null
  material: string
  materialImageUrls: string[]
  questionIds: string[]
  selectedQuestionIds: string[]
  blockIndex: number
}

export function isExamcooViewPaperUrl(url: string): boolean {
  return EXAMCOO_VIEW_URL_PATTERN.test(url.trim())
}

class CookieJar {
  private store: CookieJarStore = {}

  ingestFromResponse(res: Response) {
    const header = res.headers as Headers & { getSetCookie?: () => string[] }
    const setCookieLines =
      typeof header.getSetCookie === 'function'
        ? header.getSetCookie()
        : splitSetCookieHeader(res.headers.get('set-cookie'))

    for (const line of setCookieLines) {
      const first = line.split(';')[0]
      const [name, ...rest] = first.split('=')
      if (!name || rest.length === 0) continue
      this.store[name.trim()] = rest.join('=').trim()
    }
  }

  ingestFromHeaders(headers: Record<string, string | string[] | undefined>) {
    const setCookie = headers['set-cookie']
    const setCookieLines = Array.isArray(setCookie)
      ? setCookie
      : typeof setCookie === 'string'
        ? splitSetCookieHeader(setCookie)
        : []

    for (const line of setCookieLines) {
      const first = line.split(';')[0]
      const [name, ...rest] = first.split('=')
      if (!name || rest.length === 0) continue
      this.store[name.trim()] = rest.join('=').trim()
    }
  }

  asHeader(): string {
    return Object.entries(this.store)
      .map(([k, v]) => `${k}=${v}`)
      .join('; ')
  }
}

function splitSetCookieHeader(raw: string | null): string[] {
  if (!raw) return []
  const parts: string[] = []
  let current = ''
  let inExpires = false

  for (let i = 0; i < raw.length; i++) {
    const char = raw[i]
    const next = raw.slice(i, i + 8).toLowerCase()

    if (next === 'expires=') {
      inExpires = true
    }

    if (char === ',' && !inExpires) {
      parts.push(current.trim())
      current = ''
      continue
    }

    if (inExpires && char === ';') {
      inExpires = false
    }

    current += char
  }

  if (current.trim()) parts.push(current.trim())
  return parts
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function doNodeHttpRequest(
  url: string,
  options: { method: 'GET' | 'POST'; headers: Record<string, string>; body?: string },
  redirectCount = 0
): Promise<NodeHttpResponse> {
  return new Promise((resolve, reject) => {
    const target = new URL(url)
    const requestImpl = target.protocol === 'https:' ? httpsRequest : httpRequest
    const req = requestImpl(
      target,
      {
        method: options.method,
        headers: options.headers,
      },
      (res) => {
        const statusCode = res.statusCode ?? 0
        const location = res.headers.location

        if (
          location &&
          statusCode >= 300 &&
          statusCode < 400 &&
          redirectCount < 5
        ) {
          res.resume()
          const nextUrl = new URL(location, target).toString()
          void doNodeHttpRequest(
            nextUrl,
            {
              method: statusCode === 303 ? 'GET' : options.method,
              headers: options.headers,
              body: statusCode === 303 ? undefined : options.body,
            },
            redirectCount + 1
          ).then(resolve, reject)
          return
        }

        const chunks: Buffer[] = []
        res.on('data', (chunk) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
        })
        res.on('end', () => {
          resolve({
            statusCode,
            headers: res.headers,
            body: Buffer.concat(chunks).toString('utf8'),
          })
        })
      }
    )

    req.on('error', reject)

    if (options.body) {
      req.write(options.body)
    }

    req.end()
  })
}

function decodeHtml(input = ''): string {
  return input
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/\r/g, '')
    .trim()
}

function normalizeImageUrl(rawUrl: string, attrName: string): string {
  const value = rawUrl.trim()
  const absoluteUploadsToPaperMatch = value.match(
    /^https?:\/\/img\.examcoo\.com\/uploads\/\d+\/(\d+)\/images\/(\d{6})\/([^/?#]+)$/i
  )
  if (absoluteUploadsToPaperMatch) {
    const [, ownerId, yearMonth, filename] = absoluteUploadsToPaperMatch
    return `https://img.examcoo.com/paper/${ownerId}/${yearMonth}/${filename}`
  }

  if (/^https?:\/\//i.test(value)) return value
  if (value.startsWith('//')) return `https:${value}`

  const uploadsToPaperMatch = value.match(
    /^\/uploads\/\d+\/(\d+)\/images\/(\d{6})\/([^/?#]+)$/i
  )

  if (attrName === '_djrealurl') {
    // Examcoo API 经常返回历史 _djrealurl=/uploads/...，
    // 但真实可访问的是前台页面渲染后的 /paper/<uid>/<yyyymm>/<filename>。
    if (uploadsToPaperMatch) {
      const [, ownerId, yearMonth, filename] = uploadsToPaperMatch
      return `https://img.examcoo.com/paper/${ownerId}/${yearMonth}/${filename}`
    }
    return `https://img.examcoo.com${value.startsWith('/') ? '' : '/'}${value}`
  }

  // Examcoo 的图片很多来自 img.examcoo.com 的 /uploads/... 路径。
  // 如果是相对路径且看起来像图片，优先归一到 img.examcoo.com，避免落到 www 域名导致 404。
  if (
    value.startsWith('/uploads/') ||
    /\.(png|jpe?g|gif|webp|svg)(\?|#|$)/i.test(value)
  ) {
    return `https://img.examcoo.com${value.startsWith('/') ? '' : '/'}${value}`
  }

  return `https://www.examcoo.com${value.startsWith('/') ? '' : '/'}${value}`
}

function selectBestImageUrlFromImgTag(tagHtml: string): string | null {
  const srcMatch = tagHtml.match(/\ssrc=["']([^"']+)["']/i)
  const djMatch = tagHtml.match(/\s_djrealurl=["']([^"']+)["']/i)

  const src = srcMatch?.[1]?.trim()
  const dj = djMatch?.[1]?.trim()

  // 优先使用 src：通常是带扩展名的真实可访问图片；_djrealurl 可能是“无后缀的原图路径”，直接访问会 404。
  if (src && !src.toLowerCase().startsWith('data:') && src !== '#') {
    return normalizeImageUrl(src, 'src')
  }
  if (dj && !dj.toLowerCase().startsWith('data:') && dj !== '#') {
    return normalizeImageUrl(dj, '_djrealurl')
  }
  return null
}

function extractImageUrls(html = ''): string[] {
  const urls: string[] = []
  const imgTagRegex = /<img\b[^>]*>/gi
  const tags = html.match(imgTagRegex) ?? []
  for (const tag of tags) {
    const best = selectBestImageUrlFromImgTag(tag)
    if (best) urls.push(best)
  }
  return urls
}

function htmlToMarkdownWithImages(html = ''): string {
  const withImageMd = html.replace(/<img\b[^>]*>/gi, (tagHtml) => {
    const best = selectBestImageUrlFromImgTag(tagHtml)
    if (!best) return ''
    return `\n![题图](${best})\n`
  })
  const plain = decodeHtml(withImageMd).replace(/<[^>]+>/g, '')
  return plain.replace(/\n{3,}/g, '\n\n').trim()
}

function stripMarkdownToText(input = ''): string {
  return input
    .replace(/!\[[^\]]*]\(([^)]+)\)/g, ' ')
    .replace(/\[(.*?)\]\(([^)]+)\)/g, '$1')
    .replace(/[*_~`>#-]/g, ' ')
    .replace(/[ \t\u00a0]{2,}/g, ' ')
    .replace(/\n{2,}/g, '\n')
    .trim()
}

function isLikelySectionHeading(text: string): boolean {
  const normalized = text.replace(/[ \t\u00a0]/g, '').trim()
  if (!normalized) return true
  if (/^[一二三四五六七八九十]+、/.test(normalized)) return true
  if (/^[（(][一二三四五六七八九十]+[）)]/.test(normalized)) return true
  if (/^[【\[][^】\]]+[】\]]$/.test(normalized) && normalized.length <= 10) return true
  if (/^\(?\d+\)?[、.．]/.test(normalized) && normalized.length <= 12) return true
  return false
}

function buildQuestionGroupCandidate(
  block: RawExamcooQuestion,
  blockIndex: number
): RawExamcooGroupCandidate | null {
  const segments = Array.isArray((block as { c?: unknown }).c)
    ? ((block as { c?: RawExamcooBlockSegment[] }).c ?? [])
    : []

  const normalizedSegments = segments
    .map((segment) => {
      const markdown = htmlToMarkdownWithImages(String(segment.c ?? ''))
      const text = stripMarkdownToText(markdown)
      return {
        markdown,
        text,
        partType: String(segment.p ?? '0'),
      }
    })
    .filter((segment) => segment.markdown.length > 0)

  if (normalizedSegments.length < 3) return null

  const substantiveSegments = normalizedSegments.filter(
    (segment) => segment.text.length >= 12
  )
  const substantiveLength = substantiveSegments.reduce(
    (sum, segment) => sum + segment.text.length,
    0
  )

  if (substantiveSegments.length < 3 || substantiveLength < 120) {
    return null
  }

  const contentSegments = normalizedSegments.filter(
    (segment) => !isLikelySectionHeading(segment.text)
  )

  if (contentSegments.length < 2) return null

  let title: string | null = null
  const materialSegments: string[] = []

  for (const segment of contentSegments) {
    if (!title && segment.text.length <= 24) {
      title = segment.text
      continue
    }
    materialSegments.push(segment.markdown)
  }

  const material = materialSegments.join('\n\n').trim()
  const materialTextLength = stripMarkdownToText(material).length
  if (materialTextLength < 80) return null

  const materialImageUrls = Array.from(
    new Set(materialSegments.flatMap((segment) => extractMarkdownImageUrls(segment)))
  )

  return {
    groupId: `examcoo-block-${blockIndex + 1}`,
    title,
    material,
    materialImageUrls,
    questionIds: [],
    selectedQuestionIds: [],
    blockIndex,
  }
}

export function deriveExamcooQuestionGroups(
  payload: RawExamcooQuestion[],
  selectedRawQuestionIds: string[]
): ExamcooImportQuestionGroup[] {
  const groups: RawExamcooGroupCandidate[] = []
  let currentGroup: RawExamcooGroupCandidate | null = null

  for (let index = 0; index < payload.length; index += 1) {
    const item = payload[index]
    const rawId = String(item.id ?? '')

    if (rawId === 'b') {
      currentGroup = buildQuestionGroupCandidate(item, index)
      if (currentGroup) {
        groups.push(currentGroup)
      }
      continue
    }

    if (!/^s[1-5]_/.test(rawId)) {
      currentGroup = null
      continue
    }

    if (currentGroup) {
      currentGroup.questionIds.push(rawId)
      if (selectedRawQuestionIds.includes(rawId)) {
        currentGroup.selectedQuestionIds.push(rawId)
      }
    }
  }

  return groups
    .filter((group) => group.questionIds.length > 0)
    .map((group) => ({
      groupId: group.groupId,
      title: group.title,
      material: group.material,
      materialImageUrls: group.materialImageUrls,
      questionIds: group.questionIds,
      selectedQuestionIds: group.selectedQuestionIds,
      blockIndex: group.blockIndex,
    }))
}

function parseViewPageInfo(html: string): { pid: string; tokenpid: string; paperTitle: string } {
  const pidMatch =
    html.match(/var\s+pid\s*=\s*"(\d+)"/) ||
    html.match(/["']pid["']\s*:\s*["']?(\d+)["']?/) ||
    html.match(/\/pid\/(\d+)\//)
  const tokenMatch =
    html.match(/var\s+vp4tokenpid\s*=\s*"([^"]+)"/) ||
    html.match(/["'](?:vp4tokenpid|tokenpid)["']\s*[:=]\s*["']([^"']+)["']/)
  const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)

  if (!pidMatch || !tokenMatch) {
    throw new Error('无法从 Examcoo 页面解析 pid/tokenpid')
  }

  const paperTitle = titleMatch ? decodeHtml(titleMatch[1]).replace(/<[^>]+>/g, '').trim() : `Examcoo Paper ${pidMatch[1]}`
  return {
    pid: pidMatch[1],
    tokenpid: tokenMatch[1],
    paperTitle: paperTitle || `Examcoo Paper ${pidMatch[1]}`,
  }
}

function tryParsePayload(raw: string): RawExamcooQuestion[] {
  const parsed = JSON.parse(raw) as unknown
  if (Array.isArray(parsed)) return parsed as RawExamcooQuestion[]
  if (parsed && typeof parsed === 'object') {
    const obj = parsed as Record<string, unknown>
    if (Array.isArray(obj.data)) return obj.data as RawExamcooQuestion[]
    if (Array.isArray(obj.result)) return obj.result as RawExamcooQuestion[]
  }
  throw new Error('Examcoo payload 结构不受支持')
}

function decodeBitmaskToLetters(maskValue: string | number | null | undefined, optionCount: number): string[] {
  const n = Number(maskValue)
  if (!Number.isFinite(n) || n <= 0) return []
  const letters: string[] = []
  for (let i = 0; i < optionCount; i++) {
    if ((n & (1 << i)) !== 0) {
      letters.push(String.fromCharCode(65 + i))
    }
  }
  return letters
}

function parseOptions(rawOptions: unknown): Record<string, string> | null {
  if (!rawOptions) return null
  try {
    const parsed = typeof rawOptions === 'string' ? JSON.parse(rawOptions) : rawOptions
    const result: Record<string, string> = {}

    if (Array.isArray(parsed)) {
      parsed.forEach((item: { o?: string } | string, index: number) => {
        const key = String.fromCharCode(65 + index)
        if (typeof item === 'string') {
          result[key] = htmlToMarkdownWithImages(item)
        } else {
          result[key] = htmlToMarkdownWithImages(item?.o ?? '')
        }
      })
    } else if (parsed && typeof parsed === 'object') {
      const entries = Object.entries(parsed as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b))
      entries.forEach(([key, value], index) => {
        const letter = /^[A-D]$/i.test(key) ? key.toUpperCase() : String.fromCharCode(65 + index)
        result[letter] = htmlToMarkdownWithImages(String(value ?? ''))
      })
    } else {
      return null
    }

    return Object.keys(result).length > 0 ? result : null
  } catch {
    return null
  }
}

function parseFillBlankAnswers(rawAnswer: unknown): string[] {
  try {
    const parsed = typeof rawAnswer === 'string' ? JSON.parse(rawAnswer) : rawAnswer
    if (!Array.isArray(parsed)) return []
    const firstBlank = parsed[0]
    if (!firstBlank || typeof firstBlank !== 'object') return []
    const value = String((firstBlank as { a?: string }).a ?? '')
    return value
      .split('|||')
      .map((x) => decodeHtml(x))
      .filter(Boolean)
  } catch {
    return []
  }
}

function mapQuestionType(rawId: string): QuestionType {
  const prefix = rawId.split('_')[0]
  if (prefix === 's1') return QuestionType.SINGLE_CHOICE
  if (prefix === 's2') return QuestionType.MULTIPLE_CHOICE
  if (prefix === 's3') return QuestionType.TRUE_FALSE
  if (prefix === 's4') return QuestionType.FILL_BLANK
  if (prefix === 's5') return QuestionType.ESSAY
  return QuestionType.SINGLE_CHOICE
}

function extractExplanation(commentHtml: string): {
  explanation: string | null
  explanationImageUrls: string[]
} {
  const match = commentHtml.match(
    /试题解析：<\/div><div>([\s\S]*?)<\/div><div class="marginTop8 bold">纠错或评论：/
  )
  if (!match) {
    return {
      explanation: null,
      explanationImageUrls: [],
    }
  }

  const explanation = htmlToMarkdownWithImages(match[1])
  return {
    explanation: explanation || null,
    explanationImageUrls: extractMarkdownImageUrls(explanation),
  }
}

async function httpGet(url: string, jar: CookieJar, referer?: string): Promise<string> {
  const headers: Record<string, string> = {
    'user-agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    accept: '*/*',
  }
  const cookie = jar.asHeader()
  if (cookie) headers.cookie = cookie
  if (referer) headers.referer = referer

  const res = await doNodeHttpRequest(url, { method: 'GET', headers })
  jar.ingestFromHeaders(res.headers)
  if (res.statusCode < 200 || res.statusCode >= 300) {
    throw new Error(`GET ${url} failed: ${res.statusCode}`)
  }
  return res.body
}

async function httpPostForm(
  url: string,
  form: Record<string, string>,
  jar: CookieJar,
  referer?: string
): Promise<string> {
  const headers: Record<string, string> = {
    'user-agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'x-requested-with': 'XMLHttpRequest',
    accept: '*/*',
  }
  const cookie = jar.asHeader()
  if (cookie) headers.cookie = cookie
  if (referer) headers.referer = referer

  const body = new URLSearchParams(form).toString()
  const res = await doNodeHttpRequest(url, { method: 'POST', headers, body })
  jar.ingestFromHeaders(res.headers)
  if (res.statusCode < 200 || res.statusCode >= 300) {
    throw new Error(`POST ${url} failed: ${res.statusCode}`)
  }
  return res.body
}

function parseAnswer(type: QuestionType, rawAnswer: unknown, optionCount: number): string | string[] | null {
  const answerText = String(rawAnswer ?? '').trim()

  if (answerText && /^[A-D]$/i.test(answerText)) {
    const single = answerText.toUpperCase()
    return type === QuestionType.MULTIPLE_CHOICE ? [single] : single
  }

  if (answerText && /^[A-D](\s*[,;/|]\s*[A-D])+$/i.test(answerText)) {
    const list = answerText
      .split(/[,;/|]/)
      .map((x) => x.trim().toUpperCase())
      .filter(Boolean)
    return type === QuestionType.SINGLE_CHOICE ? list[0] ?? null : list
  }

  if (type === QuestionType.SINGLE_CHOICE) {
    const list = decodeBitmaskToLetters(rawAnswer as string, optionCount)
    return list[0] ?? null
  }

  if (type === QuestionType.MULTIPLE_CHOICE) {
    return decodeBitmaskToLetters(rawAnswer as string, optionCount)
  }

  if (type === QuestionType.TRUE_FALSE) {
    const list = decodeBitmaskToLetters(rawAnswer as string, 2)
    return list[0] ?? null
  }

  if (type === QuestionType.FILL_BLANK) {
    return parseFillBlankAnswers(rawAnswer)
  }

  return decodeHtml(String(rawAnswer ?? ''))
}

function ensureTrueFalseOptions(options: Record<string, string> | null): Record<string, string> {
  if (options && Object.keys(options).length >= 2) return options
  return {
    A: '正确',
    B: '错误',
  }
}

export async function crawlExamcooViewPaper(options: CrawlExamcooViewOptions): Promise<ExamcooImportResult> {
  const { url, limit, delayMs = DEFAULT_DELAY_MS, onProgress } = options
  const jar = new CookieJar()

  const viewHtml = await httpGet(url, jar)
  const { pid, tokenpid, paperTitle } = parseViewPageInfo(viewHtml)

  const apiUrl = `https://www.examcoo.com/editor/rpc/getpapercontent/pid/${pid}/tokenpid/${tokenpid}/fromAction/view`
  const raw = await httpGet(apiUrl, jar, url)
  const payload = tryParsePayload(raw)

  const allQuestions = payload.filter(
    (item) =>
      typeof item.id === 'string' &&
      item.id.length > 2 &&
      (item.id.includes('_') || /^s\d+/.test(item.id || ''))
  )
  const targetQuestions = Number.isFinite(limit) && (limit || 0) > 0
    ? allQuestions.slice(0, Number(limit))
    : allQuestions
  const expectedRawQuestionIds = allQuestions
    .map((item) => item.id)
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
  const selectedRawQuestionIds = targetQuestions
    .map((item) => item.id)
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
  const questionGroups = deriveExamcooQuestionGroups(payload, selectedRawQuestionIds)
  const selectedGroupMap = new Map(
    questionGroups.flatMap((group) =>
      group.selectedQuestionIds.map((questionId) => [
        questionId,
        {
          groupId: group.groupId,
          groupTitle: group.title,
          sharedMaterial: group.material,
          sharedMaterialImageUrls: group.materialImageUrls,
        },
      ] as const)
    )
  )
  const skippedByLimitRawQuestionIds = expectedRawQuestionIds.filter(
    (questionId) => !selectedRawQuestionIds.includes(questionId)
  )

  const questions: ExamcooImportQuestion[] = []
  await onProgress?.({
    stage: 'CRAWLING',
    processedQuestionCount: 0,
    totalQuestionCount: targetQuestions.length,
    currentQuestionId: null,
  })

  for (let i = 0; i < targetQuestions.length; i++) {
    const item = targetQuestions[i]
    const questionId = item.id as string
    const numericId = questionId.split('_')[1] || ''
    const type = mapQuestionType(questionId)
    const stemHtml = String(item.a ?? '')
    const stemImageUrls = extractImageUrls(stemHtml)
    const optionsObj = parseOptions(item.b)
    const safeOptions = type === QuestionType.TRUE_FALSE ? ensureTrueFalseOptions(optionsObj) : optionsObj
    const optionImageUrls = safeOptions
      ? Array.from(
          new Set(
            Object.values(safeOptions).flatMap((value) => extractMarkdownImageUrls(value))
          )
        )
      : []
    const imageUrls = Array.from(new Set([...stemImageUrls, ...optionImageUrls]))
    const answer = parseAnswer(type, item.c, safeOptions ? Object.keys(safeOptions).length : 0)

    let explanation: string | null = null
    let explanationImageUrls: string[] = []
    try {
      const commentHtml = await httpPostForm(
        'https://www.examcoo.com/editor/comment/index',
        {
          id: numericId,
          sdtId: questionId,
          pid,
          p: '1',
          l: '0',
          msgid: '0',
          cmid: '0',
          tid: '0',
          verifydtid: '0',
          tokenpid,
        },
        jar,
        url
      )
      const explanationPayload = extractExplanation(commentHtml)
      explanation = explanationPayload.explanation
      explanationImageUrls = explanationPayload.explanationImageUrls
    } catch (error) {
      console.warn(`[Examcoo] 解析抓取失败 questionId=${questionId}:`, error)
    }

    questions.push({
      questionId,
      type,
      content: htmlToMarkdownWithImages(stemHtml),
      options: safeOptions,
      answer,
      explanation,
      explanationImageUrls,
      assetUrl: imageUrls[0] || null,
      imageUrls,
      groupId: selectedGroupMap.get(questionId)?.groupId ?? null,
      groupTitle: selectedGroupMap.get(questionId)?.groupTitle ?? null,
      sharedMaterial: selectedGroupMap.get(questionId)?.sharedMaterial ?? null,
      sharedMaterialImageUrls:
        selectedGroupMap.get(questionId)?.sharedMaterialImageUrls ?? [],
    })

    await onProgress?.({
      stage: 'CRAWLING',
      processedQuestionCount: i + 1,
      totalQuestionCount: targetQuestions.length,
      currentQuestionId: questionId,
    })

    if (i < targetQuestions.length - 1) {
      const jitter = Math.floor(Math.random() * DEFAULT_DELAY_JITTER_MS)
      await sleep(delayMs + jitter)
    }
  }

  return {
    paperId: pid,
    paperTitle,
    sourceTag: `examcoo:view:${pid}`,
    expectedQuestionCount: expectedRawQuestionIds.length,
    expectedRawQuestionIds,
    selectedQuestionCount: selectedRawQuestionIds.length,
    selectedRawQuestionIds,
    skippedByLimitRawQuestionIds,
    collectedQuestionCount: questions.length,
    collectedRawQuestionIds: questions.map((question) => question.questionId),
    questions,
    questionGroups,
  }
}
