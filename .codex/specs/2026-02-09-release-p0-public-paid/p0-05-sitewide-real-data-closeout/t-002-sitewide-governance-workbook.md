# T-002 全站治理总表工作底稿

> 用途：按 `T-002.1 -> T-002.10` 顺序逐项补全全站治理前置内容。  
> 当前进度：已完成 `T-002.1`、`T-002.2`、`T-002.3`、`T-002.4`、`T-002.5`、`T-002.6`、`T-002.7`、`T-002.8`、`T-002.9`、`T-002.10`。

## T-002.1 全站页面域清单

### 页面域总览
| 页面域 | 主要路由 | 页面入口 | 是否正式页 | 备注 |
|---|---|---|---|---|
| Dashboard | `/dashboard` | Dashboard 首页 | 是 | P0 首屏核心页 |
| Courses | `/dashboard/courses`、`/course/[subjectId]`、`/course/[subjectId]/[lessonId]` | 课程中心、课程详情、课时详情 | 是 | 含恢复学习与进度写入 |
| Practice | `/dashboard/practice`、`/dashboard/practice/smart-drill`、`/dashboard/practice/error-wiper`、`/dashboard/practice/mock-arena`、`/dashboard/practice/mock-arena/[examId]`、`/dashboard/practice/chapter-drill/[chapterId]`、`/dashboard/practice/past-paper/[paperId]` | 练习中心与各模式页 | 是 | P0 高风险 mock 热点 |
| Community | `/dashboard/community`、`/dashboard/community/new`、`/dashboard/community/[postId]` | 社区列表、发帖、详情 | 是 | 含实时读写闭环 |
| Leaderboard | `/dashboard/leaderboard` | 排行榜 | 是 | 已识别首屏 mock 榜单 |
| Achievements | `/dashboard/achievements` | 成就页 | 是 | 含 XP、等级、streak、任务 |
| Settings | `/dashboard/settings`、`/dashboard/settings/notifications` | 设置页、通知页 | 是 | 含个人资料、偏好、通知 |
| Admin Home | `/admin`、`/admin/permissions` | 管理台首页、权限页 | 是 | 管理入口与公共管理能力 |
| Admin Users | `/admin/users`、`/admin/users/[id]` | 用户列表、用户详情 | 是 | 含管理动作 |
| Admin Feedback | `/admin/feedback`、`/admin/feedback/[id]` | 反馈列表、反馈详情 | 是 | 含处理流 |
| Admin Growth | `/admin/referrals`、`/admin/vouchers` | 推荐与券码管理 | 是 | 增长与券码域 |
| Admin Content Import | `/admin/content`、`/admin/content/import` | 内容入口、导入页 | 是 | 内容导入入口 |
| Admin Content Review | `/admin/content/review`、`/admin/content/review/[questionId]` | 审核列表、审核详情 | 是 | 内容审核域 |
| Admin Content QA | `/admin/content/reports`、`/admin/content/statistics` | 质控报错、统计页 | 是 | 内容统计与报错域 |
| Auth | `/login`、`/register` | 登录、注册 | 是 | 鉴权入口 |
| Marketing / Public | `/`、`/pricing`、`/contact`、`/help`、`/blog`、`/blog/[slug]`、`/subjects`、`/study-guides`、`/about-us`、`/how-it-works`、`/student-care`、`/success-stories`、`/privacy`、`/terms`、`/refund`、`/checkout/config` | 官网与营销页 | 是 | 含 CTA、表单、内容页 |
| Debug / Internal | `/dashboard/debug/ui-kit`、`/dashboard/practice/import` | 调试/导入辅助页 | 否 | 不作为正式用户可见页面纳入 P0 验收 |

### 按页面域拆分的路由清单

#### Dashboard
| 路由 | 页面类型 | 主要入口 | 是否正式页 | 备注 |
|---|---|---|---|---|
| `/dashboard` | 首屏聚合页 | 侧边栏默认入口 | 是 | 依赖任务、练习、课程、排行榜共享聚合 |

#### Courses
| 路由 | 页面类型 | 主要入口 | 是否正式页 | 备注 |
|---|---|---|---|---|
| `/dashboard/courses` | 课程中心 | Dashboard、侧边栏 | 是 | 课程列表与恢复学习入口 |
| `/course/[subjectId]` | 课程详情 | 课程中心 | 是 | 学科、章节树、课程介绍 |
| `/course/[subjectId]/[lessonId]` | 课时详情 | 课程详情 | 是 | 视频/内容/进度写入 |

#### Practice
| 路由 | 页面类型 | 主要入口 | 是否正式页 | 备注 |
|---|---|---|---|---|
| `/dashboard/practice` | 练习中心 | Dashboard、侧边栏 | 是 | 各模式入口、统计、推荐 |
| `/dashboard/practice/smart-drill` | Smart Drill | 练习中心 | 是 | 当前存在 preview/mock 分支风险 |
| `/dashboard/practice/error-wiper` | Error Wiper | 练习中心 | 是 | 错题修复域 |
| `/dashboard/practice/mock-arena` | Mock Arena 选卷页 | 练习中心 | 是 | 模拟考试入口 |
| `/dashboard/practice/mock-arena/[examId]` | Mock Arena 作答页 | Mock Arena | 是 | 会话、提交、结果 |
| `/dashboard/practice/chapter-drill/[chapterId]` | Chapter Drill | 章节入口 | 是 | 章节训练与结果 |
| `/dashboard/practice/past-paper/[paperId]` | Past Paper | 练习中心 | 是 | 历年真题模式 |

#### Community
| 路由 | 页面类型 | 主要入口 | 是否正式页 | 备注 |
|---|---|---|---|---|
| `/dashboard/community` | 社区列表 | 侧边栏 | 是 | 列表、筛选、互动 |
| `/dashboard/community/new` | 发帖页 | 社区列表 | 是 | 发帖动作 |
| `/dashboard/community/[postId]` | 帖子详情 | 社区列表 | 是 | 评论、点赞、详情 |

#### Leaderboard
| 路由 | 页面类型 | 主要入口 | 是否正式页 | 备注 |
|---|---|---|---|---|
| `/dashboard/leaderboard` | 排行榜 | Dashboard、侧边栏 | 是 | 周/月/总榜、我的排名 |

#### Achievements
| 路由 | 页面类型 | 主要入口 | 是否正式页 | 备注 |
|---|---|---|---|---|
| `/dashboard/achievements` | 成就页 | 侧边栏 | 是 | XP、等级、徽章、任务 |

#### Settings
| 路由 | 页面类型 | 主要入口 | 是否正式页 | 备注 |
|---|---|---|---|---|
| `/dashboard/settings` | 设置主页 | 侧边栏 | 是 | 资料、偏好设置 |
| `/dashboard/settings/notifications` | 通知设置页 | 设置页 | 是 | 通知偏好 |

#### Admin
| 路由 | 页面类型 | 主要入口 | 是否正式页 | 备注 |
|---|---|---|---|---|
| `/admin` | 管理台首页 | Admin 入口 | 是 | 管理聚合首页 |
| `/admin/permissions` | 权限页 | Admin 首页 | 是 | 角色与权限视图 |
| `/admin/users` | 用户列表 | Admin 首页 | 是 | 搜索、筛选、管理动作 |
| `/admin/users/[id]` | 用户详情 | 用户列表 | 是 | 用户详情与管理动作 |
| `/admin/feedback` | 反馈列表 | Admin 首页 | 是 | 反馈处理 |
| `/admin/feedback/[id]` | 反馈详情 | 反馈列表 | 是 | 反馈状态流转 |
| `/admin/referrals` | 推荐管理 | Admin 首页 | 是 | 推荐与奖励 |
| `/admin/vouchers` | 券码管理 | Admin 首页 | 是 | 券码、核销、状态 |
| `/admin/content` | 内容入口 | Admin 首页 | 是 | 内容管理父入口 |
| `/admin/content/import` | 导入页 | 内容入口 | 是 | 上传与导入 |
| `/admin/content/review` | 审核列表 | 内容入口 | 是 | 待审题目列表 |
| `/admin/content/review/[questionId]` | 审核详情 | 审核列表 | 是 | 审核动作 |
| `/admin/content/reports` | 内容报错页 | 内容入口 | 是 | 质控报错处理 |
| `/admin/content/statistics` | 内容统计页 | 内容入口 | 是 | 图表与统计 |

#### Auth
| 路由 | 页面类型 | 主要入口 | 是否正式页 | 备注 |
|---|---|---|---|---|
| `/login` | 登录页 | 官网 / 中间件跳转 | 是 | 认证入口 |
| `/register` | 注册页 | 官网 / CTA | 是 | 注册与首登链路 |

#### Marketing / Public
| 路由 | 页面类型 | 主要入口 | 是否正式页 | 备注 |
|---|---|---|---|---|
| `/` | 官网首页 | 根路径 | 是 | 多 CTA 汇总页 |
| `/pricing` | 定价页 | 官网导航 | 是 | 结算入口 |
| `/contact` | 联系页 | 官网导航 | 是 | 表单页 |
| `/help` | 帮助页 | 官网导航 | 是 | 支持内容页 |
| `/blog` | 博客列表 | 官网导航 | 是 | 内容列表 |
| `/blog/[slug]` | 博客详情 | 博客列表 | 是 | 内容详情 |
| `/subjects` | 学科介绍 | 官网导航 | 是 | 课程营销页 |
| `/study-guides` | 学习指南 | 官网导航 | 是 | 内容营销页 |
| `/about-us` | 关于我们 | 官网导航 | 是 | 介绍页 |
| `/how-it-works` | 工作原理 | 官网导航 | 是 | 产品说明 |
| `/student-care` | 学生关怀 | 官网导航 | 是 | 服务说明 |
| `/success-stories` | 成功案例 | 官网导航 | 是 | 营销内容 |
| `/privacy` | 隐私政策 | 官网导航 | 是 | 法务页 |
| `/terms` | 服务条款 | 官网导航 | 是 | 法务页 |
| `/refund` | 退款政策 | 官网导航 | 是 | 法务页 |
| `/checkout/config` | 结算配置页 | 定价页 | 是 | 结算前置配置 |

### 不纳入本任务正式验收的页面
| 路由 | 原因 | 处理方式 |
|---|---|---|
| `/dashboard/debug/ui-kit` | 调试/样式页，不属于正式业务页面 | 不纳入 P0 正式验收矩阵 |
| `/dashboard/practice/import` | 辅助导入页，非正式用户主流程页面 | 若涉及真实数据写入，后续归入相关 Admin/Practice 子任务单独判断 |

## T-002.2 全站业务对象清单

### 业务对象总览
| 业务对象 | 权威表/服务 | 主要读场景 | 主要写事件 | 关键字段 | 备注 |
|---|---|---|---|---|---|
| 用户账户 | `users` | Dashboard、Settings、Admin、Auth | 注册、状态变更、订阅更新 | `role`, `status`, `subscriptionTier`, `subscriptionStatus`, `streak`, `xp` | 全站核心对象 |
| 用户设置 | `user_settings`, `notification_preferences` | Settings、Dashboard、通知摘要 | 保存偏好、保存通知设置 | `language`, `theme`, `studyReminderTime`, 通知开关 | 偏好与通知配置 |
| 家长关系 | `parent_students`, `invite_codes` | 家长视图、设置 | 绑定学生、生成邀请码、使用邀请码 | `parentId`, `studentId`, `code`, `used` | 与家长功能相关 |
| 课程结构 | `subjects`, `chapters`, `lessons` | Courses、Practice、Marketing subjects | 内容导入、内容维护 | `name`, `order`, `chapterId`, `duration` | 学习内容主体 |
| 学习进度 | `user_progress` | Dashboard、Courses、Admin | 课时进度保存、完成课时 | `progress`, `isCompleted`, `lastPosition` | 恢复学习与进度展示 |
| 题目 | `questions` | Practice、内容审核、内容统计 | 导入题目、审核题目、报错处理 | `status`, `difficulty`, `type`, `subjectId`, `chapterId` | 练习题源权威表 |
| 练习会话结果 | `exam_records` | Dashboard、Practice、Leaderboard、Admin | 提交整轮练习/考试 | `mode`, `score`, `totalQuestions`, `correctCount`, `duration` | 练习结果权威汇总 |
| 逐题作答记录 | `user_attempts` | Dashboard、Practice 统计、弱项分析 | 提交答案 | `questionId`, `isCorrect`, `duration`, `examRecordId` | 统计与掌握度的权威明细 |
| 每日任务 | `daily_tasks` | Dashboard、Achievements | 初始化任务、推进任务、领取奖励 | `type`, `targetCount`, `currentCount`, `isClaimed`, `xpReward`, `date` | 幂等风险高 |
| 成就与徽章 | `badges`, `user_badges` | Achievements、Profile | 发放徽章 | `code`, `badgeId`, `awardedAt` | 奖励与展示对象 |
| 排行榜条目 | `leaderboard_entries` | Leaderboard、Dashboard 排名卡 | 积分更新、周期切换 | `period`, `score`, `rank`, `weekStart` | 当前已知 mock 热点 |
| 社区帖子 | `posts` | Community 列表、详情、Admin | 发帖、更新状态 | `title`, `content`, `subjectId`, `likeCount`, `isSolved` | 社区主对象 |
| 社区评论 | `comments` | Community 详情 | 评论、标记解决 | `postId`, `authorId`, `content`, `isSolution` | 互动对象 |
| 社区点赞 | `post_likes` | Community 详情、列表计数 | 点赞 / 取消点赞 | `userId`, `postId` | 需要唯一性约束支撑 |
| 联系提交 | `contact_submissions` | Public 联系页、后台支持流 | 提交联系表单 | `name`, `email`, `subject`, `message`, `status` | Public 写操作对象 |
| 订阅用户 | `subscribers` | 营销留资 | 订阅 | `email`, `subscribedAt` | 营销域对象 |
| 推荐关系 | `referrals` | Admin Growth、用户增长链路 | 绑定推荐、奖励发放、延期结算 | `status`, `rewardGranted`, `referrerId`, `refereeId` | 增长与奖励对象 |
| 券码 | `voucher_codes`, `voucher_redemptions` | Admin Vouchers、结算链路 | 发放券码、核销券码 | `code`, `isActive`, `validFrom`, `validTo`, `redeemedCount` | 结算/增长共享对象 |
| 内容源文件 | `source_files` | 内容导入、Admin | 上传源文件、导入处理 | `filename`, `fileUrl`, `status`, `ocrStatus`, `uploadedBy` | 内容导入入口对象 |
| 内容审核日志 | `content_review_logs` | 内容审核、Admin | 审核动作、驳回/通过 | `reviewerId`, `action`, `targetId` | 审核审计对象 |
| 题目报错 | `question_reports` | Practice 报错、Admin Reports | 提交报错、处理报错 | `questionId`, `status`, `reporterId` | 质控对象 |
| 管理备注与安全日志 | `admin_notes`, `security_logs`, `impersonation_sessions`, `user_permission_overrides` | Admin Users、Permissions | 写备注、权限覆盖、模拟登录 | 各自状态/时间/操作者字段 | 管理审计对象 |
| 通知 | `notifications`, `notification_preferences` | Dashboard 摘要、Settings | 发送通知、设置偏好 | `type`, `isRead`, 偏好字段 | 通知域对象 |
| 用户反馈 | `user_feedbacks` | Admin Feedback | 提交反馈、处理反馈 | `status`, `category`, `userId` | 反馈对象 |
| Stripe 订阅与支付 | Stripe、`users` 订阅字段、webhook | Pricing、Checkout、Admin | 发起 checkout、回调更新订阅 | `stripeCustomerId`, `stripeSubscriptionId`, `subscriptionStatus` | 外部服务 + 本地映射 |
| 博客内容 | `blog_posts` | Blog、Marketing | 发布/更新文章 | `slug`, `title`, `isPublished`, `publishedAt` | Public 内容对象 |

### 当前建议优先治理的业务对象
| 优先级 | 业务对象 | 原因 |
|---|---|---|
| P0 | 用户账户、学习进度、练习会话结果、逐题作答记录 | 直接决定 Dashboard / Courses / Practice 的真实性 |
| P0 | 每日任务、成就/XP/streak、排行榜条目 | 直接决定 Dashboard / Achievements / Leaderboard 的核心展示与奖励逻辑 |
| P0 | 社区帖子/评论、用户设置、反馈、联系提交 | 直接决定读写闭环是否真实可用 |
| P0 | Stripe 订阅映射、推荐关系、券码 | 直接决定支付和增长链路能否核账 |
| P1 in P0 task | 博客内容、营销订阅、非关键装饰模块 | 影响公开页完整性，但不应阻塞核心闭环 |

### 当前阶段结论
- 页面域边界已经可支撑 `T-002.3` 的“关键读写事件清单”继续展开。
- 业务对象边界已经可支撑 `T-002.4` 的“全链路映射总表”继续展开。
- 在进入任何页面开发前，仍需完成：
  - `T-002.3` 关键读写事件清单
  - `T-002.4` 全链路映射总表
  - `T-002.5` 字段级权威数据源矩阵
  - `T-002.6` schema 门禁与约束缺口清单

## T-002.3 关键读写事件清单

### 目标
- 识别全站真正会驱动数据变化或核心展示的主干事件。
- 为后续 `T-002.4` 全链路映射、`T-002.5` 字段权威来源、`T-002.6` schema 门禁提供事件入口。
- 只记录业务主干事件，不穷举所有辅助函数。

### 关键读事件清单
| 事件名 | 事件类型 | 触发方 | 主要入口 | 主要读取对象 | 主要来源 | 当前备注 |
|---|---|---|---|---|---|---|
| Dashboard 首屏加载 | 读 | 学生/家长/登录用户 | `/dashboard` | 用户统计、任务、最近进度、最近练习、排行榜衍生数据 | `users`, `daily_tasks`, `user_progress`, `exam_records`, `user_attempts`, `leaderboard_entries` | 当前仍存在部分挂空字段与假排名卡风险 |
| 课程中心加载 | 读 | 学生 | `/dashboard/courses` | 学科、章节、课时、用户进度、恢复学习入口 | `subjects`, `chapters`, `lessons`, `user_progress` | 需继续确认 mock 内容残留 |
| 课时详情加载 | 读 | 学生 | `/course/[subjectId]/[lessonId]` | 课时内容、视频地址、用户进度 | `lessons`, `user_progress`, 存储签名 URL | 读链路与进度写链路耦合 |
| 练习中心加载 | 读 | 学生 | `/dashboard/practice` | 学科卡片、章节图、统计、薄弱点、配额、推荐 | `subjects`, `chapters`, `questions`, `user_attempts`, `exam_records` | 当前 mock/preview 分支较多 |
| 练习题组获取 | 读 | 学生 | Smart Drill / Chapter Drill / Mock Arena / Past Paper | 题目列表、题目元数据、配额、推荐 | `questions`, `chapters`, `subjects`, `user_attempts` | 需确认真实题源覆盖程度 |
| 排行榜加载 | 读 | 学生 | `/dashboard/leaderboard` | 榜单列表、我的排名、周期信息 | `leaderboard_entries`, `users` | 当前首屏 mock 榜单已识别 |
| 社区列表/详情加载 | 读 | 学生 | `/dashboard/community*` | 帖子、评论、点赞计数、作者信息、科目信息 | `posts`, `comments`, `post_likes`, `users`, `subjects` | 读链路基本存在，需核对写后可见性 |
| 成就页加载 | 读 | 学生 | `/dashboard/achievements` | XP、等级、streak、任务、徽章 | `users`, `daily_tasks`, `user_badges`, `badges` | 需统一规则口径 |
| 设置页加载 | 读 | 学生/家长 | `/dashboard/settings*` | 用户资料、用户设置、通知偏好 | `users`, `user_settings`, `notification_preferences` | 有新旧设置迁移逻辑 |
| Admin 首页加载 | 读 | 管理员 | `/admin` | 管理统计、待办、风险、快捷动作 | 管理聚合表与多个业务表 | 需排查假统计与 mock 数据 |
| Admin 用户/反馈/内容页加载 | 读 | 管理员 | `/admin/users*`, `/admin/feedback*`, `/admin/content*` | 列表、详情、审计、审核、反馈、导入状态 | `users`, `user_feedbacks`, `questions`, `question_reports`, `source_files`, `content_review_logs` 等 | 多页面共享读聚合 |
| Public 内容页加载 | 读 | 游客/登录用户 | `/`, `/pricing`, `/blog*`, `/help`, `/subjects` 等 | 官网内容、博客、CTA、统计、配置 | `blog_posts`, 静态配置, 结算配置 | 需明确哪些可视为正式内容源 |

### 关键写事件清单
| 事件名 | 事件类型 | 触发方 | 主要入口 | 写入对象 | 写入位置 | 变更字段 | 是否允许重复触发 | 当前风险/备注 |
|---|---|---|---|---|---|---|---|---|
| 用户注册 | 写 | 游客 | `/register` | 用户账户、用户设置、欢迎通知 | `users`, `user_settings`, `notifications` | 账号基础字段、推荐码、默认订阅状态、默认设置 | 否 | 依赖 Supabase Auth + 本地 upsert，需核对幂等与触发顺序 |
| 登录后用户同步 | 写 | 已登录用户 | 登录后兜底修复 | 用户账户 | `users` | 缺失用户记录补建/补齐 | 应允许 | 属于补偿型写入，必须与读接口隔离 |
| 更新个人资料 | 写 | 已登录用户 | `/dashboard/settings` | 用户账户 | `users` | `username`, `grade`, `avatar` | 应允许 | 需核对唯一约束与失败回滚 |
| 更新用户偏好 | 写 | 已登录用户 | `/dashboard/settings` | 用户设置 | `user_settings` | `language`, `theme`, AI/学习偏好等 | 应允许 | 与通知偏好存在新旧字段交叉 |
| 更新通知偏好 | 写 | 已登录用户 | `/dashboard/settings/notifications` | 通知偏好 | `notification_preferences` | 站内/邮件通知开关 | 应允许 | 首次读取时会迁移旧设置并创建新记录 |
| 完成 onboarding 任务 | 写 | 已登录用户 | Dashboard onboarding 对话框 | 每日任务 | `daily_tasks` | `currentCount -> targetCount` | 理论上应安全重复 | 当前通过 `findFirst + update`，需校验重复点击与重复完成 |
| 领取任务奖励 | 写 | 已登录用户 | Dashboard / Achievements | 每日任务、用户账户 | `daily_tasks`, `users` | `isClaimed`, `xp` | 否 | 必须严格幂等，当前逻辑需防重复领取 |
| 创建当日任务 | 写 | 系统/服务端逻辑 | Dashboard 或其他业务触发点 | 每日任务 | `daily_tasks` | 新增今日任务记录 | 应允许但只生效一次 | 当前缺少强唯一约束风险高 |
| 推进 streak | 写 | 系统/业务动作 | 练习提交、课程完成等 | 用户账户 | `users` | `streak`, `lastStudyDate` | 同一有效事件重复时不应重复副作用 | 当前需防止被页面加载触发 |
| 保存课程进度 | 写 | 学生 | 课时详情页 | 学习进度、任务、streak、学习时长 | `user_progress`, `daily_tasks`, `users` | `progress`, `isCompleted`, `lastPosition`, 任务进度, `streak`, `totalStudyTime` | 应允许 | 需核对重复上报、完成阈值、一次性奖励 |
| 开始模拟考试 | 写 | 学生 | Mock Arena | 练习会话结果 | `exam_records` | 创建进行中的考试记录 | 同一配置重复发起时应可识别 | 当前依赖 `duration=null` 表示进行中 |
| 提交模拟考试 | 写 | 学生 | Mock Arena 作答页 | 练习会话结果、逐题记录、学习时长 | `exam_records`, `user_attempts`, `users` | `score`, `correctCount`, `duration`, 逐题作答, `totalStudyTime` | 否 | 当前通过 `duration != null` 防重复提交，但仍需核账 |
| 提交章节训练/练习会话 | 写 | 学生 | Chapter Drill / Smart Drill 等 | 练习会话结果、逐题记录、排行榜、任务、streak、徽章、学习时长 | `exam_records`, `user_attempts`, `leaderboard_entries`, `daily_tasks`, `users`, `user_badges` | 分数、逐题结果、积分、任务进度、XP/徽章相关副作用 | 否 | 共享写链路多，需统一幂等与结果回放 |
| 更新错题掌握度 | 写 | 学生 | Error Wiper / 错题相关 | 错题/掌握度相关对象 | 错题相关表与衍生聚合 | 掌握度、修复进度 | 应允许 | 需进一步在 `T-002.4` 对齐具体表与聚合归属 |
| 绑定推荐码 | 写 | 已登录用户 | 定价/升级前 | 推荐关系 | `referrals` | 新建 referral 绑定记录 | 否 | 当前依赖 `unique(refereeId)`，可作为幂等基础 |
| 发起 checkout | 写 | 已登录用户 | `/pricing` / checkout | Stripe 会话、用户 Stripe 映射 | Stripe、`users` | `stripeCustomerId`、checkout session 元数据 | 应允许创建新会话 | 需区分“创建会话”与“支付成功” |
| Stripe 支付回调 | 写 | Stripe webhook | `/api/webhook/stripe` | 用户订阅、通知、推荐奖励、券码核销 | Stripe + `users`, `notifications`, `referrals`, `voucher_redemptions`, `voucher_codes` | 订阅状态、有效期、奖励、通知、券码核销 | 必须允许重放但不重复副作用 | 这是最高优先级幂等链路之一 |
| 取消订阅 | 写 | 已登录用户 | Billing 设置入口 | 用户订阅映射 | Stripe、`users` | `cancelAtPeriodEnd`, 订阅状态、到期时间 | 应允许 | 需与 webhook 状态同步核对 |
| 生成学生邀请码 | 写 | 学生 | 家长绑定流程 | 邀请码 | `invite_codes` | `code`, `expiresAt` | 应允许多次，但旧码策略需明确 | 当前可能重复生成多个有效码 |
| 家长绑定学生 | 写 | 家长 | 邀请码绑定流程 | 家长关系、邀请码 | `parent_students`, `invite_codes` | 建立关系、邀请码 `used=true` | 否 | 需核对重复绑定与唯一键反馈 |
| 创建帖子 | 写 | 已登录用户 | `/dashboard/community/new` | 社区帖子、徽章副作用 | `posts`, 可能触发 `user_badges` | 帖子内容、分类、关联科目 | 应允许 | 需补输入校验、成功后立即可见验证 |
| 创建评论 | 写 | 已登录用户 | 帖子详情 | 评论、通知 | `comments`, `notifications` | 评论内容、回复通知 | 应允许 | 回复通知需服从偏好开关 |
| 点赞/取消点赞 | 写 | 已登录用户 | 帖子详情/列表 | 点赞关系、帖子计数 | `post_likes`, `posts` | 点赞关系、`likeCount` | 应允许 | 需要保证计数与关系一致 |
| 提交用户反馈 | 写 | 游客/已登录用户 | 支持入口/设置页 | 用户反馈 | `user_feedbacks` | 分类、标题、内容、附件、邮箱 | 应允许 | 支持匿名，需核对前端入口和回显 |
| 管理员回复反馈 | 写 | 管理员 | `/admin/feedback/[id]` | 用户反馈、通知、邮件 | `user_feedbacks`, `notifications`, 外发邮件 | `status`, `adminReply`, `repliedAt`, `repliedBy` | 应允许更新，但重复回复规则需明确 | 涉及站内通知和邮件副作用 |
| 创建站内通知 | 写 | 系统/业务动作 | 各种触发器 | 通知 | `notifications` | `type`, `title`, `content`, `link`, `metadata` | 应允许 | 需服从通知偏好，BILLING 例外 |
| 标记通知已读 | 写 | 已登录用户 | 通知列表 | 通知 | `notifications` | `isRead`, `readAt` | 应允许 | 批量已读与单条已读都应幂等 |
| 创建 Voucher | 写 | 管理员 | `/admin/vouchers` | 券码 | `voucher_codes` | code、折扣、有效期、启停状态 | 否 | 依赖唯一 code |
| 启停 Voucher | 写 | 管理员 | `/admin/vouchers` | 券码 | `voucher_codes` | `isActive` | 应允许 | 需核对与 pricing 可见性一致 |
| 管理员封禁/解封用户 | 写 | 管理员 | `/admin/users/[id]` | 用户状态、安全日志 | `users`, `security_logs` | `status`, 审计日志 | 应允许状态切换 | 审计与状态必须原子 |
| 管理员备注/删改备注 | 写 | 管理员 | `/admin/users/[id]` | 管理备注、安全日志 | `admin_notes`, `security_logs` | 备注内容、软删除、恢复、置顶 | 应允许 | 删除/恢复/置顶需保留审计轨迹 |
| 管理员伪装登录 | 写 | 管理员 | `/admin/users/[id]` | 伪装会话、安全日志 | `impersonation_sessions`, `security_logs` | 会话 token、开始/结束时间、原因 | 应允许创建新会话 | 安全风险高，需额外审计 |
| 管理员应用权限覆写 | 写 | 管理员 | `/admin/permissions` | 权限覆写、安全日志 | `user_permission_overrides`, `security_logs` | 覆写字段、新旧值、原因、过期时间 | 应允许 | 需核对与权限引擎口径一致 |
| 上传源文件并创建导入任务 | 写 | 管理员/内容运营 | `/admin/content/import` | 内容源文件、存储文件 | `source_files` + 存储服务 | 文件信息、处理状态、上传者 | 应允许 | 需核对文件写入与 DB 任务的一致性 |
| 导入题目 | 写 | 管理员/系统 | 内容导入流程 | 题目、源文件、审核日志 | `questions`, `source_files`, `content_review_logs` | 题目内容、状态、来源、处理状态 | 应允许批量 | 需核对重复导入、内容去重和失败恢复 |
| 审核题目通过/驳回/更新 | 写 | 管理员/审核员 | `/admin/content/review/[questionId]` | 题目、审核日志 | `questions`, `content_review_logs` | `status`, 审核意见、审核人、发布时间 | 应允许状态流转但需校验合法迁移 | 状态机必须固定 |
| 提交题目报错 | 写 | 已登录用户 | Practice / Question 详情 | 题目报错、题目报错计数 | `question_reports`, `questions` | 报错内容、`reportCount` | 应允许多用户提交 | 需核对单用户重复报错策略 |
| 处理题目报错 | 写 | 管理员 | `/admin/content/reports` | 题目报错、题目报错计数 | `question_reports`, `questions` | `status`, `reviewedAt`, `reviewedBy`, `resolution`, `reportCount` | 应允许批处理 | 需要防重复处理与计数错减 |

### 当前阶段结论
- `T-002.3` 已明确全站核心读事件与写事件的主干入口。
- 当前幂等风险最高的写事件为：
  - 创建当日任务
  - 领取任务奖励
  - 提交练习/考试
  - Stripe webhook
  - 点赞/取消点赞计数
  - 题目报错计数与处理
- 进入 `T-002.4` 时，应优先为以下事件建立全链路映射：
  - Dashboard 首屏加载
  - 保存课程进度
  - 提交练习/考试
  - 领取任务奖励
  - 排行榜读取与积分更新
  - 社区发帖/评论/点赞
  - 发起 checkout + Stripe webhook
  - 管理员回复反馈

## T-002.4 route -> page -> component -> action/api -> table/service 全链路映射总表（主干版）

> 说明：本节先建立主干映射，不追求字段级完整。字段级下钻放到 `T-002.5`。  
> 状态说明：`已串主链路` 表示已能明确主读取/主写入方向；`待补细` 表示还需要在下一阶段补字段或约束级细节。

| 页面域 | 路由/入口 | Page 入口 | 主要组件/Client Wrapper | 主读取入口 | 主写入入口 | 主要表/服务 | 当前状态 | 备注 |
|---|---|---|---|---|---|---|---|---|
| Dashboard | `/dashboard` | `src/app/(dashboard)/dashboard/page.tsx` | `DashboardClient`, `DashboardHome`, `DailyMissions` | `getDashboardProfile`, `getDashboardStats` | `syncCurrentUserToDatabase`, `claimTaskReward`, `completeOnboardingTask` | `users`, `user_settings`, `daily_tasks`, `user_progress`, `exam_records`, `user_attempts` | 已串主链路 | 首页读链路已明确，存在读接口带写副作用风险 |
| Courses | `/dashboard/courses` | `src/app/(dashboard)/dashboard/courses/page.tsx` | `CoursesClientWrapper`, `CoursesView` | `getDashboardShellProfile`, `getAllSubjects` / `getSubjectDetails` / `getLessonData` | `updateUserLessonProgress` | `subjects`, `chapters`, `lessons`, `user_progress`, 存储签名 URL | 已串主链路 | `/course/[subjectId]`、`/course/[subjectId]/[lessonId]` 当前为 `notFound()`，需在后续任务确认真实路由承载位置 |
| Practice Home | `/dashboard/practice` | `src/app/(dashboard)/dashboard/practice/page.tsx` | `PracticeClientWrapper`, `PracticeCenterScreen` | `getPracticeBootstrapData`, `getPracticeSubjectData`, `getSubjectChapters`, `getKnowledgeHiveData`, `getExamForecastData` | 各模式内写入口 | `subjects`, `chapters`, `questions`, `user_attempts`, `exam_records` | 已串主链路 | 练习中心是多模式分发页 |
| Smart Drill | `/dashboard/practice/smart-drill` | `src/app/(dashboard)/dashboard/practice/smart-drill/page.tsx` | `SmartDrillMode` | `getSmartDrillQuestions` | `submitPracticeSession` 或模式内统一提交流 | `questions`, `exam_records`, `user_attempts` | 待补细 | 当前存在 preview/mock 分支 |
| Chapter Drill | `/dashboard/practice/chapter-drill/[chapterId]` | `src/app/(dashboard)/dashboard/practice/chapter-drill/[chapterId]/page.tsx` | 章节训练页组件 | `getChapterWithStats`, `getRandomQuestions` | `submitQuiz` -> `submitPracticeSession` | `chapters`, `questions`, `exam_records`, `user_attempts`, `leaderboard_entries`, `daily_tasks`, `users` | 已串主链路 | 共享 streak / leaderboard / task / studyTime 副作用 |
| Mock Arena | `/dashboard/practice/mock-arena`、`/dashboard/practice/mock-arena/[examId]` | 对应 page.tsx | `MockArenaSelector`, `MockArenaExam` | `generateMockExam`, `startExam`, `getExamResult` | `startExam`, `submitExam` | `questions`, `exam_records`, `user_attempts`, `users` | 已串主链路 | `exam_records.duration = null` 表示进行中，需重点核账 |
| Error Wiper | `/dashboard/practice/error-wiper` | 对应 page.tsx | `ErrorWiperMode` | `getErrorBookQuestions`, `getErrorWiperSession` | `updateErrorBookMastery`, `updateErrorWiperProgress`, `removeErrorBookEntry` | 错题相关表/聚合、`user_attempts`, `daily_tasks` | 待补细 | 需在下一步明确底层权威表与掌握度口径 |
| Past Paper | `/dashboard/practice/past-paper/[paperId]` | 对应 page.tsx | Past Paper 模式组件 | `getPastPapersBySubject` 等 | 统一练习提交链路 | `questions`, `exam_records`, `user_attempts` | 待补细 | 需继续确认 paper 维度来源 |
| Community 列表 | `/dashboard/community` | `src/app/(dashboard)/dashboard/community/page.tsx` | `CommunityClientWrapper`, `CommunityView` | `getCategories`, `getPosts` | `createPost`, `toggleLike` | `posts`, `comments`, `post_likes`, `subjects`, `notifications` | 已串主链路 | 列表加载已接真实读链路 |
| Community 发帖/详情 | `/dashboard/community/new`, `/dashboard/community/[postId]` | 对应 page.tsx | 发帖页、详情页组件 | `getPostById` | `createPost`, `createComment`, `toggleLike` | `posts`, `comments`, `post_likes`, `notifications` | 已串主链路 | 评论回复会触发站内通知 |
| Leaderboard | `/dashboard/leaderboard` | `src/app/(dashboard)/dashboard/leaderboard/page.tsx` | `LeaderboardClientWrapper`, `LeaderboardView` | `getLeaderboard`, `getUserRank`, `getAchievementOverview`, `listUserBadges`, `/api/leaderboard/summary` | `updateLeaderboardScore` | `leaderboard_entries`, `users`, `user_badges`, `badges` | 已串主链路 | 页面当前仍直接拼 mock 榜单，需要后续替换 |
| Achievements | `/dashboard/achievements` | `src/app/(dashboard)/dashboard/achievements/page.tsx` | `AchievementsClientWrapper`, `AchievementsView` | `getAchievementOverview`, `listUserBadges`, `getTodayTasks` | `claimTaskReward`, `claimTaskRewards`, `awardBadgeIfEligible`, `completeOnboardingTask` | `users`, `daily_tasks`, `badges`, `user_badges` | 已串主链路 | 与 Dashboard 共用任务与奖励逻辑 |
| Settings | `/dashboard/settings` | `src/app/(dashboard)/dashboard/settings/page.tsx` | `SettingsClientWrapper` 及设置表单组件 | `getDashboardProfile`, `getUserSettings`, `getNotificationPreferences` | `updateProfile`, `updateGoals`, `updateAIConfig`, `updatePreferences`, `updateNotificationPreferences` | `users`, `user_settings`, `notification_preferences` | 已串主链路 | 新旧设置字段存在迁移逻辑 |
| Admin Dashboard | `/admin` | `src/app/(dashboard)/admin/page.tsx` | `AdminClientWrapper`, `AdminDashboardV2` | `getProfile`, `getAdminDashboardOverview` | 无集中写入口，跳转到各管理域执行 | 多业务表聚合 | 已串主链路 | 需排查聚合里是否仍有假数据 |
| Admin Permissions | `/admin/permissions` | page + 客户端组件 | 权限管理组件 | `searchUsersForOverride`, `getOverrideHistory`, 权限概览接口 | `applyAdminOverride` | `user_permission_overrides`, `users`, `security_logs` | 已串主链路 | 权限覆写属于共享高风险写链路 |
| Admin Users | `/admin/users`, `/admin/users/[id]` | 对应 page.tsx | `UserTable`, 用户详情组件 | `listAdminUsers`, `getAdminUserOverview`, `getUserDetail`, `getUserActivityData`, `getUserAuditLogs`, `getUserReferralData` | `toggleUserStatus`, `addAdminNote`, `softDeleteAdminNote`, `restoreAdminNote`, `toggleNotePin`, `impersonateUser` | `users`, `admin_notes`, `security_logs`, `impersonation_sessions`, `referrals`, `user_attempts`, `user_progress` | 已串主链路 | 读写链路完整，但需补字段核账 |
| Admin Feedback | `/admin/feedback`, `/admin/feedback/[id]` | 对应 page.tsx | `FeedbackList`, 反馈详情组件 | `getFeedbackList`, `getFeedbackOverview`, `getFeedbackDetail` | `replyToFeedback` | `user_feedbacks`, `notifications`, 外发邮件 | 已串主链路 | 详情页权限与回复副作用需核账 |
| Admin Growth | `/admin/referrals`, `/admin/vouchers` | 对应 page.tsx | 推荐/券码组件 | 推荐列表读取、券码列表读取 | `createVoucherCodeAction`, `toggleVoucherStatusAction` | `referrals`, `voucher_codes`, `voucher_redemptions`, `users` | 已串主链路 | `/admin/vouchers` 当前直接重定向到 `/admin/referrals?tab=vouchers` |
| Admin Content Import | `/admin/content`, `/admin/content/import` | 对应 page.tsx | 内容入口、导入组件 | `getImportTasks`, `getImportDashboardStats`, `getImportTaskDetail` | `uploadSourceFile`, `importFromPDF`, `importFromWebUrl`, `resumeFailedImport`, `deleteImportTask` | `source_files`, `questions`, 存储服务 | 已串主链路 | 需后续核对文件存储与 DB 任务一致性 |
| Admin Content Review | `/admin/content/review`, `/admin/content/review/[questionId]` | 对应 page.tsx | 审核列表、审核详情组件 | `getPendingReviewQuestions`, `getQuestionById`, `getQuestionForReview` | `updateQuestion`, `approveQuestion`, `rejectQuestion`, `updateQuestionStatus` | `questions`, `content_review_logs` | 已串主链路 | 审核状态机需在后续任务固定 |
| Admin Content QA | `/admin/content/reports`, `/admin/content/statistics` | 对应 page.tsx | 报错列表、统计组件 | `getQuestionReports`, `getContentStats` | `resolveReport`, `bulkResolveReports`, `reportQuestion` | `question_reports`, `questions`, `content_review_logs` | 已串主链路 | 报错计数增减需重点核账 |
| Auth Login | `/login` | `src/app/(auth)/login/page.tsx` | `LoginForm` | 无复杂读取 | `loginAction` | Supabase Auth | 已串主链路 | 登录主要依赖 Supabase，会话后续影响所有受保护页 |
| Auth Register | `/register` | `src/app/(auth)/register/page.tsx` | `RegisterForm` | 无复杂读取 | `signupAction` | Supabase Auth, `users`, `user_settings`, `notifications` | 已串主链路 | 注册链路直接初始化本地用户与设置 |
| Pricing / Checkout | `/pricing`, `/checkout/config` | 对应 page.tsx | 定价页组件、checkout 配置组件 | 方案与配置读取 | `prepareCheckoutAction`, `createCheckoutSession`, `cancelSubscriptionAction`, Stripe webhook | Stripe, `users`, `referrals`, `voucher_codes`, `voucher_redemptions`, `notifications` | 已串主链路 | 支付成功真实落库依赖 webhook，不是客户端跳转成功 |
| Contact | `/contact` | `src/app/(marketing)/contact/page.tsx` | `ContactPage` 表单 | 纯静态展示 | 预期应接 `submitFeedback` 或 `ContactSubmission` 写链路 | `contact_submissions` 或 `user_feedbacks` | 待补细 | 当前表单仍未接正式提交逻辑 |
| Blog / Help / Marketing Content | `/blog*`, `/help`, `/subjects`, `/study-guides` 等 | 对应 page.tsx | 营销页与博客组件 | `getBlogPosts`, `getBlogPostBySlug`，其余多为静态内容 | 少量 CTA 跳转，无统一写链路 | `blog_posts` + 静态内容 | 待补细 | 需区分正式内容源与纯静态页 |

### 当前阶段结论
- `T-002.4` 主干版已能支撑进入 `T-002.5` 的字段级权威数据源矩阵。
- 当前最需要优先补细的全链路映射缺口：
  - `/course/[subjectId]`、`/course/[subjectId]/[lessonId]` 真实承载路径与页面责任
  - Error Wiper / Past Paper 的底层权威表与写链路归属
  - Contact 页正式写入口
  - Admin 各域是否存在共享聚合里的 mock / 假统计
- 进入 `T-002.5` 时应先围绕以下页面域落字段：
  - Dashboard
  - Courses
  - Practice
  - Leaderboard
  - Settings
  - Admin Feedback / Billing

## T-002.5 字段级权威数据源矩阵（关键字段第一版）

> 说明：本节先覆盖“关键展示字段”和“关键写后回显字段”。  
> 长尾字段、纯视觉字段、实验字段不在这一版穷举。  
> 进入页面开发前，页面域至少要能覆盖这里对应的关键字段。

### Dashboard
| 字段 | 页面/模块 | 权威来源 | 复算路径 | 空态规则 | 当前备注 |
|---|---|---|---|---|---|
| `studyTimeSeconds` | Dashboard 顶部统计 / 周期卡 | `users.total_study_time` 为总量；窗口内以 `exam_records.duration` + 课程完成计时事件复算 | 总量读 `users`；窗口值按有效学习事件聚合 | 无数据返回 `0` | 当前实现仍返回格式化字符串，且窗口口径未完全统一 |
| `questionsCount` | Dashboard 顶部统计 / 周期卡 | `user_attempts` | 按用户、时间窗口计数 | 无数据返回 `0` | 权威明细源明确 |
| `accuracy` | Dashboard 顶部统计 / 周期卡 | `user_attempts` | `correct / total * 100` | 无数据返回 `0` | 不应由 `exam_records.score` 反推 |
| `mistakesCount` | Dashboard 顶部统计 | `user_attempts` | `is_correct = false` 计数 | 无数据返回 `0` | 明确不是去重错题数 |
| `streakDays` | Dashboard 顶部统计 | `users.streak` | 由有效学习事件推进，不由页面读取推进 | 无数据返回 `0` | 需在后续核对触发时机 |
| `xp` | Dashboard 顶部统计 | `users.xp` | 直接读取 | 无数据返回 `0` | 权威源为用户总 XP |
| `level` | Dashboard 顶部统计 | `users.xp` | `calculateLevel(xp)` | 无数据返回等级 1 | 不能单独落库为独立权威值 |
| `nextLevelXp` | Dashboard 顶部统计 | `users.xp` | `calculateNextLevelXp(level)` | 返回当前等级的下一级阈值 | 派生字段 |
| `recentActivity[].progress` | Dashboard 学习路径 | `user_progress.progress` | 直接读取最近更新的课时进度 | 无数据时整块空态 | 权威源明确 |
| `recentActivity[].title` | Dashboard 学习路径 | `lessons.title` | 通过 `user_progress.lesson_id` 关联 | 无数据时整块空态 | 来自课程表 |
| `recentPractice[].score` | Dashboard 最近练习 | `exam_records.score` | 直接读取最近记录 | 无数据时整块空态 | 权威汇总源 |
| `recentPractice[].correctCount` / `totalQuestions` | Dashboard 最近练习 | `exam_records.correct_count`, `exam_records.total_questions` | 直接读取 | 无数据时整块空态 | 权威汇总源 |
| `subjectStrengths[].accuracy` | Dashboard 学科进度 | `user_attempts` + `questions.subject_id` | 按学科聚合正确率 | 无数据时空态，不造科目卡 | 当前实现挂空 |
| `weaknesses[]` | Dashboard 薄弱点 | `user_attempts` + `questions.chapter_id` / Practice 聚合 | 按章节/知识点聚合掌握度后排序 | 无数据时空态 | 当前实现挂空 |
| `dailyTasks[]` | Dashboard 今日任务 | `daily_tasks` | 直接读取当日任务 | 无数据时空态，不自动假造 | 创建逻辑另属写事件 |
| `rank` / `percentile` | Dashboard 排名卡 | `leaderboard_entries` | 排名读 `getUserRank`，百分位由排名与榜单人数复算 | 未上榜返回 `null` + 空态文案 | 当前页面硬编码，必须替换 |

### Courses
| 字段 | 页面/模块 | 权威来源 | 复算路径 | 空态规则 | 当前备注 |
|---|---|---|---|---|---|
| `subjects[]` | 课程中心科目列表 | `subjects` | 直接读取排序字段 `order` | 无数据返回空列表 | `getAllSubjects` 当前会确保核心科目存在 |
| `chapters[]` | 课程详情章节树 | `chapters` | 按 `subject_id` + `order` 读取并组树 | 无数据返回空树 | 需确认未来真实路由 |
| `lessons[]` | 课程详情课时列表 | `lessons` | 按 `chapter_id` + `order` 读取 | 无数据返回空列表 | 权威课程内容源 |
| `progress` | 课程详情/课时页 | `user_progress.progress` | 直接读取用户-课时唯一记录 | 无数据返回 `0` | 权威进度源 |
| `isCompleted` | 课程详情/课时页 | `user_progress.is_completed` | 直接读取 | 无数据返回 `false` | 完成阈值由写链路定义 |
| `lastPosition` | 课时页播放器恢复 | `user_progress.last_position` | 直接读取 | 无数据返回 `null` | 恢复学习关键字段 |
| `videoUrl` | 课时页播放器 | 存储服务签名 URL + `lessons.video_url` | 基于 lesson 的原始路径签名 | 无 URL 则禁用视频播放 | 来自存储服务，不是业务聚合 |
| `resumeLessonId` | 课程中心恢复学习入口 | `user_progress.updated_at` 最近记录 | 最近更新的未完成课时 | 无记录时空态 | 需在后续页级验证中固定排序规则 |

### Practice
| 字段 | 页面/模块 | 权威来源 | 复算路径 | 空态规则 | 当前备注 |
|---|---|---|---|---|---|
| `question.content/options/answer` | 各练习模式 | `questions` | 直接读取发布题目 | 无题可拉时空态/禁用态 | 正式展示不得用 mock 题组兜底 |
| `score` | 结果页 / 记录页 | `exam_records.score` | 提交时写入 | 无记录不展示结果卡 | 权威结果源 |
| `correctCount` / `totalQuestions` | 结果页 / 记录页 | `exam_records` | 提交时写入 | 无记录不展示 | 权威结果源 |
| `durationSeconds` | 结果页 / Dashboard 回顾 | `exam_records.duration` 或 `user_attempts.duration` | 会话级读 `exam_records`，逐题级读 `user_attempts` | 无数据返回 `null` | 不在服务端格式化为分钟 |
| `results[questionId]` | 作答结果明细 | `user_attempts.is_correct` | 提交后逐题回放 | 无数据时不展示回放 | 逐题权威明细源 |
| `masteryLevel` | Practice 统计 / Dashboard 薄弱点 | `user_attempts` | 按章节或知识点聚合正确率 | 无样本返回 `0` | 当前部分页面存在不同口径，需统一 |
| `weaknesses[]` | Practice 边栏 / Dashboard | `user_attempts` + `questions.chapter_id` | 至少样本数阈值后按掌握度排序 | 无数据空态 | 当前已有聚合可复用 |
| `quota.canProceed` | Mock Arena / Practice 模式入口 | `user_attempts`, `exam_records`, 订阅权限 | 根据 tier + 时间窗口 + 使用量判断 | 无权限/超限时禁用态 | 权威源是权限规则 + 明细表 |
| `pastPapers[]` | Past Paper 入口 | `questions.is_past_paper`, `paper_id`, `subject_id` | 按科目/卷别聚合 | 无卷则空态 | 需后续确认列表口径 |

### Leaderboard
| 字段 | 页面/模块 | 权威来源 | 复算路径 | 空态规则 | 当前备注 |
|---|---|---|---|---|---|
| `entries[].score` | 排行榜列表 | `leaderboard_entries.score` | 直接读取周期内分数 | 无榜单返回空列表 | 权威榜单分数字段 |
| `entries[].rank` | 排行榜列表 | `leaderboard_entries` | 按周期内分数排序后计算 1-based 排名 | 无榜单返回空列表 | 当前 adapter 运行时计算 rank |
| `entries[].user.username/avatar` | 排行榜列表 | `users` | 通过 `user_id` 关联 | 用户信息缺失时兜底匿名展示 | 关联用户表 |
| `myRank.rank` | 我的排名卡 | `leaderboard_entries` | `count(score > myScore) + 1` | 未上榜返回 `null` | 权威读法已存在 |
| `period` | 周/月/总榜切换 | UI 参数 + `leaderboard_entries.period` | 查询参数驱动不同周期查询 | 非法值回退默认周期 | 周期本身不是数据库展示字段 |
| `percentile` | 排名衍生说明 | `leaderboard_entries` | 由我的名次 / 榜单人数复算 | 未上榜不展示 | 当前页面为硬编码假值 |

### Community
| 字段 | 页面/模块 | 权威来源 | 复算路径 | 空态规则 | 当前备注 |
|---|---|---|---|---|---|
| `posts[].title/content/category/tags` | 社区列表/详情 | `posts` | 直接读取 | 无帖子空态 | 权威帖子源 |
| `posts[].author` | 社区列表/详情 | `users` | 通过 `author_id` 关联 | 作者缺失时匿名兜底 | 读链路已存在 |
| `posts[].commentCount` | 社区列表 | `comments` | 通过 `_count.comments` 或聚合计数 | 无评论返回 `0` | 不应由前端本地推断 |
| `posts[].likeCount` | 社区列表/详情 | `posts.like_count` 为展示冗余源，`post_likes` 为关系权威源 | 读展示值来自 `posts.like_count`，并需能用 `post_likes` 复算校验 | 无点赞返回 `0` | 后续需核账冗余计数一致性 |
| `userLiked` | 帖子详情 | `post_likes` | 以当前用户与帖子关系判断 | 未登录返回 `false` / 禁用交互 | 权威关系源 |
| `comments[]` | 帖子详情 | `comments` | 按 `created_at asc` 读取 | 无评论空态 | 权威评论源 |

### Achievements / Gamification
| 字段 | 页面/模块 | 权威来源 | 复算路径 | 空态规则 | 当前备注 |
|---|---|---|---|---|---|
| `xp` | 成就页 / Dashboard | `users.xp` | 直接读取 | 无数据返回 `0` | 权威总量 |
| `level` | 成就页 / Dashboard | `users.xp` | `calculateLevel(xp)` | 默认等级 1 | 派生字段 |
| `nextLevelXp` | 成就页 / Dashboard | `users.xp` | `calculateNextLevelXp(level)` | 返回等级阈值 | 派生字段 |
| `streakDays` | 成就页 / Dashboard | `users.streak` | 有效学习事件推进 | 无数据返回 `0` | 需与 Dashboard 口径一致 |
| `questions` / `correctAnswers` / `accuracy` | 成就页概览 | `user_attempts` | 直接计数与正确率复算 | 无数据返回 `0` | `accuracy` 不应从 `exam_records.score` 反推 |
| `hours` / `studyTimeSeconds` | 成就页概览 | `users.total_study_time` | 直接读取原始秒数，UI 格式化 | 无数据返回 `0` | 当前 action 仍返回格式化小时字符串 |
| `badges[]` | 成就页徽章列表 | `badges`, `user_badges` | 先取全部徽章，再关联用户解锁状态 | 无徽章返回空列表 | 权威关系明确 |
| `dailyTasks[]` | 成就页任务区 | `daily_tasks` | 读取当日任务 | 无任务空态 | 与 Dashboard 共用 |

### Settings / Notifications
| 字段 | 页面/模块 | 权威来源 | 复算路径 | 空态规则 | 当前备注 |
|---|---|---|---|---|---|
| `username`, `grade`, `avatar` | 设置页资料表单 | `users` | 直接读取 | 无值允许空表单 | 用户主档字段 |
| `language`, `theme` | 设置页偏好 | `user_settings` | 直接读取 | 无记录时按默认值回填 | 与注册默认设置相关 |
| `aiPersonality`, `difficultyCalibration`, `curriculumSystem` | 设置页学习偏好 | `user_settings` | 直接读取 | 无记录按默认值回填 | 需后续确认表单完整覆盖 |
| `studyReminderTime` | 设置页目标/提醒 | `user_settings.study_reminder_time` | 直接读取 | 无值为空 | 与 goals dialog 有联动 |
| `notificationDaily`, `notificationWeekly`, `emailMarketing`, `emailActivity` | 旧设置兼容字段 | `user_settings` | 直接读取 | 缺失回默认值 | 与新通知偏好存在迁移关系 |
| `inAppSystem`, `inAppSocial`, `inAppStudy`, `inAppAchievement`, `emailSystem`, `emailSocial`, `emailWeekly`, `emailMarketing`, `emailBilling` | 通知设置页 | `notification_preferences` | 直接读取；无记录时可由 `user_settings` 初始化迁移 | 无记录时先迁移/创建再展示 | 新通知偏好权威源 |

### Admin / Feedback / Billing / Growth
| 字段 | 页面/模块 | 权威来源 | 复算路径 | 空态规则 | 当前备注 |
|---|---|---|---|---|---|
| `activeUsers` | Admin Dashboard KPI | `users.last_sign_in_at` | 按时间窗口计数 | 无数据返回 `0` | 当前聚合逻辑已存在 |
| `paidUsers` | Admin Dashboard KPI | `users.subscription_tier` | 按付费 tier 过滤 | 无数据返回 `0` | 不是 Stripe 订单数 |
| `completionRate` | Admin Dashboard KPI | `user_progress` | 已完成 / 总进度样本复算 | 无数据返回 `0` | 需在后续核对公式是否满足业务 |
| `openTickets` | Admin Dashboard KPI | `user_feedbacks`, `question_reports` | 按未关闭状态汇总 | 无数据返回 `0` | 工单概念是反馈 + 报错混合聚合 |
| `feedback.status`, `adminReply`, `repliedAt`, `repliedBy` | Admin Feedback | `user_feedbacks` | 直接读取 | 无回复时字段为空 | 权威反馈状态源 |
| `feedbackOverview.metrics[]` | Admin Feedback 概览 | `user_feedbacks` | 按窗口与状态聚合计数 | 无数据返回 `0` | 聚合逻辑已存在 |
| `subscriptionTier`, `subscriptionStatus`, `subscriptionEnd` | Pricing / Admin / User 状态 | `users` + Stripe webhook 同步结果 | 本地以 `users` 为展示权威，Stripe 为上游权威事件源 | 无记录按 Starter/未订阅展示 | 支付成功不能只看前端跳转 |
| `checkoutUrl` | Pricing 支付跳转 | Stripe session | `prepareCheckoutAction` -> `createCheckoutSession` | 创建失败时明确错误 | 瞬时字段，不落本地业务表 |
| `referral.status`, `rewardGranted` | Admin Growth / 升级链路 | `referrals` | 直接读取 | 无绑定空态 | 推荐关系权威源 |
| `voucher.code`, `isActive`, `redeemedCount`, `validFrom`, `validTo` | Admin Vouchers / Pricing 校验 | `voucher_codes` | 直接读取 | 无券码空态 | 券码主表权威源 |
| `voucherRedemption.appliedAmount` | 结算结果 / 增长核账 | `voucher_redemptions` | webhook 成功后创建 | 无核销时不展示 | 只有支付成功后才应出现 |

### Public / Marketing
| 字段 | 页面/模块 | 权威来源 | 复算路径 | 空态规则 | 当前备注 |
|---|---|---|---|---|---|
| `blogPosts[]` | `/blog`, `/blog/[slug]` | `blog_posts` | 按发布状态与发布时间读取 | 无文章空态 | Public 正式内容对象 |
| `contactSubmission` | `/contact` 表单 | 预期 `contact_submissions` 或 `user_feedbacks` | 表单提交后创建记录 | 未接通前必须禁用或明确提示 | 当前页面未接正式提交链路 |
| `newsletterSubscriber` | 营销留资 | `subscribers` | 订阅动作创建 | 无订阅时不展示 | 需确认实际入口页 |

### 当前阶段结论
- `T-002.5` 第一版已覆盖核心页面域关键字段的权威来源、复算路径与空态规则。
- 当前最需要进入 `T-002.6` 排查 schema/约束的字段链路：
  - `daily_tasks` 相关字段：任务创建、领取、幂等
  - `leaderboard_entries` 相关字段：排名、周期、一致性
  - `posts.like_count` 与 `post_likes`：冗余计数一致性
  - `exam_records.duration` / `user_attempts`：练习结果重复提交防重
  - `voucher_redemptions` / Stripe webhook：支付核销幂等
- 进入页面开发前，至少还要补完：
  - `T-002.6` schema 门禁与约束缺口
  - `T-002.7` Action/API 契约审计
  - `T-002.8` mock/fallback 热点清单
  - `T-002.9` 页面域波次顺序与依赖图

## T-002.6 schema 门禁与约束缺口清单（第一版）

### 判定口径
| 判定级别 | 含义 | 进入开发前要求 |
|---|---|---|
| 已有 DB 门禁 | 唯一键/主键/索引已足够支撑幂等或关系约束 | 可直接复用，只需在 `T-002.7` 对齐 Action 契约 |
| 仅应用层防护 | 代码里有 `findFirst` / advisory lock / 状态字段兜底，但数据库没有硬约束 | 开发前必须决定是否补 schema 或补独立幂等表 |
| 明确缺口 | 当前既缺 DB 门禁，又存在高频/并发/重放风险 | 必须优先收口，否则后续页面开发会反复返工 |

### 当前已具备的关键 schema 门禁
| 对象/链路 | 当前门禁 | 结论 | 备注 |
|---|---|---|---|
| `user_progress` 课时进度 | `@@unique([userId, lessonId])` | 可作为课程进度唯一记录基础 | 适合 `upsert` 写法 |
| `parent_students` 家长绑定 | `@@unique([parentId, studentId])` | 可防止重复建立同一亲子关系 | 仍需前端/Action 返回可读错误 |
| `post_likes` 点赞关系 | `@@unique([userId, postId])` | 关系层防重已存在 | 但 `posts.like_count` 仍是冗余计数风险点 |
| `leaderboard_entries` 榜单项 | `@@unique([userId, period, weekStart])` | 周期内单用户单榜单唯一性已具备 | 排名 `rank` 仍是缓存字段 |
| `referrals` 推荐绑定 | `@@unique([refereeId])` | 可防止一个被推荐人重复绑定推荐码 | 当前绑定 Action 已利用该约束兜底 |
| `voucher_redemptions` 券码核销 | `@@unique([voucherId, userId])` | 能防止同一用户重复核销同一券码 | 不能单独替代 Stripe 事件幂等 |
| `notification_preferences` 通知偏好 | `userId` 为主键 | 单用户单配置天然唯一 | 满足设置页读写要求 |
| `invite_codes.code` / `voucher_codes.code` | 单字段唯一 | 基础码值唯一性已具备 | 仅解决“码不重复”，不解决“状态冲突” |
| `questions.content_hash` | 唯一哈希 | 有利于内容去重 | 仍需结合导入策略决定是否允许复用 |

### 仅应用层防护、缺少 DB 硬门禁的链路
| 对象/链路 | 当前应用层防护 | 当前缺口 | 风险等级 | 结论 |
|---|---|---|---|---|
| `daily_tasks` 当日任务创建 | `count -> createMany` | 缺少 `@@unique([userId, type, date])` | P0 | 必须补强，当前并发刷新可生成重复任务 |
| 任务奖励领取 | 先读 `isClaimed=false` 再事务更新 XP | 缺少防重复领取的硬幂等键或条件更新门禁 | P0 | 必须补强，否则双击/重放存在重复加 XP 风险 |
| `exam_records` 提交考试 | 以 `duration != null` 判定“已提交” | 缺少提交态/幂等键/结果唯一性约束 | P0 | 应视为高风险重复提交链路 |
| `user_attempts` 批量写入 | 依赖 `examRecordId` 业务上下文 | 缺少 `(examRecordId, questionId)` 唯一性 | P0 | 当前重复提交会写出重复逐题记录 |
| Stripe webhook 事件处理 | advisory lock + `notification.link = stripe:event:{id}` 检查 | 无独立 `processed_events` 表；`notifications.link` 也无唯一约束 | P0 | 现有实现比普通链路更稳，但仍不是 schema 级硬幂等 |
| 社区点赞计数 | 事务内改 `post_likes` + `posts.like_count` | `like_count` 与关系表之间无 DB 一致性保护 | P1 | 页面可先接，但必须列入核账与修复计划 |
| 题目报错计数 | `questions.report_count` 依赖业务逻辑维护 | 缺少与 `question_reports` 的一致性门禁 | P1 | 统计页/报错处理前必须先确认口径 |
| 推荐码核销后的奖励发放 | 依赖 webhook 事务流程 | 缺少“奖励已结算事件”独立幂等记录 | P1 | 后续在 billing/growth 波次统一收口 |

### 明确 schema 设计缺口
| 对象/链路 | 当前表结构现状 | 缺口描述 | 建议方向 | 优先级 |
|---|---|---|---|---|
| `daily_tasks` | 仅有 `@@index([userId, date])` | 无法从 DB 层阻止同一用户同一任务类型同一天重复生成 | 增加 `@@unique([userId, type, date])` | P0 |
| `exam_records` | 进行中与已完成共用一张表，靠 `duration` 判状态 | 状态语义过弱，不适合作为正式幂等门禁 | 增加明确会话状态/提交时间/idempotency key | P0 |
| `user_attempts` | 只有普通索引，无唯一组合键 | 同一会话同一题可被重复写入 | 增加 `@@unique([examRecordId, questionId])` 或等价门禁 | P0 |
| Stripe webhook | 复用 `notifications` 做处理留痕 | 幂等证据与用户通知耦合，且无唯一键兜底 | 独立事件处理表或唯一事件日志表 | P0 |
| `invite_codes` | `code` 唯一，但无“每个学生最多一个有效邀请码”约束 | 可重复生成多个并行有效邀请码 | 增加 active/used 口径约束或生成策略约束 | P1 |
| `impersonation_sessions` | `token` 非唯一，无“同 admin/target 仅一个活跃会话”约束 | 安全会话回收与冲突判断困难 | 至少补 `token` 唯一；评估活跃会话约束 | P1 |
| `question_reports` | 无 `(questionId, reportedBy, issueType, status)` 维度的防重策略 | 同用户短时间重复报同一问题无门禁 | 明确是否允许重复；若不允许需补唯一/时间窗策略 | P1 |
| `contact_submissions` | 只有基础状态字段 | 缺少 `updatedAt`、处理人、回复时间等审计字段 | 若要纳入正式客服流，需补审计字段 | P2 |

### 按页面域回推的开发前门禁
| 页面域 | 开发前必须先锁定的 schema/约束点 | 原因 |
|---|---|---|
| Dashboard | `daily_tasks`、`exam_records`、`leaderboard_entries`、streak 触发语义 | 首屏展示直接依赖任务、练习、排行聚合 |
| Courses | `user_progress` 已基本可用；重点补完成判定与学习时长语义 | 课程域主要问题在业务规则，不是唯一键 |
| Practice | `exam_records`、`user_attempts`、`question_reports` | 这是最高频写入域，重复提交风险最大 |
| Community | `post_likes` 与 `posts.like_count` 一致性 | 否则列表、详情、统计会反复对不上 |
| Leaderboard | `leaderboard_entries` 已有唯一键，但积分写入口必须统一 | 否则 Dashboard 与榜单页口径会漂移 |
| Achievements | `daily_tasks`、XP 发奖幂等 | 任务和奖励直接影响成就页真实性 |
| Admin Feedback / Contact | `contact_submissions`、`user_feedbacks` 审计字段 | 后台处理流要有可追溯状态字段 |
| Billing / Growth | Stripe webhook 幂等、`voucher_redemptions`、`referrals` | 支付与奖励是高价值数据，不接受弱幂等 |

### 当前阶段结论
- `T-002.6` 第一版已经把“已有 DB 门禁”“只有应用层防护”“明确 schema 缺口”三类问题拆开。
- 进入页面开发前，必须先锁定以下 P0 门禁决策：
  - `daily_tasks` 是否补 `(userId, type, date)` 唯一键
  - `exam_records` / `user_attempts` 是否引入正式幂等键或提交态唯一约束
  - Stripe webhook 是否继续复用 `notifications` 做去重，还是新增独立事件表
- 下一步进入 `T-002.7` 时，需要把这些 schema 结论逐条映射到对应 Action/API：
  - 哪些接口可以靠 `upsert`
  - 哪些接口必须加条件更新
  - 哪些接口必须返回 `ALREADY_PROCESSED` / `DUPLICATE_EVENT`

## T-002.7 Action/API 契约审计清单（核心链路第一版）

### 统一审计规则
| 维度 | 统一要求 | 当前审计重点 |
|---|---|---|
| 输入 | 页面可直接调用的 Action 必须自己完成鉴权、参数校验、身份绑定 | 禁止把 `userId` 作为可信前端入参 |
| 输出 | 返回结构必须稳定，至少固定 `success/ok`、`code`、`message`、`data/error` 语义 | 避免有的抛异常、有的返回对象、有的返回 `null` |
| 权限 | 读操作不得隐式写库；写操作必须显式声明权限来源 | `getDashboardStats`、`getNotificationPreferences` 是重点 |
| 幂等 | 必须说明重复点击/重复提交/刷新重放时的返回语义 | 任务奖励、练习提交、支付、点赞最关键 |
| 并发 | 需要明确是靠 DB 唯一键、事务、条件更新、advisory lock，还是暂未覆盖 | 不允许“看起来能用，但并发下不稳” |

### 核心 Action/API 契约总表
| Action/API | 类型 | 身份来源 | 当前输入/输出 | 当前幂等/并发策略 | 当前结论 |
|---|---|---|---|---|---|
| `getDashboardStats` | 读 | `getCurrentUser()` | 返回 `DashboardData \| null` | 无；且读链路里触发 `ensureDailyTasks`、`checkAndRefreshStreak` | 读写混合，违反治理规则，必须拆开 |
| `updateUserLessonProgress` | 写 | Supabase session | 入参 `lessonId + progressInSeconds`，返回 `{ success, progress?, isCompleted?, error? }` | `user_progress` 依赖 `upsert`；完成副作用靠应用层判断 | 主体结构可用，但 streak/任务/学习时长副作用仍需统一定义 |
| `submitPracticeSession` | 写（内部服务） | 调用方传入 `userId` | 入参包含 `userId/mode/answers/...`，返回 `{ success, examRecordId?, score?... }` | 无硬幂等；直接 `create examRecord + createMany userAttempts` | 应定义为内部服务，禁止页面直接信任其身份入参 |
| `submitQuiz` | 写 | `getCurrentUser()` | 解析 Zod 输入后返回统一对象 | 重复提交目前无幂等键；后续副作用串行执行 | 页面可调用，但需补重复提交语义 |
| `startExam` | 写 | 当前实现走显式参数 | 返回新 `examRecordId` 和题目集 | 进行中会话靠 `duration = null` 表示 | 合同语义弱，需明确“同配置重复开始”规则 |
| `submitExam` | 写 | 调用方传入 `examRecordId + userId` | 返回 `{ success, result?, error? }` | 仅靠 `examRecord.duration !== null` 拦重 | 必须把身份改为服务端绑定，不能信任客户端传来的 `userId` |
| `claimTaskReward` | 写 | `getCurrentUser()` | 成功返回 `{ success, xpGained }`，失败有时直接抛错 | 先读 `isClaimed` 再事务更新 XP | 返回风格不稳定，且重复领取缺少硬门禁 |
| `completeOnboardingTask` | 写 | `getCurrentUser()` | 返回 `{ success, message? }` | `findFirst + update` | 允许重复点击但缺少稳定 `ALREADY_DONE` 语义 |
| `toggleLike` | 写 | `getCurrentUser()` | 返回 `{ success, liked?, error? }` | 关系表唯一键 + 事务改冗余计数 | 合同基本可用，但需要补并发下计数核账要求 |
| `createPost` / `createComment` | 写 | `getCurrentUser()` | 返回 `{ success, post/comment?, error? }` | 无显式幂等；重复提交靠前端控制 | 需要明确最小输入校验和重复提交语义 |
| `prepareCheckoutAction` | 写 | `getCurrentUser()` | 返回 `{ ok, code, message, checkoutUrl? }` | referral 绑定、voucher 校验、checkout 创建串在一起 | 合同清晰，但副作用边界过宽，存在“未支付先绑定推荐码”语义风险 |
| `createCheckoutSession` | 写 | `getCurrentUser()` | 返回 `ok/error` 联合类型 | Stripe idempotency key 使用分钟窗口 | 已有一定并发控制，但仍要与 webhook 幂等统一审计 |
| Stripe webhook | 写 | Stripe 签名事件 | HTTP JSON `{ ok, code, message, eventId? }` | advisory lock + `hasProcessedEvent` 检查 | 当前比普通链路稳，但应升级为独立事件幂等契约 |
| `bindReferralCodeAction` | 写 | `getCurrentUser()` | 返回 `{ ok, code, message }` | 依赖 `unique(refereeId)` 防重 | 合同较稳，可作为标准返回样例 |
| `updateProfile` | 写 | `getCurrentUser()` | `FormData -> ProfileFormState` | `user + userSettings` 事务更新 | 与其他 JSON 风格 Action 返回结构不统一 |
| `updateGoals/updateAIConfig/updatePreferences` | 写 | `getCurrentUser()` | `FormData -> SettingsFormState` | 多处各自 `upsert userSettings` | 设置域契约分散，字段覆盖边界需统一 |
| `getNotificationPreferences` | 读 | `getCurrentUser()` | 返回 `{ success, data/error }` | 读取时若无记录会直接创建 | 读操作带写副作用，需拆成“读取”与“迁移初始化” |
| `updateNotificationPreferences` | 写 | `getCurrentUser()` | 返回 `{ success, data/error }` | `upsert` | 主体可用，但错误返回未标准化 |
| `submitFeedback` | 写 | 可匿名/登录用户 | 返回 `{ success, data?, error? }` | 无幂等，允许重复提交 | 需补最小输入校验与匿名场景限流策略 |
| `replyToFeedback` | 写 | Admin | 返回 `{ success, data?, error? }` | 单条更新，无状态迁移校验 | 需补合法状态流转与重复回复语义 |
| `createVoucherCodeAction` | 写 | Admin | 返回 `{ ok, code, message }` | 依赖唯一 code | 合同清晰，可作为 Admin 写接口样例 |
| `toggleVoucherStatusAction` | 写 | Admin | 返回 `{ ok, code, message }` | 无版本号/条件更新 | 主体可用，但缺少 not-found 与并发语义细化 |
| `toggleUserStatus` | 写 | Admin | 返回 `{ success, error? }` | 事务保证审计日志 + 状态变更原子 | 可用，但错误码未标准化 |
| `addAdminNote` | 写 | Admin | 返回 `{ success, data?, error? }` | 事务保证备注 + 审计日志 | 可用，但与其他 Admin Action 返回风格不统一 |
| `impersonateUser` | 写 | Admin | 返回 `{ success, data.redirectUrl?, error? }` | 创建会话后再回填 token | 事务边界不完整，会留下占位 session 风险 |
| `applyAdminOverride` | 写 | Admin | 当前直接抛异常或返回 `{ success: true }` | 无事务包裹 override log + user update + security log | 必须补事务与稳定错误返回 |

### 核心契约问题清单
| 问题 | 涉及接口 | 影响 | 优先级 |
|---|---|---|---|
| 读接口带写副作用 | `getDashboardStats`, `getNotificationPreferences` | 刷新页面会改数据库，难以核账且影响并发测试 | P0 |
| 身份由前端传参而不是服务端绑定 | `submitPracticeSession`, `submitExam`, `startExam` 一类练习链路 | 契约边界错误，后续多页面接入时容易埋越权风险 | P0 |
| 返回结构不统一 | `throw Error`、`return null`、`return { success }`、`return { ok }` 并存 | 页面层会写大量分支判断，难以沉淀统一 adapter | P0 |
| 幂等语义未标准化 | 任务奖励、练习提交、反馈回复、点赞、checkout/webhook | 重复点击时页面无法稳定判定“已处理”还是“失败” | P0 |
| 设置域写接口分散 | `updateProfile`, `updateGoals`, `updateAIConfig`, `updatePreferences`, `updateNotificationPreferences` | 同域字段分散在多 Action，后续维护容易互相覆盖 | P1 |
| Admin 高风险动作事务边界不完整 | `impersonateUser`, `applyAdminOverride` | 审计、状态变更、会话创建可能部分成功 | P1 |

### 开发前要固定的统一契约规则
| 规则 | 说明 |
|---|---|
| 页面直连 Action 一律自行鉴权 | 页面不传可信 `userId`、`role`、`adminId` |
| 页面直连 Action 统一返回 Result 对象 | 建议统一为 `ok/code/message/data` 或 `success/code/message/data`，不要混用 |
| 读操作禁止隐式写库 | 初始化迁移、补偿修复应拆到显式初始化 Action 或后台任务 |
| 高价值写操作必须定义重复提交返回码 | 至少统一 `ALREADY_DONE`、`ALREADY_CLAIMED`、`DUPLICATE_EVENT`、`ALREADY_PROCESSED` |
| 内部服务与页面 Action 分层 | `submitPracticeSession` 这类接受 `userId` 的函数只能作为内部 service，被页面 Action 包裹 |
| Admin 动作默认要求事务 + 审计 | 只要涉及状态变更、权限、伪装、支付权益，就不能裸写 |

### 当前阶段结论
- `T-002.7` 第一版已经把核心读写链路的身份来源、返回结构、幂等语义和事务边界问题拆了出来。
- 进入页面开发前，必须先锁定 3 条总规则：
  - 读接口不允许再偷偷写库
  - 页面直连接口不允许信任前端传入的 `userId`
  - 高价值写接口必须给出稳定重复提交返回码
- 下一步进入 `T-002.8` 时，应基于这套契约去找全站 `mock/fallback/preview-only` 热点，因为很多 mock 问题本质上是契约不稳导致页面只能自己兜底。

## T-002.8 mock / fallback / preview-only 热点清单（第一版）

### 处置分类定义
| 分类 | 含义 | 处理原则 |
|---|---|---|
| 必须替换 | 正式页面正在直接展示 mock / 硬编码 / 假数据 | 进入对应页面任务前必须替换为真实链路 |
| 正式下线/禁用 | 当前存在面向正式页面的 preview/mock 入口，但不应在生产主流程继续暴露 | 开发时要么移除入口，要么显式环境开关禁用 |
| 非核账展示 | 明确属于营销文案、视觉预览、演示文案，不参与真实数据验收 | 可保留，但必须与正式数据隔离且不可伪装成真实结果 |
| 技术兜底 | 错误降级、兼容查询、零值 fallback，不主动造“好看数据” | 可暂保留，但必须记入验收说明，不作为真实展示能力 |

### 必须替换的正式页假数据热点
| 页面域 | 热点 | 文件/位置 | 当前症状 | 处置 | 归属任务 |
|---|---|---|---|---|---|
| Leaderboard | 整页首屏 mock 榜单 | `/src/app/(dashboard)/dashboard/leaderboard/page.tsx` | `buildMockLeaderboardEntries()` 直接喂给页面 | 必须替换为真实榜单读取 | `T-016` |
| Leaderboard | API 失败后回退到 mock 用户 | `/src/components/leaderboard/LeaderboardView.tsx` | `mockFallbackUsers` 在请求失败或空数据时继续展示 | 必须改为空态/错误态，不允许继续展示伪榜单 | `T-016` |
| Dashboard | 排名卡硬编码 | `/src/components/dashboard/DashboardHome.tsx` | `Top 15%`、`68%` 直接写死 | 必须接入真实 rank / percentile / average | `T-005` |
| Courses | 整个课程中心使用共享 mock 课程树与笔记 | `/src/components/courses/CoursesView.tsx` + `/src/components/shared/data.tsx` | `subjectsData`、`mockUserContent` 直接支撑正式页 | 必须整体替换，不做局部修补 | `T-006` |
| Courses | 正式课程详情路由为空壳 | `/src/app/course/[subjectId]/page.tsx`、`/src/app/course/[subjectId]/[lessonId]/page.tsx` | 页面直接 `notFound()` | 必须补真实承载页或调整路由归属 | `T-006` |
| Contact | 联系页仅前端 UI，没有正式提交链路 | `/src/app/(marketing)/contact/page.tsx` | 表单没有 Action/API，不落库 | 必须接正式提交或在接通前禁用提交 | `T-019` |
| Parent Dashboard | 排名卡仍有硬编码 | `/src/components/dashboard/views/ParentDashboardView.tsx` | `Top 15%` 写死 | 必须替换为真实学生榜单聚合或空态 | 后续 parent 相关任务 |

### 正式下线/禁用的 preview/mock 入口
| 页面域 | 热点 | 文件/位置 | 当前症状 | 建议处理 | 归属任务 |
|---|---|---|---|---|---|
| Smart Drill | URL 可直接开启 mock 预览 | `/src/app/(dashboard)/dashboard/practice/smart-drill/page.tsx` + `/src/components/practice/modes/SmartDrillMode.tsx` | `?preview=mock` 可进入本地 mock 题组 | 生产主流程禁用；若保留仅限内部调试开关 | `T-007` |
| Smart Drill | 正式页内置 mock 题组 | `/src/components/practice/modes/SmartDrillMode.tsx` | `MOCK_SMART_DRILL_QUESTIONS` 参与正式渲染分支 | 从正式组件剥离到内部 demo/debug | `T-007` |
| Practice Chapter Map | 无真实数据时自动展示 mock 章节图 | `/src/components/practice/PracticeView/ChapterMap/index.tsx` | `hasMockPreview ? MOCK_CHAPTERS : chapters` | 改为空态/引导，不再自动注入 mock | `T-007` |
| Practice Past Paper | 无数据时自动展示 mock 试卷 | `/src/components/practice/PracticeView/PastPapersSection.tsx` | `hasMockPreview ? MOCK_PAPERS : papers` | 改为空态/禁用态，不再自动注入 mock | `T-007` |
| Error Wiper | 启动页文案仍标注 Preview | `/src/components/practice/modes/ErrorWiperMode.tsx` | 正式模式首屏显示 `Error Wiper Preview` | 去掉 preview 语义，避免误导 | `T-007` |
| Admin Stripe Mock | 保留未接真实 Stripe 历史的 mock action | `/src/actions/admin/stripe-mock.ts` | 明确为模拟支付历史 | 若无引用则下线；若后续接 admin 账单则改真实源 | `T-009/T-010/T-012` |

### 可保留但必须显式标注为“非核账展示”的内容
| 页面域 | 文件/位置 | 当前内容 | 结论 |
|---|---|---|---|
| Marketing | `/src/app/(marketing)/how-it-works/page.tsx` | `68%` 等演示文案 | 属于营销 copy，可保留，不纳入真实数据验收 |
| Practice Preview Dialog | `/src/components/practice/PracticeView/PracticeModePreviewDialog.tsx` | 练习模式介绍弹窗 | 可保留，前提是只表达模式说明，不展示真实用户结果 |
| Marketing Landing | `/src/components/marketing/landing-page.tsx` | 推荐语、testimonial、文案数字说明 | 属于营销内容，不作为核账数据 |
| Parent Dashboard Read-Only 标签 | `/src/components/dashboard/views/ParentDashboardView.tsx` | `Read-Only` UI 标识 | 标签本身可保留，但卡片数据不能继续硬编码 |

### 可保留的技术兜底，但需写入验收说明
| 链路 | 文件/位置 | 当前行为 | 结论 |
|---|---|---|---|
| Auth 兼容查询 fallback | `/src/actions/user/auth.ts` | schema mismatch 时降级查询用户 | 可以保留，但不应伪造业务数据 |
| 官网平台统计降级为 0 | `/src/actions/marketing/campaign.ts` | DB 不可达时返回 0 | 可保留，属于容灾；但上线前应确保不会长期掩盖真实问题 |
| OCR mock provider 拦截 | `/src/actions/content-pipeline/import-service.ts` | 检测到 mock OCR 直接阻止入库 | 应保留，这属于防止假数据入库 |
| 内容审核 reviewer fallback | `/src/actions/content-pipeline/review-service.ts` | reviewer 缺失时找任一用户兜底 | 可临时保留，但需在内容域任务里明确审计策略 |

### 当前阶段结论
- `T-002.8` 第一版已确认本项目当前最重的正式页假数据集中在 4 个域：
  - Dashboard
  - Courses
  - Practice
  - Leaderboard
- 当前最不适合并行推进的根因也更清楚了：
  - 这些域不仅有 mock，还共享练习、排行榜、任务、用户画像等聚合口径
- 下一步进入 `T-002.9` 时，应按“先清共享依赖、再做页面域波次”的原则排顺序，而不是按页面外观优先级排。

## T-002.9 页面域波次顺序与依赖图（第一版）

### 排序原则
| 原则 | 说明 |
|---|---|
| 先共享规则，后页面域 | 先处理共享聚合和共享写链路，避免后续每个页面各修一遍 |
| 先高耦合核心域，后外围独立域 | Dashboard / Practice / Leaderboard / Achievements 优先于独立的 marketing 页面 |
| 先去假数据，再谈细节体验 | 只要页面还在吃 mock，就不进入 UI 微调 |
| 允许并行，但必须按写边界分线程 | 共享 schema / 共享 action / 共享聚合仍由主线程收口 |

### 共享依赖主图
| 共享能力 | 依赖页面域 | 说明 |
|---|---|---|
| `exam_records` / `user_attempts` 结果链路 | Dashboard, Practice, Leaderboard, Achievements, Admin Statistics | 练习写链路是一切统计的源头 |
| `daily_tasks` / XP / streak | Dashboard, Achievements, Courses, Practice | 任务与奖励触发时机必须统一 |
| `leaderboard_entries` 排名聚合 | Dashboard, Leaderboard, Practice | 积分写入与榜单读取必须同口径 |
| `user_progress` / 学习时长 | Dashboard, Courses, Achievements, Admin | 课程域不是孤立页面，直接影响首页和成就 |
| 支付/推荐/券码链路 | Pricing, Admin Growth, User 状态展示 | Stripe webhook、referral、voucher 必须统一收口 |
| 社区互动计数 | Community, Admin Dashboard | `post_likes` / `comments` 计数要一致 |

### 建议执行波次
| 波次 | 页面域任务 | 前置依赖 | 是否建议并行 | 说明 |
|---|---|---|---|---|
| Wave 0 | `T-002` 治理总表收口 | 无 | 否 | 当前阶段，先锁规则 |
| Wave 1 | `T-007 Practice` + `T-016 Leaderboard` + `T-017 Achievements` | `T-002.6`、`T-002.7` 已完成 | 否 | 这三块共享练习结果、积分、任务、XP 口径，应视为一个核心簇 |
| Wave 2 | `T-005 Dashboard` | Wave 1 核心聚合稳定 | 否 | Dashboard 读取依赖最广，必须站在真实聚合之上接 |
| Wave 3 | `T-006 Courses` + `T-018 Settings` | 任务/学习时长/streak 规则已锁 | 可有限并行 | Courses 影响学习进度与首页；Settings 相对独立但共享用户配置 |
| Wave 4 | `T-008 Community` + `T-011 Feedback` | 用户主档、通知、权限契约已稳定 | 可并行 | 两域写链路独立度较高 |
| Wave 5 | `T-009` + `T-010` + `T-012` + `T-013` + `T-014` + `T-015` | 前面真实数据源已接通 | 可按子域并行 | Admin 以消费真实业务数据为主，适合后置收口 |
| Wave 6 | `T-019 Public / Marketing / Auth` | 支付、contact、profile、growth 能力已稳定 | 可并行 | 多为跳转/表单/展示收口 |
| Wave 7 | `T-020` + `T-021` | 所有页面域开发完成 | 否 | 统一核账、预发回归、发布前收口 |

### 多线程并行边界建议
| 线程角色 | 允许负责的内容 | 禁止并行改动的共享文件 |
|---|---|---|
| 主线程 | `T-002`、共享 schema、共享 action、共享聚合、统一字段字典 | `/prisma/schema.prisma`、共享 `src/actions/*` 聚合、共享 `src/lib/*` |
| 页面线程 A | Courses / Settings | 不得改练习核心聚合 |
| 页面线程 B | Community / Feedback | 不得改支付与任务共享逻辑 |
| 页面线程 C | Admin 子域 | 不得自行改动全局字段口径 |
| 页面线程 D | Public / Marketing | 不得自己定义支付或用户状态来源 |

### 当前阶段结论
- `T-002.9` 第一版已经锁定了开发顺序主线：
  - 先 Practice / Leaderboard / Achievements
  - 再 Dashboard
  - 再 Courses / Settings
  - 再 Community / Admin / Public
- 这也解释了为什么当前不应该一上来就把不同页面扔到不同 thread 去写：
  - Wave 1 和 Wave 2 之前，共享聚合还没定稳，并行开发会放大返工
- 下一步 `T-002.10` 只需要做一件事：
  - 让用户确认这条波次顺序是否就是正式开发顺序

## T-002.10 建议锁定版（待用户确认）

### 建议锁定的正式开发顺序
| 顺序 | 页面域任务 | 锁定理由 |
|---|---|---|
| 1 | `T-007 Practice` | 练习结果链路是全站统计根源，必须先真实化 |
| 2 | `T-016 Leaderboard` | Dashboard 排名卡与榜单页共享同一积分口径 |
| 3 | `T-017 Achievements` | XP / streak / tasks 与练习域强耦合，必须跟练习一起定口径 |
| 4 | `T-005 Dashboard` | 首页依赖前 3 项的真实聚合，不适合先做 |
| 5 | `T-006 Courses` | 课程进度与学习时长进入第二批，避免和练习核心链路混修 |
| 6 | `T-018 Settings` | 用户设置与通知偏好相对独立，适合和 Courses 同波次推进 |
| 7 | `T-008 Community` | 依赖用户主档与通知，但与练习核心聚合解耦 |
| 8 | `T-011 Feedback` | 写链路独立，可和 Community 并行 |
| 9 | `T-009/T-010/T-012/T-013/T-014/T-015` | Admin 各子域以消费真实业务数据为主，后置更稳 |
| 10 | `T-019 Public / Marketing / Auth` | 多为 CTA、表单、跳转、支付链路收口，适合最后整理 |
| 11 | `T-020/T-021` | 全量核账、预发回归、上线前收口 |

### 建议锁定的并行策略
| 阶段 | 是否允许并行 | 限制 |
|---|---|---|
| `T-007 ~ T-005` | 不建议 | 共享练习、榜单、任务、XP 聚合，主线程收口 |
| `T-006 + T-018` | 可有限并行 | 不改共享练习聚合，不改全局 schema |
| `T-008 + T-011` | 可并行 | 不改支付、任务、排行榜共享逻辑 |
| Admin 多子域 | 可拆 thread | 必须指定共享文件唯一 owner |
| `T-019` | 可并行 | 不重新定义支付/用户状态口径 |

### 待用户确认事项
| 事项 | 当前建议 |
|---|---|
| 是否接受先做 Practice/Leaderboard/Achievements，再做 Dashboard | 建议接受 |
| 是否接受 Courses 不先于 Dashboard 开发 | 建议接受 |
| 是否接受 `T-019` 放到 Admin 之后统一收口 | 建议接受 |
| 是否接受 `T-002` 完成后，再开始多 thread 并行 | 建议接受 |

### 当前阶段结论
- `T-002` 的治理底稿已经足以支撑进入“确认开发顺序”阶段。
- 如果用户确认上述顺序，则 `T-002.10` 可直接标记完成，随后正式进入 Wave 1 开发。

### 用户确认结果
- 用户已确认按上述建议顺序推进。
- `T-002.10` 现标记完成。
- 后续正式开发顺序锁定为：
  - `T-007 Practice`
  - `T-016 Leaderboard`
  - `T-017 Achievements`
  - `T-005 Dashboard`
  - `T-006 Courses`
  - `T-018 Settings`
  - `T-008 Community`
  - `T-011 Feedback`
  - `T-009/T-010/T-012/T-013/T-014/T-015 Admin 子域`
  - `T-019 Public / Marketing / Auth`
  - `T-020/T-021` 验证与发布收口
