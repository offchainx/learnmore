import React from 'react';

interface GaugeProps {
  value: number;
}

export const Gauge: React.FC<GaugeProps> = ({ value }) => {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="bg-[#232348]/10 rounded-2xl p-6 border border-[#232348]/30 text-center relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#1111d4]/40 to-transparent"></div>
      <p className="text-xs font-bold text-[#9292c9] uppercase tracking-tighter mb-4">Mastery Progress</p>
      
      <div className="relative flex items-center justify-center">
        <svg 
          className="size-32 transform -rotate-90 drop-shadow-[0_0_8px_rgba(17,17,212,0.2)]" 
          viewBox="0 0 100 100"
        >
          {/* Background Track */}
          <circle
            className="text-[#232348]/20"
            cx="50"
            cy="50"
            fill="transparent"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
          />
          {/* Progress Bar */}
          <circle
            className="text-[#1111d4] transition-all duration-1000 ease-in-out"
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
          <span className="text-2xl font-black text-white">{value}%</span>
          <span className="text-[10px] text-[#9292c9] font-medium uppercase tracking-widest">Level 4</span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-[#232348]/20">
        <p className="text-[11px] text-[#9292c9] italic leading-relaxed">
          {value >= 90 ? 'Ready for Final Exam' : value >= 75 ? 'Expert Proficiency' : 'Developing Core Logic'}
        </p>
      </div>
    </div>
  );
};
