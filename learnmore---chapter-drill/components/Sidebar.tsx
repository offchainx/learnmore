
import React from 'react';
import { Gauge } from './Gauge';
import { SIDEBAR_TOPICS } from '../constants';
import { UserStats } from '../types';

interface SidebarProps {
  stats: UserStats;
}

export const Sidebar: React.FC<SidebarProps> = ({ stats }) => {
  return (
    <aside className="w-72 border-r border-slate-accent/30 bg-background-light dark:bg-[#0c0c1a] p-6 flex flex-col gap-8 hidden lg:flex">
      <div className="flex flex-col gap-1">
        <p className="text-slate-text text-xs uppercase tracking-widest font-bold">Academic Mode</p>
        <h1 className="text-lg font-bold">Mission: Algebra</h1>
      </div>

      <Gauge value={stats.mastery} />

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-slate-text">
            <span className="material-symbols-outlined text-[18px]">timer</span>
            <span>Session Time</span>
          </div>
          <span className="font-bold">{stats.sessionTime}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-slate-text">
            <span className="material-symbols-outlined text-[18px]">bolt</span>
            <span>Streak</span>
          </div>
          <span className="font-bold text-primary">{stats.streak} 🔥</span>
        </div>
      </div>

      <nav className="flex flex-col gap-2">
        <p className="text-xs font-bold text-slate-text uppercase mb-2">Chapter Log</p>
        {SIDEBAR_TOPICS.map((topic, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
              topic.active
                ? 'bg-slate-accent/40 border border-primary/30'
                : 'text-slate-text hover:text-white'
            }`}
          >
            <span className={`material-symbols-outlined text-[20px] ${topic.active ? 'text-primary' : ''}`}>
              {topic.icon}
            </span>
            <p className="text-sm font-medium">{topic.name}</p>
          </div>
        ))}
      </nav>
    </aside>
  );
};
