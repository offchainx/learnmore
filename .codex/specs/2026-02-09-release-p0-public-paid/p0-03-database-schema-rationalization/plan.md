# 技术方案（Plan）

## 概览
- 子任务：P0-03 数据库梳理与 Schema 收敛
- 方案摘要：以“字段有据可依、变更可回滚、链路可验证”为原则，完成数据库基线收敛。
- 执行原则：先文档、后开发；未获用户确认前禁止执行破坏性删除。

## 强制门禁（本任务必须满足）
1. 完成 spec.md、plan.md、tasks.md、acceptance.md 四件套并通过审阅。
2. 完成字段-逻辑映射表：每个字段必须标注读写入口、业务语义、保留/下线决策。
3. 完成数据表核对矩阵：每个关键场景提供 SQL 前后快照。
4. 删除项必须有迁移顺序、回滚策略、双环境验证证据（本地 + 预发）。

## 开发顺序（门禁）
1. `T-003 done` 才允许进入执行阶段。
2. `T-004 done` 作为 `T-005` 输入前提。
3. `T-005` 内按 `止血 -> 分类 -> 处置 -> 验证 -> 收尾` 串行执行。
4. `T-006` 执行字段逻辑与冗余审计（仅文档，不改库）。
5. `T-007` 基于 `T-006` 输出字段链路补齐与冗余字段调整方案（仅计划，不开发）。
6. `T-008` 按已批准方案执行代码/SQL 变更与回归验证。
7. `T-009` 执行前端用户域去 mock 并接入双表真实数据（开发执行）。
8. `T-010` 处理 Admin 首页非用户双表 mock（已完成）。
9. `T-011` 执行数据库表格重点梳理（已完成，文档）。
10. `T-012` 执行 public schema RLS 安全加固（已完成）。
11. `T-013` 执行全表 RLS POLICY 补齐（已完成）。
12. `T-014` 执行 MVP 上线前 Supabase 配置定档（待用户确认）。
13. `T-015` 执行数据库表收敛（待用户确认）。

## Server Action / 接口契约清单
| Action/接口 | 调用入口 | 输入与校验 | 输出与错误 | 幂等/并发策略 | 审计字段 |
|---|---|---|---|---|---|
| getDashboardStats | Dashboard 首屏加载 | 已登录用户 | 成功返回统计结构，失败返回 null | 查询幂等 | userId、action、result |
| trackDailyProgress | 学习/练习完成事件 | taskType、delta 校验 | 成功更新进度，失败结构化错误 | 幂等更新 + 并发保护 | userId、taskType、result |
| createCheckoutSession | Pricing 发起支付 | planKey、billingCycle 白名单校验 | `{ ok, data/error }` 结构化输出 | idempotencyKey 防重 | userId、planKey、result |
| webhook/stripe | Stripe 回调 | 签名校验 + metadata 校验 | 200/400/500 明确返回 | event.id 幂等处理 | eventId、userId、result |

## 数据落表点与核对范围
| 相关表 | 关键字段 | 读/写 | 触发场景 | 核对方式 |
|---|---|---|---|---|
| users | subscription_tier, updated_at | 读/写 | 支付后用户权益刷新 | 前后快照 + 行级对比 |
| auth.users <-> public.users | id, email, created_at | 读/写（跨表同步） | 注册建档与账户修复 | 双表对账 SQL + 差异分类 |
| daily_tasks | type, progress, is_claimed | 读/写 | 任务进度推进与领取 | 事件前后快照 |
| referrals | status, reward_granted, reward_date | 读/写 | 推荐奖励结算 | 幂等重放对比 |
| notifications | type, link, is_read | 读/写 | 系统通知生成/读取 | 重放计数与唯一性核对 |
| leaderboard_entries | period, score, rank | 读 | 榜单渲染 | 页面结果与 SQL 对照 |

## 入库路径说明（auth.users 与 public.users）
1. 注册主路径（标准链路）
   - 入口：`signupAction` 调用 `supabase.auth.signUp`。
   - 写入顺序：`auth.users` 插入 -> 触发器 `on_auth_user_created` -> `public.handle_new_user()` 写入 `public.users`（并初始化 `user_settings`、`daily_tasks`）。
   - 参考：`src/actions/user/auth.ts`、`supabase/migrations/005_fix_auth_trigger.sql`。
2. 应用兜底路径（修复链路）
   - 入口：`getCurrentUser` 发现 `public.users` 缺失时自动补写；`syncCurrentUserToDatabase` 手动 upsert。
   - 作用：覆盖触发器偶发失效或历史遗留缺口。
   - 参考：`src/actions/user/auth.ts`。
3. 脚本直写路径（非标准链路）
   - 入口：测试/种子脚本直接 `prisma.user.create/upsert` 写 `public.users`。
   - 风险：绕过 `auth.users` 主链路，造成双表差异。
   - 参考：`prisma/seed.ts`、`scripts/p0-01-internal-smoke.mjs`。

## 同步核对 SQL 套件（模板）
1. 总量对比 SQL
```sql
SELECT
  (SELECT COUNT(*) FROM auth.users)   AS auth_users_count,
  (SELECT COUNT(*) FROM public.users) AS public_users_count;
```
2. `auth 缺 public` SQL
```sql
SELECT a.id, a.email, a.created_at
FROM auth.users a
LEFT JOIN public.users u ON a.id = u.id
WHERE u.id IS NULL
ORDER BY a.created_at DESC;
```
3. `public 缺 auth` SQL
```sql
SELECT u.id, u.email, u.created_at
FROM public.users u
LEFT JOIN auth.users a ON a.id = u.id
WHERE a.id IS NULL
ORDER BY u.created_at DESC;
```
4. 同邮箱异 UUID SQL
```sql
SELECT a.email, a.id AS auth_id, u.id AS public_id
FROM auth.users a
JOIN public.users u ON lower(a.email) = lower(u.email)
WHERE a.id <> u.id
ORDER BY a.email;
```

## 差异来源分类口径
1. `smoke脚本`：邮箱模式命中 `smoke-referrer-*` / `smoke-referee-*`。
2. `seed脚本`：种子脚本固定账户或批量构造账户导致的 `public.users` 存量。
3. `历史触发器失效窗口`：存在 `auth.users` 记录但未同步到 `public.users` 的历史时段。

## T-005 执行策略（实际对齐）
> 说明：Phase A/B/C/D 全部归属于 `T-005`。

### Phase A：止血（当天完成）
1. 锁定非标准写入入口：`seed/smoke` 默认仅本地/预发执行，生产禁止直写 `public.users`。
2. 核验触发器链路：`on_auth_user_created` 启用状态 + `handle_new_user()` 函数版本一致性。
3. 建立每日只读监控：总量、双向缺失、同邮箱异 UUID。

### Phase B：存量分类（1-2 天）
1. 按 `smoke脚本` / `seed脚本` / `历史触发器失效窗口` / `unknown` 分桶。
2. 每个分桶输出记录数、时间窗口、业务影响评级（高/中/低）。

### Phase C：存量处置（2-3 天）
1. `missing_in_public`：按规则回补 `public.users`（优先既有应用兜底链路或标准脚本）。
2. `missing_in_auth`：
   - 非业务测试数据：豁免台账登记，不纳入生产一致性 KPI。
   - 业务数据：评估补建 auth 账户或迁移归并。
3. 同邮箱异 UUID：建立主身份判定规则，次身份进入冻结/豁免流程。

### Phase D：防回归固化（持续）
1. 发布前清单加入 Auth/Public 一致性检查。
2. 每周输出脱敏统计。
3. 告警阈值：`missing_in_public > 0`（生产）或同邮箱异 UUID 新增 > 0。

## T-005 当前执行进展（2026-03-03）
1. 已完成：
   - 回补 `missing_in_public` 的可安全插入用户：11 条。
   - 补齐缺失 `user_settings`：27 条。
   - 清理 `smoke_script` 孤立用户：16 条。
   - 清理 `seed_script` 孤立用户：2 条（bob/charlie）。
   - 归并同邮箱异 UUID 冲突：1 条（seed 来源 demo 账户，将 `public.users.id` 对齐为 `auth.users.id`，并级联更新引用）。
2. 执行后快照：
   - `auth_users_count = 25`
   - `public_users_count = 25`
   - `missing_in_public = 0`
   - `missing_in_auth = 0`
   - `email_id_mismatch = 0`
3. 状态：
   - `T-005` 执行闭环已完成（当前环境）。

## T-006 审计方法（文档）
1. Schema 元数据审计：
   - 使用 `information_schema.columns` 核对 `auth.users` 与 `public.users` 字段总量、交集、必填/默认值。
2. 写入路径审计：
   - 触发器链路：`on_auth_user_created` + `handle_new_user`。
   - 应用链路：`signupAction`、`getCurrentUser` 兜底、`syncCurrentUserToDatabase`、Stripe webhook、Profile/Settings/Gamification 写入。
   - 脚本链路：`prisma/seed.ts`、`scripts/p0-01-internal-smoke.mjs`。
3. 数据落值审计：
   - 按字段统计 `non_null` / `null_count` / `distinct_count`，识别“稳定写入字段、弱覆盖字段、全空字段”。

## T-006 字段分级规则（保守）
1. A类（必须保留且逻辑完整）：
   - 字段具备稳定写入入口或强约束（必填/默认），且关键业务路径依赖。
2. B类（保留，逻辑存在但当前数据弱）：
   - 存在写入入口或预留入口，但当前覆盖率低/全空，先观察不删。
3. C类（保留，逻辑待补齐）：
   - 已有读取或业务语义，但缺少稳定写入入口或跨表同步缺口明显。

## T-007 方案定义（已完成，仅计划）
### 目标
1. 把 `T-006` 的 C/B 类字段落成“可开发执行”的补齐方案，不在本任务落库。
2. 输出字段级动作、风险、验收点与回滚预案。

### 字段调整定义
1. `last_sign_in_at`：
   - 口径：`auth.users.last_sign_in_at` 为主数据源。
   - 方案：登录成功后镜像更新 `public.users.last_sign_in_at`；补充读时兜底回填。
   - 风险控制：仅当新值更晚才更新，避免时间回退。
2. `sign_in_count`：
   - 口径：按“登录成功事件”累计，按会话幂等去重。
   - 方案：统一写入服务层，禁止多入口直接写字段。
   - 风险控制：重放事件不重复累加。
3. `total_study_time`：
   - 口径：秒级累计，来源仅限学习/练习完成事件。
   - 方案：封装统一累加函数，替代散落写入。
   - 风险控制：负值保护、单次增量上限、幂等键防重。
4. `utm_source/utm_medium/utm_campaign`：
   - 口径：保留并补采集链路，不立即删除。
   - 方案：注册页/中间件采集 -> metadata -> 建档写入 `public.users`。
   - 风险控制：为空时不覆盖已有值，避免 attribution 污染。
5. `stripe_*` 与 `first_paid_at`：
   - 口径：保留，不做删改。
   - 方案：继续由 webhook 单点写入，并加空值监控。

### 冗余字段治理策略（保守）
1. 本轮不删字段。
2. 仅把 `utm_*` 标为观察候选，进入连续两周期观测后再评审是否删除。
3. 删除评审前置：无读路径、无写路径、覆盖率为 0、回滚脚本就绪。

## T-008 实施顺序（已执行）
1. 先补 `last_sign_in_at/sign_in_count/total_study_time` 写入链路。
2. 再补 UTM 采集与写入链路。
3. 增加字段级 smoke case 与对账 SQL 复跑。
4. 通过本地与预发验收后，再进入冗余字段删除评审（若用户批准）。

## T-008 实施记录（2026-03-04）
1. 已落地改动：
   - `auth/users` 登录镜像：新增 `supabase/migrations/006_sync_auth_signin_fields.sql`。
   - 注册 UTM 入库：`src/components/business/auth/register-form.tsx` + `src/actions/user/auth.ts`。
   - `auth -> public` 兜底镜像：`getCurrentUser/syncCurrentUserToDatabase` 同步 `last_sign_in_at/sign_in_count/utm_*`。
   - 学习时长统一累计：`src/actions/user/study-metrics.ts` + 接入 `quiz/exam/progress`。
2. 本地验证：
   - `pnpm vitest run src/actions/__tests__/progress.test.ts src/actions/__tests__/quiz.test.ts src/actions/practice/__tests__/session.integration.test.ts`
   - 结果：`3 files, 12 tests passed`。
3. 执行边界：
   - 本轮未执行字段删除、未执行破坏性迁移。

## T-009 实施顺序（已执行）
1. 新增 `public.users.school` 字段映射（Prisma + Supabase migration 文件）。
2. 新增 `listAdminUsers` Server Action 并替换 `/admin/users` 列表 mock 数据源。
3. 替换列表行操作 mock：快速封禁/解封接真实 action；邀请入口改禁用态（待接入邮件服务）。
4. 删除 `usr_` 开头 mock 用户兼容分支（`getUserDetail`、`applyAdminOverride`）。
5. 清理用户详情页 mock：
   - 覆写历史接真实 `getOverrideHistory`
   - heatmap 改真实聚合
   - rewardSummary 改统计衍生文案
   - 支付流水改真实空态
6. 类型与编译校验：补齐权限页类型，执行 Prisma generate + TypeScript 编译验证。

## T-009 实施记录（2026-03-04）
1. 已落地改动：
   - Schema：`prisma/schema.prisma` 新增 `User.school`，新增 `supabase/migrations/007_add_school_to_users.sql`。
   - Action：
     - `src/actions/admin/user-ops.ts` 新增 `listAdminUsers`。
     - `src/actions/admin/permission-override.ts` 移除 `usr_` mock 分支并补强返回类型。
     - `src/actions/admin/user-details.ts` 用真实聚合替换 heatmap mock。
   - UI：
     - `src/components/admin/users/UserTable.tsx` 改接真实数据与真实高风险操作。
     - `src/components/admin/users/tabs/SubscriptionTab.tsx` 改接真实覆写历史，支付流水空态。
     - `src/components/admin/permissions/*` 去 `any` 强类型化。
2. 已完成验证：
   - `pnpm prisma generate` 通过。
   - `pnpm exec tsc --noEmit --incremental false` 通过。
3. 范围外确认：
   - `/admin` 首页 KPI/工单/风险 mock 未纳入本轮，已归入 `T-010`。

## T-010 实施顺序（已执行）
1. 新增服务端首页聚合 action，统一输出 KPI/工单/风险/审计动作数据。
2. `/admin` 页面改为服务端读取真实聚合结果，移除首页 mock 数据依赖。
3. KPI 卡片口径调整：将“营收”重命名为“付费用户”，按可验证真实数据计算。
4. 前端刷新与窗口切换改为真实刷新链路，移除假刷新行为。

## T-010 实施记录（2026-03-05）
1. 已落地改动：
   - 新增 `src/actions/admin/dashboard-overview.ts`（真实 overview 聚合）。
   - 更新 `src/app/(dashboard)/admin/page.tsx`（服务端真实数据读取）。
   - 更新 `src/components/admin/dashboard/v2/AdminDashboardV2.tsx`（真实刷新与 window 切换）。
2. 已确认口径：
   - KPI 第二张卡标题为“付费用户”。
   - 统计来源为真实库聚合，不再展示伪造营收值。
3. 验证结果：
   - `pnpm exec tsc --noEmit --incremental false` 通过。
4. 后续承接：
   - `T-011` 负责全库表格字段功能/逻辑/冗余梳理，不在 `T-010` 内展开。

## T-011 审计方法（已执行，文档）
1. 表结构盘点：
   - 从 `prisma/schema.prisma` 提取 41 个模型及 `@@map` 实际表名。
2. 运行时引用盘点：
   - 扫描 `src/**` 的 `prisma.<model>.<op>()` 调用，统计读/写热度与入口文件。
   - 补充扫描 Supabase 触发器与 `.from(...)` 直接调用，覆盖非 Prisma 链路。
3. 分级规则：
   - A 类：核心链路活跃读写，必须保留。
   - B 类：低频但有明确业务语义，保留观察。
   - C 类：当前未观测到运行时入口，纳入收敛候选。

## T-011 审计记录（2026-03-05）
1. 审计基线：
   - 业务表总量：41。
   - A 类：22 张；B 类：13 张；C 类：6 张。
2. 热度摘要（按 `prisma.*` 调用次数）：
   - 高活跃：`users(50)`、`questions(44)`、`user_attempts(29)`、`error_book(20)`、`source_files(19)`。
   - 低活跃但有效：`voucher_redemptions(1)`、`user_permission_overrides(2)`、`question_groups(2)`、`subscribers(2)`。
3. C 类候选（0 运行时调用）：
   - `chapter_prerequisites`
   - `contact_submissions`
   - `knowledge_points`
   - `question_kp_relations`
   - `question_tags`
   - `question_tag_relations`
4. 结论：
   - 本轮仅文档审计，不执行 schema/data 变更；
   - 收敛执行统一进入 `T-015`，并要求双环境观测与回滚脚本。

## T-011 逐表明细（字段数 + 读写热度 + 入口）
> 说明：`读/写` 统计口径为 `src/**` 非测试代码中的 Prisma 调用次数（读=`find/count/aggregate`，写=`create/update/upsert/delete`）。

### A 类（核心保留）
| 表名 | 字段数 | 读/写 | Prisma 模型 | 主要入口（样本） |
|---|---:|---:|---|---|
| `users` | 58 | 37/13 | `User` | `src/actions/admin/dashboard-overview.ts`, `src/actions/admin/permission-override.ts` |
| `questions` | 32 | 32/12 | `Question` | `src/actions/content-pipeline/import-service.ts`, `src/actions/content-pipeline/question-service.ts` |
| `user_attempts` | 11 | 28/1 | `UserAttempt` | `src/actions/admin/user-details.ts`, `src/actions/courses/knowledge.ts` |
| `source_files` | 14 | 6/13 | `SourceFile` | `src/actions/content-pipeline/import-service.ts` |
| `error_book` | 8 | 12/8 | `ErrorBook` | `src/actions/admin/user-details.ts`, `src/actions/courses/knowledge.ts` |
| `subjects` | 9 | 12/1 | `Subject` | `src/actions/community/post.ts`, `src/actions/content-pipeline/import-service.ts` |
| `chapters` | 19 | 10/1 | `Chapter` | `src/actions/content-pipeline/question-service.ts`, `src/actions/courses/knowledge.ts` |
| `daily_tasks` | 10 | 7/5 | `DailyTask` | `src/actions/dashboard.ts`, `src/actions/gamification/achievement.ts` |
| `question_reports` | 12 | 8/3 | `QuestionReport` | `src/actions/admin/dashboard-overview.ts`, `src/actions/content-pipeline/question-service.ts` |
| `user_feedbacks` | 15 | 8/3 | `UserFeedback` | `src/actions/admin/dashboard-overview.ts`, `src/actions/support/feedback.ts` |
| `user_progress` | 9 | 8/1 | `UserProgress` | `src/actions/admin/dashboard-overview.ts`, `src/actions/courses/knowledge.ts` |
| `notifications` | 12 | 6/3 | `Notification` | `src/actions/notification/core.ts`, `src/actions/notification/triggers.ts` |
| `notification_preferences` | 12 | 4/2 | `NotificationPreference` | `src/actions/notification/core.ts`, `src/actions/notification/preferences.ts` |
| `security_logs` | 8 | 4/7 | `SecurityLog` | `src/actions/admin/dashboard-overview.ts`, `src/actions/admin/permission-override.ts` |
| `exam_records` | 14 | 4/2 | `ExamRecord` | `src/actions/practice/data-service.ts`, `src/actions/practice/exam.ts` |
| `posts` | 15 | 6/3 | `Post` | `src/actions/community/post.ts`, `src/actions/gamification/achievements.ts` |
| `comments` | 8 | 2/1 | `Comment` | `src/actions/community/post.ts`, `src/actions/gamification/achievements.ts` |
| `post_likes` | 6 | 1/2 | `PostLike` | `src/actions/community/post.ts` |
| `referrals` | 19 | 2/1 | `Referral` | `src/actions/billing/referral.ts`, `src/app/(dashboard)/admin/referrals/page.tsx` |
| `user_settings` | 13 | 2/7 | `UserSettings` | `src/actions/notification/preferences.ts`, `src/actions/user/auth.ts` |
| `user_permission_overrides` | 10 | 1/1 | `UserPermissionOverride` | `src/actions/admin/permission-override.ts` |
| `lessons` | 12 | 5/0 | `Lesson` | `src/actions/courses/progress.ts`, `src/actions/courses/subject.ts` |

### B 类（保留观察）
| 表名 | 字段数 | 读/写 | Prisma 模型 | 主要入口（样本） |
|---|---:|---:|---|---|
| `admin_notes` | 9 | 3/4 | `AdminNote` | `src/actions/admin/user-ops.ts` |
| `impersonation_sessions` | 9 | 3/4 | `ImpersonationSession` | `src/actions/admin/user-details.ts`, `src/actions/admin/user-ops.ts` |
| `voucher_codes` | 13 | 2/2 | `VoucherCode` | `src/actions/admin/voucher.ts`, `src/actions/billing/checkout.ts` |
| `leaderboard_entries` | 8 | 3/2 | `LeaderboardEntry` | `src/app/api/cron/cleanup-leaderboard/route.ts`, `src/lib/leaderboard/pg-adapter.ts` |
| `invite_codes` | 7 | 1/2 | `InviteCode` | `src/actions/user/parent.ts` |
| `badges` | 8 | 2/1 | `Badge` | `src/actions/gamification/achievements.ts` |
| `parent_students` | 6 | 2/1 | `ParentStudent` | `src/actions/user/parent.ts` |
| `subscribers` | 3 | 1/1 | `Subscriber` | `src/actions/marketing/campaign.ts` |
| `blog_posts` | 13 | 3/0 | `BlogPost` | `src/actions/community/blog.ts`, `src/app/sitemap.ts` |
| `question_groups` | 19 | 2/0 | `QuestionGroup` | `src/actions/practice/past-papers.ts`, `src/app/(dashboard)/dashboard/practice/past-paper/[groupId]/page.tsx` |
| `user_badges` | 6 | 2/0 | `UserBadge` | `src/actions/gamification/achievements.ts` |
| `voucher_redemptions` | 8 | 1/0 | `VoucherRedemption` | `src/actions/billing/checkout.ts` |
| `content_review_logs` | 11 | 0/3 | `ContentReviewLog` | `src/actions/content-pipeline/question-service.ts` |

### C 类（收敛候选）
| 表名 | 字段数 | 读/写 | Prisma 模型 | 当前入口 |
|---|---:|---:|---|---|
| `chapter_prerequisites` | 5 | 0/0 | `ChapterPrerequisite` | `-` |
| `contact_submissions` | 7 | 0/0 | `ContactSubmission` | `-` |
| `knowledge_points` | 11 | 0/0 | `KnowledgePoint` | `-` |
| `question_kp_relations` | 5 | 0/0 | `KnowledgePointRelation` | `-` |
| `question_tags` | 9 | 0/0 | `QuestionTag` | `-` |
| `question_tag_relations` | 5 | 0/0 | `QuestionTagRelation` | `-` |

## T-012 执行策略（RLS 修复）
1. 对 `public` schema 业务表统一开启 RLS，先解决 Advisor 的“未开启 RLS”问题。
2. 暂不在同一迁移里放开匿名/认证角色策略，避免误开放数据。
3. 逐步补策略原则：
   - 必要公开读：最小白名单列与场景；
   - 用户私有数据：`auth.uid() = user_id`；
   - 管理域：仅后端服务角色/Prisma 访问，不对 anon 直出。

## T-012 执行记录（2026-03-05）
1. 已新增迁移：
   - `supabase/migrations/009_enable_rls_for_public_tables.sql`
2. 迁移行为：
   - 通过 `pg_tables` 枚举 `public` schema 全部表，并执行 `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`。
3. 现状说明：
   - 已通过 `prisma db execute` 执行迁移到当前数据库，并完成 SQL 复核。
4. SQL 复核结果（当前环境）：
   - `total_public_tables = 43`
   - `rls_enabled_tables = 43`
   - `rls_disabled_tables = 0`

## T-013 执行策略（全表 RLS POLICY 补齐）
1. 逐表确定访问模型：
   - 公开只读表：仅 `SELECT` 且限定字段暴露策略；
   - 用户私有表：`auth.uid() = user_id`；
   - 管理域表：默认不开放给 `anon/authenticated`，由后端高权限通道处理。
2. policy 设计顺序：
   - 先补 `SELECT`，再补 `INSERT/UPDATE/DELETE`；
   - 每补一类 policy 即回归相应页面/Action。
3. 产出要求：
   - `policy_matrix.md`（表 -> 操作 -> 角色 -> 条件）；
   - migration SQL；
   - 冒烟回归证据与异常清单。

## T-013 执行记录（2026-03-05）
1. 已新增迁移：
   - `supabase/migrations/010_add_rls_policies_for_public_tables.sql`
2. 已落地规则：
   - `public.is_admin()`：用于 admin 域表访问控制。
   - 43 张 public 表已补 policy，覆盖自有数据、内容只读、管理域三类模型。
3. SQL 复核结果（当前环境）：
   - `public_tables = 43`
   - `rls_enabled_tables = 43`
   - `tables_with_policy = 43`
   - `tables_without_policy = 0`

## T-014 执行策略（MVP 上线前 Supabase 配置定档）
1. 配置域：
   - Auth（Provider、Session、Redirect、Email/SMS 模板）
   - Database（RLS/POLICY、extensions、连接池、备份）
   - Storage（bucket 可见性、policy）
   - API/Keys（anon/service key 使用边界）
   - Integrations（Webhook、第三方密钥）
2. 定档产物：
   - 配置快照（当前值、目标值、责任人、生效时间）；
   - 上线核对 checklist（可逐项打勾）；
   - 风险豁免与应急回滚说明。
3. 验收方式：
   - 逐项核对 + 关键链路实测 + 安全项复扫（Advisor + 手工 SQL）。

## T-014 上线前配置定档清单（v2）
> 标记说明：`[x]` 已从仓库/数据库核验，`[ ]` 需 Supabase/Stripe 控制台人工确认。

### A. 安全基线
- [x] public schema 表 `43/43` 已启用 RLS（`rls_disabled_tables=0`）。
- [x] public schema 表 `43/43` 已有 policy（`tables_without_policy=0`）。
- [x] 已确认 `anon/authenticated` 保留 43 表 grant，实际访问由 RLS policy 控制。
- [x] 已生成 policy 签字材料（43 表 policy 矩阵 + 角色/操作汇总）。
- [x] 完成 policy 业务签字（逐表确认放开范围与产品预期一致，2026-03-09 复核通过）。
- [x] Data API exposed schema 已最小化：仅保留 `public`（原 `graphql_public` 已移出）。
- [x] GraphQL 暴露面结论：采用“限制”方案（保留扩展，停止通过 PostgREST 暴露 `graphql_public`）。

### B. 密钥与仓库治理
- [x] 环境变量已配置：`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`、`SUPABASE_SERVICE_ROLE_KEY`。
- [x] 已确认 `.env` 当前仍被 Git 跟踪（`git ls-files .env` 命中），需上线前治理。
- [x] 已完成 anon/service role key 轮换（应用本地与部署环境已切换新 key）。
- [x] 已停止跟踪 `.env`（保留 `.env.example`）；历史泄露风险持续按轮换机制治理。

### C. Auth 配置
- [x] 应用侧 server/browser client 已统一使用 Supabase URL + anon key。
- [x] Supabase Auth 的 Site URL / Redirect URLs 与生产域名核对（2026-03-09 已更新）。
- [x] Session/JWT TTL 与应用 1h cookie 策略对齐（2026-03-09：`expires_in=3600` + 应用 cookie `maxAge=3600`）。
- [ ] 登录/注册/重置密码限流与邮件模板配置核对（后置：待自有域名与 SMTP 发信域完成后执行）。
- [ ] 管理员账号 MFA 策略确认（后置：待应用提供 TOTP 绑定入口后执行；当前 admin 账号 `verified factor=0`）。

### D. Storage 配置
- [x] buckets 快照：
  - `avatars(public)`
  - `community-posts(public)`
  - `source-files(public, 50MB, MIME 白名单)`
  - `videos(private, 50MB, MIME 白名单)`
- [x] `storage.objects` policy 数量：12。
- [x] storage policy 去重通过；命名统一采用豁免（当前为 legacy 命名，不影响权限语义，owner 限制导致无法 `ALTER POLICY RENAME`）。
- [x] 已完成 `source-files` 可见性评估：当前保持 `public`（MVP），后续如改 private 需同步改造上传/消费链路。

### E. 触发器与函数
- [x] `auth.users` 触发器启用：
  - `on_auth_user_created`
  - `on_auth_user_signin_updated`
- [x] 关键函数存在且为 `SECURITY DEFINER`：
  - `handle_new_user`
  - `handle_auth_user_signin`
  - `is_admin`

### F. 支付与 Webhook
- [x] 代码侧已依赖 `STRIPE_WEBHOOK_SECRET` 并在缺失时失败保护。
- [ ] Stripe Dashboard webhook endpoint、签名密钥、重试策略核对（已完成 test mode 验证；live mode 待全链路收口后执行）。
- [ ] 生产价目（Price IDs）与环境变量映射核对（test mode 已核对变量名与测试价格，live 值待切换）。
- [ ] webhook 失败告警通道（Slack/邮件）确认（按用户决策暂缓）。

### G. 运维与可恢复
- [ ] 数据库 PITR/备份保留策略确认（后置：当前 Free 计划不可用，待升级 Pro）。
- [x] 连接池阈值、慢查询告警阈值确认（2026-03-09：80%/90%；P95>1s 5分钟；单条>3s 立即）。
- [ ] 日志保留周期确认（待补）；日志导出路径已确认“暂不导出”。
- [ ] 发布回滚手册（RLS/policy/storage/webhook）固化。

### H. 上线门禁
- [x] Advisor 安全项复扫归档（2026-03-09 17:27 MYT，Warnings=3）。
- [ ] 关键链路回归：注册/登录/学习/支付/后台管理（按用户决策暂缓）。
- [ ] 值班与应急联系人清单确认（按用户决策暂缓）。

## T-014 自动核验证据（2026-03-06 08:44 MYT）
1. 数据库基线：
   - `public_tables = 43`
   - `rls_enabled_tables = 43`
   - `rls_disabled_tables = 0`
   - `tables_with_policy = 43`
   - `tables_without_policy = 0`
2. Storage 快照：
   - `avatars(public)`
   - `community-posts(public)`
   - `source-files(public, 50MB, MIME 白名单)`
   - `videos(private, 50MB, MIME 白名单)`
   - `storage.objects` policy 数：`12`
3. Auth 同步链路基线：
   - 触发器：`on_auth_user_created`、`on_auth_user_signin_updated`
   - `SECURITY DEFINER` 函数：`handle_new_user`、`handle_auth_user_signin`、`is_admin`
4. 暴露面观察：
   - `anon/authenticated` 在 43 张 public 表均保留 grant；RLS 为最终访问门禁。
   - 已安装扩展：`pg_graphql`、`pg_stat_statements`、`pgcrypto`、`supabase_vault`、`uuid-ossp`。
5. 结论：
   - 自动可核验项已落档；剩余项需 Supabase/Stripe 控制台人工确认后才可将 `T-014` 标记为 done。

## T-014 增量执行记录（2026-03-09）
1. Vercel MCP 连通：
   - OAuth 已恢复，`list_teams` 返回 `team_YRmXMkKKh18r8oBfTnxZq2TG`。
2. 密钥轮换复核：
   - `.env/.env.local` 均为新 key 形态（`sb_publishable` + `sb_secret`）。
3. Data API 暴露面收敛：
   - 已执行：`ALTER ROLE authenticator SET pgrst.db_schemas = 'public';`
   - 复核：`Accept-Profile: public => 200`；`Accept-Profile: graphql_public => 406`。
   - 落库文件：`supabase/migrations/011_restrict_postgrest_exposed_schemas.sql`。
4. GraphQL 暴露面结论：
   - 代码库未发现 GraphQL 调用入口，当前采用“限制暴露”而非“卸载扩展”。
5. `.env` 仓库治理：
   - 已执行 `.env` 停止跟踪，`git ls-files .env .env.local .env.example` 仅保留 `.env.example`。
6. 仍需人工确认：
  - Supabase Auth `Site URL / Redirect URLs` 已由控制台人工确认：
    - `Site URL = https://learnmorev10.vercel.app`
    - Redirect:
      - `https://learnmorev10.vercel.app/**`
      - `https://learnmorev10-git-main-chainvistas-projects.vercel.app/**`
      - `http://localhost:3000/**`
7. Session/JWT 核验（已完成）：
   - 应用侧：`src/lib/supabase/server.ts` 与 `src/middleware.ts` 均强制 `maxAge=3600`。
   - 平台侧：通过临时账号 `password grant` 实测 `expires_in=3600`，并已清理测试账号。
8. Rate limit / 邮件模板（待人工）：
   - `auth/v1/settings` 仅返回有限字段，无法返回限流与模板细项；需控制台确认。
   - 2026-03-09 决策：该项后置，待域名购买与 SMTP 发信域完成后回补。
9. MFA（待策略落地）：
   - 当前管理员账号统计：`verified factor = 0`，需按上线门禁补齐。
   - 2026-03-09 决策：该项后置，待应用侧提供 TOTP 绑定入口后回补。
10. Storage policy 命名（部分完成）：
   - 已确认 `storage.objects` 无重复语义 policy（`dup_groups=0`）。
   - 命名统一迁移已生成：`supabase/migrations/012_normalize_storage_object_policy_names.sql`。
   - 当前连接角色无 `storage.objects` owner 权限（报错：`must be owner of table objects`），已采用“命名豁免”收口，不影响权限语义。
11. `source-files` 可见性评估（已完成）：
   - 当前业务链路在 `src/actions/storage.ts` 上传后直接调用 `getPublicUrl`。
   - 结论：MVP 阶段保持 `public`；若改 private，需新增 signed URL 获取与消费端改造任务。
12. Stripe（test mode）核对（2026-03-09）：
   - Destination 已配置 4 个目标事件：`checkout.session.completed`、`invoice.payment_succeeded`、`customer.subscription.updated`、`customer.subscription.deleted`。
   - Event deliveries 可见 `200` 与 `DUPLICATE_EVENT` 幂等返回，符合当前 webhook 处理逻辑。
   - 当前 endpoint 使用 preview 域名 + query 参数，生产切换前需统一为正式域名无 query 版本。
13. Price 映射（test mode）核对（2026-03-09）：
   - Stripe Product catalog（test mode）存在 `standard/smartplus/premier` 月/年价格。
   - Vercel 环境变量存在对应 `NEXT_PUBLIC_STRIPE_PRICE_*` 键位（`STANDARD/SMARTPLUS/PREMIER` 月/年）。
   - 生产 live `price_` 值映射待最终切换阶段执行。
14. 运维阈值确认（2026-03-09）：
   - 连接数告警阈值：达到 `max_connections` 的 `80%` 告警，`90%` 紧急告警。
   - 慢查询告警阈值：`P95 > 1s` 持续 5 分钟告警；单条 `> 3s` 立即告警。
   - 当前慢查询 Top 样本以 Supabase Dashboard 元数据查询与系统查询为主，未见明确业务 SQL 热点。
15. 日志策略确认（2026-03-09）：
   - 导出路径结论：`暂不导出`（先使用控制台检索）。
   - 保留周期：待后续按计划/套餐能力补齐正式定档。
16. Advisor 复扫归档（2026-03-09 17:27 MYT）：
   - 总览：`Errors=0`、`Warnings=3`、`Info=0`。
   - 警告项：
     - `RLS Policy Always True` on `public.contact_submissions`
     - `RLS Policy Always True` on `public.subscribers`
     - `Leaked Password Protection Disabled` on `auth`
   - 处理口径：纳入上线风险台账，后续在 Auth/公开写入策略收敛任务中处理。
17. 后置/暂缓项（2026-03-09）：
   - PITR/备份：受 Free 计划限制，待升级 Pro 后执行。
   - 回滚手册负责人、关键链路回归、值班与应急联系人：按用户决策暂缓，后续统一补齐。

## T-014 下一批执行指引（2026-03-09，手工）
1. 数据库 PITR/备份保留策略确认：
   - 控制台路径：Supabase `Settings -> Backups`。
   - 记录项：PITR 是否开启、保留天数、最后成功备份时间、责任人。
   - 证据：截图 `Backups` 页面（含保留周期与状态）。
2. 连接池阈值与慢查询告警阈值确认：
   - 控制台路径：Supabase `Reports/Database`（连接数、慢查询），必要时配合 SQL：
     - `select * from pg_stat_activity;`
     - `select * from pg_stat_statements order by total_exec_time desc limit 20;`
   - 记录项：连接池告警阈值、慢查询阈值（如 `>1s` / `>3s`）与告警接收人。
   - 证据：连接数趋势截图 + 慢查询榜单截图 + 阈值记录。
3. 日志保留周期与导出路径确认：
   - 控制台路径：Supabase `Logs` 与项目外部日志存储（若有）。
   - 记录项：Auth/DB/API 日志保留天数、导出频率、导出目的地（S3/Drive/内部仓库）。
   - 证据：日志保留策略截图 + 导出目标配置截图。
4. 发布回滚手册固化（RLS/policy/storage/webhook）：
   - 产物：固定文档章节（触发条件、回滚命令、验证 SQL、负责人、预计耗时）。
   - 最小结构：
     - RLS/policy 回滚：回滚到上一 migration + 核验 `tables_without_policy=0`。
     - storage 回滚：恢复 bucket 可见性与 policy 列表。
     - webhook 回滚：恢复上一 endpoint/secret，验证 `200` 响应。
5. Advisor 安全项复扫并归档时间戳：
   - 控制台路径：Supabase `Advisor`。
   - 记录项：扫描时间（MYT）、issue 数、P0/P1 项清单、豁免项。
   - 证据：Advisor 总览截图 + issue 列表截图（含时间）。
6. 关键链路回归（注册/登录/学习/支付/后台管理）：
   - 场景：
     - 注册 -> 登录 -> 进入 dashboard；
     - 学习路径：至少一次练习/进度更新；
     - 支付路径：test mode checkout + webhook 到账；
     - 后台管理：`/admin/users` 列表与封禁/解封动作。
   - 证据：每个链路至少 1 张成功截图 + 关键日志/SQL 快照。
7. 值班与应急联系人清单确认：
   - 记录项：值班人、备份人、通知通道、响应 SLA、升级路径。
   - 证据：清单截图或文档链接（内部）。

## T-015 执行门禁（待执行）
1. 先验证 C 类表是否存在隐藏读写入口（crons、脚本、后台工具、SQL 任务）。
2. 连续两个发布周期观测为 0 调用后，才可进入下线评审。
3. 任一候选下线必须提供：
   - 迁移脚本（up/down）；
   - 预发回放证据；
   - 发布后监控指标与告警阈值。

## 豁免与台账规则
1. 豁免只允许：明确 smoke/seed 测试数据，或无业务影响的历史不可逆遗留。
2. 台账字段（脱敏）：来源分类、时间窗口、数量、处置状态、复核人。

## 不在本轮执行
1. 不执行物理删除 `public.users` / `auth.users`。
2. 不执行数据库落库动作（迁移文件仅提交，待环境执行）。
3. 不改动 `auth.users` 托管结构与 Supabase 平台托管字段。

## 可在本步骤并行完成的工作
1. 约束审计：主键/外键/唯一/非空/默认值一致性检查。
2. 索引审计：缺失索引、重复索引、低价值索引识别。
3. 枚举与状态流审计：无效状态、不可达状态、越权状态迁移。
4. 引用扫描：字段在代码、Action、SQL、报表中的引用完整性。
5. 删除分级：立即删除/观察期删除/保留并标记废弃。
6. 证据模板：统一 SQL 快照、日志片段、回归结论模板。

## 验证步骤（固定流程）
1. 本地：执行 schema 校验与最小 smoke case，记录 SQL 前后快照。
2. 预发：复测同一组关键场景，验证幂等与并发行为一致。
3. 回归：执行受影响页面最小冒烟，确认无阻断。

## 风险与回滚
- 触发回滚：关键链路写入异常、历史数据丢失、幂等失效导致重复处理。
- 回滚步骤：回滚迁移 -> 恢复旧 schema/索引 -> 复跑本地与预发冒烟。
- 观测要求：日志可定位 userId、action、result、timestamp、eventId。

## 开发启动条件
- 仅当用户在文档审阅后明确批准，才允许进入删除字段/表或执行迁移阶段。

## 开发改动清单（必填）

### 开发单元映射
| 开发单元 | 代码/数据影响 | Action/API 影响 | 数据表影响 | 验证方式 |
|---|---|---|---|---|
| Schema 盘点 | prisma schema 与迁移目录 | 读取行为核对 | 全量候选表 | schema validate + diff |
| 字段映射 | Server Action 与数据访问层 | 读写入口核对 | 关键业务表 | 引用扫描 + 用例回放 |
| 冗余收敛 | 迁移脚本与查询语句 | 错误结构保持不变 | 删除候选字段/表 | 前后快照 + 回滚演练 |
| 冒烟验证 | 关键页面与接口链路 | 主路径稳定性核对 | 读写相关表 | smoke case 执行记录 |

### 必改文件
- prisma/schema.prisma（如有）
- prisma/migrations/*（如有）
- src/actions/**（仅受影响模块）
- .codex/specs/2026-02-09-release-p0-public-paid/p0-03-database-schema-rationalization/*

### 主要接口 / Server Actions
- getDashboardStats
- trackDailyProgress
- createCheckoutSession
- POST /api/webhook/stripe

### 主要数据表
- users
- daily_tasks
- referrals
- notifications
- leaderboard_entries

### 非目标
- 不新增业务功能，不做非关键路径大重构。

### 开发完成判定（DoD）
- 字段映射闭环、冗余项可解释、关键冒烟用例全部通过。
