"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  BookOpen, Calculator, Globe, Languages, FlaskConical, 
  Map as MapIcon, History, PlayCircle,
  GraduationCap, Briefcase, Layers, Rocket, Sparkles, Brain
} from 'lucide-react';
import { useApp } from '@/providers/app-provider';

const SubjectsPage: React.FC = () => {
  const router = useRouter();
  const { lang, setLang } = useApp();
  
  const toggleLang = () => {
    const nextLang = lang === 'en' ? 'zh' : 'en';
    setLang(nextLang);
  };

  const t = {
    en: {
      hero: {
        title: "One Platform. Every Milestone.",
        subtext: "Your learning data travels with you. From Junior Middle 1 to University.",
        cta: "Explore Curriculum"
      },
      timeline: {
        primary: "Primary",
        junior: "Junior Middle (UEC)",
        senior: "Senior / IGCSE / SPM",
        uni: "Pre-U / University"
      },
      currentFocus: {
        title: "Current Focus: Junior Middle (UEC)",
        tag: "UEC Aligned",
        preview: "Preview Lesson",
        subjects: {
            chinese: "Chinese",
            malay: "Malay (Bahasa)",
            english: "English",
            math: "Mathematics",
            science: "Science",
            history: "History",
            geography: "Geography"
        }
      },
      continuum: {
        title: "Switching systems? No problem.",
        desc: "We map your knowledge, not just your textbook. Our Knowledge Continuum technology preserves your learning history even if you switch from UEC to IGCSE or SPM.",
        feature1: "Universal Knowledge Graph",
        feature2: "Gap Analysis Bridge"
      },
      roadmap: {
        title: "Future Roadmap",
        soon: "Coming Soon",
        desc: "We are rapidly expanding to cover all major curriculums."
      },
      footer: "© 2025 LearnMore Edu. All rights reserved."
    },
    zh: {
      hero: {
        title: "一个平台，伴随每一个里程碑。",
        subtext: "你的学习数据伴你随行。从初一到大学，我们始终相伴。",
        cta: "探索课程"
      },
      timeline: {
        primary: "小学",
        junior: "初中 (UEC 统考)",
        senior: "高中 / IGCSE / SPM",
        uni: "大学预科 / 大学"
      },
      currentFocus: {
        title: "当前核心：初中 (UEC 统考)",
        tag: "UEC 课标对齐",
        preview: "试听课程",
        subjects: {
            chinese: "华文",
            malay: "马来文 (Bahasa)",
            english: "英文",
            math: "数学",
            science: "科学",
            history: "历史",
            geography: "地理"
        }
      },
      continuum: {
        title: "转换学制？没问题。",
        desc: "我们映射你的知识体系，而不仅仅是课本。我们的“知识连续体”技术能够保存你的学习历史，即使你从 UEC 转到 IGCSE 或 SPM。",
        feature1: "通用知识图谱",
        feature2: "能力缺口分析桥梁"
      },
      roadmap: {
        title: "未来规划",
        soon: "即将推出",
        desc: "我们正在快速扩展以覆盖所有主流课程体系。"
      },
      footer: "© 2025 LearnMore Edu. 保留所有权利。"
    }
  };

  const currentT = t[lang as keyof typeof t] || t['en'];

  const subjectsList = [
    { name: currentT.currentFocus.subjects.chinese, icon: BookOpen, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
    { name: currentT.currentFocus.subjects.malay, icon: Languages, color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
    { name: currentT.currentFocus.subjects.english, icon: Globe, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { name: currentT.currentFocus.subjects.math, icon: Calculator, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { name: currentT.currentFocus.subjects.science, icon: FlaskConical, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    { name: currentT.currentFocus.subjects.history, icon: History, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
    { name: currentT.currentFocus.subjects.geography, icon: MapIcon, color: "text-cyan-500", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-blue-500/30 selection:text-blue-100 overflow-x-hidden">
      <Navbar lang={lang === 'ms' ? 'en' : lang} onToggleLang={toggleLang} />

      <main className="pt-28 pb-20">
        
        {/* 1. Hero: The Timeline */}
        <section className="max-w-7xl mx-auto px-6 mb-24">
            <div className="text-center mb-16 animate-fade-in-up">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-white to-blue-200">
                    {currentT.hero.title}
                </h1>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                    {currentT.hero.subtext}
                </p>
            </div>

            {/* Timeline Visual */}
            <div className="relative py-12 px-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-800 -translate-y-1/2 hidden md:block"></div>
                
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                    {[
                        { label: currentT.timeline.primary, icon: Rocket, status: 'past' },
                        { label: currentT.timeline.junior, icon: Layers, status: 'active' },
                        { label: currentT.timeline.senior, icon: Briefcase, status: 'future' },
                        { label: currentT.timeline.uni, icon: GraduationCap, status: 'future' },
                    ].map((item, i) => (
                        <div key={i} className={`flex flex-col items-center gap-4 transition-all duration-300 group ${item.status === 'active' ? 'scale-110' : 'opacity-60 hover:opacity-80'}`}>
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 shadow-2xl transition-all ${
                                item.status === 'active' 
                                    ? 'bg-blue-600 border-blue-400 shadow-blue-500/30' 
                                    : item.status === 'past' 
                                        ? 'bg-slate-800 border-slate-600' 
                                        : 'bg-slate-900 border-slate-700'
                            }`}>
                                <item.icon className={`w-8 h-8 ${item.status === 'active' ? 'text-white' : 'text-slate-400'}`} />
                            </div>
                            <div className="text-center">
                                <div className={`font-bold text-sm md:text-base ${item.status === 'active' ? 'text-blue-400' : 'text-slate-400'}`}>
                                    {item.label}
                                </div>
                                {item.status === 'active' && (
                                    <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-blue-500 animate-pulse">Current Stage</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* 2. Current Focus: UEC Grid */}
        <section className="max-w-7xl mx-auto px-6 mb-32">
            <div className="flex items-center gap-3 mb-8 animate-fade-in-up">
                <div className="w-1.5 h-8 bg-blue-500 rounded-full"></div>
                <h2 className="text-2xl md:text-3xl font-bold text-white">{currentT.currentFocus.title}</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                {subjectsList.map((sub, i) => (
                    <Card key={i} className={`p-6 bg-[#0f111a] hover:bg-[#151824] border border-slate-800 hover:border-slate-700 transition-all duration-300 group relative overflow-hidden`}>
                        <div className={`absolute top-0 right-0 px-3 py-1 bg-slate-800 rounded-bl-xl text-[10px] font-bold text-slate-400 border-l border-b border-slate-700`}>
                            {currentT.currentFocus.tag}
                        </div>
                        
                        <div className={`w-12 h-12 rounded-xl ${sub.bg} border ${sub.border} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                            <sub.icon className={`w-6 h-6 ${sub.color}`} />
                        </div>
                        
                        <h3 className="text-lg font-bold text-white mb-6">{sub.name}</h3>
                        
                        <Button 
                            fullWidth 
                            variant="outline" 
                            className="border-slate-700 text-slate-400 hover:text-white hover:border-blue-500 hover:bg-blue-500/10 group/btn"
                            onClick={() => router.push('/login')}
                        >
                            {currentT.currentFocus.preview} <PlayCircle className="w-4 h-4 ml-2 group-hover/btn:fill-current" />
                        </Button>
                    </Card>
                ))}
            </div>
        </section>

        {/* 3. Knowledge Continuum */}
        <section className="relative py-24 bg-slate-900/30 border-y border-slate-800 mb-24">
            <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
                <div className="animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6">
                        <Sparkles className="w-3 h-3" /> Lifecycle Learning
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
                        {currentT.continuum.title}
                    </h2>
                    <p className="text-lg text-slate-400 leading-relaxed mb-8">
                        {currentT.continuum.desc}
                    </p>
                    <div className="space-y-4">
                        {[currentT.continuum.feature1, currentT.continuum.feature2].map((feat, i) => (
                            <div key={i} className="flex items-center gap-3 p-4 bg-slate-900 rounded-xl border border-slate-800">
                                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                    <Layers className="w-4 h-4 text-indigo-400" />
                                </div>
                                <span className="font-bold text-white">{feat}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Visual: Core + Shell */}
                <div className="relative h-[400px] flex items-center justify-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    {/* The Core (Knowledge) */}
                    <div className="absolute w-40 h-40 bg-indigo-600 rounded-full blur-[60px] opacity-40 animate-pulse"></div>
                    <div className="relative z-10 w-48 h-48 bg-slate-900 rounded-full border-4 border-indigo-500 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.3)]">
                        <Brain className="w-16 h-16 text-indigo-400 mb-2" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Your Knowledge</span>
                        <span className="text-[10px] text-indigo-300">Permanent Core</span>
                    </div>

                    {/* The Shells (Syllabus) */}
                    <div className="absolute w-72 h-72 rounded-full border-2 border-dashed border-slate-700 animate-[spin_20s_linear_infinite]">
                         <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-800 px-2 py-1 rounded text-xs text-slate-400 font-bold border border-slate-700">UEC</div>
                    </div>
                    <div className="absolute w-96 h-96 rounded-full border border-slate-800 animate-[spin_30s_linear_infinite_reverse] opacity-60">
                         <div className="absolute top-1/2 -right-3 -translate-y-1/2 bg-slate-800 px-2 py-1 rounded text-xs text-slate-500 font-bold border border-slate-700">IGCSE</div>
                    </div>
                    
                    {/* Connection lines */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                         <div className="w-full h-[1px] bg-indigo-500/20 rotate-45"></div>
                         <div className="w-full h-[1px] bg-indigo-500/20 -rotate-45"></div>
                    </div>
                </div>
            </div>
        </section>

        {/* 4. Future Roadmap */}
        <section className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-2xl font-bold text-white mb-12">{currentT.roadmap.title}</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                {['IGCSE', 'SPM', 'A-Levels', 'STPM'].map((item, i) => (
                    <div key={i} className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col items-center justify-center gap-3 group hover:border-slate-700 transition-all">
                        <span className="text-xl font-bold text-slate-500 group-hover:text-slate-300 transition-colors">{item}</span>
                        <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider rounded border border-blue-500/20">
                            {currentT.roadmap.soon}
                        </span>
                    </div>
                ))}
            </div>
            <p className="mt-8 text-slate-500 text-sm">{currentT.roadmap.desc}</p>
        </section>

      </main>

      <footer className="bg-[#020617] border-t border-slate-900 py-10 text-center text-slate-600 text-sm">
         <div className="max-w-7xl mx-auto px-4">
            <p>{currentT.footer}</p>
         </div>
      </footer>
    </div>
  );
};

export default SubjectsPage;