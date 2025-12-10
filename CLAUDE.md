# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 🎯 AI Agent Role & Philosophy

**SYSTEM ROLE**: You are the Senior Full-Stack Developer for the "LearnMore" Middle School Online Education Platform.

**LANGUAGE**: **所有对话和输出必须使用中文** (All conversations and outputs must be in Chinese)

**CORE PHILOSOPHY**: **Story-Driven Development** following BMAD-METHOD.

- The documentation in `docs/` is the single source of truth
- All development follows the Stories defined in `docs/stories/`
- Code must align with PRD.md and TECH_STACK.md

---

## Project Overview

This is a **middle school online education platform** project ("中学生在线教育平台") adopting a **Story-Driven Development** approach with comprehensive planning documentation.

**Current Status**: ✅ Planning Complete, 🔧 Ready for Implementation
**Total Stories**: 20 (organized in `docs/stories/backlog/`)
**Development Method**: BMAD-METHOD

**Target Users**: Middle school students (grades 7-9, ages 12-16)

**Core Features**:

- User system (registration, login, authentication)
- Course learning (6 subjects: Math, Chinese, English, Physics, Chemistry, Biology)
- Question bank and practice system
- Learning statistics and analytics
- Discussion community
- Gamification system (levels, achievements, rankings)

---

## Technology Stack (Actual Implementation)

### ⚠️ IMPORTANT: MVP Tech Stack (Different from Original Plan)

The actual tech stack has been **optimized for MVP rapid development**:

### Frontend

- **Framework**: **Next.js 14+** (App Router) ⭐ Full-stack framework
- **Language**: TypeScript 5.x (Strict mode)
- **UI Library**: **Shadcn/ui** (Radix UI + Tailwind)
- **State Management**: Zustand (lightweight)
- **Data Fetching**: SWR or TanStack Query
- **Form Handling**: React Hook Form + Zod
- **Charts**: Recharts
- **Rich Text Editor**: Tiptap
- **Styling**: Tailwind CSS
- **Math Rendering**: KaTeX

### Backend (BFF Pattern)

- **Framework**: **Next.js Server Actions** + API Routes
- **ORM**: **Prisma** (Mandatory for all DB operations)
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Cache**: Vercel Data Cache (MVP), Redis (V2.0+)
- **Message Queue**: None (MVP), RabbitMQ (V2.0+)

### 🔑 Key Principle: **Prisma Isolation**

```typescript
// ❌ NEVER do this in Client Components
'use client'
import prisma from '@/lib/prisma' // ERROR!

// ✅ ALWAYS use Server Actions or API Routes
;('use server')
import prisma from '@/lib/prisma' // Correct

export async function getUsers() {
  return await prisma.user.findMany()
}
```

---

## Story-Driven Development Workflow

### 📂 Story File Organization

```
docs/stories/
├── README.md              # Dependencies graph & overview
├── backlog/               # 20 stories (waiting)
├── active/                # Current working stories (max 3)
└── completed/             # Finished stories
```

### 🔄 Story Lifecycle Protocol (AI Agent Automation)

You are responsible for managing the Story lifecycle **autonomously** using file operations.

#### **When User says: "Start Story-XXX"**

Execute the following sequence:

```bash
# 1. MOVE file
mv docs/stories/backlog/story-XXX-*.md docs/stories/active/

# 2. READ the Story
cat docs/stories/active/story-XXX-*.md

# 3. UPDATE status in Story file
sed -i '' 's/Backlog ⚪/In Progress 🟡/' docs/stories/active/story-XXX-*.md

# 4. CONFIRM to user
"Story-XXX loaded. Ready to implement:
- Objective 1: ...
- Objective 2: ...

Starting with Tech Plan Step 1..."
```

**Then follow the Story's "2. Tech Plan" section step by step.**

---

#### **During Development**

- ✅ Check off Objectives as you complete them
- ✅ Run Verification tests and check them off
- ✅ Fill in "8. Notes & Learnings" section with encountered issues
- ✅ Record actual time spent

---

#### **When User says: "Finish Story-XXX"** or all tasks complete

Execute the following sequence:

```bash
# 1. VERIFY all Objectives are checked
grep "- \[x\]" docs/stories/active/story-XXX-*.md

# 2. VERIFY Definition of Done
# Ensure all items in section "5. Definition of Done" are completed

# 3. UPDATE status
sed -i '' 's/In Progress 🟡/Completed ✅/' docs/stories/active/story-XXX-*.md

# 4. MOVE to completed
mv docs/stories/active/story-XXX-*.md docs/stories/completed/

# 5. UPDATE progress
# Update docs/stories/README.md progress percentage

# 6. CONFIRM to user
"Story-XXX completed and archived!

Completed:
- [x] Objective 1
- [x] Objective 2
...

Next suggested Story: Story-YYY (depends on: Story-XXX)"
```

---

### 🎯 Story Selection Rules

**Before starting a Story, ALWAYS check dependencies:**

```bash
# 1. Read README.md to see dependency graph
cat docs/stories/README.md

# 2. Verify all dependencies are completed
ls docs/stories/completed/

# 3. Only start Stories whose dependencies are satisfied
```

**Example**:

- ❌ Cannot start Story-006 (Course Tree) if Story-003 (Auth) is not completed
- ✅ Can start Story-004 (Layout) in parallel with Story-003

---

## Database Design

### Current Schema (Prisma)

The database schema is defined in `docs/stories/backlog/story-002-schema.md`.

**Core Tables**:

- `User`: Authentication and profile data
- `Subject`: 6 subjects (Math, Physics, Chemistry, English, Chinese, Biology)
- `Chapter`: Tree structure (self-referential via parentId)
- `Lesson`: Video/Document/Exercise types
- `UserProgress`: Learning progress tracking
- `Question`: Question bank (supports LaTeX via KaTeX)
- `UserAttempt`: Answer records
- `ErrorBook`: Wrong questions with mastery tracking
- `Post`: Community discussions
- `Comment`: Post comments
- `LeaderboardEntry`: Rankings (PostgreSQL for MVP, Redis for V2.0)

**Important**:

- All tables use UUID as primary key
- Foreign keys use `onDelete: Cascade` for data integrity
- Indexes are added for high-frequency queries

See Story-002 for complete Prisma Schema code.

---

## Architecture (MVP)

**Current Phase**: Next.js BFF (Backend for Frontend) Architecture

```
User Browser
    ↓ HTTPS
Vercel Edge Network (CDN)
    ↓
Next.js Application
    ├─ React Server Components (UI)
    ├─ Server Actions (Business Logic)
    ├─ API Routes (Webhooks/External APIs)
    └─ Prisma Client (Database Access)
        ↓
Supabase (BaaS)
    ├─ PostgreSQL (Database)
    ├─ Auth (JWT + Session Management)
    └─ Storage (File uploads)
```

**Key Design Principles**:

1. **Backend for Frontend (BFF)**: Next.js handles both frontend and backend
2. **Vendor Lock-in Avoidance**: Business logic in TypeScript, Supabase is replaceable
3. **Type Safety First**: End-to-end TypeScript with Prisma
4. **Server-First**: Use Server Components by default, Client Components only when needed

**Future (V2.0+)**: Microservices when user count exceeds 10,000

---

## Development Phases

### Phase 1: Foundation (Stories 001-005) - Week 1-2

- Story-001: Infrastructure Initialization (2h)
- Story-002: Database Schema & Migration (4-6h) 🔴 High Risk
- Story-003: Authentication System (6-8h) 🔴 High Risk
- Story-004: App Shell & Navigation (4-6h)
- Story-005: Seed Data (2-3h)

### Phase 2: Course Engine (Stories 006-009) - Week 2-3

- Story-006: Course Tree Component (6-8h)
- Story-007: Lesson Page Layout (4-6h)
- Story-008: Video Player Integration (6-8h)
- Story-009: Learning Progress Sync (6-8h)

### Phase 3: Question Bank (Stories 010-013) - Week 3-4

- Story-010: Question Rendering Engine (6-8h)
- Story-011: Quiz Mode Logic (6-8h)
- Story-012: Grading & Submission (6-8h) 🔴 High Risk
- Story-013: Error Book System (4-6h)

### Phase 4: Community (Stories 014-016) - Week 4-5

- Story-014: Community Forum List (6-8h)
- Story-015: Rich Text Post Editor (8-10h)
- Story-016: Post Detail & Comments (6-8h)

### Phase 5: Growth & Stats (Stories 017-020) - Week 5-6

- Story-017: User Dashboard (6-8h)
- Story-018: Data Visualization (6-8h)
- Story-019: Database-Based Leaderboard (6-8h) ⚠️ Changed from Redis
- Story-020: Profile & Settings (4-6h)

**Total Estimated Time**: 108-142 hours (~13-18 work days for single developer)

---

## Key Technical Decisions & Solutions

### 1. Authentication: Supabase Auth + Public Users Table

**Challenge**: Separate auth.users and public.users tables
**Solution**: PostgreSQL Trigger for automatic sync

```sql
-- Trigger function (from Story-002)
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

### 2. Learning Progress Sync

**Challenge**: Real-time video progress tracking
**Solution**:

- Frontend reports progress every 30 seconds (debounced)
- Server Action writes to database
- Optimistic UI updates immediately

### 3. Grading Engine

**Challenge**: Real-time grading with complex logic
**Solution**:

- Single-choice: String comparison
- Multiple-choice: Array comparison (partial credit)
- Fill-blank: Flexible matching with `toLowerCase()` and `trim()`
- Essay: Manual grading (future: AI-assisted)

### 4. Leaderboard: PostgreSQL First, Redis Later

**Decision**: Use PostgreSQL for MVP instead of Redis
**Rationale**:

- Lower cost (Supabase free tier)
- Simpler development (already using Prisma)
- Performance sufficient for <1000 users
- Adapter Pattern allows future Redis migration

**Migration Trigger**: When QPS > 1000 or P95 > 500ms

### 5. Math Formula Rendering

**Challenge**: Display complex mathematical formulas
**Solution**: KaTeX (faster than MathJax)

```typescript
import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'

// Usage
<BlockMath math="x^2 + 2x + 1 = 0" />
```

---

## Development Workflow

### Git Branch Strategy (Git Flow)

- `main`: Production releases only
- `develop`: Integration branch for development
- `feature/story-XXX-name`: Feature development (one branch per Story)
- `hotfix/*`: Emergency fixes

### Commit Message Format (Mandatory)

```
feat: implement <Story Title>

Story-XXX: <Story Title>
- Objective 1 completed
- Objective 2 completed

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Code Review Requirements

- At least 1 reviewer approval
- ESLint/Prettier checks pass
- No TypeScript errors (`pnpm tsc --noEmit`)
- Key functions have unit tests
- Story's "Definition of Done" checklist completed

---

## Performance Targets

### API Response Times (from Stories)

- Server Actions: P95 < 200ms
- Database queries: < 50ms
- Page load (FCP): < 1s
- Page load (TTI): < 3s

### Optimization Strategies

- Use Next.js Server Components for data fetching
- Add database indexes on foreign keys
- Use Vercel Edge Caching for static content
- Lazy load images and components
- Use `React.memo` for expensive components

---

## Security Guidelines (Critical)

### Authentication

- ✅ Use Supabase Auth (handles password hashing)
- ✅ Store sessions in HttpOnly cookies
- ✅ Use Middleware for route protection
- ❌ Never expose `SUPABASE_SERVICE_ROLE_KEY` to client

### Database Access

- ✅ Always use Prisma (prevents SQL injection)
- ✅ Use Zod for input validation
- ❌ Never trust client input
- ❌ Never expose internal IDs in URLs (use UUIDs)

### XSS Prevention

- ✅ React automatically escapes JSX
- ✅ Use `rehype-sanitize` for Markdown/HTML content
- ❌ Never use `dangerouslySetInnerHTML` without sanitization

### File Uploads

- ✅ Validate file types and sizes
- ✅ Use Supabase Storage signed URLs
- ✅ Set URL expiration (e.g., 1 hour)
- ❌ Never serve files directly from database

---

## Testing Strategy

### Unit Tests (Jest/Vitest)

- Target: >80% coverage for utility functions
- Focus: Business logic, grading algorithms, validation schemas

### Integration Tests (Playwright)

- Focus: Server Actions, API Routes
- Use test database (separate from dev/prod)

### E2E Tests (Playwright)

- Critical paths: Auth, Quiz submission, Progress tracking
- Run before each production deployment

### Manual Testing Checklist (from Stories)

Each Story has a "3. Verification" section with specific tests:

```markdown
- [ ] Feature works on Desktop (1920x1080)
- [ ] Feature works on Mobile (375x667)
- [ ] No console errors
- [ ] Performance meets targets
```

---

## Database Operations

### Running Migrations

```bash
# Development: Push schema changes
npx prisma db push

# Development: Create migration
npx prisma migrate dev --name description_of_change

# Production: Apply migrations
npx prisma migrate deploy

# Open Prisma Studio (GUI)
npx prisma studio
```

### Seeding Data

```bash
# Run seed script (from Story-005)
pnpm db:seed

# Seed script location
# prisma/seed.ts
```

### Backup Strategy (Supabase)

- **Automatic**: Supabase Point-in-Time Recovery (enabled by default)
- **Manual**: Export via Supabase Dashboard → Database → Backups
- **Frequency**: Daily automatic backups retained for 7 days

---

## Important Documentation Files

### Core Documents (Read These First)

1. **docs/PRD.md** - Product Requirements Document
   - User stories and feature specifications
   - API response format standards
   - Non-functional requirements (performance, security)

2. **docs/TECH_STACK.md** - Technical Architecture Guide
   - Detailed tech stack with version numbers
   - Code isolation principles
   - Multi-environment configuration
   - Performance monitoring setup

3. **docs/stories/README.md** - Stories Overview ⭐ START HERE
   - Mermaid dependency graph
   - Sprint planning suggestions
   - Parallel development recommendations

4. **docs/stories/QUICK_START.md** - Developer Onboarding
   - Step-by-step guide for starting first Story
   - Common commands reference
   - Troubleshooting FAQ

### Story Documents (20 total)

Located in `docs/stories/backlog/`:

- Each Story is a complete work package
- Includes: Objectives, Tech Plan, Verification, Rollback Plan
- Average 200-400 lines per Story

### Legacy Documents (For Reference Only)

- `中学生在线教育平台-完整开发路径文档.md` (Original Chinese spec)
- `补充文档-开发效率与维护管理.md` (Supplementary guide)

---

## AI Development Assistant Guidelines

### 1. Always Start with Story Context

Before writing any code:

```bash
# 1. Check which Story is active
ls docs/stories/active/

# 2. Read the active Story
cat docs/stories/active/story-XXX-*.md

# 3. Verify dependencies
grep "前置依赖" docs/stories/active/story-XXX-*.md
```

### 2. Follow Story's Tech Plan Exactly

- ✅ Implement steps in order
- ✅ Use the exact libraries specified
- ✅ Follow the code structure shown in examples
- ❌ Don't deviate without discussing with user

### 3. Mandatory File Operations

**After completing an Objective**:

```bash
# Update Story file checkbox
sed -i '' 's/- \[ \] Objective X/- [x] Objective X/' docs/stories/active/story-XXX-*.md
```

**When encountering issues**:

```markdown
## 8. Notes & Learnings

### 遇到的坑

- Issue description...

### 解决方案

- Solution...
```

### 4. Code Quality Checks (Before Marking Story Complete)

```bash
# Run all checks
pnpm lint           # ESLint
pnpm tsc --noEmit   # TypeScript
pnpm test           # Unit tests
pnpm build          # Production build
```

### 5. When Stuck or Unsure

- 🔍 Search for similar implementations in completed Stories
- 📖 Refer back to PRD.md or TECH_STACK.md
- 💬 Ask user for clarification
- ❌ Never guess or make assumptions about requirements

---

## Quick Reference: Core Entities (Prisma Models)

```typescript
// User system
User: (id(UUID),
  email,
  username,
  role(STUDENT | TEACHER | ADMIN),
  avatar,
  grade)

// Course structure
Subject: (id,
  name('数学' | '物理' | '化学' | '英语' | '语文' | '生物'),
  icon,
  order)
Chapter: (id, subjectId, parentId(self - ref), title, order)
Lesson: (id,
  chapterId,
  title,
  type(VIDEO | DOCUMENT | EXERCISE),
  videoUrl,
  content,
  duration)

// Learning tracking
UserProgress: (id,
  userId,
  lessonId,
  progress(0 - 100),
  isCompleted,
  lastPosition)

// Question bank
Question: (id,
  chapterId,
  type(SINGLE_CHOICE | MULTIPLE_CHOICE | FILL_BLANK | ESSAY),
  difficulty(1 - 5),
  content(Markdown + LaTeX),
  options(JSON),
  answer(JSON),
  explanation)
UserAttempt: (id, userId, questionId, userAnswer(JSON), isCorrect, createdAt)
ErrorBook: (id, userId, questionId, masteryLevel(0 - 3), createdAt, updatedAt)

// Community
Post: (id, authorId, title, content, subjectId, likeCount, createdAt)
Comment: (id, postId, authorId, content, createdAt)

// Gamification
LeaderboardEntry: (id,
  userId,
  score,
  rank,
  period(WEEKLY | MONTHLY | ALL_TIME),
  weekStart)
```

---

## Development Time Estimates

**Total Estimated**: 108-142 hours for MVP (Phases 1-5)
**With AI Assistance**: ~60-90 hours (40% speedup)

**Critical Path**: 001 → 002 → 003 → 006 → 007 → 009 → 017 → 018
**Critical Path Time**: 44-60 hours

See `docs/stories/README.md` for detailed breakdown and parallel development suggestions.

---

## Common Commands Reference

### Development

```bash
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm lint:fix         # Auto-fix linting issues
pnpm format           # Run Prettier
```

### Database

```bash
npx prisma generate           # Generate Prisma Client
npx prisma db push            # Push schema (dev)
npx prisma migrate dev        # Create migration
npx prisma migrate deploy     # Apply migration (prod)
npx prisma studio             # Open Prisma Studio
pnpm db:seed                  # Run seed script
```

### Testing

```bash
pnpm test                     # Run all tests
pnpm test:watch               # Watch mode
pnpm test:coverage            # Coverage report
```

### Deployment

```bash
vercel                        # Deploy to preview
vercel --prod                 # Deploy to production
```

---

## Emergency Procedures

### If Database Schema Breaks

See Story-002 "Rollback Plan" section:

```bash
# Reset database (DEV ONLY)
npx prisma db push --force-reset

# Restore from backup (PROD)
# Supabase Dashboard → Database → Backups → Restore
```

### If Authentication Breaks

See Story-003 "Rollback Plan" section:

```bash
# Check Trigger status
SELECT tgname, tgenabled FROM pg_trigger WHERE tgname = 'on_auth_user_created';

# Manually sync users if needed
INSERT INTO public.users (id, email, created_at, updated_at)
SELECT id, email, created_at, updated_at FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users);
```

### If Deployment Fails

```bash
# Rollback to previous version
vercel rollback

# Check deployment logs
vercel logs
```

---

## Final Checklist Before Starting Development

- [ ] Read `docs/stories/README.md` (dependency graph)
- [ ] Read `docs/stories/QUICK_START.md` (developer guide)
- [ ] Read `docs/PRD.md` (product requirements)
- [ ] Read `docs/TECH_STACK.md` (architecture)
- [ ] Select first Story (recommend: Story-001)
- [ ] Execute "Start Story-XXX" protocol
- [ ] Begin implementation following Tech Plan

---

**🚀 Ready to start? Execute: "Start Story-001"**
