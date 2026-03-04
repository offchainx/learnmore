# 执行任务清单（Tasks）

| id | acceptance_ref | description | owner | status (todo/doing/done) | link (PR/commit) |
|---|---|---|---|---|---|
| T-001 | DOC | 重写 P0-02 的 spec.md 与 plan.md，并补齐接口契约 | codex | done |  |
| T-002 | DOC | 重写 acceptance.md，加入 Action 与数据表核对矩阵 | codex | done |  |
| T-003 | DOC | 新增 user/voucher 表格与字段逻辑核对工作项，并同步四件套文档 | codex | done |  |
| T-004 | GATE | 文档审阅与范围确认（用户确认前禁止开发） | user | done |  |
| T-005 | AC-01 | 实现登录/登出/刷新/跨标签会话一致性与受保护路由行为 | codex | done |  |
| T-006 | AC-04 | 调试/重构页面重定向路由（包含受保护路由），输出完整路由定向清单并修复错误定向 | codex | doing | main@9e66eb2, main@04a28ec, main@924c0cf, main@5d2fb92 |
| T-007 | AC-05 | 排查并修复 `/api/auth/impersonate/status` 异常调用与关联后台请求（含 `POST /admin/feedback`） | codex | todo |  |
| T-008 | AC-01 | 本地验证 AC-01（Action 输入输出 + SQL 快照） | codex | todo |  |
| T-009 | AC-01 | 预发复测 AC-01（幂等/越权/跨标签一致性） | codex | todo |  |
| T-010 | AC-02 | 实现管理员伪装状态接口一致性（impersonate status <-> impersonation_sessions） | codex | todo |  |
| T-011 | AC-02 | 本地验证 AC-02（status 接口返回与表状态对齐） | codex | todo |  |
| T-012 | AC-02 | 预发复测 AC-02（过期/结束会话/无 token 场景） | codex | todo |  |
| T-013 | AC-03 | 梳理 user/voucher 字段映射矩阵（Prisma 字段 <-> DB 列名 <-> 业务规则） | codex | todo |  |
| T-014 | AC-03 | 本地核对 AC-03（voucher 可用性与核销幂等 SQL 证据） | codex | todo |  |
| T-015 | AC-03 | 预发复测与收尾（回滚演练 + 发布检查） | codex | todo |  |

## T-006 子任务清单（主任务 + 模块子任务）

> 说明：`T-006` 覆盖所有受保护路由，不拆分为每页独立顶层任务。

| sub-id | scope | description | status (todo/doing/done) | evidence |
|---|---|---|---|---|
| T-006.1 | admin/* | 梳理并修复 `/admin/**` 重定向与入口行为（含 `/admin` 管理员总览面板入口） | doing | `/admin` 入口与 admin 子路由收口：main@9e66eb2, main@04a28ec, main@924c0cf, main@5d2fb92 |
| T-006.2 | dashboard/* | 梳理并修复 `/dashboard/**` 重定向与会话保护行为 | todo |  |
| T-006.3 | auth + middleware | 统一 `/login`、`/register`、`redirectTo` 与 middleware 安全规则 | todo |  |

## T-006.1 阶段进展（2026-03-04）
- [x] `/admin` 从重定向入口改为真实管理员总览面板入口。
- [x] 侧边栏新增“管理仪表盘”，并统一站内 `admin` 导航入口到 `/admin`。
- [x] 移除重复编辑链路：删除 `/admin/content/[id]/edit` 路由与旧编辑组件（`QuestionEditorForm`、`QuestionReviewPanel`）。
- [x] 修复 `/admin/content/reports` 交互：首屏不自动弹出详情卡片；仅点击具体报错后弹出；支持遮罩点击与 `ESC` 关闭。
- [x] 修复 `/admin/content/reports` 文案本地化：全局语言为中文时页面文案显示中文。
- [x] `/admin/referrals` 接入统一 Admin 容器，补齐“用户管理 > 推荐关系”入口，并修复“点击反馈中心后用户管理分组折叠”问题。
- [x] `/admin/vouchers` 接入统一 Admin 容器并恢复侧边栏嵌套；内容管理分组匹配覆盖 `/admin/vouchers`。
- [x] `/admin/users` 修复列表区宽度收缩，页面内容改为全宽填充，消除右侧异常留白。
- [x] 调试页 `/dashboard/debug/ui-kit` 下线，路由改为显式 404。
- [x] `/dashboard/knowledge-graph` 下线，路由改为显式 404。
- [ ] 完成 `admin/**` 全量未登录重定向与已登录行为矩阵验证。

## T-006 开发日志（逐步记录）
1. `/admin` 改为真实管理员总览入口（停止重定向到 `/admin/content/review`）。
2. 侧边栏新增“管理仪表盘”入口并统一 admin 导航收口。
3. 清理重复编辑链路：移除 `/admin/content/[id]/edit` 与旧编辑 UI。
4. 修复 `/admin/content/reports` 首屏自动弹详情问题（改为点击后打开）。
5. `/admin/content/reports` 详情支持遮罩点击与 `ESC` 关闭。
6. 修复 reports 页本地化与刷新语言闪烁问题。
7. `/admin/referrals` 接入统一 Admin 容器并补齐“用户管理 > 推荐关系”入口。
8. 修复用户管理二级菜单折叠异常（点击反馈中心不再自动折叠分组）。
9. 接入 referrals V3 UI 仿真（筛选、分页、详情抽屉、状态样式统一）。
10. `/admin/vouchers` 接入统一 Admin 容器，恢复侧边栏嵌套与分组匹配。
11. `/admin/users` 修复列表主区域宽度收缩，消除右侧留白。
12. `/dashboard/debug/ui-kit` 下线为 404。
13. `/dashboard/knowledge-graph` 下线为 404。

## 备注
- 执行顺序固定：`GATE -> AC-01 -> AC-04 -> AC-05 -> AC-02 -> AC-03`。
- 每个验收点都按 `实现 -> 本地验证 -> 预发复测` 闭环执行。
