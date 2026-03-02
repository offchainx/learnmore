# 技术方案（Plan）

## 概览
- 子任务：P0-09 Achievement MVP
- 方案摘要：实现 Achievement MVP（真实徽章、真实统计、自动授予），并把防重复授予作为硬性验收。
- 执行原则：先文档、后开发；未获用户确认前禁止进入实现。

## 强制门禁（本任务必须满足）
1. 完成 spec.md、plan.md、tasks.md、acceptance.md 四件套并通过审阅。
2. 明确 Server Action 或接口契约：输入校验、输出结构、错误结构、幂等与并发策略。
3. 明确数据落表点：逐表列出关键字段与校验 SQL。
4. 验证环境固定为 本地 + 预发，两轮都要留下证据。

## Server Action / 接口契约清单
| Action/接口 | 调用入口 | 输入与校验 | 输出与错误 | 幂等/并发策略 | 审计字段 |
|---|---|---|---|---|---|
| getAchievementOverview | 成就页概览加载 | userId 可解析 | 返回 streak、questions、accuracy 等统计 | 查询幂等 | userId、action、result |
| listUserBadges | 成就页徽章列表 | userId 可解析 | 返回徽章与解锁状态 | 查询幂等 | userId、badgeCount、result |
| awardBadgeIfEligible | Practice、Community、Streak 触发 | userId 与 trigger | 满足条件发放新徽章并发通知 | 重复触发不重复发放 | userId、trigger、awardedCodes |

## 数据落表点与核对范围
| 相关表 | 关键字段 | 读/写 | 触发场景 | 核对方式 |
|---|---|---|---|---|
| badges | code、name、condition | 写（初始化）/读 | 默认徽章初始化与读取 | skipDuplicates 行为核对 |
| user_badges | userId、badgeId、awardedAt | 写 | 自动授予 | 联合唯一键防重复核对 |
| notifications | type、title、metadata.badgeCode | 写 | 成就通知下发 | 与授予结果一一对应 |
| user_attempts, posts, comments, users | 统计字段 | 读 | 判定达标条件 | 阈值计算正确性核对 |

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
| 开发单元 | 页面/入口 | Action/API | 数据表 | 验证方式 |
|---|---|---|---|---|
| 概览展示 | achievements page | getAchievementOverview | users, user_attempts, posts, comments | 字段对 SQL |
| 徽章列表 | achievements page | listUserBadges | badges, user_badges | 解锁状态核对 |
| 触发授予 | practice/community/streak 后置 | awardBadgeIfEligible | user_badges, notifications | 防重验证 |
| 默认徽章 | 初始化流程 | ensureDefaultBadges | badges | skipDuplicates 验证 |

### 必改文件
- src/actions/gamification/achievements.ts
- src/lib/gamification/achievements-types.ts
- src/components/achievements/AchievementsView.tsx
- src/app/(dashboard)/dashboard/achievements/page.tsx
- src/actions/practice/quiz.ts
- src/actions/community/post.ts
- src/actions/gamification/streak.ts

### 主要接口 / Server Actions
- getAchievementOverview
- listUserBadges
- awardBadgeIfEligible
- ensureDefaultBadges

### 主要数据表
- badges
- user_badges
- notifications
- users
- user_attempts
- posts
- comments

### 非目标
- 不做 Achievement Pro 玩法。

### 开发完成判定（DoD）
- 成就 MVP 达到上线可用标准。
