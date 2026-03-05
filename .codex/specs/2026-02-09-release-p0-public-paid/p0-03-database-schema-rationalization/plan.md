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
10. `T-012` 执行数据库表收敛（待用户确认）。

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
   - 收敛执行统一进入 `T-012`，并要求双环境观测与回滚脚本。

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

## T-012 执行门禁（待执行）
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
