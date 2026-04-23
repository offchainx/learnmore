# v0 Prompt Ledger

> 每次真正调用 v0 前后都要更新本表，控制轮次、成本和差异。

| date | goal | input prompt file | output artifact | result summary | delta vs previous | next step | cost note |
|---|---|---|---|---|---|---|---|
| 2026-04-22 | 初始化 ledger | - | - | 尚未调用 v0 | - | 等 `ws-02` 冻结首轮 prompt pack | 未产生调用 |

## 使用规则
- `input prompt file` 优先指向 `harness/prompts/` 下的 markdown 文件
- `output artifact` 可写 v0 chat id、导出链接、截图路径或实现分支
- `delta vs previous` 只记录结构性提升，不记录纯微调
