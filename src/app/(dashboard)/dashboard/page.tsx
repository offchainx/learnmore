'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import SubjectCard from '@/components/business/SubjectCard';
import CircularProgress from '@/components/business/CircularProgress';
import StrengthBar from '@/components/business/StrengthBar';
import DailyInspiration from '@/components/business/DailyInspiration';

// Lucide Icons used directly in DashboardPage
import { Clock, PenTool, Target, Zap, Trophy, Calculator, Atom, FlaskConical, ScrollText, Languages, BookOpen, ChevronRight, PlayCircle } from 'lucide-react';

// --- Types & Translations ---

type Lang = 'en' | 'zh';

const translations = {
  en: {
    menu: 'Menu',
    dashboard: 'Dashboard',
    courses: 'My Courses',
    questionBank: 'Question Bank',
    mistakeBook: 'Mistake Book',
    leaderboard: 'Leaderboard',
    community: 'Community',
    account: 'Account',
    settings: 'Settings',
    logout: 'Log Out',
    welcome: 'Welcome back, Alex! 👋',
    welcomeSub: 'You have 4 tasks due this week. Keep up the momentum!',
    search: 'Search...',
    streak: '12 Day Streak',
    studyTime: '4.5h', // Changed to string for display directly
    questions: '128', // Changed to string
    accuracy: '92%', // Changed to string
    mistakes: '12', // Changed to string
    statsTitle: 'Learning Performance',
    statsSub: 'Overview of your practice and exam performance',
    percentile: 'Percentile Rank',
    practiceAvg: 'Practice Avg',
    mockAvg: 'Mock Exam Avg',
    mySubjects: 'My Subjects',
    viewAll: 'View All',
    continueLearning: 'Continue Learning',
    dailyQuests: 'Daily Quests',
    subjectAnalysis: 'Subject Strength Analysis',
    subjectAnalysisSub: 'Targeted improvement for weak areas',
    math: 'Math',
    physics: 'Physics',
    chemistry: 'Chemistry',
    biology: 'Biology',
    english: 'English',
    chinese: 'Chinese',
    startLesson: 'Start Lesson',
    advanced: 'Advanced',
    proficient: 'Proficient',
    intermediate: 'Intermediate',
    basic: 'Basic',
    suggestion: 'Needs Practice',
    dailyInspiration: 'Daily Inspiration',
    generating: 'Painting your daily vibe...',
    regenerate: 'New Vibe',
  },
  zh: {
    menu: '菜单',
    dashboard: '仪表盘',
    courses: '我的课程',
    questionBank: '题库',
    mistakeBook: '错题本',
    leaderboard: '排行榜',
    community: '社区',
    account: '账户',
    settings: '设置',
    logout: '退出登录',
    welcome: '欢迎回来，Alex！👋',
    welcomeSub: '本周有4个待办任务，保持好状态！',
    search: '搜索...',
    streak: '12天 连胜',
    studyTime: '4.5小时',
    questions: '128题',
    accuracy: '92%',
    mistakes: '12题',
    statsTitle: '学习成绩统计',
    statsSub: '查看你在练习和考试中的表现',
    percentile: '百分位排名',
    practiceAvg: '练习平均分',
    mockAvg: '模拟考试平均分',
    mySubjects: '我的学科',
    viewAll: '查看全部',
    continueLearning: '继续学习',
    dailyQuests: '每日任务',
    subjectAnalysis: '科目强弱分析',
    subjectAnalysisSub: '针对性提升薄弱环节',
    math: '数学',
    physics: '物理',
    chemistry: '化学',
    biology: '生物',
    english: '英语',
    chinese: '语文',
    startLesson: '开始学习',
    advanced: '高级',
    proficient: '熟练',
    intermediate: '中级',
    basic: '基础',
    suggestion: '建议加强练习',
    dailyInspiration: '每日灵感',
    generating: '正在生成今日氛围...',
    regenerate: '刷新灵感',
  }
};


export default function DashboardPage() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>('en'); // Default to English
  const t = translations[lang];

  // Dummy data for now
  const welcomeMessage = t.welcome;
  const welcomeSubMessage = t.welcomeSub;

  const handleLogout = () => {
    // Implement actual logout logic here
    alert("Logout not implemented yet!");
    router.push('/');
  };

  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 scroll-smooth dark:bg-[#020617]">
          
      {/* Welcome & Daily Inspiration Banner */}
      <DailyInspiration 
        lang={lang} 
        t={t} 
        welcomeTitle={welcomeMessage}
        welcomeSub={welcomeSubMessage}
      />

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        {[
          { label: t.studyTime, val: '4.5h', icon: Clock, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/20' },
          { label: t.questions, val: '128', icon: PenTool, color: 'text-purple-500 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/20' },
          { label: t.accuracy, val: '92%', icon: Target, color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/20' },
          { label: t.mistakes, val: '12', icon: Zap, color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/20' },
        ].map((stat, i) => (
          <Card key={i} className="border-none bg-white dark:bg-[#0a0a0a] p-4 flex flex-col justify-between h-28 relative overflow-hidden group shadow-sm hover:shadow-md transition-all border border-slate-200 dark:border-transparent">
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

      {/* Learning Performance Stats (New Section) */}
      <section className="animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{t.statsTitle}</h2>
        <p className="text-sm text-slate-500 mb-4">{t.statsSub}</p>
        <Card className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 p-8">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <CircularProgress value={65} color="text-blue-500" label={t.percentile} subLabel={t.statsSub} />
              <CircularProgress value={82} color="text-emerald-500" label={t.practiceAvg} subLabel={t.accuracy} />
              <CircularProgress value={64} color="text-purple-500" label={t.mockAvg} subLabel={t.accuracy} />
           </div>
        </Card>
      </section>

      {/* Core Subjects Grid */}
      <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
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

      {/* Main Layout: Course vs Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        
        {/* Left Col: Continue Learning */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t.continueLearning}</h2>
          </div>
          <div className="space-y-4">
            {[
              { title: "Quadratic Equations", subject: t.math, time: "15 min left", progress: 75, color: "bg-blue-500" },
              { title: "Newton's Second Law", subject: t.physics, time: t.startLesson, progress: 0, color: "bg-purple-500" },
              { title: "Periodic Table Groups", subject: t.chemistry, time: "5 min left", progress: 90, color: "bg-emerald-500" },
            ].map((item, idx) => (
              <div key={idx} className="group flex items-center p-4 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 hover:border-blue-300 dark:hover:border-white/10 hover:shadow-md transition-all cursor-pointer">
                <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mr-4 group-hover:scale-105 transition-transform relative overflow-hidden ring-1 ring-slate-200 dark:ring-white/5">
                   <PlayCircle className="h-6 w-6 text-slate-400 dark:text-slate-300 group-hover:text-blue-500 dark:group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">{item.title}</h3>
                    <span className="text-xs text-slate-500">{item.time}</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">{item.subject}</p>
                  <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-1.5 overflow-hidden">
                    <div className={`h-1.5 rounded-full ${item.color} shadow-sm`} style={{ width: `${item.progress}%` }}></div>
                  </div>
                </div>
                <div className="ml-4">
                  <Button size="sm" variant="ghost" className="rounded-xl h-9 w-9 p-0 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10">
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Daily Quests */}
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t.dailyQuests}</h2>
          <Card className="bg-white dark:bg-[#0a0a0a] border-none p-5 space-y-4 shadow-sm border border-slate-200 dark:border-white/5">
            {[
              { title: "Solve 5 Math Problems", reward: "50 XP", done: true },
              { title: "Review 3 Mistakes", reward: "30 XP", done: false },
              { title: "Read Chapter 4 (Eng)", reward: "20 XP", done: false },
            ].map((quest, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${quest.done ? 'bg-green-500 border-green-500' : 'border-slate-400 dark:border-slate-600 group-hover:border-slate-600 dark:group-hover:border-slate-400'}`}>
                    {quest.done && <Zap className="w-3 h-3 text-white fill-white" />}
                  </div>
                  <span className={`text-sm ${quest.done ? 'text-slate-400 line-through' : 'text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'}`}>{quest.title}</span>
                </div>
                <span className="text-xs font-bold text-yellow-600 dark:text-yellow-500 bg-yellow-100 dark:bg-yellow-500/10 px-2 py-1 rounded border border-yellow-200 dark:border-yellow-500/20">{quest.reward}</span>
              </div>
            ))}
            <Button fullWidth variant="outline" size="sm" className="mt-2 text-xs border-dashed border-slate-300 dark:border-white/20 hover:border-slate-400 dark:hover:border-white/40 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">View All Quests</Button>
          </Card>

          {/* Leaderboard Teaser */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/40 border border-indigo-100 dark:border-white/10 relative overflow-hidden shadow-sm group hover:border-indigo-200 dark:hover:border-white/20 transition-all cursor-pointer">
             <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-indigo-900 dark:text-white">{t.leaderboard}</h3>
                  <p className="text-xs text-indigo-600 dark:text-indigo-200 mt-1">Top 15% this week!</p>
                </div>
                <Trophy className="h-8 w-8 text-yellow-500 drop-shadow-sm" />
             </div>
             <div className="mt-4 space-y-2 relative z-10">
                <div className="flex items-center justify-between text-xs bg-white/60 dark:bg-black/30 backdrop-blur-sm p-2 rounded-lg text-slate-800 dark:text-slate-200">
                  <span className="font-bold">1. Sarah K.</span>
                  <span className="text-yellow-600 dark:text-yellow-400 font-bold">2,400 XP</span>
                </div>
                <div className="flex items-center justify-between text-xs bg-white dark:bg-white/10 backdrop-blur-sm p-2 rounded-lg border border-white/50 dark:border-white/20 shadow-sm text-slate-900 dark:text-white">
                  <span className="font-bold">12. Alex S. (You)</span>
                  <span className="text-blue-600 dark:text-blue-300 font-bold">1,250 XP</span>
                </div>
             </div>
          </div>
        </div>
      </div>
      
      {/* Subject Strength Analysis (New Section - Bottom) */}
      <section className="animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
         <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{t.subjectAnalysis}</h2>
         <p className="text-sm text-slate-500 mb-4">{t.subjectAnalysisSub}</p>
         
         {/* Subject Tabs */}
         <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
            {[t.math, t.chinese, t.english, t.physics, t.chemistry, t.biology].map((sub, i) => (
              <button key={i} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${i === 0 ? 'bg-slate-900 dark:bg-white text-white dark:text-black' : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'}`}>
                {sub}
              </button>
            ))}
         </div>

         <Card className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 p-6">
            <StrengthBar label="Rational Numbers" value={85} level={t.advanced} levelColor="bg-emerald-600" />
            <StrengthBar label="Integer Addition/Subtraction" value={78} level={t.proficient} levelColor="bg-blue-600" />
            <StrengthBar label="Linear Equations" value={92} level={t.proficient} levelColor="bg-emerald-600" />
            <StrengthBar label="Geometry Basics" value={65} level={t.intermediate} levelColor="bg-yellow-600" />
            <StrengthBar label="Real Numbers" value={55} level={t.intermediate} levelColor="bg-orange-500" suggestion={t.suggestion} />
            <StrengthBar label="Coordinate System" value={88} level={t.advanced} levelColor="bg-emerald-600" />
            <StrengthBar label="Systems of Equations" value={45} level={t.basic} levelColor="bg-orange-600" suggestion={t.suggestion} />
         </Card>
      </section>

    </main>
  );
}