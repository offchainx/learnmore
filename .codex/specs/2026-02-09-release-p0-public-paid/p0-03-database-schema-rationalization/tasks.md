# 执行任务清单（Tasks）

| id | description | owner | status (todo/doing/done) | link (PR/commit) |
|---|---|---|---|---|
| T-001 | 新建 P0-03 数据库梳理与 Schema 收敛 的 spec.md 与 plan.md | codex | done |  |
| T-002 | 新建 acceptance.md，加入字段逻辑映射与数据核对矩阵 | codex | done |  |
| T-003 | 文档审阅与范围确认（用户确认前禁止开发） | user | doing |  |
| T-004 | 字段-逻辑映射落地（覆盖关键读写链路） | codex | todo |  |
| T-005 | 冗余项收敛方案与回滚脚本草案 | codex | todo |  |
| T-006 | 本地验证（smoke case + SQL 快照） | codex | todo |  |
| T-007 | 预发复测与收尾 | codex | todo |  |
| T-008 | 完成 auth/public users 同步审计并回填证据（统计+脱敏） | codex | done |  |
| T-009 | 输出差异修复策略（仅计划，不执行删除/迁移） | codex | todo |  |

## 备注
- 当前阶段以文档与验证设计为主，未进入破坏性删除操作。
- 在用户确认前，不执行任何删除字段/删表/迁移落库操作。
