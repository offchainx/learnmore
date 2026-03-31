# T-026 全站响应时间优化工作底稿

> 用途：按 `T-026.1 -> T-026.12` 推进全站响应时间优化。  
> 当前进度：已完成 `T-026.1`，已启动 `T-026.2`，正在把真实浏览器采样结果收敛成统一目标值与验收口径。  
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
| Admin 路由 | `/admin/content` | `404 / 572ms` | 先修路径可用性，再谈性能 |
| Admin 路由 | `/admin/permissions` | `404 / 739ms` | 先修路径可用性，再谈性能 |

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
| Admin 路由可用性 | `/admin/content`、`/admin/permissions` | 先达到 `200`，再纳入速度验收 |

### 5. 验收规则
- 规则一：后续每次改造只和同一批路径对比，不新增随机样本。
- 规则二：如果真实总耗时暂时降不下来，也必须先把 `feedback_ms` 压到目标线内。
- 规则三：任何页面若仍出现“无反馈空窗期”，即使总耗时下降，也不能判定为通过。
- 规则四：Admin 路由如果还是 `404` 或权限异常，不进入速度验收，先算功能阻断。
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

## 本轮执行边界
- `T-026.1` 先完成测量范围、记录模板、热点路径确认，不在这一步混入实现改造。
- 真正的指标目标值、采样环境、验收阈值放到 `T-026.2`。
- 代码优化从 `T-026.3` 开始，再按 `T-025` 每步回写文档与测试结果。
