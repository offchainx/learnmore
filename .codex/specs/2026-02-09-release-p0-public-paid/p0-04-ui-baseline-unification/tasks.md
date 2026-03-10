# 执行任务清单（Tasks）

| id | description | owner | status (todo/doing/done) | link (PR/commit) |
|---|---|---|---|---|
| T-001 | 重写 P0-04 UI 基线统一 的 spec.md 与 plan.md 并补齐接口契约 | codex | done |  |
| T-002 | 重写 acceptance.md，加入 Action 与数据表核对矩阵 | codex | done |  |
| T-003 | 文档审阅与范围确认（用户确认前禁止开发） | user | doing |  |
| T-004 | 聚焦 `/dashboard/practice` 及其子页面的视觉方向定稿（练习中心重设计主线） | codex | doing |  |
| T-004.1 | 命名体系统一方案：冻结 Practice 术语、命名后缀规则、首批重命名映射表 | codex | done |  |
| T-004.2 | 练习中心总体视觉气质定义：专业训练舱、磨砂舱体、单主色+状态色 | codex | done |  |
| T-004.3 | 练习中心主页面方案：重做信息架构、首屏主次关系、PracticeCoachPanel 位置与作用 | codex | done |  |
| T-004.4 | Smart Drill 方案：启动态、训练中 HUD、答题节奏、结果页结构 | codex | done |  |
| T-004.5 | Error Wiper 方案：错因修复实验室定位、进度表达、结束复盘 | codex | done |  |
| T-004.6 | Mock Arena 方案：考试配置台、考试桌面、交卷确认、结果摘要 | codex | done |  |
| T-004.7 | Chapter Progress 方案：章节进度板语义、节点结构、进入 drill 的路径 | codex | done |  |
| T-004.8 | Past Paper Library 方案：试卷档案库结构、筛选、状态与入口动作 | codex | done |  |
| T-004.9 | PracticeCoachPanel 方案：知识网络、预测、薄弱点、推荐动作的统一骨架 | codex | done |  |
| T-004.10 | 练习中心共用设计合同冻结：标题、面板、CTA、空态、状态反馈、移动端规则 | codex | done |  |
| T-005 | 最小视觉定稿冻结（从练习中心提炼到全局基线） | user | doing |  |
| T-005.1 | 全局 token 冻结：颜色、圆角、阴影、focus ring、surface 层级 | codex | done |  |
| T-005.2 | 基础控件冻结：button / card / input / textarea 的默认与交互态 | codex | done |  |
| T-005.3 | 公共空态与 CTA 模板冻结：Dashboard / Leaderboard / Community 共用规范 | codex | done |  |
| T-005.4 | 壳层与导航规则冻结：BottomTabBar 与 dashboard-layout 路由映射、激活态一致 | codex | done |  |
| T-006 | 开发实现（门禁项，等待用户批准） | codex | todo |  |
| T-006.1 | 练习中心实现批次：命名与骨架 -> 主页面 -> 五种模式 -> 教练板 | codex | todo |  |
| T-006.2 | 全局基线实现批次：token -> 基础组件 -> 空态模板 -> 壳层导航 | codex | todo |  |
| T-007 | 本地验证（Action + SQL 快照） | codex | todo |  |
| T-007.1 | 本地 UI 回归：主路径、空态、加载态、移动端、导航一致性 | codex | todo |  |
| T-007.2 | 本地读链路验证：不新增非预期写入、不破坏现有 API 读取行为 | codex | todo |  |
| T-008 | 预发复测与收尾 | codex | todo |  |
| T-008.1 | 预发视觉复测：页面一致性、五种模式风格统一、壳层不退化 | codex | todo |  |
| T-008.2 | 预发行为复测：练习中心主路径与 Dashboard/Leaderboard/Community 基线统一 | codex | todo |  |

## 备注
- 当前阶段优先完成视觉方向确认与最小视觉定稿；未获用户批准前，不允许进入代码实现。
- T-004 为练习中心重设计主线；T-005 将练习中心定稿结果提炼为全局 UI 基线。
- T-004.1 已确认：统一使用 `Practice` 术语；`SubjectSelector` 改为 `PracticeSubjectBar`；`Chapter Map` 改为 `Chapter Progress` 语义。
- T-004.2 已确认：练习中心采用“专业训练舱 / 磨砂舱体 / 单主色+状态色”视觉合同，主强调色推荐冷钴蓝，禁止泛紫 AI SaaS 渐变与过度 neon 发光。
- T-004.3 已确认：`/dashboard/practice` 重构为“训练指挥台”，首屏优先回答“最弱哪里 / 今天练什么 / 最快提分入口”，桌面端采用 8/4 主副栏结构，移动端改为纵向任务流。
- T-004.4 ~ T-004.10 已完成第一版设计冻结：五种模式、教练板与共用设计合同均已写入 `plan.md / spec.md`，等待统一审阅。
- T-005.1 ~ T-005.4 已完成第一版全局基线冻结：token、基础控件、空态模板、导航壳层规则均已写入 `plan.md / spec.md`，等待统一审阅。
