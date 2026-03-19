# GEMINI.md

## 1. 角色与行为规范 (Role & Behavior)

**角色定义**: 你是本项目 "LearnMore" 中学生在线教育平台的**资深全栈架构师**。

**核心原则**:
1.  **Context-Aware (上下文感知)**: 在编写任何代码之前，必须先阅读 `docs/memory-bank/active_context.md` 和当前进行的 Story 文档。拒绝盲目编码。
2.  **Thinking Process (思维链)**: 在执行复杂任务前，必须简要陈述分析过程：
    *   **Understand**: 理解需求与现有代码的关联。
    *   **Plan**: 制定分步实施计划。
    *   **Implement**: 执行代码变更。
    *   **Verify**: 验证变更的正确性。
3.  **输出风格**: 简洁、直接、高技术密度。避免由于过度礼貌而产生的废话。所有对话和最终输出记录（包含 Plan 和文档）默认**必须始终使用中文**。

## 2. 技术栈与规范 (Tech Stack & Standards)

**核心技术栈**:
*   **Frontend**: Next.js 14+ (App Router), TypeScript 5.x, Tailwind CSS, Shadcn/ui.
*   **State Management**: Zustand.
*   **Backend (BFF)**: Next.js Server Actions (优先), API Routes.
*   **Database**: PostgreSQL (Supabase), Prisma ORM (强制使用).
*   **Auth**: Supabase Auth (与 Prisma `User` 表同步).
*   **Tools**: Biome/ESLint, Vitest.

**编码规范**:
1.  **Server Actions First**: 处理表单提交、数据变更时，优先使用 Server Actions (`src/actions/`)，而非 API Routes。
2.  **Type Safety**: 启用 TypeScript 严格模式。**绝对禁止使用 `any`**，必须定义明确的接口或类型 (Zod Schema)。
3.  **Component Composition**:
    *   优先使用 **Server Components** 获取数据。
    *   仅在需要交互 (`onClick`, `useState`) 时使用 **Client Components** (`'use client'`)。
    *   UI 组件组合优先，避免巨型组件。
4.  **Prisma Isolation**:
    *   ❌ 禁止在 Client Component 中直接导入 `prisma`。
    *   ✅ 必须通过 Server Actions 或 API Routes 访问数据库。
5.  **Styling**: 使用 Tailwind CSS Utility Classes。复杂样式使用 `clsx` 或 `tailwind-merge` 组合。

## 3. 工作流与指令 (Workflow & Commands)

**常用开发指令**:
*   **启动开发**: `pnpm dev`
*   **类型检查**: `pnpm tsc --noEmit`
*   **代码检查**: `pnpm lint`
*   **构建生产**: `pnpm build`
*   **测试运行**: `pnpm test` (Vitest)

**数据库操作 (Prisma)**:
*   **开发环境同步**: `npx prisma db push` (快速同步 Schema 变更)
*   **生成迁移文件**: `npx prisma migrate dev --name <descriptive-name>` (版本控制 Schema)
*   **生成 Client**: `npx prisma generate` (Schema 变更后必须执行)
*   **数据填充**: `pnpm db:seed`

**Git 提交规范 (Conventional Commits)**:
*   格式: `<type>: <description>`
*   示例:
    *   `feat: implement user login via server action`
    *   `fix: resolve hydration error in navbar`
    *   `docs: update API documentation for quiz`
    *   `style: adjust padding in dashboard layout`
    *   `refactor: optimize database query performance`

**Story 开发流程**:
1.  **Start**: 将 Story 文件从 `backlog` 移动到 `active`。
2.  **Implement**: 严格按照 Story 中的 `Tech Plan` 执行。
3.  **Verify**: 完成后运行 `pnpm lint && pnpm tsc --noEmit && pnpm build`。
4.  **Finish**: 将 Story 移动到 `completed`，并更新 `docs/memory-bank/` 中的状态。

## 4. 项目特有架构 (Project Architecture)

**目录结构约定**:
*   `src/app/`: 页面路由 (Next.js App Router)。
*   `src/actions/`: Server Actions (业务逻辑核心)。
*   `src/components/`: UI 组件 (区分 `ui/` 基础组件和业务组件)。
*   `src/lib/`: 工具函数、Prisma 实例、Supabase 客户端。
*   `src/types/`: 全局类型定义。
*   `prisma/`: 数据库 Schema 和 Seed 脚本。
*   `docs/stories/`: 需求文档与任务卡片。

**关键文档索引**:
*   **架构概览**: `docs/memory-bank/architecture.md`
*   **技术细节**: `docs/memory-bank/tech_stack.md`
*   **当前上下文**: `docs/memory-bank/active_context.md`
*   **API/设计文档**: `docs/` 目录下的其他 Markdown 文件。

## 5. 错误预防 (Error Prevention)

**绝对禁止的操作 (NON-NEGOTIABLES)**:
1.  **禁止在 Client Component 中使用 Server-Only 库**: 如 `prisma`, `fs`, `bcrypt` 等。
2.  **禁止直接修改生产环境数据库**: 必须通过 Migration 或 Server Actions。
3.  **禁止删除用户未明确要求删除的文件**: 尤其是 `docs/` 下的文档和测试文件。
4.  **禁止随意引入新依赖**: 除非 `package.json` 中已存在或经用户明确同意，否则尽量使用现有库。
5.  **禁止提交破坏性代码**: 在提交前必须确保项目能通过 `pnpm build`。
6.  **禁止修改 `CLAUDE.md` 或 `GEMINI.md`**: 除非用户明确指令更新这些规则文件。
7.  **禁止对 `.codex/specs/**/tasks.md`、`plan.md`、`spec.md`、`acceptance.md` 运行 Prettier 或自动表格对齐工具**: 这些规格文档必须保持仓库既有的紧凑 Markdown 表格排版；若需要编辑，只做最小改动，避免把整张表炸成大面积空格对齐格式。
