'use client'

import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const NativeSelect = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div className="relative w-full">
      <select
        ref={ref}
        className={cn(
          'h-10 w-full appearance-none rounded-xl border border-borderTone bg-surface px-3 pr-10 text-sm text-text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] ring-offset-background transition-[border-color,box-shadow,background-color,color] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--focus-ring))] focus:ring-offset-2 focus:ring-offset-[hsl(var(--page-bg))] focus:border-[hsl(var(--border-strong))] disabled:cursor-not-allowed disabled:border-borderTone/60 disabled:bg-surface-muted disabled:text-text-disabled disabled:opacity-100 dark:border-borderTone dark:bg-surface dark:text-text-primary dark:shadow-none dark:focus:border-[hsl(var(--border-strong))]',
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
    </div>
  )
})
NativeSelect.displayName = 'NativeSelect'

const NativeSelectOption = React.forwardRef<
  HTMLOptionElement,
  React.OptionHTMLAttributes<HTMLOptionElement>
>(({ children, ...props }, ref) => {
  return (
    <option ref={ref} {...props}>
      {children}
    </option>
  )
})
NativeSelectOption.displayName = 'NativeSelectOption'

const NativeSelectOptGroup = React.forwardRef<
  HTMLOptGroupElement,
  React.OptgroupHTMLAttributes<HTMLOptGroupElement>
>(({ children, ...props }, ref) => {
  return (
    <optgroup ref={ref} {...props}>
      {children}
    </optgroup>
  )
})
NativeSelectOptGroup.displayName = 'NativeSelectOptGroup'

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption }
