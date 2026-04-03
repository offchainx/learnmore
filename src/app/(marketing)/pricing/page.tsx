import { Suspense } from 'react'
import PricingPageClient from './PricingPageClient'

function PricingPageFallback() {
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100">
      <div className="mx-auto flex max-w-6xl items-center justify-center rounded-3xl border border-white/10 bg-white/5 p-12 text-sm text-slate-300">
        正在加载定价页...
      </div>
    </div>
  )
}

export default function PricingPage() {
  return (
    <Suspense fallback={<PricingPageFallback />}>
      <PricingPageClient />
    </Suspense>
  )
}
