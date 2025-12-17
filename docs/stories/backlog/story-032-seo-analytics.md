# Story-030: Landing Page SEO与数据埋点

**状态**: Backlog ⚪
**优先级**: P1
**预计工时**: 4-6小时
**前置依赖**: Story-026~029
**阻塞Story**: None

---

## 1. 目标

- [ ] Next.js Metadata配置
- [ ] Schema.org结构化数据
- [ ] GA4事件埋点
- [ ] Hotjar热力图集成
- [ ] Sitemap和robots.txt配置
- [ ] Open Graph图片生成

---

## 2. 技术方案

### Next.js Metadata API
```typescript
// src/app/page.tsx
export const metadata = {
  title: 'LearnMore - AI驱动的中学生智能学习平台',
  description: '诊断薄弱点、自适应路径、错题视频讲解、游戏化激励',
  keywords: ['中学生学习', 'AI教育', '在线学习'],
  openGraph: {
    title: 'LearnMore - AI智能学习平台',
    description: '让学习更高效,让进步看得见',
    images: ['/og-image.png'],
  },
};
```

### Schema.org结构化数据
```typescript
const ldJson = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'LearnMore',
  description: 'AI驱动的中学生智能学习平台',
  url: 'https://learnmore.com',
  courseMode: 'online',
};
```

### GA4事件埋点
```typescript
// 关键事件
- page_view (页面浏览)
- cta_click (CTA按钮点击)
- pricing_view (定价表曝光)
- feature_demo_interact (功能Demo交互)
```

---

## 3. 验收标准

- [ ] Lighthouse SEO > 95
- [ ] Lighthouse Performance > 90
- [ ] Core Web Vitals全部达标
- [ ] GA4事件正常触发
- [ ] sitemap.xml可访问

---

**创建时间**: 2025-12-16
