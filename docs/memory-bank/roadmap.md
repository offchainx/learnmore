# Project Roadmap (全局路线图)

**状态**: 📅 Planning
**总任务数**: 20 Stories

## Phase 1: Foundation (基础设施 & 身份)
- [ ] **Story-001**: Next.js 初始化与工程化配置 (Infra)
- [ ] **Story-002**: 数据库 Schema 设计与 Prisma 迁移 (DB)
- [ ] **Story-003**: 身份认证系统 (Auth)
- [ ] **Story-004**: 全局布局与导航框架 (App Shell)
    - *目标*: 实现响应式侧边栏、顶部导航、暗色模式切换、移动端适配。

## Phase 2: Course Engine (课程学习引擎)
- [ ] **Story-005**: 种子数据与后台管理 (Seed Data)
    - *目标*: 编写 Prisma Seed 脚本，预置 6 大学科、章节和基础题目数据。
- [ ] **Story-006**: 课程目录树组件 (Course Tree)
    - *目标*: 实现支持无限层级的章节折叠/展开组件 (Recursive Component)。
- [ ] **Story-007**: 学习页面核心布局 (Lesson Layout)
    - *目标*: 左侧目录、右侧内容的响应式布局，处理路由状态。
- [ ] **Story-008**: 视频播放器集成 (Video Player)
    - *目标*: 集成 React Player，实现 HLS 播放、倍速控制、防盗链 URL 请求。
- [ ] **Story-009**: 学习进度追踪 (Progress Sync)
    - *目标*: 记录视频播放位置，自动标记章节“已完成”。

## Phase 3: Question Bank (智能题库)
- [ ] **Story-010**: 题目渲染引擎 (Question UI)
    - *目标*: 支持 LaTeX 公式渲染 (KaTeX)，实现单选/多选/填空题 UI 卡片。
- [ ] **Story-011**: 练习模式逻辑 (Quiz Engine)
    - *目标*: 实现答题状态机（倒计时、切题、选中状态、答题卡）。
- [ ] **Story-012**: 判卷与提交 (Grading System)
    - *目标*: Server Action 接收答案，比对正误，写入数据库，返回解析。
- [ ] **Story-013**: 错题本系统 (Error Book)
    - *目标*: 错题自动收集，提供“错题重练”和“移除错题”功能。

## Phase 4: Community (互动社区)
- [ ] **Story-014**: 社区板块与帖子列表 (Forum List)
    - *目标*: 帖子筛选（最新/最热/学科），分页加载，搜索功能。
- [ ] **Story-015**: 富文本编辑器 (Post Editor)
    - *目标*: 集成 Tiptap，支持图片上传、公式输入、内容发布。
- [ ] **Story-016**: 帖子详情与评论 (Comments)
    - *目标*: 帖子内容渲染，多级评论树 (Nested Comments)。

## Phase 5: Growth & Stats (数据与成长)
- [ ] **Story-017**: 学习仪表盘 (Dashboard)
    - *目标*: 首页概览，展示连续打卡、今日任务。
- [ ] **Story-018**: 数据可视化图表 (Charts)
    - *目标*: 使用 Recharts 绘制能力雷达图和学习趋势图。
- [ ] **Story-019**: 排行榜系统 (Leaderboard)
    - *目标*: 接入 Redis，实现实时积分排行（全站/学科）。
- [ ] **Story-020**: 个人中心与设置 (Profile)
    - *目标*: 修改头像、资料，查看获得的成就徽章。