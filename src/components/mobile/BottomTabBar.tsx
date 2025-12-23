'use client'

import { Home, BookOpen, Edit, MessageCircle, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const tabs = [
  { id: 'home', icon: Home, label: '首页', path: '/dashboard' },
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
                 tablet:hidden"
      role="navigation"
      aria-label="主导航"
    >
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.path)
          const Icon = tab.icon

          return (
            <Link
              key={tab.id}
              href={tab.path}
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
              <span className="text-xs font-medium">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
