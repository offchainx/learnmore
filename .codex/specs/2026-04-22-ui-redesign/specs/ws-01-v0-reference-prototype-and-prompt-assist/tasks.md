# ws-01 执行台（v0 reference prototype and prompt assist）

## 1. 项目快照
- 状态：todo
- 上级 spec：[`../../spec.md`](../../spec.md)
- 当前目标：先用 v0 复刻参考目标，再回收一版满意前端的样板信息

## 2. 当前冻结边界
- 先让 v0 贴近用户参考目标，再谈系统化 token 和组件抽象
- 每次 v0 调用前后都要更新 `../../harness/v0-prompt-ledger.md`
- 保留既有功能；除非用户明确允许，不做功能下线

## 3. 当前生效计划
1. 拆解用户参考目标，明确要复刻的视觉与交互重点
2. 起草高质量 v0 prompt，尽量一次说清背景、约束和目标
3. 根据 v0 输出收集样板，并为后续 design contract 提供输入

## 4. 阶段进度
| phase | focus | status | note |
|---|---|---|---|
| P1 | 参考目标拆解 | todo | 先把“要像什么”说清楚 |
| P2 | prompt 协助 | todo | 生成可直接给 v0 的专业 prompt |
| P3 | 样板回收 | todo | 为 ws-02 预留抽取输入 |

## 5. 执行任务表
| id | description | owner | status | link | notes |
|---|---|---|---|---|---|
| T-001 | 拆解用户参考目标 | codex | todo | - | 明确必须复刻的视觉与交互重点 |
| T-002 | 起草首轮 v0 prompt | codex | todo | `../../harness/prompts/` | 要专业、紧凑、可执行 |
| T-003 | 回收 v0 输出样板 | codex | todo | `../../harness/v0-prompt-ledger.md` | 为后续 token / 组件抽取服务 |

## 6. 验收清单
- [ ] 参考目标已拆解为可执行约束
- [ ] 首轮 v0 prompt 已成文
- [ ] v0 输出已记录并可追溯
- [ ] 已形成可供后续抽取的样板输入

## 7. 关键决策
| date | decision | reason | impact |
|---|---|---|---|
| 2026-04-23 | 先用 v0 复刻参考目标，再从样板反推系统层 | 先拿到一版用户满意的前端，再抽象 token / 组件 / shell 更稳 | `ws-02` 之后的设计契约有真实样板支撑 |

## 8. 会话更新
| date | topic | summary | files | next |
|---|---|---|---|---|
| 2026-04-23 | ws-01 created | 新 ws-01 已改为 v0 参考复刻与 prompt 协助 | `spec.md`, `tasks.md` | 拆解用户参考目标 |

## 9. 下一步
- 先收集用户参考目标的视觉特征和必须保留点
- 再把这些约束组织成第一版 v0 prompt
