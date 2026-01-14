import { getProfile } from '@/actions/profile'
import { redirect } from 'next/navigation'
import { SettingsClientWrapper } from './client-wrapper'

export default async function SettingsPage() {
  const profile = await getProfile()

  if (!profile) {
    redirect('/login')
  }

  return <SettingsClientWrapper user={profile} />
}
