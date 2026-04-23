# Harness 使用说明

本目录只负责 UI 重构过程中的运行材料、证据、ledger 和 prompt 跟踪，不承担稳定边界定义。

## 文件用途
- `conversation-ledger.md`
  - 记录每个有效回合的新结论、涉及文件和下一步
- `route-inventory.md`
  - 记录 route、must-keep 功能、页面域归属和目标状态
- `screen-inventory.md`
  - 记录关键页面、设备尺寸、截图需求和证据位置
- `component-audit.md`
  - 记录共享组件问题、迁移归属和替换状态
- `v0-prompt-ledger.md`
  - 记录每次 v0 交互的目标、输入、结果和差异
- `implementation-ledger.md`
  - 记录各页面域切换到新 UI 的实施轨迹
- `memory-sync-checklist.md`
  - 记录何时需要回写 `docs/memory-bank`

## 子目录用途
- `prompts/`：保存 v0 / Codex 定稿 prompt
- `screenshots/`：保存参考图、验收图和前后对比图
- `evidence/`：保存 JSON、日志、检查结果等证据
- `ledgers/`：保存结构化辅助表或脚本生成产物

## 更新规则
- 只要这轮对话产生了新结论、边界变化、计划更新或关键决策，就必须追加 `conversation-ledger.md`
- 只要使用 v0，就必须更新 `v0-prompt-ledger.md`
- 只要进入具体页面域实现，就必须更新 `implementation-ledger.md`
- 需要长期记忆的结论，不直接写在本目录，而是按 `memory-sync-checklist.md` 回写 `docs/memory-bank`
