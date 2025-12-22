# Story-033: AI Diagnostics (Static)

**状态**: Backlog ⚪
**优先级**: P2
**前置任务**: Story-029

## 1. 目标
生成用户的“能力诊断报告”。MVP 阶段主要做数据聚合与静态图表展示，辅以简单的 AI 评语。

## 2. 任务拆解
- [ ] **Data Aggregation**:
    - 聚合 `UserAttempt` 数据，按 Knowledge Point (知识点) 计算正确率。
- [ ] **Radar Chart Data**:
    - 生成雷达图所需的 JSON 数据（维度：代数、几何、统计等）。
- [ ] **AI Comment**:
    - 将聚合数据发送给 Gemini，请求生成一段简短的“学习建议”。
- [ ] **Report Page**:
    - 在 Dashboard 实现“查看诊断报告”页面。

## 3. 验收标准
- [ ] 诊断报告能正确反映用户的强弱项。
- [ ] AI 评语逻辑通顺，基于真实数据。
