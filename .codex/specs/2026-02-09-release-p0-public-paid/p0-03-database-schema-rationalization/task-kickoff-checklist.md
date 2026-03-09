# Task Kickoff Checklist

> 使用时机：每次新任务开始前。

## 基本信息
- 日期：2026-03-06
- 任务名称：P0-03 数据库梳理与 Schema 收敛
- 负责人：codex
- 关联 Story（可选）：Story-024/031/043
- 关联 Spec 目录：.codex/specs/2026-02-09-release-p0-public-paid/p0-03-database-schema-rationalization

## 范围确认
- [x] 目标（Goal）已定义为可验收结果
- [x] 非目标（Out of Scope）已明确
- [x] 影响范围（模块/页面/API/数据）已列出
- [x] 约束（时间/技术/依赖）已记录

## 交付与验收
- [x] `spec.md` 已建立
- [x] `plan.md` 已建立
- [x] `tasks.md` 已建立并可勾选
- [x] `acceptance.md` 已定义测试与验收标准
- [x] 已确认 Auth/Public Users 同步审计口径为“统计+脱敏”

## 任务重排确认项
- [x] `T-003` 已完成确认（done）
- [x] `T-004` 为定义阶段（done）
- [x] `T-005` 为唯一执行阶段（done）
- [x] 当前环境已完成残留冲突收口（无新增收口任务）

## T-006 完成检查项（文档）
- [x] 双表字段覆盖审计完成（`auth.users=35`，`public.users=30`；T-009 后 `public.users=31`，交集字段已核对）
- [x] 冗余分级已按保守口径完成（A/B/C）
- [x] 字段证据模板已补齐到 `acceptance.md`
- [x] 本轮未执行 schema/data 变更

## T-007 前置检查项（仅计划）
- [x] 已输出链路补齐输入清单（`last_sign_in_at` / `sign_in_count` / `total_study_time` / UTM）
- [x] 用户确认前不进入开发实施

## T-007 完成检查项（文档）
- [x] C 类字段已形成可执行方案（入口/幂等/风险控制）
- [x] B 类字段已形成观察与删除评审门槛
- [x] 已明确实际开发承接任务为 `T-008`
- [x] 本轮仍未执行 schema/data 变更

## T-008 前置检查项（开发）
- [ ] 用户已明确批准进入 `T-008`
- [ ] 本地回归与预发复测 SQL 清单已冻结
- [ ] 回滚步骤与告警阈值已确认

## T-009 完成检查项（开发）
- [ ] `/admin/users` 已完全替换 mock 数据源并通过分页/筛选/排序回归
- [ ] 权限调控链路已移除 `usr_` mock 分支并通过回归
- [ ] 用户详情 mock 已按范围替换（permission history / heatmap / rewardSummary / payment 空态）
- [ ] `public.users.school` 已在 schema + migration 文件落地
- [ ] 编译级验证通过（`prisma generate` + `tsc --noEmit`）

## T-010 完成检查项（开发）
- [ ] `/admin` 首页 KPI/工单/风险/audit/actions 已替换为真实聚合数据
- [ ] KPI 第二张卡已由“营收”调整为“付费用户”
- [ ] 页面刷新与窗口切换已改为真实刷新链路
- [ ] 未影响 T-009 已交付的用户双表链路

## T-011 完成检查项（文档）
- [x] 已输出全表清单（Prisma 41 表）与 `@@map` 对照
- [x] 已输出表级分级（A/B/C）并标注收敛候选清单
- [x] 已补运行时引用证据（`prisma.*`/Supabase 链路）
- [x] 本轮未执行 schema/data 变更

## T-012 完成检查项（开发）
- [x] 已新增 RLS 迁移文件并覆盖 public schema 业务表
- [x] 已确认本轮未引入匿名宽权限 POLICY
- [ ] 已完成 Advisor 复跑并记录 issue 变化

## T-013 前置检查项（后续）
- [ ] 已输出全表 policy 矩阵草案（表/操作/角色/条件）
- [ ] 已确认核心链路表按最小权限策略优先落地
- [ ] 已确认不引入匿名宽权限 policy

## T-013 完成检查项（开发）
- [x] 全表 policy migration 已落地（含 helper function）
- [x] SQL 复核通过（`tables_with_policy=43`，`tables_without_policy=0`）
- [ ] 关键链路未因 policy 缺失而阻断

## T-014 前置检查项（后续）
- [x] 已确认 Supabase 定档范围（Auth/DB/Storage/API/Webhook/监控）
- [x] 已确认需要记录“当前值 + 目标值 + 责任人 + 回滚”

## T-014 完成检查项（文档）
- [x] 已输出上线前配置定档清单（可逐项打勾）
- [x] 已回填当前环境快照（RLS/policy/bucket/trigger/function）
- [x] 已标出需要控制台人工确认的配置项
- [x] 已完成 Data API 暴露面最小化（`public` only）并复核
- [x] 已完成 `.env` 停止跟踪并保留 `.env.example`
- [ ] 后置项：登录/注册/重置密码限流与邮件模板（待域名与 SMTP 发信域）
- [ ] 后置项：管理员 TOTP 绑定（待应用提供 MFA 绑定入口）

## T-015 前置检查项（后续）
- [ ] 已确认仅执行“收敛候选验证与迁移设计”，不直接删表
- [ ] 已确认 C 类候选需经过双环境观测与回滚脚本评审

## 风险与回滚
- [x] 风险清单已写入 `spec.md`
- [x] 回滚策略已写入 `plan.md`
- [ ] 需要监控的指标已确认（如有）

## 执行顺序确认项
- [x] `T-005` 按 5 步推进：止血 -> 分类 -> 处置 -> 验证 -> 收尾
- [x] 未完成前序门禁，不进入后续步骤

## 同步策略
- [ ] 明确任务完成后要回写的 `docs/memory-bank` 条目
- [x] 已定义差异豁免台账字段（来源/时间窗口/数量/状态/复核人）
