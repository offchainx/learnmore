import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } })

await page.goto('http://localhost:3000/login?redirectTo=/dashboard/community', {
  waitUntil: 'networkidle',
})
await page.fill('#email', 'admin_ui_test@learnmore.com')
await page.fill('#password', 'Password123!')
await page.getByRole('button', { name: '登录' }).click()

await page.waitForTimeout(8000)
console.log('LOGIN_URL:', page.url())
console.log('LOGIN_BODY:', (await page.locator('body').innerText()).slice(0, 1000))
console.log('COOKIES:', JSON.stringify(await page.context().cookies('http://localhost:3000'), null, 2))

await browser.close()
