import React from 'react';
import { Sparkles, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PreviewHookProps {
  onClick?: () => void;
  className?: string;
}

export const PreviewHook: React.FC<PreviewHookProps> = ({
  onClick,
  className
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group flex w-full cursor-pointer items-center justify-between gap-4 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4 transition-all duration-300 hover:bg-primary/10 hover:border-primary/60 hover:shadow-sm",
        className
      )}
      role="button"
      aria-label="Unlock AI Analysis"
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background/80 shadow-sm ring-1 ring-primary/10 transition-transform group-hover:scale-110 group-hover:ring-primary/30">
          <Sparkles className="h-5 w-5 text-primary fill-primary/20" />
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-sm font-medium text-foreground group-hover:text-primary transition-colors">
            AI has analyzed your mistake patterns.
          </span>
          <span className="truncate text-xs text-muted-foreground">
            Unlock Smart Plus to see why you got this wrong.
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-background px-3 py-1.5 text-xs font-semibold text-primary shadow-sm ring-1 ring-inset ring-border transition-all group-hover:scale-105 group-hover:ring-primary/30">
        <span>View Analysis</span>
        <Lock className="h-3 w-3" />
      </div>
    </div>
  );
};
