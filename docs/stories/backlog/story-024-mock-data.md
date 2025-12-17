# Story-023: UI整合与Mock数据完善 (UI Integration & Mock Data)

**状态**: Backlog ⚪
**优先级**: P0 (Critical)
**预计工时**: 6-8小时
**前置依赖**: Story-021, Story-022 (AI Studio 生成的代码)
**阻塞Story**: Story-024

---

## 1. 目标 (Objectives)

本 Story 的核心目标是将 Story-022 中由 AI Studio 生成的高保真 UI 代码（特别是 Landing Page）工程化地整合到 Next.js 项目中，并用结构化的 Mock 数据填充，解决代码质量问题。

- [ ] **UI 整合**: 将 `ai_studio_iterations/` 下的 Landing Page 代码迁移至 `src/app/page.tsx`。
- [ ] **代码重构**: 解决 AI 生成代码的质量问题（大文件拆分、内联样式移除、路由迁移）。
- [ ] **性能优化**: 替换 `<img>` 为 `next/image`，优化动画实现。
- [ ] **Mock 完善**: 创建结构化的 Mock 数据库，替换硬编码的文本和数据。

---

## 2. 技术方案 (Tech Plan)

### Step 1: Landing Page 重构 (Refactoring)

AI Studio 生成的代码通常是单文件、基于 Vite 的 React 代码。我们需要将其“Next.js 化”。

1.  **组件拆分**: 将 `LandingPage.tsx` 拆分为独立组件，存放在 `src/components/landing/`：
    *   `HeroSection.tsx`
    *   `PainPointsSection.tsx`
    *   `FeaturesSection.tsx`
    *   `ComparisonSection.tsx`
    *   `TestimonialsSection.tsx`
    *   `CTASection.tsx`
2.  **路由迁移**:
    *   查找所有 `useNavigate`，替换为 `useRouter` (from `next/navigation`)。
    *   查找所有 `<Button onClick={() => navigate(...)`，替换为 `<Link href="...">`。
3.  **样式优化**:
    *   移除 JSX 中的 `<style>` 标签（动画关键帧）。
    *   将 `@keyframes` 移动到 `tailwind.config.ts` 或 `src/app/globals.css`。
4.  **图片优化**:
    *   查找所有 `<img>` 标签。
    *   替换为 `<Image />` 组件，并配置 `width`, `height` 或 `fill` 属性。
    *   确保 `next.config.ts` 允许了外部图片域名（如 `images.unsplash.com`）。

### Step 2: 建立 Mock 数据库 (Mock Database)

将页面中散落的硬编码数据提取到统一的 Mock 文件中。

```typescript
// src/lib/mock/index.ts (统一出口)
export * from './user';
export * from './landing';
export * from './dashboard';

// src/lib/mock/landing.ts (Landing Page 数据)
export const landingContent = {
  hero: { ... },
  testimonials: [ ... ],
  features: [ ... ]
};
```

### Step 3: 数据绑定 (Data Binding)

修改组件以接收 props 或直接引入 Mock 数据，替代硬编码文本。

```typescript
// src/components/landing/TestimonialsSection.tsx
import { landingContent } from '@/lib/mock';

export const TestimonialsSection = () => {
  const { testimonials } = landingContent;
  return (
    // ... map over testimonials
  );
};
```

### Step 4: 质量检查 (QA)

```bash
pnpm lint      # 确保无 ESLint 错误
pnpm build     # 确保生产构建成功
```

---

## 3. 验收标准 (Verification)

- [ ] **Landing Page**: 访问 `/`，页面视觉与 AI Studio 设计一致，且无控制台错误。
- [ ] **性能**: Lighthouse 跑分中 LCP (Largest Contentful Paint) 正常（得益于 Image 组件）。
- [ ] **交互**: 所有按钮（Login, Register, CTA）均能正确跳转。
- [ ] **代码**: `src/app/page.tsx` 代码行数大幅减少（< 100行），逻辑清晰。

---

## 4. 交付物 (Deliverables)

- `src/components/landing/*` - 拆分后的 Landing Page 组件
- `src/lib/mock/*` - 完整的 Mock 数据文件
- 更新后的 `src/app/page.tsx`
- 更新后的 `tailwind.config.ts` (如有动画配置)

---

## 5. Definition of Done

- [ ] 所有 Objectives 已完成
- [ ] 代码通过 Lint 和 Build 检查
- [ ] 无任何 `any` 类型（除非是显式豁免的 Mock 数据）
- [ ] 文档已更新

---

**更新时间**: 2025-12-13