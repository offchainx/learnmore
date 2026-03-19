# 数据库完整Schema文档

**文档版本**: v1.1
**生成时间**: 2026-01-19 (更新)
**数据库**: Supabase PostgreSQL
**Schema来源**: `prisma/schema.prisma`
**总表数**: 25个业务表

---

## 📚 目录

- [1. Schema概览](#1-schema概览)
- [2. Public Schema详解 (25个业务表)](#2-public-schema详解)
  - [2.1 用户模块 (4个表)](#21-用户模块)
  - [2.2 课程模块 (4个表)](#22-课程模块)
  - [2.3 学习进度模块 (2个表)](#23-学习进度模块)
  - [2.4 题库模块 (4个表)](#24-题库模块)
  - [2.5 游戏化模块 (3个表)](#25-游戏化模块)
  - [2.6 社区模块 (5个表)](#26-社区模块)
  - [2.7 营销运营模块 (3个表)](#27-营销运营模块)
- [3. Auth Schema (Supabase管理)](#3-auth-schema)
- [4. Storage Schema (Supabase管理)](#4-storage-schema)
- [5. 表关系图](#5-表关系图)
- [6. 索引策略](#6-索引策略)

---

## 1. Schema概览

### 1.1 数据库Schema分层

```
Supabase PostgreSQL Database
│
├── 📦 public schema (25个表) ← 你的业务逻辑
│   └── 通过 Prisma ORM 管理
│   └── 实际存在23个独立表 (排除enum类型)
│
├── 🔐 auth schema (20个表) ← Supabase认证系统
│   └── Supabase自动管理,不要手动修改
│
├── 📁 storage schema (9个表) ← 文件存储系统
│   └── 通过 Supabase Storage API 操作
│
├── 📡 realtime schema (3个表) ← 实时订阅功能
│   └── Supabase自动管理
│
└── 🔒 vault schema (1个表) ← 密钥管理
    └── Supabase自动管理
```

### 1.2 Public Schema表格分类 (重新梳理)

| 分类 | 表数量 | 表名列表 |
|------|--------|---------|
| 👤 用户模块 | 4 | users, user_settings, parent_students, invite_codes |
| 📚 课程模块 | 4 | subjects, chapters, chapter_prerequisites, lessons |
| 📊 学习进度模块 | 2 | user_progress, daily_tasks |
| 📝 题库模块 | 4 | questions, user_attempts, exam_records, error_book |
| 🏆 游戏化模块 | 3 | badges, user_badges, leaderboard_entries |
| 💬 社区模块 | 5 | posts, comments, post_likes, subscribers, contact_submissions |
| 📧 营销运营模块 | 3 | blog_posts, subscribers (与社区共享), contact_submissions (与社区共享) |
| **总计** | **25** | *注: subscribers和contact_submissions同时服务于社区和营销* |

---

## 2. Public Schema详解

---

## 2.1 用户模块 (4个表)

**模块说明**: 负责用户身份管理、权限控制、家长-学生关联

### 📋 Table: `users`

**功能**: 用户主表,存储所有用户的核心信息和游戏化数据

**业务场景**:
- 用户注册后,Supabase Auth创建`auth.users`记录,Trigger自动同步到`public.users`
- 学习时更新`xp`、`streak`、`totalStudyTime`
- 家长、学生、教师、管理员通过`role`字段区分

**字段说明**:

| 字段名 | 类型 | 默认值 | 说明 | 业务用途 |
|--------|------|--------|------|---------|
| `id` | UUID | uuid() | 主键,与auth.users.id一致 | 用户唯一标识 |
| `email` | String | - | 邮箱,唯一索引 | 登录凭证 |
| `username` | String? | null | 用户名,唯一索引 | 显示名称 |
| `role` | UserRole | STUDENT | 角色枚举 | 权限控制 (STUDENT/PARENT/PRO/ULTIMATE/TEACHER/ADMIN) |
| `avatar` | String? | null | 头像URL | 个人资料展示 |
| `grade` | Int? | null | 年级 (7-9) | 课程推荐、难度匹配 |
| `streak` | Int | 0 | 连续学习天数 | 游戏化激励 |
| `totalStudyTime` | Int | 0 | 总学习时长(秒) | 排行榜、成就解锁 |
| `xp` | Int | 0 | 经验值 | 等级提升、排行榜 |
| `aiTokenBalance` | Int | 5 | AI额度余额 | AI讲解、诊断功能限额 |
| `lastStudyDate` | DateTime? | null | 上次学习日期 | 计算streak |
| `lastSignInAt` | DateTime? | null | 上次登录时间 | 用户活跃度分析 |
| `signInCount` | Int | 0 | 累计登录次数 | 留存分析 |
| `utmSource` | String? | null | 渠道来源 | 营销归因 (如"google", "facebook") |
| `utmMedium` | String? | null | 营销媒介 | 营销归因 (如"cpc", "email") |
| `utmCampaign` | String? | null | 活动名称 | 营销归因 (如"2024-winter") |
| `referralCode` | String? | null | 推荐码 | 用户增长、奖励发放 |
| `createdAt` | DateTime | now() | 创建时间 | 注册时间 |
| `updatedAt` | DateTime | auto | 更新时间 | 最后修改时间 |

**关联关系**:
- `1:1` → user_settings (用户设置)
- `1:N` → user_progress (学习进度)
- `1:N` → user_attempts (答题记录)
- `1:N` → exam_records (考试记录)
- `1:N` → error_book (错题本)
- `1:N` → posts (发帖)
- `1:N` → comments (评论)
- `1:N` → daily_tasks (每日任务)
- `M:N` → badges (通过user_badges)
- `M:N` → 家长学生关系 (通过parent_students)

**索引**:
- ✅ `email` (UNIQUE)
- ✅ `username` (UNIQUE)

**潜在问题**:
- ⚠️ 缺少`level`字段 (需要从xp实时计算等级)
- ⚠️ `grade`可为null,但业务上7-9年级学生应该必填

---

### 📋 Table: `user_settings`

**功能**: 用户个性化设置,与users表1对1关联

**业务场景**:
- 用户首次登录时创建默认设置
- 设置页面修改主题、语言、AI人格
- 控制通知偏好

**字段说明**:

| 字段名 | 类型 | 默认值 | 说明 | 业务用途 |
|--------|------|--------|------|---------|
| `id` | UUID | uuid() | 主键 | 设置记录ID |
| `userId` | UUID | - | 外键 → users.id | 关联用户 |
| `theme` | String | "dark" | 主题 | 界面主题 ("dark"/"light") |
| `language` | String | "en" | 语言 | 国际化 ("en"/"zh"/"ms") |
| `aiPersonality` | AiPersonality | ENCOURAGING | AI人格 | AI交互风格 (ENCOURAGING/SOCRATIC/STRICT) |
| `difficultyCalibration` | Int | 50 | 难度校准 (0-100) | 题目推荐难度调整 |
| `curriculumSystem` | String? | null | 教材体系 | 如"UEC"、"IGCSE" |
| `studyReminderTime` | String? | null | 学习提醒时间 | 如"20:00" |
| `notificationDaily` | Boolean | true | 每日推送通知 | 控制App推送 |
| `notificationWeekly` | Boolean | true | 每周报告通知 | 控制周报推送 |
| `emailMarketing` | Boolean | true | 营销邮件 | 是否接收促销邮件 |
| `emailActivity` | Boolean | true | 活动通知邮件 | 学习报告、成就通知 |

**关联关系**:
- `N:1` → users (每个用户1个设置)

**索引**:
- ✅ `userId` (UNIQUE)

**设计亮点**:
- ✅ 设置与核心用户数据分离,查询users时不加载设置字段 (性能优化)
- ✅ 所有设置都有合理默认值

---

### 📋 Table: `parent_students`

**功能**: 家长与学生的多对多关联表

**业务场景**:
- 家长账号可以绑定多个孩子
- 学生可以被多个家长监管 (如父母各一个账号)
- 家长查看孩子学习报告

**字段说明**:

| 字段名 | 类型 | 说明 | 业务用途 |
|--------|------|------|---------|
| `id` | UUID | 主键 | 关联记录ID |
| `parentId` | UUID | 外键 → users.id | 家长用户ID (role=PARENT) |
| `studentId` | UUID | 外键 → users.id | 学生用户ID (role=STUDENT) |
| `createdAt` | DateTime | 创建时间 | 绑定时间 |

**约束**:
- ✅ `@@unique([parentId, studentId])` - 防止重复绑定
- ✅ `onDelete: Cascade` - 删除用户时级联删除关联

**业务逻辑**:
```typescript
// 查询家长的所有孩子
const students = await prisma.user.findUnique({
  where: { id: parentId },
  include: {
    students: {
      include: { student: true }
    }
  }
});

// 查询学生的家长
const parents = await prisma.user.findUnique({
  where: { id: studentId },
  include: {
    parents: {
      include: { parent: true }
    }
  }
});
```

---

### 📋 Table: `invite_codes`

**功能**: 家长邀请码系统,用于家长绑定学生

**业务场景**:
1. 学生生成邀请码
2. 家长输入邀请码完成绑定
3. 邀请码有效期限制 (如7天)

**字段说明**:

| 字段名 | 类型 | 说明 | 业务用途 |
|--------|------|------|---------|
| `id` | UUID | 主键 | 邀请码记录ID |
| `code` | String | 邀请码,唯一索引 | 如"ABC123XYZ" |
| `studentId` | UUID | 外键 → users.id | 生成邀请码的学生 |
| `expiresAt` | DateTime | 过期时间 | 如7天后 |
| `used` | Boolean | 是否已使用 | 防止重复使用 |
| `createdAt` | DateTime | 创建时间 | 生成时间 |

**索引**:
- ✅ `code` (UNIQUE)

**业务逻辑**:
```typescript
// 生成邀请码
const code = generateRandomCode(); // "ABC123"
await prisma.inviteCode.create({
  data: {
    code,
    studentId,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天后
  }
});

// 验证邀请码
const invite = await prisma.inviteCode.findUnique({
  where: { code },
});

if (!invite || invite.used || invite.expiresAt < new Date()) {
  throw new Error("邀请码无效或已过期");
}

// 创建家长-学生关联
await prisma.parentStudent.create({
  data: {
    parentId,
    studentId: invite.studentId,
  }
});

// 标记邀请码已使用
await prisma.inviteCode.update({
  where: { id: invite.id },
  data: { used: true }
});
```

---

## 2.2 课程模块 (4个表)

**模块说明**: 负责学科、章节、课程内容的组织和管理

### 📋 Table: `subjects`

**功能**: 学科/科目表

**业务场景**:
- 平台支持的6大学科: 数学、物理、化学、英语、语文、生物
- 首页科目卡片展示

**字段说明**:

| 字段名 | 类型 | 默认值 | 说明 | 业务用途 |
|--------|------|--------|------|---------|
| `id` | UUID | uuid() | 主键 | 科目ID |
| `name` | String | - | 科目名称,唯一 | 如"数学"、"物理" |
| `icon` | String? | null | 图标 | 显示图标URL或emoji |
| `order` | Int | 0 | 排序 | 控制显示顺序 |

**关联关系**:
- `1:N` → chapters (章节)
- `1:N` → posts (社区帖子可关联科目)

**索引**:
- ✅ `name` (UNIQUE)

**数据示例**:
```sql
INSERT INTO subjects (name, icon, order) VALUES
  ('数学', '🔢', 1),
  ('物理', '⚛️', 2),
  ('化学', '🧪', 3),
  ('英语', '🇬🇧', 4),
  ('语文', '📖', 5),
  ('生物', '🧬', 6);
```

---

### 📋 Table: `chapters`


**业务场景**:
- 树形目录: 一级章节 → 二级章节 → 三级章节

**字段说明**:

| 字段名 | 类型 | 默认值 | 说明 | 业务用途 |
|--------|------|--------|------|---------|
| `id` | UUID | uuid() | 主键 | 章节ID |
| `subjectId` | UUID | - | 外键 → subjects.id | 所属科目 |
| `parentId` | UUID? | null | 外键 → chapters.id (自关联) | 父章节ID (null表示根章节) |
| `title` | String | - | 章节名称 | 如"一元一次方程" |
| `order` | Int | 0 | 排序 | 同级章节排序 |
| `createdAt` | DateTime | now() | 创建时间 | 记录创建时间 |

**关联关系**:
- `N:1` → subjects (所属科目)
- `N:1` → chapters (父章节, self-relation)
- `1:N` → chapters (子章节, self-relation)
- `1:N` → lessons (课程)
- `1:N` → questions (题目)
- `M:N` → 前置依赖 (通过chapter_prerequisites)

**索引**:
- ✅ `subjectId`
- ✅ `parentId`

**树形结构示例**:
```
数学 (Subject)
  └─ 代数 (Chapter, parentId=null)
       ├─ 一元一次方程 (Chapter, parentId=代数ID)
       │    └─ 方程的基本概念 (Lesson)
       └─ 一元二次方程 (Chapter, parentId=代数ID)
```

- `x`, `y` 用于前端绘制节点位置
- 例: 章节A (x=100, y=200), 章节B (x=300, y=200)
- 前端通过这些坐标绘制连线、迷雾效果

---

### 📋 Table: `chapter_prerequisites`


**业务场景**:
- 定义学习路径: 必须先学A章节,才能解锁B章节
- 智能推荐: 做错B章节题目 → AI推荐复习A章节

**字段说明**:

| 字段名 | 类型 | 说明 | 业务用途 |
|--------|------|------|---------|
| `id` | UUID | 主键 | 依赖关系ID |
| `prerequisiteId` | UUID | 外键 → chapters.id | 前置章节ID (必须先学的) |
| `dependentId` | UUID | 外键 → chapters.id | 依赖章节ID (后学的) |

**约束**:
- ✅ `@@unique([prerequisiteId, dependentId])` - 防止重复依赖

**业务逻辑**:
```typescript
// 查询章节的所有前置条件
const prerequisites = await prisma.chapter.findUnique({
  where: { id: chapterId },
  include: {
    prerequisites: {
      include: { prerequisite: true }
    }
  }
});

// 检查是否可以解锁章节
const canUnlock = prerequisites.every(p =>
  isChapterCompleted(p.prerequisite.id, userId)
);
```

**数据示例**:
```
prerequisiteId: "一元一次方程"
dependentId: "一元二次方程"
→ 含义: 必须先学一次方程,才能学二次方程
```

---

### 📋 Table: `lessons`

**功能**: 课程/课时表,存储视频、文档、练习内容

**业务场景**:
- 视频课程: 播放视频、断点续播
- 文档课程: 显示Markdown内容
- 练习课程: 跳转到题目

**字段说明**:

| 字段名 | 类型 | 默认值 | 说明 | 业务用途 |
|--------|------|--------|------|---------|
| `id` | UUID | uuid() | 主键 | 课程ID |
| `chapterId` | UUID | - | 外键 → chapters.id | 所属章节 |
| `title` | String | - | 课程标题 | 如"方程的基本概念" |
| `type` | LessonType | VIDEO | 课程类型 | VIDEO/DOCUMENT/EXERCISE/QUIZ |
| `videoUrl` | String? | null | 视频URL | Supabase Storage URL |
| `content` | Text? | null | Markdown内容 | 文档课程内容 |
| `duration` | Int? | null | 视频时长(秒) | 如1800秒=30分钟 |
| `xpReward` | Int | 10 | 完成奖励XP | 游戏化激励 |
| `order` | Int | 0 | 排序 | 课时顺序 |
| `createdAt` | DateTime | now() | 创建时间 | 记录创建时间 |

**关联关系**:
- `N:1` → chapters (所属章节)
- `1:N` → user_progress (学习进度)

**索引**:
- ✅ `chapterId`

**LessonType枚举**:
```prisma
enum LessonType {
  VIDEO      // 视频课程
  DOCUMENT   // 文档/讲义
  EXERCISE   // 练习题
  QUIZ       // 测验
}
```

**潜在问题**:
- ⚠️ 缺少`downloadUrl`字段 (无法下载配套讲义PDF)
- ⚠️ `videoUrl`存储在表中,如果视频迁移需要批量更新

---

## 2.3 学习进度模块 (2个表)

**模块说明**: 追踪用户的课程学习进度和每日任务完成情况

### 📋 Table: `user_progress`

**功能**: 用户课程学习进度记录

**业务场景**:
- 视频播放进度: 记录播放到第几秒
- 完成度追踪: 计算章节完成百分比
- 断点续播: 下次打开从上次位置继续

**字段说明**:

| 字段名 | 类型 | 默认值 | 说明 | 业务用途 |
|--------|------|--------|------|---------|
| `id` | UUID | uuid() | 主键 | 进度记录ID |
| `userId` | UUID | - | 外键 → users.id | 学习用户 |
| `lessonId` | UUID | - | 外键 → lessons.id | 学习课程 |
| `progress` | Float | 0 | 进度百分比 (0-100) | 如75.5表示75.5% |
| `isCompleted` | Boolean | false | 是否完成 | progress=100时为true |
| `lastPosition` | Int? | null | 视频最后播放位置(秒) | 断点续播 |
| `updatedAt` | DateTime | auto | 更新时间 | 最后学习时间 |

**关联关系**:
- `N:1` → users
- `N:1` → lessons

**约束**:
- ✅ `@@unique([userId, lessonId])` - 一个用户对一个课程只有一条进度记录

**索引**:
- ✅ `userId`

**业务逻辑**:
```typescript
// 更新播放进度 (每30秒上报一次)
await prisma.userProgress.upsert({
  where: {
    userId_lessonId: { userId, lessonId }
  },
  update: {
    lastPosition,
    progress: (lastPosition / lesson.duration) * 100,
    isCompleted: lastPosition >= lesson.duration * 0.95 // 播放95%算完成
  },
  create: {
    userId,
    lessonId,
    lastPosition,
    progress: (lastPosition / lesson.duration) * 100
  }
});

// 完成课程时奖励XP
if (isCompleted) {
  await prisma.user.update({
    where: { id: userId },
    data: { xp: { increment: lesson.xpReward } }
  });
}
```

---

### 📋 Table: `daily_tasks`

**功能**: 每日任务系统 (游戏化)

**业务场景**:
- 每日登录任务
- 完成3节课程任务
- 做对10道题任务

**字段说明**:

| 字段名 | 类型 | 默认值 | 说明 | 业务用途 |
|--------|------|--------|------|---------|
| `id` | UUID | uuid() | 主键 | 任务ID |
| `userId` | UUID | - | 外键 → users.id | 任务所属用户 |
| `type` | DailyTaskType | - | 任务类型 | LOGIN/COMPLETE_LESSON/FIX_ERROR等 |
| `title` | String | - | 任务标题 | 如"完成3节课程" |
| `targetCount` | Int | - | 目标数量 | 如3 (3节课) |
| `currentCount` | Int | 0 | 当前进度 | 如已完成2节 |
| `xpReward` | Int | 0 | 奖励XP | 完成后获得经验值 |
| `isClaimed` | Boolean | false | 是否已领取奖励 | 防止重复领取 |
| `date` | Date | today | 任务日期 | 只存日期,不含时间 |

**关联关系**:
- `N:1` → users

**索引**:
- ✅ `[userId, date]` - 组合索引,快速查询某天任务

**DailyTaskType枚举**:
```prisma
enum DailyTaskType {
  LOGIN                  // 每日登录
  COMPLETE_LESSON        // 完成课程
  FIX_ERROR              // 订正错题
  QUIZ_SCORE             // 测验达到分数
  ONBOARDING_PROFILE     // 完善资料
  ONBOARDING_GOALS       // 设置学习目标
  ONBOARDING_ASSESSMENT  // 完成入学测试
}
```

**业务逻辑**:
```typescript
// 每天0点为每个用户生成今日任务
async function generateDailyTasks(userId: string) {
  const today = new Date().toISOString().split('T')[0];

  await prisma.dailyTask.createMany({
    data: [
      {
        userId,
        type: 'LOGIN',
        title: '每日登录',
        targetCount: 1,
        xpReward: 10,
        date: today
      },
      {
        userId,
        type: 'COMPLETE_LESSON',
        title: '完成3节课程',
        targetCount: 3,
        xpReward: 30,
        date: today
      }
    ]
  });
}

// 用户完成课程后更新任务进度
const task = await prisma.dailyTask.findFirst({
  where: {
    userId,
    type: 'COMPLETE_LESSON',
    date: today,
    isClaimed: false
  }
});

if (task) {
  await prisma.dailyTask.update({
    where: { id: task.id },
    data: {
      currentCount: { increment: 1 }
    }
  });

  // 如果达成目标,自动发放奖励
  if (task.currentCount + 1 >= task.targetCount) {
    await claimTaskReward(task.id);
  }
}
```

---

## 2.4 题库模块 (4个表)

**模块说明**: 题目管理、答题记录、考试系统、错题本功能

### 📋 Table: `questions`

**功能**: 题目库,存储所有练习题和考试题

**业务场景**:
- 章节练习: 按章节筛选题目
- 难度分级: 按难度1-5星筛选
- LaTeX公式: 支持数学/物理公式渲染

**字段说明**:

| 字段名 | 类型 | 默认值 | 说明 | 业务用途 |
|--------|------|--------|------|---------|
| `id` | UUID | uuid() | 主键 | 题目ID |
| `chapterId` | UUID | - | 外键 → chapters.id | 所属章节 |
| `type` | QuestionType | - | 题型 | SINGLE_CHOICE/MULTIPLE_CHOICE/FILL_BLANK/ESSAY |
| `difficulty` | Int | 3 | 难度 (1-5) | 1=简单, 5=困难 |
| `content` | Text | - | 题干 | Markdown + LaTeX格式 |
| `options` | Json? | null | 选项 | {"A": "...", "B": "..."} |
| `answer` | Json | - | 答案 | 单选:"A", 多选:["A","C"], 填空:["答案1"] |
| `explanation` | Text? | null | 解析 | 答案解释 |
| `createdAt` | DateTime | now() | 创建时间 | 录入时间 |

**关联关系**:
- `N:1` → chapters
- `1:N` → user_attempts (答题记录)
- `1:N` → error_book (错题本)

**索引**:
- ✅ `chapterId`
- ✅ `difficulty`

**QuestionType枚举**:
```prisma
enum QuestionType {
  SINGLE_CHOICE    // 单选题
  MULTIPLE_CHOICE  // 多选题
  FILL_BLANK       // 填空题
  ESSAY            // 简答题
  MCQ              // 兼容旧数据
}
```

**数据示例**:
```json
{
  "content": "计算: $\\frac{1}{2} + \\frac{1}{3} = $ ?",
  "options": {
    "A": "$\\frac{2}{5}$",
    "B": "$\\frac{5}{6}$",
    "C": "$\\frac{3}{5}$",
    "D": "$1$"
  },
  "answer": "B",
  "explanation": "通分: $\\frac{3}{6} + \\frac{2}{6} = \\frac{5}{6}$"
}
```

**潜在问题**:
- ⚠️ 缺少`source`, `sourceYear`, `sourceRegion`字段 (无法筛选"2024北京中考真题")
- ⚠️ `explanation`是通用解析,缺少"为什么对/为什么错"的深度解析

---

### 📋 Table: `user_attempts`

**功能**: 用户答题记录表

**业务场景**:
- 记录每次答题的答案、正误、耗时
- 计算正确率
- 错题自动加入错题本

**字段说明**:

| 字段名 | 类型 | 默认值 | 说明 | 业务用途 |
|--------|------|--------|------|---------|
| `id` | UUID | uuid() | 主键 | 答题记录ID |
| `userId` | UUID | - | 外键 → users.id | 答题用户 |
| `questionId` | UUID | - | 外键 → questions.id | 答题题目 |
| `examRecordId` | UUID? | null | 外键 → exam_records.id | 所属考试 (可选) |
| `userAnswer` | Json | - | 用户答案 | 单选:"A", 多选:["A","C"], 填空:["答案"] |
| `isCorrect` | Boolean | - | 是否正确 | 自动判断 |
| `duration` | Int? | null | 答题耗时(秒) | 如120秒 |
| `createdAt` | DateTime | now() | 答题时间 | 记录时间 |

**关联关系**:
- `N:1` → users
- `N:1` → questions
- `N:1` → exam_records (可选)

**索引**:
- ✅ `userId`
- ✅ `questionId`
- ✅ `examRecordId`
- ✅ `createdAt`

**业务逻辑**:
```typescript
// 提交答题
const attempt = await prisma.userAttempt.create({
  data: {
    userId,
    questionId,
    userAnswer,
    isCorrect: checkAnswer(question, userAnswer),
    duration: timeTaken
  }
});

// 如果答错,自动加入错题本
if (!attempt.isCorrect) {
  await prisma.errorBook.upsert({
    where: {
      userId_questionId: { userId, questionId }
    },
    update: {
      masteryLevel: 0, // 重置掌握度
      updatedAt: new Date()
    },
    create: {
      userId,
      questionId,
      masteryLevel: 0
    }
  });
}
```

---

### 📋 Table: `exam_records`

**功能**: 考试/测验记录表

**业务场景**:
- 模拟考试: 20题限时45分钟
- 章节测验: 完成章节后的小测验
- 考试复盘: 查看历史考试成绩

**字段说明**:

| 字段名 | 类型 | 默认值 | 说明 | 业务用途 |
|--------|------|--------|------|---------|
| `id` | UUID | uuid() | 主键 | 考试记录ID |
| `userId` | UUID | - | 外键 → users.id | 考试用户 |
| `chapterId` | UUID? | null | 外键 → chapters.id | 章节测验 (可选) |
| `title` | String? | null | 考试标题 | 如"第一章测验" |
| `score` | Float | - | 总分 | 如85.5分 |
| `totalQuestions` | Int | - | 题目总数 | 如20题 |
| `correctCount` | Int | - | 答对题数 | 如17题 |
| `duration` | Int? | null | 总耗时(秒) | 如2700秒=45分钟 |
| `createdAt` | DateTime | now() | 考试时间 | 提交时间 |

**关联关系**:
- `N:1` → users
- `1:N` → user_attempts (关联所有答题记录)

**索引**:
- ✅ `userId`

**业务逻辑**:
```typescript
// 提交考试
const examRecord = await prisma.examRecord.create({
  data: {
    userId,
    title: "数学模拟考试",
    totalQuestions: 20,
    correctCount: 17,
    score: (17 / 20) * 100, // 85分
    duration: 2700
  }
});

// 关联所有答题记录
await prisma.userAttempt.updateMany({
  where: {
    userId,
    questionId: { in: questionIds },
    examRecordId: null
  },
  data: {
    examRecordId: examRecord.id
  }
});
```

**潜在问题**:
- ⚠️ 缺少`status`字段 (无法区分"进行中"、"已提交"、"已放弃")
- ⚠️ 缺少`timeLimit`, `startedAt`, `submittedAt` (无法实现倒计时、超时自动提交)

---

### 📋 Table: `error_book`

**功能**: 错题本,记录用户做错的题目及掌握程度

**业务场景**:
- 自动收录: 答错题目自动加入
- 掌握度追踪: 0=未掌握, 1=初步, 2=熟练, 3=精通
- 错题复习: 优先复习掌握度低的题目

**字段说明**:

| 字段名 | 类型 | 默认值 | 说明 | 业务用途 |
|--------|------|--------|------|---------|
| `id` | UUID | uuid() | 主键 | 错题记录ID |
| `userId` | UUID | - | 外键 → users.id | 用户 |
| `questionId` | UUID | - | 外键 → questions.id | 错题 |
| `masteryLevel` | Int | 0 | 掌握度 (0-3) | 0=未掌握, 3=已精通 |
| `createdAt` | DateTime | now() | 加入时间 | 首次答错时间 |
| `updatedAt` | DateTime | auto | 更新时间 | 最后练习时间 |

**关联关系**:
- `N:1` → users
- `N:1` → questions

**约束**:
- ✅ `@@unique([userId, questionId])` - 一道题只有一条错题记录

**索引**:
- ✅ `userId`

**业务逻辑**:
```typescript
// 答对一次 → 掌握度+1
await prisma.errorBook.update({
  where: {
    userId_questionId: { userId, questionId }
  },
  data: {
    masteryLevel: { increment: 1 }
  }
});

// 如果掌握度达到3,从错题本移除
if (errorBook.masteryLevel >= 3) {
  await prisma.errorBook.delete({
    where: { id: errorBook.id }
  });
}

// 答错 → 重置掌握度为0
await prisma.errorBook.update({
  where: {
    userId_questionId: { userId, questionId }
  },
  data: {
    masteryLevel: 0
  }
});
```

**潜在问题**:
- ⚠️ 缺少`lastReviewedAt`字段 (无法按"最久未复习"排序)
- ⚠️ 缺少`reviewCount`字段 (无法统计复习次数)

---

## 2.5 游戏化模块 (3个表)

**模块说明**: 徽章成就系统、排行榜功能 (每日任务已归入学习进度模块)

### 📋 Table: `badges`

**功能**: 徽章/成就定义表

**业务场景**:
- 定义所有可获得的徽章
- 如"连续打卡7天"、"数学满分"

**字段说明**:

| 字段名 | 类型 | 说明 | 业务用途 |
|--------|------|------|---------|
| `id` | UUID | 主键 | 徽章ID |
| `code` | String | 徽章代码,唯一 | 如"early_bird", "math_master" |
| `name` | String | 徽章名称 | 如"早起鸟" |
| `description` | String | 徽章描述 | 如"连续7天早上8点前学习" |
| `icon` | String | 图标 | URL或emoji |
| `condition` | String? | 解锁条件描述 | 如"连续打卡30天" |
| `createdAt` | DateTime | 创建时间 | 录入时间 |

**索引**:
- ✅ `code` (UNIQUE)

**数据示例**:
```json
[
  {
    "code": "streak_7",
    "name": "坚持不懈",
    "description": "连续学习7天",
    "icon": "🔥",
    "condition": "streak >= 7"
  },
  {
    "code": "math_100",
    "name": "数学大师",
    "description": "数学测验满分",
    "icon": "🏆",
    "condition": "exam score = 100 AND subject = 数学"
  }
]
```

---

### 📋 Table: `user_badges`

**功能**: 用户获得的徽章记录 (多对多关联表)

**字段说明**:

| 字段名 | 类型 | 说明 | 业务用途 |
|--------|------|------|---------|
| `id` | UUID | 主键 | 记录ID |
| `userId` | UUID | 外键 → users.id | 用户 |
| `badgeId` | UUID | 外键 → badges.id | 徽章 |
| `awardedAt` | DateTime | 获得时间 | 解锁时间 |

**约束**:
- ✅ `@@unique([userId, badgeId])` - 一个徽章只能获得一次

**索引**:
- ✅ `userId`

**业务逻辑**:
```typescript
// 检查并发放徽章
async function checkAndAwardBadge(userId: string, badgeCode: string) {
  const badge = await prisma.badge.findUnique({
    where: { code: badgeCode }
  });

  const alreadyHas = await prisma.userBadge.findUnique({
    where: {
      userId_badgeId: { userId, badgeId: badge.id }
    }
  });

  if (!alreadyHas) {
    await prisma.userBadge.create({
      data: { userId, badgeId: badge.id }
    });

    // 发送通知
    await sendNotification(userId, `🎉 你获得了徽章: ${badge.name}`);
  }
}

// 用户学习后检查streak徽章
const user = await prisma.user.findUnique({ where: { id: userId } });
if (user.streak === 7) {
  await checkAndAwardBadge(userId, 'streak_7');
}
```

---

### 📋 Table: `leaderboard_entries`

**功能**: 排行榜条目表

**业务场景**:
- 周榜: 本周学习时长排名
- 月榜: 本月XP排名
- 总榜: 历史总XP排名

**字段说明**:

| 字段名 | 类型 | 默认值 | 说明 | 业务用途 |
|--------|------|--------|------|---------|
| `id` | UUID | uuid() | 主键 | 记录ID |
| `userId` | UUID | - | 外键 → users.id | 用户 |
| `score` | Int | 0 | 分数 | 排名依据 (XP或学习时长) |
| `rank` | Int? | null | 排名 | 缓存的排名(可选) |
| `period` | LeaderboardPeriod | WEEKLY | 榜单类型 | WEEKLY/MONTHLY/ALL_TIME |
| `weekStart` | DateTime | - | 周期起始日期 | 如2026-01-13 |
| `updatedAt` | DateTime | auto | 更新时间 | 最后更新时间 |

**约束**:
- ✅ `@@unique([userId, period, weekStart])` - 每个用户在每个周期只有一条记录

**索引**:
- ✅ `[period, weekStart, score(desc)]` - 组合索引,快速排序
- ✅ `userId`

**LeaderboardPeriod枚举**:
```prisma
enum LeaderboardPeriod {
  WEEKLY    // 周榜
  MONTHLY   // 月榜
  ALL_TIME  // 总榜
}
```

**业务逻辑**:
```typescript
// 更新周榜分数
const weekStart = getStartOfWeek(new Date()); // 本周一00:00:00

await prisma.leaderboardEntry.upsert({
  where: {
    userId_period_weekStart: {
      userId,
      period: 'WEEKLY',
      weekStart
    }
  },
  update: {
    score: { increment: xpGained }
  },
  create: {
    userId,
    period: 'WEEKLY',
    weekStart,
    score: xpGained
  }
});

// 查询周榜前10名
const top10 = await prisma.leaderboardEntry.findMany({
  where: {
    period: 'WEEKLY',
    weekStart
  },
  orderBy: { score: 'desc' },
  take: 10,
  include: {
    user: {
      select: { username: true, avatar: true }
    }
  }
});
```

---

### 📋 (已在2.3说明) `daily_tasks`

见 [2.3 学习进度模块](#23-学习进度模块)

---

## 2.6 社区模块 (5个表)

**模块说明**: 用户发帖、评论、点赞功能,以及邮件订阅和联系表单

### 📋 Table: `posts`

**功能**: 社区帖子表

**业务场景**:
- 用户发帖求助、分享笔记
- 按科目分类
- 标记问题是否已解决

**字段说明**:

| 字段名 | 类型 | 默认值 | 说明 | 业务用途 |
|--------|------|--------|------|---------|
| `id` | UUID | uuid() | 主键 | 帖子ID |
| `authorId` | UUID | - | 外键 → users.id | 作者 |
| `title` | String | - | 标题 | 如"求助:二次函数怎么做" |
| `content` | Text | - | 正文 | Markdown格式 |
| `category` | String? | null | 分类 | 如"Question", "Note", "Achievement" |
| `tags` | String[] | [] | 标签数组 | 如["数学", "函数"] |
| `subjectId` | UUID? | null | 外键 → subjects.id | 关联科目 |
| `likeCount` | Int | 0 | 点赞数 | 冗余字段,提升查询性能 |
| `isSolved` | Boolean | false | 是否已解决 | 仅Question类型使用 |
| `createdAt` | DateTime | now() | 发帖时间 | 排序用 |
| `updatedAt` | DateTime | auto | 更新时间 | 最后编辑时间 |

**关联关系**:
- `N:1` → users (作者)
- `N:1` → subjects (科目)
- `1:N` → comments (评论)
- `M:N` → users (点赞,通过post_likes)

**索引**:
- ✅ `authorId`
- ✅ `createdAt`

**业务逻辑**:
```typescript
// 创建帖子
const post = await prisma.post.create({
  data: {
    authorId: userId,
    title: "这道题怎么做?",
    content: "![题目图片](url)\n求解答",
    category: "Question",
    tags: ["数学", "函数"],
    subjectId: mathSubjectId
  }
});

// 标记为已解决
await prisma.post.update({
  where: { id: postId },
  data: { isSolved: true }
});
```

**潜在问题**:
- ⚠️ 缺少`status`字段 (无法实现内容审核)
- ⚠️ `likeCount`是冗余字段,需要与post_likes表保持同步

---

### 📋 Table: `comments`

**功能**: 帖子评论表

**字段说明**:

| 字段名 | 类型 | 默认值 | 说明 | 业务用途 |
|--------|------|--------|------|---------|
| `id` | UUID | uuid() | 主键 | 评论ID |
| `postId` | UUID | - | 外键 → posts.id | 所属帖子 |
| `authorId` | UUID | - | 外键 → users.id | 评论者 |
| `content` | Text | - | 评论内容 | Markdown格式 |
| `isSolution` | Boolean | false | 是否为最佳答案 | 作者可标记 |
| `createdAt` | DateTime | now() | 评论时间 | 排序用 |

**关联关系**:
- `N:1` → posts
- `N:1` → users

**索引**:
- ✅ `postId`

**业务逻辑**:
```typescript
// 发表评论
await prisma.comment.create({
  data: {
    postId,
    authorId: userId,
    content: "这道题应该这样做..."
  }
});

// 标记为最佳答案
await prisma.comment.update({
  where: { id: commentId },
  data: { isSolution: true }
});

// 同时标记帖子为已解决
await prisma.post.update({
  where: { id: postId },
  data: { isSolved: true }
});
```

**注意事项**:
- ⚠️ 不支持评论的评论 (嵌套评论需要增加`parentCommentId`字段)

---

### 📋 Table: `post_likes`

**功能**: 帖子点赞关系表 (多对多)

**字段说明**:

| 字段名 | 类型 | 说明 | 业务用途 |
|--------|------|------|---------|
| `id` | UUID | 主键 | 点赞记录ID |
| `userId` | UUID | 外键 → users.id | 点赞用户 |
| `postId` | UUID | 外键 → posts.id | 被点赞帖子 |
| `createdAt` | DateTime | 点赞时间 | 记录时间 |

**约束**:
- ✅ `@@unique([userId, postId])` - 一个用户只能点赞一次

**业务逻辑**:
```typescript
// 点赞
await prisma.postLike.create({
  data: { userId, postId }
});

// 更新帖子点赞数 (冗余字段)
await prisma.post.update({
  where: { id: postId },
  data: { likeCount: { increment: 1 } }
});

// 取消点赞
await prisma.postLike.delete({
  where: {
    userId_postId: { userId, postId }
  }
});

await prisma.post.update({
  where: { id: postId },
  data: { likeCount: { decrement: 1 } }
});
```

---

### 📋 Table: `contact_submissions`

**功能**: 联系表单提交记录

**业务场景**:
- Landing Page联系表单
- 用户反馈、商务合作

**字段说明**:

| 字段名 | 类型 | 默认值 | 说明 | 业务用途 |
|--------|------|--------|------|---------|
| `id` | UUID | uuid() | 主键 | 提交记录ID |
| `name` | String | - | 姓名 | 联系人 |
| `email` | String | - | 邮箱 | 回复邮箱 |
| `subject` | String | - | 主题 | 如"产品咨询" |
| `message` | Text | - | 留言内容 | 详细信息 |
| `status` | ContactStatus | NEW | 处理状态 | NEW/READ/REPLIED |
| `createdAt` | DateTime | now() | 提交时间 | 记录时间 |

**ContactStatus枚举**:
```prisma
enum ContactStatus {
  NEW      // 新提交,未读
  READ     // 已读,未回复
  REPLIED  // 已回复
}
```

**业务逻辑**:
```typescript
// 提交表单
await prisma.contactSubmission.create({
  data: {
    name: "张三",
    email: "zhangsan@example.com",
    subject: "产品合作",
    message: "想了解批量购买价格"
  }
});

// 管理后台标记已读
await prisma.contactSubmission.update({
  where: { id },
  data: { status: 'READ' }
});
```

---

## 2.7 营销运营模块 (3个表)

**模块说明**: 博客内容、邮件订阅、用户反馈收集

### 📋 Table: `blog_posts`

**功能**: 博客文章表 (营销/内容运营)

**业务场景**:
- 官网博客: 学习方法、产品更新
- SEO优化: 通过博客吸引流量

**字段说明**:

| 字段名 | 类型 | 默认值 | 说明 | 业务用途 |
|--------|------|--------|------|---------|
| `id` | UUID | uuid() | 主键 | 文章ID |
| `slug` | String | - | URL别名,唯一 | 如"how-to-study-math" |
| `title` | String | - | 文章标题 | SEO标题 |
| `excerpt` | String? | null | 摘要 | 列表页显示 |
| `content` | Text | - | 正文内容 | Markdown格式 |
| `coverImage` | String? | null | 封面图 | 列表卡片图片 |
| `author` | String | - | 作者名 | 如"LearnMore团队" |
| `category` | String | - | 分类 | 如"学习方法"、"产品更新" |
| `tags` | String[] | [] | 标签数组 | 如["数学", "中考"] |
| `publishedAt` | DateTime | now() | 发布时间 | 排序用 |
| `isPublished` | Boolean | false | 是否发布 | 草稿/已发布 |
| `createdAt` | DateTime | now() | 创建时间 | 记录创建时间 |
| `updatedAt` | DateTime | auto | 更新时间 | 最后修改时间 |

**索引**:
- ✅ `slug` (UNIQUE)

**业务逻辑**:
```typescript
// 查询已发布文章
const posts = await prisma.blogPost.findMany({
  where: { isPublished: true },
  orderBy: { publishedAt: 'desc' }
});

// 通过slug查询
const post = await prisma.blogPost.findUnique({
  where: { slug: 'how-to-study-math' }
});
```

---

### 📋 Table: `subscribers`

**功能**: 邮件订阅者列表 (同时服务于社区和营销)

**业务场景**:
- 访客在Landing Page输入邮箱订阅
- 发送新功能通知、活动邮件
- 社区精华内容推送

**字段说明**:

| 字段名 | 类型 | 说明 | 业务用途 |
|--------|------|------|---------|
| `id` | UUID | 主键 | 订阅记录ID |
| `email` | String | 邮箱,唯一索引 | 订阅者邮箱 |
| `subscribedAt` | DateTime | 订阅时间 | 记录订阅时间 |

**索引**:
- ✅ `email` (UNIQUE)

**注意事项**:
- ⚠️ 此表独立于users表 (订阅者可能未注册)
- ⚠️ 需要支持"取消订阅"功能 (建议增加`unsubscribed`字段)

---

### 📋 Table: `contact_submissions` (共享)

**注**: 此表已在 [2.6 社区模块](#📋-table-contact_submissions) 详细说明,同时服务于:
- 社区功能: 用户反馈、问题报告
- 营销功能: 商务合作、产品咨询

---

## 3. Auth Schema (Supabase管理)

**⚠️ 重要**: 此Schema由Supabase自动管理,**不要手动修改**!

### 核心表:

| 表名 | 说明 | 与public的关系 |
|------|------|---------------|
| `auth.users` | 认证用户表 | 通过Trigger同步到public.users |
| `auth.sessions` | 会话表 | JWT令牌管理 |
| `auth.refresh_tokens` | 刷新令牌 | 自动登录 |
| `auth.identities` | 第三方登录 | 如Google, GitHub |

### Trigger同步逻辑:

```sql
-- 当auth.users插入新用户时,自动创建public.users记录
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.email, NEW.created_at, NEW.updated_at);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**你需要做的**:
- ✅ 在Story-002中已创建此Trigger
- ❌ 不要直接操作auth.users表

---

## 4. Storage Schema (Supabase管理)

**功能**: 文件存储系统

### 核心表:

| 表名 | 说明 |
|------|------|
| `storage.buckets` | 存储桶定义 (如"videos", "avatars") |
| `storage.objects` | 文件对象记录 |

### Bucket配置示例:

```typescript
// 在Supabase Dashboard创建buckets
buckets: [
  { name: 'avatars', public: true },
  { name: 'videos', public: false },
  { name: 'documents', public: false },
  { name: 'questions', public: true }
]
```

### 使用方式:

```typescript
// 上传文件
const { data, error } = await supabase.storage
  .from('videos')
  .upload('lesson-123.mp4', videoFile);

// 获取URL
const { data: { publicUrl } } = supabase.storage
  .from('videos')
  .getPublicUrl('lesson-123.mp4');

// 存储到数据库
await prisma.lesson.update({
  where: { id: lessonId },
  data: { videoUrl: publicUrl }
});
```

---

## 5. 表关系图

### 5.1 核心关系图 (简化版)

```
User (用户)
  ├─ 1:1  → UserSettings (设置)
  ├─ 1:N  → UserProgress (学习进度)
  ├─ 1:N  → UserAttempt (答题记录)
  ├─ 1:N  → ExamRecord (考试记录)
  ├─ 1:N  → ErrorBook (错题本)
  ├─ 1:N  → Post (发帖)
  ├─ 1:N  → Comment (评论)
  ├─ 1:N  → DailyTask (每日任务)
  ├─ M:N  → Badge (徽章, 通过UserBadge)
  └─ M:N  → User (家长-学生, 通过ParentStudent)

Subject (科目)
  └─ 1:N  → Chapter (章节)
        ├─ 1:N  → Lesson (课程)
        ├─ 1:N  → Question (题目)
        └─ M:N  → Chapter (前置依赖, 通过ChapterPrerequisite)

Question (题目)
  ├─ 1:N  → UserAttempt (答题记录)
  └─ 1:N  → ErrorBook (错题本)

Post (帖子)
  ├─ 1:N  → Comment (评论)
  └─ M:N  → User (点赞, 通过PostLike)
```

### 5.2 数据流向图

```
用户学习流程:
User → Lesson → UserProgress (记录进度)
                     ↓
                完成课程 → User.xp +10

用户答题流程:
User → Question → UserAttempt (记录答题)
                        ↓
                  答错 → ErrorBook (加入错题本)
                        ↓
                  多次答错 → ErrorBook.masteryLevel = 0

用户考试流程:
User → ExamRecord → UserAttempt[] (批量答题)
            ↓
       计算成绩 → ExamRecord.score
            ↓
       发放XP → User.xp +50
            ↓
       检查成就 → UserBadge (解锁徽章)
```

---

## 6. 索引策略

### 6.1 已有索引总结

| 表名 | 索引字段 | 类型 | 用途 |
|------|---------|------|------|
| users | email | UNIQUE | 登录查询 |
| users | username | UNIQUE | 用户名查询 |
| user_settings | userId | UNIQUE | 1对1关联 |
| chapters | subjectId | INDEX | 按科目查询章节 |
| chapters | parentId | INDEX | 查询子章节 |
| lessons | chapterId | INDEX | 按章节查询课程 |
| questions | chapterId | INDEX | 按章节查询题目 |
| questions | difficulty | INDEX | 按难度筛选题目 |
| user_attempts | userId | INDEX | 查询用户答题历史 |
| user_attempts | questionId | INDEX | 查询题目被答次数 |
| user_attempts | createdAt | INDEX | 时间范围查询 |
| error_book | userId | INDEX | 查询用户错题本 |
| posts | authorId | INDEX | 查询用户发帖 |
| posts | createdAt | INDEX | 按时间排序 |
| leaderboard_entries | [period, weekStart, score] | COMPOSITE | 排行榜查询 |
| daily_tasks | [userId, date] | COMPOSITE | 查询每日任务 |

### 6.2 建议新增索引

```prisma
// questions表 - 历年真题查询
@@index([sourceYear, sourceRegion])

// error_book表 - 按掌握度排序
@@index([masteryLevel])

// user_attempts表 - 按正确率分析
@@index([userId, isCorrect])
```

---

## 7. 总结与建议

### 7.1 Schema设计优点 ✅

1. **关系设计清晰**: 用户、课程、题库三大核心实体分离良好
2. **索引策略合理**: 高频查询字段都有索引
3. **游戏化完善**: xp、streak、徽章、排行榜系统完整
4. **树形结构支持**: chapters自关联 + 前置依赖关系
5. **审计字段完整**: createdAt、updatedAt普遍存在

### 7.2 发现的问题 ⚠️

#### 必需修改 (影响核心功能)

1. **questions表**:
   - 缺少`source`, `sourceYear`, `sourceRegion` (无法筛选历年真题)

2. **exam_records表**:
   - 缺少`status` (无法"继续未完成的考试")
   - 缺少`timeLimit`, `startedAt`, `submittedAt` (无法倒计时)

3. **users表**:
   - 缺少`level`字段 (需要从xp实时计算等级)

4. **lessons表**:
   - 缺少`downloadUrl` (无法下载讲义)

5. **posts表**:
   - 缺少`status` (无法内容审核)

#### 可选优化 (提升用户体验)

1. **error_book表**:
   - 缺少`lastReviewedAt`, `reviewCount` (无法优化复习排序)

2. **subscribers表**:
   - 缺少`unsubscribed`字段 (无法取消订阅)

3. **comments表**:
   - 不支持嵌套评论 (需要`parentCommentId`)

### 7.3 缺失的PRD v2.0功能表

详见 [CURRENT_SCHEMA_ANALYSIS.md](./CURRENT_SCHEMA_ANALYSIS.md) 的"PRD v2.0 创新功能 - 缺失表格分析"

---

**文档状态**: ✅ 完成
**下一步**: 请确认是否需要修改Schema,我将帮你生成Migration文件
