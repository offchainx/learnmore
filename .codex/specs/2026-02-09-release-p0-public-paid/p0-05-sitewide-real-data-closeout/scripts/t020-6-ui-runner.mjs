import fs from 'fs'
import path from 'path'
import { chromium } from 'playwright'

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3000'
const OUT_DIR = path.join(
  process.cwd(),
  '.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260409'
)

function requiredEnv(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required env: ${name}`)
  }
  return value
}

async function login(page, email, password, redirectTo) {
  await page.goto(`${BASE_URL}/login`, {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  })
  await page.locator('#email').waitFor({ timeout: 30000 })
  await page.fill('#email', email)
  await page.fill('#password', password)
  await page.getByRole('button', { name: '登录' }).click()
  await page.waitForURL((value) => !value.href.includes('/login'), {
    timeout: 30000,
  })
  await page.waitForTimeout(2500)
  if (redirectTo && !page.url().includes(redirectTo)) {
    await page.goto(`${BASE_URL}${redirectTo}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    })
    await page.waitForTimeout(2500)
  }
}

async function dismissCookieBanner(page) {
  const acceptButton = page.getByRole('button', { name: 'Accept' })
  if (await acceptButton.isVisible().catch(() => false)) {
    await acceptButton.click()
    await page.waitForTimeout(500)
  }
}

async function runClaimLoginReward() {
  const password = requiredEnv('UI_PASS')
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  })
  const page = await context.newPage()

  await login(page, 'student_ui_test@learnmore.com', password, '/dashboard')
  await dismissCookieBanner(page)

  const claimButton = page.getByRole('button', { name: /领取|Claim/ }).first()
  await claimButton.waitFor({ timeout: 30000 })
  const beforeText = await claimButton.innerText()

  await page.screenshot({
    path: path.join(OUT_DIR, 'student-dashboard-login-reward-before.png'),
    fullPage: true,
  })

  await claimButton.click()
  await page.waitForTimeout(3000)

  const rowState = await page.locator('body').textContent()
  const xpTexts = await page.locator('text=/XP/').evaluateAll((nodes) =>
    nodes.slice(0, 10).map((node) => node.textContent)
  )
  const finalUrl = page.url()

  await page.screenshot({
    path: path.join(OUT_DIR, 'student-dashboard-login-reward-after.png'),
    fullPage: true,
  })

  await context.close()
  await browser.close()

  return {
    scenario: 'claim-login-reward',
    beforeText,
    containsClaimedLabel: rowState?.includes('已领取') ?? false,
    xpTexts,
    finalUrl,
  }
}

async function setFeedbackStatus(targetStatus, note) {
  const password = requiredEnv('UI_PASS')
  const feedbackId = requiredEnv('FEEDBACK_ID')
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  })
  const page = await context.newPage()

  await login(
    page,
    'admin_ui_test@learnmore.com',
    password,
    `/admin/feedback/${feedbackId}`
  )
  await dismissCookieBanner(page)

  await page.getByRole('button', { name: 'Internal Note' }).click()

  const nextStatusTrigger = page.locator('text=NEXT STATUS:').locator('xpath=following::button[1]')
  await nextStatusTrigger.click()

  const labelMap = {
    PENDING: '待处理',
    IN_PROGRESS: '处理中',
    RESOLVED: '已解决',
    REJECTED: '已拒绝',
    CLOSED: '已关闭',
  }

  const nextStatusLabel = labelMap[targetStatus]
  if (!nextStatusLabel) {
    throw new Error(`Unsupported target status: ${targetStatus}`)
  }

  await page.getByRole('option', { name: nextStatusLabel }).click()
  await page.locator('textarea').fill(note)

  const beforeScreenshot = `admin-feedback-${targetStatus.toLowerCase()}-before.png`
  const afterScreenshot = `admin-feedback-${targetStatus.toLowerCase()}-after.png`

  await page.screenshot({
    path: path.join(OUT_DIR, beforeScreenshot),
    fullPage: true,
  })

  await page.getByRole('button', { name: 'Add Note' }).click()
  await page.waitForTimeout(3000)

  const bodyText = (await page.locator('body').textContent()) ?? ''
  const finalUrl = page.url()

  await page.screenshot({
    path: path.join(OUT_DIR, afterScreenshot),
    fullPage: true,
  })

  await context.close()
  await browser.close()

  return {
    scenario: 'feedback-transition',
    feedbackId,
    targetStatus,
    nextStatusLabel,
    note,
    finalUrl,
    containsSuccessToast:
      bodyText.includes('内部备注已记录') || bodyText.includes('回复已发送'),
    containsTargetStatus: bodyText.includes(nextStatusLabel),
    beforeScreenshot,
    afterScreenshot,
  }
}

function parseAnswersMap() {
  const raw = requiredEnv('SMART_DRILL_ANSWERS')
  const parsed = JSON.parse(raw)
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('SMART_DRILL_ANSWERS must be a JSON object keyed by question id')
  }
  return parsed
}

async function answerQuestion(section, questionId, answer) {
  if (Array.isArray(answer)) {
    for (const option of answer) {
      await section.locator(`#question-${questionId}-option-${option}`).click()
    }
    return
  }

  if (answer === null || answer === undefined) {
    return
  }

  const fillBlank = section.locator(`#fill-blank-answer-${questionId}`)
  if (await fillBlank.count()) {
    await fillBlank.fill(String(answer))
    return
  }

  await section.locator(`#question-${questionId}-option-${answer}`).click()
}

async function runSmartDrillSubmit() {
  const password = requiredEnv('UI_PASS')
  const subjectId = requiredEnv('SMART_DRILL_SUBJECT_ID')
  const answersMap = parseAnswersMap()
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
  })
  const page = await context.newPage()

  await login(
    page,
    'student_ui_test@learnmore.com',
    password,
    `/dashboard/practice/smart-drill?subjectId=${encodeURIComponent(subjectId)}&autostart=1`
  )
  await dismissCookieBanner(page)
  await page.waitForSelector('[data-question-id]', { timeout: 30000 })
  await page.waitForTimeout(1500)

  const questionIds = await page.locator('[data-question-id]').evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('data-question-id')).filter(Boolean)
  )

  for (const questionId of questionIds) {
    const answer = answersMap[questionId]
    if (answer === undefined) {
      throw new Error(`Missing answer for question ${questionId}`)
    }
    const section = page.locator(`[data-question-id="${questionId}"]`)
    await section.scrollIntoViewIfNeeded()
    await answerQuestion(section, questionId, answer)
  }

  const beforeScreenshot = 'student-smart-drill-before-submit.png'
  const afterScreenshot = 'student-smart-drill-after-submit.png'

  await page.screenshot({
    path: path.join(OUT_DIR, beforeScreenshot),
    fullPage: true,
  })

  await page.getByRole('button', { name: '提交 Smart Drill' }).first().click()
  await page.getByRole('dialog').getByRole('button', { name: '提交 Smart Drill' }).click()
  await page.waitForTimeout(4000)
  await page.waitForURL((value) => value.href.includes('/dashboard/practice/smart-drill'), {
    timeout: 30000,
  })

  const bodyText = (await page.locator('body').textContent()) ?? ''
  const resultSaved = bodyText.includes('已保存')
  const finalUrl = page.url()

  await page.screenshot({
    path: path.join(OUT_DIR, afterScreenshot),
    fullPage: true,
  })

  await context.close()
  await browser.close()

  return {
    scenario: 'smart-drill-submit',
    subjectId,
    questionIds,
    finalUrl,
    resultSaved,
    containsCompletionTitle: bodyText.includes('Smart Drill 完成'),
    beforeScreenshot,
    afterScreenshot,
  }
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })

  const [, , scenario, arg1, ...rest] = process.argv
  let result

  if (scenario === 'claim-login-reward') {
    result = await runClaimLoginReward()
  } else if (scenario === 'feedback-transition') {
    result = await setFeedbackStatus(arg1, rest.join(' '))
  } else if (scenario === 'smart-drill-submit') {
    result = await runSmartDrillSubmit()
  } else {
    throw new Error(`Unknown scenario: ${scenario}`)
  }

  console.log(JSON.stringify(result, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
