'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ThemeSwitchButton } from '@/components/ui/theme-switch-button'
import { BookOpen, Menu, X, Sparkles, Globe } from 'lucide-react'

interface NavbarProps {
  lang?: 'en' | 'zh' | 'ms'
  onToggleLang?: () => void
  isLoggedIn?: boolean
}

export const Navbar: React.FC<NavbarProps> = ({
  lang = 'en',
  onToggleLang,
  isLoggedIn = false,
}) => {
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const t = {
    en: {
      dashboard: 'Dashboard',
      subjects: 'Subjects',
      howItWorks: 'How It Works',
      pricing: 'Pricing',
      aboutUs: 'About Us',
      login: 'Log in',
      start: 'Start Learning',
      join: 'Join Now',
    },
    zh: {
      dashboard: '仪表盘',
      subjects: '课程体系',
      howItWorks: '工作原理',
      pricing: '价格方案',
      aboutUs: '关于我们',
      login: '登录',
      start: '开始学习',
      join: '立即加入',
    },
    ms: {
      dashboard: 'Papan Pemuka',
      subjects: 'Subjek',
      howItWorks: 'Cara Berfungsi',
      pricing: 'Harga',
      aboutUs: 'Tentang Kami',
      login: 'Log Masuk',
      start: 'Mula Belajar',
      join: 'Sertai Sekarang',
    },
  }

  const text = t[lang] || t['en']

  const navLinks = [
    { name: text.howItWorks, path: '/how-it-works' },
    { name: text.subjects, path: '/subjects' },
    { name: text.pricing, path: '/pricing' },
    { name: text.aboutUs, path: '/about-us' },
  ]

  const isActive = (path: string) => pathname === path

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 hidden transition-all duration-300 ease-in-out tablet:block ${
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
              Learnbank{' '}
              <span className="text-sm font-light text-blue-500">Pro</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-1 laptop:flex">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-white/10 text-white'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Auth Buttons & Lang Toggle */}
          <div className="hidden items-center space-x-3 laptop:flex">
            <ThemeSwitchButton />
            {onToggleLang && (
              <button
                onClick={onToggleLang}
                className="flex items-center gap-1 rounded-full border border-transparent p-2 text-xs font-medium text-slate-400 transition-colors hover:border-white/10 hover:bg-white/10 hover:text-white"
              >
                <Globe className="h-4 w-4" />
                {lang === 'en' ? 'EN' : lang === 'zh' ? '中' : 'MS'}
              </button>
            )}
            <div className="mx-1 h-4 w-px bg-white/10"></div>

            {/* ⭐ 根据登录状态显示不同按钮 */}
            {isLoggedIn ? (
              // 已登录：显示Dashboard按钮
              <Button
                size="sm"
                variant="glow"
                type="button"
                onClick={() => {
                  router.push('/dashboard')
                }}
                className="shadow-lg shadow-blue-500/20"
              >
                {text.dashboard}
              </Button>
            ) : (
              // 未登录：显示Login + Start Learning按钮
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => {
                    router.push('/login')
                  }}
                  className="text-slate-300 hover:text-white"
                >
                  {text.login}
                </Button>
                <Button
                  size="sm"
                  variant="glow"
                  type="button"
                  onClick={() => {
                    router.push('/register')
                  }}
                  className="shadow-lg shadow-blue-500/20"
                >
                  {text.start}
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-4 laptop:hidden">
            <ThemeSwitchButton />
            {onToggleLang && (
              <button
                onClick={onToggleLang}
                className="text-xs font-bold text-slate-400 hover:text-white"
              >
                {lang === 'en' ? 'EN' : lang === 'zh' ? '中' : 'MS'}
              </button>
            )}
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
        <div className="absolute left-0 right-0 top-full z-50 mt-2 animate-fade-in-up px-4 laptop:hidden">
          <div className="space-y-2 rounded-3xl border border-white/10 bg-[#0f0f0f]/95 p-4 shadow-2xl backdrop-blur-2xl">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block rounded-xl px-4 py-3 text-base font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-white/10 text-white'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <div className="my-4 h-px bg-white/10" />

            {/* ⭐ 移动端：根据登录状态显示不同按钮 */}
            <div className="flex flex-col gap-3">
              {isLoggedIn ? (
                // 已登录：显示Dashboard按钮
                <Button
                  variant="glow"
                  fullWidth
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    router.push('/dashboard')
                  }}
                >
                  {text.dashboard}
                </Button>
              ) : (
                // 未登录：显示Login + Join按钮
                <>
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      router.push('/login')
                    }}
                  >
                    {text.login}
                  </Button>
                  <Button
                    variant="glow"
                    fullWidth
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      router.push('/register')
                    }}
                  >
                    {text.join}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
