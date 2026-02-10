# 技术方案（Plan）

## 概览
- 子任务：P0-09 支付订阅闭环
- 方案摘要：闭环升级与支付订阅链路，统一 referral 绑定、奖励结算、延迟补发、订阅展示。
- 执行原则：先文档、后开发；未获用户确认前禁止进入实现。

## 强制门禁（本任务必须满足）
1. 完成 spec.md、plan.md、tasks.md、acceptance.md 四件套并通过审阅。
2. 明确 Server Action 或接口契约：输入校验、输出结构、错误结构、幂等与并发策略。
3. 明确 referral 奖励规则（Case 1/2/3 + Starter 延迟边界）并形成单一规则源。
4. 明确数据落表点：逐表列出关键字段与校验 SQL。
5. 明确页面一致性口径：Settings 与 Admin 页面数据同步。
6. 验证环境固定为 本地 + 预发，两轮都要留下证据。

## Server Action / 接口契约清单
| Action/接口 | 调用入口 | 输入与校验 | 输出与错误 | 幂等/并发策略 | 审计字段 |
|---|---|---|---|---|---|
| bindReferralCodeAction | Upgrade 对话框 | referralCode 格式 + 有效性 + 绑定唯一性 | 成功绑定或返回明确错误码 | 同用户重复提交不重复绑定 | userId、referralCode、result |
| createCheckoutSession | Upgrade -> pricing 下单 | planKey 与 billingCycle 白名单 | 成功跳转 Stripe，非法参数拒绝 | 重复请求不写本地脏数据 | userId、planKey、cycle、result |
| POST /api/webhook/stripe | Stripe webhook | 验签与 metadata 校验 | 成功更新订阅并记录事件 | event.id 重放仅处理一次 | eventId、userId、result |
| triggerReceiptNotification | webhook 内部调用 | userId、email、amount | 成功发送通知或记录异常 | 可重试，不影响主流程 | userId、sessionId、result |

## 架构拆分（实现组织）
1. `bindReferralCodeAction`
- 负责升级前推荐码绑定。
- 仅做输入校验与调用服务层，不承载奖励规则。

2. `evaluateReferralReward(input)`（纯规则）
- 文件建议：`src/lib/referral/policy.ts`。
- 负责 Case 1/2/3 与 Starter 延迟边界的规则计算。
- 输出结构化结算结果（即时奖励 + 延迟奖励）。

3. `settleReferralOnCheckout(eventContext)`（事务结算）
- 文件建议：`src/lib/referral/service.ts`。
- 负责 webhook 场景下的事务更新：`users/referrals/notifications`。
- 负责延迟奖励的后续补发结算。

## 数据模型变更（口径冻结）
1. `ReferralStatus` 扩展为包含 `DEFERRED`。
2. `referrals` 增加 deferred 字段：
- `deferredRewardTier`（SubscriptionTier，可空）
- `deferredRewardWeeks`（Int，默认 0）
- `deferredSettledAt`（DateTime，可空）
3. `referrals` 强制新增字段（非可选口径）：
- `bindSource`（`SIGNUP | UPGRADE`）
- `refereeRewardGrantedAt`（DateTime，可空）
- `referrerRewardGrantedAt`（DateTime，可空）
4. 保留 `rewardGranted` / `rewardDate`，语义改为：
- `rewardGranted=true` 表示整条推荐流程最终完成（含延迟奖励已结算）。
- `rewardDate` 记录整条流程完成时间（对应最终完成时点）。

## 迁移策略（口径冻结）
1. 仓库当前无 `prisma/migrations` 目录，采用现有工程方式执行 `prisma db push`。
2. 结构变更需在发布说明中记录：
- 新增/变更字段清单
- 执行时间与环境
- 回滚口径（关闭 referral 发放分支并回退代码）

## 数据落表点与核对范围
| 相关表 | 关键字段 | 读/写 | 触发场景 | 核对方式 |
|---|---|---|---|---|
| users | subscriptionTier、subscriptionStart、subscriptionEnd | 写 | 支付成功 | 前后对比订阅字段 |
| notifications | type、link、metadata.eventId | 写 | webhook 事件与收据通知 | 幂等链路核对 |
| referrals | status、rewardGranted、rewardDate、deferredRewardTier、deferredRewardWeeks、deferredSettledAt | 写 | 推荐奖励结算与延迟补发 | 推荐状态机与延迟状态核对 |

## 验证步骤（固定流程）
1. 本地：先跑成功路径，再跑失败与越权路径，记录 Action 输入输出与 SQL 前后快照。
2. 预发：复测同一批关键场景，验证幂等与并发行为，确认结果一致。
3. 页面一致性：验证 Settings 订阅管理与 Admin referral 管理数据一致。
4. 回归：执行受影响页面最小冒烟，确认无阻断。

## 风险与回滚
- 触发回滚：核心路径阻断、数据写入异常、重复写入导致脏数据。
- 回滚步骤：
  1. 回滚任务提交 -> 恢复旧入口或旧行为。
  2. 临时降级：保留支付主链路，关闭 referral 发放分支（可分离降级）。
  3. 重新执行本地与预发冒烟。
- 观测要求：日志可定位 userId、action、result、timestamp。

## 上线与观测（口径冻结）
1. 上线顺序：
- 先上线数据结构与服务层。
- 再上线 UI 入口（Upgrade 对话框、Settings/Admin 展示）。
- 最后开启 referral 新规则。
2. 关键日志字段统一：
- `eventId`、`userId`、`referralId`、`rewardPath`（`immediate | deferred`）、`result`。
3. 每日巡检 SQL 指标：
- `DEFERRED` 数量。
- `deferredSettledAt` 转化率。
- 重复 event 处理数量。

## 开发启动条件
- 仅当用户在文档审阅后明确批准，才允许切换到开发实施阶段。

## 开发改动清单（必填）

### 开发单元映射
| 开发单元 | 页面/入口 | Action/API | 数据表 | 验证方式 |
|---|---|---|---|---|
| 升级绑定 | dashboard/settings Upgrade | bindReferralCodeAction | referrals | 绑定成功/失败路径 |
| 下单 | pricing page | createCheckoutSession | session metadata | 合法参数与错误参数验证 |
| 回调处理 | /api/webhook/stripe | POST webhook | users, notifications, referrals | 签名 + 幂等重放 |
| 收据通知 | webhook 后置 | triggerReceiptNotification | notifications | 失败不阻断主流程 |
| 延迟补发 | webhook（推荐人后续升级） | settlement service | referrals, users | 延迟奖励补发准确 |
| 页面同步 | settings/admin | N/A | users, referrals | 页面字段一致性核对 |

### 必改文件
- src/actions/billing/stripe.ts
- src/actions/referral/bind.ts（新增）
- src/app/api/webhook/stripe/route.ts
- src/app/(marketing)/pricing/page.tsx
- src/components/dashboard/DashboardHome.tsx
- src/components/dashboard/views/SettingsView.tsx
- src/app/(dashboard)/admin/referrals/page.tsx
- docs/release/p0-production-env-checklist.md

### 主要接口 / Server Actions
- bindReferralCodeAction(referralCode)
- createCheckoutSession
- POST /api/webhook/stripe
- triggerReceiptNotification

### 主要数据表
- users
- notifications
- referrals

### 非目标
- 不做企业计费与发票后台。

### 开发完成判定（DoD）
- 支付订阅与推荐奖励闭环稳定且可核账。
- Settings 与 Admin 页面订阅/推荐数据一致。
