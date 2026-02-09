# Codex 协作配置（项目内）

## 默认值
- 文档根目录：`/.codex/`
- 默认语言：简体中文
- 治理模式：轻量强制
- 生效范围：仅当前项目仓库

## 同步矩阵（什么时候更新什么）
1. 新任务启动
- 必做：创建 `/.codex/specs/YYYY-MM-DD-<slug>/`
- 必填：`spec.md`、`plan.md`、`tasks.md`、`acceptance.md`

2. 会话结束
- 必做：更新 `/.codex/prompts/iteration-log.md`（通过 `pnpm codex:close`）
- 可选：若有新能力评估，更新 `/.codex/features/radar.md`
- 必做：若有失误，更新 `/.codex/codex.md`

3. 任务完成
- 必做：回写关键结论到 `docs/memory-bank/active_context.md` 或 `docs/memory-bank/progress.md`

## 自动化命令
- `pnpm codex:close --context ... --prompt ... --result ... --worked ... --failed ... --improved ... --next ...`
- `pnpm codex:check`
- `pnpm codex:install-hooks`（安装 pre-commit 校验）

## 校验策略
- 当代码文件发生变更并准备提交时，`pnpm codex:check` 要求同一次提交中包含 `/.codex/prompts/iteration-log.md` 更新
- 如未更新，校验失败并阻断提交

## 例外场景
- 纯文档排版或纯注释修正：可跳过日志校验
- 依赖升级/脚手架更新：建议仍记录至少一条迭代日志
