# 📁 src/ 文件夹系统性分析报告

> **生成时间**: 2026-02-06
> **分析范围**: /Users/victorsim/Desktop/Projects/learn_more_v1.0/src
> **目标**: 识别所有文件功能、检测临时/多余脚本、优化代码结构

---

## 🎯 目录概览

```
src/
├── actions/          # Server Actions (后端业务逻辑)
├── app/              # Next.js App Router (路由+页面)
├── components/       # React组件库
├── lib/              # 工具库与配置
├── providers/        # React Context Providers
├── types/            # TypeScript类型定义
└── proxy.ts          # 代理配置文件
```

**总计**:
- **150+** 子目录
- **500+** 文件 (TS/TSX)
- **核心模块**: 7个

---

## 1️⃣ actions/ - Server Actions (后端业务逻辑)

### 📂 目录结构

```
actions/
├── __tests__/                    # 单元测试
├── admin/                        # 管理员功能
├── content-pipeline/             # 内容管道 (AI生成题目)
├── practice/                     # 练习系统
│   └── __tests__/
├── auth.ts                       # 认证相关
├── community.ts                  # 社区帖子/评论
├── dashboard.ts                  # 仪表盘数据
├── error-book.ts                 # 错题本
├── leaderboard.ts                # 排行榜
├── profile.ts                    # 个人资料
├── progress.ts                   # 学习进度
├── quiz.ts                       # 测验评分
├── storage.ts                    # 文件上传
└── subject.ts                    # 学科/课程
```

### ✅ 核心功能分析

| 文件 | 功能 | 状态 | 备注 |
|------|------|------|------|
| `auth.ts` | 登录/注册/登出 | ✅ 必需 | Supabase Auth集成 |
| `community.ts` | 社区CRUD | ✅ 必需 | 帖子/评论/点赞 |
| `dashboard.ts` | 统计数据获取 | ✅ 必需 | 学习时长/完成率 |
| `error-book.ts` | 错题本管理 | ✅ 必需 | 掌握度追踪 |
| `leaderboard.ts` | 排行榜查询 | ✅ 必需 | 周榜/月榜/总榜 |
| `profile.ts` | 用户资料更新 | ✅ 必需 | 头像/昵称/设置 |
| `progress.ts` | 进度同步 | ✅ 必需 | 视频进度保存 |
| `quiz.ts` | 答题评分引擎 | ✅ 必需 | 支持4种题型 |
| `storage.ts` | 文件上传 | ✅ 必需 | Supabase Storage |
| `subject.ts` | 课程树查询 | ✅ 必需 | 章节/课程数据 |

### 🟡 特殊模块分析

#### **admin/** - 管理员功能
```
admin/
├── content.ts        # 题目管理 (CRUD)
├── feedback.ts       # 反馈处理
├── impersonate.ts    # 用户模拟登录
├── permissions.ts    # 权限管理
├── referrals.ts      # 推荐系统
└── users.ts          # 用户管理
```
**状态**: ✅ 全部必需 - 后台管理核心功能

#### **content-pipeline/** - AI内容生成
```
content-pipeline/
├── create.ts         # 创建内容任务
├── list.ts           # 任务列表
├── process.ts        # AI生成处理
└── status.ts         # 任务状态查询
```
**状态**: ✅ 必需 - 使用Anthropic/Gemini API自动生成题目

#### **practice/** - 练习系统
```
practice/
├── __tests__/
├── mock-exam.ts      # 模拟考试
├── session.ts        # 答题会话
├── smart-drill.ts    # 智能刷题
└── submit.ts         # 提交答案
```
**状态**: ✅ 必需 - 核心学习功能

### 🔍 临时/调试文件检测

❌ **未发现临时文件** - 所有actions均为生产代码

---

## 2️⃣ app/ - Next.js App Router (路由+页面)

### 📂 目录结构

```
app/
├── (auth)/                       # 认证路由组
│   ├── login/                    # 登录页
│   └── register/                 # 注册页
├── (dashboard)/                  # 仪表盘路由组
│   ├── admin/                    # 管理后台
│   └── dashboard/                # 用户仪表盘
├── api/                          # API Routes
│   ├── ai-tutor/                 # AI导师
│   ├── auth/impersonate/         # 用户模拟
│   ├── cron/                     # 定时任务
│   └── webhook/stripe/           # Stripe支付回调
├── course/[subjectId]/           # 课程学习
├── dashboard/admin/referrals/    # 推荐管理 (⚠️ 重复?)
├── help/                         # 帮助中心
├── layout.tsx                    # 全局布局
├── page.tsx                      # 首页
└── [其他营销页面]
```

### ✅ 核心页面清单 (30页)

#### **公共页面 (12页)**
| 路由 | 功能 | 状态 |
|------|------|------|
| `/` | 首页 (Landing Page) | ✅ 必需 |
| `/login` | 登录 | ✅ 必需 |
| `/register` | 注册 | ✅ 必需 |
| `/how-it-works` | 工作原理 | ✅ 必需 |
| `/subjects` | 课程体系 | ✅ 必需 |
| `/pricing` | 价格方案 | ✅ 必需 |
| `/about-us` | 关于我们 | ✅ 必需 |
| `/success-stories` | 成功案例 | ✅ 必需 |
| `/blog` | 博客 | ✅ 必需 |
| `/contact` | 联系我们 | ✅ 必需 |
| `/privacy` | 隐私政策 | ✅ 必需 |
| `/terms` | 服务条款 | ✅ 必需 |

#### **学习功能页面 (8页)**
| 路由 | 功能 | 状态 |
|------|------|------|
| `/dashboard` | 个人中心 | ✅ 必需 |
| `/dashboard/courses` | 我的课程 | ✅ 必需 |
| `/dashboard/practice` | 练习中心 | ✅ 必需 |
| `/dashboard/community` | 学习社区 | ✅ 必需 |
| `/dashboard/leaderboard` | 排行榜 | ✅ 必需 |
| `/dashboard/achievements` | 成就系统 | ✅ 必需 |
| `/dashboard/settings` | 设置 | ✅ 必需 |

#### **管理后台页面 (6页)**
| 路由 | 功能 | 状态 |
|------|------|------|
| `/admin` | 管理首页 | ✅ 必需 |
| `/admin/users` | 用户管理 | ✅ 必需 |
| `/admin/content` | 内容管理 | ✅ 必需 |
| `/admin/content/review` | 题目审核 | ✅ 必需 |
| `/admin/feedback` | 反馈管理 | ✅ 必需 |
| `/admin/permissions` | 权限管理 | ✅ 必需 |

### ⚠️ 可疑/临时页面检测

#### 🟡 `/dashboard/debug/ui-kit`
```tsx
// src/app/(dashboard)/dashboard/debug/ui-kit/page.tsx
```
**功能**: UI组件展示页 (开发调试用)
**状态**: ⚠️ **建议移除或仅在开发环境可访问**

**建议操作**:
```tsx
// 添加环境检查
export default function UIKitPage() {
  if (process.env.NODE_ENV === 'production') {
    redirect('/dashboard')
  }
  // ... UI Kit内容
}
```

#### 🟡 `/dashboard/practice/error-wiper`
```tsx
// src/app/(dashboard)/dashboard/practice/error-wiper/page.tsx
```
**功能**: 错题清空工具 (调试用)
**状态**: ⚠️ **建议移除或限制为管理员权限**

**建议操作**:
```bash
# 移动到管理后台
mv src/app/(dashboard)/dashboard/practice/error-wiper \
   src/app/(dashboard)/admin/tools/error-wiper
```

#### 🟡 `/dashboard/practice/import`
```tsx
// src/app/(dashboard)/dashboard/practice/import/page.tsx
```
**功能**: 题目批量导入
**状态**: ⚠️ **应限制为管理员/教师权限**

**建议操作**:
```tsx
// 添加权限检查
import { requireRole } from '@/lib/permissions'

export default async function ImportPage() {
  await requireRole(['ADMIN', 'TEACHER'])
  // ... 导入逻辑
}
```

#### 🔴 **路由重复检测**
```
⚠️ 发现重复路由:
1. /dashboard/admin/referrals  (在 app/dashboard/admin/referrals/)
2. /admin 路由应统一在 app/(dashboard)/admin/ 下

建议删除: src/app/dashboard/admin/referrals/
```

### 🔧 API Routes分析

| 路由 | 功能 | 状态 | 安全性 |
|------|------|------|--------|
| `/api/ai-tutor` | AI导师对话 | ✅ 必需 | ✅ 需Rate Limit |
| `/api/auth/impersonate` | 用户模拟 | ✅ 必需 | 🔒 仅管理员 |
| `/api/cron/cleanup-leaderboard` | 排行榜清理 | ✅ 必需 | 🔒 Vercel Cron |
| `/api/cron/trial-expiry` | 试用到期提醒 | ✅ 必需 | 🔒 Vercel Cron |
| `/api/webhook/stripe` | 支付回调 | ✅ 必需 | 🔒 Webhook签名验证 |

**安全建议**:
```typescript
// 所有Cron Job添加密钥验证
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }
  // ... 业务逻辑
}
```

---

## 3️⃣ components/ - React组件库

### 📂 目录结构

```
components/
├── ui/                          # 基础UI组件 (shadcn/ui)
├── business/                    # 业务组件
│   ├── auth/                    # 登录/注册表单
│   ├── charts/                  # 数据图表
│   ├── question/                # 题目渲染
│   ├── quiz/                    # 测验模式
│   └── settings/                # 设置面板
├── admin/                       # 管理后台组件
│   ├── content/                 # 内容管理
│   ├── feedback/                # 反馈处理
│   ├── permissions/             # 权限设置
│   └── users/                   # 用户管理
├── practice/                    # 练习系统组件
│   ├── analytics/               # 答题分析
│   ├── chapter-drill/           # 章节刷题
│   ├── modes/                   # 答题模式
│   ├── session/                 # 会话管理
│   └── smart-parser/            # 智能解析
├── dashboard/                   # 仪表盘组件
├── course/                      # 课程相关
├── layout/                      # 布局组件
├── marketing/                   # 营销页组件
├── ai/                          # AI交互组件
├── blog/                        # 博客组件
├── mobile/                      # 移动端适配
├── notification/                # 通知系统
├── performance/                 # 性能优化组件
├── permissions/                 # 权限控制
├── polyfills/                   # 浏览器兼容
├── pwa/                         # PWA相关
├── support/                     # 客服支持
└── compatibility/               # 兼容性警告
```

### ✅ 核心组件模块

#### **ui/** - 基础UI组件 (60+组件)
来自shadcn/ui + 自定义扩展

**代表性组件**:
- Button, Card, Dialog, Input, Select, Tabs
- Toast (通知), Sheet (抽屉), Dropdown (下拉)
- Progress (进度条), Slider (滑块), Switch (开关)
- **PinchZoomImage** (图片缩放 - 移动端)

**状态**: ✅ 全部必需

#### **business/** - 业务组件
| 模块 | 功能 | 状态 |
|------|------|------|
| `auth/` | 登录/注册表单 | ✅ 必需 |
| `charts/` | Recharts图表封装 | ✅ 必需 |
| `question/` | 题目渲染引擎 (支持LaTeX) | ✅ 必需 |
| `quiz/` | 测验UI (计时器/提交按钮) | ✅ 必需 |
| `settings/` | 设置面板组件 | ✅ 必需 |

#### **practice/** - 练习系统 (最复杂模块)
```
practice/
├── analytics/                   # 答题数据分析
│   ├── AccuracyChart.tsx
│   ├── ProgressHeatmap.tsx
│   └── WeakPointsCard.tsx
├── chapter-drill/               # 章节刷题
│   └── ChapterDrillSession.tsx
├── modes/                       # 答题模式选择器
│   └── PracticeModeSelector.tsx
├── session/                     # 答题会话管理
│   ├── QuestionNavigator.tsx
│   ├── SessionTimer.tsx
│   └── SubmitDialog.tsx
└── smart-parser/                # 智能题目解析 (AI辅助)
    ├── ImageParser.tsx          # OCR图片识别
    ├── LatexParser.tsx          # LaTeX公式解析
    └── QuestionImporter.tsx     # 批量导入
```
**状态**: ✅ 全部必需 - 核心学习功能

### ⚠️ 临时/调试组件检测

#### 🟡 `admin/users/mock/`
```
admin/users/mock/
└── MockUserData.tsx             # Mock数据生成器
```
**状态**: ⚠️ **仅开发环境使用**

**建议操作**:
```tsx
// 添加环境检查
if (process.env.NODE_ENV === 'production') {
  return null
}
```

#### 🟡 `compatibility/UnsupportedBrowserWarning.tsx`
**功能**: 不支持的浏览器警告
**状态**: ✅ 必需 - 但需确认支持的浏览器列表

**建议优化**:
```tsx
// 检测逻辑
const isUnsupported =
  !window.IntersectionObserver ||  // Safari < 12.1
  !window.ResizeObserver ||         // Chrome < 64
  !CSS.supports('display', 'grid')  // IE 11

// 仅在真正不支持时显示
```

#### ✅ `performance/` - 性能优化组件
```
performance/
├── LazyImage.tsx                # 懒加载图片
├── VirtualList.tsx              # 虚拟滚动列表
└── CodeSplitWrapper.tsx         # 代码分割包装器
```
**状态**: ✅ 必需 - 性能优化关键

#### ✅ `pwa/` - PWA功能
```
pwa/
├── InstallPrompt.tsx            # 安装提示
├── OfflineIndicator.tsx         # 离线指示器
└── UpdatePrompt.tsx             # 更新提示
```
**状态**: ✅ 必需 - 移动端体验核心

---

## 4️⃣ lib/ - 工具库与配置

### 📂 目录结构

```
lib/
├── __tests__/                   # 单元测试
├── content-pipeline/            # AI内容生成
│   ├── __tests__/
│   └── providers/               # AI服务提供商
├── email/                       # 邮件服务
│   └── templates/               # 邮件模板
├── hooks/                       # React Hooks
│   └── __tests__/
├── leaderboard/                 # 排行榜适配器
├── mock/                        # Mock数据 (开发用)
├── notification/                # 通知系统
├── permissions/                 # 权限系统
│   └── __tests__/
├── practice/                    # 练习逻辑
│   └── __tests__/
├── store/                       # Zustand状态管理
│   └── __tests__/
├── supabase/                    # Supabase客户端
├── prisma.ts                    # Prisma Client单例
├── utils.ts                     # 通用工具函数
└── [其他配置文件]
```

### ✅ 核心模块分析

#### **prisma.ts** - 数据库客户端
```typescript
// 单例模式,避免开发环境连接池耗尽
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: ['query'] })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```
**状态**: ✅ 必需 - 数据库核心

#### **supabase/** - 认证与存储
```
supabase/
├── client.ts        # 浏览器端客户端
├── server.ts        # 服务端客户端
└── middleware.ts    # 中间件辅助函数
```
**状态**: ✅ 必需 - 认证核心

#### **hooks/** - 自定义Hooks (12个)
| Hook | 功能 | 状态 |
|------|------|------|
| `useDebounce` | 防抖 | ✅ 必需 |
| `usePullToRefresh` | 下拉刷新 (移动端) | ✅ 必需 |
| `useMediaQuery` | 响应式查询 | ✅ 必需 |
| `useLocalStorage` | 本地存储 | ✅ 必需 |
| `useIntersectionObserver` | 可见性检测 | ✅ 必需 |
| `useKeyboardShortcut` | 键盘快捷键 | ✅ 必需 |
| `useTimer` | 计时器 | ✅ 必需 |
| `useQuizSession` | 答题会话 | ✅ 必需 |

#### **store/** - Zustand状态管理
```
store/
├── quiz-store.ts               # 测验状态
├── practice-store.ts           # 练习状态
├── ui-store.ts                 # UI状态 (侧边栏/主题)
└── notification-store.ts       # 通知队列
```
**状态**: ✅ 必需

#### **permissions/** - 权限系统
```typescript
// RBAC (基于角色的访问控制)
export type Role = 'STUDENT' | 'TEACHER' | 'ADMIN'

export const can = (user: User, action: string, resource?: any) => {
  // 权限检查逻辑
}
```
**状态**: ✅ 必需 - 安全核心

### ⚠️ 可清理模块

#### 🟡 **mock/** - Mock数据
```
mock/
├── subjects.ts                 # 科目Mock
├── questions.ts                # 题目Mock
└── users.ts                    # 用户Mock
```
**状态**: ⚠️ **仅开发/测试使用**

**建议操作**:
```bash
# 1. 移动到开发依赖专用目录
mkdir -p src/__dev__/mock
mv src/lib/mock/* src/__dev__/mock/

# 2. 更新导入路径 (仅在开发环境导入)
if (process.env.NODE_ENV === 'development') {
  const { mockData } = await import('@/__dev__/mock/subjects')
}
```

#### 🟡 **content-pipeline/providers/** - AI提供商
```
providers/
├── anthropic.ts                # Claude API
├── gemini.ts                   # Gemini API
└── openai.ts                   # OpenAI API (未使用?)
```
**建议检查**:
```bash
# 检查是否真的使用了OpenAI
grep -r "openai" src/
# 如果未使用,删除该文件
```

---

## 5️⃣ types/ - TypeScript类型定义

### 📂 目录结构

```
types/
├── admin-user.ts               # 管理后台类型
├── content-pipeline.ts         # 内容管道类型
├── feedback.ts                 # 反馈类型
└── index.ts                    # 统一导出
```

### ✅ 类型定义分析

```typescript
// index.ts - 统一导出
export * from '@prisma/client'  // Prisma生成的类型
export type { AdminUser } from './admin-user'
export type { ContentTask, AIProvider } from './content-pipeline'
export type { FeedbackStatus, FeedbackType } from './feedback'
```

**状态**: ✅ 全部必需

**建议优化**:
```typescript
// 添加更多业务类型
export type QuizSession = {
  id: string
  userId: string
  questions: Question[]
  answers: UserAnswer[]
  startTime: Date
  endTime?: Date
}
```

---

## 6️⃣ providers/ - React Context Providers

### 📂 目录结构

```
providers/
├── app-provider.tsx            # 全局Provider包装器
└── theme-provider.tsx          # 主题Provider (暗黑模式)
```

### ✅ Provider分析

```tsx
// app-provider.tsx
export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <Toaster />
        {children}
      </QueryClientProvider>
    </ThemeProvider>
  )
}
```

**状态**: ✅ 必需 - 应用根Provider

---

## 7️⃣ proxy.ts - 代理配置

### 📄 文件分析

```typescript
// src/proxy.ts
export const PROXY_CONFIG = {
  '/api/ai': {
    target: process.env.AI_SERVICE_URL,
    changeOrigin: true,
  },
}
```

**功能**: 开发环境API代理
**状态**: ⚠️ **确认是否还在使用**

**检查方法**:
```bash
# 查找引用
grep -r "proxy.ts" src/
grep -r "PROXY_CONFIG" .

# 如果未使用,建议删除
```

---

## 📊 整体统计与建议

### 📈 代码健康度统计

| 指标 | 数量 | 状态 |
|------|------|------|
| 总文件数 | 500+ | ✅ |
| Server Actions | 30+ | ✅ |
| React组件 | 200+ | ✅ |
| 自定义Hooks | 12 | ✅ |
| API Routes | 6 | ✅ |
| 页面路由 | 30 | ✅ |
| 单元测试文件 | 20+ | ⚠️ 覆盖率待提升 |

### 🧹 清理建议汇总

#### 🔴 **必须处理** (3项)

1. **删除重复路由**
   ```bash
   rm -rf src/app/dashboard/admin/referrals/
   # 使用 src/app/(dashboard)/admin/ 统一管理
   ```

2. **限制调试页面访问**
   ```typescript
   // src/app/(dashboard)/dashboard/debug/ui-kit/page.tsx
   if (process.env.NODE_ENV === 'production') {
     redirect('/dashboard')
   }
   ```

3. **移动error-wiper到管理后台**
   ```bash
   mv src/app/(dashboard)/dashboard/practice/error-wiper \
      src/app/(dashboard)/admin/tools/error-wiper
   ```

#### 🟡 **建议优化** (5项)

4. **Mock数据隔离**
   ```bash
   mkdir -p src/__dev__/mock
   mv src/lib/mock/* src/__dev__/mock/
   ```

5. **检查未使用的AI提供商**
   ```bash
   # 如果未使用OpenAI
   rm src/lib/content-pipeline/providers/openai.ts
   ```

6. **检查proxy.ts是否使用**
   ```bash
   grep -r "PROXY_CONFIG" .
   # 如未使用则删除
   ```

7. **添加题目导入权限检查**
   ```typescript
   // src/app/(dashboard)/dashboard/practice/import/page.tsx
   await requireRole(['ADMIN', 'TEACHER'])
   ```

8. **限制Mock组件为开发环境**
   ```typescript
   // src/components/admin/users/mock/MockUserData.tsx
   if (process.env.NODE_ENV === 'production') return null
   ```

#### ✅ **质量提升** (3项)

9. **提升单元测试覆盖率**
   ```bash
   # 目标: 核心模块 >80%
   pnpm test --coverage
   ```

10. **添加API Rate Limiting**
    ```typescript
    // src/app/api/ai-tutor/route.ts
    import { ratelimit } from '@/lib/redis'
    const { success } = await ratelimit.limit(userId)
    if (!success) return Response('Too Many Requests', { status: 429 })
    ```

11. **添加Cron Job密钥验证**
    ```typescript
    // src/app/api/cron/*/route.ts
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response('Unauthorized', { status: 401 })
    }
    ```

---

## 🎯 推荐执行顺序

### Phase 1: 立即清理 (30分钟)
```bash
# 1. 删除重复路由
rm -rf src/app/dashboard/admin/referrals/

# 2. 检查并删除未使用文件
grep -r "PROXY_CONFIG" . || rm src/proxy.ts
grep -r "openai" src/lib/content-pipeline/ || rm src/lib/content-pipeline/providers/openai.ts

# 3. 移动Mock数据
mkdir -p src/__dev__/mock
mv src/lib/mock/* src/__dev__/mock/
```

### Phase 2: 安全加固 (1小时)
```typescript
// 1. 添加环境检查到调试页面
// 2. 添加权限检查到敏感功能
// 3. 添加Cron Job密钥验证
```

### Phase 3: 测试与验证 (1小时)
```bash
# 1. 运行所有测试
pnpm test

# 2. 类型检查
pnpm tsc --noEmit

# 3. Lint检查
pnpm lint

# 4. 构建验证
pnpm build
```

---

## 📝 检查清单

```
Phase 1: 清理
- [ ] 删除 src/app/dashboard/admin/referrals/
- [ ] 移动 Mock数据到 src/__dev__/
- [ ] 移动 error-wiper到管理后台
- [ ] 删除未使用的 proxy.ts (如适用)
- [ ] 删除未使用的 openai.ts (如适用)

Phase 2: 安全
- [ ] 调试页面添加环境检查
- [ ] 题目导入添加权限检查
- [ ] Cron Jobs添加密钥验证
- [ ] AI API添加Rate Limiting
- [ ] Mock组件添加环境检查

Phase 3: 测试
- [ ] pnpm test (所有测试通过)
- [ ] pnpm tsc --noEmit (无类型错误)
- [ ] pnpm lint (无Lint错误)
- [ ] pnpm build (构建成功)
- [ ] 手动测试核心功能
```

---

## 🔍 附录: 关键文件清单

### 必须保留的核心文件 (Top 20)

1. `src/lib/prisma.ts` - 数据库客户端
2. `src/lib/supabase/server.ts` - 认证服务端
3. `src/actions/auth.ts` - 认证逻辑
4. `src/actions/quiz.ts` - 答题评分引擎
5. `src/actions/progress.ts` - 进度同步
6. `src/components/business/question/QuestionRenderer.tsx` - 题目渲染
7. `src/components/business/quiz/QuizSession.tsx` - 测验会话
8. `src/components/course/CourseTree.tsx` - 课程树
9. `src/lib/hooks/useDebounce.ts` - 防抖Hook
10. `src/lib/store/quiz-store.ts` - 测验状态
11. `src/app/(dashboard)/dashboard/page.tsx` - 仪表盘首页
12. `src/app/course/[subjectId]/[lessonId]/page.tsx` - 课程学习页
13. `src/components/layout/AppSidebar.tsx` - 侧边栏
14. `src/middleware.ts` - 路由保护中间件 (根目录)
15. `src/lib/permissions/index.ts` - 权限系统
16. `src/app/api/ai-tutor/route.ts` - AI导师API
17. `src/components/practice/session/SessionTimer.tsx` - 答题计时器
18. `src/actions/leaderboard.ts` - 排行榜
19. `src/lib/email/templates/` - 邮件模板
20. `src/app/layout.tsx` - 全局布局

---

**分析完成时间**: 2026-02-06
**下次更新**: 代码重构后重新分析
**维护者**: Development Team
