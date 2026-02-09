# 验收标准（Acceptance）

## 功能验收（Given / When / Then）
- 给定：用户选择合法套餐
  当：调用 createCheckoutSession
  则：仅允许白名单套餐并跳转 Stripe。
- 给定：Stripe 重复推送同一事件
  当：重复调用 webhook
  则：订阅状态与事件记录不会重复写入。

## Server Action 验证矩阵（本地 + 预发都要执行）
| Action 名称 | 调用入口（页面/按钮/事件） | 输入样例（正常/异常） | 权限校验（未登录/越权） | 预期输出（成功/失败） | 幂等要求 | 日志与错误码 | 结果（pass/fail） | 证据 |
|---|---|---|---|---|---|---|---|---|
| createCheckoutSession | Pricing 下单 | 正常：合法 plan 与 cycle；异常：非法组合 | 未登录应拒绝 | 成功重定向；失败返回错误 | 同参重放不写库 | checkout 日志可检索 |  |  |
| POST /api/webhook/stripe | Stripe 回调 | 正常：签名正确；异常：签名错误 | 外部验签必过 | 成功更新订阅；异常拒绝或忽略 | 同 eventId 幂等 | webhook 处理日志 |  |  |
| triggerReceiptNotification | webhook 后置 | 正常：email 存在；异常：邮件失败 | 仅内部调用 | 通知成功或记录错误 | 重试不影响订阅状态 | receipt 日志 |  |  |

## 数据表核对矩阵（逐项）
| 场景 | 相关表 | 关键字段 | 执行前快照（SQL + 摘要） | 执行后快照（SQL + 摘要） | 差异判断 | 回滚验证 | 结果/证据 |
|---|---|---|---|---|---|---|---|
| 订阅落库 | users | subscription_tier、subscription_end | SELECT subscription_tier, subscription_end FROM users WHERE id={{userId}}; | webhook 后再次查询 | 订阅字段按套餐变化 | 回滚后恢复原值 |  |
| webhook 幂等 | notifications | link、eventId | SELECT count(*) FROM notifications WHERE link={{stripe_event_link}}; | 重放后再次查询 | 计数维持 1 | 清理测试事件复测 |  |
| 推荐奖励 | referrals, users | status、reward_granted、subscription_end | 查询 referral 与双方订阅字段 | 处理后再次查询 | 状态更新且奖励准确 | 回滚后复核 |  |

## 发布检查
- [ ] 本地验证完成并附证据
- [ ] 预发复测完成并附证据
- [ ] 幂等与越权场景通过
- [ ] 回滚方案可执行
- [ ] 已获得用户批准进入开发
