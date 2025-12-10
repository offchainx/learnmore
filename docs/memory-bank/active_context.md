# Active Context (当前上下文)

**上次更新**: 2025-12-09
**当前阶段**: Phase 1 - Foundation

## 🎯 当前焦点 (Current Focus)

**Story-004: App Shell & Navigation - Completed.**

## 📝 待办事项 (Immediate Todos)

- [ ] Select next story


## 💡 最近的架构决策 (Recent Decisions)

1.  **架构模式**: 采用 Next.js BFF 架构，前端不直接连 DB。
2.  **Auth 同步**: 使用 PostgreSQL Trigger 将 `auth.users` 同步到 `public.users`。
3.  **ORM**: 强制使用 Prisma，为未来可能的 NestJS 迁移留后路。
4.  **技术栈**: 引入 Redis (排行榜), React Player (视频), Tiptap (富文本).
5.  **Form Actions**: 使用 `useActionState` 处理服务端验证错误与 UI 反馈。