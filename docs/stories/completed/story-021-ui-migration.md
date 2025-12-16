# Story-021: UI组件迁移与适配

**状态**: Completed ✅
**优先级**: P0 (Critical - Phase 6核心)
**预计工时**: 6-8小时
**前置依赖**: Story-001~Story-020 (基础架构已完成)
**阻塞Story**: Story-022, Story-023

---

## 1. 目标 (Objectives)

将Gemini AI Studio生成的前端页面迁移到Next.js项目,完成UI组件的适配和优化。

- [x] 迁移LandingPage到Next.js App Router
- [x] 迁移LoginPage和RegisterPage
- [x] 迁移Dashboard及其7个子视图组件
- [x] 替换Vite特有的API为Next.js等价物
- [x] 使用Shadcn/ui替代自定义UI组件
- [x] 确保所有页面响应式布局正常工作
- [x] 修复所有TypeScript类型错误

---

## 2. 技术方案 (Tech Plan)

### Step 1: 创建Next.js页面结构

```bash
# 创建页面文件
src/app/
├── page.tsx                    # LandingPage
├── login/page.tsx              # LoginPage
├── register/page.tsx           # RegisterPage
└── dashboard/
    └── page.tsx                # Dashboard主页
```

### Step 2: 迁移LandingPage

**源文件**: `learnmore_aistudio/pages/LandingPage.tsx`

**迁移任务**:
1. 创建 `src/app/page.tsx` (默认为Server Component)
2. 提取交互组件为Client Components:
   - HeroSection中的CTA按钮交互
   - SubjectCard的hover效果
   - 定价表的"立即订阅"按钮
3. 使用Shadcn/ui组件:
   - Button → `@/components/ui/button`
   - Card → `@/components/ui/card`
4. 替换路由跳转:
   ```typescript
   // Before (Vite)
   import { useNavigate } from 'react-router-dom';
   const navigate = useNavigate();
   navigate('/login');

   // After (Next.js)
   import Link from 'next/link';
   <Link href="/login">登录</Link>
   ```

### Step 3: 迁移认证页面 (Login & Register)

**源文件**:
- `learnmore_aistudio/pages/LoginPage.tsx`
- `learnmore_aistudio/pages/RegisterPage.tsx`

**迁移任务**:
1. 创建 `src/app/login/page.tsx` 和 `src/app/register/page.tsx`
2. 标记为Client Component (`'use client'`)
3. 使用Shadcn/ui表单组件:
   - Input → `@/components/ui/input`
   - Label → `@/components/ui/label`
   - Button → `@/components/ui/button`
4. **注意**: 此阶段不打通Supabase Auth,仅保留UI和Mock验证逻辑:
   ```typescript
   const handleLogin = async (e: React.FormEvent) => {
     e.preventDefault();
     // Mock成功登录,跳转到Dashboard
     router.push('/dashboard');
   };
   ```

### Step 4: 迁移Dashboard主页

**源文件**: `learnmore_aistudio/pages/Dashboard.tsx`

**迁移任务**:
1. 创建 `src/app/dashboard/page.tsx`
2. 迁移7个子视图组件:
   ```
   src/components/dashboard/
   ├── DashboardHome.tsx        # 首页视图
   ├── SubjectsView.tsx         # 学科列表
   ├── ProgressView.tsx         # 学习统计
   ├── ErrorBookView.tsx        # 错题本
   ├── CommunityView.tsx        # 社区论坛
   ├── LeaderboardView.tsx      # 排行榜
   └── ProfileView.tsx          # 个人设置
   ```
3. 使用Tabs组件管理视图切换:
   ```typescript
   import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

   <Tabs defaultValue="home">
     <TabsList>
       <TabsTrigger value="home">首页</TabsTrigger>
       <TabsTrigger value="subjects">学科</TabsTrigger>
       {/* ... */}
     </TabsList>
     <TabsContent value="home"><DashboardHome /></TabsContent>
     {/* ... */}
   </Tabs>
   ```

### Step 5: 迁移Navbar组件

**源文件**: `learnmore_aistudio/components/Navbar.tsx`

**迁移任务**:
1. 创建 `src/components/layout/Navbar.tsx`
2. 标记为Client Component (需要处理用户交互)
3. 使用Next.js Link组件替代React Router
4. 集成next-themes的主题切换按钮
5. 添加Mock用户数据显示:
   ```typescript
   import { mockUser } from '@/lib/mock';

   <Avatar>
     <AvatarImage src={mockUser.avatar} />
     <AvatarFallback>{mockUser.username[0]}</AvatarFallback>
   </Avatar>
   ```

### Step 6: 类型安全与验证

**创建类型定义文件**: `src/types/index.ts`

```typescript
export interface User {
  id: string;
  email: string;
  username: string;
  avatar: string;
  grade: number;
  level: number;
  xp: number;
  streak: number;
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  progress: number;
  lastLesson: string;
  masteryLevel: number;
}

// ... 其他类型定义
```

### Step 7: 质量检查

```bash
# 运行质量检查命令
pnpm lint
pnpm tsc --noEmit
pnpm build
```

**必须零错误才能进入下一步**。

---

## 3. 验收标准 (Verification)

### 功能验收
- [x] 访问 `http://localhost:3000` 可以看到完整的LandingPage
- [x] 点击"立即登录"按钮可以跳转到 `/login`
- [x] 点击"免费试用"按钮可以跳转到 `/register`
- [x] Login页面输入任意账号密码可以跳转到 `/dashboard`
- [x] Dashboard的7个Tab切换正常工作
- [x] Navbar的导航链接可以正常跳转

### 响应式布局验收
- [x] Desktop (1920x1080): 所有页面布局正常
- [x] Tablet (768x1024): 侧边栏折叠,卡片网格调整
- [x] Mobile (375x667): 单列布局,导航栏变为汉堡菜单

### 视觉一致性验收
- [x] 所有按钮样式统一使用Shadcn/ui Button组件
- [x] 颜色主题符合Tailwind配置
- [x] 字体大小和间距符合设计规范
- [x] 图标使用Lucide React图标库

### 代码质量验收
- [x] ESLint检查通过 (0 errors, 0 warnings)
- [x] TypeScript编译通过 (0 errors)
- [x] Build成功 (pnpm build)
- [x] 无console.error或console.warn

---

## 4. 交付物 (Deliverables)

### 页面文件
- `src/app/page.tsx` - LandingPage
- `src/app/login/page.tsx` - 登录页
- `src/app/register/page.tsx` - 注册页
- `src/app/dashboard/page.tsx` - 仪表盘主页

### 组件文件
- `src/components/layout/Navbar.tsx` - 导航栏
- `src/components/dashboard/DashboardHome.tsx` - 仪表盘首页
- `src/components/dashboard/SubjectsView.tsx` - 学科视图
- `src/components/dashboard/ProgressView.tsx` - 进度视图
- `src/components/dashboard/ErrorBookView.tsx` - 错题本视图
- `src/components/dashboard/CommunityView.tsx` - 社区视图
- `src/components/dashboard/LeaderboardView.tsx` - 排行榜视图
- `src/components/dashboard/ProfileView.tsx` - 个人设置视图

### 类型定义
- `src/types/index.ts` - 全局类型定义

### 质量报告
- ESLint检查结果截图
- TypeScript编译结果截图
- Build成功截图

---

## 5. Definition of Done (DoD)

- [x] 所有Objectives已完成
- [x] 所有Verification测试通过
- [x] 所有Deliverables已交付
- [x] 质量检查命令通过: `pnpm lint && pnpm tsc --noEmit && pnpm build`
- [x] 代码已commit到 `feature/phase-6-ui-finalization` 分支
- [x] 已更新 `docs/memory-bank/active_context.md`
- [x] 已更新 `docs/memory-bank/roadmap.md` (标记Story-021为已完成)

---

## 6. 注意事项

### ⚠️ 重要提醒

1. **不打通后端功能**: 此Story只关注UI迁移,不调用真实的Supabase Auth或Prisma
2. **使用Mock数据**: 所有数据展示使用 `src/lib/mock/index.ts` 中的Mock数据
3. **保持简洁**: 不要添加额外功能,严格按照AI Studio生成的原始设计迁移
4. **组件复用**: 优先使用Shadcn/ui组件,避免重复造轮子

### 🔧 常见问题解决

**问题1**: Vite的`import.meta.env`在Next.js中不可用
**解决方案**: 使用`process.env.NEXT_PUBLIC_*`

**问题2**: React Router的`useNavigate`在Next.js中不可用
**解决方案**: 使用`next/navigation`的`useRouter`或`next/link`的`Link`组件

**问题3**: CSS Modules导入路径不同
**解决方案**: Next.js自动支持CSS Modules,确保文件名为`*.module.css`

---

## 7. 时间记录

- **预计**: 6-8小时
- **实际**: _待填写_
- **差异原因**: _待填写_

---

## 8. 遇到的坑与解决方案

_开发过程中遇到的问题和解决方案,完成后填写_

---

**创建时间**: 2025-12-13
**最后更新**: 2025-12-13
