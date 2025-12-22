# Story-024: Database Schema Update & Mock Data Injection

**状态**: Completed ✅
**优先级**: P0 (Critical)
**前置任务**: Story-023 (UI Integration)

## 1. 目标 (Objectives)

本 Story 旨在升级后端数据库架构，以支持 Story-022/023 中实现的全新 UI 功能（如 AI 个性化设置、每日任务、博客系统），并注入高质量的 Mock 数据，使演示环境真实可用。

- [x] **Schema 升级**: 根据 `docs/stories/database_schema_plan.md` 更新 `prisma/schema.prisma`，新增 5 张表并优化现有表。
- [x] **数据库同步**: 执行迁移，确保数据库结构与 Schema 一致。
- [x] **Seed 数据编写**: 编写全面的 Seed 脚本，为新表注入逼真的测试数据。
- [x] **数据验证**: 验证数据能否正确写入和读取。

---

## 2. 任务拆解 (Task Breakdown)

### Step 1: 数据库架构升级 (Schema Upgrade) - **Priority 1**

根据 `docs/stories/database_schema_plan.md`，在 `prisma/schema.prisma` 中执行以下变更：

1.  **用户模块**:
    *   更新 `User`: 新增 `streak`, `total_study_time`, `xp`, `last_study_date`。
    *   新增 `UserSettings`: 存储偏好 (AI Personality, Language, etc.)。
    *   新增 `Subscriber`: 存储 Newsletter 订阅。
2.  **游戏化模块**:
    *   新增 `DailyTask`: 每日任务 (Type, Target, Progress)。
3.  **内容模块**:
    *   新增 `BlogPost`: 博客文章 (Title, Content, Slug)。
4.  **社交模块**:
    *   更新 `Post` & `Comment`: 新增 `category`, `tags`, `is_solved` 等字段。
    *   新增 `ContactSubmission`: 联系表单。

### Step 2: 数据库迁移 (Migration)

*   运行 `pnpm prisma db push` (开发环境) 或创建正式迁移文件。
*   确保无破坏性变更导致的数据丢失（开发环境可重置）。

### Step 3: Mock 数据生成 (Seed Data)

更新 `prisma/seed.ts`，利用 `faker` 或静态数据生成以下内容：

1.  **基础数据**:
    *   10+ 个 `Subject` (UEC/IGCSE 混合)。
    *   完整层级 `Chapter` -> `Lesson` -> `Question`。
2.  **用户数据**:
    *   预设用户 `demo@learnmore.com` (密码 `password`)。
    *   关联的 `UserSettings` (Dark mode, Socratic AI)。
3.  **动态数据**:
    *   3 个 `DailyTask` (状态：1个完成，2个进行中)。
    *   5+ 篇 `BlogPost` (匹配 UI 中的分类)。
    *   10+ 条 `ContactSubmission`。
    *   活跃的 `LeaderboardEntry` 数据。

---

## 3. 验收标准 (Verification)

- [x] `prisma/schema.prisma` 包含所有 19 张表定义。
- [x] `pnpm db:seed` 运行成功，无报错。
- [x] Prisma Studio (`pnpm db:studio`) 中可以看到生成的数据。
- [x] 关键关联关系 (Relations) 正确（如 User -> UserSettings 一对一）。

---

## 4. 交付物 (Deliverables)

- 更新后的 `prisma/schema.prisma`
- 更新后的 `prisma/seed.ts`
- 数据库迁移记录 (如有)

---

## 5. 执行指令

请优先执行 Step 1 (Schema Upgrade)，这是后续所有功能开发的基础。
