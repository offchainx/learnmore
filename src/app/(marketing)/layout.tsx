import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s | Learnbank',
    default: 'Learnbank - 移动学习 App 内测',
  },
  description: 'Learnbank 正在进行 iOS 与 Android 移动学习 App 内测，首批聚焦数学、科学、历史和地理。',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://learnbank.net'),
  keywords: ['Learnbank', '移动学习 App', '内测', '数学', '科学', '历史', '地理'],
  openGraph: {
    type: 'website',
    siteName: 'Learnbank',
    locale: 'zh_CN',
    images: ['/images/brand/learnbank-og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/images/brand/learnbank-og.png'],
  },
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="marketing-shell">
      {/*
        营销页面布局
        注意：大部分营销页面已经包含了自己的 Navbar 和 Footer
        此 layout 主要用于：
        1. 统一 SEO metadata
        2. 未来添加营销页面专属功能（如分析追踪、CTA Banner等）
      */}
      {children}
    </div>
  )
}
