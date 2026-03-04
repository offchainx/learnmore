id: SPEC-20260209-P0-02
title: P0-02 Auth 会话稳定性回归
status: active
owner: codex
related_story:
created_at: 2026-02-09
updated_at: 2026-03-04

# 背景
- P0 发布链路中的子任务，需可独立验收与回滚。

# 目标（Goals）
- 验证登录/登出/超时/跨标签行为并固化验收。
- 梳理 user/voucher 相关数据表与字段逻辑，统一 Prisma 字段与 DB 列名映射。
- 梳理并修复页面路由重定向规则，确保所有受保护路由与公开路由定向一致。
- 排查并修复后台空闲状态下异常请求（`/api/auth/impersonate/status` 与关联请求）。

# 非目标（Non-Goals）
- 不扩展到 P1 范围。

# 约束（Constraints）
- 必须遵循 .codex/workflows/new-task-sop.md。

# 范围（In Scope）
- 当前子任务的方案、实施、验收、收尾。
- 补充 user/voucher 表格功能核对与字段逻辑校验矩阵。
- 补充路由重定向审计清单与错误定向修复（覆盖 `/admin/**` 与 `/dashboard/**`）。
- 补充后台空闲请求观测、定位与修复闭环。

# 范围外（Out of Scope）
- 其他 P0 子任务的实现细节。

# 风险（Risks）
- 风险：实现跨度过大。
  - 影响：延期与返工。
  - 缓解策略：拆分为可日清的小任务并先过验收。
- 风险：`user/voucher` 字段命名（camelCase / snake_case）与业务含义混淆。
  - 影响：实现误用字段、验收口径不一致。
  - 缓解策略：先完成字段映射与规则核对文档，再进入代码实现。
- 风险：路由重定向规则分散，出现错误回跳或路由误判。
  - 影响：用户流程中断、测试结果不稳定。
  - 缓解策略：先输出路由定向清单，再按清单逐项修复并验证。
- 风险：前端空闲状态出现异常后台请求，导致噪音日志和潜在性能问题。
  - 影响：预发观测误判、后端负载增加。
  - 缓解策略：定位触发源头，明确是否预期轮询，非预期则修复。

# 依赖（Dependencies）
- release 总计划与共享基础能力可用。

# 开发内容（必须先确认）

## 开发主线
1. AC-01 认证会话生命周期回归（登录/登出/刷新/跨标签）。
2. AC-04 全受保护路由重定向治理（含 `/admin` 管理员总览面板入口）。
3. AC-05 异常后台请求治理（`/api/auth/impersonate/status` 与 `POST /admin/feedback`）。
4. AC-02 管理员伪装状态接口一致性校验。
5. AC-03 user/voucher 表格功能与字段逻辑核对（含 Prisma/DB 映射）。

## 开发单元拆分
| 单元 | 入口 | Action/API | 数据表 |
|---|---|---|---|
| 登录流程 | 登录页表单 | loginAction | users |
| 登出流程 | 顶栏退出 | logoutAction | users |
| 当前用户解析 | 服务端读取 | getCurrentUser | users, user_settings |
| 全受保护路由重定向 | middleware + `/admin/**` + `/dashboard/**` | redirectTo guard / 路由守卫 | users（鉴权读取） |
| 伪装状态 | admin banner 轮询 | GET /api/auth/impersonate/status | impersonation_sessions |
| 异常请求排查 | 浏览器空闲态观测 | GET /api/auth/impersonate/status + 关联请求链路 | impersonation_sessions, user_feedbacks（只读排查） |
| user/voucher 字段核对 | 核对清单文档 | schema + SQL 核对 | users, user_settings, voucher_codes, voucher_redemptions |

## 锁定接口/类型与权限策略
- Server Action：`getAdminDashboardData(window: 'today_7d')`
- 类型文件：`src/types/admin-dashboard.ts`
- 可选 GET API：`GET /api/notifications/summary`（用于替代轮询型 Server Action）
- 权限策略：
  - ADMIN：可见全部管理员模块
  - TEACHER：隐藏安全与伪装敏感区块
  - 其他角色：访问 `/admin` 时跳转 `/dashboard`

## 任务边界
- 不改认证提供商，不新增第三方登录。
- 不扩展 voucher 新业务规则，只做字段与逻辑一致性梳理。
- 不新增新的轮询业务，只修正现有非预期后台请求。

## 假设与默认值
- `T-006` 采用“主任务 + 模块子任务”结构，不拆分成每页顶层任务。
- `/admin` 为真实管理员总览面板入口页。
- 面板前端由 AI Studio 生成，仓库内实现按既定 props 契约接入。
- 时间窗口默认使用“今日 + 近 7 天（today_7d）”。
- 技术栈保持 Next.js App Router + Server Action + Prisma + shadcn。

## 交付判定（DoD）
- 会话行为稳定，越权与异常态可解释。
- 受保护路由重定向矩阵全量通过（`/admin/**`、`/dashboard/**`）。
- 路由重定向清单完成且错误定向已修复。
- `/api/auth/impersonate/status` 与关联异常请求已定位并完成修复或确认为预期行为。
- 异常请求“来源-频率-结论”闭环完成并留存证据。
- user/voucher 字段核对矩阵完成并经审阅确认。

## 最新实现进展（2026-03-04）
- `/admin/referrals`：已接入统一 Admin 容器与侧边栏二级入口（用户管理），并修复点击反馈中心导致分组折叠的问题。
- `/admin/vouchers`：已接入统一 Admin 容器，页面恢复与其他 admin 子页一致的 sidebar 嵌套。
- `/admin/users`：已修复列表区域宽度收缩问题，页面主区全宽渲染。
- `/dashboard/debug/ui-kit`：已下线，当前行为为显式 404。
- `/dashboard/knowledge-graph`：已下线，当前行为为显式 404。
- 开发过程记录：`T-006` 每一步执行日志已同步到 `tasks.md` 与 `plan.md`。
