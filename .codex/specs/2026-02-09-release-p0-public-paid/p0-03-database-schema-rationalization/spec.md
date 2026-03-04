id: SPEC-20260209-P0-03
title: P0-03 数据库梳理与 Schema 收敛
status: active
owner: codex
related_story:
created_at: 2026-03-02
updated_at: 2026-03-04

# 背景
- 当前 P0 发布链路新增数据库专项梳理任务，目标是在上线前消除“字段无业务承接、表结构冗余、逻辑失配”的风险。
- 该任务是后续 P0 功能验收的底座，需先于多数业务任务完成核心核对。

# 目标（Goals）
- 梳理数据库 schema、表结构与字段语义，形成可审计的字段-逻辑映射。
- 确保所有字段均有明确读写逻辑与运行路径，且关键链路可正常运行。
- 识别并下线不必要字段/表/冗余逻辑，提供可回滚方案。

# 非目标（Non-Goals）
- 不在本任务内引入新业务功能。
- 不进行跨域数据平台改造（如数据仓库/BI 体系）。

# 约束（Constraints）
- 必须遵循 .codex/workflows/new-task-sop.md。
- 先完成文档审阅与门禁，再进入代码级删除或迁移。
- 涉及删除动作必须附带回滚路径与验证证据。

# 范围（In Scope）
- Prisma schema 与核心业务表审计（字段定义、约束、索引、枚举）。
- 字段-业务逻辑映射（读取入口、写入入口、触发条件、异常分支）。
- 冗余字段/表/索引候选清单与分级处置策略。
- 最小可运行 smoke case（冒烟用例）设计与执行记录。

# 范围外（Out of Scope）
- 历史全量数据治理（仅处理与 P0 发布链路强相关部分）。
- 长周期归档策略与冷热分层策略。

# 风险（Risks）
- 风险：误删仍在暗路径使用的字段或索引。
  - 影响：线上查询失败、写入异常、功能回归。
  - 缓解策略：先做字段引用扫描 + 双环境 smoke case + 分步删除。
- 风险：迁移顺序不当导致数据不一致。
  - 影响：业务状态错乱或统计偏差。
  - 缓解策略：迁移前后 SQL 快照比对 + 可回滚脚本。
- 风险：同邮箱出现不同 UUID（身份映射漂移）。
  - 影响：账户识别混乱，可能导致权限/订阅归属错误。
  - 缓解策略：纳入专项 SQL 核查并建立存量豁免与修复计划。
- 风险：脚本直写 `public.users` 绕过 `auth.users -> trigger` 主链路。
  - 影响：双表长期偏离，后续审计和回滚成本升高。
  - 缓解策略：统一脚本口径、补齐来源标记并持续监控差异增量。

# 依赖（Dependencies）
- Prisma schema 与迁移链路可用。
- 本地与预发数据库均可执行验证 SQL。
- 关键 Server Action 日志可追踪 userId/action/result/timestamp。

# 当前发现（Auth/Public Users 同步现状）
- 检查时间：2026-03-02（基于当前 `.env` 指向数据库，统计口径为脱敏汇总）。
- 基线结论：`auth.users` 与 `public.users` 当前不同步。
- 基线计数：
  - `auth_users_count = 24`
  - `public_users_count = 29`
  - `missing_in_public = 12`（`auth.users` 有、`public.users` 无）
  - `missing_in_auth = 17`（`public.users` 有、`auth.users` 无）
- 差异时间窗口：
  - `missing_in_public`：`2025-12-09` ～ `2026-01-21`
  - `missing_in_auth`：`2026-01-27` ～ `2026-03-02`
- 来源分类（脱敏汇总）：
  - `p0-01-internal-smoke`：14
  - `prisma-seed-likely`：3
  - 历史触发器失效窗口：待进一步复核（用于解释 `missing_in_public` 存量）
- 2026-03-03 最终快照（T-005 已完成）：
  - `auth_users_count = 25`
  - `public_users_count = 25`
  - `missing_in_public = 0`
  - `missing_in_auth = 0`
  - `email_id_mismatch = 0`

# T-004 定义阶段摘要（已完成）
## 修复目标（可验收）
1. 新增注册链路下，双表差异增量为 0（可接受延迟内）。
2. 历史存量差异完成分桶处理并有豁免台账。
3. 同邮箱异 UUID 新增量为 0，存量具备逐条处置策略。
4. 非标准写入路径（seed/smoke）具备显式标记，不污染生产口径。

## 修复原则
1. 先止血、后清存量、再固化防回归。
2. 不直接物理删除历史记录；先软处置与豁免登记。
3. 全程保留 SQL 快照和执行证据。
4. 所有修复动作可回滚、可复盘。

# T-005 执行阶段范围（已完成）
1. Phase A（止血）：锁定非标准写入入口，核验 trigger 链路，建立每日只读监控 SQL。
2. Phase B（分类）：按 smoke/seed/历史触发器窗口/unknown 分桶并评级。
3. Phase C（处置）：分别处理 `missing_in_public`、`missing_in_auth`、同邮箱异 UUID。
4. Phase D（防回归）：发布门禁+周期审计+阈值告警。

# T-006 字段审计结论（文档）
## 审计口径
1. `auth.users`：按 Supabase 托管层处理，不提出删改字段建议。
2. `public.users`：按业务字段保守分级，仅标注“保留/观察/待补齐链路”，不直接判定删除。
3. 本轮仅文档审计，不执行 schema / 数据改动。

## 双表字段分层（结论）
1. 基线结构：
   - `public.users` 共 30 字段。
   - `auth.users` 共 35 字段。
   - 同名交集字段 6 个：`id` / `email` / `created_at` / `updated_at` / `last_sign_in_at` / `role`。
2. `auth.users`（托管层）：
   - 平台托管字段（密码、token、确认/恢复、SSO、匿名、审计时间等）保留，不纳入删改范围。
   - 与业务同步关键字段聚焦：`id`、`email`、`created_at`、`updated_at`、`raw_user_meta_data`、`last_sign_in_at`。
3. `public.users`（业务层）：
   - A类（有稳定生成逻辑）：`id`、`email`、`updated_at`（强制非空无默认值）、`created_at`、`role`、`status`、`subscription_tier`、`subscription_status`、`cancel_at_period_end`、`xp`、`streak`、`ai_token_balance`、`referral_count`、`referral_limit`。
   - B类（保留，存在潜在生成逻辑但当前数据弱）：`username`、`avatar`、`grade`、`referral_code`、`subscription_start`、`subscription_end`、`stripe_customer_id`、`stripe_subscription_id`、`first_paid_at`、`utm_source`、`utm_medium`、`utm_campaign`。
   - C类（保留，逻辑待补齐）：`last_sign_in_at`、`sign_in_count`、`total_study_time`。

## 关键判断
1. “是否所有字段都有逻辑能生成”：
   - 结论：关键必填字段均可生成并可运行；并非所有字段都有稳定生成链路（存在 C 类待补齐）。
2. “是否有冗余或不必要字段”：
   - 结论：本轮不直接判删；仅识别观察项与待补链路项，进入后续 `T-007` 方案定义。
3. 链路缺口：
   - `auth.users.last_sign_in_at` 有数据，但 `public.users.last_sign_in_at` 当前未同步。
   - `total_study_time` 可读但缺少稳定累计写入入口（seed 之外）。

# T-007 字段链路补齐与冗余字段调整方案（文档，已完成）
## 方案边界
1. 本阶段只定义方案，不执行代码、SQL、schema、数据变更。
2. `auth.users` 维持托管口径，不提出结构删改。
3. `public.users` 采用“保留优先、链路补齐优先、延后删除判定”。

## 字段级调整方案（定义结果）
| 字段/字段组 | 当前分级 | 现状问题 | 调整方案（仅定义） | 归属任务 |
|---|---|---|---|---|
| `public.users.last_sign_in_at` | C | 与 `auth.users.last_sign_in_at` 不同步 | 以 `auth.users` 为主数据源；在登录后链路增加镜像更新或读时回填，确保可对齐 | T-008 |
| `public.users.sign_in_count` | C | 缺稳定累计入口 | 在统一登录成功事件上做幂等累加（按会话去重），失败可重放 | T-008 |
| `public.users.total_study_time` | C | 仅 seed 可写，业务链路不稳定 | 收敛到单一累计入口（学习/练习完成事件），统一秒级单位与上限保护 | T-008 |
| `utm_source/utm_medium/utm_campaign` | B | 当前覆盖率低且存在全空 | 补齐注册/落地页采集入口；若连续观察窗口仍为 0，再进入删除评审 | T-008（先补链路） |
| `stripe_customer_id/stripe_subscription_id/first_paid_at` | B | 部分环境覆盖率低 | 保留并继续由 webhook 写入；加入空值告警，不进入删除候选 | T-008（增强校验） |
| `auth.users` 托管字段集 | 托管 | 平台内核字段，业务侧不可控 | 仅做读与映射，不做删改建议 | 托管范围外 |

## 冗余字段判定口径（T-007 输出）
1. 当前无“立即删除字段”。
2. 仅存在“观察候选字段”：`utm_source`、`utm_medium`、`utm_campaign`。
3. 观察候选转删除候选的前提（后续任务再评审）：
   - 连续两个发布周期无读路径；
   - 连续两个发布周期数据覆盖率维持 0；
   - 完成影响评估与回滚脚本草案。

# 开发顺序（唯一顺序）
1. `T-003` 文档确认完成。
2. `T-004` 审计与策略定义完成。
3. `T-005` 执行对齐与验证闭环。
4. `T-006` 字段逻辑与冗余审计（文档）完成。
5. `T-007` 字段链路补齐与冗余字段调整方案定义（文档）完成。
6. `T-008` 执行字段链路补齐与冗余字段治理开发（待开始）。

# 开发内容（必须先确认）

## 开发主线
1. 盘点 schema 与表字段，输出字段语义与使用状态。
2. 建立字段-逻辑映射，覆盖关键读写路径与异常分支。
3. 执行最小 smoke case，验证主链路“可读、可写、可回滚”。
4. 形成删除/收敛清单并按低风险顺序推进。

## 开发单元拆分
| 单元 | 目标 | 产出 |
|---|---|---|
| Schema 审计 | 核查模型、约束、索引与枚举 | schema 审计报告 |
| 逻辑映射 | 逐字段绑定读写入口与业务规则 | 字段-逻辑映射表 |
| 冗余识别 | 识别无引用字段/重复索引/废弃表 | 删除候选清单 |
| 运行验证 | 用最小冒烟用例覆盖关键链路 | smoke case 证据 |
| 收敛实施 | 安全删除与迁移回滚 | 变更清单 + 回滚方案 |

## 任务边界
- 不做跨 P0 范围的大规模模型重构。

## 交付判定（DoD）
- 字段逻辑映射完整、关键冒烟用例通过、删除项具备回滚与证据。
