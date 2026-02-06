# 🚀 LearnMore 上线检查清单

> **生成时间**: 2026-02-06
> **项目**: 中学生在线教育平台 (LearnMore v1.0)
> **目标**: 确保生产环境部署的安全性、性能和用户体验

---

## 📋 检查清单概览

- ✅ **安全性检查** (Security) - 11项
- ✅ **性能优化** (Performance) - 8项
- ✅ **SEO优化** (SEO) - 7项
- ✅ **功能完整性** (Functionality) - 12项
- ✅ **用户体验** (UX) - 6项
- ✅ **监控与日志** (Monitoring) - 5项
- ✅ **合规性** (Compliance) - 4项

**总计**: 53项检查

---

## 🔒 1. 安全性检查 (Security)

### 1.1 环境变量配置

- [ ] **Vercel环境变量已配置**
  - [ ] `DATABASE_URL` (Supabase连接池URL)
  - [ ] `DIRECT_URL` (Supabase直连URL)
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` (仅服务端)
  - [ ] `RESEND_API_KEY` (邮件服务)
  - [ ] `STRIPE_SECRET_KEY` (支付，如已启用)
  - [ ] `ANTHROPIC_API_KEY` (AI功能)
  - [ ] `GEMINI_API_KEY` (AI功能)

- [ ] **环境变量安全性验证**
  ```bash
  # 确认 .env.local 未提交到Git
  git ls-files .env.local  # 应返回空

  # 确认 .env.example 已更新
  cat .env.example
  ```

### 1.2 认证与授权

- [ ] **Supabase Auth配置正确**
  - [ ] Auth触发器已部署 (`on_auth_user_created`)
  - [ ] 用户注册自动同步到 `public.users` 表
  - [ ] Session过期时间合理 (建议7天)
  - [ ] 密码策略: 最少8字符 + 字母数字混合

- [ ] **中间件路由保护生效**
  - [ ] 未登录用户访问 `/dashboard/*` → 重定向到 `/login`
  - [ ] 已登录用户访问 `/login` → 重定向到 `/dashboard`
  - [ ] Session自动刷新机制工作正常 (1小时滑动窗口)

- [ ] **Cookie安全配置**
  - [ ] HttpOnly: ✅ (防止XSS)
  - [ ] Secure: ✅ (生产环境强制HTTPS)
  - [ ] SameSite: `Lax` (CSRF防护)

### 1.3 数据安全

- [ ] **SQL注入防护**
  - [ ] 所有数据库操作使用Prisma ORM
  - [ ] 无直接字符串拼接SQL
  - [ ] 用户输入已用Zod验证

- [ ] **XSS防护**
  - [ ] React默认转义生效
  - [ ] 富文本内容使用 `rehype-sanitize` 清理
  - [ ] 无 `dangerouslySetInnerHTML` 未经清理使用

- [ ] **文件上传安全**
  - [ ] Supabase Storage策略已配置
  - [ ] 文件类型白名单: 图片 (jpg/png/webp), PDF
  - [ ] 文件大小限制: 头像 ≤5MB, 文档 ≤10MB
  - [ ] 使用签名URL (有效期1小时)

### 1.4 API安全

- [ ] **Rate Limiting配置**
  - [ ] Vercel Edge Functions默认限速已启用
  - [ ] 敏感API (登录/注册) 添加额外限速
  - [ ] 建议: 10次/分钟 (登录), 3次/分钟 (注册)

- [ ] **CORS配置**
  - [ ] 仅允许自己的域名访问API
  - [ ] 生产环境禁用 `Access-Control-Allow-Origin: *`

---

## ⚡ 2. 性能优化 (Performance)

### 2.1 前端性能

- [ ] **Core Web Vitals达标**
  ```bash
  # 使用Lighthouse测试
  pnpm build
  pnpm start
  # Chrome DevTools → Lighthouse → 运行测试

  目标指标:
  - LCP (最大内容绘制): ≤ 2.5s
  - FID (首次输入延迟): ≤ 100ms
  - CLS (累积布局偏移): ≤ 0.1
  ```

- [ ] **Next.js优化已启用**
  - [ ] 图片使用 `next/image` 自动优化
  - [ ] 字体使用 `next/font` 预加载
  - [ ] 动态导入 (Dynamic Import) 用于大组件
  - [ ] React Server Components优先使用

- [ ] **资源压缩**
  - [ ] Vercel自动Gzip/Brotli压缩已启用
  - [ ] CSS/JS已Tree-shaking
  - [ ] 未使用的依赖已移除

### 2.2 数据库性能

- [ ] **Prisma查询优化**
  - [ ] 高频查询添加索引 (见 `schema.prisma` `@@index`)
  - [ ] 使用 `select` 指定字段 (避免SELECT *)
  - [ ] 使用 `include` 预加载关联数据 (避免N+1)

- [ ] **连接池配置**
  ```bash
  # 确认使用Supabase连接池URL (Pooler)
  DATABASE_URL="postgresql://...pooler.supabase.com:6543/..."

  # 检查连接数
  SELECT count(*) FROM pg_stat_activity WHERE datname = 'postgres';
  # 应 ≤ 20 (Supabase免费版限制)
  ```

- [ ] **缓存策略**
  - [ ] Vercel Data Cache用于静态数据 (科目、章节)
  - [ ] SWR/React Query用于客户端缓存
  - [ ] `revalidate` 时间设置合理 (建议60秒)

### 2.3 网络优化

- [ ] **CDN配置**
  - [ ] Vercel Edge Network自动启用
  - [ ] 静态资源 (`public/`) 自动CDN分发
  - [ ] 图片使用 WebP格式 (自动转换)

- [ ] **预加载关键资源**
  ```tsx
  // 在 layout.tsx 中添加
  <link rel="preload" href="/fonts/..." as="font" />
  <link rel="dns-prefetch" href="https://api.supabase.co" />
  ```

---

## 🔍 3. SEO优化 (Search Engine Optimization)

### 3.1 Meta标签完整性

- [ ] **每个页面的元数据**
  ```tsx
  // 检查 src/app/**/page.tsx 中的 metadata export
  export const metadata = {
    title: "页面标题 | LearnMore",
    description: "页面描述 (150-160字符)",
    openGraph: { ... },
    twitter: { ... }
  }
  ```

- [ ] **核心页面Meta检查**
  - [ ] 首页 `/` - 品牌介绍
  - [ ] 登录 `/login` - 学生登录入口
  - [ ] 注册 `/register` - 免费注册中学课程
  - [ ] 课程页 `/course/[subjectId]` - 动态学科名称
  - [ ] 社区 `/dashboard/community` - 学习交流社区

### 3.2 结构化数据 (Schema.org)

- [ ] **JSON-LD配置**
  ```tsx
  // 首页添加组织信息
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "LearnMore",
    "description": "中学生在线教育平台",
    "url": "https://yourdomain.com"
  }
  </script>
  ```

- [ ] **课程结构化数据**
  - [ ] Course schema用于课程页面
  - [ ] VideoObject schema用于视频课程

### 3.3 站点地图与索引

- [ ] **sitemap.xml生成**
  ```bash
  # 创建 src/app/sitemap.ts
  export default function sitemap() {
    return [
      { url: 'https://yourdomain.com', lastModified: new Date() },
      { url: 'https://yourdomain.com/login', lastModified: new Date() },
      // ... 其他页面
    ]
  }
  ```

- [ ] **robots.txt配置**
  ```bash
  # 创建 public/robots.txt
  User-agent: *
  Allow: /
  Disallow: /dashboard/
  Disallow: /api/

  Sitemap: https://yourdomain.com/sitemap.xml
  ```

### 3.4 性能SEO

- [ ] **移动友好性**
  ```bash
  # Google Mobile-Friendly Test
  # https://search.google.com/test/mobile-friendly
  ```

- [ ] **页面速度**
  ```bash
  # PageSpeed Insights
  # https://pagespeed.web.dev/
  # 目标: Mobile ≥90, Desktop ≥95
  ```

---

## ✅ 4. 功能完整性 (Functionality)

### 4.1 核心功能测试

- [ ] **用户注册流程**
  1. [ ] 访问 `/register`
  2. [ ] 填写邮箱、用户名、密码
  3. [ ] 提交后自动登录
  4. [ ] 检查 `public.users` 表有新记录
  5. [ ] 检查 `user_settings` 自动创建
  6. [ ] 检查 `daily_tasks` 初始化3个任务

- [ ] **用户登录流程**
  1. [ ] 访问 `/login`
  2. [ ] 输入正确凭证 → 成功登录 → 跳转 `/dashboard`
  3. [ ] 输入错误凭证 → 显示错误提示
  4. [ ] 检查Cookie已设置 (开发者工具 → Application → Cookies)

- [ ] **课程学习流程**
  1. [ ] 访问 `/course/[subjectId]`
  2. [ ] 显示章节树 (CourseTree组件)
  3. [ ] 点击课程 → 跳转 `/course/[subjectId]/[lessonId]`
  4. [ ] 视频播放正常 (LessonVideoPlayer)
  5. [ ] 学习进度自动保存 (每30秒)
  6. [ ] 完成课程后 `user_progress.is_completed = true`

- [ ] **练习系统**
  1. [ ] 访问 `/dashboard/practice`
  2. [ ] 选择章节开始练习
  3. [ ] 题目渲染正常 (单选/多选/填空/简答)
  4. [ ] 提交答案后显示正确性
  5. [ ] 错题自动加入错题本
  6. [ ] 答题记录保存到 `user_attempts`

- [ ] **错题本功能**
  1. [ ] 访问 `/error-book`
  2. [ ] 显示所有错题
  3. [ ] 按掌握度筛选 (0-3级)
  4. [ ] 重做错题 → 掌握度提升
  5. [ ] 连续3次正确 → 从错题本移除

- [ ] **社区功能**
  1. [ ] 访问 `/dashboard/community`
  2. [ ] 显示帖子列表 (分页)
  3. [ ] 创建新帖 → 跳转 `/dashboard/community/new`
  4. [ ] 富文本编辑器工作正常 (Tiptap)
  5. [ ] 发布后显示在列表
  6. [ ] 点击帖子 → 查看详情
  7. [ ] 评论功能正常
  8. [ ] 点赞功能正常

- [ ] **个人中心**
  1. [ ] 访问 `/dashboard`
  2. [ ] 显示学习统计 (学习时长、完成课程数)
  3. [ ] 显示图表 (Recharts)
  4. [ ] 显示每日任务
  5. [ ] 显示学习日历

- [ ] **排行榜**
  1. [ ] 访问 `/dashboard/leaderboard`
  2. [ ] 显示本周/本月/总榜
  3. [ ] 自己的排名高亮显示
  4. [ ] 分页加载工作正常

- [ ] **用户设置**
  1. [ ] 访问 `/dashboard/settings`
  2. [ ] 修改头像 → 上传到Supabase Storage
  3. [ ] 修改个人资料 (用户名、年级、学校)
  4. [ ] 修改通知偏好
  5. [ ] 修改主题 (亮色/暗色)

### 4.2 边界情况测试

- [ ] **异常处理**
  - [ ] 网络错误时显示友好提示
  - [ ] 404页面正常显示
  - [ ] 500错误有降级页面
  - [ ] 表单验证错误显示清晰

- [ ] **数据边界**
  - [ ] 空状态显示正常 (无课程、无帖子、无错题)
  - [ ] 大量数据加载 (1000+题目、100+帖子)
  - [ ] 超长文本截断显示

- [ ] **并发冲突**
  - [ ] 两个标签页同时修改个人资料
  - [ ] 多人同时评论同一帖子
  - [ ] 高并发答题提交

---

## 🎨 5. 用户体验 (User Experience)

### 5.1 响应式设计

- [ ] **多设备测试**
  ```bash
  # Chrome DevTools → 切换设备模拟
  - [ ] Desktop (1920x1080)
  - [ ] Laptop (1366x768)
  - [ ] Tablet (768x1024)
  - [ ] Mobile (375x667) - iPhone SE
  - [ ] Mobile (414x896) - iPhone 11 Pro Max
  ```

- [ ] **触摸友好性**
  - [ ] 按钮最小44x44px (iOS人机界面指南)
  - [ ] 下拉刷新可用 (usePullToRefresh Hook)
  - [ ] 侧边栏在移动端可滑动关闭

### 5.2 加载体验

- [ ] **加载状态**
  - [ ] Skeleton屏幕用于列表加载
  - [ ] Spinner用于按钮提交
  - [ ] 进度条用于文件上传
  - [ ] 懒加载图片显示占位符

- [ ] **错误反馈**
  - [ ] Toast通知用于操作结果
  - [ ] 表单错误下方即时显示
  - [ ] 网络错误顶部横幅提示

### 5.3 无障碍访问 (Accessibility)

- [ ] **ARIA标签**
  - [ ] 按钮有 `aria-label`
  - [ ] 图片有 `alt` 属性
  - [ ] 表单有 `<label>` 关联

- [ ] **键盘导航**
  - [ ] Tab键可遍历所有交互元素
  - [ ] Enter/Space可激活按钮
  - [ ] Esc可关闭对话框

- [ ] **颜色对比度**
  ```bash
  # 使用 WAVE 工具检测
  # https://wave.webaim.org/
  # 目标: WCAG AA级别 (对比度 ≥4.5:1)
  ```

---

## 📊 6. 监控与日志 (Monitoring)

### 6.1 错误监控

- [ ] **Vercel Analytics已启用**
  ```bash
  # 在 Vercel Dashboard → Project Settings → Analytics
  - [ ] Web Vitals监控
  - [ ] 访客数据统计
  ```

- [ ] **前端错误捕获**
  ```tsx
  // 检查 src/app/error.tsx 是否存在
  // 检查 src/app/global-error.tsx 是否存在
  ```

- [ ] **后端错误日志**
  - [ ] Server Actions错误已记录到Vercel Logs
  - [ ] 数据库错误已捕获并记录

### 6.2 性能监控

- [ ] **实时性能追踪**
  ```bash
  # Vercel Speed Insights
  # https://vercel.com/docs/speed-insights
  ```

- [ ] **数据库查询监控**
  - [ ] Prisma Query Logs (开发环境)
  - [ ] Supabase Dashboard监控慢查询

### 6.3 安全日志

- [ ] **审计日志**
  - [ ] 用户登录/注册事件记录
  - [ ] 敏感操作记录 (修改密码、删除数据)
  - [ ] 异常访问记录 (频繁失败登录)

---

## 📜 7. 合规性 (Compliance)

### 7.1 法律文档

- [ ] **隐私政策完整**
  - [ ] 访问 `/privacy`
  - [ ] 包含数据收集范围
  - [ ] 包含第三方服务说明 (Supabase, Vercel, Stripe)
  - [ ] 包含用户权利说明 (访问、删除、修改)

- [ ] **服务条款完整**
  - [ ] 访问 `/terms`
  - [ ] 包含服务范围
  - [ ] 包含用户责任
  - [ ] 包含争议解决方式

### 7.2 未成年人保护

- [ ] **内容审核机制**
  - [ ] 社区帖子敏感词过滤
  - [ ] 举报功能可用
  - [ ] 管理员审核面板

- [ ] **家长监护功能** (如已启用)
  - [ ] 家长账号关联
  - [ ] 学习报告推送
  - [ ] 使用时长限制

### 7.3 数据保护

- [ ] **GDPR合规** (如面向欧盟用户)
  - [ ] Cookie同意横幅
  - [ ] 数据导出功能
  - [ ] 账号删除功能 (30天宽限期)

- [ ] **数据备份**
  - [ ] Supabase自动备份已启用 (7天保留)
  - [ ] 手动备份流程已文档化

---

## 🚦 上线前最终检查

### 最后24小时

- [ ] **代码审查完成**
  ```bash
  pnpm lint        # 无错误
  pnpm tsc --noEmit # 无类型错误
  pnpm build       # 构建成功
  pnpm test        # 测试通过
  ```

- [ ] **分支合并**
  ```bash
  git checkout main
  git merge develop
  git push origin main
  ```

- [ ] **Vercel生产部署**
  ```bash
  # 在Vercel Dashboard触发部署
  # 或推送到main分支自动部署
  ```

- [ ] **数据库迁移**
  ```bash
  # 确保生产数据库已应用所有迁移
  DATABASE_URL="生产环境URL" npx prisma migrate deploy
  ```

- [ ] **烟雾测试 (Smoke Test)**
  1. [ ] 访问生产环境首页
  2. [ ] 测试注册流程
  3. [ ] 测试登录流程
  4. [ ] 测试核心功能 (课程学习、答题)
  5. [ ] 检查数据库有新记录

### 上线后监控 (前7天)

- [ ] **每日检查**
  - [ ] Vercel Logs无致命错误
  - [ ] Supabase连接池未耗尽
  - [ ] 用户反馈无重大问题

- [ ] **性能监控**
  - [ ] Core Web Vitals保持绿色
  - [ ] API响应时间 P95 < 200ms
  - [ ] 数据库查询 P95 < 50ms

- [ ] **用户支持**
  - [ ] 设置用户反馈渠道 (邮件/Discord/微信群)
  - [ ] 建立FAQ文档
  - [ ] 准备紧急回滚方案

---

## 📝 检查清单完成记录

| 检查日期 | 执行人 | 完成度 | 备注 |
|---------|--------|--------|------|
| 2026-02-06 | Claude | 0/53 | 初始创建 |
| YYYY-MM-DD |        |        |      |

---

## 🆘 紧急回滚方案

**如果上线后发现重大问题:**

```bash
# 1. Vercel回滚到上一个版本
vercel rollback

# 2. 数据库回滚 (如需要)
# Supabase Dashboard → Database → Backups → Restore

# 3. 通知用户
# 在首页显示维护公告

# 4. 问题修复后重新部署
git revert <commit-hash>
git push origin main
```

---

**检查清单版本**: v1.0
**最后更新**: 2026-02-06
**维护者**: Development Team
