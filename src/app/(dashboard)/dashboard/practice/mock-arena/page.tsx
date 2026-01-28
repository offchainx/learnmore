import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/actions/auth'
import { getAllSubjects } from '@/actions/subject'
import { checkWeeklyExamQuota } from '@/actions/practice/quota'
import MockArenaSelector from './MockArenaSelector'

export const metadata: Metadata = {
  title: 'Mock Arena | LearnMore',
  description: 'Simulate real exam conditions with timed practice tests',
}

export default async function MockArenaPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const [subjectsResult, quotaStatus] = await Promise.all([
    getAllSubjects(),
    checkWeeklyExamQuota(user.id)
  ])

  const subjects = subjectsResult.success ? subjectsResult.data || [] : []

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Mock Arena</h1>
        <p className="text-muted-foreground mt-2">
          Simulate real exam conditions with timed practice tests. No instant feedback during the exam.
        </p>
      </div>

      <MockArenaSelector 
        userId={user.id} 
        subjects={subjects} 
        quotaStatus={quotaStatus}
      />
    </div>
  )
}
