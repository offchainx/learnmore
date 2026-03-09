#!/usr/bin/env node
import { execSync, spawnSync } from 'node:child_process'

const LINTABLE_EXTS = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'])

function getStagedFiles() {
  const output = execSync('git diff --cached --name-only --diff-filter=ACMR', {
    encoding: 'utf8',
  }).trim()

  if (!output) return []
  return output
    .split('\n')
    .map((file) => file.trim())
    .filter(Boolean)
}

function getExtension(file) {
  const index = file.lastIndexOf('.')
  if (index < 0) return ''
  return file.slice(index)
}

function main() {
  const files = getStagedFiles().filter((file) => LINTABLE_EXTS.has(getExtension(file)))

  if (files.length === 0) {
    console.log('[lint-staged] 未检测到可 lint 的暂存文件，跳过。')
    return
  }

  console.log(`[lint-staged] 开始检查 ${files.length} 个暂存文件...`)
  const result = spawnSync('pnpm', ['exec', 'eslint', '--quiet', ...files], {
    stdio: 'inherit',
  })

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }

  console.log('[lint-staged] 校验通过。')
}

main()
