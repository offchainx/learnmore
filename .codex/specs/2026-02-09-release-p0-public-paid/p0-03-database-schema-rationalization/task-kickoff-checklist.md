# Task Kickoff Checklist

> 使用时机：每次新任务开始前。

## 基本信息
- 日期：2026-03-05
- 任务名称：P0-03 数据库梳理与 Schema 收敛
- 负责人：codex
- 关联 Story（可选）：Story-024/031/043
- 关联 Spec 目录：.codex/specs/2026-02-09-release-p0-public-paid/p0-03-database-schema-rationalization

## 范围确认
- [ ] 目标（Goal）已定义为可验收结果
- [ ] 非目标（Out of Scope）已明确
- [ ] 影响范围（模块/页面/API/数据）已列出
- [ ] 约束（时间/技术/依赖）已记录

## 交付与验收
- [ ] `spec.md` 已建立
- [ ] `plan.md` 已建立
- [ ] `tasks.md` 已建立并可勾选
- [ ] `acceptance.md` 已定义测试与验收标准
- [ ] 已确认 Auth/Public Users 同步审计口径为“统计+脱敏”

## 任务重排确认项
- [ ] `T-003` 已完成确认（done）
- [ ] `T-004` 为定义阶段（done）
- [ ] `T-005` 为唯一执行阶段（done）
- [ ] 当前环境已完成残留冲突收口（无新增收口任务）

## T-006 完成检查项（文档）
- [ ] 双表字段覆盖审计完成（`auth.users=35`，`public.users=30`；T-009 后 `public.users=31`，交集字段已核对）
- [ ] 冗余分级已按保守口径完成（A/B/C）
- [ ] 字段证据模板已补齐到 `acceptance.md`
- [ ] 本轮未执行 schema/data 变更

## T-007 前置检查项（仅计划）
- [ ] 已输出链路补齐输入清单（`last_sign_in_at` / `sign_in_count` / `total_study_time` / UTM）
- [ ] 用户确认前不进入开发实施

## T-007 完成检查项（文档）
- [ ] C 类字段已形成可执行方案（入口/幂等/风险控制）
- [ ] B 类字段已形成观察与删除评审门槛
- [ ] 已明确实际开发承接任务为 `T-008`
- [ ] 本轮仍未执行 schema/data 变更

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
- [ ] 已输出全表清单（Prisma 41 表）与 `@@map` 对照
- [ ] 已输出表级分级（A/B/C）并标注收敛候选清单
- [ ] 已补运行时引用证据（`prisma.*`/Supabase 链路）
- [ ] 本轮未执行 schema/data 变更

## T-012 完成检查项（开发）
- [ ] 已新增 RLS 迁移文件并覆盖 public schema 业务表
- [ ] 已确认本轮未引入匿名宽权限 POLICY
- [ ] 已完成 Advisor 复跑并记录 issue 变化

## T-013 前置检查项（后续）
- [ ] 已确认仅执行“收敛候选验证与迁移设计”，不直接删表
- [ ] 已确认 C 类候选需经过双环境观测与回滚脚本评审

## 风险与回滚
- [ ] 风险清单已写入 `spec.md`
- [ ] 回滚策略已写入 `plan.md`
- [ ] 需要监控的指标已确认（如有）

## 执行顺序确认项
- [ ] `T-005` 按 5 步推进：止血 -> 分类 -> 处置 -> 验证 -> 收尾
- [ ] 未完成前序门禁，不进入后续步骤

## 同步策略
- [ ] 明确任务完成后要回写的 `docs/memory-bank` 条目
- [ ] 已定义差异豁免台账字段（来源/时间窗口/数量/状态/复核人）
