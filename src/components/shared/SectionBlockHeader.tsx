import * as React from 'react'

import { cn } from '@/lib/utils'
import {
  pageSectionDescriptionClass,
  pageSectionTitleClass,
} from '@/components/shared/pageTypography'

interface SectionBlockHeaderProps {
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  className?: string
  titleClassName?: string
  descriptionClassName?: string
}

export function SectionBlockHeader({
  title,
  description,
  actions,
  className,
  titleClassName,
  descriptionClassName,
}: SectionBlockHeaderProps) {
  return (
    <div
      className={cn(
        'flex min-w-0 flex-col gap-3 md:flex-row md:items-start md:justify-between',
        className
      )}
    >
      <div className="min-w-0 space-y-1">
        <h2 className={cn(pageSectionTitleClass, titleClassName)}>{title}</h2>
        {description ? (
          <p className={cn(pageSectionDescriptionClass, descriptionClassName)}>
            {description}
          </p>
        ) : null}
      </div>

      {actions ? <div className="w-full min-w-0 md:w-auto md:shrink-0">{actions}</div> : null}
    </div>
  )
}
