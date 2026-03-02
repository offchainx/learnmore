# 技术方案（Plan）

## 概览
- 子任务：P0-01 生产环境与发布基线（扩展到 Onboarding + Upgrade + Billing 统一闭环）
- 方案摘要：以 P0-01 为唯一实现文档源，完成注册默认 Starter、升级支付配置页、Standard 试用、Cancel Plan、Referral 首扣结算、Voucher 规则。
- 执行原则：先文档定稿，后开发实施。

## 执行快照（2026-03-02）
- 文档定稿：完成（T-001~T-003、T-007）。
- 代码实现：完成（T-004、T-008~T-015）。
- 证据收敛：完成（T-005、T-006、T-016，见 acceptance.md）。
- 当前阶段：进入上线前观察与缺陷修复窗口，无待开发项。

## 强制门禁（本任务必须满足）
1. P0-01 四件套（spec/plan/tasks/acceptance）完成并通过审阅。
2. 关键接口契约冻结：`prepareCheckoutAction`、`bindReferralCodeAction`、`cancelSubscriptionAction`、`POST /api/webhook/stripe`。
3. 数据模型变更口径冻结：users/referrals/voucher/webhook 审计。
4. 本地 + 预发验收矩阵可执行，且可回填证据。

## 架构拆分
1. Checkout 编排层
- `prepareCheckoutAction` 负责支付配置页提交编排。
- 负责校验 plan、cycle、paymentMode、referralCode、voucherCode。
- 负责路由到 Stripe 下单能力。

2. Referral 绑定层
- `bindReferralCodeAction(referralCode)`。
- 只做绑定合法性校验与一次绑定约束，不承载奖励计算。

3. Referral 规则层（纯函数）
- `evaluateReferralReward(input)`。
- 统一 Case 1/2/3 与 deferred 分支判断。

4. Referral 结算层（事务）
- `settleReferralOnFirstPayment(eventContext)`。
- 只在首笔真实扣款成功触发。

5. Webhook 编排层
- `checkout.session.completed`：trial 入场与订阅标记。
- `invoice.payment_succeeded`：首扣/续费处理、referral 结算、通知记录。
- `customer.subscription.updated/deleted`：取消计划与状态同步。

## Server Action / 接口契约清单
| Action/接口 | 调用入口 | 输入校验 | 输出与错误 | 幂等/并发 | 审计字段 |
|---|---|---|---|---|---|
| prepareCheckoutAction | /checkout/config 提交 | planKey、billingCycle、paymentMode、referralCode?、voucherCode? | 成功返回 checkoutUrl；失败结构化 code/message | 同参短时重放不写脏数据 | userId、planKey、paymentMode、result、timestamp |
| bindReferralCodeAction | /checkout/config referral 输入 | 推荐码格式、存在性、自推荐、已绑定校验 | 成功/失败结构化返回 | 重复提交不重复绑定 | userId、referralCode、result |
| cancelSubscriptionAction | settings subscription tab | 当前用户订阅存在校验 | 成功标记到期不续费；失败结构化错误 | 同状态重复操作幂等 | userId、subscriptionId、result |
| POST /api/webhook/stripe | Stripe 推送 | 签名、metadata、event 类型校验 | success/ignored/error 结构化 JSON | eventId 去重 + advisory lock | eventId、userId、action、result |

## 数据模型变更口径

### users（新增字段）
- `stripeCustomerId String?`
- `stripeSubscriptionId String?`
- `subscriptionStatus SubscriptionStatus`（`TRIALING | ACTIVE | CANCEL_AT_PERIOD_END | CANCELED | PAST_DUE`）
- `cancelAtPeriodEnd Boolean @default(false)`
- `firstPaidAt DateTime?`

### referrals（扩展字段）
- `ReferralStatus` 增加 `DEFERRED`
- `bindSource`（`UPGRADE`）
- `refereeRewardGrantedAt DateTime?`
- `referrerRewardGrantedAt DateTime?`
- `deferredRewardTier SubscriptionTier?`
- `deferredRewardWeeks Int @default(0)`
- `deferredSettledAt DateTime?`

### vouchers（新增模块）
- `voucher_codes`：支持固定金额与百分比、有效期、启停、使用上限。
- `voucher_redemptions`：记录用户兑换与 session 对应关系。

### webhook 审计（建议）
- `billing_webhook_events`：eventId 唯一，记录处理结果。

## 页面改造清单（避免重复开发）

### 必改
- `src/app/(marketing)/pricing/page.tsx`
- `src/app/(marketing)/checkout/config/page.tsx`（新增）
- `src/components/layout/dashboard-layout.tsx`
- `src/components/dashboard/views/SettingsView.tsx`
- `src/components/layout/TrialBanner.tsx`
- `src/actions/user/auth.ts`
- `src/actions/billing/stripe.ts`
- `src/app/api/webhook/stripe/route.ts`

### 可选
- `src/components/dashboard/DashboardHome.tsx`（仅当需要首页额外 Upgrade 卡片）

### 明确不作为主改造点
- `src/app/(dashboard)/layout.tsx`（仅外壳，不承载导航入口与订阅展示）

## 非 Stripe 渠道本期策略
- Touch n Go/银行转账：支付配置页可见但不可用，统一提示“即将支持”。
- 不创建订单，不触发权益变更。

## Voucher 策略（首版）
- 支持金额减免与百分比折扣。
- 仅应用于 Stripe 首单。
- 可与 referral 并存（voucher 影响金额；referral 影响奖励）。

## 关键流程（实施口径）
1. 用户注册 -> 默认 Starter。
2. 点击 Upgrade -> `/pricing`。
3. 选择付费计划 -> `/checkout/config`。
4. 在配置页选择支付模式并可填 referral/voucher。
5. 仅 Stripe 可提交，创建试用订阅（Standard trial 7 天）。
6. webhook `checkout.session.completed`：写入 trial 状态。
7. webhook `invoice.payment_succeeded`：首扣成功后写 ACTIVE，并触发 referral 结算。
8. 用户在 settings 点击 Cancel Plan：标记到期不续费，到期降级 Starter。

## 风险与回滚
- 触发回滚：支付主链路不可用、webhook 重复结算、订阅状态错乱。
- 回滚策略：
1. 保留支付主链路（Stripe）
2. 临时关闭 referral/voucher 分支
3. 恢复旧入口（pricing 直连）作为紧急降级开关
- 回滚后执行最小冒烟：登录、下单、webhook、settings 展示。

## 开发改动清单（冻结）

### 主要接口 / Server Actions
- `prepareCheckoutAction({ planKey, billingCycle, paymentMode, referralCode?, voucherCode? })`
- `bindReferralCodeAction(referralCode)`
- `cancelSubscriptionAction()`
- `POST /api/webhook/stripe`

### 主要数据表
- `users`
- `referrals`
- `notifications`
- `voucher_codes`
- `voucher_redemptions`
- `billing_webhook_events`（若落地）

### 非目标
- 本期不接入非 Stripe 自动扣款网关。

### 开发完成判定（DoD）
- 文档口径与实现口径一致，且无重复开发点。
- 配置页与 settings 的订阅/取消/奖励逻辑可验收。
- 本地内测矩阵全部通过且证据已回填。

## 口径说明
- 本任务当前状态为“文档+代码+验收证据”三者闭环完成。
- 后续如有规则新增，必须先更新 P0-01 文档再实施。
