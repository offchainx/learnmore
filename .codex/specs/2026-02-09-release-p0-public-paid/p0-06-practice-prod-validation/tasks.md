# 执行任务清单（Tasks）

| id | description | owner | status (todo/doing/done) | link (PR/commit) |
|---|---|---|---|---|
| T-001 | 更新 P0-06 文档范围，纳入“题目表审计 + 初中题目录入”两条主线 | codex | done |  |
| T-002 | 形成题目域数据表分层清单与当前库基线（含记录数快照） | codex | done |  |
| T-003 | 设计 Examcoo 初中教育导入链路（列表页 -> 逐题页 -> RPC）与字段映射 | codex | done |  |
| T-004 | 梳理当前练习题相关数据表、字段合理性与用户答题采集链路（本次） | codex | done |  |
| T-005 | 修复练习中心五模式入口闭环（补齐 Past Year Paper 动态路由与真实数据源） | codex | done | c0f1f96 |
| T-006 | Smart Drill 答题落库改造（统一提交到 `exam_records/user_attempts`） | codex | todo |  |
| T-007 | Chapter Drill 答题落库改造（移除纯前端判题孤岛，接入统一提交） | codex | todo |  |
| T-008 | 统一防重复做题策略（Smart/Chapter/Mock 三模式统一排重参数与默认窗口） | codex | todo |  |
| T-009 | 统一错题本掌握度语义（修复 submitQuiz 与 submitExam 对 masteryLevel 的冲突） | codex | todo |  |
| T-010 | 抽题发布态约束（仅抽取 VERIFIED/PUBLISHED 题目） | codex | todo |  |
| T-011 | Weakness Quick Fix 服务端化（UI 改为复用 getWeaknessAnalysis） | codex | todo |  |
| T-012 | 实现 Examcoo 抓取脚本 MVP（`view -> getpapercontent -> comment/index` 循环抓解析） | codex | done | 1562851 |
| T-013 | 执行“小批量可见”导入（指定试卷入 10 题，写入 `source_files/questions`，默认 `REVIEW_PENDING`） | codex | done | 1562851 |
| T-014 | 完成 10 题审核发布链路验证（`REVIEW_PENDING -> VERIFIED -> PUBLISHED`） | codex | done | 1562851 |
| T-015 | 验证练习中心可见性（至少 1 条真实题在对应模式可拉取、可作答、可提交） | codex | done |  |
| T-016 | 优化 `public.questions` 结构：新增 `curriculum/grade/subject_id/asset_url/source/tags/is_past_paper/paper_id`，删除 `ocr_* / original_question_id / version`，并补索引 | codex | done |  |
| T-017 | 核对 `public.questions` 字段与逻辑映射清单，清理无读写闭环字段，修复难度过滤“权限与用户筛选取交集” | codex | done |  |
| T-018 | 删除废弃表与逻辑：`chapter_prerequisites/question_groups/question_tag_relations/knowledge_points/question_kp_relations` | codex | done |  |
| T-019 | 打通 `source_files` 与 `/admin/content/import`、`/admin/content/review`、`/admin/content/statistics` 三页真实数据流 | codex | todo |  |
| T-019.1 | 清理 Supabase 中历史 mock questions（按可回滚策略执行） | codex | done |  |
| T-019.2 | `/admin/content/import` 真数据化（真实任务列表 + 导入动作），并保留 PDF/网页 URL 两类入口参数 | codex | doing |  |
| T-019.3 | 打通 Examcoo 题目导入流程（通过网页链接抓取） | codex | doing |  |
| T-019.4 | 打通 PDF/图像导入流程（OCR + 结构化 + 入库） | codex | todo |  |
| T-019.5 | 打通操作日志（新建任务/删除题目/完成处理/标记错误等） | codex | todo |  |
| T-019.6 | 替换 `http://localhost:3000/admin/content/import` Mock 数据 | codex | done |  |
| T-019.7 | `/admin/content/statistics` 真数据化（接 `getContentStats`，移除静态常量面板） | codex | todo |  |
| T-019.8 | `source_files -> questions` 主链路联通核查（入库关联、详情页、删除任务联动） | codex | todo |  |
| T-019.9 | 导入与审核链路错误处理与权限校验（未登录、非管理员、无效参数、失败重试） | codex | todo |  |
| T-019.10 | 端到端联调：录题 -> 审核 -> 发布 -> 练习可见 -> 提交落库 -> 统计回显 | codex | todo |  |
| T-020 | 落实“录题 -> 审核 -> 用户答题 -> 记录 -> 掌握度展示”端到端闭环，练习侧仅可见 `PUBLISHED` | codex | todo |  |
| T-021 | 统一 `user_attempts` 与 `exam_records` 关系：所有模式同一提交算法、同一统计口径，历届真题仅保留题目标记 | codex | todo |  |
| T-022 | 移除 `error_book`，改为基于 `user_attempts` 实时聚合错题/薄弱点/掌握度（含 Error Wiper 与推荐逻辑） | codex | todo |  |
| T-023 | 走通 Content Review 真实流程：审核状态机统一、日志必记、举报阈值自动触发复审 | codex | todo |  |
| T-024 | 补齐 `question_reports` 用户端入口并接通管理端处理流（`getQuestionReports/resolveReport`） | codex | todo |  |
| T-025 | 复核练习模块全功能：模式切换、抽题、提交、统计、审核、报错、配额、去重、发布门禁，并输出验收报告 | codex | todo |  |
| T-026 | Smart Drill 实际提交落库：`QuizSession` 改造为调用统一提交服务（非前端本地判分） | codex | todo |  |
| T-027 | Chapter Drill 实际提交落库：移除纯前端判题孤岛与 mock fallback | codex | todo |  |
| T-028 | `/admin/content/reports` 真数据化：接通 `getQuestionReports/resolveReport`（替换 MOCK_REPORTS） | codex | todo |  |
| T-029 | 练习端题目纠错入口接入：做题页/结果页可调用 `reportQuestion` | codex | todo |  |
| T-030 | T-019.2 子任务：导入弹窗支持“导入方式列表选择（文件上传/网页链接）”，并接通 `importFromWebUrl` | codex | done |  |
| T-031 | T-019.2 子任务：Examcoo 链接抓取题图并回填 `questions.asset_url`，验证入库字段映射 | codex | done |  |
| T-032 | T-019.2 子任务：`/admin/content/import` 任务列表/统计卡/审计抽屉去 Mock（改为 `getImportTasks/getContentStats/getImportAuditLogs`） | codex | done |  |
| T-033 | T-019.2 子任务：导入操作日志体系设计与落库（新建任务/删除/重试/标错/完成处理） | codex | todo |  |
| T-034 | T-019.3 子任务：导入表单科目改为固定 8 类（中文/马来西亚文/英文/数学/科学/历史/地理/其他）并按系统语言展示 | codex | done |  |
| T-035 | T-019.3 子任务：导入表单移除“年份”，并将“来源标识”改为“来源备注” | codex | done |  |
| T-036 | T-019.3 子任务：定位“抓 10 题仅入 6 题”原因并补充导入结果提示（成功/重复/失败） | codex | done |  |
| T-037 | T-019.3 子任务：增强 Examcoo 抓取兼容性（pid/token 解析、payload 解析、选项/答案兼容） | codex | done |  |
| T-038 | T-019.3 子任务：导入科目强制扩展为 8 类并按系统语言显示（zh/en/ms） | codex | done |  |
| T-039 | T-019.6 子任务：批量任务管理表头改造（批次名称=来源备注；科目&Curriculum） | codex | done |  |
| T-040 | T-019.6 子任务：进度栏接入事件状态口径（IMPORT_* / REVIEW_* / QUESTION_MARKED_ERROR）与事件筛选 | codex | done |  |
| T-041 | T-019.6 子任务：批量任务操作菜单接通（重试/删除/跳转审核/复制ID/来源链接） | codex | done |  |
| T-042 | T-019.6 子任务：已使用存储接 Supabase `storage.objects`，展示已用与剩余容量 | codex | done |  |
| T-043 | T-019.3 子任务：网页导入点击后立即关闭弹窗并回到导入列表，状态统一在任务列表查看 | codex | done |  |
| T-044 | T-019.6 子任务：批量任务管理去除事件统计行与事件筛选，仅保留“批次名称/科目/进度/状态/操作” | codex | done |  |
| T-045 | T-019.6 子任务：批量任务字段展示重排（批次名称=来源备注+ID/文件；科目列增加UEC+创建时间；操作支持打开来源链接） | codex | done |  |
| T-046 | T-019.8 子任务：修复 `/admin/content/review` Tabs hydration 报错（改为稳定的链接式 Tab 导航） | codex | done |  |
| T-047 | T-019.2 子任务：导入页右上角加入手动刷新按钮，并改造统计卡为导入核心 KPI（今日任务/成功率/待审核/近7天题量） | codex | done |  |
| T-048 | T-019.3 子任务：`public.questions` 新增 `image_urls` 并打通题图展示（审核列表缩略图 + 审核详情图像区） | codex | done |  |
| T-049 | T-019.6 子任务：导入页 UI 去 AI 化（降噪配色/弱化光效/减少冗余装饰），并提高信息密度 | codex | done |  |
| T-050 | T-019.2 子任务：KPI 卡片重排为横向可滚动区，存储使用并入同一指标带 | codex | done |  |
| T-051 | T-019.6 子任务：侧边栏 IA 调整，`Voucher 管理` 从“内容管理”迁至“用户管理”分组 | codex | done |  |
| T-052 | T-019.6 子任务：移除 Admin 页面顶部“Admin”标题占位，减少首屏空白 | codex | done |  |
| T-053 | T-019.6 子任务：按“Remote 风格深色主题”重做导入页视觉系统（顶部工具栏/KPI/任务表）并保持功能不变 | codex | done |  |
| T-054 | T-019.6 子任务：修复 Radix hydration mismatch（SubjectFilter/ReviewTable/BatchTable 改为 mounted 后渲染交互控件） | codex | done |  |
| T-055 | T-019.4 子任务：文件上传导入改为“提交任务后返回列表”，移除弹窗内解析进度，状态统一在批量任务管理中查看 | codex | done |  |
| T-056 | T-019.4 子任务：修复 OCRService 提供商初始化缺失 `mock` 导致开发环境 OCR 全失败问题 | codex | done |  |
| T-057 | T-019.4 子任务：禁止 Mock OCR/Mock 结构化默认入库（无真实 OCR/AI 配置即失败），并新增 `source_files.source_note` 持久化“来源备注”防止任务名回退文件名 | codex | done |  |

## 备注
- 执行优先级已确认：先修练习链路，再做爬虫录题。
- 爬虫导入策略已确认：全量入库，但默认 `REVIEW_PENDING`，审核后再进入可练题池。
- 当前插队执行策略：先完成“小批量可见”（10题可抓取 + 可入库 + 可审核发布 + 练习端可见），再扩量。
- 自 2026-03-05 起，`T-016` 之后任务已按“练习域结构重构 + 统一提交链路 + 废弃表删除”重排。
- 2026-03-10（UTC+8）导入异常复盘：最新批次抓取“10 题仅入 6 题”主因是 `content_hash` 去重命中（前 4 题已存在于更早批次，非抓取中断）。
- 2026-03-10（UTC+8）导入真实性修复：默认禁用 Mock OCR/Mock AI 结构化写库；未配置真实能力时直接失败并提示，避免“无中生有”题目污染；同时将“来源备注”持久化到 `source_files.source_note`，任务列表不再依赖题目写入成功才显示备注。
