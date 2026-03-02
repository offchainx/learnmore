id: SPEC-20260209-P0-05
title: P0-05 Dashboard P0 化
status: active
owner: codex
related_story:
created_at: 2026-02-09
updated_at: 2026-02-09

# 背景
- P0 发布链路中的子任务，需可独立验收与回滚。

# 目标（Goals）
- 保留真实数据卡片与有效 CTA，清理误导入口。

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
1. 让 Dashboard 所有核心组件均由 getDashboardStats 的真实数据驱动。
2. 逐组件校验“字段映射 -> 数据表 -> 页面展示”一致。
3. 清理误导入口与假数据文案。

## 组件级开发映射
| 组件/区域 | 字段来源 | Action | 对应数据表 |
|---|---|---|---|
| 顶部统计卡（studyTime/questions/accuracy/mistakes/streak/level/xp） | stats.* | getDashboardStats | users, user_attempts, error_book |
| DailyMissions | dailyTasks | getDashboardStats -> ensureDailyTasks | daily_tasks |
| 学科强弱图 | subjectStrengths | getDashboardStats | user_attempts, questions, chapters, subjects |
| 最近学习活动 | recentActivity | getDashboardStats | user_progress, lessons, chapters, subjects |
| Weakness Sniper | weaknesses | getDashboardStats | error_book, questions, chapters, subjects |

## 页面级开发要求
- /dashboard 首屏加载必须只依赖真实数据。
- 任一组件无数据时展示规范空态，不展示假数据。

## 交付判定（DoD）
- 5 个核心组件全部通过映射核对。
- 刷新页面不产生异常重复写入。
