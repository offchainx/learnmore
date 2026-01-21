# 当前数据库 Schema 分析报告

**分析时间**: 2026-01-18
**数据库**: Supabase PostgreSQL
**Schema 来源**: `prisma/schema.prisma`

---

## 📊 总览：当前表结构

### 1. 用户模块 (User System)
- `User` - 用户主表
- `ParentStudent` - 家长-学生关联
- `InviteCode` - 邀请码
- `UserSettings` - 用户设置
- `Subscriber` - 邮件订阅者

### 2. 课程模块 (Course System)
- `Subject` - 科目
- `Chapter` - 章节 (支持树形结构)
- `ChapterPrerequisite` - 章节依赖关系 (知识图谱)
- `Lesson` - 课程/视频
- `BlogPost` - 博客文章

### 3. 学习进度模块 (Progress Tracking)
- `UserProgress` - 视频/课程进度

### 4. 题库模块 (Question Bank) ⭐ 练习中心核心
- `Question` - 题目
- `UserAttempt` - 答题记录
- `ExamRecord` - 考试记录
- `ErrorBook` - 错题本

### 5. 游戏化模块 (Gamification)
- `Badge` - 徽章定义
- `UserBadge` - 用户获得的徽章
- `DailyTask` - 每日任务
- `LeaderboardEntry` - 排行榜

### 6. 社区模块 (Community)
- `Post` - 帖子
- `Comment` - 评论
- `PostLike` - 点赞
- `ContactSubmission` - 联系表单

---

## 🔍 练习中心相关表深度分析

### 1. User 表

#### ✅ 已有字段分析

```prisma
model User {
  // 基础字段
  id             String    @id @default(uuid())
  email          String    @unique
  username       String?   @unique
  role           UserRole  @default(STUDENT)
  avatar         String?
  grade          Int?      // ✅ 年级 7-9

  // 游戏化字段
  streak         Int       @default(0)       // ✅ 连续学习天数
  totalStudyTime Int       @default(0)       // ✅ 总学习时长(秒)
  xp             Int       @default(0)       // ✅ 经验值
  lastStudyDate  DateTime?                   // ✅ 上次学习日期

  // AI相关
  aiTokenBalance Int       @default(5)       // ✅ AI额度

  // 增长跟踪
  lastSignInAt   DateTime?
  signInCount    Int       @default(0)
  utmSource      String?
  utmMedium      String?
  utmCampaign    String?
  referralCode   String?

  // Relations
  attempts           UserAttempt[]      // ✅ 答题记录
  examRecords        ExamRecord[]       // ✅ 考试记录
  errorBook          ErrorBook[]        // ✅ 错题本
  dailyTasks         DailyTask[]        // ✅ 每日任务
  leaderboardEntries LeaderboardEntry[] // ✅ 排行榜
}
```

#### ❌ 缺失字段

```prisma
// 建议新增:
level Int @default(1) // 用户等级 (1-10)，用于 Smart Drill 难度匹配
```

**为什么需要 `level`?**
- `xp` (经验值) 是累积的，不适合直接用于难度匹配
- `level` 是基于 `xp` 计算的等级 (如: 0-99 xp = Level 1, 100-299 = Level 2)
- Smart Drill 推荐算法依赖: 推荐 `question.difficulty` = `user.level ± 1`

**是否真的需要?**
- 🟢 **方案 A (推荐)**: 新增 `level` 字段，明确语义
- 🟡 **方案 B (替代)**: 使用 `grade` (年级) 作为难度基准
  - 问题: 同年级学生水平差异大
  - 优点: 不需要额外字段

**你的选择?** 我倾向于方案 A

---

### 2. Question 表

#### ✅ 已有字段分析

```prisma
model Question {
  id          String       @id @default(uuid())
  chapterId   String       // ✅ 章节关联
  type        QuestionType // ✅ 题型
  difficulty  Int          @default(3) // ✅ 难度 1-5 (完美!)
  content     String       @db.Text     // ✅ 题干
  options     Json?                     // ✅ 选项
  answer      Json                      // ✅ 答案
  explanation String?      @db.Text     // ✅ 解析

  // Relations
  attempts  UserAttempt[] // ✅ 答题记录
  errorBook ErrorBook[]   // ✅ 错题本

  @@index([chapterId])
  @@index([difficulty]) // ✅ Smart Drill 查询优化
}
```

#### ❌ 缺失字段 (用于 AI 解析和历年真题)

```prisma
// 建议新增:
explanationCorrect  String?  @db.Text  // 正确选项原因
explanationWrong    Json?              // 错误选项原因 {"A": "...", "B": "..."}
source              String?            // "imported" | "manual" | "official"
sourceYear          Int?               // 年份 (2024, 2023...)
sourceRegion        String?            // 地区 ("北京", "上海")
```

**为什么需要这些字段?**

1. **`explanationCorrect` / `explanationWrong`**:
   - 当前只有通用 `explanation`
   - AI 解析时可生成更深度的"为什么对/为什么错"
   - Story-010 Phase 3 已实现的智能解析功能需要存储这些数据

2. **`source*` 字段 (历年真题功能)**:
   - 用户需求: "我要做 2024 年北京中考真题"
   - 查询: `WHERE sourceYear = 2024 AND sourceRegion = "北京"`
   - 如果不加这些字段，历年真题功能无法实现

**优先级**:
- 🔴 **高**: `source`, `sourceYear`, `sourceRegion` (历年真题必需)
- 🟡 **中**: `explanationCorrect`, `explanationWrong` (提升用户体验)

**你的决定?**

---

### 3. UserAttempt 表 (答题记录)

#### ✅ 已有字段分析

```prisma
model UserAttempt {
  id           String      @id @default(uuid())
  userId       String
  questionId   String
  examRecordId String?     // ✅ 关联考试记录 (可选)
  userAnswer   Json
  isCorrect    Boolean     // ✅ Smart Drill / Error Wiper 核心字段
  duration     Int?        // ✅ 答题耗时 (秒)
  createdAt    DateTime    // ✅ 用于"最近30天"查询

  @@index([userId])
  @@index([questionId])
  @@index([examRecordId])
  @@index([createdAt]) // ✅ 时间范围查询优化
}
```

#### 评价: ✅ **设计完善，无需修改**

**为什么设计合理?**
- `isCorrect` 支持 Smart Drill (找出错题章节)
- `duration` 支持 Weakness Analysis (识别答题慢的题型)
- `examRecordId` 区分日常练习 vs 模拟考试
- `createdAt` 索引支持 Exam Forecast (最近30天数据)

---

### 4. ExamRecord 表 (考试记录)

#### ✅ 已有字段分析

```prisma
model ExamRecord {
  id             String   @id @default(uuid())
  userId         String
  chapterId      String?  // ⚠️ 可选 (章节专项 vs 综合考试)
  title          String?  // ✅ 考试名称
  score          Float    // ✅ 总分
  totalQuestions Int      // ✅ 题目总数
  correctCount   Int      // ✅ 答对题数
  duration       Int?     // ✅ 总耗时
  createdAt      DateTime

  attempts UserAttempt[] // ✅ 关联所有答题记录
}
```

#### ⚠️ 潜在问题与建议

**问题 1: 缺少"考试状态"字段**
```prisma
// 当前问题:
// 无法区分 "正在进行中" vs "已提交" vs "已放弃" 的考试

// 建议新增:
status ExamStatus @default(IN_PROGRESS)

enum ExamStatus {
  IN_PROGRESS  // 用户还在答题
  SUBMITTED    // 已提交
  ABANDONED    // 用户中途退出
}
```

**为什么需要?**
- Mock Arena 模式: 用户可能在 45 分钟内离开页面
- 需要支持"继续上次考试"功能
- 查询未完成考试: `WHERE status = IN_PROGRESS`

**问题 2: 缺少"考试配置"字段**
```prisma
// 当前问题:
// 无法记录考试的时间限制、题目配置

// 建议新增:
timeLimit      Int      // 时长限制 (分钟)
startedAt      DateTime @default(now())
submittedAt    DateTime? // 提交时间
```

**为什么需要?**
- 倒计时组件: 需要知道考试何时开始、限时多久
- 超时自动提交: `IF (now() - startedAt) > timeLimit THEN auto_submit()`

**优先级**:
- 🔴 **高**: `status` 字段 (Mock Arena 核心功能)
- 🟡 **中**: `timeLimit`, `startedAt`, `submittedAt` (完整性)

**你的决定?**

---

### 5. ErrorBook 表 (错题本)

#### ✅ 已有字段分析

```prisma
model ErrorBook {
  id           String   @id @default(uuid())
  userId       String
  questionId   String
  masteryLevel Int      @default(0) // ✅ 掌握度 0-3 (完美!)
  createdAt    DateTime
  updatedAt    DateTime

  @@unique([userId, questionId]) // ✅ 防重复
  @@index([userId])              // ✅ 查询优化
}
```

#### ❌ 缺失字段 (Error Wiper 优化)

```prisma
// 建议新增:
lastReviewedAt DateTime? // 上次复习时间
reviewCount    Int       @default(0) // 复习次数

@@index([masteryLevel]) // ✅ 按掌握度排序查询优化
```

**为什么需要?**

1. **`lastReviewedAt`**:
   - Error Wiper 排序逻辑: "优先复习最久没看过的错题"
   - 查询: `ORDER BY lastReviewedAt ASC`
   - 没有此字段，只能按 `updatedAt` 排序 (语义不明确)

2. **`reviewCount`**:
   - 数据分析: "这道题我复习了 5 次才掌握"
   - Weakness Analysis: "用户在填空题平均需要复习 3.2 次"

**优先级**:
- 🟡 **中**: `lastReviewedAt` (提升 Error Wiper 体验)
- 🟢 **低**: `reviewCount` (数据分析用)

**你的决定?**

---

## 🆕 建议新增的表

### MockExamQuestion 表 (模拟考试-题目关联)

**当前问题**:
- `ExamRecord` 只记录考试元数据 (分数、题数)
- 无法记录"这次考试具体包含哪些题目、顺序是什么"

**影响功能**:
- 用户无法"复盘上次模拟考试"
- 无法实现"继续未完成的考试"

**建议方案**:

```prisma
model MockExamQuestion {
  id          String   @id @default(uuid())
  examId      String   @map("exam_id")
  questionId  String   @map("question_id")
  order       Int      // 题目在考试中的顺序 (1-20)

  exam     ExamRecord @relation(fields: [examId], references: [id], onDelete: Cascade)
  question Question   @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@unique([examId, questionId])
  @@index([examId])
  @@map("mock_exam_questions")
}
```

**替代方案 (不新增表)**:
```prisma
// 在 ExamRecord 中新增字段
model ExamRecord {
  questionIds Json // ["uuid1", "uuid2", ...] 按顺序存储
}
```

**对比**:
| 方案 | 优点 | 缺点 |
|------|------|------|
| 新增表 | 规范、可扩展、支持复杂查询 | 多一张表 |
| JSON 字段 | 简单、快速开发 | 无法做关联查询 |

**你的选择?** 我建议新增表 (长期维护性更好)

---

## 📋 优化建议总结

### 必需修改 (🔴 高优先级)

1. **Question 表新增字段**:
   ```prisma
   source       String? // "imported" | "manual" | "official"
   sourceYear   Int?    // 2024, 2023...
   sourceRegion String? // "北京", "上海"

   @@index([sourceYear]) // 历年真题查询优化
   ```

2. **ExamRecord 表新增字段**:
   ```prisma
   status      ExamStatus @default(IN_PROGRESS)
   timeLimit   Int        // 分钟
   startedAt   DateTime   @default(now())
   submittedAt DateTime?

   enum ExamStatus {
     IN_PROGRESS
     SUBMITTED
     ABANDONED
   }
   ```

3. **新增 MockExamQuestion 表** (或在 ExamRecord 中加 `questionIds Json`)

---

### 可选优化 (🟡 中优先级)

1. **User 表新增字段**:
   ```prisma
   level Int @default(1) // 用户等级
   ```

2. **Question 表深度解析字段**:
   ```prisma
   explanationCorrect String? @db.Text
   explanationWrong   Json?
   ```

3. **ErrorBook 表复习追踪字段**:
   ```prisma
   lastReviewedAt DateTime?
   reviewCount    Int @default(0)

   @@index([masteryLevel])
   ```

---

### 数据冗余优化 (🟢 低优先级，可暂缓)

**问题**: 每次查询 Knowledge Hive 都需要聚合计算章节正确率

**方案 A: 实时计算 (当前)**
```typescript
// 每次请求时计算
const accuracy = calculateChapterAccuracy(chapterId, userId);
```
- 优点: 数据实时、不需要额外存储
- 缺点: 计算量大 (如果章节多、用户多)

**方案 B: 增加冗余字段**
```prisma
model ChapterStats {
  id            String @id @default(uuid())
  userId        String
  chapterId     String
  totalAttempts Int    @default(0)
  correctCount  Int    @default(0)
  accuracy      Float  @default(0)
  updatedAt     DateTime @updatedAt

  @@unique([userId, chapterId])
}
```
- 优点: 查询快 (直接读取)
- 缺点: 需要定时更新 (后台任务)

**建议**: MVP 阶段用方案 A，性能瓶颈后再用方案 B

---

## 🎯 当前 Schema 设计评价

### ✅ 优点

1. **关系设计清晰**:
   - `User` ↔ `UserAttempt` ↔ `Question` 三角关系完整
   - `ExamRecord` ↔ `UserAttempt` 关联合理

2. **索引优化到位**:
   - `@@index([chapterId])` 支持章节查询
   - `@@index([difficulty])` 支持难度筛选
   - `@@index([createdAt])` 支持时间范围查询

3. **游戏化设计完善**:
   - `xp`, `streak`, `totalStudyTime` 支持成就系统
   - `ErrorBook.masteryLevel` 支持 Error Wiper

4. **树形结构支持**:
   - `Chapter` 自关联 (父子章节)
   - `ChapterPrerequisite` 支持知识图谱

### ⚠️ 不足

1. **缺少历年真题字段** (`Question.source*`)
2. **缺少考试状态管理** (`ExamRecord.status`)
3. **缺少用户等级字段** (`User.level`)
4. **缺少 MockExamQuestion 关联表**

### 总体评分: **8.5/10**

**评语**: 核心表结构扎实，游戏化设计完善，但需要补充练习中心特有的字段 (真题来源、考试状态)。

---

## 🚀 下一步行动

**请你确认以下修改方案**:

### 方案 1: 最小修改 (仅支持核心功能)
```prisma
// Question 表
+ source       String?
+ sourceYear   Int?
+ sourceRegion String?

// ExamRecord 表
+ status       ExamStatus @default(IN_PROGRESS)
+ questionIds  Json // 简化方案，不新增表
```

### 方案 2: 完整优化 (支持所有功能)
```prisma
// User 表
+ level Int @default(1)

// Question 表
+ source              String?
+ sourceYear          Int?
+ sourceRegion        String?
+ explanationCorrect  String? @db.Text
+ explanationWrong    Json?

// ExamRecord 表
+ status      ExamStatus @default(IN_PROGRESS)
+ timeLimit   Int
+ startedAt   DateTime @default(now())
+ submittedAt DateTime?

// ErrorBook 表
+ lastReviewedAt DateTime?
+ reviewCount    Int @default(0)

// 新增表
+ MockExamQuestion
```

**你选择哪个方案？** 或者你有其他想法？

确认后我将:
1. 更新 `prisma/schema.prisma`
2. 生成 Migration 文件
3. 推送到 Supabase
4. 更新 Story-010 文档

---

**文档状态**: 🟡 等待你的确认
