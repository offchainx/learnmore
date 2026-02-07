# src/ 文件夹结构与文件用途说明

> **📝 更新记录 (2026-02-07)**:
> - ✅ 修正 `lib/` 目录结构 (采用实际的模块化组织方式)
> - ✅ 修正 `providers/` 内容 (整合型Provider模式)
> - ✅ 修正 `types/` 内容 (分散式类型定义策略)
> - ✅ 补充 `components/` 缺失的子目录 (mobile/, notification/, performance/ 等)
> - ✅ 更新统计数据和快速查找指南

---

## 📁 目录概览

```
src/
├── __deprecated__/           # 已废弃的代码 (待清理)
├── __dev__/                  # 开发工具和Mock数据
├── actions/                  # Next.js Server Actions (业务逻辑层)
├── app/                      # Next.js 14+ App Router (路由层)
├── components/               # React组件 (UI层)
├── lib/                      # 工具库和配置
├── providers/                # React Context Providers
├── types/                    # TypeScript类型定义
└── middleware.ts             # Next.js中间件 (认证拦截)
```

---

## 📂 详细文件树 (带用途说明)

### 1. `__deprecated__/` - 已废弃代码区

```
__deprecated__/
├── README.md                                              # 废弃文件说明文档
├── app-dashboard-duplicate/
│   └── DashboardClient.tsx.bak                           # 废弃: Dashboard客户端旧版本
├── components/
│   └── business/settings/
│       ├── BadgeGrid.tsx                                  # 废弃: 成就徽章网格组件
│       └── ai-config-form.tsx                             # 废弃: AI配置表单
│   └── dashboard/views/QuestionBankView/                 # 废弃: 题库视图旧架构
│       ├── AnalyticsSidebar/
│       │   ├── index.tsx                                  # 废弃: 分析侧边栏
│       │   └── types.ts                                   # 废弃: 类型定义
│       ├── ChapterMap/
│       │   ├── ChapterCard.tsx                            # 废弃: 章节卡片
│       │   └── index.tsx                                  # 废弃: 章节地图
│       ├── PastPapersSection.tsx                          # 废弃: 历年试卷区域
│       ├── SubjectSelector.tsx                            # 废弃: 科目选择器
│       ├── TrainingModeCards.tsx                          # 废弃: 训练模式卡片
│       ├── index.tsx                                      # 废弃: 题库视图入口
│       └── types.ts                                       # 废弃: 类型定义
└── components-business-duplicate/
    ├── CircularProgress-*.tsx.bak                         # 废弃: 环形进度条备份
    ├── DailyInspiration*.tsx.bak                          # 废弃: 每日激励备份
    ├── DashboardCharts.tsx.bak                            # 废弃: Dashboard图表备份
    ├── SidebarItem-dashboard.tsx.bak                      # 废弃: 侧边栏项备份
    ├── StrengthBar-dashboard.tsx.bak                      # 废弃: 强度条备份
    └── SubjectCard*.tsx.bak                               # 废弃: 科目卡片备份
```

---

### 2. `__dev__/` - 开发工具区

```
__dev__/
└── mock/
    └── content-pipeline-data.ts                          # Mock数据: 内容导入管道测试数据
```

---

### 3. `actions/` - Server Actions (业务逻辑层)

```
actions/
├── __tests__/                                            # 单元测试目录
│   ├── profile.test.ts                                   # 测试: 用户资料操作
│   ├── progress.test.ts                                  # 测试: 学习进度追踪
│   ├── quiz.test.ts                                      # 测试: 测验系统
│   ├── storage.test.ts                                   # 测试: 文件存储
│   └── subject.test.ts                                   # 测试: 科目数据获取
│
├── admin/                                                # 管理员功能模块
│   ├── permission-override.ts                            # Server Action: 权限覆盖管理
│   ├── stripe-mock.ts                                    # Server Action: Stripe支付模拟 (开发用)
│   ├── user-details.ts                                   # Server Action: 用户详情查询
│   └── user-ops.ts                                       # Server Action: 用户操作 (封禁/删除/假冒)
│
├── ai/                                                   # AI智能助手模块
│   └── tutor.ts                                          # Server Action: AI导师对话接口
│
├── billing/                                              # 支付订阅模块
│   └── stripe.ts                                         # Server Action: Stripe支付集成
│
├── community/                                            # 社区互动模块
│   ├── post.ts                                           # Server Action: 社区帖子与评论
│   └── blog.ts                                           # Server Action: 博客文章CRUD
│
├── content-pipeline/                                     # 内容导入管道 (Story-Phase6+)
│   ├── import-service.ts                                 # Server Action: 批量导入题目
│   ├── question-service.ts                               # Server Action: 题目CRUD操作
│   └── review-service.ts                                 # Server Action: 题目审核工作流
│
├── courses/                                              # 课程学习模块
│   ├── subject.ts                                        # Server Action: 科目/章节/课程数据
│   ├── progress.ts                                       # Server Action: 学习进度同步
│   └── knowledge.ts                                      # Server Action: 知识图谱数据
│
├── gamification/                                         # 游戏化系统模块
│   └── achievement.ts                                    # Server Action: 成就/等级/徽章系统
│
├── leaderboard/                                          # 排行榜模块
│   └── index.ts                                          # Server Action: 排行榜数据 (PostgreSQL实现)
│
├── marketing/                                            # 营销活动模块
│   └── campaign.ts                                       # Server Action: 营销活动/推荐码
│
├── notification/                                         # 通知系统模块
│   ├── core.ts                                           # Server Action: 通知中心
│   ├── preferences.ts                                    # Server Action: 通知偏好设置
│   └── triggers.ts                                       # Server Action: 通知触发器
│
├── practice/                                             # 练习系统核心模块
│   ├── __tests__/
│   │   ├── data-service.test.ts                          # 测试: 题目数据服务
│   │   ├── error-book.test.ts                            # 测试: 错题本逻辑
│   │   └── session.integration.test.ts                   # 集成测试: 练习会话完整流程
│   ├── data-service.ts                                   # Server Action: 题目数据获取服务
│   ├── error-book.ts                                     # Server Action: 错题本管理
│   ├── exam.ts                                           # Server Action: 模拟考试逻辑
│   ├── parser.ts                                         # 工具函数: 题目格式解析器
│   ├── question.ts                                       # Server Action: 题目获取与筛选
│   ├── quota.ts                                          # Server Action: 题目配额限制
│   ├── quiz.ts                                           # Server Action: 测验提交与评分
│   ├── recommendation.ts                                 # Server Action: AI推荐算法
│   └── statistics.ts                                     # Server Action: 练习统计数据
│
├── support/                                              # 运营支持模块
│   ├── feedback.ts                                       # Server Action: 用户反馈提交
│   └── ticket.ts                                         # Server Action: 客户支持工单
│
├── user/                                                 # 用户系统模块
│   ├── auth.ts                                           # Server Action: 认证逻辑 (登录/注册/登出)
│   ├── onboarding.ts                                     # Server Action: 新用户引导流程
│   ├── parent.ts                                         # Server Action: 家长监控功能
│   ├── profile.ts                                        # Server Action: 用户资料管理
│   └── settings.ts                                       # Server Action: 用户设置管理
│
├── dashboard.ts                                          # Server Action: Dashboard数据聚合 (跨模块)
├── permissions.ts                                        # Server Action: 权限检查逻辑 (全局)
└── storage.ts                                            # Server Action: Supabase Storage文件上传 (全局)
```

---

### 4. `app/` - Next.js App Router (路由层)

```
app/
├── (auth)/                                               # 认证路由组
│   ├── layout.tsx                                        # 布局: 认证页面布局 (无Sidebar)
│   ├── login/page.tsx                                    # 页面: 登录页
│   └── register/page.tsx                                 # 页面: 注册页
│
├── (dashboard)/                                          # Dashboard路由组 (需登录)
│   ├── layout.tsx                                        # 布局: Dashboard布局 (含Sidebar)
│   │
│   ├── admin/                                            # 管理员后台
│   │   ├── page.tsx                                      # 页面: 管理员首页
│   │   │
│   │   ├── content/                                      # 内容管理模块
│   │   │   ├── page.tsx                                  # 页面: 批次导入历史列表
│   │   │   ├── [id]/edit/page.tsx                        # 页面: 编辑题目 (动态路由)
│   │   │   │
│   │   │   ├── import/                                   # 批量导入子模块
│   │   │   │   ├── ImportClient.tsx                      # 客户端组件: 导入表单
│   │   │   │   └── page.tsx                              # 页面: 导入入口
│   │   │   │
│   │   │   ├── reports/                                  # 用户举报管理
│   │   │   │   └── page.tsx                              # 页面: 举报列表
│   │   │   │
│   │   │   ├── review/                                   # 题目审核工作流
│   │   │   │   ├── page.tsx                              # 页面: 待审核题目列表
│   │   │   │   └── [questionId]/                         # 审核详情 (动态路由)
│   │   │   │       ├── QuestionReviewClient.tsx          # 客户端组件: 审核界面
│   │   │   │       └── page.tsx                          # 页面: 审核页面入口
│   │   │   │
│   │   │   └── statistics/                               # 内容统计看板
│   │   │       ├── StatisticsClient.tsx                  # 客户端组件: 统计图表
│   │   │       └── page.tsx                              # 页面: 统计页面
│   │   │
│   │   ├── feedback/                                     # 用户反馈管理
│   │   │   ├── page.tsx                                  # 页面: 反馈列表
│   │   │   └── [id]/page.tsx                             # 页面: 反馈详情 (动态路由)
│   │   │
│   │   ├── permissions/                                  # 权限管理
│   │   │   └── page.tsx                                  # 页面: 用户权限覆盖
│   │   │
│   │   ├── referrals/                                    # 推荐码管理
│   │   │   └── page.tsx                                  # 页面: 推荐统计
│   │   │
│   │   └── users/                                        # 用户管理
│   │       ├── page.tsx                                  # 页面: 用户列表 (含搜索/筛选)
│   │       └── [id]/                                     # 用户详情 (动态路由)
│   │           ├── UserDetailClient.tsx                  # 客户端组件: 用户详情Tab
│   │           ├── client.tsx                            # 客户端组件: 用户详情容器
│   │           └── page.tsx                              # 页面: 用户详情入口
│   │
│   └── dashboard/                                        # 学生Dashboard
│       ├── page.tsx                                      # 页面: Dashboard首页
│       ├── loading.tsx                                   # 加载状态: Skeleton占位符
│       │
│       ├── achievements/                                 # 成就系统
│       │   ├── client-wrapper.tsx                        # 客户端包装器
│       │   └── page.tsx                                  # 页面: 成就列表
│       │
│       ├── community/                                    # 社区论坛
│       │   ├── page.tsx                                  # 页面: 帖子列表
│       │   ├── client-wrapper.tsx                        # 客户端包装器
│       │   ├── new/page.tsx                              # 页面: 发帖编辑器
│       │   └── [postId]/page.tsx                         # 页面: 帖子详情 (动态路由)
│       │
│       ├── courses/                                      # 课程学习
│       │   ├── client-wrapper.tsx                        # 客户端包装器
│       │   └── page.tsx                                  # 页面: 课程列表
│       │
│       ├── debug/                                        # 开发调试工具
│       │   └── ui-kit/page.tsx                           # 页面: UI组件展示 (开发环境)
│       │
│       ├── knowledge-graph/                              # 知识图谱
│       │   ├── client-wrapper.tsx                        # 客户端包装器
│       │   └── page.tsx                                  # 页面: 知识图谱可视化
│       │
│       ├── leaderboard/                                  # 排行榜
│       │   ├── client-wrapper.tsx                        # 客户端包装器
│       │   └── page.tsx                                  # 页面: 排行榜 (周榜/月榜/总榜)
│       │
│       ├── practice/                                     # 题库练习系统
│       │   ├── page.tsx                                  # 页面: 练习首页 (模式选择)
│       │   ├── client-wrapper.tsx                        # 客户端包装器
│       │   │
│       │   ├── chapter-drill/                            # 章节刷题模式
│       │   │   └── [chapterId]/page.tsx                  # 页面: 章节练习 (动态路由)
│       │   │
│       │   ├── error-wiper/                              # 错题清零模式
│       │   │   └── page.tsx                              # 页面: 错题本练习
│       │   │
│       │   ├── import/                                   # 题目导入 (学生端)
│       │   │   └── page.tsx                              # 页面: 导入自定义题目
│       │   │
│       │   ├── mock-arena/                               # 模拟考试
│       │   │   ├── page.tsx                              # 页面: 考试列表
│       │   │   ├── MockArenaSelector.tsx                 # 客户端组件: 考试选择器
│       │   │   └── [examId]/                             # 考试详情 (动态路由)
│       │   │       ├── MockArenaExam.tsx                 # 客户端组件: 考试界面
│       │   │       └── page.tsx                          # 页面: 考试入口
│       │   │
│       │   └── smart-drill/                              # 智能刷题 (AI推荐)
│       │       └── page.tsx                              # 页面: AI推荐练习
│       │
│       └── settings/                                     # 设置中心
│           ├── page.tsx                                  # 页面: 设置首页
│           ├── client-wrapper.tsx                        # 客户端包装器
│           └── notifications/                            # 通知设置子页面
│               ├── client-wrapper.tsx                    # 客户端包装器
│               └── page.tsx                              # 页面: 通知偏好设置
│
├── (marketing)/                                          # 营销路由组 (URL 路径不含 /marketing)
│   ├── layout.tsx                                        # 布局: 营销页面统一布局 (SEO metadata)
│   │
│   ├── about-us/page.tsx                                 # 页面: 关于我们 (URL: /about-us)
│   ├── blog/                                             # 博客
│   │   ├── page.tsx                                      # 页面: 博客列表 (URL: /blog)
│   │   └── [slug]/page.tsx                               # 页面: 博客详情 (URL: /blog/[slug])
│   │
│   ├── contact/page.tsx                                  # 页面: 联系我们 (URL: /contact)
│   ├── help/                                             # 帮助中心
│   │   ├── layout.tsx                                    # 布局: 帮助中心布局
│   │   └── page.tsx                                      # 页面: 帮助中心首页 (URL: /help)
│   │
│   ├── how-it-works/page.tsx                             # 页面: 如何使用 (URL: /how-it-works)
│   ├── pricing/page.tsx                                  # 页面: 定价方案 (URL: /pricing)
│   ├── privacy/page.tsx                                  # 页面: 隐私政策 (URL: /privacy)
│   ├── refund/page.tsx                                   # 页面: 退款政策 (URL: /refund)
│   ├── student-care/page.tsx                             # 页面: 学生关怀 (URL: /student-care)
│   ├── study-guides/page.tsx                             # 页面: 学习指南 (URL: /study-guides)
│   ├── subjects/page.tsx                                 # 页面: 科目介绍 (URL: /subjects)
│   ├── success-stories/page.tsx                          # 页面: 成功案例 (URL: /success-stories)
│   └── terms/page.tsx                                    # 页面: 服务条款 (URL: /terms)
│
├── course/                                               # 课程学习页面 (根目录，核心功能)
│   └── [subjectId]/                                      # 科目动态路由
│       ├── layout.tsx                                    # 布局: 课程页面布局 (含章节树)
│       ├── loading.tsx                                   # 加载状态
│       ├── page.tsx                                      # 页面: 科目首页
│       └── [lessonId]/page.tsx                           # 页面: 课程详情 (视频/文档/练习)
│
├── api/                                                  # API Routes (非Server Actions的HTTP端点)
│   ├── ai-tutor/route.ts                                 # API: AI导师流式响应接口
│   │
│   ├── auth/impersonate/                                 # 管理员假冒登录功能
│   │   ├── route.ts                                      # API: 开始假冒登录
│   │   ├── end/route.ts                                  # API: 结束假冒登录
│   │   └── status/route.ts                               # API: 查询假冒状态
│   │
│   ├── cron/                                             # Vercel Cron Job端点
│   │   ├── cleanup-leaderboard/route.ts                  # Cron: 清理过期排行榜数据
│   │   └── trial-expiry/route.ts                         # Cron: 检查试用期到期
│   │
│   └── webhook/stripe/route.ts                           # Webhook: Stripe支付回调
│
├── globals.css                                           # 全局样式 (Tailwind + 自定义CSS)
├── layout.tsx                                            # 根布局: HTML结构 + Providers
├── page.tsx                                              # 页面: 首页 (营销页)
└── sitemap.ts                                            # SEO: 动态生成sitemap.xml
```

---

### 5. `components/` - React组件库 (UI层)

```
components/
├── __deprecated__/
│   ├── README.md                                         # 废弃组件说明
│   └── CommunityView.OLD.tsx                             # 废弃: 社区视图旧版本
│
├── admin/                                                # 管理员专用组件
│   ├── AdminClientWrapper.tsx                            # 客户端包装器: Admin页面容器
│   ├── DifficultyBadge.tsx                               # UI组件: 难度徽章 (1-5星)
│   ├── ImportHistoryTable.tsx                            # UI组件: 导入历史表格
│   ├── QualityCheckDisplay.tsx                           # UI组件: 质量检查结果展示
│   ├── QualityScoreBadge.tsx                             # UI组件: 质量评分徽章
│   ├── QuestionEditorForm.tsx                            # UI组件: 题目编辑表单
│   ├── QuestionPreview.tsx                               # UI组件: 题目预览卡片
│   ├── QuestionReviewPanel.tsx                           # UI组件: 审核面板
│   ├── QuestionReviewTable.tsx                           # UI组件: 审核队列表格
│   ├── RichTextEditor.tsx                                # UI组件: 富文本编辑器 (Tiptap)
│   ├── SubjectFilter.tsx                                 # UI组件: 科目筛选器
│   │
│   ├── content/                                          # 内容管理子组件
│   │   ├── AuditLogDrawer.tsx                            # UI组件: 审计日志抽屉
│   │   ├── BatchTable.tsx                                # UI组件: 批次表格
│   │   ├── NewBatchImportModal.tsx                       # UI组件: 新建批次导入弹窗
│   │   └── StatsCards.tsx                                # UI组件: 统计卡片组
│   │
│   ├── content-reports/                                  # 举报管理子组件
│   │   ├── Header.tsx                                    # UI组件: 页面头部
│   │   ├── ReportDetailsDrawer.tsx                       # UI组件: 举报详情抽屉
│   │   ├── ReportsClient.tsx                             # 客户端组件: 举报管理主容器
│   │   ├── ReportsTable.tsx                              # UI组件: 举报列表表格
│   │   ├── StatsCards.tsx                                # UI组件: 统计卡片
│   │   ├── constants.ts                                  # 常量: 举报类型/状态枚举
│   │   └── types.ts                                      # 类型定义
│   │
│   ├── content-statistics/                               # 内容统计子组件
│   │   ├── DashboardStats.tsx                            # UI组件: Dashboard统计卡片
│   │   ├── DifficultyBreakdown.tsx                       # UI组件: 难度分布图表
│   │   ├── Header.tsx                                    # UI组件: 页面头部
│   │   ├── ReviewersList.tsx                             # UI组件: 审核员列表
│   │   ├── StatCard.tsx                                  # UI组件: 单个统计卡片
│   │   ├── SubjectDistribution.tsx                       # UI组件: 科目分布图表
│   │   ├── constants.ts                                  # 常量定义
│   │   └── types.ts                                      # 类型定义
│   │
│   ├── feedback/                                         # 反馈管理子组件
│   │   ├── FeedbackDetailView.tsx                        # UI组件: 反馈详情视图
│   │   └── FeedbackList.tsx                              # UI组件: 反馈列表
│   │
│   ├── permissions/                                      # 权限管理子组件
│   │   ├── OverrideModal.tsx                             # UI组件: 权限覆盖弹窗
│   │   ├── UserPermissionManager.tsx                     # UI组件: 权限管理器
│   │   └── UserTable.tsx                                 # UI组件: 用户表格 (权限管理用)
│   │
│   ├── review/                                           # 题目审核子组件
│   │   ├── EditableSection.tsx                           # UI组件: 可编辑区域
│   │   ├── EditorToolbar.tsx                             # UI组件: 编辑器工具栏
│   │   ├── MathRenderer.tsx                              # UI组件: 数学公式渲染器 (KaTeX)
│   │   ├── MetadataPanel.tsx                             # UI组件: 元数据面板
│   │   └── QuestionPanel.tsx                             # UI组件: 题目面板
│   │
│   └── users/                                            # 用户管理子组件
│       ├── AdminNoteList.tsx                             # UI组件: 管理员备注列表
│       ├── GrantPermissionDialog.tsx                     # UI组件: 授予权限对话框
│       ├── HighRiskConfirmDialog.tsx                     # UI组件: 高风险操作确认对话框
│       ├── ImpersonateBanner.tsx                         # UI组件: 假冒登录提示横幅
│       ├── ImpersonateBannerWrapper.tsx                  # 客户端包装器: 假冒登录横幅容器
│       ├── Modals.tsx                                    # UI组件: 用户操作弹窗集合
│       ├── StripeHistoryTable.tsx                        # UI组件: Stripe支付历史表格
│       ├── UserBadges.tsx                                # UI组件: 用户徽章组
│       ├── UserDetail.tsx                                # UI组件: 用户详情主组件
│       ├── UserProfileHeader.tsx                         # UI组件: 用户资料头部
│       ├── UserTable.tsx                                 # UI组件: 用户表格 (用户管理用)
│       │
│       ├── mock/
│       │   └── userMockData.ts                           # Mock数据: 用户详情测试数据
│       │
│       └── tabs/                                         # 用户详情Tab子组件
│           ├── ActivityTab.tsx                           # UI组件: 活动记录Tab
│           ├── AuditTab.tsx                              # UI组件: 审计日志Tab
│           ├── GrowthTab.tsx                             # UI组件: 成长数据Tab
│           ├── OverviewTab.tsx                           # UI组件: 概览Tab
│           └── SubscriptionTab.tsx                       # UI组件: 订阅管理Tab
│
├── achievements/                                         # 成就系统组件
│   └── AchievementsView.tsx                              # UI组件: 成就页面主视图
│
├── ai/
│   └── AiTutorButton.tsx                                 # UI组件: AI导师触发按钮
│
├── blog/
│   ├── blog-detail.tsx                                   # UI组件: 博客详情页
│   └── blog-list.tsx                                     # UI组件: 博客列表页
│
├── business/                                             # 业务核心组件
│   ├── AppSidebar.tsx                                    # UI组件: 应用侧边栏 (Sidebar Layer - 入口层)
│   ├── CourseLayoutClient.tsx                            # 客户端组件: 课程布局容器
│   ├── CourseNavigation.tsx                              # UI组件: 课程导航栏
│   ├── CourseTree.tsx                                    # UI组件: 课程树形结构 (章节树)
│   ├── Header.tsx                                        # UI组件: 顶部导航栏
│   ├── LessonVideoPlayer.tsx                             # UI组件: 课程视频播放器
│   ├── QuizView.tsx                                      # UI组件: 测验视图
│   │
│   ├── dashboard/                                        # Dashboard子组件
│   │   ├── CircularProgress.tsx                          # UI组件: 环形进度条
│   │   ├── DailyInspiration.tsx                          # UI组件: 每日激励语
│   │   ├── DashboardCharts.tsx                           # UI组件: Dashboard图表集合
│   │   ├── StatsCards.tsx                                # UI组件: 统计卡片组
│   │   ├── SubjectCard.tsx                               # UI组件: 科目卡片
│   │   └── SubjectProgressChart.tsx                      # UI组件: 科目进度图表
│   │
│   ├── settings/                                         # 设置页面子组件
│   │   ├── AccountSettings.tsx                           # UI组件: 账户设置区域
│   │   ├── AchievementSettings.tsx                       # UI组件: 成就显示设置
│   │   ├── AiTutorSettings.tsx                           # UI组件: AI导师设置
│   │   ├── NotificationSettings.tsx                      # UI组件: 通知设置
│   │   ├── ParentLinkSection.tsx                         # UI组件: 家长绑定区域
│   │   ├── PrivacySettings.tsx                           # UI组件: 隐私设置
│   │   ├── ProfilePictureUpload.tsx                      # UI组件: 头像上传
│   │   └── ReferralCode.tsx                              # UI组件: 推荐码区域
│   │
│   └── shared/                                           # 业务共享组件
│       ├── DataExport.tsx                                # UI组件: 数据导出按钮
│       ├── OnboardingChecklist.tsx                       # UI组件: 新手引导清单
│       └── StreakDisplay.tsx                             # UI组件: 连续学习天数展示
│
├── compatibility/                                        # 浏览器兼容性组件
│   └── UnsupportedBrowserWarning.tsx                     # UI组件: 不支持浏览器警告
│
├── course/                                               # 课程页面组件
│   ├── CoursePageClient.tsx                              # 客户端组件: 课程页主容器
│   ├── LessonContent.tsx                                 # UI组件: 课程内容展示 (视频/文档)
│   └── VideoPlayer.tsx                                   # UI组件: 视频播放器 (带进度追踪)
│
├── courses/                                              # 课程列表组件
│   ├── CoursesView.tsx                                   # UI组件: 课程列表视图
│   └── LessonPlayer.tsx                                  # UI组件: 课程播放器
│
├── dashboard/                                            # Dashboard专用组件
│   ├── dialogs/                                          # Dashboard对话框组件
│   └── views/                                            # Dashboard视图组件
│
├── deprecated/                                           # 已废弃组件 (和__deprecated__不同)
│   ├── README.md                                         # 废弃说明
│   └── dashboard/                                        # 废弃的Dashboard组件
│
├── layout/                                               # 布局组件
│   ├── CookieConsent.tsx                                 # UI组件: Cookie同意横幅
│   ├── Footer.tsx                                        # UI组件: 页脚 (营销页用)
│   ├── LandingPageNavbar.tsx                             # UI组件: 落地页导航栏
│   ├── TrialBanner.tsx                                   # UI组件: 试用期横幅
│   ├── dashboard-layout.tsx                              # UI组件: Dashboard布局
│   └── navbar.tsx                                        # UI组件: 通用导航栏
│
├── leaderboard/                                          # 排行榜组件
│   ├── components/                                       # 排行榜子组件
│   ├── LeaderboardTabs.tsx                               # UI组件: 排行榜Tab (周/月/总)
│   ├── LeaderboardView.tsx                               # UI组件: 排行榜主视图
│   ├── RankCard.tsx                                      # UI组件: 排名卡片
│   └── UserRankCard.tsx                                  # UI组件: 当前用户排名卡片
│
├── leaderboard/                                          # 排行榜组件
│   ├── LeaderboardTabs.tsx                               # UI组件: 排行榜Tab (周/月/总)
│   ├── LeaderboardView.tsx                               # UI组件: 排行榜主视图
│   ├── RankCard.tsx                                      # UI组件: 排名卡片
│   └── UserRankCard.tsx                                  # UI组件: 当前用户排名卡片
│
├── marketing/                                            # 营销页面组件
│   ├── AboutUsView.tsx                                   # UI组件: 关于我们页面
│   ├── CTASection.tsx                                    # UI组件: Call-to-Action区域
│   ├── ContactFormView.tsx                               # UI组件: 联系表单
│   ├── FAQ.tsx                                           # UI组件: 常见问题
│   ├── FeatureSection.tsx                                # UI组件: 功能介绍区域
│   ├── Footer.tsx                                        # UI组件: 页脚
│   ├── HeroSection.tsx                                   # UI组件: Hero区域 (首页头图)
│   ├── HowItWorksView.tsx                                # UI组件: 如何使用页面
│   ├── PricingView.tsx                                   # UI组件: 定价页面
│   ├── PrivacyView.tsx                                   # UI组件: 隐私政策页面
│   ├── RefundView.tsx                                    # UI组件: 退款政策页面
│   ├── StudentCareView.tsx                               # UI组件: 学生关怀页面
│   ├── StudyGuidesView.tsx                               # UI组件: 学习指南页面
│   ├── SubjectsView.tsx                                  # UI组件: 科目介绍页面
│   ├── SuccessStoriesView.tsx                            # UI组件: 成功案例页面
│   ├── TermsView.tsx                                     # UI组件: 服务条款页面
│   └── TestimonialSection.tsx                            # UI组件: 用户评价区域
│
├── mobile/                                               # 移动端专用组件
│   ├── BottomTabBar.tsx                                  # UI组件: 底部Tab栏
│   ├── LongPressMenu.tsx                                 # UI组件: 长按菜单
│   ├── MobileHeader.tsx                                  # UI组件: 移动端头部
│   └── PullToRefresh.tsx                                 # UI组件: 下拉刷新
│
├── notification/                                         # 通知中心组件
│   ├── NotificationBell.tsx                              # UI组件: 通知铃铛图标
│   └── NotificationDropdown.tsx                          # UI组件: 通知下拉列表
│
├── performance/                                          # 性能优化组件
│   ├── LazyImage.tsx                                     # UI组件: 懒加载图片
│   ├── LazyLoad.tsx                                      # UI组件: 懒加载容器
│   ├── ResourceHints.tsx                                 # UI组件: 资源预加载提示
│   ├── VirtualGrid.tsx                                   # UI组件: 虚拟网格 (长列表优化)
│   └── VirtualList.tsx                                   # UI组件: 虚拟列表 (长列表优化)
│
├── permissions/                                          # 权限相关组件
│   ├── EfficiencyMirror.tsx                              # UI组件: 效率镜像显示
│   ├── FeatureLock.tsx                                   # UI组件: 功能锁定提示
│   ├── MemoryDecayVisual.tsx                             # UI组件: 记忆衰减可视化
│   ├── PreviewHook.tsx                                   # UI组件: 预览钩子
│   └── UpsellModal.tsx                                   # UI组件: 升级弹窗
│
├── polyfills/                                            # Polyfill组件
│   └── PolyfillsLoader.tsx                               # UI组件: Polyfill加载器
│
├── practice/                                             # 练习系统组件
│   ├── ChapterDrill.tsx                                  # UI组件: 章节刷题主界面
│   ├── ErrorWiper.tsx                                    # UI组件: 错题清零主界面
│   ├── MockArenaView.tsx                                 # UI组件: 模拟考试主界面
│   ├── PracticeView/                                     # 练习视图模块
│   │   ├── index.tsx                                     # UI组件: 练习视图入口 (模式选择)
│   │   ├── ChapterMap.tsx                                # UI组件: 章节地图
│   │   ├── SubjectSelector.tsx                           # UI组件: 科目选择器
│   │   ├── TrainingModeCards.tsx                         # UI组件: 训练模式卡片
│   │   └── mock/
│   │       └── practiceData.ts                           # Mock数据: 练习系统测试数据
│   │
│   ├── QuestionCard.tsx                                  # UI组件: 题目卡片 (核心)
│   ├── QuestionRenderer.tsx                              # UI组件: 题目渲染器 (支持LaTeX)
│   ├── SmartDrill.tsx                                    # UI组件: 智能刷题主界面
│   └── shared/                                           # 练习共享组件
│       ├── AnswerControls.tsx                            # UI组件: 答题控制按钮
│       ├── ProgressBar.tsx                               # UI组件: 练习进度条
│       ├── QuestionNavigation.tsx                        # UI组件: 题目导航
│       ├── ResultSummary.tsx                             # UI组件: 练习结果汇总
│       └── TimerDisplay.tsx                              # UI组件: 计时器显示
│
├── profile/                                              # 用户资料组件
│   ├── ProfileView.tsx                                   # UI组件: 资料页主视图
│   └── UserStats.tsx                                     # UI组件: 用户统计卡片
│
├── pwa/                                                  # PWA功能组件
│   └── [PWA相关组件]                                      # UI组件: PWA安装/更新提示等
│
├── shared/                                               # 共享业务组件
│   └── [共享组件]                                         # UI组件: 跨模块共享的通用组件
│
├── support/                                              # 客服支持组件
│   └── [支持组件]                                         # UI组件: 在线客服/帮助中心等
│
└── ui/                                                   # Shadcn/ui基础组件
    ├── accordion.tsx                                     # UI组件: 手风琴
    ├── alert-dialog.tsx                                  # UI组件: 警告对话框
    ├── alert.tsx                                         # UI组件: 警告提示
    ├── avatar.tsx                                        # UI组件: 头像
    ├── badge.tsx                                         # UI组件: 徽章
    ├── button.tsx                                        # UI组件: 按钮
    ├── card.tsx                                          # UI组件: 卡片
    ├── checkbox.tsx                                      # UI组件: 复选框
    ├── chart.tsx                                         # UI组件: 图表 (Recharts封装)
    ├── collapsible.tsx                                   # UI组件: 可折叠容器
    ├── command.tsx                                       # UI组件: 命令面板
    ├── dialog.tsx                                        # UI组件: 对话框
    ├── drawer.tsx                                        # UI组件: 抽屉
    ├── dropdown-menu.tsx                                 # UI组件: 下拉菜单
    ├── form.tsx                                          # UI组件: 表单 (React Hook Form)
    ├── input.tsx                                         # UI组件: 输入框
    ├── label.tsx                                         # UI组件: 标签
    ├── pagination.tsx                                    # UI组件: 分页器
    ├── popover.tsx                                       # UI组件: 弹出层
    ├── progress.tsx                                      # UI组件: 进度条
    ├── radio-group.tsx                                   # UI组件: 单选按钮组
    ├── scroll-area.tsx                                   # UI组件: 滚动区域
    ├── select.tsx                                        # UI组件: 下拉选择器
    ├── separator.tsx                                     # UI组件: 分隔线
    ├── sidebar.tsx                                       # UI组件: Shadcn Sidebar组件
    ├── skeleton.tsx                                      # UI组件: 骨架屏
    ├── slider.tsx                                        # UI组件: 滑块
    ├── sonner.tsx                                        # UI组件: Toast通知 (Sonner)
    ├── switch.tsx                                        # UI组件: 开关
    ├── table.tsx                                         # UI组件: 表格
    ├── tabs.tsx                                          # UI组件: Tab切换器
    ├── textarea.tsx                                      # UI组件: 多行文本框
    ├── toast.tsx                                         # UI组件: Toast通知
    └── tooltip.tsx                                       # UI组件: 工具提示
```

---

### 6. `lib/` - 工具库与配置

```
lib/
├── __tests__/                                            # 单元测试目录
│   └── supabase-connection.test.ts                      # 测试: Supabase连接测试
│
├── content-pipeline/                                     # 内容导入管道工具 (Story-Phase6+)
│   ├── __tests__/
│   │   ├── ai-structurer.test.ts                        # 测试: AI结构化器
│   │   ├── ocr-service.test.ts                          # 测试: OCR服务
│   │   ├── quality-checker.test.ts                      # 测试: 质量检查器
│   │   └── question-service.test.ts                     # 测试: 题目服务
│   ├── providers/                                        # OCR服务提供商
│   │   ├── base-provider.ts                             # OCR基础接口
│   │   ├── google-vision.ts                             # Google Vision API实现
│   │   ├── mathpix.ts                                   # Mathpix API实现 (数学公式)
│   │   ├── mock-ocr.ts                                  # Mock OCR (开发测试用)
│   │   ├── tesseract.ts                                 # Tesseract.js实现
│   │   └── index.ts                                     # 提供商统一导出
│   ├── ai-structurer.ts                                 # 工具函数: AI结构化题目内容
│   ├── import-utils.ts                                  # 工具函数: 导入辅助函数
│   ├── ocr-service.ts                                   # 工具函数: OCR服务封装
│   ├── ocr-types.ts                                     # 类型定义: OCR相关类型
│   ├── pdf-utils.ts                                     # 工具函数: PDF处理工具
│   ├── quality-checker.ts                               # 工具函数: 题目质量检查
│   └── types.ts                                         # 类型定义: 内容管道类型
│
├── email/                                                # 邮件服务模块
│   ├── templates/                                        # 邮件模板目录
│   └── [其他邮件相关文件]
│
├── hooks/                                                # React自定义Hooks
│   ├── __tests__/
│   │   └── useDebounce.test.ts                          # 测试: 防抖Hook
│   ├── use-on-click-outside.ts                          # Hook: 点击外部区域检测
│   ├── useDebounce.ts                                   # Hook: 防抖函数
│   └── usePullToRefresh.ts                              # Hook: 下拉刷新
│
├── leaderboard/                                          # 排行榜相关工具
│   ├── pg-adapter.ts                                    # 适配器: PostgreSQL排行榜实现
│   └── types.ts                                         # 类型定义: 排行榜类型
│
├── notification/                                         # 通知系统工具
│   └── types.ts                                         # 类型定义: 通知类型
│
├── permissions/                                          # 权限系统核心
│   ├── __tests__/
│   │   └── engine.test.ts                               # 测试: 权限引擎
│   ├── config.ts                                        # 配置: 权限配置
│   ├── engine.ts                                        # 工具函数: 权限检查引擎
│   ├── prisma-scope.ts                                  # 工具函数: Prisma权限作用域
│   └── types.ts                                         # 类型定义: 权限类型
│
├── practice/                                             # 练习系统工具
│   ├── __tests__/
│   │   ├── algorithms.test.ts                           # 测试: 推荐算法
│   │   └── mastery.test.ts                              # 测试: 掌握度计算
│   ├── algorithms.ts                                    # 工具函数: AI推荐算法
│   ├── mastery.ts                                       # 工具函数: 掌握度计算
│   └── types.ts                                         # 类型定义: 练习类型
│
├── store/                                                # Zustand状态管理
│   └── [Zustand stores]
│
├── supabase/                                             # Supabase客户端
│   ├── client.ts                                        # 工具函数: 客户端Supabase Client
│   └── server.ts                                        # 工具函数: 服务端Supabase Client
│
├── browser-compatibility.ts                              # 工具函数: 浏览器兼容性检测
├── dynamic-imports.ts                                    # 工具函数: 动态导入管理
├── email.ts                                              # 工具函数: 邮件发送服务
├── fonts.ts                                              # 配置: Next.js字体配置
├── gamification-utils.ts                                 # 工具函数: 游戏化系统工具
├── gemini.ts                                             # 配置: Google Gemini API客户端
├── jwt.ts                                                # 工具函数: JWT令牌处理
├── permissions.ts                                        # 工具函数: 权限检查快捷函数
├── polyfills.ts                                          # 工具函数: Polyfill加载器
├── prisma.ts                                             # 配置: Prisma客户端单例
├── stripe.ts                                             # 配置: Stripe SDK初始化
├── suppress-warnings.ts                                  # 工具函数: 开发环境警告抑制
├── test-setup.ts                                         # 配置: 测试环境设置
├── translations.ts                                       # 配置: 国际化翻译
└── utils.ts                                              # 工具函数: 通用工具函数 (cn等)
```

---

### 7. `providers/` - React Context Providers

```
providers/
├── app-provider.tsx                                      # Context: 应用全局Provider (整合型)
└── theme-provider.tsx                                    # Context: 主题切换Provider (暗黑模式)
```

**说明**: `app-provider.tsx` 整合了认证、权限、Toast等多个Context，采用单一Provider模式简化使用。

---

### 8. `types/` - TypeScript类型定义

```
types/
├── admin-user.ts                                         # 类型定义: 管理员用户相关类型
├── content-pipeline.ts                                   # 类型定义: 内容导入管道类型
├── feedback.ts                                           # 类型定义: 用户反馈类型
└── index.ts                                              # 类型导出: 统一导出入口
```

**⚠️ 重要说明**:
大部分类型定义采用**模块化分散存储**策略，分布在各个功能模块内：
- `lib/practice/types.ts` - 练习系统类型
- `lib/permissions/types.ts` - 权限系统类型
- `lib/leaderboard/types.ts` - 排行榜类型
- `lib/notification/types.ts` - 通知类型
- `lib/content-pipeline/types.ts` - 内容管道类型
- `components/admin/content-reports/types.ts` - 举报管理类型
- `components/admin/content-statistics/types.ts` - 统计类型

这种设计使类型定义更贴近使用场景，便于维护。

---

### 9. 根文件

```
src/
└── middleware.ts                                         # Next.js中间件: 认证拦截 + 路由保护
```

---

## 📊 统计数据

| 分类 | 数量 | 说明 |
|-----|-----|-----|
| **Server Actions** | 40+ | 业务逻辑层 (actions/) |
| **App Router页面** | 60+ | 路由层 (app/) |
| **业务组件** | 150+ | UI层 (components/) |
| **Shadcn/ui组件** | 35+ | 基础UI组件 (components/ui/) |
| **Lib模块** | 10+ | 工具库模块 (lib/) |
| **自定义Hooks** | 5+ | React Hooks (lib/hooks/) |
| **Providers** | 2 | React Context Providers (providers/) |
| **类型定义文件** | 4 (+ 模块内分散) | TypeScript类型 (types/ + lib/**/types.ts) |

---

## 🏗️ 架构分层说明

### 1. **路由层 (Routing Layer)** - `app/`
- 基于Next.js 14+ App Router
- 使用Route Groups组织路由: `(auth)`, `(dashboard)`
- 动态路由: `[id]`, `[slug]`, `[lessonId]`
- API Routes: `/api/*` (Webhooks, Cron Jobs, 流式响应)

### 2. **业务逻辑层 (Business Logic Layer)** - `actions/`
- 所有数据库操作必须通过Server Actions
- 使用Prisma ORM (隔离原则: 只在Server端)
- 统一错误处理和日志记录
- 类型安全: 输入使用Zod验证

### 3. **UI层 (Presentation Layer)** - `components/`
- 业务组件: `components/business/`, `components/practice/`
- 基础组件: `components/ui/` (Shadcn/ui)
- 客户端包装器: `*-client-wrapper.tsx` (Server → Client边界)
- 可复用组件: `components/shared/`

### 4. **工具层 (Utility Layer)** - `lib/`
- 工具函数: `lib/utils.ts` 及各模块工具文件
- 模块化封装: `lib/content-pipeline/`, `lib/permissions/`, `lib/practice/` 等
- 自定义Hooks: `lib/hooks/`
- 客户端配置: `lib/supabase/`, `lib/prisma.ts`, `lib/stripe.ts`, `lib/gemini.ts`

### 5. **类型层 (Type Layer)** - `types/` + 模块内类型
- 全局类型定义: `types/` (集中式)
- 模块类型定义: `lib/**/types.ts`, `components/**/types.ts` (分散式)
- Prisma生成类型: `@prisma/client` (自动生成)
- 设计理念: **就近原则** - 类型定义贴近使用场景

---

## 🎯 关键设计模式

### 1. **BFF (Backend for Frontend)**
```
Client → Next.js Server Actions → Prisma → Supabase PostgreSQL
```

### 2. **Server/Client组件边界**
```typescript
// ❌ 错误: 在Client组件中导入Prisma
'use client'
import prisma from '@/lib/prisma'  // ERROR!

// ✅ 正确: 使用Server Action
'use client'
import { getUserData } from '@/actions/profile'  // Correct
```

### 3. **Adapter Pattern (适配器模式)**
- 排行榜: PostgreSQL实现 (MVP) → 可替换为Redis (V2.0)
- 文件存储: Supabase Storage → 可替换为AWS S3
- 认证: Supabase Auth → 可替换为NextAuth.js

---

## 📝 命名规范

### 文件命名
- **组件**: PascalCase (e.g. `UserProfile.tsx`)
- **工具函数**: kebab-case (e.g. `error-handler.ts`)
- **Server Actions**: kebab-case (e.g. `user-ops.ts`)
- **类型定义**: kebab-case (e.g. `achievement.ts`)

### 组件命名
- **页面组件**: `*Page` (e.g. `DashboardPage`)
- **视图组件**: `*View` (e.g. `CommunityView`)
- **客户端包装器**: `*ClientWrapper` (e.g. `AdminClientWrapper`)
- **模态框**: `*Modal` / `*Dialog` (e.g. `LoginModal`)

---

## 🔍 快速查找指南

### "我想找..."

| 需求 | 查找路径 |
|-----|---------|
| **修改登录逻辑** | `actions/auth.ts` (Server Action) + `app/(auth)/login/page.tsx` (UI) |
| **添加新的Server Action** | `actions/` 目录下创建新文件 |
| **修改Dashboard页面** | `app/(dashboard)/dashboard/page.tsx` (路由) + `components/business/dashboard/` (组件) |
| **添加新的题目类型** | `lib/practice/types.ts` (类型) + `components/practice/QuestionRenderer.tsx` (渲染) |
| **修改侧边栏** | `components/business/AppSidebar.tsx` (Sidebar Layer) |
| **添加新的成就** | `lib/gamification-utils.ts` (工具) + `actions/gamification.ts` (逻辑) |
| **修改数据库Schema** | `prisma/schema.prisma` (Schema定义) + 运行 `npx prisma db push` |
| **添加新的工具函数** | `lib/utils.ts` 或相关模块下创建新文件 |
| **修改排行榜逻辑** | `actions/leaderboard.ts` (Server Action) + `lib/leaderboard/pg-adapter.ts` (适配器) |
| **添加新的路由** | `app/` 目录下创建新文件夹 (遵循App Router规范) |
| **配置Supabase客户端** | `lib/supabase/client.ts` (客户端) + `lib/supabase/server.ts` (服务端) |
| **添加权限检查** | `lib/permissions/engine.ts` (权限引擎) + `lib/permissions/config.ts` (配置) |

---

## ⚠️ 重要提示

### 1. **废弃代码清理计划**
`__deprecated__/` 目录下的文件计划在Phase 6完成后删除。在修改代码前请先检查是否在使用废弃文件。

### 2. **Mock数据使用**
- `__dev__/mock/` 和 `components/*/mock/` 下的数据仅用于开发测试
- 生产环境不应依赖Mock数据

### 3. **类型安全**
- 所有Server Actions的输入必须使用Zod验证
- 禁止使用 `any` 类型
- Prisma查询结果使用 `Prisma.Validator` 生成类型

### 4. **性能优化**
- 大型组件使用 `React.lazy()` 懒加载
- 图片使用 `next/image` (自动优化)
- 长列表使用虚拟滚动 (react-window)

---

## 📚 相关文档

- [PRD.md](./PRD.md) - 产品需求文档
- [TECH_STACK.md](./TECH_STACK.md) - 技术栈详细说明
- [FEATURE_AUDIT.md](./FEATURE_AUDIT.md) - 功能审计文档
- [stories/README.md](./stories/README.md) - Story依赖关系图

---

**生成时间**: 2026-02-07
**版本**: v1.1 (已修正)
**最后更新**: 2026-02-07 - 修正 lib/, providers/, types/, components/ 结构
**维护**: 随项目迭代实时更新
