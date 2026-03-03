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
| loginAction | 登录页提交 | 正常：有效账号；异常：错误密码 | 未登录可访问 | 成功重定向；失败返回错误文案 | 重复点击不产生脏状态 | auth login error 日志 |  |  |
| logoutAction | 顶栏退出 | 正常：已登录；异常：会话已失效 | 未登录调用应安全结束 | 都应回到首页 | 多次调用结果一致 | auth logout error 日志 |  |  |
| GET /api/auth/impersonate/status | 管理端 banner 轮询 | 正常：有效 token；异常：过期 token | 未授权 token 返回 false | 仅返回状态，不写库 | 查询幂等 | impersonate status 日志 |  |  |

## 路由定向与后台请求验收矩阵（新增）
| 验收点 | 场景 | 观测对象 | 预期结果 | 结果（pass/fail） | 证据 |
|---|---|---|---|---|---|
| AC-04 | 未登录访问 `/dashboard/**` | URL 跳转 + `redirectTo` 参数 | 跳到 `/login?redirectTo=...` 且回跳路径正确 |  |  |
| AC-04 | 未登录访问 `/admin/**` | URL 跳转 + `redirectTo` 参数 | 跳到 `/login?redirectTo=...` 且回跳路径正确 |  |  |
| AC-04 | 已登录访问 `/login` 或 `/register` | URL 跳转 | 按 `redirectTo` 或默认 `/dashboard` 跳转 |  |  |
| AC-04 | 已登录访问 `/admin` | URL 跳转 + 页面渲染结果 | 进入管理员总览面板，不再重定向到 `/admin/content/review` | pass | main@9e66eb2, main@04a28ec |
| AC-04 | 已登录访问 `/admin/content/{id}/edit`（旧路由） | URL 状态 | 返回 404（路由已下线） | pass | code cleanup (T-006.1) |
| AC-05 | 页面空闲 1-3 分钟 | Network + Server Logs | 非预期 `POST /admin/feedback` 不应持续出现 |  |  |
| AC-05 | 伪装状态轮询 | `/api/auth/impersonate/status` 请求频率 | 频率与前端轮询设计一致，且无多余触发源 |  |  |

## 权限矩阵验收（新增）
| 验收点 | 角色 | 场景 | 预期结果 | 结果（pass/fail） | 证据 |
|---|---|---|---|---|---|
| AC-04 | ADMIN | 访问 `/admin` | 进入管理员总览面板并可见全量模块 |  |  |
| AC-04 | TEACHER | 访问 `/admin` | 可进入管理员总览，但隐藏安全/伪装敏感区块 |  |  |
| AC-04 | 其他角色 | 访问 `/admin` | 跳转 `/dashboard` |  |  |

## 数据表核对矩阵（逐项）
| 场景 | 相关表 | 关键字段 | 执行前快照（SQL + 摘要） | 执行后快照（SQL + 摘要） | 差异判断 | 回滚验证 | 结果/证据 |
|---|---|---|---|---|---|---|---|
| 登录后会话一致性 | users | id、status | SELECT id, status FROM users WHERE email={{email}}; | 登录后重复查询 | 非 BANNED 用户可进入受保护路由 | 退出后应被拦截 |  |
| 伪装状态核对 | impersonation_sessions | ended_at、expires_at | SELECT id, ended_at, expires_at FROM impersonation_sessions WHERE id={{sessionId}}; | 调 status API 后再查 | 返回 JSON 与表状态一致 | 结束伪装后应返回 false |  |
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
- [ ] 本地验证完成并附证据
- [ ] 预发复测完成并附证据
- [ ] 幂等与越权场景通过
- [ ] 路由定向审计完成并附证据
- [ ] `impersonate/status` 与 `POST /admin/feedback` 异常请求排查完成并附 Network + Server log 证据
- [ ] 权限矩阵（ADMIN/TEACHER/其他）验收通过
- [ ] `/admin/content/review`、`/admin/feedback`、`/admin/users` 回归无退化
- [ ] user/voucher 字段映射核对完成并附证据
- [ ] 回滚方案可执行
- [ ] 已获得用户批准进入开发
