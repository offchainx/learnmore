# 验收标准（Acceptance）

## 功能验收（Given / When / Then）
- AC-01 给定：有效账号
  当：登录、登出、刷新、跨标签操作
  则：会话状态与受保护路由行为一致。
- AC-02 给定：管理员伪装态
  当：请求 impersonate status 接口
  则：返回值与 impersonation_sessions 状态一致。
- AC-03 给定：已整理 users / user_settings / voucher_codes / voucher_redemptions 字段清单
  当：执行 Prisma 字段与 DB 列名、业务规则逐项核对
  则：字段命名、读写逻辑、幂等约束无冲突且有证据可追溯。
- AC-04 给定：页面路由定向清单
  当：访问受保护路由与公开路由（含 redirectTo）
  则：重定向行为符合预期，错误定向已修复且可复现验证。
- AC-05 给定：用户未点击任何前端按钮并保持页面空闲
  当：观测后台请求（重点 `/api/auth/impersonate/status` 与 `POST /admin/feedback`）
  则：异常请求来源明确，并完成修复或确认为预期行为。

## Server Action 验证矩阵（本地 + 预发都要执行）
| Action 名称 | 调用入口（页面/按钮/事件） | 输入样例（正常/异常） | 权限校验（未登录/越权） | 预期输出（成功/失败） | 幂等要求 | 日志与错误码 | 结果（pass/fail） | 证据 |
|---|---|---|---|---|---|---|---|---|
| loginAction | 登录页提交 | 正常：有效账号；异常：错误密码 | 未登录可访问 | 成功重定向；失败返回错误文案 | 重复点击不产生脏状态 | auth login error 日志 | pass | `pnpm vitest run src/actions/__tests__/auth.test.ts`（6/6 通过，含非法 `redirectTo` 回退与错误密码文案） |
| logoutAction | 顶栏退出 | 正常：已登录；异常：会话已失效 | 未登录调用应安全结束 | 都应回到首页 | 多次调用结果一致 | auth logout error 日志 | pass | `pnpm vitest run src/actions/__tests__/auth.test.ts`（登出成功/失败均重定向 `/`） + Playwright（2026-03-05） |
| GET /api/auth/impersonate/status | 管理端 banner 轮询 | 正常：有效 token；异常：过期/结束/token mismatch | 未授权 token 返回 false | 仅返回状态，不写库 | 查询幂等 | impersonate status 日志 | pass | `pnpm vitest run src/lib/impersonation/__tests__/status.test.ts`（6/6）+ 本地 API/SQL 对照脚本（2026-03-05） |

## 路由定向与后台请求验收矩阵（新增）
| 验收点 | 场景 | 观测对象 | 预期结果 | 结果（pass/fail） | 证据 |
|---|---|---|---|---|---|
| AC-04 | 未登录访问 `/dashboard/**` | URL 跳转 + `redirectTo` 参数 | 跳到 `/login?redirectTo=...` 且回跳路径正确 | pass | Playwright 2026-03-05：`/dashboard/practice -> /login?redirectTo=%2Fdashboard%2Fpractice`，登录后回跳原路径 |
| AC-04 | 未登录访问 `/admin/**` | URL 跳转 + `redirectTo` 参数 | 跳到 `/login?redirectTo=...` 且回跳路径正确 |  |  |
| AC-04 | 已登录访问 `/login` 或 `/register` | URL 跳转 | 按 `redirectTo` 或默认 `/dashboard` 跳转 |  |  |
| AC-04 | 已登录访问 `/admin` | URL 跳转 + 页面渲染结果 | 进入管理员总览面板，不再重定向到 `/admin/content/review` | pass | main@9e66eb2, main@04a28ec |
| AC-04 | 已登录访问 `/admin/content/{id}/edit`（旧路由） | URL 状态 | 返回 404（路由已下线） | pass | code cleanup (T-006.1) |
| AC-04 | 已登录访问 `/admin/content/reports`（首次进入） | 页面初始 UI 状态 | 右侧详情卡片默认不弹出 | pass | main@818587c |
| AC-04 | `/admin/content/reports` 点击具体报错后 | 详情交互 | 右侧详情卡片弹出，点击遮罩或按 `ESC` 可关闭 | pass | main@9116d18 |
| AC-04 | 全局语言为中文时访问 `/admin/content/reports` | 页面文案语言 | 标题、筛选、表头、抽屉动作等文案显示中文 | pass | workspace change (reports i18n) |
| AC-04 | 已登录访问 `/admin/referrals` | 页面渲染 + Sidebar 分组状态 | 页面在统一 Admin 容器渲染，且“用户管理”分组保持展开并可见“推荐关系”入口 | pass | main@924c0cf, main@5d2fb92 |
| AC-04 | 已登录访问 `/admin/vouchers` | 页面渲染 + Sidebar 分组状态 | 页面在统一 Admin 容器渲染，且“内容管理”分组覆盖 `/admin/vouchers` | pass | main@5d2fb92 |
| AC-04 | 已登录访问 `/admin/users` | 页面布局 | 用户列表主区域全宽展示，无异常右侧留白 | pass | main@5d2fb92 |
| AC-04 | 访问 `/dashboard/debug/ui-kit` | 路由状态 | 页面已下线，直接返回 404 | pass | workspace change (ui-kit route retired) |
| AC-04 | 访问 `/dashboard/knowledge-graph` | 路由状态 | 页面已下线，直接返回 404 | pass | workspace change (knowledge-graph route retired) |
| AC-04 | 访问 `/dashboard/practice/import` | 路由状态 | 页面已下线，直接返回 404（题目录入统一收口到内容管理） | pass | workspace change (practice import route retired) |
| AC-04 | 访问 `/dashboard/settings/notifications` | 路由状态 | 页面已下线，直接返回 404（通知设置统一收口到 `/dashboard/settings`） | pass | workspace change (settings notifications retired) |
| AC-04 | 从通知中心点击“通知设置” | 路由跳转 + 页面状态 | 跳转 `/dashboard/settings?tab=notifications` 并展示通知偏好矩阵 | pass | workspace change (settings tab integration) |
| AC-04 | 访问 `/admin/content` | 路由状态 | 页面已下线，直接返回 404（仅保留 `/admin/content/review`） | pass | workspace change (admin content retired) |
| AC-04 | 访问 `/course/:subjectId`、`/course/:subjectId/:lessonId` | 路由状态 | 页面已下线，直接返回 404（课程入口统一收口到 `/dashboard/courses`） | pass | workspace change (course routes retired) |
| AC-04 | 访问 `/checkout/config` | 路由状态 | 页面已下线，直接返回 404（支付入口改为 `/pricing` 直连） | pass | workspace change (checkout config retired) |
| AC-05 | 页面空闲 1-3 分钟 | Network + Server Logs | 非预期 `POST /admin/feedback` 不应持续出现 | pass | Playwright 2026-03-04：`/dashboard`、`/dashboard/practice`、`/admin/permissions` 空闲观测均未出现该请求 |
| AC-05 | 伪装状态轮询 | `/api/auth/impersonate/status` 请求频率 | 频率与前端轮询设计一致，且无多余触发源 | pass | Playwright 2026-03-04：空闲 180s 无新增轮询（非伪装态仅首次检查） |
| AC-05 | `/dashboard/practice` 空闲 1-3 分钟 | Network + Server Logs | 不应出现批量 `POST /dashboard/practice` 噪音请求 | pass | Playwright 2026-03-04：未出现 `POST /dashboard/practice` |
| AC-05 | `/dashboard/practice` 首屏与切科目请求次数 | Network（XHR/Fetch） | 首屏仅 `GET /api/practice/bootstrap` 一次；切换科目仅 `GET /api/practice/subject-data?subjectId=...` 一次 | pass | Playwright 2026-03-04：观测到 `bootstrap` 1 次成功 + 切科目 `subject-data` 1 次 |
| AC-05 | `/dashboard/leaderboard` 首屏请求次数 | Network + Server Logs | 不应出现多次 `POST /dashboard/leaderboard`；首屏读取改为服务端注入或单次 `GET /api/leaderboard/summary` | pass | 代码审计 2026-03-05：客户端移除 Server Action 调用，改为 GET API |
| AC-05 | `/dashboard/community` 首屏请求次数 | Network + Server Logs | 不应出现多次 `POST /dashboard/community`；首屏读取改为服务端注入或单次 `GET /api/community/feed` | pass | 代码审计 2026-03-05：客户端移除 Server Action 调用，改为 GET API |
| AC-05 | `/admin/users` 首屏请求次数 | Network + Server Logs | 不应出现多次 `POST /admin/users`；首屏读取改为服务端注入或单次 `GET /api/admin/users/list` | pass | 代码审计 2026-03-05：客户端移除 Server Action 调用，改为 GET API |
| AC-05 | 页面空闲且未打开通知下拉 | Network | 不应持续出现 `GET /api/notifications/summary?limit=10` | pass | Playwright 2026-03-04：未打开通知下拉时 180s 内无通知摘要请求 |

## 权限矩阵验收（新增）
| 验收点 | 角色 | 场景 | 预期结果 | 结果（pass/fail） | 证据 |
|---|---|---|---|---|---|
| AC-04 | ADMIN | 访问 `/admin` | 进入管理员总览面板并可见全量模块 |  |  |
| AC-04 | TEACHER | 访问 `/admin` | 可进入管理员总览，但隐藏安全/伪装敏感区块 |  |  |
| AC-04 | 其他角色 | 访问 `/admin` | 跳转 `/dashboard` |  |  |

## 数据表核对矩阵（逐项）
| 场景 | 相关表 | 关键字段 | 执行前快照（SQL + 摘要） | 执行后快照（SQL + 摘要） | 差异判断 | 回滚验证 | 结果/证据 |
|---|---|---|---|---|---|---|---|
| 登录后会话一致性 | users | id、status、sign_in_count、last_sign_in_at | `SELECT id, status, sign_in_count, last_sign_in_at FROM users WHERE email='ac01_20260305160426@learnmore.test';` => `status=ACTIVE, sign_in_count=2` | 同 SQL 重查 => `status=ACTIVE, sign_in_count=3` | 登录增加一次 sign-in 镜像；账号状态保持 ACTIVE | 登出后访问 `/dashboard/practice` 被重定向到 `/login?redirectTo=...` | pass（Playwright + Prisma 快照，2026-03-05） |
| 伪装状态核对 | impersonation_sessions | ended_at、expires_at、admin_id、target_user_id、token | 临时写入 active 会话：`ended_at IS NULL AND expires_at > now()` | 更新为 `ended_at=now()`、另建 `expires_at < now()` 会话后重复请求 status | active->`true`，ended/expired->`false`；无 token 与 token mismatch 均 `false` | 清理临时会话后数据恢复 | pass（本地 API/SQL 对照，2026-03-05） |
| 用户同步兜底 | user_settings | user_id、language、theme | SELECT user_id, language, theme FROM user_settings WHERE user_id={{userId}}; | 触发 sync 后再查 | 若不存在则创建且仅一条 | 回滚后无重复行 |  |
| Voucher 可用性核对 | voucher_codes | code、is_active、valid_from、valid_to、max_redemptions、redeemed_count | SELECT code, is_active, valid_from, valid_to, max_redemptions, redeemed_count FROM voucher_codes WHERE code={{code}}; | 触发下单校验后再查 | 启用状态/有效期/次数上限判定一致 | 回滚后状态恢复 |  |
| Voucher 核销幂等核对 | voucher_redemptions | voucher_id、user_id、stripe_session_id、applied_amount | SELECT voucher_id, user_id, stripe_session_id, applied_amount FROM voucher_redemptions WHERE user_id={{userId}} ORDER BY created_at DESC LIMIT 5; | 重放同一 webhook 后再查 | 同一 user + voucher + stripe_session 不重复写入 | 回滚后无重复核销行 |  |

## User/Voucher 字段映射核对矩阵（新增）
| 表 | Prisma 字段 | DB 列名 | 预期逻辑 | 核对结果（pass/fail） | 证据 |
|---|---|---|---|---|---|
| users | subscriptionTier、subscriptionStatus | subscription_tier、subscription_status | 订阅状态判断口径一致 |  |  |
| user_settings | userId、language、theme | user_id、language、theme | getCurrentUser 兜底同步不产生重复行 |  |  |
| voucher_codes | isActive、validFrom、validTo、maxRedemptions、redeemedCount | is_active、valid_from、valid_to、max_redemptions、redeemed_count | 优惠券可用性判定一致 |  |  |
| voucher_redemptions | voucherId、userId、stripeSessionId、appliedAmount | voucher_id、user_id、stripe_session_id、applied_amount | 首次支付核销具备幂等性 |  |  |

## 发布检查
- [x] 本地验证完成并附证据
- [x] 预发复测完成并附证据（本地生产模式替代；云端预发受鉴权限制）
- [x] 幂等与越权场景通过
- [ ] 路由定向审计完成并附证据
- [x] `impersonate/status` 与 `POST /admin/feedback` 异常请求排查完成并附 Network + Server log 证据
- [ ] 权限矩阵（ADMIN/TEACHER/其他）验收通过
- [ ] `/admin/content/review`、`/admin/feedback`、`/admin/users` 回归无退化
- [ ] user/voucher 字段映射核对完成并附证据
- [ ] 回滚方案可执行
- [ ] 已获得用户批准进入开发
