'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/actions/auth'
import {
  Menu, BookOpen, LayoutDashboard, PenTool, BookMarked,
  Trophy, MessageCircle, Settings, LogOut
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
}

const mainNavItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'My Courses', href: '/dashboard/courses', icon: BookOpen },
  { title: 'Question Bank', href: '/dashboard/questions', icon: PenTool },
  { title: 'Mistake Book', href: '/dashboard/mistakes', icon: BookMarked },
  { title: 'Leaderboard', href: '/dashboard/leaderboard', icon: Trophy },
  { title: 'Community', href: '/dashboard/community', icon: MessageCircle },
]

const SidebarContent = ({ onClose }: { onClose?: () => void }) => {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
      if (onClose) onClose();
    });
  };

  return (
    <div className="flex h-full flex-col bg-white dark:bg-[#050505] text-slate-900 dark:text-white">
      {/* Header / Logo */}
      <div className="flex h-20 items-center px-6 border-b border-slate-100 dark:border-white/5">
        <Link href="/" className="flex items-center gap-3" onClick={onClose}>
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
            <BookOpen className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">LearnMore</span>
        </Link>
      </div>

      {/* Main Navigation */}
      <ScrollArea className="flex-1 px-4 py-6">
        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-3 px-4">Menu</div>
        <div className="space-y-1">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.title}
                href={item.href}
                onClick={onClose}
                className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-200 group relative overflow-hidden ${
                  isActive 
                    ? 'text-blue-600 dark:text-white bg-blue-50 dark:bg-white/10' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <div className="absolute inset-0 border-l-4 border-blue-500 bg-gradient-to-r from-blue-100/50 to-transparent dark:from-blue-600/10 dark:to-transparent" />
                )}
                <div className="flex items-center justify-center w-5 h-5 mr-3 relative z-10">
                  <item.icon className={`w-full h-full ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'}`} />
                </div>
                <span className="relative z-10 leading-none pt-[1px]">{item.title}</span>
              </Link>
            )
          })}
        </div>
      </ScrollArea>

      {/* Bottom Section: Account & Logout */}
      <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#050505]">
        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-2 px-4">Account</div>
        <Link
          href="/dashboard/settings"
          onClick={onClose}
          className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-200 group relative overflow-hidden text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
        >
           <div className="flex items-center justify-center w-5 h-5 mr-3 relative z-10">
             <Settings className="w-full h-full text-slate-500 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300" />
           </div>
           <span className="relative z-10 leading-none pt-[1px]">Settings</span>
        </Link>
        <button
          onClick={handleLogout}
          disabled={isPending}
          className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-200 group relative overflow-hidden text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
           <div className="flex items-center justify-center w-5 h-5 mr-3 relative z-10">
             <LogOut className="w-full h-full text-slate-500 dark:text-slate-500 group-hover:text-red-600 dark:group-hover:text-red-400" />
           </div>
           <span className="relative z-10 leading-none pt-[1px]">{isPending ? 'Logging out...' : 'Log Out'}</span>
        </button>

        {/* Level Progress Card */}
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border border-indigo-100 dark:border-white/5 relative overflow-hidden group cursor-pointer">
          <div className="relative z-10">
            <h4 className="font-bold text-sm mb-1 text-indigo-900 dark:text-white">Level 12</h4>
            <div className="flex items-center justify-between text-xs text-indigo-700 dark:text-slate-400 mb-2">
              <span>1,250 XP</span>
              <span>/ 2,000</span>
            </div>
            <div className="w-full bg-white dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div className="bg-blue-500 h-1.5 rounded-full w-[65%]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AppSidebar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="lg:hidden absolute left-4 top-4 z-40">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-lg text-slate-500">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 border-r-0">
          <SidebarContent onClose={() => setIsOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-white dark:bg-[#050505] lg:block w-72 h-screen sticky top-0 border-slate-200 dark:border-white/5">
        <SidebarContent />
      </div>
    </>
  )
}