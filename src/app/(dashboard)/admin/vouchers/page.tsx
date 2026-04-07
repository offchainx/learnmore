import { redirect } from 'next/navigation'
import { getProfile } from '@/actions/user/profile'
import { resolveGrowthConsoleRoute } from '@/lib/admin/growth-console'

export default async function AdminVouchersPage() {
  const profile = await getProfile()

  if (!profile) {
    redirect('/login')
  }

  if (profile.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  redirect(resolveGrowthConsoleRoute({ role: profile.role, tab: 'vouchers' }))
}
