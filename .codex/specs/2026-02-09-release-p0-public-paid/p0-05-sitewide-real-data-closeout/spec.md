id: SPEC-20260209-P0-05
title: P0-05 全站真实数据与联调收口
status: active
owner: codex
related_story:
created_at: 2026-02-09
updated_at: 2026-03-15

# 背景
- P0 发布链路中的子任务，需可独立验收与回滚。
- 当前项目已存在多处页面级 mock/preview/fallback 数据，部分页面展示、交互与数据库真实状态仍未完全对齐。
- 本任务不再限定于 Dashboard，而是作为“全站页面、逻辑、接口、数据一致性”的收口任务，目标是确保用户可见页面与关键操作都能真实可用。

# 目标（Goals）
- 确保所有页面的所有核心功能均可正常使用，不依赖误导性的 mock 数据或伪成功提示。
- 确保页面展示数据与后台数据库、Server Action、API 返回一致，可追踪、可复算、可核账。
- 替换全站 mock/fake/preview-only 业务数据；若后端能力未完成，则改为禁用态、空态或明确提示，不允许继续假装可用。
- 建立“页面 -> 组件 -> Action/API -> 数据表/上游服务”的全链路映射与验收基线。

# 非目标（Non-Goals）
- 不在本任务内新增 P1 级新功能或重做交互设计。
- 不做与页面可用性无关的大规模底层重构。
- 不以演示数据填补真实数据缺口；真实能力缺失时只能下线、禁用或给出明确空态。

# 约束（Constraints）
- 必须遵循 `.codex/workflows/new-task-sop.md`。
- 所有用户可触发的创建、提交、支付、评论、设置保存等动作，必须定义输入校验、输出结构、错误结构、幂等策略。
- 所有页面必须明确真实数据源；任何字段若无法映射到数据库或上游服务，必须整改。
- 验证环境固定为本地 + 预发，两轮都要保留证据。

# 范围（In Scope）
- Dashboard、Practice、Leaderboard、Community、Courses、Achievements、Settings、Admin、公开页中的交互功能联调。
- 页面真实数据接入、mock/fallback 清理、接口契约对齐、表级核账与页面回归。
- 页面空态、异常态、权限态、无数据态、重复提交/重复刷新幂等验证。
- 需要时收敛错误入口、假 CTA、假成功提示。

# 范围外（Out of Scope）
- 其他 P0 子任务的独立深度重构方案文档。
- 与发布无关的视觉精修或内容运营补录。

# 风险（Risks）
- 风险：任务跨度扩大到全站。
  - 影响：实现周期长、隐性依赖多。
  - 缓解策略：按页面域拆分，先做清单与映射，再逐波次清理并逐项验收。
- 风险：页面已有多层 fallback/preview 分支。
  - 影响：表面可用，实际仍未接真数据。
  - 缓解策略：逐页检查 route、server component、client component、action、API 与空态逻辑。
- 风险：历史数据本身存在脏数据或口径不一致。
  - 影响：页面展示与 SQL 对不上。
  - 缓解策略：建立字段级核账 SQL，先对齐口径，再修复展示。

# 依赖（Dependencies）
- release 总计划与共享基础能力可用。
- Prisma/PostgreSQL、Supabase Auth、Stripe、通知与内容服务可用。
- 本地与预发环境可执行页面访问、动作提交与 SQL 核查。

# 开发内容（必须先确认）

## 开发主线
1. 建立全站页面/功能/接口/数据源清单，确认每个页面的真实数据来源与动作入口。
2. 逐页核对“页面展示字段 -> Action/API -> 数据表/上游服务”一致性。
3. 移除所有 mock/fake/preview-only 业务数据；缺失能力改为空态、禁用态或明确不可用提示。
4. 对所有关键写操作补齐幂等、权限、异常态与重复提交验证。
5. 在本地与预发完成双环境证据化验收。

## 页面域覆盖矩阵
| 页面域 | 关键页面/入口 | 核心目标 | 主要数据源 |
|---|---|---|---|
| Dashboard | `/dashboard` | 首屏统计、任务、活动、薄弱点全部接真数据 | `users`, `user_attempts`, `daily_tasks`, `user_progress` |
| Practice | `/dashboard/practice`、Smart Drill、Chapter Drill、Mock Arena、Past Papers | 选题、作答、提交、结果、统计全链路真实可核账 | `questions`, `exam_records`, `user_attempts`, `question_reports` |
| Leaderboard | `/dashboard/leaderboard` | 榜单、个人排名、周期切换全部去 mock | `leaderboard_entries`, `users` |
| Community | `/dashboard/community`、发帖、详情、评论 | 列表、详情、发帖、互动接真实读写 | 社区相关表/API |
| Courses | `/dashboard/courses`、课程页 | 学习内容、进度与数据库一致 | `subjects`, `chapters`, `lessons`, `user_progress` |
| Achievements / Gamification | `/dashboard/achievements` | 成就、XP、streak、任务状态真实可追踪 | `achievements`, `users`, `daily_tasks` |
| Settings / User | `/dashboard/settings`、个人资料、家长/偏好设置 | 资料读取、保存、反馈真实生效 | 用户、设置、通知相关表 |
| Admin / Billing / Support | `/admin*`、结算、反馈、工单 | 管理台、支付、反馈、推荐码等无假数据或假成功 | 管理、支付、反馈、推荐相关表/Stripe |
| Public / Marketing | 登录注册、定价、联系、博客、帮助 | 所有表单与 CTA 行为真实可达或明确禁用 | Auth、营销、博客、支持相关服务 |

## 已识别的高风险 mock 热点（2026-03-15 初扫）
- `/dashboard/leaderboard` 页面仍存在首屏 mock 榜单构造逻辑。
- Practice 仍存在多处 preview/mock 分支：`smart-drill`、`chapter-drill`、`ChapterMap`、`PastPapersSection`。
- Courses 视图仍依赖 `mockUserContent`。
- Admin 仍存在 `stripe-mock` 相关逻辑。
- 部分 shared data/assessment dialog 仍存在演示数据依赖。

## 交付判定（DoD）
- 所有用户可见页面与关键功能已完成真实数据/真实接口对齐，或被明确禁用且无误导。
- 所有页面不再依赖 mock/fake/preview-only 业务数据作为正式展示来源。
- 关键写操作均通过权限、异常、幂等、重复提交验证。
- 页面展示值与数据库/上游服务核账结果一致，且留存本地与预发证据。
