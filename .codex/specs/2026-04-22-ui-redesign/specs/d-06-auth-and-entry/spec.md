id: SPEC-20260422-D-06
title: d-06 auth and entry
status: draft
owner: codex
created_at: 2026-04-22
updated_at: 2026-04-22

# 背景
- auth and entry 是用户第一次真正进入产品的窄门，既要可信，也要和营销气质与登录后体验衔接。

# 目标（Goals）
- 重构 login / register / reset 等入口页
- 保留认证链路和表单功能
- 让入口页成为 marketing 和 app shell 之间的平滑过渡

# 非目标（Non-Goals）
- 不改身份认证后端逻辑
- 不新增 onboarding 流程

# 稳定边界
- 入口页必须保留主认证方式与跳转关系
- 视觉上既不能太营销，也不能太后台

# 依赖（Dependencies）
- `../ws-00-scope-and-route-freeze/`
- `../ws-02-design-contract-and-anti-patterns/`
- `../../harness/route-inventory.md`
