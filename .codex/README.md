# .codex 使用入口（项目内）

## 一次完整交互的最小步骤
先读：`/.codex/workflows/new-task-sop.md`（单一执行标准）

1. 任务启动前  
   按 `/.codex/workflows/task-kickoff-checklist.md` 过一遍，创建 spec 目录并填四件套模板。

2. 实施中  
   维护 `tasks.md` 的状态与提交链接，确保可追踪。

3. 会话结束  
   填 `/.codex/workflows/session-close-checklist.md`，然后执行：

```bash
pnpm codex:close \
  --context "当前任务上下文" \
  --prompt "本轮关键提示词" \
  --result "结果摘要" \
  --worked "有效做法" \
  --failed "失败点" \
  --improved "改进后的提示模板" \
  --next "下一步动作"
```

4. 提交前  
   运行 `pnpm codex:check`。  
   如果你已执行 `pnpm codex:install-hooks`，提交时会自动检查。

## 关键文件索引
- 新任务SOP：`/.codex/workflows/new-task-sop.md`
- 项目配置：`/.codex/config.toml`
- 规则：`/.codex/codex.md`
- 协作：`/.codex/agents.md`
- 配置：`/.codex/config.md`
- 技能登记：`/.codex/skills.md`
- 提示迭代：`/.codex/prompts/iteration-log.md`
- 功能雷达：`/.codex/features/radar.md`
