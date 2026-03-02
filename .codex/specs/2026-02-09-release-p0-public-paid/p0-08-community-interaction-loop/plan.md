# 技术方案（Plan）

## 概览
- 子任务：P0-08 Community 互动闭环
- 方案摘要：恢复社区新建与详情流转，确保发帖、评论、点赞闭环可用并可核账。
- 执行原则：先文档、后开发；未获用户确认前禁止进入实现。

## 强制门禁（本任务必须满足）
1. 完成 spec.md、plan.md、tasks.md、acceptance.md 四件套并通过审阅。
2. 明确 Server Action 或接口契约：输入校验、输出结构、错误结构、幂等与并发策略。
3. 明确数据落表点：逐表列出关键字段与校验 SQL。
4. 验证环境固定为 本地 + 预发，两轮都要留下证据。

## Server Action / 接口契约清单
| Action/接口 | 调用入口 | 输入与校验 | 输出与错误 | 幂等/并发策略 | 审计字段 |
|---|---|---|---|---|---|
| createPost | 社区新建页提交 | title、content、category 校验 | 成功返回 post，失败返回错误 | 重复提交需可识别 | userId、postId、result |
| createComment | 帖子详情评论提交 | postId、content 校验 | 成功返回 comment，失败返回错误 | 重复提交可追踪 | userId、postId、commentId、result |
| toggleLike | 帖子详情点赞按钮 | postId | 成功切换 liked | 连续点击最终状态一致 | userId、postId、liked、timestamp |
| getPostById / getPosts | 列表与详情渲染 | 参数校验 | 成功返回帖子与统计 | 查询幂等 | postId、page、result |

## 数据落表点与核对范围
| 相关表 | 关键字段 | 读/写 | 触发场景 | 核对方式 |
|---|---|---|---|---|
| posts | id、title、content、authorId、likeCount | 读/写 | 发帖与点赞计数更新 | 创建与计数一致性核对 |
| comments | id、postId、authorId、content | 写 | 评论创建 | 评论数与详情展示一致核对 |
| post_likes | userId、postId | 写 | 点赞或取消点赞 | 唯一约束与计数联动核对 |
| user_badges, notifications | badgeId、type | 写 | 社区触发成就与通知 | 防重复与消息存在性核对 |

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
| 开发单元 | 入口 | Action/API | 数据表 | 验证方式 |
|---|---|---|---|---|
| 列表加载 | community/page | getPosts | posts, comments, post_likes | 分页/筛选核对 |
| 发帖 | community/new | createPost | posts | 新帖入库与回显 |
| 详情加载 | community/[postId] | getPostById | posts, comments, post_likes | 详情完整性核对 |
| 评论 | detail comment form | createComment | comments | 评论数与列表一致 |
| 点赞 | detail like button | toggleLike | post_likes, posts | 联动计数一致 |

### 必改文件
- src/actions/community/post.ts
- src/app/(dashboard)/dashboard/community/new/page.tsx
- src/app/(dashboard)/dashboard/community/[postId]/page.tsx
- src/components/community/NewPostPageClient.tsx
- src/components/community/PostDetailClient.tsx
- src/components/dashboard/views/CommunityView.tsx

### 主要接口 / Server Actions
- getPosts
- getPostById
- createPost
- createComment
- toggleLike

### 主要数据表
- posts
- comments
- post_likes
- user_badges
- notifications

### 非目标
- 不做实时聊天室与推荐算法。

### 开发完成判定（DoD）
- Community 互动闭环稳定可用。
