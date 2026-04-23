id: SPEC-20260422-WS-02
title: ws-02 design contract and anti-patterns
status: draft
owner: codex
created_at: 2026-04-22
updated_at: 2026-04-23

# 背景
- 先拿到 v0 参考样板，再冻结设计契约，能避免抽象规范与真实视觉脱节。

# 目标（Goals）
- 冻结设计契约
- 冻结 anti-pattern 黑名单
- 建立可供 v0 与 Codex 共用的审美边界

# 非目标（Non-Goals）
- 不在本阶段写具体组件代码
- 不在本阶段做最终数值级 token 微调

# 稳定边界
- 设计契约优先定义“范围和禁用项”，不一开始写死全部数值
- 黑名单必须可执行，不写抽象审美评价
- 设计契约要能直接服务后续 token 化与 shared UI 收敛

# 依赖（Dependencies）
- `../../ws-01-v0-reference-prototype-and-prompt-assist/tasks.md`
- `harness/component-audit.md`
- `ws-00` 的 must-keep 功能清单
