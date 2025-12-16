/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { DailyInspiration } from './DailyInspiration';
import { SubjectCard } from './SubjectCard';
import { CircularProgress } from './CircularProgress';
import { StrengthBar } from './StrengthBar';
import { 
  Clock, PenTool, Target, Zap, ChevronDown, Calculator, 
  Atom, FlaskConical, ScrollText, Languages, BookOpen, 
  PlayCircle, ChevronRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardHomeProps {
  t: Record<string, unknown>;
  lang: 'en' | 'zh';
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({ t, lang }) => (
  <div className="w-full">
    {/* Page 1: Top Section */}
    <section className="snap-start min-h-[calc(100vh-5rem)] flex flex-col justify-start gap-6 pb-20 pt-4">
      <DailyInspiration lang={lang} t={t} welcomeTitle={t.welcome as string} welcomeSub={t.welcomeSub as string} />

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        {[
          { label: t.studyTime, val: '4.5h', icon: Clock, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
          { label: t.questions, val: '128', icon: PenTool, color: 'text-purple-500 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30' },
          { label: t.accuracy, val: '92%', icon: Target, color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
          { label: t.mistakes, val: '12', icon: Zap, color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30' },
        ].map((stat, i) => (
          <Card key={i} className="border-none bg-white dark:bg-slate-800 p-4 flex flex-col justify-between h-28 relative overflow-hidden group shadow-sm hover:shadow-md transition-all border border-slate-200 dark:border-transparent">
              <div className={`absolute -right-4 -bottom-4 w-16 h-16 rounded-full ${stat.bg} blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500`}></div>
              <div className="flex justify-between items-start z-10">
                <div className={`p-2 rounded-lg ${stat.bg} dark:bg-opacity-50`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                {i === 2 && <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 bg-emerald-100 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded">+2%</span>}
              </div>
              <div className="z-10">
                <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{stat.val}</div>
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">{stat.label}</div>
              </div>
          </Card>
        ))}
      </div>

      {/* Learning Performance Stats */}
      <section className="flex-1 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t.statsTitle}</h2>
        <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-8 h-full flex flex-col justify-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <CircularProgress value={65} color="text-blue-500" label={t.percentile} subLabel={t.statsSub} />
              <CircularProgress value={82} color="text-emerald-500" label={t.practiceAvg} subLabel={t.accuracy} />
              <CircularProgress value={64} color="text-purple-500" label={t.mockAvg} subLabel={t.accuracy} />
            </div>
        </Card>
      </section>
      
      {/* Scroll Hint */}
      <div className="flex justify-center animate-bounce text-slate-400 opacity-50">
        <ChevronDown className="w-6 h-6" />
      </div>
    </section>

    {/* Page 2: Bottom Section */}
    <section className="snap-start min-h-[calc(100vh-5rem)] flex flex-col gap-8 pt-6 pb-12">
      
      {/* Core Subjects Grid */}
      <div className="animate-fade-in-up">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t.mySubjects}</h2>
            <Button variant="ghost" size="sm" className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white">{t.viewAll}</Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <SubjectCard name={t.math} icon={Calculator} color="text-blue-500 dark:text-blue-400" bgGradient="from-blue-400 to-blue-300" />
          <SubjectCard name={t.physics} icon={Atom} color="text-purple-500 dark:text-purple-400" bgGradient="from-purple-400 to-purple-300" />
          <SubjectCard name={t.chemistry} icon={FlaskConical} color="text-emerald-500 dark:text-emerald-400" bgGradient="from-emerald-400 to-emerald-300" />
          <SubjectCard name={t.biology} icon={ScrollText} color="text-green-500 dark:text-green-400" bgGradient="from-green-400 to-green-300" />
          <SubjectCard name={t.english} icon={Languages} color="text-pink-500 dark:text-pink-400" bgGradient="from-pink-400 to-pink-300" />
          <SubjectCard name={t.chinese} icon={BookOpen} color="text-red-500 dark:text-red-400" bgGradient="from-red-400 to-red-300" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        {/* Left Col: Continue Learning */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t.continueLearning}</h2>
          </div>
          <div className="space-y-3">
            {[
              { title: "Quadratic Equations", subject: t.math, time: `15 ${t.minLeft}`, progress: 75, color: "bg-blue-500" },
              { title: "Newton's Second Law", subject: t.physics, time: t.startLesson, progress: 0, color: "bg-purple-500" },
              { title: "Periodic Table Groups", subject: t.chemistry, time: `5 ${t.minLeft}`, progress: 90, color: "bg-emerald-500" },
            ].map((item, idx) => (
              <div key={idx} className="group flex items-center p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-slate-600 hover:shadow-md transition-all cursor-pointer">
                <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center mr-4 group-hover:scale-105 transition-transform relative overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700">
                   <PlayCircle className="h-5 w-5 text-slate-400 dark:text-slate-300 group-hover:text-blue-500 dark:group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">{item.title}</h3>
                    <span className="text-xs text-slate-500">{item.time}</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">{item.subject}</p>
                  <div className="w-full bg-slate-100 dark:bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
                    <div className={`h-1.5 rounded-full ${item.color} shadow-sm`} style={{ width: `${item.progress}%` }}></div>
                  </div>
                </div>
                <div className="ml-4">
                  <Button size="sm" variant="ghost" className="rounded-xl h-8 w-8 p-0 bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700">
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Daily Quests */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t.dailyQuests}</h2>
          <Card className="bg-white dark:bg-slate-800 border-none p-4 space-y-3 shadow-sm border border-slate-200 dark:border-slate-700/50 h-full">
            {[
              { title: "Solve 5 Math Problems", reward: "50 XP", done: true },
              { title: "Review 3 Mistakes", reward: "30 XP", done: false },
              { title: "Read Chapter 4 (Eng)", reward: "20 XP", done: false },
            ].map((quest, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30 border border-slate-100 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${quest.done ? 'bg-green-500 border-green-500' : 'border-slate-400 dark:border-slate-600 group-hover:border-slate-600 dark:group-hover:border-slate-400'}`}>
                    {quest.done && <Zap className="w-3 h-3 text-white fill-white" />}
                  </div>
                  <span className={`text-sm ${quest.done ? 'text-slate-400 line-through' : 'text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'}`}>{quest.title}</span>
                </div>
                <span className="text-xs font-bold text-yellow-600 dark:text-yellow-500 bg-yellow-100 dark:bg-yellow-500/10 px-2 py-1 rounded border border-yellow-200 dark:border-yellow-500/20">{quest.reward}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
      
      {/* Subject Strength Analysis */}
      <section className="animate-fade-in-up flex-1 flex flex-col justify-end" style={{ animationDelay: '0.2s' }}>
         <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t.subjectAnalysis}</h2>
         <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-6 flex-1">
            <StrengthBar label="Rational Numbers" value={85} level={t.advanced} levelColor="bg-emerald-600" />
            <StrengthBar label="Integer Addition/Subtraction" value={78} level={t.proficient} levelColor="bg-blue-600" />
            <StrengthBar label="Linear Equations" value={92} level={t.proficient} levelColor="bg-emerald-600" />
            <StrengthBar label="Geometry Basics" value={65} level={t.intermediate} levelColor="bg-yellow-600" />
            <StrengthBar label="Real Numbers" value={55} level={t.intermediate} levelColor="bg-orange-500" suggestion={t.suggestion} />
         </Card>
      </section>
    </section>
  </div>
);
