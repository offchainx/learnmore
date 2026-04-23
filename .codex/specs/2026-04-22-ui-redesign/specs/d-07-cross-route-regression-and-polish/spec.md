id: SPEC-20260422-D-07
title: d-07 cross-route regression and polish
status: draft
owner: codex
created_at: 2026-04-22
updated_at: 2026-04-22

# 背景
- UI 重构横跨多个页面域，最终必须有一个专门的跨域回归与收口阶段，防止局部看起来好但整体不一致。

# 目标（Goals）
- 建立跨域回归清单
- 统一截图、证据与最终收口标准
- 收掉跨页面域的不一致问题

# 非目标（Non-Goals）
- 不替代各页面域自己的局部验收
- 不在本阶段新增视觉方向

# 稳定边界
- 只做跨域一致性与回归问题收口
- 以真实页面联动效果和证据为准

# 依赖（Dependencies）
- 所有 `d-*` 页面域
- `../../harness/screenshots/`
- `../../harness/evidence/`
- `../../harness/implementation-ledger.md`
