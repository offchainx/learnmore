# ws-02 执行台（design contract and anti-patterns）

## 1. 项目快照
- 状态：todo
- 上级 spec：[`../../spec.md`](../../spec.md)
- 当前目标：基于 ws-01 的参考样板，冻结设计契约和 anti-pattern 黑名单

## 2. 当前冻结边界
- 先定义设计带宽，再定义精确 token
- 设计契约需要同时服务 v0 prompt 和真实前端实现
- 这一阶段以样板为依据，不空转抽象美学

## 3. 当前生效计划
1. 复核 ws-01 输出
2. 写出 anti-pattern 黑名单
3. 形成 `DESIGN.md` 或等价契约内容

## 4. 阶段进度
| phase | focus | status | note |
|---|---|---|---|
| P1 | 视觉方向冻结 | todo | 从 ws-01 样板中归纳 |
| P2 | anti-pattern 黑名单 | todo | 可直接给 v0 使用 |
| P3 | 设计契约文稿 | todo | 提供给 `ws-03` |

## 5. 执行任务表
| id | description | owner | status | link | notes |
|---|---|---|---|---|---|
| T-001 | 复核 ws-01 的样板结论 | codex | todo | - | 从 conversation ledger 和 v0 ledger 回填 |
| T-002 | 写 anti-pattern 黑名单 | codex | todo | - | 禁止 AI 味、过度 glow、Sparkles 等 |
| T-003 | 写设计契约主文稿 | codex | todo | - | 支持 v0 与真实实现 |

## 6. 验收清单
- [ ] 视觉方向已冻结
- [ ] anti-pattern 已列出并可执行
- [ ] 设计契约覆盖字体、颜色、圆角、阴影、动效、内容语气

## 7. 关键决策
| date | decision | reason | impact |
|---|---|---|---|
| 2026-04-22 | 先冻结带宽和禁用项，再落精确 token | 先保证方向正确，再保证数值一致 | 后续实现更少返工 |
| 2026-04-23 | 设计契约顺延到 ws-02 | 新 ws-01 先负责 v0 参考复刻与 prompt 协助 | design contract 以样板为依据 |

## 8. 会话更新
| date | topic | summary | files | next |
|---|---|---|---|---|
| 2026-04-23 | 顺延调整 | 已建立 ws-02 骨架，承接新的设计契约阶段 | `spec.md`, `tasks.md` | 等 `ws-01` 样板产出 |

## 9. 下一步
- 从 ws-01 输出提炼视觉问题样本
- 先冻结黑名单，再写设计契约正文
