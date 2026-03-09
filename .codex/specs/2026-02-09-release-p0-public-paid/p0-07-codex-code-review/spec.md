id: SPEC-20260209-P0-07
title: P0-07 Codex Code Review 与风险收敛
status: active
owner: codex
related_story: Story-043
created_at: 2026-03-09
updated_at: 2026-03-09

# 背景
- 在 P0-03（数据库收敛）与 P0-06（Practice 验收）推进后，代码与迁移链路出现可上线风险。
- 需要把 Code Review 结果沉淀为独立 P0 任务，先收敛高风险，再继续后续功能任务。

# 目标（Goals）
- 输出结构化 Code Review 结论（按严重级别，含文件定位与修复建议）。
- 完成以下风险收敛方案设计并进入执行门禁：
  1) RLS 启用与策略迁移必须同批发布，避免“启用 RLS 但无策略”锁库。
  2) 修复 Practice 数据服务单测回归（mock 与实现不一致）。
  3) 建立可执行的 lint 分层治理路径，恢复可用门禁。

# 非目标（Non-Goals）
- 不处理 `.env` 追踪与密钥治理（按用户要求排除）。
- 不做 UI/产品功能扩展。
- 不在本任务内一次性清空历史 lint 存量。

# 约束（Constraints）
- 遵循 `.codex/workflows/new-task-sop.md`。
- 先文档确认，后实施；未获用户确认前不进入修复代码阶段。

# 范围（In Scope）
- 代码审查结果文档化。
- 风险分级、修复顺序、验证矩阵。
- 与其他 P0 子任务的编号与依赖关系对齐。

# 范围外（Out of Scope）
- 其他 P0 子任务的业务实现细节。

# 风险（Risks）
- 风险：只做问题罗列不落地修复。
  - 影响：后续任务建立在不稳定基线上。
  - 缓解策略：将修复动作拆成可验证子项并绑定验收矩阵。
- 风险：lint 历史问题过多导致新增回归不可见。
  - 影响：PR 门禁失真。
  - 缓解策略：按目录分层收敛并设置增量门禁。

# 依赖（Dependencies）
- 依赖 `p0-03-database-schema-rationalization` 的迁移输出。
- 依赖 `p0-06-practice-prod-validation` 的测试基线。

# 开发内容（必须先确认）

## 开发主线
1. 固化 Code Review findings（P1/P2）与优先级。
2. 修复并验证 RLS 发布链路、Practice 测试回归。
3. 制定 lint 分层清理与增量门禁方案。

## 组件级开发映射
| 模块 | 目标 | 关键文件 | 验证方式 |
|---|---|---|---|
| DB 迁移发布 | 避免 RLS 锁库风险 | supabase/migrations/009_*.sql, 010_*.sql | 迁移后策略覆盖检查 |
| Practice 数据服务 | 消除单测回归 | src/actions/practice/data-service.ts, __tests__/data-service.test.ts | vitest 定向回归 |
| 静态门禁 | 恢复 lint 可用性 | eslint 配置与分层脚本 | lint 分组执行结果 |

## 交付判定（DoD）
- P1/P2 findings 完整记录且经用户确认。
- 高优先级修复项具备可执行方案与验收步骤。
- 本任务与全局 P0 编号一致，无重号或断号。
