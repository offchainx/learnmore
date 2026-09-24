'use client'

import { editorial } from './typography'
import { LearningJourney } from './LearningJourney'
import { ParentsStorySection, SubjectsStorySection } from './SelectedStorySections'
import { LandingFinalSections } from './LandingFinalSections'

import { ArrowRight, BookOpen, CircleCheck, Clock3, Mail, Smartphone } from 'lucide-react'
import { Navbar } from '@/components/layout/navbar'
import { MarketingFullFooter } from '@/components/marketing/MarketingFullFooter'
import { LandingHeader, LandingHero } from '@/components/marketing/LandingHero'
import { useApp } from '@/providers'
import { marketingSiteConfig, resolveMarketingLocale } from '@/lib/marketing/site-shell'

export type LaunchContentPageKind =
  | 'home'
  | 'about'
  | 'how-it-works'
  | 'subjects'
  | 'study-guides'
  | 'student-care'
  | 'success-stories'
  | 'updates'

type LaunchPageCopy = {
  eyebrow: string
  title: string
  intro: string
  sections: Array<{ title: string; body: string; points?: string[] }>
}

const copy: Record<'en' | 'zh', Record<LaunchContentPageKind, LaunchPageCopy>> = {
  en: {
    home: {
      eyebrow: 'MOBILE BETA · IOS & ANDROID',
      title: 'A clearer place to practise, review and keep going.',
      intro: 'Learnbank.ai is preparing a mobile learning app for students. The first beta focuses on Mathematics, Science, History and Geography, with practice, review and learning notes tested in small steps.',
      sections: [
        { title: 'Built for mobile first', body: 'Learnbank.ai is currently focused on iOS and Android. A public web app is not part of this launch.' },
        { title: 'A deliberate beta scope', body: 'Features and subject availability may change during testing. We will share only what is ready for a real beta preview.' },
        { title: 'Pro, when it is ready', body: 'Pro is planned as an in-app subscription: RM 99 per month or RM 990 per year. This website does not collect payment.' },
      ],
    },
    about: {
      eyebrow: 'ABOUT Learnbank.ai',
      title: 'Building a calmer way to practise and review.',
      intro:
        'Learnbank.ai is preparing a mobile learning app for students. We are currently validating the first experience with a small iOS and Android beta group.',
      sections: [
        {
          title: 'What we are building',
          body: 'A focused learning space for practice, reviewing mistakes, learning notes and progress. Features are still being tested and may change during beta.',
        },
        {
          title: 'How we communicate progress',
          body: 'We will publish only confirmed product updates and beta previews. We do not publish invented team credentials, learner counts, score improvements or testimonials.',
        },
      ],
    },
    'how-it-works': {
      eyebrow: 'BETA PREVIEW',
      title: 'A simple learning loop, tested on mobile first.',
      intro:
        'The initial Learnbank.ai beta focuses on helping learners practise, understand mistakes and return to the right material. It is not a promise of automated grade improvement.',
      sections: [
        {
          title: '1. Choose a subject and practise',
          body: 'Start with the available content in the app and work at a pace that suits you.',
        },
        {
          title: '2. Review answers and notes',
          body: 'Use explanations and your own learning notes to revisit ideas you want to strengthen.',
        },
        {
          title: '3. Learn from beta feedback',
          body: 'Early testers help us check clarity, stability and which learning flows deserve further investment.',
        },
      ],
    },
    subjects: {
      eyebrow: 'INITIAL SUBJECTS',
      title: 'Four subjects in the initial beta scope.',
      intro:
        'The launch scope is deliberately small. Availability can differ by device, content release and beta invitation.',
      sections: [
        {
          title: 'Current focus',
          body: 'Mathematics, Science, History and Geography are the four subjects currently planned for the initial Learnbank.ai beta.',
          points: ['Mathematics', 'Science', 'History', 'Geography'],
        },
        {
          title: 'What comes next',
          body: 'We will share new subject coverage only after the relevant content and learning experience are ready to test.',
        },
      ],
    },
    'study-guides': {
      eyebrow: 'STUDY RESOURCES',
      title: 'Useful study guidance, published when verified.',
      intro:
        'Learnbank.ai is preparing learning resources alongside the app. We will not present untested product flows as if they are already available.',
      sections: [
        {
          title: 'During beta',
          body: 'Testers may receive selected practice and review prompts inside the app. Their availability depends on the beta build and subject scope.',
        },
        {
          title: 'Public guides',
          body: 'This page will host learning guides and product notes once they are reviewed and ready to share.',
        },
      ],
    },
    'student-care': {
      eyebrow: 'STUDENT CARE',
      title: 'A focused beta, with minimal data collection.',
      intro:
        'We are not currently running a scholarship, financial-aid or student identity application through this website.',
      sections: [
        {
          title: 'Beta sign-up principle',
          body: 'The upcoming beta form will ask only for an email address, device type and testing interest. It will not ask for a student name, school, age or financial situation.',
        },
        {
          title: 'Need help?',
          body: `For product or accessibility feedback, contact ${marketingSiteConfig.supportEmail}. We will reply when support capacity allows.`,
        },
      ],
    },
    'success-stories': {
      eyebrow: 'DEVELOPMENT UPDATES',
      title: 'No invented success stories.',
      intro:
        'Learnbank.ai is still in its initial beta stage. We do not yet publish student quotes, outcome statistics, before-and-after grades or video testimonials.',
      sections: [
        {
          title: 'What you will find here instead',
          body: 'Verified development notes, beta previews and confirmed updates about what we are testing.',
        },
        {
          title: 'When stories are published',
          body: 'Any future learner story will require a real source and appropriate permission. It will be clearly labelled as a real experience, not marketing fiction.',
        },
      ],
    },
    updates: {
      eyebrow: 'Learnbank.ai UPDATES',
      title: 'Product updates will appear here.',
      intro:
        'We are preparing the first Learnbank.ai mobile beta. Until we have verified updates to share, this page intentionally does not display generated articles or community claims.',
      sections: [
        {
          title: 'What we will publish',
          body: 'Confirmed beta milestones, release notes, practical study guidance and clearly sourced announcements.',
        },
        {
          title: 'What we will not publish',
          body: 'Invented testimonials, unverified performance outcomes or product features that are not available for testing.',
        },
      ],
    },
  },
  zh: {
    home: {
      eyebrow: '移动端内测 · IOS 与 ANDROID',
      title: '让练习、复盘与持续学习更清晰。',
      intro: 'Learnbank.ai 正在准备一款面向学生的移动学习 App。首批内测围绕数学、科学、历史和地理，逐步验证练习、复盘与学习笔记体验。',
      sections: [
        { title: '移动端优先', body: 'Learnbank.ai 当前聚焦 iOS 与 Android；公开 Web App 不在本次首发范围内。' },
        { title: '有意收缩的内测范围', body: '功能和科目可用性会随测试调整；我们只会发布已准备好进行真实内测预览的内容。' },
        { title: 'Pro 订阅', body: 'Pro 计划采用 App 内订阅：月订 RM 99，年订 RM 990。本网站不会收取付款。' },
      ],
    },
    about: {
      eyebrow: '关于 Learnbank.ai',
      title: '为练习与复习打造更平静、更清晰的体验。',
      intro:
        'Learnbank.ai 正在准备一款面向学生的移动学习 App。目前我们正与小范围 iOS 和 Android 内测用户验证第一版体验。',
      sections: [
        {
          title: '我们正在做什么',
          body: '围绕练习、错题复盘、学习笔记和进度打造一个专注的学习空间。内测期间功能仍会调整。',
        },
        {
          title: '我们如何发布进展',
          body: '我们只发布已确认的产品进展和内测预览，不会编造团队履历、用户数量、提分结果或用户评价。',
        },
      ],
    },
    'how-it-works': {
      eyebrow: '内测预览',
      title: '先在移动端验证一条简单的学习闭环。',
      intro:
        'Learnbank.ai 首批内测聚焦于练习、理解错题和回到需要复习的内容；它不承诺自动提升成绩。',
      sections: [
        {
          title: '1. 选择科目并开始练习',
          body: '在 App 中从当前可用内容开始，按适合自己的节奏完成练习。',
        },
        {
          title: '2. 复盘答案与笔记',
          body: '通过解析和自己的学习笔记，重新理解需要加强的知识点。',
        },
        {
          title: '3. 让内测反馈推动改进',
          body: '早期用户将帮助我们验证内容清晰度、稳定性，以及哪些学习流程值得继续投入。',
        },
      ],
    },
    subjects: {
      eyebrow: '首批科目',
      title: '首批内测先聚焦四个科目。',
      intro: '首发范围会刻意保持小而清晰；实际可用性可能因设备、内容发布和内测邀请而不同。',
      sections: [
        {
          title: '当前方向',
          body: 'Learnbank.ai 首批内测计划覆盖数学、科学、历史和地理四个科目。',
          points: ['数学', '科学', '历史', '地理'],
        },
        {
          title: '后续扩展',
          body: '只有在对应内容和学习体验准备好测试后，我们才会公布新的科目覆盖范围。',
        },
      ],
    },
    'study-guides': {
      eyebrow: '学习资源',
      title: '只发布已经核实的学习建议。',
      intro: 'Learnbank.ai 会与 App 一起逐步准备学习资源，不会把尚未开放的产品流程包装成已经可用的功能。',
      sections: [
        {
          title: '内测期间',
          body: '内测用户可能会在 App 内收到精选的练习与复盘提示，具体内容取决于内测版本和科目范围。',
        },
        {
          title: '公开学习指南',
          body: '本页会在内容经过审核并适合公开后，陆续发布学习指南和产品说明。',
        },
      ],
    },
    'student-care': {
      eyebrow: '学生支持',
      title: '专注内测，并坚持最少数据收集。',
      intro: '本网站目前不提供奖学金、助学金或学生身份申请。',
      sections: [
        {
          title: '内测报名原则',
          body: '即将上线的内测报名表只会收集邮箱、设备类型和测试意愿；不会收集学生姓名、学校、年龄或经济情况。',
        },
        {
          title: '需要帮助？',
          body: `如需反馈产品或无障碍使用问题，请联系 ${marketingSiteConfig.supportEmail}。我们会在支持能力允许时回复。`,
        },
      ],
    },
    'success-stories': {
      eyebrow: '开发进展',
      title: '不使用虚构成功案例。',
      intro: 'Learnbank.ai 仍处于首批内测阶段，目前不会发布学生评价、效果数据、前后成绩对比或视频访谈。',
      sections: [
        {
          title: '这里将展示什么',
          body: '经过核实的开发记录、内测预览，以及我们正在测试的功能更新。',
        },
        {
          title: '未来案例的发布原则',
          body: '任何学习者故事都必须有真实来源和适当授权，并会明确标为真实体验，而非营销虚构内容。',
        },
      ],
    },
    updates: {
      eyebrow: 'Learnbank.ai 更新',
      title: '产品更新将在这里发布。',
      intro: '我们正在准备 Learnbank.ai 移动端首批内测。在有经过验证的内容前，本页不会展示自动生成的文章或社区成果。',
      sections: [
        {
          title: '我们会发布什么',
          body: '已确认的内测里程碑、版本说明、实用学习建议，以及来源清晰的公告。',
        },
        {
          title: '我们不会发布什么',
          body: '虚构评价、未经验证的学习效果，或尚未开放测试的产品功能。',
        },
      ],
    },
  },
}

export function LaunchContentPage({ kind }: { kind: LaunchContentPageKind }) {
  const { lang, setLang } = useApp()
  const locale = lang === 'zh' ? 'zh' : 'en'
  const page = copy[locale][kind]

  const toggleLang = () => setLang(locale === 'zh' ? 'en' : 'zh')

  if (kind === 'subjects') return <LaunchSubjectsPage />

  if (kind === 'home') {
    return <LaunchHomePage />
  }

  return (
    <div className="marketing-shell min-h-screen overflow-x-hidden bg-[#020617] font-sans text-white">
      <Navbar lang={locale} onToggleLang={toggleLang} />
      <main className="mx-auto max-w-5xl px-4 pb-20 pt-32 sm:px-6">
        <section className="rounded-[2rem] border border-blue-400/15 bg-gradient-to-br from-blue-500/15 via-slate-950 to-indigo-500/10 px-6 py-12 sm:px-10 sm:py-16">
          <div className="mb-5 flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-blue-300">
            <Smartphone className="h-4 w-4" />
            {page.eyebrow}
          </div>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">{page.title}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-300">{page.intro}</p>
        </section>

        <section className="mt-10 grid gap-5">
          {page.sections.map((section) => (
            <article key={section.title} className="rounded-3xl border border-slate-800 bg-slate-900/40 p-7 sm:p-8">
              <div className="flex gap-3">
                <CircleCheck className="mt-1 h-5 w-5 shrink-0 text-blue-400" />
                <div>
                  <h2 className="text-xl font-semibold text-white">{section.title}</h2>
                  <p className="mt-3 leading-relaxed text-slate-400">{section.body}</p>
                  {section.points && (
                    <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                      {section.points.map((point) => (
                        <li key={point} className="flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-slate-200">
                          <BookOpen className="h-4 w-4 text-blue-400" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </article>
          ))}
        </section>

        <p className="mt-10 flex items-center gap-2 text-sm text-slate-400">
          <Clock3 className="h-4 w-4" />
          {locale === 'zh' ? '内容会随内测进展更新。' : 'Content will be updated as the beta progresses.'}
        </p>
        <a className="mt-4 inline-flex items-center gap-2 text-sm text-blue-300 hover:text-blue-200" href={`mailto:${marketingSiteConfig.supportEmail}`}>
          <Mail className="h-4 w-4" />
          {marketingSiteConfig.supportEmail}
        </a>
      </main>
      <MarketingFullFooter locale={resolveMarketingLocale(lang)} />
    </div>
  )
}

function LaunchSubjectsPage() {
  return (
    <div className={`${editorial.variable} landing-r2-shell marketing-shell min-h-screen bg-[#fffaf0] font-sans`}>
      <LandingHeader home={false} />
      <main id="main-content"><SubjectsStorySection /></main>
      <MarketingFullFooter locale="zh" />
    </div>
  )
}

function LaunchHomePage() {
  return (
    <div className={`${editorial.variable} landing-r2-shell marketing-shell min-h-screen overflow-x-hidden bg-[#fffaf0] font-sans`}>
      <LandingHeader />
      <main id="main-content">
        <LandingHero />
        <LearningJourney />
        <ParentsStorySection />
        <LandingFinalSections />
      </main>
      <MarketingFullFooter locale="zh" />
    </div>
  )
}
