import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/85',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/85',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/85',
        outline: 'border-borderTone bg-surface text-text-primary',
        // AI Studio Variants
        primary: "border-blue-200 dark:border-blue-800 bg-state-info-bg dark:bg-blue-900/30 text-state-info-fg dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50",
        success: "border-emerald-200 dark:border-emerald-800 bg-state-success-bg dark:bg-emerald-900/30 text-state-success-fg dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50",
        warning: "border-amber-200 dark:border-amber-800 bg-state-warning-bg dark:bg-amber-900/30 text-state-warning-fg dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50",
        danger: "border-red-200 dark:border-red-800 bg-state-danger-bg dark:bg-red-900/30 text-state-danger-fg dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50",
        neutral: "border-borderTone bg-surface-subtle text-text-secondary hover:bg-surface-selected hover:text-text-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/80",
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
    icon?: React.ElementType;
    animate?: boolean;
}

function Badge({ className, variant, icon: Icon, animate, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), animate && 'animate-pulse', className)} {...props}>
      {Icon && <Icon className={cn("w-3 h-3 mr-1", animate && "animate-spin")} />}
      {children}
    </div>
  )
}

export { Badge, badgeVariants }
