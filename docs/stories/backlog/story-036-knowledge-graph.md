# Story-034: 知识图谱可视化

**状态**: Backlog ⚪
**优先级**: P1
**预计工时**: 10-12小时
**前置依赖**: Story-006 (课程目录树)
**技术难度**: 🔴 High

---

## 1. 目标

可视化章节依赖关系,实现"迷雾地图"和"AI自适应学习路径"。

- [ ] 章节依赖关系图谱可视化
- [ ] 迷雾模式(未解锁章节灰显)
- [ ] AI推荐最优学习路径
- [ ] 支持拖拽缩放交互
- [ ] 粒子特效(完成章节解锁动画)

---

## 2. 技术方案

### 技术栈
- **图谱可视化**: React Flow 或 Cytoscape.js
- **粒子特效**: Three.js 或 Canvas API
- **路径算法**: Dijkstra最短路径算法
- **AI推荐**: Gemini API分析薄弱点,推荐路径

### 数据结构
```typescript
// Prisma Schema扩展
model Chapter {
  id            String    @id
  prerequisites String[]  // 前置章节ID数组
  difficultyLevel Int     @default(1) // 1-5难度
}

// 图谱节点
interface GraphNode {
  id: string;
  label: string;
  position: { x: number; y: number };
  isUnlocked: boolean; // 是否已解锁
  progress: number; // 完成度 0-100
}

// 图谱边
interface GraphEdge {
  id: string;
  source: string; // 前置章节
  target: string; // 当前章节
  type: 'prerequisite' | 'recommended';
}
```

### React Flow实现
```typescript
// src/components/knowledge-graph/KnowledgeGraph.tsx
'use client';

import ReactFlow, { Background, Controls } from 'reactflow';
import { useEffect, useState } from 'react';

export function KnowledgeGraph({ subjectId }) {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);

  useEffect(() => {
    // 加载章节数据并构建图谱
    loadGraphData(subjectId).then(data => {
      setNodes(data.nodes);
      setEdges(data.edges);
    });
  }, [subjectId]);

  return (
    <div style={{ height: '600px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        nodeTypes={{ custom: CustomChapterNode }}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
```

### 自定义节点样式
```typescript
const CustomChapterNode = ({ data }) => {
  const isLocked = !data.isUnlocked;

  return (
    <div className={`
      p-4 rounded-lg border-2
      ${isLocked ? 'bg-slate-700 border-slate-600 opacity-50' : 'bg-blue-500 border-blue-300'}
    `}>
      {isLocked && <Lock className="w-4 h-4" />}
      <p>{data.label}</p>
      <ProgressBar value={data.progress} />
    </div>
  );
};
```

### AI最优路径推荐
```typescript
// src/actions/recommend-path.ts
'use server';

export async function recommendLearningPath(userId: string, subjectId: string) {
  // 1. 获取用户薄弱知识点
  const weakPoints = await getWeakPoints(userId, subjectId);

  // 2. Gemini API分析最优路径
  const prompt = `
    学生薄弱点: ${weakPoints.join(', ')}
    所有章节: ${JSON.stringify(allChapters)}

    请推荐最优学习路径(3-5个章节),优先补强薄弱点,同时考虑前置依赖。
    返回JSON: { "path": ["chapter-id-1", "chapter-id-2", ...], "reason": "..." }
  `;

  const result = await geminiAPI.generate(prompt);
  return JSON.parse(result);
}
```

### 解锁动画
```typescript
// 使用Canvas实现粒子爆炸效果
const unlockAnimation = (nodeId) => {
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');

  // 生成100个粒子
  const particles = Array.from({ length: 100 }, () => ({
    x: nodeX,
    y: nodeY,
    vx: Math.random() * 4 - 2,
    vy: Math.random() * 4 - 2,
    life: 60,
  }));

  // 动画循环
  function animate() {
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      ctx.fillStyle = `rgba(59, 130, 246, ${p.life / 60})`;
      ctx.fillRect(p.x, p.y, 3, 3);
    });
    if (particles.some(p => p.life > 0)) requestAnimationFrame(animate);
  }

  animate();
};
```

---

## 3. 迷雾地图逻辑

**规则**:
- 完成所有前置章节 → 解锁当前章节
- 未解锁章节显示为灰色 + 锁图标
- 点击已解锁章节 → 跳转到学习页面
- 点击未解锁章节 → 提示"请先完成前置章节"

---

## 4. 性能优化

- **虚拟化渲染**: 章节数 > 100时,只渲染可视区域
- **节点位置缓存**: 使用Dagre算法预计算布局,缓存到数据库
- **懒加载**: 初次渲染仅加载第一层节点,展开时动态加载子节点

---

## 5. 验收标准

- [ ] 图谱渲染性能 > 60fps (500个节点)
- [ ] 路径推荐准确率 > 85% (人工评估)
- [ ] 迷雾模式逻辑正确(无误解锁)
- [ ] 拖拽/缩放交互流畅
- [ ] 解锁动画效果炫酷

---

## 6. 交付物

- `src/components/knowledge-graph/KnowledgeGraph.tsx`
- `src/components/knowledge-graph/CustomChapterNode.tsx`
- `src/actions/recommend-path.ts`
- `src/lib/graph/layout-algorithm.ts` (Dagre布局)
- `src/lib/graph/path-finder.ts` (Dijkstra算法)
- Prisma Migration (prerequisites字段)

---

**创建时间**: 2025-12-16
