# 技术方案（Plan）

## 概览
- 子任务：P0-03 UI 基线统一
- 方案摘要：统一 UI token 与基础组件状态，确保空态和 CTA 一致且不引入非预期写入。
- 执行原则：先文档、后开发；未获用户确认前禁止进入实现。

## 强制门禁（本任务必须满足）
1. 完成 spec.md、plan.md、tasks.md、acceptance.md 四件套并通过审阅。
2. 明确 Server Action 或接口契约：输入校验、输出结构、错误结构、幂等与并发策略。
3. 明确数据落表点：逐表列出关键字段与校验 SQL。
4. 验证环境固定为 本地 + 预发，两轮都要留下证据。

## Server Action / 接口契约清单
| Action/接口 | 调用入口 | 输入与校验 | 输出与错误 | 幂等/并发策略 | 审计字段 |
|---|---|---|---|---|---|
| getDashboardStats | Dashboard 首屏加载 | 已登录用户 | 成功返回统计结构，失败返回 null | 查询幂等 | userId、action、result |
| getLeaderboard / getUserRank | Leaderboard 页面 | period 参数校验 | 成功返回榜单与排名 | 查询幂等 | period、resultCount |
| getPosts | Community 列表加载 | 分页与筛选参数 | 成功返回分页结果 | 查询幂等 | page、filters、result |

## 数据落表点与核对范围
| 相关表 | 关键字段 | 读/写 | 触发场景 | 核对方式 |
|---|---|---|---|---|
| users, user_attempts, daily_tasks | 统计字段 | 读（少量维护写） | Dashboard 渲染 | 页面与查询一致性核对 |
| leaderboard_entries | period、weekStart、score | 读 | 排行榜渲染 | 周期切换一致性核对 |
| posts, comments, post_likes | 列表统计字段 | 读 | 社区列表渲染 | 空态与列表态核对 |

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
| 开发单元 | 页面/组件 | Action/API 影响 | 数据表影响 | 验证方式 |
|---|---|---|---|---|
| token 统一 | globals.css, tailwind | 无新增 Action | 无 | 视觉回归截图 |
| 基础控件状态 | ui/button, ui/card 等 | 读取行为不变 | 无 | 交互状态检查 |
| 空态模板 | Dashboard/Community/Leaderboard | getDashboardStats/getPosts/getLeaderboard | 仅读取 | 空列表与异常态验证 |
| 路由一致 | BottomTabBar | 页面路由跳转 | 无 | 移动端导航冒烟 |

### 必改文件
- src/app/globals.css
- tailwind.config.ts
- src/components/ui/button.tsx
- src/components/ui/card.tsx
- src/components/ui/input.tsx
- src/components/ui/textarea.tsx
- src/components/mobile/BottomTabBar.tsx
- src/components/layout/dashboard-layout.tsx

### 主要接口 / Server Actions
- getDashboardStats
- getLeaderboard / getUserRank
- getPosts

### 主要数据表
- users, user_attempts, daily_tasks
- leaderboard_entries
- posts, comments, post_likes

### 非目标
- 不新增设计系统框架。

### 开发完成判定（DoD）
- UI 基线统一且主路径可用。
