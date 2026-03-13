import * as React from 'react'

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
        'relative overflow-hidden rounded-[26px] border border-[#24324D] bg-[linear-gradient(135deg,#111A2E_0%,#0F1A2F_55%,#0B1220_100%)] px-4 py-3 shadow-[0_18px_44px_rgba(2,8,23,0.32)] sm:px-5 sm:py-3.5',
        className
      )}
    >
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#2563EB]/10 blur-3xl" />
      <div className="absolute bottom-0 left-16 h-24 w-24 rounded-full bg-[#22C55E]/10 blur-3xl" />

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
              'text-[26px] font-bold tracking-tight text-[#E6EDF7] sm:text-[28px]',
              eyebrow ? 'mt-2' : '',
              titleClassName
            )}
          >
            {title}
          </h1>
          {subtitle ? (
            <p
              className={cn(
                'mt-1 max-w-3xl text-[12px] leading-5 text-[#B2C3DA] sm:text-[13px]',
                subtitleClassName
              )}
            >
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
