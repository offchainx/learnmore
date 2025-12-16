import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, active = false, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-200 group relative overflow-hidden ${
      active 
        ? 'text-blue-600 dark:text-white bg-blue-50 dark:bg-slate-800' 
        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
    }`}
  >
    {active && (
      <div className="absolute inset-0 border-l-4 border-blue-500 bg-gradient-to-r from-blue-100/50 to-transparent dark:from-blue-600/10 dark:to-transparent" />
    )}
    <div className="flex items-center justify-center w-5 h-5 mr-3 relative z-10 shrink-0">
      <Icon className={`w-full h-full ${active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'}`} />
    </div>
    <span className="relative z-10">{label}</span>
  </button>
);
