import React from 'react';

interface TabItem {
  id: string;
  label: string;
  icon?: React.ElementType;
}

interface TabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
  variant?: 'pills' | 'underline' | 'cards';
}

export const CustomTabs: React.FC<TabsProps> = ({ items, activeId, onChange, className = '', variant = 'pills' }) => {
  
  if (variant === 'cards') {
    return (
      <div className={`flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl ${className}`}>
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 relative ${
                isActive 
                  ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' 
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {item.icon && <item.icon className="w-4 h-4" />}
              <span className="relative z-10">{item.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Default 'pills' variant
  return (
    <div className={`flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide ${className}`}>
      {items.map((item) => {
        const isActive = activeId === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={`
              relative px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 border
              ${isActive 
                ? 'bg-slate-900 dark:bg-white text-white dark:text-black border-transparent shadow-lg' 
                : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}
            `}
          >
            {item.icon && <item.icon className="w-3.5 h-3.5" />}
            {item.label}
          </button>
        );
      })}
    </div>
  );
};
