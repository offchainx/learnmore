# 技术方案（Plan）

## 概览
- 子任务：P0-05 Dashboard P0 化
- 方案摘要：收敛 Dashboard 到真实数据卡片与有效 CTA，移除误导入口与假数据文案。
- 执行原则：先文档、后开发；未获用户确认前禁止进入实现。

## 强制门禁（本任务必须满足）
1. 完成 spec.md、plan.md、tasks.md、acceptance.md 四件套并通过审阅。
2. 明确 Server Action 或接口契约：输入校验、输出结构、错误结构、幂等与并发策略。
3. 明确数据落表点：逐表列出关键字段与校验 SQL。
4. 验证环境固定为 本地 + 预发，两轮都要留下证据。

## Server Action / 接口契约清单
| Action/接口 | 调用入口 | 输入与校验 | 输出与错误 | 幂等/并发策略 | 审计字段 |
|---|---|---|---|---|---|
| getDashboardStats | Dashboard 首屏 | 已登录用户 | 返回真实 stats 结构 | 同用户重复请求一致 | userId、action、result |
| ensureDailyTasks | getDashboardStats 内部触发 | userId | 当日无任务时创建默认任务 | 同日重复调用不重复创建 | userId、taskDate、result |
| checkAndRefreshStreak | getDashboardStats 内部触发 | userId | 按学习日期更新 streak | 同日重复调用不重复增长 | userId、streakBefore、streakAfter |

## 数据落表点与核对范围
| 相关表 | 关键字段 | 读/写 | 触发场景 | 核对方式 |
|---|---|---|---|---|
| daily_tasks | userId、date、type、currentCount | 写 | 首屏初始化每日任务 | 当日重复创建核对 |
| users | streak、lastStudyDate、xp | 写 | streak 刷新 | 同日幂等核对 |
| user_attempts, error_book, user_progress | 统计字段 | 读 | Dashboard 统计展示 | 页面值与 SQL 一致性核对 |

## 验证步骤（固定流程）
1. 本地：先跑成功路径，再跑失败与越权路径，记录 Action 输入输出与 SQL 前后快照。
2. 预发：复测同一批关键场景，验证幂等与并发行为，确认结果一致。
3. 回归：执行受影响页面最小冒烟，确认无阻断。

## 风险与回滚
- 触发回滚：核心路径阻断、数据写入异常、重复写入导致脏数据。
- 回滚步骤：回滚任务提交 -> 恢复旧入口或旧行为 -> 重新执行本地与预发冒烟。
- 观测要求：日志可定位 userId、action、result、timestamp。

## 开发启动条件
- 仅当用户在文档审阅后明确批准，才允许切换到开发实施阶段。

## 开发改动清单（必填）

### 开发单元映射
| 开发单元 | 入口组件 | Action/API | 关键字段 | 数据表 | 验证方式 |
|---|---|---|---|---|---|
| 统计卡 | DashboardHome 顶部 | getDashboardStats | stats.* | users, user_attempts, error_book | 字段值与 SQL 对比 |
| 每日任务 | DailyMissions | getDashboardStats + ensureDailyTasks | dailyTasks | daily_tasks | 当日重复刷新不重复创建 |
| 学科强弱 | SubjectStrengths 区块 | getDashboardStats | subjectStrengths | user_attempts, questions, subjects | 准确率计算核对 |
| 最近活动 | RecentActivity 区块 | getDashboardStats | recentActivity | user_progress, lessons | 最新 3 条排序核对 |
| 薄弱点 | Weaknesses 区块 | getDashboardStats | weaknesses | error_book | mastery 最低优先核对 |

### 必改文件
- src/actions/dashboard.ts
- src/components/dashboard/DashboardHome.tsx
- src/components/dashboard/Widgets.tsx
- src/components/dashboard/DashboardClient.tsx
- src/app/(dashboard)/dashboard/page.tsx

### 主要接口 / Server Actions
- getDashboardStats
- ensureDailyTasks
- checkAndRefreshStreak

### 主要数据表
- daily_tasks
- users
- user_attempts, error_book, user_progress

### 非目标
- 不扩展 Lesson/Courses。

### 开发完成判定（DoD）
- Dashboard 全组件真实数据可用且展示正确。
