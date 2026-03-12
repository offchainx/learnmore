'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PracticeModeShellProps {
  children: ReactNode
  className?: string
  maxWidthClassName?: string
}

export function PracticeModeShell({
  children,
  className,
  maxWidthClassName = 'max-w-6xl',
}: PracticeModeShellProps) {
  return (
    <div className={cn('mx-auto w-full px-3 py-2 sm:px-4 sm:py-4', className)}>
      <div className={cn('mx-auto flex w-full flex-col gap-5', maxWidthClassName)}>{children}</div>
    </div>
  )
}
