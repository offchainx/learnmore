import { DashboardRouteLoading } from '@/components/loading/dashboard-route-loading'

export default function AdminLoading() {
  return (
    <DashboardRouteLoading
      currentView="admin"
      variant="admin"
      userRole="ADMIN"
    />
  )
}
