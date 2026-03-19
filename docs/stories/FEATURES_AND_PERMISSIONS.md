# LearnMore v1.0 功能清单与权限矩阵

**文档版本**: v1.0
**最后更新**: 2026-01-19
**维护者**: Claude Code

---

## 📋 文档目的

本文档记录了 LearnMore 平台的所有功能模块和对应的角色权限矩阵，用于指导：
1. 后端权限控制逻辑实现
2. 前端菜单和页面访问控制
3. API 路由和 Server Actions 的权限验证
4. 产品功能规划和迭代

---

## 👥 用户角色定义

LearnMore 平台定义了 6 种用户角色（`UserRole` enum）：

| 角色代码 | 角色名称 | 目标用户 | 核心权限 |
|---------|---------|---------|---------|
| **STUDENT** | 学生 | 7-9年级中学生 | 学习课程、做题、参与社区、查看个人数据 |
| **PARENT** | 家长 | 学生家长 | 监控子女学习进度、查看报告、管理多个学生账号 |
| **PRO** | 专业版用户 | 付费学生用户 | STUDENT权限 + AI辅导 + 高级功能 + 无广告 |
| **ULTIMATE** | 旗舰版用户 | 高级付费用户 | PRO权限 + 无限AI Token + 优先支持 + 全部科目 |
| **TEACHER** | 教师 | 内容创作者/老师 | 创建课程、题库管理、查看统计、管理班级 |
| **ADMIN** | 管理员 | 平台运营团队 | 所有权限 + 用户管理 + 内容审核 + 数据分析 |

---

## 🗂️ 功能模块分类

本文档将功能分为以下 9 大模块：

1. [用户认证与账户管理](#1-用户认证与账户管理-4个功能)
2. [课程学习系统](#2-课程学习系统-6个功能)
3. [题库与练习](#3-题库与练习-7个功能)
4. [社区与互动](#4-社区与互动-5个功能)
5. [游戏化与成长](#5-游戏化与成长-6个功能)
6. [AI 智能辅导](#6-ai-智能辅导-3个功能)
7. [家长监控](#7-家长监控-3个功能)
8. [营销与公共页面](#8-营销与公共页面-10个功能)
9. [管理员功能](#9-管理员功能-8个功能)

**总计功能数**: 52个

---

## 权限图例说明

| 符号 | 含义 | 说明 |
|------|------|------|
| ✅ | 完全访问 | 可以访问和使用该功能 |
| 🔒 | 付费功能 | 需要 PRO/ULTIMATE 订阅 |
| 👁️ | 只读访问 | 只能查看，不能修改 |
| ⚠️ | 受限访问 | 有特定限制（如每日次数） |
| ❌ | 禁止访问 | 不能访问该功能 |

---

## 1. 用户认证与账户管理 (4个功能)

### 1.1 用户注册

**功能描述**: 用户通过邮箱注册新账号
**路由**: `/register`
**实现文件**: `src/app/(auth)/register/page.tsx`, `src/actions/auth.ts`
**数据库表**: `auth.users`, `public.users`

| 角色 | 权限 | 说明 |
|------|------|------|
| 未登录用户 | ✅ | 任何人都可以注册 |
| 已登录用户 | ❌ | 已登录用户自动重定向到 `/dashboard` |

**关键字段**:
- `email` (必填)
- `username` (可选，首次注册后可补充)
- `role` (默认 `STUDENT`)
- `utmSource`, `utmMedium`, `utmCampaign` (推广追踪)
- `referralCode` (邀请码)

---

### 1.2 用户登录

**功能描述**: 用户通过邮箱密码登录
**路由**: `/login`
**实现文件**: `src/app/(auth)/login/page.tsx`, `src/actions/auth.ts`

| 角色 | 权限 | 说明 |
|------|------|------|
| 未登录用户 | ✅ | 任何人都可以登录 |
| 已登录用户 | ❌ | 已登录用户自动重定向到 `/dashboard` |

**功能特性**:
- 支持 `?redirectTo=` 参数，登录后跳回原页面
- Session 有效期: 1小时 (滑动窗口)
- 自动更新 `lastSignInAt` 和 `signInCount` 字段

---

### 1.3 个人设置

**功能描述**: 用户管理个人资料、头像、密码、通知偏好
**路由**: `/dashboard/settings`
**实现文件**: `src/app/(dashboard)/dashboard/settings/page.tsx`, `src/actions/settings.ts`
**数据库表**: `users`, `user_settings`

| 角色 | 权限 | 说明 |
|------|------|------|
| STUDENT | ✅ | 可编辑个人资料、头像、密码、通知设置 |
| PARENT | ✅ | 同上 |
| PRO | ✅ | 同上 + AI性格选择 |
| ULTIMATE | ✅ | 同上 + 课程体系选择（UEC/IGCSE） |
| TEACHER | ✅ | 同上 |
| ADMIN | ✅ | 同上 |

**可编辑字段**:
- 基本信息: `username`, `avatar`, `grade`, `phone`
- 密码修改 (需验证旧密码)
- 通知设置 (UserSettings 表):
  - `theme` (dark/light)
  - `language` (en/zh/ms)
  - `aiPersonality` (ENCOURAGING/SOCRATIC/STRICT) 🔒 PRO+
  - `difficultyCalibration` (难度校准 0-100) 🔒 PRO+
  - `curriculumSystem` (UEC/IGCSE) 🔒 ULTIMATE
  - `studyReminderTime` (学习提醒时间)
  - `notificationDaily`, `notificationWeekly` (推送通知)
  - `emailMarketing`, `emailActivity` (邮件通知)

---

### 1.4 邀请码系统

**功能描述**: 学生生成邀请码，家长通过邀请码关联学生账号
**实现文件**: `src/actions/parent.ts`
**数据库表**: `invite_codes`, `parent_students`

| 角色 | 权限 | 说明 |
|------|------|------|
| STUDENT | ✅ | 可生成邀请码 (7天有效期) |
| PARENT | ✅ | 可使用邀请码关联学生 |
| PRO/ULTIMATE | ✅ | 同上 |
| TEACHER | ❌ | 不适用 |
| ADMIN | 👁️ | 只读查看所有邀请码 |

**邀请码规则**:
- 格式: 8位随机字符串 (大写字母+数字)
- 有效期: 7天
- 一次性使用 (`used` 字段标记)
- 一个学生可以被多个家长关联
- 一个家长可以关联多个学生

---

## 2. 课程学习系统 (6个功能)

### 2.1 课程目录浏览

**功能描述**: 查看6大学科的章节树状结构
**路由**: `/course/[subjectId]`
**实现文件**: `src/app/course/[subjectId]/page.tsx`, `src/actions/subject.ts`
**数据库表**: `subjects`, `chapters`, `lessons`

| 角色 | 权限 | 说明 |
|------|------|------|
| 未登录用户 | 👁️ | 只能查看课程目录，不能观看视频 |
| STUDENT | ✅ | 可查看基础科目 (数学、物理、化学) |
| PARENT | 👁️ | 可查看子女选中的科目 |
| PRO | ✅ | 可访问所有 6 大学科 |
| ULTIMATE | ✅ | 同上 + 优先加载 |
| TEACHER | ✅ | 可查看所有课程 |
| ADMIN | ✅ | 同上 |

**科目列表** (`subjects` 表):
1. 数学 (math)
2. 物理 (physics)
3. 化学 (chemistry)
4. 英语 (english)
5. 语文/中文 (chinese)
6. 生物 (biology)

**章节树结构** (`chapters` 表):
- 自关联字段 `parentId` 实现树形结构
- 支持无限层级嵌套

---

### 2.2 课程学习页

**功能描述**: 观看视频/阅读文档/完成练习
**路由**: `/course/[subjectId]/[lessonId]`
**实现文件**: `src/app/course/[subjectId]/[lessonId]/page.tsx`, `src/actions/progress.ts`
**数据库表**: `lessons`, `user_progress`

| 角色 | 权限 | 说明 |
|------|------|------|
| 未登录用户 | ❌ | 必须登录 |
| STUDENT | ✅ | 可学习基础科目课程 |
| PARENT | ❌ | 家长不能直接学习（需查看子女进度） |
| PRO | ✅ | 无广告 + 高清视频 |
| ULTIMATE | ✅ | 同上 + 下载功能 🔒 |
| TEACHER | ✅ | 可预览所有课程 |
| ADMIN | ✅ | 同上 |

**课程类型** (`LessonType` enum):
- `VIDEO`: 视频课程
- `DOCUMENT`: 文档阅读（Markdown）
- `EXERCISE`: 练习题
- `QUIZ`: 测验

**进度追踪** (`user_progress` 表):
- `progress`: 进度百分比 (0-100)
- `isCompleted`: 是否完成 (≥90%自动标记)
- `lastPosition`: 视频最后播放位置 (秒)
- 每 30 秒自动保存进度 (防抖)

---

### 2.3 学习进度统计

**功能描述**: 查看个人学习时长、完成率、知识点掌握度
**路由**: `/dashboard` (仪表盘首页)
**实现文件**: `src/app/(dashboard)/dashboard/page.tsx`, `src/actions/dashboard.ts`
**数据库表**: `user_progress`, `users` (totalStudyTime)

| 角色 | 权限 | 说明 |
|------|------|------|
| STUDENT | ✅ | 只能查看自己的数据 |
| PARENT | ✅ | 可查看关联学生的数据 |
| PRO/ULTIMATE | ✅ | 同上 + 高级数据分析 🔒 |
| TEACHER | 👁️ | 可查看班级平均数据 |
| ADMIN | ✅ | 可查看所有用户数据 |

**统计维度**:
- 总学习时长 (`totalStudyTime`)
- 完成课程数 (统计 `isCompleted=true` 的记录)
- 本周学习时长
- 连续学习天数 (`streak`)
- 各科目完成率

---


**功能描述**: 可视化章节前置依赖关系
**数据库表**: `chapters`, `chapter_prerequisites`

| 角色 | 权限 | 说明 |
|------|------|------|
| STUDENT | ⚠️ | 基础版（仅显示当前学科） |
| ULTIMATE | ✅ | 同上 + 个性化推荐路径 🔒 |
| ADMIN | ✅ | 同上 |

**实现细节**:
- 使用 React Flow 或 D3.js 可视化
- 节点颜色表示掌握度 (根据 `user_progress` 计算)
- 箭头表示前置依赖关系 (`chapter_prerequisites` 表)
- `x`, `y` 字段保存节点位置

---

### 2.5 课程搜索

**功能描述**: 搜索课程内容、章节标题
**路由**: `/dashboard/courses` (带搜索栏)
**实现文件**: `src/app/(dashboard)/dashboard/courses/page.tsx`, `src/actions/subject.ts`
**数据库表**: `subjects`, `chapters`, `lessons`

| 角色 | 权限 | 说明 |
|------|------|------|
| STUDENT | ✅ | 可搜索已解锁的科目 |
| PARENT | 👁️ | 可搜索子女的课程 |
| PRO/ULTIMATE | ✅ | 可搜索所有科目 |
| TEACHER | ✅ | 同上 |
| ADMIN | ✅ | 同上 |

**搜索范围**:
- 科目名称 (`subjects.name`)
- 章节标题 (`chapters.title`)
- 课程标题 (`lessons.title`)
- 课程内容 (`lessons.content`) 🔒 PRO+

---

### 2.6 课程收藏

**功能描述**: 收藏重点课程，快速访问
**实现文件**: `src/actions/progress.ts`
**数据库表**: `user_progress` (通过 `isCompleted` 和排序实现)

| 角色 | 权限 | 说明 |
|------|------|------|
| STUDENT | ✅ | 可收藏课程 |
| PARENT | ❌ | 不适用 |
| PRO/ULTIMATE | ✅ | 同上 + 跨设备同步 🔒 |
| TEACHER | ✅ | 可收藏课程 |
| ADMIN | ✅ | 同上 |

**实现方式**:
- 在 `user_progress` 表中添加 `isFavorite` 字段 (需扩展 schema)
- 或使用单独的 `user_favorites` 表 (推荐)

---

## 3. 题库与练习 (7个功能)

### 3.1 题目练习

**功能描述**: 刷题练习，支持单选、多选、填空、问答
**路由**: `/dashboard/practice`
**实现文件**: `src/app/(dashboard)/dashboard/practice/page.tsx`, `src/actions/practice/*.ts`
**数据库表**: `questions`, `user_attempts`

| 角色 | 权限 | 说明 |
|------|------|------|
| STUDENT | ✅ | 每日 20 道题限制 ⚠️ |
| PARENT | ❌ | 不适用 |
| PRO | ✅ | 每日 100 道题限制 ⚠️ |
| ULTIMATE | ✅ | 无限制 ✅ |
| TEACHER | ✅ | 无限制 ✅ |
| ADMIN | ✅ | 无限制 ✅ |

**题型支持** (`QuestionType` enum):
- `SINGLE_CHOICE`: 单选题 (选项存储在 `options` JSON 字段)
- `MULTIPLE_CHOICE`: 多选题
- `FILL_BLANK`: 填空题
- `ESSAY`: 问答题 (需人工批改)
- `MCQ`: 兼容旧版 (等价于 SINGLE_CHOICE)

**难度等级**:
- 1星 (基础)
- 2星 (简单)
- 3星 (中等) ← 默认
- 4星 (困难)
- 5星 (竞赛级)

**评分逻辑**:
- 单选/填空: 全对给分
- 多选: 部分分 (选对 n/m 给 n/m 分)
- 问答: 需 TEACHER 或 ADMIN 人工批改

---

### 3.2 错题本

**功能描述**: 记录错题，智能复习推荐
**路由**: `/dashboard/practice` (错题本 Tab)
**实现文件**: `src/actions/error-book.ts`
**数据库表**: `error_book`, `questions`, `user_attempts`

| 角色 | 权限 | 说明 |
|------|------|------|
| STUDENT | ✅ | 可查看和复习错题 |
| PARENT | 👁️ | 可查看子女的错题本 |
| PRO/ULTIMATE | ✅ | 同上 + AI 错题解析 🔒 |
| TEACHER | ✅ | 可查看学生错题 |
| ADMIN | ✅ | 同上 |

**掌握度追踪** (`masteryLevel` 字段):
- 0: 初次错误
- 1: 第二次答对
- 2: 第三次答对
- 3: 完全掌握 (从错题本移除)

**复习算法**:
- 基于间隔重复 (Spaced Repetition)
- 优先复习 `masteryLevel=0` 的题目
- 每次答对后延长复习间隔 (1天 → 3天 → 7天)

---

### 3.3 模拟考试

**功能描述**: 定时测验，模拟真实考试环境
**路由**: `/dashboard/practice` (考试模式)
**实现文件**: `src/actions/quiz.ts`
**数据库表**: `exam_records`, `user_attempts`

| 角色 | 权限 | 说明 |
|------|------|------|
| STUDENT | ⚠️ | 每周 2 次免费考试 |
| PARENT | 👁️ | 可查看子女的考试成绩 |
| PRO | ✅ | 每周 10 次考试 🔒 |
| ULTIMATE | ✅ | 无限次考试 🔒 |
| TEACHER | ✅ | 可创建自定义试卷 |
| ADMIN | ✅ | 同上 |

**考试记录** (`exam_records` 表):
- `score`: 总分
- `totalQuestions`: 题目数量
- `correctCount`: 答对数量
- `duration`: 考试用时 (秒)
- `createdAt`: 考试时间

**试卷生成规则**:
- 按章节自动组卷
- 按难度分布: 30% 简单 + 50% 中等 + 20% 困难
- 避免重复出题 (30天内不重复)

---

### 3.4 题目导入 (教师功能)

**功能描述**: 教师批量导入题目 (支持 Markdown/JSON)
**路由**: `/dashboard/practice/import`
**实现文件**: `src/app/(dashboard)/dashboard/practice/import/page.tsx`, `src/actions/practice/*.ts`
**数据库表**: `questions`

| 角色 | 权限 | 说明 |
|------|------|------|
| STUDENT | ❌ | 不可访问 |
| PARENT | ❌ | 不可访问 |
| PRO/ULTIMATE | ❌ | 不可访问 |
| TEACHER | ✅ | 可导入题目 |
| ADMIN | ✅ | 同上 |

**支持格式**:
- Markdown 格式 (类似 Anki)
- JSON 格式 (结构化数据)
- CSV 格式 (简单题目)

**导入规则**:
- 自动解析 LaTeX 公式 (使用 KaTeX)
- 自动关联到章节 (`chapterId`)
- 验证题目格式 (使用 Zod schema)

---

### 3.5 题目审核 (管理员功能)

**功能描述**: 审核教师上传的题目，防止错误/敏感内容
**实现文件**: `src/actions/practice/*.ts` (需扩展)
**数据库表**: `questions` (需添加 `status` 字段)

| 角色 | 权限 | 说明 |
|------|------|------|
| TEACHER | ❌ | 只能查看自己的题目审核状态 |
| ADMIN | ✅ | 可审核所有题目 |

**审核流程**:
1. TEACHER 上传题目 → `status = PENDING`
2. ADMIN 审核通过 → `status = APPROVED`
3. ADMIN 驳回 → `status = REJECTED` (附原因)

**Schema 扩展建议**:
```prisma
model Question {
  // ... 现有字段
  status        QuestionStatus @default(PENDING)
  reviewedBy    String?        @map("reviewed_by") @db.Uuid
  reviewedAt    DateTime?      @map("reviewed_at")
  rejectReason  String?        @map("reject_reason")
}

enum QuestionStatus {
  PENDING
  APPROVED
  REJECTED
}
```

---

### 3.6 答题统计

**功能描述**: 查看个人答题正确率、速度、知识点弱项
**路由**: `/dashboard` (统计卡片)
**实现文件**: `src/actions/dashboard.ts`, `src/actions/quiz.ts`
**数据库表**: `user_attempts`, `exam_records`

| 角色 | 权限 | 说明 |
|------|------|------|
| STUDENT | ✅ | 只能查看自己的数据 |
| PARENT | ✅ | 可查看子女的答题统计 |
| PRO/ULTIMATE | ✅ | 同上 + 详细分析报告 🔒 |
| TEACHER | 👁️ | 可查看班级统计 |
| ADMIN | ✅ | 可查看所有用户统计 |

**统计维度**:
- 总答题数 (统计 `user_attempts`)
- 正确率 (`isCorrect=true` 占比)
- 平均用时 (`duration` 平均值)
- 各科目正确率分布
- 各难度正确率分布
- 知识点弱项 (正确率 <60% 的章节)

---

### 3.7 AI 智能出题 🔒

**功能描述**: 根据学生薄弱知识点，AI 生成个性化题目
**实现文件**: `src/actions/ai-tutor.ts`, `src/lib/gemini.ts`
**数据库表**: `questions`, `user_attempts`, `error_book`

| 角色 | 权限 | 说明 |
|------|------|------|
| STUDENT | ❌ | 不可使用 |
| PARENT | ❌ | 不可使用 |
| PRO | ⚠️ | 每日 5 次 AI 出题 🔒 |
| ULTIMATE | ✅ | 每日 20 次 AI 出题 🔒 |
| TEACHER | ✅ | 无限次 (用于创建题库) |
| ADMIN | ✅ | 无限次 |

**AI 出题逻辑**:
1. 分析 `error_book` 找到薄弱章节
2. 调用 Gemini API 生成题目
3. 自动格式化为 `Question` 格式
4. 保存到 `questions` 表 (标记为 AI 生成)

**消耗 Token**:
- 每次出题消耗 1 个 `aiTokenBalance`
- 免费用户每日 5 个 Token 重置
- PRO/ULTIMATE 用户拥有额外 Token 包

---

## 4. 社区与互动 (5个功能)

### 4.1 社区首页

**功能描述**: 查看所有讨论帖子，支持按科目/分类/标签筛选
**路由**: `/dashboard/community`
**实现文件**: `src/app/(dashboard)/dashboard/community/page.tsx`, `src/actions/community.ts`
**数据库表**: `posts`, `users`, `subjects`

| 角色 | 权限 | 说明 |
|------|------|------|
| STUDENT | ✅ | 可查看和发帖 |
| PARENT | 👁️ | 只读访问 |
| PRO/ULTIMATE | ✅ | 同上 + 置顶帖子 🔒 |
| TEACHER | ✅ | 可发帖 + 设置帖子为"已解决" |
| ADMIN | ✅ | 可删除/置顶/推荐帖子 |

**帖子分类** (`category` 字段):
- `QUESTION`: 提问求助
- `NOTE`: 学习笔记
- `ACHIEVEMENT`: 成就分享
- `DISCUSSION`: 讨论交流

**排序方式**:
- 最新 (`createdAt` DESC)
- 最热 (`likeCount` DESC)
- 精华 (ADMIN 标记)

---

### 4.2 发布新帖

**功能描述**: 发布讨论帖，支持富文本、LaTeX公式、图片
**路由**: `/dashboard/community/new`
**实现文件**: `src/app/(dashboard)/dashboard/community/new/page.tsx`, `src/actions/community.ts`
**数据库表**: `posts`

| 角色 | 权限 | 说明 |
|------|------|------|
| STUDENT | ✅ | 可发帖 (每日 10 条限制) ⚠️ |
| PARENT | ❌ | 不可发帖 |
| PRO | ✅ | 可发帖 (每日 30 条) ⚠️ |
| ULTIMATE | ✅ | 无限制 ✅ |
| TEACHER | ✅ | 无限制 ✅ |
| ADMIN | ✅ | 无限制 ✅ |

**编辑器功能**:
- 富文本编辑 (使用 Tiptap)
- Markdown 支持
- LaTeX 公式 (使用 KaTeX)
- 图片上传 (Supabase Storage)
- 代码块高亮

**敏感内容检测**:
- 使用 AI 自动审核 (Gemini API)
- 包含敏感词 → 自动隐藏，等待 ADMIN 审核
- 发送通知给 ADMIN

---

### 4.3 帖子详情与评论

**功能描述**: 查看帖子详情，发表评论，点赞
**路由**: `/dashboard/community/[postId]`
**实现文件**: `src/app/(dashboard)/dashboard/community/[postId]/page.tsx`, `src/actions/community.ts`
**数据库表**: `posts`, `comments`, `post_likes`

| 角色 | 权限 | 说明 |
|------|------|------|
| STUDENT | ✅ | 可评论和点赞 |
| PARENT | 👁️ | 只读，不能评论 |
| PRO/ULTIMATE | ✅ | 同上 + 匿名评论 🔒 |
| TEACHER | ✅ | 可评论 + 标记为"最佳答案" |
| ADMIN | ✅ | 可删除评论 + 封禁用户 |

**评论功能**:
- 无限层级评论 (需扩展 `comments` 表添加 `parentId`)
- 支持 Markdown 和 LaTeX
- 支持 @提及用户
- 评论点赞 (需扩展表)

**点赞逻辑** (`post_likes` 表):
- 一人一帖只能点赞一次
- 点赞后 `likeCount` +1
- 取消点赞后 `likeCount` -1

---

### 4.4 通知系统

**功能描述**: 接收点赞、评论、系统通知
**实现文件**: 需新增 `src/actions/notifications.ts` 和 `notifications` 表
**数据库表**: 需新增 `notifications` 表

| 角色 | 权限 | 说明 |
|------|------|------|
| STUDENT | ✅ | 接收通知 |
| PARENT | ✅ | 接收子女学习报告通知 |
| PRO/ULTIMATE | ✅ | 同上 + 推送通知 🔒 |
| TEACHER | ✅ | 接收学生提问通知 |
| ADMIN | ✅ | 接收所有系统通知 |

**通知类型**:
- `LIKE`: 帖子被点赞
- `COMMENT`: 帖子被评论
- `MENTION`: 被 @提及
- `SYSTEM`: 系统通知 (维护、更新)
- `ACHIEVEMENT`: 成就解锁
- `STUDY_REMINDER`: 学习提醒

**Schema 建议**:
```prisma
model Notification {
  id        String           @id @default(uuid()) @db.Uuid
  userId    String           @map("user_id") @db.Uuid
  type      NotificationType
  title     String
  content   String
  link      String? // 跳转链接
  isRead    Boolean          @default(false) @map("is_read")
  createdAt DateTime         @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, isRead])
  @@map("notifications")
}

enum NotificationType {
  LIKE
  COMMENT
  MENTION
  SYSTEM
  ACHIEVEMENT
  STUDY_REMINDER
}
```

---

### 4.5 用户主页

**功能描述**: 查看用户的公开信息、发帖记录、成就徽章
**路由**: `/dashboard/profile/[userId]` (需新增)
**实现文件**: 需新增
**数据库表**: `users`, `posts`, `user_badges`

| 角色 | 权限 | 说明 |
|------|------|------|
| STUDENT | ✅ | 可查看所有用户公开主页 |
| PARENT | 👁️ | 只能查看子女主页 |
| PRO/ULTIMATE | ✅ | 同上 + 自定义主页背景 🔒 |
| TEACHER | ✅ | 可查看所有学生主页 |
| ADMIN | ✅ | 可查看所有用户主页（包括隐私数据） |

**公开信息**:
- 用户名、头像、等级、徽章
- 发帖数、点赞数、评论数
- 连续学习天数 (`streak`)
- 总学习时长 (`totalStudyTime`)
- 擅长科目 (根据完成率计算)

**隐私设置**:
- 允许用户隐藏部分信息 (需在 `user_settings` 表添加字段)

---

## 5. 游戏化与成长 (6个功能)

### 5.1 经验值 (XP) 系统

**功能描述**: 学习行为获得 XP，升级解锁奖励
**实现文件**: `src/actions/gamification.ts`, `src/lib/gamification-utils.ts`
**数据库表**: `users` (xp, level)

| 角色 | 权限 | 说明 |
|------|------|------|
| STUDENT | ✅ | 完成学习获得 XP |
| PARENT | 👁️ | 只能查看子女 XP |
| PRO/ULTIMATE | ✅ | 同上 + XP 加成 (1.2x) 🔒 |
| TEACHER | ❌ | 不适用 |
| ADMIN | ✅ | 可调整任何用户 XP |

**XP 获取途径**:
- 完成课程: +10 XP (`lessons.xpReward`)
- 答对题目: +5 XP (简单) ~ +20 XP (困难)
- 连续学习: +10 XP/天
- 发帖: +5 XP
- 帖子被点赞: +2 XP
- 每日任务完成: +20 XP

**等级计算公式** (`level` 字段):
```
XP 需求 = 100 * level^1.5
例如:
Level 1 → 2: 100 XP
Level 2 → 3: 282 XP
Level 3 → 4: 520 XP
...
Level 10: 约 3162 XP
```

**等级特权**:
- Level 5: 解锁自定义头像框
- Level 10: 解锁社区置顶帖子
- Level 20: 解锁 AI 智能出题 (免费用户)
- Level 50: 永久 PRO 会员

---

### 5.2 徽章系统

**功能描述**: 完成特定成就解锁徽章，展示在主页
**实现文件**: `src/actions/gamification.ts`
**数据库表**: `badges`, `user_badges`

| 角色 | 权限 | 说明 |
|------|------|------|
| STUDENT | ✅ | 可获得徽章 |
| PARENT | 👁️ | 只能查看子女徽章 |
| PRO/ULTIMATE | ✅ | 同上 + 独家徽章 🔒 |
| TEACHER | ✅ | 可获得教学专属徽章 |
| ADMIN | ✅ | 可颁发任何徽章 |

**徽章示例** (`badges` 表):
- `early_bird`: 早起学习 (连续 7 天早上 6-8 点学习)
- `math_master`: 数学大师 (数学科目完成率 100%)
- `speed_runner`: 速通者 (1 天内完成 10 节课)
- `helping_hand`: 热心助人 (帮助他人解答 50 个问题)
- `perfect_score`: 满分王 (10 次考试满分)
- `streak_7`: 连续学习 7 天
- `streak_30`: 连续学习 30 天
- `streak_100`: 连续学习 100 天

**徽章解锁逻辑**:
- 后台定时任务检查条件 (Vercel Cron Job)
- 实时检查 (用户完成操作时触发)
- 解锁后发送通知

---

### 5.3 每日任务

**功能描述**: 每日自动生成任务，完成获得额外奖励
**路由**: `/dashboard` (任务卡片)
**实现文件**: `src/actions/gamification.ts`
**数据库表**: `daily_tasks`

| 角色 | 权限 | 说明 |
|------|------|------|
| STUDENT | ✅ | 每日 3 个任务 |
| PARENT | ❌ | 不适用 |
| PRO | ✅ | 每日 5 个任务 🔒 |
| ULTIMATE | ✅ | 每日 7 个任务 🔒 |
| TEACHER | ❌ | 不适用 |
| ADMIN | ❌ | 不适用 |

**任务类型** (`DailyTaskType` enum):
- `LOGIN`: 登录系统 (+10 XP)
- `COMPLETE_LESSON`: 完成 3 节课 (+20 XP)
- `FIX_ERROR`: 复习 5 道错题 (+15 XP)
- `QUIZ_SCORE`: 考试达到 80 分以上 (+30 XP)
- `ONBOARDING_PROFILE`: 完善个人资料 (+5 XP) (首次)
- `ONBOARDING_GOALS`: 设置学习目标 (+5 XP) (首次)
- `ONBOARDING_ASSESSMENT`: 完成能力测评 (+10 XP) (首次)

**任务刷新机制**:
- 每日凌晨 0 点 (UTC+8) 自动刷新
- 未完成任务不保留
- 任务难度根据用户能力动态调整

---

### 5.4 排行榜

**功能描述**: 查看周榜/月榜/总榜，激励竞争
**路由**: `/dashboard/leaderboard`
**实现文件**: `src/app/(dashboard)/dashboard/leaderboard/page.tsx`, `src/actions/leaderboard.ts`
**数据库表**: `leaderboard_entries`

| 角色 | 权限 | 说明 |
|------|------|------|
| STUDENT | ✅ | 可查看排行榜 |
| PARENT | 👁️ | 可查看子女排名 |
| PRO/ULTIMATE | ✅ | 同上 + 查看历史排名 🔒 |
| TEACHER | 👁️ | 可查看班级排行榜 |
| ADMIN | ✅ | 可查看所有排行榜 + 重置排名 |

**排行榜类型** (`LeaderboardPeriod` enum):
- `WEEKLY`: 周榜 (每周一 0 点重置)
- `MONTHLY`: 月榜 (每月 1 号 0 点重置)
- `ALL_TIME`: 总榜 (永不重置)

**排名计算** (`score` 字段):
```
score = XP + (完成课程数 * 10) + (答对题数 * 2)
```

**排行榜缓存**:
- 排名每 1 小时更新一次 (`rank` 字段)
- 使用 Vercel Cron Job: `/api/cron/cleanup-leaderboard`
- 历史数据保留 90 天

---

### 5.5 连续学习天数 (Streak)

**功能描述**: 记录连续学习天数，中断则归零
**实现文件**: 需新增定时脚本
**数据库表**: `users` (streak, lastStudyDate)

| 角色 | 权限 | 说明 |
|------|------|------|
| STUDENT | ✅ | 自动追踪 |
| PARENT | 👁️ | 可查看子女 streak |
| PRO/ULTIMATE | ✅ | 同上 + "中断保护" (1 次免中断) 🔒 |
| TEACHER | ❌ | 不适用 |
| ADMIN | ✅ | 可调整任何用户 streak |

**Streak 计算逻辑** (需手动实现):
```typescript
// 每日凌晨 1 点运行
// 伪代码
if (lastStudyDate == 今天) {
  // 已学习，不处理
} else if (lastStudyDate == 昨天) {
  // 连续学习，保持 streak
} else {
  // 中断，重置 streak
  streak = 0
}
```

**学习定义**:
- 完成至少 1 节课 (`isCompleted=true`)
- 或答对至少 5 道题 (`isCorrect=true`)
- 或学习时长 ≥ 15 分钟

---

### 5.6 成就页面

**功能描述**: 查看所有徽章、XP、排名、历史记录
**路由**: `/dashboard/achievements`
**实现文件**: `src/app/(dashboard)/dashboard/achievements/page.tsx`, `src/actions/gamification.ts`
**数据库表**: `user_badges`, `users`, `leaderboard_entries`

| 角色 | 权限 | 说明 |
|------|------|------|
| STUDENT | ✅ | 可查看个人成就 |
| PARENT | 👁️ | 可查看子女成就 |
| PRO/ULTIMATE | ✅ | 同上 + 成就分享功能 🔒 |
| TEACHER | ✅ | 可查看个人成就 |
| ADMIN | ✅ | 可查看所有用户成就 |

**页面内容**:
- 徽章墙 (已解锁 + 未解锁)
- XP 历史曲线图
- 排行榜历史
- 学习里程碑 (总学习时长、完成课程数、答题数)

---

## 6. AI 智能辅导 (3个功能)

### 6.1 AI 问答助手

**功能描述**: 学生提问，AI 实时解答（类似 ChatGPT）
**路由**: `/dashboard` (侧边栏 AI 助手)
**实现文件**: `src/actions/ai-tutor.ts`, `src/lib/gemini.ts`, `src/app/api/ai-tutor/route.ts`
**数据库表**: `users` (aiTokenBalance)

| 角色 | 权限 | 说明 |
|------|------|------|
| STUDENT | ⚠️ | 每日 5 次免费提问 |
| PARENT | ❌ | 不可使用 |
| PRO | ✅ | 每日 50 次提问 🔒 |
| ULTIMATE | ✅ | 无限次提问 🔒 |
| TEACHER | ✅ | 无限次提问 |
| ADMIN | ✅ | 无限次提问 |

**AI 能力**:
- 回答学科问题 (数理化英语生)
- 解释错题 (结合 `error_book`)
- 推荐学习路径
- 生成练习题
- 作文批改 (ESSAY 类型题目)

**Token 消耗**:
- 每次提问消耗 1 个 `aiTokenBalance`
- 免费用户每日重置为 5 个 Token
- PRO 用户 50 个/天
- ULTIMATE 用户无限
- 额外 Token 可通过任务获得 (+5 Token)

**安全限制**:
- 内容过滤 (防止不当问题)
- 速率限制 (防止滥用)
- 上下文窗口: 最近 10 条对话

---

### 6.2 AI 学习路径推荐

**功能描述**: 根据学习进度和能力，AI 推荐下一步学习内容
**路由**: `/dashboard` (推荐卡片)
**实现文件**: `src/actions/ai-tutor.ts`
**数据库表**: `user_progress`, `chapters`, `error_book`

| 角色 | 权限 | 说明 |
|------|------|------|
| STUDENT | ✅ | 基础推荐 (基于完成率) |
| PARENT | 👁️ | 可查看子女推荐内容 |
| PRO | ✅ | AI 个性化推荐 🔒 |
| ULTIMATE | ✅ | AI 深度分析 + 长期规划 🔒 |
| TEACHER | ❌ | 不适用 |
| ADMIN | ✅ | 可查看所有推荐 |

**推荐逻辑**:
1. 分析 `user_progress` 找到完成度低的章节
2. 分析 `error_book` 找到薄弱知识点
3. 查询 `chapter_prerequisites` 找到前置依赖
4. 调用 AI 生成推荐文案
5. 返回推荐课程列表

---

### 6.3 AI 作文批改

**功能描述**: 提交作文题答案，AI 自动评分和批注
**实现文件**: `src/actions/quiz.ts` (扩展)
**数据库表**: `user_attempts` (扩展 `aiScore` 和 `aiFeedback` 字段)

| 角色 | 权限 | 说明 |
|------|------|------|
| STUDENT | ⚠️ | 每日 3 次免费批改 |
| PARENT | ❌ | 不可使用 |
| PRO | ✅ | 每日 20 次批改 🔒 |
| ULTIMATE | ✅ | 无限次批改 🔒 |
| TEACHER | ✅ | 无限次批改 (用于验证 AI 质量) |
| ADMIN | ✅ | 无限次批改 |

**批改维度**:
- 内容 (30%): 观点清晰、论据充分
- 结构 (20%): 逻辑连贯、段落分明
- 语言 (30%): 词汇丰富、语法正确
- 创意 (20%): 新颖独特

**输出格式**:
```json
{
  "score": 85,
  "feedback": {
    "content": "观点明确，论据充分，但缺少反面例证...",
    "structure": "段落过渡自然，但结尾略显仓促...",
    "language": "词汇丰富，但有 3 处语法错误...",
    "creativity": "立意新颖，值得鼓励"
  },
  "highlights": [
    { "text": "这是一个亮点句子", "type": "GOOD" },
    { "text": "这里有语法错误", "type": "ERROR" }
  ]
}
```

**Schema 扩展建议**:
```prisma
model UserAttempt {
  // ... 现有字段
  aiScore    Float?  @map("ai_score")     // AI 评分 (0-100)
  aiFeedback Json?   @map("ai_feedback")  // AI 批注 JSON
}
```

---

## 7. 家长监控 (3个功能)

### 7.1 子女学习报告

**功能描述**: 家长查看子女的学习时长、进度、成绩
**路由**: `/dashboard/parent` (需新增)
**实现文件**: 需新增 `src/actions/parent.ts` 扩展
**数据库表**: `parent_students`, `user_progress`, `exam_records`

| 角色 | 权限 | 说明 |
|------|------|------|
| PARENT | ✅ | 只能查看关联的学生数据 |
| ADMIN | ✅ | 可查看所有家长-学生关系 |

**报告内容**:
- 本周学习时长 (`totalStudyTime`)
- 完成课程数 (统计 `isCompleted=true`)
- 考试成绩趋势 (`exam_records`)
- 错题数量 (`error_book`)
- 连续学习天数 (`streak`)

**推送通知**:
- 每周一发送周报邮件
- 学生连续 3 天未学习发送提醒
- 考试成绩低于 60 分发送警告

---

### 7.2 学习时长限制

**功能描述**: 家长设置每日学习时长上限 (防止过度学习)
**实现文件**: 需新增
**数据库表**: 需在 `parent_students` 表添加 `dailyLimit` 字段

| 角色 | 权限 | 说明 |
|------|------|------|
| PARENT | ✅ | 可设置关联学生的时长限制 |
| STUDENT | 👁️ | 只能查看限制，不能修改 |

**限制逻辑**:
- 达到限制后，学生无法继续学习 (页面提示)
- 默认限制: 3 小时/天
- 家长可自定义: 1-8 小时

**Schema 扩展建议**:
```prisma
model ParentStudent {
  // ... 现有字段
  dailyLimit    Int?  @map("daily_limit") @default(180) // 每日学习时长上限 (分钟)
  notifyParent  Boolean @default(true) @map("notify_parent") // 是否推送通知
}
```

---

### 7.3 多子女管理

**功能描述**: 家长可关联多个学生账号，切换查看
**实现文件**: `src/actions/parent.ts`
**数据库表**: `parent_students`

| 角色 | 权限 | 说明 |
|------|------|------|
| PARENT | ✅ | 可关联多个学生 |
| STUDENT | ✅ | 可被多个家长关联 |

**关联方式**:
- 学生生成邀请码 (`invite_codes` 表)
- 家长输入邀请码绑定

**切换逻辑**:
- 仪表盘顶部显示下拉菜单
- 选择学生后，所有页面数据切换到该学生

---

## 8. 营销与公共页面 (10个功能)

### 8.1 首页 (Landing Page)

**功能描述**: 产品介绍、功能亮点、用户评价、CTA 按钮
**路由**: `/`
**实现文件**: `src/app/page.tsx`

| 角色 | 权限 |
|------|------|
| 所有用户 | ✅ 公开访问 |

**内容模块**:
- Hero 区 (大标题 + CTA)
- 功能介绍 (6 大学科)
- 用户评价 (成功案例)
- 价格方案
- FAQ

---

### 8.2 关于我们

**功能描述**: 团队介绍、公司愿景、联系方式
**路由**: `/about-us`
**实现文件**: `src/app/about-us/page.tsx`

| 角色 | 权限 |
|------|------|
| 所有用户 | ✅ 公开访问 |

---

### 8.3 工作原理

**功能描述**: 产品使用流程、功能详解
**路由**: `/how-it-works`
**实现文件**: `src/app/how-it-works/page.tsx`

| 角色 | 权限 |
|------|------|
| 所有用户 | ✅ 公开访问 |

---

### 8.4 课程体系

**功能描述**: 6 大学科介绍、课程大纲预览
**路由**: `/subjects`
**实现文件**: `src/app/subjects/page.tsx`

| 角色 | 权限 |
|------|------|
| 所有用户 | ✅ 公开访问 |

---

### 8.5 价格方案

**功能描述**: 免费版 / PRO / ULTIMATE 对比表
**路由**: `/pricing`
**实现文件**: `src/app/pricing/page.tsx`, `src/actions/stripe-actions.ts`

| 角色 | 权限 | 说明 |
|------|------|------|
| 未登录用户 | ✅ | 可查看价格，点击跳转注册 |
| STUDENT | ✅ | 可查看价格 + 升级按钮 |
| PRO/ULTIMATE | 👁️ | 显示当前订阅状态 |

**价格方案** (示例):
- **免费版** (STUDENT): ¥0/月
  - 3 门基础科目
  - 每日 20 道题
  - 每周 2 次考试
  - 社区功能
  - 5 次 AI 提问/天

- **专业版** (PRO): ¥99/月 或 ¥999/年
  - 6 门全科目
  - 每日 100 道题
  - 每周 10 次考试
  - 无广告
  - 50 次 AI 提问/天
  - AI 学习路径
  - 20 次 AI 作文批改/天

- **旗舰版** (ULTIMATE): ¥199/月 或 ¥1999/年
  - PRO 所有功能
  - 无限 AI 提问
  - 无限考试
  - 1v1 名师答疑 (每月 2 次)
  - 优先客服
  - 线下活动优先权

**支付集成**:
- 使用 Stripe API (`stripe-actions.ts`)
- 支持支付宝、微信支付 (通过 Stripe)
- 订阅自动续费

---

### 8.6 成功案例

**功能描述**: 学员故事、成绩提升案例
**路由**: `/success-stories`
**实现文件**: `src/app/success-stories/page.tsx`

| 角色 | 权限 |
|------|------|
| 所有用户 | ✅ 公开访问 |

---

### 8.7 博客

**功能描述**: 教育资讯、学习技巧文章
**路由**: `/blog`, `/blog/[slug]`
**实现文件**: `src/app/blog/page.tsx`, `src/app/blog/[slug]/page.tsx`, `src/actions/blog.ts`
**数据库表**: `blog_posts`

| 角色 | 权限 | 说明 |
|------|------|------|
| 所有用户 | ✅ | 可查看已发布文章 (`isPublished=true`) |
| ADMIN | ✅ | 可创建/编辑/删除文章 |

**文章分类** (`category` 字段):
- 学习方法
- 考试技巧
- 家长指南
- 产品更新

---

### 8.8 学习指南

**功能描述**: 学习方法、备考指南、知识点总结
**路由**: `/study-guides`
**实现文件**: `src/app/study-guides/page.tsx`

| 角色 | 权限 |
|------|------|
| 所有用户 | ✅ 公开访问 |

---

### 8.9 学生关怀

**功能描述**: 常见问题、使用帮助、联系客服
**路由**: `/student-care`
**实现文件**: `src/app/student-care/page.tsx`

| 角色 | 权限 |
|------|------|
| 所有用户 | ✅ 公开访问 |

---

### 8.10 联系我们

**功能描述**: 反馈表单、商务合作咨询
**路由**: `/contact`
**实现文件**: `src/app/contact/page.tsx`, `src/actions/marketing.ts`
**数据库表**: `contact_submissions`

| 角色 | 权限 | 说明 |
|------|------|------|
| 所有用户 | ✅ | 可提交表单 |
| ADMIN | ✅ | 可查看所有提交记录 |

**表单字段**:
- `name`: 姓名
- `email`: 邮箱
- `subject`: 主题
- `message`: 留言内容
- `status`: 状态 (NEW/READ/REPLIED)

**ADMIN 功能**:
- 查看所有提交 (`status` 筛选)
- 标记为已读/已回复
- 发送邮件回复 (需集成邮件服务)

---

## 9. 管理员功能 (8个功能)

### 9.1 用户管理

**功能描述**: 查看/编辑/删除用户，调整角色权限
**路由**: `/dashboard/admin/users` (需新增)
**实现文件**: 需新增
**数据库表**: `users`

| 角色 | 权限 |
|------|------|
| ADMIN | ✅ 完全访问 |

**功能列表**:
- 查看所有用户列表 (支持搜索、筛选)
- 编辑用户信息 (`username`, `email`, `role`, `grade`)
- 调整用户 XP/Level/Streak
- 封禁用户 (需添加 `isBanned` 字段)
- 删除用户 (软删除，标记 `deletedAt`)
- 查看用户活动日志

**Schema 扩展建议**:
```prisma
model User {
  // ... 现有字段
  isBanned  Boolean   @default(false) @map("is_banned")
  bannedAt  DateTime? @map("banned_at")
  deletedAt DateTime? @map("deleted_at") // 软删除
}
```

---

### 9.2 内容审核

**功能描述**: 审核社区帖子、评论、题目
**路由**: `/dashboard/admin/moderation` (需新增)
**实现文件**: 需新增
**数据库表**: `posts`, `comments`, `questions`

| 角色 | 权限 |
|------|------|
| ADMIN | ✅ 完全访问 |

**审核对象**:
- 待审核帖子 (`posts` 需添加 `status` 字段)
- 用户举报内容
- AI 标记的敏感内容
- 教师上传的题目 (`questions.status`)

**操作**:
- 通过/驳回
- 删除内容
- 封禁发布者

---

### 9.3 数据统计

**功能描述**: 平台整体数据分析（DAU/MAU/付费转化率）
**路由**: `/dashboard/admin/analytics` (需新增)
**实现文件**: 需新增
**数据库表**: `users`, `exam_records`, `posts`, `leaderboard_entries`

| 角色 | 权限 |
|------|------|
| ADMIN | ✅ 完全访问 |

**统计维度**:
- **用户数据**:
  - 总用户数
  - DAU/WAU/MAU (日/周/月活跃用户)
  - 新增用户趋势
  - 用户留存率 (次日/7日/30日)
  - 角色分布 (STUDENT/PRO/ULTIMATE)

- **学习数据**:
  - 总学习时长
  - 平均学习时长/用户
  - 完成课程数
  - 答题数
  - 考试次数

- **社区数据**:
  - 发帖数
  - 评论数
  - 点赞数
  - 活跃度趋势

- **收入数据**:
  - 付费用户数
  - MRR (月经常性收入)
  - 付费转化率
  - 客单价

**可视化**:
- 使用 Recharts 绘制图表
- 支持日期范围筛选
- 支持导出 CSV

---

### 9.4 课程管理

**功能描述**: 创建/编辑/删除科目、章节、课程
**路由**: `/dashboard/admin/courses` (需新增)
**实现文件**: 需新增
**数据库表**: `subjects`, `chapters`, `lessons`

| 角色 | 权限 |
|------|------|
| ADMIN | ✅ 完全访问 |
| TEACHER | ✅ 可创建/编辑课程 (需审核) |

**功能**:
- 科目管理 (`subjects`)
- 章节管理 (`chapters`) - 支持拖拽排序
- 课程管理 (`lessons`) - 支持上传视频/文档

---

### 9.5 题库管理

**功能描述**: 审核、编辑、删除题目，批量导入
**路由**: `/dashboard/admin/questions` (需新增)
**实现文件**: 需新增
**数据库表**: `questions`

| 角色 | 权限 |
|------|------|
| ADMIN | ✅ 完全访问 |
| TEACHER | ✅ 可创建/编辑题目 (需审核) |

**功能**:
- 查看所有题目
- 筛选 (按科目/章节/难度/状态)
- 编辑题目
- 批量导入 (Markdown/JSON/CSV)
- 批量删除

---

### 9.6 徽章管理

**功能描述**: 创建/编辑/删除徽章，手动颁发徽章
**路由**: `/dashboard/admin/badges` (需新增)
**实现文件**: 需新增
**数据库表**: `badges`, `user_badges`

| 角色 | 权限 |
|------|------|
| ADMIN | ✅ 完全访问 |

**功能**:
- 查看所有徽章
- 创建新徽章 (`code`, `name`, `description`, `icon`, `condition`)
- 编辑徽章
- 删除徽章
- 手动颁发徽章给指定用户
- 撤销用户徽章

---

### 9.7 推广管理

**功能描述**: 查看 UTM 追踪数据、邀请码统计
**路由**: `/dashboard/admin/marketing` (需新增)
**实现文件**: 需新增
**数据库表**: `users` (utmSource, utmMedium, utmCampaign), `invite_codes`

| 角色 | 权限 |
|------|------|
| ADMIN | ✅ 完全访问 |

**功能**:
- UTM 来源分析 (哪个渠道带来最多用户)
- 邀请码统计 (哪些学生邀请了家长)
- 推广效果转化率

---

### 9.8 系统设置

**功能描述**: 平台全局配置（维护模式、通知模板、功能开关）
**路由**: `/dashboard/admin/settings` (需新增)
**实现文件**: 需新增
**数据库表**: 需新增 `system_settings` 表

| 角色 | 权限 |
|------|------|
| ADMIN | ✅ 完全访问 |

**配置项**:
- 维护模式开关
- 用户注册开关
- AI 功能开关
- 邮件通知模板
- 每日免费 AI Token 数量
- 免费用户答题限制

**Schema 建议**:
```prisma
model SystemSetting {
  id        String   @id @default(uuid()) @db.Uuid
  key       String   @unique // e.g. "maintenance_mode", "free_ai_tokens"
  value     String   @db.Text // JSON 格式存储
  updatedBy String   @map("updated_by") @db.Uuid
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("system_settings")
}
```

---

## 📊 完整权限矩阵表

以下是所有 52 个功能的权限矩阵总览：

| # | 功能模块 | STUDENT | PARENT | PRO | ULTIMATE | TEACHER | ADMIN |
|---|---------|---------|--------|-----|----------|---------|-------|
| **1. 用户认证与账户管理** |
| 1.1 | 用户注册 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 1.2 | 用户登录 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 1.3 | 个人设置 | ✅ | ✅ | ✅ 🔒 | ✅ 🔒 | ✅ | ✅ |
| 1.4 | 邀请码系统 | ✅ | ✅ | ✅ | ✅ | ❌ | 👁️ |
| **2. 课程学习系统** |
| 2.1 | 课程目录浏览 | ✅ | 👁️ | ✅ 🔒 | ✅ 🔒 | ✅ | ✅ |
| 2.2 | 课程学习页 | ✅ | ❌ | ✅ 🔒 | ✅ 🔒 | ✅ | ✅ |
| 2.3 | 学习进度统计 | ✅ | ✅ | ✅ 🔒 | ✅ 🔒 | 👁️ | ✅ |
| 2.5 | 课程搜索 | ✅ | 👁️ | ✅ 🔒 | ✅ 🔒 | ✅ | ✅ |
| 2.6 | 课程收藏 | ✅ | ❌ | ✅ 🔒 | ✅ 🔒 | ✅ | ✅ |
| **3. 题库与练习** |
| 3.1 | 题目练习 | ⚠️ 20题/天 | ❌ | ⚠️ 100题/天 | ✅ | ✅ | ✅ |
| 3.2 | 错题本 | ✅ | 👁️ | ✅ 🔒 | ✅ 🔒 | ✅ | ✅ |
| 3.3 | 模拟考试 | ⚠️ 2次/周 | 👁️ | ⚠️ 10次/周 | ✅ | ✅ | ✅ |
| 3.4 | 题目导入 | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| 3.5 | 题目审核 | ❌ | ❌ | ❌ | ❌ | 👁️ | ✅ |
| 3.6 | 答题统计 | ✅ | ✅ | ✅ 🔒 | ✅ 🔒 | 👁️ | ✅ |
| 3.7 | AI 智能出题 | ❌ | ❌ | ⚠️ 5次/天 | ⚠️ 20次/天 | ✅ | ✅ |
| **4. 社区与互动** |
| 4.1 | 社区首页 | ✅ | 👁️ | ✅ 🔒 | ✅ 🔒 | ✅ | ✅ |
| 4.2 | 发布新帖 | ⚠️ 10条/天 | ❌ | ⚠️ 30条/天 | ✅ | ✅ | ✅ |
| 4.3 | 帖子详情与评论 | ✅ | 👁️ | ✅ 🔒 | ✅ 🔒 | ✅ | ✅ |
| 4.4 | 通知系统 | ✅ | ✅ | ✅ 🔒 | ✅ 🔒 | ✅ | ✅ |
| 4.5 | 用户主页 | ✅ | 👁️ | ✅ 🔒 | ✅ 🔒 | ✅ | ✅ |
| **5. 游戏化与成长** |
| 5.1 | 经验值 (XP) 系统 | ✅ | 👁️ | ✅ 🔒 | ✅ 🔒 | ❌ | ✅ |
| 5.2 | 徽章系统 | ✅ | 👁️ | ✅ 🔒 | ✅ 🔒 | ✅ | ✅ |
| 5.3 | 每日任务 | ✅ 3个/天 | ❌ | ⚠️ 5个/天 | ⚠️ 7个/天 | ❌ | ❌ |
| 5.4 | 排行榜 | ✅ | 👁️ | ✅ 🔒 | ✅ 🔒 | 👁️ | ✅ |
| 5.5 | 连续学习天数 | ✅ | 👁️ | ✅ 🔒 | ✅ 🔒 | ❌ | ✅ |
| 5.6 | 成就页面 | ✅ | 👁️ | ✅ 🔒 | ✅ 🔒 | ✅ | ✅ |
| **6. AI 智能辅导** |
| 6.1 | AI 问答助手 | ⚠️ 5次/天 | ❌ | ⚠️ 50次/天 | ✅ | ✅ | ✅ |
| 6.2 | AI 学习路径推荐 | ✅ | 👁️ | ✅ 🔒 | ✅ 🔒 | ❌ | ✅ |
| 6.3 | AI 作文批改 | ⚠️ 3次/天 | ❌ | ⚠️ 20次/天 | ✅ | ✅ | ✅ |
| **7. 家长监控** |
| 7.1 | 子女学习报告 | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| 7.2 | 学习时长限制 | 👁️ | ✅ | 👁️ | 👁️ | ❌ | ✅ |
| 7.3 | 多子女管理 | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **8. 营销与公共页面** |
| 8.1 | 首页 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 8.2 | 关于我们 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 8.3 | 工作原理 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 8.4 | 课程体系 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 8.5 | 价格方案 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 8.6 | 成功案例 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 8.7 | 博客 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 8.8 | 学习指南 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 8.9 | 学生关怀 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 8.10 | 联系我们 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **9. 管理员功能** |
| 9.1 | 用户管理 | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| 9.2 | 内容审核 | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| 9.3 | 数据统计 | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| 9.4 | 课程管理 | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| 9.5 | 题库管理 | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| 9.6 | 徽章管理 | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| 9.7 | 推广管理 | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| 9.8 | 系统设置 | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 🛡️ 权限控制实现指南

### 1. Middleware 层（路由级保护）

在 `middleware.ts` 中实现基础路由保护：

```typescript
// middleware.ts
import { createServerClient } from '@/lib/supabase/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const supabase = createServerClient(request)
  const { data: { user } } = await supabase.auth.getUser()

  // 未登录用户访问受保护路由 → 重定向到登录页
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // 已登录用户访问认证页面 → 重定向到仪表盘
  if (user && ['/login', '/register'].includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register']
}
```

---

### 2. Server Actions 层（业务逻辑保护）

在 Server Actions 中检查用户权限：

```typescript
// src/lib/permissions.ts
import { UserRole } from '@prisma/client'

export function canAccessFeature(userRole: UserRole, feature: string): boolean {
  const permissions: Record<string, UserRole[]> = {
    'ai-tutor': [UserRole.PRO, UserRole.ULTIMATE, UserRole.TEACHER, UserRole.ADMIN],
    'admin-panel': [UserRole.ADMIN],
    'import-questions': [UserRole.TEACHER, UserRole.ADMIN],
    'unlimited-practice': [UserRole.ULTIMATE, UserRole.TEACHER, UserRole.ADMIN],
    // ... 更多权限配置
  }

  return permissions[feature]?.includes(userRole) ?? false
}

export function getDailyLimit(userRole: UserRole, feature: string): number {
  const limits: Record<string, Record<UserRole, number>> = {
    'practice-questions': {
      [UserRole.STUDENT]: 20,
      [UserRole.PRO]: 100,
      [UserRole.ULTIMATE]: Infinity,
      [UserRole.TEACHER]: Infinity,
      [UserRole.ADMIN]: Infinity,
    },
    'ai-questions': {
      [UserRole.STUDENT]: 5,
      [UserRole.PRO]: 50,
      [UserRole.ULTIMATE]: Infinity,
      [UserRole.TEACHER]: Infinity,
      [UserRole.ADMIN]: Infinity,
    },
    // ... 更多限制配置
  }

  return limits[feature]?.[userRole] ?? 0
}
```

---

### 3. 前端组件层（UI 显示控制）

使用 React Hook 检查权限：

```typescript
// src/lib/hooks/usePermissions.ts
'use client'

import { useUser } from '@/lib/hooks/useUser'
import { canAccessFeature, getDailyLimit } from '@/lib/permissions'

export function usePermissions() {
  const { user } = useUser()

  return {
    canAccess: (feature: string) => {
      if (!user) return false
      return canAccessFeature(user.role, feature)
    },
    getDailyLimit: (feature: string) => {
      if (!user) return 0
      return getDailyLimit(user.role, feature)
    },
    isPro: user?.role === 'PRO' || user?.role === 'ULTIMATE',
    isAdmin: user?.role === 'ADMIN',
    isTeacher: user?.role === 'TEACHER',
  }
}
```

**使用示例**:

```tsx
// 组件中使用
export default function PracticePage() {
  const { canAccess, getDailyLimit } = usePermissions()

  if (!canAccess('unlimited-practice')) {
    return <div>您已达到每日练习上限 ({getDailyLimit('practice-questions')} 道题)</div>
  }

  return <div>开始练习...</div>
}
```

---

## 📝 下一步建议

### 立即行动项 (优先级 P0)

1. **扩展 `permissions.ts`**: 将上述 52 个功能的权限规则写入 `src/lib/permissions.ts`
2. **更新 Middleware**: 添加 ADMIN 专属路由保护
3. **创建权限测试**: 为每个权限规则编写单元测试

### 短期任务 (优先级 P1)

1. **扩展 Schema**: 为缺失的功能添加数据库字段 (如 `isBanned`, `status`, `notifications` 表)
2. **实现 ADMIN 页面**: 创建 `/dashboard/admin/*` 路由
3. **实现 PARENT 功能**: 创建 `/dashboard/parent` 路由

### 长期规划 (优先级 P2)

1. **精细化权限**: 从角色权限 (RBAC) 迁移到基于资源的权限 (ABAC)
2. **审计日志**: 记录所有 ADMIN 操作到 `audit_logs` 表
3. **权限可视化**: 创建权限矩阵可视化工具 (供产品经理使用)

---

## 🔗 相关文档

- **技术栈文档**: `/docs/TECH_STACK.md`
- **PRD 文档**: `/docs/PRD.md`
- **路由清单**: `/docs/stories/ROUTES.md`
- **数据库文档**: `/docs/stories/SCHEMA_DOCUMENTATION.md`
- **Story 规划**: `/docs/stories/README.md`

---

**文档结束**

维护者: Claude Code
最后更新: 2026-01-19
下次审查: 定期与 Story 开发同步更新
