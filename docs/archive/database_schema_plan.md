# 数据库架构规划文档 (Database Schema Plan)

本文档详细描述了支持 LearnMore v1.0 平台 (23 个页面) 稳定运行所需的完整数据库结构。

## 概览

*   **总表数**: 19 张
*   **模块划分**: 用户与设置、课程内容、学习评估、游戏化、社区社交。
*   **核心目标**: 支持 Story-022 设计的所有 UI 功能，包括 AI 个性化配置、每日任务、博客系统等。

---

## 1. 用户与身份模块 (User & Identity)

### `User` (现有)
核心用户身份表，与 Supabase Auth 关联。
*   `id`: UUID (PK)
*   `email`: String (Unique)
*   `username`: String? (Unique)
*   `role`: Enum (STUDENT, TEACHER, ADMIN)
*   `avatar`: String?
*   `grade`: Int? (7-12)
*   **新增字段**:
    *   `streak`: Int (当前连胜天数, 默认 0)
    *   `total_study_time`: Int (总学习时长秒数, 默认 0)
    *   `xp`: Int (总经验值, 默认 0)
    *   `last_study_date`: DateTime? (用于计算连胜)

### `UserSettings` (新增)
用于存储用户的个性化偏好，支持“设置”页面。
*   `id`: UUID (PK)
*   `user_id`: UUID (FK -> User.id)
*   `theme`: String (Default: 'dark')
*   `language`: String (Default: 'en') - 'en', 'zh', 'ms'
*   `ai_personality`: Enum (ENCOURAGING, SOCRATIC, STRICT)
*   `difficulty_calibration`: Int (0-100) - 难度校准值
*   `curriculum_system`: String? (e.g., "UEC", "IGCSE")
*   `notification_daily`: Boolean (Default: true)
*   `notification_weekly`: Boolean (Default: true)

### `Subscriber` (新增)
用于 Landing Page 和 Blog 页面的 Newsletter 订阅。
*   `id`: UUID (PK)
*   `email`: String (Unique)
*   `subscribed_at`: DateTime

---

## 2. 课程与内容模块 (Course & Content)

### `Subject` (现有)
学科分类（如数学、物理）。
*   `id`: UUID (PK)
*   `name`: String
*   `icon`: String?
*   `order`: Int

### `Chapter` (现有)
章节/模块结构，支持树形嵌套。
*   `id`: UUID (PK)
*   `subject_id`: UUID (FK)
*   `parent_id`: UUID? (自关联)
*   `title`: String
*   `order`: Int

### `Lesson` (现有)
最小学习单元。
*   `id`: UUID (PK)
*   `chapter_id`: UUID (FK)
*   `title`: String
*   `type`: Enum (VIDEO, DOCUMENT, EXERCISE, QUIZ)
*   `video_url`: String?
*   `content`: Text? (Markdown)
*   `duration`: Int? (Seconds)
*   `xp_reward`: Int (Default: 10)

### `BlogPost` (新增)
用于 `/blog` 页面和营销内容管理。
*   `id`: UUID (PK)
*   `slug`: String (Unique) - URL 友好的标识符
*   `title`: String
*   `excerpt`: String?
*   `content`: Text
*   `cover_image`: String?
*   `author`: String
*   `category`: String (e.g., "Engineering", "Learning Tips")
*   `published_at`: DateTime
*   `is_published`: Boolean

---

## 3. 学习评估模块 (Learning & Assessment)

### `Question` (现有)
题库核心表。
*   `id`: UUID (PK)
*   `chapter_id`: UUID (FK)
*   `type`: Enum (MCQ, FILL_BLANK, ESSAY)
*   `difficulty`: Int (1-5)
*   `content`: Text (Markdown/LaTeX)
*   `options`: Json? (e.g. `[{"label": "A", "text": "..."}]`)
*   `answer`: Json (Correct answer key)
*   `explanation`: Text?

### `UserAttempt` (现有)
用户答题记录（流水表）。
*   `id`: UUID (PK)
*   `user_id`: UUID (FK)
*   `question_id`: UUID (FK)
*   `user_answer`: Json
*   `is_correct`: Boolean
*   `duration`: Int? (Time taken in seconds)
*   `created_at`: DateTime

### `ErrorBook` (现有)
错题本（聚合表）。
*   `id`: UUID (PK)
*   `user_id`: UUID (FK)
*   `question_id`: UUID (FK)
*   `mastery_level`: Int (0-3) - 0:未掌握, 3:已掌握
*   `last_reviewed_at`: DateTime?

### `ExamRecord` (现有)
试卷/模考记录。
*   `id`: UUID (PK)
*   `user_id`: UUID (FK)
*   `title`: String? (e.g., "Mid-term Mock")
*   `score`: Float
*   `total_questions`: Int

### `UserProgress` (现有)
课程学习进度。
*   `id`: UUID (PK)
*   `user_id`: UUID (FK)
*   `lesson_id`: UUID (FK)
*   `is_completed`: Boolean
*   `progress_percent`: Float

---

## 4. 游戏化与互动模块 (Gamification)

### `DailyTask` (新增)
用于 Dashboard 的 "Today's Mission"。
*   `id`: UUID (PK)
*   `user_id`: UUID (FK)
*   `type`: Enum (LOGIN, COMPLETE_LESSON, FIX_ERROR, QUIZ_SCORE)
*   `title`: String (e.g., "Fix 3 Errors")
*   `target_count`: Int (e.g., 3)
*   `current_count`: Int
*   `xp_reward`: Int
*   `is_claimed`: Boolean (是否已领取奖励)
*   `date`: DateTime (Date only) - 每日刷新依据

### `Badge` (现有)
成就定义。
*   `id`: UUID (PK)
*   `code`: String (Unique)
*   `name`: String
*   `icon`: String

### `UserBadge` (现有)
用户获得的成就。
*   `id`: UUID (PK)
*   `user_id`: UUID (FK)
*   `badge_id`: UUID (FK)
*   `awarded_at`: DateTime

### `LeaderboardEntry` (现有)
排行榜缓存表（避免实时统计大量 Attempt）。
*   `id`: UUID (PK)
*   `user_id`: UUID (FK)
*   `score`: Int (Total XP)
*   `period`: Enum (WEEKLY, MONTHLY, ALL_TIME)
*   `week_start`: DateTime

---

## 5. 社区社交模块 (Community)

### `Post` (现有)
社区帖子。
*   `id`: UUID (PK)
*   `author_id`: UUID (FK)
*   `title`: String
*   `content`: Text
*   `category`: String? (Question, Note, Achievement) - **需新增字段**
*   `tags`: String[] - **需新增字段**
*   `is_solved`: Boolean (Default: false) - **需新增字段**

### `Comment` (现有)
帖子评论。
*   `id`: UUID (PK)
*   `post_id`: UUID (FK)
*   `author_id`: UUID (FK)
*   `content`: Text
*   `is_solution`: Boolean (Default: false) - **需新增字段**

### `ContactSubmission` (新增)
用于 `/contact` 页面的表单提交。
*   `id`: UUID (PK)
*   `name`: String
*   `email`: String
*   `subject`: String
*   `message`: Text
*   `status`: Enum (NEW, READ, REPLIED)
*   `created_at`: DateTime
