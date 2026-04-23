'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'

export function ThemeSwitchButton() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === 'dark'
  const ariaLabel = mounted ? (isDark ? '切换到浅色模式' : '切换到深色模式') : '切换主题'

  return (
    <Button
      variant="ghost"
      size="icon"
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={ariaLabel}
      className="relative shrink-0 rounded-full border border-transparent text-slate-400 transition-colors hover:border-white/10 hover:bg-white/10 hover:text-white dark:text-slate-400 dark:hover:border-white/10 dark:hover:bg-white/10 dark:hover:text-white"
    >
      <Sun
        aria-hidden="true"
        className={`absolute h-[1.15rem] w-[1.15rem] transition-all ${mounted && isDark ? 'rotate-90 scale-0' : 'rotate-0 scale-100'}`}
      />
      <Moon
        aria-hidden="true"
        className={`absolute h-[1.15rem] w-[1.15rem] transition-all ${mounted && isDark ? 'rotate-0 scale-100' : '-rotate-90 scale-0'}`}
      />
      <span className="sr-only">{ariaLabel}</span>
    </Button>
  )
}
