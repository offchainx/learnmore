# System Architecture & Database Schema

## 1. High-Level Architecture

The **Learn More** platform utilizes a modern, serverless-ready architecture optimized for performance and type safety.

*   **Frontend**: Next.js 14+ (App Router) with React Server Components (RSC).
*   **Backend Logic**: Next.js Server Actions (RPC-style calls). No separate API server required for standard CRUD.
*   **Database**: PostgreSQL (via Supabase), accessed using Prisma ORM.
*   **Authentication**: Supabase Auth (integrated with Prisma `User` table).
*   **Storage**: Supabase Storage (for avatars, course videos).

## 2. Database Schema (Data Model)

To support the current 23-page application structure, we require approximately **19 Tables** organized into 5 functional modules.

### A. User & Identity Module (3 Tables)
*   **`User`** (Existing): Core identity. Stores email, name, role, grade level.
    *   *Update needed*: Add `streak`, `total_study_time`, `xp`.
*   **`UserSettings`** (New): Separates preferences from core identity.
    *   Fields: `user_id`, `theme`, `language`, `ai_personality` (Encouraging/Strict), `difficulty_calibration`.
*   **`Subscriber`** (New): For Newsletter marketing (`/blog` page).
    *   Fields: `email`, `subscribed_at`.

### B. Course & Content Module (4 Tables)
*   **`Subject`** (Existing): High-level categorization (Math, Science).
*   **`Chapter`** (Existing): Hierarchical structure (can nest).
*   **`Lesson`** (Existing): The atomic learning unit (Video, Article).
    *   *Supports*: `/course/[subjectId]/[lessonId]`.
*   **`BlogPost`** (New): Content for the Marketing Blog (`/blog`).
    *   Fields: `slug`, `title`, `content`, `author`, `tags`, `published_at`.

### C. Learning & Assessment Module (5 Tables)
*   **`Question`** (Existing): The question bank core.
*   **`UserAttempt`** (Existing): Logs every answer submission.
*   **`ExamRecord`** (Existing): Aggregates attempts into a "Test" or "Mock Exam" result.
*   **`ErrorBook`** (Existing): Tracks mistakes for "Weakness Sniper" feature.
    *   *Supports*: `/error-book` page.
*   **`UserProgress`** (Existing): Tracks lesson completion status.

### D. Gamification & Engagement Module (4 Tables)
*   **`DailyTask`** (New): Generates "Today's Mission" on Dashboard.
    *   Fields: `user_id`, `task_type`, `target_count`, `current_count`, `is_claimed`, `date`.
*   **`Badge`** (Existing): Definitions of achievements (e.g., "Math Wizard").
*   **`UserBadge`** (Existing): User-Badge relation.
*   **`LeaderboardEntry`** (Existing): Caches weekly/monthly scores for the `/dashboard/leaderboard` page.

### E. Social & Community Module (3 Tables)
*   **`Post`** (Existing): Community discussions.
*   **`Comment`** (Existing): Replies to posts.
*   **`ContactSubmission`** (New): Stores form data from `/contact` page.

## 3. Page-to-Data Mapping

| Page Route | Primary Data Tables | Key Operations |
| :--- | :--- | :--- |
| **/ (Landing)** | `Subscriber` | Newsletter signup. |
| **/dashboard** | `User`, `DailyTask`, `UserProgress`, `LeaderboardEntry` | Fetch stats, tasks, recent progress. |
| **/course/[id]** | `Subject`, `Chapter`, `Lesson`, `UserProgress` | Render course tree and status. |
| **/course/.../lesson** | `Lesson`, `Question`, `UserAttempt` | Serve video/content, handle quiz submission. |
| **/error-book** | `ErrorBook`, `Question` | List weak points, generate review sets. |
| **/dashboard/community** | `Post`, `Comment`, `User` | Feed rendering, creating posts. |
| **/dashboard/settings** | `User`, `UserSettings` | Update profile and AI prefs. |
| **/blog** | `BlogPost` | CMS content rendering. |

## 4. Implementation Priority

1.  **Immediate**: Run migration to add `UserSettings` and `DailyTask` to support the Dashboard UI features (Story-022 designs).
2.  **Secondary**: Add `BlogPost` system if dynamically fetching blogs (vs hardcoded).
3.  **Optimization**: Add indexes on `UserAttempt` for faster analytics (Knowledge Graph).
