id: SPEC-20260209-P0-01
title: P0-01 生产环境与发布基线
status: active
owner: codex
related_story:
created_at: 2026-02-09
updated_at: 2026-02-09

# 背景
- P0 发布链路中的子任务，需可独立验收与回滚。

# 目标（Goals）
- 补齐生产环境变量、域名回调、部署与回滚 runbook。

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
1. 固化生产环境变量、域名回调、部署与回滚流程。
2. 验证支付入口与 webhook 的环境依赖。
3. 形成上线前环境核对清单。

## 开发单元拆分
| 单元 | 入口 | 关键动作 | 结果 |
|---|---|---|---|
| 环境基线 | 部署配置与 .env | 校验 Stripe/Supabase/APP_URL | 配置可用于生产 |
| 支付入口基线 | pricing 页面 | planKey 到价格映射可用 | 下单可发起 |
| webhook 基线 | /api/webhook/stripe | 验签、幂等、记录 | 回调可稳定处理 |
| 发布回滚 | runbook 文档 | 演练回滚流程 | 可快速止损 |

## 任务边界
- 本任务重点是“生产可运行基线”，不是支付功能深度扩展。

## 交付判定（DoD）
- 环境变量清单完整且可核验。
- 关键回调地址与部署配置一致。
- 回滚 runbook 可执行。
