id: SPEC-20260209-P0-02
title: P0-02 Auth 会话稳定性回归
status: active
owner: codex
related_story:
created_at: 2026-02-09
updated_at: 2026-02-09

# 背景
- P0 发布链路中的子任务，需可独立验收与回滚。

# 目标（Goals）
- 验证登录/登出/超时/跨标签行为并固化验收。

# 非目标（Non-Goals）
- 不扩展到 P1 范围。

# 约束（Constraints）
- 必须遵循 .codex/workflows/new-task-sop.md。

# 范围（In Scope）
- 当前子任务的方案、实施、验收、收尾。

# 范围外（Out of Scope）
- 其他 P0 子任务的实现细节。

# 风险（Risks）
- 风险：实现跨度过大。
  - 影响：延期与返工。
  - 缓解策略：拆分为可日清的小任务并先过验收。

# 依赖（Dependencies）
- release 总计划与共享基础能力可用。

# 开发内容（必须先确认）

## 开发主线
1. 认证会话生命周期回归（登录/登出/超时/跨标签）。
2. 受保护路由行为一致性校验。
3. 管理员伪装状态接口一致性校验。

## 开发单元拆分
| 单元 | 入口 | Action/API | 数据表 |
|---|---|---|---|
| 登录流程 | 登录页表单 | loginAction | users |
| 登出流程 | 顶栏退出 | logoutAction | users |
| 当前用户解析 | 服务端读取 | getCurrentUser | users, user_settings |
| 伪装状态 | admin banner 轮询 | GET /api/auth/impersonate/status | impersonation_sessions |

## 任务边界
- 不改认证提供商，不新增第三方登录。

## 交付判定（DoD）
- 会话行为稳定，越权与异常态可解释。
