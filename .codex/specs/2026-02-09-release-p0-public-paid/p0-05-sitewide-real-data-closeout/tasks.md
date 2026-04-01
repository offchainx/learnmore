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
| T-023.2 | 建立页面字段与权威数据源矩阵：报错状态、问题类型、题目信息、提交人信息、时间窗口、待处理数、处理时效、统计卡口径 | codex | doing |
| T-023.3 | 细拆用户侧报错入口：明确 reports 应挂载的路由/组件、前台提交入口、做题场景触发点与 `reportQuestion` 调用边界 | codex | doing |
| T-023.4 | 对齐读取链路：服务端首屏数据、客户端筛选/搜索、时间窗口、统计聚合、空态与无权限态，替换 `MOCK_REPORTS` | codex | todo |
| T-023.5 | 对齐写链路：单条处理、批量处理、状态流转、`reportCount` 增减语义、幂等与重复处理提示 | codex | todo |
| T-023.6 | 清理假图表、假统计、假详情抽屉、前端硬编码状态枚举与时间文案，补齐错误态、空态、权限态与处理中反馈 | codex | todo |
| T-023.7 | 完成页面验证：列表/统计核账、筛选搜索验证、处理动作核账、重复处理验证与前后端状态一致性验证 | codex | todo |

### T-023.1 盘点结论（已完成）
- 当前 `/admin/content/reports` 页面仍然是 client-only 结构，首屏由 `ReportsClient` 自己维护筛选、统计和抽屉状态，没有接入服务端首屏数据。
- `ReportsClient` 里的列表、筛选、统计全部还在读取 `MOCK_REPORTS`，时间窗口、状态筛选、问题类型筛选和搜索都只是本地过滤。
- `ReportsTable` 的分页控件目前是静态占位，上一页/下一页按钮没有真正接服务端分页，也没有把页码写回 URL。
- `ReportDetailsDrawer` 里的处理动作按钮目前也还是静态 UI，没有直接触发 `resolveReport` / `bulkResolveReports`。
- `question-service.ts` 里已经存在真实服务 `getQuestionReports` / `getContentStats` / `resolveReport` / `bulkResolveReports`，但还没有被 reports 页面消费。
- 下一步要先把页面的数据源矩阵和读取边界定死，再决定是直接接服务端数据，还是先补一层 admin reports API route。

### T-023.2 页面字段与权威数据源矩阵（进行中）
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

### T-023.3 用户侧报错入口映射（进行中）
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
| T-025.1 | 每完成 `T-022` / `T-023` / `T-024` / `T-026` 任一阶段后，立即回写本文件对应任务状态与完成说明 | codex | todo |
| T-025.2 | 每完成一个增量任务后，立即更新关联工作底稿/实现说明，补充字段口径、状态机与遗留风险 | codex | todo |
| T-025.3 | 每完成一个增量任务后，执行最小充分测试：相关页面冒烟、定向 Action/API、必要的数据库核账或日志留证 | codex | todo |
| T-025.4 | 将每轮开发的测试结果、失败项、修复结果与残余风险汇总到文档，作为进入下一阶段的前置条件 | codex | todo |

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
