# P0 异常后台请求审计（T-007）

> 目标：定位并修复空闲状态下的异常请求，重点关注 `GET /api/auth/impersonate/status` 与 `POST /admin/feedback`。

## 修复前观测
| request | source_component | trigger_condition | interval/frequency | idle_1m_count | idle_3m_count | expected_or_not | evidence |
|---|---|---|---|---|---|---|---|
| `GET /api/auth/impersonate/status` | `ImpersonateBannerWrapper`（全局 layout 挂载） | 页面挂载即触发，且不区分路径/可见性/是否伪装 | 首次 + 每 30 秒 | 待补 | 待补 | 非预期（非伪装态也持续） | 代码定位：`src/app/layout.tsx` + `src/components/admin/users/ImpersonateBannerWrapper.tsx` |
| `POST /admin/feedback` | `NotificationBell`（Server Action 轮询） | 页面挂载后持续拉通知，命中当前路由 POST | 首次 + 每 60 秒 | 待补 | 待补 | 非预期（空闲态噪音请求） | 代码定位：`src/components/layout/dashboard-layout.tsx` + `src/components/notification/NotificationBell.tsx` + `src/actions/notification/core.ts` |
| `POST /dashboard/practice` | `PracticeView` + `AnalyticsSidebar`（客户端 `useEffect` 调用 Server Action） | practice 首屏挂载后多个组件并发调用读取 Action | 首次进入集中触发 | 待补 | 待补 | 非预期（页面路径噪音请求） | 代码定位：`src/components/practice/**` |
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

## 修复后观测
| request | source_component | trigger_condition | interval/frequency | idle_1m_count | idle_3m_count | result | evidence |
|---|---|---|---|---|---|---|---|
| `GET /api/auth/impersonate/status` | `ImpersonateBannerWrapper` | 进入 `/admin|/dashboard` 后首次检查；仅伪装中且页面可见才 30 秒轮询 | 条件触发 | 待补 | 待补 | 已收敛 | 代码变更见 FIX-001 |
| `POST /admin/feedback` | `NotificationBell` | 不再使用轮询型 Server Action | 0（预期） | 待补 | 待补 | 已修复（待日志补证） | 代码变更见 FIX-002 |
| `GET /api/notifications/summary` | `NotificationBell` | 仅下拉展开时触发 | 条件触发（关闭下拉应为 0） | 待补 | 待补 | 已收敛（待日志补证） | 代码变更见 FIX-003 |
| `POST /dashboard/practice` | `PracticeView` + `AnalyticsSidebar` | 不再由客户端 Server Action 触发 | 0（预期） | 待补 | 待补 | 已修复（待日志补证） | 代码变更见 FIX-004 |
| `GET /api/practice/bootstrap` + `GET /api/practice/subject-data` | `PracticeView` | 首屏 1 次 + 切科目 1 次 | 条件触发 | 待补 | 待补 | 已收敛（待日志补证） | 代码变更见 FIX-004 |
| `GET /admin/permissions` 高频 | Admin Permissions 页面 | 取消强制动态后观测 | 待补 | 待补 | 待补 | 待补证 | 代码变更见 FIX-005 |

## 结论
- 是否完成异常请求闭环：`doing`（代码已完成，待补空闲观测证据）
- 是否满足 AC-05：`doing`（待 Network + Server log 1~3 分钟实测）
- 回归风险：practice 新增 GET API 链路与通知懒加载需要做一次端到端回归确认
