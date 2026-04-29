# UI 重构总控台（Tasks）

## 1. 项目快照
- 任务名称：UI 重构总计划
- 当前状态：active
- 主阅读入口：本文件
- 总边界文档：[`spec.md`](./spec.md)
- 计划归档目录：[`codex-plans/`](./codex-plans)
- 运行台账目录：[`harness/`](./harness)
- 保存机制：任务内写 `harness/conversation-ledger.md`，全局写 `.codex/prompts/iteration-log.md`

## 2. 当前冻结边界
- 第一阶段只做 `Light-First`，不要求同步完成 dark mode
- 气质基准是 `编辑感产品`、`温暖教育`，不是泛 AI 工具站
- 受众是学生与家长平衡，不偏向单一群体
- 保留现有功能；除非你明确授权，否则不做功能下线
- 允许重做信息层级、模块顺序和页面节奏，但不改主要业务流程
- 游戏化只保留机制，不保留夸张的视觉和文案表达
- v0 先复刻一个用户满意的参考目标，再从样板反推 tokens、组件和真实落地

## 3. 当前生效计划
1. `ws-00` 已完成，route、页面域和 must-keep 功能已冻结
2. 进入新的 `ws-01`，先用 v0 复刻参考目标并协助 prompt 收口
3. 再完成 `ws-02`，基于样板冻结 design contract、anti-pattern 和参考输入
4. 之后执行 `ws-03`，产出首轮高价值 v0 prompt pack 和组合样板目标
5. 再执行 `ws-04`，把通过的方向下沉到 tokens、共享组件和 page shell
6. 最后执行 `ws-05`，负责 rollout、回写和变更治理
7. 页面域按 `d-01 ~ d-07` 分批落地，始终从总控 spec 取边界

## 4. 阶段进度
| spec | focus | status | note |
|---|---|---|---|
| `ws-00` | scope、route、must-keep 冻结 | done | 51 条 URL 已入库 |
| `ws-01` | v0 参考复刻、prompt 协助、样板提炼 | todo | 先磨出一版用户满意的前端 |
| `ws-02` | design contract、anti-pattern、参考母体 | todo | 基于样板收口 |
| `ws-03` | v0 prompt pack、组合样板、产物台账 | todo | 控制 v0 轮次与成本 |
| `ws-04` | tokenization、shared UI、page shell | todo | 从设计样板下沉到系统层 |
| `ws-05` | rollout、memory sync、治理 | todo | 负责全程收口 |
| `d-01` | marketing 域 | todo | 公共站点与营销页 |
| `d-02` | dashboard shell 域 | todo | 登录后主壳与导航 |
| `d-03` | practice 域 | todo | 练习主路径与深流程 |
| `d-04` | community 域 | todo | 社区列表、详情、发帖 |
| `d-05` | admin 域 | todo | 后台工具页 |
| `d-06` | auth and entry 域 | todo | login / register / reset / 入口页 |
| `d-07` | cross-route regression and polish | todo | 跨域回归和收尾 |

## 5. 执行任务表
### 子任务启动门禁
- [ ] 对应子 spec 的 `spec.md` 已写清目标、范围、风险、依赖
- [ ] 对应子 spec 的 `tasks.md` 已写清当前计划、任务表和验收清单
- [ ] 相关 route 与 must-keep 功能已登记到 `harness/route-inventory.md`
- [ ] 如涉及 UI 参考、截图或 prompt，已在 `harness/` 对应 ledger 预留记录
- [ ] 如本轮新增稳定结论，已同步到 `harness/conversation-ledger.md`

| id | description | owner | status | link | notes |
|---|---|---|---|---|---|
| T-000 | 初始化 UI 重构 spec/harness 极简结构 | codex | done | - | 已创建根目录、子 spec、`codex-plans/` 与 `harness/` |
| T-001 | 完成 route inventory 与 must-keep 功能盘点 | codex | done | `specs/ws-00-scope-and-route-freeze/` | 页面域推进前已完成 |
| T-002 | 冻结 auth / onboarding flow 并整理实施台账 | codex | done | `specs/ws-01-auth-onboarding-flow/` | 以 login/register -> legal -> profile -> dashboard 为主线 |
| T-003 | 冻结 design contract 与 anti-pattern 黑名单 | codex | todo | `specs/ws-02-design-contract-and-anti-patterns/` | 基于样板收口 |
| T-004 | 产出首轮 v0 prompt pack 与组合样板定义 | codex | todo | `specs/ws-03-v0-prompt-pack-and-composite-prototype/` | 控制 v0 成本 |
| T-005 | 把设计方向下沉到 token / shared UI / shell | codex | todo | `specs/ws-04-tokenization-and-shared-ui-foundation/` | 样板确认后才进入 |
| T-006 | 规划并执行页面域 rollout | codex | todo | `specs/d-01-marketing/` | 从域级 spec 分批推进 |
| T-007 | 建立 memory-bank 同步与收尾机制 | codex | todo | `specs/ws-05-rollout-governance-and-memory-sync/` | 收口与回顾使用 |

## 6. 验收清单
- [x] 只创建 `.codex/specs/2026-04-22-ui-redesign`，未误建 `22/4/26-ui redesign`
- [x] 根目录只保留 `spec.md` 与 `tasks.md`
- [x] 已创建 `codex-plans/` 并预留历史计划文件
- [x] 已创建 `harness/` 及其 ledger 与证据目录
- [x] 每个 `ws-*` 与 `d-*` 目录只包含 `spec.md` 与 `tasks.md`
- [x] `tasks.md` 已包含计划、任务、验收、决策、会话更新和下一步分区
- [x] `conversation-ledger.md` 已声明“每个有效回合”记录粒度
- [x] `memory-sync-checklist.md` 已显式指向 `docs/memory-bank/active_context.md` 和 `docs/memory-bank/progress.md`
- [x] `ws-00` 完成并冻结 route inventory
- [ ] `ws-01` 完成参考复刻样板与 prompt 收口
- [ ] `ws-02` 完成 design contract 与 anti-pattern
- [ ] `ws-03` 完成首轮 v0 prompt 与组合样板定义
- [ ] `ws-04` 完成 tokenization 与 shared UI foundation
- [ ] `ws-05` 完成 rollout governance 与 memory sync

## 7. 关键决策
| date | decision | reason | impact |
|---|---|---|---|
| 2026-04-22 | 新根目录规范化为 `2026-04-22-ui-redesign` | 避免 `22/4/26-ui redesign` 被系统解释为多级路径 | 后续所有 UI 重构 spec 统一挂在该目录下 |
| 2026-04-22 | 文档体系采用“极简双文档” | 用户最终只会主看 `tasks.md`，需要降低复杂度 | root/子 spec 都只保留 `spec.md` + `tasks.md` |
| 2026-04-22 | 新增 `codex-plans/` 单独保存计划快照 | 历史计划与当前生效计划应分离 | `tasks.md` 只保留当前摘要，不负责历史归档 |
| 2026-04-22 | 每个有效回合都写任务内 conversation ledger | Git hook 只能在提交时兜底，不能等价替代对话级保存 | UI 重构任务内的上下文可连续追踪 |

## 8. 会话更新
| date | topic | summary | files | next |
|---|---|---|---|---|
| 2026-04-22 | UI 重构 spec/harness 初始化 | 已确认极简双文档、`codex-plans/`、`harness/`、每个有效回合保存和子 spec 双层结构 | 根目录、子 spec、`harness/*`、`codex-plans/*` | 进入 `ws-00` 做 route 与 must-keep 盘点 |
| 2026-04-23 | ws-00 complete | route inventory 已完整补齐，页面域归属与 must-keep 功能已冻结 | `specs/ws-00-scope-and-route-freeze/tasks.md`, `harness/route-inventory.md` | 进入新的 `ws-01` 做 v0 参考复刻 |
| 2026-04-23 | task reorder | 将原 `ws-01 ~ ws-04` 顺延为 `ws-02 ~ ws-05`，并把 `ws-01` 先定义为参考复刻与 prompt 协助 | `spec.md`, `tasks.md`, `specs/ws-*` | 先推进新的 `ws-01` |
| 2026-04-28 | ws-01 repurpose | 用户确认不再推进 v0 线，ws-01 改成 auth / onboarding flow 实施台账 | `specs/ws-01-auth-onboarding-flow/` | 清理旧路径引用并继续推进 onboarding |

## 9. 下一步
- 进入 [`specs/ws-01-auth-onboarding-flow/tasks.md`](./specs/ws-01-auth-onboarding-flow/tasks.md)
- 基于用户确认的 Novu 风格流程，继续推进 onboarding / auth 的实施细化
- 后续如需 prompt 或视觉样板，再单独开新工作单
