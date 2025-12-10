# Active Context (当前上下文)

**上次更新**: 2025-12-10
**当前阶段**: Phase 3 - Question Bank

## 🎯 当前焦点 (Current Focus)

**Story-010: Question Rendering Engine**
- 目标: 实现支持富文本和公式的题目渲染组件
- 关键点: LaTeX 支持, 题型 UI 差异化, 交互实现

## 📝 待办事项 (Immediate Todos)

- [ ] 检查并安装依赖 (`react-katex`, `react-markdown`, `@tailwindcss/typography`)
- [ ] 配置 Tailwind Typography
- [ ] 创建 `QuestionCard` 组件骨架
- [ ] 封装 `SingleChoice` 和 `MultiChoice` 组件
- [ ] 集成 `KaTeX` 和 `react-markdown`
- [ ] 编写测试用例

## 💡 最近的架构决策 (Recent Decisions)

1.  **Resizable UI**: 在 MVP 阶段实现了可调整大小的侧边栏，提升了桌面端用户体验。
2.  **UI Consistency**: 将 AI Studio 的高保真 UI 样式正式纳入 Story 范围，并已完成集成。
3.  **测试策略**: 针对 Next.js 14+ 环境下的客户端组件，采用了更精确的 `next/navigation` 模拟策略。
