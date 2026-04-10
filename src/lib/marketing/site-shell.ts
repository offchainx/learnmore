export type MarketingLocale = 'en' | 'zh' | 'ms'

export const marketingSiteConfig = {
  supportEmail: 'support@learnmore.com',
  phone: '+65 6789 1234',
  addressLines: ['100 Innovation Drive, #02-01', 'Singapore 138668'],
} as const

const footerRightsByLocale: Record<MarketingLocale, string> = {
  en: '© 2026 LearnMore Edu. All rights reserved.',
  zh: '© 2026 LearnMore Edu. 保留所有权利。',
  ms: '© 2026 LearnMore Edu. Hak cipta terpelihara。',
}

const brandDescriptionByLocale: Record<MarketingLocale, string> = {
  en: 'Empowering the next generation of learners with AI-driven insights and adaptive pathways.',
  zh: '以 AI 驱动洞察与自适应学习路径，帮助新一代学习者持续成长。',
  ms: 'Memperkasa generasi pelajar seterusnya dengan wawasan berasaskan AI dan laluan pembelajaran adaptif.',
}

const legalLabelsByLocale: Record<MarketingLocale, { terms: string; privacy: string; contact: string }> = {
  en: {
    terms: 'Terms',
    privacy: 'Privacy',
    contact: 'Contact Us',
  },
  zh: {
    terms: '服务条款',
    privacy: '隐私政策',
    contact: '联系我们',
  },
  ms: {
    terms: 'Terma',
    privacy: 'Privasi',
    contact: 'Hubungi Kami',
  },
}

export function getMarketingFooterRights(locale: MarketingLocale = 'en') {
  return footerRightsByLocale[locale]
}

export function getMarketingBrandDescription(locale: MarketingLocale = 'en') {
  return brandDescriptionByLocale[locale]
}

export function getMarketingLegalLabels(locale: MarketingLocale = 'en') {
  return legalLabelsByLocale[locale]
}

export function resolveMarketingLocale(
  lang: string | null | undefined
): MarketingLocale {
  if (lang === 'zh' || lang === 'ms' || lang === 'en') {
    return lang
  }

  return 'en'
}

