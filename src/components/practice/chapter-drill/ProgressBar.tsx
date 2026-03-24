import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  return (
    <div className="flex gap-1 h-1.5 w-full">
      {Array.from({ length: total }).map((_, idx) => {
        let colorClass = 'bg-[hsl(var(--border-subtle))] dark:bg-[hsl(var(--border-default))]';
        if (idx < current) {
          colorClass = 'bg-primary dark:bg-primary';
        } else if (idx === current) {
          colorClass = 'bg-[hsl(var(--state-info-fg))]/45 dark:bg-[hsl(var(--state-info-fg))]/45';
        }
        return <div key={idx} className={`flex-1 rounded-[2px] ${colorClass}`} />;
      })}
    </div>
  );
};
