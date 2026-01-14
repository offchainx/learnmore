import { Metadata } from 'next'
import { getProfile } from '@/actions/profile'
import { redirect } from 'next/navigation'
import { CoursesClientWrapper } from './client-wrapper'

export const metadata: Metadata = {
  title: 'My Courses - LearnMore',
  description: 'Browse and learn from your courses.',
}

export default async function CoursesPage() {
  const profile = await getProfile()

  if (!profile) {
    redirect('/login')
  }

  return <CoursesClientWrapper />
}
