"use client"

import React from 'react';
import { StatItem } from './types';
import { FileQuestion, CheckCircle2, Hourglass, ShieldCheck, TrendingUp, TrendingDown, HelpCircle } from 'lucide-react';

const IconMap: Record<string, React.ElementType> = {
  'quiz': HelpCircle, // 'quiz' is closer to HelpCircle or FileQuestion
  'check_circle': CheckCircle2,
  'hourglass_empty': Hourglass,
  'verified': ShieldCheck,
  'trending_up': TrendingUp,
  'trending_down': TrendingDown
};

export const StatCard: React.FC<StatItem> = ({ 
  title, 
  value, 
  icon, 
  color, 
  trend, 
  progress, 
  description, 
  isCircular 
}) => {
  
  const getColorClasses = (c: string) => {
    switch(c) {
      case 'blue': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'green': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
      case 'orange': return 'bg-orange-500/10 text-orange-600 dark:text-orange-400';
      case 'purple': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  const IconComponent = IconMap[icon] || HelpCircle;

  // Circular Chart Props
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  // Parse "92%" to 92 for calculation, fallback to 0
  const percentage = parseInt(value.replace(/\D/g, '')) || 0; 
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`glass-card rounded-2xl p-6 relative overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${isCircular ? 'flex flex-row items-center justify-between gap-4' : ''}`}>
      
      {/* Background Icon Decoration (Only for non-circular to avoid clutter) */}
      {!isCircular && (
        <div className="absolute -top-2 -right-2 opacity-[0.03] dark:opacity-[0.05] pointer-events-none group-hover:scale-110 transition-transform duration-500">
           <IconComponent size={96} strokeWidth={1.5} />
        </div>
      )}

      {/* Content Side */}
      <div className="relative z-10 flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getColorClasses(color)}`}>
            <IconComponent size={18} />
          </div>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</span>
        </div>

        <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white desktop:text-3xl">{value}</h3>
        </div>

        {trend && (
          <p className={`text-xs mt-2 flex items-center gap-1.5 font-medium ${trend.isPositive ? 'text-emerald-500' : 'text-orange-500'}`}>
            <span className="bg-current/10 rounded-full p-0.5">
                {trend.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            </span>
            {trend.value} <span className="text-gray-400 dark:text-gray-500 font-normal">{trend.text}</span>
          </p>
        )}

        {progress !== undefined && (
          <div className="mt-4">
             <div className="w-full bg-gray-100 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${color === 'green' ? 'bg-emerald-500' : 'bg-primary'}`} 
                  style={{ width: `${progress}%` }}
                ></div>
             </div>
             {description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{description}</p>}
          </div>
        )}

        {isCircular && description && (
           <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        )}
      </div>

      {/* Circular Chart Side - Perfectly Centered */}
      {isCircular && (
        <div className="relative flex-shrink-0 w-20 h-20 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90 drop-shadow-lg" viewBox="0 0 80 80">
             {/* Track */}
             <circle 
                className="text-gray-100 dark:text-white/5 transition-colors" 
                cx="40" cy="40" r={radius} 
                fill="transparent" 
                stroke="currentColor" 
                strokeWidth="6"
             ></circle>
             {/* Indicator */}
             <circle 
                className="text-purple-500 transition-all duration-1000 ease-out" 
                cx="40" cy="40" r={radius} 
                fill="transparent" 
                stroke="currentColor" 
                strokeWidth="6"
                strokeDasharray={circumference} 
                strokeDashoffset={strokeDashoffset} 
                strokeLinecap="round"
             ></circle>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-purple-500">
              <ShieldCheck size={24} />
          </div>
        </div>
      )}
    </div>
  );
};
