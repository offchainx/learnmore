# T-009.1 `/admin` 首页盘点工作底稿

> 用途：按 `T-009.1` 先把 `/admin` 首页现状、数据入口、跳转出口、角色边界和残留死链盘清，为后续 `T-009.2 ~ T-009.9` 提供事实依据。  
> 当前进度：初版已完成，待后续开发/修复/验证回填。

## 1. 页面入口与外壳

### 1.1 路由与权限门禁
| 项 | 当前状态 | 说明 |
|---|---|---|
| 路由 | `/admin` | 管理台首页主入口 |
| 页面文件 | `src/app/(dashboard)/admin/page.tsx` | 服务端页面，先读 `getProfile()` 再拉首页聚合数据 |
| 访问门禁 | `ADMIN` / `TEACHER` 可进入 | `ADMIN` 与 `TEACHER` 通过首页；其他角色重定向到 `/dashboard` |
| 数据入口 | `getCachedAdminDashboardOverview(initialWindow)` | 读缓存包装后的首页聚合数据 |
| 缓存标签 | `admin-dashboard-overview` | 当前首页聚合的统一缓存 tag |
| 刷新方式 | `router.refresh()` + `window` query 切换 | 页面壳通过路由刷新和 query 参数切换窗口 |

### 1.2 页面壳组件
| 组件/模块 | 文件 | 作用 | 当前备注 |
|---|---|---|---|
| `AdminDashboardPage` | `src/app/(dashboard)/admin/page.tsx` | 服务端鉴权、窗口参数解析、调用缓存聚合 | 不承载业务渲染 |
| `AdminClientWrapper` | `src/components/admin/common/AdminClientWrapper.tsx` | 管理端共用壳层 | 提供管理视图上下文 |
| `AdminDashboardV2` | `src/components/admin/dashboard/v2/AdminDashboardV2.tsx` | 首页主体渲染 | 当前首页主实现 |
| `loading.tsx` | `src/app/(dashboard)/admin/loading.tsx` | 加载态 | 需要与页面壳一起保持一致 |

## 2. 首页模块清单

### 2.1 现有模块总览
| 模块 | UI 标题 | 数据来源 | 当前角色可见性 | 跳转 / 交互 | 备注 |
|---|---|---|---|---|---|
| 头部 | `管理总览` | `window` query + `lastUpdated` | `ADMIN` / `TEACHER` | 周期切换、刷新按钮 | 显示今日/本周/本月视角 |
| KPI 行 | `管理概览` | `kpis` | `ADMIN` / `TEACHER` | 无直接跳转 | 5 个卡片，按 role 过滤后最多展示 4 个 |
| 工作队列 | `今日必须处理` | `workQueue` | `ADMIN` / `TEACHER` | 点击卡片跳转到对应处理页 | 当前用真实待办列表驱动 |
| 风险面板 | `最近告警` | `risks` | 仅 `ADMIN` | 点击卡片跳转到对应处理页 | `TEACHER` 不展示该面板，显示占位 |
| 审计表 | `最近操作审计` | `audits` | `ADMIN` / `TEACHER` | 点击审计条目或“查看全部日志” | 当前“查看全部日志”仍有旧死链 |
| 角色占位 | `当前角色不展示风险面板` | 无 | `TEACHER` | 无 | 仅在 `TEACHER` 且不看风险面板时展示 |

### 2.2 当前没有独立渲染但已有数据的内容
| 数据项 | 来源 | 是否在首页实际渲染 | 备注 |
|---|---|---|---|
| `actions` / quick actions | `getAdminDashboardOverview()` 返回的 `QUICK_ACTIONS` | 否 | 首页组件当前没有单独的 quick action 区块 |
| `qa1` 内容审核 | `QUICK_ACTIONS` | 否 | 数据存在，但未在首页 UI 中渲染 |
| `qa2` 用户管理 | `QUICK_ACTIONS` | 否 | 数据存在，但未在首页 UI 中渲染 |
| `qa3` 权限配置 | `QUICK_ACTIONS` | 否 | 当前指向已废弃的 `/admin/permissions`，属于死链风险 |
| `qa4` 学员反馈 | `QUICK_ACTIONS` | 否 | 数据存在，但未在首页 UI 中渲染 |
| `qa5` 优惠券管理 | `QUICK_ACTIONS` | 否 | 数据存在，但未在首页 UI 中渲染 |

## 3. 数据源矩阵

### 3.1 首页聚合读取链路
| 页面字段 / 模块 | 当前读取入口 | 主要数据源 | 备注 |
|---|---|---|---|
| `window` | `src/app/(dashboard)/admin/page.tsx` | `searchParams.window` | 仅支持 `TODAY` / `WEEK` / `MONTH` |
| `kpis` | `buildAdminDashboardOverview()` | `users`, `userProgress`, `userFeedback`, `questionReport`, `securityLog` | KPI 为聚合结果，不是单表直出 |
| `workQueue` | `buildWorkQueue()` | `userFeedback`, `questionReport` | 来自待处理反馈与待审核报错 |
| `risks` | `buildRiskItems()` | `securityLog` | 仅过滤安全/权限敏感事件 |
| `audits` | `buildAuditItems()` | `securityLog` | 直接读取安全日志并做展示映射 |
| `lastUpdated` | `buildAdminDashboardOverview()` | `new Date().toISOString()` | 当前为构建时刻 |

### 3.2 首页 KPI 口径
| KPI | 展示文案 | 口径来源 | 数据说明 |
|---|---|---|---|
| `kpi-active-users` | 活跃用户 | `users.lastSignInAt` | 统计当前窗口内活跃用户数量 |
| `kpi-paid-users` | 付费用户 | `users.subscriptionTier` | 统计付费订阅用户总量 |
| `kpi-completion` | 课程完成率 | `userProgress.isCompleted` | 按窗口内更新的课程进度计算完成率 |
| `kpi-tickets` | 待处理工单 | `userFeedback` + `questionReport` | 待处理反馈与待审核报错的合计 |
| `kpi-system-errors` | 系统异常 | `securityLog` | 风险事件计数，属于异常信号 |

### 3.3 工作队列口径
| 队列项 | 展示文案模式 | 数据来源 | 当前跳转 |
|---|---|---|---|
| 内容报错待审核 | `内容问题待审核: ${issueType}` | `questionReport` 中 `PENDING/REVIEWING` | `/admin/content/reports` |
| 用户反馈待处理 | `用户反馈待处理: ${title}` | `userFeedback` 中 `PENDING/IN_PROGRESS` | `/admin/feedback` |

### 3.4 风险与审计口径
| 模块 | 展示字段 | 数据来源 | 口径 |
|---|---|---|---|
| 风险面板 | `title`, `level`, `time`, `source` | `securityLog` 过滤敏感动作 | 仅安全/权限/敏感操作相关事件进入 |
| 审计表 | `actor`, `action`, `target`, `time`, `level` | `securityLog` 全量 | 直接展示最近安全日志，敏感事件可仅管理员可见 |

## 4. 跳转出口与死链

### 4.1 当前跳转出口（含死链）
| 来源模块 | 当前跳转 | 说明 |
|---|---|---|
| 工作队列 - 内容报错 | `/admin/content/reports` | 跳转到内容报错处理页 |
| 工作队列 - 用户反馈 | `/admin/feedback` | 跳转到反馈列表页 |
| 风险面板 | `/admin/permissions` | 当前代码仍保留，路由已废弃，属于必须清理的死链 |
| 审计表“查看全部日志” | `/admin/permissions` | 当前代码仍保留，路由已废弃，属于必须清理的死链 |

### 4.2 当前残留问题
| 问题 | 影响 | 后续处理方向 |
|---|---|---|
| `AuditTable` 的“查看全部日志”仍指向 `/admin/permissions` | 404 / 误导入口 | 后续改到有效日志承接页或移除该 CTA |
| `buildRiskItems()` 的 `href` 仍指向 `/admin/permissions` | 风险项点击会死链 | 后续替换成有效处理页或去掉跳转 |
| `QUICK_ACTIONS.qa3` 仍指向 `/admin/permissions` | 数据存在但不应保留旧入口 | 后续改成真实可达目标或从首页快捷取数中清退 |
| `QUICK_ACTIONS` 数据已存在但首页未渲染 | 数据合同与 UI 不一致 | 后续要么补 UI，要么收口删除未使用数据 |

## 5. 角色边界

### 5.1 当前首页角色展示
| 角色 | 可见模块 | 当前备注 |
|---|---|---|
| `ADMIN` | KPI、工作队列、风险面板、审计表 | 全量可见 |
| `TEACHER` | KPI、工作队列、审计表 | 风险面板不展示，显示占位说明 |
| `PARENT` | 不进入 `/admin` | 当前由路由门禁直接拦截 |
| `STUDENT` | 不进入 `/admin` | 当前由路由门禁直接拦截 |

### 5.2 需要后续联动的角色矩阵点
| 角色矩阵点 | 现状 | 后续关注 |
|---|---|---|
| 风险面板对 `TEACHER` 的隐藏 | 已实现 | 需要确认审计是否也应做更细粒度过滤 |
| 审计表对敏感动作的可见范围 | 已有 `visibleTo` 逻辑 | 需确认是否与风险面板统一口径 |
| 快捷入口角色可见性 | 数据存在，UI 未渲染 | 后续若恢复 UI，要同步 role matrix |

## 6. mock / 真实边界

### 6.1 真实数据已接通的部分
| 模块 | 当前状态 | 说明 |
|---|---|---|
| KPI | 真实聚合 | 由 `users`、`userProgress`、`userFeedback`、`questionReport`、`securityLog` 计算 |
| 工作队列 | 真实待办 | 由反馈与报错的待处理状态生成 |
| 风险面板 | 真实风险 | 由安全日志过滤得到 |
| 审计表 | 真实日志 | 直接读安全日志 |

### 6.2 仍需确认或清理的部分
| 项目 | 当前状态 | 风险 |
|---|---|---|
| `actions` quick action 数据 | 仅有数据，无 UI 渲染 | 容易造成“合同存在但页面未展示”的假完整感 |
| `/admin/permissions` 相关链接 | 已废弃但仍残留 | 必须在后续任务清退 |
| `AdminDashboardV2` 的审计“查看全部日志” | 仍是旧目标 | 需要重定向或移除 |

## 7. 当前结论
- `/admin` 首页的主干真实数据已经明确：KPI、待办、风险、审计都能落到真实表或真实聚合。
- 首页当前的最大问题不是读链路不存在，而是仍残留 `/admin/permissions` 的旧跳转和未渲染的 quick action 数据。
- `T-009.1` 的事实底稿已经足够支撑后续 `T-009.2 ~ T-009.9`：
  - `T-009.2` 可直接据此定义字段口径
  - `T-009.3` 可据此建立角色矩阵
  - `T-009.4` 可据此替换跳转和读取链路
  - `T-009.5 ~ T-009.9` 可据此做清理与收口验证
