"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { MarketingSimpleFooter } from '@/components/marketing/MarketingSimpleFooter';
import { resolveMarketingLocale } from '@/lib/marketing/site-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'
import { Check, X, Gift, Send, Loader2 } from 'lucide-react';
import { useApp } from '@/providers';
import { prepareCheckoutAction } from '@/actions/billing/checkout';
import { calculateVoucherDiscountedPrice } from '@/lib/vouchers/preview'
import { useVoucherCodeAvailability } from '@/lib/hooks/useVoucherCodeAvailability'

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

type CheckoutNoticeTone = 'info' | 'error';

type CheckoutNotice = {
  tone: CheckoutNoticeTone;
  title: string;
  message: string;
};

function buildCheckoutNotice(
  lang: 'en' | 'zh',
  code: string | null,
  tone: CheckoutNoticeTone
): CheckoutNotice | null {
  if (!code) return null;

  const map = {
    zh: {
      INVALID_REFERRAL_CODE: {
        title: '推荐链接无效',
        message: '这条分享链接里的推荐码格式不正确，请检查后再试。',
      },
      REFERRAL_NOT_FOUND: {
        title: '推荐码不存在',
        message: '这条分享链接对应的推荐码未找到，请联系分享者确认。',
      },
      PAYMENT_CANCELLED: {
        title: '支付已取消',
        message: '你可以继续检查推荐码或优惠券，然后重新选择方案。',
      },
      REFERRAL_ALREADY_BOUND: {
        title: '推荐码已绑定',
        message: '你已经绑定过其他推荐码，当前账号暂不支持修改。',
      },
      SELF_REFERRAL: {
        title: '不能绑定自己的推荐码',
        message: '请使用别人的推荐码，或者直接继续购买。',
      },
      BIND_FAILED: {
        title: '绑定失败',
        message: '推荐码绑定暂时失败，请稍后重试。',
      },
      PAYMENT_MODE_NOT_READY: {
        title: '支付方式未就绪',
        message: '当前仅支持 Stripe 支付，其他方式稍后开放。',
      },
      VOUCHER_ALREADY_USED: {
        title: '优惠码已使用',
        message: '当前账号已经使用过这个优惠码。',
      },
      VOUCHER_EXPIRED: {
        title: '优惠码已过期',
        message: '这张优惠码已过期，请更换后重试。',
      },
      VOUCHER_EXHAUSTED: {
        title: '优惠码已用完',
        message: '这张优惠码已经达到使用上限。',
      },
      VOUCHER_NOT_STARTED: {
        title: '优惠码未生效',
        message: '这张优惠码尚未到可用时间。',
      },
      VOUCHER_NOT_READY: {
        title: '优惠码暂不可用',
        message: '这张优惠码尚未配置好 Stripe 折扣，暂时不能使用。',
      },
      INVALID_VOUCHER: {
        title: '优惠码无效',
        message: '这张优惠码不存在或已失效。',
      },
    },
    en: {
      INVALID_REFERRAL_CODE: {
        title: 'Invalid referral link',
        message: 'The referral code in this link is malformed. Please check and try again.',
      },
      REFERRAL_NOT_FOUND: {
        title: 'Referral code not found',
        message: 'We could not find the referral code in this link. Please ask the sender to confirm it.',
      },
      PAYMENT_CANCELLED: {
        title: 'Payment cancelled',
        message: 'You can review the referral code or voucher and try again.',
      },
      REFERRAL_ALREADY_BOUND: {
        title: 'Referral already bound',
        message: 'This account has already bound another referral code.',
      },
      SELF_REFERRAL: {
        title: 'Self-referral is not allowed',
        message: 'Please use another person’s referral code or continue without one.',
      },
      BIND_FAILED: {
        title: 'Referral binding failed',
        message: 'The referral code could not be bound right now. Please retry later.',
      },
      PAYMENT_MODE_NOT_READY: {
        title: 'Payment method not ready',
        message: 'Only Stripe checkout is enabled right now.',
      },
      VOUCHER_ALREADY_USED: {
        title: 'Voucher already used',
        message: 'This account has already redeemed the voucher code.',
      },
      VOUCHER_EXPIRED: {
        title: 'Voucher expired',
        message: 'This voucher code has already expired.',
      },
      VOUCHER_EXHAUSTED: {
        title: 'Voucher exhausted',
        message: 'This voucher code has reached its redemption limit.',
      },
      VOUCHER_NOT_STARTED: {
        title: 'Voucher not active yet',
        message: 'This voucher code is not active yet.',
      },
      VOUCHER_NOT_READY: {
        title: 'Voucher not ready',
        message: 'This voucher is not linked to a Stripe coupon yet.',
      },
      INVALID_VOUCHER: {
        title: 'Invalid voucher',
        message: 'This voucher code does not exist or is no longer valid.',
      },
    },
  } as const;

  const normalized = map[lang][code as keyof (typeof map)['en']];
  if (!normalized) return null;

  return {
    tone,
    title: normalized.title,
    message: normalized.message,
  };
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
const PricingPageClient: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAnnual, setIsAnnual] = useState(false);
  const { lang, setLang } = useApp();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [voucherCode, setVoucherCode] = useState('')
  const [checkoutNotice, setCheckoutNotice] = useState<CheckoutNotice | null>(null);
  const voucherAvailability = useVoucherCodeAvailability(voucherCode)
  const isZh = lang === 'zh';
  const referralCodeFromQuery = useMemo(
    () => searchParams.get('referralCode')?.trim().toUpperCase() || '',
    [searchParams]
  );
  const referralErrorFromQuery = useMemo(
    () => searchParams.get('referralError')?.trim().toUpperCase() || '',
    [searchParams]
  );
  const paymentStatusFromQuery = useMemo(
    () => searchParams.get('payment')?.trim().toLowerCase() || '',
    [searchParams]
  );

  const toggleLang = () => {
    const nextLang = lang === 'en' ? 'zh' : 'en';
    setLang(nextLang);
  };

  useEffect(() => {
    if (paymentStatusFromQuery === 'cancelled') {
      setCheckoutNotice(buildCheckoutNotice(isZh ? 'zh' : 'en', 'PAYMENT_CANCELLED', 'info'));
      return;
    }

    if (referralErrorFromQuery) {
      const notice = buildCheckoutNotice(isZh ? 'zh' : 'en', referralErrorFromQuery, 'error');
      if (notice) {
        setCheckoutNotice(notice);
        return;
      }
    }

    setCheckoutNotice(null);
  }, [isZh, paymentStatusFromQuery, referralErrorFromQuery]);

  const handleSubscribe = async (
    planName: string,
    planKey: 'starter' | 'standard' | 'smart_plus' | 'premier'
  ) => {
    if (planKey === 'starter') {
      router.push('/register');
      return;
    }

    if (voucherCode.trim() && voucherAvailability.status === 'checking') {
      alert(isZh ? '优惠券正在验证中，请稍后再试。' : 'Your voucher is still being verified. Please wait.')
      return
    }

    if (voucherCode.trim() && voucherAvailability.status === 'unavailable') {
      alert(voucherAvailability.reason || (isZh ? '这个优惠券无效，请检查后重试。' : 'This voucher code is invalid.'))
      return
    }

    setLoadingPlan(planName);
    const billingCycle = isAnnual ? 'annual' : 'monthly';
    try {
      const result = await prepareCheckoutAction({
        planKey,
        billingCycle,
        paymentMode: 'stripe',
        referralCode: referralCodeFromQuery,
        voucherCode:
          voucherAvailability.status === 'available'
            ? voucherAvailability.normalizedVoucherCode
            : '',
      });

      if (!result.ok || !result.checkoutUrl) {
        const notice = buildCheckoutNotice(
          isZh ? 'zh' : 'en',
          result.code.toUpperCase(),
          'error'
        );
        setCheckoutNotice(
          notice || {
            tone: 'error',
            title: isZh ? '暂时无法继续支付' : 'Unable to continue checkout',
            message:
              result.message ||
              (isZh ? '暂时无法创建支付会话，请稍后重试。' : 'Unable to create a checkout session right now. Please try again later.'),
          }
        );
        setLoadingPlan(null);
        return;
      }

      window.location.assign(result.checkoutUrl);
    } catch (error) {
      console.error('[Pricing] prepare checkout failed', error);
      setCheckoutNotice({
        tone: 'error',
        title: isZh ? '支付会话创建失败' : 'Checkout session failed',
        message:
          isZh
            ? '暂时无法创建支付会话，请稍后重试。'
            : 'Unable to create a checkout session right now. Please try again later.',
      });
      setLoadingPlan(null);
    }
  };
  const activeVoucher = useMemo(() => {
    if (voucherAvailability.status !== 'available') {
      return null
    }

    if (
      voucherAvailability.discountType === null ||
      voucherAvailability.discountValue === null
    ) {
      return null
    }

    return {
      code: voucherAvailability.normalizedVoucherCode,
      discountType: voucherAvailability.discountType,
      discountValue: voucherAvailability.discountValue,
    }
  }, [voucherAvailability])

  const hasVoucherInput = voucherCode.trim().length > 0
  const isVoucherBlocked =
    hasVoucherInput &&
    (voucherAvailability.status === 'checking' || voucherAvailability.status === 'unavailable')

  const getDisplayedPlanPrice = (basePrice: number) => {
    if (!activeVoucher || basePrice <= 0) {
      return basePrice
    }

    return calculateVoucherDiscountedPrice(basePrice, {
      discountType: activeVoucher.discountType,
      discountValue: activeVoucher.discountValue,
    })
  }

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
      voucherTitle: "Apply Voucher",
      voucherDesc: "Enter a voucher code before checkout. Valid vouchers will update the displayed price instantly.",
      voucherPlaceholder: "Enter voucher code",
      voucherChecking: "Checking voucher...",
      voucherInvalid: "This voucher code is invalid. Please check and try again.",
      voucherApplied: (code: string) => `Voucher ${code} applied. Prices below have been updated.`,
      voucherClear: "Clear",
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
      voucherTitle: "应用优惠券",
      voucherDesc: "在结账前输入优惠券码。有效优惠券会立即更新下方价格。",
      voucherPlaceholder: "输入优惠券码",
      voucherChecking: "正在验证优惠券...",
      voucherInvalid: "这个优惠券无效，请检查后重试。",
      voucherApplied: (code: string) => `已应用优惠券 ${code}，下方价格已更新。`,
      voucherClear: "清空",
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
  const plansData = [
    {
      key: 'starter' as const,
      monthlyPrice: 0,
      annualPrice: 0,
      color: "border-cyan-400",
      btnVariant: "outline" as const,
    },
    {
      key: 'standard' as const,
      monthlyPrice: 60,
      annualPrice: 54, // 10% off
      color: "border-blue-500",
      btnVariant: "outline" as const,
    },
    {
      key: 'smart_plus' as const,
      monthlyPrice: 150,
      annualPrice: 135, // 10% off
      color: "border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.15)]",
      btnVariant: "glow" as const,
      highlight: true,
    },
    {
      key: 'premier' as const,
      monthlyPrice: 260,
      annualPrice: 234, // 10% off
      color: "border-amber-500",
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

           <div className="mt-10 rounded-3xl border border-slate-800 bg-[#0f111a]/80 p-5 text-left shadow-2xl shadow-black/20 backdrop-blur-sm">
              {checkoutNotice ? (
                <div
                  className={`mb-4 rounded-2xl border px-4 py-3 text-sm leading-6 ${
                    checkoutNotice.tone === 'error'
                      ? 'border-red-400/30 bg-red-400/10 text-red-100'
                      : 'border-cyan-400/30 bg-cyan-400/10 text-cyan-100'
                  }`}
                >
                  <div className="font-semibold">{checkoutNotice.title}</div>
                  <div className="mt-1 text-slate-200">{checkoutNotice.message}</div>
                </div>
              ) : null}

              {referralCodeFromQuery ? (
                <div className="mb-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm leading-6 text-emerald-100">
                  <div className="font-semibold">
                    {isZh ? '已检测到推荐码' : 'Referral code detected'}
                  </div>
                  <div className="mt-1">
                    <span className="font-mono tracking-wide">{referralCodeFromQuery}</span>
                    {' · '}
                    {isZh
                      ? '结账时会继续传入推荐归因链路。'
                      : 'It will be forwarded into the checkout attribution flow.'}
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                    {currentT.voucherTitle}
                  </p>
                  <p className="text-sm text-slate-400">
                    {currentT.voucherDesc}
                  </p>
                </div>
                <div className="flex w-full flex-col gap-3 md:w-[30rem] md:flex-row md:items-center">
                  <Input
                    value={voucherCode}
                    onChange={(event) => setVoucherCode(event.target.value.toUpperCase())}
                    placeholder={currentT.voucherPlaceholder}
                    spellCheck={false}
                    autoCapitalize="characters"
                    className={`h-11 border-slate-700 bg-slate-950/60 text-white placeholder:text-slate-500 ${
                      isVoucherBlocked ? 'border-red-400 focus-visible:ring-red-500' : ''
                    }`}
                  />
                  {hasVoucherInput ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="shrink-0 border-slate-700 bg-transparent text-white hover:bg-slate-900"
                      onClick={() => setVoucherCode('')}
                    >
                      {currentT.voucherClear}
                    </Button>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 min-h-6 text-sm">
                {voucherAvailability.status === 'checking' && hasVoucherInput ? (
                  <span className="text-slate-400">{currentT.voucherChecking}</span>
                ) : null}
                {voucherAvailability.status === 'unavailable' && hasVoucherInput ? (
                  <span className="font-medium text-red-400">
                    {voucherAvailability.reason || currentT.voucherInvalid}
                  </span>
                ) : null}
                {activeVoucher ? (
                  <span className="font-medium text-emerald-400">
                    {currentT.voucherApplied(activeVoucher.code)}
                  </span>
                ) : null}
              </div>
            </div>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 desktop:px-8 mb-24">
           <div className="grid grid-cols-1 md:grid-cols-2 laptop:grid-cols-4 gap-6 items-stretch">
              {plans.map((plan, idx) => (
                 <div
                   key={idx}
                   className={`relative flex flex-col p-6 rounded-2xl bg-[#0a0a0a]/50 backdrop-blur-sm border transition-all duration-300 hover:-translate-y-2 group ${plan.color} ${plan.highlight ? 'z-10 bg-[#0f111a] shadow-2xl scale-105 md:scale-100 laptop:scale-105' : 'border-opacity-30 hover:border-opacity-60'}`}
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
                               : plan.price === 0 ? 'RM0' : `RM${getDisplayedPlanPrice(plan.price)}`
                             }
                          </span>
                          {idx !== 0 && plan.price !== 0 && <span className="text-slate-500 text-sm">{currentT.perMo}</span>}
                       </div>
                       {isAnnual && plan.price !== 0 && (
                          <div className="text-xs text-green-400 mt-1">
                            {currentT.billed(getDisplayedPlanPrice(plan.price) * 12)}
                          </div>
                       )}
                       {activeVoucher && idx !== 0 && plan.price !== 0 && (
                          <div className="mt-1 text-xs text-slate-500 line-through">
                            RM{plan.price}
                          </div>
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
                      onClick={() => handleSubscribe(plan.name, plan.key)}
                       disabled={loadingPlan !== null || (plan.key !== 'starter' && isVoucherBlocked)}
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 desktop:px-8 mb-24">
           <h2 className="text-2xl font-bold text-center mb-12">{currentT.compareTitle}</h2>
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="border-b border-slate-800">
                       <th className="p-4 text-slate-400 font-medium min-w-[160px] md:min-w-[200px]"></th>
                       {plans.map((p, i) => (
                          <th key={i} className={`p-4 text-center font-bold min-w-[96px] md:min-w-[120px] ${
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
                         disabled
                         className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                       />
                       <Button variant="glow" disabled className="bg-pink-600 hover:bg-pink-500 shadow-pink-500/25 border-none">
                          <Send className="w-4 h-4 mr-2" /> {currentT.referralBtn}
                       </Button>
                    </div>
                    <p className="mt-3 text-xs text-slate-500">
                      {isZh
                        ? '推荐邀请入口当前未启用；正式推荐链路只认结账时的分享链接归因。'
                        : 'Referral invites are not enabled in this UI. The formal referral path uses share-link attribution at checkout only.'}
                    </p>
                 </div>
              </div>
           </div>
        </div>

      </main>

      <MarketingSimpleFooter locale={resolveMarketingLocale(lang)} />

    </div>
  );
};

export default PricingPageClient;
