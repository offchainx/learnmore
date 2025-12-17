# Story-027: AI功能展示模块

**状态**: Backlog ⚪
**优先级**: P0 (Critical - Phase 7核心)
**预计工时**: 8-10小时
**前置依赖**: Story-026
**阻塞Story**: Story-028

---

## 1. 目标 (Objectives)

实现AI四大卖点展示模块,通过可交互Demo展示产品核心价值。

- [ ] AI诊断报告热力图展示
- [ ] 错题讲解视频Demo
- [ ] 知识图谱Canvas可视化
- [ ] 自适应学习路径SVG动画
- [ ] 实现滚动视差效果(60fps)
- [ ] 所有Demo可交互

---

## 2. 技术方案 (Technical Plan)

### 组件结构
```
src/components/landing/
├── AIFeaturesSection.tsx (主容器)
├── DiagnosticsHeatmap.tsx (诊断热力图)
├── VideoTutorDemo.tsx (错题讲解Demo)
├── KnowledgeGraph.tsx (知识图谱)
└── AdaptivePathAnimation.tsx (自适应路径)
```

### 技术栈
- **热力图**: Recharts HeatmapChart
- **知识图谱**: React Flow 或 D3.js
- **SVG动画**: Framer Motion
- **滚动视差**: react-scroll-parallax 或 gsap

### 关键实现

**诊断报告热力图**:
```typescript
import { ResponsiveHeatMap } from '@nivo/heatmap';

const mockData = [
  { id: '代数', data: [{ x: '一次函数', y: 85 }, { x: '二次函数', y: 62 }] },
  { id: '几何', data: [{ x: '三角形', y: 92 }, { x: '圆', y: 78 }] },
];
```

**知识图谱可视化**:
```typescript
import ReactFlow from 'reactflow';

const nodes = [
  { id: '1', data: { label: '一次函数' }, position: { x: 0, y: 0 } },
  { id: '2', data: { label: '二次函数' }, position: { x: 200, y: 0 } },
];

const edges = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
];
```

---

## 3. 验收标准

- [ ] 热力图显示正常,颜色渐变符合设计
- [ ] 视频Demo可以播放(Mock视频)
- [ ] 知识图谱支持拖拽缩放
- [ ] 滚动视差效果流畅(60fps)
- [ ] 移动端所有Demo自动降级为静态图片

---

## 4. 交付物

- `src/components/landing/AIFeaturesSection.tsx`
- `src/components/landing/DiagnosticsHeatmap.tsx`
- `src/components/landing/VideoTutorDemo.tsx`
- `src/components/landing/KnowledgeGraph.tsx`
- `src/components/landing/AdaptivePathAnimation.tsx`
- Mock数据文件: `src/lib/mock/ai-features.ts`

---

**创建时间**: 2025-12-16
