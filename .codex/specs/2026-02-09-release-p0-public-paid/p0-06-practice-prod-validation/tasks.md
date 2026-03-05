# 执行任务清单（Tasks）

| id | description | owner | status (todo/doing/done) | link (PR/commit) |
|---|---|---|---|---|
| T-001 | 更新 P0-06 文档范围，纳入“题目表审计 + 初中题目录入”两条主线 | codex | done |  |
| T-002 | 形成题目域数据表分层清单与当前库基线（含记录数快照） | codex | done |  |
| T-003 | 设计 Examcoo 初中教育导入链路（列表页 -> 逐题页 -> RPC）与字段映射 | codex | done |  |
| T-004 | 梳理当前练习题相关数据表、字段合理性与用户答题采集链路（本次） | codex | done |  |
| T-005 | 修复练习中心五模式入口闭环（补齐 Past Year Paper 动态路由与真实数据源） | codex | done | c0f1f96 |
| T-006 | Smart Drill 答题落库改造（统一提交到 exam_records/user_attempts/error_book） | codex | todo |  |
| T-007 | Chapter Drill 答题落库改造（移除纯前端判题孤岛，接入统一提交） | codex | todo |  |
| T-008 | 统一防重复做题策略（Smart/Chapter/Mock 三模式统一排重参数与默认窗口） | codex | todo |  |
| T-009 | 统一错题本掌握度语义（修复 submitQuiz 与 submitExam 对 masteryLevel 的冲突） | codex | todo |  |
| T-010 | 抽题发布态约束（仅抽取 VERIFIED/PUBLISHED 题目） | codex | todo |  |
| T-011 | Weakness Quick Fix 服务端化（UI 改为复用 getWeaknessAnalysis） | codex | todo |  |
| T-012 | 实现 Examcoo 抓取脚本 MVP（`view -> getpapercontent -> comment/index` 循环抓解析） | codex | done | 1562851 |
| T-013 | 执行“小批量可见”导入（指定试卷入 10 题，写入 source/question_group/questions，默认 `REVIEW_PENDING`） | codex | done | 1562851 |
| T-014 | 完成 10 题审核发布链路验证（`REVIEW_PENDING -> VERIFIED -> PUBLISHED`） | codex | done | 1562851 |
| T-015 | 验证练习中心可见性（至少 1 条真实题在对应模式可拉取、可作答、可提交） | codex | done |  |
| T-016 | 优化 `public.questions` 结构：新增 `curriculum/grade/subject_id/asset_url/source/tags/is_past_paper/paper_id`，删除 `ocr_* / original_question_id / version`，并补索引 | codex | done |  |
| T-017 | 核对 `public.questions` 字段与逻辑映射清单，清理无读写闭环字段，修复难度过滤“权限与用户筛选取交集” | codex | todo |  |
| T-018 | 删除废弃表与逻辑：`chapter_prerequisites/question_groups/question_tag_relations/knowledge_points/question_kp_relations` | codex | todo |  |
| T-019 | 打通 `source_files` 与 `/admin/content/import`、`/admin/content/review`、`/admin/content/statistics` 三页真实数据流 | codex | todo |  |
| T-020 | 落实“录题 -> 审核 -> 用户答题 -> 记录 -> 掌握度展示”端到端闭环，练习侧仅可见 `PUBLISHED` | codex | todo |  |
| T-021 | 统一 `user_attempts` 与 `exam_records` 关系：所有模式同一提交算法、同一统计口径，历届真题仅保留题目标记 | codex | todo |  |
| T-022 | 移除 `error_book`，改为基于 `user_attempts` 实时聚合错题/薄弱点/掌握度（含 Error Wiper 与推荐逻辑） | codex | todo |  |
| T-023 | 走通 Content Review 真实流程：审核状态机统一、日志必记、举报阈值自动触发复审 | codex | todo |  |
| T-024 | 补齐 `question_reports` 用户端入口并接通管理端处理流（`getQuestionReports/resolveReport`） | codex | todo |  |
| T-025 | 复核练习模块全功能：模式切换、抽题、提交、统计、审核、报错、配额、去重、发布门禁，并输出验收报告 | codex | todo |  |

## 备注
- 执行优先级已确认：先修练习链路，再做爬虫录题。
- 爬虫导入策略已确认：全量入库，但默认 `REVIEW_PENDING`，审核后再进入可练题池。
- 当前插队执行策略：先完成“小批量可见”（10题可抓取 + 可入库 + 可审核发布 + 练习端可见），再扩量。
- 自 2026-03-05 起，`T-016` 之后任务已按“练习域结构重构 + 统一提交链路 + 废弃表删除”重排。
