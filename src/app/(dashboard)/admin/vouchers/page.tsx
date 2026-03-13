import { redirect } from 'next/navigation'
import { getProfile } from '@/actions/user/profile'

export default async function AdminVouchersPage() {
  const profile = await getProfile()

  if (!profile) {
    redirect('/login')
  }

  if (profile.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  redirect('/admin/referrals?tab=vouchers')
}
