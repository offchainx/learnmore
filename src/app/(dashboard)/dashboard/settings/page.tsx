import { getDashboardProfile } from '@/actions/user/profile'
import { redirect } from 'next/navigation'
import { SettingsClientWrapper } from './client-wrapper'

export default async function SettingsPage() {
  const profile = await getDashboardProfile()

  if (!profile) {
    redirect('/login')
  }

  return <SettingsClientWrapper user={profile} userRole={profile.role} />
}
