# ws-03 执行台（v0 prompt pack and composite prototype）

## 1. 项目快照
- 状态：todo
- 上级 spec：[`../../spec.md`](../../spec.md)
- 当前目标：写出首轮高价值 v0 prompt，并冻结组合原型页的范围

## 2. 当前冻结边界
- 首轮只做组合原型页
- 每次 v0 调用前后必须更新 `../../harness/v0-prompt-ledger.md`
- prompt 必须基于 ws-01 和 ws-02 的结果，而不是空写

## 3. 当前生效计划
1. 写 prompt pack 模板
2. 冻结组合样板模块和验收口径
3. 执行首轮 v0 调用并记录

## 4. 阶段进度
| phase | focus | status | note |
|---|---|---|---|
| P1 | prompt pack | todo | 先离线打磨 |
| P2 | 组合样板定义 | todo | 页面块和组件块明确 |
| P3 | v0 ledger 首轮记录 | todo | 只在方向足够清晰时调用 |

## 5. 执行任务表
| id | description | owner | status | link | notes |
|---|---|---|---|---|---|
| T-001 | 编写首轮 prompt 模板 | codex | todo | `../../harness/prompts/` | 以 markdown 保存 |
| T-002 | 冻结组合样板范围 | codex | todo | `../../harness/v0-prompt-ledger.md` | 明确必须包含模块 |
| T-003 | 记录首轮 v0 调用 | codex | todo | `../../harness/v0-prompt-ledger.md` | 只记录结构性结果 |

## 6. 验收清单
- [ ] prompt pack 已成文
- [ ] 组合样板范围已冻结
- [ ] 首轮 v0 调用已在 ledger 中可追溯

## 7. 关键决策
| date | decision | reason | impact |
|---|---|---|---|
| 2026-04-22 | 首轮采用组合原型页 | 同时定品牌感与产品壳层，且轮次更省 | 后续从一个样板反推系统层 |
| 2026-04-23 | ws-03 顺延 | 当前阶段承接 ws-01 与 ws-02 的输出，再进入 prompt pack | prompt 更贴近真实样板 |

## 8. 会话更新
| date | topic | summary | files | next |
|---|---|---|---|---|
| 2026-04-23 | 顺延调整 | 已建立 ws-03 骨架 | `spec.md`, `tasks.md` | 等 `ws-01` 和 `ws-02` 完成输入 |

## 9. 下一步
- 等 ws-01 与 ws-02 输出稳定后写出首轮 prompt
- 准备 `harness/prompts/` 下的 prompt 文件模板
