# Task Kickoff Checklist

> 使用时机：每次新任务开始前。

## 基本信息
- 日期：2026-03-02
- 任务名称：P0-01 全量开发与内测收口
- 负责人：codex + user
- 关联 Story（可选）：P0 Public Paid 发布基线
- 关联 Spec 目录：`.codex/specs/2026-02-09-release-p0-public-paid/p0-01-prod-release-baseline`

## 范围确认
- [x] 目标（Goal）已定义为可验收结果
- [x] 非目标（Out of Scope）已明确
- [x] 影响范围（模块/页面/API/数据）已列出
- [x] 约束（时间/技术/依赖）已记录

## 交付与验收
- [x] `spec.md` 已建立
- [x] `plan.md` 已建立
- [x] `tasks.md` 已建立并可勾选
- [x] `acceptance.md` 已定义测试与验收标准

## 风险与回滚
- [x] 风险清单已写入 `spec.md`
- [x] 回滚策略已写入 `plan.md`
- [x] 需要监控的指标已确认（如有）

## 同步策略
- [x] 明确任务完成后要回写的 `docs/memory-bank` 条目

## 收尾确认（2026-03-02）
- [x] `T-001~T-018` 全部完成
- [x] 核心链路本地内测通过（trial / 首扣 / referral deferred->completed / voucher / webhook 幂等）
- [x] 文档与实现口径一致（spec/plan/tasks/acceptance 已回填）
- [x] 新用户体验修复完成（默认暗黑主题 + Dashboard 首屏加载优化）
