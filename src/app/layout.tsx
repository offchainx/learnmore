import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/providers/theme-provider'
import { AppProvider } from '@/providers/app-provider'
import { Toaster } from '@/components/ui/toaster' // Import Toaster

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
          <AppProvider>
            {children}
          </AppProvider>
        </ThemeProvider>
        <Toaster /> {/* Add Toaster here */}
      </body>
    </html>
  )
}