# 执行任务清单（Tasks）

| id | description | owner | status (todo/doing/done) | link (PR/commit) |
|---|---|---|---|---|
| T-001 | 新建 P0-03 数据库梳理与 Schema 收敛 的 spec.md 与 plan.md | codex | done |  |
| T-002 | 新建 acceptance.md，加入字段逻辑映射与数据核对矩阵 | codex | done |  |
| T-003 | 文档审阅与范围确认（用户确认前禁止开发） | user | done |  |
| T-004 | Auth/Public Users 同步审计 + 差异修复策略定义（定义阶段，原审计/策略内容并入） | codex | done | spec.md + plan.md + acceptance.md + task-kickoff-checklist.md |
| T-005 | 执行 auth.users 与 public.users 实际对齐（止血 -> 分类 -> 处置 -> 本地验证 -> 预发复测 -> 收尾） | codex | done | acceptance.md + plan.md（T-005 执行记录） |
| T-006 | public.users/auth.users 字段逻辑审计与冗余分级（文档） | codex | done | spec.md + plan.md + acceptance.md + task-kickoff-checklist.md |
| T-007 | 字段链路补齐与冗余字段调整方案定义（仅计划，不开发） | codex | done | spec.md + plan.md + acceptance.md + task-kickoff-checklist.md |
| T-008 | 字段链路补齐与冗余字段治理实施（开发执行） | codex | todo |  |

## 备注
- 当前阶段以文档与验证设计为主，未进入破坏性删除操作。
- 在用户确认前，不执行任何删除字段/删表/迁移落库操作。
- 后续新增任务命名规范：`对象 + 动作 + 范围 + 验收产物`。
- 任务归属口径：`T-006` 负责“字段逻辑审计与冗余分级”；`T-007` 负责“具体调整方案定义”；实际开发改动统一归入 `T-008`。
