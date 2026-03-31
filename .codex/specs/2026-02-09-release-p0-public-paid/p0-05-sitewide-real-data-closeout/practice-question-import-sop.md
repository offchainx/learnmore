# 练习题导入与清理打标 SOP

> 用途：在开始 `T-007.4` 之前，为练习中心导入一批可用的真实题目，并统一导入、清理、打标、审核的执行方式。
> 状态：当前项目可直接执行的正式流程说明。

## 文档使用方式

这份文档现在分成 2 层：

1. 顶部“任务清单层”
- 这是唯一主执行顺序
- 你只看这里，就应该知道当前做到哪个 task、下一步是什么
- 后续 thread 中提到的 `Step 1 / Step 2 / Step 6`，默认都以这一层为准

2. 下方“详细说明层”
- 保留原来的抓取方案、低成本策略、阶段 A-E、工作包等完整信息
- 这些内容不删，只作为展开说明、实现参考和运营执行 SOP
- 如果顶部任务清单和下方细节文字有理解冲突，以顶部任务清单的顺序和定义为准

## 当前主任务清单

下面这组 task 是当前唯一主执行顺序。

### Task 1：打通导入入口与题池分流

子任务：

- 给文件导入 / 网页导入增加统一入口
- 导入时明确区分“真题 / 非真题”
- 保证普通练习题不会误入 `Past Paper`

完成判定：

- 运营导入时可以显式选择是否为真题
- `isPastPaper + paperId` 写入规则稳定

当前状态：

- 已完成

对应详细章节：

- [当前真实入口](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/practice-question-import-sop.md#当前真实入口)
- [工作包 A：导入时增加“是否为真题”开关](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/practice-question-import-sop.md#工作包-a导入时增加是否为真题开关)

### Task 2：搭建网页抓取导入底座

子任务：

- 把网页导入统一收敛到 `importFromWebUrl`
- 把单站点抓取逻辑抽成 adapter
- 引入 `Crawlee + Playwright` 作为多站点抓取底座
- 建立统一中间结构和 runner

完成判定：

- 当前至少 1 个站点可走新架构导入
- 后续接第二站点不需要重写整条入口

当前状态：

- 已完成第二轮
- 已补齐批量导入页与内容审核页右上角的真实“刷新 / 操作日志”入口

对应详细章节：

- [网页抓取导入增强方案](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/practice-question-import-sop.md#网页抓取导入增强方案)
- [Crawlee + Playwright 详细实施步骤](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/practice-question-import-sop.md#crawlee--playwright-详细实施步骤)
- [开发落地步骤（详细说明）](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/practice-question-import-sop.md#开发落地步骤详细说明)

### Task 3：补规则清洗与 AI 补全

子任务：

- 明确“题型支持矩阵”
- 规则清洗：
  - HTML 清洗
  - 空白 / 断行规范化
  - 选项标签对齐
  - 答案格式统一
  - 图片地址修正
- 明确“图片处理口径”
  - 含图题如何抽取
  - 图片 URL 如何保存
  - 图片是否落本地存储
  - 哪些格式当前稳定，哪些仍需人工抽查
- AI 补全：
  - 结构纠偏
  - 解析补全
  - 难度建议
  - tags / 章节候选建议

完成判定：

- 不依赖 AI，也能导入一批结构基本可用的题
- AI 失败不会阻断导入主链路

当前状态：

- 已完成第一轮

对应详细章节：

- [开发落地步骤（详细说明）](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/practice-question-import-sop.md#开发落地步骤详细说明)
- [低成本与省 Token 策略](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/practice-question-import-sop.md#低成本与省-token-策略)

### Task 4：补章节打标与规则校验

子任务：

- 保证每题有 `subjectId`
- 尽量补齐叶子 `chapterId`
- 真题题目必须严格隔离
- 答案格式必须和题型匹配
- 规则优先，AI 只做章节候选增强

完成判定：

- 普通练习题能够进入章节型入口
- 不合法题目不会直接发布

当前状态：

- 已完成第一轮

对应详细章节：

- [核心规则](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/practice-question-import-sop.md#核心规则)
- [阶段 D：导入后打标](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/practice-question-import-sop.md#阶段-d导入后打标)
- [工作包 D：AI 辅助章节打标](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/practice-question-import-sop.md#工作包-dai-辅助章节打标)

### Task 5：补审核台、删除、KPI 和审核可用性

子任务：

- 审核台展示导入时间 / 审核时间
- 审核台展示科目 / 章节 / 真题标记
- 批量通过 / 驳回 / 发布 / 删除可用
- 单题菜单同类动作可用
- 顶部 KPI 口径正确
- 软删除与“已删除”视图可用
- 批量导入页右上角“刷新 / 操作日志”要明确是真实功能还是占位
- 内容审核页右上角是否需要补同类“刷新 / 操作日志”入口

完成判定：

- 审核台可以稳定处理导入后的题目
- 审核数据和列表展示口径一致

当前状态：

- 已完成第一轮

对应详细章节：

- [开发落地步骤（详细说明）](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/practice-question-import-sop.md#开发落地步骤详细说明)
- [工作包 B：题目软删除与“已删除”视图](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/practice-question-import-sop.md#工作包-b题目软删除与已删除视图)

### Task 6：验证非真题练习入口真实消费

子任务：

- `Smart Drill` 真实读链路验证
- `Chapter Drill` 真实读链路验证
- `Mock Arena` 真实读链路验证
- `Error Wiper` 真实读链路验证
- 进入练习模式后退出时，必须保留当前科目上下文，而不是默认回到第一个科目
- 排查题目“为什么看不到”的完整过滤链
- 保证未支持完整作答的题型不进入这几个入口
- 复核 `知识蜂巢 / 考试预测 / 薄弱点快修` 的当前逻辑是否完整
- 分析面板不得再注入 preview 假数据；真实无数据时必须展示真实空态
- 修复练习分析卡片在暗色模式下的可读性问题（例如考试预测辅助文案）

完成判定：

- 非真题题目已能被正式练习入口真实消费
- 入口不是“页面能打开”，而是“题能被选出并且能做”

当前状态：

- 已完成
- 第一轮已完成：
  - `Smart Drill / Chapter Drill / Mock Arena` 真实读链路已验证
  - 小题池 recent attempts 回退兜底已补齐
  - 未支持完整作答的题型已从非真题练习入口剔除
- 第二轮补充项已完成：
  - 练习模式退出保留科目上下文
  - 分析面板移除 preview 假数据
  - 考试预测卡片暗色模式可读性修复
- 收尾项已完成：
  - `Error Wiper` 已完成真实错题会话验证，且题池口径已收紧到仅包含非真题、未删除、前台支持题型
  - `知识蜂巢 / 考试预测 / 薄弱点快修` 已确认使用真实数据逻辑与真实空态，不再混入 preview 假数据

对应详细章节：

- [开发落地步骤（详细说明）](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/practice-question-import-sop.md#开发落地步骤详细说明)
- [发布前抽样验证](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/practice-question-import-sop.md#发布前抽样验证)

### Task 7：扩第一批基础题并补章节覆盖

子任务：

- 工作包 7.1【已完成】：补批量任务历史分页
  - 批量任务管理改成真正的服务端分页，而不是“只取 10 条再本地分页”
  - 目标口径：单页 `10` 条，可翻页查看更早导入记录
- 工作包 7.2【已完成】：修复 `useApp/AppProvider` 运行时错误
  - 复现并修复 `useApp must be used within an AppProvider`
  - 确保进入练习相关页面时所有路径都处于 `AppProvider` 上下文内
- 工作包 7.3【已完成（第一版）】：补解析图资产链路
  - 当前已覆盖题干图 + 选项图
  - 本轮补齐解析中的图片提取、转存、替换与审核展示
- 工作包 7.4【已完成】：修正内容审核完成后的回跳
  - 从内容审核进入单题后，完成通过 / 驳回后应返回内容审核页
  - 应尽量保留原 `tab / subjectId / page` 上下文
- 工作包 7.5【已完成（第一版）】：重构内容审核单题流为右侧抽屉连续审核
  - 列表点击题目后改为右侧滑出卡片，而不是整页跳转
  - 审核通过 / 拒绝后隐藏原操作按钮，改为展示“下一题”
  - 支持按当前筛选结果连续阅题与审核
- 工作包 7.6【已完成（第一版）】：重做五种练习模式的答题界面 UI
  - 覆盖 `Smart Drill / Error Wiper / Mock Arena / Chapter Drill / Past Paper`
  - 先基于当前真实页面整理“现状截图 + 结构约束 + 优化目标”的统一 prompt
  - 借助 `Google AI Studio` 产出更成熟的答题界面方案
  - 再把 AI Studio 给出的设计 / 代码建议仿真到现有 React + Tailwind 界面中，而不是脱离现有组件体系重做一套
  - 本工作包只做“答题页 + 交卷结果页”的 UI/UX 重构，不改变题目筛选、提交、计分、持久化口径
  - 当前明确目标：
    - 交卷后不再只显示一张信息很少的摘要卡
    - 要直接进入“提交后逐题复盘页”
    - 用户能够看到每一道题的题干、自己的答案、标准答案、正确/错误状态
    - 结果页仍保留顶部汇总信息与题号导航，但核心主体改为可滚动的逐题复盘
  - 当前补充口径：
    - `Mock Arena` 首页入口已恢复，并通过 preview 直接承接题量 / 难度 / 时长设置
    - `/dashboard/practice/mock-arena` 保留为兜底路由，不再作为练习中心主流程必经页
- 工作包 7.7【已完成（第一版）】：补订阅套餐驱动的“结果页解析展示”能力
  - 明确不同 `subscription package` 在答题结束后的展示差异
  - 至少区分：
    - 基础套餐：只展示答题是否正确、正确答案、基础结果摘要
    - 高阶套餐：展示题目解析、补充说明、后续提分建议
  - 将该权限口径统一接入五种练习模式的结果页，而不是只在个别页面存在占位锁功能
  - 明确“未解锁时”的空态 / 引导 / 升级提示，不允许结果页直接空白
  - 当前补充口径：
    - `STARTER`：只展示对错、用户答案、标准答案、顶部摘要
    - `STANDARD`：在 `STARTER` 基础上解锁逐题解析与基础补充说明
    - `SMART_PLUS / PREMIER`：在 `STANDARD` 基础上再解锁逐题“后续提分建议”和侧栏整轮建议
- 工作包 7.8【已完成（第一版）】：在内容审核中补“用户端预览”视图
  - 审核抽屉中不应只看到编辑/审核视图，还应能看到这题在用户端真实练习页里的呈现方式
  - 审核者应能切换：
    - `审核视图`
    - `用户端预览`
  - 用户端预览应优先复用前台真实题目组件，而不是再单独维护一套审核专用渲染
  - 第一版至少覆盖：
    - 单选 / 多选 / 判断 / 填空 / 主观题的真实答题态展示
    - 填空题在前台是否看起来像“可填空”的题
  - 对明显异常的题型展示给出预警提示：
    - 例如 `FILL_BLANK` 题目题干中未检测到明显 blank / 下划线 / 占位结构
- 工作包 7.9【已完成】：把内容审核右侧“元数据编辑”接回真实 `subjectId / chapterId`
  - 当前“科目 / 知识点”虽然显示真实值，但编辑时仍属于改字符串，不是真正落库
  - 本工作包要求：
    - `科目` 编辑时回写真实 `subjectId`
    - `知识点` 改名为 `章节`
    - `章节` 编辑时回写真实 `chapterId`
    - 编辑时必须提供真实下拉选项，而不是自由输入文本
  - 推荐交互：
    - 先选择 `科目`
    - 再根据当前 `subjectId` 提供该科目的章节下拉选项
    - 章节选项应尽量展示完整路径（例如 `七年级上册 / 第三单元 / 诗歌默写`）
    - 章节下拉只允许选择叶子章节，避免题目挂到父节点
  - 目标：
    - 审核台编辑直接影响题目真实归属
    - `Smart Drill / Chapter Drill / 章节题池` 消费到的就是审核后真实归属数据
- 工作包 7.10【已完成（第一版）】：补“动态难度”机制
  - 当前题目难度默认导入为 `3`
  - 已落地的第一版：
    - 基于 `user_attempts` 的真实作答统计回写 `questions.difficulty`
    - 仅在单题样本量达到最小阈值后生效（当前阈值：`20` 次）
    - 当前映射规则：
      - 正确率 `>= 85%` -> `L1`
      - 正确率 `>= 70%` -> `L2`
      - 正确率 `>= 45%` -> `L3`
      - 正确率 `>= 25%` -> `L4`
      - 正确率 `< 25%` -> `L5`
    - 当前覆盖答题提交链路：
      - 普通练习提交
      - `Mock Arena` 交卷
  - 设计原则：
    - 当前第一版直接回写 `questions.difficulty`，先保证题池消费链路立刻受益
    - 后续增强版再考虑拆分：
      - `difficultyBase`
      - `difficultyDynamic`
      - `difficultyEffective`
  - 运算策略：
    - 不做全表实时重算
    - 当前为“单次交卷后，只重算本次涉及题目”的轻量增量聚合
    - 后续若需要再引入耗时因子、时间衰减和定时批处理
- 工作包 7.11【已完成（第一版）】：正式支持“组合题 / 材料题 / 共用题干子题”（路线 B）
  - 目标：
    - 不再把“材料 + 多个子题”强行当作多道完全独立题处理
    - 要让系统原生理解：
      - 一段共享材料 / 阅读文章 / 图表说明
      - 下面挂若干个子题
      - 用户端按“材料在上、子题在下”真实展示
  - 抓取层要求：
    - `examcoo` 导入器需要先识别“组合题块”
    - 要能稳定拆出：
      - `sharedMaterial / sharedStem`
      - `subQuestions[]`
    - 不能再只按单题 `s1 ~ s5` 直接扁平抽取
    - 第一阶段先针对典型阅读题 / 材料题 / 图表题做识别规则，不要求一步覆盖所有极端版式
  - 数据模型要求：
    - 正式新增 `question_group`（或同等语义模型），而不是把共享材料复制进每道题
    - 子题需要可挂接到真实 `groupId`
    - `group` 需要能保存：
      - 共享材料正文
      - 共享图片资产
      - 来源信息
      - 审核状态
      - 章节 / 科目归属口径
  - 导入入库要求：
    - 同一个组合题块入库后，需要形成：
      - `1` 条组合题记录
      - `N` 条子题记录
    - 去重不能只看单题 hash，也要考虑组合题级别的去重口径
    - 图片转存链路需要同时覆盖：
      - 共享材料图片
      - 子题题干图片
      - 子题选项图片
      - 子题解析图片
  - 内容审核要求：
    - 审核台需要能识别“当前是组合题”
    - 要支持查看：
      - 共享材料
      - 子题列表
      - 当前子题的用户端预览
    - 审核历史与状态流转不能只停留在单题层，也要支持组合题级别日志
  - 用户端练习要求：
    - 练习页需要支持“材料在上、子题逐个作答”
    - 结果页需要支持“按组合题复盘”
    - 子题正确 / 错误、答案、解析仍按子题粒度展示
    - 但共享材料不应在每道子题中重复铺满整屏
  - 推荐开发顺序：
    - 第一步：`examcoo` 组合题识别 PoC
    - 第二步：数据库与 Prisma 模型补 `question_group / groupId`
    - 第三步：导入链路支持组合题正式入库
    - 第四步：审核台支持组合题与子题联动审核
    - 第五步：用户端练习 / 结果页支持组合题真实呈现
  - 当前进展：
    - 第一步已完成：
      - `examcoo` 导入器已能从 `getpapercontent` payload 中识别 `id = "b"` 的共享材料块
      - 已用 `1287996` 真实卷验证出 `3` 个组合题块，其中包含 `三轮车夫`
      - 已补单元测试，避免后续回归破坏识别逻辑
      - 批量导入诊断已补“组合题组数 / 组合题组 ID”展示，人工核对导入批次时可直接看到是否命中组合题识别
    - 第二步已完成：
      - `question_group / groupId` Prisma schema 已补齐
      - SQL 已通过 Supabase SQL Editor 手动执行完成
      - 本地 Prisma Client 已重新生成
    - 第三步已完成：
      - 导入链路已正式写入 `question_groups`
      - 子题已回写真实 `groupId`
      - 已用真实导入批次验证 `question_groups` 与 `questions.group_id` 落库
    - 第四步已完成：
      - 审核台已展示组合题共享材料
      - 审核抽屉已支持查看同组子题并在组内切换
    - 第五步已完成（第一版）：
      - 用户端练习页已支持“材料在上、子题在下”的共享材料渲染
      - 结果页 / 逐题复盘页已支持组合题共享材料复盘
    - 当前剩余：
      - 后续可选增强：组合题级审核日志与更细粒度的组合题运营工具
  - 第一轮验收结果：
    - 至少拿 `3 ~ 5` 张典型阅读材料题卷子跑通
    - 能正确保留共享材料，不丢、不重复、不错误拼接
    - 用户端能看到“共享材料 + 多个子题”的真实结构
    - 审核台能一眼判断该组合题在用户端的真实表现
- 工作包 7.12【已完成（第一轮）】：补图片资产稳定性方案
  - 明确含图题的图片是否只保留远程 URL，还是转存到自有存储
  - 明确题干图 / 解析图 / 多图题的保存与展示口径
  - 补“原站失效 / 防盗链 / 404”时的兜底策略
- 工作包 7.13【已完成（第一版）】：补导入缺失题诊断能力
  - 能区分“原卷预计题数”与“实际抓取题数”
  - 能记录抓取失败 / 解析失败 / 被过滤 / 重复跳过的原因
  - 能追踪缺失题号或 `rawQuestionId`，让运营知道具体漏了哪些题
- 工作包 7.14【已完成（策略已定义）】：礼貌抓取策略（避免被封 / 避免给对方站点造成负担）
  - 不做“绕过”类动作：
    - 只抓公开可访问页面（不登录、不验证码、不绕防护）
    - 遇到明确拦截（`403/429`、跳转到登录/验证页）直接停下，不要硬刷
  - 全局限速与并发（默认值以“稳”为主，后续用数据再调）：
    - 全局并发：`1`
      - 含义：同一时间只跑 1 个卷子导入任务（避免卷子并发把对方站点打穿）
    - 请求间隔：`0.5s ~ 2s`，并加随机抖动 `jitter`
      - 含义：每次 HTTP 请求之间强制 sleep，避免“固定节拍”触发风控
    - 单卷最大抓取速率：
      - 强制按“卷子页 -> 逐题页/题块”串行抓取，不做并行 fan-out
  - 退避与暂停（遇到拦截时要“自动降载”而不是“自动加速重试”）：
    - `429` / 频繁超时：指数退避（例如 `1min -> 5min -> 30min`），并将该批次标记为 `paused`
    - `403`：视作被拦截，直接进入 `paused`，要求人工确认（不要自动重试）
    - 连续失败阈值（例如连续 10 次请求失败）：自动暂停整条队列
  - 缓存与断点续跑（减少重复请求是最有效的“礼貌抓取”）：
    - `source_file_id + paperId` 对应的“原始 HTML/提取中间产物”需要可复用
    - 同一卷子重复导入时：
      - 优先复用已保存的抓取结果
      - 只重跑失败的题号/题块，不要整卷重抓
  - 分批导入与每日上限（先跑通，再放量）：
    - 灰度节奏：先 `10` 张卷子验证稳定性，再 `50`，再 `200`
    - 每日任务上限（初始建议）：`200 ~ 500` 张卷子/天（后续按成功率与耗时动态调整）
  - 可观测性（出了问题能第一时间知道“是否被封/是否超载”）：
    - 每个批次记录：请求数、平均延迟、`429/403` 次数、重试次数、暂停原因
    - 后台批次列表能一眼区分：正常失败（解析问题）vs 被拦截（限流/封禁）
- 工作包 7.15【未开始】：继续导入非真题基础题
  - 基于已打通的网页导入链路，按批次继续导入第一批基础题
  - 当前建议节奏：
    - 先人工抽样导入 `10` 份卷子核对
    - 再逐步扩到 baseline 批量导入
- 工作包 7.16【未开始】：扩每个叶子章节的最小题量
  - 目标是让每个叶子章节具备最小可用题量，而不是只有科目级别“有题”
  - 当前需配合真实章节归属、动态难度和审核发布一起推进
- 工作包 7.17【进行中】：提升 `Mock Arena` 和 `Chapter Drill` 的题池覆盖
  - 入口、交互和题池消费链路已打通
  - 当前仍需通过继续导题与章节挂接，补齐真实覆盖率
  - 当前补充子任务（导入验收稳定性）：
    - `7.17-a` 修复“批次显示失败但题目已正常入库”的误判问题
      - 目标：题目已写入 `questions` 后，不应再因为导入收尾阶段的缓存刷新 / revalidate 异常把批次打成 `FAILED`
      - 需要修复 `bulkCreateQuestions()` 等批量入库收尾逻辑，避免“已入库但批次失败”
    - `7.17-b` 修复导入题目停留在 `DRAFT` 导致审核无法通过的问题
      - 目标：导入成功后，题目必须自动推进到 `REVIEW_PENDING`
      - 即使入库后收尾阶段出现异常，也要有恢复逻辑，把已入库题目从 `DRAFT` 推进到 `REVIEW_PENDING`
      - 同时要补修历史遗留批次，避免人工逐题处理
    - `7.17-c` 修复主观题 / 参考答案中包含图片时的抓取、转存与展示
      - 目标：`ESSAY` 等主观题的 `answer` 不再保留原始 HTML `<img>`
      - 抓取阶段应把答案区 HTML 转成 markdown 图片
      - 图片转存链路应同时覆盖答案中的图片，而不只覆盖题干 / 选项 / 解析
- 工作包 7.18【已完成】：批量导入任务队列化（允许连续创建，后台串行消费）
  - 目标是把当前“提交后立刻同步抓取”的网页导入链路，改成真正的 `PENDING -> PROCESSING -> COMPLETED/FAILED` 队列模型
  - 前端要求：
    - 当已有任务在抓取时，仍允许继续创建新的网页导入任务
    - 新创建的任务要立刻出现在批量任务管理列表中
    - 新任务在未开始抓取前显示为 `Queued / 等待处理`
  - 后端要求：
    - 同一时间仅消费 1 个网页导入任务，避免并发抓取触发限流
    - 后续任务按创建时间顺序依次消费
    - 保留“相同 URL 不能重复创建”的去重逻辑
  - 当前范围：
    - `Examcoo` 网页链接导入已进入统一队列
    - 文件上传导入（PDF / 图片）也已进入同一套 `PENDING -> PROCESSING -> COMPLETED/FAILED` 队列
  - 本轮补齐的收口项：
    - 导入页打开时会自动尝试恢复并拉起导入消费器
    - 对长时间停留在 `PROCESSING` 且无后续进度的任务，增加自动回收逻辑：
      - 若题目已入库，则自动补全为 `COMPLETED`
      - 若长时间无题目入库，则自动标记为失败，避免队列堵死
  - 完成判定：
    - 不同 URL / 不同文件可连续创建多个导入任务
    - 列表顶部能立即看到新任务
    - 后台不会并发抓多个导入任务
    - 前一个任务完成后，下一个任务会自动启动
- 工作包 7.19【已完成】：收口全站主要页面在中窄视窗下的自适应收缩与重排
  - 问题定义：
    - 当前多个 Dashboard 页面在浏览器宽度缩小到约半屏时，没有像 YouTube 那样随视窗变化自动重排
    - 页面不是“等比例缩放”，而是因为部分容器仍维持桌面最小宽度、固定列宽与固定栅格，导致文案竖排、卡片挤压、主内容横向空间不足
  - 目标：
    - 在 `desktop -> tablet -> mobile` 之间建立统一的 Dashboard 响应式收缩规则
    - 先让内容优先“重排”，再考虑必要的局部横向滚动，避免出现内容被压成长竖列或固定卡宽撑破布局
  - 第一阶段范围：
    - 优先覆盖：
      - `/dashboard`
      - `/dashboard/courses`
      - `/admin/content/import`
      - `/admin/content/review`
    - 同时收口共用壳层 `DashboardLayout`
  - 开发原则：
    - 不做整页 `scale()` 缩放
    - 以“容器宽度约束 + 栅格断点重排 + 子组件 `min-w-0` / 文案截断 / 横向滚动兜底”为主
    - 主内容区需要在中等宽度下优先从多列切到单列或 `1fr` 弹性布局
  - 当前进展：
    - 已完成共用壳层修复：
      - `DashboardLayout` 主内容区补齐 `min-w-0`
      - `PageHeroShell / PageHeroTitle / SectionBlockHeader` 补齐 `min-w-0` 与可换行行为
      - 共用 `pageShellFrame / pageTableShell` 增加 `min-w-0`
      - `DashboardLayout` 的桌面壳层断点统一切回真实 `desktop=1024`，修复中窄宽度下桌面 Sidebar 与底部移动导航同时出现的问题
    - 已完成页面级收口：
      - Dashboard 首页、Courses 页、Practice Center 的主双栏布局与右侧分析栏改为更晚启用，避免半屏宽度下仍强行双列
      - 导入页 KPI 卡从过早的 6 列布局改成分阶段重排
      - 内容导入 / 内容审核表格改为局部横向滚动，不再优先把整页内容挤坏
    - 已完成 marketing / auth 页面收口：
      - Landing、Pricing、登录 / 注册页已补断点后移与可收缩容器
      - Help、Contact、About Us、Student Care、Success Stories、Subjects、How It Works 已补关键断点重排
      - Landing / Pricing 的对比区域已优先改成局部横向滚动或更晚启用多列，避免中窄视窗直接挤坏整页
    - 已完成第二轮页面级收口：
      - Dashboard 次级页与 admin 子页已统一把布局切换断点从默认 `md/lg/xl` 收回到项目真实的 `tablet/desktop/2xl`
      - 已覆盖 `/dashboard/settings`、`/dashboard/community`、`/dashboard/community/new`、`/admin/users`、`/admin/feedback`、`/admin/referrals`、`/admin/content/statistics`
      - 练习深层页与配置页已覆盖 `Mock Arena`、`Smart Drill`、`Error Wiper`、`Chapter Drill`、答题工作区与复盘工作区
    - 已完成浏览器回归：
      - 已用浏览器在中窄视窗下检查 `/dashboard`、`/dashboard/courses`、`/dashboard/practice`、`/dashboard/settings`、`/dashboard/community`、`/dashboard/community/new`
      - 已检查 `/admin`、`/admin/users`、`/admin/feedback`、`/admin/referrals`、`/admin/content/import`、`/admin/content/review`、`/admin/content/statistics`
      - 已检查 `/`、`/pricing`、`/subjects`、`/how-it-works`、`/about-us`、`/student-care`、`/success-stories`、`/study-guides`、`/help`、`/contact`
      - 练习中心已确认修复“半屏宽度下桌面 Sidebar 与底部移动导航同时出现”的断点冲突
  - 完成判定：
    - 浏览器宽度收窄时，主内容不再出现大段竖排文字或卡片被挤成细长条
    - 核心页面能在约半屏宽度下保持可读、可操作
    - 不依赖用户手动缩放浏览器比例
- 工作包 7.20【已完成】：修复左侧 Sidebar 在手风琴展开时遮挡“升级套餐”卡片的问题
  - 问题定义：
    - 当前 Sidebar 中部菜单区与底部账户区没有真正分层，靠 `pb-56` 为底部腾空间
    - 当“用户管理 / 内容管理”同时展开时，中部滚动区会把“升级套餐”卡片与底部账户区挤压遮挡
  - 目标：
    - 把 Sidebar 明确拆成：
      - 顶部品牌区
      - 中部可滚动导航区
      - 底部固定账户区
    - “升级套餐”卡片应属于中部导航区的可见内容，不应被底部账户区遮住
  - 交互要求：
    - 同时展开多个手风琴时，菜单仍能顺畅滚动到底
    - 底部等级卡、设置、退出登录始终固定可见
    - 小屏与桌面端都保持一致行为
  - 本轮完成内容：
    - Sidebar 已重构为三段式：
      - 顶部品牌区
      - 中部可滚动导航区
      - 底部固定账户区
    - “升级套餐”卡片保留在中部导航滚动区，不再与底部账户区共享定位层
    - 移除了依赖硬编码 `padding-bottom` 规避遮挡的做法，改为 `flex + min-h-0 + overflow-y-auto` 的稳定布局
  - 完成判定：
    - 打开“用户管理 + 内容管理”后，升级套餐卡片仍完整可见或可自然滚动到可见区域
    - Sidebar 不再依赖硬编码 `padding-bottom` 规避遮挡
- 工作包 7.21【已完成】：增强内容审核列表的信息架构与排序能力
  - `7.21-a` 支持按“导入日期”排序，并提供明确排序选项
    - 排序口径优先采用 `sourceFile.createdAt`
    - 需要在审核页补充排序 UI，而不是只保留默认创建时间倒序
  - `7.21-b` 在内容审核列表新增“批次名称”
    - 展示值对应 `source_files.source_note`
    - 方便运营在审核时快速定位这题来自哪个导入批次 / 来源备注
  - 当前实现结果：
    - 审核页已提供“导入日期 / 审核日期 / 创建时间”的排序选项
    - 审核列表新增“批次名称”列，并统一用真实批次时间作为“导入时间”显示口径

说明（Task 7 当前执行口径）：

- 图片资产稳定性：当前已覆盖「题干图 + 选项图 + 解析图」转存到自有存储并替换 URL
- 导入缺失题诊断 V2（增强版）：先不开发，本轮只保留第一版能力，V2 作为后续工作项排期
- 五种练习模式答题界面：当前主要共用 `UnifiedPracticeWorkspace + PracticeResultPanel`，进入 `工作包 7.6` 时需要按“共用骨架 + 模式差异文案”统一改造
- 结果页解析展示：当前主练习链路尚未完整接入“按订阅套餐区分解析可见性”的真实能力，`工作包 7.7` 需要补齐正式权限与展示逻辑
  - 当前最新状态：主练习链路已改为共用逐题复盘页，并按 `STARTER / STANDARD / SMART_PLUS / PREMIER` 四档展示差异化结果内容
- 审核台元数据：当前已开始进入“真实 ID 编辑”阶段，后续应以 `subjectId / chapterId` 为准，不再以展示字符串作为保存口径
- 组合题 / 材料题：当前系统已完成“共享材料 + 子题”的第一版原生模型支持，后续继续补组合题级运营与审核增强能力

完成判定：

- 至少 1 个科目可稳定支撑 `Smart Drill + Chapter Drill + Mock Arena`

当前状态：

- 进行中
- 当前排期顺序：
  - 先做 `工作包 7.1 批量任务历史分页`
  - 再做 `工作包 7.2 useApp/AppProvider 报错修复`
  - 再做 `工作包 7.3 解析图资产补齐`
  - 再做 `工作包 7.4 内容审核回跳修正`
  - 再做 `工作包 7.5 内容审核抽屉连续审核流`
  - 再做 `工作包 7.6 五种练习模式答题界面 UI 重构`
  - 再做 `工作包 7.7 订阅套餐驱动的结果页解析展示`
- 已完成子项：
  - `工作包 7.5 内容审核抽屉连续审核流` 已完成第一版：
    - 内容审核列表点击题目后，改为右侧抽屉打开单题，不再整页跳转
    - 审核通过 / 驳回后，原“通过 / 拒绝”按钮会切换为单个“下一题 / 返回审核列表”按钮
    - 点击“下一题”会继续打开当前筛选列表中的下一题，保持在同一审核流内连续处理
    - 关闭抽屉后会回到原 `/admin/content/review?tab=...&range=...&page=...` 列表上下文
    - 为避免服务端审核 action 自动刷新冲掉状态，审核完成态改为 URL 托管，已覆盖抽屉关闭与下一题切换
    - 当前仍需继续优化抽屉内容密度、已审核状态提示与更完整的阅读体验，但主交互链路已打通
  - `工作包 7.4 内容审核回跳修正` 已完成：
    - 从内容审核列表进入单题时，会把当前列表上下文编码为 `returnTo`
    - 单题页左上角返回、审核通过、审核驳回都会统一回到原 `/admin/content/review?...` 地址
    - 当前已覆盖 `tab / range / page / subjectId` 等查询参数透传
  - `工作包 7.3 解析图资产补齐` 已完成第一版：
    - `Examcoo` 抓取阶段不再把解析 HTML 直接抹平成纯文本，解析中的 `<img>` 会转成 markdown 图片
    - 解析图已接入和题干图 / 选项图同一套 Supabase 转存链路
    - 图片转存进度与资产计数已包含解析图，后台“正在转存图片 x/y”口径同步修正
  - 导入缺失题诊断能力第一版已完成：
    - `source_files.import_diagnostics` 已可持久化记录预期题数、实际抓取题数、解析题数、入库题数、缺失题号、重复题号、失败原因
    - `Examcoo` 全卷导入已完成真实验证，示例批次 `Task7 导入诊断验证 199337 全卷` 结果为：
      - 预期 `18` 题
      - 抓取 `18` 题
      - 解析 `18` 题
      - 入库 `18` 题
      - 缺失 `0` 题
    - 当前后台服务层与批次详情已可读诊断数据，批次列表摘要展示仍需继续确认最终 UI 渲染口径
  - 图片资产稳定性第一轮已扩展到「题干图 + 选项图」：
    - `examcoo` 题目中的题干图和选项图都会在导入时下载并转存到 Supabase Storage
    - 导入后会同时替换 `content` 与 `options[A/B/C/D]` 里的 markdown 图片 URL，避免正文已转存但选项仍残留外链
    - 当前已为网页导入补充阶段耗时诊断：`网页抓取 / 图片转存 / 章节打标 / 批量入库 / 提交审核 / 总耗时`

对应详细章节：

- [Step 7：先做第一批基础题目](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/practice-question-import-sop.md#step-7先做第一批基础题目)

### Task 8：单独打通 `Past Paper`

子任务：

- 真题卷单独导入
- 严格校验 `isPastPaper + paperId`
- 单独验证真题入口和普通练习池隔离

完成判定：

- 至少 1 套真题卷可以真实支撑 `Past Paper`

当前状态：

- 未开始

对应详细章节：

- [阶段 E：审核与发布](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/practice-question-import-sop.md#阶段-e审核与发布)
- [当前最推荐的执行方式](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/practice-question-import-sop.md#当前最推荐的执行方式)

## 当前进展同步

为了避免 thread 中对进度理解不一致，当前统一认知如下：

- `Task 1`：已完成
- `Task 2`：已完成第一轮
- `Task 3`：已完成第一轮
- `Task 4`：已完成第一轮
- `Task 5`：已完成第一轮
- `Task 6`：已完成
- `Task 7`：进行中
- `Task 8`：未开始

当前主线含义：

- 现在不是回到“怎么导入”
- 也不是进入 `Past Paper`
- 当前主线是进入 `Task 7`：
  - 扩第一批非真题基础题
  - 提升叶子章节覆盖和最小题量
  - 让 `Smart Drill / Chapter Drill / Mock Arena` 从“已打通”进入“稳定可用”

## 目标

- 将一批题目导入 `questions`，并确保后续可被练习中心真实消费。
- 避免“题目导进去了，但章节、真题属性、难度、标签都不准”的情况。
- 让导入后的题目能稳定支撑：
  - `Smart Drill`
  - `Chapter Drill`
  - `Mock Arena`
  - `Past Paper`
  - `Error Wiper`
  - 知识蜂巢 / 薄弱点 / 考试预测

## 当前真实入口

### 1. 文件导入
- 入口：
  - [NewBatchImportModal.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/admin/content/NewBatchImportModal.tsx)
  - [uploadSourceFile](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/storage.ts)
  - [importFromPDF](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/content-pipeline/import-service.ts)
- 流程：
  - 上传 PDF / JPG / PNG / WEBP
  - 写入 `source_files`
  - OCR
  - AI 结构化
  - 质量分数计算
  - 批量写入 `questions`
  - 自动送审到 `REVIEW_PENDING`

### 2. 网页抓取导入
- 入口：
  - [NewBatchImportModal.tsx](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/components/admin/content/NewBatchImportModal.tsx)
  - [importFromWebUrl](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/content-pipeline/import-service.ts)
- 当前已支持：
  - `https://www.examcoo.com/editor/do/view/id/{id}`
- 后续增强方向：
  - 在保留当前入口不变的前提下，把 `importFromWebUrl` 演进为“统一网页导入入口 + 多站点 adapter”
  - 目标不是为每个网站单独造一套导入链路，而是在同一入口下按站点适配不同网页结构
- 流程：
  - 抓取网页、接口返回、题目、答案、解析、题图
  - 保留原始抓取结果与解析结果
  - 写入 `source_files`
  - 批量写入 `questions`
  - 自动送审到 `REVIEW_PENDING`

### 3. 脚本导入
- 参考脚本：
  - [import-fetched-json.mjs](/Users/victorsim/Desktop/Projects/learn_more_v1.0/scripts/examcoo/import-fetched-json.mjs)
- 适合场景：
  - 已经有结构化 JSON
  - 需要小批量、可控地把抓取结果写入数据库

## 推荐导入优先级

建议按下面顺序选导入方式：

1. 已结构化的 JSON / 脚本导入
2. Examcoo 网页抓取导入
3. PDF / 图片 OCR 导入

原因：

- 结构化数据清洗成本最低。
- 网页抓取的结构通常比 OCR 更稳定。
- OCR 最容易引入题干噪音、选项错位、答案错判、图片漏抓。

## 网页抓取导入增强方案

本节用于承接“多来源网页抓取 + AI 清洗补全”的增强方案，属于本 SOP 的一部分，不单独拆新文档。

### 目标边界

- 不追求“一次性做万能爬虫”
- 优先建设“统一抓取内核 + 站点适配器 + AI 清洗补全 + 审核发布”的稳定流水线
- 抓取负责拿到尽量完整、可追溯的原始题目数据
- AI 负责清洗、纠偏、补全和推荐，不直接替代规则校验与审核

### 建议架构

统一采用下面 5 层：

1. 入口层
- 继续复用 [importFromWebUrl](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/content-pipeline/import-service.ts)
- 输入统一为 `pageUrl + subjectId + source + 可选 chapterId + 可选 maxQuestions`

2. 抓取内核层
- 负责页面访问、限速、重试、会话、资源下载、HTML 留档、接口响应留档
- 建议优先使用开源方案组合：
  - `Crawlee` 负责队列、重试、会话和任务编排
  - `Playwright` 负责动态站点、接口拦截、页面渲染和资源抓取
- 如果站点是纯静态 HTML，可降级为轻量抓取，避免浏览器成本

3. 站点适配器层
- 每个站点实现统一责任边界：
  - `detect`：识别是否由当前 adapter 处理
  - `collect`：抓页面和接口原始数据
  - `extract`：提取题目、答案、解析、图片、试卷元数据
  - `normalize`：转成统一题目结构
- 已有 `Examcoo` 抓取逻辑可以作为第一个 adapter 基线，而不是继续在入口里写死站点判断

4. 清洗补全层
- 先规则清洗，再 AI 清洗
- 规则清洗负责：
  - HTML 转文本
  - 选项标准化
  - 答案格式标准化
  - 图片 URL 修复
  - 显性噪音清理
- AI 清洗负责：
  - 题干断句与噪音修正
  - 选项错位修正
  - 解析补全或提纯
  - 难度建议
  - tags 建议
  - 章节候选建议

5. 入库审核层
- 最终仍写入 `source_files -> questions -> content_review_logs`
- 题目先进入 `REVIEW_PENDING`
- 未通过叶子章节、真题隔离、答案合法性校验的题目，不进入发布阶段

### 中间数据要求

网页抓取导入不要只保留最终 `questions`，至少应保留下面 3 类数据：

- 原始抓取结果
  - 原始 HTML
  - 关键接口返回
  - 图片 URL
  - 来源 URL
- 标准化结果
  - 题型
  - 题干
  - 选项
  - 答案
  - 解析
  - 卷信息
- 清洗审计信息
  - 使用的 adapter 名称
  - adapter 版本
  - 清洗规则版本
  - AI 补全是否介入
  - AI 输出置信度或标记

保留这些信息的目的不是“为了看起来完整”，而是为了后续：

- 解析器升级后可重跑
- 问题题目可回溯原始来源
- 低成本复用已抓回的数据，避免重复爬取

## Crawlee + Playwright 详细实施步骤

本节用于把上面的“抓取内核层”落到代码级步骤，避免后续实现时反复改口径。

### 0. 先明确为什么是 `Crawlee + Playwright`

- `Playwright` 负责“像浏览器一样打开页面并拦截 network”
- `Crawlee` 负责“把抓取过程变成可重试、可限速、可排队、可复用 session 的任务系统”
- 这两个库不要混成一个概念

责任划分固定如下：

- `Playwright`
  - 打开 JS 渲染页面
  - 等待页面稳定
  - 读取 DOM
  - 监听接口请求和响应
  - 截图或抓资源链接
- `Crawlee`
  - 管理 request queue
  - 控制重试次数
  - 控制并发和限速
  - 管理 session / cookie / proxy
  - 管理失败回退和结果存储

不要反过来使用：

- 不要把 `Playwright` 当成“任务编排器”
- 不要把 `Crawlee` 当成“网页解析器”

### 1. 安装与基础准备

当前项目尚未安装这两个依赖，因此第一步必须先完成基础环境。

建议安装：

```bash
pnpm add crawlee playwright
pnpm exec playwright install chromium
```

如果后续需要更轻量的抓取能力，也可以补：

```bash
pnpm add cheerio
```

安装完成后，先不要急着改现有导入入口，先把目录结构固定下来。

建议新增目录：

- `src/lib/content-pipeline/web-import/`
- `src/lib/content-pipeline/web-import/core/`
- `src/lib/content-pipeline/web-import/adapters/`
- `src/lib/content-pipeline/web-import/types/`
- `src/lib/content-pipeline/web-import/utils/`

建议职责：

- `core/`
  - 放 `Crawlee` runner
  - 放请求队列、session、重试、限速
- `adapters/`
  - 每个站点一个 adapter
  - 例如 `examcoo.adapter.ts`
- `types/`
  - 放统一抓取结果类型
  - 放 adapter 接口定义
- `utils/`
  - 放 HTML 清洗、链接修复、题块切分、JSON 提取等工具

### 2. 先定义统一 adapter 接口，不要先写站点逻辑

所有站点都必须遵循同一接口，否则第二个站点一接入，入口层就会重新散掉。

建议统一接口包含 4 个主步骤：

1. `detect`
- 输入：`url`
- 输出：当前 adapter 是否支持该 URL
- 责任：只做识别，不做抓取

2. `collect`
- 输入：`url`、抓取配置
- 输出：原始抓取结果
- 责任：
  - 打开页面
  - 抓 HTML
  - 抓接口响应
  - 抓资源链接
  - 抓分页信息

3. `extract`
- 输入：原始抓取结果
- 输出：站点语义下的题目数据
- 责任：
  - 从页面或接口中抽出题目块
  - 抽出答案、解析、题图、试卷信息

4. `normalize`
- 输入：站点语义数据
- 输出：统一题目中间结构
- 责任：
  - 字段对齐
  - 题型映射
  - 答案格式统一
  - 元数据补全

固定原则：

- `detect` 不写业务规则
- `collect` 不猜题型
- `extract` 不写数据库
- `normalize` 不直接发布

### 3. 入口路由怎么接到现有项目

现有入口仍然是：

- [importFromWebUrl](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/content-pipeline/import-service.ts)

这层后续只保留 5 个职责：

1. 权限校验
2. 参数校验
3. 创建 `source_files`
4. 调用统一 web import runner
5. 将标准化结果交给现有 `bulkCreateQuestions`

它不应该再负责：

- 写死某个站点 URL 正则
- 直接解析某个站点 HTML
- 直接处理某个站点的字段差异

建议执行顺序固定为：

1. `importFromWebUrl` 收到 `pageUrl`
2. 调用 `resolveWebImportAdapter(pageUrl)`
3. 拿到 adapter 后，调用统一 runner
4. runner 返回统一题目结构数组
5. 再进入规则清洗、AI 清洗、规则校验、入库、送审

这样做的目的是：

- 新增站点时不改入口主流程
- 入口层继续保持“内容导入 action”的职责

### 4. `Crawlee` runner 的实现步骤

这是最容易写乱的部分，必须固定顺序。

#### Step 4.1：创建统一 runner

建议新增一个统一调用点，例如：

- `src/lib/content-pipeline/web-import/core/run-web-import.ts`

它的输入应包含：

- `pageUrl`
- `subjectId`
- `source`
- `chapterId`
- `maxQuestions`
- `adapter`

它的输出应包含：

- 原始抓取结果
- 标准化题目列表
- 抓取诊断信息
- 成本和时长统计

#### Step 4.2：先决定抓取模式

不是所有站点都必须启动浏览器。

在 runner 里先判断：

1. 是否存在直接接口 JSON
- 如果能直接拿 JSON，优先走轻量模式

2. 是否是服务端渲染静态 HTML
- 如果是，优先走 HTTP + HTML 解析

3. 是否必须执行 JS 才能拿到题目
- 只有这种情况再启用 `PlaywrightCrawler`

固定优先级：

1. JSON
2. 静态 HTML
3. Playwright 动态抓取

这样能直接减少浏览器启动成本和抓取耗时。

#### Step 4.3：配置 `Crawlee` 的通用能力

`Crawlee` 不是可有可无，它至少要承担下面这些稳定性工作：

- `RequestQueue`
  - 防止重复抓同一 URL
  - 支持分页、子页面、资源页递归
- 重试
  - 页面偶发失败时自动重试
- 限速
  - 防止过快触发封禁
- 并发控制
  - 避免一次性开太多浏览器页
- session 管理
  - 管理 cookies
  - 管理登录态
  - 管理被封后的 session 淘汰
- 结果存储
  - 把抓取结果落到本地缓存或中间结果对象

建议默认配置思路：

- `maxConcurrency` 从小值开始
- `maxRequestRetries` 保守设置
- 默认开启 session pool
- 单站点抓取加最小请求间隔

第一版不要追求高并发，先追求稳定和可调试。

### 5. `Playwright` 在抓取里的详细职责

`Playwright` 只在确实需要浏览器时启用。

#### Step 5.1：页面初始化

页面打开后固定做下面这些事：

1. 设置统一 `user-agent`
2. 设置必要的 headers
3. 如果需要登录态，注入 cookies 或 storage state
4. 开始监听 network 请求与响应
5. 进入目标页

#### Step 5.2：等待页面进入“可抓状态”

不要一打开页面就立刻读 DOM。

固定等待策略：

1. 先等关键接口响应完成
2. 再等题目容器出现
3. 再等页面静止一小段时间

不要只依赖固定 sleep。
优先等待：

- 关键 selector
- 关键 network response
- 关键 JSON 数据挂载完成

#### Step 5.3：优先抓 network，而不是优先抓渲染后文本

很多站点页面上的题目其实来自接口返回。

所以 `Playwright` 进入页面后，优先做：

1. 监听 XHR / fetch
2. 记录返回体
3. 判断哪些响应包含题目、答案、解析、卷信息

如果接口里已经有完整结构：

- 直接以接口 JSON 为主
- DOM 只作为补图、补标题、补分页信息

只有在接口拿不到完整结构时，才退回到 DOM 提取。

#### Step 5.4：DOM 提取只做必要信息

DOM 提取主要负责：

- 题干 HTML
- 选项 HTML
- 题图 URL
- 解析区 HTML
- 翻页按钮或下一题入口

不要把整页无差别转文本。
应该先按题块切分，再处理单题。

#### Step 5.5：资源抓取

需要保留这些资源引用：

- 题图 URL
- 解析图 URL
- 试卷封面或附图 URL

第一版优先记录原始 URL，不强制第一时间下载到本地。
只有当站点存在防盗链或链接短期失效时，才补资源下载。

### 6. 每次抓取的详细流水线

这一段是实际执行顺序，必须固定。

#### 阶段 1：识别站点

- 输入一个 `pageUrl`
- 遍历所有 adapter 的 `detect`
- 找到唯一匹配 adapter
- 如果没有匹配，直接报“不支持该站点”

#### 阶段 2：采集原始数据

- 使用 `Crawlee` 创建请求任务
- 根据站点特征选择：
  - JSON 模式
  - HTML 模式
  - Playwright 模式
- 输出：
  - HTML
  - network payload
  - 页面标题
  - 图片 URL
  - 抓取日志

#### 阶段 3：提取题目块

- 根据站点规则从原始数据中拆题
- 每题产出：
  - `rawQuestionId`
  - `rawContent`
  - `rawOptions`
  - `rawAnswer`
  - `rawExplanation`
  - `rawAssets`

#### 阶段 4：标准化

- 将站点字段映射为统一结构
- 统一题型
- 统一答案格式
- 统一图片字段
- 统一卷信息字段

#### 阶段 5：规则清洗

- 清 HTML
- 修空白
- 规范选项 label
- 修答案结构
- 去明显噪音
- 生成基础 `contentHash`

#### 阶段 6：脏题判定

- 给每题打 `needsAiCleanup`
- 只有脏题进入 AI 队列

#### 阶段 7：AI 清洗与补全

- 只处理需要修复的字段
- 输出建议值
- 保留原字段和 AI 字段对照关系

#### 阶段 8：章节与标签候选

- 基于当前科目叶子章节生成候选
- 规则先缩小范围
- AI 再排序或选择

#### 阶段 9：规则校验

- 校验题型
- 校验答案
- 校验主章节
- 校验真题标记
- 校验 `paperId`

#### 阶段 10：入库与送审

- 转换为 `CreateQuestionInput`
- 调用现有 `bulkCreateQuestions`
- 成功后自动送 `REVIEW_PENDING`

### 7. 失败回退策略

这部分如果不写清楚，后续会很容易出现“只要失败就整批报废”的粗暴实现。

建议按层回退：

1. 接口 JSON 抓取失败
- 回退到 DOM / Playwright 抓取

2. Playwright 抓取失败
- 重试当前 request
- 超过重试上限后标记失败并记录原因

3. 某题提取失败
- 不影响整批其他题
- 标记该题为失败项

4. 规则清洗失败
- 该题进入 AI 升级队列或人工待修

5. AI 清洗失败
- 如果规则结果已可入审，则按原规则结果送审
- 如果规则结果不可用，则该题进入失败清单

固定原则：

- 页面失败不等于整批失败
- 某题失败不等于整页失败
- AI 失败不等于导入失败

### 8. 调试与留证要求

为避免后续“我记不清当时为什么这样抓”，每次抓取都建议保留最小诊断集。

至少保留：

- 原始 URL
- 使用的 adapter 名称
- adapter 版本
- 抓取模式
  - JSON / HTML / Playwright
- 页面标题
- 关键 network 响应摘要
- 题目总数
- 成功数 / 失败数
- 失败原因分类

如果某站点结构不稳定，再额外保留：

- 页面截图
- 原始 HTML 快照
- 关键响应样例

### 9. 成本最低的默认抓取策略

如果没有特殊说明，统一默认采用下面的抓取决策：

1. 先判断是否能直接拿 JSON
2. 拿不到 JSON，再尝试静态 HTML 解析
3. 只有确实需要时才开 Playwright
4. Playwright 成功抓到接口后，优先使用接口数据
5. DOM 只补缺失字段，不做主数据源

这是默认规则，不需要每个站点重新讨论。

### 10. 第一版实现顺序

为避免一次铺太大，第一版严格按下面顺序推进：

1. 安装 `crawlee` 和 `playwright`
2. 建 `web-import` 目录和统一类型
3. 把 `Examcoo` 抽成第一个 adapter
4. 让 `importFromWebUrl` 通过 adapter 路由
5. 补统一 runner
6. 补规则清洗和脏题判定
7. 补 AI 小模型清洗
8. 补章节候选与规则校验
9. 跑第一批基础题
10. 再接第二个站点验证抽象是否成立

固定要求：

- 在第二个站点接入前，不要宣称“通用爬虫引擎已经成立”
- 在第一批真实题目通过练习验证前，不要扩大导入规模

## 开发落地步骤（详细说明）

说明：

- 本节保留原来的 `Step 1 - Step 7` 展开说明
- 这些 step 现在是上方 `Task 1 - Task 8` 的详细解释层
- thread 中如果只说“当前做到 Step 6”，默认优先以上方“当前主任务清单”的定义为准

下面是建议的明确开发顺序，按这个顺序做，返工最少。

### Step 1：先把当前单站点导入抽象成 adapter

- 保留现有 `Examcoo` 能力可用
- 将 [examcoo-view-import.ts](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/lib/content-pipeline/examcoo-view-import.ts) 从“单函数抓取器”整理成第一个正式 adapter
- 目标是让入口层不再直接依赖某个站点的细节

完成判定：

- `importFromWebUrl` 能根据 URL 路由到对应 adapter
- Examcoo 行为与当前一致，不回归

### Step 2：补统一题目中间结构

- 定义统一抓取结果结构，至少包含：
  - `sourceUrl`
  - `sourceSite`
  - `paperId`
  - `paperTitle`
  - `rawQuestionId`
  - `content`
  - `options`
  - `answer`
  - `explanation`
  - `assetUrl`
  - `imageUrls`
  - `isPastPaper`
  - `sourceMeta`
- 所有 adapter 输出都先落到这个结构，再进入 `CreateQuestionInput`

完成判定：

- 入口层不再处理站点特有字段
- 后续接第二站点不需要改 `questions` 写入逻辑

### Step 3：补规则清洗层

- 在 AI 之前，先做一轮便宜且稳定的规则清洗
- 重点完成：
  - HTML 清洗
  - 空白和断行规范化
  - 选项标签对齐
  - 答案格式统一
  - 图片地址修正
  - 明显重复文本去除

完成判定：

- 不依赖 AI，也能产出一批结构基本可用的题目
- AI 只处理“难清理的部分”

### Step 4：补 AI 清洗与补全层

- 将 AI 任务拆小，不要一次 prompt 完成全部工作
- 建议拆成 4 类任务：
  - 结构纠偏
  - 解析补全
  - 难度建议
  - tags / 章节候选建议
- AI 输出只作为“建议值”或“待审值”，不是直接真值

完成判定：

- AI 失败时，规则清洗链路仍可继续
- AI 成本可单独关闭或降级

### Step 5：补章节映射与规则校验

- 章节映射必须基于 [subject-chapter-alignment.md](/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex/specs/2026-02-09-release-p0-public-paid/p0-05-sitewide-real-data-closeout/subject-chapter-alignment.md)
- 严格校验：
  - `subjectId` 必填
  - `chapterId` 指向叶子章节
  - `isPastPaper = true` 时必须有 `paperId`
  - 答案格式与题型匹配
  - 真题不得进入普通训练池

完成判定：

- 不合法题目进入待修复或待审，不直接发布

### Step 6：补审核视图与抽样验证

- Step 6-1：审核台信息完整化
  - 审核页面需要能看到：
    - 原始来源
    - 清洗后内容
    - AI 建议字段
    - 章节候选
    - 真题标记
    - 导入时间 / 审核时间
  - 顶部 KPI 必须与当前筛选口径一致，且排除软删除题
- Step 6-2：审核动作可用性验证
  - 验证批量通过 / 驳回 / 发布 / 删除
  - 验证单题操作菜单中的同类动作
  - 验证审核后状态、时间字段、日志写入是否一致
- Step 6-3：练习链路抽样验证
  - 每批导入后按本 SOP 的抽样规则验证 `Smart Drill / Chapter Drill / Past Paper / 知识蜂巢`
  - 小题池场景下，如果“排除最近作答”会导致题池为空，需要允许回退兜底
  - 当前 `Smart Drill / Chapter Drill / Mock Arena` 只应消费前台已支持完整作答的题型；`ESSAY` 等未支持题型不得进入这几个入口的题池
- Step 6-4：异常口径回看
  - 核对“为什么题目看不到”时，至少按以下顺序排查：
    - `status`
    - `deletedAt`
    - `isPastPaper`
    - `chapterId`
    - 最近作答排除
    - 当前练习入口的专属过滤条件

完成判定：

- 不只是“导入成功”，而是“审核台可稳定操作 + 练习链路可真实消费”

### Step 7：先做第一批基础题目

- 第一批建议只选一个科目
- 先导非真题训练题
- 每个叶子章节先保证最小可用题量
- 小批量发布后验证真实消费，再扩大规模
- 真题卷放在第二波，严格单独导入

完成判定：

- 至少一个科目可以真实支撑 `Chapter Drill + Smart Drill + Mock Arena`
- 至少一套真题卷可以真实支撑 `Past Paper`

## 实施过程汇报要求

为避免执行过程中“做了很多事，但对齐颗粒度越来越模糊”，后续实施本 SOP 时，每完成一个步骤都要输出一条固定格式的简明汇报。

### 汇报时机

- 完成 `第一版实现顺序` 中的任一步
- 完成 `开发落地步骤` 中的任一步
- 如果某一步跨度较大，可按子步骤中间汇报一次

### 固定汇报格式

每次汇报必须包含下面 2 部分：

1. 完成了什么
- 用 1 到 3 句话说明本步的实际产出
- 不写空泛表述
- 必须明确落到：
  - 改了什么入口
  - 新增了什么文件或模块
  - 哪条链路已经打通

2. 如何验证
- 必须列出具体验证方式
- 优先写可直接执行的验证动作
- 必须明确验证的是：
  - 代码结构是否到位
  - 行为是否符合预期
  - 是否影响现有链路

### 推荐汇报模板

建议统一使用下面格式：

```md
步骤：Step X / 第一版实现顺序第 X 步

完成了什么：
- ...
- ...

如何验证：
- 执行 ...
- 打开 ...
- 确认 ...
- 预期结果 ...
```

### 验证要求

如果某一步是代码结构类工作，至少验证：

- 目标文件已创建或已接线
- 类型或接口可正常被引用
- 旧链路没有被破坏

如果某一步是抓取链路类工作，至少验证：

- 输入一个真实 URL 能进入正确 adapter
- 抓取模式选择符合预期
- 返回结构符合统一中间格式

如果某一步是导入链路类工作，至少验证：

- `source_files` 正常创建
- `questions` 正常写入或进入失败清单
- 成功项能进入 `REVIEW_PENDING`

如果某一步是规则或 AI 清洗类工作，至少验证：

- 规则清洗前后差异可见
- AI 只处理脏题，不处理全量题
- AI 失败时主链路不会整体中断

### 固定原则

- 不允许只汇报“已完成”
- 不允许只汇报“代码已写”
- 每一步都必须带验证方式
- 验证方式必须尽量短，但要足够具体到可执行

## 低成本与省 Token 策略

本节是正式执行要求，不是可选优化。

### 总原则

- 能用规则解决的，不用 AI
- 能用小模型解决的，不用大模型
- 能做局部补全的，不做整页重写
- 能复用缓存结果的，不重复抓、不重复跑模型

### 1. 抓取阶段先拿结构化源，减少后续 token

- 优先抓接口返回、内嵌 JSON、DOM 中的结构化块
- 少把整页 HTML 直接丢给模型
- 页面如果能解析出题块边界，先在本地切题，再只把单题或小批题交给 AI

推荐顺序：

1. 接口 JSON
2. 页面内嵌结构化数据
3. 规则解析后的题块文本
4. 最后才是整页 OCR 或整页自由文本

### 2. AI 只处理脏题，不处理全部题

- 为每题打一个“是否需要 AI”的标记
- 满足下面条件的题优先走纯规则：
  - 题型明确
  - 选项完整
  - 答案合法
  - 解析不缺失
  - 无明显噪音
- 只有以下情况再调用 AI：
  - 题干乱码或断裂
  - 选项错位
  - 答案无法标准化
  - 解析明显缺失或污染
  - 无法确定章节候选

### 3. 拆小 prompt，优先用便宜模型

- 不要让一个大模型一次完成“抽取 + 清洗 + 分类 + 打标 + 解析补全”
- 建议按任务类型选模型：
  - 规则提取后的小型清洗任务：便宜模型
  - 难度估计、tags 推荐、章节候选排序：便宜模型
  - 只有复杂图文混合题、严重 OCR 错位、解析重建时，才升级到更强模型

推荐执行方式：

- 默认模型：便宜模型做单题或小批量 JSON 修复
- 升级条件：规则失败且便宜模型失败
- 大模型只处理升级队列

### 4. 控制输入长度

- 每次只传“当前题目需要修复的字段”
- 不要把完整页面、完整批次、完整 syllabus 一起塞进 prompt
- 章节推荐时只传当前科目的候选叶子章节，不传全站章节树
- tags 推荐时只传允许使用的标签词表或本章节附近的候选词

### 5. 缓存 AI 结果，避免重复花费

- 对题干标准化后生成稳定 hash
- 相同 hash 的题不重复调用模型
- adapter 版本、规则版本、模型版本未变化时，优先复用旧结果

### 6. 先做“候选推荐”，减少 AI 生成自由度

- 章节不要让模型自由生成全新章节名
- 应先由规则给出 `3-5` 个候选叶子章节，再让模型排序或选择
- tags 同理，优先在受控词表中选，不鼓励自由发散生成

这样有两个好处：

- token 更低
- 命名更稳定，不容易污染标签体系

### 7. 首批题目优先选择低成本科目

- 如果目标是尽快喂活整条链路，首批优先历史、地理这类文本结构更稳定的科目
- 数学、科学图文题可以放到第二批，用来验证复杂清洗

这样做的直接收益：

- 抓取成本更低
- AI 清洗成本更低
- 首轮返工率更低

## 推荐实施策略

如果当前目标是尽快导入第一批基础题目，同时控制模型成本，推荐采用下面这条路线：

1. 先选 1 个科目
2. 先选 1 个来源体系
3. 优先抓结构化网页或现成 JSON
4. 规则清洗后只把脏题送去 AI
5. AI 只输出建议字段，不直接发布
6. 小批量送审并抽样验证真实消费
7. 验证通过后再扩大导入规模

## 导入前置条件

导入前先确认下面 6 项：

1. 科目已存在于 `subjects`
2. 对应章节已完成整理并已写入 `chapters`
3. 章节中可挂题的叶子章节已明确
4. 真题卷来源是否需要进入 `Past Paper` 已明确
5. 本批题目来源备注已准备好
6. 本批题目的最小打标模板已确定

## 最小打标模板

每道题在进入正式题库前，至少应补齐以下字段：

- `subjectId`
- `chapterId`
- `difficulty`
- `type`
- `content`
- `options`
- `answer`
- `explanation`
- `source`
- `tags`
- `isPastPaper`
- `paperId`

对应字段定义见：
- [Question 模型](/Users/victorsim/Desktop/Projects/learn_more_v1.0/prisma/schema.prisma#L320)

## 核心规则

### 1. 每题必须有一个主章节
- `questions.chapter_id` 必须填写
- `chapterId` 必须指向叶子章节
- 不允许直接挂到父章节

### 2. 一题可以有多个 tags
- `tags` 用于补充跨章节、跨知识点信息
- `tags` 不替代 `chapterId`
- 推荐模式：
  - 一个主章节
  - 多个辅助标签

### 3. 真题隔离
- `isPastPaper = true`
  - 只允许进入 `Past Paper`
- `isPastPaper = false`
  - 才允许进入 `Smart Drill / Chapter Drill / Mock Arena`
- 真题题目建议必须同时填写 `paperId`

### 4. Error Wiper 不单独导题
- `Error Wiper` 不是独立题池
- 它来自用户正式做题后的错题聚合
- 不需要单独为 `Error Wiper` 导入题目

## 当前系统已自动完成的部分

### 导入阶段自动完成
- 创建 `source_files`
- 写入导入来源记录
- 文件导入时执行 OCR
- 文件导入时执行 AI 结构化
- 计算 `qualityScore`
- 计算 `contentHash`
- 基于 `contentHash` 去重
- 写入 `questions`
- 成功导入后自动从 `DRAFT` 提交到 `REVIEW_PENDING`

### 当前系统不会自动帮你做好的部分
- 精确章节归属
- 统一标签体系
- 真题与非真题的业务判定
- 真题卷 `paperId` 的规范命名
- 难度校准
- OCR 结构错误修正
- 题干和解析的语义清洗

## 标准执行流程（运营执行 SOP，不等于开发任务编号）

## 阶段 A：准备导入批次

为本批题准备一份导入底稿，至少包含：

- 来源名称
- 科目
- 是否真题
- 真题卷号
- 章节范围
- 预期题量
- 导入方式

建议批次切分方式：

- 一次只导一个科目
- 一次只导一个来源体系
- 真题和非真题分开导
- OCR 导入单批不要过大

## 阶段 B：导入原始题目

### 方案 1：Examcoo 或结构化数据
- 优先选择
- 好处：
  - 结构更稳定
  - 清洗量更小
  - 去重效果更好

### 方案 2：PDF / 图片 OCR
- 适用于只有扫描稿/题册时
- 风险：
  - OCR 文本错位
  - 选项识别错误
  - 数学公式和表格失真
  - 图题关联丢失

## 阶段 C：导入后结构清理

导入成功后，先不要急着批量发布，先做结构清理。

重点清理：

1. 题型清理
- 单选 / 多选 / 判断 / 填空 / 主观题是否识别正确

2. 题干清理
- 去掉 OCR 噪音
- 修复断行
- 修复重复文本
- 修复图片链接残缺

3. 选项清理
- 选项序号是否完整
- A/B/C/D 是否错位
- 多选是否漏项

4. 答案清理
- 单选答案是否为字符串
- 多选答案是否为数组
- 判断题答案格式是否统一

5. 解析清理
- 是否为空
- 是否把答案误写到解析里
- 是否包含明显 OCR 噪音

## 阶段 D：导入后打标

这是最关键的一步。

### 1. 科目打标
- 必须确保 `subjectId` 准确
- 不要依赖后期再批量猜测

### 2. 章节打标
- 每题必须打一个主 `chapterId`
- `chapterId` 必须是叶子章节
- 章节不确定的题目不要直接发布

### 3. tags 打标
- 用于补充跨知识点关联
- 适合标：
  - 技能点
  - 题型特征
  - 方法标签
  - 细分概念

推荐示例：

- 数学：
  - `一元一次方程`
  - `函数图像`
  - `三角函数`
- 科学：
  - `光合作用`
  - `呼吸系统`
  - `电与磁`
- 历史：
  - `鸦片战争`
  - `工业革命`
  - `冷战`

### 4. 真题打标
- 如果属于历年真题：
  - `isPastPaper = true`
  - `paperId` 必填
- 如果不属于真题：
  - `isPastPaper = false`
  - `paperId = null`

### 5. 难度打标
- 当前系统允许 `1-5`
- 导入默认值经常会偏粗
- 建议导后至少做一次人工校准：
  - `1` 基础
  - `2` 简单
  - `3` 中等
  - `4` 困难
  - `5` 极难

## 阶段 E：审核与发布

导入成功后题目会自动进入 `REVIEW_PENDING`。

审核入口逻辑在：
- [review-service.ts](/Users/victorsim/Desktop/Projects/learn_more_v1.0/src/actions/content-pipeline/review-service.ts)

当前状态流转是：

- `DRAFT`
- `REVIEW_PENDING`
- `VERIFIED`
- `PUBLISHED`
- `REVIEW_REJECTED`
- `ARCHIVED`

建议流程：

1. 批量导入后先抽样检查
2. 修题
3. 补打标
4. 再审核通过
5. 发布

不要把未经章节清理和真题隔离确认的题目直接发布。

## 导入后清理检查清单

每一批题导完后，至少检查下面 12 项：

1. 科目是否正确
2. 主章节是否已补齐
3. 主章节是否为叶子章节
4. 是否存在应该为真题却未打 `isPastPaper`
5. 是否存在非真题却误打为真题
6. 真题题目是否都带 `paperId`
7. 题型是否正确
8. 选项结构是否完整
9. 答案格式是否正确
10. 解析是否可用
11. 难度是否明显失真
12. tags 是否遵循统一命名

## 发布前抽样验证

每批至少抽样验证：

- 3 题 `Smart Drill`
- 3 题 `Chapter Drill`
- 1 套 `Past Paper`（如本批是真题）
- 1 个章节的知识蜂巢归属

验证目标：

- 题能否被正确选出
- 章节归属是否正确
- 真题是否只出现在真题入口
- 非真题是否不会混入真题入口

## 当前最推荐的执行方式

在 `T-007.4` 之前，如果要先导一批能真实支撑联调的练习题，建议这样做：

1. 先选一个科目
2. 先导非真题训练题
3. 保证每题有主叶子章节
4. 补一轮 tags
5. 抽样发布一小批
6. 再导真题卷，并严格打 `isPastPaper + paperId`

这样能最快支撑后面的：

- Chapter Drill
- Smart Drill
- Mock Arena
- Past Paper
- 知识蜂巢
- 薄弱点快修

## 当前优先工作包（对主任务的补充拆分，不单独改变主顺序）

为了先打通 `Past Paper` 以外的正式练习入口，当前按下面 4 个工作包推进。

### 工作包 A：导入时增加“是否为真题”开关

目标：

- 批量导入时由运营显式决定本批题目进入真题池还是普通练习池
- 避免普通训练题被误写成 `isPastPaper = true`
- 避免后续 `Smart Drill / Chapter Drill / Mock Arena` 因题池错误而空白

实施要求：

- 文件导入和网页导入都必须带同一套开关
- 勾选“是”时：
  - `isPastPaper = true`
  - `paperId` 按来源规则写入
- 不勾选时：
  - `isPastPaper = false`
  - `paperId = null`
- 同一批次不要混导真题和非真题

验证标准：

- 导入同一来源时，可以分别导出“真题版”和“普通练习版”
- 普通练习版题目能够进入 `Smart Drill`
- 真题版题目只能进入 `Past Paper`

### 工作包 B：题目软删除与“已删除”视图

目标：

- 不做硬删除默认路径
- 允许运营把误导入、误清洗、误发布题目标记为已删除
- 保留审计能力和历史追踪

实施要求：

- 题目表增加软删除字段：
  - `deletedAt`
  - `deletedBy`
  - `deleteReason`
- 审核台顶部 tab 增加：
  - `已删除`
- 批量工具栏增加：
  - `删除`
- 单题右侧操作菜单增加：
  - `删除`
- 所有正式练习查询默认排除软删除题
- 软删除题不进入 `Smart Drill / Chapter Drill / Mock Arena / Past Paper`

验证标准：

- 删除后题目不再出现在默认审核列表
- 删除后题目不再出现在任何正式练习入口
- 切到 `已删除` tab 仍能看到题目、删除时间、删除人

### 工作包 C：临时移除练习入口的难度门槛

目标：

- 当前阶段优先验证“导入 -> 审核 -> 发布 -> 练习消费”主链路
- 暂时不要让 Starter/Standard 套餐难度门槛阻断联调

实施要求：

- 暂时移除或关闭：
  - `Smart Drill`
  - `Mock Arena`
  - 章节/科目题目读取
  中基于订阅套餐的难度裁剪
- 保留代码结构，后续可以恢复
- 变更后仍保留：
  - 真题 / 非真题隔离
  - 状态过滤
  - 科目 / 章节过滤

验证标准：

- 已发布的 3 星普通练习题可以被 `Smart Drill` 读到
- 已发布的 3 星普通练习题在有 `chapterId` 时可以进入 `Chapter Drill / Mock Arena`

### 工作包 D：AI 辅助章节打标

目标：

- 补齐 `chapterId`
- 让普通练习题真正进入章节型入口
- 降低人工逐题打标成本

实施要求：

- AI 不直接在全库章节里自由猜测
- 必须先按 `subjectId` 收窄到该科目的叶子章节集合
- AI 输出形式应为：
  - 候选 `chapterId`
  - 候选章节标题
  - 置信度
  - 依据说明
- 高置信度题可进入待确认队列
- 低置信度题必须人工确认

验证标准：

- 至少 1 个科目能批量补齐叶子 `chapterId`
- 补齐后可真实支撑：
  - `Chapter Drill`
  - `Mock Arena`
  - 知识蜂巢 / 薄弱点快修的章节归属

当前实现口径：

- 先走规则打标，再走 AI 增强，不做全量题目直接丢给大模型
- 规则阶段：
  - 只读取当前 `subjectId` 下的叶子章节
  - 先按章节标题与题干/解析/标签做关键词命中
  - 高分且明显领先的候选可直接写入 `chapterId`
- AI 阶段：
  - 仅在规则未命中时触发
  - 只把 Top 候选叶子章节发给模型排序
  - 默认优先使用便宜模型，小批量处理，避免整批大 prompt
  - 当前实现优先走 Gemini Flash Lite；如未配置 Gemini，再回退到其他已接入模型
- 审核台要求：
  - 批量工具栏增加 `AI补章节`
  - 单题右侧菜单增加 `AI补章节`
  - 已删除题不参与章节补全
- 导入链路要求：
  - 文件导入与网页导入都在入库前自动尝试补章节
  - 已显式传入 `chapterId` 的题目不重复推断

当前环境说明：

- 如果本地或线上已配置 AI Key，则启用“规则 + AI”双层模式
- 如果未配置 AI Key，则退化为“规则优先”模式，不阻断导入主链路
- 对于题干与章节树完全不同词域的题目，规则模式允许保留 `chapterId = null`，进入人工确认队列

## 当前推进顺序（与上方主任务清单对齐）

为了尽快打通非真题正式练习链路，当前按下面顺序实施：

1. 工作包 A：导入时增加“是否为真题”开关
2. 工作包 C：临时移除练习入口难度门槛
3. 工作包 B：题目软删除与“已删除”视图
4. 工作包 D：AI 辅助章节打标

说明：

- `A + C` 完成后，可以先把普通练习题导进 `Smart Drill`
- `B` 完成后，运营可以安全清理误导入题目
- `D` 完成后，`Chapter Drill / Mock Arena` 才能真正稳定打通
- `/admin/content/import` 仅在存在处理中批次时轮询刷新；空闲状态不再固定 5 秒刷新页面

## 当前风险提醒

现阶段最容易造成返工的是这 4 类问题：

1. 章节打标缺失
- 导入后题目虽然存在，但无法进入正确章节练习

2. 真题隔离不严格
- 真题混进普通训练池，会污染入口规则

3. tags 命名失控
- 后面即使想做弱点分析，也无法可靠复用

4. 大批量 OCR 后不清洗直接发布
- 会直接污染正式用户体验和后续统计

## 当前题型支持矩阵

本节用于明确“系统里有哪些题型”“哪些能稳定采集”“哪些能稳定展示/消费”，避免后续误把“数据模型支持”当成“正式练习可完整使用”。

当前数据模型支持 6 类题型：

1. `SINGLE_CHOICE`
2. `MULTIPLE_CHOICE`
3. `FILL_BLANK`
4. `ESSAY`
5. `TRUE_FALSE`
6. `MCQ`（legacy）

当前口径如下：

- `SINGLE_CHOICE`
  - 数据模型：支持
  - 网页抓取：稳定
  - OCR / AI 结构化：支持
  - 审核页展示：支持
  - 练习入口消费：支持
- `MULTIPLE_CHOICE`
  - 数据模型：支持
  - 网页抓取：稳定
  - OCR / AI 结构化：支持
  - 审核页展示：支持
  - 练习入口消费：支持
- `FILL_BLANK`
  - 数据模型：支持
  - 网页抓取：支持
  - OCR / AI 结构化：支持
  - 审核页展示：支持
  - 练习入口消费：支持
- `ESSAY`
  - 数据模型：支持
  - 网页抓取：支持
  - OCR / AI 结构化：支持
  - 审核页展示：支持
  - 练习入口消费：当前不作为 `Smart Drill / Chapter Drill / Mock Arena` 的正式题池
- `TRUE_FALSE`
  - 数据模型：支持
  - 网页抓取：当前 `Examcoo` 支持
  - OCR / AI 结构化：当前不是最稳定主路径，需要额外规范化
  - 审核页展示：支持
  - 练习入口消费：支持
- `MCQ`
  - 数据模型：支持
  - 网页抓取：不作为当前主导入类型
  - OCR / AI 结构化：不作为当前主导入类型
  - 审核页展示：支持
  - 练习入口消费：作为 legacy 兼容类型支持

当前正式练习入口的题型消费口径：

- `Smart Drill / Chapter Drill / Mock Arena` 当前只消费前台已支持完整作答的题型：
  - `SINGLE_CHOICE`
  - `MULTIPLE_CHOICE`
  - `FILL_BLANK`
  - `TRUE_FALSE`
  - `MCQ`
- `ESSAY` 当前可以导入、审核、发布，但不应进入上面这 3 个入口

## 当前图片处理口径

本节用于明确“含图题”当前是如何抓、如何存、哪里还不稳定。

当前网页抓取导入的图片处理方式：

- 以 `Examcoo` 为例，当前抓取器会从题干 HTML 的 `<img>` 标签中提取图片 URL
- 会把相对路径规范化成绝对 URL
- 导入后写入题目字段：
  - `assetUrl`
  - `imageUrls`

当前保存位置：

- 当前默认是“保存远端图片引用”
- 也就是把图片 URL 存到 `questions.assetUrl / questions.imageUrls`
- 目前没有把这些网页图片统一下载、转存到我们自己的对象存储

这意味着：

- 当前含图题“能保留图片链接”
- 但图片可用性仍依赖上游站点资源是否继续可访问

当前稳定度判断：

- 稳定：
  - HTML 里直接 `<img src>` 或 Examcoo 的 `_djrealurl` 图片
- 相对不稳定：
  - CSS 背景图
  - JS 动态拼出来的图片
  - 题图不在题干 HTML 内、而是在额外资源层里的站点
  - 极复杂版式或多图组合题

当前执行口径：

- 含图题可以导入
- 但每批导入后要抽样检查图片是否仍可打开
- 在把图片转存到我们自己的存储之前，不把“网页含图题完全稳定”当成既成事实

## 衍生分析入口当前口径

本节用于同步 `知识蜂巢 / 考试预测 / 薄弱点快修 / Error Wiper` 的当前实现边界，避免误以为这些已经是最终版。

### 1. 知识蜂巢

当前逻辑：

- 基于用户在某科目叶子章节上的历史 `user_attempts`
- 统计每个叶子章节的：
  - 正确率
  - 作答次数
  - 掌握度
  - 状态（strong / fair / weak / locked）
- 只统计数据保留期内的 attempts

当前判断：

- 结构上可用
- 但它依赖：
  - 题目先有正确的叶子 `chapterId`
  - 用户已经在这些章节上产生足够 attempts
- 所以它当前不是“不完整不能跑”，而是“强依赖前置数据质量和题量”

### 2. 考试预测

当前逻辑：

- 基于近 30 天答题记录、课程完成度、连续活跃天数
- 当前算法是启发式加权：
  - 正确率 60%
  - 完成度 30%
  - streak 加成 10 分上限
- 最终读取窗口是：
  - 近 30 天
  - 再与当前用户套餐允许的数据保留期取交集

当前判断：

- 可以运行
- 但当前更像“轻量预测卡片”，不是高精度预测模型
- 后续如果要增强可信度，需要更多真实样本与更稳定的题池覆盖

### 3. 薄弱点快修

当前逻辑：

- 基于章节统计
- 筛选条件：
  - `totalAttempts >= 5`
  - `masteryLevel < 70`
- 点击后直接跳对应 `Chapter Drill`

当前判断：

- 结构上可用
- 但依赖：
  - 章节打标正确
  - 章节题池足够
  - 用户在该章节已有足够 attempts

### 4. Error Wiper

当前逻辑：

- 不是独立题池
- 是基于用户历史错题 attempts 聚合出来的修复视图
- 主要筛选：
  - 最近仍然做错
  - 或整体正确率偏低
- 当前会按题目维度聚合历史 attempts，再优先取整体正确率最低的一批

当前判断：

- 在这几个衍生入口里，`Error Wiper` 的定义目前最清晰
- 但它同样依赖历史 attempts 量，而不是依赖“新导入多少题”

整体结论：

- 这 4 个入口目前都不是“完全空壳”
- 但严格来说，真正决定它们质量的前提还是：
  - `chapterId`
  - 非真题题池规模
  - 用户真实作答量

补充口径：

- 练习中心右侧分析面板现在不应再用 preview 样例数据伪装“已有分析结果”
- 当真实数据不足时，应该直接显示真实空态或低置信度状态
- 否则会让“逻辑完整度”判断失真，也会误导后续验收

## 后台刷新与操作日志当前口径

### 1. 批量导入页右上角“刷新”

当前状态：

- 可用
- 手动点击会触发 `router.refresh()`
- 页面存在处理中批次时，也会自动轮询刷新
- 空闲状态下不再固定 5 秒刷新

### 2. 批量导入页右上角“操作日志”

当前状态：

- 已接真实数据
- 当前基于 `source_files` 的真实批次记录生成日志
- 已支持：
  - 显示真实操作人
  - 显示创建 / 完成 / 失败等真实任务事件
  - 抽屉内本地搜索
  - 明确空态与日志数量提示
- 当前限制包括：
  - 仍然不是独立 audit log 总表
  - 目前主要覆盖“导入任务生命周期事件”，不是所有后台点击行为

结论：

- 现在它已经是“真实任务事件侧边栏”
- 适合用于导入批次排查和近期回看
- 但还不能等同于全后台统一审计日志中心

### 3. 内容审核页右上角

当前状态：

- 已补齐与批量导入页同级别的“刷新 / 操作日志”入口
- 当前基于 `content_review_logs` 真实读取审核活动
- 已支持：
  - 手动刷新
  - 显示真实审核人
  - 显示提交审核 / 审核通过 / 驳回 / 发布 / 归档等动作
  - 抽屉内本地搜索

结论：

- 内容审核页右上角现在已不是缺失项
- 但它同样仍属于“真实业务日志侧边栏”，不是全后台统一审计中心

## 当前新增待处理补充项

下面这些项已经正式纳入当前主任务，不再是散点需求：

1. 练习模式退出时保留科目上下文
- 归属：`Task 6`

2. 题型支持矩阵与练习入口消费边界
- 归属：`Task 3 + Task 6`

3. 含图题的抓取、存储与稳定性收口
- 归属：`Task 3`

4. 知识蜂巢 / 考试预测 / 薄弱点快修 / Error Wiper 的完整性复核
- 归属：`Task 6`

5. 右侧分析面板移除 preview 假数据回退，改为真实空态
- 归属：`Task 6`

6. 考试预测卡片暗色模式对比度修复
- 归属：`Task 6`

7. 批量导入 / 内容审核右上角“刷新 / 操作日志”完整度补齐
- 归属：`Task 5`

## 结论

导题不是“写入数据库”这么简单，真正的可用前提是：

- 有来源记录
- 有主叶子章节
- 有真题隔离
- 有标签补充
- 有导后审核

只有这几步一起完成，导入的题目才是后续 `T-007.4`、Dashboard 联调、知识蜂巢、薄弱点快修可以依赖的真实题源。
