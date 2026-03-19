import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  return (
    <div className="flex gap-1 h-1.5 w-full">
      {Array.from({ length: total }).map((_, idx) => {
        let colorClass = 'bg-slate-200 dark:bg-slate-700';
        if (idx < current) {
          colorClass = 'bg-blue-500 dark:bg-cyan-300';
        } else if (idx === current) {
          colorClass = 'bg-blue-300 dark:bg-cyan-300/40';
        }
        return <div key={idx} className={`flex-1 rounded-[2px] ${colorClass}`} />;
      })}
    </div>
  );
};
