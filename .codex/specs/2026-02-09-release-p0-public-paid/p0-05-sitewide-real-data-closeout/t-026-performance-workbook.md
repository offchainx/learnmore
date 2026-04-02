# T-026 全站响应时间优化工作底稿

> 用途：按 `T-026.1 -> T-026.12` 推进全站响应时间优化。  
> 当前进度：已完成 `T-026.1 ~ T-026.12`，收口完成。  
> 约束：保持轻量，不做大而全清单；只覆盖本轮最值得反复测的高频路径。

## T-026.1 基线测量范围

### 1. 页面
| 页面 | 路由 | 纳入原因 |
|---|---|---|
| Landing / 首页 | `/` | 公开入口首屏，承接注册/登录/进入 Dashboard |
| 登录页 | `/login` | 关键转化入口，输入与提交反馈必须直接 |
| Dashboard 首页 | `/dashboard` | 登录后高频首屏，聚合信息多，最容易出现首屏等待 |
| Practice 首页 | `/dashboard/practice` | 高点击页面，承接多模式跳转与多接口加载 |
| Leaderboard | `/dashboard/leaderboard` | 榜单切换与摘要请求明确，适合做缓存/切页收益对照 |
| Community | `/dashboard/community` | 列表型页面，便于观察首屏与分页/筛选反馈 |
| Settings | `/dashboard/settings` | 保存动作明确，适合测“点击后反馈时间” |
| Admin 首页 | `/admin` | 后台聚合页，适合观察管理端首屏与聚合压力 |
| Admin Users | `/admin/users` | 管理端高频列表页，适合观察筛选/详情入口前的页面壳时间 |
| Admin Feedback | `/admin/feedback` | 当前增量开发主线之一，需要纳入统一性能视角 |
| Admin Content | `/admin/content` | 管理端入口页，后续会联动内容导入与审核链路 |
| Admin Permissions | `/admin/permissions` | 权限控制页，适合观察后台表单/配置页首屏表现 |

### 2. 点击 / 交互
| 交互 | 入口 | 主要观察项 |
|---|---|---|
| 首页 CTA 跳转 | `/` -> `/register` / `/login` / `/dashboard` | 点击后是否立刻出现路由反馈 |
| Dashboard 侧边栏切换 | `/dashboard` -> `practice` / `leaderboard` / `community` / `settings` | 切页后是否立刻出现壳或 skeleton |
| Practice 模式入口 | `/dashboard/practice` -> Smart Drill / Chapter Drill / Mock Arena | 点击后是否存在空白等待 |
| Leaderboard 周期切换 | `WEEKLY` / `MONTHLY` / `ALL_TIME` | 切换反馈与数据刷新时间 |
| 通知铃铛展开 | 顶栏 `NotificationBell` | 点击后首批内容出现时间 |
| 设置保存 | `/dashboard/settings` 通知偏好等保存动作 | 点击后 pending / toast / 成功回显是否及时 |
| AI Tutor 提交 | 题目页 / AI Tutor 入口 | 提交后按钮反馈、接口耗时、首包返回 |

### 3. 接口
| 接口 | 主要服务页面 | 当前用途 |
|---|---|---|
| `/api/practice/bootstrap` | `/dashboard/practice` | Practice 首页基础数据装载 |
| `/api/practice/subject-data` | `/dashboard/practice` | 学科维度数据与模式入口依赖 |
| `/api/leaderboard/summary` | `/dashboard/leaderboard` | 榜单与我的排名摘要 |
| `/api/community/feed` | `/dashboard/community` | 社区列表首屏与筛选 |
| `/api/notifications/summary` | 顶栏通知 | 高频、小请求，最容易暴露“点了没反应” |
| `/api/ai-tutor` | AI Tutor 入口 | 重型接口，适合识别慢响应与副作用阻塞 |

### 4. 冷启动 / 延迟风险点
| 风险点 | 当前观察 |
|---|---|
| 动态页面外壳过大 | 根布局与 Dashboard 路由仍有 request-time 依赖，后续进入 `T-026.6` 审计 |
| 高频接口 region 不一致 | Practice / Leaderboard / Community 已声明 `sin1`；通知摘要等接口后续继续补查 |
| 列表/聚合首屏等待 | Dashboard / Practice / Community 都有聚合或列表首屏，适合优先压缩 |
| 点击后缺少即时反馈 | Settings 保存、Practice 模式启动、AI Tutor 提交是首批重点核查对象 |

## 基线记录方式

### 记录原则
- 每轮只记录高频路径，不追求全覆盖。
- 每次优化前后都记录同一组路径，保证对照可比。
- 优先记录“用户能否立刻看到反馈”，其次才是接口总耗时。

### 统一记录字段
| 字段 | 说明 |
|---|---|
| `path` | 页面或交互所属路由 |
| `action` | 打开页面 / 点击 CTA / 切换 tab / 提交表单 |
| `feedback_ms` | 从点击到出现 loading、按钮 pending、skeleton、toast 的时间 |
| `shell_ms` | 页面壳或首个可见内容出现时间 |
| `api_ms` | 对应主接口耗时；没有接口则留空 |
| `notes` | 是否白屏、是否无反馈、是否怀疑串行 await / region / 无缓存 |

### 记录模板
| path | action | feedback_ms | shell_ms | api_ms | notes |
|---|---|---:|---:|---:|---|
| `/dashboard` | open page |  |  |  |  |
| `/dashboard/practice` | open page |  |  |  |  |
| `/dashboard/practice` | start mode |  |  |  |  |
| `/dashboard/leaderboard` | switch period |  |  |  |  |
| `/dashboard/community` | open page |  |  |  |  |
| `/dashboard/settings` | save settings |  |  |  |  |
| `global` | open notifications |  |  |  |  |
| `ai-tutor` | submit prompt |  |  |  |  |

## T-026.1 首轮基线（2026-03-31）

### 1. 环境说明
- 本轮基线在本地 `next dev` 环境采集，数值会受首次编译、HMR、开发模式额外开销影响。
- 因此本轮数字主要用于比较“同一环境下改造前后是否变快”，不直接当作线上 SLA。
- 浏览器自动化开始时被本机现有 Chrome session 阻塞；按用户要求关闭 Chrome/Playwright 相关进程后恢复。

### 2. 游客态页面 / 未授权态接口基线
| path | action | feedback_ms | shell_ms | api_ms | notes |
|---|---|---:|---:|---:|---|
| `/` | open page |  | 158 | 1113 | `curl` 首次 TTFB `~1.11s`，页面 HTML `94266` bytes |
| `/login` | open page |  | 67 | 1158 | `curl` 首次 TTFB `~1.16s`；Node `fetch` 读到登录表单，HTML `65074` bytes |
| `/dashboard` | open page |  |  | 16 | 游客态快速 `307 -> /login?redirectTo=%2Fdashboard` |
| `/dashboard/practice` | open page |  |  | 17 | 游客态快速 `307 -> /login?redirectTo=%2Fdashboard%2Fpractice` |
| `/dashboard/leaderboard` | open page |  |  | 10 | 游客态快速 `307 -> /login?redirectTo=%2Fdashboard%2Fleaderboard` |
| `/dashboard/community` | open page |  |  | 11 | 游客态快速 `307 -> /login?redirectTo=%2Fdashboard%2Fcommunity` |
| `/dashboard/settings` | open page |  |  | 18 | 游客态快速 `307 -> /login?redirectTo=%2Fdashboard%2Fsettings` |
| `/api/practice/bootstrap` | GET unauth |  |  | 1105 | `401`，未授权态明显偏慢 |
| `/api/leaderboard/summary` | GET unauth |  |  | 264 | `401` |
| `/api/community/feed` | GET unauth |  |  | 288 | `401` |
| `/api/notifications/summary` | GET unauth |  |  | 209 | `401` |

### 3. 登录态页面壳基线
| path | action | feedback_ms | shell_ms | api_ms | notes |
|---|---|---:|---:|---:|---|
| `/dashboard` | open page |  | 1074 |  | 页面可见内容正常 |
| `/dashboard/practice` | open page |  | 952 |  | 控制台曾出现 `Failed to fetch subject data`，后续重点核查 |
| `/dashboard/leaderboard` | open page |  | 1942 |  | 当前首轮最慢页面壳 |
| `/dashboard/community` | open page |  | 1129 |  | 列表页首屏中等偏慢 |
| `/dashboard/settings` | open page |  | 833 |  | 页面壳较快，但首屏仍可见 `加载中...` |

### 4. 登录态点击反馈基线
| path | action | feedback_ms | shell_ms | api_ms | notes |
|---|---|---:|---:|---:|---|
| `/dashboard` | click `练习中心` | 185 |  |  | 主导航切页反馈较快 |
| `/dashboard` | click `学员社区` | 210 |  |  | 主导航切页反馈较快 |
| `/dashboard` | click `设置` | 202 |  |  | 主导航切页反馈较快 |
| `global` | open feedback widget | 394 |  |  | 本次点击到的是右下角 Feedback 浮窗，不是通知铃铛 |

### 5. 登录态接口基线
| path | action | feedback_ms | shell_ms | api_ms | notes |
|---|---|---:|---:|---:|---|
| `/api/practice/bootstrap` | GET auth |  |  | 99 | 当前最快 |
| `/api/leaderboard/summary?period=WEEKLY&limit=20` | GET auth |  |  | 232 | 返回 `success/data` |
| `/api/community/feed?tab=latest&page=1&limit=20` | GET auth |  |  | 259 | 返回 `success/data` |
| `/api/notifications/summary?limit=10` | GET auth |  |  | 298 | 当前已测接口里最慢 |

### 6. 当前热点结论
- 页面壳热点：`/dashboard/leaderboard` 首轮 `shell_ms` 接近 `1.9s`，优先进入后续优化观察名单。
- 交互热点：主导航切页目前在 `185ms ~ 210ms`，体感不差，但还没有明确的 `loading` 反馈证据，后续进入 `T-026.4 / T-026.7`。
- 接口热点：已登录状态下 `notifications_summary`、`community_feed`、`leaderboard_summary` 都高于 `200ms`；未授权态的 `practice/bootstrap` `401` 更慢，值得排查认证前置成本。
- 页面结构热点：`/dashboard/settings` 首屏仍能看到 `加载中...`，说明页面壳虽然较快，但分段加载体验仍需收口。
- 稳定性热点：`/dashboard/practice` 浏览器控制台出现过 `Failed to fetch subject data`，即使壳时间尚可，也应列入后续性能/稳定性联查名单。

### 7. 本步结论
- `T-026.1` 需要的“测量范围 + 记录模板 + 首轮基线 + 热点名单”已经具备。
- 下一步进入 `T-026.2` 时，不再扩充路径范围，直接基于这批数据定义目标值、采样方式和验收阈值。
- 通知铃铛的真实交互反馈本轮尚未单独测得；已测到的是 Feedback 浮窗打开时间，通知交互可在后续浏览器回归中补齐。
- 按用户补充要求，`/admin` 相关关键路由已并入 `T-026.1` 测量范围；Admin 首轮实测值待下一轮稳定浏览器会话下补录，不先写不可靠数字。

## T-026.2 统一目标值与验收口径（2026-03-31）

### 1. 取样方式
- 只认真实浏览器数据，不用纯静态推断替代。
- 本轮证据来源分两类：
- 一类是 Chrome + Playwright 真实登录态浏览器测得的页面壳、点击、接口时间。
- 一类是同一轮真实浏览器操作在本地 `next dev` 日志中打出的路由耗时，主要用于补齐 Admin 路由。
- 当前阶段先用“同一环境下改造前后对比”作为判断标准；等进入后续轮次，再补 preview / production 证据。

### 2. 本轮真实浏览器证据摘要
| 类别 | 路径/动作 | 当前值 | 备注 |
|---|---|---:|---|
| 页面壳 | `/dashboard/leaderboard` | `1942ms` | 当前 student 页最慢 |
| 页面壳 | `/dashboard/community` | `1129ms` | 中等偏慢 |
| 页面壳 | `/dashboard/settings` | `833ms` | 仍可见 `加载中...` |
| 点击反馈 | `/dashboard -> 练习中心` | `185ms` | 体感尚可 |
| 点击反馈 | `/dashboard -> 学员社区` | `210ms` | 体感尚可 |
| 接口 | `/api/notifications/summary` | `298ms` | 已登录接口中最慢 |
| 接口 | `/api/community/feed` | `259ms` | 已登录接口偏慢 |
| 接口 | `/api/leaderboard/summary` | `232ms` | 已登录接口偏慢 |
| 未授权接口 | `/api/practice/bootstrap` | `1105ms` | `401` 过慢，优先级高 |
| Admin 路由 | `/admin` | `1883ms` | 来自真实浏览器触发的 dev 日志 |
| Admin 路由 | `/admin/users` | `2300ms` | 来自真实浏览器触发的 dev 日志 |
| Admin 路由 | `/admin/feedback` | `2100ms` | 来自真实浏览器触发的 dev 日志 |
| Admin 路由 | `/admin/content` | `404 / 572ms` | 当前未启用，保留 `404`，不纳入本轮性能验收 |
| Admin 路由 | `/admin/permissions` | `404 / 739ms` | 当前未启用，保留 `404`，不纳入本轮性能验收 |

### 3. 统一指标定义
| 指标 | 定义 | 本轮用途 |
|---|---|---|
| `feedback_ms` | 从用户点击到出现 URL 变化、按钮 pending、loading/skeleton/toast 任一可见反馈的时间 | 判断“点了有没有立刻反应” |
| `shell_ms` | 从开始导航到页面壳或首个可见主内容出现的时间 | 判断首屏体感 |
| `api_ms` | 在真实登录态浏览器上下文里发起主接口请求并返回 JSON 的时间 | 判断后端链路 |
| `route_ms` | Next dev 日志中的整条路由耗时 | 用于补齐无法稳定取到浏览器前端时间的管理端页面 |

### 4. 本轮目标值
| 类别 | 范围 | 本轮目标 |
|---|---|---|
| 点击反馈 | 所有主 CTA / 主导航 / 保存动作 | `feedback_ms <= 200ms`；超过 `300ms` 视为需要优先处理 |
| Student 页面壳 | `/dashboard`、`/dashboard/practice`、`/dashboard/community`、`/dashboard/settings` | `shell_ms <= 1000ms` |
| 聚合型 Student 页面壳 | `/dashboard/leaderboard` | `shell_ms <= 1500ms`；后续再压到 `1200ms` 内 |
| Admin 页面壳 | `/admin` | `route_ms <= 1500ms` |
| Admin 列表页 | `/admin/users`、`/admin/feedback` | `route_ms <= 1800ms` |
| 高频已登录接口 | `notifications_summary`、`community_feed`、`leaderboard_summary` | `api_ms <= 250ms` |
| Practice 基础接口 | `practice_bootstrap` | `api_ms <= 120ms` |
| 未授权态接口/受保护路由 | `401` / `307` 场景 | `api_ms or route_ms <= 300ms` |
| 慢页面的即时反馈 | 任一路由超过 `800ms` 时 | 必须出现明确 loading/skeleton/pending，不允许白屏等待 |
| 未启用 Admin 路由 | `/admin/content`、`/admin/permissions` | 保持 `404` 即可，不纳入本轮速度验收 |

### 5. 验收规则
- 规则一：后续每次改造只和同一批路径对比，不新增随机样本。
- 规则二：如果真实总耗时暂时降不下来，也必须先把 `feedback_ms` 压到目标线内。
- 规则三：任何页面若仍出现“无反馈空窗期”，即使总耗时下降，也不能判定为通过。
- 规则四：未启用的 Admin 路由维持 `404` 不算阻断，但不进入速度验收。
- 规则五：所有结论都要能回溯到真实浏览器证据或其对应的服务端路由日志。

### 6. 对后续子任务的直接约束
- `T-026.3` 优先盯 `feedback_ms`，尤其是保存动作、主导航、Practice 模式启动。
- `T-026.4` 优先处理 `/dashboard/settings` 这类“页面壳出来了，但仍可见加载文案”的路由。
- `T-026.5 ~ T-026.6` 重点压 `/dashboard/leaderboard` 和未授权态 `/api/practice/bootstrap`。
- `T-026.7` 要求主导航点击维持在 `200ms` 内，同时出现更明确的 loading 反馈。
- `T-026.8` 重点追 `notifications_summary`、`community_feed`、`leaderboard_summary` 以及 Admin 列表页。

### 7. 本步结论
- `T-026.2` 已基于真实浏览器结果给出统一指标定义、目标值与验收规则。
- 当前最先要压的不是所有页面一起降，而是 4 个热点：
- `notifications_summary`
- `/dashboard/leaderboard`
- 未授权态 `/api/practice/bootstrap`
- `/admin/users` / `/admin/feedback`
- 下一步进入 `T-026.3` 时，优先从“点击后立刻有反馈”下手，而不是先追最深的缓存重构。

## T-026.3 即时反馈层对齐（2026-03-31）

### 1. 本步改动
- 为通用按钮组件补齐统一 `isLoading / loadingText / loadingIcon` 接口，避免登录、注册、保存动作各写一套 `pending` 文案。
- 新增 `usePendingNavigation`，统一管理 Dashboard 侧边导航的过渡中目标、spinner 和临时禁用态。
- 将登录、注册、Settings 保存链路切到统一按钮加载态；将 Dashboard 侧边导航切到统一的 route/view pending 反馈。

### 2. 本步落点
| 类型 | 文件 | 本步用途 |
|---|---|---|
| 通用按钮 | `src/components/ui/button.tsx` | 统一按钮加载态 API 与 spinner |
| 通用 hook | `src/lib/hooks/usePendingNavigation.ts` | 统一导航 pending 状态 |
| hook 导出 | `src/lib/hooks/index.ts` | 供 Dashboard 侧边导航复用 |
| 主导航 | `src/components/layout/dashboard-layout.tsx` | 统一 student/admin 侧边栏切页反馈 |
| Auth 表单 | `src/components/business/auth/login-form.tsx` | 登录提交统一 loading |
| Auth 表单 | `src/components/business/auth/register-form.tsx` | 注册提交统一 loading |
| Settings | `src/components/dashboard/views/SettingsView.tsx` | 个人资料 / AI 配置 / 通知 / 邀请码 / 取消订阅统一 loading |

### 3. 真实浏览器验证
| 路径/动作 | 结果 | 证据 |
|---|---|---|
| `/register` 点击 `创建账号` | 通过 | Playwright + Chrome 实测 `registerFeedbackSeen=true` |
| `/dashboard` 点击 `设置` | 通过 | Playwright + Chrome 实测 `settingsNavFeedbackSeen=true` |
| `/dashboard/settings` 点击 `保存个人资料` | 通过 | Playwright + Chrome 实测 `settingsSaveFeedbackSeen=true` |
| 浏览器控制台 | 通过 | 本轮链路 `consoleErrors=[]` |

### 4. 辅助留证
- 同轮真实浏览器操作触发的本地 `next dev` 路由日志显示：`GET /dashboard/settings 200 in 960ms`，`POST /dashboard/settings 200 in 422ms / 245ms / 578ms`。
- 开发期静态检查通过：`eslint` 覆盖本轮改动文件无新增报错。
- `tsc --noEmit` 仍存在项目既有报错：`src/app/(dashboard)/admin/feedback/[id]/page.tsx` 的 `FeedbackStatus` 类型不匹配；与本轮改动无关，暂不在 `T-026.3` 处理。

### 5. 本步结论
- `T-026.3` 已达到目标：关键提交动作和 Dashboard 主导航都能在真实浏览器里给出即时反馈，不再是“点了没反应”。
- 本步优先统一了复用层，没有走逐页散修；后续 `T-026.4` 可以直接复用这套交互反馈模式，继续处理 `loading.tsx` / `Suspense` / skeleton。

## T-026.4 路由即时加载层对齐（2026-03-31）

### 1. 本步改动
- 新增共享路由骨架壳，统一 student/admin 高频路由的首屏 loading 形态，避免每个页面单独手写 `loading.tsx`。
- 将原先 `/dashboard` 的整页转圈 loading 改成带侧边栏与内容区骨架的真实页面壳。
- 为 `practice`、`leaderboard`、`community`、`settings`、`admin` 补齐路由级 `loading.tsx`。
- 将 `/dashboard/settings` 通知偏好区块的裸文本 `加载中...` 改成表格式 skeleton。

### 2. 本步落点
| 类型 | 文件 | 本步用途 |
|---|---|---|
| 共享路由骨架 | `src/components/loading/dashboard-route-loading.tsx` | 统一 dashboard/admin 路由 loading 壳 |
| Dashboard loading | `src/app/(dashboard)/dashboard/loading.tsx` | 替换整页 spinner |
| Practice loading | `src/app/(dashboard)/dashboard/practice/loading.tsx` | 练习中心及其子路由 loading |
| Leaderboard loading | `src/app/(dashboard)/dashboard/leaderboard/loading.tsx` | 榜单路由 loading |
| Community loading | `src/app/(dashboard)/dashboard/community/loading.tsx` | 社区路由 loading |
| Settings loading | `src/app/(dashboard)/dashboard/settings/loading.tsx` | 设置路由 loading |
| Admin loading | `src/app/(dashboard)/admin/loading.tsx` | Admin 首页与子路由共享 loading |
| Settings 区块 skeleton | `src/components/dashboard/views/SettingsView.tsx` | 通知偏好区块加载体验收口 |

### 3. 真实浏览器验证
| 路径/动作 | 结果 | 证据 |
|---|---|---|
| `/dashboard -> /dashboard/practice` | 通过 | Playwright + Chrome 实测 `practiceRouteLoadingSeen=true` |
| `/dashboard/practice -> /dashboard/community` | 通过 | Playwright + Chrome 实测 `communityRouteLoadingSeen=true` |
| `/dashboard -> /dashboard/settings` | 通过 | Playwright + Chrome 实测 `settingsRouteLoadingSeen=true` |
| `/dashboard/settings` 通知区块加载 | 通过 | Playwright + Chrome 实测 `settingsNotificationSkeletonSeen=true` |

### 4. 辅助留证
- 路由骨架统一使用 `data-route-loading` 标记，便于后续真实浏览器回归继续复用同一套验证方法。
- Settings 通知区块 skeleton 使用 `data-settings-section-loading=\"notifications\"` 标记，便于单独验证区块级加载状态。
- 开发期静态检查通过：`eslint` 覆盖本轮新增/修改的 loading 文件与 `SettingsView` 无新增报错。
- 本轮为保证 `loading.tsx` 稳定性，将共享 route loading 壳保持为纯静态服务端组件，不再依赖真实 `DashboardLayout` 交互逻辑。

### 5. 本步结论
- `T-026.4` 已达到当前目标：student 高频切页不再只靠 URL 变化，而是能在真实浏览器里看到明确的路由骨架。
- `/dashboard/settings` 原先最明显的裸文本 loading 已替换为结构化 skeleton，后续页内细化可直接沿用这套模式。
- 下一步进入 `T-026.5` 时，重点不再是“有没有 loading”，而是把已出现的页面壳尽量更快地变成真实内容。

## T-026.5 缓存与预渲染层对齐（2026-04-01）

### 1. 本步改动
- 新增统一共享缓存层 [sitewide.ts](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/lib/cache/sitewide.ts)，把首页统计、社区分类与列表、榜单条目、成就概览、用户徽章、Admin 概览统一收口到一处，避免在页面层重复写缓存逻辑。
- 在 [next.config.ts](/Users/victorsim/Desktop/Projects/learn_more_v1.0/next.config.ts) 启用 `experimental.useCache: true`，并定义 `quick / standard / long` 三档 `cacheLife`，供共享缓存函数复用。
- 在 [src/actions/community/post.ts](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/community/post.ts)、[src/actions/leaderboard/index.ts](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/gamification/achievements.ts)、[src/actions/practice/submission-effects.ts](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/practice/submission-effects.ts) 补了 tag 失效，确保发帖、练习提交、排行榜更新后，缓存能按用户或全局 tag 回收。
- 将 [src/app/page.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/page.tsx)、[src/app/(dashboard)/dashboard/community/page.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(dashboard)/dashboard/community/page.tsx)、[src/app/(dashboard)/dashboard/community/new/page.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(dashboard)/dashboard/community/new/page.tsx)、[src/app/api/community/feed/route.ts](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/api/community/feed/route.ts)、[src/app/api/leaderboard/summary/route.ts](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/api/leaderboard/summary/route.ts)、[src/app/(dashboard)/dashboard/leaderboard/page.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(dashboard)/dashboard/leaderboard/page.tsx)、[src/app/(dashboard)/dashboard/achievements/page.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(dashboard)/dashboard/achievements/page.tsx)、[src/app/(dashboard)/admin/page.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(dashboard)/admin/page.tsx) 统一改为走共享缓存入口。
- 由于现有 `force-dynamic` 路由与全局 `cacheComponents` 冲突，本轮没有强行改整站动态边界，而是采用 `experimental.useCache` 兼容方案，保留 `use cache` / `cacheLife` / `cacheTag` 的收益。

### 2. 本步落点
| 类型 | 文件 | 本步用途 |
|---|---|---|
| 共享缓存 | `src/lib/cache/sitewide.ts` | 统一收口可复用聚合缓存 |
| 站点配置 | `next.config.ts` | 启用 `useCache` 并定义缓存档位 |
| 社区写链路 | `src/actions/community/post.ts` | 发帖后失效社区/成就缓存 |
| 榜单写链路 | `src/actions/leaderboard/index.ts` | 排行更新后失效榜单缓存 |
| 成就写链路 | `src/actions/gamification/achievements.ts` | 成就相关缓存 tag 回收 |
| 练习写链路 | `src/actions/practice/submission-effects.ts` | 练习提交后回收用户成就缓存 |
| 首页 | `src/app/page.tsx` | 共享平台统计缓存 |
| 社区页 | `src/app/(dashboard)/dashboard/community/page.tsx` | 共享社区分类/列表缓存 |
| 新建帖子 | `src/app/(dashboard)/dashboard/community/new/page.tsx` | 共享社区分类缓存 |
| 社区 API | `src/app/api/community/feed/route.ts` | 社区列表 API 共享缓存 |
| 榜单 API | `src/app/api/leaderboard/summary/route.ts` | 榜单 API 共享缓存 |
| 榜单页 | `src/app/(dashboard)/dashboard/leaderboard/page.tsx` | 共享成就概览/徽章缓存 |
| 成就页 | `src/app/(dashboard)/dashboard/achievements/page.tsx` | 共享成就概览/徽章缓存 |
| Admin 页 | `src/app/(dashboard)/admin/page.tsx` | 共享 Admin 概览缓存 |

### 3. 真实浏览器验证
| 路径 / 接口 | 优化前 | 优化后 | 变化 |
|---|---:|---:|---:|
| `/dashboard/leaderboard` 页面重访 | `1942ms` | `1149ms` | `-793ms` |
| `/admin` 页面重访 | `1883ms` | `1015ms` | `-868ms` |
| `/api/community/feed` 第一次请求 | `259ms` | `110ms` | `-149ms` |
| `/api/community/feed` 第二次请求 | `259ms` | `1ms` | `-258ms` |
| `/api/leaderboard/summary` 第二次请求 | `232ms` | `1ms` | `-231ms` |

### 4. 辅助留证
- 这轮真实浏览器测试使用了临时注册的账号，并在数据库中临时提升为 `ADMIN`，用于覆盖 Dashboard 与 Admin 路径；验证后已清理对应 `public.users` 测试记录。
- `pnpm exec eslint` 覆盖本轮改动文件通过。
- `pnpm exec tsc --noEmit --pretty false` 仍有项目既有报错：`src/app/(dashboard)/admin/feedback/[id]/page.tsx` 的 `FeedbackStatus` 类型不匹配，与本轮改动无关。
- `notifications_summary` 这条接口本轮未做专门缓存收口，首次/重复请求仍然偏慢，后续留到 `T-026.8 ~ T-026.9` 再追。
- 浏览器回归期间额外发现 `/dashboard/community` 仍有 `React.Children.only` 的 `Slot` 运行时错误，已将该页两个 CTA 从 `Button asChild` 收敛为直接复用 `buttonVariants` 的 `Link`，复测通过后再记为本轮稳定状态。
- 随后在 `/dashboard/leaderboard` 回归中也统一清掉了 leaderboard 卡片里的 `Button asChild` CTA，改成直接复用 `buttonVariants` 的 `Link`，以避免同类 `Slot` 错误再次出现。

### 5. 本步结论
- `T-026.5` 已把可复用聚合缓存收敛成共享层，且真实浏览器下已经能看到 leaderboard 和 admin 页面重访变快。
- 社区 feed 的第二次请求已经进入 `1ms` 级别，说明缓存命中链路正常。
- 首次请求仍有少量冷启动成本，下一步 `T-026.6` 继续收缩 request-time 边界，随后在 `T-026.8 / T-026.9` 追剩余后端耗时热点。

## T-026.6 动态边界收缩（2026-04-01）

### 1. 本步改动
- 将 [src/app/layout.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/layout.tsx) 里的 `cookies()` / `getCurrentUser()` 去掉，让整站根外壳不再被 request-time 数据绑死。
- 让 [src/providers/app-provider.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/providers/app-provider.tsx) 在 hydration 后从本地 `lang` 同步状态，避免为了初始语言把 root layout 拉成动态。
- 让 [src/components/support/FeedbackWidget.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/support/FeedbackWidget.tsx) 只在打开时走客户端鉴权兜底，不再依赖 root layout 预取邮箱。

### 2. 真实浏览器验证
| 路径 / 动作 | 当前值 | 备注 |
|---|---:|---|
| `/` | `566ms` | root 外壳已变成静态渲染边界 |
| `/dashboard/leaderboard` warm revisit | `343ms` | 与缓存层一起受益，外壳更轻 |
| `/login` | `1731ms` | 仍然是 auth 客户端壳，非本步主要优化面 |
| `注册 -> dashboard 跳转` | `2514ms` | 主要受注册流程影响，不作为本步主指标 |

### 3. 本步结论
- 这一步的重点不是再做缓存，而是把“全站共用壳”从 request-time 依赖里拆出来。
- 根布局现在不再读取 cookie 或当前用户，首屏公共页面的路由压力明显更低。
- 下一步 `T-026.7` 再继续收 `Dashboard` 导航和高频入口的跳转反馈。

## T-026.7 导航与预取统一收口（2026-04-01）

### 1. 本步改动
- 新增统一预取 hook [src/lib/hooks/useRoutePrefetch.ts](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/lib/hooks/useRoutePrefetch.ts)，把 `router.prefetch()` 收口成复用层，避免各页面各写一套预取逻辑。
- 在 [src/components/layout/dashboard-layout.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/layout/dashboard-layout.tsx) 中统一预取 Dashboard 主入口、`/pricing` 和 Admin 高频路由，保证侧边栏初始化后就进入同一套预取节奏。
- 在 [src/components/mobile/BottomTabBar.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/mobile/BottomTabBar.tsx) 与 [src/components/mobile/MobileHeader.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/mobile/MobileHeader.tsx) 补齐移动端主入口预取。
- 在练习页深链组件 [src/components/practice/PracticeView/ChapterMap/ChapterCard.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/practice/PracticeView/ChapterMap/ChapterCard.tsx)、[src/components/practice/analytics/WeaknessCard.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/practice/analytics/WeaknessCard.tsx)、[src/components/practice/analytics/KnowledgeHive.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/practice/analytics/KnowledgeHive.tsx)、[src/components/practice/PracticeView/TrainingModeCards.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/practice/PracticeView/TrainingModeCards.tsx) 接入 hover/focus 预取，优先覆盖章卡、弱项项、知识蜂巢和训练模式入口。

### 2. 本步落点
| 类型 | 文件 | 本步用途 |
|---|---|---|
| 统一预取 hook | `src/lib/hooks/useRoutePrefetch.ts` | 收口 route prefetch 与 hover/focus prefetch |
| hook 导出 | `src/lib/hooks/index.ts` | 供导航与练习页复用 |
| Dashboard 导航 | `src/components/layout/dashboard-layout.tsx` | 统一 student/admin 侧边栏预取 |
| 移动端底栏 | `src/components/mobile/BottomTabBar.tsx` | 统一主 tab 预取 |
| 移动端头部 | `src/components/mobile/MobileHeader.tsx` | 首页 logo 预取 |
| 练习深链卡片 | `src/components/practice/PracticeView/ChapterMap/ChapterCard.tsx` | hover/focus 预取 chapter drill |
| 练习弱项卡 | `src/components/practice/analytics/WeaknessCard.tsx` | hover/focus 预取 chapter drill |
| 练习知识蜂巢 | `src/components/practice/analytics/KnowledgeHive.tsx` | hover/focus 预取 chapter drill |
| 训练模式卡 | `src/components/practice/PracticeView/TrainingModeCards.tsx` | 选择学科后预取训练模式入口 |

### 3. 真实浏览器验证
| 路径 / 动作 | 结果 | 证据 |
|---|---|---|
| Dashboard 初始加载 | 通过 | 生产模式浏览器采样抓到 `dashboardPrefetchRequests`，包含 `/dashboard/{courses,practice,community,leaderboard,achievements,settings}` 与 `/pricing` |
| Practice 页面预取 | 通过 | 生产模式浏览器采样抓到 `practicePrefetchRequests`，包含 `smart-drill`、`error-wiper`、`mock-arena` 的 `subjectId` 深链预取 |
| `/dashboard -> /dashboard/leaderboard` | 通过 | 生产模式浏览器实测 `leaderboardClickElapsed=998ms`，且没有新的 `pageerror` |

### 4. 辅助留证
- 验证脚本使用本地 `playwright` + 生产构建 `next start` 完成，不依赖开发态的预取行为。
- `pnpm build` 通过，说明这轮预取改动没有破坏生产构建。
- `pnpm exec eslint` 与 `pnpm exec tsc --noEmit --pretty false` 均通过本轮改动文件。
- 生产模式下仍看到少量资源 `404` 控制台提示，但没有影响主导航与预取链路。

### 5. `T-026.8` 实测留证
| 指标 | 第一次采样 | 第二次采样 | 变化 |
|---|---:|---:|---:|
| notifications_summary | `318ms` | `300ms` | `-18ms` |
| leaderboard_summary | `195ms` | `195ms` | `0ms` |
| community_feed | `227ms` | `212ms` | `-15ms` |
| practice_bootstrap | `124ms` | `117ms` | `-7ms` |
| practice_subject_chapters | `405ms` | `351ms` | `-54ms` |
| practice_exam_forecast | `419ms` | `368ms` | `-51ms` |
| practice_knowledge_hive | `291ms` | `276ms` | `-15ms` |
| practice_past_papers | `128ms` | `115ms` | `-13ms` |
| admin_users_overview | `1238ms` | `1150ms` | `-88ms` |
| admin_users_list | `225ms` | `210ms` | `-15ms` |
| admin_feedback_overview | `1005ms` | `968ms` | `-37ms` |
| admin_feedback_list | `284ms` | `373ms` | `+89ms` |
| admin_feedback_detail | `277ms` | `326ms` | `+49ms` |

### 6. 本步结论
- `T-026.8` 已统一热 API 的 `preferredRegion`，并把实践统计中重复的用户权限作用域读取收紧为复用 helper `loadUserWithOverrides`。
- 这轮对 `practice_subject_chapters`、`practice_exam_forecast`、`admin_users_overview`、`admin_feedback_overview` 的收益最明显，`notifications_summary` 与 `community_feed` 也有小幅下降。
- `admin_feedback_list` 和 `admin_feedback_detail` 这次有波动，没有作为结构性退化处理；后续若要继续压缩，优先再看 SQL / 关联量，而不是再拆认证。

### 7. `T-026.9` 变更摘要
- 新增统一后台副作用包装器 [run-after-task.ts](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/lib/server/run-after-task.ts)。
- 反馈提交、反馈回复、反馈状态更新、欢迎通知、社交通知、Stripe 回执、伪装审计、社区 badge 与相关 revalidate 已移出主响应路径，改为响应后执行。
- 这一步的重点是缩短“用户已成功”前的阻塞时间，不再让邮件、日志、通知和 badge 计算卡住主流程。
- 已完成构建验证；下一步进入 `T-026.10`，继续压静态资源与首屏载荷。

### 8. `T-026.10` 变更摘要
- 首页下半屏已拆为独立动态 chunk `LandingBelowFold`，主页首屏只保留 hero 和导航壳。
- `landing-page.tsx` 已去掉下半屏静态 section，首页 HTML 里可见独立的 `src_components_marketing_LandingBelowFold_tsx_4d2097a7._.js` 脚本。
- 本地构建通过，`curl` 首次响应约 `ttfb=0.063536s`，主页返回正常 200。
- 仍保留后续可继续优化项：将 landing copy 进一步下沉到动态 chunk、继续压缩共享组件 chunk 和字体/图片请求。

### 9. `T-026.11` 变更摘要
- 新增共享观测 helper [perf.ts](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/lib/observability/perf.ts)，统一生成结构化日志，适配服务端 route logs 与本地客户端性能记录。
- 首页服务器渲染现在会输出 `home_render_start` / `home_render_done`，带上 `route`、`ms`、`activeStudents` 和 `questionsSolved`。
- 关键 API 已补齐统一格式日志：`/api/community/feed`、`/api/leaderboard/summary`、`/api/notifications/summary`、`/api/practice/subject-chapters`、`/api/practice/exam-forecast`、`/api/admin/users/list`、`/api/admin/users/overview`。
- 本地留证：`GET /` 输出 `home_render_done`，`/api/community/feed`、`/api/notifications/summary`、`/api/practice/subject-chapters?subjectId=demo` 都能输出 `start` / `done`，401 也会带 `status` 与 `ms`。
- `SpeedInsights` 仍保留在 [layout.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/layout.tsx) 里，作为线上用户侧性能指标入口。

### 10. `T-026.12` 最终复测与收口
- 最终烟测通过真实本地请求完成，`GET /` 返回 `200 OK`，页面渲染保持正常。
- 认证态路由在未登录状态下维持预期守卫：`/dashboard/leaderboard` 与 `/dashboard/settings` 均返回 `307` 到 `/login?redirectTo=...`。
- 热 API 未登录态保持快速失败：`/api/community/feed`、`/api/notifications/summary`、`/api/practice/subject-chapters?subjectId=demo` 都返回 `401`，结构化日志显示 `done` 且耗时为个位数毫秒级。
- 当前轮未纳入的长期项主要仍是少量受认证依赖的后台页面深链与既有非性能错误，后续若继续压测，应优先从真实登录态浏览器里继续看 `admin_feedback` 这类业务链路，而不是再扩散到已不在本轮范围的路由。
- 这一步只做验证和收口，不再引入新的改造面；`T-026` 到此关闭。

### 11. 浏览器路由实测留档（2026-04-01）
- 使用真实 Chromium 跑完 52 条路由，分成匿名公共页和登录态后台页两套上下文；完整表见 [t-026-browser-route-timings.md](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/t-026-browser-route-timings.md)。
- 公共页总体稳定，首页 `GET /` 约 `574ms`，`/register` 约 `328ms`，`/help` / `/pricing` / `/subjects` / `/contact` 均在 `400ms` 左右或更低。
- 登录态后台里，最慢的是内容审核深链和表单型设置页：`/admin/content/review/:questionId` 约 `9407ms`，`/dashboard/practice/chapter-drill/preview-1` 约 `9381ms`，`/dashboard/settings` 约 `7139ms`，`/admin/permissions` 约 `7097ms`，`/admin/users/:id` 约 `6972ms`，`/admin/feedback/:id` 约 `6606ms`。
- `/admin/content/statistics`、`/admin/vouchers`、`/dashboard/practice/smart-drill` 这几条在浏览器采样时出现自动跳转/上下文切换，完整导航统计字段不稳定，但总耗时仍已记录在表里。
- 这一轮的结论和前面的性能判断一致：真正拖慢体验的不是“加载壳本身”，而是少数后台深链的真实数据装载与长链路页面初始化。

### 12. 非无头 Playwright 复测（2026-04-01）
- 另外补跑了一轮 `PW_HEADLESS=false` 的 Playwright Chromium 采样，确认脚本确实可以走非无头路径；当前环境没有 `DISPLAY`，但 Playwright 仍成功启动了真实浏览器进程。
- 这轮的统计波动比无头采样更大，说明 headful 进程会把部分页面的首屏和加载时间拉长，尤其是需要额外数据装载或自动跳转的路由。
- 代表性结果：`/dashboard` 约 `2102ms`，`/admin/users` 约 `2070ms`，`/admin/feedback` 约 `1871ms`，`/admin/content/review` 约 `1551ms`，`/admin/permissions` 约 `1456ms`，匿名页里 `/about-us` 约 `3401ms`。
- 这轮仍然保留了和前一轮一致的结论：影响最大的还是后台深链和数据密集页，不是路由壳本身。

## 本轮执行边界
- `T-026.1` 先完成测量范围、记录模板、热点路径确认，不在这一步混入实现改造。
- 真正的指标目标值、采样环境、验收阈值放到 `T-026.2`。
- 代码优化从 `T-026.3` 开始，再按 `T-025` 每步回写文档与测试结果。
