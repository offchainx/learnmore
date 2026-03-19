"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { Check, X, Gift, Send, Loader2 } from 'lucide-react';
import { useApp } from '@/providers';
import { prepareCheckoutAction } from '@/actions/billing/checkout';

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
      ? <Check className="w-4 h-4 mx-auto text-emerald-600" />
      : <X className="w-4 h-4 mx-auto text-slate-300" />;
  }
  if (typeof value === 'string') {
    return <span className="text-slate-700">{value}</span>;
  }
  // Object variant: value + optional note / badge
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-slate-700">{value.value}</span>
      {value.note && (
        <span className="text-xs text-amber-700/80">{value.note}</span>
      )}
      {value.badge && (
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-xs text-emerald-700">
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
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const toggleLang = () => {
    const nextLang = lang === 'en' ? 'zh' : 'en';
    setLang(nextLang);
  };

  const handleSubscribe = async (
    planName: string,
    planKey: 'starter' | 'standard' | 'smart_plus' | 'premier'
  ) => {
    if (planKey === 'starter') {
      router.push('/register');
      return;
    }

    setLoadingPlan(planName);
    const billingCycle = isAnnual ? 'annual' : 'monthly';
    try {
      const result = await prepareCheckoutAction({
        planKey,
        billingCycle,
        paymentMode: 'stripe',
        referralCode: '',
        voucherCode: '',
      });

      if (!result.ok || !result.checkoutUrl) {
        alert(result.message || '暂时无法创建支付会话，请稍后重试。');
        setLoadingPlan(null);
        return;
      }

      window.location.assign(result.checkoutUrl);
    } catch (error) {
      console.error('[Pricing] prepare checkout failed', error);
      alert('暂时无法创建支付会话，请稍后重试。');
      setLoadingPlan(null);
    }
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
            "Adaptive Learning Navigation",
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
            "学习路径导航",
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
      key: 'starter' as const,
      monthlyPrice: 0,
      annualPrice: 0,
      color: "border-slate-200",
      btnVariant: "outline" as const,
    },
    {
      key: 'standard' as const,
      monthlyPrice: 60,
      annualPrice: 54, // 10% off
      color: "border-blue-200",
      btnVariant: "outline" as const,
    },
    {
      key: 'smart_plus' as const,
      monthlyPrice: 150,
      annualPrice: 135, // 10% off
      color: "border-violet-300 shadow-[0_18px_50px_rgba(99,102,241,0.14)]",
      btnVariant: "glow" as const,
      highlight: true,
    },
    {
      key: 'premier' as const,
      monthlyPrice: 260,
      annualPrice: 234, // 10% off
      color: "border-amber-300",
      btnVariant: "solid-gold" as const,
    }
  ];

  const plans = plansData.map((p, i) => ({
    ...p,
    ...currentT.plans[i],
    price: p.monthlyPrice === 0 ? 0 : (isAnnual ? p.annualPrice : p.monthlyPrice),
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
          scholar: isZh ? "文字解析 + 引导练习" : "Text + Guided Practice",
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
    <div className="min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#eef6ff_0%,#f8fafc_20%,#ffffff_58%,#f8fafc_100%)] font-sans text-slate-950 selection:bg-blue-200 selection:text-slate-950">
      <Navbar lang={lang === 'ms' ? 'en' : lang} onToggleLang={toggleLang} />

      <main className="pt-28 pb-20">

        {/* Header & Toggle */}
        <div className="mx-auto mb-16 max-w-6xl px-4 animate-fade-in-up">
           <div className="relative overflow-hidden rounded-[40px] border border-slate-200/70 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.28),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.24),transparent_32%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,41,59,0.95)_45%,rgba(37,99,235,0.72))] px-6 py-14 text-center text-white shadow-[0_28px_80px_rgba(15,23,42,0.22)] sm:px-10">
             <div className="absolute inset-x-0 top-0 h-px bg-white/20" />
             <div className="absolute -left-12 top-12 h-40 w-40 rounded-full bg-cyan-300/20 blur-3xl" />
             <div className="absolute -right-10 bottom-6 h-44 w-44 rounded-full bg-violet-300/20 blur-3xl" />
             <div className="relative">
               <div className="mx-auto inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100 backdrop-blur-md">
                 LearnMore Pricing
               </div>
               <h1 className="mt-5 text-4xl font-extrabold tracking-tight md:text-5xl">
                  {currentT.title}
               </h1>
               <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-200">
                  {currentT.subtitle}
               </p>

               <div className="mt-10 flex items-center justify-center gap-4">
                  <span className={`text-sm font-bold transition-colors ${!isAnnual ? 'text-white' : 'text-slate-400'}`}>{currentT.monthly}</span>
                  <button
                    onClick={() => setIsAnnual(!isAnnual)}
                    className="relative h-8 w-16 rounded-full border border-white/15 bg-white/10 p-1 transition-colors backdrop-blur-md"
                  >
                     <div className={`h-6 w-6 rounded-full bg-white shadow-lg shadow-slate-950/20 transition-transform duration-300 ${isAnnual ? 'translate-x-8' : 'translate-x-0'}`}></div>
                  </button>
                  <span className={`text-sm font-bold transition-colors ${isAnnual ? 'text-white' : 'text-slate-400'}`}>
                     {currentT.annually} <span className="ml-1 text-xs font-normal text-emerald-300">{currentT.save}</span>
                  </span>
               </div>
             </div>
           </div>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
              {plans.map((plan, idx) => (
                 <div
                   key={idx}
                   className={`relative flex flex-col rounded-[28px] border bg-white/88 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 group ${plan.color} ${plan.highlight ? 'z-10 scale-[1.01] shadow-[0_24px_80px_rgba(99,102,241,0.16)] xl:scale-105' : 'shadow-[0_18px_50px_rgba(148,163,184,0.12)] hover:shadow-[0_22px_60px_rgba(148,163,184,0.18)]'}`}
                 >
                    {plan.highlight && (
                       <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-1 text-xs font-bold text-white shadow-lg shadow-violet-500/30">
                          {currentT.mostPopular}
                       </div>
                    )}

                    <div className="mb-6">
                       <h3 className="mb-2 text-xl font-bold text-slate-950">{plan.name}</h3>
                       <p className="h-10 text-sm text-slate-600">{plan.desc}</p>
                    </div>

                    <div className="mb-8">
                       <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-slate-950">
                             {idx === 0
                               ? isZh ? "永久免费" : "Forever Free"
                               : plan.price === 0 ? 'RM0' : `RM${plan.price}`
                             }
                          </span>
                          {idx !== 0 && plan.price !== 0 && <span className="text-sm text-slate-500">{currentT.perMo}</span>}
                       </div>
                       {isAnnual && plan.price !== 0 && (
                          <div className="mt-1 text-xs text-emerald-600">{currentT.billed(plan.annualPrice * 12)}</div>
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
                                    ? 'mb-1 mt-2 text-xs italic text-slate-500'
                                    : `text-slate-700 ${i < 2 ? 'font-medium text-slate-950' : ''}`
                                }`}
                              >
                                {!isHeader && (
                                   <Check className={`mt-0.5 h-4 w-4 shrink-0 ${plan.highlight ? 'text-violet-600' : 'text-slate-400'}`} />
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
                          ${plan.btnVariant === 'outline' ? 'border border-slate-200 bg-slate-50 text-slate-950 hover:bg-slate-100' : ''}
                          ${plan.btnVariant === 'glow' ? 'border-none bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20 hover:from-violet-500 hover:to-indigo-500' : ''}
                          ${plan.btnVariant === 'solid-gold' ? 'border-none bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-orange-400' : ''}
                       `}
                      onClick={() => handleSubscribe(plan.name, plan.key)}
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
           <h2 className="mb-12 text-center text-2xl font-bold text-slate-950">{currentT.compareTitle}</h2>
           <div className="overflow-x-auto rounded-[32px] border border-slate-200 bg-white/90 shadow-[0_20px_60px_rgba(148,163,184,0.14)]">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80">
                       <th className="min-w-[200px] p-4 font-medium text-slate-500"></th>
                       {plans.map((p, i) => (
                          <th key={i} className={`p-4 text-center font-bold min-w-[120px] ${
                             i === 0 ? 'text-cyan-700' :
                             i === 1 ? 'text-blue-700' :
                             i === 2 ? 'text-violet-700' : 'text-amber-700'
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
                          <tr className="bg-slate-50/80">
                             <td colSpan={5} className="p-4">
                                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">{section.category}</div>
                                {section.categoryNote && (
                                   <div className="mt-0.5 text-xs text-slate-500">{section.categoryNote}</div>
                                )}
                             </td>
                          </tr>
                          {/* 功能行 */}
                          {section.features.map((row, rIdx) => (
                             <tr key={rIdx} className="border-b border-slate-100 transition-colors hover:bg-blue-50/50">
                                <td className="p-4 text-sm font-medium text-slate-900">{row.name}</td>
                                <td className="p-4 text-center text-sm text-slate-600">
                                   <CellRenderer value={row.free} />
                                </td>
                                <td className="p-4 text-center text-sm text-slate-600">
                                   <CellRenderer value={row.self} />
                                </td>
                                <td className="p-4 text-center text-sm font-medium text-slate-700">
                                   <CellRenderer value={row.scholar} />
                                </td>
                                <td className="p-4 text-center text-sm font-medium text-slate-700">
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
           <div className="relative rounded-3xl bg-gradient-to-r from-pink-400 via-rose-400 to-amber-300 p-1 shadow-[0_20px_60px_rgba(251,113,133,0.2)]">
              <div className="relative flex flex-col items-center gap-8 overflow-hidden rounded-[22px] bg-white/92 p-8 text-center md:flex-row md:p-12 md:text-left">
                 {/* Bg Glow */}
                 <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-pink-200/70 blur-[80px]"></div>

                 <div className="relative z-10 shrink-0 rounded-2xl bg-rose-50 p-4 ring-1 ring-rose-100">
                    <Gift className="h-12 w-12 text-pink-500" />
                 </div>

                 <div className="flex-1 relative z-10">
                    <h3 className="mb-2 text-2xl font-bold text-slate-950">{currentT.referralTitle}</h3>
                    <p className="mb-6 text-slate-600">
                       {currentT.referralDesc}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                       <input
                         type="email"
                         placeholder={currentT.referralPlaceholder}
                         className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/30"
                       />
                       <Button variant="glow" className="border-none bg-pink-600 shadow-pink-500/20 hover:bg-pink-500">
                          <Send className="mr-2 h-4 w-4" /> {currentT.referralBtn}
                       </Button>
                    </div>
                 </div>
              </div>
           </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-transparent py-10 text-center text-sm text-slate-500">
         <div className="max-w-7xl mx-auto px-4">
            <p>{currentT.footer}</p>
         </div>
      </footer>

    </div>
  );
};

export default PricingPage;
