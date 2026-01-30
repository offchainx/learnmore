import React from 'react';

export const StatsCards: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Pending Reports */}
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-red-500/30 transition-all duration-300">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
          <span className="material-icons-outlined text-7xl text-red-500">pending_actions</span>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-red-500 shadow-glow-red animate-pulse"></div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Pending Reports</span>
          </div>
          <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">24</div>
          <div className="flex items-center text-xs text-red-500 font-medium">
            <span className="material-icons-outlined text-sm mr-0.5">arrow_upward</span>
            <span>+4 since yesterday</span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
      </div>

      {/* Resolved Today */}
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-green-500/30 transition-all duration-300">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
          <span className="material-icons-outlined text-7xl text-green-500">check_circle</span>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-glow-green"></div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Resolved Today</span>
          </div>
          <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">18</div>
          <div className="flex items-center text-xs text-green-500 font-medium">
            <span className="material-icons-outlined text-sm mr-0.5">trending_up</span>
            <span>94% resolution rate</span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-green-500/50 to-transparent"></div>
      </div>

      {/* Avg. Resolution Time */}
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
          <span className="material-icons-outlined text-7xl text-blue-500">schedule</span>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-glow-blue"></div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Avg. Resolution Time</span>
          </div>
          <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">2.5<span className="text-lg font-normal text-gray-500 ml-1">hrs</span></div>
          <div className="flex items-center text-xs text-blue-500 font-medium">
            <span className="material-icons-outlined text-sm mr-0.5">arrow_downward</span>
            <span>-15min from last week</span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
      </div>
    </div>
  );
};
