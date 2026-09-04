import type { ReactNode } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { MarketingSimpleFooter } from '@/components/marketing/MarketingSimpleFooter'
import { marketingSiteConfig } from '@/lib/marketing/site-shell'

type Section = { title: string; body: ReactNode }

const privacySections: Section[] = [
  {
    title: '1. Scope',
    body: 'This policy applies to the Learnbank website, mobile beta programme and related learner services. It explains the information Learnbank collects and how to contact us about it.',
  },
  {
    title: '2. Beta sign-up information',
    body: 'When the beta sign-up form is available, it will ask only for your email address, device type and testing interest. It does not ask for a student name, school, age or other student identity details.',
  },
  {
    title: '3. How we use information',
    body: 'We use sign-up information to assess beta compatibility, communicate about the beta and operate the service safely. We do not sell personal data or use it for third-party advertising.',
  },
  {
    title: '4. App data and third parties',
    body: 'If you use the mobile app, Learnbank may process the account, learning and device information needed to provide its features. App subscriptions are processed by Apple App Store or Google Play; Learnbank does not receive card details. Any additional service providers will receive only the information needed for their role.',
  },
  {
    title: '5. Your choices',
    body: `You may ask about, correct or request deletion of information held for the beta by emailing ${marketingSiteConfig.supportEmail}. We may retain limited information where required for security, legal compliance or record keeping.`,
  },
]

const termsSections: Section[] = [
  {
    title: '1. Beta availability',
    body: 'Learnbank is preparing a mobile beta. Access may be limited, changed or withdrawn while features and content are tested. The website does not promise admission to the beta or a particular product outcome.',
  },
  {
    title: '2. Learning use',
    body: 'Use Learnbank for personal study, revision and understanding. Do not use the service to cheat, disrupt the service, infringe others’ rights or attempt unauthorised access.',
  },
  {
    title: '3. Pro subscription',
    body: 'Where Pro subscriptions are offered, they are purchased and managed inside the Learnbank mobile app through Apple App Store or Google Play. Store pricing, renewal, cancellation and refund terms shown at purchase apply.',
  },
  {
    title: '4. Learning and AI boundaries',
    body: 'Learning materials and any AI-assisted responses are for study reference only. They may be incomplete or inaccurate and do not guarantee exam results. Check important answers with your teacher, textbook or official materials.',
  },
  {
    title: '5. Contact and changes',
    body: `Learnbank may update these terms as the service develops. For questions, contact ${marketingSiteConfig.supportEmail}.`,
  },
]

export function LaunchLegalPage({ kind }: { kind: 'privacy' | 'terms' }) {
  const isPrivacy = kind === 'privacy'
  const title = isPrivacy ? 'Privacy Policy' : 'Terms of Service'
  const intro = isPrivacy
    ? 'How Learnbank handles information for its website, mobile beta and related learner services.'
    : 'The terms for using the Learnbank website, mobile beta and related learner services.'
  const sections = isPrivacy ? privacySections : termsSections

  return (
    <div className="marketing-shell min-h-screen bg-[#020617] font-sans text-white">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 pb-20 pt-32 sm:px-6">
        <h1 className="text-4xl font-bold">{title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-slate-400">{intro}</p>
        <p className="mt-4 text-sm text-slate-500">Effective date: 21 July 2026 · Learnbank</p>
        <div className="mt-10 space-y-5">
          {sections.map((section) => (
            <section key={section.title} className="rounded-3xl border border-slate-800 bg-slate-900/40 p-7">
              <h2 className="text-xl font-semibold">{section.title}</h2>
              <p className="mt-3 leading-relaxed text-slate-300">{section.body}</p>
            </section>
          ))}
        </div>
        <p className="mt-8 text-sm text-slate-500">This launch-stage policy should receive a final legal review before production release.</p>
      </main>
      <MarketingSimpleFooter />
    </div>
  )
}
