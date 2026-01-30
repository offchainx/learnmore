import React from 'react';

export const Header = () => {
  return (
    <header className="h-20 flex items-center justify-between px-8 border-b border-gray-200 dark:border-white/5 z-20 backdrop-blur-md bg-white/70 dark:bg-[#0B0E14]/70 sticky top-0 transition-all duration-300">
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
          <span className="material-icons-round">menu_open</span>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            Content Statistics
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Overview of your content production pipeline</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Date Filter */}
        <div className="hidden md:flex items-center bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl p-1">
          <button className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm transition-all">
            7 Days
          </button>
          <button className="px-4 py-1.5 text-xs font-medium rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-white/5 transition-colors">
            30 Days
          </button>
          <button className="px-4 py-1.5 text-xs font-medium rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-white/5 transition-colors">
            All Time
          </button>
        </div>
        
        <div className="h-8 w-px bg-gray-200 dark:bg-white/10 mx-1"></div>

        {/* Actions */}
        <button className="relative p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors">
            <span className="material-icons-round">notifications_none</span>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#0B0E14]"></span>
        </button>

        <button className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95">
          <span className="material-icons-round text-lg">file_download</span>
          <span>Export Report</span>
        </button>
      </div>
    </header>
  );
};