id: SPEC-20260209-P0-01
title: P0-01 生产环境与发布基线（Onboarding/Upgrade/Billing 扩展）
status: active
owner: codex
related_story:
created_at: 2026-02-09
updated_at: 2026-03-02

# 背景
- P0 发布链路中的子任务，原先聚焦“生产环境与发布基线”。
- 本轮将 onboarding + 升级 + 支付配置页 + Standard 试用 + Cancel Plan + Referral 首扣结算 + Voucher 规则并入 P0-01，作为唯一实现依据。
- `p0-09-billing-subscription-loop` 保留历史参考，不再作为实现主文档源。

# 目标（Goals）
- 建立“注册默认 Starter -> Upgrade -> /pricing -> 支付配置页 -> Stripe 试用订阅 -> 首扣后 referral 结算 -> Settings 取消计划”的完整闭环。
- 固化支付模式页为必经步骤，避免 `/pricing` 直接跳 Stripe。
- 统一 referral 入口与触发口径，消除注册入口与升级入口双写风险。
- 在不重复开发的前提下，统一 dashboard 入口改造位置。

# 非目标（Non-Goals）
- 本期不接入新的非 Stripe 网关。
- 本期不实现 Touch n Go / 银行转账真实扣款链路。
- 不扩展到企业计费、多币种与账单中心完整版。

# 约束（Constraints）
- 必须遵循 `.codex/workflows/new-task-sop.md` 与 `task-lifecycle-sop.md`。
- 本轮以 P0-01 为唯一实现口径源，文档、代码与验收证据必须保持一致。
- Standard 是唯一 7 天试用套餐。

# 范围（In Scope）
- 注册后默认订阅状态改为 Starter。
- Upgrade 入口与支付配置页流程。
- 支付模式页（Stripe/TNG/银行转账/Voucher）与本期可用性口径。
- Standard trial（当日不扣款，7 天后首扣）。
- Settings 的 Cancel Plan（到期不续费）与订阅状态展示。
- referral 绑定入口迁移（仅 Upgrade）与首扣后结算。
- Voucher 模块首版（后台配置金额/折扣 + 前台应用）。
- webhook 事件处理扩展与幂等。

# 范围外（Out of Scope）
- Touch n Go 与银行转账的真实网关接入与自动回调入账。
- 非 Standard 套餐试用策略。
- 大规模会员中心/发票/税务系统。

# 风险（Risks）
- 风险：价格页、配置页、Settings 分别实现逻辑导致流程分叉。
  - 影响：同一用户在不同入口看到不一致状态。
  - 缓解策略：统一由 `prepareCheckoutAction` 编排。
- 风险：webhook 事件扩展后重复触发奖励。
  - 影响：referral 奖励重复发放。
  - 缓解策略：event 幂等锁 + 通知事件去重 + 重放验收。
- 风险：dashboard 多页面重复加 Upgrade 入口造成返工。
  - 影响：UI 不一致与维护成本上升。
  - 缓解策略：统一改 `dashboard-layout.tsx`，子页面不单独重复加入口。

# 依赖（Dependencies）
- Stripe 测试链路与 webhook 可用。
- Supabase 可用于核对 users/referrals/notifications/voucher 落表。
- Vercel 预发环境与运行日志可检索。

# 开发内容（已完成）

## 开发主线
1. 注册默认 Starter，升级链路转为“先配置后支付”。
2. Standard 试用订阅、取消计划、首扣事件同步。
3. referral 绑定与结算口径统一到 Upgrade + 首扣成功。
4. voucher 可配置并参与首单金额计算。

## 已确认业务规则（冻结）
1. 注册默认 Starter。
2. `/pricing` 选择付费计划后先进入支付配置页，不直接跳 Stripe。
3. 支付模式本期口径：Stripe 打通；Touch n Go/银行转账展示“即将支持”。
4. referral code 入口仅 Upgrade 流程，注册页不再绑定。
5. referral 奖励在“首笔真实扣款成功”触发，不在试用开始触发。
6. Voucher 支持金额减免/百分比折扣，且可与 referral 同时使用。
7. Cancel Plan 语义：`cancel_at_period_end=true`，到期降级 Starter。
8. dashboard 入口改造统一在 `dashboard-layout.tsx`，不在各 dashboard 子页面重复开发。

## 流程级开发映射
| 流程 | 入口 | Action/API | 关键结果 |
|---|---|---|---|
| 注册初始化 | /register | signupAction | 默认 Starter |
| 升级发起 | Dashboard Upgrade -> /pricing | 路由跳转 | 进入套餐选择 |
| 支付配置 | /checkout/config | prepareCheckoutAction | 统一校验并创建下单 |
| Stripe 下单 | Stripe Checkout | createCheckoutSession（内部） | Standard 试用订阅建立 |
| 回调处理 | /api/webhook/stripe | webhook handlers | 试用状态、首扣状态、幂等 |
| referral 绑定 | checkout config | bindReferralCodeAction | 一次绑定不可改 |
| referral 结算 | 首扣成功事件 | settlement service | 奖励发放/延迟发放 |
| 取消计划 | settings subscription | cancelSubscriptionAction | 到期不续费 |
| voucher 应用 | checkout config/admin vouchers | voucher actions | 折扣生效并可追踪 |

## 交付判定（DoD）
- P0-01 文档成为唯一实现依据，口径无冲突。
- 支付主链路、referral、voucher、取消计划的接口契约完整。
- 明确不重复开发边界（layout 统一改造点）。
- 本地内测通过并完成证据回填。

## 当前完成度（2026-03-02）
- 文档层：已完成归位与冻结（`spec.md/plan.md/tasks.md/acceptance.md/task-kickoff-checklist.md`）。
- 实现层：已完成 `prepareCheckout/bindReferral/cancel/webhook/voucher` 与页面改造。
- 验证层：本地内测通过（含 trial、首扣、referral deferred->completed、voucher、webhook 幂等）。
- 任务层：`T-001~T-016` 全部完成并回填证据。
