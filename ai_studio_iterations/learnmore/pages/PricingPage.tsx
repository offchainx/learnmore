import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/Button';
import { Check, X, Gift, Send } from 'lucide-react';

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isAnnual, setIsAnnual] = useState(false);
  const [lang, setLang] = useState<'en' | 'zh'>('en'); 

  const toggleLang = () => setLang(prev => prev === 'en' ? 'zh' : 'en');

  const t = {
    en: {
      title: "Choose Your Plan",
      subtitle: "Unlock your full potential with an AI tutor that adapts to your unique learning style.",
      monthly: "Monthly",
      annually: "Annually",
      save: "(Save 10%)",
      billed: (amount: number) => `Billed RM${amount} yearly`,
      mostPopular: "MOST POPULAR",
      compareTitle: "Compare Features",
      referralTitle: "Give 2 Weeks, Get 2 Weeks",
      referralDesc: "Invite a friend to LearnMore Scholar. They get a 2-week free extension, and so do you!",
      referralPlaceholder: "Enter friend's email",
      referralBtn: "Invite",
      footer: "© 2025 LearnMore Edu. All rights reserved.",
      perMo: "/mo",
      plans: [
        {
          name: "Free",
          desc: "Essential for trying out.",
          btnText: "Get Started",
          features: ["Basic Questions", "SD Quality Videos", "5 AI Chats / day", "Standard Support", "Community Access"]
        },
        {
          name: "Self-Learner",
          desc: "For disciplined self-study.",
          btnText: "Start Trial",
          features: ["Everything in Free", "HD Quality Videos", "Full Question Bank access", "20 AI Chats / day", "Auto-Mistake Book"]
        },
        {
          name: "Scholar",
          desc: "The complete AI Tutor experience.",
          btnText: "Start Free Trial",
          features: ["Everything in Self-Learner", "Knowledge Graph Navigation", "100 AI Chats / day", "Smart Mistake Push", "Parent App Access"]
        },
        {
          name: "Ultimate",
          desc: "For top achievers & full monitoring.",
          btnText: "Go Ultimate",
          features: ["Everything in Scholar", "4K Offline Videos", "Olympiad Questions", "Unlimited AI Chats", "Real-time Parent Alerts", "Priority Support"]
        }
      ],
      categories: {
        content: "Content Library",
        ai: "AI Tools",
        parent: "Parenting & Support"
      },
      rows: {
        videoQuality: "Video Quality",
        questionBank: "Question Bank",
        knowledgeGraph: "Knowledge Graph",
        pastPapers: "Past Papers",
        aiChats: "AI Tutor Chats",
        essayGrading: "Essay Grading",
        adaptivePath: "Adaptive Path",
        parentApp: "Parent App",
        weeklyReports: "Weekly Reports",
        realTimeAlerts: "Real-time Alerts",
        support: "Support Priority"
      },
      values: {
        sd: "SD",
        hd: "HD",
        4: "4K",
        basic: "Basic",
        full: "Full",
        fullOlym: "Full + Olympiad",
        unlimited: "Unlimited",
        standard: "Standard",
        priority: "Priority",
        dedicated: "24/7 Dedicated",
        chat5: "5/day",
        chat20: "20/day",
        chat100: "100/day"
      }
    },
    zh: {
      title: "选择您的方案",
      subtitle: "解锁您的全部潜能，拥有适应您独特学习风格的 AI 导师。",
      monthly: "月付",
      annually: "年付",
      save: "(省 10%)",
      billed: (amount: number) => `按年扣费 RM${amount}`,
      mostPopular: "最受欢迎",
      compareTitle: "功能对比",
      referralTitle: "送出 2 周，获得 2 周",
      referralDesc: "邀请朋友加入 LearnMore Scholar。他们获得 2 周免费时长，您也一样！",
      referralPlaceholder: "输入朋友的邮箱",
      referralBtn: "发送邀请",
      footer: "© 2025 LearnMore Edu. 保留所有权利。",
      perMo: "/月",
      plans: [
        {
          name: "免费版",
          desc: "体验核心功能。",
          btnText: "立即开始",
          features: ["基础题目", "标清视频", "每天 5 次 AI 对话", "标准支持", "社区访问"]
        },
        {
          name: "自学者",
          desc: "适合自律的自学者。",
          btnText: "开始试用",
          features: ["包含免费版所有功能", "高清视频", "全题库访问", "每天 20 次 AI 对话", "自动错题本"]
        },
        {
          name: "学者版",
          desc: "完整的 AI 导师体验。",
          btnText: "免费试用",
          features: ["包含自学者版所有功能", "知识图谱导航", "每天 100 次 AI 对话", "智能错题推送", "家长端访问"]
        },
        {
          name: "终极版",
          desc: "适合顶尖学生 & 全程通过。",
          btnText: "升级终极版",
          features: ["包含学者版所有功能", "4K 离线视频", "奥数/竞赛题库", "无限次 AI 对话", "实时家长提醒", "优先支持"]
        }
      ],
      categories: {
        content: "内容库",
        ai: "AI 工具",
        parent: "家长与支持"
      },
      rows: {
        videoQuality: "视频画质",
        questionBank: "题库",
        knowledgeGraph: "知识图谱",
        pastPapers: "历年真题",
        aiChats: "AI 导师对话",
        essayGrading: "作文批改",
        adaptivePath: "自适应路径",
        parentApp: "家长 App",
        weeklyReports: "周报",
        realTimeAlerts: "实时提醒",
        support: "支持优先级"
      },
      values: {
        sd: "标清",
        hd: "高清",
        4: "4K",
        basic: "基础",
        full: "完整",
        fullOlym: "完整 + 竞赛",
        unlimited: "无限",
        standard: "标准",
        priority: "优先",
        dedicated: "24/7 专属",
        chat5: "5次/天",
        chat20: "20次/天",
        chat100: "100次/天"
      }
    }
  };

  const currentT = t[lang];

  // Pricing Data Structure
  const plansData = [
    {
      monthlyPrice: 0,
      annualPrice: 0,
      color: "border-cyan-400",
      btnVariant: "outline" as const,
    },
    {
      monthlyPrice: 60,
      annualPrice: 54, // 10% off
      color: "border-blue-500",
      btnVariant: "outline" as const,
    },
    {
      monthlyPrice: 150,
      annualPrice: 135,
      color: "border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.15)]",
      btnVariant: "glow" as const,
      highlight: true,
    },
    {
      monthlyPrice: 260,
      annualPrice: 234,
      color: "border-amber-500",
      btnVariant: "solid-gold" as const,
    }
  ];

  // Merge translation with data
  const plans = plansData.map((p, i) => ({
    ...p,
    ...currentT.plans[i],
    price: p.monthlyPrice === 0 ? 0 : (isAnnual ? p.annualPrice : p.monthlyPrice)
  }));

  const comparisonData = [
    { category: currentT.categories.content, features: [
        { name: currentT.rows.videoQuality, free: currentT.values.sd, self: currentT.values.hd, scholar: currentT.values.hd, ultimate: currentT.values[4] },
        { name: currentT.rows.questionBank, free: currentT.values.basic, self: currentT.values.full, scholar: currentT.values.full, ultimate: currentT.values.fullOlym },
        { name: currentT.rows.knowledgeGraph, free: false, self: false, scholar: true, ultimate: true },
        { name: currentT.rows.pastPapers, free: false, self: true, scholar: true, ultimate: true },
      ]
    },
    { category: currentT.categories.ai, features: [
        { name: currentT.rows.aiChats, free: currentT.values.chat5, self: currentT.values.chat20, scholar: currentT.values.chat100, ultimate: currentT.values.unlimited },
        { name: currentT.rows.essayGrading, free: false, self: false, scholar: true, ultimate: true },
        { name: currentT.rows.adaptivePath, free: false, self: true, scholar: true, ultimate: true },
      ]
    },
    { category: currentT.categories.parent, features: [
        { name: currentT.rows.parentApp, free: false, self: false, scholar: true, ultimate: true },
        { name: currentT.rows.weeklyReports, free: false, self: true, scholar: true, ultimate: true },
        { name: currentT.rows.realTimeAlerts, free: false, self: false, scholar: false, ultimate: true },
        { name: currentT.rows.support, free: currentT.values.standard, self: currentT.values.standard, scholar: currentT.values.priority, ultimate: currentT.values.dedicated },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-blue-500/30 selection:text-blue-100 overflow-x-hidden">
      <Navbar lang={lang} onToggleLang={toggleLang} />

      <main className="pt-32 pb-20">
        
        {/* Header & Toggle */}
        <div className="text-center max-w-4xl mx-auto px-4 mb-16 animate-fade-in-up">
           <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
              {currentT.title}
           </h1>
           <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">
              {currentT.subtitle}
           </p>

           <div className="flex items-center justify-center gap-4">
              <span className={`text-sm font-bold transition-colors ${!isAnnual ? 'text-white' : 'text-slate-500'}`}>{currentT.monthly}</span>
              <button 
                onClick={() => setIsAnnual(!isAnnual)}
                className="w-16 h-8 bg-slate-800 rounded-full p-1 relative transition-colors border border-slate-700"
              >
                 <div className={`w-6 h-6 bg-blue-500 rounded-full shadow-lg transition-transform duration-300 ${isAnnual ? 'translate-x-8' : 'translate-x-0'}`}></div>
              </button>
              <span className={`text-sm font-bold transition-colors ${isAnnual ? 'text-white' : 'text-slate-500'}`}>
                 {currentT.annually} <span className="text-xs text-green-400 ml-1 font-normal">{currentT.save}</span>
              </span>
           </div>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
              {plans.map((plan, idx) => (
                 <div 
                   key={idx} 
                   className={`relative flex flex-col p-6 rounded-2xl bg-[#0a0a0a]/50 backdrop-blur-sm border transition-all duration-300 hover:-translate-y-2 group ${plan.color} ${plan.highlight ? 'z-10 bg-[#0f111a] shadow-2xl scale-105 md:scale-100 xl:scale-105' : 'border-opacity-30 hover:border-opacity-60'}`}
                 >
                    {plan.highlight && (
                       <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg shadow-purple-900/40 whitespace-nowrap">
                          {currentT.mostPopular}
                       </div>
                    )}
                    
                    <div className="mb-6">
                       <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                       <p className="text-slate-400 text-sm h-10">{plan.desc}</p>
                    </div>

                    <div className="mb-8">
                       <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-white">
                             {plan.price === 0 ? 'RM0' : `RM${plan.price}`}
                          </span>
                          {plan.price !== 0 && <span className="text-slate-500 text-sm">{currentT.perMo}</span>}
                       </div>
                       {isAnnual && plan.price !== 0 && (
                          <div className="text-xs text-green-400 mt-1">{currentT.billed(plan.annualPrice * 12)}</div>
                       )}
                    </div>

                    <div className="mb-8 flex-1">
                       <ul className="space-y-3">
                          {plan.features.map((feat, i) => (
                             <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                                <Check className={`w-4 h-4 shrink-0 mt-0.5 ${plan.highlight ? 'text-purple-400' : 'text-slate-500'}`} />
                                <span className={i < 2 ? 'text-white' : ''}>{feat}</span>
                             </li>
                          ))}
                       </ul>
                    </div>

                    <Button 
                       fullWidth 
                       className={`
                          ${plan.btnVariant === 'outline' ? 'border-slate-700 hover:bg-slate-800 text-white bg-transparent border' : ''}
                          ${plan.btnVariant === 'glow' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/25 border-none' : ''}
                          ${plan.btnVariant === 'solid-gold' ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-lg shadow-amber-500/25 border-none' : ''}
                       `}
                       onClick={() => navigate('/register')}
                    >
                       {plan.btnText}
                    </Button>
                 </div>
              ))}
           </div>
        </div>

        {/* Feature Comparison */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
           <h2 className="text-2xl font-bold text-center mb-12">{currentT.compareTitle}</h2>
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="border-b border-slate-800">
                       <th className="p-4 text-slate-400 font-medium min-w-[200px]"></th>
                       {plans.map((p, i) => (
                          <th key={i} className={`p-4 text-center font-bold min-w-[120px] ${
                             i === 0 ? 'text-cyan-400' : 
                             i === 1 ? 'text-blue-500' : 
                             i === 2 ? 'text-purple-500' : 'text-amber-500'
                          }`}>
                             {p.name}
                          </th>
                       ))}
                    </tr>
                 </thead>
                 <tbody>
                    {comparisonData.map((section, sIdx) => (
                       <React.Fragment key={sIdx}>
                          <tr className="bg-slate-900/30">
                             <td colSpan={5} className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">{section.category}</td>
                          </tr>
                          {section.features.map((row, rIdx) => (
                             <tr key={rIdx} className="border-b border-slate-800/50 hover:bg-white/5 transition-colors">
                                <td className="p-4 text-sm text-slate-200">{row.name}</td>
                                <td className="p-4 text-center text-sm text-slate-400">
                                   {typeof row.free === 'boolean' ? (row.free ? <Check className="w-4 h-4 mx-auto text-green-500" /> : <X className="w-4 h-4 mx-auto text-slate-600" />) : row.free}
                                </td>
                                <td className="p-4 text-center text-sm text-slate-400">
                                   {typeof row.self === 'boolean' ? (row.self ? <Check className="w-4 h-4 mx-auto text-green-500" /> : <X className="w-4 h-4 mx-auto text-slate-600" />) : row.self}
                                </td>
                                <td className="p-4 text-center text-sm text-slate-200 font-medium">
                                   {typeof row.scholar === 'boolean' ? (row.scholar ? <Check className="w-4 h-4 mx-auto text-green-500" /> : <X className="w-4 h-4 mx-auto text-slate-600" />) : row.scholar}
                                </td>
                                <td className="p-4 text-center text-sm text-slate-200 font-medium">
                                   {typeof row.ultimate === 'boolean' ? (row.ultimate ? <Check className="w-4 h-4 mx-auto text-green-500" /> : <X className="w-4 h-4 mx-auto text-slate-600" />) : row.ultimate}
                                </td>
                             </tr>
                          ))}
                       </React.Fragment>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

        {/* Referral Section */}
        <div className="max-w-4xl mx-auto px-4">
           <div className="relative rounded-3xl p-1 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500">
              <div className="bg-[#0f111a] rounded-[22px] p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 text-center md:text-left relative overflow-hidden">
                 {/* Bg Glow */}
                 <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/20 rounded-full blur-[80px]"></div>
                 
                 <div className="bg-slate-800 p-4 rounded-2xl shrink-0 relative z-10">
                    <Gift className="w-12 h-12 text-pink-500" />
                 </div>
                 
                 <div className="flex-1 relative z-10">
                    <h3 className="text-2xl font-bold text-white mb-2">{currentT.referralTitle}</h3>
                    <p className="text-slate-400 mb-6">
                       {currentT.referralDesc}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                       <input 
                         type="email" 
                         placeholder={currentT.referralPlaceholder}
                         className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                       />
                       <Button variant="glow" className="bg-pink-600 hover:bg-pink-500 shadow-pink-500/25 border-none">
                          <Send className="w-4 h-4 mr-2" /> {currentT.referralBtn}
                       </Button>
                    </div>
                 </div>
              </div>
           </div>
        </div>

      </main>

      {/* Footer (Simplified Version) */}
      <footer className="bg-[#020617] border-t border-slate-900 py-10 text-center text-slate-600 text-sm">
         <div className="max-w-7xl mx-auto px-4">
            <p>{currentT.footer}</p>
         </div>
      </footer>

    </div>
  );
};

export default PricingPage;