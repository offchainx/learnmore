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
- `[src/actions/gamification/daily-tasks.ts](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/gamification/daily-tasks.ts)` 内部仍有 advisory lock，只是现在已经补了快路径
- `[src/actions/practice/data-service.ts](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/practice/data-service.ts)` 的 `getSubjectChapters()` 仍然是 dashboard 聚合链路中的重节点
- `[src/lib/cache/sitewide.ts](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/lib/cache/sitewide.ts)` 已经有 `cacheTag` / `cacheLife`，但哪些路由真正命中缓存、哪些仍重复回源，还需要继续核实

### 2.5 当前已经落地的诊断补丁

- `proxy` 已增加 auth 耗时与总耗时日志
- `getDashboardStats()` 已增加 `ensureDailyTasks`、主查询批次、总耗时日志
- `ensureDailyTasks()` 已增加无锁快路径，避免无变化时仍先抢锁
- `loadDashboardSubjectResults()` 已改为并行 subject 聚合
- `loadUserWithOverrides()` 已增加同请求内缓存

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

## 5. 全站线上切换性能排查子任务

| id | description | owner | status |
|---|---|---|---|
| T-PERF.1 | 盘点线上部署后的全站关键切换路径，划分 public、auth、protected、dashboard-core 四类路径优先级 | codex | done |
| T-PERF.2 | 使用 Playwright 真实浏览器测量线上 public 页与未登录受保护路由的基线响应时间 | codex | done |
| T-PERF.3 | 拉取最新 Vercel runtime logs，建立线上路由请求样本并确认首轮问题集中区 | codex | done |
| T-PERF.4 | 补请求级诊断埋点：`proxy`、`getDashboardStats`、`ensureDailyTasks`、subject 聚合 | codex | done |
| T-PERF.5 | 使用已登录真实浏览器测量 `/dashboard` 与主要 dashboard 子页的首屏与切页时序 | codex | todo |
| T-PERF.6 | 验证保护路由前置鉴权是否为主瓶颈，并决定是否要把 `supabase.auth.getUser()` 从热路径移出或降频 | codex | todo |
| T-PERF.7 | 验证 dashboard、practice、community、leaderboard、settings 的服务端聚合与客户端二次请求开销 | codex | todo |
| T-PERF.8 | 收敛缓存、区域与重复回源策略，降低线上重复切页的回源成本 | codex | todo |
| T-PERF.9 | 建立“可商用化”性能门槛与验收阈值，明确 public 与 protected 两套标准 | codex | todo |
| T-PERF.10 | 完成上线前复测、留证、回滚建议与最终发布判断 | codex | todo |

说明：
- `T-PERF.5` 到 `T-PERF.10` 仍然保留为测量、验证与收口任务
- 下方新增的“Dashboard 首屏修复子任务”是从当前结论里拆出来的真正推进动作
- 后续每完成一个修复子任务，就在本节下方追加对应的说明性内容
- 说明块的写法参考下面已经完成的 `T-PERF.1` 到 `T-PERF.4`，保持“结果 / 收口记录 / 当前结论”的推进格式

### Dashboard 首屏修复子任务

| id | description | owner | status |
|---|---|---|---|
| T-PERF.FIX.1 | 将 `DashboardPage` 改为并行获取 `profile` 和 `stats` | codex | done |
| T-PERF.FIX.2 | 将 `getDashboardStats()` 里的串行查询拆成并行查询 | codex | done |
| T-PERF.FIX.3 | 给 `loadUserWithOverrides()` 加请求级缓存 | codex | done |
| T-PERF.FIX.4 | 将 `loadDashboardSubjectResults()` 的 subject loop 改成批量并发 | codex | done |
| T-PERF.FIX.5 | 评估并移出 `ensureDailyTasks()` 从首屏关键路径 | codex | done |

### T-PERF.FIX.1 ~ T-PERF.FIX.5 执行规则

- 这 5 条不是 `T-PERF.5` 的一部分，`T-PERF.5` 仍然只负责已登录真实浏览器测量
- 这 5 条是从当前证据中抽出来的修复动作，按“先并行、再缓存、再降首屏阻塞”的顺序推进
- 每完成一个子任务，就在本节下方补对应的说明块，写法与 `T-PERF.1` 到 `T-PERF.4` 保持一致

### T-PERF.FIX.1 DashboardPage 并行化结果（已完成）

- 结果：
  - `[src/app/(dashboard)/dashboard/page.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(dashboard)/dashboard/page.tsx)` 已改为同时启动 `getDashboardProfile()` 与 `getDashboardStats()`
  - 首屏不再等待 profile 完成后才开始统计查询

- 收口记录：
  - 这一步只消除明显串行等待，不改变数据口径
  - 后续已登录真实浏览器测量需要验证这次并行化是否真的缩短首屏等待

- 当前结论：
  - `DashboardPage` 已从“串行入口”收敛为“并行入口”
  - 这是 dashboard-core 首屏路径的第一层降阻

### T-PERF.FIX.2 getDashboardStats 并行化结果（已完成）

- 结果：
  - `[src/actions/dashboard.ts](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/dashboard.ts)` 中原先顺序执行的统计查询已改为并行启动
  - `dailyTask`、`userAttempt`、`examRecord`、`userProgress`、`recentPractice`、`subjectResults`、`leaderboard` 现在都进入同一轮并行收集

- 收口记录：
  - 原先的串行等待已被拆掉，`leaderboard` 也改为从已启动的 retention 查询结果推导
  - 这一步需要配合 runtime logs 继续确认是否还有新的慢查询在拖尾

- 当前结论：
  - dashboard 首屏的主要数据批次已经从串行链路收敛为并行链路
  - 如果后续仍慢，问题更可能落在单条慢查询或鉴权热路径，而不是这一层的顺序等待

### T-PERF.FIX.3 loadUserWithOverrides 缓存结果（已完成）

- 结果：
  - `[src/lib/permissions/load-user-scope.ts](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/lib/permissions/load-user-scope.ts)` 已用 `cache()` 包裹
  - 同一请求内重复读取用户范围时，不再反复回源

- 收口记录：
  - 这一步主要减少 dashboard 聚合链路里重复读取用户范围的开销
  - 该缓存仅作用于同请求周期，不改变跨请求的数据一致性

- 当前结论：
  - 这层优化针对的是“重复回源”，不是单次查询慢
  - 如果切页仍卡，后续要继续看是否还有其他重复鉴权或重复权限读取

### T-PERF.FIX.4 loadDashboardSubjectResults 并发化结果（已完成）

- 结果：
  - `[src/actions/dashboard.ts](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/dashboard.ts)` 中的 subject 聚合已改为 `Promise.all`
  - 每个 subject 的失败都会被单独收敛，不再让一个 subject 的慢查询拖住整轮串行循环

- 收口记录：
  - 原先的 subject loop 是 dashboard 首屏的典型 N+1 放大点
  - 现在已经把“按 subject 顺序等待”的尾部延迟拆掉

- 当前结论：
  - subject 维度的聚合已经从串行改为并发
  - 如果后续还慢，下一步应继续定位是否是单个 subject 的查询本身过慢，或者是更上游的鉴权与任务补全逻辑

### T-PERF.FIX.5 ensureDailyTasks 脱离首屏关键路径结果（已完成）

- 结果：
  - `[src/actions/dashboard.ts](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/dashboard.ts)` 已不再在首屏路径里同步等待 `ensureDailyTasks(user.id)`
  - 该逻辑已改为后台调度执行，首屏可以先继续渲染 dashboard 数据

- 收口记录：
  - `ensureDailyTasks()` 本身仍保留无锁快路径与必要写入分支
  - 变化点在于它不再阻塞 dashboard 首屏关键路径

- 当前结论：
  - 首屏阻塞风险最大的副作用已经从同步路径移出
  - 如果登录后仍出现长时间 skeleton，更可能是其他数据聚合或前置鉴权在拖慢

### T-PERF.1 路径盘点结果（已完成）

- 本次排查不再只盯 `/dashboard`
- 当前需要覆盖的路径被分成四组：
  - public：`/`、`/pricing`、`/subjects`、`/about-us`、`/how-it-works`
  - auth：`/login`、`/register`
  - protected redirect：未登录访问 `/dashboard*` 时的跳转链路
  - dashboard-core：已登录后的 `/dashboard`、`/dashboard/community`、`/dashboard/practice`、`/dashboard/leaderboard`、`/dashboard/settings`

- 当前结论：
  - public 区已经具备首轮浏览器基线
  - 真正的高风险区仍然是 dashboard-core

- 收口记录：
  - `T-PERF.1` 已完成，后续所有排查都按这四类路径推进，不再把问题模糊成“某个页面慢”

### T-PERF.2 Playwright 真实浏览器基线结果（已完成）

- 本次已通过 Playwright 真实浏览器访问线上部署
- 已验证 public 区首轮基线：
  - `/` 约 `564ms / 2045ms`
  - `/login` 约 `375ms / 1054ms`
  - `/pricing` 约 `679ms / 1825ms`
  - `/subjects` 约 `714ms / 1731ms`
  - `/about-us` 约 `781ms / 1542ms`
  - `/how-it-works` 约 `716ms / 1493ms`
  - `/register` 约 `708ms / 1908ms`
- 已验证游客态访问受保护路由时，重定向到登录页约 `365ms ~ 443ms` 的 `domcontentloaded`、`1.0s ~ 1.1s` 的总稳定时间

- 当前代码结论：
  - public 区不是“30s 级全站灾难”
  - 保护路由的游客态跳转也不是主问题
  - 下一步必须补已登录态浏览器测量，否则无法对 dashboard-core 的真实体感下最终结论

- 收口记录：
  - `T-PERF.2` 已完成，线上真实浏览器证据已经补入文档

### T-PERF.3 Runtime logs 样本结果（已完成）

- 已确认线上日志里存在 dashboard 相关请求样本
- 当前可见路径包括：
  - `/dashboard`
  - `/dashboard/community`
  - `/dashboard/practice`
  - `/dashboard/leaderboard`
  - `/dashboard/settings`
- 当前不足：
  - 只有请求样本，没有足够细的阶段耗时
  - 不能只依赖平台默认日志，需要自有诊断埋点继续补证据

- 收口记录：
  - `T-PERF.3` 已完成，线上问题集中区已经从“全站未知”收敛为“主要看 dashboard-core”

### T-PERF.4 诊断埋点补丁结果（已完成）

- 当前已经落地的改动包括：
  - `[src/proxy.ts](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/proxy.ts)`：新增 auth 耗时与总耗时日志
  - `[src/actions/dashboard.ts](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/dashboard.ts)`：新增 `ensureDailyTasks`、主查询批次、总耗时日志
  - `[src/actions/gamification/daily-tasks.ts](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/gamification/daily-tasks.ts)`：新增快路径，避免无变化时先抢锁
  - `[src/app/(dashboard)/dashboard/page.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(dashboard)/dashboard/page.tsx)`：将 dashboard 首页 profile/stats 改为并行
  - `[src/lib/permissions/load-user-scope.ts](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/lib/permissions/load-user-scope.ts)`：增加请求级缓存

- 当前代码结论：
  - 现在不是“没证据”，而是“等新部署后的 runtime logs 把证据吐出来”
  - 在新的分段日志出来前，不应继续盲目扩大改动面

- 收口记录：
  - `T-PERF.4` 已完成，下一阶段的判断将基于请求级耗时而不是猜测

## 6. 当前已完成动作

- 已把问题范围从“dashboard 慢”升级成“Vercel 线上全站切换性能收口”
- 已补 Playwright 真实浏览器线上基线
- 已补 Vercel runtime logs 样本事实
- 已补 `proxy` / `dashboard` / `dailyTasks` 请求级诊断埋点
- 已把推进顺序改成子任务清单，后续可以逐项收口

## 7. 下一步只做什么

下一步只做三件事：

1. 获取已登录态下的 Playwright 真实浏览器时序
2. 用新部署后的 runtime logs 核对 `proxy`、`ensureDailyTasks`、主查询批次耗时
3. 根据证据决定先压 auth 热路径，还是先压 dashboard-core 的聚合与二次请求

在这三步完成前，不再把问题泛化成新的大改造。
