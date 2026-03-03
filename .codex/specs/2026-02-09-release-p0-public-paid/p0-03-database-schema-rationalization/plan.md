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
