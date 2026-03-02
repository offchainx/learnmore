# 技术方案（Plan）

## 概览
- 子任务：P0-11 观测与上线验收
- 方案摘要：固化可观测性与上线验收流程，确保关键路径有日志、有告警、有回滚演练记录。
- 执行原则：先文档、后开发；未获用户确认前禁止进入实现。

## 强制门禁（本任务必须满足）
1. 完成 spec.md、plan.md、tasks.md、acceptance.md 四件套并通过审阅。
2. 明确 Server Action 或接口契约：输入校验、输出结构、错误结构、幂等与并发策略。
3. 明确数据落表点：逐表列出关键字段与校验 SQL。
4. 验证环境固定为 本地 + 预发，两轮都要留下证据。

## Server Action / 接口契约清单
| Action/接口 | 调用入口 | 输入与校验 | 输出与错误 | 幂等/并发策略 | 审计字段 |
|---|---|---|---|---|---|
| getDashboardStats / getLeaderboard / getPosts | 核心页面冒烟 | 正常请求与异常请求 | 输出可观测且可定位错误 | 查询幂等 | path、action、result、latency |
| submitQuiz | Practice 冒烟 | 成功与失败输入 | 可定位判分与落表问题 | 重放行为可解释 | userId、examRecordId、result |
| POST /api/webhook/stripe | 支付链路冒烟 | 正常事件与重放事件 | 支付结果可追踪 | event.id 幂等强约束 | eventId、userId、result |

## 数据落表点与核对范围
| 相关表 | 关键字段 | 读/写 | 触发场景 | 核对方式 |
|---|---|---|---|---|
| notifications | type、link、metadata | 读/写 | 事件追踪与告警证据 | 查询关键事件完整性 |
| users | 订阅与 streak 字段 | 读/写 | 核心链路回归 | 关键字段变化核对 |
| exam_records, user_attempts, leaderboard_entries | 关键业务记录 | 写 | 练习链路冒烟 | 端到端核账 |

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
| 开发单元 | 入口 | 接口 | 数据表 | 验证方式 |
|---|---|---|---|---|
| 练习链路冒烟 | dashboard/practice | submitQuiz | exam_records, user_attempts, error_book | 端到端一次完整提交流程 |
| 排行榜冒烟 | dashboard/leaderboard | getLeaderboard/getUserRank | leaderboard_entries | 周/月/总榜切换检查 |
| 社区冒烟 | dashboard/community | getPosts/createPost/createComment/toggleLike | posts, comments, post_likes | 列表/新建/详情回归 |
| 支付冒烟 | pricing + webhook | createCheckoutSession/POST webhook | users, notifications, referrals | 成功/取消/重放 |

### 必改文件
- docs/release/p0-smoke-test-checklist.md
- docs/release/p0-production-env-checklist.md
- docs/release/p0-auth-regression-cases.md
- src/actions/practice/quiz.ts
- src/actions/community/post.ts
- src/actions/leaderboard/index.ts
- src/app/api/webhook/stripe/route.ts

### 主要接口 / Server Actions
- submitQuiz
- getPosts/createPost/createComment/toggleLike
- getLeaderboard/getUserRank
- POST /api/webhook/stripe

### 主要数据表
- exam_records, user_attempts, error_book
- posts, comments, post_likes
- leaderboard_entries
- users
- notifications

### 非目标
- 不新增业务功能。

### 开发完成判定（DoD）
- 上线验收清单可执行并通过。
