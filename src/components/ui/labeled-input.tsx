import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const LabeledInput = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', type, label, error, ...props }, ref) => {
    return (
      <div className="space-y-2 w-full">
        {label && (
          <label className="ml-1 text-sm font-medium text-text-secondary dark:text-text-secondary">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            'flex h-12 w-full rounded-xl border border-borderTone bg-surface px-4 py-2 text-sm text-text-primary ring-offset-[hsl(var(--page-bg))] shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-tertiary focus-visible:border-[hsl(var(--border-strong))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--focus-ring))] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-borderTone/70 disabled:bg-surface-subtle disabled:text-text-tertiary disabled:opacity-100 dark:border-borderTone dark:bg-surface dark:text-text-primary dark:ring-offset-[hsl(var(--page-bg))] dark:placeholder:text-text-tertiary dark:disabled:bg-surface-muted dark:disabled:text-text-disabled dark:shadow-none dark:focus-visible:border-[hsl(var(--border-strong))]',
            error
              ? 'border-[hsl(var(--state-danger-fg))] focus-visible:ring-[hsl(var(--state-danger-fg))]'
              : 'hover:border-[hsl(var(--border-strong))] dark:hover:border-[hsl(var(--border-strong))]',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="ml-1 text-xs text-[hsl(var(--state-danger-fg))]">
            {error}
          </p>
        )}
      </div>
    );
  }
);

LabeledInput.displayName = "LabeledInput";

export { LabeledInput as Input };
