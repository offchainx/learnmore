# Project Roadmap (全局路线图)

**状态**: 📅 Planning
**总任务数**: 20 Stories

## Phase 1: Foundation (基础设施 & 身份)

- [x] **Story-001**: Next.js 初始化与工程化配置 (Infra)
- [x] **Story-002**: 数据库 Schema 设计与 Prisma 迁移 (DB)
- [x] **Story-003**: 身份认证系统 (Auth)
- [x] **Story-004**: 全局布局与导航框架 (App Shell)
  - _目标_: 实现响应式侧边栏、顶部导航、暗色模式切换、移动端适配。

## Phase 2: Course Engine (课程学习引擎)

- [x] **Story-005**: 种子数据与后台管理 (Seed Data)
  - _目标_: 编写 Prisma Seed 脚本，预置 6 大学科、章节和基础题目数据。
- [x] **Story-006**: 课程目录树组件 (Course Tree)
  - _目标_: 实现支持无限层级的章节折叠/展开组件 (Recursive Component)。
- [x] **Story-007**: 学习页面核心布局 (Lesson Layout)
  - _目标_: 左侧目录、右侧内容的响应式布局，处理路由状态。
- [x] **Story-008**: 视频播放器集成 (Video Player)
  - _目标_: 集成 React Player，实现 HLS 播放、倍速控制、防盗链 URL 请求。
- [x] **Story-009**: 学习进度追踪 (Progress Sync)
  - _目标_: 记录视频播放位置，自动标记章节“已完成”。

## Phase 3: Question Bank (智能题库)

- [x] **Story-010**: 题目渲染引擎 (Question UI)
  - _目标_: 支持 LaTeX 公式渲染 (KaTeX)，实现单选/多选/填空题 UI 卡片。
- [x] **Story-011**: 练习模式逻辑 (Quiz Engine)
  - _目标_: 实现答题状态机（倒计时、切题、选中状态、答题卡）。
- [x] **Story-012**: 判卷与提交 (Grading System)
  - _目标_: Server Action 接收答案，比对正误，写入数据库，返回解析。
- [x] **Story-013**: 错题本系统 (Error Book)
  - _目标_: 错题自动收集，提供“错题重练”和“移除错题”功能。

## Phase 4: Community (互动社区)

- [x] **Story-014**: 社区板块与帖子列表 (Forum List)
  - _目标_: 帖子筛选（最新/最热/学科），分页加载，搜索功能。
- [x] **Story-015**: 富文本编辑器 (Post Editor)
  - _目标_: 集成 Tiptap，支持图片上传、公式输入、内容发布。
- [x] **Story-016**: 帖子详情与评论 (Comments)
  - _目标_: 帖子内容渲染，多级评论树 (Nested Comments)。

## Phase 5: Growth & Stats (数据与成长)

- [x] **Story-017**: 学习仪表盘 (Dashboard)
  - _目标_: 首页概览，展示连续打卡、今日任务。
- [x] **Story-018**: 数据可视化图表 (Charts)
  - _目标_: 使用 Recharts 绘制能力雷达图和学习趋势图。
- [x] **Story-019**: 排行榜系统 (Leaderboard)
  - _目标_: 接入 Redis，实现实时积分排行（全站/学科）。
- [x] **Story-020**: 个人中心与设置 (Profile)
  - _目标_: 修改头像、资料，查看获得的成就徽章。

## Phase 6: UI定稿与静态部署 (UI Finalization & Static Deployment) - MVP核心

### 🎯 阶段目标
将Gemini AI Studio生成的前端页面迁移到Next.js项目,完成UI定稿并部署到Vercel预览。**此阶段只关注UI展示,不打通后端功能**。

### 📊 已生成的页面清单
- ✅ LandingPage (营销首页)
- ✅ LoginPage / RegisterPage (认证页面)
- ✅ Dashboard (学生仪表盘 + 7个子视图)

### 📋 Story列表

- [ ] **Story-021**: UI组件迁移与适配 (Component Migration)
  - **核心目标**: 将Gemini生成的UI组件迁移到Next.js,适配Shadcn/ui规范
  - **工时**: 6-8h | **优先级**: 🔴 P0
  - **关键任务**: 路由系统迁移(React Router → App Router)、添加'use client'指令、保持样式一致性
  - **验收标准**: 所有组件编译通过、页面路由正确、样式100%还原、响应式布局正常

- [ ] **Story-022**: 静态数据Mock与页面填充 (Static Data Mocking)
  - **核心目标**: 创建Mock数据库,填充所有页面使其完整展示
  - **工时**: 4-6h | **优先级**: 🔴 P0 | **依赖**: Story-021
  - **关键任务**: 创建Mock数据(用户/学科/课程/排行榜/帖子/任务)、数据注入到页面
  - **验收标准**: 所有页面显示完整数据、图表正确显示、无控制台警告

- [ ] **Story-023**: 暗黑模式与主题切换 (Dark Mode & Theme Toggle)
  - **核心目标**: 实现深色/浅色主题切换,保持AI Studio暗黑风格
  - **工时**: 3-4h | **优先级**: 🟡 P1 | **依赖**: Story-021
  - **关键任务**: 集成next-themes、创建主题切换按钮、配置Tailwind暗黑模式
  - **验收标准**: 主题切换流畅、深色主题还原AI Studio风格、主题持久化

- [ ] **Story-024**: Vercel部署与预览链接 (Vercel Deployment)
  - **核心目标**: 部署静态UI到Vercel,生成预览链接
  - **工时**: 2-3h | **优先级**: 🔴 P0 | **依赖**: Story-021~023
  - **关键任务**: 配置Vercel项目、环境变量配置、构建优化
  - **验收标准**: Vercel构建成功、预览链接可访问、所有路由正常、Lighthouse Performance > 80

- [ ] **Story-025**: UI反馈收集与迭代优化 (UI Feedback & Iteration)
  - **核心目标**: 收集团队反馈,优化UI细节和性能
  - **工时**: 4-6h | **优先级**: 🟡 P1 | **依赖**: Story-024
  - **关键任务**: 创建反馈表单、邀请用户测试、优化对比度/字体/间距/动画
  - **验收标准**: 收集≥5位用户反馈、修复≥3个UI问题、更新预览链接

---

## Phase 7: Landing Page (营销转化页面) - V2.0 核心

### 🎯 阶段目标
基于Phase 6定稿的UI,打通后端功能,实现完整的营销转化流程。

### 📋 Story列表

- [ ] **Story-026**: Landing Page 基础框架与Hero区 (Landing Page Foundation)
  - **核心目标**: 搭建响应式Landing Page,打通注册登录功能
  - **工时**: 6-8h | **优先级**: 🔴 P0
  - **关键任务**: Marketing布局、Hero区动画、Navbar交互、Footer
  - **验收标准**: 首屏LCP < 1.5s、CLS < 0.1、响应式布局正常

- [ ] **Story-027**: AI功能展示模块 (AI Features Showcase)
  - **核心目标**: 实现AI四大卖点展示(诊断报告/错题讲解/知识图谱/自适应路径)
  - **工时**: 8-10h | **优先级**: 🔴 P0 | **依赖**: Story-026
  - **关键任务**: 诊断报告热力图、价格对比动画、知识图谱Canvas、自适应路径SVG动画
  - **验收标准**: 滚动视差60fps、所有Demo可交互

- [ ] **Story-028**: 家长价值区 + 学生娱乐区 (Parent & Student Sections)
  - **核心目标**: 实现家长监管价值展示和学生游戏化机制展示
  - **工时**: 6-8h | **优先级**: 🔴 P0
  - **关键任务**: 痛点对照表、Dashboard预览、证言轮播、段位系统卡片、PK对战Demo
  - **验收标准**: 移动端堆叠正常、轮播支持手势、PK视频自动播放

- [ ] **Story-029**: 定价表与科目展示模块 (Pricing & Subjects)
  - **核心目标**: 实现三档定价对比表和六大学科展示
  - **工时**: 4-6h | **优先级**: 🔴 P0
  - **关键任务**: 定价表响应式布局、价格锚点对比、限时倒计时、学科卡片网格
  - **验收标准**: 移动端垂直堆叠、Tooltip在移动端改为模态框、科目卡片完整展示

- [ ] **Story-030**: Landing Page SEO与数据埋点 (SEO & Analytics)
  - **核心目标**: 完成SEO优化和用户行为数据追踪
  - **工时**: 4-6h | **优先级**: 🟡 P1 | **依赖**: Story-026~029
  - **关键任务**: Next.js Metadata配置、Schema.org结构化数据、GA4事件埋点、Hotjar热力图
  - **验收标准**: Lighthouse SEO > 95、Performance > 90、Core Web Vitals达标、GA4事件正常触发

---

## Phase 8: Intelligence & Insight (AI创新功能) - V2.0 差异化核心

- [ ] **Story-031**: AI 学习诊断报告 (AI Diagnostics)
  - **核心目标**: 利用 Gemini API 分析答题数据,生成自然语言周报
  - **工时**: 10-12h | **技术栈**: Gemini API + Recharts + jsPDF
  - **核心功能**: 知识点热力图、薄弱点分析、同年级对比、PDF周报生成
  - **验收标准**: AI准确率 > 90%、生成时间 < 10s、支持微信推送

- [ ] **Story-032**: 家长监管看板 (Parent Dashboard)
  - **核心目标**: 独立家长视角Dashboard,宏观数据展示
  - **工时**: 8-10h
  - **核心功能**: 学习时长统计、专注度分析、心愿单契约、同年级对比
  - **验收标准**: 家长角色独立权限、不展示具体错题、支持微信通知

- [ ] **Story-033**: AI 错题视频生成 (AI Video Tutor)
  - **核心目标**: 针对错题生成30秒AI讲解视频
  - **工时**: 12-14h 🔴 高难度 | **技术栈**: Gemini API + TTS + Remotion/Canvas
  - **核心功能**: AI分析错误原因、生成讲解脚本、TTS语音合成、动态板书动画
  - **验收标准**: 生成时间 < 30s、讲解准确率 > 95%、支持LaTeX渲染

- [ ] **Story-034**: 知识图谱可视化 (Knowledge Graph)
  - **核心目标**: 可视化章节依赖,实现"迷雾地图"和"自适应学习路径"
  - **工时**: 10-12h | **技术栈**: D3.js 或 Cytoscape.js + Canvas
  - **核心功能**: 章节关系图谱、迷雾模式、AI推荐最优路径、粒子特效
  - **验收标准**: 渲染性能 > 60fps、支持拖拽缩放、路径计算 < 1s

---

## Phase 9: Social Dynamics (社交与竞技) - V2.0 留存利器

- [ ] **Story-035**: 段位系统 (Rank System)
  - **核心目标**: 仿王者荣耀段位系统(青铜 → 王者),每科独立段位
  - **工时**: 6-8h
  - **核心功能**: 晋升/降级逻辑、段位图标奖励、赛季制(每月重置)
  - **验收标准**: 段位计算准确、晋级动画效果、段位徽章展示

- [ ] **Story-036**: 每日任务系统 (Daily Tasks)
  - **核心目标**: 实现每日任务和连续签到系统
  - **工时**: 4-6h
  - **核心功能**: 每日任务(3题/1课/1帮助)、连续签到奖励递增
  - **验收标准**: 任务每日0点重置、签到中断重新计数、奖励自动发放

- [ ] **Story-037**: 学习小队与PK系统 (Team & PK)
  - **核心目标**: 3-5人组队逻辑,实时PK排名
  - **工时**: 12-14h 🔴 高难度 | **技术栈**: Supabase Realtime 或 Socket.io
  - **核心功能**: 组队系统、组队挑战、实时PK对战(1v1)、WebSocket实时同步
  - **验收标准**: 实时延迟 < 500ms、PK匹配算法(段位相近)、队伍荣誉称号

- [ ] **Story-038**: 成就系统 2.0 (Gamification Pro)
  - **核心目标**: 限时成就(FOMO)、稀缺徽章、社交展示
  - **工时**: 6-8h
  - **核心功能**: 限时成就、成就稀缺度展示、成就墙、社交分享
  - **验收标准**: 成就触发准确、限时倒计时提醒、徽章在资料展示

---

## Phase 10: Mobile Experience (移动端体验优化) 📱

### 🎯 阶段目标
全面优化移动端用户体验,将LearnMore改造为Progressive Web App (PWA),实现接近原生App的体验。

### 📋 Story列表

- [🟡] **Story-040**: Mobile Adaptation Polish (移动端适配优化)
  - **核心目标**: 响应式布局、触摸手势、PWA能力、性能优化
  - **工时**: 34-44h (4-5工作日) | **优先级**: 🔴 P1 | **状态**: In Progress 🟡
  - **Phase 1 (6-8h)**: 响应式布局重构
    - Tailwind移动端断点配置 (320px~428px)
    - 底部Tab Bar导航栏 (5个Tab)
    - Safe Area Insets适配 (刘海屏/药丸屏)
    - Touch Target Size标准化 (≥44x44px)
  - **Phase 2 (8-10h)**: 触摸手势系统
    - 课程章节左右滑动切换 (react-use-gesture)
    - 下拉刷新 (Pull-to-Refresh)
    - 长按操作菜单 (500ms触发)
    - 图片/公式捏合缩放 (1x~4x)
  - **Phase 3 (10-12h)**: PWA能力构建
    - Service Worker配置 (next-pwa)
    - Web App Manifest (8种图标尺寸)
    - 离线页面组件
    - PWA安装提示组件
    - 推送通知 (可选)
  - **Phase 4 (6-8h)**: 移动端性能优化
    - 图片优化 (WebP + 懒加载 + blur占位符)
    - 代码分割 (动态导入重组件)
    - 字体优化 (next/font)
    - Resource Hints (preload/prefetch)
    - 网络优化 (超时重试机制)
  - **Phase 5 (4-6h)**: 兼容性测试与修复
    - iOS Safari 15+ 真机测试
    - Android Chrome 90+ 真机测试
    - WeChat WebView 兼容性修复
    - 横竖屏旋转测试
    - 弱网环境测试
  - **验收标准**:
    - Lighthouse Mobile Score ≥ 90 (Performance/Accessibility/Best Practices/SEO)
    - FCP < 1.5s, LCP < 2.5s, CLS < 0.1
    - Touch Response Time < 100ms
    - PWA可安装并正常工作
    - 3台iOS + 2台Android设备测试通过
  - **成功指标**:
    - 移动端DAU占比: 30% → 60%
    - PWA安装转化率: 0% → 15%
    - 移动端跳出率: 45% → <25%
    - 7日留存率: 40% → >65%

