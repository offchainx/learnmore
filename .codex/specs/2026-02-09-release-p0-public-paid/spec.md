id: SPEC-20260209-P0-RELEASE
title: P0 上线总计划（公开发布 + 含付费）
status: active
owner: codex
related_story: Story-043, Story-019, Story-034, Story-039(backlog), Story-031
created_at: 2026-02-09
updated_at: 2026-02-09

# 背景
- 当前项目已具备核心能力，但存在排行榜 Mock 数据、社区详情页占位重定向、成就页静态展示、支付链路可绕过参数等上线风险。
- 目标是在尽快上线前提下，完成 P0 功能闭环、数据库基线收敛与发布基线。

# 目标（Goals）
- 建立可追踪的 P0 release 执行体系（总计划 + 子任务计划）。
- 完成数据库 schema/字段逻辑梳理，清理冗余数据结构并保证可回滚。
- 完成 Leaderboard/Community/Achievement/Billing/UI 导航一致性的关键改造。
- 补齐上线前验证、观测与回滚策略。

# 非目标（Non-Goals）
- Lesson/Courses 的深度重构与真实数据替换（归入 P1）。
- Achievement Pro 玩法（稀有赛季、复杂特效、隐藏剧情）。
- 社区实时 WebSocket 能力。

# 约束（Constraints）
- 以最快上线为优先，优先交付可用与稳定，不做大规模视觉重构。
- 不破坏现有认证与数据模型主路径。

# 范围（In Scope）
- P0-00 ~ P0-13 任务目录与验收标准。
- 关键代码改造：Leaderboard/Community/Achievement/Billing/UI 导航。
- 数据库 schema 字段逻辑映射、冗余项收敛与双环境证据化验证。
- 上线校验清单与回滚预案。

# 范围外（Out of Scope）
- 复杂商业化运营活动。
- 非关键页面视觉精修。

# 风险（Risks）
- 风险：支付 webhook 重放导致重复处理。
  - 影响：重复通知、重复业务逻辑。
  - 缓解策略：事件幂等检查 + 事件处理记录。
- 风险：排行榜与社区改造引入回归。
  - 影响：核心页面可用性下降。
  - 缓解策略：增加空态/异常态处理与回归测试。
- 风险：成就规则触发时机不一致。
  - 影响：徽章漏发或重复发放。
  - 缓解策略：统一 awardBadgeIfEligible 入口，使用唯一约束防重。

# 依赖（Dependencies）
- Prisma/PostgreSQL 可用。
- Stripe 生产参数与 webhook 已配置。
- Supabase Auth 与中间件行为稳定。
