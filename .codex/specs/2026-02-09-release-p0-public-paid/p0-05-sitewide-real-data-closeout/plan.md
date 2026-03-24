# 技术方案（Plan）

## 概览
- 子任务：P0-05 全站真实数据与联调收口
- 方案摘要：对全站页面做一次“真实数据、真实接口、真实落库”的收口治理，清理 mock 数据、对齐字段口径、补齐页面功能联调。
- 执行原则：先清单、再映射、后开发、最后双环境验收；未获用户确认前禁止进入实现。

## 本任务在 release 中的定位
- `P0-05` 不再只是 Dashboard 单页任务，而是全站联调收口任务。
- 其他子任务中已定义的领域改造继续保留；`P0-05` 负责补齐跨页面联调、剩余 mock 清理、字段口径核账与最终可用性闭环。

## 强制门禁（本任务必须满足）
1. 完成 `spec.md`、`plan.md`、`tasks.md`、`acceptance.md` 四件套并通过审阅。
2. 完成 `sitewide-real-data-governance-template.md`，作为后续页面任务统一治理模板。
3. 完成全站页面/功能/接口/数据表清单，明确每个页面的真实数据来源与动作入口。
4. 明确所有关键 Server Action / API 契约：输入校验、输出结构、错误结构、权限、幂等与并发策略。
5. 明确关键页面的字段级核账方式：页面字段、来源查询、对账 SQL、预期值。
6. 验证环境固定为本地 + 预发，两轮都要留下证据。

## T-004 模板绑定
- 统一治理模板文档：`p0-05-sitewide-real-data-closeout/sitewide-real-data-governance-template.md`
- 后续 `T-005 ~ T-019` 默认遵循该模板，不再在各页面任务内重复发明字段定义、状态口径、核账方式与迭代步骤。
- 如页面任务存在偏离，必须在页面任务文档中增加“偏离模板说明”。

## 页面域实施矩阵
| 波次 | 页面域 | 核心检查项 | 输出 |
|---|---|---|---|
| Wave 1 | Dashboard / Achievements / Settings | 首屏真实数据、任务/成长/设置写入、空态与权限态 | 字段映射表 + 页面冒烟 |
| Wave 2 | Practice 全模式 | 选题、提交、结果、统计、重复提交、题源真实化 | 会话链路核账 + SQL 证据 |
| Wave 3 | Leaderboard / Community / Courses | 列表/详情/互动/学习内容与真实聚合对齐 | 页面级联调记录 |
| Wave 4 | Admin / Billing / Support / Notifications | 管理数据、支付动作、反馈工单、通知摘要 | 写操作回执与日志核对 |
| Wave 5 | Public / Marketing / Auth | 登录注册、表单 CTA、博客/帮助等可用性 | 公开页可达性与动作检查 |

## 全站接口契约清单（按域）
| 页面域 | 关键 Action/API | 契约要求 | 主要表/服务 |
|---|---|---|---|
| Dashboard | `getDashboardStats`, `ensureDailyTasks`, `checkAndRefreshStreak` | 查询幂等、写入防重、空态可识别 | `users`, `daily_tasks`, `user_attempts`, `user_progress` |
| Practice | `startPracticeSession`, `submitPracticeSession`, `generateMockExam`, `submitExam`, 题目/统计相关 API | 输入严格校验、重复提交防重、结果可回放 | `questions`, `exam_records`, `user_attempts`, `question_reports` |
| Leaderboard | `getLeaderboard`, `getUserRank`, summary API | 周期切换一致、榜单与个人排名口径一致 | `leaderboard_entries`, `users` |
| Community | 发帖、列表、详情、评论相关 actions/API | 未登录/越权拒绝、成功后读写一致 | 社区相关表/API |
| Courses / Knowledge | 学科、进度、知识点相关 actions/API | 章节/课程读取与学习进度一致 | `subjects`, `chapters`, `lessons`, `user_progress` |
| Achievements / Gamification | 成就、任务、XP、streak 相关 actions | 奖励发放/刷新幂等、页面展示可复算 | `achievements`, `daily_tasks`, `users` |
| Settings / User | profile/settings/notification/parent actions | 修改后立即可读、失败不产生伪成功 | 用户与偏好设置相关表 |
| Admin / Billing / Support | admin actions、checkout、webhook、feedback、ticket | 权限严格、支付与反馈有真实回执 | 管理表、Stripe、support 表 |

## 数据核账要求
| 核账维度 | 要求 | 证据形式 |
|---|---|---|
| 页面读数据 | 页面展示字段必须能追溯到 SQL 或上游服务返回 | 截图 + SQL/返回样例 |
| 页面写数据 | 写操作完成后数据库状态与 UI 状态一致 | 提交前后快照 |
| 空态 / 无权限 | 不允许回退到 mock；必须为空态、禁用态或明确错误 | 页面截图 |
| 幂等 / 重复操作 | 刷新、重试、重复提交不能产生重复脏数据 | 两次操作前后 SQL 对比 |
| 异常态 | 接口失败时页面提示明确，不得伪装成功 | 错误截图 + 日志 |

## 已识别的初始热点文件（非完整清单）
- `src/app/(dashboard)/dashboard/leaderboard/page.tsx`
- `src/app/(dashboard)/dashboard/practice/chapter-drill/[chapterId]/page.tsx`
- `src/components/practice/PracticeView/ChapterMap/index.tsx`
- `src/components/practice/PracticeView/PastPapersSection.tsx`
- `src/components/practice/modes/SmartDrillMode.tsx`
- `src/components/courses/CoursesView.tsx`
- `src/components/shared/data.tsx`
- `src/actions/admin/stripe-mock.ts`

## 固定执行流程
1. 盘点所有页面与关键动作，建立 route -> component -> action/api -> table 映射。
2. 逐页识别 mock/fallback/preview-only 分支，标记为“替换 / 下线 / 明确禁用”。
3. 优先处理写操作与核心路径，再处理只读展示页。
4. 每完成一个页面域，立即做本地冒烟与表级核账。
5. 全站完成后，在预发复测相同关键场景并留证。

## 验证步骤（固定流程）
1. 本地：逐页面域执行成功、空态、异常、越权、重复提交场景。
2. 本地：对关键写操作记录 SQL 前后快照或等价后台证据。
3. 预发：复测同一批关键页面与动作，确认展示与数据库/上游一致。
4. 回归：执行全站最小冒烟，确认不存在阻断、假成功、mock 回退。

## 回滚与观测
- 触发回滚：核心页面白屏、关键动作失败、数据重复写入、支付/提交口径异常、页面重新回退 mock。
- 回滚步骤：回滚任务提交 -> 恢复上一个稳定版本 -> 复测核心页面与写操作。
- 观测要求：日志至少可定位 `userId`、页面/动作名、输入摘要、结果、错误码、时间戳。

## 开发改动清单（必填）

### 页面域与改动方向
| 页面域 | 改动方向 |
|---|---|
| Dashboard | 清空所有假统计/假活动/假任务入口，统一接真实聚合 |
| Practice | 去掉 mock 题组、preview-only 正式展示、前端孤岛判题与假卷库 |
| Leaderboard | 去掉首屏 mock 榜单与假排名 |
| Community | 确认列表、详情、发帖、评论真实读写与错误提示 |
| Courses / Knowledge | 替换 `mockUserContent` 与静态章节预览 |
| Achievements / Gamification | 成就、XP、等级、任务、streak 口径统一 |
| Settings / User | 资料与设置保存真实落库，不再假成功 |
| Admin / Billing / Support | 清理 mock 管理数据、假支付流水、假工单状态 |
| Public / Marketing | 所有 CTA 可达、表单可提交或明确禁用 |

### 非目标
- 不做新的产品范围扩张。
- 不为了消除 mock 而引入新的演示数据。

### 开发完成判定（DoD）
- 全站页面/功能/接口/数据完成真实化收口，或被明确禁用且无误导。
- 所有关键页面均完成本地 + 预发双环境验收。
