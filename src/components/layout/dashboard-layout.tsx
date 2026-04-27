'use client'

import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  BookOpen,
  LayoutDashboard,
  PenTool,
  MessageCircle,
  MessageSquare,
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
  Search,
  Clock3,
  Flame,
  ArrowRight,
} from 'lucide-react'
import { useApp } from '@/providers'
import { logoutAction } from '@/actions/user/auth'
import { TrialBanner } from './TrialBanner'
import { NotificationBell } from '../notification/NotificationBell'
import { calculateLevel, calculateNextLevelXp } from '@/lib/gamification'
import { usePendingNavigation, useRoutePrefetch } from '@/lib/hooks'
import {
  pagePanelClass,
  pageInsetClass,
  pageSoftInsetClass,
  pageShellFrameClass,
  pageSegmentedControlCompactClass,
} from '@/components/shared/pageSurfaces'
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
  <div className="pl-4 pr-2 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-text-tertiary dark:text-text-tertiary">
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
  user?: {
    username?: string | null
    email: string
    avatar?: string | null
  }
  userRole?: string
  userXp?: number | null
  subscriptionTier?: string | null
  subscriptionEnd?: Date | string | null
  lockShellScroll?: boolean
}

interface DashboardHeaderBarProps {
  copy: (zh: string, en: string, ms?: string) => string
  displayName: string
  avatarFallback: string
  tierLabel: string
  avatarUrl?: string | null
  welcomeSubline: string
  onOpenMessages: () => void
  onOpenSettings: () => void
}

const DashboardHeaderBar = ({
  copy,
  displayName,
  avatarFallback,
  tierLabel,
  avatarUrl,
  welcomeSubline,
  onOpenMessages,
  onOpenSettings,
}: DashboardHeaderBarProps) => (
  <div className={`${pagePanelClass} flex min-h-0 flex-col gap-4 px-5 py-4 lg:px-6 lg:py-4`}>
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 text-[22px] font-semibold tracking-tight text-text-primary sm:text-[24px]">
        <span>{copy('欢迎回来，', 'Welcome back,')}</span>
        <span className="truncate">{displayName}</span>
        <span aria-hidden="true">👋</span>
      </div>
      <div className="mt-1 text-sm text-text-secondary">
        {welcomeSubline}
      </div>
    </div>

    <div className="flex min-w-0 flex-wrap items-center gap-2 lg:ml-auto lg:flex-nowrap lg:justify-end">
      <div className="relative hidden min-w-[280px] xl:block xl:w-[320px] 2xl:w-[360px]">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
        <Input
          readOnly
          value=""
          placeholder={copy('搜索课程、任务、成员', 'Search courses, tasks, people')}
          className="h-11 rounded-full border-borderTone bg-surface pl-11 text-sm shadow-none dark:border-borderTone dark:bg-surface-subtle"
        />
      </div>

      <button
        type="button"
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-borderTone bg-surface text-text-secondary shadow-surface transition-colors hover:border-[hsl(var(--border-strong))] hover:text-primary dark:border-borderTone dark:bg-surface-subtle dark:text-text-secondary dark:shadow-none dark:hover:text-white"
        onClick={onOpenMessages}
        aria-label={copy('消息', 'Messages')}
      >
        <MessageSquare className="h-4.5 w-4.5" />
      </button>

      <div className="h-11 w-11">
        <NotificationBell />
      </div>

      <button
        type="button"
        onClick={onOpenSettings}
        className="flex h-11 items-center gap-2 rounded-full border border-borderTone bg-surface px-2 pr-3 text-left shadow-surface transition-colors hover:border-[hsl(var(--border-strong))] hover:bg-surface-subtle dark:border-borderTone dark:bg-surface-subtle dark:shadow-none dark:hover:bg-surface-selected"
      >
        <Avatar className="h-8 w-8 rounded-full border border-borderTone">
          <AvatarImage src={avatarUrl || undefined} alt={displayName} />
          <AvatarFallback className="rounded-full bg-surface-subtle text-[11px] font-semibold text-text-secondary dark:bg-surface-subtle dark:text-text-secondary">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
        <div className="hidden min-w-0 flex-col text-left lg:flex">
          <span className="truncate text-[12px] font-semibold text-text-primary">
            {displayName}
          </span>
          <span className="truncate text-[10px] text-text-tertiary">
            {tierLabel}
          </span>
        </div>
      </button>
    </div>
  </div>
)

interface DashboardRightRailProps {
  copy: (zh: string, en: string, ms?: string) => string
  displayName: string
  avatarFallback: string
  tierLabel: string
  avatarUrl?: string | null
  userEmail: string
  userRole?: string
  subscriptionLabel: string | null
  resolvedLevel: number
  resolvedXp: number
  resolvedNextLevelXp: number
  levelProgress: number
  onOpenPractice: () => void
  onOpenCommunity: () => void
  onOpenSettings: () => void
}

const DashboardRightRail = ({
  copy,
  displayName,
  avatarFallback,
  tierLabel,
  avatarUrl,
  userEmail,
  userRole,
  subscriptionLabel,
  resolvedLevel,
  resolvedXp,
  resolvedNextLevelXp,
  levelProgress,
  onOpenPractice,
  onOpenCommunity,
  onOpenSettings,
}: DashboardRightRailProps) => (
  <div className="grid min-h-0 grid-rows-[auto_auto_auto] gap-4">
    <div className={`${pagePanelClass} min-h-0 overflow-hidden p-4`}>
      <div className="flex items-start gap-4">
        <Avatar className="h-14 w-14 rounded-2xl border border-borderTone">
          <AvatarImage src={avatarUrl || undefined} alt={displayName} />
          <AvatarFallback className="rounded-2xl bg-surface-subtle text-sm font-semibold text-text-secondary dark:bg-surface-subtle dark:text-text-secondary">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-tertiary">
            {copy('用户概览', 'User Overview')}
          </div>
          <div className="mt-1 truncate text-[18px] font-semibold tracking-tight text-text-primary">
            {displayName}
          </div>
          <div className="mt-1 truncate text-[12px] text-text-secondary">
            {userEmail}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className={pageInsetClass + ' px-3 py-3'}>
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-tertiary">
            {copy('身份', 'Role')}
          </div>
          <div className="mt-1 text-[14px] font-semibold text-text-primary">
            {userRole || 'STUDENT'}
          </div>
        </div>
        <div className={pageInsetClass + ' px-3 py-3'}>
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-tertiary">
            {copy('套餐', 'Plan')}
          </div>
          <div className="mt-1 text-[14px] font-semibold text-text-primary">
            {tierLabel}
          </div>
        </div>
      </div>
    </div>

    <div className={`${pagePanelClass} min-h-0 overflow-hidden p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-tertiary">
            {copy('学习状态', 'Study Status')}
          </div>
          <div className="mt-1 text-[18px] font-semibold tracking-tight text-text-primary">
            {copy('当前进度', 'Current Progress')}
          </div>
        </div>
        <div className="rounded-full border border-borderTone bg-surface-subtle px-3 py-1 text-[11px] font-semibold text-text-secondary">
          {resolvedLevel}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className={pageSoftInsetClass + ' px-3 py-3'}>
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-tertiary">
            XP
          </div>
          <div className="mt-1 text-[18px] font-semibold tracking-tight text-text-primary">
            {resolvedXp.toLocaleString()}
          </div>
        </div>
        <div className={pageSoftInsetClass + ' px-3 py-3'}>
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-tertiary">
            {copy('距离升级', 'To Next')}
          </div>
          <div className="mt-1 text-[18px] font-semibold tracking-tight text-text-primary">
            {resolvedNextLevelXp.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-[11px] text-text-secondary">
          <span>{copy('等级进度', 'Level Progress')}</span>
          <span>{levelProgress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-surface-subtle">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${Math.max(4, levelProgress)}%` }}
          />
        </div>
      </div>
    </div>

    <div className={`${pagePanelClass} min-h-0 overflow-hidden p-4`}>
      <div className="flex items-center gap-2">
        <Flame className="h-4 w-4 text-primary" />
        <div className="text-[15px] font-semibold text-text-primary">
          {copy('账户提醒', 'Account Notes')}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className={pageInsetClass + ' px-3 py-3'}>
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-tertiary">
            {copy('订阅状态', 'Subscription')}
          </div>
          <div className="mt-1 text-[14px] font-semibold text-text-primary">
            {tierLabel}
          </div>
          <div className="mt-1 text-[12px] text-text-secondary">
            {subscriptionLabel
              ? copy(`到期 ${subscriptionLabel}`, `Ends ${subscriptionLabel}`)
              : copy('未设置到期时间', 'No end date')}
          </div>
        </div>

        <div className={pageInsetClass + ' px-3 py-3'}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-tertiary">
                {copy('快捷操作', 'Quick Actions')}
              </div>
              <div className="mt-1 text-[14px] font-semibold text-text-primary">
                {copy('前往常用页面', 'Go to common pages')}
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-text-tertiary" />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="rounded-full" onClick={onOpenPractice}>
              {copy('练习', 'Practice')}
            </Button>
            <Button variant="outline" size="sm" className="rounded-full" onClick={onOpenCommunity}>
              {copy('社区', 'Community')}
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full rounded-full"
            onClick={onOpenSettings}
          >
            {copy('设置', 'Settings')}
          </Button>
        </div>
      </div>
    </div>
  </div>
)

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  currentView,
  onNavigate,
  user,
  userRole,
  userXp,
  subscriptionTier,
  subscriptionEnd,
  lockShellScroll = false,
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
  const displayName =
    user?.username?.trim() ||
    user?.email?.split('@')[0]?.trim() ||
    'User'
  const avatarFallback = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
    .slice(0, 2) || 'U'
  const subscriptionLabel = subscriptionEnd
    ? new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : 'en-US', {
        month: 'short',
        day: 'numeric',
      }).format(new Date(subscriptionEnd))
    : null
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
  const showDashboardChrome = normalizedCurrentView === 'dashboard'
  const showDashboardRail = showDashboardChrome
  const showDashboardHeader = showDashboardChrome

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
    <div
      className={`dashboard-shell grid min-w-0 grid-cols-1 bg-page font-sans text-text-primary transition-colors duration-300 dark:bg-page dark:text-white ${
        lockShellScroll
          ? 'h-[calc(100dvh-3.5rem)] overflow-hidden overscroll-none tablet:h-dvh desktop:grid-cols-[minmax(240px,15%)_minmax(0,60%)_minmax(320px,25%)] desktop:grid-rows-[auto_auto] desktop:content-start desktop:items-start'
          : 'min-h-[calc(100dvh-3.5rem)] overflow-visible overscroll-auto desktop:grid-cols-[minmax(240px,15%)_minmax(0,1fr)] desktop:grid-rows-[auto]'
      }`}
    >
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm desktop:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`dashboard-sidebar-shell fixed left-0 top-0 z-50 flex h-full w-72 shrink-0 transform flex-col border-r border-borderTone/70 bg-page-elevated/95 backdrop-blur-xl transition-transform duration-300 ease-out desktop:static desktop:col-start-1 desktop:${showDashboardChrome ? 'row-span-2' : 'row-span-1'} desktop:flex desktop:w-auto desktop:translate-x-0 desktop:shadow-none dark:border-borderTone/70 dark:bg-page-elevated/95 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} `}
      >
        <div className="flex h-20 flex-shrink-0 items-center border-b border-borderTone/70 px-7 dark:border-borderTone/70">
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

      {showDashboardHeader ? (
        <div className="desktop:col-start-2 desktop:col-span-2 desktop:row-start-1 desktop:row-span-1">
          <div className="px-3 pt-3 sm:px-4 sm:pt-4">
            <DashboardHeaderBar
              copy={copy}
              displayName={displayName}
              avatarFallback={avatarFallback}
              tierLabel={tierLabel}
              avatarUrl={user?.avatar}
              welcomeSubline={copy(
                '继续从这里推进今天的学习节奏。',
                'Keep the learning momentum going from here.'
              )}
              onOpenMessages={() => handleRouteNavigation('/dashboard/community')}
              onOpenSettings={() => handleRouteNavigation('/dashboard/settings')}
            />
          </div>
        </div>
      ) : null}

      {/* Main Content Area */}
      <main
        className={`min-w-0 flex min-h-0 flex-col ${
          lockShellScroll ? 'h-auto overflow-hidden' : 'h-auto overflow-visible'
        } ${
          isAnyAdminRoute
            ? 'p-2 sm:p-4'
            : isPracticeRoute
              ? 'px-3 py-3 sm:px-4 sm:py-4 desktop:px-6 desktop:py-4'
              : 'px-3 py-3 sm:px-4 sm:py-4 desktop:px-4 desktop:py-4'
        } ${normalizedCurrentView === 'dashboard' ? 'snap-y snap-mandatory' : ''} desktop:col-start-2 desktop:self-start ${showDashboardHeader ? 'desktop:row-start-2' : 'desktop:row-start-1'}`}
      >
        <TrialBanner
          subscriptionTier={subscriptionTier || null}
          subscriptionEnd={subscriptionEnd || null}
        />

        <div className="mt-4 min-h-0 w-full self-start">
          {children}
        </div>
      </main>

      {showDashboardRail ? (
        <aside className="hidden min-h-0 p-3 pt-4 desktop:col-start-3 desktop:row-start-2 desktop:block desktop:self-start desktop:p-4">
          <DashboardRightRail
            copy={copy}
            displayName={displayName}
            avatarFallback={avatarFallback}
            tierLabel={tierLabel}
            avatarUrl={user?.avatar}
            userEmail={user?.email || copy('未设置邮箱', 'No email')}
            userRole={userRole}
            subscriptionLabel={subscriptionLabel}
            resolvedLevel={resolvedLevel}
            resolvedXp={resolvedXp}
            resolvedNextLevelXp={resolvedNextLevelXp}
            levelProgress={levelProgress}
            onOpenPractice={() => handleViewNavigation('practice')}
            onOpenCommunity={() => handleViewNavigation('community')}
            onOpenSettings={() => handleViewNavigation('settings')}
          />
        </aside>
      ) : null}
    </div>
  )
}
