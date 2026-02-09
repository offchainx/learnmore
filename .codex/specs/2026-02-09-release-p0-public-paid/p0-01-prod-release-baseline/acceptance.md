# 验收标准（Acceptance）

## 功能验收（Given / When / Then）
- 给定：生产环境变量已配置
  当：触发支付结账与 webhook
  则：订阅状态正确落库且重复 webhook 不重复写入。
- 给定：回滚预案存在
  当：演练失败路径
  则：可恢复到上一稳定版本。

## Server Action 验证矩阵（本地 + 预发都要执行）
| Action 名称 | 调用入口（页面/按钮/事件） | 输入样例（正常/异常） | 权限校验（未登录/越权） | 预期输出（成功/失败） | 幂等要求 | 日志与错误码 | 结果（pass/fail） | 证据 |
|---|---|---|---|---|---|---|---|---|
| createCheckoutSession | pricing 页面提交 | 正常：standard+monthly；异常：非法 planKey | 未登录应拒绝 | 成功跳 Stripe；失败返回可识别错误 | 同参数重放不产生重复写入 | checkout 错误日志可检索 |  |  |
| POST /api/webhook/stripe | Stripe 推送事件 | 正常：checkout.session.completed；异常：签名无效 | 外部调用，必须验签 | 成功更新订阅；异常返回 400 或忽略 | 同 event.id 只处理一次 | webhook 处理日志可检索 |  |  |

## 数据表核对矩阵（逐项）
| 场景 | 相关表 | 关键字段 | 执行前快照（SQL + 摘要） | 执行后快照（SQL + 摘要） | 差异判断 | 回滚验证 | 结果/证据 |
|---|---|---|---|---|---|---|---|
| 支付成功 | users | subscription_tier、subscription_end | SELECT id, subscription_tier, subscription_end FROM users WHERE id={{userId}}; | 同 SQL 再查并比对 | 订阅字段按套餐更新 | 回滚后恢复原值 |  |
| webhook 幂等重放 | notifications | type、link | SELECT count(*) FROM notifications WHERE link={{stripe_event_link}}; | 重放后再次查询 | 计数保持 1 | 清理测试数据后复测 |  |
| 推荐奖励结算 | referrals, users | status、reward_granted、subscription_end | 查询推荐关系与双方订阅时间 | 支付后再次查询 | 状态改 COMPLETED 且奖励生效 | 回滚后状态可恢复 |  |

## 发布检查
- [ ] 本地验证完成并附证据
- [ ] 预发复测完成并附证据
- [ ] 幂等与越权场景通过
- [ ] 回滚方案可执行
- [ ] 已获得用户批准进入开发
