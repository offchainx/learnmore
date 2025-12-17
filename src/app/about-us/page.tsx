"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Globe, Users, Brain, ArrowRight, Linkedin, Twitter } from 'lucide-react';
import { useApp } from '@/providers/app-provider';

const AboutUsPage: React.FC = () => {
  const router = useRouter();
  const { lang, setLang } = useApp();

  const toggleLang = () => {
    const nextLang = lang === 'en' ? 'zh' : 'en';
    setLang(nextLang);
  };

  const t = {
    en: {
      hero: {
        title: "Our Mission",
        statement: "To make high-quality personalized education accessible to every student.",
        subStatement: "We believe intelligence is evenly distributed, but opportunity is not. We're here to bridge that gap with AI."
      },
      story: {
        title: "Our Story",
        p1: "LearnMore began in 2023 with a unique collaboration: experienced UEC teachers frustrated by the 'one-size-fits-all' classroom model, and former Google AI engineers looking to apply Large Language Models to meaningful problems.",
        p2: "We asked a simple question: \"What if every student could have a tutor who knew their learning history perfectly, never got tired, and cost less than a cup of coffee?\" Today, we are building that engine—combining local curriculum expertise with world-class AI.",
        stats: [
          { value: "2024", label: "Founded" },
          { value: "500+", label: "Pilot Users" },
          { value: "15%", label: "Avg Grade Boost" }
        ]
      },
      roadmap: {
        title: "Our Journey & Future",
        subtitle: "From a bold idea to a lifelong learning partner.",
        phases: {
           past: "Milestones Achieved",
           present: "Current Focus (Next 6-12 Months)",
           future: "Future Vision (1-3 Years)"
        },
        steps: [
           {
             year: "2024 Q3",
             title: "LearnMore Founded",
             desc: "Core team assembled: Ex-UEC teachers & Google AI devs.",
             status: "completed"
           },
           {
             year: "2024 Q4",
             title: "UEC Junior Ready",
             desc: "7 core subjects digitized. Knowledge Graph v1.0 launched.",
             status: "completed"
           },
           {
             year: "2025 Q1",
             title: "Public Launch",
             desc: "AI Diagnostic & Adaptive Practice released. 500+ pilot users.",
             status: "completed"
           },
           {
             year: "2025 Q3",
             title: "IGCSE Expansion",
             desc: "Maths & Science for IGCSE. Smart Mistake Book 2.0.",
             status: "in-progress"
           },
           {
             year: "2025 Q4",
             title: "AI Language Coach",
             desc: "Speaking Coach for English & Malay. SPM Preview.",
             status: "planned"
           },
           {
             year: "2026",
             title: "Full Coverage",
             desc: "Primary (Std 4-6) & UEC Senior. Lifetime Learning Profile.",
             status: "planned"
           },
           {
             year: "2027+",
             title: "Teacher Studio",
             desc: "Open platform for educators & AI Teaching Assistants.",
             status: "planned"
           }
        ]
      },
      team: {
        title: "Meet the Team",
        subtitle: "A blend of educators, engineers, and dreamers.",
        members: [
          {
            name: "Dr. Eleanor Vance",
            role: "Co-Founder & CEO",
            bio: "Former Principal at a leading UEC High School. 20 years in curriculum development.",
            img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop"
          },
          {
            name: "James Chen",
            role: "CTO",
            bio: "Ex-Google AI researcher. Specialized in Knowledge Graphs and Adaptive Learning Algorithms.",
            img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop"
          },
          {
            name: "Sarah Miller",
            role: "Head of Product",
            bio: "EdTech veteran. Passionate about gamifying the UEC/SPM learning experience.",
            img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop"
          },
          {
            name: "David Park",
            role: "Lead Engineer",
            bio: "Full-stack wizard focusing on scalable real-time AI interactions.",
            img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop"
          }
        ]
      },
      join: {
        title: "Join Our Mission",
        desc: "We are always looking for passionate people to join our remote-first team.",
        btn: "View Open Positions"
      },
      footer: "© 2025 LearnMore Edu. All rights reserved."
    },
    zh: {
      hero: {
        title: "我们的使命",
        statement: "致力于让每个学生都能享受到高质量的个性化教育。",
        subStatement: "我们相信天赋是均匀分布的，但机会不是。我们致力于通过人工智能来弥合这一差距。"
      },
      story: {
        title: "我们的故事",
        p1: "LearnMore 始于 2023 年的一次独特合作：一群对“填鸭式”教学感到沮丧的资深 UEC 独中教师，和几位希望将大语言模型应用于实际问题的 Google AI 工程师走到了一起。",
        p2: "我们提出了一个简单的问题：“如果每个学生都能拥有一个完全了解他们学习历史、不知疲倦且费用低于一杯咖啡的导师，会怎样？” 今天，我们正在打造这个引擎——将本土课程专长与世界级 AI 技术完美结合。",
        stats: [
          { value: "2024", label: "成立年份" },
          { value: "500+", label: "种子用户" },
          { value: "15%", label: "平均提分" }
        ]
      },
      roadmap: {
        title: "我们的旅程与未来",
        subtitle: "从一个大胆的想法到终身学习伙伴。",
        phases: {
           past: "已实现的里程碑",
           present: "当前核心 (未来 6-12 个月)",
           future: "未来愿景 (1-3 年)"
        },
        steps: [
           {
             year: "2024 Q3",
             title: "LearnMore 正式成立",
             desc: "核心团队组建：前 UEC 教师 + Google AI 开发者。",
             status: "completed"
           },
           {
             year: "2024 Q4",
             title: "初中统考课程库完成",
             desc: "完成初一至初三 7 大核心科目的数字化内容。知识图谱 v1.0 上线。",
             status: "completed"
           },
           {
             year: "2025 Q1",
             title: "平台正式公测",
             desc: "发布 AI 诊断与自适应练习功能。500+ 种子用户入驻。",
             status: "completed"
           },
           {
             year: "2025 Q3",
             title: "拓展 IGCSE",
             desc: "上线 IGCSE 数学与科学课程。智能错题本 2.0。",
             status: "in-progress"
           },
           {
             year: "2025 Q4",
             title: "AI 语言私教",
             desc: "推出英语和马来语的交互式 AI 口语教练。SPM 预览版上线。",
             status: "planned"
           },
           {
             year: "2026",
             title: "全学段覆盖",
             desc: "拓展至小学 (4-6年级) 及高中统考。引入“终身学习档案”。",
             status: "planned"
           },
           {
             year: "2027+",
             title: "开放生态系统",
             desc: "开放“教师工作室”平台。AI 助教合作伙伴关系。",
             status: "planned"
           }
        ]
      },
      team: {
        title: "遇见团队",
        subtitle: "教育家、工程师和梦想家的集合。",
        members: [
          {
            name: "Dr. Eleanor Vance",
            role: "联合创始人 & CEO",
            bio: "前知名独中校长。拥有20年课程开发与管理经验。",
            img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop"
          },
          {
            name: "James Chen",
            role: "首席技术官 (CTO)",
            bio: "前 Google AI 研究员。专攻知识图谱构建与自适应学习算法。",
            img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop"
          },
          {
            name: "Sarah Miller",
            role: "产品负责人",
            bio: "教育科技老兵。热衷于将 UEC/SPM 学习体验游戏化。",
            img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop"
          },
          {
            name: "David Park",
            role: "首席工程师",
            bio: "全栈技术专家，专注于构建高并发实时 AI 交互系统。",
            img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop"
          }
        ]
      },
      join: {
        title: "加入我们",
        desc: "我们一直在寻找充满激情的人才加入我们的远程优先团队。",
        btn: "查看在招职位"
      },
      footer: "© 2025 LearnMore Edu. 保留所有权利。"
    }
  };

  const currentT = t[lang as keyof typeof t] || t['en'];

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-blue-500/30 selection:text-blue-100 overflow-x-hidden">
      <Navbar lang={lang === 'ms' ? 'en' : lang} onToggleLang={toggleLang} />

      <main className="pt-24 pb-20">
        
        {/* Section 1: Mission (Hero) */}
        <section className="relative py-20 px-6 max-w-5xl mx-auto text-center animate-fade-in-up">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
           
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold uppercase tracking-widest mb-8 relative z-10">
              <Globe className="w-3 h-3" /> {currentT.hero.title}
           </div>
           
           <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-medium leading-tight mb-8 text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 relative z-10">
              "{currentT.hero.statement}"
           </h1>
           <p className="text-xl text-slate-400 max-w-2xl mx-auto relative z-10 font-light">
              {currentT.hero.subStatement}
           </p>
        </section>

        {/* Section 2: Our Story */}
        <section className="py-24 bg-slate-900/30 border-y border-slate-800">
           <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
              <div className="relative">
                 <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl blur-2xl opacity-20 transform rotate-3"></div>
                 <img 
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop" 
                    alt="Team working" 
                    className="relative rounded-2xl border border-slate-700 shadow-2xl grayscale hover:grayscale-0 transition-all duration-700"
                 />
                 {/* Floating Badge */}
                 <div className="absolute -bottom-6 -right-6 bg-[#0f111a] p-4 rounded-xl border border-slate-800 shadow-xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center">
                       <Brain className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                       <div className="text-xs text-slate-400 uppercase tracking-wider">AI + Education</div>
                       <div className="font-bold text-white">The Perfect Match</div>
                    </div>
                 </div>
              </div>

              <div className="space-y-6">
                 <h2 className="font-serif text-3xl md:text-4xl text-white">{currentT.story.title}</h2>
                 <p className="text-slate-400 text-lg leading-relaxed">
                    {currentT.story.p1}
                 </p>
                 <p className="text-slate-400 text-lg leading-relaxed">
                    {currentT.story.p2}
                 </p>

                 <div className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-800 mt-8">
                    {currentT.story.stats.map((stat, i) => (
                       <div key={i}>
                          <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                          <div className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </section>

        {/* Section 3: Roadmap (Horizontal Animated Timeline) */}
        <section className="py-24 overflow-hidden">
           <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                 <h2 className="font-serif text-3xl md:text-4xl text-white mb-4">{currentT.roadmap.title}</h2>
                 <p className="text-slate-400">{currentT.roadmap.subtitle}</p>
              </div>

              {/* Horizontal Scroll Wrapper */}
              <div className="relative overflow-x-auto pb-12 hide-scrollbar">
                 <div className="min-w-[1000px] px-8">
                    
                    {/* Timeline Track Container */}
                    <div className="relative mb-12 mt-4">
                       {/* Background Line */}
                       <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-800 -translate-y-1/2 rounded-full"></div>
                       
                       {/* Animated Progress Line */}
                       <div className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-blue-600 via-purple-500 to-blue-400 -translate-y-1/2 rounded-full animate-[widthGrow_4s_ease-out_forwards] origin-left w-0"></div>

                       {/* Steps Grid */}
                       <div className="grid grid-cols-7 gap-4 relative z-10">
                          {currentT.roadmap.steps.map((step, index) => {
                             const isCompleted = step.status === 'completed';
                             const isInProgress = step.status === 'in-progress';
                             
                             return (
                                <div key={index} className="flex flex-col items-center group">
                                   {/* Timeline Dot Area */}
                                   <div className="relative w-8 h-8 flex items-center justify-center mb-6">
                                      {/* Halo for In Progress */}
                                      {isInProgress && (
                                        <div className="absolute inset-0 bg-blue-500/40 rounded-full animate-ping"></div>
                                      )}
                                      
                                      {/* The Dot */}
                                      <div 
                                        className={`w-4 h-4 rounded-full border-2 transition-all duration-500 opacity-0 animate-[fadeIn_0.5s_forwards] ${isCompleted ? 'bg-blue-500 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]' : isInProgress ? 'bg-blue-950 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.8)] scale-125' : 'bg-slate-950 border-slate-700'}`}
                                        style={{ animationDelay: `${index * 0.5}s` }}
                                      ></div>
                                   </div>

                                   {/* Content Card */}
                                   <div 
                                      className="flex flex-col items-center text-center opacity-0 animate-[slideUp_0.5s_forwards]"
                                      style={{ animationDelay: `${index * 0.5 + 0.2}s` }}
                                   >
                                      <div className={`font-mono text-xs font-bold mb-2 ${isInProgress ? 'text-blue-400' : 'text-slate-500'}`}>
                                        {step.year}
                                      </div>
                                      
                                      <Card className={`
                                         p-4 w-36 min-h-[140px] flex flex-col justify-start relative transition-all duration-300 hover:-translate-y-1
                                         ${isCompleted 
                                           ? 'bg-slate-900/40 border-slate-700/50' 
                                           : isInProgress 
                                             ? 'bg-blue-900/10 border-blue-500/40 shadow-lg shadow-blue-500/10' 
                                             : 'bg-transparent border-slate-800/50 border-dashed opacity-60'}
                                      `}>
                                         <h3 className={`text-sm font-bold mb-2 leading-tight ${isInProgress ? 'text-white' : 'text-slate-300'}`}>
                                           {step.title}
                                         </h3>
                                         <p className="text-[10px] text-slate-500 leading-relaxed">
                                           {step.desc}
                                         </p>
                                      </Card>
                                   </div>
                                </div>
                             );
                          })}
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* Section 4: Team Grid */}
        <section className="py-24 max-w-7xl mx-auto px-6 border-t border-slate-900">
           <div className="text-center mb-16">
              <h2 className="font-serif text-3xl md:text-4xl text-white mb-4">{currentT.team.title}</h2>
              <p className="text-slate-400">{currentT.team.subtitle}</p>
           </div>

           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {currentT.team.members.map((member, i) => (
                 <Card key={i} className="group bg-slate-900 border-slate-800 overflow-hidden hover:border-slate-600 transition-colors">
                    <div className="h-64 overflow-hidden relative">
                       <img 
                          src={member.img} 
                          alt={member.name} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-80"></div>
                       <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                          <div className="flex gap-2 justify-center">
                             <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full bg-white/10 hover:bg-white/20 text-white"><Linkedin className="w-4 h-4" /></Button>
                             <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full bg-white/10 hover:bg-white/20 text-white"><Twitter className="w-4 h-4" /></Button>
                          </div>
                       </div>
                    </div>
                    <div className="p-6 relative">
                       <h3 className="text-lg font-bold text-white mb-1">{member.name}</h3>
                       <p className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-3">{member.role}</p>
                       <p className="text-sm text-slate-400 leading-relaxed">
                          {member.bio}
                       </p>
                    </div>
                 </Card>
              ))}
           </div>
        </section>

        {/* Section 5: Join Us */}
        <section className="max-w-5xl mx-auto px-6 pb-20">
           <div className="relative rounded-3xl overflow-hidden p-12 text-center bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
              
              <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Users className="w-8 h-8 text-white" />
              </div>
              
              <h2 className="font-serif text-3xl md:text-4xl text-white mb-6">{currentT.join.title}</h2>
              <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
                 {currentT.join.desc}
              </p>
              
              <Button size="lg" variant="glow" className="shadow-lg shadow-blue-500/20">
                 {currentT.join.btn} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
           </div>
        </section>

      </main>

      <footer className="bg-[#020617] border-t border-slate-900 py-10 text-center text-slate-600 text-sm">
         <div className="max-w-7xl mx-auto px-4">
            <p>{currentT.footer}</p>
         </div>
      </footer>
      
      <style>{`
        @keyframes widthGrow {
          0% { width: 0; }
          100% { width: 100%; }
        }
        @keyframes fadeIn {
          0% { opacity: 0; transform: scale(0.5); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes slideUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
    </div>
  );
};

export default AboutUsPage;