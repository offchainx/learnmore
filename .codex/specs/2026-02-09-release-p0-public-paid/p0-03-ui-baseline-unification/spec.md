id: SPEC-20260209-P0-03
title: P0-03 UI 基线统一
status: active
owner: codex
related_story:
created_at: 2026-02-09
updated_at: 2026-02-09

# 背景
- P0 发布链路中的子任务，需可独立验收与回滚。

# 目标（Goals）
- 统一设计 token 与基础组件状态，建立空态模板。

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
1. 建立 UI 基线（token、按钮、卡片、空态模板）。
2. 统一 dashboard 与移动端导航视觉与路径。
3. 保证 UI 调整不破坏数据读取链路。

## 开发单元拆分
| 单元 | 组件 | 目标 |
|---|---|---|
| 全局 token | globals.css/tailwind | 颜色/间距/圆角/阴影统一 |
| 基础控件 | button/card/input/textarea | 状态一致（默认/hover/disabled） |
| 空态模板 | dashboard 视图 | 无数据时有统一提示和 CTA |
| 移动导航 | BottomTabBar | 路由前缀一致 |

## 任务边界
- 不做全站视觉重设计。

## 交付判定（DoD）
- UI 基线一致且核心页面无功能回归。
