# Story-023: UI Integration & Next.js Adaptation

**状态**: Active 🔵
**优先级**: P0
**前置任务**: Story-022 (UI Design Iteration)

## 目标
将 AI Studio 在 `ai_studio_iterations/learnmore` 中开发的 React (SPA) 组件库，完整迁移并适配到 `src/` 目录下的 Next.js 14+ (App Router) 架构中。确保所有页面路由正常、样式无误，并实现基本的国际化 (i18n) 框架。

---

## 任务拆解 (Task Breakdown)

### 1. 基础架构迁移 (Infrastructure)
- [x] **Tailwind 配置同步**: 将 `ai_studio_iterations/learnmore/tailwind.config.ts` 中的自定义颜色、动画配置合并到项目根目录的 `tailwind.config.ts`。
- [x] **全局样式迁移**: 检查并迁移 `globals.css` 中的自定义动画关键帧 (keyframes) 和实用类。
- [x] **依赖安装**: 确认并安装新引入的 UI 库依赖 (如 `lucide-react`, `framer-motion` 等，如果 AI Studio 用了的话)。
- [x] **工具类迁移**: 迁移 `utils/translations.ts` 并建立基于 Context 的轻量级 i18n 方案 (暂维持客户端 Context 模式，后续可升级服务端字典)。

### 2. 组件库迁移 (Component Library)
- [x] **UI 原子组件**: 迁移 `components/ui/` (Button, Card, Input, Tabs, Badge, Label 等) 到 `src/components/ui/`。
  - *注意*: 确保所有组件添加 `"use client"` 指令（如果包含交互）。
- [x] **布局组件**: 迁移 `components/layout/` 到 `src/components/layout/`。
  - *适配*: `Navbar` 和 `DashboardLayout` 需要适配 `next/link` 和 `next/navigation` (`usePathname`)。

### 3. 页面路由适配 (Page & Routing)
- [x] **Landing Page**:
  - 迁移 `LandingPage.tsx` -> `src/app/page.tsx`。
  - 迁移 `ProductTourPage.tsx` -> `src/app/how-it-works/page.tsx`。
- [x] **Marketing Pages**:
  - `SubjectsPage.tsx` -> `src/app/subjects/page.tsx`。
  - `PricingPage.tsx` -> `src/app/pricing/page.tsx`。
  - `AboutUsPage.tsx` -> `src/app/about-us/page.tsx`。
  - `SuccessStoriesPage.tsx` -> `src/app/success-stories/page.tsx`。
  - `BlogPage.tsx` -> `src/app/blog/page.tsx`。
  - `StudyGuidePage.tsx` -> `src/app/study-guides/page.tsx`。
  - `StudentCarePage.tsx` -> `src/app/student-care/page.tsx`。
- [x] **Auth Pages**:
  - `LoginPage.tsx` -> `src/app/(auth)/login/page.tsx`。
  - `RegisterPage.tsx` -> `src/app/(auth)/register/page.tsx`。
- [x] **Dashboard Core**:
  - *重构*: Dashboard 目前是 SPA 模式 (`currentView` state)。需要重构为 Next.js 的嵌套路由或保持 Client Component 模式但优化加载。
  - **方案**: 暂时保留 `src/app/(dashboard)/dashboard/page.tsx` 作为主入口，内部挂载 `DashboardClient` 组件来维持 SPA 体验（这是最快迁移路径，且符合 Dashboard 高交互特性）。
  - 迁移 `Dashboard.tsx` -> `src/components/dashboard/DashboardClient.tsx`。
  - 迁移子视图组件到 `src/components/dashboard/views/`。

### 4. 逻辑适配 (Logic Adaptation)
- [x] **路由跳转**: 将所有 `useNavigate` 替换为 `useRouter` (from `next/navigation`)。
- [x] **图片资源**: 将 `<img>` 标签替换为 `next/image` (可选，优先保证功能，如有外部链接需配置 `next.config.ts`)。
- [x] **Context**: 迁移 `AppContext.tsx` 到 `src/providers/app-provider.tsx` 并确保在 `src/app/layout.tsx` 中包裹。

---

## 验收标准 (Definition of Done)
1.  **无编译错误**: `pnpm build` 通过。
2.  **路由通畅**: 能够从 Landing Page 点击导航进入各个子页面及 Dashboard。
3.  **样式一致**: 页面视觉效果与 AI Studio 预览一致（Dark Mode 正常）。
4.  **交互可用**: Dashboard 的 Tab 切换、Quiz 演示、Sidebar 导航可用。

---

## 执行指令
请按顺序执行上述任务，每完成一步请进行验证。