# 技术方案（Plan）

## 概览
- 子任务：P0-02 Auth 会话稳定性回归
- 方案摘要：回归认证与会话生命周期，覆盖登录、登出、超时、跨标签与伪装状态查询；补充 user/voucher 表格与字段逻辑核对。
- 执行原则：先文档、后开发；未获用户确认前禁止进入实现。

## 强制门禁（本任务必须满足）
1. 完成 spec.md、plan.md、tasks.md、acceptance.md 四件套并通过审阅。
2. 明确 Server Action 或接口契约：输入校验、输出结构、错误结构、幂等与并发策略。
3. 明确数据落表点：逐表列出关键字段与校验 SQL。
4. 验证环境固定为 本地 + 预发，两轮都要留下证据。
5. 完成 user/voucher 字段映射核对（Prisma 字段 <-> DB 列名 <-> 业务逻辑）。

## Server Action / 接口契约清单
| Action/接口 | 调用入口 | 输入与校验 | 输出与错误 | 幂等/并发策略 | 审计字段 |
|---|---|---|---|---|---|
| loginAction | 登录表单提交 | 邮箱密码格式校验 | 成功跳 dashboard，失败返回错误 | 重复提交不产生异常状态 | userId、action、result、timestamp |
| logoutAction | 退出按钮 | 已登录用户触发 | 清理会话并跳转首页 | 多次调用结果一致 | userId、action、result、timestamp |
| GET /api/auth/impersonate/status | Admin 伪装 Banner 轮询 | token 校验 | 返回 isImpersonating 状态 | 多次查询只读 | sessionId、targetUserId、result |

## 数据落表点与核对范围
| 相关表 | 关键字段 | 读/写 | 触发场景 | 核对方式 |
|---|---|---|---|---|
| users | status、subscriptionTier(`subscription_tier`) | 读/写 | 登录后读取与状态校验 | 用户状态与路由行为一致性核对 |
| impersonation_sessions | endedAt(`ended_at`)、expiresAt(`expires_at`)、targetUserId(`target_user_id`) | 读 | 伪装状态查询 | API 返回值与表状态对齐 |
| user_settings | userId(`user_id`)、language、theme | 写 | 用户同步兜底 | upsert 行为核对 |
| voucher_codes | isActive(`is_active`)、validFrom(`valid_from`)、validTo(`valid_to`)、maxRedemptions(`max_redemptions`)、redeemedCount(`redeemed_count`) | 读/写 | 下单前优惠券可用性校验 | 可用性判定与阈值逻辑核对 |
| voucher_redemptions | voucherId(`voucher_id`)、userId(`user_id`)、stripeSessionId(`stripe_session_id`)、appliedAmount(`applied_amount`) | 写 | 首次支付核销与重放幂等 | 单用户单会话不重复核销 |

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
| 伪装状态 | ImpersonateBanner | GET /api/auth/impersonate/status | impersonation_sessions | token 正常/过期对比 |
| user/voucher 字段核对 | 核对文档 | schema + SQL | users, user_settings, voucher_codes, voucher_redemptions | 字段映射 + 规则一致性检查 |

### 必改文件
- src/actions/user/auth.ts
- src/app/api/auth/impersonate/status/route.ts
- src/middleware.ts
- src/components/business/auth/login-form.tsx
- docs/release/p0-auth-regression-cases.md
- docs/release/p0-user-voucher-field-matrix.md

### 主要接口 / Server Actions
- loginAction
- logoutAction
- getCurrentUser
- GET /api/auth/impersonate/status

### 主要数据表
- users
- user_settings
- impersonation_sessions
- voucher_codes
- voucher_redemptions

### 非目标
- 不改管理员权限模型。
- 不新增 voucher 折扣类型或计费规则。

### 开发完成判定（DoD）
- 认证会话回归用例全部通过。
- user/voucher 字段映射与逻辑核对文档通过审阅。
