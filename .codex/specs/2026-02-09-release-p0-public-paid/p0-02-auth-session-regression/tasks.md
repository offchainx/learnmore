# 执行任务清单（Tasks）

| id | acceptance_ref | description | owner | status (todo/doing/done) | link (PR/commit) |
|---|---|---|---|---|---|
| T-001 | DOC | 重写 P0-02 的 spec.md 与 plan.md，并补齐接口契约 | codex | done |  |
| T-002 | DOC | 重写 acceptance.md，加入 Action 与数据表核对矩阵 | codex | done |  |
| T-003 | DOC | 新增 user/voucher 表格与字段逻辑核对工作项，并同步四件套文档 | codex | done |  |
| T-004 | GATE | 文档审阅与范围确认（用户确认前禁止开发） | user | done |  |
| T-005 | AC-01 | 实现登录/登出/刷新/跨标签会话一致性与受保护路由行为 | codex | done |  |
| T-006 | AC-01 | 本地验证 AC-01（Action 输入输出 + SQL 快照） | codex | todo |  |
| T-007 | AC-01 | 预发复测 AC-01（幂等/越权/跨标签一致性） | codex | todo |  |
| T-008 | AC-02 | 实现管理员伪装状态接口一致性（impersonate status <-> impersonation_sessions） | codex | todo |  |
| T-009 | AC-02 | 本地验证 AC-02（status 接口返回与表状态对齐） | codex | todo |  |
| T-010 | AC-02 | 预发复测 AC-02（过期/结束会话/无 token 场景） | codex | todo |  |
| T-011 | AC-03 | 梳理 user/voucher 字段映射矩阵（Prisma 字段 <-> DB 列名 <-> 业务规则） | codex | todo |  |
| T-012 | AC-03 | 本地核对 AC-03（voucher 可用性与核销幂等 SQL 证据） | codex | todo |  |
| T-013 | AC-03 | 预发复测与收尾（回滚演练 + 发布检查） | codex | todo |  |

## 备注
- 执行顺序固定：`GATE -> AC-01 -> AC-02 -> AC-03`。
- 每个验收点都按 `实现 -> 本地验证 -> 预发复测` 闭环执行。
