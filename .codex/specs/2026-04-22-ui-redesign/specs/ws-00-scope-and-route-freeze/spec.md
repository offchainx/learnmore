id: SPEC-20260422-WS-00
title: ws-00 scope and route freeze
status: draft
owner: codex
created_at: 2026-04-22
updated_at: 2026-04-22

# 背景
- UI 重构必须先冻结 route 盘点、页面域归属和 must-keep 功能，否则后续设计与实现容易漏页或误删能力。

# 目标（Goals）
- 建立完整的 route inventory
- 按页面域归属 route
- 冻结 must-keep 功能与关键状态

# 非目标（Non-Goals）
- 不直接做视觉设计
- 不直接修改页面实现

# 稳定边界
- 先盘 route，再谈样式
- must-keep 只记录能力与状态，不记录视觉建议

# 依赖（Dependencies）
- `harness/route-inventory.md`
- `harness/screen-inventory.md`
- 当前 `src/app` 路由结构
