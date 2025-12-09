# Active Context (当前上下文)

**上次更新**: 2025-12-09
**当前阶段**: Phase 1 - Foundation (Story-001 in Progress)

## 🎯 当前焦点 (Current Focus)
**Story-001: Infrastructure Initialization (🟡 In Progress)**

正在执行项目基础设施搭建，包括 Next.js 14+ (App Router) 初始化、Tailwind CSS + Shadcn/ui 配置、目录结构建立、环境变量配置、ESLint / Prettier 配置以及 Git 仓库初始化。

## 📝 待办事项 (Immediate Todos)
**Story-001 Objectives:**
- [x] Next.js 14+ (App Router) 项目初始化成功
- [ ] Tailwind CSS + Shadcn/ui 配置完成,样式生效
- [ ] 目录结构按照 `tech_stack.md` 规范建立 (`src/actions`, `src/components` 等)
- [ ] 环境变量 (`.env`) 配置完成,包含 Supabase Keys
- [ ] ESLint / Prettier 规则配置完成,无红线报错
- [ ] Git 仓库初始化,提交第一次 Commit

## 💡 最近的架构决策 (Recent Decisions)
1.  **架构模式**: 采用 Next.js BFF 架构，前端不直接连 DB。
2.  **Auth 同步**: 使用 PostgreSQL Trigger 将 `auth.users` 同步到 `public.users`。
3.  **ORM**: 强制使用 Prisma，为未来可能的 NestJS 迁移留后路。
4.  **技术栈**: 引入 Redis (排行榜), React Player (视频), Tiptap (富文本).