'use client'

import { useEffect } from 'react'
import React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeSwitchButton } from '@/components/ui/theme-switch-button'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const showChrome =
    !pathname.startsWith('/login') && !pathname.startsWith('/register')

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
    <div className="auth-shell relative flex min-h-[100dvh] items-start justify-center overflow-y-auto overflow-x-hidden overscroll-none bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] px-4 py-4 pb-safe-bottom pt-safe-top font-sans text-slate-900 sm:items-center sm:px-6 sm:py-6 desktop:px-8 desktop:py-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-0 top-0 h-full w-full bg-[linear-gradient(to_right,rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[size:42px_42px] opacity-60" />
        <div className="absolute left-[-12%] top-[-10%] size-[28rem] rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute bottom-[-18%] right-[-10%] size-[24rem] rounded-full bg-slate-400/10 blur-3xl" />
      </div>

      {/* Back to Home Button */}
      {showChrome ? (
        <>
          <div className="absolute left-4 top-4 z-10 sm:left-6 sm:top-6 desktop:left-8 desktop:top-8">
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="flex items-center gap-2 px-2 text-slate-500 transition-colors hover:bg-white/70 hover:text-slate-950 sm:px-3"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Button>
          </div>

          <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6 desktop:right-8 desktop:top-8">
            <ThemeSwitchButton />
          </div>
        </>
      ) : null}

      <div className="relative z-10 flex w-full min-w-0 items-center justify-center">
        {children}
      </div>
    </div>
  )
}
