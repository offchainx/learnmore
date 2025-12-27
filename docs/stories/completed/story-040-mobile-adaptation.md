# Story-040: Mobile Adaptation Polish

**状态**: In Progress 🟡
**优先级**: P1 (High)
**预估工时**: 34-44小时 (约4-5个工作日)
**前置依赖**: Story-001 至 Story-039 (所有核心功能完成)
**负责角色**: Full-Stack Developer (具备移动端开发经验)

---

## 1. 目标与业务价值

### 1.1 核心业务目标 (SMART原则)

| 业务指标 | 当前基线 | 目标值 | 测量方式 | 达成时间 |
|---------|---------|-------|---------|---------|
| 移动端DAU占比 | 30% | 60% | Google Analytics | 发布后30天 |
| 移动端跳出率 | 45% | <25% | GA Bounce Rate | 发布后14天 |
| PWA安装转化率 | 0% | 15% | Custom Event Tracking | 发布后60天 |
| 移动端用户留存率 | 40% | >65% | 7日留存率 | 发布后30天 |

### 1.2 技术目标

- **响应式断点完善**: 支持 320px~428px 所有主流移动设备
- **触摸手势系统**: 实现滑动、下拉刷新、长按等标准手势
- **PWA离线能力**: 核心页面支持离线访问,Service Worker缓存优化
- **性能达标**:
  - First Contentful Paint (FCP) < 1.5s
  - Largest Contentful Paint (LCP) < 2.5s
  - Cumulative Layout Shift (CLS) < 0.1
  - Touch Response Time < 100ms

### 1.3 用户体验目标

- 中学生用户能够**流畅地在手机上学习课程**,无需缩放页面
- **单手操作**核心功能(底部导航、滑动切换)
- **弱网环境**下(地铁/电梯)仍能访问已缓存内容
- **添加到主屏幕**后获得接近原生App的体验

---

## 2. 技术实施方案

### Phase 1: 响应式布局重构 (6-8小时)

#### 🎯 目标
建立完整的移动端断点系统,确保所有页面在320px~428px设备上正确显示。

#### 📋 任务清单

**Task 1.1: Tailwind断点系统配置**

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  theme: {
    extend: {
      screens: {
        'xs': '320px',   // iPhone SE (最小支持设备)
        'sm': '375px',   // iPhone 12/13 Mini
        'md': '390px',   // iPhone 14 Pro (标准尺寸)
        'lg': '414px',   // iPhone 14 Pro Max
        'xl': '428px',   // iPhone 14 Plus (最大移动端)
        'tablet': '768px',
        'desktop': '1024px',
      },
      // 移动端专用间距系统
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
    },
  },
}

export default config
```

**Task 1.2: 核心组件移动端适配**

需要适配的组件优先级列表:

| 组件 | 桌面端形态 | 移动端形态 | 优先级 | 预估工时 |
|-----|----------|----------|-------|---------|
| Navigation Bar | 顶部横向导航 | 底部Tab Bar | P0 | 2h |
| Sidebar | 左侧固定侧边栏 | 左滑抽屉(Drawer) | P0 | 1.5h |
| Course List | Grid布局(3列) | 单列Card布局 | P0 | 1h |
| Data Table | 多列表格 | Card List + 滚动 | P1 | 2h |
| Forms | 横向布局 | 纵向堆叠 | P0 | 1.5h |

**实现示例 - 底部Tab Bar**:

```tsx
// components/mobile/BottomTabBar.tsx
'use client'

import { Home, BookOpen, Edit, MessageCircle, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const tabs = [
  { id: 'home', icon: Home, label: '首页', path: '/' },
  { id: 'courses', icon: BookOpen, label: '课程', path: '/courses' },
  { id: 'practice', icon: Edit, label: '练习', path: '/practice' },
  { id: 'community', icon: MessageCircle, label: '社区', path: '/community' },
  { id: 'profile', icon: User, label: '我的', path: '/profile' },
]

export function BottomTabBar() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50
                 bg-background/95 backdrop-blur-sm
                 border-t border-border
                 pb-safe-bottom
                 md:hidden"
      role="navigation"
      aria-label="主导航"
    >
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive = pathname === tab.path
          const Icon = tab.icon

          return (
            <Link
              key={tab.id}
              href={tab.path}
              className={cn(
                'flex flex-col items-center justify-center gap-1',
                'w-full h-full transition-all duration-200',
                'active:scale-95', // 按压反馈
                isActive && 'text-primary',
                !isActive && 'text-muted-foreground'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                className={cn(
                  'w-5 h-5 transition-transform',
                  isActive && 'scale-110'
                )}
              />
              <span className="text-xs font-medium">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
```

**Task 1.3: Touch Target Size标准化**

遵循 Apple HIG 和 Material Design 指南:

```css
/* globals.css - 移动端触摸目标最小尺寸 */
@media (max-width: 768px) {
  /* 所有可点击元素最小44x44px (Apple HIG) */
  button,
  a,
  [role="button"],
  input[type="checkbox"],
  input[type="radio"] {
    min-height: 44px;
    min-width: 44px;
  }

  /* 表单输入框 */
  input,
  textarea,
  select {
    min-height: 44px;
    font-size: 16px; /* 防止iOS自动缩放 */
  }
}
```

**Task 1.4: Safe Area Insets处理**

```tsx
// app/layout.tsx - 添加viewport meta
export const metadata: Metadata = {
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover', // 关键:支持刘海屏/药丸屏
  },
}
```

```css
/* globals.css - Safe Area支持 */
:root {
  --safe-area-inset-top: env(safe-area-inset-top, 0px);
  --safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
  --safe-area-inset-left: env(safe-area-inset-left, 0px);
  --safe-area-inset-right: env(safe-area-inset-right, 0px);
}

/* 底部导航栏适配刘海屏 */
.bottom-nav {
  padding-bottom: max(1rem, var(--safe-area-inset-bottom));
}
```

---

### Phase 2: 触摸手势系统 (8-10小时)

#### 🎯 目标
实现符合移动端交互习惯的手势操作,提升用户体验。

#### 📦 依赖安装

```bash
pnpm add react-use-gesture@^10.3.1
pnpm add framer-motion@^11.0.0
pnpm add react-zoom-pan-pinch@^3.4.0
```

#### 📋 核心手势实现

**Task 2.1: 课程章节左右滑动切换**

```tsx
// components/course/LessonSwipeView.tsx
'use client'

import { useGesture } from '@use-gesture/react'
import { useSpring, animated } from '@react-spring/web'
import { useState } from 'react'

interface LessonSwipeViewProps {
  currentChapterIndex: number
  totalChapters: number
  onNavigate: (direction: 'prev' | 'next') => void
  children: React.ReactNode
}

export function LessonSwipeView({
  currentChapterIndex,
  totalChapters,
  onNavigate,
  children,
}: LessonSwipeViewProps) {
  const [{ x }, api] = useSpring(() => ({ x: 0 }))

  const bind = useGesture({
    onDrag: ({ down, movement: [mx], direction: [xDir], cancel }) => {
      // 边界检测
      if (currentChapterIndex === 0 && xDir > 0) {
        cancel() // 已经是第一章,禁止右滑
      }
      if (currentChapterIndex === totalChapters - 1 && xDir < 0) {
        cancel() // 已经是最后一章,禁止左滑
      }

      if (down) {
        api.start({ x: mx, immediate: true })
      } else {
        // 释放时判断是否触发切换 (滑动距离>50px 或 速度>0.3)
        if (Math.abs(mx) > 50) {
          if (xDir > 0 && currentChapterIndex > 0) {
            onNavigate('prev')
          } else if (xDir < 0 && currentChapterIndex < totalChapters - 1) {
            onNavigate('next')
          }
        }
        api.start({ x: 0 }) // 回弹
      }
    },
  })

  return (
    <animated.div
      {...bind()}
      style={{ x, touchAction: 'pan-y' }} // 只允许垂直滚动
      className="w-full h-full"
    >
      {children}
    </animated.div>
  )
}
```

**Task 2.2: 下拉刷新 (Pull-to-Refresh)**

```tsx
// hooks/usePullToRefresh.ts
'use client'

import { useGesture } from '@use-gesture/react'
import { useSpring, animated } from '@react-spring/web'
import { useState } from 'react'

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>
  threshold?: number
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
}: UsePullToRefreshOptions) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [{ y }, api] = useSpring(() => ({ y: 0 }))

  const bind = useGesture({
    onDrag: async ({ down, movement: [, my], memo = y.get() }) => {
      // 只在页面顶部时允许下拉
      if (window.scrollY > 0) return memo

      if (down) {
        // 下拉时增加阻尼效果
        const dampedY = my * 0.5
        api.start({ y: Math.max(0, dampedY), immediate: true })
      } else {
        // 释放
        if (memo > threshold && !isRefreshing) {
          setIsRefreshing(true)
          await onRefresh()
          setIsRefreshing(false)
        }
        api.start({ y: 0 })
      }
      return memo
    },
  })

  return { bind, y, isRefreshing }
}

// 使用示例
export function CourseList() {
  const { bind, y, isRefreshing } = usePullToRefresh({
    onRefresh: async () => {
      await fetch('/api/courses').then((res) => res.json())
    },
  })

  return (
    <animated.div
      {...bind()}
      style={{ y }}
      className="min-h-screen"
    >
      {isRefreshing && <RefreshSpinner />}
      {/* 课程列表内容 */}
    </animated.div>
  )
}
```

**Task 2.3: 长按操作菜单**

```tsx
// components/ui/LongPressMenu.tsx
'use client'

import { useGesture } from '@use-gesture/react'
import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu'

interface LongPressMenuProps {
  children: React.ReactNode
  onFavorite: () => void
  onShare: () => void
  onReport: () => void
}

export function LongPressMenu({
  children,
  onFavorite,
  onShare,
  onReport,
}: LongPressMenuProps) {
  const [open, setOpen] = useState(false)

  const bind = useGesture({
    onContextMenu: (e) => {
      e.preventDefault() // 阻止默认右键菜单
      setOpen(true)
    },
    onPointerDown: ({ event }) => {
      // 长按500ms触发
      const timer = setTimeout(() => {
        if ('vibrate' in navigator) {
          navigator.vibrate(50) // 触觉反馈
        }
        setOpen(true)
      }, 500)

      event.addEventListener('pointerup', () => clearTimeout(timer), {
        once: true,
      })
    },
  })

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <div {...bind()}>{children}</div>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={onFavorite}>
          ⭐ 收藏题目
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onShare}>
          🔗 分享链接
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onReport}>
          🚩 举报内容
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

**Task 2.4: 图片/公式捏合缩放**

```tsx
// components/ui/PinchZoomImage.tsx
'use client'

import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import Image from 'next/image'

interface PinchZoomImageProps {
  src: string
  alt: string
  width: number
  height: number
}

export function PinchZoomImage({ src, alt, width, height }: PinchZoomImageProps) {
  return (
    <TransformWrapper
      initialScale={1}
      minScale={1}
      maxScale={4}
      doubleClick={{ mode: 'toggle' }}
    >
      <TransformComponent>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="object-contain"
        />
      </TransformComponent>
    </TransformWrapper>
  )
}
```

---

### Phase 3: PWA能力构建 (10-12小时)

#### 🎯 目标
将平台改造为 Progressive Web App,支持离线访问、主屏幕安装、推送通知。

#### 📦 依赖安装

```bash
pnpm add next-pwa@^5.6.0
pnpm add -D webpack@^5.90.0
```

#### 📋 实施步骤

**Task 3.1: Next.js PWA配置**

```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // 开发环境禁用
  runtimeCaching: [
    // 字体缓存 (Cache First)
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1年
        },
      },
    },
    // 静态资源缓存
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-images',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30天
        },
      },
    },
    // API数据缓存 (Network First)
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'supabase-api',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60, // 1天
        },
        networkTimeoutSeconds: 10,
      },
    },
    // 课程视频缓存 (Supabase Storage)
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'course-videos',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7天
        },
      },
    },
    // 页面HTML缓存 (Network First)
    {
      urlPattern: /^https?:\/\/localhost:3000\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages',
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 24 * 60 * 60,
        },
      },
    },
  ],
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 其他配置...
}

module.exports = withPWA(nextConfig)
```

**Task 3.2: Web App Manifest配置**

```json
// public/manifest.json
{
  "name": "LearnMore - 中学生在线教育平台",
  "short_name": "LearnMore",
  "description": "专为中学生设计的在线教育平台,涵盖数学、物理、化学、英语、语文、生物六大学科",
  "theme_color": "#3b82f6",
  "background_color": "#ffffff",
  "display": "standalone",
  "orientation": "portrait",
  "scope": "/",
  "start_url": "/?source=pwa",
  "categories": ["education", "learning"],
  "lang": "zh-CN",
  "dir": "ltr",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/home.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "首页 - 课程概览"
    },
    {
      "src": "/screenshots/course.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "课程详情页"
    }
  ],
  "shortcuts": [
    {
      "name": "我的课程",
      "short_name": "课程",
      "description": "直接访问我的课程列表",
      "url": "/courses?source=pwa-shortcut",
      "icons": [
        {
          "src": "/icons/shortcut-courses.png",
          "sizes": "96x96"
        }
      ]
    },
    {
      "name": "错题本",
      "short_name": "错题",
      "description": "查看我的错题集",
      "url": "/error-book?source=pwa-shortcut",
      "icons": [
        {
          "src": "/icons/shortcut-errors.png",
          "sizes": "96x96"
        }
      ]
    }
  ]
}
```

**Task 3.3: 离线页面组件**

```tsx
// components/OfflineFallback.tsx
'use client'

import { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function OfflineFallback() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500/90 text-white p-3">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <WifiOff className="w-5 h-5" />
          <span className="text-sm font-medium">您当前处于离线状态</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
          className="text-yellow-500 bg-white hover:bg-gray-100"
        >
          重新加载
        </Button>
      </div>
    </div>
  )
}
```

```tsx
// app/layout.tsx - 添加离线提示
import { OfflineFallback } from '@/components/OfflineFallback'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <OfflineFallback />
        {children}
      </body>
    </html>
  )
}
```

**Task 3.4: PWA安装提示组件**

```tsx
// components/PWAInstallPrompt.tsx
'use client'

import { useEffect, useState } from 'react'
import { X, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)

      // 用户访问3次后显示安装提示
      const visitCount = parseInt(localStorage.getItem('visitCount') || '0')
      if (visitCount >= 3) {
        setShowPrompt(true)
      }
      localStorage.setItem('visitCount', (visitCount + 1).toString())
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('用户接受安装PWA')
    }

    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40
                    bg-gradient-to-r from-blue-600 to-blue-700
                    text-white rounded-lg shadow-2xl p-4
                    md:hidden">
      <button
        onClick={() => setShowPrompt(false)}
        className="absolute top-2 right-2 p-1"
        aria-label="关闭"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-start gap-3">
        <div className="bg-white/20 p-2 rounded-lg">
          <Download className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold mb-1">安装LearnMore到主屏幕</h3>
          <p className="text-sm text-white/90 mb-3">
            获得更快的访问速度和离线学习能力
          </p>
          <Button
            onClick={handleInstall}
            className="bg-white text-blue-600 hover:bg-gray-100"
            size="sm"
          >
            立即安装
          </Button>
        </div>
      </div>
    </div>
  )
}
```

**Task 3.5: 推送通知 (可选功能)**

```tsx
// lib/notifications.ts
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('此浏览器不支持通知')
    return false
  }

  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

export function sendLearningReminder(courseName: string) {
  if (Notification.permission === 'granted') {
    new Notification('学习提醒', {
      body: `别忘了今天的${courseName}课程!`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      vibrate: [200, 100, 200],
      data: {
        url: '/courses',
      },
    })
  }
}
```

---

### Phase 4: 移动端性能优化 (6-8小时)

#### 🎯 目标
确保移动端性能指标达到 Lighthouse Mobile Score ≥ 90。

#### 📋 优化清单

**Task 4.1: 图片优化**

```tsx
// 使用Next.js Image组件 + 响应式尺寸
import Image from 'next/image'

export function CourseCard({ course }) {
  return (
    <div className="rounded-lg overflow-hidden">
      <Image
        src={course.thumbnail}
        alt={course.title}
        width={375}
        height={211}
        sizes="(max-width: 768px) 100vw, 50vw"
        loading="lazy"
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..." // 生成的模糊占位符
        className="object-cover"
      />
    </div>
  )
}
```

**生成图片占位符脚本**:

```bash
# 使用plaiceholder生成模糊占位符
pnpm add plaiceholder sharp
```

```typescript
// scripts/generate-placeholders.ts
import { getPlaiceholder } from 'plaiceholder'
import fs from 'fs/promises'

async function generatePlaceholder(imagePath: string) {
  const buffer = await fs.readFile(imagePath)
  const { base64 } = await getPlaiceholder(buffer)
  return base64
}
```

**Task 4.2: 代码分割优化**

```tsx
// 动态导入重组件
import dynamic from 'next/dynamic'

// 视频播放器按需加载
const VideoPlayer = dynamic(
  () => import('@/components/VideoPlayer'),
  {
    loading: () => <VideoPlayerSkeleton />,
    ssr: false, // 仅客户端渲染
  }
)

// 富文本编辑器按需加载
const RichTextEditor = dynamic(
  () => import('@/components/RichTextEditor'),
  {
    loading: () => <EditorSkeleton />,
    ssr: false,
  }
)

// KaTeX数学公式按需加载
const MathRenderer = dynamic(
  () => import('@/components/MathRenderer'),
  {
    loading: () => <div className="animate-pulse bg-gray-200 h-8" />,
  }
)
```

**Task 4.3: 字体优化**

```typescript
// app/layout.tsx - 使用next/font优化
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // 字体加载期间使用系统字体
  preload: true,
  variable: '--font-inter',
})

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN" className={inter.variable}>
      <body>{children}</body>
    </html>
  )
}
```

**Task 4.4: Resource Hints优化**

```tsx
// app/layout.tsx - 添加预加载提示
export const metadata: Metadata = {
  // ...其他配置
  metadataBase: new URL('https://learnmore.vercel.app'),

  // DNS预解析
  other: {
    'dns-prefetch': 'https://*.supabase.co',
    'preconnect': 'https://fonts.googleapis.com',
  },
}
```

```tsx
// 关键资源预加载
import Head from 'next/head'

export function PreloadResources() {
  return (
    <Head>
      <link
        rel="preload"
        href="/fonts/inter-var.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      <link
        rel="preload"
        href="/api/courses"
        as="fetch"
        crossOrigin="anonymous"
      />
    </Head>
  )
}
```

**Task 4.5: 移动端网络优化**

```typescript
// lib/api-client.ts - 添加请求超时和重试
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = 8000
) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(id)
    return response
  } catch (error) {
    clearTimeout(id)
    throw error
  }
}

// 自动重试机制
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 3
) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetchWithTimeout(url, options)
    } catch (error) {
      if (i === retries - 1) throw error
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
}
```

---

### Phase 5: 兼容性测试与修复 (4-6小时)

#### 📋 测试矩阵

| 设备 | 操作系统 | 浏览器 | 分辨率 | 测试重点 |
|-----|---------|-------|--------|---------|
| iPhone SE | iOS 15+ | Safari | 320x568 | 最小宽度适配 |
| iPhone 13 | iOS 17+ | Safari + Chrome | 390x844 | 标准尺寸 + 刘海屏 |
| iPhone 14 Pro Max | iOS 17+ | Safari + WeChat | 428x926 | 大屏 + 药丸屏 + WebView |
| Samsung S21 | Android 12+ | Chrome | 360x800 | Android标准 |
| Xiaomi 12 | MIUI 13+ | 系统浏览器 | 393x851 | 国产ROM兼容性 |

#### 🔧 已知兼容性问题修复

**问题1: iOS Safari 300ms点击延迟**

```css
/* globals.css */
html {
  touch-action: manipulation; /* 禁用双击缩放,消除300ms延迟 */
}
```

**问题2: iOS输入框被键盘遮挡**

```typescript
// hooks/useKeyboardAvoid.ts
export function useKeyboardAvoid() {
  useEffect(() => {
    const handleFocus = (e: FocusEvent) => {
      if (e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement) {
        setTimeout(() => {
          e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 300)
      }
    }

    document.addEventListener('focus', handleFocus, true)
    return () => document.removeEventListener('focus', handleFocus, true)
  }, [])
}
```

**问题3: WeChat WebView适配**

```typescript
// lib/ua-detect.ts
export function isWeChatBrowser() {
  return /MicroMessenger/i.test(navigator.userAgent)
}

export function isIOSWechat() {
  return isWeChatBrowser() && /iPhone|iPad|iPod/i.test(navigator.userAgent)
}

// 使用示例
if (isIOSWechat()) {
  // iOS微信特殊处理
  document.body.classList.add('ios-wechat')
}
```

```css
/* WeChat特定样式修复 */
.ios-wechat input {
  /* 修复iOS微信输入框样式 */
  -webkit-appearance: none;
  border-radius: 0;
}
```

---

## 3. 验收标准 (Acceptance Criteria)

### 3.1 功能性验收 (Functional Requirements)

- [ ] **响应式布局**
  - 在 320px~428px 任意宽度下页面布局正确,无横向滚动条
  - 所有文字可读,无需缩放
  - 图片自适应容器宽度

- [ ] **底部导航栏**
  - 5个Tab均可正常切换页面
  - Active状态有明确视觉反馈(颜色+图标缩放)
  - 在刘海屏/药丸屏设备上正确显示在Safe Area内
  - 页面滚动时导航栏保持固定

- [ ] **触摸手势**
  - 课程详情页左右滑动切换章节成功率 > 95%
  - 课程列表下拉刷新延迟 < 200ms
  - 题目卡片长按500ms显示操作菜单
  - 图片/公式支持双指捏合缩放(1x~4x)

- [ ] **PWA功能**
  - Chrome/Safari显示"添加到主屏幕"提示
  - 安装后独立窗口打开(无浏览器UI)
  - 离线时核心页面可访问(显示缓存数据)
  - 离线时显示网络断开提示
  - Service Worker正确注册并缓存资源

- [ ] **性能指标**
  - Lighthouse Mobile Score ≥ 90 (Performance/Accessibility/Best Practices/SEO)
  - First Contentful Paint (FCP) < 1.5s
  - Largest Contentful Paint (LCP) < 2.5s
  - Cumulative Layout Shift (CLS) < 0.1
  - Touch Response Time < 100ms

### 3.2 非功能性验收 (Non-Functional Requirements)

- [ ] **兼容性**
  - iOS Safari 15+: 核心功能正常
  - Chrome iOS: 核心功能正常
  - WeChat WebView (iOS/Android): 核心功能正常
  - Chrome Android 90+: 核心功能正常
  - 国产浏览器 (小米/华为): 基本功能正常

- [ ] **可访问性**
  - 所有可交互元素 Touch Target ≥ 44x44px
  - 色彩对比度符合WCAG AA标准
  - 表单输入框有明确label
  - 键盘导航正常工作

- [ ] **安全性**
  - Service Worker只缓存公开资源,不缓存用户敏感数据
  - PWA Manifest无敏感信息泄露
  - 离线页面不显示用户个人信息

---

## 4. 测试方案 (Test Plan)

### 4.1 单元测试 (Unit Tests)

```typescript
// __tests__/mobile/gestures.test.ts
import { renderHook, act } from '@testing-library/react'
import { usePullToRefresh } from '@/hooks/usePullToRefresh'

describe('Pull-to-Refresh手势', () => {
  it('下拉距离<80px时不触发刷新', async () => {
    const mockRefresh = jest.fn()
    const { result } = renderHook(() =>
      usePullToRefresh({ onRefresh: mockRefresh, threshold: 80 })
    )

    act(() => {
      // 模拟下拉60px
      result.current.bind().onDrag({
        down: false,
        movement: [0, 60],
      })
    })

    expect(mockRefresh).not.toHaveBeenCalled()
  })

  it('下拉距离≥80px时触发刷新', async () => {
    const mockRefresh = jest.fn().mockResolvedValue(undefined)
    const { result } = renderHook(() =>
      usePullToRefresh({ onRefresh: mockRefresh, threshold: 80 })
    )

    await act(async () => {
      result.current.bind().onDrag({
        down: false,
        movement: [0, 100],
      })
    })

    expect(mockRefresh).toHaveBeenCalledTimes(1)
  })
})
```

```typescript
// __tests__/mobile/responsive.test.ts
import { render, screen } from '@testing-library/react'
import { BottomTabBar } from '@/components/mobile/BottomTabBar'

describe('底部导航栏', () => {
  it('在移动端显示,桌面端隐藏', () => {
    const { container } = render(<BottomTabBar />)
    const nav = container.querySelector('nav')

    expect(nav).toHaveClass('md:hidden')
  })

  it('显示所有5个Tab', () => {
    render(<BottomTabBar />)

    expect(screen.getByText('首页')).toBeInTheDocument()
    expect(screen.getByText('课程')).toBeInTheDocument()
    expect(screen.getByText('练习')).toBeInTheDocument()
    expect(screen.getByText('社区')).toBeInTheDocument()
    expect(screen.getByText('我的')).toBeInTheDocument()
  })

  it('当前页面Tab有aria-current属性', () => {
    render(<BottomTabBar />)

    const activeTab = screen.getByLabelText('首页').closest('a')
    expect(activeTab).toHaveAttribute('aria-current', 'page')
  })
})
```

### 4.2 E2E测试 (Playwright)

```typescript
// e2e/mobile/navigation.spec.ts
import { test, expect, devices } from '@playwright/test'

test.use({
  ...devices['iPhone 13'],
})

test.describe('移动端底部导航', () => {
  test('点击Tab切换页面', async ({ page }) => {
    await page.goto('/')

    // 点击"课程"Tab
    await page.click('text=课程')
    await expect(page).toHaveURL('/courses')

    // 点击"练习"Tab
    await page.click('text=练习')
    await expect(page).toHaveURL('/practice')
  })

  test('Active Tab有视觉反馈', async ({ page }) => {
    await page.goto('/courses')

    const coursesTab = page.locator('[aria-current="page"]')
    await expect(coursesTab).toHaveClass(/text-primary/)
  })
})

test.describe('课程章节滑动切换', () => {
  test('左滑切换到下一章', async ({ page }) => {
    await page.goto('/courses/math/chapter-1')

    // 模拟左滑手势
    const lesson = page.locator('[data-testid="lesson-content"]')
    const box = await lesson.boundingBox()
    if (!box) throw new Error('元素未找到')

    await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2)
    await page.mouse.down()
    await page.mouse.move(box.x + 10, box.y + box.height / 2, { steps: 10 })
    await page.mouse.up()

    // 验证URL变化
    await expect(page).toHaveURL('/courses/math/chapter-2')
  })
})
```

```typescript
// e2e/mobile/pwa.spec.ts
import { test, expect } from '@playwright/test'

test.describe('PWA功能', () => {
  test('Manifest正确配置', async ({ page }) => {
    await page.goto('/')

    const manifestLink = page.locator('link[rel="manifest"]')
    await expect(manifestLink).toHaveAttribute('href', '/manifest.json')

    // 验证Manifest内容
    const manifestResponse = await page.request.get('/manifest.json')
    const manifest = await manifestResponse.json()

    expect(manifest.name).toBe('LearnMore - 中学生在线教育平台')
    expect(manifest.display).toBe('standalone')
    expect(manifest.icons.length).toBeGreaterThan(0)
  })

  test('Service Worker注册成功', async ({ page, context }) => {
    await page.goto('/')

    // 等待Service Worker注册
    await page.waitForTimeout(2000)

    const swRegistered = await page.evaluate(() => {
      return navigator.serviceWorker.controller !== null
    })

    expect(swRegistered).toBe(true)
  })

  test('离线时显示提示', async ({ page, context }) => {
    await page.goto('/')

    // 模拟离线
    await context.setOffline(true)

    // 验证离线提示显示
    const offlineAlert = page.locator('text=您当前处于离线状态')
    await expect(offlineAlert).toBeVisible()
  })
})
```

### 4.3 性能测试

```typescript
// e2e/mobile/performance.spec.ts
import { test, expect, devices } from '@playwright/test'

test.use({
  ...devices['iPhone 13'],
})

test.describe('移动端性能指标', () => {
  test('首屏加载性能达标', async ({ page }) => {
    await page.goto('/')

    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const paint = performance.getEntriesByType('paint')

      return {
        FCP: paint.find((p) => p.name === 'first-contentful-paint')?.startTime,
        LCP: navigation.loadEventEnd - navigation.startTime,
        TTI: navigation.domInteractive - navigation.startTime,
      }
    })

    expect(metrics.FCP).toBeLessThan(1500) // <1.5s
    expect(metrics.LCP).toBeLessThan(2500) // <2.5s
    expect(metrics.TTI).toBeLessThan(3500) // <3.5s
  })

  test('触摸响应时间<100ms', async ({ page }) => {
    await page.goto('/')

    const startTime = Date.now()
    await page.click('text=课程')
    const endTime = Date.now()

    const responseTime = endTime - startTime
    expect(responseTime).toBeLessThan(100)
  })
})
```

### 4.4 手动测试清单

#### 真机测试 (必须执行)

- [ ] **iPhone SE (iOS 15)** - Safari + Chrome
  - [ ] 页面布局正确 (320px宽度)
  - [ ] 所有按钮可点击 (Touch Target ≥ 44px)
  - [ ] 输入框聚焦时键盘不遮挡内容

- [ ] **iPhone 13 (iOS 17)** - Safari + WeChat WebView
  - [ ] 刘海屏Safe Area正确适配
  - [ ] 手势操作流畅 (滑动/下拉刷新/长按)
  - [ ] PWA可安装并正常工作

- [ ] **Samsung Galaxy S21 (Android 12)** - Chrome
  - [ ] 药丸导航栏不遮挡底部Tab
  - [ ] Service Worker正确缓存资源
  - [ ] 推送通知权限申请正常

- [ ] **Xiaomi 12 (MIUI 13)** - 系统浏览器
  - [ ] 页面渲染正确 (无国产ROM兼容性问题)
  - [ ] 视频播放正常
  - [ ] 表单提交正常

#### 场景测试

- [ ] **横屏/竖屏旋转**
  - 旋转后布局自动调整
  - 视频播放器正确适配

- [ ] **弱网环境** (Chrome DevTools Slow 3G)
  - 页面逐步渲染,无白屏
  - 图片懒加载生效
  - 离线缓存命中

- [ ] **后台切换**
  - 切换到后台再回来,页面状态保持
  - 视频播放暂停/恢复正常

- [ ] **长时间使用** (30分钟连续操作)
  - 无内存泄漏
  - 无页面卡顿
  - 滚动流畅

---

## 5. 技术风险与缓解措施

| 风险 | 概率 | 影响 | 缓解措施 | 应急预案 |
|-----|------|------|---------|---------|
| iOS Safari手势冲突 | 高 | 中 | 使用`touch-action: pan-y`禁用浏览器默认手势 | 降级为按钮点击切换 |
| PWA缓存策略错误导致内容过期 | 中 | 高 | 1. Staging环境测试1周<br>2. 监控缓存命中率<br>3. 设置合理过期时间 | 版本号强制刷新缓存 |
| Service Worker更新失败 | 中 | 高 | 使用`skipWaiting: true`强制更新 | 提供手动清除缓存按钮 |
| 真机性能不达标 | 中 | 中 | 1. 提前在iPhone SE 2020测试<br>2. 代码分割优化<br>3. 图片懒加载 | 为低端设备提供简化版UI |
| WeChat WebView兼容性 | 高 | 中 | 1. UA检测特殊处理<br>2. Polyfill缺失API<br>3. 真机测试 | 引导用户使用浏览器打开 |
| 离线功能导致数据不一致 | 低 | 高 | 1. 只缓存只读数据<br>2. 用户操作强制在线<br>3. 后台同步 | 显示数据更新时间 |

---

## 6. Definition of Done (完成标准)

### 开发完成标准

- [ ] 所有5个Phase任务完成
- [ ] 代码通过Code Review (至少1人审批)
- [ ] 无ESLint/TypeScript错误
- [ ] 单元测试覆盖率 > 80%
- [ ] E2E测试通过率 100%

### 质量标准

- [ ] **Lighthouse移动端评分**
  - Performance ≥ 90
  - Accessibility ≥ 90
  - Best Practices ≥ 90
  - SEO ≥ 90

- [ ] **核心Web指标**
  - FCP < 1.5s
  - LCP < 2.5s
  - CLS < 0.1

- [ ] **真机测试**
  - 3台iOS设备测试通过
  - 2台Android设备测试通过
  - WeChat WebView测试通过

### 上线标准

- [ ] Staging环境测试7天无Critical Bug
- [ ] 产品经理验收通过
- [ ] 用户体验专家Review通过
- [ ] 技术文档更新 (README.md/CHANGELOG.md)
- [ ] 发布公告准备完毕

---

## 7. 交付物 (Deliverables)

### 代码交付物

- [ ] `components/mobile/BottomTabBar.tsx` - 底部导航栏组件
- [ ] `components/mobile/SwipeableDrawer.tsx` - 侧边栏抽屉组件
- [ ] `components/course/LessonSwipeView.tsx` - 课程滑动切换组件
- [ ] `components/ui/PinchZoomImage.tsx` - 图片缩放组件
- [ ] `components/OfflineFallback.tsx` - 离线提示组件
- [ ] `components/PWAInstallPrompt.tsx` - PWA安装提示组件
- [ ] `hooks/usePullToRefresh.ts` - 下拉刷新Hook
- [ ] `hooks/useKeyboardAvoid.ts` - 键盘遮挡避免Hook
- [ ] `lib/ua-detect.ts` - 用户代理检测工具

### 配置文件

- [ ] `next.config.js` - PWA配置
- [ ] `public/manifest.json` - Web App Manifest
- [ ] `public/icons/` - PWA图标 (8个尺寸)
- [ ] `tailwind.config.ts` - 移动端断点配置

### 测试文件

- [ ] `__tests__/mobile/gestures.test.ts` - 手势单元测试
- [ ] `__tests__/mobile/responsive.test.ts` - 响应式单元测试
- [ ] `e2e/mobile/navigation.spec.ts` - 导航E2E测试
- [ ] `e2e/mobile/pwa.spec.ts` - PWA功能测试
- [ ] `e2e/mobile/performance.spec.ts` - 性能测试

### 文档

- [ ] `docs/MOBILE_OPTIMIZATION.md` - 移动端优化指南
- [ ] `docs/PWA_SETUP.md` - PWA配置说明
- [ ] `docs/GESTURE_GUIDE.md` - 手势操作用户指南

---

## 8. 回滚方案 (Rollback Plan)

### 场景1: PWA功能导致严重问题

```bash
# 1. 禁用Service Worker注册
# 编辑 next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: true, // 紧急禁用
})

# 2. 立即部署
vercel --prod

# 3. 清除已注册的Service Worker
# 引导用户访问 /sw-unregister 页面
```

### 场景2: 手势操作导致交互问题

```bash
# 1. Git回滚手势相关代码
git revert <commit-hash-gestures>

# 2. 保留底部导航,移除手势
# 用户改为点击按钮切换章节

# 3. 部署回滚版本
vercel --prod
```

### 场景3: 性能严重下降

```bash
# 1. 检查Performance问题
# Chrome DevTools → Lighthouse → Diagnose

# 2. 临时禁用性能消耗功能
# - 禁用图片模糊占位符
# - 禁用动画效果
# - 减少缓存策略

# 3. 回滚到上一稳定版本
vercel rollback
```

---

## 9. 实施时间线 (Timeline)

```
Day 1 (8h):
  ├─ 上午: Phase 1 - 响应式布局重构 (4h)
  │   ├─ Tailwind配置 (1h)
  │   ├─ 底部Tab Bar (2h)
  │   └─ 核心组件适配 (1h)
  └─ 下午: Phase 2 - 触摸手势系统 (4h)
      ├─ 库安装与配置 (1h)
      ├─ 滑动切换实现 (2h)
      └─ 下拉刷新实现 (1h)

Day 2 (8h):
  ├─ 上午: Phase 2 - 触摸手势系统 (继续) (4h)
  │   ├─ 长按菜单 (2h)
  │   └─ 图片缩放 (2h)
  └─ 下午: Phase 3 - PWA配置 (4h)
      ├─ next-pwa配置 (1h)
      ├─ Manifest编写 (1h)
      ├─ 图标生成 (1h)
      └─ Service Worker测试 (1h)

Day 3 (8h):
  ├─ 上午: Phase 3 - PWA功能 (继续) (4h)
  │   ├─ 离线组件 (2h)
  │   ├─ 安装提示 (1h)
  │   └─ 推送通知 (1h)
  └─ 下午: Phase 4 - 性能优化 (4h)
      ├─ 图片优化 (2h)
      ├─ 代码分割 (1h)
      └─ Resource Hints (1h)

Day 4 (8h):
  ├─ 上午: 单元测试编写 (4h)
  │   ├─ 手势测试 (2h)
  │   └─ 响应式测试 (2h)
  └─ 下午: E2E测试编写 (4h)
      ├─ 导航测试 (1.5h)
      ├─ PWA测试 (1.5h)
      └─ 性能测试 (1h)

Day 5 (8h):
  ├─ 上午: 真机测试 (4h)
  │   ├─ iOS设备 (2h)
  │   └─ Android设备 (2h)
  └─ 下午: Bug修复与优化 (4h)
      ├─ 兼容性问题修复 (2h)
      ├─ 性能调优 (1h)
      └─ 文档编写 (1h)
```

**总计**: 40小时 (5个工作日)

---

## 10. 成功指标追踪 (Success Metrics)

### 发布后第1周

| 指标 | 目标 | 测量方式 |
|-----|------|---------|
| 移动端访问量增长 | +30% | Google Analytics |
| PWA安装次数 | 100+ | Custom Event |
| 移动端跳出率下降 | -10% | GA Bounce Rate |
| Lighthouse Mobile Score | ≥90 | PageSpeed Insights |

### 发布后第1个月

| 指标 | 目标 | 测量方式 |
|-----|------|---------|
| 移动端DAU占比 | ≥50% | GA Daily Active Users |
| PWA安装转化率 | ≥10% | (Installs / Mobile Visits) * 100 |
| 7日留存率 | ≥60% | Cohort Analysis |
| 移动端课程完成率 | ≥40% | Custom Analytics |

### 技术指标持续监控

- **Performance Monitoring** (Vercel Analytics)
  - Real User Monitoring (RUM)
  - Core Web Vitals分布
  - 地域性能差异

- **Error Tracking** (Sentry)
  - Service Worker错误率 < 0.1%
  - 手势操作失败率 < 5%
  - 离线功能异常率 < 1%

---

## 11. AI开发辅助建议

### 推荐使用Claude Code的方式

由于SkillsMP上暂无专用的"移动端优化"Skill,建议采用以下**AI辅助开发流程**:

#### 方式1: 使用Claude Code直接开发

```bash
# Step 1: 让Claude生成移动端组件
"请根据Story-040的Phase 1规范,生成BottomTabBar组件代码"

# Step 2: 让Claude优化响应式样式
"帮我检查这个组件在320px宽度下的显示效果,并优化Tailwind样式"

# Step 3: 让Claude编写测试
"为BottomTabBar组件生成完整的单元测试,覆盖所有交互场景"
```

#### 方式2: 结合Gemini CLI (如果可用)

```bash
# 使用Gemini分析移动端性能问题
gemini analyze performance --mobile --url http://localhost:3000

# 使用Gemini生成PWA配置
gemini generate pwa-manifest --name "LearnMore" --theme-color "#3b82f6"
```

#### 方式3: 使用Next.js官方工具

```bash
# Lighthouse CI - 自动化性能测试
pnpm add -D @lhci/cli
npx lhci autorun --config=lighthouserc.json

# PWA Asset Generator - 自动生成所有尺寸图标
pnpm add -D pwa-asset-generator
npx pwa-asset-generator logo.svg public/icons --manifest manifest.json
```

### 开发过程中的AI提示词模板

```markdown
## Phase 1 提示词示例
"我正在开发Next.js 14的移动端适配(Story-040),需要实现一个底部Tab导航栏。
要求:
1. 支持5个Tab (首页/课程/练习/社区/我的)
2. 使用Shadcn/ui组件库风格
3. 适配iPhone刘海屏 (Safe Area Insets)
4. Active状态有缩放动画
5. 符合Apple HIG标准 (44x44px触摸目标)

请生成完整的TypeScript + Tailwind代码。"

## Phase 2 提示词示例
"我需要实现移动端课程章节左右滑动切换功能。
技术栈: react-use-gesture + framer-motion
要求:
1. 滑动距离>50px或速度>0.3时触发切换
2. 边界检测 (第一章禁止右滑,最后一章禁止左滑)
3. 流畅的回弹动画
4. 只允许垂直滚动 (touch-action: pan-y)

请生成Hook和组件代码,包含TypeScript类型。"

## Phase 3 提示词示例
"我要为Next.js 14应用添加PWA支持。
要求:
1. 使用next-pwa配置Service Worker
2. 缓存策略: 字体(Cache First)、API(Network First)、图片(Cache First)
3. 生成符合标准的manifest.json
4. 实现离线提示UI组件
5. 支持'添加到主屏幕'提示

请生成next.config.js、manifest.json和相关组件代码。"
```

---

## 12. 注意事项与最佳实践

### 开发注意事项

1. **优先使用Server Components**
   - 移动端流量宝贵,减少客户端JS体积
   - 只在需要交互时使用'use client'

2. **避免过度动画**
   - 移动端性能有限,动画时长控制在200-300ms
   - 使用CSS transform代替position/top/left

3. **图片格式选择**
   - 优先使用WebP格式 (体积小60%)
   - 提供fallback: `<picture>` + `<source>`

4. **字体加载策略**
   - 使用`font-display: swap`避免FOIT
   - 限制字体粗细数量 (仅400/600/700)

5. **谨慎使用第三方库**
   - 每个库都增加包体积
   - 优先使用Tree-Shakeable的库

### 性能优化最佳实践

- **代码分割**: 按路由、按设备、按交互分割
- **预加载**: 使用`<link rel="preload">`预加载关键资源
- **懒加载**: 图片、视频、重组件延迟加载
- **压缩**: Gzip/Brotli压缩,图片压缩
- **CDN**: 静态资源使用CDN加速

### PWA最佳实践

- **缓存策略**: 只读数据Cache First,动态数据Network First
- **版本管理**: Manifest添加`version`字段,便于更新
- **降级方案**: 不支持PWA的浏览器正常工作
- **安全性**: Service Worker只能在HTTPS环境运行

---

## 13. 相关资源

### 官方文档

- [Next.js App Router - Mobile Optimization](https://nextjs.org/docs/app/building-your-application/optimizing)
- [PWA Documentation - MDN](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Apple Human Interface Guidelines - iOS](https://developer.apple.com/design/human-interface-guidelines/ios)
- [Material Design - Touch Gestures](https://m3.material.io/foundations/interaction/gestures)

### 工具与库

- [next-pwa](https://github.com/shadowwalker/next-pwa) - Next.js PWA插件
- [react-use-gesture](https://use-gesture.netlify.app/) - 手势识别库
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) - 自动化性能测试
- [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator) - 图标生成工具

### 测试资源

- [BrowserStack](https://www.browserstack.com/) - 真机测试平台
- [WebPageTest](https://www.webpagetest.org/) - 性能测试
- [Can I Use](https://caniuse.com/) - 浏览器兼容性查询

---

**Story-040 准备就绪! 🚀**

建议在完成Story-001至Story-039后,使用本Story进行移动端全面优化。预计投入5个工作日,即可将LearnMore平台打造为**接近原生App体验的PWA应用**!
