# Story-026: Landing Page 基础框架与Hero区

**状态**: Backlog ⚪
**优先级**: P0 (Critical - Phase 7核心)
**预计工时**: 6-8小时
**前置依赖**: Story-021~025 (UI定稿完成)
**阻塞Story**: Story-027, Story-028

---

## 1. 目标 (Objectives)

将Phase 6定稿的Landing Page打通后端功能,实现完整的营销转化流程。

- [ ] 搭建响应式Landing Page基础框架
- [ ] 实现Hero区域的动画和交互
- [ ] 打通注册登录功能(集成Supabase Auth)
- [ ] 实现Navbar的交互逻辑
- [ ] 创建Footer组件并填充内容
- [ ] 优化首屏性能(LCP < 1.5s, CLS < 0.1)

---

## 2. 技术方案 (Technical Plan)

### 架构设计

**页面路由**: `src/app/page.tsx` (Landing Page)

**组件拆分策略**:
```
src/
├── app/
│   └── page.tsx (Server Component - Landing Page)
├── components/
│   └── landing/
│       ├── HeroSection.tsx (Client Component - 动画)
│       ├── LandingNavbar.tsx (Client Component - 交互)
│       ├── LandingFooter.tsx (Server Component)
│       ├── CTAButton.tsx (Client Component)
│       └── AnimatedBackground.tsx (Client Component)
```

### Step 1: Landing Page布局框架

**目标**: 创建Marketing专用布局(不同于Dashboard布局)

```typescript
// src/app/page.tsx
import { HeroSection } from '@/components/landing/HeroSection';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      <LandingNavbar />
      <main>
        <HeroSection />
        {/* 后续Story会添加更多Section */}
      </main>
      <LandingFooter />
    </div>
  );
}
```

### Step 2: Navbar实现

**功能要求**:
- 滚动时背景变透明 → 不透明(Glassmorphism效果)
- Logo点击回到顶部
- "登录"按钮跳转到 `/login`
- "免费试用"按钮跳转到 `/register`
- 移动端汉堡菜单

```typescript
// src/components/landing/LandingNavbar.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled
        ? 'bg-slate-900/80 backdrop-blur-md border-b border-white/10'
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-white">
            LearnMore
          </Link>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost">登录</Button>
            </Link>
            <Link href="/register">
              <Button>免费试用</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
```

### Step 3: Hero Section实现

**设计要求**:
- 大标题 + 副标题 + CTA按钮
- 背景动画(粒子效果或渐变动画)
- 首屏LCP < 1.5s

```typescript
// src/components/landing/HeroSection.tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { AnimatedBackground } from './AnimatedBackground';

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4">
      <AnimatedBackground />

      <div className="relative z-10 max-w-7xl mx-auto text-center">
        <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tight mb-8 leading-tight">
          <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            AI驱动的
          </span>
          <br />
          中学生学习平台
        </h1>

        <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-300 mb-10">
          诊断薄弱点 · 自适应路径 · 错题视频讲解 · 游戏化激励
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register">
            <Button size="lg" className="text-lg px-8 py-6">
              开始免费试用
              <ArrowRight className="ml-2" />
            </Button>
          </Link>
          <Link href="#features">
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              了解更多
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
```

### Step 4: 背景动画实现

使用CSS动画或Canvas实现粒子效果:

```typescript
// src/components/landing/AnimatedBackground.tsx
'use client';

export function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute -inset-[10px] opacity-50">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000" />
      </div>
    </div>
  );
}
```

### Step 5: Footer实现

```typescript
// src/components/landing/LandingFooter.tsx
import Link from 'next/link';

export function LandingFooter() {
  return (
    <footer className="bg-slate-950 border-t border-white/10 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">LearnMore</h3>
            <p className="text-slate-400 text-sm">
              AI驱动的中学生智能学习平台
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">产品</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="#features">功能介绍</Link></li>
              <li><Link href="#pricing">价格方案</Link></li>
              <li><Link href="#subjects">学科覆盖</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">支持</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/help">帮助中心</Link></li>
              <li><Link href="/contact">联系我们</Link></li>
              <li><Link href="/privacy">隐私政策</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">关注我们</h4>
            <div className="flex gap-4">
              {/* 社交媒体图标 */}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-slate-400">
          © 2025 LearnMore. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
```

### Step 6: 性能优化

**目标**:
- LCP (Largest Contentful Paint) < 1.5s
- CLS (Cumulative Layout Shift) < 0.1
- FID (First Input Delay) < 100ms

**优化措施**:
1. 使用Next.js Image组件优化图片加载
2. Hero区使用CSS动画而非JS动画
3. 关键CSS内联,非关键CSS延迟加载
4. 预连接关键第三方域名
5. 使用font-display: swap避免FOIT

```typescript
// next.config.js
module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};
```

---

## 3. 测试验收 (Test & Acceptance)

### 功能验收
- [ ] 访问 `http://localhost:3000` 可以看到Landing Page
- [ ] Navbar在滚动时背景透明度变化正常
- [ ] 点击"登录"按钮跳转到 `/login`
- [ ] 点击"免费试用"跳转到 `/register`
- [ ] Hero区标题渐变效果正常显示
- [ ] 背景动画流畅运行(60fps)
- [ ] Footer链接可以正常点击

### 响应式验收
- [ ] Desktop (1920x1080): Hero区居中,CTA按钮横向排列
- [ ] Tablet (768x1024): Hero区标题缩小,布局正常
- [ ] Mobile (375x667): CTA按钮垂直堆叠,Navbar显示汉堡菜单

### 性能验收
- [ ] Lighthouse Performance > 90
- [ ] LCP < 1.5s
- [ ] CLS < 0.1
- [ ] FID < 100ms

---

## 4. 交付物 (Deliverables)

### 页面文件
- `src/app/page.tsx` - Landing Page主文件

### 组件文件
- `src/components/landing/HeroSection.tsx`
- `src/components/landing/LandingNavbar.tsx`
- `src/components/landing/LandingFooter.tsx`
- `src/components/landing/AnimatedBackground.tsx`
- `src/components/landing/CTAButton.tsx`

### 配置文件
- `next.config.js` - 图片优化配置

---

## 5. Definition of Done (DoD)

- [ ] 所有Objectives已完成
- [ ] 所有Verification测试通过
- [ ] 所有Deliverables已交付
- [ ] 质量检查命令通过: `pnpm lint && pnpm tsc --noEmit && pnpm build`
- [ ] Lighthouse Performance > 90, SEO > 95
- [ ] 代码已commit并push到GitHub
- [ ] 已更新 `docs/memory-bank/active_context.md`
- [ ] 已更新 `docs/memory-bank/roadmap.md`

---

## 6. 回滚预案 (Rollback Plan)

- **代码回滚**: `git revert <commit-hash>`
- **功能开关**: 可以通过环境变量 `NEXT_PUBLIC_ENABLE_LANDING_PAGE` 控制是否显示新Landing Page
- **降级方案**: 保留旧版Landing Page作为备份路由

---

## 7. 注意事项

### ⚠️ 重要提醒

1. **性能优先**: Landing Page是用户第一印象,必须确保首屏加载速度
2. **SEO友好**: 使用语义化HTML,添加正确的meta标签
3. **A/B测试准备**: 预留埋点位置,为后续A/B测试做准备
4. **移动端优先**: 50%+用户来自移动端,优先保证移动端体验

### 🔧 常见问题解决

**问题1**: 背景动画导致性能下降
**解决方案**: 使用CSS transform和opacity动画(GPU加速),避免使用width/height/top/left

**问题2**: Hero区首屏白屏时间长
**解决方案**: 使用骨架屏或渐进式渲染,关键内容优先加载

---

## 8. 时间记录

- **预计**: 6-8小时
- **实际**: _待填写_
- **差异原因**: _待填写_

---

## 9. 遇到的坑与解决方案

_开发过程中遇到的问题和解决方案,完成后填写_

---

**创建时间**: 2025-12-16
**最后更新**: 2025-12-16
