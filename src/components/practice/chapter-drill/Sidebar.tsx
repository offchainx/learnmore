import React from 'react';
import { Gauge } from './Gauge';
import { UserStats } from './types';
import { CheckCircle, Circle, Lock, Zap } from 'lucide-react';

interface SidebarChapter {
  id: string;
  title: string;
  isCompleted: boolean;
  isLocked: boolean;
  isActive: boolean;
}

interface SidebarProps {
  stats: UserStats;
  chapterTitle: string;
  subjectName: string;
  chapters?: SidebarChapter[];
}

export const Sidebar: React.FC<SidebarProps> = ({ stats, chapterTitle, subjectName, chapters = [] }) => {
  return (
    <aside className="w-72 border-r border-[#232348]/30 bg-[#f6f6f8] dark:bg-[#0c0c1a] p-6 flex flex-col gap-8 hidden lg:flex h-full">
      <div className="flex flex-col gap-1">
        <p className="text-[#9292c9] text-xs uppercase tracking-widest font-bold">Academic Mode</p>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">Mission: {subjectName}</h1>
      </div>

      <Gauge value={stats.mastery} />

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-[#9292c9]">
            <Zap className="w-[18px]" />
            <span>Session Time</span>
          </div>
          <span className="font-bold text-slate-900 dark:text-white">{stats.sessionTime}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-[#9292c9]">
            <Zap className="w-[18px] fill-current" />
            <span>Streak</span>
          </div>
          <span className="font-bold text-[#1111d4]">{stats.streak} 🔥</span>
        </div>
      </div>

      <nav className="flex flex-col gap-2 overflow-y-auto pr-2">
        <p className="text-xs font-bold text-[#9292c9] uppercase mb-2">Chapter Log</p>
        {chapters.length > 0 ? (
           chapters.map((ch) => (
            <div
              key={ch.id}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                ch.isActive
                  ? 'bg-[#232348]/40 border border-[#1111d4]/30'
                  : 'text-[#9292c9] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {ch.isLocked ? (
                <Lock className="w-5 h-5 opacity-50" />
              ) : ch.isActive ? (
                <CheckCircle className="w-5 h-5 text-[#1111d4]" />
              ) : (
                <Circle className="w-5 h-5 opacity-50" />
              )}
              <p className="text-sm font-medium truncate">{ch.title}</p>
            </div>
          ))
        ) : (
           // Fallback/Current
           <div
            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#232348]/40 border border-[#1111d4]/30"
          >
            <CheckCircle className="w-5 h-5 text-[#1111d4]" />
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{chapterTitle}</p>
          </div>
        )}
       
      </nav>
    </aside>
  );
};
