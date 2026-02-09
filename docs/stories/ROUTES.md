# LearnMore v1.0 完整路由清单

本文档记录了项目中所有有效的路由路径及其功能说明。

**最后更新**: 2026-01-13
**总路由数**: 24个

---

## 📂 路由结构总览

```
LearnMore v1.0
├── 🏠 营销与公共页面 (13个)
├── 🔐 认证页面 (2个)
├── 📊 用户仪表盘 (7个)
└── 📚 课程学习 (2个)
```

---

## 🏠 营销与公共页面 (13个)

这些页面无需登录即可访问，用于产品展示和用户获取。

| 路由 | 页面名称 | 文件路径 | 说明 |
|------|---------|---------|------|
| `/` | Landing Page | `src/app/page.tsx` | 首页/营销页面，展示产品核心价值 |
| `/about-us` | 关于我们 | `src/app/about-us/page.tsx` | 公司/团队介绍 |
| `/how-it-works` | 工作原理 | `src/app/how-it-works/page.tsx` | 产品功能介绍和使用流程 |
| `/subjects` | 课程体系 | `src/app/subjects/page.tsx` | 6大学科介绍 (数理化英语生) |
| `/pricing` | 价格方案 | `src/app/pricing/page.tsx` | 订阅计划和定价 |
| `/success-stories` | 成功案例 | `src/app/success-stories/page.tsx` | 学员故事和使用案例 |
| `/blog` | 博客列表 | `src/app/blog/page.tsx` | 教育资讯和学习技巧 |
| `/blog/[slug]` | 博客详情 | `src/app/blog/[slug]/page.tsx` | 单篇博客文章 (动态路由) |
| `/study-guides` | 学习指南 | `src/app/study-guides/page.tsx` | 学习方法和备考指南 |
| `/student-care` | 学生关怀 | `src/app/student-care/page.tsx` | 支持中心/常见问题 |
| `/contact` | 联系我们 | `src/app/contact/page.tsx` | 联系方式和反馈表单 |
| `/privacy` | 隐私政策 | `src/app/privacy/page.tsx` | 隐私保护政策 |
| `/terms` | 服务条款 | `src/app/terms/page.tsx` | 用户协议和使用条款 |

---

## 🔐 认证页面 (2个)

使用 Supabase Auth 进行用户认证管理。

| 路由 | 页面名称 | 文件路径 | 说明 |
|------|---------|---------|------|
| `/login` | 登录页 | `src/app/(auth)/login/page.tsx` | 用户登录表单 |
| `/register` | 注册页 | `src/app/(auth)/register/page.tsx` | 新用户注册表单 |

**特殊处理**:
- 已登录用户访问这两个页面会被自动重定向到 `/dashboard`
- 支持 `?redirectTo=` 参数，登录后跳回原页面

---

## 📊 用户仪表盘 (7个)

需要登录才能访问，所有路由以 `/dashboard` 开头。

| 路由 | 页面名称 | 文件路径 | 功能说明 |
|------|---------|---------|---------|
| `/dashboard` | 主仪表盘 | `src/app/(dashboard)/dashboard/page.tsx` | 数据概览、学习统计、近期活动 |
| `/dashboard/settings` | 用户设置 | `src/app/(dashboard)/dashboard/settings/page.tsx` | 个人资料、头像上传、密码修改 |
| `/dashboard/leaderboard` | 排行榜 | `src/app/(dashboard)/dashboard/leaderboard/page.tsx` | 周榜/月榜/总榜，竞赛榜单 |
| `/dashboard/community` | 社区首页 | `src/app/(dashboard)/dashboard/community/page.tsx` | 帖子列表、话题分类 |
| `/dashboard/community/new` | 发布新帖 | `src/app/(dashboard)/dashboard/community/new/page.tsx` | 创建新讨论帖（支持富文本） |
| `/dashboard/community/[postId]` | 帖子详情 | `src/app/(dashboard)/dashboard/community/[postId]/page.tsx` | 帖子内容、评论互动 (动态路由) |
| `/dashboard/practice` | 练习中心 | `src/app/(dashboard)/dashboard/practice/page.tsx` | 题库练习和测验 |

**布局特性**:
- 所有 `/dashboard/*` 页面共享 `(dashboard)/layout.tsx` 布局
- 包含侧边栏导航 (AppSidebar) 和顶部导航栏
- 响应式设计：桌面端显示侧边栏，移动端使用抽屉菜单

---

## 📚 课程学习 (2个)

课程浏览和学习功能，支持视频播放和进度追踪。

| 路由 | 页面名称 | 文件路径 | 功能说明 |
|------|---------|---------|---------|
| `/course/[subjectId]` | 课程目录 | `src/app/course/[subjectId]/page.tsx` | 显示章节树状结构 (动态路由) |
| `/course/[subjectId]/[lessonId]` | 课程学习页 | `src/app/course/[subjectId]/[lessonId]/page.tsx` | 视频播放、文档阅读、练习题 (动态路由) |

**动态参数**:
- `[subjectId]`: 学科ID (例: `math`, `physics`, `chemistry`, `english`, `chinese`, `biology`)
- `[lessonId]`: 课程ID (UUID格式)

**功能特性**:
- 视频进度自动保存 (每30秒)
- 支持章节导航和快速跳转
- 学习记录同步到用户进度表

---


## 🔒 路由保护与中间件

### Middleware 保护规则 (`middleware.ts`)

```typescript
// 路由保护逻辑
未登录 + 访问 /dashboard/* → 重定向到 /login?redirectTo={原路径}
已登录 + 访问 /login 或 /register → 重定向到 /dashboard
```

### 公开路由 (无需登录)

- 所有营销页面: `/`, `/about-us`, `/pricing`, `/blog/*` 等
- 认证页面: `/login`, `/register`
- 法律页面: `/privacy`, `/terms`

### 受保护路由 (需要登录)

- 所有仪表盘页面: `/dashboard/*`
- 课程学习页面: `/course/*`

### Session 管理

- **有效期**: 1小时 (滑动窗口机制)
- **Cookie**: HttpOnly, Secure (生产环境), SameSite=Lax
- **刷新策略**: 每次请求自动延长有效期

---

## 📊 路由统计汇总

| 分类 | 数量 | 完成状态 |
|------|------|---------|
| 营销与公共页面 | 13个 | ✅ 完成 |
| 认证页面 | 2个 | ✅ 完成 |
| 用户仪表盘 | 7个 | ✅ 完成 |
| 课程学习 | 2个 | ✅ 完成 |
| **总计** | **24个** | - |

---

## 🗑️ 已移除的功能

以下路由已在 2026-01-13 被移除：

1. **`/dashboard/practice/debug`** - 开发调试工具（已删除）
2. **`/error-book`** - 错题本功能（已删除）

**移除原因**: 功能规划调整，未来版本可能会重新设计实现。

---

## 🗂️ 文件结构映射

### 路由组 (Route Groups)

项目使用 Next.js 路由组功能来组织代码，但不影响实际URL：

```
src/app/
├── (auth)/          ← 路由组，不出现在URL中
│   ├── login/       → 实际路由: /login
│   └── register/    → 实际路由: /register
│
└── (dashboard)/     ← 路由组，不出现在URL中
    └── dashboard/   → 实际路由: /dashboard/*
```

### 布局继承关系

```
全局布局 (app/layout.tsx)
├── 营销页面 (无额外布局)
├── 认证布局 (app/(auth)/layout.tsx)
│   ├── /login
│   └── /register
└── 仪表盘布局 (app/(dashboard)/layout.tsx)
    └── /dashboard/*
```

---

## 📝 维护指南

### 新增路由时的注意事项

1. **命名规范**
   - 使用小写字母 + 连字符: `practice-center`, `error-book`
   - 动态路由使用方括号: `[postId]`, `[lessonId]`

2. **文件位置**
   - 功能页面放在 `(dashboard)/dashboard/` 下
   - 营销页面直接放在 `app/` 根目录
   - 认证页面放在 `(auth)/` 下

3. **必需文件**
   - 每个路由至少包含 `page.tsx`
   - 可选: `layout.tsx`, `loading.tsx`, `error.tsx`

4. **更新文档**
   - 新增路由后立即更新本文档
   - 同步更新 `docs/stories/项目结构&文件介绍.md`
   - 如有Story相关，更新对应Story文件

### 删除路由时的注意事项

1. 检查是否有其他页面链接到该路由
2. 搜索代码中的硬编码路径: `href="/xxx"` 或 `redirect('/xxx')`
3. 更新导航菜单组件 (`AppSidebar.tsx`, `Navbar.tsx`)
4. 更新本文档和相关Story文件

---

## 🔗 相关文档

- **路由结构详解**: `/docs/reports/ROUTE_STRUCTURE.md`
- **项目结构文档**: `/docs/stories/项目结构&文件介绍.md`
- **中间件配置**: `/middleware.ts`
- **认证系统**: Story-003 Authentication System
- **仪表盘开发**: Story-004 App Shell & Navigation

---

**维护者**: Claude Code
**最后检查**: 2026-01-13
**状态**: ✅ 所有路由已验证并记录
