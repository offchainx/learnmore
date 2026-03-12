import { redirect } from 'next/navigation'
import { getProfile } from '@/actions/user/profile'
import { AdminClientWrapper } from '@/components/admin/common'
import AdminDashboardV2 from '@/components/admin/dashboard/v2/AdminDashboardV2'
import type {
  AdminDashboardRole,
  AdminDashboardWindow,
} from '@/types/admin-dashboard'
import { getAdminDashboardOverview } from '@/actions/admin/dashboard-overview'

export const dynamic = 'force-dynamic'

function normalizeDashboardWindow(raw?: string | null): AdminDashboardWindow {
  if (raw === 'TODAY' || raw === 'WEEK' || raw === 'MONTH') return raw
  return 'TODAY'
}

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function AdminDashboardPage({ searchParams }: PageProps) {
  const profile = await getProfile()

  if (!profile) {
    redirect('/login?redirectTo=/admin')
  }

  if (profile.role !== 'ADMIN' && profile.role !== 'TEACHER') {
    redirect('/dashboard')
  }

  const role = profile.role as AdminDashboardRole

  const resolvedSearchParams = (await searchParams) || {}
  const rawWindowParam = resolvedSearchParams.window
  const rawWindow = Array.isArray(rawWindowParam)
    ? rawWindowParam[0]
    : rawWindowParam
  const initialWindow: AdminDashboardWindow =
    normalizeDashboardWindow(rawWindow)

  const overview = await getAdminDashboardOverview(initialWindow)

  return (
    <AdminClientWrapper user={profile} userRole={profile.role}>
      <AdminDashboardV2
        role={role}
        kpis={overview.kpis}
        workQueue={overview.workQueue}
        risks={overview.risks}
        audits={overview.audits}
        lastUpdated={overview.lastUpdated}
        initialWindow={overview.window}
        initialState="SUCCESS"
      />
    </AdminClientWrapper>
  )
}
