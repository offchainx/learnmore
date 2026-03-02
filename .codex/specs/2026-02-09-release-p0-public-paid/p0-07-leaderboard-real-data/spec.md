id: SPEC-20260209-P0-07
title: P0-07 Leaderboard 接真数据
status: active
owner: codex
related_story:
created_at: 2026-02-09
updated_at: 2026-02-09

# 背景
- P0 发布链路中的子任务，需可独立验收与回滚。

# 目标（Goals）
- LeaderboardView 去 mock，接入 getLeaderboard/getUserRank。

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
1. Leaderboard 页面完全去 mock，全部接入真实数据。
2. 周榜/月榜/总榜切换准确。
3. 我的排名与榜单分数一致。

## 组件级开发映射
| 组件 | Action | 数据字段 | 数据表 |
|---|---|---|---|
| LeaderboardList | getLeaderboard | rank, score, user.* | leaderboard_entries, users |
| My Rank 区块 | getUserRank | rank, score | leaderboard_entries |
| 周期切换器 | getLeaderboard(period) | period 切换 | leaderboard_entries |

## 交付判定（DoD）
- 页面无 mock 依赖。
- 空榜、已上榜、未上榜三类场景正确。
