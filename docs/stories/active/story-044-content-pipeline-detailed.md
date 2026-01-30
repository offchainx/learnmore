# Story-044: 题目全生命周期管理与数据结构 (Content Pipeline)

**阶段**: Phase 6: Content Infrastructure
**目标**: 建立从源文件到数据库的标准题目录入、处理、打标与审核流程，支持复杂题型结构
**预估时间**: 48-60 Hours
**Story Points**: 34
**前置依赖**: Story-043 (练习中心架构)
**负责人**: _待分配_

---

## 📋 1. Executive Summary (概要)

### 当前状态
- ⚠️ **问题1**: 题目数据来源于简单Mock或手动录入，无标准化流程
- ⚠️ **问题2**: 不支持组合题（一个题干对应多个小题）
- ⚠️ **问题3**: 缺少题目质量控制机制（OCR错误、答案错误）
- ⚠️ **问题4**: 无审核工具，无法批量处理题目

### 目标状态
- ✅ **完整的数据结构**: 支持组合题、富文本、LaTeX、多媒体资源
- ✅ **标准化流水线**: PDF/Image → OCR → 结构化 → 审核 → 发布
- ✅ **质量控制系统**: 自动检查 + 人工审核 + 用户纠错
- ✅ **审核管理工具**: Web Admin 界面，支持批量操作

### 实施策略
**分三个独立任务并行开发**（适配 Vibe Kanban）：

- **Task A (数据基础层)**: Schema设计 + 基础Service - **必须先完成** ⚠️
- **Task B (内容流水线)**: OCR集成 + AI结构化 - **依赖A完成后开始**
- **Task C (审核工具)**: Admin界面 + 质量检查 - **依赖A完成后开始**

**并行开发**: A完成后，B和C可以并行开发 ✅

---

## 🏗️ 2. System Architecture (系统架构)

### 2.1 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                     Content Pipeline                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  [源文件上传]                                                 │
│       ↓                                                       │
│  [Stage A: Ingestion]                                        │
│    - Supabase Storage                                        │
│    - SourceFile 表记录                                        │
│       ↓                                                       │
│  [Stage B: Processing]                                       │
│    - OCR识别 (Google Vision / Mathpix)                       │
│    - AI结构化 (LLM拆分题目)                                   │
│    - 自动打标 (章节、难度、知识点)                            │
│       ↓                                                       │
│  [Stage C: Quality Check]                                    │
│    - 自动检查 (LaTeX语法、图片链接、必填字段)                 │
│    - 去重检测 (内容哈希)                                      │
│       ↓                                                       │
│  [Stage D: Review]                                           │
│    - Admin审核界面                                            │
│    - 状态流转: DRAFT → VERIFIED → PUBLISHED                  │
│       ↓                                                       │
│  [Stage E: Consumption]                                      │
│    - 前端练习系统调用                                         │
│    - 用户纠错反馈                                             │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 三层存储架构（⭐ 重要概念）

**核心设计理念**：将原始文件、OCR数据、结构化题目分三层存储，确保数据可追溯、成本优化、性能最佳。

```
┌─────────────────────────────────────────────────────────────┐
│                    第一层：原始文件层                          │
│  Supabase Storage (对象存储 - 存储原始PDF/图片)                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  - 文件格式：二进制文件（.pdf, .jpg, .png）                    │
│  - 存储路径：source-files/2023/math/exam-paper-1.pdf         │
│  - 特点：永久保留、不可修改、低成本（$0.021/GB/月）             │
│  - 用途：Admin回溯查看原始文件                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   第二层：元数据 + OCR原文层                    │
│  PostgreSQL - SourceFile表                                   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  字段说明：                                                    │
│  - id: uuid（主键）                                           │
│  - filename: "exam-paper-1.pdf"                              │
│  - fileUrl: "https://...supabase.co/.../exam-paper-1.pdf"   │
│  - fileSize: 2048576 (bytes)                                 │
│  - ocrRawText: "OCR识别的原始文本"（⭐ 用于审核时对比）        │
│  - status: PROCESSING / COMPLETED / FAILED                   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  用途：记录处理过程、保存OCR原文、追溯来源                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   第三层：结构化题目数据层                      │
│  PostgreSQL - Question表                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  字段说明：                                                    │
│  - id: uuid（主键）                                           │
│  - content: "解方程：$x^2 - 5x + 6 = 0$"（⭐ 格式化后的内容）   │
│  - type: SINGLE_CHOICE / MULTIPLE_CHOICE / FILL_BLANK / ...  │
│  - options: {"A": "...", "B": "..."}（如果是选择题）          │
│  - answer: ["x=2", "x=3"] 或 "C"（结构化答案）                │
│  - explanation: "使用因式分解..."                              │
│  - sourceFiles: [关联到SourceFile.id]（可追溯源文件）         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  ⭐ 这才是学生最终看到和作答的数据                              │
└─────────────────────────────────────────────────────────────┘
```

**存储层对比表**：

| 存储层 | 存储位置 | 存储内容 | 数据格式 | 访问者 | 成本 |
|--------|----------|----------|----------|--------|------|
| **第一层** | Supabase Storage | 原始PDF/图片 | 二进制文件 | Admin（查看原文件） | 低（$0.021/GB/月） |
| **第二层** | PostgreSQL `SourceFile` | 文件元数据 + OCR原文 | 文本 | Admin（回溯审核） | 中（$0.125/GB/月） |
| **第三层** | PostgreSQL `Question` | 格式化题目数据 | 结构化JSON | 学生（做题）、Admin（审核） | 中 |

**为什么要这样设计？**

1. **数据可追溯**：
   ```
   学生报错："这道题答案错了"
       ↓
   Admin查看Question记录（第三层）
       ↓
   点击"查看源文件" → 找到SourceFile记录（第二层）
       ↓
   查看OCR原文（对比是否识别错误）
       ↓
   下载原始PDF（第一层）- 确认原题内容
   ```

2. **成本优化**：
   - 大文件（PDF/图片）→ Supabase Storage（便宜）
   - 元数据和文本 → PostgreSQL（适中）
   - 学生端只查询Question表（不涉及大文件）

3. **性能优化**：
   - 学生做题：只查询Question表（快速）
   - Admin审核：可选择性加载源文件（按需）

---

### 2.3 完整数据流（Step by Step）

**场景**：Admin上传一份包含25道题的数学试卷PDF

```
┌─ Step 1: 前端上传 ─────────────────────────────────────────┐
│ 用户操作：在 /admin/content/import 拖拽上传 exam.pdf        │
│ 前端代码：                                                   │
│   const fileUrl = await supabase.storage                    │
│     .from('source-files')                                   │
│     .upload('2023/math/exam.pdf', file)                     │
│                                                              │
│ 结果：exam.pdf 保存到 Supabase Storage ✅                    │
│ 路径：source-files/2023/math/exam.pdf                       │
└──────────────────────────────────────────────────────────────┘
                         ↓
┌─ Step 2: 创建SourceFile记录 ───────────────────────────────┐
│ Server Action: importFromPDF(fileUrl, metadata)             │
│ 数据库操作：                                                 │
│   const sourceFile = await prisma.sourceFile.create({       │
│     filename: 'exam.pdf',                                   │
│     fileUrl: 'https://...storage.../exam.pdf',             │
│     status: 'PROCESSING'                                    │
│   })                                                        │
│                                                              │
│ 结果：PostgreSQL中新增1条SourceFile记录 ✅                   │
│ 状态：PROCESSING（处理中）                                   │
└──────────────────────────────────────────────────────────────┘
                         ↓
┌─ Step 3: OCR识别 ──────────────────────────────────────────┐
│ Service: OCRService.processPDF(fileUrl)                     │
│ 处理逻辑：                                                   │
│   1. 将PDF转为图片（每页一张）                               │
│   2. 调用Google Vision API识别文字                          │
│   3. 合并所有页的文本                                        │
│                                                              │
│ OCR结果：                                                    │
│   "1. 解方程：x² - 5x + 6 = 0                               │
│    答案：x=2或x=3                                            │
│    2. 计算：3x + 5 = 20 时，x的值是多少？                    │
│    ..."                                                     │
│                                                              │
│ 数据库操作：                                                 │
│   await prisma.sourceFile.update({                          │
│     ocrRawText: fullText,  // ⭐ 保存OCR原文                 │
│     ocrStatus: 'COMPLETED'                                  │
│   })                                                        │
│                                                              │
│ 结果：SourceFile.ocrRawText 字段保存OCR文本 ✅               │
└──────────────────────────────────────────────────────────────┘
                         ↓
┌─ Step 4: AI结构化拆分 ─────────────────────────────────────┐
│ Service: AIStructurer.structureQuestions(ocrText)           │
│ AI Prompt：                                                  │
│   "将以下文本拆分为标准题目格式，返回JSON数组..."             │
│                                                              │
│ AI返回结果：                                                 │
│   [                                                          │
│     {                                                        │
│       content: "解方程：$x^2 - 5x + 6 = 0$",                │
│       type: "FILL_BLANK",                                   │
│       answer: ["x=2", "x=3"],                               │
│       estimatedDifficulty: 3                                │
│     },                                                       │
│     { ... 第2题 },                                          │
│     { ... 第3-25题 }                                        │
│   ]                                                          │
│                                                              │
│ 结果：25道题目的结构化数据 ✅                                │
└──────────────────────────────────────────────────────────────┘
                         ↓
┌─ Step 5: 批量创建Question记录 ─────────────────────────────┐
│ Server Action: bulkCreateQuestions(questions, sourceFileId) │
│ 数据库操作：                                                 │
│   for (const q of questions) {                              │
│     await prisma.question.create({                          │
│       content: q.content,                                   │
│       type: q.type,                                         │
│       answer: q.answer,                                     │
│       status: 'REVIEW_PENDING',  // 待审核                  │
│       sourceFiles: {                                        │
│         connect: { id: sourceFileId }  // ⭐ 关联源文件      │
│       }                                                     │
│     })                                                      │
│   }                                                         │
│                                                              │
│ 结果：PostgreSQL中新增25条Question记录 ✅                    │
│ 状态：REVIEW_PENDING（等待Admin审核）                        │
└──────────────────────────────────────────────────────────────┘
                         ↓
┌─ Step 6: Admin审核 ────────────────────────────────────────┐
│ Admin访问：/admin/content                                    │
│ 看到：25道待审核题目                                         │
│                                                              │
│ 点击某道题进入详情页：                                       │
│ - 左侧：格式化的题目内容（Question.content）                 │
│ - 右侧：质量分数、审核操作                                   │
│ - 底部（可选）：OCR原文（SourceFile.ocrRawText）- 对比用     │
│                                                              │
│ 审核通过：updateQuestionStatus(id, 'VERIFIED')               │
│ 结果：Question.status → VERIFIED ✅                          │
└──────────────────────────────────────────────────────────────┘
                         ↓
┌─ Step 7: 发布到学生端 ─────────────────────────────────────┐
│ Admin批量发布：updateQuestionStatus(ids, 'PUBLISHED')        │
│ 结果：Question.status → PUBLISHED ✅                         │
│                                                              │
│ 学生访问：/dashboard/practice/smart-drill                    │
│ 查询：                                                       │
│   const questions = await prisma.question.findMany({        │
│     where: { status: 'PUBLISHED' }                          │
│   })                                                        │
│                                                              │
│ 学生看到：                                                   │
│   {                                                          │
│     content: "解方程：$x^2 - 5x + 6 = 0$",                  │
│     type: "FILL_BLANK",                                     │
│     options: null                                           │
│   }                                                          │
│                                                              │
│ ⚠️ 学生看不到：                                              │
│ - 原始PDF文件                                                │
│ - OCR原文                                                    │
│ - 源文件信息                                                 │
└──────────────────────────────────────────────────────────────┘
```

**关键时间点总结**：

| 步骤 | 数据存储位置 | 状态 | 谁可以访问 |
|------|-------------|------|-----------|
| Step 1 | Supabase Storage | - | 仅系统内部 |
| Step 2 | PostgreSQL `SourceFile` | PROCESSING | Admin |
| Step 3 | `SourceFile.ocrRawText` | OCR_COMPLETED | Admin |
| Step 4 | 内存中 | - | - |
| Step 5 | PostgreSQL `Question` | REVIEW_PENDING | Admin |
| Step 6 | `Question` | VERIFIED | Admin |
| Step 7 | `Question` | PUBLISHED | 学生 + Admin |

---

### 2.4 数据模型关系图

```
SourceFile (源文件)
    ↓ 1:N
QuestionGroup (题组/组合题)
    ↓ 1:N
Question (题目)
    ↓ N:M
QuestionTag (标签)
    ↓
KnowledgePoint (知识点)

ContentReviewLog (审核日志) → 关联 Question/QuestionGroup
QuestionReport (用户纠错) → 关联 Question
```

---

### 2.5 技术栈选型

| 组件 | 技术方案 | 备注 |
|------|----------|------|
| 文件存储 | Supabase Storage | 支持CDN加速 |
| OCR服务 | Google Vision API + Mathpix | 混合策略降低成本 |
| AI结构化 | Claude 3.5 Sonnet / Gemini 1.5 Pro | 用于拆分组合题 |
| 去重算法 | MD5 Hash + Levenshtein距离 | 纯算法，0成本 |
| Admin界面 | Next.js + Shadcn/ui | 复用现有技术栈 |
| LaTeX渲染 | KaTeX | 已有 |

---

## 🎯 3. Feature Breakdown (功能拆解)

### ⚠️ 依赖关系说明

```
Task A (数据基础层)
    ├── 必须先完成
    └── 提供: 数据库Schema + 基础CRUD API

Task B (内容流水线)        Task C (审核工具)
    ├── 依赖: Task A            ├── 依赖: Task A
    ├── 可并行开发 ✅           ├── 可并行开发 ✅
    └── 独立Git分支            └── 独立Git分支
```

---

## 📦 Task A: 数据基础层 (P0, 必须先完成)

### 🎯 你需要完成什么？

**核心任务**：搭建内容管道的数据基础，创建所有必需的数据库表和基础API。

**为什么必须先完成Task A？**
- Task B（内容流水线）需要调用你创建的API来保存题目
- Task C（审核工具）需要查询你创建的数据表来显示题目列表
- Task A完成后，B和C可以并行开发

**你将创建的内容**：
1. **10个新数据表**（Prisma Schema）：
   - SourceFile（源文件）
   - QuestionGroup（组合题）
   - Question（题目，重构版）
   - QuestionTag（标签）
   - KnowledgePoint（知识点）
   - QuestionTagRelation（题目-标签关联）
   - KnowledgePointRelation（题目-知识点关联）
   - ContentReviewLog（审核日志）
   - QuestionReport（用户纠错）
   - 以及相关Enum类型

2. **基础Server Actions**（`src/actions/content-pipeline/question-service.ts`）：
   - `createQuestion()` - 创建单个题目
   - `bulkCreateQuestions()` - 批量创建题目
   - `updateQuestionStatus()` - 更新题目状态（含审核日志）
   - `getPendingReviewQuestions()` - 查询待审核题目
   - `reportQuestion()` - 用户报错功能

3. **TypeScript类型定义**（`src/lib/content-pipeline/types.ts`）：
   - QuestionWithRelations
   - QuestionFilter
   - OCRResult
   - QualityCheckResult
   - 等...

4. **单元测试**：
   - 内容哈希生成测试
   - 状态转换验证测试

---

### 📋 交付物清单

完成Task A后，你需要交付：

- [ ] **A1: Prisma Schema迁移文件**
  - 文件位置：`prisma/migrations/XXX_add_content_pipeline_schema/migration.sql`
  - 可运行：`npx prisma migrate dev` 无报错

- [ ] **A2: 基础CRUD Server Actions**
  - 文件位置：`src/actions/content-pipeline/question-service.ts`
  - 包含至少5个核心函数（见上方列表）
  - 所有函数包含错误处理和JSDoc注释

- [ ] **A3: TypeScript类型定义**
  - 文件位置：`src/lib/content-pipeline/types.ts`
  - 所有接口导出可用

- [ ] **A4: 单元测试**
  - 文件位置：`src/lib/content-pipeline/__tests__/question-service.test.ts`
  - 至少2个测试用例通过

---

### ✅ 验收标准（如何确认完成？）

运行以下命令，全部通过才算完成：

```bash
# 1. Schema迁移成功
npx prisma migrate dev
# 预期：显示 "Migration applied successfully"

# 2. 生成Prisma Client无报错
npx prisma generate
# 预期：显示 "Generated Prisma Client"

# 3. TypeScript编译通过
pnpm tsc --noEmit
# 预期：0 errors

# 4. 单元测试通过
pnpm test src/lib/content-pipeline
# 预期：All tests passed

# 5. 可以创建一条Question记录
node -e "
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  prisma.question.create({
    data: {
      content: '测试题目',
      type: 'SINGLE_CHOICE',
      answer: 'A',
      difficulty: 3
    }
  }).then(q => console.log('Success:', q.id));
"
# 预期：输出 "Success: <uuid>"
```

---

### 🔗 Task A与其他Task的关系

```
Task A完成后提供给Task B的API：
  - bulkCreateQuestions() ← Task B导入题目时调用

Task A完成后提供给Task C的API：
  - getPendingReviewQuestions() ← Task C审核列表页调用
  - updateQuestionStatus() ← Task C审核通过/拒绝时调用
  - reportQuestion() ← Task C用户纠错功能调用

Task A完成后提供给Task B/C的数据表：
  - SourceFile表 ← Task B写入，Task C读取
  - Question表 ← Task B写入，Task C读取和更新
  - ContentReviewLog表 ← Task C写入
```

---

### 📝 开发步骤建议

**Step 1: 编写Prisma Schema（2-3小时）**
- 复制下面A1部分的完整Schema代码
- 粘贴到 `prisma/schema.prisma`
- 运行 `npx prisma migrate dev --name add_content_pipeline_schema`

**Step 2: 实现基础Server Actions（3-4小时）**
- 创建 `src/actions/content-pipeline/question-service.ts`
- 逐个实现5个核心函数
- 测试每个函数是否可用

**Step 3: 编写类型定义（1小时）**
- 创建 `src/lib/content-pipeline/types.ts`
- 定义所有接口和类型

**Step 4: 编写单元测试（1-2小时）**
- 创建测试文件
- 至少覆盖哈希生成和状态转换逻辑

**Step 5: 验证交付（30分钟）**
- 运行验收标准中的所有命令
- 确保全部通过

**总预计时间**: 8-11小时

---

## 🔧 Task A 详细实施指南

#### A1: 数据库Schema设计与迁移

**核心表结构**：

```prisma
// ==================== 源文件管理 ====================
model SourceFile {
  id          String   @id @default(uuid()) @db.Uuid
  filename    String
  fileUrl     String   // Supabase Storage URL
  fileType    String   // "pdf" | "image" | "docx"
  fileSize    Int      // bytes

  // 处理状态
  status      ProcessingStatus @default(UPLOADED)
  ocrStatus   ProcessingStatus @default(PENDING)
  ocrRawText  String?  @db.Text  // OCR原始输出

  // 关联
  questionGroups QuestionGroup[] @relation("SourceToGroup")
  questions      Question[]      @relation("SourceToQuestion")

  // 审计
  uploadedBy  String   @db.Uuid
  uploader    User     @relation(fields: [uploadedBy], references: [id])
  createdAt   DateTime @default(now()) @map("created_at")
  processedAt DateTime? @map("processed_at")

  @@map("source_files")
}

enum ProcessingStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  SKIPPED
}

// ==================== 组合题/题组 ====================
model QuestionGroup {
  id          String   @id @default(uuid()) @db.Uuid
  content     String   @db.Text  // 公共题干（支持Markdown + LaTeX）
  materialUrl String?  // 辅助资源URL（图片/音频）

  // 元数据
  subjectId   String   @db.Uuid
  subject     Subject  @relation(fields: [subjectId], references: [id], onDelete: Cascade)
  source      String?  // 来源标识 (e.g. "2023年中考数学真题")
  sourceYear  Int?     // 年份
  sourcePaper String?  // 试卷名

  // 状态与版本
  status      ContentStatus @default(DRAFT)
  version     Int      @default(1)

  // 关联
  questions   Question[]
  sourceFiles SourceFile[] @relation("SourceToGroup")

  // 审计字段
  createdBy   String?  @db.Uuid
  reviewedBy  String?  @db.Uuid
  publishedBy String?  @db.Uuid
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  reviewedAt  DateTime? @map("reviewed_at")
  publishedAt DateTime? @map("published_at")

  @@map("question_groups")
}

// ==================== 题目表（重构版） ====================
model Question {
  id          String   @id @default(uuid()) @db.Uuid

  // 基础内容
  content     String   @db.Text  // 题目内容（Markdown + LaTeX）
  type        QuestionType
  difficulty  Int      @default(3)  // 1-5

  // 选项与答案
  options     Json?    // { "A": "...", "B": "..." }
  answer      Json     // 根据type存储不同格式
  explanation String?  @db.Text  // 解析

  // 关联
  chapterId   String?  @db.Uuid
  chapter     Chapter? @relation(fields: [chapterId], references: [id], onDelete: SetNull)

  groupId     String?  @db.Uuid
  group       QuestionGroup? @relation(fields: [groupId], references: [id], onDelete: Cascade)

  // 标签与知识点（多对多）
  tags        QuestionTagRelation[]
  knowledgePoints KnowledgePointRelation[]

  // 状态与版本
  status      ContentStatus @default(DRAFT)
  version     Int      @default(1)
  originalQuestionId String? @db.Uuid  // 指向原始题目（用于版本追溯）

  // OCR数据（用于回溯）
  ocrRawText  String?  @db.Text
  ocrConfidence Float?  // 0-1
  contentHash String?  @unique  // MD5哈希（用于去重）

  // 质量评分
  qualityScore Float?  // 0-100（自动质量检查分数）
  reportCount  Int     @default(0)  // 被报错次数

  // 源文件
  sourceFiles SourceFile[] @relation("SourceToQuestion")

  // 审计字段
  createdBy   String?  @db.Uuid
  reviewedBy  String?  @db.Uuid
  publishedBy String?  @db.Uuid
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  // 现有关联（保留）
  userAttempts UserAttempt[]
  errorBooks   ErrorBook[]

  @@index([chapterId])
  @@index([status])
  @@index([contentHash])
  @@map("questions")
}

enum QuestionType {
  SINGLE_CHOICE
  MULTIPLE_CHOICE
  FILL_BLANK
  ESSAY
  TRUE_FALSE
}

enum ContentStatus {
  DRAFT           // 草稿
  OCR_PROCESSING  // OCR处理中
  OCR_COMPLETED   // OCR完成
  STRUCTURING     // 结构化中
  REVIEW_PENDING  // 待审核
  REVIEW_REJECTED // 审核拒绝
  VERIFIED        // 已验证
  PUBLISHED       // 已发布
  ARCHIVED        // 已归档
}

// ==================== 标签体系 ====================
model QuestionTag {
  id         String   @id @default(uuid()) @db.Uuid
  name       String   @unique  // "函数"、"导数"
  category   TagCategory
  color      String?  // 标签颜色

  // 层级结构
  parentId   String?  @db.Uuid
  parent     QuestionTag? @relation("TagHierarchy", fields: [parentId], references: [id], onDelete: Cascade)
  children   QuestionTag[] @relation("TagHierarchy")

  // 关联
  questions  QuestionTagRelation[]

  createdAt  DateTime @default(now()) @map("created_at")

  @@map("question_tags")
}

enum TagCategory {
  SUBJECT          // 科目
  TOPIC            // 知识点
  DIFFICULTY       // 难度
  COGNITIVE_LEVEL  // 认知层级（布鲁姆分类）
  QUESTION_TYPE    // 题型
  SOURCE           // 来源（真题/模拟题）
}

// 多对多关联表
model QuestionTagRelation {
  questionId String   @db.Uuid
  tagId      String   @db.Uuid

  question   Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
  tag        QuestionTag @relation(fields: [tagId], references: [id], onDelete: Cascade)

  createdAt  DateTime @default(now()) @map("created_at")

  @@id([questionId, tagId])
  @@map("question_tag_relations")
}

// ==================== 知识点体系 ====================
model KnowledgePoint {
  id          String   @id @default(uuid()) @db.Uuid
  code        String   @unique  // "MATH-001-001"
  name        String   // "一元一次方程"
  description String?  @db.Text

  subjectId   String   @db.Uuid
  subject     Subject  @relation(fields: [subjectId], references: [id], onDelete: Cascade)

  // 层级结构
  parentId    String?  @db.Uuid
  parent      KnowledgePoint? @relation("KPHierarchy", fields: [parentId], references: [id], onDelete: Cascade)
  children    KnowledgePoint[] @relation("KPHierarchy")

  // 关联
  questions   KnowledgePointRelation[]

  createdAt   DateTime @default(now()) @map("created_at")

  @@map("knowledge_points")
}

// 多对多关联表
model KnowledgePointRelation {
  questionId String   @db.Uuid
  kpId       String   @db.Uuid

  question   Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
  kp         KnowledgePoint @relation(fields: [kpId], references: [id], onDelete: Cascade)

  createdAt  DateTime @default(now()) @map("created_at")

  @@id([questionId, kpId])
  @@map("question_kp_relations")
}

// ==================== 审核日志 ====================
model ContentReviewLog {
  id          String   @id @default(uuid()) @db.Uuid
  contentType String   // "question" | "question_group"
  contentId   String   @db.Uuid

  action      ReviewAction
  fromStatus  ContentStatus
  toStatus    ContentStatus

  reviewerId  String   @db.Uuid
  reviewer    User     @relation(fields: [reviewerId], references: [id])

  comment     String?  @db.Text  // 审核意见
  changes     Json?    // 修改内容（JSON diff）

  createdAt   DateTime @default(now()) @map("created_at")

  @@index([contentType, contentId])
  @@index([reviewerId])
  @@map("content_review_logs")
}

enum ReviewAction {
  SUBMIT_REVIEW   // 提交审核
  APPROVE         // 通过
  REJECT          // 拒绝
  REQUEST_CHANGE  // 请求修改
  PUBLISH         // 发布
  ARCHIVE         // 归档
}

// ==================== 用户纠错 ====================
model QuestionReport {
  id          String   @id @default(uuid()) @db.Uuid
  questionId  String   @db.Uuid
  question    Question @relation(fields: [questionId], references: [id], onDelete: Cascade)

  reportedBy  String   @db.Uuid
  reporter    User     @relation(fields: [reportedBy], references: [id])

  issueType   ReportIssueType
  description String   @db.Text
  status      ReportStatus @default(PENDING)

  // 审核处理
  reviewedBy  String?  @db.Uuid
  reviewedAt  DateTime? @map("reviewed_at")
  resolution  String?  @db.Text  // 处理结果

  createdAt   DateTime @default(now()) @map("created_at")

  @@index([questionId])
  @@index([status])
  @@map("question_reports")
}

enum ReportIssueType {
  ANSWER_WRONG  // 答案错误
  TYPO          // 错别字
  UNCLEAR       // 表述不清
  IMAGE_BROKEN  // 图片损坏
  LATEX_ERROR   // 公式错误
  OTHER         // 其他
}

enum ReportStatus {
  PENDING       // 待处理
  REVIEWING     // 审核中
  RESOLVED      // 已解决
  REJECTED      // 无效报告
}
```

**实施步骤**：

```bash
# Task A1.1: 创建 migration 文件
npx prisma migrate dev --name add_content_pipeline_schema --create-only

# Task A1.2: 手动审查 SQL（检查索引、外键）

# Task A1.3: 应用 migration
npx prisma migrate dev

# Task A1.4: 生成 Prisma Client
npx prisma generate

# Task A1.5: 更新旧Question表（可选）
# ALTER TABLE "Question" RENAME TO "Question_Legacy";
```

**高效Prompt**：
```
请根据以上Prisma Schema完成以下任务：

1. 创建完整的 migration 文件
2. 确保所有外键设置 onDelete: Cascade
3. 为高频查询字段添加索引：
   - Question: chapterId, status, contentHash
   - ContentReviewLog: contentType + contentId, reviewerId
   - QuestionReport: questionId, status
4. 验证Schema语法正确性（npx prisma validate）
```

---

#### A2: 基础CRUD Server Actions

**核心文件**: `src/actions/content-pipeline/question-service.ts`

```typescript
'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { ContentStatus, QuestionType } from '@prisma/client'

// ==================== 题目CRUD ====================

/**
 * 创建题目（草稿状态）
 */
export async function createQuestion(data: CreateQuestionInput) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')

  // 生成内容哈希（用于去重）
  const contentHash = generateContentHash(data.content)

  // 检查是否已存在相同题目
  const existing = await prisma.question.findUnique({
    where: { contentHash }
  })
  if (existing) {
    return {
      success: false,
      error: 'DUPLICATE_QUESTION',
      existingId: existing.id
    }
  }

  const question = await prisma.question.create({
    data: {
      ...data,
      contentHash,
      status: ContentStatus.DRAFT,
      createdBy: user.id,
    }
  })

  revalidatePath('/admin/content')
  return { success: true, questionId: question.id }
}

/**
 * 批量创建题目（用于OCR导入）
 */
export async function bulkCreateQuestions(
  questions: CreateQuestionInput[],
  sourceFileId: string
) {
  const user = await getCurrentUser()
  if (!user || !['ADMIN', 'TEACHER'].includes(user.role)) {
    throw new Error('Unauthorized')
  }

  const result = await prisma.$transaction(async (tx) => {
    const created = []
    const duplicates = []

    for (const q of questions) {
      const hash = generateContentHash(q.content)

      // 去重检查
      const existing = await tx.question.findUnique({
        where: { contentHash: hash }
      })

      if (existing) {
        duplicates.push({ ...q, existingId: existing.id })
        continue
      }

      const question = await tx.question.create({
        data: {
          ...q,
          contentHash: hash,
          status: ContentStatus.DRAFT,
          createdBy: user.id,
          sourceFiles: {
            connect: { id: sourceFileId }
          }
        }
      })

      created.push(question)
    }

    return { created, duplicates }
  })

  return result
}

/**
 * 更新题目状态（带审核日志）
 */
export async function updateQuestionStatus(
  questionId: string,
  toStatus: ContentStatus,
  comment?: string
) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')

  const question = await prisma.question.findUnique({
    where: { id: questionId }
  })
  if (!question) throw new Error('Question not found')

  // 验证状态转换合法性
  if (!isValidTransition(question.status, toStatus)) {
    throw new Error(`Invalid status transition: ${question.status} -> ${toStatus}`)
  }

  await prisma.$transaction([
    // 更新题目状态
    prisma.question.update({
      where: { id: questionId },
      data: {
        status: toStatus,
        reviewedBy: user.id,
        reviewedAt: new Date(),
        ...(toStatus === ContentStatus.PUBLISHED && {
          publishedBy: user.id,
          publishedAt: new Date()
        })
      }
    }),

    // 记录审核日志
    prisma.contentReviewLog.create({
      data: {
        contentType: 'question',
        contentId: questionId,
        action: getReviewAction(toStatus),
        fromStatus: question.status,
        toStatus,
        reviewerId: user.id,
        comment
      }
    })
  ])

  revalidatePath('/admin/content')
  return { success: true }
}

/**
 * 查询待审核题目列表
 */
export async function getPendingReviewQuestions(params: {
  subjectId?: string
  limit?: number
  offset?: number
}) {
  const questions = await prisma.question.findMany({
    where: {
      status: ContentStatus.REVIEW_PENDING,
      ...(params.subjectId && {
        chapter: {
          subjectId: params.subjectId
        }
      })
    },
    include: {
      chapter: {
        include: { subject: true }
      },
      tags: {
        include: { tag: true }
      },
      _count: {
        select: {
          userAttempts: true,
          errorBooks: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: params.limit || 20,
    skip: params.offset || 0
  })

  return questions
}

/**
 * 用户报错题目
 */
export async function reportQuestion(data: {
  questionId: string
  issueType: ReportIssueType
  description: string
}) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')

  const report = await prisma.questionReport.create({
    data: {
      ...data,
      reportedBy: user.id,
      status: 'PENDING'
    }
  })

  // 更新题目的报错计数
  await prisma.question.update({
    where: { id: data.questionId },
    data: {
      reportCount: { increment: 1 }
    }
  })

  // 如果报错数 >= 3，自动标记为待复审
  const question = await prisma.question.findUnique({
    where: { id: data.questionId }
  })

  if (question && question.reportCount >= 3 && question.status === ContentStatus.PUBLISHED) {
    await updateQuestionStatus(data.questionId, ContentStatus.REVIEW_PENDING, '收到多条用户报错')
  }

  return { success: true, reportId: report.id }
}

// ==================== 辅助函数 ====================

function generateContentHash(content: string): string {
  const normalized = content
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[,，.。!！?？]/g, '')

  return crypto.createHash('md5').update(normalized).digest('hex')
}

function isValidTransition(from: ContentStatus, to: ContentStatus): boolean {
  const transitions: Record<ContentStatus, ContentStatus[]> = {
    DRAFT: ['REVIEW_PENDING', 'ARCHIVED'],
    OCR_PROCESSING: ['OCR_COMPLETED', 'FAILED'],
    OCR_COMPLETED: ['STRUCTURING'],
    STRUCTURING: ['REVIEW_PENDING', 'FAILED'],
    REVIEW_PENDING: ['VERIFIED', 'REVIEW_REJECTED'],
    REVIEW_REJECTED: ['DRAFT'],
    VERIFIED: ['PUBLISHED'],
    PUBLISHED: ['ARCHIVED', 'REVIEW_PENDING'],
    ARCHIVED: ['DRAFT'],
  }

  return transitions[from]?.includes(to) ?? false
}

function getReviewAction(status: ContentStatus): ReviewAction {
  const mapping: Record<ContentStatus, ReviewAction> = {
    VERIFIED: 'APPROVE',
    PUBLISHED: 'PUBLISH',
    REVIEW_REJECTED: 'REJECT',
    ARCHIVED: 'ARCHIVE',
    // ... 其他映射
  }
  return mapping[status] || 'SUBMIT_REVIEW'
}

// ==================== 类型定义 ====================

interface CreateQuestionInput {
  content: string
  type: QuestionType
  difficulty: number
  options?: any
  answer: any
  explanation?: string
  chapterId?: string
  groupId?: string
}
```

**实施步骤**：

```
Task A2.1: 实现基础CRUD (createQuestion, updateQuestion, deleteQuestion)
Task A2.2: 实现批量操作 (bulkCreateQuestions, bulkUpdateStatus)
Task A2.3: 实现状态管理 (updateQuestionStatus, 状态机验证)
Task A2.4: 实现查询接口 (getPendingReviewQuestions, getQuestionsByChapter)
Task A2.5: 实现用户纠错 (reportQuestion, getQuestionReports)
```

**高效Prompt**：
```
请实现 src/actions/content-pipeline/question-service.ts，包含：

1. 基础CRUD操作（增删改查）
2. 批量导入接口（bulkCreateQuestions）
3. 状态管理与审核流程（updateQuestionStatus + 审核日志）
4. 去重检查（基于contentHash）
5. 用户纠错功能（reportQuestion）

要求：
- 所有函数包含完整的错误处理
- 使用 Prisma Transaction 保证原子性
- 包含 JSDoc 注释
- 返回类型安全的结果对象
```

---

#### A3: TypeScript类型定义

**核心文件**: `src/lib/content-pipeline/types.ts`

```typescript
import {
  Question,
  QuestionGroup,
  ContentStatus,
  QuestionType,
  ProcessingStatus
} from '@prisma/client'

// ==================== 扩展类型 ====================

export type QuestionWithRelations = Question & {
  chapter?: {
    id: string
    title: string
    subject: {
      id: string
      name: string
    }
  }
  group?: QuestionGroup
  tags: Array<{
    tag: {
      id: string
      name: string
      category: string
    }
  }>
  knowledgePoints: Array<{
    kp: {
      id: string
      code: string
      name: string
    }
  }>
  _count?: {
    userAttempts: number
    errorBooks: number
  }
}

export interface QuestionFilter {
  subjectId?: string
  chapterId?: string
  status?: ContentStatus
  difficulty?: number[]
  type?: QuestionType[]
  tags?: string[]
  searchKeyword?: string
  createdAfter?: Date
  createdBefore?: Date
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// ==================== OCR相关 ====================

export interface OCRResult {
  text: string
  confidence: number
  language: string
  provider: 'google_vision' | 'mathpix' | 'tesseract'
  rawData?: any
}

export interface StructuredQuestion {
  content: string
  type: QuestionType
  options?: Record<string, string>
  answer: any
  explanation?: string
  estimatedDifficulty?: number
  suggestedTags?: string[]
}

// ==================== 质量检查 ====================

export interface QualityCheckResult {
  isValid: boolean
  score: number  // 0-100
  issues: QualityIssue[]
  suggestions: string[]
}

export interface QualityIssue {
  type: 'ERROR' | 'WARNING' | 'INFO'
  category: string
  message: string
  field?: string
  metadata?: Record<string, any>
}

export const QualityIssueType = {
  MISSING_CONTENT: 'MISSING_CONTENT',
  INVALID_LATEX: 'INVALID_LATEX',
  BROKEN_IMAGE: 'BROKEN_IMAGE',
  INSUFFICIENT_OPTIONS: 'INSUFFICIENT_OPTIONS',
  MISSING_ANSWER: 'MISSING_ANSWER',
  NO_KNOWLEDGE_POINTS: 'NO_KNOWLEDGE_POINTS',
  DUPLICATE_CONTENT: 'DUPLICATE_CONTENT',
} as const

// ==================== 审核相关 ====================

export interface ReviewSummary {
  totalPending: number
  totalReviewed: number
  approvalRate: number
  avgReviewTime: number  // 分钟
  topReviewers: Array<{
    userId: string
    username: string
    reviewCount: number
  }>
}

export interface ContentStatistics {
  totalQuestions: number
  publishedQuestions: number
  draftQuestions: number
  rejectedQuestions: number
  bySubject: Record<string, number>
  byDifficulty: Record<number, number>
  byStatus: Record<ContentStatus, number>
}
```

---

#### A4: 单元测试

**测试文件**: `src/lib/content-pipeline/__tests__/question-service.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { generateContentHash, isValidTransition } from '../question-service'

describe('Content Hash Generation', () => {
  it('should generate same hash for identical content', () => {
    const content1 = '解方程: x + 2 = 5'
    const content2 = '解方程:x+2=5'  // 空格不同

    const hash1 = generateContentHash(content1)
    const hash2 = generateContentHash(content2)

    expect(hash1).toBe(hash2)
  })

  it('should generate different hash for different content', () => {
    const content1 = 'x + 2 = 5'
    const content2 = 'x + 3 = 6'

    const hash1 = generateContentHash(content1)
    const hash2 = generateContentHash(content2)

    expect(hash1).not.toBe(hash2)
  })
})

describe('Status Transition Validation', () => {
  it('should allow DRAFT -> REVIEW_PENDING', () => {
    expect(isValidTransition('DRAFT', 'REVIEW_PENDING')).toBe(true)
  })

  it('should reject DRAFT -> PUBLISHED', () => {
    expect(isValidTransition('DRAFT', 'PUBLISHED')).toBe(false)
  })

  it('should allow PUBLISHED -> REVIEW_PENDING (for user reports)', () => {
    expect(isValidTransition('PUBLISHED', 'REVIEW_PENDING')).toBe(true)
  })
})
```

---

### Task A 验证清单

- [ ] Prisma Schema 迁移成功（`npx prisma migrate dev`）
- [ ] 所有Server Actions编译通过（`pnpm tsc --noEmit`）
- [ ] 单元测试通过（`pnpm test`）
- [ ] 可以创建/查询/更新题目
- [ ] 状态转换逻辑正确
- [ ] 去重功能正常工作

---

## 🔄 Task B: 内容流水线 (依赖Task A，可与C并行)

### 🎯 你需要完成什么？

**核心任务**：实现从PDF上传到生成结构化题目的全自动处理流程。

**前置条件**：
- ✅ Task A已完成（可以调用 `bulkCreateQuestions()` API）
- ✅ Supabase Storage已配置（存储源文件）
- ✅ 获取API密钥：Google Vision API、Anthropic Claude API

**你将实现的流程**：
```
用户上传PDF → OCR识别文字 → AI拆分题目 → 质量检查 → 保存到数据库
    ↓              ↓                ↓              ↓              ↓
Supabase      Google Vision    Claude API    自动检查      Task A的API
Storage       (成本: ~$0.001/页) (成本: ~$0.01/题) (免费)     (bulkCreateQuestions)
```

**你将创建的核心组件**：

1. **OCR服务类**（`src/lib/content-pipeline/ocr-service.ts`）
   - 支持3种OCR提供商（优先级降级）
   - PDF转图片功能
   - 成本控制机制

2. **AI结构化类**（`src/lib/content-pipeline/ai-structurer.ts`）
   - 调用Claude API拆分题目
   - Prompt工程优化
   - JSON输出解析

3. **批量导入Server Action**（`src/actions/content-pipeline/import-service.ts`）
   - `importFromPDF()` - 完整导入流程
   - `resumeFailedImport()` - 失败恢复
   - 进度追踪

4. **质量检查器**（`src/lib/content-pipeline/quality-checker.ts`）
   - LaTeX语法检查
   - 必填字段检查
   - 图片链接有效性检查
   - 计算质量分数（0-100）

---

### 📋 交付物清单

完成Task B后，你需要交付：

- [ ] **B1: OCR服务集成**
  - 文件：`src/lib/content-pipeline/ocr-service.ts`
  - 文件：`src/lib/content-pipeline/providers/google-vision.ts`
  - 文件：`src/lib/content-pipeline/providers/mathpix.ts`（可选）
  - 文件：`src/lib/content-pipeline/providers/tesseract.ts`（降级方案）
  - 可成功识别PDF文字，置信度>85%

- [ ] **B2: AI结构化处理**
  - 文件：`src/lib/content-pipeline/ai-structurer.ts`
  - 可将OCR文本拆分为结构化题目JSON
  - 准确率>90%

- [ ] **B3: 批量导入工具**
  - 文件：`src/actions/content-pipeline/import-service.ts`
  - `importFromPDF()` 函数完整实现
  - 支持断点续传

- [ ] **B4: 自动质量检查**
  - 文件：`src/lib/content-pipeline/quality-checker.ts`
  - 可检测至少5种质量问题
  - 计算质量分数

---

### ✅ 验收标准（如何确认完成？）

**测试流程**：上传一份真实的PDF试卷，验证全流程

```bash
# 1. 准备测试文件
# 下载一份数学试卷PDF（5-10道题）

# 2. 运行导入命令（通过Server Action）
# 在Next.js应用中调用：
await importFromPDF(
  'https://your-storage.com/test-exam.pdf',
  {
    subjectId: '<数学科目ID>',
    source: '测试试卷',
    sourceYear: 2023
  }
)

# 3. 验证结果
# 查询数据库：
const questions = await prisma.question.findMany({
  where: {
    sourceFiles: {
      some: { filename: 'test-exam.pdf' }
    }
  }
})

console.log(`成功导入 ${questions.length} 道题目`)
// 预期：题目数量 >= PDF中的实际题目数 * 0.9（允许10%误差）

# 4. 检查质量分数
questions.forEach(q => {
  console.log(`题目: ${q.content.substring(0, 30)}...`)
  console.log(`质量分数: ${q.qualityScore}/100`)
})
// 预期：平均质量分数 >= 80

# 5. 检查OCR原文
const sourceFile = await prisma.sourceFile.findFirst({
  where: { filename: 'test-exam.pdf' }
})
console.log('OCR原文前100字:', sourceFile.ocrRawText?.substring(0, 100))
// 预期：OCR原文不为空，且能看到题目内容
```

**性能要求**：
- OCR处理速度：< 5秒/页
- AI结构化处理：< 10秒/页
- 10页PDF总耗时：< 3分钟

**成本要求**：
- 单次导入（10页PDF，约20道题）：< $0.50

---

### 🔗 Task B与其他Task的关系

```
Task B调用Task A的API：
  - bulkCreateQuestions() ← 保存拆分后的题目
  - prisma.sourceFile.create() ← 创建源文件记录
  - prisma.sourceFile.update() ← 更新OCR状态

Task B为Task C提供的数据：
  - SourceFile表中的记录（含ocrRawText）
  - Question表中的题目（status: REVIEW_PENDING）

Task C可以：
  - 在审核页面查看OCR原文
  - 对比格式化题目与原文
  - 如果OCR错误，可以点击"重试"（调用Task B的resumeFailedImport）
```

---

### 📝 开发步骤建议

**Step 1: 配置API密钥（30分钟）**
```bash
# .env.local 添加：
GOOGLE_CLOUD_VISION_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
MATHPIX_APP_ID=your_app_id  # 可选
MATHPIX_APP_KEY=your_key     # 可选
```

**Step 2: 实现OCR服务（4-5小时）**
- 先实现Google Vision Provider（主力）
- 再实现Tesseract降级方案
- 最后实现Mathpix（可选）

**Step 3: 实现AI结构化（3-4小时）**
- 编写Claude Prompt
- 测试不同类型的题目（选择题、填空题、解答题）
- 优化JSON解析逻辑

**Step 4: 实现批量导入工具（3-4小时）**
- 完整流程串联
- 错误处理和重试逻辑
- 进度追踪

**Step 5: 实现质量检查（2-3小时）**
- LaTeX验证
- 字段完整性检查
- 计算质量分数

**Step 6: 集成测试（2-3小时）**
- 用真实PDF测试
- 调优参数
- 修复Bug

**总预计时间**: 15-20小时

---

### ⚠️ 注意事项

1. **API成本控制**：
   - Google Vision: 前1000次免费，之后$1.5/1000次
   - Claude API: ~$0.01/题
   - 建议：添加每日配额限制（例如：每天最多处理500道题）

2. **错误处理**：
   - OCR失败：保存到SourceFile.status = 'FAILED'，允许重试
   - AI失败：不删除SourceFile，只标记失败
   - 网络超时：最多重试3次

3. **性能优化**：
   - PDF转图片：使用低DPI（150-200）即可
   - 批量OCR：并发处理（最多3个并发）
   - 大文件分片：每次处理最多50页

4. **安全性**：
   - 上传文件大小限制：50MB
   - 文件类型白名单：['pdf', 'jpg', 'png']
   - OCR原文最大长度：100,000字符

---

## 🔧 Task B 详细实施指南

#### B1: OCR服务集成

**核心文件**: `src/lib/content-pipeline/ocr-service.ts`

```typescript
import { GoogleVisionProvider } from './providers/google-vision'
import { MathpixProvider } from './providers/mathpix'
import { TesseractProvider } from './providers/tesseract'

export class OCRService {
  private providers = [
    new MathpixProvider(),     // 优先：数学公式
    new GoogleVisionProvider(), // 降级：通用文本
    new TesseractProvider()     // 最终降级：本地OCR
  ]

  /**
   * 处理图片OCR（自动选择最佳提供商）
   */
  async processImage(imageUrl: string): Promise<OCRResult> {
    for (const provider of this.providers) {
      try {
        const result = await provider.process(imageUrl)

        // 置信度检查
        if (result.confidence > 0.85) {
          return result
        }

        console.warn(`${provider.name} 置信度不足: ${result.confidence}`)
      } catch (error) {
        console.error(`${provider.name} 失败:`, error)
        continue
      }
    }

    throw new Error('所有OCR提供商均失败')
  }

  /**
   * 处理PDF（分页OCR）
   */
  async processPDF(pdfUrl: string): Promise<OCRResult[]> {
    // 1. 将PDF转换为图片（使用pdf-lib或PDF.js）
    const images = await this.convertPDFToImages(pdfUrl)

    // 2. 批量OCR
    const results = await Promise.all(
      images.map(img => this.processImage(img.url))
    )

    return results
  }

  /**
   * 批量处理（成本控制）
   */
  async batchProcess(
    imageUrls: string[],
    options: { maxCost?: number } = {}
  ): Promise<OCRResult[]> {
    const results: OCRResult[] = []
    let totalCost = 0

    for (const url of imageUrls) {
      // 检查预算
      if (options.maxCost && totalCost >= options.maxCost) {
        console.warn('达到成本上限，停止OCR')
        break
      }

      const result = await this.processImage(url)
      results.push(result)

      totalCost += this.estimateCost(result.provider)
    }

    return results
  }

  private estimateCost(provider: string): number {
    const pricing = {
      'mathpix': 0.004,
      'google_vision': 0.0015,
      'tesseract': 0
    }
    return pricing[provider] || 0
  }
}
```

**实施步骤**：

```
Task B1.1: 实现 Google Vision Provider
Task B1.2: 实现 Mathpix Provider（需要API Key）
Task B1.3: 实现 Tesseract 降级方案
Task B1.4: PDF转图片逻辑
Task B1.5: 成本控制与配额管理
```

---

#### B2: AI结构化处理

**核心文件**: `src/lib/content-pipeline/ai-structurer.ts`

```typescript
import Anthropic from '@anthropic-ai/sdk'

export class AIStructurer {
  private client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  })

  /**
   * 将OCR文本拆分为结构化题目
   */
  async structureQuestions(
    ocrText: string,
    context: { subjectId: string; source?: string }
  ): Promise<StructuredQuestion[]> {
    const prompt = this.buildPrompt(ocrText, context)

    const response = await this.client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })

    const result = this.parseResponse(response.content[0].text)
    return result
  }

  private buildPrompt(ocrText: string, context: any): string {
    return `
你是一个专业的题目结构化助手。请将以下OCR识别的文本拆分为标准格式的题目。

**输入文本**：
${ocrText}

**上下文**：
- 科目：${context.subjectId}
- 来源：${context.source || '未知'}

**输出要求**：
请返回JSON数组，每个题目包含以下字段：
- content: 题目内容（保留LaTeX公式，使用 $...$ 或 $$...$$）
- type: 题型（SINGLE_CHOICE/MULTIPLE_CHOICE/FILL_BLANK/ESSAY）
- options: 选项（如果是选择题）
- answer: 答案
- explanation: 解析（如果有）
- estimatedDifficulty: 估计难度（1-5）
- suggestedTags: 建议标签

**示例输出**：
\`\`\`json
[
  {
    "content": "解方程：$x^2 - 5x + 6 = 0$",
    "type": "FILL_BLANK",
    "answer": ["x=2", "x=3"],
    "explanation": "使用因式分解：$(x-2)(x-3)=0$",
    "estimatedDifficulty": 3,
    "suggestedTags": ["一元二次方程", "因式分解"]
  }
]
\`\`\`

请开始处理。
`
  }

  private parseResponse(text: string): StructuredQuestion[] {
    // 提取JSON（处理Markdown代码块）
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/)
    const jsonText = jsonMatch ? jsonMatch[1] : text

    try {
      return JSON.parse(jsonText)
    } catch (error) {
      console.error('AI响应解析失败:', text)
      throw new Error('无法解析AI输出')
    }
  }
}
```

---

#### B3: 批量导入工具

**核心文件**: `src/actions/content-pipeline/import-service.ts`

```typescript
'use server'

import { OCRService } from '@/lib/content-pipeline/ocr-service'
import { AIStructurer } from '@/lib/content-pipeline/ai-structurer'
import { bulkCreateQuestions } from './question-service'

/**
 * 从PDF批量导入题目
 */
export async function importFromPDF(
  pdfUrl: string,
  metadata: {
    subjectId: string
    source?: string
    sourceYear?: number
  }
) {
  const user = await getCurrentUser()
  if (!user || !['ADMIN', 'TEACHER'].includes(user.role)) {
    throw new Error('Unauthorized')
  }

  // 1. 创建SourceFile记录
  const sourceFile = await prisma.sourceFile.create({
    data: {
      filename: extractFilename(pdfUrl),
      fileUrl: pdfUrl,
      fileType: 'pdf',
      fileSize: 0,  // TODO: 获取文件大小
      uploadedBy: user.id,
      status: 'PROCESSING'
    }
  })

  try {
    // 2. OCR处理
    await prisma.sourceFile.update({
      where: { id: sourceFile.id },
      data: { ocrStatus: 'PROCESSING' }
    })

    const ocrService = new OCRService()
    const ocrResults = await ocrService.processPDF(pdfUrl)
    const fullText = ocrResults.map(r => r.text).join('\n\n')

    await prisma.sourceFile.update({
      where: { id: sourceFile.id },
      data: {
        ocrStatus: 'COMPLETED',
        ocrRawText: fullText
      }
    })

    // 3. AI结构化
    const structurer = new AIStructurer()
    const questions = await structurer.structureQuestions(fullText, metadata)

    // 4. 批量创建题目
    const result = await bulkCreateQuestions(
      questions.map(q => ({
        ...q,
        chapterId: null,  // 稍后手动分配
        status: 'REVIEW_PENDING'
      })),
      sourceFile.id
    )

    // 5. 更新SourceFile状态
    await prisma.sourceFile.update({
      where: { id: sourceFile.id },
      data: {
        status: 'COMPLETED',
        processedAt: new Date()
      }
    })

    return {
      success: true,
      sourceFileId: sourceFile.id,
      created: result.created.length,
      duplicates: result.duplicates.length
    }

  } catch (error) {
    // 错误处理
    await prisma.sourceFile.update({
      where: { id: sourceFile.id },
      data: { status: 'FAILED' }
    })

    throw error
  }
}

/**
 * 恢复失败的导入任务
 */
export async function resumeFailedImport(sourceFileId: string) {
  const sourceFile = await prisma.sourceFile.findUnique({
    where: { id: sourceFileId }
  })

  if (!sourceFile || sourceFile.status !== 'FAILED') {
    throw new Error('Invalid source file')
  }

  // 从失败的步骤重新开始
  if (sourceFile.ocrStatus === 'FAILED') {
    // 重新OCR
    return importFromPDF(sourceFile.fileUrl, {
      subjectId: '...',  // 从metadata恢复
    })
  }
}
```

**实施步骤**：

```
Task B3.1: 实现 importFromPDF (完整流程)
Task B3.2: 实现错误恢复机制 (resumeFailedImport)
Task B3.3: 添加进度跟踪（WebSocket推送进度）
Task B3.4: 实现批量导入队列（避免并发超限）
```

---

#### B4: 自动质量检查

**核心文件**: `src/lib/content-pipeline/quality-checker.ts`

```typescript
export class QuestionQualityChecker {
  async check(question: Question): Promise<QualityCheckResult> {
    const issues: QualityIssue[] = []
    let score = 100

    // 1. 必填字段检查
    if (!question.content || question.content.length < 10) {
      issues.push({
        type: 'ERROR',
        category: 'MISSING_CONTENT',
        message: '题目内容过短或为空'
      })
      score -= 30
    }

    // 2. 选项检查
    if (['SINGLE_CHOICE', 'MULTIPLE_CHOICE'].includes(question.type)) {
      const options = question.options as Record<string, string>
      if (!options || Object.keys(options).length < 2) {
        issues.push({
          type: 'ERROR',
          category: 'INSUFFICIENT_OPTIONS',
          message: '选择题至少需要2个选项'
        })
        score -= 20
      }
    }

    // 3. 答案检查
    if (!question.answer) {
      issues.push({
        type: 'ERROR',
        category: 'MISSING_ANSWER',
        message: '缺少答案'
      })
      score -= 30
    }

    // 4. LaTeX语法检查
    if (question.content.includes('$')) {
      const latexValid = await this.validateLatex(question.content)
      if (!latexValid) {
        issues.push({
          type: 'WARNING',
          category: 'INVALID_LATEX',
          message: 'LaTeX语法可能有误'
        })
        score -= 10
      }
    }

    // 5. 图片链接检查
    const imageUrls = this.extractImageUrls(question.content)
    for (const url of imageUrls) {
      const exists = await this.checkImageExists(url)
      if (!exists) {
        issues.push({
          type: 'ERROR',
          category: 'BROKEN_IMAGE',
          message: `图片链接失效: ${url}`,
          metadata: { url }
        })
        score -= 15
      }
    }

    // 6. 知识点标注检查
    const kpCount = await prisma.knowledgePointRelation.count({
      where: { questionId: question.id }
    })
    if (kpCount === 0) {
      issues.push({
        type: 'WARNING',
        category: 'NO_KNOWLEDGE_POINTS',
        message: '未标注知识点'
      })
      score -= 5
    }

    return {
      isValid: issues.filter(i => i.type === 'ERROR').length === 0,
      score: Math.max(0, score),
      issues,
      suggestions: this.generateSuggestions(issues)
    }
  }

  private async validateLatex(content: string): Promise<boolean> {
    // 使用KaTeX验证
    try {
      const katex = await import('katex')
      const latexMatches = content.match(/\$\$?([^$]+)\$\$?/g)

      for (const match of latexMatches || []) {
        const latex = match.replace(/\$/g, '')
        katex.renderToString(latex)  // 会抛出错误如果语法不对
      }

      return true
    } catch {
      return false
    }
  }

  private extractImageUrls(content: string): string[] {
    const regex = /!\[.*?\]\((https?:\/\/[^\)]+)\)/g
    const matches = content.matchAll(regex)
    return Array.from(matches).map(m => m[1])
  }

  private async checkImageExists(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' })
      return response.ok
    } catch {
      return false
    }
  }

  private generateSuggestions(issues: QualityIssue[]): string[] {
    const suggestions: string[] = []

    if (issues.some(i => i.category === 'MISSING_CONTENT')) {
      suggestions.push('请补充完整的题目内容')
    }

    if (issues.some(i => i.category === 'NO_KNOWLEDGE_POINTS')) {
      suggestions.push('建议添加至少1个知识点标签')
    }

    return suggestions
  }
}
```

---

### Task B 验证清单

- [ ] OCR服务正常工作（测试3种提供商）
- [ ] AI结构化输出格式正确
- [ ] 可以成功导入PDF并创建题目
- [ ] 质量检查功能正常
- [ ] 成本控制机制有效

---

## 🎨 Task C: 审核工具 (依赖Task A，可与B并行)

### 🎯 你需要完成什么？

**核心任务**：创建Web Admin管理界面，让管理员可以审核、编辑、发布题目。

**前置条件**：
- ✅ Task A已完成（可以调用 `getPendingReviewQuestions()`、`updateQuestionStatus()` 等API）
- ✅ 现有Dashboard侧边栏结构（需要扩展）
- ✅ Shadcn/ui组件库已安装

**你将创建的页面**：

1. **批量导入页** (`/admin/content/import`)
   - 文件上传组件（拖拽上传）
   - 元数据表单（科目、年份、来源）
   - 处理进度显示
   - 导入历史记录表格

2. **审核列表页** (`/admin/content`)
   - 题目表格（可批量选择）
   - 科目筛选器
   - 批量操作按钮（批量通过/拒绝）
   - 质量分数可视化

3. **审核详情页** (`/admin/content/[id]`)
   - 题目内容展示（支持LaTeX渲染）
   - 质量检查结果卡片
   - OCR原文对比（可折叠）
   - 审核操作面板（右侧固定）

4. **题目编辑页** (`/admin/content/[id]/edit`)  ⭐ **重要**
   - 富文本编辑器（Tiptap + LaTeX支持）
   - 选项和答案编辑
   - 标签和知识点多选
   - 实时预览

5. **统计看板** (`/admin/statistics`)
   - 4个数据卡片（总题目数、已发布、待审核、通过率）
   - 2个图表（科目分布、难度分布）
   - 审核员排行榜

**你将创建的组件**：

- `QuestionReviewTable.tsx` - 题目审核表格
- `QuestionReviewPanel.tsx` - 审核操作面板
- `QuestionPreview.tsx` - 题目预览（学生视角）
- `QualityCheckDisplay.tsx` - 质量检查结果展示
- `FileUpload.tsx` - 文件上传组件
- 等...

---

### 📋 交付物清单

完成Task C后，你需要交付：

- [ ] **C1: Admin路由与权限**
  - 文件：`src/app/(dashboard)/admin/layout.tsx`
  - 权限检查：只有ADMIN和TEACHER可访问
  - 侧边栏扩展：添加"内容管理"菜单

- [ ] **C2: 批量导入页**
  - 文件：`src/app/(dashboard)/admin/content/import/page.tsx`
  - 可上传PDF到Supabase Storage
  - 调用Task B的 `importFromPDF()` 函数
  - 显示处理进度

- [ ] **C3: 审核列表页**
  - 文件：`src/app/(dashboard)/admin/content/page.tsx`
  - 文件：`src/components/admin/QuestionReviewTable.tsx`
  - 调用Task A的 `getPendingReviewQuestions()`
  - 批量操作功能正常

- [ ] **C4: 审核详情页**
  - 文件：`src/app/(dashboard)/admin/content/[id]/page.tsx`
  - 文件：`src/components/admin/QuestionReviewPanel.tsx`
  - LaTeX渲染正常（使用KaTeX）
  - 可通过/拒绝题目

- [ ] **C5: 题目编辑页** ⭐
  - 文件：`src/app/(dashboard)/admin/content/[id]/edit/page.tsx`
  - 富文本编辑器集成（Tiptap）
  - 实时预览功能
  - 保存后返回详情页

- [ ] **C6: 统计看板**
  - 文件：`src/app/(dashboard)/admin/statistics/page.tsx`
  - 数据卡片显示正确
  - 图表渲染正常（Recharts）

---

### ✅ 验收标准（如何确认完成？）

**测试流程**：模拟完整的审核流程

```bash
# 前提：Task B已导入至少10道题目（status: REVIEW_PENDING）

# 1. 访问Admin审核列表页
# 浏览器访问：http://localhost:3000/admin/content

# 预期结果：
# - 页面加载成功，无报错
# - 表格显示至少10道待审核题目
# - 每道题目显示：内容、科目、难度、质量分数
# - 可勾选题目，批量操作栏显示

# 2. 点击某道题目进入详情页
# 点击第一道题的"审核"按钮

# 预期结果：
# - 跳转到 /admin/content/{id}
# - 左侧显示题目内容，LaTeX公式正常渲染
# - 右侧显示审核面板，质量分数可见
# - 如果有OCR原文，底部显示对比卡片

# 3. 测试审核通过功能
# 填写审核意见："题目格式正确，通过"
# 点击"✓ 通过审核"按钮

# 预期结果：
# - 显示成功提示
# - 3秒后自动跳转回列表页
# - 该题目从列表中消失（因为状态变为VERIFIED）

# 4. 测试批量审核
# 返回列表页，全选剩余9道题
# 点击"批量通过"按钮

# 预期结果：
# - 显示加载状态
# - 成功提示："已批准 9 道题目"
# - 列表为空（所有题目已审核）

# 5. 测试编辑功能
# 回到任意已审核题目的详情页
# 点击"编辑题目"按钮

# 预期结果：
# - 跳转到 /admin/content/{id}/edit
# - 左侧显示编辑器，预填充题目内容
# - 右侧显示实时预览
# - 修改内容后点击"保存"，成功返回详情页

# 6. 测试统计看板
# 访问：http://localhost:3000/admin/statistics

# 预期结果：
# - 总题目数 = 10
# - 已发布 = 0（因为还没发布）
# - 待审核 = 0（因为已全部审核为VERIFIED）
# - 审核通过率 = 100%
```

**性能要求**：
- 列表页加载：< 1秒
- 详情页加载：< 1秒
- 审核操作响应：< 500ms
- 批量操作（10道题）：< 3秒

**UI要求**：
- 所有操作有加载状态
- 错误提示清晰易懂
- 响应式布局（桌面端优先）
- LaTeX公式渲染清晰

---

### 🔗 Task C与其他Task的关系

```
Task C调用Task A的API：
  - getPendingReviewQuestions() ← 审核列表页
  - updateQuestionStatus() ← 审核通过/拒绝
  - prisma.question.findUnique() ← 审核详情页
  - prisma.question.update() ← 编辑保存

Task C调用Task B的API：
  - importFromPDF() ← 批量导入页
  - resumeFailedImport() ← 导入失败重试

Task C展示Task B生成的数据：
  - SourceFile.ocrRawText ← OCR原文对比
  - Question.qualityScore ← 质量分数显示
  - Question.contentHash ← 去重提示
```

---

### 📝 开发步骤建议

**Step 1: Admin路由与权限（1-2小时）**
- 创建 `admin/layout.tsx`
- 添加权限检查中间件
- 扩展侧边栏导航

**Step 2: 批量导入页（3-4小时）**
- 实现文件上传组件
- 集成Supabase Storage
- 调用 `importFromPDF()`
- 显示处理进度

**Step 3: 审核列表页（4-5小时）**
- 创建题目表格组件
- 实现批量选择逻辑
- 批量操作功能
- 分页组件

**Step 4: 审核详情页（5-6小时）**
- 题目内容展示（LaTeX渲染）
- 质量检查结果展示
- 审核操作面板
- OCR原文对比

**Step 5: 题目编辑页（6-8小时）** ⭐ **最复杂**
- 集成Tiptap富文本编辑器
- LaTeX输入支持
- 实时预览功能
- 标签和知识点多选

**Step 6: 统计看板（3-4小时）**
- 数据卡片
- Recharts图表集成
- 审核员排行榜

**Step 7: 集成测试与优化（2-3小时）**
- 完整流程测试
- UI细节调整
- 性能优化

**总预计时间**: 24-32小时

---

### ⚠️ 注意事项

1. **前端UI生成建议**：
   - 使用文档中"前端设计指南"部分的Prompt
   - 用Gemini AI Studio或v0.dev生成初始代码
   - 再手动调整集成到项目中

2. **LaTeX渲染**：
   ```tsx
   import 'katex/dist/katex.min.css'
   import { InlineMath, BlockMath } from 'react-katex'

   // 使用：
   <BlockMath math="x^2 - 5x + 6 = 0" />
   ```

3. **权限检查**：
   ```tsx
   // 每个Admin页面都要检查
   const user = await getCurrentUser()
   if (!user || !['ADMIN', 'TEACHER'].includes(user.role)) {
     redirect('/dashboard')
   }
   ```

4. **错误处理**：
   - 所有Server Action调用都要try-catch
   - 使用toast提示错误信息
   - 网络错误显示重试按钮

5. **性能优化**：
   - 题目列表使用虚拟滚动（如果>100条）
   - LaTeX渲染使用memo缓存
   - 图片使用Next.js Image组件

---

### 💡 前端开发技巧

**使用AI生成UI代码**：

参考文档第4章"前端设计指南"中的Prompt，复制到AI工具：

```
步骤1：生成批量导入页
→ 复制"模块1：Admin批量导入页面"的Prompt
→ 粘贴到Gemini AI Studio
→ 生成代码后，粘贴到 src/app/(dashboard)/admin/content/import/page.tsx

步骤2：生成审核列表页
→ 复制"模块2：Admin审核列表页"的Prompt
→ 生成QuestionReviewTable组件
→ 集成到项目

步骤3-6：重复上述流程
```

**手动调整要点**：
- 替换Mock数据为Server Action调用
- 添加loading状态
- 集成错误处理
- 调整样式细节

---

## 🔧 Task C 详细实施指南

#### C1: Admin路由与布局

**文件结构**：

```
src/app/(dashboard)/admin/
├── layout.tsx              # Admin布局（权限检查）
├── content/
│   ├── page.tsx            # 题目列表（待审核）
│   ├── [id]/
│   │   └── page.tsx        # 题目详情审核页面
│   └── import/
│       └── page.tsx        # 批量导入页面
├── statistics/
│   └── page.tsx            # 统计看板
└── reports/
    └── page.tsx            # 用户纠错管理
```

**权限检查**: `src/app/(dashboard)/admin/layout.tsx`

```typescript
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user || !['ADMIN', 'TEACHER'].includes(user.role)) {
    redirect('/dashboard')
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  )
}
```

---

#### C2: 题目审核界面

**主列表页**: `src/app/(dashboard)/admin/content/page.tsx`

```typescript
import { getPendingReviewQuestions } from '@/actions/content-pipeline/question-service'
import { QuestionReviewTable } from '@/components/admin/QuestionReviewTable'

export default async function ContentReviewPage({
  searchParams
}: {
  searchParams: { subject?: string; page?: string }
}) {
  const questions = await getPendingReviewQuestions({
    subjectId: searchParams.subject,
    limit: 20,
    offset: (parseInt(searchParams.page || '1') - 1) * 20
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">题目审核</h1>

        <div className="flex gap-2">
          <SubjectFilter />
          <Button asChild>
            <Link href="/admin/content/import">批量导入</Link>
          </Button>
        </div>
      </div>

      <QuestionReviewTable questions={questions} />
    </div>
  )
}
```

**审核表格组件**: `src/components/admin/QuestionReviewTable.tsx`

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { updateQuestionStatus } from '@/actions/content-pipeline/question-service'

export function QuestionReviewTable({ questions }: { questions: QuestionWithRelations[] }) {
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const handleBatchApprove = async () => {
    setLoading(true)

    try {
      await Promise.all(
        selected.map(id =>
          updateQuestionStatus(id, 'VERIFIED', '批量审核通过')
        )
      )

      toast.success(`已批准 ${selected.length} 道题目`)
      setSelected([])
      router.refresh()
    } catch (error) {
      toast.error('操作失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* 批量操作栏 */}
      {selected.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <span>已选择 {selected.length} 道题目</span>
          <Button onClick={handleBatchApprove} disabled={loading}>
            批量通过
          </Button>
          <Button variant="destructive" disabled={loading}>
            批量拒绝
          </Button>
        </div>
      )}

      {/* 题目表格 */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selected.length === questions.length}
                onCheckedChange={(checked) => {
                  setSelected(checked ? questions.map(q => q.id) : [])
                }}
              />
            </TableHead>
            <TableHead>题目内容</TableHead>
            <TableHead>科目</TableHead>
            <TableHead>难度</TableHead>
            <TableHead>质量分数</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.map(q => (
            <TableRow key={q.id}>
              <TableCell>
                <Checkbox
                  checked={selected.includes(q.id)}
                  onCheckedChange={(checked) => {
                    setSelected(prev =>
                      checked
                        ? [...prev, q.id]
                        : prev.filter(id => id !== q.id)
                    )
                  }}
                />
              </TableCell>
              <TableCell>
                <div className="max-w-md truncate">
                  {q.content.substring(0, 80)}...
                </div>
              </TableCell>
              <TableCell>{q.chapter?.subject.name}</TableCell>
              <TableCell>
                <DifficultyBadge level={q.difficulty} />
              </TableCell>
              <TableCell>
                <QualityScoreBadge score={q.qualityScore || 0} />
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/admin/content/${q.id}`}>
                    审核
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
```

---

#### C3: 题目详情审核页面

**详情页**: `src/app/(dashboard)/admin/content/[id]/page.tsx`

```typescript
import { prisma } from '@/lib/prisma'
import { QuestionQualityChecker } from '@/lib/content-pipeline/quality-checker'
import { QuestionReviewPanel } from '@/components/admin/QuestionReviewPanel'

export default async function QuestionReviewDetailPage({
  params
}: {
  params: { id: string }
}) {
  const question = await prisma.question.findUnique({
    where: { id: params.id },
    include: {
      chapter: { include: { subject: true } },
      group: true,
      tags: { include: { tag: true } },
      knowledgePoints: { include: { kp: true } },
      sourceFiles: true,
      _count: {
        select: {
          userAttempts: true,
          errorBooks: true
        }
      }
    }
  })

  if (!question) {
    notFound()
  }

  // 运行质量检查
  const checker = new QuestionQualityChecker()
  const qualityResult = await checker.check(question)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">题目审核</h1>
        <Button variant="outline" asChild>
          <Link href="/admin/content">返回列表</Link>
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* 左侧：题目预览 */}
        <div className="col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>题目内容</CardTitle>
            </CardHeader>
            <CardContent>
              <QuestionPreview question={question} />
            </CardContent>
          </Card>

          {/* 质量检查结果 */}
          <Card>
            <CardHeader>
              <CardTitle>质量检查</CardTitle>
            </CardHeader>
            <CardContent>
              <QualityCheckDisplay result={qualityResult} />
            </CardContent>
          </Card>

          {/* OCR原文（如果有） */}
          {question.ocrRawText && (
            <Card>
              <CardHeader>
                <CardTitle>OCR原文</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm whitespace-pre-wrap">
                  {question.ocrRawText}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 右侧：审核面板 */}
        <div>
          <QuestionReviewPanel
            question={question}
            qualityResult={qualityResult}
          />
        </div>
      </div>
    </div>
  )
}
```

**审核面板组件**: `src/components/admin/QuestionReviewPanel.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateQuestionStatus } from '@/actions/content-pipeline/question-service'

export function QuestionReviewPanel({
  question,
  qualityResult
}: {
  question: QuestionWithRelations
  qualityResult: QualityCheckResult
}) {
  const router = useRouter()
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  const handleApprove = async () => {
    setLoading(true)
    try {
      await updateQuestionStatus(question.id, 'VERIFIED', comment)
      toast.success('题目已通过审核')
      router.push('/admin/content')
    } catch (error) {
      toast.error('操作失败')
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!comment) {
      toast.error('请填写拒绝理由')
      return
    }

    setLoading(true)
    try {
      await updateQuestionStatus(question.id, 'REVIEW_REJECTED', comment)
      toast.success('题目已拒绝')
      router.push('/admin/content')
    } catch (error) {
      toast.error('操作失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle>审核操作</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 质量分数 */}
        <div>
          <Label>质量分数</Label>
          <div className="flex items-center gap-2 mt-1">
            <Progress value={qualityResult.score} className="flex-1" />
            <span className="text-sm font-medium">{qualityResult.score}/100</span>
          </div>
        </div>

        {/* 元数据 */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">题型</span>
            <span>{question.type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">难度</span>
            <span>{question.difficulty} 星</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">答题次数</span>
            <span>{question._count.userAttempts}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">被报错次数</span>
            <span>{question.reportCount}</span>
          </div>
        </div>

        <Separator />

        {/* 审核意见 */}
        <div>
          <Label htmlFor="comment">审核意见</Label>
          <Textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="选填：补充说明或拒绝理由"
            rows={4}
            className="mt-1"
          />
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-col gap-2">
          <Button
            onClick={handleApprove}
            disabled={loading || !qualityResult.isValid}
            className="w-full"
          >
            ✓ 通过审核
          </Button>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={loading}
            className="w-full"
          >
            ✗ 拒绝
          </Button>
          <Button
            variant="outline"
            disabled={loading}
            className="w-full"
            asChild
          >
            <Link href={`/admin/content/${question.id}/edit`}>
              编辑题目
            </Link>
          </Button>
        </div>

        {/* 质量问题提示 */}
        {!qualityResult.isValid && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>质量检查未通过</AlertTitle>
            <AlertDescription>
              {qualityResult.issues
                .filter(i => i.type === 'ERROR')
                .map(i => i.message)
                .join('、')}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
```

---

#### C4: 批量导入界面

**导入页面**: `src/app/(dashboard)/admin/content/import/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileUpload } from '@/components/ui/file-upload'
import { importFromPDF } from '@/actions/content-pipeline/import-service'

export default function ImportPage() {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleFileUpload = async (file: File) => {
    setUploading(true)

    try {
      // 1. 上传到Supabase Storage
      const fileUrl = await uploadToSupabase(file)

      // 2. 触发导入流程
      const result = await importFromPDF(fileUrl, {
        subjectId: selectedSubject,
        source: sourceInput,
        sourceYear: parseInt(yearInput)
      })

      toast.success(`成功导入 ${result.created} 道题目`)
      router.push('/admin/content')

    } catch (error) {
      toast.error('导入失败: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">批量导入题目</h1>

      <Card>
        <CardHeader>
          <CardTitle>上传源文件</CardTitle>
          <CardDescription>
            支持 PDF、图片（JPG/PNG）格式，单个文件最大50MB
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 文件上传 */}
          <FileUpload
            accept="application/pdf,image/*"
            onUpload={handleFileUpload}
            disabled={uploading}
          />

          {/* 元数据输入 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>科目</Label>
              <SubjectSelect />
            </div>
            <div>
              <Label>年份</Label>
              <Input type="number" placeholder="2023" />
            </div>
          </div>

          <div>
            <Label>来源标识</Label>
            <Input placeholder="例如：2023年中考数学真题" />
          </div>

          {/* 进度条 */}
          {uploading && (
            <div>
              <Progress value={progress} />
              <p className="text-sm text-muted-foreground mt-2">
                正在处理中，请勿关闭页面...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 历史导入记录 */}
      <Card>
        <CardHeader>
          <CardTitle>最近导入</CardTitle>
        </CardHeader>
        <CardContent>
          <ImportHistoryTable />
        </CardContent>
      </Card>
    </div>
  )
}
```

---

#### C5: 统计看板

**统计页**: `src/app/(dashboard)/admin/statistics/page.tsx`

```typescript
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function StatisticsPage() {
  // 查询统计数据
  const stats = await prisma.question.groupBy({
    by: ['status'],
    _count: { id: true }
  })

  const totalQuestions = stats.reduce((sum, s) => sum + s._count.id, 0)
  const publishedCount = stats.find(s => s.status === 'PUBLISHED')?._count.id || 0
  const pendingCount = stats.find(s => s.status === 'REVIEW_PENDING')?._count.id || 0

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">内容统计</h1>

      {/* 总览卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>总题目数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalQuestions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>已发布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{publishedCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>待审核</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{pendingCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>审核通过率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {((publishedCount / totalQuestions) * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 图表 */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>各科目题目分布</CardTitle>
          </CardHeader>
          <CardContent>
            <SubjectDistributionChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>难度分布</CardTitle>
          </CardHeader>
          <CardContent>
            <DifficultyDistributionChart />
          </CardContent>
        </Card>
      </div>

      {/* 审核员排行 */}
      <Card>
        <CardHeader>
          <CardTitle>审核员贡献榜</CardTitle>
        </CardHeader>
        <CardContent>
          <ReviewerLeaderboard />
        </CardContent>
      </Card>
    </div>
  )
}
```

---

### Task C 验证清单

- [ ] Admin界面可访问（权限正常）
- [ ] 可以查看待审核题目列表
- [ ] 题目详情页渲染正确（包括LaTeX）
- [ ] 可以通过/拒绝题目
- [ ] 批量操作功能正常
- [ ] 统计数据正确显示

---

## 🎨 4. Frontend Design Guide (前端设计指南)

### 4.1 前端涉及的功能模块

**重要说明**：以下所有前端页面的设计都可以使用AI工具（如Gemini AI Studio、v0.dev等）生成，下面提供的是详细的Prompt指南。

---

#### 模块1：Admin批量导入页面

**路径**: `/admin/content/import`

**功能描述**：
- 文件上传（PDF/图片）
- 元数据输入（科目、年份、来源）
- 上传进度显示
- 批量导入历史记录

**AI生成Prompt**：

```
请设计一个题目批量导入页面（Content Import Page），用于教师/管理员上传试卷PDF：

布局要求：
1. 顶部：标题 "批量导入题目" + 返回按钮
2. 主卡片1：文件上传区
   - 拖拽上传组件（支持PDF、JPG、PNG）
   - 文件大小限制提示：最大50MB
   - 上传进度条（上传中显示）
3. 主卡片2：元数据输入
   - 科目选择（下拉菜单：数学、物理、化学等）
   - 年份输入（数字输入框，例如：2023）
   - 来源标识（文本输入，例如："2023年中考数学真题"）
   - 提交按钮（主色调）
4. 历史记录卡片：
   - 表格显示最近导入记录
   - 列：文件名、科目、题目数、状态、导入时间
   - 状态标签：处理中（橙色）、成功（绿色）、失败（红色）

设计风格：现代、简洁、专业（类似Notion/Linear风格）
颜色：使用Shadcn/ui默认配色
组件库：React + Shadcn/ui + Tailwind CSS
```

---

#### 模块2：Admin审核列表页

**路径**: `/admin/content`

**功能描述**：
- 显示所有待审核题目
- 支持科目筛选
- 批量选择和批量操作
- 质量分数可视化

**AI生成Prompt**：

```
请设计一个题目审核列表页面（Content Review List），用于管理员查看待审核题目：

布局要求：
1. 顶部工具栏：
   - 标题 "题目审核"
   - 右侧：科目筛选下拉菜单 + "批量导入"按钮
2. 批量操作栏（有选中项时显示）：
   - 显示 "已选择 X 道题目"
   - 批量通过按钮（绿色）
   - 批量拒绝按钮（红色）
3. 题目表格：
   - 列1：复选框（用于批量选择）
   - 列2：题目内容（截断显示，最多80字）
   - 列3：科目标签（彩色徽章）
   - 列4：难度星级（1-5星，星星图标）
   - 列5：质量分数（进度条 + 数字，0-100）
   - 列6：操作按钮（"审核"按钮，跳转到详情页）
4. 分页组件：底部居中

状态说明：
- 待审核：橙色边框
- 质量分数 < 60：红色警告图标
- 质量分数 >= 80：绿色对勾图标

设计风格：表格清晰、信息密度适中、易于扫描
组件库：React + Shadcn/ui + Tailwind CSS（使用Table组件）
```

---

#### 模块3：Admin审核详情页

**路径**: `/admin/content/[id]`

**功能描述**：
- 题目内容展示（支持LaTeX渲染）
- 质量检查结果显示
- 审核操作面板
- OCR原文对比

**AI生成Prompt**：

```
请设计一个题目审核详情页（Question Review Detail），用于管理员单独审核每道题目：

布局要求（3列布局）：

【左侧2/3区域】：
1. 题目内容卡片：
   - 题目正文（支持LaTeX公式渲染，使用KaTeX）
   - 选项（如果是选择题）
   - 答案（绿色高亮）
   - 解析（折叠显示）
2. 质量检查卡片：
   - 质量分数：大号数字 + 圆形进度条
   - 问题列表：
     - 错误图标（红色X）：阻塞性问题（如：缺少答案）
     - 警告图标（黄色!）：非阻塞性问题（如：未标注知识点）
   - 每个问题显示：图标 + 问题描述
3. OCR原文卡片（如果有）：
   - 折叠显示
   - 等宽字体显示原始文本

【右侧1/3区域】：
审核操作面板（固定定位，跟随滚动）：
1. 质量分数显示：
   - 进度条（0-100）
   - 大号数字
2. 元数据信息：
   - 题型、难度、答题次数、被报错次数（键值对列表）
3. 审核意见输入：
   - 多行文本框
   - 占位符："选填：补充说明或拒绝理由"
4. 操作按钮（全宽，垂直堆叠）：
   - "✓ 通过审核"（绿色，主按钮）
   - "✗ 拒绝"（红色，次按钮）
   - "编辑题目"（灰色轮廓按钮）
5. 质量警告提示（如果有ERROR）：
   - 红色警告框
   - 显示："质量检查未通过，请修复以下问题：..."

设计风格：
- 左侧内容区：白色卡片 + 阴影
- 右侧操作区：浅灰背景、固定定位
- 按钮hover效果：轻微放大
- LaTeX公式：使用KaTeX渲染（确保公式清晰）

组件库：React + Shadcn/ui + Tailwind CSS + KaTeX
```

---

#### 模块4：题目编辑页（重要补充⚠️）

**路径**: `/admin/content/[id]/edit`

**功能描述**：
- 在线编辑题目内容（富文本 + LaTeX）
- 修改选项和答案
- 添加/移除标签和知识点
- 实时预览

**AI生成Prompt**：

```
请设计一个题目编辑页面（Question Editor），用于管理员在线修改题目：

布局要求（左右分栏）：

【左侧编辑区】：
1. 题目内容编辑器：
   - 富文本编辑器（支持Markdown + LaTeX）
   - 工具栏：加粗、斜体、插入LaTeX公式、插入图片
   - LaTeX快捷输入：$$公式$$ 或 $行内公式$
2. 选项编辑（如果是选择题）：
   - 4个输入框（A/B/C/D）
   - 每个输入框右侧有删除按钮
   - "添加选项"按钮
3. 答案设置：
   - 单选题：单选按钮（A/B/C/D）
   - 多选题：复选框
   - 填空题：文本输入框（支持多个答案）
4. 解析编辑器：
   - 富文本编辑器（同上）
5. 元数据设置：
   - 难度：1-5星选择器
   - 章节：下拉选择
   - 标签：多选标签（带搜索）
   - 知识点：多选知识点（带搜索）

【右侧预览区】：
- 实时预览题目效果（学生视角）
- 包含LaTeX渲染
- 显示选项和答案

底部：
- "保存"按钮（主色调）
- "取消"按钮（次按钮）

设计风格：类似Notion编辑器，流畅、直观
组件库：React + Shadcn/ui + Tiptap编辑器 + KaTeX
```

---

#### 模块5：内容统计看板

**路径**: `/admin/statistics`

**功能描述**：
- 显示题目管理的关键指标
- 各科目题目分布图表
- 审核员贡献排行榜

**AI生成Prompt**：

```
请设计一个内容统计看板（Content Statistics Dashboard），显示题目管理的关键指标：

布局要求：

1. 顶部4个数据卡片（网格排列）：
   - 卡片1：总题目数（大号数字 + "道题目"）
   - 卡片2：已发布（绿色数字）
   - 卡片3：待审核（橙色数字）
   - 卡片4：审核通过率（百分比 + 环形进度图）

2. 图表区域（2列网格）：
   - 图表1：各科目题目分布（柱状图）
   - 图表2：难度分布（饼图）

3. 审核员排行榜：
   - 表格显示Top 5审核员
   - 列：排名、头像、姓名、审核题数、通过率

设计风格：数据可视化、现代商务风格、使用Recharts图表库
颜色：绿色（好）、橙色（中）、红色（差）
组件库：React + Shadcn/ui + Recharts + Tailwind CSS
```

---

### 4.2 UI入口设计

#### 侧边栏导航扩展

**建议在现有Dashboard侧边栏添加"内容管理"模块**：

```tsx
// src/components/dashboard/Sidebar.tsx 扩展

{user.role === 'ADMIN' || user.role === 'TEACHER' ? (
  <SidebarSection title="内容管理" icon={<Settings />}>
    <SidebarLink href="/admin/content/import" icon={<Upload />}>
      批量导入
    </SidebarLink>
    <SidebarLink href="/admin/content/review" icon={<CheckSquare />}>
      题目审核
    </SidebarLink>
    <SidebarLink href="/admin/content/statistics" icon={<BarChart />}>
      内容统计
    </SidebarLink>
    <SidebarLink href="/admin/content/reports" icon={<AlertCircle />}>
      用户报错
    </SidebarLink>
  </SidebarSection>
) : null}
```

**权限控制**：
- 仅 `ADMIN` 和 `TEACHER` 角色可见
- 学生角色看不到"内容管理"菜单

---

### 4.3 完整Admin交互流程

#### 场景1：管理员上传新试卷

```
Step 1: 进入系统
👤 Admin登录 → Dashboard → 点击侧边栏"内容管理" → "批量导入"

Step 2: 上传文件
📁 页面显示：文件上传区域
   ├─ 拖拽PDF文件 或 点击选择文件
   ├─ 文件验证：大小<50MB、格式为PDF/图片 ✅
   └─ 上传到Supabase Storage

Step 3: 填写元数据
📝 弹出表单：
   ├─ 科目：下拉选择"数学"
   ├─ 年份：输入"2023"
   ├─ 来源：输入"2023年中考数学真题"
   └─ 点击"开始处理"按钮

Step 4: 后台处理（显示进度）
⏳ 进度条显示：
   ├─ "正在OCR识别..." (30%)
   ├─ "AI结构化拆分..." (60%)
   ├─ "质量检查中..." (90%)
   └─ "处理完成！成功导入 25 道题目" ✅

Step 5: 自动跳转
🔄 3秒后自动跳转到"题目审核"页面
```

---

#### 场景2：管理员审核题目

```
Step 1: 进入审核列表
👤 Admin → "内容管理" → "题目审核"

Step 2: 查看待审核题目
📋 页面显示表格：
   ├─ 25道待审核题目（刚导入的）
   ├─ 质量分数：大部分85-95分 ✅
   └─ 发现1道题目质量分数58分 ⚠️

Step 3: 点击低分题目
🔍 点击质量分数58分的那道题 → 进入详情页

Step 4: 审核详情
📖 左侧显示：
   ├─ 题目内容：显示正常 ✅
   ├─ 质量检查：
   │   ├─ ❌ 错误：缺少答案
   │   └─ ⚠️ 警告：未标注知识点

📋 右侧操作面板：
   ├─ 质量分数：58/100（红色）
   ├─ 审核意见输入框
   └─ "✓ 通过审核"按钮被禁用（因为有ERROR）

Step 5: 修复问题
✏️ 点击"编辑题目"按钮 → 跳转到编辑页面
   ├─ 补充答案："C"
   ├─ 添加知识点标签："一元二次方程"
   └─ 保存

Step 6: 重新审核
🔄 返回审核页面：
   ├─ 质量分数更新：85/100 ✅
   ├─ 填写审核意见："已补充答案和知识点"
   └─ 点击"✓ 通过审核"按钮

Step 7: 批量审核其余题目
⚡ 返回列表页：
   ├─ 剩余24道题目质量都>80分
   ├─ 全选复选框
   └─ 点击"批量通过"按钮 → 完成！

Step 8: 发布到学生端
🚀 状态变更：VERIFIED → 点击"发布"按钮 → PUBLISHED
   └─ 学生端立即可以看到这25道题目
```

---

#### 场景3：学生报错触发复审

```
Step 1: 学生做题时发现问题
👨‍🎓 学生答题后：
   ├─ 点击"报告问题"按钮
   ├─ 选择问题类型："答案错误"
   ├─ 填写描述："正确答案应该是B，不是C"
   └─ 提交

Step 2: 系统自动判断
🤖 后台逻辑：
   ├─ 该题目报错计数 +1 → 总报错数=3
   ├─ 触发阈值（3条报告）
   └─ 自动将题目状态改为：PUBLISHED → REVIEW_PENDING

Step 3: Admin收到通知
🔔 Admin Dashboard 顶部：
   ├─ 红色徽章："3道题目待复审"
   └─ 点击进入"题目审核"页面

Step 4: 查看用户报错
📋 审核详情页：
   ├─ 右侧新增"用户报错"卡片
   ├─ 显示3条报错记录：
   │   ├─ 用户A："答案应该是B"
   │   ├─ 用户B："答案错了"
   │   └─ 用户C："C选项不对"
   └─ Admin判断：确实是答案错误

Step 5: 修复并重新发布
✏️ 编辑题目 → 答案改为"B" → 保存
   ├─ 状态：REVIEW_PENDING → VERIFIED → PUBLISHED
   └─ 给3位报错用户发放积分奖励：+10分/人 🎁
```

---

### 4.4 功能遗漏点检查

#### ✅ 已覆盖的功能
- [x] 文件上传
- [x] OCR + AI处理
- [x] 质量检查
- [x] 单个审核
- [x] 批量审核
- [x] 用户报错
- [x] 状态流转
- [x] 统计看板

#### ⚠️ 补充功能（已在上面添加）

##### 1. 题目编辑功能（P0）
**位置**: `/admin/content/[id]/edit`
**重要性**: ⭐⭐⭐⭐⭐（必须实现）
**Prompt**: 已在模块4提供

---

##### 2. 批量打标功能（P1）
**场景**: 导入25道数学题，都需要标注"一元二次方程"标签

**实现方案**：
```tsx
// 在题目列表页，批量操作栏添加
<Dialog>
  <DialogTrigger asChild>
    <Button disabled={selected.length === 0}>
      批量打标
    </Button>
  </DialogTrigger>
  <DialogContent>
    <DialogTitle>批量添加标签</DialogTitle>
    <div>
      <Label>标签</Label>
      <MultiSelect
        options={tags}
        placeholder="选择要添加的标签..."
      />
    </div>
    <div>
      <Label>知识点</Label>
      <MultiSelect
        options={knowledgePoints}
        placeholder="选择要添加的知识点..."
      />
    </div>
    <Button onClick={handleBatchTag}>确认</Button>
  </DialogContent>
</Dialog>
```

---

##### 3. 导入失败恢复（P1）
**场景**: 导入过程中OCR服务挂了，25道题只处理了10道

**实现方案**：
- 在导入历史记录表格中，失败记录显示"重试"按钮
- 点击后调用 `resumeFailedImport(sourceFileId)` Server Action

---

##### 4. 学生视角预览（P2）
**场景**: 审核时想看学生端的实际效果

**实现方案**：
```tsx
// 在审核详情页，题目内容卡片右上角
<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline" size="sm">
      <Eye className="w-4 h-4 mr-2" />
      学生视角预览
    </Button>
  </DialogTrigger>
  <DialogContent className="max-w-2xl">
    <QuestionPreview question={question} studentView={true} />
  </DialogContent>
</Dialog>
```

---

##### 5. 版本历史查看（P2，未来版本）
**功能**: 查看题目的修改历史，对比不同版本

**实现方案**（未来迭代）：
- 在审核详情页底部添加"版本历史"标签页
- 显示所有历史版本
- 点击任意版本显示Diff对比

---

##### 6. 导出功能（P2，未来版本）
**功能**: 批量导出题目为Excel或JSON

**实现方案**（未来迭代）：
- 在题目列表页顶部工具栏添加"导出"按钮
- 支持格式：Excel、JSON、CSV
- 可按筛选条件导出

---

### 4.5 完整功能清单（优先级）

| 功能 | 优先级 | 包含在哪个Task | Prompt已提供 |
|------|--------|----------------|--------------|
| 文件上传页面 | P0 | Task C | ✅ |
| 审核列表页 | P0 | Task C | ✅ |
| 审核详情页 | P0 | Task C | ✅ |
| **题目编辑页** | **P0** | **Task C** | ✅ |
| 统计看板 | P1 | Task C | ✅ |
| 批量打标 | P1 | Task C扩展 | ✅（代码片段） |
| 导入失败恢复 | P1 | Task B扩展 | ✅（逻辑说明） |
| 学生视角预览 | P2 | Task C扩展 | ✅（代码片段） |
| 版本历史 | P2 | 未来版本 | ❌ |
| 导出功能 | P2 | 未来版本 | ❌ |

---

### 4.6 技术栈要求

所有前端页面统一使用以下技术栈：

- **框架**: Next.js 14+ (App Router)
- **语言**: TypeScript
- **UI库**: Shadcn/ui（基于Radix UI + Tailwind CSS）
- **富文本编辑器**: Tiptap
- **LaTeX渲染**: KaTeX
- **图表**: Recharts
- **表单**: React Hook Form + Zod
- **状态管理**: Zustand（如需要）

---

### 4.7 开发顺序建议

**Stage 1（MVP，Task C核心）**：
1. Admin布局与权限检查
2. 批量导入页面
3. 审核列表页
4. 审核详情页
5. 题目编辑页（⚠️ 必须）

**Stage 2（增强功能）**：
6. 统计看板
7. 批量打标
8. 导入失败恢复UI

**Stage 3（优化体验）**：
9. 学生视角预览
10. 更多筛选和排序功能

---

## ✅ 4. Definition of Done (交付标准)

### 功能完整性
- [ ] Task A: 数据基础层完全实现
- [ ] Task B: 可以成功从PDF导入题目
- [ ] Task C: Admin审核界面功能完整

### 代码质量
- [ ] ESLint 0 errors, 0 warnings
- [ ] TypeScript 0 type errors
- [ ] 关键函数单元测试覆盖率 > 80%
- [ ] 所有Server Actions包含错误处理

### 性能指标
- [ ] OCR处理速度 < 5s/页
- [ ] AI结构化处理 < 10s/页
- [ ] 题目列表加载 < 1s
- [ ] 审核操作响应 < 500ms

### 数据质量
- [ ] 去重功能准确率 > 95%
- [ ] 质量检查覆盖所有关键项
- [ ] 审核日志完整记录

### 用户体验
- [ ] 所有操作有加载状态
- [ ] 错误提示清晰易懂
- [ ] 审核界面响应式布局
- [ ] 支持批量操作（提高效率）

---

## 🚀 5. Implementation Roadmap (实施路线图)

### Week 1: Task A（数据基础层）
```
Day 1-2: Schema设计与迁移
  - A1: Prisma Schema编写
  - 创建migration
  - 应用到数据库

Day 3-4: 基础Service实现
  - A2: question-service.ts
  - CRUD + 状态管理 + 审核日志

Day 5: 类型定义与测试
  - A3: types.ts
  - A4: 单元测试
  - 验证Task A完成
```

### Week 2: Task B + C 并行开发
```
Team 1 (Task B - 内容流水线):
Day 1-2: OCR服务集成
  - B1: Google Vision + Mathpix
  - PDF转图片逻辑

Day 3-4: AI结构化
  - B2: Claude API调用
  - Prompt工程优化

Day 5: 批量导入工具
  - B3: importFromPDF
  - B4: 质量检查集成

Team 2 (Task C - 审核工具):
Day 1-2: Admin路由与权限
  - C1: layout.tsx + 权限检查
  - 题目列表页面

Day 3-4: 审核界面
  - C2: 题目详情页
  - C3: 审核面板组件

Day 5: 统计与优化
  - C4: 批量导入UI
  - C5: 统计看板
```

### Week 3: 集成测试与优化
```
Day 1-2: 端到端测试
  - 完整导入流程测试
  - 审核流程测试

Day 3-4: 性能优化
  - 数据库查询优化
  - 前端渲染优化

Day 5: Bug修复与文档
  - 修复测试发现的问题
  - 更新用户文档
```

---

## 📚 6. Reference Materials (参考资料)

### API文档
- [Google Cloud Vision API](https://cloud.google.com/vision/docs)
- [Mathpix OCR API](https://docs.mathpix.com/)
- [Claude API Documentation](https://docs.anthropic.com/)

### 技术博客
- [Building a Content Pipeline with AI](https://example.com)
- [OCR Best Practices for Education](https://example.com)
- [Quality Control in EdTech](https://example.com)

### 开源项目参考
- [Khan Academy Content Tools](https://github.com/Khan/...)
- [OpenStax Content Pipeline](https://github.com/openstax/...)

---

## 🔧 7. Troubleshooting Guide (常见问题)

### Q1: OCR识别率低（<80%）
**原因**: 图片质量差、分辨率低
**解决方案**:
```typescript
// 预处理图片（提高对比度、降噪）
import sharp from 'sharp'

async function preprocessImage(imageUrl: string): Promise<string> {
  const buffer = await fetch(imageUrl).then(r => r.arrayBuffer())

  const processed = await sharp(buffer)
    .grayscale()
    .normalize()
    .sharpen()
    .toBuffer()

  // 上传处理后的图片
  return await uploadToSupabase(processed)
}
```

### Q2: AI结构化输出格式不一致
**原因**: Prompt不够明确
**解决方案**: 使用Few-shot Learning，在Prompt中提供3个示例

### Q3: 题目去重误报（将不同题目识别为重复）
**原因**: 哈希算法过于激进
**解决方案**: 调整归一化逻辑，或提高相似度阈值

---

## ✍️ 8. Development Notes (开发笔记)

### 架构决策记录 (ADR)

**ADR-001: 使用混合OCR策略**
- **决策**: 根据内容类型选择不同OCR提供商
- **理由**: Mathpix对数学公式识别率高，但贵；Google Vision便宜但公式识别弱
- **实现**: 先用Google Vision，如果置信度<85%，降级到Mathpix

**ADR-002: 审核状态不可逆**
- **决策**: PUBLISHED状态可以回退到REVIEW_PENDING（用户报错场景）
- **理由**: 需要支持已发布题目的质量反馈
- **影响**: 学生端需要显示题目版本

**ADR-003: 用户纠错采用众包模式**
- **决策**: 不设专职审核员，使用用户报错触发复审
- **理由**: 降低人力成本，提高覆盖面
- **规则**: 3条相同类型报告 → 自动进入复审队列

---

**Story 状态**: Backlog ⚪
**最后更新**: 2026-01-28
**下次审查**: Sprint Planning Meeting
