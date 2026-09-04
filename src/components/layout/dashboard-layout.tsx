'use client'

import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  LayoutDashboard,
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
        ? 'dark:bg-[hsl(var(--state-info-bg))]/16 border border-borderTone bg-[hsl(var(--state-info-bg))]/70 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] dark:border-borderTone dark:text-text-primary dark:shadow-none'
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
  <div className="pb-1 pl-4 pr-2 pt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-text-tertiary dark:text-text-tertiary">
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
          ? 'dark:bg-[hsl(var(--state-info-bg))]/16 border border-borderTone bg-[hsl(var(--state-info-bg))]/70 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] dark:border-borderTone dark:text-text-primary dark:shadow-none'
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
    id?: string | null
    username?: string | null
    email?: string | null
    avatar?: string | null
    handle?: string | null
  }
  userRole?: string
  userXp?: number | null
  subscriptionTier?: string | null
  subscriptionEnd?: Date | string | null
}

interface DashboardTopBarProps {
  copy: (zh: string, en: string, ms?: string) => string
  title: string
  subtitle: string
  displayName: string
  avatarFallback: string
  avatarUrl?: string | null
  onOpenMessages: () => void
  onOpenSettings: () => void
}

function BrandMark() {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,#ffb36a_0%,#ef7d35_100%)] shadow-[0_14px_28px_rgba(239,125,53,0.24)]">
      <svg
        viewBox="0 0 32 32"
        aria-hidden="true"
        className="h-6 w-6 text-white"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8.5 10.5h6.5a3 3 0 0 1 3 3v8H11a2.5 2.5 0 0 1-2.5-2.5z" />
        <path d="M23.5 10.5H17a3 3 0 0 0-3 3v8h7a2.5 2.5 0 0 0 2.5-2.5z" />
        <path d="M16 10.5v11" />
      </svg>
    </div>
  )
}

const DashboardTopBar = ({
  copy,
  title,
  subtitle,
  displayName,
  avatarFallback,
  avatarUrl,
  onOpenMessages,
  onOpenSettings,
}: DashboardTopBarProps) => (
  <div className="sticky top-0 z-30 border-b border-borderTone/70 bg-[hsl(var(--page-bg))/0.92] backdrop-blur-xl dark:border-borderTone/70 dark:bg-[hsl(var(--page-bg))/0.9]">
    <div className="flex min-h-[72px] items-center gap-4 px-3 py-3 sm:px-4 tablet:px-5 desktop:px-6">
      <div className="min-w-0 flex-1">
        <div className="truncate text-[22px] font-semibold tracking-tight text-text-primary sm:text-[24px]">
          {title}
        </div>
        {subtitle ? (
          <div className="mt-1 truncate text-[13px] text-text-secondary">
            {subtitle}
          </div>
        ) : null}
      </div>

      <div className="flex min-w-0 items-center gap-2">
        <div className="hidden min-w-[240px] items-center gap-2 rounded-full border border-borderTone bg-surface px-4 py-2 shadow-surface desktop:flex">
          <Search className="h-4 w-4 shrink-0 text-text-tertiary" />
          <Input
            readOnly
            aria-label={copy('搜索', 'Search')}
            placeholder={copy('搜索', 'Search')}
            className="h-auto border-0 bg-transparent p-0 text-[13px] text-text-primary shadow-none placeholder:text-text-tertiary focus-visible:ring-0 focus-visible:ring-offset-0"
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

        <NotificationBell />

        <button
          type="button"
          onClick={onOpenSettings}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-borderTone bg-surface text-left shadow-surface transition-colors hover:border-[hsl(var(--border-strong))] hover:bg-surface-subtle dark:border-borderTone dark:bg-surface-subtle dark:shadow-none dark:hover:bg-surface-selected"
        >
          <Avatar className="h-8 w-8 rounded-full border border-borderTone">
            <AvatarImage src={avatarUrl || undefined} alt={displayName} />
            <AvatarFallback className="rounded-full bg-surface-subtle text-[11px] font-semibold text-text-secondary dark:bg-surface-subtle dark:text-text-secondary">
              {avatarFallback}
            </AvatarFallback>
          </Avatar>
        </button>
      </div>
    </div>
  </div>
)

function getTopBarTitle(
  pathname: string | null | undefined,
  currentView: DashboardView,
  copy: (zh: string, en: string, ms?: string) => string
) {
  if (!pathname) {
    return currentView === 'parent'
      ? copy('家长仪表盘', 'Parent Dashboard')
      : copy('仪表盘', 'Dashboard')
  }

  if (pathname.startsWith('/admin/users')) {
    return copy('用户管理', 'User Management')
  }
  if (pathname.startsWith('/admin/feedback')) {
    return copy('反馈管理', 'Feedback')
  }
  if (pathname.startsWith('/admin/referrals')) {
    return copy('推荐管理', 'Referrals')
  }
  if (pathname.startsWith('/admin/rewards')) {
    return copy('奖励中心', 'Rewards Center')
  }
  if (pathname.startsWith('/admin/content/import')) {
    return copy('内容导入', 'Content Import')
  }
  if (pathname.startsWith('/admin/content/review')) {
    return copy('内容审核', 'Content Review')
  }
  if (pathname.startsWith('/admin/content/reports')) {
    return copy('内容报告', 'Content Reports')
  }
  if (pathname.startsWith('/admin/content/statistics')) {
    return copy('内容统计', 'Content Statistics')
  }
  if (pathname.startsWith('/admin/content')) {
    return copy('内容管理', 'Content Management')
  }
  if (pathname.startsWith('/admin')) {
    return copy('管理仪表盘', 'Admin Dashboard')
  }
  if (pathname.startsWith('/dashboard/community/new')) {
    return copy('发布帖子', 'New Post')
  }
  if (/^\/dashboard\/community\/[^/]+/.test(pathname)) {
    return copy('帖子详情', 'Post Detail')
  }
  if (pathname.startsWith('/dashboard/community')) {
    return copy('学员社区', 'Community')
  }
  if (pathname.startsWith('/dashboard/courses')) {
    return copy('课程学习', 'Courses')
  }
  if (pathname.startsWith('/dashboard/practice/mock-arena')) {
    return copy('模考训练', 'Mock Arena')
  }
  if (pathname.startsWith('/dashboard/practice/smart-drill')) {
    return copy('智能练习', 'Smart Drill')
  }
  if (pathname.startsWith('/dashboard/practice/error-wiper')) {
    return copy('错题清除', 'Error Wiper')
  }
  if (pathname.startsWith('/dashboard/practice/chapter-drill')) {
    return copy('章节训练', 'Chapter Drill')
  }
  if (pathname.startsWith('/dashboard/practice/past-paper')) {
    return copy('历年真题', 'Past Paper')
  }
  if (pathname.startsWith('/dashboard/practice/import')) {
    return copy('导入练习', 'Import Practice')
  }
  if (pathname.startsWith('/dashboard/practice')) {
    return copy('练习中心', 'Practice Center')
  }
  if (pathname.startsWith('/dashboard/settings')) {
    return copy('设置', 'Settings')
  }
  if (pathname.startsWith('/dashboard/leaderboard')) {
    return copy('排行榜', 'Leaderboard')
  }
  if (pathname.startsWith('/dashboard/achievements')) {
    return copy('成就中心', 'Achievements')
  }
  if (currentView === 'parent') {
    return copy('家长仪表盘', 'Parent Dashboard')
  }

  return copy('仪表盘', 'Dashboard')
}

function getTopBarSubtitle(
  pathname: string | null | undefined,
  currentView: DashboardView,
  displayName: string,
  copy: (zh: string, en: string, ms?: string) => string
) {
  if (!pathname) {
    return currentView === 'parent'
      ? copy(
          `欢迎回来，${displayName}，继续查看孩子的学习进度。`,
          `Welcome back, ${displayName}. Continue tracking your child's progress.`
        )
      : copy(`欢迎回来！${displayName}`, `Welcome back, ${displayName}.`)
  }

  if (pathname === '/dashboard') {
    return copy(`欢迎回来！${displayName}`, `Welcome back, ${displayName}.`)
  }
  if (pathname.startsWith('/dashboard/courses')) {
    return copy(
      '继续你的课程推进，回到当前科目或复习上次停下的位置。',
      'Continue learning from where you left off in your current course.'
    )
  }
  if (pathname.startsWith('/dashboard/practice')) {
    return ''
  }
  if (pathname.startsWith('/dashboard/community')) {
    return copy(
      '看看同学们在讨论什么，或者把你的问题直接发出来。',
      'See what others are discussing, or post your own question.'
    )
  }
  if (pathname.startsWith('/dashboard/settings')) {
    return copy(
      '管理个人资料、通知偏好和学习习惯设置。',
      'Manage your profile, notification preferences, and study settings.'
    )
  }
  if (pathname.startsWith('/dashboard/leaderboard')) {
    return copy(
      '查看你和同年级同学的相对表现变化。',
      'Track how you compare with other students in your grade.'
    )
  }
  if (pathname.startsWith('/dashboard/achievements')) {
    return copy(
      '回顾已解锁的徽章与阶段性进步。',
      'Review unlocked badges and milestone progress.'
    )
  }
  if (pathname.startsWith('/admin')) {
    return copy(
      '集中处理内容、用户和运营相关的后台事务。',
      'Handle content, user, and operations tasks from one place.'
    )
  }
  if (currentView === 'parent') {
    return copy(
      `欢迎回来，${displayName}，继续查看孩子的学习进度。`,
      `Welcome back, ${displayName}. Continue tracking your child's progress.`
    )
  }

  return copy(
    '继续今天的学习节奏，从这里直接进入下一步。',
    'Continue today’s learning flow from here.'
  )
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  currentView,
  onNavigate,
  user,
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
  const [isContentAdminExpanded, setIsContentAdminExpanded] =
    React.useState(false)
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
    user?.username?.trim() || user?.email?.split('@')[0]?.trim() || 'User'
  const avatarFallback =
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('')
      .slice(0, 2) || 'U'
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
  const topBarTitle = getTopBarTitle(pathname, normalizedCurrentView, copy)
  const topBarSubtitle = getTopBarSubtitle(
    pathname,
    normalizedCurrentView,
    displayName,
    copy
  )

  const menuItems = (
    isParent ? parentDashboardNavItems : studentDashboardNavItems
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
    <div className="dashboard-shell grid min-h-[100dvh] min-w-0 grid-cols-1 overflow-x-hidden overflow-y-visible overscroll-auto bg-page font-sans text-text-primary transition-colors duration-300 dark:bg-page dark:text-white desktop:h-[100dvh] desktop:grid-cols-[16rem_minmax(0,1fr)] desktop:overflow-hidden desktop:overscroll-none">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm desktop:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`dashboard-sidebar-shell fixed left-0 top-0 z-50 flex h-full w-64 shrink-0 transform flex-col border-r border-borderTone/70 bg-page-elevated/95 backdrop-blur-xl transition-transform duration-300 ease-out dark:border-borderTone/70 dark:bg-page-elevated/95 desktop:sticky desktop:top-0 desktop:col-start-1 desktop:flex desktop:h-[100dvh] desktop:w-auto desktop:translate-x-0 desktop:self-stretch desktop:overflow-hidden desktop:shadow-none ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} `}
      >
        <div className="flex h-20 flex-shrink-0 items-center px-7">
          <button
            type="button"
            className="flex cursor-pointer items-center gap-3"
            onClick={() =>
              handleViewNavigation(isParent ? 'parent' : 'dashboard')
            }
            disabled={isSidebarLocked}
          >
            <div className="relative">
              <BrandMark />
              {pendingTarget === `view:${isParent ? 'parent' : 'dashboard'}` ? (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/10">
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                </div>
              ) : null}
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-text-primary dark:text-text-primary">
                Learnbank.ai
              </span>
              <span className="w-fit rounded-full border border-[hsl(var(--border-subtle))] bg-surface-muted px-2.5 py-0.5 text-[10px] font-semibold text-primary dark:border-borderTone dark:bg-surface-subtle dark:text-primary">
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
                  <div className="dark:bg-[hsl(var(--state-info-bg))]/18 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-borderTone bg-[hsl(var(--state-info-bg))] text-[hsl(var(--state-info-fg))] dark:border-borderTone dark:text-primary">
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
        <div className="bg-page-elevated/92 dark:bg-page-elevated/92 z-20 shrink-0 border-t border-borderTone/70 p-4 dark:border-borderTone/70">
          <SectionLabel label={copy('账户', 'Account', 'Akaun')} />
          {!isParent && (
            <button
              type="button"
              onClick={() =>
                handleRouteNavigation(getDashboardRoute('leaderboard'))
              }
              disabled={isSidebarLocked}
              className={`group mb-3 mt-1 w-full cursor-pointer overflow-hidden rounded-xl border p-4 text-left shadow-surface transition-colors ${
                isDashboardViewActive(
                  'leaderboard',
                  pathname,
                  normalizedCurrentView
                )
                  ? 'dark:bg-[hsl(var(--state-info-bg))]/14 border-borderTone bg-[hsl(var(--state-info-bg))]/70 dark:border-borderTone'
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
                  {pendingTarget ===
                  `route:${getDashboardRoute('leaderboard')}` ? (
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

      <div
        className="min-h-0 min-w-0 desktop:col-start-2 desktop:grid desktop:h-full desktop:grid-cols-[minmax(0,1fr)] desktop:grid-rows-[auto_minmax(0,1fr)] desktop:overflow-hidden"
      >
        <div
          className="desktop:row-start-1"
        >
          <DashboardTopBar
            copy={copy}
            title={topBarTitle}
            subtitle={topBarSubtitle}
            displayName={displayName}
            avatarFallback={avatarFallback}
            avatarUrl={user?.avatar}
            onOpenMessages={() => handleRouteNavigation('/dashboard/community')}
            onOpenSettings={() => handleRouteNavigation('/dashboard/settings')}
          />
        </div>

        {/* Main Content Area */}
        <main
          className={`flex h-auto min-h-0 min-w-0 flex-col overflow-x-hidden overflow-y-visible desktop:row-start-2 desktop:overflow-y-auto ${
            isAnyAdminRoute
              ? 'p-2 sm:p-4'
              : isPracticeRoute
                ? 'px-3 py-3 sm:px-4 sm:py-4 tablet:px-5 desktop:px-6 desktop:py-4'
                : 'px-3 py-3 sm:px-4 sm:py-4 tablet:px-5 desktop:px-4 desktop:py-4'
          } ${normalizedCurrentView === 'dashboard' ? 'snap-y snap-mandatory' : ''}`}
        >
          <TrialBanner
            subscriptionTier={subscriptionTier || null}
            subscriptionEnd={subscriptionEnd || null}
          />

          <div className="mt-4 min-h-0 w-full self-start pb-safe-bottom tablet:pb-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
