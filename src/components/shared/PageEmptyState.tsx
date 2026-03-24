import { ElementType, ReactNode } from 'react'

import { cn } from '@/lib/utils'
import { pageEmptyStateClass } from '@/components/shared/pageSurfaces'
import {
  pageCardTitleClass,
  pageMetaTextClass,
} from '@/components/shared/pageTypography'

interface PageEmptyStateProps {
  title: ReactNode
  description?: ReactNode
  icon?: ElementType
  actions?: ReactNode
  align?: 'center' | 'left'
  className?: string
  iconClassName?: string
  iconContainerClassName?: string
  titleClassName?: string
  descriptionClassName?: string
}

export function PageEmptyState({
  title,
  description,
  icon: Icon,
  actions,
  align = 'center',
  className,
  iconClassName,
  iconContainerClassName,
  titleClassName,
  descriptionClassName,
}: PageEmptyStateProps) {
  const isLeftAligned = align === 'left'

  return (
    <div
      className={cn(
        pageEmptyStateClass,
        'flex flex-col',
        isLeftAligned ? 'items-start text-left' : 'items-center text-center',
        className
      )}
    >
      {Icon ? (
        <div
          className={cn(
            'mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-borderTone bg-surface text-text-tertiary shadow-[inset_0_1px_0_rgba(255,255,255,0.36)] dark:border-borderTone dark:bg-surface dark:text-text-tertiary dark:shadow-none',
            iconContainerClassName
          )}
        >
          <Icon className={cn('h-5 w-5', iconClassName)} />
        </div>
      ) : null}

      <div className={cn(pageCardTitleClass, titleClassName)}>{title}</div>

      {description ? (
        <p
          className={cn(
            pageMetaTextClass,
            'mt-2 max-w-md',
            isLeftAligned ? 'mx-0' : 'mx-auto',
            descriptionClassName
          )}
        >
          {description}
        </p>
      ) : null}

      {actions ? (
        <div
          className={cn(
            'mt-5 flex flex-wrap gap-3',
            isLeftAligned ? 'justify-start' : 'justify-center'
          )}
        >
          {actions}
        </div>
      ) : null}
    </div>
  )
}
