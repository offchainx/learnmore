'use client'

import Link from 'next/link'
import { BookOpen, Sparkles } from 'lucide-react'

export function MobileHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 tablet:hidden bg-background/95 backdrop-blur-sm border-b border-border pt-safe-top">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Logo */}
        <Link href="/" prefetch className="flex items-center gap-2">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
            <BookOpen className="w-4 h-4 text-white" />
            <div className="absolute -top-1 -right-1">
              <Sparkles className="w-3 h-3 text-yellow-300" />
            </div>
          </div>
          <span className="text-base font-bold">
            LearnMore <span className="text-blue-500 font-light text-sm">Pro</span>
          </span>
        </Link>

        {/* Right actions can be added here */}
      </div>
    </header>
  )
}
