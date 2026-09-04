import Link from 'next/link'
import { BookOpen, Mail, Share2 } from 'lucide-react'
import {
  getMarketingBrandDescription,
  getMarketingFooterRights,
  getMarketingLegalLabels,
  marketingSiteConfig,
  type MarketingLocale,
} from '@/lib/marketing/site-shell'

interface MarketingFullFooterProps {
  locale?: MarketingLocale
  labels?: {
    product: string
    resources: string
    contact: string
    features: string
    pricing: string
    stories: string
    blog: string
    guides: string
    care: string
  }
}

export function MarketingFullFooter({
  locale = 'en',
  labels = {
    product: 'Product',
    resources: 'Resources',
    contact: 'Contact',
    features: 'How it works',
    pricing: 'Pricing',
    stories: 'Updates',
    blog: 'Updates',
    guides: 'Study guides',
    care: 'Student care',
  },
}: MarketingFullFooterProps) {
  const legalLabels = getMarketingLegalLabels(locale)

  return (
    <footer className="bg-[#020617] border-t border-slate-900 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 desktop:px-8">
        <div className="mb-16 grid grid-cols-2 gap-8 tablet:grid-cols-4 desktop:grid-cols-5">
          <div className="col-span-2 desktop:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-white">{marketingSiteConfig.brandName}</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs mb-6">
              {getMarketingBrandDescription(locale)}
            </p>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                <Share2 className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6">{labels.product}</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li>
                <Link href="/how-it-works" className="hover:text-blue-400 transition-colors text-left">
                  {labels.features}
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-blue-400 transition-colors text-left">
                  {labels.pricing}
                </Link>
              </li>
              <li>
                <Link href="/success-stories" className="hover:text-blue-400 transition-colors text-left">
                  {labels.stories}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6">{labels.resources}</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li>
                <Link href="/blog" className="hover:text-blue-400 transition-colors text-left">
                  {labels.blog}
                </Link>
              </li>
              <li>
                <Link href="/study-guides" className="hover:text-blue-400 transition-colors text-left">
                  {labels.guides}
                </Link>
              </li>
              <li>
                <Link href="/student-care" className="hover:text-blue-400 transition-colors text-left">
                  {labels.care}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6">{labels.contact}</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a href={`mailto:${marketingSiteConfig.supportEmail}`} className="hover:text-blue-400 transition-colors">
                  {marketingSiteConfig.supportEmail}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-900 pt-8 text-sm text-slate-600 tablet:flex-row">
          <div>{getMarketingFooterRights(locale)}</div>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-slate-400 transition-colors">
              {legalLabels.terms}
            </Link>
            <Link href="/privacy" className="hover:text-slate-400 transition-colors">
              {legalLabels.privacy}
            </Link>
            <Link href="/contact" className="hover:text-slate-400 transition-colors">
              {legalLabels.contact}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
