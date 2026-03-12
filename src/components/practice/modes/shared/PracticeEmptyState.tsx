'use client'

import type { ElementType } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { practiceThemeStyles, type PracticeModeTheme } from './theme'

interface PracticeEmptyStateProps {
  icon: ElementType
  title: string
  description: string
  theme?: PracticeModeTheme
  primaryActionLabel?: string
  primaryAction?: () => void
  secondaryActionLabel?: string
  secondaryAction?: () => void
  tertiaryActionLabel?: string
  tertiaryAction?: () => void
  className?: string
}

export function PracticeEmptyState({
  icon: Icon,
  title,
  description,
  theme = 'slate',
  primaryActionLabel,
  primaryAction,
  secondaryActionLabel,
  secondaryAction,
  tertiaryActionLabel,
  tertiaryAction,
  className,
}: PracticeEmptyStateProps) {
  const themeStyle = practiceThemeStyles[theme]

  return (
    <Card
      className={cn(
        'mx-auto max-w-2xl overflow-hidden rounded-[28px] border-white/10 shadow-[0_24px_70px_rgba(15,23,42,0.2)]',
        themeStyle.shell,
        className,
      )}
    >
      <CardContent className="flex flex-col items-center justify-center p-8 text-center">
        <div className={cn('flex h-16 w-16 items-center justify-center rounded-full border', themeStyle.iconWrap)}>
          <Icon className={cn('h-7 w-7', themeStyle.icon)} />
        </div>
        <h2 className="mt-5 text-2xl font-black tracking-tight text-white">{title}</h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-slate-300">{description}</p>

        {(primaryActionLabel || secondaryActionLabel || tertiaryActionLabel) ? (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {primaryActionLabel && primaryAction ? (
              <Button className={cn('rounded-2xl px-5 py-6 text-sm font-black', themeStyle.primaryButton)} onClick={primaryAction}>
                {primaryActionLabel}
              </Button>
            ) : null}
            {secondaryActionLabel && secondaryAction ? (
              <Button
                variant="outline"
                className="rounded-2xl border-white/10 bg-white/5 px-5 py-6 text-white hover:bg-white/10 hover:text-white"
                onClick={secondaryAction}
              >
                {secondaryActionLabel}
              </Button>
            ) : null}
            {tertiaryActionLabel && tertiaryAction ? (
              <Button
                variant="ghost"
                className="rounded-2xl px-5 py-6 text-white/80 hover:bg-white/8 hover:text-white"
                onClick={tertiaryAction}
              >
                {tertiaryActionLabel}
              </Button>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
