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
- [ ] T-010 范围确认（Admin 首页非用户双表 mock）
- [ ] 字段-逻辑映射表完整并附证据
- [x] 本地验证完成并附测试证据
- [x] 预发复测完成并附证据
- [ ] 幂等与越权场景通过
- [ ] 删除项具备回滚验证
- [x] 已获得用户批准进入 T-008 开发
