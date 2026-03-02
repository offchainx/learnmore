# 验收标准（Acceptance）

## 功能验收（Given / When / Then）
- 给定：用户点击 Upgrade
  当：弹出 referral code 对话框并提交合法推荐码
  则：绑定成功后进入 `/pricing`，且推荐码一次绑定不可修改。
- 给定：推荐人是 Starter，被推荐人购买 Standard（Case 1）
  当：支付成功并触发 webhook
  则：被推荐人立即获得 2 周 Standard，推荐人记录延迟 2 周 Standard 待补发。
- 给定：推荐人是 Standard，被推荐人购买 Standard（Case 2）
  当：支付成功并触发 webhook
  则：双方都立即获得 2 周 Standard。
- 给定：其他 tier 组合（Case 3）
  当：支付成功并触发 webhook
  则：双方都按各自当前有效 tier 直接获得额外 2 周。
- 给定：推荐人 Starter，被推荐人购买 Smart Plus/Premier（Starter 边界）
  当：支付成功并触发 webhook
  则：推荐人仍按“延迟 2 周 Standard”处理，不发生免费升档。
- 给定：推荐人存在延迟奖励且其后续升级到 Standard+
  当：推荐人自己的支付成功 webhook 触发
  则：延迟奖励自动补发并标记已结算。
- 给定：Stripe 重复推送同一事件
  当：重复调用 webhook
  则：订阅状态与推荐奖励不会重复写入。

## Server Action 验证矩阵（本地 + 预发都要执行）
| Action 名称 | 调用入口（页面/按钮/事件） | 输入样例（正常/异常） | 权限校验（未登录/越权） | 预期输出（成功/失败） | 幂等要求 | 日志与错误码 | 结果（pass/fail） | 证据 |
|---|---|---|---|---|---|---|---|---|
| bindReferralCodeAction | Upgrade 对话框 | 正常：有效 referralCode；异常：无效码/重复绑定 | 未登录应拒绝 | 成功绑定；失败返回明确错误码 | 重复提交不重复绑定 | bind 日志可检索 |  |  |
| createCheckoutSession | Pricing 下单 | 正常：合法 plan 与 cycle；异常：非法组合 | 未登录应拒绝 | 成功重定向；失败返回错误 | 同参重放不写库 | checkout 日志可检索 |  |  |
| POST /api/webhook/stripe | Stripe 回调 | 正常：签名正确；异常：签名错误/metadata 异常 | 外部验签必过 | 成功更新订阅并结算 referral；异常拒绝或忽略 | 同 eventId 幂等 | webhook 处理日志 |  |  |
| triggerReceiptNotification | webhook 后置 | 正常：email 存在；异常：邮件失败 | 仅内部调用 | 通知成功或记录错误 | 重试不影响订阅状态 | receipt 日志 |  |  |

## 数据表核对矩阵（逐项）
| 场景 | 相关表 | 关键字段 | 执行前快照（SQL + 摘要） | 执行后快照（SQL + 摘要） | 差异判断 | 回滚验证 | 结果/证据 |
|---|---|---|---|---|---|---|---|
| 订阅落库 | users | subscription_tier、subscription_end | SELECT id, subscription_tier, subscription_end FROM users WHERE id={{userId}}; | webhook 后再次查询 | 订阅字段按套餐变化 | 回滚后恢复原值 |  |
| 推荐奖励即时结算 | referrals, users | status、reward_granted、reward_date、subscription_end | 查询 referral 与双方订阅字段 | 处理后再次查询 | Case 2/3 即时奖励正确 | 回滚后复核 |  |
| 推荐奖励延迟结算 | referrals, users | status、deferred_reward_tier、deferred_reward_weeks、deferred_settled_at、subscription_end | 查询 referral deferred 字段与推荐人订阅 | 推荐人升级后再次查询 | 延迟奖励补发且标记结算 | 回滚后复核 |  |
| webhook 幂等 | notifications | link、metadata.eventId | SELECT count(*) FROM notifications WHERE link={{stripe_event_link}}; | 重放后再次查询 | 计数维持 1 | 清理测试事件复测 |  |

## 页面一致性验收
- [ ] Settings 订阅管理页展示当前 tier、到期时间、待结算奖励信息与 Upgrade 入口。
- [ ] Admin referral 管理页展示 deferred 状态与结算结果。
- [ ] 用户端与管理端针对同一 referral 记录口径一致。

## 观测与日志验收
- [ ] webhook/referral 关键日志包含 `eventId`、`userId`、`referralId`、`rewardPath(immediate|deferred)`、`result`。
- [ ] 每日巡检可产出 `DEFERRED` 数量与 `deferredSettledAt` 转化率。
- [ ] 重复 event 处理数量可统计并可追溯。

## 发布检查
- [ ] 本地验证完成并附证据
- [ ] 预发复测完成并附证据
- [ ] 幂等与越权场景通过
- [ ] 回滚方案可执行
- [ ] 已获得用户批准进入开发
