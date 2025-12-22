# Story-036: Knowledge Graph (Lite)

**状态**: Backlog ⚪
**优先级**: P3
**前置任务**: Story-033

## 1. 目标
可视化展示知识点之间的关联。

## 2. 任务拆解
- [ ] **Graph Data Structure**:
    - 定义知识点 (Node) 和依赖关系 (Edge) 的 JSON 数据。
- [ ] **Visualization**:
    - 使用 React Flow 或 D3.js 渲染静态图谱。
    - 节点颜色根据用户的掌握度 (`ErrorBook`) 动态变化（红/黄/绿）。
- [ ] **Interaction**:
    - 点击节点跳转到对应的 `Chapter` 或 `Lesson`。

## 3. 验收标准
- [ ] 能够看到一张知识点网状图。
- [ ] 掌握度颜色准确。
- [ ] 点击节点能正确跳转。
