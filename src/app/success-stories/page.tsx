"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { Quote, Play, Star, TrendingUp, Heart, Sparkles, ArrowRight } from 'lucide-react';
import { useApp } from '@/providers/app-provider';

const SuccessStoriesPage: React.FC = () => {
  const router = useRouter();
  const { lang, setLang } = useApp();

  const toggleLang = () => {
    const nextLang = lang === 'en' ? 'zh' : 'en';
    setLang(nextLang);
  };

  const t = {
    en: {
      hero: {
        tag: "Beyond the Scoreboard",
        title: "Real Stories.\nReal Transformation.",
        subtitle: "It’s not just about the 'A'. It’s about the moment everything finally clicks."
      },
      stories: {
        s1: {
            tag: "The Epiphany",
            title: "From Rote Memorization to Logical Mastery",
            quote: "I used to memorize formulas blindly. The Knowledge Graph showed me how they connect. Now, I don't just remember physics—I understand it.",
            author: "Jun Hao, Grade 9",
            result: "Physics: C ➔ A",
            img: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?q=80&w=800&auto=format&fit=crop"
        },
        s2: {
            tag: "Family Harmony",
            title: "Dinner Time is for Talking, Not Fighting",
            quote: "Homework used to be a battlefield. With LearnMore's auto-assigned adaptive practice, I don't have to nag. We finally have our evenings back.",
            author: "Mrs. Tan, Parent",
            result: "Zero Homework Conflicts",
            img: "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=800&auto=format&fit=crop"
        },
        s3: {
            tag: "Self-Driven",
            title: "Addicted to the Progress Bar",
            quote: "I didn't care about studying. But unlocking the 'Quantum Badge' became an obsession. I just wanted to beat my high score. The grades just followed.",
            author: "Aisha, Grade 8",
            result: "Top 5% on Leaderboard",
            img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop"
        }
      },
      stats: {
          confidence: "Improved Confidence",
          time: "Less Study Time",
          retention: "Long-term Retention"
      },
      videos: {
          title: "Hear from our Community",
          subtitle: "Unscripted interviews with students and parents."
      },
      cta: {
          title: "Write Your Own Success Story",
          btn: "Start Your Journey"
      },
      footer: "© 2025 LearnMore Edu. All rights reserved."
    },
    zh: {
      hero: {
        tag: "超越分数",
        title: "真实的故事。\n真正的蜕变。",
        subtitle: "这不仅仅是为了拿“A”。而是关于那个突然“开窍”的瞬间。"
      },
      stories: {
        s1: {
            tag: "顿悟时刻",
            title: "从死记硬背到逻辑精通",
            quote: "我以前只是盲目地背公式。知识图谱向我展示了它们之间的联系。现在，我不只是记住了物理——我真正理解了它。",
            author: "Jun Hao, 初三",
            result: "物理: C ➔ A",
            img: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?q=80&w=800&auto=format&fit=crop"
        },
        s2: {
            tag: "家庭和谐",
            title: "晚餐时间是用来聊天的，不是用来吵架的",
            quote: "以前写作业就像上战场。有了 LearnMore 的自适应练习，我再也不用唠叨了。我们终于找回了温馨的夜晚。",
            author: "陈太太, 家长",
            result: "作业冲突归零",
            img: "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=800&auto=format&fit=crop"
        },
        s3: {
            tag: "自我驱动",
            title: "为了解锁徽章而上瘾",
            quote: "我以前不在乎学习。但解锁“量子徽章”成了一种执念。我只是想刷新我的高分记录，成绩的提升只是顺带的结果。",
            author: "Aisha, 初二",
            result: "排行榜前 5%",
            img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop"
        }
      },
      stats: {
          confidence: "自信心提升",
          time: "学习时间减少",
          retention: "长期记忆保留"
      },
      videos: {
          title: "社区之声",
          subtitle: "来自学生和家长的真实采访。"
      },
      cta: {
          title: "书写你自己的成功故事",
          btn: "开启学习之旅"
      },
      footer: "© 2025 LearnMore Edu. 保留所有权利。"
    }
  };

  const currentT = t[lang as keyof typeof t] || t['en'];

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-blue-500/30 selection:text-blue-100 overflow-x-hidden">
      <Navbar lang={lang === 'ms' ? 'en' : lang} onToggleLang={toggleLang} />

      <main className="pt-24 pb-20">
        
        {/* Hero Section */}
        <section className="relative py-20 px-6 max-w-5xl mx-auto text-center animate-fade-in-up">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none"></div>
           
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-yellow-400 text-xs font-bold uppercase tracking-widest mb-8 relative z-10">
              <Star className="w-3 h-3 fill-yellow-400" /> {currentT.hero.tag}
           </div>
           
           <h1 className="font-serif text-5xl md:text-7xl font-medium leading-[1.1] mb-8 text-white relative z-10 whitespace-pre-line">
              {currentT.hero.title}
           </h1>
           <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto relative z-10 font-light leading-relaxed">
              {currentT.hero.subtitle}
           </p>
        </section>

        {/* Impact Stats */}
        <section className="py-12 border-y border-slate-900 bg-[#050b14]">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="p-6">
                    <div className="text-5xl md:text-6xl font-bold text-blue-500 mb-2">92%</div>
                    <div className="text-sm font-bold uppercase tracking-widest text-slate-500">{currentT.stats.confidence}</div>
                </div>
                <div className="p-6 border-y md:border-y-0 md:border-x border-slate-900">
                    <div className="text-5xl md:text-6xl font-bold text-emerald-500 mb-2">40%</div>
                    <div className="text-sm font-bold uppercase tracking-widest text-slate-500">{currentT.stats.time}</div>
                </div>
                <div className="p-6">
                    <div className="text-5xl md:text-6xl font-bold text-purple-500 mb-2">3.5x</div>
                    <div className="text-sm font-bold uppercase tracking-widest text-slate-500">{currentT.stats.retention}</div>
                </div>
            </div>
        </section>

        {/* Featured Stories (Editorial Layout) */}
        <section className="py-24 max-w-7xl mx-auto px-6 space-y-32">
            
            {/* Story 1: The Epiphany */}
            <div className="grid lg:grid-cols-2 gap-16 items-center group">
                <div className="relative order-2 lg:order-1">
                    <div className="absolute inset-0 bg-blue-600 rounded-2xl rotate-3 group-hover:rotate-1 transition-transform duration-500 opacity-20"></div>
                    <div className="relative rounded-2xl overflow-hidden aspect-[4/5] shadow-2xl">
                         <img src={currentT.stories.s1.img} alt="Student learning" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                         <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
                         <div className="absolute bottom-8 left-8">
                            <div className="bg-white text-slate-900 text-xs font-bold px-3 py-1 rounded-full inline-block mb-2">
                                {currentT.stories.s1.result}
                            </div>
                            <div className="text-white font-serif text-xl">{currentT.stories.s1.author}</div>
                         </div>
                    </div>
                </div>
                <div className="order-1 lg:order-2">
                    <div className="text-blue-500 font-bold uppercase tracking-wider text-sm mb-4 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> {currentT.stories.s1.tag}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-serif text-white mb-8 leading-tight">
                        {currentT.stories.s1.title}
                    </h2>
                    <div className="relative pl-8 border-l-2 border-blue-500/30">
                        <Quote className="absolute -left-3 -top-3 w-6 h-6 text-blue-500 bg-[#020617] p-1" />
                        <p className="text-xl md:text-2xl text-slate-300 italic font-light leading-relaxed mb-6">
                            &quot;{currentT.stories.s1.quote}&quot;
                        </p>
                    </div>
                </div>
            </div>

            {/* Story 2: Family Harmony */}
            <div className="grid lg:grid-cols-2 gap-16 items-center group">
                <div className="order-1">
                    <div className="text-rose-500 font-bold uppercase tracking-wider text-sm mb-4 flex items-center gap-2">
                        <Heart className="w-4 h-4" /> {currentT.stories.s2.tag}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-serif text-white mb-8 leading-tight">
                        {currentT.stories.s2.title}
                    </h2>
                    <div className="relative pl-8 border-l-2 border-rose-500/30">
                        <Quote className="absolute -left-3 -top-3 w-6 h-6 text-rose-500 bg-[#020617] p-1" />
                        <p className="text-xl md:text-2xl text-slate-300 italic font-light leading-relaxed mb-6">
                            &quot;{currentT.stories.s2.quote}&quot;
                        </p>
                    </div>
                </div>
                <div className="relative order-2">
                    <div className="absolute inset-0 bg-rose-600 rounded-2xl -rotate-2 group-hover:-rotate-1 transition-transform duration-500 opacity-20"></div>
                    <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-2xl">
                         <img src={currentT.stories.s2.img} alt="Family" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                         <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
                         <div className="absolute bottom-8 left-8">
                            <div className="bg-white text-slate-900 text-xs font-bold px-3 py-1 rounded-full inline-block mb-2">
                                {currentT.stories.s2.result}
                            </div>
                            <div className="text-white font-serif text-xl">{currentT.stories.s2.author}</div>
                         </div>
                    </div>
                </div>
            </div>

            {/* Story 3: Self Driven */}
            <div className="grid lg:grid-cols-2 gap-16 items-center group">
                <div className="relative order-2 lg:order-1">
                    <div className="absolute inset-0 bg-yellow-600 rounded-2xl rotate-2 group-hover:rotate-1 transition-transform duration-500 opacity-20"></div>
                    <div className="relative rounded-2xl overflow-hidden aspect-[4/5] shadow-2xl">
                         <img src={currentT.stories.s3.img} alt="Student Achievement" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                         <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
                         <div className="absolute bottom-8 left-8">
                            <div className="bg-white text-slate-900 text-xs font-bold px-3 py-1 rounded-full inline-block mb-2">
                                {currentT.stories.s3.result}
                            </div>
                            <div className="text-white font-serif text-xl">{currentT.stories.s3.author}</div>
                         </div>
                    </div>
                </div>
                <div className="order-1 lg:order-2">
                    <div className="text-yellow-500 font-bold uppercase tracking-wider text-sm mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> {currentT.stories.s3.tag}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-serif text-white mb-8 leading-tight">
                        {currentT.stories.s3.title}
                    </h2>
                    <div className="relative pl-8 border-l-2 border-yellow-500/30">
                        <Quote className="absolute -left-3 -top-3 w-6 h-6 text-yellow-500 bg-[#020617] p-1" />
                        <p className="text-xl md:text-2xl text-slate-300 italic font-light leading-relaxed mb-6">
                            &quot;{currentT.stories.s3.quote}&quot;
                        </p>
                    </div>
                </div>
            </div>

        </section>

        {/* Video Testimonials */}
        <section className="py-24 bg-slate-900/50">
           <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{currentT.videos.title}</h2>
                  <p className="text-slate-400 text-lg">{currentT.videos.subtitle}</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                 {[ 
                    "https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=800&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1554151228-14d9def656ec?q=80&w=800&auto=format&fit=crop"
                 ].map((img, i) => (
                    <div key={i} className="group relative rounded-2xl overflow-hidden aspect-video cursor-pointer">
                        <img src={img} alt="Video Thumbnail" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50 group-hover:scale-110 transition-transform">
                                <Play className="w-6 h-6 text-white ml-1 fill-white" />
                            </div>
                        </div>
                        <div className="absolute bottom-4 left-4">
                            <div className="text-white font-bold shadow-black drop-shadow-md">Student Interview #{i+1}</div>
                        </div>
                    </div>
                 ))}
              </div>
           </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-6 text-center">
            <div className="max-w-3xl mx-auto">
                <h2 className="font-serif text-4xl md:text-5xl text-white mb-8">{currentT.cta.title}</h2>
                <Button size="xl" variant="glow" onClick={() => router.push('/register')} className="px-12 py-6 text-lg rounded-full shadow-lg shadow-blue-500/20">
                    {currentT.cta.btn} <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
            </div>
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

export default SuccessStoriesPage;
