import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/actions/user/auth'
import { getAllSubjects } from '@/actions/courses/subject'
import { checkWeeklyExamQuota } from '@/actions/practice/quota'
import MockArenaSetup from './MockArenaSelector'

export const metadata: Metadata = {
  title: 'Mock Arena | LearnMore',
  description: 'Simulate real exam conditions with timed practice tests',
}

interface PageProps {
  searchParams: Promise<{
    autostart?: string
  }>
}

export default async function MockArenaPage({ searchParams }: PageProps) {
  const user = await getCurrentUser()
  const resolvedSearchParams = await searchParams
  const autoStart = resolvedSearchParams.autostart === '1'

  if (!user) {
    redirect('/login')
  }

  const [subjectsResult, quotaStatus] = await Promise.all([
    getAllSubjects(),
    checkWeeklyExamQuota(user.id)
  ])

  const subjects = subjectsResult.success ? subjectsResult.data || [] : []

  if (autoStart) {
    return (
      <div className="mx-auto w-full max-w-[1680px] px-3 py-2 sm:px-4 sm:py-4">
        <MockArenaSetup
          userId={user.id}
          subjects={subjects}
          quotaStatus={quotaStatus}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Mock Arena</h1>
        <p className="text-muted-foreground mt-2">
          Simulate real exam conditions with timed practice tests. No instant feedback during the exam.
        </p>
      </div>

      <MockArenaSetup
        userId={user.id} 
        subjects={subjects} 
        quotaStatus={quotaStatus}
      />
    </div>
  )
}
