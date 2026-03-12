# 练习中心改版方案

更新时间：2026-03-11

参考输入：
- 当前 UI 截图：`/Users/victorsim/Desktop/Screenshot 2026-03-11 at 11.36.09 AM.png`
- Gemini 分析产物：`/Users/victorsim/Desktop/Projects/learn_more_v1.0/.codex-artifacts/ui-analysis/Screenshot-2026-03-11-at-11.36.09-AM.analysis.json`

相关现有实现：
- 练习中心首页：`src/components/practice/PracticeView/index.tsx`
- 模式卡：`src/components/practice/PracticeView/TrainingModeCards.tsx`
- 侧栏分析区：`src/components/practice/PracticeView/AnalyticsSidebar/index.tsx`
- Smart Drill 页面：`src/components/practice/modes/SmartDrillMode.tsx`
- 通用做题会话：`src/components/practice/session/QuizSession.tsx`

## 1. 改版目标

本次改版不先碰算法，先把前端信息架构理顺，让用户一进入练习中心就能回答 3 个问题：

1. 我现在最应该做哪种练习。
2. 每种练习分别解决什么问题。
3. 做完以后我会得到什么反馈。

核心原则：
- 先引导开始练习，再展示分析结果。
- 5 种练习模式必须处于同一层级。
- `Smart Drill` 不是普通入口，而是默认主路径。
- 空状态必须转化成行动引导，而不是静态提示。

## 2. 当前问题总结

### 2.1 首页层面

- 当前视觉上只有 `Smart Drill / Error Wiper / Mock Arena` 是主模式，`Chapter Map / Past Year Papers` 更像附属内容区，和产品定义的 5 种练习模式不一致。
- 首页右侧 `Knowledge Hive / Exam Forecast / Weakness Quick Fix` 在空状态下信息价值低，但视觉重量高，和练习入口抢焦点。
- 首屏同时呈现“模式选择”和“数据看板”，用户进入页面后缺少明确默认路径。
- 空状态文案普遍偏被动，例如“暂无章节数据”“Start practicing to see your forecast”，没有把用户引导到具体下一步。

### 2.2 Smart Drill 层面

- 入口卡只有一句泛描述，没有说明“为什么推荐给当前用户”。
- 开始页已有基础包装，但仍偏静态，尚未把推荐理由、训练目标、题组结构讲清楚。
- 做题态沿用通用 `QuizSession`，更像普通 quiz，缺少“智能调度中”的感知。
- 结果页只有分数、对错数和一句建议，还没有把 `Knowledge Hive / Exam Forecast / 弱点分析` 作为 Smart Drill 的核心收益显式呈现。

## 3. 首页重画方案

## 3.1 新信息架构

练习中心首页建议改成 4 个连续区块：

1. 顶部任务区
2. 练习模式区
3. 推荐补强区
4. 分析回顾区

对应的用户路径：

1. 先选科目
2. 直接看到“当前最值得开始的练习”
3. 浏览其他 4 种模式
4. 在页面下半部查看章节、真题与分析

## 3.2 首页布局草图

```text
+--------------------------------------------------------------+
| Practice Center                                              |
| 今日建议：先做 1 轮 Smart Drill，预计 10 分钟                |
| [科目 Chips]                                                 |
+--------------------------------------------------------------+
| Smart Drill Hero                                             |
| 推荐原因 | 本轮题组结构 | 预计用时 | 开始按钮                |
+-----------------------------+--------------------------------+
| Error Wiper                 | Mock Arena                     |
+-----------------------------+--------------------------------+
| Chapter Map                 | Past Year Paper                |
+--------------------------------------------------------------+
| Quick Recovery Strip                                        |
| 继续上次训练 | 最近错题 12 道 | 最弱章节 2 个                |
+--------------------------------------------------------------+
| Analytics Snapshot                                          |
| Knowledge Hive | Exam Forecast | Weakness                    |
+--------------------------------------------------------------+
```

## 3.3 具体设计决策

### A. 顶部任务区

目标：给默认路径，不让用户自己猜。

建议内容：
- 页面标题改成中文主标题 + 英文副标识，例如“练习中心 / Practice Center”
- 在标题下增加一句动态引导：
  - `今天建议先做 1 轮 Smart Drill，优先修复函数和几何。`
- 保留科目切换条，但让它更像上下文筛选器，而不是唯一显著交互。

### B. 练习模式区

5 种模式统一纳入一个模式矩阵，但分成两个层级：

- 一级主模式：`Smart Drill`
- 二级模式：`Error Wiper / Mock Arena / Chapter Map / Past Year Paper`

其中：
- `Smart Drill` 使用 Hero 卡，不再只是普通卡片。
- 其他 4 个模式使用统一规格卡片。

每个模式卡都统一展示 4 个字段：
- 模式名
- 一句话价值
- 适用场景
- 当前状态数据

示例：

`Error Wiper`
- 价值：重新清理最近错题
- 适用：适合做完 Smart Drill 后补弱点
- 状态：`12 道待修复`

`Mock Arena`
- 价值：完整限时模拟
- 适用：适合考前演练
- 状态：`2 套可开始`

`Chapter Map`
- 价值：按章节系统刷题
- 适用：适合补基础与查漏
- 状态：`3 个章节待巩固`

`Past Year Paper`
- 价值：历年真题实战
- 适用：适合熟悉真题节奏
- 状态：`2023-2025 已解锁`

### C. 推荐补强区

这是首页新增区块，用来承接用户“不是立刻开始 Smart Drill”的情况。

建议展示：
- 继续上次练习
- 最近错题数量
- 当前最弱章节
- 最近一次预测波动

这个区块应该是短条形模块，而不是再做一套大卡，避免和模式区重复竞争。

### D. 分析回顾区

`Knowledge Hive / Exam Forecast / Weakness` 保留，但下移到页面后半段。

理由：
- 它们是练习结果的解释层，不应该压在入口层之前。
- 当前实现中这些组件空状态占比高，放首屏只会放大“空”的感受。

这里建议变成 `Analytics Snapshot` 区，标题下加一句：
- `完成一轮练习后，这里会更新你的掌握结构与预测走势。`

## 3.4 首页组件映射建议

现有文件可以这样演进：

- `src/components/practice/PracticeView/TrainingModeCards.tsx`
  - 从 3 卡改成 1 个 Hero + 4 个标准卡
- `src/components/practice/PracticeView/ChapterMap/index.tsx`
  - 从独立大区块改成 5 模式之一的入口卡或展开区
- `src/components/practice/PracticeView/PastPapersSection.tsx`
  - 从列表区改成模式卡入口，点击后再进入真题库页
- `src/components/practice/PracticeView/AnalyticsSidebar/index.tsx`
  - 取消右侧粘性侧栏，改成页面下半部分析快照区

## 4. Smart Drill 全链路方案

Smart Drill 建议拆成 4 个页面状态：

1. 入口卡态
2. 开始前 Briefing 态
3. 做题态
4. 结果页

## 4.1 入口卡态

位置：练习中心首页首屏 Hero。

它要回答：
- 为什么是现在
- 为什么是这组题
- 做完有什么收益

建议信息结构：

```text
Smart Drill
你的智能训练引擎

推荐理由：
- 最近函数题正确率下降
- 几何章节有连续错题
- 距离上次模拟已有 4 天

本轮结构：
- 6 道弱点修复
- 3 道易错变式
- 1 道冲刺题

预计：
- 10 分钟
- 3 个章节
- 做完后更新 Forecast 与 Hive

[开始本轮训练] [换一组推荐]
```

## 4.2 开始前 Briefing 态

对应当前 `SmartDrillMode.tsx` 中的 setup 页，但需要从“介绍页”升级为“任务确认页”。

建议结构：

### 顶部任务卡
- 本轮目标：`补弱点 / 稳正确率 / 考前热身`
- 预计用时：8-12 分钟
- 推荐节奏：一轮做完再决定是否加练

### 中部三栏信息
- 为什么推荐这组题
- 题组覆盖范围
- 做完后会刷新哪些分析结果

### 底部操作
- 主按钮：`开始 Smart Drill`
- 次按钮：`换一组`
- 文本按钮：`改做其他模式`

与当前相比，要补的不是更多装饰，而是更强的“推荐解释”。

## 4.3 做题态

当前 `QuizSession` 已有进度、判题、结果提交能力，可以继续沿用，但 UI 语义要从“通用做题”改成“智能训练过程”。

建议增加 3 个感知层：

### A. 顶部状态条

除题号和准确率外，再增加：
- 当前训练目标：例如 `正在修复：函数基础`
- 当前阶段：例如 `第 1 阶段 / 弱点收口`

### B. 节点反馈

不是每题都大反馈，而是在题组切段时给一句短提示：
- `函数稳定性回升，接下来切到应用题。`
- `基础题已完成，开始进入变式训练。`

### C. 退出策略

退出按钮不应只是“退出本轮训练”，建议给清楚后果提示：
- 未完成时：`退出后本轮不会进入完整分析`

## 4.4 结果页

结果页是 Smart Drill 的价值兑现区，不能只显示分数。

建议分成 4 块：

### A. 本轮总览
- 得分
- 正确 / 错误题数
- 是否已保存
- 用时

### B. 本轮收获
- 修复了哪些章节
- 哪些薄弱点仍未稳定
- 哪类题型表现下滑

### C. 分析变化
- `Knowledge Hive`：新增 1 个 strong，2 个 weak 变 fair
- `Exam Forecast`：推测从 B 提升到 A-
- `Weakness`：仍需补“二次函数应用”

### D. 下一步动作

建议 3 个明确动作按钮：
- `再来一轮 Smart Drill`
- `转到 Error Wiper`
- `进入 Mock Arena`

结果页的推荐逻辑可沿用现有成绩分段，但呈现要更像“训练教练建议”，而不是一句通用文案。

## 5. 与现有实现的落地建议

## 5.1 第一阶段：只改信息架构，不改算法

目标：最快让首页和 Smart Drill 看起来像一个完整产品。

建议范围：
- 首页改成 5 模式统一入口
- 下移分析区
- 强化 Smart Drill Hero
- 强化空状态 CTA
- Smart Drill setup 页补“推荐理由”
- Smart Drill result 页补“下一步推荐”

这一步基本可以复用现有接口：
- `bootstrap`
- `subject-data`
- `getSmartDrillQuestions`

## 5.2 第二阶段：补充 Smart Drill 个性化字段

如需进一步做出“真的智能”的感觉，建议补以下前端展示字段：
- 推荐原因数组
- 本轮题组结构
- 覆盖章节列表
- 上次训练时间
- 预计收益文案

这些字段即便后端暂时没有，也可以先由前端根据已有数据推导出基础版本。

## 5.3 第三阶段：让分析结果和 Smart Drill 串起来

首页和结果页要共享一套“训练影响”文案逻辑，避免出现：
- 首页说智能推荐
- 结果页却只给基础分数

推荐串联方式：
- 首页 Hero 说明“做完会更新哪些分析”
- 结果页实际展示“更新了什么”
- 回到首页后在分析区继续看到变化结果

## 6. 建议的实施顺序

1. 重做练习中心首页布局与模式分层
2. 把 5 个模式统一成同一组入口卡
3. 把 Smart Drill 卡升级为 Hero
4. 改 Smart Drill setup 页为 briefing 态
5. 改 Smart Drill 结果页为“总览 + 分析变化 + 下一步”
6. 最后再决定是否扩展 Smart Drill 会话中的阶段反馈

## 7. 一句话结论

练习中心首页应该从“模式卡 + 数据面板并列”改成“Smart Drill 主路径 + 5 模式体系 + 分析回顾下沉”。

Smart Drill 则应该从“推荐题入口”升级成“智能训练引擎”，负责告诉用户：
- 为什么练
- 这一轮练什么
- 做完会得到什么
- 下一步该去哪
