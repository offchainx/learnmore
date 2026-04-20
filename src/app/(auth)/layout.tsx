'use client'

import { useEffect } from 'react'
import React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeSwitchButton } from '@/components/ui/theme-switch-button'


export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    const { body, documentElement } = document
    const prevBodyOverflow = body.style.overflow
    const prevHtmlOverflow = documentElement.style.overflow
    const prevBodyOverscroll = body.style.overscrollBehavior
    const prevHtmlOverscroll = documentElement.style.overscrollBehavior

    body.style.overflow = 'hidden'
    documentElement.style.overflow = 'hidden'
    body.style.overscrollBehavior = 'none'
    documentElement.style.overscrollBehavior = 'none'

    return () => {
      body.style.overflow = prevBodyOverflow
      documentElement.style.overflow = prevHtmlOverflow
      body.style.overscrollBehavior = prevBodyOverscroll
      documentElement.style.overscrollBehavior = prevHtmlOverscroll
    }
  }, [])

  return (
    <div className="auth-shell relative flex h-dvh items-center justify-center overflow-hidden overscroll-none bg-[#020617] px-4 py-6 font-sans text-white sm:px-6 desktop:px-8">
      {/* Background blobs (extracted from AI designs) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-8%] left-[-16%] h-[260px] w-[260px] rounded-full bg-blue-900/20 blur-[72px] sm:h-[360px] sm:w-[360px] desktop:h-[500px] desktop:w-[500px] desktop:blur-[100px]"></div>
        <div className="absolute top-[-8%] right-[-12%] h-[260px] w-[260px] rounded-full bg-indigo-900/20 blur-[72px] sm:h-[360px] sm:w-[360px] desktop:h-[500px] desktop:w-[500px] desktop:blur-[100px]" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-[-10%] left-[-10%] h-[260px] w-[260px] rounded-full bg-blue-900/20 blur-[72px] sm:h-[360px] sm:w-[360px] desktop:h-[500px] desktop:w-[500px] desktop:blur-[100px]" style={{ animationDelay: '2s' }}></div>
      </div>
      
      {/* Back to Home Button */}
      <div className="absolute left-4 top-4 z-10 sm:left-6 sm:top-6 desktop:left-8 desktop:top-8">
        <Button variant="ghost" onClick={() => router.push('/')} className="flex items-center gap-2 px-2 text-slate-400 transition-colors hover:text-white sm:px-3">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Button>
      </div>

      <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6 desktop:right-8 desktop:top-8">
        <ThemeSwitchButton />
      </div>

      <div className="relative z-10 flex w-full min-w-0 items-center justify-center">
        {children}
      </div>
    </div>
  )
}
