import * as React from 'react'

import { cn } from '@/lib/utils'

type ShineBorderProps = {
  children: React.ReactNode
  className?: string
  contentClassName?: string
  borderWidth?: number
  duration?: number
  gradient?: string
  glowOpacity?: number
}

const DEFAULT_GRADIENT =
  'conic-gradient(from 90deg, rgba(56,189,248,0.9), rgba(168,85,247,0.95), rgba(251,146,60,0.9), rgba(56,189,248,0.9))'

export function ShineBorder({
  children,
  className,
  contentClassName,
  borderWidth = 2,
  duration = 6,
  gradient = DEFAULT_GRADIENT,
  glowOpacity = 1,
}: ShineBorderProps) {
  const animated = duration > 0

  return (
    <div
      className={cn('relative rounded-[28px]', className)}
      style={{ padding: borderWidth }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
        <div
          className={cn('absolute inset-[-140%]', animated && 'motion-safe:animate-spin')}
          style={{
            animationDuration: animated ? `${duration}s` : undefined,
            backgroundImage: gradient,
            opacity: glowOpacity,
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_42%)]" />
      </div>

      <div
        className={cn(
          'relative z-10 h-full rounded-[calc(28px-2px)] bg-[#0f111a]',
          contentClassName
        )}
      >
        {children}
      </div>
    </div>
  )
}

export default ShineBorder
