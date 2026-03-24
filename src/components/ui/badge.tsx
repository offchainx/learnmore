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
        primary:
          "border-borderTone bg-state-info-bg text-state-info-fg hover:bg-state-info-bg dark:border-borderTone dark:bg-state-info-bg dark:text-state-info-fg dark:hover:bg-state-info-bg",
        success:
          "border-borderTone bg-state-success-bg text-state-success-fg hover:bg-state-success-bg dark:border-borderTone dark:bg-state-success-bg dark:text-state-success-fg dark:hover:bg-state-success-bg",
        warning:
          "border-borderTone bg-state-warning-bg text-state-warning-fg hover:bg-state-warning-bg dark:border-borderTone dark:bg-state-warning-bg dark:text-state-warning-fg dark:hover:bg-state-warning-bg",
        danger:
          "border-borderTone bg-state-danger-bg text-state-danger-fg hover:bg-state-danger-bg dark:border-borderTone dark:bg-state-danger-bg dark:text-state-danger-fg dark:hover:bg-state-danger-bg",
        neutral:
          "border-borderTone bg-surface-subtle text-text-secondary hover:bg-surface-selected hover:text-text-primary dark:border-borderTone dark:bg-surface-subtle dark:text-text-secondary dark:hover:bg-surface-selected dark:hover:text-text-primary",
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
