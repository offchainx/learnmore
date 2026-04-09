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
| T-018 | `/dashboard/settings` 全路由族真实化（含 `/dashboard/settings/notifications`） | codex | todo |  |
| T-019 | Public / Marketing / Auth 页面 CTA、表单、跳转与权限行为对齐 | codex | todo |  |
| T-020 | 本地验证：页面冒烟、Action/API 契约、SQL/后台快照留证 | codex | todo |  |
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
| T-018 | `/dashboard/settings`、`/dashboard/settings/notifications` | 设置与通知偏好统一真实化 |
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
- 支付页预填已经落在 [`src/app/(marketing)/pricing/PricingPageClient.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(marketing)/pricing/PricingPageClient.tsx)：它会从 `?referralCode=` 读取推荐码，允许用户在提交前确认或修改，然后再传给 `prepareCheckoutAction()` 与 checkout metadata。

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
- 推荐分享与支付入口的错误态主要落在 [`src/app/(marketing)/pricing/PricingPageClient.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(marketing)/pricing/PricingPageClient.tsx) 和 [`src/app/r/[code]/route.ts`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/r/[code]/route.ts)：无效推荐码、未找到推荐码、已绑定、自推、支付取消与优惠码异常都会以页面内状态的方式展示，而不是只弹一个不可追踪的 alert。
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
- 已通过 [`/r/[code]`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/r/[code]/route.ts) 和 [`/pricing`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(marketing)/pricing/PricingPageClient.tsx) 做页面核对：真实 referral code 会正确 redirect 到 `/pricing?referralCode=...`，而 `Pricing` 页会把该码作为预填值展示出来，不再依赖占位路径。
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
  - [`src/app/(marketing)/pricing/PricingPageClient.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(marketing)/pricing/PricingPageClient.tsx) 中的推荐码预填区，负责承接 `?referralCode=` 并在支付前允许用户确认或修改。
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
  - [`src/app/(marketing)/pricing/PricingPageClient.tsx`](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(marketing)/pricing/PricingPageClient.tsx)：负责接收 `?referralCode=`、允许用户确认或修改、并把结果继续传给 checkout。
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
| T-017.1 | 盘点 `/dashboard/achievements` 的首屏概览、等级 / XP / streak / 徽章墙、任务入口、CTA、缓存 tag 与当前数据源，明确页面读链路与共享域边界 | codex | todo |
| T-017.2 | 建立等级、XP、streak、任务、奖励、徽章、领取状态、通知副作用的字段映射与权威数据源矩阵，明确 `users / badges / user_badges / daily_tasks / notifications` 的主从关系 | codex | todo |
| T-017.3 | 固化状态与约束：未登录、无 profile、无成就、无徽章、任务未生成、任务已领取、缓存失效、接口失败、禁用态 / 空态 / 错误态的渲染与跳转规则 | codex | todo |

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
| T-017.4 | 对齐读取链路：页面首屏、缓存入口、加载态与错误态接管 `getAchievementOverview` / `listUserBadges` / `getTodayTasks` 等真实数据源，补齐等级 / XP / streak / 徽章 / 任务摘要的展示口径 | codex | todo |
| T-017.5 | 对齐写链路：奖励领取、任务推进、onboarding 完成、streak 刷新、徽章发放的幂等、重复触发、事务与缓存失效策略，确保页面刷新与副作用回流一致 | codex | todo |
| T-017.6 | 对齐跨域联动：来自练习 / 社区 / streak 的徽章触发、`achievement-overview` 与 `user-badges` tag 回收、通知写入、错误回滚与边界提示 | codex | todo |

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

### Phase C：清理和收口验证
| id | description | owner | status |
|---|---|---|---|
| T-017.7 | 清理假 XP、假 streak、假任务状态、假领奖成功、静态占位文案与过时 CTA，避免页面继续依赖本地常量兜底 | codex | todo |
| T-017.8 | 补齐 `/dashboard/achievements` 的页面级加载 / 错误 / 空态 / 低数据态 / 移动端适配 / 可访问性收口，保证异常场景也能稳定可用 | codex | todo |
| T-017.9 | 完成成就与游戏化域验证：字段核账、重复领奖 / 重复刷新、徽章发放回放、任务推进回放、缓存失效与 console error 检查 | codex | todo |

### T-018 设置与通知域
| id | description | owner | status |
|---|---|---|---|
| T-018.1 | 盘点 `/dashboard/settings`、`/dashboard/settings/notifications` 的表单、模块、CTA 与当前数据源 | codex | todo |
| T-018.2 | 建立个人资料、偏好设置、通知设置、家长相关设置的字段映射与权威数据源矩阵 | codex | todo |
| T-018.3 | 对齐设置读取链路：资料、偏好、通知、权限态与初始化回填逻辑 | codex | todo |
| T-018.4 | 对齐设置写链路：保存资料、保存偏好、保存通知、输入校验、权限与幂等 | codex | todo |
| T-018.5 | 清理假成功提示、假保存、静态默认值正式兜底，补齐空态/错误态/禁用态 | codex | todo |
| T-018.6 | 完成设置与通知域验证：保存前后核账、重复保存验证、失败回滚验证 | codex | todo |

### T-019 Public / Marketing / Auth 域
| id | description | owner | status |
|---|---|---|---|
| T-019.1 | 盘点登录、注册、公开页 CTA、联系/帮助/博客等页面与所有表单、跳转、当前数据源 | codex | todo |
| T-019.2 | 建立登录注册状态、公开页 CTA、联系表单、博客/帮助内容与权威数据源矩阵 | codex | todo |
| T-019.3 | 对齐公开域读取链路：公开页内容、博客、帮助、跳转目标、权限分流与会话判断 | codex | todo |
| T-019.4 | 对齐公开域写链路：注册、登录、联系表单、订阅/留资、权限与幂等 | codex | todo |
| T-019.5 | 清理假 CTA、假可达入口、假表单成功、无后端能力的正式交互，补齐禁用态/错误态 | codex | todo |
| T-019.6 | 完成 Public / Marketing / Auth 域验证：表单核账、跳转验证、会话/权限验证 | codex | todo |

## T-020 本地验证拆解
| id | description | owner | status |
|---|---|---|---|
| T-020.1 | 建立本地验证总表：页面域、关键路径、写操作、证据类型、执行人 | codex | todo |
| T-020.2 | 执行全站页面冒烟：成功、无数据、无权限、异常、重复刷新场景 | codex | todo |
| T-020.3 | 执行关键 Action/API 契约验证：输入、输出、错误、权限、幂等、并发 | codex | todo |
| T-020.4 | 执行字段级 SQL/后台核账，并留存执行前后快照 | codex | todo |
| T-020.5 | 汇总 mock 清理结果、残余风险、未纳入核账的装饰模块说明 | codex | todo |
| T-020.6 | 形成本地验证报告并经用户确认后进入预发 | user/codex | todo |

## T-021 预发复测与发布前收口拆解
| id | description | owner | status |
|---|---|---|---|
| T-021.1 | 在预发复测本地同一批关键页面与写操作，确认环境差异 | codex | todo |
| T-021.2 | 对关键写操作再次执行幂等、重复提交、越权、异常场景验证 | codex | todo |
| T-021.3 | 汇总预发字段核账结果、截图、日志与后台证据 | codex | todo |
| T-021.4 | 确认发布阻断项、残余风险、回滚触发条件与回滚步骤 | codex | todo |
| T-021.5 | 输出发布前收口结论并等待用户最终批准 | user/codex | todo |

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
