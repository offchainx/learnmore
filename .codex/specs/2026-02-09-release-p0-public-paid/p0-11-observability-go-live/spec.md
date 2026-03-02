id: SPEC-20260209-P0-11
title: P0-11 观测与上线验收
status: active
owner: codex
related_story:
created_at: 2026-02-09
updated_at: 2026-02-09

# 背景
- P0 发布链路中的子任务，需可独立验收与回滚。

# 目标（Goals）
- 完善关键日志、冒烟清单、上线彩排与回滚演练。

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
1. 建立上线前可观测与验收闭环。
2. 覆盖核心路径冒烟（Auth/Practice/Leaderboard/Community/Billing）。
3. 固化回滚演练与故障定位路径。

## 验收单元映射
| 单元 | 覆盖接口 | 数据表核对 | 输出 |
|---|---|---|---|
| Practice 冒烟 | submitQuiz | exam_records, user_attempts, error_book | 提交链路可核账 |
| Leaderboard 冒烟 | getLeaderboard/getUserRank | leaderboard_entries | 排名一致 |
| Community 冒烟 | getPosts/createPost/createComment/toggleLike | posts/comments/post_likes | 互动闭环稳定 |
| Billing 冒烟 | createCheckoutSession/webhook | users/notifications/referrals | 支付链路稳定 |

## 交付判定（DoD）
- 本地 + 预发两轮验证都通过。
- 问题可通过日志与 SQL 快速定位。
