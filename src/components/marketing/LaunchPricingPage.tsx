'use client'

import { Check, CircleAlert, Smartphone } from 'lucide-react'
import { Navbar } from '@/components/layout/navbar'
import { MarketingFullFooter } from '@/components/marketing/MarketingFullFooter'
import { useApp } from '@/providers'
import { resolveMarketingLocale } from '@/lib/marketing/site-shell'

const copy = {
  en: {
    eyebrow: 'LEARNBANK PRO',
    title: 'One clear plan for the mobile beta.',
    intro: 'Pricing is shown for product planning. Pro access will be purchased and managed inside the Learnbank mobile app when subscriptions are available.',
    monthly: 'Monthly',
    yearly: 'Yearly',
    perMonth: 'RM 99 / month',
    perYear: 'RM 990 / year',
    saving: 'Save 17% compared with monthly billing',
    appOnly: 'In-app subscription',
    features: ['Practice and review tools included in your beta build', 'Learning notes and progress features as they become available', 'Subscription management through Apple App Store or Google Play'],
    note: 'No payment is collected on this website. Availability, store pricing and supported features will be confirmed in the app before purchase.',
  },
  zh: {
    eyebrow: 'LEARNBANK PRO',
    title: '移动端内测先提供一个清晰的方案。',
    intro: '此处价格用于产品规划展示。待订阅功能开放后，Pro 权益将在 Learnbank 移动 App 内购买和管理。',
    monthly: '月订',
    yearly: '年订',
    perMonth: 'RM 99 / 月',
    perYear: 'RM 990 / 年',
    saving: '相比按月订阅可省 17%',
    appOnly: 'App 内订阅',
    features: ['内测版本中可用的练习与复盘工具', '按版本逐步开放的学习笔记与进度功能', '通过 Apple App Store 或 Google Play 管理订阅'],
    note: '本网站不会收取付款。实际可用性、商店价格和支持功能会在 App 内购买前明确展示。',
  },
}

export function LaunchPricingPage() {
  const { lang, setLang } = useApp()
  const locale = lang === 'zh' ? 'zh' : 'en'
  const t = copy[locale]

  return (
    <div className="marketing-shell min-h-screen bg-[#020617] font-sans text-white">
      <Navbar lang={locale} onToggleLang={() => setLang(locale === 'zh' ? 'en' : 'zh')} />
      <main className="mx-auto max-w-5xl px-4 pb-20 pt-32 sm:px-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-bold tracking-[0.2em] text-blue-300">
            <Smartphone className="h-4 w-4" /> {t.eyebrow}
          </div>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold sm:text-5xl">{t.title}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-400">{t.intro}</p>
        </div>

        <section className="mx-auto mt-12 grid max-w-3xl gap-5 sm:grid-cols-2">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-7">
            <p className="text-sm font-medium text-slate-400">{t.monthly}</p>
            <p className="mt-4 text-3xl font-bold">{t.perMonth}</p>
          </div>
          <div className="relative rounded-3xl border border-blue-400/60 bg-blue-500/10 p-7 shadow-[0_0_40px_rgba(59,130,246,0.12)]">
            <span className="absolute -top-3 right-5 rounded-full bg-blue-500 px-3 py-1 text-xs font-bold text-white">{t.saving}</span>
            <p className="text-sm font-medium text-blue-200">{t.yearly}</p>
            <p className="mt-4 text-3xl font-bold">{t.perYear}</p>
          </div>
        </section>

        <section className="mx-auto mt-5 max-w-3xl rounded-3xl border border-slate-800 bg-slate-950 p-7">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-300">{t.appOnly}</p>
          <ul className="mt-5 space-y-3">
            {t.features.map((feature) => (
              <li key={feature} className="flex gap-3 text-slate-300"><Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />{feature}</li>
            ))}
          </ul>
          <p className="mt-6 flex gap-2 rounded-2xl bg-amber-400/10 p-4 text-sm leading-relaxed text-amber-100"><CircleAlert className="h-5 w-5 shrink-0" />{t.note}</p>
        </section>
      </main>
      <MarketingFullFooter locale={resolveMarketingLocale(lang)} />
    </div>
  )
}
