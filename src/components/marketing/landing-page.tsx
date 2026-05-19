'use client'

import React, { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import {
  BookOpen,
  Brain,
  CircleCheck,
  Play,
  BarChart2,
  Target,
  Zap,
} from 'lucide-react'
import { useApp } from '@/providers'
import type { PlatformStats } from '@/actions/marketing/campaign'
import { createClient as createSupabaseClient } from '@/lib/supabase/client'
import { resolveMarketingLocale } from '@/lib/marketing/site-shell'
import { emitClientPerfEvent } from '@/lib/observability/perf'

type LandingCopy = Record<string, any>

// Local translations for Landing Page content
const localTranslations = {
  en: {
    hero: {
      badge: 'New Curriculum Updated for 2025',
      headline: 'More Than Just Practice.\nYour Personal AI Tutor.',
      subheadline:
        'Adaptive AI learning that turns every minute into progress. Stop guessing, start mastering.',
      ctaPrimary: 'Get Free Diagnosis Report',
      ctaSecondary: 'Watch Demo',
      stat1: 'Active Students',
      stat2: 'Questions Solved',
    },
    painPoints: {
      title: 'Why Traditional Learning Fails',
      subtitle: 'We solved the problems that hold students back.',
      card1Title: 'Stuck on Scores?',
      card1Desc:
        'Blindly practicing without knowing WHY you got it wrong. Our AI attributes errors to specific concept gaps.',
      card2Title: 'Tutors too Expensive?',
      card2Desc:
        'Private tutors cost $50/hr. LearnMore provides 24/7 distinct guidance for a fraction of the price.',
      card3Title: 'Lost in Textbooks?',
      card3Desc:
        'Textbooks are linear. Knowledge is interconnected. We give you a personalized GPS for learning.',
    },
    features: {
      f1Title: 'Adaptive Learning Navigation',
      f1Desc:
        'Visualize the connection between concepts. If you fail a quadratic equation, we might trace it back to basic factorization weakness.',
      f1Tag: 'Map Your Mind',
      f1List: ['Visual dependencies', 'Prerequisite mapping', 'Gap analysis'],

      f2Title: 'AI Diagnostic Report',
      f2Desc:
        'Get a comprehensive radar chart comparing your skills against the grade average. Know exactly where to focus before the exam.',
      f2Tag: 'Data Driven',
      f2Button: 'View Sample Report',

      f3Title: 'Parent Dashboard',
      f3Desc:
        'Stay in the loop without hovering. Receive weekly progress notifications and celebrate milestones together.',
      f3Tag: 'Transparency',
      f3Trusted: 'Trusted by 15k+ parents',
    },
    comparison: {
      title: 'The Smarter Choice',
      col1: 'Traditional Cram School',
      col2: 'LearnMore AI Pro',
      row1: 'Feedback Speed',
      row1bad: 'Days later (Laggy)',
      row1good: 'Instant (Real-time)',
      row2: 'Learning Path',
      row2bad: 'One size fits all (Boring)',
      row2good: 'Adaptive (Gamified)',
      row3: 'Availability',
      row3bad: 'Fixed Schedule (Rigid)',
      row3good: '24/7 Anytime (Flexible)',
      row4: 'Cost Effectiveness',
      row4bad: '$$$ Expensive',
      row4good: '$ Affordable',
    },
    testimonials: {
      title: 'What Students Say',
      t1: "The analysis report helped me realize I wasn't bad at Math, I just missed one concept in Grade 7.",
      t1Author: 'Michael Z.',
      t1Role: 'Grade 9 • Improved +25 points',
      t2: 'I used to hate Physics formulas. The guided learning path helped me understand how they actually connect.',
      t2Author: 'Sarah L.',
      t2Role: 'Grade 8 • Top of Class',
      t3: 'My parents finally stopped nagging me because the app sends them updates automatically!',
      t3Author: 'Jason K.',
      t3Role: 'Grade 9 • Happy Student',
    },
    cta: {
      title: 'Ready to Boost Your Grades?',
      btn: 'Start Your Journey',
    },
    newsletter: {
      title: 'Stay Updated with Learning Tips',
      desc: 'Get weekly insights, study strategies, and product updates delivered to your inbox.',
      placeholder: 'Enter your email',
      btn: 'Subscribe',
      note: 'We respect your privacy. Unsubscribe anytime.',
    },
    footer: {
      product: 'Product',
      resources: 'Resources',
      about: 'About',
      legal: 'Legal',
      contact: 'Contact Us',
      rights: '© 2026 LearnMore Edu. All rights reserved.',
      features: 'Features',
      pricing: 'Pricing',
      stories: 'Success Stories',
      blog: 'Blog / Newsroom',
      guides: 'Study Guides',
      care: 'Student Care',
    },
  },
  zh: {
    hero: {
      badge: '2025 新课标已更新',
      headline: '不仅仅是刷题，\n更是你的 AI 私人导师。',
      subheadline:
        '基于 AI 的自适应学习，让每一分钟的学习都转化为实实在在的进步。',
      ctaPrimary: '获取免费诊断报告',
      ctaSecondary: '观看演示',
      stat1: '活跃学员',
      stat2: '累计刷题',
    },
    painPoints: {
      title: '为什么努力了成绩没提高？',
      subtitle: '我们解决了阻碍学生进步的核心问题。',
      card1Title: '分数停滞不前？',
      card1Desc:
        '盲目刷题却不知道错在哪里。AI 精准归因，帮你找到薄弱的底层知识点。',
      card2Title: '私教太贵？',
      card2Desc:
        '名师私教一小时几百元。LearnMore 提供 7x24 小时 AI 陪伴，价格仅为零头。',
      card3Title: '迷失在题海？',
      card3Desc:
        '课本是线性的，知识是网状的。我们为你提供个性化的学习 GPS 导航。',
    },
    features: {
      f1Title: '学习路径导航',
      f1Desc:
        '可视化概念之间的联系。如果你做错了一道二次方程，我们可能会追溯到因式分解的薄弱点。',
      f1Tag: '构建知识网络',
      f1List: ['可视化知识依赖', '前置知识点映射', '能力缺口分析'],

      f2Title: 'AI 智能诊断报告',
      f2Desc:
        '通过雷达图全方位展示你的能力维度，与年级平均水平对比，考前精准突击。',
      f2Tag: '数据驱动',
      f2Button: '查看报告样本',

      f3Title: '家长伴学端',
      f3Desc: '无需时刻盯着孩子。每周接收进度推送，共同见证每一个里程碑。',
      f3Tag: '透明高效',
      f3Trusted: '超过 15,000 位家长的信赖',
    },
    comparison: {
      title: '更聪明的选择',
      col1: '传统补习班',
      col2: 'LearnMore AI Pro',
      row1: '反馈速度',
      row1bad: '几天后 (严重滞后)',
      row1good: '即时 (秒级反馈)',
      row2: '学习路径',
      row2bad: '千人一面 (枯燥)',
      row2good: '千人千面 (游戏化)',
      row3: '可用性',
      row3bad: '固定时间 (僵化)',
      row3good: '7x24 小时 (灵活)',
      row4: '性价比',
      row4bad: '$$$ 昂贵负担',
      row4good: '$ 超高性价比',
    },
    testimonials: {
      title: '学员真实反馈',
      t1: '诊断报告帮我意识到我并不是数学差，我只是在七年级时漏掉了一个关键概念。',
      t1Author: 'Michael Z.',
      t1Role: '九年级 • 提升 25 分',
      t2: '我以前很讨厌物理公式。学习路径把它们之间的联系讲清楚后，我终于真正理解了。',
      t2Author: 'Sarah L.',
      t2Role: '八年级 • 班级第一',
      t3: '我爸妈终于不再唠叨我了，因为 App 会自动把我的进步发给他们！',
      t3Author: 'Jason K.',
      t3Role: '九年级 • 快乐学习',
    },
    cta: {
      title: '准备好提升成绩了吗？',
      btn: '开启学习之旅',
    },
    newsletter: {
      title: '订阅学习技巧资讯',
      desc: '每周获取学习洞察、备考策略和产品更新，直达您的邮箱。',
      placeholder: '输入您的邮箱',
      btn: '订阅',
      note: '我们尊重您的隐私，随时可取消订阅。',
    },
    footer: {
      product: '产品',
      resources: '资源',
      about: '关于我们',
      legal: '法律信息',
      contact: '联系我们',
      rights: '© 2026 LearnMore Edu. 保留所有权利。',
      features: '功能特性',
      pricing: '价格方案',
      stories: '成功案例',
      blog: '动态资讯',
      guides: '学习指南',
      care: '学生关怀',
    },
  },
  ms: {
    hero: {
      badge: 'Kurikulum Baharu 2025 Dikemaskini',
      headline: 'Lebih Daripada Sekadar Latihan.\nTutor AI Peribadi Anda.',
      subheadline:
        'Pembelajaran adaptif berasaskan pembelajaran adaptif yang menukar setiap minit kepada kemajuan. Berhenti meneka, mula menguasai.',
      ctaPrimary: 'Dapatkan Laporan Diagnosis Percuma',
      ctaSecondary: 'Tonton Demo',
      stat1: 'Pelajar Aktif',
      stat2: 'Soalan Diselesaikan',
    },
    painPoints: {
      title: 'Mengapa Pembelajaran Tradisional Gagal',
      subtitle: 'Kami menyelesaikan masalah yang menghalang pelajar.',
      card1Title: 'Markah Tersekat?',
      card1Desc:
        'Berlatih secara buta tanpa mengetahui MENGAPA anda salah. AI kami mengaitkan kesilapan dengan jurang konsep tertentu.',
      card2Title: 'Tutor Terlalu Mahal?',
      card2Desc:
        'Tutor peribadi mahal. LearnMore menyediakan bimbingan 24/7 dengan harga yang jauh lebih rendah.',
      card3Title: 'Sesat dalam Buku Teks?',
      card3Desc:
        'Buku teks adalah linear. Pengetahuan saling berkait. Kami memberikan anda GPS peribadi untuk pembelajaran.',
    },
    features: {
      f1Title: 'Navigasi pembelajaran adaptif',
      f1Desc:
        'Visualisasikan hubungan antara konsep. Jika anda gagal persamaan kuadratik, kami mungkin mengesan kelemahan dalam pemfaktoran asas.',
      f1Tag: 'Petakan Minda Anda',
      f1List: [
        'Ketergantungan visual',
        'Pemetaan prasyarat',
        'Analisis jurang',
      ],
      f2Title: 'Laporan Diagnostik AI',
      f2Desc:
        'Dapatkan carta radar komprehensif yang membandingkan kemahiran anda dengan purata gred. Ketahui dengan tepat di mana untuk fokus sebelum peperiksaan.',
      f2Tag: 'Dipacu Data',
      f2Button: 'Lihat Contoh Laporan',
      f3Title: 'Papan Pemuka Ibu Bapa',
      f3Desc:
        'Kekal dimaklumkan tanpa perlu mengganggu. Terima pemberitahuan kemajuan mingguan dan raikan pencapaian bersama.',
      f3Tag: 'Ketelusan',
      f3Trusted: 'Dipercayai oleh 15k+ ibu bapa',
    },
    comparison: {
      title: 'Pilihan Lebih Bijak',
      col1: 'Kelas Tuisyen Tradisional',
      col2: 'LearnMore AI Pro',
      row1: 'Kelajuan Maklum Balas',
      row1bad: 'Beberapa hari kemudian (Lambat)',
      row1good: 'Segera (Masa nyata)',
      row2: 'Laluan Pembelajaran',
      row2bad: 'Satu saiz untuk semua (Membosankan)',
      row2good: 'Adaptif (Gamifikasi)',
      row3: 'Ketersediaan',
      row3bad: 'Jadual Tetap (Kaku)',
      row3good: '24/7 Bila-bila masa (Fleksibel)',
      row4: 'Keberkesanan Kos',
      row4bad: '$$$ Mahal',
      row4good: '$ Mampu Milik',
    },
    testimonials: {
      title: 'Apa Kata Pelajar',
      t1: 'Laporan analisis membantu saya menyedari saya tidak lemah dalam Matematik, saya cuma terlepas satu konsep di Tingkatan 1.',
      t1Author: 'Michael Z.',
      t1Role: 'Tingkatan 3 • Peningkatan +25 mata',
      t2: 'Saya dulu benci formula Fizik. pembelajaran adaptif membuatkan saya faham bagaimana ia sebenarnya berkait.',
      t2Author: 'Sarah L.',
      t2Role: 'Tingkatan 2 • Teratas dalam Kelas',
      t3: 'Ibu bapa saya akhirnya berhenti membebel kerana aplikasi menghantar kemaskini secara automatik!',
      t3Author: 'Jason K.',
      t3Role: 'Tingkatan 3 • Pelajar Gembira',
    },
    cta: {
      title: 'Sedia untuk Lonjakkan Gred Anda?',
      btn: 'Mulakan Perjalanan Anda',
    },
    newsletter: {
      title: 'Kekal Dikemas Kini dengan Petua Pembelajaran',
      desc: 'Dapatkan pandangan mingguan, strategi belajar, dan kemas kini produk terus ke peti masuk anda.',
      placeholder: 'Masukkan email anda',
      btn: 'Langgan',
      note: 'Kami hormati privasi anda. Berhenti melanggan bila-bila masa.',
    },
    footer: {
      product: 'Produk',
      resources: 'Sumber',
      about: 'Tentang Kami',
      legal: 'Perundangan',
      contact: 'Hubungi Kami',
      rights: '© 2026 LearnMore Edu. Hak cipta terpelihara.',
      features: 'Ciri-ciri',
      pricing: 'Harga',
      stories: 'Kisah Kejayaan',
      blog: 'Blog / Berita',
      guides: 'Panduan Belajar',
      care: 'Penjagaan Pelajar',
    },
  },
}

interface LandingPageProps {
  stats: PlatformStats
  isLoggedIn?: boolean
}

function LandingBelowFoldSkeleton() {
  return (
    <div className="space-y-24 py-24">
      <section className="border-y border-white/5 bg-slate-900/50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <div className="mx-auto h-8 w-72 animate-pulse rounded-full bg-white/10" />
            <div className="mx-auto mt-4 h-6 w-96 max-w-full animate-pulse rounded-full bg-white/5" />
          </div>
          <div className="grid gap-8 desktop:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="rounded-3xl border border-slate-800 bg-slate-950 p-8"
              >
                <div className="mb-6 h-14 w-14 animate-pulse rounded-2xl bg-white/10" />
                <div className="mb-3 h-6 w-3/4 animate-pulse rounded-full bg-white/10" />
                <div className="h-4 w-full animate-pulse rounded-full bg-white/5" />
                <div className="mt-2 h-4 w-5/6 animate-pulse rounded-full bg-white/5" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-7xl space-y-24 px-4 sm:px-6 lg:px-8">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="grid items-center gap-16 desktop:grid-cols-2"
            >
              <div className={item % 2 === 1 ? 'order-2' : ''}>
                <div className="h-4 w-32 animate-pulse rounded-full bg-white/10" />
                <div className="mt-4 h-10 w-4/5 animate-pulse rounded-full bg-white/10" />
                <div className="mt-6 space-y-3">
                  <div className="h-4 w-full animate-pulse rounded-full bg-white/5" />
                  <div className="h-4 w-[90%] animate-pulse rounded-full bg-white/5" />
                  <div className="h-4 w-[82%] animate-pulse rounded-full bg-white/5" />
                </div>
              </div>
              <div
                className={`h-[320px] rounded-2xl border border-slate-700/50 bg-slate-900/60 ${item % 2 === 1 ? 'order-1' : ''}`}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-900/30 py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 h-8 w-56 animate-pulse rounded-full bg-white/10" />
          <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950">
            {[0, 1, 2, 3].map((item) => (
              <div
                key={item}
                className="grid grid-cols-3 gap-4 border-b border-slate-800/50 p-6 last:border-none"
              >
                <div className="h-5 w-40 animate-pulse rounded-full bg-white/10" />
                <div className="h-5 animate-pulse rounded-full bg-white/5" />
                <div className="h-5 animate-pulse rounded-full bg-white/5" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#020617] py-24">
        <div className="mx-auto max-w-4xl px-4">
          <div className="mx-auto mb-12 h-8 w-64 animate-pulse rounded-full bg-white/10" />
          <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-8">
            <div className="mx-auto h-6 w-3/4 animate-pulse rounded-full bg-white/10" />
            <div className="mx-auto mt-8 h-14 w-40 animate-pulse rounded-full bg-white/10" />
          </div>
        </div>
      </section>
    </div>
  )
}

const LandingBelowFold = dynamic(
  () =>
    import('@/components/marketing/LandingBelowFold').then(
      (mod) => mod.LandingBelowFold
    ),
  {
    ssr: false,
    loading: () => <LandingBelowFoldSkeleton />,
  }
)

export const LandingPage: React.FC<LandingPageProps> = ({
  stats,
  isLoggedIn = false,
}) => {
  const router = useRouter()
  const { lang, setLang } = useApp()
  const [resolvedIsLoggedIn, setResolvedIsLoggedIn] = useState(isLoggedIn)
  const landingPerfRef = useRef({
    lang,
    activeStudents: stats.activeStudents,
    questionsSolved: stats.questionsSolved,
  })

  const toggleLang = () => {
    const nextLang = lang === 'ms' ? 'en' : lang === 'en' ? 'zh' : 'ms'
    setLang(nextLang)
  }

  // Use local translations based on global lang context
  const t: LandingCopy =
    localTranslations[lang as keyof typeof localTranslations] ||
    localTranslations['en']

  useEffect(() => {
    emitClientPerfEvent('landing-shell-mounted', {
      route: '/',
      ...landingPerfRef.current,
    })
  }, [])

  useEffect(() => {
    try {
      const supabase = createSupabaseClient()

      supabase.auth
        .getSession()
        .then(({ data }) => {
          setResolvedIsLoggedIn(Boolean(data.session?.user))
        })
        .catch(() => {
          setResolvedIsLoggedIn(false)
        })

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setResolvedIsLoggedIn(Boolean(session?.user))
      })

      return () => {
        subscription.unsubscribe()
      }
    } catch {
      setResolvedIsLoggedIn(false)
    }
  }, [])

  const handleCTAClick = () => {
    if (resolvedIsLoggedIn) {
      router.push('/dashboard')
    } else {
      router.push('/register')
    }
  }

  // Format stats with K/M suffixes
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M+'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k+'
    return num.toString()
  }

  return (
    <div className="marketing-shell min-h-screen overflow-x-hidden bg-slate-950 font-sans text-white selection:bg-blue-500/30 selection:text-blue-100">
      <Navbar
        lang={lang}
        onToggleLang={toggleLang}
        isLoggedIn={resolvedIsLoggedIn}
      />

      {/* --- 1. Hero Section --- */}
      <section className="relative overflow-hidden pb-20 pt-28 laptop:pb-28 laptop:pt-40">
        {/* Abstract Background Effects */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-[320px] w-[min(92vw,760px)] -translate-x-1/2 animate-pulse-slow rounded-full bg-blue-600/20 opacity-50 blur-[88px] sm:h-[420px] sm:blur-[104px] laptop:h-[600px] laptop:w-[1000px] laptop:blur-[120px]"></div>
        <div className="pointer-events-none absolute bottom-0 right-0 h-[360px] w-[min(82vw,560px)] rounded-full bg-indigo-600/10 mix-blend-screen blur-[88px] sm:h-[480px] sm:w-[min(78vw,680px)] laptop:h-[800px] laptop:w-[800px] laptop:blur-[120px]"></div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 laptop:grid-cols-2">
            {/* Text Content */}
            <div className="relative z-20 text-center laptop:text-left">
              <div className="mb-6 inline-flex animate-fade-in-up items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
                {t.hero.badge}
              </div>
              <h1
                className="mb-6 animate-fade-in-up text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl laptop:text-6xl"
                style={{ animationDelay: '0.1s' }}
              >
                <span className="block text-white">
                  {t.hero.headline.split('\n')[0]}
                </span>
                <span className="block bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
                  {t.hero.headline.split('\n')[1]}
                </span>
              </h1>
              <p
                className="mx-auto mb-8 max-w-2xl animate-fade-in-up text-base leading-relaxed text-slate-400 sm:text-lg laptop:mx-0"
                style={{ animationDelay: '0.2s' }}
              >
                {t.hero.subheadline}
              </p>

              <div
                className="flex animate-fade-in-up flex-col justify-center gap-4 sm:flex-row laptop:justify-start"
                style={{ animationDelay: '0.3s' }}
              >
                <Button
                  size="xl"
                  variant="glow"
                  onClick={handleCTAClick}
                  type="button"
                  className="relative z-30 h-14 cursor-pointer px-8 text-base shadow-blue-500/25"
                >
                  {t.hero.ctaPrimary}
                </Button>
                <Button
                  size="xl"
                  variant="outline"
                  type="button"
                  className="relative z-30 h-14 cursor-pointer border-slate-700 px-8 text-base text-slate-300 hover:bg-slate-800"
                >
                  <Play className="mr-2 h-4 w-4 fill-current" />{' '}
                  {t.hero.ctaSecondary}
                </Button>
              </div>

              <div
                className="mt-10 flex animate-fade-in-up flex-wrap items-center justify-center gap-6 text-sm text-slate-500 laptop:justify-start"
                style={{ animationDelay: '0.4s' }}
              >
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-white">
                    {formatNumber(stats.activeStudents)}
                  </span>
                  <span>{t.hero.stat1}</span>
                </div>
                <div className="h-8 w-px bg-slate-800"></div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-white">
                    {formatNumber(stats.questionsSolved)}
                  </span>
                  <span>{t.hero.stat2}</span>
                </div>
              </div>
            </div>

            {/* Visual / 3D Abstract Graph Placeholder */}
            <div className="relative hidden h-[400px] w-full animate-float laptop:block laptop:h-[500px]">
              {/* Central Node */}
              <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600 opacity-40 blur-[60px]"></div>
              <div className="absolute left-1/2 top-1/2 z-20 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl border border-blue-500/50 bg-slate-900 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                <Brain className="h-10 w-10 text-blue-400" />
              </div>

              {/* Satellite Nodes - Simulated Graph */}
              {[
                {
                  top: '20%',
                  left: '20%',
                  icon: Target,
                  color: 'text-emerald-400',
                  border: 'border-emerald-500/30',
                },
                {
                  top: '20%',
                  left: '80%',
                  icon: Zap,
                  color: 'text-yellow-400',
                  border: 'border-yellow-500/30',
                },
                {
                  top: '80%',
                  left: '30%',
                  icon: BarChart2,
                  color: 'text-purple-400',
                  border: 'border-purple-500/30',
                },
                {
                  top: '70%',
                  left: '85%',
                  icon: BookOpen,
                  color: 'text-pink-400',
                  border: 'border-pink-500/30',
                },
              ].map((node, i) => (
                <React.Fragment key={i}>
                  {/* Line Connector */}
                  <svg className="pointer-events-none absolute inset-0 z-0 h-full w-full">
                    <line
                      x1="50%"
                      y1="50%"
                      x2={node.left}
                      y2={node.top}
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                  </svg>
                  {/* Node */}
                  <div
                    className={`absolute h-12 w-12 border bg-slate-900 ${node.border} z-10 flex items-center justify-center rounded-lg shadow-lg`}
                    style={{ top: node.top, left: node.left }}
                  >
                    <node.icon className={`h-5 w-5 ${node.color}`} />
                  </div>
                </React.Fragment>
              ))}

              {/* Floating Badge */}
              <div
                className="absolute right-[10%] top-[10%] z-30 flex animate-bounce gap-3 rounded-lg border border-slate-700 bg-slate-800/80 p-3 shadow-xl backdrop-blur"
                style={{ animationDuration: '3s' }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20">
                  <CircleCheck className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Concept Mastered</div>
                  <div className="text-sm font-bold text-white">
                    Quadratic Formula
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <LandingBelowFold
        t={t}
        onCtaClick={handleCTAClick}
        locale={resolveMarketingLocale(lang)}
      />
    </div>
  )
}
