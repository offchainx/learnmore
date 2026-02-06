# 🏗️ LearnMore 功能架构范式文档

> **生成时间**: 2026-02-06
> **项目**: 中学生在线教育平台 (LearnMore v1.0)
> **目标**: 统一所有功能的开发模式，避免重复开发

---

## 📐 核心架构范式

### ✅ **标准5层架构**

```
入口 (Entry) → 路由 (Route) → 页面 (Page) → 组件 (Component) → 逻辑 (Logic)
```

---

## 🎯 详细说明

### 1️⃣ **入口 (Entry Point)**

用户如何发现并访问功能的起点。

#### **类型A: 导航菜单**
```tsx
// 位置: src/components/business/AppSidebar.tsx
<SidebarMenu>
  <SidebarMenuItem>
    <Link href="/dashboard">
      <Home /> 仪表盘
    </Link>
  </SidebarMenuItem>
</SidebarMenu>
```

#### **类型B: 功能卡片**
```tsx
// 位置: src/components/dashboard/views/QuestionBankView/TrainingModeCards.tsx
<div onClick={() => router.push('/dashboard/practice/error-wiper?subjectId=xxx')}>
  <Eraser /> Error Wiper
</div>
```

#### **类型C: 动作按钮**
```tsx
// 位置: 任意页面内部
<Button onClick={() => router.push('/dashboard/community/new')}>
  创建新帖子
</Button>
```

---

### 2️⃣ **路由 (Route)**

基于Next.js 14+ App Router的文件系统路由。

#### **命名规则**
```
文件路径 → URL映射

src/app/(dashboard)/dashboard/practice/error-wiper/page.tsx
  ↓
URL: /dashboard/practice/error-wiper

规则:
- (dashboard) 是路由组，不出现在URL中
- [subjectId] 是动态参数
- page.tsx 是页面文件
```

#### **常见路由类型**

| 路由类型 | 文件路径示例 | URL示例 |
|---------|-------------|---------|
| 静态路由 | `/dashboard/page.tsx` | `/dashboard` |
| 动态路由 | `/course/[subjectId]/page.tsx` | `/course/123` |
| 嵌套动态 | `/course/[subjectId]/[lessonId]/page.tsx` | `/course/123/456` |
| 查询参数 | `/practice/error-wiper/page.tsx` | `/practice/error-wiper?subjectId=123` |

---

### 3️⃣ **页面 (Page Layer)**

#### **职责**
- ✅ 数据获取（Server Component）
- ✅ 认证检查
- ✅ 数据格式化
- ✅ 渲染组件
- ❌ **不包含复杂UI逻辑**（交给组件层）

#### **标准模板**
```tsx
// src/app/(dashboard)/dashboard/功能名/page.tsx

import { Server Action } from '@/actions/功能模块'
import { 组件 } from '@/components/功能组件'
import { redirect } from 'next/navigation'

export const metadata = {
  title: '页面标题 | LearnMore',
  description: '页面描述',
}

interface PageProps {
  params: Promise<{ id: string }>          // 动态路由参数
  searchParams: Promise<{ query: string }> // 查询参数
}

export default async function 功能Page({ params, searchParams }: PageProps) {
  // 1. 解析参数
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams

  // 2. 认证检查
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  // 3. 数据获取（调用Server Action）
  const data = await getData(resolvedParams.id, resolvedSearchParams.query)

  // 4. 空状态处理
  if (!data || data.length === 0) {
    return <EmptyState />
  }

  // 5. 数据格式化
  const formattedData = data.map(item => ({
    id: item.id,
    // ... 格式化逻辑
  }))

  // 6. 渲染组件
  return (
    <div className="container mx-auto">
      <功能组件 initialData={formattedData} />
    </div>
  )
}
```

---

### 4️⃣ **组件 (Component Layer)**

#### **分类**

##### **A. UI基础组件** (`src/components/ui/`)
来自shadcn/ui，通用UI元素。

```tsx
// 示例: Button, Card, Dialog, Input, Select
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
```

##### **B. 业务组件** (`src/components/business/`)
项目特定的可复用组件。

```tsx
// 示例: QuestionRenderer (题目渲染), CourseTree (课程树)
import { QuestionRenderer } from '@/components/business/question/QuestionRenderer'
```

##### **C. 功能组件** (`src/components/功能模块/`)
特定功能的复杂组件。

```tsx
// 示例: ErrorWiperMode, SmartDrillMode
import { ErrorWiperMode } from '@/components/practice/modes/ErrorWiperMode'
```

#### **Client vs Server Component**

```tsx
// ✅ Server Component (默认)
// - 无需 'use client'
// - 可以直接调用数据库
// - 适合静态内容

export default async function ServerComponent() {
  const data = await prisma.user.findMany()
  return <div>{data.length}</div>
}

// ✅ Client Component
// - 必须标记 'use client'
// - 可以使用 React Hooks (useState, useEffect)
// - 可以处理交互事件
// - 适合动态交互

'use client'
import { useState } from 'react'

export function ClientComponent() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}
```

---

### 5️⃣ **逻辑 (Logic Layer) - Server Actions**

#### **位置**: `src/actions/功能模块.ts`

#### **职责**
- ✅ 数据库CRUD操作
- ✅ 业务逻辑处理
- ✅ 数据验证
- ✅ 错误处理
- ❌ **不包含UI逻辑**

#### **标准模板**
```typescript
// src/actions/功能模块.ts

'use server'

import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/actions/auth'
import { revalidatePath } from 'next/cache'

// 类型定义
export type 返回类型 = {
  success: boolean
  data?: any
  error?: string
}

/**
 * 功能描述
 * @param param1 参数说明
 * @returns 返回值说明
 */
export async function action名称(param1: string): Promise<返回类型> {
  try {
    // 1. 认证检查
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    // 2. 数据验证
    if (!param1) {
      return { success: false, error: 'Invalid input' }
    }

    // 3. 业务逻辑
    const result = await prisma.model.create({
      data: { ... }
    })

    // 4. 缓存刷新（可选）
    revalidatePath('/dashboard')

    // 5. 返回结果
    return { success: true, data: result }

  } catch (error) {
    console.error('Error in action名称:', error)
    return { success: false, error: 'Internal server error' }
  }
}
```

---

## 📊 实际功能案例分析

### 案例1: Error Wiper (错题消消乐)

```
1️⃣ 入口: TrainingModeCards.tsx (功能卡片)
   └─ 位置: src/components/dashboard/views/QuestionBankView/TrainingModeCards.tsx
   └─ 操作: onClick={() => router.push('/dashboard/practice/error-wiper?subjectId=xxx')}

2️⃣ 路由: /dashboard/practice/error-wiper
   └─ 文件: src/app/(dashboard)/dashboard/practice/error-wiper/page.tsx
   └─ 类型: 静态路由 + 查询参数

3️⃣ 页面: ErrorWiperPage (Server Component)
   └─ 获取数据: await getErrorWiperSession(subjectId)
   └─ 格式化: 转换为 ErrorBookEntry[]
   └─ 渲染: <ErrorWiperMode initialSession={data} />

4️⃣ 组件: ErrorWiperMode.tsx (Client Component - 'use client')
   └─ 位置: src/components/practice/modes/ErrorWiperMode.tsx
   └─ 功能: 卡片动画、掌握度追踪、连胜系统
   └─ 交互: 答题、提交、继续

5️⃣ 逻辑: error-book.ts (Server Actions)
   └─ 位置: src/actions/practice/error-book.ts
   └─ 函数:
      - getErrorWiperSession() → 获取错题列表
      - updateErrorWiperProgress() → 更新掌握度
```

---

### 案例2: 社区帖子详情

```
1️⃣ 入口: 帖子列表点击
   └─ 位置: src/app/(dashboard)/dashboard/community/page.tsx
   └─ 操作: <Link href={`/dashboard/community/${post.id}`}>

2️⃣ 路由: /dashboard/community/[postId]
   └─ 文件: src/app/(dashboard)/dashboard/community/[postId]/page.tsx
   └─ 类型: 动态路由

3️⃣ 页面: PostDetailPage (Server Component)
   └─ 获取数据: await getPostById(params.postId)
   └─ 渲染: <PostDetail post={data} />

4️⃣ 组件: PostDetail.tsx (Client Component)
   └─ 位置: src/components/community/PostDetail.tsx
   └─ 功能: 显示帖子、评论列表、点赞按钮

5️⃣ 逻辑: community.ts (Server Actions)
   └─ 位置: src/actions/community.ts
   └─ 函数:
      - getPostById() → 获取帖子详情
      - likePost() → 点赞
      - createComment() → 创建评论
```

---

### 案例3: 课程学习

```
1️⃣ 入口: 课程树点击
   └─ 位置: src/components/course/CourseTree.tsx
   └─ 操作: router.push(`/course/${subjectId}/${lessonId}`)

2️⃣ 路由: /course/[subjectId]/[lessonId]
   └─ 文件: src/app/course/[subjectId]/[lessonId]/page.tsx
   └─ 类型: 嵌套动态路由

3️⃣ 页面: LessonPage (Server Component)
   └─ 获取数据: await getLessonById(params.lessonId)
   └─ 渲染: <LessonViewer lesson={data} />

4️⃣ 组件: LessonViewer.tsx (Client Component)
   └─ 位置: src/components/course/LessonViewer.tsx
   └─ 子组件:
      - VideoPlayer (视频播放)
      - DocumentViewer (文档阅读)
      - QuizRenderer (练习题)

5️⃣ 逻辑: progress.ts (Server Actions)
   └─ 位置: src/actions/progress.ts
   └─ 函数:
      - updateProgress() → 更新学习进度
      - markComplete() → 标记完成
```

---

## 🎨 Client Wrapper 模式

某些页面使用 **Client Wrapper** 模式来处理复杂交互。

### **模式说明**

```
页面 (Server Component)
  ↓ 获取数据
ClientWrapper (Client Component)
  ↓ 处理交互
功能组件 (UI组件)
```

### **示例**

```tsx
// src/app/(dashboard)/dashboard/practice/page.tsx (Server)
export default async function PracticePage() {
  const profile = await getProfile()
  return <PracticeClientWrapper user={profile} />
}

// src/app/(dashboard)/dashboard/practice/client-wrapper.tsx (Client)
'use client'
export function PracticeClientWrapper({ user }) {
  const [state, setState] = useState(...)
  return <PracticeView user={user} state={state} />
}
```

**使用场景**:
- ✅ 需要URL状态管理
- ✅ 需要复杂的客户端状态
- ✅ 需要Zustand/Context等状态管理

---

## 🔍 如何判断是否重复开发？

### **检查清单**

#### 1️⃣ **检查路由是否重复**
```bash
# 查找相同功能的多个页面文件
find src/app -name "page.tsx" | xargs grep -l "功能关键词"
```

#### 2️⃣ **检查组件是否重复**
```bash
# 查找相似命名的组件
find src/components -name "*功能名*.tsx"
```

#### 3️⃣ **检查Server Actions是否重复**
```bash
# 查找相同功能的多个action文件
grep -r "export.*function.*功能名" src/actions/
```

#### 4️⃣ **检查Git历史**
```bash
# 查看功能的开发历史
git log --oneline --all --grep="功能名" -i
```

---

## 📋 所有核心功能架构清单

### **学习功能**

| 功能 | 入口 | 路由 | 页面 | 组件 | 逻辑 |
|-----|------|------|------|------|------|
| **课程学习** | CourseTree | `/course/[subjectId]/[lessonId]` | page.tsx | LessonViewer | progress.ts |
| **章节刷题** | TrainingModeCards | `/dashboard/practice/chapter-drill/[chapterId]` | page.tsx | ChapterDrillSession | practice/session.ts |
| **智能刷题** | TrainingModeCards | `/dashboard/practice/smart-drill` | page.tsx | SmartDrillMode | practice/smart-drill.ts |
| **错题消消乐** | TrainingModeCards | `/dashboard/practice/error-wiper` | page.tsx | ErrorWiperMode | error-book.ts |
| **模拟考试** | TrainingModeCards | `/dashboard/practice/mock-arena/[examId]` | page.tsx | MockArenaExam | practice/mock-exam.ts |

### **社区功能**

| 功能 | 入口 | 路由 | 页面 | 组件 | 逻辑 |
|-----|------|------|------|------|------|
| **社区列表** | Sidebar | `/dashboard/community` | page.tsx | CommunityList | community.ts |
| **帖子详情** | 帖子卡片 | `/dashboard/community/[postId]` | page.tsx | PostDetail | community.ts |
| **创建帖子** | 创建按钮 | `/dashboard/community/new` | page.tsx | PostEditor | community.ts |

### **统计功能**

| 功能 | 入口 | 路由 | 页面 | 组件 | 逻辑 |
|-----|------|------|------|------|------|
| **个人仪表盘** | Sidebar | `/dashboard` | page.tsx | DashboardClient | dashboard.ts |
| **排行榜** | Sidebar | `/dashboard/leaderboard` | page.tsx | LeaderboardView | leaderboard.ts |
| **成就系统** | Sidebar | `/dashboard/achievements` | page.tsx | AchievementsView | achievements.ts |
| **知识图谱** | Sidebar | `/dashboard/knowledge-graph` | page.tsx | KnowledgeGraph | knowledge-graph.ts |

### **管理功能**

| 功能 | 入口 | 路由 | 页面 | 组件 | 逻辑 |
|-----|------|------|------|------|------|
| **用户管理** | Admin Sidebar | `/admin/users` | page.tsx | UserManagement | admin/users.ts |
| **内容管理** | Admin Sidebar | `/admin/content` | page.tsx | ContentManagement | admin/content.ts |
| **题目审核** | Admin Menu | `/admin/content/review` | page.tsx | QuestionReview | content-pipeline/review-service.ts |
| **反馈管理** | Admin Sidebar | `/admin/feedback` | page.tsx | FeedbackManagement | admin/feedback.ts |
| **权限管理** | Admin Sidebar | `/admin/permissions` | page.tsx | PermissionManagement | admin/permissions.ts |

---

## ⚠️ 常见错误模式

### ❌ **错误1: 页面包含复杂UI逻辑**
```tsx
// ❌ 不好的做法
export default async function Page() {
  const [state, setState] = useState(...) // 错误：Server Component不能用hooks
  return <div>...</div>
}

// ✅ 正确做法
export default async function Page() {
  const data = await getData()
  return <ClientComponent initialData={data} />
}
```

### ❌ **错误2: Client Component直接访问数据库**
```tsx
// ❌ 不好的做法
'use client'
import prisma from '@/lib/prisma'

export function Component() {
  const data = await prisma.user.findMany() // 错误：Client Component不能直接访问数据库
}

// ✅ 正确做法
'use client'
export function Component({ data }) {
  // 数据由Server Component传入
}
```

### ❌ **错误3: Server Action包含UI逻辑**
```tsx
// ❌ 不好的做法
'use server'
export async function createPost() {
  // ...
  toast.success('创建成功') // 错误：Server Action不能操作UI
}

// ✅ 正确做法
'use server'
export async function createPost() {
  return { success: true, message: '创建成功' }
}

// Client Component处理toast
const result = await createPost()
if (result.success) toast.success(result.message)
```

---

## 🚀 开发新功能的标准流程

### **步骤1: 规划**
- [ ] 确定功能名称和目标
- [ ] 选择入口位置（Sidebar/卡片/按钮）
- [ ] 设计URL路径
- [ ] 确定数据模型（Prisma Schema）

### **步骤2: 后端逻辑**
- [ ] 在 `src/actions/` 创建Server Actions
- [ ] 实现数据库CRUD操作
- [ ] 添加错误处理
- [ ] 编写单元测试

### **步骤3: 页面层**
- [ ] 在 `src/app/` 创建路由目录
- [ ] 创建 `page.tsx` (Server Component)
- [ ] 实现数据获取和格式化
- [ ] 处理空状态和错误状态

### **步骤4: 组件层**
- [ ] 在 `src/components/` 创建功能组件
- [ ] 实现UI和交互逻辑
- [ ] 添加Loading和Error边界
- [ ] 确保响应式设计

### **步骤5: 入口集成**
- [ ] 在Sidebar/菜单中添加链接
- [ ] 或创建功能卡片
- [ ] 更新导航逻辑

### **步骤6: 测试验证**
- [ ] 功能测试
- [ ] 边界测试
- [ ] 性能测试
- [ ] 移动端测试

---

## 📝 命名规范

### **文件命名**
- 页面: `page.tsx`
- 布局: `layout.tsx`
- 加载: `loading.tsx`
- 错误: `error.tsx`
- Client Wrapper: `client-wrapper.tsx`

### **组件命名**
- React组件: `PascalCase.tsx` (例: `ErrorWiperMode.tsx`)
- 工具函数: `camelCase.ts` (例: `formatDate.ts`)

### **函数命名**
- Server Actions: `camelCase` (例: `getErrorWiperSession`)
- 组件: `PascalCase` (例: `ErrorWiperMode`)

---

## 🎯 总结

### **架构范式确认**

```
✅ 入口 (Entry)
   → Sidebar / 卡片 / 按钮

✅ 路由 (Route)
   → Next.js App Router 文件系统路由

✅ 页面 (Page)
   → page.tsx (Server Component)
   → 数据获取 + 格式化 + 渲染

✅ 组件 (Component)
   → Client Component ('use client')
   → UI逻辑 + 交互处理

✅ 逻辑 (Logic)
   → Server Actions ('use server')
   → 数据库操作 + 业务逻辑
```

**你的理解完全正确！** 这就是整个系统的标准范式。

---

**文档版本**: v1.0
**最后更新**: 2026-02-06
**维护者**: Development Team
