import type { Metadata, Viewport } from 'next'
import 'antd/dist/reset.css'
import './globals.css'
import { ThemeProvider, AppProvider } from '@/providers'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from 'sonner'
import { BottomTabBar } from '@/components/mobile/BottomTabBar'
import { MobileHeader } from '@/components/mobile/MobileHeader'
import { BrowserErrorSuppressor } from '@/components/system/BrowserErrorSuppressor'
import { UnsupportedBrowserWarning } from '@/components/compatibility/UnsupportedBrowserWarning'
import { PolyfillsLoader } from '@/components/polyfills/PolyfillsLoader'
import { ImpersonateBannerWrapper } from '@/components/admin/users/ImpersonateBannerWrapper'
import { CookieConsent } from '@/components/layout/CookieConsent'
import { FeedbackWidget } from '@/components/support/FeedbackWidget'
import { fonts } from '@/lib/fonts'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Script from 'next/script'
import { getBrowserWarningSuppressorScript } from '@/lib/suppress-warnings'

export const metadata: Metadata = {
  title: 'LearnMore - 中学生在线教育平台',
  description: '专为中学生打造的在线学习平台,涵盖数学、物理、化学、英语、语文、生物六大学科',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://learnmorev10.vercel.app'),
  icons: {
    icon: [
      { url: '/icons/icon-192x192.svg', sizes: '192x192', type: 'image/svg+xml' },
      { url: '/icons/icon-512x512.svg', sizes: '512x512', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'LearnMore',
    title: 'LearnMore - 中学生在线教育平台',
    description: '专为中学生打造的在线学习平台',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LearnMore - 中学生在线教育平台',
    description: '专为中学生打造的在线学习平台',
  },
  // Resource Hints for performance optimization
  other: {
    'dns-prefetch': ['https://images.unsplash.com', 'https://i.pravatar.cc'],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover', // 支持刘海屏/药丸屏
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning className={fonts.className}>
      <body className="antialiased">
        <Script
          id="browser-warning-suppressor"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: getBrowserWarningSuppressorScript(),
          }}
        />
        <BrowserErrorSuppressor />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppProvider>
            <ImpersonateBannerWrapper />
            <PolyfillsLoader />
            <UnsupportedBrowserWarning />
            <MobileHeader />
            <div className="tablet:pt-0 pt-14">
              {children}
            </div>
            <BottomTabBar />
            <FeedbackWidget />
          </AppProvider>
        </ThemeProvider>
        <CookieConsent />
        <Toaster />
        <Sonner position="top-center" />
        <SpeedInsights />
      </body>
    </html>
  )
}
