# 技术方案（Plan）

## 概览
- 子任务：P0-08 Leaderboard 接真数据
- 方案摘要：Leaderboard 去 mock 并完全依赖真实数据，确保周期切换和个人排名一致。
- 执行原则：先文档、后开发；未获用户确认前禁止进入实现。

## 强制门禁（本任务必须满足）
1. 完成 spec.md、plan.md、tasks.md、acceptance.md 四件套并通过审阅。
2. 明确 Server Action 或接口契约：输入校验、输出结构、错误结构、幂等与并发策略。
3. 明确数据落表点：逐表列出关键字段与校验 SQL。
4. 验证环境固定为 本地 + 预发，两轮都要留下证据。

## Server Action / 接口契约清单
| Action/接口 | 调用入口 | 输入与校验 | 输出与错误 | 幂等/并发策略 | 审计字段 |
|---|---|---|---|---|---|
| getLeaderboard | Leaderboard 页面和周期切换 | period、limit 参数校验 | 返回排序榜单 | 相同参数查询稳定 | period、resultCount、timestamp |
| getUserRank | 我的排名卡 | userId、period | 返回 rank+score 或 null | 查询幂等 | userId、period、rank |
| updateLeaderboardScore | Practice 成功后触发 | userId、points | 增量更新分数 | 同事件重放需验证 | userId、period、scoreDelta |

## 数据落表点与核对范围
| 相关表 | 关键字段 | 读/写 | 触发场景 | 核对方式 |
|---|---|---|---|---|
| leaderboard_entries | userId、period、weekStart、score | 读/写 | 排行榜展示与积分更新 | 三周期一致性核对 |
| users | id、username、avatar | 读 | 榜单用户信息展示 | 前端展示字段对齐核对 |

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
| 开发单元 | 页面/组件 | Action/API | 数据表 | 验证方式 |
|---|---|---|---|---|
| 榜单列表 | LeaderboardView | getLeaderboard | leaderboard_entries, users | 与 SQL 排序对齐 |
| 我的排名 | LeaderboardView | getUserRank | leaderboard_entries | rank 计算一致 |
| 分数更新 | Practice 后置 | updateLeaderboardScore | leaderboard_entries | 分数增量核对 |

### 必改文件
- src/components/leaderboard/LeaderboardView.tsx
- src/actions/leaderboard/index.ts
- src/lib/leaderboard/pg-adapter.ts
- src/app/(dashboard)/dashboard/leaderboard/page.tsx
- src/app/(dashboard)/dashboard/leaderboard/client-wrapper.tsx
- src/components/leaderboard/mock-data.ts（仅移除依赖）

### 主要接口 / Server Actions
- getLeaderboard
- getUserRank
- updateLeaderboardScore

### 主要数据表
- leaderboard_entries
- users

### 非目标
- 不做赛季玩法与实时推送。

### 开发完成判定（DoD）
- 排行榜真实数据可用且计算正确。
