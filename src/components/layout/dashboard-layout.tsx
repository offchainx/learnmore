'use client'

import React, { useState, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  BookOpen,
  LayoutDashboard,
  PenTool,
  MessageCircle,
  Settings,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Upload,
  CheckSquare,
  AlertCircle,
  ChevronDown,
  Users,
  Rocket,
} from 'lucide-react'
import { useApp } from '@/providers'
import { logoutAction } from '@/actions/user/auth'
import { TrialBanner } from './TrialBanner'
import { NotificationBell } from '../notification/NotificationBell'
import { calculateLevel, calculateNextLevelXp } from '@/lib/gamification'

interface SidebarItemProps {
  icon: React.ElementType
  label: string
  active?: boolean
  onClick?: () => void
  indent?: boolean
}

const SidebarItem = ({
  icon: Icon,
  label,
  active = false,
  onClick,
  indent = false,
}: SidebarItemProps) => (
  <button
    onClick={onClick}
    className={`flex w-full items-center ${indent ? 'pl-8 pr-4' : 'px-4'} group relative overflow-hidden rounded-2xl py-3 text-sm font-medium transition-all duration-200 ${
      active
        ? 'bg-blue-50 text-blue-600 dark:bg-slate-800 dark:text-white'
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white'
    }`}
  >
    {active && (
      <div className="absolute inset-0 border-l-4 border-blue-500 bg-gradient-to-r from-blue-100/50 to-transparent dark:from-blue-600/10 dark:to-transparent" />
    )}
    <div className="relative z-10 mr-3 flex h-5 w-5 shrink-0 items-center justify-center">
      <Icon
        className={`h-full w-full ${active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-slate-300'}`}
      />
    </div>
    <span className="relative z-10">{label}</span>
  </button>
)

interface SidebarSectionProps {
  icon: React.ElementType
  label: string
  children: React.ReactNode
  isExpanded: boolean
  onToggle: () => void
  isActive: boolean
}

const SidebarSection = ({
  icon: Icon,
  label,
  children,
  isExpanded,
  onToggle,
  isActive,
}: SidebarSectionProps) => (
  <div className="space-y-1">
    <button
      onClick={onToggle}
      className={`group relative flex w-full items-center overflow-hidden rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'bg-blue-50 text-blue-600 dark:bg-slate-800 dark:text-white'
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white'
      }`}
    >
      {isActive && (
        <div className="absolute inset-0 border-l-4 border-blue-500 bg-gradient-to-r from-blue-100/50 to-transparent dark:from-blue-600/10 dark:to-transparent" />
      )}
      <div className="relative z-10 mr-3 flex h-5 w-5 shrink-0 items-center justify-center">
        <Icon
          className={`h-full w-full ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-slate-300'}`}
        />
      </div>
      <span className="relative z-10 flex-1 text-left">{label}</span>
      <ChevronDown
        className={`relative z-10 h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
      />
    </button>
    {isExpanded && <div className="mt-1 space-y-1">{children}</div>}
  </div>
)

interface DashboardLayoutProps {
  children: React.ReactNode
  currentView: string
  onNavigate: (view: string) => void
  userRole?: string
  userXp?: number | null
  subscriptionTier?: string | null
  subscriptionEnd?: Date | string | null
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  currentView,
  onNavigate,
  userRole,
  userXp,
  subscriptionTier,
  subscriptionEnd,
}) => {
  const { t } = useApp()
  const router = useRouter()
  const pathname = usePathname()
  const isUserAdminRoute =
    pathname?.startsWith('/admin/users') ||
    pathname?.startsWith('/admin/feedback') ||
    pathname?.startsWith('/admin/referrals') ||
    pathname?.startsWith('/admin/vouchers') ||
    false
  const isContentAdminRoute = pathname?.startsWith('/admin/content') || false
  const isAnyAdminRoute = pathname?.startsWith('/admin') || false
  const isPracticeRoute = pathname?.startsWith('/dashboard/practice') || false
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const [isUserAdminExpanded, setIsUserAdminExpanded] = useState(false)
  const [isContentAdminExpanded, setIsContentAdminExpanded] = useState(false)
  const [, startTransition] = useTransition()
  const effectiveUserAdminExpanded = isUserAdminRoute || isUserAdminExpanded
  const effectiveContentAdminExpanded =
    isContentAdminRoute || isContentAdminExpanded

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction()
    })
  }

  const isParent = userRole === 'PARENT'
  const isAdmin = userRole === 'ADMIN' || userRole === 'TEACHER'
  const effectiveTier = (subscriptionTier || 'STARTER').toUpperCase()
  const resolvedXp = userXp ?? 0
  const resolvedLevel = calculateLevel(resolvedXp)
  const resolvedNextLevelXp = calculateNextLevelXp(resolvedLevel)
  const levelProgress = Math.max(
    0,
    Math.min(
      100,
      Math.round((resolvedXp / Math.max(1, resolvedNextLevelXp)) * 100)
    )
  )
  const tierLabelMap: Record<string, string> = {
    STARTER: 'Starter',
    STANDARD: 'Standard',
    SMART_PLUS: 'Smart Plus',
    PREMIER: 'Premier',
  }
  const tierLabel = tierLabelMap[effectiveTier] || 'Starter'

  // Check if any admin route is active
  const isAdminDashboardActive = pathname === '/admin'
  const isUserAdminActive = isUserAdminRoute
  const isContentAdminActive = isContentAdminRoute

  const menuItems = isParent
    ? [{ id: 'parent', icon: LayoutDashboard, label: t.sidebar.dashboard }]
    : [
        { id: 'dashboard', icon: LayoutDashboard, label: t.sidebar.dashboard },
        { id: 'courses', icon: BookOpen, label: t.sidebar.courses },
        { id: 'questionBank', icon: PenTool, label: t.sidebar.practice },
        { id: 'community', icon: MessageCircle, label: t.sidebar.community },
      ]

  const adminUserSubItems = [
    {
      id: 'admin-users',
      icon: Users,
      label: t.sidebar.adminUsers,
      href: '/admin/users',
    },
    {
      id: 'admin-feedback',
      icon: MessageCircle,
      label: t.sidebar.adminFeedback,
      href: '/admin/feedback',
    },
    {
      id: 'admin-referrals',
      icon: Users,
      label: t.sidebar.adminReferrals,
      href: '/admin/referrals',
    },
  ]

  const adminContentSubItems = [
    {
      id: 'admin-import',
      icon: Upload,
      label: t.sidebar.adminImport,
      href: '/admin/content/import',
    },
    {
      id: 'admin-review',
      icon: CheckSquare,
      label: t.sidebar.adminReview,
      href: '/admin/content/review',
    },
    {
      id: 'admin-reports',
      icon: AlertCircle,
      label: t.sidebar.adminReports,
      href: '/admin/content/reports',
    },
  ]

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white">
      <div className="pointer-events-none fixed right-4 top-4 z-[70] hidden lg:block xl:right-6">
        <div className="pointer-events-auto rounded-2xl border border-slate-200/70 bg-white/80 p-1.5 shadow-[0_14px_36px_rgba(15,23,42,0.18)] backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-900/80">
          <NotificationBell />
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-72 transform border-r border-slate-200 bg-white shadow-xl transition-transform duration-300 ease-out dark:border-slate-800 dark:bg-slate-900 lg:relative lg:block lg:translate-x-0 lg:shadow-none ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} `}
      >
        <div className="flex h-20 flex-shrink-0 items-center border-b border-slate-100 px-6 dark:border-slate-800">
          <div
            className="flex cursor-pointer items-center gap-3"
            onClick={() => onNavigate(isParent ? 'parent' : 'dashboard')}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-lg shadow-blue-600/20">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                LearnMore
              </span>
              <span className="w-fit rounded-full border border-blue-500/20 bg-blue-500/15 px-2 py-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-300">
                {tierLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Nav Items - Scrollable Area */}
        <div className="h-[calc(100vh-5rem)] space-y-1 overflow-y-auto px-4 pb-40 pt-4">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={currentView === item.id}
              onClick={() => {
                onNavigate(item.id)
                setSidebarOpen(false)
              }}
            />
          ))}

          {!isParent && (
            <button
              onClick={() => {
                router.push('/pricing')
                setSidebarOpen(false)
              }}
              className="mt-4 w-full rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 px-4 py-4 text-left transition-all hover:border-blue-400"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20">
                  <Rocket className="h-4 w-4 text-blue-300" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">
                    Upgrade
                  </div>
                  <div className="mt-0.5 text-xs text-slate-300">
                    升级套餐，解锁更多功能
                  </div>
                </div>
              </div>
            </button>
          )}

          {/* Admin Section - Only for ADMIN and TEACHER */}
          {isAdmin && (
            <>
              <div className="mb-3 mt-6 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600">
                Administration
              </div>

              <SidebarItem
                icon={LayoutDashboard}
                label={t.sidebar.adminDashboard}
                active={isAdminDashboardActive}
                onClick={() => {
                  router.push('/admin')
                  setSidebarOpen(false)
                }}
              />

              <SidebarSection
                icon={Users}
                label={t.sidebar.adminUser}
                isExpanded={effectiveUserAdminExpanded}
                onToggle={() =>
                  setIsUserAdminExpanded(!effectiveUserAdminExpanded)
                }
                isActive={isUserAdminActive}
              >
                {adminUserSubItems.map((subItem) => (
                  <SidebarItem
                    key={subItem.id}
                    icon={subItem.icon}
                    label={subItem.label}
                    active={pathname === subItem.href}
                    onClick={() => {
                      router.push(subItem.href)
                      setSidebarOpen(false)
                    }}
                    indent
                  />
                ))}
              </SidebarSection>

              <SidebarSection
                icon={ShieldCheck}
                label={t.sidebar.adminContent}
                isExpanded={effectiveContentAdminExpanded}
                onToggle={() =>
                  setIsContentAdminExpanded(!effectiveContentAdminExpanded)
                }
                isActive={isContentAdminActive}
              >
                {adminContentSubItems.map((subItem) => (
                  <SidebarItem
                    key={subItem.id}
                    icon={subItem.icon}
                    label={subItem.label}
                    active={pathname === subItem.href}
                    onClick={() => {
                      router.push(subItem.href)
                      setSidebarOpen(false)
                    }}
                    indent
                  />
                ))}
              </SidebarSection>
            </>
          )}

          {/* Achievement Card - Only for students */}
          {!isParent && (
            <div
              onClick={() => {
                onNavigate('leaderboard')
                setSidebarOpen(false)
              }}
              className={`group relative mt-8 shrink-0 cursor-pointer overflow-hidden rounded-2xl border bg-gradient-to-br p-4 shadow-lg transition-all ${
                currentView === 'leaderboard' ||
                pathname?.startsWith('/dashboard/leaderboard')
                  ? 'border-blue-500/60 from-blue-950 to-slate-900 shadow-[0_18px_50px_rgba(37,99,235,0.24)]'
                  : 'border-slate-700/50 from-slate-800 to-slate-900 hover:border-blue-500/50'
              }`}
            >
              <div className="relative z-10">
                <div className="mb-1 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">
                    {t.dashboard.level} {resolvedLevel}
                  </h4>
                  <ChevronRight className="h-3 w-3 text-slate-400 transition-colors group-hover:text-white" />
                </div>
                <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                  <span>{resolvedXp.toLocaleString()} XP</span>
                  <span>/ {resolvedNextLevelXp.toLocaleString()}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-700/50">
                  <div
                    className="h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                    style={{ width: `${Math.max(4, levelProgress)}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Section - ABSOLUTELY POSITIONED */}
        <div className="absolute bottom-0 left-0 z-20 w-full space-y-1 border-t border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
          <SidebarItem
            icon={Settings}
            label={t.sidebar.settings}
            active={currentView === 'settings'}
            onClick={() => {
              router.push('/dashboard/settings')
              setSidebarOpen(false)
            }}
          />
          <SidebarItem
            icon={LogOut}
            label={t.sidebar.logout}
            onClick={handleLogout}
          />
        </div>
      </aside>

      {/* Main Content Area */}
      <main
        className={`flex-1 overflow-y-auto scroll-smooth ${
          isAnyAdminRoute
            ? 'p-2 sm:p-4'
            : isPracticeRoute
              ? 'px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-4'
              : 'p-4 sm:p-8'
        } ${currentView === 'dashboard' ? 'snap-y snap-mandatory' : ''}`}
      >
        <TrialBanner
          subscriptionTier={subscriptionTier || null}
          subscriptionEnd={subscriptionEnd || null}
        />

        {/* Top Header Bar */}
        {isPracticeRoute ? (
          <div className="mb-2 flex items-center justify-between lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 transition-all hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </button>
          </div>
        ) : (
          <div
            className={
              isAnyAdminRoute ? 'mb-2 flex lg:mb-3' : 'mb-2 flex items-center'
            }
          >
            <div className="flex items-center gap-4">
              {/* Mobile Menu Trigger */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 transition-all hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 lg:hidden"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="4" x2="20" y1="12" y2="12" />
                  <line x1="4" x2="20" y1="6" y2="6" />
                  <line x1="4" x2="20" y1="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {children}
      </main>
    </div>
  )
}
