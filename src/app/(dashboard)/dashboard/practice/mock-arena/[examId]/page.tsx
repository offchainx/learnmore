import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/actions/user/auth'
import { getEffectiveTier } from '@/lib/permissions/engine'
import MockArenaExam from './MockArenaExam'

export const metadata: Metadata = {
  title: 'Exam in Progress | LearnMore',
  description: 'Mock exam in progress',
}

interface PageProps {
  params: Promise<{
    examId: string
  }>
  searchParams: Promise<{
    subjectId?: string
  }>
}

export default async function MockArenaExamPage({
  params,
  searchParams,
}: PageProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const examId = resolvedParams.examId
  const effectiveTier = getEffectiveTier(user)

  return (
    <MockArenaExam
      examId={examId}
      userId={user.id}
      userTier={effectiveTier}
      subjectId={resolvedSearchParams.subjectId}
    />
  )
}
