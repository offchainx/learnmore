id: SPEC-20260209-P0-06
title: P0-06 Practice 生产验收（题库审计与初中题目录入）
status: active
owner: codex
related_story:
created_at: 2026-02-09
updated_at: 2026-03-05

# 背景
- P0 发布链路中的子任务，需可独立验收与回滚。
- 当前 Practice 主链路可跑通，但题库规模不足，且“题目相关表”的职责边界与数据质量门禁尚未形成统一审计基线。
- 本阶段新增两条主线：
  1) 先分类/梳理/审计当前数据库中“题目域”所有相关表。
  2) 启动题目录入，优先接入 Examcoo「学历类 -> 初中教育」公开题库数据。

# 目标（Goals）
- 完成题目域数据库分类审计，输出“表职责/关系/读写链路/风险/核查 SQL”基线。
- 完成练习中心五模式闭环修复（入口可达、作答可采集、结果可核账）。
- 完成 Examcoo 初中教育题目录入流程定义，并落地首批可复现录入。
- 继续验证拉题、提交、判分、错题与配额链路在新数据下可稳定运行。
- 按 T-016~T-025 完成练习域结构重构：统一提交口径、清理废弃表、打通审核与报错闭环。

# 非目标（Non-Goals）
- 不扩展到 P1 范围。
- 不在本任务内完成全量历史题库清洗（仅做首批录入与质量门禁）。

# 约束（Constraints）
- 必须遵循 `.codex/workflows/new-task-sop.md`。
- 题目录入必须保留来源元数据（平台、分类、试卷 ID、原始 URL、抓取时间）。
- 录入过程必须可幂等（重复执行不产生重复题目）。
- 图片题（仅图片无文本）允许先落地为“待 OCR/待复审”状态，不阻塞主流程。

# 范围（In Scope）
- 题目相关表分层与审计（结构层、内容层、练习日志层、质控层）。
- 练习中心五模式（Smart Drill / Error Wiper / Mock Arena / Chapter Map / Past Year Paper）链路修复与统一采集口径。
- Examcoo 初中教育分类映射与采集链路设计（列表页 -> 逐题页 -> RPC 数据）。
- 题目转换/去重/入库策略（Question + SourceFile + QuestionGroup 等）。
- Practice 验证与表级核账。

# 范围外（Out of Scope）
- 其他 P0 子任务的实现细节。
- 题目语义深度纠错与学科教研审核全流程。

# 风险（Risks）
- 风险：外部源题目结构不统一，部分题目为图片片段导致结构化困难。
  - 影响：录入质量与速度不稳定。
  - 缓解策略：分批入库 + 状态机审核（DRAFT/REVIEW_PENDING）+ OCR 补录。
- 风险：重复抓取导致脏数据。
  - 影响：题目重复、统计失真。
  - 缓解策略：`contentHash` + 来源唯一键（source + paperId + questionNo）双重去重。
- 风险：题库扩容后 Practice 性能波动。
  - 影响：抽题变慢、提交延迟。
  - 缓解策略：按章节/难度建立核查索引与慢查询观察。

# 依赖（Dependencies）
- release 总计划与共享基础能力可用。
- Prisma 与数据库连接可用。
- Examcoo 公开页面可访问。

# 开发内容（必须先确认）

## 开发主线
1. 题目域数据库表分类与审计（结构、内容、练习、质控四层）。
2. 优先修复 Practice 五模式闭环与统一落库口径。
3. 初中教育题目录入（优先 Examcoo: `mid=1#s2`，默认 `REVIEW_PENDING`）。
4. Practice 主链路在新题库下回归验证（拉题 -> 作答 -> 提交 -> 判分 -> 回写）。

## 题目域表分层（审计范围）
| 分层 | 数据表 | 角色 |
|---|---|---|
| 结构层 | subjects, chapters | 学科与章节结构 |
| 内容层 | questions, source_files | 题目主体与来源 |
| 标签层 | questions.tags | 题目标签（冗余字段） |
| 练习日志层 | exam_records, user_attempts | 作答与判分 |
| 质控层 | content_review_logs, question_reports | 审核流与报错治理 |

## 2026-03-05 范围更新（任务顺延）
1. `questions` 字段重构：
   - 新增：`curriculum`、`grade`、`subject_id`、`asset_url`、`source`、`tags`、`is_past_paper`、`paper_id`。
   - 删除：`ocr_raw_text`、`ocr_confidence`、`original_question_id`、`version`。
2. 直接删除并清理逻辑：
   - `chapter_prerequisites`、`question_groups`、`question_tag_relations`、`knowledge_points`、`question_kp_relations`。
3. 统一提交与统计：
   - 所有练习模式统一写入 `exam_records + user_attempts`。
   - `error_book` 下线，掌握度与薄弱点改为基于 `user_attempts` 实时聚合。
4. 管理后台联通：
   - `/admin/content/import`、`/admin/content/review`、`/admin/content/statistics` 使用真实数据链路。
5. 报错闭环补齐：
   - 增加 `question_reports` 用户前端入口并接通后台处理流程。

## 2026-03-09 T-017 字段-逻辑映射清单（`public.questions`）
| 字段 | 写入点（主） | 读取点（主） | 结论 |
|---|---|---|---|
| `id` | Prisma 自动生成 | 全量查询/关联主键 | 保留 |
| `chapter_id` | `createQuestion`/`bulkCreateQuestions`/`updateQuestion` | `getRandomQuestions`、review 展示、attempt 关联章节统计 | 保留 |
| `subject_id` | 导题回填 + create/update | 科目筛选、Past Paper、推荐与统计 | 保留 |
| `source_file_id` | 导题链路 `bulkCreateQuestions`/脚本导入 | import/review 追溯来源 | 保留 |
| `type` | create/bulk/update | 判题、抽题题型筛选、review 展示 | 保留 |
| `curriculum` | create/bulk/update（默认 `UEC`） | 内容筛选（admin review） | 保留 |
| `grade` | create/bulk/update | 内容筛选（admin review） | 保留 |
| `difficulty` | create/bulk/update | 抽题、Mock 组卷、review 难度展示 | 保留 |
| `content` | create/bulk/update | 做题页渲染、review、去重哈希输入 | 保留 |
| `options` | create/bulk/update | 单/多选渲染与判题 | 保留 |
| `answer` | create/bulk/update | `submitPracticeSession`/`submitExam` 判题 | 保留 |
| `explanation` | create/bulk/update | 做题结果页、review 详情 | 保留 |
| `asset_url` | create/bulk/update | review 题图展示（无图回退 source file） | 保留 |
| `source` | 导题与手工录题 | Past Paper 标题、来源追踪 | 保留 |
| `tags` | create/bulk/update | review 元数据展示、后续标签检索 | 保留 |
| `is_past_paper` | create/bulk/update | Past Paper 模式筛选 | 保留 |
| `paper_id` | create/bulk/update | Past Paper 分卷聚合与拉题 | 保留 |
| `status` | `updateQuestionStatus`（审核状态机） | 抽题门禁、review 列表筛选 | 保留 |
| `content_hash` | create/bulk/update（内容变更时重算） | 导入去重、更新冲突检测 | 保留 |
| `quality_score` | 导题质量评估/手工更新 | review 列表质量分展示与排序 | 保留 |
| `report_count` | `reportQuestion` 增减 | 自动复审阈值判断、管理端展示 | 保留 |
| `created_by` | create/bulk | 审计筛选（`createdBy`） | 保留 |
| `reviewed_by` | `updateQuestionStatus`、`resolveReport` | 审计筛选（`reviewedBy`） | 保留 |
| `published_by` | 发布动作写入 | 发布审计追踪 | 保留 |
| `reviewed_at` | 审核动作写入 | 审计追踪 | 保留 |
| `published_at` | 发布动作写入 | 审计追踪 | 保留 |
| `created_at` | DB 默认 | 列表排序、统计窗口 | 保留 |
| `updated_at` | DB 自动更新 | 列表排序、变更追踪 | 保留 |

### T-017 清理结论
1. 已确认 `public.questions` 当前保留字段均存在至少一条有效写入链路与读取链路，无“纯写不读/纯读不写”死字段。
2. 已修复难度筛选逻辑为“权限难度 ∩ 用户筛选难度”的严格交集语义（空交集直接返回空题集，不再兜底覆盖）。
3. 已在 `question-service` 过滤构建中加入 UUID/枚举/空范围防御，避免非法筛选值触发 Prisma 运行时错误。

## 当前数据库基线（2026-03-09 本地快照）
| 表 | 当前记录数 |
|---|---|
| subjects | 8 |
| chapters | 37 |
| questions | 71 |
| chapter_prerequisites | 已删除 |
| question_groups | 已删除 |
| question_tag_relations | 已删除 |
| knowledge_points | 已删除 |
| question_kp_relations | 已删除 |
| source_files | 3 |
| content_review_logs | 21 |
| question_reports | 0 |
| exam_records | 3 |
| user_attempts | 106 |
| error_book | 待 T-022 移除 |

## 已执行进展（2026-03-09）
- 已完成 T-012：基于 `view -> getpapercontent -> comment/index` 的抓取脚本可用，已从 `id=2430396` 成功抓取前 10 题。
- 已完成 T-013：小批量导入 10 题，写入 `source_files + questions`（`paper_id=examcoo-2430396`），状态为 `REVIEW_PENDING`。
- 已完成 T-014：上述 10 题已完成 `REVIEW_PENDING -> VERIFIED -> PUBLISHED`，并写入审核日志。
- 已完成 T-017：完成 `public.questions` 字段-逻辑映射清单，并修复难度筛选交集逻辑。
- 已完成 T-018：已执行迁移 `013_t018_drop_deprecated_question_tables.sql`，删除废弃表与旧依赖列（含 `questions.group_id`、`_SourceToGroup`）。

## 外部源（Examcoo）初中教育分类映射（首批）
- 入口：`https://www.examcoo.com/index/detail/mid/1/#s2`
- 重点分类（示例）：
  - 初一：`k=42~49`
  - 初二：`k=50~58`
  - 初三：`k=59~68`
  - 初中会考：`k=69~78`
  - 中考：`k=79~90`

## 交付判定（DoD）
- 题目域“分层+读写+风险+核查 SQL”审计文档完成并可复核。
- 练习中心五模式全部可用，且作答数据可统一核账到表。
- 初中教育首批题目录入完成，具备来源可追溯与去重能力。
- 一次完整练习流程可核账到表，失败场景有可识别错误。
- 重放与重复提交不产生脏数据。
