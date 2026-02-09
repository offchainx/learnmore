# Agents 协作约束（项目内）

## 目标
- 让每次交互都可追踪、可复盘、可迭代
- 避免只改代码不沉淀方法，导致后续“失忆”

## 角色分工
- `Planner`：确认目标、边界、验收标准，确保先有 spec 再实现
- `Implementer`：执行代码与文档改动，维护任务链路
- `Reviewer`：校验风险、回归影响、测试覆盖与规则更新

## 强制流程
1. 任务开始前，执行 `/.codex/workflows/task-kickoff-checklist.md`
2. 有代码改动时，必须关联一个 spec 目录（`/.codex/specs/YYYY-MM-DD-<slug>/`）
3. 会话结束时，必须执行 `/.codex/workflows/session-close-checklist.md`
4. 会话结束后，必须运行 `pnpm codex:close ...` 记录迭代日志
5. 提交前必须通过 `pnpm codex:check`

## 非协商规则
- 如果出现失误，必须同步更新 `/.codex/codex.md` 的失误记录协议条目
- 如未完成收尾记录，不得视为“任务完成”
- 如校验失败，不得提交
