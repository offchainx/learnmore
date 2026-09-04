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
import { CookieConsent } from '@/components/layout/CookieConsent'
import { FeedbackWidget } from '@/components/support/FeedbackWidget'
import { fonts } from '@/lib/fonts'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Script from 'next/script'
import { getBrowserWarningSuppressorScript } from '@/lib/suppress-warnings'

export const metadata: Metadata = {
  title: 'Learnbank - 移动学习 App 内测',
  description: 'Learnbank 正在进行 iOS 与 Android 移动学习 App 内测，首批聚焦数学、科学、历史和地理。',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://learnbank.net'),
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
    siteName: 'Learnbank',
    title: 'Learnbank - 移动学习 App 内测',
    description: 'iOS 与 Android 内测，首批聚焦数学、科学、历史和地理。',
    images: ['/images/brand/learnbank-og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Learnbank - 移动学习 App 内测',
    description: 'iOS 与 Android 内测，首批聚焦数学、科学、历史和地理。',
    images: ['/images/brand/learnbank-og.png'],
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
      <body className="min-h-dvh antialiased">
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
          defaultTheme="light"
          forcedTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AppProvider>
            <PolyfillsLoader />
            <UnsupportedBrowserWarning />
            <MobileHeader />
            <div className="min-h-dvh pt-[calc(env(safe-area-inset-top)+3.5rem)] pb-[calc(env(safe-area-inset-bottom)+4rem)] tablet:min-h-0 tablet:pt-0 tablet:pb-0">
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
