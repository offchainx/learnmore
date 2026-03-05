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
| T-008 | 字段链路补齐与冗余字段治理实施（开发执行） | codex | done | src/actions/user/auth.ts + src/components/business/auth/register-form.tsx + src/actions/user/study-metrics.ts + src/actions/courses/progress.ts + src/actions/practice/quiz.ts + src/actions/practice/exam.ts + supabase/migrations/006_sync_auth_signin_fields.sql |
| T-009 | 前端用户域去 Mock 并接入 auth.users/public.users（开发执行） | codex | done | prisma/schema.prisma + supabase/migrations/007_add_school_to_users.sql + src/actions/admin/user-ops.ts + src/actions/admin/permission-override.ts + src/actions/admin/user-details.ts + src/components/admin/users/UserTable.tsx + src/components/admin/users/tabs/SubscriptionTab.tsx + src/components/admin/permissions/* |
| T-010 | Admin 首页（/admin）KPI/工单/风险等非用户双表 mock 数据替换 | codex | done | src/actions/admin/dashboard-overview.ts + src/app/(dashboard)/admin/page.tsx + src/components/admin/dashboard/v2/AdminDashboardV2.tsx |
| T-011 | 数据库表格重点梳理（全表字段功能/逻辑/冗余评估与收敛建议） | codex | done | spec.md + plan.md + acceptance.md + task-kickoff-checklist.md |
| T-012 | public schema RLS 安全加固（修复 Advisor 44 issues） | codex | done | supabase/migrations/009_enable_rls_for_public_tables.sql + DB SQL 验证（public 表 RLS disabled=0） |
| T-013 | 数据库表收敛执行（候选下线验证 + 迁移脚本 + 回滚演练） | codex | todo |  |

## 备注
- 当前阶段以文档与验证设计为主，未进入破坏性删除操作。
- 在用户确认前，不执行任何删除字段/删表/迁移落库操作。
- 后续新增任务命名规范：`对象 + 动作 + 范围 + 验收产物`。
- 任务归属口径：
  - `T-006` 负责“字段逻辑审计与冗余分级”。
  - `T-007` 负责“具体调整方案定义”。
  - `T-008` 负责“字段链路补齐与冗余治理开发”。
  - `T-009` 负责“前端用户域去 mock 与双表真实数据接入”。
  - `T-010` 负责“Admin 首页非用户双表 mock 去除与真实聚合接入”。
  - `T-011` 负责“数据库表格重点梳理与下一轮收敛清单输出”。
  - `T-012` 负责“public schema RLS 安全加固与 Advisor 安全项收口”。
  - `T-013` 负责“数据库表收敛落地（仅在用户确认后执行）”。
