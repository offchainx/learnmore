# Story-002-schema: Database Schema & Migration

**Phase**: Phase 1: Foundation
**Goal**: 将 PRD 中的数据结构转化为 Prisma Schema,建立数据库表结构,实现 Auth 用户同步机制
**预估时间**: 4-6 Hours
**Story Points**: 5
**前置依赖**: Story-001 (项目已初始化)
**负责人**: _待分配_

---

## 1. Objectives (实现目标)

- [ ] 编写 `prisma/schema.prisma`,包含 User, Subject, Chapter, Question 等核心表
- [ ] 定义表之间的关联关系 (Relations)
- [ ] 设置 Supabase Auth Trigger (SQL),实现 `auth.users` → `public.users` 自动同步
- [ ] 执行首次 Migration,数据库中出现表结构
- [ ] 编写种子数据脚本 (`prisma/seed.ts`),注入基础学科数据
- [ ] 验证 Prisma Studio 能正常访问数据

---

## 2. Tech Plan (技术方案)

### 2.1 Schema 定义

创建 `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ============ 用户模块 ============
model User {
  id        String   @id @default(uuid()) @db.Uuid
  email     String   @unique
  username  String?  @unique
  role      UserRole @default(STUDENT)
  avatar    String?
  grade     Int?     // 年级 (7-9)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // Relations
  progress    UserProgress[]
  attempts    UserAttempt[]
  errorBook   ErrorBook[]
  posts       Post[]
  comments    Comment[]

  @@map("users")
}

enum UserRole {
  STUDENT
  TEACHER
  ADMIN
}

// ============ 课程模块 ============
model Subject {
  id       String    @id @default(uuid()) @db.Uuid
  name     String    @unique // 数学, 物理, 化学...
  icon     String?
  order    Int       @default(0)
  chapters Chapter[]

  @@map("subjects")
}

model Chapter {
  id        String   @id @default(uuid()) @db.Uuid
  subjectId String   @map("subject_id") @db.Uuid
  parentId  String?  @map("parent_id") @db.Uuid // 自关联实现树形结构
  title     String
  order     Int      @default(0)
  createdAt DateTime @default(now()) @map("created_at")

  // Relations
  subject  Subject    @relation(fields: [subjectId], references: [id], onDelete: Cascade)
  parent   Chapter?   @relation("ChapterTree", fields: [parentId], references: [id])
  children Chapter[]  @relation("ChapterTree")
  lessons  Lesson[]
  questions Question[]

  @@index([subjectId])
  @@index([parentId])
  @@map("chapters")
}

model Lesson {
  id         String      @id @default(uuid()) @db.Uuid
  chapterId  String      @map("chapter_id") @db.Uuid
  title      String
  type       LessonType  @default(VIDEO)
  videoUrl   String?     @map("video_url")
  content    String?     @db.Text // Markdown 内容
  duration   Int?        // 视频时长(秒)
  order      Int         @default(0)
  createdAt  DateTime    @default(now()) @map("created_at")

  // Relations
  chapter  Chapter        @relation(fields: [chapterId], references: [id], onDelete: Cascade)
  progress UserProgress[]

  @@index([chapterId])
  @@map("lessons")
}

enum LessonType {
  VIDEO
  DOCUMENT
  EXERCISE
}

// ============ 学习进度 ============
model UserProgress {
  id           String   @id @default(uuid()) @db.Uuid
  userId       String   @map("user_id") @db.Uuid
  lessonId     String   @map("lesson_id") @db.Uuid
  progress     Float    @default(0) // 0-100
  isCompleted  Boolean  @default(false) @map("is_completed")
  lastPosition Int?     @map("last_position") // 视频最后播放位置(秒)
  updatedAt    DateTime @updatedAt @map("updated_at")

  // Relations
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  lesson Lesson @relation(fields: [lessonId], references: [id], onDelete: Cascade)

  @@unique([userId, lessonId])
  @@index([userId])
  @@map("user_progress")
}

// ============ 题库模块 ============
model Question {
  id         String       @id @default(uuid()) @db.Uuid
  chapterId  String       @map("chapter_id") @db.Uuid
  type       QuestionType
  difficulty Int          @default(3) // 1-5星
  content    String       @db.Text // 题干(Markdown+LaTeX)
  options    Json?        // 选项 {"A": "...", "B": "..."}
  answer     Json         // 答案 "A" 或 ["A", "C"]
  explanation String?     @db.Text // 解析
  createdAt  DateTime     @default(now()) @map("created_at")

  // Relations
  chapter   Chapter       @relation(fields: [chapterId], references: [id], onDelete: Cascade)
  attempts  UserAttempt[]
  errorBook ErrorBook[]

  @@index([chapterId])
  @@index([difficulty])
  @@map("questions")
}

enum QuestionType {
  SINGLE_CHOICE
  MULTIPLE_CHOICE
  FILL_BLANK
  ESSAY
}

model UserAttempt {
  id         String   @id @default(uuid()) @db.Uuid
  userId     String   @map("user_id") @db.Uuid
  questionId String   @map("question_id") @db.Uuid
  userAnswer Json     @map("user_answer")
  isCorrect  Boolean  @map("is_correct")
  createdAt  DateTime @default(now()) @map("created_at")

  // Relations
  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  question Question @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([questionId])
  @@index([createdAt])
  @@map("user_attempts")
}

model ErrorBook {
  id           String   @id @default(uuid()) @db.Uuid
  userId       String   @map("user_id") @db.Uuid
  questionId   String   @map("question_id") @db.Uuid
  masteryLevel Int      @default(0) @map("mastery_level") // 0-3
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  // Relations
  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  question Question @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@unique([userId, questionId])
  @@index([userId])
  @@map("error_book")
}

// ============ 社区模块 ============
model Post {
  id        String    @id @default(uuid()) @db.Uuid
  authorId  String    @map("author_id") @db.Uuid
  title     String
  content   String    @db.Text
  subjectId String?   @map("subject_id") @db.Uuid
  likeCount Int       @default(0) @map("like_count")
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")

  // Relations
  author   User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  comments Comment[]

  @@index([authorId])
  @@index([createdAt])
  @@map("posts")
}

model Comment {
  id        String   @id @default(uuid()) @db.Uuid
  postId    String   @map("post_id") @db.Uuid
  authorId  String   @map("author_id") @db.Uuid
  content   String   @db.Text
  createdAt DateTime @default(now()) @map("created_at")

  // Relations
  post   Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  author User @relation(fields: [authorId], references: [id], onDelete: Cascade)

  @@index([postId])
  @@map("comments")
}
```

### 2.2 Auth Sync Trigger

在 Supabase SQL Editor 中执行:

```sql
-- 创建触发器函数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.email, NEW.created_at, NEW.updated_at);
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- 如果用户已存在,忽略错误
    RETURN NEW;
END;
$$;

-- 绑定触发器到 auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 验证触发器
SELECT tgname, tgenabled FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

### 2.3 种子数据脚本

创建 `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 开始播种数据...')

  // 创建学科
  const subjects = await Promise.all([
    prisma.subject.upsert({
      where: { name: '数学' },
      update: {},
      create: { name: '数学', icon: '🔢', order: 1 },
    }),
    prisma.subject.upsert({
      where: { name: '物理' },
      update: {},
      create: { name: '物理', icon: '⚛️', order: 2 },
    }),
    prisma.subject.upsert({
      where: { name: '化学' },
      update: {},
      create: { name: '化学', icon: '🧪', order: 3 },
    }),
    prisma.subject.upsert({
      where: { name: '英语' },
      update: {},
      create: { name: '英语', icon: '🔤', order: 4 },
    }),
    prisma.subject.upsert({
      where: { name: '语文' },
      update: {},
      create: { name: '语文', icon: '📖', order: 5 },
    }),
    prisma.subject.upsert({
      where: { name: '生物' },
      update: {},
      create: { name: '生物', icon: '🧬', order: 6 },
    }),
  ])

  console.log(`✅ 创建了 ${subjects.length} 个学科`)

  // 创建数学章节示例 (3层嵌套)
  const mathSubject = subjects[0]
  const chapter1 = await prisma.chapter.create({
    data: {
      subjectId: mathSubject.id,
      title: '一元二次方程',
      order: 1,
    },
  })

  await prisma.chapter.createMany({
    data: [
      {
        subjectId: mathSubject.id,
        parentId: chapter1.id,
        title: '1.1 方程的解',
        order: 1,
      },
      {
        subjectId: mathSubject.id,
        parentId: chapter1.id,
        title: '1.2 配方法',
        order: 2,
      },
    ],
  })

  console.log('✅ 创建了示例章节')

  // 创建示例题目
  await prisma.question.create({
    data: {
      chapterId: chapter1.id,
      type: 'SINGLE_CHOICE',
      difficulty: 3,
      content: '求解方程 $x^2 + 2x + 1 = 0$ 的根',
      options: {
        A: 'x = -1',
        B: 'x = 1',
        C: 'x = 0',
        D: '无实根',
      },
      answer: 'A',
      explanation: '分解因式: $(x+1)^2 = 0$,得 $x = -1$',
    },
  })

  console.log('✅ 创建了示例题目')

  console.log('🎉 数据播种完成!')
}

main()
  .catch((e) => {
    console.error('❌ 播种失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

更新 `package.json`:

```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  },
  "scripts": {
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio"
  }
}
```

---

## 3. Verification (测试验收)

### 功能性测试

- [ ] 运行 `npx prisma generate`,客户端生成成功
- [ ] 运行 `npx prisma db push`,表结构同步到数据库
- [ ] 运行 `pnpm db:seed`,种子数据插入成功
- [ ] 运行 `pnpm db:studio`,能看到所有表和数据

### Auth Trigger 测试

- [ ] 在 Supabase Dashboard 手动创建一个测试用户
- [ ] 检查 `public.users` 表,应该自动出现对应记录
- [ ] 用户 ID 和 Email 应该与 `auth.users` 一致

### 数据完整性测试

- [ ] 检查 Subject 表有6条记录 (数学到生物)
- [ ] 检查 Chapter 表有至少3条记录 (包含父子关系)
- [ ] 检查 Question 表有至少1条示例题目
- [ ] 验证外键约束: 尝试删除有子章节的章节,应该失败

### 性能基线

- [ ] 查询所有学科: `SELECT * FROM subjects` < 10ms
- [ ] 递归查询章节树: `WITH RECURSIVE ...` < 50ms
- [ ] Prisma Client 连接时间 < 100ms

---

## 4. Deliverables (交付物)

- ✅ 完整的 `prisma/schema.prisma` 文件
- ✅ Auth Trigger SQL 脚本 (保存在 `supabase/migrations/001_auth_trigger.sql`)
- ✅ 种子数据脚本 `prisma/seed.ts`
- ✅ 数据库包含基础数据 (6个学科 + 示例章节)
- ✅ Git Commit: `"feat: add database schema and seed data"`

---

## 5. Definition of Done (完成标准)

### 代码质量

- [ ] Schema 文件通过 `prisma validate` 检查
- [ ] Seed 脚本能重复运行 (使用 upsert 保证幂等性)
- [ ] 所有关系都有正确的 `@relation` 和 `onDelete` 策略

### 数据库安全

- [ ] 敏感字段 (如密码) 不在 Schema 中 (由 Supabase Auth 管理)
- [ ] 所有表都有正确的索引 (外键字段已加索引)
- [ ] Auth Trigger 使用 `SECURITY DEFINER` 确保权限正确

### 文档完整性

- [ ] Schema 关键字段有注释
- [ ] Auth Trigger SQL 保存在版本控制中
- [ ] README 更新: 增加"数据库设置"章节

### 部署就绪

- [ ] Migration 文件已生成 (如果使用 `migrate dev`)
- [ ] Seed 脚本在 CI/CD 中可自动执行
- [ ] 数据库连接字符串已配置到环境变量

---

## 6. Rollback Plan (回滚预案)

**触发条件**:

- Schema 设计错误,需要大改
- Migration 执行失败,数据库状态不一致
- Auth Trigger 导致用户注册失败

**回滚步骤**:

### 方案A: 重置数据库 (开发环境)

```bash
# 1. 删除所有表
npx prisma db push --force-reset

# 2. 修复 Schema 后重新推送
npx prisma db push

# 3. 重新播种数据
pnpm db:seed
```

### 方案B: 删除 Trigger (生产环境)

```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
```

### 方案C: 数据库快照恢复

- Supabase Dashboard → Database → Backups
- 选择最近的自动备份恢复

**预防措施**:

- 在执行 Migration 前,先在 Dev 环境测试
- 关键 Migration 前手动创建数据库备份
- 使用 Prisma Shadow Database (自动测试 Migration)

---

## 7. Post-Completion Actions (完成后行动)

### 立即执行

- [ ] 将此文件从 `backlog/` 移至 `completed/`
- [ ] 更新 `README.md` 进度: "Phase 1: 2/5 completed"
- [ ] 通知团队: "✅ 数据库就绪,可以开始 Story-003 (Auth) 和 Story-004 (Layout)"

### 可选执行

- [ ] 用 Prisma Studio 截图,展示数据结构
- [ ] 记录每张表的字段说明到 Wiki
- [ ] 导出 Schema 的 ER 图 (使用 Prisma ERD Generator)

### 性能监控

- [ ] 记录基线查询性能 (后续用于对比)
- [ ] 配置 Supabase 的慢查询日志 (> 100ms)

### 文档补充

- [ ] 创建 `docs/database/README.md` 包含:
  - 表关系说明
  - 常用查询示例
  - 索引策略说明

---

## 8. Notes & Learnings (开发过程中填写)

### 遇到的坑

_(开发时填写)_

- 示例: Prisma 的 UUID 类型需要明确指定 `@db.Uuid`,否则默认为 String
- 示例: Auth Trigger 初次创建失败,原因是权限不足

### 解决方案

_(开发时填写)_

- 示例: Trigger 函数需要 `SECURITY DEFINER` 修饰符
- 示例: 自关联表 (Chapter) 的 relation name 必须显式指定

### 可复用的代码片段

_(开发时填写)_

```typescript
// Prisma 递归查询章节树的示例
const chapterTree = await prisma.chapter.findMany({
  where: { parentId: null },
  include: {
    children: {
      include: {
        children: true, // 支持3层嵌套
      },
    },
  },
})
```

### 时间记录

- **预估时间**: 4-6 hours
- **实际时间**: \_\_\_ hours
- **偏差分析**: \_\_\_

### 额外发现

- Supabase 提供的 PostgREST API 可以直接查询,但我们遵循"强制使用 Prisma"的规范
- 考虑未来引入 Prisma Pulse (实时数据订阅)

---

**创建时间**: 2025-12-09
**最后更新**: 2025-12-09
**状态**: Backlog ⚪
