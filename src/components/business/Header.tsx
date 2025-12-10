'use client'

import { useState } from 'react'
import { Search, Zap, Bell, Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'

import { UserNav } from '@/components/business/UserNav'

export function Header() {
  const { setTheme, theme } = useTheme()
  const [lang, setLang] = useState<'en' | 'zh'>('en')

  const toggleLang = () => {
    setLang(prev => prev === 'en' ? 'zh' : 'en')
  }

  // Placeholder user object
  const user = {
    username: 'Alex Student',
    email: 'alex@example.com',
    avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=2669&auto=format&fit=crop',
  }

  return (
    <header className="h-20 flex items-center justify-between px-4 sm:px-8 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200 dark:border-white/5 transition-colors duration-300">
      
      {/* Left: Search (Hidden on mobile) */}
      <div className="flex items-center flex-1 max-w-2xl pl-12 lg:pl-0"> 
        {/* pl-12 is to make space for the absolute mobile menu trigger in Sidebar */}
        <div className="relative w-full max-w-md hidden md:block group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input 
            type="text" 
            className="block w-full pl-10 sm:text-sm bg-slate-100 dark:bg-[#0a0a0a] border border-transparent dark:border-white/10 rounded-xl py-2.5 text-slate-900 dark:text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-[#0a0a0a] transition-all" 
            placeholder="Search..." 
          />
        </div>
      </div>
      
      {/* Right: Actions */}
      <div className="flex items-center gap-3">
         {/* Streak */}
         <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-orange-50 dark:bg-orange-500/10 rounded-full border border-orange-200 dark:border-orange-500/20">
           <Zap className="h-3.5 w-3.5 text-orange-500 dark:text-orange-400 fill-orange-500 dark:fill-orange-400" />
           <span className="text-xs font-bold text-orange-600 dark:text-orange-400">12 Day Streak</span>
        </div>

        {/* Theme Toggle */}
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </button>

         {/* Language Toggle */}
         <button 
          onClick={toggleLang}
          className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors flex items-center justify-center font-bold text-xs w-9 h-9 border border-slate-200 dark:border-white/10"
        >
          {lang === 'en' ? 'EN' : '中'}
        </button>

        {/* Notification */}
        <button className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white dark:border-[#020617]"></span>
        </button>
        
        <div className="h-8 w-px bg-slate-200 dark:bg-white/10 mx-1"></div>
        
        {/* User Nav */}
        <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 p-1.5 rounded-xl transition-colors">
          <UserNav user={user} showDetails={true} /> 
        </div>
      </div>
    </header>
  )
}