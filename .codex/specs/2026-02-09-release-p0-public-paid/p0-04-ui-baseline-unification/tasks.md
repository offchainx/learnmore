# 执行任务清单（Tasks）

| id | description | owner | status (todo/doing/done) | link (PR/commit) |
|---|---|---|---|---|
| T-001 | 重写 P0-04 UI 基线统一 的 spec.md 与 plan.md 并补齐接口契约 | codex | done |  |
| T-002 | 重写 acceptance.md，加入 Action 与数据表核对矩阵 | codex | done |  |
| T-003 | 文档审阅与范围确认（用户确认前禁止开发） | user | done | 2026-03-11：用户确认练习中心与五种练习模式方向，可进入分批开发。 |
| T-004 | 聚焦 `/dashboard/practice` 及其子页面的视觉方向定稿（练习中心重设计主线） | codex | done | 2026-03-11：练习中心首页与五种模式设计方向已冻结，进入组件化实现。 |
| T-004.1 | 命名体系统一方案：冻结 Practice 术语、命名后缀规则、首批重命名映射表 | codex | done |  |
| T-004.2 | 练习中心总体视觉气质定义：专业训练舱、磨砂舱体、单主色+状态色 | codex | done |  |
| T-004.3 | 练习中心主页面方案：重做信息架构、首屏主次关系、PracticeCoachPanel 位置与作用 | codex | done |  |
| T-004.4 | Smart Drill 方案：启动态、训练中 HUD、答题节奏、结果页结构 | codex | done |  |
| T-004.5 | Error Wiper 方案：错因修复实验室定位、进度表达、结束复盘 | codex | done |  |
| T-004.6 | Mock Arena 方案：考试配置台、考试桌面、交卷确认、结果摘要 | codex | done |  |
| T-004.7 | Chapter Progress 方案：章节进度板语义、节点结构、进入 drill 的路径 | codex | done |  |
| T-004.8 | Past Paper Library 方案：试卷档案库结构、筛选、状态与入口动作 | codex | done |  |
| T-004.9 | PracticeCoachPanel 方案：知识网络、预测、薄弱点、推荐动作的统一骨架 | codex | done |  |
| T-004.10 | 练习中心共用设计合同冻结：标题、面板、CTA、空态、状态反馈、移动端规则 | codex | done |  |
| T-005 | 最小视觉定稿冻结（从练习中心提炼到全局基线） | user | done | 2026-03-11：用户确认练习中心视觉收口版本，可作为模式页设计基线。 |
| T-005.1 | 全局 token 冻结：颜色、圆角、阴影、focus ring、surface 层级 | codex | done |  |
| T-005.2 | 基础控件冻结：button / card / input / textarea 的默认与交互态 | codex | done |  |
| T-005.3 | 公共空态与 CTA 模板冻结：Dashboard / Leaderboard / Community 共用规范 | codex | done |  |
| T-005.4 | 壳层与导航规则冻结：BottomTabBar 与 dashboard-layout 路由映射、激活态一致 | codex | done |  |
| T-006 | 开发实现（门禁项，等待用户批准） | codex | doing |  |
| T-006.1 | 练习中心命名与组件骨架落地：首批 rename、import/export 修正、语义统一 | codex | done | 2026-03-10：完成组件导出名、props 名与页面引用链统一，保留现有 URL slug 与文件路径稳定性。 |
| T-006.2 | 练习中心主页面落地：训练指挥台布局、PracticeSubjectBar、主副栏与移动端任务流 | codex | done | 2026-03-11：完成练习中心首页重构、左 2/3 练习区 + 右 1/3 分析区、悬浮通知与视觉收口。 |
| T-006.3 | Smart Drill 落地：启动态摘要、训练 HUD、答题节奏、结果态 | codex | done | 2026-03-11：完成第一批重构，抽离统一模式壳子并让 Smart Drill 接入共用 header / empty / result 组件。 |
| T-006.3.1 | 抽统一 Practice Mode Shell：共用 PracticeHeader / EmptyState / ResultPanel / 页面容器 | codex | done | 2026-03-11：新增 `src/components/practice/modes/shared/*`，建立模式页共用骨架。 |
| T-006.3.2 | Smart Drill 接入统一模式壳子：重构启动页、训练页头、结果页并保留现有业务读写链路 | codex | done | 2026-03-11：`SmartDrillMode` 与 `QuizSession` 已切换到统一壳子，保留既有推荐与提交链路。 |
| T-006.4 | Error Wiper 落地：错因修复实验室风格、进度区、当前题卡、结束复盘 | codex | done | 2026-03-10：改为 Setup -> Active -> Summary 三段式，复用 QuestionCard 支持多题型，并补齐修复摘要与返回入口。 |
| T-006.5 | Mock Arena 落地：考试配置台、考试状态栏、导航器、交卷确认、成绩摘要 | codex | todo |  |
| T-006.6 | Chapter Progress / Chapter Drill 落地：主页面推进板与专注训练页 | codex | todo |  |
| T-006.7 | Past Paper Library 落地：卷库区、试卷入口信息、状态动作与详情页头部 | codex | todo |  |
| T-006.8 | PracticeCoachPanel 落地：右侧教练板统一容器、固定顺序、模式页精简策略 | codex | todo |  |
| T-006.9 | 练习中心视觉统一收口：颜色、CTA、空态、加载态、错误态、移动端一致性 | codex | todo |  |
| T-006.10 | 内容管理-题目审核页基线对齐：接入批量导入页同款舱体式 header、放宽主内容容器、收紧顶部/右侧留白，并统一列表壳层与筛选工具栏视觉层级 | codex | done | 2026-03-11：完成内容审核页 header/KPI/筛选区/列表壳层统一，对齐批量导入页视觉语言，并合并轻量统计与时间筛选。 |
| T-006.11 | 用户报错页基线对齐：参考批量导入/内容审核页面，统一 header、KPI、筛选工具栏、表格壳层与首屏信息层级 | codex | done | 2026-03-11：完成用户报错页工作台重构，统一 header/KPI/筛选与表格壳层，保留详情抽屉交互并接入时间范围与状态筛选。 |
| T-006.12 | 管理仪表盘基线对齐 | codex | done | 2026-03-12：完成管理仪表盘 header/KPI/工作队列/风险区/审计表统一，对齐批量导入与内容管理页的 admin 工作台视觉语言；后续收口为左右双列、一屏优先布局，并移除快捷入口。 |
| T-006.13 | 用户列表基线对齐：参考批量导入/内容审核/管理仪表盘，统一 header、KPI、筛选工具栏、表格壳层、分页与空态层级 | codex | done | 2026-03-12：完成用户列表页 header/KPI/筛选工具栏/表格与分页壳层统一，保留现有搜索、筛选、分页、详情跳转与高风险操作逻辑。 |
| T-006.14 | 反馈中心基线对齐 | codex | done | 2026-03-12：完成反馈中心列表页 header/KPI/时间范围/筛选工具栏/表格壳层统一，并补齐反馈概览与筛选查询接口；反馈详情页同步接入统一外层壳与抬头。 |
| T-006.15 | 权限调空整合到用户列表中 | codex | done | 2026-03-12：将提权/覆写能力并入用户列表行操作，仅管理员可见；移除 sidebar 中的权限调控入口，并让 `/admin/permissions` 直接返回 404。 |
| T-006.16 | 整合推荐关系/voucher 管理，基线对齐 | codex | done | 2026-03-12：将推荐关系与 Voucher 管理整合到 `/admin/referrals` 的统一工作台，接入 header/KPI/tabs/筛选/表格壳层；sidebar 收口为单一“增长工具”入口，`/admin/vouchers` 改为跳转到整合页。 |
| T-006.17 | 等级卡片/排行榜整合基线对齐：以排行榜为主舞台，整合等级、XP、下一个目标与推荐挑战，完整成就库保留独立查看入口 | codex | done | 2026-03-12：完成排行榜页与等级成长信息整合，接入个人成长总览、推荐挑战/追赶目标 tabs、首屏 mock 榜单与段位区重排；移除 sidebar 中独立排行榜入口，改由等级卡进入排行榜页，完整成就库继续保留在独立成就页查看。 |
| T-006.18 | 仪表盘基线对齐 | codex | done | 2026-03-12：完成 `/dashboard` 首页基线对齐，统一深色舱体 header、8/4 工作台布局、统计卡、任务区、排名卡、空态与 CTA 语义；保留年级排名冲击力但弱化过强紫色。 |
| T-006.19 | 课程学习基线对齐 | codex | done | 2026-03-13：完成 `/dashboard/courses` 基线对齐与第二轮视觉收口，统一深色舱体 header、科目切换条、课程总览卡、课程/复习/笔记三态内容区与右侧建议栏；收回高饱和 hero、改为蓝青玻璃主基线，并接入各学科 hero 主题图与统一 pills 交互。 |
| T-006.20 | 学员社区基线对齐 | codex | done | 2026-03-13：完成 `/dashboard/community` 论坛式列表重构，统一 3/1 主次栏比例、顶部筛选栏、帖子卡片信息架构、右侧板块导航与发布帖子页表单壳层；后续继续向 Dashboard 深蓝舱体视觉语言收口，统一社区卡片背景/透明度，并将发帖页正文以上字段改成双列布局；保留原有社区链路与反馈 FAB，收藏/已关注先按现有数据层做展示占位。 |
| T-006.21 | 设定页面基线对齐 | codex | done | 2026-03-13：完成 `/dashboard/settings` 单页工作台改造，统一 Dashboard 深蓝舱体 header、左侧 rail 与五大 section；将设置页从 tab 切换改成单页锚点导航，拆分为左 rail 固定 + 右侧 section 独立滚动；补齐套餐视觉分层、滚动定位、安全区与 ReferralSection hydration 修复。 |
| T-006.22 | 调整 sidebar | codex | done | 2026-03-13：完成 sidebar 第一轮结构重排，收口为主导航 / 管理 / 轻量 Upgrade / 底部账户区四段式；下移 admin 区、弱化 Upgrade 卡、将等级卡并入账户区，并补齐 icon 彩色 hover 与设置齿轮微动。 |
| T-006.23 | 统一所有页面视觉语言：字体/字号/留白基线收口 | codex | doing |  |
| T-006.23.1 | 页面级标题壳子统一：统一主页面 hero/header 的 eyebrow、H1、sub copy、容器 padding、标题区与主体内容的垂直间距 | codex | done |  |
| T-006.23.2 | 文本层级统一：统一页面标题、模块标题、卡片标题、说明文字、辅助文字的字号/字重/行高/字距基线 | codex | todo |  |
| T-006.23.3 | 间距系统统一：统一页面 section 间距、卡片内边距、列表项高度与行间距，收口为固定 spacing 档位 | codex | todo |  |
| T-006.23.4 | 状态与交互语言统一：统一主次按钮、tab、hover、active、分页点、空态 CTA、滚轮分页提示的视觉规则 | codex | todo |  |
| T-006.23.5 | 右栏与辅助模块统一：统一右栏卡片标题区、说明文字密度、CTA 位置、空态模板，并消除与主区重复的信息块 | codex | todo |  |
| T-006.24 | 设定页补齐：浅色主题与语言设定两个问题 | codex | doing |  |
| T-006.24.1 | 浅色主题 token 合同：补齐 page / surface / text / border / shadow / state 语义层，建立浅色模式基础令牌映射 | codex | done | 2026-03-13：在 `globals.css` 与 `tailwind.config.ts` 补齐浅/深两套 page/surface/text/border/shadow/state 语义 token，并将根 `ThemeProvider` 默认主题切为 `system`、启用系统主题跟随。 |
| T-006.24.2 | 全局壳层与导航适配浅色主题：sidebar、topbar、page shell、hero 容器的浅色层级与选中态规则统一 | codex | todo |  |
| T-006.24.3 | 基础交互件适配浅色主题：button、input、textarea、select、switch、radio、chip、segmented control 的浅色状态补齐 | codex | todo |  |
| T-006.24.4 | 数据型组件适配浅色主题：KPI 卡、表格、筛选工具栏、状态 badge、空态模板在浅色模式下统一 | codex | todo |  |
| T-006.24.5 | 页面例外项收口：Dashboard / 课程 / 练习中心 / 社区 / 定价 / 排行榜 / 成就中心 / 设置页的浅色特例逐页收口 | codex | todo |  |
| T-006.24.6 | 浅色主题回归矩阵：hover / focus / active / disabled / empty / loading / selected 状态逐项验证 | codex | todo |  |
| T-006.25 | 全局基线实现批次：token -> 基础组件 -> 空态模板 -> 壳层导航 | codex | todo |  |
| T-007 | 本地验证（Action + SQL 快照） | codex | todo |  |
| T-007.1 | 本地 UI 回归：主路径、空态、加载态、移动端、导航一致性 | codex | todo |  |
| T-007.2 | 本地读链路验证：不新增非预期写入、不破坏现有 API 读取行为 | codex | todo |  |
| T-008 | 预发复测与收尾 | codex | todo |  |
| T-008.1 | 预发视觉复测：页面一致性、五种模式风格统一、壳层不退化 | codex | todo |  |
| T-008.2 | 预发行为复测：练习中心主路径与 Dashboard/Leaderboard/Community 基线统一 | codex | todo |  |

## 备注

- 当前阶段优先完成视觉方向确认与最小视觉定稿；未获用户批准前，不允许进入代码实现。
- T-004 为练习中心重设计主线；T-005 将练习中心定稿结果提炼为全局 UI 基线。
- T-004.1 已确认：统一使用 `Practice` 术语；`SubjectSelector` 改为 `PracticeSubjectBar`；`Chapter Map` 改为 `Chapter Progress` 语义。
- T-004.2 已确认：练习中心采用“专业训练舱 / 磨砂舱体 / 单主色+状态色”视觉合同，主强调色推荐冷钴蓝，禁止泛紫 AI SaaS 渐变与过度 neon 发光。
- T-004.3 已确认：`/dashboard/practice` 重构为“训练指挥台”，首屏优先回答“最弱哪里 / 今天练什么 / 最快提分入口”，桌面端采用 8/4 主副栏结构，移动端改为纵向任务流。
- T-004.4 ~ T-004.10 已完成第一版设计冻结：五种模式、教练板与共用设计合同均已写入 `plan.md / spec.md`，等待统一审阅。
- T-005.1 ~ T-005.4 已完成第一版全局基线冻结：token、基础控件、空态模板、导航壳层规则均已写入 `plan.md / spec.md`，等待统一审阅。
- T-006 已按“单任务单问题”原则拆细，后续实现阶段按子任务逐项提交与验收，不再将练习中心整包视为一个实现任务。
