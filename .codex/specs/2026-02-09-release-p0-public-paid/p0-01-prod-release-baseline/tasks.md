# 执行任务清单（Tasks）

| id | description | owner | status (todo/doing/done) | link (PR/commit) |
|---|---|---|---|---|
| T-001 | 重写 P0-01 spec.md 与 plan.md 并补齐接口契约 | codex | done |  |
| T-002 | 重写 acceptance.md，加入 Action 与数据表核对矩阵 | codex | done |  |
| T-003 | 文档审阅与范围确认（用户确认前禁止开发） | user | done |  |
| T-004 | 第一轮开发实现（原门禁项） | codex | done |  |
| T-005 | 本地验证（Action + SQL 快照） | codex | done | 2026-02-10 本地证据见 acceptance.md |
| T-006 | 预发复测与收尾（原范围） | codex | doing | 已完成：负路径矩阵、CRON_SECRET、正向支付回跳、`checkout.session.completed` + `invoice.payment_succeeded` 双事件落库、0金额发票防误结算修复（commit `93410b6`）。剩余：推荐结算样本 + 回滚演练证据。新增开发项并入 T-007~T-016。 |
| T-007 | 文档归位确认（P0-01 作为唯一实现源） | codex | todo |  |
| T-008 | 数据模型变更方案定稿（users/referrals/voucher/webhook 审计） | codex | todo |  |
| T-009 | 注册默认 Starter 与注册页 referral 入口迁移方案定稿 | codex | todo |  |
| T-010 | Pricing -> Checkout Config 路由与交互改造方案定稿 | codex | todo |  |
| T-011 | Stripe trial/cancel/webhook 事件扩展方案定稿 | codex | todo |  |
| T-012 | Referral 绑定与首扣结算服务化方案定稿 | codex | todo |  |
| T-013 | Voucher 后台配置与前台应用方案定稿 | codex | todo |  |
| T-014 | Dashboard/Sidebar tier 与 Upgrade 入口统一改造方案定稿 | codex | todo |  |
| T-015 | Settings 订阅管理页（trial 倒计时 + cancel plan）方案定稿 | codex | todo |  |
| T-016 | 本地与预发验收回填 + 回滚演练证据收敛 | codex | todo |  |

## 备注
- 本轮仅进行文档归位与口径冻结，不进行代码开发。
- `p0-09` 仅保留历史参考，实施口径统一以 `p0-01` 为准。
