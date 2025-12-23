import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeProvider } from '@/providers/theme-provider'
import { AppProvider } from '@/providers/app-provider'
import { Toaster } from '@/components/ui/toaster'
import { BottomTabBar } from '@/components/mobile/BottomTabBar'
import { MobileHeader } from '@/components/mobile/MobileHeader'
import { ServiceWorkerRegistration } from '@/components/pwa/ServiceWorkerRegistration'
import { InstallPrompt } from '@/components/pwa/InstallPrompt'
import { UnsupportedBrowserWarning } from '@/components/compatibility/UnsupportedBrowserWarning'
import { PolyfillsLoader } from '@/components/polyfills/PolyfillsLoader'
import { fonts } from '@/lib/fonts'

export const metadata: Metadata = {
  title: 'LearnMore - 中学生在线教育平台',
  description: '专为中学生打造的在线学习平台,涵盖数学、物理、化学、英语、语文、生物六大学科',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'LearnMore',
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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppProvider>
            <PolyfillsLoader />
            <UnsupportedBrowserWarning />
            <ServiceWorkerRegistration />
            <InstallPrompt />
            <MobileHeader />
            <div className="tablet:pt-0 pt-14">
              {children}
            </div>
            <BottomTabBar />
          </AppProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  )
}