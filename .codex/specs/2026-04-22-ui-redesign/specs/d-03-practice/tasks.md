# d-03 执行台（practice）

## 1. 项目快照
- 状态：draft
- 上级 spec：[`../../spec.md`](../../spec.md)
- 当前目标：重构 practice 主路径与深交互训练流

## 2. 当前冻结边界
- 不改练习模式和后端契约
- 强化训练感和专注感，收敛过度装饰

## 3. 当前生效计划
1. 先重构 practice center
2. 再拆 smart drill / mock arena / past paper 等深流程
3. 最后统一结果态和分析面板

## 4. 阶段进度
| phase | focus | status | note |
|---|---|---|---|
| P1 | practice center | todo | 学科切换、模式入口、章节与试卷 |
| P2 | deep flows | todo | smart drill / mock arena / past paper |
| P3 | summaries & states | todo | 结果态、空态、错误态 |

## 5. 执行任务表
| id | description | owner | status | link | notes |
|---|---|---|---|---|---|
| T-001 | 盘点 practice route 与 must-keep 功能 | codex | todo | `../../harness/route-inventory.md` | 先补高优路径 |
| T-002 | 冻结 practice center 信息架构 | codex | todo | - | 作为 v0 样板重点 |
| T-003 | 规划深流程落地顺序 | codex | todo | - | 先最常用，再最复杂 |

## 6. 验收清单
- [ ] practice 主路径 route 盘点完成
- [ ] practice center must-keep 结构已冻结
- [ ] 深流程优先级已排定

## 7. 关键决策
| date | decision | reason | impact |
|---|---|---|---|
| 2026-04-22 | practice 作为产品主路径单独立 spec | 信息密度和深交互复杂度最高 | 后续需要单独跟踪与验收 |

## 8. 会话更新
| date | topic | summary | files | next |
|---|---|---|---|---|
| 2026-04-22 | 初始化 | 已建立 d-03 骨架 | `spec.md`, `tasks.md` | 进入 practice route 盘点 |

## 9. 下一步
- 优先冻结 `/dashboard/practice` 的 must-keep 模块
- 为组合样板定义 practice 输入块
