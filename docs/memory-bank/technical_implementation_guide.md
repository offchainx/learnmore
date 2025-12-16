# 技术实现指南 (Technical Implementation Guide)

**版本**: v2.0
**最后更新**: 2025-12-13
**适用范围**: Phase 6-9 (Landing Page + AI创新功能 + 社交竞技)

---

## 📋 目录

1. [技术栈总览](#技术栈总览)
2. [标准实现模式](#标准实现模式)
3. [数据库Schema设计](#数据库schema设计)
4. [Server Actions规范](#server-actions规范)
5. [组件开发规范](#组件开发规范)
6. [性能优化指南](#性能优化指南)
7. [测试策略](#测试策略)

---

## 🛠️ 技术栈总览

### 核心框架
```json
{
  "framework": "Next.js 14.2+",
  "runtime": "Node.js 20+",
  "package-manager": "pnpm 8+",
  "typescript": "5.8+",
  "react": "19.2+"
}
```

### 已集成的关键库
```json
{
  "database": {
    "orm": "@prisma/client ^6.4.0",
    "provider": "PostgreSQL (Supabase)"
  },
  "authentication": {
    "provider": "Supabase Auth",
    "client": "@supabase/supabase-js"
  },
  "ui": {
    "styling": "Tailwind CSS ^3.4+",
    "components": "Shadcn/ui (Radix UI)",
    "icons": "lucide-react"
  },
  "state": {
    "client-state": "Zustand (lightweight)",
    "server-state": "Next.js Server Actions"
  },
  "charts": {
    "library": "Recharts",
    "use-case": "学习统计图表"
  }
}
```

### 待添加的库 (Phase 6-9)
```bash
# 动画库
pnpm add framer-motion
pnpm add lottie-react

# 轮播/滑动
pnpm add embla-carousel-react

# 数字滚动动画
pnpm add react-countup

# 倒计时
pnpm add react-countdown

# 数据可视化 (知识图谱)
pnpm add d3 @types/d3
# 或
pnpm add cytoscape @types/cytoscape

# PDF生成
pnpm add jspdf

# Google Analytics
pnpm add react-ga4

# 粒子效果 (可选)
pnpm add react-particle-effect-button

# Three.js (虚拟实验室)
pnpm add three @react-three/fiber @react-three/drei
```

---

## 🎯 标准实现模式

### 模式1: Server Action数据操作 (基于 `progress.ts`)

**文件位置**: `/src/actions/`

**标准模板**:
```typescript
'use server';

import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function yourActionName(params: YourParams) {
  // 1. 身份验证
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: authError?.message || 'Unauthorized' };
  }

  const userId = user.id;

  // 2. 数据验证 (使用Zod)
  const validatedData = YourSchema.safeParse(params);
  if (!validatedData.success) {
    return { success: false, error: 'Invalid input' };
  }

  // 3. 数据库操作 (Prisma)
  try {
    const result = await prisma.yourModel.upsert({
      where: { /* unique constraint */ },
      update: { /* update fields */ },
      create: { /* create fields */ },
    });

    // 4. 缓存刷新
    revalidatePath('/your/page/path');

    // 5. 返回标准化结果
    return { success: true, data: result };
  } catch (error) {
    console.error('Action failed:', error);
    return { success: false, error: 'Operation failed' };
  }
}
```

**关键点**:
- ✅ 必须使用 `'use server'` 指令
- ✅ 必须验证用户身份 (Supabase Auth)
- ✅ 必须使用Prisma操作数据库 (不直接写SQL)
- ✅ 必须使用try-catch包裹数据库操作
- ✅ 返回统一的 `{ success, data?, error? }` 格式
- ✅ 数据变更后调用 `revalidatePath`

---

### 模式2: Server Component数据获取

**文件位置**: `/app/(your-route)/page.tsx`

```typescript
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';

export default async function YourPage() {
  // 1. 获取用户
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // 2. 并行获取数据 (使用Promise.all)
  const [data1, data2] = await Promise.all([
    prisma.model1.findMany({ where: { userId: user.id } }),
    prisma.model2.findMany({ where: { userId: user.id } }),
  ]);

  return (
    <div>
      {/* 渲染数据 */}
    </div>
  );
}

// 3. 配置缓存策略
export const revalidate = 3600; // ISR: 1小时重新生成
```

---

### 模式3: Client Component交互

**文件位置**: `/app/(your-route)/_components/YourComponent.tsx`

```typescript
'use client';

import { useState, useTransition } from 'react';
import { yourActionName } from '@/actions/your-action';
import { toast } from 'sonner'; // 或使用Shadcn toast

export function YourComponent({ initialData }: Props) {
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState(initialData);

  const handleAction = () => {
    startTransition(async () => {
      const result = await yourActionName({ /* params */ });

      if (result.success) {
        setData(result.data);
        toast.success('操作成功');
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <button onClick={handleAction} disabled={isPending}>
      {isPending ? '处理中...' : '提交'}
    </button>
  );
}
```

---

## 🗄️ 数据库Schema设计

### 新增Schema (Phase 6-9)

#### 1. 定价套餐表 (用于Landing Page)
```prisma
// prisma/schema.prisma

model PricingTier {
  id          String   @id @default(uuid())
  name        String   // "免费体验版" | "标准版" | "旗舰版"
  slug        String   @unique // "free" | "standard" | "premium"
  price       Decimal  // 0 | 199 | 499
  period      String   // "month" | "year"
  features    Json     // { feature_id: included/limit }
  highlighted Boolean  @default(false)
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("pricing_tiers")
}

model PricingFeature {
  id          String   @id @default(uuid())
  name        String
  description String?
  category    String   // "core" | "ai" | "gamification"
  order       Int      @default(0)

  @@map("pricing_features")
}
```

#### 2. AI诊断报告表
```prisma
model AIReport {
  id              String   @id @default(uuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  reportType      String   // "weekly" | "monthly"
  periodStart     DateTime
  periodEnd       DateTime

  // 知识点掌握度 (JSON格式)
  knowledgeMap    Json     // { "数学-二次函数": 85, "物理-力学": 72, ... }

  // AI分析文本
  aiInsights      String   // "本周物理【力学分析】提升27%..."
  weaknesses      Json     // ["数学-二次函数", "化学-方程式配平"]
  recommendations Json     // ["建议加强【二次函数】专项练习"]

  // 对比数据
  percentileRank  Int      // 超过同年级X%的学生

  // 状态
  status          String   // "generating" | "ready" | "failed"
  pdfUrl          String?  // 生成的PDF报告URL

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([userId, periodStart])
  @@index([userId, createdAt])
  @@map("ai_reports")
}
```

#### 3. 家长监管表
```prisma
model ParentDashboard {
  id              String   @id @default(uuid())
  parentId        String   // 家长用户ID
  parent          User     @relation("ParentOf", fields: [parentId], references: [id])
  studentId       String   // 学生用户ID
  student         User     @relation("StudentOf", fields: [studentId], references: [id])

  // 监管权限
  canViewReports  Boolean  @default(true)
  canSetGoals     Boolean  @default(true)
  canViewProgress Boolean  @default(true)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([parentId, studentId])
  @@map("parent_dashboards")
}

model WishlistGoal {
  id              String   @id @default(uuid())
  studentId       String
  student         User     @relation(fields: [studentId], references: [id], onDelete: Cascade)

  title           String   // "月考数学90分"
  description     String?
  reward          String   // "周末游乐园"

  targetType      String   // "score" | "time" | "tasks"
  targetValue     Decimal  // 90 (分数) | 20 (小时) | 10 (任务数)
  currentValue    Decimal  @default(0)

  status          String   // "active" | "completed" | "expired"
  deadline        DateTime?

  createdAt       DateTime @default(now())
  completedAt     DateTime?

  @@index([studentId, status])
  @@map("wishlist_goals")
}
```

#### 4. 段位系统表
```prisma
enum Tier {
  BRONZE
  SILVER
  GOLD
  PLATINUM
  DIAMOND
  MASTER
}

model UserRank {
  id              String   @id @default(uuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  subjectId       String
  subject         Subject  @relation(fields: [subjectId], references: [id])

  tier            Tier     @default(BRONZE)
  stars           Int      @default(0)  // 0-5星
  totalXP         Int      @default(0)

  season          String   // "2025-Q1"

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([userId, subjectId, season])
  @@index([subjectId, tier, totalXP])
  @@map("user_ranks")
}

model RankConfig {
  id              String   @id @default(uuid())
  tier            Tier
  minXP           Int      // 晋级所需最低XP
  rewards         Json     // { "avatar_frame": "gold_frame.png", ... }

  @@unique([tier])
  @@map("rank_configs")
}
```

#### 5. 每日任务表
```prisma
enum TaskType {
  COMPLETE_LESSONS
  SOLVE_QUESTIONS
  HELP_OTHERS
  CONSECUTIVE_LOGIN
}

model DailyTask {
  id              String   @id @default(uuid())
  taskType        TaskType
  title           String   // "完成3道练习题"
  description     String?
  targetCount     Int      @default(1)
  rewardXP        Int
  rewardCoins     Int      @default(0)

  isActive        Boolean  @default(true)

  @@map("daily_tasks")
}

model UserTaskProgress {
  id              String   @id @default(uuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  taskId          String
  task            DailyTask @relation(fields: [taskId], references: [id])

  currentCount    Int      @default(0)
  isCompleted     Boolean  @default(false)
  date            DateTime @default(now()) @db.Date

  completedAt     DateTime?

  @@unique([userId, taskId, date])
  @@index([userId, date])
  @@map("user_task_progress")
}

model ConsecutiveLogin {
  id              String   @id @default(uuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  currentStreak   Int      @default(0)
  longestStreak   Int      @default(0)
  lastLoginDate   DateTime @db.Date

  @@map("consecutive_logins")
}
```

#### 6. 组队与PK表
```prisma
model Team {
  id              String   @id @default(uuid())
  name            String
  captainId       String
  captain         User     @relation("TeamCaptain", fields: [captainId], references: [id])

  members         TeamMember[]
  challenges      TeamChallenge[]

  totalXP         Int      @default(0)
  rank            Int?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@map("teams")
}

model TeamMember {
  id              String   @id @default(uuid())
  teamId          String
  team            Team     @relation(fields: [teamId], references: [id], onDelete: Cascade)
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  contribution    Int      @default(0)  // 个人贡献XP
  joinedAt        DateTime @default(now())

  @@unique([teamId, userId])
  @@map("team_members")
}

model TeamChallenge {
  id              String   @id @default(uuid())
  teamId          String
  team            Team     @relation(fields: [teamId], references: [id], onDelete: Cascade)

  title           String   // "攻克100道物理题"
  targetCount     Int      // 100
  currentCount    Int      @default(0)

  status          String   // "active" | "completed" | "failed"
  deadline        DateTime

  reward          Json     // { "team_title": "物理天团", "xp": 1000 }

  createdAt       DateTime @default(now())
  completedAt     DateTime?

  @@map("team_challenges")
}

model PKSession {
  id              String   @id @default(uuid())
  player1Id       String
  player1         User     @relation("PKPlayer1", fields: [player1Id], references: [id])
  player2Id       String
  player2         User     @relation("PKPlayer2", fields: [player2Id], references: [id])

  questionSetId   String   // 题目集ID

  // 实时状态
  player1Progress Int      @default(0)
  player2Progress Int      @default(0)
  player1Score    Int      @default(0)
  player2Score    Int      @default(0)

  winnerId        String?

  status          String   // "waiting" | "in_progress" | "completed"

  startedAt       DateTime?
  completedAt     DateTime?
  createdAt       DateTime @default(now())

  @@index([status, createdAt])
  @@map("pk_sessions")
}
```

---

## ⚡ Server Actions规范

### 命名规范
```typescript
// ✅ Good
export async function updateUserProfile(...)
export async function submitQuizAnswer(...)
export async function generateAIReport(...)

// ❌ Bad
export async function update(...)  // 太泛化
export async function handleSubmit(...)  // handle前缀不清晰
```

### 错误处理最佳实践
```typescript
'use server';

import { z } from 'zod';

const InputSchema = z.object({
  lessonId: z.string().uuid(),
  progress: z.number().min(0).max(100),
});

export async function updateProgress(input: z.infer<typeof InputSchema>) {
  // 1. 验证输入
  const validation = InputSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: 'Invalid input',
      details: validation.error.errors
    };
  }

  // 2. 验证身份
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  // 3. 数据库操作 (带事务)
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 多个操作可以放在事务中
      const progress = await tx.userProgress.upsert({ /* ... */ });
      const xpGained = await tx.user.update({ /* ... */ });
      return { progress, xpGained };
    });

    revalidatePath(`/course/${input.lessonId}`);

    return { success: true, data: result };
  } catch (error) {
    // 4. 详细日志 (仅服务端)
    console.error('[updateProgress] Failed:', {
      userId: user.id,
      lessonId: input.lessonId,
      error: error instanceof Error ? error.message : error,
    });

    return { success: false, error: 'Database operation failed' };
  }
}
```

### 性能优化技巧
```typescript
// ❌ Bad: N+1查询问题
export async function getUserStats(userId: string) {
  const lessons = await prisma.lesson.findMany();
  const progress = await Promise.all(
    lessons.map(l => prisma.userProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId: l.id } }
    }))
  );
}

// ✅ Good: 使用include/select优化
export async function getUserStats(userId: string) {
  const progress = await prisma.userProgress.findMany({
    where: { userId },
    include: {
      lesson: {
        select: { id: true, title: true, duration: true }
      }
    }
  });
}
```

---

## 🎨 组件开发规范

### 文件组织
```
/app/(marketing)/
  ├── page.tsx                    // 路由页面(Server Component)
  ├── layout.tsx                  // 布局
  └── _components/                // 私有组件
      ├── HeroSection.tsx
      ├── PricingTable/
      │   ├── index.tsx           // 导出组件
      │   ├── PricingCard.tsx     // 子组件
      │   └── types.ts            // 类型定义
      └── ui/                     // 通用UI组件
          ├── AnimatedCounter.tsx
          └── ParallaxSection.tsx
```

### TypeScript类型定义
```typescript
// _components/PricingTable/types.ts
export interface PricingTier {
  id: string;
  name: string;
  price: number;
  features: PricingFeature[];
  highlighted?: boolean;
}

export interface PricingFeature {
  name: string;
  included: boolean | string;
  tooltip?: string;
}

// index.tsx
import type { PricingTier } from './types';

export function PricingTable({ tiers }: { tiers: PricingTier[] }) {
  // ...
}
```

### Framer Motion动画规范
```typescript
'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export function ParallaxSection({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <motion.div
      ref={ref}
      style={{ opacity, y }}
      className="..."
    >
      {children}
    </motion.div>
  );
}

// 预设动画variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

export function AnimatedCard() {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={fadeInUp}
    >
      {/* content */}
    </motion.div>
  );
}
```

---

## 🚀 性能优化指南

### 1. 图片优化
```typescript
import Image from 'next/image';

// ✅ Good
<Image
  src="/hero-background.jpg"
  alt="Hero background"
  width={1920}
  height={1080}
  priority  // 首屏图片
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>

// 非首屏图片
<Image
  src="/feature-demo.png"
  alt="Feature demo"
  width={800}
  height={600}
  loading="lazy"
  quality={85}
/>
```

### 2. 字体优化
```typescript
// app/layout.tsx
import { Inter, Noto_Sans_SC } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto-sans-sc',
  weight: ['400', '500', '700'],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={`${inter.variable} ${notoSansSC.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
```

### 3. 代码分割
```typescript
// ✅ Good: 动态导入非首屏组件
import dynamic from 'next/dynamic';

const PricingTable = dynamic(() => import('./_components/PricingTable'), {
  loading: () => <PricingTableSkeleton />,
  ssr: false,  // 如果不需要SSR
});

const KnowledgeGraphDemo = dynamic(
  () => import('./_components/KnowledgeGraphDemo'),
  { ssr: false }  // Canvas/Three.js组件通常关闭SSR
);
```

### 4. 数据预取
```typescript
// app/(marketing)/page.tsx
export async function generateMetadata() {
  // 在metadata生成时就预取数据
  const subjects = await prisma.subject.findMany();
  return {
    title: `LearnMore - 覆盖${subjects.length}大学科`,
    // ...
  };
}

export default async function LandingPage() {
  // 并行获取数据
  const [subjects, stats, testimonials] = await Promise.all([
    prisma.subject.findMany({ take: 6 }),
    getGlobalStats(),  // 封装的统计函数
    prisma.testimonial.findMany({ take: 3, where: { featured: true } }),
  ]);

  return (
    <>
      <HeroSection />
      <SubjectsSection subjects={subjects} />
      <StatsSection stats={stats} />
      <TestimonialsSection testimonials={testimonials} />
    </>
  );
}

// 配置ISR
export const revalidate = 3600;  // 1小时重新生成
```

---

## ✅ 测试策略

### 单元测试 (Vitest)
```typescript
// actions/__tests__/ai-report.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { generateAIReport } from '../ai-report';
import { mockUser, mockPrisma } from '@/tests/mocks';

describe('generateAIReport', () => {
  beforeEach(() => {
    mockPrisma.reset();
  });

  it('should generate weekly report for user', async () => {
    mockUser({ id: 'user-1' });
    mockPrisma.userAttempt.findMany.mockResolvedValue([/* mock data */]);

    const result = await generateAIReport('user-1', 'weekly');

    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('knowledgeMap');
    expect(result.data.aiInsights).toContain('本周');
  });

  it('should return error if user not found', async () => {
    mockUser(null);

    const result = await generateAIReport('invalid-user', 'weekly');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Unauthorized');
  });
});
```

### 集成测试 (Playwright)
```typescript
// e2e/landing-page.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should display hero section and CTA', async ({ page }) => {
    await page.goto('/');

    // 检查Hero区域
    const heroTitle = page.locator('h1');
    await expect(heroTitle).toContainText('AI私教');

    // 检查CTA按钮
    const ctaButton = page.locator('button:has-text("免费试用7天")');
    await expect(ctaButton).toBeVisible();

    // 点击CTA跳转注册页
    await ctaButton.click();
    await expect(page).toHaveURL('/register');
  });

  test('should scroll to pricing section and display pricing table', async ({ page }) => {
    await page.goto('/');

    // 滚动到定价区域
    await page.locator('#pricing-section').scrollIntoViewIfNeeded();

    // 检查定价表
    const pricingCards = page.locator('[data-testid="pricing-card"]');
    await expect(pricingCards).toHaveCount(3);

    // 检查"标准版"被highlight
    const standardCard = page.locator('[data-tier="standard"]');
    await expect(standardCard).toHaveClass(/highlighted/);
  });
});
```

### 性能测试 (Lighthouse CI)
```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: pnpm build
      - run: pnpm lighthouse:ci
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

```json
// lighthouserc.json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:3000/"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:seo": ["error", { "minScore": 0.95 }],
        "first-contentful-paint": ["error", { "maxNumericValue": 1500 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }]
      }
    }
  }
}
```

---

## 📦 部署清单

### Vercel环境变量
```bash
# 生产环境
NEXT_PUBLIC_SUPABASE_URL=your-production-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=your-production-database-url

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_HOTJAR_ID=your-hotjar-id

# API Keys
GEMINI_API_KEY=your-gemini-api-key
GOOGLE_CLOUD_TTS_API_KEY=your-tts-api-key
```

### 构建优化
```javascript
// next.config.js
module.exports = {
  compress: true,  // 启用Gzip压缩
  swcMinify: true,  // 使用SWC压缩
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },
  experimental: {
    optimizeCss: true,  // CSS优化
    optimizePackageImports: ['framer-motion', 'lucide-react'],
  },
};
```

---

**文档维护者**: AI开发团队
**反馈渠道**: 项目Issue区
