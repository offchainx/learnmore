# 执行任务清单（Tasks）

| id | description | owner | status (todo/doing/done) | link (PR/commit) |
|---|---|---|---|---|
| T-001 | 将 P0-05 从 Dashboard 单页任务重写为“全站真实数据与联调收口”文档四件套 | codex | done |  |
| T-002 | 建立全站页面/功能/接口/数据表清单，补全 route -> component -> action/api -> table 映射 | codex | todo |  |
| T-003 | 文档审阅与范围确认（用户确认前禁止开发） | user | done |  |
| T-004 | 全站统一字段口径/映射/命名/状态/核账基线 | codex | done |  |
| T-005 | `/dashboard` Dashboard 首页真实数据接入与功能对齐 | codex | todo |  |
| T-006 | `/dashboard/courses` + `/course/[subjectId]` + `/course/[subjectId]/[lessonId]` 学习内容域真实化 | codex | todo |  |
| T-007 | `/dashboard/practice` 全路由族真实化（含 Smart Drill / Error Wiper / Mock Arena / Chapter Drill / Past Paper） | codex | todo |  |
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

## T-004 统一开发基线（必须先完成）

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

## 旧任务整合说明
- 旧 `T-004 Dashboard / Achievements / Settings` 已拆入：`T-005`、`T-017`、`T-018`。
- 旧 `T-005 Practice` 已整合为新的 `T-007` 全路由族任务。
- 旧 `T-007 Admin / Billing / Support / Notification` 已拆入：`T-009 ~ T-015`，跨页面公共能力由对应页面族收口。
- 旧 `T-008 Public / Marketing / Auth` 已整合为 `T-019`。
- 旧 `T-009 本地验证`、`T-010 预发复测` 已顺延为 `T-020`、`T-021`。

## 备注
- 当前阶段已完成任务结构重构与 `T-004` 基线文档，不进入页面代码实现。
- `T-004` 已落地，统一基线见 `t-004-baseline.md`。
- 各页面族任务默认先做读数据与口径，再做写动作，最后做 mock 清理和验证。
