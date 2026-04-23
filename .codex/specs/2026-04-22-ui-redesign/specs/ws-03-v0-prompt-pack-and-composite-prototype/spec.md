id: SPEC-20260422-WS-03
title: ws-03 v0 prompt pack and composite prototype
status: draft
owner: codex
created_at: 2026-04-22
updated_at: 2026-04-23

# 背景
- v0 有显式成本约束，必须通过高价值 prompt pack 和组合样板降低轮次。
- 这一阶段承接 ws-01 的参考复刻样板和 ws-02 的 design contract。

# 目标（Goals）
- 产出首轮 v0 prompt pack
- 定义组合原型页的范围与验收标准
- 用 ledger 追踪每次 v0 调用

# 非目标（Non-Goals）
- 不在本阶段直接落地真实前端
- 不为纯微调单独开多轮 v0 会话

# 稳定边界
- 首轮只做组合原型页，不直接做多路由应用骨架
- 所有 prompt 必须显式声明 must-keep 功能与 anti-pattern

# 依赖（Dependencies）
- `ws-00`
- `ws-01`
- `ws-02`
- `harness/v0-prompt-ledger.md`
- `harness/prompts/`
