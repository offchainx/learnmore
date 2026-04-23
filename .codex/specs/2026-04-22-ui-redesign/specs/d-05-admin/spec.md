id: SPEC-20260422-D-05
title: d-05 admin
status: draft
owner: codex
created_at: 2026-04-22
updated_at: 2026-04-22

# 背景
- admin 域工具属性最强，必须共享同一系统层能力，但视觉语气应比 consumer 端更克制。

# 目标（Goals）
- 重构 admin 主壳层与高频后台页面
- 统一后台工具页的表格、筛选、详情和操作层级
- 与 consumer 端共享 token 与基础组件

# 非目标（Non-Goals）
- 不让后台页面复制 consumer 端的温暖营销表达
- 不改后台业务逻辑

# 稳定边界
- admin 更偏工具化、专业化、克制
- 仍需共享同一 token 和组件基础

# 依赖（Dependencies）
- `../ws-04-tokenization-and-shared-ui-foundation/`
- `../../harness/route-inventory.md`
- `../../harness/component-audit.md`
