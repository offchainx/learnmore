import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-2xl border border-borderTone bg-surface px-3 py-2 text-sm text-text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] ring-offset-background transition-[border-color,box-shadow,background-color,color] placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--focus-ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--page-bg))] focus-visible:border-blue-300 disabled:cursor-not-allowed disabled:border-borderTone/60 disabled:bg-surface-muted disabled:text-text-disabled disabled:opacity-100 dark:shadow-none dark:focus-visible:border-blue-400",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
