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
    <aside className="hidden h-full w-72 flex-col gap-8 border-r border-borderTone bg-[linear-gradient(180deg,hsl(var(--surface-default))_0%,hsl(var(--surface-muted))_100%)] p-6 text-text-primary shadow-[inset_-1px_0_0_rgba(255,255,255,0.22)] dark:border-borderTone dark:bg-surface-subtle dark:text-text-primary lg:flex">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-bold uppercase tracking-widest text-text-secondary dark:text-text-secondary">Academic Mode</p>
        <h1 className="text-lg font-bold text-text-primary dark:text-text-primary">Mission: {subjectName}</h1>
      </div>

      <Gauge value={stats.mastery} />

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-text-secondary dark:text-text-secondary">
            <Zap className="w-[18px]" />
            <span>Session Time</span>
          </div>
          <span className="font-bold text-text-primary dark:text-text-primary">{stats.sessionTime}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-text-secondary dark:text-text-secondary">
            <Zap className="w-[18px] fill-current" />
            <span>Streak</span>
          </div>
          <span className="font-bold text-primary dark:text-primary">{stats.streak} 🔥</span>
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
                  ? 'border border-borderTone bg-surface-selected text-primary shadow-surface dark:border-borderTone dark:bg-surface-selected dark:text-primary'
                  : 'text-text-secondary hover:bg-surface hover:text-text-primary dark:text-text-secondary dark:hover:bg-surface-subtle dark:hover:text-text-primary'
              }`}
            >
              {ch.isLocked ? (
                <Lock className="w-5 h-5 opacity-50" />
              ) : ch.isActive ? (
                <CheckCircle className="w-5 h-5 text-primary dark:text-primary" />
              ) : (
                <Circle className="w-5 h-5 opacity-50" />
              )}
              <p className="text-sm font-medium truncate">{ch.title}</p>
            </div>
          ))
        ) : (
           // Fallback/Current
           <div
            className="flex items-center gap-3 rounded-lg border border-borderTone bg-surface-selected px-3 py-2 text-primary shadow-surface dark:border-borderTone dark:bg-surface-selected dark:text-primary"
          >
            <CheckCircle className="w-5 h-5 text-primary dark:text-primary" />
            <p className="truncate text-sm font-medium text-text-primary dark:text-text-primary">{chapterTitle}</p>
          </div>
        )}
       
      </nav>
    </aside>
  );
};
