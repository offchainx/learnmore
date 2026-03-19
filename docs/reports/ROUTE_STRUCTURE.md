# LearnMore v1.0 路由结构说明 (最真实版)

## 📂 完整路由结构映射

```
src/app/
├── page.tsx                          → /                          (Landing Page 营销首页)
├── (auth)/                           → 认证路由组
│   ├── login/page.tsx                → /login                     (登录)
│   └── register/page.tsx             → /register                  (注册)
│
├── (dashboard)/                      → 仪表盘布局组 (共享 Sidebar/Nav)
│   ├── admin/                        → /admin                     (管理后台)
│   │   ├── page.tsx                  → /admin                     (后台概览)
│   │   ├── content/                  → /admin/content             (内容管理)
│   │   │   ├── page.tsx              → /admin/content             (题目列表)
│   │   │   ├── statistics/page.tsx   → /admin/content/statistics  (数据统计)
│   │   │   ├── review/               → /admin/content/review      (审核中心)
│   │   │   │   ├── page.tsx          → /admin/content/review      (待审核列表)
│   │   │   │   └── [questionId]/     → /admin/content/review/[id] (审核详情)
│   │   │   ├── [id]/edit/page.tsx    → /admin/content/[id]/edit   (编辑题目)
│   │   │   ├── import/page.tsx       → /admin/content/import      (批量导入)
│   │   │   └── reports/page.tsx      → /admin/content/reports     (举报/纠错处理)
│   │   ├── users/                    → /admin/users               (用户管理)
│   │   │   ├── page.tsx              → /admin/users               (用户列表)
│   │   │   └── [id]/page.tsx         → /admin/users/[id]          (用户详情/权限设置)
│   │   └── permissions/page.tsx      → /admin/permissions         (全局权限/角色管理)
│   │
│   └── dashboard/                    → /dashboard                 (学生/用户中心)
│       ├── page.tsx                  → /dashboard                 (个人主页)
│       ├── settings/page.tsx         → /dashboard/settings        (个人设置)
│       ├── achievements/page.tsx     → /dashboard/achievements    (成就勋章)
│       ├── leaderboard/page.tsx      → /dashboard/leaderboard     (排行榜)
│       ├── courses/page.tsx          → /dashboard/courses         (我的课程)
│       ├── practice/                 → /dashboard/practice        (练习中心)
│       │   ├── page.tsx              → /dashboard/practice        (模式选择)
│       │   ├── error-wiper/page.tsx  → /dashboard/practice/error-wiper (错题消灭)
│       │   ├── smart-drill/page.tsx  → /dashboard/practice/smart-drill (智能刷题)
│       │   ├── chapter-drill/        → /dashboard/practice/chapter-drill/[id] (章节练习)
│       │   ├── mock-arena/           → /dashboard/practice/mock-arena (全真模考)
│       │   │   ├── page.tsx          → /dashboard/practice/mock-arena (试卷列表)
│       │   │   └── [examId]/page.tsx → /dashboard/practice/mock-arena/[id] (考试中)
│       │   └── import/page.tsx       → /dashboard/practice/import (题目/笔记导入)
│       ├── community/                → /dashboard/community       (互动社区)
│       │   ├── page.tsx              → /dashboard/community       (广场)
│       │   ├── new/page.tsx          → /dashboard/community/new   (发布帖子)
│       │   └── [postId]/page.tsx     → /dashboard/community/[id]  (帖子详情)
│       ├── debug/ui-kit/page.tsx     → /dashboard/debug/ui-kit    (UI 组件开发测试)
│       └── admin/referrals/page.tsx  → /dashboard/admin/referrals (旧版/特定路径推荐管理)
│
├── course/                           → /course                    (课程详情系统)
│   └── [subjectId]/
│       ├── page.tsx                  → /course/[subjectId]
│       └── [lessonId]/page.tsx       → /course/[subjectId]/[lessonId]
│
├── blog/                             → /blog                      (博客/资讯)
│   ├── page.tsx                      → /blog                      (列表页)
│   └── [slug]/page.tsx               → /blog/[slug]               (文章详情)
│
└── 其他公共页面/
    ├── about-us/page.tsx             → /about-us
    ├── pricing/page.tsx              → /pricing
    ├── contact/page.tsx              → /contact
    ├── privacy/page.tsx              → /privacy
    ├── terms/page.tsx                → /terms
    ├── how-it-works/page.tsx         → /how-it-works
    ├── student-care/page.tsx         → /student-care
    ├── study-guides/page.tsx         → /study-guides
    ├── subjects/page.tsx             → /subjects
    └── success-stories/page.tsx      → /success-stories
```

## 📊 路由统计 (最新)

- **营销与公共页面**: 15个 (/, /about-us, /pricing, /blog, /contact, etc.)
- **认证页面**: 2个 (/login, /register)
- **学生仪表盘页面**: 15个 (/dashboard/*)
- **管理后台页面**: 11个 (/admin/*)
- **课程系统页面**: 2个 (/course/*)

**总计**: 45个真实有效的物理页面路由

## 🛡️ 路由保护机制

1. **Middleware (`src/proxy.ts`)**: 
   - 自动重定向未登录用户访问受限路由。
   - 拦截 `/dashboard/*` 和 `/admin/*`。
2. **Role-Based Access Control (RBAC)**:
   - `/admin/*` 路径不仅需要登录，还需要 `ADMIN` 或 `CONTENT_EDITOR` 角色权限。
3. **Impersonation (伪装登录)**:
   - 管理员可通过 `/admin/users` 启动伪装登录，此时 `proxy.ts` 会检查 `impersonation_token`。

---

**最后更新**: 2026-02-04 (基于物理 `page.tsx` 文件扫描更新)