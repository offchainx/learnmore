import React from 'react';

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 flex-shrink-0 flex flex-col justify-between bg-white dark:bg-sidebar-dark border-r border-gray-200 dark:border-white/5 transition-colors duration-300 z-30">
      <div>
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-white/5">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-primary/30">
            <span className="material-icons-outlined text-white text-lg">school</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">LearnMore</span>
        </div>
        <nav className="mt-6 px-3 space-y-1">
          <NavItem icon="dashboard" label="Dashboard" />
          <NavItem icon="menu_book" label="Course Learning" />
          <NavItem icon="edit_note" label="Practice Center" />
          <NavItem icon="emoji_events" label="Leaderboard" />
          <NavItem icon="forum" label="Community" />
          
          <div className="space-y-1 pt-2">
            <button className="w-full group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors bg-gray-50 dark:bg-white/5">
              <div className="flex items-center">
                <span className="material-icons-outlined mr-3 text-xl text-primary">verified</span>
                Content Mgmt
              </div>
              <span className="material-icons-outlined text-sm opacity-50 transform rotate-180">expand_more</span>
            </button>
            <div className="pl-11 space-y-1 pt-1 relative">
              <div className="absolute left-6 top-2 bottom-2 w-px bg-gray-200 dark:bg-white/10"></div>
              <SubNavItem label="Bulk Import" />
              <SubNavItem label="Question Review" />
              <SubNavItem label="Content Stats" />
            </div>
          </div>
          
          <div className="pt-2">
            <a href="#" className="group flex items-center px-3 py-2 text-sm font-medium rounded-lg bg-primary/10 dark:bg-[#1C2433] text-primary border border-primary/20 dark:border-primary/30 relative overflow-hidden">
              <div className="absolute inset-y-0 left-0 w-1 bg-primary rounded-r"></div>
              <span className="material-icons-outlined mr-3 text-xl">report_problem</span>
              User Reports
            </a>
          </div>
        </nav>
      </div>

      <div className="p-4 space-y-4 border-t border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/5 backdrop-blur-sm">
        <div className="bg-white dark:bg-[#161B26] rounded-xl p-3 border border-gray-200 dark:border-white/10 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center mb-2 relative z-10">
            <span className="text-xs font-bold text-gray-900 dark:text-white">Level 12</span>
            <span className="material-icons-outlined text-gray-400 text-xs cursor-pointer hover:text-primary">chevron_right</span>
          </div>
          <div className="flex justify-between text-[10px] text-gray-500 mb-1 relative z-10">
            <span>1,250 XP</span>
            <span>2,000</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden relative z-10">
            <div className="bg-primary h-1.5 rounded-full" style={{ width: '62%' }}></div>
          </div>
        </div>
        
        <div>
          <a href="#" className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <span className="material-icons-outlined mr-2 text-lg">settings</span>
            Settings
          </a>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-cyan-400 flex items-center justify-center text-white font-bold text-xs shadow-inner">
            JS
          </div>
          <div className="flex-1">
            <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full text-[10px] font-medium inline-flex items-center gap-1 cursor-pointer hover:bg-red-500/20 transition-colors">
              <span>2 Issues</span>
              <span className="material-icons-outlined text-[10px]">close</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

const NavItem: React.FC<{ icon: string; label: string }> = ({ icon, label }) => (
  <a href="#" className="group flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
    <span className="material-icons-outlined mr-3 text-xl opacity-70">{icon}</span>
    {label}
  </a>
);

const SubNavItem: React.FC<{ label: string }> = ({ label }) => (
  <a href="#" className="block px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
    {label}
  </a>
);
