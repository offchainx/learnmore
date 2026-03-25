# 执行任务清单（Tasks）

| id | description | owner | status (todo/doing/done) | link (PR/commit) |
|---|---|---|---|---|
| T-001 | 将 P0-05 从 Dashboard 单页任务重写为“全站真实数据与联调收口”文档四件套 | codex | done |  |
| T-002 | 建立全站页面/功能/接口/数据表清单，补全 route -> component -> action/api -> table 映射 | codex | done |  |
| T-003 | 文档审阅与范围确认（用户确认前禁止开发） | user | done |  |
| T-004 | 全站真实数据治理模板（字段/状态/命名/核账/迭代流程） | codex | done |  |
| T-005 | `/dashboard` Dashboard 首页真实数据接入与功能对齐 | codex | todo |  |
| T-006 | `/dashboard/courses` + `/course/[subjectId]` + `/course/[subjectId]/[lessonId]` 学习内容域真实化 | codex | todo |  |
| T-007 | `/dashboard/practice` 全路由族真实化（含 Smart Drill / Error Wiper / Mock Arena / Chapter Drill / Past Paper） | codex | doing |  |
| T-008 | `/dashboard/community` 全路由族真实化（列表 / 发帖 / 详情 / 评论） | codex | todo |  |
| T-009 | `/admin` 首页与公共管理域真实化（含 `/admin/permissions`） | codex | todo |  |
| T-010 | `/admin/users` 全路由族真实化（列表 / 详情 / 管理动作） | codex | todo |  |
| T-011 | `/admin/feedback` 全路由族真实化（列表 / 详情 / 处理流） | codex | todo |  |
| T-012 | `/admin/referrals` + `/admin/vouchers` 增长与券码域真实化 | codex | todo |  |
| T-013 | `/admin/content/import` + `/admin/content` 内容导入入口真实化 | codex | todo |  |
| T-014 | `/admin/content/review` 全路由族真实化（列表 / 详情 / 审核动作） | codex | todo |  |
| T-015 | `/admin/content/reports` + `/admin/content/statistics` 内容质控与统计域真实化 | codex | todo |  |
| T-016 | `/dashboard/leaderboard` 排行榜真实数据接入与口径对齐 | codex | todo |  |
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

## T-005 Dashboard 子任务（按四阶段推进）

### Phase A：定义与映射
| id | description | owner | status |
|---|---|---|---|
| T-005.1 | 盘点 Dashboard 全部区块、组件、CTA、跳转与当前数据来源 | codex | todo |
| T-005.2 | 定义 Dashboard 字段字典与展示口径 | codex | todo |
| T-005.3 | 建立 Dashboard 页面字段 -> Action/API -> 数据表 映射矩阵 | codex | todo |
| T-005.4 | 定义空态、错误态、无权限态、禁用态规则，禁止 fallback 到 mock | codex | todo |

### Phase B：读数据与聚合改造
| id | description | owner | status |
|---|---|---|---|
| T-005.5 | 重构 `getDashboardStats` / `DashboardData` 契约，移除挂空字段与伪完整结构 | codex | todo |
| T-005.6 | 接入 `subjectStrengths` 真实聚合（按学科准确率/样本数/排序规则） | codex | todo |
| T-005.7 | 接入 `weaknesses` 真实聚合，并统一“薄弱点”来源口径 | codex | todo |
| T-005.8 | 处理 `dailyActivity`：要么落地真实数据，要么从契约中下线 | codex | todo |
| T-005.9 | 替换排名卡硬编码（Top 15%、68% 等），接入真实 leaderboard 数据 | codex | todo |
| T-005.10 | 校准“最近学习路径”区块：数据条数、排序、深链跳转、无数据态 | codex | todo |
| T-005.11 | 校准“最近练习回顾”区块：确认全模式统一写 `exam_records`，并接结果页/记录详情 | codex | todo |

### Phase C：写逻辑与业务口径改造
| id | description | owner | status |
|---|---|---|---|
| T-005.12 | 统一 `studyTime` 口径：修复只统计部分练习模式的问题 | codex | todo |
| T-005.13 | 统一 `activeDays` / `streak` 的业务定义与触发时机，避免“打开 Dashboard 就改 streak” | codex | todo |
| T-005.14 | 校准 `dailyTasks` 创建、推进、奖励领取链路，确保首屏与数据库状态一致 | codex | todo |
| T-005.15 | 决定 `DailyInspiration` 策略：纳入真实数据源，或明确排除为非核账展示模块 | codex | todo |

### Phase D：页面清理与验证
| id | description | owner | status |
|---|---|---|---|
| T-005.16 | Dashboard 字段级 SQL 核账 + 刷新/重试/重复提交幂等验证 + mock/伪展示清理收尾 | codex | todo |

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
| T-009 | `/admin`、`/admin/permissions` | Admin 首页聚合与公共管理能力一起处理 |
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
| T-008.1 | 盘点 `/dashboard/community`、`/dashboard/community/new`、`/dashboard/community/[postId]` 的页面、组件、CTA 与当前数据源 | codex | todo |
| T-008.2 | 建立帖子列表、帖子详情、评论、点赞、筛选、作者信息的字段映射与权威数据源矩阵 | codex | todo |
| T-008.3 | 对齐社区读取链路：列表、详情、评论流、计数、排序、权限与可见性规则 | codex | todo |
| T-008.4 | 对齐社区写链路：发帖、评论、点赞、解决状态、越权拦截、重复提交幂等 | codex | todo |
| T-008.5 | 清理假帖子、假评论、假计数、伪成功提示，补齐空态/错误态/未登录态 | codex | todo |
| T-008.6 | 完成社区域验证：读写立即可见、字段核账、重复提交/刷新验证 | codex | todo |

### T-009 Admin 首页与公共管理域
| id | description | owner | status |
|---|---|---|---|
| T-009.1 | 盘点 `/admin`、`/admin/permissions` 的模块、统计卡、列表、快捷动作与当前数据源 | codex | todo |
| T-009.2 | 建立 admin 首页统计、风险提示、权限数据、快捷入口的字段映射与权威数据源矩阵 | codex | todo |
| T-009.3 | 对齐 admin 首页读取链路：聚合统计、待办、风险、权限概览与角色可见性 | codex | todo |
| T-009.4 | 对齐公共管理写链路：权限调整、角色限制、管理员可执行动作的权限与幂等 | codex | todo |
| T-009.5 | 清理假统计、假待办、假权限回执、假风险提示，补齐 forbidden/error/empty 状态 | codex | todo |
| T-009.6 | 完成 Admin 首页域验证：角色隔离、字段核账、重复操作验证 | codex | todo |

### T-010 用户管理域
| id | description | owner | status |
|---|---|---|---|
| T-010.1 | 盘点 `/admin/users`、`/admin/users/[id]` 的列表、筛选、详情模块、管理动作与当前数据源 | codex | todo |
| T-010.2 | 建立用户列表、订阅、状态、学习概览、审计信息、管理动作的字段映射与权威数据源矩阵 | codex | todo |
| T-010.3 | 对齐用户管理读取链路：列表、搜索、筛选、详情聚合、关联记录加载 | codex | todo |
| T-010.4 | 对齐用户管理写链路：状态变更、备注、权限覆盖、模拟登录等动作的权限与幂等 | codex | todo |
| T-010.5 | 清理假用户数据、假统计、假管理回执，补齐空态/错误态/越权态 | codex | todo |
| T-010.6 | 完成用户管理域验证：管理动作核账、权限验证、重复提交验证 | codex | todo |

### T-011 反馈域
| id | description | owner | status |
|---|---|---|---|
| T-011.1 | 盘点 `/admin/feedback`、`/admin/feedback/[id]` 的列表、详情、处理动作与当前数据源 | codex | todo |
| T-011.2 | 建立反馈内容、状态、标签、处理记录、提交人信息的字段映射与权威数据源矩阵 | codex | todo |
| T-011.3 | 对齐反馈读取链路：列表、筛选、详情、处理历史与关联对象 | codex | todo |
| T-011.4 | 对齐反馈写链路：状态流转、备注、处理动作、权限校验与幂等 | codex | todo |
| T-011.5 | 清理假反馈、假状态流、假成功提示，补齐空态/错误态/越权态 | codex | todo |
| T-011.6 | 完成反馈域验证：状态流转核账、重复处理验证、前后端一致性验证 | codex | todo |

### T-012 推荐与券码域
| id | description | owner | status |
|---|---|---|---|
| T-012.1 | 盘点 `/admin/referrals`、`/admin/vouchers` 的列表、统计、筛选、操作入口与当前数据源 | codex | todo |
| T-012.2 | 建立推荐关系、奖励状态、券码状态、使用记录、增长统计的字段映射与权威数据源矩阵 | codex | todo |
| T-012.3 | 对齐推荐与券码读取链路：列表、明细、状态聚合、统计口径与时间窗口 | codex | todo |
| T-012.4 | 对齐推荐与券码写链路：发放、作废、核销、补发、权限与幂等 | codex | todo |
| T-012.5 | 清理假券码、假增长数据、假奖励状态与伪成功提示，补齐空态/错误态 | codex | todo |
| T-012.6 | 完成推荐与券码域验证：状态核账、重复操作验证、页面与数据库一致性验证 | codex | todo |

### T-013 内容导入入口域
| id | description | owner | status |
|---|---|---|---|
| T-013.1 | 盘点 `/admin/content`、`/admin/content/import` 的入口、上传流、导入状态与当前数据源 | codex | todo |
| T-013.2 | 建立内容源文件、导入任务、处理状态、结果统计、错误摘要的字段映射与权威数据源矩阵 | codex | todo |
| T-013.3 | 对齐内容导入读取链路：入口页、导入记录、状态轮询、结果汇总与错误展示 | codex | todo |
| T-013.4 | 对齐内容导入写链路：上传、创建导入任务、重试、取消、权限与幂等 | codex | todo |
| T-013.5 | 清理假导入结果、假 OCR/导入状态、假成功提示，补齐空态/错误态/禁用态 | codex | todo |
| T-013.6 | 完成内容导入域验证：任务创建核账、状态流转核账、重复提交验证 | codex | todo |

### T-014 内容审核域
| id | description | owner | status |
|---|---|---|---|
| T-014.1 | 盘点 `/admin/content/review`、`/admin/content/review/[questionId]` 的列表、详情、审核动作与当前数据源 | codex | todo |
| T-014.2 | 建立题目内容、审核状态、审核人、审核日志、质量字段的字段映射与权威数据源矩阵 | codex | todo |
| T-014.3 | 对齐内容审核读取链路：待审列表、详情信息、审核历史、过滤条件与排序口径 | codex | todo |
| T-014.4 | 对齐内容审核写链路：通过、驳回、修改建议、报错处理、权限与幂等 | codex | todo |
| T-014.5 | 清理假审核队列、假审核结果、假状态流，补齐空态/错误态/越权态 | codex | todo |
| T-014.6 | 完成内容审核域验证：审核动作核账、重复处理验证、前后端状态一致性验证 | codex | todo |

### T-015 内容质控与统计域
| id | description | owner | status |
|---|---|---|---|
| T-015.1 | 盘点 `/admin/content/reports`、`/admin/content/statistics` 的图表、列表、筛选、CTA 与当前数据源 | codex | todo |
| T-015.2 | 建立报错统计、题量统计、质量分布、处理效率等字段映射与权威数据源矩阵 | codex | todo |
| T-015.3 | 对齐质控与统计读取链路：图表、列表、时间窗口、筛选条件与口径说明 | codex | todo |
| T-015.4 | 对齐质控与统计写链路：报错处理、状态更新、统计刷新、权限与幂等 | codex | todo |
| T-015.5 | 清理假图表、假统计、假报错回执，补齐空态/错误态/权限态 | codex | todo |
| T-015.6 | 完成内容质控与统计域验证：统计字段核账、报错处理核账、重复操作验证 | codex | todo |

### T-016 排行榜域
| id | description | owner | status |
|---|---|---|---|
| T-016.1 | 盘点 `/dashboard/leaderboard` 的榜单区块、周期切换、我的排名卡、衍生卡片与当前数据源 | codex | todo |
| T-016.2 | 建立榜单名次、分数、我的排名、周期、榜单说明、衍生卡片的字段映射与权威数据源矩阵 | codex | todo |
| T-016.3 | 对齐排行榜读取链路：周/月/总榜、榜单列表、我的排名、分页/限制与时间窗口口径 | codex | todo |
| T-016.4 | 对齐排行榜写链路：积分更新入口、周期切换、缓存刷新、幂等与并发策略 | codex | todo |
| T-016.5 | 清理首屏 mock 榜单、假排名、假百分位与伪说明文案，补齐空态/错误态 | codex | todo |
| T-016.6 | 完成排行榜域验证：榜单字段核账、我的排名核账、周期切换与重复刷新验证 | codex | todo |

### T-017 成就与游戏化域
| id | description | owner | status |
|---|---|---|---|
| T-017.1 | 盘点 `/dashboard/achievements` 的概览、等级、XP、streak、任务、徽章与当前数据源 | codex | todo |
| T-017.2 | 建立等级、XP、streak、任务、奖励、徽章、领取状态的字段映射与权威数据源矩阵 | codex | todo |
| T-017.3 | 对齐成就与游戏化读取链路：概览、等级映射、任务列表、徽章列表、说明文案口径 | codex | todo |
| T-017.4 | 对齐成就与游戏化写链路：奖励领取、任务推进、streak 刷新、徽章发放、幂等与重复触发 | codex | todo |
| T-017.5 | 清理假 XP、假 streak、假任务状态、假领奖成功，补齐空态/错误态/禁用态 | codex | todo |
| T-017.6 | 完成成就与游戏化域验证：字段核账、重复领奖/刷新验证、规则回放验证 | codex | todo |

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
