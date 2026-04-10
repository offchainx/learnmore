'use client'

import { NewsletterForm } from '@/components/marketing/newsletter-form'
import type { MarketingNewsletterContent } from '@/lib/marketing/newsletter'

interface MarketingNewsletterSectionProps {
  content: MarketingNewsletterContent
  className?: string
}

export function MarketingNewsletterSection({
  content,
  className = 'px-6 max-w-4xl mx-auto',
}: MarketingNewsletterSectionProps) {
  return (
    <section className={className}>
      <NewsletterForm content={content} />
    </section>
  )
}
