import { notFound, redirect } from 'next/navigation'
import { getQuestionForReview } from '@/actions/content-pipeline/review-service'
import { QuestionReviewClient } from './QuestionReviewClient'
import { AdminClientWrapper } from "@/components/admin/AdminClientWrapper"
import { getProfile } from "@/actions/profile"

interface PageProps {
  params: Promise<{ questionId: string }>
}

/**
 * 题目审核详情页（Server Component）
 */
export default async function QuestionReviewPage({ params }: PageProps) {
  const profile = await getProfile()
  if (!profile) {
    redirect('/login')
  }

  const { questionId } = await params
  const question = await getQuestionForReview(questionId)

  if (!question) {
    notFound()
  }

  return (
    <AdminClientWrapper userRole={profile.role}>
      <QuestionReviewClient question={question} />
    </AdminClientWrapper>
  )
}
