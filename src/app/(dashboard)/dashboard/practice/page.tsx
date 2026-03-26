import { Metadata } from 'next'
import { getDashboardShellProfile } from '@/actions/user/profile'
import { redirect } from 'next/navigation'
import { PracticeClientWrapper } from './client-wrapper'

export const metadata: Metadata = {
  title: 'Practice - LearnMore',
  description: 'Practice questions and exercises.',
}

interface PracticePageProps {
  searchParams: Promise<{
    subjectId?: string
  }>
}

export default async function PracticePage({ searchParams }: PracticePageProps) {
  const profile = await getDashboardShellProfile()

  if (!profile) {
    redirect('/login')
  }

  const resolvedSearchParams = await searchParams

  return (
    <PracticeClientWrapper
      user={profile}
      initialSubjectId={resolvedSearchParams.subjectId}
    />
  )
}
