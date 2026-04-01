'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useApp } from '@/providers'
import {
  isDashboardViewActive,
  mobileDashboardNavItems,
} from '@/components/layout/dashboard-nav'
import { cn } from '@/lib/utils'

export function BottomTabBar() {
  const pathname = usePathname()
  const { t } = useApp()
  const tabLabels = {
    dashboard: t.sidebar.dashboard,
    courses: t.sidebar.courses,
    practice: t.sidebar.practice,
    community: t.sidebar.community,
    settings: t.sidebar.settings,
  }

  return (
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
  )
}
