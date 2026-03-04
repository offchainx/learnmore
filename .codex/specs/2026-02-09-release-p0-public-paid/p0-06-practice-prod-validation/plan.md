# 技术方案（Plan）

## 概览
- 子任务：P0-06 Practice 生产验收（题库审计 + 初中题目录入）
- 方案摘要：先完成题目域数据库审计基线与练习链路修复，再接入 Examcoo 初中教育公开题目，最后做双环境核账验收。
- 执行原则：先审计、后录入、再回归；每一步保留可复现证据（SQL/日志/样例 ID）。

## 强制门禁（本任务必须满足）
1. 完成 spec.md、plan.md、tasks.md、acceptance.md 四件套并通过审阅。
2. 题目域数据表审计必须覆盖“结构层/内容层/练习日志层/质控层”。
3. 练习中心五模式必须形成“入口可达 + 数据可拉 + 作答可采集 + 结果可核账”的闭环。
4. 录题流程必须具备来源追溯 + 幂等去重 + 失败可重试，且默认 `REVIEW_PENDING`。
5. 验证环境固定为本地 + 预发，两轮都要留下证据。

## 方案分阶段

### 阶段 A：题目域数据库分类与审计
- 目标：明确每个题目相关表的职责、主键/唯一键、核心字段、读写入口、风险点。
- 输出：
  - 表级审计矩阵（表 -> 字段 -> Action/API -> SQL 校验）。
  - 当前库基线计数快照（2026-03-04 已采集）。
  - 缺口列表（当前为空/弱约束表：`question_groups`、`question_tags`、`knowledge_points` 等）。

### 阶段 B：练习链路修复优先（先于爬虫导入）
- 目标：修复当前练习中心链路不一致问题，统一题目交互采集与落库口径。
- 范围：
  - 五模式入口闭环：Smart Drill、Error Wiper、Mock Arena、Chapter Map、Past Year Paper。
  - Smart Drill / Chapter Drill 接入统一提交动作，落 `exam_records + user_attempts + error_book`。
  - 防重复做题策略跨模式统一（默认排除最近 N 天做过题）。
  - `masteryLevel` 语义统一：同一正确/错误行为在不同模式下规则一致。
  - 抽题只允许 `VERIFIED/PUBLISHED`（禁止将 `DRAFT/REVIEW_PENDING` 直接投喂练习端）。

### 阶段 C：Examcoo 初中教育题目录入（首批）
- 目标：将初中教育题目按可追溯方式导入本库，优先初三数学并可横向扩展。
- 数据源链路：
  1. 分类入口：`/index/detail/mid/1/#s2`
  2. 列表页：`/paperlist/index/k/{k}/p/{page}`（拿 `paperId`、标题、题数、时间）
  3. 逐题页：`/editor/do/exercise/pid/{paperId}`（提取 `leid` + `tokenleid`）
  4. RPC：`/editor/rpc/getexercisecontent/leid/{leid}/tokenleid/{tokenleid}`（拿结构化题块）
- 转换策略：
  - `s1/s3` -> 单选；`s2` -> 多选；`s4` -> 填空；`s5` -> 简答。
  - 选项答案采用位掩码转字母（如 `1=A,2=B,4=C,8=D`，多选按位拆分）。
  - 题干中 `_djrealurl` 转为完整图片 URL（`https://img.examcoo.com` 前缀），图片题先以 Markdown 图片落库。
- 入库策略：
  - `source_files`：记录源 URL、文件类型、抓取状态。
  - `question_groups`：按试卷聚合（sourceYear/sourcePaper）。
  - `questions`：写入内容、类型、答案、难度、`content_hash`、来源字段、默认 `REVIEW_PENDING`。
  - 可选：首批只写 `questions + source_files`，后续补 `question_tags / knowledge_points`。
- 幂等去重：
  - 一级去重：`questions.content_hash`。
  - 二级去重：`source + paperId + questionIndex`（导入日志层，防重跑）。

### 阶段 D：Practice 链路回归与核账
- 覆盖链路：拉题 -> 作答 -> 提交 -> 判分 -> 错题回写 -> 榜单/成就。
- 核账表：`exam_records`、`user_attempts`、`error_book`、`leaderboard_entries`、`user_badges`、`notifications`。

## Server Action / 接口契约清单
| Action/接口 | 调用入口 | 输入与校验 | 输出与错误 | 幂等/并发策略 | 审计字段 |
|---|---|---|---|---|---|
| submitQuiz | Practice 提交按钮 | answers、chapterId、duration 校验 | 成功返回 score，失败返回 error | 重放不应造成关键记录重复写入 | userId、action、result、examRecordId |
| createQuestion / bulkCreateQuestions | 题目录入流程 | content/type/answer 必填 | 成功返回题目 ID；重复返回重复错误 | 基于 content_hash 去重 | source、paperId、questionIndex |
| getexercisecontent（外部） | 导入脚本内部 | leid + tokenleid | 返回试卷题块 JSON | 失败重试 3 次 + 指数退避 | paperId、leid、token |
| updateLeaderboardScore | submitQuiz 内部调用 | userId、points | 更新周榜月榜总榜分数 | 同事件重放需验证积分一致性 | userId、period、points |
| awardBadgeIfEligible | submitQuiz 内部调用 | userId + PRACTICE 触发 | 达标发放徽章 | 重复触发不重复发放 | userId、badgeCode、result |

## 数据落表点与核对范围
| 相关表 | 关键字段 | 读/写 | 触发场景 | 核对方式 |
|---|---|---|---|---|
| subjects / chapters | name、title、subject_id | 读/写 | 题目挂载章节 | 分类映射核对 |
| source_files | file_url、status、ocr_raw_text | 写 | 导入试卷来源落表 | 来源追溯核对 |
| question_groups | source_paper、source_year、subject_id | 写 | 试卷分组 | 一卷一组核对 |
| questions | content、type、answer、content_hash、group_id | 写 | 批量导题 | 去重 + 类型映射核对 |
| exam_records | user_id、score、total_questions、correct_count | 写 | 提交一次练习 | 前后快照新增核对 |
| user_attempts | user_id、question_id、is_correct、exam_record_id | 写 | 批量写入作答记录 | 数量与题数一致性核对 |
| error_book | user_id、question_id、mastery_level | 写 | 错题回写与掌握度更新 | 正误题更新逻辑核对 |
| leaderboard_entries | user_id、period、week_start、score | 写 | 提交后积分更新 | 三周期同步核对 |

## 验证步骤（固定流程）
1. 本地（审计）：执行表计数 + 关键 SQL 快照，生成基线。
2. 本地（修复链路）：先完成 `T-005 ~ T-011`，确保五模式闭环与统一落库。
3. 本地（导入）：执行 `T-012 ~ T-013`，记录 `k/page/paperId/questionCount/importedCount`。
4. 本地（Practice）：跑成功路径 + 失败/越权路径，核对写表。
5. 预发复测：复测同批场景，验证幂等和并发。

## 风险与回滚
- 触发回滚：核心路径阻断、题目重复写入、来源不可追溯。
- 回滚步骤：
  1. 停止导入任务。
  2. 依据导入批次标识回滚新增题目（按 group/source 批量删除）。
  3. 恢复旧入口或旧行为。
  4. 重新执行本地与预发冒烟。
- 观测要求：日志可定位 `source、paperId、questionId、userId、action、result、timestamp`。

## 开发改动清单（必填）

### 开发单元映射
| 开发单元 | 入口组件 | Action/API | 数据表 | 核对点 |
|---|---|---|---|---|
| 题目域审计 | 审计脚本/SQL | Prisma + SQL | 题目域全表 | 计数与结构一致 |
| 五模式入口闭环 | PracticeView | 各模式路由与加载函数 | questions, chapters | 每个模式可达且可拉取真实数据 |
| Smart/Chapter 统一提交 | Quiz/Drill 交互组件 | unified submit action | exam_records, user_attempts, error_book | 作答可采集且可核账 |
| 防重复做题策略 | 拉题层 | getRandomQuestions/getSmartDrillQuestions/exam draw | questions, user_attempts | 跨模式排重一致 |
| Examcoo 列表抓取 | 导入脚本 | `/paperlist/index/...` | source_files/question_groups | 试卷元数据完整 |
| Examcoo 逐题抓取 | 导入脚本 | `/editor/do/exercise` + `/editor/rpc/getexercisecontent` | questions | 题型与答案映射正确 |
| 拉题与配额 | Practice 页面 | question/quota actions | questions, user_attempts | 配额边界与可拉题结果 |
| 提交与判分 | QuizSession / MockArena 提交 | submitQuiz/submitExam | exam_records, user_attempts | 分数与正确率计算 |

### 必改文件（计划）
- `.codex/specs/2026-02-09-release-p0-public-paid/p0-06-practice-prod-validation/*.md`
- `src/components/practice/PracticeView/*`（模式入口与交互闭环）
- `src/components/practice/modes/*`（Smart Drill / Error Wiper）
- `src/components/practice/chapter-drill/*`（Chapter Drill 提交流程）
- `src/actions/practice/quiz.ts`
- `src/actions/practice/exam.ts`
- `src/actions/practice/data-service.ts`
- `src/actions/practice/recommendation.ts`
- `scripts/` 下新增 examcoo 导入脚本（待实现）
- `src/actions/content-pipeline/question-service.ts`（导入状态与去重复用）

### 非目标
- 不做题目全量语义纠错与教研级人工审核。

### 开发完成判定（DoD）
- 审计文档可复核。
- 五模式入口与作答链路闭环完成，数据采集口径统一。
- 初中教育首批题目完成录入且可追溯。
- Practice 全链路稳定可验收。
