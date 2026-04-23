# d-06 执行台（auth and entry）

## 1. 项目快照
- 状态：draft
- 上级 spec：[`../../spec.md`](../../spec.md)
- 当前目标：统一 auth 和入口页的体验与表达

## 2. 当前冻结边界
- 保留 login / register / reset 主链路与现有认证方式
- 入口页要承接 marketing 与 app shell 两端气质

## 3. 当前生效计划
1. 盘点 auth route
2. 冻结 auth 页面 must-keep 表单与跳转
3. 统一入口页视觉和内容层级

## 4. 阶段进度
| phase | focus | status | note |
|---|---|---|---|
| P1 | route & form requirements | todo | login / register / reset |
| P2 | auth layout direction | todo | 可信、克制、过渡自然 |
| P3 | polish & regression | todo | 校验状态态与移动端 |

## 5. 执行任务表
| id | description | owner | status | link | notes |
|---|---|---|---|---|---|
| T-001 | 盘点 auth 路由和表单能力 | codex | todo | `../../harness/route-inventory.md` | 保留主链路 |
| T-002 | 冻结 auth 页面内容结构 | codex | todo | - | 明确主副信息层级 |
| T-003 | 规划入口页 rollout | codex | todo | - | 与 marketing / shell 协调 |

## 6. 验收清单
- [ ] auth 路由和表单能力已盘点
- [ ] must-keep 认证功能已冻结
- [ ] auth 页与 marketing / shell 的气质衔接明确

## 7. 关键决策
| date | decision | reason | impact |
|---|---|---|---|
| 2026-04-22 | auth 域单独成 spec | 入口页兼具品牌和产品桥接作用 | 需要独立处理语气和边界 |

## 8. 会话更新
| date | topic | summary | files | next |
|---|---|---|---|---|
| 2026-04-22 | 初始化 | 已建立 d-06 骨架 | `spec.md`, `tasks.md` | 盘点 auth 主链路 |

## 9. 下一步
- 先冻结 `/login`、`/register`、`/reset-password`
- 再定义入口页和 marketing / app shell 的过渡方式
