'use client'

import type { ElementType, ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { practiceThemeStyles, type PracticeModeTheme } from './theme'

interface PracticeHeaderStat {
  icon: ElementType
  label: string
  value: ReactNode
}

interface PracticeHeaderProps {
  title: string
  description: string
  badge: string
  icon: ElementType
  theme?: PracticeModeTheme
  stats?: PracticeHeaderStat[]
  children?: ReactNode
  compact?: boolean
  className?: string
}

export function PracticeHeader({
  title,
  description,
  badge,
  icon: Icon,
  theme = 'slate',
  stats = [],
  children,
  compact = false,
  className,
}: PracticeHeaderProps) {
  const themeStyle = practiceThemeStyles[theme]

  if (compact) {
    return (
      <Card
        className={cn(
          'overflow-hidden rounded-[28px] border-white/10 shadow-[0_20px_48px_rgba(2,8,23,0.16)]',
          themeStyle.shell,
          className,
        )}
      >
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <div className={cn('inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em]', themeStyle.badge)}>
                <Icon className={cn('h-3.5 w-3.5', themeStyle.icon)} />
                {badge}
              </div>
              <h1 className="mt-3 text-[28px] font-black tracking-tight text-white">{title}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{description}</p>
            </div>

            {stats.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[280px]">
                {stats.map((stat) => {
                  const StatIcon = stat.icon
                  return (
                    <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                        <StatIcon className={cn('h-3.5 w-3.5', themeStyle.icon)} />
                        {stat.label}
                      </div>
                      <div className="mt-2 text-xl font-black text-white">{stat.value}</div>
                    </div>
                  )
                })}
              </div>
            ) : null}
          </div>
          {children ? <div className="mt-4">{children}</div> : null}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        'overflow-hidden rounded-[30px] border-white/10 shadow-[0_24px_70px_rgba(15,23,42,0.24)]',
        themeStyle.shell,
        className,
      )}
    >
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className={cn('inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em]', themeStyle.badge)}>
              <Icon className={cn('h-3.5 w-3.5', themeStyle.icon)} />
              {badge}
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">{title}</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">{description}</p>
          </div>

          {stats.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
              {stats.map((stat) => {
                const StatIcon = stat.icon
                return (
                  <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                      <StatIcon className={cn('h-3.5 w-3.5', themeStyle.icon)} />
                      {stat.label}
                    </div>
                    <div className="mt-3 text-2xl font-black text-white">{stat.value}</div>
                  </div>
                )
              })}
            </div>
          ) : null}
        </div>

        {children ? <div className="mt-6">{children}</div> : null}
      </CardContent>
    </Card>
  )
}
