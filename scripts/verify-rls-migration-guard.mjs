#!/usr/bin/env node
import { execSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

const args = new Set(process.argv.slice(2))
const stagedMode = args.has('--staged')

const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations')

function fail(message) {
  console.error(`[rls-guard] 校验失败: ${message}`)
  process.exit(1)
}

function info(message) {
  console.log(`[rls-guard] ${message}`)
}

function findMigrationByPrefix(prefix) {
  const files = readdirSync(migrationsDir).filter((file) => file.endsWith('.sql'))
  return files.find((file) => file.startsWith(prefix))
}

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

function getPolicyTargetTables(sql) {
  const tableNames = new Set()
  const regex = /ON\s+public\.(?:"([^"]+)"|([a-zA-Z_][a-zA-Z0-9_]*))/gi

  for (const match of sql.matchAll(regex)) {
    tableNames.add(match[1] || match[2])
  }

  return tableNames
}

function main() {
  const migration009 = findMigrationByPrefix('009_')
  const migration010 = findMigrationByPrefix('010_')

  if (!migration009) {
    fail('未找到 009 迁移文件，无法执行 RLS 发布链路校验。')
  }

  if (!migration010) {
    fail('检测到 009 但缺失 010 策略迁移，请补齐后再发布。')
  }

  const sql009 = readFileSync(path.join(migrationsDir, migration009), 'utf8')
  const sql010 = readFileSync(path.join(migrationsDir, migration010), 'utf8')

  if (!/ENABLE\s+ROW\s+LEVEL\s+SECURITY/i.test(sql009)) {
    fail(`迁移 ${migration009} 未检测到 ENABLE ROW LEVEL SECURITY。`)
  }

  const createPolicyCount = (sql010.match(/\bCREATE\s+POLICY\b/gi) || []).length
  if (createPolicyCount === 0) {
    fail(`迁移 ${migration010} 未检测到 CREATE POLICY。`)
  }

  const targetTables = getPolicyTargetTables(sql010)
  if (targetTables.size < 10) {
    fail(
      `迁移 ${migration010} 的策略覆盖表数量过少（${targetTables.size}），疑似策略未完整落地。`
    )
  }

  if (stagedMode) {
    const stagedFiles = new Set(getStagedFiles())
    const staged009 = stagedFiles.has(`supabase/migrations/${migration009}`)
    const staged010 = stagedFiles.has(`supabase/migrations/${migration010}`)

    if (staged009 && !staged010) {
      fail(
        `已暂存 ${migration009}，但未同时暂存 ${migration010}。为避免 RLS 锁库，请成对提交。`
      )
    }
  }

  info(`校验通过：${migration009} 与 ${migration010} 已满足发布链路要求。`)
}

main()
