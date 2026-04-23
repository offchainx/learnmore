# UI 重构 Spec/Harness 极简化初始化方案

## Summary
- 新根目录固定为：`.codex/specs/2026-04-22-ui-redesign`
- 文档体系改为 `极简双文档`：
  - `spec.md`：只存稳定边界和冻结结论
  - `tasks.md`：唯一主阅读入口，合并 plan / acceptance / decision / kickoff 信息
- 根目录新增 `codex-plans/`，专门保存 Codex 每一轮产出的正式计划稿
- 根目录新增 `harness/`，专门保存 conversation ledger、route inventory、prompt ledger、evidence
- 子 spec 也统一只保留 `spec.md` + `tasks.md`

## 结构
```text
.codex/specs/2026-04-22-ui-redesign/
  spec.md
  tasks.md
  codex-plans/
  specs/
  harness/
```

## 文件职责
- `spec.md`
  - 总背景、总目标、非目标、总边界、冻结约束、关键风险、依赖
  - 不放频繁变动的执行细节
- `tasks.md`
  - 唯一主阅读入口
  - 固定分区：项目快照、冻结边界、当前计划、阶段进度、任务表、验收清单、关键决策、会话更新、下一步
- `codex-plans/`
  - 保存每轮 Codex 输出的正式计划稿快照
- `harness/conversation-ledger.md`
  - 每个有效回合追加一条记录
- `harness/v0-prompt-ledger.md`
  - 记录每次 v0 的目标、输入、结果和后续动作
- `harness/implementation-ledger.md`
  - 记录各域切换到新 UI 的时间点及关联实现

## 保存机制
- 对话级保存采用“双轨制”：
  - 任务内：每个有效回合都写 `harness/conversation-ledger.md`
  - 全局：继续使用 `pnpm codex:close` 写 `.codex/prompts/iteration-log.md`
- Git hook 只能做提交时兜底，不能保证“每轮聊天结束自动保存”
- 若后续增强提交校验，可以要求改动触及 UI 重构目录时必须同时更新：
  - `.codex/prompts/iteration-log.md`
  - `harness/conversation-ledger.md`

## Test Plan
- 目录校验：只创建 `.codex/specs/2026-04-22-ui-redesign`
- 子 spec 校验：每个 `ws-*` 和 `d-*` 目录只包含 `spec.md` 与 `tasks.md`
- 历史计划校验：`codex-plans/` 中能持续追加正式计划稿
- ledger 校验：`harness/` 下所有 ledger 文件与产物目录齐全

## Assumptions
- `tasks.md` 是唯一主阅读入口；`spec.md` 只承担稳定边界
- `codex-plans/` 用于历史追踪，`tasks.md` 只保持当前有效状态
- 对话保存粒度采用“每个有效回合”
- Git hook 只承担提交前兜底，不替代对话级保存
