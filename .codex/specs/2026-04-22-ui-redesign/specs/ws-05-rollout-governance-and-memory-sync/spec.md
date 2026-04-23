id: SPEC-20260422-WS-05
title: ws-05 rollout governance and memory sync
status: draft
owner: codex
created_at: 2026-04-22
updated_at: 2026-04-23

# 背景
- UI 重构周期长、域多、回合多，必须有 rollout 治理和 memory-bank 同步规则，不然会逐步失控。

# 目标（Goals）
- 定义 rollout 顺序与门禁
- 定义任务内与全局的保存机制
- 定义 memory-bank 回写触发条件

# 非目标（Non-Goals）
- 不负责具体页面设计
- 不替代 root `tasks.md` 的总控功能

# 稳定边界
- Git hook 只做提交时兜底，不视为对话级保存
- 每个有效回合都必须更新任务内 ledger

# 依赖（Dependencies）
- `../../harness/conversation-ledger.md`
- `../../harness/implementation-ledger.md`
- `../../harness/memory-sync-checklist.md`
- `.codex/workflows/task-lifecycle-sop.md`
