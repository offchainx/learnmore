# 验收标准（Acceptance）

## 功能验收（Given / When / Then）
- 给定：已完成题目域数据库审计
  当：查看审计矩阵与基线快照
  则：能明确每张题目相关表的职责、读写入口、关键字段与核对 SQL。
- 给定：用户在练习中心先选科目再选择任意训练模式
  当：依次点击 Smart Drill / Error Wiper / Mock Arena / Chapter Map / Past Year Paper
  则：都能进入可执行链路（可拉题/可作答/可提交），不出现仅 UI 占位模式。
- 给定：执行 Examcoo 初中教育首批导入
  当：按分类 `k` 与 `paperId` 导入
  则：题目成功入库，默认 `REVIEW_PENDING`，来源可追溯，重复执行不产生重复题。
- 给定：用户完成一组练习提交
  当：调用 `submitQuiz`
  则：判分结果正确，`exam_records`、`user_attempts`、`error_book` 同步更新。

## 练习中心五模式闭环验收矩阵（先于爬虫导入执行）
| 模式 | 页面入口 | 核心函数 | 落库要求 | 验收标准 | 结果（pass/fail） | 证据 |
|---|---|---|---|---|---|---|
| Smart Drill | `/dashboard/practice/smart-drill` | `getSmartDrillQuestions` + 统一提交动作 | 必须写 `exam_records + user_attempts + error_book` | 提交后可核账到表 |  |  |
| Error Wiper | `/dashboard/practice/error-wiper` | `getErrorWiperSession` / `updateErrorWiperProgress` | 必须更新 `error_book`，并可追踪练习会话 | 正确/错误更新语义一致 |  |  |
| Mock Arena | `/dashboard/practice/mock-arena` | `startExam` / `submitExam` | 必须写 `exam_records + user_attempts` | 提交后可回放结果且防重复交卷 |  |  |
| Chapter Map | `/dashboard/practice/chapter-drill/[chapterId]` | `getRandomQuestions` + 统一提交动作 | 不允许仅前端本地判题 | 提交后可核账到表 |  |  |
| Past Year Paper | PracticeView 子入口 | 真题列表查询 + 会话提交动作 | 必须有真实数据源，不允许静态 mock-only | 可完整练习与提交 |  |  |

## 练习链路一致性验收（关键修复项）
| 验收项 | 预期 | 验证方式 | 结果（pass/fail） | 证据 |
|---|---|---|---|---|
| 防重复做题策略一致 | Smart/Chapter/Mock 排重规则一致且可配置 | 同用户连续两次拉题，对比重复率 |  |  |
| 错题掌握度语义一致 | 相同作答行为在 submitQuiz/submitExam 下结果一致 | 构造同题同答案对比两链路 |  |  |
| 发布态过滤 | 拉题仅来自 `VERIFIED/PUBLISHED` | SQL 检查练习会话题目状态 |  |  |
| 幂等提交 | 重复提交不产生重复关键记录 | 重放同请求，比较记录增量 |  |  |

## 题目域表审计矩阵（必须逐项填证据）
| 分层 | 表名 | 审计字段 | 核查 SQL（示例） | 当前基线（2026-03-04） | 结果（pass/fail） | 证据 |
|---|---|---|---|---|---|---|
| 结构层 | subjects | id,name,order | `SELECT count(*) FROM subjects;` | 8 |  |  |
| 结构层 | chapters | id,subject_id,title | `SELECT count(*) FROM chapters;` | 36 |  |  |
| 内容层 | questions | id,type,content_hash,status,chapter_id | `SELECT count(*) FROM questions;` | 61 |  |  |
| 内容层 | source_files | id,file_url,status,uploaded_by | `SELECT count(*) FROM source_files;` | 2 |  |  |
| 内容层 | question_groups | id,subject_id,source_paper | `SELECT count(*) FROM question_groups;` | 0 |  |  |
| 标签层 | question_tags | id,name,type | `SELECT count(*) FROM question_tags;` | 0 |  |  |
| 标签层 | question_tag_relations | question_id,tag_id | `SELECT count(*) FROM question_tag_relations;` | 0 |  |  |
| 标签层 | knowledge_points | id,name,subject_id | `SELECT count(*) FROM knowledge_points;` | 0 |  |  |
| 标签层 | question_kp_relations | question_id,kp_id | `SELECT count(*) FROM question_kp_relations;` | 0 |  |  |
| 练习层 | exam_records | user_id,score,total_questions | `SELECT count(*) FROM exam_records;` | 2 |  |  |
| 练习层 | user_attempts | user_id,question_id,is_correct | `SELECT count(*) FROM user_attempts;` | 106 |  |  |
| 练习层 | error_book | user_id,question_id,mastery_level | `SELECT count(*) FROM error_book;` | 12 |  |  |
| 质控层 | content_review_logs | content_type,from_status,to_status | `SELECT count(*) FROM content_review_logs;` | 0 |  |  |
| 质控层 | question_reports | question_id,issue_type,status | `SELECT count(*) FROM question_reports;` | 0 |  |  |

## Examcoo 初中教育录题验收矩阵
| 步骤 | 输入 | 预期 | 验证方式 | 结果（pass/fail） | 证据 |
|---|---|---|---|---|---|
| 分类抓取 | `https://www.examcoo.com/index/detail/mid/1/#s2` | 能解析初中教育分类与 `k` 编号 | 保存抓取结果（k 映射） |  |  |
| 试卷列表抓取 | `/paperlist/index/k/{k}/p/{page}` | 能解析 `paperId/title/题数/时间` | 抽样核对页面与解析结果 |  |  |
| 逐题页解析 | `/editor/do/exercise/pid/{paperId}` | 能提取 `leid/tokenleid` | 日志打印 + 抽样校验 |  |  |
| RPC 拉题 | `/editor/rpc/getexercisecontent/...` | 返回题块 JSON | JSON 结构校验（s1~s5） |  |  |
| 入库转换 | 题块 JSON | question type/answer 映射正确 | 抽查 20 题人工核对 |  |  |
| 幂等重跑 | 同一批次重复执行 | 不新增重复题 | `content_hash` 重复数=0 |  |  |
| 来源追溯 | 任意导入题目 | 可反查 source/paperId/url | SQL 回查 |  |  |

## Practice 链路验收矩阵（本地 + 预发都要执行）
| Action 名称 | 调用入口（页面/按钮/事件） | 输入样例（正常/异常） | 权限校验（未登录/越权） | 预期输出（成功/失败） | 幂等要求 | 日志与错误码 | 结果（pass/fail） | 证据 |
|---|---|---|---|---|---|---|---|---|
| submitQuiz | Practice 提交 | 正常：合法答案集；异常：未登录或题目不存在 | 未登录应返回 Unauthorized | 成功返回分数，异常返回错误 | 重放不应制造重复脏数据 | submit quiz error 日志 |  |  |
| updateLeaderboardScore | submitQuiz 后置 | 正常：correctCount>0；异常：points=0 | 内部链路触发 | 成功更新榜单 | 重放需验证积分一致 | leaderboard update 日志 |  |  |
| awardBadgeIfEligible | submitQuiz 后置 | 正常：达标；异常：未达标 | 内部链路触发 | 达标发徽章，未达标不发 | user_badges 唯一约束防重 | achievement 日志 |  |  |

## 数据核查 SQL（导入后必跑）
- 题目总量增长：
  - `SELECT count(*) FROM questions;`
- 来源分布（按 source/paper）：
  - `SELECT source_paper, count(*) FROM question_groups GROUP BY source_paper ORDER BY count(*) DESC;`
- 重复检查（content_hash）：
  - `SELECT content_hash, count(*) FROM questions GROUP BY content_hash HAVING count(*) > 1;`
- 练习可用性（按章节可拉题）：
  - `SELECT chapter_id, count(*) FROM questions GROUP BY chapter_id ORDER BY count(*) DESC;`

## 发布检查
- [ ] 题目域审计完成并附证据
- [ ] 五模式闭环与统一落库完成并附证据
- [ ] 防重复做题与掌握度语义一致性通过
- [ ] 初中教育首批导入完成并附证据
- [ ] 导入幂等通过（重复执行不重复写入）
- [ ] Practice 链路本地验证完成
- [ ] Practice 链路预发复测完成
- [ ] 回滚方案可执行并已演练
