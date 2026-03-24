import type { LucideIcon } from 'lucide-react'
import {
  BookOpen,
  LayoutDashboard,
  MessageCircle,
  PenTool,
  Settings,
} from 'lucide-react'

export type DashboardView =
  | 'dashboard'
  | 'courses'
  | 'practice'
  | 'community'
  | 'leaderboard'
  | 'achievements'
  | 'settings'
  | 'parent'
  | 'admin'

export interface DashboardNavItem {
  id: DashboardView
  icon: LucideIcon
  path: string
}

const dashboardViewAliases: Record<string, DashboardView> = {
  home: 'dashboard',
  profile: 'settings',
  questionBank: 'practice',
}

export const dashboardViewRoutes: Record<DashboardView, string> = {
  dashboard: '/dashboard',
  courses: '/dashboard/courses',
  practice: '/dashboard/practice',
  community: '/dashboard/community',
  leaderboard: '/dashboard/leaderboard',
  achievements: '/dashboard/achievements',
  settings: '/dashboard/settings',
  parent: '/dashboard',
  admin: '/admin',
}

const dashboardViewMatchers: Record<
  DashboardView,
  (pathname?: string | null) => boolean
> = {
  dashboard: (pathname) => pathname === '/dashboard',
  courses: (pathname) => pathname?.startsWith('/dashboard/courses') ?? false,
  practice: (pathname) => pathname?.startsWith('/dashboard/practice') ?? false,
  community: (pathname) =>
    pathname?.startsWith('/dashboard/community') ?? false,
  leaderboard: (pathname) =>
    pathname?.startsWith('/dashboard/leaderboard') ?? false,
  achievements: (pathname) =>
    pathname?.startsWith('/dashboard/achievements') ?? false,
  settings: (pathname) =>
    pathname?.startsWith('/dashboard/settings') ?? false,
  parent: (pathname) => pathname === '/dashboard',
  admin: (pathname) => pathname?.startsWith('/admin') ?? false,
}

export const studentDashboardNavItems: DashboardNavItem[] = [
  { id: 'dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'courses', icon: BookOpen, path: '/dashboard/courses' },
  { id: 'practice', icon: PenTool, path: '/dashboard/practice' },
  { id: 'community', icon: MessageCircle, path: '/dashboard/community' },
]

export const parentDashboardNavItems: DashboardNavItem[] = [
  { id: 'parent', icon: LayoutDashboard, path: '/dashboard' },
]

export const mobileDashboardNavItems: DashboardNavItem[] = [
  ...studentDashboardNavItems,
  { id: 'settings', icon: Settings, path: '/dashboard/settings' },
]

export function normalizeDashboardView(view: string): DashboardView {
  if (view in dashboardViewAliases) {
    return dashboardViewAliases[view]
  }

  if (view in dashboardViewRoutes) {
    return view as DashboardView
  }

  return 'dashboard'
}

export function getDashboardRoute(view: string): string {
  return dashboardViewRoutes[normalizeDashboardView(view)]
}

export function isDashboardViewActive(
  view: DashboardView,
  pathname?: string | null,
  currentView?: string
): boolean {
  if (currentView && normalizeDashboardView(currentView) === view) {
    return true
  }

  return dashboardViewMatchers[view](pathname)
}
