id: SPEC-20260209-P0-10
title: P0-10 Achievement MVP
status: active
owner: codex
related_story:
created_at: 2026-02-09
updated_at: 2026-02-09

# 背景
- P0 发布链路中的子任务，需可独立验收与回滚。

# 目标（Goals）
- 接入真实徽章与统计，增加自动授予逻辑。

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
1. 成就页接入真实统计与徽章状态。
2. 建立自动授予触发器（Practice/Community/Streak）。
3. 确保重复触发不重复授予。

## 能力级开发映射
| 能力 | Action | 数据表 | 验收点 |
|---|---|---|---|
| 成就概览 | getAchievementOverview | users, user_attempts, posts, comments | 数值与统计一致 |
| 徽章列表 | listUserBadges | badges, user_badges | 已解锁/未解锁准确 |
| 自动授予 | awardBadgeIfEligible | user_badges, notifications | 首次授予有效，重复不重复 |

## 交付判定（DoD）
- Achievement MVP 可展示、可触发、可防重。
