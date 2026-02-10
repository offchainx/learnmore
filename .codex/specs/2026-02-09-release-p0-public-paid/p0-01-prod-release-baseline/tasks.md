# 执行任务清单（Tasks）

| id | description | owner | status (todo/doing/done) | link (PR/commit) |
|---|---|---|---|---|
| T-001 | 重写 P0-01 生产环境与发布基线 的 spec.md 与 plan.md 并补齐接口契约 | codex | done |  |
| T-002 | 重写 acceptance.md，加入 Action 与数据表核对矩阵 | codex | done |  |
| T-003 | 文档审阅与范围确认（用户确认前禁止开发） | user | done |  |
| T-004 | 开发实现（门禁项，等待用户批准） | codex | done |  |
| T-005 | 本地验证（Action + SQL 快照） | codex | done | 2026-02-10 本地证据见 acceptance.md |
| T-006 | 预发复测与收尾 | codex | doing | 2026-02-10 已通过 Vercel bypass cookie 访问预发（/pricing 200、webhook 负路径 400）。但 `createCheckoutSession` 的 Server Action 在预发调用返回 500（digest），且预发 webhook 返回仍为 Stripe 默认错误串（非 JSON），疑似预发部署版本未包含本地修复；需触发重新部署并复测后才能结项。 |

## 备注
- 用户已确认“通过 + 批准”，当前进入开发实施阶段。
