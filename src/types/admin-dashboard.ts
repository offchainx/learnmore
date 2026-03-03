export type AdminDashboardRole = 'ADMIN' | 'TEACHER'

export type AdminDashboardWindow = 'TODAY' | 'WEEK' | 'MONTH'

export type AdminDashboardLoadState = 'LOADING' | 'ERROR' | 'SUCCESS'

export interface AdminDashboardMetric {
  id: string
  title: string
  value: string
  trend: number
  trendLabel: string
  sparklineData: number[]
  exception?: string
  visibleTo: AdminDashboardRole[]
}

export interface AdminDashboardWorkItem {
  id: string
  title: string
  sla: string
  slaLevel: 'normal' | 'warning' | 'critical'
  type: 'review' | 'feedback'
  href: string
  visibleTo: AdminDashboardRole[]
}

export interface AdminDashboardRiskItem {
  id: string
  title: string
  level: 'low' | 'medium' | 'high' | 'critical'
  time: string
  source: string
  href: string
  visibleTo: AdminDashboardRole[]
}

export interface AdminDashboardAuditItem {
  id: string
  actor: string
  action: string
  target: string
  time: string
  level: 'info' | 'warning' | 'critical'
  visibleTo: AdminDashboardRole[]
}

export type AdminDashboardQuickActionIcon = 'review' | 'users' | 'permissions' | 'feedback' | 'vouchers'

export interface AdminDashboardQuickAction {
  id: string
  label: string
  icon: AdminDashboardQuickActionIcon
  href: string
  visibleTo: AdminDashboardRole[]
}
