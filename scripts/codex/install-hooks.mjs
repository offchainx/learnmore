#!/usr/bin/env node
import { execSync } from 'node:child_process'

try {
  execSync('git config core.hooksPath .githooks', { stdio: 'inherit' })
  console.log('已设置 core.hooksPath=.githooks')
  console.log('后续提交将自动执行 .githooks/pre-commit')
} catch (error) {
  console.error('安装 hooks 失败:', error.message)
  process.exit(1)
}
