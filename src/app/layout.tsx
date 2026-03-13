import type { Metadata, Viewport } from 'next'
import { cookies } from 'next/headers'
import './globals.css'
import '@/lib/suppress-warnings' // 抑制已知的框架警告
import { ThemeProvider, AppProvider } from '@/providers'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from 'sonner'
import { BottomTabBar } from '@/components/mobile/BottomTabBar'
import { MobileHeader } from '@/components/mobile/MobileHeader'
import { UnsupportedBrowserWarning } from '@/components/compatibility/UnsupportedBrowserWarning'
import { PolyfillsLoader } from '@/components/polyfills/PolyfillsLoader'
import { ImpersonateBannerWrapper } from '@/components/admin/users/ImpersonateBannerWrapper'
import { CookieConsent } from '@/components/layout/CookieConsent'
import { FeedbackWidget } from '@/components/support/FeedbackWidget'
import { fonts } from '@/lib/fonts'
import type { Lang } from '@/providers/app-provider'
import { SpeedInsights } from '@vercel/speed-insights/next'

export const metadata: Metadata = {
  title: 'LearnMore - 中学生在线教育平台',
  description: '专为中学生打造的在线学习平台,涵盖数学、物理、化学、英语、语文、生物六大学科',
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

const parseLangCookie = (value: string | undefined): Lang => {
  if (value === 'en' || value === 'zh' || value === 'ms') {
    return value
  }

  return 'zh'
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const initialLang = parseLangCookie(cookieStore.get('lm_lang')?.value)

  return (
    <html lang="zh-CN" suppressHydrationWarning className={fonts.className}>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppProvider initialLang={initialLang}>
            <ImpersonateBannerWrapper />
            <PolyfillsLoader />
            <UnsupportedBrowserWarning />
            <MobileHeader />
            <div className="tablet:pt-0 pt-14">
              {children}
            </div>
            <BottomTabBar />
          </AppProvider>
        </ThemeProvider>
        <CookieConsent />
        <FeedbackWidget />
        <Toaster />
        <Sonner position="top-center" />
        <SpeedInsights />
      </body>
    </html>
  )
}
