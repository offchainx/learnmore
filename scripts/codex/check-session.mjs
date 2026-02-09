#!/usr/bin/env node
import { execSync } from 'node:child_process'

function getChangedFiles() {
  const output = execSync('git diff --cached --name-only', { encoding: 'utf8' }).trim()
  if (!output) return []
  return output.split('\n').map((s) => s.trim()).filter(Boolean)
}

function isCodeLike(file) {
  return (
    file.startsWith('src/') ||
    file.startsWith('prisma/') ||
    file.startsWith('supabase/') ||
    file.startsWith('scripts/') ||
    file === 'package.json' ||
    file === 'pnpm-lock.yaml'
  )
}

function main() {
  const files = getChangedFiles()
  if (files.length === 0) {
    console.log('未检测到暂存改动，跳过 codex 校验。')
    return
  }

  const hasCodeChange = files.some(isCodeLike)
  if (!hasCodeChange) {
    console.log('仅非代码改动，跳过 codex 日志强制校验。')
    return
  }

  const hasIterationLog = files.includes('.codex/prompts/iteration-log.md')
  if (!hasIterationLog) {
    console.error('校验失败：检测到代码改动，但未更新 .codex/prompts/iteration-log.md')
    console.error('请先执行: pnpm codex:close --context ... --prompt ... --result ...')
    process.exit(1)
  }

  console.log('codex 校验通过。')
}

main()
