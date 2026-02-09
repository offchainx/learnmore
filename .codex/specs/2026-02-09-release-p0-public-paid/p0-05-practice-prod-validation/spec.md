id: SPEC-20260209-P0-05
title: P0-05 Practice 生产验收
status: active
owner: codex
related_story:
created_at: 2026-02-09
updated_at: 2026-02-09

# 背景
- P0 发布链路中的子任务，需可独立验收与回滚。

# 目标（Goals）
- 验证拉题、提交、判分、错题与配额链路。

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
1. 打通 Practice 主链路：拉题 -> 作答 -> 提交 -> 判分 -> 回写。
2. 保证配额策略、排行榜联动、成就触发均可复现。
3. 逐表核对作答与错题数据变更。

## 流程级开发映射
| 流程 | Action | 关键输出 | 数据表 |
|---|---|---|---|
| 拉题 | question/quota actions | 可作答题目集合 | questions, users, user_attempts |
| 提交判分 | submitQuiz | score, correctCount, results | exam_records, user_attempts |
| 错题回写 | submitQuiz 内部 | masteryLevel 更新 | error_book |
| 榜单联动 | updateLeaderboardScore | 积分增量 | leaderboard_entries |
| 成就联动 | awardBadgeIfEligible | 新授予徽章 | user_badges, notifications |

## 交付判定（DoD）
- 一次完整练习流程可核账到表。
- 失败场景有可识别错误。
- 重放与重复提交不产生脏数据。
