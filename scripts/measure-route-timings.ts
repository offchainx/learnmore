import fs from 'fs'
import path from 'path'
import { performance as nodePerformance } from 'perf_hooks'
import { chromium, type Page } from 'playwright'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const OUT_DIR = '.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout'
const JSON_OUT = path.join(OUT_DIR, 't-026-browser-route-timings.json')
const MD_OUT = path.join(OUT_DIR, 't-026-browser-route-timings.md')
const BASE_URL = process.env.ROUTE_BASE_URL || 'http://localhost:3000'

type RouteSample = {
  scope: 'anon' | 'auth'
  label: string
  url: string
}

type RouteMetrics = RouteSample & {
  status: number | null
  finalUrl: string
  totalMs: number | null
  responseStartMs: number | null
  domInteractiveMs: number | null
  domContentLoadedMs: number | null
  loadMs: number | null
  navigationDurationMs: number | null
  redirectCount: number | null
  transferSize: number | null
  encodedBodySize: number | null
  decodedBodySize: number | null
  type: string | null
  firstPaintMs: number | null
  firstContentfulPaintMs: number | null
}

type NavigationMetrics = {
  responseStart: number
  domInteractive: number
  domContentLoadedEventEnd: number
  loadEventEnd: number
  duration: number
  redirectCount: number
  transferSize: number
  encodedBodySize: number
  decodedBodySize: number
  type: string
}

type PerformanceSnapshot = {
  nav: NavigationMetrics | null
  paints: { name: string; startTime: number }[]
}

type Samples = {
  blogSlug: string | null
  communityPostId: string | null
  userId: string | null
  feedbackId: string | null
  questionId: string | null
  paperId: string | null
}

const formatMs = (value: number | null) => (value == null ? '—' : `${Math.round(value)}ms`)
const round = (value: number | null | undefined) => (value == null || Number.isNaN(value) ? null : Math.round(value))

async function getSamples(prisma: PrismaClient): Promise<Samples> {
  const [blog, post, user, feedback, question, pastPaper] = await Promise.all([
    prisma.blogPost.findFirst({ orderBy: { createdAt: 'desc' }, select: { slug: true } }),
    prisma.post.findFirst({ orderBy: { createdAt: 'desc' }, select: { id: true } }),
    prisma.user.findFirst({ orderBy: { createdAt: 'desc' }, select: { id: true } }),
    prisma.userFeedback.findFirst({ orderBy: { createdAt: 'desc' }, select: { id: true } }),
    prisma.question.findFirst({ orderBy: { createdAt: 'desc' }, select: { id: true } }),
    prisma.question.findFirst({
      where: { isPastPaper: true, paperId: { not: null } },
      orderBy: { createdAt: 'desc' },
      select: { paperId: true },
    }),
  ])

  return {
    blogSlug: blog?.slug ?? null,
    communityPostId: post?.id ?? null,
    userId: user?.id ?? null,
    feedbackId: feedback?.id ?? null,
    questionId: question?.id ?? null,
    paperId: pastPaper?.paperId ?? null,
  }
}

async function measureRoute(page: Page, sample: RouteSample): Promise<RouteMetrics> {
  const startedAt = nodePerformance.now()
  const response = await page.goto(sample.url, {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  })

  await page.waitForTimeout(200)

  let metrics: PerformanceSnapshot | null = null

  try {
    metrics = await page.evaluate(() => {
      const nav = window.performance
        .getEntriesByType('navigation')
        .at(-1) as PerformanceNavigationTiming | undefined
      const paints = window.performance.getEntriesByType('paint').map((entry) => ({
        name: entry.name,
        startTime: entry.startTime,
      }))

      return {
        nav: nav
          ? {
              responseStart: nav.responseStart,
              domInteractive: nav.domInteractive,
              domContentLoadedEventEnd: nav.domContentLoadedEventEnd,
              loadEventEnd: nav.loadEventEnd,
              duration: nav.duration,
              redirectCount: nav.redirectCount,
              transferSize: nav.transferSize,
              encodedBodySize: nav.encodedBodySize,
              decodedBodySize: nav.decodedBodySize,
              type: nav.type,
            }
          : null,
        paints,
      }
    })
  } catch (error) {
    console.warn(`measureRoute evaluate failed for ${sample.label}:`, (error as Error).message)
  }

  const totalMs = nodePerformance.now() - startedAt
  const paints = Object.fromEntries(
    (metrics?.paints || []).map((entry: { name: string; startTime: number }) => [entry.name, entry.startTime])
  )
  const nav = metrics?.nav

  return {
    scope: sample.scope,
    label: sample.label,
    url: sample.url,
    status: response ? response.status() : null,
    finalUrl: page.url(),
    totalMs: round(totalMs),
    responseStartMs: round(nav?.responseStart),
    domInteractiveMs: round(nav?.domInteractive),
    domContentLoadedMs: round(nav?.domContentLoadedEventEnd),
    loadMs: round(nav?.loadEventEnd),
    navigationDurationMs: round(nav?.duration),
    redirectCount: nav?.redirectCount ?? null,
    transferSize: nav?.transferSize ?? null,
    encodedBodySize: nav?.encodedBodySize ?? null,
    decodedBodySize: nav?.decodedBodySize ?? null,
    type: nav?.type || null,
    firstPaintMs: round(paints['first-paint']),
    firstContentfulPaintMs: round(paints['first-contentful-paint']),
  }
}

async function login(page: Page) {
  await page.goto(`${BASE_URL}/login`, {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  })
  await page.fill('#email', 'admin_ui_test@learnmore.com')
  await page.fill('#password', 'Password123!')
  await Promise.all([
    page.waitForURL(/\/dashboard/),
    page.getByRole('button', { name: '登录' }).click(),
  ])
}

function buildMarkdown(results: RouteMetrics[]) {
  const lines: string[] = []
  lines.push('# T-026 浏览器路由实测')
  lines.push('')
  lines.push('| scope | route | status | finalUrl | total | ttfb | dcl | load | fcp |')
  lines.push('|---|---|---:|---|---:|---:|---:|---:|---:|')
  for (const r of results) {
    lines.push(
      `| ${r.scope} | ${r.label} | ${r.status ?? '—'} | ${r.finalUrl} | ${formatMs(r.totalMs)} | ${formatMs(r.responseStartMs)} | ${formatMs(r.domContentLoadedMs)} | ${formatMs(r.loadMs)} | ${formatMs(r.firstContentfulPaintMs)} |`
    )
  }
  lines.push('')
  return lines.join('\n')
}

function sortResults(results: RouteMetrics[]) {
  return [...results].sort((a, b) => {
    if (a.scope !== b.scope) return a.scope.localeCompare(b.scope)
    return a.label.localeCompare(b.label, 'en')
  })
}

async function main() {
  const prisma = new PrismaClient()
  const samples = await getSamples(prisma)
  const headless = process.env.PW_HEADLESS !== 'false'

  const publicRoutes: Array<RouteSample | null> = [
    { scope: 'anon', label: '/', url: `${BASE_URL}/` },
    { scope: 'anon', label: '/about-us', url: `${BASE_URL}/about-us` },
    { scope: 'anon', label: '/blog', url: `${BASE_URL}/blog` },
    samples.blogSlug ? { scope: 'anon', label: `/blog/${samples.blogSlug}`, url: `${BASE_URL}/blog/${encodeURIComponent(samples.blogSlug)}` } : null,
    { scope: 'anon', label: '/contact', url: `${BASE_URL}/contact` },
    { scope: 'anon', label: '/help', url: `${BASE_URL}/help` },
    { scope: 'anon', label: '/how-it-works', url: `${BASE_URL}/how-it-works` },
    { scope: 'anon', label: '/login', url: `${BASE_URL}/login` },
    { scope: 'anon', label: '/pricing', url: `${BASE_URL}/pricing` },
    { scope: 'anon', label: '/privacy', url: `${BASE_URL}/privacy` },
    { scope: 'anon', label: '/refund', url: `${BASE_URL}/refund` },
    { scope: 'anon', label: '/register', url: `${BASE_URL}/register` },
    { scope: 'anon', label: '/student-care', url: `${BASE_URL}/student-care` },
    { scope: 'anon', label: '/study-guides', url: `${BASE_URL}/study-guides` },
    { scope: 'anon', label: '/subjects', url: `${BASE_URL}/subjects` },
    { scope: 'anon', label: '/success-stories', url: `${BASE_URL}/success-stories` },
    { scope: 'anon', label: '/terms', url: `${BASE_URL}/terms` },
    { scope: 'anon', label: '/course/demo', url: `${BASE_URL}/course/demo` },
    { scope: 'anon', label: '/course/demo/lesson-1', url: `${BASE_URL}/course/demo/lesson-1` },
  ]

  const authRoutes: Array<RouteSample | null> = [
    { scope: 'auth', label: '/dashboard', url: `${BASE_URL}/dashboard` },
    { scope: 'auth', label: '/dashboard/achievements', url: `${BASE_URL}/dashboard/achievements` },
    { scope: 'auth', label: '/dashboard/community', url: `${BASE_URL}/dashboard/community` },
    { scope: 'auth', label: '/dashboard/community/new', url: `${BASE_URL}/dashboard/community/new` },
    samples.communityPostId ? { scope: 'auth', label: `/dashboard/community/${samples.communityPostId}`, url: `${BASE_URL}/dashboard/community/${encodeURIComponent(samples.communityPostId)}` } : null,
    { scope: 'auth', label: '/dashboard/courses', url: `${BASE_URL}/dashboard/courses` },
    { scope: 'auth', label: '/dashboard/leaderboard', url: `${BASE_URL}/dashboard/leaderboard` },
    { scope: 'auth', label: '/dashboard/practice', url: `${BASE_URL}/dashboard/practice` },
    { scope: 'auth', label: '/dashboard/practice/error-wiper', url: `${BASE_URL}/dashboard/practice/error-wiper` },
    { scope: 'auth', label: '/dashboard/practice/mock-arena', url: `${BASE_URL}/dashboard/practice/mock-arena` },
    { scope: 'auth', label: '/dashboard/practice/mock-arena/browser-measure-exam', url: `${BASE_URL}/dashboard/practice/mock-arena/browser-measure-exam` },
    samples.paperId ? { scope: 'auth', label: `/dashboard/practice/past-paper/${samples.paperId}`, url: `${BASE_URL}/dashboard/practice/past-paper/${encodeURIComponent(samples.paperId)}` } : null,
    { scope: 'auth', label: '/dashboard/practice/smart-drill', url: `${BASE_URL}/dashboard/practice/smart-drill` },
    { scope: 'auth', label: '/dashboard/practice/chapter-drill/preview-1', url: `${BASE_URL}/dashboard/practice/chapter-drill/preview-1` },
    { scope: 'auth', label: '/dashboard/settings', url: `${BASE_URL}/dashboard/settings` },
    { scope: 'auth', label: '/admin', url: `${BASE_URL}/admin` },
    { scope: 'auth', label: '/admin/feedback', url: `${BASE_URL}/admin/feedback` },
    samples.feedbackId ? { scope: 'auth', label: `/admin/feedback/${samples.feedbackId}`, url: `${BASE_URL}/admin/feedback/${encodeURIComponent(samples.feedbackId)}` } : null,
    { scope: 'auth', label: '/admin/content/import', url: `${BASE_URL}/admin/content/import` },
    { scope: 'auth', label: '/admin/content/reports', url: `${BASE_URL}/admin/content/reports` },
    { scope: 'auth', label: '/admin/content/review', url: `${BASE_URL}/admin/content/review` },
    { scope: 'auth', label: '/admin/content/review/slow-path', url: `${BASE_URL}/admin/content/review/slow-path` },
    samples.questionId ? { scope: 'auth', label: `/admin/content/review/${samples.questionId}`, url: `${BASE_URL}/admin/content/review/${encodeURIComponent(samples.questionId)}` } : null,
    { scope: 'auth', label: '/admin/referrals', url: `${BASE_URL}/admin/referrals` },
    { scope: 'auth', label: '/admin/users', url: `${BASE_URL}/admin/users` },
    samples.userId ? { scope: 'auth', label: `/admin/users/${samples.userId}`, url: `${BASE_URL}/admin/users/${encodeURIComponent(samples.userId)}` } : null,
    { scope: 'auth', label: '/admin/vouchers', url: `${BASE_URL}/admin/vouchers` },
  ]

  const browser = await chromium.launch({ headless })

  const publicContext = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const publicPage = await publicContext.newPage()
  const publicResults: RouteMetrics[] = []
  for (const route of publicRoutes.filter(Boolean) as RouteSample[]) {
    publicResults.push(await measureRoute(publicPage, route))
  }

  const authContext = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const authPage = await authContext.newPage()
  await login(authPage)

  await authPage.evaluate(({ examId }) => {
    const examQuestions = [
      {
        id: 'browser-measure-q1',
        type: 'SINGLE_CHOICE',
        content: '浏览器路由实测示例题 1',
        options: { A: 'A', B: 'B', C: 'C', D: 'D' },
        answer: 'A',
        explanation: 'demo',
        difficulty: 1,
        group: null,
      },
      {
        id: 'browser-measure-q2',
        type: 'FILL_BLANK',
        content: '浏览器路由实测示例题 2',
        options: null,
        answer: 'demo',
        explanation: 'demo',
        difficulty: 1,
        group: null,
      },
    ]

    sessionStorage.setItem(
      `exam_${examId}`,
      JSON.stringify({
        questions: examQuestions,
        timeLimit: 1200,
        startTime: Date.now(),
      })
    )
  }, { examId: 'browser-measure-exam' })

  const authResults: RouteMetrics[] = []
  for (const route of authRoutes.filter(Boolean) as RouteSample[]) {
    authResults.push(await measureRoute(authPage, route))
  }

  const allResults = sortResults([...publicResults, ...authResults])
  const summary = {
    total: allResults.length,
    public: publicResults.length,
    auth: authResults.length,
    slowest: [...allResults]
      .sort((a, b) => (b.totalMs ?? 0) - (a.totalMs ?? 0))
      .slice(0, 8)
      .map((item) => ({
        label: item.label,
        scope: item.scope,
        totalMs: item.totalMs,
        responseStartMs: item.responseStartMs,
        domContentLoadedMs: item.domContentLoadedMs,
        firstContentfulPaintMs: item.firstContentfulPaintMs,
      })),
  }

  fs.mkdirSync(OUT_DIR, { recursive: true })
  fs.writeFileSync(JSON_OUT, JSON.stringify({ samples, summary, results: allResults }, null, 2))
  fs.writeFileSync(MD_OUT, buildMarkdown(allResults))

  console.log(JSON.stringify({ samples, summary, jsonOut: JSON_OUT, mdOut: MD_OUT, headless }, null, 2))

  await publicContext.close()
  await authContext.close()
  await browser.close()
  await prisma.$disconnect()
}

main().catch(async (error) => {
  console.error(error)
  process.exitCode = 1
})
