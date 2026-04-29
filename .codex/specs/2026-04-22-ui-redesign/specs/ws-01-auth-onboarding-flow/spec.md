id: SPEC-20260422-WS-01
title: ws-01 auth onboarding flow
status: draft
owner: codex
created_at: 2026-04-23
updated_at: 2026-04-28

# 背景
- ws-01 已从 v0 参考样板与 prompt 协助，切换为 auth / onboarding 流程冻结与实施台账。
- 当前任务的目标不是继续追 v0，而是把 `login/register -> legal -> profile -> dashboard` 这条链路稳定落地。

# 目标（Goals）
- 冻结 onboarding 的流程、路由、页面结构、数据模型和行动清单。
- 让 `tasks.md` 成为 ws-01 的唯一主阅读入口。
- 把前几轮对话里确认的关键结论固定下来，防止后续推进时失忆。

# 非目标（Non-Goals）
- 不在本阶段生成 v0 prompt。
- 不在本阶段做 design contract、token 收敛或 shared UI 抽象。
- 不把 onboarding 再折回 dashboard dialog 方案。

# 稳定边界（Frozen Constraints）
- 先把 onboarding 主链路做稳，再考虑视觉细化和品牌文案优化。
- `username` 不直接承担真实姓名语义，真实姓名使用 `displayName`。
- `school` 第一版使用本地候选数据 + 手动输入兜底。
- legal acceptance 必须是账号级、可追溯、可重定向的持久状态。
- 任何完成判断都要能由数据库状态推导，不依赖一次性前端记忆。

# 范围（In Scope）
- `login / register` 入口页的结构与 UI 约束
- `Google OAuth` 后的 onboarding 分流
- `/onboarding/legal`
- `/onboarding/profile`
- onboarding 状态判断服务
- 路由守卫与 dashboard 兜底
- 数据模型增补
- 学校候选选择策略
- 任务台账与记忆记录

# 依赖（Dependencies）
- `../../ws-00-scope-and-route-freeze/tasks.md`
- `../../harness/route-inventory.md`
- `../../harness/conversation-ledger.md`
- `../../harness/implementation-ledger.md`
- 用户提供的 Novu 登录页 / legal 页 / organization setup 页参考图
