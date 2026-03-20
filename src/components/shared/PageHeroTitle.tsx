import * as React from 'react'

import { HeroCapsule } from '@/components/shared/HeroCapsule'
import { cn } from '@/lib/utils'

interface PageHeroTitleProps {
  title: React.ReactNode
  capsuleLabel: React.ReactNode
  className?: string
  titleClassName?: string
}

export function PageHeroTitle({
  title,
  capsuleLabel,
  className,
  titleClassName,
}: PageHeroTitleProps) {
  return (
    <span
      className={cn(
        'inline-flex max-w-full flex-wrap items-center gap-3 align-middle',
        className
      )}
    >
      <span className={cn('min-w-0', titleClassName)}>{title}</span>
      <HeroCapsule label={capsuleLabel} />
    </span>
  )
}
