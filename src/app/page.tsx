'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { LandingPageNavbar } from '@/components/layout/LandingPageNavbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Calculator, FlaskConical, Atom, Languages, CheckCircle2,
  BarChart3, Smartphone, Brain, MessageCircle, ArrowRight
} from 'lucide-react';

type Lang = 'en' | 'zh';

const translations = {
  en: {
    hero: {
      badge: "New Curriculum Updated for 2025",
      titleStart: "Master Middle School",
      titleEnd: "With Confidence.",
      subtitle: "A comprehensive learning ecosystem for Grades 7-9. Expert video lessons, AI-powered practice, and personalized roadmap to high school success.",
      startTrial: "Start Free Trial",
      viewSyllabus: "View Syllabus",
      check1: "Aligned to Curriculum",
      check2: "Expert Teachers",
      check3: "Data-Driven"
    },
    features: {
      label: "Why Choose Us",
      title: "Engineered for Academic Excellence.",
      subtitle: "We combine cognitive science with modern technology to create the most effective learning experience.",
      
      subjectsTitle: "6 Core Subjects Coverage",
      subjectsDesc: "Comprehensive coverage of the middle school curriculum. Every chapter, every theorem, explained.",
      math: "Math", physics: "Physics", chemistry: "Chemistry", english: "English",
      moreSubjects: "+ Biology & Chinese",
      
      systemTitle: "Systematic Learning Path",
      systemDesc: "Don't get lost. Our Knowledge Graph connects every concept, creating a personalized roadmap from basic to advanced.",
      
      aiTitle: "AI-Adaptive Practice",
      aiDesc: "Stop wasting time on what you already know. Our AI pushes questions that target your weak points.",
      
      communityTitle: "Vibrant Community",
      communityDesc: "Learning is not solitary. Discuss problems, share notes, and compete on the leaderboard.",
      
      experienceTitle: "Smooth Experience",
      experienceDesc: "Native-like performance, dark mode, and mobile-optimized for learning anywhere."
    },
    stats: {
      activeStudents: "Active Students",
      questionsSolved: "Questions Solved",
      videoLessons: "Video Lessons",
      avgBoost: "Avg Grade Boost"
    },
    cta: {
      title: "Ready to improve your grades?",
      subtitle: "Join the platform that helps you learn smarter, not harder.",
      button: "Get Started for Free",
      note: "No credit card required. Free 7-day trial for Pro features."
    },
    footer: {
      rights: "© 2025 LearnMore Edu. All rights reserved.",
      privacy: "Privacy",
      terms: "Terms",
      contact: "Contact"
    }
  },
  zh: {
    hero: {
      badge: "2025 新课标已更新",
      titleStart: "轻松搞定初中课程",
      titleEnd: "自信应对考试",
      subtitle: "专为 7-9 年级打造的一站式学习生态系统。名师视频讲解、AI 智能刷题、个性化学习路径，助你直通重点高中。",
      startTrial: "免费试用",
      viewSyllabus: "查看教学大纲",
      check1: "紧扣考纲",
      check2: "严选名师",
      check3: "数据驱动"
    },
    features: {
      label: "核心优势",
      title: "为卓越成绩而生",
      subtitle: "我们将认知科学与现代技术相结合，打造最高效的学习体验。",
      
      subjectsTitle: "全科考点覆盖",
      subjectsDesc: "全面覆盖初中核心学科。每一个章节，每一个定理，都有深入浅出的讲解。",
      math: "数学", physics: "物理", chemistry: "化学", english: "英语",
      moreSubjects: "+ 生物 & 语文",
      
      systemTitle: "体系化学习路径",
      systemDesc: "拒绝盲目刷题。我们的知识图谱串联每一个知识点，为你生成从基础到拔高的个性化路径。",
      
      aiTitle: "AI 智适应练习",
      aiDesc: "不再在已掌握的题目上浪费时间。AI 根据你的作答情况，智能推送针对性强化题目。",
      
      communityTitle: "活跃的学习社区",
      communityDesc: "学习不再孤单。在线讨论难题、分享笔记、在排行榜上与同龄人一较高下。",
      
      experienceTitle: "极致流畅体验",
      experienceDesc: "原生般的流畅度，护眼深色模式，随时随地通过手机或平板开启学习。"
    },
    stats: {
      activeStudents: "活跃学员",
      questionsSolved: "累计刷题",
      videoLessons: "精品课时",
      avgBoost: "平均提分"
    },
    cta: {
      title: "准备好提升成绩了吗？",
      subtitle: "加入 LearnMore，让学习变聪明，而不是更辛苦。",
      button: "免费开始",
      note: "无需绑定信用卡，免费体验 7 天 Pro 功能。"
    },
    footer: {
      rights: "© 2025 LearnMore Edu. 保留所有权利。",
      privacy: "隐私政策",
      terms: "服务条款",
      contact: "联系我们"
    }
  }
};

const LandingPage: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [lang, setLang] = useState<Lang>('en');
  const t = translations[lang];

  return (
    <div className="dark min-h-screen bg-[#020617] text-white overflow-hidden font-sans selection:bg-blue-500/30 selection:text-blue-100">
      <LandingPageNavbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 max-w-7xl mx-auto flex flex-col items-center text-center">
        
        {/* Abstract Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]"></div>
        </div>

        <div className="relative z-10 animate-fade-in-up max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 hover:bg-white/10 transition-colors cursor-default">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs font-medium tracking-wide text-slate-300">{t.hero.badge}</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tight mb-8 leading-[1.1]">
            {t.hero.titleStart}<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400">{t.hero.titleEnd}</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 leading-relaxed mb-10">
            {t.hero.subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Link href="/register" passHref>
              <Button size="xl" variant="glow" className="min-w-[200px] h-14 text-lg">
                {t.hero.startTrial}
              </Button>
            </Link>
            <Link href="/login" passHref>
              <Button size="xl" variant="secondary" className="min-w-[200px] h-14 text-lg group">
                {t.hero.viewSyllabus} <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-500" /> <span>{t.hero.check1}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-500" /> <span>{t.hero.check2}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-500" /> <span>{t.hero.check3}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Modules Section (Bento Grid) */}
      <section className="py-24 px-4 max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="text-sm font-semibold tracking-widest text-blue-400 uppercase mb-2">{t.features.label}</h2>
            <p className="text-3xl md:text-4xl font-bold tracking-tight text-white">{t.features.title}</p>
          </div>
          <p className="text-slate-400 max-w-sm text-sm leading-relaxed">
            {t.features.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-4 gap-6 auto-rows-[minmax(180px,auto)]">
          
          {/* Main Card: 6 Subjects Coverage */}
          <Card className="md:col-span-4 lg:col-span-2 lg:row-span-2 relative overflow-hidden group border-white/5 bg-[#0a0a0a] hover:bg-[#0f0f0f] transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            {/* Using !p-8 to override CardContent default pt-0 */}
            <CardContent className="!p-8 h-full flex flex-col justify-between relative z-10">
              <div className="grid grid-cols-2 gap-4 mb-8">
                 {[
                   { name: t.features.math, icon: Calculator, color: 'text-blue-400', bg: 'bg-blue-900/20' },
                   { name: t.features.physics, icon: Atom, color: 'text-purple-400', bg: 'bg-purple-900/20' },
                   { name: t.features.chemistry, icon: FlaskConical, color: 'text-green-400', bg: 'bg-green-900/20' },
                   { name: t.features.english, icon: Languages, color: 'text-pink-400', bg: 'bg-pink-900/20' },
                 ].map((sub, i) => (
                   <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group/item">
                      {/* Grid place-items-center for bulletproof centering */}
                      <div className={`grid place-items-center w-10 h-10 rounded-lg ${sub.bg} shrink-0 ring-1 ring-white/5 group-hover/item:ring-white/20 transition-all`}>
                        <sub.icon className={`w-5 h-5 ${sub.color}`} />
                      </div>
                      <span className="text-sm font-medium text-slate-200">{sub.name}</span>
                   </div>
                 ))}
                 <div className="col-span-2 text-center text-xs text-slate-500 mt-2">{t.features.moreSubjects}</div>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2 text-white">{t.features.subjectsTitle}</h3>
                <p className="text-slate-400 text-sm">{t.features.subjectsDesc}</p>
              </div>
            </CardContent>
          </Card>

          {/* Feature: Systematic Path (Knowledge Graph) */}
          <Card className="md:col-span-2 lg:col-span-2 relative overflow-hidden group border-white/5 bg-[#0a0a0a] hover:bg-[#0f0f0f] transition-all">
             <div className="absolute right-0 bottom-0 opacity-20 w-32 h-32 bg-gradient-to-tl from-emerald-500 to-transparent blur-3xl z-0"></div>
             <CardContent className="!p-8 h-full flex flex-col justify-between relative z-10">
               <div className="flex justify-between items-start mb-6">
                  {/* Icon container */}
                  <div className="grid place-items-center w-12 h-12 bg-emerald-500/10 rounded-2xl ring-1 ring-emerald-500/20">
                    <BarChart3 className="w-6 h-6 text-emerald-400" />
                  </div>
                  {/* Decorative dots */}
                  <div className="flex gap-1.5 pt-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500/30"></div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500/70"></div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  </div>
               </div>
               <div>
                 <h3 className="text-xl font-bold mb-2 text-white">{t.features.systemTitle}</h3>
                 <p className="text-sm text-slate-400">{t.features.systemDesc}</p>
               </div>
             </CardContent>
          </Card>

          {/* Feature: AI Adaptive */}
          <Card className="md:col-span-3 lg:col-span-1 relative overflow-hidden group border-white/5 bg-[#0a0a0a] hover:bg-[#0f0f0f] transition-all">
             <CardContent className="!p-8 h-full flex flex-col justify-center relative z-10">
               <div className="grid place-items-center w-12 h-12 rounded-2xl bg-indigo-500/10 mb-6 text-indigo-400 group-hover:rotate-12 transition-transform ring-1 ring-indigo-500/20">
                 <Brain className="w-6 h-6" />
               </div>
               <h3 className="text-lg font-bold mb-2 text-white">{t.features.aiTitle}</h3>
               <p className="text-sm text-slate-400">{t.features.aiDesc}</p>
             </CardContent>
          </Card>

          {/* Feature: Community */}
          <Card className="md:col-span-3 lg:col-span-1 relative overflow-hidden group border-white/5 bg-[#0a0a0a] hover:bg-[#0f0f0f] transition-all">
             <CardContent className="!p-8 h-full flex flex-col justify-center relative z-10">
               <div className="grid place-items-center w-12 h-12 rounded-2xl bg-yellow-500/10 mb-6 text-yellow-400 group-hover:scale-110 transition-transform ring-1 ring-yellow-500/20">
                 <MessageCircle className="w-6 h-6" />
               </div>
               <h3 className="text-lg font-bold mb-2 text-white">{t.features.communityTitle}</h3>
               <p className="text-sm text-slate-400">{t.features.communityDesc}</p>
             </CardContent>
          </Card>

           {/* Feature: Experience */}
           <Card className="md:col-span-6 lg:col-span-2 relative overflow-hidden group border-white/5 bg-[#0a0a0a] hover:bg-[#0f0f0f] transition-all">
             <CardContent className="!p-8 h-full flex items-center gap-8 relative z-10">
                <div className="hidden sm:flex flex-col gap-3 min-w-[140px]">
                   <div className="h-8 w-full bg-white/5 rounded-lg animate-pulse"></div>
                   <div className="h-8 w-3/4 bg-white/5 rounded-lg animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                   <div className="h-8 w-full bg-white/5 rounded-lg animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <div>
                   <h3 className="text-lg font-bold mb-3 flex items-center gap-3 text-white">
                     <div className="p-1.5 rounded-lg bg-blue-500/20">
                        <Smartphone className="w-5 h-5 text-blue-400" />
                     </div>
                     {t.features.experienceTitle}
                   </h3>
                   <p className="text-sm text-slate-400 leading-relaxed">{t.features.experienceDesc}</p>
                </div>
             </CardContent>
          </Card>

        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="py-20 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: t.stats.activeStudents, value: '50k+' },
            { label: t.stats.questionsSolved, value: '1.2M+' },
            { label: t.stats.videoLessons, value: '8,000+' },
            { label: t.stats.avgBoost, value: '25%' },
          ].map((stat, i) => (
            <div key={i} className="space-y-2">
              <div className="text-4xl lg:text-5xl font-bold text-white tracking-tight">{stat.value}</div>
              <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 relative text-center px-4">
        <div className="absolute inset-0 bg-gradient-to-t from-[#050a1f] to-transparent pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-white">{t.cta.title}</h2>
          <p className="text-lg text-slate-400 mb-10">{t.cta.subtitle}</p>
          <Link href="/register" passHref>
            <Button size="xl" variant="glow" className="px-12 py-6 text-lg shadow-xl shadow-blue-900/20">
              {t.cta.button}
            </Button>
          </Link>
          <p className="mt-6 text-xs text-slate-600">{t.cta.note}</p>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-8 border-t border-white/5 text-center text-sm text-slate-600 bg-black">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>{t.footer.rights}</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-400 transition-colors">{t.footer.privacy}</a>
            <a href="#" className="hover:text-slate-400 transition-colors">{t.footer.terms}</a>
            <a href="#" className="hover:text-slate-400 transition-colors">{t.footer.contact}</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;