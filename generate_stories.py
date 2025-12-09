import os

stories = [
    {
        "id": "004-layout",
        "title": "App Shell & Navigation",
        "phase": "Phase 1: Foundation",
        "goal": "构建全局响应式布局框架，包含侧边栏和导航。",
        "objectives": [
            "实现 AppSidebar 组件 (Shadcn Sidebar)。",
            "实现 Breadcrumb 面包屑导航。",
            "实现 ThemeToggle (暗色/亮色模式切换)。",
            "实现 UserNav (用户头像下拉菜单)。",
            "确保移动端 Hamburger 菜单正常工作。"
        ],
        "tech": [
            "Shadcn Components: `Sidebar`, `DropdownMenu`, `Sheet`, `Breadcrumb`。",
            "Layout: 使用 Next.js `layout.tsx` 嵌套布局。",
            "State: 使用 Zustand 或 Context 控制 Sidebar 状态。"
        ],
        "verification": [
            "在 Desktop 缩放窗口，Sidebar 应响应式折叠。",
            "在 Mobile 视图，Sidebar 默认隐藏，点击按钮弹出。",
            "切换路由时，面包屑应正确更新。",
            "切换深色模式，全站颜色反转正确。"
        ]
    },
    {
        "id": "005-seed-data",
        "title": "Seed Data & Admin Tools",
        "phase": "Phase 2: Course Engine",
        "goal": "预置系统基础数据，确保开发时有内容可展示。",
        "objectives": [
            "编写 `prisma/seed.ts` 脚本。",
            "生成 6 大学科 (Subjects) 数据。",
            "生成层级章节数据 (Chapters) - 至少 3 层嵌套。",
            "生成部分示例题目 (Questions) 和 视频课时 (Lessons)。",
            "配置 `package.json` 中的 `prisma seed` 命令。"
        ],
        "tech": [
            "Prisma Client: `prisma.subject.create`, `prisma.chapter.create`。",
            "Faker.js (可选): 生成随机文本。",
            "Transaction: 确保数据插入原子性。"
        ],
        "verification": [
            "运行 `npx prisma db seed` 无报错。",
            "使用 Prisma Studio 查看数据库，确认数据层级关系正确 (parentId 指向正确)。"
        ]
    },
    {
        "id": "006-course-tree",
        "title": "Course Tree Component",
        "phase": "Phase 2: Course Engine",
        "goal": "实现支持无限层级的课程目录树组件。",
        "objectives": [
            "创建 `CourseTree` 递归组件。",
            "支持展开/折叠状态记忆。",
            "高亮当前选中的章节。",
            "展示章节的学习状态图标 (锁/完成/进行中)。"
        ],
        "tech": [
            "React: Recursive Rendering (组件调用自身)。",
            "Shadcn: `Collapsible` 或 `Accordion` 组件。",
            "Tailwind: 缩进样式处理。"
        ],
        "verification": [
            "加载 3 层以上嵌套数据，层级缩进显示正确。",
            "点击父节点，子节点展开/收起流畅。",
            "点击叶子节点，路由跳转正确。"
        ]
    },
    {
        "id": "007-lesson-view",
        "title": "Lesson Page Layout",
        "phase": "Phase 2: Course Engine",
        "goal": "构建学习页面的主布局。",
        "objectives": [
            "创建 `/course/[subjectId]/[lessonId]` 页面。",
            "实现左侧 Sidebar (CourseTree) + 右侧 Main Content 布局。",
            "实现 Resizable Handle (可选) 拖拽调整侧边栏宽度。",
            "处理 Loading 状态 (Skeleton)。"
        ],
        "tech": [
            "Next.js: Dynamic Routes。",
            "Shadcn: `Resizable` 组件 (可选) 或 Grid 布局。",
            "Suspense: 异步加载数据时的骨架屏。"
        ],
        "verification": [
            "访问具体课时 URL，页面结构正常。",
            "左侧目录树与右侧内容区独立滚动。",
            "移动端下目录树通过 Drawer 弹出。"
        ]
    },
    {
        "id": "008-video-player",
        "title": "Video Player Integration",
        "phase": "Phase 2: Course Engine",
        "goal": "集成专业视频播放器，支持流媒体和防盗链。",
        "objectives": [
            "集成 `react-player` 组件。",
            "实现 Server Action `getSignedVideoUrl(lessonId)`。",
            "实现播放器基础控制 (播放/暂停/倍速/全屏)。",
            "处理 HLS 流媒体播放 (可选，视素材而定)。"
        ],
        "tech": [
            "Library: `react-player`。",
            "Backend: Supabase Storage Signed URLs。",
            "Security: URL 有效期限制 (e.g. 1小时)。"
        ],
        "verification": [
            "视频能正常加载播放。",
            "直接复制 `src` 中的 URL 在新无痕窗口打开，1小时后应失效。",
            "倍速切换有效。"
        ]
    },
    {
        "id": "009-progress-sync",
        "title": "Learning Progress Sync",
        "phase": "Phase 2: Course Engine",
        "goal": "实时记录用户的学习进度。",
        "objectives": [
            "监听播放器 `onProgress` 事件。",
            "实现防抖 (Debounce) 上报进度 API。",
            "后端计算：当进度 > 90% 时自动标记为 Completed。",
            "前端目录树实时更新完成图标。"
        ],
        "tech": [
            "React: `useEffect`, `useDebounce`。",
            "Database: 更新 `UserProgress` 表。",
            "Optimistic UI: 立即更新前端状态，不等待后端返回。"
        ],
        "verification": [
            "观看视频过程中，Network 面板看到定期上报请求。",
            "刷新页面，视频应从上次播放位置继续。",
            "拉动进度条到末尾，章节状态变为已完成。"
        ]
    },
    {
        "id": "010-question-ui",
        "title": "Question Rendering Engine",
        "phase": "Phase 3: Question Bank",
        "goal": "实现支持富文本和公式的题目渲染组件。",
        "objectives": [
            "引入 `KaTeX` 支持 LaTeX 公式渲染。",
            "实现 `QuestionCard` 组件。",
            "支持 单选/多选/填空 三种题型的 UI 差异化展示。",
            "实现选项的选中/取消选中交互。"
        ],
        "tech": [
            "Library: `react-katex`, `react-markdown`。",
            "CSS: Tailwind Typography 插件优化排版。",
            "Component: 封装 `SingleChoice`, `MultiChoice` 子组件。"
        ],
        "verification": [
            "题目中的数学公式 (e.g. x^2) 渲染正确。",
            "点击选项能正确切换选中状态。",
            "多选题能选中多个，单选题只能互斥选中。"
        ]
    },
    {
        "id": "011-quiz-mode",
        "title": "Quiz Mode Logic",
        "phase": "Phase 3: Question Bank",
        "goal": "实现完整的答题流程控制。",
        "objectives": [
            "实现题目分页/切换 (上一题/下一题)。",
            "实现答题倒计时 (Timer)。",
            "实现答题卡 (Grid View) 快速跳转。",
            "管理 `currentAnswers` 临时状态。"
        ],
        "tech": [
            "State: Zustand Store (`quiz-store`) 管理答题会话。",
            "Storage: `localStorage` 暂存防止刷新丢失 (可选)。"
        ],
        "verification": [
            "倒计时结束自动提交。",
            "在第 5 题刷新页面，状态不丢失 (或提示重新开始)。",
            "答题卡能准确反映已做/未做题目。"
        ]
    },
    {
        "id": "012-grading-engine",
        "title": "Grading & Submission",
        "phase": "Phase 3: Question Bank",
        "goal": "后端判卷逻辑与结果反馈。",
        "objectives": [
            "实现 `submitQuiz` Server Action。",
            "后端比对答案，计算得分。",
            "写入 `UserAttempt` 和 `ExamRecord` 表。",
            "前端展示结果页 (Score Card) 和解析 (Explanation)。"
        ],
        "tech": [
            "Logic: 数组比较算法 (处理多选题部分得分逻辑)。",
            "DB: 事务写入 (Transaction)。",
            "UI: 结果页展示正确/错误高亮。"
        ],
        "verification": [
            "提交全对答案，得分满分。",
            "提交部分错误答案，得分准确。",
            "提交后能看到题目解析和正确答案。"
        ]
    },
    {
        "id": "013-error-book",
        "title": "Error Book System",
        "phase": "Phase 3: Question Bank",
        "goal": "错题自动收集与复习。",
        "objectives": [
            "在判卷逻辑中，自动将错题写入 `ErrorBook` 表。",
            "实现错题本列表页，支持按学科筛选。",
            "实现 '消灭错题' 功能 (重做正确后移除)。"
        ],
        "tech": [
            "DB: `upsert` 逻辑 (如果已存在错题则更新次数)。",
            "API: 获取错题列表。",
            "UI: 错题卡片，带有 '移除' 按钮。"
        ],
        "verification": [
            "做错一题，错题本立即出现该题。",
            "在错题本中重做该题并正确，该题从列表消失 (或标记为已掌握)。"
        ]
    },
    {
        "id": "014-post-list",
        "title": "Community Forum List",
        "phase": "Phase 4: Community",
        "goal": "展示社区帖子列表。",
        "objectives": [
            "创建 `/community` 页面。",
            "实现帖子列表项 (Post Item)，展示作者、时间、摘要、点赞数。",
            "实现侧边栏板块分类 (Categories)。",
            "实现分页加载 (Pagination) 或无限滚动。"
        ],
        "tech": [
            "DB: Post 表查询，关联 User 表。",
            "UI: Skeleton Loading 骨架屏。",
            "Search Params: URL 参数控制筛选和分页。"
        ],
        "verification": [
            "列表加载速度正常。",
            "点击分类，列表正确过滤。",
            "长文本摘要截断正常。"
        ]
    },
    {
        "id": "015-post-editor",
        "title": "Rich Text Post Editor",
        "phase": "Phase 4: Community",
        "goal": "实现功能完善的发帖编辑器。",
        "objectives": [
            "集成 `Tiptap` 编辑器。",
            "实现文字加粗、列表、引用等基础格式。",
            "实现图片上传 (Drag & Drop -> Supabase Storage)。",
            "实现 `createPost` Server Action。"
        ],
        "tech": [
            "Library: `@tiptap/react`, `@tiptap/starter-kit`。",
            "Storage: 图片上传 API。",
            "Form: 标题 + 内容 + 分类选择。"
        ],
        "verification": [
            "能输入富文本并保留格式发布。",
            "图片上传成功并能在详情页显示。",
            "空内容发布应被拦截。"
        ]
    },
    {
        "id": "016-post-detail",
        "title": "Post Detail & Comments",
        "phase": "Phase 4: Community",
        "goal": "帖子详情与互动。",
        "objectives": [
            "渲染帖子详情页 (HTML Content)。",
            "实现评论列表 (Comment List)。",
            "实现发表评论 (Reply)。",
            "实现点赞 (Like) 交互 (Optimistic UI)。"
        ],
        "tech": [
            "Security: `htmr` or `rehype` sanitize HTML content (XSS 防护)。",
            "DB: 递归查询或扁平化存储评论树。",
            "State: 本地状态立即响应点赞，后台异步请求。"
        ],
        "verification": [
            "详情页内容渲染正确，无 XSS 风险。",
            "评论后立即显示在列表底部。",
            "点赞数字即时变化。"
        ]
    },
    {
        "id": "017-dashboard",
        "title": "User Dashboard",
        "phase": "Phase 5: Growth & Stats",
        "goal": "个人学习数据概览。",
        "objectives": [
            "实现 `/dashboard` 概览页。",
            "展示 4 个核心卡片: 累计学习时长、刷题数、正确率、连续打卡。",
            "展示 '今日任务' (Continue Learning)。"
        ],
        "tech": [
            "DB: 聚合查询 (Aggregation Queries)。",
            "UI: Stat Cards (Shadcn)。",
            "Date: 处理时区差异。"
        ],
        "verification": [
            "数据显示准确 (与 DB 一致)。",
            "点击 '继续学习' 能跳转到上次观看的视频。"
        ]
    },
    {
        "id": "018-charts",
        "title": "Data Visualization",
        "phase": "Phase 5: Growth & Stats",
        "goal": "可视化展示学习能力。",
        "objectives": [
            "集成 `Recharts` 库。",
            "实现 '能力雷达图' (Radar Chart) - 各学科掌握度。",
            "实现 '学习趋势图' (Line Chart) - 近 7 天活跃度。"
        ],
        "tech": [
            "Library: `recharts`。",
            "Data Processing: 后端格式化数据为图表所需格式。",
            "Responsive: 图表在移动端应自适应。"
        ],
        "verification": [
            "图表渲染无报错。",
            "数据点悬停显示 Tooltip 详情。",
            "无数据时显示 Empty State。"
        ]
    },
    {
        "id": "019-leaderboard",
        "title": "Redis Leaderboard",
        "phase": "Phase 5: Growth & Stats",
        "goal": "高性能实时排行榜。",
        "objectives": [
            "配置 Redis 连接 (Upstash)。",
            "实现 `updateScore` (ZADD) 逻辑。",
            "实现 `getLeaderboard` (ZREVRANGE) 逻辑。",
            "前端展示排行榜列表 (前 10 名 + 自己的排名)。"
        ],
        "tech": [
            "DB: Redis Sorted Sets。",
            "Cron: 每周清空排行榜 (可选)。",
            "UI: 列表高亮自己。"
        ],
        "verification": [
            "做题得分后，排行榜分数实时更新。",
            "多人并发更新分数，排名计算准确。"
        ]
    },
    {
        "id": "020-profile",
        "title": "Profile & Settings",
        "phase": "Phase 5: Growth & Stats",
        "goal": "用户资料管理。",
        "objectives": [
            "实现 `/settings` 页面。",
            "支持修改头像 (Avatar Upload)。",
            "支持修改昵称、年级。",
            "展示获得的 '成就徽章' (Badges)。"
        ],
        "tech": [
            "Storage: 图片上传。",
            "Form: 资料修改表单。",
            "UI: Badge Grid Display。"
        ],
        "verification": [
            "头像上传后，右上角 UserNav 头像同步更新。",
            "修改资料保存后，刷新页面数据持久化。"
        ]
    }
]

base_dir = "docs/stories/backlog"
if not os.path.exists(base_dir):
    os.makedirs(base_dir)

for story in stories:
    filename = f"story-{story['id']}.md"
    filepath = os.path.join(base_dir, filename)
    
    content = f"# Story-{story['id']}: {story['title']}\n\n"
    content += f"**Phase**: {story['phase']}\n"
    content += f"**Goal**: {story['goal']}\n\n"
    
    content += "## 1. Objectives (实现目标)\n"
    for obj in story['objectives']:
        content += f"- [ ] {obj}\n"
    
    content += "\n## 2. Tech Plan (技术方案)\n"
    for tech in story['tech']:
        content += f"- {tech}\n"
        
    content += "\n## 3. Verification (测试验收)\n"
    for verify in story['verification']:
        content += f"- [ ] {verify}\n"
        
    content += "\n## 4. Deliverables (交付物)\n"
    content += "- 源代码提交 (Git Commit)。\n"
    content += "- 功能可用的预览链接 (Preview URL)。\n"

    with open(filepath, "w") as f:
        f.write(content)

print(f"Successfully generated {len(stories)} story files in {base_dir}")
