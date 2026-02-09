#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const logPath = path.join(root, '.codex', 'prompts', 'iteration-log.md')
const codexPath = path.join(root, '.codex', 'codex.md')
const radarPath = path.join(root, '.codex', 'features', 'radar.md')

function parseArgs(argv) {
  const map = {}
  for (let i = 2; i < argv.length; i++) {
    const token = argv[i]
    if (!token.startsWith('--')) continue
    const key = token.slice(2)
    const value = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : ''
    map[key] = value
  }
  return map
}

function required(args, keys) {
  const missing = keys.filter((k) => !args[k] || !args[k].trim())
  if (missing.length > 0) {
    console.error(`缺少必填参数: ${missing.map((m) => `--${m}`).join(', ')}`)
    process.exit(1)
  }
}

function esc(value) {
  return String(value ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\n/g, ' ')
    .trim()
}

async function main() {
  const args = parseArgs(process.argv)
  required(args, ['context', 'prompt', 'result'])

  const now = new Date().toISOString().slice(0, 10)
  const row = `| ${now} | ${esc(args.context)} | ${esc(args.prompt)} | ${esc(args.result)} | ${esc(args.worked || '-')} | ${esc(args.failed || '-')} | ${esc(args.improved || '-')} | ${esc(args.next || '-')} |`

  const content = await fs.readFile(logPath, 'utf8')
  const marker = '## 约束'

  if (!content.includes(marker)) {
    console.error(`未找到插入标记 "${marker}"，请检查文件格式: ${logPath}`)
    process.exit(1)
  }

  const updated = content.replace(marker, `${row}\n\n${marker}`)
  await fs.writeFile(logPath, updated, 'utf8')

  if (args['new-rule']) {
    const mistakeTitle = args['mistake-title'] || '未命名失误'
    const entry = `

## [${now}] ${mistakeTitle}
- 场景：${args['mistake-scenario'] || '-'}
- 影响：${args['mistake-impact'] || '-'}
- 根因：${args['mistake-root-cause'] || '-'}
- 新规则：${args['new-rule']}
- 防复发检查项：${args['prevent-check'] || '-'}
- 示例（正确做法）：${args['rule-example'] || '-'}
- 生效日期：${now}
`
    const codexContent = await fs.readFile(codexPath, 'utf8')
    await fs.writeFile(codexPath, `${codexContent}${entry}`, 'utf8')
    console.log('已更新: .codex/codex.md（失误记录）')
  }

  if (args['feature-name']) {
    const radarContent = await fs.readFile(radarPath, 'utf8')
    const radarMarker = '## 周检规则'
    if (!radarContent.includes(radarMarker)) {
      console.error(`未找到插入标记 "${radarMarker}"，请检查文件格式: ${radarPath}`)
      process.exit(1)
    }
    const featureRow = `| ${esc(args['feature-name'])} | ${esc(args['feature-source'] || now)} | ${esc(args['feature-fit'] || '-')} | ${esc(args['feature-trial'] || '-')} | ${esc(args['feature-decision'] || 'hold')} |`
    const radarUpdated = radarContent.replace(radarMarker, `${featureRow}\n\n${radarMarker}`)
    await fs.writeFile(radarPath, radarUpdated, 'utf8')
    console.log('已更新: .codex/features/radar.md')
  }

  console.log('已更新: .codex/prompts/iteration-log.md')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
