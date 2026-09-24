# Learn More Platform

> Learnbank 官网本轮改版的唯一需求与决策入口：[Landing Page 主文档](docs/landing-page-ssot.md)。本次选定视觉、免费种子用户招募、候选文案、待答问题和迭代进度均在该文档维护。以下平台说明包含历史 Web App 内容，不代表当前官网首发范围。

A comprehensive online education platform for middle school students.

## Tech Stack

- **Framework:** Next.js 16+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Shadcn/ui
- **Database:** Supabase (PostgreSQL) + Prisma ORM
- **State Management:** Zustand
- **Validation:** Zod
- **Testing:** Vitest + React Testing Library

## Features

- **Authentication System** (Supabase Auth Integration)
- **App Shell & Navigation**
  - Responsive Sidebar with Mobile support
  - Dynamic Breadcrumb Navigation
  - Dark/Light Theme Toggle
  - User Navigation Dropdown
- **Course Learning Engine**
  - **Course Tree Component**: Recursive directory tree with infinite nesting support.
    - Expand/Collapse with state memory.
    - Visual indicators for Locked, Completed, and In-Progress statuses.
    - [View Demo](/demo/course-tree) (locally accessible via `/demo/course-tree`).
  - **Video Player Integration**: Professional video playback with react-player.
    - Supports external URLs and Supabase Storage signed URLs.
    - Basic DRM protection (disable download, right-click prevention).
    - Automatic loading states and error handling.
    - Progress tracking callbacks for learning analytics.
- **Smart Quiz System**
  - Interactive Question UI (Single/Multi-choice, Fill-blank)
  - Timed Quizzes & Exam Mode
  - **Grading Engine**: Server-side answer verification and score calculation.
  - Performance tracking (Exam Records, User Attempts)
- **Error Book System**:
  - Automatic collection of incorrect questions.
  - Review and master mistakes.
- **Leaderboard System**:
  - Weekly, Monthly, and All-Time rankings.
  - XP system integrated with quizzes.
  - Optimized for performance with PostgreSQL (Migration path to Redis planned).

## Getting Started

1. **Clone the repository**

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Configure Environment Variables**
   Copy `.env.example` to `.env.local` and fill in your Supabase credentials.

   ```bash
   cp .env.example .env.local
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser.

## Environment Variables

See `.env.example` for the required environment variables:

- `DATABASE_URL`: Connection string for Prisma
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase Anon Key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase Service Role Key (Server-side only)
