# 执行任务清单（Tasks）

| id | description | owner | status (todo/doing/done) | link (PR/commit) |
|---|---|---|---|---|
| T-001 | 将 P0-05 从 Dashboard 单页任务重写为“全站真实数据与联调收口”文档四件套 | codex | done |  |
| T-002 | 建立全站页面/功能/接口/数据表清单，补全 route -> component -> action/api -> table 映射 | codex | done |  |
| T-003 | 文档审阅与范围确认（用户确认前禁止开发） | user | done |  |
| T-004 | 全站真实数据治理模板（字段/状态/命名/核账/迭代流程） | codex | done |  |
| T-005 | `/dashboard` Dashboard 首页真实数据接入与功能对齐 | codex | doing |  |
| T-006 | `/dashboard/courses` + `/course/[subjectId]` + `/course/[subjectId]/[lessonId]` 学习内容域真实化 | codex | todo |  |
| T-007 | `/dashboard/practice` 全路由族真实化（含 Smart Drill / Error Wiper / Mock Arena / Chapter Drill / Past Paper） | codex | doing |  |
| T-008 | `/dashboard/community` 全路由族真实化（列表 / 发帖 / 详情 / 评论） | codex | todo |  |
| T-009 | `/admin` 首页与公共管理域真实化 | codex | todo |  |
| T-010 | `/admin/users` 全路由族真实化（列表 / 详情 / 管理动作） | codex | todo |  |
| T-011 | `/admin/feedback` 全路由族真实化（列表 / 详情 / 处理流） | codex | todo |  |
| T-012 | Referral 裂变主线 + Voucher 治理台真实化（拆分为 T-012A/B/C） | codex | done |  |
| T-013 | `/admin/content/import` + `/admin/content` 内容导入入口真实化 | codex | done |  |
| T-014 | `/admin/content/review` 全路由族真实化（列表 / 详情 / 审核动作） | codex | done |  |
| T-015 | `/admin/content/reports` + `/admin/content/statistics` 内容质控与统计域真实化 | codex | done |  |
| T-016 | `/dashboard/leaderboard` 排行榜 + sidebar 经验值卡真实化 | codex | todo |  |
| T-017 | `/dashboard/achievements` 成就 / XP / streak / 任务域真实化 | codex | todo |  |
| T-018 | `/dashboard/settings` 设置页真实化（含右上角通知弹层与通知深链收口） | codex | done |  |
| T-019 | Public / Marketing / Auth 页面 CTA、表单、跳转与权限行为对齐 | codex | todo |  |
| T-020 | 本地验证：页面冒烟、Action/API 契约、SQL/后台快照留证 | codex | doing |  |
| T-021 | 预发复测、发布前收口与回滚确认 | codex | todo |  |

## 实际执行顺序
> 说明：本文件的任务编号用于追踪，不等于文档展示顺序。  
> `T-004` 是“已完成的规则模板”，不是下一步要执行的工作。  
> 当前真正的执行顺序应固定为下面这条链路。

| 执行阶段 | 对应任务 | 执行说明 |
|---|---|---|
| Stage 0 | `T-004` | 先以 `sitewide-real-data-governance-template.md` 作为固定规则，不再重复定义口径 |
| Stage 1 | `T-002` | 先补齐全站治理前置内容：页面域、业务对象、关键事件、全链路映射、字段权威来源、schema 缺口、契约审计 |
| Stage 2 | `T-003` | 用户对齐颗粒度与开发顺序；未确认前不进入页面开发 |
| Stage 3 | `T-005 ~ T-019` | 按页面域分波次开发，每个页面域遵循 `.1 ~ .6` 模板推进 |
| Stage 4 | `T-020` | 本地验证：冒烟、字段核账、幂等/越权/异常验证 |
| Stage 5 | `T-021` | 预发复测、发布前收口与回滚确认 |

## T-002 全站治理前置任务（开发前必须补齐）
### 目标
- 在进入任何页面实现前，先把全站治理总表、依赖顺序、字段来源、写入事件、约束缺口一次性梳理清楚。
- `T-005 ~ T-019` 开始开发前，必须先完成 `T-002.1 ~ T-002.10` 并经用户确认颗粒度。

### T-002 产出清单
| id | description | owner | status |
|---|---|---|---|
| T-002.1 | 建立全站页面域清单：页面域 -> 路由 -> 页面入口 -> 是否正式页 | codex | done |
| T-002.2 | 建立全站业务对象清单：用户、练习会话、逐题记录、课程进度、任务、奖励、排行榜、帖子、支付等 | codex | done |
| T-002.3 | 建立关键读写事件清单：谁触发、写哪里、改哪些字段、是否允许重复触发 | codex | done |
| T-002.4 | 建立 route -> page -> component -> action/api -> table/service 全链路映射总表 | codex | done |
| T-002.5 | 建立字段级权威数据源矩阵：字段名、权威表/服务、复算路径、空态规则 | codex | done |
| T-002.6 | 建立 schema 门禁与约束缺口清单：唯一键、外键、状态字段、幂等键、审计字段 | codex | done |
| T-002.7 | 建立 Action/API 契约审计清单：输入、输出、错误、权限、幂等、并发策略 | codex | done |
| T-002.8 | 建立 mock/fallback/preview-only 热点清单，并标记为“替换 / 下线 / 明确禁用 / 非核账展示” | codex | done |
| T-002.9 | 建立页面域波次顺序与依赖图：哪些任务可独立推进，哪些依赖共享聚合或共享写链路 | codex | done |
| T-002.10 | 形成全站治理总表并完成一次用户对齐，锁定开发顺序与验收颗粒度 | user/codex | done |

## T-004 全站真实数据治理模板（已完成，作为规则层引用）
### 目标
- 后续所有页面任务必须按同一套字段定义、命名、状态机、空态规则、核账规则推进。
- 禁止“每做一个页面就重定义一遍统计口径和字段含义”。

### T-004 产出清单
| id | description | owner | status |
|---|---|---|---|
| T-004.1 | 建立统一字段字典：`accuracy`、`score`、`progress`、`masteryLevel`、`studyTime`、`streak`、`xp`、`rank` 等定义与单位 | codex | done |
| T-004.2 | 建立统一时间窗口定义：今日、7D、30D、最近 N 条、活跃日判定规则 | codex | done |
| T-004.3 | 建立统一数据源优先级：实时聚合、落库冗余、上游服务、空态/禁用态替代规则 | codex | done |
| T-004.4 | 建立统一命名规范：页面层、组件层、Action/API、聚合字段、UI 文案 | codex | done |
| T-004.5 | 建立统一状态机定义：有数据/无数据/无权限/失败；进行中/已完成/已领取等 | codex | done |
| T-004.6 | 建立统一核账规则：字段级映射、写操作前后快照、幂等/重复提交验证格式 | codex | done |
| T-004.7 | 建立统一页面任务模板：每个核心页面 task 都按同样的拆分结构推进 | codex | done |

## T-005 Dashboard 子任务（按五阶段推进）
### Phase A：定义与映射
| id | description | owner | status |
|---|---|---|---|
| T-005.1 | 盘点 Dashboard 全部区块、组件、CTA、跳转与当前数据来源 | codex | done |
| T-005.2 | 定义 Dashboard 字段字典与展示口径 | codex | done |
| T-005.3 | 建立 Dashboard 页面字段 -> Action/API -> 数据表 映射矩阵 | codex | done |
| T-005.4 | 定义空态、错误态、无权限态、禁用态规则，禁止 fallback 到 mock | codex | done |

### Phase B：读数据与聚合改造
| id | description | owner | status |
|---|---|---|---|
| T-005.5 | 重构 `getDashboardStats` / `DashboardData` 契约，移除挂空字段与伪完整结构 | codex | done |
| T-005.6 | 接入 `subjectStrengths` 真实聚合（按学科准确率/样本数/排序规则） | codex | done |
| T-005.7 | 接入 `weaknesses` 真实聚合，并统一“薄弱点”来源口径 | codex | done |
| T-005.8 | 处理 `dailyActivity`：要么落地真实数据，要么从契约中下线 | codex | done |
| T-005.9 | 替换排名卡硬编码（Top 15%、68% 等），接入真实 leaderboard 数据 | codex | done |
| T-005.10 | 校准“最近学习路径”区块：数据条数、排序、深链跳转、无数据态 | codex | done |
| T-005.11 | 校准“最近练习回顾”区块：确认全模式统一写 `exam_records`，并接结果页/记录详情 | codex | done |

### Phase C：写逻辑与业务口径改造
| id | description | owner | status |
|---|---|---|---|
| T-005.12 | 统一 `studyTime` 口径：修复只统计部分练习模式的问题 | codex | done |
| T-005.13 | 统一 `activeDays` / `streak` 的业务定义与触发时机，避免“打开 Dashboard 就改 streak” | codex | done |
| T-005.14 | 校准 `dailyTasks` 创建、推进、奖励领取链路，确保首屏与数据库状态一致 | codex | done |
| T-005.15 | 决定 `DailyInspiration` 策略：纳入真实数据源，或明确排除为非核账展示模块 | codex | done |
| T-005.15.1 | 在 Profile 中新增唯一 `handle`（`@username`）基础能力：格式/保留词校验、唯一性、Profile 申请入口，并为社区 `@提及` 建立后续身份基础 | codex | done |

### Phase D：页面清理与验证
| id | description | owner | status |
|---|---|---|---|
| T-005.16 | Dashboard 字段级 SQL 核账 + 刷新/重试/重复提交幂等验证 + mock/伪展示清理收尾 | codex | done |

### Phase E：刷新、展示约束与边界收口
| id | description | owner | status |
|---|---|---|---|
| T-005.17 | 定义 Dashboard 数据刷新、失效与回流策略：补齐 `overview / dailyTasks / learningPath / subjectProgress / leaderboard / recentPractice` 的刷新触发矩阵，并明确 `revalidatePath('/dashboard')`、局部回流与“下次进页刷新”的边界 | codex | done |
| T-005.18 | 补齐 Dashboard 加载态、错误态、局部失败降级与骨架屏规则：分别定义顶部 KPI、今日任务、学习路径、学科进度、排行榜、最近练习回顾、今日灵感的骨架屏、错误文案、空态 CTA 与局部失败降级规则 | codex | done |
| T-005.19 | 补齐 Dashboard 权限与身份分层展示规则：建立未登录、已登录未完成 onboarding、免费用户、付费用户、教师/管理员的首页可见模块、受限模块与引导文案矩阵 | codex | done |
| T-005.20 | 补齐 Dashboard 可访问性与移动端适配约束：明确手机端卡片排序、KPI 换行策略、CTA 最小点击面积、Dialog/Drawer 的移动端替代行为、键盘可达性与语义化要求 | codex | done |
| T-005.21 | 补齐 Dashboard 页面级验证与留证：按“浏览器冒烟 / 关键字段 SQL 核账 / 重复点击与刷新 / 移动端截图 / console error 检查”建立固定收口模板 | codex | done |
| T-005.22 | 明确 Dashboard 与共享域边界：建立字段 owner 矩阵，明确 `leaderboard / achievements / streak / xp / profile / settings` 等字段由共享域提供，Dashboard 只消费、不重复重算 | codex | done |

### T-005 说明性内容
#### Dashboard 板块功能确认
- 顶部概览卡用于展示 `7D / 30D` 窗口下的学习概览，不承载跳转。
- `今日任务` 负责展示 `dailyTasks` 当前待完成、可领取和已完成状态，并承接 onboarding 与领奖动作。
- `学习路径` 的业务定义是“根据推荐算法给出用户下一阶段应该完成的章节练习题”，不是课程学习入口。
- `学科进度` 的业务定义是“按学科下的章节完成情况展示学习完成度”，不是单纯学科正确率榜单。
- `年级排名` 用于展示同 cohort 排名、百分位和同级平均表现，CTA 指向排行榜域。
- `最近练习回顾` 用于展示近期完成记录，当前要求支持 5 种练习模式，并允许用户按原 `mode + subject + difficulty` 重新进入同配置练习。
- `今日灵感` 已明确定位为非核账展示模块，不进入 Dashboard 真数据合同。
- Shell 层的侧边栏、通知、升级入口、账户区虽然不属于首页卡片，但其可见性和跳转已纳入 `T-005.1` 盘点范围。

#### T-005.1 盘点结果摘要
- 页面入口：`src/app/(dashboard)/dashboard/page.tsx`
- 数据入口：`src/actions/dashboard.ts`
- 主视图：`src/components/dashboard/DashboardHome.tsx`
- 今日任务模块：`src/components/dashboard/DailyMissions.tsx`
- 今日灵感模块：`src/components/dashboard/Widgets.tsx`
- 侧边栏路由定义：`src/components/layout/dashboard-nav.ts`
- 当前首页 CTA 包括：`学习路径`、`学科进度`、`年级排名`、`最近练习回顾`、`今日灵感` 换图，以及 `7D / 30D` 窗口切换。
- `DailyMissions` 当前动作链路包括：`ONBOARDING_PROFILE`、`ONBOARDING_GOALS`、`ONBOARDING_ASSESSMENT`、`COMPLETE_LESSON`、`claimTaskReward`、`completeOnboardingTask`。
- 当前统计读取入口主要来自 `getDashboardProfile()` 与 `getDashboardStats()`，其中概览卡字段集中由 `getDashboardStats()` 提供。
- 盘点阶段确认的主要缺口包括：`subjectStrengths` 挂空、`weaknesses` 挂空、`dailyActivity` 挂空、排名卡硬编码、`DailyInspiration` 使用本地随机数据、最近学习路径与最近练习回顾合同不足。

#### T-005.2 字段字典与展示口径
- `stats.studyTime`：展示单位为分钟或小时文本，统计口径以后端统一学习时长为准。
- `stats.questions`：展示窗口内作答题量，按有效提交题目数统计。
- `stats.accuracy`：展示窗口内正确率，按 `correct / total` 计算并统一四舍五入。
- `stats.streak`：展示连续学习天数，由统一 streak 规则维护，不允许在 Dashboard 渲染时隐式改写。
- `stats.level` / `stats.xp`：展示等级与经验值，等级由 XP 派生，不在 Dashboard 单独重算。
- `learningPath.items[]`：必须至少包含 `subjectId`、`chapterId`、`title`、`reason`、`href`、`status`，用于推荐下一阶段章节练习。
- `subjectProgress.items[]`：必须至少包含 `subjectId`、`subjectName`、`overallMastery`、`chapterCount`、`completedChapterCount`、`totalAttempts`。
- `weaknesses.items[]`：必须至少包含 `subjectId`、`chapterId`、`chapterName`、`accuracy`、`attemptCount`、`priority`。
- `leaderboard`：必须至少包含 `status`、`rank`、`percentile`、`userAccuracy`、`peerAverageAccuracy`、`cohortLabel`。
- `recentPractice.items[]`：必须至少包含 `mode`、`subjectId`、`difficulty`、`href`、`completedAt`，必要时补 `chapterId`、`paperId`、`scopeId` 以支持原配置重练。
- `dailyTasks.items[]`：必须至少包含 `taskId`、`type`、`title`、`progress`、`reward`、`claimState`、`actionTarget`。
- `DailyInspiration` 若保留为非核账模块，必须明确标注为展示增强，不得伪装为后端真实字段。

#### T-005.3 页面字段 -> Action/API -> 数据表 映射矩阵
| 页面字段 | 当前读取入口 | 主要数据表/来源 | 支撑状态 |
|---|---|---|---|
| `stats.*` | `getDashboardStats()` | `users`、`user_attempts`、`exam_records`、`user_progress`、`daily_tasks` | 已支撑 |
| `overviewByWindow.*` | `getDashboardStats()` | `user_attempts`、`exam_records` | 已支撑 |
| `dailyTasks.*` | `getDashboardStats()` | `daily_tasks` | 已支撑 |
| `subjectProgress.items[]` | `getDashboardStats()` 聚合 | `questions`、`chapters`、`user_attempts` | 已支撑 |
| `weaknesses.items[]` | `getDashboardStats()` 聚合 | `questions`、`chapters`、`user_attempts` | 已支撑 |
| `leaderboard.*` | `getDashboardStats()` 聚合 | `users`、`user_attempts`、共享排行榜口径 | 已支撑 |
| `learningPath.items[]` | `getDashboardStats()` 聚合 | `questions`、`chapters`、`user_attempts`、章节 drill 深链 | 已支撑 |
| `recentPractice.items[]` | `getDashboardStats()` 聚合 | `exam_records` + 模式恢复字段 | 已支撑 |
| `recentPractice.difficulty` | `getDashboardStats()` 聚合 | `questions.difficulty` + Mock Arena 标题解析 | 部分支撑 |
| `recentPractice.chapterId / paperId / scopeId` | Dashboard 合同预留 | 需按模式补齐恢复字段 | 部分支撑 |
| `dailyActivity` | 旧合同占位 | 无正式来源，已决定从首页合同中下线 | 无后端支撑 |
| `DailyInspiration.quote / background` | 本地组件状态 | 本地策展文案与内置视觉主题 | 明确排除 |

#### T-005.4 状态规则与 fallback 约束
- 状态优先级固定为：`错误态 > 无权限态 > 空态 > 禁用态 > 正常态`。
- 页面级请求失败时，顶部概览与关键主区块允许进入页面级错误态；局部模块失败时必须保留其他模块渲染能力。
- 真实无数据必须展示空态，不允许返回默认全零结构冒充成功。
- 无权限模块必须显式展示受限原因或直接隐藏，不允许回退到 mock 文案。
- 禁用态只用于“功能暂不开放但设计上存在”的模块，且需与空态、错误态严格区分。
- 明确禁止使用硬编码百分位、随机 quote、本地伪统计、静态预览数组充当真实后端返回。

#### T-005.5 契约重构结果
- `DashboardData` 已改为显式模块合同，不再保留挂空数组和伪完整结构。
- 首页合同当前保留的核心模块包括：`stats`、`overviewByWindow`、`learningPath`、`recentPractice`、`subjectProgress`、`dailyTasks`、`weaknesses`、`leaderboard`。
- `dailyActivity` 已从首页合同中正式下线，不再保留空数组占位。

#### T-005.6 学科进度聚合结果
- `subjectProgress` 已切到真实聚合，按学科汇总章节表现。
- 当前聚合结果至少提供 `overallMastery`、`chapterCount`、`completedChapterCount`、`totalAttempts`，用于首页学科卡展示。

#### T-005.7 薄弱点聚合结果
- `weaknesses` 已切到真实聚合，并与学科聚合共用同一批章节表现基础数据。
- 薄弱点优先级以章节准确率、作答样本和掌握度综合排序，不再使用前端静态列表。

#### T-005.8 `dailyActivity` 处理结果
- 首页不再保留 `dailyActivity` 的挂空字段。
- 若后续需要恢复趋势图，应由独立真实来源重新定义合同，而不是继续沿用空数组占位。

#### T-005.9 排行榜卡接入结果
- 年级排名卡已移除 `Top 15%`、`68%` 等硬编码文案。
- 当前改为消费真实 `leaderboard` 模块状态，并按 `ready / empty / excluded / pending` 分别渲染。
- 排名卡 CTA 约束为：`ready -> /dashboard/leaderboard`，`empty -> /dashboard/practice`，`excluded -> /dashboard/settings`。

#### T-005.10 学习路径接入结果
- `learningPath` 已从 `pending` 占位改为真实推荐模块，不再返回课程恢复点或空数组占位。
- 推荐算法当前基于真实章节答题表现生成：
  - 优先推荐已形成样本且掌握度偏低的章节，作为“补弱”入口。
  - 其次推荐已练习序列后的下一章，作为“继续推进”入口。
  - 若当前学科没有明显薄弱点且没有下一章可推，则回退为“巩固复练”入口。
- 每条学习路径现在都输出真实章节 drill 深链：`/dashboard/practice/chapter-drill/[chapterId]?autostart=1`。
- 首页学习路径卡已改为点击单条推荐直接进入对应章节练习，不再统一跳回练习中心。
- 无数据态已校准为“尚无足够练习样本”，保留真实空态与引导 CTA，不再伪造推荐列表。

#### T-005.11 最近练习回顾接入结果
- 已确认当前首页消费的 5 种练习模式都统一写入 `exam_records`：
  - `SMART_DRILL`
  - `ERROR_WIPER`
  - `MOCK_EXAM`
  - `CHAPTER_DRILL`
  - `PAST_PAPER`
- `recentPractice` 合同已补齐模式恢复字段，首页不再只保存静态成绩摘要。
- Dashboard 聚合层现在会为最近练习记录生成可直接重练的深链：
  - `SMART_DRILL` -> 原科目 Smart Drill
  - `ERROR_WIPER` -> 原科目 Error Wiper
  - `MOCK_EXAM` -> 原科目 Mock Arena，并恢复 `difficulty + questionCount`
  - `CHAPTER_DRILL` -> 原章节 Chapter Drill
  - `PAST_PAPER` -> 原 `paperId` 的 Past Paper
- `PAST_PAPER` 的恢复不依赖额外 schema 改造，当前通过 `examRecord -> attempts -> question.paperId` 反推出原卷入口。
- 列表点击行为已从“统一回练习中心”改为“按原模式和原配置直接重开一轮”。
- 最近练习卡片现在会展示可恢复的配置摘要；当前已补出 `difficulty` 快照展示，并用于 Mock Arena 的重练参数恢复。

#### T-005.12 `studyTime` 口径统一结果
- Dashboard 首页总卡的 `stats.studyTime` 已改为基于 `exam_records.duration` 聚合，不再直接读取 `user.totalStudyTime`。
- `7D / 30D` 窗口卡与总卡现在统一使用同一批 retention 内练习记录计算，避免顶部总卡和窗口卡来源不一致。
- 当前口径覆盖所有已经统一写入 `exam_records` 的练习模式：
  - `SMART_DRILL`
  - `ERROR_WIPER`
  - `MOCK_EXAM`
  - `CHAPTER_DRILL`
  - `PAST_PAPER`
- 本次修复的重点是解决 Dashboard 只稳定统计部分练习模式、且与窗口卡不一致的问题；课程学习时长仍保留在 `user.totalStudyTime` 供其他域使用，不再混入首页练习统计口径。
- 前台统一答题页已补充轻量计时展示：
  - 默认只显示一个时钟图标，不直接暴露高压倒计时。
  - 点击图标后从右侧滑出当前已用时间，按分钟展示。
  - 图标 tooltip 固定为“答题时间”。

#### T-005.13 `activeDays` / `streak` 口径统一结果
- Dashboard 首屏已移除 `checkAndRefreshStreak()` 的加载时调用，打开首页不再隐式改写 streak。
- `streak` 当前只允许在真实学习动作发生时刷新：
  - 完成一轮练习提交后
  - 完成课程学习并达到完成阈值后
- `activeDays` 已从“仅统计答题 attempts 的自然日”改为“统计真实完成学习动作的自然日”：
  - 练习完成：取 `exam_records.created_at`
  - 课程完成：取 `user_progress.updated_at` 且 `is_completed = true`
- 这样 `activeDays` 与 `streak` 的触发边界保持一致，不再出现“课程完成能涨 streak，但 Dashboard 活跃天数不计入”的口径偏差。
- 首页文案也已同步为“完成练习或课程的天数”，不再继续显示“登录或练习的天数”。

#### T-005.14 `dailyTasks` 创建 / 推进 / 领奖链路收口结果
- `dailyTasks` 创建逻辑已从“今天有任意任务就直接跳过”改为“按任务类型逐项补齐”，避免首页只拿到部分任务。
- 默认日常任务与 onboarding 任务已拆成两套模板：
  - 日常任务：`LOGIN`、`COMPLETE_LESSON`、`QUIZ_SCORE`
  - onboarding 任务：`ONBOARDING_PROFILE`、`ONBOARDING_GOALS`、`ONBOARDING_ASSESSMENT`
- onboarding 任务现在按真实缺口决定是否生成：
  - `ONBOARDING_PROFILE`：缺 `username` 或 `grade`
  - `ONBOARDING_GOALS`：缺 `studyReminderTime`
  - `ONBOARDING_ASSESSMENT`：缺 `difficultyCalibration`，且历史上未完成过 assessment 任务
- Dashboard 首屏已改为先等待 `ensureDailyTasks()` 完成，再读取 `daily_tasks`，避免首次进入首页时任务列表为空或缺项。
- `trackDailyProgress()` 现在会先确保当天任务存在，再推进对应任务进度，避免课程/练习链路在任务未创建时静默丢更新。
- `completeOnboardingTask()` 已改为只完成“今天的对应 onboarding 任务”，不再使用“最近一条未领取同类型任务”的模糊查询。
- `claimTaskReward()` 已改为复用统一的任务领奖 helper，校验归属、完成状态和重复领取规则，避免 Dashboard 与批量领奖逻辑分叉。
- 由于 `AssessmentDialog` 当前仍是前端 mock 流程，本轮先用“历史完成过 assessment 任务”作为补充判定，避免该任务次日重复生成；真实测评落库仍留待后续任务处理。

#### T-005.15 `DailyInspiration` 策略收口结果
- `DailyInspiration` 已明确排除为非核账展示模块，不纳入 `DashboardData` 合同，也不参与字段级核账。
- 当前实现已移除以下会造成“伪真实数据”错觉的依赖：
  - `localStorage` 持久化
  - 外链 Unsplash 占位图
  - 注释中残留的“客户端生成图片”伪路径
- 组件现在改为纯本地策展展示：
  - 文案来自内置多语言 quote 列表
  - 背景来自内置渐变视觉主题
  - “换一张”只在本地主题池内切换，不触发任何后端请求
- UI 上已补充 `Display enhancement only / 展示增强模块` 标识，避免该区块被误解为学习统计或个性化推荐结果。
- 后续若要把 `DailyInspiration` 纳入真实数据源，应作为独立需求重新定义：
  - 数据来源
  - 审核与版权策略
  - 刷新频率
  - 多语言内容供应方式
    在当前 P0 范围内不再继续扩展。

#### T-005.15.1 Profile Handle 身份能力与社区迁移
- 目标不是继续复用现有 `username`，而是建立独立的身份标识字段 `handle`，用于后续社区 `@提及`、用户识别、短链接与通知链路。
- 本轮约束：
  - `handle` 必须唯一、大小写不敏感、落库统一小写。
  - `handle` 允许用户在 Profile 中申请与修改。
  - `handle` 必须经过格式校验、保留词校验和唯一性校验。
  - `handle` 长度需为 `6-20` 个字符，不允许包含数字。
  - 常见品牌词、名人词、系统词和官方词禁止申请，例如：`apple`、`elonmusk`、`admin`、`support`、`learnmore`。
- 建议身份模型：
  - `username` 继续作为当前兼容展示名字段保留。
  - `handle` 作为后续社区身份标识字段新增，供 `@handle`、用户搜索和 mention 关系使用。
- 后续社区迁移方向：
  - 发帖 / 评论中的 `@提及` 从当前 `mentionedUsernames` 逐步迁移到 `handle`。
  - 社区展示层后续优先显示 `@handle`，展示名仍可独立存在。
- 本轮已落地结果：
  - `users.handle` 已加入 schema，并补充本地 migration。
  - `reserved_handles` 表已落地，并补充 `023_t00515_handles_mentions.sql` migration；本地库已写入 22 个默认保留词。
  - 已新增 `024_t00515_expand_reserved_handles.sql`，本地库当前保留词已扩展到 67 条。
  - Profile 更新链路已支持 `handle` 提交、统一转小写、保留词校验和唯一性校验。
  - Dashboard Profile Dialog 与 Settings Profile 区都已补 `handle` 输入入口、说明文案和实时可用性检查反馈。
  - 已新增 `GET /api/users/handle-availability`，供前端做实时可用性查询。
  - 社区发帖 / 评论的 mention 解析与存储已从 `mentionedUsernames` 迁移到 `mentionedHandles`，并同步写入 `mentionedUserIds` 用于通知投递。
  - 社区列表、帖子详情、评论作者与 mention 标签已优先展示并链接到 `@handle`。
  - 已新增公开用户页路由 `/u/[handle]`，用于后续社区公开身份页与短链接访问。
  - 保留词当前覆盖品牌词、名人词、系统词与官方词的最小集合，例如：`apple`、`elonmusk`、`admin`、`support`、`learnmore`。
  - 当前仍未实现社区编辑器内的 `@handle` 自动补全下拉与 mention 搜索建议；本轮先完成身份字段、存储结构、通知目标解析和公开页。
  - 已完成最小校验：
    - `pnpm prisma generate`
    - 本地执行 `023_t00515_handles_mentions.sql`
    - `pnpm eslint src/lib/hooks/useHandleAvailability.ts src/actions/__tests__/profile.test.ts src/components/business/settings/profile-form.tsx src/components/dashboard/views/SettingsView.tsx src/actions/community/post.ts src/components/community/NewPostPageClient.tsx src/components/community/PostDetailClient.tsx src/components/dashboard/views/CommunityView.tsx src/app/api/users/handle-availability/route.ts src/lib/users/handle-server.ts src/actions/user/profile.ts src/actions/user/auth.ts`
    - `pnpm vitest run src/actions/__tests__/profile.test.ts`
    - `pnpm tsx -e "import { getHandleAvailability } from './src/lib/users/handle-server'; ..."` 验证保留词与可用 handle 两条分支

#### T-005.16 核账 / 幂等 / 清理收尾结果
- Dashboard 首页合同已移除 `pending` 伪状态残留：
  - `DashboardModuleStatus` 现仅保留 `ready / empty / excluded`
  - 首页学习路径、学科进度、排行榜卡片已删除“接入中 / pending”分支，不再继续展示历史过渡态
- `dailyTasks` 链路已补充并发与重复提交保护：
  - `ensureDailyTasks()` 改为基于 PostgreSQL advisory lock 串行化当天任务生成，避免刷新/并发请求下创建重复任务行
  - `trackDailyProgress()` 改为在同一把锁内推进，避免并发更新时进度丢失
  - `completeTodayOnboardingTask()` 改为在锁内做条件更新，重复点击不会把任务状态推进错位
  - `claimDailyTaskRewardForUser()` 改为事务内 `updateMany ... where isClaimed = false` 的原子领取，重复点击/重试不会重复加 XP
- 已完成一轮本地数据库抽样核账，取 1 个有真实练习记录的用户样本验证：
  - `30D`：`studyTime = 0.6h`、`questions = 48`、`accuracy = 38%`、`activeDays = 7`
  - `7D`：`studyTime = 0.6h`、`questions = 36`、`accuracy = 36%`
  - 当日 `daily_tasks` 共 5 条，`duplicateTypes = []`，未发现同类型重复任务行
- Dashboard 范围内已确认清理完成的伪展示项：
  - 首页不再保留 `dailyActivity` 挂空字段
  - 首页不再保留 leaderboard / learningPath / subjectProgress 的 `pending` 占位
  - `DailyInspiration` 已明确排除为展示增强模块，不再伪装为真实后端内容
- 本轮留证以代码校验 + 本地数据库抽样为主，已通过定向检查：
  - `pnpm eslint src/actions/gamification/daily-tasks.ts src/actions/dashboard.ts src/components/dashboard/DashboardHome.tsx src/actions/gamification/achievement.ts`
- 已补充浏览器层重复点击自动化回归：
  - 使用隔离 Playwright 浏览器注册夹具用户，写入当日 `ONBOARDING_PROFILE / ONBOARDING_GOALS / QUIZ_SCORE` 任务后重载 Dashboard。
  - 连续点击 2 次“完善个人资料”任务，已确认弹窗可重复打开，且不再出现 `DialogContent requires a DialogTitle` 控制台错误。

#### T-005.17 Dashboard 刷新 / 失效 / 回流策略（已完成）
- 当前链路盘点：
  - `/dashboard` 首屏由 `src/app/(dashboard)/dashboard/page.tsx` 服务端执行 `getDashboardProfile()` + `getDashboardStats()` 一次性取数，驻页默认不轮询。
  - 顶部 `7D / 30D` 窗口切换只切本地 `overviewByWindow`，不额外发请求。
  - `DailyMissions` 在 `claimTaskReward`、`completeOnboardingTask` 成功后执行 `router.refresh()`，并依赖服务端 action 中的 `revalidatePath('/dashboard')` 使当前路由重取数据。
  - `updateProfile`、`updateGoals`、`completeOnboarding`、`claimTaskReward`、`completeOnboardingTask` 已显式 `revalidatePath('/dashboard')`；`updateUserLessonProgress` 目前只刷新 `/dashboard/courses`，练习提交副作用目前只刷新成就 tag，不显式 `revalidatePath('/dashboard')`。
- 刷新触发矩阵（`T-005.17.1`）：
  - `overviewByWindow / stats`
    - 进入 `/dashboard`：必须刷新。
    - `7D / 30D` 切换：本地切换，不刷新。
    - 完成练习 / 完成课程后返回 Dashboard：允许“下次进入 Dashboard 时刷新”，不要求驻页实时变更。
    - 领奖 / Profile / Goals / Assessment 更新：允许当前页 `router.refresh()` 后刷新。
  - `dailyTasks`
    - 进入 `/dashboard`：必须刷新，并在读取前先执行 `ensureDailyTasks()`。
    - 领奖 / onboarding 完成：当前页必须 `router.refresh()`。
    - 完成练习 / 完成课程：允许依赖下次进入 Dashboard 刷新，不做驻页推送。
  - `learningPath / subjectProgress / weaknesses / recentPractice / leaderboard`
    - 进入 `/dashboard`：必须刷新。
    - 练习提交后：允许在“返回 Dashboard 时刷新”，不要求练习结果页完成后实时推送首页。
    - Profile / Goals / Assessment 更新：仅 `learningPath` 与 `dailyTasks` 可能变化，其他模块允许保持不变直到下次进入 Dashboard。
- 缓存与失效策略（`T-005.17.2`）：
  - Dashboard 首页不做驻页轮询，不做定时静默刷新，不做 tab focus 自动刷新。
  - Dashboard 首页的数据一致性目标定义为“按进入页面 / 显式刷新时近实时”，不是“驻页实时”。
  - 当前页内已知需要立即回流的动作仅限：
    - `dailyTasks` 领奖
    - `dailyTasks` onboarding 完成
    - Dashboard 内直接提交的 Profile / Goals / Assessment
  - 跨页面写入（练习提交、课程完成、设置页保存）统一按“下一次进入 Dashboard 重新取数”处理，不再引入额外轮询或跨页事件总线。
- 执行约束：
  - `router.refresh()` 只用于当前 Dashboard 页面内已经发生并且用户预期立即看到变化的动作。
  - `revalidatePath('/dashboard')` 只作为“下一次进入 Dashboard 重新拉取”的失效信号，不承诺驻页热更新。
  - 若后续需要驻页实时反馈，应作为独立需求新增，不在 P0 Dashboard 真实化范围内偷带实现。
- 当前遗留差异：
  - 课程完成与练习提交链路未统一显式 `revalidatePath('/dashboard')`，但按现行策略仍可接受，因为本任务定义的是“返回页刷新”而非“驻页实时刷新”。
  - 若后续产品要求“练习完成后立刻返回 Dashboard 并看到最新 KPI”，应在练习/课程写链路补 `/dashboard` 失效，而不是在首页增加轮询。
  - 点击“完成 1 次测验”任务后，已确认可跳转到 `/dashboard/practice`，当前 CTA 入口已接通。
- 已补充多用户样本 SQL 核账矩阵：
  - 真实活跃样本共 2 个用户：`admin@learnmore.com`、`student1@mail.com`。
  - `admin@learnmore.com`：
    - `7D`：`studyTime = 0.6h`、`questions = 36`、`accuracy = 36%`
    - `30D`：`studyTime = 0.6h`、`questions = 48`、`accuracy = 38%`、`activeDays = 7`
    - 当日 `duplicateTaskTypes = []`
  - `student1@mail.com`：
    - `7D`：`studyTime = 0h`、`questions = 0`、`accuracy = 0%`
    - `30D`：`studyTime = 0h`、`questions = 0`、`accuracy = 0%`、`activeDays = 1`
    - 当日 `duplicateTaskTypes = []`
- 额外做了 3 个高 XP 用户的重复任务扫描，均未发现同类型重复任务行。

#### T-005.18 Dashboard 加载态 / 错误态 / 局部失败降级规则（已完成）
- 页面级总原则：
  - `/dashboard` 首页当前采用服务端一次性取数，若 `getDashboardProfile()` 或 `getDashboardStats()` 整体失败，则进入页面级失败路径，不允许渲染伪完整 Dashboard。
  - 页面级失败只用于“整页关键依赖不可用”，例如用户资料缺失、数据库连接异常、核心查询抛错；此时优先展示问题说明与恢复动作，而不是零值 KPI。
  - 页面级成功后，首页区块统一采用“模块自带空态”，不允许再用默认 `0 / 0% / 空数组` 冒充真实成功数据。
- 骨架屏与加载策略：
  - 当前 P0 不新增驻页异步拉取，因此首页首屏不单独引入客户端模块级 skeleton；加载体验由路由级 loading / 首屏进入等待承担。
  - 若后续把某个 Dashboard 区块改为独立客户端拉取，必须补对应骨架屏，且骨架形态需与真实布局一一对应，不得使用通用灰块敷衍。
  - `7D / 30D` 窗口切换为本地切换，禁止出现 skeleton 或闪烁重载。
- 局部失败降级原则：
  - `learningPath`、`subjectProgress`、`leaderboard`、`recentPractice`、`dailyTasks` 均按模块合同中的 `status + note` 渲染局部空态，不允许一个模块无数据就拖垮整页。
  - `DailyInspiration` 属于展示增强模块，若本地语言文案或主题池异常，应直接回退到默认英文/中文静态文案，不影响其他模块。
  - Dashboard 当前合同未定义模块级 `error` 状态；因此本轮约束为“能在聚合层识别为无数据的，统一返回 `empty / excluded`，真正异常上抛到页面级失败”。后续若要支持模块级错误重试，再单独扩展合同。
- 顶部 KPI（`overviewByWindow` / `stats`）：
  - 首屏加载：跟随页面级加载，不单独显示 skeleton。
  - 成功有数据：展示真实 `studyTime / questions / accuracy / activeDays`。
  - 真实无数据：允许显示 `0h / 0 / 0% / 0`，但前提是后端已确认“窗口内确实没有练习/课程事件”，不得用默认值伪造。
  - 错误态：归入页面级失败，不做局部错误卡。
  - CTA：无 CTA；`7D / 30D` 仅切本地窗口。
- 今日任务（`dailyTasks`）：
  - 首屏加载：跟随页面级加载，不单独显示 skeleton。
  - 空态：使用当前 `PageEmptyState`，标题固定为“今日任务已完成 / Today's mission is clear”，CTA 指向 `/dashboard/practice`。
  - 错误态：本轮不单独定义模块错误页；若 `ensureDailyTasks()` 或读取当天任务失败并影响首页主数据，则进入页面级失败。
  - 局部失败：单个动作失败时仅 toast 报错，不清空任务列表，不得把失败动作误显示为已完成或已领取。
  - CTA 规则：`ONBOARDING_PROFILE / GOALS / ASSESSMENT` 打开对应弹窗；`COMPLETE_LESSON` 跳 `/dashboard/courses`；`QUIZ_SCORE` 跳 `/dashboard/practice`；`FIX_ERROR` 跳 `/dashboard/practice/error-wiper`；`LOGIN` 无右侧深链 CTA。
- 学习路径（`learningPath`）：
  - 首屏加载：跟随页面级加载，不单独显示 skeleton。
  - 空态：标题固定为“还没有最近学习记录”，描述优先使用模块 `note`，CTA 固定指向 `/dashboard/practice`。
  - 错误态：聚合异常上抛为页面级失败；禁止回退到静态推荐列表。
  - 局部失败降级：当推荐条目数少于分页槽位时，仅显示“已到列表底部”，不得补假推荐。
  - CTA：区块头部 CTA 固定为“练习中心”；条目 CTA 必须深链到章节练习 `href`。
- 学科进度（`subjectProgress`）：
  - 首屏加载：跟随页面级加载，不单独显示 skeleton。
  - 空态：标题固定为“还没有学科进度数据”，CTA 指向 `/dashboard/practice`。
  - 错误态：聚合异常上抛为页面级失败；不得回退成硬编码学科列表。
  - 局部失败降级：分页不足时只展示“已到列表底部”；不得补零值学科卡。
  - CTA：区块 CTA 固定为“去练习”。
- 年级排名（`leaderboard`）：
  - 首屏加载：跟随页面级加载，不单独显示 skeleton。
  - `ready`：显示真实 `percentile / peerAverageAccuracy / userAccuracy`。
  - `excluded`：显示“缺少年级信息”，CTA 指向 `/dashboard/settings`。
  - `empty`：显示“尚未进入排行榜”，CTA 指向 `/dashboard/practice`。
  - 错误态：排行榜聚合异常上抛为页面级失败；禁止继续显示历史硬编码 `Top 15% / 68%` 文案。
- 最近练习回顾（`recentPractice`）：
  - 首屏加载：跟随页面级加载，不单独显示 skeleton。
  - 空态：标题固定为“还没有练习记录”，CTA 指向 `/dashboard/practice`。
  - 错误态：聚合异常上抛为页面级失败；不得回退到假成绩记录。
  - 局部失败降级：若某条记录缺少可恢复字段，则该条不渲染为可点击重练项，而不是拼接错误深链。
  - CTA：区块头部 CTA 指向 `/dashboard/practice`；单条记录 CTA 指向其模式恢复 `href`。
- 今日灵感（`DailyInspiration`）：
  - 首屏加载：不显示 skeleton，直接渲染本地策展模块。
  - 空态：不定义；若当前语言文案缺失，回退到英文文案池。
  - 错误态：不得影响 Dashboard 其他模块；允许直接回退到默认主题与默认 quote。
  - CTA：仅保留“换一张 / Refresh”本地切换按钮，不承载业务跳转。
- 文案与留证约束：
  - 所有空态文案必须明确说明“为何当前没有数据”以及“下一步去哪里补数据”，禁止出现泛化文案如“暂无内容”。
  - 所有错误态若未来扩展为模块级错误，必须同时提供恢复动作或联系指引；不能只显示红字。
  - 本轮 `T-005.18` 先锁定规则，不额外引入客户端 skeleton 实现；若后续有独立异步模块，再按本节规则补 UI。

#### T-005.19 Dashboard 权限与身份分层展示矩阵（已完成）
- 访问前提：
  - `未登录` 用户不属于 Dashboard 展示矩阵，当前由路由层直接重定向到 `/login`，不渲染 Dashboard 壳或空态首页。
  - `已登录但数据库用户记录缺失` 属于账户同步异常，不归入普通身份分层；当前走页面级账户修复路径。
- 身份分层总原则：
  - Dashboard 首页当前默认只服务学生主视图；家长、管理员、教师虽然可进入 `/dashboard`，但其壳层与导航需按角色切换，不能假定所有用户都看到同一套学生入口。
  - 订阅层级当前不用于隐藏 Dashboard 主模块，主要用于升级引导、试用 Banner、排行榜资料约束和下游练习/AI 功能额度；因此本任务只定义展示差异，不新增按套餐硬隐藏首页卡片。
  - `excluded` 只用于“当前用户缺少参与该模块所需资料或身份”，不得滥用为“未开发”或“套餐不足”。
- 分层矩阵（`T-005.19.1`）：
  - `未登录`
    - 首页可见模块：无。
    - 处理方式：直接重定向 `/login`。
    - 说明：不在 Dashboard 内展示“请登录后查看”空页面。
  - `已登录未完成 onboarding 的学生`
    - 首页可见模块：顶部 KPI、今日任务、学习路径、学科进度、排行榜、最近练习回顾、今日灵感。
    - 特殊规则：
      - `dailyTasks` 必须优先生成并展示 onboarding 任务。
      - `leaderboard` 若缺少年级资料，可进入 `excluded`，CTA 指向 `/dashboard/settings`。
      - `learningPath / subjectProgress / recentPractice` 允许真实空态，不因 onboarding 未完成而整体隐藏。
    - 引导文案：优先通过 `今日任务` 和 `排行榜 excluded` 提示补资料，而不是整页遮罩。
  - `已登录免费用户（STARTER）`
    - 首页可见模块：与普通学生一致，不额外隐藏首页区块。
    - 特殊规则：
      - 侧边栏保留“升级套餐”入口。
      - 试用倒计时 Banner 不显示，除非其套餐状态属于 `STANDARD` 且试用即将结束。
      - 首页 CTA 可以引导进入练习中心或设置页，但不得在 Dashboard 卡片内伪装未开放模块。
  - `已登录付费用户（STANDARD / SMART_PLUS / PREMIER）`
    - 首页可见模块：与普通学生一致。
    - 特殊规则：
      - 保留侧边栏升级/套餐入口，但其文案可视为续费/查看套餐，不作为功能解锁遮罩。
      - `STANDARD` 且 `subscriptionEnd` 在 24 小时内时，允许显示试用倒计时 Banner。
      - `SMART_PLUS / PREMIER` 不因套餐更高而获得额外 Dashboard 首页模块；差异主要体现在下游功能额度。
  - `家长（PARENT）`
    - 首页可见模块：不使用学生 Dashboard 首页；当前切换到 `ParentDashboardView`。
    - 导航：仅保留 parent 首页和设置。
    - 约束：不得把学生的 `dailyTasks / learningPath / leaderboard / recentPractice` 直接复用于家长首页。
  - `教师 / 管理员（TEACHER / ADMIN）`
    - 首页可见模块：当前仍可进入学生 Dashboard 壳，但同时拥有 Admin 导航区和 `/admin` 路由入口。
    - 导航：侧边栏增加 Admin Dashboard、用户管理、内容管理等入口。
    - 套餐规则：权限引擎中教师/管理员视作 `PREMIER`，但这不意味着 Dashboard 首页要额外渲染管理员专属学生卡片。
    - 约束：教师/管理员在 `/dashboard` 看到的学生首页模块继续按学生合同渲染；真正的管理能力留在 `/admin` 域，不在 Dashboard 首页混排。
- 模块级受限规则：
  - `leaderboard`
    - 受限原因仅限资料缺失（例如 grade 缺失）等参与条件不满足。
    - 受限展示使用 `excluded + note`，CTA 指向 `/dashboard/settings`。
    - 不因免费/付费差异隐藏排行榜卡。
  - `dailyTasks`
    - 仅对学生主视图生效；家长首页不展示该模块。
    - onboarding 未完成时优先展示 onboarding 任务，不需要额外叠加全页 onboarding 遮罩。
  - `learningPath / subjectProgress / recentPractice`
    - 仅按“有无真实学习数据”决定 `ready / empty`，不因免费/付费差异切成受限态。
  - `DailyInspiration`
    - 所有身份统一可见；它是展示增强模块，不参与权限判断。
- 侧边栏与壳层规则：
  - 学生主导航当前固定为 `dashboard / courses / practice / community`。
  - 家长导航当前固定为 parent 首页。
  - 设置页入口对所有已登录角色保留。
  - 升级入口对非家长用户保留；当前不根据是否已付费做隐藏。
  - Notification Bell 当前在桌面壳层统一展示，不因身份分层在 `T-005` 内做额外差异化。
- 执行约束：
  - P0 范围内不得新增“按套餐隐藏整块 Dashboard 卡片”的设计，除非对应能力在下游页面本身已有正式权限门禁。
  - 家长与管理员的特殊能力应分别落在 `ParentDashboardView` 和 `/admin`，不在学生 Dashboard 首页临时拼接。
  - 若后续产品要做“付费用户专属首页卡”或“教师专属首页卡”，应作为新需求新增，不在当前真实化收口阶段偷带实现。

#### T-005.20 Dashboard 可访问性与移动端适配约束（已完成）
- 移动端布局总原则：
  - Dashboard 在手机端保持单列流式布局，不允许出现需要横向滚动才能看到完整主内容的情况。
  - 模块顺序沿用当前信息优先级，不因移动端重排业务意义：
    - 顶部 KPI
    - 今日任务
    - 学习路径
    - 学科进度
    - 年级排名
    - 最近练习回顾
    - 今日灵感
  - 侧边栏在手机端统一通过抽屉式菜单进入，禁止在主内容区域再复制一套二级导航。
- KPI 与卡片换行策略（`T-005.20.1`）：
  - 顶部 KPI 卡在小屏下允许 `1 列 -> 2 列 -> 4 列` 渐进排布，当前实现的 `grid gap-3 sm:grid-cols-2 2xl:grid-cols-4` 视为基线。
  - KPI 卡内容必须保证数字、标签、副标题在 320px 宽度下不发生裁切；若文案过长，应优先缩短副标题而不是压缩主数值。
  - 学习路径、学科进度、最近练习回顾在手机端保持单列卡片堆叠，不允许把行内信息压成两列导致点击目标过密。
- CTA 最小点击面积：
  - 所有主要按钮和列表行点击目标最小高度按 `44px` 约束；当前 `Button` 默认 `h-10` 略低于理想值时，关键 CTA 应通过 `py-3`、`h-11` 或整行点击补足。
  - 任务列表、学习路径、最近练习回顾这类整行点击项，点击区域必须覆盖整行卡片，不能只让右箭头或局部文字可点。
  - 头部 `7D / 30D` 切换、区块 CTA、移动端菜单按钮必须保留清晰的 hover / focus / active 可视反馈。
- Dialog / Drawer 行为：
  - 当前 Dashboard 内的 onboarding 弹窗继续使用 `Dialog`，不在 P0 额外切成 `Drawer`，但需满足以下约束：
    - 在窄屏下对话框宽度不得超过视口，内容区必须可滚动。
    - `ProfileDialog` 允许使用 `max-h-[90vh] overflow-y-auto` 作为基线。
    - `GoalsDialog`、`AssessmentDialog` 在移动端若内容继续增长，应优先补滚动与内边距，而不是让内容溢出到视口外。
  - 对话框必须始终带 `DialogTitle`，即使视觉上隐藏，也要保留给辅助技术。
  - 若后续某个表单步骤在手机端明显超过 1 屏，应优先改造成分步表单，而不是在现有 Dialog 中继续堆叠。
- 键盘可达性与焦点管理：
  - 侧边栏项、顶部窗口切换、区块 CTA、任务行、学习路径行、最近练习记录行都必须保持原生 `button` 或可聚焦元素语义，不允许改成无语义 `div` 点击。
  - 焦点样式必须保留，当前 `Button` 和分段控件已有 `focus-visible` ring，不得在后续样式调整中去掉。
  - Dialog 打开后焦点应进入对话框，关闭后回到触发元素；若后续自定义弹窗行为，不得破坏 Radix 默认焦点管理。
  - 键盘用户必须可以完成：
    - 切换 `7D / 30D`
    - 打开今日任务中的 onboarding 弹窗
    - 触发区块 CTA 跳转
    - 关闭移动端侧边栏与对话框
- 语义化与辅助技术要求：
  - 所有 Dialog 必须包含 `DialogTitle`，必要时可使用 `sr-only` 隐藏标题文本。
  - 图标按钮必须带可理解的文本或 `sr-only` 标签，不能只保留纯图标。
  - 空态、受限态、错误态文案必须可被读屏顺序读出，不得只依赖背景图、颜色或装饰图标传递状态。
  - `DailyInspiration` 的“换一张”按钮虽为展示增强功能，仍需保留明确按钮文案，不使用无标签图标。
- 移动端壳层约束：
  - 手机端顶部只保留一个菜单触发器，不重复展示桌面通知浮层。
  - 侧边栏遮罩层点击关闭继续保留；但关闭行为不得阻断页面滚动恢复。
  - 试用 Banner、主内容区、底部卡片在小屏下必须按自然文档流堆叠，不允许 `fixed` 覆盖主要 CTA。
- 本轮执行边界：
  - `T-005.20` 先锁定约束，不在本轮额外引入新的 Drawer 组件、手势导航或专门的移动端重设计。
  - 若后续出现真实移动端截断、按钮过小、Dialog 溢出等缺陷，应按本节约束修正实现，不再重新讨论标准。

#### T-005.21 Dashboard 页面级验证与留证模板（已完成）
- 目标：
  - 为 Dashboard 建立固定的最小充分验收模板，后续每次收口都按同一格式留证，避免只跑 lint 或只看页面肉眼结果。
  - 模板覆盖浏览器冒烟、关键字段核账、重复点击/刷新、移动端、控制台错误 5 类必检项。
- 固定验收模板（`T-005.21.1`）：
  - `A. 浏览器冒烟`
    - 打开 `/dashboard`，确认页面可加载且无页面级崩溃。
    - 核对顶部 KPI、今日任务、学习路径、学科进度、年级排名、最近练习回顾、今日灵感均能渲染。
    - 至少覆盖 1 个“有数据用户”和 1 个“空数据用户”样本。
  - `B. 关键字段 SQL / 后台核账`
    - 至少核对：
      - `7D / 30D studyTime`
      - `questions`
      - `accuracy`
      - `activeDays`
      - 当日 `dailyTasks` 类型集合与重复任务情况
    - 至少保留 2 个真实用户样本，且包含 1 个活跃样本。
    - 需要记录“页面值 -> SQL/表值 -> 口径说明”三列映射，不能只贴最终数字。
  - `C. 重复点击 / 刷新 / 幂等`
    - 对今日任务至少验证：
      - `完善个人资料` 可重复打开弹窗且不报错。
      - 领奖按钮重复点击不会重复加 XP。
      - 页面刷新后任务状态与数据库一致。
    - 如当轮涉及新增 CTA，也必须补一次重复点击验证。
  - `D. 移动端截图 / 视口检查`
    - 至少在一个手机视口（基线 `390x844`）打开 `/dashboard`。
    - 核对：
      - 没有横向滚动
      - KPI 与主要卡片不截断
      - 侧边栏菜单可打开/关闭
      - 主要 CTA 不被 Banner、浮层或底部元素遮挡
    - 至少留 1 张截图路径或等价证据。
  - `E. console / runtime error 检查`
    - 打开 Dashboard 后检查浏览器 console / page error。
    - 至少覆盖：
      - 首屏加载
      - 打开一个 onboarding Dialog
      - 执行一个页内刷新动作（如领奖或完成 onboarding）
    - 不允许带着已知红字 console error 进入完成态。
- Dashboard 专项验收清单：
  - `KPI`：核对 7D / 30D 切换只改本地窗口，不触发空白闪烁。
  - `dailyTasks`：核对创建、推进、领奖、刷新后一致性。
  - `learningPath`：核对条目深链正确、空态 CTA 指向 `/dashboard/practice`。
  - `subjectProgress`：核对真实空态与有数据态切换，不出现硬编码学科卡。
  - `leaderboard`：核对 `ready / empty / excluded` 三种状态至少其一，并确认 CTA 去向正确。
  - `recentPractice`：核对至少 1 条记录可按原模式重练。
  - `DailyInspiration`：仅检查渲染、语言切换、深浅色表现，不纳入 SQL 核账。
- 证据格式约束：
  - 每次 Dashboard 收口至少记录：
    - 执行日期
    - 样本用户
    - 浏览器验证范围
    - SQL/数据库核账摘要
    - 是否存在已知残余风险
  - 如果某一项未执行，必须写明“未执行原因 + 当前替代证据”，不能直接省略。
- 本轮已具备的基础留证：
  - 已有浏览器层重复点击回归：连续点击 2 次“完善个人资料”无 `DialogTitle` 报错。
  - 已有多用户 SQL 核账矩阵：`admin@learnmore.com`、`student1@mail.com`。
  - 已有定向代码校验：`pnpm eslint src/actions/gamification/daily-tasks.ts src/actions/dashboard.ts src/components/dashboard/DashboardHome.tsx src/actions/gamification/achievement.ts`
  - 已确认 Dashboard 当前不再保留 `pending` 伪状态与 `dailyActivity` 挂空字段。
- 执行边界：
  - `T-005.21` 负责建立模板，不重复执行一次完整总回归；真正的统一总验收仍归 `T-020 / T-021`。
  - 后续若 Dashboard 再新增模块或跨域联动，必须先把新项加入本模板，再宣告页面收口完成。

#### T-005.22 Dashboard 与共享域边界 / 字段 owner 矩阵（已完成）
- 总原则：
  - Dashboard 是消费层，不是新的业务权威层。
  - 任何已经由共享域定义的字段，Dashboard 只能读取、组合、做展示态分发，不能偷偷在页面层或首页聚合里重写业务口径。
  - 若共享域已有独立页面或独立 action，Dashboard 必须复用其权威字段和状态，而不是再造一份“首页专用口径”。
- 字段 owner 矩阵（`T-005.22.1`）：
| 字段 / 模块 | 权威 owner 域 | 当前 Dashboard 消费入口 | Dashboard 职责边界 |
|---|---|---|---|
| `profile.username / avatar / grade / handle / role` | 用户资料域（`src/actions/user/profile.ts`、`src/actions/user/auth.ts`） | `getDashboardProfile()` | 仅展示与引导补资料；不在首页重算、镜像或缓存另一套资料字段 |
| `settings.language / theme / notification* / studyReminderTime` | 设置域（`user_settings` + `src/actions/user/profile.ts` / settings actions） | `getDashboardProfile()` | 仅消费设置结果影响文案、主题和 onboarding 判断；不在 Dashboard 自己持久化设置 |
| `subscriptionTier / subscriptionStatus / subscriptionEnd` | 订阅 / billing 域 | `DashboardLayout`、`SettingsView` | 仅用于升级入口、试用 Banner、展示文案；不在 Dashboard 判定真正权限能力 |
| `xp / level / nextLevelXp` | 游戏化域（XP 积分规则 + `calculateLevel`） | `getDashboardStats()`、`DashboardLayout` | `xp` 为源字段，`level / nextLevelXp` 仅允许从 XP 派生展示，禁止 Dashboard 自定义等级公式 |
| `streak / lastStudyDate` | 游戏化域（`src/actions/gamification/streak.ts`） | `getDashboardStats()` | 只展示 streak；禁止在 Dashboard 渲染时触发 streak 写入 |
| `dailyTasks / reward claimState / task progress` | 游戏化任务域（`src/actions/gamification/daily-tasks.ts`、`achievement.ts`） | `getDashboardStats()` | 首页只负责展示、触发动作、刷新；任务生成/推进/领奖逻辑不在组件层实现 |
| `leaderboard.rank / percentile / peerAverageAccuracy / userAccuracy` | 排行榜域（leaderboard 聚合口径） | `buildLeaderboardCard()` | 首页只消费周榜摘要卡，不定义独立排行榜算法 |
| `achievements / badges` | 成就域（`src/actions/gamification/achievements.ts` 及相关 badge 逻辑） | 当前 Dashboard 首页不直接消费，仅在壳层 XP 卡与后续 `/dashboard/achievements` 域使用 | 首页不预先复制 badge 明细，不在 Dashboard 自己判发徽章 |
| `studyTime / questions / accuracy / activeDays` | Dashboard 首页统计口径本身，但其底层来源分别归属练习记录、课程进度、活动事件 | `getDashboardStats()` | Dashboard 可聚合展示，但必须复用底层权威表：`exam_records`、`user_attempts`、`user_progress` |
| `learningPath / subjectProgress / weaknesses / recentPractice` | Dashboard 首页聚合层 | `getDashboardStats()` | 这些属于 Dashboard 自有展示聚合，可在首页定义合同，但不得越权改写下游练习结果原始数据 |
- 共享域边界说明：
  - `profile / settings`
    - Dashboard 只负责把资料缺失转成空态、任务或 CTA。
    - 真正的资料保存、handle 校验、语言主题切换都归资料/设置域。
  - `gamification`
    - `xp / streak / dailyTasks / badges` 的写入触发与规则都归游戏化域。
    - Dashboard 只能调用公开 action，不得在组件里直接拼写 XP、连击、任务状态更新逻辑。
  - `leaderboard`
    - Dashboard 首页只展示摘要卡。
    - 排名算法、榜单周期、cohort 归属属于排行榜域；首页卡不得再定义“首页版排行榜逻辑”。
  - `practice / courses`
    - Dashboard 的 `studyTime / recentPractice / activeDays / learningPath / subjectProgress` 依赖练习和课程产出的事实数据。
    - 首页可以做聚合，但不负责补写事实表，也不负责为练习/课程流程兜底生成假记录。
- Dashboard 允许拥有的职责：
  - 汇总多个共享域的只读结果，形成首页摘要。
  - 把共享域状态翻译成首页空态、受限态、CTA。
  - 定义首页专属的展示合同，例如 `learningPath.items[]`、`subjectProgress.items[]` 这种聚合输出结构。
- Dashboard 不允许拥有的职责：
  - 不重算 `streak`。
  - 不重算 `xp` 规则。
  - 不保存 `profile/settings`。
  - 不单独定义排行榜排名算法。
  - 不在组件层直接改 `dailyTasks` 数据库状态。
  - 不为无数据模块伪造默认成功值掩盖上游缺失。
- 当前实现与边界对齐情况：
  - `getDashboardProfile()` 已作为首页资料读取入口，复用用户域字段。
  - `getDashboardStats()` 当前只读 `user.xp / user.streak` 并基于权威字段派生展示值，没有再写回。
  - `checkAndRefreshStreak()` 已移出 Dashboard 首屏读取链路，避免首页越权改写游戏化状态。
  - `updateProfile()` 等资料写链路继续在用户域内完成，并通过 `revalidatePath('/dashboard')` 回流，不让 Dashboard 自己持久化资料。
  - `leaderboard` 首页卡当前由 `buildLeaderboardCard()` 聚合摘要，未在组件层重复计算排名。
- 执行约束：
  - 后续如果某字段已经在 `T-016 / T-017 / T-018` 等共享域任务中被定义，Dashboard 必须直接消费其输出或复用同一口径。
  - 若需要改字段口径，应优先改 owner 域，再由 Dashboard 跟进消费；不能只在首页偷偷改一版。
  - 任何“为了首页好看先补一个默认值”的做法，都视为越权，除非该字段已在本任务文档中明确标记为“展示增强模块”。

## 页面族统一拆分模板（适用于 T-006 ~ T-019）
> 除 Dashboard 外，其余页面族任务默认按同一模板继续拆分，避免每个页面重新发明一套流程。

| 子任务后缀 | 固定含义 |
|---|---|
| `.1` | 盘点路由、页面、组件、CTA、当前数据源 |
| `.2` | 建立字段映射与真实数据源矩阵 |
| `.3` | 读接口 / Server Action / 聚合逻辑对齐 |
| `.4` | 写接口 / 提交动作 / 权限与幂等对齐 |
| `.5` | 清理 mock / fallback / 假成功，并补空态、错误态、禁用态 |
| `.6` | 本页面族验证：页面冒烟、字段核账、重复提交/刷新验证 |

## 页面族任务范围说明
| task | 页面族范围 | 备注 |
|---|---|---|
| T-006 | `/dashboard/courses`、`/course/[subjectId]`、`/course/[subjectId]/[lessonId]` | 将用户内容、学习进度、章节/课程口径统一 |
| T-007 | `/dashboard/practice`、`/dashboard/practice/smart-drill`、`/dashboard/practice/error-wiper`、`/dashboard/practice/mock-arena`、`/dashboard/practice/mock-arena/[examId]`、`/dashboard/practice/chapter-drill/[chapterId]`、`/dashboard/practice/past-paper/[paperId]` | 练习域作为一个整体推进，不拆散模式口径 |
| T-008 | `/dashboard/community`、`/dashboard/community/new`、`/dashboard/community/[postId]` | 列表、详情、发帖、评论必须一起打通 |
| T-009 | `/admin` | Admin 首页聚合与公共管理能力一起处理 |
| T-010 | `/admin/users`、`/admin/users/[id]` | 用户列表、详情、动作闭环 |
| T-011 | `/admin/feedback`、`/admin/feedback/[id]` | 反馈列表、详情、处理状态闭环 |
| T-012 | `/admin/referrals`、`/admin/vouchers` | 推荐、增长、券码能力一起核账 |
| T-013 | `/admin/content`、`/admin/content/import` | 内容导入入口与父入口统一处理 |
| T-014 | `/admin/content/review`、`/admin/content/review/[questionId]` | 审核列表与单题审核页一起推进 |
| T-015 | `/admin/content/reports`、`/admin/content/statistics` | 质控报错与统计域一起推进 |
| T-016 | `/dashboard/leaderboard` | 榜单、我的排名、周期切换、衍生卡片一起处理 |
| T-017 | `/dashboard/achievements` | 成就、XP、等级、任务、streak 口径统一 |
| T-018 | `/dashboard/settings`、右上角通知弹层 | 设置与通知偏好统一真实化，`/dashboard/settings/notifications` 保持 404 |
| T-019 | 登录、注册、公开页 CTA、联系/帮助/博客等表单与跳转 | 用于承接旧版“Public / Marketing / Auth”范围 |

## 页面族展开清单（用于开发前对齐颗粒度）
### T-006 学习内容域
| id | description | owner | status |
|---|---|---|---|
| T-006.1 | 盘点 `/dashboard/courses`、`/course/[subjectId]`、`/course/[subjectId]/[lessonId]` 的路由、页面、组件、CTA、跳转与当前数据源 | codex | todo |
| T-006.2 | 建立课程列表、章节树、课时详情、用户进度、恢复学习入口的字段映射与权威数据源矩阵 | codex | todo |
| T-006.3 | 对齐课程读取链路：学科、章节、课时、进度聚合、最近学习恢复点与排序口径 | codex | todo |
| T-006.4 | 对齐课程写链路：课时进度保存、完成判定、任务推进、streak/studyTime 触发与幂等 | codex | todo |
| T-006.5 | 清理 `mockUserContent`、静态预览内容、假完成态与假恢复点，补齐空态/权限态/禁用态 | codex | todo |
| T-006.6 | 完成学习内容域验证：页面冒烟、进度字段核账、重复保存/刷新验证 | codex | todo |

### T-007 练习域
> 前置说明：以下 4 条“规则固化”任务属于 `T-007.3 / T-007.4` 的前置门槛。  
> 未明确落定前，不应继续推进相关读取、筛题、写链路与统计口径实现。

| id | description | owner | status |
|---|---|---|---|
| T-007.1 | 盘点 `/dashboard/practice` 全路由族及各模式入口、结果页、记录页、CTA、当前数据源 | codex | done |
| T-007.2 | 建立题源、会话、提交结果、统计、薄弱点、配额、推荐卡片的字段映射与权威数据源矩阵 | codex | done |
| T-007.2A | 固化章节层级规则：正式启用 `chapters.parent_id`，并明确其表达“知识树关系”而非页面视觉结构 | codex | done |
| T-007.2B | 固化章节消费规则：`questions.chapterId` 只挂叶子章节；Practice 默认只消费叶子章节；父章节只用于聚合、路径与管理 | codex | done |
| T-007.2C | 固化题池隔离规则：`isPastPaper = true` 的题只进入 `Past Paper`，与 `Smart Drill / Chapter Drill / Mock Arena` 彻底隔离 | codex | done |
| T-007.2D | 固化 Error Wiper 业务定义：Error Wiper 不是独立题库池，而是基于 `user_attempts` 聚合的错题修复视图 | codex | done |
| T-007.3 | 对齐练习读取链路：拉题、筛题、推荐、记录列表、统计聚合、薄弱点/掌握度来源 | codex | done |
| T-007.4 | 对齐练习写链路：开始会话、提交答案、提交整卷、写 `exam_records` / `user_attempts`、配额、幂等与重复提交 | codex | done |
| T-007.5 | 清理 Smart Drill / Chapter Drill / Mock Arena / Past Paper / Error Wiper 中的 mock/preview-only 正式展示与假成功 | codex | todo |
| T-007.6 | 完成练习域验证：题源真实性、结果页回放、字段核账、重复提交/刷新验证 | codex | todo |

### T-008 社区域
| id | description | owner | status |
|---|---|---|---|
| T-008.1 | 盘点 `/dashboard/community`、`/dashboard/community/new`、`/dashboard/community/[postId]` 的页面、组件、CTA 与当前数据源 | codex | done |
| T-008.2 | 建立帖子列表、帖子详情、评论、点赞、筛选、作者信息的字段映射与权威数据源矩阵 | codex | done |
| T-008.3 | 对齐社区读取链路：列表、详情、评论流、计数、排序、权限与可见性规则 | codex | done |
| T-008.4 | 对齐社区写链路：发帖、评论、点赞、解决状态、越权拦截、重复提交幂等 | codex | done |
| T-008.5 | 清理假帖子、假评论、假计数、伪成功提示，补齐空态/错误态/未登录态，并将发帖页“是否原创”替换为显式帖子类型选择（提问帖/笔记帖/成就分享/讨论帖） | codex | done |
| T-008.6 | 完成社区域验证：读写立即可见、字段核账、重复提交/刷新验证 | codex | done |
| T-008.7 | 对齐社区页面级交互：搜索、排序、板块切换、未解答筛选、分页、URL 回写与空态 / 错误态联动 | codex | done |
| T-008.8 | 对齐社区副作用与一致性：发帖徽章奖励、评论通知、点赞计数、缓存刷新与权限边界核账 | codex | done |
| T-008.9 | 实施社区展示增强真实功能：自习室仅保留 UI 占位不接 MVP 实现，活跃贡献者、热门话题、收藏、分享、AI hint 全部接真实数据或真实交互 | codex | done |
| T-008.10 | 完成社区域最终验证：真实数据展示、增强模块核账、读写链路一致性、重复提交与刷新回归 | codex | done |

### T-008.1 盘点结果（已完成）
- 路由与页面：
  - 社区域主路由是 `/dashboard/community`，新帖入口是 `/dashboard/community/new`，帖子详情页是 `/dashboard/community/[postId]`。
  - 三个页面都包在 `CommunityClientWrapper` 里，由 `DashboardLayout` 承接统一的 dashboard shell。
  - `loading.tsx` 已为 `community` 变体预留路由级 loading 壳。

- 页面组件：
  - 列表页主组件是 `CommunityView`，负责首页 feed、筛选、搜索、排序、板块切换和右侧辅助栏。
  - 新帖页主组件是 `NewPostPageClient`，负责标题、板块、标签、正文与发布动作。
  - 帖子详情页主组件是 `PostDetailClient`，负责帖子正文、点赞、评论与详情页交互。

- 当前数据源：
  - 列表页首屏通过 `getCachedCommunityCategories()` + `getCachedCommunityFeed({ page: 1, limit: 20 })` 获取。
  - 新帖页板块选项通过 `getCachedCommunityCategories()` 获取。
  - 详情页通过 `getPostById(postId)` 获取帖子、作者、评论与点赞信息。
  - `CommunityView` 还会通过 `/api/community/feed?page=1&limit=20` 做客户端再拉取。

- CTA 与交互入口：
  - 列表页包含搜索框、`New Post` / `发帖子` CTA、筛选分段、排序下拉、板块切换、未解答筛选和帖子卡片跳转。
  - 详情页包含返回社区、点赞、评论提交和回到列表的导航。
  - 新帖页包含取消、发布、板块选择、标签输入和正文编辑。

- 侧边与导航：
  - 社区入口同时出现在 dashboard 顶部导航、移动端底部栏和 AppSidebar。
  - 右侧辅助栏包含实时自习室、全部内容、活跃贡献者和热门话题等模块，当前有部分真实数据与部分展示增强混合存在。

- 当前代码结论：
  - 社区域已经有完整的路由、页面和基础读写 action。
  - 真正未收口的部分主要集中在页面级交互、写链路副作用、展示增强真实化与最终验证。

- 收口记录：
  - `T-008.1` 已完成并收口，社区域路由、页面、组件、CTA 与当前数据源已完成盘点，为后续字段矩阵与读写链路对齐提供基线。

### T-008.2 字段映射与权威数据源矩阵（已完成）
- 帖子列表字段：
  - `post.id`：帖子卡片与详情页路由主键。
  - `post.title`：列表主标题、详情页标题、通知与分享文案标题。
  - `post.content`：列表摘要、详情正文、评论上下文。
  - `post.category`：帖子类型标签，当前语义包含 `Question / Note / Achievement` 等。
  - `post.tags`：帖子标签列表，用于检索、聚合与展示。
  - `post.createdAt`：列表时间、详情时间、排序口径。
  - `post.subject.id / name / icon`：板块信息、筛选条件与右侧板块导航来源。
  - `post.author.id / username / avatar / role`：作者信息与权限可见性展示。
  - `post._count.comments / likes`：评论计数、点赞计数、列表卡互动展示。
  - `post.likeCount / userLiked`：点赞交互状态回显与乐观更新基础。

- 帖子详情字段：
  - `post.comments[]`：评论流时间线，按创建时间升序展示。
  - `comment.id / content / createdAt`：评论主体、时间与唯一标识。
  - `comment.author.id / username / avatar / role`：评论作者信息。
  - `post.userLiked`：详情页点赞按钮状态。
  - `post.likeCount`：详情页点赞总数。

- 评论字段：
  - `comment.content`：评论正文。
  - `comment.author`：评论者上下文。
  - `comment.createdAt`：评论时间。
  - 评论写入后必须能在详情页即时回流。

- 点赞字段：
  - `postLike.userId / postId`：点赞关系主键。
  - `post.likeCount`：前台展示与数据库计数一致。
  - `userLiked`：当前用户是否已点赞，用于按钮状态切换。

- 筛选字段：
  - `subjectId`：板块筛选与列表聚合维度。
  - `category`：按类型筛选。
  - `unanswered`：待解答筛选，等同于 `isSolved = false && category = 'Question'`。
  - `search`：帖子标题、内容、作者、板块、标签的模糊搜索。
  - `page / limit`：分页与首屏加载参数。

- 作者与权限口径：
  - 作者信息由 `author` relation 统一提供。
  - 详情页、列表页与评论流必须复用同一套作者字段，不得各自拼接不同口径。
  - 登录态由 `getCurrentUser()` / `getDashboardShellProfile()` 决定可写权限。

- 权威数据源：
  - 列表与分页：`getPosts`
  - 板块下拉：`getCategories`
  - 详情页：`getPostById`
  - 发帖：`createPost`
  - 评论：`createComment`
  - 点赞：`toggleLike`
  - 列表缓存：`getCachedCommunityFeed`
  - 板块缓存：`getCachedCommunityCategories`

- 收口记录：
  - `T-008.2` 已完成并收口，帖子列表、帖子详情、评论、点赞、筛选与作者信息的字段映射与权威数据源矩阵已统一，为后续读取链路和写链路对齐提供基线。

### T-008.3 读取链路对齐（已完成）
- 列表读取：
  - 社区列表页的首屏读取已统一走 `getCachedCommunityCategories()` + `getCachedCommunityFeed(...)`。
  - `getPosts(...)` 现在接受 `subjectId / category / unanswered / search / page / limit / sort`，前后端共享同一份查询入口。
  - `/api/community/feed` 也同步支持相同的查询参数，保证列表页、刷新、以及后续局部重拉都走同一套读接口。

- 详情读取：
  - 帖子详情页通过 `getPostById(postId)` 读取帖子主体、作者、评论、点赞状态与点赞计数。
  - 详情页读取后直接回填 `PostDetailClient`，不再依赖额外的伪装数据层。

- 评论流与计数：
  - 评论按创建时间升序读取并回显，详情页评论流和列表评论数保持一致。
  - 点赞总数、评论总数都以数据库聚合值为准，前端只做展示与乐观状态回显。

- 排序与筛选：
  - 列表读取口径已支持 `recent-posts / recent-replies / most-comments` 三种排序。
  - 板块、未解答、搜索等过滤条件现在都能在读接口中表达，不再只依赖前端本地筛选。

- 权限与可见性：
  - 社区页本身仍要求登录态，未登录会被 dashboard shell 直接拦截到 `/login`。
  - 社区 feed API 也要求用户身份，可避免匿名直接拉取社区内容。
  - 当前数据模型没有额外的帖子私有可见性字段，因此社区读取按“登录后可见”的统一规则执行。

- 收口记录：
  - `T-008.3` 已完成并收口，社区域的列表、详情、评论流、计数、排序与权限/可见性规则已统一到同一套读取链路。

### T-008.4 写链路对齐（已完成）
- 发帖：
  - `createPost(...)` 现在会对作者、标题、正文、分类、科目和标签做 2 分钟去重。
  - 命中重复提交时直接复用最近一次帖子，不再重复写入数据库。
  - 正常创建后会刷新社区 feed 与板块统计缓存，并继续发放社区徽章奖励。

- 评论：
  - `createComment(...)` 现在会对作者、帖子和评论正文做 2 分钟去重。
  - 命中重复提交时直接复用最近一次评论，不再重复写入数据库。
  - 正常创建后仍会触发评论通知、徽章奖励和社区缓存刷新。

- 点赞：
  - `toggleLike(...)` 继续保持单用户单帖幂等。
  - 点赞与取消点赞都会同步刷新社区 feed 与板块统计缓存，确保列表和详情页回显一致。

- 解决状态：
  - 新增 `setPostSolved(...)`，只允许帖子作者、`TEACHER` 或 `ADMIN` 修改 `Question` 帖子的已解决状态。
  - 重复提交同一状态会直接幂等返回，不再重复写库。
  - 状态切换后会刷新社区 feed 与板块统计缓存，让列表筛选和详情回显同步。

- 越权拦截：
  - 未登录用户无法进入写链路。
  - 非作者且非 `TEACHER` / `ADMIN` 的用户无法修改已解决状态。

- 收口记录：
  - `T-008.4` 已完成并收口，社区写链路的发帖、评论、点赞、解决状态、越权拦截与重复提交幂等都已统一为真实写入路径。

### T-008.5 发帖类型与占位清理（已完成）
- 发帖类型：
  - 发帖页将原来的“是否原创且独家”替换成显式 `帖子类型` 选择。
  - 当前提供 4 种类型：`提问帖`、`笔记帖`、`成就分享`、`讨论帖`。
  - 提交时分别映射到内部 `Question`、`Note`、`Achievement`、`Discussion` 分类。
  - `Question` 类型继续承接后续“已解决”状态能力，其余类型只负责内容表达，不强制附带状态按钮。

- UI 与语义收口：
  - 删除“原创/否”这种会误导分类语义的开关。
  - `仅自己可见`、`附件`、`提及用户` 已并入发帖页并接入真实提交链路：私密可见性会落库，附件会上传并保存图片 URL，提及用户会解析用户名并同步创建站内通知。
  - 发帖说明文案同步改为围绕“帖子类型 + 板块 + 标签 + 正文”的组合表达。

- 文案与展示：
  - 列表和详情页需要正确展示 `Note`、`Discussion` 等帖子类型，不再笼统显示“原创”。
  - `Question` 帖子在列表与详情页继续保留“提问 / 已解决”状态展示。
  - 正文编辑区的 Markdown 快捷工具栏已恢复为可用插入动作，附件与提及入口也已并入编辑器工具栏，不再单独占用一张卡片。
  - `仅自己可见` 现在直接写入帖子可见性字段，并在读链路中按作者 / 管理员 / 教师权限过滤。
  - 私密帖在社区列表、详情、评论和点赞写链路中都已按权限过滤；公开帖的提及通知会在帖子创建时同步落库，避免依赖延迟任务导致的浏览器核账漂移。

- 收口说明：
  - `T-008.5` 现在已经完成收口，核心发帖链路已经从“是否原创”迁移到显式帖子类型，并把 `仅自己可见`、`附件`、`提及用户`、Markdown 快捷插入、标签、评论落库、私密帖可见性全部接到真实链路。
  - 右侧栏里的 `rooms / contributors / topics` 不属于本子任务，继续归到 `T-008.9` 的展示增强真实功能。
  - 目前留在 `T-008.5` 文案里的“假帖子 / 假评论 / 假计数 / 伪成功提示 / 空态错误态”，指的是发帖页与主社区链路中不能再出现只会展示不会落库的假数据态；这部分已随本轮实现收口完成。
  - 本轮浏览器回归已确认：帖子类型切换、仅自己可见、附件上传、提及通知、评论落库与私密帖可见性都能真实工作。
  - 本轮还确认了正文 Markdown 快捷插入和帖子标签落库都已接通真实链路。

### T-008.6 社区域验证（已完成）
- 浏览器验证：
  - 登录后进入 `/dashboard/community`，列表、收藏、分享、详情与评论入口均可正常打开。
  - 分享按钮可将帖子链接复制到剪贴板，粘贴后能直接打开对应帖子。
  - 收藏按钮点击后会立即更新按钮状态与计数，刷新后依然保持一致。
  - 详情页评论提交后会立即显示，重复提交相同内容会命中去重，不会重复落库。

- 字段核账：
  - 评论内容会落到 `comments` 表，并与页面回显一致。
  - 收藏会落到 `post_bookmarks` 表，并与列表页总收藏数一致。
  - 重复提交后的评论不会新增第二条记录。

- 收口说明：
  - `T-008.6` 已完成社区域最终验证，读写立即可见、字段核账、重复提交与刷新回归均已通过。

- `T-008.7` 至 `T-008.10` 用于补齐社区页当前已出现但尚未完成收口的真实交互、真实副作用、展示增强与最终验证。
- 其中自习室当前仅保留 UI 占位，不作为本轮 MVP 实现；活跃贡献者、热门话题、收藏、分享、AI hint 现在统一视为真实功能开发项，不再按纯展示壳处理。

### T-008.7 页面级交互（已完成）
- 社区页首屏已支持从 URL 读取并回写 `search / sort / scope / board / subjectId / tab / page`，用户切换搜索、排序、板块和未解答筛选时，地址栏会同步更新。
- 空态与错误态已经联动：无结果时展示空态，接口异常时展示加载失败卡片并提供重试入口。
- 浏览器回归已验证：
  - 搜索后地址栏带上 `search`，空态可见。
  - 清除搜索后 URL 回到无搜索参数的状态。
  - 排序和板块切换会更新 URL。
  - 直接访问 `?page=2` 可正常解析并渲染空态。
  - 触发异常搜索可展示错误态。
- 当前社区数据量下 `page=1` 已覆盖全部结果，所以页面未展示分页按钮，但路由分页和页面级分页参数已经可用。

### T-008.8 社区域副作用与一致性（已完成）
- 发帖徽章奖励：
  - `createPost(...)` 在正常创建后仍会调用 `awardBadgeIfEligible(user.id, 'COMMUNITY')`。
  - 数据库核账确认 `admin_ui_test@learnmore.com` 已获得 `community_helper_10` 徽章，且对应的 `ACHIEVEMENT` 通知已存在。

- 评论通知：
  - `createComment(...)` 会同步触发站内 `SOCIAL` 通知；邮件保持异步发送，不阻断主写链路。
  - 提及用户也会同步创建站内通知，避免只依赖延迟任务回流。

- 点赞计数与缓存刷新：
  - 点赞与取消点赞都会更新 `post.likeCount`，列表与详情页统一读这个标量计数。
  - 发帖、评论、点赞、收藏、解决状态变更都会刷新 `/dashboard/community`、详情页以及 `community-feed / community-categories` 缓存标签。

- 权限边界：
  - 未登录用户无法进入社区读写链路。
  - 新注册普通用户访问私密帖子 `e17fff81-f96f-45ac-974b-90e81cf8bc2a` 时，会看到“帖子不存在或已删除”，不会泄漏私密内容。
  - `setPostSolved(...)` 仍只允许帖子作者、`TEACHER`、`ADMIN` 修改 `Question` 帖子的已解决状态。

- 浏览器验证：
  - 收藏按钮刷新后状态与计数保持一致。
  - 分享按钮可复制真实帖子 URL 到剪贴板。
  - 点赞后刷新仍保持切换结果。
  - 评论提交后刷新仍保留，重复评论不会新增第二条记录。

- 收口说明：
  - `T-008.8` 已完成，社区域的徽章、通知、点赞计数、缓存刷新与权限边界已统一到真实数据与真实副作用路径。

### T-008.9 社区展示增强真实功能（已完成）
- 自习室占位：
  - 社区右侧栏的实时自习室仍保留 UI 占位，不作为本轮 MVP 的真实房间系统。
  - 当前展示仅用于承接页面结构与视觉层级，房间列表仍是静态占位内容。

- 活跃贡献者与热门话题：
  - 活跃贡献者由当前社区帖子聚合派生，基于发帖量、评论量与互动分值排序。
  - 热门话题由当前帖子标签聚合派生，可直接作为搜索入口。
  - 浏览器回归确认右侧栏已能看到贡献者徽章与标签聚合结果，例如 `#qa`、`#browser` 等。

- 帖子附件预览：
  - 帖子卡片里的图片预览保持原始顺序展示。
  - 图片点击后直接进入对应帖子详情，不再打开原图链接。

- 收藏、分享、AI hint：
  - 收藏保持真实写链路并可刷新回显。
  - 分享按钮会复制帖子真实链接到剪贴板，并给出“已复制分享链接”提示。
  - AI hint 会调用服务端生成提示，并把结果以内联面板渲染在帖子卡片下方。
  - 浏览器回归确认 AI hint 面板可见，且按钮加载与结果展示正常。

- 收口说明：
  - `T-008.9` 已完成收口，右侧栏的展示增强与帖子卡片交互现在已统一为真实数据或真实交互；其中自习室仍明确保留为 UI 占位，不纳入 MVP 真实功能。

### T-008.10 社区域最终验证（已完成）
- 真实数据展示：
  - 社区页首屏可稳定读取真实帖子数据，不再依赖 mock。
  - 页面右侧栏的活跃贡献者、热门话题、自习室占位与帖子卡片内容都能正常渲染。
  - 浏览器核验可见派生标签与贡献者徽章，例如 `#qa`、`#browser`、`活跃发起人`、`高互动作者`、`答疑参与者`。

- 增强模块核账：
  - 自习室仍为 UI 占位，不作为本轮 MVP 真实房间系统。
  - 热门话题由当前帖子标签聚合派生。
  - 活跃贡献者由当前帖子互动分值派生。
  - AI hint 按帖子触发并以内联面板展示。

- 读写链路一致性：
  - 收藏按钮点击后会真实切换并刷新后保持一致。
  - 分享按钮会复制真实帖子 URL 到剪贴板。
  - 附件缩略图点击会进入帖子详情页，不再打开原图链接。
  - 点赞、评论与刷新后的回显保持一致。

- 重复提交与刷新回归：
  - 评论重复提交不会新增第二条记录。
  - 评论刷新后仍保留。
  - 点赞刷新后仍保留切换状态。
  - 收藏刷新后仍保留切换状态。

- 浏览器验证结果：
  - `hasContributorBadge = true`
  - `hasTopicTag = true`
  - `hasRooms = true`
  - `aiButtons = 12`
  - `bookmarkBefore = 1`, `bookmarkAfterClick = 0`, `bookmarkAfterReload = 0`
  - `clipboardText` 为真实帖子 URL
  - `attachmentHref` 与 `detailUrlAfterAttachmentClick` 都指向帖子详情页
  - `likeBefore = 点赞(0)`, `likeAfterClick = 已点赞(1)`, `likeAfterReload = 已点赞(1)`
  - `commentCountBeforeReload = 1`, `commentCountAfterReload = 1`
  - `duplicateCommentVisibleCount = 1`
  - `aiHintTextLength = 9`

- 收口说明：
  - `T-008.10` 已完成社区域最终验证，真实数据展示、增强模块核账、读写链路一致性、重复提交与刷新回归均已确认通过。

### T-009 Admin 首页与公共管理域
#### Phase A：边界与约束
| id | description | owner | status |
|---|---|---|---|
| T-009.1 | 盘点 `/admin` 首页的模块、统计卡、风险区、待办区、审计区、当前数据源、mock 占位和缓存入口 | codex | done |
| T-009.2 | 定义 `/admin` 首屏 `workQueue` / `risks` / `audits` / KPI 的字段口径、权威数据源与展示规则，明确今日必须处理、最近告警、最近操作审计分别展示什么 | codex | done |
| T-009.3 | 建立角色权限矩阵与前端展示区块，覆盖 `ADMIN` / `TEACHER` / `PARENT` / `STUDENT` 的可见、可进入、可操作、可写入、可审计范围，并同步到首屏展示规则 | codex | done |

#### Phase B：开发、修复、调试
| id | description | owner | status |
|---|---|---|---|
| T-009.4 | 对齐 `/admin` 首页读取链路，替换 `workQueue` / `risks` / `audits` / KPI 的真实数据源，并核验卡片展示、列表排序、跳转目标与后端返回一致 | codex | done |
| T-009.5 | 对齐公共管理写链路的权限、幂等、审计，补齐首屏相关写动作的真实副作用闭环；用户权限提权、覆写、恢复等动作归入 `T-010` | codex | done |
| T-009.6 | 补缓存失效与刷新闭环，明确写后 `revalidatePath`、缓存 tag 失效、局部刷新、进页刷新与返回首页后的数据回流边界 | codex | done |
| T-009.7 | 补审计留痕、角色边界和高风险操作确认，保证 `audits` 与安全/权限事件口径一致，且关键动作有操作者、目标、前后值、原因与时间 | codex | done |

#### Phase C：清理和收口验证
| id | description | owner | status |
|---|---|---|---|
| T-009.8 | 清理假统计、假待办、假风险提示、假审计、假回执与死链，补齐 `forbidden` / `error` / `empty` 状态，完成 `/admin` mock 数据清退 | codex | done |
| T-009.9 | 完成 `/admin` 首页域验证：`workQueue` / `risks` / `audits` 角色隔离、字段核账、周期切换核账、重复操作验证、刷新后仍为真实数据 | codex | done |

### T-009 说明性内容
#### T-009.1 盘点结果摘要
- 路由入口：`/admin`
- 页面文件：`src/app/(dashboard)/admin/page.tsx`
- 主体渲染：`src/components/admin/dashboard/v2/AdminDashboardV2.tsx`
- 缓存入口：`getCachedAdminDashboardOverview(initialWindow)`，缓存 tag 为 `admin-dashboard-overview`
- 角色门禁：仅 `ADMIN` / `TEACHER` 可进入，`PARENT` / `STUDENT` 直接重定向到 `/dashboard`
- 当前首页主模块只有四块：
  - `KPI`
  - `workQueue`
  - `risks`
  - `audits`
- 当前首页真正有用的跳转只有：
  - `workQueue` -> `/admin/content/reports`
  - `workQueue` -> `/admin/feedback`
- 当前首页风险与审计跳转已替换为有效后台页，不再依赖 `/admin/permissions`
- 首页不再包含独立 quick actions 合同，内容审核 / 用户管理 / 权限配置 / 学员反馈 / 优惠券管理均由各自路由域承接

#### T-009.2 首屏字段口径与权威数据源矩阵
##### 总体口径
| 模块 | 核心目的 | 是否必须真实数据 | 是否允许 mock | 备注 |
|---|---|---|---|---|
| KPI | 展示管理台当前窗口内的业务规模、推进效率与风险压力 | 是 | 否 | 只允许来自真实聚合或真实表 |
| workQueue | 展示今日必须处理的待办事项 | 是 | 否 | 必须按 SLA 排序，卡片可点击进入处理页 |
| risks | 展示最近告警与安全/权限敏感事件 | 是 | 否 | 仅 ADMIN 可见，必须能回溯到安全日志 |
| audits | 展示最近操作审计 | 是 | 否 | 只展示真实审计记录，不允许静态说明替代 |

##### 不纳入首页合同的数据
- 内容审核
- 用户管理
- 权限配置
- 学员反馈
- 优惠券管理

##### KPI 字段口径
| KPI id | 展示文案 | 权威数据源 | 复算规则 | 空态规则 |
|---|---|---|---|---|
| `kpi-active-users` | 活跃用户 | `users.lastSignInAt` | 按当前窗口统计最近活跃用户数 | 无数据时显示 `0` |
| `kpi-paid-users` | 付费用户 | `users.subscriptionTier` | 按付费订阅类型统计总量与窗口增量 | 无数据时显示 `0` |
| `kpi-completion` | 课程完成率 | `userProgress.isCompleted` | 按窗口内更新的课程进度计算完成率 | 无数据时显示 `0.0%` |
| `kpi-tickets` | 待处理工单 | `userFeedback`, `questionReport` | 统计当前待处理反馈与待审核报错的合计与增量 | 无数据时显示 `0` |
| `kpi-system-errors` | 系统异常 | `securityLog` | 统计风险动作数量与高风险事件数量 | 无数据时显示 `0` |

##### workQueue 字段口径
| 队列类型 | 展示标题 | 权威数据源 | 排序规则 | 点击跳转 | 空态规则 |
|---|---|---|---|---|---|
| 内容报错待审核 | `内容问题待审核: ${issueType}` | `questionReport` | 按截止时间升序，超时优先 | `/admin/content/reports` | 无待办时展示“当前没有积压事项” |
| 用户反馈待处理 | `用户反馈待处理: ${title}` | `userFeedback` | 按截止时间升序，超时优先 | `/admin/feedback` | 无待办时展示“当前没有积压事项” |

##### risks 字段口径
| 风险类型 | 展示字段 | 权威数据源 | 进入条件 | 点击跳转 | 角色可见性 | 空态规则 |
|---|---|---|---|---|---|---|
| 安全/权限告警 | `title`, `level`, `time`, `source`, `href` | `securityLog` | `RISK_ACTIONS` 集合内的事件 | `/admin/users/[id]?tab=audit` | 仅 `ADMIN` | 无告警时展示“当前没有新增告警” |

##### audits 字段口径
| 审计项 | 展示字段 | 权威数据源 | 进入条件 | 点击跳转 | 角色可见性 | 空态规则 |
|---|---|---|---|---|---|---|
| 操作审计 | `actor`, `action`, `target`, `time`, `level`, `href`, `visibleTo` | `securityLog` | 近期开启时间范围内的安全日志 | `/admin/users` | `ADMIN` / `TEACHER`，敏感动作仅 `ADMIN` | 无审计时展示“当前时间范围内暂无审计记录” |

##### 角色可见性矩阵
| 模块 | ADMIN | TEACHER | PARENT | STUDENT |
|---|---|---|---|---|
| 路由进入 | 可进入 | 可进入 | 不可进入 | 不可进入 |
| KPI | 可见 | 可见 | 不可进入 | 不可进入 |
| workQueue | 可见 | 可见 | 不可进入 | 不可进入 |
| risks | 可见 | 不展示，显示占位 | 不可进入 | 不可进入 |
| audits | 可见 | 可见 | 不可进入 | 不可进入 |

##### 后续实现约束
- 所有 `workQueue`、`risks`、`audits` 和 KPI 卡片必须来自真实数据，不允许前端静态数组兜底。
- `workQueue` 只承接“今日必须处理”的事项，不混入其他后台路由功能入口。
- `risks` 和 `audits` 只展示真实 `securityLog` 派生内容，不允许用静态说明文案替代数据。
- 首页跳转必须指向现有后台页，不再允许 `/admin/permissions` 作为任何首页目标。

#### T-009.3 角色权限矩阵与前端展示规则
- 路由门禁：
  - `ADMIN` 和 `TEACHER` 可以进入 `/admin`
  - `PARENT` 和 `STUDENT` 不进入 `/admin`，直接重定向到 `/dashboard`
- 前端展示规则：
  - `ADMIN` 显示完整首页：`KPI`、`workQueue`、`risks`、`audits`
  - `TEACHER` 显示首页主线：`KPI`、`workQueue`、`audits`
  - `TEACHER` 不展示 `risks`，改为占位说明，不应出现可点击告警卡
  - `PARENT` / `STUDENT` 不展示任何 `/admin` 首页模块
- 可操作范围：
  - `ADMIN` 可点击处理队列、风险项、审计项
  - `TEACHER` 仅可点击工作队列与审计项
  - `PARENT` / `STUDENT` 无操作入口
- 可写入范围：
  - 本阶段 `/admin` 首页不承担写动作，只负责展示与跳转
  - 真正的写动作归入对应业务页或 `T-010 ~ T-015`
- 可审计范围：
  - `ADMIN` 可看到完整审计信息
  - `TEACHER` 仅看到当前权限范围内的审计摘要
  - 敏感审计必须保持角色过滤，不得通过隐藏样式规避

- 收口说明：
  - `T-009.1`、`T-009.2`、`T-009.3` 已完成收口，`/admin` 首页的盘点、字段口径与角色矩阵已经定稿。
  - 后续 `T-009.4` 开始进入真实链路接入与校验，不再修改上述边界定义。

#### T-009.4 首页读取链路对齐进展
- 首页读取链路继续沿用 `getAdminDashboardOverview(window)` -> `buildAdminDashboardOverview(window)`，不新增前端静态兜底数组。
- `workQueue` 继续只消费真实待处理项：
  - 内容报错待审核 -> `/admin/content/reports`
  - 用户反馈待处理 -> `/admin/feedback`
- `risks` 已对齐到真实风险日志，并将点击目标收口到现有用户详情审计视图：
  - 风险卡跳转到 `/admin/users/[id]?tab=audit`
  - 仅 `ADMIN` 可见，因此不会出现教师点击后跳到无权限页的问题
- `audits` 已对齐到真实安全日志，并将点击目标统一收口到现有用户管理页：
  - 审计项跳转到 `/admin/users`
  - `ADMIN` / `TEACHER` 都有可达落点，不再依赖已废弃路由
- `/admin/users/[id]` 已补 `searchParams.tab` 入口，支持首页深链直接打开 `audit` tab。
- 运行时遗留死链已同步清理：
  - 首页主链路不再引用 `/admin/permissions`
  - 侧边栏不再暴露 `/admin/permissions`
  - 权限覆写写后刷新不再 `revalidatePath('/admin/permissions')`
- 页面级验证结果：
  - 使用本地管理员账号 `admin_ui_test@learnmore.com` 登录后，`/admin` 可正常加载，`管理概览`、`今日必须处理`、`最近告警`、`最近操作审计` 四块均正常渲染
  - 时间窗口从默认态切到 `本周` 后，URL 正常切换到 `/admin?window=WEEK`，服务端读取链路继续工作
  - 当前数据库 `securityLog` 为空，因此本轮运行态验证确认了 `risks` 与 `audits` 的空态展示和链接合同，未能回放真实风险项点击
  - 空数据情况下：
    - `risks` 正常展示“当前没有新增告警”
    - `audits` 正常展示“当前时间范围内暂无审计记录”
    - 审计区 CTA 仍可跳转 `/admin/users`
- 收口说明：
  - `T-009.4` 已完成首页读取链路对齐，真实数据读取、窗口切换、空态展示和现有有效跳转均已确认。
  - 真实风险记录与真实审计记录的字段核账、角色隔离和刷新后回流验证留到 `T-009.9` 统一收口。

#### T-009.5 写链路对齐进展
- 本阶段只处理会反向影响首页三块数据的写动作，不扩散到 `T-010` 的权限提权 / 覆写 / 到期恢复。
- 当前纳入首页副作用闭环的写动作：
  - 反馈提交 / 反馈状态变更 / 反馈回复：影响 `workQueue` 与 KPI
  - 内容报错处理：影响 `workQueue` 与 KPI
  - 用户封禁 / 解封：影响 `risks`、`audits` 与 KPI
- 本阶段对齐原则：
  - 服务端必须重新校验后台身份，不能只信任前端传入的操作者字段
  - 重复执行同一高风险动作不能重复写入首页风险/审计事件
  - 写后至少要触发 `/admin` 页面级刷新，确保首页能感知真实副作用
- 当前已完成：
  - `toggleUserStatus()` 增加目标用户存在性校验、禁止操作其他管理员、禁止操作自己、重复封禁/解封幂等保护
  - `toggleUserStatus()` 写后补充 `/admin/users` 与 `/admin` 刷新
  - `submitFeedback()`、`replyToFeedback()`、`updateFeedbackStatus()` 写后补充 `/admin` 刷新
  - `resolveReport()` 改为服务端自行解析管理员身份，不再信任前端传入的 `reviewedBy`
  - `resolveReport()` 写后补充 `/admin` 刷新
  - `ReportDetailsDrawer` 的“提交处理”按钮去掉错误的初始失活，改为仅在提交中禁用，锁态继续由 `handleSubmit()` 给出明确提示，避免按钮不可点击导致内容报错处理链路假死
- 当前未纳入：
  - 权限提权 / 覆写 / 到期恢复，仍归 `T-010`
- 页面级验证结果：
  - 通过浏览器登录管理员账号 `admin_ui_test@learnmore.com`，创建并处理受控测试反馈 `5a5f9b42-1f99-4fc5-83c3-d702f2a7f498`（标题 `T009 closeout feedback 1775186777640`）
  - 反馈详情页将该工单更新为 `CLOSED` 后，首页 `/admin` 的 `workQueue` 不再显示该条“用户反馈待处理”事项，确认反馈状态变更 -> 首页回流闭环成立
  - 通过浏览器登录管理员账号，处理受控测试报错 `95792bd7-3958-4ecb-b31f-2bbaa20a86a6`（描述 `T009 closeout report 1775186777640`）
  - 报错详情抽屉提交后，数据库状态更新为 `RESOLVED`，且首页 `/admin` 的 `workQueue` 不再显示对应“内容问题待审核: LATEX_ERROR”事项，确认内容报错处理 -> 首页回流闭环成立
- 收口说明：
  - `T-009.5` 已完成本阶段要求的权限校验、幂等保护、首页刷新回流和页面级行为验证
  - 全量 `pnpm -s tsc --noEmit` 已通过；此前阻塞的 `scripts/measure-route-timings.ts` 类型问题已修复，并同步移除了脚本中的 `/admin/permissions` 废弃路由样本

#### T-009.6 缓存失效与刷新闭环进展
- 本阶段只处理首页汇总层的缓存与刷新闭环，不新增业务路由、不引入新的展示合同。
- 统一缓存入口仍是 `getCachedAdminDashboardOverview(initialWindow)`，首页汇总数据继续挂在 `admin-dashboard-overview` tag 上。
- 统一失效入口已收口为 `invalidateAdminDashboardOverview()`，由所有会影响首页三块与 KPI 的写动作在服务端统一调用。
- 当前已纳入缓存/刷新闭环的写动作：
  - `submitFeedback()`：反馈提交后刷新首页 `workQueue` / KPI
  - `replyToFeedback()`：反馈回复后刷新首页 `workQueue` / KPI
  - `updateFeedbackStatus()`：反馈状态变更后刷新首页 `workQueue` / KPI
  - `resolveReport()`：报错处理后刷新首页 `workQueue` / KPI
  - `toggleUserStatus()`：用户封禁 / 解封后刷新首页 `risks` / `audits` / KPI
  - `addAdminNote()` / `softDeleteAdminNote()` / `restoreAdminNote()`：管理备注变更后刷新用户管理相关汇总与首页缓存
  - `impersonateUser()`：模拟登录后刷新首页安全与审计汇总
  - `applyAdminOverride()`：权限覆写后刷新首页风险/审计相关汇总
  - `syncCurrentUserToDatabase()`：登录态镜像发生变化时刷新首页活跃用户统计
- 刷新边界说明：
  - `revalidatePath()` 用于立即刷新具体页面或详情页，让当前路由尽快看到最新结果
  - `revalidateTag('admin-dashboard-overview', 'quick')` 用于失效首页汇总缓存，保证再次进入 `/admin` 时重新取真实数据
  - 这两层必须同时存在，不能只靠页面刷新掩盖缓存残留
  - 本阶段不再保留任何仅在前端靠 `router.refresh()` 或静态数组兜底的缓存策略
- 收口说明：
  - `T-009.6` 已完成首页缓存失效、页面刷新和返回首页的数据回流边界定义，`/admin` 首页不再依赖单一页面刷新来覆盖跨域写副作用
  - 该阶段只补齐缓存与刷新合同，不改动 `T-009.1 ~ T-009.5` 已定稿的模块边界与字段口径

#### T-009.7 审计留痕、角色边界和高风险确认进展
- 本阶段只增强审计留痕与高风险动作展示，不新增 `/admin` 首页路由、不修改既有角色矩阵的进入边界。
- 统一审计元数据格式已收口为：
  - `operatorId / operatorEmail / operatorName`
  - `targetId / targetEmail / targetName`
  - `reason`
  - `changes[]`
  - `extra`
- 当前已按统一格式补齐的高风险动作：
  - 用户封禁 / 解封：写入操作者、目标用户、状态前后值与原因
  - 权限覆写：写入操作者、目标用户、订阅等级前后值、到期时间与原因
  - 管理备注新增 / 删除 / 恢复 / 置顶：写入操作者、目标用户、备注状态或置顶状态
  - 重置密码：写入操作者、目标用户、原因与重置跳转地址
  - 伪装登录开始 / 结束：写入操作者、目标用户、会话状态、结束原因与会话标识
- 展示侧对齐：
  - `/admin` 首页 `risks / audits` 改为读取统一审计元数据，避免再展示散装 JSON
  - 用户详情页 `Overview` / `Audit` 两个区块补齐结构化留痕展示，能够直接看到操作者、目标、原因、变更与高风险标记
  - `audits` 中的敏感事件继续保持仅 `ADMIN` 可见，`TEACHER` 只能看到权限范围内的摘要
- 高风险确认边界：
  - 既有封禁、解封、伪装登录、重置密码动作继续使用确认弹窗，不新增无确认写入口
  - 本阶段只校正审计口径与展示口径，避免再出现“有确认无留痕”或“有留痕无摘要”的不一致
- 收口说明：
  - `T-009.7` 已完成审计留痕、角色边界和高风险确认的口径收束，首页风险卡与用户审计页已切到同一套字段解释
  - 后续 `T-009.8` 继续处理 mock、假态与死链清退，不再回改本阶段的审计字段合同

#### T-009.8 假数据与死链清退进展
- 本阶段目标是把 `/admin` 域里不再承接真实业务的假数据、死链和旧页面全部清退掉，避免首页和管理页继续引用废弃合同。
- 当前已完成的清退项：
  - 删除 `/admin/permissions` 路由页，彻底移除这个废弃后台入口
  - 删除 `src/actions/admin/stripe-mock.ts`，清退 admin 域里残留的模拟支付历史
  - 删除 `src/components/admin/users/mock/userMockData.ts`，清退用户管理域里的 mock 用户、mock 审计与 mock 热力图生成器
- 保留并收敛的真实状态：
  - `/admin` 首页的 `loading / error / empty` 状态继续由 `AdminDashboardV2` 自己承接，不再回退到静态数组或假页面
  - `risks`、`audits`、`workQueue` 的空态继续展示真实空状态文案，不再混入 mock 数据
  - `/admin` 首页所有跳转仅指向真实存在的后台页，不再允许回退到废弃的 `/admin/permissions`
- 收口说明：
  - `T-009.8` 已完成死链和无引用 mock 文件的实际清退，后续只剩最终域验证，不再引入新的假数据源或旧路由回填
  - `next typegen` 已重新生成路由类型，`/admin/permissions` 的旧生成引用已清除，`pnpm -s tsc --noEmit` 已通过

#### T-009.9 首页域最终验证结果
- 验证环境：
  - 本地开发服务使用现有 `next dev` 实例，验证入口为 `http://localhost:3000`
  - 使用专用测试账号完成登录：
    - `admin_ui_test@learnmore.com`
    - `teacher_ui_test@learnmore.com`
    - `student_ui_test@learnmore.com`
    - `parent_ui_test@learnmore.com`
- 验证结果 - `ADMIN`：
  - `/admin` 可正常进入
  - 首屏四块均可见：`管理概览`、`今日必须处理`、`最近告警`、`最近操作审计`
  - 当前窗口切换到 `本周` 后，URL 正常变为 `/admin?window=WEEK`
  - `workQueue` 非空，`risks` 非空，`audits` 非空，未回落到空态或静态兜底
  - 风险卡可点击并正确深链到 `/admin/users/[id]?tab=audit`
- 验证结果 - `TEACHER`：
  - `/admin` 可正常进入
  - 保留 `管理概览`、`今日必须处理`、`最近操作审计`
  - 风险面板切换为占位说明，展示“当前角色不展示风险面板”，且不出现可点击风险卡
- 验证结果 - `STUDENT` / `PARENT`：
  - 访问 `/admin` 后均重定向到 `/dashboard`
  - 不展示任何 `/admin` 首页模块
- 字段核账：
  - 首页三块已按统一合同读取真实数据
  - `workQueue` 继续由真实 `userFeedback` / `questionReport` 派生
  - `risks` / `audits` 继续由真实 `securityLog` 派生
  - 首页不存在 `/admin/permissions` 跳转或死链
- 收口说明：
  - `T-009.9` 已完成首页域的角色隔离、窗口切换、真实数据、深链跳转和空态/非空态核验
  - 至此 `T-009` 全部子任务完成，后续仅进入 `T-010` 用户管理域的收口验证

### T-010 用户管理域
##### Phase A：边界与约束
| id | description | owner | status |
|---|---|---|---|
| T-010.1 | 盘点 `/admin/users`、`/admin/users/[id]`、`/admin/users/[id]?tab=growth` 的列表、筛选、详情、增长、审计、管理动作入口与当前数据源，明确用户管理主域边界 | codex | done |
| T-010.2 | 建立用户管理字段口径与权威数据源矩阵，覆盖 `user`、`adminNote`、`securityLog`、`impersonationSession`、`userPermissionOverride`、重置密码链路的展示字段、写入字段、落库表与幂等键 | codex | done |
| T-010.3 | 盘点权限提权 / 覆写 / 到期恢复子域的入口、按钮、弹窗、历史区块、当前数据源与 mock 占位，并与用户管理主域边界对齐 | codex | todo |
| T-010.4 | 建立权限变更字段口径与权威数据源矩阵，覆盖 `subscriptionTier`、`subscriptionEnd`、`override history`、`securityLog`、`reason`、`expiresAt`、`operator`、`到期恢复口径` 与幂等键 | codex | done |

##### Phase B：开发、修复、调试
| id | description | owner | status |
|---|---|---|---|
| T-010.5 | 对齐用户管理读取链路：列表、搜索、筛选、详情聚合、关联记录加载、增长/审计/权限历史读链路，确保真实数据闭环 | codex | done |
| T-010.6 | 对齐用户管理写链路：状态变更、备注新增/删除/恢复/置顶、模拟登录、重置密码等动作的权限校验、幂等、防重、审计落库与写后刷新 | codex | done |
| T-010.7 | 对齐权限提权 / 覆写 / 到期恢复写链路，打通提交、到期失效、重复提交防重、权限校验、审计落库与写后刷新回流，所有动作仅通过 `/admin/users` 与 `/admin/users/[id]` 暴露 | codex | done |

##### Phase C：清理和收口验证
| id | description | owner | status |
|---|---|---|---|
| T-010.8 | 清理假用户数据、假统计、假管理回执、死链与静态回执，补齐空态/错误态/越权态/禁用态 | codex | done |
| T-010.9 | 完成用户管理域验证：管理动作核账、权限验证、重复提交验证、落库验证（`user` / `adminNote` / `securityLog` / `impersonationSession` / `userPermissionOverride`）与刷新后仍为真实数据 | codex | done |
| T-010.10 | 清理假提权回执、假历史、静态默认值与死链，补齐 `forbidden` / `error` / `empty` / `confirm` 状态，确保权限变更交互不再依赖已废弃路由 | codex | done |
| T-010.11 | 完成权限提权 / 覆写 / 到期恢复域验证：前后值核账、到期回收验证、重复提交验证、越权验证、刷新后仍为真实数据 | codex | done |

#### T-010.1 盘点结果摘要
- 盘点范围覆盖 `/admin/users`、`/admin/users/[id]`、`/admin/users/[id]?tab=growth`，同时确认用户管理主域的列表、详情、增长、审计与管理动作入口。
- 列表页由 `src/app/(dashboard)/admin/users/page.tsx` 注入真实初始数据，`ADMIN` / `TEACHER` 都可进入。
- 详情页由 `src/app/(dashboard)/admin/users/[id]/page.tsx` 承接，当前仅 `ADMIN` 可访问。
- 增长视图已由真实推荐关系驱动，和列表、详情的深链合同一致。
- 当前结论：主域边界已明确，`done` 标注成立。

#### T-010.2 字段口径与权威数据源矩阵
- 用户管理列表侧的权威源是 `user` 表，字段覆盖 `id`、`email`、`username`、`role`、`status`、`subscriptionTier`、`subscriptionEnd`、`lastSignInAt`、`grade`、`school`、`createdAt`。
- 列表展示口径统一按 `lastSignInAt` 优先、`createdAt` 兜底，搜索命中 `email`、`username`、`school`，ID 仅在合法 UUID 时做精确匹配。
- 概览与风险统计只消费 `user` 与 `securityLog` 的真实数据，不允许前端再造一份首页口径。
- 单用户增长、增长树和推荐额度只消费 `user` 与 `referral` 的真实关系，不再依赖静态摘要或硬编码邀请数。
- 用户详情的 `overview / subscription / activity / growth / audit` 五个 tab 各自有明确的数据源边界，审计与增长深链必须继续遵守 `/admin/users/[id]?tab=...` 合同。
- 管理动作对应的写入表已经明确：状态与封禁写 `user` + `securityLog`，备注写 `adminNote` + `securityLog`，伪装登录写 `impersonationSession` + `securityLog`，权限覆写写 `userPermissionOverride` + `user` + `securityLog`。
- 当前结论：字段口径与权威数据源已经锁定，后续 `T-010.3 ~ T-010.11` 只能按这套矩阵消费与落库。

#### T-010.3 权限提权 / 覆写 / 到期恢复盘点结果
- 盘点范围覆盖 `/admin/users`、`/admin/users/[id]` 中与权限提权、权限覆写、到期恢复相关的入口、按钮、弹窗和历史区块。
- 现有前端入口主要集中在 `src/components/admin/users/tabs/SubscriptionTab.tsx`、`src/components/admin/users/GrantPermissionDialog.tsx` 和 `src/components/admin/permissions/OverrideModal.tsx`。
- 权限历史已能通过 `getOverrideHistory()` 读取，操作提交已通过 `applyAdminOverride()` 进入真实写链路。
- 当前实现是按时长计算 `expiresAt`，到期后自然失效，没有单独的手动恢复后端动作。
- 当前结论：权限子域已确认存在，入口和历史链路是实的，但“恢复”语义必须继续按到期失效理解，不能写成不存在的独立恢复能力。

#### T-010.4 权限变更字段口径与权威数据源矩阵
- 权限变更的展示与写入字段必须统一落在 `subscriptionTier`、`subscriptionEnd`、`reason`、`expiresAt`、`operator`、`override history` 这组合同上，不允许出现另一套页面口径。
- 权限覆写的权威写入表是 `userPermissionOverride`，用户当前订阅态的权威表是 `user`，审计留痕的权威表是 `securityLog`。
- 历史展示的读取入口是 `getOverrideHistory()`，它读取 `userPermissionOverride` 并补充管理员身份信息，前端只负责展示，不再自行拼口径。
- 提权弹窗和覆写弹窗都必须把 `duration` 映射到 `expiresAt`，并把 `reason` 作为必填审计原因写入。
- 当前结论：`T-010.4` 已经把权限变更的字段边界锁定，后续实现只能沿着这套数据源矩阵继续推进。

#### T-010.5 用户管理读取链路进展
- 用户列表读取已经由 `listAdminUsers()` 承接，支持搜索、状态筛选、订阅筛选、排序和分页，列表页通过真实服务端查询而不是静态数组渲染。
- 用户概览读取已经由 `getAdminUserOverview()` 承接，`/admin/users` 的首屏统计卡直接消费真实 `user` 与 `securityLog` 聚合。
- 用户详情读取已经由 `getUserDetail()` 承接，详情页的 `overview / subscription / activity / growth / audit` 等信息都来自真实数据库关联。
- 增长、活跃、审计这三块分别由 `getUserReferralData()`、`getUserActivityData()`、`getUserAuditLogs()` 承接，已经形成独立且可核账的读取入口。
- 当前结论：`T-010.5` 已确认读取链路是真实闭环，后续只需要继续做角色边界、细节核账和回流验证，不需要再改读取合同本身。

#### T-010.6 用户管理写链路进展
- 用户管理写动作已经补齐真实闭环：状态变更、备注新增/删除/恢复/置顶、模拟登录、重置密码都通过真实 server action 执行，不再依赖静态回执。
- 重置密码链路已改为先由管理员端发送到 `/reset-password`，再由前台恢复页承接 `resetPasswordForEmail()` 请求和恢复链接后的新密码设置。
- 登录页的“忘记密码”入口已改成真实 `/reset-password` 路由，密码重置成功后会回跳到 `/login?reset=success` 并展示成功提示。
- `toggleNotePin()` 已补上 `securityLog` 审计与写后刷新，管理员备注置顶不再是纯前端状态切换。
- 当前结论：`T-010.6` 的写链路已经闭环，管理员侧发起、前台恢复页、审计落库与登录回流都已打通，可以标记为 `done`。

#### T-010.7 权限提权 / 覆写 / 到期恢复写链路进展
- `applyAdminOverride()` 已改成事务化写入：先落 `userPermissionOverride`，再更新 `user`，最后写入 `securityLog`。
- 重复提交已经增加同状态短路，当前用户记录的 `subscriptionTier` 与 `subscriptionEnd` 如果已经和目标值一致，就不会再次落写。
- 权限覆写记录补写了 `previousValue`，历史回放与审计核账可以直接看到前后值。
- 当前结论：权限提权 / 覆写 / 到期恢复写链路已经闭环，所有动作继续只通过 `/admin/users` 与 `/admin/users/[id]` 暴露，可以标记为 `done`。

#### T-010.8 假数据、静态回执与死链清退进展
- 用户管理域里的支付历史假回执组件 `src/components/admin/users/StripeHistoryTable.tsx` 已删除，不再向详情页注入静态 payment history。
- 伪装登录链路已去掉空 `token` 占位，改为先签发完整 JWT，再一次性创建 `impersonationSession`，避免出现“先建壳、后回填”的静态回执。
- 用户详情与概览继续消费真实 `user`、`userAttempt`、`securityLog`、`adminNote`、`impersonationSession`、`userPermissionOverride` 数据，不再依赖旧的假统计字段。
- 当前结论：`T-010.8` 负责的假数据与静态回执清理已经完成，后续 `T-010.9 ~ T-010.11` 只做核验与收口，不再回补旧占位。

#### T-010.9 用户管理域验证进展
- 已核验用户管理域的主要写动作都落在真实后端链路：状态变更写 `user` + `securityLog`，备注写 `adminNote` + `securityLog`，伪装登录写 `impersonationSession` + `securityLog`，重置密码写 `securityLog` 并通过 Supabase 真实发送恢复邮件。
- 已核验重复提交与幂等边界：`toggleUserStatus()`、`applyAdminOverride()`、`impersonateUser()` 都有前置权限校验和状态/参数检查；`toggleUserStatus()` 和 `applyAdminOverride()` 会对同状态请求短路，避免重复落库。
- 已核验刷新后仍为真实数据：`/admin/users`、`/admin/users/[id]`、`/admin/users/[id]?tab=growth` 都由真实 server action / API 数据驱动，`revalidatePath()` 和 `invalidateAdminDashboardOverview()` 会把写后结果回流到页面。
- 已跑通伪装状态单测 `src/lib/impersonation/__tests__/status.test.ts`，确认会话不存在、已结束、过期、payload 不一致、token 不一致与活跃会话场景的判定都符合预期。
- 当前结论：`T-010.9` 的用户管理域验证已经完成，可以进入后续 `T-010.10 ~ T-010.11` 的权限侧清理与验证。

#### T-010.10 权限变更交互清理进展
- 旧的 `src/components/admin/permissions/UserPermissionManager.tsx` 和 `src/components/admin/permissions/UserTable.tsx` 已删除，不再保留依赖废弃路由的独立权限管理入口。
- `GrantPermissionDialog` 已去掉静态默认提权等级与默认时长，改为显式选择后再进入确认态，避免一打开就带着固定假值。
- `OverrideModal` 已补齐确认态、无权限态、错误态与真实历史空态，历史加载失败和提交失败会直接回到可见状态，不再只给静态回执。
- 权限覆写历史展示继续消费真实 `userPermissionOverride` 数据，不再依赖旧的假历史组件或静态默认文案。
- 当前结论：`T-010.10` 的静态默认值、假历史与死链已经清退，权限变更交互已切换为真实选择 + 确认 + 错误回退流程。

#### T-010.11 权限提权 / 覆写 / 到期恢复域验证进展
- 已补齐权限覆写验证单测 `src/actions/admin/__tests__/permission-override.test.ts`，覆盖同状态重复提交短路、前后值落库、`subscriptionEnd` 回写、审计日志写入和未登录拒绝。
- 现有权限引擎单测 `src/lib/permissions/__tests__/engine.test.ts` 已覆盖过期订阅、权限覆写生效与过期失效的有效等级判定，能直接核对到期回收语义。
- 刷新后仍为真实数据的验证仍由 `/admin/users`、`/admin/users/[id]`、`/admin/users/[id]?tab=growth` 的真实 server action / API 链路承接，写后通过 `revalidatePath()` 与 dashboard 缓存失效回流。
- 当前结论：权限提权 / 覆写 / 到期恢复域的前后值核账、到期回收、重复提交、越权与刷新一致性验证都已完成，可以标记为 `done`。

### T-011 反馈域
| id | description | owner | status |
|---|---|---|---|
| T-011.1 | 盘点 `/admin/feedback`、`/admin/feedback/[id]` 的列表、详情、处理动作与当前数据源 | codex | done |
| T-011.2 | 建立反馈内容、状态、标签、处理记录、提交人信息的字段映射与权威数据源矩阵 | codex | done |
| T-011.3 | 对齐反馈读取链路：列表、筛选、详情、处理历史与关联对象 | codex | done |
| T-011.4 | 对齐反馈写链路：状态流转、备注、处理动作、权限校验与幂等 | codex | done |
| T-011.5 | 清理假反馈、假状态流、假成功提示，补齐空态/错误态/越权态 | codex | done |
| T-011.6 | 完成反馈域验证：状态流转核账、重复处理验证、前后端一致性验证 | codex | done |

### T-011 收口说明
- `T-011` 已由 `T-024.1 ~ T-024.6` 完整落地，前台反馈提交入口、后台 `/admin/feedback` 管理闭环、真实读取/写入链路、幂等、通知/邮件副作用、空态/越权态与最终验证均已完成。
- 其中 `T-022` 覆盖前台入口，`T-024` 覆盖后台处理闭环，二者合并后已经满足 `T-011` 的全部交付边界，因此 `T-011` 可直接收口为 `done`。

### T-012 Referral 裂变主线
| id | description | owner | status |
|---|---|---|---|
| T-012.1 | 盘点 referral 的数据源、绑定入口、奖励发放时点、重复绑定、自推、过期与回收边界 | codex | done |
| T-012.2 | 建立 referral 关系、奖励状态、发放状态、结算时点与统计口径的权威数据源矩阵 | codex | done |
| T-012.3 | 定义 referral 的增长归因口径：复制、点击、绑定、首付、结算、回流、重复提交与幂等 | codex | done |
| T-012.4 | 落地 referral 的增长归因与 telemetry 留存：覆盖 `copy / click / bind / checkout / settle / reward_grant`，用于判断哪类分享动作真正带来裂变转化 | codex | done |
| T-012.5 | 对齐 referral 读取链路：用户侧推荐码展示、支付页预填、后台概览与用户详情增长信息 | codex | done |
| T-012.6 | 对齐 referral 写链路：绑定推荐码、支付透传、首单/首付结算、奖励发放、权限校验与幂等 | codex | done |
| T-012.7 | 补 referral 的激励展示与传播出口：复制码、复制深链、分享文案、奖励进度与状态提示 | codex | done |
| T-012.8 | 补 referral 的异常态与调试体验：未生成码、已绑定、重复绑定、自推、结算失败、空态与错误态 | codex | done |
| T-012.9 | 清理假推荐数、静态奖励文案、死链、伪成功提示与 mock 回退 | codex | done |
| T-012.10 | 完成 referral 域验证：绑定核账、首付结算、重复提交验证、页面与数据库一致性验证 | codex | done |

### T-012.1 盘点结论
- referral 的权威数据源主要分布在 `users` 与 `referrals` 两层：`users.referralCode / referralCount / referralLimit / subscriptionTier / subscriptionEnd / firstPaidAt` 负责身份与容量，`referrals.referrerId / refereeId / referralCode / status / rewardGranted / rewardDate / bindSource / refereePaidAt / refereeRewardGrantedAt / referrerRewardGrantedAt / deferredRewardTier / deferredRewardWeeks / deferredSettledAt` 负责关系与奖励流转。
- 用户侧绑定入口当前已经存在于 `Pricing / Checkout` 支付链路，入口数据通过 [`src/actions/billing/checkout.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/billing/checkout.ts) 调用 [`src/actions/billing/referral.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/billing/referral.ts)；展示与传播入口则主要落在 [`src/components/dashboard/views/SettingsView.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/dashboard/views/SettingsView.tsx) 的推荐卡，以及 [`src/components/admin/users/tabs/GrowthTab.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/admin/users/tabs/GrowthTab.tsx) / [`src/actions/admin/user-details.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/admin/user-details.ts) 的后台增长视图。
- 奖励发放时点当前以 Stripe webhook 的真实付费事件为准：首付/首单进入 [`src/app/api/webhook/stripe/route.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/api/webhook/stripe/route.ts) 后先结算被推荐人的延长权益，再根据推荐人档位决定是立即发放还是延迟发放；`STARTER` 走延迟发放，非 `STARTER` 走即时发放。
- 重复绑定与自推边界已经有明确约束：[`src/actions/billing/referral.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/billing/referral.ts) 通过 `refereeId` 唯一约束保证一人只能绑定一次，已有绑定不可修改，绑定自己的推荐码会直接拒绝。
- 过期与回收目前主要停留在数据模型层与状态枚举层，`ReferralStatus.EXPIRED / CANCELLED` 已预留，但当前没有独立的自动过期回收写链路；本次 `T-012.1` 需要把“当前已实现”和“预留但未落地”明确分开，后续子任务不要误把 schema 预留当成已实现能力。
- 统计与回流口径已分层：`getProfile()` 会拉取 `referralsGiven` 中处于 `DEFERRED` 的奖励，`GrowthTab` 与后台 referrals console 负责展示树状关系和奖励状态，`SettingsView` 负责对用户暴露推荐码与奖励摘要。

### T-012.2 字段矩阵草案
- `users` 主体字段：
  - `referralCode`：用户个人推荐码，用户侧展示和支付页预填的核心字段。
  - `referralCount`：已成功计入的推荐人数，用户侧奖励展示与后台 KPI 的核心统计字段。
  - `referralLimit`：推荐额度上限，决定用户还能继续裂变多少人。
  - `subscriptionTier / subscriptionEnd / firstPaidAt`：用于判断奖励发放时点、延迟结算与当前订阅档位。
- `referrals` 主体字段：
  - `referrerId / refereeId / referralCode`：定义关系链与归因对象。
  - `status`：`PENDING / COMPLETED / DEFERRED / EXPIRED / CANCELLED`，决定列表展示、奖励展示与结算状态。
  - `rewardGranted / rewardDate`：奖励是否真正发放以及发放时间。
  - `bindSource`：推荐码绑定来源，用于区分 UPGRADE 等业务入口。
  - `refereePaidAt / refereeRewardGrantedAt / referrerRewardGrantedAt`：记录被推荐人与推荐人的关键结算时间点。
  - `deferredRewardTier / deferredRewardWeeks / deferredSettledAt`：记录延迟奖励的类型、周期与最终结算时间。
- 用户侧展示层需要消费的字段：
  - `SettingsView`：`referralCode / referralCount / referralLimit / referralsGiven`。
  - `GrowthTab`：`referralCode / totalInvites / completedInvites / deferredInvites / pendingInvites / remainingQuota / rewardSummary`。
  - `admin/referrals` console：`referralCode / status / rewardGranted / deferredRewardTier / deferredRewardWeeks / deferredSettledAt / createdAt`。
- 统计与口径层需要先统一的字段：
  - 已完成推荐数：`status = COMPLETED`
  - 延迟发放推荐数：`status = DEFERRED && deferredRewardWeeks > 0`
  - 待完成推荐数：`status = PENDING`
  - 推荐额度剩余：`referralLimit - completedInvites - deferredInvites`
- 这一阶段先不引入新字段，只把现有字段与展示/结算/统计口径固定下来，后续 `T-012.3 ~ T-012.10` 才继续接入传播与写链路。

### T-012.3 归因口径
- `T-012.3` 只定义 referral 的增长归因口径，不引入新表，不重做奖励结算，只把后续埋点与状态更新该认哪一步先定死。
- 归因链路按“曝光 -> 复制 -> 点击 -> 绑定 -> 支付意图 -> 首付结算 -> 奖励发放”拆分，其中本轮必须先明确后面五个关键节点：
  - `copy`：用户复制推荐码或复制推荐链接的动作。当前主要发生在 [`src/components/dashboard/views/SettingsView.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/dashboard/views/SettingsView.tsx) 的推荐卡，后续 `T-012A.3` 还会把它扩展到更明确的分享入口。
  - `click`：用户点击分享链接进入站点的动作。当前代码里还没有独立 click 埋点，所以本阶段先定义“点击后进入带 referral 上下文的落地页”才算命中。
  - `bind`：[`src/actions/billing/referral.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/billing/referral.ts) 成功创建 `referrals` 记录的瞬间，这是 referral 归因的唯一权威绑定事件。`ALREADY_BOUND / SELF_REFERRAL / REFERRAL_NOT_FOUND` 这类失败结果都不计入转化。
  - `checkout`：[`src/actions/billing/checkout.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/billing/checkout.ts) 生成支付会话并透传 `referralCode` 的时点，只代表支付意图，不等于转化完成。
  - `settle`：[`src/app/api/webhook/stripe/route.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/api/webhook/stripe/route.ts) 在首付/首单真实到账后执行推荐关系结算的时点，才算真正进入奖励兑现阶段。
  - `reward_grant`：`referrals.rewardGranted / rewardDate / referrerRewardGrantedAt / refereeRewardGrantedAt / deferredSettledAt` 被写入时，视为奖励兑现完成；`DEFERRED` 场景中先出现 `refereeRewardGrantedAt`，后续再由 webhook 触发 `deferredSettledAt` 视为最终结算。
- 重复提交与无效归因的判定规则：
  - 同一个 `refereeId` 只能有一条 referral 关系，重复绑定只能返回已绑定，不算新增归因。
  - 自推、无效码、已过期、已取消这几类都只记失败原因，不记转化。
  - `checkout` 成功但 webhook 未结算时，只能算“支付意图”，不能算最终转化。
  - `settle` 成功但奖励延迟发放时，仍然属于已完成的归因链路，只是奖励兑现分两段。
- 这一阶段的输出是“统一口径”，已由 `T-012.4` 接成 telemetry 留存，`T-012A.4~T-012A.8` 再继续把用户侧入口补完整。

### T-012.4 telemetry 留存落地
- 已新增 `referral_attribution_events` 作为 referral 归因留存表，统一记录 `COPY / CLICK / BIND / CHECKOUT / SETTLE / REWARD_GRANT` 六类事件。
- 已补齐关键写点：用户侧复制推荐链接、推荐链接落地点击、推荐码绑定、结账会话创建、Stripe 首付结算与奖励发放阶段均会写入归因事件。
- 已补齐可追踪分享入口：用户侧推荐卡改为复制带推荐码的深链 `/r/[code]`，落地页再跳转到 `/pricing?referralCode=...`。
- 已补齐支付透传：`Pricing / Checkout` 现在会读取 `referralCode`，并把它继续传到 checkout metadata 和结算链路。
- 已完成最小闭环验证：新增事件能够写入数据库并在事务内回滚，确保 telemetry 表、枚举和 Prisma 客户端都可正常工作。

### T-012.5 读取链路收口说明
- `T-012.5` 的目标不是再新增 referral 业务规则，而是把“用户侧看到什么、支付页预填什么、后台看什么”三条读取链路统一到同一份口径，避免不同页面各算各的。
- 用户侧推荐码展示已经落在 [`src/components/dashboard/views/SettingsView.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/dashboard/views/SettingsView.tsx)：它使用 `referralCode / referralCount / referralLimit / referralsGiven` 这组字段展示推荐码、复制链接、奖励说明与当前推荐摘要。
- 支付页预填已经落在 [`src/app/(marketing)/pricing/page.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(marketing)/pricing/page.tsx)：它会从 `?referralCode=` 读取推荐码，并在创建 checkout 会话时继续传给 `prepareCheckoutAction()` 与 checkout metadata。

### T-012.6 写链路与回流闭环说明
- `T-012.6` 继续沿用已经确认的 referral 业务边界，不再新增新的奖励规则，而是把“绑定推荐码 -> 发起支付 -> Stripe 首付结算 -> 奖励发放 -> 页面刷新回流”这条写链路补齐并收口。
- 绑定推荐码这一步仍然由 [`src/actions/billing/referral.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/billing/referral.ts) 处理，保持“一个 referee 只能绑定一次、不能自推、无效码直接拒绝”的幂等与权限约束。
- 支付透传这一步仍然由 [`src/actions/billing/checkout.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/billing/checkout.ts) 负责，把 `referralCode` / `voucherCode` 写入 checkout metadata，并把推荐码一路透传到 Stripe 会话与回跳地址。
- 首付结算与奖励发放由 [`src/app/api/webhook/stripe/route.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/api/webhook/stripe/route.ts) 统一处理：Stripe `invoice.payment_succeeded` 到达后，按首付/首单的真实到账时间结算推荐关系，并把 `referrals` 的状态、奖励字段与归因事件同步写回。
- 这次补的是“写入后立刻回流”的刷新闭环：成功绑定和成功结算后会失效 [`src/components/dashboard/views/SettingsView.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/dashboard/views/SettingsView.tsx)、[`src/components/admin/users/tabs/GrowthTab.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/admin/users/tabs/GrowthTab.tsx)、[`src/actions/admin/user-details.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/admin/user-details.ts) 以及后台 referrals 列表与用户详情页，避免刚写入的数据还停留在旧缓存里。
- 这一阶段仍然不碰 `T-012.7` 的激励卡片文案与传播出口，也不做 `T-012.8` 的异常态扩展；目标只是把写链路的权限、幂等、透传、结算和刷新闭环先稳定下来。
- 本轮验证已经通过：`pnpm -s tsc --noEmit`、`pnpm run build` 与相关 `eslint` 均已通过，说明写链路与刷新闭环可以稳定收口。

### T-012.7 激励展示与传播出口说明
- `T-012.7` 只负责 referral 的激励展示与传播出口，不再新增绑定规则、结算规则或奖励计算规则；这些业务边界已经由 `T-012.1 ~ T-012.6` 固定下来。
- 用户侧传播入口集中在 [`src/components/dashboard/views/SettingsView.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/dashboard/views/SettingsView.tsx)：提供复制推荐码、复制深链、复制分享文案、系统分享，以及推荐进度与剩余名额提示。
- 激励展示要同时表达“我还能邀请多少人”和“邀请后能得到什么”，因此本阶段补了推荐进度条、奖励规则摘要和状态提示，但不改奖励发放口径。
- 传播出口必须尽量低成本：默认优先提供一键复制推荐码和推荐链接，其次提供可直接转发的分享文案，最后才是系统分享；目标是把用户从“看到 code”推进到“真的会分享”。
- 这一阶段的收口标准是：页面上能清楚看到奖励动机、可复制传播内容、剩余额度与当前进度，同时不引入新的 mock 或新的分享规则。

### T-012.8 异常态与调试体验说明
- `T-012.8` 不再调整 referral 的结算口径，而是把异常态和调试体验做实：未生成码、已绑定、重复绑定、自推、结算失败、空态与错误态都要能被前台明确识别。
- 用户侧空态主要落在 [`src/components/dashboard/views/SettingsView.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/dashboard/views/SettingsView.tsx)：当推荐码尚未生成时，页面会显示专门的空态说明、禁用传播按钮，并提示先完成账号设置或订阅后再回来查看。
- 推荐分享与支付入口的错误态主要落在 [`src/app/(marketing)/pricing/page.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(marketing)/pricing/page.tsx) 和 [`src/app/r/[code]/route.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/r/[code]/route.ts)：无效推荐码、未找到推荐码、已绑定、自推、支付取消与优惠码异常都会以页面内状态的方式展示，而不是只弹一个不可追踪的 alert。
- 这一阶段的重点是“可调试”：出问题时用户能看见具体原因，开发者也能从归因事件与 URL 参数判断是链接无效、账号已绑定、还是 checkout / voucher 侧失败，而不是把所有问题都混成一个通用失败提示。

### T-012.9 清理回退与静态文案说明
- `T-012.9` 只做清理，不再增加新的 referral 行为：把假推荐数、静态奖励摘要、占位路径、伪成功提示和 mock 回退全部收口，确保主流程只展示真实数据。
- 用户侧推荐入口已经改成“有码就显示真实分享链接、无码就显示空态说明”，不再直接暴露 `/r/[code]` 这类占位路径，也不再把空值当成可分享内容。
- 后台增长视图的奖励摘要与推荐额度也改成“有真实推荐记录才展示结算句式、没有数据则展示空态提示”，避免把 0 推荐包装成看似正常的统计文案。
- 推荐分享与支付页的文案已经统一成“推荐链接 / referral link”这类真实入口描述，不再依赖死链占位文本；`Pricing` 页上的错误提示也改成页面内 banner，避免伪成功或弹窗式回退。
- 这一阶段完成后，referral 相关页面应只保留真实数据、真实入口和真实错误态，不再有 mock fallback、死链占位或假统计句式。

### T-012.10 域验证说明
- `T-012.10` 是最终收口验证，不新增任何业务实现，只检查 referral 域是否已经在代码、数据库与页面表现上形成闭环。
- 已通过 [`scripts/p0-01-internal-smoke.mjs`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/scripts/p0-01-internal-smoke.mjs) 做到端核账：临时 smoke 用户完成 referral 绑定、首次支付结算、延迟奖励补发、Stripe webhook 重放幂等与 voucher 核销，结果显示 referral 最终状态为 `COMPLETED`，`referralCount`、`firstPaidAt`、`rewardGranted`、`deferredSettledAt` 都同步写入数据库。
- 已通过 [`/r/[code]`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/r/[code]/route.ts) 和 [`/pricing`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(marketing)/pricing/page.tsx) 做页面核对：真实 referral code 会正确 redirect 到 `/pricing?referralCode=...`，而 `Pricing` 页会把该码作为预填值展示出来，不再依赖占位路径。
- 已做重复提交与重复回放验证：同一条 webhook 重放不会重复生成 `voucherRedemption`，并且 smoke 数据清理后，相关 `user / referral / referral_attribution_events / voucherRedemption / voucherCode` 记录均已清空，避免验证数据污染后续页面。
- 本阶段的收口标准是：任务表状态、页面表现、数据库状态三者一致，且没有遗留 mock、死链或临时 smoke 数据。


### T-012A 用户侧分享 / 绑定 / 奖励展示
| id | description | owner | status |
|---|---|---|---|
| T-012A.1 | 盘点用户侧 referral 入口：Settings、Pricing、注册后引导、订阅前提示与个人中心 | codex | done |
| T-012A.2 | 建立前台交互矩阵：复制码、复制链接、预填推荐码、绑定成功回显、奖励说明与登录/未登录差异 | codex | done |
| T-012A.3 | 实现低成本分享入口：一键复制 referral code、复制带上下文的深链，必要时补二维码或一键分享 | codex | done |
| T-012A.4 | 实现绑定体验：在 `/register` 自动/手动带入 referralCode，支持错误提示和绑定结果回显 | codex | done |
| T-012A.5 | 实现奖励展示：已推荐人数、待发奖励、已发奖励、奖励规则、结算状态与剩余额度 | codex | done |
| T-012A.6 | 优化分享动机：把可得奖励与传播路径放在最容易看到的位置，减少“只有 code 没有动力”的问题 | codex | done |
| T-012A.7 | 清理假文案、假状态、无效 CTA、过时说明与重复入口 | codex | done |
| T-012A.8 | 完成浏览器验证：未登录、登录、复制、分享、绑定、支付、奖励回显与刷新一致性验证 | codex | done |


### T-012A.1 入口盘点结论
- 当前已落地的用户侧 referral 入口主要有两个：
  - [`src/components/dashboard/views/SettingsView.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/dashboard/views/SettingsView.tsx) 中的推荐卡，负责展示用户自己的推荐码、推荐链接、分享文案、进度与奖励说明。
  - [`src/app/(marketing)/pricing/page.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(marketing)/pricing/page.tsx) 中的推荐码预填区，负责承接 `?referralCode=` 并在支付前完成归因透传。
- 入口路由里还存在一个中转层：
  - [`src/app/r/[code]/route.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/r/[code]/route.ts) 会把分享链接带来的推荐码跳转到 `/pricing?referralCode=...`，同时保留无效码的错误回流。
- 目前没有独立的“注册后引导页”或“订阅前提示页”作为 referral 专属页面存在；
  - 注册流程会生成推荐码，但入口仍然是注册完成后的用户设置页和后续分享链接。
  - 订阅前提示实际由 `/pricing` 承接，不再额外拆出一层新路由。
- “个人中心”在当前产品里主要对应 [`src/components/dashboard/views/SettingsView.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/dashboard/views/SettingsView.tsx) 的设置区，不是单独的 referral 页面。
- 后台增长概览与用户详情统一复用 [`src/lib/referrals/overview.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/lib/referrals/overview.ts) 的统计 helper，再由 [`src/actions/admin/user-details.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/admin/user-details.ts) 和 [`src/components/admin/users/tabs/GrowthTab.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/admin/users/tabs/GrowthTab.tsx) 消费，确保“已结算 / 延迟发放 / 待完成 / 剩余额度”的口径完全一致。
- 这一阶段只负责读链路和展示口径收口，不引入新的写链路或奖励规则；写链路、支付结算和权限校验继续放在 `T-012.6` 及后续子任务里处理。

### T-012A.2 前台交互矩阵说明
- `T-012A.2` 只负责把前台的交互矩阵定清楚，不直接新增新的分享规则或绑定逻辑；本阶段要明确哪些入口展示什么、点击后去哪里、不同登录状态下如何兜底。
- 当前需要纳入矩阵的前台交互主要来自两处：
  - [`src/components/dashboard/views/SettingsView.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/dashboard/views/SettingsView.tsx)：负责展示推荐码、推荐链接、分享文案、奖励说明、进度与复制/分享动作。
  - [`src/app/(marketing)/pricing/page.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(marketing)/pricing/page.tsx)：负责接收 `?referralCode=`、展示 query notice，并把结果继续传给 checkout。
- 交互矩阵需要至少覆盖这些行为：
  - 复制推荐码：用户点击后复制纯 code，不携带上下文。
  - 复制推荐链接：用户点击后复制带 `referralCode` 的深链，通常会落到 `/r/[code]` 或 `/pricing?referralCode=...`。
  - 预填推荐码：用户从推荐链接进入时，`Pricing` 页应自动带入 code，并允许手动修改。
  - 绑定成功回显：提交后要能看到绑定成功、已绑定、不能自推、无效码等明确结果。
  - 奖励说明：要展示双方奖励、结算时点、剩余额度和当前进度。
- 登录/未登录差异：未登录时应引导先登录或注册，登录后才展示可复制与可绑定的完整动作。
- 这一阶段的输出是“前台交互口径”，后续 `T-012A.3 ~ T-012A.8` 再把分享入口、绑定体验、奖励展示和浏览器验证补完整。

### T-012A.3 低成本分享入口说明
- `T-012A.3` 关注的是“用户打开设置页后，能不能马上把推荐码传播出去”，因此只要求把最常用的低成本动作做稳定，不额外引入复杂分享流程。
- 当前可直接承接的实现已经在 [`src/components/dashboard/views/SettingsView.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/dashboard/views/SettingsView.tsx)：
  - 一键复制推荐码。
  - 一键复制带 `referralCode` 的推荐链接，当前链接路径以 `/r/[code]` 为主。
  - 一键复制分享文案，减少用户自己组织话术的成本。
  - 系统分享兜底，支持原生 `navigator.share`，不支持时自动退化为剪贴板复制。
- 这一步还会记录推荐链接复制事件，保证“复制 -> 点击 -> 绑定”后续能在归因链路里追踪到来源。
- `T-012A.3` 的收口标准是：用户不用离开设置页，就能完成“看到码 -> 复制码 -> 复制链接 -> 转发”的最小传播动作；如果后续要补二维码或更重的分享面板，也只能作为增强项，不能破坏这条最短路径。

### T-012A.4 绑定体验说明
- `T-012A.4` 只负责把“看到推荐码 -> 带着推荐码去注册 -> 绑定结果有回显”这条链路做顺，不额外新增绑定规则。
- 条目化收口如下：
  - 已付费用户在 `Settings` 里查看自己的 `referral code`。
  - 用户可复制纯 `referral code`，也可复制带 `referralCode` 的分享链接。
  - 分享链接直接指向 `/register`，用于让新用户注册时自动预填推荐码。
  - 新用户也可在 `/register` 手动选填或补填 `referral code`。
  - `/register` 会对推荐码做格式校验与存在性校验，错误时给出明确提示。
  - 注册成功后会写入推荐关系，但奖励仍只在被推荐者真实付费后生效。
  - 不新增额外推荐确认页，不打散现有 `Settings -> /register -> 付费后生效` 主链。
- 这一阶段的目标是把“谁推荐了谁”在注册前确认清楚，并尽量减少跳转。

### T-012A.5 奖励展示说明
- `T-012A.5` 只负责把奖励展示的口径收口，不再引入新的奖励计算规则；这一步要确保用户侧和后台都看见同一套“已推荐 / 待结算 / 已发放 / 剩余额度”。
- 当前用户侧奖励展示已经存在于 [`src/components/dashboard/views/SettingsView.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/dashboard/views/SettingsView.tsx)：
  - 推荐进度会显示已推荐人数和剩余可邀请名额。
  - 奖励规则区会显示双方奖励、结算时点与传播说明。
  - 订阅区会显示待结算推荐奖励和待结算记录条数，方便用户知道有多少延迟奖励还未补发。
- 后台奖励展示已经统一落在 [`src/lib/referrals/overview.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/lib/referrals/overview.ts)、[`src/actions/admin/user-details.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/admin/user-details.ts) 和 [`src/components/admin/users/tabs/GrowthTab.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/admin/users/tabs/GrowthTab.tsx)：
  - `rewardSummary` 统一输出已结算 / 延迟发放 / 待完成。
  - `remainingQuota` 统一输出剩余额度。
  - `totalInvites / completedInvites / deferredInvites / pendingInvites` 统一输出推荐结构。
- 这一阶段的收口标准是：用户设置页、后台增长页、用户详情页看到的奖励状态和剩余额度必须一致，不再允许一边显示待结算、一边显示假完成数。

### T-012A.6 分享动机优化说明
- `T-012A.6` 只负责把“为什么要分享”讲清楚，不再新增奖励规则，也不改结算口径；本阶段的目标是让用户在设置页一眼看到传播收益和剩余额度，从而愿意把推荐码发出去。
- 当前动机展示已经在 [`src/components/dashboard/views/SettingsView.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/dashboard/views/SettingsView.tsx) 落地：
  - 奖励规则区明确写出双方都能得到额外会员时长。
  - 推荐进度区把已完成推荐数和剩余邀请名额并排展示。
  - 订阅区会额外提示待结算推荐奖励，避免用户只看到 code 却看不到收益进度。
- 这一阶段只做“动机强化与可见化”，不新增新的分享弹窗或裂变玩法；后续如果要加强传播效率，只能在现有文案、进度和奖励卡片上微调，不打散当前设置页的布局。

### T-012A.7 清理回退与重复入口说明
- `T-012A.7` 只负责清掉用户侧分享区域里仍然容易让人误解的文案和入口，不再新增新的 referral 行为。
- 当前要重点检查的内容主要落在 [`src/components/dashboard/views/SettingsView.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/dashboard/views/SettingsView.tsx)：
  - 空态文案是否会把“未生成推荐码”误说成系统失败。
  - 复制、分享、奖励规则的按钮文案是否还能误导用户以为要跳到别的页面。
  - “传播出口”是否存在重复入口或重复 CTA。
  - “待结算推荐奖励”是否只是状态展示，而不是新的操作入口。
- 这一阶段的目标是把设置页里和 referral 相关的所有说明都收敛成同一套真实口径：有码就展示码、无码就展示空态、能复制就复制、不能操作就禁用，不再保留假文案或冗余 CTA。
- 该阶段完成后，设置页的 referral 区域应只剩下真实的展示、复制和分享动作，不保留任何会让用户误以为还能去别处处理 referral 的重复入口。
- 当前设置页已去掉底部重复的“复制推荐码”入口，保留单一的码展示区、链接复制区与分享动作区，避免同一动作在页面上出现两个入口。

### T-012A.8 浏览器验证说明
- `T-012A.8` 负责把前面已经做完的设置页分享、奖励展示与页面刷新一致性真正走一遍浏览器，不再新增新的 referral 规则。
- 当前已经实测到的用户侧路径是：
  - 注册新账号后会自动进入 `Dashboard`，说明账号初始化与登录态建立正常。
  - 进入 `Settings` 后，referral 区域会正确显示推荐码占位、复制推荐码、复制链接、复制分享文案、系统分享与奖励展示。
  - 用户侧的推荐进度、奖励规则、待结算推荐奖励与剩余额度都能在页面里稳定回显。
- 由于原始 `/pricing` 页面已经恢复，本次浏览器验证以设置页的分享与奖励回显为主；绑定/支付相关回显保留给后续重新接回前台入口时再补验，避免把原始定价页结构一起改掉。
- 这一阶段的收口标准是：确认 `注册 -> Dashboard -> Settings -> 分享/奖励展示` 这条链路在浏览器里是真实可见的，同时不引入新的前台改动。


### T-012B Voucher 创建 / 启停 / 核销 / 支付接入
| id | description | owner | status |
|---|---|---|---|
| T-012B.1 | 盘点 voucher 的数据源、生命周期、有效期、上限、核销记录与 Stripe coupon 绑定关系 | codex | done |
| T-012B.2 | 建立 voucher 字段与权威数据源矩阵：code、状态、折扣类型、折扣值、已核销数、有效期与 Stripe coupon id | codex | done |
| T-012B.3 | 定义 voucher 的使用口径：先冻结分发策略边界（管理员发放 vs 用户可分享活动码），再明确管理员创建、用户支付时输入、核销成功、失效、超上限与重复使用 | codex | done |
| T-012B.4 | 对齐 voucher 创建与启停链路：创建、停用、启用、列表、筛选、排序与状态回显 | codex | done |
| T-012B.5 | 对齐 voucher 支付接入：Pricing / Checkout 里的 voucherCode 真实输入或可预填、校验、折扣计算与 Stripe coupon 传递 | codex | done |
| T-012B.6 | 对齐 voucher 核销链路：首次成功支付后的核销、重复使用拦截、超上限拦截与过期拦截 | codex | done |
| T-012B.7 | 对齐 voucher 后台管理展示：列表统计、搜索、状态过滤、核销次数、有效期与来源信息 | codex | done |
| T-012B.8 | 清理假券码、假折扣、伪成功提示、无效 fallback 与过期入口 | codex | done |
| T-012B.9 | 完成 voucher 域验证：创建、启停、核销、过期、超限、重复使用与非管理员访问验证 | codex | done |

### T-012B.1 数据盘点结论
- voucher 的权威数据源已经落在两张表里：
  - [`prisma/schema.prisma`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/prisma/schema.prisma) 中的 `VoucherCode` 负责券本体与生命周期，字段包括 `code / discountType / discountValue / maxRedemptions / redeemedCount / isActive / validFrom / validTo / stripeCouponId / createdAt / updatedAt`。
  - 同文件中的 `VoucherRedemption` 负责核销记录，字段包括 `voucherId / userId / stripeSessionId / appliedAmount / createdAt`，并通过 `@@unique([voucherId, userId])` 保证同一用户不会重复核销同一张券。
- 读链路已经分成三层：
  - 用户支付链路：[`src/actions/billing/checkout.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/billing/checkout.ts) 会校验 `voucherCode`、券状态、有效期、上限与 Stripe coupon 绑定，再把结果透传给 Stripe 会话。
  - 首付结算链路：[`src/app/api/webhook/stripe/route.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/api/webhook/stripe/route.ts) 会在真实付款事件里写入核销记录，并同步更新 `redeemedCount`。
  - 后台治理链路：[`src/app/(dashboard)/admin/referrals/page.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(dashboard)/admin/referrals/page.tsx) 与 [`src/components/admin/referrals/GrowthToolsConsole.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/admin/referrals/GrowthToolsConsole.tsx) 会展示 voucher 列表、状态、核销数、有效期与 Stripe coupon id；旧的 [`src/app/(dashboard)/admin/vouchers/page.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(dashboard)/admin/vouchers/page.tsx) 只是重定向入口，不承载独立 UI。
- 本阶段只做“数据盘点与生命周期边界”收口，不新增创建、启停、核销或支付逻辑；后续 `T-012B.2 ~ T-012B.9` 再分别接字段矩阵、分发策略、后台操作与验证。

### T-012B.2 字段矩阵说明
- `T-012B.2` 只负责把 voucher 的字段与权威数据源对齐，不新增字段、不改核销逻辑、不改 Stripe 结算规则。
- `VoucherCode` 是券的主实体，当前权威字段为：
  - `code`：用户或后台展示/输入的券码，支付页与后台列表都以它为主。
  - `discountType` / `discountValue`：决定折扣是固定金额还是百分比，以及具体折扣值。
  - `maxRedemptions` / `redeemedCount`：决定券的全局使用上限以及当前已核销次数。
  - `isActive`：决定券是否可用。
  - `validFrom` / `validTo`：决定券的生效与失效时间窗口。
  - `stripeCouponId`：决定券是否已经挂到 Stripe 的真实 coupon。
  - `createdAt` / `updatedAt`：决定后台列表与时间窗口筛选的排序口径。
- `VoucherRedemption` 是核销记录的权威来源，当前关键字段为：
  - `voucherId` / `userId`：决定哪张券被哪个用户使用。
  - `stripeSessionId`：用于追踪对应的支付会话。
  - `appliedAmount`：用于记录实际优惠金额。
  - `createdAt`：用于核销时间排序与审计。
  - `@@unique([voucherId, userId])`：保证同一用户不会重复核销同一张券。
- 现有消费方已经和这些字段对齐：
  - [`src/actions/billing/checkout.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/billing/checkout.ts) 读取 `VoucherCode` 做支付前校验，并把 `stripeCouponId`、`voucherCode` 透传到 Stripe。
  - [`src/app/api/webhook/stripe/route.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/api/webhook/stripe/route.ts) 在首付成功后写入 `VoucherRedemption`，并维护 `redeemedCount`。
  - [`src/app/(dashboard)/admin/referrals/page.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(dashboard)/admin/referrals/page.tsx) 和 [`src/components/admin/referrals/GrowthToolsConsole.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/admin/referrals/GrowthToolsConsole.tsx) 读取同一组字段用于后台列表与统计。
- 这一阶段的收口标准是：voucher 的“主实体字段”和“核销记录字段”都已经有明确归属，后续 `T-012B.3 ~ T-012B.9` 只是在这个基础上做分发策略、创建/启停、核销和验证，不再重新定义字段口径。

### T-012B.3 分发策略边界说明
- `T-012B.3` 只负责冻结 voucher 的分发策略边界，不新增创建、核销或支付实现；本阶段先把“谁能发、谁能领、谁能用”定清楚，再继续后续动作链路。
- 当前产品内的 voucher 口径应收敛为“管理员发放的优惠券”：
  - 券的创建、启停和列表治理都在后台完成，现有入口位于 [`src/app/(dashboard)/admin/referrals/page.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(dashboard)/admin/referrals/page.tsx) 与 [`src/components/admin/referrals/GrowthToolsConsole.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/admin/referrals/GrowthToolsConsole.tsx)。
  - 用户侧仅在支付链路输入或确认 `voucherCode`，由 [`src/actions/billing/checkout.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/billing/checkout.ts) 做校验与透传，不承担创建或分享 voucher 的职责。
  - 首付结算后由 [`src/app/api/webhook/stripe/route.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/api/webhook/stripe/route.ts) 落地核销记录，更新 `VoucherRedemption` 与 `redeemedCount`。
- 当前不把 voucher 作为用户裂变工具来设计，也不开放“用户分享活动码”的独立分发层；如果以后要做可分享活动码，那会是新的增长策略，不属于这次 `T-012B` 的默认口径。
- 这一阶段的收口标准是：voucher 先作为“后台创建、前台支付使用、Webhook 落地核销”的管理员优惠码闭环来处理，后续 `T-012B.4 ~ T-012B.9` 只在这个边界上继续实现，不再把它改造成用户侧裂变码。

### T-012B.4 创建与启停链路说明
- `T-012B.4` 只负责把 voucher 的创建、停用、启用、列表、筛选、排序与状态回显统一到同一工作流里，不再改动券的业务边界。
- 当前后台增长控制台已经具备完整的管理链路：
  - [`src/components/admin/referrals/GrowthToolsConsole.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/admin/referrals/GrowthToolsConsole.tsx) 提供创建表单、状态筛选、类型筛选、关键字搜索和表格回显。
  - [`src/actions/admin/voucher.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/admin/voucher.ts) 提供创建 Voucher、启用/停用、输入校验和写后刷新。
  - [`src/app/(dashboard)/admin/referrals/page.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(dashboard)/admin/referrals/page.tsx) 以数据库 `createdAt` 排序后把券列表交给控制台渲染，确保后台看到的列表和数据库一致。
- 当前状态回显已经覆盖：
  - `ACTIVE / INACTIVE`
  - `启用中 / 已停用`
  - `redeemedCount / maxRedemptions`
  - `stripeCouponId`
  - `validFrom / validTo`
- 这一阶段的收口标准是：管理员在后台增长控制台里就能完成 voucher 的创建、启停与筛选查看，不需要跳到新的独立路由或重复页面。
- 本阶段额外完成了创建错误语义收口：重复 code 现在会返回明确的 `DUPLICATE_CODE`，启停不存在的 voucher 会返回 `VOUCHER_NOT_FOUND`，避免把业务错误吞成泛化失败。

### T-012B.5 支付接入说明
- `T-012B.5` 只负责 voucher 在支付链路里的接入方式，不重新定义券的前台入口；当前代码里已经存在完整的支付校验与 Stripe 透传逻辑，并且原始 `/pricing` 页面保留了原有结构，只在页面内补入券码输入、实时校验与折扣预览。
 - 条目化收口如下：
  - 只在付费链路中处理 `voucherCode`，不把 voucher 放进注册页。
  - 用户可在付款前输入或确认 `voucherCode`，校验通过后实时展示折扣后的价格。
  - 价格确认后再进入 Stripe checkout，确保折扣只影响真实下单结果。
  - 后端校验、Stripe 透传与 webhook 核销三段链路已经存在并可串联。
  - 不新增独立优惠券确认页，也不改造原始 `/pricing` 页面结构。
- 这一阶段的目标是把“这单用了什么优惠”在支付前确认清楚，并尽量减少跳转。

### T-012B.6 核销链路说明
- `T-012B.6` 只负责把 voucher 的首次核销链路收口，不改动券的创建、启停或前台入口。
- 当前真实核销逻辑已经在 [`src/app/api/webhook/stripe/route.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/api/webhook/stripe/route.ts) 里落地，核心行为是：
  - 只有真实付款事件才会进入核销流程。
  - 先按 `voucherCode` 找到 `VoucherCode`，再检查 `isActive / validFrom / validTo / maxRedemptions`。
  - 通过 `VoucherRedemption` 的 `[voucherId, userId]` 唯一约束拦截重复使用。
  - 通过 `redeemedCount` 与 `maxRedemptions` 拦截超上限使用。
  - 通过 `validFrom / validTo` 拦截未生效与已过期的券。
  - 核销成功后会写入 `VoucherRedemption`，并在同一事务里维护 `redeemedCount`。
- `checkout` 只负责把前台传来的 `voucherCode` 透传到 Stripe metadata，不承担最终核销判断；最终核销的权威时点还是 webhook 的首付成功事件。
- 这一阶段的收口标准是：重复使用、超上限、未生效、已过期这四类异常都能在核销链路里被明确拦截，并且核销成功后数据库里有对应的 `VoucherRedemption` 与 `redeemedCount` 变化。

### T-012B.7 后台管理展示说明
- `T-012B.7` 只负责把 voucher 的后台展示口径收口，不再新增新的管理页面或新的展示字段。
- 当前 voucher 管理已经统一挂在 [`src/app/(dashboard)/admin/referrals/page.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(dashboard)/admin/referrals/page.tsx) 和 [`src/components/admin/referrals/GrowthToolsConsole.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/admin/referrals/GrowthToolsConsole.tsx)：
  - 列表统计：顶部 KPI 会展示可用 Voucher 数量与已核销次数。
  - 搜索：支持按 `code` 和 `stripeCouponId` 模糊检索。
  - 状态过滤：支持 `ACTIVE / INACTIVE` 过滤。
  - 类型过滤：支持 `AMOUNT / PERCENT` 过滤。
  - 核销次数：以 `redeemedCount / maxRedemptions` 形式直接展示。
  - 有效期：`validFrom / validTo` 都会在表格里回显。
  - 来源信息：`stripeCouponId` 在表格里可见，便于排查券与 Stripe 的绑定关系。
- 旧的 [`src/app/(dashboard)/admin/vouchers/page.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(dashboard)/admin/vouchers/page.tsx) 只承担重定向，不再作为独立展示页；因此本阶段的后台展示收口应以 Growth Console 为准。
- 这一阶段的收口标准是：管理员在同一个后台控制台里就能完成 voucher 的搜索、过滤、状态查看与核销观察，不需要再额外拆一个 voucher 管理页面。

### T-012B.8 假数据与回退清理说明
- `T-012B.8` 只负责清理 voucher 相关的假数据、旧文案与回退入口，不再新增新的管理能力。
- 当前已经确认不再作为正式入口的部分包括：
  - [`src/app/(dashboard)/admin/vouchers/page.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(dashboard)/admin/vouchers/page.tsx) 仅做重定向，不承载独立 voucher 页面。
  - 后台 voucher 列表与操作已经统一进 [`src/app/(dashboard)/admin/referrals/page.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(dashboard)/admin/referrals/page.tsx) 与 [`src/components/admin/referrals/GrowthToolsConsole.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/admin/referrals/GrowthToolsConsole.tsx)。
- 前台和支付相关的 voucher 校验已经走真实链路，不再依赖 mock/fake/preview-only 业务数据：
  - [`src/actions/billing/checkout.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/billing/checkout.ts) 负责校验 `voucherCode`、有效期、上限与 Stripe coupon。
  - [`src/app/api/webhook/stripe/route.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/api/webhook/stripe/route.ts) 负责首付后核销和 `redeemedCount` 更新。
- 这一阶段的收口标准是：voucher 不再依赖旧回退页、伪成功文案或假数据源，所有正式入口都指向真实后台控制台与真实支付链路；如果未来要再做演示性质内容，必须明确放到 demo/debug，不允许混入正式展示。
- 本阶段还删除了不再引用的 [`src/app/(dashboard)/admin/vouchers/VoucherAdminClient.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(dashboard)/admin/vouchers/VoucherAdminClient.tsx)，确保旧的独立 voucher 客户端不会再被误用。

### T-012B.9 域验证说明
- `T-012B.9` 只负责 voucher 域的最终真实性验证，不再新增任何字段、页面或管理能力。
- 本阶段已经完成的验证覆盖：
  - voucher 创建：可在后台控制台创建新券，并落到真实 `voucherCode` 数据行。
  - voucher 启停：可在后台控制台切换 `ACTIVE / INACTIVE`，状态会真实回写数据库。
  - voucher 核销：真实首付 webhook 会写入 `VoucherRedemption`，并更新 `redeemedCount`。
  - voucher 过期：过期券不会进入有效核销流程。
  - voucher 超限：当 `redeemedCount` 达到 `maxRedemptions` 后，后续核销会被拦截。
  - 重复使用：同一用户对同一 voucher 的重复核销会被唯一约束拦截。
  - 非管理员访问：voucher 创建与启停动作已通过服务端身份校验限制为管理员可操作。
- 实际烟雾验证结果：
  - 新建的 active voucher 可被真实核销一次。
  - expired voucher 不会产生核销记录。
  - 通过直连数据库与真实 webhook 回放，`activeRedemptions = 1`、`expiredRedemptions = 0`，与预期一致。
- 这一阶段的收口标准是：voucher 域的创建、启停、核销、过期、超限、重复使用与权限边界都已用真实数据库和真实 webhook 跑通，`T-012B.9` 可视为完成。


### T-012C 后台增长工具台统一概览和治理
| id | description | owner | status |
|---|---|---|---|
| T-012C.1 | 盘点 `/admin/referrals`、`/admin/vouchers` 的页面结构、tab、筛选、统计、操作入口与角色边界 | codex | done |
| T-012C.2 | 建立后台增长工具台的字段矩阵：概览 KPI、推荐关系表、voucher 表、筛选项、详情项与操作项 | codex | done |
| T-012C.3 | 定义治理边界：`ADMIN` / `TEACHER` 的可见性、可操作性、死链处理、路由跳转与空态策略 | codex | done |
| T-012C.4 | 对齐后台增长工具台读取链路：推荐列表、voucher 列表、统计卡、时间窗口、搜索与分页 | codex | done |
| T-012C.5 | 对齐后台增长工具台写链路：创建 voucher、启停 voucher、权限校验、重复提交与幂等 | codex | done |
| T-012C.6 | 补后台概览的真实统计与趋势：推荐数、完成率、待发奖励、可用 voucher 与已核销次数 | codex | done |
| T-012C.7 | 补缓存失效、审计留痕、错误态、空态与角色边界验证 | codex | done |
| T-012C.8 | 清理假统计、旧文案、占位数据、废弃入口与无效跳转 | codex | done |
| T-012C.9 | 完成后台增长工具台验证：管理员 / 教师可见性、筛选、创建、启停、刷新一致性与数据库核账 | codex | done |


### T-012C.1 盘点说明
- `T-012C.1` 已把 `/admin/referrals` 的页面结构、tab 切换、统计卡、筛选区和表格工作区统一梳理成一个入口，并补了一个可复用的增长工具台 helper。
- 当前后台增长工具台的可见性边界已经固定为：
  - `ADMIN`：可见 `referrals` 与 `vouchers` 两个 tab。
  - `TEACHER`：只可见 `referrals` tab。
  - 其他角色：不进入后台增长工具台，仍会被重定向到 `/dashboard`。
- 已完成的代码层收口包括：
  - [`src/lib/admin/growth-console.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/lib/admin/growth-console.ts) 统一管理 tab 与角色边界。
  - [`src/app/(dashboard)/admin/referrals/page.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(dashboard)/admin/referrals/page.tsx) 改为使用 helper 计算初始 tab。
  - [`src/components/admin/referrals/GrowthToolsConsole.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/admin/referrals/GrowthToolsConsole.tsx) 继续承载推荐关系与 voucher 的统一工作区。
- 本次验证也已经覆盖：
  - helper 单测
  - voucher admin 单测
  - `pnpm -s tsc --noEmit`
  - `pnpm run build`
- 这一阶段的收口标准是：后台增长工具台的页面入口、tab 规则与角色边界已经可复用、可测试、可维护，后续 `T-012C.2 ~ T-012C.9` 只需要继续在这个基础上补字段矩阵、读取/写入链路与清理验证。

### T-012C.2 字段矩阵说明
- `T-012C.2` 已把后台增长工具台需要用到的字段、列、筛选项与操作项统一成一份共享矩阵，不再让页面自己散写 labels。
- 已落地的字段矩阵 helper 位于 [`src/lib/admin/growth-console-matrix.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/lib/admin/growth-console-matrix.ts)，覆盖四类内容：
  - 概览 KPI：`referrals-total / referrals-completed / referrals-deferred / vouchers-active / vouchers-redeemed`
  - 推荐关系表：`referrer / referee / referralCode / status / rewardGranted / deferredReward / createdAt`
  - Voucher 表：`code / discountType / discountValue / usage / stripeCouponId / validity / status / action`
  - 操作与筛选：推荐状态筛选、Voucher 状态筛选、Voucher 类型筛选，以及增长工具台动作定义
- 页面消费已经对齐：
  - [`src/components/admin/referrals/GrowthToolsConsole.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/admin/referrals/GrowthToolsConsole.tsx) 直接读取字段矩阵来渲染 referral / voucher 表头与筛选项。
  - helper 单测已覆盖 admin 与 teacher 的字段可见性差异。
- 这一阶段的收口标准是：增长工具台的字段矩阵已经被抽离成共享 helper，后续 `T-012C.3 ~ T-012C.9` 只需要继续在这份矩阵上补治理边界、读取/写入链路和最终核验。

### T-012C.3 治理边界说明
- `T-012C.3` 已把后台增长工具台的治理边界、死链收口与空态兜底统一冻结，不再让旧的 `/admin/vouchers` 作为独立正式入口。
- 现在正式入口只保留 [`src/app/(dashboard)/admin/referrals/page.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(dashboard)/admin/referrals/page.tsx) 这一条后台增长工具台路由；[`src/app/(dashboard)/admin/vouchers/page.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(dashboard)/admin/vouchers/page.tsx) 仅保留为兼容重定向，不再承担第一类页面职责。
- 当前角色边界已经收紧为：
  - `ADMIN`：可见 `referrals / vouchers` 两个 tab，可以进入 voucher 兼容路由并被重定向到统一控制台。
  - `TEACHER`：只可见 `referrals` tab，不能看到 voucher tab，也不会被引导到 voucher 独立页面。
  - 其他角色：不会进入后台增长工具台，统一回落到 `/dashboard`。
- 死链与空态策略已经统一：
  - 任何旧的 `/admin/vouchers` 访问都只做兼容跳转，不再被当作正式 active route。
  - sidebar 与 active-route 计算只认统一的增长工具台入口，不再把旧 voucher 路由渲染成一等正式导航。
  - 空态继续由 `GrowthToolsConsole` 自身承接，避免因角色差异或数据为空而回退到伪页面、假文案或死链接。
- 这一阶段已经通过以下验证确认收口：
  - [`src/lib/admin/__tests__/growth-console.test.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/lib/admin/__tests__/growth-console.test.ts)
  - [`src/lib/admin/__tests__/growth-console-matrix.test.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/lib/admin/__tests__/growth-console-matrix.test.ts)
  - [`src/actions/admin/__tests__/voucher.test.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/admin/__tests__/voucher.test.ts)
  - `pnpm -s tsc --noEmit`
  - `pnpm run build`
- 这一阶段的收口标准是：后台增长工具台只保留一个正式增长入口，ADMIN / TEACHER 的可见性、死链回收与空态兜底都已经收紧，后续 `T-012C.4 ~ T-012C.9` 只需要继续在这条统一入口上补读取、写入、验证与清理。

### T-012C.4 读取链路说明
- `T-012C.4` 已把后台增长工具台的读取链路统一收口到同一个页面壳子里，推荐列表、voucher 列表、统计卡、时间窗口、搜索与分页现在都从同一份数据入口中派生，不再各自散写读取逻辑。
- 当前读链路的实际来源是：
  - [`src/app/(dashboard)/admin/referrals/page.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(dashboard)/admin/referrals/page.tsx) 负责一次性取回 referral / voucher 数据，并根据角色只给 ADMIN 传 voucher 数据。
  - [`src/components/admin/referrals/GrowthToolsConsole.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/admin/referrals/GrowthToolsConsole.tsx) 负责在前端统一做时间窗口过滤、关键词过滤、状态过滤和分页展示。
  - [`src/lib/admin/growth-console-matrix.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/lib/admin/growth-console-matrix.ts) 继续作为列、筛选项和动作项的权威矩阵来源。
- 读取链路已经覆盖这些维度：
  - 推荐列表：按 `referralCode / referrer / referee / status / rewardGranted / createdAt` 统一展示，并支持关键词与状态筛选。
  - Voucher 列表：按 `code / discountType / discountValue / usage / stripeCouponId / validity / status / action` 统一展示，并支持关键词、状态、类型筛选。
  - 统计卡：按 `7D / 30D / ALL` 三档时间窗口计算推荐数、成功转化、待发奖励、可用 Voucher 与已核销次数。
  - 分页：推荐列表与 Voucher 列表都在控制台内做本地分页，筛选条件变化时自动回到第一页，避免空页和错误页码。
- 死链与空态仍然沿用 `T-012C.3` 里统一收口后的策略：旧的 `/admin/vouchers` 只做兼容重定向，空状态只在 Growth Console 内部渲染，不回退到伪页面。
- 这一阶段的收口标准是：后台增长工具台的读取链路已经统一为一个正式入口、一套共享矩阵、同一组时间窗口与搜索/分页逻辑，后续 `T-012C.5 ~ T-012C.9` 只需要继续在这条链路上补写入、真实统计与最终验证。

### T-012C.5 写链路说明
- `T-012C.5` 已把后台增长工具台的写链路统一收口到 voucher 创建、启停与权限校验这三类动作，不再引入新的写入口或新的独立 voucher 页面。
- 当前写链路的实际实现已经对齐到：
  - [`src/actions/admin/voucher.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/admin/voucher.ts) 负责 voucher 创建、启停、管理员身份校验、重复 code 拦截与同态短路。
  - [`src/components/admin/referrals/GrowthToolsConsole.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/admin/referrals/GrowthToolsConsole.tsx) 负责在统一控制台里触发创建与启停动作。
- 当前写链路已经覆盖这些边界：
  - 创建 voucher：只允许管理员创建，重复 code 会返回明确的 `DUPLICATE_CODE`。
  - 启停 voucher：只允许管理员切换状态；如果用户重复点击同一个状态，服务端会直接短路为 `UNCHANGED`，不再重复写库。
  - 权限校验：未登录或非管理员访问会被统一拒绝，不会继续写入。
  - 重复提交与幂等：创建走唯一约束防重，启停走同态短路防重，避免重复落库和无意义刷新。
- 这一阶段的收口标准是：后台增长工具台的写链路已经在服务端形成真实写入路径，重复提交与权限边界都已收紧，后续 `T-012C.6 ~ T-012C.9` 只需要继续补真实统计、缓存刷新与最终验证。

### T-012C.6 真实统计与趋势说明
- `T-012C.6` 已把后台概览的真实统计与趋势收口到 Growth Console 的 KPI 卡里，推荐数、完成率、待发奖励、可用 voucher 与已核销次数都不再是静态占位，而是从当前真实数据中计算出来。
- 当前统计口径已经统一为：
  - 推荐数：`referrals.length` 的总量，以及按 `7D / 30D / ALL` 窗口切出的当前窗口推荐数。
  - 完成率：`COMPLETED / 当前窗口推荐总数`，直接显示在“成功转化”卡的说明里。
  - 待发奖励：`status = DEFERRED` 的数量。
  - 可用 voucher：`isActive = true` 的 voucher 数量。
  - 已核销次数：`redeemedCount > 0` 的 voucher 数量，以及当前窗口内 `redeemedCount` 的变化趋势。
- 当前趋势口径也已经统一为窗口对比：
  - 推荐数 / 成功转化 / 待发奖励 / 可用 voucher / 已核销次数都按 `7D / 30D / ALL` 的窗口计算。
  - `ALL` 视角只显示累计，不再强行展示同比或环比。
  - 成功转化卡额外补充了完成率说明，避免只看到“完成数”却看不到“转化率”。
- 这一阶段的收口标准是：后台增长工具台的概览统计已经全部接入真实数据和真实窗口趋势，后续 `T-012C.7 ~ T-012C.9` 只需要继续补缓存、审计和最终核账。

### T-012C.7 缓存与审计验证说明
- `T-012C.7` 已把后台增长工具台的缓存失效、审计留痕、错误态、空态与角色边界验证收口为一组可重复执行的验证项，不再引入新的页面行为。
- 当前缓存失效已经通过可复用 helper 固定下来：
  - [`src/lib/referrals/cache.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/lib/referrals/cache.ts) 负责 referral 读链路刷新，覆盖 `/dashboard`、`/dashboard/settings`、`/admin/referrals`、`/admin/users` 以及具体用户详情页。
  - [`src/lib/cache/sitewide.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/lib/cache/sitewide.ts) 负责 admin dashboard 概览 tag 的失效，确保后台概览不会停留在旧缓存。
- 当前审计留痕已经通过 security log helper 统一口径：
  - [`src/lib/admin/security-log.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/lib/admin/security-log.ts) 统一了高风险动作、审计级别与 metadata 摘要格式。
  - [`src/actions/admin/dashboard-overview.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/admin/dashboard-overview.ts) 继续从 `securityLog` 派生 risks / audits，保证首页看到的是同一套真实审计事件。
- 当前错误态与空态已经在 UI 内收口：
  - Growth Console 的推荐表与 Voucher 表都保留“当前筛选下暂无…”的空态文案，不再回退到伪页面。
  - `createVoucherCodeAction()` / `toggleVoucherStatusAction()` 的错误结果会在前端 toast 中显式回显，避免静默失败。
- 角色边界验证也已经被测试钉住：
  - `ADMIN` 与 `TEACHER` 的可见 tab / 可见 KPI 差异有 helper 测试。
  - `ADMIN` 的写链路幂等短路、重复 code、非管理员拒绝与不存在 voucher 的错误语义都有单测覆盖。
  - cache helper、security log helper 与 growth console helper 已一起跑过 `vitest`、`tsc` 与 `build`。
- 这一阶段的收口标准是：缓存失效、审计留痕、错误态、空态与角色边界都已经通过 helper 和单测验证闭环，后续 `T-012C.8 ~ T-012C.9` 只需要继续做最终清理与数据库核账。

### T-012C.8 清理说明
- `T-012C.8` 已把后台增长工具台里残留的旧英文 voucher 文案、旧入口回调与兼容跳转进一步清理完毕：
  - voucher 区域的展示文案已统一成中文优惠券口径，包含表头、筛选项、空态、按钮、输入提示与状态标签。
  - [`src/actions/admin/voucher.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/admin/voucher.ts) 已移除对 `/admin/vouchers` 的重复写后刷新，只保留真实生效入口所需的 `/admin/referrals` 与 `/pricing`。
  - 不再承载正式 UI 的 [`src/app/(dashboard)/admin/vouchers/VoucherAdminClient.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(dashboard)/admin/vouchers/VoucherAdminClient.tsx) 已删除，旧的独立 voucher 客户端不再保留。
- 本阶段已经补过单测、`tsc` 和 `build`，确认旧文案与旧跳转清理后没有带来回归。
- 这一阶段的收口标准是：后台增长工具台不再保留容易误导的英文 voucher 文案、废弃回写入口与独立旧客户端，后续只保留真实管理控制台与真实支付链路。

### T-012C.9 验证说明
- `T-012C.9` 已把后台增长工具台的最终核账收口为一次可重复执行的 smoke 验证，不再追加新的页面行为。
- 本次验证覆盖了：
  - `ADMIN` / `TEACHER` 的可见 tab 差异：`ADMIN` 可见 `referrals / vouchers`，`TEACHER` 仅可见 `referrals`。
  - 控制台字段矩阵差异：`ADMIN` 保留 voucher 字段与动作，`TEACHER` 不出现 voucher 列与筛选项。
  - 临时优惠券的创建、读取、停用、回读与删除，前后数据库数量一致，没有遗留脏数据。
- 本次验证使用了 [`scripts/t012c9-growth-console-smoke.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/scripts/t012c9-growth-console-smoke.ts) 完成数据库核账，结果为：
  - `ok: true`
  - `before.referralsCount = 2`
  - `before.vouchersCount = 9`
  - `adminTabs = ['referrals', 'vouchers']`
  - `teacherTabs = ['referrals']`
  - `after.referralsCount = 2`
  - `after.vouchersCount = 9`
- 这一阶段的收口标准是：后台增长工具台的角色边界、筛选入口、创建 / 启停 / 刷新一致性与数据库核账都已完成，`T-012C` 可以视为收口。


### T-013 内容导入入口域
| id | description | owner | status |
|---|---|---|---|
| T-013.1 | 盘点 `/admin/content`、`/admin/content/import` 的入口、上传流、导入状态与当前数据源 | codex | done |
| T-013.2 | 建立内容源文件、导入任务、处理状态、结果统计、错误摘要的字段映射与权威数据源矩阵 | codex | done |
| T-013.3 | 对齐内容导入读取链路：入口页、导入记录、状态轮询、结果汇总与错误展示 | codex | done |
| T-013.4 | 对齐内容导入写链路：上传、创建导入任务、重试、取消、权限与幂等 | codex | done |
| T-013.5 | 清理假导入结果、假 OCR/导入状态、假成功提示，补齐空态/错误态/禁用态 | codex | done |
| T-013.6 | 完成内容导入域验证：任务创建核账、状态流转核账、重复提交验证 | codex | done |

### T-014 内容审核域
##### Phase A：边界与约束
| id | description | owner | status |
|---|---|---|---|
| T-014.1 | 盘点 `/admin/content/review`、`/admin/content/review/[questionId]`、`/admin/content/review?tab=...` 的列表、详情、抽屉、已删除视图、操作日志与数据源入口，明确审核主域边界 | codex | done |
| T-014.2 | 建立审核字段口径与权威数据源矩阵，覆盖题干、选项、答案、解析、科目、章节、难度、质量分、状态、审核人、审核时间、日志、真题标记与软删除字段 | codex | done |
| T-014.3 | 固化审核状态机与动作边界：待审、已校对、已发布、已驳回、已归档、已删除；明确通过 / 驳回 / 编辑保存 / 删除 / AI补章节的权限、幂等与审计落库 | codex | done |
| T-014.4 | 明确审核域与报错治理域的责任边界：`pendingReports` 仅作统计展示，报错处理动作归 `T-015`，审核域不重复实现报错治理 | codex | done |

##### Phase B：开发、修复、调试
| id | description | owner | status |
|---|---|---|---|
| T-014.5 | 对齐审核读取链路：待审列表、详情聚合、历史回放、筛选排序、组合题 / 子题、真实空态与登录拦截 | codex | done |
| T-014.6 | 对齐审核写链路：通过、驳回、编辑保存、删除、批量动作、AI补章节、权限校验、幂等、防重、审计落库与写后刷新 | codex | done |
| T-014.7 | 对齐审核抽屉与单题页交互：`returnTo` 回跳、`questionId` / `reviewAction` / `nextQuestionId` URL 托管、连续审核流、用户端预览与真实 `subjectId / chapterId` 编辑 | codex | done |
| T-014.8 | 对齐审核列表信息完整化：导入时间 / 审核时间、批次名称、排序选项、软删除 tab、KPI 口径与“刷新 / 操作日志”入口 | codex | done |
| T-014.9 | 对齐审核页右上角真实日志：`content_review_logs` 读取、手动刷新、本地搜索、真实审核人 / 动作展示与空态提示 | codex | done |

##### Phase C：清理和收口验证
| id | description | owner | status |
|---|---|---|---|
| T-014.10 | 清理假审核队列、假状态流、静态默认值、假成功提示与死链，确保列表 / 抽屉 / 单题页全部回到真实数据 | codex | done |
| T-014.11 | 完成审核域验证：审核动作核账、重复处理验证、删除回收验证、前后端状态一致性验证、刷新后仍为真实数据 | codex | done |

### T-015 内容质控与统计域
| id | description | owner | status |
|---|---|---|---|
| T-015.1 | 盘点 `/admin/content/reports`、`/admin/content/statistics` 的图表、列表、筛选、CTA 与当前数据源 | codex | done |
| T-015.2 | 建立报错统计、题量统计、质量分布、处理效率等字段映射与权威数据源矩阵 | codex | done |
| T-015.3 | 对齐质控与统计读取链路：图表、列表、时间窗口、筛选条件与口径说明 | codex | done |
| T-015.4 | 对齐质控与统计写链路：报错处理、状态更新、统计刷新、权限与幂等 | codex | done |
| T-015.5 | 清理假图表、假统计、假报错回执，补齐空态/错误态/权限态 | codex | done |
| T-015.6 | 完成内容质控与统计域验证：统计字段核账、报错处理核账、重复操作验证 | codex | done |

### T-016 排行榜与成长进度域
##### Phase A：边界与约束
| id | description | owner | status |
|---|---|---|---|
| T-016.1 | 清理旧 `AppSidebar` 的硬编码 XP 卡，确保遗留侧栏不再维护一套假的成长进度展示 | codex | done |
| T-016.2 | 盘点 `/dashboard/leaderboard`、sidebar 经验值卡、`actions/leaderboard`、`/api/leaderboard/summary`、`DashboardLayout` 与 `LeaderboardView` 的数据入口，明确排行榜与成长进度的主边界 | codex | done |
| T-016.3 | 建立排行榜与成长进度字段矩阵，覆盖 `rank / score / period / myRank / gap / user.xp / level / nextLevelXp / streak / accuracy / badges / subscriptionTier` 等权威数据源与展示口径 | codex | done |
| T-016.4 | 在 `/admin/rewards` 下创建“奖励中心”路由与前端界面，作为奖励规则、成就联动与排行榜观察的统一控制台 | codex | done |
| T-016.4.1 | 奖励中心前端界面骨架：创建 `/admin/rewards` 页面，完成 `ADMIN` 权限、奖励规则列表、成就联动列表、排行榜观察区、操作日志入口与响应式布局 | codex | done |
| T-016.4.2 | 奖励中心奖励规则模块：展示并管理任务类型、动作、对应 XP、完成次数上限、启停状态、操作与新增动作入口 | codex | done |
| T-016.4.3 | 奖励中心成就联动模块：展示并管理成就类型、触发条件、成就上限、启停状态与编辑 / 停用入口 | codex | done |
| T-016.4.4 | 奖励中心排行榜观察模块：支持周榜 / 月榜 / 总榜切换、榜单快照、刷新 / 重算入口与缓存状态说明 | codex | done |
| T-016.4.5 | 奖励中心发放与校正模块：提供受控的 XP / 徽章 / 排行榜分数补发、回滚前确认、幂等与权限校验 | codex | done |
| T-016.4.6 | 奖励中心操作日志模块：记录奖励规则、成就规则与排行榜相关操作日志、变更前后、操作者、时间、结果与失败原因 | codex | done |
| T-016.4.7 | 奖励中心状态模块：统一处理空态 / 加载 / 错误 / 未授权 / 无数据 / 缓存失效等展示与交互收口 | codex | done |
| T-016.4.8 | 奖励中心后端支持模块：补齐奖励规则表、成就联动规则表、发放与校正记录表与统一审计流水表，支撑奖励规则 / 成就联动 / 排行榜变动 / 发放与校正的真实写入与读取 | codex | done |
| T-016.5 | 固化产品边界：sidebar 经验值卡只负责持续成长进度，`/dashboard/leaderboard` 只负责排名与追赶目标，右侧成长总览负责下一步行动，明确空态 / 加载 / 错误态文案 | codex | done |

##### Phase B：开发、修复、调试
| id | description | owner | status |
|---|---|---|---|
| T-016.6 | 对齐 `/dashboard/leaderboard` 读取链路：去除 mock 榜单与固定名次，接入真实后端数据、周期切换、当前用户定位与追赶目标计算 | codex | done |
| T-016.7 | 对齐 sidebar 经验值卡读取链路：接入真实 `user.xp`、等级计算与下一级进度，确保练习 / 社区等增益后可以正确刷新 | codex | done |
| T-016.8 | 对齐后端能力链路：确保 `getLeaderboard`、`getUserRank`、`/api/leaderboard/summary` 与缓存策略可支撑首屏与切换请求 | codex | done |
| T-016.9 | 对齐排行榜辅面板：追赶目标、推荐挑战、CTA 跳转与上下文说明，保证信息直接服务排行榜与下一步动作，而不是回到独立成长面板语义 | codex | done |
| T-016.10 | 对齐交互修复与调试体验：周期切换、刷新、网络错误、空榜、未登录、当前自己定位与请求超时回退 | codex | done |

##### Phase C：清理和收口验证
| id | description | owner | status |
|---|---|---|---|
| T-016.11 | 清理 mock 榜单、假排名、假百分位、硬编码 XP / Level、静态头像与伪说明文案，确保页面和 sidebar 都回到真实数据 | codex | done |
| T-016.12 | 完成排行榜与成长进度域验证：榜单字段核账、我的排名核账、XP / level 核账、周期切换与刷新一致性验证 | codex | done |

### T-016.11 mock 清理与真实化（已完成）
- `src/components/leaderboard/mock-data.ts` 已删除，排行榜域不再保留独立的 mock 榜单数据文件。
- `LeaderboardView` 中当前用户的头像兜底已经收口为 `null`，列表与追赶目标统一走首字母回退，不再拼接 `pravatar` 这类伪头像 URL。
- 右侧成长面板的伪说明文案已经清理，空状态改为直接、真实的“暂无”提示，不再暗示不存在的数据进度。
- 排行榜页与 sidebar 现在都只依赖真实数据：页面首屏、周期切换、成长进度与段位展示都回到后端真实值，不再混用 mock / hardcoded 口径。
- 这一步的收口标准已经达到：页面展示、侧栏成长卡与排行榜读取链路都没有新的假数据源或静态展示壳残留。

### T-016.12 最终核账（已完成）
- 已执行真实数据库核账，分别对 `WEEKLY / MONTHLY / ALL_TIME` 三个周期校验排行榜 action 输出、数据库排序结果与 `getUserRank()` 返回值，当前结果一致；本地库现状为周榜和月榜空榜、总榜存在 1 条有效记录。
- 已抽取真实用户样本核验 `users.xp -> calculateLevel -> calculateNextLevelXp -> getAchievementOverview()` 这一条成长进度链路，`XP / level / nextLevelXp` 全部一致，sidebar 的等级与进度条公式没有口径漂移。
- 已补做接口级验证：`/api/leaderboard/summary` 在三种周期下都返回 `200`，`entries / myRank` 与 action 层一致，周期切换与手动刷新依赖的 route 输出已稳定。
- 本轮核账中发现 route 层原先调用 `getCachedLeaderboardEntries()` 会触发 `cacheLife()` 配置限制，已改为在接口内直接走 `getLeaderboard()`；页面首屏仍可继续使用缓存包装函数，接口切换链路不再受该限制影响。
- 这一步收口后，排行榜与成长进度域的剩余状态符合预期：空榜返回真实空态，不再伪造榜单；有榜时名次、分数和用户定位都回到真实数据库结果。

### T-016.1 清理记录（已完成）
- 旧 `AppSidebar` 中硬编码的 XP / Level 卡已移除，不再维护一套独立的假成长进度展示。
- 当前主站侧栏成长进度的真实口径以 [DashboardLayout](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/layout/dashboard-layout.tsx) 为准，继续由 `userXp`、`calculateLevel` 与 `calculateNextLevelXp` 驱动。
- 这次 cleanup 只影响 legacy 侧栏组件，不改变 `/dashboard/leaderboard` 的数据链路与后续真实排行榜开发边界。
- 相关回归测试已同步对齐并通过，旧侧栏仍保留的导航与品牌渲染不受影响。

### T-016.2 数据盘点结论（已完成）
- `/dashboard/leaderboard` 当前的首屏读取链路是：[`src/app/(dashboard)/dashboard/leaderboard/page.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(dashboard)/dashboard/leaderboard/page.tsx) 先拿 `getDashboardShellProfile()`，再并行读取 `getCachedAchievementOverview(profile.id)` 与 `getCachedUserBadges(profile.id)`，并把初始榜单和当前名次交给 [`LeaderboardClientWrapper`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(dashboard)/dashboard/leaderboard/client-wrapper.tsx)。
- 当前页面首屏已经切到真实排行榜数据：`getCachedLeaderboardEntries('WEEKLY', 100)` 与 `getUserRank(...)` 负责提供初始榜单和当前名次；周期切换后的真实排行数据入口在 [`src/app/api/leaderboard/summary/route.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/api/leaderboard/summary/route.ts)。
- [`src/components/leaderboard/LeaderboardView.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/leaderboard/LeaderboardView.tsx) 的真实读取逻辑已经明确：周期切换后会请求 `/api/leaderboard/summary?period=...&limit=100`，由后端返回 `period / entries / myRank`，并在前端计算当前定位、追赶目标和展示态。
- sidebar 经验值卡的权威来源不是 legacy `AppSidebar`，而是 [`src/components/layout/dashboard-layout.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/layout/dashboard-layout.tsx)：它直接消费 `userXp`，并通过 `calculateLevel`、`calculateNextLevelXp`、`levelProgress` 算出等级和进度。
- 这条主边界下，成长进度与排行榜的字段归属应收敛为：
  - 排行榜：`rank / score / period / myRank / gap / user.avatar / user.username`
  - 成长进度：`user.xp / level / nextLevelXp / streak / accuracy / badges / subscriptionTier / subscriptionEnd`
  - 右侧成长面板：`overview`、`badges` 与下一步 CTA
- 这一步的收口标准是：后续 `T-016.4 ~ T-016.13` 只在这套边界上继续做真实数据接入、UI 修复和验证，不再重新定义排行榜与成长进度的来源口径。

### T-016.3 字段矩阵与展示口径（已完成）
- 排行榜侧的权威字段已经固定为：
  - `period`：周榜 / 月榜 / 总榜的切换口径，决定当前请求和列表范围。
  - `entries[].rank`：榜单名次，用于列表排序、`myRank` 回显和追赶目标计算。
  - `entries[].score`：榜单分值，即排行榜主展示数值。
  - `entries[].user.id / user.username / user.avatar`：用户身份与头像展示。
  - `myRank.rank / myRank.score`：当前用户在当前周期里的定位回显。
- 成长进度侧的权威字段已经固定为：
  - `userXp`：sidebar 常驻成长卡的直接输入值。
  - `level`、`nextLevelXp`、`levelProgress`：由 `calculateLevel`、`calculateNextLevelXp`、`calculateLevelProgress` 计算得到。
  - `overview.streak / overview.accuracy / overview.questions / overview.correctAnswers / overview.posts / overview.comments`：右侧成长总览与徽章进度的核心口径。
  - `badges[]`：徽章列表与解锁状态，用于成长面板和下一步行动推荐。
  - `subscriptionTier / subscriptionEnd`：决定顶层成长展示与订阅状态联动。
- 产品边界已经明确：
  - sidebar 经验值卡只做“持续成长进度展示”，不承载排行榜排名逻辑。
  - `/dashboard/leaderboard` 只做“段位、排名、追赶目标、挑战建议”，不重复 sidebar 的 XP 进度条。
  - 右侧成长面板只做“成长总览 + 徽章进度 + 下一步 CTA”，不和榜单列表抢主信息。
  - 旧 `AppSidebar` 只保留为 legacy 兼容实现，不再作为主站成长口径来源。
- 这一步的收口标准是：后续 `T-016.4 ~ T-016.13` 只在这套字段矩阵和展示边界上继续做读取、修复、验证，不再扩散新的口径分歧。

### T-016.4.1 奖励中心前端界面骨架（说明）
- 这个页面只面向 `ADMIN`，目标不是展示个人成长，而是作为“奖励系统控制台”来管理奖励规则、成就联动与排行榜观察。
- 当前骨架已经落地的页面结构为：
  1. 顶部标题区，只保留 `奖励中心` 标题与 `操作日志` 入口，不再保留学员成长语义的说明文案与 KPI 卡片。
  2. `奖励规则` 主列表，集中展示任务类型、动作、对应 XP、完成次数上限、启停状态与编辑 / 停用入口。
  3. `成就联动` 列表，集中展示成就类型、触发条件、成就上限、启停状态与编辑 / 停用入口。
  4. `排行榜观察` 区，集中展示周榜 / 月榜 / 总榜切换后的真实榜单快照。
  5. `操作日志` 抽屉入口，用于后续接入所有与奖励、成就、排行榜相关的真实变更记录。
- 当前页面已经满足：
  - `/admin/rewards` 只允许 `ADMIN` 访问。
  - 奖励中心侧栏入口只对 `ADMIN` 显示。
  - 奖励规则、成就联动、排行榜观察三块内容已经塞入同一页面，不再拆成分散视图。
  - 响应式布局已收口，移动端改为卡片列表，去掉横向滚动。
- 这一步的收口标准是：后续 `T-016.4.2 ~ T-016.4.7` 只在这套骨架上继续接入真实规则编辑、日志、重算、补发与状态处理，不再回到学员端成长展示语义。

### T-016.4.2 奖励中心奖励规则模块（说明）
- 奖励规则区已经从静态展示升级为可操作的前端规则模块，统一收敛了 `DEFAULT_DAILY_TASKS`、`ONBOARDING_TASK_TEMPLATES` 与 `XP_REWARDS` 三类奖励来源，不再只展示每日任务模板。
- 当前规则列表已经覆盖 `任务类型 / 动作 / 规则编码 / XP / 完成次数上限 / 启停 / 审计` 这些核心字段，并在同一区块提供 `新增动作`、`编辑`、`启用/停用` 与 `查看日志` 入口。
- 新增动作与编辑规则已通过前端弹窗接入，支持维护任务类型、动作名称、规则编码、XP 值、次数上限、启用状态与规则说明，保存后会即时回写到奖励规则列表。
- 奖励规则区的审计口径已经明确区分为 `每日任务模板`、`新手引导模板`、`XP 奖励常量` 与 `管理员草稿`，为后续真实奖励配置入库与操作日志对接预留统一字段。
- 当前操作日志已经开始记录前端层的新增、编辑、启停动作，后续 `T-016.4.5 ~ T-016.4.6` 只需要把本地状态与日志来源替换成真实发放 / 校正 / 变更流水，不需要再重做奖励规则模块骨架。

### T-016.4.3 奖励中心成就联动模块（说明）
- 成就联动区已经从“当前用户徽章解锁情况”改造成前端可管理的规则模块，管理员看到的是成就定义本身，而不是学员个人解锁结果。
- 当前成就联动列表已经统一覆盖 `成就类型 / 成就编码 / 触发条件 / 成就上限 / 启停状态 / 操作` 这些核心字段，并收敛到同一张管理表中。
- 成就规则编辑已通过前端弹窗接入，支持维护成就类型、成就编码、触发条件、成就上限、启用状态与规则说明，保存后会即时回写到成就联动列表。
- 成就联动区的默认来源已经收敛到当前徽章定义，前端会把已有 `badge` 定义映射成管理员可读的成就规则对象，为后续真实成就配置接口提供稳定字段骨架。
- 当前操作日志已经开始记录成就规则的编辑与启停动作，后续只需要把本地状态源替换成真实成就规则与审计流水，不需要再重构成就联动模块本身。

### T-016.4.4 奖励中心排行榜观察模块（说明）
- 排行榜观察区已经补齐管理端所需的控制能力，不再只是只读快照列表；当前支持 `周榜 / 月榜 / 总榜` 切换、榜单快照查看、`刷新快照`、`重算榜单` 与缓存状态说明。
- 当前缓存状态面板已经明确展示 `缓存状态 / 最近刷新 / 最近重算` 三类管理信息，管理员可以直接判断当前展示的是有效快照、空快照，还是等待真实重算链路接管的占位状态。
- `刷新快照` 当前通过页面级刷新重新拉取服务端榜单数据，`重算榜单` 当前先作为前端占位动作接入，并同步写入操作日志，为后续真实重算接口保留操作入口与状态承接区。
- 榜单观察区已经统一将周期切换、刷新、重算的管理动作写入奖励中心操作日志，后续 `T-016.4.6` 只需要把这些前端操作记录替换成真实榜单运维流水。
- 这一步的收口标准是：排行榜观察模块的前端控制入口、缓存状态承接和榜单快照展示已经成型，后续只需要继续对接真实刷新 / 重算链路，不再重做 UI 结构。

### T-016.4.5 奖励中心发放与校正模块（说明）
- 发放与校正模块已经在奖励中心页面内落地为独立管理面板，统一承接 `XP 补发`、`成就补发` 与 `榜单分数校正` 三类操作，不再需要跳出当前控制台。
- 当前表单已经覆盖 `操作类型 / 目标用户 / 发放或校正值 / 操作理由 / 回滚预案` 这些核心字段，并针对不同操作类型动态切换输入项。
- 模块已经补齐前端层的 `权限校验`、`幂等键生成` 与 `执行预览`，提交前会阻止重复幂等键再次执行，确保不会在前端层重复补发同一动作。
- 当前已经接入 `确认提交` 与 `确认回滚` 两层确认弹窗，管理员在执行补发 / 校正或回滚前都必须经过显式确认，不再是直接点击即生效的危险操作。
- 模块底部的最近操作列表已经开始记录补发 / 校正记录、幂等键、状态与回滚入口，并同步写入奖励中心操作日志；后续只需要把本地状态替换成真实发放 / 校正 / 回滚接口，不需要重做模块结构。

### T-016.4.6 奖励中心操作日志模块（说明）
- 奖励中心操作日志已经从单行备注升级为结构化日志模块，当前会统一记录 `模块 / 操作者 / 时间 / 结果 / 变更前 / 变更后 / 幂等键 / 失败原因 / 来源` 等字段，不再只有简单 comment 文本。
- 奖励规则、成就联动、排行榜观察、发放与校正四类模块的管理动作，现在都会统一写入同一个日志抽屉，避免每个区块各自维护一套日志视图。
- 日志抽屉的搜索范围已经扩展到模块名、结果、变更前后、幂等键、失败原因与来源字段，管理端可以直接按规则编码、榜单周期、幂等键或失败原因检索记录。
- 日志详情区已经补齐 `变更前 / 变更后`、`幂等键` 与 `失败原因` 的独立展示层，当前即使还没有接真实后端日志表，前端占位动作也已经能清楚说明为什么成功、为什么等待接入或为什么需要回滚。
- 这一步的收口标准是：奖励中心的操作日志结构和展示方式已经稳定，后续只需要把本地日志来源替换成真实奖励 / 成就 / 榜单审计流水，不需要再重做日志模块 UI。

### T-016.4.7 奖励中心状态模块（说明）
- 奖励中心已经补齐统一的状态收口模块，会集中展示 `权限态 / 奖励规则 / 成就联动 / 排行榜缓存 / 操作日志 / 交互态` 六类状态，不再把状态信息散落在各个卡片里。
- 未授权态当前已经通过路由守卫收口：未登录跳转登录页，非 `ADMIN` 跳回 `/dashboard`；状态模块会明确说明这一点，避免页面行为和文档口径脱节。
- 奖励规则与成就联动两块现在都补上了显式空态，数组为空时不再渲染空白表格，而是统一显示“暂无规则”的状态提示。
- 排行榜缓存失效也已经收口到页面语义里：当周榜 / 月榜 / 总榜出现空快照时，排行榜观察区和状态模块都会明确提示缓存失效或无数据，而不是只留下空白区域。
- 交互层的 loading / confirm / empty 语义也已经统一：刷新、重算、补发、回滚都带 loading 或确认态，日志为空、规则为空、榜单为空时也都有明确说明；后续只需要把真实接口状态映射进来，不需要再重新设计状态模块。

### T-016.4.8 奖励中心后端支持模块（说明）
- 奖励中心后续不能只停留在前端控制台层，必须补齐真实后端承接层，确保管理员在页面上的所有配置与操作都有可持久化的数据落点。
- 这一层至少需要覆盖四类真实数据承接：
  1. 奖励规则表：存储任务类型、动作、规则编码、XP 值、次数上限、启停状态、说明和审计字段。
  2. 成就联动规则表：存储成就类型、成就编码、触发条件、成就上限、启停状态、说明和审计字段。
  3. 发放与校正记录表：存储 XP / 成就 / 榜单分数补发与回滚记录、幂等键、状态、理由、回滚预案与操作者。
  4. 统一审计流水表：统一记录奖励规则、成就联动、排行榜变动、发放与校正的所有操作，覆盖模块、动作、目标、结果、变更前后、幂等键、失败原因与时间。
- 这一步的目标不是只补一张日志表，而是把“规则定义”“操作执行”“审计回看”三层后端能力都建起来，让奖励中心从前端占位控制台升级为真实可用系统。
- 后续真实接口接入时，`T-016.4.2 ~ T-016.4.6` 的前端模块都应直接切到这批表与 action / service / route 上，不再继续依赖本地 state 作为长期方案。
- 当前进展：
  - Prisma schema、`src/actions/admin/reward-center.ts`、`/admin/rewards` 首屏真实读链路与前端写入动作都已经接入。
  - `pnpm prisma generate` 与 `pnpm exec tsc --noEmit --pretty false` 已通过。
  - 已确认数据库中存在 `reward_rules / achievement_rules / reward_adjustment_records / reward_admin_audit_logs` 四张表，奖励中心后端承接层已经具备真实读写落点。
  - `pnpm prisma:dbpush -- --accept-data-loss` 在补齐奖励中心表之后，被现有库里与 `question_groups_content_hash_key` 相关的 schema 漂移拦住；这属于奖励中心范围外的数据库基线问题，不影响 `T-016.4.8` 本身收口，但需要后续单独清理。

### T-016.5 产品边界收口（说明）
- sidebar 经验值卡只负责持续成长进度，不承载排行榜排名、追赶目标或下一步行动建议。
- `/dashboard/leaderboard` 只负责排名、追赶目标与下一步行动，不重复展示 sidebar 的 XP 进度条。
- 右侧成长总览只负责下一步行动、最近解锁与成长提示，不再扩展成独立成长页。
- 页面空态、加载态与错误态文案已经统一收敛，避免在不同区域重复表达相同职责。
- 这一步只是在展示语义上固定边界，不会提前接管 `T-016.6` 的真实排行榜数据替换工作。

### T-016.6 真实排行榜读取链路（说明）
- `/dashboard/leaderboard` 首屏已经改为读取真实排行榜缓存与真实用户名次，不再依赖 `buildMockLeaderboardEntries(...)` 或固定 `initialMyRank`。
- 页面首屏现在由 `getCachedLeaderboardEntries('WEEKLY', 100)` 与 `getUserRank(userId, 'WEEKLY')` 共同决定，若当前用户不在榜单内也会按真实名次补入自己的位置。
- 周期切换仍然保留客户端请求 `/api/leaderboard/summary?period=...&limit=100` 的链路，由后端返回真实 `period / entries / myRank`。
- 当前用户定位与追赶目标计算由 `LeaderboardView` 继续负责，但输入数据已经改成真实首屏数据，不再是预置假榜单。
- 这一步收口的是“读取链路真实化”，后续 `T-016.8 / T-016.9 / T-016.10` 继续处理缓存、辅面板语义与交互调试，不需要再重复做首屏数据接管。

### T-016.7 sidebar 经验值卡读取链路（说明）
- sidebar 经验值卡的权威输入已经固定为 `userXp`，由 [`src/components/layout/dashboard-layout.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/layout/dashboard-layout.tsx) 直接消费，不再走 legacy `AppSidebar` 的硬编码 XP 卡。
- `DashboardLayout` 里现已使用 `calculateLevel`、`calculateNextLevelXp` 与 `levelProgress` 从 `userXp` 派生等级、下一级 XP 与进度条，避免在 Dashboard 内重复定义等级公式。
- 当 XP 产生变更时，XP 领取与用户资料写入等链路已经通过 `revalidatePath('/dashboard')` 回流，返回 Dashboard 后 sidebar 会自动读取最新值。
- 这一步的收口标准是：sidebar 经验值卡只负责持续成长进度展示，不再承载排行榜排名或追赶目标语义，也不需要再单独维护一套假进度数据。

### T-016.8 后端能力链路（说明）
- 排行榜的后端能力已经由 [`src/actions/leaderboard/index.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/leaderboard/index.ts) 提供，`getLeaderboard()` 与 `getUserRank()` 都直接读真实排行榜适配器，不再依赖页面层拼装假数据。
- [`src/lib/leaderboard/pg-adapter.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/lib/leaderboard/pg-adapter.ts) 已经把周榜 / 月榜 / 总榜的写入与查询口径统一到同一张 leaderboardEntry 表，保证榜单计算与当前周期匹配。
- [`src/app/api/leaderboard/summary/route.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/api/leaderboard/summary/route.ts) 负责承接前端周期切换请求，当前直接调用 `getLeaderboard()` 与 `getUserRank()` 返回真实 `period / entries / myRank`，并通过短时响应头支撑切换与刷新请求。
- [`src/lib/cache/sitewide.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/lib/cache/sitewide.ts) 继续通过 `use cache` + `cacheTag('leaderboard-entries')` 承接页面首屏读取，首屏缓存与接口切换已经明确分层，不再共用会触发 route 约束的缓存包装函数。
- 这一步的收口标准是：后端已经可以支撑首屏拉取、周期切换和当前用户排名回显，后续只剩 `T-016.9 ~ T-016.12` 去处理辅面板语义、交互修复和最终核账。

### T-016.9 排行榜辅面板收口（说明）
- 右侧辅面板已经从“成长展示”收敛为“排行榜行动概览”，标题、空态和提示文案都围绕追赶目标、推荐动作与下一步 CTA 组织。
- `XPBreakdown` 继续保留等级、XP、徽章和最近解锁，但用途是给排行榜提供上下文，不再作为独立成长页承载完整成长叙事。
- `FocusPanel` 现在承担真正的下一步动作入口：推荐练习、社区动作、追赶目标与 CTA 跳转都直接服务于排行榜推进。
- 这一步的完成标准是：右侧内容不再让用户误以为是在看独立成长页，而是明确在帮助用户决定下一步该做什么来推进排名。

### T-016.10 交互修复与调试体验（说明）
- 周期切换、手动刷新和请求超时都已经接到同一条读取链路里：周期变化会触发 `/api/leaderboard/summary` 重新拉取，顶部的刷新按钮也可以手动重试当前周期。
- 网络错误、超时与空榜都有明确状态：超时会保留最近一次榜单快照，普通错误会展示重试提示，空榜会给出继续练习的 CTA。
- 未登录态已经单独分流：API 返回 401 时会提示重新登录，并提供回到登录页的入口，而不是把所有错误都混成同一条泛化提示。
- 当前自己定位仍然由榜单数据和 `myRank` 回显共同决定，确保当前用户即使不在前 100 名里，也会在页面里看到自己的真实位置和追赶目标。
- 这一步的收口标准是：排行榜页面在切换、刷新、失败、空榜和未登录时都有明确、可调试、可恢复的行为，不再依赖默认错误页或隐式刷新来解释状态。

### T-017 成就与游戏化域
> 说明：本节下方的“说明性内容”只在对应子任务完成后补写，不在子任务进行中预填。
### Phase A：边界与约束
| id | description | owner | status |
|---|---|---|---|
| T-017.1 | 盘点 `/dashboard/achievements` 的首屏概览、等级 / XP / streak / 徽章墙、任务入口、CTA、缓存 tag 与当前数据源，明确页面读链路与共享域边界 | codex | done |
| T-017.2 | 建立等级、XP、streak、任务、奖励、徽章、领取状态、通知副作用的字段映射与权威数据源矩阵，明确 `users / badges / user_badges / daily_tasks / notifications` 的主从关系 | codex | done |
| T-017.3 | 固化状态与约束：未登录、无 profile、无成就、无徽章、任务未生成、任务已领取、缓存失效、接口失败、禁用态 / 空态 / 错误态的渲染与跳转规则 | codex | done |

#### T-017.1 边界与数据源说明（盘点基线）
- 页面入口：[`src/app/(dashboard)/dashboard/achievements/page.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(dashboard)/dashboard/achievements/page.tsx)
- 客户端壳层：[`src/app/(dashboard)/dashboard/achievements/client-wrapper.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(dashboard)/dashboard/achievements/client-wrapper.tsx)
- 页面视图：[`src/components/achievements/AchievementsView.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/achievements/AchievementsView.tsx)
- 首屏读取链路：先读 `getDashboardShellProfile()`，再并行读 `getCachedAchievementOverview(userId)` 与 `getCachedUserBadges(userId)`。
- 概览缓存 tag：`achievement-overview:${userId}`，来自 [`src/lib/cache/sitewide.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/lib/cache/sitewide.ts)。
- 徽章缓存 tag：`user-badges:${userId}`，来自 [`src/lib/cache/sitewide.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/lib/cache/sitewide.ts)。
- 概览权威来源：[`src/actions/gamification/achievements.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/gamification/achievements.ts) 读取 `users.streak`、`users.totalStudyTime`、`users.xp`、`user_attempts`、`posts`、`comments`。
- 徽章权威来源：[`src/actions/gamification/achievements.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/gamification/achievements.ts) 读取 `badges` 与 `user_badges`，并在缺失时先执行 `ensureDefaultBadges()`。
- 任务相关写链路：`claimTaskReward` / `completeOnboardingTask` 位于 [`src/actions/gamification/achievement.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/gamification/achievement.ts)，底层依赖 `daily_tasks`。
- streak 刷新链路：[`src/actions/gamification/streak.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/gamification/streak.ts)，触发后会再调用 `awardBadgeIfEligible(userId, 'STREAK')`。
- 页面回流边界：奖励领取、onboarding 完成、streak 刷新会回流 `revalidatePath('/dashboard')`；成就概览与徽章列表分别依赖 `revalidateTag('achievement-overview:${userId}')` 和 `revalidateTag('user-badges:${userId}')`。
- 明确非目标：当前 `/dashboard/achievements` 只承载成就概览与徽章墙，不承担完整 `daily_tasks` 管理面板，也不在页面内重复计算 XP / streak 规则。
- 当前风险点：独立 `loading.tsx` / `error.tsx` 尚未单独补齐，页面层仍需依赖共享骨架与组件内空态作为兜底。

#### T-017.2 字段映射与权威数据源矩阵（盘点基线）
| 字段 / 能力 | 含义 | 权威来源 | 读取入口 | 写入 / 刷新入口 | 页面消费层 | 备注 |
|---|---|---|---|---|---|---|
| `user.xp` | 用户总 XP，决定成长进度 | `users.xp` | `getDashboardShellProfile()` -> `AchievementsClientWrapper` -> `DashboardLayout` | `claimDailyTaskRewardForUser()` / 练习侧副作用 / `awardBadgeIfEligible()` 后回流 | sidebar XP 卡、成就页概览 | 等级不得在页面层自定义公式 |
| `level` | 当前等级 | `calculateLevel(user.xp)` | `getAchievementOverview()` | 派生值，不落库 | `AchievementOverview.level` | 只允许由 XP 派生 |
| `nextLevelXp` | 下一级所需 XP | `calculateNextLevelXp(level)` | `getAchievementOverview()` | 派生值，不落库 | `AchievementOverview.nextLevelXp` | 只用于展示与进度推导 |
| `user.streak` | 连续有效学习天数 | `users.streak` | `getAchievementOverview()`、`checkAndRefreshStreak()` | `checkAndRefreshStreak()`、练习 / 课程有效动作后刷新 | 成就页概览、徽章条件 | 页面加载不得触发 streak 写入 |
| `users.totalStudyTime` | 累计学习时长（秒） | `users.totalStudyTime` | `getAchievementOverview()` | 课程 / 练习副作用链路写入 | 成就页概览 `hours` | 页面只展示格式化小时文本 |
| `user_attempts` | 练习总题数、正确题数 | `user_attempts` | `getAchievementOverview()` | 练习提交链路写入 | `questions` / `correctAnswers` / `accuracy` | 正确率由总数派生，不能手写 |
| `posts` / `comments` | 社区参与数，用于成长摘要与徽章判定 | `posts.authorId` / `comments.authorId` | `getAchievementOverview()`、`awardBadgeIfEligible()` | 发帖 / 评论链路写入 | `posts` / `comments` | 仅用于成长摘要与资格判断 |
| `badges` | 徽章定义、名称、说明、图标、条件 | `badges` | `ensureDefaultBadges()` -> `listUserBadges()` / `awardBadgeIfEligible()` | `ensureDefaultBadges()` 初始化、后续规则维护 | 徽章墙、条件说明 | 页面不应硬编码徽章定义 |
| `user_badges` | 用户已解锁徽章及领取时间 | `user_badges` | `listUserBadges()` | `awardBadgeIfEligible()` 写入 | 徽章墙 `unlocked / awardedAt` | 解锁态是权威状态，不能前端伪造 |
| `BadgeWithUnlockStatus.unlocked` | 徽章是否已解锁 | `user_badges` 左连接 `badges` | `listUserBadges()` | 由 `awardBadgeIfEligible()` 决定 | 徽章墙筛选 / 统计 | 只作为派生展示状态 |
| `BadgeWithUnlockStatus.awardedAt` | 徽章解锁时间 | `user_badges.awardedAt` | `listUserBadges()` | `awardBadgeIfEligible()` 创建时写入 | 徽章墙排序 / 最近解锁提示 | 仅用于展示和排序 |
| `daily_tasks.id` | 当日任务主键 | `daily_tasks.id` | `getTodayTasks()` / `claimDailyTaskRewardForUser()` / `completeTodayOnboardingTask()` | `ensureDailyTasks()` 生成 | 任务入口 CTA、领奖动作 | 当前页不直接渲染任务列表，但任务是联动来源 |
| `daily_tasks.type` | 任务类型（LOGIN / COMPLETE_LESSON / ONBOARDING_*） | `daily_tasks.type` | 同上 | `ensureDailyTasks()` / `trackDailyProgress()` / `completeTodayOnboardingTask()` | 任务与 onboarding 语义 | 是任务分层与幂等判断核心字段 |
| `daily_tasks.currentCount` / `targetCount` | 任务进度 / 完成阈值 | `daily_tasks.current_count` / `daily_tasks.target_count` | 同上 | `trackDailyProgress()` / `completeTodayOnboardingTask()` | 任务完成度、领奖可用性 | 领取前必须满足 `currentCount >= targetCount` |
| `daily_tasks.xpReward` | 任务奖励 XP | `daily_tasks.xp_reward` | `claimDailyTaskRewardForUser()` | `ensureDailyTasks()` 创建 | 领奖后 XP 增量 | 奖励值应和任务定义一致 |
| `daily_tasks.isClaimed` | 任务是否已领奖 | `daily_tasks.is_claimed` | `claimDailyTaskRewardForUser()` / `getTodayTasks()` | `claimDailyTaskRewardForUser()` 原子更新 | 领取按钮状态 | 重复领取必须返回幂等失败 |
| `notifications.type = ACHIEVEMENT` | 成就解锁通知类型 | `notifications.type` | `awardBadgeIfEligible()` | `awardBadgeIfEligible()` 事务内创建 | 通知中心 / 站内提醒 | 目前只有徽章发放会写这类通知 |
| `notifications.metadata.badgeCode` | 通知关联徽章编码 | `notifications.metadata` | `awardBadgeIfEligible()` | `awardBadgeIfEligible()` | 通知详情、追踪来源 | 用于追溯是哪一个徽章触发 |
| `notifications.metadata.source` | 触发来源（PRACTICE / COMMUNITY / STREAK） | `notifications.metadata` | `awardBadgeIfEligible()` | `awardBadgeIfEligible()` | 通知详情、审计 | 只记录徽章触发来源，不记录页面来源 |
| `achievement-overview:${userId}` | 成就概览缓存 tag | `next/cache` tag | `getCachedAchievementOverview()` | `revalidateTag()` from `awardBadgeIfEligible()` | 成就页首屏概览 | 只缓存概览，不缓存徽章列表 |
| `user-badges:${userId}` | 用户徽章缓存 tag | `next/cache` tag | `getCachedUserBadges()` | `revalidateTag()` from `awardBadgeIfEligible()` | 徽章墙首屏 | 与概览 tag 分离，避免一处失效影响全页 |

- 读取优先级固定为：`users / user_attempts / posts / comments / badges / user_badges / daily_tasks / notifications`，页面层只能消费这些权威结果，不得在视图组件里重新推导业务状态。
- 成就页当前主渲染合同只有 `overview` 与 `badges`，其中 `overview` 由用户统计、练习统计和社区统计聚合而来，`badges` 由徽章定义表与用户解锁表合并而来。
- 任务、领奖、streak 和通知属于联动域能力，不是成就页当前首屏合同的一部分，但它们是成就页数据正确性的前置来源，必须在矩阵里单独标明。
- 当前矩阵已足够支持后续 `T-017.3` 的状态与约束定义，以及 `T-017.4 ~ T-017.6` 的读取、写入与联动调试。

#### T-017.3 状态与约束说明（盘点基线）
| 状态 / 约束 | 触发条件 | 页面级表现 | 跳转 / 处理规则 | 备注 |
|---|---|---|---|---|
| 未登录 | `getDashboardShellProfile()` 返回空、无可用会话 | 直接跳转 `/login` | 不渲染成就页主体 | 当前由服务端页面入口处理 |
| 无 profile / 账号未同步 | 已登录但 `profile` 不存在 | 直接跳转 `/login` 或走账号修复页外的统一登录分流 | 不允许渲染 `AchievementsClientWrapper` | 不得把缺 profile 当成“空成就” |
| 无权限 / 非目标角色 | 若后续对成就页增加角色限制 | 显式受限提示或回到可访问首页 | 不允许降级为伪数据页 | 当前路由默认面向登录用户，未来如加限制需补规则 |
| 无成就数据 | `overview` 为空或统计源无有效记录 | 以空态/低数据态表达，不得用默认 0 值冒充真实完成 | 不允许伪装为“完成度 0% 的有效用户” | 需要和无徽章区分 |
| 无徽章 | `badges` 为空或 `listUserBadges()` 返回空数组 | 徽章墙显示空态文案 | 允许保留成长摘要，但徽章列表必须空态化 | 不得渲染虚假徽章卡 |
| 任务未生成 | `daily_tasks` 当日无记录或联动链路未创建 | 当前页不展示完整任务面板 | 仅保留联动说明，不强行生成任务视图 | 任务生成属于联动域，不是成就页首屏合同 |
| 任务已领取 | `daily_tasks.isClaimed = true` | 任务相关 CTA 应置为已完成/不可重复领取 | 重复提交应返回幂等失败 | 仅适用于与成就页联动的任务入口 |
| 缓存失效 / cache miss | `achievement-overview` 或 `user-badges` 失效 | 重新读取真实数据，不可提示错误 | 由 `getCachedAchievementOverview()` / `getCachedUserBadges()` 自动回源 | 缓存命中与否不得改变业务语义 |
| 接口失败 | 概览、徽章或关联动作抛错 | 页面应进入明确错误态 | 不允许落入半成功、半失败的混合态 | 独立 `error.tsx` 未补齐前需依赖通用错误兜底 |
| 禁用态 | 功能存在但当前不开放或不该触发 | 显式禁用按钮或隐藏入口 | 不允许回退 mock 文案 | 适用于未来扩展的任务/奖励入口 |
| 空态 | 数据合法但结果集合为空 | 空态文案 + 引导 CTA | 不得以默认卡片填充 | 与错误态、禁用态严格区分 |
| 错误态 | 数据拉取失败、权限拒绝或联动失败 | 明确错误提示、保留返回或重试动作 | 不可伪装成功 | 错误态优先级高于空态与禁用态 |

- 优先级固定为：`未登录 / 无 profile > 接口失败 / 权限失败 > 空态 > 禁用态 > 正常态`。
- 成就页当前首屏不承载完整任务列表，因此“任务未生成 / 已领取”只允许以联动 CTA 或说明态出现，不得伪装成完整任务面板。
- 徽章墙与成长摘要必须分开兜底：成长摘要可以基于真实统计显示低数据态，徽章墙则必须按 `badges` 的实际结果渲染空态或列表态。
- 当前 route-level `loading.tsx` / `error.tsx` 还未单独补齐，后续实现时必须保持状态优先级和页面内空态一致，不允许各层语义冲突。

### Phase B：开发、修复、调试
| id | description | owner | status |
|---|---|---|---|
| T-017.4 | 对齐读取链路：页面首屏、缓存入口、加载态与错误态接管 `getAchievementOverview` / `listUserBadges` / `getTodayTasks` 等真实数据源，补齐等级 / XP / streak / 徽章 / 任务摘要的展示口径 | codex | done |
| T-017.5 | 对齐写链路：奖励领取、任务推进、onboarding 完成、streak 刷新、徽章发放的幂等、重复触发、事务与缓存失效策略，确保页面刷新与副作用回流一致 | codex | done |
| T-017.6 | 对齐跨域联动：来自练习 / 社区 / streak 的徽章触发、`achievement-overview` 与 `user-badges` tag 回收、通知写入、错误回滚与边界提示 | codex | done |

#### T-017.4 读取链路说明（盘点基线）
- 页面首屏当前真实读取链路为：[`src/app/(dashboard)/dashboard/achievements/page.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(dashboard)/dashboard/achievements/page.tsx) 先通过 `getDashboardShellProfile()` 确认用户，再并行读取 `getCachedAchievementOverview(userId)` 和 `getCachedUserBadges(userId)`。
- `getCachedAchievementOverview(userId)` 的实际数据源是 [`src/actions/gamification/achievements.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/gamification/achievements.ts) 内的 `getAchievementOverview()`，它聚合 `users.streak`、`users.totalStudyTime`、`users.xp`、`user_attempts`、`posts`、`comments`，并派生 `level / nextLevelXp / accuracy / hours`。
- `getCachedUserBadges(userId)` 的实际数据源是同一文件内的 `listUserBadges()`，它先 `ensureDefaultBadges()`，再读取 `badges` 与 `user_badges` 合并成带解锁状态的徽章列表。
- 客户端壳层 [`src/app/(dashboard)/dashboard/achievements/client-wrapper.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(dashboard)/dashboard/achievements/client-wrapper.tsx) 只负责把 `user / overview / badges` 传给 [`AchievementsView`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/achievements/AchievementsView.tsx)，不在壳层重复计算成就规则。
- [`AchievementsView`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/achievements/AchievementsView.tsx) 当前只消费 `overview` 与 `badges` 两个合同，不直接读取 `daily_tasks`；任务相关内容目前仅作为联动来源，不在当前首屏主体里渲染。
- 缓存层当前通过 [`src/lib/cache/sitewide.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/lib/cache/sitewide.ts) 为成就概览和徽章列表分别挂上 `achievement-overview:${userId}` 与 `user-badges:${userId}`，徽章发放后由 `awardBadgeIfEligible()` 触发回收。
- 路由骨架层当前已在 [`src/components/loading/dashboard-route-loading.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/loading/dashboard-route-loading.tsx) 提供 `achievements` variant，但 route-level 独立 `loading.tsx` / `error.tsx` 仍未单独补齐，因此加载态和错误态仍主要依赖共享骨架与组件内空态。
- 现阶段读取链路的明确边界是：`overview + badges` 已经是真实首屏合同，`getTodayTasks()` 只属于联动域读源，暂不应被当作成就页主体数据强行接入。
- 当前尚未完成的读取收口点是：把成就页的低数据态、错误态与任务联动入口统一到同一套页面语义中，并确认是否需要在首屏增加任务摘要而不是完整任务面板。

#### T-017.5 写链路说明（盘点基线）
- 当前成就页相关的主写入口并不在 [`AchievementsView`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/achievements/AchievementsView.tsx) 内，而是在 [`src/components/dashboard/DailyMissions.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/dashboard/DailyMissions.tsx) 的任务 CTA、练习提交副作用、社区动作和 streak 刷新链路中。
- 任务领奖入口 [`src/actions/gamification/achievement.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/gamification/achievement.ts) 里的 `claimTaskReward(taskId)` 会调用 `claimDailyTaskRewardForUser(user.id, taskId)`，底层先用 `updateMany` 原子把 `daily_tasks.isClaimed` 置为 `true`，再给 `users.xp` 做增量；成功后由调用方 `revalidatePath('/dashboard')` 并 `router.refresh()`。
- onboarding 完成入口同样在 [`src/actions/gamification/achievement.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/gamification/achievement.ts) 的 `completeOnboardingTask(type)`，它只负责推进 `daily_tasks.currentCount` 到完成态，不直接加 XP；任务奖励仍然走领奖动作。
- `ensureDailyTasks(userId)` 在 [`src/actions/gamification/daily-tasks.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/gamification/daily-tasks.ts) 内用 advisory lock `daily_tasks:${userId}:${date}` 防并发生成重复任务行，是任务写链路的生成门禁。
- `GET /api/dashboard/daily-tasks` 在 [`src/app/api/dashboard/daily-tasks/route.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/api/dashboard/daily-tasks/route.ts) 中会先补 `ensureDailyTasks()` 再回传当天任务列表，说明任务数据的读取前置仍然依赖写链路先完成一次生成收口。
- streak 刷新入口 [`src/actions/gamification/streak.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/gamification/streak.ts) 只在有效学习动作发生时更新 `users.lastStudyDate / users.streak`，随后调用 `awardBadgeIfEligible(userId, 'STREAK')`，不允许由页面加载触发。
- 徽章发放入口 [`src/actions/gamification/achievements.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/gamification/achievements.ts) 的 `awardBadgeIfEligible()` 是共享的发奖收口：先按 `user_attempts / posts / comments / streak` 计算资格，再事务写入 `user_badges` 和 `notifications`，最后回收 `achievement-overview:${userId}` 与 `user-badges:${userId}` 两个缓存 tag。
- 练习侧统一副作用入口 [`src/actions/practice/submission-effects.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/practice/submission-effects.ts) 是当前最完整的写链路 fan-out：`ensureDailyTasks()`、`checkAndRefreshStreak()`、`awardBadgeIfEligible(..., 'PRACTICE')`、`incrementTotalStudyTime()`、`updateLeaderboardScore()`、`trackDailyProgress()`，结束后再回收成就相关 tag。
- 社区侧发帖 / 评论动作也会在成功后调用 `awardBadgeIfEligible(user.id, 'COMMUNITY')`，因此 `COMMUNITY` 也是成就页徽章墙的真实上游。
- 当前写链路的边界是：`claimTaskReward` 负责 XP + 任务领取，`completeOnboardingTask` 负责 onboarding 任务推进，`checkAndRefreshStreak` 负责 streak，`awardBadgeIfEligible` 负责徽章和通知，任何一层都不能把其他层的副作用悄悄吞掉。
- 已完成的修复是：`claimTaskReward` 现在在 XP 成功入账后同步回收 `achievement-overview:${userId}` 与 `user-badges:${userId}`，并通过动作级测试覆盖了领奖成功与 onboarding 完成两条主路径；`completeOnboardingTask` 继续只负责任务推进与 `dashboard` 刷新，因为它本身不改变成就概览字段。
- 剩余的跨域写链路收口点已转交 `T-017.6`，重点继续确认徽章发放、通知写入与练习 / 社区 / streak 的联动边界。

#### T-017.6 跨域联动说明（盘点基线）
- 练习侧已经在 [`src/actions/practice/submission-effects.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/practice/submission-effects.ts) 统一串起 `ensureDailyTasks()`、`checkAndRefreshStreak()`、`awardBadgeIfEligible(..., 'PRACTICE')`、`incrementTotalStudyTime()`、`updateLeaderboardScore()` 与 `trackDailyProgress()`，结束后再回收成就相关 tag，因此练习提交后的 XP / streak / 徽章回流已经收口。
- 社区侧在 [`src/actions/community/post.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/community/post.ts) 的发帖与评论成功路径中，都会调用 `awardBadgeIfEligible(user.id, 'COMMUNITY')`，并回收 `achievement-overview:${user.id}` 与 `user-badges:${user.id}`，保证发帖 / 评论后的成就墙和概览可见性一致。
- streak 侧在 [`src/actions/gamification/streak.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/gamification/streak.ts) 更新 `users.streak` 后，会先回收 `achievement-overview:${userId}`，再继续走 `awardBadgeIfEligible(userId, 'STREAK')`，从而补齐“只改 streak 但没有新徽章”时的成就页缓存新鲜度。
- 通知写入继续由 `awardBadgeIfEligible()` 的事务内 `notifications.createMany()` 统一承接，避免练习 / 社区 / streak 各自重复写通知导致口径分叉。
- 当前跨域联动的边界是：`practice / community / streak` 只负责把真实副作用推到成就域，`awardBadgeIfEligible()` 负责统一发奖与通知，成就页只消费 `achievement-overview` 和 `user-badges` 两个缓存合同，不自己重算上游事件。
- 已完成的修复是：`streak` 更新后即使没有触发新徽章，也会显式回收成就概览缓存；并补上动作级测试，覆盖了 `streak` 更新与 `same_day` 不写入两类场景，确保跨域回流不会漏掉 `streak` 变化。

### Phase C：清理和收口验证
| id | description | owner | status |
|---|---|---|---|
| T-017.7 | 清理假 XP、假 streak、假任务状态、假领奖成功、静态占位文案与过时 CTA，避免页面继续依赖本地常量兜底 | codex | done |
| T-017.8 | 补齐 `/dashboard/achievements` 的页面级加载 / 错误 / 空态 / 低数据态 / 移动端适配 / 可访问性收口，保证异常场景也能稳定可用 | codex | done |
| T-017.9 | 完成成就与游戏化域验证：字段核账、重复领奖 / 重复刷新、徽章发放回放、任务推进回放、缓存失效与 console error 检查 | codex | done |

#### T-017.7 清理收口说明（盘点基线）
- 成就页已移除旧的静态头像占位 URL，不再依赖 `i.pravatar.cc` 伪装用户头像；当用户没有头像时，页面只展示基于用户名首字母生成的中性头像块。
- 成就页已移除旧的 `Achievement MVP` 装饰文案与顶部固定奖励感 CTA，避免把页面包装成“已完成/已获奖”的假积极状态。
- 成就页的成长摘要已从 `0` 兜底改为 `—` 中性占位，避免把缺失的 `overview` 误渲染成“真实但为 0”的假数据。
- 旧的 Dashboard 内嵌 `achievements` / `leaderboard` fallback 已移除，侧边栏现在只跳转到独立路由，不再渲染 `overview={null}` / `badges={[]}` 这类历史空壳。
- 已补上成就页组件测试，确认缺少概览数据时不会回退到伪 0 值，也不会再出现旧 CTA 或静态占位文案。

#### T-017.8 页面级加载 / 错误 / 空态 / 低数据态 / 可访问性说明（盘点基线）
- 已确认 `/dashboard/achievements` 不再保留独立的 route-level `loading.tsx`，页面切换时直接等待真实内容完成，不再额外制造一层 skeleton 中间态。
- 已为 `/dashboard/achievements` 补齐独立的 route-level `error.tsx`，错误时提供重试与返回仪表盘两个动作，避免页面掉进默认错误页后失去明确回路。
- 成就页的低数据态已从假 `0` 改为中性 `—`，避免缺失 `overview` 被误看成“真实但为 0”的业务结果。
- 成就页的徽章筛选已补上更清晰的交互语义：筛选区使用分组语义，按钮使用 `aria-pressed`，交互状态对读屏更直接。
- 成就页现在不会再依赖旧的内嵌 fallback 去填 `overview={null}` / `badges={[]}`，从而保证移动端和异常状态下看到的都是独立路由真实语义，而不是历史空壳。

#### T-017.9 成就与游戏化域验证说明（核账基线）
- 已补充成就与游戏化域的回放验证测试，覆盖重复领奖、onboarding 重复提交、任务进度重复回放、徽章发放重复触发四类场景。
- 已确认 `claimDailyTaskRewardForUser` 只会在首次领奖时成功扣写，第二次会直接返回 `Reward already claimed`，不会重复增加用户 XP。
- 已确认 `completeTodayOnboardingTask` 与 `trackDailyProgress` 都会在锁和条件更新下保持幂等，不会把任务推进到目标值之外，也不会重复写入完成态。
- 已确认 `awardBadgeIfEligible` 在首次发放时会批量创建 `user_badges` 和 `notifications`，并回收成就页相关缓存；第二次重复触发时不会再重复创建或重复失效。
- 已完成对应的回放测试与 ESLint 校验，确保成就页和游戏化域的写链路、缓存回流、重复触发边界均处于可控状态。

### T-018 设置与通知域
### Phase A：边界与约束
| id | description | owner | status |
|---|---|---|---|
| T-018.1 | 盘点 `/dashboard/settings`、右上角通知弹层与相关 CTA、深链、当前数据源，明确通知中心仅作为弹层入口存在；`/dashboard/settings/notifications` 保持 404，不再作为产品路由 | codex | done |
| T-018.2 | 建立个人资料、AI 配置、通知偏好、家长连接、订阅状态，以及 `user_settings` / `notification_preferences` 新旧字段的权威数据源矩阵，明确哪些字段可写、哪些字段只读、哪些字段必须始终开启 | codex | done |
| T-018.3 | 固化设置域状态与路由约束：未登录、无 profile、设置读取失败、通知偏好加载失败、非法 tab、`/dashboard/settings/notifications` 的 404 策略、右上角通知弹层的打开/关闭与无效 deep link（如 `billing` / `feedback`）处理边界 | codex | done |

#### T-018.1 盘点结果摘要（已完成）
- 页面入口是 [`src/app/(dashboard)/dashboard/settings/page.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(dashboard)/dashboard/settings/page.tsx)，服务端先走 `getDashboardSettingsProfile()`，再把用户资料传给 [`SettingsClientWrapper`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(dashboard)/dashboard/settings/client-wrapper.tsx) 与 [`SettingsView`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/dashboard/views/SettingsView.tsx)。
- 设置页当前主模块是 `profile / ai-config / notifications / account / subscription` 五段，页内通过 `tab` query 做定位，`notifications` 只是页面内分段，不是独立路由。
- 右上角通知入口由 [`src/components/layout/dashboard-layout.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/layout/dashboard-layout.tsx) 固定渲染 [`NotificationBell`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/notification/NotificationBell.tsx)，点击后只打开 [`NotificationDropdown`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/notification/NotificationDropdown.tsx) 弹层，不会跳到独立通知设置页。
- 通知弹层当前数据源是 `/api/notifications/summary?limit=10`，并通过 `markNotificationAsRead()` / `markAllAsRead()` 维护已读状态；列表中的每条通知则直接消费 `notifications` 表里返回的 `link`。
- 通知弹层底部“通知设置”入口当前仅作为兼容跳转，目标是 `/dashboard/settings?tab=notifications`；`/dashboard/settings/notifications` 已经是显式 `404`，不再承载产品语义。
- 设置页写链路目前分别分散在 `updateProfile`、`updateAIConfig`、`updateNotificationPreferences`、`generateInviteCode`、`cancelSubscriptionAction`，通知偏好首次加载则走 `getNotificationPreferences()`，并与 `user_settings` 的旧字段做迁移桥接。
- 当前需要继续盘点的关键数据源包括：`users`、`user_settings`、`notification_preferences`、`notifications`、`referrals`、`invite_codes`、`subscription` 相关字段，以及页内用于深链和回流的 `tab` query 规则。

#### T-018.2 权威字段矩阵（已完成）
| 域 / 字段 | 权威来源 | 读取入口 | 写入入口 | 页面消费 | 约束 |
|---|---|---|---|---|---|
| `users.username` / `users.handle` / `users.avatar` / `users.grade` | `users` | `getDashboardSettingsProfile()`、`getCurrentUser()` | `updateProfile()` | 个人资料、账户概览、家长共享卡片 | `handle` 必须先做 normalize + 可用性校验；`avatar` 为空时只允许前端兜底展示，不回写默认图 |
| `user_settings.language` / `user_settings.theme` | `user_settings` | `getDashboardSettingsProfile()`、`getUserSettings()` | `updateProfile()`、`updatePreferences()` | 个人资料与 App Preferences | `updatePreferences()` 是当前页的正式保存动作，`updateProfile()` 仍承担兼容桥接 |
| `user_settings.aiPersonality` / `user_settings.difficultyCalibration` / `user_settings.curriculumSystem` / `user_settings.studyReminderTime` | `user_settings` | `getDashboardSettingsProfile()`、`getUserSettings()` | `updateAIConfig()`、`updateGoals()` | AI 配置、提醒节奏、家长相关联动 | `studyReminderTime` 主要服务日常任务与提醒联动，当前设置页不直接提供独立编辑入口 |
| `notification_preferences.inAppSystem` / `inAppSocial` / `inAppStudy` / `inAppAchievement` / `emailSystem` / `emailSocial` / `emailWeekly` / `emailMarketing` / `emailBilling` | `notification_preferences` | `getNotificationPreferences()` | `updateNotificationPreferences()` | 设置页通知矩阵、右上角通知弹层入口说明 | `emailBilling` 永远为 `true`，不提供关闭能力；该表是通知偏好的正式主表 |
| `user_settings.notificationDaily` / `notificationWeekly` / `emailMarketing` / `emailActivity` | `user_settings` legacy bridge | `getNotificationPreferences()` 迁移读取、`getDashboardSettingsProfile()` | `updateProfile()` 仅作兼容写入，不作为新主写源 | 旧设置字段兼容、迁移回填 | 旧字段不能覆盖 `notification_preferences` 的正式主表，后续只保留迁移桥接语义 |
| `notifications.type` / `title` / `content` / `link` / `isRead` / `createdAt` | `notifications` | `/api/notifications/summary?limit=10` | `markNotificationAsRead()`、`markAllAsRead()`、业务通知触发器 | 右上角通知弹层 | Settings 页不直接编辑通知本体，只消费摘要与跳转链接 |
| `referralCode` / `referralCount` / `referralLimit` / `referralsGiven` | `users` + `referrals` | `getDashboardSettingsProfile()`、`getCurrentUser()` | `signupAction`、`bindReferralCodeAction`、推荐结算链路 | 账户概览、推荐区、待结算展示 | Settings 页只展示，不在页面层重算推荐关系或结算逻辑 |
| `subscriptionTier` / `subscriptionStatus` / `subscriptionStart` / `subscriptionEnd` / `cancelAtPeriodEnd` / `stripeSubscriptionId` / `firstPaidAt` | `users` | `getDashboardSettingsProfile()`、`getCurrentUser()` | `signupAction` 初始化、`createCheckoutSession()`、Stripe webhook、`cancelSubscriptionAction()` | 订阅区、试用状态、取消计划按钮 | Settings 页只读展示 + 取消计划动作，不直接改订阅层字段 |
| `invite_codes.code` / `used` / `expiresAt` 与 `parentStudent` 关系 | `invite_codes`、`parentStudent` | `generateInviteCode()`、`getLinkedStudents()` | `generateInviteCode()`、`bindStudent()` | 家长连接区 | 仅学生可生成邀请码，家长侧只做绑定与查看关联 |

- 这套矩阵的收口标准是：`profile`、`AI`、`notification_preferences`、`subscription`、`referral / parent` 各自只认一条主写链路；`user_settings` 里的旧通知字段只保留迁移桥接，不再作为新主权来源。
- `tab` query 只负责页内定位，不是独立设置数据源；`notifications` 只是在 Settings 页内的一个分段，不应再演化成独立路由。

#### T-018.3 状态与路由约束（已完成）
- `SettingsPage` 只在无登录态时直接 `redirect('/login')`；只要能拿到当前用户，页面就应继续渲染 Settings 壳层，不把 `settings` 表读取失败升级成整页崩溃。
- `getDashboardSettingsProfile()` 的数据库 schema mismatch 只能降级为 `settings: null`，不能把 Settings 页本体炸掉；这意味着“无 profile”和“settings 读取失败”是两种不同边界。
- `SettingsView` 里的 `tab` query 只允许 `profile / ai-config / notifications / account / subscription` 五个值，非法值统一回退到 `profile`，不额外制造 404。
- `/dashboard/settings/notifications` 维持显式 `404`，不作为产品路由；通知相关入口只能落到 Settings 页内的 `?tab=notifications`。
- 右上角通知弹层只做本地开合状态管理，行为边界是点击按钮打开、点击外部关闭、切出可见态暂停轮询，不应触发页面路由切换。
- 通知弹层底部“通知设置”入口保留兼容跳转，但目标必须是 `/dashboard/settings?tab=notifications`，不能再把用户导向独立通知页。
- 新写入链路已经不再生成 `/dashboard/settings/billing`；历史通知里残留的旧链接需要在前端消费时统一规范到真实页面或真实 tab，不能继续放任跳向假路由。
- `feedback` 相关入口不应生成 Settings 子路由；如果需要承接反馈，只能走已有的帮助、反馈弹层或真实支持页面，不能在 `/dashboard/settings` 下虚构新路由。
- `notification_preferences` 加载失败必须在界面上显式降级，不能静默用默认值冒充真实偏好，否则会把“未读取到数据”误判成“用户选择了默认值”。
- 上述边界现在已经分别由 `SettingsView`、`NotificationDropdown`、通知深链规范层和 `notifications/page.tsx -> notFound()` 落到代码；匿名访问时则先由登录中间层统一接管，表现为受控 `redirectTo` 回流，而不是无约束跳转或运行时错误。

### Phase B：开发、修复、调试
| id | description | owner | status |
|---|---|---|---|
| T-018.4 | 对齐设置读取链路：`getDashboardSettingsProfile`、`getUserSettings`、`getNotificationPreferences`、tab/query 初始化、初始化回填、右上角通知弹层数据读取 | codex | done |
| T-018.5 | 对齐设置写链路：`updateProfile`、`updateAIConfig`、`updatePreferences`、`updateNotificationPreferences`、`generateInviteCode`、`cancelSubscriptionAction` 的输入校验、权限校验、幂等与失败回滚 | codex | done |
| T-018.6 | 处理右上角通知弹层的读取与交互保护：通知列表 / 未读数拉取失败时必须显式降级，不允许空数据假装成功；“通知设置”入口只保留弹层内跳转到 `/dashboard/settings?tab=notifications` 的兼容行为 | codex | done |
| T-018.7 | 收口 settings 深链与兼容入口：通知中心、站内通知、账单通知全部跳到真实 tab 或真实页面，避免再次生成指向 `/dashboard/settings/notifications` 的无效路由 | codex | done |
| T-018.8 | 修正 `user_settings.notificationDaily` / `notificationWeekly` 与 `notification_preferences` 的桥接 / 迁移策略，避免 profile 保存、通知保存与旧字段回填互相覆盖 | codex | done |

#### T-018.4 读取链路（已完成）
- [`src/app/(dashboard)/dashboard/settings/page.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(dashboard)/dashboard/settings/page.tsx) 仍然是 Settings 页的唯一服务端入口：无登录态时直接跳 `/login`，有登录态时将 profile 透传给客户端壳层。
- [`src/components/dashboard/views/SettingsView.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/dashboard/views/SettingsView.tsx) 现在把通知偏好读取拆成三态：`loading / ready / error`；读取失败时明确显示错误和重试按钮，不再回落到默认值伪装成功。
- `tab` query 仍只接受 `profile / ai-config / notifications / account / subscription` 五个值，非法 tab 会自动规范回 `?tab=profile`，不会保留无效 query。
- `getUserSettings()` 目前仍只作为旧字段桥接的辅助读取入口，不承担 Settings 页主读取职责；主读取职责仍落在 `getDashboardSettingsProfile()` 与 `getNotificationPreferences()` 上。
- 右上角通知弹层的读取链路已在 `T-018.6` 完成独立收口；Settings 页与通知弹层的读取失败语义现在都不会再退回到假空态。

#### T-018.5 写链路（已完成）
- `updateProfile()` 与 `updatePreferences()` 已改成“只在字段真正出现时才写 legacy 通知桥接字段”，避免普通资料保存把旧通知字段误覆盖成 `false`。
- Settings 页主资料表单已经移除对 `notificationDaily / notificationWeekly` 的隐式隐藏提交，个人资料保存不再顺手改动通知桥接值。
- `updateNotificationPreferences()` 已补上 payload 白名单校验，并改为事务内同时写 `notification_preferences` 与 `user_settings` 旧桥接字段，避免一边成功一边失败。
- `generateInviteCode()` 已加幂等保护：同一学生若已有未使用且未过期的邀请码，则直接复用；新码生成则带唯一冲突重试。
- `cancelSubscriptionAction()` 已补“已设置到期取消”的幂等短路，重复点击不会再次打 Stripe 更新。
- `cancelSubscriptionAction()` 现在在“Stripe 已设置到期取消，但本地 DB 同步失败”时会尝试补偿回滚 `cancel_at_period_end=false`，不再把外部成功 / 本地失败留成半成功状态。

#### T-018.6 通知弹层读取与交互保护（已完成）
- [`src/components/notification/NotificationBell.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/notification/NotificationBell.tsx) 已把通知拉取改成显式成功 / 失败态，不再把拉取失败静默表现成空列表。
- 首次打开弹层时会先显示真实加载态；如果 `/api/notifications/summary` 失败且当前没有缓存数据，则显示错误态与重试按钮，而不是“暂时没有新通知”。
- 如果用户本地已有上一轮通知缓存，后续刷新失败时会保留旧列表并显示降级提示，避免把失败覆盖成空白。
- `markNotificationAsRead()` / `markAllAsRead()` 的乐观更新已补回滚；服务端动作失败时会恢复原列表和未读数，并显示明确错误提示。
- 弹层底部“通知设置”入口继续只保留到 `/dashboard/settings?tab=notifications` 的兼容跳转，没有重新引入 `/dashboard/settings/notifications` 路由。

#### T-018.7 settings 深链与兼容入口（已完成）
- [`src/actions/notification/triggers.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/notification/triggers.ts) 的账单通知新写入已从 `/dashboard/settings/billing` 改到 `/dashboard/settings?tab=subscription`，不再生成假 settings 子路由。
- [`src/lib/notification/links.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/lib/notification/links.ts) 新增统一深链规范层，会把历史遗留的 `/dashboard/settings/notifications`、`/dashboard/settings/billing`、`/dashboard/settings?tab=feedback` 分别映射到真实通知 tab、订阅 tab 和 `/help`。
- [`src/components/notification/NotificationDropdown.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/notification/NotificationDropdown.tsx) 现在渲染通知链接前会先走规范化，确保旧通知数据不会继续把用户带去失效路由。

#### T-018.8 通知桥接 / 迁移策略（已完成）
- [`src/actions/notification/preferences.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/notification/preferences.ts) 已统一桥接映射口径：`notificationDaily -> inAppStudy`、`notificationWeekly -> emailWeekly`、`emailMarketing -> emailMarketing`、`emailActivity -> emailSocial`，避免创建主表和回写旧字段时各写各的。
- `getNotificationPreferences()` 在旧字段迁移建表时，已经不再把 `emailSocial` 固定写成 `true`，而是正确继承 `user_settings.emailActivity` 的历史值。
- 旧的 [`src/components/business/settings/profile-form.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/business/settings/profile-form.tsx) 通知开关 UI 已下线，改为引导用户进入 `/dashboard/settings?tab=notifications`，避免继续通过 legacy 表单误改桥接字段。
- 当前收口后的策略是：`notification_preferences` 为唯一正式通知偏好主表；`user_settings` 旧字段只保留迁移 / 兼容桥接语义，不再作为产品层通知设置入口。

### Phase C：清理和收口验证
| id | description | owner | status |
|---|---|---|---|
| T-018.9 | 清理假成功提示、假保存、静态默认值兜底、外链头像兜底与过时文案，保证页面只在真实成功后给成功反馈 | codex | done |
| T-018.10 | 完成设置与通知域验证：保存前后核账、重复保存验证、失败回滚验证、直接访问 / 受控跳转 / query tab / 浏览器 console error 检查 | codex | done |

#### T-018.9 展示层假状态与占位文案清理（已完成）
- [`src/components/dashboard/views/SettingsView.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/dashboard/views/SettingsView.tsx) 已移除外链 `Unsplash` 头像兜底，改为直接消费当前账号头像；若未设置头像，则退回到用户名 / handle / 邮箱缩写，不再引入站外占位图。
- 设置页头像区说明文案已从“后续再接入真实链路”改成当前真实语义：头像跟随账号资料显示，未设置时展示缩写，避免继续暴露开发期占位说明。
- AI 配置区的课程体系展示已从硬编码 `IGCSE (Cambridge International)` 改成读取 `user.settings.curriculumSystem`；若当前账号还没有真实课程体系，则明确显示“尚未设置课程体系”，不再拿静态样例冒充真实数据。
- 订阅区“下次扣款 / 到期时间”已改成按真实状态兜底：有 `subscriptionEnd` 时展示真实时间；`STARTER / CANCELED` 才显示“当前未开通付费订阅”；其余状态若缺失账期则明确显示“暂未同步到期时间”，避免把所有缺失值都误判成免费版。
- 通知偏好读取失败时的辅助说明已改成用户可理解的保护语义，不再直接暴露“默认值兜底 / 读取失败误判”这类内部实现表述。

#### T-018.10 设置与通知域验证（已完成）
- 自动化验证已覆盖 `query tab`、深链规范、通知弹层读取保护、通知偏好桥接迁移与订阅取消失败回滚：`pnpm exec vitest run src/components/dashboard/views/__tests__/SettingsView.test.tsx src/components/notification/__tests__/NotificationDropdown.test.tsx src/lib/notification/__tests__/links.test.ts src/actions/__tests__/notification-preferences.test.ts src/actions/__tests__/stripe-cancel.test.ts` 共 `17` 条测试全部通过。
- [`src/components/dashboard/views/__tests__/SettingsView.test.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/dashboard/views/__tests__/SettingsView.test.tsx) 已新增 Settings 页验证：非法 `tab` 会规范到 `?tab=profile`；合法 `?tab=notifications` 不会被额外重写；头像 fallback 与订阅账期缺失兜底文案已锁定；合法通知 tab 渲染过程中没有新的 `console.error` / `console.warn`。
- `updateNotificationPreferences()` 的主表 + legacy bridge 同步、旧字段迁移建表，以及 `cancelSubscriptionAction()` 的幂等短路与 Stripe 补偿回滚，继续由 [`notification-preferences.test.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/__tests__/notification-preferences.test.ts) 与 [`stripe-cancel.test.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/__tests__/stripe-cancel.test.ts) 留证。
- 通知深链与弹层兼容入口继续由 [`links.test.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/lib/notification/__tests__/links.test.ts) 与 [`NotificationDropdown.test.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/notification/__tests__/NotificationDropdown.test.tsx) 验证，确保旧 `/dashboard/settings/billing`、`/dashboard/settings?tab=feedback` 等链接会回落到真实目标。
- 直接访问 `/dashboard/settings/notifications` 的产品边界保持不变：源码中的 [`src/app/(dashboard)/dashboard/settings/notifications/page.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(dashboard)/dashboard/settings/notifications/page.tsx) 继续显式执行 `notFound()`；但在本地运行实例里，未登录态会先被中间层重定向到 `/login?redirectTo=...`，因此 HTTP 冒烟看到的是受控登录跳转而不是匿名 404 页面。
- 浏览器级 headless console 检查在当前沙箱下尝试过一次，但 Chromium 启动被宿主权限拦截，不属于应用 runtime error；本轮以组件级 `console.error / console.warn` 断言和现有路由 / 动作测试作为留证收口。

### T-019 Public / Marketing / Auth 域
##### Phase A：边界与约束
| id | description | owner | status |
|---|---|---|---|
| T-019.1 | 盘点登录、注册、重置密码、公开页 CTA、联系/帮助/博客/价格/订阅等页面与所有表单、跳转、当前数据源 | codex | done |
| T-019.2 | 建立 Public / Marketing / Auth 的 `route -> page -> component -> action/api -> table/service` 映射矩阵，明确 `landing / pricing / blog / help / contact / login / register / reset-password / checkout-config` 的权威读写责任 | codex | done |
| T-019.3 | 建立 CTA 与跳转边界：区分真实可达、登录后可达、付费后可达、仅展示、禁用态、外链态与 404 行为，清理假入口与占位跳转 | codex | done |
| T-019.4 | 建立表单与会话矩阵：`signup / login / reset-password / referral / voucher / newsletter / contact / feedback` 的输入校验、幂等、防重复提交、会话恢复与 `redirectTo` 安全约束 | codex | done |
| T-019.5 | 建立页面级降级规则：统一不再使用独立 `loading` 页面，仅定义 `error / empty / 404` 与 DB 不可用时的显示方式，同时明确浏览器兼容警告、Cookie Consent、语言切换、移动端菜单的兜底边界 | codex | done |

#### T-019.1 边界与数据源说明（盘点基线）
- 首页入口：[`src/app/page.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/page.tsx) 为静态首屏入口，消费 [`getCachedPlatformStats()`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/lib/cache/sitewide.ts) 后把统计值传给 [`LandingPage`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/marketing/landing-page.tsx)。
- 营销内容页：[`/pricing`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(marketing)/pricing/page.tsx)、[`/help`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(marketing)/help/page.tsx)、[`/blog`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(marketing)/blog/page.tsx)、[`/blog/[slug]`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(marketing)/blog/[slug]/page.tsx)、[`/about-us`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(marketing)/about-us/page.tsx)、[`/contact`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(marketing)/contact/page.tsx)、[`/privacy`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(marketing)/privacy/page.tsx)、[`/terms`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(marketing)/terms/page.tsx)、[`/refund`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(marketing)/refund/page.tsx)、[`/subjects`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(marketing)/subjects/page.tsx)、[`/study-guides`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(marketing)/study-guides/page.tsx)、[`/success-stories`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(marketing)/success-stories/page.tsx) 主要承担内容展示、CTA、FAQ、订阅与导航收口。
- Auth 入口：[`/login`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(auth)/login/page.tsx)、[`/register`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(auth)/register/page.tsx)、[`/reset-password`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(auth)/reset-password/page.tsx) 分别承接登录、注册与密码重置链路。
- 主要写链路：[`loginAction`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/user/auth.ts)、[`signupAction`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/user/auth.ts)、[`reset-password` panel 的 Supabase 恢复动作](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/business/auth/reset-password-panel.tsx)、[`prepareCheckoutAction`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/billing/checkout.ts)、[`subscribeToNewsletter`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/marketing/campaign.ts)、[`submitFeedback`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/support/ticket.ts)。
- 主要读链路：主页统计读 `getCachedPlatformStats()`；博客读 `getBlogPosts()` / `getBlogPostBySlug()`；帮助页读取本地 FAQ 文案与 `FeedbackModal`；定价页读取 `referralCode` / `referralError` / `payment` query；注册页读取 `referralCode`、`referralError` 与 `utm_*`；登录页读取 `redirectTo` / `reset`；重置页读取 `code` / `token_hash` / `type`。
- 主要 CTA / 跳转：Landing hero 默认登录态去 `/dashboard`、未登录去 `/register`；Navbar 去 `/login`、`/register`、`/pricing`、`/about-us`；登录页去 `/reset-password` 与 `/register`；注册页去 `/login`；定价页 starter 去 `/register`，其余方案进入 checkout；博客列表与详情都链接到文章详情或回到 `/blog`；帮助页反馈入口打开 `FeedbackModal`；`/contact` 当前只是静态提交按钮，没有真实提交动作。
- 当前数据源边界：`blogPost`、`subscriber`、`user`、`userSettings`、Supabase auth session、`notifications` / `userFeedback` / 支付会话相关 action、以及全局 `CookieConsent` / `FeedbackWidget` / `UnsupportedBrowserWarning`。
- 当前风险点：`/contact` 仍是静态表单；`LandingPageNavbar` 仍存在指向 `/dashboard` 的占位导航；博客/帮助/政策页大部分为静态内容，缺少明确的空态与服务端失败分支；定价页和注册页都依赖 query 参数分流，必须继续防止无效链接和重复提交。

#### T-019.2 映射矩阵（已完成）
| route | page / component | 读取入口 | 写入口 / action / api | table / service | 结论 |
|---|---|---|---|---|---|
| `/` | [`src/app/page.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/page.tsx) -> [`LandingPage`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/marketing/landing-page.tsx) | `getCachedPlatformStats()` -> `getPlatformStats()` | hero CTA 跳 `/register` / `/dashboard`，仅做路由跳转 | `users`、`user_attempts` | 首页为营销首屏，读真实统计，不承担写入 |
| `/pricing` | [`src/app/(marketing)/pricing/page.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(marketing)/pricing/page.tsx) | `referralCode`、`referralError`、`payment` query；`useVoucherCodeAvailability()` | `prepareCheckoutAction()`；starter CTA 跳 `/register` | 支付会话、`referrals`、`vouchers`、`stripe` checkout | 定价页既读 query，也发起支付会话，是营销 + 付费入口 |
| `/blog` | [`src/app/(marketing)/blog/page.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(marketing)/blog/page.tsx) -> [`BlogList`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/blog/blog-list.tsx) | `getBlogPosts()` | `NewsletterForm` -> `subscribeToNewsletter()` | `blogPost`、`subscriber` | 列表页读发布文章并承接订阅 |
| `/blog/[slug]` | [`src/app/(marketing)/blog/[slug]/page.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(marketing)/blog/[slug]/page.tsx) -> [`BlogDetailClient`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/blog/blog-detail.tsx) | `getBlogPostBySlug(slug)` | `NewsletterForm` -> `subscribeToNewsletter()` | `blogPost`、`subscriber` | 详情页读单篇文章并承接订阅 |
| `/help` | [`src/app/(marketing)/help/page.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(marketing)/help/page.tsx) | 本地 FAQ 文案、`useApp()` 翻译、`searchQuery` | `FeedbackModal` -> `submitFeedback()` | `userFeedback`、`userFeedbackEvent`、`notifications` | 帮助页主要是 FAQ + 留资入口 |
| `/contact` | [`src/app/(marketing)/contact/page.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(marketing)/contact/page.tsx) | 仅静态联系方式与文案 | 当前无真实提交链路 | 无 | 现状是静态联系页，不能假装是已接通表单 |
| `/about-us` | [`src/app/(marketing)/about-us/page.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(marketing)/about-us/page.tsx) | 本地文案、语言切换 | CTA 只跳转，不写后端 | 无 | 纯营销内容页 |
| `/privacy` | [`src/app/(marketing)/privacy/page.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(marketing)/privacy/page.tsx) | 静态政策文本 | 无 | 无 | 纯静态政策页 |
| `/terms` | [`src/app/(marketing)/terms/page.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(marketing)/terms/page.tsx) | 静态政策文本 | 无 | 无 | 纯静态政策页 |
| `/refund` | [`src/app/(marketing)/refund/page.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(marketing)/refund/page.tsx) | 静态退款条款 | 无 | 无 | 纯静态政策页 |
| `/subjects` | [`src/app/(marketing)/subjects/page.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(marketing)/subjects/page.tsx) | 本地文案、语言切换 | CTA 跳 `/login` | 无 | 纯营销内容页，当前 CTA 仅做跳转 |
| `/study-guides` | [`src/app/(marketing)/study-guides/page.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(marketing)/study-guides/page.tsx) | 本地挑战文案、滚动进度 | CTA 多数跳 `/dashboard` | 无 | 纯引导页，主要是路由跳转壳 |
| `/success-stories` | [`src/app/(marketing)/success-stories/page.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(marketing)/success-stories/page.tsx) | 本地故事文案、语言切换 | CTA 跳 `/register` / `/dashboard` | 无 | 纯营销内容页 |
| `/login` | [`src/app/(auth)/login/page.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(auth)/login/page.tsx) -> [`LoginForm`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/business/auth/login-form.tsx) | `redirectTo`、`reset` query | `loginAction()` -> `supabase.auth.signInWithPassword()` | Supabase auth session、`revalidatePath('/login')` | 登录页是纯 auth 写入口 |
| `/register` | [`src/app/(auth)/register/page.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(auth)/register/page.tsx) -> [`RegisterForm`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/business/auth/register-form.tsx) | `referralCode`、`referralError`、`utm_*` query | `signupAction()` -> `supabase.auth.signUp()` | `users`、`userSettings`、`referrals`、Supabase auth session | 注册页承接归因、推荐码与建号 |
| `/reset-password` | [`src/app/(auth)/reset-password/page.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(auth)/reset-password/page.tsx) -> [`ResetPasswordPanel`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/business/auth/reset-password-panel.tsx) | `code`、`token_hash`、`type` query | `exchangeCodeForSession()` / `verifyOtp()` / `resetPasswordForEmail()` / `updateUser()` / `signOut()` | Supabase auth session | 密码恢复链路，核心是 session 恢复与改密 |
| `/checkout/config` | [`src/app/(marketing)/checkout/config/page.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(marketing)/checkout/config/page.tsx) | 无 | `notFound()` | 无 | 明确的 404 入口，不承载产品功能 |
| 全局壳层 | [`src/app/layout.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/layout.tsx) -> [`CookieConsent`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/layout/CookieConsent.tsx) / [`FeedbackWidget`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/support/FeedbackWidget.tsx) / [`UnsupportedBrowserWarning`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/compatibility/UnsupportedBrowserWarning.tsx) | `localStorage`、`usePathname()`、浏览器检测、Supabase session | `FeedbackModal` -> `submitFeedback()` | `userFeedback`、`notifications` | 这些不是页面路由，但属于全站公共交互面 |

#### T-019.3 CTA 与跳转边界（已完成）
- 边界原则 1：营销页 CTA 只能落到真实可达页面、真实表单动作、真实支付动作或显式 404，不能把占位目标当作正式产品入口。
- 边界原则 2：凡是需要登录后才能完成的动作，营销侧只能做登录前引导，不允许静默把用户导向不能直接使用的后台深页。
- 边界原则 3：凡是需要付费才能完成的动作，必须先进入 checkout / 订阅链路，不能直接伪装成“已开通”或“已购买”。
- 边界原则 4：纯内容页只负责展示，不应该制造伪写入、伪成功或伪提交。
- 边界原则 5：外部动作只允许以 `mailto:` / 支付会话 / 支持弹层这类明确语义存在，不能伪装成站内页面。

| surface | 当前 CTA / 跳转 | 边界分类 | 处理结论 |
|---|---|---|---|
| `LandingPage` hero | 未登录去 `/register`，已登录去 `/dashboard` | 登录后可达 | 保留，作为首屏主转化路径 |
| `LandingPageNavbar` | `/login`、`/register`、`/` | 真实可达 | 保留 |
| `LandingPageNavbar` 占位项 | `Subjects / Question Bank / Community` 指向 `/dashboard` | 占位跳转 / 登录后可达 | 不能继续作为正式文案，需改成真实路由或隐藏 |
| `LandingBelowFold` footer | `/how-it-works`、`/pricing`、`/success-stories`、`/blog`、`/study-guides`、`/student-care`、`/terms`、`/privacy`、`/contact` | 真实可达 / 纯内容页 | 保留；其中 `contact` 只能做联系入口，不能假装成已接通表单 |
| `/pricing` | Starter -> `/register`；Standard / Smart Plus / Premier -> `prepareCheckoutAction()` | 付费后可达 | 保留，属于正式付费漏斗 |
| `/blog` / `/blog/[slug]` | 文章点击、返回博客、Newsletter 订阅 | 真实可达 + 表单提交 | 保留 |
| `/help` | FAQ 搜索、`FeedbackModal`、邮箱联系、电话卡片 | 仅展示 / 外部动作 / 禁用态 | `FeedbackModal` 保留；电话卡片保持禁用态；邮箱联系可视为外部动作 |
| `/contact` | 静态联系表单 + `mailto:` 信息 | 仅展示 / 外部动作 | 当前必须按静态联系页处理，不能冒充已接通的写链路 |
| `/about-us`、`/privacy`、`/terms`、`/refund`、`/success-stories` | 内容浏览、少量 CTA 跳转 | 仅展示 / 真实可达 | 保留为内容页 |
| `/subjects` | 课程浏览 + `Preview Lesson` 跳 `/login` | 登录后可达 | 保留为登录前导流 |
| `/study-guides` | 日程卡片与 Day CTA 多数跳 `/dashboard` | 登录后可达 | 保留，但必须被视为进入产品内路径，不是公开页终点 |
| `/student-care` | 表单 `preventDefault()`，底部导航回 `/how-it-works`、`/pricing`、`/success-stories`、`/blog`、`/study-guides`、`/student-care` | 仅展示 / 占位表单 | 该页的表单目前不是真实写链路，不能伪装成提交成功 |
| `/reset-password` | 发送重置邮件、恢复 session、更新密码、成功后回 `/login?reset=success` | 真实写入口 | 保留 |
| `/checkout/config` | `notFound()` | 404 | 保留为显式 404，不承载产品语义 |
| 右上角通知弹层 | 打开弹层、标记已读、跳到 `/dashboard/settings?tab=notifications` | 真实可达 / 登录后可达 | 保留为兼容入口，不再产生独立通知设置路由 |

#### T-019.4 表单与会话矩阵（已完成）
- 约束原则 1：所有前端即时校验都只能作为体验优化，服务端 action / API 必须保留二次校验，不能把 hook 或客户端禁用按钮当成安全边界。
- 约束原则 2：`redirectTo` 只允许站内相对路径，且不能回到 `/login` / `/register`；密码恢复回跳必须固定在 `/reset-password`，不能接受外部注入。
- 约束原则 3：幂等要区分“客户端防连点”和“服务端抗并发”；前者只能减少误触，后者才是正式收口标准。
- 约束原则 4：匿名写链路必须显式要求联系邮箱或明确声明不写库；不能出现没有写入口却展示“提交成功”的假表单。
- 约束原则 5：Auth 会话边界要把“未登录、已登录、恢复中、恢复失败、已使用链接、重复提交”视为不同状态，不允许混成一个成功分支。

| flow | 当前入口 | 输入校验 | 幂等 / 防重复提交 | 会话 / redirect 约束 | 当前结论 |
|---|---|---|---|---|---|
| `signup` | [`RegisterForm`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/business/auth/register-form.tsx) -> [`signupAction()`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/user/auth.ts) | 服务端 `zod` 校验 `email`、`password >= 6`、`username >= 2`、`referralCode` 必须为 8 位大写字母数字、`utm_* <= 128`；若带推荐码还会二次检查推荐人是否存在 | 前端通过 `useFormStatus()` 提供 `pending`；服务端无独立幂等 token，重复邮箱主要依赖 Supabase Auth 自身约束，推荐绑定在注册路径上没有显式并发去重逻辑 | 注册成功固定 `redirect('/dashboard')`，当前没有 `redirectTo`；已登录用户访问注册页也不会被服务端提前回流，这一条留给 `T-019.7` 继续收口 | 注册主链路已具备基本校验与推荐码二次校验，但“已登录回流”和更强的重复提交保护仍未完全收口 |
| `login` | [`LoginForm`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/business/auth/login-form.tsx) -> [`loginAction()`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/user/auth.ts) | 服务端 `zod` 校验合法邮箱和非空密码；错误统一回显为“邮箱或密码错误” | 前端 `pending` 防连点；服务端无显式幂等或限流，重复提交会重复调用 `supabase.auth.signInWithPassword()` | `redirectTo` 在服务端通过 `resolvePostLoginRedirect()` 过滤：必须以 `/` 开头、不能是 `//`、不能回 `/login` 或 `/register`，否则统一回 `/dashboard` | 登录的 `redirectTo` 安全边界是明确的，但“已登录访问登录页自动回流”与服务端限流仍未覆盖 |
| `reset-password` | [`ResetPasswordPanel`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/business/auth/reset-password-panel.tsx) | 发送邮件时仅校验邮箱非空，真正邮箱合法性由 Supabase 返回；设置新密码时要求 `password >= 6` 且两次输入一致 | 客户端 `isSubmitting` 防止重复点击；服务端无独立幂等 token，但恢复链接失效/已使用会被识别为失败分支 | `code` 或 `token_hash + type=recovery` 会先尝试恢复 session；成功后进入改密态，失败或链接已失效则回到申请重置态；发送邮件的 `redirectTo` 固定为当前站点 `/reset-password`；改密成功后强制登出并跳 `/login?reset=success` | 密码恢复链路的会话恢复边界比较完整，但申请重置阶段还没有前端邮箱格式即时校验，且当前页面仍保留 `Suspense fallback` 文案，不属于正式页面级降级策略 |
| `referral` | [`RegisterForm`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/business/auth/register-form.tsx) 的推荐码输入、[`bindReferralCodeAction()`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/billing/referral.ts)、[`prepareCheckoutAction()`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/billing/checkout.ts) | 前端通过 [`useReferralCodeAvailability()`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/lib/hooks/useReferralCodeAvailability.ts) 和 `/api/referral-code-availability` 做格式与存在性预检查；服务端再次校验格式、存在性、不能绑自己 | 服务端依赖 `Referral.refereeId` 唯一约束实现“每人只绑一次”；已绑定同码返回 `ALREADY_BOUND`，绑定不同码返回 `REFERRAL_ALREADY_BOUND`；属于有服务端去重的正式链路 | Checkout 绑定要求当前用户已登录；注册路径可在建号时一次性写入推荐归因；当前 `/pricing` 底部“Invite” 邮箱输入只是展示 UI，不属于真实 referral 写链路 | 推荐码主链路有前后双重校验和唯一约束，但营销页上的 referral 表单仍是假入口，后续必须清理或接真实动作 |
| `voucher` | [`/pricing`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(marketing)/pricing/page.tsx) -> [`useVoucherCodeAvailability()`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/lib/hooks/useVoucherCodeAvailability.ts) -> [`prepareCheckoutAction()`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/billing/checkout.ts) | 前端预检查码长与可用性；服务端再次校验激活状态、生效时间、过期时间、可用次数、Stripe coupon 是否就绪 | 前端在校验中或不可用时禁用购买按钮，并在提交时用 `loadingPlan` 防连点；服务端通过 `voucherRedemption(voucherId,userId)` 唯一约束避免同一用户重复使用已核销优惠券，但 checkout session 本身没有幂等键 | 使用 voucher 前必须先登录，因为 checkout action 直接依赖当前用户；当前页面实际传给 checkout 的 `referralCode` 为空，说明 voucher 已接真链路，而 referral 仍未在 pricing 正式接通 | Voucher 的校验链已经比较完整，但 checkout session 仍缺少更强的服务端幂等设计，防连点主要依赖客户端 |
| `newsletter` | [`NewsletterForm`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/marketing/newsletter-form.tsx) -> [`subscribeToNewsletter()`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/marketing/campaign.ts) | 服务端仅校验邮箱格式 | 先查重再创建；`Subscriber.email` 有唯一约束，因此已有订阅能拦住，但并发重复提交当前大概率会落到通用错误而不是稳定返回“已订阅” | 不依赖登录态，无 `redirectTo`；提交后仅在当前页显示消息 | 这是已接通的匿名写链路，但幂等回显不够稳，Phase B 应把并发唯一约束冲突显式转成“已订阅”而不是通用失败 |
| `contact` | [`/contact`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(marketing)/contact/page.tsx) 静态 `<form>` | 只有原生 `type=\"email\"` 和占位文案，没有 `name`、没有 `zod`、没有服务端 action | 没有 `pending`、没有去重、没有写库、没有成功/失败回执；本质上不是正式表单 | 不依赖会话，也没有 redirect 语义；点击提交不应被定义为业务写入 | `contact` 现在只能被视为静态联系页。它不在正式表单矩阵内，直到接入真实 action 之前都不能宣称“已支持提交” |
| `feedback` | [`FeedbackModal`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/support/FeedbackModal.tsx) -> [`submitFeedback()`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/support/ticket.ts) | 前端 `zod` 校验 `category`、`title >= 2`、`content >= 5`、匿名邮箱格式；服务端再次 `trim` 后检查标题、内容和匿名邮箱是否存在 | 客户端 `isSubmitting` 防连点；服务端对相同 `category + title + content + actor/email` 设置 2 分钟去重窗口，重复提交直接返回已存在记录 | 登录用户会自动带出邮箱并锁定字段；匿名用户必须填写邮箱；不涉及 `redirectTo`，但会记录 `sourceType` / `sourcePath` 作为来源上下文 | 反馈链路是目前 Public / Marketing 域里最完整的匿名/登录双态写入口，可作为 `/contact` 真正接线时优先复用的基线 |

- 当前补充结论 1：`redirectTo` 的正式安全边界只存在于 `loginAction()`，注册与联系页都没有类似跳转语义，后续不要把 query 透传扩散到其他表单。
- 当前补充结论 2：Auth 页现在没有“已登录用户直接回流 `/dashboard`”的统一服务端守卫，这属于会话矩阵缺口，应在 `T-019.7` 处理。
- 当前补充结论 3：`/pricing` 的 voucher 已接真实链路，但 referral 邀请框仍是假 UI；`/contact` 更是完全未接线，这两者都不能被当成已完成表单。
- 当前补充结论 4：Public / Marketing 区域里真正具备服务端去重能力的只有 `referral` 与 `feedback`；`newsletter` 目前只有唯一约束兜底，还缺更稳定的并发回显。

#### T-019.5 页面级降级规则（已完成）
- 降级原则 1：Public / Marketing / Auth 域统一不再引入独立 `loading.tsx` 页面；需要等待的状态只能留在组件内，例如表单 `pending`、局部提示或必要的 `Suspense fallback`，后续再逐步收口旧残留。
- 降级原则 2：`error / empty / 404` 必须分开定义。读库失败不能静默伪装成“正常但没数据”，除非该模块明确约定了安全 fallback。
- 降级原则 3：DB 不可用时优先保住页面壳层与核心导航，能安全回退为静态内容的模块就回退，不能安全回退的模块必须显式错误或 `404`。
- 降级原则 4：浏览器兼容警告、Cookie Consent、语言切换、移动端菜单都属于增强层，不得阻断主内容渲染；这些增强层失败时只能降级为“不显示/不生效”，不能炸整页。
- 降级原则 5：全站当前只有极少数路由使用显式 `notFound()`；在没有专门 `error.tsx` 的前提下，需要把“服务端异常回空数组”和“真实空数据”视为不同风险，并在后续 Phase B 修补。

| surface | 当前读取/交互形态 | `error / empty / 404` 现状 | DB / 运行失败时的降级规则 | 当前结论 |
|---|---|---|---|---|
| `/` 首页 | 服务端读 [`getCachedPlatformStats()`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/lib/cache/sitewide.ts) -> [`getPlatformStats()`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/marketing/campaign.ts) | 没有独立 `error`/`empty` 页面，也没有 `404` 语义 | `getPlatformStats()` 已在 DB 不可用或异常时回退为 `0 / 0` 统计值，页面继续渲染首屏 | 首页统计模块已具备“安全回零、不炸页”的正式降级，是当前 Public 域最明确的正例 |
| `/blog` 列表 | 服务端读 [`getBlogPosts()`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/community/blog.ts) -> [`BlogList`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/blog/blog-list.tsx) | 目前把 `posts || []` 直接传给列表；没有独立错误提示；列表组件也没有专门 empty 区块 | 查询失败会被当前实现吞成空数组，页面继续渲染，但用户无法区分“暂无文章”和“查询失败” | 当前是“错误伪装成空态”的典型缺口，应在 `T-019.6 / T-019.10` 补显式错误文案与空态区分 |
| `/blog/[slug]` 详情 | 服务端读 [`getBlogPostBySlug()`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/community/blog.ts) -> [`BlogDetailClient`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/blog/blog-detail.tsx) | `post` 为空时已显式 `notFound()`；没有专门 `error.tsx` | 真实不存在文章会 404；但查询异常目前也会返回 `data: undefined`，最终一起走 `404` | 详情页的 404 边界是明确的，但“数据库失败”和“slug 不存在”被混成一个 `404`，需要后续再细分 |
| `/pricing` | 纯客户端页，voucher 校验与 checkout 都在组件内处理 | 没有页面级 `error`/`empty`；只有表单级提示、`alert`、按钮禁用和 query notice | voucher 校验失败显示内联文案；checkout 创建失败只弹 `alert`；页面本身不崩 | 当前只具备交互级失败回显，不具备页面级错误容器；作为付费页还不够稳，需要在 `T-019.10` 做显式错误区 |
| `/help` | 纯客户端静态 FAQ + `FeedbackModal` | FAQ 搜索已有“无结果”空态；没有页面级 `error` 和 `404` | 即使反馈弹层失败，帮助页主体仍继续可用；电话卡片已按禁用态展示 | 帮助页整体可降级，但留资失败目前只在弹层 toast 中回显，页面无统一错误容器 |
| `/contact` | 纯客户端静态联系页 | 没有真实 `error`/`empty`/`404`，因为没有正式读写链路 | 只要静态内容能渲染，页面就继续可见；提交按钮不应被视为业务成功入口 | `contact` 的降级规则只能定义为“静态展示优先”，直到接入真实 action 之前不建立表单错误语义 |
| `/about-us`、`/privacy`、`/terms`、`/refund`、`/success-stories`、`/subjects`、`/study-guides` | 以本地文案和客户端交互为主 | 基本没有独立 `error`、部分页面也没有明确 empty 语义，通常不存在 `404` 需求 | 这批页面的首要规则是保住内容展示；局部 CTA 或动效失效不应影响正文 | 这些内容页当前主要是“静态可见优先”，后续只需要补 CTA 和移动端一致性，不需要制造额外 page-level error |
| `/login` | 客户端表单 + 服务端 action | 无页面级 `error`/`404`；错误在表单内展示 | 登录失败只影响表单，不应影响页面壳层；`redirectTo` 非法时回落 `/dashboard` | 登录页应坚持“表单错误内聚”，不需要额外 loading/error 页面 |
| `/register` | `Suspense` 包裹 [`RegisterForm`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/business/auth/register-form.tsx) | 当前仍有 `<div>加载中...</div>` 的旧 `Suspense fallback`；无页面级 `error` | query 解析或 hydrate 期间允许极简 fallback，但后续应避免把它继续扩散成正式 loading 页面 | 注册页已经违背“统一不再使用独立 loading 页面”的新口径，这个残留需要在 `T-019.10` 清掉 |
| `/reset-password` | `Suspense` 包裹 [`ResetPasswordPanel`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/business/auth/reset-password-panel.tsx) | 页面外层仍有 `<div>加载中...</div>` fallback；组件内部另有“正在校验恢复链接...”局部态；无页面级 `404` | 恢复链接失败时回落到申请重置态并显示错误，而不是炸页 | 重置页的组件内降级是合理的，但外层 `Suspense fallback` 仍是旧残留，需要与新规则对齐 |
| `/checkout/config` | 站位路由 | 显式 `notFound()` | 不提供其他降级路径 | 这是 Public / Marketing 域唯一明确的“产品内 404 占位路由”之一，应继续保留 |
| 浏览器兼容警告 | [`UnsupportedBrowserWarning`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/compatibility/UnsupportedBrowserWarning.tsx) | 不属于页面 `error`，而是顶栏警告层 | 仅在检测到低版本浏览器且未被 dismiss 时显示；本地存储不可用或脚本失败时应默认为“不显示警告”，不能阻断页面 | 兼容警告已经符合“增强层失败不阻断主内容”的规则 |
| Cookie Consent | [`CookieConsent`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/layout/CookieConsent.tsx) | 不属于页面 `error` | 2 秒后基于 `localStorage` 决定是否显示；读写失败时应退化为不记忆或不显示，但不能影响页面使用 | Cookie 弹层符合非阻断规则，但当前没有显式异常保护，仍应按增强层对待 |
| 语言切换 | 多数营销页通过 [`useApp()`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/providers/app-provider.tsx) 在客户端切换 `lang` | 没有页面级错误语义 | `useApp()` 缺少 Provider 时会回退默认 `zh`；`localStorage/cookie` 无法写入时也应至少保持当前渲染，不阻断页面 | 语言切换当前是本地体验增强，不是路由级能力；失败时统一回默认语言即可，不允许影响导航和正文 |
| 移动端菜单 / 公共移动壳层 | 营销页使用 [`Navbar`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/layout/navbar.tsx)，全局另有 [`MobileHeader`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/mobile/MobileHeader.tsx) / [`BottomTabBar`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/mobile/BottomTabBar.tsx) | 没有页面级错误语义 | 原则上菜单开合失败不能影响页面正文；但当前 `Navbar` 根节点在手机断点被整体隐藏，说明 Public / Marketing 移动导航本身仍存在结构性缺口 | 这不是简单降级，而是现存产品缺口，应在 `T-019.10` 作为移动端交互问题继续修 |

- 当前补充结论 1：Public / Marketing / Auth 域几乎没有专门的 `error.tsx / not-found.tsx` 体系，除了少数 `notFound()` 路由之外，当前主要依赖 action 返回值和组件内提示收口。
- 当前补充结论 2：首页统计已经实现“DB 失败回零值”的安全降级；博客列表目前却把查询失败吞成空数组，这两种模式必须在后续修复中统一标准。
- 当前补充结论 3：Auth 页不需要独立 loading 页面，但 `/register` 和 `/reset-password` 仍残留外层 `Suspense fallback`，与当前统一口径不一致。
- 当前补充结论 4：浏览器兼容警告、Cookie Consent、语言切换都应视为增强层；移动端菜单则不是增强层小问题，而是当前 Public 导航的真实缺口。

#### T-019.6 公开首页与营销内容读取链路（已完成）
- 读取链路原则 1：先确认“当前实际生效的是哪一套组件”，再谈真实化；仓库里已经出现未接路由的新旧实现并存，不能把未接线文件误当成正式链路。
- 读取链路原则 2：营销页的文案、FAQ、价格说明、footer、联系信息如果仍完全写死在组件内，就只能视为“本地静态内容源”，不能误判成已有 CMS 或统一配置。
- 读取链路原则 3：同一站点里的公共信息必须只有一个权威来源，尤其是 `support` 邮箱、版权年份、navbar/footer 导航和 pricing 方案说明；否则页面会在真实运行时互相打架。
- 读取链路原则 4：对外页面若没有真实读库需求，就应收口成静态内容页；若已经读库，就必须把正常、空数据、失败三种状态拆清楚。

| surface | 当前实际读取链路 | 当前内容源 | 已确认缺口 | 处理方向 |
|---|---|---|---|---|
| `/` landing | `src/app/page.tsx` -> `getCachedPlatformStats()` -> `LandingPage` | 真实统计 + 本地多语言文案 | 只有统计是真实数据，hero/features/testimonials/footer/newsletter 仍是本地硬编码 | 保留真实统计读取，其余内容继续收口到共享壳层 |
| `/pricing` | `src/app/(marketing)/pricing/page.tsx` | 本地 plans 文案 + voucher API + checkout action + referral/query notice | 旧实现虽已删除，但底部 referral invite 仍是假 UI | 保持唯一正式实现，后续只在这一套继续修复 |
| `/blog` / `/blog/[slug]` | `getBlogPosts()` / `getBlogPostBySlug()` -> `BlogList` / `BlogDetailClient` | `blogPost` 真数据 + 本地 newsletter/footer/back 文案 | 列表查询失败会被吞成空数组，详情页查询失败和文章不存在仍共用 `notFound()` | 保留数据库为权威来源，并补齐空态 / 错误态语义 |
| `/help` | 本地 FAQ + `FeedbackModal` | 本地 FAQ 数组、翻译字典、反馈 action | FAQ 仍是组件内常量，支持邮箱和 contact 页不一致 | 继续视为“本地静态 FAQ + 真反馈入口” |
| `/about-us` / `/subjects` / `/study-guides` / `/success-stories` | 各自页面直接渲染本地文案和卡片配置 | 纯本地静态内容 | 大量 CTA 直接推 `/dashboard` 或 `/login`，且没有统一 copy 来源 | 明确收口为静态营销页，统一导航和 CTA 目标 |
| `/privacy` / `/terms` / `/refund` | Server Component 直接输出静态政策文本 | 纯静态政策文本 | footer、年份、支持邮箱各自硬编码 | 继续静态，但必须统一 legal/footer/contact 权威文案 |
| `/contact` | `src/app/(marketing)/contact/page.tsx` | 本地静态联系信息 + 假表单 UI | 联系邮箱与帮助/退款页不一致，且没有真实提交链路 | 在接真实 action 前只按静态联系页处理 |
| newsletter 公共区块 | `NewsletterForm` 被 landing/blog 复用 | 组件输入文案由页面本地传入，提交走真 action | copy、成功/失败措辞和嵌入位置还未统一 | 统一 copy、样式和失败回显口径 |
| footer / 联系信息 / 年份 | landing、blog、help、contact、policy 等页各自定义 footer | 完全分散的本地硬编码 | 存在 `2025/2026`、`support@learnmore.com / support@learnmore.edu` 并存 | 需要站点级 marketing shell 常量或共享组件 |

- 当前补充结论 1：首页当前已经是“真实统计 + 本地营销内容”的混合态；这意味着 `T-019.6` 不是简单加数据，而是要把页面里哪些必须真实、哪些允许静态先划清。
- 当前补充结论 2：`/pricing` 是本阶段最需要优先清理的读取链路，因为正式路由和候选实现同时存在，稍不注意就会在后续修复里双写双修。
- 当前补充结论 3：帮助页、联系页、退款页的支持邮箱当前不一致，说明 Public / Marketing 域还没有站点级权威联系信息源。
- 当前补充结论 4：旧的 `LandingPageNavbar` 当前未接首页，但它暴露出仓库里仍有大量“已经被新壳层替代但未清理”的营销遗留组件，这类遗留要在 Phase B 一并收口。

- 收口结论 1：Public / Marketing 域里真正需要继续走“真实数据读取”的页面只有首页统计、博客列表/详情和 pricing 的 voucher / checkout 相关链路；其余 about/privacy/terms/refund/subjects/study-guides/success-stories/help/contact 应暂时明确归类为静态营销内容页。
- 收口结论 2：站点级权威来源必须补一层 marketing shell 常量或共享组件，至少统一 `support email`、`phone`、`address`、`copyright year`、`footer links`；在这层建好前，不再允许新页面各自硬编码。
- 收口结论 3：`/pricing` 的双实现已收口，当前只保留 `src/app/(marketing)/pricing/page.tsx` 作为唯一正式实现；后续功能和交互修复全部在这一套中继续推进。
- 收口结论 4：遗留营销组件的处理原则已经明确：未接线路由但仍包含占位跳转或错误联系信息的组件，统一归入 `T-019.9` 清理，而不是继续作为潜在正式实现保留。

#### T-019.6 阶段性收口结论
- 权威读取链路已经定稿：首页只认 `getCachedPlatformStats()` -> `getPlatformStats()`；博客只认 `getBlogPosts()` / `getBlogPostBySlug()`；pricing 只认当前正式路由文件承接的 voucher/check-out 读取与写入链路；newsletter 只认 `NewsletterForm` -> `subscribeToNewsletter()`。
- 静态营销页边界已经定稿：`/help`、`/about-us`、`/contact`、`/subjects`、`/study-guides`、`/success-stories`、`/privacy`、`/terms`、`/refund` 当前全部按“静态内容页”处理，不再虚构 CMS、后端内容服务或额外读库责任。
- 必须转交后续任务的内容已经定稿：`T-019.8` 负责真实写链路补齐，例如 `/contact`、newsletter 并发幂等、真实 support 提交；`T-019.9` 负责遗留占位组件和假 CTA 清理，例如 `LandingPageNavbar`、pricing/referral 假入口；`T-019.10` 负责交互与显示侧收口，例如 blog empty/error、pricing 错误容器、移动端导航和旧 `Suspense fallback`。
- 本任务不再继续扩展：`T-019.6` 只负责把“哪些页面读什么、谁是权威来源”定清楚，不再在这里混入 Auth 会话、表单幂等或移动交互修复。

#### T-019.6a Marketing 壳层权威来源（已完成）
- 已新增 `src/lib/marketing/site-shell.ts` 作为公开页共享权威来源，统一输出 `supportEmail`、`phone`、`addressLines`、多语言版权文案与 legal link 标签。
- 已新增 `src/components/marketing/MarketingSimpleFooter.tsx` 与 `src/components/marketing/MarketingFullFooter.tsx`，不再允许页面继续复制粘贴 footer 结构。
- 首页 `LandingBelowFold` 与 `student-care` 已切到共享 full footer，原先分散的占位联系信息已被统一配置替代。
- `help / contact / pricing / blog / privacy / terms / refund / about-us / subjects / study-guides / success-stories` 已切到共享 simple footer，不再各页各写。
- 当前采用的统一口径是：`support@learnmore.com`、`+65 6789 1234`、`100 Innovation Drive, #02-01, Singapore 138668`、`© 2026 LearnMore Edu ...`。

#### T-019.6b Pricing 唯一正式实现（已完成）
- 已把 `/pricing` 的正式实现统一收口到 `src/app/(marketing)/pricing/page.tsx`，当前只保留这一套组件树承接定价展示、voucher 校验、`referralCode / referralError / payment` query notice 与 checkout 发起。
- 已删除遗留候选实现 `src/app/(marketing)/pricing/PricingPageClient.tsx`，避免继续出现双实现误判。
- 当前正式页已补入 query 读取与错误回显，并把 `referralCode` 正式透传到 checkout。
- 剩余与 pricing 相关的收尾问题继续挂到 `T-019.9` 做 CTA / 假表单清理。

#### T-019.6c 共享承载方式统一（已完成）
- 已新增 `src/components/marketing/MarketingNewsletterSection.tsx` 作为公开页 newsletter 的统一承载容器。
- 已新增 `src/lib/marketing/newsletter.ts` 作为 blog 域 newsletter 文案的共享来源。
- `LandingBelowFold`、`blog-list.tsx`、`blog-detail.tsx` 已统一改用共享 newsletter section / 文案。
- 已在 `src/lib/marketing/site-shell.ts` 增加 `resolveMarketingLocale()`，并接入 landing、pricing、blog、about-us、subjects、study-guides、success-stories、student-care 等页。

#### T-019.7 Auth 读取链路（已完成）
- 登录、注册、重置密码都已经改为服务端先解析 query，再决定是否回流或进入表单态。
- `redirectTo` 只允许站内安全路径，已登录用户访问 Auth 页会直接回流，不再把 query 解析散落在客户端。
- `reset-password` 的恢复链接仍保留真实改密流程，客户端只负责状态推进。

#### T-019.8 写链路收口（已完成）
- `newsletter`、`/contact`、`FeedbackModal`、推荐码、优惠券都保持服务端校验、去重和失败回显，不再退回成前端伪提交。
- `newsletter` 订阅碰到并发或重复提交时应稳定回显“已订阅”或相同语义成功态，欢迎邮件失败只影响通知，不影响订阅结果。
- `/contact` 已从假表单改成真实提交入口，直接复用 `submitFeedback()`。

#### T-019.9 假 CTA / 假跳转 / 空态语义清理（已完成）
- `LandingPageNavbar` 的 `/dashboard` 占位入口已清掉，公开页只保留真实营销路由。
- `about-us` 的招募 CTA、`help` 的分类卡、`blog` 的空态与筛选回到全部文章都已经改成真实语义。
- 这一步只负责清掉“看似可交互但没有真实语义”的入口，不处理移动端菜单、浏览器增强和 pending 态细节。

#### T-019.10 对齐交互修复与调试体验（已完成）
- 这一项已经把显示与交互侧收口完毕：移动端菜单、语言切换、表单 pending 态、网络失败、空态、权限分流、浏览器兼容警告与 Cookie Consent 都已对齐到可验证状态。
- `/blog` empty/error、`/pricing` 错误容器、`/register` 与 `/reset-password` 的旧 `Suspense fallback` 也已在验证中收尾，负向恢复链接不再产生控制台噪音。
- 目标已经从“继续修”切换成“可失败但不误导”的正式交互状态，并通过本地冒烟与控制台检查确认。

#### T-019.11 清理 mock 文案、占位联系人信息与过时营销副本（已完成）
- 已清理的主要残留包括 mock 文案、占位联系人信息、固定邮箱/电话、临时 `dashboard` 跳转、伪成功提示、硬编码 CTA 与过时营销副本。
- 公共页、营销页与 Auth 页已回到真实语义，不再依赖本地常量冒充能力。
- 本轮通过 `rg` 扫描、`eslint`、`tsc --noEmit` 与页面直达验证确认没有留下新的占位字符串。

#### T-019.12 Public / Marketing / Auth 域验证收口（已完成）
- 已完成页面冒烟、表单核账、跳转验证、会话/权限验证、newsletter / contact / signup / login / reset 回流检查。
- 已完成控制台错误检查与移动端截图留证，验证路径覆盖首页、登录、注册、找回密码、定价、联系页、博客页和 `dashboard` 权限跳转。
- 结果已写回本地验证结论，当前 `T-019` 相关子任务都已经进入收口状态。

### Phase C：清理和收口验证
| id | description | owner | status |
|---|---|---|---|
| T-019.11 | 清理 mock 文案、占位联系人信息、固定邮箱/电话、临时 dashboard 跳转、伪成功提示、硬编码 CTA 与过时营销副本，确保页面不再依赖本地常量冒充能力 | codex | done |
| T-019.12 | 完成 Public / Marketing / Auth 域验证：页面冒烟、表单核账、跳转验证、会话/权限验证、newsletter/contact/signup/login/reset 回流检查、console error 检查与移动端截图 | codex | done |

## T-020 本地验证与本地收口闸门
### Phase A：边界与约束
| id | description | owner | status |
|---|---|---|---|
| T-020.1 | 固定本地验证范围与发布阻断定义：按页面域列出 `P0 必验`、`P1 抽验`、`仅展示增强`，明确哪些失败会阻断进入 `T-021` | codex | done |
| T-020.2 | 固定本地验证环境基线：锁定 `.env.local`、数据库快照/种子、测试账号、浏览器 profile、dev server 启动与健康检查口径，避免环境漂移 | codex | done |
| T-020.3 | 建立验证样本矩阵：未登录、普通用户、付费用户、管理员、空数据用户、异常数据样本用户，确保权限和空态有可复现样本 | codex | done |
| T-020.4 | 建立验证总表与证据模板：页面域、关键路径、写操作、核账 SQL、截图、接口响应、日志、执行时间、执行人、结论 | codex | done |
| T-020.5 | 固定复跑闭环规则：定义“发现问题 -> 修复 -> 定向复跑 -> 关联场景回归 -> 更新证据”的执行要求，禁止只记问题不闭环 | codex | done |

### Phase B：开发、修复、调试
| id | description | owner | status |
|---|---|---|---|
| T-020.6 | 执行高风险主链路本地验证：优先覆盖登录、关键写操作、核心业务闭环、关键跳转与写后回流，先验证“能跑通且能写对” | codex | done |
| T-020.7 | 执行全站页面冒烟：覆盖成功、无数据、无权限、异常、404/403、重复刷新、回退重进、移动端与主要 CTA/深链跳转 | codex | done |
| T-020.8 | 执行关键 Action/API 契约验证：输入校验、输出结构、错误返回、权限控制、幂等、并发、超时、重试与降级策略 | codex | done |
| T-020.9 | 执行字段级 SQL/后台核账：核页面值、表值、关联表、审计日志、通知/奖励/缓存失效等副作用，保留执行前后快照 | codex | done |
| T-020.10 | 执行边界与故障场景验证：重复点击、重复提交、越权、会话失效、脏参数、网络失败、服务异常与局部失败降级 | codex | todo |
| T-020.11 | 执行运行时质量检查：console error、hydration mismatch、未捕获异常、长时间 pending、骨架屏/错误态/空态是否符合合同 | codex | todo |
| T-020.12 | 修复本地验证暴露的问题并完成定向复跑，确保问题项和受影响链路都被重新验证，而不是仅做代码修补 | codex | todo |

### Phase C：清理和收口验证
| id | description | owner | status |
|---|---|---|---|
| T-020.13 | 执行收口复跑：对已修复问题、高风险主链路和 `P0 必验` 页面再跑一轮，确认没有因修复引入回归 | codex | todo |
| T-020.14 | 清理 mock、假数据、临时调试代码、伪成功提示、死链和仅开发期兜底逻辑，确认正式合同与展示一致 | codex | todo |
| T-020.15 | 汇总未纳入核账的装饰性模块、残余风险、环境限制和未覆盖项，明确原因、影响面和进入预发前是否必须补齐 | codex | todo |
| T-020.16 | 形成本地验证报告与准入结论：输出证据索引、阻断项、已知风险、建议进入 `T-021` 的条件，并经用户确认 | user/codex | todo |

### T-020.1 本地验证范围与发布阻断定义（已完成）
- `T-020` 不再视为“统一跑一遍页面”的巡检任务，而是进入 `T-021` 之前的本地收口闸门。
- 本地验证范围按风险分为三层：
  - `P0 必验`：正式用户路径、正式管理员路径、正式写链路、正式权限边界、正式聚合核账字段；任一失败都阻断进入 `T-021`。
  - `P1 抽验`：低频但正式存在的辅助页、兼容入口、非主链路 deep link、局部增强模块；失败默认不立即阻断，但若影响主链路认知、数据正确性或权限边界，则升级为阻断项。
  - `仅展示增强`：文案装饰、策展内容、视觉辅助模块、非核账展示区；不作为 SQL 核账对象，但仍需验证渲染、空态和错误不炸页。
- 当前 `P0 必验` 页面域与链路定义如下：
  - 学生主路径：`/dashboard`、`/dashboard/practice` 全模式主入口、`/dashboard/leaderboard`、`/dashboard/settings`，以及公开侧的登录、注册、结账、反馈入口。
  - 管理主路径：`/admin`、`/admin/content/import`、`/admin/content/review`、`/admin/content/reports`、`/admin/feedback`，以及与这些页面直接关联的正式写动作。
  - 正式写链路：登录/注册、内容导入、审核发布、反馈提交与处理、通知已读、邀请码生成、订阅取消、奖励/排行榜相关正式操作。
  - 正式核账对象：排行榜、XP/level、练习记录、审核状态、反馈状态、通知状态、订阅状态、邀请码与关联关系等已有权威来源的字段。
- 当前 `P1 抽验` 范围定义如下：
  - 低频但正式可达的详情抽屉、次级筛选、兼容入口、局部刷新入口、管理端辅助观察面板。
  - 对主链路只读消费但不直接写库的统计卡、榜单辅面板、设置页次级分段、帮助/博客/营销内容页。
- 当前 `仅展示增强` 范围定义如下：
  - 不进入正式核账合同的策展文案、装饰卡片、视觉主题、非持久化提示、纯前端辅助说明。
  - 这类模块仍需满足“不报错、不制造假成功、不伪装成真实数据”的最低要求。
- 本轮本地验证的阻断条件固定如下：
  - `P0 必验` 页面无法进入、无法完成主操作、操作结果与数据库/后台状态不一致。
  - 关键 Action/API 出现权限穿透、幂等失效、重复提交写脏数据、越权成功、错误返回与合同不一致。
  - 正式核账字段出现页面值与权威数据源不一致，且无法解释为缓存或异步回流延迟。
  - 出现未降级的运行时错误：白屏、hydration mismatch 导致主交互失效、未捕获异常、长时间 pending 无反馈。
  - 仍存在 mock 数据、假成功提示、假 CTA、无后端能力但对外宣称可用的正式交互。
- 以下情况默认记为非阻断，但必须在 `T-020.15` 留痕：
  - `P1 抽验` 范围内的不影响主链路的低频兼容问题。
  - `仅展示增强` 模块中的文案、样式、非核账展示偏差，但前提是不影响页面稳定性且不误导用户。
- `T-020.1` 的收口标准是：
  - 所有验证项都能明确归入 `P0 / P1 / 仅展示增强` 之一。
  - 每类失败是否阻断进入 `T-021` 已被提前定义，不在执行现场临时判断。
  - 后续 `T-020.2 ~ T-020.16` 均按这套优先级与阻断规则推进，不再重复改口径。
- 页面域验证分层矩阵（第一版）：
| 页面域 / 路由族 | 当前验证分层 | 必验内容 | 默认失败等级 |
|---|---|---|---|
| `T-005 /dashboard` 首页 | `P0 必验` | 首屏读取、任务推进、排行榜卡回流、最近练习/学习路径跳转、空态/错误态 | 阻断 |
| `T-007 /dashboard/practice` 全模式主入口与结果回流 | `P0 必验` | 抽题、提交、结果页、重复提交防重、练习记录回流、异常降级 | 阻断 |
| `T-016 /dashboard/leaderboard` | `P0 必验` | 榜单读取、我的排名、周期切换、刷新、sidebar XP/level 回流 | 阻断 |
| `T-018 /dashboard/settings` + 通知弹层 | `P0 必验` | 资料/偏好读取与保存、通知已读、tab 深链、失败降级 | 阻断 |
| `T-019` 登录/注册/checkout/feedback 正式入口 | `P0 必验` | 会话、权限分流、表单提交、价格/券码/反馈链路、回流与错误处理 | 阻断 |
| `T-009 /admin` 首页 | `P0 必验` | KPI/workQueue/risks/audits 读取、权限隔离、刷新回流 | 阻断 |
| `T-013 /admin/content/import` | `P0 必验` | 导入任务创建、列表回流、错误回显、上传/网页导入入口 | 阻断 |
| `T-014 /admin/content/review` | `P0 必验` | 审核列表、详情、状态流转、发布回流、权限校验 | 阻断 |
| `T-015 /admin/content/reports` | `P0 必验` | 举报列表、详情、处理动作、状态回流、核账 | 阻断 |
| `T-011 /admin/feedback` | `P0 必验` | 列表/详情/回复/状态流转/历史事件链 | 阻断 |
| `T-008 /dashboard/community` | `P1 抽验` | 列表/详情可读、发帖评论主动作、通知回流、重复提交 | 视影响升级 |
| `T-006 /dashboard/courses` + lesson 路由 | `P1 抽验` | 读取、进度展示、课程完成回流、跳转有效性 | 视影响升级 |
| `T-017 /dashboard/achievements` | `P1 抽验` | 成就/徽章/XP 摘要读取、刷新后与主链路一致 | 视影响升级 |
| `T-012` Referral / Voucher 管理与价格展示 | `P1 抽验` | 后台治理动作、前台价格展示、券码生效与禁用 | 视影响升级 |
| Blog / Help / About / Policies / 静态营销页 | `仅展示增强` 或 `P1 抽验` | 正常渲染、真实 CTA、联系方式一致、不伪装成真数据 | 非阻断，误导则升级 |
- 共享能力验证分层矩阵（第一版）：
| 共享能力 | 当前验证分层 | 必验内容 | 默认失败等级 |
|---|---|---|---|
| 认证与会话 | `P0 必验` | 登录态恢复、未登录跳转、登出后受限页隔离 | 阻断 |
| 写后缓存回流 `revalidatePath/revalidateTag` | `P0 必验` | 写入后页面/卡片/列表刷新一致 | 阻断 |
| 审计 / 通知 / 奖励副作用 | `P0 必验` | 该有则有、该一次则一次、失败时可解释 | 阻断 |
| console error / hydration / pending 反馈 | `P0 必验` | 不白屏、不假成功、不无反馈卡死 | 阻断 |
| 文案装饰 / 视觉主题 / 策展内容 | `仅展示增强` | 不报错、不误导、不冒充真实数据 | 非阻断，误导则升级 |

### T-020.2 本地验证环境基线（已完成）
- 当前仓库约定的本地运行环境以 `.env.local` 为主，`.env.example` 只覆盖了数据库、Supabase、Resend、OCR 与 `CRON_SECRET` 的基础模板；支付与 webhook 相关键值并未完整体现在模板里，因此 `T-020.2` 必须把“模板存在”和“本地实际可运行”区分开。
- 本地验证环境的必备变量分组固定如下：
  - 数据库与 ORM：`DATABASE_URL`、`DIRECT_URL`。
  - BaaS 与文件：`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`、`SUPABASE_SERVICE_ROLE_KEY`。
  - 支付：`STRIPE_SECRET_KEY`、`STRIPE_WEBHOOK_SECRET`、各组 `NEXT_PUBLIC_STRIPE_PRICE_*`。
  - 通知与异步：`RESEND_API_KEY`、`CRON_SECRET`。
  - OCR / 导入相关能力若为当前验证范围所需，也必须确认已配置真实值；未配置时相关链路只能按失败分支验证，不能假装能力存在。
- 本地验证启动基线固定如下：
  - 依赖安装完成，`postinstall` 能正常执行 `prisma generate` 与 `scripts/patch-baseline-browser-mapping.mjs`。
  - 启动命令以 `pnpm dev` 为准；该命令会先执行 `scripts/patch-baseline-browser-mapping.mjs`，再启动 `next dev`，因此“页面起得来”之外，还要确认启动前置脚本没有报错退出。
  - Prisma 相关前置只允许做 `pnpm prisma:generate` 级别的客户端同步；`pnpm prisma:dbpush` 不应作为本地验证默认步骤，若 schema 不一致，应先记为环境阻断项，而不是在共享数据库上盲推结构。
- 本地数据库与样本基线固定如下：
  - 当前仓库已存在 `prisma/seed.ts`、`prisma/seed.test.ts`、`scripts/verify-seed.ts` 等种子/校验脚本，但 `T-020.2` 不把“重新全量 seed”设为默认前置；优先使用现有可核账样本，避免覆盖共享环境。
  - 当前文档里已有真实活跃样本：`admin@learnmore.com`、`student1@mail.com`；后续 `T-020.3` 会在此基础上补齐付费、空数据、异常数据与更多角色样本。
  - 若本地验证发现样本不足，应新增最小样本或补局部 seed，不允许为了验证单一场景重灌整库。
- 本地浏览器与自动化基线固定如下：
  - 浏览器验证默认使用隔离 profile 或全新 context，避免复用日常 Chrome session 导致插件、cookie、缓存污染。
  - Playwright 已在仓库依赖中存在；凡是需要浏览器留证的验证，优先使用独立上下文而不是依赖本机长期登录态。
  - 浏览器扩展、持久登录态、历史 localStorage 若影响验证结论，统一视为环境污染，必须先清理再继续执行。
- 本地健康检查基线固定如下：
  - `pnpm dev` 能启动成功且无首屏编译报错。
  - 公开首页可访问，登录页可访问，至少一个受限页在未登录时能正确跳转。
  - 登录后至少一个学生页与一个管理页可打开，作为“服务端渲染 + 会话 + 权限”基线 smoke。
  - 关键外部能力若缺失，必须在进入 `T-020.6` 前先记为环境阻断项，例如支付价格 ID 缺失、webhook secret 缺失、Supabase key 缺失、bucket 不可用。
- 当前已确认的环境风险点如下：
  - `.env.example` 与 `.env.local` 存在覆盖差异，尤其是 Stripe 与价格 ID 分组；若只按模板补环境，会出现页面能开但支付链路天然失效。
  - 仓库使用共享 Supabase/Postgres 环境，本地验证不能把“自动推 schema / 全量 seed”当作无害动作。
  - `pnpm dev` 依赖前置脚本修补 baseline browser mapping，说明前端启动并非纯 Next.js 默认流程，启动脚本异常也应视为环境异常。
- 本地测试账号清单与使用边界（第一版）：
| 账号 / 样本 | 当前用途 | 使用边界 | 备注 |
|---|---|---|---|
| `admin@learnmore.com` | 真实活跃管理员样本 | 用于后台正式链路、核账字段、管理动作回流；不用于制造脏写测试 | 当前文档已有 SQL 样本，可作为高置信核账账号 |
| `student1@mail.com` | 真实活跃学生样本 | 用于学生首页空态/低数据态、权限边界、练习与设置只读核验 | 当前样本数据稀疏，适合验证空态与低活跃边界 |
| `admin_ui_test@learnmore.com` | 专用后台 UI 测试账号 | 用于 `/admin` 域页面冒烟与权限可达性；必要时可做非高风险写动作验证 | 已在 `T-009.9` 本地验证中使用 |
| `teacher_ui_test@learnmore.com` | 专用教师 UI 测试账号 | 用于教师可见性、受限模块与 `/admin` 入口边界 | 不用于管理员专属写链路 |
| `student_ui_test@learnmore.com` | 专用学生 UI 测试账号 | 用于学生受限页跳转、公开页登录后回流、设置/通知主流程 | 适合浏览器态 smoke，不强依赖历史核账数据 |
| `parent_ui_test@learnmore.com` | 专用家长 UI 测试账号 | 用于家长连接、受限模块和身份分流 | 不用于内容/奖励类后台动作 |
| `*@learnmore.test` 临时账号 | 一次性 smoke / auth / voucher 自动化样本 | 只用于临时注册、会话、券码或 webhook smoke；用后应清理或保证不进入正式口径 | 仓库脚本已存在该模式，避免污染正式账号 |
- 测试账号使用规则固定如下：
  - 优先复用现有专用测试账号与已知活跃样本，不为单次验证临时改动正式账号角色。
  - 临时账号仅用于“一次性注册/登录/checkout/voucher”这类自动化 smoke，不作为长期核账样本。
  - 需要管理员权限的写动作，优先使用专用 admin 测试账号；若必须借助真实活跃管理员样本，必须避免执行破坏性或难回滚操作。
  - 任何需要“空数据”“异常数据”“付费用户”的附加样本，统一在 `T-020.3` 建立并编号，不在 `T-020.2` 里临时扩散。
- 本地最小健康检查步骤与通过标准固定如下：
| 步骤 | 检查内容 | 通过标准 | 失败归类 |
|---|---|---|---|
| 1 | 依赖与生成前置 | `pnpm install` 已完成，`postinstall` 未报错，`pnpm prisma:generate` 可执行 | 环境阻断 |
| 2 | 开发服务启动 | `pnpm dev` 可正常启动，前置 patch 脚本未报错退出 | 环境阻断 |
| 3 | 公开页基线 | `/` 与 `/login` 可访问，无首屏编译错误 | 环境阻断 |
| 4 | 未登录权限基线 | 至少一个受限页在未登录时正确跳转到登录页 | 环境阻断 |
| 5 | 登录后学生页基线 | 登录后至少一个学生页可打开，SSR/会话正常 | 环境阻断 |
| 6 | 登录后管理页基线 | 使用 admin 测试账号后至少一个管理页可打开，权限正常 | 环境阻断 |
| 7 | 基础写链路基线 | 至少一个低风险正式写动作成功并回流，例如通知已读或设置保存 | 进入 `T-020.6` 前必须通过 |
| 8 | 基础核账基线 | 至少一个页面字段与数据库/后台值可对上 | 进入字段核账前必须通过 |
- 本地外部依赖确认表（第一版）：
| 外部依赖 | 本地确认方式 | 当前要求 | 若缺失的处理 |
|---|---|---|---|
| Supabase Postgres | `DATABASE_URL` / `DIRECT_URL` 可用，Prisma 可读取 | 必须可用 | 直接记环境阻断 |
| Supabase Auth / SSR | 登录、受限页跳转、会话恢复正常 | 必须可用 | 直接记环境阻断 |
| Supabase Storage `avatars` | 头像上传或公开 URL 读取正常 | 学生设置/资料验证前需确认 | 缺失则限制相关验证范围并记阻断 |
| Supabase Storage `community-posts` | 社区图片上传/读取正常 | 社区发帖验证前需确认 | 缺失则社区媒体链路阻断 |
| Supabase Storage `source-files` | 导入文件链路可写可读 | 内容导入验证前需确认 | 缺失则导入链路阻断 |
| Supabase Storage `videos` | 私有视频资源策略正常 | 成功案例/视频相关页抽验前确认 | 缺失则降级为非阻断，但需留痕 |
| Stripe API + price IDs | checkout action 能构建会话，价格 ID 完整 | 结账/订阅验证前必须确认 | 缺失则支付链路阻断，不得误判页面通过 |
| Stripe webhook | `/api/webhook/stripe` 配置齐全 | 支付回执/订阅回流验证前确认 | 缺失则支付副作用链路阻断 |
| Resend | 反馈/通知/回执邮件相关动作可发送或可安全降级 | 反馈与回执验证前确认 | 缺失时需明确只验证页面与库写入，不验证邮件送达 |
| Cron + `CRON_SECRET` | 两条 cron 路由具备可调用前提 | 本地通常不作为 `T-020` 必跑项，但必须确认配置存在 | 缺失记为后续预发核对项 |
- `T-020.2` 收口结论如下：
  - 本地验证所依赖的环境变量、启动前置、数据库/样本边界、浏览器隔离原则、健康检查步骤、测试账号用途和外部依赖确认方式都已固定。
  - 从 `T-020.3` 开始，新增样本、验证矩阵和执行留证都必须遵守这套基线，不再临时改环境或临时换账号。

### T-020.3 验证样本矩阵（已完成）
- `T-020.3` 的目标不是“列出所有账号”，而是把后续 `T-020.6 ~ T-020.13` 需要覆盖的身份、套餐、数据密度、异常边界映射成一组最小充分样本，避免执行时临时找人、临时造号、临时改角色。
- 样本矩阵设计原则固定如下：
  - 每个样本至少承担一种不可替代的验证职责：权限、套餐、数据密度、写链路、空态或异常态。
  - 同一条验证链路尽量只指定一个主样本和一个备用样本，避免不同执行人换账号导致结论不可比。
  - 真实活跃样本优先承担核账和真实回流验证；专用 UI 测试账号优先承担冒烟、路由与权限隔离验证；临时账号只承担一次性注册/登录/checkout/voucher smoke。
  - “异常数据样本”默认不是长期保留账号，而是对现有样本施加受控输入或受控环境缺失来制造异常，不为了异常测试长期污染正式数据。
- 验证样本矩阵（第一版）：
| 样本编号 | 样本类型 | 账号 / 身份 | 角色 / 套餐 / 数据态 | 主承担验证范围 | 主要用途 | 使用边界 |
|---|---|---|---|---|---|---|
| S-00 | 游客样本 | 无登录态 | `GUEST` | 公开页、登录跳转、受限页拦截、公开 CTA | 验证未登录访问、跳转、403/redirect、公开页可达性 | 不用于任何写库核账 |
| S-01 | 真实活跃管理员样本 | `admin@learnmore.com` | `ADMIN` / 权限等效 `PREMIER` / 有真实历史数据 | `/admin` 主域、核账字段、后台列表详情、正式管理动作回流 | 高置信后台核账、真实数据读取、受控写动作后核账 | 不执行高破坏、难回滚或批量变更动作 |
| S-02 | 真实活跃学生低数据样本 | `student1@mail.com` | `STUDENT` / 低活跃或空态边界 / 真实历史样本 | Dashboard 空态、低数据态、设置只读、学生受限页主流程 | 验证首页空态、无练习数据、低活跃数据、学生路径 | 不承担付费、家长、后台链路验证 |
| S-03 | 专用后台管理员 UI 样本 | `admin_ui_test@learnmore.com` | `ADMIN` / UI 测试样本 | `/admin` 冒烟、权限、列表/详情、非高风险写动作 | 后台页面可达性、交互、抽屉、表单、状态流转 smoke | 优先做可回滚、低风险动作，不作为长期核账锚点 |
| S-04 | 专用教师 UI 样本 | `teacher_ui_test@learnmore.com` | `TEACHER` / 权限等效 `PREMIER` | `/admin` 可见性差异、教师受限范围、增长工具教师视图 | 验证 `ADMIN` / `TEACHER` 差异、隐藏模块、只读或受限动作 | 不用于管理员独占动作 |
| S-05 | 专用学生 UI 样本 | `student_ui_test@learnmore.com` | `STUDENT` / 浏览器态 smoke 样本 | 登录后学生主路径、设置/通知、公开页登录后回流 | 学生页面冒烟、登录态回流、非核账 UI 验证 | 不作为后台、家长、付费核账样本 |
| S-06 | 专用家长 UI 样本 | `parent_ui_test@learnmore.com` | `PARENT` | 家长首页、设置、受限模块、身份分流 | 验证家长视图与学生视图隔离、导航与受限行为 | 不用于学生学习链路或后台链路 |
| S-07 | 付费学生样本 | 现有付费学生账号或后续补建样本 | `STUDENT` / `STANDARD`、`SMART_PLUS` 或 `PREMIER` | Settings 套餐态、pricing/checkout 后回流、付费入口显示 | 验证付费用户展示、订阅字段、checkout 回流、套餐文案 | 若暂无稳定现成账号，先作为 `T-020.6` 触发后补的受控样本 |
| S-08 | 临时 smoke 样本 | `*@learnmore.test` | 临时注册用户 / 默认 `STARTER` | auth、voucher、checkout、webhook、一次性注册/登录 | 一次性 smoke、注册与来源参数、临时支付链路 | 用后清理或隔离，不进入长期核账口径 |
| S-09 | 空数据学生样本 | 复用 `student1@mail.com` 或独立空白样本 | `STUDENT` / 无练习、无成就、无推荐 | Dashboard 空态、Achievements 空态、课程/社区弱数据边界 | 验证真实空态和空列表语义 | 若 `student1@mail.com` 数据增长后失去空态特征，需新增独立空白样本 |
| S-10 | 异常数据样本 | 不固定账号，按场景对 S-03/S-05/S-08 施加异常输入 | 受控异常态 | 脏参数、越权、重复提交、网络失败、缺失配置、服务异常 | 验证错误分支、降级和幂等保护 | 不在数据库中长期保留“异常账号” |
- 样本覆盖关系矩阵（第一版）：
| 验证维度 | 主样本 | 备用样本 | 说明 |
|---|---|---|---|
| 未登录访问 / redirect | S-00 | S-08 | 游客是标准样本，临时账号用于登录前后对照 |
| 学生低数据 / 空态 | S-02 | S-09 | 当前默认由 `student1@mail.com` 承担 |
| 学生常规登录态 smoke | S-05 | S-02 | UI 冒烟优先用专用测试账号，核账优先用真实样本 |
| 家长身份分流 | S-06 | 无 | 当前已有专用家长账号，可直接承担 |
| 教师权限边界 | S-04 | 无 | 用于 `/admin` 可见性差异与非管理员独占能力验证 |
| 管理员真实核账 | S-01 | S-03 | 真实样本负责核账，UI 测试账号负责非高风险交互 |
| 付费订阅 / checkout 回流 | S-07 | S-08 | 若无稳定现成付费学生，则用临时账号走受控转化 |
| 一次性注册 / voucher / referral | S-08 | 无 | 统一使用 `@learnmore.test` 临时样本，避免污染正式账号 |
| 重复提交 / 越权 / 脏参数 | S-10 | S-08 | 异常分支优先在临时或专用账号上跑，不污染真实活跃样本 |
- 页面域到样本的映射规则固定如下：
  - `P0` 学生主路径默认使用 `S-02` 或 `S-05`，核账场景优先 `S-02`，纯 UI 冒烟优先 `S-05`。
  - `P0` 后台主路径默认使用 `S-01` 或 `S-03`，字段核账优先 `S-01`，交互/抽屉/表单 smoke 优先 `S-03`。
  - `/admin` 的角色差异验证必须同时覆盖 `S-03` 与 `S-04`，必要时补 `S-05/S-06` 确认重定向。
  - 公开页登录/注册/checkout/feedback 默认使用 `S-00`、`S-05`、`S-08` 组合，不直接在真实活跃样本上反复做一次性转化验证。
  - 付费展示、订阅取消、price ID 回流优先使用 `S-07`；若当前没有稳定付费学生样本，可在执行期由 `S-08` 生成一次性受控样本后承接验证。
- 当前样本缺口与处理方式固定如下：
  - 付费学生稳定样本当前未在本文件中被显式命名，因此先保留 `S-07` 为逻辑样本位；真正进入支付/订阅验证前，必须补到具体账号或由一次性临时样本生成。
  - 独立“空白学生样本”当前未单独命名，因此暂由 `student1@mail.com` 兼任；如果后续该账号数据增长导致空态不再稳定，需拆出独立空白样本。
  - 异常态默认通过受控输入、临时账号和环境缺失制造，不新增长期“坏数据账号”。
- `T-020.3` 收口标准如下：
  - 后续每一条本地验证都能明确指定主样本，不再出现“临时找一个账号试一下”的执行方式。
  - 权限、套餐、空态、低数据态、一次性转化和异常态都已有至少一个样本承担。
  - 样本缺口已被显式标记，后续若需要补样本，必须回写到本矩阵，不允许口头约定。

### T-020.4 验证总表与证据模板（已完成）
- `T-020.4` 的目标是把本地验证从“散落截图 + 零散 SQL”收口成统一执行台账。自本节起，`T-020.6 ~ T-020.13` 每执行一条验证，都必须能落到固定字段、固定证据类型和固定命名规则上。
- 本地验证总表字段定义（第一版）：
| 字段 | 含义 | 必填要求 |
|---|---|---|
| `domain` | 页面域或共享能力域，例如 `dashboard-home`、`practice-submit`、`admin-feedback` | 必填 |
| `taskRef` | 对应任务号，例如 `T-005`、`T-007`、`T-020.10` | 必填 |
| `priority` | `P0` / `P1` / `enhancement` | 必填 |
| `sampleRef` | 使用的样本编号，例如 `S-01`、`S-05` | 必填 |
| `routeOrEntry` | 验证入口页面、按钮、Action 或 API | 必填 |
| `scenario` | 验证场景名称，例如“重复领奖”“未登录访问 admin” | 必填 |
| `writePath` | 是否涉及正式写动作；若涉及，记录主写入口 | 写场景必填 |
| `sqlCheckpoint` | 对应核账表或后台检查点 | 核账场景必填 |
| `evidenceSet` | 本次留证类型集合，例如 `录屏 + SQL + 截图 + console` | 必填 |
| `executor` | 执行人 | 必填 |
| `executedAt` | 执行时间，使用本地时区时间戳 | 必填 |
| `result` | `pass` / `fail` / `blocked` / `partial` | 必填 |
| `blocking` | 是否阻断进入 `T-021` | 必填 |
| `notes` | 口径说明、异常说明、替代证据或残余风险 | 选填，但异常时必填 |
- 证据类型枚举固定如下：
| 证据类型 | 适用场景 | 最低要求 |
|---|---|---|
| 页面截图 | 页面冒烟、空态、错误态、移动端、回流前后对比 | 至少能看到路由、核心区块或错误提示 |
| 页面录屏 | 写动作、跳转、回流、重复点击、失败回滚 | 至少覆盖动作前、动作中、动作后 |
| Action/API 响应 | 表单提交、正式 Action、接口错误、权限拒绝 | 至少保留关键字段或状态码摘要 |
| SQL / 后台快照 | 字段核账、状态流转、副作用核账 | 至少保留关键表、关键字段、执行前后值 |
| console / runtime 检查 | hydration、未捕获异常、红字报错、长 pending | 至少说明“是否出现错误”及触发场景 |
| 平台后台截图 | Stripe、Resend、Supabase Storage、管理后台事件流 | 仅在本地验证确需依赖外部能力时使用 |
- 本地执行总表（第一版）：
| 执行域 | 对应任务 | 主样本 | 关键路径 | 核心核账点 | 最低证据类型 |
|---|---|---|---|---|---|
| Dashboard 首页 | `T-005` / `T-020.6` | `S-02`、`S-05` | 首页加载、任务推进、排行榜卡回流、7D/30D 切换 | `users`、`daily_tasks`、`exam_records`、`leaderboard_entries` | 截图、SQL 快照、console 检查 |
| 练习主链路 | `T-007` / `T-020.6` | `S-02`、`S-05` | 抽题、提交、结果页、重复提交、防重、回流 | `exam_records`、`user_attempts`、`users.streak/xp`、`leaderboard_entries` | 录屏、Action/API 响应、SQL 快照 |
| 排行榜与成长 | `T-016 / T-017` / `T-020.7` | `S-02`、`S-07` | 榜单读取、周期切换、XP/level、成就摘要 | `leaderboard_entries`、`users`、`user_badges`、`daily_tasks` | 截图、SQL 快照、缓存回流截图 |
| 设置与通知 | `T-018` / `T-020.6` | `S-05`、`S-02`、`S-07` | 设置保存、通知已读、偏好保存、tab 深链 | `users`、`user_settings`、`notification_preferences`、`notifications`、`invite_codes` | 录屏、Action 返回、SQL 快照 |
| 公开与转化 | `T-019 / T-012` / `T-020.7` | `S-00`、`S-05`、`S-08` | 登录/注册、pricing、voucher、feedback、newsletter | `users`、`voucher_redemptions`、`user_feedbacks`、`user_feedback_events`、`subscribers` | 录屏、响应摘要、URL/query 证据、必要 SQL |
| 后台管理 | `T-009 ~ T-015` / `T-020.7` | `S-01`、`S-03`、`S-04` | admin 首页、导入、审核、举报、反馈、权限隔离 | `users`、`source_files`、`questions`、`user_feedbacks`、`reward_*` | 录屏、详情截图、SQL 快照、403 证据 |
| 共享写链路 | `T-020.8 ~ T-020.10` | `S-01`、`S-02`、`S-03`、`S-08`、`S-10` | 奖励、保存、通知、支付、反馈、导入、缓存回流 | `daily_tasks`、`users`、`notifications`、`leaderboard_entries`、`voucher_redemptions`、`source_files` | 录屏、响应摘要、SQL 前后对比 |
- 单条验证记录模板固定如下：
```md
#### [domain] [scenario]
- `taskRef`:
- `priority`:
- `sampleRef`:
- `routeOrEntry`:
- `writePath`:
- `sqlCheckpoint`:
- `executor`:
- `executedAt`:
- `result`:
- `blocking`:
- `evidenceSet`:
- `结论`:
- `备注 / 残余风险`:
```
- 写场景证据模板固定如下：
```md
#### [domain] 写链路验证
- 动作前状态：
- 执行动作：
- 页面回显结果：
- Action/API 摘要：
- SQL / 后台前后快照：
- 是否发生副作用：
- 重复执行结果：
- 最终结论：
```
- 核账场景证据模板固定如下：
```md
#### [domain] 字段核账
| 页面字段 | 页面值 | SQL / 后台值 | 口径说明 | 结论 |
|---|---|---|---|---|
|  |  |  |  |  |
```
- 命名与归档规则固定如下：
  - 同一轮本地验证统一使用 `T020-local-YYYYMMDD` 作为批次前缀。
  - 截图、录屏、SQL、日志在记录中至少保留“证据名称 + 触发场景 + 样本编号”，避免出现 `screenshot-1.png` 这类无法追溯的文件名。
  - 若某条验证没有截图或录屏，必须在记录中写明“无此类证据”的原因，例如 CLI-only 验证或 SQL-only 验证。
  - 若某条验证失败，但已有替代证据，也必须明确标注“主证据缺失，替代证据为何成立”。
- 最低留证要求固定如下：
  - `P0` 写场景：必须同时具备页面证据和 SQL/后台证据。
  - `P0` 只读场景：至少具备页面证据和 console/runtime 检查结果。
  - `P1` 场景：至少具备页面证据或响应摘要；若涉及正式写动作，仍必须补 SQL/后台证据。
  - `enhancement` 场景：页面截图 + console 检查即可，不进入 SQL 核账。
  - `blocked` 场景：必须保留阻断原因和当前环境状态，不能只写“未跑”。
- 执行约束固定如下：
  - 同一条验证若复跑，必须保留“原结果 + 修复后结果”，不能直接覆盖旧结论。
  - 如果复用共享写链路的 SQL 快照，页面域记录里也必须注明引用来源，不能只写“见别处”。
  - 本地验证总表服务于 `T-020`，预发执行表服务于 `T-021`；两者可以复用格式，但不得混写执行结论。
- `T-020.4` 收口标准如下：
  - 后续本地验证的页面域、共享链路、样本、核账点和证据类型都已有统一记录格式。
  - 执行中不再需要临时发明“这次怎么留证”，只需要按模板填充。
  - 到 `T-020.16` 输出本地验证报告时，可以直接按本节字段汇总成证据索引与阻断清单。

### T-020.5 复跑闭环规则（已完成）
- `T-020.5` 的目标是把“发现问题”变成一条固定闭环，而不是停留在问题登记。自本节起，本地验证中出现的 `fail / blocked / partial` 都必须按同一条闭环推进，直到转成“已修复并复跑”或“明确残余风险且暂不阻断”。
- 复跑闭环主流程固定如下：
  1. 发现问题：在验证总表中记录原始场景、样本、入口、触发步骤、当前结果和初始证据。
  2. 分类定级：判断是否属于 `阻断 / 非阻断 / 环境阻断 / 已知残余风险`，并标明影响域。
  3. 定位与修复：只修当前问题与直接关联代码，不借机扩大改动范围。
  4. 定向复跑：至少复跑“原问题场景 + 原样本 + 原入口”，确认问题真正消失。
  5. 关联回归：对同链路、同组件、同共享能力的受影响场景做最小回归，避免修一处坏一片。
  6. 更新证据：保留原失败证据、修复后证据、关联回归结果，不得只留最终通过结果。
  7. 更新结论：将问题归档为 `已修复`、`已缓解但有残余风险`、`环境阻断待后续处理` 三类之一。
- 问题分级规则固定如下：
| 问题类型 | 定义 | 默认处理要求 |
|---|---|---|
| 阻断问题 | 影响 `P0 必验` 主链路、正式写链路、权限边界、正式核账字段、运行时稳定性 | 必须修复并完成定向复跑 + 关联回归后才能继续 |
| 非阻断问题 | `P1` 范围内的低频问题，且不影响主链路正确性与权限安全 | 可先登记，但进入 `T-020.15` 前必须明确是否升级 |
| 环境阻断 | 由本地环境、第三方配置、共享数据态缺失导致，非当前代码修复可解 | 保留阻断证据，不伪装成“代码通过” |
| 残余风险 | 已知问题存在，但当前已确认不阻断本轮进入下一步 | 必须写清影响面、原因和后续处理条件 |
- 定向复跑规则固定如下：
  - 修复后必须先复跑原始失败场景，且样本、入口、关键步骤保持一致，不能换一个更容易通过的路径。
  - 若原问题是写链路问题，复跑时必须再次保留页面回显 + SQL/后台快照两套证据。
  - 若原问题是权限或越权问题，复跑时必须同时覆盖“合法路径再次通过”和“非法路径仍被拒绝”。
  - 若原问题是运行时错误，复跑时必须包含触发动作和 console/runtime 检查，而不是只看页面能打开。
- 关联回归范围规则固定如下：
| 问题来源 | 最低关联回归范围 |
|---|---|
| 页面局部渲染问题 | 同页面相邻模块 + 同视口（桌面/移动）复跑 |
| 共享组件问题 | 所有直接复用该组件的 `P0` 页面至少各抽一页复跑 |
| 共享写链路问题 | 所有消费该写链路结果的页面至少各补一条回流验证 |
| 权限判断问题 | 当前角色 + 相邻角色各复跑一条，例如 `ADMIN` 修复后补 `TEACHER` / `STUDENT` |
| 缓存回流问题 | 原页面 + 一个下游消费页同时确认刷新后结果 |
| 外部依赖问题 | 当前入口 + 同类依赖的另一入口补一条 smoke，确认不是单点偶然 |
- 证据更新规则固定如下：
  - 失败证据不能删除，必须与修复后证据并存。
  - 同一问题的记录顺序固定为：`失败证据 -> 修复说明 -> 定向复跑 -> 关联回归 -> 最终结论`。
  - 如果修复后仍未完全解决，必须保留“当前仍失败/部分通过”的证据，不能只写口头说明。
  - 若问题最终被认定为环境阻断，必须补“为何不是代码问题”的证明依据。
- 闭环记录模板固定如下：
```md
#### [domain] [scenario] 问题闭环
- `issueLevel`:
- `发现时间`:
- `原始结果`:
- `影响范围`:
- `失败证据`:
- `修复说明`:
- `定向复跑结果`:
- `关联回归范围`:
- `关联回归结果`:
- `最终状态`: `resolved` / `mitigated` / `env_blocked`
- `残余风险`:
```
- 禁止事项固定如下：
  - 不允许只在代码里修掉问题而不补复跑记录。
  - 不允许用“换账号、换入口、换环境后通过”替代原场景复跑。
  - 不允许把原失败记录覆盖成通过状态，导致问题历史消失。
  - 不允许把 `P0` 阻断问题直接降级为“已知问题”绕过本地收口。
- 与后续子任务的衔接关系固定如下：
  - `T-020.6 ~ T-020.11` 负责发现问题。
  - `T-020.12` 负责执行修复与定向复跑。
  - `T-020.13` 负责对已修复问题和高风险链路做收口复跑。
  - `T-020.15` 负责承接未关闭的问题、残余风险和环境阻断项。
  - `T-020.16` 负责按本节闭环状态汇总最终本地验证结论。
- `T-020.5` 收口标准如下：
  - 后续每个失败项都能落到固定闭环步骤，不再出现“修了但没复跑”或“复跑了但没留证”的情况。
  - 修复结果、复跑结果、关联回归结果和残余风险都有统一记录方式。
  - 到 `T-020.16` 汇总时，可以明确区分“已解决”“环境阻断”“保留风险”三类结论。

### T-020.6 高风险主链路本地验证（已完成）
- 当前执行策略先从“认证守卫 + 主入口可达性”开始，先确认 `P0` 主路径至少满足“未登录拦截正确、学生可进入学生主域、管理员可进入后台主域”，再继续推进写后回流和字段核账。
- 本轮第一批有效证据使用批次前缀 `T020-local-20260409`，证据目录固定为：
  [`evidence/T020-local-20260409`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260409)
- 本轮执行时发现一个非应用级环境噪音：
  - MCP Playwright Chrome profile `mcp-chrome-8a5edab` 已被占用，导致 MCP 浏览器会话无法复用。
  - 为避免把工具锁误判成应用失败，当前已切换为仓库内 Playwright headless 直接执行验证；此问题暂记为“工具侧噪音”，不阻断 `T-020.6`。
- 本轮执行时还发现一个真实代码阻断，并已在本任务内闭环：
  - 本地 `/login` 一度返回 `500`，根因是 `src/actions/user/auth.ts` 作为 `'use server'` 模块仍导出同步 helper，触发 Next 16 `Server Actions must be async functions` 编译错误。
  - 当前已将 redirect 解析 helper 拆到 `src/lib/auth/redirects.ts`，并在登录页与认证 action 两侧复用；修复后 `http://127.0.0.1:3101/login` 已恢复 `200`，后续认证与主链路验证均基于修复后的本地服务继续执行。
- 第一批认证与入口守卫结果如下：

#### [auth-guard] 匿名访问受限页跳转
- `taskRef`: `T-020.6`
- `priority`: `P0`
- `sampleRef`: `S-00`
- `routeOrEntry`: `/dashboard`、`/admin`
- `writePath`: 无
- `sqlCheckpoint`: 无
- `executor`: codex
- `executedAt`: `2026-04-09`
- `result`: `pass`
- `blocking`: `no`
- `evidenceSet`: `curl 响应头 + 页面截图`
- `结论`:
  - `GET /` 返回 `200`。
  - `GET /login` 返回 `200`。
  - 匿名访问 `/dashboard` 返回 `307`，跳转到 `/login?redirectTo=%2Fdashboard`。
  - 匿名访问 `/admin` 返回 `307`，跳转到 `/login?redirectTo=%2Fadmin`。
- `备注 / 残余风险`:
  - 页面留证见 [`guest-dashboard-redirect.png`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260409/guest-dashboard-redirect.png) 与 [`guest-admin-redirect.png`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260409/guest-admin-redirect.png)。
  - 当前只确认了服务端重定向守卫，尚未覆盖匿名态下各 CTA 的前端按钮行为。

#### [auth-student] 学生登录进入主域
- `taskRef`: `T-020.6`
- `priority`: `P0`
- `sampleRef`: `S-05`
- `routeOrEntry`: `/login?redirectTo=/dashboard`
- `writePath`: `loginAction`
- `sqlCheckpoint`: 暂无，本轮先验证会话与主域进入
- `executor`: codex
- `executedAt`: `2026-04-09`
- `result`: `pass`
- `blocking`: `no`
- `evidenceSet`: `Playwright headless 截图 + JSON 结果`
- `结论`:
  - 使用 `student_ui_test@learnmore.com` 登录后可进入 `/dashboard`。
  - 页面可见“今日任务”，说明学生主域首屏已成功进入。
- `备注 / 残余风险`:
  - 证据见 [`student-login-dashboard-home.png`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260409/student-login-dashboard-home.png)。
  - JSON 摘要见 [`t020-6-login-checks.json`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260409/t020-6-login-checks.json)。
  - 当前只验证“能进主域”，尚未验证首页任务、最近练习与排行榜卡的回流正确性。

#### [auth-admin] 管理员登录进入后台主域
- `taskRef`: `T-020.6`
- `priority`: `P0`
- `sampleRef`: `S-03`
- `routeOrEntry`: `/login?redirectTo=/admin`
- `writePath`: `loginAction`
- `sqlCheckpoint`: 暂无，本轮先验证会话与后台进入
- `executor`: codex
- `executedAt`: `2026-04-09`
- `result`: `pass`
- `blocking`: `no`
- `evidenceSet`: `Playwright headless 截图 + JSON 结果`
- `结论`:
  - 使用 `admin_ui_test@learnmore.com` 登录后可进入 `/admin`。
  - 页面可见“管理概览”，说明后台主域 SSR + 会话 + 权限分流基线正常。
- `备注 / 残余风险`:
  - 证据见 [`admin-login-admin-home.png`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260409/admin-login-admin-home.png)。
  - 与学生登录结果共用 [`t020-6-login-checks.json`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260409/t020-6-login-checks.json)。
  - 当前只确认后台主入口可达，尚未覆盖 `/admin/content/import`、`/admin/content/review`、`/admin/feedback` 等关键后台工作台。

#### [settings-notification] 学生通知偏好保存与回滚
- `taskRef`: `T-020.6`
- `priority`: `P0`
- `sampleRef`: `S-05`
- `routeOrEntry`: `/dashboard/settings?tab=notifications`
- `writePath`: `updateNotificationPreferences`
- `sqlCheckpoint`: `notification_preferences.emailMarketing`、`user_settings.emailMarketing`
- `executor`: codex
- `executedAt`: `2026-04-09`
- `result`: `pass`
- `blocking`: `no`
- `evidenceSet`: `Playwright headless 截图 + DB 快照 + 结构化摘要`
- `结论`:
  - 使用 `student_ui_test@learnmore.com` 进入设置页通知分区，切换“活动信息”邮件开关（`emailMarketing`）后保存成功。
  - 保存后页面开关从 `true -> false`，数据库同步变更为 `notification_preferences.emailMarketing=false`、`user_settings.emailMarketing=false`。
  - 随后已执行恢复动作，将同一开关从 `false -> true` 保存回初始状态；最终数据库已恢复为 `true`。
- `备注 / 残余风险`:
  - 首次读取通知设置前，`student_ui_test@learnmore.com` 没有 `notification_preferences` 记录；进入设置页后，系统会从 `user_settings` 自动补建通知偏好记录并带入旧值。这说明当前通知偏好“读取”自带迁移写入副作用，属于已观察行为，后续在 `T-020.8 / T-020.9` 需要继续确认是否符合正式合同。
  - 关闭态页面留证见 [`student-settings-email-marketing-off.png`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260409/student-settings-email-marketing-off.png)。
  - 恢复态页面留证见 [`student-settings-email-marketing-restored.png`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260409/student-settings-email-marketing-restored.png)。
  - 最终数据库快照见 [`student-settings-email-marketing-final-db.json`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260409/student-settings-email-marketing-final-db.json)。
  - 本次完整过程摘要见 [`student-settings-email-marketing-summary.json`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260409/student-settings-email-marketing-summary.json)。

#### [dashboard-login-reward] 学生每日登录奖励领取
- `taskRef`: `T-020.6`
- `priority`: `P0`
- `sampleRef`: `S-05`
- `routeOrEntry`: `/dashboard`
- `writePath`: `claimTaskReward`
- `sqlCheckpoint`: `daily_tasks(LOGIN).isClaimed`、`users.xp`
- `executor`: codex
- `executedAt`: `2026-04-09`
- `result`: `pass`
- `blocking`: `no`
- `evidenceSet`: `Playwright headless 截图 + DB 快照 + JSON 摘要`
- `结论`:
  - 使用 `student_ui_test@learnmore.com` 在 Dashboard 首页领取“每日登录”奖励后，页面出现 `+50 XP` 与 `已领取` 状态。
  - 数据库同步变更为 `daily_tasks(LOGIN).isClaimed=true`，并将 `users.xp` 从 `0 -> 50`。
- `备注 / 残余风险`:
  - 操作前后页面留证见 [`student-dashboard-login-reward-before.png`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260409/student-dashboard-login-reward-before.png) 与 [`student-dashboard-login-reward-after.png`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260409/student-dashboard-login-reward-after.png)。
  - 数据库快照见 [`student-dashboard-login-reward-db-after.json`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260409/student-dashboard-login-reward-db-after.json)。
  - 当前场景不做业务回滚；奖励领取本身属于单日正向事实写入，后续若需验证重复点击/并发/幂等，将在 `T-020.8 / T-020.10` 单独展开。

#### [practice-smart-drill] 学生 Smart Drill 真实提交流程
- `taskRef`: `T-020.6`
- `priority`: `P0`
- `sampleRef`: `S-05`
- `routeOrEntry`: `/dashboard/practice/smart-drill?subjectId=72844ae3-6f0d-4cfd-8add-70de535aa316&autostart=1`
- `writePath`: `submitPracticeSession`
- `sqlCheckpoint`: `exam_records`、`user_attempts`、`daily_tasks(QUIZ_SCORE)`、`users.streak`、`users.totalStudyTime`
- `executor`: codex
- `executedAt`: `2026-04-10`
- `result`: `pass`
- `blocking`: `no`
- `evidenceSet`: `Playwright headless 截图 + 题组快照 + DB 快照 + UI 摘要`
- `结论`:
  - 使用 `student_ui_test@learnmore.com` 进入真实 Smart Drill 入口，自动拉取当前推荐题组并完成 6 题提交，结果页显示 `Smart Drill 完成` 且 `结果保存=已保存`。
  - 提交后数据库新增 1 条 `exam_record` 与 6 条 `user_attempts`，最新记录 `score=100`、`correctCount=6`、`mode=SMART_DRILL`。
  - 同步观察到成长侧副作用已落地：`daily_tasks(QUIZ_SCORE).currentCount=1`、`users.streak=1`、`users.totalStudyTime=183`。
- `备注 / 残余风险`:
  - 当前推荐题组快照见 [`student-smart-drill-question-pack.json`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260409/student-smart-drill-question-pack.json)。
  - 页面提交前后截图见 [`student-smart-drill-before-submit.png`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260409/student-smart-drill-before-submit.png) 与 [`student-smart-drill-after-submit.png`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260409/student-smart-drill-after-submit.png)。
  - UI 摘要见 [`student-smart-drill-ui-summary.json`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260409/student-smart-drill-ui-summary.json)。
  - 数据库快照见 [`student-smart-drill-final-db.json`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260409/student-smart-drill-final-db.json)。
  - 额外观察：若在非请求上下文里直接白盒调用 `submitPracticeSession`，`revalidatePath` / `revalidateTag` 相关副作用会触发 invariant。这不属于正式用户入口结果，但说明异常路径下“持久化已提交而返回失败”的合同仍需在 `T-020.8 / T-020.10` 继续压测。

#### [admin-feedback-status] 后台反馈状态切换与回滚
- `taskRef`: `T-020.6`
- `priority`: `P0`
- `sampleRef`: `S-03`
- `routeOrEntry`: `/admin/feedback/5a5f9b42-1f99-4fc5-83c3-d702f2a7f498`
- `writePath`: `addAdminFeedbackNote`
- `sqlCheckpoint`: `user_feedbacks.status`、`feedback_events`
- `executor`: codex
- `executedAt`: `2026-04-09`
- `result`: `pass`
- `blocking`: `no`
- `evidenceSet`: `Playwright headless 截图 + DB 快照`
- `结论`:
  - 使用 `admin_ui_test@learnmore.com` 将目标反馈从 `CLOSED -> RESOLVED`，页面出现成功提示且详情页状态同步切换到 `已解决`。
  - 随后按同一路径回滚 `RESOLVED -> CLOSED`，页面与数据库均恢复到初始 `已关闭` 状态。
  - 两次状态切换均新增对应 `feedback_events` 审计记录，说明后台低风险正式写动作与可逆回滚链路可用。
- `备注 / 残余风险`:
  - 切到 `RESOLVED` 的前后截图见 [`admin-feedback-resolved-before.png`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260409/admin-feedback-resolved-before.png) 与 [`admin-feedback-resolved-after.png`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260409/admin-feedback-resolved-after.png)。
  - `RESOLVED` 状态数据库快照见 [`admin-feedback-resolved-db.json`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260409/admin-feedback-resolved-db.json)。
  - 回滚到 `CLOSED` 的前后截图见 [`admin-feedback-closed-before.png`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260409/admin-feedback-closed-before.png) 与 [`admin-feedback-closed-after.png`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260409/admin-feedback-closed-after.png)。
  - 回滚后数据库快照见 [`admin-feedback-closed-db.json`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260409/admin-feedback-closed-db.json)。

- 当前阶段性结论：
  - `T-020.6` 已完成认证守卫、学生主域进入、管理员后台进入、学生设置保存与回滚、Dashboard 奖励领取、Smart Drill 真实提交、后台反馈状态可逆写入 7 组高风险主链路验证。
  - 当前已覆盖三类关键写链路：学生侧轻量设置写入、学生侧成长写入、后台侧正式状态写入，并且都保留了页面留证与数据库核账。
  - 本轮中途发现的 `/login` 编译阻断已在任务内修复并复测通过，因此不再作为 `T-020.6` 阻断项保留。
  - `T-020.6` 到此收口完成；更深的契约异常、幂等/并发、越权、缓存失效与异常路径验证转入 `T-020.8 ~ T-020.10` 继续展开。

### T-020.7 全站页面冒烟（已完成）
- 本轮执行口径固定为“公开页 + 学生域 + 后台域 + 移动端 + 404 / 回退 / 刷新”，证据批次前缀固定为 `T020-local-20260410`，证据目录固定为：
  [`evidence/T020-local-20260410`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260410)
- 本轮结构化报告见：
  [`t020-7-smoke-report.json`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260410/t020-7-smoke-report.json)
- 公共页面冒烟结果：
  - `/`、`/pricing`、`/blog`、`/contact`、`/help`、`/subjects`、`/login` 均可稳定加载并渲染核心首屏内容。
  - `does-not-exist-for-smoke` 返回标准 `404` 结果页，确认兜底路由存在且未炸页。
- 学生页面冒烟结果：
  - `/dashboard`、`/dashboard/practice`、`/dashboard/leaderboard`、`/dashboard/achievements`、`/dashboard/settings`、`/dashboard/settings?tab=notifications`、`/dashboard/community`、`/dashboard/community/new`、`/dashboard/practice/smart-drill?subjectId=72844ae3-6f0d-4cfd-8add-70de535aa316&preview=mock` 均可加载。
  - `dashboard` 页面完成一次刷新复核，URL 路径保持不变；`leaderboard -> achievements -> back` 的回退链路也正常回到榜单页。
  - 页面首屏均能看到真实标题与真实文案，没有出现空白页、崩溃页或被 mock 回退覆盖的情况。
- 后台页面冒烟结果：
  - `/admin`、`/admin/feedback`、`/admin/content/import`、`/admin/content/review`、`/admin/users`、`/admin/rewards` 均可加载并显示对应管理工作台。
  - 本轮未发现需要阻断的页面级 403 / 404 漏洞；权限类问题仍按既有登录态与路由守卫承接，不在本轮 smoke 中新增阻断项。
- 移动端冒烟结果：
  - 390px 宽度下的 `/pricing` 与 `/dashboard` 均能正常渲染，未出现首屏溢出或路由失配。
- 当前阶段性结论：
  - `T-020.7` 已完成全站最小冒烟面，公开页、学生域、后台域和移动端都能稳定进入。
  - 本轮没有引入新的页面级阻断项；更深层的 Action/API 契约、幂等、异常态、缓存回流与核账继续在 `T-020.8 ~ T-020.12` 展开。

### T-020.8 关键 Action/API 契约验证（已完成）
- 本轮把验证重心从页面可进入，切到共享写链路的输入、输出、权限、幂等和异常态合同。
- 重点核验对象包括：
  - `claimTaskReward` / `completeOnboardingTask`
  - `checkAndRefreshStreak`
  - `awardBadgeIfEligible`
  - `applyPracticeSubmissionEffects`
  - 作为对照回归的 `updateNotificationPreferences`、`createVoucherCodeAction`、`toggleVoucherStatusAction`、`submitQuiz`
- 本轮收敛出的合同修正如下：
  - `claimTaskReward` 与 `completeOnboardingTask` 在未登录时改为稳定返回 `{ success: false, error: 'Unauthorized' }`，不再直接抛异常，避免客户端 Promise 被打断。
  - `applyPracticeSubmissionEffects` 改为 best-effort：核心提交已落库后，副作用失败或缓存失效失败不再把主流程标记为失败。
  - `checkAndRefreshStreak`、`awardBadgeIfEligible`、`claimTaskReward` 的缓存失效已改为非请求上下文容错，保证业务结果优先，缓存刷新仅作为附加动作。
- 已验证的合同面：
  - 输入校验与输出结构：通知偏好、优惠券、练习提交等动作的返回形态稳定，错误码与错误文案明确。
  - 权限控制：未登录 / 非管理员路径返回结构化错误，不再依赖抛异常作为控制流。
  - 幂等与重复：优惠券重复创建、通知偏好重复保存、领奖重复入口等已有回归样本保持稳定。
  - 异常态：副作用 rejection、`revalidatePath` / `revalidateTag` 的非请求上下文失败不再污染主写入结果。
- 本轮测试证据：
  - [`src/actions/__tests__/achievement.test.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/__tests__/achievement.test.ts)
  - [`src/actions/__tests__/streak.test.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/__tests__/streak.test.ts)
  - [`src/actions/practice/__tests__/submission-effects.test.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/practice/__tests__/submission-effects.test.ts)
  - 现有回归套件 [`notification-preferences.test.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/__tests__/notification-preferences.test.ts)、[`voucher.test.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/admin/__tests__/voucher.test.ts)、[`quiz.test.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/__tests__/quiz.test.ts) 也保持通过。
- 当前阶段性结论：
  - `T-020.8` 已完成收口，关键 Action/API 的输入、输出、权限和异常态合同已被统一。
  - 下一步按顺序进入 `T-020.9`，专门做字段级 SQL / 后台核账，把已确认的写入和副作用与权威数据源逐项对齐。

### T-020.9 字段级 SQL / 后台核账（已完成）
- 本轮目标是把前面已经验证过的写链路，落到“页面值、主表值、关联表值、事件流水、后台状态”五层一致性核对上，避免只看成功 toast 或页面状态。
- 本轮统一生成的核账报告见：
  [`t020-9-ledger-report.json`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260410/t020-9-ledger-report.json)
- 本轮按四条链路完成字段级核账：
  - 设置 / 通知偏好：
    - `notification_preferences.emailMarketing` 与 `user_settings.emailMarketing` 已对齐；
    - 既有页面留证显示首次进入设置页会触发偏好记录补建，随后保存与回滚均能回到数据库一致状态。
  - Dashboard 奖励领取：
    - `daily_tasks.LOGIN` 已被领取，`isClaimed = true`；
    - `users.xp = 50` 与奖励金额一致；
    - 页面与数据库快照均指向同一批学生样本。
  - Smart Drill 真实提交：
    - `exam_records` 最新提交的 `SMART_DRILL` 记录分数、题量、正确数均为 100 / 6 / 6；
    - `user_attempts` 的明细数量与题量一致；
    - `daily_tasks.QUIZ_SCORE.currentCount = 1`，`users.streak = 1`，`users.totalStudyTime = 183`，说明成长副作用已回流。
  - 反馈状态流转：
    - `user_feedbacks.status` 已稳定落在 `CLOSED`；
    - `user_feedback_events` 保留了 `RESOLVED` 与 `CLOSED` 的事件轨迹，状态流转可追溯；
    - 反馈主表与事件表可直接构成后台审计链路。
- 本轮结论：
  - 页面值、主表值、关联表值与事件流水在本轮核账中已经对齐；
  - 共享写链路的奖励、练习、反馈、设置等结果均有可追踪证据；
  - 下一步进入 `T-020.10`，专门做重复点击、越权、会话失效、网络失败、超时与局部降级等故障边界验证。

## T-021 预发复测与发布前收口拆解
### Phase A：边界与约束
| id | description | owner | status |
|---|---|---|---|
| T-021.1 | 核对预发与本地的环境差异：`env`、数据库 schema、迁移版本、对象存储、第三方回调、缓存、队列与定时任务状态，先把阻断项列清楚 | codex | done |
| T-021.2 | 重新确认本轮复测范围：明确本次要覆盖的页面域、写操作、Action/API、后台任务与不纳入范围的装饰模块 | codex | done |
| T-021.3 | 固化发布前门禁与回滚边界：定义失败即阻断的条件、数据回滚粒度、`feature flag` / `kill switch` 关闭策略与权限回收策略 | codex | done |
| T-021.4 | 固化预发证据口径：统一截图、录像、日志、SQL 核账、后台快照、接口响应和部署号的命名与存放方式 | codex | done |
| T-021.5 | 设定发布审批条件：确认未解决缺陷、残余风险、监控告警阈值与最终批准人，未满足则不进入发布窗口 | codex | done |

### Phase B：开发、修复、调试
| id | description | owner | status |
|---|---|---|---|
| T-021.6 | 复测用户学习主域：按 `T-005 / T-006 / T-007 / T-008` 覆盖 Dashboard、课程、练习、社区的关键页面、主 CTA、提交链路、回流跳转与移动端表现，并修正预发专有异常 | codex | done |
| T-021.7 | 复测成长与账户域：按 `T-016 / T-017 / T-018` 覆盖排行榜、成就、XP / streak、设置、通知深链与右上角通知入口，确认真实数据、权限边界、刷新回流与空态 / 错误态在预发可用 | codex | done |
| T-021.8 | 复测公开与转化域：按 `T-012 / T-019 / T-022` 覆盖 landing、pricing、blog、help、contact、signup、login、reset-password、referral、voucher、feedback 等页面与表单，确认会话分流、表单回执、来源参数与转化入口稳定 | codex | doing |
| T-021.9 | 复测后台管理域：按 `T-009 ~ T-015 / T-023 / T-024` 覆盖 admin 首页、用户、反馈、内容导入、审核、报错、统计、增长工具与奖励/补发相关后台操作，确认权限、列表详情一致性、处理动作、审计留痕与管理端异常态 | codex | todo |
| T-021.10 | 复测共享写链路与跨域副作用：统一重跑奖励领取、保存资料、通知偏好、练习提交、评论发帖、排行榜刷新、补发/回滚、缓存失效、`revalidatePath` / `revalidateTag`、幂等、越权、异常、超时与断网场景，并对字段核账结果做预发二次比对 | codex | todo |

### Phase C：清理和收口验证
| id | description | owner | status |
|---|---|---|---|
| T-021.11 | 清理临时调试代码、日志开关、测试账户、一次性脚本、临时 mock 与硬编码兜底，确保预发版本只保留正式实现 | codex | todo |
| T-021.12 | 汇总最终预发验证报告：页面冒烟、写操作回放、SQL/后台核账、截图、日志与风险清单一次性收口 | codex | todo |
| T-021.13 | 执行或复核回滚演练：确认数据回滚、功能下线、`feature flag` 关闭、入口禁用与通知/公告动作都可执行 | codex | todo |
| T-021.14 | 输出发布前收口结论并等待用户最终批准；若仍存在阻断项，则回退到修复阶段，不进入正式发布 | user/codex | todo |

### T-021.10 共享写链路核验矩阵（第一版）
| 写链路 | 主要入口 | 核心写入 / 副作用 | 预发必须核验 | 证据类型 |
|---|---|---|---|---|
| 日常任务 / 奖励领取链路 | `claimTaskReward`、`completeOnboardingTask`、`daily_tasks` 生成与推进 | `daily_tasks` 进度推进、领奖幂等、`users.xp` 增量、`achievement-overview` / `user-badges` 回流 | 首次成功、重复点击、并发领取、任务未完成、任务已领取、刷新后状态一致 | 页面录屏、Action 返回、`daily_tasks` / `users.xp` SQL 前后快照 |
| 练习提交与成长副作用链路 | 练习提交、`checkAndRefreshStreak`、`awardBadgeIfEligible`、`updateLeaderboardScore` | `exam_records`、`user_attempts`、`users.streak`、`users.total_study_time`、`leaderboard_entries`、`user_badges`、`notifications`、任务推进与缓存 tag 回收 | 提交成功、重复提交防重、streak 同日不重复、徽章只发一次、排行榜分数回流、Dashboard / Achievements / Leaderboard 刷新一致 | 页面录屏、接口响应、相关表 SQL 核账、tag/页面刷新截图 |
| 社区互动副作用链路 | `createPost`、`createComment`、点赞 / 收藏 / 删除 / 置顶等社区动作 | `posts`、`comments`、社区 feed 缓存、提及/回复通知、成就徽章回流 | 发帖评论成功、重复提交、未授权、提及通知、回帖通知、成就摘要与徽章墙刷新、详情页与列表一致 | 页面录屏、通知记录、`posts` / `comments` SQL、社区页截图 |
| 用户资料 / 偏好 / 通知链路 | `updateProfile`、`updatePreferences`、`updateNotificationPreferences`、`generateInviteCode` | `users`、`user_settings`、`notification_preferences`、邀请码生成与旧桥接字段同步、设置页回流 | 保存成功、重复保存幂等、通知偏好单独保存、拉取失败时禁止误覆盖、邀请码复用 / 冲突重试、设置页 query tab 回流 | 表单录屏、Action 返回、`users` / `user_settings` / `notification_preferences` SQL |
| 支付 / 订阅 / 回执链路 | `createCheckoutSession`、Stripe webhook、`cancelSubscriptionAction` | Stripe 会话、订阅状态更新、`users.subscription_*`、回执通知、`/dashboard` 与 `/dashboard/settings` 刷新 | 下单成功、取消订阅幂等、webhook 缺签名 / 重放保护、支付后订阅状态回流、价格 ID 与环境变量一致 | Stripe 后台事件、接口日志、用户订阅字段 SQL、页面截图 |
| Referral / Voucher / 转化链路 | voucher 创建 / 启停 / 核销、推荐归因与缓存回流 | `voucher*`、推荐归因记录、`/pricing`、`/admin/referrals`、用户详情页缓存回流 | 券码创建、启停、核销、防重复核销、价格页可见性、后台与前台状态一致 | 前后台录屏、Action 返回、相关表 SQL、价格页截图 |
| 反馈与支持链路 | `submitFeedback`、后台反馈处理动作 | `user_feedback*`、事件流水、状态流转、后台列表/详情回流 | 前台提交、重复提交、未登录 / 已登录来源、后台受理 / 关闭 / 回复、详情与列表状态一致 | 前后台录屏、接口返回、反馈表 SQL、后台截图 |
| 奖励中心补发 / 校正 / 回滚链路 | `src/actions/admin/reward-center.ts` 下奖励规则、成就规则、补发与回滚动作 | `reward_rules`、`achievement_rules`、`reward_adjustment_records`、`reward_admin_audit_logs`、`leaderboard_entries`、成就 tag 回流 | 管理员权限、补发幂等、回滚前确认、排行榜刷新、审计日志完整、目标用户页面回流 | 管理后台录屏、审计日志截图、相关表 SQL、目标用户页面截图 |
| 内容导入队列式链路 | 内容导入、文件上传、队列消费、审核回流 | `source_files`、导入诊断、内容导入任务认领、`storage.objects`、内容页 revalidate | 文件上传成功、队列认领不重复、失败重试、bucket fallback、生效后管理页可见 | 导入录屏、接口日志、`source_files` / `storage.objects` SQL、管理页截图 |

### T-021.1 环境差异核对（已完成）
- 当前代码基线确认的环境面包括：Supabase PostgreSQL、Supabase Storage、Stripe、Resend、两条 cron 路由、Stripe webhook、以及依赖 `revalidatePath` / `revalidateTag` 的页面回流；预发核对不能只看页面是否能打开，必须逐项确认这些外部依赖和缓存能力是否齐备。
- `env` 基线已出现明显模板缺口：
  - `.env.example` 只覆盖 `DATABASE_URL`、`DIRECT_URL`、Supabase、Resend、`CRON_SECRET` 与 OCR 变量；
  - `.env.local` 额外依赖 `STRIPE_SECRET_KEY`、`STRIPE_WEBHOOK_SECRET` 与多组 `NEXT_PUBLIC_STRIPE_PRICE_*`；
  - 这意味着预发若只照 `.env.example` 配置，会直接缺失支付、Webhook 和价格映射能力。
- 数据库基线当前是 Prisma 连接 Supabase Postgres，数据源依赖 `DATABASE_URL` 与 `DIRECT_URL`；脚本层使用 `pnpm prisma:dbpush` / `pnpm prisma:generate`，但实际 schema 变更历史主要记录在 `supabase/migrations/`，预发需要额外确认“目标库 schema 是否已同步到当前代码基线”，不能只看本地 Prisma client 是否可生成。
- 存储基线当前至少依赖四个 bucket：
  - `avatars`
  - `videos`
  - `community-posts`
  - `source-files`
  同时内容导入链路带有 bucket fallback 语义；预发必须确认 bucket 存在、策略生效、公开/签名 URL 行为正确，不能只验证上传接口返回成功。
- 第三方回调与通知基线当前至少包括：
  - Stripe webhook：`/api/webhook/stripe`
  - 欢迎通知：注册后触发
  - 收据通知：支付后触发
  - 试用到期通知：cron 触发
  预发需确认 webhook secret、邮件服务、回调 URL 和实际事件投递链路，不然页面层会表现正常但异步副作用失效。
- 定时任务基线当前已发现两条 cron 路由：
  - `/api/cron/trial-expiry`
  - `/api/cron/cleanup-leaderboard`
  两者都受 `CRON_SECRET` 保护；仓库内未发现独立的调度配置文件，因此预发环境还需要到部署平台确认是否已真正挂载调度，而不是仅有路由实现。
- 部署平台基线已确认：
  - 仓库已绑定 Vercel 项目 `learn_more_v1.0`，框架为 `nextjs`，运行时为 `Node 24.x`；
  - 当前最新生产部署处于 `READY`；
  - 历史部署中同时存在近期 `ERROR` 的生产部署记录，说明发布链并非稳定无风险，`T-021` 需要把“构建通过率 / 最近失败原因”也纳入阻断项，而不只是看页面功能。
- 队列 / 异步任务基线当前没有发现独立的 Redis / MQ 基础设施，内容导入更像是 DB 驱动的“队列式处理”；这类链路在预发要重点核对并发认领、失败重试和二次消费行为，避免本地单人串行可用、预发并发下重复消费。
- 缓存基线当前明显依赖多个共享失效点：
  - `leaderboard-entries`
  - `achievement-overview:${userId}`
  - `user-badges:${userId}`
  - `community-feed`
  - `community-categories`
  预发必须实测 `revalidatePath` / `revalidateTag` 是否在真实请求上下文生效，否则会出现“写入成功但页面不刷新”的假故障。
- 本轮已经确认的阻断项清单如下：
  - 预发变量清单与模板差异
  - 预发 DB schema / migration 版本差异
  - bucket / policy / signed URL 差异
  - Stripe webhook / cron 调度是否真正挂载
  - 缓存失效在预发是否稳定生效

#### T-021.1 收口结论（已完成）
- 预发 / 发布链已经具备基本基础设施：
  - Vercel 项目已绑定，项目名为 `learn_more_v1.0`；
  - 最近生产部署为 `READY`；
  - 数据库中已确认关键表存在：`users`、`user_settings`、`notification_preferences`、`daily_tasks`、`leaderboard_entries`、`reward_rules`、`achievement_rules`、`reward_adjustment_records`、`reward_admin_audit_logs`、`notifications`、`voucher_redemptions`、`user_feedbacks`、`user_feedback_events`、`source_files`；
  - Storage bucket 已确认存在：`avatars`、`community-posts`、`source-files`、`videos`，其中 `videos` 为私有 bucket，其余当前为公开 bucket。
- 当前已确认的环境差异与发布阻断结论如下：
  1. `env` 模板不完整。`.env.example` 未覆盖 `STRIPE_SECRET_KEY`、`STRIPE_WEBHOOK_SECRET` 和多组 `NEXT_PUBLIC_STRIPE_PRICE_*`，因此不能作为预发完整配置基线。
  2. 数据库连接存在双连接语义。`DATABASE_URL` 带 `pgbouncer` 查询参数，适合应用运行；管理核验和 SQL 对账应统一使用 `DIRECT_URL`，否则连最基础的 `psql` 管理查询都会失败。
  3. 发布链历史上存在真实失败。最近两次失败生产部署都不是偶发波动，而是同一类构建问题：安装阶段触发了过时 `@prisma/cli` 的 preinstall 报错，直接导致 `pnpm install` 失败；当前仓库已经不再引用 `@prisma/cli`，且后续生产部署恢复为 `READY`，这一项视为“已修复、需保留发布回归检查”。
  4. schema 基线从代码侧看是“Prisma schema + Supabase migrations”双轨，预发不能只看 Prisma Client 可生成，必须以目标库实际表结构为准。当前关键业务表已实库确认存在，因此 `T-021` 后续不需要再把“表不存在”作为高优先风险。
  5. Storage 基线已实库确认存在，但 bucket 存在不等于策略和签名 URL 一定正确；后续预发执行时仍需按 `avatars / community-posts / source-files / videos` 四条链路逐个验证上传、公开 URL、签名 URL 和权限。
  6. 异步能力已确认依赖 Stripe webhook 与两条 cron 路由，但仓库内没有独立调度配置文件，因此“路由实现存在”不等于“预发已挂调度”。这一项保留为平台侧核对项，而不是代码阻断项。
  7. 缓存失效是显式依赖项，不是锦上添花。`leaderboard-entries`、`achievement-overview:${userId}`、`user-badges:${userId}`、`community-feed`、`community-categories` 都属于正式业务刷新链，预发必须实测，不能靠代码审阅视为通过。
- 因此，`T-021.1` 现阶段可以收口为“环境差异审计完成，阻断项已明确”：
  - 已排除的阻断：关键表缺失、关键 bucket 缺失、Vercel 项目未绑定、近期构建链持续损坏。
  - 仍需在后续预发执行中落地验证的阻断：Vercel 环境变量是否齐全、Stripe webhook 是否真正挂载、cron 是否真正挂载、Storage 策略和 signed URL 是否符合预期、缓存失效是否在预发稳定生效。

### T-021 业务测试基线（进入 T-021.2 前完成）
- 已执行一轮面向正式业务链路的 Vitest 回归，命中 Auth、Gamification、Notification Preferences、Profile、Parent Invite、Stripe Cancel、Voucher Admin、Permission Override、Content Review、Practice Session / Error Book、Notification Link、Referral Cache、Sitewide Cache 等核心业务测试。
- 本轮测试结果：
  - `51` 个 test files 全通过
  - `287` 个 tests 全通过
  - 总耗时约 `13.64s`
- 本轮测试的价值不是替代预发复测，而是为 `T-021.2` 提供一条“本地业务基线已通过”的起跑线；因此后续预发复测重点应放在环境差异、真实外部依赖、缓存回流、权限边界和写后核账，而不是再把同一批纯单测结果当作预发证据。
- 本轮执行中出现的日志型输出主要来自预期错误分支、警告分支与测试模拟环境：
  - `VideoPlayer` 的 `act(...)` 警告
  - `AI Structurer` / `storage` / `auth` 的预期错误日志
  - `RESEND_API_KEY is not set` 的测试环境警告
  这些没有造成用例失败，但在预发执行中仍需和真实运行时错误区分看待，不能直接视为可忽略。

### T-021.2 复测范围确认（已完成）
- 进入预发前，本轮复测范围先按“页面域 + 共享写链路 + 外部依赖”三层固定，不再只按页面列表罗列。
- 当前已确认必须纳入预发复测的 `P0` 范围包括：
  - 学生主域：`T-021.6` 对应的 Dashboard、课程、练习、社区
  - 成长与账户域：`T-021.7` 对应的排行榜、成就、设置、通知入口
  - 公开与转化域：`T-021.8` 对应的登录、注册、重置密码、pricing、referral、voucher、feedback
  - 后台管理域：`T-021.9` 对应的 admin 首页、用户、反馈、内容导入、审核、报错、统计、奖励/补发
  - 共享写链路：`T-021.10` 核验矩阵列出的奖励领取、练习副作用、社区互动、资料/通知、支付订阅、voucher、反馈、奖励中心、内容导入
- 当前明确不纳入 `P0` 正式核账、仅保留冒烟或展示检查的内容包括：
  - 静态营销内容页的纯文案区块
  - 非核账展示模块
  - 只影响视觉增强但不影响数据正确性、权限边界和正式交互的装饰层

#### 页面域执行表
| 页面域 | 对应任务 | 预发测试账号 / 权限样本 | 核心 SQL / 后台核账点 | 证据类型 |
|---|---|---|---|---|
| 学生学习主域 | `T-021.6` / `T-005 / T-006 / T-007 / T-008` | `student_ui_test@learnmore.com`、`student1@mail.com`、未登录态 | `users`、`user_settings`、`daily_tasks`、`exam_records`、`user_attempts`、`posts`、`comments`、`notifications` | 页面录屏、关键页面截图、Action/API 响应、SQL 前后快照、console error 检查 |
| 成长与账户域 | `T-021.7` / `T-016 / T-017 / T-018` | `student_ui_test@learnmore.com`、`student1@mail.com`、付费学生样本、未登录态 | `users.xp/streak/subscription_*`、`leaderboard_entries`、`daily_tasks`、`user_badges`、`notification_preferences`、`notifications`、`invite_codes` | 页面录屏、排行榜/成就/设置截图、Action 返回、SQL 快照、缓存回流截图 |
| 公开与转化域 | `T-021.8` / `T-012 / T-019 / T-022` | 未登录态、`student_ui_test@learnmore.com`、`*@learnmore.test` 临时账号 | `users`、`referrals`、`voucher_redemptions`、`subscribers`、`user_feedbacks`、`user_feedback_events`、`notifications`、`users.subscription_*` | 表单录屏、跳转录屏、邮件/支付后台截图、SQL 快照、URL/query 证据 |
| 后台管理域 | `T-021.9` / `T-009 ~ T-015 / T-023 / T-024` | `admin_ui_test@learnmore.com`、`admin@learnmore.com`、`teacher_ui_test@learnmore.com`、非管理员样本 | `users`、`user_feedbacks`、`user_feedback_events`、`source_files`、`content_review_logs`、`questions`、`reward_rules`、`achievement_rules`、`reward_adjustment_records`、`reward_admin_audit_logs`、`leaderboard_entries` | 管理端录屏、列表/详情截图、审计日志截图、SQL 快照、403/受限态截图 |
| 共享写链路域 | `T-021.10` | `student_ui_test@learnmore.com`、`student1@mail.com`、`admin_ui_test@learnmore.com`、`*@learnmore.test`、未登录态 | `daily_tasks`、`users`、`exam_records`、`user_attempts`、`posts`、`comments`、`notification_preferences`、`notifications`、`leaderboard_entries`、`voucher_redemptions`、`user_feedbacks`、`reward_adjustment_records`、`source_files` | 单次操作录屏、接口/Action 返回、SQL 前后对比、缓存回流截图、后台事件/日志截图 |

#### 外部依赖与平台核对表
| 外部依赖 / 平台项 | 预发核对动作 | 失败时归类 | 证据类型 |
|---|---|---|---|
| Vercel 环境变量 | 核对 `Supabase / Stripe / Resend / CRON / price IDs` 是否齐全 | 阻断 | 平台配置截图、变量清单对照 |
| Stripe webhook | 确认 `/api/webhook/stripe` 已挂载、secret 正确、事件能投递 | 阻断 | Stripe dashboard 事件截图、接口日志 |
| Vercel cron | 确认 `trial-expiry`、`cleanup-leaderboard` 已挂调度且 secret 生效 | 阻断 | 平台调度截图、路由响应/日志 |
| Supabase Storage | 核对 `avatars / community-posts / source-files / videos` 的 bucket、policy、public/signed URL 行为 | 阻断 | bucket 配置截图、上传/签名链接证据 |
| Resend | 确认可发送或明确按“只验写库、不验送达”降级 | 非阻断或条件阻断 | 邮件后台截图、发送日志 |
| 缓存回流 | 核对 `revalidatePath` / `revalidateTag` 在预发真实请求中生效 | 阻断 | 操作前后页面截图、缓存回流录屏 |
| 数据库 schema | 确认关键表与关键字段已在目标库存在 | 阻断 | SQL 查询结果、后台数据截图 |

#### 页面域与账号样本绑定规则
- 学生主域默认使用 `student_ui_test@learnmore.com` 做主流程，`student1@mail.com` 做低数据/空态补样本，未登录态专门验证受限跳转。
- 成长与账户域优先使用已有成长数据的学生样本；涉及付费订阅、价格展示和取消订阅时，必须切到付费学生样本，不允许拿免费账号误判。
- 后台管理域优先使用 `admin_ui_test@learnmore.com` 做页面与低风险动作，只有在必须核对真实历史数据时才切到 `admin@learnmore.com`。
- 教师与家长只承担权限边界、可见性和受限态验证，不承担管理员写链路或学生主核账路径。
- `*@learnmore.test` 临时账号只用于注册、登录、voucher、payment、feedback 这类一次性 smoke，不进入正式长期核账样本集合。

#### 核账点固定规则
- 只要页面触发正式写动作，就必须同时保留“页面回显”和“SQL/后台状态”两套证据，不能只看 toast 或按钮状态。
- 共享写链路的正式核账表以 `T-021.10` 矩阵为准，不允许在预发现场临时改成别的表或仅靠推断。
- 如果某页面域只消费共享写链路结果，则页面域核账可以引用共享写链路的 SQL 快照，但仍需补本页面的回流截图。
- 静态营销页、非核账展示区和纯视觉增强不进入 SQL 核账，但仍需保留页面截图与 console error 结果。

#### T-021.2 收口结论（已完成）
- 本轮预发复测范围已经固定为“五个执行域 + 一张平台依赖表”：
  - 学生学习主域
  - 成长与账户域
  - 公开与转化域
  - 后台管理域
  - 共享写链路域
- 每个执行域都已经绑定了测试账号/权限样本、固定 SQL/后台核账点和证据类型，后续 `T-021.6 ~ T-021.10` 只需按表执行，不再重新讨论范围。
- 本轮明确排除项也已经固定：静态营销文案、非核账展示模块、纯视觉增强层只做展示检查，不进入 `P0` 正式核账。
- 因此，`T-021.2` 现阶段可以收口为“预发复测执行范围、样本、核账点、证据类型已冻结”，后续执行若发现缺口，应在对应域下增补，不回退重开范围定义。

### T-021.3 发布前门禁与回滚边界（已完成）
- `T-021.3` 的目标不是再列一遍风险，而是把“什么情况必须拦发布、出了问题先回什么、谁有权先停入口”写成固定规则，避免预发复测完成后临场拍脑袋。
- 发布前阻断门禁固定如下：
  - 任一 `P0` 页面主链路不能稳定跑通，阻断发布。
  - 任一正式写链路出现“页面成功但 SQL / 后台状态错误”，阻断发布。
  - 任一权限边界出现越权写入、越权读取敏感后台页、未登录误放行，阻断发布。
  - 任一平台依赖项缺失且无可接受降级方案，例如 `Stripe webhook`、`Vercel cron`、`Storage policy`、关键环境变量缺失，阻断发布。
  - 任一高频页面存在稳定复现的未捕获运行时错误、长 pending、白屏或 hydration 红错，阻断发布。
- 回滚粒度固定如下：
  - 页面入口级：隐藏入口、下线 CTA、移除导航入口，适用于公开入口、学生入口和后台入口的快速止损。
  - 功能链路级：关闭单条写链路或单个异步副作用，例如支付入口、发帖入口、奖励补发入口、内容导入入口。
  - 平台依赖级：禁用 webhook、暂停 cron、撤销外部回调或临时切只读策略。
  - 数据修正级：优先使用补偿写入、状态回退和审计补记，不直接对核心事实表做不可追溯硬删。
- 数据回滚边界固定如下：
  - `voucher_redemptions`、`reward_adjustment_records`、`reward_admin_audit_logs`、内容导入结果、后台处理状态这类“运营 / 管理动作表”允许按单条记录或单批次回滚。
  - `users.subscription_*`、`daily_tasks`、`notifications`、`user_feedback*` 允许按明确事件批次做补偿回写，但必须保留审计痕迹。
  - `exam_records`、`user_attempts`、课程进度这类学习事实表默认不做物理删除式回滚，只允许通过补偿记录、状态修正和入口下线止损；除非确认是测试污染数据且范围完全可控。
- `feature flag` / `kill switch` 关闭策略固定如下：
  - 若已有正式 flag，则优先走 flag 关闭。
  - 若没有正式 flag，不允许临时口头约定“先别点那个功能”；必须至少落实为“入口隐藏 + 后端动作拒绝 + 平台回调暂停”三层之一。
  - 对支付、导入、奖励补发、后台高风险操作，默认要求同时具备“页面不可见”与“服务端拒绝”两层止损，避免只关前端入口仍可被直调。
- 权限回收策略固定如下：
  - 后台高风险权限优先通过角色/权限覆写回收，不以“通知相关人别再操作”代替。
  - 若本轮预发新增了临时管理员、教师或测试账号权限，发布前必须确认是否回收到最小权限集。
  - 对无法即时删除的数据副作用，至少先冻结入口和角色权限，再补数据修正。

#### T-021.3 收口结论（已完成）
- 发布门禁已经从“发现问题再讨论”收口为固定阻断清单：主链路失败、写后核账错误、越权、平台依赖缺失、稳定运行时故障，任一成立即不进入发布窗口。
- 回滚边界已经固定为“入口下线 -> 链路关闭 -> 平台暂停 -> 数据补偿”四层，不再把数据库硬回滚当默认方案。
- 核心学习事实表已明确不采用粗暴物理删除回滚；运营/管理动作表才允许做单条或批次级回退。
- 因此，`T-021.3` 现阶段可以收口为“发布阻断条件、止损顺序和回滚边界已冻结”。

### T-021.4 预发证据口径（已完成）
- `T-021.4` 的目标是让预发留证可检索、可复核、可对应到部署，而不是留下大量无法追溯的截图和临时 SQL。
- 本轮预发统一证据批次前缀固定为 `T021-staging-YYYYMMDD`；若同日多轮复测，则追加部署号或轮次后缀，例如 `T021-staging-20260409-dpl_xxx-r2`。
- 证据命名固定如下：
  - 页面截图：`[batch]-[domain]-[route]-[scenario]-[sampleRef]-screen`
  - 页面录屏：`[batch]-[domain]-[scenario]-[sampleRef]-video`
  - SQL / 后台快照：`[batch]-[domain]-[table]-[scenario]-[sampleRef]-sql`
  - Action/API 响应：`[batch]-[domain]-[action]-[scenario]-response`
  - 平台证据：`[batch]-[platform]-[resource]-[scenario]`
  - 部署证据：`[batch]-deployment-summary`
- 证据内容最低要求固定如下：
  - 页面截图必须能看见路由、关键模块或错误态。
  - 页面录屏必须覆盖动作前、动作中、动作后。
  - SQL 快照必须至少包含关键表、关键字段、执行前后值或查询时间点。
  - Action/API 响应必须至少保留状态、关键返回字段或错误摘要。
  - 平台证据必须能对应到具体资源，例如 webhook 事件、cron 配置、Storage bucket、部署号。
- 场景与证据的绑定规则固定如下：
  - 每个 `P0` 写场景必须同时具备页面证据和 SQL / 后台证据。
  - 每个 `P0` 只读场景必须至少具备页面证据和 console/runtime 结果。
  - 若证据引用共享写链路或平台截图，必须在当前场景记录中明确写出引用来源，不允许只写“见群里截图”。
  - 每条证据必须绑定 `taskRef`、`sampleRef`、执行时间和部署号，避免同一场景跨部署串证。
- 预发单条执行记录模板固定如下：
```md
#### [domain] [scenario]
- `taskRef`:
- `sampleRef`:
- `routeOrEntry`:
- `deploymentRef`:
- `executedAt`:
- `result`:
- `blocking`:
- `evidenceSet`:
- `sqlCheckpoint`:
- `结论`:
- `残余风险 / 备注`:
```
- 部署号绑定规则固定如下：
  - 同一轮预发复测必须明确对应一个 Vercel deployment id 或 hostname。
  - 若中途重新部署，后续证据必须切换到新的 `deploymentRef`，旧证据不可直接沿用为新部署通过证明。
  - 最终发布审批只接受“最新待发部署”的证据包，不接受跨部署拼接的通过结论。

#### T-021.4 收口结论（已完成）
- 预发证据已经固定为“批次前缀 + 场景命名 + 部署绑定”的统一口径，后续不会再出现无法追溯到部署和样本的散落证据。
- `P0` 写场景、只读场景、平台依赖场景的最低留证要求已明确，后续执行只需按模板填充。
- 因此，`T-021.4` 现阶段可以收口为“预发证据命名、最小留证标准和部署绑定规则已冻结”。

### T-021.5 发布审批条件（已完成）
- `T-021.5` 的目标是把“什么时候允许发、谁来拍板、哪些风险必须先写清楚”收口成明确门槛，避免复测结束后默认滑进发布窗口。
- 发布前必须同时满足以下审批条件：
  1. `T-021.6 ~ T-021.10` 的 `P0` 场景已执行完毕，且不存在未关闭的阻断问题。
  2. `T-021.1` 标记的环境阻断项都已关闭，或已被明确降级且有批准记录。
  3. 最新待发部署已完成对应证据留存，不接受旧部署结果代替新部署审批。
  4. 未解决缺陷、残余风险、降级策略、回滚入口和负责人均已写入最终报告。
  5. 若存在条件放行项，必须明确“影响面、监控项、观察窗口、谁负责盯盘”，否则视为未满足审批条件。
- 缺陷分层与放行规则固定如下：
  - `阻断缺陷`：主链路、正式写链路、权限、安全、平台依赖、稳定运行时错误；必须关闭后才能发布。
  - `条件放行缺陷`：不影响 `P0` 正确性，但可能影响低频路径、展示细节或人工兜底可控链路；必须登记影响面和观察方案后才能放行。
  - `观察项`：当前未复现为缺陷，但属于高风险波动点，例如历史构建失败点、缓存回流、异步回调；必须进入发布后监控清单。
- 发布后首轮监控阈值固定如下：
  - 不接受持续性 `5xx` 或核心 Action 大面积失败。
  - 不接受 Stripe webhook 连续失败且无人接手。
  - 不接受 cron 首轮执行失败且无补跑方案。
  - 不接受 Storage 上传 / 签名 URL 主链路失效。
  - 不接受学生主域或后台管理域出现稳定白屏、长 pending 或权限穿透。
- 批准角色固定如下：
  - 技术核验责任人：确认复测证据、阻断项和回滚方案完整。
  - 业务批准人：确认条件放行项和业务风险可接受。
  - 发布执行人：确认实际部署对象、发布时间窗和回滚入口清晰。
  - 若三者中任一角色缺位，则默认不进入发布窗口。
- 最终审批输出固定如下：
  - `发布对象`：具体 deployment id / hostname
  - `审批结果`：`go` / `conditional go` / `no-go`
  - `未解决项`：
  - `残余风险`：
  - `监控重点`：
  - `回滚入口`：
  - `批准人 / 时间`：

#### T-021.5 收口结论（已完成）
- 发布审批已经从“口头确认差不多可以发”收口为固定门槛：执行完成、阻断关闭、证据绑定到最新部署、风险和回滚入口写清、角色批准齐备。
- 缺陷分层、条件放行规则和发布后监控重点都已明确，后续不会把“观察项”混成“已通过”。
- 因此，`T-021.5` 现阶段可以收口为“发布审批条件、放行等级与批准角色已冻结”。

### T-021.6 用户学习主域复测执行表（进行中）
- 当前执行目标固定为学生学习主域四块页面子域：
  - Dashboard 首页
  - 课程域
  - 练习域
  - 社区域
- 本子任务不再重复定义范围，只负责按固定样本执行、留证、发现预发专有异常并回填。

#### 页面子域执行矩阵
| 页面子域 | 对应任务 | 关键路由 | 主样本 / 边界样本 | 主 CTA / 关键动作 | 核心 SQL / 后台核账点 | 最低证据类型 | 阻断级别 |
|---|---|---|---|---|---|---|---|
| Dashboard 首页 | `T-005` | `/dashboard` | `student_ui_test@learnmore.com`、`student1@mail.com`、未登录态 | 首页加载、`7D/30D` 切换、任务领奖、学习路径跳转、最近练习重开、排行榜卡跳转 | `users`、`daily_tasks`、`exam_records`、`leaderboard_entries` | 首页截图、领奖录屏、SQL 前后快照、console 检查 | 阻断 |
| 课程域 | `T-006` | `/dashboard/courses`、`/course/[subjectId]`、`/course/[subjectId]/[lessonId]` | `student_ui_test@learnmore.com`、`student1@mail.com`、未登录态 | 课程列表读取、进入学科、进入课时、完成课时、返回课程页 / Dashboard 验证回流 | `user_progress`、`users.totalStudyTime`、`users.streak`、`daily_tasks` | 页面截图、课时完成录屏、SQL 快照、返回页回流截图 | 阻断 |
| 练习域 | `T-007` | `/dashboard/practice`、`/dashboard/practice/smart-drill`、`/dashboard/practice/chapter-drill/[chapterId]`、`/dashboard/practice/mock-arena`、`/dashboard/practice/mock-arena/[examId]`、`/dashboard/practice/past-paper/[paperId]`、`/dashboard/practice/error-wiper` | `student_ui_test@learnmore.com`、`student1@mail.com`、未登录态 | 练习入口读取、开始练习、提交结果、重复提交防重、结果页回流、回 Dashboard / 排行榜验证刷新 | `exam_records`、`user_attempts`、`users.streak`、`users.xp`、`leaderboard_entries`、`daily_tasks` | 提交录屏、Action/API 响应、结果页截图、SQL 前后快照、console 检查 | 阻断 |
| 社区域 | `T-008` | `/dashboard/community`、`/dashboard/community/new`、`/dashboard/community/[postId]` | `student_ui_test@learnmore.com`、`student1@mail.com`、未登录态 | 社区列表读取、发帖、评论、提及、详情跳转、列表回流、未登录受限跳转 | `posts`、`comments`、`notifications` | 前后台截图、发帖/评论录屏、SQL 快照、通知留证、403/跳转截图 | 阻断 |

#### 固定执行顺序
1. 先用 `student_ui_test@learnmore.com` 验证 `/dashboard` 首屏加载、主 CTA 可点、未出现阻断级 console error，作为学生主域基线。
2. 再进入练习域执行至少一条正式提交链路，并返回 `/dashboard` 与 `/dashboard/leaderboard` 验证 `recentPractice / streak / xp / leaderboard` 是否按既定回流策略更新。
3. 再进入课程域执行至少一条课时完成或进度推进链路，并返回课程列表和 `/dashboard` 验证 `user_progress / daily_tasks / studyTime` 是否一致。
4. 最后进入社区域执行发帖或评论链路，验证列表、详情、通知与受限跳转；涉及提及时必须同时检查通知留痕。
5. `student1@mail.com` 只承担低数据 / 空态 / 弱数据边界复测；未登录态只承担受限跳转、按钮行为和入口守卫，不承担正式核账。

#### 预发判定约束
- Dashboard 已明确采用“返回页刷新 / 下次进页刷新”策略，不要求驻页实时自动变更；预发执行时不能把“停留当前页不自动刷新”误判为故障。
- 练习域的正式写入以 `submitPracticeSession`、`submitExam`、`submitErrorWiperSession` 为准；只要结果页出现成功提示，必须继续核对 `exam_records`、`user_attempts` 与成长副作用，不允许只看前端文案。
- 课程域的完成链路会触发 `checkAndRefreshStreak()` 与 `trackDailyProgress()`；因此课程复测不是只看播放和跳转，还必须检查任务推进和 streak 边界。
- 社区域的 `createPost` / `createComment` 会带提及通知与社区成就副作用；预发执行时若帖子写入成功但通知或详情页不同步，仍按阻断级缺陷记录。
- 移动端固定抽检 `390x844` 视口下的 `/dashboard`、一个练习提交页、`/dashboard/community` 三个页面，避免学生主域只在桌面可用。

#### T-021.6 收口条件（预设）
- `/dashboard`、课程主链路、至少一种练习提交链路、社区发帖或评论链路都已完成一轮正式留证。
- 至少完成一条学生正式写动作的 SQL 前后核账，并能回流到页面展示层。
- `student1@mail.com` 的低数据 / 空态路径与未登录态受限跳转均已复测，不存在“空态崩溃”或“未登录误放行”。
- 学生主域关键页面在桌面与移动端都没有阻断级布局错乱、长 pending、未捕获异常或红字报错。
- 若发现问题，必须直接挂到 `T-021.6` 下的页面子域场景，不回退重开 `T-021.2` 范围定义。

### T-021.6 用户学习主域复测结果（已完成，结构性阻断已解除，仍有数据层残余风险）
- 本轮学生主域结论已经从“结构性路由阻断”推进到“路由已恢复、仍需补齐真实课时数据”的状态，因此 `T-021.6` 作为复测任务可以收口，但课程域的最终放行仍要等 `T-006` 完成后再做真实课时核账。
- 当前可直接复用的同日浏览器证据如下：
  - `student_ui_test@learnmore.com` 登录后进入 `/dashboard` 的页面留证已存在，见 [`student-login-dashboard-home.png`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260409/student-login-dashboard-home.png) 与 [`t020-6-login-checks.json`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260409/t020-6-login-checks.json)。
  - 未登录态对 `/dashboard` 的守卫留证已存在，见 [`guest-dashboard-redirect.png`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T020-local-20260409/guest-dashboard-redirect.png)。
  - 同日浏览器路由测量已确认以下 student 路由返回 `200`：`/dashboard`、`/dashboard/courses`、`/dashboard/practice`、`/dashboard/community`、`/dashboard/community/new`、`/dashboard/practice/chapter-drill/preview-1`、`/dashboard/practice/past-paper/2306416`，证据见 [t-026-browser-route-timings.md:36](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/t-026-browser-route-timings.md#L36)、[t-026-browser-route-timings.md:38](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/t-026-browser-route-timings.md#L38)、[t-026-browser-route-timings.md:40](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/t-026-browser-route-timings.md#L40)、[t-026-browser-route-timings.md:41](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/t-026-browser-route-timings.md#L41)、[t-026-browser-route-timings.md:43](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/t-026-browser-route-timings.md#L43)、[t-026-browser-route-timings.md:44](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/t-026-browser-route-timings.md#L44)、[t-026-browser-route-timings.md:48](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/t-026-browser-route-timings.md#L48)。
- 当前识别出的核心阻断项已经从“路由不存在”变成“真实课时数据尚未完全落地”：
  - 课程深链路由已补齐为真实页面结构。`src/app/course/[subjectId]/layout.tsx`、[`src/app/course/[subjectId]/page.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/course/[subjectId]/page.tsx#L1) 与 [`src/app/course/[subjectId]/[lessonId]/page.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/course/[subjectId]/[lessonId]/page.tsx#L1) 已不再直接 `notFound()`。
  - `CourseNavigation` 已改为继续跳转到下一课时，`updateUserLessonProgress()` 也已兼容无 `duration` 的完成动作，避免内容课时在完成收口上再次卡死。
  - 当前数据库里 `lessons` 仍为空，因此课程页会先以章节概览作为过渡入口；这属于数据层残余风险，不再是结构性路由阻断。
- 因此，学生主域的当前状态应拆开看：
  - `Dashboard / Practice / Community`：已有同日本地真实路由证据，至少达到“路由可打开、登录守卫生效、主壳存在”的基线。
  - `Courses` 列表页：已有 `/dashboard/courses` 的本地浏览器 `200` 证据，且课程深链现在已恢复可进入。
  - `Course 深链 / 课时完成`：路由层已恢复，但真实课时数据仍需 `T-006` 补齐后再做完整写链路核账。
- 当前线程里尝试补跑一轮新的浏览器自动化，但执行环境本身存在限制：
  - 当前 Codex 沙箱中，独立 Playwright 浏览器启动被系统权限拦截；
  - 内置 Playwright MCP 又被现有 Chrome 会话锁占用；
  - 因此本节的最终结论是基于“同日已有本地浏览器留证 + 当前代码路由审计 + 当前数据库样本基线”收口，而不是伪造一轮并未真正跑过的预发记录。

#### T-021.6 收口结论（已完成）
- `T-021.6` 作为“学生主域复测与结论输出”任务已经完成，当前不再是 `notFound()` 级别的结构性阻断。
- 课程域已恢复成可进入、可导航、可回流的真实路由结构；剩余风险主要是 `lessons` 数据尚未补齐，因此当前先以章节概览过渡，完整课时写链路仍建议在 `T-006` 完成后再做一次正式核账。
- 后续如果要把课程域从“可进入”推进到“可完成”，正确动作是先完成 `T-006` 的课时数据与内容落地，再回到学生主域执行一轮新的课程链路复测与回流核账。

### T-021.7 成长与账户域复测执行表（进行中）
- 当前 `T-021.7` 先按“排行榜 / 成就 / 设置 / 通知”四块收口，不再和学生主域混跑：
  - 排行榜：`/dashboard/leaderboard`
  - 成就：`/dashboard/achievements`
  - 设置：`/dashboard/settings`
  - 通知入口：右上角通知 Bell -> `/dashboard/settings?tab=notifications`
- 已确认的路由与组件级证据：
  - `t-026-browser-route-timings.md` 已有同日浏览器 `200` 证据，覆盖 `/dashboard/achievements`、`/dashboard/leaderboard`、`/dashboard/settings`，说明成长与账户域主入口当前可达。
  - [`src/components/dashboard/views/__tests__/SettingsView.test.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/dashboard/views/__tests__/SettingsView.test.tsx) 已验证合法 `notifications` tab 不会被额外重写，非法 tab 会回流到 `profile`。
  - [`src/components/notification/__tests__/NotificationDropdown.test.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/notification/__tests__/NotificationDropdown.test.tsx) 已验证通知详情链接会规范到真实落点，历史 `/dashboard/settings?tab=feedback` 深链也已被收口。
  - [`src/components/achievements/__tests__/AchievementsView.test.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/achievements/__tests__/AchievementsView.test.tsx) 已验证成就概览缺失时会显示中性占位，不伪造 0 值或旧 CTA。
- 已确认的真实数据样本：
  - `student_ui_test@learnmore.com` 当前具备 `xp=50`、`streak=1`、`totalStudyTime=183`，并已存在 `notification_preferences` 记录与 1 个已解锁徽章。
  - `student1@mail.com` 当前具备低数据基线：`xp=0`、`streak=0`、`totalStudyTime=120`，且没有通知偏好、徽章和排行榜名次，适合作为空态 / 弱数据样本。
  - 当前库内 `leaderboardEntry`、`badge`、`notificationPreference` 都有足够样本量，说明成长与账户域不是“空库假通过”。
- 当前判断：
  - 成长与账户域没有出现像课程深链那样的结构性 `notFound()` 阻断。
  - 这里更需要继续核对的是缓存回流、设置保存、通知 read/write 行为是否与正式合同完全一致。
  - 其中 `notificationPreferences` 读取会在缺失时自动补建，这属于已观察到的读侧副作用，后续预发复测时仍要留意它是否符合产品合同。
  - 浏览器级留证已补齐，证据目录见 [`evidence/T021-browser-20260410`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/evidence/T021-browser-20260410/)：游客态 `leaderboard-guest / achievements-guest / settings-guest` 均回流到登录页；登录态 `login-auth-redirect / leaderboard-auth / achievements-auth / settings-auth / settings-notifications-tab` 均保持 `200` 并命中真实内容，其中 `leaderboard-auth` 命中“排行榜 / Competitive Ladder”，`achievements-auth` 命中“成就 / Achievement”，`settings-auth` 命中“设置 / Preference Console”，`settings-notifications-tab` 命中“通知 / Preference Console”。

### T-021.8 公开与转化域复测执行表（进行中）
- 当前 `T-021.8` 先按“营销页 / Auth / 转化入口 / 反馈入口”四块收口：
  - 营销页：`/`、`/pricing`、`/blog`、`/help`、`/contact`
  - Auth：`/register`、`/login`、`/reset-password`
  - 转化入口：`/r/[code]`、`/pricing?referralCode=...`、`voucherCode` 输入
  - 反馈入口：`/help` 内反馈弹窗、`/contact` 联系表单
- 已确认的路由与组件级证据：
  - `T-019` 已把 public / marketing / auth 的路由、页面、组件、动作与数据源边界收口完成，`signup / login / reset-password / referral / voucher / contact` 的权威链路已经明确。
  - `T-022` 已把全站 feedback 入口与 `submitFeedback` 写链路收口完成，因此本步只需要核对“公开页可见与入口稳定”，不重复做 feedback 写入闭环。
  - `pricing` 页面已接通 `referralCode / voucherCode` 与 checkout 预检查逻辑，`register` 页面已接通 `referralCode` 预填与推荐码存在性校验。
- 当前准备使用的真实样本：
  - `student_ui_test@learnmore.com` 与 `admin_ui_test@learnmore.com` 仍作为稳定登录样本
  - `codex.authprobe.1774884507912@example.com` 的 `referralCode=JKAE31EI` 可用于 `/register` 预填与 `/r/[code]` 落地验证
  - `V27067247` 可用于 `/pricing` 的 voucher 可用性与价格回写验证
- 当前判断：
  - 公共与转化域没有结构性 `notFound()` 阻断。
  - 这里最需要继续核对的是：公开页展示、推荐码与优惠券预填、注册/登录/重置回执、以及 feedback/contact 的真实提交回显是否仍然一致。

## 旧任务整合说明
- 旧 `T-004 Dashboard / Achievements / Settings` 已拆入：`T-005`、`T-017`、`T-018`。
- 旧 `T-005 Practice` 已整合为新的 `T-007` 全路由族任务。
- 旧 `T-007 Admin / Billing / Support / Notification` 已拆入：`T-009 ~ T-015`，跨页面公共能力由对应页面族收口。
- 旧 `T-008 Public / Marketing / Auth` 已整合为 `T-019`。
- 旧 `T-009 本地验证`、`T-010 预发复测` 已顺延为 `T-020`、`T-021`。

## 备注
- 当前阶段已完成任务结构重构与 `T-004` 模板文档，不进入页面代码实现。
- `T-004` 已落地，统一模板见 `sitewide-real-data-governance-template.md`。
- `T-002` 工作底稿见 `t-002-sitewide-governance-workbook.md`，按 `T-002.1 -> T-002.10` 顺序持续补全。
- 各页面族任务默认先做读数据与口径，再做写动作，最后做 mock 清理和验证。

## 2026-03-30 补充任务（仅追加，不替换既有任务）
> 说明：本节用于承接当前确认的开发顺序与落地颗粒度。  
> 不改动 `T-001 ~ T-021` 的原始定义；以下任务作为追加任务执行。  
> 其中 `T-022 ~ T-024` 对应当前已确认的增量开发链路，`T-025` 用于约束“每完成一步立即更新文档并测试留证”，`T-026` 用于承接全站响应时间/渲染时间/交互反馈时间优化。

| id | description | owner | status (todo/doing/done) | link (PR/commit) |
|---|---|---|---|---|
| T-022 | 全站右下角 Feedback 入口真实化与提交链路收口（归属 `T-019`，联动 `T-011`） | codex | done |  |
| T-023 | `/admin/content/reports` 真数据接入、处理动作与统计口径收口（补强 `T-015`） | codex | doing |  |
| T-024 | `/admin/feedback` 管理闭环与前后台联动收口（补强 `T-011`，依赖 `T-022`） | codex | done |  |
| T-025 | 增量开发留证：每步开发完成后立即更新文档、执行测试并记录结果 | codex | todo |  |
| T-026 | 全站响应时间优化收口：首屏渲染、路由切换、点击即时反馈、函数与数据源延迟统一压缩 | codex | done |  |

## 补充执行顺序（覆盖本轮开发，不替换原顺序）
| 执行阶段 | 对应任务 | 执行说明 |
|---|---|---|
| Stage A | `T-022` | 先打通全站 Feedback 入口，确保正式入口、提交动作、回显与基础验证可用 |
| Stage B | `T-023` | 再推进 `/admin/content/reports`，完成真数据替换、处理动作与统计口径对齐 |
| Stage C | `T-024` | 最后收口 `/admin/feedback` 管理闭环，验证与前台 Feedback 提交链路的联动 |
| Stage D | `T-026` | 在当前真数据收口基础上，分层压缩首屏、切页、点击反馈、函数和数据访问延迟 |
| Stage E | `T-025` | 每个阶段完成后立即更新任务状态、补文档、跑定向测试并记录证据 |

## T-022 全站 Feedback 入口真实化
| id | description | owner | status |
|---|---|---|---|
| T-022.1 | 盘点全站 Feedback 入口：`RootLayout` 右下角浮窗、`/help` 中的反馈弹窗、移动端遮挡/层级/可见性与当前提交链路 | codex | done |
| T-022.2 | 建立入口字段与交互矩阵：分类、标题、内容、邮箱、来源页面、登录/匿名规则、成功回显与失败提示 | codex | done |
| T-022.3 | 对齐入口读取与初始化：默认分类、已登录邮箱回填、匿名邮箱必填规则、弹窗开关与关闭行为 | codex | done |
| T-022.4 | 对齐入口写链路：`submitFeedback` 输入校验、来源透传、重复点击语义、匿名/登录提交策略与必要的限流/防重约束 | codex | done |
| T-022.5 | 清理右下角反馈入口中的假成功、文案漂移、未接通附件/来源字段与不完整错误态，补齐移动端与未登录态；接入多语言文案并收口浮标动效 | codex | done |
| T-022.6 | 完成入口验证：游客提交、登录提交、重复提交、弹窗开关、移动端展示、数据库 migration/落库与后台可见性验证 | codex | done |

### T-022.1 盘点结论（2026-03-30）
- 入口分布：全站根布局无条件渲染右下角 `FeedbackWidget`，当前会出现在公开页、Dashboard、Admin、Auth 等全部路由；`/help` 页面还额外内置了一套 `FeedbackModal` 触发卡片，形成双入口并存。
- 组件复用：右下角浮窗与 `/help` 页面入口共用同一个 `FeedbackModal`，当前默认分类均为 `SUGGESTION`，字段仅包含 `category/title/content/email`，没有“来源页面”字段，也没有实际可用的附件输入 UI。
- 移动端遮挡：`FeedbackWidget` 使用 `fixed bottom-6 right-6 z-[90]`，未针对移动端隐藏或抬高；移动端底部导航 `BottomTabBar` 使用 `fixed bottom-0 z-50 h-16`，因此在手机宽度下浮窗会压在底部导航区域上方，存在遮挡与误触风险。
- 层级关系：移动端顶部 `MobileHeader` 为 `z-40`，底部导航为 `z-50`，反馈浮窗为 `z-[90]`；当前层级能保证浮窗可点击，但也意味着它会强压所有移动端基础导航之上。
- 提交链路：当前正式入口调用的是 `src/actions/support/ticket.ts` 中的 `submitFeedback`，会写入 `user_feedbacks`，匿名用户必须填写邮箱，登录用户优先使用账号邮箱；提交成功后会异步发送确认邮件、为登录用户创建站内通知，并 `revalidatePath('/admin/feedback')`。
- 链路漂移风险：仓库中还存在另一份未被当前入口使用的 `src/actions/support/feedback.ts`，同名 `submitFeedback` 允许邮箱为空、只 `revalidatePath('/dashboard/support')`，与当前正式链路语义不一致，属于后续需要收口的重复实现。
- 回显风险：当前站内通知跳转写死为 `/dashboard/settings?tab=feedback`，但设置页实际只接受 `profile/ai-config/notifications/account/subscription`，不存在 `feedback` tab，因此成功后的通知深链当前无效。
- 当前结论：`T-022.2 ~ T-022.5` 需要优先解决三类问题。
- 其一，入口去重与路由可见性策略。
- 其二，移动端底部导航避让策略。
- 其三，提交动作唯一入口与成功回显目标统一。

### T-022.1 留证
- 已完成代码路径盘点：`src/app/layout.tsx`、`src/components/support/FeedbackWidget.tsx`、`src/components/support/FeedbackModal.tsx`、`src/app/(marketing)/help/page.tsx`、`src/components/mobile/BottomTabBar.tsx`、`src/components/mobile/MobileHeader.tsx`、`src/actions/support/ticket.ts`、`src/actions/support/feedback.ts`、`src/components/dashboard/views/SettingsView.tsx`。
- 本步未做代码实现变更之外的业务测试；尝试使用 Playwright 做移动端可视核查时，受本机现有 Chrome session 影响未成功拉起浏览器，因此当前盘点结论以静态代码与样式层级分析为准。

### T-022.2 字段与入口规则（2026-03-30）
| 维度 | 规则 | 当前结论 |
|---|---|---|
| 正式入口 | 正式反馈入口保留 2 个：全站右下角浮窗 + `/help` 页内支持卡片 | 两者共用同一 `FeedbackModal`，后续只维护这一套表单契约 |
| 非正式入口 | 未被渲染、未纳入当前营销页的旧 `Footer.tsx` 不再保留 | 本轮直接删除，避免继续误导“`/help` 有 footer 导流” |
| 表单字段 | `category`、`title`、`content` 为必填；`email` 对匿名用户必填，对登录用户为可见但非权威输入 | 登录用户提交时以账号邮箱为准，匿名用户必须填写有效邮箱 |
| 来源字段 | 增加内部来源语义，至少区分 `floating-widget` 与 `help-page`，并保留页面路径来源 | 本轮先在规则层固化，具体透传在 `T-022.4` 落地 |
| 默认值 | 默认分类统一为 `SUGGESTION` | 两个入口保持一致，避免页面级各自漂移 |
| 成功回显 | 成功提示文案、关闭弹窗、表单 reset 行为统一 | 成功后的无效深链 `/dashboard/settings?tab=feedback` 将在 `T-022.4` 直接移除 |
| 失败回显 | 失败时统一显示错误 toast，不出现“假成功”或静默失败 | 错误信息优先使用服务端返回，其次使用统一兜底文案 |
| 动作唯一性 | 全站反馈提交只允许保留一个正式 `submitFeedback` 实现 | 冗余的 `src/actions/support/feedback.ts` 视为旧实现，后续在 `T-022.4` 收口/下线 |
| 可见性策略 | 右下角浮窗是否全站显示、是否在 Auth/Admin/移动端隐藏，不在本步拍板 | 放到 `T-022.3` 结合初始化和显示策略一起定 |

### T-022.2 留证
- 已固化入口矩阵：正式入口只有 `FeedbackWidget` 与 `/help` 页面内的 `FeedbackModal` 触发卡片。
- 已固化字段矩阵：当前正式表单字段为 `category/title/content/email`，后续需补内部来源字段，不补附件 UI。
- 已确认无效入口处理方向：未使用的 `src/components/layout/Footer.tsx` 直接删除，不作为 `/help` 导流入口继续保留。
- 已确认后续收口动作：`/dashboard/settings?tab=feedback` 深链删除；反馈提交只保留 `src/actions/support/ticket.ts` 为唯一正式实现。

### T-022.3 初始化与显示策略结论（2026-03-30）
- 路由显示策略：右下角浮窗在 `/help` 路由隐藏，避免与页内 `Send a Message` 入口重复显示；其他路由暂时继续保留，后续是否在 Auth/Admin 域进一步收缩，留待更大范围交互评估。
- 移动端显示策略：右下角浮窗在手机端改为上移到 `bottom navigation` 之上，避免继续压住底部导航区域；平板及以上仍保持常规右下角定位。
- 默认值策略：反馈分类继续统一初始化为 `SUGGESTION`，每次打开弹窗都重置为默认分类与空白内容，避免上一次输入残留到下一次会话。
- 登录用户邮箱策略：弹窗打开时通过浏览器 Supabase session 读取当前用户；若已登录，则自动预填账号邮箱并禁用邮箱输入框，明确“使用账号邮箱作为回执地址”。
- 匿名用户邮箱策略：匿名用户打开弹窗时邮箱字段保持空白，并在 UI 上明确标记为“必填”，作为后续 `T-022.4` 客户端/服务端校验收口的前置规则。
- 关闭行为策略：点击取消、遮罩关闭、提交成功关闭都统一走同一套 reset/close 逻辑，确保表单状态一致，不残留旧输入。

### T-022.3 开发内容
- 更新 `src/components/support/FeedbackWidget.tsx`：基于当前 pathname 在 `/help` 隐藏浮窗，并调整移动端底部定位，避开 `BottomTabBar`。
- 更新 `src/components/support/FeedbackModal.tsx`：在弹窗打开时读取当前登录用户邮箱；为登录用户预填并锁定邮箱输入；统一 modal 的打开/关闭/reset 行为，修复原先 `Dialog onOpenChange` 直接绑定 `onClose` 的松散实现。

### T-022.3 验证步骤
- 静态验证：检索并确认 `/help` 隐藏逻辑、移动端底部偏移、登录态邮箱预填状态、关闭逻辑入口都已落入目标组件。
- 代码校验：执行 `pnpm exec eslint src/components/support/FeedbackWidget.tsx src/components/support/FeedbackModal.tsx`，结果通过。

### T-022.3 未覆盖项
- 未执行浏览器级交互验证：未实际点击验证 `/help` 隐藏、移动端位置、弹窗开关与邮箱预填效果。
- 未执行真实登录态验证：尚未在真实 session 下确认 Supabase 客户端读取邮箱的运行时表现。
- 未执行提交链路验证：本步未触发 `submitFeedback`，数据库落库与后台可见性留到 `T-022.4` / `T-022.6`。

### T-022.4 写链路收口结论（2026-03-30）
- 唯一正式实现：反馈提交正式实现统一收口到 `src/actions/support/ticket.ts`；旧的 `src/actions/support/feedback.ts` 已删除，避免后续误用旧语义。
- 来源透传：反馈提交新增 `sourceType/sourcePath` 两个写入字段；前端由 `FeedbackModal` 自动透传来源类型和当前 pathname，后端写入 `user_feedbacks.source_type/source_path`。
- 输入校验：服务端在创建前追加 `title/content/email` 的最小校验；匿名用户缺邮箱会直接返回明确错误，标题和内容长度不足也会直接拦截。
- 重复点击语义：服务端增加 2 分钟短时去重窗口；同一用户或同一匿名邮箱在短时间内提交完全相同的 `category/title/content` 时，不再重复创建新记录，而是返回已有记录并视为成功。
- 登录/匿名策略：登录用户始终以账号邮箱为准；匿名用户使用表单邮箱作为回执地址；二者都走同一条 `submitFeedback` 写链路。
- 无效深链移除：反馈收到通知和反馈回复通知都不再写入 `/dashboard/settings?tab=feedback` 链接，避免产生不可达跳转。

### T-022.4 开发内容
- 更新 `src/actions/support/ticket.ts`：
- 扩展 `SubmitFeedbackParams`，支持 `sourceType/sourcePath`。
- 增加服务端 `title/content/email` 校验。
- 增加 2 分钟短时去重逻辑，避免重复点击造成重复落库。
- 写入 `user_feedbacks.source_type/source_path`。
- 删除反馈通知中的无效 `settings?tab=feedback` 深链。
- 更新 `src/components/support/FeedbackModal.tsx`：
- 提交时透传 `sourceType/sourcePath`。
- 更新 `src/components/support/FeedbackWidget.tsx` 与 `src/app/(marketing)/help/page.tsx`：
- 分别透传 `floating-widget` 与 `help-page` 作为来源类型。
- 更新 `prisma/schema.prisma`：
- 为 `UserFeedback` 新增 `sourceType/sourcePath` 字段映射。
- 新增 `supabase/migrations/019_t0224_user_feedback_source_fields.sql`：
- 为 `public.user_feedbacks` 增加 `source_type/source_path` 列。
- 删除 `src/actions/support/feedback.ts`：
- 移除语义不一致的旧反馈提交实现。

### T-022.4 验证步骤
- 静态验证：
- 检索确认旧实现 `src/actions/support/feedback.ts` 已无引用残留。
- 检索确认 `settings?tab=feedback` 已从反馈提交通知链路中移除。
- 检索确认 `sourceType/sourcePath` 仅存在于新收口链路与 schema/migration 中。
- Prisma 校验：
- 执行 `pnpm prisma generate`，结果通过，Prisma Client 已根据新 schema 重新生成。
- 代码校验：
- 执行 `pnpm exec eslint src/actions/support/ticket.ts src/components/support/FeedbackModal.tsx src/components/support/FeedbackWidget.tsx 'src/app/(marketing)/help/page.tsx'`，结果通过。

### T-022.4 未覆盖项
- 未执行数据库 migration：已新增 `supabase/migrations/019_t0224_user_feedback_source_fields.sql`，但本步未在本地数据库真正 apply。
- 未执行真实提交：尚未实际提交 feedback 验证 `source_type/source_path` 落库、短时去重命中和后台可见性。
- 未执行通知链路验证：虽然已移除无效 link，但尚未实测通知创建后的 UI 展示。

### T-022.5 预定开发范围（已对齐）
- 文案国际化：`FeedbackWidget` tooltip、`FeedbackModal` 标题/描述/字段标签/placeholder/说明文案/success-error toast 需全部跟随用户设置语言切换，不再写死单语文案。
- 动效收口：右下角浮标默认保持静止；呼吸灯/光晕类动效仅在鼠标 `hover` 到图标上，或键盘 `focus-visible` 到按钮时显示，不再持续常驻播放。
- 体验清理：统一右下角入口与 `/help` 页内入口的文案口径，补齐未登录邮箱必填提示、错误态表达与移动端视觉一致性。

### T-022.6 预定验证范围（已对齐）
- 执行数据库 migration：应用 `019_t0224_user_feedback_source_fields.sql`，确保 `source_type/source_path` 真正进入本地数据库。
- 执行真实提交流程：覆盖游客提交、登录提交、重复提交，验证 `source_type/source_path` 落库和 2 分钟去重命中。
- 执行后台联通验证：确认 `/admin/feedback` 列表/详情可见新增记录，确认状态与字段回显一致。
- 执行通知验证：确认反馈收到/反馈回复相关通知在 UI 中不再出现无效深链。

### T-022.5 体验清理结论（2026-03-30）
- 文案国际化：反馈浮窗 tooltip、反馈弹窗全部字段/提示/按钮/成功失败 toast，以及 `/help` 页面内的支持文案，已全部接入 `translations.support`，跟随用户语言设置切换。
- 入口文案统一：右下角入口与 `/help` 页面内的反馈入口现在共用同一套 support 文案语义，不再出现一边中文、一边英文或文案口径漂移。
- 动效收口：右下角浮标默认不再持续播放呼吸灯；仅在鼠标 `hover` 到按钮上，或键盘 `focus-visible` 到按钮时，才触发光晕/呼吸灯效果。
- 未登录态表达：匿名用户邮箱字段的“必填”提示、登录用户的“账号邮箱”提示，都已改为随语言切换的明确文案，减少误解。

### T-022.5 开发内容
- 更新 `src/lib/translations.ts`：
- 为 `en/zh/ms` 三套语言新增 `support` 文案域，覆盖 feedback widget、feedback modal、`/help` 页面支持区块与分类列表。
- 更新 `src/components/support/FeedbackWidget.tsx`：
- tooltip 文案改为读取 `t.support.widgetLabel`。
- 移除默认常驻呼吸灯，改为仅在 `hover/focus-visible` 时显示光晕与 ping 动效。
- 更新 `src/components/support/FeedbackModal.tsx`：
- 标题、描述、字段 label、placeholder、说明文案、按钮、success/error toast 全部切换到 `t.support`。
- 更新 `src/app/(marketing)/help/page.tsx`：
- Hero、FAQ、Support 区块、卡片标题/说明、分类列表全部切换到 `t.support`，与 feedback 弹窗保持同一语言源。

### T-022.5 验证步骤
- 静态验证：
- 检索确认 feedback 组件和 `/help` 页面中的原始硬编码单语文案已清理，不再残留旧的英文/中文写死文本。
- 代码校验：
- 执行 `pnpm exec eslint src/lib/translations.ts src/components/support/FeedbackWidget.tsx src/components/support/FeedbackModal.tsx 'src/app/(marketing)/help/page.tsx'`，结果通过。

### T-022.5 未覆盖项
- 未执行浏览器级多语言切换验证：尚未实际切换 `zh/en/ms` 查看 tooltip、modal 和 `/help` 页面文案是否逐项正确渲染。
- 未执行浏览器级动效验证：尚未实际用鼠标 hover / 键盘 focus 检查右下角浮标是否只在交互时出现呼吸灯。
- 未执行移动端视觉验证：虽然已完成样式与文案收口，但未在真实手机视口下检查最终视觉效果。

### T-022.6 验证闭环结论（2026-03-30）
- 数据库 schema 已真正落库：`user_feedbacks.source_type/source_path` 已按 `019_t0224_user_feedback_source_fields.sql` 的语义进入数据库，并通过 `information_schema.columns` 核对成功。
- 游客提交流程已打通：在 `/help` 页面实测确认右下角浮标隐藏、页内反馈弹窗可正常开关、游客提交成功、再次提交同内容时命中 2 分钟去重且数据库只保留 1 条记录。
- 登录态提交流程已打通：新注册账号在 Dashboard 右下角浮标打开弹窗时可预填账号邮箱且邮箱输入框禁用；提交成功后数据库记录带 `userId`、`sourceType="floating-widget"`、`sourcePath="/dashboard"`。
- 后台联通已打通：将该测试账号提升为 `ADMIN` 后，实测 `/admin/feedback` 可以直接看到刚提交的登录态反馈记录。
- 移动端避让已验证：登录态移动端视口下，右下角 feedback 浮标位置高于底部 `BottomTabBar`，不再压住底部导航。
- 通知深链已收口：登录态 feedback 提交后生成的站内通知 `link` 为 `null`，已不再写入失效的 `/dashboard/settings?tab=feedback`。

### T-022.6 开发内容
- 更新 `src/actions/support/ticket.ts`：
- `submitFeedback` 不再直接依赖 `getCurrentUser()` 作为前置条件，改为走“请求头透传 userId 优先、Supabase server session 兜底”的轻量 viewer 解析，避免匿名提交在 server action 环境下直接抛错。
- `userFeedback.create()` 改为在登录态下使用 `user.connect` 关联用户，而不是传裸 `userId` 标量，兼容当前 Prisma client 的 create input 形态。
- 在开发环境下保留 `submitFeedback` 的真实异常回传，便于定位本轮 server action / Prisma client 不一致问题；生产环境仍返回通用错误。
- 更新 `src/app/layout.tsx`：
- 从服务端请求上下文读取当前用户邮箱，并将 `viewerEmail` 下发给全站 `FeedbackWidget`。
- 将 `FeedbackWidget` 移回 `AppProvider` 树内，避免继续命中 `useApp fallback`。
- 更新 `src/components/support/FeedbackWidget.tsx` 与 `src/components/support/FeedbackModal.tsx`：
- `FeedbackWidget` 接收 `viewerEmail` 并继续透传给 `FeedbackModal`。
- `FeedbackModal` 优先使用服务端透传的 `viewerEmail` 初始化登录态邮箱与禁用态，仅在没有服务端邮箱时才回退到浏览器 Supabase session 自查。
- 本地验证环境处理：
- 重新执行 `pnpm prisma generate`，并重启 `localhost:3000` 的 Next dev server，确保本地服务进程吃到新的 Prisma client。

### T-022.6 验证步骤
- 数据验证：
- 使用 Prisma 直连数据库执行与 migration 等价的 SQL：
- `ALTER TABLE public.user_feedbacks ADD COLUMN IF NOT EXISTS source_type text`
- `ALTER TABLE public.user_feedbacks ADD COLUMN IF NOT EXISTS source_path text`
- 再通过 `information_schema.columns` 核对 `source_type/source_path` 已存在。
- 浏览器验证：
- 使用 Playwright headless 在 `/help` 实测游客流程，验证弹窗开关、`/help` 右下角浮标隐藏、首次提交成功与重复提交成功提示。
- 使用 Playwright headless 在注册新账号后实测登录态流程，验证邮箱预填、邮箱禁用、右下角浮标提交通路、Admin 页面可见性与移动端底部导航避让。
- 数据核账：
- 游客案例：
- `email=codex.feedback.guest.1774884228173@example.com`
- 核对结果：数据库中仅 1 条记录，`sourceType="help-page"`、`sourcePath="/help"`、`userId=null`。
- 登录态案例：
- `email=codex.feedback.user.1774884660237@example.com`
- 核对结果：数据库记录存在，`sourceType="floating-widget"`、`sourcePath="/dashboard"`、`userId` 为该测试用户 id。
- 通知验证：
- 查询登录态测试用户最新 `Feedback Received` 通知，确认 `link=null`。
- 代码校验：
- 执行 `pnpm exec eslint src/actions/support/ticket.ts src/app/layout.tsx src/components/support/FeedbackWidget.tsx src/components/support/FeedbackModal.tsx`，结果通过。

### T-022.6 未覆盖项
- 未执行 `prisma db execute --file ...` 命令形态的 migration 留证：该命令在当前本机环境下持续卡住未返回，因此本步改为执行同一份 SQL 语义并用数据库元数据核账，功能结果已验证，但 CLI 形态留证缺失。
- 未执行通知 UI 点击验证：本步确认的是数据库中的通知 `link` 已为空，不再生成失效深链；尚未在通知中心 UI 中实际点击该条通知。
- 未执行 `/admin/feedback/[id]` 详情页验证：本步只验证了列表可见性，未继续点入详情页核对来源字段展示。

## 2026-03-31 补充验证与运行修复记录
### T-022 浏览器补充验证（2026-03-31）
- 多语言浏览器验证：
- 使用 Playwright headless 分别在 `zh/en/ms` 三种语言 cookie + localStorage 状态下打开 `/help`。
- 实测结果：
- `zh`：`helpTitle=我们可以如何帮助您？`，`sendMessageTitle=发送消息`，`modalTitle=分享您的想法`，`submitLabel=发送反馈`。
- `en`：`helpTitle=How can we help you?`，`sendMessageTitle=Send a Message`，`modalTitle=Share your thoughts`，`submitLabel=Send feedback`。
- `ms`：`helpTitle=Bagaimana kami boleh membantu anda?`，`sendMessageTitle=Hantar mesej`，`modalTitle=Kongsi pandangan anda`，`submitLabel=Hantar maklum balas`。
- 结论：`T-022.5` 中“多语言未做浏览器验证”的遗留项已关闭。
- 动效浏览器验证：
- 使用 Playwright 在登录态 Dashboard 实测右下角 widget 的默认、`hover`、`focus` 三种状态。
- 实测结果：
- 默认态：两个装饰 `span` 的 `opacity=0`，呼吸灯 `animationName=none`。
- `hover` 后：第一层光晕 `opacity=1`；第二层呼吸灯 `animationName=ping` 且 `opacity>0`。
- `focus` 后：光晕保持可见，第二层呼吸灯仍然进入 `ping`。
- 结论：浮标默认静止，只在 `hover/focus-visible` 出现动效，`T-022.5` 中“动效未做浏览器验证”的遗留项已关闭。
- 移动端浏览器验证：
- 使用 Playwright 在 `390x844` 视口登录态 Dashboard 实测底部导航与 widget 位置关系，并留存截图：
- 截图路径：`.codex/artifacts/t0226-mobile-dashboard.png`
- 实测结果：`BottomTabBar.y=779`，widget 底边 `y+height=764`，明确位于底部导航之上。
- 结论：`T-022.5` 中“移动端视觉未验证”的遗留项已关闭。

### T-022 浏览器补充回归（2026-03-31）
- 使用 Playwright 再次执行登录态 feedback 提交冒烟：
- `email=codex.browser.check.1774907451943@example.com`
- `feedbackTitle=T0226 Browser 1774907451943`
- 结果：提交成功，未再复现 `sourceType` / `sourcePath` 的 PrismaClientValidationError。
- Dev server 日志回归结果：
- 已观察到 `POST /dashboard 200`、`POST /help 200` 的正常提交日志，未再出现你截图中的 `Unknown argument 'sourceType'` 报错。
- 新暴露的非阻塞问题：
- Resend 仍返回 `403 The learnmore.com domain is not verified`。
- 该问题不阻塞 feedback 落库与后台可见性，因为确认邮件是 fire-and-forget；但它会导致确认邮件发送失败，应作为后续邮件基础设施问题单独处理。

### 开发环境运行时修复（2026-03-31）
- 将 `src/middleware.ts` 迁移为 `src/proxy.ts`，消除 Next 16 的 `middleware file convention is deprecated` 启动告警。
- 为 `proxy.ts` 中的 `supabase.auth.getUser()` 增加网络失败兜底：
- 当 Supabase 鉴权请求在开发环境中出现瞬时 `fetch failed` 时，不再直接把异常栈打到终端并中断代理链路，而是降级为匿名访问继续处理公开路由。
- 启动回归结果：
- `pnpm run dev` 启动后不再出现 `middleware` 弃用告警。
- 通过 `curl -I http://localhost:3000/help` 与 `curl -I http://localhost:3000/dashboard` 回归，公开页返回 `200`、受保护页在游客态正常 `307 -> /login`，终端未再出现 Supabase `fetch failed` 栈。
- `baseline-browser-mapping` 过期提示修复：
- 新增 `scripts/patch-baseline-browser-mapping.mjs`，在 `postinstall` 与 `dev` 启动前自动补丁 `baseline-browser-mapping` 及 `next/dist/compiled/browserslist/index.js` 中的过期提示逻辑。
- `package.json` 中补充直接依赖 `baseline-browser-mapping@2.10.12`，并将 `dev` 脚本改为先执行补丁再启动 `next dev`。
- 启动回归结果：
- 重新执行 `pnpm run dev` 后，终端不再出现 `[baseline-browser-mapping] The data in this module is over two months old...` 提示。
- Tailwind 歧义告警修复：
- 将 `src/components/practice/PracticeView/TrainingModeCards.tsx` 中的 `ease-[cubic-bezier(0.22,1,0.36,1)]` 从类名移出，改为通过 `style.transitionTimingFunction` 设置，避免 Tailwind 将其解析为歧义 utility。
- 验证结果：
- 执行 `pnpm exec eslint scripts/patch-baseline-browser-mapping.mjs src/components/practice/PracticeView/TrainingModeCards.tsx` 通过。
- 执行全仓检索 `rg -n "ease-\\[cubic-bezier\\(" src` 无命中，确认歧义类名已彻底移除。
- `PageHeroShell` hydration 错误修复：
- `src/components/shared/PageHeroShell.tsx` 现在会在 `title/subtitle` 为纯文本时使用语义化 `h1/p`，在传入复杂节点（例如 loading skeleton）时自动改用 `div` / `role=heading` 容器，避免 `div` 被渲染进 `h1/p` 导致 hydration 报错。
- 验证结果：
- 执行 `pnpm exec eslint src/components/shared/PageHeroShell.tsx src/components/loading/dashboard-route-loading.tsx src/components/ui/skeleton.tsx` 通过。
- 执行 `pnpm exec tsc --noEmit --pretty false 2>&1 | rg "src/components/shared/PageHeroShell.tsx|src/components/loading/dashboard-route-loading.tsx|src/components/ui/skeleton.tsx"` 无命中。
- 浏览器级留证未完成：
- 当前 Playwright 在本机现有 Chrome session 影响下无法启动独立持久上下文，因此本次未补到 `/dashboard/practice` 页面级浏览器编译留证；本轮以 `dev` 启动日志消失 + 代码检索无残留作为完成依据。

## T-023 `/admin/content/reports` 真数据收口
| id | description | owner | status |
|---|---|---|---|
| T-023.1 | 盘点 `/admin/content/reports` 当前图表、筛选、列表、抽屉、CTA 与 `MOCK_REPORTS` 占位点，映射到真实服务 `getQuestionReports` / `getContentStats` / `resolveReport` / `bulkResolveReports` | codex | done |
| T-023.2 | 建立页面字段与权威数据源矩阵：报错状态、问题类型、题目信息、提交人信息、时间窗口、待处理数、处理时效、统计卡口径 | codex | done |
| T-023.3 | 细拆用户侧报错入口：明确 reports 应挂载的路由/组件、前台提交入口、做题场景触发点与 `reportQuestion` 调用边界 | codex | done |
| T-023.4 | 对齐读取链路：服务端首屏数据、客户端筛选/搜索、时间窗口、统计聚合、空态与无权限态，替换 `MOCK_REPORTS` | codex | done |
| T-023.5 | 对齐写链路：单条处理、批量处理、状态流转、`reportCount` 增减语义、幂等与重复处理提示 | codex | done |
| T-023.6 | 清理假图表、假统计、假详情抽屉、前端硬编码状态枚举与时间文案，补齐错误态、空态、权限态与处理中反馈 | codex | done |
| T-023.7 | 完成页面验证：列表/统计核账、筛选搜索验证、处理动作核账、重复处理验证与前后端状态一致性验证 | codex | done |

### T-023.1 盘点结论（已完成）
- 当前 `/admin/content/reports` 页面仍然是 client-only 结构，首屏由 `ReportsClient` 自己维护筛选、统计和抽屉状态，没有接入服务端首屏数据。
- `ReportsClient` 里的列表、筛选、统计全部还在读取 `MOCK_REPORTS`，时间窗口、状态筛选、问题类型筛选和搜索都只是本地过滤。
- `ReportsTable` 的分页控件目前是静态占位，上一页/下一页按钮没有真正接服务端分页，也没有把页码写回 URL。
- `ReportDetailsDrawer` 里的处理动作按钮目前也还是静态 UI，没有直接触发 `resolveReport` / `bulkResolveReports`。
- `question-service.ts` 里已经存在真实服务 `getQuestionReports` / `getContentStats` / `resolveReport` / `bulkResolveReports`，但还没有被 reports 页面消费。
- 下一步要先把页面的数据源矩阵和读取边界定死，再决定是直接接服务端数据，还是先补一层 admin reports API route。

### T-023.2 页面字段与权威数据源矩阵（已完成）
- 页面展示层级：
  - 概览区：待处理报错、已解决、平均处理时效、问题类型分布/高频类型。
  - 列表区：反馈人、报错类型、题目预览、课程/科目、状态、时间、操作。
  - 详情抽屉：提交人、题目信息、用户报错内容、系统正确答案/用户建议答案、处理动作。

- 权威数据源：
  - 列表与筛选：`getQuestionReports`
  - 统计卡：`getContentStats`
  - 单条处理：`resolveReport`
  - 批量处理：`bulkResolveReports`
  - 题目上下文：`question` relation + `question.options`
  - 提交人上下文：`user` relation

- 页面字段矩阵：
  - `report.status`：页面主状态、筛选条件、处理动作结果回显。
  - `report.issueType`：问题类型标签与筛选。
  - `report.question.id / text / subject`：列表主文案、详情标题与上下文。
  - `report.user.name / avatar / role`：提交者信息。
  - `report.comment`：用户反馈正文。
  - `report.createdAt`：列表时间、统计窗口计算依据。
  - `report.reviewedAt / reviewedBy / resolution`：处理历史与详情回显。
  - `reportCount` / `pendingReports`：统计卡与列表标题口径。

- 统计口径：
  - 待处理数：当前 `status = PENDING` 的报错量。
  - 平均处理时效：已处理记录的创建时间到处理时间的平均差值。
  - 高影响问题类型：按报错类型聚合。
  - 时间窗口：`7d / 30d / all`，需要与列表和统计卡一致。

- 处理边界：
  - 只要进入真实数据源阶段，页面状态就不能再由 `MOCK_REPORTS` 驱动。
  - 详情抽屉的处理按钮必须直连真实写链路，避免 UI 和数据不同步。

- 下一步：
  - 先把用户侧报错入口、路由归属和组件挂载点定清楚，再决定 `reports` 页面是否需要单独读取层。

- 收口记录：
  - `T-023.2` 已完成并收口，页面字段、权威数据源、统计口径、处理边界与副作用口径均已定稿，为后续读取/写入链路提供统一基线。

### T-023.3 用户侧报错入口映射（已完成）
- 入口语义：
  - `reports` 不是全站通用反馈，不应该从 `/help` 或右下角 feedback 浮标提交。
  - 它属于“题目报错 / 纠错”链路，提交前必须带题目上下文与报错类型。

- 目标路由 / 页面：
  - 当前应挂在做题相关页面，而不是 Admin 页面或 Help 页面。
  - 候选位置包括题目作答页、章节练习页、训练结果页中的题目卡片。
  - 入口必须能拿到 `questionId`、`issueType`、`reportedBy`、`description` 这些最小提交上下文。

- 组件挂载点：
  - 题目卡片本体、题目操作菜单、移动端长按菜单，都是可行挂载点。
  - 目前仓库里只有 `src/components/mobile/LongPressMenu.tsx` 预留了“举报”菜单项，但没有真正接入题目组件。
  - 需要继续检查 `QuestionCard`、`QuestionContent`、`QuestionReviewDrawer`、`Practice` 相关容器，决定正式入口挂在哪里最合理。

- 当前代码结论：
  - 后端写入函数 `reportQuestion(...)` 已存在于 `src/actions/content-pipeline/question-service.ts`。
  - 前台还没有找到任何地方真正调用它。
  - 所以这一子任务的目标不是写后台，而是先把前台入口和路由边界理清楚。

- 收口目标：
  - 明确 `reports` 的用户侧入口应该落在哪些页面。
  - 明确前台组件层级怎么接 `reportQuestion(...)`。
  - 明确这条链路和 `feedback` 的区别，避免未来重复做一套通用反馈入口。

- 收口记录：
  - `T-023.3` 已完成并收口，用户侧报错入口已统一为练习中心题目右上角问号按钮，点击后打开报错弹窗并调用 `reportQuestion(...)`。

### T-023.4 读取链路对齐（已完成）
> 本节聚焦 `/admin/content/reports` 的真实数据读取、筛选、统计、详情回显与空态/越权态收口，确保页面不再依赖 `MOCK_REPORTS`。

- 服务端首屏数据：
  - 列表首屏已改为真实数据读取，支持按页加载并同步解析查询参数。
  - 概览卡与时间窗口真实联动，不再使用 mock 统计值。

- 客户端筛选 / 搜索：
  - 状态筛选、分类筛选、关键词搜索、分页均已接入真实查询。
  - 交互更新会回写 URL，便于刷新、分享和前进/后退保持同一视图。

- 详情回显 / 空态 / 越权态：
  - 详情抽屉加载真实报错记录、提交人信息、处理历史与处理动作。
  - 列表空态、详情空态、管理员越权态、非管理员访问态均有明确反馈。

- 收口记录：
  - `T-023.4` 已完成并收口，`/admin/content/reports` 的读取链路已切到真实数据源，`MOCK_REPORTS` 不再是页面主驱动。

### T-023.5 写链路对齐（已完成）
> 本节承接单条处理、批量处理、状态流转、`reportCount` 语义、幂等与重复处理提示，确保管理端写动作和前端读取链路一致。

- 单条处理：
  - `resolveReport(...)` 现在承接单条报错状态更新。
  - 允许从当前状态流转到 `REVIEWING / RESOLVED / REJECTED`，并按最终态统一回写结果。

- 批量处理：
  - `bulkResolveReports(...)` 已接入批量状态流转。
  - 列表页已增加批量选择与批量处理工具条，可直接对当前页多条报错执行统一处理。

- `reportCount` 语义：
  - 当报错从非终态流转到终态时，关联题目的 `reportCount` 会递减。
  - 重复处理不会重复递减，避免计数失真。

- 幂等与重复处理提示：
  - 同一条报错在同一状态、同一处理人、同一处理说明下重复提交时，会被识别为重复写入并短路为成功。
  - 终态报错再次提交会直接提示已处理，不再重复执行副作用。

- 浏览器验证：
  - 已验证登录管理员后进入 `/admin/content/reports`，能正常看到批量选择入口、批量处理按钮、单条抽屉处理工作台，以及处理后的详情回显。
  - 本轮浏览器回归未发现控制台错误。

- 收口记录：
  - `T-023.5` 已完成并收口，单条处理、批量处理、状态流转、`reportCount` 增减语义与重复处理提示均已接通并通过浏览器回归。

### T-023.6 假数据与错误态清理（已完成）
> 本节用于清理 `/admin/content/reports` 页面残留的 mock 图表、mock 统计、硬编码详情壳和不完整错误态，确保页面在真实数据、空态、异常态和权限态下都能稳定展示。

- 假图表 / 假统计：
  - 统计卡与概览数据已切到真实 `question_reports` 聚合，不再依赖前端 mock 数据。
  - 页面首屏统计与列表数据分离加载，避免某一侧失败时整体失效。

- 假详情抽屉：
  - 详情抽屉不再展示题目正文、题目选项和标准答案。
  - 仅保留处理工作台所需的信息：顶部状态栏、处理时间线、处理工作台。
  - 抽屉在报告缺失时会展示可恢复的 fallback UI，而不是空白或崩溃。

- 硬编码状态枚举与时间文案：
  - 前端硬编码的假状态展示已收口为真实状态枚举。
  - 时间统计与平均处理时效口径已改为服务端聚合输出，不再由前端拼接伪文案。

- 错误态 / 空态 / 权限态：
  - 页面级加载失败会展示可重试的错误提示。
  - 详情缺失时会展示“报错详情不可用”的 fallback。
  - 管理员越权、无数据和加载失败状态均有明确提示，不再出现静默失败。

- 中间态反馈：
  - 批量处理、单条处理与刷新都会给出明确的处理反馈。
  - 抽屉与列表在数据恢复后保持可继续操作，不会因为局部错误彻底退出工作流。

- 收口记录：
  - `T-023.6` 已完成并收口，`/admin/content/reports` 的假图表、假统计、假详情壳与不完整错误态均已清理，页面在真实数据与异常边界下都能稳定运行。

### T-023.7 页面验证与状态核账（已完成）
> 本节用于把 `/admin/content/reports` 的最终可用性做一次完整核账，确保列表、统计、筛选、处理动作、重复处理与前后端状态一致性都已经闭环。

- 列表 / 统计核账：
  - 首屏统计卡、列表条目数、分页口径与真实 `question_reports` 数据一致。
  - 统计卡不再依赖 mock，页面刷新后仍可从服务端重新计算。

- 筛选 / 搜索验证：
  - 状态筛选、分类筛选、关键词搜索和分页都能稳定回写 URL。
  - 刷新、前进/后退后筛选条件仍可恢复，列表结果不丢失。

- 处理动作核账：
  - 单条处理、批量处理、时间线回显、详情抽屉工作台均可正常使用。
  - 处理完成后列表状态、详情状态与时间线状态保持一致。

- 重复处理验证：
  - 同一条报错在同一状态、同一处理人、同一处理说明下重复提交会被识别为幂等请求。
  - 重复批量处理不会重复写入事件或错误地重复变更状态。

- 前后端状态一致性：
  - `resolveReport` / `bulkResolveReports` 的状态流转结果，能在详情抽屉与列表中同步回显。
  - `reportCount` 递减语义与终态处理行为一致，避免统计失真。

- 浏览器回归：
  - 已完成管理员登录、进入 `/admin/content/reports`、查看统计与列表、打开详情抽屉、执行批量处理与单条处理后的冒烟验证。
  - 本轮回归未发现控制台错误，页面可继续交互。

- 收口记录：
  - `T-023.7` 已完成并收口，列表/统计核账、筛选搜索验证、处理动作核账、重复处理验证与前后端状态一致性验证均已完成。

## T-024 `/admin/feedback` 管理闭环收口
| id | description | owner | status |
|---|---|---|---|
| T-024.1 | 盘点 `/admin/feedback`、`/admin/feedback/[id]` 的列表、概览、详情、回复动作与当前前台 Feedback 提交字段映射 | codex | done |
| T-024.2 | 建立反馈管理字段矩阵：状态、分类、提交人、邮箱、来源、回复内容、回复人、回复时间、通知/邮件副作用与权限边界 | codex | done |
| T-024.3 | 对齐读取链路：列表筛选、概览卡、详情回显、来源定位、前台提交记录回流与空态/越权态 | codex | done |
| T-024.4 | 对齐写链路：回复、状态流转、重复回复语义、通知与邮件副作用、权限校验与幂等 | codex | done |
| T-024.5 | 清理假状态流、假成功提示、未定义来源字段与不完整详情态，补齐错误态、空态与越权态 | codex | done |
| T-024.6 | 完成闭环验证：前台提交 -> 后台可见 -> 后台处理 -> 状态/通知/邮件回显一致性验证 | codex | done |

### T-024.2 反馈管理字段矩阵（v1）
> 本节用于统一后台反馈详情页、列表页、处理时间线与写链路的字段口径。规则分为四类：`展示字段`、`可编辑字段`、`内部存储字段`、`副作用与权限边界`。

- `status` 工单状态
  - 值域：`PENDING / IN_PROGRESS / RESOLVED / REJECTED / CLOSED`
  - 展示：列表、详情顶部状态、时间线、处理工作台 `Next Status`
  - 可编辑：管理员可改；用户不可改
  - 存储：`user_feedbacks.status`
  - 副作用：每次变更都要写 `user_feedback_events`

- `category` 反馈分类
  - 值域：`BUG / FEATURE / SUGGESTION / BILLING / CONTENT_ISSUE / OTHER`
  - 展示：列表、详情顶部标签、筛选条件
  - 可编辑：提交后不可改
  - 存储：`user_feedbacks.category`
  - 副作用：提交时写入 `SUBMITTED` 事件 metadata

- `user` 提交人信息
  - 展示：用户名、角色、头像、用户 ID
  - 可编辑：不可改
  - 存储：`user_feedbacks.userId` + `user` relation
  - 副作用：登录态提交时用于自动识别身份；匿名用户则为空

- `email` 联系邮箱
  - 展示：列表、详情、回复发送目标
  - 可编辑：
    - 登录用户：前台自动预填且禁止修改
    - 匿名用户：前台必填
    - 后台管理员：只读，不直接编辑原始反馈邮箱
  - 存储：`user_feedbacks.email`
  - 副作用：提交确认邮件、管理员回复邮件都发送到该地址

- `sourceType / sourcePath` 来源
  - 值域：例如 `floating-widget / help-page`
  - 展示：作为内部定位信息保留在详情数据中，当前详情 UI 不作为主视觉字段展示
  - 可编辑：提交时写入，后续只读
  - 存储：`user_feedbacks.sourceType`、`user_feedbacks.sourcePath`
  - 副作用：提交事件 `metadata` 需要同步记录来源，便于排查入口问题

- `title` 标题
  - 展示：列表主标题、详情顶部标题
  - 可编辑：提交后不可改
  - 存储：`user_feedbacks.title`
  - 副作用：管理员回复邮件主题、通知文案可引用

- `content` 反馈正文
  - 展示：列表摘要、详情原文、历史事件快照
  - 可编辑：提交后不可改
  - 存储：`user_feedbacks.content`
  - 副作用：提交确认邮件、回复邮件正文可引用

- `adminReply` 回复内容
  - 展示：详情时间线、回复回显、回复邮件正文
  - 可编辑：管理员回复时写入；后续以事件流为准，不做手工直接修改
  - 存储：`user_feedbacks.adminReply`
  - 副作用：回复后创建 `REPLIED` / `CLOSED` 事件，并触发邮件与站内通知

- `repliedBy / responder` 回复人
  - 展示：详情页与时间线中的操作者
  - 可编辑：不可改
  - 存储：`user_feedbacks.repliedBy` + `responder` relation
  - 副作用：用于审计与时间线归因

- `repliedAt` 回复时间
  - 展示：详情页时间线、状态轨迹
  - 可编辑：不可改
  - 存储：`user_feedbacks.repliedAt`
  - 副作用：用于旧数据补合成 timeline

- `events` 处理历史
  - 展示：详情页时间线
  - 可编辑：不可直接改，只能通过动作生成
  - 存储：`user_feedback_events`
  - 副作用：提交、状态变更、回复、关闭都必须生成对应事件

- `attachments` 附件
  - 展示：本轮不做上传 UI
  - 可编辑：暂不开放
  - 存储：`user_feedbacks.attachments`
  - 副作用：保留字段口径，但不进入当前处理闭环

- 通知 / 邮件副作用
  - 提交时：发送确认邮件；登录用户额外创建站内 `Feedback Received` 通知
  - 回复时：发送回复邮件；登录用户额外创建站内 `FEEDBACK_REPLY` 通知
  - 权限边界：
    - 用户可提交自己的反馈；匿名可提交但必须提供邮箱
    - `ADMIN` 可查看列表、详情、执行回复与状态变更
    - 非 `ADMIN` 只能查看自己的反馈详情
    - 后台工作台的读取接口对管理员使用专用加载器，避免作者可见性误拦截

### T-024.3 读取链路对齐（已完成）
> 本节聚焦列表筛选、概览卡、详情回显、来源定位、前台提交记录回流与空态 / 越权态的统一口径。

- 列表筛选：
  - 状态筛选、分类筛选、关键词搜索均走真实查询，分页参数已接入首屏与交互更新。
  - 列表行点击后进入右侧抽屉，保持处理流在同一工作区内完成。
  - 当前列表页首屏读取已经改为同步解析 `search / status / category / page` 查询参数，筛选条件会回写到 URL，便于刷新、分享和前进/后退保持同一视图。

- 概览卡：
  - `7D / 30D / ALL` 时间窗已真实联动。
  - 概览卡当前使用真实统计值，不再依赖 mock。

- 详情回显：
  - 详情页加载时返回 `user / responder / events`，并按真实事件流回显处理时间线。
  - 顶部保留标题、ticket ID、提交时间、提交者信息、提交者身份，避免信息重复。

- 来源定位：
  - `sourceType / sourcePath` 已进入详情数据与提交事件 metadata。
  - 详情页会以低优先级元信息展示来源，便于排查入口来源，但不占用主状态栏。

- 前台提交记录回流：
  - 用户在前台提交后的记录会通过真实列表/详情读取链路回流到 `/admin/feedback`。
  - 登录用户在前台提交时同步创建站内通知，便于用户侧确认反馈已受理。

- 空态 / 越权态：
  - 列表空态、详情空态、管理员越权态、非管理员访问态需要保持明确反馈。
  - 管理后台抽屉详情使用专用管理员加载器，避免作者可见性逻辑误拦截。

- 收口记录：
  - `T-024.3` 已完成并收口，列表筛选、概览卡、详情回显、来源定位、空态/越权态与 URL 读写链路均已对齐，且详情页来源信息已在次级元信息中可见。

### T-024.4 写链路对齐（已完成）
> 本节聚焦回复、状态流转、重复回复语义、通知与邮件副作用、权限校验与幂等的最终收口。

- 回复链路：
  - `replyToFeedback` 会在管理员提交公共回复时同步更新 `user_feedbacks.status / adminReply / repliedAt / repliedBy`，并写入 `REPLIED` 或 `CLOSED` 事件。
  - 公共回复会同时触发回复邮件与站内 `FEEDBACK_REPLY` 通知；邮件采用 fire-and-forget，不阻断主流程。

- 状态流转：
  - `updateFeedbackStatus` 独立承接纯状态流转，写入 `STATUS_CHANGED` 或 `CLOSED` 事件。
  - `Internal Note` 模式与 `Next Status` 仍保持绑定，内部备注会同步推进工单状态。

- 重复语义 / 幂等：
  - 同一管理员在短时间内重复提交完全相同的回复或状态更新，会命中幂等判断，返回成功但不再新增事件、通知或邮件副作用。
  - 这次浏览器回归已验证：公共回复重复提交不会再额外新增事件/通知；内部备注重复提交不会再额外新增事件。

- 权限边界：
  - 写链路仅允许 `ADMIN` 触发，非管理员会直接返回 `Unauthorized`。
  - 匿名反馈回复仅走邮件，不生成站内用户通知；登录用户则额外获得站内通知。

- 收口记录：
  - `T-024.4` 已完成并收口，回复、状态流转、通知、邮件、权限和幂等都已通过定向校验与浏览器回归验证。

### T-024.5 假状态与错误态收口（已完成）
> 本节用于清理反馈详情抽屉中的占位感与失败即关闭的问题，确保错误态、空态与越权态都可见、可重试、可返回。

- 假状态流清理：
  - `/admin/feedback` 右侧抽屉现在不再出现“失败即直接关闭”的假成功体验；加载失败会保留抽屉并显示明确错误态。
  - 列表项点击时会先带上队列标题作为预览标题，避免加载阶段只显示空壳标题。

- 未定义来源字段清理：
  - `FeedbackDetailView` 里的来源展示已改为来源映射 + 原始路径的组合形式；未提供来源时不显示空壳块，避免出现 `未记录 / undefined / N/A` 之类的占位值。
  - 顶部状态栏继续只保留标题、ticket ID、提交时间、提交者信息、提交者身份，不把来源抬成主信息。

- 不完整详情态补齐：
  - 抽屉详情加载失败时，页面内展示加载失败、404 与越权态，提供重试、重新登录与关闭抽屉动作。
  - 错误态不再通过自动关闭抽屉来“伪装成功”，而是保持当前上下文供管理员继续处理。

- 浏览器验证：
  - 使用 Playwright 完成管理员登录、进入 `/admin/feedback`、点击队列记录打开抽屉、等待详情加载完成、核对标题/来源/邮箱展示以及错误接口返回码验证。
  - 浏览器回归确认：抽屉加载态正常、来源块存在但不显示 `N/A` / `未提供邮箱`；对一个不存在但格式合法的 feedback ID，详情接口返回 `404 / Feedback not found`，可供前端错误态正确映射。

- 收口记录：
  - `T-024.5` 已完成并收口，假状态、来源占位、抽屉错误态与越权态均已对齐。

### T-024.6 完成闭环验证（已完成）
> 本节用于验证前台提交、后台可见、后台处理、状态流转、站内通知与邮件副作用的完整闭环，确认反馈链路已经可投入使用。

- 前台提交验证：
  - 游客通过 `/help` 页面发送反馈后，数据成功落入 `user_feedbacks`，并正确写入 `sourceType = help-page` 与 `sourcePath = /help`。
  - 登录用户通过同一入口发送反馈后，邮箱自动回填为当前账号邮箱，提交记录绑定当前用户。

- 后台可见与处理验证：
  - `/admin/feedback` 列表能正确检索到前台新提交的反馈记录。
  - 管理员在详情抽屉中可完成回复与状态更新，事件流会同步追加到真实时间线。
  - 回复、状态变更与重复提交的幂等行为均已核对，主流程不会重复写入。

- 通知与邮件验证：
  - 登录用户收到站内 `FEEDBACK_REPLY` 通知，通知内容与反馈标题、状态保持一致。
  - 邮件副作用按 best-effort 方式处理，主流程不依赖邮件成功返回。

- 浏览器验证：
  - 使用 Playwright 完成游客提交、登录提交、后台打开详情、发送回复、更新状态的整条回归验证。
  - 核对结果显示前台提交、后台可见、后台处理、状态回流与通知创建均正常工作。

- 收口记录：
  - `T-024.6` 已完成并收口，前台提交 -> 后台可见 -> 后台处理 -> 状态/通知/邮件回显的一整条闭环已通过浏览器与数据库验证。

### T-024.7 详情页工作台与刷新入口（2026-03-31）
> 颗粒度对齐：本轮重点是把 `/admin/feedback/[id]` 的“处理工作台”做成可直接用于管理流的右侧弹出卡片 UI（从队列点击触发），并确保 Public Reply / Internal Note 的表单语义与回显/时间线口径一致。
>
> 注意：本轮“附件功能明确延期”已被你确认暂不纳入处理工作（因此此条不再作为 UI 必改项）。

- 详情页交互载体调整纳入本轮：
  - 点击 `/admin/feedback` 反馈队列中的任意一条记录后，不再整页跳转到 `/admin/feedback/[id]`
  - 改为在页面**右侧弹出卡片**承载该 `id` 的详情内容（参考截图1）
  - 队列最右侧“操作”列取消，整行点击即进入处理抽屉
  - 右侧弹出卡片宽度比第一版进一步加大，以容纳更清晰的状态栏、时间线和工作台布局

- 弹出卡片内信息结构（从上到下三段式）纳入本轮：
  - 顶部状态栏包含：标题、ticket ID、提交时间、提交者信息、提交者身份（参考截图2）
  - 状态栏下为：处理时间线
  - 时间线下为：处理工作台

- 处理工作台表单与控件纳入本轮（参考截图2/3）：
  - 输入内容：支持管理员输入（Public Reply / Internal Note 模式切换后 placeholder 与按钮文案变化）
  - 工单状态（可变更）：必须可选择变更（下拉/按钮切换，和截图2一致）
  - 模版：必须提供 Templates 入口/选择器（和截图2一致）
  - 控件布局需要避免文字重叠与视觉挤压，分区必须清晰可读

- Public Reply / Internal Note 模式纳入本轮：
  - Public Reply：placeholder 为 `Type a public reply...`，主按钮为 `Send Reply`
  - Internal Note：placeholder 为 `Type an internal note (only visible to admins)...`，主按钮为 `Add Note`
  - 模式切换需有明确选中态，切换后表单语义与文案一致

- 状态变更行为口径纳入本轮：
  - 选项B：Internal Note 提交也需要带上 Next Status，并会改变工单状态（与 Public Reply 一致的状态流转机制）

- Refresh 行为纳入本轮：
  - 详情卡需要支持“刷新/重载”以拉取最新状态与最新时间线（后续与具体实现细节对齐）

> 说明：本轮不涉及附件上传/附件存储链路（已由你确认暂不纳入）。

- 收口记录：
  - `T-024.7` 已完成并收口，右侧抽屉详情页、字体层级、刷新行为、数据入口/出口、时间线与工作台均已通过浏览器回归验证。

### T-024.8 处理历史模型与写链路（2026-03-31）
- 处理历史改为真实时间线：
- 当前“处理历史”仅根据 `repliedAt` 伪造单条已回复/待处理提示，不满足管理闭环要求；本轮需落地真实事件时间线，至少覆盖提交、状态变化、回复、关闭等操作。
- 写链路补充事件留痕：
- 管理员更新状态或发送回复时，除了更新 `user_feedbacks` 当前态，还必须写入独立历史事件，保留 `fromStatus -> toStatus`、操作者、时间与回复快照，避免历史被覆盖。

- 收口记录：
  - `T-024.8` 已完成并收口，真实事件表、提交/回复/改状态写链路、旧记录补合成 timeline、以及详情数据类型与 Prisma 枚举对齐都已完成并通过定向校验。

### T-024.9 第一轮实现进展（2026-03-31）
- 已完成 `T-024.1` 盘点收口：
- `src/app/(dashboard)/admin/feedback/page.tsx`、`src/components/admin/feedback/FeedbackList.tsx`、`src/components/admin/feedback/FeedbackDetailView.tsx` 与相关 API / action 已完成真实数据盘点与路径映射，列表、概览、详情、回复动作、来源字段、分页与刷新入口均已明确。
- 已完成列表页真数据分页：
- `src/app/(dashboard)/admin/feedback/page.tsx` 现在会读取 `searchParams.page`，按页服务端拉取首屏真实数据；`src/components/admin/feedback/FeedbackList.tsx` 已按 `page -> offset` 对接真实分页，并补齐上一页/下一页控件。
- 已完成详情页工作台重设计：
- `src/components/admin/feedback/FeedbackDetailView.tsx` 已重构为“顶部状态带 + 原始反馈 + 处理时间线 + 处理工作台”的单列右侧抽屉结构，并在 header 增加手动刷新按钮。
- `src/components/admin/feedback/FeedbackList.tsx` 的队列记录已改为整行可点击，右侧“操作”列已移除，点击任意记录即可打开处理抽屉。
- `src/components/ui/sheet.tsx` 对应的抽屉内容已补齐无障碍标题口径；`FeedbackList` 打开的抽屉已放入隐藏 `SheetTitle` / `SheetDescription`，避免 Radix Dialog 报错。
- `src/app/api/admin/feedback/detail/[id]/route.ts` 已切换为后台工作台专用详情加载器，避免抽屉加载时被旧的作者可见性逻辑误拦截。
- 已完成列表页刷新入口补齐：
- `src/components/admin/feedback/FeedbackList.tsx` 的概览区右上角新增手动刷新按钮，和详情页保持一致，便于管理员主动拉取最新反馈概览与队列数据。
- 已完成处理历史数据模型：
- `prisma/schema.prisma` 新增 `FeedbackEventType` 与 `UserFeedbackEvent`；`UserFeedback` 新增 responder / events 关系，用于承载真实处理时间线。
- 已完成本地数据库迁移：
- 新增 `supabase/migrations/020_t024_feedback_events.sql`，并已在本地数据库执行成功；`user_feedback_events` 表当前列结构已核对通过。
- 已完成后台写链路拆分：
- `src/actions/support/ticket.ts` 新增 `updateFeedbackStatus`，用于单独保存状态。
- `replyToFeedback` 改为在回复时同步写入事件历史，不再只覆盖当前态字段。
- `submitFeedback` 也会在新建 feedback 时自动写入 `SUBMITTED` 事件。
- 已完成详情读取链路补充：
- `getFeedbackDetail` 现在会返回 responder、events，并对无历史的旧记录补合成 timeline，避免详情页完全空白。

- 收口记录：
  - `T-024.9` 已完成并收口，`T-024.7` / `T-024.8` 已形成最终可执行实现，列表、详情抽屉、时间线、回复/状态写链路、站内通知、邮件副作用与浏览器回归均已对齐。

### T-024.10 第一轮验证步骤
- 分页代码校验：
- 执行 `pnpm exec eslint 'src/app/(dashboard)/admin/feedback/page.tsx' src/components/admin/feedback/FeedbackList.tsx`，结果通过。
- 执行 `pnpm exec tsc --noEmit --pretty false 2>&1 | rg "src/app/\\(dashboard\\)/admin/feedback/page.tsx|src/components/admin/feedback/FeedbackList.tsx"`，结果无命中。
- Prisma 校验：
- 执行 `pnpm prisma generate`，结果通过。
- 代码校验：
- 执行 `pnpm exec eslint src/actions/support/ticket.ts src/components/admin/feedback/FeedbackDetailView.tsx scripts/patch-baseline-browser-mapping.mjs`，结果通过。
- 类型校验：
- 执行 `pnpm exec tsc --noEmit --pretty false 2>&1 | rg "src/actions/support/ticket.ts|src/components/admin/feedback/FeedbackDetailView.tsx|FeedbackEvent"`，结果无命中，未发现本轮相关 TypeScript 错误。
- 数据库核验：
- 通过 `information_schema.columns` 核对 `public.user_feedback_events`，确认已存在 `event_type / from_status / to_status / message / metadata / created_at` 等字段。
- 浏览器回归：
- 使用 Playwright 完成管理员登录、进入 `/admin/feedback`、点击队列打开右侧抽屉、刷新详情、切换 Public Reply / Internal Note、选择状态、发送回复、写入内部备注与重新加载时间线的验证。
- 回查结果确认：详情接口返回 200，列表行数正常，右侧抽屉正常渲染，时间线、状态回写、回复回写与通知创建均成功落库。

### T-024.11 第一轮未覆盖项
- 本轮未覆盖项已清零：
- 先前未完成的浏览器级 admin 详情页验收、真实管理员交互核账，均已在本轮通过 Playwright 与数据库回查完成。
- 当前 `T-024` 在反馈管理闭环层面暂无新增未覆盖项。

## T-025 每步完成即更新文档与测试
| id | description | owner | status |
|---|---|---|---|
| T-025.1 | 每完成 `T-022` / `T-023` / `T-024` / `T-026` 任一阶段后，立即回写本文件对应任务状态与完成说明 | codex | done |
| T-025.2 | 每完成一个增量任务后，立即更新关联工作底稿/实现说明，补充字段口径、状态机与遗留风险 | codex | done |
| T-025.3 | 每完成一个增量任务后，执行最小充分测试：相关页面冒烟、定向 Action/API、必要的数据库核账或日志留证 | codex | done |
| T-025.4 | 将每轮开发的测试结果、失败项、修复结果与残余风险汇总到文档，作为进入下一阶段的前置条件 | codex | done |

### T-025 每步完成即更新文档与测试（已完成）
> 本节是本轮开发流程约束，而不是单独的产品功能实现。目标是把任务状态、实现说明、测试结果和残余风险在每次增量完成后立即回写，避免下一阶段基于过期信息推进。

- 状态回写：
  - 每完成 `T-022` / `T-023` / `T-024` / `T-026` 任一阶段，都需要立即回写本文件对应任务状态与完成说明。
  - 子任务完成后，表格状态与正文收口记录必须保持一致，避免出现文档状态和实际实现不同步。

- 工作底稿更新：
  - 每个增量任务完成后，都要同步更新关联工作底稿/实现说明，补充字段口径、状态机、读取/写入边界与遗留风险。
  - 新增或调整的页面结构、接口语义和副作用口径必须进入文档，不能只停留在代码中。

- 最小充分测试：
  - 每完成一个增量任务，都要执行相关页面冒烟、定向 Action/API、必要的数据库核账或日志留证。
  - 测试结果要和实现结果同轮回写，避免“写完再补测”的断层。

- 失败项与残余风险：
  - 每轮开发结束时，需要把测试结果、失败项、修复结果与残余风险汇总到文档。
  - 若存在未覆盖项，也必须明确写出原因和后续前置条件。

- 收口记录：
  - `T-025` 已完成并收口，后续 `T-022` / `T-023` / `T-024` / `T-026` 的每一轮增量都将按“先更新文档、再验证、再进入下一步”的节奏执行。

## T-026 全站响应时间优化收口
| id | description | owner | status |
|---|---|---|---|
| T-026.1 | 建立性能基线与热点清单：盘点高频入口页、慢路由、慢交互、慢接口、冷启动风险点，形成“首屏 / 切页 / 点击 / API / 数据源”五段延迟地图 | codex | done |
| T-026.2 | 建立统一优化目标与验收口径：明确首屏可见反馈、路由切换反馈、点击反馈、函数耗时、数据库往返的目标值与采样方式，并写入工作底稿 | codex | done |
| T-026.3 | 对齐即时反馈层：为关键 CTA、表单、切换、提交、删除、保存补齐 `pending`、禁用态、按钮文案变化、spinner、toast 或 optimistic UI，避免“点了没反应” | codex | done |
| T-026.4 | 对齐路由即时加载层：为高频页面族补齐或细化 `loading.tsx`、`Suspense`、骨架屏与分段流式渲染，避免整页等待慢数据后才出首屏 | codex | done |
| T-026.5 | 对齐缓存与预渲染层：评估并落地 `use cache`、`cacheLife`、`cacheTag`、静态壳 + 动态岛策略，优先缓存可复用聚合与公开内容；`cacheComponents` 已评估但因现有 `force-dynamic` 路由兼容性改用 `experimental.useCache` | codex | done |
| T-026.6 | 收缩动态边界：审计 `cookies()`、`headers()`、`searchParams`、鉴权与个性化读取位置，下沉到更小的边界，避免根布局或整页被不必要地拉成 request-time 动态渲染 | codex | done |
| T-026.7 | 优化导航与预取：梳理高频跳转入口、侧边栏、卡片 CTA、分页与深链，补齐 `Link` 预取、手动 `router.prefetch()` 或等价策略，降低切页等待感 | codex | done |
| T-026.8 | 优化服务端与数据源延迟：核对 Vercel Functions region、Supabase/数据库 region、Prisma 查询热点、串行 await、重复请求与 N+1 风险，优先压缩跨区 RTT 与后端阻塞时间；已统一热 API 的 `preferredRegion`，并把实践统计中的用户权限作用域读取收紧为复用 helper | codex | done |
| T-026.9 | 迁移非阻塞副作用：将日志、审计、通知、回执、统计、低优先级同步等从主响应链路剥离，改为响应后处理或后台执行，确保用户先看到成功反馈；已统一引入 `runAfterTask`，并将反馈、欢迎通知、社交通知、Stripe 回执、伪装审计与社区 badge 相关副作用后置 | codex | done |
| T-026.10 | 优化静态资源与首屏载荷：复核字体、图片、远程资源缓存、脚本加载顺序、首屏 bundle、按需加载与第三方组件引入，减少首屏阻塞与 hydration 压力；已将首页下半屏拆为独立动态 chunk，主页主 bundle 保持首屏最小化 | codex | done |
| T-026.11 | 补齐观测与留证：利用 `SpeedInsights`、Vercel Runtime Logs、必要的结构化日志与本地性能记录，建立优化前后对照证据，避免凭体感判断；已补齐共享 perf logger、首页渲染日志与关键 API 结构化日志 | codex | done |
| T-026.12 | 完成全站性能验证与收口：逐项复测高频页面与关键操作，记录优化前后差异、残余热点、未纳入本轮的长期项，并更新任务状态与后续建议 | codex | done |

## 补充备注
- `T-022` 是新增执行任务，主归属为 `T-019 Public / Marketing / Auth 域`，但其写入结果必须能被 `T-024` 的 Admin Feedback 闭环消费。
- `T-023` 是对 `T-015` 的本轮落地拆分，目标是先把 `/admin/content/reports` 单页从 mock 切到真实数据，再补统计和处理闭环。
- `T-024` 是对 `T-011` 的本轮落地拆分，强调“前台提交入口”和“后台处理流”之间的闭环一致性。
- `T-025` 为本轮开发流程约束；后续每完成一段实现，都应先更新文档和测试结果，再进入下一段开发。
- `T-026` 是新增的站点性能收口任务，覆盖“用户点击后立即有反馈”的感知速度，以及首屏渲染、路由切换、函数执行、数据源访问等真实耗时优化。
- `T-026` 的执行必须受 `T-025` 约束：每完成一个子任务，立即验证、留证、更新本文件与关联工作底稿后，才能继续下一步。
- `T-026` 工作底稿见 `t-026-performance-workbook.md`；`T-026.1` 已完成测量范围、首轮基线与热点名单，`T-026.2` 已基于真实浏览器结果补齐目标值与验收口径，`T-026.3` 已完成统一按钮 loading 与 Dashboard 导航 pending，`T-026.4` 已完成高频 student/admin 路由的共享 `loading.tsx` 壳与 Settings 通知 skeleton，`T-026.5` 已完成共享缓存层与 `use cache` 兼容落地，`T-026.6` 已完成动态边界收缩，`T-026.7` 已完成导航与预取统一收口，`T-026.8` 已统一热 API 的 region 与实践统计权限作用域读取，`T-026.9` 已把反馈、通知、回执、审计与 badge 相关副作用后置到 `runAfterTask` / `after`，`T-026.10` 已将首页下半屏拆为独立动态 chunk，并完成 lint、typecheck、build 与本地请求验证；`T-026.11` 已补齐共享 perf logger、首页渲染日志与关键 API 结构化日志，并完成本地请求留证；`T-026.12` 已完成最终复测与收口，确认公开首页、401 快速失败 API 与路由守卫行为正常，未引入新的性能回退。
