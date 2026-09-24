import Link from 'next/link'
import { Mail } from 'lucide-react'
import Image from 'next/image'
import styles from './MarketingFullFooter.module.css'
import { BrandWordmark } from './BrandWordmark'
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
  locale = 'zh',
  labels = {
    product: '产品',
    resources: '学习资源',
    contact: '联系',
    features: '怎样学习',
    pricing: '价格方案',
    stories: '产品动态',
    blog: '产品动态',
    guides: '学习指南',
    care: '学生支持',
  },
}: MarketingFullFooterProps) {
  const legalLabels = getMarketingLegalLabels(locale)

  return (
    <footer className={`${styles.footer} bg-[#020617] border-t border-slate-900 pt-20 pb-10`}>
      <div className={`${styles.inner} max-w-7xl mx-auto px-4 sm:px-6 desktop:px-8`}>
        <div className="mb-16 grid grid-cols-2 gap-8 tablet:grid-cols-4 desktop:grid-cols-5">
          <div className="col-span-2 desktop:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Image src="/images/landing-r2/learnbank-logo.jpeg" alt="" width={34} height={34} className="rounded-lg" />
              <span className="text-xl font-semibold text-white"><BrandWordmark /></span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs mb-6">
              {getMarketingBrandDescription(locale)}
            </p>

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
