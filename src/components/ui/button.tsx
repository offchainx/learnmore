import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-[background-color,border-color,color,box-shadow,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--focus-ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--page-bg))] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-surface hover:bg-primary/92',
        primary: 'bg-primary text-primary-foreground shadow-surface hover:bg-primary/92',
        destructive:
          'bg-destructive text-destructive-foreground shadow-surface hover:bg-destructive/92',
        outline:
          'border border-borderTone bg-surface text-text-primary shadow-surface hover:bg-surface-subtle hover:text-text-primary',
        secondary:
          'border border-borderTone/80 bg-surface-subtle text-text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] hover:bg-surface-selected hover:text-sky-700 dark:hover:text-white',
        ghost: 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary',
        link: 'text-primary underline-offset-4 hover:underline',
        glow: 'border-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 hover:scale-[1.02] hover:shadow-blue-500/40 transition-all duration-200',
      },
      size: {
        default: 'h-10 px-4 py-2',
        md: 'h-10 px-4 py-2', // Alias for default
        sm: 'h-9 px-3 text-xs',
        lg: 'h-11 px-8',
        xl: 'h-14 px-10 text-lg font-semibold',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  fullWidth?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }), fullWidth && "w-full")}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
