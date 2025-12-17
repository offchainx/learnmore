"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LabeledInput as Input } from '@/components/ui/labeled-input';
import { 
  Heart, HandHeart, Globe, GraduationCap, 
  ArrowRight, Users, School, Share2, 
  Phone, Mail, MapPin, BookOpen
} from 'lucide-react';
import { useApp } from '@/providers/app-provider';

const StudentCarePage: React.FC = () => {
  const router = useRouter();
  const { lang, setLang } = useApp();

  const toggleLang = () => {
    const nextLang = lang === 'en' ? 'zh' : 'en';
    setLang(nextLang);
  };

  const t = {
    en: {
      hero: {
        tag: "LearnMore Impact",
        title: "Education for All.",
        subtitle: "We are on a mission to democratize elite education. Because potential is evenly distributed, but opportunity is not."
      },
      manifesto: {
        title: "Our Manifesto",
        text: "We believe elite education shouldn't be a privilege reserved for the few. It is a human right. Every student deserves a personalized tutor that understands them, never gets tired, and champions their success—regardless of their financial background."
      },
      program: {
        title: "The Access Program",
        desc: "Investing in Potential. If cost is a barrier, let us know.",
        cardTitle: "Financial Aid & Scholarships",
        cardDesc: "We offer up to 100% subsidies for students from low-income families. No complex paperwork, just a genuine commitment to learn.",
        benefits: ["Full Platform Access", "Priority Mentorship", "Device Support"],
        formTitle: "Apply for Aid",
        namePlaceholder: "Student Name",
        emailPlaceholder: "Contact Email",
        reasonPlaceholder: "Tell us briefly about your situation...",
        submitBtn: "Submit Application"
      },
      partners: {
        title: "Our Partners",
        subtitle: "Working with the best to reach the most."
      },
      footer: {
        product: "Product",
        resources: "Resources",
        about: "About",
        contact: "Contact Us",
        rights: "© 2025 LearnMore Edu. All rights reserved.",
        features: "Features",
        pricing: "Pricing",
        stories: "Success Stories",
        blog: "Blog / Newsroom",
        guides: "Study Guides",
        care: "Student Care"
      }
    },
    zh: {
      hero: {
        tag: "LearnMore 公益",
        title: "教育，属于每一个人。",
        subtitle: "我们的使命是让精英教育民主化。因为天赋是均匀分布的，但机会往往不是。"
      },
      manifesto: {
        title: "我们的宣言",
        text: "我们坚信精英教育不应是少数人的特权，而是一项基本人权。每个学生都值得拥有一位懂他们、不知疲倦且全力支持他们成功的个性化导师——无论他们的家庭背景如何。"
      },
      program: {
        title: "教育普惠计划",
        desc: "投资潜力。如果费用是障碍，请告诉我们。",
        cardTitle: "助学金与奖学金",
        cardDesc: "我们为低收入家庭的学生提供高达 100% 的补贴。没有繁琐的手续，只需要你有一颗真诚求学的心。",
        benefits: ["平台全功能访问", "优先导师辅导", "学习设备支持"],
        formTitle: "申请援助",
        namePlaceholder: "学生姓名",
        emailPlaceholder: "联系邮箱",
        reasonPlaceholder: "简述您的情况...",
        submitBtn: "提交申请"
      },
      partners: {
        title: "合作伙伴",
        subtitle: "携手公益机构，传递更多温暖。"
      },
      footer: {
        product: "产品",
        resources: "资源",
        about: "关于我们",
        contact: "联系我们",
        rights: "© 2025 LearnMore Edu. 保留所有权利。",
        features: "功能特性",
        pricing: "价格方案",
        stories: "成功案例",
        blog: "动态资讯",
        guides: "学习指南",
        care: "学生关怀"
      }
    }
  };

  const currentT = t[lang as keyof typeof t] || t['en'];

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-rose-500/30 selection:text-rose-100 overflow-x-hidden">
      <Navbar lang={lang} onToggleLang={toggleLang} />

      <main>
        {/* --- 1. Hero Section --- */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
           {/* Warm Background Effects */}
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-rose-600/20 rounded-full blur-[120px] pointer-events-none opacity-50"></div>
           <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

           <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-bold uppercase tracking-widest mb-6 animate-fade-in-up">
                 <Heart className="w-3 h-3 fill-rose-500 text-rose-500" /> {currentT.hero.tag}
              </div>
              <h1 className="font-serif text-5xl md:text-7xl font-medium text-white mb-8 leading-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                 {currentT.hero.title}
              </h1>
              <p className="text-xl text-rose-100/70 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                 {currentT.hero.subtitle}
              </p>
           </div>
        </section>

        {/* --- 2. Manifesto --- */}
        <section className="py-24 bg-gradient-to-b from-[#020617] to-rose-950/20">
           <div className="max-w-4xl mx-auto px-6 text-center">
              <HandHeart className="w-16 h-16 text-rose-500 mx-auto mb-8 opacity-80" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-rose-400 mb-6">{currentT.manifesto.title}</h2>
              <p className="text-2xl md:text-4xl font-serif leading-relaxed text-white">
                 "{currentT.manifesto.text}"
              </p>
           </div>
        </section>

        {/* --- 3. Access Program (Financial Aid) --- */}
        <section className="py-24 relative">
           <div className="max-w-6xl mx-auto px-6">
              <div className="text-center mb-16">
                 <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{currentT.program.title}</h2>
                 <p className="text-slate-400 text-lg">{currentT.program.desc}</p>
              </div>

              <div className="grid lg:grid-cols-2 gap-12 items-start">
                 {/* Info Card */}
                 <div className="relative rounded-3xl overflow-hidden group">
                    <img 
                       src="https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1000&auto=format&fit=crop" 
                       alt="Students learning" 
                       className="w-full h-[500px] object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-8 flex flex-col justify-end">
                       <h3 className="text-2xl font-bold text-white mb-2">{currentT.program.cardTitle}</h3>
                       <p className="text-slate-300 mb-6 leading-relaxed">
                          {currentT.program.cardDesc}
                       </p>
                       <ul className="space-y-3">
                          {currentT.program.benefits.map((item, i) => (
                             <li key={i} className="flex items-center gap-3 text-rose-200">
                                <div className="w-6 h-6 rounded-full bg-rose-500/20 flex items-center justify-center">
                                   <Heart className="w-3 h-3 text-rose-400" />
                                </div>
                                {item}
                             </li>
                          ))}
                       </ul>
                    </div>
                 </div>

                 {/* Application Form */}
                 <Card className="p-8 bg-slate-900 border border-slate-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-bl-full -mr-8 -mt-8"></div>
                    
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                       <GraduationCap className="w-6 h-6 text-rose-500" /> {currentT.program.formTitle}
                    </h3>
                    
                    <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                       <div>
                          <label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
                          <Input placeholder={currentT.program.namePlaceholder} className="bg-slate-950 border-slate-800" />
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-slate-400 mb-2">Email Address</label>
                          <Input type="email" placeholder={currentT.program.emailPlaceholder} className="bg-slate-950 border-slate-800" />
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-slate-400 mb-2">Your Story</label>
                          <textarea 
                             className="w-full h-32 rounded-xl bg-slate-950 border border-slate-800 p-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 resize-none placeholder:text-slate-600"
                             placeholder={currentT.program.reasonPlaceholder}
                          ></textarea>
                       </div>
                       <Button fullWidth size="lg" className="bg-rose-600 hover:bg-rose-500 text-white border-none shadow-lg shadow-rose-500/20">
                          {currentT.program.submitBtn}
                       </Button>
                    </form>
                 </Card>
              </div>
           </div>
        </section>

        {/* --- 4. Partnerships --- */}
        <section className="py-20 border-t border-slate-900 bg-[#030810]">
           <div className="max-w-7xl mx-auto px-6 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">{currentT.partners.title}</h2>
              <p className="text-slate-500 mb-12">{currentT.partners.subtitle}</p>
              
              <div className="flex flex-wrap justify-center gap-12 opacity-60">
                 <div className="flex items-center gap-2 text-xl font-bold text-white"><Globe className="w-8 h-8" /> NGO World</div>
                 <div className="flex items-center gap-2 text-xl font-bold text-white"><School className="w-8 h-8" /> EduFoundation</div>
                 <div className="flex items-center gap-2 text-xl font-bold text-white"><Users className="w-8 h-8" /> CommunityFirst</div>
                 <div className="flex items-center gap-2 text-xl font-bold text-white"><Heart className="w-8 h-8" /> CareAlliance</div>
              </div>
           </div>
        </section>

      </main>

      <footer className="bg-[#020617] border-t border-slate-900 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
            <div className="col-span-2 lg:col-span-2">
               <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center"><BookOpen className="w-4 h-4 text-white" /></div>
                  <span className="text-xl font-bold text-white">LearnMore</span>
               </div>
               <p className="text-slate-500 text-sm leading-relaxed max-w-xs mb-6">
                  Empowering the next generation of learners with AI-driven insights and adaptive pathways.
               </p>
               <div className="flex gap-4">
                  <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"><Share2 className="w-4 h-4" /></div>
               </div>
            </div>
            
            <div>
               <h4 className="font-bold text-white mb-6">{currentT.footer.product}</h4>
               <ul className="space-y-4 text-sm text-slate-400">
                  <li><button onClick={() => router.push('/how-it-works')} className="hover:text-blue-400 transition-colors text-left">{currentT.footer.features}</button></li>
                  <li><button onClick={() => router.push('/pricing')} className="hover:text-blue-400 transition-colors text-left">{currentT.footer.pricing}</button></li>
                  <li><button onClick={() => router.push('/success-stories')} className="hover:text-blue-400 transition-colors text-left">{currentT.footer.stories}</button></li>
               </ul>
            </div>

            <div>
               <h4 className="font-bold text-white mb-6">{currentT.footer.resources}</h4>
               <ul className="space-y-4 text-sm text-slate-400">
                  <li><button onClick={() => router.push('/blog')} className="hover:text-blue-400 transition-colors text-left">{currentT.footer.blog}</button></li>
                  <li><button onClick={() => router.push('/study-guides')} className="hover:text-blue-400 transition-colors text-left">{currentT.footer.guides}</button></li>
                  <li><button onClick={() => router.push('/student-care')} className="hover:text-blue-400 transition-colors text-left">{currentT.footer.care}</button></li>
               </ul>
            </div>

            <div>
               <h4 className="font-bold text-white mb-6">{currentT.footer.contact}</h4>
               <ul className="space-y-4 text-sm text-slate-400">
                  <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> +1 (555) 123-4567</li>
                  <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> support@learnmore.ai</li>
                  <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /> San Francisco, CA</li>
               </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-600">
             <div>{currentT.footer.rights}</div>
             <div className="flex gap-6">
                <a href="#" className="hover:text-slate-400">Privacy Policy</a>
                <a href="#" className="hover:text-slate-400">Terms of Service</a>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StudentCarePage;