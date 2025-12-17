import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glow';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  className = '', 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-full font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:pointer-events-none disabled:opacity-50 active:scale-95";
  
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-200 shadow-lg",
    glow: "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:bg-blue-500 hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] border border-blue-400/30",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 backdrop-blur-md border border-slate-200 dark:border-white/10",
    outline: "border border-slate-200 dark:border-white/20 bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 text-slate-900 dark:text-white",
    ghost: "hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white",
  };

  const sizes = {
    sm: "h-8 px-4 text-xs",
    md: "h-10 px-6 py-2 text-sm",
    lg: "h-12 px-8 text-base",
    xl: "h-14 px-10 text-lg font-semibold",
  };

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};