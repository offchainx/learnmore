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
| T-012 | 实现 Examcoo 抓取脚本 MVP（`view -> getpapercontent -> comment/index` 循环抓解析） | codex | done |  |
| T-013 | 执行“小批量可见”导入（指定试卷先入 2 题，写入 source/question_group/questions，默认 `REVIEW_PENDING`） | codex | done |  |
| T-014 | 完成 2 题审核发布链路验证（`REVIEW_PENDING -> VERIFIED -> PUBLISHED`） | codex | todo |  |
| T-015 | 验证练习中心可见性（至少 1 条真实题在对应模式可拉取、可作答、可提交） | codex | todo |  |
| T-016 | 扩量到“每科 100 题”导入（按限速策略执行并记录幂等结果） | codex | todo |  |
| T-017 | 执行首批导入与幂等审计（优先初三数学 k=60，再扩展初中教育） | codex | todo |  |
| T-018 | 本地 + 预发双环境验收与收尾（含回滚演练） | codex | todo |  |

## 备注
- 执行优先级已确认：先修练习链路，再做爬虫录题。
- 爬虫导入策略已确认：全量入库，但默认 `REVIEW_PENDING`，审核后再进入可练题池。
- 当前插队执行策略：先完成“小批量可见”（2题可抓取 + 可入库 + 可审核发布 + 练习端可见），再扩量。
