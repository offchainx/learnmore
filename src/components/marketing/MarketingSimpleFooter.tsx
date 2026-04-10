import { getMarketingFooterRights, type MarketingLocale } from '@/lib/marketing/site-shell'

interface MarketingSimpleFooterProps {
  locale?: MarketingLocale
}

export function MarketingSimpleFooter({
  locale = 'en',
}: MarketingSimpleFooterProps) {
  return (
    <footer className="bg-[#020617] border-t border-slate-900 py-10 text-center text-slate-600 text-sm">
      <div className="max-w-7xl mx-auto px-4">
        <p>{getMarketingFooterRights(locale)}</p>
      </div>
    </footer>
  )
}

