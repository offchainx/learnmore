# 技术方案（Plan）

## 概览
- 子任务：P0-02 Auth 会话稳定性回归
- 方案摘要：回归认证与会话生命周期，覆盖登录、登出、超时、跨标签与伪装状态查询；补充全受保护路由重定向治理、异常后台请求排查，以及 user/voucher 表格与字段逻辑核对。
- 执行原则：先文档、后开发；未获用户确认前禁止进入实现。

## 强制门禁（本任务必须满足）
1. 完成 spec.md、plan.md、tasks.md、acceptance.md 四件套并通过审阅。
2. 明确 Server Action 或接口契约：输入校验、输出结构、错误结构、幂等与并发策略。
3. 明确数据落表点：逐表列出关键字段与校验 SQL。
4. 验证环境固定为 本地 + 预发，两轮都要留下证据。
5. 完成 user/voucher 字段映射核对（Prisma 字段 <-> DB 列名 <-> 业务逻辑）。
6. 完成路由重定向清单（路由分类、预期跳转、实际行为、修复项）。
7. 完成异常后台请求清单（请求来源、触发条件、频率、是否预期、修复策略）。
8. 统一前后端边界：前端管理员总览面板由 AI Studio 生成，仓库内只做契约接入，不改业务语义。

## Server Action / 接口契约清单
| Action/接口 | 调用入口 | 输入与校验 | 输出与错误 | 幂等/并发策略 | 审计字段 |
|---|---|---|---|---|---|
| loginAction | 登录表单提交 | 邮箱密码格式校验 | 成功跳 dashboard，失败返回错误 | 重复提交不产生异常状态 | userId、action、result、timestamp |
| logoutAction | 退出按钮 | 已登录用户触发 | 清理会话并跳转首页 | 多次调用结果一致 | userId、action、result、timestamp |
| GET /api/auth/impersonate/status | Admin 伪装 Banner 轮询 | token 校验 | 返回 isImpersonating 状态 | 多次查询只读 | sessionId、targetUserId、result |
| middleware redirect guard | 访问受保护路由 | pathname + 登录态校验 | 未登录跳 login 并携带 redirectTo | 相同输入输出一致 | route、redirectTo、result |

## 数据落表点与核对范围
| 相关表 | 关键字段 | 读/写 | 触发场景 | 核对方式 |
|---|---|---|---|---|
| users | status、subscriptionTier(`subscription_tier`) | 读/写 | 登录后读取与状态校验 | 用户状态与路由行为一致性核对 |
| impersonation_sessions | endedAt(`ended_at`)、expiresAt(`expires_at`)、targetUserId(`target_user_id`) | 读 | 伪装状态查询 | API 返回值与表状态对齐 |
| user_feedbacks | id、status、updated_at | 读 | 排查异常 `POST /admin/feedback` 请求链路 | 请求来源与 DB 变化一致性核对 |
| user_settings | userId(`user_id`)、language、theme | 写 | 用户同步兜底 | upsert 行为核对 |
| voucher_codes | isActive(`is_active`)、validFrom(`valid_from`)、validTo(`valid_to`)、maxRedemptions(`max_redemptions`)、redeemedCount(`redeemed_count`) | 读/写 | 下单前优惠券可用性校验 | 可用性判定与阈值逻辑核对 |
| voucher_redemptions | voucherId(`voucher_id`)、userId(`user_id`)、stripeSessionId(`stripe_session_id`)、appliedAmount(`applied_amount`) | 写 | 首次支付核销与重放幂等 | 单用户单会话不重复核销 |

## 路由定向与异常请求核对清单（新增）
| 主题 | 核对对象 | 输出内容 | 验证方式 |
|---|---|---|---|
| 路由重定向 | `/dashboard/**`, `/admin/**`, `/login`, `/register` | 路由分类 + 预期重定向 + 实际重定向 + 修复项 | Playwright 跳转证据 + middleware 规则核对 |
| 异常后台请求 | `GET /api/auth/impersonate/status`, `POST /admin/feedback` | 请求触发源 + 频率 + 是否预期 + 修复结论 | 浏览器 Network + 服务器日志对齐 |

## T-006 执行章节（全受保护路由重定向治理）

### 审计来源
1. `.codex/specs/2026-02-09-release-p0-public-paid/p0-02-auth-session-regression/受保护路由.md`
2. 仓库实际路由扫描（`src/app/**/page.tsx`）
3. middleware 与 auth 页面实际行为

### 子任务顺序
1. `T-006.1`：`/admin/**` 路由组（含 `/admin` 改为管理员总览面板入口）
2. `T-006.2`：`/dashboard/**` 路由组
3. `T-006.3`：`/login`、`/register`、`redirectTo`、middleware 安全规则

### 默认修复策略
1. 统一 middleware 受保护路由判定与 redirectTo 安全校验。
2. `/admin` 从“重定向页”调整为“真实管理员总览面板入口页”。
3. 重复路由直接下线为显式 404，不做隐式兼容跳转（已确认：`/admin/content`、`/checkout/config`、`/course/**`）。

### 当前进展（2026-03-04）
1. `/admin` 入口已完成改造：已登录进入管理员总览面板，不再跳转 `/admin/content/review`。
2. 侧边栏已新增“管理仪表盘”入口，并将应用内 `admin` 导航统一收口至 `/admin`。
3. 编辑链路已合并：`/admin/content/[id]/edit` 与旧编辑 UI 已移除，统一入口为 `/admin/content/review/[questionId]`。
4. `/admin/content/reports` 交互已修复：首屏不自动弹出详情卡片，仅点击报错后弹出，支持遮罩点击与 `ESC` 关闭。
5. `/admin/content/reports` 本地化已修复：页面文案按全局语言渲染（中文优先）。
6. `/admin/referrals` 已接入统一 Admin 容器，补齐“用户管理 > 推荐关系”菜单入口，并修复点击反馈中心后分组折叠的问题。
7. `/admin/vouchers` 已接入统一 Admin 容器，页面恢复侧边栏嵌套，且内容管理分组匹配已覆盖 `/admin/vouchers`。
8. `/admin/users` 已修复布局宽度收缩问题，列表区改为全宽填充，消除右侧留白。
9. `/dashboard/debug/ui-kit` 已下线，路由改为显式 404，调试入口不再作为业务路径。
10. `/dashboard/knowledge-graph` 已下线，路由改为显式 404。
11. `/dashboard/practice/import` 已下线，路由改为显式 404（题目录入统一收口到内容管理）。
12. `/dashboard/settings/notifications` 已下线，路由改为显式 404；通知设置统一收口到 `/dashboard/settings` 的通知 tab，通知中心入口同步改链。
13. 已完成 `src/app/**/page.tsx` 全量路由扫描（保护/无保护）并更新 `受保护路由.md`，新增“可能重复/可收口”候选清单。
14. `/admin/content` 已下线为显式 404，内容管理入口统一保留 `/admin/content/review`。
15. `/course/:subjectId` 与 `/course/:subjectId/:lessonId` 已下线为显式 404，课程入口统一收口到 `/dashboard/courses`。
16. `/checkout/config` 已下线为显式 404，`/pricing` 改为直连 `prepareCheckoutAction` 发起 Stripe Checkout。
17. `T-006.1` 仍在进行：待补齐 `admin/**` 全量未登录重定向与已登录行为矩阵验证及证据归档。

### T-006 执行日志（逐步记录）
1. `/admin` 入口改为真实管理员总览页。
2. 侧边栏新增“管理仪表盘”，统一 admin 入口导航。
3. 删除重复编辑链路 `/admin/content/[id]/edit` 与旧编辑组件。
4. 修复 `/admin/content/reports` 首屏自动弹详情。
5. reports 详情支持遮罩点击与 `ESC` 关闭。
6. reports 页面本地化修复，并解决刷新语言闪烁。
7. `/admin/referrals` 接入统一 Admin 容器与侧边栏入口。
8. 修复“用户管理”二级菜单在反馈中心点击后折叠问题。
9. 接入 referrals V3 UI 仿真并对齐现有数据契约。
10. `/admin/vouchers` 接入统一 Admin 容器与内容分组匹配。
11. `/admin/users` 页面全宽布局修复，消除右侧留白。
12. `/dashboard/debug/ui-kit` 下线为 404。
13. `/dashboard/knowledge-graph` 下线为 404。
14. `/dashboard/practice/import` 下线为 404（题目录入统一收口到内容管理）。
15. `/dashboard/settings/notifications` 下线为 404，通知设置统一改为 `/dashboard/settings?tab=notifications`。
16. 完成 `src/app/**/page.tsx` 全量路由扫描（保护/无保护）并更新路由基线文档。
17. `/admin/content` 下线为 404，并将入口链接统一到 `/admin/content/review`。
18. `/course/:subjectId` 与 `/course/:subjectId/:lessonId` 下线为 404，统一课程入口为 `/dashboard/courses`。
19. `/checkout/config` 下线为 404，`/pricing` 改为直接调用 `prepareCheckoutAction` 发起支付。

## T-007 执行章节（异常后台请求排查与修复）

### 根因定位维度
1. 组件触发源（`useEffect`、`setInterval`、页面挂载行为）
2. 请求路径与方法（`GET /api/auth/impersonate/status`、`POST /admin/feedback`）
3. 触发条件（路径、登录态、cookie、页面可见性）
4. 请求频率与是否预期

### 默认修复策略
1. `ImpersonateBannerWrapper` 轮询条件收敛：按路径、页面可见性、伪装 cookie 控制。
2. 通知轮询改为 GET API，避免周期性 Server Action POST 到当前页面路径。
3. 保留写操作继续走 Server Action，避免破坏权限与审计链路。

### 当前执行记录（2026-03-04）
1. 已新增 `GET /api/notifications/summary` 并接入 `NotificationBell`，轮询链路不再走 Server Action。
2. 已收敛 `NotificationBell`：仅在通知下拉打开时请求并轮询，关闭后停止请求。
3. 已收敛 `ImpersonateBannerWrapper` 轮询：仅在 `/admin|/dashboard`、页面可见且伪装中时才保留周期检查。
4. 已补充 `useImpersonationState` 同类收敛，规避未来复用产生重复轮询。
5. 已新增 practice 读取类 GET API（subjects/chapters/papers/hive/forecast），替换 `/dashboard/practice` 页面上的客户端 Server Action POST 链路。
6. 已下线 PWA 运行链路（Service Worker 注册、Install Prompt、`sw.js`、`manifest.json`、`offline.html`）。
7. 已移除 `/admin/permissions` 的 `force-dynamic` 强制动态标记，降低重复动态渲染风险。
8. 待补：空闲 1~3 分钟 Network + Server log 证据并回填 release 审计文档。

## 锁定公共接口/类型（开发契约）
1. Server Action：`getAdminDashboardData(window: 'today_7d')`
2. 类型文件：`src/types/admin-dashboard.ts`
3. 可选 GET API：`GET /api/notifications/summary`（替代轮询型 Server Action）

## 权限策略（开发契约）
1. `ADMIN`：展示全部管理员模块。
2. `TEACHER`：隐藏安全与伪装敏感区块。
3. 其他角色：访问 `/admin` 时统一跳转 `/dashboard`。

## 前后端边界（锁定）
1. 前端管理员总览面板由 AI Studio 生成并按 props 契约接入。
2. 后端由仓库实现：
- 数据聚合与口径控制
- 角色权限分级（ADMIN / TEACHER / 其他）
- 数据映射与兜底
- 请求治理与日志观测

## 假设与默认值
1. `T-006` 采用“主任务 + 模块子任务”方式，不拆每页顶层任务。
2. `/admin` 作为管理员总览面板的真实入口页。
3. 面板时间窗口默认 `today_7d`（今日 + 近 7 天）。
4. 全部改动遵循现有 Next.js App Router + Server Action + Prisma + shadcn 规范。

## User/Voucher 字段映射核对清单（新增）
| 表 | Prisma 字段 | DB 列名 | 逻辑规则 | 核对 SQL（示例） |
|---|---|---|---|---|
| users | subscriptionTier, subscriptionStatus | subscription_tier, subscription_status | 登录后权限判断、路由放行必须使用同一口径 | SELECT id, subscription_tier, subscription_status FROM users WHERE id={{userId}}; |
| user_settings | userId, language, theme | user_id, language, theme | getCurrentUser 兜底同步后应保证一用户一条设置 | SELECT user_id, language, theme FROM user_settings WHERE user_id={{userId}}; |
| voucher_codes | isActive, validFrom, validTo, maxRedemptions, redeemedCount | is_active, valid_from, valid_to, max_redemptions, redeemed_count | 可用券判定需同时满足启用、时间窗口、次数上限 | SELECT code, is_active, valid_from, valid_to, max_redemptions, redeemed_count FROM voucher_codes WHERE code={{code}}; |
| voucher_redemptions | voucherId, userId, stripeSessionId, appliedAmount | voucher_id, user_id, stripe_session_id, applied_amount | 支付 webhook 重放不应重复写核销记录 | SELECT voucher_id, user_id, stripe_session_id, applied_amount FROM voucher_redemptions WHERE user_id={{userId}} ORDER BY created_at DESC LIMIT 5; |

## 验证步骤（固定流程）
1. 本地：先跑成功路径，再跑失败与越权路径，记录 Action 输入输出与 SQL 前后快照。
2. 预发：复测同一批关键场景，验证幂等与并发行为，确认结果一致。
3. 回归：执行受影响页面最小冒烟，确认无阻断。

## 风险与回滚
- 触发回滚：核心路径阻断、数据写入异常、重复写入导致脏数据。
- 回滚步骤：回滚任务提交 -> 恢复旧入口或旧行为 -> 重新执行本地与预发冒烟。
- 观测要求：日志可定位 userId、action、result、timestamp。

## 开发启动条件
- 仅当用户在文档审阅后明确批准，才允许切换到开发实施阶段。

## 开发改动清单（必填）

### 开发单元映射
| 开发单元 | 组件/页面 | Action/API | 数据落点 | 验证方式 |
|---|---|---|---|---|
| 登录 | login-form | loginAction | users | 正确/错误密码用例 |
| 登出 | dashboard 顶栏 | logoutAction | 会话 cookie + users 读取 | 多次登出一致性 |
| 会话读取 | 受保护页面 | getCurrentUser | users, user_settings | 跨标签页与刷新验证 |
| 路由重定向 | middleware + login page | redirect guard + redirectTo | users（鉴权读取） | 受保护/公开路由重定向矩阵 |
| 管理员总览入口 | `/admin` 页面 | admin dashboard route | users（鉴权读取） | `/admin` 非重定向到 content/review |
| 伪装状态 | ImpersonateBanner | GET /api/auth/impersonate/status | impersonation_sessions | token 正常/过期对比 |
| 异常请求排查 | Admin 相关页面 + 全局 layout | GET /api/auth/impersonate/status + POST /admin/feedback | impersonation_sessions, user_feedbacks（只读排查） | 空闲态网络请求与日志对齐 |
| user/voucher 字段核对 | 核对文档 | schema + SQL | users, user_settings, voucher_codes, voucher_redemptions | 字段映射 + 规则一致性检查 |

### 必改文件
- src/actions/user/auth.ts
- src/actions/admin/dashboard.ts
- src/app/api/auth/impersonate/status/route.ts
- src/app/api/notifications/summary/route.ts
- src/middleware.ts
- src/components/business/auth/login-form.tsx
- src/app/(auth)/login/page.tsx
- src/app/(dashboard)/admin/page.tsx
- src/components/admin/dashboard/AdminDashboardView.tsx
- src/types/admin-dashboard.ts
- src/components/admin/users/ImpersonateBannerWrapper.tsx
- src/app/(dashboard)/admin/feedback/page.tsx
- docs/release/p0-auth-regression-cases.md
- docs/release/p0-route-redirect-audit.md
- docs/release/p0-impersonate-status-request-audit.md
- docs/release/p0-user-voucher-field-matrix.md

### 主要接口 / Server Actions
- loginAction
- logoutAction
- getCurrentUser
- getAdminDashboardData(window: 'today_7d')
- GET /api/auth/impersonate/status
- GET /api/notifications/summary
- middleware redirect guard

### 主要数据表
- users
- user_settings
- impersonation_sessions
- user_feedbacks
- security_logs
- notifications
- voucher_codes
- voucher_redemptions

### 非目标
- 不改管理员权限模型。
- 不新增 voucher 折扣类型或计费规则。
- 不新增新的后台轮询任务，只修复非预期调用链路。

### 开发完成判定（DoD）
- 认证会话回归用例全部通过。
- 路由重定向审计清单完成并通过评审。
- `/api/auth/impersonate/status` 与 `POST /admin/feedback` 异常请求排查结论明确，并完成修复或标记为预期。
- 管理员总览面板接入完成，且权限分级（ADMIN/TEACHER/其他）行为正确。
- user/voucher 字段映射与逻辑核对文档通过审阅。
