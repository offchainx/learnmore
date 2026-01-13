"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  BookOpen, Users, Zap, Brain, Target,
  CheckCircle2, XCircle, Play, Map,
  BarChart2, HelpCircle, Phone, Mail, MapPin,
  TrendingUp, Activity, Sparkles, Share2, Quote, ChevronRight
} from 'lucide-react';
import { useApp } from '@/providers/app-provider';
import { NewsletterForm } from '@/components/marketing/newsletter-form';
import type { PlatformStats } from '@/actions/marketing';

// Local translations for Landing Page content
const localTranslations = {
  en: {
    hero: {
      badge: "New Curriculum Updated for 2025",
      headline: "More Than Just Practice.\nYour Personal AI Tutor.",
      subheadline: "Knowledge Graph-based adaptive learning that turns every minute into progress. Stop guessing, start mastering.",
      ctaPrimary: "Get Free Diagnosis Report",
      ctaSecondary: "Watch Demo",
      stat1: "Active Students",
      stat2: "Questions Solved"
    },
    painPoints: {
      title: "Why Traditional Learning Fails",
      subtitle: "We solved the problems that hold students back.",
      card1Title: "Stuck on Scores?",
      card1Desc: "Blindly practicing without knowing WHY you got it wrong. Our AI attributes errors to specific concept gaps.",
      card2Title: "Tutors too Expensive?",
      card2Desc: "Private tutors cost $50/hr. LearnMore provides 24/7 distinct guidance for a fraction of the price.",
      card3Title: "Lost in Textbooks?",
      card3Desc: "Textbooks are linear. Knowledge is interconnected. We give you a personalized GPS for learning."
    },
    features: {
      f1Title: "Knowledge Graph Navigation",
      f1Desc: "Visualize the connection between concepts. If you fail a quadratic equation, we might trace it back to basic factorization weakness.",
      f1Tag: "Map Your Mind",
      f1List: ['Visual dependencies', 'Prerequisite mapping', 'Gap analysis'],
      
      f2Title: "AI Diagnostic Report",
      f2Desc: "Get a comprehensive radar chart comparing your skills against the grade average. Know exactly where to focus before the exam.",
      f2Tag: "Data Driven",
      f2Button: "View Sample Report",
      
      f3Title: "Parent Dashboard",
      f3Desc: "Stay in the loop without hovering. Receive weekly progress notifications and celebrate milestones together.",
      f3Tag: "Transparency",
      f3Trusted: "Trusted by 15k+ parents"
    },
    comparison: {
      title: "The Smarter Choice",
      col1: "Traditional Cram School",
      col2: "LearnMore AI Pro",
      row1: "Feedback Speed",
      row1bad: "Days later (Laggy)",
      row1good: "Instant (Real-time)",
      row2: "Learning Path",
      row2bad: "One size fits all (Boring)",
      row2good: "Adaptive (Gamified)",
      row3: "Availability",
      row3bad: "Fixed Schedule (Rigid)",
      row3good: "24/7 Anytime (Flexible)",
      row4: "Cost Effectiveness",
      row4bad: "$$$ Expensive",
      row4good: "$ Affordable"
    },
    testimonials: {
      title: "What Students Say",
      t1: "The analysis report helped me realize I wasn't bad at Math, I just missed one concept in Grade 7.",
      t1Author: "Michael Z.",
      t1Role: "Grade 9 • Improved +25 points",
      t2: "I used to hate Physics formulas. The Knowledge Graph made me understand how they actually connect.",
      t2Author: "Sarah L.",
      t2Role: "Grade 8 • Top of Class",
      t3: "My parents finally stopped nagging me because the app sends them updates automatically!",
      t3Author: "Jason K.",
      t3Role: "Grade 9 • Happy Student",
    },
    cta: {
      title: "Ready to Boost Your Grades?",
      btn: "Start Your Journey"
    },
    newsletter: {
      title: "Stay Updated with Learning Tips",
      desc: "Get weekly insights, study strategies, and product updates delivered to your inbox.",
      placeholder: "Enter your email",
      btn: "Subscribe",
      note: "We respect your privacy. Unsubscribe anytime."
    },
    footer: {
      product: "Product",
      resources: "Resources",
      about: "About",
      legal: "Legal",
      contact: "Contact Us",
      rights: "© 2026 LearnMore Edu. All rights reserved.",
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
      badge: "2025 新课标已更新",
      headline: "不仅仅是刷题，\n更是你的 AI 私人导师。",
      subheadline: "基于知识图谱的自适应学习，让每一分钟的学习都转化为实实在在的进步。",
      ctaPrimary: "获取免费诊断报告",
      ctaSecondary: "观看演示",
      stat1: "活跃学员",
      stat2: "累计刷题"
    },
    painPoints: {
      title: "为什么努力了成绩没提高？",
      subtitle: "我们解决了阻碍学生进步的核心问题。",
      card1Title: "分数停滞不前？",
      card1Desc: "盲目刷题却不知道错在哪里。AI 精准归因，帮你找到薄弱的底层知识点。",
      card2Title: "私教太贵？",
      card2Desc: "名师私教一小时几百元。LearnMore 提供 7x24 小时 AI 陪伴，价格仅为零头。",
      card3Title: "迷失在题海？",
      card3Desc: "课本是线性的，知识是网状的。我们为你提供个性化的学习 GPS 导航。"
    },
    features: {
      f1Title: "知识图谱导航",
      f1Desc: "可视化概念之间的联系。如果你做错了一道二次方程，我们可能会追溯到因式分解的薄弱点。",
      f1Tag: "构建知识网络",
      f1List: ['可视化知识依赖', '前置知识点映射', '能力缺口分析'],
      
      f2Title: "AI 智能诊断报告",
      f2Desc: "通过雷达图全方位展示你的能力维度，与年级平均水平对比，考前精准突击。",
      f2Tag: "数据驱动",
      f2Button: "查看报告样本",
      
      f3Title: "家长伴学端",
      f3Desc: "无需时刻盯着孩子。每周接收进度推送，共同见证每一个里程碑。",
      f3Tag: "透明高效",
      f3Trusted: "超过 15,000 位家长的信赖"
    },
    comparison: {
      title: "更聪明的选择",
      col1: "传统补习班",
      col2: "LearnMore AI Pro",
      row1: "反馈速度",
      row1bad: "几天后 (严重滞后)",
      row1good: "即时 (秒级反馈)",
      row2: "学习路径",
      row2bad: "千人一面 (枯燥)",
      row2good: "千人千面 (游戏化)",
      row3: "可用性",
      row3bad: "固定时间 (僵化)",
      row3good: "7x24 小时 (灵活)",
      row4: "性价比",
      row4bad: "$$$ 昂贵负担",
      row4good: "$ 超高性价比"
    },
    testimonials: {
      title: "学员真实反馈",
      t1: "诊断报告帮我意识到我并不是数学差，我只是在七年级时漏掉了一个关键概念。",
      t1Author: "Michael Z.",
      t1Role: "九年级 • 提升 25 分",
      t2: "我以前很讨厌物理公式。知识图谱让我明白了它们之间是如何相互联系的，太神奇了。",
      t2Author: "Sarah L.",
      t2Role: "八年级 • 班级第一",
      t3: "我爸妈终于不再唠叨我了，因为 App 会自动把我的进步发给他们！",
      t3Author: "Jason K.",
      t3Role: "九年级 • 快乐学习",
    },
    cta: {
      title: "准备好提升成绩了吗？",
      btn: "开启学习之旅"
    },
    newsletter: {
      title: "订阅学习技巧资讯",
      desc: "每周获取学习洞察、备考策略和产品更新，直达您的邮箱。",
      placeholder: "输入您的邮箱",
      btn: "订阅",
      note: "我们尊重您的隐私，随时可取消订阅。"
    },
    footer: {
      product: "产品",
      resources: "资源",
      about: "关于我们",
      legal: "法律信息",
      contact: "联系我们",
      rights: "© 2026 LearnMore Edu. 保留所有权利。",
      features: "功能特性",
      pricing: "价格方案",
      stories: "成功案例",
      blog: "动态资讯",
      guides: "学习指南",
      care: "学生关怀"
    }
  },
  ms: {
    hero: {
      badge: "Kurikulum Baharu 2025 Dikemaskini",
      headline: "Lebih Daripada Sekadar Latihan.\nTutor AI Peribadi Anda.",
      subheadline: "Pembelajaran adaptif berasaskan Graf Pengetahuan yang menukar setiap minit kepada kemajuan. Berhenti meneka, mula menguasai.",
      ctaPrimary: "Dapatkan Laporan Diagnosis Percuma",
      ctaSecondary: "Tonton Demo",
      stat1: "Pelajar Aktif",
      stat2: "Soalan Diselesaikan"
    },
    painPoints: {
      title: "Mengapa Pembelajaran Tradisional Gagal",
      subtitle: "Kami menyelesaikan masalah yang menghalang pelajar.",
      card1Title: "Markah Tersekat?",
      card1Desc: "Berlatih secara buta tanpa mengetahui MENGAPA anda salah. AI kami mengaitkan kesilapan dengan jurang konsep tertentu.",
      card2Title: "Tutor Terlalu Mahal?",
      card2Desc: "Tutor peribadi mahal. LearnMore menyediakan bimbingan 24/7 dengan harga yang jauh lebih rendah.",
      card3Title: "Sesat dalam Buku Teks?",
      card3Desc: "Buku teks adalah linear. Pengetahuan saling berkait. Kami memberikan anda GPS peribadi untuk pembelajaran."
    },
    features: {
      f1Title: "Navigasi Graf Pengetahuan",
      f1Desc: "Visualisasikan hubungan antara konsep. Jika anda gagal persamaan kuadratik, kami mungkin mengesan kelemahan dalam pemfaktoran asas.",
      f1Tag: "Petakan Minda Anda",
      f1List: ['Ketergantungan visual', 'Pemetaan prasyarat', 'Analisis jurang'],
      f2Title: "Laporan Diagnostik AI",
      f2Desc: "Dapatkan carta radar komprehensif yang membandingkan kemahiran anda dengan purata gred. Ketahui dengan tepat di mana untuk fokus sebelum peperiksaan.",
      f2Tag: "Dipacu Data",
      f2Button: "Lihat Contoh Laporan",
      f3Title: "Papan Pemuka Ibu Bapa",
      f3Desc: "Kekal dimaklumkan tanpa perlu mengganggu. Terima pemberitahuan kemajuan mingguan dan raikan pencapaian bersama.",
      f3Tag: "Ketelusan",
      f3Trusted: "Dipercayai oleh 15k+ ibu bapa"
    },
    comparison: {
      title: "Pilihan Lebih Bijak",
      col1: "Kelas Tuisyen Tradisional",
      col2: "LearnMore AI Pro",
      row1: "Kelajuan Maklum Balas",
      row1bad: "Beberapa hari kemudian (Lambat)",
      row1good: "Segera (Masa nyata)",
      row2: "Laluan Pembelajaran",
      row2bad: "Satu saiz untuk semua (Membosankan)",
      row2good: "Adaptif (Gamifikasi)",
      row3: "Ketersediaan",
      row3bad: "Jadual Tetap (Kaku)",
      row3good: "24/7 Bila-bila masa (Fleksibel)",
      row4: "Keberkesanan Kos",
      row4bad: "$$$ Mahal",
      row4good: "$ Mampu Milik"
    },
    testimonials: {
      title: "Apa Kata Pelajar",
      t1: "Laporan analisis membantu saya menyedari saya tidak lemah dalam Matematik, saya cuma terlepas satu konsep di Tingkatan 1.",
      t1Author: "Michael Z.",
      t1Role: "Tingkatan 3 • Peningkatan +25 mata",
      t2: "Saya dulu benci formula Fizik. Graf Pengetahuan membuatkan saya faham bagaimana ia sebenarnya berkait.",
      t2Author: "Sarah L.",
      t2Role: "Tingkatan 2 • Teratas dalam Kelas",
      t3: "Ibu bapa saya akhirnya berhenti membebel kerana aplikasi menghantar kemaskini secara automatik!",
      t3Author: "Jason K.",
      t3Role: "Tingkatan 3 • Pelajar Gembira",
    },
    cta: {
      title: "Sedia untuk Lonjakkan Gred Anda?",
      btn: "Mulakan Perjalanan Anda"
    },
    newsletter: {
      title: "Kekal Dikemas Kini dengan Petua Pembelajaran",
      desc: "Dapatkan pandangan mingguan, strategi belajar, dan kemas kini produk terus ke peti masuk anda.",
      placeholder: "Masukkan email anda",
      btn: "Langgan",
      note: "Kami hormati privasi anda. Berhenti melanggan bila-bila masa."
    },
    footer: {
      product: "Produk",
      resources: "Sumber",
      about: "Tentang Kami",
      legal: "Perundangan",
      contact: "Hubungi Kami",
      rights: "© 2026 LearnMore Edu. Hak cipta terpelihara.",
      features: "Ciri-ciri",
      pricing: "Harga",
      stories: "Kisah Kejayaan",
      blog: "Blog / Berita",
      guides: "Panduan Belajar",
      care: "Penjagaan Pelajar"
    }
  }
};

interface LandingPageProps {
  stats: PlatformStats;
  isLoggedIn?: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ stats, isLoggedIn = false }) => {
  const router = useRouter();
  const { lang, setLang } = useApp();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
  const toggleLang = () => {
    const nextLang = lang === 'ms' ? 'en' : lang === 'en' ? 'zh' : 'ms';
    setLang(nextLang);
  };
  
  // Use local translations based on global lang context
  const t = localTranslations[lang as keyof typeof localTranslations] || localTranslations['en'];

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const testimonialsList = [
    { text: t.testimonials.t1, author: t.testimonials.t1Author, role: t.testimonials.t1Role, img: "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=200&auto=format&fit=crop" },
    { text: t.testimonials.t2, author: t.testimonials.t2Author, role: t.testimonials.t2Role, img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop" },
    { text: t.testimonials.t3, author: t.testimonials.t3Author, role: t.testimonials.t3Role, img: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop" },
  ];

  const handleCTAClick = () => {
    if (isLoggedIn) {
      router.push('/dashboard');
    } else {
      router.push('/register');
    }
  };

  // Format stats with K/M suffixes
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M+';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k+';
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-500/30 selection:text-blue-100 overflow-x-hidden">
      <Navbar lang={lang} onToggleLang={toggleLang} isLoggedIn={isLoggedIn} />

      {/* --- 1. Hero Section --- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Abstract Background Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none opacity-50 animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="text-center lg:text-left relative z-20">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium mb-6 animate-fade-in-up">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                {t.hero.badge}
              </div>
              <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1] animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <span className="text-white block">{t.hero.headline.split('\n')[0]}</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 block">
                  {t.hero.headline.split('\n')[1]}
                </span>
              </h1>
              <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                {t.hero.subheadline}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <Button size="xl" variant="glow" onClick={handleCTAClick} type="button" className="h-14 px-8 text-base shadow-blue-500/25 cursor-pointer relative z-30">
                  {t.hero.ctaPrimary}
                </Button>
                <Button size="xl" variant="outline" type="button" className="h-14 px-8 text-base border-slate-700 hover:bg-slate-800 text-slate-300 cursor-pointer relative z-30">
                  <Play className="w-4 h-4 mr-2 fill-current" /> {t.hero.ctaSecondary}
                </Button>
              </div>

              <div className="mt-10 flex items-center justify-center lg:justify-start gap-8 text-sm text-slate-500 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-white">{formatNumber(stats.activeStudents)}</span>
                  <span>{t.hero.stat1}</span>
                </div>
                <div className="w-px h-8 bg-slate-800"></div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-white">{formatNumber(stats.questionsSolved)}</span>
                  <span>{t.hero.stat2}</span>
                </div>
              </div>
            </div>

            {/* Visual / 3D Abstract Graph Placeholder */}
            <div className="relative h-[400px] lg:h-[500px] w-full animate-float hidden lg:block">
               {/* Central Node */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-600 rounded-full blur-[60px] opacity-40"></div>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-slate-900 border border-blue-500/50 rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.3)] z-20">
                  <Brain className="w-10 h-10 text-blue-400" />
               </div>

               {/* Satellite Nodes - Simulated Graph */}
               {[ 
                 { top: '20%', left: '20%', icon: Target, color: 'text-emerald-400', border: 'border-emerald-500/30' },
                 { top: '20%', left: '80%', icon: Zap, color: 'text-yellow-400', border: 'border-yellow-500/30' },
                 { top: '80%', left: '30%', icon: BarChart2, color: 'text-purple-400', border: 'border-purple-500/30' },
                 { top: '70%', left: '85%', icon: BookOpen, color: 'text-pink-400', border: 'border-pink-500/30' },
               ].map((node, i) => (
                 <React.Fragment key={i}>
                    {/* Line Connector */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                       <line x1="50%" y1="50%" x2={node.left} y2={node.top} stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4 4" />
                    </svg>
                    {/* Node */}
                    <div className={`absolute w-12 h-12 bg-slate-900 border ${node.border} rounded-lg flex items-center justify-center z-10 shadow-lg`} style={{ top: node.top, left: node.left }}>
                       <node.icon className={`w-5 h-5 ${node.color}`} />
                    </div>
                 </React.Fragment>
               ))}
               
               {/* Floating Badge */}
               <div className="absolute top-[10%] right-[10%] bg-slate-800/80 backdrop-blur border border-slate-700 p-3 rounded-lg flex gap-3 shadow-xl z-30 animate-bounce" style={{ animationDuration: '3s' }}>
                  <div className="h-10 w-10 bg-green-500/20 rounded-full flex items-center justify-center">
                     <CheckCircle2 className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                     <div className="text-xs text-slate-400">Concept Mastered</div>
                     <div className="text-sm font-bold text-white">Quadratic Formula</div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- 2. Pain Points Section --- */}
      <section className="py-24 bg-slate-900/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t.painPoints.title}</h2>
            <p className="text-slate-400 text-lg">{t.painPoints.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[ 
              { title: t.painPoints.card1Title, desc: t.painPoints.card1Desc, icon: Activity, color: "text-red-400", bg: "bg-red-400/10", border: "hover:border-red-500/50" },
              { title: t.painPoints.card2Title, desc: t.painPoints.card2Desc, icon: Users, color: "text-orange-400", bg: "bg-orange-400/10", border: "hover:border-orange-500/50" },
              { title: t.painPoints.card3Title, desc: t.painPoints.card3Desc, icon: Map, color: "text-blue-400", bg: "bg-blue-400/10", border: "hover:border-blue-500/50" },
            ].map((card, i) => (
              <Card key={i} className={`bg-slate-950 border border-slate-800 transition-all hover:-translate-y-1 group ${card.border}`}>
                <CardContent className="p-8 h-full flex flex-col items-start">
                  <div className={`w-14 h-14 rounded-2xl ${card.bg} flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                    <card.icon className={`w-7 h-7 ${card.color} group-hover:animate-bounce`} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{card.title}</h3>
                  <p className="text-slate-400 leading-relaxed text-sm">
                    {card.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* --- 3. Feature Showcase (Zig-zag) --- */}
      <section className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32">
          
          {/* Feature 1: Knowledge Graph */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block text-blue-400 font-bold tracking-wider uppercase text-sm mb-2">{t.features.f1Tag}</div>
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">{t.features.f1Title}</h3>
              <p className="text-slate-400 text-lg leading-relaxed mb-8">
                {t.features.f1Desc}
              </p>
              <ul className="space-y-4">
                {t.features.f1List.map(item => (
                  <li key={item} className="flex items-center text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-blue-500 mr-3" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 p-8 h-[400px] flex items-center justify-center group overflow-hidden">
               <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
               {/* Visual: Animated Nodes */}
               <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
                  <div className="flex gap-12 mb-12">
                     <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-red-500/50 flex items-center justify-center text-xs text-center p-1 text-slate-300 relative shadow-[0_0_20px_rgba(239,68,68,0.2)] animate-pulse-slow">
                        Quadratic Eq
                        <div className="absolute -bottom-12 left-1/2 w-0.5 h-12 bg-slate-700 origin-top animate-[growDown_1s_ease-out_forwards]"></div>
                     </div>
                  </div>
                  <div className="flex gap-8">
                     <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-yellow-500/50 flex items-center justify-center text-xs text-center p-1 text-slate-300 shadow-[0_0_20px_rgba(234,179,8,0.2)] animate-float" style={{ animationDelay: '0.5s' }}>
                        Factoring
                     </div>
                     <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-green-500/50 flex items-center justify-center text-xs text-center p-1 text-slate-300 shadow-[0_0_20px_rgba(34,197,94,0.2)] animate-float" style={{ animationDelay: '1s' }}>
                        Real Numbers
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Feature 2: Radar Chart */}
          <div className="grid lg:grid-cols-2 gap-16 items-center lg:flex-row-reverse">
            <div className="order-2 lg:order-1 relative rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 p-8 h-[400px] flex items-center justify-center">
               {/* Visual: Animated Radar Chart */}
               <div className="relative w-64 h-64">
                  {/* Grid Lines */}
                  {[1, 2, 3].map(i => (
                     <div key={i} className="absolute inset-0 border border-slate-600 rounded-full opacity-30" style={{ transform: `scale(${i * 0.33})` }}></div>
                  ))}
                  <div className="absolute inset-0 border-l border-r border-slate-600 opacity-20 rotate-45"></div>
                  <div className="absolute inset-0 border-l border-r border-slate-600 opacity-20 -rotate-45"></div>
                  
                  {/* Data Polygon - Animated via CSS keyframes or scale */}
                  <div className="absolute inset-0 flex items-center justify-center">
                     <div className="w-full h-full bg-emerald-500/20 border-2 border-emerald-500 rounded-lg transform rotate-12 scale-75 shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-[pulse_3s_ease-in-out_infinite]"></div>
                  </div>
                  
                  {/* Labels */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-emerald-400">Algebra</div>
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-400">Geometry</div>
                  <div className="absolute top-1/2 -left-12 -translate-y-1/2 text-xs font-bold text-slate-400">Calc</div>
                  <div className="absolute top-1/2 -right-12 -translate-y-1/2 text-xs font-bold text-emerald-400">Stats</div>
               </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-block text-emerald-400 font-bold tracking-wider uppercase text-sm mb-2">{t.features.f2Tag}</div>
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">{t.features.f2Title}</h3>
              <p className="text-slate-400 text-lg leading-relaxed mb-8">
                {t.features.f2Desc}
              </p>
              <Button variant="outline" className="text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10">
                 {t.features.f2Button} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* Feature 3: Parent Dashboard */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block text-purple-400 font-bold tracking-wider uppercase text-sm mb-2">{t.features.f3Tag}</div>
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">{t.features.f3Title}</h3>
              <p className="text-slate-400 text-lg leading-relaxed mb-8">
                {t.features.f3Desc}
              </p>
              <div className="flex items-center gap-4">
                 <div className="flex -space-x-3">
                    {[ 
                      "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=60",
                      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=60",
                      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&auto=format&fit=crop&q=60"
                    ].map((img, i) => (
                      <img key={i} src={img} alt="Parent" className="w-10 h-10 rounded-full border-2 border-slate-950 object-cover" />
                    ))}
                 </div>
                 <span className="text-sm text-slate-400 self-center">{t.features.f3Trusted}</span>
              </div>
            </div>
            <div className="relative rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 p-8 h-[400px] flex items-center justify-center">
               {/* Visual: Mobile Notification Animation */}
               <div className="w-48 h-80 bg-black border-4 border-slate-700 rounded-3xl p-3 relative shadow-2xl overflow-hidden">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 h-4 w-20 bg-slate-800 rounded-b-xl z-20"></div>
                  <div className="mt-8 space-y-3 relative z-10">
                     <div className="bg-slate-800 p-2 rounded-lg h-20 w-full animate-pulse opacity-50"></div>
                     {/* Notification Card - Sliding In */}
                     <div className="bg-slate-800 p-3 rounded-xl border border-blue-500/30 relative overflow-hidden animate-[slideInRight_1s_ease-out_forwards] transform translate-x-full">
                        <div className="flex justify-between items-start mb-2">
                           <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center"><TrendingUp className="w-3 h-3 text-white" /></div>
                           <span className="text-[10px] text-slate-400">Now</span>
                        </div>
                        <div className="text-xs font-bold text-white mb-1">Weekly Report Ready</div>
                        <div className="text-[10px] text-slate-400">Alex mastered 12 new concepts in Math this week!</div>
                     </div>
                     <div className="bg-slate-800 p-2 rounded-lg h-12 w-full opacity-30"></div>
                  </div>
                  {/* Wallpaper effect */}
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-blue-900/20 z-0"></div>
               </div>
            </div>
          </div>

        </div>
      </section>

      {/* --- 4. Comparison Table --- */}
      <section className="py-24 bg-slate-900/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">{t.comparison.title}</h2>
          </div>
          
          <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl ring-1 ring-white/5">
            <div className="grid grid-cols-3 p-6 border-b border-slate-800 bg-slate-900/50 text-sm md:text-base font-bold text-slate-300">
               <div className="col-span-1"></div>
               <div className="col-span-1 text-center opacity-50 text-xs md:text-sm uppercase tracking-wider">{t.comparison.col1}</div>
               <div className="col-span-1 text-center text-blue-400 flex items-center justify-center gap-2 text-xs md:text-sm uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 fill-blue-400 hidden md:block" /> {t.comparison.col2}
               </div>
            </div>
            
            {[ 
              { label: t.comparison.row1, bad: t.comparison.row1bad, good: t.comparison.row1good, icon: XCircle },
              { label: t.comparison.row2, bad: t.comparison.row2bad, good: t.comparison.row2good, icon: HelpCircle },
              { label: t.comparison.row3, bad: t.comparison.row3bad, good: t.comparison.row3good, icon: XCircle },
              { label: t.comparison.row4, bad: t.comparison.row4bad, good: t.comparison.row4good, icon: null }
            ].map((row, i) => (
              <div key={i} className={`grid grid-cols-3 p-6 items-center border-b border-slate-800/50 last:border-none hover:bg-white/5 transition-colors ${i % 2 === 1 ? 'bg-slate-900/20' : ''}`}>
                 <div className="font-medium text-slate-300 text-sm md:text-base">{row.label}</div>
                 <div className="text-center text-slate-500 flex flex-col items-center gap-1 opacity-70">
                    {row.icon && <row.icon className="w-5 h-5 text-red-900/50" />}
                    <span className={`text-xs md:text-sm ${!row.icon ? 'line-through font-mono' : ''}`}>{row.bad}</span>
                 </div>
                 <div className="text-center text-white flex flex-col items-center gap-1">
                    {row.icon ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <span className="text-xl font-bold text-emerald-400">$</span>}
                    <span className="text-xs md:text-sm font-bold text-emerald-100">{row.good}</span>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- 5. Testimonials (Carousel) --- */}
      <section className="py-24 relative overflow-hidden bg-[#020617]">
         <div className="absolute inset-0 bg-blue-900/5 pointer-events-none"></div>
         <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl font-bold text-white mb-12">{t.testimonials.title}</h2>
            
            <div className="relative bg-slate-900/50 border border-slate-800 p-8 rounded-3xl backdrop-blur-sm min-h-[300px] flex flex-col justify-center items-center transition-all">
               <Quote className="w-10 h-10 text-blue-500/20 absolute top-6 left-6" />
               
               <div className="mb-8">
                  <p className="text-xl md:text-2xl text-slate-200 font-medium leading-relaxed italic">
                     &quot;{testimonialsList[currentTestimonial].text}&quot;
                  </p>
               </div>
               
               <div className="flex items-center gap-4 animate-fade-in-up">
                  <img 
                    src={testimonialsList[currentTestimonial].img} 
                    alt={testimonialsList[currentTestimonial].author} 
                    className="w-14 h-14 rounded-full border-2 border-blue-500 object-cover" 
                  />
                  <div className="text-left">
                     <div className="font-bold text-white text-lg">{testimonialsList[currentTestimonial].author}</div>
                     <div className="text-sm text-blue-400 font-medium">{testimonialsList[currentTestimonial].role}</div>
                  </div>
               </div>

               {/* Carousel Indicators */}
               <div className="flex justify-center gap-2 mt-8">
                  {testimonialsList.map((_, idx) => (
                     <button 
                       key={idx}
                       onClick={() => setCurrentTestimonial(idx)}
                       className={`w-2 h-2 rounded-full transition-all ${currentTestimonial === idx ? 'bg-blue-500 w-6' : 'bg-slate-700 hover:bg-slate-600'}`}
                     />
                  ))}
               </div>
            </div>
         </div>
      </section>

      {/* --- 6. CTA & Footer --- */}
      <section className="py-20 text-center">
         <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">{t.cta.title}</h2>
            <Button size="xl" variant="glow" onClick={handleCTAClick} type="button" className="px-12 py-6 text-lg rounded-full cursor-pointer">
               {t.cta.btn}
            </Button>
         </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 px-4">
         <div className="max-w-4xl mx-auto">
            <NewsletterForm content={t.newsletter} />
         </div>
      </section>

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
                  {/* Social Icons */}
                  <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"><Share2 className="w-4 h-4" /></div>
               </div>
            </div>
            
            <div>
               <h4 className="font-bold text-white mb-6">{t.footer.product}</h4>
               <ul className="space-y-4 text-sm text-slate-400">
                  <li><button onClick={() => router.push('/how-it-works')} className="hover:text-blue-400 transition-colors text-left">{t.footer.features}</button></li>
                  <li><button onClick={() => router.push('/pricing')} className="hover:text-blue-400 transition-colors text-left">{t.footer.pricing}</button></li>
                  <li><button onClick={() => router.push('/success-stories')} className="hover:text-blue-400 transition-colors text-left">{t.footer.stories}</button></li>
               </ul>
            </div>

            <div>
               <h4 className="font-bold text-white mb-6">{t.footer.resources}</h4>
               <ul className="space-y-4 text-sm text-slate-400">
                  <li><button onClick={() => router.push('/blog')} className="hover:text-blue-400 transition-colors text-left">{t.footer.blog}</button></li>
                  <li><button onClick={() => router.push('/study-guides')} className="hover:text-blue-400 transition-colors text-left">{t.footer.guides}</button></li>
                  <li><button onClick={() => router.push('/student-care')} className="hover:text-blue-400 transition-colors text-left">{t.footer.care}</button></li>
               </ul>
            </div>

            <div>
               <h4 className="font-bold text-white mb-6">{t.footer.contact}</h4>
               <ul className="space-y-4 text-sm text-slate-400">
                  <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> +1 (555) 123-4567</li>
                  <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> support@learnmore.ai</li>
                  <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /> San Francisco, CA</li>
               </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-600">
             <div>{t.footer.rights}</div>
             <div className="flex gap-6">
                <button onClick={() => router.push('/terms')} className="hover:text-slate-400 transition-colors">Terms</button>
                <button onClick={() => router.push('/privacy')} className="hover:text-slate-400 transition-colors">Privacy</button>
                <button onClick={() => router.push('/contact')} className="hover:text-slate-400 transition-colors">Contact us</button>
             </div>
          </div>
        </div>
      </footer>
      
      {/* Animation Styles Injection */}
      <style>{`
        @keyframes growDown {
          0% { height: 0; opacity: 0; }
          100% { height: 3rem; opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
