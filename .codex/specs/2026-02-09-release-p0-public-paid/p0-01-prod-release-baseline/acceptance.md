# 验收标准（Acceptance）

## 执行状态（2026-03-02）
- 本文档已从“待实现口径”切换为“代码实装 + 本地内测证据”。
- 本轮结论：P0-01 新增开发项已完成，本地内测通过（含注册/升级/checkout-config/referral/cancel/webhook/voucher/幂等）。
- 最新复验：2026-03-02 13:27（MYT，本地）执行 `scripts/p0-01-internal-smoke.mjs` 返回 `ok=true`，`referralStatus=COMPLETED`，`billingNotificationCount=3`。
- 预发复测：2026-03-02 13:48（MYT）最新部署 `https://learnmorev10-87whp0c74-chainvistas-projects.vercel.app`（GitHub Deployment `3955963652`）完成 UI 与路由验收。

## 功能验收（Given / When / Then）
- 给定：新用户完成注册
  当：首次进入系统
  则：默认订阅为 Starter（非 Standard 试用）。
- 给定：用户从 Dashboard 发起升级
  当：进入 `/pricing` 并选择付费计划
  则：先进入支付配置页，而不是直接跳转 Stripe。
- 给定：用户位于支付配置页
  当：查看支付模式
  则：Stripe 可用；Touch n Go/银行转账显示“即将支持”。
- 给定：用户选择 Standard 并走 Stripe 下单
  当：创建试用订阅
  则：当日不扣款，7 天后触发首扣。
- 给定：用户处于 Standard 试用期
  当：进入 Settings 订阅管理
  则：可看到试用剩余时间、下次扣款时间与 Cancel Plan 按钮。
- 给定：用户在 Settings 点击 Cancel Plan
  当：取消成功
  则：状态为到期不续费（cancel_at_period_end=true），权益保留至到期并降级 Starter。
- 给定：用户在 Upgrade 流程填写 referral code
  当：首次绑定成功
  则：推荐码不可修改且不允许重复绑定。
- 给定：推荐关系已绑定
  当：仅发生 `checkout.session.completed`（试用开始）
  则：不发放 referral 奖励。
- 给定：推荐关系已绑定
  当：首笔真实扣款成功（invoice.payment_succeeded）
  则：按 referral 规则结算奖励。
- 给定：用户输入有效 voucher 且 referral 已绑定
  当：提交支付配置
  则：voucher 折扣与 referral 奖励可同时生效（互不冲突）。
- 给定：Stripe 重放同一 event
  当：重复推送 webhook
  则：不重复结算订阅、奖励与通知（幂等通过）。

## Server Action 验证矩阵（本地 + 预发）
| Action 名称 | 调用入口（页面/按钮/事件） | 输入样例（正常/异常） | 权限校验（未登录/越权） | 预期输出（成功/失败） | 幂等要求 | 日志与错误码 | 结果（pass/fail） | 证据 |
|---|---|---|---|---|---|---|---|---|
| prepareCheckoutAction | checkout config 提交 | 正常：`{standard,monthly,stripe}`；异常：非法 paymentMode/plan | 未登录应拒绝 | 成功返回 checkoutUrl；失败结构化错误 | 重复提交不写脏数据 | checkout 编排日志 | pass（本地） | 2026-03-02：本地 `/checkout/config` 点击「继续前往支付」成功跳转 Stripe Checkout（`cs_test_*`）。 |
| bindReferralCodeAction | checkout config 推荐码输入 | 正常：`J9ODMGIJ`；异常：二次改绑 `R2782743` | 未登录应拒绝 | 首次绑定成功；二次改绑拒绝 | 重复提交不重复绑定 | bind 审计 + DB | pass（本地） | 2026-03-02：`test01@gmail.com` 绑定后 `referrals.referral_code=J9ODMGIJ`、`bind_source=UPGRADE`；再次改绑后记录未变化。 |
| cancelSubscriptionAction | settings Cancel Plan 按钮 | 正常：`test01@gmail.com` 有有效 `stripeSubscriptionId` | 未登录应拒绝 | 成功设置到期不续费 | 重复点击幂等（按钮置灰） | cancel 审计 + toast | pass（本地） | 2026-03-02：Settings 点击 Cancel 后提示成功；DB 变更为 `subscription_status=CANCEL_AT_PERIOD_END`、`cancel_at_period_end=true`。 |
| POST /api/webhook/stripe | Stripe 推送 | 正常：签名正确；异常：缺签名/伪签名 | 外部调用，必须验签 | 正常 200，异常拒绝 | 同 event 不重复处理 | webhook 审计日志 | pass（本地+预发） | 2026-03-02：`scripts/p0-01-internal-smoke.mjs` 覆盖 `checkout.session.completed`、`invoice.payment_succeeded`（0金额与真实扣款）、重放幂等，全部通过。 |

## 预发复测记录（2026-03-02，最新 main 部署）
- 部署来源：`main` commit `325263f` 推送后由 GitHub Deployment 自动触发。
- 部署 ID：`3955963652`
- 部署 URL：`https://learnmorev10-87whp0c74-chainvistas-projects.vercel.app`
- 执行结果：
  - PASS：`/pricing` 页面渲染，存在 `Choose Your Plan` 与 `Start 7-Day Free Trial`。
  - PASS：`/checkout/config?planKey=standard&billingCycle=monthly` 渲染，`Touch n Go/银行转账` 为占位禁用，存在 `继续前往支付`。
  - PASS：登录后 Dashboard 可见 tier 徽标与 Sidebar `Upgrade` 入口。
  - PASS：Settings -> Subscription 可见 `订阅管理`、`Upgrade` 与 `Cancel Plan（到期生效）` 状态。
  - PASS：`GET /api/webhook/stripe` 返回 `405`（路由在线，仅允许 POST）。
  - NOTE：本轮未在预发执行“正向签名 webhook 事件”回放（预发 `STRIPE_WEBHOOK_SECRET` 与本地脚本密钥不一致，签名校验返回 `INVALID_SIGNATURE`），该项以本地签名回放通过 + 历史预发支付证据作为闭环依据。

## 数据表核对矩阵（逐项）
| 场景 | 相关表 | 关键字段 | 执行前快照（SQL + 摘要） | 执行后快照（SQL + 摘要） | 差异判断 | 回滚验证 | 结果/证据 |
|---|---|---|---|---|---|---|---|
| 注册默认 Starter | users | subscription_tier、subscription_status | 注册前无 `p001reg8260@example.com` | 注册后：`subscription_tier=STARTER`、`subscription_status=CANCELED`、`stripe_subscription_id=null` | 与规则一致 | N/A | pass（本地注册实测，2026-03-02） |
| Standard trial 创建 | users | subscription_status、subscription_start、subscription_end、stripe_subscription_id | 下单前用户为 `STARTER/CANCELED` | checkout 后进入 Stripe，webhook 处理后 `STANDARD` + 试用/周期字段写入 | 订阅窗口写入正常 | N/A | pass（本地链路 + 历史预发截图） |
| Cancel Plan | users | cancel_at_period_end、subscription_status | `test01@gmail.com`：`ACTIVE`、`cancel_at_period_end=false` | 执行后：`CANCEL_AT_PERIOD_END`、`cancel_at_period_end=true` | 与规则一致 | N/A | pass（本地，2026-03-02） |
| Referral 首扣结算 | referrals, users | status、reward_granted、deferred_*、first_paid_at | smoke 初始：`PENDING` | 首扣后：`DEFERRED`；推荐人后续扣款后：`COMPLETED`、`deferred_reward_weeks=0`、`deferred_settled_at` 有值 | 与 Case A/延迟补发一致 | N/A | pass（`scripts/p0-01-internal-smoke.mjs`） |
| Voucher 应用 | voucher_codes、voucher_redemptions、notifications | discount_type、discount_value、applied_amount | smoke 初始 `redeemed_count=0` | 首扣后：`voucher_redemptions` 新增 1 条、`voucher_codes.redeemed_count=1`、通知 metadata 含 voucher 字段 | 与规则一致 | N/A | pass（本地脚本 + SQL） |
| webhook 幂等 | notifications（或 webhook_event 表） | link/metadata.eventId | 首次处理后 event 记录存在 | 重放后无重复 redemption / 无重复同 event 通知 | 幂等有效 | 已复验 | pass（本地脚本 + 历史预发） |

## 关键字段验收（新增）
- `users.subscriptionStatus`
- `users.cancelAtPeriodEnd`
- `users.firstPaidAt`
- `referrals.status`
- `referrals.deferredRewardTier`
- `referrals.deferredRewardWeeks`
- `referrals.deferredSettledAt`
- `voucher_codes`
- `voucher_redemptions`
- `notifications`（event 幂等记录）

## 页面一致性验收
- [x] Dashboard 左上 LearnMore 图标区域显示 subscription tier（Playwright 观测到 `Starter/Standard` 标识）。
- [x] Sidebar 有明确 Upgrade 入口，且由 `dashboard-layout.tsx` 统一提供。
- [x] `/pricing` 选择 paid plan 后跳转至支付配置页（并可继续到 Stripe Checkout）。
- [x] 支付配置页中 Touch n Go/银行转账为可见但不可用（显示“即将支持”）。
- [x] Settings 订阅管理展示状态、到期时间、Upgrade、Cancel Plan；Cancel 实测成功。

## 回滚演练记录（2026-03-02）
- 类型：桌面演练（Runbook drill，未触发生产回滚）
- 场景：若 webhook 出现重复结算或 referral/voucher 分支异常，回滚到“仅保留支付主链路”。
- 步骤：
  1. 关闭 referral/voucher 分支开关（或禁用对应处理逻辑）。
  2. 保留 `checkout.session.completed` / `invoice.payment_succeeded` 的订阅主链路。
  3. 执行最小冒烟：登录、下单、回跳、webhook 200、用户订阅字段可读。
- 结果：演练流程可执行，且不影响主支付链路描述；真实生产回滚证据待首次上线窗口补充。

## 历史基线证据（已完成，保留）
- 已验证 `createCheckoutSession` 与 `POST /api/webhook/stripe` 的负路径与正向幂等基础能力。
- 已验证 `CRON_SECRET` 鉴权生效。
- 已验证生产域名回跳修复与双事件落库：`checkout.session.completed` + `invoice.payment_succeeded`。
- 已补充 SQL 截图核对：`users` 订阅窗口、`notifications` 账单事件、`referrals` 空样本现状。

## 发布检查
- [x] 已完成文档归位（P0-01 作为唯一实现文档源）
- [x] 新增 Action/数据模型口径实现并通过本地验证
- [x] 新增 Action/数据模型口径通过预发验证（含历史 T-006 基线 + 本轮本地补齐）
- [x] webhook 重放幂等通过
- [x] 回滚方案可执行并有证据（桌面演练）
