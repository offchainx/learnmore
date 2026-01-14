import { Metadata } from 'next'
import { getProfile } from '@/actions/profile'
import { redirect } from 'next/navigation'
import { AchievementsClientWrapper } from './client-wrapper'

export const metadata: Metadata = {
  title: 'Achievements - LearnMore',
  description: 'View your badges, stats, and learning achievements.',
}

export default async function AchievementsPage() {
  const profile = await getProfile()

  if (!profile) {
    redirect('/login')
  }

  return <AchievementsClientWrapper />
}
