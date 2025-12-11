import { redirect } from 'next/navigation'
import { getProfile } from '@/actions/profile'
import { ProfileForm } from '@/components/business/settings/ProfileForm'
import { BadgeGrid } from '@/components/business/settings/BadgeGrid'

export const metadata = {
  title: 'Profile Settings | LearnMore',
  description: 'Manage your profile settings and view your achievements.',
}

export default async function SettingsPage() {
  const profile = await getProfile()

  if (!profile) {
    redirect('/login')
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <ProfileForm user={{
            id: profile.id,
            username: profile.username,
            email: profile.email,
            grade: profile.grade,
            avatar: profile.avatar
          }} />
        </div>
        <div className="col-span-3">
          <BadgeGrid badges={profile.badges.map(b => ({
            ...b,
            awardedAt: b.awardedAt.toISOString()
          }))} /> 
        </div>
      </div>
    </div>
  )
}
