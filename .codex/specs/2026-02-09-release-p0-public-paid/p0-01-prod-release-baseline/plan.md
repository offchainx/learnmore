# 技术方案（Plan）

## 概览
- 子任务：P0-01 生产环境与发布基线
- 方案摘要：建立生产环境、域名回调、部署与回滚基线，并固化付费相关环境校验。
- 执行原则：先文档、后开发；未获用户确认前禁止进入实现。

## 强制门禁（本任务必须满足）
1. 完成 spec.md、plan.md、tasks.md、acceptance.md 四件套并通过审阅。
2. 明确 Server Action 或接口契约：输入校验、输出结构、错误结构、幂等与并发策略。
3. 明确数据落表点：逐表列出关键字段与校验 SQL。
4. 验证环境固定为 本地 + 预发，两轮都要留下证据。

## Server Action / 接口契约清单
| Action/接口 | 调用入口 | 输入与校验 | 输出与错误 | 幂等/并发策略 | 审计字段 |
|---|---|---|---|---|---|
| createCheckoutSession | 定价页订阅按钮 | planKey 与 billingCycle 白名单 | 成功跳转或配置错误 | 同参重复调用不写脏数据 | userId、action、result、timestamp |
| POST /api/webhook/stripe | Stripe Webhook | 验签通过且 metadata 完整 | 成功更新订阅，异常拒绝 | eventId 幂等 | eventId、sessionId、userId |

## 数据落表点与核对范围
| 相关表 | 关键字段 | 读/写 | 触发场景 | 核对方式 |
|---|---|---|---|---|
| users | subscriptionTier、subscriptionEnd | 写 | 支付成功回调 | 前后 SQL 快照 + 字段 diff |
| notifications | type、link、metadata | 写 | webhook 事件记录 | 检查 stripe event 仅处理一次 |
| referrals | status、rewardGranted、rewardDate | 写 | 推荐奖励结算 | 状态机变更核对 |

## 验证步骤（固定流程）
1. 本地：先跑成功路径，再跑失败与越权路径，记录 Action 输入输出与 SQL 前后快照。
2. 预发：复测同一批关键场景，验证幂等与并发行为，确认结果一致。
3. 回归：执行受影响页面最小冒烟，确认无阻断。

## 风险与回滚
- 触发回滚：核心路径阻断、数据写入异常、重复写入导致脏数据。
- 回滚步骤：回滚任务提交 -> 恢复旧入口或旧行为 -> 重新执行本地与预发冒烟。
- 观测要求：日志可定位 userId、action、result、timestamp。

## 开发启动条件
- 仅当用户在文档审阅后明确批准，才允许切换到开发实施阶段。

## 开发改动清单（必填）

### 开发单元映射
| 开发单元 | 页面/入口 | Action/API | 数据落点 | 验证方式 |
|---|---|---|---|---|
| 价格映射基线 | /pricing | createCheckoutSession | users（后续回调） | 合法/非法套餐测试 |
| webhook 基线 | /api/webhook/stripe | POST webhook | users, notifications, referrals | 签名测试 + 幂等重放 |
| 发布基线 | 部署流程 | N/A | N/A | runbook 演练记录 |

### 必改文件
- src/actions/billing/stripe.ts
- src/app/api/webhook/stripe/route.ts
- src/app/(marketing)/pricing/page.tsx
- docs/release/p0-production-env-checklist.md
- docs/release/p0-smoke-test-checklist.md

### 主要接口 / Server Actions
- createCheckoutSession(planKey, billingCycle)
- POST /api/webhook/stripe

### 主要数据表
- users
- notifications
- referrals

### 非目标
- 不做新支付渠道与多币种。

### 开发完成判定（DoD）
- 环境基线可支撑支付链路上线。
