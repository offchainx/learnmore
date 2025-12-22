# Story-034: Community Hub (Basic)

**状态**: Backlog ⚪
**优先级**: P3
**前置任务**: Story-025

## 1. 目标
实现基础的社区互动功能，让学生可以互助。不包含实时 WebSocket 功能。

## 2. 任务拆解
- [ ] **Post CRUD**:
    - 实现 `createPost`, `getPosts`, `getPostDetail` Actions。
    - 支持 Markdown 内容。
- [ ] **Interaction**:
    - 实现评论 (`createComment`) 和点赞 (`toggleLike`)。
- [ ] **Categories**:
    - 支持按标签/分类筛选帖子（Question, Note, Achievement）。
    - "Unanswered" 过滤器。

## 3. 验收标准
- [ ] 用户可以发布问题，并在列表中看到。
- [ ] 其他用户可以评论。
- [ ] 帖子支持点赞。
