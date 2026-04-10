import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'

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
          'border border-borderTone bg-surface text-text-primary shadow-surface hover:border-[hsl(var(--border-strong))] hover:bg-surface-subtle hover:text-text-primary dark:border-borderTone dark:bg-surface dark:text-text-primary dark:hover:border-[hsl(var(--border-strong))] dark:hover:bg-surface-subtle dark:hover:text-text-primary',
        secondary:
          'border border-borderTone bg-surface-subtle text-text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] hover:border-[hsl(var(--border-strong))] hover:bg-surface-selected hover:text-primary dark:border-borderTone dark:bg-surface-subtle dark:text-text-primary dark:hover:border-[hsl(var(--border-strong))] dark:hover:bg-surface-selected dark:hover:text-primary',
        ghost:
          'text-text-secondary hover:bg-surface-subtle hover:text-text-primary dark:text-text-secondary dark:hover:bg-surface-subtle dark:hover:text-text-primary',
        link: 'text-primary underline-offset-4 hover:underline',
        glow:
          'border border-borderTone bg-[linear-gradient(135deg,hsl(var(--primary))_0%,hsl(var(--state-info-fg))_100%)] text-primary-foreground shadow-lg shadow-primary/25 hover:scale-[1.02] hover:shadow-primary/40',
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
  isLoading?: boolean
  loadingText?: React.ReactNode
  loadingIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      isLoading = false,
      loadingText,
      loadingIcon,
      disabled,
      children,
      ...props
    },
    ref
    ) => {
    const canUseAsChild =
      asChild && React.isValidElement(children) && React.Children.count(children) === 1
    const Comp = canUseAsChild ? Slot : 'button'
    const isDisabled = disabled || isLoading
    const content = canUseAsChild ? children : isLoading ? (loadingText ?? children) : children
    return (
      <Comp
        aria-busy={isLoading || undefined}
        className={cn(
          buttonVariants({ variant, size, className }),
          fullWidth && 'w-full',
          isLoading && 'cursor-wait',
          canUseAsChild && isLoading && 'pointer-events-none opacity-70'
        )}
        data-loading={isLoading ? 'true' : undefined}
        disabled={!canUseAsChild ? isDisabled : undefined}
        ref={ref}
        {...props}
      >
        {!canUseAsChild && isLoading ? (
          loadingIcon ?? <Loader2 className="animate-spin" aria-hidden="true" />
        ) : null}
        {content}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
