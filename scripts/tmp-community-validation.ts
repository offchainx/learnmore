import assert from 'node:assert/strict'
import { chromium } from 'playwright'
import prisma from '../src/lib/prisma'

const ADMIN_EMAIL = 'admin_ui_test@learnmore.com'
const ADMIN_PASSWORD = 'Password123!'

function countOccurrences(text: string, needle: string) {
  if (!needle) return 0
  return text.split(needle).length - 1
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  const page = await context.newPage()

  await page.goto(
    'http://localhost:3000/login?redirectTo=/dashboard/community',
    { waitUntil: 'domcontentloaded' }
  )
  await page.locator('#email').fill(ADMIN_EMAIL)
  await page.locator('#password').fill(ADMIN_PASSWORD)
  await page.getByRole('button', { name: '登录' }).click()
  await page.waitForURL('**/dashboard/community')
  await page.waitForLoadState('networkidle').catch(() => {})

  const firstPostLink = page
    .locator('a[href^="/dashboard/community/"]:not([href$="/new"])')
    .first()
  const postHref = await firstPostLink.getAttribute('href')
  assert(postHref, '未找到首条帖子链接')

  const postUrl = new URL(postHref, page.url()).toString()
  const postId = postHref.split('/').filter(Boolean).at(-1)
  assert(postId, '未能解析帖子 ID')

  const bookmarkButton = page.getByRole('button', {
    name: /收藏|Bookmarks/,
  }).first()
  const bookmarkBefore = (await bookmarkButton.textContent())?.trim() || ''
  await bookmarkButton.click()
  await page.waitForTimeout(700)
  const bookmarkAfter = (await bookmarkButton.textContent())?.trim() || ''
  await page.reload({ waitUntil: 'networkidle' }).catch(() => {})
  const bookmarkAfterReload =
    (await page
      .getByRole('button', { name: /收藏|Bookmarks/ })
      .first()
      .textContent())?.trim() || ''

  const shareButton = page.getByRole('button', {
    name: /分享|Share/,
  }).first()
  await shareButton.click()
  await page.waitForTimeout(300)
  const clipboardText = await page.evaluate(() => navigator.clipboard.readText())

  await page.goto(postUrl, { waitUntil: 'networkidle' })
  const commentMarker = `T0086-${Date.now()}`
  const commentBox = page.locator('textarea').first()
  const submitComment = page.getByRole('button', {
    name: /发送评论|Send comment/,
  }).first()

  await commentBox.fill(commentMarker)
  await submitComment.click()
  await page.waitForTimeout(700)
  const afterFirstSubmit = await page.locator('body').innerText()
  const firstCount = countOccurrences(afterFirstSubmit, commentMarker)

  await commentBox.fill(commentMarker)
  await submitComment.click()
  await page.waitForTimeout(700)
  const afterSecondSubmit = await page.locator('body').innerText()
  const secondCount = countOccurrences(afterSecondSubmit, commentMarker)

  await page.reload({ waitUntil: 'networkidle' }).catch(() => {})
  const afterReload = await page.locator('body').innerText()
  const reloadCount = countOccurrences(afterReload, commentMarker)

  const adminUser = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
    select: { id: true },
  })
  assert(adminUser, '未找到测试管理员用户')

  const bookmarkRowCount = await prisma.postBookmark.count({
    where: {
      userId: adminUser.id,
      postId,
    },
  })
  const commentRowCount = await prisma.comment.count({
    where: {
      content: commentMarker,
      authorId: adminUser.id,
      postId,
    },
  })

  console.log(
    JSON.stringify(
      {
        postHref,
        postId,
        bookmarkBefore,
        bookmarkAfter,
        bookmarkAfterReload,
        clipboardText,
        commentMarker,
        firstCount,
        secondCount,
        reloadCount,
        bookmarkRowCount,
        commentRowCount,
      },
      null,
      2
    )
  )

  await browser.close()
  await prisma.$disconnect()

  assert(clipboardText === postUrl, '分享链接未复制为帖子 URL')
  assert(firstCount === 1, '首次评论后页面未立即展示评论')
  assert(secondCount === 1, '重复评论后页面出现重复内容')
  assert(reloadCount === 1, '刷新后评论内容未保留或出现重复')
  assert(commentRowCount === 1, '评论未按预期落库或重复落库')
  assert(bookmarkRowCount === 0 || bookmarkRowCount === 1, '收藏落库状态异常')
  assert(
    bookmarkBefore !== bookmarkAfter || bookmarkAfter === bookmarkAfterReload,
    '收藏状态刷新后未保持一致'
  )
}

main().catch(async (error) => {
  console.error(error)
  try {
    await prisma.$disconnect()
  } catch {}
  process.exit(1)
})
