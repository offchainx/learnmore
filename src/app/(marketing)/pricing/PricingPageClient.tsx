"use client";

import React, { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { ShineBorder } from '@/components/ui/shine-border';
import { cn } from '@/lib/utils';
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
  const referralCode = useMemo(
    () => searchParams.get('referralCode')?.trim().toUpperCase() || '',
    [searchParams]
  );

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
        referralCode,
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
            "家长联合目标设定",
            "24/7 优先支持",
            "家长数据导出中心"
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      {/* ... unchanged UI ... */}
    </div>
  )
}

export default PricingPageClient;
