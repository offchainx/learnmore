"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BookOpen, Menu, X, Sparkles, Globe } from 'lucide-react';

interface NavbarProps {
  lang?: 'en' | 'zh' | 'ms';
  onToggleLang?: () => void;
  isLoggedIn?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ lang = 'en', onToggleLang, isLoggedIn = false }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const t = {
    en: {
      dashboard: 'Dashboard',
      subjects: 'Subjects',
      howItWorks: 'How It Works',
      pricing: 'Pricing',
      aboutUs: 'About Us',
      login: 'Log in',
      start: 'Start Learning',
      join: 'Join Now'
    },
    zh: {
      dashboard: '仪表盘',
      subjects: '课程体系',
      howItWorks: '工作原理',
      pricing: '价格方案',
      aboutUs: '关于我们',
      login: '登录',
      start: '开始学习',
      join: '立即加入'
    },
    ms: {
      dashboard: 'Papan Pemuka',
      subjects: 'Subjek',
      howItWorks: 'Cara Berfungsi',
      pricing: 'Harga',
      aboutUs: 'Tentang Kami',
      login: 'Log Masuk',
      start: 'Mula Belajar',
      join: 'Sertai Sekarang'
    }
  };

  const text = t[lang] || t['en'];

  const navLinks = [
    { name: text.howItWorks, path: '/how-it-works' },
    { name: text.subjects, path: '/subjects' },
    { name: text.pricing, path: '/pricing' },
    { name: text.aboutUs, path: '/about-us' },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out
                  tablet:block hidden ${
        scrolled ? 'py-3' : 'py-5'
      }`}
    >
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`}>
        <div className={`
          relative flex justify-between h-14 items-center px-6 rounded-full transition-all duration-300
          ${scrolled ? 'bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 shadow-2xl' : 'bg-transparent border border-transparent'}
        `}>
          {/* Logo Section */}
          <div className="flex items-center cursor-pointer group gap-3" onClick={() => router.push('/')}>
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform duration-300">
              <BookOpen className="w-4 h-4 text-white" />
              <div className="absolute -top-1 -right-1">
                <Sparkles className="w-3 h-3 text-yellow-300 animate-pulse" />
              </div>
            </div>
            <span className="text-lg font-bold text-white tracking-tight group-hover:text-blue-200 transition-colors">
              LearnMore <span className="text-blue-500 font-light text-sm">Pro</span>
            </span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((item) => (
              <Link 
                key={item.name}
                href={item.path} 
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 flex items-center ${
                  isActive(item.path)
                    ? 'text-white bg-white/10' 
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Auth Buttons & Lang Toggle */}
          <div className="hidden md:flex items-center space-x-3">
            {onToggleLang && (
              <button
                onClick={onToggleLang}
                className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1 text-xs font-medium border border-transparent hover:border-white/10"
              >
                <Globe className="w-4 h-4" />
                {lang === 'en' ? 'EN' : lang === 'zh' ? '中' : 'MS'}
              </button>
            )}
            <div className="h-4 w-px bg-white/10 mx-1"></div>

            {/* ⭐ 根据登录状态显示不同按钮 */}
            {isLoggedIn ? (
              // 已登录：显示Dashboard按钮
              <Button
                size="sm"
                variant="glow"
                type="button"
                onClick={() => { router.push('/dashboard'); }}
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
                  onClick={() => { router.push('/login'); }}
                  className="text-slate-300 hover:text-white"
                >
                  {text.login}
                </Button>
                <Button
                  size="sm"
                  variant="glow"
                  type="button"
                  onClick={() => { router.push('/register'); }}
                  className="shadow-lg shadow-blue-500/20"
                >
                  {text.start}
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden gap-4">
             {onToggleLang && (
              <button 
                onClick={onToggleLang}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                {lang === 'en' ? 'EN' : lang === 'zh' ? '中' : 'MS'}
              </button>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 px-4 md:hidden animate-fade-in-up z-50">
          <div className="p-4 space-y-2 bg-[#0f0f0f]/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl">
            {navLinks.map((item) => (
              <Link 
                key={item.name}
                href={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                   isActive(item.path) ? 'bg-white/10 text-white' : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <div className="h-px bg-white/10 my-4" />

            {/* ⭐ 移动端：根据登录状态显示不同按钮 */}
            <div className="flex flex-col gap-3">
              {isLoggedIn ? (
                // 已登录：显示Dashboard按钮
                <Button
                  variant="glow"
                  fullWidth
                  onClick={() => { setIsMobileMenuOpen(false); router.push('/dashboard'); }}
                >
                  {text.dashboard}
                </Button>
              ) : (
                // 未登录：显示Login + Join按钮
                <>
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => { setIsMobileMenuOpen(false); router.push('/login'); }}
                  >
                    {text.login}
                  </Button>
                  <Button
                    variant="glow"
                    fullWidth
                    onClick={() => { setIsMobileMenuOpen(false); router.push('/register'); }}
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
  );
};