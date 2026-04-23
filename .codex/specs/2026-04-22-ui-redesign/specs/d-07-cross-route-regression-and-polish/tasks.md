# d-07 执行台（cross-route regression and polish）

## 1. 项目快照
- 状态：draft
- 上级 spec：[`../../spec.md`](../../spec.md)
- 当前目标：做跨页面域一致性回归和收尾打磨

## 2. 当前冻结边界
- 不再新增新方向，只做对齐、修正、验证和证据沉淀
- 以真实页面联动与多设备验证为准

## 3. 当前生效计划
1. 汇总跨域问题
2. 逐类回归验证
3. 统一证据与收尾标准

## 4. 阶段进度
| phase | focus | status | note |
|---|---|---|---|
| P1 | 问题聚合 | todo | 收集跨域 UI 漂移 |
| P2 | 回归验证 | todo | route、状态态、设备宽度 |
| P3 | 收尾证据 | todo | 截图、ledger、memory sync |

## 5. 执行任务表
| id | description | owner | status | link | notes |
|---|---|---|---|---|---|
| T-001 | 汇总跨域不一致项 | codex | todo | `../../harness/screenshots/` | 以页面证据为准 |
| T-002 | 执行多设备回归 | codex | todo | `../../harness/evidence/` | 覆盖 mobile / tablet / desktop |
| T-003 | 收口最终证据与 memory sync | codex | todo | `../../harness/memory-sync-checklist.md` | 回写长期结论 |

## 6. 验收清单
- [ ] 跨域问题已聚合
- [ ] 多设备回归已完成
- [ ] 最终证据与 memory sync 已完成

## 7. 关键决策
| date | decision | reason | impact |
|---|---|---|---|
| 2026-04-22 | d-07 专门承担跨域收口 | 防止每个域只看自己局部最优 | 最终一致性有明确归属 |

## 8. 会话更新
| date | topic | summary | files | next |
|---|---|---|---|---|
| 2026-04-22 | 初始化 | 已建立 d-07 骨架 | `spec.md`, `tasks.md` | 等前置页面域推进后启用 |

## 9. 下一步
- 后续从各页面域收集共性问题
- 建立最终回归与证据模板
