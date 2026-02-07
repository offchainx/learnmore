import { getProfile } from '@/actions/user/profile'
import { redirect } from 'next/navigation'
import { NotificationSettingsClient } from './client-wrapper'

export default async function NotificationSettingsPage() {
  const profile = await getProfile()

  if (!profile) {
    redirect('/login')
  }

  return <NotificationSettingsClient user={profile} userRole={profile.role} />
}
