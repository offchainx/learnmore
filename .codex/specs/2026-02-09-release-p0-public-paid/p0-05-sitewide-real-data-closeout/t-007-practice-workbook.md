# T-007 练习域真实化工作底稿

> 用途：按 `T-007.1 -> T-007.6` 顺序推进 `/dashboard/practice` 全路由族真实化。  
> 当前进度：已完成 `T-007.1`、`T-007.2`、`T-007.3`。  
> `T-007.3` 已完成两轮收口：第一轮清理首页/章节 fallback mock，第二轮基于正式规则补齐叶子章节消费、真题隔离与 Error Wiper 读定义。

## T-007.1 路由 / 页面 / 组件 / CTA / 当前数据源盘点

### 页面域总览
| 路由 | Page 入口 | 主要组件 | 主读取入口 | 主写入入口 | 当前状态 | 备注 |
|---|---|---|---|---|---|---|
| `/dashboard/practice` | `/src/app/(dashboard)/dashboard/practice/page.tsx` | `PracticeClientWrapper` -> `PracticeCenterScreen` | `/api/practice/bootstrap`、`/api/practice/subject-data` | 无直接写入 | 半真实 | 首页主体已接真实 API，但多个子区块仍有 preview/mock 注入 |
| `/dashboard/practice/smart-drill` | `/src/app/(dashboard)/dashboard/practice/smart-drill/page.tsx` | `SmartDrillSession` | `getSmartDrillQuestions()` | `submitPracticeSession()`（经统一答题组件）、附带 leaderboard/task/streak 侧效 | 混合 | 正式模式可读真题，但仍允许 `?preview=mock` |
| `/dashboard/practice/error-wiper` | `/src/app/(dashboard)/dashboard/practice/error-wiper/page.tsx` | `ErrorWiperSession` | `getErrorWiperSession()` | `updateErrorWiperProgress()` | 半真实 | 结果写入真实 attempt，但启动文案仍是 Preview 语义 |
| `/dashboard/practice/mock-arena` | `/src/app/(dashboard)/dashboard/practice/mock-arena/page.tsx` | `MockArenaSetup` | `getAllSubjects()`、`checkWeeklyExamQuota()` | `startExam()` | 真实主干 | 选卷与配额读取真实，需继续核对筛题与 quota 口径 |
| `/dashboard/practice/mock-arena/[examId]` | `/src/app/(dashboard)/dashboard/practice/mock-arena/[examId]/page.tsx` | `MockArenaExam` | `getExamQuestions()` / `getExamResult()` 类链路 | `submitExam()` | 真实主干 | 提交去重仅靠 `examRecord.duration !== null` |
| `/dashboard/practice/chapter-drill/[chapterId]` | `/src/app/(dashboard)/dashboard/practice/chapter-drill/[chapterId]/page.tsx` | `QuizView` | `getChapterWithStats()`、`getRandomQuestions()` | `submitQuiz()` -> `submitPracticeSession()` | 混合 | `preview-*` chapterId 和无题 fallback 时会注入 mock 题 |
| `/dashboard/practice/past-paper/[paperId]` | `/src/app/(dashboard)/dashboard/practice/past-paper/[paperId]/page.tsx` | `QuizView` | `prisma.question.findMany(isPastPaper)` | `submitPracticeSession()`（经统一答题组件） | 真实主干 | 页面本身读真实题组，但首页 Past Paper 区块仍存在 mock preview 分支 |
| `/dashboard/practice/import` | `/src/app/(dashboard)/dashboard/practice/import/page.tsx` | Smart Parser 相关组件 | 文件解析链路 | 题目导入相关写入 | 非正式页 | 不纳入 P0 正式练习域验收 |

### 首页 `/dashboard/practice` 主链路
| 层级 | 当前实现 | 说明 |
|---|---|---|
| Page | `PracticePage` | 只做登录校验，交给 client wrapper |
| Client Wrapper | `PracticeClientWrapper` | 负责 Dashboard Layout 与导航 |
| 主组件 | `PracticeCenterScreen` | 实际首页聚合入口 |
| Bootstrap 读取 | `/api/practice/bootstrap` -> `getPracticeBootstrapData()` | 取 subject catalog + defaultSubjectId |
| Subject 读取 | `/api/practice/subject-data` -> `getPracticeSubjectData()` | 取章节地图、past papers、knowledge hive、exam forecast |
| 主要下游聚合 | `getSubjectChapters()`、`getPastPapersBySubject()`、`getKnowledgeHiveData()`、`getExamForecastData()` | 当前首页的核心真实读来源 |

### 首页各区块当前状态
| 区块 | 主要组件 | 当前数据源 | 当前状态 | 风险 |
|---|---|---|---|---|
| Subject Bar | `SubjectSelector` | `/api/practice/bootstrap` | 真实 | subject catalog 有 direct query fallback，但不造假数据 |
| Training Mode Cards | `TrainingModeCards` | subjectData + 本地配置 | 半真实 | CTA 跳转真实，但部分卡片会引出 preview 对话框 |
| Chapter Map | `ChapterProgressSection` | `subjectData.chapters` | 混合 | 无真实数据时自动显示 `MOCK_CHAPTERS` |
| Past Paper Library | `PastPaperLibrarySection` | `subjectData.pastPapers` | 混合 | 无真实数据时自动显示 `MOCK_PAPERS` |
| Analytics Sidebar | `PracticeCoachPanel` | `knowledgeHive`、`examForecast` | 真实主干 | 仍需在 `T-007.2` 明确字段口径 |
| Preview Dialog | `PracticeModePreviewDialog` | 本地配置文案 | 非核账展示 | 可保留，但不能混入真实统计字段 |

### 各模式当前主读写链路
| 模式 | 读取入口 | 写入入口 | 主要表 | 当前问题 |
|---|---|---|---|---|
| Smart Drill | `getSmartDrillQuestions()` | `submitPracticeSession()` + `updateLeaderboardScore()` + `trackDailyProgress()` + `checkAndRefreshStreak()` | `questions`, `exam_records`, `user_attempts`, `leaderboard_entries`, `daily_tasks`, `users` | preview/mock 分支仍在正式组件内 |
| Error Wiper | `getErrorWiperSession()` | `updateErrorWiperProgress()` -> `createWiperAttempt()` | `user_attempts`, `exam_records` | 通过虚拟错题簿聚合，需补字段口径说明 |
| Mock Arena | `getAllSubjects()`, `checkWeeklyExamQuota()`, `startExam()` | `submitExam()` | `subjects`, `exam_records`, `user_attempts`, `users` | 会话幂等仍弱，考试题源口径要继续审计 |
| Chapter Drill | `getChapterWithStats()`, `getRandomQuestions()` | `submitQuiz()` -> `submitPracticeSession()` | `chapters`, `questions`, `exam_records`, `user_attempts` | `preview-*` id 与 fallback mock 题需清理 |
| Past Paper | `getPastPapersBySubject()`、`question.findMany(paperId)` | `submitPracticeSession()` | `questions`, `exam_records`, `user_attempts` | 首页入口仍有 mock preview 注入 |

### 当前已确认的 mock / preview / fallback 热点
| 热点 | 文件 | 当前行为 | 处置方向 |
|---|---|---|---|
| Smart Drill URL preview | `/src/app/(dashboard)/dashboard/practice/smart-drill/page.tsx` | `?preview=mock` 进入本地 mock 题组 | `T-007.5` 禁用正式入口 |
| Smart Drill 内置 mock 题组 | `/src/components/practice/modes/SmartDrillMode.tsx` | `MOCK_SMART_DRILL_QUESTIONS` 参与正式渲染分支 | `T-007.5` 剥离到 demo/debug |
| Chapter Map mock 章节 | `/src/components/practice/PracticeView/ChapterMap/index.tsx` | 无真实章节时自动注入 `MOCK_CHAPTERS` | `T-007.5` 改为空态 |
| Past Paper mock 试卷 | `/src/components/practice/PracticeView/PastPapersSection.tsx` | 无真实卷时自动注入 `MOCK_PAPERS` | `T-007.5` 改为空态 |
| Chapter Drill preview route | `/src/app/(dashboard)/dashboard/practice/chapter-drill/[chapterId]/page.tsx` | `preview-*` chapterId 和无题场景回退到 mock 题 | `T-007.5` 下线正式注入 |
| Error Wiper Preview 文案 | `/src/components/practice/modes/ErrorWiperMode.tsx` | 正式模式首屏写 `Error Wiper Preview` | `T-007.5` 去掉 preview 语义 |

### 当前阶段结论
- `T-007.1` 已完成，练习域当前不是“全 mock”，而是“首页真实聚合 + 多模式真实写链路 + 若干 preview/mock 注入混杂”。
- 进入 `T-007.2` 时，字段权威来源优先聚焦以下对象：
  - `questions`
  - `exam_records`
  - `user_attempts`
  - `daily_tasks`
  - `leaderboard_entries`
  - quota 相关派生字段
- `T-007` 目前最关键的不是新做 UI，而是先把以下三类边界彻底分开：
  - 正式真实数据链路
  - 可保留的非核账介绍型 preview
  - 必须移除的正式页 mock 注入

## T-007.2 练习域字段映射与权威数据源矩阵（第一版）

### 首页聚合字段
| 字段 | 页面/模块 | 权威来源 | 复算路径 | 空态规则 | 当前备注 |
|---|---|---|---|---|---|
| `subjects[]` | Practice 首页 Subject Bar | `subjects` | `getAllSubjects()` -> `normalizePracticeSubjects()` | 无科目返回空列表并显示错误态 | 有 direct query fallback，但不造 mock |
| `defaultSubjectId` | Practice 首页默认科目 | `subjects.key/order` | 目前优先 `math`，否则首个科目 | 无科目返回空字符串 | 属于派生规则，不单独落库 |
| `chapters[]` | Chapter Map | `chapters` + `user_attempts` + `questions` | `getSubjectChapters()` 聚合章节掌握度、近7天/30天统计 | 无章节返回空态 | 当前组件层仍会自动注入 `MOCK_CHAPTERS` |
| `chapters[].stats.totalAttempts` | Chapter Map | `user_attempts` | 按章节聚合 count | 无样本返回 `0` | 权威明细源 |
| `chapters[].stats.correctCount` | Chapter Map | `user_attempts` | 按章节聚合 `isCorrect=true` | 无样本返回 `0` | 权威明细源 |
| `chapters[].stats.masteryLevel` | Chapter Map / 薄弱点 | `user_attempts` | 当前实现为正确率百分比 | 无样本返回 `0` | 需在 `T-007.3` 与 Dashboard/Achievements 统一命名 |
| `chapters[].stats.questionCount` | Chapter Map | `questions` | 章节下题目数 | 无题返回 `0` | 当前包含所有关联题目数 |
| `pastPapers[]` | Past Paper Library | `questions.isPastPaper/paperId` | `getPastPapersBySubject()` 按 `paperId` 分组 | 无卷返回空态 | 当前组件层仍会自动注入 `MOCK_PAPERS` |
| `knowledgeHive[]` | Analytics Sidebar | `user_attempts` + `questions.chapterId` + `chapters` | `getKnowledgeHiveData()` 聚合正确率并映射状态色 | 无数据返回空数组 | 属于实时聚合，不读冗余表 |
| `examForecast` | Analytics Sidebar | `user_attempts` + `user_progress` + `users.streak` | `getExamForecastData()` -> `calculateExamForecast()` | 无历史返回默认低置信预测 | 当前算法口径已存在，需后续核账 |

### 模式入口与配额字段
| 字段 | 页面/模块 | 权威来源 | 复算路径 | 空态规则 | 当前备注 |
|---|---|---|---|---|---|
| `quota.used/limit/remaining/canProceed` | Smart Drill / Mock Arena 入口 | `user_attempts` / `exam_records` + tier 规则 | `checkDailyQuota()` / `checkWeeklyExamQuota()` | 无用户时报错，不造假 | `limit` 来自权限规则，不是数据库字段 |
| `modeCard.ctaHref` | Training Mode Cards | UI 配置 + subjectId | 由 mode 和当前 subject 生成 | 无 subject 时禁用或回退首页 | 属于页面配置，不做核账 |
| `previewDialog.details` | Preview Dialog | 本地说明配置 | 非核账说明文本 | 可空 | 不进入真实数据验收 |

### 题源与会话字段
| 字段 | 页面/模块 | 权威来源 | 复算路径 | 空态规则 | 当前备注 |
|---|---|---|---|---|---|
| `question.id/content/options/answer/explanation/type` | Smart Drill / Chapter Drill / Past Paper / Mock Arena | `questions` | 直接读取发布题目 | 无题则空态/禁用态 | 不允许正式页继续用 mock 题兜底 |
| `question.subjectId/chapterId/difficulty` | 各练习模式 | `questions` | 直接读取 | 无值时按模式容错 | Smart Drill 会按 subject + difficulty 筛题 |
| `smartDrillQuestions[]` | Smart Drill | `questions` + `user_attempts` | `getSmartDrillQuestions()`：优先薄弱章节，再补新题，再补剩余题 | 无题返回空态 | 当前函数内部仍有 fallback 题库补齐，但不是 mock |
| `chapterDrillQuestions[]` | Chapter Drill | `questions` | `getRandomQuestions()` | 无题应空态 | 当前 page 层无题时会注入 mock 题 |
| `pastPaperQuestions[]` | Past Paper 作答页 | `questions` | `findMany({ paperId, isPastPaper })` | 无题重定向回首页 | 作答页本身已是真实读链路 |
| `mockArena.questions[]` | Mock Arena 作答页 | `questions` + Exam config | `startExam()` 生成会话并缓存题组 | 无题应失败，不造假 | 需在 `T-007.3` 继续下钻 |

### 结果与统计字段
| 字段 | 页面/模块 | 权威来源 | 复算路径 | 空态规则 | 当前备注 |
|---|---|---|---|---|---|
| `examRecordId` | 各结果页 | `exam_records.id` | 提交时生成/更新 | 无记录不展示结果页 | 会话主键 |
| `score` | 结果页 / 历史回顾 / Dashboard | `exam_records.score` | 提交时写入 | 无记录不展示 | 权威汇总源 |
| `correctCount/totalQuestions` | 结果页 | `exam_records` | 提交时写入 | 无记录不展示 | 权威汇总源 |
| `durationSeconds` | 结果页 / 回顾 | `exam_records.duration` | 会话级用时 | 无值返回 `null` | 不应服务端格式化为字符串 |
| `results[questionId]` | 统一答题结果回放 | `user_attempts.isCorrect` | 提交后逐题回放 | 无数据不展示回放 | 逐题权威明细源 |
| `recentWrongQuestions` / Error Wiper 来源 | `user_attempts` | 以题目维度聚合最近记录 | 无错题返回空态 | 当前是“虚拟错题簿”，不是独立表 |
| `masteryLevel`（Error Wiper） | Error Wiper | `user_attempts` 最近 3 次记录 | `streakToMastery()` | 无样本返回 `0` | 与 Chapter Map 的百分比 mastery 不是同一口径，必须后续统一命名 |

### 副作用与衍生字段
| 字段 | 页面/模块 | 权威来源 | 复算路径 | 空态规则 | 当前备注 |
|---|---|---|---|---|---|
| `leaderboard score` | Mock Arena / Chapter Drill / Smart Drill 提交后 | `leaderboard_entries.score` | `updateLeaderboardScore()` 写入 | 未上榜为空 | 与 Dashboard/Leaderboard 共用口径 |
| `daily task progress` | 练习提交后 | `daily_tasks.current_count` | `trackDailyProgress()` | 无任务时不更新 | 依赖 `daily_tasks` 当日记录先存在 |
| `streakDays` | 练习提交后 | `users.streak` | `checkAndRefreshStreak()` | 无数据返回 `0` | 由有效学习事件推进 |
| `totalStudyTime` | 练习提交后 | `users.totalStudyTime` | `incrementTotalStudyTime()` | 无数据返回 `0` | 当前不同模式写入并不完全一致，需要后续统一 |
| `badge unlocks` | 练习提交后 | `user_badges` | `awardBadgeIfEligible()` | 无徽章为空 | 属于成就共享链路 |

### 当前字段口径冲突
| 冲突点 | 当前现状 | 后续处理 |
|---|---|---|
| `masteryLevel` | Chapter Map 用百分比；Error Wiper 用 0-3 等级 | 在 `T-007.3` 先拆成不同字段名或统一定义 |
| `duration` / `studyTime` | 会话用时、用户累计学习时长、结果页展示时长混用 | 在 `T-007.3/T-007.4` 统一命名为原始秒数 |
| `weakness` 来源 | Analytics、Dashboard、Smart Drill 推荐都可能各算一套 | 后续必须收敛到 `user_attempts + question.chapterId` 主口径 |

### 当前阶段结论
- `T-007.2` 第一版已把练习域的首页聚合字段、题源字段、结果字段、副作用字段拆开。
- 进入 `T-007.3` 时，优先要核的不是 UI，而是 4 条核心读链路：
  - `/api/practice/bootstrap`
  - `/api/practice/subject-data`
  - Smart Drill 拉题
  - Chapter Drill / Past Paper / Mock Arena 的题组生成

## T-007.3 练习域读链路对齐（第一轮）

### 本轮处理范围
| 范围 | 是否处理 | 说明 |
|---|---|---|
| `/api/practice/bootstrap` / `/api/practice/subject-data` 主读取链路审计 | 是 | 确认首页主读取链路已走真实聚合，不额外注入 mock |
| Smart Drill 真实拉题链路审计 | 是 | 审核 `getSmartDrillQuestions()` 当前逻辑与空题行为 |
| Chapter Map / Past Paper 首页区块自动 mock 注入 | 是 | 已改为空态，不再在正式首页自动塞 mock 列表 |
| Chapter Drill 正式章节无题 fallback mock | 是 | 已改为服务端空态，不再为正式章节自动塞 mock 题 |
| Smart Drill preview 体系整体下线 | 否 | 留到 `T-007.5` |
| 写链路、幂等、副作用 | 否 | 留到 `T-007.4` |

### 本轮实际改动
| 改动点 | 文件 | 改动结果 |
|---|---|---|
| 移除 Chapter Map 自动 mock 章节 | `/src/components/practice/PracticeView/ChapterMap/index.tsx` | 没有真实章节时显示空态，不再自动渲染 `MOCK_CHAPTERS` |
| 移除 Past Paper Library 自动 mock 试卷 | `/src/components/practice/PracticeView/PastPapersSection.tsx` | 没有真实试卷时显示空态，不再自动渲染 `MOCK_PAPERS` |
| 移除正式 Chapter Drill 的 fallback mock 题 | `/src/app/(dashboard)/dashboard/practice/chapter-drill/[chapterId]/page.tsx` | 正式章节没有已发布题目时返回服务端空态，不再自动注入 mock 题 |
| 保留 preview chapter 兼容分支 | `/src/app/(dashboard)/dashboard/practice/chapter-drill/[chapterId]/page.tsx` | `preview-*` 路由仍用专属预览题承接，但已与正式章节链路隔离 |

### 当前读链路结论
| 链路 | 当前结论 |
|---|---|
| Practice 首页 bootstrap | 走真实 subject catalog，不主动造假数据 |
| Practice 首页 subject-data | 走真实章节/真题/知识蜂巢/预测聚合，不主动造假数据 |
| Chapter Map | 正式首页已不再因“无数据”自动展示 mock 章节 |
| Past Paper Library | 正式首页已不再因“无数据”自动展示 mock 试卷 |
| Chapter Drill 正式章节 | 已只读取真实章节与真实已发布题；无题时明确空态 |
| Chapter Drill preview 章节 | 仍保留 preview 兼容读分支，后续在 `T-007.5` 统一清理 |

### 本轮验证
| 验证项 | 结果 |
|---|---|
| 变更文件 `eslint` | 已通过 |
| 全量 `tsc --noEmit` | 未通过，但失败项为项目既有全局类型问题；本轮新增图标命名问题已修复 |

### 手动验证方式
1. 打开 `/dashboard/practice`
2. 切到一个当前没有章节数据的科目
3. 确认 Chapter Map 显示“当前科目还没有可用章节练习”的空态，而不是 mock 章节列表
4. 在同样无真题数据的科目下，确认 Past Paper Library 显示空态，而不是 mock 真题列表
5. 打开一个真实但无已发布题目的章节 `/dashboard/practice/chapter-drill/[chapterId]`
6. 确认页面显示“当前章节还没有可用练习题”的空态，而不是自动进入 mock 题组
7. 打开一个真实有题的章节
8. 确认仍能正常进入 `QuizView`，题目来自真实数据库

### 当前阶段结论
- `T-007.3` 第一轮已经完成读链路最危险的三处清理：
  - 首页章节 mock 注入
  - 首页真题 mock 注入
  - 正式章节 fallback mock 题
- 还未处理的读链路问题，主要是 preview 体系本身的去留和 Smart Drill preview 入口，这些按计划进入 `T-007.5`。
- 下一步如果继续推进，就该进入 `T-007.4`：练习域写链路、幂等和副作用对齐。

## T-007.3 练习域读链路对齐（第二轮：基于正式规则收口）

### 本轮前置规则
| 规则 | 本轮落地方向 |
|---|---|
| `chapters.parent_id` 正式启用 | 读取链路开始默认只消费叶子章节 |
| `questions.chapterId` 只挂叶子章节 | 章节统计、章节训练、蜂巢默认基于叶子章节 |
| `isPastPaper = true` 与其他入口隔离 | Smart Drill / Mock Arena / 通用随机题读取默认排除真题 |
| Error Wiper 是错题修复视图 | 读定义明确为基于 `user_attempts` 聚合，不视为独立题池 |

### 本轮处理范围
| 范围 | 是否处理 | 说明 |
|---|---|---|
| Practice 首页章节列表仅读取叶子章节 | 是 | `getSubjectChapters()` 过滤存在子节点的章节 |
| 知识蜂巢仅读取叶子章节 | 是 | `getKnowledgeHiveData()` 过滤存在子节点的章节 |
| Chapter Drill 只允许叶子章节进入训练 | 是 | `getChapterWithStats()` 若章节存在子节点则返回 `null` |
| Smart Drill 排除真题 | 是 | `getSmartDrillQuestions()` 所有选题分支新增 `isPastPaper: false` |
| Mock Arena 排除真题 | 是 | 组卷逻辑只从叶子章节、非真题、已发布题中抽题 |
| 通用随机题读取默认排除真题 | 是 | `getRandomQuestions()` 新增 `includePastPaper`，默认 `false` |
| Error Wiper 读定义收正 | 是 | 在读链路上明确其为“错题修复视图” |
| Past Paper 独立题池强化 | 间接完成 | 既有 Past Paper 已按 `isPastPaper=true + paperId` 读取，本轮主要补其他模式的排除规则 |
| 写链路 / 幂等 / 副作用 | 否 | 仍留给 `T-007.4` |

### 本轮实际改动
| 改动点 | 文件 | 改动结果 |
|---|---|---|
| 章节详情只允许叶子章节进入训练 | `/src/actions/practice/data-service.ts` | `getChapterWithStats()` 若检测到子章节，直接返回 `null` |
| 科目章节列表只返回叶子章节 | `/src/actions/practice/data-service.ts` | `getSubjectChapters()` 过滤 `children: none` |
| 知识蜂巢只基于叶子章节 | `/src/actions/practice/statistics.ts` | `getKnowledgeHiveData()` 过滤 `children: none` |
| 通用随机题读取默认排除真题 | `/src/lib/practice/types/questions.ts` + `/src/actions/practice/data-service.ts` | 新增 `includePastPaper`，默认 `false`，读侧统一默认非真题 |
| Smart Drill 真题隔离 | `/src/actions/practice/recommendation.ts` | 薄弱章节、新题、fallback 三个分支统一增加 `isPastPaper: false` |
| Mock Arena 真题隔离 | `/src/actions/practice/exam.ts` | 组卷时只从叶子章节、`isPastPaper=false`、`PUBLISHED/VERIFIED` 题中抽题 |
| Error Wiper 读定义补注释与语义说明 | `/src/actions/practice/error-book.ts` | 明确其是错题历史聚合视图，不是独立题池 |

### 当前读链路结论
| 链路 | 当前结论 |
|---|---|
| Practice 首页章节图 | 默认只消费叶子章节 |
| Knowledge Hive | 默认只消费叶子章节 |
| Chapter Drill | 只允许叶子章节进入正式训练 |
| Smart Drill | 默认不混入真题 |
| Mock Arena | 默认不混入真题 |
| Past Paper | 继续只读真题卷 |
| Error Wiper | 明确定义为错题修复视图，而非普通选题入口 |

### 本轮验证
| 验证项 | 结果 |
|---|---|
| 相关变更文件 `eslint` | 已通过 |
| `tsc --noEmit` 过滤检查 | 未命中本轮改动文件报错 |

### 手动验证方式
1. 打开 `/dashboard/practice`
2. 确认章节地图与知识蜂巢默认只显示可练的叶子章节
3. 进入 `Smart Drill`，确认不会混入历年真题
4. 进入 `Mock Arena`，确认生成题组不会混入历年真题
5. 打开 `Past Paper`，确认仍然只展示真题卷
6. 打开 `Error Wiper`，确认其仍基于错题历史聚合，而不是像普通模式一样重新选题

### 当前阶段结论
- `T-007.3` 第二轮已经把 Practice 读链路和新规则对齐到同一口径：
  - 叶子章节消费
  - 真题隔离
  - Error Wiper 读定义收正
- 仍未进入的范围：
  - `exam_records / user_attempts` 写链路
  - 提交幂等
  - task / streak / XP / leaderboard 副作用
- 上述内容继续留给 `T-007.4`。
