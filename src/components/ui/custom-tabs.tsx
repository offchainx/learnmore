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
      <div className={`flex rounded-2xl border border-borderTone bg-surface-subtle p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] dark:bg-surface-subtle dark:shadow-none ${className}`}>
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`relative flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all ${
                isActive 
                  ? 'border border-borderTone bg-surface-selected text-primary shadow-surface dark:border-borderTone dark:bg-surface-inverse dark:text-text-inverse' 
                  : 'text-text-secondary hover:text-text-primary dark:text-text-secondary dark:hover:bg-surface-selected dark:hover:text-text-primary'
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
                ? 'bg-surface-selected text-primary border-borderTone shadow-surface dark:bg-surface-inverse dark:text-text-inverse dark:border-borderTone' 
                : 'bg-surface text-text-secondary border-borderTone hover:bg-surface-subtle hover:text-text-primary dark:bg-surface-subtle dark:text-text-secondary dark:border-borderTone dark:hover:bg-surface-selected dark:hover:text-text-primary'}
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
