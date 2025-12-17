"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { 
  Map, Play, Zap, Target, Timer, MessageCircle, Trophy, 
  ArrowRight, Rocket
} from 'lucide-react';
import { useApp } from '@/providers/app-provider';

const StudyGuidePage: React.FC = () => {
  const router = useRouter();
  const { lang, setLang } = useApp();
  const [scrollProgress, setScrollProgress] = useState(0);

  const toggleLang = () => {
    const nextLang = lang === 'en' ? 'zh' : 'en';
    setLang(nextLang);
  };

  // Track scroll for progress bar
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scroll = Number(totalScroll / windowHeight);
      setScrollProgress(scroll);
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const t = {
    en: {
      title: "7-Day Rookie Challenge",
      subtitle: "Your roadmap from beginner to top scorer.",
      progress: "Journey Progress",
      startBtn: "Start Day 1",
      days: [
        { day: 1, title: "The Awakening", desc: "Every hero needs a map. Take the AI Diagnostic Test to reveal your hidden strengths and weaknesses.", action: "Start Diagnosis", link: "/dashboard", icon: Map, color: "from-blue-400 to-cyan-400", shadow: "shadow-cyan-500/50" },
        { day: 2, title: "First Blood", desc: "Step into the arena. Complete your first 5-minute adaptive micro-lesson.", action: "Start Lesson", link: "/dashboard", icon: Play, color: "from-emerald-400 to-green-400", shadow: "shadow-emerald-500/50" },
        { day: 3, title: "Mistake Crusher", desc: "Failure is just data. Visit your Mistake Book and fix 5 errors to turn them into XP.", action: "Fix Mistakes", link: "/dashboard", icon: Zap, color: "from-orange-400 to-red-400", shadow: "shadow-orange-500/50" },
        { day: 4, title: "Precision Strike", desc: "Master a 'Low Confidence' concept. Turn that red indicator into green.", action: "Practice Now", link: "/dashboard", icon: Target, color: "from-purple-400 to-pink-400", shadow: "shadow-purple-500/50" },
        { day: 5, title: "Speed Run", desc: "Race against the clock. Complete a timed quiz with >80% accuracy.", action: "Start Quiz", link: "/dashboard", icon: Timer, color: "from-red-500 to-rose-500", shadow: "shadow-red-500/50" },
        { day: 6, title: "Guild Hall", desc: "You are not alone. Ask a question or share a tip in the Community Hub.", action: "Visit Community", link: "/dashboard", icon: MessageCircle, color: "from-indigo-400 to-violet-400", shadow: "shadow-indigo-500/50" },
        { day: 7, title: "Champion's Rise", desc: "Check the Leaderboard. Have you cracked the top 10%? Claim your weekly chest.", action: "Check Rank", link: "/dashboard", icon: Trophy, color: "from-yellow-300 to-amber-500", shadow: "shadow-yellow-500/50" }
      ],
      footer: "© 2025 LearnMore Edu. All rights reserved."
    },
    zh: {
      title: "7天新手极速挑战",
      subtitle: "从入门到精通的进阶路线图。",
      progress: "挑战进度",
      startBtn: "开始第 1 天",
      days: [
        { day: 1, title: "觉醒时刻", desc: "每个英雄都需要地图。完成 AI 诊断测试，揭示你隐藏的强项与弱点。", action: "开始诊断", link: "/dashboard", icon: Map, color: "from-blue-400 to-cyan-400", shadow: "shadow-cyan-500/50" },
        { day: 2, title: "首战告捷", desc: "踏入竞技场。完成你的第一节 5 分钟自适应微课。", action: "开始学习", link: "/dashboard", icon: Play, color: "from-emerald-400 to-green-400", shadow: "shadow-emerald-500/50" },
        { day: 3, title: "错题粉碎机", desc: "失败只是数据。访问错题本并修正 5 个错误，将它们转化为经验值。", action: "消灭错题", link: "/dashboard", icon: Zap, color: "from-orange-400 to-red-400", shadow: "shadow-orange-500/50" },
        { day: 4, title: "精准打击", desc: "攻克一个“低置信度”概念。把那个红色指标变成绿色。", action: "立即练习", link: "/dashboard", icon: Target, color: "from-purple-400 to-pink-400", shadow: "shadow-purple-500/50" },
        { day: 5, title: "极速挑战", desc: "与时间赛跑。完成一次计时测验，并达到 80% 以上准确率。", action: "开始测验", link: "/dashboard", icon: Timer, color: "from-red-500 to-rose-500", shadow: "shadow-red-500/50" },
        { day: 6, title: "公会大厅", desc: "你并不孤单。在社区发布一个问题或分享一条学习技巧。", action: "访问社区", link: "/dashboard", icon: MessageCircle, color: "from-indigo-400 to-violet-400", shadow: "shadow-indigo-500/50" },
        { day: 7, title: "王者加冕", desc: "查看排行榜。你进入前 10% 了吗？领取你的周宝箱。", action: "查看排名", link: "/dashboard", icon: Trophy, color: "from-yellow-300 to-amber-500", shadow: "shadow-yellow-500/50" }
      ],
      footer: "© 2025 LearnMore Edu. 保留所有权利。"
    }
  };

  const currentT = t[lang as keyof typeof t] || t['en'];

  return (
    <div className="min-h-screen bg-[#050b14] text-white font-sans selection:bg-blue-500/30 selection:text-blue-100 overflow-x-hidden">
      <Navbar lang={lang} onToggleLang={toggleLang} />

      {/* Sticky Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1.5 z-50 bg-slate-900">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-100"
          style={{ width: `${scrollProgress * 100}%` }}
        ></div>
      </div>

      <main className="pt-32 pb-20 relative">
        
        {/* Background Ambient Effects */}
        <div className="fixed inset-0 pointer-events-none">
           <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]"></div>
           <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px]"></div>
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        </div>

        {/* Hero Header */}
        <div className="relative z-10 text-center px-6 mb-24 animate-fade-in-up">
           <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 backdrop-blur-md border border-slate-700/50 text-yellow-400 text-sm font-bold uppercase tracking-widest mb-6 shadow-2xl">
              <Rocket className="w-4 h-4 fill-yellow-400" /> Guide
           </div>
           <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 drop-shadow-sm">
              {currentT.title}
           </h1>
           <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              {currentT.subtitle}
           </p>
           <Button size="xl" variant="glow" onClick={() => {
              const el = document.getElementById('day-1');
              el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
           }} className="px-10 py-6 text-lg rounded-full shadow-[0_0_40px_rgba(59,130,246,0.3)]">
              {currentT.startBtn}
           </Button>
        </div>

        {/* The Game Map */}
        <div className="max-w-5xl mx-auto px-6 relative z-10">
           
           {/* Center Line connecting the cards */}
           <div className="absolute left-1/2 top-0 bottom-32 w-1 bg-gradient-to-b from-blue-500/0 via-blue-500/20 to-blue-500/0 -translate-x-1/2 hidden md:block"></div>

           <div className="space-y-32">
              {currentT.days.map((item, index) => {
                 const isEven = index % 2 === 0;
                 return (
                    <div 
                      key={index} 
                      id={`day-${item.day}`}
                      className={`relative flex flex-col md:flex-row items-center gap-12 md:gap-24 ${isEven ? '' : 'md:flex-row-reverse'}`}
                    >
                       
                       {/* The Card */}
                       <div className="w-full md:w-1/2 group perspective-1000">
                          <div className={`
                             relative bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 transition-all duration-500 hover:scale-105 hover:bg-slate-800/60 hover:border-white/20 hover:shadow-2xl
                             ${isEven ? 'text-left' : 'text-left md:text-right'}
                          `}>
                             {/* Floating Number Behind */}
                             <div className={`
                                absolute -top-10 text-[120px] font-black text-white/5 pointer-events-none select-none z-0 transition-transform duration-700 group-hover:scale-110
                                ${isEven ? 'right-4' : 'left-4'}
                             `}>
                                {item.day}
                             </div>

                             {/* Content */}
                             <div className="relative z-10">
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-gradient-to-r ${item.color} bg-opacity-20 text-white text-xs font-bold uppercase tracking-wider mb-4 shadow-lg`}>
                                   Day {item.day}
                                </div>
                                <h3 className={`text-3xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${item.color} transition-all`}>
                                   {item.title}
                                </h3>
                                <p className="text-slate-400 text-lg leading-relaxed mb-8">
                                   {item.desc}
                                </p>
                                <div className={`flex ${isEven ? 'justify-start' : 'justify-start md:justify-end'}`}>
                                   <Button 
                                      variant="outline"
                                      onClick={() => router.push(item.link)} 
                                      className="border-slate-600 hover:border-white text-slate-300 hover:text-white hover:bg-white/5"
                                   >
                                      {item.action} <ArrowRight className="w-4 h-4 ml-2" />
                                   </Button>
                                </div>
                             </div>
                          </div>
                       </div>

                       {/* The Node (Center Icon) */}
                       <div className="relative shrink-0 z-20">
                          <div className={`
                             w-20 h-20 rounded-2xl rotate-3 flex items-center justify-center bg-gradient-to-br ${item.color} ${item.shadow} shadow-2xl transition-transform duration-500 hover:rotate-6 hover:scale-110
                          `}>
                             <item.icon className="w-8 h-8 text-white fill-white/20" />
                          </div>
                          {/* Connector Line for Mobile */}
                          {index !== currentT.days.length - 1 && (
                             <div className="absolute top-20 left-1/2 w-0.5 h-32 bg-gradient-to-b from-white/20 to-transparent -translate-x-1/2 md:hidden"></div>
                          )}
                       </div>

                       {/* Empty Spacer for layout balance */}
                       <div className="hidden md:block w-1/2"></div>

                    </div>
                 );
              })}
           </div>

           {/* Final Reward */}
           <div className="text-center pt-32 pb-12 animate-fade-in-up">
              <div className="relative inline-block group cursor-pointer">
                 <div className="absolute inset-0 bg-yellow-500 blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
                 <div className="relative w-24 h-24 bg-gradient-to-b from-yellow-300 to-yellow-600 rounded-3xl flex items-center justify-center shadow-2xl transform transition-transform group-hover:-translate-y-2">
                    <Trophy className="w-12 h-12 text-white drop-shadow-md" />
                 </div>
              </div>
              <h2 className="text-3xl font-bold text-white mt-8 mb-4">Ready for Greatness?</h2>
              <p className="text-slate-400 mb-8">Your journey to mastery begins now.</p>
              <Button size="xl" variant="glow" onClick={() => router.push('/dashboard')} className="px-12 rounded-full">
                 Enter Dashboard
              </Button>
           </div>

        </div>

      </main>

      <footer className="bg-[#020617] border-t border-slate-900 py-10 text-center text-slate-600 text-sm">
         <div className="max-w-7xl mx-auto px-4">
            <p>{currentT.footer}</p>
         </div>
      </footer>
    </div>
  );
};

export default StudyGuidePage;