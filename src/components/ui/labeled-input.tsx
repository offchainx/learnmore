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
            'flex h-12 w-full rounded-xl border border-borderTone bg-surface px-4 py-2 text-sm text-text-primary ring-offset-[hsl(var(--page-bg))] transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--focus-ring))] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-borderTone/70 disabled:bg-surface-subtle disabled:text-text-tertiary disabled:opacity-100 dark:border-borderTone dark:bg-surface-subtle dark:text-white dark:ring-offset-[hsl(var(--page-bg))] dark:placeholder:text-text-tertiary dark:disabled:bg-surface-muted dark:disabled:text-text-disabled',
            error
              ? 'border-red-400 focus-visible:ring-red-500 dark:border-red-500'
              : 'hover:border-blue-200 dark:hover:border-blue-300/30',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="ml-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

LabeledInput.displayName = "LabeledInput";

export { LabeledInput as Input };
