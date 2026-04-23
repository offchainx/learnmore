# d-05 执行台（admin）

## 1. 项目快照
- 状态：draft
- 上级 spec：[`../../spec.md`](../../spec.md)
- 当前目标：统一 admin 域的工具化 UI 语言

## 2. 当前冻结边界
- 保持后台专业、克制、可扫描
- 不复制 consumer 端的营销语气

## 3. 当前生效计划
1. 盘点 admin route 与高频页面
2. 冻结表格、筛选、详情页结构
3. 统一后台交互与状态态

## 4. 阶段进度
| phase | focus | status | note |
|---|---|---|---|
| P1 | route & priority | todo | 先高频后台页 |
| P2 | table / filter / detail | todo | admin 通用模式 |
| P3 | cross-admin polish | todo | 后台一致性收口 |

## 5. 执行任务表
| id | description | owner | status | link | notes |
|---|---|---|---|---|---|
| T-001 | 盘点 admin 主路径 | codex | todo | `../../harness/route-inventory.md` | users / content / feedback / rewards 等 |
| T-002 | 冻结后台高频模式 | codex | todo | - | 表格、筛选、drawer、detail |
| T-003 | 排定后台 rollout 顺序 | codex | todo | - | 先高频再长尾 |

## 6. 验收清单
- [ ] admin 主路径已盘点
- [ ] 高后台频交互模式已冻结
- [ ] admin 视觉语气与 consumer 有区分但共享基础系统

## 7. 关键决策
| date | decision | reason | impact |
|---|---|---|---|
| 2026-04-22 | admin 使用同一 token，但不同语气 | 避免维护两套设计系统，同时保证后台可读性 | 后续主要区别体现在密度和语气，不在基础系统层 |

## 8. 会话更新
| date | topic | summary | files | next |
|---|---|---|---|---|
| 2026-04-22 | 初始化 | 已建立 d-05 骨架 | `spec.md`, `tasks.md` | 盘点 admin 高优页面 |

## 9. 下一步
- 先锁 admin 高频页面清单
- 再归纳表格、筛选、详情等后台共性模式
