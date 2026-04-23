id: SPEC-20260422-WS-01
title: ws-01 v0 reference prototype and prompt assist
status: draft
owner: codex
created_at: 2026-04-23
updated_at: 2026-04-23

# 背景
- 先把用户给定的参考目标复刻出来，拿到一版满意的前端，再回收样板细节给后续系统化抽取。
- v0 的价值在于快速验证视觉方向，因此这一阶段需要高质量 prompt 支持，而不是先纠结系统层完备性。

# 目标（Goals）
- 根据用户提供的参考目标，整理出可直接给 v0 使用的高质量 prompt。
- 通过少量高价值轮次，把参考目标磨成一版用户满意的前端样板。
- 记录 v0 输出，方便后续抽取样板、token 和组件边界。

# 非目标（Non-Goals）
- 不在本阶段冻结最终 design contract。
- 不在本阶段做系统层 token 化或共享组件收敛。
- 不追求一次性覆盖全部页面域。

# 稳定边界（Frozen Constraints）
- 先复刻参考目标，再做系统化抽取，不反过来让抽象规范绑死视觉探索。
- 保留现有功能；除非你明确批准，否则不做功能下线。
- prompt 需要尽量明确、专业、可执行，避免 v0 反复试错。

# 范围（In Scope）
- 参考目标拆解
- v0 prompt 协助
- v0 输出记录
- 生成样板回收

# 依赖（Dependencies）
- `../../ws-00-scope-and-route-freeze/tasks.md`
- `../../harness/prompts/`
- `../../harness/v0-prompt-ledger.md`
- 用户给定的参考 UI 或参考图
