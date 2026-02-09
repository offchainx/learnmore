id: SPEC-20260209-P0-00
title: P0-00 范围冻结与 SOP 建档
status: active
owner: codex
related_story:
created_at: 2026-02-09
updated_at: 2026-02-09

# 背景
- P0 发布链路中的子任务，需可独立验收与回滚。

# 目标（Goals）
- 建立 release 总目录与 11 个任务的四件套文档，确保可追踪执行。

# 非目标（Non-Goals）
- 不扩展到 P1 范围。

# 约束（Constraints）
- 必须遵循 .codex/workflows/new-task-sop.md。

# 范围（In Scope）
- 当前子任务的方案、实施、验收、收尾。

# 范围外（Out of Scope）
- 其他 P0 子任务的实现细节。

# 风险（Risks）
- 风险：实现跨度过大。
  - 影响：延期与返工。
  - 缓解策略：拆分为可日清的小任务并先过验收。

# 依赖（Dependencies）
- release 总计划与共享基础能力可用。

# 开发内容（必须先确认）

## 开发主线（文档任务）
1. 冻结 P0 范围与依赖顺序。
2. 为每个子任务补齐四件套并统一门禁。
3. 标记“待用户批准后开发”，禁止提前进入实现。

## 具体开发单元（本任务不改业务代码）
| 单元 | 产出文件 | 验收方式 |
|---|---|---|
| 总计划治理 | release 目录下 spec/plan/tasks/acceptance | 文档可读、可执行、可追踪 |
| 子任务治理 | p0-00~p0-10 四件套 | 每个任务含 Action 矩阵与数据表矩阵 |
| 开发门禁 | tasks 状态与门禁描述 | 用户未批准前保持开发 todo |

## 任务边界
- 允许：仅修改 .codex/specs 文档。
- 禁止：修改 src/、prisma/、supabase/ 代码与 schema。

## 交付判定（DoD）
- 11 个子任务文档具备可执行开发说明。
- 所有任务都能回答“改哪些文件、调用哪些 Action、核对哪些表”。
- 全部任务处于“先确认文档，再开发”的状态。
