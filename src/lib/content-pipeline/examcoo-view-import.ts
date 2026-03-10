import { QuestionType } from '@prisma/client'

const DEFAULT_DELAY_MS = 1200

interface CookieJarStore {
  [name: string]: string
}

export interface ExamcooImportQuestion {
  questionId: string
  type: QuestionType
  content: string
  options: Record<string, string> | null
  answer: string | string[] | null
  explanation: string | null
  assetUrl: string | null
  imageUrls: string[]
}

export interface ExamcooImportResult {
  paperId: string
  paperTitle: string
  sourceTag: string
  questions: ExamcooImportQuestion[]
}

interface CrawlExamcooViewOptions {
  url: string
  limit?: number
  delayMs?: number
}

interface RawExamcooQuestion {
  id?: string
  a?: string
  b?: string
  c?: string
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
  if (/^https?:\/\//i.test(value)) return value
  if (value.startsWith('//')) return `https:${value}`

  if (attrName === '_djrealurl') {
    return `https://img.examcoo.com${value.startsWith('/') ? '' : '/'}${value}`
  }

  return `https://www.examcoo.com${value.startsWith('/') ? '' : '/'}${value}`
}

function extractImageUrls(html = ''): string[] {
  const urls: string[] = []
  const regex = /<img[^>]*?(_djrealurl|src)=["']([^"']+)["'][^>]*>/gi
  let match = regex.exec(html)
  while (match) {
    urls.push(normalizeImageUrl(match[2], match[1].toLowerCase()))
    match = regex.exec(html)
  }
  return urls
}

function htmlToMarkdownWithImages(html = ''): string {
  const withImageMd = html.replace(
    /<img[^>]*?(_djrealurl|src)=["']([^"']+)["'][^>]*>/gi,
    (_all, attrName: string, url: string) => `\n![题图](${normalizeImageUrl(url, attrName.toLowerCase())})\n`
  )
  const plain = decodeHtml(withImageMd).replace(/<[^>]+>/g, '')
  return plain.replace(/\n{3,}/g, '\n\n').trim()
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

function extractExplanation(commentHtml: string): string | null {
  const match = commentHtml.match(
    /试题解析：<\/div><div>([\s\S]*?)<\/div><div class="marginTop8 bold">纠错或评论：/
  )
  if (!match) return null
  const cleaned = decodeHtml(match[1]).replace(/<[^>]+>/g, '').trim()
  return cleaned || null
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

  const res = await fetch(url, { method: 'GET', headers, cache: 'no-store' })
  jar.ingestFromResponse(res)
  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`)
  return res.text()
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
  const res = await fetch(url, { method: 'POST', headers, body, cache: 'no-store' })
  jar.ingestFromResponse(res)
  if (!res.ok) throw new Error(`POST ${url} failed: ${res.status}`)
  return res.text()
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
  const { url, limit, delayMs = DEFAULT_DELAY_MS } = options
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

  const questions: ExamcooImportQuestion[] = []

  for (let i = 0; i < targetQuestions.length; i++) {
    const item = targetQuestions[i]
    const questionId = item.id as string
    const numericId = questionId.split('_')[1] || ''
    const type = mapQuestionType(questionId)
    const stemHtml = String(item.a ?? '')
    const imageUrls = extractImageUrls(stemHtml)
    const optionsObj = parseOptions(item.b)
    const safeOptions = type === QuestionType.TRUE_FALSE ? ensureTrueFalseOptions(optionsObj) : optionsObj
    const answer = parseAnswer(type, item.c, safeOptions ? Object.keys(safeOptions).length : 0)

    let explanation: string | null = null
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
      explanation = extractExplanation(commentHtml)
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
      assetUrl: imageUrls[0] || null,
      imageUrls,
    })

    if (i < targetQuestions.length - 1) {
      const jitter = Math.floor(Math.random() * 300)
      await sleep(delayMs + jitter)
    }
  }

  return {
    paperId: pid,
    paperTitle,
    sourceTag: `examcoo:view:${pid}`,
    questions,
  }
}
