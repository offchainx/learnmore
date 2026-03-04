"use client";

import React, { useState, useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  BookOpen, LayoutDashboard, PenTool, MessageCircle,
  Settings, LogOut, Trophy, ChevronRight, ShieldCheck,
  Upload, CheckSquare, BarChart, AlertCircle, ChevronDown, Users, Rocket, Ticket
} from 'lucide-react';
import { useApp } from '@/providers';
import { logoutAction } from '@/actions/user/auth';
import { TrialBanner } from './TrialBanner';
import { NotificationBell } from '../notification/NotificationBell';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
  indent?: boolean;
}

const SidebarItem = ({ icon: Icon, label, active = false, onClick, indent = false }: SidebarItemProps) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full ${indent ? 'pl-8 pr-4' : 'px-4'} py-3 text-sm font-medium rounded-2xl transition-all duration-200 group relative overflow-hidden ${
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

interface SidebarSectionProps {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  isActive: boolean;
}

const SidebarSection = ({ icon: Icon, label, children, isExpanded, onToggle, isActive }: SidebarSectionProps) => (
  <div className="space-y-1">
    <button
      onClick={onToggle}
      className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-200 group relative overflow-hidden ${
        isActive
          ? 'text-blue-600 dark:text-white bg-blue-50 dark:bg-slate-800'
          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
      }`}
    >
      {isActive && (
        <div className="absolute inset-0 border-l-4 border-blue-500 bg-gradient-to-r from-blue-100/50 to-transparent dark:from-blue-600/10 dark:to-transparent" />
      )}
      <div className="flex items-center justify-center w-5 h-5 mr-3 relative z-10 shrink-0">
        <Icon className={`w-full h-full ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'}`} />
      </div>
      <span className="relative z-10 flex-1 text-left">{label}</span>
      <ChevronDown className={`w-4 h-4 relative z-10 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
    </button>
    {isExpanded && (
      <div className="space-y-1 mt-1">
        {children}
      </div>
    )}
  </div>
);

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentView: string;
  onNavigate: (view: string) => void;
  userRole?: string;
  subscriptionTier?: string | null;
  subscriptionEnd?: Date | string | null;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  currentView, 
  onNavigate, 
  userRole,
  subscriptionTier,
  subscriptionEnd
}) => {
  const { t } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const isUserAdminRoute = pathname?.startsWith('/admin/users')
    || pathname?.startsWith('/admin/permissions')
    || pathname?.startsWith('/admin/feedback')
    || pathname?.startsWith('/admin/referrals')
    || false;
  const isContentAdminRoute = pathname?.startsWith('/admin/content')
    || pathname?.startsWith('/admin/vouchers')
    || false;
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isUserAdminExpanded, setIsUserAdminExpanded] = useState(false);
  const [isContentAdminExpanded, setIsContentAdminExpanded] = useState(false);
  const [, startTransition] = useTransition();
  const effectiveUserAdminExpanded = isUserAdminRoute || isUserAdminExpanded;
  const effectiveContentAdminExpanded = isContentAdminRoute || isContentAdminExpanded;

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  const isParent = userRole === 'PARENT';
  const isAdmin = userRole === 'ADMIN' || userRole === 'TEACHER';
  const effectiveTier = (subscriptionTier || 'STARTER').toUpperCase();
  const tierLabelMap: Record<string, string> = {
    STARTER: 'Starter',
    STANDARD: 'Standard',
    SMART_PLUS: 'Smart Plus',
    PREMIER: 'Premier',
  };
  const tierLabel = tierLabelMap[effectiveTier] || 'Starter';

  // Check if any admin route is active
  const isAdminDashboardActive = pathname === '/admin';
  const isUserAdminActive = isUserAdminRoute;
  const isContentAdminActive = isContentAdminRoute;

  const menuItems = isParent ? [
    { id: 'parent', icon: LayoutDashboard, label: t.sidebar.dashboard },
  ] : [
    { id: 'dashboard', icon: LayoutDashboard, label: t.sidebar.dashboard },
    { id: 'courses', icon: BookOpen, label: t.sidebar.courses },
    { id: 'questionBank', icon: PenTool, label: t.sidebar.practice },
    { id: 'leaderboard', icon: Trophy, label: t.sidebar.leaderboard },
    { id: 'community', icon: MessageCircle, label: t.sidebar.community },
  ];

  const adminUserSubItems = [
    { id: 'admin-users', icon: Users, label: t.sidebar.adminUsers, href: '/admin/users' },
    { id: 'admin-permissions', icon: ShieldCheck, label: t.sidebar.adminPermissions, href: '/admin/permissions' },
    { id: 'admin-feedback', icon: MessageCircle, label: t.sidebar.adminFeedback, href: '/admin/feedback' },
    { id: 'admin-referrals', icon: Users, label: t.sidebar.adminReferrals, href: '/admin/referrals' },
  ];

  const adminContentSubItems = [
    { id: 'admin-import', icon: Upload, label: t.sidebar.adminImport, href: '/admin/content/import' },
    { id: 'admin-review', icon: CheckSquare, label: t.sidebar.adminReview, href: '/admin/content/review' },
    { id: 'admin-stats', icon: BarChart, label: t.sidebar.adminStats, href: '/admin/content/statistics' },
    { id: 'admin-reports', icon: AlertCircle, label: t.sidebar.adminReports, href: '/admin/content/reports' },
    { id: 'admin-vouchers', icon: Ticket, label: 'Voucher 管理', href: '/admin/vouchers' },
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
             <div className="flex flex-col">
               <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">LearnMore</span>
               <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full w-fit bg-blue-500/15 text-blue-600 dark:text-blue-300 border border-blue-500/20">
                 {tierLabel}
               </span>
             </div>
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

          {!isParent && (
            <button
              onClick={() => {
                router.push('/pricing');
                setSidebarOpen(false);
              }}
              className="mt-4 w-full rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 px-4 py-4 text-left hover:border-blue-400 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Rocket className="w-4 h-4 text-blue-300" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Upgrade</div>
                  <div className="text-xs text-slate-300 mt-0.5">升级套餐，解锁更多功能</div>
                </div>
              </div>
            </button>
          )}

          {/* Admin Section - Only for ADMIN and TEACHER */}
          {isAdmin && (
            <>
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest mt-6 mb-3 px-4">Administration</div>

              <SidebarItem
                icon={LayoutDashboard}
                label={t.sidebar.adminDashboard}
                active={isAdminDashboardActive}
                onClick={() => {
                  router.push('/admin');
                  setSidebarOpen(false);
                }}
              />
              
              <SidebarSection
                icon={Users}
                label={t.sidebar.adminUser}
                isExpanded={effectiveUserAdminExpanded}
                onToggle={() => setIsUserAdminExpanded(!effectiveUserAdminExpanded)}
                isActive={isUserAdminActive}
              >
                {adminUserSubItems.map(subItem => (
                  <SidebarItem
                    key={subItem.id}
                    icon={subItem.icon}
                    label={subItem.label}
                    active={pathname === subItem.href}
                    onClick={() => {
                      router.push(subItem.href);
                      setSidebarOpen(false);
                    }}
                    indent
                  />
                ))}
              </SidebarSection>

              <SidebarSection
                icon={ShieldCheck}
                label={t.sidebar.adminContent}
                isExpanded={effectiveContentAdminExpanded}
                onToggle={() => setIsContentAdminExpanded(!effectiveContentAdminExpanded)}
                isActive={isContentAdminActive}
              >
                {adminContentSubItems.map(subItem => (
                  <SidebarItem
                    key={subItem.id}
                    icon={subItem.icon}
                    label={subItem.label}
                    active={pathname === subItem.href}
                    onClick={() => {
                      router.push(subItem.href);
                      setSidebarOpen(false);
                    }}
                    indent
                  />
                ))}
              </SidebarSection>
            </>
          )}

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
           <SidebarItem icon={Settings} label={t.sidebar.settings} active={currentView === 'settings'} onClick={() => { router.push('/dashboard/settings'); setSidebarOpen(false); }} />
           <SidebarItem icon={LogOut} label={t.sidebar.logout} onClick={handleLogout} />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 overflow-y-auto p-4 sm:p-8 scroll-smooth ${currentView === 'dashboard' ? 'snap-y snap-mandatory' : ''}`}>
         <TrialBanner subscriptionTier={subscriptionTier || null} subscriptionEnd={subscriptionEnd || null} />
         
         {/* Top Header Bar */}
         <div className="flex items-center justify-between mb-6 lg:mb-8">
            <div className="flex items-center gap-4">
               {/* Mobile Menu Trigger */}
               <button 
                  onClick={() => setSidebarOpen(true)} 
                  className="lg:hidden p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-600 transition-all"
               >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
               </button>
               
               {/* Contextual Title (Optional, could be added later) */}
               <h1 className="text-xl font-bold text-slate-900 dark:text-white hidden sm:block capitalize">
                  {currentView === 'dashboard' ? t.sidebar.dashboard : currentView}
               </h1>
            </div>

            <div className="flex items-center gap-3">
               <NotificationBell />
            </div>
         </div>

         {children}
      </main>
    </div>
  );
};
