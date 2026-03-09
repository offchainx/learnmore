import { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ContentStatus } from '@prisma/client'
import { getCurrentUser } from '@/actions/user/auth'
import prisma from '@/lib/prisma'
import { QuizView } from '@/components/business/quiz/QuizView'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Past Year Paper | LearnMore',
  description: 'Practice real past-year papers from published questions',
}

interface PageProps {
  params: Promise<{
    paperId: string
  }>
}

export default async function PastPaperPage({ params }: PageProps) {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  const { paperId } = await params

  const questions = await prisma.question.findMany({
    where: {
      paperId,
      isPastPaper: true,
      status: ContentStatus.PUBLISHED,
    },
    orderBy: { createdAt: 'asc' },
  })

  if (questions.length === 0) {
    redirect('/dashboard/practice')
  }

  const chapterId = questions.find((question) => question.chapterId)?.chapterId
  const subjectId = questions.find((q) => q.subjectId)?.subjectId
  const subject = subjectId
    ? await prisma.subject.findUnique({ where: { id: subjectId }, select: { name: true } })
    : null
  const subjectName = subject?.name || 'Subject'
  const paperTitle = questions[0].source || `Past Paper ${paperId}`

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{paperTitle}</h1>
        <p className="text-muted-foreground mt-2">
          {subjectName}
          {` • ${questions.length} Questions`}
        </p>
      </div>

      {questions.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-6 bg-slate-50 dark:bg-slate-900 space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">This past paper has no available questions yet.</p>
          <Button asChild variant="outline">
            <Link href="/dashboard/practice">Back to Practice Center</Link>
          </Button>
        </div>
      ) : (
        <QuizView chapterId={chapterId || undefined} questions={questions} />
      )}
    </div>
  )
}
