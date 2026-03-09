import { Metadata } from 'next'
import { getDashboardProfile } from '@/actions/user/profile'
import { redirect } from 'next/navigation'
import { PracticeClientWrapper } from './client-wrapper'

export const metadata: Metadata = {
  title: 'Practice - LearnMore',
  description: 'Practice questions and exercises.',
}

export default async function PracticePage() {
  const profile = await getDashboardProfile()

  if (!profile) {
    redirect('/login')
  }

  return <PracticeClientWrapper user={profile} />
}
