import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/Button';
import { 
  Target, Map, Play, TrendingUp, History, 
  ChevronRight, Brain, CheckCircle2, 
  Bell
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Lang = 'en' | 'zh';

const translations = {
  en: {
    title: "How It Works",
    subtitle: "The LearnMore AI Learning Loop",
    description: "Our scientifically proven 5-step method turns effort into mastery.",
    steps: {
      assess: "Assess",
      plan: "Plan",
      learn: "Learn",
      practice: "Practice",
      review: "Review"
    },
    cta: "Start Learning Now",
    s1: {
      step: "STEP 01",
      title: "Start with a comprehensive checkup.",
      desc: "Stop guessing what you know. Our AI diagnostic engine scans your knowledge base across multiple dimensions to find the root cause of every mistake.",
      check1: "Topic Coverage",
      check2: "Skill Depth",
      logs: [
        ">> ANALYZING_ALGEBRA_MODULE [OK]",
        ">> CHECKING_GEOMETRY_BASICS [OK]",
        ">> DETECTED_GAP: QUADRATIC_EQ [FLAG]",
        ">> CALCULATING_PROFICIENCY... 68%",
        ">> GENERATING_REPORT_ID_8821... ...",
        ">> INITIALIZING_PATHFINDER [OK]"
      ]
    },
    s2: {
      step: "STEP 02",
      title: "Your personalized GPS for learning.",
      desc: "No more getting lost in textbooks. Our Knowledge Graph connects every concept, creating a tailored roadmap from your current level straight to your goal.",
      cardTitle: "Dynamic Routing",
      cardDesc: "Path updates automatically as you improve",
      start: "START",
      goal: "GOAL",
      next: "Next Concept",
      subject: "Linear Algebra"
    },
    s3: {
      step: "STEP 03",
      title: "Bite-sized, focused lessons.",
      desc: "Learning happens best when you're engaged. Our interactive video player monitors your attention in real-time and inserts quizzes exactly when you need them.",
      tags: ['5-min Videos', 'In-video Quizzes', 'Smart Notes'],
      score: "Focus Score"
    },
    s4: {
      step: "STEP 04",
      title: "Questions that adapt to you.",
      desc: "Why waste time on questions that are too easy? Our CAT (Computer Adaptive Testing) algorithm adjusts difficulty in real-time, keeping you in the optimal 'flow channel' for maximum growth.",
      badge: "Adaptive Difficulty",
      status: "Algorithm Active",
      graphY: "DIFFICULTY",
      graphX: "QUESTIONS",
      zone: "Flow Zone",
      levelUp: "Level Up!"
    },
    s5: {
      step: "STEP 05",
      title: "Never forget what you learned.",
      desc: "We fight the 'Forgetting Curve' for you. Our system tracks memory decay and notifies you to review exactly when you're about to forget, locking knowledge into long-term memory.",
      graphY: "RETENTION",
      graphX: "TIME",
      alertTitle: "Time to Review",
      alertDesc: "Boost retention now",
      btn: "Start Your Journey"
    }
  },
  zh: {
    title: "工作原理",
    subtitle: "LearnMore AI 学习闭环",
    description: "科学验证的5步学习法，将每一分努力转化为精通。",
    steps: {
      assess: "诊断",
      plan: "规划",
      learn: "学习",
      practice: "练习",
      review: "复习"
    },
    cta: "立即开始学习",
    s1: {
      step: "第一步",
      title: "从全面诊断开始。",
      desc: "拒绝盲目刷题。我们的 AI 诊断引擎会多维度扫描你的知识库，精准定位每一个错误的根本原因。",
      check1: "知识点覆盖",
      check2: "技能深度",
      logs: [
        ">> 正在分析_代数模块 [完成]",
        ">> 检查_几何基础 [完成]",
        ">> 发现_薄弱点: 二次方程 [标记]",
        ">> 计算_熟练度... 68%",
        ">> 生成_诊断报告_ID_8821... ...",
        ">> 初始化_学习路径规划 [完成]"
      ]
    },
    s2: {
      step: "第二步",
      title: "你的个性化学习 GPS。",
      desc: "不再在课本中迷失方向。我们的知识图谱连接每一个概念，为你规划从当前水平直达目标的最佳路径。",
      cardTitle: "动态路径规划",
      cardDesc: "路径随能力提升自动调整",
      start: "起点",
      goal: "目标",
      next: "下一知识点",
      subject: "线性代数"
    },
    s3: {
      step: "第三步",
      title: "专注、高效的微课。",
      desc: "最好的学习发生在专注时。我们的互动视频播放器实时监测你的注意力，并在关键时刻插入互动测验。",
      tags: ['5分钟微课', '视频内测验', '智能笔记'],
      score: "专注度评分"
    },
    s4: {
      step: "第四步",
      title: "懂你的自适应题目。",
      desc: "为什么要浪费时间做太简单的题？CAT（计算机自适应测试）算法实时调整题目难度，让你始终处于“心流”通道，获得最快成长。",
      badge: "自适应难度",
      status: "算法运行中",
      graphY: "难度",
      graphX: "题量",
      zone: "心流区",
      levelUp: "能力提升!"
    },
    s5: {
      step: "第五步",
      title: "彻底告别遗忘。",
      desc: "我们帮你对抗“遗忘曲线”。系统追踪记忆衰退点，在即将遗忘的时刻提醒复习，将短期记忆转化为长期记忆。",
      graphY: "记忆保留率",
      graphX: "时间",
      alertTitle: "复习提醒",
      alertDesc: "立即巩固知识点",
      btn: "开启学习之旅"
    }
  }
};

const ProductTourPage: React.FC = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState<Lang>('en');
  const [activeStep, setActiveStep] = useState(0);
  
  const stepRefs = useRef<(HTMLElement | null)[]>([]);

  const toggleLang = () => setLang(prev => prev === 'en' ? 'zh' : 'en');
  const t = translations[lang];

  useEffect(() => {
    const handleScroll = () => {
      // Offset logic for scroll spy
      const viewportHeight = window.innerHeight;
      const triggerPoint = viewportHeight * 0.4;
      
      let current = 0;
      stepRefs.current.forEach((ref, index) => {
        if (ref) {
          const rect = ref.getBoundingClientRect();
          // If the top of the section is above the trigger point
          if (rect.top <= triggerPoint) {
            current = index;
          }
        }
      });
      setActiveStep(current);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToStep = (index: number) => {
    const offset = 100;
    const element = stepRefs.current[index];
    if (element) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  const steps = [
    { id: 'assess', label: t.steps.assess, icon: Target },
    { id: 'plan', label: t.steps.plan, icon: Map },
    { id: 'learn', label: t.steps.learn, icon: Play },
    { id: 'practice', label: t.steps.practice, icon: TrendingUp },
    { id: 'review', label: t.steps.review, icon: History },
  ];

  return (
    <div className="min-h-screen bg-[#050b14] text-white font-sans selection:bg-blue-500/30 selection:text-blue-100 overflow-x-hidden">
      <Navbar lang={lang} onToggleLang={toggleLang} />

      {/* Hero Header */}
      <div className="pt-32 pb-16 px-6 text-center max-w-4xl mx-auto animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6">
          <Brain className="w-3 h-3" /> {t.subtitle}
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
          {t.title}
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          {t.description}
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        {/* Flexbox Layout for Sticky Sidebar */}
        {/* items-start is critical for sticky behavior */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start relative">
          
          {/* Sticky Sidebar */}
          <div className="hidden lg:block w-64 shrink-0 sticky top-32 z-20 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
             <div className="relative pl-4">
               {/* Progress Line */}
               <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-slate-800/50">
                  <div 
                    className="w-full bg-gradient-to-b from-blue-500 to-indigo-500 transition-all duration-300 ease-out"
                    style={{ height: `${(activeStep / (steps.length - 1)) * 100}%` }}
                  ></div>
               </div>

               <div className="space-y-10 relative">
                  {steps.map((step, i) => (
                    <div 
                      key={i} 
                      onClick={() => scrollToStep(i)}
                      className={`group flex items-center gap-5 cursor-pointer transition-all duration-300 ${activeStep === i ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
                    >
                      <div className={`
                        relative z-10 w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300
                        ${activeStep === i 
                          ? 'bg-blue-600 border-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.4)] scale-110' 
                          : 'bg-slate-900 border-slate-700 group-hover:border-slate-500'}
                      `}>
                         <step.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className={`text-base font-bold tracking-wide ${activeStep === i ? 'text-white' : 'text-slate-400'}`}>
                        {step.label}
                      </span>
                    </div>
                  ))}
               </div>
               
               <div className="mt-12 pl-2">
                  <Button fullWidth variant="glow" onClick={() => navigate('/register')} className="shadow-blue-500/20">
                     {t.cta}
                  </Button>
               </div>
             </div>
          </div>

          {/* Mobile Sticky Header */}
          <div className="lg:hidden sticky top-16 z-30 bg-[#050b14]/90 backdrop-blur-xl py-4 border-b border-slate-800 -mx-4 px-4 flex justify-between overflow-x-auto whitespace-nowrap scrollbar-hide w-full">
             {steps.map((step, i) => (
                <button 
                  key={i}
                  onClick={() => scrollToStep(i)}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold transition-all ${activeStep === i ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 bg-slate-900 border border-slate-800'}`}
                >
                  <step.icon className="w-3 h-3" /> {step.label}
                </button>
             ))}
          </div>

          {/* Main Content Sections - Compact Spacing */}
          <div className="flex-1 min-w-0 space-y-24 lg:space-y-32 pt-4 lg:pt-0">
            
            {/* Step 1: Assess */}
            <section ref={el => { stepRefs.current[0] = el }} className="scroll-mt-32 grid lg:grid-cols-2 gap-12 items-center min-h-[40vh]">
               <div className="order-2 lg:order-1 animate-fade-in-up">
                  <div className="text-blue-500 font-mono text-sm font-bold mb-3 flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span> {t.s1.step}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white leading-tight">{t.s1.title}</h2>
                  <p className="text-slate-400 text-base leading-relaxed mb-6">
                     {t.s1.desc}
                  </p>
                  <div className="flex gap-4 text-xs text-slate-500 font-mono border-t border-slate-800 pt-4">
                     <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> {t.s1.check1}</div>
                     <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> {t.s1.check2}</div>
                  </div>
               </div>
               
               <div className="order-1 lg:order-2">
                  <div className="relative h-[360px] bg-slate-900/50 rounded-3xl border border-slate-800 flex flex-col overflow-hidden shadow-2xl group">
                     {/* Radar Chart */}
                     <div className="flex-1 relative flex items-center justify-center">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_70%)]"></div>
                        <div className="relative w-56 h-56">
                           {[100, 75, 50, 25].map((size, i) => (
                              <div key={i} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-slate-700/50 rounded-full" style={{ width: `${size}%`, height: `${size}%` }}></div>
                           ))}
                           <svg className="absolute inset-0 w-full h-full overflow-visible drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                              <polygon 
                                 points="112,28 166,78 148,166 75,148 52,88" 
                                 fill="rgba(59, 130, 246, 0.15)" 
                                 stroke="#3B82F6" 
                                 strokeWidth="2"
                                 className="animate-[pulse_4s_ease-in-out_infinite]"
                              />
                              <circle cx="112" cy="28" r="3" fill="#60A5FA" />
                              <circle cx="166" cy="78" r="3" fill="#60A5FA" />
                              <circle cx="148" cy="166" r="3" fill="#60A5FA" />
                              <circle cx="75" cy="148" r="3" fill="#60A5FA" />
                              <circle cx="52" cy="88" r="3" fill="#60A5FA" />
                           </svg>
                        </div>
                     </div>
                     {/* Data Stream */}
                     <div className="h-28 bg-[#0a0a0a] border-t border-slate-800 p-3 font-mono text-[10px] overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-[#0a0a0a] to-transparent z-10"></div>
                        <div className="space-y-1.5 text-slate-400 animate-[slideUp_12s_linear_infinite]">
                           {[...t.s1.logs, ...t.s1.logs].map((log, i) => (
                              <div key={i} className={`flex justify-between ${log.includes('FLAG') ? 'text-yellow-500' : log.includes('OK') ? 'text-slate-400' : 'text-blue-400'}`}>
                                 <span>{log}</span>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            </section>

            {/* Step 2: Plan */}
            <section ref={el => { stepRefs.current[1] = el }} className="scroll-mt-32 grid lg:grid-cols-2 gap-12 items-center min-h-[40vh]">
               <div className="order-2 lg:order-2 animate-fade-in-up">
                  <div className="text-indigo-500 font-mono text-sm font-bold mb-3 flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span> {t.s2.step}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white leading-tight">{t.s2.title}</h2>
                  <p className="text-slate-400 text-base leading-relaxed mb-6">
                     {t.s2.desc}
                  </p>
                  <div className="p-3 bg-slate-900/50 rounded-xl border border-indigo-500/20 flex gap-3 items-center">
                     <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center"><Map className="w-5 h-5 text-indigo-400" /></div>
                     <div>
                        <div className="text-sm font-bold text-white">{t.s2.cardTitle}</div>
                        <div className="text-xs text-slate-500">{t.s2.cardDesc}</div>
                     </div>
                  </div>
               </div>

               <div className="order-1 lg:order-1">
                  <div className="relative h-[360px] bg-slate-900/50 rounded-3xl border border-slate-800 flex items-center justify-center overflow-hidden shadow-2xl">
                     <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px]"></div>
                     <div className="relative w-full h-full">
                        <svg className="absolute inset-0 w-full h-full pointer-events-none">
                           <path d="M80,260 L180,180 L320,100" stroke="#6366f1" strokeWidth="2" fill="none" strokeDasharray="6" className="animate-[dash_2s_linear_infinite]" />
                           <circle cx="80" cy="260" r="3" fill="#fff" />
                           <circle cx="180" cy="180" r="3" fill="#6366f1" />
                        </svg>
                        <div className="absolute left-[80px] top-[260px] -translate-x-1/2 -translate-y-1/2 mt-4">
                           <div className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">{t.s2.start}</div>
                        </div>
                        <div className="absolute left-[320px] top-[100px] -translate-x-1/2 -translate-y-1/2">
                           <div className="w-6 h-6 border-2 border-indigo-400 rounded-full flex items-center justify-center bg-slate-900 z-10 animate-pulse">
                              <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                           </div>
                           <div className="mt-2 text-[10px] font-mono text-indigo-400 bg-slate-900 px-2 py-0.5 rounded border border-indigo-500/30">{t.s2.goal}</div>
                        </div>
                     </div>
                  </div>
               </div>
            </section>

            {/* Step 3: Learn */}
            <section ref={el => { stepRefs.current[2] = el }} className="scroll-mt-32 grid lg:grid-cols-2 gap-12 items-center min-h-[40vh]">
               <div className="order-2 lg:order-1 animate-fade-in-up">
                  <div className="text-purple-500 font-mono text-sm font-bold mb-3 flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span> {t.s3.step}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white leading-tight">{t.s3.title}</h2>
                  <p className="text-slate-400 text-base leading-relaxed mb-6">
                     {t.s3.desc}
                  </p>
                  <div className="flex flex-wrap gap-2">
                     {t.s3.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-300 text-xs font-bold uppercase">{tag}</span>
                     ))}
                  </div>
               </div>

               <div className="order-1 lg:order-2">
                  <div className="relative h-[360px] bg-slate-900 rounded-3xl border border-slate-800 flex flex-col overflow-hidden shadow-2xl">
                     <div className="h-10 border-b border-slate-800 flex items-center px-4 justify-between bg-slate-800/30">
                        <div className="flex gap-1.5">
                           <div className="w-2.5 h-2.5 rounded-full bg-red-500/20"></div>
                           <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20"></div>
                           <div className="w-2.5 h-2.5 rounded-full bg-green-500/20"></div>
                        </div>
                     </div>
                     <div className="flex-1 relative bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center group">
                        <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                           <Play className="w-5 h-5 text-white ml-1 fill-white" />
                        </div>
                        <div className="absolute bottom-12 right-4 w-40 h-20 bg-black/60 backdrop-blur rounded-lg border border-slate-700 p-2 overflow-hidden">
                           <div className="flex justify-between items-center mb-1">
                              <span className="text-[9px] text-slate-400 font-bold uppercase">{t.s3.score}</span>
                              <span className="text-[10px] text-green-400 font-bold">94%</span>
                           </div>
                           <div className="flex items-end gap-1 h-10">
                              {[40, 60, 45, 70, 85, 90, 88, 95, 92, 98, 94, 96, 80, 85].map((h, i) => (
                                 <div key={i} className="flex-1 bg-green-500/50 rounded-t-sm" style={{ height: `${h}%` }}></div>
                              ))}
                           </div>
                        </div>
                     </div>
                     <div className="h-1 bg-slate-800 w-full relative">
                        <div className="h-full bg-purple-500 w-[60%]"></div>
                     </div>
                  </div>
               </div>
            </section>

            {/* Step 4: Practice */}
            <section ref={el => { stepRefs.current[3] = el }} className="scroll-mt-32 grid lg:grid-cols-2 gap-12 items-center min-h-[40vh]">
               <div className="order-2 lg:order-2 animate-fade-in-up">
                  <div className="text-emerald-500 font-mono text-sm font-bold mb-3 flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> {t.s4.step}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white leading-tight">{t.s4.title}</h2>
                  <p className="text-slate-400 text-base leading-relaxed mb-6">
                     {t.s4.desc}
                  </p>
                  <div className="p-3 bg-emerald-900/10 border border-emerald-500/20 rounded-xl">
                     <div className="flex justify-between items-center mb-1.5">
                        <span className="text-emerald-400 font-bold text-sm">{t.s4.badge}</span>
                        <span className="text-slate-500 text-[10px]">{t.s4.status}</span>
                     </div>
                     <div className="w-full bg-slate-800 rounded-full h-1.5">
                        <div className="bg-emerald-500 h-1.5 rounded-full w-[75%] shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                     </div>
                  </div>
               </div>

               <div className="order-1 lg:order-1">
                  <div className="relative h-[360px] bg-slate-900/50 rounded-3xl border border-slate-800 flex items-center justify-center overflow-hidden shadow-2xl p-6">
                     <div className="w-full h-full relative">
                        <div className="absolute left-0 bottom-0 w-full h-[1px] bg-slate-700"></div>
                        <div className="absolute left-0 bottom-0 w-[1px] h-full bg-slate-700"></div>
                        <div className="absolute -left-5 top-0 text-[9px] text-slate-500 -rotate-90 origin-right">{t.s4.graphY}</div>
                        <div className="absolute right-0 -bottom-4 text-[9px] text-slate-500">{t.s4.graphX}</div>
                        
                        <div className="absolute inset-0 top-[25%] bottom-[25%] bg-gradient-to-r from-emerald-500/5 to-emerald-500/10 border-y border-dashed border-emerald-500/20"></div>
                        <div className="absolute right-2 top-[50%] text-[9px] text-emerald-500/50 font-bold uppercase tracking-widest">{t.s4.zone}</div>

                        <svg className="absolute inset-0 w-full h-full overflow-visible">
                           <defs>
                              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                 <stop offset="0%" stopColor="#34d399" stopOpacity="0.5" />
                                 <stop offset="100%" stopColor="#10b981" stopOpacity="1" />
                              </linearGradient>
                           </defs>
                           <path 
                              d="M0,280 C40,280 70,230 110,200 S160,220 200,160 S260,100 320,80" 
                              fill="none" 
                              stroke="url(#lineGradient)" 
                              strokeWidth="3" 
                              strokeLinecap="round"
                              className="drop-shadow-[0_4px_10px_rgba(16,185,129,0.4)]"
                           />
                           <circle cx="110" cy="200" r="3" fill="#10b981" />
                           <circle cx="200" cy="160" r="3" fill="#10b981" />
                           <circle cx="320" cy="80" r="5" fill="#fff" stroke="#10b981" strokeWidth="2" className="animate-pulse" />
                        </svg>
                        
                        <div className="absolute top-[60px] right-[10px] bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg animate-bounce">
                           {t.s4.levelUp}
                        </div>
                     </div>
                  </div>
               </div>
            </section>

            {/* Step 5: Review */}
            <section ref={el => { stepRefs.current[4] = el }} className="scroll-mt-32 grid lg:grid-cols-2 gap-12 items-center min-h-[40vh] pb-12">
               <div className="order-2 lg:order-1 animate-fade-in-up">
                  <div className="text-orange-500 font-mono text-sm font-bold mb-3 flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span> {t.s5.step}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white leading-tight">{t.s5.title}</h2>
                  <p className="text-slate-400 text-base leading-relaxed mb-6">
                     {t.s5.desc}
                  </p>
                  <Button variant="glow" onClick={() => navigate('/register')} className="bg-orange-600 hover:bg-orange-500 shadow-orange-500/20 border-orange-400/30">
                     {t.s5.btn}
                  </Button>
               </div>

               <div className="order-1 lg:order-2">
                  <div className="relative h-[360px] bg-slate-900/50 rounded-3xl border border-slate-800 flex items-center justify-center overflow-hidden shadow-2xl p-6">
                     <div className="w-full h-full relative">
                        <div className="absolute left-0 bottom-0 w-full h-[1px] bg-slate-700"></div>
                        <div className="absolute left-0 bottom-0 w-[1px] h-full bg-slate-700"></div>
                        <div className="absolute -left-5 top-0 text-[9px] text-slate-500 -rotate-90 origin-right">{t.s5.graphY}</div>
                        <div className="absolute right-0 -bottom-4 text-[9px] text-slate-500">{t.s5.graphX}</div>

                        <svg className="absolute inset-0 w-full h-full overflow-visible">
                           <path 
                              d="M0,40 Q100,240 320,280" 
                              fill="none" 
                              stroke="#475569" 
                              strokeWidth="2" 
                              strokeDasharray="5,5" 
                           />
                           <path 
                              d="M0,40 Q80,180 140,200 L140,40 Q240,140 320,160" 
                              fill="none" 
                              stroke="#f97316" 
                              strokeWidth="3" 
                              className="drop-shadow-[0_0_10px_rgba(249,115,22,0.3)]"
                           />
                           <line x1="140" y1="200" x2="140" y2="40" stroke="#f97316" strokeWidth="2" strokeDasharray="4 2" className="animate-[dash_1s_linear_infinite]" />
                           <circle cx="140" cy="200" r="3" fill="#f97316" />
                           <circle cx="140" cy="40" r="3" fill="#f97316" />
                        </svg>
                        
                        <div className="absolute left-[120px] top-[80px] bg-slate-800 border border-orange-500/50 p-2 rounded-lg shadow-xl animate-bounce flex items-center gap-2">
                           <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                              <Bell className="w-2.5 h-2.5 text-white" />
                           </div>
                           <div>
                              <div className="text-[9px] text-orange-400 font-bold uppercase">{t.s5.alertTitle}</div>
                              <div className="text-[8px] text-slate-400">{t.s5.alertDesc}</div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </section>

          </div>
        </div>
      </div>

      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -20;
          }
        }
        @keyframes slideUp {
          from { transform: translateY(0); }
          to { transform: translateY(-50%); }
        }
      `}</style>
    </div>
  );
};

export default ProductTourPage;