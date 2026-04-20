'use client'

import React from 'react'
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
  Loader2,
  Sparkles,
} from 'lucide-react'
import { useApp } from '@/providers'
import { logoutAction } from '@/actions/user/auth'
import { TrialBanner } from './TrialBanner'
import { NotificationBell } from '../notification/NotificationBell'
import { calculateLevel, calculateNextLevelXp } from '@/lib/gamification'
import { usePendingNavigation, useRoutePrefetch } from '@/lib/hooks'
import {
  type DashboardView,
  getDashboardRoute,
  isDashboardViewActive,
  dashboardViewRoutes,
  normalizeDashboardView,
  parentDashboardNavItems,
  studentDashboardNavItems,
} from './dashboard-nav'

interface SidebarItemProps {
  icon: React.ElementType
  label: string
  active?: boolean
  onClick?: () => void
  indent?: boolean
  pending?: boolean
  disabled?: boolean
}

const SidebarItem = ({
  icon: Icon,
  label,
  active = false,
  onClick,
  indent = false,
  pending = false,
  disabled = false,
}: SidebarItemProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-busy={pending || undefined}
    className={`flex w-full items-center ${indent ? 'pl-8 pr-4' : 'px-4'} group relative overflow-hidden rounded-xl py-3 text-sm font-medium transition-colors duration-200 ${
      active
        ? 'border border-borderTone bg-[hsl(var(--state-info-bg))]/70 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] dark:border-borderTone dark:bg-[hsl(var(--state-info-bg))]/16 dark:text-text-primary dark:shadow-none'
        : 'border border-transparent text-text-secondary hover:border-borderTone/80 hover:bg-surface hover:text-text-primary dark:text-text-secondary dark:hover:border-borderTone dark:hover:bg-surface-subtle dark:hover:text-text-primary'
    } ${disabled ? 'cursor-not-allowed' : ''}`}
  >
    <div className="relative z-10 mr-3 flex h-5 w-5 shrink-0 items-center justify-center">
      {pending ? (
        <Loader2 className="h-full w-full animate-spin text-primary dark:text-primary" />
      ) : (
        <Icon
          className={`h-full w-full transition-all duration-200 ${
            active
              ? 'text-primary dark:text-primary'
              : 'text-text-tertiary group-hover:text-primary dark:text-text-tertiary dark:group-hover:text-primary'
          }`}
        />
      )}
    </div>
    <span className="relative z-10">{label}</span>
  </button>
)

const SectionLabel = ({ label }: { label: string }) => (
  <div className="px-2 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-text-tertiary dark:text-text-tertiary">
    {label}
  </div>
)

interface SidebarSectionProps {
  icon: React.ElementType
  label: string
  children: React.ReactNode
  isExpanded: boolean
  onToggle: () => void
  isActive: boolean
  disabled?: boolean
}

const SidebarSection = ({
  icon: Icon,
  label,
  children,
  isExpanded,
  onToggle,
  isActive,
  disabled = false,
}: SidebarSectionProps) => (
  <div className="space-y-1">
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`group relative flex w-full items-center overflow-hidden rounded-xl px-4 py-3 text-sm font-medium transition-colors duration-200 ${
        isActive
          ? 'border border-borderTone bg-[hsl(var(--state-info-bg))]/70 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] dark:border-borderTone dark:bg-[hsl(var(--state-info-bg))]/16 dark:text-text-primary dark:shadow-none'
          : 'border border-transparent text-text-secondary hover:border-borderTone/80 hover:bg-surface hover:text-text-primary dark:text-text-secondary dark:hover:border-borderTone dark:hover:bg-surface-subtle dark:hover:text-text-primary'
      } ${disabled ? 'cursor-not-allowed' : ''}`}
    >
      <div className="relative z-10 mr-3 flex h-5 w-5 shrink-0 items-center justify-center">
        <Icon
          className={`h-full w-full transition-all duration-200 ${
            isActive
              ? 'text-primary dark:text-primary'
              : 'text-text-tertiary group-hover:text-primary dark:text-text-tertiary dark:group-hover:text-primary'
          }`}
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
  currentView: DashboardView
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
  const { t, lang } = useApp()
  const router = useRouter()
  const pathname = usePathname()
  const isUserAdminRoute =
    pathname?.startsWith('/admin/users') ||
    pathname?.startsWith('/admin/feedback') ||
    pathname?.startsWith('/admin/referrals') ||
    false
  const isRewardsAdminRoute = pathname?.startsWith('/admin/rewards') || false
  const isRewardsAdminVisible = userRole === 'ADMIN'
  const isContentAdminRoute = pathname?.startsWith('/admin/content') || false
  const isAnyAdminRoute = pathname?.startsWith('/admin') || false
  const isPracticeRoute = pathname?.startsWith('/dashboard/practice') || false
  const [isSidebarOpen, setSidebarOpen] = React.useState(false)
  const [isUserAdminExpanded, setIsUserAdminExpanded] = React.useState(false)
  const [isContentAdminExpanded, setIsContentAdminExpanded] = React.useState(false)
  const [isMounted, setIsMounted] = React.useState(false)
  const [isLogoutPending, startLogoutTransition] = React.useTransition()
  const {
    isPending: isNavPending,
    pendingTarget,
    runNavigation,
  } = usePendingNavigation()
  const effectiveUserAdminExpanded =
    isUserAdminExpanded || (isMounted && isUserAdminRoute)
  const effectiveContentAdminExpanded =
    isContentAdminExpanded || (isMounted && isContentAdminRoute)

  const handleLogout = () => {
    startLogoutTransition(async () => {
      await logoutAction()
    })
  }

  const handleViewNavigation = (view: DashboardView) => {
    runNavigation(`view:${view}`, () => {
      onNavigate(view)
      setSidebarOpen(false)
    })
  }

  const handleRouteNavigation = (href: string) => {
    runNavigation(`route:${href}`, () => {
      router.push(href)
      setSidebarOpen(false)
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
  const copy = (zh: string, en: string, ms?: string) => {
    if (lang === 'zh') return zh
    if (lang === 'ms') return ms ?? en
    return en
  }
  const normalizedCurrentView = normalizeDashboardView(currentView)
  const isSidebarLocked = isNavPending || isLogoutPending
  React.useEffect(() => {
    setIsMounted(true)
  }, [])
  useRoutePrefetch({
    routes: [
      dashboardViewRoutes.dashboard,
      dashboardViewRoutes.courses,
      dashboardViewRoutes.practice,
      dashboardViewRoutes.community,
      dashboardViewRoutes.leaderboard,
      dashboardViewRoutes.achievements,
      dashboardViewRoutes.settings,
      !isParent ? '/pricing' : null,
      isAdmin ? '/admin' : null,
      isAdmin ? '/admin/users' : null,
      isAdmin ? '/admin/feedback' : null,
      isAdmin ? '/admin/referrals' : null,
      isRewardsAdminVisible ? '/admin/rewards' : null,
      isAdmin ? '/admin/content/import' : null,
      isAdmin ? '/admin/content/review' : null,
      isAdmin ? '/admin/content/reports' : null,
    ],
  })

  // Check if any admin route is active
  const isAdminDashboardActive = pathname === '/admin'
  const isUserAdminActive = isUserAdminRoute
  const isRewardsAdminActive = isRewardsAdminRoute
  const isContentAdminActive = isContentAdminRoute
  const isSettingsActive = isDashboardViewActive(
    'settings',
    pathname,
    normalizedCurrentView
  )

  const menuItems = (isParent
    ? parentDashboardNavItems
    : studentDashboardNavItems
  ).map((item) => ({
    ...item,
    label:
      item.id === 'dashboard' || item.id === 'parent'
        ? t.sidebar.dashboard
        : item.id === 'courses'
          ? t.sidebar.courses
          : item.id === 'practice'
            ? t.sidebar.practice
            : t.sidebar.community,
  }))

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
    <div className="dashboard-shell flex h-screen min-w-0 overflow-hidden bg-page font-sans text-text-primary transition-colors duration-300 dark:bg-page dark:text-white">
      <div className="pointer-events-none fixed right-4 top-4 z-[70] hidden desktop:block desktop:right-6">
        <div className="pointer-events-auto rounded-xl border border-borderTone/80 bg-surface/92 p-1.5 shadow-surface backdrop-blur-xl dark:border-borderTone dark:bg-surface/92 dark:shadow-none">
          <NotificationBell />
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm desktop:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`dashboard-sidebar-shell fixed left-0 top-0 z-50 flex h-full w-72 shrink-0 transform flex-col border-r border-borderTone/70 bg-page-elevated/95 backdrop-blur-xl transition-transform duration-300 ease-out desktop:relative desktop:flex desktop:translate-x-0 desktop:shadow-none dark:border-borderTone/70 dark:bg-page-elevated/95 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} `}
      >
        <div className="flex h-20 flex-shrink-0 items-center border-b border-borderTone/70 px-6 dark:border-borderTone/70">
          <button
            type="button"
            className="flex cursor-pointer items-center gap-3"
            onClick={() =>
              handleViewNavigation(isParent ? 'parent' : 'dashboard')
            }
            disabled={isSidebarLocked}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/95 shadow-[0_10px_24px_rgba(96,145,235,0.24)]">
              {pendingTarget === `view:${isParent ? 'parent' : 'dashboard'}` ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary-foreground" />
              ) : (
                <BookOpen className="h-4 w-4 text-primary-foreground" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-text-primary dark:text-text-primary">
                LearnMore
              </span>
              <span className="w-fit rounded-full border border-borderTone bg-[hsl(var(--state-info-bg))] px-2.5 py-0.5 text-[10px] font-semibold text-[hsl(var(--state-info-fg))] dark:border-borderTone dark:bg-[hsl(var(--state-info-bg))]/18 dark:text-primary">
                {tierLabel}
              </span>
            </div>
          </button>
        </div>

        {/* Nav Items - Scrollable Area */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <SidebarItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={isDashboardViewActive(
                  item.id,
                  pathname,
                  normalizedCurrentView
                )}
                onClick={() => handleViewNavigation(item.id as DashboardView)}
                pending={pendingTarget === `view:${item.id}`}
                disabled={isSidebarLocked}
              />
            ))}
          </div>

          {/* Admin Section - Only for ADMIN and TEACHER */}
          {isAdmin && (
            <div className="mt-5 space-y-1 border-t border-borderTone/70 pt-3 dark:border-borderTone/70">
              <SectionLabel label={copy('管理', 'Admin', 'Admin')} />

              <SidebarItem
                icon={LayoutDashboard}
                label={t.sidebar.adminDashboard}
                active={isAdminDashboardActive}
                onClick={() => handleRouteNavigation('/admin')}
                pending={pendingTarget === 'route:/admin'}
                disabled={isSidebarLocked}
              />

              <SidebarSection
                icon={Users}
                label={t.sidebar.adminUser}
                isExpanded={effectiveUserAdminExpanded}
                onToggle={() =>
                  setIsUserAdminExpanded(!effectiveUserAdminExpanded)
                }
                isActive={isUserAdminActive}
                disabled={isSidebarLocked}
              >
                {adminUserSubItems.map((subItem) => (
                  <SidebarItem
                    key={subItem.id}
                    icon={subItem.icon}
                    label={subItem.label}
                    active={pathname === subItem.href}
                    onClick={() => handleRouteNavigation(subItem.href)}
                    indent
                    pending={pendingTarget === `route:${subItem.href}`}
                    disabled={isSidebarLocked}
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
                disabled={isSidebarLocked}
              >
                {adminContentSubItems.map((subItem) => (
                  <SidebarItem
                    key={subItem.id}
                    icon={subItem.icon}
                    label={subItem.label}
                    active={pathname === subItem.href}
                    onClick={() => handleRouteNavigation(subItem.href)}
                    indent
                    pending={pendingTarget === `route:${subItem.href}`}
                    disabled={isSidebarLocked}
                  />
                ))}
              </SidebarSection>

              {isRewardsAdminVisible && (
                <SidebarItem
                  icon={Sparkles}
                  label={copy('奖励中心', 'Rewards Center', 'Rewards Center')}
                  active={isRewardsAdminActive}
                  onClick={() => handleRouteNavigation('/admin/rewards')}
                  pending={pendingTarget === 'route:/admin/rewards'}
                  disabled={isSidebarLocked}
                />
              )}
            </div>
          )}

          {!isParent && (
            <div className="mt-5 border-t border-borderTone/70 pt-3 dark:border-borderTone/70">
              <button
                type="button"
                onClick={() => handleRouteNavigation('/pricing')}
                disabled={isSidebarLocked}
                className="group w-full rounded-xl border border-borderTone bg-surface px-4 py-3.5 text-left shadow-surface transition-colors hover:border-[hsl(var(--border-strong))] hover:bg-surface-subtle disabled:cursor-not-allowed dark:border-borderTone dark:bg-surface dark:shadow-none dark:hover:border-[hsl(var(--border-strong))] dark:hover:bg-surface-subtle"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-borderTone bg-[hsl(var(--state-info-bg))] text-[hsl(var(--state-info-fg))] dark:border-borderTone dark:bg-[hsl(var(--state-info-bg))]/18 dark:text-primary">
                    {pendingTarget === 'route:/pricing' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Rocket className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-text-primary dark:text-text-primary">
                      {copy('升级套餐', 'Upgrade', 'Naik taraf')}
                    </div>
                    <div className="mt-0.5 text-xs text-text-secondary dark:text-text-secondary">
                      {copy(
                        '解锁更多训练与 AI 功能',
                        'Unlock more AI and training tools',
                        'Buka lebih banyak alat AI dan latihan'
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-text-tertiary transition-colors group-hover:text-text-primary dark:text-text-tertiary dark:group-hover:text-white" />
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Bottom Section - ABSOLUTELY POSITIONED */}
        <div className="z-20 shrink-0 border-t border-borderTone/70 bg-page-elevated/92 p-4 dark:border-borderTone/70 dark:bg-page-elevated/92">
          <SectionLabel label={copy('账户', 'Account', 'Akaun')} />
          {!isParent && (
            <button
              type="button"
              onClick={() => handleRouteNavigation(getDashboardRoute('leaderboard'))}
              disabled={isSidebarLocked}
              className={`group mb-3 mt-1 w-full cursor-pointer overflow-hidden rounded-xl border p-4 text-left shadow-surface transition-colors ${
                isDashboardViewActive(
                  'leaderboard',
                  pathname,
                  normalizedCurrentView
                )
                  ? 'border-borderTone bg-[hsl(var(--state-info-bg))]/70 dark:border-borderTone dark:bg-[hsl(var(--state-info-bg))]/14'
                  : 'border-borderTone bg-surface hover:border-[hsl(var(--border-strong))] hover:bg-surface-subtle dark:border-borderTone dark:bg-surface dark:shadow-none dark:hover:border-[hsl(var(--border-strong))] dark:hover:bg-surface-subtle'
              } ${isSidebarLocked ? 'cursor-not-allowed' : ''}`}
              aria-busy={
                pendingTarget === `route:${getDashboardRoute('leaderboard')}`
                  ? true
                  : undefined
              }
            >
              <div className="relative z-10">
                <div className="mb-1 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-text-primary dark:text-text-primary">
                    {t.dashboard.level} {resolvedLevel}
                  </h4>
                  {pendingTarget === `route:${getDashboardRoute('leaderboard')}` ? (
                    <Loader2 className="h-3 w-3 animate-spin text-primary dark:text-white" />
                  ) : (
                    <ChevronRight className="h-3 w-3 text-text-tertiary transition-colors group-hover:text-text-primary dark:text-text-tertiary dark:group-hover:text-white" />
                  )}
                </div>
                <div className="mb-2 flex items-center justify-between text-xs text-text-secondary dark:text-text-secondary">
                  <span>{resolvedXp.toLocaleString()} XP</span>
                  <span>/ {resolvedNextLevelXp.toLocaleString()}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-subtle dark:bg-surface-subtle">
                  <div
                    className="h-1.5 rounded-full bg-primary"
                    style={{ width: `${Math.max(4, levelProgress)}%` }}
                  />
                </div>
              </div>
            </button>
          )}
          <div className="space-y-1">
          <SidebarItem
            icon={Settings}
            label={t.sidebar.settings}
            active={isSettingsActive}
            onClick={() => handleRouteNavigation('/dashboard/settings')}
            pending={pendingTarget === 'route:/dashboard/settings'}
            disabled={isSidebarLocked}
          />
          <SidebarItem
            icon={LogOut}
            label={t.sidebar.logout}
            onClick={handleLogout}
            pending={isLogoutPending}
            disabled={isSidebarLocked}
          />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main
        className={`min-w-0 flex-1 overflow-y-auto scroll-smooth ${
          isAnyAdminRoute
            ? 'p-2 sm:p-4'
            : isPracticeRoute
              ? 'px-3 py-3 sm:px-4 sm:py-4 desktop:px-6 desktop:py-4'
              : 'p-4 sm:p-6'
        } ${normalizedCurrentView === 'dashboard' ? 'snap-y snap-mandatory' : ''}`}
      >
        <TrialBanner
          subscriptionTier={subscriptionTier || null}
          subscriptionEnd={subscriptionEnd || null}
        />

        {/* Top Header Bar */}
        {isPracticeRoute ? (
          <div className="mb-2 flex items-center justify-between desktop:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
                className="rounded-xl border border-borderTone bg-surface p-2.5 text-text-secondary shadow-surface transition-all hover:text-primary dark:border-borderTone dark:bg-surface-subtle dark:text-text-secondary dark:shadow-none"
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
              isAnyAdminRoute
                ? 'mb-2 flex desktop:mb-3'
                : 'mb-2 flex items-center'
            }
          >
            <div className="flex items-center gap-4">
              {/* Mobile Menu Trigger */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-xl border border-borderTone bg-surface p-2.5 text-text-secondary shadow-surface transition-all hover:text-primary dark:border-borderTone dark:bg-surface-subtle dark:text-text-secondary dark:shadow-none desktop:hidden"
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
