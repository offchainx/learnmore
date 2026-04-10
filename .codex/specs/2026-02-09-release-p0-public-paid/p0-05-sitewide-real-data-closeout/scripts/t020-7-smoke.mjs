import fs from 'fs'
import path from 'path'
import { chromium } from 'playwright'

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3101'
const OUT_DIR = path.join(
  process.cwd(),
  '.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260410'
)

function requiredEnv(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required env: ${name}`)
  }
  return value
}

async function dismissCookieBanner(page) {
  const acceptButton = page.getByRole('button', { name: 'Accept' })
  if (await acceptButton.isVisible().catch(() => false)) {
    await acceptButton.click().catch(() => {})
    await page.waitForTimeout(300)
  }
}

async function capturePage(page, fileName, fullPage = true) {
  await page.screenshot({
    path: path.join(OUT_DIR, fileName),
    fullPage,
  })
}

async function summarizePage(page) {
  const heading = await page.locator('h1').first().textContent().catch(() => null)
  const bodyText = (await page.evaluate(() => document.body?.innerText || '').catch(() => null)) || ''
  const combined = `${heading || ''}\n${bodyText}`.toLowerCase()
  return {
    url: page.url(),
    title: await page.title().catch(() => null),
    heading: heading?.trim() || null,
    has404: combined.includes('404') || combined.includes('page not found') || combined.includes('找不到页面'),
    has403: combined.includes('forbidden') || combined.includes('无权限') || combined.includes('403'),
    bodySnippet: bodyText.slice(0, 220),
  }
}

async function login(page, email, password, redirectTo) {
  await page.goto(`${BASE_URL}/login${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`, {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  })
  await page.locator('#email').waitFor({ timeout: 30000 })
  await page.fill('#email', email)
  await page.fill('#password', password)
  await page.getByRole('button', { name: '登录' }).click()
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => {})
  await page.waitForTimeout(2000)
  await dismissCookieBanner(page)
}

async function runPublicSmoke(page) {
  const pages = [
    { url: '/', file: 'public-home.png' },
    { url: '/pricing', file: 'public-pricing.png' },
    { url: '/blog', file: 'public-blog.png' },
    { url: '/contact', file: 'public-contact.png' },
    { url: '/help', file: 'public-help.png' },
    { url: '/subjects', file: 'public-subjects.png' },
    { url: '/login', file: 'public-login.png' },
  ]

  const results = []
  for (const item of pages) {
    console.log(`[public] ${item.url}`)
    await page.goto(`${BASE_URL}${item.url}`, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(600)
    await dismissCookieBanner(page)
    await capturePage(page, item.file)
    results.push({ entry: item.url, ...(await summarizePage(page)) })
  }

  console.log('[public] /does-not-exist-for-smoke')
  await page.goto(`${BASE_URL}/does-not-exist-for-smoke`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForTimeout(600)
  results.push({ entry: '/does-not-exist-for-smoke', ...(await summarizePage(page)) })
  await capturePage(page, 'public-404.png', false)

  return results
}

async function runStudentSmoke(page, subjectId) {
  const results = []
  const routes = [
    { url: '/dashboard', file: 'student-dashboard.png' },
    { url: '/dashboard/practice', file: 'student-practice-center.png' },
    { url: '/dashboard/leaderboard', file: 'student-leaderboard.png' },
    { url: '/dashboard/achievements', file: 'student-achievements.png' },
    { url: '/dashboard/settings', file: 'student-settings.png' },
    { url: '/dashboard/settings?tab=notifications', file: 'student-settings-notifications.png' },
    { url: '/dashboard/community', file: 'student-community.png' },
    { url: '/dashboard/community/new', file: 'student-community-new.png' },
    { url: `/dashboard/practice/smart-drill?subjectId=${encodeURIComponent(subjectId)}&preview=mock`, file: 'student-smart-drill-preview.png' },
  ]

  for (const item of routes) {
    console.log(`[student] ${item.url}`)
    await page.goto(`${BASE_URL}${item.url}`, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(600)
    await dismissCookieBanner(page)
    await capturePage(page, item.file, !item.url.includes('community') && !item.url.includes('settings'))
    results.push({ entry: item.url, ...(await summarizePage(page)) })
  }

  console.log('[student] /dashboard reload')
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForTimeout(600)
  const beforeReload = await summarizePage(page)
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForTimeout(600)
  const afterReload = await summarizePage(page)
  results.push({
    entry: '/dashboard#reload',
    beforeReload,
    afterReload,
    preservedPath: new URL(afterReload.url).pathname === '/dashboard',
  })

  console.log('[student] back navigation')
  await page.goto(`${BASE_URL}/dashboard/leaderboard`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForTimeout(600)
  await page.goto(`${BASE_URL}/dashboard/achievements`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForTimeout(600)
  await page.goBack({ waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForTimeout(600)
  results.push({
    entry: '/dashboard/back',
    ...(await summarizePage(page)),
  })

  return results
}

async function runAdminSmoke(page) {
  const results = []
  const routes = [
    { url: '/admin', file: 'admin-home.png' },
    { url: '/admin/feedback', file: 'admin-feedback-list.png' },
    { url: '/admin/content/import', file: 'admin-content-import.png' },
    { url: '/admin/content/review', file: 'admin-content-review.png' },
    { url: '/admin/users', file: 'admin-users.png' },
    { url: '/admin/rewards', file: 'admin-rewards.png' },
  ]

  for (const item of routes) {
    console.log(`[admin] ${item.url}`)
    await page.goto(`${BASE_URL}${item.url}`, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(600)
    await dismissCookieBanner(page)
    await capturePage(page, item.file, !item.url.includes('review') && !item.url.includes('feedback'))
    results.push({ entry: item.url, ...(await summarizePage(page)) })
  }

  return results
}

async function runMobileSmoke(page, subjectId) {
  const routes = [
    { url: '/pricing', file: 'mobile-pricing.png' },
    { url: '/dashboard', file: 'mobile-dashboard.png' },
    { url: `/dashboard/practice/smart-drill?subjectId=${encodeURIComponent(subjectId)}&preview=mock`, file: 'mobile-smart-drill.png' },
  ]

  const results = []
  for (const item of routes) {
    console.log(`[mobile] ${item.url}`)
    await page.goto(`${BASE_URL}${item.url}`, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(600)
    await dismissCookieBanner(page)
    await capturePage(page, item.file, false)
    results.push({ entry: item.url, ...(await summarizePage(page)) })
  }
  return results
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })

  const password = requiredEnv('UI_PASS')
  const studentEmail = process.env.STUDENT_EMAIL || 'student_ui_test@learnmore.com'
  const adminEmail = process.env.ADMIN_EMAIL || 'admin_ui_test@learnmore.com'
  const subjectId = process.env.SMOKE_SUBJECT_ID || '72844ae3-6f0d-4cfd-8add-70de535aa316'

  const browser = await chromium.launch({ headless: true })

  const publicContext = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const publicPage = await publicContext.newPage()
  const publicResults = await runPublicSmoke(publicPage)
  await publicContext.close()

  const studentContext = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const studentPage = await studentContext.newPage()
  await login(studentPage, studentEmail, password, '/dashboard')
  const studentLoginResult = await summarizePage(studentPage)
  const studentResults = await runStudentSmoke(studentPage, subjectId)
  await studentContext.close()

  const adminContext = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const adminPage = await adminContext.newPage()
  await login(adminPage, adminEmail, password, '/admin')
  const adminLoginResult = await summarizePage(adminPage)
  const adminResults = await runAdminSmoke(adminPage)
  await adminContext.close()

  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true })
  const mobilePage = await mobileContext.newPage()
  await mobilePage.goto(`${BASE_URL}/pricing`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await mobilePage.waitForTimeout(1200)
  await capturePage(mobilePage, 'mobile-pricing.png')
  await mobilePage.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await mobilePage.waitForTimeout(1200)
  await capturePage(mobilePage, 'mobile-dashboard.png')
  await mobileContext.close()

  await browser.close()

  const report = {
    at: new Date().toISOString(),
    baseUrl: BASE_URL,
    subjectId,
    studentEmail,
    adminEmail,
    publicResults,
    studentLoginResult,
    studentResults,
    adminLoginResult,
    adminResults,
    mobile: [
      { entry: '/pricing', screenshot: 'mobile-pricing.png' },
      { entry: '/dashboard', screenshot: 'mobile-dashboard.png' },
    ],
  }

  fs.writeFileSync(path.join(OUT_DIR, 't020-7-smoke-report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
