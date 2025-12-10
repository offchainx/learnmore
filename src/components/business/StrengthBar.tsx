import React from 'react';

interface StrengthBarProps {
  label: string;
  value: number;
  level: string;
  levelColor: string;
  suggestion?: string;
}

const StrengthBar: React.FC<StrengthBarProps> = ({ label, value, level, levelColor, suggestion }) => (
  <div className="mb-6 last:mb-0">
    <div className="flex justify-between items-end mb-2">
      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{label}</span>
      <div className="flex items-center gap-3">
         <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${levelColor} text-white`}>{level}</span>
         <span className="text-sm font-bold text-slate-600 dark:text-slate-400 w-8 text-right">{value}%</span>
      </div>
    </div>
    <div className="w-full bg-slate-200 dark:bg-white/5 rounded-full h-2.5 mb-1">
      <div 
        className={`h-2.5 rounded-full transition-all duration-1000 ${
          value >= 90 ? 'bg-emerald-500' : value >= 75 ? 'bg-blue-500' : value >= 60 ? 'bg-yellow-500' : 'bg-orange-500'
        }`} 
        style={{ width: `${value}%` }}
      ></div>
    </div>
    {suggestion && (
      <p className="text-xs text-orange-500 flex items-center gap-1 mt-1">
        ↑ {suggestion}
      </p>
    )}
  </div>
);

export default StrengthBar;
