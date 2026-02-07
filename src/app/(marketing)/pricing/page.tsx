"use client";

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { Check, X, Gift, Send, Loader2 } from 'lucide-react';
import { useApp } from '@/providers';
import { createCheckoutSession } from '@/actions/billing/stripe';
import { toast } from '@/components/ui/use-toast';

// ─── 比较表单元格类型 ─────────────────────────────────────────
// string: 直接文本
// boolean: ✅ / ✗
// object: 文本 + 可选小注释(amber) / 标签(green)
type CellValue =
  | string
  | boolean
  | { value: string; note?: string; badge?: string };

interface ComparisonRow {
  name: string;
  free: CellValue;
  self: CellValue;
  scholar: CellValue;
  ultimate: CellValue;
}

interface ComparisonSection {
  category: string;
  categoryNote?: string; // 类别标题下的引导说明文
  features: ComparisonRow[];
}

// ─── 单元格渲染组件 ──────────────────────────────────────────
function CellRenderer({ value }: { value: CellValue }) {
  if (typeof value === 'boolean') {
    return value
      ? <Check className="w-4 h-4 mx-auto text-green-500" />
      : <X className="w-4 h-4 mx-auto text-slate-600" />;
  }
  if (typeof value === 'string') {
    return <span className="text-slate-300">{value}</span>;
  }
  // Object variant: value + optional note / badge
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-slate-300">{value.value}</span>
      {value.note && (
        <span className="text-xs text-amber-400/70">{value.note}</span>
      )}
      {value.badge && (
        <span className="text-xs bg-green-500/15 text-green-400 px-1.5 py-0.5 rounded-full">
          {value.badge}
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
const PricingPage: React.FC = () => {
  const router = useRouter();
  const [isAnnual, setIsAnnual] = useState(false);
  const { lang, setLang } = useApp();
  const [, startTransition] = useTransition();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const toggleLang = () => {
    const nextLang = lang === 'en' ? 'zh' : 'en';
    setLang(nextLang);
  };

  const handleSubscribe = async (planName: string, priceId: string) => {
    if (!priceId) {
      router.push('/register');
      return;
    }

    setLoadingPlan(planName);
    startTransition(async () => {
      try {
        await createCheckoutSession(priceId, planName);
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Failed to start checkout. Please try again.",
          variant: "destructive"
        });
        setLoadingPlan(null);
      }
    });
  };

  const isZh = lang === 'zh';

  // ─── i18n 静态文案 ──────────────────────────────────────────
  const t = {
    en: {
      title: "Choose Your Plan",
      subtitle: "Customize your learning path. Get better results, effortlessly.",
      monthly: "Monthly",
      annually: "Annually",
      save: "(Save 10%)",
      billed: (amount: number) => `Billed RM${amount} yearly`,
      mostPopular: "MOST POPULAR",
      compareTitle: "Compare Features",
      aiCategoryNote: "AI personalization accuracy depends on learning memory duration",
      referralTitle: "Give 2 Weeks, Get 2 Weeks",
      referralDesc: "Invite a friend to LearnMore. They get a 2-week free extension, and so do you!",
      referralPlaceholder: "Enter friend's email",
      referralBtn: "Invite",
      footer: "© 2025 LearnMore Edu. All rights reserved.",
      perMo: "/mo",
      plans: [
        {
          name: "Starter",
          desc: "Try the essentials. Contribute & grow together.",
          btnText: "Get Started",
          features: [
            "Basic Drills (Textbook Level)",
            "Answer Key Only",
            "Community Browse (Read-only)",
            "Community Verified Contributor"
          ]
        },
        {
          name: "Standard",
          desc: "For self-learners who progress at their own pace.",
          btnText: "Start 7-Day Free Trial",
          features: [
            "Everything in Starter, plus:",
            "Past Year Papers (Real Exams)",
            "Step-by-Step Explanations",
            "Auto Error Book + Discussion Forum",
            "Monthly Parent Report",
            "30-Day Learning Memory",
            "Basic Data Export"
          ]
        },
        {
          name: "Smart Plus",
          desc: "The sweet spot. AI-powered efficiency for smarter learning.",
          btnText: "Subscribe",
          features: [
            "Everything in Standard, plus:",
            "Topic-Specific Training (AI Curated)",
            "Knowledge Graph Navigation",
            "AI Memory Unlimited — compounds over time",
            "Ebbinghaus Recall + Root Cause Analysis",
            "Virtual Study Room",
            "Full History Data Export"
          ]
        },
        {
          name: "Premier",
          desc: "Full control & premium service for top learners.",
          btnText: "Go Premier",
          features: [
            "Everything in Smart Plus, plus:",
            "Challenge Packs & Pre-Exam Drills",
            "Advanced Weakness Breaker (AI)",
            "Elite Circle (High-Achievers Club)",
            "Joint Goal Setting (Parent App)",
            "24/7 Priority Support",
            "Parent Export Portal"
          ]
        }
      ],
      categories: {
        content: "Content & Depth",
        ai: "AI & Algorithm",
        community: "Community",
        parent: "Parent & Support",
        data: "Data & Export"
      }
    },
    zh: {
      title: "选择你的方案",
      subtitle: "为你的学习方式量身定制，轻松取得进步。",
      monthly: "月付",
      annually: "年付",
      save: "(省 10%)",
      billed: (amount: number) => `按年扣费 RM${amount}`,
      mostPopular: "最受欢迎",
      compareTitle: "功能对比",
      aiCategoryNote: "AI 的个性化精度取决于学习记忆时长",
      referralTitle: "送出 2 周，获得 2 周",
      referralDesc: "邀请朋友加入 LearnMore。他们获得 2 周免费时长，您也一样！",
      referralPlaceholder: "输入朋友的邮箱",
      referralBtn: "发送邀请",
      footer: "© 2025 LearnMore Edu. 保留所有权利。",
      perMo: "/月",
      plans: [
        {
          name: "体验版 (Starter)",
          desc: "尝试核心功能。社区共建，一起成长。",
          btnText: "立即开始",
          features: [
            "基础练习（课本难度）",
            "仅参考答案",
            "社区浏览（仅读）",
            "社区数据贡献者"
          ]
        },
        {
          name: "自学版 (Standard)",
          desc: "按照自己的节奏自学，灵活自由。",
          btnText: "免费试用 7 天",
          features: [
            "包含体验版所有功能，另外还有：",
            "历年真题（实战题海）",
            "详细文字解析",
            "自动错题收录 + 互助论坛",
            "月度简报（家长）",
            "30 天学习记忆",
            "基础数据导出"
          ]
        },
        {
          name: "智学版 (Smart Plus)",
          desc: "核心推荐。AI 驱动效率，学习事半功倍。",
          btnText: "立即订阅",
          features: [
            "包含自学版所有功能，另外还有：",
            "专项强化训练（AI 推荐）",
            "知识图谱关联导航",
            "AI 学习记忆无限，效果持续累积",
            "艾宾浩斯遗忘曲线 + 归因诊断",
            "虚拟自习室",
            "全部历史数据导出"
          ]
        },
        {
          name: "领航版 (Premier)",
          desc: "极致服务与家长协同。适合追求成绩顶尖的学生。",
          btnText: "升级领航版",
          features: [
            "包含智学版所有功能，另外还有：",
            "高阶挑战包 / 考前冲刺模拟题",
            "智能弱项击破（AI）",
            "精英俱乐部（高分圈）",
            "共同目标设定（家长端）",
            "24/7 优先支持",
            "家长独立数据入口"
          ]
        }
      ],
      categories: {
        content: "内容与深度",
        ai: "AI 与算法",
        community: "社区",
        parent: "家长与支持",
        data: "数据与导出"
      }
    }
  };

  const currentT = t[lang as keyof typeof t] || t['en'];

  // ─── 定价数据 ──────────────────────────────────────────────
  // TODO: 价格占位 — 待定价确认后更新。Stripe Price ID 也需同步更新。
  const plansData = [
    {
      monthlyPrice: 0,
      annualPrice: 0,
      monthlyPriceId: "prod_TeMN7HTeRvreOX",
      annualPriceId: "prod_TeMNTQGeDCo27L",
      color: "border-cyan-400",
      btnVariant: "outline" as const,
    },
    {
      monthlyPrice: 60,
      annualPrice: 54, // 10% off
      monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_SELF_LEARNER_MONTHLY || "",
      annualPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_SELF_LEARNER_ANNUAL || "",
      color: "border-blue-500",
      btnVariant: "outline" as const,
    },
    {
      monthlyPrice: 150,
      annualPrice: 135, // 10% off
      monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_SCHOLAR_MONTHLY || "",
      annualPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_SCHOLAR_ANNUAL || "",
      color: "border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.15)]",
      btnVariant: "glow" as const,
      highlight: true,
    },
    {
      monthlyPrice: 260,
      annualPrice: 234, // 10% off
      monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ULTIMATE_MONTHLY || "",
      annualPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ULTIMATE_ANNUAL || "",
      color: "border-amber-500",
      btnVariant: "solid-gold" as const,
    }
  ];

  const plans = plansData.map((p, i) => ({
    ...p,
    ...currentT.plans[i],
    price: p.monthlyPrice === 0 ? 0 : (isAnnual ? p.annualPrice : p.monthlyPrice),
    priceId: isAnnual ? p.annualPriceId : p.monthlyPriceId
  }));

  // ─── 比较表数据 ──────────────────────────────────────────────
  // 5 个类别：内容、AI、社区、家长、数据
  // AI 类别带 categoryNote 引导文；学习记忆时长单元格带 note/badge 标注
  const comparisonData: ComparisonSection[] = [
    {
      category: currentT.categories.content,
      features: [
        {
          name: isZh ? "题库范围" : "Question Range",
          free: isZh ? "基础练习" : "Basic Drills",
          self: isZh ? "历年真题" : "Past Year Papers",
          scholar: isZh ? "专项强化训练" : "Topic Training",
          ultimate: isZh ? "高阶挑战包" : "Challenge Packs"
        },
        {
          name: isZh ? "解析深度" : "Solution Depth",
          free: isZh ? "仅参考答案" : "Answer Key Only",
          self: isZh ? "详细文字解析" : "Step-by-Step Text",
          scholar: isZh ? "文字解析 + 知识图谱" : "Text + Knowledge Graph",
          ultimate: isZh ? "优先新题解析" : "Priority New Solutions"
        }
      ]
    },
    {
      category: currentT.categories.ai,
      categoryNote: currentT.aiCategoryNote,
      features: [
        {
          name: isZh ? "学习记忆时长" : "Learning Memory",
          free: {
            value: isZh ? "7天(滚动)" : "7 Days (Rolling)",
            note: isZh ? "较旧记录会自动清除" : "Older records auto-cleared"
          },
          self: isZh ? "30天" : "30 Days",
          scholar: {
            value: isZh ? "无限" : "Unlimited",
            badge: isZh ? "AI效果最佳" : "Best AI Effect"
          },
          ultimate: isZh ? "无限" : "Unlimited"
        },
        {
          name: isZh ? "算法功能" : "Algorithm Features",
          free: "—",
          self: isZh ? "自动错题收录" : "Auto Error Collection",
          scholar: isZh ? "遗忘曲线 + 归因诊断" : "Ebbinghaus + Root Cause",
          ultimate: isZh ? "智能弱项击破" : "Weakness Breaker AI"
        },
        {
          name: isZh ? "自适应路径" : "Adaptive Path",
          free: false,
          self: false,
          scholar: true,
          ultimate: true
        }
      ]
    },
    {
      category: currentT.categories.community,
      features: [
        {
          name: isZh ? "社区访问" : "Community Access",
          free: isZh ? "仅浏览" : "Read-only",
          self: isZh ? "互助论坛" : "Discussion Forum",
          scholar: isZh ? "虚拟自习室" : "Virtual Study Room",
          ultimate: isZh ? "精英俱乐部" : "Elite Circle"
        }
      ]
    },
    {
      category: currentT.categories.parent,
      features: [
        {
          name: isZh ? "家长功能" : "Parent Feature",
          free: "—",
          self: isZh ? "月度简报" : "Monthly Report",
          scholar: isZh ? "实时App + 周报" : "Real-time App + Weekly",
          ultimate: isZh ? "共同目标设定" : "Joint Goal Setting"
        },
        {
          name: isZh ? "支持优先级" : "Support Priority",
          free: isZh ? "标准" : "Standard",
          self: isZh ? "标准" : "Standard",
          scholar: isZh ? "优先" : "Priority",
          ultimate: isZh ? "24/7 专属" : "24/7 Dedicated"
        }
      ]
    },
    {
      category: currentT.categories.data,
      features: [
        {
          name: isZh ? "数据保留时长" : "Data Retention",
          free: isZh ? "7天" : "7 Days",
          self: isZh ? "30天" : "30 Days",
          scholar: isZh ? "永久" : "Permanent",
          ultimate: isZh ? "永久" : "Permanent"
        },
        {
          name: isZh ? "数据导出" : "Data Export",
          free: false,
          self: isZh ? "最近30天报告" : "Last 30 Days Report",
          scholar: isZh ? "全部历史 + 错题集" : "Full History + Errors",
          ultimate: isZh ? "全部 + 家长入口" : "Full + Parent Portal"
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-blue-500/30 selection:text-blue-100 overflow-x-hidden">
      <Navbar lang={lang === 'ms' ? 'en' : lang} onToggleLang={toggleLang} />

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
                             {idx === 0
                               ? isZh ? "永久免费" : "Forever Free"
                               : plan.price === 0 ? 'RM0' : `RM${plan.price}`
                             }
                          </span>
                          {idx !== 0 && plan.price !== 0 && <span className="text-slate-500 text-sm">{currentT.perMo}</span>}
                       </div>
                       {isAnnual && plan.price !== 0 && (
                          <div className="text-xs text-green-400 mt-1">{currentT.billed(plan.annualPrice * 12)}</div>
                       )}
                    </div>

                    <div className="mb-8 flex-1">
                       <ul className="space-y-3">
                          {plan.features.map((feat, i) => {
                            // 检测是否是 "包含...功能，另外还有：" 这样的 header 行
                            const isHeader = (feat.includes('包含') && feat.includes('另外还有')) || feat.includes('Everything in');
                            // 检测是否是 "社区数据贡献者" 需要 tooltip
                            const isContributorBadge = feat === '社区数据贡献者';
                            const tooltipText = isContributorBadge ? '你的学习数据帮助我们改进题库质量' : undefined;

                            return (
                              <li
                                key={i}
                                className={`flex items-start gap-3 text-sm ${
                                  isHeader
                                    ? 'text-slate-400 italic mb-1 mt-2 text-xs'
                                    : `text-slate-300 ${i < 2 ? 'text-white' : ''}`
                                }`}
                              >
                                {!isHeader && (
                                   <Check className={`w-4 h-4 shrink-0 mt-0.5 ${plan.highlight ? 'text-purple-400' : 'text-slate-500'}`} />
                                )}
                                <span title={tooltipText || ''}>{feat}</span>
                              </li>
                            );
                          })}
                       </ul>
                    </div>

                    <Button
                       fullWidth
                       className={`
                          ${plan.btnVariant === 'outline' ? 'border-slate-700 hover:bg-slate-800 text-white bg-transparent border' : ''}
                          ${plan.btnVariant === 'glow' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/25 border-none' : ''}
                          ${plan.btnVariant === 'solid-gold' ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-lg shadow-amber-500/25 border-none' : ''}
                       `}
                       onClick={() => handleSubscribe(plan.name, plan.priceId)}
                       disabled={loadingPlan !== null}
                    >
                       {loadingPlan === plan.name ? (
                           <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                       ) : plan.btnText}
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
                          {/* 类别标题行 — 带可选引导说明文 */}
                          <tr className="bg-slate-900/30">
                             <td colSpan={5} className="p-4">
                                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">{section.category}</div>
                                {section.categoryNote && (
                                   <div className="text-xs text-slate-600 mt-0.5">{section.categoryNote}</div>
                                )}
                             </td>
                          </tr>
                          {/* 功能行 */}
                          {section.features.map((row, rIdx) => (
                             <tr key={rIdx} className="border-b border-slate-800/50 hover:bg-white/5 transition-colors">
                                <td className="p-4 text-sm text-slate-200">{row.name}</td>
                                <td className="p-4 text-center text-sm text-slate-400">
                                   <CellRenderer value={row.free} />
                                </td>
                                <td className="p-4 text-center text-sm text-slate-400">
                                   <CellRenderer value={row.self} />
                                </td>
                                <td className="p-4 text-center text-sm text-slate-200 font-medium">
                                   <CellRenderer value={row.scholar} />
                                </td>
                                <td className="p-4 text-center text-sm text-slate-200 font-medium">
                                   <CellRenderer value={row.ultimate} />
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

      {/* Footer */}
      <footer className="bg-[#020617] border-t border-slate-900 py-10 text-center text-slate-600 text-sm">
         <div className="max-w-7xl mx-auto px-4">
            <p>{currentT.footer}</p>
         </div>
      </footer>

    </div>
  );
};

export default PricingPage;
