# Active Context (当前上下文)

**上次更新**: 2025-12-11
**当前阶段**: Phase 3 - Question Bank

## 🎯 当前焦点 (Current Focus)

**Story-013: Error Book System (错题本系统)**
- 目标: 错题自动收集与复习。
- 关键点: 
    - 在判卷逻辑中自动写入 `ErrorBook`。
    - 实现错题本列表页，支持按学科筛选。
    - 实现 '消灭错题' 功能 (重做正确后移除)。

## 📝 待办事项 (Immediate Todos)

- [ ] Step 1: 修改 `submitQuiz` Server Action，在判卷时写入 `ErrorBook` 表。
- [ ] Step 2: 创建 `ErrorBook` 的 Server Action 来获取错题列表。
- [ ] Step 3: 设计错题本列表页面的 UI。
- [ ] Step 4: 实现错题卡片组件，包含移除功能。
- [ ] Step 5: 实现前端错题列表页，并集成筛选功能。

## 💡 最近的架构决策 (Recent Decisions)

1.  **Grading Engine**: 实现了 `submitQuiz` Server Action，支持自动判分和结果持久化。
2.  **Exam Record**: 引入了 `ExamRecord` 模型来聚合一次测验的多个 `UserAttempt`。
3.  **UI Feedback**: 创建了独立 `ScoreCard` 组件展示测验结果摘要。
4.  **Question UI**: 采用了 `QuestionCard` 组合式组件设计，利用 `react-markdown` + `rehype-katex` 处理富文本和公式。
