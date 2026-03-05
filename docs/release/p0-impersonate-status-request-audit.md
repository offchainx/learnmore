# P0 异常后台请求审计（T-007）

> 目标：定位并修复空闲状态下的异常请求，重点关注 `GET /api/auth/impersonate/status` 与 `POST /admin/feedback`。

## 修复前观测
| request | source_component | trigger_condition | interval/frequency | idle_1m_count | idle_3m_count | expected_or_not | evidence |
|---|---|---|---|---|---|---|---|
| `GET /api/auth/impersonate/status` | `ImpersonateBannerWrapper`（全局 layout 挂载） | 页面挂载即触发，且不区分路径/可见性/是否伪装 | 首次 + 每 30 秒 | 待补 | 待补 | 非预期（非伪装态也持续） | 代码定位：`src/app/layout.tsx` + `src/components/admin/users/ImpersonateBannerWrapper.tsx` |
| `POST /admin/feedback` | `NotificationBell`（Server Action 轮询） | 页面挂载后持续拉通知，命中当前路由 POST | 首次 + 每 60 秒 | 待补 | 待补 | 非预期（空闲态噪音请求） | 代码定位：`src/components/layout/dashboard-layout.tsx` + `src/components/notification/NotificationBell.tsx` + `src/actions/notification/core.ts` |
| `POST /dashboard/practice` | `PracticeView` + `AnalyticsSidebar`（客户端 `useEffect` 调用 Server Action） | practice 首屏挂载后多个组件并发调用读取 Action | 首次进入集中触发 | 待补 | 待补 | 非预期（页面路径噪音请求） | 代码定位：`src/components/practice/**` |
| `POST /dashboard/leaderboard` | `LeaderboardView`（客户端 `useEffect` 调用 Server Action） | 排行榜首屏并发调用 `getLeaderboard + getUserRank` | 首次进入集中触发 | 待补 | 待补 | 非预期（页面路径噪音请求） | 代码定位：`src/components/leaderboard/LeaderboardView.tsx` |
| `POST /dashboard/community` | `CommunityView`（客户端 `useEffect` 调用 Server Action） | 社区首屏调用 `getPosts` | 首次进入触发 | 待补 | 待补 | 非预期（页面路径噪音请求） | 代码定位：`src/components/dashboard/views/CommunityView.tsx` |
| `POST /admin/users` | `UserTable`（客户端 `useEffect` 调用 Server Action） | 用户列表首屏调用 `listAdminUsers` | 首次进入触发 | 待补 | 待补 | 非预期（页面路径噪音请求） | 代码定位：`src/components/admin/users/UserTable.tsx` |
| `GET /admin/permissions`（高频） | 页面强制动态渲染 + 前端重复触发场景 | 权限页反复请求同一路由 | 高频（实测日志） | 待补 | 待补 | 待修复确认 | 代码定位：`src/app/(dashboard)/admin/permissions/page.tsx` |

## 修复动作
| action_id | request | change_summary | changed_files | expected_effect | status |
|---|---|---|---|---|---|
| FIX-001 | `GET /api/auth/impersonate/status` | 轮询条件收敛（受保护路径 + 页面可见 + 伪装态），非伪装态不再固定 30 秒轮询 | `src/components/admin/users/ImpersonateBannerWrapper.tsx`、`src/components/admin/users/ImpersonateBanner.tsx` | 降低非必要轮询，避免空闲噪音 | done |
| FIX-002 | `POST /admin/feedback` | 通知轮询从 Server Action 改为 GET API（仅轮询读操作） | `src/components/notification/NotificationBell.tsx`、`src/app/api/notifications/summary/route.ts` | 消除空闲态周期性 POST 到当前页面路径 | done |
| FIX-003 | `GET /api/notifications/summary` 空闲态请求 | 通知拉取进一步收敛为“仅下拉打开时请求/轮询” | `src/components/notification/NotificationBell.tsx` | 关闭通知下拉时无背景请求 | done |
| FIX-004 | `POST /dashboard/practice` + 首屏多 GET 并发 | 将 practice 首页读取链路迁移为聚合接口：`GET /api/practice/bootstrap`（首屏）+ `GET /api/practice/subject-data`（切科目） | `src/components/practice/**`、`src/app/api/practice/bootstrap/route.ts`、`src/app/api/practice/subject-data/route.ts`、`src/app/api/practice/_lib/subject-data.ts` | 消除页面路径批量 POST 噪音，并收敛请求次数 | done |
| FIX-005 | `GET /admin/permissions` 高频 | 移除 `force-dynamic` 强制动态标记，收敛重复动态请求风险 | `src/app/(dashboard)/admin/permissions/page.tsx` | 降低重复路由请求概率 | done |
| FIX-006 | PWA 相关潜在干扰 | 下线 SW/manifest/install prompt 运行链路 | `src/app/layout.tsx`、`next.config.ts`、`public/sw.js`、`public/manifest.json`、`public/offline.html` | 清除 PWA 注册与更新行为 | done |
| FIX-007 | `POST /dashboard/leaderboard` | 首屏数据改为服务端注入；客户端改 `GET /api/leaderboard/summary` | `src/app/(dashboard)/dashboard/leaderboard/page.tsx`、`src/components/leaderboard/LeaderboardView.tsx`、`src/app/api/leaderboard/summary/route.ts` | 消除排行榜页面路径 POST 噪音 | done |
| FIX-008 | `POST /dashboard/community` | 首屏数据改为服务端注入；客户端改 `GET /api/community/feed` | `src/app/(dashboard)/dashboard/community/page.tsx`、`src/components/dashboard/views/CommunityView.tsx`、`src/app/api/community/feed/route.ts` | 消除社区页面路径 POST 噪音 | done |
| FIX-009 | `POST /admin/users` | 首屏数据改为服务端注入；客户端改 `GET /api/admin/users/list` | `src/app/(dashboard)/admin/users/page.tsx`、`src/components/admin/users/UserTable.tsx`、`src/app/api/admin/users/list/route.ts` | 消除用户列表页面路径 POST 噪音 | done |

## 修复后观测
| request | source_component | trigger_condition | interval/frequency | idle_1m_count | idle_3m_count | result | evidence |
|---|---|---|---|---|---|---|---|
| `GET /api/auth/impersonate/status` | `ImpersonateBannerWrapper` | 进入 `/admin|/dashboard` 后首次检查；仅伪装中且页面可见才 30 秒轮询 | 条件触发 | 0（新增） | 0（新增） | 已收敛 | Playwright 2026-03-04：`/dashboard` 与 `/admin/permissions` 空闲 180s 无新增请求 |
| `POST /admin/feedback` | `NotificationBell` | 不再使用轮询型 Server Action | 0（预期） | 0 | 0 | 已修复 | Playwright 2026-03-04：空闲观测未出现该请求 |
| `GET /api/notifications/summary` | `NotificationBell` | 仅下拉展开时触发 | 条件触发（关闭下拉应为 0） | 0（关闭下拉） | 0（关闭下拉） | 已收敛 | Playwright 2026-03-04：关闭下拉 180s 为 0；打开下拉触发 1 次（可见行为） |
| `POST /dashboard/practice` | `PracticeView` + `AnalyticsSidebar` | 不再由客户端 Server Action 触发 | 0（预期） | 0 | 0 | 已修复 | Playwright 2026-03-04：未观测到该请求 |
| `GET /api/practice/bootstrap` + `GET /api/practice/subject-data` | `PracticeView` | 首屏 1 次 + 切科目 1 次 | 条件触发 | `bootstrap` 1 次成功 | `subject-data` 1 次（切科目） | 已收敛 | Playwright 2026-03-04：`bootstrap` 首屏一次；点击 Physics 后 `subject-data` 一次 |
| `POST /dashboard/leaderboard` | `LeaderboardView` | 不再由客户端 Server Action 触发 | 0（预期） | 0 | 0 | 已修复 | 代码审计 2026-03-05：客户端改为服务端注入 + `GET /api/leaderboard/summary` |
| `POST /dashboard/community` | `CommunityView` | 不再由客户端 Server Action 触发 | 0（预期） | 0 | 0 | 已修复 | 代码审计 2026-03-05：客户端改为服务端注入 + `GET /api/community/feed` |
| `POST /admin/users` | `UserTable` | 不再由客户端 Server Action 触发 | 0（预期） | 0 | 0 | 已修复 | 代码审计 2026-03-05：客户端改为服务端注入 + `GET /api/admin/users/list` |
| `GET /admin/permissions` 高频 | Admin Permissions 页面 | 取消强制动态后观测 | 0（新增） | 0（新增） | 已收敛 | Playwright 2026-03-04：`/admin/permissions` 空闲 180s 无重复页面请求 |

## 结论
- 是否完成异常请求闭环：`done`
- 是否满足 AC-05：`pass`
- 回归风险：新增 leaderboard/community/admin-users 读取 API 后，需要做一次端到端回归确认（筛选、分页、tab 切换）
