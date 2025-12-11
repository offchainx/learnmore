# Active Context (当前上下文)

**上次更新**: 2025-12-11
**当前阶段**: Phase 3 - Question Bank

## 🎯 当前焦点 (Current Focus)

**Story-012: Grading Engine (判分引擎)**
- 目标: 实现后端判卷逻辑与结果反馈，前端展示结果。
- 关键点: 
    - Server Action: `submitQuiz`
    - 评分逻辑 (单选、多选、填空)
    - 数据库写入 (`UserAttempt`, `ExamRecord`)
    - 结果页展示

## 📝 待办事项 (Immediate Todos)

- [ ] Step 1: 设计 `submitQuiz` Server Action 接口与数据结构
- [ ] Step 2: 实现后端评分核心逻辑 (Grading Service/Utility)
- [ ] Step 3: 实现数据库事务写入逻辑
- [ ] Step 4: 更新 `quiz-store` 以支持提交状态和结果存储
- [ ] Step 5: 创建结果页 UI (Score Card, Answer Review)

## 💡 最近的架构决策 (Recent Decisions)

1.  **Question UI**: 采用了 `QuestionCard` 组合式组件设计，利用 `react-markdown` + `rehype-katex` 处理富文本和公式。
2.  **UI Primitives**: 引入了 `Radix UI` 的 `RadioGroup` 和 `Checkbox` 并封装为 `shadcn/ui` 风格组件。
3.  **Resizable UI**: 在 MVP 阶段实现了可调整大小的侧边栏。
4.  **Quiz Mode**: 实现了题目分页/切换、答题倒计时、答题卡和答案暂存。
