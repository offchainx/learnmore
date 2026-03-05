# 执行任务清单（Tasks）

| id | acceptance_ref | description | owner | status (todo/doing/done) | link (PR/commit) |
|---|---|---|---|---|---|
| T-001 | DOC | 重写 P0-02 的 spec.md 与 plan.md，并补齐接口契约 | codex | done |  |
| T-002 | DOC | 重写 acceptance.md，加入 Action 与数据表核对矩阵 | codex | done |  |
| T-003 | DOC | 新增 user/voucher 表格与字段逻辑核对工作项，并同步四件套文档 | codex | done |  |
| T-004 | GATE | 文档审阅与范围确认（用户确认前禁止开发） | user | done |  |
| T-005 | AC-01 | 实现登录/登出/刷新/跨标签会话一致性与受保护路由行为 | codex | done |  |
| T-006 | AC-04 | 调试/重构页面重定向路由（包含受保护路由），输出完整路由定向清单并修复错误定向 | codex | doing | main@9e66eb2, main@04a28ec, main@924c0cf, main@5d2fb92 |
| T-007 | AC-05 | 排查并修复 `/api/auth/impersonate/status` 异常调用与关联后台请求（含 `POST /admin/feedback`） | codex | done | main@932eefb + Playwright 空闲观测证据（2026-03-04） |
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
| T-006.2 | dashboard/* | 梳理并修复 `/dashboard/**` 重定向与会话保护行为 | doing | 已下线：`/dashboard/debug/ui-kit`、`/dashboard/knowledge-graph`、`/dashboard/practice/import`、`/dashboard/settings/notifications`、`/course/:subjectId`、`/course/:subjectId/:lessonId`、`/checkout/config`（workspace changes, 2026-03-04） |
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
- [x] `/dashboard/practice/import` 下线，路由改为显式 404（题目录入统一收口到内容管理）。
- [x] `/dashboard/settings/notifications` 下线为 404，通知设置统一收口到 `/dashboard/settings` 的通知 tab（通知中心入口改为 query tab）。
- [x] `/admin/content` 下线为 404，仅保留 `/admin/content/review` 作为内容审核入口。
- [x] `/course/:subjectId` 与 `/course/:subjectId/:lessonId` 下线为 404，课程入口统一收口到 `/dashboard/courses`。
- [x] `/checkout/config` 下线为 404，支付入口统一从 `/pricing` 直连 Stripe Checkout。
- [x] 完成 `src/app/**/page.tsx` 全量路由扫描（含保护/无保护）并更新 `受保护路由.md` 基线清单。
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
14. `/dashboard/practice/import` 下线为 404（题目录入统一收口到内容管理）。
15. `/dashboard/settings/notifications` 下线为 404，统一改为 `/dashboard/settings?tab=notifications`。
16. 完成全量页面路由扫描（保护/无保护），并补充“可能重复/可收口”候选清单。
17. `/admin/content` 下线为 404，并清理入口链接到 `/admin/content/review`。
18. `/course/:subjectId` 与 `/course/:subjectId/:lessonId` 下线为 404，统一课程入口为 `/dashboard/courses`。
19. `/checkout/config` 下线为 404，`/pricing` 改为直接调用 `prepareCheckoutAction` 发起支付。

## T-007 阶段进展（2026-03-04）
- [x] 根因定位完成：`ImpersonateBannerWrapper` 固定 30 秒轮询触发 `GET /api/auth/impersonate/status`。
- [x] 根因定位完成：`NotificationBell` 使用 Server Action 轮询，导致当前路由出现周期性 `POST /admin/feedback`。
- [x] 新增 `GET /api/notifications/summary`（只读通知拉取 API），替换轮询场景的 Server Action 调用。
- [x] `NotificationBell` 进一步收敛为“仅在通知下拉展开时请求/轮询”，空闲态不再自动请求通知摘要。
- [x] `ImpersonateBannerWrapper` 轮询收敛：仅在 `/admin` 或 `/dashboard` 路径、且页面可见时执行；非伪装态不持续轮询。
- [x] `useImpersonationState` 同步收敛，避免未来复用时重新引入高频轮询。
- [x] PWA 链路下线：移除 Service Worker 注册、安装提示、`sw.js`、`manifest.json`、`offline.html`，消除潜在前端自动更新干扰。
- [x] `/dashboard/practice` 客户端拉数改造：将多个客户端 Server Action 调用改为 GET API，消除批量 `POST /dashboard/practice` 噪音。
- [x] `/dashboard/practice` 请求聚合：新增 `GET /api/practice/bootstrap`（首屏一次）与 `GET /api/practice/subject-data`（切科目一次），收敛首屏多接口并发请求。
- [x] `/dashboard/leaderboard` 请求治理：首屏改服务端注入 + `GET /api/leaderboard/summary`，消除客户端多次 `POST /dashboard/leaderboard`。
- [x] `/dashboard/community` 请求治理：首屏改服务端注入 + `GET /api/community/feed`，消除客户端多次 `POST /dashboard/community`。
- [x] `/admin/users` 请求治理：首屏改服务端注入 + `GET /api/admin/users/list`，消除客户端多次 `POST /admin/users`。
- [x] `/admin/permissions` 去除 `force-dynamic` 强制动态标记，降低无必要重复动态渲染风险。
- [x] 轮询扫描：除上述两类外，其他 `setInterval` 主要为本地倒计时/动画。
- [x] 线下观测补证：已完成空闲 1-3 分钟 Network 观测并归档到 release 审计文档（2026-03-04，Playwright）。

## T-007 开发日志（逐步记录）
1. 扫描全仓 `setInterval/useEffect`，锁定异常请求触发链路。
2. 新增 `/api/notifications/summary` 只读接口，复用当前用户会话鉴权与通知查询逻辑。
3. 通知中心轮询改造为 GET API，避免向当前页面路径发送 Server Action POST。
4. 伪装状态轮询改造为“受保护路径 + 页面可见 + 伪装中”条件触发。
5. 通知中心继续收敛为“仅打开下拉时请求”，空闲态不再主动拉取摘要。
6. 下线 PWA 运行链路（SW/manifest/install prompt），避免潜在自动刷新干扰。
7. 将 practice 首页统计读取迁移到 GET API，清除页面路径 Server Action POST 噪音。
8. 新增 `practice/bootstrap + practice/subject-data` 聚合接口，实现“首屏一次请求 + 切科目一次请求”。
9. 新增 `leaderboard/summary` 聚合接口，并将排行榜首屏数据改为服务端注入，消除页面路径 POST 噪音。
10. 新增 `community/feed` 读取接口，并将学员社区首屏数据改为服务端注入，消除页面路径 POST 噪音。
11. 新增 `admin/users/list` 读取接口，并将用户列表首屏数据改为服务端注入，消除页面路径 POST 噪音。
12. 补充轮询全量扫描结论，记录“需要处理/可保留”边界。
13. 完成 Playwright 空闲态观测补证：`/dashboard`、`/dashboard/practice`、`/admin/permissions` 均未出现非预期周期性请求。

## 备注
- 执行顺序固定：`GATE -> AC-01 -> AC-04 -> AC-05 -> AC-02 -> AC-03`。
- 每个验收点都按 `实现 -> 本地验证 -> 预发复测` 闭环执行。
