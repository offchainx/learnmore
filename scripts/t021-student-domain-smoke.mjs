import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright'

const BASE_URL = process.env.T021_BASE_URL || 'http://127.0.0.1:3000'
const PASSWORD = process.env.T021_STUDENT_PASSWORD || 'Password123!'
const STUDENT_UI_EMAIL = 'student_ui_test@learnmore.com'
const STUDENT_LOW_DATA_EMAIL = 'student1@mail.com'
const BATCH = `T021-local-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`
const EVIDENCE_DIR = path.join('/tmp', 'learn-more-evidence', BATCH)

function sanitizeSegment(value) {
  return value.replace(/[^a-zA-Z0-9-_]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase()
}

async function ensureDir() {
  await mkdir(EVIDENCE_DIR, { recursive: true })
}

function attachIssueCollectors(page, issues, routeRef) {
  page.on('console', (message) => {
    if (message.type() === 'error') {
      issues.push({
        type: 'console',
        route: routeRef.current,
        message: message.text(),
      })
    }
  })

  page.on('pageerror', (error) => {
    issues.push({
      type: 'pageerror',
      route: routeRef.current,
      message: error.message,
    })
  })
}

async function screenshot(page, name) {
  const file = path.join(EVIDENCE_DIR, `${name}.png`)
  await page.screenshot({ path: file, fullPage: true })
  return file
}

async function login(page, email, password, redirectTo = '/dashboard') {
  await page.goto(`${BASE_URL}/login?redirectTo=${encodeURIComponent(redirectTo)}`, {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  })
  await page.fill('#email', email)
  await page.fill('#password', password)
  await Promise.all([
    page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 30000 }),
    page.getByRole('button', { name: /登录|log in/i }).click(),
  ])
}

async function checkGuestRedirect(page, target, issues) {
  const routeRef = { current: target }
  attachIssueCollectors(page, issues, routeRef)
  await page.goto(`${BASE_URL}${target}`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForTimeout(1000)
  const finalUrl = page.url()
  const shot = await screenshot(page, `${sanitizeSegment(target)}-guest-redirect`)
  return {
    route: target,
    finalUrl,
    ok: finalUrl.includes('/login'),
    screenshot: shot,
    note: finalUrl.includes('/login') ? 'redirected to login' : 'guest guard missing',
  }
}

async function openProtectedRoute(page, target, shotName) {
  await page.goto(`${BASE_URL}${target}`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForTimeout(1500)
  const finalUrl = page.url()
  const shot = await screenshot(page, shotName)
  const text = await page.locator('body').innerText()
  return {
    route: target,
    finalUrl,
    ok: !/not found|404/i.test(text),
    screenshot: shot,
    note: /not found|404/i.test(text) ? 'route rendered 404/not found state' : undefined,
  }
}

async function findFirstAnswerableControl(page) {
  const radio = page.locator('input[type="radio"]').first()
  if ((await radio.count()) > 0) {
    await radio.check()
    return 'radio'
  }

  const checkbox = page.locator('input[type="checkbox"]').first()
  if ((await checkbox.count()) > 0) {
    await checkbox.check()
    return 'checkbox'
  }

  const text = page.locator('input[type="text"]').first()
  if ((await text.count()) > 0) {
    await text.fill('A')
    return 'text'
  }

  return null
}

async function runPracticeSubmission(page, userId) {
  void userId
  await page.goto(`${BASE_URL}/dashboard/practice/past-paper/2306416`, {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  })
  await page.waitForTimeout(2000)

  const answeredWith = await findFirstAnswerableControl(page)
  if (!answeredWith) {
    return {
      finalUrl: page.url(),
      success: false,
      note: 'no answerable control found on past paper page',
    }
  }

  const submitButton = page.getByRole('button', { name: /提交真题|提交试卷|提交/i }).first()
  await submitButton.click()
  await page.getByRole('button', { name: /提交真题|提交试卷|提交/i }).last().click()
  await page.waitForTimeout(4000)

  const shot = await screenshot(page, 'student-practice-past-paper-result')
  const successText = await page.locator('body').innerText()

  return {
    finalUrl: page.url(),
    success: /真题练习完成|练习完成|返回练习中心/.test(successText),
    screenshot: shot,
    note: `answeredWith=${answeredWith}`,
  }
}

async function runCommunityPost(page, userId) {
  void userId
  const unique = Date.now().toString().slice(-6)
  const title = `T021 Smoke ${unique}`
  const content = `T-021.6 community smoke post ${unique}`

  await page.goto(`${BASE_URL}/dashboard/community/new`, {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  })
  await page.waitForTimeout(1500)

  await page.fill('input[placeholder]', title)
  await page.locator('select').first().selectOption({ index: 1 })
  await page.locator('textarea').fill(content)

  await Promise.all([
    page.waitForURL(/\/dashboard\/community\/[a-f0-9-]+/i, { timeout: 30000 }),
    page.getByRole('button', { name: /发布帖子|publish post|terbitkan siaran/i }).click(),
  ])

  await page.waitForTimeout(2500)
  const finalUrl = page.url()
  const createdPostId = finalUrl.split('/').pop() || null
  const shot = await screenshot(page, 'student-community-post-detail')
  const text = await page.locator('body').innerText()

  return {
    createdPostId,
    finalUrl,
    success: Boolean(createdPostId) && text.includes(title),
    screenshot: shot,
    note: title,
  }
}

async function buildMobileChecks(browserContext) {
  const page = await browserContext.newPage()
  await login(page, STUDENT_UI_EMAIL, PASSWORD)
  const checks = []
  for (const route of ['/dashboard', '/dashboard/practice', '/dashboard/community']) {
    checks.push(
      await openProtectedRoute(
        page,
        route,
        `mobile-${sanitizeSegment(route)}`,
      ),
    )
  }
  await page.close()
  return checks
}

async function main() {
  await ensureDir()

  const browser = await chromium.launch({ headless: true })
  const issues = []

  const guestPage = await browser.newPage()
  const guest = [
    await checkGuestRedirect(guestPage, '/dashboard', issues),
    await checkGuestRedirect(guestPage, '/dashboard/community', issues),
  ]
  await guestPage.close()

  const studentContext = await browser.newContext({ viewport: { width: 1440, height: 960 } })
  const studentPage = await studentContext.newPage()
  const routeRef = { current: '/login' }
  attachIssueCollectors(studentPage, issues, routeRef)

  await login(studentPage, STUDENT_UI_EMAIL, PASSWORD)

  routeRef.current = '/dashboard'
  const dashboard = await openProtectedRoute(studentPage, '/dashboard', 'student-dashboard')

  routeRef.current = '/dashboard/courses'
  const courses = await openProtectedRoute(studentPage, '/dashboard/courses', 'student-courses')

  routeRef.current = '/dashboard/practice'
  const practice = await openProtectedRoute(studentPage, '/dashboard/practice', 'student-practice')

  routeRef.current = '/dashboard/community'
  const community = await openProtectedRoute(studentPage, '/dashboard/community', 'student-community')

  routeRef.current = '/course/preview'
  const courseSubject404 = await openProtectedRoute(studentPage, '/course/preview', 'student-course-subject-404')

  routeRef.current = '/course/preview/lesson-1'
  const courseLesson404 = await openProtectedRoute(studentPage, '/course/preview/lesson-1', 'student-course-lesson-404')

  routeRef.current = '/dashboard/practice/past-paper/2306416'
  const practiceSubmission = await runPracticeSubmission(studentPage, 'student-ui')

  routeRef.current = '/dashboard/community/new'
  const communityPost = await runCommunityPost(studentPage, 'student-ui')

  await studentPage.close()
  await studentContext.close()

  const lowDataContext = await browser.newContext({ viewport: { width: 1440, height: 960 } })
  const lowDataPage = await lowDataContext.newPage()
  const lowDataRouteRef = { current: '/login' }
  attachIssueCollectors(lowDataPage, issues, lowDataRouteRef)

  let lowDataDashboard
  let lowDataNote
  let lowDataLoginSuccess = false

  try {
    await login(lowDataPage, STUDENT_LOW_DATA_EMAIL, PASSWORD)
    lowDataLoginSuccess = true
    lowDataRouteRef.current = '/dashboard'
    lowDataDashboard = await openProtectedRoute(lowDataPage, '/dashboard', 'student-low-data-dashboard')
  } catch (error) {
    lowDataNote = error instanceof Error ? error.message : String(error)
  }

  await lowDataPage.close()
  await lowDataContext.close()

  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const mobile = await buildMobileChecks(mobileContext)
  await mobileContext.close()

  await browser.close()

  const summary = {
    batch: BATCH,
    baseUrl: BASE_URL,
    executedAt: new Date().toISOString(),
    guest,
    studentUi: {
      dashboard,
      courses,
      practice,
      community,
      courseSubject404,
      courseLesson404,
      practiceSubmission,
      communityPost,
    },
    studentLowData: {
      loginSuccess: lowDataLoginSuccess,
      dashboard: lowDataDashboard,
      note: lowDataNote,
    },
    mobile,
    consoleIssues: issues,
  }

  const summaryFile = path.join(EVIDENCE_DIR, 't021-6-student-domain-summary.json')
  await writeFile(summaryFile, `${JSON.stringify(summary, null, 2)}\n`, 'utf8')
  console.log(JSON.stringify(summary, null, 2))
}

main().catch(async (error) => {
  console.error('[t021-student-domain-smoke] failed', error)
  process.exitCode = 1
})
