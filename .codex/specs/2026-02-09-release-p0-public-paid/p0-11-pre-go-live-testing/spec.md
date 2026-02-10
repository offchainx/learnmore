id: SPEC-20260209-P0-11
title: P0-11 上线前专项测试（Referral / Notification）
status: active
owner: codex
related_story: 2026-02-09-release-p0-public-paid
created_at: 2026-02-09
updated_at: 2026-02-10

# 归位说明（Relocation）
- 本次 Referral/Subscription 实现方案已并入 `p0-09-billing-subscription-loop`。
- `p0-09` 为唯一实现文档源；`p0-11` 仅用于上线前测试执行与证据沉淀。

# 背景
- P0 进入上线收口阶段，需要一组可持续追加的上线前专项测试项。
- 现阶段优先验证 referral 与 notification 两条用户关键链路。

# 目标（Goals）
- 建立 P0-11 专项测试任务并沉淀可复用检查项。
- 完成 referral 功能上线前可用性与一致性确认。
- 完成 notification 功能上线前可用性确认。

# 非目标（Non-Goals）
- 不在本任务内引入新业务功能开发。
- 不覆盖全站所有功能回归（由其他 P0 子任务承担）。

# 约束（Constraints）
- 先验证关键主链路，再逐步扩展边界场景。
- 测试结果需可追踪（SQL 快照、日志或截图）。

# 范围（In Scope）
- referral：注册关联、付费后奖励结算、幂等重放。
- notification：BILLING/SYSTEM/SOCIAL 关键通知创建与读取状态。

# 范围外（Out of Scope）
- 邮件投递供应商侧到达率优化。
- 营销活动类通知策略设计。

# 风险（Risks）
- 风险：数据验证证据不足，导致上线判断失真。
  - 影响：上线后出现隐藏问题。
  - 缓解策略：强制保留 SQL 前后快照与事件日志。

# 依赖（Dependencies）
- Stripe 测试链路可用（用于 referral 首付触发）。
- Supabase 可访问（用于核对 users/referrals/notifications）。
