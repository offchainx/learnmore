# Codex 项目协作规则（项目内）

## 1. 目标与范围
- 本文件仅作用于当前项目：`/Users/victorsim/Desktop/Projects/learn_more_v1.0`
- 不同步到全局 `$CODEX_HOME`，除非后续评审通过
- 默认语言：简体中文
- 治理强度：轻量强制

## 2. 文档分工
- `/.codex/`：Agent 协作流程、模板、提示词迭代、特性雷达
- `/docs/stories/`：产品 Story 与任务卡
- `/docs/memory-bank/`：长期状态（`active_context.md`、`roadmap.md`、`progress.md`）

## 3. 轻量强制规则
- 新需求开始前，先创建 `/.codex/specs/YYYY-MM-DD-<short-slug>/`
- 每次任务结束必须执行 `/.codex/workflows/session-close-checklist.md`
- 仅回写关键结论到 `/docs/memory-bank/active_context.md` 与 `/docs/memory-bank/progress.md`
- 不要求把全过程复制到 `docs/`，避免双写

## 4. 失误记录协议（强制）
每次出现失误，必须在同一轮任务内记录并更新规则，格式如下：

```md
## [YYYY-MM-DD] 失误名称
- 场景：
- 影响：
- 根因：
- 新规则：
- 防复发检查项：
- 示例（正确做法）：
- 生效日期：
```

约束：
- 没有“新规则”的失误记录视为无效
- 新规则应可执行、可检查，避免抽象口号

## 5. 周期回顾
- 每周回顾 `/.codex/features/radar.md`
- 每两周评估是否将稳定规则上升到全局配置
