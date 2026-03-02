# 执行任务清单（Tasks）

| id | description | owner | status (todo/doing/done) | link (PR/commit) |
|---|---|---|---|---|
| T-001 | 建立上线前专项测试清单并维护执行记录 | codex | todo |  |
| T-002 | 确认 referral 功能正常（注册绑定、首付结算、奖励发放与幂等） | codex | todo |  |
| T-003 | 确认 notification 功能正常（站内通知创建、展示、状态更新） | codex | todo |  |
| T-004 | 引用并执行 p0-10 acceptance 矩阵，不在 p0-12 重复维护实现规则 | codex | todo |  |

## 备注
- 本任务用于持续追加上线前验证项，当前先纳入 referral 与 notification 两项。
- Referral/Subscription 的实现口径以 `p0-10-billing-subscription-loop` 为准。
