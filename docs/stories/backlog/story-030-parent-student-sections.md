# Story-028: 家长价值区 + 学生娱乐区

**状态**: Backlog ⚪
**优先级**: P0
**预计工时**: 6-8小时
**前置依赖**: Story-026
**阻塞Story**: Story-029

---

## 1. 目标

- [ ] 家长痛点对照表(痛点 vs 解决方案)
- [ ] Dashboard预览组件(展示监管界面)
- [ ] 证言轮播(家长/学生评价)
- [ ] 段位系统卡片展示
- [ ] PK对战Demo(1v1实时对战演示)

---

## 2. 技术方案

### 组件结构
```
src/components/landing/
├── ParentValueSection.tsx
├── StudentGameSection.tsx
├── TestimonialCarousel.tsx (轮播)
├── RankSystemShowcase.tsx
└── PKBattleDemo.tsx
```

### 关键技术
- 轮播: Swiper.js 或 Embla Carousel
- PK动画: Framer Motion
- 响应式: 移动端堆叠布局

---

## 3. 验收标准

- [ ] 痛点对照表响应式正常
- [ ] 轮播支持手势滑动(移动端)
- [ ] PK Demo自动播放动画
- [ ] 段位徽章渐变效果正常

---

**创建时间**: 2025-12-16
