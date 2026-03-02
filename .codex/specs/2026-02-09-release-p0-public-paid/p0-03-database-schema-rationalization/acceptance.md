# 验收标准（Acceptance）

## 功能验收（Given / When / Then）
- 给定：数据库字段梳理完成
  当：审查字段-逻辑映射表
  则：每个字段都能对应到明确的读写逻辑或被标注下线。
- 给定：冗余项清理方案完成
  当：执行最小冒烟用例
  则：关键链路可正常运行且无新增异常写入。
- 给定：删除候选项已执行分级
  当：进行回滚演练
  则：可在可控窗口恢复到清理前状态。

## 字段逻辑映射验收矩阵（本地 + 预发都要执行）
| 表名 | 字段 | 类型/约束 | 业务语义 | 读取入口 | 写入入口 | 状态（保留/删除） | 证据 |
|---|---|---|---|---|---|---|---|
| users | subscription_tier | enum + not null | 用户订阅等级 | getDashboardStats | webhook/stripe |  |  |
| daily_tasks | progress | int + default 0 | 每日任务进度 | Dashboard 数据聚合 | trackDailyProgress |  |  |
| referrals | reward_granted | boolean | 推荐奖励是否发放 | referral 查询 | webhook/referral 结算 |  |  |
| notifications | link | string | 通知幂等追踪链接 | 通知中心列表 | 系统通知创建 |  |  |
| leaderboard_entries | score | numeric | 榜单积分 | getLeaderboard | 排行榜更新任务 |  |  |

## Server Action 验证矩阵（本地 + 预发都要执行）
| Action 名称 | 调用入口（页面/按钮/事件） | 输入样例（正常/异常） | 权限校验（未登录/越权） | 预期输出（成功/失败） | 幂等要求 | 日志与错误码 | 结果（pass/fail） | 证据 |
|---|---|---|---|---|---|---|---|---|
| getDashboardStats | Dashboard 页面加载 | 正常：已登录；异常：未登录 | 未登录返回 null | 页面可渲染或展示空态 | 查询幂等 | dashboard action 日志 |  |  |
| trackDailyProgress | 学习/练习提交完成事件 | 正常：delta=1；异常：非法 taskType | 未登录拒绝 | 成功更新或结构化错误 | 重放不重复累计 | progress action 日志 |  |  |
| createCheckoutSession | Pricing 发起支付 | 正常：standard/monthly；异常：非法 planKey | 未登录拒绝 | `{ ok: true/false }` | 相同请求短窗防重 | billing action 日志 |  |  |
| POST /api/webhook/stripe | Stripe webhook | 正常签名；异常签名 | 非法签名拒绝 | 200/400/500 明确返回 | event.id 仅处理一次 | webhook 日志 + eventId |  |  |

## 数据表核对矩阵（逐项）
| 场景 | 相关表 | 关键字段 | 执行前快照（SQL + 摘要） | 执行后快照（SQL + 摘要） | 差异判断 | 回滚验证 | 结果/证据 |
|---|---|---|---|---|---|---|---|
| 字段引用核对 | information_schema + prisma 模型 | column_name, data_type | 导出字段清单 SQL | 对照映射完成后复核 SQL | 无遗漏字段 | 不适用 |  |
| 任务进度链路 | daily_tasks | progress, is_claimed | SELECT * FROM daily_tasks WHERE user_id={{userId}}; | 执行任务后重复查询 | 仅预期字段变化 | 可恢复前值 |  |
| 支付订阅链路 | users, referrals, notifications | subscription_tier, reward_granted, link | 支付前快照 SQL | webhook 后重复查询 | 幂等重放不重复变更 | 回滚脚本可恢复 |  |
| 榜单读取链路 | leaderboard_entries | period, score | SELECT period, score FROM leaderboard_entries LIMIT 20; | 周期切换后重复查询 | 仅读取不引入写入 | 不适用 |  |

## 发布检查
- [ ] 字段-逻辑映射表完整并附证据
- [ ] 本地验证完成并附 SQL 快照
- [ ] 预发复测完成并附证据
- [ ] 幂等与越权场景通过
- [ ] 删除项具备回滚验证
- [ ] 已获得用户批准进入开发
