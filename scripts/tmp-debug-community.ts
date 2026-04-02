import { chromium } from 'playwright'

async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  const page = await context.newPage()

  await page.goto('http://localhost:3000/login?redirectTo=/dashboard/community', {
    waitUntil: 'domcontentloaded',
  })
  await page.locator('#email').fill('admin_ui_test@learnmore.com')
  await page.locator('#password').fill('Password123!')
  await page.getByRole('button', { name: '登录' }).click()
  await page.waitForURL('**/dashboard/community')
  await page.waitForLoadState('networkidle').catch(() => {})

  const firstPostLink = page.locator('a[href^="/dashboard/community/"]').first()
  const postHref = await firstPostLink.getAttribute('href')
  console.log('POST_HREF', postHref)
  const postUrl = new URL(postHref!, page.url()).toString()
  console.log('POST_URL', postUrl)
  await page.goto(postUrl, { waitUntil: 'networkidle' }).catch(() => {})
  console.log('FINAL_URL', page.url())
  console.log('BODY_SNIP', (await page.locator('body').innerText()).slice(0, 1000))

  await browser.close()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
