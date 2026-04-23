# ws-04 执行台（tokenization and shared ui foundation）

## 1. 项目快照
- 状态：todo
- 上级 spec：[`../../spec.md`](../../spec.md)
- 当前目标：把通过的视觉方向转成 token、共享组件和 page shell

## 2. 当前冻结边界
- 先做系统层，再做域级页面套用
- 不改业务接口，只改视觉系统与前端实现层

## 3. 当前生效计划
1. 重整 token
2. 收敛共享 UI 组件
3. 冻结 page shell、loading、empty、error 模板

## 4. 阶段进度
| phase | focus | status | note |
|---|---|---|---|
| P1 | token 体系 | todo | 颜色、圆角、阴影、文字、动效 |
| P2 | shared UI | todo | Button / Input / Badge / Panel / Tabs 等 |
| P3 | shell & states | todo | 页面壳层与状态态模板 |

## 5. 执行任务表
| id | description | owner | status | link | notes |
|---|---|---|---|---|---|
| T-001 | 整理 token 差异与目标映射 | codex | todo | `../../harness/component-audit.md` | 先做设计映射 |
| T-002 | 收敛共享组件语义 | codex | todo | `../../harness/component-audit.md` | 优先高频组件 |
| T-003 | 冻结 page shell 与状态态模板 | codex | todo | - | 服务后续页面域落地 |

## 6. 验收清单
- [ ] token 已冻结为系统层能力
- [ ] 高优共享组件已收敛
- [ ] loading / empty / error 模板可复用

## 7. 关键决策
| date | decision | reason | impact |
|---|---|---|---|
| 2026-04-22 | 系统层先于页面层 | 避免各域重复造壳层和控件 | 降低后续页面域返工 |
| 2026-04-23 | ws-04 顺延 | 承接 ws-03 的样板输出，再做系统层下沉 | token 与 shell 更贴近样板 |

## 8. 会话更新
| date | topic | summary | files | next |
|---|---|---|---|---|
| 2026-04-23 | 顺延调整 | 已建立 ws-04 骨架 | `spec.md`, `tasks.md` | 等 `ws-03` 输出样板方向 |

## 9. 下一步
- 基于 v0 样板梳理 token 与共享组件改造表
- 优先处理 `Button`、`globals.css`、page shell
