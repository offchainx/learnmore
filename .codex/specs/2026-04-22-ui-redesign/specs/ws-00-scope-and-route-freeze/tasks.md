# ws-00 执行台（scope and route freeze）

## 1. 项目快照
- 状态：done
- 上级 spec：[`../../spec.md`](../../spec.md)
- 当前目标：冻结 route 覆盖和 must-keep 功能清单
- 当前进度：route inventory 已完整补齐，页面域归属已冻结

## 2. 当前冻结边界
- 先按 route cluster 盘点，不先按组件盘点
- 不在本阶段做视觉解决方案

## 3. 当前生效计划
1. 从 `src/app` 抽取 route 列表
2. 把 route 归属到页面域
3. 为高优先级 route 补 must-keep 功能和关键状态

## 4. 阶段进度
| phase | focus | status | note |
|---|---|---|---|
| P1 | route 抽取 | done | 已覆盖 marketing / dashboard / admin / auth / course / public-profile |
| P2 | 页面域归属 | done | 已对齐 `d-01 ~ d-07` |
| P3 | must-keep 功能冻结 | done | 已为后续 v0 prompt 提供输入 |

## 5. 执行任务表
| id | description | owner | status | link | notes |
|---|---|---|---|---|---|
| T-001 | 抽取现有 route 列表 | codex | done | `../../harness/route-inventory.md` | 已补全 51 条 URL |
| T-002 | 标记页面域归属 | codex | done | `../../harness/route-inventory.md` | 已归属到 `d-*` |
| T-003 | 冻结 must-keep 功能 | codex | done | `../../harness/route-inventory.md` | 已写入关键能力与状态 |

## 6. 验收清单
- [x] 主路径 route 已补齐
- [x] 每个 route 已归属页面域
- [x] P0 / P1 route 已标优先级
- [x] 高优 route 的 must-keep 功能已冻结

## 7. 关键决策
| date | decision | reason | impact |
|---|---|---|---|
| 2026-04-22 | 先用 route inventory 作为唯一主盘点表 | 防止页面域推进时漏页 | 后续所有域级任务都从该表取输入 |

## 8. 会话更新
| date | topic | summary | files | next |
|---|---|---|---|---|
| 2026-04-22 | 初始化 | 已建立 ws-00 骨架 | `spec.md`, `tasks.md` | 开始 route 抽取 |
| 2026-04-23 | route freeze complete | 已完成 51 条 URL 的 route inventory，并冻结页面域归属与 must-keep 功能 | `tasks.md`, `../../harness/route-inventory.md` | 进入新的 `ws-01` 做 v0 参考复刻 |

## 9. 下一步
- 进入 [`../ws-01-auth-onboarding-flow/tasks.md`](../ws-01-auth-onboarding-flow/tasks.md)
- 基于用户确认的 onboarding 流程继续冻结页面与状态边界
