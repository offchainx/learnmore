import * as React from 'react'

import {
  pageHeroSubtitleClass,
  pageHeroTitleClass,
} from '@/components/shared/pageTypography'
import { cn } from '@/lib/utils'

interface PageHeroShellProps {
  eyebrow?: React.ReactNode
  title: React.ReactNode
  subtitle?: React.ReactNode
  actions?: React.ReactNode
  children?: React.ReactNode
  className?: string
  innerClassName?: string
  titleClassName?: string
  subtitleClassName?: string
}

export function PageHeroShell({
  eyebrow,
  title,
  subtitle,
  actions,
  children,
  className,
  innerClassName,
  titleClassName,
  subtitleClassName,
}: PageHeroShellProps) {
  return (
    <div
      className={cn(
        'page-hero-shell relative overflow-hidden rounded-[26px] px-4 py-3 sm:px-5 sm:py-3.5',
        className
      )}
    >
      <div
        className="absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl"
        style={{ backgroundColor: 'hsl(var(--state-info-bg))', opacity: 0.8 }}
      />
      <div
        className="absolute bottom-0 left-16 h-24 w-24 rounded-full blur-3xl"
        style={{
          backgroundColor: 'hsl(var(--state-success-bg))',
          opacity: 0.7,
        }}
      />

      <div
        className={cn(
          'relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between',
          innerClassName
        )}
      >
        <div className="min-w-0">
          {eyebrow ? <div>{eyebrow}</div> : null}
          <h1
            className={cn(
              pageHeroTitleClass,
              eyebrow ? 'mt-2' : '',
              titleClassName
            )}
          >
            {title}
          </h1>
          {subtitle ? (
            <p className={cn(pageHeroSubtitleClass, subtitleClassName)}>
              {subtitle}
            </p>
          ) : null}
        </div>

        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>

      {children ? <div className="relative mt-4">{children}</div> : null}
    </div>
  )
}
