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
| auth.users <-> public.users | id, email, created_at | UUID + email + 时间戳 | 认证主表与业务用户表身份对齐 | 对账 SQL | signupAction + Auth Trigger + syncCurrentUserToDatabase |  |  |
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
| 字段级逻辑覆盖率核对（auth/public users） | auth.users, public.users | 全字段（35/31，T-009 后） | 字段清单 + 必填/默认值快照 | 字段分级（A/B/C）与生成入口映射 | 100% 字段有“生成来源说明”或“托管说明” | 不适用 | 待补 T-006/T-009 证据 |
| 认证用户同步链路 | auth.users, public.users | id, email, created_at | 双表计数与差异 SQL 快照 | 新注册/修复后复测同组 SQL | 主链路注册后在可接受延迟内可对齐；无新增同邮箱异 UUID；非业务脚本差异有豁免标记 | 纳入 T-005 执行验收 | pass（2026-03-03 staging 复测：五项计数均对齐，差异分类全 0） |
| 任务进度链路 | daily_tasks | progress, is_claimed | SELECT * FROM daily_tasks WHERE user_id={{userId}}; | 执行任务后重复查询 | 仅预期字段变化 | 可恢复前值 |  |
| 支付订阅链路 | users, referrals, notifications | subscription_tier, reward_granted, link | 支付前快照 SQL | webhook 后重复查询 | 幂等重放不重复变更 | 回滚脚本可恢复 |  |
| 榜单读取链路 | leaderboard_entries | period, score | SELECT period, score FROM leaderboard_entries LIMIT 20; | 周期切换后重复查询 | 仅读取不引入写入 | 不适用 |  |

## 证据字段模板（同步审计专用）
- 检查时间：`YYYY-MM-DD HH:mm:ss`（含时区）
- 检查环境：`local` / `staging` / `production`
- 计数快照：
  - `auth_users_count`
  - `public_users_count`
  - `missing_in_public`
  - `missing_in_auth`
- 差异分类统计：
  - `smoke脚本`
  - `seed脚本`
  - `历史触发器失效窗口`
- 备注：仅记录脱敏统计，不记录具体邮箱与 UUID。

## T-004 定义完成验收（文档层）
1. 审计口径完整（计数、时间窗口、分类口径、脱敏规则）。
2. SQL 套件完整（总量、双向缺失、同邮箱异 UUID）。
3. 分类口径完整（smoke/seed/历史触发器失效窗口）。

## T-006 验收标准（文档层）
1. `auth.users` 与 `public.users` 字段清单完整，字段总量与交集关系可复核（35/30/交集6）。
2. 双表字段 100% 具备“生成来源说明”或“平台托管说明”。
3. `public.users` 每个字段完成保守分级（A 保留-逻辑完整 / B 保留-观察 / C 保留-待补链路）。
4. 明确输出“本轮无删除动作、无 schema/data 变更”。

## T-007 验收标准（文档层）
1. C 类字段已逐项给出“写入入口、幂等策略、风险控制”定义：
   - `last_sign_in_at`
   - `sign_in_count`
   - `total_study_time`
2. B 类弱覆盖字段已给出“保留/观察/进入删除评审的门槛”：
   - `utm_source` / `utm_medium` / `utm_campaign`
3. 明确“字段逻辑审计与冗余分级归属 T-006；具体调整方案归属 T-007；实际开发归属 T-008”。
4. 本轮仍不执行 schema/data 变更。

## T-007 字段方案证据模板（专用）
- 字段名：
- 字段分级：`A/B/C`
- 当前问题：
- 目标口径（source of truth）：
- 写入入口（计划）：
- 幂等策略（计划）：
- 风险与保护：
- 实施归属任务：`T-008`

## T-006 字段审计证据模板（专用）
- 字段名：
- 所属表：`auth.users` / `public.users`
- 是否必填：
- 默认值：
- 生成入口：`trigger` / `server action` / `webhook` / `script` / `托管字段`
- 当前数据覆盖率：`non_null / total`
- 结论分级：`A` / `B` / `C`
- 后续动作：`保留` / `观察` / `补齐链路（T-007）`

## T-005 执行验收标准
1. 同步审计报告包含：检查时间、环境、四项计数、分类统计（脱敏）。
2. 执行后，`missing_in_public` 不再出现新增。
3. 同邮箱异 UUID 新增量为 0（或新增均有豁免说明）。
4. 所有保留差异都有豁免台账（来源、时间窗口、数量、状态、复核人）。

## T-008 执行验收标准（开发）
1. `last_sign_in_at/sign_in_count/total_study_time` 在目标事件后可稳定写入且幂等。
2. `utm_*` 采集链路可在注册路径产生有效值（无值时不污染旧值）。
3. 复跑双表对账 SQL 无新增 `missing_in_public/missing_in_auth/email_id_mismatch`。
4. 任一字段治理变更均具备本地 + 预发证据与回滚方案。

## T-009 执行验收标准（开发）
1. `/admin/users` 列表不再依赖 `fetchMockUsers`，分页/筛选/排序全部走 `listAdminUsers`。
2. 快速封禁/解封走真实 `toggleUserStatus`，操作后列表可刷新并呈现真实状态。
3. 权限调控链路无 `usr_` mock 分支，`searchUsersForOverride/applyAdminOverride/getOverrideHistory` 全部真实数据。
4. 用户详情内相关 mock 已替换：
   - Permission Overrides 走真实历史；
   - heatmap 为真实聚合；
   - rewardSummary 非写死 mock；
   - 支付流水在无真实数据源时显示空态而非 mock。
5. 新字段 `public.users.school` 已在 schema 与 migration 文件层落地，空值展示“未设置”。
6. 编译级验证通过：`prisma generate`、`tsc --noEmit`。

## T-008 执行记录（2026-03-04）
- 代码落地：
  1. 新增 `auth -> public` 登录镜像 migration：`006_sync_auth_signin_fields.sql`。
  2. 注册链路新增 UTM 隐藏字段与 metadata 入库。
  3. `getCurrentUser/syncCurrentUserToDatabase` 增加 `last_sign_in_at/sign_in_count/utm_*` 兜底同步。
  4. 新增 `incrementTotalStudyTime` 统一累计入口，接入 `quiz/exam/progress`。
- 本地测试：
  - 命令：
    `pnpm vitest run src/actions/__tests__/progress.test.ts src/actions/__tests__/quiz.test.ts src/actions/practice/__tests__/session.integration.test.ts`
  - 结果：`3 files passed, 12 tests passed`。
- 备注：
  - 本轮为开发实现与本地验证；预发 SQL 复跑将作为后续发布前复核项。

## T-009 执行记录（2026-03-04）
- 代码落地：
  1. Schema：新增 `public.users.school`（`prisma/schema.prisma` + `supabase/migrations/007_add_school_to_users.sql`）。
  2. 列表：`UserTable` 改接真实 `listAdminUsers`，去除 mock 数据源。
  3. 行操作：快速封禁/解封改接真实 action；邀请入口改禁用态（待邮件服务接入）。
  4. 权限：移除 `usr_` mock 分支，权限链路返回值改为强类型可序列化结构。
  5. 详情：`SubscriptionTab` 改接真实覆写历史；支付流水改空态；`ActivityTab` heatmap 改真实聚合；`GrowthTab` 奖励摘要改真实统计衍生文案。
  6. 清理：删除未被路由使用且仍引用 mock 的遗留详情组件，避免误用。
- 本地验证：
  - 命令：
    - `pnpm prisma generate`
    - `pnpm exec tsc --noEmit --incremental false`
  - 结果：均通过。
- 环境说明：
  - 本轮未执行数据库落库，仅提交 migration 文件。

## T-010 执行验收标准（开发）
1. `/admin` 首页 KPI/工单/风险/审计动作不再读取 mock 常量，全部来自服务端真实聚合。
2. KPI 第二张卡标题为“付费用户”，且指标值可由数据库口径复算。
3. 页面刷新与窗口切换为真实刷新链路，不存在伪刷新成功状态。
4. 不影响 `T-009` 已交付的用户域链路（用户列表、权限调控、用户详情）。

## T-010 执行记录（2026-03-05）
- 代码落地：
  1. 新增 `src/actions/admin/dashboard-overview.ts` 作为首页真实聚合入口。
  2. `src/app/(dashboard)/admin/page.tsx` 改为服务端读取 `getAdminDashboardOverview`。
  3. `src/components/admin/dashboard/v2/AdminDashboardV2.tsx` 改为真实刷新与 window 切换。
  4. KPI 卡片“营收”已改名为“付费用户”。
- 本地验证：
  - 命令：`pnpm exec tsc --noEmit --incremental false`
  - 结果：通过。
- 范围说明：
  - 本轮不新增数据库字段，不执行 schema/data 变更。

## T-011 执行验收标准（文档）
1. 全量业务表（Prisma 映射表）100% 有“功能语义 + 读写入口 + 分级结论”。
2. 表级分级必须可复核：A（核心保留）/ B（保留观察）/ C（收敛候选）。
3. C 类候选必须给出明确名单与后续门禁，不允许直接判定删除。
4. 本轮不执行任何 schema/data 变更。

## T-011 执行记录（2026-03-05）
- 审计基线：
  1. Prisma 业务表共 41 张（含 `public.users`，不含 Supabase 托管 `auth.users` 字段改造）。
  2. 分级结果：A=22，B=13，C=6。
- 运行时引用证据（`prisma.*`）：
  1. 高活跃表：`users(50)`、`questions(44)`、`user_attempts(29)`、`error_book(20)`、`source_files(19)`。
  2. C 类候选（0 调用）：`chapter_prerequisites`、`contact_submissions`、`knowledge_points`、`question_kp_relations`、`question_tags`、`question_tag_relations`。
- 结论：
  - T-011 仅完成“梳理与分级”，不执行下线；
  - 候选下线动作归入 `T-015`。
  - 逐表明细矩阵（41 表）已写入 `plan.md` 的 `T-011 逐表明细（字段数 + 读写热度 + 入口）` 章节。

## T-012 执行验收标准（开发）
1. 新增 migration 后，可对 `public` schema 业务表统一开启 RLS。
2. 不新增匿名宽权限策略（保持最小权限基线）。
3. 迁移执行后，Advisor 的 “RLS Disabled in Public” 数量显著下降（目标清零）。

## T-012 执行记录（2026-03-05）
- 代码落地：
  1. 新增 `supabase/migrations/009_enable_rls_for_public_tables.sql`。
  2. 采用 `DO $$ ... pg_tables ... ALTER TABLE ... ENABLE ROW LEVEL SECURITY $$` 批量开启。
- 范围说明：
  - 本轮先完成 RLS 启用，不在同迁移里放开业务 POLICY。
- 待验证：
  - 已在当前环境执行迁移并复核：
    - `total_public_tables = 43`
    - `rls_enabled_tables = 43`
    - `rls_disabled_tables = 0`

## T-013 验收标准（全表 RLS POLICY）
1. 所有业务表都有明确 policy 结论：已配置 / 不开放（并说明原因）。
2. 核心用户链路表（users/user_settings/user_progress 等）具备最小权限 policy 且回归通过。
3. 不允许出现“为方便调试”而放开的匿名全表读写策略。
4. policy 变更有 migration 与回滚脚本。

## T-013 执行记录（2026-03-05）
- 代码落地：
  1. 新增 `supabase/migrations/010_add_rls_policies_for_public_tables.sql`。
  2. 新增 `public.is_admin()` 并完成 43 张 public 表 policy 补齐。
- SQL 复核：
  - `public_tables = 43`
  - `rls_enabled_tables = 43`
  - `tables_with_policy = 43`
  - `tables_without_policy = 0`
- 说明：
  - 本轮完成“policy 补齐基线”；后续如业务放开范围变化，在 `T-014` 定档中统一调整。

## T-014 验收标准（Supabase 配置定档）
1. Auth/DB/Storage/API/Webhook 关键配置项均有当前值与目标值记录。
2. 上线 checklist 完整并可逐项核对。
3. 安全扫描项（Advisor + SQL）有复查结果与时间戳。
4. 配置变更责任人与回滚方案明确。

## T-014 执行记录（进行中）
- 已完成：
  1. 输出“上线前配置定档清单（v2）”，覆盖 Auth/DB/Storage/API/Webhook/运维。
  2. 回填当前环境快照（RLS/policy/bucket/trigger/function）。
  3. 补充暴露面核验（grant 现状、已启用扩展、`.env` 跟踪状态）。
  4. 补充增量推进（Vercel MCP 连通、Data API 收敛、`.env` 停跟踪、key 轮换复核）。
- 当前快照（2026-03-06 08:44 MYT）：
  - `public_tables = 43`
  - `rls_enabled_tables = 43`
  - `rls_disabled_tables = 0`
  - `tables_with_policy = 43`
  - `tables_without_policy = 0`
  - buckets：`avatars`、`community-posts`、`source-files`、`videos`
  - `storage.objects` policy 数：`12`
  - `auth.users` 触发器：`on_auth_user_created`、`on_auth_user_signin_updated`
  - `SECURITY DEFINER` 函数：`handle_new_user`、`handle_auth_user_signin`、`is_admin`
  - grant 现状：`anon/authenticated` 对 43 张 public 表保留授权，最终访问由 RLS policy 约束
  - 扩展现状：`pg_graphql`、`pg_stat_statements`、`pgcrypto`、`supabase_vault`、`uuid-ossp`
- 已识别风险：
  - `.env` 已停止 Git 跟踪；历史泄露风险仍需通过持续轮换与最小暴露策略治理。
- 待人工确认：
  - 登录/注册/重置密码限流与邮件模板配置、MFA、Stripe Dashboard webhook、备份/监控策略。
  - 密钥轮换与 `.env` 清理闭环（含历史泄露风险处理）。

## T-014 增量证据（2026-03-09）
- Vercel MCP：
  - `list_teams` 成功返回，确认连接正常。
- key 轮换复核：
  - `.env/.env.local` 均为 `sb_publishable` + `sb_secret`。
- Data API 最小化：
  - 执行后复核 `Accept-Profile`：
    - `public => 200`
    - `graphql_public => 406`
  - 迁移文件：`supabase/migrations/011_restrict_postgrest_exposed_schemas.sql`。
- GraphQL 暴露面结论：
  - 当前项目未发现 GraphQL 调用入口，采用“限制暴露”策略。
- `.env` 治理：
  - `git ls-files .env .env.local .env.example` 仅保留 `.env.example`。
- Auth URL 配置（人工核对）：
  - `Site URL = https://learnmorev10.vercel.app`
  - Redirect URLs：
    - `https://learnmorev10.vercel.app/**`
    - `https://learnmorev10-git-main-chainvistas-projects.vercel.app/**`
    - `http://localhost:3000/**`
- Session/JWT 对齐（自动 + 实测）：
  - 应用侧 cookie：`maxAge=3600`（`src/lib/supabase/server.ts` / `src/middleware.ts`）。
  - 平台 token：`password grant expires_in=3600`（临时账号实测，测试账号已删除）。
- MFA 现状：
  - `ADMIN` 账号 `verified factor=0`（待上线前补齐策略）。
- Storage policy 命名与去重：
  - 语义重复组：`0`。
  - 命名统一迁移已生成：`supabase/migrations/012_normalize_storage_object_policy_names.sql`。
  - 受限项：当前数据库连接角色无法执行 `ALTER POLICY`（需 owner 权限）。
- `source-files` 评估：
  - 当前上传链路依赖 `getPublicUrl`，MVP 维持 `public`。

## T-005 执行场景（Given / When / Then）
- 给定：新用户走标准注册链路
  当：注册完成并等待可接受延迟
  则：`auth.users` 与 `public.users` 同 ID 可对齐。
- 给定：`public.users` 缺失但 `auth.users` 存在
  当：触发 `getCurrentUser` 自动兜底或手动同步入口
  则：可补齐业务用户记录且不引入重复身份。
- 给定：执行 smoke/seed 非标准写入
  当：运行差异分类 SQL
  则：差异可归类为脚本来源并纳入豁免台账。

## T-005 执行记录（2026-03-03, 统计+脱敏）
- 执行环境：当前 `.env` 指向 Supabase 数据库（同步核对口径）。
- 执行动作：
  1. 回补 `missing_in_public` 可安全插入记录 11 条（排除同邮箱异 UUID 冲突）。
  2. 补齐缺失 `user_settings` 27 条。
  3. 清理 `smoke_script` 孤立用户 16 条。
  4. 清理 `seed_script` 孤立用户 2 条（bob/charlie）。
  5. 归并同邮箱异 UUID 冲突 1 条（seed 来源 demo 账户），将 `public.users.id` 对齐为 `auth.users.id` 并验证外键级联更新。
- 执行前计数：
  - `auth_users_count = 25`
  - `public_users_count = 32`
  - `missing_in_public = 12`
  - `missing_in_auth = 19`
  - `email_id_mismatch = 1`
- 执行后计数：
  - `auth_users_count = 25`
  - `public_users_count = 25`
  - `missing_in_public = 0`
  - `missing_in_auth = 0`
  - `email_id_mismatch = 0`
- 当前结论：
  - 本轮 `T-005` 对齐目标已达成（当前环境无残余差异）。

## T-005 预发复测记录（2026-03-03, 统计+脱敏）
- 复测环境：`staging`（当前仓库可用连接：`.env/.env.local` 指向同一 Supabase 项目）。
- 检查时间：`2026-03-03 18:06:24`（MYT，UTC+8）。
- 复跑 SQL：总量对比、`auth 缺 public`、`public 缺 auth`、同邮箱异 UUID、差异来源分类 SQL。
- 计数快照：
  - `auth_users_count = 25`
  - `public_users_count = 25`
  - `missing_in_public = 0`
  - `missing_in_auth = 0`
  - `email_id_mismatch = 0`
- 差异分类统计：
  - `smoke脚本 = 0`
  - `seed脚本 = 0`
  - `历史触发器失效窗口 = 0`
  - `unknown = 0`
- 复测结论：
  - 预发复跑通过，无新增/存量差异。

## 发布检查
- [x] T-006 文档审计完成（字段覆盖 + 分级 + 证据模板）
- [x] T-007 方案定义完成（字段补齐 + 冗余治理口径）
- [x] T-008 开发实现完成（链路补齐 + 统一累计）
- [x] T-009 开发实现完成（用户域前端去 mock + 双表真实接入）
- [x] T-010 开发实现完成（Admin 首页非用户双表 mock 去除）
- [x] T-011 文档审计完成（全表分级与收敛候选）
- [x] T-012 RLS 安全加固完成并复跑 SQL 基线
- [x] T-013 全表 RLS POLICY 补齐
- [ ] T-014 Supabase 上线前配置定档
- [ ] T-015 范围确认（数据库表收敛执行）
- [ ] 字段-逻辑映射表完整并附证据
- [x] 本地验证完成并附测试证据
- [x] 预发复测完成并附证据
- [ ] 幂等与越权场景通过
- [ ] 删除项具备回滚验证
- [x] 已获得用户批准进入 T-008 开发
