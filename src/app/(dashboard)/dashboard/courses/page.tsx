import { Metadata } from 'next'
import { getDashboardProfile } from '@/actions/user/profile'
import { redirect } from 'next/navigation'
import { CoursesClientWrapper } from './client-wrapper'

export const metadata: Metadata = {
  title: 'Courses - LearnMore',
  description: 'Browse and learn from your courses.',
}

export default async function CoursesPage() {
  const profile = await getDashboardProfile()

  if (!profile) {
    redirect('/login')
  }

  return <CoursesClientWrapper user={profile} />
}
