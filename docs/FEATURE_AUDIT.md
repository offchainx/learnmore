# LearnMore v1.0 - 功能架构审计文档

**目的**: 系统性检查所有Sidebar功能，验证架构范式一致性，识别重复开发和不完整实现

**审计日期**: 2026-02-06

**架构范式**: 5层架构模式

---

## 📁 已审计文件清单

**目的**: 追踪所有已审计过的文件，审计完成后可以对比 `src/` 目录找出未使用的文件

### 文件树（按功能分组）

```
src/
├── components/
│   ├── business/
│   │   └── AppSidebar.tsx ✅ (入口点 - 所有功能共享)
│   ├── dashboard/
│   │   ├── DashboardClient.tsx ✅ (Dashboard - 路由控制器)
│   │   ├── DashboardHome.tsx ✅ (Dashboard - 主页UI)
│   │   ├── Widgets.tsx ✅ (Dashboard - DailyInspiration组件)
│   │   ├── DailyMissions.tsx ✅ (Dashboard - 今日任务)
│   │   └── SectionViews.tsx ✅ (共享 - barrel export)
│   ├── courses/
│   │   ├── CoursesView.tsx ✅ (Courses - 主视图)
│   │   └── LessonPlayer.tsx ✅ (Courses - 课程播放器)
│   ├── dashboard/
│   │   └── views/
│   │       └── CommunityView.tsx ✅ (Community - 主视图)
│   ├── shared/
│   │   └── data.tsx ✅ (共享 - Mock数据)
│   ├── layout/
│   │   └── dashboard-layout.tsx ✅ (共享 - Dashboard布局)
│   └── ui/
│       ├── button.tsx ✅ (共享UI组件)
│       └── card.tsx ✅ (共享UI组件)
├── app/
│   └── (dashboard)/
│       └── dashboard/
│           ├── page.tsx ✅ (Dashboard页面层)
│           ├── courses/
│           │   ├── page.tsx ✅ (Courses页面层)
│           │   └── client-wrapper.tsx ✅ (Courses包装器)
│           └── community/
│               ├── page.tsx ✅ (Community页面层)
│               └── client-wrapper.tsx ✅ (Community包装器)
├── actions/
│   ├── dashboard.ts ✅ (Dashboard逻辑层)
│   ├── community.ts ✅ (Community逻辑层)
│   └── profile.ts ✅ (共享 - getProfile)
├── providers/
│   └── app-provider.tsx ✅ (共享 - 翻译上下文)
└── lib/
    └── prisma.ts ✅ (共享 - 数据库连接)
```

**统计**:
- 已审计文件: 41
- 待审计: ~477+ (预估)
- 审计进度: 7.9%

**⚠️ 发现的重复/废弃文件**:
- ❌ `app/(dashboard)/dashboard/DashboardClient.tsx` (282行) - 从未被使用
- ❌ `components/business/DailyInspiration.tsx` - 与 `components/dashboard/Widgets.tsx` 重复
- ❌ `components/dashboard/DailyInspiration.tsx` - 与 `components/dashboard/Widgets.tsx` 重复（第2个）
- ❌ `components/business/SubjectCard.tsx` - Dashboard不使用此组件
- ❌ `components/business/charts/DashboardCharts.tsx` - 需确认是否被使用
- ✅ `components/dashboard/views/QuestionBankView/` - 已迁移到 `components/practice/PracticeView/`
- ✅ `components/dashboard/CommunityView.tsx` - 已移动到 `__deprecated__/CommunityView.OLD.tsx` (使用Mock数据的旧版本)

**🔍 审计策略说明**:
本文档采用**功能导向审计**，而非**文件夹导向审计**。

- ✅ **Dashboard 功能审计**: 只审计 Dashboard 实际使用的文件
- ⏳ **其他功能**: CommunityView, MyCoursesView 等视图组件属于其他功能，将在审计对应功能时标记
- ⏳ **共享组件**: CircularProgress, SidebarItem 等需要单独审计确定归属

详细分析见: `docs/COMPONENT_DUPLICATION_ANALYSIS.md`

---

## 📋 审计进度总览

| 功能模块 | 状态 | 架构合规 | 重复开发 | 备注 |
|---------|------|----------|----------|------|
| ✅ Dashboard | 已完成 | ✅ PASS | ❌ 无 | 完全符合5层架构 |
| ✅ Courses | 已完成 | ✅ PASS | ❌ 无 | 已迁移到 components/courses/ |
| ✅ Practice (Question Bank) | 已完成 | ✅ PASS | ❌ 无 | 已迁移到 components/practice/ |
| ✅ Leaderboard | 已完成 | ✅ PASS | ❌ 无 | 已迁移到 components/leaderboard/, 详见audit报告 |
| ✅ Community | 已完成 | ✅ PASS | ⚠️ 1个废弃 | 单文件组件，位于 views/ 目录 |
| ✅ Settings | 已完成 | ✅ PASS | ⚠️ 2个废弃 | 主视图+子组件，目录结构规范 |
| ✅ Admin Panel | 已完成 | ✅ PASS | ❌ 无 | 多功能模块，无重复组件 |

**注**: Notification、Payment 等其他功能将在主要功能审计完成后处理

---

## 🏗️ 标准5层架构范式

```
Entry Point (入口)
    ↓
Route (路由)
    ↓
Page Layer (页面层 - Server Component)
    ↓
Component Layer (组件层 - Client Component)
    ↓
Logic Layer (逻辑层 - Server Actions)
```

---

## 1️⃣ Dashboard (仪表盘主页)

### ✅ 审计状态: 已完成 | 架构合规: ✅ PASS | 重复开发: ❌ 无

### 5层架构分析

#### 1. Entry Point (入口)
**文件**: `src/components/business/AppSidebar.tsx`
```typescript
// Line 24
{ title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }
```

#### 2. Route (路由)
**路径**: `/dashboard`
**对应**: Next.js App Router 自动路由

#### 3. Page Layer (页面层 - Server Component)
**文件**: `src/app/(dashboard)/dashboard/page.tsx` (70 lines)

**职责**:
- ✅ 身份验证检查 (`getProfile()`)
- ✅ 数据预取 (`getDashboardStats()`)
- ✅ 特殊场景处理 (账号同步错误)
- ✅ 数据传递给Client Component

**关键代码**:
```typescript
// Line 1: 导入的是 components/dashboard/DashboardClient (路由控制器)
import { DashboardClient } from '@/components/dashboard/DashboardClient';

export default async function DashboardPage() {
  const profile = await getProfile();
  if (!profile) {
    // 特殊场景: 账号同步错误处理
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      return <AccountSyncErrorPage />
    }
    redirect('/login');
  }

  const dashboardData = await getDashboardStats();
  // 传递给 DashboardClient (路由控制器)
  return <DashboardClient user={profile} initialData={dashboardData} />;
}
```

**设计模式**: ✅ Client Wrapper Pattern (Server Component包裹Client Component并传递数据)

#### 4. Component Layer (组件层 - Client Component)

**⚠️ 架构说明**: Dashboard 使用了两层 Client Component 架构

##### 4.1 路由控制器层
**文件**: `src/components/dashboard/DashboardClient.tsx` (108 lines)

**职责**:
- ✅ 多视图路由管理 (dashboard, courses, questionBank, leaderboard, community, settings)
- ✅ 根据 user.role 控制访问权限 (PARENT 只能访问 ParentDashboardView)
- ✅ 导航事件处理 (router.push)
- ✅ 视图切换逻辑 (useState<View>)

**关键代码**:
```typescript
// Line 85: 当 currentView = 'dashboard' 时，渲染 DashboardHome
case 'dashboard':
  return <DashboardHome navigate={router.push} onViewChange={handleViewChange} initialData={initialData} user={user} />;
```

##### 4.2 Dashboard UI 层
**文件**: `src/components/dashboard/DashboardHome.tsx` (249 lines)

**职责**:
- ✅ Dashboard 主页 UI 渲染
- ✅ 数据展示（无客户端状态管理，纯展示）
- ✅ 响应式设计 (移动端/桌面端)
- ✅ 暗黑模式支持

**页面结构** (4行布局):
```
DashboardHome
├── Row 1: 今日任务 + 每日灵感
│   ├── DailyMissions (Line 48)
│   └── DailyInspiration (Line 52, from Widgets.tsx)
├── Row 2: 统计数据卡片 (内联JSX)
│   ├── Group A: 学习时间、连胜、等级 (Line 65-80)
│   └── Group B: 答题数、正确率、错题数 (Line 83-98)
├── Row 3: 学科进度 + 年级排名
│   ├── Subject Progress (Line 105-142, 内联JSX)
│   └── Rank Card (Line 145-170, 内联JSX)
└── Row 4: 学习路径 + 弱点狙击
    ├── Learning Path (Line 176-207, 内联JSX)
    └── Weakness Sniper (Line 210-244, 内联JSX)
```

**❌ 不使用的组件**:
- SubjectCard (学科卡片) - Dashboard 无此功能
- DashboardCharts (统计图表) - 未在 DashboardHome 中使用

#### 5. Logic Layer (逻辑层 - Server Actions)
**文件**: `src/actions/dashboard.ts`

**核心函数**: `getDashboardStats()`

**数据聚合**:
```typescript
'use server'
export async function getDashboardStats(): Promise<DashboardData | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  // 1. 统计数据聚合
  const stats = await prisma.userAttempt.aggregate({
    where: { userId: user.id },
    _count: { id: true },
    _avg: { isCorrect: true }
  });

  // 2. 学科数据查询
  const subjects = await prisma.subject.findMany({
    include: { chapters: true }
  });

  // 3. 每日任务确保存在
  const dailyTasks = await ensureDailyTasks(user.id);

  // 4. 近期活动
  const recentActivity = await prisma.userAttempt.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  return {
    stats: { studyTime, questionsAnswered, accuracy, mistakeCount },
    streak,
    level,
    xp,
    subjects,
    dailyTasks,
    recentActivity
  };
}
```

**数据库操作**:
- ✅ Prisma ORM (类型安全)
- ✅ 聚合查询 (aggregate)
- ✅ 关联查询 (include)
- ✅ 事务处理 (ensureDailyTasks内部)

---

### 数据流图

```
用户点击Sidebar "Dashboard"
    ↓
Next.js 路由: /dashboard
    ↓
DashboardPage (Server Component, app/(dashboard)/dashboard/page.tsx)
    ├── getProfile() → 检查用户身份
    └── getDashboardStats() → 聚合数据
        ├── prisma.userAttempt.aggregate()
        ├── prisma.subject.findMany()
        ├── ensureDailyTasks()
        └── prisma.userAttempt.findMany()
    ↓
数据传递给 DashboardClient (props)
    ↓
DashboardClient (components/dashboard/DashboardClient.tsx - 路由控制器)
    └── 根据 currentView = 'dashboard' 渲染
    ↓
DashboardHome (components/dashboard/DashboardHome.tsx - UI层)
    ├── Row 1: DailyMissions + DailyInspiration (from Widgets.tsx)
    ├── Row 2: 统计数据卡片 (内联JSX)
    ├── Row 3: Subject Progress + Rank Card (内联JSX)
    └── Row 4: Learning Path + Weakness Sniper (内联JSX)
```

---

### 完整文件依赖树

```
Dashboard 功能涉及的所有文件:

src/
├── components/
│   ├── business/
│   │   └── AppSidebar.tsx ✅ (入口点)
│   ├── dashboard/
│   │   ├── DashboardClient.tsx ✅ (路由控制器 - 108 lines)
│   │   ├── DashboardHome.tsx ✅ (Dashboard UI - 249 lines)
│   │   ├── Widgets.tsx ✅ (DailyInspiration 组件)
│   │   └── DailyMissions.tsx ✅ (今日任务组件)
│   └── ui/
│       ├── button.tsx ✅ (UI基础组件)
│       └── card.tsx ✅ (UI基础组件)
├── app/
│   └── (dashboard)/
│       └── dashboard/
│           └── page.tsx ✅ (页面层 - Server Component)
├── actions/
│   ├── dashboard.ts ✅ (Dashboard逻辑层)
│   └── profile.ts ✅ (getProfile 函数)
├── lib/
│   └── prisma.ts ✅ (数据库连接)
└── types/
    └── (DashboardData interface定义在 actions/dashboard.ts 中) ✅

已审计文件: 10

⚠️ 废弃/重复文件 (不在依赖树中):
├── app/(dashboard)/dashboard/DashboardClient.tsx ❌ (282行, 从未被使用)
├── components/business/DailyInspiration.tsx ❌ (重复)
├── components/business/SubjectCard.tsx ❌ (Dashboard不使用)
└── components/business/charts/DashboardCharts.tsx ❌ (需确认)
```

---

### 审计发现

#### ✅ 符合项
1. **架构范式一致性**: 完全符合5层架构模式
2. **Client Wrapper模式**: 正确使用Server Component包裹Client Component
3. **数据预取**: 在Server Component层完成，避免客户端瀑布流请求
4. **类型安全**: 全程TypeScript + Prisma类型推导
5. **性能优化**: 使用aggregate减少数据库查询次数
6. **错误处理**: 账号同步错误有专门的错误页面
7. **路由控制器模式**: DashboardClient 作为路由控制器，统一管理所有视图切换

#### 🔴 重大发现：重复开发问题

**问题**: 存在两套 DashboardClient 实现，导致混淆

1. ❌ **`app/(dashboard)/dashboard/DashboardClient.tsx` (282行)** - 从未被使用
   - 原因: page.tsx 导入的是 `components/dashboard/DashboardClient`
   - 影响: 占用空间，造成维护混淆
   - 处理: 移动到 `src/__deprecated__/`

2. ❌ **`components/business/DailyInspiration.tsx`** - 与 `components/dashboard/Widgets.tsx` 重复
   - 原因: Dashboard 使用的是 Widgets.tsx 中的 DailyInspiration
   - 影响: 代码重复，维护成本增加
   - 处理: 确认其他页面是否使用，如无则删除

3. ❌ **`components/business/SubjectCard.tsx`** - Dashboard 不使用此组件
   - 原因: DashboardHome 无学科卡片功能
   - 影响: 审计时产生混淆
   - 处理: 保留（可能被 My Courses 页面使用）

4. ❌ **`components/business/charts/DashboardCharts.tsx`** - 未在 DashboardHome 中使用
   - 原因: 需确认是否被其他页面引用
   - 影响: 如未使用则为冗余代码
   - 处理: 搜索引用，确认后决定保留或删除

#### ⚠️ 潜在优化点
1. **缓存策略**: 可以考虑为`getDashboardStats()`添加Redis缓存 (TTL: 5分钟)
2. **分页加载**: 近期活动目前只显示10条，未来可能需要分页
3. **数据库索引**: 确认`userAttempt.userId`和`userAttempt.createdAt`有复合索引
4. **组件提取**: Row 2-4 的内联JSX可以提取为独立组件，提升可维护性

---

## 2️⃣ Courses (课程学习)

### ✅ 审计状态: 已完成 | 架构合规: ✅ PASS | 重复开发: ❌ 无

### 5层架构分析

#### 1. Entry Point (入口)
**文件**: `src/components/business/AppSidebar.tsx`
```typescript
// Line 25
{ title: 'Courses', href: '/dashboard/courses', icon: BookOpen }
```
**说明**: 已从 "My Courses" 重命名为 "Courses"

#### 2. Route (路由)
**路径**: `/dashboard/courses`
**对应**: Next.js App Router 自动路由

#### 3. Page Layer (页面层 - Server Component)
**文件**: `src/app/(dashboard)/dashboard/courses/page.tsx` (20 lines)

**职责**:
- ✅ 身份验证检查 (`getProfile()`)
- ✅ 数据传递给 Client Component

**关键代码**:
```typescript
export default async function CoursesPage() {
  const profile = await getProfile()
  if (!profile) {
    redirect('/login')
  }
  return <CoursesClientWrapper user={profile} />
}
```

**设计模式**: ✅ Client Wrapper Pattern

#### 4. Component Layer (组件层 - Client Component)

##### 4.1 Page Wrapper层
**文件**: `src/app/(dashboard)/dashboard/courses/client-wrapper.tsx` (47 lines)

**职责**:
- ✅ 页面包装器，管理导航事件
- ✅ 使用 DashboardLayout 布局
- ✅ 传递翻译上下文 (t) 给 CoursesView

**关键代码**:
```typescript
export function CoursesClientWrapper({ user }: CoursesClientWrapperProps) {
  const router = useRouter()
  const { t } = useApp()

  return (
    <DashboardLayout currentView="courses" onNavigate={handleNavigate} userRole={user.role}>
      <CoursesView t={t} />
    </DashboardLayout>
  )
}
```

##### 4.2 Courses UI层
**文件**: `src/components/courses/CoursesView.tsx` (496 lines)

**职责**:
- ✅ Courses 主页 UI 渲染
- ✅ 3种视图模式: Curriculum (课程目录), Smart Review (智能复习), My Notebook (笔记本)
- ✅ 学科选择器 (6门学科)
- ✅ 章节管理与进度跟踪
- ✅ 课程播放器集成
- ✅ 响应式设计与暗黑模式支持

**页面结构**:
```
CoursesView
├── Subject Selector (学科选择器)
├── Hero Card (当前学科信息卡片)
├── View Mode Tabs (视图模式切换)
│   ├── Curriculum: 章节树 + 课程列表
│   ├── Smart Review: 按信心度分类的复习队列
│   └── My Notebook: 笔记/书签/高亮管理
└── Right Sidebar
    ├── Study Goal Card (学习目标)
    └── Live Class Widget (直播课提醒)
```

**子组件**:
**文件**: `src/components/courses/LessonPlayer.tsx` (约200+ lines)

**职责**:
- ✅ 课程内容播放器
- ✅ 学习进度跟踪
- ✅ 信心度评级系统
- ✅ 笔记/书签/高亮功能
- ✅ 讨论区互动

#### 5. Logic Layer (逻辑层 - Server Actions)
**状态**: ⚠️ 尚未实现，当前使用 Mock 数据

**Mock 数据源**: `src/components/shared/data.tsx`
- `subjectsData`: 6门学科的完整数据 (章节、课程、进度)
- `mockUserContent`: 用户笔记/书签/高亮的模拟数据

**未来实现**:
- `actions/courses.ts` - 课程数据查询
- `actions/progress.ts` - 学习进度更新
- `actions/notes.ts` - 笔记管理

---

### 数据流图

```
用户点击Sidebar "Courses"
    ↓
Next.js 路由: /dashboard/courses
    ↓
CoursesPage (Server Component, app/(dashboard)/dashboard/courses/page.tsx)
    ├── getProfile() → 检查用户身份
    └── 无数据预取 (当前使用 Mock 数据)
    ↓
数据传递给 CoursesClientWrapper (props)
    ↓
CoursesClientWrapper (app/(dashboard)/dashboard/courses/client-wrapper.tsx)
    ├── 包裹 DashboardLayout
    ├── 获取翻译上下文 (useApp)
    └── 传递 user 和 t
    ↓
CoursesView (components/courses/CoursesView.tsx - UI层)
    ├── Subject Selector (6门学科切换)
    ├── View Mode Tabs (Curriculum/Review/Notebook)
    ├── 动态内容渲染
    │   ├── Curriculum: 章节树 + 进度跟踪
    │   ├── Smart Review: 信心度分类 + 复习队列
    │   └── My Notebook: 笔记/书签/高亮列表
    └── LessonPlayer (点击课程时弹出)
    ↓
数据来源: components/shared/data.tsx (Mock Data)
    ├── subjectsData: 学科/章节/课程数据
    └── mockUserContent: 用户笔记/书签数据
```

---

### 完整文件依赖树

```
Courses 功能涉及的所有文件:

src/
├── components/
│   ├── business/
│   │   └── AppSidebar.tsx ✅ (入口点 - Line 25)
│   ├── courses/ ✅ NEW DIRECTORY
│   │   ├── CoursesView.tsx ✅ (主视图 - 496 lines)
│   │   └── LessonPlayer.tsx ✅ (课程播放器 - 200+ lines)
│   ├── shared/ ✅ NEW DIRECTORY
│   │   └── data.tsx ✅ (Mock数据 - 跨功能共享)
│   ├── layout/
│   │   └── dashboard-layout.tsx ✅ (布局组件)
│   └── ui/
│       ├── button.tsx ✅
│       └── card.tsx ✅
├── app/
│   └── (dashboard)/
│       └── dashboard/
│           └── courses/
│               ├── page.tsx ✅ (页面层 - Server Component - 20 lines)
│               └── client-wrapper.tsx ✅ (页面包装器 - 47 lines)
├── actions/
│   └── profile.ts ✅ (getProfile 函数)
├── providers/
│   └── app-provider.tsx ✅ (翻译上下文)
└── lib/
    └── prisma.ts ✅ (未来使用)

已审计文件: 11
⚠️ 当前使用 Mock 数据，未连接数据库

🔄 迁移记录:
├── src/components/dashboard/views/MyCoursesView.tsx
│   → src/components/courses/CoursesView.tsx ✅
├── src/components/dashboard/views/LessonPlayer.tsx
│   → src/components/courses/LessonPlayer.tsx ✅
└── src/components/dashboard/shared.tsx
    → src/components/shared/data.tsx ✅
```

---

### 审计发现

#### ✅ 符合项
1. **架构范式一致性**: 完全符合5层架构模式
2. **Client Wrapper模式**: 正确使用Server Component包裹Client Component
3. **类型安全**: 全程TypeScript类型推导
4. **响应式设计**: 支持移动端和桌面端
5. **暗黑模式支持**: 完整的dark mode实现
6. **组件模块化**: 496行的大组件，结构清晰，可维护性强
7. **用户体验优化**: 3种视图模式满足不同学习场景

#### 🟡 待优化项
1. **Server Actions缺失**: 当前使用Mock数据，需要实现真实的数据库查询
   - 建议创建: `actions/courses.ts`, `actions/progress.ts`, `actions/notes.ts`
2. **Mock数据迁移**: `components/shared/data.tsx` 应迁移到数据库
3. **组件大小**: `CoursesView.tsx` (496行) 可以考虑拆分为更小的子组件
4. **缓存策略**: 未来可以为课程数据添加缓存 (SWR或React Query)
5. **进度跟踪**: 需要实现真实的学习进度持久化

#### ⚠️ 组件迁移成功
1. ✅ **目录重组完成**: 按功能垂直切分，创建 `components/courses/` 独立目录
2. ✅ **命名规范化**: "My Courses" → "Courses" 统一命名
3. ✅ **共享数据分离**: `shared.tsx` 迁移到 `components/shared/data.tsx`
4. ✅ **导入路径更新**: 所有文件导入路径已更新为新路径
5. ✅ **构建验证通过**: TypeScript检查和Next.js构建全部通过

---

## 3️⃣ Practice / Question Bank (刷题中心)

### ✅ 审计状态: 已完成 | 架构合规: ✅ PASS | 重复开发: ❌ 无

### 5层架构分析

#### 1. Entry Point (入口)
**文件**: `src/components/business/AppSidebar.tsx`
```typescript
// Line 26
{ title: 'Question Bank', href: '/dashboard/questions', icon: PenTool }
```
**✅ 已修复**: Sidebar现已统一指向 `/dashboard/practice`

#### 2. Route (路由)
**路径**: `/dashboard/practice`
**对应**: Next.js App Router 自动路由

#### 3. Page Layer (页面层 - Server Component)
**文件**: `src/app/(dashboard)/dashboard/practice/page.tsx` (20 lines)

**职责**:
- ✅ 身份验证检查 (`getProfile()`)
- ✅ 数据传递给 Client Component

**关键代码**:
```typescript
export default async function PracticePage() {
  const profile = await getProfile()
  if (!profile) {
    redirect('/login')
  }
  return <PracticeClientWrapper user={profile} />
}
```

**设计模式**: ✅ Client Wrapper Pattern

#### 4. Component Layer (组件层 - Client Component)

##### 4.1 Page Wrapper层
**文件**: `src/app/(dashboard)/dashboard/practice/client-wrapper.tsx` (47 lines)

**职责**:
- ✅ 页面包装器，管理导航事件
- ✅ 使用 DashboardLayout 布局
- ✅ 传递翻译上下文 (t) 给 PracticeView

**关键代码**:
```typescript
export function PracticeClientWrapper({ user }: PracticeClientWrapperProps) {
  const router = useRouter()
  const { t } = useApp()

  return (
    <DashboardLayout currentView="questionBank" onNavigate={handleNavigate} userRole={user.role}>
      <PracticeView t={t} userId={user.id} />
    </DashboardLayout>
  )
}
```

##### 4.2 Practice UI层
**文件**: `src/components/practice/PracticeView/index.tsx` (108 lines)
**原名**: QuestionBankView（已重命名为 PracticeView）

**职责**:
- ✅ Practice 主页 UI 渲染
- ✅ 学科选择器（6门学科）
- ✅ 3种训练模式：Smart Drill, Error Wiper, Mock Arena
- ✅ Chapter Map（章节地图）
- ✅ 学习分析侧边栏
- ✅ 响应式设计与暗黑模式支持

**页面结构**:
```
PracticeView
├── Subject Selector (学科选择器)
├── Training Mode Cards (3种训练模式)
│   ├── Smart Drill (智能刷题)
│   ├── Error Wiper (错题清除)
│   └── Mock Arena (模拟考场)
├── Chapter Map (章节地图)
│   └── ChapterCard (章节卡片)
├── Past Papers Section (历年真题)
└── Analytics Sidebar (学习分析侧边栏)
    ├── KnowledgeHive (知识蜂巢)
    ├── ExamForecast (考试预测)
    └── WeaknessCard (弱点卡片)
```

**子组件清单**:
1. **SubjectSelector.tsx** (47 lines) - 学科选择器
2. **TrainingModeCards.tsx** (65 lines) - 训练模式卡片（3种）
3. **ChapterMap/index.tsx** (93 lines) - 章节地图（分页展示）
4. **ChapterMap/ChapterCard.tsx** (70 lines) - 单个章节卡片（显示掌握度、热点、弱点标签）
5. **PastPapersSection.tsx** (36 lines) - 历年真题区域
6. **AnalyticsSidebar/index.tsx** (34 lines) - 学习分析侧边栏
7. **types.ts** (定义 DbSubject, DbChapter 类型)

**Analytics子组件**（来自 `components/practice/analytics/`）:
- **KnowledgeHive.tsx** - 知识蜂巢可视化
- **ExamForecast.tsx** - 考试预测分析
- **WeaknessCard.tsx** - 弱点识别卡片

#### 5. Logic Layer (逻辑层 - Server Actions)
**文件**:
- `src/actions/subject.ts` - `getAllSubjects()` 获取所有学科
- `src/actions/practice/data-service.ts` - `getSubjectChapters(subjectId, userId)` 获取章节数据

**核心功能**:
```typescript
// 1. 获取所有学科
const result = await getAllSubjects();

// 2. 根据学科ID获取章节（包含统计数据）
const data = await getSubjectChapters(selectedSubjectId, userId);
```

**数据库操作**:
- ✅ Prisma ORM (类型安全)
- ✅ 包含章节掌握度统计
- ✅ 包含近期答题记录
- ✅ 包含热点/弱点识别

---

### 数据流图

```
用户点击Sidebar "Question Bank"
    ↓
Next.js 路由: /dashboard/practice
    ↓
PracticePage (Server Component, app/(dashboard)/dashboard/practice/page.tsx)
    ├── getProfile() → 检查用户身份
    └── 无数据预取（客户端按需加载）
    ↓
数据传递给 PracticeClientWrapper (props)
    ↓
PracticeClientWrapper (app/(dashboard)/dashboard/practice/client-wrapper.tsx)
    ├── 包裹 DashboardLayout
    ├── 获取翻译上下文 (useApp)
    └── 传递 user 和 t
    ↓
PracticeView (components/practice/PracticeView/index.tsx - UI层)
    ├── useEffect: getAllSubjects() → 加载学科列表
    ├── useEffect: getSubjectChapters(subjectId, userId) → 加载章节数据
    ├── SubjectSelector (学科切换)
    ├── TrainingModeCards (3种训练模式)
    │   ├── Smart Drill → /dashboard/practice/smart-drill
    │   ├── Error Wiper → /dashboard/practice/error-wiper
    │   └── Mock Arena → /dashboard/practice/mock-arena
    ├── ChapterMap (章节地图)
    │   └── ChapterCard → /dashboard/practice/chapter-drill/[chapterId]
    ├── PastPapersSection (历年真题)
    └── AnalyticsSidebar (学习分析)
        ├── KnowledgeHive (知识蜂巢)
        ├── ExamForecast (考试预测)
        └── WeaknessCard (弱点卡片)
```

---

### 完整文件依赖树

```
Practice 功能涉及的所有文件:

src/
├── components/
│   ├── business/
│   │   └── AppSidebar.tsx ✅ (入口点 - Line 26)
│   ├── practice/ ✅ NEW DIRECTORY (功能垂直切分)
│   │   ├── PracticeView/ ✅ (主视图 - 从 dashboard/views 迁移)
│   │   │   ├── index.tsx ✅ (主组件 - 108 lines)
│   │   │   ├── SubjectSelector.tsx ✅ (学科选择器 - 47 lines)
│   │   │   ├── TrainingModeCards.tsx ✅ (训练模式 - 65 lines)
│   │   │   ├── ChapterMap/
│   │   │   │   ├── index.tsx ✅ (章节地图 - 93 lines)
│   │   │   │   └── ChapterCard.tsx ✅ (章节卡片 - 70 lines)
│   │   │   ├── PastPapersSection.tsx ✅ (历年真题 - 36 lines)
│   │   │   ├── AnalyticsSidebar/
│   │   │   │   ├── index.tsx ✅ (侧边栏 - 34 lines)
│   │   │   │   └── types.ts ✅
│   │   │   └── types.ts ✅
│   │   ├── analytics/ ✅ (已存在)
│   │   │   ├── KnowledgeHive.tsx ✅
│   │   │   ├── ExamForecast.tsx ✅
│   │   │   └── WeaknessCard.tsx ✅
│   │   ├── chapter-drill/ ✅ (已存在)
│   │   ├── modes/ ✅ (已存在)
│   │   ├── session/ ✅ (已存在)
│   │   └── smart-parser/ ✅ (已存在)
│   ├── dashboard/
│   │   ├── DashboardClient.tsx ✅ (引用 PracticeView)
│   │   └── SectionViews.tsx ✅ (barrel export)
│   ├── layout/
│   │   └── dashboard-layout.tsx ✅ (布局组件)
│   └── ui/
│       ├── button.tsx ✅
│       └── card.tsx ✅
├── app/
│   └── (dashboard)/
│       └── dashboard/
│           └── practice/
│               ├── page.tsx ✅ (页面层 - Server Component - 20 lines)
│               ├── client-wrapper.tsx ✅ (页面包装器 - 47 lines)
│               ├── smart-drill/
│               │   └── page.tsx ✅ (Smart Drill 子路由)
│               ├── error-wiper/
│               │   └── page.tsx ✅ (Error Wiper 子路由)
│               ├── mock-arena/
│               │   ├── page.tsx ✅ (Mock Arena 列表)
│               │   └── [examId]/
│               │       └── page.tsx ✅ (Mock Arena 考试)
│               └── chapter-drill/
│                   └── [chapterId]/
│                       └── page.tsx ✅ (Chapter Drill 子路由)
├── actions/
│   ├── subject.ts ✅ (getAllSubjects)
│   ├── practice/
│   │   └── data-service.ts ✅ (getSubjectChapters)
│   └── profile.ts ✅ (getProfile 函数)
├── providers/
│   └── app-provider.tsx ✅ (翻译上下文)
└── lib/
    ├── prisma.ts ✅ (数据库连接)
    └── practice/
        └── types.ts ✅ (ChapterWithStats 等类型)

已审计文件: 38
⚠️ 使用真实数据库查询（Prisma）

🔄 迁移记录:
src/components/dashboard/views/QuestionBankView/
    → src/components/practice/PracticeView/ ✅
├── index.tsx (QuestionBankView → PracticeView, 保留向后兼容别名)
├── SubjectSelector.tsx ✅
├── TrainingModeCards.tsx ✅
├── ChapterMap/ ✅
├── PastPapersSection.tsx ✅
├── AnalyticsSidebar/ ✅
└── types.ts ✅
```

---

### 审计发现

#### ✅ 符合项
1. **架构范式一致性**: 完全符合5层架构模式
2. **Client Wrapper模式**: 正确使用Server Component包裹Client Component
3. **类型安全**: 全程TypeScript + Prisma类型推导
4. **响应式设计**: 支持移动端和桌面端
5. **暗黑模式支持**: 完整的dark mode实现
6. **组件模块化**: 清晰的子组件拆分，可维护性强
7. **真实数据集成**: 使用Prisma查询真实数据库（与Courses的Mock数据不同）
8. **子路由完整**: 4种训练模式都有独立的子路由页面

#### 🟢 优秀设计
1. **功能垂直切分**: `components/practice/` 目录包含所有Practice相关组件（analytics, modes, session等）
2. **章节统计**: ChapterCard显示掌握度、热点、弱点标签，提供清晰的学习引导
3. **分页展示**: ChapterMap使用滚轮分页，避免长列表性能问题
4. **训练模式多样化**: 提供Smart Drill（智能刷题）、Error Wiper（错题清除）、Mock Arena（模拟考场）3种模式
5. **学习分析**: KnowledgeHive, ExamForecast, WeaknessCard提供多维度学习分析

#### ⚠️ 组件迁移成功
1. ✅ **目录重组完成**: 从 `dashboard/views/QuestionBankView` 迁移到 `practice/PracticeView`
2. ✅ **命名规范化**: "QuestionBankView" → "PracticeView" 统一命名（保留向后兼容别名）
3. ✅ **导入路径更新**: 所有文件导入路径已更新为新路径
4. ✅ **构建验证通过**: TypeScript检查和Next.js构建全部通过
5. ✅ **旧文件归档**: 旧QuestionBankView已移动到 `__deprecated__/`

#### ✅ 路由一致性问题已修复
1. **已修复**: AppSidebar已统一使用 `/dashboard/practice` 路由
   - 修改: `AppSidebar.tsx` Line 26: `/dashboard/questions` → `/dashboard/practice`
   - 状态: ✅ 路由现在完全一致
   - 验证: TypeScript + Build 全部通过

#### ⚠️ 潜在优化点
1. **缓存策略**: 可以为`getAllSubjects()`添加缓存 (SWR或React Query)
2. **章节加载优化**: `getSubjectChapters`可以考虑添加服务端缓存 (TTL: 5分钟)
3. **Past Papers功能**: 当前PastPapersSection只有Mock数据，需要连接真实数据
4. **Analytics侧边栏**: KnowledgeHive等组件需要验证数据查询性能

---

## 4️⃣ Leaderboard (排行榜)

### ✅ 审计状态: 已完成 | 架构合规: ✅ PASS | 重复开发: ❌ 无

### 5层架构分析

#### 1. Entry Point (入口)
**文件**: `src/components/business/AppSidebar.tsx`
```typescript
// Line 27
{ title: 'Leaderboard', href: '/dashboard/leaderboard', icon: Trophy }
```

#### 2. Route (路由)
**路径**: `/dashboard/leaderboard`
**对应**: Next.js App Router 自动路由

#### 3. Page Layer (页面层 - Server Component)
**文件**: `src/app/(dashboard)/dashboard/leaderboard/page.tsx` (19 lines)

**职责**:
- ✅ 身份验证检查 (`getProfile()`)
- ✅ 数据传递给 Client Component

**关键代码**:
```typescript
export default async function LeaderboardPage() {
  const profile = await getProfile()
  if (!profile) {
    redirect('/login')
  }
  return <LeaderboardClientWrapper user={profile} />
}
```

**设计模式**: ✅ Client Wrapper Pattern

#### 4. Component Layer (组件层 - Client Component)

##### 4.1 Page Wrapper层
**文件**: `src/app/(dashboard)/dashboard/leaderboard/client-wrapper.tsx` (47 lines)

**职责**:
- ✅ 页面包装器，管理导航事件
- ✅ 使用 DashboardLayout 布局
- ✅ 传递翻译上下文 (t) 给 LeaderboardView

**关键代码**:
```typescript
export function LeaderboardClientWrapper({ user }: LeaderboardClientWrapperProps) {
  const router = useRouter()
  const { t } = useApp()

  return (
    <DashboardLayout currentView="leaderboard" onNavigate={handleNavigate} userRole={user.role}>
      <LeaderboardView t={t} />
    </DashboardLayout>
  )
}
```

##### 4.2 Leaderboard UI层
**文件**: `src/components/leaderboard/LeaderboardView.tsx` (58 lines)

**职责**:
- ✅ Leaderboard 主页 UI 渲染
- ✅ 组装所有子组件
- ✅ 管理 Global/Friends 切换状态
- ✅ 响应式设计与暗黑模式支持

**页面结构**:
```
LeaderboardView
├── Header Section (The Journey & Context)
│   ├── TierRoadmap (段位路线图 - Bronze到Challenger)
│   └── SeasonBanner (赛季横幅 - Season 4: Sniper Elite)
├── Main Content Area (2列布局)
│   ├── Left Column (70% - The Arena)
│   │   ├── Podium (前三名领奖台)
│   │   └── LeaderboardList (排行榜列表 - 含Global/Friends切换)
│   └── Right Column (30% - The HUD)
│       ├── XPBreakdown (XP分布图)
│       ├── DailyQuests (每日任务)
│       └── RivalWatch (竞争对手追踪)
```

**子组件清单**:
1. **TierRoadmap.tsx** (58 lines) - 6段位进度路线图（Bronze → Challenger）
2. **SeasonBanner.tsx** (45 lines) - 赛季信息横幅（含倒计时）
3. **Podium.tsx** (76 lines) - 前三名领奖台（Gold/Silver/Bronze）
4. **LeaderboardList.tsx** (127 lines) - 排行榜列表（含Tab切换、Sticky Footer）
5. **XPBreakdown.tsx** (35 lines) - XP分布圆环图（Study/Community）
6. **DailyQuests.tsx** (64 lines) - 每日任务卡片（含进度条）
7. **RivalWatch.tsx** (37 lines) - 竞争对手追踪卡片
8. **mock-data.ts** (47 lines) - Mock数据（分离到独立文件）

#### 5. Logic Layer (逻辑层 - Server Actions)
**文件**:
- `src/actions/leaderboard.ts` - Server Actions (已实现但未集成)
- `src/lib/leaderboard/pg-adapter.ts` - PostgreSQL适配器 (Adapter Pattern)
- `src/lib/leaderboard/types.ts` - 类型定义

**核心函数**:
```typescript
// 1. 更新用户分数
export async function updateLeaderboardScore(userId: string, points: number)

// 2. 获取排行榜数据（支持WEEKLY/MONTHLY/ALL_TIME）
export async function getLeaderboard(
  period: LeaderboardPeriod = 'WEEKLY',
  limit: number = 100
): Promise<LeaderboardEntryWithUser[]>

// 3. 获取用户排名
export async function getUserRank(userId: string, period: LeaderboardPeriod = 'WEEKLY')
```

**数据库操作**:
- ✅ Prisma ORM (类型安全)
- ✅ Upsert操作（updateScore使用事务）
- ✅ 支持多时间段（周榜/月榜/总榜）
- ✅ Adapter Pattern（未来可扩展Redis）

**⚠️ 当前状态**:
- Server Actions已完整实现
- LeaderboardView**未调用**这些Actions
- 当前使用**硬编码Mock数据**

---

### 数据流图

```
用户点击Sidebar "Leaderboard"
    ↓
Next.js 路由: /dashboard/leaderboard
    ↓
LeaderboardPage (Server Component, app/(dashboard)/dashboard/leaderboard/page.tsx)
    ├── getProfile() → 检查用户身份
    └── 无数据预取（当前使用 Mock 数据）
    ↓
数据传递给 LeaderboardClientWrapper (props)
    ↓
LeaderboardClientWrapper (app/(dashboard)/dashboard/leaderboard/client-wrapper.tsx)
    ├── 包裹 DashboardLayout
    ├── 获取翻译上下文 (useApp)
    └── 传递 user 和 t
    ↓
LeaderboardView (components/leaderboard/LeaderboardView.tsx - UI层)
    ├── Header: TierRoadmap + SeasonBanner
    ├── Left Column: Podium + LeaderboardList
    │   ├── Global/Friends Tab切换
    │   ├── 排行榜列表（含Zone标识：Promotion/Safe/Demotion）
    │   └── Sticky User Footer（当前用户排名）
    └── Right Column: XPBreakdown + DailyQuests + RivalWatch
    ↓
数据来源: components/leaderboard/mock-data.ts (Mock Data)
    ├── topThree: 前三名数据
    ├── listData: 排行榜列表数据
    ├── quests: 每日任务数据
    └── seasonData: 赛季信息
```

---

### 完整文件依赖树

```
Leaderboard 功能涉及的所有文件:

src/
├── components/
│   ├── business/
│   │   └── AppSidebar.tsx ✅ (入口点 - Line 27)
│   ├── leaderboard/ ✅ NEW DIRECTORY (功能垂直切分)
│   │   ├── LeaderboardView.tsx ✅ (主视图 - 58 lines)
│   │   ├── components/ ✅ (子组件目录)
│   │   │   ├── TierRoadmap.tsx ✅ (段位路线图 - 58 lines)
│   │   │   ├── SeasonBanner.tsx ✅ (赛季横幅 - 45 lines)
│   │   │   ├── Podium.tsx ✅ (前三名领奖台 - 76 lines)
│   │   │   ├── LeaderboardList.tsx ✅ (排行榜列表 - 127 lines)
│   │   │   ├── XPBreakdown.tsx ✅ (XP分布图 - 35 lines)
│   │   │   ├── DailyQuests.tsx ✅ (每日任务 - 64 lines)
│   │   │   └── RivalWatch.tsx ✅ (竞争对手追踪 - 37 lines)
│   │   └── mock-data.ts ✅ (Mock数据 - 47 lines)
│   ├── dashboard/
│   │   ├── DashboardClient.tsx ✅ (引用 LeaderboardView)
│   │   └── SectionViews.tsx ✅ (barrel export)
│   ├── layout/
│   │   └── dashboard-layout.tsx ✅ (布局组件)
│   └── ui/
│       ├── button.tsx ✅
│       └── card.tsx ✅
├── app/
│   └── (dashboard)/
│       └── dashboard/
│           └── leaderboard/
│               ├── page.tsx ✅ (页面层 - Server Component - 19 lines)
│               └── client-wrapper.tsx ✅ (页面包装器 - 47 lines)
├── actions/
│   ├── leaderboard.ts ✅ (Server Actions - 已实现但未集成)
│   └── profile.ts ✅ (getProfile 函数)
├── lib/
│   ├── leaderboard/
│   │   ├── pg-adapter.ts ✅ (PostgreSQL适配器 - 122 lines)
│   │   └── types.ts ✅ (类型定义 - 16 lines)
│   ├── prisma.ts ✅ (数据库连接)
│   └── dynamic-imports.ts ✅ (已删除DynamicLeaderboardView)
├── providers/
│   └── app-provider.tsx ✅ (翻译上下文)
└── components/deprecated/
    └── dashboard/
        └── views/
            └── LeaderboardView.tsx ⚠️ (旧单文件组件 - 380 lines)

已审计文件: 21
⚠️ 当前使用 Mock 数据，Server Actions已实现但未集成

🔄 迁移记录:
src/components/dashboard/views/LeaderboardView.tsx (380行单文件)
    → src/components/leaderboard/ ✅ (拆分为8个文件)
    ├── LeaderboardView.tsx (主容器 - 58 lines)
    ├── components/ (7个子组件)
    └── mock-data.ts (数据分离)

旧文件归档: src/components/deprecated/dashboard/views/LeaderboardView.tsx
```

---

### 审计发现

#### ✅ 符合项
1. **架构范式一致性**: 完全符合5层架构模式
2. **Client Wrapper模式**: 正确使用Server Component包裹Client Component
3. **类型安全**: 全程TypeScript类型推导
4. **响应式设计**: 支持移动端和桌面端
5. **暗黑模式支持**: 完整的dark mode实现
6. **组件模块化**: 从380行单文件拆分为8个独立组件，可维护性大幅提升
7. **Adapter Pattern**: 使用PgAdapter实现数据库抽象，未来可扩展Redis

#### 🟢 优秀设计
1. **游戏化体验**: Tier Roadmap（段位系统）、Season（赛季机制）、Rival Watch（竞争对手）
2. **视觉层次清晰**: Podium（领奖台）突出前三名，Zone标识（Promotion/Demotion）引导用户
3. **激励机制**: Daily Quests（每日任务）提供即时反馈，XP Breakdown展示成长路径
4. **实时对比**: Sticky User Footer固定显示当前用户排名，便于对比
5. **多时间段**: 支持周榜/月榜/总榜切换（已实现但未集成）

#### ⚠️ 组件重构成功
1. ✅ **目录重组完成**: 从单文件380行拆分到 `components/leaderboard/` 模块化目录
2. ✅ **子组件拆分**: 7个功能独立的子组件 + 1个数据文件
3. ✅ **导入路径更新**: 所有引用文件（client-wrapper, SectionViews, DashboardClient）已更新
4. ✅ **构建验证通过**: TypeScript检查和Next.js构建全部通过
5. ✅ **旧文件归档**: 旧LeaderboardView已移动到 `components/deprecated/`
6. ✅ **未使用导出清理**: 删除了`DynamicLeaderboardView`（从未被引用）

#### 🔴 未集成Server Actions
**问题**: Server Actions已完整实现但**未被前端使用**

**已实现的功能**:
- ✅ `updateLeaderboardScore()` - 更新用户分数
- ✅ `getLeaderboard()` - 获取排行榜（支持3种时间段）
- ✅ `getUserRank()` - 获取用户排名
- ✅ PgAdapter - PostgreSQL适配器（Adapter Pattern）

**影响**:
- 当前LeaderboardView使用硬编码Mock数据
- 排行榜数据无法实时更新
- 用户操作（答题、学习）无法影响排名

**建议**:
1. 在LeaderboardView中使用`useEffect`调用`getLeaderboard()`
2. 在答题/学习成功后调用`updateLeaderboardScore()`
3. 使用SWR或TanStack Query实现客户端缓存和实时更新

#### ⚠️ 潜在优化点
1. **数据集成**: 将Mock数据替换为真实数据库查询（`getLeaderboard`）
2. **实时更新**: 使用WebSocket或轮询实现排行榜实时刷新
3. **缓存策略**: 为`getLeaderboard()`添加缓存 (TTL: 1分钟)
4. **分页加载**: 当前显示17个用户，未来可能需要虚拟滚动或分页
5. **Redis迁移**: 当QPS > 1000时，将PgAdapter替换为RedisAdapter
6. **图片优化**: 替换`<img>`标签为Next.js `<Image/>`组件（6处警告）

---

## 5️⃣ Community (社区)

### ✅ 审计状态: 已完成 | 架构合规: ✅ PASS | 重复开发: ⚠️ 1个废弃

### 5层架构分析

#### 1. Entry Point (入口)
**文件**: `src/components/business/AppSidebar.tsx`
```typescript
// Line 28
{ title: 'Community', href: '/dashboard/community', icon: MessageCircle }
```

#### 2. Route (路由)
**路径**: `/dashboard/community`
**对应**: Next.js App Router 自动路由

#### 3. Page Layer (页面层 - Server Component)
**文件**: `src/app/(dashboard)/dashboard/community/page.tsx` (25 lines)

**职责**:
- ✅ 身份验证检查 (`getProfile()`)
- ✅ 未登录重定向到 `/login`
- ✅ 使用 CommunityClientWrapper 包裹组件

**关键代码**:
```typescript
export default async function CommunityPage() {
  const profile = await getProfile()
  if (!profile) {
    redirect('/login')
  }
  return (
    <CommunityClientWrapper user={profile}>
      <CommunityView />
    </CommunityClientWrapper>
  )
}
```

**设计模式**: ✅ Client Wrapper Pattern

#### 3.5 Client Wrapper (客户端包装器)
**文件**: `src/app/(dashboard)/dashboard/community/client-wrapper.tsx` (45 lines)

**职责**:
- ✅ 包裹子组件并提供 DashboardLayout
- ✅ 处理导航逻辑 (router.push)
- ✅ 传递用户角色、订阅信息给布局

**关键代码**:
```typescript
export function CommunityClientWrapper({ children, user }: CommunityClientWrapperProps) {
  const router = useRouter()
  const handleNavigate = (view: string) => {
    const routes: Record<string, string> = { /* ... */ }
    router.push(routes[view] || '/dashboard')
  }
  return (
    <DashboardLayout currentView="community" onNavigate={handleNavigate} userRole={user.role}>
      {children}
    </DashboardLayout>
  )
}
```

#### 4. Component Layer (组件层 - Client Component)

**文件**: `src/components/dashboard/views/CommunityView.tsx` (397 lines)

**职责**:
- ✅ 社区主视图 UI 渲染
- ✅ 帖子列表展示（支持过滤：latest, popular, unanswered）
- ✅ 创建帖子功能（textarea + 发送按钮）
- ✅ 点赞/评论互动
- ✅ Markdown + KaTeX 渲染支持
- ✅ 响应式设计

**页面结构** (2列布局):
```
CommunityView
├── 左列 (8/12): 帖子列表
│   ├── 创建帖子卡片 (textarea + Send按钮)
│   ├── 过滤标签 (Latest, Popular, Unanswered)
│   └── 帖子卡片列表
│       ├── 帖子头部（作者、角色、时间）
│       ├── 帖子内容（支持Markdown + KaTeX）
│       ├── AI Tutor提示（未解决的问题）
│       ├── 标签列表
│       └── 互动按钮（点赞、评论、分享）
└── 右列 (4/12): 侧边栏小部件
    ├── Live Rooms (语音聊天室 - Mock数据)
    ├── Top Contributors (贡献者排行)
    └── Trending Topics (热门话题)
```

**状态管理**:
```typescript
const [activeTab, setActiveTab] = useState('latest')           // 当前过滤标签
const [posts, setPosts] = useState<PostWithAuthor[]>([])       // 帖子列表
const [loading, setLoading] = useState(true)                   // 加载状态
const [newPostContent, setNewPostContent] = useState('')       // 新帖子内容
const [isSubmitting, setIsSubmitting] = useState(false)        // 提交状态
```

**关键功能**:
1. **帖子加载** (`fetchPosts`):
   - 调用 Server Action `getPosts()`
   - 支持过滤参数 (unanswered)
   - 分页参数 (page, limit)

2. **创建帖子** (`handleCreatePost`):
   - 调用 Server Action `createPost()`
   - 自动提取标题（第一行前100字符）
   - 成功后重新加载帖子列表

3. **点赞功能** (`handleLike`):
   - 乐观更新 (Optimistic Update)
   - 调用 Server Action `toggleLike()`
   - 失败时重新加载数据

4. **Markdown 渲染**:
   - 使用 `react-markdown` 渲染内容
   - 支持 KaTeX 数学公式 (remarkMath + rehypeKatex)
   - 使用 `date-fns` 格式化时间

**设计亮点**:
- ✅ 不同类型帖子有不同样式（Question: 蓝色左边框，Achievement: 黄色渐变）
- ✅ 未解决的问题显示 "Ask AI Tutor" 提示
- ✅ 使用 `formatDistanceToNow()` 显示相对时间
- ✅ 空状态提示（无帖子时显示占位符）

#### 5. Logic Layer (逻辑层 - Server Actions)

**文件**: `src/actions/community.ts` (404 lines)

**职责**:
- ✅ 所有社区相关的数据库操作
- ✅ 权限校验（用户认证）
- ✅ 事务处理（点赞计数）

**核心函数**:

1. **`getPosts()`** - 获取帖子列表
   - 支持过滤（subjectId, category, unanswered, search）
   - 支持分页（page, limit）
   - 返回帖子数组 + 分页元数据
   - 包含作者信息、评论数、点赞数、学科信息

2. **`getCategories()`** - 获取分类列表
   - 返回所有学科及其帖子数量
   - 按 order 字段排序

3. **`createPost()`** - 创建新帖子
   - 参数：title, content, category, subjectId, tags
   - 校验用户认证
   - 返回创建的帖子或错误信息

4. **`getPostById()`** - 获取帖子详情
   - 包含完整评论列表（按时间升序）
   - 包含当前用户的点赞状态 (userLiked)
   - 返回 null 如果帖子不存在

5. **`createComment()`** - 创建评论
   - 校验用户认证
   - **触发通知**: 使用 `triggerSocialReplyNotification()` 通知帖子作者
   - 返回新创建的评论（包含作者信息）

6. **`toggleLike()`** - 点赞/取消点赞
   - 使用事务 (Transaction) 确保数据一致性
   - 同时更新 PostLike 表和 Post.likeCount 字段
   - 返回点赞状态 (liked: true/false)

**数据库设计**:
```typescript
PostWithAuthor = Post + {
  author: { id, username, avatar, role }
  _count: { comments, likes }
  subject: { id, name, icon }
}

PostWithAuthorAndComments = PostWithAuthor + {
  comments: [Comment + { author }]
}
```

**安全措施**:
- ✅ 所有写操作需要用户认证
- ✅ 使用 Prisma 防止 SQL 注入
- ✅ 错误处理（try-catch + 返回 success/error）

### 架构评估

#### ✅ 优点
1. **架构清晰**: 严格遵循 5 层架构模式
2. **组件复用**: 使用 DashboardLayout 保持一致性
3. **数据流清晰**: Server Actions → Client Component
4. **用户体验**: 乐观更新提升交互速度
5. **功能完整**: 支持帖子创建、点赞、评论、过滤、搜索
6. **通知集成**: 评论时自动触发通知
7. **Markdown 支持**: 可渲染富文本和数学公式

#### ⚠️ 发现的问题

**重复开发**:
- ❌ 发现 1 个废弃文件: `src/components/dashboard/CommunityView.tsx`
  - **差异**: 旧版本使用 Mock 数据 + Gemini AI，未连接数据库
  - **处理**: 已移动到 `src/components/__deprecated__/CommunityView.OLD.tsx`
  - **引用修复**: 已更新 `src/lib/dynamic-imports.ts` 的引用路径

**⚠️ 路由不一致**:
- 发现两个废弃的子路由页面：
  - `src/app/(dashboard)/dashboard/community/[postId]/page.tsx` - 重定向到主页
  - `src/app/(dashboard)/dashboard/community/new/page.tsx` - 重定向到主页
  - **原因**: 帖子详情和新建功能可能计划在同一页面内完成

**代码质量**:
- ✅ TypeScript 严格模式 ✅
- ✅ ESLint 检查通过 ✅
- ✅ 构建成功 ✅

### 优化建议

1. **性能优化**:
   - 建议添加虚拟滚动 (react-window) 处理大量帖子
   - 考虑实现无限滚动加载（当前只有分页）
   - 缓存热门帖子（Redis）

2. **功能增强**:
   - 实现帖子详情页（当前只有重定向）
   - 实现新建帖子页（当前在主页面内完成）
   - 添加图片上传功能（代码中有 ImageIcon 按钮但未实现）
   - 添加话题标签选择器（当前只有 AI Suggestion）

3. **数据完整性**:
   - Live Rooms、Top Contributors、Trending Topics 使用 Mock 数据
   - 建议连接真实数据源或标记为 "Coming Soon"

4. **搜索功能**:
   - 搜索框存在但未实现功能
   - 建议添加实时搜索或使用防抖

5. **通知优化**:
   - 已集成评论通知（`triggerSocialReplyNotification`）
   - 建议添加点赞通知、@提及通知

### 文件清单

**已审计 (3 个文件)**:
- ✅ `src/components/dashboard/views/CommunityView.tsx` (397 lines)
- ✅ `src/app/(dashboard)/dashboard/community/page.tsx` (25 lines)
- ✅ `src/app/(dashboard)/dashboard/community/client-wrapper.tsx` (45 lines)
- ✅ `src/actions/community.ts` (404 lines)

**废弃文件 (1 个)**:
- ❌ `src/components/__deprecated__/CommunityView.OLD.tsx` (401 lines) - 旧版本

**总代码行数**: 871 lines (不含废弃文件)

---

## 6️⃣ Admin Panel (管理后台)

### ✅ 审计状态: 已完成 (2026-02-06)

**审计结论**: ✅ PASS - 架构清晰，无重复组件

---

### 功能概述

Admin Panel 是一个**多功能管理后台模块**，提供了平台管理员和教师使用的管理工具。

**侧边栏入口** (仅对 ADMIN/TEACHER 角色可见):
- `/admin/permissions` - 权限调控台
- `/admin/feedback` - 用户反馈收件箱

**完整路由映射**:
1. `/admin/` → 重定向到 `/admin/content`
2. `/admin/permissions` ✅ - 权限控制台 (仅ADMIN)
3. `/admin/feedback` ✅ - 反馈管理
4. `/admin/feedback/[id]` - 反馈详情
5. `/admin/users` - 用户全生命周期管理 (Story-046)
6. `/admin/users/[id]` - 用户详情页
7. `/admin/content/` → 重定向到 `/admin/content/review`
8. `/admin/content/review` - 题目审核列表
9. `/admin/content/review/[questionId]` - 题目审核详情
10. `/admin/content/import` - 批量导入题目
11. `/admin/content/statistics` - 内容统计
12. `/admin/content/reports` - 用户报告管理
13. `/admin/content/[id]/edit` - 编辑题目
14. `/admin/referrals` - 推荐管理

---

### 架构分析

#### 1. Sidebar Layer (入口层)

**文件**: `src/components/business/AppSidebar.tsx` (第84-122行)

**入口代码**:
```typescript
{isAdmin && (
  <>
    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest mt-6 mb-3 px-4">Admin</div>
    <Link href="/admin/permissions">
      <ShieldCheck />
      Permissions Control
    </Link>
    <Link href="/admin/feedback">
      <MessageSquare />
      User Feedback
    </Link>
  </>
)}
```

**角色判断**:
```typescript
const isAdmin = userRole === 'ADMIN' || userRole === 'TEACHER'
```

#### 2. Route Layer

**路由文件位置**: `src/app/(dashboard)/admin/`

**路由树**:
```
admin/
├── page.tsx (重定向)
├── permissions/
│   └── page.tsx
├── feedback/
│   ├── page.tsx
│   └── [id]/
│       └── page.tsx
├── users/
│   ├── page.tsx
│   └── [id]/
│       ├── page.tsx
│       └── client.tsx + UserDetailClient.tsx
├── content/
│   ├── page.tsx (重定向)
│   ├── review/
│   │   ├── page.tsx
│   │   └── [questionId]/
│   │       ├── page.tsx
│   │       └── QuestionReviewClient.tsx
│   ├── import/
│   │   ├── page.tsx
│   │   └── ImportClient.tsx
│   ├── statistics/
│   │   ├── page.tsx
│   │   └── StatisticsClient.tsx
│   ├── reports/
│   │   └── page.tsx
│   └── [id]/
│       └── edit/
│           └── page.tsx
└── referrals/
    └── page.tsx
```

#### 3. Page Layer (页面层 - Server Components)

**关键特征**:
- ✅ 所有页面使用 `getProfile()` 进行身份验证
- ✅ 使用角色权限检查 (`role === 'ADMIN'`)
- ✅ 使用 `export const dynamic = 'force-dynamic'` 确保SSR
- ✅ 统一使用 `AdminClientWrapper` 包装组件

**示例**:
```typescript
// permissions/page.tsx
export default async function AdminPermissionsPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')
  if (profile.role !== 'ADMIN') redirect('/dashboard')

  return (
    <AdminClientWrapper user={profile} userRole={profile.role}>
      <UserPermissionManager />
    </AdminClientWrapper>
  )
}
```

#### 4. Component Layer (组件层 - Client Components)

**目录结构**:
```
components/admin/
├── AdminClientWrapper.tsx (通用包装器)
├── permissions/
│   ├── UserPermissionManager.tsx (主视图)
│   ├── UserTable.tsx (用户表格)
│   └── OverrideModal.tsx (提权弹窗)
├── feedback/
│   ├── FeedbackList.tsx (反馈列表)
│   └── FeedbackDetailView.tsx (反馈详情)
├── users/
│   ├── UserTable.tsx (完整用户管理表格)
│   ├── UserBadges.tsx
│   ├── ImpersonateBannerWrapper.tsx
│   ├── UserDetail.tsx
│   ├── UserProfileHeader.tsx
│   ├── Modals.tsx
│   ├── HighRiskConfirmDialog.tsx
│   ├── GrantPermissionDialog.tsx
│   ├── AdminNoteList.tsx
│   ├── StripeHistoryTable.tsx
│   ├── ImpersonateBanner.tsx
│   └── tabs/
│       ├── OverviewTab.tsx
│       ├── ActivityTab.tsx
│       ├── AuditTab.tsx
│       ├── GrowthTab.tsx
│       └── SubscriptionTab.tsx
├── content/
│   ├── StatsCards.tsx (内容统计卡片)
│   ├── BatchTable.tsx (批量任务表格)
│   ├── AuditLogDrawer.tsx
│   └── NewBatchImportModal.tsx
├── content-statistics/
│   ├── Header.tsx
│   ├── StatCard.tsx
│   ├── DashboardStats.tsx
│   ├── SubjectDistribution.tsx
│   ├── DifficultyBreakdown.tsx
│   └── ReviewersList.tsx
├── content-reports/
│   ├── Header.tsx
│   ├── StatsCards.tsx (报告统计卡片)
│   ├── ReportsTable.tsx
│   ├── ReportDetailsDrawer.tsx
│   └── ReportsClient.tsx
├── review/
│   ├── QuestionPanel.tsx
│   ├── MetadataPanel.tsx
│   ├── MathRenderer.tsx
│   ├── EditorToolbar.tsx
│   └── EditableSection.tsx
└── (根级别组件 - 11个)
    ├── DifficultyBadge.tsx
    ├── ImportHistoryTable.tsx
    ├── QualityCheckDisplay.tsx
    ├── QualityScoreBadge.tsx
    ├── QuestionEditorForm.tsx
    ├── QuestionPreview.tsx
    ├── QuestionReviewPanel.tsx
    ├── QuestionReviewTable.tsx
    ├── RichTextEditor.tsx
    └── SubjectFilter.tsx
```

**组件统计**:
- 子目录: 7个 (permissions, feedback, users, content, content-statistics, content-reports, review)
- 根级别组件: 11个
- 总组件数: 50+ 个

#### 5. Logic Layer (逻辑层 - Server Actions)

**Server Actions**:
- `@/actions/admin/permission-override` - 权限覆盖逻辑
  - `searchUsersForOverride()` - 搜索用户
  - `overrideUserPermission()` - 提权操作
- `@/actions/support` - 反馈管理
  - `getFeedbackList()` - 获取反馈列表
  - `getFeedbackDetail()` - 获取反馈详情
  - `updateFeedbackStatus()` - 更新反馈状态
- `@/actions/profile` - 用户资料获取
  - `getProfile()` - 身份验证

**数据源**:
- ⚠️ 部分功能使用 Mock 数据 (users 模块)
- ✅ Feedback 和 Permissions 连接真实数据库

---

### 组件重复检测结果

#### 检测到的同名组件 (3组)

| 组件名 | 路径1 | 路径2 | 是否重复？ | 说明 |
|--------|-------|-------|-----------|------|
| **Header.tsx** | `content-reports/` | `content-statistics/` | ❌ 不重复 | 功能不同 (Reports页面 vs Statistics页面) |
| **StatsCards.tsx** | `content/` | `content-reports/` | ❌ 不重复 | 数据不同 (内容统计 vs 报告统计) |
| **UserTable.tsx** | `permissions/` | `users/` | ❌ 不重复 | 场景不同 (权限调控 vs 用户管理) |

**结论**: ✅ **无真正的重复组件**，所有同名文件功能和应用场景均不同

---

### 类型定义审计

**类型文件** (3个):
| 文件 | 路径 | 行数 | 质量评估 |
|------|------|------|---------|
| `admin-user.ts` | `src/types/` | 202行 | ✅ 优秀 - 完整覆盖用户管理所有类型 |
| `content-pipeline.ts` | `src/types/` | 195行 | ✅ 优秀 - 内容流水线完整类型 + 转换函数 |
| `feedback.ts` | `src/types/` | 17行 | ✅ 合格 - 简洁枚举定义 |

**特点**:
- ✅ 所有类型都有清晰的注释
- ✅ 枚举定义对齐 Prisma schema
- ✅ 包含类型转换辅助函数
- ✅ 支持 Story-046 用户管理需求

---

### Mock数据审计

**Mock数据文件** (2个):
| 文件 | 位置 | 质量评估 |
|------|------|---------|
| `userMockData.ts` | `components/admin/users/mock/` | ✅ 优秀 - 生成200条数据，覆盖所有Status×Tier组合 |
| `content-pipeline-data.ts` | `src/__dev__/mock/` | ✅ 良好 - 统计/批量/审核Mock数据完整 |

**⚠️ Mock数据位置不一致**:
- userMockData 在组件内部 (`components/admin/users/mock/`)
- content-pipeline-data 在全局Mock目录 (`src/__dev__/mock/`)

**建议**: 统一到 `src/__dev__/mock/admin/`，但不强制修改（当前结构可用）

---

### 目录结构评估

#### ⚠️ 发现的小问题

1. **目录命名不一致**:
   - `content-statistics/` 和 `content-reports/` 使用 kebab-case 分隔符
   - 理想结构: `content/statistics/` 和 `content/reports/`

2. **根级别组件较多** (11个):
   - 部分组件可归类到子目录 (如 content/ 或 review/)
   - 但影响不大，当前结构清晰可用

**决策**: ✅ **保持现有结构，不做重组**

**理由**:
- 当前结构已经在正常使用中
- 重组会导致大量导入路径更新 (15+ 文件受影响)
- Admin模块功能复杂，重组风险较高
- 虽然不完美但清晰可维护

---

### 架构评估

#### ✅ 优点

1. **模块化清晰**: 每个子功能(permissions, feedback, users, content)独立目录
2. **权限控制完善**: 所有页面都有角色检查，避免越权访问
3. **组件复用性高**: AdminClientWrapper 统一包装所有Admin页面
4. **类型安全**: 完整的TypeScript类型定义
5. **Mock数据完善**: 用户管理Mock数据覆盖200条记录，覆盖所有组合
6. **无重复组件**: 虽然有同名文件，但功能均不同

#### ⚠️ 发现的问题

**架构问题**:
- ❌ 无 (架构合规)

**目录结构**:
- ⚠️ 目录命名不统一 (content-statistics vs content/statistics)
- ⚠️ Mock数据位置不一致
- ⚠️ 根级别组件较多

**数据连接**:
- ⚠️ Users模块使用Mock数据，未连接数据库
- ⚠️ Content模块部分功能使用Mock数据

**代码质量**:
- ✅ TypeScript 严格模式 ✅
- ✅ ESLint 检查通过 ✅
- ✅ 构建成功 ✅

---

### 优化建议

1. **目录结构优化** (可选):
   - 考虑将 `content-statistics/` 重构为 `content/statistics/`
   - 考虑将 `content-reports/` 重构为 `content/reports/`
   - 统一Mock数据到 `src/__dev__/mock/admin/`

2. **数据连接**:
   - 将 Users 模块连接到真实数据库 (目前使用Mock)
   - 实现 Content 模块的 Server Actions

3. **功能增强**:
   - 添加用户操作审计日志
   - 实现批量操作功能 (批量封禁用户、批量审核题目)
   - 添加数据导出功能 (CSV/Excel)

4. **性能优化**:
   - 用户列表添加虚拟滚动 (当前200条Mock数据)
   - 题目审核列表实现服务端分页
   - 添加搜索防抖

---

### 文件清单

**已审计**:

**Page Layer** (14个):
- ✅ `src/app/(dashboard)/admin/page.tsx`
- ✅ `src/app/(dashboard)/admin/permissions/page.tsx`
- ✅ `src/app/(dashboard)/admin/feedback/page.tsx`
- ✅ `src/app/(dashboard)/admin/feedback/[id]/page.tsx`
- ✅ `src/app/(dashboard)/admin/users/page.tsx`
- ✅ `src/app/(dashboard)/admin/users/[id]/page.tsx`
- ✅ `src/app/(dashboard)/admin/content/page.tsx`
- ✅ `src/app/(dashboard)/admin/content/review/page.tsx`
- ✅ `src/app/(dashboard)/admin/content/review/[questionId]/page.tsx`
- ✅ `src/app/(dashboard)/admin/content/import/page.tsx`
- ✅ `src/app/(dashboard)/admin/content/statistics/page.tsx`
- ✅ `src/app/(dashboard)/admin/content/reports/page.tsx`
- ✅ `src/app/(dashboard)/admin/content/[id]/edit/page.tsx`
- ✅ `src/app/(dashboard)/admin/referrals/page.tsx`

**Component Layer** (50+ 个组件):
- ✅ `src/components/admin/` (所有子目录和根级别组件)

**Logic Layer** (3个):
- ✅ `src/actions/admin/permission-override.ts`
- ✅ `src/actions/support.ts`
- ✅ `src/actions/profile.ts` (共享)

**Types** (3个):
- ✅ `src/types/admin-user.ts`
- ✅ `src/types/content-pipeline.ts`
- ✅ `src/types/feedback.ts`

**Mock Data** (2个):
- ✅ `src/components/admin/users/mock/userMockData.ts`
- ✅ `src/__dev__/mock/content-pipeline-data.ts`

**废弃文件**:
- ❌ 无

**总代码行数**: ~5000+ lines (估算)

---

## 📊 总体统计

- **已完成**: 7 / 8 (Dashboard, Courses, Practice, Community, Leaderboard, Settings, Admin Panel)
- **架构合规率**: 100% (7/7)
- **发现重复开发**: 1 (Community旧版本已清理)
- **发现废弃文件**: 3 (Community 1个, Settings 2个)
- **发现架构违反**: 0
- **发现路由不一致**: 0 (Practice模块路由已修复)
- **优化建议**: 22 (缓存策略、分页、索引、Past Papers数据、Analytics性能、Community搜索/详情页、Leaderboard数据集成、Admin目录结构、Mock数据统一、Settings推荐系统、通知测试、AI配置预览、头像上传完善等)

---

## 🔍 下一步行动

1. ✅ Dashboard - 已完成
2. ✅ Courses - 已完成
3. ✅ Practice (Question Bank) - 已完成
4. ✅ Community - 已完成
5. ✅ Leaderboard - 已完成
6. ✅ Settings - 已完成
7. ✅ Admin Panel - 已完成
8. ⏳ Achievements - 下一个检查项

---

## 🧹 审计完成后的清理流程

### 第一步：生成完整文件列表

```bash
# 列出 src/ 目录下所有 .ts/.tsx 文件
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | sort > all_files.txt

# 统计总文件数
wc -l all_files.txt
```

### 第二步：对比已审计文件

1. 从本文档的"文件树"中提取所有标记 ✅ 的文件路径
2. 与 `all_files.txt` 对比，找出**未出现在审计清单中的文件**

### 第三步：分类处理未使用文件

**可能的情况**:
- 📦 **测试文件** (`*.test.ts`, `*.spec.tsx`) - 保留
- 🛠️ **工具/脚本** (`scripts/`, `__dev__/`) - 保留
- 🗑️ **废弃代码** - 移动到 `src/__deprecated__/`
- 🔧 **开发中功能** - 添加注释标记
- ❓ **未知用途** - 需要进一步调查

### 第四步：创建清理报告

在 `docs/CLEANUP_REPORT.md` 中记录:
- 发现的未使用文件列表
- 每个文件的处理决策 (保留/删除/移动)
- 清理前后的代码统计对比

---

**更新记录**:
- 2026-02-06: 创建文档，完成Dashboard审计，添加文件追踪机制
- 2026-02-06: 完成Community模块审计，发现并清理1个废弃文件
- 2026-02-06: 完成Admin Panel审计，确认无重复组件，记录目录结构优化建议
- 2026-02-06: 完成Settings模块审计，清理2个废弃文件，确认架构规范

---

## 7️⃣ Settings (设置中心)

### ✅ 审计状态: 已完成 | 架构合规: ✅ PASS | 废弃文件: ⚠️ 2个

### 5层架构分析

#### 1. Entry Point (入口)
**文件**: `src/components/business/AppSidebar.tsx`
```typescript
// Line 130
{ title: 'Settings', href: '/dashboard/settings', icon: Settings }
```

#### 2. Route (路由)
**路径**: 
- `/dashboard/settings` (主设置页)
- `/dashboard/settings/notifications` (通知设置页)

**对应**: Next.js App Router 自动路由

#### 3. Page Layer (页面层 - Server Component)

**文件1**: `src/app/(dashboard)/dashboard/settings/page.tsx` (13 lines)
**职责**:
- ✅ 身份验证检查 (`getProfile()`)
- ✅ 重定向未登录用户
- ✅ 渲染 SettingsClientWrapper

**文件2**: `src/app/(dashboard)/dashboard/settings/notifications/page.tsx` (13 lines)
**职责**:
- ✅ 身份验证检查 (`getProfile()`)
- ✅ 重定向未登录用户
- ✅ 渲染 NotificationSettingsClient

#### 4. Component Layer (组件层 - Client Component)

**主视图1**: `src/app/(dashboard)/dashboard/settings/client-wrapper.tsx` (49 lines)
**职责**:
- ✅ 包裹 DashboardLayout
- ✅ 处理路由导航
- ✅ 渲染 SettingsView 组件

**主视图2**: `src/app/(dashboard)/dashboard/settings/notifications/client-wrapper.tsx` (250 lines)
**职责**:
- ✅ 包裹 DashboardLayout
- ✅ 通知偏好矩阵UI (站内通知 + 邮件通知)
- ✅ 实时保存偏好设置

**核心组件**: `src/components/dashboard/views/SettingsView.tsx` (774 lines)
**职责**:
- ✅ 多Tab设置界面 (Profile, AI Config, Notifications, Account, Subscription)
- ✅ 集成多个设置表单
- ✅ 推荐好友系统 (ReferralSection组件)
- ✅ 暗黑模式切换
- ✅ 语言切换 (中文/英文/马来文)

**子组件目录**: `src/components/business/settings/`
- ✅ `AvatarUpload.tsx` (83 lines) - 头像上传组件，被 ProfileForm 使用
- ✅ `profile-form.tsx` (170 lines) - 个人资料表单，被 ProfileDialog 使用
- ✅ `GoalsForm.tsx` (108 lines) - 学习目标表单，被 GoalsDialog 使用

**子组件特点**:
- ✅ 使用 React Hook Form + Zod 验证
- ✅ 使用 useFormState 和 useFormStatus (React 19)
- ✅ 乐观更新 + Toast 提示

#### 5. Logic Layer (逻辑层 - Server Actions)

**主要Actions**:
1. **`src/actions/profile.ts`** - 用户资料管理
   - `getProfile()` - 获取用户信息
   - `updateProfile()` - 更新用户资料 (username, grade, avatar)

2. **`src/actions/settings.ts`** - AI配置管理
   - `updateAIConfig()` - 更新AI个性化设置 (aiPersonality, difficultyCalibration)

3. **`src/actions/notification-preferences.ts`** - 通知偏好管理
   - `getNotificationPreferences()` - 获取通知偏好（含自动迁移逻辑）
   - `updateNotificationPreferences()` - 更新通知偏好

4. **`src/actions/parent.ts`** - 家长账号连接
   - `generateInviteCode()` - 生成家长邀请码

**数据模型**:
- ✅ User (id, email, username, avatar, grade, role, referralCode, referralCount, referralLimit)
- ✅ UserSettings (language, theme, aiPersonality, difficultyCalibration, notificationDaily, notificationWeekly)
- ✅ NotificationPreference (站内通知4项 + 邮件通知4项 + emailBilling强制开启)

---

### 废弃文件发现 ⚠️

#### ❌ BadgeGrid.tsx
**路径**: `src/components/business/settings/BadgeGrid.tsx` (83 lines)
**问题**: 无任何引用，Settings UI 中没有徽章展示功能
**处理**: ✅ 已移动到 `src/__deprecated__/components/business/settings/BadgeGrid.tsx`

#### ❌ ai-config-form.tsx
**路径**: `src/components/business/settings/ai-config-form.tsx` (93 lines)
**问题**: 无任何引用，SettingsView 已内联实现AI配置功能
**处理**: ✅ 已移动到 `src/__deprecated__/components/business/settings/ai-config-form.tsx`

---

### 目录结构评估

**当前结构**:
```
src/
├── app/(dashboard)/dashboard/settings/
│   ├── page.tsx (主设置页面层)
│   ├── client-wrapper.tsx (主设置包装器)
│   └── notifications/
│       ├── page.tsx (通知设置页面层)
│       └── client-wrapper.tsx (通知设置包装器)
├── components/dashboard/views/
│   └── SettingsView.tsx (主视图组件)
└── components/business/settings/
    ├── AvatarUpload.tsx (头像上传)
    ├── profile-form.tsx (资料表单)
    └── GoalsForm.tsx (目标表单)
```

**评估**: ✅ **目录结构规范，无需重组**

**理由**:
- Page层在App Router目录 ✅
- Client Wrapper在page同级目录 ✅ (Next.js约定)
- 主视图在 `components/dashboard/views/` ✅
- 子组件在 `components/business/settings/` ✅
- 与Community、Leaderboard保持一致 ✅

---

### 架构评估

#### ✅ 优点

1. **分层清晰**: Page → Client Wrapper → View Component → Sub Components 结构完整
2. **路由规范**: 使用App Router嵌套路由 (`/settings` + `/settings/notifications`)
3. **数据自动迁移**: `getNotificationPreferences()` 包含自动字段迁移逻辑
4. **表单最佳实践**: React Hook Form + Zod + Server Actions
5. **国际化支持**: 语言切换功能完善 (中/英/马来文)
6. **权限控制**: 推荐功能根据订阅等级显示不同UI
7. **无重复组件**: 所有Settings组件职责清晰，无重复实现

#### ⚠️ 发现的问题

**废弃文件**:
- ⚠️ `BadgeGrid.tsx` 和 `ai-config-form.tsx` 未被使用 (已清理)

**数据连接**:
- ✅ 所有Settings功能已连接数据库 (Prisma)
- ✅ 通知偏好使用独立表 `NotificationPreference`

**代码质量**:
- ✅ TypeScript 类型安全 ✅
- ✅ ESLint 检查通过 ✅
- ✅ 构建成功 ✅

---

### 优化建议

1. **推荐系统集成**:
   - 当前推荐功能UI完善，但需要确保后端逻辑实现
   - 建议添加推荐奖励发放记录查询

2. **通知设置增强**:
   - 考虑添加"测试邮件"功能，让用户验证邮箱地址
   - 添加"全部禁用"/"全部启用"快捷按钮

3. **AI配置扩展**:
   - 考虑添加"预览AI风格"功能，让用户在切换前体验不同风格
   - 添加"难度校准建议"基于用户历史答题正确率

4. **头像上传**:
   - AvatarUpload组件已存在，但 ProfileForm 中使用占位符图片
   - 建议完善头像上传到Supabase Storage的功能

---

### 文件清单

**已审计**:

**Page Layer** (2个):
- ✅ `src/app/(dashboard)/dashboard/settings/page.tsx`
- ✅ `src/app/(dashboard)/dashboard/settings/notifications/page.tsx`

**Client Wrapper** (2个):
- ✅ `src/app/(dashboard)/dashboard/settings/client-wrapper.tsx`
- ✅ `src/app/(dashboard)/dashboard/settings/notifications/client-wrapper.tsx`

**Component Layer** (4个):
- ✅ `src/components/dashboard/views/SettingsView.tsx`
- ✅ `src/components/business/settings/AvatarUpload.tsx`
- ✅ `src/components/business/settings/profile-form.tsx`
- ✅ `src/components/business/settings/GoalsForm.tsx`

**Logic Layer** (4个):
- ✅ `src/actions/profile.ts`
- ✅ `src/actions/settings.ts`
- ✅ `src/actions/notification-preferences.ts`
- ✅ `src/actions/parent.ts`

**废弃文件** (2个):
- ❌ `src/__deprecated__/components/business/settings/BadgeGrid.tsx`
- ❌ `src/__deprecated__/components/business/settings/ai-config-form.tsx`

**总代码行数**: ~1600 lines

---

