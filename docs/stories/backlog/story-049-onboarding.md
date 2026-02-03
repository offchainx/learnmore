# Story-049: 新手引导与冷启动 (Onboarding & Cold Start)

**阶段**: Phase 8: Core Experience & Retention
**目标**: 解决"注册后不知道干什么"的问题，通过向导、摸底和预置数据，让用户在注册后的前 5 分钟内体验到产品的 "Aha Moment"。
**预估时间**: 35-45 Hours
**Story Points**: 30
**前置依赖**: Story-044 (Content Pipeline), Story-045 (Permission System)
**负责人**: _待分配_

---

## 📋 1. Executive Summary (概要)

### 当前痛点
- ⚠️ **空状态焦虑**: 用户注册进入 Dashboard，因为没有做题记录，看到的是一片空白（无图表、无推荐、无错题）。
- ⚠️ **缺乏目标**: 系统不知道用户的年级、教材版本和薄弱项，无法进行个性化推荐。
- ⚠️ **功能迷失**: 功能太多（题库、AI、错题本），用户不知道从哪里开始。

### 目标状态
- ✅ **Setup Wizard (设置向导)**: 注册后强制引导流程，收集年级、科目、目标。
- ✅ **Diagnostic Test (摸底测试)**: 推荐用户做 5-10 道“定位题”，快速初始化用户的能力模型。
- ✅ **Seed Data (数据播种)**: 基于摸底结果，立刻生成一份“专属学习计划”和 Dashboard 初始数据，避免冷启动。
- ✅ **Product Tour (功能漫游)**: 使用引导库高亮核心功能区。

---

## 🏗️ 2. System Architecture (系统架构)

### 2.1 流程设计

```
[User Sign Up]
      ↓
[Onboarding Flow (Wizard)]
   1. Select Grade (7/8/9)
   2. Select Region/Textbook Version
   3. Select Weak Subjects (Math/Physics...)
      ↓
[Diagnostic Invitation]
   "Let's assess your level in 5 minutes!" -> [Start Quiz] / [Skip]
      ↓
   (If Quiz Taken) -> Generate Initial Ability Score
      ↓
[Dashboard Initialization]
   - Pre-fill "Recommended Tasks"
   - Generate "First Weekly Goal"
      ↓
[Product Tour]
   "Here is your Error Book", "Ask AI here"
```

### 2.2 数据模型

```prisma
model UserProfile {
  // ... existing
  grade           Int?     // 7, 8, 9
  textbookVersion String?  // "Human_Education", "North_Normal"...
  targetSchool    String?
  weakSubjects    String[] // ["MATH", "PHYSICS"]
  
  isOnboardingCompleted Boolean @default(false)
}

// 摸底测试记录
model DiagnosticResult {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String   @db.Uuid
  subject   String
  score     Int
  ability   Json     // { algebra: 0.8, geometry: 0.4 }
  createdAt DateTime @default(now())
}
```

---

## 🎯 3. Implementation Tasks (实施任务拆解)

---

## 📦 Task A: 设置向导 (Setup Wizard)

### 🎯 目标
收集用户元数据，构建用户画像。

### 📄 核心文件
- `src/app/(onboarding)/setup/page.tsx`
- `src/components/onboarding/StepGrade.tsx`
- `src/components/onboarding/StepSubject.tsx`
- `src/actions/onboarding.ts`

### ✅ 交付物清单
- [ ] A1: 独立布局 (无 Sidebar, 无 Header，专注流程)
- [ ] A2: 多步表单组件 (Step 1 -> Step 2 -> Submit)
- [ ] A3: `completeOnboarding` Action (更新 UserProfile，标记 `isOnboardingCompleted`)
- [ ] A4: 路由拦截 (Middleware: 若未完成 Onboarding，强制跳转 `/setup`)

### 🔧 详细实施指南
使用 `framer-motion` 实现步骤切换的丝滑动画。确保每一步都非常简单，不要让用户思考。

---

## 📦 Task B: 摸底测试 (Diagnostic Test)

### 🎯 目标
快速评估用户水平，为 Story-043 的推荐算法提供初始输入。

### 📄 核心文件
- `src/app/(onboarding)/diagnostic/page.tsx`
- `src/actions/practice/diagnostic-service.ts`

### ✅ 交付物清单
- [ ] B1: 摸底卷生成逻辑 (从题库中抽取不同难度的 5 道典型题)
- [ ] B2: 简化版 Quiz UI (专注于快速作答，不需要太复杂的工具栏)
- [ ] B3: 结果分析页 ("你的代数基础很棒，但几何需要加强")

### 🔧 详细实施指南
**逻辑**:
1.  题 1 (中等难度): 对 -> 题 2 (难); 错 -> 题 2 (易)。
2.  动态调整后续题目难度 (简化的 CAT 算法)。

---

## 📦 Task C: 仪表盘冷启动 (Dashboard Cold Start)

### 🎯 目标
根据 A 和 B 的结果，填充 Dashboard，消灭“空状态”。

### 📄 核心文件
- `src/app/(dashboard)/dashboard/page.tsx`
- `src/components/dashboard/WelcomeCard.tsx`
- `src/components/dashboard/RecommendedPlan.tsx`

### ✅ 交付物清单
- [ ] C1: `WelcomeCard` (显示 "你好 [名字]，我们要开始今天的 [科目] 训练吗？")
- [ ] C2: 预置任务列表 (即使没有做题历史，根据年级推荐 "本周热门考点")
- [ ] C3: 假数据填充 (仅在 UI 层): 如果没有数据，显示 "示例图表" 并覆盖一层 "开始做题以解锁分析" 的遮罩。

---

## 📦 Task D: 功能漫游 (Product Tour)

### 🎯 目标
手把手教用户怎么用。

### 技术选型
- `driver.js` (轻量、无依赖、效果好)

### ✅ 交付物清单
- [ ] D1: `useProductTour` Hook
- [ ] D2: 关键元素的 ID 埋点 (`id="tour-error-book"`)
- [ ] D3: 漫游逻辑 (仅在 `isOnboardingCompleted` 刚变为 true 时触发一次)

---

## ✅ 4. Verification Plan (验收标准)

- [ ] **流程闭环**: 新注册账号 -> 自动跳 `/setup` -> 填完表单 -> 跳 `/dashboard`。
- [ ] **数据落地**: 数据库中 UserProfile 正确记录了用户的年级和科目。
- [ ] **冷启动体验**: 进入 Dashboard 后，不是一片空白，而是看到了根据我的年级推荐的练习。

---

## 📅 5. Execution Roadmap

1.  **Day 1**: Task A (Wizard) - 搞定表单和路由拦截。
2.  **Day 2**: Task B (Diagnostic) - 搞定摸底题逻辑。
3.  **Day 3**: Task C (Dashboard) - 优化空状态。
4.  **Day 4**: Task D (Tour) - 加上引导气泡。
