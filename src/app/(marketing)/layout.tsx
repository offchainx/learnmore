import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s | LearnMore',
    default: 'LearnMore - 中学生在线教育平台',
  },
  description: '专为中学生打造的在线学习平台，涵盖数学、物理、化学、英语、语文、生物六大学科',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://learnmorev10.vercel.app'),
  keywords: ['在线教育', '中学', 'AI导师', '自适应学习', '学习路径', 'LearnMore'],
  openGraph: {
    type: 'website',
    siteName: 'LearnMore',
    locale: 'zh_CN',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/*
        营销页面布局
        注意：大部分营销页面已经包含了自己的 Navbar 和 Footer
        此 layout 主要用于：
        1. 统一 SEO metadata
        2. 未来添加营销页面专属功能（如分析追踪、CTA Banner等）
      */}
      {children}
    </>
  )
}
