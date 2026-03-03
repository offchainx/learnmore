"use client"

import React from 'react';
import { ClipboardList, CheckCircle2, Clock, ArrowUp, TrendingUp, ArrowDown } from 'lucide-react';
import { useApp } from '@/providers';
import { getReportsI18n } from './i18n';

export const StatsCards: React.FC = () => {
  const { lang } = useApp();
  const text = getReportsI18n(lang).stats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Pending Reports */}
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-red-500/30 transition-all duration-300">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
          <ClipboardList size={72} className="text-red-500" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-red-500 shadow-glow-red animate-pulse"></div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{text.pendingReports}</span>
          </div>
          <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">24</div>
          <div className="flex items-center text-xs text-red-500 font-medium">
            <ArrowUp size={14} className="mr-0.5" />
            <span>{text.sinceYesterday}</span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
      </div>

      {/* Resolved Today */}
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-green-500/30 transition-all duration-300">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
          <CheckCircle2 size={72} className="text-green-500" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-glow-green"></div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{text.resolvedToday}</span>
          </div>
          <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">18</div>
          <div className="flex items-center text-xs text-green-500 font-medium">
            <TrendingUp size={14} className="mr-0.5" />
            <span>{text.resolutionRate}</span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-green-500/50 to-transparent"></div>
      </div>

      {/* Avg. Resolution Time */}
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
          <Clock size={72} className="text-blue-500" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-glow-blue"></div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{text.avgResolutionTime}</span>
          </div>
          <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">2.5<span className="text-lg font-normal text-gray-500 ml-1">{text.hours}</span></div>
          <div className="flex items-center text-xs text-blue-500 font-medium">
            <ArrowDown size={14} className="mr-0.5" />
            <span>{text.fromLastWeek}</span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
      </div>
    </div>
  );
};
