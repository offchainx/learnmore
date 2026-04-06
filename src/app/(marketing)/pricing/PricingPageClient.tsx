"use client";

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/labeled-input'
import { ShineBorder } from '@/components/ui/shine-border'
import { cn } from '@/lib/utils'
import { Gift, Loader2, Send } from 'lucide-react'
import { useApp } from '@/providers'
import { prepareCheckoutAction } from '@/actions/billing/checkout'

type PlanKey = 'starter' | 'standard' | 'smart_plus' | 'premier'

type PlanCard = {
  key: PlanKey
  name: string
  desc: string
  btnText: string
  features: string[]
}

type NoticeLang = 'en' | 'zh' | 'ms'
type CheckoutNoticeTone = 'info' | 'error'

type CheckoutNotice = {
  tone: CheckoutNoticeTone
  title: string
  message: string
}

function buildReferralNotice(
  lang: NoticeLang,
  code: string | null,
  tone: CheckoutNoticeTone
): CheckoutNotice | null {
  if (!code) return null

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
        message: '你可以继续修改推荐码，然后重新选择方案。',
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
    ms: {
      INVALID_REFERRAL_CODE: {
        title: 'Pautan rujukan tidak sah',
        message: 'Kod rujukan dalam pautan ini tidak betul. Sila semak dan cuba lagi.',
      },
      REFERRAL_NOT_FOUND: {
        title: 'Kod rujukan tidak ditemui',
        message: 'Kami tidak dapat mencari kod rujukan ini. Sila minta pengirim untuk semak semula.',
      },
      PAYMENT_CANCELLED: {
        title: 'Pembayaran dibatalkan',
        message: 'Anda boleh semak kod rujukan dan cuba semula.',
      },
      REFERRAL_ALREADY_BOUND: {
        title: 'Kod rujukan sudah dipautkan',
        message: 'Akaun ini sudah memautkan kod rujukan lain.',
      },
      SELF_REFERRAL: {
        title: 'Rujukan diri sendiri tidak dibenarkan',
        message: 'Sila gunakan kod rujukan orang lain atau teruskan tanpa kod.',
      },
      BIND_FAILED: {
        title: 'Gagal memaut kod rujukan',
        message: 'Kod rujukan tidak dapat dipautkan sekarang. Sila cuba lagi nanti.',
      },
      PAYMENT_MODE_NOT_READY: {
        title: 'Kaedah bayaran belum sedia',
        message: 'Setakat ini hanya Stripe disokong. Kaedah lain akan menyusul.',
      },
      VOUCHER_ALREADY_USED: {
        title: 'Voucher sudah digunakan',
        message: 'Akaun ini telah menebus kod voucher ini.',
      },
      VOUCHER_EXPIRED: {
        title: 'Voucher telah tamat tempoh',
        message: 'Kod voucher ini sudah tamat tempoh.',
      },
      VOUCHER_EXHAUSTED: {
        title: 'Voucher telah habis',
        message: 'Kod voucher ini telah mencapai had penebusan.',
      },
      VOUCHER_NOT_STARTED: {
        title: 'Voucher belum aktif',
        message: 'Kod voucher ini belum mula aktif lagi.',
      },
      VOUCHER_NOT_READY: {
        title: 'Voucher belum sedia',
        message: 'Voucher ini belum dipautkan kepada Stripe coupon.',
      },
      INVALID_VOUCHER: {
        title: 'Voucher tidak sah',
        message: 'Kod voucher ini tidak wujud atau tidak lagi sah.',
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
        message: 'You can review the referral code and try again.',
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
        message: 'Only Stripe is available right now. Other methods are coming soon.',
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
  } as const

  const normalized = map[lang][code as keyof (typeof map)['zh']]
  if (!normalized) return null
  return {
    tone,
    title: normalized.title,
    message: normalized.message,
  }
}

const PricingPageClient: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isAnnual, setIsAnnual] = useState(false)
  const { lang, setLang } = useApp()
  const [loadingPlan, setLoadingPlan] = useState<PlanKey | null>(null)
  const [checkoutNotice, setCheckoutNotice] = useState<CheckoutNotice | null>(null)

  const referralCodeFromQuery = useMemo(
    () => searchParams.get('referralCode')?.trim().toUpperCase() || '',
    [searchParams]
  )
  const referralErrorFromQuery = useMemo(
    () => searchParams.get('referralError')?.trim().toUpperCase() || '',
    [searchParams]
  )
  const paymentStatusFromQuery = useMemo(
    () => searchParams.get('payment')?.trim().toLowerCase() || '',
    [searchParams]
  )
  const [referralInput, setReferralInput] = useState(referralCodeFromQuery)

  useEffect(() => {
    setReferralInput(referralCodeFromQuery)
  }, [referralCodeFromQuery])

  useEffect(() => {
    if (paymentStatusFromQuery === 'cancelled') {
      setCheckoutNotice({
        tone: 'info',
        title: lang === 'zh' ? '支付已取消' : 'Payment cancelled',
        message:
          lang === 'zh'
            ? '你可以继续修改推荐码，然后重新选择方案。'
            : 'You can review the referral code and try again.',
      })
      return
    }

    if (referralErrorFromQuery) {
      const notice = buildReferralNotice(
        lang,
        referralErrorFromQuery,
        'error'
      )
      if (notice) {
        setCheckoutNotice(notice)
        return
      }
    }

    setCheckoutNotice(null)
  }, [lang, paymentStatusFromQuery, referralErrorFromQuery])

  const normalizedReferralCode = referralInput.trim().toUpperCase()

  const toggleLang = () => {
    const nextLang = lang === 'en' ? 'zh' : 'en'
    setLang(nextLang)
  }

  const handleSubscribe = async (planName: string, planKey: PlanKey) => {
    if (planKey === 'starter') {
      router.push('/register')
      return
    }

    setLoadingPlan(planKey)
    const billingCycle = isAnnual ? 'annual' : 'monthly'

    try {
      const result = await prepareCheckoutAction({
        planKey,
        billingCycle,
        paymentMode: 'stripe',
        referralCode: normalizedReferralCode,
        voucherCode: '',
      })

      if (!result.ok || !result.checkoutUrl) {
        const notice = buildReferralNotice(
          lang,
          result.code.toUpperCase(),
          'error'
        )
        setCheckoutNotice(
          notice || {
            tone: 'error',
            title: lang === 'zh' ? '暂时无法继续支付' : 'Unable to continue checkout',
            message:
              result.message || (lang === 'zh' ? '请稍后重试。' : 'Please try again later.'),
          }
        )
        setLoadingPlan(null)
        return
      }

      window.location.assign(result.checkoutUrl)
    } catch (error) {
      console.error('[Pricing] prepare checkout failed', error)
      setCheckoutNotice({
        tone: 'error',
        title: lang === 'zh' ? '支付会话创建失败' : 'Checkout session failed',
        message:
          lang === 'zh'
            ? '暂时无法创建支付会话，请稍后重试。'
            : 'Unable to create a checkout session right now. Please try again later.',
      })
      setLoadingPlan(null)
    }
  }

  const copy = useMemo(() => {
    if (lang === 'zh') {
      return {
        badge: '定价与支付',
        title: '先确认你的推荐码，再选择方案',
        subtitle:
          '如果你通过推荐链接进入，这里会自动带入 referral code；你也可以手动修改后继续购买。',
        annual: '年付',
        monthly: '月付',
        save: '节省约 10%',
        referralTitle: '推荐码预填',
        referralDesc:
          '从 /r/[code] 进入时会自动填充。你可以在提交前检查或更换推荐码。',
        referralLabel: 'Referral Code',
        referralPlaceholder: '请输入或粘贴推荐码',
        referralHint: '该值会继续传给 checkout，并写入归因链路。',
        emptyReferralHint: '如果没有推荐码，也可以直接继续订阅。',
        primaryAction: '继续购买',
        starterAction: '去注册',
        loading: '处理中...',
        footer: '© 2025 LearnMore Edu. 保留所有权利。',
        plans: [
          {
            key: 'starter',
            name: '体验版 (Starter)',
            desc: '尝试核心功能，先开始学习。',
            btnText: '立即开始',
            features: [
              '基础练习（课本难度）',
              '仅参考答案',
              '社区浏览（仅读）',
              '社区数据贡献者',
            ],
          },
          {
            key: 'standard',
            name: '自学版 (Standard)',
            desc: '适合按照自己的节奏学习。',
            btnText: '免费试用 7 天',
            features: [
              '历年真题（实战题海）',
              '详细文字解析',
              '自动错题收录 + 互助论坛',
              '月度简报（家长）',
              '30 天学习记忆',
              '基础数据导出',
            ],
          },
          {
            key: 'smart_plus',
            name: '智学版 (Smart Plus)',
            desc: '核心推荐，AI 驱动效率。',
            btnText: '立即订阅',
            features: [
              '专项强化训练（AI 推荐）',
              '知识图谱关联导航',
              'AI 学习记忆无限',
              '艾宾浩斯遗忘曲线 + 归因诊断',
              '虚拟自习室',
              '全部历史数据导出',
            ],
          },
          {
            key: 'premier',
            name: '领航版 (Premier)',
            desc: '极致服务与家长协同。',
            btnText: '升级领航版',
            features: [
              '高阶挑战包 / 考前冲刺模拟题',
              '智能弱项击破（AI）',
              '精英俱乐部（高分圈）',
              '家长联合目标设定',
              '24/7 优先支持',
              '家长数据导出中心',
            ],
          },
        ] satisfies PlanCard[],
      }
    }

    return {
      badge: 'Pricing & Checkout',
      title: 'Confirm your referral code, then choose a plan',
      subtitle:
        'If you arrive via a referral link, the code is prefilled here. You can edit it before checkout.',
      annual: 'Annually',
      monthly: 'Monthly',
      save: 'Save about 10%',
      referralTitle: 'Referral code prefill',
      referralDesc:
        'Links from /r/[code] will auto-fill this field. You can review or replace it before continuing.',
      referralLabel: 'Referral Code',
      referralPlaceholder: 'Enter or paste a referral code',
      referralHint: 'This value is passed to checkout and logged for attribution.',
      emptyReferralHint: 'No referral code is required to continue.',
      primaryAction: 'Continue purchase',
      starterAction: 'Go sign up',
      loading: 'Processing...',
      footer: '© 2025 LearnMore Edu. All rights reserved.',
      plans: [
        {
          key: 'starter',
          name: 'Starter',
          desc: 'Try the essentials. Start learning fast.',
          btnText: 'Get Started',
          features: [
            'Basic Drills (Textbook Level)',
            'Answer Key Only',
            'Community Browse (Read-only)',
            'Community Verified Contributor',
          ],
        },
        {
          key: 'standard',
          name: 'Standard',
          desc: 'For self-learners who progress at their own pace.',
          btnText: 'Start 7-Day Free Trial',
          features: [
            'Past Year Papers (Real Exams)',
            'Step-by-Step Explanations',
            'Auto Error Book + Discussion Forum',
            'Monthly Parent Report',
            '30-Day Learning Memory',
            'Basic Data Export',
          ],
        },
        {
          key: 'smart_plus',
          name: 'Smart Plus',
          desc: 'The sweet spot. AI-powered efficiency for smarter learning.',
          btnText: 'Subscribe',
          features: [
            'Topic-Specific Training (AI Curated)',
            'Knowledge Graph Navigation',
            'AI Memory Unlimited — compounds over time',
            'Ebbinghaus Recall + Root Cause Analysis',
            'Virtual Study Room',
            'Full History Data Export',
          ],
        },
        {
          key: 'premier',
          name: 'Premier',
          desc: 'Full control & premium service for top learners.',
          btnText: 'Go Premier',
          features: [
            'Challenge Packs & Pre-Exam Drills',
            'Advanced Weakness Breaker (AI)',
            'Elite Circle (High-Achievers Club)',
            'Joint Goal Setting (Parent App)',
            '24/7 Priority Support',
            'Parent Export Portal',
          ],
        },
      ] satisfies PlanCard[],
    }
  }, [lang])

  const annualPriceLabel = isAnnual
    ? copy.save
    : copy.monthly

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-cyan-950/20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.12),transparent_34%)]" />
          <div className="relative flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
                {copy.badge}
              </span>
              <button
                type="button"
                onClick={toggleLang}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                {lang === 'zh' ? 'Switch to English' : '切换中文'}
              </button>
            </div>

            <div className="max-w-3xl space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                {copy.title}
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                {copy.subtitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="outline"
                className={cn(
                  'rounded-full border-white/10 bg-white/5 px-5 text-sm text-slate-100 hover:bg-white/10',
                  isAnnual && 'border-cyan-400/40 bg-cyan-400/10 text-cyan-100'
                )}
                onClick={() => setIsAnnual(true)}
              >
                {copy.annual}
              </Button>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  'rounded-full border-white/10 bg-white/5 px-5 text-sm text-slate-100 hover:bg-white/10',
                  !isAnnual && 'border-cyan-400/40 bg-cyan-400/10 text-cyan-100'
                )}
                onClick={() => setIsAnnual(false)}
              >
                {copy.monthly}
              </Button>
              <span className="text-sm text-slate-400">
                {isAnnual ? copy.save : copy.monthly}
              </span>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/20">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3">
                <Gift className="h-5 w-5 text-emerald-300" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-white">
                  {copy.referralTitle}
                </h2>
                <p className="text-sm leading-6 text-slate-300">
                  {copy.referralDesc}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {checkoutNotice ? (
                <div
                  className={cn(
                    'rounded-2xl border px-4 py-3 text-sm leading-6',
                    checkoutNotice.tone === 'error'
                      ? 'border-rose-400/30 bg-rose-400/10 text-rose-100'
                      : 'border-cyan-400/30 bg-cyan-400/10 text-cyan-100'
                  )}
                >
                  <div className="font-semibold">{checkoutNotice.title}</div>
                  <div className="mt-1 text-slate-200">{checkoutNotice.message}</div>
                </div>
              ) : null}
              <Input
                label={copy.referralLabel}
                value={referralInput}
                onChange={(event) => setReferralInput(event.target.value)}
                placeholder={copy.referralPlaceholder}
                autoComplete="off"
                spellCheck={false}
              />
              <div className="text-xs leading-6 text-slate-400">
                {normalizedReferralCode
                  ? copy.referralHint
                  : copy.emptyReferralHint}
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/20">
            <div className="space-y-2">
              <div className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-200">
                {lang === 'zh' ? '支付预览' : 'Checkout preview'}
              </div>
              <div className="text-2xl font-semibold text-white">
                {normalizedReferralCode || '—'}
              </div>
              <div className="text-sm leading-6 text-slate-300">
                {lang === 'zh'
                  ? '该值会在创建支付会话时继续透传到 checkout metadata。'
                  : 'This value will be forwarded into checkout metadata when creating the payment session.'}
              </div>
            </div>
            <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
              {lang === 'zh'
                ? '如果你通过分享链接进入，这里应该已经自动填好推荐码。'
                : 'If you opened this page from a referral link, the code should already be filled in here.'}
            </div>
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs leading-6 text-slate-400">
              {lang === 'zh'
                ? '调试提示：如果看到“推荐码不存在 / 已绑定 / 自推 / 格式错误”等状态，这一层会直接显示具体原因，方便你核对分享链路。'
                : 'Debug tip: if you see referral invalid / already bound / self-referral / malformed states, this panel shows the exact reason to help you trace the sharing flow.'}
            </div>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-4 lg:grid-cols-2">
          {copy.plans.map((plan) => {
            const isPopular = plan.key === 'smart_plus'
            const isLoading = loadingPlan === plan.key

            const card = (
              <div
                className={cn(
                  'flex h-full flex-col rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/20',
                  isPopular && 'border-cyan-400/40 bg-cyan-400/10'
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-white">
                      {plan.name}
                    </h3>
                    <p className="text-sm leading-6 text-slate-300">
                      {plan.desc}
                    </p>
                  </div>
                  {isPopular ? (
                    <span className="rounded-full border border-cyan-400/30 bg-cyan-400/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
                      {lang === 'zh' ? '最推荐' : 'Most Popular'}
                    </span>
                  ) : null}
                </div>

                <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-200">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-cyan-300" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-6">
                  <Button
                    type="button"
                    className={cn(
                      'w-full rounded-full px-4 py-3 text-sm font-semibold',
                      isPopular
                        ? 'bg-cyan-500 text-white hover:bg-cyan-400'
                        : 'bg-white text-slate-950 hover:bg-slate-200'
                    )}
                    onClick={() => handleSubscribe(plan.name, plan.key)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {copy.loading}
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        {plan.btnText}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )

            return isPopular ? (
              <ShineBorder
                key={plan.key}
                borderWidth={1.5}
                duration={8}
                glowOpacity={0.9}
                contentClassName="rounded-[28px]"
              >
                {card}
              </ShineBorder>
            ) : (
              <div key={plan.key}>{card}</div>
            )
          })}
        </section>

        <div className="flex justify-end">
          <div className="text-xs text-slate-500">{copy.footer}</div>
        </div>
      </main>
    </div>
  )
}

export default PricingPageClient
