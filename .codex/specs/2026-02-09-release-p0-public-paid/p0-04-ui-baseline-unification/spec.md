id: SPEC-20260209-P0-04
title: P0-04 UI 基线统一
status: active
owner: codex
related_story:
created_at: 2026-02-09
updated_at: 2026-02-09

# 背景
- P0 发布链路中的子任务，需可独立验收与回滚。

# 目标（Goals）
- 统一设计 token 与基础组件状态，建立空态模板。
- 先完成练习中心产品线重设计，再将其提炼为全局 UI 基线。
- 建立练习中心统一视觉合同：专业训练舱、磨砂舱体、单主色 + 状态色。

# 非目标（Non-Goals）
- 不扩展到 P1 范围。

# 约束（Constraints）
- 必须遵循 .codex/workflows/new-task-sop.md。

# 范围（In Scope）
- 当前子任务的方案、实施、验收、收尾。

# 范围外（Out of Scope）
- 其他 P0 子任务的实现细节。

# 风险（Risks）
- 风险：实现跨度过大。
  - 影响：延期与返工。
  - 缓解策略：拆分为可日清的小任务并先过验收。

# 依赖（Dependencies）
- release 总计划与共享基础能力可用。

# 开发内容（必须先确认）

## 开发主线
1. 先完成练习中心重设计：主页面、五种模式、右侧教练板。
2. 再冻结全局 UI 基线：token、按钮、卡片、输入框、空态模板。
3. 最后统一 dashboard 与移动端导航视觉与路径。
4. 保证 UI 调整不破坏数据读取链路。

## 开发单元拆分
| 单元 | 组件 | 目标 |
|---|---|---|
| 练习中心命名合同 | practice/* | 统一命名语义与目录层级 |
| 练习中心视觉方向 | `/dashboard/practice` 及子页面 | 建立专业训练舱产品气质 |
| 练习中心主页面 IA | `/dashboard/practice` | 建立训练指挥台结构与主次层级 |
| 练习中心模式细化 | Smart Drill / Error Wiper / Mock Arena / Chapter Progress / Past Paper / Coach Panel | 统一交互骨架与视觉语言 |
| 全局 token | globals.css/tailwind | 颜色/间距/圆角/阴影统一 |
| 基础控件 | button/card/input/textarea | 状态一致（默认/hover/disabled） |
| 空态模板 | dashboard 视图 | 无数据时有统一提示和 CTA |
| 移动导航 | BottomTabBar | 路由前缀一致 |

## 任务边界
- 不做全站视觉重设计。
- 不修改现有练习中心 URL slug。
- 不在本任务中扩展业务功能或新增后端契约。
- 实现阶段采用“单任务单问题”原则，练习中心与全局基线分别拆细后逐项落地。

## 练习中心视觉基调（已冻结）
- 视觉定位：专业训练舱
- 材质定位：磨砂舱体，不走玻璃炫光路线
- 颜色策略：单主色 + 状态色
- 主强调色：冷钴蓝
- 风格边界：克制、高密度、低 AI 味、强训练感、可长期使用
- 明确禁止：泛紫 AI SaaS 渐变、过强 neon 发光、卡通化装饰、模式之间风格割裂

## 练习中心主页面结构（已冻结）
- 页面角色：训练指挥台，而不是功能目录页。
- 首屏必须回答：
  1. 当前最弱哪里
  2. 今天该练什么
  3. 从哪里最快开始
- 桌面端采用主副栏结构：主栏训练内容 + 右侧教练板。
- 移动端采用纵向任务流，先推荐动作，后展开完整分析。
- 页面主顺序：
  - 顶部训练摘要
  - `PracticeSubjectBar`
  - `PracticeModeGrid`
  - `ChapterProgressSection`
  - `PastPaperLibrarySection`
  - `PracticeCoachPanel`

## 五种模式与教练板设计结论（已冻结）
- Smart Drill
  - 定位：今日最优训练入口
  - 结构：启动态摘要 -> 训练 HUD -> 单题聚焦作答 -> 结果总结
  - 重点：解释“为什么推荐你练这组题”
- Error Wiper
  - 定位：错因修复实验室
  - 结构：修复进度 -> 当前错题卡 -> 待修复预告 -> 结束复盘
  - 重点：修复感与复盘感，不走 neon 游戏皮肤
- Mock Arena
  - 定位：模拟考试桌面
  - 结构：考试配置台 -> 固定考试状态栏 -> 题目区 + 导航器 -> 交卷确认 -> 正式成绩摘要
  - 重点：最克制、最严肃
- Chapter Progress
  - 定位：章节训练推进板
  - 结构：主页面推进板 -> 单章节专注训练页
  - 重点：推进与专注，不做伪地图视觉
- Past Paper Library
  - 定位：试卷档案库
  - 结构：精选卷库区 -> 试卷详情 / 作答页
  - 重点：正式、可信、资料库感
- PracticeCoachPanel
  - 固定三块：知识结构、考试预测、薄弱点
  - 原则：辅助决策，不抢主栏训练主路径

## 练习中心共用设计合同（已冻结）
- 页面标题、区块标题、指标标题采用统一层级
- 主 CTA / 次 CTA / 危险 CTA 采用统一语义
- 空态、加载态、错误态必须有下一步动作
- 进度条采用统一线性表达
- 五种模式共享同一套设计语言，不允许单独长成另一套系统

## 全局 UI 基线（已冻结）
- Token
  - 全局采用语义 token：`canvas / shell / surface-1 / surface-2 / surface-3 / primary / success / warning / danger / muted`
  - 主色统一为冷钴蓝，供 dashboard、practice、leaderboard、community 共用
  - 统一 focus ring、边框层级、圆角尺度与阴影强度
- 基础控件
  - `button / card / input / textarea` 收敛为统一交互规则
  - `glow` 不作为应用主路径基础按钮风格
  - 输入类控件统一使用内嵌面板语义，不再各页手写皮肤
- 公共空态与 CTA
  - Dashboard / Leaderboard / Community 共用同一空态结构
  - 空态必须同时回答：为什么为空、下一步做什么
  - 每个空态最多 1 主 CTA + 1 次 CTA
- 壳层与导航
  - `BottomTabBar` 与 `dashboard-layout` 必须共用路由映射与激活态规则
  - 桌面侧边栏与移动底栏共享同一套视觉语言
  - 不允许长期保留明显假数据作为壳层基础元素

## 交付判定（DoD）
- UI 基线一致且核心页面无功能回归。
- 文档中能直接看到 `T-004.x / T-005.x` 的详细拆分与执行说明。
