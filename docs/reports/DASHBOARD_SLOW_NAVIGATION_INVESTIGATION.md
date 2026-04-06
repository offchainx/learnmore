# Dashboard 切换慢问题排查与推进清单

生成时间：2026-04-06  
适用范围：`/dashboard` 以及其主要子页 `community`、`practice`、`leaderboard`、`settings`、`courses`

## 1. 问题定义

当前线上现象不是单纯的“按钮点击慢”，而是：

- 登录后进入 `/dashboard` 的首屏等待时间过长
- 在 Dashboard 各子页之间切换时，页面可见状态切换明显迟滞
- 用户体感接近 30s，已经超过可接受范围

这类问题通常来自三层之一：

1. 路由前置鉴权太重
2. 首屏服务端聚合太重
3. 子页切换后又触发了额外请求/重渲染

## 2. 已验证事实

### 2.1 Vercel 侧事实

- 最新生产部署已可访问，且状态为 `READY`
- Runtime logs 中能看到 `/dashboard`、`/dashboard/community`、`/dashboard/practice`、`/dashboard/leaderboard`、`/dashboard/settings` 请求
- 现有 runtime logs 颗粒度不够，缺少足够的请求级耗时信息，不能直接证明 30s 卡在哪一步

### 2.2 代码侧事实

- `[src/proxy.ts](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/proxy.ts)` 会在每个受保护路由请求前执行 `supabase.auth.getUser()`
- `[src/app/(dashboard)/dashboard/page.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/app/(dashboard)/dashboard/page.tsx)` 已改为 `getDashboardProfile()` 与 `getDashboardStats()` 并行
- `[src/actions/dashboard.ts](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/dashboard.ts)` 的首屏聚合已改为并行查询，但仍保留 `ensureDailyTasks(user.id)` 作为前置步骤
- `[src/actions/gamification/daily-tasks.ts](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/gamification/daily-tasks.ts)` 内部仍有 advisory lock，之前是典型的潜在阻塞点
- `[src/actions/practice/data-service.ts](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/practice/data-service.ts)` 的 `getSubjectChapters()` 会进行批量章节统计，Dashboard 首页会间接调用它
- `[src/lib/permissions/load-user-scope.ts](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/lib/permissions/load-user-scope.ts)` 已做 `cache()` 复用，降低同请求内重复查用户范围的开销

### 2.3 当前已经落地的诊断补丁

- `proxy` 增加了 auth 耗时与总耗时日志
- `getDashboardStats()` 增加了 `ensureDailyTasks`、数据聚合、总耗时日志
- `ensureDailyTasks()` 已增加快路径，避免每次都先抢锁

## 3. 当前高概率根因

按优先级排序：

1. `src/proxy.ts` 中的远程 Supabase `getUser()` 仍可能是全站前置耗时源
2. `src/actions/dashboard.ts` 中的首屏聚合仍可能太重，尤其是 `getSubjectChapters()` 的扩展链路
3. `ensureDailyTasks()` 即便加了快路径，仍可能在少数用户状态下进入锁路径
4. 某些 Dashboard 子页仍然在挂载后触发额外请求，导致“切页后还要等一轮”
5. 区域与缓存策略不足，导致相同请求在不同入口上重复产生高成本

## 4. 对应任务锚点

这次排查不是新的独立大任务，而是横切影响以下任务的性能收口：

- `T-005`：`/dashboard` Dashboard 首页真实数据接入与功能对齐
- `T-016`：`/dashboard/leaderboard` 排行榜 + sidebar 经验值卡真实化
- `T-017`：`/dashboard/achievements` 成就 / XP / streak / 任务域真实化
- `T-018`：`/dashboard/settings` 全路由族真实化
- `T-019`：Public / Marketing / Auth 页面 CTA、表单、跳转与权限行为对齐
- `T-020`：本地验证：页面冒烟、Action/API 契约、SQL/后台快照留证

## 5. 排查与推进顺序

下面的顺序是固定的，后续只允许按这个顺序推进，避免上下文丢失。

### Step 1. 先抓请求级耗时

目标：

- 确认慢在 `proxy`，还是慢在 Dashboard 首屏，还是慢在子页客户端请求

动作：

1. 部署当前补丁
2. 访问 `/dashboard`、`/dashboard/community`、`/dashboard/practice`、`/dashboard/leaderboard`、`/dashboard/settings`
3. 读取 runtime logs 中新增的三类日志：
   - `[proxy] auth ...`
   - `[Dashboard] ensureDailyTasks ...`
   - `[Dashboard] data ...`

完成标准：

- 能明确看到每次请求的 auth 耗时
- 能明确看到 Dashboard 首屏三段耗时
- 如果总耗时仍高于可接受阈值，能判断瓶颈属于哪一层

### Step 2. 收紧 Dashboard 首屏链路

目标：

- 让 `/dashboard` 首屏只做必要工作

子任务：

1. 验证 `getDashboardProfile()` 与 `getDashboardStats()` 并行后的真实收益
2. 验证 `ensureDailyTasks()` 是否仍然命中锁路径
3. 验证 `loadDashboardSubjectResults()` 是否仍是首屏主耗时
4. 如果某一步仍重，再继续拆分成更细的批次查询或延后执行

完成标准：

- Dashboard 首屏不再被单一步骤拖到几十秒
- 日志里能看到每个步骤的耗时已经被压到可解释范围

### Step 3. 收紧子页切换链路

目标：

- 让切换到 `community`、`practice`、`leaderboard`、`settings` 时不再重复触发重查询

子任务：

1. 检查 `community` 是否在挂载后又触发额外 feed 请求
2. 检查 `leaderboard` 是否只消费缓存结果，不再回源
3. 检查 `settings` 是否存在不必要的前置数据请求
4. 检查 `practice` 与 `courses` 是否只拿基础 shell user，不额外拉重数据

完成标准：

- 子页切换的首屏时间明显下降
- 客户端没有多余的二次请求或循环更新

### Step 4. 调整缓存与区域策略

目标：

- 对能缓存的聚合数据，尽量从“每次重算”改成“可控刷新”

子任务：

1. 复核 `cacheTag` / `cacheLife` 是否覆盖到关键聚合
2. 复核 Dashboard / 子页是否被不必要地固定到不合适区域
3. 复核是否有某些请求在不同页面重复回源

完成标准：

- 重复切页时，关键模块命中缓存
- 区域不再成为明显放大器

### Step 5. 本地回归验证

目标：

- 确认性能修复不破坏功能正确性

子任务：

1. TypeScript 检查
2. ESLint 检查
3. 页面冒烟
4. 关键路径回归

完成标准：

- 不引入类型错误
- 不引入 lint 错误
- Dashboard 可用且数据口径不回退

## 6. 当前已完成的动作

- 已补 Dashboard 首屏并行化
- 已补 Dashboard 聚合日志
- 已给 `ensureDailyTasks()` 加快路径
- 已给 `proxy` 增加 auth 计时
- 已做类型检查与 ESLint 检查

## 7. 下一步只做什么

下一步只看两类证据：

1. 新部署后的 runtime logs
2. `/dashboard` 首屏与各子页切换的实际耗时

在证据出来之前，不再盲目扩大改动面。

