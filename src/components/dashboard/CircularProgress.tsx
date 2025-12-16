import React from 'react';

interface CircularProgressProps {
  value: number;
  color: string;
  label: string;
  subLabel: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({ value, color, label, subLabel }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200 dark:text-slate-700/50" />
          <circle cx="64" cy="64" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className={color} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
           <span className="text-3xl font-bold text-slate-900 dark:text-white leading-none">{value}</span>
        </div>
      </div>
      <div className="text-center mt-2">
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{label}</p>
        <p className="text-xs text-slate-400">{subLabel}</p>
      </div>
    </div>
  );
};
