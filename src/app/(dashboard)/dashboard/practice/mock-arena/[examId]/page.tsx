import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/actions/auth'
import MockArenaExam from './MockArenaExam'

export const metadata: Metadata = {
  title: 'Exam in Progress | LearnMore',
  description: 'Mock exam in progress',
}

interface PageProps {
  params: Promise<{
    examId: string
  }>
}

export default async function MockArenaExamPage({ params }: PageProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const resolvedParams = await params
  const examId = resolvedParams.examId

  return <MockArenaExam examId={examId} userId={user.id} />
}
