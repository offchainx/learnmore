id: SPEC-20260422-UI-REDESIGN
title: UI 重构总计划
status: active
owner: codex
related_story:
created_at: 2026-04-22
updated_at: 2026-04-23

# 背景
- 当前前端同时存在多套视觉语言：一部分页面已经有较克制的 token 与 shell 体系，另一部分仍保留明显的 AI SaaS 模板感、发光渐变和过度游戏化表达。
- 本项目是长期产品，不是活动页；UI 重构必须在保留既有功能的前提下，先冻结统一方法论，再分域落地，避免反复返工。
- v0 有明确成本约束，因此需要先建立高价值、低轮次的 spec/harness 体系，再进入设计与实现阶段。

# 目标（Goals）
- 建立一套可持续推进的 UI 重构总控结构，覆盖规划、执行、证据、prompt 跟踪和 memory-bank 回写。
- 冻结当前已达成的一致性结论，避免后续对话遗忘或口径漂移。
- 让 `tasks.md` 成为唯一主阅读入口，降低维护和跟踪成本。
- 先用 v0 复刻一个用户满意的参考目标，再从样板反推 design contract、token 和 shared UI 基础。

# 非目标（Non-Goals）
- 本次初始化不直接改动业务 UI 代码，也不替换现有组件实现。
- 不在本次初始化中新增、删除或重构业务功能。
- 不把所有历史文档迁移进新目录；历史文档仍保留在原路径，只作为参考输入。

# 稳定边界（Frozen Constraints）
- 第一阶段视觉方向：`Light-First`
- 产品气质：`编辑感产品` + `温暖教育`
- 目标受众：学生与家长平衡
- 游戏化策略：保留机制，大幅收敛外显视觉与热血文案
- 变更边界：允许调整信息层级与模块顺序，不改主流程，不删既有功能，除非用户明确批准
- v0 使用策略：先磨出一版用户满意的参考样板，再由样板反推 token、组件和 shell，不把 v0 当高频微调工具
- 对话保存粒度：按“每个有效回合”记录，不按每次 user-assistant 往返逐条落盘

# 范围（In Scope）
- `.codex/specs/2026-04-22-ui-redesign` 总目录初始化
- 子 spec 双文档模板初始化
- `codex-plans/` 历史计划归档目录初始化
- `harness/` 运行台账、盘点清单和证据目录初始化
- v0 参考复刻、样板回收与 prompt 协作流程冻结
- UI 重构的总边界、方法论、保存机制与执行路径冻结

# 范围外（Out of Scope）
- 具体页面视觉实现
- 组件 API 调整
- memory-bank 实际回写内容更新

# 风险（Risks）
- 风险：文档数量再次膨胀，最终仍然难以维护
  - 影响：用户只看一个文件的目标失效
  - 缓解策略：只保留 `spec.md` + `tasks.md` 双文档，其他内容进入 `codex-plans/` 或 `harness/`
- 风险：页面域推进时遗漏某些 route 或 must-keep 功能
  - 影响：UI 落地时出现覆盖空洞或功能回归
  - 缓解策略：由 `ws-00-scope-and-route-freeze` 先完成 route inventory 与 must-keep 清单
- 风险：对话结论只保存在全局日志，任务内上下文断裂
  - 影响：后续推进需要重复回忆上下文
  - 缓解策略：引入 `harness/conversation-ledger.md` 作为任务内有效回合总表

# 依赖（Dependencies）
- 现有 `.codex/specs/_template` 与 `.codex/workflows/task-lifecycle-sop.md`
- `docs/ui_restructure/*` 既有 UI 重构资料
- `docs/memory-bank/active_context.md` 与 `docs/memory-bank/progress.md`
- v0 MCP、现有 Next.js + Tailwind + shared UI 基础设施
