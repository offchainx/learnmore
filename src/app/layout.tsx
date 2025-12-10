import type { Metadata } from 'next'
import './globals.css'
import { AppSidebar } from '@/components/business/AppSidebar'
import { Header } from '@/components/business/Header'
import { ThemeProvider } from '@/providers/theme-provider' // Adjust path as needed

export const metadata: Metadata = {
  title: 'Learn More Platform',
  description: 'A comprehensive online education platform',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
            <AppSidebar />
            <div className="flex flex-col">
              <Header />
              <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                {children}
              </main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
