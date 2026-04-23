id: SPEC-20260422-WS-04
title: ws-04 tokenization and shared ui foundation
status: draft
owner: codex
created_at: 2026-04-22
updated_at: 2026-04-23

# 背景
- 设计样板一旦通过，就必须快速下沉为 token、共享组件和 page shell，否则页面域会再次各自分裂。

# 目标（Goals）
- 把确认过的方向下沉为 token
- 收敛共享 UI primitives
- 冻结 page shell 和状态态模板

# 非目标（Non-Goals）
- 不在本阶段覆盖所有页面细节
- 不擅自改动业务接口或后端契约

# 稳定边界
- 只有设计方向确认后才进入本阶段
- 共享组件先收敛语义，再处理具体页面套用

# 依赖（Dependencies）
- `ws-03`
- `harness/component-audit.md`
- 现有 `globals.css`、`components/ui/*`、`pageSurfaces.ts`
