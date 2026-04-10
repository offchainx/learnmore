import { chromium } from 'playwright'
import { createServerClient } from '@supabase/ssr'
import { config as loadEnv } from 'dotenv'
import fs from 'node:fs/promises'
import path from 'node:path'

loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3000'
const OUT_DIR = path.join(
  process.cwd(),
  '.codex',
  'specs',
  '2026-02-09-release-p0-public-paid',
  'p0-05-sitewide-real-data-closeout',
  'evidence',
  'T021-browser-20260410',
)

if (process.env.DIRECT_URL) {
  process.env.DATABASE_URL = process.env.DIRECT_URL
}

function requiredEnv(name, value) {
  if (!value) {
    throw new Error(`Missing required env: ${name}`)
  }
  return value
}

async function ensureDir() {
  await fs.mkdir(OUT_DIR, { recursive: true })
}

async function getSamples() {
  return {
    referralCode: 'JKAE31EI',
    referralOwnerEmail: 'codex.authprobe.1774884507912@example.com',
    voucherCode: 'V27067247',
    voucherMeta: {
      code: 'V27067247',
      discountType: 'AMOUNT',
      discountValue: 10,
      maxRedemptions: null,
      redeemedCount: 1,
      validFrom: null,
      validTo: null,
    },
  }
}

async function buildAuthCookies(email, password) {
  const cookies = new Map()
  const client = createServerClient(
    requiredEnv('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL),
    requiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    {
      cookies: {
        get(name) {
          return cookies.get(name)
        },
        set(name, value) {
          cookies.set(name, value)
        },
        remove(name) {
          cookies.delete(name)
        },
      },
    },
  )

  const { data, error } = await client.auth.signInWithPassword({ email, password })
  if (error) {
    throw new Error(`Failed to sign in ${email}: ${error.message}`)
  }

    return {
      userId: data.user?.id ?? null,
      cookies: [...cookies.entries()].map(([name, value]) => ({
        name,
        value,
        url: BASE_URL,
        httpOnly: true,
        sameSite: 'Lax',
        secure: false,
      })),
    }
}

async function takeScreenshot(page, name, fullPage = true) {
  await page.screenshot({
    path: path.join(OUT_DIR, `${name}.png`),
    fullPage,
  })
}

async function pageSummary(page, markers = []) {
  const heading = await page.locator('h1').first().textContent().catch(() => null)
  const bodyText = await page.locator('body').innerText().catch(() => '')
  const finalUrl = page.url()
  const detectedMarkers = markers.filter((marker) => bodyText.includes(marker))
  return {
    url: finalUrl,
    title: await page.title().catch(() => null),
    heading: heading?.trim() || null,
    detectedMarkers,
    bodySnippet: bodyText.slice(0, 260),
  }
}

async function openPage(page, name, url, markers = [], fullPage = true) {
  const res = await page.goto(`${BASE_URL}${url}`, {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  })
  await page.waitForTimeout(800)
  const summary = await pageSummary(page, markers)
  await takeScreenshot(page, name, fullPage)
  return {
    name,
    url,
    status: res?.status() ?? null,
    finalUrl: summary.url,
    ...summary,
  }
}

async function acceptCookieBanner(page) {
  const acceptButton = page.getByRole('button', { name: /Accept|接受|同意/i })
  if (await acceptButton.isVisible().catch(() => false)) {
    await acceptButton.click().catch(() => {})
    await page.waitForTimeout(300)
  }
}

async function submitContactForm(page, email) {
  await page.goto(`${BASE_URL}/contact`, {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  })
  await page.waitForTimeout(800)
  await acceptCookieBanner(page)
  await page.locator('input[name="name"]').fill('Codex Smoke')
  await page.locator('input[name="email"]').fill(email)
  await page.locator('input[name="subject"]').fill(`T0218 public smoke ${Date.now()}`)
  await page.locator('textarea[name="message"]').fill('This is a smoke test for the public contact form.')
  await page.getByRole('button', { name: /Send message|发送消息|发送反馈/i }).click()
  await page.waitForTimeout(1600)
  const result = await pageSummary(page, ['Thanks, your message has been sent', 'Your message has been sent'])
  await takeScreenshot(page, 'contact-submit')
  return {
    name: 'contact-submit',
    url: '/contact',
    status: 200,
    finalUrl: result.url,
    ...result,
  }
}

async function openFeedbackModal(page) {
  await page.goto(`${BASE_URL}/help`, {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  })
  await page.waitForTimeout(800)
  await acceptCookieBanner(page)
  await page.getByText(/Send a Message|发送消息|Hantar mesej/i).click()
  await page.waitForTimeout(500)
  const result = await pageSummary(page, ['Share your thoughts', '分享您的想法', 'Kongsi pandangan anda'])
  await takeScreenshot(page, 'help-feedback-modal')
  return {
    name: 'help-feedback-modal',
    url: '/help',
    status: 200,
    finalUrl: result.url,
    ...result,
  }
}

async function submitRegisterForm(page, email, password, referralCode = '') {
  await page.goto(
    `${BASE_URL}/register${referralCode ? `?referralCode=${encodeURIComponent(referralCode)}` : ''}`,
    {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    },
  )
  await page.waitForTimeout(1000)
  await page.fill('#username', 'codex-smoke')
  await page.fill('#email', email)
  if (referralCode) {
    const referralInput = page.locator('#referralCode')
    if ((await referralInput.count()) > 0) {
      await referralInput.waitFor({ timeout: 30000 })
      const currentValue = await referralInput.inputValue()
      if (!currentValue) {
        await referralInput.fill(referralCode)
      }
    }
  }
  await page.fill('#password', password)
  await Promise.all([
    page.waitForURL((value) => !value.pathname.startsWith('/register'), { timeout: 30000 }),
    page.getByRole('button', { name: /创建账号|Create account|注册/i }).click(),
  ])
  await page.waitForTimeout(1200)
  const result = await pageSummary(page, ['/dashboard'])
  await takeScreenshot(page, 'register-submit')
  return {
    name: 'register-submit',
    url: '/register',
    status: 200,
    finalUrl: result.url,
    ...result,
  }
}

async function submitResetPassword(page, email, newPassword = 'T0218Reset123!') {
  await page.goto(`${BASE_URL}/reset-password`, {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  })
  await page.waitForFunction(
    () => Boolean(document.querySelector('#email') || document.querySelector('#new-password')),
    {
      timeout: 30000,
    },
  )
  const emailInput = page.locator('#email')
  const newPasswordInput = page.locator('#new-password')

  if ((await newPasswordInput.count()) > 0) {
    await newPasswordInput.fill(newPassword)
    await page.locator('#confirm-password').fill(newPassword)
    await page.getByRole('button', { name: /更新密码|Update password|更新中/i }).click()
    await page.waitForTimeout(2500)
    const result = await pageSummary(page, ['/login?reset=success', '登录页', 'Login'])
    await takeScreenshot(page, 'reset-password-submit')
    return {
      name: 'reset-password-submit',
      url: '/reset-password',
      status: 200,
      finalUrl: result.url,
      ...result,
    }
  }

  await emailInput.waitFor({ timeout: 30000 })
  await emailInput.fill(email)
  await page.getByRole('button', { name: /发送重置邮件|Send reset|发送中/i }).click()
  await page.waitForTimeout(1500)
  const result = await pageSummary(page, ['重置邮件已发送', 'password reset link', 'reset email'])
  await takeScreenshot(page, 'reset-password-submit')
  return {
    name: 'reset-password-submit',
    url: '/reset-password',
    status: 200,
    finalUrl: result.url,
    ...result,
  }
}

async function applyVoucher(page, voucherCode) {
  await page.goto(`${BASE_URL}/pricing`, {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  })
  await page.waitForTimeout(1200)
  const voucherInput = page.locator('input').first()
  await voucherInput.fill(voucherCode)
  await page.waitForTimeout(1500)
  const result = await pageSummary(page, [voucherCode, '已应用优惠券', 'Voucher'])
  await takeScreenshot(page, 'pricing-voucher-applied')
  return {
    name: 'pricing-voucher-applied',
    url: '/pricing',
    status: 200,
    finalUrl: result.url,
    ...result,
  }
}

async function main() {
  await ensureDir()
  const samples = await getSamples()
  const tempEmail = `codex.t0218.${Date.now()}@learnmore.test`
  const tempPassword = 'T0218Smoke123!'
  const browser = await chromium.launch({ headless: true })
  const startedAt = Date.now()
  const logStep = async (name, fn) => {
    console.log(`[T-021.8] start ${name}`)
    const result = await fn()
    console.log(`[T-021.8] done ${name} (+${Date.now() - startedAt}ms)`)
    return result
  }

  const guestContext = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const guestPage = await guestContext.newPage()
  const resetContext = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const resetPage = await resetContext.newPage()

  const report = {
    at: new Date().toISOString(),
    baseUrl: BASE_URL,
    referralCode: samples.referralCode,
    referralOwnerEmail: samples.referralOwnerEmail,
    voucherCode: samples.voucherCode,
    voucherMeta: samples.voucherMeta,
    tempEmail,
    publicResults: [],
    authResults: [],
  }

  report.publicResults.push(await logStep('public-home', () => openPage(guestPage, 'public-home', '/', ['LearnMore', 'Start Learning', '开始学习'])))
  report.publicResults.push(await logStep('public-pricing', () => openPage(guestPage, 'public-pricing', '/pricing', ['Choose Your Plan', '选择你的方案'])))
  report.publicResults.push(await logStep('public-blog', () => openPage(guestPage, 'public-blog', '/blog', ['Blog', '动态资讯'])))
  report.publicResults.push(await logStep('public-help', () => openPage(guestPage, 'public-help', '/help', ['How can we help you', '我们可以如何帮助您'])))
  report.publicResults.push(await logStep('public-contact', () => openPage(guestPage, 'public-contact', '/contact', ['Contact Us', '联系我们'])))
  report.publicResults.push(await logStep('public-login', () => openPage(guestPage, 'public-login', '/login', ['欢迎回来', 'Welcome back'])))

  if (samples.referralCode) {
    report.publicResults.push(
      await logStep('referral-route', () => openPage(
        guestPage,
        'referral-route',
        `/r/${samples.referralCode}`,
        [samples.referralCode, '/pricing?referralCode='],
      )),
    )

    const registerPrefill = await logStep('register-prefill', () => openPage(
      guestPage,
      'register-prefill',
      `/register?referralCode=${encodeURIComponent(samples.referralCode)}`,
      [samples.referralCode, '创建账号', 'Join'],
    ))
    const referralInputValue = await guestPage.locator('#referralCode').inputValue().catch(() => '')
    report.publicResults.push({
      ...registerPrefill,
      referralInputValue,
    })
  }

  if (samples.voucherCode) {
    report.publicResults.push(await logStep('pricing-voucher-applied', () => applyVoucher(guestPage, samples.voucherCode)))
  }

  report.publicResults.push(await logStep('help-feedback-modal', () => openFeedbackModal(guestPage)))
  report.publicResults.push(await logStep('contact-submit', () => submitContactForm(guestPage, tempEmail)))
  report.publicResults.push(await logStep('reset-request', () => submitResetPassword(resetPage, tempEmail)))

  report.publicResults.push(await logStep('register-submit', () => submitRegisterForm(guestPage, tempEmail, tempPassword)))

  const authSession = await logStep('build-auth-cookies', () => buildAuthCookies(tempEmail, tempPassword))
  const authContext = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  await authContext.addCookies(authSession.cookies)
  const authPage = await authContext.newPage()

  report.authResults.push({
    name: 'auth-session',
    userId: authSession.userId,
    cookieNames: authSession.cookies.map((cookie) => cookie.name),
  })

  report.authResults.push(await logStep('auth-login-redirect', () => openPage(authPage, 'auth-login-redirect', '/login?redirectTo=/dashboard', ['/dashboard'])))
  report.authResults.push(await logStep('auth-register-redirect', () => openPage(authPage, 'auth-register-redirect', '/register', ['/dashboard'])))
  report.authResults.push(await logStep('auth-dashboard', () => openPage(authPage, 'auth-dashboard', '/dashboard', ['Dashboard', '仪表盘'])))

  await resetContext.close()
  await authContext.close()
  await guestContext.close()
  await browser.close()

  await fs.writeFile(
    path.join(OUT_DIR, 't0218-public-smoke.json'),
    JSON.stringify(report, null, 2),
  )

  console.log(JSON.stringify(report, null, 2))
}

main().catch(async (error) => {
  console.error(error)
  process.exit(1)
})
