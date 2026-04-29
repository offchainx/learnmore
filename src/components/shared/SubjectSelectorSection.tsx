'use client'

import React, { useLayoutEffect, useMemo, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

export interface SubjectSelectorItem {
  id: string
  label: string
  icon: React.ElementType
}

interface SubjectSelectorSectionProps {
  items: SubjectSelectorItem[]
  selectedId: string
  onSelect: (id: string) => void
  className?: string
  layoutAnchorId?: string
}

export function SubjectSelectorSection({
  items,
  selectedId,
  onSelect,
  className,
  layoutAnchorId,
}: SubjectSelectorSectionProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number
    width: number
    opacity: number
  }>({
    left: 0,
    width: 0,
    opacity: 0,
  })

  const activeItem = useMemo(
    () => items.find((item) => item.id === selectedId) ?? items[0],
    [items, selectedId]
  )

  const syncIndicator = () => {
    const root = rootRef.current
    const activeButton =
      buttonRefs.current[selectedId] || buttonRefs.current[activeItem?.id]

    if (!root || !activeButton) {
      setIndicatorStyle((current) => ({ ...current, opacity: 0 }))
      return
    }

    const rootRect = root.getBoundingClientRect()
    const buttonRect = activeButton.getBoundingClientRect()
    const rootStyles = window.getComputedStyle(root)
    const borderLeft = root.clientLeft
    const paddingLeft = Number.parseFloat(rootStyles.paddingLeft) || 0

    setIndicatorStyle({
      left: buttonRect.left - rootRect.left - borderLeft - paddingLeft,
      width: buttonRect.width,
      opacity: 1,
    })
  }

  useLayoutEffect(() => {
    syncIndicator()
    // 仅在窗口尺寸变化时重算，避免引入更重的观察器。
    window.addEventListener('resize', syncIndicator)

    return () => {
      window.removeEventListener('resize', syncIndicator)
    }
  }, [selectedId, activeItem?.id, items.length])

  return (
    <section
      className={cn('w-full', className)}
      data-layout-anchor={layoutAnchorId}
    >
      <div
        ref={rootRef}
        className="relative flex w-full items-center gap-2 overflow-x-auto rounded-[22px] border border-[hsl(var(--border-subtle))] bg-surface px-2 py-2 shadow-[0_10px_26px_rgba(15,23,42,0.035)] dark:border-borderTone dark:bg-surface dark:shadow-[0_10px_26px_rgba(15,23,42,0.08)]"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-1.5 rounded-full border border-[hsl(var(--border-strong))]/45 bg-[hsl(var(--state-warning-bg))]/55 opacity-0 shadow-[0_6px_16px_rgba(249,115,22,0.06)] transition-[transform,width,opacity] duration-300 ease-out"
          style={{
            opacity: indicatorStyle.opacity,
            width: indicatorStyle.width,
            transform: `translateX(${indicatorStyle.left}px)`,
          }}
        />

        {items.map((item) => {
          const Icon = item.icon
          const isActive = selectedId === item.id

          return (
            <button
              key={item.id}
              ref={(node) => {
                buttonRefs.current[item.id] = node
              }}
              type="button"
              onClick={() => onSelect(item.id)}
              aria-pressed={isActive}
              className={cn(
                'relative z-10 flex min-h-[42px] shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold transition-colors duration-200 active:scale-[0.99]',
                isActive
                  ? 'text-[hsl(var(--state-warning-fg))]'
                  : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary dark:text-text-secondary dark:hover:bg-surface-subtle dark:hover:text-text-primary'
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4 transition-colors',
                  isActive
                    ? 'text-[hsl(var(--state-warning-fg))]'
                    : 'text-text-tertiary'
                )}
              />
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
