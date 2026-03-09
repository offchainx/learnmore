id: SPEC-20260209-P0-09
title: P0-09 Community 互动闭环
status: active
owner: codex
related_story:
created_at: 2026-02-09
updated_at: 2026-02-09

# 背景
- P0 发布链路中的子任务，需可独立验收与回滚。

# 目标（Goals）
- 恢复新建与详情页，确保发帖评论点赞完整可用。

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
1. 恢复 Community 新建页与详情页真实流转。
2. 打通发帖、评论、点赞闭环。
3. 保证点赞关系表与计数字段一致。

## 页面级开发映射
| 页面/组件 | Action | 数据表 | 关键验收 |
|---|---|---|---|
| 社区列表 | getPosts | posts, comments, post_likes | 分页与计数正确 |
| 新建帖子页 | createPost | posts | 创建后可回显 |
| 帖子详情页 | getPostById | posts, comments, post_likes | 详情数据完整 |
| 评论提交 | createComment | comments | 评论立即可见 |
| 点赞切换 | toggleLike | post_likes, posts.likeCount | 状态与计数一致 |

## 交付判定（DoD）
- 不再使用占位重定向。
- 互动动作均可追踪到数据库。
