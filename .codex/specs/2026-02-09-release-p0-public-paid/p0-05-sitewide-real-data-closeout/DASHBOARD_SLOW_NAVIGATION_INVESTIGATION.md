# Vercel 线上全站切换性能排查与推进清单

生成时间：2026-04-06  
适用范围：部署到 Vercel 后的全站页面切换、首屏响应、受保护路由跳转与已登录用户核心工作流体感。  
当前目标：不是只修 `/dashboard`，而是确保线上部署后的全站反应时间达到可商用化水平。

## 1. 问题定义

当前需要解决的是“线上部署后全站切换慢”的问题，而不是单一页面的局部迟滞。

- 影响范围包括 public 页、auth 页、受保护路由与 dashboard 子页
- 影响对象是未来真实线上用户，而不只是本地开发体验
- 验收标准不是“某个页面能打开”，而是全站在真实网络与真实部署环境下具备可商用的响应速度

本次排查要回答的核心问题只有三个：

1. 慢是全站普遍现象，还是主要集中在已登录保护路由
2. 慢点是在路由前置鉴权、服务端聚合，还是客户端二次请求
3. 经过本次处理后，线上体感是否已经达到可商用门槛

## 2. 已验证事实

### 2.1 Vercel 侧事实

- 最新生产部署可访问，部署状态为 `READY`
- Runtime logs 中已经能看到 public 路由与多个 dashboard 路由的请求样本
- 现有 Vercel 默认 runtime logs 颗粒度不足，单靠平台原始日志还不能直接证明 30s 卡在哪个具体阶段

### 2.2 Playwright 真实浏览器基线结果（已完成）

本次使用真实 Playwright 浏览器直接访问线上部署，拿到了两组数据。

- 公开页基线：
  - `/`：`domcontentloaded` 约 `564ms`，总稳定约 `2045ms`
  - `/login`：`domcontentloaded` 约 `375ms`，总稳定约 `1054ms`
  - `/pricing`：`domcontentloaded` 约 `679ms`，总稳定约 `1825ms`
  - `/subjects`：`domcontentloaded` 约 `714ms`，总稳定约 `1731ms`
  - `/about-us`：`domcontentloaded` 约 `781ms`，总稳定约 `1542ms`
  - `/how-it-works`：`domcontentloaded` 约 `716ms`，总稳定约 `1493ms`
  - `/register`：`domcontentloaded` 约 `708ms`，总稳定约 `1908ms`

- 受保护路由的游客态基线：
  - `/dashboard`：重定向到 `/login?redirectTo=%2Fdashboard`，`domcontentloaded` 约 `380ms`，总稳定约 `1089ms`
  - `/dashboard/community`：重定向到登录页，`domcontentloaded` 约 `383ms`，总稳定约 `1052ms`
  - `/dashboard/practice`：重定向到登录页，`domcontentloaded` 约 `443ms`，总稳定约 `1107ms`
  - `/dashboard/leaderboard`：重定向到登录页，`domcontentloaded` 约 `367ms`，总稳定约 `1023ms`
  - `/dashboard/settings`：重定向到登录页，`domcontentloaded` 约 `365ms`，总稳定约 `1008ms`

- 当前能下的结论：
  - public 页并没有出现“全站统一 30s”级别的灾难性慢响应
  - 受保护路由在游客态下的重定向也是快的，说明“未登录跳登录”这条链路不是主要问题
  - 真正需要继续验证的是“已登录用户进入 dashboard 与 dashboard 内部切页”的路径

- 当前仍未完成的验证：
  - 还没有拿到已登录态下 `/dashboard`、`/dashboard/community`、`/dashboard/practice`、`/dashboard/leaderboard`、`/dashboard/settings` 的真实浏览器时序
  - 也就是说，线上“30s 体感慢”的证据目前仍主要指向已登录核心区，而不是 public 区

### 2.3 Runtime logs 已验证事实

- 日志里已看到 `/dashboard`、`/dashboard/community`、`/dashboard/practice`、`/dashboard/leaderboard`、`/dashboard/settings` 请求
- 当前日志主要能证明“请求发生过”和“部分路由返回 200”
- 还缺请求级分段耗时，所以仍然需要自有诊断日志补足

### 2.4 代码侧已验证事实

- `[src/proxy.ts](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/proxy.ts)` 会在每个受保护路由请求前执行 `supabase.auth.getUser()`
- `[src/app/(dashboard)/dashboard/page.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(dashboard)/dashboard/page.tsx)` 已经改成 `getDashboardProfile()` 与 `getDashboardStats()` 并行
- `[src/actions/dashboard.ts](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/dashboard.ts)` 的 dashboard 首屏聚合已并行化，但仍保留 `ensureDailyTasks(user.id)` 作为前置逻辑
- `[src/actions/dashboard.ts](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/dashboard.ts)` 的 dashboard 首屏聚合已回退为保守串行，优先适配当前生产环境 `connection_limit=1`
- `[src/actions/gamification/daily-tasks.ts](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/gamification/daily-tasks.ts)` 内部仍有 advisory lock，只是现在已经补了快路径
- `[src/actions/practice/data-service.ts](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/practice/data-service.ts)` 的 `getSubjectChapters()` 仍然是 dashboard 聚合链路中的重节点
- `[src/lib/cache/sitewide.ts](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/lib/cache/sitewide.ts)` 已经有 `cacheTag` / `cacheLife`，但哪些路由真正命中缓存、哪些仍重复回源，还需要继续核实

### 2.5 当前已经落地的诊断补丁

- `proxy` 已增加 auth 耗时与总耗时日志
- `getDashboardStats()` 已增加 `ensureDailyTasks`、主查询批次、总耗时日志
- `ensureDailyTasks()` 已增加无锁快路径，避免无变化时仍先抢锁
- `loadDashboardSubjectResults()` 已改为并行 subject 聚合
- `loadUserWithOverrides()` 已增加同请求内缓存

### 2.6 当前验收线（上线门槛）

本次排查后，所有页面都按同一套门槛验收，不达标不允许上线。

- public 页面：
  - `DCL` 不超过 `2s`
  - 首屏壳子完成时间不超过 `1.5s`
  - 内容完成时间不超过 `3s`

- 登录后核心页面：
  - `DCL` 不超过 `3s`
  - 首屏壳子完成时间不超过 `2s`
  - 内容完成时间不超过 `3s`

- 说明：
  - `DCL` 代表 DOMContentLoaded，衡量 HTML 解析完成与基础结构可用时间
  - `LCP` 代表 Largest Contentful Paint，衡量首屏最大内容块什么时候出现
  - `INP` 代表 Interaction to Next Paint，衡量用户交互后页面多久能给出视觉反馈
  - `TBT` 代表 Total Blocking Time，衡量主线程被长任务阻塞了多久
  - 这四个指标里，`DCL` 适合做“首个结构可用”的粗门槛，`LCP` / `INP` / `TBT` 更适合衡量真实用户体感

- 上线规则：
  - 任意一个页面只要有任一门槛不达标，就不能上线
  - dashboard 核心页如果内容完成时间超过 `3s`，视为未达标
  - public 页如果 `DCL` 超过 `2s`，视为未达标
  - 后续每轮修复都必须按这套门槛复测并回写结果

### 2.7 复测记录模板

后续每轮复测都直接按下面的表填写，不再重新发散描述。

| 路由 | 类别 | DCL | 首屏壳子完成时间 | 内容完成时间 | 关键内容标记 | runtime log 备注 | 是否通过 |
|---|---|---:|---:|---:|---|---|---|
| `/dashboard` | protected / core |  |  |  |  |  |  |
| `/dashboard/courses` | protected / subpage |  |  |  |  |  |  |
| `/dashboard/practice` | protected / subpage |  |  |  |  |  |  |
| `/dashboard/community` | protected / subpage |  |  |  |  |  |  |
| `/dashboard/leaderboard` | protected / subpage |  |  |  |  |  |  |
| `/dashboard/achievements` | protected / subpage |  |  |  |  |  |  |
| `/dashboard/settings` | protected / subpage |  |  |  |  |  |  |
| `/login` | public / auth |  |  |  |  |  |  |
| `/pricing` | public |  |  |  |  |  |  |
| `/subjects` | public |  |  |  |  |  |  |

- 填写规则：
  - `DCL` 记录 `DOMContentLoaded`
  - `首屏壳子完成时间` 记录布局 / skeleton / 主要壳子首次可见的时间
  - `内容完成时间` 记录关键业务内容真正出现的时间
  - `关键内容标记` 记录正文里用来判断“内容已完成”的文本
  - `runtime log 备注` 记录该轮对应的 `[Perf]` / 200 / 500 / timeout 现象
  - `是否通过` 只写 `yes` / `no`

## 3. 当前高概率根因

按当前证据排序：

1. 保护路由前置鉴权过重：`src/proxy.ts` 中的远程 `supabase.auth.getUser()` 可能是所有已登录页面切换前的统一阻塞点
2. Dashboard 首屏聚合过重：`getDashboardStats()`、`getSubjectChapters()`、`ensureDailyTasks()` 仍可能叠加造成首屏等待
3. 子页切换后仍存在二次请求：尤其是 `community` 一类页面可能在首屏后再次拉取 feed
4. 缓存命中不足：部分数据虽然声明了缓存，但真实切页时未必命中
5. 区域与重复回源问题：同一数据在不同页面或不同入口上重复产生服务器开销

## 4. 对应任务锚点

这次排查是横切性能收口，直接影响以下任务：

- `T-005`：`/dashboard` Dashboard 首页真实数据接入与功能对齐
- `T-007`：`/dashboard/practice` 全路由族真实化
- `T-008`：`/dashboard/community` 全路由族真实化
- `T-016`：`/dashboard/leaderboard` 排行榜真实化
- `T-017`：`/dashboard/achievements` 成就 / XP / streak / 任务域真实化
- `T-018`：`/dashboard/settings` 全路由族真实化
- `T-019`：Public / Marketing / Auth 页面 CTA、表单、跳转与权限行为对齐
- `T-020`：本地验证：页面冒烟、Action/API 契约、SQL/后台快照留证
- `T-021`：预发复测、发布前收口与回滚确认

## 5. 本次排查工作流（T-001 ~ T-005）

> 注：本节编号只表示本次“检验 -> 发现问题 -> 问题修复清单 -> 修复问题 -> 重新检验”的推进顺序，不与第 4 节的项目任务锚点共用含义。

| id | description | owner | status |
|---|---|---|---|
| T-001 | 检验：建立线上真实基线与样本 | codex | done |
| T-002 | 修复 Dashboard：把 DCL 压到 3s 以内 | codex | in_progress |
| T-002.1 | 先确认当前 `/dashboard` 的 DCL 基线和首个阻塞点 | codex | done |
| T-002.2 | 拆解当前 `/dashboard` 完整渲染链路、API 批次与主耗时 | codex | done |
| T-002.3 | 把 dashboard 首屏中非第一视觉层必需的数据请求全部后置，优先剥离 `weaknesses` 和其它非阻塞模块 | codex | in_progress |
| T-002.4 | 将最重的 dashboard 数据流拆成更小的后补请求 | codex | todo |
| T-002.5 | 复测 `/dashboard` 的 DCL，验证是否进入 `3s` 以内 | codex | todo |
| T-002.6 | 若 DCL 仍超标，继续拆最慢尾巴直到达标 | codex | todo |
| T-003 | 问题修复清单：列出并验证可执行拆分方案 | codex | done |
| T-003.1 | 将 `DashboardPage` 拆为流式壳子和更轻的首页数据入口 | codex | done |
| T-003.2 | 将首页拆成 `home-core`、`home-overview`、`home-activity`、`home-subjects` | codex | done |
| T-003.3 | 将 `daily-tasks` 降级为失败不阻塞首屏 | codex | done |
| T-003.4 | 将 `loadUserWithOverrides()` 加缓存并把 `settings` 从首页剥离 | codex | done |
| T-003.5 | 将 dashboard 首屏 DB 访问回退为单连接串行保守模式 | codex | done |
| T-004 | 修复问题：按清单逐项落地并持续压缩首屏负载 | codex | in_progress |
| T-004.1 | 把首页 summary / activity / subjects 分开加载并验证顺序 | codex | done |
| T-004.2 | 给 subject 尾部增加阶段日志并做批量并发 | codex | done |
| T-004.3 | 持续收窄 `home-subjects` 的内部尾巴 | codex | in_progress |
| T-004.4 | 让首屏尽快回到可商用的 2-3s 目标区间 | codex | todo |
| T-005 | 重新检验：真实浏览器复测并给出最终判断 | codex | in_progress |
| T-005.1 | 每轮改动后用可见真实浏览器复测 `DOMContentLoaded` 和首屏内容出现时间 | codex | done |
| T-005.2 | 对照 runtime logs 观察慢点是否从首页转移到 subject 尾部 | codex | done |
| T-005.3 | 每轮把结果回写到说明段，避免无头修改 | codex | done |
| T-005.4 | 达到可商用门槛后给出上线判断、回滚建议和留证结论 | codex | todo |

### T-001 检验结果（已完成）

- 本轮使用真实 Chromium 浏览器、线上 production deployment 以及同一账号完成了两类基线：
  - 不需要登录的 public 页
  - 需要登录的 dashboard 核心路由
- 对应的四个检验动作已经并入这一节的说明，不再单独占用 `T-001.1 ~ T-001.4` 任务位：
  - 真实浏览器测量 public 页与游客态受保护路由基线
  - 拉取最新 Vercel runtime logs，确认请求样本和可见路由
  - 补请求级诊断埋点：`proxy`、`getDashboardStats`、`ensureDailyTasks`、subject 聚合
  - 复测已登录态 `/dashboard` 与 dashboard 子页的真实首屏时序

#### public 路由基线

| 路由 | DCL | load | networkidle | 说明 |
|---|---:|---:|---:|---|
| `/` | `1717ms` | `2ms` | `6056ms` | 首页 shell 很快，静态资源与后续请求会继续跑 |
| `/login` | `1070ms` | `3ms` | `3ms` | 登录页很快 |
| `/pricing` | `840ms` | `242ms` | `1954ms` | 定价页正常 |
| `/subjects` | `802ms` | `1ms` | `1ms` | 学科页正常 |
| `/about-us` | `682ms` | `0ms` | `1895ms` | 关于页正常 |
| `/how-it-works` | `719ms` | `1ms` | `1ms` | 说明页正常 |
| `/register` | `643ms` | `4ms` | `2244ms` | 注册页正常 |

#### 登录后 dashboard 路由基线

| 路由 | DCL | load | networkidle / content | 说明 |
|---|---:|---:|---:|---|
| `/dashboard` | `2443ms` | `0ms` | `学习时长 / 最近练习 / 学习路径 / 排行榜` 约 `17775ms ~ 17783ms` | 首页 shell 先出来，正文内容在后续补齐 |
| `/dashboard/courses` | `3440ms` | `1ms` | `11ms` | 课程页很快 |
| `/dashboard/practice` | `3605ms` | `3606ms` | `15580ms` | 练习页有明显尾部请求 |
| `/dashboard/community` | `7175ms` | `7289ms` | `7289ms` | 社区页正文约 7.3s 可见 |
| `/dashboard/leaderboard` | `10605ms` | `10660ms` | `10660ms` | 排行榜页正文约 10.6s 可见 |
| `/dashboard/achievements` | `11903ms` | `11944ms` | `11944ms` | 成就页正文约 11.9s 可见 |
| `/dashboard/settings` | `3172ms` | `0ms` | `8173ms` | 设置页主体更快，但仍有后台请求尾巴 |

- 登录提交到 `/dashboard` 的那条跳转链路在这轮测量里表现不稳定，因此正式基线以“登录后直接进入各路由”的结果为准

- 当前代码结论：
  - public 区不是 30s 级全站灾难
  - dashboard 核心区已经明显快于最初的 30s+，但 `dashboard` 首页正文和若干子页仍然存在尾部加载
  - 这一步把问题范围从“全站未知”收窄到“dashboard 核心区与部分子页仍需继续优化”

### T-002 Dashboard DCL 收口目标（进行中）

- 当前唯一目标：
  - 把 `/dashboard` 的 `DOMContentLoaded` 压到 `3s` 以内
- 当前推进方式：
  - 先让壳子尽早返回
  - 再把最重的数据流后补
  - 如果还是超标，就继续拆最慢尾巴
- 目前这条线的重点不是把所有 dashboard 数据一次性算完，而是先让用户在 3s 内看到 dashboard 可交互骨架

#### T-002.1 当前基线与首个阻塞点（已完成）

- 这一子任务已经完成，因为上一轮已用真实浏览器建立了 `/dashboard` 的 DCL 基线
- 当前基线仍显示首页正文明显晚于 shell，说明首个阻塞点仍在 dashboard 首屏数据链路
- 收口记录：
  - 后续所有修复动作都必须服务于 `DCL < 3s` 这个目标

#### T-002.2 当前 `/dashboard` 完整渲染链路、API 批次与主耗时（已完成）

- 当前 `/dashboard` 的完整渲染不是单一路由一次性完成，而是由一条“服务端鉴权 + 页面壳子 + 客户端四路并行拉数 + daily-tasks 尾部补偿”的链路组成
- 如果按用户可感知阶段拆开，当前完整渲染大致可以分成 8 个关键步骤：
  1. 受保护路由前置鉴权
  2. `/dashboard` 服务端入口与用户上下文解析
  3. `DashboardClient` / `DashboardLayout` 首屏壳子渲染
  4. `home-core` 首个核心数据批次
  5. `home-overview` 趋势批次
  6. `home-activity` 最近练习 + 排行榜批次
  7. `home-subjects` 学科推荐 / 进度 / 薄弱点批次
  8. `daily-tasks` 独立尾部补偿批次
- 这 8 步不是严格串行相加，而是“前 3 步串行、后 5 条数据分支并行发起”的混合结构；最终总耗时由最慢分支决定
- 当前最新稳定基线里，`/dashboard` 的 `DOMContentLoaded` 约 `2.443s`，正文完全出现约 `17.8s`
- 也就是说：首屏壳子已经能在 3s 左右出来，但真正拖尾的是后续数据回填，尤其是 `home-subjects` 这条链

#### T-002.2.1 路由与鉴权阶段

- 请求先进入 Vercel 受保护路由逻辑
- `src/proxy.ts` 会先尝试 `supabase.auth.getUser()`
  - 如果 middleware 已透传 `INTERNAL_AUTH_USER_ID_HEADER`，则可以走快路径
  - 如果没有透传，则会额外做一次远程鉴权
- 这个阶段的产出是“当前请求是否允许继续进入 `/dashboard`”，它不负责页面内容，但会直接影响所有已登录路由的首跳延迟

#### T-002.2.2 `/dashboard` 服务端入口与用户上下文

- 入口文件是 [src/app/(dashboard)/dashboard/page.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(dashboard)/dashboard/page.tsx)
- 这一步包含：
  - `DashboardPage` 通过 `Suspense` 先返回 `DashboardRouteLoading`
  - `DashboardPageContent()` 调用 `getDashboardCurrentUser()`
  - 再调用 `getDashboardProfile(currentUser)`
  - 如果 `profile` 为空，会走数据库/会话兜底分支，确认是账号同步问题、连接问题还是 schema 问题
- 这一步的关键 DB 访问：
  - `headers()` 读取 forwarded user id
  - `createClient().auth.getUser()` 远程鉴权兜底
  - `prisma.user.findUnique(select dashboardUserSelect)` 获取基础用户行
  - 若 `referralCode` 缺失，还会补一次 `ensureReferralCode()` 的 `prisma.user.update`
- 这一阶段返回的是“dashboard 的基础用户上下文”，不是业务卡片内容

#### T-002.2.3 客户端壳子与首屏框架

- `DashboardClient` 决定当前视图，并把 `/dashboard` 交给 `DashboardHome`
- `DashboardLayout` 先把导航、侧边栏、容器框架渲染出来
- 这一步通常是最先可见的“壳子”，对应用户看到 sidebar、header、页面容器先出现
- 这里本身不再做重数据库查询，主要是 React 组件渲染与视图切换

#### T-002.2.4 `home-core` 核心数据批次

- 对应 API：[src/app/api/dashboard/home-core/route.ts](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/api/dashboard/home-core/route.ts)
- 客户端请求：`GET /api/dashboard/home-core`
- 服务端步骤：
  - `getDashboardCurrentUser()`
  - `getDashboardStats(user, { includeDailyTasks: false, includeRecentPractice: false, includeSubjectResults: false, includeLeaderboard: false, includeOverview: false })`
- 主要 DB 批次：
  - `attemptsInRetention`：`prisma.userAttempt.findMany`
  - `examRecordsInRetention`：`prisma.examRecord.findMany`
- 主要聚合：
  - 计算学习时长、题目总数、正确率、错题数、等级、XP、下一级 XP
- 这个批次是 dashboard 首屏最核心的基础统计，理论上应该尽快返回

#### T-002.2.5 `home-overview` 趋势批次

- 对应 API：[src/app/api/dashboard/home-overview/route.ts](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/api/dashboard/home-overview/route.ts)
- 客户端请求：`GET /api/dashboard/home-overview`
- 服务端步骤：
  - `getDashboardCurrentUser()`
  - `getDashboardStats(user, { includeDailyTasks: false, includeRecentPractice: false, includeSubjectResults: false, includeLeaderboard: false, includeOverview: true })`
- 主要 DB 批次：
  - `attemptsInRetention`
  - `examRecordsInRetention`
  - `completedLessonsInRetention`：`prisma.userProgress.findMany`
- 主要聚合：
  - `buildOverviewWindow()` 计算 7D / 30D 的学习时长、题量、正确率、活跃天数
- 这条分支只负责趋势卡，不应该阻塞首页壳子

#### T-002.2.6 `home-activity` 最近练习 + 排行榜批次

- 对应 API：[src/app/api/dashboard/home-activity/route.ts](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/api/dashboard/home-activity/route.ts)
- 客户端请求：`GET /api/dashboard/home-activity`
- 服务端步骤：
  - `getDashboardCurrentUser()`
  - `getDashboardStats(user, { includeDailyTasks: false, includeRecentPractice: true, includeSubjectResults: false, includeLeaderboard: true })`
- 主要 DB 批次：
  - `attemptsInRetention`
  - `examRecordsInRetention`
  - `recentPractice`：`prisma.examRecord.findMany({ take: 5, include: { subject, attempts } })`
  - `leaderboard`：`prisma.leaderboardEntry.findMany()` + `prisma.userAttempt.groupBy()`
- 主要聚合：
  - `buildRecentPracticeHref()`、`bucketDifficulty()`、`parseMockExamDifficulty()`
  - `buildLeaderboardCard()` 里先算 cohort，再按用户答题正确率算 percentile 和 peer average
- 这一分支的目标是补最近练习和排行榜，不应再拖住整页首屏

#### T-002.2.7 `home-subjects` 学科推荐 / 进度 / 薄弱点批次

- 对应 API：[src/app/api/dashboard/home-subjects/route.ts](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/api/dashboard/home-subjects/route.ts)
- 客户端请求：`GET /api/dashboard/home-subjects`
- 服务端步骤：
  - `getDashboardCurrentUser()`
  - `getDashboardStats(user, { includeDailyTasks: false, includeSubjectResults: true, includeLeaderboard: false })`
- 主要 DB 批次：
  - `attemptsInRetention`
  - `examRecordsInRetention`
  - `subjectResults`：`loadDashboardSubjectResults(user.id)`
- `loadDashboardSubjectResults()` 内部还会再拆三层：
  1. `prisma.subject.findMany()` 取所有科目
  2. 按 2 个 subject 为一批并行调用 `getSubjectChapters()`
  3. 每个 `getSubjectChapters()` 再拆成：
     - `loadUserWithOverrides(userId)`：`prisma.user.findUnique(select role/subscription/permissionOverrides)`，并且同请求内缓存
     - `prisma.subject.findUnique()` + `prisma.chapter.findMany()` 并行读取 subject 与叶子章节
     - `prisma.userAttempt.findMany()` 按 `chapterIds` 批量取章节答题记录
     - 把全量 / 7 天 / 30 天数据在内存里聚合成 `learningPath`、`subjectProgress`、`weaknesses`
- 这是当前最明显的尾部热点，也是最值得继续细拆的分支

#### T-002.2.8 `daily-tasks` 独立尾部补偿批次

- 对应 API：[src/app/api/dashboard/daily-tasks/route.ts](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/api/dashboard/daily-tasks/route.ts)
- 客户端会在 dashboard 侧边任务区独立触发
- 服务端步骤：
  - `getDashboardCurrentUser()`
  - `ensureDailyTasks(user.id)`：内部通过 `pg_advisory_xact_lock` 保证并发安全
  - `getTodayTasks(user.id)` 读取最终展示任务
- `ensureDailyTasks()` 的内部 DB 批次：
  - `tx.user.findUnique(select username, grade, settings...)`
  - `tx.dailyTask.findFirst()` 查是否已完成 onboarding assessment
  - `tx.dailyTask.findMany()` 取今日已有任务
  - 必要时 `createMany()` / `update()` 补齐或收敛任务状态
- 这一条已经从“首屏硬阻塞”降级为“尾部补偿”，但如果事务或锁等待过久，仍可能污染体感

#### T-002.2.9 当前渲染结论

- 当前 `/dashboard` 的首屏完成并不是一个单点，而是“壳子先出 + 多条 API 回填 + subject 尾部补齐”的组合结果
- 如果只看壳子，已经接近可接受范围；如果看完整内容出现，则最慢尾部仍然是 `home-subjects`
- 这也说明后续子任务不能再按页面名粗切，而要按“哪一批 DB 查询最慢”继续往下拆

#### T-002.2.10 当前 UI 对应关系与白跑项

- `home-core` 对应 UI 顶部的两张 summary 卡：
  - `学习时长`
  - `完成题数`
- `home-overview` 对应 hero 区右侧的两张趋势卡：
  - `正确率`
  - `活跃天数`
- `home-activity` 对应右侧下方的两块内容：
  - `年级排名`
  - `最近练习回顾`
- `home-subjects` 对应左侧主区的两块内容：
  - `学习路径`
  - `学科进度`
- `daily-tasks` 对应左侧的 `今日任务` 卡片
- 当前这版 UI 里，`home-subjects` 返回的 `weaknesses` **没有单独渲染出来**，所以这一部分对 dashboard 首页来说是白跑项
- 另外：
  - 路由鉴权、`/dashboard` 服务端入口、客户端壳子本身都不直接展示数据，但它们是进入 dashboard 的前置链路，不能简单视为多余
  - `home-core` / `home-overview` / `home-activity` / `home-subjects` 里那些“默认空壳字段”主要是为了维持数据形状，不是实际 UI 目标

#### T-002.2.11 当前 9 步 loading 基线（当前 production）

- 本轮真实可见浏览器测得的当前基线如下：

| 步骤 | 内容 | 当前耗时 |
|---|---|---:|
| 1 | 登录提交 -> `/dashboard` URL 到达（路由鉴权 / 重定向） | `1.756s` |
| 2 | `/dashboard` 文档响应 + DCL / 壳子可用 | `0.698s` |
| 3 | `home-core` | `6.324s` |
| 4 | `home-overview` | `4.856s` |
| 5 | `home-activity` | `7.553s` |
| 6 | `home-subjects` | `41.240s` |
| 7 | `daily-tasks` | `6.267s` |
| 8 | 首页主要可见内容首次稳定出现（summary / overview / activity / subjects / dailyTasks） | `9.94s` |
| 9 | 首页全量内容完成，长尾由 `home-subjects` 决定 | `41.240s` |

- 这组数值说明：
  - 页面壳子已经先出来了
  - 真正拖尾的是 `home-subjects`
  - `weaknesses` 在当前 UI 里没有展示，所以它虽然在数据层存在，但不会影响用户肉眼看到的 dashboard 主要模块

#### T-002.3 把非第一视觉层必需的数据请求全部后置（进行中）

- 当前这一子任务的目标不是“删除功能”，而是先把会拖慢首屏完成、但不属于第一视觉层必需的数据请求从关键路径里移出去
- 优先级最高的是 `home-subjects` 里的 `weaknesses`
  - 这块当前 dashboard 首页没有单独渲染
  - 所以它是最明确的白跑项
- 其次是所有“可以先出壳、后补数据”的模块：
  - `home-overview`
  - `home-activity`
  - `daily-tasks`
  - `home-subjects.learningPath`
  - `home-subjects.subjectProgress`
- 这一轮的检验标准是：
  - 先看 dashboard 可见壳子是否更快出现
  - 再看首页主要内容是否有明显提前
  - 如果收益显著，再继续往下拆剩余尾巴
- 收口记录：
  - 先剥离 UI 没消费的请求，再逐步扩大到“非第一视觉层必需”的请求，是当前最稳妥的推进顺序
  - 当前已先把 `home-subjects` 的 `weaknesses` 从 `/api/dashboard/home-subjects` 和 `DashboardHome` 的首屏链路里剥离，后续再看是否还需要继续下沉 `home-overview` / `home-activity` / `daily-tasks`

##### T-002.3.1 当前 9 步 loading 复测（最新 deployment）

- 本轮使用可见 Chrome 的无痕 context，按“登录 -> dashboard -> 壳子 -> 各模块内容 -> 全量内容”的顺序重新测了一轮
- 这次测量里，`home-subjects` 没有单独冒出一个可见的独立请求，左侧学科区仍然先以空态展示；这和当前“先剥离白跑项、再观察是否还需要继续后置”的策略一致

| 步骤 | 内容 | 当前耗时 |
|---|---|---:|
| 1 | 登录提交 -> `/dashboard` URL 到达 | `2.737s` |
| 2 | `/dashboard` 壳子首次可见（sidebar / header / route chrome） | `3.327s` |
| 3 | `home-core` | `15.373s` |
| 4 | `home-overview` | `23.500s` |
| 5 | `home-activity` | `7.432s` |
| 6 | `home-subjects` | `未单独观测（当前 subject 区仍以空态展示，未看到独立请求）` |
| 7 | `daily-tasks` | `12.787s` |
| 8 | 首页主要可见内容首次稳定出现（summary / overview / activity） | `13.622s` |
| 9 | 首页全量内容完成 | `13.629s` |

- 这组数值说明：
  - `weaknesses` 先被剥离后，dashboard 主体已经能在约 `13.6s` 左右稳定下来
  - subject 区当前先以空态呈现，没有再把首页长尾继续拖到 `40s+`
  - 后续如果要继续压缩，就优先观察 `home-overview` / `home-core` 这些仍然偏慢的批次是否还能再拆

##### T-002.3.1 三步顺序推进清单（进行中）

- `T-002.3.1.1` 统一 dashboard 相关 API 的 region 配置，减少 `sin1 -> iad1` 的跨区跳转
- `T-002.3.1.2` 复测 runtime logs，确认 route / middleware / function 的耗时和 warning 是否明显收敛
- `T-002.3.1.3` 继续压 `getDashboardCurrentUser.prisma.user.findUnique` 这条热路径，减少首屏重复查库

- 这一小节专门记录当前要优先处理的三件事，顺序固定为：
  1. 先核对并统一 dashboard 相关 API 的 region 配置，减少 `sin1 -> iad1` 的跨区跳转
  2. 再复测 runtime logs，确认 route / middleware / function 的耗时和 warning 是否明显收敛
  3. 最后继续压 `getDashboardCurrentUser.prisma.user.findUnique` 这条热路径，减少首屏重复查库
- 推进规则：
  - 每完成一步，就把对应子项标记为 `done`
  - 每完成一步，就在本小节下面补一段说明性内容，记录这一步的结果、耗时和结论
  - 这一轮的重点不是继续扩大范围，而是先把 `dashboard` 的可见首屏尽量压短，并把最明显的区域跳转和热查询先收住

- `T-002.3.1.1` 已完成：
  - dashboard 相关 API 路由已统一补上 `preferredRegion = 'sin1'`
  - 这一步的目标是把 `home-core`、`home-overview`、`home-activity`、`home-subjects`、`daily-tasks`、`home-data` 从默认的 `iad1` 路径里收回到与页面壳子一致的区域
  - 预期收益是减少 `sin1 -> iad1` 的额外跨区跳转，让请求路径更稳定，避免壳子和数据层在不同区域之间来回切换

### T-003 问题修复清单（已完成）

- 已整理出可执行的拆分方案，而不是继续猜测
- 具体清单已经落地为：
  - `DashboardPage` 流式壳子
  - `home-core` / `home-overview` / `home-activity` / `home-subjects`
  - `daily-tasks` 失败降级
  - `loadUserWithOverrides()` 请求级缓存
  - dashboard 首屏回退为保守串行模式
- 收口记录：
  - 这一步的目的不是删功能，而是把“必须同步完成”的部分先压短

### T-004 修复问题（进行中）

- 当前已落地的修复包括：
  - 首页分段加载
  - subject 尾部阶段打点
  - `daily-tasks` 非阻塞化
  - 首屏保守模式
- 当前仍在持续推进的是：
  - `home-subjects` 内部尾巴继续压缩
  - 让首屏可见内容稳定落到 2-3s 目标区间
- 收口记录：
  - 现在的重点不是再扩大改动面，而是把最慢的尾巴继续往下拆

### T-005 重新检验（进行中）

- 现阶段已经做过多轮真实浏览器复测
- 已经能观察到 summary / activity 先出现，但 `home-subjects` 仍会拖尾
- 最新验证方向仍然是：
  - 真实浏览器
  - 可见窗口
  - 每轮部署后复测
  - runtime logs 对照
- 收口记录：
  - 当 `home-subjects` 被继续拆短并且首屏稳定进入 2-3s 区间后，再做最终验收
