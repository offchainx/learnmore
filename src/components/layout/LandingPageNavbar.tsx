'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BookOpen, Menu, X, Sparkles } from 'lucide-react';

export const LandingPageNavbar: React.FC = () => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    // Temporarily pointing these to dashboard as placeholders
    { name: 'Subjects', path: '/dashboard' },
    { name: 'Question Bank', path: '/dashboard' },
    { name: 'Community', path: '/dashboard' },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
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
              LearnMore <span className="text-blue-500 font-light">Pro</span>
            </span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((item) => (
              <Link 
                key={item.name}
                href={item.path} 
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 flex items-center ${
                  item.name === 'Dashboard' 
                    ? 'text-white bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-white/5' 
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => router.push('/login')} className="text-slate-300 hover:text-white hover:bg-white/10">
              Log in
            </Button>
            <Button size="sm" variant="glow" onClick={() => router.push('/register')} className="shadow-lg shadow-blue-500/20">
              Start Learning
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
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
        <div className="absolute top-full left-0 right-0 mt-2 px-4 md:hidden animate-fade-in-up">
          <div className="p-4 space-y-2 bg-[#0f0f0f]/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl">
            {navLinks.map((item) => (
              <Link 
                key={item.name}
                href={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-xl text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                {item.name}
              </Link>
            ))}
            <div className="h-px bg-white/10 my-4" />
            <div className="flex flex-col gap-3">
               <Button variant="outline" className="w-full justify-center" onClick={() => { setIsMobileMenuOpen(false); router.push('/login'); }}>Log In</Button>
               <Button variant="glow" className="w-full justify-center" onClick={() => { setIsMobileMenuOpen(false); router.push('/register'); }}>Join Now</Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
