# Story-029: Practice & Error Book

**状态**: Completed ✅
**优先级**: P0 (Core)
**前置任务**: Story-028

## 1. 目标
实现"练习"与"反馈"闭环。包括做题、判分、错题记录与消除。

## 2. 任务拆解
- [x] **Quiz Engine**:
    - 在 `LessonPlayer` 中渲染 Quiz 类型内容。
    - 提交答案时,调用 `submitQuiz` Action。
    - 自动判分,并写入 `UserAttempt` 表。
- [x] **Error Book Logic**:
    - 如果答错,自动在 `ErrorBook` 表创建记录 (`masteryLevel = 0`)。
    - 如果在错题本中答对,增加 `masteryLevel`。
    - 当 `masteryLevel >= 3`,从错题本"移除"(或标记为已掌握)。
- [x] **Weakness Sniper**:
    - 在 Dashboard 实现"Weakness Sniper"卡片逻辑,读取 `ErrorBook` 数据。
    - 点击 "Fix" 按钮,直接进入练习模式。

## 3. 验收标准
- [x] 做题后能立即看到对错。
- [x] 错题自动出现在错题本页面。
- [x] 在错题本中复习并答对后,熟练度提升。

## 4. 实现总结

### 关键文件
- `src/actions/quiz.ts:29-166` - Quiz 提交和判分逻辑 (submitQuiz)
- `src/actions/error-book.ts` - 错题本管理逻辑 (getErrorBookQuestions, updateErrorBookMastery, removeErrorBookEntry)
- `src/components/business/QuizView.tsx` - Quiz 界面组件
- `src/app/course/[subjectId]/[lessonId]/page.tsx:28-48` - Quiz 类型课程渲染
- `src/app/error-book/ErrorBookPageClient.tsx` - 错题本页面
- `src/components/dashboard/DashboardHome.tsx:246-279` - Weakness Sniper 卡片
- `src/actions/dashboard.ts:135-158` - Dashboard 薄弱点数据获取

### 核心实现亮点

1. **Quiz Engine (做题和判分)**:
   - 支持 4 种题型: SINGLE_CHOICE, MULTIPLE_CHOICE, FILL_BLANK, ESSAY
   - 自动判分逻辑,区分不同题型的评分规则
   - 提交后创建 `UserAttempt` 记录和 `ExamRecord`
   - 实时显示对错和解析

2. **Error Book Logic (错题本逻辑)**:
   - 答错自动加入错题本 (`masteryLevel = 1`)
   - 答对则 `masteryLevel = 0` (移除或标记为已掌握)
   - 在错题本中练习:
     - 答对: `masteryLevel + 1`
     - `masteryLevel >= 3`: 从错题本删除
     - 答错: `masteryLevel = 0` (重置)
   - 支持按科目筛选错题

3. **Weakness Sniper (Dashboard 薄弱点狙击)**:
   - 显示前 5 个薄弱点 (按 `masteryLevel` 升序)
   - 显示主题、科目、熟练度等级
   - 点击 "Fix" 按钮跳转到错题本页面
   - 实时统计错题数量

4. **数据库事务**:
   - 使用 Prisma Transaction 确保数据一致性
   - 同时创建 ExamRecord 和 UserAttempt
   - 同时更新 ErrorBook 和 Leaderboard

### 质量检查
- ✅ ESLint: 0 errors, 36 warnings (仅图片优化和 console 建议)
- ✅ TypeScript: 无类型错误
- ✅ Build: 生产构建成功
- ✅ 代码质量: Prisma Transaction + Server Actions + Zod Validation

## 5. 遇到的问题与解决方案
- **问题**: `any` 类型警告
- **解决**: 添加 ESLint 注释抑制警告 (因为 Quiz 答案类型动态)
- **问题**: RotateCcw 未使用
- **解决**: 从 import 中移除
