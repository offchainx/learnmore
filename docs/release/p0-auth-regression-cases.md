# P0 Auth 会话回归用例（AC-01 / AC-04 / AC-05）

## 用例映射
| case_id | 对应 AC | 对应任务 |
|---|---|---|
| 1-5 | AC-01 | T-005 / T-008 / T-009 |
| 6-8 | AC-04 | T-006 |
| 9-10 | AC-05 | T-007 |
| 11-14 | AC-04（回归） | T-006 / T-008 |
| 15-17 | AC-04（权限） | T-006 |
| 18-26 | AC-04（路由下线） | T-006 |
| 27-30 | AC-05（请求治理） | T-007 |

## AC-01 用例

### 用例 1：受保护路由回跳（redirectTo）
- Given：未登录用户直接访问 `/dashboard/practice`
- When：被重定向到 `/login?redirectTo=/dashboard/practice` 后登录成功
- Then：登录后应回到 `/dashboard/practice`，不是固定跳到 `/dashboard`

### 用例 2：登录成功后访问受保护路由
- Given：未登录用户
- When：登录成功并访问 `/dashboard`
- Then：正常进入 dashboard，不跳回 login

### 用例 3：显式登出
- Given：已登录用户
- When：点击退出
- Then：跳转 `/`，再次访问 `/dashboard` 会重定向 `/login`

### 用例 4：会话超时
- Given：已登录用户
- When：超过会话有效期后访问受保护页
- Then：重定向登录，并提示会话失效

### 用例 5：多标签页场景
- Given：同账号两个标签页
- When：标签页 A 登出后，标签页 B 发起请求
- Then：标签页 B 下次请求被重定向到登录

## AC-01 执行记录（2026-03-05）
- 测试账号：`ac01_20260305160426@learnmore.test`
- 执行环境 A（本地开发）：`http://localhost:3000`
- 执行环境 B（生产模式）：`pnpm build && pnpm start -p 3001`
- 用例 1：pass（未登录访问 `/dashboard/practice` 被拦截到 `/login?redirectTo=%2Fdashboard%2Fpractice`，登录后回跳成功）
- 用例 2：pass（登录后刷新 `/dashboard/practice`，URL 保持不变）
- 用例 3：pass（点击侧边栏“退出登录”回到 `/`，再次访问受保护路由被拦截）
- 用例 4：n/a（当前回归窗口未做真实超时等待，使用登出与受保护路由拦截替代）
- 用例 5：pass（双标签下 A 标签登出后，B 标签刷新跳转 `/login?redirectTo=%2Fdashboard%2Fpractice`）
- SQL 快照：同一账号 `users.sign_in_count` 从 `2` 增长到 `3`；`user_settings` 始终只有 `1` 条记录。
- 限制说明：Vercel 预发环境通过 MCP 查询时返回 `Auth required`，本轮以本地生产模式完成 `T-009` 等价复测。

## AC-02 执行记录（2026-03-05）
- 代码改动：`/api/auth/impersonate/status` 接入统一会话判定函数，新增 token/payload/session 三重一致性校验。
- 单测结果：`pnpm vitest run src/lib/impersonation/__tests__/status.test.ts`（6/6 通过）。
- 本地 API/SQL 对照：
  1. active 会话（`ended_at IS NULL && expires_at > now()`）=> `isImpersonating: true`
  2. ended 会话（`ended_at IS NOT NULL`）=> `isImpersonating: false`
  3. expired 会话（`expires_at < now()`）=> `isImpersonating: false`
  4. 无 token => `isImpersonating: false`
  5. token mismatch（payload 同 sessionId，但 token 与表中 token 不一致）=> `isImpersonating: false`
- 数据清理：所有临时会话已在脚本末尾删除（无残留测试数据）。
- 限制说明：云端预发仍受 `Auth required` 约束，本轮以本地生产模式做等价复测。

## AC-04 用例

### 用例 6：`/admin` 未登录保护与回跳
- Given：未登录用户访问 `/admin`
- When：进入登录页并完成登录
- Then：登录后回到 `/admin`，且保留原始 `redirectTo`

### 用例 7：`/admin` 登录后直达总览面板
- Given：已登录且具备权限的管理员用户
- When：访问 `/admin`
- Then：进入管理员总览面板，不重定向到 `/admin/content/review`

### 用例 8：已登录用户访问 `/login` 或 `/register`
- Given：已登录用户
- When：访问 `/login` 或 `/register`
- Then：按 `redirectTo` 或默认 `/dashboard` 跳转

## AC-05 用例

### 用例 9：空闲态异常请求观测（1-3 分钟）
- Given：用户未点击任何前端按钮，页面保持空闲
- When：观测浏览器 Network 与服务端日志
- Then：`POST /admin/feedback` 非预期周期请求应消除

### 用例 10：`/api/auth/impersonate/status` 轮询频率校验
- Given：页面空闲状态
- When：观测 `GET /api/auth/impersonate/status` 请求频率
- Then：频率符合设计，且不存在多余触发源

## AC-04 回归保护用例（关键路由不退化）

### 用例 11：`/admin/content/review` 不退化
- Given：已登录管理员
- When：访问 `/admin/content/review`
- Then：页面可正常访问，行为与修复前一致

### 用例 12：`/admin/feedback` 不退化
- Given：已登录管理员
- When：访问 `/admin/feedback`
- Then：页面可正常访问，且无非预期空闲态周期 POST

### 用例 13：`/admin/users` 不退化
- Given：已登录管理员
- When：访问 `/admin/users`
- Then：页面可正常访问，列表与操作入口不退化，且列表区域全宽展示无异常右侧留白

### 用例 14：`/admin/vouchers` 不退化
- Given：已登录管理员
- When：访问 `/admin/vouchers`
- Then：页面应通过统一 Admin 容器渲染，侧边栏可见且“内容管理”分组保持一致

## AC-04 权限矩阵用例

### 用例 15：ADMIN 访问 `/admin`
- Given：ADMIN 角色账号
- When：访问 `/admin`
- Then：进入管理员总览面板并可见全量模块

### 用例 16：TEACHER 访问 `/admin`
- Given：TEACHER 角色账号
- When：访问 `/admin`
- Then：进入管理员总览面板，但安全/伪装敏感区块隐藏

### 用例 17：其他角色访问 `/admin`
- Given：非 ADMIN/TEACHER 角色账号
- When：访问 `/admin`
- Then：重定向到 `/dashboard`

## AC-04 调试路由下线用例

### 用例 18：`/dashboard/debug/ui-kit` 已下线
- Given：任意登录态用户
- When：访问 `/dashboard/debug/ui-kit`
- Then：页面直接返回 404，不再暴露调试 UI Kit 页面

### 用例 19：`/dashboard/knowledge-graph` 已下线
- Given：任意登录态用户
- When：访问 `/dashboard/knowledge-graph`
- Then：页面直接返回 404，不再作为业务可访问路由

### 用例 20：`/dashboard/practice/import` 已下线
- Given：任意登录态用户
- When：访问 `/dashboard/practice/import`
- Then：页面直接返回 404；题目录入应统一走 `/admin/content/import`

### 用例 21：`/dashboard/settings/notifications` 已下线
- Given：任意登录态用户
- When：访问 `/dashboard/settings/notifications`
- Then：页面直接返回 404；不再保留独立通知设置页

### 用例 22：通知设置统一收口到 settings tab
- Given：任意登录态用户
- When：从通知中心点击“通知设置”
- Then：跳转到 `/dashboard/settings?tab=notifications` 并展示通知偏好矩阵（统一保存入口）

### 用例 23：`/admin/content` 已下线
- Given：已登录管理员
- When：访问 `/admin/content`
- Then：页面直接返回 404；内容审核入口仅保留 `/admin/content/review`

### 用例 24：`/course/:subjectId` 已下线
- Given：任意登录态用户
- When：访问 `/course/任意学科ID`
- Then：页面直接返回 404；课程入口统一走 `/dashboard/courses`

### 用例 25：`/course/:subjectId/:lessonId` 已下线
- Given：任意登录态用户
- When：访问 `/course/任意学科ID/任意课时ID`
- Then：页面直接返回 404；课程入口统一走 `/dashboard/courses`

### 用例 26：`/checkout/config` 已下线
- Given：任意登录态用户
- When：访问 `/checkout/config`
- Then：页面直接返回 404；支付入口统一由 `/pricing` 直接发起 checkout action

## AC-05 请求治理扩展用例（T-007）

### 用例 27：未打开通知下拉时不触发通知摘要请求
- Given：登录用户停留在 `/dashboard` 或 `/admin` 任一页面
- When：空闲 1-3 分钟且不点击通知铃铛
- Then：不应持续出现 `GET /api/notifications/summary?limit=10`

### 用例 28：打开通知下拉后才触发通知摘要请求
- Given：登录用户停留在后台页面
- When：点击通知铃铛打开下拉
- Then：触发 `GET /api/notifications/summary?limit=10`，关闭下拉后停止轮询

### 用例 29：`/dashboard/practice` 不再出现页面路径 POST 噪音
- Given：登录用户访问 `/dashboard/practice`
- When：页面首屏加载并空闲观察
- Then：不应出现批量 `POST /dashboard/practice`；首屏仅触发 `GET /api/practice/bootstrap`，切换科目仅触发 `GET /api/practice/subject-data?subjectId=...`

### 用例 30：`/admin/permissions` 路由请求频率收敛
- Given：登录 ADMIN 用户访问 `/admin/permissions`
- When：页面空闲观察 1-3 分钟
- Then：不应出现异常高频 `GET /admin/permissions` 请求

### 用例 31：`/dashboard/leaderboard` 首屏不再出现页面路径 POST 噪音
- Given：登录用户访问 `/dashboard/leaderboard`
- When：页面首屏加载并空闲观察
- Then：不应出现多次 `POST /dashboard/leaderboard`；读取应为服务端注入或单次 `GET /api/leaderboard/summary`

### 用例 32：`/dashboard/community` 首屏不再出现页面路径 POST 噪音
- Given：登录用户访问 `/dashboard/community`
- When：页面首屏加载并空闲观察
- Then：不应出现多次 `POST /dashboard/community`；读取应为服务端注入或单次 `GET /api/community/feed`

### 用例 33：`/admin/users` 首屏不再出现页面路径 POST 噪音
- Given：登录 ADMIN/TEACHER 访问 `/admin/users`
- When：页面首屏加载并空闲观察
- Then：不应出现多次 `POST /admin/users`；读取应为服务端注入或单次 `GET /api/admin/users/list`
