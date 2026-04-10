import { chromium } from 'playwright'
import fs from 'fs/promises'
import path from 'path'
import { createServerClient } from '@supabase/ssr'
import { config as loadEnv } from 'dotenv'

loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

const baseURL = 'http://127.0.0.1:3000'
const outDir = path.join(process.cwd(), '.codex', 'specs', '2026-02-09-release-p0-public-paid', 'p0-05-sitewide-real-data-closeout', 'evidence', 'T021-browser-20260410')
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

await fs.mkdir(outDir, { recursive: true })

function requireEnv(value, name) {
  if (!value) {
    throw new Error(`Missing required env: ${name}`)
  }
  return value
}

async function buildAuthCookies(email, password) {
  const cookies = new Map()
  const client = createServerClient(
    requireEnv(supabaseUrl, 'NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv(supabaseAnonKey, 'NEXT_PUBLIC_SUPABASE_ANON_KEY'),
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
      domain: '127.0.0.1',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
      secure: false,
    })),
  }
}

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

async function shot(name) {
  await page.screenshot({
    path: path.join(outDir, `${name}.png`),
    fullPage: true,
  })
}

const results = []

async function visit(name, url, markers = []) {
  const res = await page.goto(`${baseURL}${url}`, { waitUntil: 'networkidle' })
  const bodyText = await page.locator('body').innerText()
  results.push({
    name,
    url,
    status: res?.status() ?? null,
    finalUrl: page.url(),
    title: await page.title(),
    detectedMarkers: markers.filter((marker) => bodyText.includes(marker)),
  })
  await shot(name.replace(/[^a-z0-9]+/gi, '-').toLowerCase())
}

await visit('leaderboard-guest', '/dashboard/leaderboard')
await visit('achievements-guest', '/dashboard/achievements')
await visit('settings-guest', '/dashboard/settings')

const authSession = await buildAuthCookies('student_ui_test@learnmore.com', 'Password123!')
await page.context().addCookies(authSession.cookies)
results.push({
  name: 'auth-session',
  url: '/login?redirectTo=/dashboard/leaderboard',
  status: 200,
  finalUrl: page.url(),
  title: await page.title(),
  userId: authSession.userId,
  cookieNames: authSession.cookies.map((cookie) => cookie.name),
})
await page.goto(`${baseURL}/login?redirectTo=/dashboard/leaderboard`, { waitUntil: 'networkidle' })
results.push({
  name: 'login-auth-redirect',
  url: '/login?redirectTo=/dashboard/leaderboard',
  status: 200,
  finalUrl: page.url(),
  title: await page.title(),
})
await shot('login-auth-redirect')

await visit('leaderboard-auth', '/dashboard/leaderboard', ['排行榜', 'Leaderboard', 'Competitive Ladder'])
await visit('achievements-auth', '/dashboard/achievements', ['成就', 'Achievement'])
await visit('settings-auth', '/dashboard/settings', ['设置', 'Preference Console'])
await visit(
  'settings-notifications-tab',
  '/dashboard/settings?tab=notifications',
  ['通知', 'notifications', 'Preference Console']
)

await fs.writeFile(path.join(outDir, 't0217-browser-smoke.json'), JSON.stringify(results, null, 2))
await browser.close()
