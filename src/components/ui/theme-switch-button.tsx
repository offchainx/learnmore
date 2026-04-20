'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'

export function ThemeSwitchButton() {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <Button
      variant="ghost"
      size="icon"
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? '切换到浅色模式' : '切换到深色模式'}
      className="relative shrink-0 rounded-full border border-transparent text-slate-400 transition-colors hover:border-white/10 hover:bg-white/10 hover:text-white dark:text-slate-400 dark:hover:border-white/10 dark:hover:bg-white/10 dark:hover:text-white"
    >
      <Sun
        className={`absolute h-[1.15rem] w-[1.15rem] transition-all ${isDark ? 'rotate-90 scale-0' : 'rotate-0 scale-100'}`}
      />
      <Moon
        className={`absolute h-[1.15rem] w-[1.15rem] transition-all ${isDark ? 'rotate-0 scale-100' : '-rotate-90 scale-0'}`}
      />
      <span className="sr-only">切换主题</span>
    </Button>
  )
}
