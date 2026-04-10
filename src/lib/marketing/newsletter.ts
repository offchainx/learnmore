import type { MarketingLocale } from '@/lib/marketing/site-shell'

export type MarketingNewsletterContent = {
  title: string
  desc: string
  placeholder: string
  btn: string
  note: string
}

const blogNewsletterContent: Record<'en' | 'zh', MarketingNewsletterContent> = {
  en: {
    title: 'Get smarter every week.',
    desc: 'Join 50,000+ students receiving our weekly study hacks and product updates.',
    placeholder: 'Enter your email',
    btn: 'Subscribe',
    note: 'No spam, unsubscribe anytime.',
  },
  zh: {
    title: '每周变强一点点。',
    desc: '加入 50,000+ 学员，接收我们每周发送的学习黑客技巧和产品更新。',
    placeholder: '输入您的邮箱',
    btn: '订阅',
    note: '无垃圾邮件，随时退订。',
  },
}

export function getBlogNewsletterContent(
  locale: MarketingLocale
): MarketingNewsletterContent {
  if (locale === 'zh') {
    return blogNewsletterContent.zh
  }

  return blogNewsletterContent.en
}

