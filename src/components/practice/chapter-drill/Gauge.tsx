import React from 'react';

interface GaugeProps {
  value: number;
}

export const Gauge: React.FC<GaugeProps> = ({ value }) => {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-borderTone bg-surface p-6 text-center shadow-surface dark:border-borderTone dark:bg-surface-subtle">
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-transparent via-blue-500/40 to-transparent dark:via-cyan-300/40"></div>
      <p className="mb-4 text-xs font-bold uppercase tracking-tighter text-text-secondary dark:text-text-secondary">Mastery Progress</p>
      
      <div className="relative flex items-center justify-center">
        <svg 
          className="size-32 transform -rotate-90 drop-shadow-[0_0_8px_rgba(59,130,246,0.2)]" 
          viewBox="0 0 100 100"
        >
          {/* Background Track */}
          <circle
            className="text-slate-200 dark:text-slate-700"
            cx="50"
            cy="50"
            fill="transparent"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
          />
          {/* Progress Bar */}
          <circle
            className="text-blue-500 transition-all duration-1000 ease-in-out dark:text-cyan-300"
            cx="50"
            cy="50"
            fill="transparent"
            r={radius}
            stroke="currentColor"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeWidth="8"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-2xl font-black text-text-primary dark:text-white">{value}%</span>
          <span className="text-[10px] font-medium uppercase tracking-widest text-text-secondary dark:text-text-secondary">Level 4</span>
        </div>
      </div>
      
      <div className="mt-4 border-t border-borderTone pt-4 dark:border-borderTone">
        <p className="text-[11px] italic leading-relaxed text-text-secondary dark:text-text-secondary">
          {value >= 90 ? 'Ready for Final Exam' : value >= 75 ? 'Expert Proficiency' : 'Developing Core Logic'}
        </p>
      </div>
    </div>
  );
};
