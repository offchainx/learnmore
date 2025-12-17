# Story-029: 定价表与科目展示模块

**状态**: Backlog ⚪
**优先级**: P0
**预计工时**: 4-6小时
**前置依赖**: Story-026
**阻塞Story**: Story-030

---

## 1. 目标

- [ ] 三档定价对比表(免费/标准/高级)
- [ ] 价格锚点对比(突出中档套餐)
- [ ] 限时倒计时组件
- [ ] 六大学科展示网格
- [ ] 学科卡片Hover效果

---

## 2. 技术方案

### 组件结构
```
src/components/landing/
├── PricingSection.tsx
├── PricingCard.tsx
├── CountdownTimer.tsx
├── SubjectsGrid.tsx
└── SubjectCard.tsx
```

### 定价表设计
```typescript
const pricingPlans = [
  { name: '免费版', price: 0, features: ['3题/天', '基础学科', '社区'] },
  { name: '标准版', price: 99, features: ['无限题', 'AI诊断', '家长看板'], recommended: true },
  { name: '高级版', price: 199, features: ['全部功能', 'AI视频', '1对1辅导'] },
];
```

---

## 3. 验收标准

- [ ] 定价表移动端垂直堆叠
- [ ] 推荐套餐有明显高亮标识
- [ ] 倒计时准确显示剩余时间
- [ ] 科目卡片Hover动画流畅

---

**创建时间**: 2025-12-16
