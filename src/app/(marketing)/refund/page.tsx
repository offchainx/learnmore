import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/navbar'
import { MarketingSimpleFooter } from '@/components/marketing/MarketingSimpleFooter'
import { marketingSiteConfig } from '@/lib/marketing/site-shell'

export const metadata: Metadata = {
  title: 'Refund Information | Learnbank',
  description: 'Refund information for Learnbank in-app subscriptions.',
}

export default function RefundPage() {
  return (
    <div className="marketing-shell min-h-screen bg-[#020617] font-sans text-white">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 pb-20 pt-32 sm:px-6">
        <h1 className="text-4xl font-bold">Refund Information</h1>
        <div className="mt-8 space-y-5 text-slate-300">
          <section className="rounded-3xl border border-slate-800 bg-slate-900/40 p-7">
            <h2 className="text-xl font-semibold text-white">In-app subscriptions</h2>
            <p className="mt-3 leading-relaxed">Learnbank does not collect payments on this website. When Pro subscriptions are available, purchases and subscription management happen in the Learnbank mobile app through Apple App Store or Google Play.</p>
          </section>
          <section className="rounded-3xl border border-slate-800 bg-slate-900/40 p-7">
            <h2 className="text-xl font-semibold text-white">Refund requests</h2>
            <p className="mt-3 leading-relaxed">Refund eligibility and processing follow the policy of the store used for the purchase. Please submit the request through the relevant Apple or Google purchase channel. For product-support questions, contact {marketingSiteConfig.supportEmail}.</p>
          </section>
        </div>
      </main>
      <MarketingSimpleFooter />
    </div>
  )
}
