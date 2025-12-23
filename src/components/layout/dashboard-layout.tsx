"use client";

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen, LayoutDashboard, PenTool, MessageCircle,
  Settings, LogOut, Trophy, ChevronRight
} from 'lucide-react';
import { useApp } from '@/providers/app-provider';
import { logoutAction } from '@/actions/auth';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const SidebarItem = ({ icon: Icon, label, active = false, onClick }: SidebarItemProps) => (
  <button 
    onClick={onClick}
    className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-200 group relative overflow-hidden ${
      active 
        ? 'text-blue-600 dark:text-white bg-blue-50 dark:bg-slate-800' 
        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
    }`}
  >
    {active && (
      <div className="absolute inset-0 border-l-4 border-blue-500 bg-gradient-to-r from-blue-100/50 to-transparent dark:from-blue-600/10 dark:to-transparent" />
    )}
    <div className="flex items-center justify-center w-5 h-5 mr-3 relative z-10 shrink-0">
      <Icon className={`w-full h-full ${active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'}`} />
    </div>
    <span className="relative z-10">{label}</span>
  </button>
);

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentView: string;
  onNavigate: (view: string) => void;
  userRole?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, currentView, onNavigate, userRole }) => {
  const { t } = useApp();
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  const isParent = userRole === 'PARENT';

  const menuItems = isParent ? [
    { id: 'parent', icon: LayoutDashboard, label: t.sidebar.dashboard },
  ] : [
    { id: 'dashboard', icon: LayoutDashboard, label: t.sidebar.dashboard },
    { id: 'courses', icon: BookOpen, label: t.sidebar.courses },
    { id: 'questionBank', icon: PenTool, label: t.sidebar.practice },
    { id: 'leaderboard', icon: Trophy, label: t.sidebar.leaderboard },
    { id: 'community', icon: MessageCircle, label: t.sidebar.community },
  ];

  return (
    <div className="h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 flex text-slate-900 dark:text-white font-sans transition-colors duration-300">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-out lg:relative lg:translate-x-0 lg:block shadow-xl lg:shadow-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center h-20 px-6 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate(isParent ? 'parent' : 'dashboard')}>
             <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                <BookOpen className="h-4 w-4 text-white" />
             </div>
             <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">LearnMore</span>
          </div>
        </div>
        
        {/* Nav Items - Scrollable Area */}
        <div className="h-[calc(100vh-5rem)] overflow-y-auto px-4 pt-4 pb-40 space-y-1">
          {menuItems.map(item => (
            <SidebarItem 
              key={item.id}
              icon={item.icon} 
              label={item.label} 
              active={currentView === item.id} 
              onClick={() => { onNavigate(item.id); setSidebarOpen(false); }} 
            />
          ))}
          
          {/* Achievement Card - Only for students */}
          {!isParent && (
            <div onClick={() => { onNavigate('achievements'); setSidebarOpen(false); }} className="mt-8 p-4 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 relative overflow-hidden group cursor-pointer hover:border-blue-500/50 transition-all shadow-lg shrink-0">
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-1">
                    <h4 className="font-bold text-sm text-white">{t.dashboard.level} 12</h4>
                    <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-white transition-colors" />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>1,250 XP</span>
                  <span>/ 2,000</span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-blue-500 h-1.5 rounded-full w-[65%] shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Section - ABSOLUTELY POSITIONED */}
        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 z-20 space-y-1">
           <SidebarItem icon={Settings} label={t.sidebar.settings} active={currentView === 'settings'} onClick={() => { onNavigate('settings'); setSidebarOpen(false); }} />
           <SidebarItem icon={LogOut} label={t.sidebar.logout} onClick={handleLogout} />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 overflow-y-auto p-4 sm:p-8 scroll-smooth ${currentView === 'dashboard' ? 'snap-y snap-mandatory' : ''}`}>
         {/* Mobile Menu Trigger */}
         <div className="lg:hidden mb-4">
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            </button>
         </div>
         {children}
      </main>
    </div>
  );
};
