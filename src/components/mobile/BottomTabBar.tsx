'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useApp } from '@/providers'
import {
  isDashboardViewActive,
  mobileDashboardNavItems,
} from '@/components/layout/dashboard-nav'
import { cn } from '@/lib/utils'

// 底部 TabBar 的五个入口全部在 /dashboard 下，而 /dashboard 有登录墙。
// 官网现在是内测报名站，App 两端都没上架，marketing 页面上显示这一排等于给手机用户
// 五个死路入口，还白占 4rem 首屏。只在真正的 App 路由下渲染。
function isAppRoute(pathname: string | null): boolean {
  if (!pathname) return false
  return pathname === '/dashboard' || pathname.startsWith('/dashboard/') || pathname.startsWith('/course/')
}

export function BottomTabBar() {
  const pathname = usePathname()
  const { t } = useApp()

  if (!isAppRoute(pathname)) return null

  const tabLabels = {
    dashboard: t.sidebar.dashboard,
    courses: t.sidebar.courses,
    practice: t.sidebar.practice,
    community: t.sidebar.community,
    settings: t.sidebar.settings,
  }

  return (
    <>
      {/* 占位：TabBar 是 fixed 的，页面底部要留出等高空间 */}
      <div className="h-16 pb-safe-bottom tablet:hidden" aria-hidden />
    <nav
      className="fixed bottom-0 left-0 right-0 z-50
                 bg-background/95 backdrop-blur-sm
                 border-t border-border
                 pb-safe-bottom
                 tablet:hidden"
      role="navigation"
      aria-label="主导航"
    >
      <div className="flex items-center justify-around h-16">
        {mobileDashboardNavItems.map((tab) => {
          const isActive = isDashboardViewActive(tab.id, pathname)
          const Icon = tab.icon

          return (
            <Link
              key={tab.id}
              href={tab.path}
              prefetch
              className={cn(
                'flex flex-col items-center justify-center gap-1',
                'w-full h-full transition-all duration-200',
                'active:scale-95', // 按压反馈
                'min-w-[44px] min-h-[44px]', // Touch Target Size
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
              <span className="text-xs font-medium">
                {tabLabels[tab.id as keyof typeof tabLabels]}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
    </>
  )
}
