# ws-05 执行台（rollout governance and memory sync）

## 1. 项目快照
- 状态：todo
- 上级 spec：[`../../spec.md`](../../spec.md)
- 当前目标：定义 rollout 治理和 memory-bank 同步规则

## 2. 当前冻结边界
- 每个有效回合必须更新任务内 ledger
- 提交前仍由全局 `codex:close` + `pre-commit` 兜底

## 3. 当前生效计划
1. 冻结 rollout 门禁
2. 冻结任务内与全局保存规则
3. 冻结 memory-bank 回写策略

## 4. 阶段进度
| phase | focus | status | note |
|---|---|---|---|
| P1 | rollout 门禁 | todo | 何时允许切入域级实现 |
| P2 | 保存机制 | todo | 任务内 + 全局双轨制 |
| P3 | memory sync | todo | 明确回写时机 |

## 5. 执行任务表
| id | description | owner | status | link | notes |
|---|---|---|---|---|---|
| T-001 | 定义 rollout 启动门槛 | codex | todo | - | 与 `ws-00 ~ ws-04` 对齐 |
| T-002 | 冻结保存规则 | codex | todo | `../../harness/conversation-ledger.md` | 明确“有效回合” |
| T-003 | 冻结 memory-bank 回写规则 | codex | todo | `../../harness/memory-sync-checklist.md` | 对齐长期记忆 |

## 6. 验收清单
- [ ] rollout 门禁已成文
- [ ] 保存机制已成文
- [ ] memory-bank 回写规则已成文

## 7. 关键决策
| date | decision | reason | impact |
|---|---|---|---|
| 2026-04-22 | 保存采用任务内 + 全局双轨制 | 单靠 Git hook 无法解决对话级保存 | 任务上下文和全局提交链都可追溯 |
| 2026-04-23 | ws-05 顺延 | 负责最后的 rollout 与 memory sync 收口 | 适配新的前置 v0 流程 |

## 8. 会话更新
| date | topic | summary | files | next |
|---|---|---|---|---|
| 2026-04-23 | 顺延调整 | 已建立 ws-05 骨架 | `spec.md`, `tasks.md` | 跟随整体进度持续补充 |

## 9. 下一步
- 根据真实推进情况完善 rollout 门禁
- 视需要扩展 pre-commit 校验规则
