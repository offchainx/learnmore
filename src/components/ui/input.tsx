import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-borderTone bg-surface px-3 py-2 text-base text-text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] ring-offset-background transition-[border-color,box-shadow,background-color,color] file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--focus-ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--page-bg))] focus-visible:border-blue-300 disabled:cursor-not-allowed disabled:border-borderTone/60 disabled:bg-surface-muted disabled:text-text-disabled disabled:opacity-100 md:text-sm dark:shadow-none dark:focus-visible:border-blue-400",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
