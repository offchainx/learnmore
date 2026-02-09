id: SPEC-20260209-P0-09
title: P0-09 支付订阅闭环
status: active
owner: codex
related_story:
created_at: 2026-02-09
updated_at: 2026-02-09

# 背景
- P0 发布链路中的子任务，需可独立验收与回滚。

# 目标（Goals）
- checkout 白名单映射 + webhook 幂等与记录。

# 非目标（Non-Goals）
- 不扩展到 P1 范围。

# 约束（Constraints）
- 必须遵循 .codex/workflows/new-task-sop.md。

# 范围（In Scope）
- 当前子任务的方案、实施、验收、收尾。

# 范围外（Out of Scope）
- 其他 P0 子任务的实现细节。

# 风险（Risks）
- 风险：实现跨度过大。
  - 影响：延期与返工。
  - 缓解策略：拆分为可日清的小任务并先过验收。

# 依赖（Dependencies）
- release 总计划与共享基础能力可用。

# 开发内容（必须先确认）

## 开发主线
1. 完成订阅下单与回调闭环。
2. 强化价格映射安全与 webhook 幂等。
3. 订阅状态、事件日志、推荐奖励可核账。

## 流程级开发映射
| 流程 | Action/API | 数据表 | 关键验收 |
|---|---|---|---|
| 发起结账 | createCheckoutSession | users（回调后写） | 白名单套餐可用 |
| 处理回调 | POST webhook | users, notifications | 签名正确、幂等生效 |
| 收据通知 | triggerReceiptNotification | notifications | 记录可追踪 |
| 推荐奖励 | webhook 内部逻辑 | referrals, users | 状态流转正确 |

## 交付判定（DoD）
- 支付主链路成功/取消/重放都可解释。
