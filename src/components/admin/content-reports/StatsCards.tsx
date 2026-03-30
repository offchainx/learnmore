"use client"

import React from 'react';
import { ClipboardList, CheckCircle2, Clock, ArrowUp, TrendingUp, ArrowDown } from 'lucide-react';
import { useApp } from '@/providers';
import { getReportsI18n } from './i18n';
import { Card, CardContent } from '@/components/ui/card';

export const StatsCards: React.FC = () => {
  const { lang } = useApp();
  const text = getReportsI18n(lang).stats;

  return (
    <div className="mb-8 grid grid-cols-1 gap-6 tablet:grid-cols-3">
      {/* Pending Reports */}
      <Card className="group relative overflow-hidden rounded-[28px] border-borderTone bg-[linear-gradient(180deg,hsl(var(--surface-default)),hsl(var(--state-danger-bg)))] hover:border-[hsl(var(--border-strong))] dark:border-borderTone dark:bg-surface">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
          <ClipboardList size={72} className="text-red-500" />
        </div>
        <CardContent className="relative z-10 p-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-red-500 shadow-glow-red animate-pulse"></div>
            <span className="text-xs font-semibold uppercase tracking-wider text-text-tertiary dark:text-text-tertiary">{text.pendingReports}</span>
          </div>
          <div className="mb-1 text-4xl font-bold text-text-primary dark:text-text-primary">24</div>
          <div className="flex items-center text-xs font-medium text-state-danger-fg dark:text-state-danger-fg">
            <ArrowUp size={14} className="mr-0.5" />
            <span>{text.sinceYesterday}</span>
          </div>
        </CardContent>
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
      </Card>

      {/* Resolved Today */}
      <Card className="group relative overflow-hidden rounded-[28px] border-borderTone bg-[linear-gradient(180deg,hsl(var(--surface-default)),hsl(var(--state-success-bg)))] hover:border-[hsl(var(--border-strong))] dark:border-borderTone dark:bg-surface">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
          <CheckCircle2 size={72} className="text-green-500" />
        </div>
        <CardContent className="relative z-10 p-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-glow-green"></div>
            <span className="text-xs font-semibold uppercase tracking-wider text-text-tertiary dark:text-text-tertiary">{text.resolvedToday}</span>
          </div>
          <div className="mb-1 text-4xl font-bold text-text-primary dark:text-text-primary">18</div>
          <div className="flex items-center text-xs font-medium text-state-success-fg dark:text-state-success-fg">
            <TrendingUp size={14} className="mr-0.5" />
            <span>{text.resolutionRate}</span>
          </div>
        </CardContent>
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-green-500/50 to-transparent"></div>
      </Card>

      {/* Avg. Resolution Time */}
      <Card className="group relative overflow-hidden rounded-[28px] border-borderTone bg-[linear-gradient(180deg,hsl(var(--surface-default)),hsl(var(--state-info-bg)))] hover:border-[hsl(var(--border-strong))] dark:border-borderTone dark:bg-surface">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
          <Clock size={72} className="text-[hsl(var(--state-info-fg))]" />
        </div>
        <CardContent className="relative z-10 p-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-2 w-2 rounded-full bg-[hsl(var(--state-info-fg))] shadow-glow-blue"></div>
            <span className="text-xs font-semibold uppercase tracking-wider text-text-tertiary dark:text-text-tertiary">{text.avgResolutionTime}</span>
          </div>
          <div className="mb-1 text-4xl font-bold text-text-primary dark:text-text-primary">2.5<span className="ml-1 text-lg font-normal text-text-tertiary dark:text-text-tertiary">{text.hours}</span></div>
          <div className="flex items-center text-xs font-medium text-state-info-fg dark:text-state-info-fg">
            <ArrowDown size={14} className="mr-0.5" />
            <span>{text.fromLastWeek}</span>
          </div>
        </CardContent>
        <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-transparent via-[hsl(var(--state-info-fg))]/50 to-transparent"></div>
      </Card>
    </div>
  );
};
