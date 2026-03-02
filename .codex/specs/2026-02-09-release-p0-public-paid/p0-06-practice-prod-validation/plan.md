# 技术方案（Plan）

## 概览
- 子任务：P0-06 Practice 生产验收
- 方案摘要：打通练习链路（拉题、提交、判分、错题回写、配额）并以表级核对作为强制验收。
- 执行原则：先文档、后开发；未获用户确认前禁止进入实现。

## 强制门禁（本任务必须满足）
1. 完成 spec.md、plan.md、tasks.md、acceptance.md 四件套并通过审阅。
2. 明确 Server Action 或接口契约：输入校验、输出结构、错误结构、幂等与并发策略。
3. 明确数据落表点：逐表列出关键字段与校验 SQL。
4. 验证环境固定为 本地 + 预发，两轮都要留下证据。

## Server Action / 接口契约清单
| Action/接口 | 调用入口 | 输入与校验 | 输出与错误 | 幂等/并发策略 | 审计字段 |
|---|---|---|---|---|---|
| submitQuiz | Practice 提交按钮 | answers、chapterId、duration 校验 | 成功返回 score，失败返回 error | 重放不应造成关键记录重复写入 | userId、action、result、examRecordId |
| updateLeaderboardScore | submitQuiz 内部调用 | userId、points | 更新周榜月榜总榜分数 | 同事件重放需验证积分一致性 | userId、period、points |
| awardBadgeIfEligible | submitQuiz 内部调用 | userId + PRACTICE 触发 | 达标发放徽章 | 重复触发不重复发放 | userId、badgeCode、result |

## 数据落表点与核对范围
| 相关表 | 关键字段 | 读/写 | 触发场景 | 核对方式 |
|---|---|---|---|---|
| exam_records | userId、score、totalQuestions、correctCount | 写 | 提交一次练习 | 前后快照核对新增记录 |
| user_attempts | userId、questionId、isCorrect、examRecordId | 写 | 批量写入作答记录 | 记录数与题数一致性核对 |
| error_book | userId、questionId、masteryLevel | 写 | 错题回写与掌握度更新 | 正误题更新逻辑核对 |
| leaderboard_entries | userId、period、weekStart、score | 写 | 提交后积分更新 | 三周期同步核对 |
| user_badges, notifications | badgeId、type、metadata | 写 | 达标授予成就 | 防重复核对 |

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
| 开发单元 | 入口组件 | Action/API | 数据表 | 核对点 |
|---|---|---|---|---|
| 拉题与配额 | Practice 页面 | question/quota actions | questions, user_attempts | 配额边界与可拉题结果 |
| 提交与判分 | QuizSession 提交 | submitQuiz | exam_records, user_attempts | 分数与正确率计算 |
| 错题回写 | submitQuiz 内部 | upsert error_book | error_book | 正确题归零、错误题递增 |
| 榜单联动 | 提交后置 | updateLeaderboardScore | leaderboard_entries | 三周期同步更新 |
| 成就联动 | 提交后置 | awardBadgeIfEligible | user_badges, notifications | 防重复授予 |

### 必改文件
- src/actions/practice/quiz.ts
- src/actions/practice/quota.ts
- src/actions/practice/question.ts
- src/actions/practice/error-book.ts
- src/app/(dashboard)/dashboard/practice/page.tsx
- src/components/practice/session/QuizSession.tsx

### 主要接口 / Server Actions
- submitQuiz
- question/quota related actions
- updateLeaderboardScore
- awardBadgeIfEligible

### 主要数据表
- exam_records
- user_attempts
- error_book
- leaderboard_entries
- daily_tasks
- user_badges, notifications

### 非目标
- 不做题库生产扩展与 AI 判卷升级。

### 开发完成判定（DoD）
- Practice 全链路稳定可验收。
