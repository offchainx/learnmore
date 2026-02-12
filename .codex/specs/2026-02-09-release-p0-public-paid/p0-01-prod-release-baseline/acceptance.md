# 验收标准（Acceptance）

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
| prepareCheckoutAction | checkout config 提交 | 正常：`{standard,monthly,stripe}`；异常：非法 paymentMode/plan | 未登录应拒绝 | 成功返回 checkoutUrl；失败结构化错误 | 重复提交不写脏数据 | checkout 编排日志 |  |  |
| bindReferralCodeAction | checkout config 推荐码输入 | 正常：有效码；异常：无效码/自推荐/重复绑定 | 未登录应拒绝 | 成功绑定；失败明确错误码 | 重复提交不重复绑定 | bind 审计日志 |  |  |
| cancelSubscriptionAction | settings Cancel Plan 按钮 | 正常：有订阅；异常：无订阅或状态异常 | 未登录应拒绝 | 成功设置到期不续费；失败结构化错误 | 重复点击幂等 | cancel 审计日志 |  |  |
| POST /api/webhook/stripe | Stripe 推送 | 正常：签名正确；异常：缺签名/伪签名 | 外部调用，必须验签 | 正常 200，异常拒绝 | 同 event 不重复处理 | webhook 审计日志 |  |  |

## 数据表核对矩阵（逐项）
| 场景 | 相关表 | 关键字段 | 执行前快照（SQL + 摘要） | 执行后快照（SQL + 摘要） | 差异判断 | 回滚验证 | 结果/证据 |
|---|---|---|---|---|---|---|---|
| 注册默认 Starter | users | subscription_tier、subscription_status | 注册前用户不存在 | 注册后应为 STARTER | 默认状态正确 | 回滚后可恢复旧策略 |  |
| Standard trial 创建 | users | subscription_status、subscription_start、subscription_end、stripe_subscription_id | 下单前状态 | `TRIALING` + trial 时间窗口写入 | 当日不扣款 | 回滚后恢复旧下单路径 |  |
| Cancel Plan | users | cancel_at_period_end、subscription_status | 取消前状态 | cancel_at_period_end=true | 到期不续费生效 | 回滚后可恢复续费策略 |  |
| Referral 首扣结算 | referrals, users | status、reward_granted、deferred_*、first_paid_at | 首扣前 referral=PENDING | 首扣后按规则变更 | 仅首扣触发奖励 | 回滚后核对状态一致 |  |
| Voucher 应用 | voucher_codes、voucher_redemptions、notifications | discount_type、discount_value、applied_amount | 应用前兑换记录为空 | 应用后写入 redemption | 折扣口径正确 | 回滚后记录可追踪 |  |
| webhook 幂等 | notifications（或 webhook_event 表） | link/metadata.eventId | 首次处理后 count=1 | 重放后 count 仍为 1 | 无重复写入 | 重放复验 |  |

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
- [ ] Dashboard 左上 LearnMore 图标区域显示 subscription tier。
- [ ] Sidebar 有明确 Upgrade 入口，且由 `dashboard-layout.tsx` 统一提供。
- [ ] `/pricing` 选择 paid plan 后跳转至支付配置页。
- [ ] 支付配置页中 Touch n Go/银行转账为可见但不可用。
- [ ] Settings 订阅管理展示 trial 倒计时、下次扣款、Cancel Plan。

## 历史基线证据（已完成，保留）
- 已验证 `createCheckoutSession` 与 `POST /api/webhook/stripe` 的负路径与正向幂等基础能力。
- 已验证 `CRON_SECRET` 鉴权生效。
- 现阶段新增需求验收将在 T-007~T-016 执行后补全证据。

## 发布检查
- [x] 已完成文档归位（P0-01 作为唯一实现文档源）
- [ ] 新增 Action/数据模型口径实现并通过本地验证
- [ ] 新增 Action/数据模型口径通过预发验证
- [ ] webhook 重放幂等通过
- [ ] 回滚方案可执行并有证据
