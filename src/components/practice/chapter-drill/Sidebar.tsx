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
    <aside className="hidden h-full w-72 flex-col gap-8 border-r border-borderTone bg-[linear-gradient(180deg,hsl(var(--surface-default))_0%,hsl(var(--surface-muted))_100%)] p-6 text-text-primary shadow-[inset_-1px_0_0_rgba(255,255,255,0.22)] dark:border-borderTone dark:bg-surface-subtle dark:text-white lg:flex">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-bold uppercase tracking-widest text-text-secondary dark:text-text-secondary">Academic Mode</p>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">Mission: {subjectName}</h1>
      </div>

      <Gauge value={stats.mastery} />

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-text-secondary dark:text-text-secondary">
            <Zap className="w-[18px]" />
            <span>Session Time</span>
          </div>
          <span className="font-bold text-slate-900 dark:text-white">{stats.sessionTime}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-text-secondary dark:text-text-secondary">
            <Zap className="w-[18px] fill-current" />
            <span>Streak</span>
          </div>
          <span className="font-bold text-blue-600 dark:text-cyan-300">{stats.streak} 🔥</span>
        </div>
      </div>

      <nav className="flex flex-col gap-2 overflow-y-auto pr-2">
        <p className="mb-2 text-xs font-bold uppercase text-text-secondary dark:text-text-secondary">Chapter Log</p>
        {chapters.length > 0 ? (
           chapters.map((ch) => (
            <div
              key={ch.id}
              className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                ch.isActive
                  ? 'border border-blue-200 bg-blue-50 text-blue-700 shadow-surface dark:border-cyan-400/20 dark:bg-white/10 dark:text-white'
                  : 'text-text-secondary hover:bg-surface hover:text-text-primary dark:text-text-secondary dark:hover:bg-white/5 dark:hover:text-white'
              }`}
            >
              {ch.isLocked ? (
                <Lock className="w-5 h-5 opacity-50" />
              ) : ch.isActive ? (
                <CheckCircle className="w-5 h-5 text-blue-600 dark:text-cyan-300" />
              ) : (
                <Circle className="w-5 h-5 opacity-50" />
              )}
              <p className="text-sm font-medium truncate">{ch.title}</p>
            </div>
          ))
        ) : (
           // Fallback/Current
           <div
            className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-blue-700 shadow-surface dark:border-cyan-400/20 dark:bg-white/10 dark:text-white"
          >
            <CheckCircle className="w-5 h-5 text-blue-600 dark:text-cyan-300" />
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{chapterTitle}</p>
          </div>
        )}
       
      </nav>
    </aside>
  );
};
