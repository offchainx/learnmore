# 新任务执行 SOP（严格版）

> 目标：确保每次交互都有沉淀，任务可追踪，可复盘，可迭代。

## 0. 任务启动（必须）
1. 创建 spec 目录：
```bash
mkdir -p .codex/specs/YYYY-MM-DD-<task-slug>
```
2. 从模板复制四件套：
```bash
cp .codex/specs/_template/spec.md .codex/specs/YYYY-MM-DD-<task-slug>/spec.md
cp .codex/specs/_template/plan.md .codex/specs/YYYY-MM-DD-<task-slug>/plan.md
cp .codex/specs/_template/tasks.md .codex/specs/YYYY-MM-DD-<task-slug>/tasks.md
cp .codex/specs/_template/acceptance.md .codex/specs/YYYY-MM-DD-<task-slug>/acceptance.md
```
3. 执行 kickoff 清单：`/.codex/workflows/task-kickoff-checklist.md`

## 1. 实施阶段（每轮交互）
1. 先更新 `tasks.md`（至少更新状态字段）。
2. 若有关键取舍，补 `decision-log.md`（可从模板复制）。
3. 若需求或边界变化，回写 `spec.md` 与 `plan.md`。

## 2. 会话收尾（每轮必须）
1. 填写：`/.codex/workflows/session-close-checklist.md`
2. 运行：
```bash
pnpm codex:close \
  --context "本轮上下文" \
  --prompt "本轮关键提示词" \
  --result "结果摘要" \
  --worked "有效做法" \
  --failed "失败点" \
  --improved "改进后提示词" \
  --next "下一步动作"
```

## 3. 出现失误时（强制）
在 `codex:close` 增加参数，自动写入 `/.codex/codex.md`：
```bash
--mistake-title "失误名称" \
--mistake-scenario "发生场景" \
--mistake-impact "影响" \
--mistake-root-cause "根因" \
--new-rule "新规则（必须可执行）" \
--prevent-check "防复发检查项" \
--rule-example "正确示例"
```

## 4. 新特性评估时（推荐）
在 `codex:close` 增加参数，自动写入 `/.codex/features/radar.md`：
```bash
--feature-name "功能名" \
--feature-source "来源/日期" \
--feature-fit "高/中/低" \
--feature-trial "试点方案" \
--feature-decision "adopt/hold/reject"
```

## 5. 提交前（必须）
1. 暂存改动后执行：
```bash
pnpm codex:check
```
2. 若已安装 hooks（已安装），`git commit` 会自动执行同样校验。

## 6. 任务完成后（必须）
1. 回写关键结论到 `docs/memory-bank/active_context.md` 或 `docs/memory-bank/progress.md`。
2. 在 `acceptance.md` 打勾所有验收项。

## 7. 推荐交互口令（给 AI）
1. 启动任务：  
`按 .codex SOP 启动 <任务名>，创建 spec 并填四件套。`
2. 中途推进：  
`按 SOP 更新 tasks 与风险，继续实现。`
3. 会话结束：  
`按 SOP 执行收尾，更新 iteration-log，并补充规则/feature（如有）。`
