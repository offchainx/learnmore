
import React from 'react';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'outline';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  icon?: any;
  className?: string;
  animate?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'neutral', 
  size = 'md', 
  icon: Icon, 
  className = '', 
  animate = false 
}) => {
  const baseStyles = "inline-flex items-center rounded-full font-bold uppercase tracking-wider justify-center";
  
  const variants = {
    primary: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800",
    success: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800",
    warning: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800",
    danger: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800",
    neutral: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
    outline: "bg-transparent text-slate-500 border border-slate-300 dark:border-slate-600",
  };

  const sizes = {
    sm: "px-1.5 py-0.5 text-[9px]",
    md: "px-2.5 py-1 text-[10px] md:text-xs",
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className} ${animate ? 'animate-pulse' : ''}`}>
      {Icon && <Icon className={`w-3 h-3 mr-1 ${animate ? 'animate-spin' : ''}`} />}
      {children}
    </span>
  );
};
