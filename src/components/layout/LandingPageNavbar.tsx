'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { BookOpen, Menu, X, Sparkles } from 'lucide-react'

export const LandingPageNavbar: React.FC = () => {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Subjects', path: '/subjects' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'About Us', path: '/about-us' },
  ]

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ease-in-out ${
        scrolled ? 'py-3' : 'py-5'
      }`}
    >
      <div className={`mx-auto max-w-7xl px-4 sm:px-6 desktop:px-8`}>
        <div
          className={`relative flex h-14 items-center justify-between rounded-full px-6 transition-all duration-300 ${scrolled ? 'border border-white/10 bg-[#0a0a0a]/80 shadow-2xl backdrop-blur-xl' : 'border border-transparent bg-transparent'} `}
        >
          {/* Logo Section */}
          <div
            className="group flex cursor-pointer items-center gap-3"
            onClick={() => router.push('/')}
          >
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30 transition-transform duration-300 group-hover:scale-105">
              <BookOpen className="h-4 w-4 text-white" />
              <div className="absolute -right-1 -top-1">
                <Sparkles className="h-3 w-3 animate-pulse text-yellow-300" />
              </div>
            </div>
            <span className="text-lg font-bold tracking-tight text-white transition-colors group-hover:text-blue-200">
              Learnbank <span className="font-light text-blue-500">Pro</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-1 laptop:flex">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition-all duration-200 hover:bg-white/5 hover:text-white`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden items-center space-x-3 laptop:flex">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/login')}
              className="text-slate-300 hover:bg-white/10 hover:text-white"
            >
              Log in
            </Button>
            <Button
              size="sm"
              variant="glow"
              onClick={() => router.push('/register')}
              className="shadow-lg shadow-blue-500/20"
            >
              Start Learning
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center laptop:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-full p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 animate-fade-in-up px-4 laptop:hidden">
          <div className="space-y-2 rounded-3xl border border-white/10 bg-[#0f0f0f]/95 p-4 shadow-2xl backdrop-blur-2xl">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block rounded-xl px-4 py-3 text-base font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
              >
                {item.name}
              </Link>
            ))}
            <div className="my-4 h-px bg-white/10" />
            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                className="w-full justify-center"
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  router.push('/login')
                }}
              >
                Log In
              </Button>
              <Button
                variant="glow"
                className="w-full justify-center"
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  router.push('/register')
                }}
              >
                Join Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
