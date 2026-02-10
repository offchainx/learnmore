id: SPEC-20260209-P0-09
title: P0-09 支付订阅闭环
status: active
owner: codex
related_story:
created_at: 2026-02-09
updated_at: 2026-02-10

# 背景
- P0 发布链路中的关键子任务，当前需要从“支付闭环”升级为“支付 + 推荐奖励 + 升级体验闭环”。
- 现有推荐逻辑分散在注册与 webhook，需统一规则来源，避免产品口径与实现漂移。

# 目标（Goals）
- 完成升级入口、下单、回调、推荐奖励、订阅展示的端到端业务设计。
- 明确并冻结 Referral 新规则：Starter 可推荐、一次绑定、延迟奖励、幂等结算。
- 为后续开发与上线验收提供唯一实现文档源。

# 非目标（Non-Goals）
- 不扩展到企业计费、发票后台、营销活动系统。
- 不在本轮设计多币种与新支付渠道。

# 约束（Constraints）
- 必须遵循 .codex/workflows/new-task-sop.md。
- 保留“注册即 Standard 7 天试用”的现状。
- 本轮推荐人数上限策略为“不设上限”。

# 范围（In Scope）
- Upgrade 入口流程：点击 Upgrade -> referral code 对话框 -> `/pricing` -> checkout。
- Referral 绑定规则：`bindReferralCodeAction(referralCode)`，一次绑定，不可改。
- Subscription 支付与回调：`createCheckoutSession` + `POST /api/webhook/stripe`。
- Referral 奖励规则（Case 1/2/3）与 Starter 延迟奖励补发。
- Settings 订阅管理与 Admin referral 管理同步展示口径。

# 范围外（Out of Scope）
- P0 其他业务线（Practice/Community/Achievement）的实现细节。
- 邮件投递到达率优化与营销策略设计。

# 风险（Risks）
- 风险：延迟奖励状态与订阅状态不一致。
  - 影响：用户看到的权益与实际数据不一致，引发客诉。
  - 缓解策略：将结算逻辑集中在事务服务，增加 deferred 字段与审计记录。
- 风险：webhook 重放导致重复奖励。
  - 影响：奖励重复发放，造成成本与数据污染。
  - 缓解策略：event 幂等锁 + 事件记录去重 + 重放测试强制通过。
- 风险：规则多分支导致实现偏差。
  - 影响：Case 1/2/3 行为不一致。
  - 缓解策略：规则函数化（policy），单点维护并用验收矩阵覆盖。

# 依赖（Dependencies）
- release 总计划与共享基础能力可用。
- Stripe 测试链路与 webhook 转发可用。
- Supabase 可用于核对 `users/referrals/notifications`。

# 开发内容（必须先确认）

## 开发主线
1. 建立 Upgrade -> referral 绑定 -> checkout 的统一升级路径。
2. 建立 referral policy + settlement service，统一奖励规则与延迟补发。
3. 保证用户端 Settings 与 Admin referral 管理口径一致、可追踪、可验收。

## 已确认业务规则（冻结）
1. Upgrade 后先弹 referral code 对话框，再进入 `/pricing`。
2. 推荐人最低有效等级为 `Starter`。
3. 推荐码一次绑定不可改。
4. 当前策略不设推荐次数上限。
5. Case 1：推荐人 Starter，被推荐人购买 Standard。  
   被推荐人立即获得 2 周 Standard；推荐人记录“延迟 2 周 Standard”，待其升级至 Standard+ 后补发。
6. Case 2：推荐人 Standard，被推荐人购买 Standard。  
   双方立即获得 2 周 Standard。
7. Case 3：其他 tier。  
   双方按各自当前有效 tier 直接获得额外 2 周。
8. Starter 边界：若推荐人 Starter、被推荐人购买 Smart Plus/Premier，推荐人仍走“延迟 2 周 Standard”。

## 流程级开发映射
| 流程 | Action/API | 数据表 | 关键验收 |
|---|---|---|---|
| 升级绑定 | bindReferralCodeAction | referrals | 一次绑定、非法码拒绝 |
| 发起结账 | createCheckoutSession | users（回调后写） | 白名单套餐可用 |
| 处理回调 | POST webhook | users, referrals, notifications | 签名正确、幂等生效、奖励可追踪 |
| 收据通知 | triggerReceiptNotification | notifications | 失败不阻断主流程 |
| 延迟补发 | webhook 内结算服务 | referrals, users | 升级后自动补发并落盘 |

## 交付判定（DoD）
- 升级路径、推荐奖励、订阅展示、管理后台口径一致。
- 支付主链路成功/取消/重放可解释，且 referral 奖励无重复发放。

## 显式假设与默认值
1. 保留“注册即 Standard 7 天试用”。
2. 推荐码升级入口采用 Upgrade 弹窗绑定，不在 pricing 页输入。
3. 推荐码绑定不可修改（一次绑定）。
4. 推荐人数限制当前不启用上限控制。
5. Settings 订阅管理首版为“状态 + 到期 + Upgrade + 待结算奖励摘要”。
6. Admin referral 首版直接展示 deferred 可视字段。

## 上线策略（阶段化）
1. 第一阶段：上线数据结构与服务层。
2. 第二阶段：上线 Upgrade 入口与 Settings/Admin 页面展示。
3. 第三阶段：开启 referral 新规则并按观测项每日巡检。
