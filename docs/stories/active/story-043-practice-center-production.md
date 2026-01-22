# Story-043: 练习中心生产级完善（种子用户就绪版）

**阶段**: Phase 5: Production Ready
**目标**: 将练习中心从原型升级为完整、可交付的产品模块，开放给种子用户使用
**预估时间**: 48-60 Hours
**Story Points**: 34
**前置依赖**: Story-029 (基础练习逻辑), Story-010 (智能解析器)
**负责人**: _待分配_

---

## 📋 1. Executive Summary (概要)

### 当前状态
- ✅ **已完成**: AI图片解析器、基础Quiz引擎、错题本基础逻辑
- ⚠️ **问题**: 数据未打通、Mock数据充斥、缺少核心练习模式、无权限控制

### 目标状态
- ✅ **完整的3种练习模式**: Smart Drill（智能刷题）、Error Wiper（错题消消乐）、Mock Arena（模拟考场）
- ✅ **真实数据驱动**: 连接Prisma数据库，移除所有Mock数据
- ✅ **权限与配额**: 根据用户角色限制答题数、考试次数
- ✅ **数据可视化**: Knowledge Hive（知识蜂巢）、Exam Forecast（考分预测）、Weakness Analysis（薄弱点分析）
- ✅ **完整测试覆盖**: 单元测试、集成测试、E2E测试

---

## 🏗️ 2. System Architecture (系统架构)

### 2.1 当前架构问题诊断

```
❌ 问题1: 数据层混乱
- QuestionBankView.tsx 使用 Mock 数据 (subjectsData, quizQuestions)
- 缺少统一的 Data Service 层

❌ 问题2: 业务逻辑分散
- 判分逻辑在 src/actions/quiz.ts
- 推荐算法缺失
- 无统一的"练习会话"管理

❌ 问题3: 组件职责不清
- QuestionBankView 既管理路由又渲染UI (500+行)
- 缺少可复用的 QuestionCard / QuizSession 组件
```

### 2.2 新架构设计（推荐）

```
📁 src/
├── 📁 actions/practice/
│   ├── question.ts           # ✅ 已有：题目CRUD
│   ├── parser.ts              # ✅ 已有：AI解析
│   ├── session.ts             # 🆕 会话管理（开始练习、提交答案、结束会话）
│   ├── recommendation.ts      # 🆕 智能推荐算法
│   ├── statistics.ts          # 🆕 统计分析（掌握度计算、薄弱点分析）
│   └── quota.ts               # 🆕 配额检查（每日答题限制、考试次数限制）
│
├── 📁 components/practice/
│   ├── 📁 modes/              # 🆕 三大练习模式
│   │   ├── SmartDrillMode.tsx
│   │   ├── ErrorWiperMode.tsx
│   │   └── MockArenaMode.tsx
│   ├── 📁 session/            # 🆕 答题会话组件
│   │   ├── QuizSession.tsx    # 答题主界面
│   │   ├── QuestionCard.tsx   # 单题卡片
│   │   ├── AnswerOptions.tsx  # 选项组件
│   │   ├── CountdownTimer.tsx # 倒计时
│   │   └── ResultSummary.tsx  # 成绩总结
│   ├── 📁 analytics/          # 🆕 数据可视化
│   │   ├── KnowledgeHive.tsx  # 知识蜂巢
│   │   ├── ExamForecast.tsx   # 考分预测
│   │   ├── ChapterMastery.tsx # 章节掌握度
│   │   └── WeaknessCard.tsx   # 薄弱点卡片
│   └── 📁 smart-parser/       # ✅ 已有
│       └── ...
│
├── 📁 lib/practice/
│   ├── algorithms.ts          # 🆕 推荐算法、预测算法
│   ├── grading.ts             # 🆕 判分引擎（从quiz.ts迁移）
│   ├── mastery.ts             # 🆕 掌握度计算逻辑
│   └── types.ts               # 🆕 TypeScript类型定义
│
└── 📁 app/(dashboard)/dashboard/practice/
    ├── page.tsx               # ✅ 已有：练习中心首页
    ├── layout.tsx             # 🆕 练习中心布局
    ├── smart-drill/           # 🆕 智能刷题页面
    │   └── page.tsx
    ├── error-wiper/           # 🆕 错题消消乐页面
    │   └── page.tsx
    ├── mock-arena/            # 🆕 模拟考场页面
    │   ├── page.tsx           # 选择试卷
    │   └── [examId]/page.tsx  # 考试进行中
    ├── import/                # ✅ 已有：AI导入
    │   └── page.tsx
    └── analytics/             # 🆕 数据分析页面
        └── page.tsx
```

### 2.3 数据流设计

```
用户操作 → 前端组件 → Server Action → 业务逻辑层 → Prisma → PostgreSQL
                    ↓
              实时更新UI (Optimistic Update)
                    ↓
              最终一致性校验
```

**关键设计决策**:
1. **会话管理**: 使用`ExamRecord`作为"练习会话"的载体（即使不是正式考试）
2. **原子性**: 每次提交答案都是独立事务（`UserAttempt` + `ErrorBook` 更新）
3. **缓存策略**: 章节掌握度等计算结果缓存到`Chapter`表的扩展字段（待添加）

---

## 🎯 3. Feature Breakdown (功能拆解)

### 模块A: 数据层重构与真实数据打通 (P0)

#### A1: 数据库Schema扩展
**目标**: 支持练习会话管理和统计分析

```prisma
// 扩展 Chapter 表（用于缓存掌握度）
model Chapter {
  // ... 现有字段

  // 🆕 新增字段
  totalQuestions  Int @default(0) @map("total_questions")  // 该章节题目总数
  avgDifficulty   Float? @map("avg_difficulty")            // 平均难度

  // 🆕 预计算字段（定期更新）
  cachedMastery   Json? @map("cached_mastery")             // { userId: masteryLevel }
  lastCacheUpdate DateTime? @map("last_cache_update")
}

// 扩展 ExamRecord 表（支持练习模式标识）
model ExamRecord {
  // ... 现有字段

  // 🆕 新增字段
  mode            PracticeMode @default(MOCK_EXAM)         // 练习模式
  subjectId       String? @map("subject_id") @db.Uuid      // 关联科目
}

// 🆕 新增枚举
enum PracticeMode {
  SMART_DRILL    // 智能刷题
  ERROR_WIPER    // 错题复习
  MOCK_EXAM      // 模拟考试
  CHAPTER_DRILL  // 章节练习
}
```

**实施方法**:
```bash
# Task A1.1: 更新 schema.prisma
# Task A1.2: 生成 migration
npx prisma migrate dev --name add_practice_mode_fields

# Task A1.3: 更新 Prisma Client 类型
npx prisma generate
```

**高效Prompt**:
```
请为 Chapter 和 ExamRecord 表添加以下字段：
1. Chapter: totalQuestions, avgDifficulty, cachedMastery, lastCacheUpdate
2. ExamRecord: mode (enum: SMART_DRILL/ERROR_WIPER/MOCK_EXAM/CHAPTER_DRILL), subjectId
请生成完整的 Prisma migration 代码。
```

---

#### A2: 统一数据访问层 (Data Service)
**目标**: 创建可复用的数据查询方法，替换Mock数据

**核心文件**: `src/actions/practice/data-service.ts`

```typescript
// 伪代码示例
export async function getChapterWithStats(chapterId: string, userId: string) {
  // 1. 查询章节基本信息
  // 2. 计算用户在该章节的掌握度 (基于 UserAttempt 正确率)
  // 3. 返回 { chapter, masteryLevel, totalAttempts, correctRate }
}

export async function getSubjectChapters(subjectId: string, userId: string) {
  // 1. 查询科目下所有章节
  // 2. 批量计算每个章节的掌握度
  // 3. 返回带统计数据的章节列表
}

export async function getRandomQuestions(filters: QuestionFilter) {
  // 1. 根据 chapterId/difficulty/type 筛选题目
  // 2. 排除用户最近30天内做过的题 (防重复)
  // 3. 返回随机N道题
}
```

**实施方法**:
```
Task A2.1: 实现 getChapterWithStats (查询章节+掌握度)
Task A2.2: 实现 getSubjectChapters (批量查询科目章节)
Task A2.3: 实现 getRandomQuestions (智能抽题)
Task A2.4: 实现 getUserQuotaStatus (查询用户配额)
```

**高效Prompt**:
```
请实现 src/actions/practice/data-service.ts，包含以下方法：
1. getChapterWithStats: 查询章节并计算用户掌握度（基于UserAttempt表的正确率）
2. getSubjectChapters: 批量查询科目下所有章节及掌握度
3. getRandomQuestions: 根据筛选条件随机抽题，排除30天内做过的题
4. getUserQuotaStatus: 查询用户今日答题数/本周考试次数

使用 Prisma Client，返回类型安全的数据。
```

---

#### A3: 掌握度计算算法
**目标**: 定义统一的"掌握度"计算规则

**核心文件**: `src/lib/practice/mastery.ts`

```typescript
// 掌握度等级定义
export enum MasteryLevel {
  NOT_STARTED = 0,   // 未开始 (0%)
  BEGINNER = 1,      // 初学 (1-59%)
  INTERMEDIATE = 2,  // 中级 (60-79%)
  ADVANCED = 3,      // 高级 (80-100%)
}

// 计算章节掌握度 (基于历史答题记录)
export function calculateChapterMastery(attempts: UserAttempt[]): MasteryLevel {
  // 算法逻辑：
  // 1. 计算最近30次答题的正确率
  // 2. 加权：近期答题权重更高 (exponential decay)
  // 3. 返回对应等级
}

// 计算知识点"热度" (用于标记 Hot/Weak 标签)
export function calculateChapterHotness(attempts: UserAttempt[]): 'HOT' | 'WEAK' | 'NORMAL' {
  // 热度规则：
  // - HOT: 最近7天内答题 > 10次 且 正确率 < 70%
  // - WEAK: 最近30天正确率 < 60%
  // - NORMAL: 其他情况
}
```

**实施方法**:
```
Task A3.1: 实现 calculateChapterMastery (掌握度算法)
Task A3.2: 实现 calculateChapterHotness (热度标签算法)
Task A3.3: 编写单元测试 (测试边界情况)
```

**高效Prompt**:
```
请实现 src/lib/practice/mastery.ts，包含：
1. calculateChapterMastery: 根据UserAttempt[]计算掌握度等级（0-3星）
   - 使用指数衰减加权（近期答题权重更高）
   - 返回 MasteryLevel 枚举
2. calculateChapterHotness: 判断章节是否为 HOT/WEAK/NORMAL
   - HOT: 7天内>10次答题且正确率<70%
   - WEAK: 30天正确率<60%
3. 包含完整的 JSDoc 注释和单元测试
```

---

### 模块B: 三大练习模式实现 (P0)

#### B1: Smart Drill（智能刷题）
**目标**: 基于错题历史和掌握度的自适应刷题

**核心文件**:
- `src/actions/practice/recommendation.ts`
- `src/app/(dashboard)/dashboard/practice/smart-drill/page.tsx`
- `src/components/practice/modes/SmartDrillMode.tsx`

**推荐算法逻辑**:
```typescript
// src/actions/practice/recommendation.ts

export async function getSmartDrillQuestions(
  userId: string,
  subjectId: string,
  limit: number = 10
): Promise<Question[]> {
  // 算法步骤：
  // 1. 查询用户在该科目的错题章节 (从 ErrorBook)
  // 2. 按章节错误率排序，优先选择错误率最高的3个章节
  // 3. 在这些章节中抽取题目：
  //    - 50% 来自错题章节
  //    - 30% 来自掌握度<80%的章节
  //    - 20% 来自新章节（用户未做过的）
  // 4. 难度匹配：用户当前等级 ± 1 星
  // 5. 排除最近7天内做过的题
  // 6. 返回打乱顺序的题目列表
}
```

**UI交互流程**:
```
1. 用户选择科目 → 点击 "Smart Drill" 卡片
2. 显示加载状态 → 调用 getSmartDrillQuestions
3. 进入答题界面 (QuizSession 组件)
4. 用户提交答案 → 实时显示对错 + 解析
5. 完成后显示成绩摘要 (ResultSummary)
```

**实施方法**:
```
Task B1.1: 实现 getSmartDrillQuestions 推荐算法
Task B1.2: 创建 SmartDrillMode.tsx 组件
Task B1.3: 创建 smart-drill/page.tsx 路由
Task B1.4: 集成 QuizSession 组件（复用）
Task B1.5: 编写单元测试（测试推荐逻辑）
```

**高效Prompt**:
```
请实现 Smart Drill（智能刷题）功能：

1. src/actions/practice/recommendation.ts 中实现 getSmartDrillQuestions:
   - 输入: userId, subjectId, limit
   - 算法: 50%错题章节 + 30%薄弱章节 + 20%新章节
   - 难度: 用户等级 ± 1 星
   - 排除: 7天内做过的题

2. src/components/practice/modes/SmartDrillMode.tsx:
   - 调用 getSmartDrillQuestions 获取题目
   - 显示加载状态和错误处理
   - 完成后返回练习中心首页

3. 路由: src/app/(dashboard)/dashboard/practice/smart-drill/page.tsx
   - Server Component，获取用户信息
   - 渲染 SmartDrillMode
```

---

#### B2: Error Wiper（错题消消乐）
**目标**: 游戏化的错题复习模式

**核心文件**:
- `src/actions/practice/error-book.ts` (已有，需扩展)
- `src/app/(dashboard)/dashboard/practice/error-wiper/page.tsx`
- `src/components/practice/modes/ErrorWiperMode.tsx`

**游戏化逻辑**:
```typescript
// 核心规则
interface ErrorWiperState {
  remainingErrors: ErrorBookEntry[]  // 待复习错题
  currentQuestion: Question          // 当前题目
  streakCount: number                // 连续答对次数
  totalWiped: number                 // 已"消除"题目数
}

// 消除逻辑
function onAnswerSubmit(isCorrect: boolean, errorEntry: ErrorBookEntry) {
  if (isCorrect) {
    // 更新 masteryLevel: 0 → 1 → 2 → 3
    if (errorEntry.masteryLevel >= 3) {
      // 触发"消除"动画
      // 从 remainingErrors 中移除
    }
  } else {
    // 重置 masteryLevel = 0
    // 该题重新加入队列末尾
  }
}
```

**UI特效**:
- **卡片堆叠**: 使用 Framer Motion 实现 Tinder 风格的卡片滑动
- **消除动画**: 答对后卡片飞出屏幕 + 粒子特效
- **进度条**: 显示"已消除 X / 总数 Y"

**实施方法**:
```
Task B2.1: 扩展 error-book.ts，添加 getErrorWiperSession
Task B2.2: 实现 ErrorWiperMode.tsx（含卡片动画）
Task B2.3: 创建 error-wiper/page.tsx 路由
Task B2.4: 集成 Framer Motion（卡片滑动效果）
Task B2.5: 测试 masteryLevel 更新逻辑
```

**高效Prompt**:
```
请实现 Error Wiper（错题消消乐）功能：

1. src/actions/practice/error-book.ts 扩展:
   - getErrorWiperSession: 获取用户所有 masteryLevel < 3 的错题
   - updateErrorWiperProgress: 更新掌握度，masteryLevel >= 3 时标记为"已消除"

2. src/components/practice/modes/ErrorWiperMode.tsx:
   - 使用 Framer Motion 实现卡片堆叠效果（类似 Tinder）
   - 答对: 卡片飞出 + masteryLevel +1
   - 答错: 卡片归位 + masteryLevel 重置为 0
   - 显示进度: "已消除 X/Y 道题"

3. 动画要求:
   - 使用 <motion.div> 包裹题目卡片
   - 滑出动画: x: 1000, opacity: 0, duration: 0.5s
   - 包含完整的 TypeScript 类型定义
```

---

#### B3: Mock Arena（模拟考场）
**目标**: 真实考试环境模拟（无即时反馈+倒计时）

**核心文件**:
- `src/actions/practice/exam.ts` (新建)
- `src/app/(dashboard)/dashboard/practice/mock-arena/page.tsx` (试卷列表)
- `src/app/(dashboard)/dashboard/practice/mock-arena/[examId]/page.tsx` (考试中)
- `src/components/practice/session/CountdownTimer.tsx`

**考试流程**:
```
1. 选择试卷页面:
   - 显示 Past Year Papers 列表（从 ExamRecord 或硬编码）
   - 显示试卷信息: 题目数量、时长、难度分布
   - 点击"Start"按钮 → 创建 ExamRecord（状态: IN_PROGRESS）

2. 考试进行中:
   - 全屏模式（隐藏侧边栏）
   - 顶部固定: 倒计时 + 题目进度条
   - 无即时反馈: 提交答案后不显示对错
   - 支持前后翻页、标记题目
   - 时间到自动提交

3. 成绩报告:
   - 显示总分、正确率、用时
   - 逐题解析（显示对错+解析）
   - 保存 ExamRecord（状态: COMPLETED）
```

**试卷生成逻辑**:
```typescript
// src/actions/practice/exam.ts

export async function generateMockExam(
  subjectId: string,
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' = 'MEDIUM',
  totalQuestions: number = 20
): Promise<Question[]> {
  // 难度分布:
  // - EASY: 50% 简单 + 40% 中等 + 10% 困难
  // - MEDIUM: 30% 简单 + 50% 中等 + 20% 困难
  // - HARD: 10% 简单 + 40% 中等 + 50% 困难

  // 章节分布: 尽量覆盖该科目的所有章节

  // 返回: 打乱顺序的题目列表
}
```

**实施方法**:
```
Task B3.1: 实现 generateMockExam 试卷生成算法
Task B3.2: 创建 CountdownTimer.tsx 倒计时组件
Task B3.3: 实现 mock-arena/page.tsx 试卷选择页面
Task B3.4: 实现 mock-arena/[examId]/page.tsx 考试页面
Task B3.5: 实现全屏模式切换逻辑
Task B3.6: 时间到自动提交功能
Task B3.7: 成绩报告页面（复用 ResultSummary）
```

**高效Prompt**:
```
请实现 Mock Arena（模拟考场）功能：

1. src/actions/practice/exam.ts:
   - generateMockExam: 按难度分布生成试卷（EASY/MEDIUM/HARD）
   - startExam: 创建 ExamRecord（mode: MOCK_EXAM, status: IN_PROGRESS）
   - submitExam: 批量判分 + 更新 ExamRecord（status: COMPLETED）

2. src/components/practice/session/CountdownTimer.tsx:
   - Props: duration (秒), onTimeUp (回调)
   - 显示格式: MM:SS
   - 剩余 < 5分钟时文字变红色
   - 时间到时触发 onTimeUp 自动提交

3. src/app/(dashboard)/dashboard/practice/mock-arena/[examId]/page.tsx:
   - 全屏模式（隐藏侧边栏）
   - 无即时反馈（提交后不显示对错）
   - 支持题目标记（Mark for Review）
   - 时间到自动提交

包含完整的错误处理和加载状态。
```

---

### 模块C: 数据可视化与分析 (P1)

#### C1: Knowledge Hive（知识蜂巢）真实数据
**目标**: 将Mock蜂窝图替换为真实掌握度数据

**核心文件**:
- `src/actions/practice/statistics.ts`
- `src/components/practice/analytics/KnowledgeHive.tsx`

**数据结构**:
```typescript
interface HiveNode {
  chapterId: string
  chapterTitle: string
  masteryLevel: MasteryLevel  // 0-3
  correctRate: number          // 0-100
  totalAttempts: number
  status: 'strong' | 'fair' | 'weak' | 'locked'
  color: string                // CSS颜色值
}

// 服务端查询
export async function getKnowledgeHiveData(
  userId: string,
  subjectId: string
): Promise<HiveNode[]> {
  // 1. 查询科目下所有章节
  // 2. 计算每个章节的掌握度和正确率
  // 3. 根据正确率分配颜色:
  //    - strong: > 80% (绿色)
  //    - fair: 60-80% (黄色)
  //    - weak: < 60% (红色)
  //    - locked: 未开始 (灰色)
  // 4. 返回蜂窝图数据
}
```

**实施方法**:
```
Task C1.1: 实现 getKnowledgeHiveData 查询逻辑
Task C1.2: 重构 KnowledgeHive.tsx，移除Mock数据
Task C1.3: 添加交互: 点击六边形跳转到对应章节练习
Task C1.4: 优化性能: 使用 React.memo 缓存组件
```

**高效Prompt**:
```
请实现 Knowledge Hive（知识蜂巢）的真实数据连接：

1. src/actions/practice/statistics.ts:
   - getKnowledgeHiveData: 查询用户在某科目的所有章节掌握度
   - 返回 HiveNode[]，包含 masteryLevel, correctRate, status, color

2. src/components/practice/analytics/KnowledgeHive.tsx:
   - 接收 HiveNode[] 数据
   - 使用 Lucide Hexagon 图标渲染蜂窝图（4行：5-4-5-4）
   - 根据 status 染色（绿/黄/红/灰）
   - 添加 hover tooltip 显示章节名称和正确率
   - 点击跳转到 /dashboard/practice/smart-drill?chapterId=xxx

3. 移除所有 Mock 数据（hiveData）
```

---

#### C2: Exam Forecast（考分预测）
**目标**: 基于近期练习表现预测考试成绩

**预测算法**:
```typescript
// src/lib/practice/algorithms.ts

export function calculateExamForecast(
  recentAttempts: UserAttempt[],  // 最近30天答题记录
  userProgress: UserProgress[]     // 课程完成度
): ExamForecast {
  // 简化线性回归模型:
  // 预测分 = (平均答题正确率 * 0.6) + (课程完成率 * 0.3) + (连续学习天数加成 * 0.1)

  const avgCorrectRate = calculateAverageCorrectRate(recentAttempts)
  const courseCompletion = calculateCourseCompletion(userProgress)
  const streakBonus = Math.min(user.streak * 0.5, 10) // 最多加10分

  const predictedScore = avgCorrectRate * 0.6 + courseCompletion * 0.3 + streakBonus * 0.1

  // 转换为等级: A+, A, A-, B+, B, ...
  const grade = scoreToGrade(predictedScore)

  return {
    grade,
    score: predictedScore,
    trend: calculateTrend(recentAttempts), // UP/DOWN/STABLE
    confidence: calculateConfidence(recentAttempts) // 0-100
  }
}
```

**实施方法**:
```
Task C2.1: 实现 calculateExamForecast 预测算法
Task C2.2: 实现 ExamForecast.tsx 组件（显示预测等级）
Task C2.3: 添加趋势图（Sparkline）显示近7天表现
Task C2.4: 编写单元测试（测试预测准确性）
```

**高效Prompt**:
```
请实现 Exam Forecast（考分预测）功能：

1. src/lib/practice/algorithms.ts:
   - calculateExamForecast: 基于UserAttempt和UserProgress预测考试成绩
   - 算法: (正确率*0.6) + (课程完成率*0.3) + (streak加成*0.1)
   - 返回: { grade: string, score: number, trend: 'UP'|'DOWN'|'STABLE', confidence: number }
   - 包含 scoreToGrade 转换函数（A+/A/A-/B+...）

2. src/components/practice/analytics/ExamForecast.tsx:
   - 显示预测等级（大号文字）
   - 趋势指示器（绿色↑/红色↓）
   - Sparkline 图表（使用 Recharts 或简单的 div 条形图）
   - 显示"Predicted for Finals (Nov)"文案

3. 在 QuestionBankView 中集成，移除Mock数据
```

---

#### C3: Chapter Map 数据打通
**目标**: 将Mock章节列表替换为真实数据

**实施方法**:
```
Task C3.1: 修改 QuestionBankView.tsx 的 renderChapterMap
Task C3.2: 调用 getSubjectChapters 获取真实章节数据
Task C3.3: 根据掌握度显示星级（0-3星）
Task C3.4: 添加 HOT/WEAK 标签逻辑
Task C3.5: 点击"Start"按钮跳转到 smart-drill?chapterId=xxx
```

**高效Prompt**:
```
请重构 QuestionBankView.tsx 的 renderChapterMap 方法：

1. 移除 Mock 数据（currentSubject.chapters）
2. 调用 getSubjectChapters(selectedSubjectId, userId) 获取真实章节
3. 显示:
   - 章节编号（CH 01, CH 02...）
   - 章节标题
   - 掌握度星级（0-3星，基于 masteryLevel）
   - HOT 标签: 7天内>10次答题且正确率<70%
   - WEAK 标签: 30天正确率<60%
4. 按钮逻辑:
   - masteryLevel >= 3: 显示"Review"按钮（绿色边框）
   - 其他: 显示"Start"按钮（蓝色填充）
5. 点击后跳转到 /dashboard/practice/smart-drill?chapterId=xxx

包含加载状态和错误处理。
```

---

### 模块D: 权限与配额控制 (P1)

#### D1: 每日答题限额
**目标**: 根据用户角色限制每日答题数

**权限规则**（来自 FEATURES_AND_PERMISSIONS.md）:
```
STUDENT:       20题/天  ⚠️
PRO:          100题/天  ⚠️
ULTIMATE:     无限制   ✅
TEACHER/ADMIN: 无限制   ✅
```

**实现逻辑**:
```typescript
// src/actions/practice/quota.ts

export async function checkDailyQuota(userId: string): Promise<QuotaStatus> {
  const user = await prisma.user.findUnique({ where: { id: userId } })

  // 查询今日答题数
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todayAttempts = await prisma.userAttempt.count({
    where: {
      userId,
      createdAt: { gte: today }
    }
  })

  // 获取限额
  const limit = getDailyLimit(user.role)

  return {
    used: todayAttempts,
    limit,
    remaining: limit === Infinity ? Infinity : Math.max(0, limit - todayAttempts),
    canPractice: todayAttempts < limit
  }
}

function getDailyLimit(role: UserRole): number {
  switch (role) {
    case 'STUDENT': return 20
    case 'PRO': return 100
    case 'ULTIMATE':
    case 'TEACHER':
    case 'ADMIN':
      return Infinity
    default: return 20
  }
}
```

**UI展示**:
- 练习中心首页顶部显示: "今日已练习 12/20 题"
- 达到限额时禁用"Start"按钮，显示提示: "今日配额已用完，明日重置"

**实施方法**:
```
Task D1.1: 实现 checkDailyQuota Server Action
Task D1.2: 在 QuestionBankView 中调用并显示配额状态
Task D1.3: 达到限额时禁用所有练习模式按钮
Task D1.4: 添加升级提示（STUDENT → PRO）
```

**高效Prompt**:
```
请实现每日答题配额功能：

1. src/actions/practice/quota.ts:
   - checkDailyQuota: 查询用户今日答题数
   - 返回 { used, limit, remaining, canPractice }
   - getDailyLimit: 根据 UserRole 返回限额
     - STUDENT: 20
     - PRO: 100
     - ULTIMATE/TEACHER/ADMIN: Infinity

2. src/components/practice/QuotaDisplay.tsx:
   - 显示进度条: "今日已练习 X/Y 题"
   - 达到限额时显示提示: "今日配额已用完，升级 PRO 获得 100题/天"
   - 包含"升级"按钮跳转到 /pricing

3. 在 QuestionBankView.tsx 中集成:
   - 顶部显示 QuotaDisplay
   - canPractice = false 时禁用所有练习模式卡片
```

---

#### D2: 模拟考试次数限制
**目标**: 根据用户角色限制每周考试次数

**权限规则**:
```
STUDENT:       2次/周  ⚠️
PRO:          10次/周  ⚠️
ULTIMATE:     无限制   ✅
TEACHER/ADMIN: 无限制   ✅
```

**实现逻辑**:
```typescript
// src/actions/practice/quota.ts

export async function checkWeeklyExamQuota(userId: string): Promise<QuotaStatus> {
  const user = await prisma.user.findUnique({ where: { id: userId } })

  // 查询本周考试次数（从周一开始）
  const weekStart = getWeekStart(new Date())

  const weeklyExams = await prisma.examRecord.count({
    where: {
      userId,
      mode: 'MOCK_EXAM',
      createdAt: { gte: weekStart }
    }
  })

  const limit = getWeeklyExamLimit(user.role)

  return {
    used: weeklyExams,
    limit,
    remaining: limit === Infinity ? Infinity : Math.max(0, limit - weeklyExams),
    canTakeExam: weeklyExams < limit
  }
}
```

**实施方法**:
```
Task D2.1: 实现 checkWeeklyExamQuota
Task D2.2: 在 mock-arena/page.tsx 中调用并显示
Task D2.3: 达到限额时禁用"Start"按钮
```

---

### 模块E: 组件重构与优化 (P2)

#### E1: QuizSession 通用答题组件
**目标**: 创建可复用的答题会话组件，供3种模式共享

**核心文件**: `src/components/practice/session/QuizSession.tsx`

```typescript
interface QuizSessionProps {
  questions: Question[]
  mode: 'SMART_DRILL' | 'ERROR_WIPER' | 'MOCK_EXAM'
  showFeedback: boolean      // 是否即时显示对错
  allowNavigation: boolean   // 是否允许前后翻页
  timeLimit?: number         // 时间限制（秒）
  onComplete: (result: ExamResult) => void
}

export function QuizSession({ questions, mode, ... }: QuizSessionProps) {
  // 状态管理:
  // - currentQuestionIndex
  // - userAnswers: Map<questionId, answer>
  // - startTime, elapsedTime

  // 交互逻辑:
  // - 提交答案 → 调用 submitAnswer Server Action
  // - 如果 showFeedback=true，立即显示对错+解析
  // - 全部完成 → 调用 onComplete 回调
}
```

**实施方法**:
```
Task E1.1: 创建 QuizSession.tsx 组件框架
Task E1.2: 实现答题状态管理（使用 useState）
Task E1.3: 集成 QuestionCard / AnswerOptions 子组件
Task E1.4: 在 SmartDrillMode / ErrorWiperMode / MockArena 中复用
```

---

#### E2: QuestionBankView 拆分
**目标**: 将500+行的 QuestionBankView.tsx 拆分为多个模块

**拆分方案**:
```
QuestionBankView.tsx (主入口)
├── SubjectSelector.tsx      # 科目选择器
├── TrainingModeCards.tsx    # 3种练习模式卡片
├── ChapterMapSection.tsx    # 章节地图
├── PastPapersSection.tsx    # 历年试卷
└── AnalyticsSidebar.tsx     # 右侧分析栏
    ├── KnowledgeHive.tsx
    ├── ExamForecast.tsx
    └── WeaknessCard.tsx
```

**实施方法**:
```
Task E2.1: 提取 SubjectSelector 组件
Task E2.2: 提取 TrainingModeCards 组件
Task E2.3: 提取 ChapterMapSection 组件
Task E2.4: 重构 QuestionBankView，保持逻辑清晰
```

---

## 🧪 4. Testing Strategy (测试策略)

### 单元测试 (Unit Tests)

**覆盖目标**: >80% 业务逻辑代码

```typescript
// 测试文件: src/lib/practice/__tests__/algorithms.test.ts

describe('calculateExamForecast', () => {
  it('should predict A- for 85% correct rate', () => {
    const attempts = generateMockAttempts(100, 0.85) // 100题，85%正确率
    const progress = generateMockProgress(0.9)       // 90%课程完成度

    const result = calculateExamForecast(attempts, progress)

    expect(result.grade).toBe('A-')
    expect(result.score).toBeGreaterThan(80)
  })

  it('should handle empty attempts gracefully', () => {
    const result = calculateExamForecast([], [])
    expect(result.grade).toBe('N/A')
  })
})

// 测试文件: src/lib/practice/__tests__/mastery.test.ts

describe('calculateChapterMastery', () => {
  it('should return ADVANCED for 90% correct rate', () => {
    const attempts = [
      { isCorrect: true, createdAt: new Date() },
      { isCorrect: true, createdAt: new Date() },
      // ... 共10次，9次正确
    ]

    const level = calculateChapterMastery(attempts)
    expect(level).toBe(MasteryLevel.ADVANCED)
  })
})
```

**测试工具**:
- Jest / Vitest
- @testing-library/react (组件测试)
- MSW (Mock Service Worker，模拟API)

**实施方法**:
```
Task T1: 为所有 src/lib/practice/*.ts 编写单元测试
Task T2: 为关键 Server Actions 编写集成测试
Task T3: 配置 CI 自动运行测试
```

---

### 集成测试 (Integration Tests)

**测试场景**:
1. **完整答题流程**: 开始练习 → 提交答案 → 更新掌握度 → 查看错题本
2. **配额限制**: STUDENT 用户答题20次后无法继续
3. **考试流程**: 开始考试 → 答题 → 时间到自动提交 → 查看成绩

```typescript
// 测试文件: src/actions/practice/__tests__/session.integration.test.ts

describe('Smart Drill Integration', () => {
  it('should complete a full practice session', async () => {
    // 1. 创建测试用户
    const user = await createTestUser({ role: 'STUDENT' })

    // 2. 获取推荐题目
    const questions = await getSmartDrillQuestions(user.id, 'math', 5)
    expect(questions).toHaveLength(5)

    // 3. 模拟答题
    for (const q of questions) {
      const result = await submitAnswer(user.id, q.id, 'A')
      expect(result.success).toBe(true)
    }

    // 4. 验证 UserAttempt 记录已创建
    const attempts = await prisma.userAttempt.findMany({
      where: { userId: user.id }
    })
    expect(attempts).toHaveLength(5)

    // 5. 验证错题本更新
    const errorBook = await prisma.errorBook.findMany({
      where: { userId: user.id }
    })
    expect(errorBook.length).toBeGreaterThan(0) // 至少有1道错题
  })
})
```

---

### E2E测试 (End-to-End Tests)

**工具**: Playwright

**关键测试用例**:
```typescript
// tests/e2e/practice-center.spec.ts

test('User can complete Smart Drill session', async ({ page }) => {
  // 1. 登录
  await page.goto('/login')
  await page.fill('input[name="email"]', 'test@example.com')
  await page.fill('input[name="password"]', 'password')
  await page.click('button[type="submit"]')

  // 2. 进入练习中心
  await page.goto('/dashboard/practice')
  await expect(page.locator('h2')).toContainText('练习中心')

  // 3. 点击 Smart Drill
  await page.click('text=Smart Drill')
  await expect(page).toHaveURL(/smart-drill/)

  // 4. 答题
  await page.click('button:has-text("A")')
  await page.click('button:has-text("Next")')

  // 5. 完成后查看成绩
  await page.click('button:has-text("Submit")')
  await expect(page.locator('text=Quiz Complete!')).toBeVisible()
})

test('Student reaches daily quota and cannot practice', async ({ page }) => {
  // ... 模拟答题20次后，验证按钮被禁用
})
```

**实施方法**:
```
Task T4: 编写 E2E 测试覆盖关键用户路径
Task T5: 配置 Playwright CI 集成
Task T6: 添加 Visual Regression Testing（截图对比）
```

---

## ✅ 5. Definition of Done (交付标准)

### 功能完整性
- [ ] 所有3种练习模式（Smart Drill / Error Wiper / Mock Arena）功能正常
- [ ] 所有Mock数据已替换为真实数据库查询
- [ ] Chapter Map / Knowledge Hive / Exam Forecast 显示真实数据
- [ ] 配额系统正常工作（每日答题 / 每周考试限制）

### 代码质量
- [ ] ESLint 0 errors, 0 warnings
- [ ] TypeScript 0 type errors (`pnpm tsc --noEmit`)
- [ ] 所有新代码包含 JSDoc 注释
- [ ] 关键函数单元测试覆盖率 > 80%

### 性能指标
- [ ] 练习中心首页加载 < 1s (FCP)
- [ ] 答题提交响应 < 500ms (P95)
- [ ] 掌握度计算 < 200ms（单科目）

### 用户体验
- [ ] 所有交互有加载状态和错误提示
- [ ] 移动端适配（响应式布局）
- [ ] 无 Console Errors / Warnings
- [ ] 所有按钮和卡片有 hover / active 状态

### 文档与部署
- [ ] 更新 FEATURES_AND_PERMISSIONS.md（标记已完成功能）
- [ ] 创建用户使用指南（docs/guides/practice-center.md）
- [ ] Vercel 预览链接可访问
- [ ] Supabase 数据库 migration 已应用

---

## 📝 6. Code Review Checklist (代码审查清单)

### 架构审查
- [ ] 数据访问层（data-service.ts）是否职责单一？
- [ ] 组件拆分是否合理（避免超过300行）？
- [ ] Server Actions 是否包含完整的错误处理？
- [ ] 是否避免了 N+1 查询问题？

### 安全审查
- [ ] 所有 Server Actions 是否验证用户身份？
- [ ] 是否防止了 SQL 注入（使用 Prisma）？
- [ ] 配额检查是否在服务端执行（不可绕过）？
- [ ] 敏感数据（答案）是否仅在需要时返回？

### 性能审查
- [ ] 是否使用了数据库索引（userId, chapterId 等）？
- [ ] 大数据量查询是否分页？
- [ ] 是否使用了 React.memo / useMemo 优化渲染？
- [ ] 是否缓存了计算密集型结果？

### 可维护性审查
- [ ] 魔法数字是否提取为常量（如 DAILY_LIMIT_STUDENT = 20）？
- [ ] 复杂算法是否有清晰的注释？
- [ ] 是否遵循了 DRY 原则（避免重复代码）？
- [ ] 错误消息是否清晰易懂？

---

## 🚀 7. Implementation Roadmap (实施路线图)

### Sprint 1: 数据基础（Week 1, ~20h）
```
Day 1-2: 模块A - 数据层重构
  - A1: Schema 扩展
  - A2: Data Service 实现
  - A3: 掌握度算法

Day 3-4: 模块D - 配额系统
  - D1: 每日答题限额
  - D2: 考试次数限制

Day 5: 测试与集成
  - 单元测试 (algorithms, mastery)
  - 集成测试 (data-service)
```

### Sprint 2: 核心练习模式（Week 2, ~24h）
```
Day 1-2: 模块B1 - Smart Drill
  - 推荐算法
  - 页面实现
  - QuizSession 组件

Day 3-4: 模块B2 - Error Wiper
  - 游戏化逻辑
  - 卡片动画
  - 页面实现

Day 5: 模块B3 - Mock Arena
  - 试卷生成
  - 倒计时组件
  - 考试页面
```

### Sprint 3: 数据可视化（Week 3, ~16h）
```
Day 1: 模块C1 - Knowledge Hive
Day 2: 模块C2 - Exam Forecast
Day 3: 模块C3 - Chapter Map 数据打通
Day 4: 模块E - 组件重构
Day 5: E2E 测试与 Bug 修复
```

---

## 🎯 8. Success Metrics (成功指标)

### 技术指标
- [ ] 代码覆盖率 > 80%
- [ ] 页面加载时间 < 1s
- [ ] API 响应时间 P95 < 500ms
- [ ] 0 TypeScript / ESLint 错误

### 产品指标（种子用户阶段）
- [ ] 用户完成率 > 60%（开始练习 → 完成练习）
- [ ] 平均练习时长 > 10分钟
- [ ] 错题本使用率 > 40%
- [ ] 模拟考试完成率 > 50%

### 用户反馈目标
- [ ] SUS 可用性评分 > 70
- [ ] NPS 推荐指数 > 30
- [ ] 关键 Bug 报告 < 5个

---

## 📚 9. Reference Materials (参考资料)

### 相关文档
- [FEATURES_AND_PERMISSIONS.md](../FEATURES_AND_PERMISSIONS.md) - 权限矩阵
- [Story-029](../completed/story-029-practice-error-book.md) - 基础练习逻辑
- [Story-010](./story-010-practice-center-revamp.md) - AI解析器

### 技术文档
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Framer Motion Documentation](https://www.framer.com/motion/)

### 设计参考
- Duolingo 练习模式
- Khan Academy 掌握度系统
- Anki 间隔重复算法

---

## 🔧 10. Troubleshooting Guide (常见问题)

### Q1: 掌握度计算缓慢（>2s）
**原因**: 未添加数据库索引
**解决方案**:
```prisma
model UserAttempt {
  @@index([userId, questionId])
  @@index([userId, createdAt])
}
```

### Q2: Mock数据残留导致UI错误
**排查方法**:
```bash
# 搜索所有Mock数据引用
git grep -n "Mock\|mock\|fake" src/components/practice/
```

### Q3: 配额检查被绕过
**原因**: 只在前端检查，未在Server Action验证
**解决方案**: 所有提交答案的 Action 必须先调用 `checkDailyQuota`

---

## ✍️ 11. Development Notes (开发笔记)

### 架构决策记录 (ADR)

**ADR-001: 使用 ExamRecord 作为练习会话载体**
- **决策**: 即使不是正式考试，也使用 ExamRecord 记录练习会话
- **理由**: 复用现有表结构，避免新增 PracticeSession 表
- **影响**: ExamRecord 需要添加 `mode` 字段区分类型

**ADR-002: 掌握度计算使用指数衰减**
- **决策**: 近期答题权重更高（指数衰减 λ=0.1）
- **理由**: 反映学生最新水平，避免历史数据干扰
- **公式**: `weight = e^(-0.1 * daysSince)`

**ADR-003: 错题本"消除"不删除记录**
- **决策**: masteryLevel >= 3 时不删除 ErrorBook 记录
- **理由**: 保留历史数据用于分析
- **实现**: UI 中过滤掉 masteryLevel >= 3 的记录

---

## 🎉 12. Post-Launch Plan (上线后计划)

### 种子用户测试（Week 4-5）
- [ ] 邀请20位种子用户试用
- [ ] 收集反馈问卷（Google Forms）
- [ ] 监控 Sentry 错误报告
- [ ] 分析用户行为数据（Amplitude / Mixpanel）

### 迭代优化（Week 6+）
- [ ] 根据反馈调整推荐算法参数
- [ ] 优化 AI 解析器准确率
- [ ] 添加社交功能（排行榜、挑战赛）
- [ ] 引入 AI 智能出题（PRO 功能）

---

**Story 状态**: Backlog ⚪
**最后更新**: 2026-01-22
**下次审查**: Sprint Planning Meeting
