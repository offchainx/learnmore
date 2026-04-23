# d-02 执行台（dashboard shell）

## 1. 项目快照
- 状态：draft
- 上级 spec：[`../../spec.md`](../../spec.md)
- 当前目标：统一登录后主壳层与导航语言

## 2. 当前冻结边界
- 不修改核心路由映射和业务流程
- 优先处理 shell、header、sidebar、bottom tab、search 和全局信息区

## 3. 当前生效计划
1. 冻结 desktop shell
2. 冻结 mobile shell
3. 把 shell 规则下沉到共享层

## 4. 阶段进度
| phase | focus | status | note |
|---|---|---|---|
| P1 | desktop shell | todo | dashboard-layout、sidebar、header |
| P2 | mobile shell | todo | bottom tab、mobile header |
| P3 | cross-state polish | todo | loading / empty / error 状态 |

## 5. 执行任务表
| id | description | owner | status | link | notes |
|---|---|---|---|---|---|
| T-001 | 盘点壳层组件 | codex | todo | `../../harness/component-audit.md` | 包含 sidebar/header/tab |
| T-002 | 冻结 desktop / mobile 壳层结构 | codex | todo | - | 优先登录后主路径 |
| T-003 | 规划壳层落地顺序 | codex | todo | - | 先 shell 后页面域 |

## 6. 验收清单
- [ ] shell 组件盘点已完成
- [ ] desktop / mobile 壳层结构已冻结
- [ ] 登录后壳层与新设计方向一致

## 7. 关键决策
| date | decision | reason | impact |
|---|---|---|---|
| 2026-04-22 | 壳层先于内容页 | 壳层是全域统一语法，优先级高于单页视觉 | 后续页面域复用成本更低 |

## 8. 会话更新
| date | topic | summary | files | next |
|---|---|---|---|---|
| 2026-04-22 | 初始化 | 已建立 d-02 骨架 | `spec.md`, `tasks.md` | 盘点 dashboard 壳层组件 |

## 9. 下一步
- 盘点 `dashboard-layout`、`BottomTabBar`、`MobileHeader`
- 冻结 dashboard shell 的 P0 must-keep 结构
