# Task 全流程 SOP（统一版）

> 目标：用一份文档覆盖“新任务启动 -> 实施推进 -> 会话收尾 -> 任务完成”全流程。  
> 使用时机：每次开启一个新 task 时，直接按本文件执行。

## 0. 任务启动（必须）
1. 创建 spec 目录：
```bash
mkdir -p .codex/specs/YYYY-MM-DD-<task-slug>
```
2. 复制四件套模板：
```bash
cp .codex/specs/_template/spec.md .codex/specs/YYYY-MM-DD-<task-slug>/spec.md
cp .codex/specs/_template/plan.md .codex/specs/YYYY-MM-DD-<task-slug>/plan.md
cp .codex/specs/_template/tasks.md .codex/specs/YYYY-MM-DD-<task-slug>/tasks.md
cp .codex/specs/_template/acceptance.md .codex/specs/YYYY-MM-DD-<task-slug>/acceptance.md
```

## 1. Kickoff 清单（必须）

### 1.1 基本信息
- 日期：
- 任务名称：
- 负责人：
- 关联 Story（可选）：
- 关联 Spec 目录：

### 1.2 范围确认
- [ ] 目标（Goal）已定义为可验收结果
- [ ] 非目标（Out of Scope）已明确
- [ ] 影响范围（模块/页面/API/数据）已列出
- [ ] 约束（时间/技术/依赖）已记录

### 1.3 交付与验收
- [ ] `spec.md` 已建立
- [ ] `plan.md` 已建立
- [ ] `tasks.md` 已建立并可勾选
- [ ] `acceptance.md` 已定义测试与验收标准

### 1.4 风险与回滚
- [ ] 风险清单已写入 `spec.md`
- [ ] 回滚策略已写入 `plan.md`
- [ ] 需要监控的指标已确认（如有）

### 1.5 同步策略
- [ ] 明确任务完成后要回写的 `docs/memory-bank` 条目

## 2. 实施阶段（每轮交互）
1. 先更新 `tasks.md`（至少更新状态字段）。
2. 有关键取舍时，补 `decision-log.md`（可从模板复制）。
3. 需求或边界变化时，回写 `spec.md` 与 `plan.md`。
4. 每轮开发后执行最小验证并记录到 `acceptance.md`。

## 3. 会话收尾（每轮必须）

### 3.1 会话信息
- 日期：
- 会话主题：
- 关联 Spec：
- 关联 Story：

### 3.2 固定输出字段
#### What worked
- 

#### What failed
- 

#### Prompt patch
- 

#### Rule patch (codex.md)
- 

#### Skill candidate
- 

#### Need feature follow-up? (Y/N)
- 

### 3.3 运行收尾命令（必须）
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

### 3.4 出现失误时（强制追加）
```bash
--mistake-title "失误名称" \
--mistake-scenario "发生场景" \
--mistake-impact "影响" \
--mistake-root-cause "根因" \
--new-rule "新规则（必须可执行）" \
--prevent-check "防复发检查项" \
--rule-example "正确示例"
```

### 3.5 新特性评估时（推荐追加）
```bash
--feature-name "功能名" \
--feature-source "来源/日期" \
--feature-fit "高/中/低" \
--feature-trial "试点方案" \
--feature-decision "adopt/hold/reject"
```

### 3.6 落盘检查
- [ ] `/.codex/prompts/iteration-log.md` 已追加记录
- [ ] 若有失误，`/.codex/codex.md` 已新增失误记录与新规则
- [ ] 若有功能探索，已更新 `/.codex/features/radar.md`
- [ ] 关键结论已回写 `docs/memory-bank/active_context.md` 或 `docs/memory-bank/progress.md`（按需）

## 4. 提交前检查（必须）
1. 暂存改动后执行：
```bash
pnpm codex:check
```
2. 若已安装 hooks，`git commit` 会自动执行同样校验。

## 5. 任务完成（必须）
1. 在 `acceptance.md` 勾选所有验收项。
2. 回写关键结论到：
- `docs/memory-bank/active_context.md` 或
- `docs/memory-bank/progress.md`

## 6. 快捷口令（给 AI）
1. 启动任务：  
`按 task-lifecycle-sop 启动 <任务名>，创建并填充四件套。`
2. 中途推进：  
`按 task-lifecycle-sop 更新 tasks 与风险，继续实现。`
3. 会话收尾：  
`按 task-lifecycle-sop 执行收尾并运行 codex:close。`

