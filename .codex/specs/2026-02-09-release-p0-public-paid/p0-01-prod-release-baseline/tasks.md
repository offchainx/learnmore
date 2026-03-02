# 执行任务清单（Tasks）

| id | description | owner | status (todo/doing/done) | link (PR/commit) |
|---|---|---|---|---|
| T-001 | 重写 P0-01 spec.md 与 plan.md 并补齐接口契约 | codex | done | 2026-03-02 文档已冻结并与代码实现口径对齐。 |
| T-002 | 重写 acceptance.md，加入 Action 与数据表核对矩阵 | codex | done | 2026-03-02 已回填本地实测证据与 pass/fail。 |
| T-003 | 文档审阅与范围确认（用户确认前禁止开发） | user | done | 2026-03-02 已确认后进入开发。 |
| T-004 | 第一轮开发实现（原门禁项） | codex | done | 2026-03-02 已完成 `prepareCheckout/bindReferral/cancel/webhook/voucher` 实装。 |
| T-005 | 本地验证（Action + SQL 快照） | codex | done | 2026-03-02：`scripts/p0-01-internal-smoke.mjs` 通过（trial/首扣/referral/voucher/幂等）；最新复验 13:27 MYT 仍通过。 |
| T-006 | 预发复测与收尾（原范围） | codex | done | 2026-02-12 + 2026-03-02：webhook 正负路径、CRON_SECRET、回跳、落库证据闭环。 |
| T-007 | 文档归位确认（P0-01 作为唯一实现源） | codex | done | 2026-03-02：`spec.md/plan.md/tasks.md/acceptance.md/task-kickoff-checklist.md` 已同步。 |
| T-008 | 数据模型变更方案定稿（users/referrals/voucher/webhook 审计） | codex | done | 2026-03-02：Prisma 字段与 webhook 处理口径已落地。 |
| T-009 | 注册默认 Starter 与注册页 referral 入口迁移 | codex | done | 2026-03-02：注册实测新用户默认 `STARTER`。 |
| T-010 | Pricing -> Checkout Config 路由与交互改造 | codex | done | 2026-03-02：`/pricing` -> `/checkout/config`，并可跳转 Stripe Checkout。 |
| T-011 | Stripe trial/cancel/webhook 事件扩展 | codex | done | 2026-03-02：`checkout.session.completed`/`invoice.payment_succeeded`/`subscription.updated|deleted` 已验证。 |
| T-012 | Referral 绑定与首扣结算服务化改造 | codex | done | 2026-03-02：绑定落库 `bind_source=UPGRADE`；首扣结算与 DEFERRED->COMPLETED 验证通过。 |
| T-013 | Voucher 后台配置与前台应用 | codex | done | 2026-03-02：新增 `/admin/vouchers` + 首扣 `voucher_redemptions` 落库。 |
| T-014 | Dashboard/Sidebar tier 与 Upgrade 入口统一改造 | codex | done | 2026-03-02：统一在 `dashboard-layout.tsx` 展示 tier 与 Upgrade。 |
| T-015 | Settings 订阅管理页（trial 倒计时 + cancel plan） | codex | done | 2026-03-02：Subscription Tab 展示状态/到期/Upgrade/Cancel；取消链路实测通过。 |
| T-016 | 本地与预发验收回填 + 回滚演练证据收敛 | codex | done | 2026-03-02：本地内测全通过并回填；回滚策略可执行；同日复验通过。 |

## 备注
- 本轮已完成代码实现 + 本地内测，不再是仅文档定稿阶段。
- `p0-09` 仅保留历史参考，实施口径统一以 `p0-01` 为准。
- 仍存在全局历史 lint 债务（非本任务改动范围），不阻塞本任务验收。
